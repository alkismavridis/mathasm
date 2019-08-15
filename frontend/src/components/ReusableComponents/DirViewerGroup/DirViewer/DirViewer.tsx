import React, {Component, CSSProperties} from 'react';
import cx from 'classnames';
import "./DirViewer.scss";
import DomUtils from "../../../../services/DomUtils";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import {SymbolRangeUtils} from "../../../../services/symbol/SymbolRangeUtils";
import Statement from "../../Statement/Statement";
import StatementType from "../../../../enums/StatementType";
import SortingUtils from "../../../../services/symbol/SortingUtils";
import DirectoryMenu from "../../../Modals/DirectoryMenu/DirectoryMenu";
import StatementMenu from "../../../Modals/StatementMenu/StatementMenu";
import SymbolMenu from "../../../Modals/SymbolMenu/SymbolMenu";
import MathAsmDir from "../../../../entities/backend/MathAsmDir";
import MathAsmStatement from "../../../../entities/backend/MathAsmStatement";
import MathAsmSymbol from "../../../../entities/backend/MathAsmSymbol";
import ArrayUtils from "../../../../services/ArrayUtils";
import SavedTheoremInfo from "../../../../entities/backend/SavedTheoremInfo";
import App from "../../../../services/App";
import TheoryExplorerController from "../../../TheoryExplorer/TheoryExplorerController";
import {Subscription} from "rxjs/index";

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

    FETCH_SYMBOLS: `query($ids:[Long!]!) {
        symbols(ids:$ids) { uid, text }
    }`,
};

export default class DirViewer extends Component {
    //region FIELDS
    props : {
        //data
        app:App,
        controller:TheoryExplorerController,

        /** The initial directory to load. If null, the root directory will be loaded. */
        initDirId?:number,
        /** Determines whether the component should render anything or not. If null, render will return null. Useful for using in groups with tabs */
        isOpen?:boolean,
        /** A cache of all loaded symbols. Used to display statements. */
        symbolMap:any,
        tabId:number,
        dir:MathAsmDir,

        //actions
        onCreateAxiomStart?: Function, //accepts the parent dir of the new axiom. This will popup the axiom creator.
        onCreateTheoremStart?: Function, //accepts the parent dir of the new theorem. This will popup the axiom creator.
        onCreateSymbolStart?: Function, //accepts the parent dir of the new symbol. This will popup the symbol creator.
        onAddTab:Function,
        onTabUpdated:Function,

        //styling
        style?: CSSProperties,
        className?: string,
    };

    private subscriptions:Subscription[] = [];
    //endregion



    //region LIFE CYCLE
    componentDidMount() {
        if(this.props.dir) {/*do nothing*/}
        else if (this.props.initDirId) this.navigateTo(this.props.initDirId);
        else this.navigateToRoot();

        this.subscriptions.push(
            this.props.controller.onProofSaved.subscribe(data => this.handleSavedProof(data))
        );

        this.subscriptions.push(
            this.props.controller.onAxiomSaved.subscribe(data => this.statementCreated(data.statement, data.parentDirId))
        );
    }

    componentWillUnmount() {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions = [];
    }
    //endregion



    //region UTILS
    /**
     * Scans the given directory for unknown symbols. I any are found, they will be added to this.props.symbolMap,
     * and the parent component will be notified for the change.
     * */
    checkForNewSymbols(dir:MathAsmDir) {
        //1. Detect new symbols
        const newIds = SymbolRangeUtils.getMissingIdsFromDirectory(dir, this.props.symbolMap);
        if (newIds.size === 0) return;

        //2. If unknown symbols exist, get them from the server.
        this.props.app.graphql.run(q.FETCH_SYMBOLS, {ids:Array.from(newIds)}).then(resp => {
            SymbolRangeUtils.addSymbolsToMap(this.props.symbolMap, resp.symbols);
            this.props.controller.onSymbolMapUpdated.next(this.props.symbolMap);
        });
    }

