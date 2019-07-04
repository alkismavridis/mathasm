import React, {Component} from 'react';
import "./ModalHeader.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";

export default class ModalHeader extends Component {
    //region STATIC
    props : {
        //data
        title?:any,

        //actions
        onClose?:any,
        onConfirm?:any,

        //styling
    };
    //endregion




    //region EVENT HANDLERS
    //endregion


    //region RENDERING
    renderConfirmButton() {
        return <button className="MA_textBut" onClick={this.props.onConfirm} style={{marginLeft:"8px"}}>
            <FontAwesomeIcon icon="check" title="Confirm" className="ModalHeader_confirm"/>
        </button>;
    }

    renderCloseButton() {
        return <button className="MA_textBut" onClick={this.props.onClose} style={{marginLeft:"8px"}}>
            <FontAwesomeIcon icon="times" title="Close" className="ModalHeader_close"/>
        </button>;
    }

    render() {
        return (
            <div className="MA_flexAway ModalHeader_root">
                <div className="ModalHeader_title">{this.props.title}</div>
                <div className="MA_flexStart">
                    {this.props.onConfirm && this.renderConfirmButton()}
                    {this.props.onClose && this.renderCloseButton()}
                </div>
            </div>
        );
    }

    //endregion
}