package eu.alkismavridis.mathasm.api.resolvers

import eu.alkismavridis.mathasm.api.test_utils.DummyFetchingEnvironment
import eu.alkismavridis.mathasm.db.entities.MathAsmDirEntity
import eu.alkismavridis.mathasm.db.entities.MathAsmStatementEntity
import eu.alkismavridis.mathasm.db.entities.MathAsmSymbol
import eu.alkismavridis.mathasm.db.entities.User
import eu.alkismavridis.mathasm.db.util_entities.BasicMathAsmState
import eu.alkismavridis.mathasm.services.App
import org.junit.*
import org.junit.Assert.*
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner


@RunWith(SpringRunner::class)
@SpringBootTest
class QueryTest {
    //region INJECTIONS
    @Autowired
    lateinit var app: App

    lateinit var query: Query
    //endregion


    //region SETUP AND CLEAN UP
    @Before
    @Throws(Exception::class)
    fun beforeEvery() {
        query = Query(app)
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
    fun getLanguagesTest() {
        //1. Create an entity
        val langs = query.languages()
        assertTrue(langs.contains("en"))
    }

    @Test
    fun getAllUsersTest() {
        //1. Create a couple of users
        app.userService.deleteAll()
        app.userService.save(User("user1"))
        app.userService.save(User("user2"))
        app.userService.save(User("user3"))

        //1. Create an entity
        val result = query.users(DummyFetchingEnvironment(null))
        assertEquals(3, result.size)
        assertTrue(result.find { u -> u.userName == "user1" } != null)
        assertTrue(result.find { u -> u.userName == "user2" } != null)
        assertTrue(result.find { u -> u.userName == "user3" } != null)
    }

    @Test
    fun getUserTest() {
        //1. Create a couple of users
        app.userService.deleteAll()
        val user1 = app.userService.save(User("user1"))
        val user2 = app.userService.save(User("user2"))
        val user3 = app.userService.save(User("user3"))

        //2. Test getting a user by id
        var result = query.user(user1.id, DummyFetchingEnvironment(user1))
        assertEquals(user1.id, result!!.id)

        result = query.user(user2.id, DummyFetchingEnvironment(user1))
        assertEquals(user2.id, result!!.id)

        result = query.user(user3.id, DummyFetchingEnvironment(user1))
        assertEquals(user3.id, result!!.id)

        //3. Try getting a user that does not exists
        result = query.user(999999L, DummyFetchingEnvironment(user1))
        assertNull(result)


        //4. Try getting the current user of the session
        result = query.user(null, DummyFetchingEnvironment(user1))
        assertEquals(user1.id, result!!.id)

        result = query.user(null, DummyFetchingEnvironment(user2))
        assertEquals(user2.id, result!!.id)

        result = query.user(null, DummyFetchingEnvironment(user3))
        assertEquals(user3.id, result!!.id)
    }

    @Test
    fun getDefaultLanguageTest() {
        assertNotNull(app.conf.defaultLanguage)
        assertEquals(app.conf.defaultLanguage, query.defaultLanguage())
    }
    //endregion



    //region SYMBOL GETTER TESTS
    @Test
    fun symbolGetterTest() {
        val user = app.userService.save(User("testUser"))
        assertNotNull(user.id)

        //1. Create a couple of symbols
        app.symbolRepo.deleteAll()
        val sym1 = app.symbolRepo.save(MathAsmSymbol(user, "sym1", 1))
        val sym2 = app.symbolRepo.save(MathAsmSymbol(user, "sym2", 2))
        val sym3 = app.symbolRepo.save(MathAsmSymbol(user, "sym1_1", 3))
        val sym4 = app.symbolRepo.save(MathAsmSymbol(user, "sym2_1", 4))


        //2. Try getting by range
        var result = query.symbolRange(2, 3)
        assertEquals(2, result.size)
        assertTrue(result.any { s -> s.uid == 2L })
        assertTrue(result.any { s -> s.uid == 3L })

        //3. Try getting by range (include non existing)
        result = query.symbolRange(2, 99)
        assertEquals(3, result.size)
        assertTrue(result.any { s -> s.uid == 2L })
        assertTrue(result.any { s -> s.uid == 3L })
        assertTrue(result.any { s -> s.uid == 4L })

        //4. Try getting by list (include non existing)
        result = query.symbols(listOf<Long>(1,3,99))
        assertEquals(2, result.size)
        assertTrue(result.any { s -> s.uid == 1L })
        assertTrue(result.any { s -> s.uid == 3L })
    }
    //endregion


    //region TREE GETTERS
    @Test
    fun getRootDirTest() {
        //1. Make sure that a clean theory exists
        app.dirRepo.deleteAll()
        app.statementRepo.deleteAll()
        app.theoryRepo.deleteAll()
        app.postConstruct()

        val theory = app.theoryRepo.findAll(5).iterator().next()!!

        //2. Create some dirs in it
        val child1 = MathAsmDirEntity("child1")
        val grandChild1 = MathAsmDirEntity("grandChild1")
        val grandGrandChild = MathAsmDirEntity("grandGrandChild")

        grandChild1.subDirs.add(grandGrandChild)
        child1.subDirs.add(grandChild1)
        child1.subDirs.add(grandChild1)
        theory.rootObj!!.subDirs.add(child1)
        app.dirRepo.save(theory.rootObj, 10)

        assertEquals(4, app.dirRepo.count())

        //3. Get root with depth of zero.
        var result = query.rootDir(0)!!
        assertEquals(theory.rootObj!!.id, result.id)
        assertEquals(0, result.subDirs.size) //depth 0 should not fetch children

        //4. Get root with depth 1
        result = query.rootDir(1)!!
        assertEquals(theory.rootObj!!.id, result.id)
        assertEquals(1, result.subDirs.size)

        assertEquals(child1.id, result.subDirs[0].id)
        assertEquals(0, result.subDirs[0].subDirs.size) //depth 1 should not fetch grand children

        //5. Get root with depth 2
        result = query.rootDir(2)!!
        assertEquals(theory.rootObj!!.id, result.id)
        assertEquals(1, result.subDirs.size)

        assertEquals(child1.id, result.subDirs[0].id)
        assertEquals(1, result.subDirs[0].subDirs.size)

        assertEquals(grandChild1.id, result.subDirs[0].subDirs[0].id)
        assertEquals(0, result.subDirs[0].subDirs[0].subDirs.size) //depth 2 should not fetch grand-grand children
    }


    @Test
    fun getLogicDirTest() {
        //1. Make sure that a clean theory exists
        app.dirRepo.deleteAll()
        app.statementRepo.deleteAll()
        app.theoryRepo.deleteAll()
        app.postConstruct()

        val theory = app.theoryRepo.findAll(5).iterator().next()!!

        //2. Create some dirs in it
        val child1 = MathAsmDirEntity("child1")
        val grandChild1 = MathAsmDirEntity("grandChild1")
        val grandGrandChild = MathAsmDirEntity("grandGrandChild")

        grandChild1.subDirs.add(grandGrandChild)
        child1.subDirs.add(grandChild1)
        child1.subDirs.add(grandChild1)
        theory.rootObj!!.subDirs.add(child1)
        app.dirRepo.save(theory.rootObj, 10)

        assertEquals(4, app.dirRepo.count())

        //3. Get root with depth of zero.
        var result = query.logicDir(theory.rootObj!!.id!!, 0)!!
        assertEquals(theory.rootObj!!.id, result.id)
        assertEquals(0, result.subDirs.size) //depth 0 should not fetch children

        result = query.logicDir(child1.id!!, 0)!!
        assertEquals(child1.id, result.id)
        assertEquals(0, result.subDirs.size) //depth 0 should not fetch children

        result = query.logicDir(grandChild1.id!!, 0)!!
        assertEquals(grandChild1.id, result.id)
        assertEquals(0, result.subDirs.size) //depth 0 should not fetch children


        //4. Get root with depth 1
        result = query.logicDir(child1.id!!, 1)!!
        assertEquals(child1.id, result.id)
        assertEquals(1, result.subDirs.size)

        assertEquals(grandChild1.id, result.subDirs[0].id)
        assertEquals(0, result.subDirs[0].subDirs.size) //depth 1 should not fetch grand children

        //fetch one more...
        result = query.logicDir(grandChild1.id!!, 1)!!
        assertEquals(grandChild1.id, result.id)
        assertEquals(1, result.subDirs.size)

        assertEquals(grandGrandChild.id, result.subDirs[0].id)
        assertEquals(0, result.subDirs[0].subDirs.size) //depth 1 should not fetch grand children

        //5. Get root with depth 2
        result = query.logicDir(child1.id!!, 2)!!
        assertEquals(child1.id!!, result.id)
        assertEquals(1, result.subDirs.size)

        assertEquals(grandChild1.id, result.subDirs[0].id)
        assertEquals(1, result.subDirs[0].subDirs.size)

        assertEquals(grandGrandChild.id, result.subDirs[0].subDirs[0].id)
        assertEquals(0, result.subDirs[0].subDirs[0].subDirs.size) //depth 2 should not fetch grand-grand children

        //6. Try getting a non existing object
        assertNull(query.logicDir(9999L, 2))
    }

    @Test
    fun dirParentTest() {
        app.symbolRepo.deleteAll()
        app.proofRepo.deleteAll()
        app.statementRepo.deleteAll()
        app.dirRepo.deleteAll()
        app.userService.deleteAll()

        val state = BasicMathAsmState(app)


        //1. Get root parent (should return null)
        var result = query.dirParent(state.rootDir.id!!, 0)
        assertNull(result)


        //2. Get with depth zero
        result = query.dirParent(state.dir1.id!!, 0)
        assertEquals(state.rootDir.id, result!!.id)
        assertEquals(0, result.subDirs.size) //depth 0 should not fetch children

        result = query.dirParent(state.dir2.id!!, 0)!!
        assertEquals(state.rootDir.id, result.id)
        assertEquals(0, result.subDirs.size) //depth 0 should not fetch children

        result = query.dirParent(state.dir1_1.id!!, 0)!!
        assertEquals(state.dir1.id, result.id)
        assertEquals(0, result.subDirs.size) //depth 0 should not fetch children

        result = query.dirParent(state.dir1_1_1.id!!, 0)!!
        assertEquals(state.dir1_1.id, result.id)
        assertEquals(0, result.subDirs.size) //depth 0 should not fetch children


        //4. Get root with depth 1
        result = query.dirParent(state.dir1.id!!, 1)!!
        assertEquals(state.rootDir.id, result.id)
        assertEquals(2, result.subDirs.size)

        var objectToTest = result.subDirs.find { it.name == "dir1" }
        assertEquals(state.dir1.id, objectToTest!!.id)
        assertEquals(0, objectToTest.subDirs.size) //depth 1 should not fetch grand children

        result = query.dirParent(state.dir1_1.id!!, 1)!!
        assertEquals(state.dir1.id, result.id)
        assertEquals(1, result.subDirs.size)

        objectToTest = result.subDirs.find { it.name == "dir1_1" }
        assertEquals(state.dir1_1.id, objectToTest!!.id)
        assertEquals(0, objectToTest.subDirs.size) //depth 1 should not fetch grand children

        //5. Get root with depth 2
        result = query.dirParent(state.dir1.id!!, 2)!!
        assertEquals(state.rootDir.id!!, result.id)
        assertEquals(2, result.subDirs.size)

        objectToTest = result.subDirs.find { it.name == "dir1" }
        assertEquals(state.dir1.id, objectToTest!!.id)
        assertEquals(1, objectToTest.subDirs.size)

        objectToTest = objectToTest.subDirs.find { it.name == "dir1_1" }
        assertEquals(state.dir1_1.id, objectToTest!!.id)
        assertEquals(0, objectToTest.subDirs.size) //depth 2 should not fetch grand-grand children

        //6. Try getting a non existing object
        assertNull(query.dirParent(9999L, 2))
    }

    @Test
    fun getStatementTest() {
        //1. Make sure that a clean theory exists
        app.dirRepo.deleteAll()
        app.statementRepo.deleteAll()
        app.theoryRepo.deleteAll()
        app.postConstruct()

        val theory = app.theoryRepo.findAll(5).iterator().next()!!
        val user = app.userService.save(User("hello"))

        //2. Add a couple of statements
        val stmt1 = app.statementRepo.save(
            MathAsmStatementEntity.createAxiom("name1", longArrayOf(1,2,3), longArrayOf(4,5,6), true, 0).withAuthor(user)
        )
        val stmt2 = app.statementRepo.save(
            MathAsmStatementEntity.createAxiom("name2", longArrayOf(1,2,3), longArrayOf(4,5,6), true, 0).withAuthor(user)
        )
        val stmt3 = app.statementRepo.save(
            MathAsmStatementEntity.createAxiom("name3", longArrayOf(1,2,3), longArrayOf(4,5,6), true, 0).withAuthor(user)
        )

        //3. Fetch them from api with depth 0
        var result = query.statement(stmt1.id!!, 0)!!
        assertEquals(stmt1.id, result.id)
        assertNull(result.author) //depth 0 should not fetch the author

        result = query.statement(stmt2.id!!, 0)!!
        assertEquals(stmt2.id, result.id)
        assertNull(result.author) //depth 0 should not fetch the author

        result = query.statement(stmt3.id!!, 0)!!
        assertEquals(stmt3.id, result.id)
        assertNull(result.author) //depth 0 should not fetch the author


        //4. Fetch them from api with depth 1. The author should be also fetched
        result = query.statement(stmt1.id!!, 1)!!
        assertEquals(stmt1.id, result.id)
        assertEquals(user.id, result.author!!.id)

        result = query.statement(stmt2.id!!, 1)!!
        assertEquals(stmt2.id, result.id)
        assertEquals(user.id, result.author!!.id)

        result = query.statement(stmt3.id!!, 1)!!
        assertEquals(stmt3.id, result.id)
        assertEquals(user.id, result.author!!.id)

        //4. Test a non existing statement
        assertNull(query.statement(99999L, 0))
    }
    //endregion
}