    getCssClassForStatement(stmt:MathAsmStatement) : string {
        switch(stmt.type) {
            case StatementType.THEOREM: return "DirViewer_th";
            case StatementType.AXIOM: return "DirViewer_ax";
            default: return "";
        }
    }
    //endregion



    //region EVENT HANDLERS
    handleSavedProof(data:SavedTheoremInfo[]) {
        data.forEach((si:SavedTheoremInfo) => {
            this.statementCreated(si.theorem, si.parentId)
        });
    }

    statementCreated(stmt:MathAsmStatement, directoryId:number) {
        //1. Check if the new statement affect us in any way...
        if (this.props.dir==null || (directoryId !== this.props.dir.id)) return;

        //2. update the dir object.
        const updatedCurrentDir = Object.assign({}, this.props.dir);
        ArrayUtils.updateOrInsert(updatedCurrentDir.statements, stmt);

        //3. update the components
        this.props.onTabUpdated(this.props.tabId, updatedCurrentDir);

        //4. Fetch new symbols, if needed
        this.checkForNewSymbols(updatedCurrentDir);
    }


    /** Navigates to the root directory. Data will be fetched from the server. */
    navigateToRoot() {
        this.props.app.graphql.run(q.FETCH_ROOT)
            .then(resp => {
                this.props.onTabUpdated(this.props.tabId, resp.rootDir);
                this.checkForNewSymbols(resp.rootDir);
            })
            .catch(err => this.props.app.quickInfoService.makeError("Could not fetch init data!"));
    }

    /** Navigates to the parent directory of the current one. Data will be fetched from the server. */
    goToParentDir(event) {
        const isCtrlDown = event && event.ctrlKey;

        if (!this.props.dir) return;
        this.props.app.graphql.run(q.FETCH_PARENT, {id: this.props.dir.id})
            .then(resp => {
                if (resp.dirParent) {
                    if (isCtrlDown) this.props.onAddTab(resp.dirParent.id, resp.dirParent, false);
                    else this.props.onTabUpdated(this.props.tabId, resp.dirParent);
                    this.checkForNewSymbols(resp.dirParent);
                }
                else this.props.app.quickInfoService.makeInfo("This is the root directory.");
            })
            .catch(err => this.props.app.quickInfoService.makeError("Could not fetch init data!"));
    }

    /** Navigates to directory with teh given id. Data will be fetched from the server. */
    navigateTo(id:number, event?) {
        const isCtrlDown = event && event.ctrlKey;
        if(isCtrlDown) {
            this.props.onAddTab(id, null, false);
            return;
        }

        this.props.app.graphql.run(q.FETCH_DIR, {id: id})
            .then(resp => {
                if (resp.logicDir) {
                    this.props.onTabUpdated(this.props.tabId, resp.logicDir);
                    this.checkForNewSymbols(resp.logicDir);
                }
                else this.props.app.quickInfoService.makeError("Could not navigate to directory with id: " + id);
            })
            .catch(err => this.props.app.quickInfoService.makeError("Could not navigate to directory with id: " + id));
    }

    /** Is triggered when the go To action is being hit.. */
    handleGoToAction(modalId:number, idToGo:string) {
        if (!DomUtils.isInt(idToGo)) {
            this.props.app.quickInfoService.makeError("Please provide an integer as id to navigate to.");
            return;
        }

        this.props.app.modalService.removeModal(modalId);
        this.navigateTo(parseInt(idToGo));
    }

    handleCreateDirClick() {
        this.props.app.modalService.showTextGetter("New Directory", "Directory name...", this.handleDirCreationTextSubmit.bind(this));
    }

    handleGoToDirClick() {
        this.props.app.modalService.showTextGetter("Go to...", "Directory id", this.handleGoToAction.bind(this));
    }

