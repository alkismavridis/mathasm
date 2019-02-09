import React, {Component, CSSProperties} from 'react';
import cx from 'classnames';
import "./TheoremCreator.scss";
import Statement from "../ReusableComponents/Statement/Statement";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import StatementUtils from "../../services/symbol/StatementUtils";
import SelectionType from "../../enums/SelectionType";
import StatementSide from "../../enums/StatementSide";
import QuickInfoService from "../../services/QuickInfoService";
import FrontendProof from "../../entities/frontend/FrontendProof";
import FrontendMove from "../../entities/frontend/FrontendMove";
import ProofViewer from "./ProofViewer/ProofViewer";
import ModalService from "../../services/ModalService";
import GraphQL from "../../services/GraphQL";
import ProofPlayer from "../../entities/frontend/ProofPlayer";
import MathAsmStatement from "../../entities/backend/MathAsmStatement";
import MathAsmDir from "../../entities/backend/MathAsmDir";
import SentenceMatch from "../../entities/frontend/SentenceMatch";

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

export default class TheoremCreator extends Component {
    //region STATIC
    props : {
        //data
        symbolMap:any,
        parentDir:MathAsmDir,

        //actions
        onCreateStatements?:Function, //accepts an array of SavedTheoremInfo objects: the newly created theorems.

        //styling
        style?: CSSProperties,
        className?: string,
    };
    //endregion


    //region FIELDS
    state = {
        player: new ProofPlayer(),

        targets:[] as MathAsmStatement[],
        selectedTargetIndex:null as number,


        //selection
        base:null as MathAsmStatement,
        baseSide:StatementSide.LEFT,
        leftMatches:[] as SentenceMatch[], //notNull
        rightMatches:[] as SentenceMatch[], //notNull
        selectionType:SelectionType.NONE,

        //proof
        proof:new FrontendProof(),
    };

    _rootRef = null;
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
    setBase(base:MathAsmStatement) {
        this.state.player.setBase(base);
        this.setState({player:this.state.player});
    }

    focus() {
        if (this._rootRef) this._rootRef.focus();
    }
    //endregion



    //region EVENT HANDLERS
    /**
     * Selects the given target and updates the internal state.
     * NOTE: index can be null, which means DESELECT
     * */
    selectTarget(index:number) {
        this.state.player.setTargetIndex(index);
        this.setState({player:this.state.player});
    }

    /**
     * Changes the direction of the base, if the move is allowed.
     * */
    setBaseDir(newDir:StatementSide) {
        this.state.player.setBaseDir(newDir);
        this.setState({player:this.state.player});
    }

    changeSelectionType(newSelectionType: SelectionType) {
        const didChange = this.state.player.setSelection(newSelectionType, null);

        if (didChange) this.setState({player:this.state.player});
        else QuickInfoService.makeWarning("This selection is not allowed for the selected base and target.");
    }

    /** Attempt to switch to either LEFT or RIGHT selection. */
    switchToSelectSentenceMode() {
        //1. Try to set LEFT or RIGHT selection.
        let success = this.state.player.setSelection(SelectionType.LEFT, null);
        if (!success) success = this.state.player.setSelection(SelectionType.RIGHT, null);

        //2. Handle result
        if (success) this.setState({player:this.state.player});
        else QuickInfoService.makeWarning("Illegal move: Could not perform sentence selection.");
    }

    switchToSingleSelectionMode() {
        //1. Try to set LEFT or RIGHT selection.
        let success = this.state.player.setSelection(SelectionType.ONE_IN_LEFT, null);
        if (!success) success = this.state.player.setSelection(SelectionType.ONE_IN_RIGHT, null);

        //2. Handle result
        if (success) this.setState({player:this.state.player});
        else QuickInfoService.makeWarning("Illegal move: Could not perform single selection.");
    }

    /** Moves the selection, staying on the current selectionType */
    moveSelection(step:number) {
        const didChange = this.state.player.moveSelection(step);
        if (didChange) this.setState({player:this.state.player});
    }

