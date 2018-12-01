package eu.alkismavridis.mathasm.api.controller.security

import eu.alkismavridis.mathasm.api.controller.MathAsmSession
import eu.alkismavridis.mathasm.db.entities.User
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.*
import java.util.stream.Collectors


@Component
class SecurityService {
    //region FIELDS
    private val sessions = mutableMapOf<String, MathAsmSession>()
    //endregion


    //region GETTERS
    fun get(key:String): MathAsmSession? { return sessions[key] }
    //endregion



    //region SESSION MANAGEMENT
    /**
     * Creates a session for the given user.
     * @return the key for the created session. Future requests must send this token in order to be identified.
     * */
    fun createSessionKeyFor(user:User) : String{
        //1. Generate the key
        val sessionKey = String(
                Base64.getEncoder().encode("${System.currentTimeMillis()/2}_${user.id}_${Math.random()*2362}".toByteArray())
        )
        println("encodedBytes " + sessionKey)

        //2. Create the session
        val sess = MathAsmSession(user.id!!, sessionKey, Instant.now())
        this.sessions[sessionKey] = sess

        return sessionKey
    }

    fun destroySession(key:String) : MathAsmSession? {
        return this.sessions.remove(key)
    }

    fun destroyAllSessionsFor(userId:Long) {
        val sessionKeys = this.sessions.entries
                .stream()
                .filter{e -> e.value.userId == userId}
                .map{it.key}
                .collect(Collectors.toList())

        sessionKeys.forEach{ this.destroySession(it) }
    }


    /**
     * brings this service in its initial state: with zero sessions.
     * For unit testing purposes.
     * */
    fun clear() { this.sessions.clear() }
    //endregion
}
