import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./UserMenu.css";
import DomUtils from "../../../services/DomUtils";
import ModalHeader from "../ModalHeader/ModalHeader";
import GraphQL from "../../../services/GraphQL";
import QuickInfoService from "../../../services/QuickInfoService";
import ModalService from "../../../services/ModalService";
import App from "../../App/App";

export default class UserMenu extends Component {
    //region STATIC
    static propTypes = {
        //data
        modalId:PropTypes.number.isRequired,
        user:PropTypes.object.isRequired,

        //actions
        //styling
    };
    //endregion



    //region EVENT HANDLERS
    handleLogoutClick() {
        GraphQL.run("mutation { logout }")
            .then(resp => {
                if (resp.logout) {
                    QuickInfoService.makeSuccess("Bye, "+this.props.user.userName+".");
                    App.setUser(null);
                    ModalService.removeModal(this.props.modalId);
                }
                else QuickInfoService.makeError("Error while logging out.");
            })
            .catch(err => QuickInfoService.makeError("Error while logging out."));
    }
    //endregion


    //region RENDERING
    render() {
        return (
            <div className="Globals_window UserMenu_root">
                <ModalHeader title={this.props.user.userName}/>
                <button className="Globals_textBut" onClick={this.handleLogoutClick.bind(this)}>Logout</button>
            </div>
        );
    }

    //endregion
}