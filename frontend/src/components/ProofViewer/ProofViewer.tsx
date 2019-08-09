import React, {Component, CSSProperties} from 'react';
import "./ProofViewer.scss";
import cx from 'classnames';

import SelectionType from "../../enums/SelectionType";
import QuickInfoService from "../../services/QuickInfoService";
import StatementSide from "../../enums/StatementSide";
import MathAsmDir from "../../entities/backend/MathAsmDir";
import SentenceMatch from "../../entities/frontend/SentenceMatch";
import GraphQL from "../../services/GraphQL";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import ProofStepsViewer from "../ReusableComponents/ProofStepsViewer/ProofStepsViewer";
import Statement from "../ReusableComponents/Statement/Statement";
import MathAsmStatement from "../../entities/backend/MathAsmStatement";
import ProofPlayer from "../../entities/frontend/ProofPlayer";
import {AppNode} from "../../entities/frontend/AppNode";
import AppNodeReaction from "../../enums/AppNodeReaction";
import {AppEvent} from "../../entities/frontend/AppEvent";
import AppEventType from "../../enums/AppEventType";
import {SymbolRangeUtils} from "../../services/symbol/SymbolRangeUtils";
import q from "./ProofViewer.graphql";



class ProofViewer extends Component implements AppNode {
    //region FIELDS
    props : {
        //data
        parent:AppNode,
        symbolMap:any,
        parentDir:MathAsmDir,
        statement:MathAsmStatement,

        //actions

        //styling
        style?: CSSProperties,
        className?: string,
    };

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
    };

    _rootRef = null;
    //endregion


    //region EVENT HANDLERS
    checkForMissingSymbols(statements:MathAsmStatement[]) {
        const missingIds = SymbolRangeUtils.getMissingIdsFromStatements(statements, this.props.symbolMap);
        if (missingIds.size === 0) return;

        GraphQL.run(q.FETCH_SYMBOLS, {ids:Array.from(missingIds)}).then(resp => {
            SymbolRangeUtils.addSymbolsToMap(this.props.symbolMap, resp.symbols);
            new AppEvent(AppEventType.SYMBOL_MAP_CHANGED, this.props.symbolMap).travelAbove(this);
        });
    }
    //endregion


    //region LIFE CYCLE
    // constructor(props) { super(props); }
    componentDidMount() {
        if (this.props.statement==null) return;

        GraphQL.run(q.FETCH_PROOF, {id:this.props.statement.id}).then(resp=> {
            this.state.player.setupFrom(resp.statement.proof);
            this.checkForMissingSymbols(resp.statement.proof.bases);
            this.forceUpdate();
        });
    }
    //endregion



    //region APP NODE
    getChildMap(): any {
        return null;
    }

    getParent(): AppNode {
        return this.props.parent;
    }

    handleChildEvent(event: AppEvent): AppNodeReaction {
        return AppNodeReaction.UP;
    }

    handleParentEvent(event: AppEvent): AppNodeReaction {
        switch (event.type) {
            case AppEventType.SYMBOL_RENAMED:
                this.forceUpdate();
                return AppNodeReaction.NONE;

            default: return AppNodeReaction.NONE;
        }
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

    /** The user could interact with this component with the keyboard too. Here are the controls: */
    handleKeyPress(e:KeyboardEvent) {
        switch (e.keyCode) {
            case 32: //space bar (Action: switch base direction)
                this.setBaseDir(this.state.player.baseSide===StatementSide.LEFT? StatementSide.RIGHT : StatementSide.LEFT);
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

            case 65: //"a" key (Action: Select all)
                this.changeSelectionType(SelectionType.ALL);
                break;

            case 83: //"s" key (Action: select sentence)
                this.switchToSelectSentenceMode();
                break;

            case 68: //"d" key (Action: Select distinct)
                this.switchToSingleSelectionMode();
                break;

            case 27: //escape key (Action: Select none)
                this.changeSelectionType(SelectionType.NONE);
                break;

            case 90: { //z key
                const currentMoveIndex = this.state.player.currentMoveIndex;
                const moveCount = this.state.player.getMoveCount();

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
    //endregion



    //region RENDERING
    renderTarget(target:MathAsmStatement, index:number) {
        if (!target) return <div>Empty target</div>;

        const changeHandler = () => this.selectTarget(this.state.player.selectedTargetIndex===index? null : index);

        const player = this.state.player;
        const isSelected = player.selectedTargetIndex===index;
        return <div key={index} className="MA_flexStartDown">
            <button
                className="MA_textBut"
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
        return <div className="MA_flexStartDown">
            <button
                className="MA_textBut"
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
                className="MA_roundBut"
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
                className="MA_roundBut"
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
                className="MA_roundBut"
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
                    className="MA_textBut"
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
                className={cx("ProofViewer_root", this.props.className)}
                style={this.props.style}
                onKeyUp={(e:any)=>this.handleKeyPress(e)}
                ref={el => this._rootRef = el}
                tabIndex={0}>
                <div className="ProofViewer_main">
                    {this.renderBase()}
                    {this.renderButtons()}
                    <div>
                        {this.state.player.targets.map((t,index) => this.renderTarget(t, index))}
                        {/*{this.renderEmptyStmtDiv()}*/}
                    </div>
                </div>
                <ProofStepsViewer
                    proofPlayer={this.state.player}
                    onNavigateAction={index => this.goToMove(index)}/>
                {/*<div style={{whiteSpace:"pre"}}>{JSON.stringify(this.state, null, 2)}</div>*/}
            </div>
        );
    }

    //endregion
}

export default ProofViewer;