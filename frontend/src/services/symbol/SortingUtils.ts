import MathAsmSymbol from "../../entities/backend/MathAsmSymbol";
import MathAsmStatement from "../../entities/backend/MathAsmStatement";

export default class SortingUtils {
    //region SYMBOL SORTING
    static sortSymbolsById(symbols:MathAsmSymbol[]) {
        return symbols.sort((s1,s2) => s1.uid - s2.uid);
    }
    //endregion




    //region STATEMENT SORTING
    static sortStatementsById(statements:MathAsmStatement[]) {
        return statements.sort((s1,s2) => s1.id - s2.id);
    }
    //endregion
}