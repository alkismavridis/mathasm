import SelectionType from "../enums/SelectionType";
import StatementSide from "../enums/StatementSide";
import StatementType from "../enums/StatementType";
import MathAsmStatement from "../entities/backend/MathAsmStatement";
import SentenceMatch from "../entities/frontend/SentenceMatch";

export default class StatementUtils {

    //region LOGIC RULES
    static isDirectionLegal(base:MathAsmStatement, target:MathAsmStatement, dir:StatementSide) : boolean {
        return dir === StatementSide.LEFT || base.isBidirectional;
    }

    /** Determines whether a start move is legal or not. */
    static isStartLegal(base:MathAsmStatement, side:StatementSide) : boolean {
        if ((base.type % 2) === 0) return false;
        return side !== StatementSide.RIGHT || base.isBidirectional;
    }

    /** Determines whether an attempting selection is legal. */
    static isSelectionLegal(selectionType:SelectionType, params:any, base:MathAsmStatement, target:MathAsmStatement, selectionLeft:SentenceMatch[], selectionRight:SentenceMatch[]) : boolean {
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
    static getDefaultSelectionTypeFor(base:MathAsmStatement, target:MathAsmStatement, leftMatches:SentenceMatch[], rightMatches:SentenceMatch[]) : SelectionType {
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
    static setupSelection(leftMatches:SentenceMatch[], rightMatches:SentenceMatch[], selectionType:SelectionType, params?:any) {
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





}