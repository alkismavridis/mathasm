package eu.alkismavridis.mathasm.services

import org.junit.*
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.neo4j.util.IterableUtils
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@SpringBootTest
class AppTest {
    //region INJECTIONS
    @Autowired
    lateinit var app: App
    //endregion


    //region SETUP AND CLEAN UP
    @Before
    @Throws(Exception::class)
    fun beforeEvery() {
    }

    @After
    @Throws(Exception::class)
    fun afterEvery() {
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
    fun postConstructTest() {
        //1. Delete all entities. (like the app starts for the first time)
        app.theoryRepo.deleteAll()
        assertEquals(0, app.theoryRepo.count())

        //NOTE: delete more entities here, if needed.

        //2. call post construct
        app.postConstruct()

        //3. Assert that a theory is created.
        val theories = IterableUtils.toList(app.theoryRepo.findAll())
        assertEquals(1, theories.size)
        assertEquals("root", theories[0].name)
        assertNotNull(theories[0].id)
    }
}