package eu.alkismavridis.mathasm.api.resolvers.write

import com.coxautodev.graphql.tools.GraphQLMutationResolver
import eu.alkismavridis.mathasm.api.GraphqlContext
import eu.alkismavridis.mathasm.api.controller.security.SecurityService
import eu.alkismavridis.mathasm.api.types.SavedTheoremInfo
import eu.alkismavridis.mathasm.services.App
import eu.alkismavridis.mathasm.core.error.ErrorCode
import eu.alkismavridis.mathasm.core.error.MathAsmException
import eu.alkismavridis.mathasm.core.proof.LogicMove
import eu.alkismavridis.mathasm.core.proof.ProofExecutor
import eu.alkismavridis.mathasm.core.proof.TheoremGenerator
import eu.alkismavridis.mathasm.core.proof.TheoremSaver
import eu.alkismavridis.mathasm.db.entities.*
import eu.alkismavridis.mathasm.services.utils.ProofUtils
import eu.alkismavridis.mathasm.services.utils.SymbolUtils
import graphql.schema.DataFetchingEnvironment
import java.time.Instant

/** The entry point of all Write events for the application. */
class Mutation(private var app: App, private val secService:SecurityService) : GraphQLMutationResolver {

    //region FIELDS
    val authWSector = AuthWSector(app)
    val symbolWSector = SymbolWSector(app)
    val statementWSector = StatementWSector(app)
    val fsWSector = FileSystemWSector(app)
    //endregion
}