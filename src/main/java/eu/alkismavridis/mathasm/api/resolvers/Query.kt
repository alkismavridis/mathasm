package eu.alkismavridis.mathasm.api.resolvers

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import eu.alkismavridis.mathasm.api.GraphqlContext
import eu.alkismavridis.mathasm.db.entities.MathAsmObjectEntity
import eu.alkismavridis.mathasm.services.App
import eu.alkismavridis.mathasm.db.entities.MathAsmStatementEntity
import eu.alkismavridis.mathasm.db.entities.MathAsmSymbol
import eu.alkismavridis.mathasm.db.entities.User
import graphql.schema.DataFetchingEnvironment
import org.springframework.data.neo4j.util.IterableUtils

class Query: GraphQLQueryResolver {

    //region FIELDS
    private var app: App

    constructor(app: App) {
        this.app = app
    }
    //endregion



   //region GENERAL
    fun languages(): List<String> {
        return listOf("en", "de")
    }

    fun users(env:DataFetchingEnvironment): Collection<User> {
        return app.userService.getAll()
    }

    fun user(id:Long?, env:DataFetchingEnvironment): User? {
       if (id != null) return app.userService.get(id)
       return (env.getContext() as GraphqlContext).user
    }

    fun defaultLanguage():String {
        return app.conf.defaultLanguage
    }
   //endregion



    //region SYMBOL GETTERS
    fun symbolRange(idFrom:Long, idTo:Long): List<MathAsmSymbol> {
        return app.symbolRepo.findByIdRange(idFrom, idTo)
    }

    fun symbols(ids:List<Long>): List<MathAsmSymbol> {
        return IterableUtils.toList(app.symbolRepo.findAllByUid(ids))
    }
    //endregion


    //region LOGIC VALUE GETTERS
    fun rootObject(depth:Int) : MathAsmObjectEntity? {
        return app.theoryRepo.findAll(depth+1).iterator().next().rootObj
    }

    fun logicObject(id:Long, depth:Int) : MathAsmObjectEntity? {
        return app.objectRepo.findById(id, depth).orElse(null)
    }

    fun statement(id:Long, depth:Int) : MathAsmStatementEntity? {
        return app.statementRepo.findById(id, depth).orElse(null)
    }
    //endregion
}