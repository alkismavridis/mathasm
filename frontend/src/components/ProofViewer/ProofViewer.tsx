import React, {Component, CSSProperties} from 'react';
import "./ProofViewer.scss";
import cx from 'classnames';

import SelectionType from "../../enums/SelectionType";
import StatementSide from "../../enums/StatementSide";
import MathAsmDir from "../../entities/backend/MathAsmDir";
import SentenceMatch from "../../entities/frontend/SentenceMatch";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import ProofStepsViewer from "../ReusableComponents/ProofStepsViewer/ProofStepsViewer";
import Statement from "../ReusableComponents/Statement/Statement";
import MathAsmStatement from "../../entities/backend/MathAsmStatement";
import ProofPlayer from "../../entities/frontend/ProofPlayer";
import {SymbolRangeUtils} from "../../services/symbol/SymbolRangeUtils";
import q from "./ProofViewer.graphql";
import App from "../../services/App";
import TheoryExplorerController from "../TheoryExplorer/TheoryExplorerController";



class ProofViewer extends Component {
    //region FIELDS
    props : {
        //data
        app:App,
        controller:TheoryExplorerController,
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


    //region LIFE CYCLE
    // constructor(props) { super(props); }
    componentDidMount() {
        this.fetchProof();
    }

    componentDidUpdate(prevProps) {
        if(this.props.statement != prevProps.statement) this.fetchProof();
    }

    fetchProof() {
        if (this.props.statement==null) return;

        this.props.app.graphql.run(q.FETCH_PROOF, {id:this.props.statement.id}).then(resp=> {
            this.state.player.setupFrom(resp.statement.proof);
            this.checkForMissingSymbols(resp.statement.proof.bases);
            this.forceUpdate();
        });
    }
    //endregion


    //region EVENT HANDLERS
    checkForMissingSymbols(statements:MathAsmStatement[]) {
        const missingIds = SymbolRangeUtils.getMissingIdsFromStatements(statements, this.props.symbolMap);
        if (missingIds.size === 0) return;

        this.props.app.graphql.run(q.FETCH_SYMBOLS, {ids:Array.from(missingIds)}).then(resp => {
            SymbolRangeUtils.addSymbolsToMap(this.props.symbolMap, resp.symbols);
            this.props.controller.onSymbolMapUpdated.next(this.props.symbolMap);
        });
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
        else this.props.app.quickInfoService.makeWarning("This selection is not allowed for the selected base and target.");
    }

    /** Attempt to switch to either LEFT or RIGHT selection. */
    switchToSelectSentenceMode() {
        //1. Try to set LEFT or RIGHT selection.
        let success = this.state.player.setSelection(SelectionType.LEFT, null);
        if (!success) success = this.state.player.setSelection(SelectionType.RIGHT, null);

        //2. Handle result
        if (success) this.setState({player:this.state.player});
        else this.props.app.quickInfoService.makeWarning("Illegal move: Could not perform sentence selection.");
    }

    switchToSingleSelectionMode() {
        //1. Try to set LEFT or RIGHT selection.
        let success = this.state.player.setSelection(SelectionType.ONE_IN_LEFT, null);
        if (!success) success = this.state.player.setSelection(SelectionType.ONE_IN_RIGHT, null);

        //2. Handle result
        if (success) this.setState({player:this.state.player});
        else this.props.app.quickInfoService.makeWarning("Illegal move: Could not perform single selection.");
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

        const player = this.state.player;
        const isSelected = player.selectedTargetIndex===index;
        return <div key={index} className="MA_flexStartDown">
            <div
                className="MA_textBut"
                title="Replace (enter)"
                style={{
                    width: "16px",
                    height: "16px",
                    color:isSelected? "#001fff" : "#001fff73",
                    backgroundColor:"transparent",
                    marginRight:"8px"
                }}>
                <FontAwesomeIcon icon="angle-right"/>
            </div>
            <Statement
                symbolMap={this.props.symbolMap}
                statement={target}
                leftMatches={isSelected? player.leftMatches : null}
                rightMatches={isSelected? player.rightMatches : null}
                matchLength={isSelected? player.getBaseSentenceLength() : 0}/>
        </div>;
    }

    renderBase() {
        const player = this.state.player;
        const prevBase = player.previousBase;

        return <div className="ProofViewer_base">
            <div>Base for next move:</div>

            {/*{prevBase ?*/}
                {/*<Statement symbolMap={this.props.symbolMap} statement={prevBase}/> :*/}
                {/*<div>No prev base...</div>*/}
            {/*}*/}

            {player.base ?
                <Statement symbolMap={this.props.symbolMap} statement={player.base} side={player.baseSide}/> :
                <div>No base selected...</div>
            }
        </div>;
    }

    render() {
        return (
            <div
                className={cx("ProofViewer_root", this.props.className)}
                style={this.props.style}
                onKeyUp={(e:any)=>this.handleKeyPress(e)}
                ref={el => this._rootRef = el}
                tabIndex={0}>
                <ProofStepsViewer
                    proofPlayer={this.state.player}
                    onNavigateAction={index => this.goToMove(index)}/>
                <div className="ProofViewer_main">
                    {this.renderBase()}
                    <div>
                        {this.state.player.targets.map((t,index) => this.renderTarget(t, index))}
                    </div>
                </div>
            </div>
        );
    }

    //endregion
}

export default ProofViewer;