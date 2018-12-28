import React, {Component} from 'react';
import PropTypes from "prop-types";
import cx from 'classnames';
import "./TheoremCreator.scss";
import Statement from "../ReusableComponents/Statement/Statement";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import StatementUtils from "../../services/symbol/StatementUtils";
import BaseDirection from "../../constants/BaseDirection";
import SelectionType from "../../constants/SelectionType";
import StatementSide from "../../constants/StatementSide";
import QuickInfoService from "../../services/QuickInfoService";

export default class TheoremCreator extends Component {
    //region STATIC
    static propTypes = {
        //data
        symbolMap:PropTypes.object.isRequired,
        parentDir:PropTypes.object.isRequired,

        //actions
        onSetCurrentDir:PropTypes.func,

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
        baseDir:BaseDirection.LTR,
        occurrenceLeft:[], //notNull
        occurrenceRight:[], //notNull
        selectionType:SelectionType.NONE,
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
        const currentTarget = this.state.selectedTargetIndex==null?
            null :
            this.state.targets[this.state.selectedTargetIndex];

        if (base && currentTarget) TheoremCreator.addDefaultSelectionFor(base, currentTarget, BaseDirection.LTR, changes);
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
        changes.baseDir = BaseDirection.LTR;
        changes.occurrenceLeft = [];
        changes.occurrenceRight = [];

        changes.selectionType = SelectionType.NONE;
    }

    /** Base and target and changes are considered NOT NULL. */
    static addDefaultSelectionFor(base, target, direction, changes) {
        //1. Find all occurrences
        changes.baseDir = direction;

        const sentenceToSearch = direction===BaseDirection.LTR? base.left : base.right;
        changes.occurrenceLeft = StatementUtils.findMatches(target.left, sentenceToSearch);
        changes.occurrenceRight = StatementUtils.findMatches(target.right, sentenceToSearch);

        changes.selectionType = StatementUtils.getDefaultSelectionTypeFor(base, target);
        StatementUtils.setupSelection(changes.occurrenceLeft, changes.occurrenceRight, changes.selectionType);
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
        if (!StatementUtils.isSelectionLegal(selectionType, params, base, target, this.state.occurrenceLeft, this.state.occurrenceRight)) {
            QuickInfoService.makeWarning("Illegal selection detected!");
            console.log("ILLEGAL SELECTION: ", selectionType, params, base, target);
            return false;
        }


        //1. Update the selection type
        changes.selectionType = selectionType;

        //2. Update occurrences.
        changes.occurrenceLeft = this.state.occurrenceLeft;
        changes.occurrenceRight = this.state.occurrenceRight;
        StatementUtils.setupSelection(changes.occurrenceLeft, changes.occurrenceRight, changes.selectionType, params);
        return true;
    }

    /** Returns the length of the selected sentence of the base, or 0 if no base is selected. */
    getBaseSentenceLength() {
        if (!this.state.base) return 0;

        return this.state.baseDir===BaseDirection.LTR?
            this.state.base.left.length :
            this.state.base.right.length;
    }

    /** convenience method that returns the currently selected target, or null, if none is selected. */
    getSelectedTarget() {
        if (this.state.selectedTargetIndex==null) return null;
        return this.state.targets[this.state.selectedTargetIndex];
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
            baseDir:BaseDirection.LTR,
        };

        //2. Append the changes
        if (!this.state.base || index==null) TheoremCreator.addEmptySelection(changes);
        else TheoremCreator.addDefaultSelectionFor(this.state.base, this.state.targets[index], BaseDirection.LTR, changes);

