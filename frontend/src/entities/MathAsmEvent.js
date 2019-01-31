export const MathAsmEventType = {
    //ENTITY CREATION
    DIR_CREATED:1,
    SYMBOL_CREATED:2,
    STATEMENT_CREATED:3,

    //APP_EVENTS
    DIR_SELECTED:1001,
    SYMBOL_SELECTED:1002,
    STATEMENT_SELECTED:1003,
};


export class MathAsmEvent {
    /**
     * Creates an event that indicates that a symbol has been clicked.
     * If that symbol was part of a statement, it is possible that the handler cares more about the statement (or sentence)
     * than the symbol itself.
     *
     * Thus, this event provides information about the statement, and the location of the symbol in that statement.
     * Those information can be undefined, if the symbol was not a part of a statement.
     * */
    static makeSymbolSelect(symbol, /*optional*/ statementOfSymbol, /*optional*/ sideInStatement) {
        return {
            type:  MathAsmEventType.SYMBOL_SELECTED,
            symbol:symbol,
            statement:statementOfSymbol,
            side:sideInStatement
        };
    }

    static makeStatementSelect(statement) {
        return {
            type: MathAsmEventType.STATEMENT_SELECTED,
            statement:statement
        };
    }
}