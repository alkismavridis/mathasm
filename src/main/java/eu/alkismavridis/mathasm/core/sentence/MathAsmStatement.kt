package eu.alkismavridis.mathasm.core.sentence

import eu.alkismavridis.mathasm.core.error.ErrorCode
import eu.alkismavridis.mathasm.core.error.MathAsmException
import eu.alkismavridis.mathasm.core.proof.*
import eu.alkismavridis.mathasm.core.env.SymbolProvider

//Sentence Sides
const val MathAsmStatement_LEFT_SIDE:Byte = 1
const val MathAsmStatement_RIGHT_SIDE:Byte = 2
const val MathAsmStatement_BOTH_SIDES:Byte = 3

//Sentence Types
/**
 * CONVENTIONS:
 * 1. Statement types that are allowed to be used as bases are ODD.
 *    Even ones shall not be used as bases
 *
 * 2. Proven statements have values over 64
 *    Freely created statements have values under 64
 * */
const val MathAsmStatement_AXIOM:Byte = 1
const val MathAsmStatement_AXIOM_TEMPLATE:Byte = 2
const val MathAsmStatement_HYPOTHESIS:Byte = 4

const val MathAsmStatement_THEOREM:Byte = 65
const val MathAsmStatement_THEOREM_TEMPLATE:Byte = 67

open class MathAsmStatement {
    //region FIELDS
    //1. metadata
    open var id:Long? = null
    /** The name should be unique within its parent. It is used by DB for navigation in the graph. */
    open var name:String = ""
    open var type : Byte = -1

    //2. sentences
    open lateinit var sen1 : MathAsmSentence; protected set
    open lateinit var sen2 : MathAsmSentence; protected set

    //3. bridge
    open var bidirectionalFlag: Boolean = false; protected set
    open var grade: Short = 0; protected set
    //endregion




    //region LIFE CYCLE
    constructor() {}
    //endregion




    //region GETTERS AND SETTERS
    fun getPhrase(side:Byte) : MathAsmSentence {
        if (side== MathAsmStatement_LEFT_SIDE) return sen1
        return sen2
    }

    fun getLeft() : MathAsmSentence {
        return sen1
    }

    fun getRight() : MathAsmSentence {
        return sen2
    }

    fun getTheOther(side:Byte) : MathAsmSentence {
        if (side== MathAsmStatement_LEFT_SIDE) return sen2
        return sen1
    }

    fun isBidirectional() : Boolean { return bidirectionalFlag }

    fun saveSpace() {
        sen1.saveSpace()
        sen2.saveSpace()
    }
    //endregion



    //region LEGALITY RULES
    fun assertReplaceAllLegality(move:ReplaceAllMove, base: MathAsmStatement) {
        if ((base.type % 2) == 0) throw MathAsmException(ErrorCode.ILLEGAL_BASE)
        if (move.dir == LogicMove_RTL && !base.bidirectionalFlag) throw MathAsmException(ErrorCode.ILLEGAL_DIRECTION)

        if (!this.bidirectionalFlag && base.grade <= this.grade) {
            throw MathAsmException(ErrorCode.ILLEGAL_FIRST_PHRASE_EDIT)
        }
    }

    fun assertReplaceSentenceLegality(move:ReplaceSentenceMove, base: MathAsmStatement) {
        if ((base.type % 2) == 0) throw MathAsmException(ErrorCode.ILLEGAL_BASE)
        if (move.dir == LogicMove_RTL && !base.bidirectionalFlag) throw MathAsmException(ErrorCode.ILLEGAL_DIRECTION)

        if (move.side== MathAsmStatement_LEFT_SIDE) {
            if (!this.bidirectionalFlag) throw MathAsmException(ErrorCode.ILLEGAL_FIRST_PHRASE_EDIT)
            if(base.grade > this.grade) throw MathAsmException(ErrorCode.BASE_GRADE_TO_BIG)
        }
        else {
            if (base.grade > this.grade) throw MathAsmException(ErrorCode.BASE_GRADE_TO_BIG)
        }
    }

