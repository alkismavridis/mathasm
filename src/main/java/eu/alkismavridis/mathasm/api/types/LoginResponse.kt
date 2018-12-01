package eu.alkismavridis.mathasm.api.types

import eu.alkismavridis.mathasm.db.entities.User

class LoginResponse(var user:User, var sessionKey:String) {}