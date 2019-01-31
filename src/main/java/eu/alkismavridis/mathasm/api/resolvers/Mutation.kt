package eu.alkismavridis.mathasm.api.resolvers

import com.coxautodev.graphql.tools.GraphQLMutationResolver
import eu.alkismavridis.mathasm.api.GraphqlContext
import eu.alkismavridis.mathasm.api.controller.security.SecurityService
import eu.alkismavridis.mathasm.api.types.SavedTheoremInfo
import eu.alkismavridis.mathasm.services.App
import eu.alkismavridis.mathasm.core.error.ErrorCode
import eu.alkismavridis.mathasm.core.error.MathAsmException
import eu.alkismavridis.mathasm.core.proof.LogicMove
import eu.alkismavridis.mathasm.core.proof.ProofExecutor
import eu.alkismavridis.mathasm.core.proof.TheoremGenerator
import eu.alkismavridis.mathasm.core.proof.TheoremSaver
import eu.alkismavridis.mathasm.db.entities.*
import eu.alkismavridis.mathasm.services.utils.ProofUtils
import eu.alkismavridis.mathasm.services.utils.SymbolUtils
import graphql.schema.DataFetchingEnvironment
import java.time.Instant

/** The entry point of all Write events for the application. */
class Mutation(private var app: App, private val secService:SecurityService) : GraphQLMutationResolver {

    //region FIELDS
    public val authWSector = AuthWSector(app)
    //endregion



    //region SYMBOL MANAGEMENT
    fun createSymbol(parentId:Long, text:String, uid:Long, env:DataFetchingEnvironment) : MathAsmSymbol {
        //1. Check user permissions
        val requestingUser = env.getContext<GraphqlContext>().user
        if (requestingUser==null) throw MathAsmException(ErrorCode.UNAUTHORIZED, "No session.")
        if (!requestingUser.canCreateSymbols()) throw MathAsmException(ErrorCode.FORBIDDEN, "Not enough rights to create symbols.")

        //2. Sanitize and validate the incoming text
        val textToUse = SymbolUtils.sanitizeSymbolTest(text)

        //3. Check if symbol with the given uid is already registered
        val existingSymbol = app.symbolRepo.findBySymbolIdOrText(uid, textToUse)
        if (existingSymbol!=null) {
            if (existingSymbol.uid == uid) throw MathAsmException(ErrorCode.SYMBOL_UID_ALREADY_REGISTERED, "Symbol with uid $uid already registered.")
            else throw MathAsmException(ErrorCode.SYMBOL_TEXT_ALREADY_REGISTERED, "Symbol with text \"$textToUse\" already registered.")
        }

        //4. Get the parent
        val parent: MathAsmDirEntity? = app.dirRepo.findById(parentId, 0).orElse(null)
        if (parent==null) throw MathAsmException(ErrorCode.OBJECT_NOT_FOUND, "Object with uid $parentId not found.")

        //4. Create and save the symbol
        val newSymbol = MathAsmSymbol(requestingUser, textToUse, uid)
        parent.symbols.add(newSymbol)
        app.dirRepo.save(parent, 3)

        return newSymbol
    }
    //endregion


    //region SENTENCE GENERATION
    fun createDir(parentId:Long, name:String, env:DataFetchingEnvironment) : MathAsmDirEntity {
        //1. Check user permissions
        val requestingUser = env.getContext<GraphqlContext>().user
        if (requestingUser==null) throw MathAsmException(ErrorCode.UNAUTHORIZED, "No session.")
        if (!requestingUser.canCreateDirs()) throw MathAsmException(ErrorCode.FORBIDDEN, "Not enough rights to create dirs.")


        //2. Get the parent
        val parent: MathAsmDirEntity? = app.dirRepo.findById(parentId, 0).orElse(null)
        if (parent==null) throw MathAsmException(ErrorCode.OBJECT_NOT_FOUND, "Object with uid $parentId not found.")

        //3. Check name availability
        val isNameTaken = app.dirRepo.hasChildWithName(parentId, name)
        if (isNameTaken) throw MathAsmException(ErrorCode.NAME_ALREADY_EXISTS, "Name  \"$name\" already exists.")


        //4. Create and persist the object
        val newObject = MathAsmDirEntity(name)
        newObject.author = requestingUser
        newObject.createdAt = Instant.now()

        parent.add(newObject)
        app.dirRepo.save(parent, 2)

        return newObject
    }

