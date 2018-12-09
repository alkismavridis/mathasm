package eu.alkismavridis.mathasm.db.util_entities

import eu.alkismavridis.mathasm.db.entities.*
import eu.alkismavridis.mathasm.services.App

class BasicMathAsmState {
    //region FIELDS
    val user1 = User("user1")
    val user2 = User("user2")

    var theory = MathAsmTheory()

    var sym1 = MathAsmSymbol(user1, "x", 1)
    var sym2 = MathAsmSymbol(user1, "+", 2)
    var sym1_1 = MathAsmSymbol(user2, "y", 3)
    var sym2_1 = MathAsmSymbol(user2,"=", 4)

    var rootObj = MathAsmDirEntity("rootObj")        //author: user1
    var obj1 = MathAsmDirEntity("obj1")              //author: user2
    var obj1_1 = MathAsmDirEntity("obj1_1")          //author: user2
    var obj1_1_1 = MathAsmDirEntity("obj1_1_1")      //author: user1
    var obj2 = MathAsmDirEntity("obj2")              //author: user1
    var obj2_1 = MathAsmDirEntity("obj2_1")          //author: user2

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



        //3. Setup and persist the object/statement tree
        rootObj.subDirs.add(obj1.apply{ author=user2 })
        obj1.subDirs.add(obj1_1.apply{ author=user2 })
        obj1_1.subDirs.add(obj1_1_1.apply{ author=user1 })

        rootObj.subDirs.add(obj2.apply{ author=user1 })
        obj2.subDirs.add(obj2_1.apply{ author=user2 })

        //3b. add the statements
        obj1.statements.add(stmt1a.apply { author=user1 })
        obj2.statements.add(stmt2a.apply { author=user2 })
        obj1_1.statements.add(stmt1_1a.apply { author=user1 })


        //3c. add the symbols
        obj1.symbols.add(sym1)
        obj2.symbols.add(sym2)
        obj1_1.symbols.add(sym1_1)
        obj2_1.symbols.add(sym2_1)

        app.dirRepo.save(rootObj, 2)
        app.dirRepo.save(obj1, 2)
        app.dirRepo.save(obj1_1, 2)
        app.dirRepo.save(obj1_1_1, 2)
        app.dirRepo.save(obj2, 2)
        app.dirRepo.save(obj2_1, 2)
    }
    //endregion
}