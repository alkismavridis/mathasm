package eu.alkismavridis.mathasm.core.error

enum class ErrorCode {
    //region CORE ERRORS
    UNKNOWN(0),
    ILLEGAL_INTERNAL_SELECT(1),
    ILLEGAL_INDEX_FOR_THEOREM_START(2),
    NULL_BASE(3),

    ILLEGAL_DIRECTION(4),
    ILLEGAL_FIRST_PHRASE_EDIT(5),
    BASE_GRADE_TO_BIG(6),
    BASE_GRADE_NOT_ZERO(7),
    MATCH_FAILED(8),
    UNKNOWN_MOVE(9),
    NOT_A_THEOREM_TEMPLATE(10),
    NOT_AN_AXIOM_TEMPLATE(11),
    STATEMENT_NOT_FOUND(12),
    NAME_ALREADY_EXISTS(13),
    //endregion



    //region WEB APP ERRORS
    USER_ALREADY_EXISTS(1000),
    USER_NOT_EXISTS(1001),
    WRONG_PASSWORD(1002),
    UNAUTHORIZED(1003),
    SYMBOL_ALREADY_REGISTERED(1004),
    INVALID_SYMBOL_TEXT(1005),
    NOT_A_STATEMENT(1006),
    NOT_AN_OBJECT(1007),
    OBJECT_NOT_FOUND(1008),
    WRONG_CLASS_INSTANCE(1009)
    //endregion
    ;


    private val value:Int
    constructor(i:Int) {
        this.value = i
    }

    fun getValue():Int = value
}