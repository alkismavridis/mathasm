import MathAsmDir from "../entities/backend/MathAsmDir";
import DirViewerGroupController from "./DirViewerGroupController";
import App from "./App";
import TextGetterState from "./modals/TextGetterState";
import DomUtils from "../utils/DomUtils";
import MathAsmStatement from "../entities/backend/MathAsmStatement";
import MathAsmSymbol from "../entities/backend/MathAsmSymbol";
import {SymbolClickInfo} from "./pages/MainPageController";
import {Subject} from "rxjs/index";
import ArrayUtils from "../utils/ArrayUtils";
import SavedTheoremInfo from "../entities/backend/SavedTheoremInfo";
import BaseModalController from "./modals/BaseModalController";
import ModalType from "../enums/frontend/ModalType";
import StmtMenuController from "./modals/StmtMenuController";
import SymbolMenuController from "./modals/SymbolMenuController";
import DirMenuController from "./modals/DirMenuController";


const q = {
    FETCH_PARENT: `query($id:Long!){
        dirParent(id:$id) {
            id,name
            statements {id,name,type, left, right, isBidirectional, grade}
            subDirs {id,name}
            symbols {uid, text}
        }
    }`,

    FETCH_DIR: `query($id:Long!){
        logicDir(id:$id) {
            id,name
            statements {id,name,type, left, right, isBidirectional, grade}
            subDirs {id,name}
            symbols {uid, text}
        }
    }`,

    FETCH_ROOT: `{
        rootDir(depth:1) {
            id,name
            statements {id,name,type, left, right, isBidirectional, grade}
            subDirs {id,name}
            symbols {uid, text}
        }
    }`,

    CREATE_DIR: `mutation($parentId:Long!, $name:String!) {
      fsWSector {
        createDir(parentId:$parentId, name:$name) {
            id,name
            statements {id,name,type, left, right, isBidirectional, grade}
            subDirs {id,name}
            symbols {uid, text}
        }
      }
    }`,

    MOVE_DIR: `mutation($dirIdToMove:Long!, $newParentId:Long!, $newName:String) {
      fsWSector {
        moveDir(dirIdToMove:$dirIdToMove, newParentId:$newParentId, newName:$newName)
      }
    }`,

    MOVE_STATEMENT: `mutation($statementIdToMove:Long!, $newParentId:Long!, $newName:String) {
      statementWSector {
        move(statementIdToMove:$statementIdToMove, newParentId:$newParentId, newName:$newName)
      }
    }`,

    MOVE_SYMBOL: `mutation($symbolUidToMove:Long!, $newParentId:Long!) {
      symbolWSector {
        move(symbolUidToMove:$symbolUidToMove, newParentId:$newParentId)
      }
    }`,

    RENAME_SYMBOL: `mutation($symbolUidToMove:Long!, $newText:String!) {
      symbolWSector {
        rename(symbolUidToMove:$symbolUidToMove, newText:$newText)
      }
    }`,

};


class Subsject {
}

export class MathAsmTabController {
    //region FIELDS
    tabId:number;
    initDirId:number;
    currentDir:MathAsmDir;

    readonly onChange = new Subject<MathAsmTabController>();
    readonly symbolMap: Map<number, MathAsmSymbol>;
    //endregion



    //region LIFE CYCLE
    constructor(tabId:number, initDirId:number, initDir:MathAsmDir, private group:DirViewerGroupController, private app:App) {
        this.tabId = tabId;
        this.initDirId = initDirId;
        this.currentDir = initDir;
        this.symbolMap = group.symbolMap;

        if(initDir) {/*do nothing*/}
        else if (initDirId) this.navigateTo(initDirId, false);
        else this.navigateToRoot();
    }
    //endregion



    //region GETTERS
    get isSelected() : boolean {
        return this.tabId === this.group.selectedTabId;
    }
    //endregion



