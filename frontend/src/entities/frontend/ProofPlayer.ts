import StatementSide from "../../enums/StatementSide";
import SelectionType from "../../enums/SelectionType";
import FrontendProof from "./FrontendProof";
import StatementUtils from "../../services/symbol/StatementUtils";
import MathAsmStatement from "../backend/MathAsmStatement";
import SentenceMatch from "./SentenceMatch";
import FrontendMove from "./FrontendMove";
import MathAsmProofWrapper from "../backend/MathAsmProofWrapper";
import LogicMoveInput from "../backend/inputs/LogicMoveInput";
import MapUtils from "../../services/MapUtils";
import BackendMoveType from "../../enums/BackendMoveType";
import LogicMove from "../backend/LogicMove";

export default class ProofPlayer {
    //region FIELDS
    /** The recorded proof. */
    private proof = new FrontendProof();

    /**
     * Used for navigation through the proof.
     * Points to the index of the last executed move.
     * Thus, -1 indicates that no move has been executed yet.
     * */
    private _currentMoveIndex = -1;

    /**
     * The target pool on which the proof will be working on.
     * The state of this changes during the play.
     * */
    private _targets:MathAsmStatement[] = [];

    /** Selection state */
    private _selectedTargetIndex:number = null;
    private _base:MathAsmStatement = null;
    private _baseSide = StatementSide.LEFT;

    private _leftMatches:SentenceMatch[] = [];
    private _rightMatches:SentenceMatch[] = [];

    private _selectionType = SelectionType.NONE;
    //endregion



    //region LIFE CYCLE
    constructor() {}

    setupFrom(backendProof:MathAsmProofWrapper) {
        //0. Reset state
        this.proof = new FrontendProof();
        this._currentMoveIndex = -1;
        this._targets = [];
        this._selectedTargetIndex = null;
        this._base = null;
        this._baseSide = StatementSide.LEFT;
        this._leftMatches = [];
        this._rightMatches = [];
        this._selectionType = SelectionType.NONE;


        //1. Collect the needed bases for the proof.
        const baseMap = MapUtils.arrayToMap(backendProof.bases);

        //2. Build the frontend proof moves
        for(let backendMove of backendProof.moves) {
            this.addAndExecuteBackendMove(backendMove, baseMap);
        }

        //3. Navigate to the beginning of the proof.
        this.goToMove(-1);
    }
    //endregion


    //region GETTERS
    get currentMoveIndex(): number { return this._currentMoveIndex; }
    get targets(): ReadonlyArray<MathAsmStatement> { return this._targets; }
    get selectedTargetIndex(): number { return this._selectedTargetIndex; }
    get base(): MathAsmStatement { return this._base; }

    get previousBase() : MathAsmStatement {
        const move = this.proof.moves[this._currentMoveIndex];
        return move? move.base : null;
    }

    get baseSide(): StatementSide { return this._baseSide; }
    get leftMatches(): ReadonlyArray<SentenceMatch> { return this._leftMatches; }
    get rightMatches(): ReadonlyArray<SentenceMatch> { return this._rightMatches; }
    get selectionType(): SelectionType { return this._selectionType; }

    /** convenience method that returns the currently selected target, or null, if none is selected. */
    getSelectedTarget() : MathAsmStatement {
        if (this._selectedTargetIndex==null) return null;
        return this._targets[this._selectedTargetIndex];
    }

    private getTargetById(id:number) {
        if(id==null) return null;
        return this._targets.find(s=>s._internalId==id);
    }

    /** Returns a base that is guaranteed to remain immutable. Useful for building proof */
    private getImmutableBase() : MathAsmStatement {
        if (!this._base) return null;
        if (this._base._internalId!=null) return  MathAsmStatement.clone(this._base, StatementSide.BOTH, this._base._internalId);
        return this._base;
    }

    private getSingleReplacementPos() : number {
        switch(this._selectionType){
            case SelectionType.ONE_IN_LEFT: {
                const match = this._leftMatches.find(m => m.selected);
                return match? match.index : null;
            }


            case SelectionType.ONE_IN_RIGHT: {
                const match = this._rightMatches.find(m => m.selected);
                return match? match.index : null;
            }

            default: return null;
        }
    }

