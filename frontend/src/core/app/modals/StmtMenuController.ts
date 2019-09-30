import ModalState from "./ModalState";
import ModalType from "../../enums/frontend/ModalType";
import App from "../App";
import MathAsmStatement from "../../entities/backend/MathAsmStatement";
import TextGetterState from "./TextGetterState";


export default class StmtMenuController implements ModalState {
    //region FIELDS
    readonly type = ModalType.STMT_MENU;
    public readonly closeOnOutsideClick = true;
    public modalId?:number = null;

    private _showProofCallback: (stmt:MathAsmStatement)=>void;
    private _renameCallback: (stmt:MathAsmStatement,s:TextGetterState)=>void;
    private _moveCallback: (stmt:MathAsmStatement,s:TextGetterState)=>void;
    //endregion



    constructor(private _stmt:MathAsmStatement, private app:App) {}



    //region GETTERS
    get statement() : MathAsmStatement { return this._stmt; }
    //endregion


    //region SETTERS
    setOnViewProof(callback: (stmt:MathAsmStatement)=>void) {
        this._showProofCallback = callback;
    }

    setOnRename(callback: (stmt:MathAsmStatement,s:TextGetterState)=>void) {
        this._renameCallback = callback;
    }

    setOnMove(callback: (stmt:MathAsmStatement,s:TextGetterState)=>void) {
        this._moveCallback = callback;
    }
    //endregion



    //region ACTIONS
    onMoveClicked() {
        this.app.modals.showTextGetter(
            "Move "+this._stmt.name+" to...",
            "New parent id",
            (t,s) => {
                if(this._moveCallback) this._moveCallback(this._stmt, s);
            }
        );

        this.close();
    }

    onRenameClicked() {
        this.app.modals.showTextGetter(
            "Rename "+this._stmt.name+" to...",
            "New name",
            (t,s) => {
                if(this._renameCallback) this._renameCallback(this._stmt, s);
            }
        );

        this.close();
    }

    onViewProofClicked() {
        if(this._showProofCallback) this._showProofCallback(this._stmt);
        this.close();
    }

    close() {
        this.app.modals.removeModal(this.modalId);
    }
    //endregion
}