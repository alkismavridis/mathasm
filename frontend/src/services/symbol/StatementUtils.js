import SelectionType from "../../enums/SelectionType";
import StatementSide from "../../enums/StatementSide";
import StatementType from "../../enums/StatementType";

export default class StatementUtils {
    /**
     * clones the given base. sideToClone is one of StatementSide enum, and determines the actual outcome.
     * NOTE: not validation will be done to check whether the cloning is legal. This should be checked before calling this method!
     *  */
    static clone(base, sideToClone, targetId) {
        return {
            left:  sideToClone===StatementSide.RIGHT? base.right.slice() : base.left.slice(),
            right: sideToClone===StatementSide.LEFT? base.left.slice() : base.right.slice(),
            grade: base.grade,
            isBidirectional: base.isBidirectional,
            id:null,
            _internalId:targetId,
            name:"",
            type:StatementType.THEOREM_TEMPLATE
        };
    }

    /**
     * Updates the target parameter, replacing everything that the selections indicate.
     * The selections are given by leftSelection and rightSelection parameters.
     * */
    static performReplacement(target, oldSentence, newSentence, leftSelection, rightSelection) {
        const leftIndexesToReplace = [];
        leftSelection.forEach(match => {
           if(match.selected)  leftIndexesToReplace.push(match.index);
        });

        const rightIndexesToReplace = [];
        rightSelection.forEach(match => {
            if(match.selected)  rightIndexesToReplace.push(match.index);
        });

        if (leftIndexesToReplace.length>0) target.left = StatementUtils.replaceInSentence(target.left, newSentence, oldSentence.length, leftIndexesToReplace);
        if (rightIndexesToReplace.length>0) target.right = StatementUtils.replaceInSentence(target.right, newSentence, oldSentence.length, rightIndexesToReplace);
    }


    static copyChunk(targetArray, source, sourceFromIndex, sourceToIndex) {
        for (let i=sourceFromIndex; i<sourceToIndex; ++i) targetArray.push(source[i]);
    }

    /**
     * Replaces the given indexes (each chunk is oldSentenceLength long) with the newSentence.
     * This function will return a sentence same as targetSentence, but with the changes applied.
     * It is possible (for performance reasons) to return targetSentence itself instead of creating a new array.
     * */
    static replaceInSentence(targetSentence, newSentence, oldSentenceLength, indexesToReplace) {
        const sentenceDif = newSentence.length - oldSentenceLength;

        if (sentenceDif===0) {
            //1. old and new sentence have the same length. This means that we can perform a more efficient algorithm.
            for (let k = 0; k<indexesToReplace.length; ++k) {
                let i = indexesToReplace[k];
                for (let j = 0; j<oldSentenceLength; ++j) {
                    targetSentence[i] = newSentence[j];
                    i++;
                }
            }

            return targetSentence;
        }



        //2a. Copy all chunks to be replaced, plus the non-changing chunks BEFORE them
        const ret = [];
        let indexToCopy = 0;
        for (let i=0; i<indexesToReplace.length; ++i) {
            StatementUtils.copyChunk(ret, targetSentence, indexToCopy, indexesToReplace[i]); //push the non-changing part from targetSentence
            StatementUtils.copyChunk(ret, newSentence, 0, newSentence.length);                //push the newSentence
            indexToCopy = indexesToReplace[i] + oldSentenceLength;
        }

        //2b. Copy the part of the sentence AFTER the last changing chunk
        StatementUtils.copyChunk(ret, targetSentence, indexToCopy, targetSentence.length);
        return ret;
    }



    //region LOGIC RULES
    static isDirectionLegal(base, target, dir) {
        return dir === StatementSide.LEFT || base.isBidirectional;
    }

    /** Determines whether a start move is legal or not. */
    static isStartLegal(base, side) {
        if ((base.type % 2) === 0) return false;
        return side !== StatementSide.RIGHT || base.isBidirectional;
    }

    /** Determines whether an attempting selection is legal. */
    static isSelectionLegal(selectionType, params, base, target, selectionLeft, selectionRight) {
        if ((base.type % 2) === 0) return false;

        switch(selectionType) {
            case SelectionType.NONE: break;

            case SelectionType.ALL:
                if (!target.isBidirectional && base.grade <= target.grade) return false;
                break;

            case SelectionType.LEFT:
                if (!target.isBidirectional) return false;
                if(base.grade > target.grade) return false;
                if(selectionLeft.length===0) return false;
                break;

            case SelectionType.RIGHT:
                if (base.grade > target.grade) return false;
                if(selectionRight.length===0) return false;
                break;

            case SelectionType.ONE_IN_LEFT: {
                if (!target.isBidirectional) return false;
                if (base.grade !== 0) return false;

                //check bounds
                const index = (params && params.index) || 0;
                if (selectionLeft[index]==null) return false;
                break;
            }


            case SelectionType.ONE_IN_RIGHT: {
                if (base.grade !== 0) return false;

                //check bounds
                const index = (params && params.index) || 0;
                if (selectionRight[index]==null) return false;
                break;
            }
        }

        return true;
    }