    fun assertReplaceOneLegality(move:ReplaceOneMove, base: MathAsmStatement) {
        if ((base.type % 2) == 0) throw MathAsmException(ErrorCode.ILLEGAL_BASE)
        if (move.dir == LogicMove_RTL && !base.bidirectionalFlag) throw MathAsmException(ErrorCode.ILLEGAL_DIRECTION)

        if (move.side== MathAsmStatement_LEFT_SIDE) {
            if (!this.bidirectionalFlag) throw MathAsmException(ErrorCode.ILLEGAL_FIRST_PHRASE_EDIT)

            val side:Byte = if (move.dir == LogicMove_LTR) MathAsmStatement_LEFT_SIDE else MathAsmStatement_RIGHT_SIDE
            if (base.grade != 0.toShort()) throw MathAsmException(ErrorCode.BASE_GRADE_NOT_ZERO)
            if(!sen1.match(base.getPhrase(side), move.position)) throw MathAsmException(ErrorCode.MATCH_FAILED)
        }
        else {
            val side:Byte = if(move.dir == LogicMove_LTR) MathAsmStatement_LEFT_SIDE else MathAsmStatement_RIGHT_SIDE
            if (base.grade != 0.toShort()) throw MathAsmException(ErrorCode.BASE_GRADE_NOT_ZERO)
            if (!sen2.match(base.getPhrase(side), move.position)) throw MathAsmException(ErrorCode.MATCH_FAILED)
        }
    }
    //endregion




    //region SELECTION
    fun selectAll(move:ReplaceAllMove, base: MathAsmStatement, sel: LogicSelection, check:Boolean) : MathAsmStatement {
        if (check) this.assertReplaceAllLegality(move, base)

        val side:Byte = if(move.dir == LogicMove_LTR) MathAsmStatement_LEFT_SIDE else MathAsmStatement_RIGHT_SIDE
        sen1.select(base.getPhrase(side), sel.side1)
        sen2.select(base.getPhrase(side), sel.side2)

        return this
    }

    fun selectPhrase(move:ReplaceSentenceMove, base: MathAsmStatement, sel: LogicSelection, check:Boolean) : MathAsmStatement {
        if (check) this.assertReplaceSentenceLegality(move, base)

        if (move.side == MathAsmStatement_LEFT_SIDE) {
            sel.side2.clear()
            val side:Byte = if(move.dir == LogicMove_LTR) MathAsmStatement_LEFT_SIDE else MathAsmStatement_RIGHT_SIDE
            sen1.select(base.getPhrase(side), sel.side1)
        }
        else {
            sel.side1.clear()
            val side:Byte = if(move.dir == LogicMove_LTR) MathAsmStatement_LEFT_SIDE else MathAsmStatement_RIGHT_SIDE
            sen2.select(base.getPhrase(side), sel.side2)
        }

        return this
    }

    fun selectSingle(move:ReplaceOneMove, base: MathAsmStatement, sel: LogicSelection, check:Boolean) : MathAsmStatement {
        if (check) this.assertReplaceOneLegality(move, base)

        if (move.side == MathAsmStatement_LEFT_SIDE) {
            sel.side1.clear()
            sel.side2.clear()
            sel.side1.add(move.position)
        }
        else {
            sel.side1.clear()
            sel.side2.clear()
            sel.side2.add(move.position)
        }

        return this
    }
    //endregion



    //region THEOREM EDITING
    /**
     * If check si set, the following criteria are checked:
     * - whether this is a template
     * - whether the given starting is legal.
     *
     * It updates:
     * - both sentences sen1, sen2
     * - bridge(both grade and dicetion)
     * - type will be set to THEOREM_TEMPLATE
     *
     * */
    fun start(base: MathAsmStatement, side:Byte, check:Boolean, plus1:Int, plus2:Int) {
        //check legality of the move
        if (check) {
            if (type != MathAsmStatement_THEOREM_TEMPLATE && type != MathAsmStatement_AXIOM_TEMPLATE) throw MathAsmException(ErrorCode.NOT_A_THEOREM_TEMPLATE)
            assertStartLegality(base, side)
        }

        //do it
        when (side) {
            MathAsmStatement_BOTH_SIDES -> {
                sen1.copy(base.sen1, plus1)
                sen2.copy(base.sen2, plus2)
            }

            MathAsmStatement_LEFT_SIDE -> {
                sen2.copy(base.sen1, plus2)
                sen1.copy(base.sen1, plus1)
            }

            MathAsmStatement_RIGHT_SIDE -> {
                sen1.copy(base.sen2, plus1)
                sen2.copy(base.sen2, plus2)
            }

            else -> throw MathAsmException(ErrorCode.UNKNOWN_MOVE)
        }

        this.grade= base.grade
        this.bidirectionalFlag = base.bidirectionalFlag

        this.type = MathAsmStatement_THEOREM_TEMPLATE
    }

    fun replace(side:Byte, base: MathAsmStatement, sel: LogicSelection) {
        if (type != MathAsmStatement_THEOREM_TEMPLATE) throw MathAsmException(ErrorCode.NOT_A_THEOREM_TEMPLATE)
        val old: MathAsmSentence = base.getPhrase(side)
        val newPh: MathAsmSentence = base.getTheOther(side)
        val oldLen:Int = old.getLength()

        if (sel.side1.length>0) sen1.replace(newPh, oldLen, sel.side1)
        if (sel.side2.length>0) sen2.replace(newPh, oldLen, sel.side2)
    }

