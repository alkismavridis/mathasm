package eu.alkismavridis.mathasm.infrastructure.api.types

import eu.alkismavridis.mathasm.infrastructure.db.entities.User

class LoginResponse(var user:User, var sessionKey:String) {}
