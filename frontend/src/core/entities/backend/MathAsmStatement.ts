import LogicMove from "./LogicMove";
import StatementSide from "../../enums/StatementSide";
import StatementType from "../../enums/StatementType";
import StatementUtils from "../../utils/StatementUtils";
import SentenceMatch from "../frontend/SentenceMatch";

export default class MathAsmStatement {
    id:number;
    name:string;
    type:number;

    left : number[];
    right : number[];

    isBidirectional: boolean;
    grade: number;

    proof:LogicMove[];


    //region FRONTEND EXTENTIONS
    public _internalId:number;
    //endregion



    //region CONSTRUCTORS AND GENERATORS
    /**
     * clones the given base. sideToClone is one of StatementSide enum, and determines the actual outcome.
     * NOTE: not validation will be done to check whether the cloning is legal. This should be checked before calling this method!
     *  */
    static clone(base:MathAsmStatement, sideToClone:StatementSide, targetId:number) : MathAsmStatement {
        const ret = new MathAsmStatement();

        ret.left = sideToClone===StatementSide.RIGHT? base.right.slice() : base.left.slice();
        ret.right = sideToClone===StatementSide.LEFT? base.left.slice() : base.right.slice();
        ret.grade = base.grade;
        ret.isBidirectional = base.isBidirectional;
        ret.id = null;
        ret.name = "";
        ret.type = StatementType.THEOREM_TEMPLATE;
        ret._internalId = targetId;

        return ret;
    }
    //endregion




    //region GETTERS
    static getDisplayName(stmt:MathAsmStatement) : string {
        if(stmt.name) return stmt.name;
        return "Internal "+stmt._internalId;
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
    static findMatches(toBeSearched:number[], toSearch:number[], selectMatches:boolean) : SentenceMatch[] {
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


    //region MODIFIERS
    static matchesToIndices(matches:SentenceMatch[]) : number[] {
        const ret:number[] = [];
        matches.forEach(match => {
            if(match.selected)  ret.push(match.index);
        });
        return ret;
    }

    /**
     * Updates the target parameter, replacing everything that the selections indicate.
     * The selections are given by leftSelection and rightSelection parameters.
     * */
    static performReplacement(target:MathAsmStatement, oldSentence:number[], newSentence:number[], leftSelection:SentenceMatch[], rightSelection:SentenceMatch[]) {
        const leftIndexesToReplace:number[] = MathAsmStatement.matchesToIndices(leftSelection);
        const rightIndexesToReplace:number[] = MathAsmStatement.matchesToIndices(rightSelection);
        if (leftIndexesToReplace.length>0) target.left = MathAsmStatement.replaceInSentence(target.left, newSentence, oldSentence.length, leftIndexesToReplace);
        if (rightIndexesToReplace.length>0) target.right = MathAsmStatement.replaceInSentence(target.right, newSentence, oldSentence.length, rightIndexesToReplace);
    }

    static performReplacementByIndecies(target:MathAsmStatement, oldSentence:number[], newSentence:number[], leftSelection:number[], rightSelection:number[]) {
        if (leftSelection && leftSelection.length>0) target.left = MathAsmStatement.replaceInSentence(target.left, newSentence, oldSentence.length, leftSelection);
        if (rightSelection && rightSelection.length>0) target.right = MathAsmStatement.replaceInSentence(target.right, newSentence, oldSentence.length, rightSelection);
    }

    static copyChunk(targetArray:number[], source:number[], sourceFromIndex:number, sourceToIndex:number) {
        for (let i=sourceFromIndex; i<sourceToIndex; ++i) targetArray.push(source[i]);
    }

    /**
     * Replaces the given indexes (each chunk is oldSentenceLength long) with the newSentence.
     * This function will return a sentence same as targetSentence, but with the changes applied.
     * It is possible (for performance reasons) to return targetSentence itself instead of creating a new array.
     * */
    static replaceInSentence(targetSentence:number[], newSentence:number[], oldSentenceLength:number, indexesToReplace:number[]) {
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
            MathAsmStatement.copyChunk(ret, targetSentence, indexToCopy, indexesToReplace[i]); //push the non-changing part from targetSentence
            MathAsmStatement.copyChunk(ret, newSentence, 0, newSentence.length);                //push the newSentence
            indexToCopy = indexesToReplace[i] + oldSentenceLength;
        }

        //2b. Copy the part of the sentence AFTER the last changing chunk
        MathAsmStatement.copyChunk(ret, targetSentence, indexToCopy, targetSentence.length);
        return ret;
    }
    //endregion
}