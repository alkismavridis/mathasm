/** The codes must be the same as in StatementType.kt */
enum StatementType {
    AXIOM = 1,
    AXIOM_TEMPLATE = 2,
    HYPOTHESIS = 4,

    THEOREM = 65,
    THEOREM_TEMPLATE = 67,
}

export default StatementType;