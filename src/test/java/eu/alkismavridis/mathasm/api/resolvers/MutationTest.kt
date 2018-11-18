package eu.alkismavridis.mathasm.api.resolvers

import eu.alkismavridis.mathasm.api.test_utils.DummyFetchingEnvironment
import eu.alkismavridis.mathasm.core.error.ErrorCode
import eu.alkismavridis.mathasm.core.error.MathAsmException
import eu.alkismavridis.mathasm.core.proof.*
import eu.alkismavridis.mathasm.core.sentence.MathAsmStatement_BOTH_SIDES
import eu.alkismavridis.mathasm.core.sentence.MathAsmStatement_LEFT_SIDE
import eu.alkismavridis.mathasm.db.entities.*
import eu.alkismavridis.mathasm.services.App
import org.junit.*
import org.junit.Assert.*
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.neo4j.util.IterableUtils
import org.springframework.test.context.junit4.SpringRunner
import java.time.Instant

@RunWith(SpringRunner::class)
@SpringBootTest
class MutationTest {
    //region INJECTIONS
    @Autowired
    lateinit var app: App

    lateinit var mutation: Mutation
    //endregion


    //region FIELDS
    lateinit var user:User
    //endregion


    //region SETUP AND CLEAN UP
    @Before
    @Throws(Exception::class)
    fun beforeEvery() {
        mutation = Mutation(app)
        user = app.userService.save(User("hello")).withRights(UserRights_MAX)
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


    //region SESSION RELATED TESTS
    @Test
    fun loginTest() {
        //TODO
    }

    @Test
    fun logoutTest() {
        //TODO
    }

    @Test
    fun signinTest() {
        //TODO
    }
    //endregion


    //region CREATION TESTS
    @Test
    fun createSymbolTest() {
        //1. Make sure that a clean theory exists
        app.objectRepo.deleteAll()
        app.statementRepo.deleteAll()
        app.theoryRepo.deleteAll()
        app.symbolRepo.deleteAll()
        app.postConstruct()

        //2. Create a symbol
        assertEquals(0, app.symbolRepo.count())
        user.rights = UserRights_MAX

        //assert response
        var result = mutation.createSymbol("   hello   \t", 1, DummyFetchingEnvironment(user))
        assertNotNull(result.id)
        assertEquals(1, result.uid)
        assertEquals("hello", result.text)

        //assert that symbol is persisted in DB
        var symbols = IterableUtils.toList(app.symbolRepo.findAll())
        assertEquals(1, symbols.size)
        assertEquals(1, symbols[0].uid)
        assertEquals("hello", symbols[0].text)

        //3. Create one more...
        result = mutation.createSymbol("\nworld  \r\n \t", 2, DummyFetchingEnvironment(user))
        assertNotNull(result.id)
        assertEquals(2, result.uid)
        assertEquals("world", result.text)

        //check db
        symbols = IterableUtils.toList(app.symbolRepo.findAll())
        symbols.sortWith(compareBy({it.uid}))
        assertEquals(2, symbols.size)
        assertEquals(2, symbols[1].uid)
        assertEquals("world", symbols[1].text)
    }

    @Test
    fun createSymbolFailCases() {
        //1. Make sure that a clean theory exists
        app.objectRepo.deleteAll()
        app.statementRepo.deleteAll()
        app.theoryRepo.deleteAll()
        app.symbolRepo.deleteAll()
        app.postConstruct()

        //2. Null user
        try {
            mutation.createSymbol("hello", 1, DummyFetchingEnvironment(null))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.UNAUTHORIZED, e.code)
            assertEquals("No session.", e.message)
        }

        //3. User without permission to create symbols
        user.rights = UserRights_MIN
        try {
            mutation.createSymbol("hello", 1, DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.UNAUTHORIZED, e.code)
            assertEquals("Not enough rights to create symbols.", e.message)
        }
        user.rights = UserRights_MAX

        //4. Invalid symbol text
        try {
            mutation.createSymbol("", 1, DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.INVALID_SYMBOL_TEXT, e.code)
            assertEquals("Invalid text: \"\".", e.message)
        }

        //5. Existing symbol text
        app.symbolRepo.save(MathAsmSymbol("existing", 1))
        try {
            mutation.createSymbol("existing", 2, DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.SYMBOL_ALREADY_REGISTERED, e.code)
            assertEquals("Symbol with text \"existing\" already registered.", e.message)
        }

        //6. Existing symbol uid
        try {
            mutation.createSymbol("newSymbol", 1, DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.SYMBOL_ALREADY_REGISTERED, e.code)
            assertEquals("Symbol with uid 1 already registered.", e.message)
        }
    }

