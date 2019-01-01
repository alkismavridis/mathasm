import MoveType from "../constants/MoveType";
import StatementUtils from "../services/symbol/StatementUtils";
import SelectionType from "../constants/SelectionType";
import StatementSide from "../constants/StatementSide";

export default class MathAsmMove {
    //region START MOVE UTILS
    static newStartMove(targetId, base, side, prevStatement) {
        return {
            moveType:MoveType.START,
            targetId:targetId,        //null means: "append at the end of the array"
            base:base,
            baseSide:side,
            prevStatement:prevStatement,
        };
    }

    static executeStart(startMove, targets) {
        const newStatement = StatementUtils.clone(startMove.base, startMove.baseSide, startMove.targetId);
        const indexOfTarget = targets.findIndex(t => t._internalId === startMove.targetId);

        if (indexOfTarget>=0) targets[indexOfTarget] = newStatement;
        else targets.push(newStatement);
    }

    static revertStart(startMove, targets) {
        const indexOfTarget = targets.findIndex(t => t._internalId === startMove.targetId);
        if (indexOfTarget<0) return;

        if (startMove.prevStatement) targets[indexOfTarget] = startMove.prevStatement;
        else targets.splice(indexOfTarget, 1);
    }
    //endregion




    //region REPLACE MOVES UTILS
    static newReplaceMove(targetId, base, baseSide, selectionType, pos) {
        return {
            moveType:MoveType.REPLACE,
            targetId:targetId,
            base:base,
            baseSide:baseSide,
            selectionType:selectionType,
            pos:pos,
        };
    }

    static executeReplace(repMove, targets) {
        //1. Calculate useful parameters
        const target = targets.find(t => t._internalId===repMove.targetId);
        const sentenceToSearch = repMove.baseSide===StatementSide.LEFT? repMove.base.left : repMove.base.right;
        const sentenceToWrite = repMove.baseSide===StatementSide.LEFT? repMove.base.right : repMove.base.left;

        //2. Execute the move
        switch (repMove.selectionType) {
            case SelectionType.ALL: {
                const leftMatches = StatementUtils.findMatches(target.left, sentenceToSearch, true);
                const rightMatches = StatementUtils.findMatches(target.right, sentenceToSearch, true);
                StatementUtils.performReplacement(target, sentenceToSearch, sentenceToWrite, leftMatches, rightMatches);
                break;
            }

            case SelectionType.LEFT: {
                const leftMatches = StatementUtils.findMatches(target.left, sentenceToSearch, true);
                StatementUtils.performReplacement(target, sentenceToSearch, sentenceToWrite, leftMatches, []);
                break;
            }

            case SelectionType.RIGHT: {
                const rightMatches = StatementUtils.findMatches(target.right, sentenceToSearch, true);
                StatementUtils.performReplacement(target, sentenceToSearch, sentenceToWrite, [], rightMatches);
                break;
            }

            case SelectionType.ONE_IN_LEFT: {
                const leftMatches = [{index:repMove.pos, selected:true}];
                StatementUtils.performReplacement(target, sentenceToSearch, sentenceToWrite, leftMatches, []);
                break;
            }

            case SelectionType.ONE_IN_RIGHT: {
                const rightMatches = [{index:repMove.pos, selected:true}];
                StatementUtils.performReplacement(target, sentenceToSearch, sentenceToWrite, [], rightMatches);
                break;
            }
        }
    }

    static revertReplace(repMove, targets) {
        //1. Calculate useful parameters
        const target = targets.find(t => t._internalId===repMove.targetId);
        const sentenceToSearch = repMove.baseSide===StatementSide.LEFT? repMove.base.right : repMove.base.left;
        const sentenceToWrite = repMove.baseSide===StatementSide.LEFT? repMove.base.left : repMove.base.right;

        //2. Execute the move
        switch (repMove.selectionType) {
            case SelectionType.ALL: {
                const leftMatches = StatementUtils.findMatches(target.left, sentenceToSearch, true);
                const rightMatches = StatementUtils.findMatches(target.right, sentenceToSearch, true);
                StatementUtils.performReplacement(target, sentenceToSearch, sentenceToWrite, leftMatches, rightMatches);
                break;
            }

            case SelectionType.LEFT: {
                const leftMatches = StatementUtils.findMatches(target.left, sentenceToSearch, true);
                StatementUtils.performReplacement(target, sentenceToSearch, sentenceToWrite, leftMatches, []);
                break;
            }

            case SelectionType.RIGHT: {
                const rightMatches = StatementUtils.findMatches(target.right, sentenceToSearch, true    );
                StatementUtils.performReplacement(target, sentenceToSearch, sentenceToWrite, [], rightMatches);
                break;
            }

            case SelectionType.ONE_IN_LEFT: {
                const leftMatches = [{index:repMove.pos, selected:true}];
                StatementUtils.performReplacement(target, sentenceToSearch, sentenceToWrite, leftMatches, []);
                break;
            }

            case SelectionType.ONE_IN_RIGHT: {
                const rightMatches = [{index:repMove.pos, selected:true}];
                StatementUtils.performReplacement(target, sentenceToSearch, sentenceToWrite, [], rightMatches);
                break;
            }
        }
    }
    //endregion


    //region SAVE MOVE UTILS
    static newSaveMove(targetId, name, parentId) {
        return {
            moveType:MoveType.SAVE,
            targetId:targetId,
            name:name,
            parentId:parentId,
        };
    }
    //endregion


    //region GENERAL API
    static execute(move, targets) {
        switch (move.moveType) {
            case MoveType.START: MathAsmMove.executeStart(move, targets); break;
            case MoveType.REPLACE: MathAsmMove.executeReplace(move, targets); break;
            case MoveType.SAVE: break; //do nothing
        }
    }
    static revert(move, targets) {
        switch (move.moveType) {
            case MoveType.START: MathAsmMove.revertStart(move, targets); break;
            case MoveType.REPLACE: MathAsmMove.revertReplace(move, targets); break;
            case MoveType.SAVE: break; //do nothing
        }
    }
    //endregion
}