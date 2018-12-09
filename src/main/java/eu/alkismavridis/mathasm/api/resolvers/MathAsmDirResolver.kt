package eu.alkismavridis.mathasm.api.resolvers

import com.coxautodev.graphql.tools.GraphQLResolver
import eu.alkismavridis.mathasm.db.entities.MathAsmDirEntity
import eu.alkismavridis.mathasm.db.entities.MathAsmStatementEntity

class MathAsmDirResolver: GraphQLResolver<MathAsmDirEntity> {
    //region FIELDS
    constructor() {
    }
    //endregion



    //region RESOLVERS
    //TODO do we need this?
    fun subDirs(sen:MathAsmDirEntity) : List<MathAsmDirEntity> {
        return sen.subDirs
    }

    //TODO do we need this?
    fun statements(sen:MathAsmDirEntity) : List<MathAsmStatementEntity> {
        return sen.statements
    }
    //endregion
}