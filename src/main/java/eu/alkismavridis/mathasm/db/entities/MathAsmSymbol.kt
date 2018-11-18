package eu.alkismavridis.mathasm.db.entities

import org.neo4j.ogm.annotation.GeneratedValue
import org.neo4j.ogm.annotation.Id
import org.neo4j.ogm.annotation.NodeEntity

@NodeEntity
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
}