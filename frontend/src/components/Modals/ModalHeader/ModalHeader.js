import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./ModalHeader.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";

export default class ModalHeader extends Component {
    //region STATIC
    static propTypes = {
        //data
        title:PropTypes.node,

        //actions
        onClose:PropTypes.func,
        onConfirm:PropTypes.func,

        //styling
    };
    //endregion




    //region EVENT HANDLERS
    //endregion


    //region RENDERING
    renderConfirmButton() {
        return <div onClick={this.props.onConfirm}>
            <FontAwesomeIcon icon="check" title="Confirm" className="ModalHeader_confirm"/>
        </div>;
    }

    renderCloseButton() {
        return <div onClick={this.props.onClose}>
            <FontAwesomeIcon icon="times" title="Close" className="ModalHeader_close"/>
        </div>;
    }

    render() {
        return (
            <div className="Globals_flexAway ModalHeader_root">
                <div className="ModalHeader_title">{this.props.title}</div>
                <div className="Globals_flexStart">
                    {this.props.onConfirm && this.renderConfirmButton()}
                    {this.props.onClose && this.renderCloseButton()}
                </div>
            </div>
        );
    }

    //endregion
}