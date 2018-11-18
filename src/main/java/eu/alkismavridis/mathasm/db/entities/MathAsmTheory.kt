package eu.alkismavridis.mathasm.db.entities

import org.neo4j.ogm.annotation.GeneratedValue
import org.neo4j.ogm.annotation.Id
import org.neo4j.ogm.annotation.NodeEntity
import org.neo4j.ogm.annotation.Relationship


@NodeEntity
class MathAsmTheory {
    //region FIELDS
    @Id
    @GeneratedValue
    var id:Long? = null

    var name:String = ""

    @Relationship(type = "ROOT", direction = Relationship.OUTGOING)
    var rootObj: MathAsmObjectEntity? = null
    //endregion



    //region LIFE CYCLE
    constructor() {}
    constructor(name:String, rootObj: MathAsmObjectEntity) {
        this.rootObj = rootObj
        this.name = name
    }
    //endregion

    //private var words:MutableList<LogicWord> = ArrayList()
    //private var lastGivenId = 0L



    //region WORD MANAGEMENT
    /*fun getWords() : List<LogicWord> { return this.words }
    fun getWordCount() : Int { return this.words.size }

    fun getWord(symbol:String) : LogicWord {
        //1. Try to find an already existing word with the given symbol
        var word = this.words.find { w -> w.symbol == symbol }
        if (word!=null) return word

        //2. If it is not found, create it, add it into the list and return it.
        word = LogicWord(++lastGivenId, symbol)
        words.add(word)

        return word
    }*/
    //endregion



}