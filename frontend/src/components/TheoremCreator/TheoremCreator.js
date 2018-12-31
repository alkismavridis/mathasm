import React, {Component} from 'react';
import PropTypes from "prop-types";
import cx from 'classnames';
import "./TheoremCreator.scss";
import Statement from "../ReusableComponents/Statement/Statement";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import StatementUtils from "../../services/symbol/StatementUtils";
import SelectionType from "../../constants/SelectionType";
import StatementSide from "../../constants/StatementSide";
import QuickInfoService from "../../services/QuickInfoService";
import MathAsmProof from "../../entities/MathAsmProof";
import MathAsmMove from "../../entities/MathAsmMove";
import ProofViewer from "./ProofViewer/ProofViewer";
import ModalService from "../../services/ModalService";
import GraphQL from "../../services/GraphQL";

const q = {
    UPLOAD_PROOF: `mutation($moves:[LogicMove!]!) {
        uploadProof(moves:$moves) {
            parentId
            theorem {id, name, type, left, right, isBidirectional, grade}
        }
    }`
};

export default class TheoremCreator extends Component {
    //region STATIC
    static propTypes = {
        //data
        symbolMap:PropTypes.object.isRequired,
        parentDir:PropTypes.object.isRequired,

        //actions
        onCreateStatements:PropTypes.func, //accepts an array of SavedTheoremInfo objects: the newly created theorems.

        //styling
        style: PropTypes.object,
        className: PropTypes.string,
    };

    //static defaultProps = {};
    //endregion


    //region FIELDS
    state = {
        targets:[],
        selectedTargetIndex:null,


        //selection
        base:null,
        baseSide:StatementSide.LEFT,
        leftMatches:[], //notNull
        rightMatches:[], //notNull
        selectionType:SelectionType.NONE,

        //proof
        proof:MathAsmProof.emptyProof(),
    };
    //endregion


    //region LIFE CYCLE
    // constructor(props) { super(props); }
    // componentDidMount() {}
    // static getDerivedStateFromProps(nextProps, prevState) {}
    // shouldComponentUpdate(nextProps, nextState) { return true; }
    // getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    // componentDidUpdate(prevProps, prevState, snapshot) {}
    // componentWillUnmount() {}
    // componentDidCatch(error, info) { console.error("Exception caught"); }
    //endregion


    //region API
    /**
     * Sets the base to be the given base, and updates all related internal state.
     * NOTE: base parameter can be null!
     * */
    setBase(base) {
        if ((base.type % 2) === 0) return; //this statement cannot be used as a base.

        //1. Setup the changes object
        const changes = {base: base};

        //2. Select either according to a base, or choose an empty selection if no selection is possible.
        const currentTarget = this.getSelectedTarget();

        if (base && currentTarget) TheoremCreator.addDefaultSelectionFor(base, currentTarget, StatementSide.LEFT, changes);
        else TheoremCreator.addEmptySelection(changes);

        //3. Update the component
        this.setState(changes);
    }
    //endregion


    //region UTILS
    /**
     * sets up an empty-selection field set into the given object.
     * */
    static addEmptySelection(changes) {
        changes.baseSide = StatementSide.LEFT;
        changes.leftMatches = [];
        changes.rightMatches = [];

        changes.selectionType = SelectionType.NONE;
    }

    /** Base and target and changes are considered NOT NULL. */
    static addDefaultSelectionFor(base, target, direction, changes) {
        //1. Find all occurrences
        changes.baseSide = direction;

        const sentenceToSearch = direction===StatementSide.LEFT? base.left : base.right;
        changes.leftMatches = StatementUtils.findMatches(target.left, sentenceToSearch, false);
        changes.rightMatches = StatementUtils.findMatches(target.right, sentenceToSearch, false);

        changes.selectionType = StatementUtils.getDefaultSelectionTypeFor(base, target);
        StatementUtils.setupSelection(changes.leftMatches, changes.rightMatches, changes.selectionType);
    }

