package eu.alkismavridis.mathasm.core.enums

/**
 * CONVENTIONS:
 * 1. Statement types that are allowed to be used as bases are ODD.
 *    Even ones shall not be used as bases
 *
 * 2. Proven statements have values over 64
 *    Freely created statements have values under 64
 *
 * NOTE: PLEASE UPDATE StatementType.js if this is changed!
 * */
const val StatementType_AXIOM:Byte = 1
const val StatementType_AXIOM_TEMPLATE:Byte = 2
const val StatementType_HYPOTHESIS:Byte = 4

const val StatementType_THEOREM:Byte = 65
const val StatementType_THEOREM_TEMPLATE:Byte = 67