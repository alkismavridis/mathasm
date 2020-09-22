package eu.alkismavridis.mathasm.infrastructure.api.resolvers.write

import com.coxautodev.graphql.tools.GraphQLMutationResolver
import eu.alkismavridis.mathasm.infrastructure.api.controller.security.SecurityService
import eu.alkismavridis.mathasm.infrastructure.services.App

/** The entry point of all Write events for the application. */
class Mutation(private var app: App, private val secService:SecurityService) : GraphQLMutationResolver {

    //region FIELDS
    val authWSector = AuthWSector(app)
    val symbolWSector = SymbolWSector(app)
    val statementWSector = StatementWSector(app)
    val fsWSector = FileSystemWSector(app)
    //endregion
}
