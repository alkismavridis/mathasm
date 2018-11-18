package eu.alkismavridis.mathasm.services

import eu.alkismavridis.mathasm.MathAsmConfig
import eu.alkismavridis.mathasm.db.entities.MathAsmObjectEntity
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
    lateinit var objectRepo: MathAsmObjectRepository
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


        //detect if root env exists. Create it if it does not
        val theoryCount = this.theoryRepo.count()
        if (theoryCount == 0L) {
            val rootTheory = MathAsmTheory("root", MathAsmObjectEntity())
            this.theoryRepo.save(rootTheory, 1)
        }
    }
    //endregion
}