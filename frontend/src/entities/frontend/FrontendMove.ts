import MoveType from "../../enums/MoveType";
import StatementUtils from "../../services/symbol/StatementUtils";
import SelectionType from "../../enums/SelectionType";
import StatementSide from "../../enums/StatementSide";
import MathAsmStatement from "../backend/MathAsmStatement";
import LogicMove from "../backend/LogicMove";

export default class FrontendMove {
    //region FIELDS
    public moveType: MoveType;
    public targetId: number;
    public base: MathAsmStatement;
    public baseSide: number;
    public prevStatement: MathAsmStatement;
    public selectionType: SelectionType;
    public pos: number;
    public name: string;
    public parentId: number;
    //endregion



    //region LIFE CYCLE
    constructor(moveType:MoveType) {
        this.moveType = moveType;
    }

    static newStartMove(targetId:number, base:MathAsmStatement, side:StatementSide, prevStatement:MathAsmStatement) : FrontendMove {
        const ret = new FrontendMove(MoveType.START);

        ret.targetId = targetId;
        ret.base = base;
        ret.baseSide = side;
        ret.prevStatement = prevStatement;

        return ret;
    }

    static newReplaceMove(targetId:number, base:MathAsmStatement, baseSide:StatementSide, selectionType:SelectionType, pos:number) : FrontendMove {
        const ret = new FrontendMove(MoveType.REPLACE);

        ret.targetId = targetId;
        ret.base = base;
        ret.baseSide = baseSide;
        ret.selectionType = selectionType;
        ret.pos = pos;

        return ret;
    }

    static newSaveMove(targetId:number, name:string, parentId:number) : FrontendMove {
        const ret = new FrontendMove(MoveType.SAVE);

        ret.targetId = targetId;
        ret.name = name;
        ret.parentId = parentId;

        return ret;
    }
    //endregion



    //region START MOVE UTILS
    executeStart(targets) {
        const newStatement = MathAsmStatement.clone(this.base, this.baseSide, this.targetId);
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
    executeReplace(targets: MathAsmStatement[]) {
        //1. Calculate useful parameters
        const target = targets.find(t => t._internalId===this.targetId);
        const sentenceToSearch = this.baseSide===StatementSide.LEFT? this.base.left : this.base.right;
        const sentenceToWrite = this.baseSide===StatementSide.LEFT? this.base.right : this.base.left;

        //2. Execute the move
        switch (this.selectionType) {
            case SelectionType.ALL: {
                const leftMatches = MathAsmStatement.findMatches(target.left, sentenceToSearch, true);
                const rightMatches = MathAsmStatement.findMatches(target.right, sentenceToSearch, true);
                MathAsmStatement.performReplacement(target, sentenceToSearch, sentenceToWrite, leftMatches, rightMatches);
                break;
            }

            case SelectionType.LEFT: {
                const leftMatches = MathAsmStatement.findMatches(target.left, sentenceToSearch, true);
                MathAsmStatement.performReplacement(target, sentenceToSearch, sentenceToWrite, leftMatches, []);
                break;
            }

            case SelectionType.RIGHT: {
                const rightMatches = MathAsmStatement.findMatches(target.right, sentenceToSearch, true);
                MathAsmStatement.performReplacement(target, sentenceToSearch, sentenceToWrite, [], rightMatches);
                break;
            }

            case SelectionType.ONE_IN_LEFT: {
                const leftMatches = [{index:this.pos, selected:true}];
                MathAsmStatement.performReplacement(target, sentenceToSearch, sentenceToWrite, leftMatches, []);
                break;
            }

            case SelectionType.ONE_IN_RIGHT: {
                const rightMatches = [{index:this.pos, selected:true}];
                MathAsmStatement.performReplacement(target, sentenceToSearch, sentenceToWrite, [], rightMatches);
                break;
            }
        }
    }

    revertReplace(targets:MathAsmStatement[]) {
        //1. Calculate useful parameters
        const target = targets.find(t => t._internalId===this.targetId);
        const sentenceToSearch = this.baseSide===StatementSide.LEFT? this.base.right : this.base.left;
        const sentenceToWrite = this.baseSide===StatementSide.LEFT? this.base.left : this.base.right;

        //2. Execute the move
        switch (this.selectionType) {
            case SelectionType.ALL: {
                const leftMatches = MathAsmStatement.findMatches(target.left, sentenceToSearch, true);
                const rightMatches = MathAsmStatement.findMatches(target.right, sentenceToSearch, true);
                MathAsmStatement.performReplacement(target, sentenceToSearch, sentenceToWrite, leftMatches, rightMatches);
                break;
            }

            case SelectionType.LEFT: {
                const leftMatches = MathAsmStatement.findMatches(target.left, sentenceToSearch, true);
                MathAsmStatement.performReplacement(target, sentenceToSearch, sentenceToWrite, leftMatches, []);
                break;
            }

            case SelectionType.RIGHT: {
                const rightMatches = MathAsmStatement.findMatches(target.right, sentenceToSearch, true    );
                MathAsmStatement.performReplacement(target, sentenceToSearch, sentenceToWrite, [], rightMatches);
                break;
            }

            case SelectionType.ONE_IN_LEFT: {
                const leftMatches = [{index:this.pos, selected:true}];
                MathAsmStatement.performReplacement(target, sentenceToSearch, sentenceToWrite, leftMatches, []);
                break;
            }

            case SelectionType.ONE_IN_RIGHT: {
                const rightMatches = [{index:this.pos, selected:true}];
                MathAsmStatement.performReplacement(target, sentenceToSearch, sentenceToWrite, [], rightMatches);
                break;
            }
        }
    }
    //endregion



    //region GENERAL API
    execute(targets:MathAsmStatement[]) {
        switch (this.moveType) {
            case MoveType.START: this.executeStart(targets); break;
            case MoveType.REPLACE: this.executeReplace(targets); break;
            case MoveType.SAVE: break; //do nothing
        }
    }

    revert(targets:MathAsmStatement[]) {
        switch (this.moveType) {
            case MoveType.START: this.revertStart(targets); break;
            case MoveType.REPLACE: this.revertReplace(targets); break;
            case MoveType.SAVE: break; //do nothing
        }
    }
    //endregion
}