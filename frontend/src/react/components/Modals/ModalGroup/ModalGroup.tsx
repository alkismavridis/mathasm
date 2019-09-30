import React, {Component} from 'react';
import "./ModalGroup.css";
import App from "../../../../core/app/App";
import {Subscription} from "rxjs/index";
import {reactOn, unsubscribeAll} from "../../../utils/SubscriptionUtils";
import ModalState from "../../../../core/app/modals/ModalState";
import ModalType from "../../../../core/enums/frontend/ModalType";
import StringInputDialog from "../StringInputDialog/StringInputDialog";
import TextGetterState from "../../../../core/app/modals/TextGetterState";
import LoginDialog from "../LoginDialog/LoginDialog";
import LoginDialogState from "../../../../core/app/modals/LoginDialogState";
import ConnectionEditDialog from "../ConnectionEditDialog/ConnectionEditDialog";
import ConnectionEditController from "../../../../core/app/modals/ConnectionEditController";
import AboutDialog from "../AboutDialog/AboutDialog";
import AboutDialogController from "../../../../core/app/modals/AboutDialogController";
import StmtMenuController from "../../../../core/app/modals/StmtMenuController";
import StatementMenu from "../StatementMenu/StatementMenu";
import SymbolMenu from "../SymbolMenu/SymbolMenu";
import SymbolMenuController from "../../../../core/app/modals/SymbolMenuController";
import DirectoryMenu from "../DirectoryMenu/DirectoryMenu";
import DirMenuController from "../../../../core/app/modals/DirMenuController";
import UserMenu from "../UserMenu/UserMenu";
import UserMenuController from "../../../../core/app/modals/UserMenuController";


/**
 * A component that render modal windows.
 * */
export default class ModalGroup extends Component {
    //region FIELDS
    props : {
        app:App,
    };

    _keyHandler = null;
    subscriptions:Subscription[] = [];
    //endregion



    //region LIFE CYCLE
    constructor(props) {
        super(props);

        reactOn(this.props.app.modals.onModalChanged, this, data => this.handleModalChange(data));
    }

    componentWillUnmount() {
        unsubscribeAll(this);
    }
    //endregion




    //region EVENT HANDLERS
    handleModalChange(data:ReadonlyArray<ModalState>) {
        if (data.length===0 && this._keyHandler) {
            document.body.removeEventListener("keydown", this._keyHandler);
            this._keyHandler = null;
        }

        if (this._keyHandler==null && data.length>0) {
            this._keyHandler = this.handleEscape.bind(this);
            document.body.addEventListener("keydown", this._keyHandler);
        }

        this.forceUpdate();
    }

    handleEscape(e) {
        if (e.keyCode !== 27) return; //we care only about escape key
        this.props.app.modals.removeLast();
    }

    handleOverlayClick(modalData:ModalState, event) {
        if (modalData.closeOnOutsideClick===false) return;
        if(!event.target.classList.contains("ModalGroup_overlay")) return; //internal window click
        this.props.app.modals.removeModal(modalData.modalId);
    }
    //endregion




    //region RENDERING
    renderModal(state:ModalState) {
        switch (state.type) {
            case ModalType.TEXT_GETTER:
                return <StringInputDialog data={state as TextGetterState}/>;

            case ModalType.LOGIN:
                return <LoginDialog data={state as LoginDialogState}/>;

            case ModalType.CONNECTION_EDIT:
                return <ConnectionEditDialog ctrl={state as ConnectionEditController}/>;

            case ModalType.ABOUT:
                return <AboutDialog ctrl={state as AboutDialogController}/>;

            case ModalType.STMT_MENU:
                return <StatementMenu ctrl={state as StmtMenuController} />;

            case ModalType.SYMBOL_MENU:
                return <SymbolMenu ctrl={state as SymbolMenuController} />;

            case ModalType.DIR_MENU:
                return <DirectoryMenu ctrl={state as DirMenuController} />;

            case ModalType.USER_MENU:
                return <UserMenu ctrl={state as UserMenuController} />;

            default:
                return <div>Unknown window type!</div>;


        }
    }

    render() {
        return this.props.app.modals.modalData.map(s => <div
            data-id={s.modalId}
            className="ModalGroup_overlay"
            onClick={this.handleOverlayClick.bind(this, s)}
            key={s.modalId}>
            <div style={{margin:"auto"}}>{this.renderModal(s)}</div>
        </div>);
    }

    //endregion
}