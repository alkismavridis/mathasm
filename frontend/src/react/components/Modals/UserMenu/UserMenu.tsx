import React, {Component} from 'react';
import "./UserMenu.scss";
import ModalHeader from "../ModalHeader/ModalHeader";
import App from "../../../../core/app/App";
import UserMenuController from "../../../../core/app/modals/UserMenuController";

export default class UserMenu extends Component {
    //region STATIC
    props : {
        ctrl:UserMenuController
    };
    //endregion




    //region RENDERING
    render() {
        const user = this.props.ctrl.user;
        return (
            <div className="MA_window UserMenu_root">
                <ModalHeader title={user && user.userName}/>
                <button className="MA_textBut" onClick={e=>this.props.ctrl.handleLogoutClick()}>Logout</button>
            </div>
        );
    }

    //endregion
}