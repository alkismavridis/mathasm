import ModalState from "./ModalState";
import ModalType from "../../enums/frontend/ModalType";
import App from "../App";
import TextGetterState from "./TextGetterState";
import MathAsmSymbol from "../../entities/backend/MathAsmSymbol";


export default class SymbolMenuController implements ModalState {
    //region FIELDS
    readonly type = ModalType.SYMBOL_MENU;
    public readonly closeOnOutsideClick = true;
    public modalId?:number = null;

    private _moveCallback: (stmt:MathAsmSymbol, s:TextGetterState)=>void;
    private _renameCallback: (stmt:MathAsmSymbol,s:TextGetterState)=>void;
    //endregion



    constructor(private _sym:MathAsmSymbol, private app:App) {}



    //region GETTERS
    get symbol() : MathAsmSymbol { return this._sym; }
    //endregion


    //region SETTERS
    setOnRename(callback: (stmt:MathAsmSymbol,s:TextGetterState)=>void) {
        this._renameCallback = callback;
    }

    setOnMove(callback: (stmt:MathAsmSymbol,s:TextGetterState)=>void) {
        this._moveCallback = callback;
    }
    //endregion



    //region ACTIONS
    onMoveClicked() {
        this.app.modals.showTextGetter(
            "Move "+this._sym.text+" to...",
            "New parent id",
            (t,s) => {
                if(this._moveCallback) this._moveCallback(this._sym, s);
            }
        );

        this.close();
    }

    onRenameClicked() {
        this.app.modals.showTextGetter(
            "Rename "+this._sym.text+" to...",
            "New name",
            (t,s) => {
                if(this._renameCallback) this._renameCallback(this._sym, s);
            }
        );

        this.close();
    }

    close() {
        this.app.modals.removeModal(this.modalId);
    }
    //endregion
}