    /**
     * Adjust the selection to the given selectionType and (optionally) other parameters.
     * Every selection type may expect different parameters.
     * This functions appends all properties to the changes parameter.
     *
     * NOTE: this method performs validation. This means that it will have no effect if the requested selection was illegal.
     * returns true if the operation succeeded.
     * */
    addSelectionMove(selectionType, params, changes) {
        const base = this.state.base;
        const target = this.getSelectedTarget();
        if (!StatementUtils.isSelectionLegal(selectionType, params, base, target, this.state.leftMatches, this.state.rightMatches)) {
            console.log("ILLEGAL SELECTION: ", selectionType, params, base, target);
            return false;
        }


        //1. Update the selection type
        changes.selectionType = selectionType;

        //2. Update occurrences.
        changes.leftMatches = this.state.leftMatches;
        changes.rightMatches = this.state.rightMatches;
        StatementUtils.setupSelection(changes.leftMatches, changes.rightMatches, changes.selectionType, params);
        return true;
    }

    /** Returns the length of the selected sentence of the base, or 0 if no base is selected. */
    getBaseSentenceLength() {
        if (!this.state.base) return 0;

        return this.state.baseSide===StatementSide.LEFT?
            this.state.base.left.length :
            this.state.base.right.length;
    }

    /** convenience method that returns the currently selected target, or null, if none is selected. */
    getSelectedTarget() {
        if (this.state.selectedTargetIndex==null) return null;
        return this.state.targets[this.state.selectedTargetIndex];
    }

    getSingleReplacementPos() {
        switch(this.state.selectionType){
            case SelectionType.ONE_IN_LEFT: {
                const match = this.state.leftMatches.find(m => m.selected);
                return match? match.index : null;
            }


            case SelectionType.ONE_IN_RIGHT: {
                const match = this.state.rightMatches.find(m => m.selected);
                return match? match.index : null;
            }

            default: return null;
        }
    }

    /** Returns a base that is guaranteed to remain immutable. Useful for building proof */
    getImmutableBase() {
        if (!this.state.base) return null;
        if (this.state.base._internalId!=null) return StatementUtils.clone(this.state.base, StatementSide.BOTH, this.state.base._internalId);
        return this.state.base;
    }
    //endregion



    //region EVENT HANDLERS
    /**
     * Selects the given target and updates the internal state.
     * NOTE: index can be null, which means DESELECT
     * */
    selectTarget(index) {
        //1. Setup the changes object
        const changes = {
            selectedTargetIndex:index,
            baseSide:StatementSide.LEFT,
        };

        //2. Append the changes
        if (!this.state.base || index==null) TheoremCreator.addEmptySelection(changes);
        else TheoremCreator.addDefaultSelectionFor(this.state.base, this.state.targets[index], StatementSide.LEFT, changes);

        //3. Update the state
        this.setState(changes);
    }

    /**
     * Changes the direction of the base, if the move is allowed.
     * */
    setBaseDir(newDir) {
        //1. Check if conditions are correct.
        const target = this.getSelectedTarget();
        if (!this.state.base || !target) return;

        if (!StatementUtils.isDirectionLegal(this.state.base, target, newDir)) return;


        //2. Setup the changes object
        const changes = {baseSide:newDir};
        TheoremCreator.addDefaultSelectionFor(this.state.base, target, newDir, changes);

        //3. Update the component
        this.setState(changes);
    }

    changeSelectionType(newSelectionType) {
        //1. Check conditions
        if (this.state.leftMatches.length===0 && this.state.rightMatches.length===0) return;

        //2. Gather the changes
        const changes = {};
        this.addSelectionMove(newSelectionType, null, changes);

        //3. Update the component
        this.setState(changes);
    }

    /** Attempt to switch to either LEFT or RIGHT selection. */
    switchToSelectSentenceMode() {
        //1. Check conditions
        if (this.state.leftMatches.length===0 && this.state.rightMatches.length===0) return;

        //2. Try to set LEFT selection
        const changes = {};
        let success = this.addSelectionMove(SelectionType.LEFT, null, changes);

        //3. If this fails, try the RIGHT one
        if (!success) success = this.addSelectionMove(SelectionType.RIGHT, null, changes);
        if (!success) QuickInfoService.makeWarning("Illegal move: Could not perform sentence selection.");


        //4. Update the component
        this.setState(changes);
    }

