import ModalType from "../../enums/frontend/ModalType";
import ModalState from "./ModalState";
import App from "../App";

export default class BaseModalController implements ModalState {
    type:ModalType;
    modalId?:number;
    closeOnOutsideClick:boolean;

    constructor(type:ModalType, public app:App) {
        this.type = type;
    }
}