        //3. Update the state
        this.setState(changes);
    }

    /**
     * Changes the direction of the base, if the move is allowed.
     * */
    setBaseDir(newDir) {
        //1. Check if conditions are correct.
        if (!this.state.base || this.state.selectedTargetIndex==null) return;

        const target = this.state.targets[this.state.selectedTargetIndex];
        if (!StatementUtils.isDirectionLegal(this.state.base, target, newDir)) return;


        //2. Setup the changes object
        const changes = {baseDir:newDir};
        TheoremCreator.addDefaultSelectionFor(this.state.base, target, newDir, changes);

        //3. Update the component
        this.setState(changes);
    }

    changeSelectionType(newSelectionType) {
        //1. Check conditions
        if (this.state.occurrenceLeft.length===0 && this.state.occurrenceRight.length===0) return;

        //2. Gather the changes
        const changes = {};
        this.addSelectionMove(newSelectionType, null, changes);

        //3. Update the component
        this.setState(changes);
    }

    /** Attempt to switch to either LEFT or RIGHT selection. */
    switchToSelectSentenceMode() {
        //1. Check conditions
        if (this.state.occurrenceLeft.length===0 && this.state.occurrenceRight.length===0) return;

        //2. Try to set LEFT selection
        const changes = {};
        let success = this.addSelectionMove(SelectionType.LEFT, null, changes);

        //3. If this fails, try the RIGHT one
        if (!success) this.addSelectionMove(SelectionType.RIGHT, null, changes);

        //4. Update the component
        this.setState(changes);
    }

    switchToSingleSelectionMode() {
        //1. Check conditions
        if (this.state.occurrenceLeft.length===0 && this.state.occurrenceRight.length===0) return;

        //2. Try to set ONE_IN_LEFT selection
        const changes = {};
        let success = this.addSelectionMove(SelectionType.ONE_IN_LEFT, null, changes);

        //3. If this fails, try the ONE_IN_RIGHT
        if (!success) this.addSelectionMove(SelectionType.ONE_IN_RIGHT, null, changes);

        //4. Update the component
        this.setState(changes);
    }

    /** Moves the selection, staying on the current selectionType */
    moveSelection(step) {
        //1. Check conditions
        if (this.state.occurrenceLeft.length===0 && this.state.occurrenceRight.length===0) return;

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
                const currentlySelectedMatchIndex = this.state.occurrenceLeft.findIndex(m => m.selected);
                if (currentlySelectedMatchIndex===-1) break;
                const newIndex = step>0?
                    currentlySelectedMatchIndex+1 :
                    currentlySelectedMatchIndex-1;

                if (newIndex<0) break; //left-most occurrence. Cannot go more left.
                else if (newIndex>=this.state.occurrenceLeft.length) {
                    this.addSelectionMove(SelectionType.ONE_IN_RIGHT, {index:0}, changes);
                }
                else this.addSelectionMove(SelectionType.ONE_IN_LEFT, {index:newIndex}, changes);
                break;
            }

            case SelectionType.ONE_IN_RIGHT: {
                const currentlySelectedMatchIndex = this.state.occurrenceRight.findIndex(m => m.selected);
                if (currentlySelectedMatchIndex===-1) break;
                const newIndex = step>0?
                    currentlySelectedMatchIndex+1 :
                    currentlySelectedMatchIndex-1;

                if (newIndex<0) {
                    this.addSelectionMove(SelectionType.ONE_IN_LEFT, {index:this.state.occurrenceLeft.length-1}, changes);
                }
                else if (newIndex>=this.state.occurrenceRight.length) break; //right-most occurrence. Cannot go more right.
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

        //2. Setup the changes object and perform the cloning
        const newTarget = StatementUtils.clone(this.state.base, sideToClone);

        if (this.state.selectedTargetIndex==null) { //add new clone to list
            const changes = {
                targets:[...this.state.targets, newTarget],
                selectedTargetIndex:this.state.targets.length //we will select the newly created statement
            };
            TheoremCreator.addDefaultSelectionFor(this.state.base, newTarget, BaseDirection.LTR, changes);
            this.setState(changes);
        }
        else { //overwrite selected target
            const newArray = this.state.targets.slice();
            newArray[this.state.selectedTargetIndex] = newTarget;
            this.setState({targets:newArray});
        }
    }

    /** Performs the replacement based on the current selection. */
    performReplacement() {
        //1. Check conditions
        if (!this.state.base) return;

        const target = this.getSelectedTarget();
        if (!target) return;

        //2. Perform the replacement
        const changes = {};
        const oldSentence = this.state.baseDir===BaseDirection.LTR? this.state.base.left : this.state.base.right;
        const newSentence = this.state.baseDir===BaseDirection.LTR? this.state.base.right : this.state.base.left;
        StatementUtils.performReplacement(target, oldSentence, newSentence, this.state.occurrenceLeft, this.state.occurrenceRight);
        changes.templates = this.state.templates;

        //3. Reset the selection
        TheoremCreator.addDefaultSelectionFor(this.state.base, target, this.state.baseDir, changes);

        //3. Update the component
        this.setState(changes);
    }

    handleKeyPress(e) {
        console.log(e.keyCode);

        switch (e.keyCode) {

            case 32: //space bar (Action: switch base direction)
                this.setBaseDir(this.state.baseDir===BaseDirection.LTR? BaseDirection.RTL : BaseDirection.LTR);
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

            case 66: //"b" key (Action: use target as base)
                const selectedTarget = this.getSelectedTarget();
                if (selectedTarget) this.setBase(selectedTarget);
                break;
        }
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
                leftMatches={isSelected? this.state.occurrenceLeft : null}
                rightMatches={isSelected? this.state.occurrenceRight : null}
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
                title="Change dir (space)"
                style={{backgroundColor: "green", width: "32px", height: "32px", fontSize: "18px", marginRight:"32px"}}
                onClick={()=>this.setBaseDir(this.state.baseDir===BaseDirection.LTR? BaseDirection.RTL : BaseDirection.LTR)}>
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
                style={{backgroundColor: "#e2b228", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
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
                style={{backgroundColor: "#e2b228", width: "32px", height: "32px", fontSize: "18px", margin:"0 32px 0 4px"}}
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

        </div>;
    }

    renderEmptyStmtDiv() {
        return <div style={{marginLeft:"32px"}}>
            <input type="radio" name="target" checked={this.state.selectedTargetIndex==null} onChange={() => this.selectTarget(null)}/>
        </div>;
    }

    render() {
        return (
            <div className={cx("TheoremCreator_root", this.props.className)} style={this.props.style} onKeyDown={e=>this.handleKeyPress(e)} tabIndex="0">
                {this.renderBase()}
                {this.renderButtons()}
                <form>
                    {this.state.targets.map((t,index) => this.renderTarget(t, index))}
                    {this.renderEmptyStmtDiv()}
                </form>
                {/*<div style={{whiteSpace:"pre"}}>{JSON.stringify(this.state, null, 2)}</div>*/}
            </div>
        );
    }

    //endregion
}