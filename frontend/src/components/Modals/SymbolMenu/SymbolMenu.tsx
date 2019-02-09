import React, {Component} from 'react';
import "./SymbolMenu.scss";
import ModalHeader from "../ModalHeader/ModalHeader";
import ModalService from "../../../services/ModalService";
import MathAsmSymbol from "../../../entities/backend/MathAsmSymbol";

export default class SymbolMenu extends Component {
    //region STATIC
    props : {
        //data
        modalId?:number,
        symbol:MathAsmSymbol,

        //actions
        onMoveClicked:Function,

        //styling
    };
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
                    title={this.props.symbol.text}
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