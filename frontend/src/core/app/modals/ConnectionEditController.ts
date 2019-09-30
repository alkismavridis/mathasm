import ModalState from "./ModalState";
import ModalType from "../../enums/frontend/ModalType";
import {Subject} from "rxjs/index";
import App from "../App";

export default class ConnectionEditController implements ModalState {
    //region FIELDS
    readonly type = ModalType.CONNECTION_EDIT;
    modalId?:number;
    readonly closeOnOutsideClick = true;

    readonly onChange = new Subject<ConnectionEditController>();
    //endregion



    //region LIFE CYCLE
    constructor(
        private app:App,
        private _grade:string = "0",
        private _isBidirectional:boolean = true,
        private onSubmit?:(ConnectionEditController)=>void
    ) {}
    //endregion



    //region GETTERS
    get grade(): string { return this._grade; }
    get isBidirectional(): boolean { return this._isBidirectional; }

    getGradeAsNumber() : number {
        const asNum = parseInt(this._grade);
        if (isNaN(asNum)) return 0;
        return asNum;
    }
    //endregion



    //region ACTIONS
    set grade(value: string) {
        this._grade = value;
        this.onChange.next(this);
    }

    set isBidirectional(value: boolean) {
        this._isBidirectional = value;
        this.onChange.next(this);
    }

    submit() {
        if(this.onSubmit) this.onSubmit(this);
        this.app.modals.removeModal(this.modalId);
    }
    //endregion
}