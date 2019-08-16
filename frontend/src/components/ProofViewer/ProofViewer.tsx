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
            if(this._rootRef) this._rootRef.focus();
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
    /** The user could interact with this component with the keyboard too. Here are the controls: */
    handleKeyPress(e:KeyboardEvent) {
        switch (e.keyCode) {
            case 38: { //arrow up (Action: change selected target)
                const currentMoveIndex = this.state.player.currentMoveIndex;
                const moveCount = this.state.player.getMoveCount();
                if (moveCount!==0 && currentMoveIndex>=0) this.goToMove(currentMoveIndex-1);
                break;
            }

            case 40: { //arrow down (Action: change selected target)
                const currentMoveIndex = this.state.player.currentMoveIndex;
                const moveCount = this.state.player.getMoveCount();
                if (moveCount!==0 && currentMoveIndex!==moveCount-1) this.goToMove(currentMoveIndex+1);
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

        return <div className="ProofViewer_base">
            <div>{player.base?
                "Base for next move: "+MathAsmStatement.getDisplayName(player.base) :
                "No base selected..."
            }</div>
            {player.base && <Statement symbolMap={this.props.symbolMap} statement={player.base} side={player.baseSide}/>}
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