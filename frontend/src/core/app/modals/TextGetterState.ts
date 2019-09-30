import ModalState from "./ModalState";
import ModalType from "../../enums/frontend/ModalType";
import {Subject} from "rxjs/index";

export default class TextGetterState implements ModalState {
    //region FIELDS
    public readonly type = ModalType.TEXT_GETTER;
    public readonly closeOnOutsideClick = true;
    public modalId?:number = null;

    private _title:string = "";
    private _placeholder:string = "";
    private _value:string = "";
    onSubmit?: (string, TextGetterState?)=>void; //emits the name written by the user and this object

    readonly onChange = new Subject<any>(); //no parameters
    //endregion



    constructor(title:string, placeholder:string, onSubmit:(string, TextGetterState?)=>void) {
        this._title = title;
        this._placeholder = placeholder;
        this.onSubmit = onSubmit;
    }



    //region GETTERS
    get placeholder(): string { return this._placeholder; }
    get title(): string { return this._title; }
    get value(): string { return this._value; }
    //endregion



    //region ACTIONS
    set placeholder(value: string) {
        this._placeholder = value;
        this.onChange.next(null);
    }

    set title(value: string) {
        this._title = value;
        this.onChange.next(null);
    }

    set value(value: string) {
        this._value = value;
        this.onChange.next(null);
    }

    submit() {
        if(this.onSubmit) this.onSubmit(this._value, this);
    }
    //endregion
}