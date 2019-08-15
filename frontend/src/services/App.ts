import ModalService from "./ModalService";
import GraphQL from "./GraphQL";
import User from "../entities/backend/User";
import QuickInfoService from "./QuickInfoService";
import { Subject } from "rxjs";
import ModalData from "../entities/frontend/ModalData";
import MathAsmSymbol from "../entities/backend/MathAsmSymbol";

export default class App {
    //region FIELDS
    modalService:ModalService;
    graphql:GraphQL;
    quickInfoService:QuickInfoService;


    //state
    private _user:User;
    private _sessionKey:string;

    //subscriptions
    onNotificationAdded = new Subject<any>();
    onUserChanged = new Subject<User>();
    onModalChanged = new Subject<ReadonlyArray<ModalData>>();

    onCreateModal = new Subject();
    onRemoveModal = new Subject<number>(); //accepts the modalId to be removed
    //endregion




    //region LIFE CYCLE
    constructor() {
        this.graphql = new GraphQL(this);
        this.modalService = new ModalService(this);
        this.quickInfoService = new QuickInfoService(this);

        this._sessionKey = window.localStorage.getItem("sessionKey");
    }
    //endregion




    //region GETTERS
    get sessionKey() : string {
        if (this._sessionKey === undefined) {
            this._sessionKey = window.localStorage.getItem("sessionKey") || null;
        }
        return this._sessionKey;
    }

    get user(): User { return this._user; }
    //endregion



    //region SETTERS
    set user(value: User) {
        //TODO
        this._user = value;
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