import React, {Component, CSSProperties} from 'react';
import cx from 'classnames';
import "./ProofStepsViewer.scss";
import MoveType from "../../../enums/MoveType";
import StatementSide from "../../../enums/StatementSide";
import SelectionType from "../../../enums/SelectionType";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import FrontendMove from "../../../entities/frontend/FrontendMove";
import ProofPlayer from "../../../entities/frontend/ProofPlayer";

export default class ProofStepsViewer extends Component {
    //region FIELDS
    props : {
        //data
        proofPlayer:ProofPlayer,

        //actions
        onNavigateAction?:Function,

        //styling
        style?: CSSProperties,
        className?: string,
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


    //region EVENT HANDLERS
    //endregion


    //region RENDERING
    renderStartMove(move:FrontendMove, index:number) {
        const isSelected = index === this.props.proofPlayer.currentMoveIndex;
        let message = "";
        switch(move.baseSide) {
            case StatementSide.BOTH:
                message = "Cloning at "+move.targetId;
                break;

            case StatementSide.LEFT:
                message = "Cloning left at "+move.targetId;
                break;

            case StatementSide.RIGHT:
                message = "Cloning right at "+move.targetId;
                break;
        }

        return <div
            key={index}
            onClick={this.props.onNavigateAction && (() => this.props.onNavigateAction(index))}
            className={isSelected? "ProofStepsViewer_move ProofStepsViewer_selected" : "ProofStepsViewer_move"}>
            <span>{index}. {message}</span>
        </div>;
    }

    renderReplacementMove(move:FrontendMove, index:number) {
        const isSelected = index === this.props.proofPlayer.currentMoveIndex;

        let message = "";
        switch(move.selectionType) {
            case SelectionType.ALL:
                message = "Replace all at "+move.targetId;
                break;

            case SelectionType.LEFT:
                message = "Replace left at "+move.targetId;
                break;

            case SelectionType.RIGHT:
                message = "Replace right at "+move.targetId;
                break;

            case SelectionType.ONE_IN_LEFT:
                message = "Replace one in left at "+move.targetId;
                break;

            case SelectionType.ONE_IN_RIGHT:
                message = "Replace one in right at "+move.targetId;
                break;
        }

        return <div
            key={index}
            onClick={this.props.onNavigateAction && (() => this.props.onNavigateAction(index))}
            className={isSelected? "ProofStepsViewer_move ProofStepsViewer_selected" : "ProofStepsViewer_move"}>
            <span>{index}. {message}</span>
        </div>;
    }

    renderSaveMove(move:FrontendMove, index:number) {
        const isSelected = index === this.props.proofPlayer.currentMoveIndex;

        return <div
            key={index}
            onClick={this.props.onNavigateAction && (() => this.props.onNavigateAction(index))}
            className={isSelected? "ProofStepsViewer_move ProofStepsViewer_selected" : "ProofStepsViewer_move"}>
            <span>{index}. Save {move.targetId} as {move.name}</span>
        </div>;
    }


    renderMove(move:FrontendMove, index:number) {
        switch(move.moveType) {
            case MoveType.START: return this.renderStartMove(move, index);
            case MoveType.REPLACE: return this.renderReplacementMove(move, index);
            case MoveType.SAVE: return this.renderSaveMove(move, index);
        }
    }

    render() {
        const moveCount = this.props.proofPlayer.getMoveCount();
        const currentIndex = this.props.proofPlayer.currentMoveIndex;

        return (
            <div className={cx("ProofStepsViewer_root", this.props.className)} style={this.props.style}>
                <div style={{display:"flex"}}>
                    <div style={{marginRight:"8px"}}>Proof:</div>
                    <button
                        className="MA_textBut"
                        style={{marginRight:"8px"}}
                        title="Undo"
                        disabled={moveCount===0 || currentIndex===0}
                        onClick={()=>this.props.onNavigateAction(currentIndex-1)}>
                        <FontAwesomeIcon icon="undo"/>
                    </button>
                    <button
                        className="MA_textBut"
                        disabled={moveCount===0 || currentIndex===moveCount-1}
                        title="Redo"
                        onClick={()=>this.props.onNavigateAction(currentIndex+1)}>
                        <FontAwesomeIcon icon="redo"/>
                    </button>
                </div>
                <div className="ProofStepsViewer_main">
                    {this.props.proofPlayer.getMoves().map((m,index) => this.renderMove(m, index))}
                </div>
            </div>
        );
    }

    //endregion
}