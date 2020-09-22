package eu.alkismavridis.mathasm.infrastructure.api.test_utils

import eu.alkismavridis.mathasm.infrastructure.api.GraphqlContext
import eu.alkismavridis.mathasm.infrastructure.db.entities.User
import graphql.execution.ExecutionContext
import graphql.execution.ExecutionId
import graphql.execution.ExecutionTypeInfo
import graphql.language.Field
import graphql.language.FragmentDefinition
import graphql.schema.*

class DummyFetchingEnvironment : DataFetchingEnvironment {

    val context: GraphqlContext

    constructor(user: User?) {
        context = GraphqlContext(user)
    }


    override fun getField(): Field {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun getFragmentsByName(): MutableMap<String, FragmentDefinition> {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun getFieldDefinition(): GraphQLFieldDefinition {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun getArguments(): MutableMap<String, Any> {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun <T : Any?> getSource(): T {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun getFields(): MutableList<Field> {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun getParentType(): GraphQLType {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun getExecutionId(): ExecutionId {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun getSelectionSet(): DataFetchingFieldSelectionSet {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun getFieldType(): GraphQLOutputType {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun <T : Any?> getContext(): T {
        return context as T
    }

    override fun <T : Any?> getRoot(): T {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun getGraphQLSchema(): GraphQLSchema {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun <T : Any?> getArgument(p0: String?): T {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun getExecutionContext(): ExecutionContext {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun getFieldTypeInfo(): ExecutionTypeInfo {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun containsArgument(p0: String?): Boolean {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

}
