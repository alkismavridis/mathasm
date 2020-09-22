package eu.alkismavridis.mathasm.infrastructure.api.resolvers.write

import eu.alkismavridis.mathasm.infrastructure.api.GraphqlContext
import eu.alkismavridis.mathasm.infrastructure.api.types.SavedTheoremInfo
import eu.alkismavridis.mathasm.entities.error.ErrorCode
import eu.alkismavridis.mathasm.entities.error.MathAsmException
import eu.alkismavridis.mathasm.entities.proof.LogicMove
import eu.alkismavridis.mathasm.entities.proof.ProofExecutor
import eu.alkismavridis.mathasm.entities.proof.TheoremGenerator
import eu.alkismavridis.mathasm.entities.proof.TheoremSaver
import eu.alkismavridis.mathasm.infrastructure.db.entities.LogicMoveEntity
import eu.alkismavridis.mathasm.infrastructure.db.entities.MathAsmDirEntity
import eu.alkismavridis.mathasm.infrastructure.db.entities.MathAsmProof
import eu.alkismavridis.mathasm.infrastructure.db.entities.MathAsmStatementEntity
import eu.alkismavridis.mathasm.infrastructure.services.App
import eu.alkismavridis.mathasm.infrastructure.services.utils.ProofUtils
import graphql.schema.DataFetchingEnvironment
import java.time.Instant
import java.util.function.Function

class StatementWSector(private val app: App) {
    fun createAxiom(parentId:Long, name:String, left:List<Long>, grade:Short, isBidirectional:Boolean, right:List<Long>, env: DataFetchingEnvironment) : MathAsmStatementEntity {
        //1. Check user permissions
        val requestingUser = env.getContext<GraphqlContext>().user
        if (requestingUser==null) throw MathAsmException(ErrorCode.UNAUTHORIZED, "No session.")
        if (!requestingUser.canCreateAxioms()) throw MathAsmException(ErrorCode.FORBIDDEN, "Not enough rights to create axioms.")

        //2. Check that sentences are not empty
        if (left.isEmpty() || right.isEmpty()) throw MathAsmException(ErrorCode.ILLEGAL_AXIOM, "Sentences of an axiom cannot be empty.")

        //2. Get the parent
        val parent: MathAsmDirEntity? = app.dirRepo.findById(parentId, 0).orElse(null)
        if (parent==null) throw MathAsmException(ErrorCode.DIR_NOT_FOUND, "Object with uid $parentId not found.")


        //3. Check name availability
        val isNameTaken = app.dirRepo.hasChildWithName(parentId, name)
        if (isNameTaken) throw MathAsmException(ErrorCode.NAME_ALREADY_EXISTS, "Name  \"$name\" already exists.")

        //4. Create and persist the axiom
        val newAxiom = MathAsmStatementEntity.createAxiom(name, left.toLongArray(), right.toLongArray(), isBidirectional, grade)
        newAxiom.author = requestingUser
        newAxiom.createdAt = Instant.now()

        parent.add(newAxiom)
        app.dirRepo.save(parent, 2)

        return newAxiom
    }

    fun uploadProof(moves:MutableList<LogicMove>, env: DataFetchingEnvironment) : List<SavedTheoremInfo> {
        //1. Check user permissions
        val requestingUser = env.getContext<GraphqlContext>().user
        if (requestingUser==null) throw MathAsmException(ErrorCode.UNAUTHORIZED, "No session.")
        if (!requestingUser.canCreateTheorems()) throw MathAsmException(ErrorCode.FORBIDDEN, "Not enough rights to create theorems.")

        //2. Create the executor environment
        val theoremList = mutableListOf<SavedTheoremInfo>()
        val proofExecutor = ProofExecutor(
                Function { id -> app.statementRepo.findById(id, 1).orElse(null) },
                TheoremSaver{ statementToSave, parentId, name -> ProofUtils.persistTheorem(theoremList, statementToSave, parentId, name, requestingUser, app) },
                TheoremGenerator { selectedBase, side, b -> MathAsmStatementEntity.createTheoremTemp(selectedBase, side, b) }
        )

        //3. Execute the moves.
        for (move: LogicMove in moves) proofExecutor.executeMove(move)

        //4. Create the proof and save it in DB
        val proof = MathAsmProof(moves.mapIndexed{index,lm -> LogicMoveEntity(lm, index, proofExecutor.getBaseCache()) }.toMutableList())
        app.proofRepo.save(proof, 2)

        //5. Associate all theorems with their proof
        theoremList.forEach { it.theorem.proof = proof }
        app.statementRepo.saveAll(theoremList.map { it.theorem })

        return theoremList
    }

    /**
     * MathAsm filesystem move operation,
     * It moves (and possible simultaneously renames) a statement under a new parent.
     *
     * @param newName Optional If not provided, the statement will not be renamed.
     * @return true on success
     * */
    fun move(statementIdToMove:Long, newParentId:Long, newName:String?, env: DataFetchingEnvironment) : Boolean {
        //1. Check user permissions
        val requestingUser = env.getContext<GraphqlContext>().user
        if (requestingUser==null) throw MathAsmException(ErrorCode.UNAUTHORIZED, "No session.")
        if (!requestingUser.canCreateDirs()) throw MathAsmException(ErrorCode.FORBIDDEN, "Not enough rights to move statements.")


        //2. Get the directory to move and the new carent
        val statementToMove: MathAsmStatementEntity? = app.statementRepo.findById(statementIdToMove, 1).orElse(null)
        if (statementToMove==null) throw MathAsmException(ErrorCode.STATEMENT_NOT_FOUND, "Statement with id $statementIdToMove not found.")

        val parentDir: MathAsmDirEntity? = app.dirRepo.findById(newParentId, 0).orElse(null)
        if (parentDir==null) throw MathAsmException(ErrorCode.DIR_NOT_FOUND, "Parent directory with id $newParentId not found.")


        //3. Check if its name is available
        val nameToUse =
                if(newName==null) statementToMove.name
                else newName

        if(app.dirRepo.hasChildWithName(newParentId, nameToUse)) {
            throw MathAsmException(ErrorCode.NAME_ALREADY_EXISTS, "Directory with id $statementIdToMove already has a file with name $nameToUse.")
        }

        //4. Perform the move
        app.dirRepo.deleteChild(statementToMove.parent!!.id, statementIdToMove) //delete the tie to the old parent.

        statementToMove.name = nameToUse      //move to new parent
        statementToMove.parent = parentDir
        app.statementRepo.save(statementToMove, 1)

        return true
    }
}
