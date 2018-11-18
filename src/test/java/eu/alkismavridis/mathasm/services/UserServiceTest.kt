package eu.alkismavridis.mathasm.services

import eu.alkismavridis.mathasm.db.entities.User
import eu.alkismavridis.mathasm.db.entities.UserRights_MAX
import eu.alkismavridis.mathasm.db.repo.UserRepository
import org.junit.*
import org.junit.Assert.*
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.neo4j.util.IterableUtils
import org.springframework.test.context.junit4.SpringRunner
import java.util.stream.Collectors

@RunWith(SpringRunner::class)
@SpringBootTest
class UserServiceTest {
    //region INJECTIONS
    @Autowired
    lateinit var app: App

    @Autowired
    lateinit var userRepo:UserRepository
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
        userRepo.deleteAll()
        app.userService.users.clear()
        assertEquals(0, userRepo.count())
        assertEquals(0, app.userService.users.size)


        //2. call post construct
        app.userService.postConstruct()

        //3. Assert that the root user is created in DB
        val usersFromRepo = IterableUtils.toList(userRepo.findAll())
        assertEquals(1, usersFromRepo.size)
        assertEquals("root", usersFromRepo[0].userName)
        assertTrue(usersFromRepo[0].rights == UserRights_MAX)

        //4. Assert that the root user is created in service
        val usersFromService = app.userService.userStream().collect(Collectors.toList())
        assertEquals(1, usersFromService.size)
        assertEquals("root", usersFromService[0].userName)
        assertTrue(usersFromService[0].rights == UserRights_MAX)
    }


    @Test
    fun crudTest() {
        //1. Start from zero
        app.userService.deleteAll()
        assertEquals(0, userRepo.count())
        assertEquals(0, app.userService.users.size)

        //2. Create a user
        val user1 = app.userService.save(
            User("hello")
        )
        assertNotNull(user1.id)
        assertEquals(1, userRepo.count())
        assertTrue(userRepo.existsById(user1.id!!))
        assertTrue(user1 === app.userService.get(user1.id!!))

        //3. Create one more user
        val user2 = app.userService.save(
                User("world")
        )
        assertNotNull(user2.id)
        assertEquals(2, userRepo.count())
        assertTrue(userRepo.existsById(user2.id!!))
        assertTrue(user2 === app.userService.get(user2.id!!))


        //4. Update user1
        user1.userName = "hello_updated"
        app.userService.save(user1)
        assertEquals(2, userRepo.count())
        assertEquals("hello_updated", userRepo.findById(user1.id!!).get().userName)
        assertEquals("hello_updated", app.userService.get(user1.id!!)!!.userName)

        //5. Delete a user
        app.userService.delete(user1)
        assertEquals(1, userRepo.count())
        assertFalse(userRepo.existsById(user1.id!!))
        assertTrue(userRepo.existsById(user2.id!!)) //this should still be here

        assertEquals(1, app.userService.users.size)
        assertNull(app.userService.get(user1.id!!))
        assertNotNull(app.userService.get(user2.id!!))
    }
    //endregion
}