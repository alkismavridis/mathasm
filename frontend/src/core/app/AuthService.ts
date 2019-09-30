import User from "../entities/backend/User";
import App from "./App";
import {Subject} from "rxjs/index";

export default class AuthService {
    //region FIELDS
    //state
    private _user:User;
    private _sessionKey:string;

    //subscriptions
    onUserChanged = new Subject<User>();
    //endregion



    //region LIFE CYCLE
    constructor(public app:App) {}

    postConstruct() {
        const initQuery = `{ user { id, userName, rights } }`;
        this._sessionKey = window.localStorage.getItem("sessionKey");

        this.app.graphql.run(initQuery)
            .then(resp => this.user = resp.user);
    }
    //endregion



    //region GETTERS
    get user(): User { return this._user; }

    get sessionKey() : string {
        if (this._sessionKey === undefined) {
            this._sessionKey = window.localStorage.getItem("sessionKey") || null;
        }
        return this._sessionKey;
    }
    //endregion



    //region ACTIONS
    login() {
        //TODO
    }

    logout() {
        //TODO
    }

    set user(u:User) {
        this._user = u;
        this.onUserChanged.next(u);
    }

    set sessionKey(value: string) {
        if (!value) {
            this._sessionKey = undefined;
            window.localStorage.removeItem("sessionKey")
        }
        else {
            this._sessionKey = value;
            window.localStorage.setItem("sessionKey", value)
        }
    }
    //endregion
}