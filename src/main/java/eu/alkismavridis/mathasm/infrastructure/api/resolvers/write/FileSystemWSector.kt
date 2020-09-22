package eu.alkismavridis.mathasm.infrastructure.api.resolvers.write

import eu.alkismavridis.mathasm.infrastructure.api.GraphqlContext
import eu.alkismavridis.mathasm.entities.error.ErrorCode
import eu.alkismavridis.mathasm.entities.error.MathAsmException
import eu.alkismavridis.mathasm.infrastructure.db.entities.MathAsmDirEntity
import eu.alkismavridis.mathasm.infrastructure.services.App
import graphql.schema.DataFetchingEnvironment
import java.time.Instant

class FileSystemWSector(private val app: App) {
    fun createDir(parentId:Long, name:String, env: DataFetchingEnvironment) : MathAsmDirEntity {
        //1. Check user permissions
        val requestingUser = env.getContext<GraphqlContext>().user
        if (requestingUser==null) throw MathAsmException(ErrorCode.UNAUTHORIZED, "No session.")
        if (!requestingUser.canCreateDirs()) throw MathAsmException(ErrorCode.FORBIDDEN, "Not enough rights to create dirs.")


        //2. Get the parent
        val parent: MathAsmDirEntity? = app.dirRepo.findById(parentId, 0).orElse(null)
        if (parent==null) throw MathAsmException(ErrorCode.DIR_NOT_FOUND, "Object with uid $parentId not found.")

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
    fun moveDir(dirIdToMove:Long, newParentId:Long, newName:String?, env: DataFetchingEnvironment) : Boolean {
        //1. Check user permissions
        val requestingUser = env.getContext<GraphqlContext>().user
        if (requestingUser==null) throw MathAsmException(ErrorCode.UNAUTHORIZED, "No session.")
        if (!requestingUser.canCreateDirs()) throw MathAsmException(ErrorCode.FORBIDDEN, "Not enough rights to move directories.")


        //2. Get the directory to move and the new carent
        val dirToMove: MathAsmDirEntity? = app.dirRepo.findById(dirIdToMove, 1).orElse(null)
        if (dirToMove==null) throw MathAsmException(ErrorCode.DIR_NOT_FOUND, "Directory with id $dirIdToMove not found.")

        val parentDir: MathAsmDirEntity? = app.dirRepo.findById(newParentId, 0).orElse(null)
        if (parentDir==null) throw MathAsmException(ErrorCode.DIR_NOT_FOUND, "Parent directory with id $newParentId not found.")


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
}
