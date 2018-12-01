package eu.alkismavridis.mathasm.core.proof

import eu.alkismavridis.mathasm.core.error.ErrorCode
import eu.alkismavridis.mathasm.core.error.MathAsmException
import eu.alkismavridis.mathasm.core.sentence.*
import eu.alkismavridis.mathasm.core.states.CoreState
import org.junit.*
import org.junit.Assert.*
import org.junit.runner.RunWith
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner
import java.util.function.Consumer
import java.util.function.Function

@RunWith(SpringRunner::class)
@SpringBootTest
class ProofExecutorTest {

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

        /** util test function. Gives a theorem an id and a name, and "saves" it into the given list. */
        fun saveTheorem(theorem:MathAsmStatement, parentId:Long, name:String, targetList: MutableList<MathAsmStatement>) {
            theorem.name = "$name ___ $parentId"
            targetList.add(theorem)
        }
    }
    //endregion



    //region UTIL FUNCTIONS TESTS
    @Test
    fun getExternalTest() {
        //1. Create a proof executor
        val state = CoreState()
        val savedList = mutableListOf<MathAsmStatement>()

        var senProv = Function<Long, MathAsmStatement?>{ id -> state.getStatement(id) }
        val onSave = TheoremSaver{ stmt, parentId, name -> saveTheorem(stmt, parentId, name, savedList) }
        val onGenerateTheorem = TheoremGenerator { stmt, side, check -> MathAsmStatement.createTheoremTempl(stmt, side, check); }
        val executor = ProofExecutor(senProv, onSave, onGenerateTheorem)

        //2. Check existing ids. This must come from the senProv (ant thus, by the state)
        var stmt = executor.getExternal(state.statements["axiom1"]!!.id!!)
        assertEquals(state.statements["axiom1"]!!, stmt)
        val originalAxiom1 = stmt //we will need if to check the cache, later.

        stmt = executor.getExternal(state.statements["axiom2"]!!.id!!)
        assertEquals(state.statements["axiom2"]!!, stmt)

        //3. Check cache. We will change axiom1 in the state. Still, the old one must be cached.
        state.statements["axiom1"] = MathAsmStatement.createAxiom("axiom1", longArrayOf(9,9), longArrayOf(6), true, 1)
        state.statements["axiom1"]!!.id = 1

        stmt = executor.getExternal(1L)
        assertFalse(stmt === state.statements["axiom1"]) //This should be from the cache. NOT from the updated state.
        assertTrue(stmt === originalAxiom1)


        //4. Try to fetch non existing statement
        try { executor.getExternal(99999L); fail("Exception not thrown"); }
        catch (e: MathAsmException) { assertEquals(ErrorCode.STATEMENT_NOT_FOUND, e.code) }
    }

    @Test
    fun getSourceSideTest() {
        //1. Create a proof executor
        val state = CoreState()
        val savedList = mutableListOf<MathAsmStatement>()

        var senProv = Function<Long, MathAsmStatement?>{ id -> state.getStatement(id) }
        val onSave = TheoremSaver{ stmt, parentId, name -> saveTheorem(stmt, parentId, name, savedList) }
        val onGenerateTheorem = TheoremGenerator { stmt, side, check -> MathAsmStatement.createTheoremTempl(stmt, side, check); }
        val executor = ProofExecutor(senProv, onSave, onGenerateTheorem)

        //2. assert source side
        assertEquals(MathAsmStatement_LEFT_SIDE ,executor.getSourceSide(LogicMove_LTR))
        assertEquals(MathAsmStatement_RIGHT_SIDE ,executor.getSourceSide(LogicMove_RTL))
    }
    //endregion



    //region SELECT MOVES TESTS
    @Test
    fun executeInternalSelectMoveTest() {
        //TODO
    }

    @Test
    fun executeExternalSelectMoveTest() {
        //1. Create a proof executor
        val state = CoreState()
        val savedList = mutableListOf<MathAsmStatement>()

        var senProv = Function<Long, MathAsmStatement?>{ id -> state.getStatement(id) }
        val onSave = TheoremSaver{ stmt, parentId, name -> saveTheorem(stmt, parentId, name, savedList) }
        val onGenerateTheorem = TheoremGenerator { stmt, side, check -> MathAsmStatement.createTheoremTempl(stmt, side, check); }
        val executor = ProofExecutor(senProv, onSave, onGenerateTheorem)

        //2. Assert selections
        executor.executeExternalSelectMove(ExternalSelectMove(0, 1L))
        assertEquals(state.getStatement(1L), executor.selectedBase)

        //3. Test non existing base
        try { executor.executeExternalSelectMove(ExternalSelectMove(0, 99999L)) }
        catch (e: MathAsmException) { assertEquals(ErrorCode.STATEMENT_NOT_FOUND, e.code) }
    }
    //endregion



    //region STARTING MOVES TESTS
    @Test
    fun executeStartMoveTest() {
        //1. Create a proof executor
        val state = CoreState()
        val savedList = mutableListOf<MathAsmStatement>()

        val senProv = Function<Long, MathAsmStatement?>{ id -> state.getStatement(id) }
        val onSave = TheoremSaver{ stmt, parentId, name -> saveTheorem(stmt, parentId, name, savedList) }
        val onGenerateTheorem = TheoremGenerator { stmt, side, check -> MathAsmStatement.createTheoremTempl(stmt, side, check); }
        val executor = ProofExecutor(senProv, onSave, onGenerateTheorem)

        //2. Start new template
        executor.executeExternalSelectMove(ExternalSelectMove(0, state.statements["axiom2"]!!.id!!))
        executor.executeStartMove(StartMove(0, 0, MathAsmStatement_LEFT_SIDE))
        assertEquals("\"1 1 1 __0__ 1 1 1 \"", executor.getTemplate(0).toString())

        executor.executeStartMove(StartMove(0, 1, MathAsmStatement_RIGHT_SIDE))
        assertEquals("\"3 __0__ 3 \"", executor.getTemplate(1).toString())

        executor.executeStartMove(StartMove(0, 2, MathAsmStatement_BOTH_SIDES))
        assertEquals("\"1 1 1 __0__ 3 \"", executor.getTemplate(2).toString())


        //3. Start existing theorems
        executor.executeExternalSelectMove(ExternalSelectMove(0, state.statements["axiom3"]!!.id!!))
        executor.executeStartMove(StartMove(0, 0, MathAsmStatement_LEFT_SIDE))
        assertEquals("\"5 5 __1__ 5 5 \"", executor.getTemplate(0).toString())

        executor.executeStartMove(StartMove(0, 1, MathAsmStatement_RIGHT_SIDE))
        assertEquals("\"25 1 __1__ 25 1 \"", executor.getTemplate(1).toString())

        executor.executeStartMove(StartMove(0, 2, MathAsmStatement_BOTH_SIDES))
        assertEquals("\"5 5 __1__ 25 1 \"", executor.getTemplate(2).toString())
    }

    @Test
    fun executeStartMoveFailCases() {
        //1. Create a proof executor
        val state = CoreState()
        val savedList = mutableListOf<MathAsmStatement>()

        val senProv = Function<Long, MathAsmStatement?>{ id -> state.getStatement(id) }
        val onSave = TheoremSaver{ stmt, parentId, name -> saveTheorem(stmt, parentId, name, savedList) }
        val onGenerateTheorem = TheoremGenerator { stmt, side, check -> MathAsmStatement.createTheoremTempl(stmt, side, check); }
        val executor = ProofExecutor(senProv, onSave, onGenerateTheorem)

        //2.Test with null base
        try {
            executor.executeStartMove(StartMove(0, 1, MathAsmStatement_LEFT_SIDE))
            fail("Exception not thrown")
        }
        catch (e: MathAsmException) { assertEquals(ErrorCode.NULL_BASE, e.code) }


        //3. Test out of bounds index: negative
        executor.executeExternalSelectMove(ExternalSelectMove(0, state.statements["axiom1"]!!.id!!))
        try {
            executor.executeStartMove(StartMove(0, -1, MathAsmStatement_LEFT_SIDE))
            fail("Exception not thrown");
        }
        catch (e: MathAsmException) { assertEquals(ErrorCode.ILLEGAL_INDEX_FOR_THEOREM_START, e.code) }

        //4. Test out of bounds index: positive
        try {
            executor.executeStartMove(StartMove(0, 99, MathAsmStatement_LEFT_SIDE))
            fail("Exception not thrown")
        }
        catch (e: MathAsmException) { assertEquals(ErrorCode.ILLEGAL_INDEX_FOR_THEOREM_START, e.code) }

        try { executor.executeStartMove(StartMove(0, 1, MathAsmStatement_LEFT_SIDE)) }
        catch (e: MathAsmException) { assertEquals(ErrorCode.ILLEGAL_INDEX_FOR_THEOREM_START, e.code) }


        //5. Add one theorem and try to access out of bounds again
        executor.executeStartMove(StartMove(0, 0, MathAsmStatement_LEFT_SIDE)) //successful start!

        try {
            executor.executeStartMove(StartMove(0, 2, MathAsmStatement_LEFT_SIDE))
            fail("Exception not thrown")
        }
        catch (e: MathAsmException) { assertEquals(ErrorCode.ILLEGAL_INDEX_FOR_THEOREM_START, e.code) }

        //6. Illegal start (existing theorem template)
        try {
            executor.executeStartMove(StartMove(0, 0, MathAsmStatement_RIGHT_SIDE))
            fail("Exception not thrown")
        }
        catch (e: MathAsmException) { assertEquals(ErrorCode.ILLEGAL_DIRECTION, e.code) }

        //7. Illegal start (new theorem template)
        try {
            executor.executeStartMove(StartMove(0, 1, MathAsmStatement_RIGHT_SIDE))
            fail("Exception not thrown")
        }
        catch (e: MathAsmException) { assertEquals(ErrorCode.ILLEGAL_DIRECTION, e.code) }
    }
    //endregion



    //region REPLACE TESTS
    @Test
    fun executeReplaceAllMoveTest() {
        //1. Create a proof executor
        val state = CoreState()
        val savedList = mutableListOf<MathAsmStatement>()

        val senProv = Function<Long, MathAsmStatement?>{ id -> state.getStatement(id) }
        val onSave = TheoremSaver{ stmt, parentId, name -> saveTheorem(stmt, parentId, name, savedList) }
        val onGenerateTheorem = TheoremGenerator { stmt, side, check -> MathAsmStatement.createTheoremTempl(stmt, side, check); }
        val executor = ProofExecutor(senProv, onSave, onGenerateTheorem)

        //2. Start new template
        executor.executeExternalSelectMove(ExternalSelectMove(0, state.statements["axiom6"]!!.id!!))
        executor.executeStartMove(StartMove(0, 0, MathAsmStatement_BOTH_SIDES))
        assertEquals("\"2 4 2 __2__ 123 456 \"", executor.getTemplate(0).toString())

        //3. Replace all "2"
        executor.executeExternalSelectMove(ExternalSelectMove(0, state.statements["axiom4"]!!.id!!))
        executor.executeReplaceAllMove(ReplaceAllMove(0, 0, LogicMove_LTR))
        assertEquals("\"8 8 4 8 8 __2__ 123 456 \"", executor.getTemplate(0).toString())

        //Replace them back
        executor.executeReplaceAllMove(ReplaceAllMove(0, 0, LogicMove_RTL))
        assertEquals("\"2 4 2 __2__ 123 456 \"", executor.getTemplate(0).toString())
    }

    @Test
    fun executeReplaceAllMoveFailCases() {
        //1. Create a proof executor
        val state = CoreState()
        val savedList = mutableListOf<MathAsmStatement>()

        val senProv = Function<Long, MathAsmStatement?> { id -> state.getStatement(id) }
        val onSave = TheoremSaver{ stmt, parentId, name -> saveTheorem(stmt, parentId, name, savedList) }
        val onGenerateTheorem = TheoremGenerator { stmt, side, check -> MathAsmStatement.createTheoremTempl(stmt, side, check); }
        val executor = ProofExecutor(senProv, onSave, onGenerateTheorem)

        //2.Test with null base
        try {
            executor.executeReplaceAllMove(ReplaceAllMove(0, 1, LogicMove_LTR))
            fail("Exception not thrown")
        } catch (e: MathAsmException) {
            assertEquals(ErrorCode.NULL_BASE, e.code)
        }


        //3. Test out of bounds index: negative
        executor.executeExternalSelectMove(ExternalSelectMove(0, state.statements["axiom1"]!!.id!!))
        try {
            executor.executeReplaceAllMove(ReplaceAllMove(0, -1, LogicMove_LTR))
            fail("Exception not thrown")
        } catch (e: MathAsmException) {
            assertEquals(ErrorCode.ILLEGAL_INTERNAL_SELECT, e.code)
        }

        //4. Test out of bounds index: positive
        try {
            executor.executeReplaceAllMove(ReplaceAllMove(0, 99, LogicMove_LTR))
            fail("Exception not thrown")
        } catch (e: MathAsmException) {
            assertEquals(ErrorCode.ILLEGAL_INTERNAL_SELECT, e.code)
        }

        //5. Test illegal select all
        executor.executeStartMove(StartMove(0, 0, MathAsmStatement_BOTH_SIDES))
        assertEquals("\"2 4 2 __2-- 2 3 6 2 \"", executor.getTemplate(0).toString())

        try {
            executor.executeReplaceAllMove(ReplaceAllMove(0, 0, LogicMove_RTL))
            fail("Exception not thrown")
        } catch (e: MathAsmException) {
            assertEquals(ErrorCode.ILLEGAL_DIRECTION, e.code)
        }
    }


    @Test
    fun executeReplaceSentenceMoveTest() {
        //1. Create a proof executor
        val state = CoreState()
        val savedList = mutableListOf<MathAsmStatement>()

        val senProv = Function<Long, MathAsmStatement?>{ id -> state.getStatement(id) }
        val onSave = TheoremSaver{ stmt, parentId, name -> saveTheorem(stmt, parentId, name, savedList) }
        val onGenerateTheorem = TheoremGenerator { stmt, side, check -> MathAsmStatement.createTheoremTempl(stmt, side, check); }
        val executor = ProofExecutor(senProv, onSave, onGenerateTheorem)

        //2. Start new template
        executor.executeExternalSelectMove(ExternalSelectMove(0, state.statements["axiom6"]!!.id!!))
        executor.executeStartMove(StartMove(0, 0, MathAsmStatement_BOTH_SIDES))
        assertEquals("\"2 4 2 __2__ 123 456 \"", executor.getTemplate(0).toString())

        //3. Replace all "2"
        executor.executeExternalSelectMove(ExternalSelectMove(0, state.statements["axiom4"]!!.id!!))
        executor.executeReplaceSentenceMove(ReplaceSentenceMove(0, 0, LogicMove_LTR, MathAsmStatement_LEFT_SIDE))
        assertEquals("\"8 8 4 8 8 __2__ 123 456 \"", executor.getTemplate(0).toString())

        //Replace them back
        executor.executeReplaceSentenceMove(ReplaceSentenceMove(0, 0, LogicMove_RTL, MathAsmStatement_LEFT_SIDE))
        assertEquals("\"2 4 2 __2__ 123 456 \"", executor.getTemplate(0).toString())

        //4. Replace right Sentence
        executor.executeExternalSelectMove(ExternalSelectMove(0, state.statements["axiom6"]!!.id!!))
        executor.executeStartMove(StartMove(0, 0, MathAsmStatement_LEFT_SIDE))
        assertEquals("\"2 4 2 __2__ 2 4 2 \"", executor.getTemplate(0).toString())

        executor.executeExternalSelectMove(ExternalSelectMove(0, state.statements["axiom4"]!!.id!!))
        executor.executeReplaceSentenceMove(ReplaceSentenceMove(0, 0, LogicMove_LTR, MathAsmStatement_RIGHT_SIDE))
        assertEquals("\"2 4 2 __2__ 8 8 4 8 8 \"", executor.getTemplate(0).toString())

        //Replace them back
        executor.executeReplaceSentenceMove(ReplaceSentenceMove(0, 0, LogicMove_RTL, MathAsmStatement_RIGHT_SIDE))
        assertEquals("\"2 4 2 __2__ 2 4 2 \"", executor.getTemplate(0).toString())
    }

    @Test
    fun executeReplaceSentenceMoveFailCases() {
        //1. Create a proof executor
        val state = CoreState()
        val savedList = mutableListOf<MathAsmStatement>()

        val senProv = Function<Long, MathAsmStatement?> { id -> state.getStatement(id) }
        val onSave = TheoremSaver{ stmt, parentId, name -> saveTheorem(stmt, parentId, name, savedList) }
        val onGenerateTheorem = TheoremGenerator { stmt, side, check -> MathAsmStatement.createTheoremTempl(stmt, side, check); }
        val executor = ProofExecutor(senProv, onSave, onGenerateTheorem)

        //2.Test with null base
        try {
            executor.executeReplaceSentenceMove(ReplaceSentenceMove(0, 1, LogicMove_LTR, MathAsmStatement_LEFT_SIDE))
            fail("Exception not thrown")
        } catch (e: MathAsmException) {
            assertEquals(ErrorCode.NULL_BASE, e.code)
        }


        //3. Test out of bounds index: negative
        executor.executeExternalSelectMove(ExternalSelectMove(0, state.statements["axiom1"]!!.id!!))
        try {
            executor.executeReplaceSentenceMove(ReplaceSentenceMove(0, -1, LogicMove_LTR, MathAsmStatement_LEFT_SIDE))
            fail("Exception not thrown")
        } catch (e: MathAsmException) {
            assertEquals(ErrorCode.ILLEGAL_INTERNAL_SELECT, e.code)
        }

        //4. Test out of bounds index: positive
        try {
            executor.executeReplaceSentenceMove(ReplaceSentenceMove(0, 99, LogicMove_LTR, MathAsmStatement_LEFT_SIDE))
            fail("Exception not thrown")
        } catch (e: MathAsmException) {
            assertEquals(ErrorCode.ILLEGAL_INTERNAL_SELECT, e.code)
        }

        //5. Test illegal select all
        executor.executeStartMove(StartMove(0, 0, MathAsmStatement_BOTH_SIDES))
        assertEquals("\"2 4 2 __2-- 2 3 6 2 \"", executor.getTemplate(0).toString())

        try {
            executor.executeReplaceSentenceMove(ReplaceSentenceMove(0, 0, LogicMove_RTL, MathAsmStatement_LEFT_SIDE))
            fail("Exception not thrown")
        } catch (e: MathAsmException) {
            assertEquals(ErrorCode.ILLEGAL_DIRECTION, e.code)
        }
    }

    @Test
    fun executeReplaceOneMoveTest() {
        //1. Create a proof executor
        val state = CoreState()
        val savedList = mutableListOf<MathAsmStatement>()

        val senProv = Function<Long, MathAsmStatement?>{ id -> state.getStatement(id) }
        val onSave = TheoremSaver{ stmt, parentId, name -> saveTheorem(stmt, parentId, name, savedList) }
        val onGenerateTheorem = TheoremGenerator { stmt, side, check -> MathAsmStatement.createTheoremTempl(stmt, side, check); }
        val executor = ProofExecutor(senProv, onSave, onGenerateTheorem)

        //2. Start new template
        executor.executeExternalSelectMove(ExternalSelectMove(0, state.statements["axiom6"]!!.id!!))
        executor.executeStartMove(StartMove(0, 0, MathAsmStatement_BOTH_SIDES))
        assertEquals("\"2 4 2 __2__ 123 456 \"", executor.getTemplate(0).toString())

        //3. Replace all "2"
        executor.executeExternalSelectMove(ExternalSelectMove(0, state.statements["axiom4"]!!.id!!))
        executor.executeReplaceOneMove(ReplaceOneMove(0, 0, LogicMove_LTR, MathAsmStatement_LEFT_SIDE, 2))
        assertEquals("\"2 4 8 8 __2__ 123 456 \"", executor.getTemplate(0).toString())

        //Replace them back
        executor.executeReplaceOneMove(ReplaceOneMove(0, 0, LogicMove_RTL, MathAsmStatement_LEFT_SIDE, 2))
        assertEquals("\"2 4 2 __2__ 123 456 \"", executor.getTemplate(0).toString())

        //4. Replace right Sentence
        executor.executeExternalSelectMove(ExternalSelectMove(0, state.statements["axiom6"]!!.id!!))
        executor.executeStartMove(StartMove(0, 0, MathAsmStatement_LEFT_SIDE))
        assertEquals("\"2 4 2 __2__ 2 4 2 \"", executor.getTemplate(0).toString())

        executor.executeExternalSelectMove(ExternalSelectMove(0, state.statements["axiom4"]!!.id!!))
        executor.executeReplaceOneMove(ReplaceOneMove(0, 0, LogicMove_LTR, MathAsmStatement_RIGHT_SIDE, 0))
        assertEquals("\"2 4 2 __2__ 8 8 4 2 \"", executor.getTemplate(0).toString())

        //Replace them back
        executor.executeReplaceOneMove(ReplaceOneMove(0, 0, LogicMove_RTL, MathAsmStatement_RIGHT_SIDE, 0))
        assertEquals("\"2 4 2 __2__ 2 4 2 \"", executor.getTemplate(0).toString())
    }

    @Test
    fun executeReplaceOneMoveFailCases() {
        //1. Create a proof executor
        val state = CoreState()
        val savedList = mutableListOf<MathAsmStatement>()

        val senProv = Function<Long, MathAsmStatement?> { id -> state.getStatement(id) }
        val onSave = TheoremSaver{ stmt, parentId, name -> saveTheorem(stmt, parentId, name, savedList) }
        val onGenerateTheorem = TheoremGenerator { stmt, side, check -> MathAsmStatement.createTheoremTempl(stmt, side, check); }
        val executor = ProofExecutor(senProv, onSave, onGenerateTheorem)

        //2.Test with null base
        try {
            executor.executeReplaceOneMove(ReplaceOneMove(0, 1, LogicMove_LTR, MathAsmStatement_LEFT_SIDE, 0))
            fail("Exception not thrown")
        } catch (e: MathAsmException) {
            assertEquals(ErrorCode.NULL_BASE, e.code)
        }


        //3. Test out of bounds index: negative
        executor.executeExternalSelectMove(ExternalSelectMove(0, state.statements["axiom1"]!!.id!!))
        try {
            executor.executeReplaceOneMove(ReplaceOneMove(0, -1, LogicMove_LTR, MathAsmStatement_LEFT_SIDE, 0))
            fail("Exception not thrown")
        } catch (e: MathAsmException) {
            assertEquals(ErrorCode.ILLEGAL_INTERNAL_SELECT, e.code)
        }

        //4. Test out of bounds index: positive
        try {
            executor.executeReplaceOneMove(ReplaceOneMove(0, 99, LogicMove_LTR, MathAsmStatement_LEFT_SIDE, 0))
            fail("Exception not thrown")
        } catch (e: MathAsmException) {
            assertEquals(ErrorCode.ILLEGAL_INTERNAL_SELECT, e.code)
        }

        //5. Test illegal select all
        executor.executeStartMove(StartMove(0, 0, MathAsmStatement_BOTH_SIDES))
        assertEquals("\"2 4 2 __2-- 2 3 6 2 \"", executor.getTemplate(0).toString())

        try {
            executor.executeReplaceOneMove(ReplaceOneMove(0, 0, LogicMove_RTL, MathAsmStatement_LEFT_SIDE, 0))
            fail("Exception not thrown")
        } catch (e: MathAsmException) {
            assertEquals(ErrorCode.ILLEGAL_DIRECTION, e.code)
        }
    }

    @Test
    fun executeSaveMoveTest() {
        //1. Create a proof executor
        val state = CoreState()
        val savedList = mutableListOf<MathAsmStatement>()

        val senProv = Function<Long, MathAsmStatement?>{ id -> state.getStatement(id) }
        val onSave = TheoremSaver{ stmt, parentId, name -> saveTheorem(stmt, parentId, name, savedList) }
        val onGenerateTheorem = TheoremGenerator { stmt, side, check -> MathAsmStatement.createTheoremTempl(stmt, side, check); }
        val executor = ProofExecutor(senProv, onSave, onGenerateTheorem)

        //2. Start new template
        executor.executeExternalSelectMove(ExternalSelectMove(0, state.statements["axiom6"]!!.id!!))
        executor.executeStartMove(StartMove(0, 0, MathAsmStatement_BOTH_SIDES))
        assertEquals("\"2 4 2 __2__ 123 456 \"", executor.getTemplate(0).toString())

        //3. Save a theorem
        executor.executeExternalSelectMove(ExternalSelectMove(0, state.statements["axiom4"]!!.id!!))
        executor.executeSaveMove(SaveMove(0, 0, 789, "hello"))

        //4. Check generated theorem
        assertEquals("\"2 4 2 __2__ 123 456 \"", executor.getTemplate(0).toString())
        assertEquals("hello ___ 789", savedList[0].name)
        assertEquals(MathAsmStatement_THEOREM, savedList[0].type)
    }

    @Test
    fun executeSaveMoveFailCases() {
        //1. Create a proof executor
        val state = CoreState()
        val savedList = mutableListOf<MathAsmStatement>()

        val senProv = Function<Long, MathAsmStatement?> { id -> state.getStatement(id) }
        val onSave = TheoremSaver{ stmt, parentId, name -> saveTheorem(stmt, parentId, name, savedList) }
        val onGenerateTheorem = TheoremGenerator { stmt, side, check -> MathAsmStatement.createTheoremTempl(stmt, side, check); }
        val executor = ProofExecutor(senProv, onSave, onGenerateTheorem)


        //2. Test out of bounds index: negative
        executor.executeExternalSelectMove(ExternalSelectMove(0, state.statements["axiom1"]!!.id!!))
        try {
            executor.executeSaveMove(SaveMove(0, -1, 123, "hello"))
            fail("Exception not thrown")
        } catch (e: MathAsmException) {
            assertEquals(ErrorCode.ILLEGAL_INTERNAL_SELECT, e.code)
        }

        //2. Test out of bounds index: positive
        try {
            executor.executeSaveMove(SaveMove(0, 99, 123, "hello"))
            fail("Exception not thrown")
        } catch (e: MathAsmException) {
            assertEquals(ErrorCode.ILLEGAL_INTERNAL_SELECT, e.code)
        }
    }
    //endregion
}