    /*fun selectAndReplace(base: MathAsmStatement, move: LogicMove, sel: LogicSelection, check:Boolean) : Byte {
        val s:Byte = select_OLD(base, move, sel, check)

        val side:Byte = if (move.dir == LogicMove_LTR) MathAsmStatement_LEFT_SIDE else MathAsmStatement_RIGHT_SIDE
        if (s == LogicMove_LEGAL) replace(side, base, sel)
        return s
    }*/
    //endregion



    //region AXIOM CREATION
    fun setBridge(isBidirectional: Boolean, grade:Short, check:Boolean)  {
        if (check && type != MathAsmStatement_AXIOM_TEMPLATE) throw MathAsmException(ErrorCode.NOT_AN_AXIOM_TEMPLATE)
        this.bidirectionalFlag = isBidirectional
        this.grade = grade
    }

    /** Throws an exception if the sentence is not an axiom template. */
    fun addToFirst(w:Long) {
        if (type != MathAsmStatement_AXIOM_TEMPLATE) {
            throw MathAsmException(ErrorCode.NOT_AN_AXIOM_TEMPLATE, "Cannot add word to a sentence that is not an axtiom template.")
        }
        sen1.add(w)
    }

    fun addToSecond(w:Long) {
        if (type != MathAsmStatement_AXIOM_TEMPLATE) {
            throw MathAsmException(ErrorCode.NOT_AN_AXIOM_TEMPLATE, "Cannot add word to a sentence that is not an axtiom template.")
        }
        sen2.add(w)
    }

    fun stabilizeAxiom() : Boolean {
        if (type != MathAsmStatement_AXIOM_TEMPLATE) return false
        this.type = MathAsmStatement_AXIOM
        return true
    }
    //endregion



    //region SERIALIZATION
    override fun toString() : String {
        val builder = StringBuilder()
        builder.append('"')

        val words1:LongArray = sen1.getWords()
        for (i in 0 until sen1.getLength()) {
            builder.append("${words1[i]} ")
        }

        builder.append("__")
        builder.append(this.grade)
        builder.append(if (this.bidirectionalFlag) "__ " else "-- ")

        val words2:LongArray = sen2.getWords()
        for (i in 0 until sen2.getLength()) {
            builder.append("${words2[i]} ")
        }

        builder.append('"')
        return builder.toString()
    }

    fun toString(font: SymbolProvider) : String {
        val builder = StringBuilder()
        builder.append('"')

        val words1:LongArray = sen1.getWords()
        for (i in 0 until sen1.getLength()) {
            builder.append("${font.get(words1[i])} ")
        }

        builder.append(font.getBridge(this.grade, this.bidirectionalFlag))

        val words2:LongArray = sen2.getWords()
        for (i in 0 until sen2.getLength()) {
            builder.append("${font.get(words2[i])} ")
        }

        builder.append('"')
        return builder.toString()
    }
    //endregion


    companion object {
        fun assertStartLegality(base: MathAsmStatement, side:Byte) {
            if ((base.type % 2) == 0) throw MathAsmException(ErrorCode.ILLEGAL_BASE)
            if (side == MathAsmStatement_RIGHT_SIDE && !base.bidirectionalFlag) {
                throw MathAsmException(ErrorCode.ILLEGAL_DIRECTION)
            }
        }

        fun createAxiom(name:String, left: LongArray, right: LongArray, isBidirectional:Boolean, grade:Short) : MathAsmStatement {
            val ret = MathAsmStatement()
            setupAxiom(ret, name, left, right, isBidirectional, grade)
            return ret
        }

        fun createTheoremTempl(base: MathAsmStatement, side:Byte, check:Boolean = true) : MathAsmStatement {
            val ret = MathAsmStatement()
            setTheoremTemp(ret, base, side, check)
            return ret
        }

        fun setTheoremTemp(ret:MathAsmStatement, base: MathAsmStatement, side:Byte, check:Boolean) {
            ret.type = MathAsmStatement_THEOREM_TEMPLATE
            ret.sen1 = MathAsmSentence(0)
            ret.sen2 = MathAsmSentence(0)
            ret.start(base, side, check, 0, 0)
        }

        fun setupAxiom(target: MathAsmStatement, name:String, left: LongArray, right: LongArray, isBidirectional:Boolean, grade:Short) {
            //1. Setup metadata
            target.name = name
            target.type = MathAsmStatement_AXIOM

            //2. Setup sentences
            target.sen1 = MathAsmSentence(left, true)
            target.sen2 = MathAsmSentence(right, true)

            //3. Setup bridge
            target.bidirectionalFlag = isBidirectional
            target.grade = grade
        }
    }
}