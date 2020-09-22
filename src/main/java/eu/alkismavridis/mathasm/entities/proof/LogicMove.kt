package eu.alkismavridis.mathasm.entities.proof

import eu.alkismavridis.mathasm.entities.enums.*


class LogicMove {
    //region FIELDS
    var moveType:Byte = -1       //One of MoveType.kt
    var extBaseId:Long? = null   //used to indicate external selections
    var intBaseId:Long? = null   //used to indicate internal selections. ONLY ONE of extBaseId and intBaseId must be set.
    var side:Byte = -1           //used by replacement and start moves to indicate which sentence of the BASE to choose.
    var pos:Int = 0              //used by moves ONE_IN_LEFT and ONE_IN_RIGHT to indicate the position to be replaced
    var targetId:Long = 0        //pointer to a target of the proof.
    var parentId:Long = 0        //used by SAVE move to indicate where the theorem will be saved
    var name:String = ""         //used by SAVE move to indicate the new theorem's name
    //endregion




    //region CONSTRUCTORS AND STATIC GENERATORS
    private constructor(moveType:Byte) {
        this.moveType = moveType
    }

    companion object {
        fun makeStart(targetId: Long, extBaseId:Long?, intBaseId:Long?, side: Byte) : LogicMove {
            return LogicMove(MoveType_START).apply {
                this.targetId = targetId
                this.extBaseId = extBaseId
                this.intBaseId = intBaseId
                this.side = side
            }
        }

        fun makeSave(targetId: Long, parentId:Long, name:String) : LogicMove {
            return LogicMove(MoveType_SAVE).apply {
                this.targetId = targetId
                this.parentId = parentId
                this.name = name
            }
        }

        /**
         * @param side the side of the BASE that needs to be replaced
         * */
        fun makeReplaceAll(targetId: Long, extBaseId:Long?, intBaseId:Long?, side: Byte) : LogicMove {
            return LogicMove(MoveType_REPLACE_ALL).apply {
                this.targetId = targetId
                this.extBaseId = extBaseId
                this.intBaseId = intBaseId
                this.side = side
            }
        }

        /**
         * @param side the side of the BASE that needs to be replaced
         * */
        fun makeReplaceLeft(targetId: Long, extBaseId:Long?, intBaseId:Long?, side: Byte) : LogicMove {
            return LogicMove(MoveType_REPLACE_LEFT).apply {
                this.targetId = targetId
                this.extBaseId = extBaseId
                this.intBaseId = intBaseId
                this.side = side
            }
        }

        /**
         * @param side the side of the BASE that needs to be replaced
         * */
        fun makeReplaceRight(targetId: Long, extBaseId:Long?, intBaseId:Long?, side: Byte) : LogicMove {
            return LogicMove(MoveType_REPLACE_RIGHT).apply {
                this.targetId = targetId
                this.extBaseId = extBaseId
                this.intBaseId = intBaseId
                this.side = side
            }
        }

        /**
         * @param side the side of the BASE that needs to be replaced
         * */
        fun makeReplaceOneInLeft(targetId: Long, extBaseId:Long?, intBaseId:Long?, side: Byte, pos:Int) : LogicMove {
            return LogicMove(MoveType_ONE_IN_LEFT).apply {
                this.targetId = targetId
                this.extBaseId = extBaseId
                this.intBaseId = intBaseId
                this.side = side
                this.pos = pos
            }
        }

        /**
         * @param side the side of the BASE that needs to be replaced
         * */
        fun makeReplaceOneInRight(targetId: Long, extBaseId:Long?, intBaseId:Long?, side: Byte, pos:Int) : LogicMove {
            return LogicMove(MoveType_ONE_IN_RIGHT).apply {
                this.targetId = targetId
                this.extBaseId = extBaseId
                this.intBaseId = intBaseId
                this.side = side
                this.pos = pos
            }
        }
    }
    //endregion
}
