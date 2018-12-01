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
class MathAsmObjectRepositoryTest {
    //region INJECTIONS
    @Autowired
    lateinit var objectRepo: MathAsmObjectRepository

    @Autowired
    lateinit var app: App
    //endregion


    //region SETUP AND CLEAN UP
    @Before
    @Throws(Exception::class)
    fun beforeEvery() {
        objectRepo.deleteAll()
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
        app.objectRepo.deleteAll()
        app.userService.deleteAll()

        val state = BasicMathAsmState(app)

        //1. Check name availability from rootObj
        assertTrue(app.objectRepo.hasChildWithName(state.rootObj.id, "obj1"))
        assertTrue(app.objectRepo.hasChildWithName(state.rootObj.id, "obj2"))

        //checking grandchildren should return false
        assertFalse(app.objectRepo.hasChildWithName(state.rootObj.id, "obj1_1"))
        assertFalse(app.objectRepo.hasChildWithName(state.rootObj.id, "obj1_1_1"))
        assertFalse(app.objectRepo.hasChildWithName(state.rootObj.id, "obj2_1"))

        assertFalse(app.objectRepo.hasChildWithName(state.rootObj.id, "stmt1a")) //this is a grand child, not a child
        assertFalse(app.objectRepo.hasChildWithName(state.rootObj.id, "stmt2a")) //this is a grand child, not a child
        assertFalse(app.objectRepo.hasChildWithName(state.rootObj.id, "stmt1_1a")) //this is a grand child, not a child
        assertFalse(app.objectRepo.hasChildWithName(state.rootObj.id, "sdfsfs")) //this does not exists at all


        //2. Check name availability from obj1
        assertFalse(app.objectRepo.hasChildWithName(state.obj1.id, "obj1"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1.id, "obj2"))
        assertTrue(app.objectRepo.hasChildWithName(state.obj1.id, "obj1_1"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1.id, "obj1_1_1"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1.id, "obj2_1"))
        assertTrue(app.objectRepo.hasChildWithName(state.obj1.id, "stmt1a"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1.id, "stmt2a"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1.id, "stmt1_1a"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1.id, "sdfsfs"))

        //3. Check name availability from obj1_1
        assertFalse(app.objectRepo.hasChildWithName(state.obj1_1.id, "obj1"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1_1.id, "obj2"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1_1.id, "obj1_1"))
        assertTrue(app.objectRepo.hasChildWithName(state.obj1_1.id, "obj1_1_1"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1_1.id, "obj2_1"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1_1.id, "stmt1a"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1_1.id, "stmt2a"))
        assertTrue(app.objectRepo.hasChildWithName(state.obj1_1.id, "stmt1_1a"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1_1.id, "sdfsfs"))

        //4. Check name availability from obj1_1_1
        assertFalse(app.objectRepo.hasChildWithName(state.obj1_1_1.id, "obj1"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1_1_1.id, "obj2"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1_1_1.id, "obj1_1"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1_1_1.id, "obj1_1_1"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1_1_1.id, "obj2_1"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1_1_1.id, "stmt1a"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1_1_1.id, "stmt2a"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1_1_1.id, "stmt1_1a"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1_1_1.id, "sdfsfs"))

        //5. Check name case sensitivity
        assertFalse(app.objectRepo.hasChildWithName(state.rootObj.id, "obJ1"))
        assertFalse(app.objectRepo.hasChildWithName(state.rootObj.id, "OBj2"))
        assertFalse(app.objectRepo.hasChildWithName(state.obj1_1.id, "sTMt1_1a"))
    }
}