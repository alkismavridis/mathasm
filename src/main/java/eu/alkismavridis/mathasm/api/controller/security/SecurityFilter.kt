package eu.alkismavridis.mathasm.api.controller.security

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import java.io.IOException
import javax.servlet.*
import javax.servlet.http.HttpServletRequest

@Component
@Order(1)
class SecurityFilter : Filter {
    //region DEPENDENCIES
    @Autowired
    lateinit var secService:SecurityService
    //endregion



    //region LIFE CYCLE
    override fun init(p0: FilterConfig?) {
        println("Initializing filter :{}")

        //TODO setup batch runner to remove old sessions.
    }

    override fun destroy() {
        println("Destroying filter :{}")
    }
    //endregion



    private fun getSessionKey(request:ServletRequest) : String? {
        if (request !is HttpServletRequest) return null
        return request.getHeader("Authorization")
    }



    @Throws(IOException::class, ServletException::class)
    override fun doFilter(request: ServletRequest, response: ServletResponse, chain: FilterChain) {
        //1. Get the session from security service
        val sessionKey = getSessionKey(request)
        val session = if (sessionKey==null) null else secService.get(sessionKey)

        //2. Bind it to the request object
        if (session!=null) {
            session.refresh()
            request.setAttribute("session", session)
        }

        //3. continues the chain.
        chain.doFilter(request, response)
    }
}