import {Subject} from "rxjs/index";
import MathAsmDir from "../entities/backend/MathAsmDir";
import MathAsmSymbol from "../entities/backend/MathAsmSymbol";
import SortingUtils from "../utils/SortingUtils";
import MainPageController, {SymbolClickInfo} from "./pages/MainPageController";
import MathAsmStatement from "../entities/backend/MathAsmStatement";
import App from "./App";
import {MathAsmTabController} from "./MathAsmTabController";


export default class DirViewerGroupController {
    //region FIELDS
    private _selectedTabId:number = null;
    tabs:Map<number, MathAsmTabController> = new Map<number, MathAsmTabController>();

    readonly onChange = new Subject<DirViewerGroupController>();
    //endregion



    //region LIFE CYCLE
    constructor(private mainPage:MainPageController, private app:App) {
        this.appendTab(null, null, true);
    }
    //endregion



    //region GETTERS
    get selectedTabId() : number { return this._selectedTabId; }
    get symbolMap() : Map<number, MathAsmSymbol>  { return this.mainPage.symbolMap; }
    get activeTab() :MathAsmTabController { return this.tabs.get(this._selectedTabId); }

    get activeDir() : MathAsmDir {
        const activeTab = this.tabs.get(this._selectedTabId);
        return activeTab? activeTab.currentDir : null;
    }

    /**
     * Useful function when deleting tabs. It accepts the new list of tabs, and will return the best suitable selected Tab.
     * */
    findIdToSelect() : number {
        if (this.tabs.size===0) return null;
        const currentlySelected =this.activeTab;
        return currentlySelected? currentlySelected.tabId : this.tabs.values().next().value.tabId;
    }

    getNewId() : number {
        const iterator = this.tabs.keys();
        let maxId = 0;

        for(let id of iterator) {
            if(id > maxId) maxId = id;
        }

        return maxId+1;
    }
    //endregion


    //region ACTIONS
    symbolCreated(s:MathAsmSymbol) {
        const tab = this.activeTab;
        if(!tab || !tab.currentDir) return;

        tab.currentDir.symbols.push(s); //TODO check if symbol belongs to the current dir!
        tab.cd(tab.currentDir);
    }

    setActiveTab(tabId:number) : boolean {
        if(!this.tabs.has(tabId)) return false;
        this._selectedTabId = tabId;

        const activeTab = this.activeTab;
        if(activeTab) activeTab.cd(activeTab.currentDir);
        this.onChange.next(this);
        return true;
    }

    removeTab(tabId:number) {
        const wasRemoved = this.tabs.delete(tabId);
        if (!wasRemoved) return;

        this._selectedTabId = this.findIdToSelect();
        const selectedTab = this.activeTab;
        if(selectedTab!=null) selectedTab.cd(selectedTab.currentDir);

        this.onChange.next(this);
    }

    appendTab(initDirId:number, dirData:MathAsmDir, focus:boolean) {
        //STEP Sort the statements
        if(dirData && dirData.statements) {
            dirData.statements = SortingUtils.sortByTypeAndId(dirData.statements);
        }

        //STEP Add the ctrl
        const newTabId = this.getNewId();
        this.tabs.set(newTabId, new MathAsmTabController(newTabId, initDirId, dirData, this, this.app));

        //STEP Update the state
        if(focus) this._selectedTabId = newTabId;
        this.onChange.next(this);
    }


    handleSymbolClick(clickInfo:SymbolClickInfo) { this.mainPage.onSymbolClicked.next(clickInfo); }
    handleStatementClick(stmt:MathAsmStatement) { this.mainPage.onStmtClicked.next(stmt); }
    toggleSymbolCreationMode() { this.mainPage.toggleSymbolCreationMode(); }
    toggleAxiomCreationMode() { this.mainPage.toggleAxiomCreationMode(); }
    toggleTheoremCreationMode() { this.mainPage.toggleTheoremCreationMode(); }
    symbolRenamed(s:MathAsmSymbol) { this.mainPage.symbolRenamed(s); }
    checkForNewSymbols(dir:MathAsmDir) { this.mainPage.checkForNewSymbols(dir); }


    showProof(stmt:MathAsmStatement) { this.mainPage.showProof(stmt); }
    //endregion
}