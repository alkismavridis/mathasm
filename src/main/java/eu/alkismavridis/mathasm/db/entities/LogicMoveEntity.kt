package eu.alkismavridis.mathasm.db.entities

import eu.alkismavridis.mathasm.core.proof.*
import org.neo4j.ogm.annotation.GeneratedValue
import org.neo4j.ogm.annotation.Id
import org.neo4j.ogm.annotation.NodeEntity

/** This is the type that the client side sends to the server as a logic move.
 * Not all fields have sense for every move type, but this object should include them all anyway.
 * */
@NodeEntity
class LogicMoveEntity {
    //region FIELDS
    @Id
    @GeneratedValue
    var id:Long? = null

    var index:Int = 0
    var moveType:Byte = 0
    var templateIndex:Int = 0
    var targetId:Long = 0
    var side:Byte = 0
    var dir:Byte = 0
    var position:Int = 0
    var parentId:Long = -1
    var name:String = ""
    //endregion


    //region CONSTRUCTORS
    constructor() {}

    constructor(index: Int, moveType: Byte, templateIndex: Int, targetId: Long, side: Byte, dir: Byte, position: Int, parentId: Long, name: String) {
        this.index = index
        this.moveType = moveType
        this.templateIndex = templateIndex
        this.targetId = targetId
        this.side = side
        this.dir = dir
        this.position = position
        this.parentId = parentId
        this.name = name
    }
    //endregion


    //region STATIC GENERATORS
    companion object {
        fun makeExtSelect(targetId: Long) : LogicMoveEntity {
            return LogicMoveEntity(0, LOGIC_MOVE_EXT_SELECT, 0, targetId, 0, 0, 0, 0, "")
        }

        fun makeIntSelect(templateIndex: Int) : LogicMoveEntity {
            return LogicMoveEntity(0, LOGIC_MOVE_INT_SELECT, templateIndex, 0, 0, 0, 0, 0, "")
        }

        fun makeStart(templateIndex: Int, side: Byte) : LogicMoveEntity {
            return LogicMoveEntity(0, LOGIC_MOVE_START, templateIndex, 0, side, 0, 0, 0, "")
        }

        fun makeReplaceAll(templateIndex: Int, dir: Byte) : LogicMoveEntity {
            return LogicMoveEntity(0, LOGIC_MOVE_REPLACE_ALL, templateIndex, 0, 0, dir, 0, 0, "")
        }

        fun makeReplaceOne(templateIndex: Int, dir: Byte, side: Byte, position: Int) : LogicMoveEntity {
            return LogicMoveEntity(0, LOGIC_MOVE_REPLACE_ONE, templateIndex, 0, side, dir, position, 0, "")
        }

        fun makeSave(templateIndex: Int, parentId: Long, name: String) : LogicMoveEntity {
            return LogicMoveEntity(0, LOGIC_MOVE_SAVE, templateIndex, 0, 0, 0, 0, parentId, name)
        }
    }
    //endregion
}