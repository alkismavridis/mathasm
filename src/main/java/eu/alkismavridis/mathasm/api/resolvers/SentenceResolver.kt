package eu.alkismavridis.mathasm.api.resolvers

import com.coxautodev.graphql.tools.GraphQLResolver
import eu.alkismavridis.mathasm.db.entities.MathAsmStatementEntity

class SentenceResolver: GraphQLResolver<MathAsmStatementEntity> {
    //region FIELDS
    constructor() {
    }
    //endregion



    //region RESOLVERS
    fun left(sen: MathAsmStatementEntity) : List<Long> {
        val leftPhrase = sen.getLeft()
        val ret = ArrayList<Long>(leftPhrase.getLength())
        val words = leftPhrase.getWords()

        for (i in 0 until leftPhrase.getLength()) ret.add(words[i])
        return ret
    }

    fun right(sen: MathAsmStatementEntity) : List<Long> {
        val rightPhrase = sen.getRight()
        val ret = ArrayList<Long>(rightPhrase.getLength())
        val words = rightPhrase.getWords()

        for (i in 0 until rightPhrase.getLength()) ret.add(words[i])
        return ret
    }
    //endregion
}