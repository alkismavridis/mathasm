package eu.alkismavridis.mathasm.api.resolvers

import eu.alkismavridis.mathasm.db.entities.MathAsmStatementEntity
import eu.alkismavridis.mathasm.services.App
import org.junit.*
import org.junit.Assert.assertEquals
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@SpringBootTest
class StatementResolverTest {
    //region INJECTIONS
    @Autowired
    lateinit var app: App

    lateinit var resolver:StatementResolver
    //endregion


    //region SETUP AND CLEAN UP
    @Before
    @Throws(Exception::class)
    fun beforeEvery() {
        resolver = StatementResolver(app)
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
    fun testLeft() {
        //1. Create an entity
        val stmt = MathAsmStatementEntity.createAxiom("", longArrayOf(1,2,3), longArrayOf(4,5,6,7), true, 0)
        val result = resolver.left(stmt)

        assertEquals(3, result.size)
        assertEquals(1, result[0])
        assertEquals(2, result[1])
        assertEquals(3, result[2])
    }

    @Test
    fun testRight() {
        //1. Create an entity
        val stmt = MathAsmStatementEntity.createAxiom("", longArrayOf(1,2,3), longArrayOf(4,5,6,7), true, 0)
        val result = resolver.right(stmt)

        assertEquals(4, result.size)
        assertEquals(4, result[0])
        assertEquals(5, result[1])
        assertEquals(6, result[2])
        assertEquals(7, result[3])
    }
}