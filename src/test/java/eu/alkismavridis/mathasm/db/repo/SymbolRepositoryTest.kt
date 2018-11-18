package eu.alkismavridis.mathasm.db.repo

import com.google.common.primitives.UnsignedInts.toLong
import eu.alkismavridis.mathasm.db.entities.MathAsmSymbol
import org.junit.*
import org.junit.Assert.*
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@SpringBootTest
class SymbolRepositoryTest {
    //region INJECTIONS
    @Autowired
    lateinit var symboleRepo: SymbolRepository
    //endregion




    //region SETUP AND CLEAN UP
    @Before
    @Throws(Exception::class)
    fun beforeEvery() {
        symboleRepo.deleteAll()
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
    fun findBySymbolIdAndRange() {
        //1. Persist a couple of symbols
        for (i in 1..10) {
            val symb = MathAsmSymbol("sym_$i", toLong(i))
            symboleRepo.save(symb)
        }


        //2. Fetch by individual id
        var fromDB = symboleRepo.findBySymbolId(1)
        assertNotNull(fromDB)
        assertEquals(1L, fromDB.uid)
        assertEquals("sym_1", fromDB.text)

        fromDB = symboleRepo.findBySymbolId(5)
        assertNotNull(fromDB)
        assertEquals(5L, fromDB.uid)
        assertEquals("sym_5", fromDB.text)

        fromDB = symboleRepo.findBySymbolId(100)
        assertNull(fromDB)

        //3. Fetch by id range
        var listFromDB = symboleRepo.findByIdRange(2, 5)
        assertNotNull(listFromDB)
        assertEquals(4, listFromDB.size)
        listFromDB.sortWith(compareBy({ it.uid }))

        assertEquals("sym_2", listFromDB[0].text)
        assertEquals(2L, listFromDB[0].uid)

        assertEquals("sym_3", listFromDB[1].text)
        assertEquals(3L, listFromDB[1].uid)

        assertEquals("sym_4", listFromDB[2].text)
        assertEquals(4L, listFromDB[2].uid)

        assertEquals("sym_5", listFromDB[3].text)
        assertEquals(5L, listFromDB[3].uid)

        //4. Exceed range bounds
        listFromDB = symboleRepo.findByIdRange(9, 12)
        listFromDB.sortWith(compareBy({ it.uid }))
        assertEquals("sym_9", listFromDB[0].text)
        assertEquals(9L, listFromDB[0].uid)

        assertEquals("sym_10", listFromDB[1].text)
        assertEquals(10L, listFromDB[1].uid)
    }

    @Test
    fun findByText() {
        //1. Persist a couple of symbols
        for (i in 1..10) {
            val symb = MathAsmSymbol("sym_$i", toLong(i))
            symboleRepo.save(symb)
        }


        //2. Fetch by individual id
        var fromDB = symboleRepo.findByText("sym_1")
        assertNotNull(fromDB)
        assertEquals(1L, fromDB.uid)
        assertEquals("sym_1", fromDB.text)

        fromDB = symboleRepo.findByText("sym_5")
        assertNotNull(fromDB)
        assertEquals(5L, fromDB.uid)
        assertEquals("sym_5", fromDB.text)

        fromDB = symboleRepo.findByText("sym_100")
        assertNull(fromDB)


        //3. Fetch by id or text (both exist)
        fromDB = symboleRepo.findBySymbolIdOrText(3, "sym_5")
        assertNotNull(fromDB)

        //4. Fetch by id or text (id exists)
        fromDB = symboleRepo.findBySymbolIdOrText(5, "sym_999")
        assertNotNull(fromDB)
        assertEquals(5L, fromDB.uid)
        assertEquals("sym_5", fromDB.text)

        //5. Fetch by id or text (text exists)
        fromDB = symboleRepo.findBySymbolIdOrText(999, "sym_4")
        assertNotNull(fromDB)
        assertEquals(4L, fromDB.uid)
        assertEquals("sym_4", fromDB.text)

        //6. Fetch by id or text (none exists)
        fromDB = symboleRepo.findBySymbolIdOrText(999, "sym_444")
        assertNull(fromDB)
    }

    @Test
    fun findAllByUidTest() {
        //1. Persist a couple of symbols
        for (i in 1..10) {
            val symb = MathAsmSymbol("sym_$i", toLong(i))
            symboleRepo.save(symb)
        }

        //2. Fetch by individual id
        val listFromDb = symboleRepo.findAllByUid(listOf<Long>(2,4,7,999))
        assertEquals(3, listFromDb.size) //We asked for 4 elements, but element 999 does not exists, so we will take 3 back.

        //3. Check result
        assertTrue(listFromDb.stream().anyMatch{s -> s.uid === 2L})
        assertTrue(listFromDb.stream().anyMatch{s -> s.uid === 4L})
        assertTrue(listFromDb.stream().anyMatch{s -> s.uid === 7L})
    }
    //endregion
}