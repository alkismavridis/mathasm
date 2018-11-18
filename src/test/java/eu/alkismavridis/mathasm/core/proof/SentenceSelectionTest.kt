package eu.alkismavridis.mathasm.core.proof

import org.junit.*
import org.junit.runner.RunWith
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@SpringBootTest
public class SentenceSelectionTest {

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



    //region TESTS

    @Test
    fun addPositionTest() {
        var sel = SentenceSelection(2)
        Assert.assertEquals(2, sel.positions.size)
        Assert.assertEquals(0, sel.length)

        //1. add one
        sel.add(100)
        Assert.assertEquals(2, sel.positions.size)
        Assert.assertEquals(1, sel.length)
        Assert.assertEquals(100, sel.positions[0])

        //2. add an other
        sel.add(200)
        Assert.assertEquals(2, sel.positions.size)
        Assert.assertEquals(2, sel.length)
        Assert.assertEquals(100, sel.positions[0])
        Assert.assertEquals(200, sel.positions[1])

        //3. add a third one. This one should expand the capacity
        sel.add(300)
        Assert.assertEquals(2 + SentenceSelection_SIZE_INCREMENT, sel.positions.size)
        Assert.assertEquals(3, sel.length)
        Assert.assertEquals(100, sel.positions[0])
        Assert.assertEquals(200, sel.positions[1])
        Assert.assertEquals(300, sel.positions[2])
    }
    //endregion
}