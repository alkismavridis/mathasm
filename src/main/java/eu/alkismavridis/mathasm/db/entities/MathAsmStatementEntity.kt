package eu.alkismavridis.mathasm.db.entities

import eu.alkismavridis.mathasm.core.sentence.*
import eu.alkismavridis.mathasm.db.converter.SentenceConverter
import org.neo4j.ogm.annotation.GeneratedValue
import org.neo4j.ogm.annotation.Id
import org.neo4j.ogm.annotation.NodeEntity
import org.neo4j.ogm.annotation.Relationship
import org.neo4j.ogm.annotation.typeconversion.Convert
import org.neo4j.ogm.annotation.typeconversion.DateLong
import java.time.Instant

@NodeEntity
class MathAsmStatementEntity : MathAsmStatement {
    //region FIELDS
    //1. Metadata
    @Id
    @GeneratedValue
    override var id:Long? = null

    /** The name should be unique within its parent. It is used by DB for navigation in the graph. */
    override var name:String = ""
    override var type : Byte = -1

    @Relationship(type = "AUTH", direction = Relationship.OUTGOING)
    var author:User? = null

    @DateLong
    var createdAt: Instant? = null

    @Relationship(type = "PRF", direction = Relationship.OUTGOING)
    var proof:MathAsmProof? = null


    //2. Sentences
    @Convert(value = SentenceConverter::class)
    override lateinit var sen1 : MathAsmSentence

    @Convert(value = SentenceConverter::class)
    override lateinit var sen2 : MathAsmSentence


    //3. bridge
    override var bidirectionalFlag: Boolean = false
    override var grade: Short = 0
    //endregion




    //region LIFE CYCLE
    constructor() {}
    //endregion


    //region CHAINING SETTERS
    fun withAuthor(author:User) : MathAsmStatementEntity {
        this.author = author
        return this
    }

    //endregion


    companion object {
        fun createAxiom(name:String, left: LongArray, right: LongArray, isBidirectional:Boolean, grade:Short) : MathAsmStatementEntity {
            val ret = MathAsmStatementEntity()
            setupAxiom(ret, name, left, right, isBidirectional, grade)
            return ret
        }

        fun createTheoremTemp(base: MathAsmStatement, side:Byte, check:Boolean = true) : MathAsmStatementEntity {
            val ret = MathAsmStatementEntity()
            setTheoremTemp(ret, base, side, check)
            return ret
        }
    }
}