    @Test
    fun createObjectTest() {
        //1. Make sure that a clean theory exists
        app.objectRepo.deleteAll()
        app.statementRepo.deleteAll()
        app.theoryRepo.deleteAll()
        app.symbolRepo.deleteAll()
        app.postConstruct()

        val theory = app.theoryRepo.findAll().iterator().next()!!

        //2. Create an object
        assertEquals(0, app.symbolRepo.count())
        user.rights = UserRights_MAX

        var result = mutation.createObject(theory.rootObj!!.id!!, "child1", DummyFetchingEnvironment(user))
        assertNotNull(result.id)
        assertEquals("child1", result.name)
        assertEquals(user, result.author)
        assertTrue(Instant.now().epochSecond - result.createdAt!!.epochSecond < 5)

        //assertDB
        var parentObj = app.objectRepo.findById(theory.rootObj!!.id!!, 2).orElse(null)
        assertEquals(1, parentObj.objects.size)
        assertEquals(result.id, parentObj.objects[0].id)
        assertEquals(result.name, parentObj.objects[0].name)
        assertEquals(result.author, parentObj.objects[0].author)
        assertEquals(result.createdAt!!.epochSecond, parentObj.objects[0].createdAt!!.epochSecond)


        //3. Create one more
        result = mutation.createObject(parentObj.objects[0].id!!, "grandChild", DummyFetchingEnvironment(user)) //save the new object under the previous one.
        assertNotNull(result.id)
        assertEquals("grandChild", result.name)
        assertEquals(user, result.author)
        assertTrue(Instant.now().epochSecond - result.createdAt!!.epochSecond < 5)

        //assertDB
        parentObj = app.objectRepo.findById(parentObj.objects[0].id!!, 2).orElse(null)
        assertEquals(1, parentObj.objects.size)
        assertEquals(result.id, parentObj.objects[0].id)
        assertEquals(result.name, parentObj.objects[0].name)
        assertEquals(result.author, parentObj.objects[0].author)
        assertEquals(result.createdAt!!.epochSecond, parentObj.objects[0].createdAt!!.epochSecond)
    }

    @Test
    fun createObjectFailCases() {
        //1. Make sure that a clean theory exists
        app.objectRepo.deleteAll()
        app.statementRepo.deleteAll()
        app.theoryRepo.deleteAll()
        app.symbolRepo.deleteAll()
        app.postConstruct()

        val theory = app.theoryRepo.findAll().iterator().next()!!

        //2. Null user
        try {
            mutation.createObject(theory.rootObj!!.id!!, "child1", DummyFetchingEnvironment(null))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.UNAUTHORIZED, e.code)
            assertEquals("No session.", e.message)
        }

        //3. User without permission to create objects
        user.rights = UserRights_MIN
        try {
            mutation.createObject(theory.rootObj!!.id!!, "child1", DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.UNAUTHORIZED, e.code)
            assertEquals("Not enough rights to create objects.", e.message)
        }
        user.rights = UserRights_MAX