    /** Returns the length of the selected sentence of the base, or 0 if no base is selected. */
    getBaseSentenceLength() : number {
        if (!this._base) return 0;

        return this._baseSide===StatementSide.LEFT?
            this._base.left.length :
            this._base.right.length;
    }

    getMoveCount() : number {
        return this.proof.moves.length;
    }

    getMoves() : ReadonlyArray<FrontendMove> {
        return this.proof.moves;
    }

    makeBackendProof() : LogicMoveInput[] {
        return this.proof.toBackendProof();
    }
    //endregion



    //region FIRST-LEVEL SELECTION MANAGEMENT
    /**
     * Updates: base, _baseSide, selectionType, leftMatches, rightMatches.
     * Leaves intact: _selectedTargetIndex
     * */
    setBase(base:MathAsmStatement) {
        //1. Handle null/undefined special case.
        if (base==null) {
            this._base = null;
            this._baseSide = StatementSide.LEFT;
            this._selectionType = SelectionType.NONE;
            this._leftMatches = [];
            this._rightMatches = [];
            return;
        }

        //2. Check if statement can be used as a base
        if ((base.type % 2) === 0) return;

        //3. Update the state
        this._base = base;
        this._baseSide = StatementSide.LEFT;

        this.setupDefaultSelection();
    }

    /** Updates the _selectedTargetIndex, _baseSide that all selection parameters. */
    setTargetIndex(index:number) {
        this._selectedTargetIndex = index;
        this._baseSide = StatementSide.LEFT; //TODO this doesn't have to be that way... Put an if statement.
        this.setupDefaultSelection();
    }

    /** Sets the base direction, if the incoming direction is legal. As no effect otherwise.
     * @return boolean: true if the new direction was legal and the operation succeeded.
     * */
    setBaseDir(newDir:StatementSide) : boolean {
        //1. Check if conditions are correct.
        const target = this.getSelectedTarget();
        if (!this._base || !target || !StatementUtils.isDirectionLegal(this._base, target, newDir)) {
            return false;
        }

        //2. Setup the changes object
        this._baseSide = newDir;
        this.setupDefaultSelection();
        return true;
    }

    /**
     * Setup a default selection for the selected base, _baseSide and template.
     * updates: leftMatches, rightMatches, selectionType.
     * */
    private setupDefaultSelection() {
        const currentTarget = this.getSelectedTarget();
        //1. Check if both template and base is selected
        if (!this._base || !currentTarget) {
            this._leftMatches = [];
            this._rightMatches = [];
            this._selectionType = SelectionType.NONE;
            return;
        }

        //2. Setup the selection arrays
        const sentenceToSearch = this._baseSide===StatementSide.LEFT? this._base.left : this._base.right;
        this._leftMatches = MathAsmStatement.findMatches(currentTarget.left, sentenceToSearch, false);
        this._rightMatches = MathAsmStatement.findMatches(currentTarget.right, sentenceToSearch, false);

        //3. Choose a selection type for the given circumstances
        this._selectionType = StatementUtils.getDefaultSelectionTypeFor(this._base, currentTarget, this._leftMatches, this._rightMatches);
        StatementUtils.setupSelection(this._leftMatches, this._rightMatches, this._selectionType);
    }
    //endregion



    //region LEVEL-2 SELECTION MANAGEMENT
    setSelection(selectionType:SelectionType, params:any) : boolean {
        const target = this.getSelectedTarget();
        if (!target || !this._base || !StatementUtils.isSelectionLegal(selectionType, params, this._base, target, this._leftMatches, this._rightMatches)) {
            return false;
        }


        //1. Update the selection type
        this._selectionType = selectionType;

        //2. Update occurrences.
        StatementUtils.setupSelection(this._leftMatches, this._rightMatches, this._selectionType, params);
        return true;
    }

