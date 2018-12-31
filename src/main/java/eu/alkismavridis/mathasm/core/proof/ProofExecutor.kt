package eu.alkismavridis.mathasm.core.proof
import eu.alkismavridis.mathasm.core.enums.*
import java.util.function.Function


import eu.alkismavridis.mathasm.core.error.ErrorCode
import eu.alkismavridis.mathasm.core.error.MathAsmException
import eu.alkismavridis.mathasm.core.sentence.*

class ProofExecutor {
    //region FIELDS
    //input parameters
    private val statementProvider:Function<Long, MathAsmStatement?>
    private val onSaveTheorem: TheoremSaver
    private val onGenerateTheorem: TheoremGenerator

    //state
    private val statementCache = mutableMapOf<Long, MathAsmStatement>()
    private val targets = mutableMapOf<Long, MathAsmStatement>()
    private val selection: LogicSelection = LogicSelection(64)
    //endregion


    //region LIFE CYCLE
    constructor(sentenceProvider:Function<Long, MathAsmStatement?>, onSaveTheorem:TheoremSaver, onGenerateTheorem: TheoremGenerator) {
        this.statementProvider = sentenceProvider
        this.onSaveTheorem = onSaveTheorem
        this.onGenerateTheorem = onGenerateTheorem
    }
    //endregion


    //region GETTERS
    fun getTarget(index:Long) : MathAsmStatement? { return this.targets[index] }
    fun getBaseCache() : Map<Long, MathAsmStatement> { return this.statementCache }
    //endregion



    //region UTIL FUNCTIONS
    fun getExternal(id:Long) : MathAsmStatement {
        //1. First search in the cache.
        var ret = statementCache[id]
        if (ret!=null) return ret

        //2. Get the statement from the provider
        ret = statementProvider.apply(id)
        if (ret==null) throw MathAsmException(ErrorCode.STATEMENT_NOT_FOUND)

        //3. Save the fetched sentence into the cache and return ist
        this.statementCache[id] = ret
        return ret
    }

    fun getInternal(index:Long) : MathAsmStatement {
        try { return this.targets[index]!! }
        catch (e:Exception) {
            throw MathAsmException(ErrorCode.ILLEGAL_INTERNAL_SELECT)
        }
    }

    fun assertBaseNotNull(base:MathAsmStatement?) {
        if (base!=null) return
        throw MathAsmException(ErrorCode.NULL_BASE)
    }

    /** Returns a base, either from within (internal), or from outside the proof (external). */
    fun getBase(intBaseId:Long?, extBaseId:Long?) : MathAsmStatement? {
        if (intBaseId!=null) return this.getInternal(intBaseId)
        else if(extBaseId!=null) return this.getExternal(extBaseId)
        else throw MathAsmException(ErrorCode.NULL_BASE)
    }
    //endregion




    //region MOVE EXECUTION
    fun executeMove(move:LogicMove) {
        when (move.moveType) {
            MoveType_START -> this.executeStartMove(move)
            MoveType_SAVE -> this.executeSaveMove(move)

            MoveType_REPLACE_ALL -> this.executeReplaceAllMove(move)

            MoveType_REPLACE_LEFT -> this.executeReplaceSentenceMove(move)
            MoveType_REPLACE_RIGHT -> this.executeReplaceSentenceMove(move)

            MoveType_ONE_IN_LEFT -> this.executeReplaceOneMove(move)
            MoveType_ONE_IN_RIGHT -> this.executeReplaceOneMove(move)
        }
    }



    //theorem building
    fun executeStartMove(move:LogicMove) {
        val base = this.getBase(move.intBaseId, move.extBaseId)
        this.assertBaseNotNull(base)

        //our action is based on the index given. We will re-initialize an existing template, or create a new one
        if (this.targets.containsKey(move.targetId)) {
            //perform start on an already initialized template
            this.targets[move.targetId]!!.start(base!!, move.side, true, 0, 0)

        }
        else  {
            //initialize new Sentence and push it into the template list
            val newTemplate = this.onGenerateTheorem.generate(base, move.side, true)
            this.targets[move.targetId] = newTemplate
        }
    }

    fun executeReplaceAllMove(move:LogicMove) {
        val base = this.getBase(move.intBaseId, move.extBaseId)
        this.assertBaseNotNull(base)

        this.getInternal(move.targetId)
                .selectAll(move, base!!, this.selection, true)
                .replace(move.side, base, this.selection)
    }

    fun executeReplaceSentenceMove(move:LogicMove) {
        val base = this.getBase(move.intBaseId, move.extBaseId)
        this.assertBaseNotNull(base)

        this.getInternal(move.targetId)
                .selectPhrase(move, base!!, this.selection, true)
                .replace(move.side, base, this.selection)
    }

    fun executeReplaceOneMove(move:LogicMove) {
        val base = this.getBase(move.intBaseId, move.extBaseId)
        this.assertBaseNotNull(base)

        this.getInternal(move.targetId)
                .selectSingle(move, base!!, this.selection, true)
                .replace(move.side, base, this.selection)
    }

    //saving
    fun executeSaveMove(move:LogicMove) {
        //1. Clone the MathAsmStatement
        val theoremToSave = this.getInternal(move.targetId)

        //2. Persist it and add it into out saved list
        this.onSaveTheorem.save(theoremToSave, move.parentId, move.name)
    }
    //endregion
}