import React, {Component} from 'react';
import "./StatementMenu.scss";
import ModalHeader from "../ModalHeader/ModalHeader";
import MathAsmStatement from "../../../entities/backend/MathAsmStatement";
import StatementType from "../../../enums/StatementType";
import App from "../../../services/App";

export default class StatementMenu extends Component {
    //region STATIC
    props : {
        //data
        app:App,
        modalId?:number,
        statement:MathAsmStatement,

        //actions
        onMoveClicked?:Function,
        onRenameClicked?:Function,
        onViewProof?:Function,


        //styling
    };
    //endregion



    //region LIFE CYCLE
    //endregion


    //region EVENT HANDLERS
    closeDialog() {
        this.props.app.modalService.removeModal(this.props.modalId);
    }

    handleOptionClicked = (callback) => {
        this.closeDialog();
        if(callback) callback(this.props.statement);
    };

    isTheorem() : boolean {
        return this.props.statement && this.props.statement.type == StatementType.THEOREM;
    }
    //endregion


    //region RENDERING
    render() {
        return (
            <div className="MA_window" style={{padding:"8px", minWidth:"170px"}}>
                <ModalHeader
                    title={this.props.statement.name}
                    onClose={()=>this.closeDialog()}/>

                {this.isTheorem() && <button
                    className="MA_menuItem"
                    onClick={e=>this.handleOptionClicked(this.props.onViewProof)}>
                        View Proof
                    </button>
                }
                <button className="MA_menuItem" onClick={e=>this.handleOptionClicked(this.props.onMoveClicked)}>Move</button>
                <button
                    className="MA_menuItem"
                    onClick={e=>this.handleOptionClicked(this.props.onRenameClicked)}>
                    Rename
                </button>
            </div>
        );
    }

    //endregion
}