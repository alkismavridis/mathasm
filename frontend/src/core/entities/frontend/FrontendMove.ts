import MoveType from "../../enums/MoveType";
import SelectionType from "../../enums/SelectionType";
import StatementSide from "../../enums/StatementSide";
import MathAsmStatement from "../backend/MathAsmStatement";
import LogicMove from "../backend/LogicMove";
import BackendMoveType from "../../enums/BackendMoveType";

export default class FrontendMove {
    //region FIELDS
    public moveType: MoveType;
    public targetId: number;
    public base: MathAsmStatement;
    public baseSide: number;
    public selectionType: SelectionType;
    public pos: number;
    public name: string;
    public parentId: number;

    //fields needed for reverting the move
    public prevStatement: MathAsmStatement;     //used for reverting cloning moves.
    private leftIndices:number[];               //used for reverting REPLACE moves (replace in statement and replace in sentence)
    private rightIndices:number[];              //same ^
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


    //region BACKEND MOVE UTILS
    static getBaseForBackendMove(backendMove:LogicMove, baseMap:any, targets:MathAsmStatement[]) : MathAsmStatement {
        //Case 1: External base. Just return it.
        if (backendMove.extBase!=null) return baseMap[backendMove.extBase.id];

        //Case 2: Internal base. Find it, clone it and return the clone.
        const internalBase:MathAsmStatement = targets.find(s => s._internalId==backendMove.intBaseId);
        if(!internalBase) return null;
        return MathAsmStatement.clone(internalBase, StatementSide.BOTH, backendMove.intBaseId);
    }

    static getSelectionTypeForBackendMove(backendMove:LogicMove) : SelectionType {
        switch (backendMove.moveType) {
            case BackendMoveType.REPLACE_ALL: return SelectionType.ALL;
            case BackendMoveType.REPLACE_LEFT: return SelectionType.LEFT;
            case BackendMoveType.REPLACE_RIGHT: return SelectionType.RIGHT;
            case BackendMoveType.ONE_IN_LEFT: return SelectionType.ONE_IN_LEFT;
            case BackendMoveType.ONE_IN_RIGHT: return SelectionType.ONE_IN_RIGHT;
            default:
                console.error("Unexpected backendMove.moveType:", backendMove);
                return null;
        }
    }
    //endregion




    //region START MOVE UTILS
    executeStart(targets:MathAsmStatement[]) {
        const newStatement = MathAsmStatement.clone(this.base, this.baseSide, this.targetId);
        const indexOfTarget = targets.findIndex(t => t._internalId === this.targetId);

        if (indexOfTarget>=0) targets[indexOfTarget] = newStatement;
        else targets.push(newStatement);
    }

    revertStart(targets:MathAsmStatement[]) {
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
                this.leftIndices = MathAsmStatement.matchesToIndices(leftMatches);
                this.rightIndices = MathAsmStatement.matchesToIndices(rightMatches);
                MathAsmStatement.performReplacementByIndecies(target, sentenceToSearch, sentenceToWrite, this.leftIndices, this.rightIndices);
                break;
            }

            case SelectionType.LEFT: {
                const leftMatches = MathAsmStatement.findMatches(target.left, sentenceToSearch, true);
                this.leftIndices = MathAsmStatement.matchesToIndices(leftMatches);
                MathAsmStatement.performReplacementByIndecies(target, sentenceToSearch, sentenceToWrite, this.leftIndices, []);
                break;
            }

            case SelectionType.RIGHT: {
                const rightMatches = MathAsmStatement.findMatches(target.right, sentenceToSearch, true);
                this.rightIndices = MathAsmStatement.matchesToIndices(rightMatches);
                MathAsmStatement.performReplacementByIndecies(target, sentenceToSearch, sentenceToWrite, [], this.rightIndices);
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
        const diffPerMatch = sentenceToWrite.length - sentenceToSearch.length;

        //2. Execute the move
        switch (this.selectionType) {
            case SelectionType.ALL: {
                const leftIndices = this.leftIndices.map((c, index) => c-diffPerMatch*index);
                const rightIndices = this.rightIndices.map((c, index) => c-diffPerMatch*index);
                MathAsmStatement.performReplacementByIndecies(target, sentenceToSearch, sentenceToWrite, leftIndices, rightIndices);
                break;
            }

            case SelectionType.LEFT: {
                const leftIndices = this.leftIndices.map((c, index) => c-diffPerMatch*index);
                MathAsmStatement.performReplacementByIndecies(target, sentenceToSearch, sentenceToWrite, leftIndices, []);
                break;
            }

            case SelectionType.RIGHT: {
                const rightIndices = this.rightIndices.map((c, index) => c-diffPerMatch*index);
                MathAsmStatement.performReplacementByIndecies(target, sentenceToSearch, sentenceToWrite, [], rightIndices);
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