    /**
     * Clones the selected base, and appends the clone into the target list, if no target is selected.
     * If a target is selected, this target will be overwritten instead.
     * */
    cloneBase(sideToClone:StatementSide) {
        //1. Check conditions
        if (!this.state.player.base) return;
        if (!StatementUtils.isStartLegal(this.state.player.base, sideToClone)) {
            QuickInfoService.makeWarning("Cloning move not allowed. Please check base direction.");
            return;
        }

        //2. Construct the logic move
        const targetToReplace = this.state.player.getSelectedTarget();
        const newInternalId = targetToReplace==null?
            this.state.player.targets.reduce((prev, el) => Math.max(prev, el._internalId), 0) + 1 :
            targetToReplace._internalId;

        const cloneOfTargetToReplace = targetToReplace? MathAsmStatement.clone(targetToReplace, StatementSide.BOTH, targetToReplace._internalId) : null;

        const move = FrontendMove.newStartMove(
            newInternalId,
            this.state.player.getImmutableBase(),
            sideToClone,
            cloneOfTargetToReplace
        );

        this.state.player.addAndExecuteMove(move);
        this.setState({player:this.state.player})


        //3. Setup the changes object and perform the cloning
        // const newTarget = StatementUtils.clone(this.state.base, sideToClone, newInternalId);
        //
        // if (this.state.selectedTargetIndex==null) { //add new clone to list
        //     const changes = {
        //         proof:this.state.proof,
        //         targets:[...this.state.targets, newTarget],
        //         selectedTargetIndex:this.state.targets.length //we will select the newly created statement
        //     };
        //     TheoremCreator.addDefaultSelectionFor(this.state.base, newTarget, StatementSide.LEFT, changes);
        //     this.setState(changes);
        // }
        // else { //overwrite selected target
        //     const changes = {
        //         proof:this.state.proof,
        //         targets:this.state.targets.slice(),
        //     };
        //     changes.targets[this.state.selectedTargetIndex] = newTarget;
        //     TheoremCreator.addDefaultSelectionFor(this.state.base, newTarget, StatementSide.LEFT, changes);
        //     this.setState(changes);
        // }
    }

    /** Performs the replacement based on the current selection. */
    performReplacement() {
        //1. Check conditions
        if (!this.state.player.base || this.state.player.selectionType===SelectionType.NONE) return;

        const target = this.state.player.getSelectedTarget();
        if (!target) return;


        //2. Construct the logic move
        const move = FrontendMove.newReplaceMove(
            target._internalId,
            this.state.player.getImmutableBase(),
            this.state.player.baseSide,
            this.state.player.selectionType,
            this.state.player.getSingleReplacementPos()
        );
        this.state.player.addAndExecuteMove(move);
        this.setState({player:this.state.player});


        //3. Perform the replacement
        // const changes = {
        //     proof:this.state.proof
        // };
        //
        // const oldSentence = this.state.baseSide===StatementSide.LEFT? this.state.base.left : this.state.base.right;
        // const newSentence = this.state.baseSide===StatementSide.LEFT? this.state.base.right : this.state.base.left;
        // StatementUtils.performReplacement(target, oldSentence, newSentence, this.state.leftMatches, this.state.rightMatches);
        // changes.templates = this.state.templates;
        //
        // //4. Reset the selection
        // TheoremCreator.addDefaultSelectionFor(this.state.base, target, this.state.baseSide, changes);

        //5. Update the component
    }

