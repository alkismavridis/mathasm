package eu.alkismavridis.mathasm.api.resolvers

import eu.alkismavridis.mathasm.api.GraphqlContext
import eu.alkismavridis.mathasm.api.types.LoginResponse
import eu.alkismavridis.mathasm.core.error.ErrorCode
import eu.alkismavridis.mathasm.core.error.MathAsmException
import eu.alkismavridis.mathasm.db.entities.User
import eu.alkismavridis.mathasm.services.App
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