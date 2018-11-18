package eu.alkismavridis.mathasm.db.entities

import eu.alkismavridis.mathasm.core.sentence.MathAsmStatement
import eu.alkismavridis.mathasm.core.env.MathAsmObject
import eu.alkismavridis.mathasm.core.error.ErrorCode
import eu.alkismavridis.mathasm.core.error.MathAsmException
import org.neo4j.ogm.annotation.*
import org.neo4j.ogm.annotation.typeconversion.DateLong
import java.time.Instant
import java.util.stream.Stream

@NodeEntity
class MathAsmObjectEntity : MathAsmObject {
    //region FIELDS
    @Id
    @GeneratedValue
    override var id:Long? = null

    /** The name should be unique within its parent.
     *  It is used by DB for navigation in the graph. */
    override var name:String = ""

    @Relationship(type = "SEN", direction = Relationship.OUTGOING)
    var statements:MutableList<MathAsmStatementEntity> = ArrayList()

    @Relationship(type = "OBJ", direction = Relationship.OUTGOING)
    var objects = mutableListOf<MathAsmObjectEntity>()

    //extentions
    @Relationship(type = "AUTH", direction = Relationship.OUTGOING)
    var author:User? = null

    @DateLong
    var createdAt: Instant? = null
    //endregion


    //region CONSTRUCTORS
    constructor() {}
    constructor(name:String) {
        this.name = name
    }
    //endregion




    //region LOGIC VALUE OVERRIDES
    //getters
    override fun getSentence(index:Int) : MathAsmStatementEntity? {
        if (index<0 || index>=this.statements.size) return null
        return this.statements[index]
    }

    override fun getObject(index:Int) : MathAsmObject? {
        if (index<0 || index>=this.objects.size) return null
        return this.objects[index]
    }


    fun sentenceStream() : Stream<MathAsmStatementEntity> = this.statements.stream()
    fun objectStream() : Stream<MathAsmObjectEntity> = this.objects.stream()



    //sentence setters
    @Synchronized
    override fun add(value: MathAsmStatement) {
        if (!(value is MathAsmStatementEntity)) {
            throw MathAsmException(ErrorCode.WRONG_CLASS_INSTANCE, "Only MathAsmStatementEntity is allowed")
        }
        this.statements.add(value)
    }

    @Synchronized
    override  fun add(index:Int, value: MathAsmStatement) {
        if (!(value is MathAsmStatementEntity)) {
            throw MathAsmException(ErrorCode.WRONG_CLASS_INSTANCE, "Only MathAsmStatementEntity is allowed")
        }
        this.statements.add(index, value)
    }

    @Synchronized
    override  fun set(index:Int, value: MathAsmStatement) {
        if (!(value is MathAsmStatementEntity)) {
            throw MathAsmException(ErrorCode.WRONG_CLASS_INSTANCE, "Only MathAsmStatementEntity is allowed")
        }
        this.statements[index] = value
    }

    //object setters
    @Synchronized
    override fun add(value: MathAsmObject) {
        if (!(value is MathAsmObjectEntity)) {
            throw MathAsmException(ErrorCode.WRONG_CLASS_INSTANCE, "Only MathAsmObjectEntity is allowed")
        }
        this.objects.add(value)
    }

    @Synchronized
    override fun add(index:Int, value: MathAsmObject) {
        if (!(value is MathAsmObjectEntity)) {
            throw MathAsmException(ErrorCode.WRONG_CLASS_INSTANCE, "Only MathAsmObjectEntity is allowed")
        }
        this.objects.add(index, value)
    }

    @Synchronized
    override fun set(index:Int, value: MathAsmObject) {
        if (!(value is MathAsmObjectEntity)) {
            throw MathAsmException(ErrorCode.WRONG_CLASS_INSTANCE, "Only MathAsmObjectEntity is allowed")
        }
        this.objects[index] = value
    }
    //endregion


    //region OVERRIDES
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is MathAsmObjectEntity) return false

        if (id == null) return false
        if (id != other.id) return false

        return true
    }

    override fun hashCode(): Int {
        return id?.hashCode() ?: 0
    }
    //endregion
}