    /** The user could interact with this component with the keyboard too. Here are the controls: */
    handleKeyPress(e:KeyboardEvent) {
        //console.log(e.keyCode);

        switch (e.keyCode) {
            case 32: //space bar (Action: switch base direction)
                this.setBaseDir(this.state.player.baseSide===StatementSide.LEFT? StatementSide.RIGHT : StatementSide.LEFT);
                break;

            case 13: //enter key (Action: perform replacement)
                this.performReplacement();
                break;

            case 38: //arrow up (Action: change selected target)
                if (this.state.player.targets.length===0) break;

                e.preventDefault();
                if (this.state.player.selectedTargetIndex===0) this.selectTarget(null);
                else if (this.state.player.selectedTargetIndex==null) this.selectTarget(this.state.player.targets.length-1);
                else this.selectTarget(this.state.player.selectedTargetIndex-1);
                break;

            case 40: //arrow down (Action: change selected target)
                if (this.state.player.targets.length===0) break;

                e.preventDefault();
                if (this.state.player.selectedTargetIndex===this.state.player.targets.length-1) this.selectTarget(null);
                else if (this.state.player.selectedTargetIndex==null) this.selectTarget(0);
                else this.selectTarget(this.state.player.selectedTargetIndex+1);
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
                this.handleSaveClicked();
                break;

            case 66: //"b" key (Action: use target as base)
                const selectedTarget = this.state.player.getSelectedTarget();
                if (selectedTarget) this.setBase(selectedTarget);
                break;

            case 27: //escape key (Action: Select none)
                this.changeSelectionType(SelectionType.NONE);
                break;

            case 90: { //z key
                const currentMoveIndex = this.state.player.currentMoveIndex;
                const moveCount = this.state.player.proof.moves.length;

                if (e.shiftKey && e.ctrlKey) { //redo.
                    if (moveCount!==0 && currentMoveIndex!==moveCount-1) this.goToMove(currentMoveIndex+1);
                }
                else if (e.ctrlKey) { //undo
                    if (moveCount!==0 && currentMoveIndex!==0) this.goToMove(currentMoveIndex-1);
                }
                break;
            }

        }
    }

    /** Navigates to the selected move of the proof. */
    goToMove(index:number) {
        this.state.player.goToMove(index);
        this.setState({player:this.state.player});
    }

    handleSaveClicked() {
        const target = this.state.player.getSelectedTarget();
        if (target==null) return;

        const onSave = (modalId, name) => {
            if (!name) return;

            //1. Create the save move
            const move = FrontendMove.newSaveMove(target._internalId, name, this.props.parentDir.id);
            this.state.player.addAndExecuteMove(move);
            this.setState({player: this.state.player});

            //2. Perform the replacement
            ModalService.removeModal(modalId);
        };

        ModalService.showTextGetter("Save under "+this.props.parentDir.name, "Theorem's name...", onSave);
    }

    /** Uploads the proof to the server. */
    uploadProof() {
        if(this.state.player.proof.moves.length===0) return;

        const dataToUpload = this.state.player.proof.toBackendProof();
        GraphQL.run(q.UPLOAD_PROOF, {moves:dataToUpload})
            .then(mutation => {
                QuickInfoService.makeSuccess("Proof successfully uploaded.");
                if (this.props.onCreateStatements) this.props.onCreateStatements(mutation.statementWSector.uploadProof);
            })
            .catch(error => {
                QuickInfoService.makeError("Error while uploading proof. Please note that parts of the proof may have been successfully saved.");
                console.log(error);
            });
    }
    //endregion



    //region RENDERING
    renderTarget(target:MathAsmStatement, index:number) {
        if (!target) return <div>Empty target</div>;

        const changeHandler = () => this.selectTarget(this.state.player.selectedTargetIndex===index? null : index);

        const player = this.state.player;
        const isSelected = player.selectedTargetIndex===index;
        return <div key={index} className="Globals_flexStartDown">
            <button
                className="Globals_textBut"
                title="Use as base (b)"
                style={{
                    width: "16px",
                    height: "16px",
                    color:"green",
                    marginRight:"8px"
                }}
                onClick={e => this.setBase(player.targets[index])}>
                <FontAwesomeIcon icon="cog"/>
            </button>
            <button
                className="Globals_textBut"
                title="Replace (enter)"
                style={{
                    visibility:!isSelected || player.base==null || player.selectedTargetIndex==null || player.selectionType===SelectionType.NONE? "hidden" : "visible",
                    width: "16px",
                    height: "16px",
                    color:"red",
                    backgroundColor:"transparent",
                    marginRight:"8px"
                }}
                onClick={()=>this.performReplacement()}>
                <FontAwesomeIcon icon="check"/>
            </button>
            <button
                className="Globals_textBut"
                title="Replace (enter)"
                style={{
                    width: "16px",
                    height: "16px",
                    color:isSelected? "#001fff" : "#001fff73",
                    backgroundColor:"transparent",
                    marginRight:"8px"
                }}
                onClick={changeHandler}>
                <FontAwesomeIcon icon="angle-right"/>
            </button>
            <Statement
                symbolMap={this.props.symbolMap}
                statement={target}
                leftMatches={isSelected? player.leftMatches : null}
                rightMatches={isSelected? player.rightMatches : null}
                matchLength={isSelected? player.getBaseSentenceLength() : 0}
                onClick={changeHandler}/>
        </div>;
    }

