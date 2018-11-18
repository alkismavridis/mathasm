package eu.alkismavridis.mathasm.api.utils

import eu.alkismavridis.mathasm.db.entities.User


/**
 * MathAsmSession represents a session for this App.
 * An order object is always present.
 * The user object may be null
 * */
class MathAsmSession {
    var user: User? = null
    var requestCount: Int = 0
}