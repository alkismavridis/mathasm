package eu.alkismavridis.mathasm.infrastructure.api.resolvers.write

import eu.alkismavridis.mathasm.infrastructure.api.GraphqlContext
import eu.alkismavridis.mathasm.infrastructure.api.types.LoginResponse
import eu.alkismavridis.mathasm.entities.error.ErrorCode
import eu.alkismavridis.mathasm.entities.error.MathAsmException
import eu.alkismavridis.mathasm.infrastructure.db.entities.User
import eu.alkismavridis.mathasm.infrastructure.services.App
import graphql.schema.DataFetchingEnvironment


class AuthWSector(private val app:App) {
    fun logout(env: DataFetchingEnvironment): Boolean {
        val session = env.getContext<GraphqlContext>().session
        if (session==null) return false //no session to destroy!

        return app.secService.destroySession(session.sessionKey) != null
    }

    fun login(username:String, password:String, env: DataFetchingEnvironment): LoginResponse {
        val user = app.userService.get(username)

        //1 check user name existence
        if (user==null) throw MathAsmException(ErrorCode.USER_NOT_EXISTS, "User name does not exists")

        //2. check password matching
        if (password != user.password) throw MathAsmException(ErrorCode.WRONG_PASSWORD, "Incorrect password")

        //3. all correct. setup the session and return the user
        val sessionKey = app.secService.createSessionKeyFor(user)
        return LoginResponse(user, sessionKey)
    }

    fun signin(username:String, password:String, env: DataFetchingEnvironment): LoginResponse {
        var user = app.userService.get(username)

        //1 check user name existence
        if (user!=null) throw MathAsmException(ErrorCode.USER_ALREADY_EXISTS, "User name already exists")

        //2. create new user and add to service
        user = app.userService.save( User(username).setPassword(password) )

        //3. all correct. setup the session and return the user
        val sessionKey = app.secService.createSessionKeyFor(user)
        return LoginResponse(user, sessionKey)
    }
}
