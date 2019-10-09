import MainPageContentController from "./MainPageContentController";
import MainPageMode from "../MainPageMode";
import MathAsmSymbol from "../../../../entities/backend/MathAsmSymbol";
import MathAsmDir from "../../../../entities/backend/MathAsmDir";
import MainPage from "../../../../../react/components/Pages/MainPage/MainPage";
import App from "../../../App";
import MathAsmStatement from "../../../../entities/backend/MathAsmStatement";
import {Subject, Subscription} from "rxjs";
import ConnectionEditController from "../../../modals/ConnectionEditController";
import MainPageController from "../MainPageController";
import TextGetterState from "../../../modals/TextGetterState";

const q = {
    MAKE_AXIOM : `mutation($parentId:Long!, $name:String!, $left:[Long!]!, $grade:Int, $isBidirectional: Boolean, $right:[Long!]!){
      statementWSector {
        createAxiom(parentId:$parentId, name:$name, left:$left, grade:$grade, isBidirectional:$isBidirectional, right:$right) {
	        id,name,type,left,right,grade,isBidirectional
        }
      }
    }`
};


export default class AxiomCreatorController implements MainPageContentController {
    //region FIELDS
    readonly mode = MainPageMode.CREATE_AXIOM;

    private _left:MathAsmSymbol[] = [];
    private _right:MathAsmSymbol[] = [];
    private _grade = 0;
    private _isBidirectional = true;

    private _axiomDir:MathAsmDir = null;
    private _cursor = 0;
    private _isCursorLeft = true;

    //subscriptions
    readonly onChange = new Subject<AxiomCreatorController>();
    //endregion


    constructor(private mainPage:MainPageController, private app:App) {

    }



    //region GETTERS
    /** return either this.state.left or this.state.right depending on this.state.isCursorLeft. */
    private getCurrentSentence() : MathAsmSymbol[] {
        return this._isCursorLeft? this._left : this._right;
    }

    get left(): ReadonlyArray<MathAsmSymbol> { return this._left; }
    get right(): ReadonlyArray<MathAsmSymbol> { return this._right; }
    get cursor(): number { return this._cursor; }
    get isCursorLeft(): boolean { return this._isCursorLeft; }
    get isBidirectional(): boolean { return this._isBidirectional; }
    get grade(): number { return this._grade; }

//endregion



    //region ACTIONS
    /** cat be called by the parent component. Adds a symbol into the current cursor position. */
    addSymbol(sym:MathAsmSymbol) {
        //1. Update the sentence
        const currentSentence = this.getCurrentSentence();
        currentSentence.splice(this._cursor, 0, sym);

        //2. Advance the cursor.
        this._cursor++;
        this.onChange.next(this);
    }

    /** opens a dialog in order to edit the connection. */
    showConnectionEditMenu() {
        this.app.modals.addModal(new ConnectionEditController(
            this.app,
            this._grade+"",
            this._isBidirectional,
            (ce:ConnectionEditController) => {
                this._grade = ce.getGradeAsNumber();
                this._isBidirectional = ce.isBidirectional;
                this.onChange.next(this);
            }
        ));
    }

    showSaveDialog() {
        const activeDir = this.mainPage.dirViewer.activeDir;
        if(!activeDir) return;

        this.app.modals.showTextGetter(
            "Save under "+activeDir.name,
            "Axiom's name...",
            (t,s)=>this.commitSaveRequest(s)
        );
    }

    /** Sends a save request to the server in order to save the axiom with the given name. */
    commitSaveRequest(data:TextGetterState) {
        const activeDir = this.mainPage.dirViewer.activeDir;
        if(!activeDir) return;

        const dataToSend = {
            parentId: activeDir.id,
            name: data.value,
            left: this._left.map(s => s.uid),
            grade: this._grade,
            isBidirectional: this._isBidirectional,
            right: this._right.map(s => s.uid)
        };

        this.app.graphql.run(q.MAKE_AXIOM, dataToSend).then(resp => {
            this.mainPage.onAxiomSaved.next({
                statement:resp.statementWSector.createAxiom,
                parentDirId:activeDir.id
            });
            this.app.modals.removeModal(data.modalId);
        })
        .catch(err => this.app.quickInfos.makeError("Error while creating axiom..."));
    }

    changeSentence(isLeft:boolean) {
        if(this._isCursorLeft===isLeft) return;

        this._isCursorLeft = isLeft;
        this._cursor = 0;
        this.onChange.next(this);
    }

    moveCursor(forwards:boolean) {
        if(forwards) {
            const len = this.getCurrentSentence().length;
            this._cursor = Math.min(len, this._cursor + 1);
        }
        else this._cursor = Math.max(0, this._cursor - 1);

        this.onChange.next(this);
    }

    goTo(position:number, isLeft:boolean) {
        this._isCursorLeft = isLeft;
        const sentence = this.getCurrentSentence();
        this._cursor = Math.max(0, Math.min(position, sentence.length));
        this.onChange.next(this);
    }

    deleteForward() {
        const currentSentence = this.getCurrentSentence();
        if (this._cursor === currentSentence.length || currentSentence.length === 0) return;
        currentSentence.splice(this._cursor, 1);
        this.onChange.next(this);
    }

    deleteBackwards() {
        const currentSentence = this.getCurrentSentence();
        if (this._cursor === 0 || currentSentence.length === 0) return;
        currentSentence.splice(this._cursor - 1, 1);
        this._cursor--;
        this.onChange.next(this);
    }
    //endregion
}