import React from 'react';

import LoginDialog from "../components/Modals/LoginDialog/LoginDialog";
import StringInputDialog from "../components/Modals/StringInputDialog/StringInputDialog";
import ModalData from "../entities/frontend/ModalData";
import App from "./App";

export default class ModalService {
    private _modalData: ModalData[] = [];
    constructor(private app:App) {}




    //region GETTERS
    get modalData(): ReadonlyArray<ModalData> { return this._modalData; }

    getNextId() : number {
        const maxExistingId = this._modalData.reduce((prev, curr) =>  Math.max(prev, curr.id), 0);
        return maxExistingId+1;
    }

    get lastModalData() : ModalData {
        return this._modalData[this._modalData.length - 1];
    }
    //endregion



    //region ADDING WINDOWS
    /** Creates a modal window with the given content and id. If no id is provided, one will automatically created. */
    addModal(id:number, content:any) {
        this._modalData.push({content:content, id:id || this.getNextId(), closeOnOutsideClick:true});
        this.app.onModalChanged.next(this._modalData);
    }
    //endregion



    //region SHORTCUTS
    showLogin() {
        const id = this.getNextId();
        this.addModal(
            id,
            <LoginDialog app={this.app} onLogin={user => {
                this.app.user = user;
                this.app.modalService.removeModal(id);
            }}/>
        );
    }

    showTextGetter(title:string, placeholder:string, onSubmit:Function) {
        const id = this.getNextId();
        this.addModal(
            id,
            <StringInputDialog
                title={title}
                placeholder={placeholder}
                onSubmit={onSubmit? onSubmit.bind(null, id) : null}/>
        );
    }
    //endregion



    //region MISC
    removeModal(id:number) {
        //1. Local the modal to remove
        const index = this._modalData.findIndex(m => m.id === id);
        if (index<0) return;

        //2. Remove the modal
        this._modalData.splice(index, 1);
        this.app.onModalChanged.next(this._modalData);
    }
    //endregion



}