    /**
     * MathAsm filesystem move operation,
     * It moves (and possible simultaneously renames) a directory under a new parent.
     *
     * @param newName Optional If not provided, the directory will not be renamed.
     * @return true on success
     * */
    fun moveDir(dirIdToMove:Long, newParentId:Long, newName:String?, env:DataFetchingEnvironment) : Boolean {
        //1. Check user permissions
        val requestingUser = env.getContext<GraphqlContext>().user
        if (requestingUser==null) throw MathAsmException(ErrorCode.UNAUTHORIZED, "No session.")
        if (!requestingUser.canCreateDirs()) throw MathAsmException(ErrorCode.FORBIDDEN, "Not enough rights to create dirs.")


        //2. Get the directory to move and the new carent
        val dirToMove: MathAsmDirEntity? = app.dirRepo.findById(dirIdToMove, 1).orElse(null)
        if (dirToMove==null) throw MathAsmException(ErrorCode.OBJECT_NOT_FOUND, "Directory with id $dirIdToMove not found.")

        val parentDir: MathAsmDirEntity? = app.dirRepo.findById(newParentId, 0).orElse(null)
        if (parentDir==null) throw MathAsmException(ErrorCode.OBJECT_NOT_FOUND, "Parent directory with id $dirIdToMove not found.")


        //3. Check if its name is available
        val nameToUse =
                if(newName==null) dirToMove.name
                else newName

        if(app.dirRepo.hasChildWithName(newParentId, nameToUse)) {
            throw MathAsmException(ErrorCode.NAME_ALREADY_EXISTS, "Directory with id $dirIdToMove already has a file with name $nameToUse.")
        }

        //4. Perform the move
        app.dirRepo.deleteChild(dirToMove.parent!!.id, dirIdToMove) //delete the tie to the old parent.

        dirToMove.name = nameToUse      //move to new parent
        dirToMove.parent = parentDir
        app.dirRepo.save(dirToMove)

        return true
    }

    fun createAxiom(parentId:Long, name:String, left:List<Long>, grade:Short, isBidirectional:Boolean, right:List<Long>, env:DataFetchingEnvironment) : MathAsmStatementEntity {
        //1. Check user permissions
        val requestingUser = env.getContext<GraphqlContext>().user
        if (requestingUser==null) throw MathAsmException(ErrorCode.UNAUTHORIZED, "No session.")
        if (!requestingUser.canCreateAxioms()) throw MathAsmException(ErrorCode.FORBIDDEN, "Not enough rights to create axioms.")

        //2. Check that sentences are not empty
        if (left.isEmpty() || right.isEmpty()) throw MathAsmException(ErrorCode.ILLEGAL_AXIOM, "Sentences of an axiom cannot be empty.")

        //2. Get the parent
        val parent: MathAsmDirEntity? = app.dirRepo.findById(parentId, 0).orElse(null)
        if (parent==null) throw MathAsmException(ErrorCode.OBJECT_NOT_FOUND, "Object with uid $parentId not found.")


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

    fun uploadProof(moves:MutableList<LogicMove>, env:DataFetchingEnvironment) : List<SavedTheoremInfo> {
        //1. Check user permissions
        val requestingUser = env.getContext<GraphqlContext>().user
        if (requestingUser==null) throw MathAsmException(ErrorCode.UNAUTHORIZED, "No session.")
        if (!requestingUser.canCreateTheorems()) throw MathAsmException(ErrorCode.FORBIDDEN, "Not enough rights to create theorems.")

        //2. Create the executor environment
        val theoremList = mutableListOf<SavedTheoremInfo>()
        val proofExecutor = ProofExecutor(
            java.util.function.Function { id -> app.statementRepo.findById(id, 1).orElse(null) },
            TheoremSaver{ statementToSave, parentId, name -> ProofUtils.persistTheorem(theoremList, statementToSave, parentId, name, requestingUser, app) },
            TheoremGenerator { selectedBase, side, b -> MathAsmStatementEntity.createTheoremTemp(selectedBase, side, b) }
        )

        //3. Execute the moves.
        for (move: LogicMove in moves) proofExecutor.executeMove(move)

        //4. Create the proof and save it in DB
        val proof = MathAsmProof(moves.mapIndexed{index,lm -> LogicMoveEntity(lm, index, proofExecutor.getBaseCache())}.toMutableList())
        app.proofRepo.save(proof, 2)

        //5. Associate all theorems with their proof
        theoremList.forEach { it.theorem.proof = proof }
        app.statementRepo.saveAll(theoremList.map { it.theorem })

        return theoremList
    }
    //endregion
}