    //region ACTIONS
    /** Navigates to the parent directory of the current one. Data will be fetched from the server. */
    goToParentDir(inNewTab:boolean) {
        if (!this.currentDir) return;

        this.app.graphql.run(q.FETCH_PARENT, {id: this.currentDir.id})
            .then(resp => {
                if (resp.dirParent) {
                    if (inNewTab) this.group.appendTab(resp.dirParent.id, resp.dirParent, false);
                    else this.cd(resp.dirParent);
                    this.group.checkForNewSymbols(resp.dirParent);
                }
                else this.app.quickInfos.makeInfo("This is the root directory.");
            })
            .catch(err => this.app.quickInfos.makeError("Could not fetch init data!"));
    }

    navigateTo(id:number, inNewTab:boolean) {
        if(inNewTab) {
            this.group.appendTab(id, null, false);
            return;
        }

        this.app.graphql.run(q.FETCH_DIR, {id: id})
            .then(resp => {
                if (resp.logicDir) {
                    this.cd(resp.logicDir);
                    this.group.checkForNewSymbols(resp.logicDir);
                }
                else this.app.quickInfos.makeError("Could not navigate to directory with id: " + id);
            })
            .catch(err => this.app.quickInfos.makeError("Could not navigate to directory with id: " + id));
    }

    cd(dir:MathAsmDir) {
        this.currentDir = dir;
        this.group.onChange.next(this.group);
    }

    handleGoToDirClick() {
        this.app.modals.showTextGetter(
            "Go to...",
            "Directory id",
            (t,s) => this.handleGoToAction(t, s)
        );
    }

    /** Is triggered when the go To action is being hit.. */
    handleGoToAction(idToGo:string, data:TextGetterState) {
        if (!DomUtils.isInt(idToGo)) {
            this.app.quickInfos.makeError("Please provide an integer as id to navigate to.");
            return;
        }

        this.app.modals.removeModal(data.modalId);
        this.navigateTo(parseInt(idToGo), false);
    }

    /** Navigates to the root directory. Data will be fetched from the server. */
    navigateToRoot() {
        this.app.graphql.run(q.FETCH_ROOT)
            .then(resp => {
                this.cd(resp.rootDir);
                this.group.checkForNewSymbols(resp.rootDir);
            })
            .catch(err => this.app.quickInfos.makeError("Could not fetch init data!"));
    }

    showStmtMenu(stmt:MathAsmStatement) {
        const ctrl = new StmtMenuController(stmt, this.app);
        ctrl.setOnViewProof(stmt => this.group.showProof(stmt));
        ctrl.setOnMove((stmt,s) => this.handleStatementMoveSubmit(stmt,s));
        ctrl.setOnRename((stmt,s) => this.handleStatementRenameSubmit(stmt,s));

        this.app.modals.addModal(ctrl);
    }


    showSymbolMenu(sym:MathAsmSymbol) {
        const ctrl = new SymbolMenuController(sym, this.app);
        ctrl.setOnMove((sym,s)=>this.handleSymbolMoveSubmit(sym, s));
        ctrl.setOnRename((sym,s)=>this.handleSymbolRenameSubmit(sym,s));
        this.app.modals.addModal(ctrl);
    }

    showDirMenu(dir:MathAsmDir) {
        const ctrl = new DirMenuController(dir, this.app);
        ctrl.setOnMove((dir,s)=>this.handleDirMoveSubmit(dir, s));
        ctrl.setOnRename((dir,s)=>this.handleDirRenameSubmit(dir,s));
        this.app.modals.addModal(ctrl);

        // this.props.app.modalsOLD.addModal(modalId, <DirectoryMenu
        //     app={this.props.app}
        // modalId={modalId}
        // directory={dir}
        // onMoveClicked={()=> {
        //     this.props.app.modals.showTextGetter("Move "+dir.name+" to...", "New parent id", this.handleDirMoveSubmit.bind(this, dir));
        // }}
        // onRenameClicked={()=>{
        //     this.props.app.modals.showTextGetter("Rename "+dir.name+" to...", "New name", this.handleDirRenameSubmit.bind(this, dir));
        // }}
        // />);
    }

