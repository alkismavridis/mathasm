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
    var users = mutableMapOf<Long, User>(); private set
    //endregion




    //region LIFE CYCLE
    init {
        println("UserService.init")
    }

    @PostConstruct
    fun postConstruct() {
        println("Initializing user service...")

        //1. Fetch all users from DB
        val usersFromDb = userRepo.findAll()
        for (u in usersFromDb) this.users[u.id!!] = u

        println("${this.users.size} Users where loaded")
    }


    fun createRootUser() {
        println("No users where found. Creating root user...")
        val rootUser = userRepo.save(
            User("root").setPassword(conf.rootUserPassword).withRights(UserRights_MAX)
        )

        this.users[rootUser.id!!] = rootUser
    }
    //endregion



    //region GETTERS
    fun get(id:Long): User? {
        return users.get(id)
    }

    fun get(login:String): User? {
        return users.filter{(id,u) -> u.userName.equals(login, true)}.values.firstOrNull()
    }

    fun getAll():Collection<User> {
        return users.values
    }

    fun userStream() : Stream<User> {
        return this.users.values.stream()
    }

    fun find(condition: (User)->Boolean) : User? {
        return this.users.values.stream().filter(condition).findAny().orElse(null)
    }

    fun filter(condition: (User)->Boolean) : Collection<User> { return this.users.values.stream().filter(condition).collect(Collectors.toList()) }
    //endregion




    //region SAVING
    fun save(user: User) : User {
        val persisted = userRepo.save(user)
        this.users[persisted.id!!] = persisted
        return persisted
    }
    //endregion



    //region DELETS
    fun delete(user: User) {
        userRepo.delete(user)
        this.users.remove(user.id!!)
    }

    fun deleteAll() {
        userRepo.deleteAll()
        this.users.clear()
    }
    //endregion
}