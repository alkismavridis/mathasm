import React, {Component} from 'react';
import cx from "classnames";
import "./GlobalHeader.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import UserMenu from "../Modals/UserMenu/UserMenu";
import AboutDialog from "../Modals/AboutDialog/AboutDialog";
import App from "../../../core/app/App";
import UserMenuController from "../../../core/app/modals/UserMenuController";

export default class GlobalHeader extends Component {
    //region FIELDS
    props : {
        app:App,
        className?:string
    };
    //endregion



    //region EVENT HANDLERS
    handleUserIconClick() {
        if(!this.props.app.auth.user) this.props.app.modals.showLogin();
        else this.props.app.modals.addModal(new UserMenuController(this.props.app));
    }

    handleAboutClick() {
        this.props.app.modals.showAbout();
    }
    //endregion



    //region RENDERING
    renderUserMenu() {
        const user = this.props.app.auth.user;
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
        );
    }

    render() {
        return (
            <div className={cx("MA_flexAway GlobalHeader_root", this.props.className)}>
                {this.renderUserMenu()}
                {this.renderAboutButton()}
            </div>
        );
    }
    //endregion
}