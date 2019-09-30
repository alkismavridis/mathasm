import PageController from "./PageController";
import PageType from "../../enums/frontend/PageType";
import MathAsmSymbol from "../../entities/backend/MathAsmSymbol";
import StatementSide from "../../enums/StatementSide";
import MathAsmStatement from "../../entities/backend/MathAsmStatement";
import SavedTheoremInfo from "../../entities/backend/SavedTheoremInfo";
import {Subject} from "rxjs/index";
import MathAsmDir from "../../entities/backend/MathAsmDir";
import DirViewerGroupController from "../DirViewerGroupController";
import {SymbolRangeUtils} from "../../utils/SymbolRangeUtils";
import App from "../App";

const q = {
    FETCH_SYMBOLS: `query($ids:[Long!]!) {
        symbols(ids:$ids) { uid, text }
    }`,
};


export class SymbolClickInfo {
    symbol: MathAsmSymbol;
    statement?: MathAsmStatement;
    side?: StatementSide;
}


class AxiomSaveInfo {
    statement: MathAsmStatement;
    parentDirId: number;
}

export enum MainPageMode {
    VIEW = 1,
    CREATE_SYMBOL = 2,
    CREATE_AXIOM = 3,
    CREATE_THEOREM = 4,
    SHOW_PROOF = 5,
    //etc
}


export default class MainPageController implements PageController {
    //region FIELDS
    readonly type = PageType.MAIN;
    readonly symbolMap = new Map<number, MathAsmSymbol>();
    mode = MainPageMode.VIEW;


    dirViewer = new DirViewerGroupController(this, this.app);
    statementForProof:MathAsmStatement = null;



    //subscriptions
    readonly onModeChanged = new Subject<MainPageMode>();
    readonly onActiveDirChanged = new Subject<MathAsmDir>();




    //deprecated
    onProofSaved = new Subject<SavedTheoremInfo[]>();

    onAxiomSaved = new Subject<AxiomSaveInfo>();
    onSymbolMapUpdated = new Subject<Map<number, MathAsmSymbol>>();
    onSymbolClicked = new Subject<SymbolClickInfo>();
    onStmtClicked = new Subject<MathAsmStatement>();
    onSymbolRenamed = new Subject<MathAsmSymbol>();
    //endregion


    //region LIFE CYCLE
    constructor(private app:App) {}
    //endregion



    //region ACTIONS
    /** Enters or leaves the symbol creation mode. Leaving is always performed towards MainPageMode.VIEW. */
    toggleSymbolCreationMode() {
        this.mode = this.mode === MainPageMode.CREATE_SYMBOL?
            MainPageMode.VIEW :
            MainPageMode.CREATE_SYMBOL;

        this.onModeChanged.next(this.mode);

    }

    /** Enters or leaves axiom creation mode. Leaving is always performed towards MainPageMode.VIEW. */
    toggleAxiomCreationMode() {
        this.mode = this.mode === MainPageMode.CREATE_AXIOM?
            MainPageMode.VIEW :
            MainPageMode.CREATE_AXIOM;

        this.onModeChanged.next(this.mode);
    }

    /** Enters or leaves theorem creation mode. Leaving is always performed towards MainPageMode.VIEW. */
    toggleTheoremCreationMode() {
        this.mode = this.mode === MainPageMode.CREATE_THEOREM?
            MainPageMode.VIEW :
            MainPageMode.CREATE_THEOREM;

        this.onModeChanged.next(this.mode);
    }

    symbolCreated(s:MathAsmSymbol) {
        this.symbolMap.set(s.uid, s);
        this.dirViewer.symbolCreated(s);
    }

    showProof(stmt:MathAsmStatement) {
        this.statementForProof = stmt;
        this.mode = MainPageMode.SHOW_PROOF;
        this.onModeChanged.next(this.mode);
    }

    proofSaved(proof:SavedTheoremInfo[]) {
        this.mode = MainPageMode.VIEW;
        this.onModeChanged.next(this.mode);

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