    /** Returns the default selection type for the given base-target pair. */
    static getDefaultSelectionTypeFor(base, target, leftMatches, rightMatches) {
        //1. Try ONE_IN_LEFT selection
        if (leftMatches.length>0 && StatementUtils.isSelectionLegal(SelectionType.ONE_IN_LEFT, {index:0}, base, target, leftMatches, rightMatches)) {
            return SelectionType.ONE_IN_LEFT;
        }

        //2. Try ONE_IN_RIGHT selection
        if (rightMatches.length>0 && StatementUtils.isSelectionLegal(SelectionType.ONE_IN_RIGHT, {index:0}, base, target, leftMatches, rightMatches)) {
            return SelectionType.ONE_IN_RIGHT;
        }

        //3. Try LEFT selection
        if (leftMatches.length>0 && StatementUtils.isSelectionLegal(SelectionType.LEFT, null, base, target, leftMatches, rightMatches)) {
            return SelectionType.LEFT;
        }

        //4. Try RIGHT selection
        if (rightMatches.length>0 && StatementUtils.isSelectionLegal(SelectionType.RIGHT, null, base, target, leftMatches, rightMatches)) {
            return SelectionType.RIGHT;
        }

        //4. Try ALL selection
        if ((leftMatches.length!==0 || rightMatches.length!==0) && StatementUtils.isSelectionLegal(SelectionType.ALL, null, base, target, leftMatches, rightMatches)) {
            return SelectionType.ALL;
        }

        return SelectionType.NONE;
    }

    /** Sets the selected flag of each element of leftMatches and rightMatches arrays, based on the given selectionType. */
    static setupSelection(leftMatches, rightMatches, selectionType, params) {
        switch (selectionType) {
            case SelectionType.NONE:
                leftMatches.forEach(m => m.selected=false);
                rightMatches.forEach(m => m.selected=false);
                break;

            case SelectionType.ONE_IN_LEFT: {
                leftMatches.forEach(m => m.selected = false);
                rightMatches.forEach(m => m.selected = false);
                const indexToSelect = (params && params.index) || 0;                        //select the index specified on parameters, or 0 as default
                if (leftMatches[indexToSelect]) leftMatches[indexToSelect].selected = true; //we select that index
                break;
            }

            case SelectionType.ONE_IN_RIGHT: {
                leftMatches.forEach(m => m.selected = false);
                rightMatches.forEach(m => m.selected = false);
                const indexToSelect = (params && params.index) || 0;                          //select the index specified on parameters, or 0 as default
                if (rightMatches[indexToSelect]) rightMatches[indexToSelect].selected = true; //we select that index
                break;
            }

            case SelectionType.LEFT:
                leftMatches.forEach(m => m.selected=true);
                rightMatches.forEach(m => m.selected=false);
                break;

            case SelectionType.RIGHT:
                leftMatches.forEach(m => m.selected=false);
                rightMatches.forEach(m => m.selected=true);
                break;

            case SelectionType.ALL:
                leftMatches.forEach(m => m.selected=true);
                rightMatches.forEach(m => m.selected=true);
                break;
        }
    }
    //endregion




    //region MATCHING
    /**
     * Accepts to sentences and returns an array with all occurrences of "toSearch" in "toBeSearched".
     * Every occurrence is an object with the index of the occurrence, and a "selected" property that can be used for toggling selections.
     * The return value of this function has all "selected" attributes set to @selectMatches parameter.
     * Selection can be configured later.
     *
     * for example findMatches([1,4,   1,2,   3,   1,2,   3,   1,2  ,9], [1,2])
     * would return: [{index:2, selected:false}, {index:5, selected:false}, {index:8, selected:false}]
     * */
    static findMatches(toBeSearched, toSearch, selectMatches) {
        const ret = [];
        const first = toSearch[0];

        let searchIndex = 0;
        let searchTester;
        const srcLimit = toBeSearched.length - toSearch.length;

        A: while(true) {
            while(true) {					//1. search for first symbol
                if (searchIndex>srcLimit) break A;
                if (toBeSearched[searchIndex] === first) break;	//symbol found!
                searchIndex++;
            }

            searchTester = searchIndex+1;
            for (let index=1; index<toSearch.length; ++index) {			//2. check other symbols
                if (toBeSearched[searchTester] !== toSearch[index]) {
                    searchIndex++;
                    continue A;  //if failed to match, move the pointer one step and start again.
                }
                else searchTester++;
            }

            ret.push({index:searchIndex, selected:selectMatches});
            searchIndex = searchTester; //move the pointer to the next search point
        }

        return ret;
    }
    //endregion
}