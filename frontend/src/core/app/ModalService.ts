import App from "./App";
import {Subject} from "rxjs/index";
import ModalState from "./modals/ModalState";
import TextGetterState from "./modals/TextGetterState";
import LoginDialogState from "./modals/LoginDialogState";
import AboutDialogController from "./modals/AboutDialogController";

export default class ModalService {
    onModalChanged = new Subject<ReadonlyArray<ModalState>>();
    private _modalData: ModalState[] = [];
    constructor(private app:App) {}




    //region GETTERS
    get modalData(): ReadonlyArray<ModalState> { return this._modalData; }

    private getNextId() : number {
        const maxExistingId = this._modalData.reduce((prev, curr) =>  Math.max(prev, curr.modalId), 0);
        return maxExistingId+1;
    }
    //endregion



    //region ACTIONS
    /** Creates a modal window with the given state. If the state has no modalId, one will automatically be created. */
    addModal(state:ModalState) {
        if(state.modalId==null) state.modalId = this.getNextId();

        this._modalData.push(state);
        this.onModalChanged.next(this._modalData);
    }

    removeLast() {
        const lastModal = this._modalData[this._modalData.length-1];
        if (!lastModal) return;
        this.removeModal(lastModal.modalId);
    }

    removeModal(id:number) {
        //1. Local the modal to remove
        const index = this._modalData.findIndex(m => m.modalId === id);
        if (index<0) return;

        //2. Remove the modal
        this._modalData.splice(index, 1);
        this.onModalChanged.next(this._modalData);
    }
    //endregion



    //region SHORTCUTS
    showLogin() {
        this.addModal(new LoginDialogState(this.app));
    }

    showTextGetter(title:string, placeholder:string, onSubmit:(string, TextGetterState?)=>void) {
        this.addModal(new TextGetterState(
            title,
            placeholder,
            onSubmit
        ));
    }

    showAbout() {
        this.addModal(new AboutDialogController(this.app));
    }
    //endregion
}