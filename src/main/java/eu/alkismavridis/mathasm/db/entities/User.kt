package eu.alkismavridis.mathasm.db.entities

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import org.neo4j.ogm.annotation.GeneratedValue
import org.neo4j.ogm.annotation.Id
import org.neo4j.ogm.annotation.NodeEntity

const val UserRights_CAN_CREATE_THEOREMS = 1
const val UserRights_CAN_CREATE_SYMBOLS = 2
const val UserRights_CAN_CREATE_AXIOMS = 4
const val UserRights_CAN_CREATE_DIRS = 8
const val UserRights_CAN_CREATE_USERS = 16

const val UserRights_MAX:Int =
        UserRights_CAN_CREATE_THEOREMS or
        UserRights_CAN_CREATE_SYMBOLS or
        UserRights_CAN_CREATE_AXIOMS or
        UserRights_CAN_CREATE_DIRS or
        UserRights_CAN_CREATE_USERS

const val UserRights_MIN = 0

@NodeEntity(label="user")
class User {
    //region FIELDS
    @Id
    @GeneratedValue
    var id:Long? = null

    var userName:String=""

    lateinit var password:String

    var rights:Int=UserRights_MIN
    //endregion

    constructor() {}
    constructor(userName:String) {
        this.rights = UserRights_MIN
        this.userName = userName
    }


    //region GETTERS
    fun canCreateTheorems() : Boolean {
        return this.rights and UserRights_CAN_CREATE_THEOREMS != 0
    }

    fun canCreateSymbols() : Boolean {
        return this.rights and UserRights_CAN_CREATE_SYMBOLS != 0
    }

    fun canCreateAxioms() : Boolean {
        return this.rights and UserRights_CAN_CREATE_AXIOMS != 0
    }

    fun canCreateDirs() : Boolean {
        return this.rights and UserRights_CAN_CREATE_DIRS != 0
    }

    fun canCreateUsers() : Boolean {
        return this.rights and UserRights_CAN_CREATE_USERS != 0
    }
    //endregion


    //region SETTERS
    fun setId(id:Long): User {
        this.id = id
        return this
    }

    fun setPassword(password:String): User {
        this.password = password
        return this
    }

    fun withRights(rights:Int): User {
        this.rights = rights
        return this
    }
    //endregion


    //region OVERRIDES
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is User) return false

        if (id == null) return false
        if (id != other.id) return false

        return true
    }

    override fun hashCode(): Int {
        return id?.hashCode() ?: 0
    }
    //endregion


    //region DB SERIALIZATION
    fun toNodeJson() : JsonNode {
        return JsonNodeFactory.instance.objectNode()
                .put("id", this.id)
                .put("userName", this.userName)
                .put("rights", this.rights)
    }
    //endregion
}