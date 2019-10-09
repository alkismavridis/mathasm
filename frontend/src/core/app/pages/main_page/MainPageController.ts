import PageController from "../PageController";
import PageType from "../../../enums/frontend/PageType";
import MathAsmSymbol from "../../../entities/backend/MathAsmSymbol";
import MathAsmStatement from "../../../entities/backend/MathAsmStatement";
import SavedTheoremInfo from "../../../entities/backend/SavedTheoremInfo";
import {Subject} from "rxjs/index";
import MathAsmDir from "../../../entities/backend/MathAsmDir";
import DirViewerGroupController from "../../DirViewerGroupController";
import {SymbolRangeUtils} from "../../../utils/SymbolRangeUtils";
import App from "../../App";
import SymbolSelectionInfo from "../../../entities/frontend/SymbolSelectionInfo";
import AxiomSaveInfo from "../../../entities/frontend/AxiomSaveInfo";
import MainPageMode from "./MainPageMode";
import MainPageContentController from "./content/MainPageContentController";
import SymbolCreatorController from "./content/SymbolCreatorController";
import AxiomCreatorController from "./content/AxiomCreatorController";
import TheoremCreatorController from "./content/TheoremCreatorController";
import ProofViewerController from "./content/ProofViewerController";

const q = {
    FETCH_SYMBOLS: `query($ids:[Long!]!) {
        symbols(ids:$ids) { uid, text }
    }`,
};


export default class MainPageController implements PageController {
    //region FIELDS
    readonly type = PageType.MAIN;
    readonly symbolMap = new Map<number, MathAsmSymbol>();

    dirViewer = new DirViewerGroupController(this, this.app);
    private _content:MainPageContentController = null;



    statementForProof:MathAsmStatement = null; //TODO deprecated


    //subscriptions
    readonly onContentChanged = new Subject<MainPageContentController>();
    readonly onActiveDirChanged = new Subject<MathAsmDir>();





    //TODO deprecated (all of them:)
    onProofSaved = new Subject<SavedTheoremInfo[]>();
    onAxiomSaved = new Subject<AxiomSaveInfo>();
    onSymbolMapUpdated = new Subject<Map<number, MathAsmSymbol>>();
    onSymbolClicked = new Subject<SymbolSelectionInfo>();
    onStmtClicked = new Subject<MathAsmStatement>();
    onSymbolRenamed = new Subject<MathAsmSymbol>();
    //endregion


    //region LIFE CYCLE
    constructor(private app:App) {}
    //endregion



    //region GETTERS
    get content() : MainPageContentController { return this._content; }
    //endregion


    //region ACTIONS
    /** Enters or leaves the symbol creation mode. Leaving is always performed towards MainPageMode.VIEW. */
    toggleSymbolCreationMode() {
        if(this._content && this._content.mode == MainPageMode.CREATE_SYMBOL) this._content = null;
        else this._content = new SymbolCreatorController(this, this.app);
        this.onContentChanged.next(this._content);
    }

    /** Enters or leaves axiom creation mode. Leaving is always performed towards MainPageMode.VIEW. */
    toggleAxiomCreationMode() {
        if(this._content && this._content.mode == MainPageMode.CREATE_AXIOM) this._content = null;
        else this._content = new AxiomCreatorController(this, this.app);
        this.onContentChanged.next(this._content);
    }

    /** Enters or leaves theorem creation mode. Leaving is always performed towards MainPageMode.VIEW. */
    toggleTheoremCreationMode() {
        if(this._content && this._content.mode == MainPageMode.CREATE_THEOREM) this._content = null;
        else this._content = new TheoremCreatorController(this, this.app);
        this.onContentChanged.next(this._content);
    }

    showProof(stmt:MathAsmStatement) {
        this.statementForProof = stmt;
        this._content = stmt? new ProofViewerController(stmt, this, this.app) : null;
        this.onContentChanged.next(this._content);
    }

    symbolCreated(s:MathAsmSymbol) {
        this.symbolMap.set(s.uid, s);
        this.dirViewer.symbolCreated(s);
    }



    proofSaved(proof:SavedTheoremInfo[]) {
        this._content = null;
        this.onContentChanged.next(this._content);
        this.onProofSaved.next(proof);
        this.dirViewer.activeTab.handleSavedProof(proof); //TODO update tabs properly. Only the tabs with id that matched should be updated.
    }

    symbolRenamed(s:MathAsmSymbol) {
        this.symbolMap.set(s.uid, s);
        this.onSymbolMapUpdated.next(this.symbolMap);
    }

    /**
     * Scans the given directory for unknown symbols. I any are found, they will be added to this.props.symbolMap,
     * and the parent component will be notified for the change.
     * */
    checkForNewSymbols(dir:MathAsmDir) {
        //1. Detect new symbols
        const newIds = SymbolRangeUtils.getMissingIdsFromDirectory(dir, this.symbolMap);
        if (newIds.size === 0) return;

        //2. If unknown symbols exist, get them from the server.
        this.app.graphql.run(q.FETCH_SYMBOLS, {ids:Array.from(newIds)}).then(resp => {
            SymbolRangeUtils.addSymbolsToMap(this.symbolMap, resp.symbols);
            this.onSymbolMapUpdated.next(this.symbolMap);
        });
    }
    //endregion


}