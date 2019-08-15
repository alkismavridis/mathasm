import React, {Component} from 'react';
import "./GlobalHeader.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import UserMenu from "../Modals/UserMenu/UserMenu";
import AboutDialog from "../Modals/AboutDialog/AboutDialog";
import App from "../../services/App";

export default class GlobalHeader extends Component {
    //region FIELDS
    props : {
        //data
        app:App,

        //actions

        //styling
    };
    //endregion



    //region EVENT HANDLERS
    handleUserIconClick() {
        if (!this.props.app.user) this.props.app.modalService.showLogin();
        else {
            const id = this.props.app.modalService.getNextId();
            this.props.app.modalService.addModal(
                id,
                <UserMenu app={this.props.app} modalId={id}/>
            );
        }
    }

    handleAboutClick() {
        const id = this.props.app.modalService.getNextId();
        this.props.app.modalService.addModal(
            id,
            <AboutDialog app={this.props.app} modalId={id}/>
        )
    }
    //endregion


    //region RENDERING
    renderUserMenu() {
        const user = this.props.app.user;
        return (
            <div
                className="MA_flexStart GlobalHeader_userDiv"
                onClick={this.handleUserIconClick.bind(this)}>
                <FontAwesomeIcon icon="user"/>
                <div className="GlobalHeader_userName">{user && user.userName}</div>
            </div>
        );
    }

    renderAboutButton() {
        return (
            <div className="GlobalHeader_aboutDiv" onClick={this.handleAboutClick.bind(this)}>
                <FontAwesomeIcon icon="info"/>
            </div>
        )
    }


    render() {
        return (
            <div className="MA_flexAway GlobalHeader_root">
                {this.renderUserMenu()}
                {this.renderAboutButton()}
            </div>
        );
    }

    //endregion
}