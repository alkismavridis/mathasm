import MathAsmSymbol from "../../entities/backend/MathAsmSymbol";
import MathAsmDir from "../../entities/backend/MathAsmDir";
import MathAsmStatement from "../../entities/backend/MathAsmStatement";

export class SymbolRangeUtils {

    //region UTILS
    static findIndexInSorted(sortedArray:MathAsmSymbol[], newSymbol:MathAsmSymbol) {
        const newId = newSymbol.uid;
        const len = sortedArray.length;

        //TODO write an efficient algorithm for that
        // let testIndex = Math.floor(len/2);
        // let jump = testIndex;
        // while(true) {
        //     const diff = sortedArray[testIndex].uid - newId;
        //     if (diff===0) return -1; //symbol already exists
        //     else if (diff<0)
        // }


        for(let i=0; i<len; ++i) {
            const diff = sortedArray[i].uid - newId; //if positive, current symbol must be AFTER newSymbol
            if (diff===0) return -1; //symbol already exists
            if (diff>0) return i; //symbol place is here.
        }

        return len; //we reached the end.
    }

    /** Sorts the given array by uid, and returns the array. */
    static sort(symbols:MathAsmSymbol[]) {
        symbols.sort((s1,s2) => s2.uid - s1.uid);
        return symbols;
    }
    //endregion


    //region ADDING NEW SYMBOLS IN ARRAY
    /**
     * Adds the given symbol into the given sorted(by uid) array.
     * The symbol will pe appended in the proper index (so that the array stays sorted).
     * Please note that this method assumes that the array is already sorted!
     *
     * If a symbol with the id of the newSymbol si already on the list, this method will have no effect.
     * */
    static addToSorted(sortedArray:MathAsmSymbol[], newSymbol:MathAsmSymbol) {
        const indexToAppend = SymbolRangeUtils.findIndexInSorted(sortedArray, newSymbol);

        if(indexToAppend===-1) return; //symbol already in array.
        else if (indexToAppend===sortedArray.length) sortedArray.push(newSymbol);
        else sortedArray.splice(indexToAppend, 0, newSymbol);
    }
    //endregion



    //region RANGES CREATION
    /** Creates an empty range. */
    // static makeEmptyRange() {
    //     return {
    //         min:null,
    //         max:null,
    //         symbols:[]
    //     };
    // }

    /**
     * Creates a range from the given symbol array.
     * if needSorting is set, the symbols array will be sorted!
     * */
    // static makeRangeFrom(symbols, needSorting) {
    //     if (needSorting) SymbolRangeUtils.sort(symbols);
    //
    //     return SymbolRangeUtils.fitRangeToContent({
    //         min:null,
    //         max:null,
    //         symbols:symbols
    //     });
    // }
    //endregion


    //region RANGE MANAGEMENTS
    /**
     * Sets up the min and max of the given range, based on its symbols.
     * NOTE: symbols must be sorted!
     * */
    // static fitRangeToContent(range) {
    //     const len = range.symbols.length;
    //     if (len===0) {
    //         range.min = null;
    //         range.max = null;
    //     }
    //     else {
    //         range.min = range.symbols[0].uid;
    //         range.max = range.symbols[len-1].uid;
    //     }
    //
    //     return range;
    // }
    //endregion


    //region MAP UTILS
    /**
     * Adds all symbols in the given symbol array to the given map.
     * The key of the map is assumed to be the uid of the symbols
     * */
    static addSymbolsToMap(symbolMap:any, symbols:MathAsmSymbol[]) {
        if (!symbols || !symbolMap) return;
        symbols.forEach(s => {
            symbolMap[s.uid] = s;
        });
    }

    /**
     * Adds into targetIdList all the symbol ids from symbolIds parameter,
     * if those are that are missing from the symbolMap.
     *
     * The idea is to detect which symbol need to be fetched, and fetch them in one request to the server.
     * */
    static addMissingIdsToList(targetIdSet:Set<number>, symbolMap:any, symbolIds:number[]) {
        symbolIds.forEach(id => {
            if (!symbolMap.hasOwnProperty(id)) targetIdSet.add(id);
        });
    }

    /**
     * Adds into targetIdList all the uid from symbols parameter,
     * if those are that are missing from the symbolMap.
     *
     * The idea is to detect which symbol need to be fetched, and fetch them in one request to the server.
     * */
    static addMissingIdsFromSymbolsToList(targetIdSet:Set<number>, symbolMap:any, symbols:MathAsmSymbol[]) {
        symbols.forEach(sym => {
            const id = sym.uid;
            if (!symbolMap.hasOwnProperty(id)) targetIdSet.add(id);
        });
    }

    static addMissingIdsFromStatements(statements:MathAsmStatement[], symbolMap:any, target:Set<number>) {
        statements.forEach(stmt => {
            SymbolRangeUtils.addMissingIdsToList(target, symbolMap, stmt.left);
            SymbolRangeUtils.addMissingIdsToList(target, symbolMap, stmt.right);
        });
    }

    /**
     * return a Set of symbol ids from the given directory, that are not present in symbolMap.
     * Both the statements and the symbols of the directory will be scanned.
     * */
    static getMissingIdsFromDirectory(directory:MathAsmDir, symbolMap:any) : Set<number> {
        //1. Initialize a set.
        const ret = new Set();

        //2. Add all missing symbols from the left and right part of every statement
        SymbolRangeUtils.addMissingIdsFromStatements(directory.statements, symbolMap, ret);

        //3. Add the directory's symbols, too.
        SymbolRangeUtils.addMissingIdsFromSymbolsToList(ret, symbolMap, directory.symbols);

        //4. Done
        return ret;
    }

    static getMissingIdsFromStatements(statements:MathAsmStatement[], symbolMap:any) : Set<number> {
        const ret = new Set();
        SymbolRangeUtils.addMissingIdsFromStatements(statements, symbolMap, ret);
        return ret;
    }
    //endregion



}