export class SymbolRangeUtils {

    //region UTILS
    static findIndexInSorted(sortedArray, newSymbol) {
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
    static sort(symbols) {
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
    static addToSorted(sortedArray, newSymbol) {
        const indexToAppend = SymbolRangeUtils.findIndexInSorted(sortedArray, newSymbol);

        if(indexToAppend===-1) return; //symbol already in array.
        else if (indexToAppend===sortedArray.length) sortedArray.push(newSymbol);
        else sortedArray.splice(indexToAppend, 0, newSymbol);
    }
    //endregion



    //region RANGES CREATION
    /** Creates an empty range. */
    static makeEmptyRange() {
        return {
            min:null,
            max:null,
            symbols:[]
        };
    }

    /**
     * Creates a range from the given symbol array.
     * if needSorting is set, the symbols array will be sorted!
     * */
    static makeRangeFrom(symbols, needSorting) {
        if (needSorting) SymbolRangeUtils.sort(symbols);

        return SymbolRangeUtils.fitRangeToContent({
            min:null,
            max:null,
            symbols:symbols
        });
    }
    //endregion


    //region RANGE MANAGEMENTS
    /**
     * Sets up the min and max of the given range, based on its symbols.
     * NOTE: symbols must be sorted!
     * */
    static fitRangeToContent(range) {
        const len = range.symbols.length;
        if (len===0) {
            range.min = null;
            range.max = null;
        }
        else {
            range.min = range.symbols[0].uid;
            range.max = range.symbols[len-1].uid;
        }

        return range;
    }
    //endregion
}