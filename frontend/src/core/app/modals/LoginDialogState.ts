import ModalState from "./ModalState";
import ModalType from "../../enums/frontend/ModalType";
import App from "../App";
import LoginResponse from "../../entities/backend/LoginResponse";
import {Subject} from "rxjs/index";
import ErrorCode from "../../enums/ErrorCode";


const q = {
    SIGN_IN: `mutation($userName:String!, $password:String!) {
        authWSector {
          signin(username:$userName, password:$password) {
            sessionKey
            user {id, userName}
          }
        }
    }`,

    LOGIN: `mutation($userName:String!, $password:String!) {
        authWSector{
            login(username:$userName, password:$password) {
                sessionKey
                user {id, userName}
            }
        }
    }`
};

export default class LoginDialogState implements ModalState {
    //region FIELDS
    readonly type = ModalType.LOGIN;
    public readonly closeOnOutsideClick = true;
    public modalId?:number = null;

    private _showSignIn = false;
    private _userName = "";
    private _password = "";
    private _errorCode:ErrorCode = null;

    readonly onChange = new Subject<LoginDialogState>();
    //endregion



    constructor(private app:App) {}




    //region GETTER
    get showSignIn(): boolean { return this._showSignIn; }
    get userName(): string { return this._userName; }
    get password(): string { return this._password; }
    get errorCode(): ErrorCode { return this._errorCode; }
    //endregion




    //region ACTIONS
    set errorCode(value: ErrorCode) {
        this._errorCode = value;
        this.onChange.next(this);
    }

    set showSignIn(value: boolean) {
        if(this._showSignIn==value) return;

        this._showSignIn = value;
        this._userName = "";
        this._password = "";
        this._errorCode = null;
        this.onChange.next(this);
    }

    set userName(value: string) {
        this._userName = value;
        this._errorCode = null;
        this.onChange.next(this);
    }

    set password(value: string) {
        this._password = value;
        this._errorCode = null;
        this.onChange.next(this);
    }

    attemptSignin() {
        this.app.graphql.run(q.SIGN_IN, {userName:this._userName, password:this._password})
            .then(data => {
                if (!data || !data.authWSector || !data.authWSector.signin) return;
                this.afterLogin(data.authWSector.signin);
            })
            .catch(err => this.errorCode = err.code);
    }

    attemptLogin() {
        this.app.graphql.run(q.LOGIN, {userName:this._userName, password:this._password})
            .then(data => {
                if(!data || !data.authWSector || !data.authWSector.login) return;
                this.afterLogin(data.authWSector.login);
            })
            .catch(err => {
                console.error(err);
                this.errorCode = err.code || ErrorCode.UNKNOWN;
            });
    }




    private afterLogin(resp:LoginResponse) {
        this.app.auth.sessionKey = resp.sessionKey;
        this.app.auth.user = resp.user;
        this.app.modals.removeModal(this.modalId);
        this.app.quickInfos.makeSuccess(`Hello ${resp.user.userName}. Welcome to MathAsm.`);
    }
    //endregion
}