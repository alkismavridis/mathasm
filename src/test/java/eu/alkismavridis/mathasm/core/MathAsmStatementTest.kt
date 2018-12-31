package eu.alkismavridis.mathasm.core

import eu.alkismavridis.mathasm.core.enums.*
import eu.alkismavridis.mathasm.core.error.ErrorCode
import eu.alkismavridis.mathasm.core.error.MathAsmException
import eu.alkismavridis.mathasm.core.proof.*
import eu.alkismavridis.mathasm.core.sentence.*
import org.junit.*
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.neo4j.cypher.internal.compiler.v3_2.planDescription.Left


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
        val move = LogicMove.makeReplaceAll(0, null, null, StatementSide_LEFT)
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


        //illegal base type
        base.type = StatementType_HYPOTHESIS
        try { plasi.assertReplaceAllLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_BASE, e.code) }
        base.type = StatementType_AXIOM
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
        var move = LogicMove.makeReplaceLeft(0, null, null, StatementSide_LEFT)

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
        move = LogicMove.makeReplaceRight(0, null, null, StatementSide_LEFT)
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


        //illegal base type
        base.type = StatementType_HYPOTHESIS
        try { plasi.assertReplaceSentenceLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_BASE, e.code) }
        base.type = StatementType_AXIOM
    }


    @Test
    fun assertReplaceOneLegalityTest() {
        val words1 = longArrayOf(1,2,1,2,7,3,3,6)
        val words2 = longArrayOf(1,3,3,2,1,7)
        val words3 = longArrayOf(2,1)
        val words4 = longArrayOf(3,3)


        var plasi = MathAsmStatement.createAxiom("someName", words1, words2, true, 0)
        var base = MathAsmStatement.createAxiom("someName", words3, words4, false, 0)
        var move = LogicMove.makeReplaceOneInLeft(0, null, null, StatementSide_LEFT, 1)
        plasi.assertReplaceOneLegality(move, base)

        //grade not zero
        base = MathAsmStatement.createAxiom("someName", words3, words4, false, 2)
        try { plasi.assertReplaceOneLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.BASE_GRADE_NOT_ZERO, e.code) }


        //match failure
        move = LogicMove.makeReplaceOneInLeft(0, null, null, StatementSide_LEFT, 3)
        base = MathAsmStatement.createAxiom("someName", words3, words4, false, 0)
        try { plasi.assertReplaceOneLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.MATCH_FAILED, e.code) }

        //illegal right to left
        move = LogicMove.makeReplaceOneInLeft(0, null, null, StatementSide_RIGHT, 0)
        try { plasi.assertReplaceOneLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_DIRECTION, e.code) }


        //But it should be allowed with TWO_WAY base
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 0)
        move = LogicMove.makeReplaceOneInLeft(0, null, null, StatementSide_RIGHT, 5)
        plasi.assertReplaceOneLegality(move, base)

        //if plasi is one way, editing the first phrase is forbidden
        plasi = MathAsmStatement.createAxiom("someName", words1, words2, false, 0)
        try { plasi.assertReplaceOneLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_FIRST_PHRASE_EDIT, e.code) }


        //but trying it on the second phrase should be legal, no matter what the plasi direction is
        plasi = MathAsmStatement.createAxiom("someName", words1, words2, false, 0)
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 0)
        move = LogicMove.makeReplaceOneInRight(0, null, null, StatementSide_LEFT, 3)
        plasi.assertReplaceOneLegality(move, base)

        plasi = MathAsmStatement.createAxiom("someName", words1, words2, true, 0)
        plasi.assertReplaceOneLegality(move, base)

        //still, matching failures should be detected
        move = LogicMove.makeReplaceOneInRight(0, null, null, StatementSide_LEFT, 3)
        try { plasi.assertReplaceOneLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.MATCH_FAILED, e.code) }


        move = LogicMove.makeReplaceOneInRight(0, null, null, StatementSide_RIGHT, 99)
        try { plasi.assertReplaceOneLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.MATCH_FAILED, e.code) }


        move = LogicMove.makeReplaceOneInRight(0, null, null, StatementSide_RIGHT, 1)
        plasi.assertReplaceOneLegality(move, base)

        //and base direction rules too
        base = MathAsmStatement.createAxiom("someName", words3, words4, false, 0)
        try { plasi.assertReplaceOneLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_DIRECTION, e.code) }


        //base with greater base should still be forbidden
        base = MathAsmStatement.createAxiom("someName", words3, words4, true, 2)
        try { plasi.assertReplaceOneLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.BASE_GRADE_NOT_ZERO, e.code) }


        //illegal base type
        base.type = StatementType_HYPOTHESIS
        try { plasi.assertReplaceOneLegality(move, base) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_BASE, e.code) }
        base.type = StatementType_AXIOM
    }

    @Test
    fun assertStartLegalityTest() {
        //1. Test single-direction base
        val words1 = longArrayOf(1,2,3,1,2)
        val words2 = longArrayOf(1,2)
        val base = MathAsmStatement.createAxiom("someName", words1, words2, false, 1)

        MathAsmStatement.assertStartLegality(base, StatementSide_LEFT)

        try { MathAsmStatement.assertStartLegality(base, StatementSide_RIGHT) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_DIRECTION, e.code) }
        MathAsmStatement.assertStartLegality(base, StatementSide_BOTH)


        //test illegal base type
        base.type = StatementType_HYPOTHESIS
        try { MathAsmStatement.assertStartLegality(base, StatementSide_RIGHT) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_BASE, e.code) }
        base.type = StatementType_AXIOM

        //2. Test bidirectional base
        base.setBridge(true, 1, false)

        MathAsmStatement.assertStartLegality(base, StatementSide_LEFT)
        MathAsmStatement.assertStartLegality(base, StatementSide_RIGHT)
        MathAsmStatement.assertStartLegality(base, StatementSide_BOTH)
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
        plasi.type = StatementType_THEOREM_TEMPLATE
        val base = MathAsmStatement.createAxiom("someName", words3, words4, true, 0)



        //select in whole sentense
        var move = LogicMove.makeReplaceAll(0, null, null, StatementSide_LEFT)
        plasi.selectAll(move, base, sel, true)
        assertEquals(2, sel.side1.length)
        assertEquals(0, sel.side1.positions[0])
        assertEquals(2, sel.side1.positions[1])

        assertEquals(2, sel.side2.length)
        assertEquals(2, sel.side2.positions[0])
        assertEquals(6, sel.side2.positions[1])


        move = LogicMove.makeReplaceAll(0, null, null, StatementSide_RIGHT)
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
        plasi.type = StatementType_THEOREM_TEMPLATE
        val base = MathAsmStatement.createAxiom("someName", words3, words4, true, 0)


        //select in first phrase
        var move = LogicMove.makeReplaceLeft(0,null, null, StatementSide_LEFT)
        plasi.selectPhrase(move, base, sel, true)
        assertEquals(2, sel.side1.length)
        assertEquals(0, sel.side1.positions[0])
        assertEquals(2, sel.side1.positions[1])
        assertEquals(0, sel.side2.length)

        move = LogicMove.makeReplaceLeft(0, null, null, StatementSide_RIGHT)
        plasi.selectPhrase(move, base, sel, true)
        assertEquals(1, sel.side1.length)
        assertEquals(4, sel.side1.positions[0])
        assertEquals(0, sel.side2.length)


        //select in second phrase
        move = LogicMove.makeReplaceRight(0, null, null, StatementSide_LEFT)
        plasi.selectPhrase(move, base, sel, true)
        assertEquals(0, sel.side1.length)
        assertEquals(2, sel.side2.length)
        assertEquals(2, sel.side2.positions[0])
        assertEquals(6, sel.side2.positions[1])

        move = LogicMove.makeReplaceRight(0, null, null, StatementSide_RIGHT)
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
        plasi.type =StatementType_THEOREM_TEMPLATE
        val base = MathAsmStatement.createAxiom("someName", words3, words4, true, 0)


        var move = LogicMove.makeReplaceOneInLeft(0, null, null, StatementSide_LEFT, 2)
        plasi.selectSingle(move, base, sel, true)
        assertEquals(1, sel.side1.length)
        assertEquals(2, sel.side1.positions[0])
        assertEquals(0, sel.side2.length)


        //select in second
        move = LogicMove.makeReplaceOneInRight(0, null, null, StatementSide_LEFT, 6)
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
        MathAsmStatement.assertStartLegality(axiom1, StatementSide_LEFT)

        try { MathAsmStatement.assertStartLegality(axiom1, StatementSide_RIGHT) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_DIRECTION, e.code) }

        MathAsmStatement.assertStartLegality(axiom1, StatementSide_BOTH)

        //Make 3 starts
        val th1 = MathAsmStatement.createTheoremTempl(axiom1, StatementSide_LEFT, false)

        try {
            MathAsmStatement.createTheoremTempl(axiom1, StatementSide_RIGHT, true)
        }
        catch (e:MathAsmException) { assertEquals(ErrorCode.ILLEGAL_DIRECTION, e.code) }

        val thBoth = MathAsmStatement.createTheoremTempl(axiom1, StatementSide_BOTH, false)

        assertEquals("\"1 2 3 1 2 __3-- 1 2 3 1 2 \"", th1.toString())
        assertEquals("\"1 2 3 1 2 __3-- 1 2 \"", thBoth.toString())



        //Now try the same with a two-way axiom
        val axiom2 = MathAsmStatement.createAxiom("someName", words1, words2, true, 2)

        val th1_2 = MathAsmStatement.createTheoremTempl(axiom2, StatementSide_LEFT, false)
        val th2_2 = MathAsmStatement.createTheoremTempl(axiom2, StatementSide_RIGHT, true)
        val thBoth_2 = MathAsmStatement.createTheoremTempl(axiom2, StatementSide_BOTH, false)

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
        plasi.type = StatementType_THEOREM_TEMPLATE
        val base = MathAsmStatement.createAxiom("someName", words3, words4, false, 0)


        //test an illegal move
        var move = LogicMove.makeReplaceOneInLeft(0, null, null, StatementSide_LEFT, 2)

        plasi.selectSingle(move, base, sel, true).replace(StatementSide_LEFT, base, sel)
        assertEquals("\"1 2 3 1 3 1 __0__ 4 4 1 2 1 3 1 4 \"", plasi.toString())

        //test select andReplace in the whole sentece
        plasi = MathAsmStatement.createAxiom("someName", words1, words2, true, 0)
        plasi.type = StatementType_THEOREM_TEMPLATE
        var move2 = LogicMove.makeReplaceAll(0, null, null, StatementSide_LEFT)

        plasi.selectAll(move2, base, sel, true).replace(StatementSide_LEFT, base, sel)
        assertEquals("\"3 1 3 1 3 1 __0__ 4 4 3 1 1 3 1 4 \"", plasi.toString())

        //Try editing types that are not theorem templates
        plasi.type = StatementType_THEOREM
        try { plasi.replace(StatementSide_LEFT, base, sel) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.NOT_A_THEOREM_TEMPLATE, e.code) }

        plasi.type = StatementType_AXIOM
        try { plasi.replace(StatementSide_LEFT, base, sel) }
        catch (e:MathAsmException) { assertEquals(ErrorCode.NOT_A_THEOREM_TEMPLATE, e.code) }

        plasi.type = StatementType_AXIOM_TEMPLATE
        try { plasi.replace(StatementSide_LEFT, base, sel) }
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
        assertEquals(ax.getPhrase(StatementSide_LEFT).toString(), "\"1 2 3 1 2 \"")
        assertEquals(ax.getPhrase(StatementSide_RIGHT).toString(), "\"1 2 \"")
        assertEquals(ax.getTheOther(StatementSide_RIGHT).toString(), "\"1 2 3 1 2 \"")
        assertEquals(ax.getTheOther(StatementSide_LEFT).toString(), "\"1 2 \"")

        assertTrue(ax.isBidirectional())
        assertEquals(ax.grade, 1.toShort())

        //4. test serializer
        assertEquals(ax.toString(), "\"1 2 3 1 2 __1__ 1 2 \"")
    }
    //endregion
}
