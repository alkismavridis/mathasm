import React, {Component} from 'react';
import "./UserMenu.scss";
import ModalHeader from "../ModalHeader/ModalHeader";
import App from "../../../services/App";

export default class UserMenu extends Component {
    //region STATIC
    props : {
        //data
        app:App,
        modalId:number,

        //actions
        //styling
    };
    //endregion



    //region EVENT HANDLERS
    handleLogoutClick() {
        this.props.app.graphql.run("mutation { authWSector { logout } }")
            .then(mutation => {
                if (mutation && mutation.authWSector && mutation.authWSector.logout) {
                    this.props.app.quickInfoService.makeSuccess("Bye, "+this.props.app.user.userName+".");
                    this.props.app.user = null;
                    this.props.app.modalService.removeModal(this.props.modalId);
                }
                else this.props.app.quickInfoService.makeError("Error while logging out.");
            })
            .catch(err => this.props.app.quickInfoService.makeError("Error while logging out."));
    }
    //endregion


    //region RENDERING
    render() {
        const user = this.props.app.user;
        return (
            <div className="MA_window UserMenu_root">
                <ModalHeader title={user && user.userName}/>
                <button className="MA_textBut" onClick={this.handleLogoutClick.bind(this)}>Logout</button>
            </div>
        );
    }

    //endregion
}