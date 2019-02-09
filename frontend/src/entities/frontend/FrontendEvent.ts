import MathAsmSymbol from "../backend/MathAsmSymbol";
import MathAsmStatement from "../backend/MathAsmStatement";
import StatementSide from "../../enums/StatementSide";

export enum MathAsmEventType {
    //ENTITY CREATION
    DIR_CREATED = 1,
    SYMBOL_CREATED = 2,
    STATEMENT_CREATED = 3,

    //APP_EVENTS
    DIR_SELECTED = 1001,
    SYMBOL_SELECTED = 1002,
    STATEMENT_SELECTED = 1003,
}


export class FrontendEvent {

    //region FIELDS
    public type:MathAsmEventType;
    public symbol:MathAsmSymbol;
    public statement:MathAsmStatement;
    public side:StatementSide;
    //endregion



    //region CONSTRUCTORS AND STATIC GENERATORS
    /**
     * Creates an event that indicates that a symbol has been clicked.
     * If that symbol was part of a statement, it is possible that the handler cares more about the statement (or sentence)
     * than the symbol itself.
     *
     * Thus, this event provides information about the statement, and the location of the symbol in that statement.
     * Those information can be undefined, if the symbol was not a part of a statement.
     * */
    static makeSymbolSelect(symbol:MathAsmSymbol, statementOfSymbol?:MathAsmStatement, sideInStatement?:StatementSide) : FrontendEvent {
        const ret = new FrontendEvent();
        ret.type = MathAsmEventType.SYMBOL_SELECTED;
        ret.symbol = symbol;
        ret.statement = statementOfSymbol;
        ret.side = sideInStatement;

        return ret;
    }

    static makeStatementSelect(statement) : FrontendEvent{
        return {
            type: MathAsmEventType.STATEMENT_SELECTED,
            statement:statement,
            symbol:null,
            side:null
        };
    }
    //endregion
}