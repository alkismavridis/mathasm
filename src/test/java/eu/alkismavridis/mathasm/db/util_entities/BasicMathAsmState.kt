package eu.alkismavridis.mathasm.db.util_entities

import eu.alkismavridis.mathasm.db.entities.*
import eu.alkismavridis.mathasm.services.App

class BasicMathAsmState {
    //region FIELDS
    val user1 = User("user1")
    val user2 = User("user2")

    var theory = MathAsmTheory()

    var sym1 = MathAsmSymbol("x", 1)
    var sym2 = MathAsmSymbol("+", 2)
    var sym3 = MathAsmSymbol("y", 3)
    var sym4 = MathAsmSymbol("=", 4)

    var rootObj = MathAsmObjectEntity("rootObj")        //author: user1
    var obj1 = MathAsmObjectEntity("obj1")              //author: user2
    var obj1_1 = MathAsmObjectEntity("obj1_1")          //author: user2
    var obj1_1_1 = MathAsmObjectEntity("obj1_1_1")      //author: user1
    var obj2 = MathAsmObjectEntity("obj2")              //author: user1
    var obj2_1 = MathAsmObjectEntity("obj2_1")          //author: user2

    var stmt1a = MathAsmStatementEntity.createAxiom("stmt1a", longArrayOf(1,2,3), longArrayOf(3,2,1), true, 0)  //author: user1
    var stmt2a = MathAsmStatementEntity.createAxiom("stmt2a", longArrayOf(1,4,1), longArrayOf(3,4,3), true, 0)  //author: user2
    var stmt1_1a = MathAsmStatementEntity.createAxiom("stmt1_1a", longArrayOf(1), longArrayOf(3), true, 2)        //author: user1
    //endregion



    //region LIFE CYCLE
    constructor(app: App) {
        //1. Persist the users
        app.userService.save(user1)
        app.userService.save(user2)

        //2. Persist the theory and root object
        theory.rootObj = rootObj
        rootObj.author = user1
        app.theoryRepo.save(theory, 3)

        //3. Persist the symbols
        app.symbolRepo.saveAll(listOf(sym1, sym2, sym3, sym4))

        //4. Setup and persist the object/statement tree
        rootObj.objects.add(obj1.apply{ author=user2 })
        obj1.objects.add(obj1_1.apply{ author=user2 })
        obj1_1.objects.add(obj1_1_1.apply{ author=user1 })

        rootObj.objects.add(obj2.apply{ author=user1 })
        obj2.objects.add(obj2_1.apply{ author=user2 })

        //4b. add the statements
        obj1.statements.add(stmt1a.apply { author=user1 })
        obj2.statements.add(stmt2a.apply { author=user2 })
        obj1_1.statements.add(stmt1_1a.apply { author=user1 })

        app.objectRepo.save(rootObj, 2)
        app.objectRepo.save(obj1, 2)
        app.objectRepo.save(obj1_1, 2)
        app.objectRepo.save(obj1_1_1, 2)
        app.objectRepo.save(obj2, 2)
        app.objectRepo.save(obj2_1, 2)
    }
    //endregion
}