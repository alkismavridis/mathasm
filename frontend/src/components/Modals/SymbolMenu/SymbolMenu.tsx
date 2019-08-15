import React, {Component} from 'react';
import "./SymbolMenu.scss";
import ModalHeader from "../ModalHeader/ModalHeader";
import MathAsmSymbol from "../../../entities/backend/MathAsmSymbol";
import App from "../../../services/App";

export default class SymbolMenu extends Component {
    //region STATIC
    props : {
        //data
        app:App,
        modalId?:number,
        symbol:MathAsmSymbol,

        //actions
        onMoveClicked:Function,
        onRenameClicked:Function,

        //styling
    };
    //endregion



    //region EVENT HANDLERS
    closeDialog() {
        this.props.app.modalService.removeModal(this.props.modalId);
    }

    handleMoveClick = () => {
        this.closeDialog();
        if(this.props.onMoveClicked) this.props.onMoveClicked();
    };

    handleRenameClick = () => {
        this.closeDialog();
        if(this.props.onRenameClicked) this.props.onRenameClicked();
    };
    //endregion


    //region RENDERING
    render() {
        return (
            <div className="MA_window" style={{padding:"8px", minWidth:"170px"}}>
                <ModalHeader
                    title={this.props.symbol.text}
                    onClose={()=>this.closeDialog()}/>
                <button className="MA_menuItem" onClick={this.handleMoveClick}>Move</button>
                <button className="MA_menuItem" onClick={this.handleRenameClick}>Rename</button>
            </div>
        );
    }
    //endregion
}