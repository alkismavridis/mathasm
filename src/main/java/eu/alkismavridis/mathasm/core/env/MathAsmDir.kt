package eu.alkismavridis.mathasm.core.env

import eu.alkismavridis.mathasm.core.sentence.MathAsmStatement

abstract class MathAsmDir {
    //region FIELDS
    open var id:Long? = null

    /** The name should be unique within its parent.
     *  It is used by DB for navigation in the graph. */
    open var name:String = ""
    //endregion



    //region LOGIC VALUE OVERRIDES
    //getters
    abstract fun getSentence(index:Int) : MathAsmStatement?
    abstract fun getObject(index:Int) : MathAsmDir?

    //sentence setters
    abstract fun add(value: MathAsmStatement)
    abstract fun add(index:Int, value: MathAsmStatement)
    abstract fun set(index:Int, value: MathAsmStatement)

    //object setters
    abstract fun add(value: MathAsmDir)
    abstract fun add(index:Int, value: MathAsmDir)
    abstract fun set(index:Int, value: MathAsmDir)
    //endregion
}