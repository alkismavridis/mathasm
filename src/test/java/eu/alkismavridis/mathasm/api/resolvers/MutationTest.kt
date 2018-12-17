package eu.alkismavridis.mathasm.api.resolvers

import eu.alkismavridis.mathasm.api.controller.security.SecurityService
import eu.alkismavridis.mathasm.api.test_utils.DummyFetchingEnvironment
import eu.alkismavridis.mathasm.core.error.ErrorCode
import eu.alkismavridis.mathasm.core.error.MathAsmException
import eu.alkismavridis.mathasm.core.proof.*
import eu.alkismavridis.mathasm.core.sentence.MathAsmStatement_BOTH_SIDES
import eu.alkismavridis.mathasm.core.sentence.MathAsmStatement_LEFT_SIDE
import eu.alkismavridis.mathasm.db.entities.*
import eu.alkismavridis.mathasm.db.util_entities.BasicMathAsmState
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

    @Autowired
    lateinit var secService:SecurityService

    lateinit var mutation: Mutation
    //endregion


    //region FIELDS
    lateinit var user:User
    //endregion


    //region SETUP AND CLEAN UP
    @Before
    @Throws(Exception::class)
    fun beforeEvery() {
        mutation = Mutation(app, secService)
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
        app.dirRepo.deleteAll()
        app.statementRepo.deleteAll()
        app.theoryRepo.deleteAll()
        app.symbolRepo.deleteAll()
        app.postConstruct()

        val th = app.theoryRepo.findAll().iterator().next()
        assertNotNull(th)

        //2. Create a symbol
        assertEquals(0, app.symbolRepo.count())
        user.rights = UserRights_MAX

        //assert response
        var result = mutation.createSymbol(th.rootObj!!.id!!, "   hello   \t", 1, DummyFetchingEnvironment(user))
        assertNotNull(result.id)
        assertEquals(1, result.uid)
        assertEquals("hello", result.text)
        assertEquals(user.id, result.author!!.id)
        assertTrue(Instant.now().epochSecond - result.createdAt!!.epochSecond < 5)


        //assert that symbol is persisted in DB
        var fromDb = IterableUtils.toList(app.symbolRepo.findAll())
        assertEquals(1, fromDb.size)
        assertEquals(1, fromDb[0].uid)
        assertEquals("hello", fromDb[0].text)
        assertEquals(user.id, fromDb[0].author!!.id)
        assertEquals(result.createdAt!!.toEpochMilli(), fromDb[0].createdAt!!.toEpochMilli())
        assertEquals(result.id, fromDb[0].id)

        var rootObjFromDb = app.dirRepo.findById(th.rootObj!!.id, 3).orElse(null)
        assertEquals(1, rootObjFromDb.symbols.size)
        assertEquals(result.id, rootObjFromDb.symbols[0].id)

        //3. Create one more...
        result = mutation.createSymbol(th.rootObj!!.id!!, "\nworld  \r\n \t", 2, DummyFetchingEnvironment(user))
        assertNotNull(result.id)
        assertEquals(2, result.uid)
        assertEquals("world", result.text)
        assertEquals(user.id, result.author!!.id)
        assertTrue(Instant.now().epochSecond - result.createdAt!!.epochSecond < 5)

        //check db
        fromDb = IterableUtils.toList(app.symbolRepo.findAll())
        fromDb.sortWith(compareBy({it.uid}))
        assertEquals(2, fromDb.size)
        assertEquals(2, fromDb[1].uid)
        assertEquals("world", fromDb[1].text)
        assertEquals(user.id, fromDb[1].author!!.id)
        assertEquals(result.createdAt!!.toEpochMilli(), fromDb[1].createdAt!!.toEpochMilli())
        assertEquals(result.id, fromDb[1].id)

        rootObjFromDb = app.dirRepo.findById(th.rootObj!!.id, 3).orElse(null)
        assertEquals(2, rootObjFromDb.symbols.size)
        assertTrue(rootObjFromDb.symbols.any{ it.uid == result.uid })
    }

    @Test
    fun createSymbolFailCases() {
        //1. Make sure that a clean theory exists
        app.dirRepo.deleteAll()
        app.statementRepo.deleteAll()
        app.theoryRepo.deleteAll()
        app.symbolRepo.deleteAll()
        app.postConstruct()

        val th = app.theoryRepo.findAll().iterator().next()
        assertNotNull(th)

        val user = app.userService.save(User("testUser"))
        assertNotNull(user.id)


        //2. Null user
        try {
            mutation.createSymbol(th.rootObj!!.id!!, "hello", 1, DummyFetchingEnvironment(null))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.UNAUTHORIZED, e.code)
            assertEquals("No session.", e.message)
        }

        //3. User without permission to create symbols
        user.rights = UserRights_MIN
        try {
            mutation.createSymbol(th.rootObj!!.id!!, "hello", 1, DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.FORBIDDEN, e.code)
            assertEquals("Not enough rights to create symbols.", e.message)
        }
        user.rights = UserRights_MAX

        //4. Invalid symbol text
        try {
            mutation.createSymbol(th.rootObj!!.id!!, "", 1, DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.INVALID_SYMBOL_TEXT, e.code)
            assertEquals("Invalid text: \"\".", e.message)
        }

        //5. Existing symbol text
        app.symbolRepo.save(MathAsmSymbol(user, "existing", 1))
        try {
            mutation.createSymbol(th.rootObj!!.id!!, "existing", 2, DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.SYMBOL_TEXT_ALREADY_REGISTERED, e.code)
            assertEquals("Symbol with text \"existing\" already registered.", e.message)
        }

        //6. Existing symbol uid
        try {
            mutation.createSymbol(th.rootObj!!.id!!, "newSymbol", 1, DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.SYMBOL_UID_ALREADY_REGISTERED, e.code)
            assertEquals("Symbol with uid 1 already registered.", e.message)
        }

        //7. Non existing parent id
        try {
            mutation.createSymbol(9999L, "newSymbol", 2, DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.OBJECT_NOT_FOUND, e.code)
            assertEquals("Object with uid 9999 not found.", e.message)
        }
    }

    @Test
    fun createDirTest() {
        //1. Make sure that a clean theory exists
        app.dirRepo.deleteAll()
        app.statementRepo.deleteAll()
        app.theoryRepo.deleteAll()
        app.symbolRepo.deleteAll()
        app.postConstruct()

        val theory = app.theoryRepo.findAll().iterator().next()!!

        //2. Create an object
        assertEquals(0, app.symbolRepo.count())
        user.rights = UserRights_MAX

        var result = mutation.createDir(theory.rootObj!!.id!!, "child1", DummyFetchingEnvironment(user))
        assertNotNull(result.id)
        assertEquals("child1", result.name)
        assertEquals(user, result.author)
        assertTrue(Instant.now().epochSecond - result.createdAt!!.epochSecond < 5)

        //assertDB
        var parentObj = app.dirRepo.findById(theory.rootObj!!.id!!, 2).orElse(null)
        assertEquals(1, parentObj.subDirs.size)
        assertEquals(result.id, parentObj.subDirs[0].id)
        assertEquals(result.name, parentObj.subDirs[0].name)
        assertEquals(result.author, parentObj.subDirs[0].author)
        assertEquals(result.createdAt!!.epochSecond, parentObj.subDirs[0].createdAt!!.epochSecond)


        //3. Create one more
        result = mutation.createDir(parentObj.subDirs[0].id!!, "grandChild", DummyFetchingEnvironment(user)) //save the new object under the previous one.
        assertNotNull(result.id)
        assertEquals("grandChild", result.name)
        assertEquals(user, result.author)
        assertTrue(Instant.now().epochSecond - result.createdAt!!.epochSecond < 5)

        //assertDB
        parentObj = app.dirRepo.findById(parentObj.subDirs[0].id!!, 2).orElse(null)
        assertEquals(1, parentObj.subDirs.size)
        assertEquals(result.id, parentObj.subDirs[0].id)
        assertEquals(result.name, parentObj.subDirs[0].name)
        assertEquals(result.author, parentObj.subDirs[0].author)
        assertEquals(result.createdAt!!.epochSecond, parentObj.subDirs[0].createdAt!!.epochSecond)
    }

    @Test
    fun createDirFailCases() {
        //1. Make sure that a clean theory exists
        app.dirRepo.deleteAll()
        app.statementRepo.deleteAll()
        app.theoryRepo.deleteAll()
        app.symbolRepo.deleteAll()
        app.postConstruct()

        val theory = app.theoryRepo.findAll().iterator().next()!!

        //2. Null user
        try {
            mutation.createDir(theory.rootObj!!.id!!, "child1", DummyFetchingEnvironment(null))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.UNAUTHORIZED, e.code)
            assertEquals("No session.", e.message)
        }

        //3. User without permission to create dirs
        user.rights = UserRights_MIN
        try {
            mutation.createDir(theory.rootObj!!.id!!, "child1", DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.FORBIDDEN, e.code)
            assertEquals("Not enough rights to create dirs.", e.message)
        }
        user.rights = UserRights_MAX

        //4. Non existing parent id
        try {
            mutation.createDir(9999L, "child1", DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.OBJECT_NOT_FOUND, e.code)
            assertEquals("Object with uid 9999 not found.", e.message)
        }

        //5. Save with a name of an existing object
        val state = BasicMathAsmState(app)
        try {
            mutation.createDir(state.dir1_1.id!!, "dir1_1_1", DummyFetchingEnvironment(user))
            fail("Exception was not thrown")
        }
        catch (e: MathAsmException) {
            assertEquals(ErrorCode.NAME_ALREADY_EXISTS, e.code)
            assertEquals("Name  \"dir1_1_1\" already exists.", e.message)
        }

        //6. Save with a name of an existing statement
        try {
            mutation.createDir(state.dir1_1.id!!, "stmt1_1a", DummyFetchingEnvironment(user))
            fail("Exception was not thrown")
        }
        catch (e: MathAsmException) {
            assertEquals(ErrorCode.NAME_ALREADY_EXISTS, e.code)
            assertEquals("Name  \"stmt1_1a\" already exists.", e.message)
        }
    }

    @Test
    fun createAxiomTest() {
        //1. Make sure that a clean theory exists
        app.dirRepo.deleteAll()
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
        app.dirRepo.deleteAll()
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

        //3. User without permission to create dirs
        user.rights = UserRights_MIN
        try {
            mutation.createAxiom(theory.rootObj!!.id!!, "stmt2", listOf(7L,8L,9L), 55, true, listOf(3L,3L), DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.FORBIDDEN, e.code)
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

        //5. Save with a name of an existing object
        val state = BasicMathAsmState(app)
        try {
            mutation.createAxiom(state.dir1_1.id!!, "dir1_1_1",  listOf(7L,8L,9L), 55, true, listOf(3L,3L), DummyFetchingEnvironment(user))
            fail("Exception was not thrown")
        }
        catch (e: MathAsmException) {
            assertEquals(ErrorCode.NAME_ALREADY_EXISTS, e.code)
            assertEquals("Name  \"dir1_1_1\" already exists.", e.message)
        }

        //6. Save with a name of an existing statement
        try {
            mutation.createAxiom(state.dir1_1.id!!, "stmt1_1a",  listOf(7L,8L,9L), 55, true, listOf(3L,3L), DummyFetchingEnvironment(user))
            fail("Exception was not thrown")
        }
        catch (e: MathAsmException) {
            assertEquals(ErrorCode.NAME_ALREADY_EXISTS, e.code)
            assertEquals("Name  \"stmt1_1a\" already exists.", e.message)
        }


        //7. Try saving empty left sentence
        try {
            mutation.createAxiom(state.dir1_1.id!!, "stmt1_1a",  listOf(), 55, true, listOf(3L,3L), DummyFetchingEnvironment(user))
            fail("Exception was not thrown")
        }
        catch (e: MathAsmException) {
            assertEquals(ErrorCode.ILLEGAL_AXIOM, e.code)
            assertEquals("Sentences of an axiom cannot be empty.", e.message)
        }

        //8. Try saving empty left sentence
        try {
            mutation.createAxiom(state.dir1_1.id!!, "stmt1_1a",  listOf(1L, 2L), 55, true, listOf(), DummyFetchingEnvironment(user))
            fail("Exception was not thrown")
        }
        catch (e: MathAsmException) {
            assertEquals(ErrorCode.ILLEGAL_AXIOM, e.code)
            assertEquals("Sentences of an axiom cannot be empty.", e.message)
        }
    }
    //endregion


    //region THEOREM CREATION TESTS
    @Test
    fun createTheorem1Test() {
        //1. Make sure that a clean theory exists
        app.dirRepo.deleteAll()
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
        val obj = app.dirRepo.findById(theory.rootObj!!.id!!, 3).orElse(null)
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
        app.dirRepo.deleteAll()
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

        //5. User without permission to create dirs
        user.rights = UserRights_MIN
        try {
            mutation.createTheorem(moves, DummyFetchingEnvironment(user))
            fail("Exception was not thrown!")
        }
        catch (e:MathAsmException) {
            assertEquals(ErrorCode.FORBIDDEN, e.code)
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

        //5. Save with a name of an existing object
        val state = BasicMathAsmState(app)
        try {
            moves.find{ e -> e.moveType == LOGIC_MOVE_SAVE}!!.apply {
                name = "dir1_1_1"
                parentId = state.dir1_1.id!!
            }
            mutation.createTheorem(moves, DummyFetchingEnvironment(user))
            fail("Exception was not thrown")
        }
        catch (e: MathAsmException) {
            assertEquals(ErrorCode.NAME_ALREADY_EXISTS, e.code)
            assertEquals("Name  \"dir1_1_1\" already exists.", e.message)
        }

        //6. Save with a name of an existing statement
        try {
            moves.find{ e -> e.moveType == LOGIC_MOVE_SAVE}!!.apply {
                name = "stmt1_1a"
                parentId = state.dir1_1.id!!
            }
            mutation.createTheorem(moves, DummyFetchingEnvironment(user))
            fail("Exception was not thrown")        }
        catch (e: MathAsmException) {
            assertEquals(ErrorCode.NAME_ALREADY_EXISTS, e.code)
            assertEquals("Name  \"stmt1_1a\" already exists.", e.message)
        }
    }
    //endregion
}