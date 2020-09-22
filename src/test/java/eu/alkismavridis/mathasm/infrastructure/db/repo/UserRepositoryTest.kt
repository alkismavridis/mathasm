package eu.alkismavridis.mathasm.infrastructure.db.repo

import eu.alkismavridis.mathasm.infrastructure.db.entities.User
import org.junit.*
import org.junit.Assert.*
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@SpringBootTest
class UserRepositoryTest {
    //region INJECTIONS
    @Autowired
    lateinit var userRepo: UserRepository
    //endregion




    //region SETUP AND CLEAN UP
    @Before
    @Throws(Exception::class)
    fun beforeEvery() {
        userRepo.deleteAll()
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
    fun findByUserNameTest() {
        //1. Persist a user
        val user = User("someUserName")
        userRepo.save(user, -1)
        assertNotNull(user.id)

        //2. Get the user by username
        assertEquals(user.id, userRepo.findByUserName("someUserName").id)

        //3. Check non existing user name
        assertNull(userRepo.findByUserName("iDoNotExist"))
    }
    //endregion
}
