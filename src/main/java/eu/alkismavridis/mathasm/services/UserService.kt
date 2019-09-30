package eu.alkismavridis.mathasm.services

import eu.alkismavridis.mathasm.MathAsmConfig
import eu.alkismavridis.mathasm.db.entities.User
import eu.alkismavridis.mathasm.db.entities.UserRights_MAX
import eu.alkismavridis.mathasm.db.repo.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.util.function.Predicate
import java.util.stream.Collectors
import java.util.stream.Stream
import javax.annotation.PostConstruct

@Component
class UserService {
    //region DEPENDENCIES
    @Autowired
    private lateinit var userRepo: UserRepository

    @Autowired
    private lateinit var conf: MathAsmConfig
    //endregion



    //region FIELDS
    //var users = mutableMapOf<Long, User>(); private set
    //endregion




    //region LIFE CYCLE
    init {
        println("UserService.init")
    }

    @PostConstruct
    fun postConstruct() {
        println("Initializing user service...")

        //1. Fetch all users from DB
        //val usersFromDb = userRepo.findAll()
        //for (u in usersFromDb) this.users[u.id!!] = u

        //println("${this.users.size} Users where loaded")
    }


    fun getOrCreateRootUser() : User {
        val existingRoot = this.userRepo.findByUserName("root")
        if(existingRoot!=null) return existingRoot

        println("No users where found. Creating root user...")
        return userRepo.save(
            User("root").setPassword(conf.rootUserPassword).withRights(UserRights_MAX)
        )
    }
    //endregion



    //region GETTERS
    fun get(id:Long): User? {
        return this.userRepo.findById(id).orElse(null)
    }

    fun get(login:String): User? {
        return this.userRepo.findByUserName(login)
    }

    fun getAll():List<User> {
        return this.userRepo.findAll().iterator().asSequence().toList()
    }
    //endregion




    //region SAVING
    fun save(user: User) : User {
        return userRepo.save(user)
    }
    //endregion



    //region DELETS
    fun delete(user: User) {
        userRepo.delete(user)
    }

    fun deleteAll() {
        userRepo.deleteAll()
    }
    //endregion
}