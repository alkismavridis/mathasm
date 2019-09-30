import ModalState from "./ModalState";
import ModalType from "../../enums/frontend/ModalType";
import App from "../App";

export default class AboutDialogController implements ModalState {
    readonly type = ModalType.ABOUT;
    modalId?:number;
    readonly closeOnOutsideClick = true;


    //region LIFE CYCLE
    constructor(private app:App) {}
    //endregion



    //region ACTIONS
    close() {
        this.app.modals.removeModal(this.modalId);
    }
    //endregion
}