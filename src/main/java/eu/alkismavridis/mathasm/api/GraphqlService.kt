package eu.alkismavridis.mathasm.api

import com.coxautodev.graphql.tools.SchemaParser
import com.fasterxml.jackson.databind.ObjectMapper
import eu.alkismavridis.mathasm.MathAsmConfig
import eu.alkismavridis.mathasm.db.entities.MathAsmObjectEntity
import eu.alkismavridis.mathasm.api.resolvers.MathAsmObjectResolver
import eu.alkismavridis.mathasm.services.App
import eu.alkismavridis.mathasm.api.resolvers.SentenceResolver
import eu.alkismavridis.mathasm.api.resolvers.UserResolver
import eu.alkismavridis.mathasm.api.resolvers.Mutation
import eu.alkismavridis.mathasm.api.resolvers.Query
import eu.alkismavridis.mathasm.api.utils.GraphqlContext
import graphql.ExecutionInput
import graphql.schema.GraphQLSchema
import graphql.GraphQL
import graphql.Scalars
import graphql.execution.AsyncExecutionStrategy
import graphql.execution.AsyncSerialExecutionStrategy
import graphql.execution.DataFetcherExceptionHandler
import graphql.execution.ExecutionStrategy
import graphql.schema.GraphQLScalarType
import java.nio.file.Files
import graphql.ExceptionWhileDataFetching
import graphql.execution.DataFetcherExceptionHandlerParameters
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



    var mainSchema: GraphQLSchema? = null
    val exceptionHandler:ShopExceptionHandler
    val mutationStrategy:ExecutionStrategy
    val queryStrategy:ExecutionStrategy
    private val objectMapper = ObjectMapper()
    //endregion




    //region LIFE CYCLE
    init {
        println("GraphqlService.init")


        //2. SETUP HANDLERS
        exceptionHandler = ShopExceptionHandler()
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
                Mutation(app),
            UserResolver(),
            SentenceResolver(),
            MathAsmObjectResolver()
        )

        //3. Create the schema
        val schemaPath = conf.resources.resolve("schemas/main.graphqls")
        val schemaString = String(Files.readAllBytes(schemaPath))
        mainSchema = SchemaParser.newParser()
                .dictionary("MathAsmObjectEntity", MathAsmObjectEntity::class)
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



class ShopExceptionHandler : DataFetcherExceptionHandler {
    override fun accept(handlerParameters: DataFetcherExceptionHandlerParameters) {
        val exception = handlerParameters.exception
        val sourceLocation = handlerParameters.field.sourceLocation
        val path = handlerParameters.path
        val error = ExceptionWhileDataFetching(path, exception, sourceLocation)

        handlerParameters.executionContext.addError(error, path)
    }
}