    moveSelection(step:number) : boolean {
        //1. Check conditions
        if (this._leftMatches.length===0 && this._rightMatches.length===0) return false;

        //2. Gather the changes
        switch(this._selectionType) {
            case SelectionType.NONE: return false; //nothing to do
            case SelectionType.ALL: return false; //still, nothing to do
            case SelectionType.LEFT:
                if(step>0) return this.setSelection(SelectionType.RIGHT, null);
                else return false;

            case SelectionType.RIGHT:
                if(step<0) return this.setSelection(SelectionType.LEFT, null);
                else return false;

            case SelectionType.ONE_IN_LEFT: {
                const currentlySelectedMatchIndex = this._leftMatches.findIndex(m => m.selected);
                if (currentlySelectedMatchIndex===-1) return false;
                const newIndex = step>0?
                    currentlySelectedMatchIndex+1 :
                    currentlySelectedMatchIndex-1;

                if (newIndex<0) return false; //left-most occurrence. Cannot go more left.
                else if (newIndex>=this._leftMatches.length) {
                    return this.setSelection(SelectionType.ONE_IN_RIGHT, {index:0});
                }
                else return this.setSelection(SelectionType.ONE_IN_LEFT, {index:newIndex});
            }

            case SelectionType.ONE_IN_RIGHT: {
                const currentlySelectedMatchIndex = this._rightMatches.findIndex(m => m.selected);
                if (currentlySelectedMatchIndex===-1) return false;
                const newIndex = step>0?
                    currentlySelectedMatchIndex+1 :
                    currentlySelectedMatchIndex-1;

                if (newIndex<0) {
                    return this.setSelection(SelectionType.ONE_IN_LEFT, {index:this._leftMatches.length-1});
                }
                else if (newIndex>=this._rightMatches.length) return false; //right-most occurrence. Cannot go more right.
                else return this.setSelection(SelectionType.ONE_IN_RIGHT, {index:newIndex});
            }
        }
    }
    //endregion


    //region PROOF MANAGEMENT
    private addAndExecuteMove(move:FrontendMove) {
        //1. Slice the proof.moves array, if move is not appended at the end.
        this.proof.addMove(move, this._currentMoveIndex);
        this._currentMoveIndex = this.proof.moves.length - 1;

        //2. Execute the move
        move.execute(this._targets);

        //3. Update selection
        this.setupDefaultSelection();
    }

    addCloningMove(sideToClone:StatementSide) : boolean {
        //1. Check move legality
        if (!this._base || !StatementUtils.isStartLegal(this._base, sideToClone)) return false;

        //2. Construct the logic move
        const targetToReplace = this.getSelectedTarget();
        const newInternalId = targetToReplace==null?
            this._targets.reduce((prev, el) => Math.max(prev, el._internalId), 0) + 1 :
            targetToReplace._internalId;

        const cloneOfTargetToReplace = targetToReplace? MathAsmStatement.clone(targetToReplace, StatementSide.BOTH, targetToReplace._internalId) : null;

        const move = FrontendMove.newStartMove(
            newInternalId,
            this.getImmutableBase(),
            sideToClone,
            cloneOfTargetToReplace
        );

        //3. Add the move.
        this.addAndExecuteMove(move);
        if(targetToReplace==null) this._selectedTargetIndex = this._targets.length - 1;
        return true;
    }

    performReplacement() : boolean {
        //1. Check conditions
        if (!this._base || this._selectionType===SelectionType.NONE) return false;
        const target = this.getSelectedTarget();
        if (!target) return false;

        //2. Construct the logic move
        const move = FrontendMove.newReplaceMove(
            target._internalId,
            this.getImmutableBase(),
            this._baseSide,
            this._selectionType,
            this.getSingleReplacementPos()
        );
        this.addAndExecuteMove(move);
        return true;
    }

    addSaveMove(indexToSave:number, newTheoremName:string, parentDirId:number) {
        const move = FrontendMove.newSaveMove(indexToSave, newTheoremName, parentDirId);
        this.addAndExecuteMove(move);
    }

