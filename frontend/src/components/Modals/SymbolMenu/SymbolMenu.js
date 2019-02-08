import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./SymbolMenu.scss";
import DomUtils from "../../../services/DomUtils";
import ModalHeader from "../ModalHeader/ModalHeader";
import GraphQL from "../../../services/GraphQL";
import QuickInfoService from "../../../services/QuickInfoService";
import ModalService from "../../../services/ModalService";
import App from "../../App/App";

export default class SymbolMenu extends Component {
    //region STATIC
    static propTypes = {
        //data
        modalId:PropTypes.string,
        symbol:PropTypes.object.isRequired,

        //actions
        onMoveClicked:PropTypes.func,

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