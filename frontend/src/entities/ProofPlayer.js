import StatementSide from "../constants/StatementSide";
import SelectionType from "../constants/SelectionType";
import MathAsmProof from "./MathAsmProof";
import StatementUtils from "../services/symbol/StatementUtils";

export default class ProofPlayer {
    //region FIELDS
    /** The recorded proof. */
    proof = new MathAsmProof();

    /**
     * Used for navigation through the proof.
     * Points to the index of the last executed move.
     * Thus, -1 indicates that no move has been executed yet.
     * */
    currentMoveIndex = -1;

    /**
     * The target pool on which the proof will be working on.
     * The state of this changes during the play.
     * */
    targets = [];

    /** Selection state */
    selectedTargetIndex = null;
    base = null;
    baseSide = StatementSide.LEFT;

    leftMatches = [];            //an array of {index:123, selected:true}
    rightMatches = [];           //an array of {index:123, selected:true}

    selectionType = SelectionType.NONE;

    //endregion



    //region LIFE CYCLE
    constructor() {}
    //endregion


    //region GETTERS
    /** convenience method that returns the currently selected target, or null, if none is selected. */
    getSelectedTarget() {
        if (this.selectedTargetIndex==null) return null;
        return this.targets[this.selectedTargetIndex];
    }

    /** Returns a base that is guaranteed to remain immutable. Useful for building proof */
    getImmutableBase() {
        if (!this.base) return null;
        if (this.base._internalId!=null) return StatementUtils.clone(this.base, StatementSide.BOTH, this.base._internalId);
        return this.base;
    }

    getSingleReplacementPos() {
        switch(this.selectionType){
            case SelectionType.ONE_IN_LEFT: {
                const match = this.leftMatches.find(m => m.selected);
                return match? match.index : null;
            }


            case SelectionType.ONE_IN_RIGHT: {
                const match = this.rightMatches.find(m => m.selected);
                return match? match.index : null;
            }

            default: return null;
        }
    }

    /** Returns the length of the selected sentence of the base, or 0 if no base is selected. */
    getBaseSentenceLength() {
        if (!this.base) return 0;

        return this.baseSide===StatementSide.LEFT?
            this.base.left.length :
            this.base.right.length;
    }
    //endregion



    //region FIRST-LEVEL SELECTION MANAGEMENT
    /**
     * Updates: base, baseSide, selectionType, leftMatches, rightMatches.
     * Leaves intact: selectedTargetIndex
     * */
    setBase(base) {
        //1. Handle null/undefined special case.
        if (base==null) {
            this.base = null;
            this.baseSide = StatementSide.LEFT;
            this.selectionType = SelectionType.NONE;
            this.leftMatches = [];
            this.rightMatches = [];
            return;
        }

        //2. Check if statement can be used as a base
        if ((base.type % 2) === 0) return;

        //3. Update the state
        this.base = base;
        this.baseSide = StatementSide.LEFT;

        const currentTarget = this.getSelectedTarget();
        this.setupDefaultSelection();
    }

    /** Update the selectedTargetIndex, baseSide that all selection parameters. */
    setTargetIndex(index) {
        this.selectedTargetIndex = index;
        this.baseSide = StatementSide.LEFT; //TODO this doesn't have to be that way... Put an if statement.
        this.setupDefaultSelection();
    }

    /** Sets the base direction, if the incoming direction is legal. As no effect otherwise.
     * @return boolean: true if the new direction was legal and the operation succeeded.
     * */
    setBaseDir(newDir)  {
        //1. Check if conditions are correct.
        const target = this.getSelectedTarget();
        if (!this.base || !target || !StatementUtils.isDirectionLegal(this.base, target, newDir)) {
            return false;
        }

        //2. Setup the changes object
        this.baseSide = newDir;
        this.setupDefaultSelection();
        return true;
    }

    /**
     * Setup a default selection for the selected base, baseSide and template.
     * updates: leftMatches, rightMatches, selectionType.
     * */
    setupDefaultSelection() {
        const currentTarget = this.getSelectedTarget();
        //1. Check if both template and base is selected
        if (!this.base || !currentTarget) {
            this.leftMatches = [];
            this.rightMatches = [];
            this.selectionType = SelectionType.NONE;
            return;
        }

        //2. Setup the selection arrays
        const sentenceToSearch = this.baseSide===StatementSide.LEFT? this.base.left : this.base.right;
        this.leftMatches = StatementUtils.findMatches(currentTarget.left, sentenceToSearch, false);
        this.rightMatches = StatementUtils.findMatches(currentTarget.right, sentenceToSearch, false);

        //3. Choose a selection type for the given circumstances
        this.selectionType = StatementUtils.getDefaultSelectionTypeFor(this.base, currentTarget, this.leftMatches, this.rightMatches);
        StatementUtils.setupSelection(this.leftMatches, this.rightMatches, this.selectionType);
    }
    //endregion



