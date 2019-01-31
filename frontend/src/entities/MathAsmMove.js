import MoveType from "../constants/MoveType";
import StatementUtils from "../services/symbol/StatementUtils";
import SelectionType from "../constants/SelectionType";
import StatementSide from "../constants/StatementSide";

export default class MathAsmMove {
    //region LIFE CYCLE
    constructor(moveType) {
        this.moveType = moveType;
    }

    static newStartMove(targetId, base, side, prevStatement) {
        const ret = new MathAsmMove(MoveType.START);

        ret.targetId = targetId;
        ret.base = base;
        ret.baseSide = side;
        ret.prevStatement = prevStatement;

        return ret;
    }

    static newReplaceMove(targetId, base, baseSide, selectionType, pos) {
        const ret = new MathAsmMove(MoveType.REPLACE);

        ret.targetId = targetId;
        ret.base = base;
        ret.baseSide = baseSide;
        ret.selectionType = selectionType;
        ret.pos = pos;

        return ret;
    }

    static newSaveMove(targetId, name, parentId) {
        const ret = new MathAsmMove(MoveType.SAVE);

        ret.targetId = targetId;
        ret.name = name;
        ret.parentId = parentId;

        return ret;
    }
    //endregion



    //region START MOVE UTILS
    executeStart(targets) {
        const newStatement = StatementUtils.clone(this.base, this.baseSide, this.targetId);
        const indexOfTarget = targets.findIndex(t => t._internalId === this.targetId);

        if (indexOfTarget>=0) targets[indexOfTarget] = newStatement;
        else targets.push(newStatement);
    }

    revertStart(targets) {
        const indexOfTarget = targets.findIndex(t => t._internalId === this.targetId);
        if (indexOfTarget<0) return;

        if (this.prevStatement) targets[indexOfTarget] = this.prevStatement;
        else targets.splice(indexOfTarget, 1);
    }
    //endregion




    //region REPLACE MOVES UTILS
    executeReplace(targets) {
        //1. Calculate useful parameters
        const target = targets.find(t => t._internalId===this.targetId);
        const sentenceToSearch = this.baseSide===StatementSide.LEFT? this.base.left : this.base.right;
        const sentenceToWrite = this.baseSide===StatementSide.LEFT? this.base.right : this.base.left;

        //2. Execute the move
        switch (this.selectionType) {
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
                const leftMatches = [{index:this.pos, selected:true}];
                StatementUtils.performReplacement(target, sentenceToSearch, sentenceToWrite, leftMatches, []);
                break;
            }

            case SelectionType.ONE_IN_RIGHT: {
                const rightMatches = [{index:this.pos, selected:true}];
                StatementUtils.performReplacement(target, sentenceToSearch, sentenceToWrite, [], rightMatches);
                break;
            }
        }
    }

    revertReplace(targets) {
        //1. Calculate useful parameters
        const target = targets.find(t => t._internalId===this.targetId);
        const sentenceToSearch = this.baseSide===StatementSide.LEFT? this.base.right : this.base.left;
        const sentenceToWrite = this.baseSide===StatementSide.LEFT? this.base.left : this.base.right;

        //2. Execute the move
        switch (this.selectionType) {
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
                const leftMatches = [{index:this.pos, selected:true}];
                StatementUtils.performReplacement(target, sentenceToSearch, sentenceToWrite, leftMatches, []);
                break;
            }

            case SelectionType.ONE_IN_RIGHT: {
                const rightMatches = [{index:this.pos, selected:true}];
                StatementUtils.performReplacement(target, sentenceToSearch, sentenceToWrite, [], rightMatches);
                break;
            }
        }
    }
    //endregion



    //region GENERAL API
    execute(targets) {
        switch (this.moveType) {
            case MoveType.START: this.executeStart(targets); break;
            case MoveType.REPLACE: this.executeReplace(targets); break;
            case MoveType.SAVE: break; //do nothing
        }
    }

    revert(targets) {
        switch (this.moveType) {
            case MoveType.START: this.revertStart(targets); break;
            case MoveType.REPLACE: this.revertReplace(targets); break;
            case MoveType.SAVE: break; //do nothing
        }
    }
    //endregion
}