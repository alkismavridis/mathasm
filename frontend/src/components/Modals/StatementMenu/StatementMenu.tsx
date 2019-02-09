import React, {Component} from 'react';
import "./StatementMenu.scss";
import ModalHeader from "../ModalHeader/ModalHeader";
import ModalService from "../../../services/ModalService";
import MathAsmStatement from "../../../entities/backend/MathAsmStatement";

export default class StatementMenu extends Component {
    //region STATIC
    props : {
        //data
        modalId?:number,
        statement:MathAsmStatement,

        //actions
        onMoveClicked?:Function,

        //styling
    };
    //endregion



    //region LIFE CYCLE
    //endregion


    //region EVENT HANDLERS
    closeDialog() {
        ModalService.removeModal(this.props.modalId);
    }

    handleMoveClick = () => {
        this.closeDialog();
        if(this.props.onMoveClicked) this.props.onMoveClicked();
    };
    //endregion


    //region RENDERING
    render() {
        return (
            <div className="Globals_window" style={{padding:"8px"}}>
                <ModalHeader
                    title={this.props.statement.name}
                    onClose={()=>this.closeDialog()}/>

                <div className="Globals_menuItem" onClick={this.handleMoveClick}>Move</div>
                <div
                    className="Globals_menuItem"
                    onClick={()=>{
                        window.alert("TODO not yet implemented");
                        this.closeDialog();
                    }}>
                    Rename
                </div>
            </div>
        );
    }

    //endregion
}