    switchToSingleSelectionMode() {
        //1. Check conditions
        if (this.state.leftMatches.length===0 && this.state.rightMatches.length===0) return;

        //2. Try to set ONE_IN_LEFT selection
        const changes = {};
        let success = this.addSelectionMove(SelectionType.ONE_IN_LEFT, null, changes);

        //3. If this fails, try the ONE_IN_RIGHT
        if (!success) success = this.addSelectionMove(SelectionType.ONE_IN_RIGHT, null, changes);
        if (!success) QuickInfoService.makeWarning("Illegal move: Could not perform single selection.");

        //4. Update the component
        this.setState(changes);
    }

    /** Moves the selection, staying on the current selectionType */
    moveSelection(step) {
        //1. Check conditions
        if (this.state.leftMatches.length===0 && this.state.rightMatches.length===0) return;

        //2. Gather the changes
        const changes = {};
        switch(this.state.selectionType) {
            case SelectionType.NONE: break; //nothing to do
            case SelectionType.ALL: break; //still, nothing to do
            case SelectionType.LEFT:
                if(step>0) this.addSelectionMove(SelectionType.RIGHT, null, changes);
                break;

            case SelectionType.RIGHT:
                if(step<0) this.addSelectionMove(SelectionType.LEFT, null, changes);
                break;

            case SelectionType.ONE_IN_LEFT: {
                const currentlySelectedMatchIndex = this.state.leftMatches.findIndex(m => m.selected);
                if (currentlySelectedMatchIndex===-1) break;
                const newIndex = step>0?
                    currentlySelectedMatchIndex+1 :
                    currentlySelectedMatchIndex-1;

                if (newIndex<0) break; //left-most occurrence. Cannot go more left.
                else if (newIndex>=this.state.leftMatches.length) {
                    this.addSelectionMove(SelectionType.ONE_IN_RIGHT, {index:0}, changes);
                }
                else this.addSelectionMove(SelectionType.ONE_IN_LEFT, {index:newIndex}, changes);
                break;
            }

            case SelectionType.ONE_IN_RIGHT: {
                const currentlySelectedMatchIndex = this.state.rightMatches.findIndex(m => m.selected);
                if (currentlySelectedMatchIndex===-1) break;
                const newIndex = step>0?
                    currentlySelectedMatchIndex+1 :
                    currentlySelectedMatchIndex-1;

                if (newIndex<0) {
                    this.addSelectionMove(SelectionType.ONE_IN_LEFT, {index:this.state.leftMatches.length-1}, changes);
                }
                else if (newIndex>=this.state.rightMatches.length) break; //right-most occurrence. Cannot go more right.
                else this.addSelectionMove(SelectionType.ONE_IN_RIGHT, {index:newIndex}, changes);
                break;
            }
        }

        //3. Update the component
        this.setState(changes);
    }

    /**
     * Clones the selected base, and appends the clone into the target list, if no target is selected.
     * If a target is selected, this target will be overwritten instead.
     * */
    cloneBase(sideToClone) {
        //1. Check conditions
        if (!this.state.base) return;
        if (!StatementUtils.isStartLegal(this.state.base, sideToClone)) {
            QuickInfoService.makeWarning("Cloning move not allowed. Please check base direction.");
            return;
        }

        //2. Construct the logic move
        const targetToReplace = this.getSelectedTarget();
        const newInternalId = targetToReplace==null?
            this.state.targets.reduce((prev, el) => Math.max(prev, el._internalId), 0) + 1 :
            targetToReplace._internalId;

        const cloneOfTargetToReplace = targetToReplace? StatementUtils.clone(targetToReplace, StatementSide.BOTH, targetToReplace._internalId) : null;
        const move = MathAsmMove.newStartMove(
            newInternalId,
            this.getImmutableBase(),
            sideToClone,
            cloneOfTargetToReplace
        );
        MathAsmProof.addMove(this.state.proof, move);


        //3. Setup the changes object and perform the cloning
        const newTarget = StatementUtils.clone(this.state.base, sideToClone, newInternalId);

        if (this.state.selectedTargetIndex==null) { //add new clone to list
            const changes = {
                proof:this.state.proof,
                targets:[...this.state.targets, newTarget],
                selectedTargetIndex:this.state.targets.length //we will select the newly created statement
            };
            TheoremCreator.addDefaultSelectionFor(this.state.base, newTarget, StatementSide.LEFT, changes);
            this.setState(changes);
        }
        else { //overwrite selected target
            const newArray = this.state.targets.slice();
            newArray[this.state.selectedTargetIndex] = newTarget;
            this.setState({targets:newArray, proof:this.state.proof});
        }
    }

