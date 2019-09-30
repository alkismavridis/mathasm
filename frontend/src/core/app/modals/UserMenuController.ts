import ModalState from "./ModalState";
import ModalType from "../../enums/frontend/ModalType";
import App from "../App";
import LoginResponse from "../../entities/backend/LoginResponse";
import {Subject} from "rxjs/index";
import ErrorCode from "../../enums/ErrorCode";
import User from "../../entities/backend/User";

export default class LoginDialogState implements ModalState {
    //region FIELDS
    readonly type = ModalType.USER_MENU;
    public readonly closeOnOutsideClick = true;
    public modalId?:number = null;
    //endregion

    constructor(private app:App) {}


    //region GETTERS
    get user() : User { return this.app.auth.user; }
    //endregion



    //region ACTIONS
    handleLogoutClick() {
        this.app.graphql.run("mutation { authWSector { logout } }")
            .then(mutation => {
                if (mutation && mutation.authWSector && mutation.authWSector.logout) {
                    this.app.quickInfos.makeSuccess("Bye, "+this.app.auth.user.userName+".");
                    this.app.auth.user = null;
                    this.close();
                }
                else this.app.quickInfos.makeError("Error while logging out.");
            })
            .catch(err => this.app.quickInfos.makeError("Error while logging out."));
    }

    close() {
        this.app.modals.removeModal(this.modalId);
    }
    //endregion
}