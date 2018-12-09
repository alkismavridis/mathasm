package eu.alkismavridis.mathasm.services.utils

import eu.alkismavridis.mathasm.core.error.ErrorCode
import eu.alkismavridis.mathasm.core.error.MathAsmException
import eu.alkismavridis.mathasm.core.proof.*
import eu.alkismavridis.mathasm.core.sentence.MathAsmStatement
import eu.alkismavridis.mathasm.core.sentence.MathAsmStatement_BOTH_SIDES
import eu.alkismavridis.mathasm.db.entities.LogicMoveEntity
import eu.alkismavridis.mathasm.db.entities.MathAsmDirEntity
import eu.alkismavridis.mathasm.db.entities.MathAsmStatementEntity
import eu.alkismavridis.mathasm.db.entities.User
import eu.alkismavridis.mathasm.services.App
import java.time.Instant

class ProofUtils {
    companion object {
        /**
         * Saves a CLONE of the given theorem into the DB, and appends this clone into the given list.
         *
         * Validations:
         * - The statementToSave to be saved must be an instance of MathAsmStatementEntity.
         * - The MathAsmDirEntity with id $parentId must exist in the DB.
         *
         *
         * The following fields of the CLONE to be saved will be set up:
         * - author
         * - createdAt
         * - name
         * - id (through neo4j)
         * */
        fun persistTheorem(targetList: MutableList<MathAsmStatementEntity>, statementToSave:MathAsmStatement, parentId:Long, name:String, author: User, app: App) {
            if (!(statementToSave is MathAsmStatementEntity)) throw MathAsmException(ErrorCode.WRONG_CLASS_INSTANCE, "Not a MathAsmStatementEntity")

            //1. Create a clone and setup its basic fields
            val entityToSave = MathAsmStatementEntity.createTheoremTemp(statementToSave, MathAsmStatement_BOTH_SIDES, false)
            entityToSave.author = author
            entityToSave.createdAt = Instant.now()
            entityToSave.name = name

            //2. Fetch parent and add the statement to it
            val parent: MathAsmDirEntity? = app.dirRepo.findById(parentId, 0).orElse(null)
            if (parent==null) throw MathAsmException(ErrorCode.OBJECT_NOT_FOUND, "Object with id $parentId not found.")

            //3. Check name availability
            val isNameTaken = app.dirRepo.hasChildWithName(parentId, name)
            if (isNameTaken) throw MathAsmException(ErrorCode.NAME_ALREADY_EXISTS, "Name  \"$name\" already exists.")

            //4. Save the statement on list and db
            parent.add(entityToSave)
            app.dirRepo.save(parent, 2)
            targetList.add(entityToSave)
        }


        /** Converts a LogicMoveEntity to a LogicMove that can be run by a proof executor. */
        fun toLogicMove(move: LogicMoveEntity) : LogicMove {
            when(move.moveType) {
                LOGIC_MOVE_INT_SELECT -> return InternalSelectMove(move.index, move.templateIndex)
                LOGIC_MOVE_EXT_SELECT -> return ExternalSelectMove(move.index, move.targetId)
                LOGIC_MOVE_START -> return StartMove(move.index, move.templateIndex, move.side)
                LOGIC_MOVE_REPLACE_ALL -> return ReplaceAllMove(move.index, move.templateIndex, move.dir)
                LOGIC_MOVE_REPLACE_PHRASE -> return ReplaceSentenceMove(move.index, move.templateIndex, move.dir, move.side)
                LOGIC_MOVE_REPLACE_ONE -> return ReplaceOneMove(move.index, move.templateIndex, move.dir, move.side, move.position)
                LOGIC_MOVE_SAVE -> return SaveMove(move.index, move.templateIndex, move.parentId, move.name)
                else -> throw MathAsmException(ErrorCode.UNKNOWN_MOVE, "Unknown move was detected: ${move.moveType}")
            }
        }
    }
}