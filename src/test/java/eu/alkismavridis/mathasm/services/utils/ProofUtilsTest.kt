package eu.alkismavridis.mathasm.services.utils

import eu.alkismavridis.mathasm.api.types.SavedTheoremInfo
import eu.alkismavridis.mathasm.core.error.ErrorCode
import eu.alkismavridis.mathasm.core.error.MathAsmException
import eu.alkismavridis.mathasm.core.sentence.*
import eu.alkismavridis.mathasm.db.entities.MathAsmDirEntity
import eu.alkismavridis.mathasm.db.entities.MathAsmStatementEntity
import eu.alkismavridis.mathasm.db.entities.User
import eu.alkismavridis.mathasm.db.util_entities.BasicMathAsmState
import eu.alkismavridis.mathasm.services.App
import org.junit.*
import org.junit.Assert.*
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner
import java.time.Instant

@RunWith(SpringRunner::class)
@SpringBootTest
class ProofUtilsTest {
    //region INJECTIONS
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
//    @Test
//    fun toLogicMoveTest() {
//        //1. Test Internal select move
//        var move = ProofUtils.toLogicMove(LogicMoveEntity(0, LOGIC_MOVE_INT_SELECT, 5, 0, 0, 0, 0, 0, ""))
//        assertTrue(move is InternalSelectMove)
//        assertEquals(5, (move as InternalSelectMove).targetId)
//
//        //2. Test External select move
//        move = ProofUtils.toLogicMove(LogicMoveEntity(0, LOGIC_MOVE_EXT_SELECT, 0, 60, 0, 0, 0, 0, ""))
//        assertTrue(move is ExternalSelectMove)
//        assertEquals(60, (move as ExternalSelectMove).id)
//
//        //3. Test Start move
//        move = ProofUtils.toLogicMove(LogicMoveEntity(0, LOGIC_MOVE_START, 123, 0, MathAsmStatement_BOTH_SIDES, 0, 0, 0, ""))
//        assertTrue(move is StartMove)
//        assertEquals(123, (move as StartMove).targetId)
//        assertEquals(MathAsmStatement_BOTH_SIDES, move.side)
//
//        //4. Test replace all move
//        move = ProofUtils.toLogicMove(LogicMoveEntity(0, LOGIC_MOVE_REPLACE_ALL, 777, 0, 0, BaseDirection_RTL, 0, 0, ""))
//        assertTrue(move is ReplaceAllMove)
//        assertEquals(777, (move as ReplaceAllMove).targetId)
//        assertEquals(BaseDirection_RTL, move.dir)
//
//        //5. Test replace sentence move
//        move = ProofUtils.toLogicMove(LogicMoveEntity(0, LOGIC_MOVE_REPLACE_SENTENCE, 2362, 0, MathAsmStatement_RIGHT_SIDE, BaseDirection_LTR, 0, 0, ""))
//        assertTrue(move is ReplaceSentenceMove)
//        assertEquals(2362, (move as ReplaceSentenceMove).targetId)
//        assertEquals(BaseDirection_LTR, move.dir)
//        assertEquals(MathAsmStatement_RIGHT_SIDE, move.side)
//
//        //6. Test replace one move
//        move = ProofUtils.toLogicMove(LogicMoveEntity(0, LOGIC_MOVE_REPLACE_ONE, 333, 0, MathAsmStatement_LEFT_SIDE, BaseDirection_RTL, 9979, 0, ""))
//        assertTrue(move is ReplaceOneMove)
//        assertEquals(333, (move as ReplaceOneMove).targetId)
//        assertEquals(BaseDirection_RTL, move.dir)
//        assertEquals(MathAsmStatement_LEFT_SIDE, move.side)
//        assertEquals(9979, move.position)
//
//        //7. Test save move
//        move = ProofUtils.toLogicMove(LogicMoveEntity(0, LOGIC_MOVE_SAVE, 67, 0, 0, 0, 0, 242, "spiral"))
//        assertTrue(move is SaveMove)
//        assertEquals(67, (move as SaveMove).targetId)
//        assertEquals(242, move.parentId)
//        assertEquals("spiral", move.name)
//
//        //8. Test unknown move
//        try {
//            ProofUtils.toLogicMove(LogicMoveEntity(0, 99, 67, 0, 0, 0, 0, 242, "spiral"))
//            fail("Exception wan not thrown")
//        }
//        catch (e: MathAsmException) {
//            assertEquals(ErrorCode.UNKNOWN_MOVE, e.code)
//            assertEquals("Unknown move was detected: 99", e.message)
//        }
//    }