    //region LEVEL-2 SELECTION MANAGEMENT
    setSelection(selectionType, params) {
        const target = this.getSelectedTarget();
        if (!target || this.base || !StatementUtils.isSelectionLegal(selectionType, params, this.base, target, this.leftMatches, this.rightMatches)) {
            return false;
        }


        //1. Update the selection type
        this.selectionType = selectionType;

        //2. Update occurrences.
        StatementUtils.setupSelection(this.leftMatches, this.rightMatches, this.selectionType, params);
        return true;
    }

    moveSelection(step) {
        //1. Check conditions
        if (this.leftMatches.length===0 && this.rightMatches.length===0) return false;

        //2. Gather the changes
        switch(this.selectionType) {
            case SelectionType.NONE: return false; //nothing to do
            case SelectionType.ALL: return false; //still, nothing to do
            case SelectionType.LEFT:
                if(step>0) return this.setSelection(SelectionType.RIGHT, null);
                else return false;

            case SelectionType.RIGHT:
                if(step<0) return this.setSelection(SelectionType.LEFT, null);
                else return false;

            case SelectionType.ONE_IN_LEFT: {
                const currentlySelectedMatchIndex = this.leftMatches.findIndex(m => m.selected);
                if (currentlySelectedMatchIndex===-1) return false;
                const newIndex = step>0?
                    currentlySelectedMatchIndex+1 :
                    currentlySelectedMatchIndex-1;

                if (newIndex<0) return false; //left-most occurrence. Cannot go more left.
                else if (newIndex>=this.leftMatches.length) {
                    return this.setSelection(SelectionType.ONE_IN_RIGHT, {index:0});
                }
                else return this.setSelection(SelectionType.ONE_IN_LEFT, {index:newIndex});
            }

            case SelectionType.ONE_IN_RIGHT: {
                const currentlySelectedMatchIndex = this.rightMatches.findIndex(m => m.selected);
                if (currentlySelectedMatchIndex===-1) return false;
                const newIndex = step>0?
                    currentlySelectedMatchIndex+1 :
                    currentlySelectedMatchIndex-1;

                if (newIndex<0) {
                    return this.setSelection(SelectionType.ONE_IN_LEFT, {index:this.leftMatches.length-1});
                }
                else if (newIndex>=this.rightMatches.length) return false; //right-most occurrence. Cannot go more right.
                else return this.setSelection(SelectionType.ONE_IN_RIGHT, {index:newIndex});
            }
        }
    }
    //endregion


    //region PROOF MANAGEMENT
    addAndExecuteMove(move) {
        //1. Slice the proof.moves array, if move is not appended at the end.
        this.proof.addMove(move, this.currentMoveIndex);

        //2. Execute the move
        move.execute(this.targets);

        //3. Update selection
        this.setupDefaultSelection();
    }

    goToMove(moveIndex) {
        console.log(moveIndex);
        const moveToGoTo = this.proof.moves[moveIndex];
        const nextMove = this.proof.moves[moveIndex+1];

        //1. Update the targets
        this.targets = this.proof.goToMove(moveIndex, this.targets);
        this.selectedTargetIndex = this.targets.findIndex(t => t._internalId === moveToGoTo.targetId);
        this.selectionType = SelectionType.NONE;
        this.baseSide = nextMove && nextMove.baseSide!=null? nextMove.baseSide : StatementSide.LEFT;


        //3. Update base, matches and selection in order to show the next move that will happen.
        const nextBase = nextMove? nextMove.base : null;
        if (nextBase) {
            this.base = nextBase;
            const sentenceToSearch = nextMove.baseSide===StatementSide.LEFT? nextBase.left : nextBase.right;

            //3a. matches
            this.leftMatches = StatementUtils.findMatches(this.targets[this.selectedTargetIndex].left, sentenceToSearch, false);
            this.rightMatches = StatementUtils.findMatches(this.targets[this.selectedTargetIndex].right, sentenceToSearch, false);

            //3b. selection
            if (nextMove.selectionType!=null) {
                this.selectionType = nextMove.selectionType;
                StatementUtils.setupSelection(
                    this.leftMatches,
                    this.rightMatches,
                    this.selectionType,
                    ProofPlayer.getReplacementParamsFor(this.selectionType, nextMove.pos, this.leftMatches, this.rightMatches)
                );
            }
        }
        else {
            this.base = null;
            this.leftMatches = [];
            this.rightMatches = [];
            this.selectionType = SelectionType.NONE;
        }
    }

    /** Returns the params to be given to StatementUtils.setupSelection. */
    static getReplacementParamsFor(selectionType, positionToReplace, leftMatches, rightMatches) {
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