package eu.alkismavridis.mathasm.core.proof
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
    private val theoremTemplates = mutableListOf<MathAsmStatement>()
    var selectedBase: MathAsmStatement? = null; private set
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
    fun getTemplate(index:Int) : MathAsmStatement? { return this.theoremTemplates[index] }
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

    fun getInternal(index:Int) : MathAsmStatement {
        try { return this.theoremTemplates[index] }
        catch (e:Exception) {
            throw MathAsmException(ErrorCode.ILLEGAL_INTERNAL_SELECT)
        }
    }

    fun getSourceSide(dir:Byte) : Byte {
        return (
            if (dir == LogicMove_LTR) MathAsmStatement_LEFT_SIDE
            else MathAsmStatement_RIGHT_SIDE
        )
    }

    fun assertBaseNotNull() {
        if (this.selectedBase!=null) return
        throw MathAsmException(ErrorCode.NULL_BASE)
    }
    //endregion




    //region MOVE EXECUTION
    fun executeMove(move:LogicMove) {
        when (move.getType()) {
            LOGIC_MOVE_INT_SELECT -> this.executeInternalSelectMove(move as InternalSelectMove)
            LOGIC_MOVE_EXT_SELECT -> this.executeExternalSelectMove(move as ExternalSelectMove)

            LOGIC_MOVE_START -> this.executeStartMove(move as StartMove)
            LOGIC_MOVE_REPLACE_ALL -> this.executeReplaceAllMove(move as ReplaceAllMove)
            LOGIC_MOVE_REPLACE_PHRASE -> this.executeReplaceSentenceMove(move as ReplaceSentenceMove)
            LOGIC_MOVE_REPLACE_ONE -> this.executeReplaceOneMove(move as ReplaceOneMove)

            LOGIC_MOVE_SAVE -> this.executeSaveMove(move as SaveMove)
        }
    }


    //selects
    fun executeInternalSelectMove(move:InternalSelectMove) {
        this.selectedBase = this.getInternal(move.templateIndex)
    }

    fun executeExternalSelectMove(move:ExternalSelectMove) {
        this.selectedBase = this.getExternal(move.id)
    }


    //theorem building
    fun executeStartMove(move:StartMove) {
        this.assertBaseNotNull()

        //our action is based on the index given. We will re-initialize an existing template, or create a new one
        val currentSize = this.theoremTemplates.size
        if (move.templateIndex>=0 && move.templateIndex<currentSize) {
            //perform start on an already initialized template
            this.theoremTemplates[move.templateIndex].start(this.selectedBase!!, move.side, true, 0, 0)

        }
        else if (move.templateIndex==currentSize) {
            //initialize new Sentence and push it into the template list
            val newTemplate = this.onGenerateTheorem.generate(this.selectedBase!!, move.side, true)
            this.theoremTemplates.add(newTemplate)
        }

        //out of bounds
        else {
            throw MathAsmException(ErrorCode.ILLEGAL_INDEX_FOR_THEOREM_START, "Out of bounds. Could not start theorem template at index ${move.templateIndex}")
        }
    }

    fun executeReplaceAllMove(move:ReplaceAllMove) {
        this.assertBaseNotNull()

        this.getInternal(move.templateIndex)
                .selectAll(move, this.selectedBase!!, this.selection, true)
                .replace(this.getSourceSide(move.dir), this.selectedBase!!, this.selection)
    }

    fun executeReplaceSentenceMove(move:ReplaceSentenceMove) {
        this.assertBaseNotNull()

        this.getInternal(move.templateIndex)
                .selectPhrase(move, this.selectedBase!!, this.selection, true)
                .replace(this.getSourceSide(move.dir), this.selectedBase!!, this.selection)
    }

    fun executeReplaceOneMove(move:ReplaceOneMove) {
        this.assertBaseNotNull()

        this.getInternal(move.templateIndex)
                .selectSingle(move, this.selectedBase!!, this.selection, true)
                .replace(this.getSourceSide(move.dir), this.selectedBase!!, this.selection)
    }

    //saving
    fun executeSaveMove(move:SaveMove) {
        //1. Clone the MathAsmStatement
        val theoremToSave = this.getInternal(move.templateIndex)
        theoremToSave.type = MathAsmStatement_THEOREM

        //2. Persist it and add it into out saved list
        this.onSaveTheorem.save(theoremToSave, move.parentId, move.name)
    }
    //endregion
}