package eu.alkismavridis.mathasm.services

import eu.alkismavridis.mathasm.MathAsmConfig
import eu.alkismavridis.mathasm.db.entities.MathAsmDirEntity
import eu.alkismavridis.mathasm.db.entities.MathAsmTheory
import eu.alkismavridis.mathasm.api.GraphqlService
import eu.alkismavridis.mathasm.db.repo.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import javax.annotation.PostConstruct

@Component
class App {
    //region DEPENDENCIES
    @Autowired
    lateinit var conf: MathAsmConfig
        private set

    @Autowired
    lateinit var userService: UserService
        private set

    @Autowired
    lateinit var graphqlService: GraphqlService
        private set

    @Autowired
    lateinit var statementRepo: StatementRepository
        private set


    @Autowired
    lateinit var dirRepo: MathAsmDirRepository
        private set

    @Autowired
    lateinit var theoryRepo: TheoryRepository
        private set

    @Autowired
    lateinit var proofRepo: MathAsmProofRepository
        private set

    @Autowired
    lateinit var symbolRepo: SymbolRepository
        private set
    //endregion




    //region LIFE CYCLE
    init {
        println("App.init")
    }

    @PostConstruct
    fun postConstruct() {
        println("App.postConstruct")
        //initApp(this)

        //1. Create root user, if non is present
        if (userService.users.isEmpty()) userService.createRootUser()

        //detect if root env exists. Create it if it does not
        val theoryCount = this.theoryRepo.count()
        if (theoryCount == 0L) {
            val rootTheory = MathAsmTheory("root", MathAsmDirEntity("rootObj"))
            rootTheory.rootObj?.author = userService.find{it.userName == "root"}
            this.theoryRepo.save(rootTheory, 2)
        }
    }
    //endregion
}