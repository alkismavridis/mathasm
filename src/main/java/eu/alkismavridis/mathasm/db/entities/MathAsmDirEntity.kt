package eu.alkismavridis.mathasm.db.entities

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import eu.alkismavridis.mathasm.core.sentence.MathAsmStatement
import eu.alkismavridis.mathasm.core.env.MathAsmDir
import eu.alkismavridis.mathasm.core.error.ErrorCode
import eu.alkismavridis.mathasm.core.error.MathAsmException
import org.neo4j.ogm.annotation.*
import org.neo4j.ogm.annotation.typeconversion.DateLong
import java.time.Instant
import java.util.stream.Stream

@NodeEntity(label="dir")
class MathAsmDirEntity : MathAsmDir {
    //region FIELDS
    @Id
    @GeneratedValue
    override var id:Long? = null

    /** The name should be unique within its parent.
     *  It is used by DB for navigation in the graph. */
    override var name:String = ""

    @Relationship(type = "STMT", direction = Relationship.OUTGOING)
    var statements:MutableList<MathAsmStatementEntity> = ArrayList()

    @Relationship(type = "SYM", direction = Relationship.OUTGOING)
    var symbols:MutableList<MathAsmSymbol> = ArrayList()

    @Relationship(type = "DIR", direction = Relationship.OUTGOING)
    var subDirs = mutableListOf<MathAsmDirEntity>()

    //extentions
    @Relationship(type = "AUTH", direction = Relationship.OUTGOING)
    var author:User? = null

    @DateLong
    var createdAt: Instant? = null

    @Relationship(type = "DIR", direction = Relationship.INCOMING)
    var parent:MathAsmDirEntity? = null

    //endregion


    //region CONSTRUCTORS
    constructor() {}
    constructor(name:String) {
        this.name = name
        this.createdAt = Instant.now()
    }
    //endregion




    //region LOGIC VALUE OVERRIDES
    //getters
    override fun getSentence(index:Int) : MathAsmStatementEntity? {
        if (index<0 || index>=this.statements.size) return null
        return this.statements[index]
    }

    override fun getObject(index:Int) : MathAsmDir? {
        if (index<0 || index>=this.subDirs.size) return null
        return this.subDirs[index]
    }


    fun sentenceStream() : Stream<MathAsmStatementEntity> = this.statements.stream()
    fun subDirStream() : Stream<MathAsmDirEntity> = this.subDirs.stream()



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
    override fun add(value: MathAsmDir) {
        if (!(value is MathAsmDirEntity)) {
            throw MathAsmException(ErrorCode.WRONG_CLASS_INSTANCE, "Only MathAsmDirEntity is allowed")
        }
        this.subDirs.add(value)
    }

    @Synchronized
    override fun add(index:Int, value: MathAsmDir) {
        if (!(value is MathAsmDirEntity)) {
            throw MathAsmException(ErrorCode.WRONG_CLASS_INSTANCE, "Only MathAsmDirEntity is allowed")
        }
        this.subDirs.add(index, value)
    }

    @Synchronized
    override fun set(index:Int, value: MathAsmDir) {
        if (!(value is MathAsmDirEntity)) {
            throw MathAsmException(ErrorCode.WRONG_CLASS_INSTANCE, "Only MathAsmDirEntity is allowed")
        }
        this.subDirs[index] = value
    }
    //endregion



    //region DB SERIALIZATION
    fun toNodeJson() : JsonNode {
        return JsonNodeFactory.instance.objectNode()
                .put("id", this.id)
                .put("name", this.name)
                .put("createdAt", this.createdAt?.toEpochMilli())
    }
    //endregion



    //region OVERRIDES
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is MathAsmDirEntity) return false

        if (id == null) return false
        if (id != other.id) return false

        return true
    }

    override fun hashCode(): Int {
        return id?.hashCode() ?: 0
    }
    //endregion
}
