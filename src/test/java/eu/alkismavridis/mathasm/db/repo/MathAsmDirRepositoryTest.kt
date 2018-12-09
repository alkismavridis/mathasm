package eu.alkismavridis.mathasm.db.repo

import eu.alkismavridis.mathasm.db.util_entities.BasicMathAsmState
import eu.alkismavridis.mathasm.services.App
import org.junit.*
import org.junit.Assert.*
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@SpringBootTest
class MathAsmDirRepositoryTest {
    //region INJECTIONS
    @Autowired
    lateinit var dirRepo: MathAsmDirRepository

    @Autowired
    lateinit var app: App
    //endregion


    //region SETUP AND CLEAN UP
    @Before
    @Throws(Exception::class)
    fun beforeEvery() {
        dirRepo.deleteAll()
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


    @Test
        fun hasChildWithNameTest() {
        app.symbolRepo.deleteAll()
        app.proofRepo.deleteAll()
        app.statementRepo.deleteAll()
        app.dirRepo.deleteAll()
        app.userService.deleteAll()

        val state = BasicMathAsmState(app)

        //1. Check name availability from rootObj
        assertTrue(app.dirRepo.hasChildWithName(state.rootObj.id, "obj1"))
        assertTrue(app.dirRepo.hasChildWithName(state.rootObj.id, "obj2"))

        //checking grandchildren should return false
        assertFalse(app.dirRepo.hasChildWithName(state.rootObj.id, "obj1_1"))
        assertFalse(app.dirRepo.hasChildWithName(state.rootObj.id, "obj1_1_1"))
        assertFalse(app.dirRepo.hasChildWithName(state.rootObj.id, "obj2_1"))

        assertFalse(app.dirRepo.hasChildWithName(state.rootObj.id, "stmt1a")) //this is a grand child, not a child
        assertFalse(app.dirRepo.hasChildWithName(state.rootObj.id, "stmt2a")) //this is a grand child, not a child
        assertFalse(app.dirRepo.hasChildWithName(state.rootObj.id, "stmt1_1a")) //this is a grand child, not a child
        assertFalse(app.dirRepo.hasChildWithName(state.rootObj.id, "sdfsfs")) //this does not exists at all


        //2. Check name availability from obj1
        assertFalse(app.dirRepo.hasChildWithName(state.obj1.id, "obj1"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1.id, "obj2"))
        assertTrue(app.dirRepo.hasChildWithName(state.obj1.id, "obj1_1"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1.id, "obj1_1_1"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1.id, "obj2_1"))
        assertTrue(app.dirRepo.hasChildWithName(state.obj1.id, "stmt1a"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1.id, "stmt2a"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1.id, "stmt1_1a"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1.id, "sdfsfs"))

        //3. Check name availability from obj1_1
        assertFalse(app.dirRepo.hasChildWithName(state.obj1_1.id, "obj1"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1_1.id, "obj2"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1_1.id, "obj1_1"))
        assertTrue(app.dirRepo.hasChildWithName(state.obj1_1.id, "obj1_1_1"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1_1.id, "obj2_1"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1_1.id, "stmt1a"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1_1.id, "stmt2a"))
        assertTrue(app.dirRepo.hasChildWithName(state.obj1_1.id, "stmt1_1a"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1_1.id, "sdfsfs"))

        //4. Check name availability from obj1_1_1
        assertFalse(app.dirRepo.hasChildWithName(state.obj1_1_1.id, "obj1"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1_1_1.id, "obj2"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1_1_1.id, "obj1_1"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1_1_1.id, "obj1_1_1"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1_1_1.id, "obj2_1"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1_1_1.id, "stmt1a"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1_1_1.id, "stmt2a"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1_1_1.id, "stmt1_1a"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1_1_1.id, "sdfsfs"))

        //5. Check name case sensitivity
        assertFalse(app.dirRepo.hasChildWithName(state.rootObj.id, "obJ1"))
        assertFalse(app.dirRepo.hasChildWithName(state.rootObj.id, "OBj2"))
        assertFalse(app.dirRepo.hasChildWithName(state.obj1_1.id, "sTMt1_1a"))
    }

    @Test
    fun findParentIdOfDirTest() {
        app.symbolRepo.deleteAll()
        app.proofRepo.deleteAll()
        app.statementRepo.deleteAll()
        app.dirRepo.deleteAll()
        app.userService.deleteAll()

        val state = BasicMathAsmState(app)
        assertEquals(state.obj1_1.id, app.dirRepo.findParentIdOfDir(state.obj1_1_1.id))
        assertEquals(state.obj1.id, app.dirRepo.findParentIdOfDir(state.obj1_1.id))
        assertEquals(state.rootObj.id, app.dirRepo.findParentIdOfDir(state.obj1.id))
        assertEquals(state.obj2.id, app.dirRepo.findParentIdOfDir(state.obj2_1.id))
        assertNull(app.dirRepo.findParentIdOfDir(state.rootObj.id))
    }
}