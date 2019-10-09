import MainPageContentController from "./MainPageContentController";
import MainPageMode from "../MainPageMode";
import MainPageController from "../MainPageController";
import MathAsmDir from "../../../../entities/backend/MathAsmDir";
import App from "../../../App";
import ErrorCode from "../../../../enums/ErrorCode";
import {Subject} from "rxjs";


const q = {
    CREATE_SYMBOL: `mutation($text:String!, $uid:Long!, $parentId:Long!) {
        symbolWSector {
            createSymbol(parentId:$parentId, text:$text, uid:$uid) {uid,text}
        }
    }`
};


export default class SymbolCreatorController implements MainPageContentController {
    //region FIELDS
    readonly mode = MainPageMode.CREATE_SYMBOL;

    private _isLoading = false;
    private _text = "";
    private _uid = "";

    readonly onChange = new Subject<SymbolCreatorController>();
    //endregion


    constructor(private mainPage:MainPageController, private app:App) {}



    //region GETTERS
    get activeDir() : MathAsmDir { return this.mainPage.dirViewer.activeDir; }
    get isLoading() : boolean { return this._isLoading; }
    get text() : string { return this._text; }
    get uid() : string { return this._uid; }
    //endregion



    //region ACTIONS
    set text(txt:string) {
        this._text = txt;
        this.onChange.next(this);
    }

    set uid(txt:string) {
        this._uid = txt;
        this.onChange.next(this);
    }

    submitSymbol() {
        const activeDir = this.activeDir;
        if(!activeDir) return;
        this._isLoading = true;
        this.onChange.next(this);

        this.app.graphql.run(q.CREATE_SYMBOL, {parentId:activeDir.id, text:this._text, uid:this._uid})
            .then(resp => {
                this.app.quickInfos.makeSuccess(`Symbol "${this._text}" successfully created.`);
                this._text = "";
                this._uid = (+this._uid + 1) + "";
                this.mainPage.symbolCreated(resp.symbolWSector.symbolCreated);
            })
            .catch(err => this.handleSubmitError(err))
            .finally(() => {
                this._isLoading = false;
                this.onChange.next(this);
            });
    }

    handleSubmitError(err) {
        if (err.code === ErrorCode.SYMBOL_TEXT_ALREADY_REGISTERED) {
            this.app.quickInfos.makeError(`A symbol with name "${this._text}" is already registered.`);
        }
        else if (err.code === ErrorCode.SYMBOL_UID_ALREADY_REGISTERED) {
            this.app.quickInfos.makeError(`A symbol with uid ${this._uid} is already registered.`);
        }
        else this.app.quickInfos.makeError(`Could not create symbol "${this._text}".`);
    }
    //endregion
}