    @Test
    fun persistTheoremTest() {
        val theoremList = mutableListOf<SavedTheoremInfo>()

        //1. Clean up existing db entities
        app.statementRepo.deleteAll()
        app.dirRepo.deleteAll()

        //2. Create a parent object
        val obj = app.dirRepo.save(MathAsmDirEntity("root"))
        assertNotNull(obj.id)

        //3. Save a theorem
        val stmt = MathAsmStatementEntity.createAxiom("", longArrayOf(1,2,3), longArrayOf(4,5,6), true, 0)
        ProofUtils.persistTheorem(theoremList, stmt, obj.id!!, "someName", user, app)

        //4. Check that the theorem is persisted.
        val objRefetched = app.dirRepo.findById(obj.id!!, 2).orElse(null)
        assertEquals(1, objRefetched.statements.size)

        assertNotNull(objRefetched.statements[0].id)
        assertEquals(user.id, objRefetched.statements[0].author!!.id)
        assertEquals("someName", objRefetched.statements[0].name)
        assertTrue(Instant.now().epochSecond - objRefetched.statements[0].createdAt!!.epochSecond < 5) //this checks that the statement was created less than 5 seconds ago.

        //5. Assert that the clone was appended on the list
        assertEquals(objRefetched.statements[0].id, theoremList[0].theorem.id)
        assertEquals(user.id, theoremList[0].theorem.author!!.id)
        assertEquals("someName", theoremList[0].theorem.name)
        assertTrue(Instant.now().epochSecond - theoremList[0].theorem.createdAt!!.epochSecond < 5)


        //5. Check that the incoming parameter is NOT affected, and that a clone is being made instead.
        assertNull(stmt.id)
        assertEquals("", stmt.name)
        assertNull(stmt.createdAt)
        assertNull(stmt.author)
    }

    @Test
    fun persistTheoremFailCases() {
        val theoremList = mutableListOf<SavedTheoremInfo>()

        //1. Clean up existing db entities
        app.statementRepo.deleteAll()
        app.dirRepo.deleteAll()

        //2. Create a parent object
        val obj = app.dirRepo.save(MathAsmDirEntity("root"))
        assertNotNull(obj.id)

        //3. Try to persist a non-DB instance
        try {
            val stmt = MathAsmStatement.createAxiom("", longArrayOf(1,2,3), longArrayOf(4,5,6), true, 0)
            ProofUtils.persistTheorem(theoremList, stmt, obj.id!!, "someName", user, app)
            fail("Exception was not thrown")
        }
        catch (e: MathAsmException) {
            assertEquals(ErrorCode.WRONG_CLASS_INSTANCE, e.code)
            assertEquals("Not a MathAsmStatementEntity", e.message)
        }

        //4. Try persisting under a non existing object
        try {
            val stmt = MathAsmStatementEntity.createAxiom("", longArrayOf(1,2,3), longArrayOf(4,5,6), true, 0)
            ProofUtils.persistTheorem(theoremList, stmt, 9999999L, "someName", user, app)
            fail("Exception was not thrown")
        }
        catch (e: MathAsmException) {
            assertEquals(ErrorCode.DIR_NOT_FOUND, e.code)
            assertEquals("Object with id 9999999 not found.", e.message)
        }

        //5. Save with a name of an existing object
        val state = BasicMathAsmState(app)
        try {
            val stmt = MathAsmStatementEntity.createAxiom("dir1_1_1!", longArrayOf(1,2,3), longArrayOf(4,5,6), true, 0)
            ProofUtils.persistTheorem(theoremList, stmt, state.dir1_1.id!!, "dir1_1_1", user, app)
            fail("Exception was not thrown")
        }
        catch (e: MathAsmException) {
            assertEquals(ErrorCode.NAME_ALREADY_EXISTS, e.code)
            assertEquals("Name  \"dir1_1_1\" already exists.", e.message)
        }

        //6. Save with a name of an existing statement
        try {
            val stmt = MathAsmStatementEntity.createAxiom("stmt1_1a!", longArrayOf(1,2,3), longArrayOf(4,5,6), true, 0)
            ProofUtils.persistTheorem(theoremList, stmt, state.dir1_1.id!!, "stmt1_1a", user, app)
            fail("Exception was not thrown")
        }
        catch (e: MathAsmException) {
            assertEquals(ErrorCode.NAME_ALREADY_EXISTS, e.code)
            assertEquals("Name  \"stmt1_1a\" already exists.", e.message)
        }
    }
    //endregion
}