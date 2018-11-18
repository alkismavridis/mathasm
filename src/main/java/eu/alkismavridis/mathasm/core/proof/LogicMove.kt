package eu.alkismavridis.mathasm.core.proof



//directions
const val LogicMove_LTR:Byte = 1
const val LogicMove_RTL:Byte = 2


//region MOVE CODES
const val LOGIC_MOVE_INT_SELECT:Byte = 1
const val LOGIC_MOVE_EXT_SELECT:Byte = 2

const val LOGIC_MOVE_START:Byte = 3
const val LOGIC_MOVE_REPLACE_ALL:Byte = 4
const val LOGIC_MOVE_REPLACE_PHRASE:Byte = 5
const val LOGIC_MOVE_REPLACE_ONE:Byte = 6

const val LOGIC_MOVE_SAVE:Byte = 7
//endregion



abstract class LogicMove(index:Int) {
    val index = index //TODO maybe remove the index property
    abstract fun getType() : Byte //one of LOGIC_MOVE_XXX codes
}


/** selects a theorem template from the current executors list.
 * Many other moves that follow this move will be based on that selection.
 * Selecting a sentence will replace the previous selection.
 * */
class InternalSelectMove(index:Int, templateIndex:Int) : LogicMove(index) {
    val templateIndex:Int = templateIndex

    override fun getType(): Byte = LOGIC_MOVE_INT_SELECT
}

/** selects an existing theorem from the env.
 * Many other moves that follow this move will be based on that selection.
 * Selecting a sentence will replace the previous selection.
 * */
class ExternalSelectMove(index:Int, id:Long) : LogicMove(index) {
    val id:Long = id

    override fun getType(): Byte = LOGIC_MOVE_EXT_SELECT

}

/** initializes a theorem template, based on the selected sentence. */
class StartMove(index:Int, templateIndex: Int, side: Byte) : LogicMove(index) {
    val templateIndex:Int = templateIndex
    val side:Byte = side

    override fun getType(): Byte = LOGIC_MOVE_START
}

/** Replaces all occurrences of the selected sentence in the a theorem template. */
class ReplaceAllMove(index:Int, templateIndex: Int, dir:Byte) : LogicMove(index) {
    val templateIndex:Int = templateIndex
    val dir:Byte = dir

    override fun getType(): Byte = LOGIC_MOVE_REPLACE_ALL

}

/** Replaces all occurrences of the selected sentence in one phrase of a theorem template. */
class ReplaceSentenceMove(index:Int, templateIndex: Int, dir:Byte, side:Byte) : LogicMove(index) {
    val templateIndex:Int = templateIndex
    val dir:Byte = dir
    val side:Byte = side

    override fun getType(): Byte = LOGIC_MOVE_REPLACE_PHRASE

}

/** Replaces a single occurrence of the selected sentence in a theorem template. */
class ReplaceOneMove(index:Int, templateIndex: Int, dir:Byte, side:Byte, position:Int) : LogicMove(index) {
    val templateIndex:Int = templateIndex
    val dir:Byte = dir
    val side:Byte = side
    val position:Int = position

    override fun getType(): Byte = LOGIC_MOVE_REPLACE_ONE

}

/**
 * Persists the given theorem template into DB.
 * Please note that the proof may continue and thus, multiple theorems may be generated by one proof.
 */
class SaveMove(
    index:Int,
    val templateIndex: Int,
    val parentId:Long,
    val name:String
) : LogicMove(index) {
    override fun getType(): Byte = LOGIC_MOVE_SAVE
}