    handleCreateSymbolClick() {
        if (this.props.onCreateSymbolStart) this.props.onCreateSymbolStart(this.props.dir);
    }

    handleCreateAxiomClick() {
        if (this.props.onCreateAxiomStart) this.props.onCreateAxiomStart(this.props.dir);
    }

    handleCreateTheoremClick() {
        if (this.props.onCreateTheoremStart) this.props.onCreateTheoremStart(this.props.dir);
    }

    handleSymbolClick(sym:MathAsmSymbol) {
        this.props.controller.onSymbolClicked.next({symbol:sym});
    }

    handleStatementClick(stmt:MathAsmStatement) {
        this.props.controller.onStmtClicked.next(stmt);
    }

    handleDirMoveSubmit(dirToMove:MathAsmDir, modalId:number, idToGo:string) {
        if (!DomUtils.isInt(idToGo)) {
            this.props.app.quickInfoService.makeError("Please provide an integer as id to move to.");
            return;
        }
        if (+idToGo===this.props.dir.id) return;


        this.props.app.graphql.run(q.MOVE_DIR, {dirIdToMove: dirToMove.id, newParentId: idToGo, newName:dirToMove.name})
            .then(mutation => {
                //1. Remove the moved directory from the current one.
                const updatedCurrentDir = Object.assign({}, this.props.dir);
                const indexToRemove = updatedCurrentDir.subDirs.findIndex(subDir => subDir.id === dirToMove.id);
                if(indexToRemove>=0) updatedCurrentDir.subDirs.splice(indexToRemove, 1);
                this.props.onTabUpdated(this.props.tabId, updatedCurrentDir);

                this.props.app.quickInfoService.makeSuccess(dirToMove.name+" successfully moved.");
                this.props.app.modalService.removeModal(modalId);
            })
            .catch(e => this.props.app.quickInfoService.makeError("Could not move directory "+dirToMove.name));
    }

    handleDirRenameSubmit(dirToMove:MathAsmDir, modalId:number, newName:string) {
        if (!newName) {
            this.props.app.quickInfoService.makeError("Please provide a name.");
            return;
        }
        if (newName==this.props.dir.name) return;

        this.props.app.graphql.run(q.MOVE_DIR, {dirIdToMove: dirToMove.id, newParentId: this.props.dir.id, newName:newName})
            .then(mutation => {
                //1. Remove the moved directory from the current one.
                const updatedCurrentDir = Object.assign({}, this.props.dir);
                const dirToRename:MathAsmDir = updatedCurrentDir.subDirs.find(subDir => subDir.id === dirToMove.id);
                if(dirToRename) dirToRename.name = newName;
                this.props.onTabUpdated(this.props.tabId, updatedCurrentDir);

                this.props.app.quickInfoService.makeSuccess(dirToMove.name+" successfully moved.");
                this.props.app.modalService.removeModal(modalId);
            })
            .catch(e => this.props.app.quickInfoService.makeError("Could not rename directory "+dirToMove.name));
    }

    handleStatementMoveSubmit(stmtToMove:MathAsmStatement, modalId:number, idToGo:string) {
        if (!DomUtils.isInt(idToGo)) {
            this.props.app.quickInfoService.makeError("Please provide an integer as id to move to.");
            return;
        }
        if (+idToGo===this.props.dir.id) return;


        this.props.app.graphql.run(q.MOVE_STATEMENT, {statementIdToMove: stmtToMove.id, newParentId: idToGo})
            .then(mutation => {
                //1. Remove the moved directory from the current one.
                const updatedCurrentDir = Object.assign({}, this.props.dir);
                const indexToRemove = updatedCurrentDir.statements.findIndex(stmt => stmt.id === stmtToMove.id);
                if(indexToRemove>=0) updatedCurrentDir.statements.splice(indexToRemove, 1);
                this.props.onTabUpdated(this.props.tabId, updatedCurrentDir);

                this.props.app.quickInfoService.makeSuccess(stmtToMove.name+" successfully moved.");
                this.props.app.modalService.removeModal(modalId);
            })
            .catch(e => this.props.app.quickInfoService.makeError("Could not move directory "+stmtToMove.name));
    }

