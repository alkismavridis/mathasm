package eu.alkismavridis.mathasm.api.resolvers

import com.coxautodev.graphql.tools.GraphQLResolver
import eu.alkismavridis.mathasm.db.entities.MathAsmObjectEntity
import eu.alkismavridis.mathasm.db.entities.MathAsmStatementEntity

class MathAsmObjectResolver: GraphQLResolver<MathAsmObjectEntity> {
    //region FIELDS
    constructor() {
    }
    //endregion



    //region RESOLVERS
    //TODO do we need this?
    fun objects(sen:MathAsmObjectEntity) : List<MathAsmObjectEntity> {
        return sen.objects
    }

    //TODO do we need this?
    fun statements(sen:MathAsmObjectEntity) : List<MathAsmStatementEntity> {
        return sen.statements
    }
    //endregion
}