    /** Performs the replacement based on the current selection. */
    performReplacement() {
        //1. Check conditions
        if (!this.state.base || this.state.selectionType===SelectionType.NONE) return;

        const target = this.getSelectedTarget();
        if (!target) return;


        //2. Construct the logic move
        const move = MathAsmMove.newReplaceMove(
            target._internalId,
            this.getImmutableBase(),
            this.state.baseSide,
            this.state.selectionType,
            this.getSingleReplacementPos()
        );
        MathAsmProof.addMove(this.state.proof, move);

        //3. Perform the replacement
        const changes = {
            proof:this.state.proof
        };

        const oldSentence = this.state.baseSide===StatementSide.LEFT? this.state.base.left : this.state.base.right;
        const newSentence = this.state.baseSide===StatementSide.LEFT? this.state.base.right : this.state.base.left;
        StatementUtils.performReplacement(target, oldSentence, newSentence, this.state.leftMatches, this.state.rightMatches);
        changes.templates = this.state.templates;

        //4. Reset the selection
        TheoremCreator.addDefaultSelectionFor(this.state.base, target, this.state.baseSide, changes);

        //5. Update the component
        this.setState(changes);
    }

    /** The user could interact with this component with the keyboard too. Here are the controls: */
    handleKeyPress(e) {
        console.log(e.keyCode);

        switch (e.keyCode) {
            case 32: //space bar (Action: switch base direction)
                this.setBaseDir(this.state.baseSide===StatementSide.LEFT? StatementSide.RIGHT : StatementSide.LEFT);
                break;

            case 13: //enter key (Action: perform replacement)
                this.performReplacement();
                break;

            case 38: //arrow up (Action: change selected target)
                if (this.state.targets.length===0) break;

                e.preventDefault();
                if (this.state.selectedTargetIndex===0) this.selectTarget(null);
                else if (this.state.selectedTargetIndex==null) this.selectTarget(this.state.targets.length-1);
                else this.selectTarget(this.state.selectedTargetIndex-1);
                break;

            case 40: //arrow down (Action: change selected target)
                // this.setState({cursor: 0, isCursorLeft: false});
                if (this.state.targets.length===0) break;

                e.preventDefault();
                if (this.state.selectedTargetIndex===this.state.targets.length-1) this.selectTarget(null);
                else if (this.state.selectedTargetIndex==null) this.selectTarget(0);
                else this.selectTarget(this.state.selectedTargetIndex+1);
                break;

            case 37: //arrow left (Action: moves the selection to the left)
                this.moveSelection(-1);
                break;

            case 39: //arrow right (Action: moves the selection to the right)
                this.moveSelection(1);
                break;

            case 65: //"a" key (Action: Select all)
                this.changeSelectionType(SelectionType.ALL);
                break;

            case 83: //"s" key (Action: select sentence)
                this.switchToSelectSentenceMode();
                break;

            case 68: //"d" key (Action: Select distinct)
                this.switchToSingleSelectionMode();
                break;

            case 88: //"x" key (Action: clone base - left side)
                this.cloneBase(StatementSide.LEFT);
                break;

            case 67: //"c" key (Action: clone base)
                this.cloneBase(StatementSide.BOTH);
                break;

            case 86: //"v" key (Action: clone base - right side)
                this.cloneBase(StatementSide.RIGHT);
                break;

            case 80: //"p" key (Action: persist selected template)
                this.handleSaveClicked( );
                break;

            case 66: //"b" key (Action: use target as base)
                const selectedTarget = this.getSelectedTarget();
                if (selectedTarget) this.setBase(selectedTarget);
                break;

            case 27: //escape key (Action: Select none)
                this.changeSelectionType(SelectionType.NONE);
                break;
        }
    }

