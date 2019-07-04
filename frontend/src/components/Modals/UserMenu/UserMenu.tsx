import React, {Component} from 'react';
import "./UserMenu.scss";
import ModalHeader from "../ModalHeader/ModalHeader";
import GraphQL from "../../../services/GraphQL";
import QuickInfoService from "../../../services/QuickInfoService";
import ModalService from "../../../services/ModalService";
import App from "../../App/App";
import User from "../../../entities/backend/User";

export default class UserMenu extends Component {
    //region STATIC
    props : {
        //data
        modalId:number,
        user:User,

        //actions
        //styling
    };
    //endregion



    //region EVENT HANDLERS
    handleLogoutClick() {
        GraphQL.run("mutation { authWSector { logout } }")
            .then(mutation => {
                if (mutation && mutation.authWSector && mutation.authWSector.logout) {
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
            <div className="MA_window UserMenu_root">
                <ModalHeader title={this.props.user.userName}/>
                <button className="MA_textBut" onClick={this.handleLogoutClick.bind(this)}>Logout</button>
            </div>
        );
    }

    //endregion
}