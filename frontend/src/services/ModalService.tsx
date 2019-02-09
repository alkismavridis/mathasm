import React from 'react';

import App from "../components/App/App";
import LoginDialog from "../components/Modals/LoginDialog/LoginDialog";
import StringInputDialog from "../components/Modals/StringInputDialog/StringInputDialog";
import ModalData from "../entities/frontend/ModalData";

export default class ModalService {
    //region ADDING WINDOWS
    /** Creates a modal window with the given content and id. If no id is provided, one will automatically created. */
    static addModal(id:number, content:any) {
        const modalGroup = App.getModalGroup();
        if (!modalGroup) return;

        modalGroup.addModal({content:content, id:id || modalGroup.getNextId()});
    }

    /**
     * Accepts a modalData object, as defined in ModalGroup.tsx
     * If the given object does not contain an id, one will be automatically created.
     *  */
    static addModalData(data:ModalData) {
        const modalGroup = App.getModalGroup();
        if (!modalGroup) return;

        if (!data.id) data.id = modalGroup.getNextId();
        modalGroup.addModal(data);
    }
    //endregion



    //region SHORTCUTS
    static showLogin() {
        const id = ModalService.getNextId();
        ModalService.addModal(
            id,
            <LoginDialog onLogin={user => {
                App.setUser(user);
                ModalService.removeModal(id);
            }}/>
        );
    }

    static showTextGetter(title:string, placeholder:string, onSubmit:Function) {
        const id = ModalService.getNextId();
        ModalService.addModal(
            id,
            <StringInputDialog
                title={title}
                placeholder={placeholder}
                onSubmit={onSubmit? onSubmit.bind(null, id) : null}/>
        );
    }
    //endregion



    //region MISC
    static getNextId() : number {
        const modalGroup = App.getModalGroup();
        if (!modalGroup) return -1;

        return modalGroup.getNextId();
    }

    static removeModal(id:number) {
        const modalGroup = App.getModalGroup();
        if (!modalGroup) return;

        modalGroup.removeModal(id);
    }
    //endregion



}