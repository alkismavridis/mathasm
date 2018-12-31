import React, {Component} from 'react';
import PropTypes from "prop-types";
import cx from 'classnames';
import "./ProofViewer.scss";
import MoveType from "../../../constants/MoveType";
import StatementSide from "../../../constants/StatementSide";
import SelectionType from "../../../constants/SelectionType";

export default class ProofViewer extends Component {
    //region STATIC
    static propTypes = {
        //data
        proof:PropTypes.object.isRequired,

        //actions
        onNavigateAction:PropTypes.func,

        //styling
        style: PropTypes.object,
        className: PropTypes.string,
    };

    //static defaultProps = {};
    //endregion


    //region FIELDS
    state = {};
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
    renderStartMove(move, index) {
        const isSelected = index === this.props.proof.currentMove;
        let message = "";
        switch(move.side) {
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
            className={isSelected? "ProofViewer_move ProofViewer_selected" : "ProofViewer_move"}>
            <span>{index}. {message}</span>
        </div>;
    }

    renderReplacementMove(move, index) {
        const isSelected = index === this.props.proof.currentMove;

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
            className={isSelected? "ProofViewer_move ProofViewer_selected" : "ProofViewer_move"}>
            <span>{index}. {message}</span>
        </div>;
    }

    renderSaveMove(move, index) {
        const isSelected = index === this.props.proof.currentMove;

        return <div
            key={index}
            onClick={this.props.onNavigateAction && (() => this.props.onNavigateAction(index))}
            className={isSelected? "ProofViewer_move ProofViewer_selected" : "ProofViewer_move"}>
            <span>{index}. Save {move.targetId} as {move.name}</span>
        </div>;
    }


    renderMove(move, index) {
        switch(move.moveType) {
            case MoveType.START: return this.renderStartMove(move, index);
            case MoveType.REPLACE: return this.renderReplacementMove(move, index);
            case MoveType.SAVE: return this.renderSaveMove(move, index);
        }
    }

    render() {
        return (
            <div className={cx("ProofViewer_root", this.props.className)} style={this.props.style}>
                <div>Proof:</div>
                {this.props.proof.moves.map((m,index) => this.renderMove(m, index))}
            </div>
        );
    }

    //endregion
}