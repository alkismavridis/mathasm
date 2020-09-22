package eu.alkismavridis.mathasm.infrastructure.db.entities

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import org.neo4j.ogm.annotation.GeneratedValue
import org.neo4j.ogm.annotation.Id
import org.neo4j.ogm.annotation.NodeEntity
import org.neo4j.ogm.annotation.Relationship
import org.neo4j.ogm.annotation.typeconversion.DateLong
import java.time.Instant

@NodeEntity(label="symbol")
class MathAsmSymbol {
    //region FIELDS
    @Id
    @GeneratedValue
    var id:Long? = null

    var uid:Long = 0
    var text:String = ""

    @DateLong
    var createdAt: Instant? = null

    @Relationship(type = "AUTH", direction = Relationship.OUTGOING)
    var author:User? = null

    @Relationship(type = "SYM", direction = Relationship.INCOMING)
    var parent:MathAsmDirEntity? = null
    //endregion


    constructor() {}
    constructor(author:User, text:String, uid:Long) {
        this.text = text
        this.uid = uid
        this.createdAt = Instant.now()
        this.author = author
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
