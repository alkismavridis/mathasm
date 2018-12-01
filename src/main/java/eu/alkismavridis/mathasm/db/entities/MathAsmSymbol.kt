package eu.alkismavridis.mathasm.db.entities

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import org.neo4j.ogm.annotation.GeneratedValue
import org.neo4j.ogm.annotation.Id
import org.neo4j.ogm.annotation.NodeEntity

@NodeEntity(label="symbol")
class MathAsmSymbol {
    //region FIELDS
    @Id
    @GeneratedValue
    var id:Long? = null

    var uid:Long = 0
    var text:String = ""
    //endregion


    constructor() {}
    constructor(text:String, uid:Long) {
        this.text = text
        this.uid = uid
    }


    //region DB SERIALIZATION
    fun toNodeJson() : JsonNode {
        return JsonNodeFactory.instance.objectNode()
                .put("id", this.id)
                .put("uid", this.uid)
                .put("text", this.text)
    }
    //endregion
}