    handleStatementRenameSubmit(stmtToMove:MathAsmStatement, modalId:number, newName:string) {
        if (!newName) {
            this.props.app.quickInfoService.makeError("Please provide a valid name.");
            return;
        }

        this.props.app.graphql.run(q.MOVE_STATEMENT, {statementIdToMove: stmtToMove.id, newParentId: this.props.dir.id, newName:newName})
            .then(mutation => {
                //1. Remove the moved directory from the current one.
                const updatedCurrentDir = Object.assign({}, this.props.dir);
                const dirToRename = updatedCurrentDir.statements.find(stmt => stmt.id === stmtToMove.id);
                if(dirToRename) dirToRename.name = newName;
                this.props.onTabUpdated(this.props.tabId, updatedCurrentDir);

                this.props.app.quickInfoService.makeSuccess(stmtToMove.name+" successfully renamed.");
                this.props.app.modalService.removeModal(modalId);
            })
            .catch(e => this.props.app.quickInfoService.makeError("Could not rename directory "+stmtToMove.name));

    }

    handleSymbolMoveSubmit(symbolToMove:MathAsmSymbol, modalId:number, idToGo:string) {
        if (!DomUtils.isInt(idToGo)) {
            this.props.app.quickInfoService.makeError("Please provide an integer as id to move to.");
            return;
        }
        if (+idToGo===this.props.dir.id) return;


        this.props.app.graphql.run(q.MOVE_SYMBOL, {symbolUidToMove: symbolToMove.uid, newParentId: idToGo})
            .then(mutation => {
                //1. Remove the moved directory from the current one.
                const updatedCurrentDir = Object.assign({}, this.props.dir);
                const indexToRemove = updatedCurrentDir.symbols.findIndex(sym => sym.uid === symbolToMove.uid);
                if(indexToRemove>=0) updatedCurrentDir.symbols.splice(indexToRemove, 1);
                this.props.onTabUpdated(this.props.tabId, updatedCurrentDir);

                this.props.app.quickInfoService.makeSuccess(symbolToMove.text+" successfully moved.");
                this.props.app.modalService.removeModal(modalId);

            })
            .catch(e => this.props.app.quickInfoService.makeError("Could not move symbol "+symbolToMove.text));
    }

    handleSymbolRenameSubmit(symbolToMove:MathAsmSymbol, modalId:number, newText:string) {
        //1. Check text validity
        if (!newText) {
            this.props.app.quickInfoService.makeError("Please provide an a text.");
            return;
        }

        this.props.app.graphql.run(q.RENAME_SYMBOL, {symbolUidToMove: symbolToMove.uid, newText: newText}).then(mutation=>{
            symbolToMove.text = newText;

            const symbolToRename:MathAsmSymbol = this.props.symbolMap[symbolToMove.uid];
            if(symbolToRename) symbolToRename.text = newText;

            this.props.app.quickInfoService.makeSuccess(newText+" successfully renamed.");
            this.props.app.modalService.removeModal(modalId);
            this.props.controller.onSymbolRenamed.next(symbolToRename);
        })
        .catch(e => this.props.app.quickInfoService.makeError("Could not rename symbol "+symbolToMove.text));
    }

    handleDirCreationTextSubmit(modalId:number, text:string) {
        if (!text) {
            this.props.app.quickInfoService.makeWarning("Please provide a name to submit.");
            return;
        }

        this.props.app.graphql.run(q.CREATE_DIR, {name: text, parentId: this.props.dir.id})
            .then(resp => {
                //setup new directory object
                const updatedCurrentDir = Object.assign({}, this.props.dir);
                updatedCurrentDir.subDirs.push(resp.fsWSector.createDir);
                //update components
                this.props.onTabUpdated(this.props.tabId, updatedCurrentDir);
                this.checkForNewSymbols(updatedCurrentDir);
                //remove the modal
                this.props.app.modalService.removeModal(modalId);
            })
            .catch(err => {
                this.props.app.quickInfoService.makeError("Could not create directory " + text)
            });
    }

