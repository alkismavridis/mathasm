package eu.alkismavridis.mathasm.infrastructure.db.entities

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import eu.alkismavridis.mathasm.entities.error.ErrorCode
import eu.alkismavridis.mathasm.entities.error.MathAsmException
import eu.alkismavridis.mathasm.entities.proof.*
import eu.alkismavridis.mathasm.entities.sentence.MathAsmStatement
import org.neo4j.ogm.annotation.GeneratedValue
import org.neo4j.ogm.annotation.Id
import org.neo4j.ogm.annotation.NodeEntity
import org.neo4j.ogm.annotation.Relationship

/**
 * This class defines a DB-version of a logic move.
 * This is what we will be saving into DB.
 *
 * This class is NOT used for business logic, such as proof executor.
 * */
@NodeEntity(label="move")
open class LogicMoveEntity {
    //region FIELDS
    @Id
    @GeneratedValue
    var id:Long? = null

    var index:Int = 0

    @Relationship(type = "BS", direction = Relationship.OUTGOING)
    var extBase:MathAsmStatementEntity? = null

    var intBaseId:Long? = null //If the base is not external, this should be used instead of base parameter

    var moveType:Byte = 0      //Defines the move type.
    var targetId:Long = 0      //Pointer to a target of the proof. Used for INTERNAL SELECTS, CLONINGS or REPLACEMENTS
    var side:Byte = 0          //The side of the base to replace or clone
    var pos:Int = 0            //used for moveType ONE_IN_LEFT and ONE_IN_RIGHT
    var parentId:Long = -1     //used by SAVE move
    var name:String = ""       //used by SAVE move
    //endregion


    //region CONSTRUCTORS
    constructor() {}

    constructor(index: Int, extBase:MathAsmStatementEntity?, moveType: Byte, targetId: Long, side: Byte, position: Int, parentId: Long, name: String) {
        this.index = index
        this.extBase = extBase
        this.moveType = moveType
        this.targetId = targetId
        this.side = side
        this.pos = position
        this.parentId = parentId
        this.name = name
    }

    constructor(lm:LogicMove, index:Int, basesMap:Map<Long, MathAsmStatement>) {
        this.index = index

        if (lm.intBaseId!=null) this.intBaseId = lm.intBaseId
        else if (lm.extBaseId!=null) {
            val base = basesMap[lm.extBaseId!!]
            if (!(base is MathAsmStatementEntity)) throw MathAsmException(ErrorCode.WRONG_CLASS_INSTANCE)
            this.extBase = base
        }

        this.moveType = lm.moveType
        this.targetId = lm.targetId
        this.side = lm.side
        this.pos = lm.pos
        this.parentId = lm.parentId
        this.name = lm.name
    }
    //endregion




    //region DB SERIALIZATION
    fun toNodeJson() : JsonNode {
        return JsonNodeFactory.instance.objectNode()
                .put("id", this.id)
                .put("index", this.index)
                .put("moveType", this.moveType.toInt())
                .put("targetId", this.targetId)
                .put("extBaseId", if (this.extBase==null) null else this.extBase!!.id)
                .put("side", this.side.toInt())
                .put("intBaseId", this.intBaseId)
                .put("pos", this.pos)
                .put("parentId", this.parentId)
                .put("name", this.name)
    }
    //endregion
}

//defined for GraphQL only
class LogicMoveInput : LogicMoveEntity() {}
