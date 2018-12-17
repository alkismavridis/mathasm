package eu.alkismavridis.mathasm.api.resolvers

import com.coxautodev.graphql.tools.GraphQLMutationResolver
import eu.alkismavridis.mathasm.api.GraphqlContext
import eu.alkismavridis.mathasm.api.controller.security.SecurityService
import eu.alkismavridis.mathasm.api.types.LoginResponse
import eu.alkismavridis.mathasm.services.App
import eu.alkismavridis.mathasm.core.error.ErrorCode
import eu.alkismavridis.mathasm.core.error.MathAsmException
import eu.alkismavridis.mathasm.core.proof.ProofExecutor
import eu.alkismavridis.mathasm.core.proof.TheoremGenerator
import eu.alkismavridis.mathasm.core.proof.TheoremSaver
import eu.alkismavridis.mathasm.db.entities.*
import eu.alkismavridis.mathasm.services.utils.ProofUtils
import eu.alkismavridis.mathasm.services.utils.SymbolUtils
import graphql.schema.DataFetchingEnvironment
import java.time.Instant

class Mutation(private var app: App, private val secService:SecurityService) : GraphQLMutationResolver {

    //region FIELDS

    //endregion




    //region SESSION RELATED
    fun logout(env:DataFetchingEnvironment): Boolean {
        val session = env.getContext<GraphqlContext>().session
        if (session==null) return false //no session to destroy!

        return secService.destroySession(session.sessionKey) != null
    }

    fun login(username:String, password:String, env:DataFetchingEnvironment): LoginResponse {
        val user = app.userService.get(username)

        //1 check user name existence
        if (user==null) throw MathAsmException(ErrorCode.USER_NOT_EXISTS, "User name does not exists")

        //2. check password matching
        if (password != user.password) throw MathAsmException(ErrorCode.WRONG_PASSWORD, "Incorrect password")

        //3. all correct. setup the session and return the user
        val sessionKey = secService.createSessionKeyFor(user)
        return LoginResponse(user, sessionKey)
    }

    fun signin(username:String, password:String, env:DataFetchingEnvironment): LoginResponse {
        var user = app.userService.get(username)

        //1 check user name existence
        if (user!=null) throw MathAsmException(ErrorCode.USER_ALREADY_EXISTS, "User name already exists")

        //2. create new user and add to service
        user = app.userService.save( User(username).setPassword(password) )

        //3. all correct. setup the session and return the user
        val sessionKey = secService.createSessionKeyFor(user)
        return LoginResponse(user, sessionKey)
    }
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
        if (!requestingUser.cancreateDirs()) throw MathAsmException(ErrorCode.FORBIDDEN, "Not enough rights to create dirs.")


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

    fun createTheorem(moves:MutableList<LogicMoveEntity>, env:DataFetchingEnvironment) : MathAsmProof {
        //1. Check user permissions
        val requestingUser = env.getContext<GraphqlContext>().user
        if (requestingUser==null) throw MathAsmException(ErrorCode.UNAUTHORIZED, "No session.")
        if (!requestingUser.canCreateTheorems()) throw MathAsmException(ErrorCode.FORBIDDEN, "Not enough rights to create theorems.")


        //2. Create the executor environment
        val theoremList = mutableListOf<MathAsmStatementEntity>()
        val proofExecutor = ProofExecutor(
            java.util.function.Function { id -> app.statementRepo.findById(id, 1).orElse(null) },
            TheoremSaver{ statementToSave, parentId, name -> ProofUtils.persistTheorem(theoremList, statementToSave, parentId, name, requestingUser, app) },
            TheoremGenerator { selectedBase, side, b -> MathAsmStatementEntity.createTheoremTemp(selectedBase, side, b) }
        )

        //3. Execute the moves.
        var index = 0
        for (move: LogicMoveEntity in moves) {
            move.index = index++
            proofExecutor.executeMove(ProofUtils.toLogicMove(move))
        }

        //4. Create the proof and save it in DB
        val proof = MathAsmProof(moves)
        app.proofRepo.save(proof, 1)

        //5. Associate all theorems with their proof
        theoremList.forEach { it.proof = proof }
        app.statementRepo.saveAll(theoremList)

        return proof
    }
    //endregion
}