    /** Hello world. */
    goToMove(index) {
        console.log("I go to move", index);
        const moveToGoTo = this.state.proof.moves[index];

        MathAsmProof.goToMove(this.state.proof, index, this.state.targets);

        const selectedTargetIndex = this.state.targets.findIndex(t => t._internalId === moveToGoTo.targetId);
        this.setState({
            proof:this.state.proof,
            targets:this.state.targets,
            selectedTargetIndex:selectedTargetIndex
        });
    }

    handleSaveClicked() {
        const target = this.getSelectedTarget();
        if (target==null) return;

        const onSave = (modalId, name) => {
            if (!name) return;

            //1. Create the save move
            const move = MathAsmMove.newSaveMove(target._internalId, name, this.props.parentDir.id);
            MathAsmProof.addMove(this.state.proof, move);
            this.setState({proof: this.state.proof});

            //2. Perform the replacement
            ModalService.removeModal(modalId);
        };

        ModalService.showTextGetter("Save under "+this.props.parentDir.name, "Theorem's name...", onSave);
    }

    /** Uploads the proof to the server. */
    uploadProof() {
        if(this.state.proof.moves.length===0) return;

        const dataToUpload = MathAsmProof.toBackendProof(this.state.proof);
        GraphQL.run(q.UPLOAD_PROOF, {moves:dataToUpload})
            .then(resp => {
                QuickInfoService.makeSuccess("Proof successfully uploaded.");
                if (this.props.onCreateStatements) this.props.onCreateStatements(resp.uploadProof);
            })
            .catch(error => {
                QuickInfoService.makeError("Error while uploading proof. Please note that parts of the proof may have been successfully saved.");
                console.log(error);
            });
    }
    //endregion



    //region RENDERING
    renderTarget(target, index) {
        if (!target) return <div>Empty target</div>;

        const changeHandler = () => this.selectTarget(this.state.selectedTargetIndex===index? null : index);

        const isSelected = this.state.selectedTargetIndex===index;
        return <div key={index} className="Globals_flexStart">
            <div
                className="TheoremCreator_tempAsBase"
                title="Use as base (b)"
                onClick={e => this.setBase(this.state.targets[index])}>
                <FontAwesomeIcon icon="cog"/>
            </div>
            <input type="radio" checked={isSelected} name="target" value={index} onChange={changeHandler}/>
            <Statement
                symbolMap={this.props.symbolMap}
                statement={target}
                leftMatches={isSelected? this.state.leftMatches : null}
                rightMatches={isSelected? this.state.rightMatches : null}
                matchLength={isSelected? this.getBaseSentenceLength() : 0}
                onClick={changeHandler}/>
        </div>;
    }

    renderBase() {
        if (!this.state.base) return <div>No base selected...</div>;
        else return <Statement symbolMap={this.props.symbolMap} statement={this.state.base} />;
    }

