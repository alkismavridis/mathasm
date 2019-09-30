import ModalState from "./ModalState";
import ModalType from "../../enums/frontend/ModalType";
import App from "../App";
import TextGetterState from "./TextGetterState";
import MathAsmDir from "../../entities/backend/MathAsmDir";


export default class DirMenuController implements ModalState {
    //region FIELDS
    readonly type = ModalType.DIR_MENU;
    public readonly closeOnOutsideClick = true;
    public modalId?:number = null;

    private _renameCallback: (dir:MathAsmDir,s:TextGetterState)=>void;
    private _moveCallback: (dir:MathAsmDir,s:TextGetterState)=>void;
    //endregion


    constructor(private _dir:MathAsmDir, private app:App) {}


    //region GETTERS
    get directory() : MathAsmDir { return this._dir; }
    //endregion


    //region SETTERS
    setOnRename(callback: (dir:MathAsmDir,s:TextGetterState)=>void) {
        this._renameCallback = callback;
    }

    setOnMove(callback: (dir:MathAsmDir,s:TextGetterState)=>void) {
        this._moveCallback = callback;
    }
    //endregion



    //region ACTIONS
    onMoveClicked() {
        this.app.modals.showTextGetter(
            "Move "+this._dir.name+" to...",
            "New parent id",
            (t,s) => {
                if(this._moveCallback) this._moveCallback(this._dir, s);
            }
        );

        this.close();
    }

    onRenameClicked() {
        this.app.modals.showTextGetter(
            "Rename "+this._dir.name+" to...",
            "New name",
            (t,s) => {
                if(this._renameCallback) this._renameCallback(this._dir, s);
            }
        );

        this.close();
    }

    close() {
        this.app.modals.removeModal(this.modalId);
    }
    //endregion
}