    private addAndExecuteBackendMove(backendMove: LogicMove, baseMap: any) {
        let move:FrontendMove;
        switch(backendMove.moveType) {
            case BackendMoveType.START: {
                const targetToReplace = this.getTargetById(backendMove.targetId);
                const cloneOfTargetToReplace = targetToReplace? MathAsmStatement.clone(targetToReplace, StatementSide.BOTH, targetToReplace._internalId) : null;
                move = FrontendMove.newStartMove(
                    backendMove.targetId,
                    FrontendMove.getBaseForBackendMove(backendMove, baseMap, this._targets),
                    backendMove.side,
                    cloneOfTargetToReplace
                );
                break;
            }

            case BackendMoveType.REPLACE_ALL:
            case BackendMoveType.REPLACE_LEFT:
            case BackendMoveType.REPLACE_RIGHT:
            case BackendMoveType.ONE_IN_LEFT:
            case BackendMoveType.ONE_IN_RIGHT:
                move = FrontendMove.newReplaceMove(
                    backendMove.targetId,
                    FrontendMove.getBaseForBackendMove(backendMove, baseMap, this._targets),
                    backendMove.side,
                    FrontendMove.getSelectionTypeForBackendMove(backendMove),
                    backendMove.pos
                );
                break;

            case BackendMoveType.SAVE:
                move = FrontendMove.newSaveMove(
                    backendMove.targetId,
                    backendMove.name,
                    backendMove.parentId
                );
                break;
        }

        this.addAndExecuteMove(move);
    }

    /** Navigates to the given move. */
    goToMove(moveIndex:number) {
        if(moveIndex<0) {
            this.goToStart();
            return;
        }
        const moveToGoTo = this.proof.moves[moveIndex];
        const nextMove = this.proof.moves[moveIndex+1];

        //1. Update the targets
        this._targets = this.proof.goToMove(this._currentMoveIndex, moveIndex, this._targets);
        this._selectedTargetIndex = this._targets.findIndex(t => t._internalId === moveToGoTo.targetId);
        this._selectionType = SelectionType.NONE;
        this._baseSide = nextMove && nextMove.baseSide!=null? nextMove.baseSide : StatementSide.LEFT;


        //3. Update base, matches and selection in order to show the next move that will happen.
        const nextBase = nextMove? nextMove.base : null;
        if (nextBase) {
            this._base = nextBase;
            const sentenceToSearch = nextMove.baseSide===StatementSide.LEFT? nextBase.left : nextBase.right;

            //3a. matches
            this._leftMatches = MathAsmStatement.findMatches(this._targets[this._selectedTargetIndex].left, sentenceToSearch, false);
            this._rightMatches = MathAsmStatement.findMatches(this._targets[this._selectedTargetIndex].right, sentenceToSearch, false);

            //3b. selection
            if (nextMove.selectionType!=null) {
                this._selectionType = nextMove.selectionType;
                StatementUtils.setupSelection(
                    this._leftMatches,
                    this._rightMatches,
                    this._selectionType,
                    ProofPlayer.getReplacementParamsFor(this._selectionType, nextMove.pos, this._leftMatches, this._rightMatches)
                );
            }
        }
        else {
            this._base = null;
            this._leftMatches = [];
            this._rightMatches = [];
            this._selectionType = SelectionType.NONE;
        }

        this._currentMoveIndex = moveIndex;
    }

    private goToStart() {
        this._targets = [];
        this._selectedTargetIndex = null;
        this._leftMatches = [];
        this._rightMatches = [];
        this._selectionType = SelectionType.NONE;
        this._currentMoveIndex = -1;

        const firstMove = this.proof.moves[0];

        this._base = firstMove? firstMove.base : null;
        this._baseSide = firstMove? firstMove.baseSide : StatementSide.LEFT;
    }

    /** Returns the params to be given to StatementUtils.setupSelection. */
    private static getReplacementParamsFor(selectionType:SelectionType, positionToReplace:number, leftMatches:SentenceMatch[], rightMatches:SentenceMatch[]) : any {
        switch (selectionType) {
            case SelectionType.ONE_IN_LEFT: {
                const indexToReplace = leftMatches.findIndex(m => m.index === positionToReplace);
                return {index: indexToReplace};
            }

            case SelectionType.ONE_IN_RIGHT: {
                const indexToReplace = rightMatches.findIndex(m => m.index === positionToReplace);
                return {index: indexToReplace};
            }

            default: return null;
        }
    }
    //endregion
}