    renderButtons() {
        return <div style={{margin:"16px 0"}}>
            <button
                className="Globals_roundBut"
                title="Change base dir (space)"
                style={{backgroundColor: "green", width: "32px", height: "32px", fontSize: "18px", marginRight:"32px"}}
                onClick={()=>this.setBaseDir(this.state.baseSide===StatementSide.LEFT? StatementSide.RIGHT : StatementSide.LEFT)}>
                <FontAwesomeIcon icon="exchange-alt"/>
            </button>

            <button
                className="Globals_roundBut"
                title="Clone left side of base (x)"
                style={{backgroundColor: "cornflowerblue", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                onClick={()=>this.cloneBase(StatementSide.LEFT)}>
                <FontAwesomeIcon icon="step-backward"/>
            </button>
            <button
                className="Globals_roundBut"
                title="Clone base (c)"
                style={{backgroundColor: "cornflowerblue", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                onClick={()=>this.cloneBase(StatementSide.BOTH)}>
                <FontAwesomeIcon icon="copy"/>
            </button>
            <button
                className="Globals_roundBut"
                title="Clone right side of base (v)"
                style={{backgroundColor: "cornflowerblue", width: "32px", height: "32px", fontSize: "18px", margin:"0 32px 0 4px"}}
                onClick={()=>this.cloneBase(StatementSide.RIGHT)}>
                <FontAwesomeIcon icon="step-forward"/>
            </button>

            <button
                className="Globals_roundBut"
                title="Move selection left (left arrow)"
                style={{backgroundColor: "#e2b228", width: "24px", height: "24px", fontSize: "18px", margin:"0 4px"}}
                onClick={()=>this.moveSelection(-1)}>
                <FontAwesomeIcon icon="caret-left"/>
            </button>
            <button
                className="Globals_roundBut"
                title="Select all (a)"
                style={{backgroundColor: "#e2b228", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                onClick={()=>this.changeSelectionType(SelectionType.ALL)}>
                <FontAwesomeIcon icon="dice-six"/>
            </button>
            <button
                className="Globals_roundBut"
                title="Sentence selection (s)"
                style={{backgroundColor: "#e2b228", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                onClick={()=>this.switchToSelectSentenceMode()}>
                <FontAwesomeIcon icon="dice-two"/>
            </button>
            <button
                className="Globals_roundBut"
                title="Distinct selection (d)"
                style={{backgroundColor: "#e2b228", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                onClick={()=>this.switchToSingleSelectionMode()}>
                <FontAwesomeIcon icon="dice-one"/>
            </button>
            <button
                className="Globals_roundBut"
                title="Move selection right (right arrow)"
                style={{backgroundColor: "#e2b228", width: "24px", height: "24px", fontSize: "18px", margin:"0 32px 0 4px"}}
                onClick={()=>this.moveSelection(1)}>
                <FontAwesomeIcon icon="caret-right"/>
            </button>

            <button
                className="Globals_roundBut"
                title="Replace (enter)"
                style={{backgroundColor: "#e2331c", width: "32px", height: "32px", fontSize: "18px", margin:"0 32px 0 4px"}}
                onClick={()=>this.performReplacement()}>
                <FontAwesomeIcon icon="check"/>
            </button>

            <button
                className="Globals_roundBut"
                title={"Persist selected template under "+this.props.parentDir.name+" (p)"}
                style={{backgroundColor: "#3847e2", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                onClick={()=>this.handleSaveClicked()}>
                <FontAwesomeIcon icon="save"/>
            </button>
            <button
                className="Globals_roundBut"
                title="Upload proof"
                style={{backgroundColor: "#3847e2", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                onClick={()=>this.uploadProof()}>
                <FontAwesomeIcon icon="cloud-upload-alt"/>
            </button>

        </div>;
    }

    renderEmptyStmtDiv() {
        return <div style={{marginLeft:"32px"}}>
            <input type="radio" name="target" checked={this.state.selectedTargetIndex==null} onChange={() => this.selectTarget(null)}/>
        </div>;
    }

    render() {
        return (
            <div className={cx("TheoremCreator_root", this.props.className)} style={this.props.style} onKeyUp={e=>this.handleKeyPress(e)} tabIndex="0">
                <div className="TheoremCreator_main">
                    {this.renderBase()}
                    {this.renderButtons()}
                    <form>
                        {this.state.targets.map((t,index) => this.renderTarget(t, index))}
                        {this.renderEmptyStmtDiv()}
                    </form>
                </div>
                <ProofViewer
                    proof={this.state.proof}
                    onNavigateAction={index => this.goToMove(index)}/>
                {/*<div style={{whiteSpace:"pre"}}>{JSON.stringify(this.state, null, 2)}</div>*/}
            </div>
        );
    }

    //endregion
}