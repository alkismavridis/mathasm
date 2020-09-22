package eu.alkismavridis.mathasm.infrastructure.db.util_entities

import eu.alkismavridis.mathasm.infrastructure.db.entities.*
import eu.alkismavridis.mathasm.infrastructure.services.App

class BasicMathAsmState {
    //region FIELDS
    val user1 = User("user1")
    val user2 = User("user2")

    var theory = MathAsmTheory()

    var sym1 = MathAsmSymbol(user1, "x", 1)
    var sym2 = MathAsmSymbol(user1, "+", 2)
    var sym1_1 = MathAsmSymbol(user2, "y", 3)
    var sym2_1 = MathAsmSymbol(user2,"=", 4)

    var rootDir = MathAsmDirEntity("rootDir")        //author: user1
    var dir1 = MathAsmDirEntity("dir1")              //author: user2
    var dir1_1 = MathAsmDirEntity("dir1_1")          //author: user2
    var dir1_1_1 = MathAsmDirEntity("dir1_1_1")      //author: user1
    var dir2 = MathAsmDirEntity("dir2")              //author: user1
    var dir2_1 = MathAsmDirEntity("dir2_1")          //author: user2

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
        theory.rootObj = rootDir
        rootDir.author = user1
        app.theoryRepo.save(theory, 3)



        //3. Setup and persist the object/statement tree
        rootDir.subDirs.add(dir1.apply{ author=user2 })
        dir1.subDirs.add(dir1_1.apply{ author=user2 })
        dir1_1.subDirs.add(dir1_1_1.apply{ author=user1 })

        rootDir.subDirs.add(dir2.apply{ author=user1 })
        dir2.subDirs.add(dir2_1.apply{ author=user2 })

        //3b. add the statements
        dir1.statements.add(stmt1a.apply { author=user1 })
        dir2.statements.add(stmt2a.apply { author=user2 })
        dir1_1.statements.add(stmt1_1a.apply { author=user1 })


        //3c. add the symbols
        dir1.symbols.add(sym1)
        dir2.symbols.add(sym2)
        dir1_1.symbols.add(sym1_1)
        dir2_1.symbols.add(sym2_1)

        app.dirRepo.save(rootDir, 2)
        app.dirRepo.save(dir1, 2)
        app.dirRepo.save(dir1_1, 2)
        app.dirRepo.save(dir1_1_1, 2)
        app.dirRepo.save(dir2, 2)
        app.dirRepo.save(dir2_1, 2)
    }
    //endregion
}
