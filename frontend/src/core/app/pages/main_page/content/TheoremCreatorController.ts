import MainPageContentController from "./MainPageContentController";
import MainPageMode from "../MainPageMode";
import MainPageController from "../MainPageController";
import App from "../../../App";
import {Subject} from "rxjs";
import ProofPlayer from "../../../../entities/frontend/ProofPlayer";
import MathAsmSymbol from "../../../../entities/backend/MathAsmSymbol";
import MathAsmStatement from "../../../../entities/backend/MathAsmStatement";
import StatementSide from "../../../../enums/StatementSide";
import SelectionType from "../../../../enums/SelectionType";
import TextGetterState from "../../../modals/TextGetterState";

const q = {
    UPLOAD_PROOF: `mutation($moves:[LogicMove!]!) {
      statementWSector {
        uploadProof(moves:$moves) {
            parentId
            theorem {id, name, type, left, right, isBidirectional, grade}
        }
      }
    }`
};

export default class TheoremCreatorController implements MainPageContentController {
    //SECTION FIELDS
    readonly mode = MainPageMode.CREATE_THEOREM;
    readonly player = new ProofPlayer();
    readonly onChange = new Subject<TheoremCreatorController>();


    //SECTION LIFE CYCLE
    constructor(private mainPage:MainPageController, private app:App) {}


    //SECTION GETTERS
    get symbolMap() : Map<number, MathAsmSymbol> { return this.mainPage.symbolMap; }

    getActiveDirName() : string {
        const activeDir = this.mainPage.dirViewer.activeDir;
        return activeDir? activeDir.name : null;
    }



    //SECTION ACTIONS
    /**
     * Sets the base to be the given base, and updates all related internal state.
     * NOTE: base parameter can be null!
     * */
    setBase(base:MathAsmStatement) {
        this.player.setBase(base);
        this.onChange.next(this);
    }

    /**
     * Selects the given target and updates the internal state.
     * NOTE: index can be null, which means DESELECT
     * */
    selectTarget(index:number) {
        this.player.setTargetIndex(index);
        this.onChange.next(this);
    }

    /**
     * Changes the direction of the base, if the move is allowed.
     * */
    setBaseDir(newDir:StatementSide) {
        this.player.setBaseDir(newDir);
        this.onChange.next(this);
    }

    changeSelectionType(newSelectionType: SelectionType) {
        const didChange = this.player.setSelection(newSelectionType, null);
        if (didChange) this.onChange.next(this);
        else this.app.quickInfos.makeWarning("This selection is not allowed for the selected base and target.");
    }

    /** Attempt to switch to either LEFT or RIGHT selection. */
    switchToSelectSentenceMode() {
        //1. Try to set LEFT or RIGHT selection.
        let success = this.player.setSelection(SelectionType.LEFT, null);
        if (!success) success = this.player.setSelection(SelectionType.RIGHT, null);

        //2. Handle result
        if (success) this.onChange.next(this);
        else this.app.quickInfos.makeWarning("Illegal move: Could not perform sentence selection.");
    }


    switchToSingleSelectionMode() {
        //1. Try to set LEFT or RIGHT selection.
        let success = this.player.setSelection(SelectionType.ONE_IN_LEFT, null);
        if (!success) success = this.player.setSelection(SelectionType.ONE_IN_RIGHT, null);

        //2. Handle result
        if (success) this.onChange.next(this);
        else this.app.quickInfos.makeWarning("Illegal move: Could not perform single selection.");
    }

    /** Moves the selection, staying on the current selectionType */
    moveSelection(step:number) {
        const didChange = this.player.moveSelection(step);
        if (didChange) this.onChange.next(this);
    }

    /**
     * Clones the selected base, and appends the clone into the target list, if no target is selected.
     * If a target is selected, this target will be overwritten instead.
     * */
    cloneBase(sideToClone:StatementSide) {
        const success = this.player.addCloningMove(sideToClone);
        if (success) this.onChange.next(this);
        else this.app.quickInfos.makeWarning("Cloning move not allowed. Please check base direction.");
    }

    /** Performs the replacement based on the current selection. */
    performReplacement() {
        const success = this.player.performReplacement();
        if (success) this.onChange.next(this);
        // else QuickInfoService.makeWarning("Cloning move not allowed. Please check base direction.");
    }


    /** Navigates to the selected move of the proof. */
    goToMove(index:number) {
        this.player.goToMove(index);
        this.onChange.next(this);
    }

    handleSaveClicked() {
        const target = this.player.getSelectedTarget();
        if (target==null) return;

        const activeDir = this.mainPage.dirViewer.activeDir;
        if(!activeDir) {
            this.app.quickInfos.makeWarning("Please go to a directory in order to save");
            return;
        }

        const onSave = (name:string, state:TextGetterState) => {
            if (!name) return;

            //1. Create the save move
            this.player.addSaveMove(target._internalId, name, activeDir.id);
            this.onChange.next(this);

            //2. Perform the replacement
            this.app.modals.removeModal(state.modalId);
        };

        this.app.modals.showTextGetter("Save under "+activeDir.name, "Theorem's name...", onSave);
    }

    /** Uploads the proof to the server. */
    uploadProof() {
        if(this.player.getMoveCount()===0) return;

        const dataToUpload = this.player.makeBackendProof();
        this.app.graphql.run(q.UPLOAD_PROOF, {moves:dataToUpload})
            .then(mutation => {
                this.app.quickInfos.makeSuccess("Proof successfully uploaded.");
                this.mainPage.proofSaved(mutation.statementWSector.uploadProof);
            })
            .catch(error => {
                this.app.quickInfos.makeError("Error while uploading proof. Please note that parts of the proof may have been successfully saved.");
                console.error(error);
            });
    }

    /** Swaps the base direction, if possible. Does nothing if the move is illegal. */
    swapBaseDir() {
        const side = this.player.baseSide===StatementSide.LEFT? StatementSide.RIGHT : StatementSide.LEFT;
        this.setBaseDir(side);
    }

    choosePrevTarget() {
        if (this.player.targets.length===0) return;

        if (this.player.selectedTargetIndex===0) this.selectTarget(null);
        else if (this.player.selectedTargetIndex==null) this.selectTarget(this.player.targets.length-1);
        else this.selectTarget(this.player.selectedTargetIndex-1);
    }

    chooseNextTarget() {
        if (this.player.targets.length===0) return;

        if (this.player.selectedTargetIndex===this.player.targets.length-1) this.selectTarget(null);
        else if (this.player.selectedTargetIndex==null) this.selectTarget(0);
        else this.selectTarget(this.player.selectedTargetIndex+1);
    }

    useTargetAsBase() {
        const selectedTarget = this.player.getSelectedTarget();
        if (selectedTarget) this.setBase(selectedTarget);
    }

    redoMove() {
        const currentMoveIndex = this.player.currentMoveIndex;
        const moveCount = this.player.getMoveCount();
        if (moveCount!==0 && currentMoveIndex!==moveCount-1) this.goToMove(currentMoveIndex+1);
    }

    undoMove() {
        const currentMoveIndex = this.player.currentMoveIndex;
        const moveCount = this.player.getMoveCount();
        if (moveCount!==0 && currentMoveIndex>=0) this.goToMove(currentMoveIndex-1);
    }
}