    showDirMenu(dir:MathAsmDir, event:any) {
        event.stopPropagation();
        event.preventDefault();

        const modalId = this.props.app.modalService.getNextId();
        this.props.app.modalService.addModal(modalId, <DirectoryMenu
            app={this.props.app}
            modalId={modalId}
            directory={dir}
            onMoveClicked={()=> {
                this.props.app.modalService.showTextGetter("Move "+dir.name+" to...", "New parent id", this.handleDirMoveSubmit.bind(this, dir));
            }}
            onRenameClicked={()=>{
                this.props.app.modalService.showTextGetter("Rename "+dir.name+" to...", "New name", this.handleDirRenameSubmit.bind(this, dir));
            }}
        />);
    }

    showStmtMenu(stmt:MathAsmStatement, event:any) {
        event.stopPropagation();
        event.preventDefault();

        const modalId = this.props.app.modalService.getNextId();
        this.props.app.modalService.addModal(modalId, <StatementMenu
            app={this.props.app}
            modalId={modalId}
            statement={stmt}
            onMoveClicked={()=> {
                this.props.app.modalService.showTextGetter("Move "+stmt.name+" to...", "New parent id", this.handleStatementMoveSubmit.bind(this, stmt));
            }}
            onRenameClicked={()=>{
                this.props.app.modalService.showTextGetter("Rename "+stmt.name+" to...", "New name", this.handleStatementRenameSubmit.bind(this, stmt));
            }}
            onViewProof={stmt=>this.props.controller.onShowProof.next(stmt)}
        />);
    }

    showSymbolMenu(sym:MathAsmSymbol, event:any) {
        event.stopPropagation();
        event.preventDefault();

        const modalId = this.props.app.modalService.getNextId();
        this.props.app.modalService.addModal(modalId, <SymbolMenu
            app={this.props.app}
            modalId={modalId}
            symbol={sym}
            onMoveClicked={()=> {
                this.props.app.modalService.showTextGetter("Move "+sym.text+" to...", "New parent id", this.handleSymbolMoveSubmit.bind(this, sym));
            }}
            onRenameClicked={()=>{
                this.props.app.modalService.showTextGetter("Rename "+sym.text+" to...", "New text", this.handleSymbolRenameSubmit.bind(this, sym));
            }}
        />);
    }
    //endregion




    //region RENDERING
    //item rendering
    renderSubDir(subDir:MathAsmDir) {
        return (
            <div
                key={subDir.id}
                className="DirViewer_subDir"
                title={"Id: " + subDir.id}
                onClick={this.navigateTo.bind(this, subDir.id)}>
                {subDir.name}
                <div className="DirViewer_menuBut" onClick={(event)=>this.showDirMenu(subDir, event)}>
                    <FontAwesomeIcon icon="bars" className="MA_12px"/>
                </div>
            </div>
        );
    }

    renderStatement(stmt:MathAsmStatement) {
        return (
            <div
                key={stmt.id}
                className={`DirViewer_stmtDiv ${this.getCssClassForStatement(stmt)}`}
                onClick={this.handleStatementClick.bind(this, stmt)}
                title={"Id: "+stmt.id}>
                <div className="DirViewer_stmtName">{stmt.name}</div>
                <Statement
                    statement={stmt}
                    symbolMap={this.props.symbolMap}
                    onSymbolClick={(sym, side) => {
                        this.props.controller.onSymbolClicked.next({symbol:sym, statement:stmt, side:side});
                    }}/>
                <div className="DirViewer_menuBut" onClick={(event)=>this.showStmtMenu(stmt, event)}>
                    <FontAwesomeIcon icon="bars" className="MA_12px"/>
                </div>
            </div>
        );
    }

