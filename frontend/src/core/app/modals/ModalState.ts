import ModalType from "../../enums/frontend/ModalType";

export default interface ModalState {
    type:ModalType;
    modalId?:number;
    closeOnOutsideClick:boolean;
}