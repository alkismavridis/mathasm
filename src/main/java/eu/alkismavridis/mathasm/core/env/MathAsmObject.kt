package eu.alkismavridis.mathasm.core.env

import eu.alkismavridis.mathasm.core.sentence.MathAsmStatement
import java.util.stream.Stream

abstract class MathAsmObject {
    //region FIELDS
    open var id:Long? = null

    /** The name should be unique within its parent.
     *  It is used by DB for navigation in the graph. */
    open var name:String = ""
    //endregion



    //region LOGIC VALUE OVERRIDES
    //getters
    abstract fun getSentence(index:Int) : MathAsmStatement?
    abstract fun getObject(index:Int) : MathAsmObject?

    //sentence setters
    abstract fun add(value: MathAsmStatement)
    abstract fun add(index:Int, value: MathAsmStatement)
    abstract fun set(index:Int, value: MathAsmStatement)

    //object setters
    abstract fun add(value: MathAsmObject)
    abstract fun add(index:Int, value: MathAsmObject)
    abstract fun set(index:Int, value: MathAsmObject)
    //endregion
}