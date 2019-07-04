package eu.alkismavridis.mathasm.api.resolvers

import com.coxautodev.graphql.tools.GraphQLResolver
import eu.alkismavridis.mathasm.api.types.MathAsmProofWrapper
import eu.alkismavridis.mathasm.core.proof.LogicMove
import eu.alkismavridis.mathasm.db.entities.LogicMoveEntity
import eu.alkismavridis.mathasm.db.entities.MathAsmProof
import eu.alkismavridis.mathasm.db.entities.MathAsmStatementEntity
import eu.alkismavridis.mathasm.services.App

class StatementResolver: GraphQLResolver<MathAsmStatementEntity> {
    //region FIELDS
    val app:App


    constructor(app: App) {
        this.app = app;
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

    fun proof(stmt:MathAsmStatementEntity) : MathAsmProofWrapper? {
        return if(stmt.proof==null) null else MathAsmProofWrapper(stmt.proof!!.moves)
    }
    //endregion
}