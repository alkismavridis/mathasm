package eu.alkismavridis.mathasm.api.resolvers.write

import eu.alkismavridis.mathasm.api.GraphqlContext
import eu.alkismavridis.mathasm.core.error.ErrorCode
import eu.alkismavridis.mathasm.core.error.MathAsmException
import eu.alkismavridis.mathasm.db.entities.MathAsmDirEntity
import eu.alkismavridis.mathasm.db.entities.MathAsmSymbol
import eu.alkismavridis.mathasm.services.App
import eu.alkismavridis.mathasm.services.utils.SymbolUtils
import graphql.schema.DataFetchingEnvironment

class SymbolWSector(private val app: App) {
    fun createSymbol(parentId:Long, text:String, uid:Long, env: DataFetchingEnvironment) : MathAsmSymbol {
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
        if (parent==null) throw MathAsmException(ErrorCode.DIR_NOT_FOUND, "Object with uid $parentId not found.")

        //4. Create and save the symbol
        val newSymbol = MathAsmSymbol(requestingUser, textToUse, uid)
        parent.symbols.add(newSymbol)
        app.dirRepo.save(parent, 3)

        return newSymbol
    }

    /**
     * MathAsm filesystem move operation,
     * It moves a symbol under a new parent.
     * @return true on success
     * */
    fun move(symbolUidToMove:Long, newParentId:Long, env: DataFetchingEnvironment) : Boolean {
        //1. Check user permissions
        val requestingUser = env.getContext<GraphqlContext>().user
        if (requestingUser==null) throw MathAsmException(ErrorCode.UNAUTHORIZED, "No session.")
        if (!requestingUser.canCreateDirs()) throw MathAsmException(ErrorCode.FORBIDDEN, "Not enough rights to move symbols.")


        //2. Get the directory to move and the new parent
        val symbolToMove: MathAsmSymbol? = app.symbolRepo.findByUid(symbolUidToMove, 1)
        if (symbolToMove==null) throw MathAsmException(ErrorCode.SYMBOL_NOT_FOUND, "Symbol with id $symbolUidToMove not found.")

        val parentDir: MathAsmDirEntity? = app.dirRepo.findById(newParentId, 0).orElse(null)
        if (parentDir==null) throw MathAsmException(ErrorCode.DIR_NOT_FOUND, "Parent directory with id $newParentId not found.")


        //3. Perform the move
        if (symbolToMove.parent!=null) app.dirRepo.deleteChild(symbolToMove.parent!!.id, symbolToMove.id) //delete the tie to the old parent.

        symbolToMove.parent = parentDir
        app.symbolRepo.save(symbolToMove, 1)

        return true
    }

    fun rename(symbolUidToMove:Long, newText:String, env: DataFetchingEnvironment) : Boolean {
        //1. Check user permissions
        val requestingUser = env.getContext<GraphqlContext>().user
        if (requestingUser==null) throw MathAsmException(ErrorCode.UNAUTHORIZED, "No session.")
        if (!requestingUser.canCreateSymbols()) throw MathAsmException(ErrorCode.FORBIDDEN, "Not enough rights to rename symbols.")

        //2. Sanitize and validate the incoming text
        val textToUse = SymbolUtils.sanitizeSymbolTest(newText)

        //3. Get the symbol to rename
        val symbolToRename: MathAsmSymbol? = app.symbolRepo.findByUid(symbolUidToMove, 1)
        if (symbolToRename==null) throw MathAsmException(ErrorCode.SYMBOL_NOT_FOUND, "Symbol with id $symbolUidToMove not found.")

        //4. Check if the new name is available
        val existingSymbol = app.symbolRepo.findByText(textToUse)
        if (existingSymbol!=null && existingSymbol.uid != symbolToRename.uid) {
            throw MathAsmException(ErrorCode.SYMBOL_TEXT_ALREADY_REGISTERED, "Symbol with text $textToUse already exists.")
        }

        //5. Perform the renaming
        symbolToRename.text = textToUse
        app.symbolRepo.save(symbolToRename, 1)
        return true
    }
}