export default class SortingUtils {
    //region SYMBOL SORTING
    static sortSymbolsById(symbols) {
        return symbols.sort((s1,s2) => s1.uid - s2.uid);
    }
    //endregion




    //region STATEMENT SORTING
    static sortStatementsById(statements) {
        return statements.sort((s1,s2) => s1.id - s2.id);
    }
    //endregion
}