        //4. Non existing parent id
        try {
            mutation.createObject(9999L, "child1", DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.OBJECT_NOT_FOUND, e.code)
            assertEquals("Object with uid 9999 not found.", e.message)
        }
    }

    @Test
    fun createAxiomTest() {
        //1. Make sure that a clean theory exists
        app.objectRepo.deleteAll()
        app.statementRepo.deleteAll()
        app.theoryRepo.deleteAll()
        app.symbolRepo.deleteAll()
        app.postConstruct()

        val theory = app.theoryRepo.findAll().iterator().next()!!

        //2. Create an object
        assertEquals(0, app.symbolRepo.count())
        user.rights = UserRights_MAX

        var result = mutation.createAxiom(theory.rootObj!!.id!!, "stmt1", listOf(1L,2L,3L), 2, false, listOf(8L,9L), DummyFetchingEnvironment(user))
        assertNotNull(result.id)
        assertEquals("stmt1", result.name)
        assertEquals(user, result.author)
        assertTrue(Instant.now().epochSecond - result.createdAt!!.epochSecond < 5)
        assertEquals(2.toShort(), result.grade)
        assertFalse(result.bidirectionalFlag)
        assertArrayEquals(longArrayOf(1L,2L,3L), result.sen1.getWords())
        assertArrayEquals(longArrayOf(8L,9L), result.sen2.getWords())

        //assertDB
        var fromDB = app.statementRepo.findById(result.id!!, 1).orElse(null)
        assertEquals(result.id, fromDB.id)
        assertEquals(result.name, fromDB.name)
        assertEquals(result.author, fromDB.author)
        assertEquals(result.createdAt!!.epochSecond, fromDB.createdAt!!.epochSecond)
        assertEquals(result.grade, fromDB.grade)
        assertEquals(result.bidirectionalFlag, fromDB.bidirectionalFlag)
        assertArrayEquals(result.sen1.getWords(), fromDB.sen1.getWords())
        assertArrayEquals(result.sen2.getWords(), fromDB.sen2.getWords())


        //3. Create one more
        result = mutation.createAxiom(theory.rootObj!!.id!!, "stmt2", listOf(7L,8L,9L), 55, true, listOf(3L,3L), DummyFetchingEnvironment(user))
        assertNotNull(result.id)
        assertEquals("stmt2", result.name)
        assertEquals(user, result.author)
        assertTrue(Instant.now().epochSecond - result.createdAt!!.epochSecond < 5)
        assertEquals(55.toShort(), result.grade)
        assertTrue(result.bidirectionalFlag)
        assertArrayEquals(longArrayOf(7L,8L,9L), result.sen1.getWords())
        assertArrayEquals(longArrayOf(3L,3L), result.sen2.getWords())

        //assertDB
        fromDB = app.statementRepo.findById(result.id!!, 1).orElse(null)
        assertEquals(result.id, fromDB.id)
        assertEquals(result.name, fromDB.name)
        assertEquals(result.author, fromDB.author)
        assertEquals(result.createdAt!!.epochSecond, fromDB.createdAt!!.epochSecond)
        assertEquals(result.grade, fromDB.grade)
        assertEquals(result.bidirectionalFlag, fromDB.bidirectionalFlag)
        assertArrayEquals(result.sen1.getWords(), fromDB.sen1.getWords())
        assertArrayEquals(result.sen2.getWords(), fromDB.sen2.getWords())
    }

    @Test
    fun createAxiomFailCases() {
        //1. Make sure that a clean theory exists
        app.objectRepo.deleteAll()
        app.statementRepo.deleteAll()
        app.theoryRepo.deleteAll()
        app.symbolRepo.deleteAll()
        app.postConstruct()

        val theory = app.theoryRepo.findAll().iterator().next()!!

        //2. Null user
        try {
            mutation.createAxiom(theory.rootObj!!.id!!, "stmt2", listOf(7L,8L,9L), 55, true, listOf(3L,3L), DummyFetchingEnvironment(null))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.UNAUTHORIZED, e.code)
            assertEquals("No session.", e.message)
        }

        //3. User without permission to create objects
        user.rights = UserRights_MIN
        try {
            mutation.createAxiom(theory.rootObj!!.id!!, "stmt2", listOf(7L,8L,9L), 55, true, listOf(3L,3L), DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.UNAUTHORIZED, e.code)
            assertEquals("Not enough rights to create axioms.", e.message)
        }
        user.rights = UserRights_MAX

        //4. Non existing parent id
        try {
            mutation.createAxiom(99999L, "stmt2", listOf(7L,8L,9L), 55, true, listOf(3L,3L), DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.OBJECT_NOT_FOUND, e.code)
            assertEquals("Object with uid 99999 not found.", e.message)
        }
    }
    //endregion


    //region THEOREM CREATION TESTS
    @Test
    fun createTheorem1Test() {
        //1. Make sure that a clean theory exists
        app.objectRepo.deleteAll()
        app.statementRepo.deleteAll()
        app.theoryRepo.deleteAll()
        app.symbolRepo.deleteAll()
        app.postConstruct()

        val theory = app.theoryRepo.findAll().iterator().next()!!


        //2. Create a couple of axioms
        val stmt1 = app.statementRepo.save(
            MathAsmStatementEntity.createAxiom("name1", longArrayOf(1,2,3), longArrayOf(4), true, 0).withAuthor(user)
        )
        val stmt2 = app.statementRepo.save(
            MathAsmStatementEntity.createAxiom("name2", longArrayOf(1,2), longArrayOf(99, 101), true, 0).withAuthor(user)
        )
        val stmt3 = app.statementRepo.save(
            MathAsmStatementEntity.createAxiom("name3", longArrayOf(500, 501, 502), longArrayOf(4), true, 0).withAuthor(user)
        )

        //3. Prepare a theorem proof
        val moves = mutableListOf<LogicMoveEntity>()
        //start with stmt1:      1 2 3 __0__ 4
        moves.add(LogicMoveEntity.makeExtSelect(stmt1.id!!))
        moves.add(LogicMoveEntity.makeStart(0, MathAsmStatement_BOTH_SIDES))

        //replace with stmt2:      99 101 3 __0__ 4
        moves.add(LogicMoveEntity.makeExtSelect(stmt2.id!!))
        moves.add(LogicMoveEntity.makeReplaceAll(0, LogicMove_LTR))

        //replace with stmt3:      99 101 3 __0__ 500, 501, 502
        moves.add(LogicMoveEntity.makeExtSelect(stmt3.id!!))
        moves.add(LogicMoveEntity.makeReplaceAll(0, LogicMove_RTL))

        //save
        moves.add(LogicMoveEntity.makeSave(0, theory.rootObj!!.id!!, "dummyTheorem"))

        //4. Make the request
        val result = mutation.createTheorem(moves, DummyFetchingEnvironment(user))


        //5. Assert result
        //TODO assert result

        //6. Assert statement
        val obj = app.objectRepo.findById(theory.rootObj!!.id!!, 3).orElse(null)
        assertEquals(1, obj.statements.size)
        assertNotNull(obj.statements[0].id)
        assertEquals("dummyTheorem", obj.statements[0].name)
        assertEquals(user, obj.statements[0].author)
        assertTrue(Instant.now().epochSecond - obj.statements[0].createdAt!!.epochSecond < 5)
        assertEquals(0.toShort(), obj.statements[0].grade)
        assertTrue(obj.statements[0].bidirectionalFlag)
        assertArrayEquals(longArrayOf(99L, 101L, 3L), obj.statements[0].sen1.getWords())
        assertArrayEquals(longArrayOf(500L, 501L, 502L), obj.statements[0].sen2.getWords())

        //7. Assert proof
        val proofFromDb = obj.statements[0].proof!!
        assertNotNull(proofFromDb)
        assertNotNull(proofFromDb.id)
        assertEquals(moves.size, proofFromDb.moves.size)
        for (mv in proofFromDb.moves) assertNotNull(mv.id)
    }


    //TODO : many tests should be done here
    //endregion


    //region THEOREM CREATION FAIL CASES
    @Test
    fun createTheorem1FailCases() {
        //1. Make sure that a clean theory exists
        app.objectRepo.deleteAll()
        app.statementRepo.deleteAll()
        app.theoryRepo.deleteAll()
        app.symbolRepo.deleteAll()
        app.postConstruct()

        val theory = app.theoryRepo.findAll().iterator().next()!!


        //2. Create a couple of axioms
        val stmt1 = app.statementRepo.save(
                MathAsmStatementEntity.createAxiom("name1", longArrayOf(1,2,3), longArrayOf(4), true, 0).withAuthor(user)
        )
        val stmt2 = app.statementRepo.save(
                MathAsmStatementEntity.createAxiom("name2", longArrayOf(1,2), longArrayOf(99, 101), true, 0).withAuthor(user)
        )
        val stmt3 = app.statementRepo.save(
                MathAsmStatementEntity.createAxiom("name3", longArrayOf(500, 501, 502), longArrayOf(4), true, 0).withAuthor(user)
        )

        //3. Prepare a theorem proof
        val moves = mutableListOf<LogicMoveEntity>()
        //start with stmt1:      1 2 3 __0__ 4
        moves.add(LogicMoveEntity.makeExtSelect(stmt1.id!!))
        moves.add(LogicMoveEntity.makeStart(0, MathAsmStatement_BOTH_SIDES))

        //replace with stmt2:      99 101 3 __0__ 4
        moves.add(LogicMoveEntity.makeExtSelect(stmt2.id!!))
        moves.add(LogicMoveEntity.makeReplaceAll(0, LogicMove_LTR))

        //replace with stmt3:      99 101 3 __0__ 500, 501, 502
        moves.add(LogicMoveEntity.makeExtSelect(stmt3.id!!))
        moves.add(LogicMoveEntity.makeReplaceAll(0, LogicMove_RTL))

        //save
        moves.add(LogicMoveEntity.makeSave(0, theory.rootObj!!.id!!, "dummyTheorem"))


        //4. Null user
        try {
            mutation.createTheorem(moves, DummyFetchingEnvironment(null))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.UNAUTHORIZED, e.code)
            assertEquals("No session.", e.message)
        }

        //5. User without permission to create objects
        user.rights = UserRights_MIN
        try {
            mutation.createTheorem(moves, DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.UNAUTHORIZED, e.code)
            assertEquals("Not enough rights to create theorems.", e.message)
        }
        user.rights = UserRights_MAX


        //6. Test invalid move (non existing parent id on save)
        moves.find{ e -> e.moveType == LOGIC_MOVE_SAVE}!!.parentId = 9999L
        try {
            mutation.createTheorem(moves, DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.OBJECT_NOT_FOUND, e.code)
            assertEquals("Object with id 9999 not found.", e.message)
        }
        moves.find{ e -> e.moveType == LOGIC_MOVE_SAVE}!!.parentId = theory.rootObj!!.id!!

        //7. Test invalid move
        moves[3] = LogicMoveEntity.makeReplaceOne(0, MathAsmStatement_LEFT_SIDE, LogicMove_LTR, 999)
        try {
            mutation.createTheorem(moves, DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.MATCH_FAILED, e.code)
        }
        moves[3] = LogicMoveEntity.makeReplaceAll(0, LogicMove_RTL)
    }
    //endregion
}