package eu.alkismavridis.mathasm.core

import eu.alkismavridis.mathasm.core.sentence.MathAsmSentence
import eu.alkismavridis.mathasm.core.proof.SentenceSelection
import org.junit.*
import org.junit.Assert.*

class MathAsmSentenceTest {
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



    //region TESTS
    @Test
    fun phraseSelectionTest() {
        //1. create the target phrase
        val words1:LongArray = longArrayOf(1,2,3,1,2)
        val phrase = MathAsmSentence(words1, true)
        assertEquals(5, phrase.getLength())

        //2. create the search phrase
        val words2: LongArray = longArrayOf(1,2)
        val searchPhrase = MathAsmSentence(words2, true)
        assertEquals(2, searchPhrase.getLength())

        //3. select
        val sel = SentenceSelection(5)
        phrase.select(searchPhrase, sel)
        assertEquals(2, sel.length)
        assertEquals(0, sel.positions[0])
        assertEquals(3, sel.positions[1])

        //4. inverted select
        searchPhrase.select(phrase, sel)
        assertEquals(0, sel.length)

        //5. select self
        searchPhrase.select(searchPhrase, sel)
        assertEquals(1, sel.length)
        assertEquals(0, sel.positions[0])
    }

    @Test
    fun phraseReplaceEqualSizeTest() {
        //1. create the target phrase
        val words1 = longArrayOf(1,2,3,1,2)
        val phrase = MathAsmSentence(words1, true)

        //2. create the search phrase
        val words2 = longArrayOf(1,2)
        val searchPhrase = MathAsmSentence(words2, true)

        //3. select
        val sel = SentenceSelection(5)
        phrase.select(searchPhrase, sel)

        //4. Replace
        val words3= longArrayOf(9,8)
        val replacePhrase = MathAsmSentence(words3, true)
        phrase.replace(replacePhrase, 2, sel)

        assertEquals("\"9 8 3 9 8 \"", phrase.toString())
        assertEquals(5, phrase.getLength())
    }


    @Test
    fun phraseReplaceToSmallerTest() {
        //1. create the target phrase
        val words1 = longArrayOf(1,2,3,1,2)
        val phrase = MathAsmSentence(words1, true)

        //2. create the search phrase
        val words2 = longArrayOf(1,2)
        val searchPhrase = MathAsmSentence(words2, true)

        //3. select
        val sel = SentenceSelection(5)
        phrase.select(searchPhrase, sel)

        //4. Replace
        val world3 = longArrayOf(9)
        val replacePhrase = MathAsmSentence(world3, true)

        phrase.replace(replacePhrase, 2, sel)
        assertEquals("\"9 3 9 \"", phrase.toString())
        assertEquals(3, phrase.getLength())
    }

    @Test
    fun phraseReplaceToBiggerTest() {
        //1. create the target phrase
        val words1 = longArrayOf(1,2,3,1,2)
        val phrase = MathAsmSentence(words1, true)

        //2. create the search phrase
        val words2 = longArrayOf(1,2)
        val searchPhrase = MathAsmSentence(words2, true)

        //select
        val sel = SentenceSelection(5)
        phrase.select(searchPhrase, sel)

        val words3 = longArrayOf(9,8,7,9)
        val replacePhrase = MathAsmSentence(words3, true)
        phrase.replace(replacePhrase, 2, sel)
        assertEquals("\"9 8 7 9 3 9 8 7 9 \"", phrase.toString())
        assertEquals(9, phrase.getLength())
    }


    @Test
    fun phraseReplaceToBiggerNoCopyTest() {
        //1. create the target phrase
        val words1 = longArrayOf(1,2,3,1,2)
        val phrase = MathAsmSentence(words1, true)
        phrase.ensureCapacity(500)
        assertEquals(500, phrase.getCapacity())


        //2. create the search phrase
        val words2 = longArrayOf(1,2)
        val searchPhrase = MathAsmSentence(words2, true)

        //select
        val sel = SentenceSelection(5)
        phrase.select(searchPhrase, sel)

        val words3 = longArrayOf(9,8,7,9)
        val replacePhrase = MathAsmSentence(words3, true)
        phrase.replace(replacePhrase, 2, sel)
        assertEquals("\"9 8 7 9 3 9 8 7 9 \"", phrase.toString())
        assertEquals(9, phrase.getLength())

        phrase.saveSpace()
        assertEquals(9, phrase.getCapacity())
    }

    @Test
    fun addWordsTest() {
        //create an empty phrase
        val phrase:MathAsmSentence = MathAsmSentence(4)
        assertEquals(0, phrase.getLength())
        assertEquals(4, phrase.getCapacity())


        //add 4 symbols. Capacity should stay 4, but length should increase
        for (i in 0 until 4) {
            phrase.add(242)
            assertEquals(i+1, phrase.getLength())
            assertEquals(4, phrase.getCapacity())
        }

        //check phrase state
        assertEquals("\"242 242 242 242 \"", phrase.toString())

        //add one more symbol. Now capacity must also change
        phrase.add(2362)
        assertEquals(5, phrase.getLength())
        assertTrue(phrase.getCapacity() > 4)
    }


    @Test
    fun testCopy() {
        //create a word array, and a phrase from it
        val words = longArrayOf(1,2,1,3)
        val phrase = MathAsmSentence(words, true)

        //try to copy it
        val copied = MathAsmSentence(1)
        assertEquals(0, copied.getLength())
        assertEquals(1, copied.getCapacity())

        //check that everything is ok
        copied.copy(phrase)
        assertEquals(phrase.getLength(), copied.getLength())
        assertEquals(phrase.getCapacity(), copied.getCapacity())
        assertEquals(phrase.toString(), copied.toString())

        //do it once more and test that everything stayed the same
        copied.copy(phrase)
        assertEquals(phrase.getLength(), copied.getLength())
        assertEquals(phrase.getCapacity(), copied.getCapacity())
        assertEquals(phrase.toString(), copied.toString())

        //now copy from words
        copied.copy(words)
        assertEquals(phrase.getLength(), words.size)
        assertEquals(phrase.getCapacity(), words.size)
        assertEquals(phrase.toString(), copied.toString())
    }


    @Test
    fun testMatch() {
        //create phrase to be searched
        val words = longArrayOf(1,2,1,3,1,2,2,1,2)
        val src = MathAsmSentence(words, true)


        //create target phrase
        val words2 = longArrayOf(1,2)
        val target = MathAsmSentence(words2, true)


        //test match cases
        assertTrue(src.match(target, 0))
        assertFalse(src.match(target, 1))
        assertFalse(src.match(target, 2))
        assertFalse(src.match(target, 3))
        assertTrue(src.match(target, 4))
        assertFalse(src.match(target, 5))
        assertFalse(src.match(target, 6))
        assertTrue(src.match(target, 7))
        assertFalse(src.match(target, 8))
        assertFalse(src.match(target, 2362))

        assertTrue(src.match(src, 0))
        assertFalse(src.match(src, 1))

        assertFalse(target.match(src, 0))
        assertFalse(target.match(src, 1))
    }
    //endregion
}