    renderSymbol(sym:MathAsmSymbol) {
        return (
            <div
                key={sym.uid}
                title={"Id: " + sym.uid}
                className="DirViewer_sym"
                onClick={this.handleSymbolClick.bind(this, sym)}>
                {sym.text}
                <div className="DirViewer_menuBut" onClick={(event)=>this.showSymbolMenu(sym, event)}>
                    <FontAwesomeIcon icon="bars" className="MA_12px"/>
                </div>
            </div>
        );
    }

    //REGION RENDERING
    renderToolbar() {
        return (
            <div className="MA_flexStart" style={{marginTop:"16px"}}>
                <button
                    className="MA_roundBut"
                    title="Go to parent dir"
                    style={{backgroundColor: "#62676d", width: "32px", height: "32px", fontSize: "16px", margin:"0 4px"}}
                    onClick={this.goToParentDir.bind(this)}>
                    <FontAwesomeIcon icon="arrow-up"/>
                </button>
                <button
                    className="MA_roundBut"
                    title="Go to..."
                    style={{backgroundColor: "#3e49d1", width: "32px", height: "32px", margin:"0 4px"}}
                    onClick={this.handleGoToDirClick.bind(this)}>
                    <FontAwesomeIcon icon="plane"/>
                </button>
                <button
                    className="MA_roundBut"
                    title="Create directory"
                    style={{backgroundColor: "orange", width: "32px", height: "32px", fontSize: "18px", margin:"0 20px 0 4px"}}
                    onClick={this.handleCreateDirClick.bind(this)}>
                    <FontAwesomeIcon icon="folder-plus"/>
                </button>
                <button
                    className="MA_roundBut"
                    title="Create symbol"
                    style={{backgroundColor: "cornflowerblue", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                    onClick={this.handleCreateSymbolClick.bind(this)}>
                    <FontAwesomeIcon icon="dollar-sign"/>
                </button>
                <button
                    className="MA_roundBut"
                    title="Create axiom"
                    style={{backgroundColor: "red", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                    onClick={this.handleCreateAxiomClick.bind(this)}>
                    <FontAwesomeIcon icon="font" className="MA_16px"/>
                </button>
                <button
                    className="MA_roundBut"
                    title="Create theorem"
                    style={{backgroundColor: "#24a033", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                    onClick={this.handleCreateTheoremClick.bind(this)}>
                    <FontAwesomeIcon icon="cubes"/>
                </button>
            </div>
        );
    }

    renderStatements() {
        const statements = this.props.dir.statements;
        if (!statements || statements.length === 0) return null;

        return (
            <div className="MA_flexWrapDown" style={{margin:"8px 0 0 12px"}}>
                {statements.map(this.renderStatement.bind(this))}
            </div>
        );
    }

    renderSubDirs() {
        const dirs = this.props.dir.subDirs;

        return (
            <div className="MA_flexWrapDown" style={{margin:"24px 0 0 12px"}}>
                {dirs.map(this.renderSubDir.bind(this))}
            </div>
        );
    }

    renderSymbols() {
        const symbols = SortingUtils.sortSymbolsById(this.props.dir.symbols);
        if (!symbols || symbols.length === 0) return null;

        return (
            <div className="DirViewer_symbolsDiv">
                {symbols.map(this.renderSymbol.bind(this))}
            </div>
        );
    }


    render() {
        if (!this.props.isOpen || !this.props.dir) return null;

        return (
            <div className={cx("DirViewer_root", this.props.className)} style={this.props.style}>
                {this.renderToolbar()}
                {this.renderSubDirs()}
                {this.renderStatements()}
                {this.renderSymbols()}
            </div>
        );
    }
    //endregion
}