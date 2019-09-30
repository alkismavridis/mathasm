import React, {Component} from 'react';
import "./SymbolMenu.scss";
import ModalHeader from "../ModalHeader/ModalHeader";
import MathAsmSymbol from "../../../../core/entities/backend/MathAsmSymbol";
import App from "../../../../core/app/App";
import SymbolMenuController from "../../../../core/app/modals/SymbolMenuController";

export default class SymbolMenu extends Component {
    //region STATIC
    props : {
        ctrl:SymbolMenuController
    };
    //endregion



    //region RENDERING
    render() {
        return (
            <div className="MA_window" style={{padding:"8px", minWidth:"170px"}}>
                <ModalHeader
                    title={this.props.ctrl.symbol.text}
                    onClose={()=>this.props.ctrl.close()}/>
                <button className="MA_menuItem" onClick={()=>this.props.ctrl.onMoveClicked()}>Move</button>
                <button className="MA_menuItem" onClick={()=>this.props.ctrl.onRenameClicked()}>Rename</button>
            </div>
        );
    }
    //endregion
}