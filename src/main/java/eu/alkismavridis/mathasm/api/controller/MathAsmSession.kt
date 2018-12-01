package eu.alkismavridis.mathasm.api.controller

import eu.alkismavridis.mathasm.db.entities.User
import java.time.Instant


/**
 * MathAsmSession represents a session for this App.
 * An order object is always present.
 * The user object may be null
 * */
class MathAsmSession(
    val userId:Long,
    val sessionKey:String,
    val createdAt:Instant
) {
    var lastContact = createdAt



    //region LIFE CYCLE
    init {}
    //endregion

    /** Should be called with every request. It saves the last moment that a request was made.
     * If last contact variable becomes too old, the session is expired and we should destroy it
     */
    fun refresh() {
        this.lastContact = Instant.now()
    }


    fun getMillisSinceLastContact() : Long {
        return Instant.now().toEpochMilli() - lastContact.toEpochMilli()
    }
}