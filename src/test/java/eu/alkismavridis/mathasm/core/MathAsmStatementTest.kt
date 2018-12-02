package eu.alkismavridis.mathasm.core

import eu.alkismavridis.mathasm.core.error.ErrorCode
import eu.alkismavridis.mathasm.core.error.MathAsmException
import eu.alkismavridis.mathasm.core.proof.*
import eu.alkismavridis.mathasm.core.sentence.*
import org.junit.*
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue


class MathAsmStatementTest {
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



    //region UTIL FUNCTIONS
    //endregion




    //region LEGALITY TESTS
    @Test
    fun assertReplaceAllLegalityTest() {
        val words1 = longArrayOf(1,2,3)
        val words2 = longArrayOf(1,2)
        val words3 = longArrayOf(4,4)
        val words4 = longArrayOf(1,2,7)

        //one way plasi (base grade smaller)
        val move = ReplaceAllMove(0, 0, LogicMove_LTR)
        var plasi = MathAsmStatement.createAxiom("someName", words1, words2, false, 5)
        var base = MathAsmStatement.createAxiom("someName", words3, words4, true, 4)

        try { plasi.assertReplaceAllLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_FIRST_PHRASE_EDIT, e.code) }

        //one way plasi (base grade equal)
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 5)
        try { plasi.assertReplaceAllLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_FIRST_PHRASE_EDIT, e.code) }

        //one way plasi (base grade greater)
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 6)
        plasi.assertReplaceAllLegality(move, base)

        //two way plasi (base grade smaller)
        plasi = MathAsmStatement.createAxiom("someName", words1, words2, true, 5)
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 4)
        plasi.assertReplaceAllLegality(move, base)

        //two way plasi (base grade equal)
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 5)
        plasi.assertReplaceAllLegality(move, base)

        //two way plasi (base grade greater)
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 6)
        plasi.assertReplaceAllLegality(move, base)
    }


    @Test
    fun assertReplacePhraseLegality() {
        val words1 = longArrayOf(1,2,3)
        val words2 = longArrayOf(1,2)
        val words3 = longArrayOf(4,4)
        val words4 = longArrayOf(1,2,7)


        //Start with an illegal direction
        var plasi = MathAsmStatement.createAxiom("someName", words1, words2, false, 0)
        var base = MathAsmStatement.createAxiom("someName", words3, words4, true, 0)
        var move = ReplaceSentenceMove(0, 0, LogicMove_LTR, MathAsmStatement_LEFT_SIDE)

        try { plasi.assertReplaceSentenceLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_FIRST_PHRASE_EDIT, e.code) }


        //Make plasi two way. Now it should be allowed
        plasi = MathAsmStatement.createAxiom("someName", words1, words2, true, 0)
        plasi.assertReplaceSentenceLegality(move, base)

        //Test base grade less than plasis
        plasi = MathAsmStatement.createAxiom("someName", words1, words2, true, 5)
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 4)
        plasi.assertReplaceSentenceLegality(move, base)

        //Test base grade equal to plasis
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 5)
        plasi.assertReplaceSentenceLegality(move, base)

        //Test base grade grater than to plasis
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 6)
        try { plasi.assertReplaceSentenceLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.BASE_GRADE_TO_BIG, e.code) }


        //Test base grade less than plasis (ONE_WAY plasi)
        plasi = MathAsmStatement.createAxiom("someName", words1, words2, false, 5)
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 4)
        try { plasi.assertReplaceSentenceLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_FIRST_PHRASE_EDIT, e.code) }

        //Test base grade equal to plasis (ONE_WAY plasi)
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 5)
        try { plasi.assertReplaceSentenceLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_FIRST_PHRASE_EDIT, e.code) }

        //Test base grade grater than to plasis (ONE_WAY plasi)
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 6)
        try { plasi.assertReplaceSentenceLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_FIRST_PHRASE_EDIT, e.code) }


        //SECOND SIDE TESTS
        plasi = MathAsmStatement.createAxiom("someName", words1, words2, false, 0)
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 0)
        move = ReplaceSentenceMove(0, 0, LogicMove_LTR, MathAsmStatement_RIGHT_SIDE)
        plasi.assertReplaceSentenceLegality(move, base)

        //Make plasi two way. It should be allowed too
        plasi = MathAsmStatement.createAxiom("someName", words1, words2, true, 0)
        plasi.assertReplaceSentenceLegality(move, base)

        //Test base grade less than plasis
        plasi = MathAsmStatement.createAxiom("someName", words1, words2, true, 5)
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 4)
        plasi.assertReplaceSentenceLegality(move, base)

        //Test base grade equal to plasis
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 5)
        plasi.assertReplaceSentenceLegality(move, base)

        //Test base grade grater than to plasis
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 6)
        try { plasi.assertReplaceSentenceLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.BASE_GRADE_TO_BIG, e.code) }

        //Test base grade less than plasis (ONE_WAY plasi)
        plasi = MathAsmStatement.createAxiom("someName", words1, words2, false, 5)
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 4)
        plasi.assertReplaceSentenceLegality(move, base)

        //Test base grade equal to plasis (ONE_WAY plasi)
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 5)
        plasi.assertReplaceSentenceLegality(move, base)

        //Test base grade grater than to plasis (ONE_WAY plasi)
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 6)
        try { plasi.assertReplaceSentenceLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.BASE_GRADE_TO_BIG, e.code) }
    }


    @Test
    fun assertReplaceOneLegalityTest() {
        val words1 = longArrayOf(1,2,1,2,7,3,3,6)
        val words2 = longArrayOf(1,3,3,2,1,7)
        val words3 = longArrayOf(2,1)
        val words4 = longArrayOf(3,3)


        var plasi = MathAsmStatement.createAxiom("someName", words1, words2, true, 0)
        var base = MathAsmStatement.createAxiom("someName", words3, words4, false, 0)
        var move = ReplaceOneMove(0, 0, LogicMove_LTR, MathAsmStatement_LEFT_SIDE, 1)
        plasi.assertReplaceOneLegality(move, base)

        //grade not zero
        base = MathAsmStatement.createAxiom("someName", words3, words4, false, 2)
        try { plasi.assertReplaceOneLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.BASE_GRADE_NOT_ZERO, e.code) }


        //match failure
        move = ReplaceOneMove(0, 0, LogicMove_LTR, MathAsmStatement_LEFT_SIDE, 3)
        base = MathAsmStatement.createAxiom("someName", words3, words4, false, 0)
        try { plasi.assertReplaceOneLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.MATCH_FAILED, e.code) }

        //illegal right to left
        move = ReplaceOneMove(0, 0, LogicMove_RTL, MathAsmStatement_LEFT_SIDE, 0)
        try { plasi.assertReplaceOneLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_DIRECTION, e.code) }


        //But it should be allowed with TWO_WAY base
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 0)
        move = ReplaceOneMove(0, 0, LogicMove_RTL, MathAsmStatement_LEFT_SIDE, 5)
        plasi.assertReplaceOneLegality(move, base)

        //if plasi is one way, editing the first phrase is forbidden
        plasi = MathAsmStatement.createAxiom("someName", words1, words2, false, 0)
        try { plasi.assertReplaceOneLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_FIRST_PHRASE_EDIT, e.code) }


        //but trying it on the second phrase should be legal, no matter what the plasi direction is
        plasi = MathAsmStatement.createAxiom("someName", words1, words2, false, 0)
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 0)
        move = ReplaceOneMove(0, 0, LogicMove_LTR, MathAsmStatement_RIGHT_SIDE, 3)
        plasi.assertReplaceOneLegality(move, base)

        plasi = MathAsmStatement.createAxiom("someName", words1, words2, true, 0)
        plasi.assertReplaceOneLegality(move, base)

        //still, matching failures should be detected
        move = ReplaceOneMove(0, 0, LogicMove_LTR, MathAsmStatement_RIGHT_SIDE, 3)
        try { plasi.assertReplaceOneLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.MATCH_FAILED, e.code) }


        move = ReplaceOneMove(0, 0, LogicMove_RTL, MathAsmStatement_RIGHT_SIDE, 99)
        try { plasi.assertReplaceOneLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.MATCH_FAILED, e.code) }


        move = ReplaceOneMove(0, 0, LogicMove_RTL, MathAsmStatement_RIGHT_SIDE, 1)
        plasi.assertReplaceOneLegality(move, base)

        //and base direction rules too
        base = MathAsmStatement.createAxiom("someName", words3, words4, false, 0)
        try { plasi.assertReplaceOneLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_DIRECTION, e.code) }


        //base with greater base should still be forbidden
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 2)
        try { plasi.assertReplaceOneLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.BASE_GRADE_NOT_ZERO, e.code) }
    }

    @Test
    fun assertStartLegalityTest() {
        //1. Test single-direction base
        val words1 = longArrayOf(1,2,3,1,2)
        val words2 = longArrayOf(1,2)
        val base = MathAsmStatement.createAxiom("someName", words1, words2, false, 1)

        MathAsmStatement.assertStartLegality(base, MathAsmStatement_LEFT_SIDE)

        try { MathAsmStatement.assertStartLegality(base, MathAsmStatement_RIGHT_SIDE) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_DIRECTION, e.code) }

        MathAsmStatement.assertStartLegality(base, MathAsmStatement_BOTH_SIDES)


        //2. Test bidirectional base
        base.setBridge(true, 1, false)

        MathAsmStatement.assertStartLegality(base, MathAsmStatement_LEFT_SIDE)
        MathAsmStatement.assertStartLegality(base, MathAsmStatement_RIGHT_SIDE)
        MathAsmStatement.assertStartLegality(base, MathAsmStatement_BOTH_SIDES)
    }
    //endregion



    //region SELECTION TESTS
    @Test
    fun selectAllTest() {
        //create 2 sentenses
        val words1 = longArrayOf(1,2,1,2,3,1)
        val words2 = longArrayOf(4,4,1,2,1,3,1,2)

        val words3= longArrayOf(1,2)
        val words4= longArrayOf(3,1)

        val sel = LogicSelection(10)
        val plasi = MathAsmStatement.createAxiom("someName", words1, words2, true, 0)
        plasi.type = MathAsmStatement_THEOREM_TEMPLATE
        val base = MathAsmStatement.createAxiom("someName", words3, words4, true, 0)



        //select in whole sentense
        var move = ReplaceAllMove(0, 0, LogicMove_LTR)
        plasi.selectAll(move, base, sel, true)
        assertEquals(2, sel.side1.length)
        assertEquals(0, sel.side1.positions[0])
        assertEquals(2, sel.side1.positions[1])

        assertEquals(2, sel.side2.length)
        assertEquals(2, sel.side2.positions[0])
        assertEquals(6, sel.side2.positions[1])


        move = ReplaceAllMove(0, 0, LogicMove_RTL)
        plasi.selectAll(move, base, sel, true)
        assertEquals(1, sel.side1.length)
        assertEquals(4, sel.side1.positions[0])
        assertEquals(1, sel.side2.length)
        assertEquals(5, sel.side2.positions[0])
    }

    @Test
    fun selectPhraseTest() {
        //create 2 sentenses
        val words1 = longArrayOf(1,2,1,2,3,1)
        val words2 = longArrayOf(4,4,1,2,1,3,1,2)

        val words3= longArrayOf(1,2)
        val words4= longArrayOf(3,1)

        val sel = LogicSelection(10)
        val plasi = MathAsmStatement.createAxiom("someName", words1, words2, true, 0)
        plasi.type = MathAsmStatement_THEOREM_TEMPLATE
        val base = MathAsmStatement.createAxiom("someName", words3, words4, true, 0)


        //select in first phrase
        var move = ReplaceSentenceMove(0,0, LogicMove_LTR, MathAsmStatement_LEFT_SIDE)
        plasi.selectPhrase(move, base, sel, true)
        assertEquals(2, sel.side1.length)
        assertEquals(0, sel.side1.positions[0])
        assertEquals(2, sel.side1.positions[1])
        assertEquals(0, sel.side2.length)

        move = ReplaceSentenceMove(0, 0, LogicMove_RTL, MathAsmStatement_LEFT_SIDE)
        plasi.selectPhrase(move, base, sel, true)
        assertEquals(1, sel.side1.length)
        assertEquals(4, sel.side1.positions[0])
        assertEquals(0, sel.side2.length)


        //select in second phrase
        move = ReplaceSentenceMove(0, 0, LogicMove_LTR, MathAsmStatement_RIGHT_SIDE)
        plasi.selectPhrase(move, base, sel, true)
        assertEquals(0, sel.side1.length)
        assertEquals(2, sel.side2.length)
        assertEquals(2, sel.side2.positions[0])
        assertEquals(6, sel.side2.positions[1])

        move = ReplaceSentenceMove(0, 0, LogicMove_RTL, MathAsmStatement_RIGHT_SIDE)
        plasi.selectPhrase(move, base, sel, true)
        assertEquals(0, sel.side1.length)
        assertEquals(1, sel.side2.length)
        assertEquals(5, sel.side2.positions[0])
    }

    @Test
    fun selectSingleTest() {
        //create 2 statements
        val words1 = longArrayOf(1,2,1,2,3,1)
        val words2 = longArrayOf(4,4,1,2,1,3,1,2)

        val words3= longArrayOf(1,2)
        val words4= longArrayOf(3,1)

        val sel = LogicSelection(10)
        val plasi = MathAsmStatement.createAxiom("someName", words1, words2, true, 0)
        plasi.type =MathAsmStatement_THEOREM_TEMPLATE
        val base = MathAsmStatement.createAxiom("someName", words3, words4, true, 0)


        var move = ReplaceOneMove(0, 0, LogicMove_LTR, MathAsmStatement_LEFT_SIDE, 2)
        plasi.selectSingle(move, base, sel, true)
        assertEquals(1, sel.side1.length)
        assertEquals(2, sel.side1.positions[0])
        assertEquals(0, sel.side2.length)


        //select in second
        move = ReplaceOneMove(0, 0, LogicMove_LTR, MathAsmStatement_RIGHT_SIDE, 6)
        plasi.selectSingle(move, base, sel, true)
        assertEquals(0, sel.side1.length)
        assertEquals(1, sel.side2.length)
        assertEquals(6, sel.side2.positions[0])
    }
    //endregion


    //region THEOREM EDITING TEST
    @Test
    fun startTest() {
        //1. Create an Axiom to start
        val words1 = longArrayOf(1,2,3,1,2)
        val words2 = longArrayOf(1,2)

        val axiom1 = MathAsmStatement.createAxiom("someName", words1, words2, false, 3)


        //Test legality of Starts
        MathAsmStatement.assertStartLegality(axiom1, MathAsmStatement_LEFT_SIDE)

        try { MathAsmStatement.assertStartLegality(axiom1, MathAsmStatement_RIGHT_SIDE) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_DIRECTION, e.code) }

        MathAsmStatement.assertStartLegality(axiom1, MathAsmStatement_BOTH_SIDES)

        //Make 3 starts
        val th1 = MathAsmStatement.createTheoremTempl(axiom1, MathAsmStatement_LEFT_SIDE, false)

        try {
            MathAsmStatement.createTheoremTempl(axiom1, MathAsmStatement_RIGHT_SIDE, true)
        }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_DIRECTION, e.code) }

        val thBoth = MathAsmStatement.createTheoremTempl(axiom1, MathAsmStatement_BOTH_SIDES, false)

        assertEquals("\"1 2 3 1 2 __3-- 1 2 3 1 2 \"", th1.toString())
        assertEquals("\"1 2 3 1 2 __3-- 1 2 \"", thBoth.toString())



        //Now try the same with a two-way axiom
        val axiom2 = MathAsmStatement.createAxiom("someName", words1, words2, true, 2)

        val th1_2 = MathAsmStatement.createTheoremTempl(axiom2, MathAsmStatement_LEFT_SIDE, false)
        val th2_2 = MathAsmStatement.createTheoremTempl(axiom2, MathAsmStatement_RIGHT_SIDE, true)
        val thBoth_2 = MathAsmStatement.createTheoremTempl(axiom2, MathAsmStatement_BOTH_SIDES, false)

        assertEquals("\"1 2 3 1 2 __2__ 1 2 3 1 2 \"", th1_2.toString())
        assertEquals("\"1 2 __2__ 1 2 \"", th2_2.toString())
        assertEquals("\"1 2 3 1 2 __2__ 1 2 \"", thBoth_2.toString())
    }

    @Test
    fun replacementsTest() {
        //create 2 sentenses
        val words1 = longArrayOf(1,2,1,2,3,1)
        val words2 = longArrayOf(4,4,1,2,1,3,1,4)

        val words3 = longArrayOf(1,2)
        val words4 = longArrayOf(3,1)

        val sel = LogicSelection(10)
        var plasi = MathAsmStatement.createAxiom("someName", words1, words2, true, 0)
        plasi.type = MathAsmStatement_THEOREM_TEMPLATE
        val base = MathAsmStatement.createAxiom("someName", words3, words4, false, 0)


        //test an illegal move
        var move = ReplaceOneMove(0, 0, LogicMove_LTR, MathAsmStatement_LEFT_SIDE, 2)

        plasi.selectSingle(move, base, sel, true).replace(MathAsmStatement_LEFT_SIDE, base, sel)
        assertEquals("\"1 2 3 1 3 1 __0__ 4 4 1 2 1 3 1 4 \"", plasi.toString())

        //test select andReplace in the whole sentece
        plasi = MathAsmStatement.createAxiom("someName", words1, words2, true, 0)
        plasi.type = MathAsmStatement_THEOREM_TEMPLATE
        var move2 = ReplaceAllMove(0, 0, LogicMove_LTR)

        plasi.selectAll(move2, base, sel, true).replace(MathAsmStatement_LEFT_SIDE, base, sel)
        assertEquals("\"3 1 3 1 3 1 __0__ 4 4 3 1 1 3 1 4 \"", plasi.toString())

        //Try editing types that are not theorem templates
        plasi.type = MathAsmStatement_THEOREM
        try { plasi.replace(MathAsmStatement_LEFT_SIDE, base, sel) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.NOT_A_THEOREM_TEMPLATE, e.code) }

        plasi.type = MathAsmStatement_AXIOM
        try { plasi.replace(MathAsmStatement_LEFT_SIDE, base, sel) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.NOT_A_THEOREM_TEMPLATE, e.code) }

        plasi.type = MathAsmStatement_AXIOM_TEMPLATE
        try { plasi.replace(MathAsmStatement_LEFT_SIDE, base, sel) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.NOT_A_THEOREM_TEMPLATE, e.code) }
    }
    //endregion



    //region AXIOM TESTS
    @Test
    fun axiomTest() {
        //1. create the 2 word arrays
        val words1 = longArrayOf(1,2,3,1,2)
        val words2 = longArrayOf(1,2)


        //2. create the axiom
        val ax = MathAsmStatement.createAxiom("someName", words1, words2, true, 1)

        //3. test phrase getters
        assertEquals(ax.getPhrase(MathAsmStatement_LEFT_SIDE).toString(), "\"1 2 3 1 2 \"")
        assertEquals(ax.getPhrase(MathAsmStatement_RIGHT_SIDE).toString(), "\"1 2 \"")
        assertEquals(ax.getTheOther(MathAsmStatement_RIGHT_SIDE).toString(), "\"1 2 3 1 2 \"")
        assertEquals(ax.getTheOther(MathAsmStatement_LEFT_SIDE).toString(), "\"1 2 \"")

        assertTrue(ax.isBidirectional())
        assertEquals(ax.grade, 1.toShort())

        //4. test serializer
        assertEquals(ax.toString(), "\"1 2 3 1 2 __1__ 1 2 \"")
    }
    //endregion
}
