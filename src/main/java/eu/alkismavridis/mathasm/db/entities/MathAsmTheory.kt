package eu.alkismavridis.mathasm.db.entities

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import org.neo4j.ogm.annotation.GeneratedValue
import org.neo4j.ogm.annotation.Id
import org.neo4j.ogm.annotation.NodeEntity
import org.neo4j.ogm.annotation.Relationship


@NodeEntity(label="theory")
class MathAsmTheory {
    //region FIELDS
    @Id
    @GeneratedValue
    var id:Long? = null

    var name:String = ""

    @Relationship(type = "OBJ", direction = Relationship.OUTGOING)
    var rootObj: MathAsmDirEntity? = null
    //endregion



    //region LIFE CYCLE
    constructor() {}
    constructor(name:String, rootObj: MathAsmDirEntity) {
        this.rootObj = rootObj
        this.name = name
    }
    //endregion

    //private var words:MutableList<LogicWord> = ArrayList()
    //private var lastGivenId = 0L



    //region DATA ACCESSORS


    //endregion


    //region DB SERIALIZATION
    fun toNodeJson() : JsonNode {
        return JsonNodeFactory.instance.objectNode()
                .put("id", this.id)
                .put("name", this.name)
    }
    //endregion
}