package eu.alkismavridis.mathasm.api

import com.fasterxml.jackson.databind.ObjectMapper
import eu.alkismavridis.mathasm.db.entities.User
import eu.alkismavridis.mathasm.services.App
import org.junit.*
import org.junit.Assert.*
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@SpringBootTest
class GraphqlServiceTest {
    //region INJECTIONS
    @Autowired
    lateinit var graphqlService: GraphqlService

    @Autowired
    lateinit var app: App
    //endregion


    //region STATE
    var user: User = User("hello")
    //endregion



    //region SETUP AND CLEAN UP
    @Before
    @Throws(Exception::class)
    fun beforeEvery() {
        user = User("hello")
        app.userService.save(user)
    }

    @After
    @Throws(Exception::class)
    fun afterEvery() {
        app.userService.delete(user)
    }


    companion object {
        @BeforeClass
        @Throws(Exception::class)
        fun beforeAll() {
        }

        @AfterClass
        @Throws(Exception::class)
        fun afterAll() {
        }
    }
    //endregion


    //region TESTS
    @Test
    fun checkInitializationTest() {
        assertNotNull(graphqlService.mainSchema)

        //2. Run a simple query
        var result = graphqlService.execute("{languages}", null, null, GraphqlContext(user))
        assertNotNull(result)
        var dataAsJson = ObjectMapper().readTree(result)
        assertTrue(dataAsJson.has("data"))
        assertTrue(dataAsJson.get("data").has("languages"))
        assertTrue(dataAsJson.get("data").get("languages").size() > 0)

        //3. Run a query with parameters
        result = graphqlService.execute(
                "query(\$id:Long!){user(id:\$id) { id } }",
                mapOf(Pair("id", user.id!!)),
                null,
                GraphqlContext(user)
        )
        assertNotNull(result)
        dataAsJson = ObjectMapper().readTree(result)
        assertTrue(dataAsJson.has("data"))
        assertTrue(dataAsJson.get("data").has("user"))
        assertTrue(dataAsJson.get("data").get("user").has("id"))
        assertEquals(user.id!!, dataAsJson.get("data").get("user").get("id").asLong())

        //4. Run named operation
        result = graphqlService.execute(
                "query first(\$id:Long!){user(id:\$id) { id } }\n\n query second { languages }",
                mapOf(Pair("id", user.id!!)),
                "first",
                GraphqlContext(user)
        )
        assertNotNull(result)
        dataAsJson = ObjectMapper().readTree(result)
        assertTrue(dataAsJson.has("data"))
        assertTrue(dataAsJson.get("data").has("user"))
        assertTrue(dataAsJson.get("data").get("user").has("id"))
        assertEquals(user.id!!, dataAsJson.get("data").get("user").get("id").asLong())

        //5. Check that the context is being respected (user should be fetched according to the context)
        result = graphqlService.execute(
                "{user { id } }",
                mapOf(Pair("id", user.id!!)),
                null,
                GraphqlContext(user)
        )
        assertNotNull(result)
        dataAsJson = ObjectMapper().readTree(result)
        assertTrue(dataAsJson.has("data"))
        assertTrue(dataAsJson.get("data").has("user"))
        assertTrue(dataAsJson.get("data").get("user").has("id"))
        assertEquals(user.id!!, dataAsJson.get("data").get("user").get("id").asLong())
    }
    //endregion
}