    handleSavedProof(data:SavedTheoremInfo[]) {
        data.forEach((si:SavedTheoremInfo) => {
            this.statementCreated(si.theorem, si.parentId)
        });
    }

    statementCreated(stmt:MathAsmStatement, directoryId:number) {
        //1. Check if the new statement affect us in any way...
        if (this.currentDir==null || (directoryId !== this.tabId)) return;

        //2. update the dir object.
        ArrayUtils.updateOrInsert(this.currentDir.statements, stmt);

        //3. update the components
        this.cd(this.currentDir);

        //4. Fetch new symbols, if needed
        this.group.checkForNewSymbols(this.currentDir);

        //TODO fire change event?
    }

    handleDirMoveSubmit(dirToMove:MathAsmDir, data:TextGetterState) {
        if (!DomUtils.isInt(data.value)) {
            this.app.quickInfos.makeError("Please provide an integer as id to move to.");
            return;
        }
        if (this.currentDir!=null && +data.value===this.currentDir.id) return;


        this.app.graphql.run(q.MOVE_DIR, {dirIdToMove: dirToMove.id, newParentId: data.value, newName:dirToMove.name})
            .then(mutation => {
                //1. Remove the moved directory from the current one.
                ArrayUtils.removeOne(this.currentDir.subDirs, subDir => subDir.id === dirToMove.id);
                this.cd(this.currentDir);

                this.app.quickInfos.makeSuccess(dirToMove.name+" successfully moved.");
                this.app.modals.removeModal(data.modalId);
            })
            .catch(e => this.app.quickInfos.makeError("Could not move directory "+dirToMove.name));
    }

    handleDirRenameSubmit(dirToMove:MathAsmDir, data:TextGetterState) {
        if(!this.currentDir) return;

        if (!data.value) {
            this.app.quickInfos.makeError("Please provide a name.");
            return;
        }

        this.app.graphql.run(q.MOVE_DIR, {dirIdToMove: dirToMove.id, newParentId: this.currentDir.id, newName:data.value})
            .then(mutation => {
                //1. Remove the moved directory from the current one.
                const dirToRename:MathAsmDir = this.currentDir.subDirs.find(subDir => subDir.id === dirToMove.id);
                if(dirToRename) dirToRename.name = data.value;
                this.cd(this.currentDir);

                this.app.quickInfos.makeSuccess(dirToMove.name+" successfully moved.");
                this.app.modals.removeModal(data.modalId);
            })
            .catch(e => this.app.quickInfos.makeError("Could not rename directory "+dirToMove.name));
    }

    handleStatementMoveSubmit(stmtToMove:MathAsmStatement, data:TextGetterState) {
        if (!DomUtils.isInt(data.value)) {
            this.app.quickInfos.makeError("Please provide an integer as id to move to.");
            return;
        }
        if (this.currentDir==null || +data.value===this.currentDir.id) return;


        this.app.graphql.run(q.MOVE_STATEMENT, {statementIdToMove: stmtToMove.id, newParentId: data.value})
            .then(mutation => {
                //1. Remove the moved directory from the current one.
                ArrayUtils.removeOne(this.currentDir.statements, stmt => stmt.id === stmtToMove.id);
                this.cd(this.currentDir);

                this.app.quickInfos.makeSuccess(stmtToMove.name+" successfully moved.");
                this.app.modals.removeModal(data.modalId);
            })
            .catch(e => this.app.quickInfos.makeError("Could not move directory "+stmtToMove.name));
    }

