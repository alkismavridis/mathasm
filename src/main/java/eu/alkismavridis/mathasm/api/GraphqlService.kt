package eu.alkismavridis.mathasm.api

import com.coxautodev.graphql.tools.SchemaParser
import com.fasterxml.jackson.databind.ObjectMapper
import eu.alkismavridis.mathasm.MathAsmConfig
import eu.alkismavridis.mathasm.api.controller.security.SecurityService
import eu.alkismavridis.mathasm.db.entities.MathAsmDirEntity
import eu.alkismavridis.mathasm.api.resolvers.MathAsmDirResolver
import eu.alkismavridis.mathasm.services.App
import eu.alkismavridis.mathasm.api.resolvers.StatementResolver
import eu.alkismavridis.mathasm.api.resolvers.UserResolver
import eu.alkismavridis.mathasm.api.resolvers.Mutation
import eu.alkismavridis.mathasm.api.resolvers.Query
import eu.alkismavridis.mathasm.core.error.MathAsmException
import graphql.*
import graphql.schema.GraphQLSchema
import graphql.execution.AsyncExecutionStrategy
import graphql.execution.AsyncSerialExecutionStrategy
import graphql.execution.DataFetcherExceptionHandler
import graphql.execution.ExecutionStrategy
import graphql.schema.GraphQLScalarType
import java.nio.file.Files
import graphql.execution.DataFetcherExceptionHandlerParameters
import graphql.language.SourceLocation
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import javax.annotation.PostConstruct


@Component
class GraphqlService {
    //region FIELDS
    @Autowired
    private lateinit var app: App

    @Autowired
    private lateinit var conf: MathAsmConfig

    @Autowired
    lateinit var secService: SecurityService



    var mainSchema: GraphQLSchema? = null
    val exceptionHandler:MathAsmExceptionHandler
    val mutationStrategy:ExecutionStrategy
    val queryStrategy:ExecutionStrategy
    private val objectMapper = ObjectMapper()
    //endregion




    //region LIFE CYCLE
    init {
        println("GraphqlService.init")


        //2. SETUP HANDLERS
        exceptionHandler = MathAsmExceptionHandler()
        mutationStrategy = AsyncSerialExecutionStrategy(exceptionHandler)
        queryStrategy = AsyncExecutionStrategy(exceptionHandler)

    }


    @PostConstruct
    fun postConstruct() {
        println("GraphqlService.postConstruct")

        //1. SETUP SCALARS
        val scalars:Array<GraphQLScalarType> = arrayOf(
                Scalars.GraphQLLong
        )

        //2. SETUP RESOLVERS
        val resolvers = listOf(
            Query(app),
            Mutation(app, secService),
            UserResolver(),
            StatementResolver(app),
            MathAsmDirResolver()
        )

        //3. Create the schema
        val schemaPath = conf.resources.resolve("schemas/main.graphqls")
        val schemaString = String(Files.readAllBytes(schemaPath))
        mainSchema = SchemaParser.newParser()
                .dictionary("MathAsmDirEntity", MathAsmDirEntity::class)
                .schemaString(schemaString)
                .scalars(*scalars)
                .resolvers(resolvers)
                .build()
                .makeExecutableSchema()
    }
    //endregion




    //region EXECUTING QUERIES
    fun execute(query:String, params:Map<String, Any>?, operationName:String?, ctx: GraphqlContext):String {
        val res = GraphQL
                .newGraphQL(mainSchema)
                .mutationExecutionStrategy(mutationStrategy)
                .queryExecutionStrategy(queryStrategy)
                .build()
                .execute(ExecutionInput.Builder().query(query).variables(params).operationName(operationName).context(ctx).build())
                .toSpecification()

        return objectMapper.writeValueAsString(res)
    }
    //endregion
}



class MathAsmExceptionHandler : DataFetcherExceptionHandler {
    override fun accept(handlerParameters: DataFetcherExceptionHandlerParameters) {
        val exception = handlerParameters.exception
        val sourceLocation = handlerParameters.field.sourceLocation
        val path = handlerParameters.path
        val error = MathAsmGraphqlError(exception, sourceLocation)

        handlerParameters.executionContext.addError(error, path)
    }
}

class MathAsmGraphqlError(thr:Throwable, sourceLocation:SourceLocation) : GraphQLError {
    private val locations:MutableList<SourceLocation>
    private val message:String
    private val extensions:Map<String, Any>

    init {
        this.locations = mutableListOf(sourceLocation)
        this.message = if (thr.message==null) thr.javaClass.simpleName else thr.message!!
        this.extensions = if (thr is MathAsmException) thr.extensions else mapOf()
    }


    override fun getMessage(): String {
        return this.message
    }

    override fun getErrorType(): ErrorType {
        return ErrorType.DataFetchingException
    }

    override fun getLocations(): MutableList<SourceLocation> {
        return this.locations
    }

    override fun getExtensions(): Map<String, Any> {
        return this.extensions
    }
}