package eu.alkismavridis.mathasm.db.entities

import org.neo4j.ogm.annotation.GeneratedValue
import org.neo4j.ogm.annotation.Id
import org.neo4j.ogm.annotation.NodeEntity
import org.neo4j.ogm.annotation.Relationship

/** This is the type that the client side sends to the server as a logic move.
 * Not all fields have sense for every move type, but this object should include them all anyway.
 * */
@NodeEntity
class MathAsmProof {
    //region FIELDS
    @Id
    @GeneratedValue
    var id:Long? = null


    @Relationship(type = "MV", direction = Relationship.OUTGOING)
    var moves = mutableListOf<LogicMoveEntity>()
    //endregion


    constructor() {}
    constructor(moves:MutableList<LogicMoveEntity>) {
        this.moves = moves
    }

}