    handleStatementRenameSubmit(stmtToMove:MathAsmStatement, data:TextGetterState) {
        if(!this.currentDir) return;

        if (!data.value) {
            this.app.quickInfos.makeError("Please provide a valid name.");
            return;
        }

        this.app.graphql.run(q.MOVE_STATEMENT, {statementIdToMove: stmtToMove.id, newParentId: this.currentDir.id, newName:data.value})
            .then(mutation => {
                //1. Rename the moved directory from the current one.
                const dirToRename = this.currentDir.statements.find(stmt => stmt.id === stmtToMove.id);
                if(dirToRename) dirToRename.name = data.value;
                this.cd(this.currentDir);

                this.app.quickInfos.makeSuccess(stmtToMove.name+" successfully renamed.");
                this.app.modals.removeModal(data.modalId);
            })
            .catch(e => this.app.quickInfos.makeError("Could not rename directory "+stmtToMove.name));
    }

    handleSymbolMoveSubmit(symbolToMove:MathAsmSymbol, data:TextGetterState) {
        if(!this.currentDir) return;

        if (!DomUtils.isInt(data.value)) {
            this.app.quickInfos.makeError("Please provide an integer as id to move to.");
            return;
        }
        if (+data.value===this.currentDir.id) return;


        this.app.graphql.run(q.MOVE_SYMBOL, {symbolUidToMove: symbolToMove.uid, newParentId: data.value})
            .then(mutation => {
                //1. Remove the moved directory from the current one.
                ArrayUtils.removeOne(this.currentDir.symbols, sym => sym.uid === symbolToMove.uid);
                this.cd(this.currentDir);

                this.app.quickInfos.makeSuccess(symbolToMove.text+" successfully moved.");
                this.app.modals.removeModal(data.modalId);

            })
            .catch(e => this.app.quickInfos.makeError("Could not move symbol "+symbolToMove.text));
    }

    handleSymbolRenameSubmit(symbolToMove:MathAsmSymbol, data:TextGetterState) {
        //1. Check text validity
        if (!data.value) {
            this.app.quickInfos.makeError("Please provide an a text.");
            return;
        }

        this.app.graphql.run(q.RENAME_SYMBOL, {symbolUidToMove: symbolToMove.uid, newText: data.value}).then(mutation=>{
            symbolToMove.text = data.value;

            const symbolToRename:MathAsmSymbol = this.group.symbolMap.get(symbolToMove.uid);
            if(symbolToRename) symbolToRename.text = data.value;

            this.app.quickInfos.makeSuccess(data.value+" successfully renamed.");
            this.app.modals.removeModal(data.modalId);
            this.group.symbolRenamed(symbolToRename);
        })
            .catch(e => this.app.quickInfos.makeError("Could not rename symbol "+symbolToMove.text));
    }

    handleDirCreationTextSubmit(text:string, data:TextGetterState) {
        if(!this.currentDir) return;

        if (!text) {
            this.app.quickInfos.makeWarning("Please provide a name to submit.");
            return;
        }

        this.app.graphql.run(q.CREATE_DIR, {name: text, parentId: this.currentDir.id})
            .then(resp => {
                //setup new directory object
                this.currentDir.subDirs.push(resp.fsWSector.createDir);
                //update components
                this.onChange.next(this);
                this.group.checkForNewSymbols(this.currentDir);
                //remove the modal
                this.app.modals.removeModal(data.modalId);
            })
            .catch(err => this.app.quickInfos.makeError("Could not create directory " + text));
    }

    handleCreateDirClick() {
        this.app.modals.showTextGetter(
            "New Directory",
            "Directory name...",
            (t,s) => this.handleDirCreationTextSubmit(t, s)
        );
    }

    handleStatementClick(stmt:MathAsmStatement) { this.group.handleStatementClick(stmt); }
    handleSymbolClick(clickInfo:SymbolClickInfo) { this.group.handleSymbolClick(clickInfo); }
    toggleSymbolCreationMode() { this.group.toggleSymbolCreationMode(); }
    toggleAxiomCreationMode() { this.group.toggleAxiomCreationMode(); }
    toggleTheoremCreationMode() { this.group.toggleTheoremCreationMode(); }
    //endregion
}