    renderBase() {
        const player = this.state.player;
        if (!player.base) return <div>Please select a base...</div>;

        const isBidirectional = player.base && player.base.isBidirectional;
        return <div className="Globals_flexStartDown">
            <button
                className="Globals_textBut"
                title="Change base dir (space)"
                style={{
                    width: "16px",
                    height: "16px",
                    color: isBidirectional? "#38d0f3" : "#afb3d06e",
                    marginRight:"8px"
                }}
                disabled={!isBidirectional}
                onClick={()=>this.setBaseDir(player.baseSide===StatementSide.LEFT? StatementSide.RIGHT : StatementSide.LEFT)}>
                <FontAwesomeIcon icon="exchange-alt"/>
            </button>
            <Statement symbolMap={this.props.symbolMap} statement={player.base} side={player.baseSide}/>
        </div>
    }

    renderButtons() {
        const player = this.state.player;

        return <div style={{margin:"16px 0"}}>
            <button
                className="Globals_roundBut"
                title="Clone left side of base (x)"
                style={{
                    visibility:player.base==null? "hidden" : "visible",
                    backgroundColor: "cornflowerblue",
                    width: "24px",
                    height: "24px",
                    fontSize: "14px",
                    margin:"0 4px"
                }}
                onClick={()=>this.cloneBase(StatementSide.LEFT)}>
                <FontAwesomeIcon icon="ruler-combined" flip="horizontal"/>
            </button>
            <button
                className="Globals_roundBut"
                title="Clone base (c)"
                style={{
                    visibility:player.base==null? "hidden" : "visible",
                    backgroundColor: "cornflowerblue",
                    width: "24px",
                    height: "24px",
                    fontSize: "14px",
                    margin:"0 4px"
                }}
                onClick={()=>this.cloneBase(StatementSide.BOTH)}>
                <FontAwesomeIcon icon="bolt"/>
            </button>
            <button
                className="Globals_roundBut"
                title="Clone right side of base (v)"
                style={{
                    visibility:player.base==null? "hidden" : "visible",
                    backgroundColor: "cornflowerblue",
                    width: "24px",
                    height: "24px",
                    fontSize: "14px",
                    margin:"0 20px 0 4px"
                }}
                onClick={()=>this.cloneBase(StatementSide.RIGHT)}>
                <FontAwesomeIcon icon="ruler-combined"/>
            </button>

            <button
                className="Globals_roundBut"
                title="Move selection left (left arrow)"
                style={{
                    visibility:player.selectionType===SelectionType.ALL || player.leftMatches.length+player.rightMatches.length<=1? "hidden" : "visible",
                    backgroundColor: "#e2b228",
                    width: "24px",
                    height: "24px",
                    fontSize: "18px",
                    margin:"0 4px"
                }}
                onClick={()=>this.moveSelection(-1)}>
                <FontAwesomeIcon icon="caret-left"/>
            </button>
            <button
                className="Globals_roundBut"
                title="Select all (a)"
                style={{
                    visibility:player.base==null || player.selectedTargetIndex==null? "hidden" : "visible",
                    backgroundColor: player.selectionType===SelectionType.ALL? "#f1814c" : "#e2b228",
                    width: "24px",
                    height: "24px",
                    fontSize: "14px",
                    margin:"0 4px"
                }}
                onClick={()=>this.changeSelectionType(SelectionType.ALL)}>
                <FontAwesomeIcon icon="asterisk"/>
            </button>
            <button
                className="Globals_roundBut"
                title="Sentence selection (s)"
                style={{
                    visibility:player.base==null || player.selectedTargetIndex==null? "hidden" : "visible",
                    backgroundColor: player.selectionType===SelectionType.LEFT || player.selectionType===SelectionType.RIGHT? "#f1814c" : "#e2b228",
                    width: "24px",
                    height: "24px",
                    fontSize: "14px",
                    margin:"0 4px"
                }}
                onClick={()=>this.switchToSelectSentenceMode()}>
                <FontAwesomeIcon icon="balance-scale"/>
            </button>
            <button
                className="Globals_roundBut"
                title="Distinct selection (d)"
                style={{
                    visibility:player.base==null || player.selectedTargetIndex==null? "hidden" : "visible",
                    backgroundColor: player.selectionType===SelectionType.ONE_IN_LEFT || player.selectionType===SelectionType.ONE_IN_RIGHT? "#f1814c" : "#e2b228",
                    width: "24px",
                    height: "24px",
                    fontSize: "14px",
                    margin:"0 4px"
                }}
                onClick={()=>this.switchToSingleSelectionMode()}>
                <FontAwesomeIcon icon="highlighter"/>
            </button>
            <button
                className="Globals_roundBut"
                title="Move selection right (right arrow)"
                style={{
                    visibility:player.selectionType===SelectionType.ALL || player.leftMatches.length+player.rightMatches.length<=1? "hidden" : "visible",
                    backgroundColor: "#e2b228",
                    width: "24px",
                    height: "24px",
                    fontSize: "18px",
                    margin:"0 20px 0 4px"
                }}
                onClick={()=>this.moveSelection(1)}>
                <FontAwesomeIcon icon="caret-right"/>
            </button>

            <button
                className="Globals_roundBut"
                title={"Persist selected template under "+this.props.parentDir.name+" (p)"}
                style={{
                    visibility:player.selectedTargetIndex==null? "hidden" : "visible",
                    backgroundColor: "#5db969",
                    width: "24px",
                    height: "24px",
                    fontSize: "16px",
                    margin:"0 4px"
                }}
                onClick={()=>this.handleSaveClicked()}>
                <FontAwesomeIcon icon="save"/>
            </button>
            <button
                className="Globals_roundBut"
                title="Upload proof"
                style={{
                    visibility:player.proof.moves.length===0? "hidden" : "visible",
                    backgroundColor: "#5db969",
                    width: "24px",
                    height: "24px",
                    fontSize: "16px",
                    margin:"0 4px"
                }}
                onClick={()=>this.uploadProof()}>
                <FontAwesomeIcon icon="cloud-upload-alt"/>
            </button>

        </div>;
    }

