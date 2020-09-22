package eu.alkismavridis.mathasm.infrastructure.services

import eu.alkismavridis.mathasm.infrastructure.db.entities.User
import eu.alkismavridis.mathasm.infrastructure.db.repo.UserRepository
import org.junit.*
import org.junit.Assert.*
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner

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
    fun crudTest() {
        //1. Start from zero
        app.userService.deleteAll()
        assertEquals(0, userRepo.count())
        assertEquals(0, app.userService.getAll().size)

        //2. Create a user
        val user1 = app.userService.save(
            User("hello")
        )
        assertNotNull(user1.id)
        assertEquals(1, userRepo.count())
        assertTrue(userRepo.existsById(user1.id!!))
        assertEquals(user1.id, app.userService.get(user1.id!!)!!.id)

        //3. Create one more user
        val user2 = app.userService.save(
                User("world")
        )
        assertNotNull(user2.id)
        assertEquals(2, userRepo.count())
        assertTrue(userRepo.existsById(user2.id!!))
        assertEquals(user2.id, app.userService.get(user2.id!!)!!.id)


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

        assertEquals(1, app.userService.getAll().size)
        assertNull(app.userService.get(user1.id!!))
        assertNotNull(app.userService.get(user2.id!!))
    }
    //endregion
}
