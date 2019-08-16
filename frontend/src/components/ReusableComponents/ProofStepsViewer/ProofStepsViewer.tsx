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



    //region RENDERING
    renderIndexDiv(index:number, isSelected:boolean, handler:any) {
        return <div
            key={index}
            onClick={handler}
            className={cx("ProofStepsViewer_num", isSelected? "ProofStepsViewer_selected" : null)}>
            {index+1}.
        </div>;
    }

    appendStartMove(move:FrontendMove, index:number, targetArray:any[], handler:any) {
        const isSelected = index === this.props.proofPlayer.currentMoveIndex+1;
        targetArray.push(this.renderIndexDiv(index, isSelected, handler));

        switch(move.baseSide) {
            case StatementSide.BOTH:
                targetArray.push(<FontAwesomeIcon key={index+"b"} icon="bolt" onClick={handler} className="ProofStepsViewer_startIcon"/>);
                break;

            case StatementSide.LEFT:
                targetArray.push(<FontAwesomeIcon key={index+"b"} icon="ruler-combined" onClick={handler} flip="horizontal" className="ProofStepsViewer_startIcon"/>);
                break;

            case StatementSide.RIGHT:
                targetArray.push(<FontAwesomeIcon key={index+"b"} icon="ruler-combined" onClick={handler} className="ProofStepsViewer_startIcon"/>);
                break;
        }

        targetArray.push(
            <button
                key={index+"c"}
                onClick={handler}
                className={cx("ProofStepsViewer_move MA_textBut", isSelected && "ProofStepsViewer_selected")}>
                {move.base.name || ("Internal "+move.base._internalId)}
            </button>
        );
    }

    appendReplacementMove(move:FrontendMove, index:number, targetArray:any[], handler:any) {
        const isSelected = index === this.props.proofPlayer.currentMoveIndex+1;

        targetArray.push(this.renderIndexDiv(index, isSelected, handler));
        targetArray.push(<FontAwesomeIcon key={index+"b"} onClick={handler} icon="check" className="ProofStepsViewer_repIcon"/>);
        targetArray.push(
            <button
                key={index+"c"}
                onClick={handler}
                className={cx("ProofStepsViewer_move MA_textBut", isSelected && "ProofStepsViewer_selected")}>
                {move.base.name || ("Internal "+move.base._internalId)}
            </button>
        );
    }

    appendSaveMove(move:FrontendMove, index:number, targetArray:any[], handler:any) {
        const isSelected = index === this.props.proofPlayer.currentMoveIndex+1;

        targetArray.push(this.renderIndexDiv(index, isSelected, handler));
        targetArray.push(<FontAwesomeIcon key={index+"b"} icon="save" onClick={handler} className="ProofStepsViewer_saveIcon"/>);
        targetArray.push(
            <button
                key={index+"c"}
                onClick={handler}
                className={cx("ProofStepsViewer_move MA_textBut", isSelected && "ProofStepsViewer_selected")}>
                {move.name}
            </button>
        );
    }

    appendMoveMarkup(move:FrontendMove, index:number, targetArray:any[]) {
        const handler = this.props.onNavigateAction && (() => this.props.onNavigateAction(index-1));

        switch(move.moveType) {
            case MoveType.START: return this.appendStartMove(move, index, targetArray, handler);
            case MoveType.REPLACE: return this.appendReplacementMove(move, index, targetArray, handler);
            case MoveType.SAVE: return this.appendSaveMove(move, index, targetArray, handler);
        }
    }

    renderSteps() {
        const ret = [];
        this.props.proofPlayer.getMoves().forEach((m,index) => this.appendMoveMarkup(m, index, ret));
        return ret;
    }

    renderEnd() {
        const moveCount = this.props.proofPlayer.getMoveCount();
        if(moveCount==0) return null;

        const isSelected = moveCount==this.props.proofPlayer.currentMoveIndex+1;
        return <button
            className={cx("MA_textBut", "ProofStepsViewer_end", isSelected? "ProofStepsViewer_selected" : null)}
            onClick={this.props.onNavigateAction && (() => this.props.onNavigateAction(moveCount-1))}>
            End
        </button>;
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
                        disabled={moveCount===0 || currentIndex<=-1}
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
                    {this.renderSteps()}
                    {this.renderEnd()}
                </div>
            </div>
        );
    }

    //endregion
}