    renderEmptyStmtDiv() {
        return (
            <div
                onClick={() => this.selectTarget(null)}
                style={{
                    marginLeft:"48px",
                    marginTop:"16px",
                    visibility:this.state.player.base==null? "hidden" : "visible"
                }}>
                <button
                    className="Globals_textBut"
                    title="Replace (enter)"
                    style={{
                        width: "16px",
                        height: "16px",
                        color:this.state.player.selectedTargetIndex==null? "#001fff" : "#001fff73",
                        backgroundColor:"transparent",
                        marginRight:"8px"
                    }}
                    onClick={() => this.selectTarget(null)}>
                    <FontAwesomeIcon icon="angle-right"/>
                </button>
                <span>New...</span>
            </div>
        );
    }

    render() {
        return (
            <div
                className={cx("TheoremCreator_root", this.props.className)}
                style={this.props.style}
                onKeyUp={(e:any)=>this.handleKeyPress(e)}
                ref={el => this._rootRef = el}
                tabIndex={0}>
                <div className="TheoremCreator_main">
                    {this.renderBase()}
                    {this.renderButtons()}
                    <div>
                        {this.state.player.targets.map((t,index) => this.renderTarget(t, index))}
                        {this.renderEmptyStmtDiv()}
                    </div>
                </div>
                <ProofViewer
                    proofPlayer={this.state.player}
                    onNavigateAction={index => this.goToMove(index)}/>
                {/*<div style={{whiteSpace:"pre"}}>{JSON.stringify(this.state, null, 2)}</div>*/}
            </div>
        );
    }

    //endregion
}