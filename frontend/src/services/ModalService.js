import React from 'react';

import App from "../components/App/App";
import LoginDialog from "../components/Modals/LoginDialog/LoginDialog";
import StringInputDialog from "../components/Modals/DirCreatorDialog/StringInputDialog";

export default class ModalService {
    //region ADDING WINDOWS
    /** Creates a modal window with the given content and id. If no id is provided, one will automatically created. */
    static addModal(id, content) {
        const modalGroup = App.getModalGroup();
        if (!modalGroup) return;

        modalGroup.addModal({content:content, id:id || modalGroup.getNextId()});
    }

    /**
     * Accepts a modalData object, as defined in ModalGroup.js
     * If the given object does not contain an id, one will be automatically created.
     *  */
    static addModalData(data) {
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

    static showTextGetter(title, placeholder, onSubmit) {
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
    static getNextId() {
        const modalGroup = App.getModalGroup();
        if (!modalGroup) return -1;

        return modalGroup.getNextId();
    }

    static removeModal(id) {
        const modalGroup = App.getModalGroup();
        if (!modalGroup) return;

        modalGroup.removeModal(id);
    }
    //endregion



}