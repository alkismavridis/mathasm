package eu.alkismavridis.mathasm.services

import eu.alkismavridis.mathasm.db.entities.UserRights_MAX
import eu.alkismavridis.mathasm.db.repo.UserRepository
import org.junit.*
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.neo4j.util.IterableUtils
import org.springframework.test.context.junit4.SpringRunner
import java.util.stream.Collectors

@RunWith(SpringRunner::class)
@SpringBootTest
class AppTest {
    //region INJECTIONS
    @Autowired
    lateinit var app: App

    @Autowired
    lateinit var userRepo: UserRepository
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
        app.userService.deleteAll()
        assertEquals(0, app.theoryRepo.count())

        //NOTE: delete more entities here, if needed.

        //2. call post construct
        app.postConstruct()

        //3. Assert that the root user is created in DB
        val usersFromRepo = IterableUtils.toList(userRepo.findAll())
        assertEquals(1, usersFromRepo.size)
        assertEquals("root", usersFromRepo[0].userName)
        Assert.assertTrue(usersFromRepo[0].rights == UserRights_MAX)

        //4. Assert that the root user is created in service
        val usersFromService = app.userService.userStream().collect(Collectors.toList())
        assertEquals(1, usersFromService.size)
        assertEquals("root", usersFromService[0].userName)
        Assert.assertTrue(usersFromService[0].rights == UserRights_MAX)

        //5. Assert that a theory is created.
        val theories = IterableUtils.toList(app.theoryRepo.findAll(3))
        assertEquals(1, theories.size)
        assertEquals("root", theories[0].name)
        assertNotNull(theories[0].id)
        assertEquals(app.userService.find{u -> u.userName == "root"}!!.id, theories[0].rootObj!!.author!!.id)
    }
}