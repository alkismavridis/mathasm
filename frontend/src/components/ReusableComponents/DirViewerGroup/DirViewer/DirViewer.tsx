import React, {Component, CSSProperties} from 'react';
import cx from 'classnames';
import "./DirViewer.scss";
import DomUtils from "../../../../services/DomUtils";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import GraphQL from "../../../../services/GraphQL";
import QuickInfoService from "../../../../services/QuickInfoService";
import ModalService from "../../../../services/ModalService";
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
import {AppNode} from "../../../../entities/frontend/AppNode";
import {AppEvent} from "../../../../entities/frontend/AppEvent";
import AppNodeReaction from "../../../../enums/AppNodeReaction";
import AppEventType from "../../../../enums/AppEventType";
import ArrayUtils from "../../../../services/ArrayUtils";
import SavedTheoremInfo from "../../../../entities/backend/SavedTheoremInfo";

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

export default class DirViewer extends Component  implements AppNode {
    //region FIELDS
    props : {
        //data
        parent:AppNode,
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

        //styling
        style?: CSSProperties,
        className?: string,
    };

    //static defaultProps = {};
    //endregion



    //region LIFE CYCLE
    componentDidMount() {
        if (this.props.initDirId) this.navigateTo(this.props.initDirId);
        else this.navigateToRoot();
    }
    //endregion



    //region APP NODE
    getChildMap(): any {
        return null;
    }

    getParent(): AppNode {
        return this.props.parent;
    }

    handleChildEvent(event: AppEvent): AppNodeReaction {
        return AppNodeReaction.UP;
    }

    handleParentEvent(event: AppEvent): AppNodeReaction {
        switch (event.type) {
            case AppEventType.STMT_UPDATED:
                this.statementCreated(event.data.statement, event.data.parentDirId);
                break;

            case AppEventType.PROOF_SAVED:
                event.data.forEach((si:SavedTheoremInfo) => {
                    this.statementCreated(si.theorem, si.parentId)
                });
                break;
        }

        return AppNodeReaction.NONE;
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
        GraphQL.run(q.FETCH_SYMBOLS, {ids:Array.from(newIds)}).then(resp => {
            SymbolRangeUtils.addSymbolsToMap(this.props.symbolMap, resp.symbols);
            new AppEvent(AppEventType.SYMBOL_MAP_CHANGED, this.props.symbolMap).travelAbove(this);
        });
    }

    getColorForStatement(stmt:MathAsmStatement) : string {
        switch(stmt.type) {
            case StatementType.THEOREM: return "#23d289";
            case StatementType.AXIOM: return "#2fbdc3";
            default: return "#c7bb23";
        }
    }
    //endregion



    //region EVENT HANDLERS
    statementCreated(stmt:MathAsmStatement, directoryId:number) {
        //1. Check if the new statement affect us in any way...
        if (this.props.dir==null || (directoryId !== this.props.dir.id)) return;

        //2. update the dir object.
        const updatedCurrentDir = Object.assign({}, this.props.dir);
        ArrayUtils.updateOrInsert(updatedCurrentDir.statements, stmt);

        //3. update the components
        AppEvent.makeDirTabUpdated(this.props.tabId, updatedCurrentDir).travelAbove(this);

        //4. Fetch new symbols, if needed
        this.checkForNewSymbols(updatedCurrentDir);
    }


    /** Navigates to the root directory. Data will be fetched from the server. */
    navigateToRoot() {
        GraphQL.run(q.FETCH_ROOT)
            .then(resp => {
                AppEvent.makeDirTabUpdated(this.props.tabId, resp.rootDir).travelAbove(this);
                this.checkForNewSymbols(resp.rootDir);
            })
            .catch(err => QuickInfoService.makeError("Could not fetch init data!"));
    }

    /** Navigates to the parent directory of the current one. Data will be fetched from the server. */
    goToParentDir() {
        if (!this.props.dir) return;
        GraphQL.run(q.FETCH_PARENT, {id: this.props.dir.id})
            .then(resp => {
                if (resp.dirParent) {
                    AppEvent.makeDirTabUpdated(this.props.tabId, resp.dirParent).travelAbove(this);
                    this.checkForNewSymbols(resp.dirParent);
                }
                else QuickInfoService.makeInfo("This is the root directory.");
            })
            .catch(err => QuickInfoService.makeError("Could not fetch init data!"));
    }

    /** Navigates to directory with teh given id. Data will be fetched from the server. */
    navigateTo(id:number) {
        GraphQL.run(q.FETCH_DIR, {id: id})
            .then(resp => {
                if (resp.logicDir) {
                    AppEvent.makeDirTabUpdated(this.props.tabId, resp.logicDir).travelAbove(this);
                    this.checkForNewSymbols(resp.logicDir);
                }
                else QuickInfoService.makeError("Could not navigate to directory with id: " + id);
            })
            .catch(err => QuickInfoService.makeError("Could not navigate to directory with id: " + id));
    }

    /** Is triggered when the go To action is being hit.. */
    handleGoToAction(modalId:number, idToGo:string) {
        if (!DomUtils.isInt(idToGo)) {
            QuickInfoService.makeError("Please provide an integer as id to navigate to.");
            return;
        }

        ModalService.removeModal(modalId);
        this.navigateTo(parseInt(idToGo));
    }

    handleCreateDirClick() {
        ModalService.showTextGetter("New Directory", "Directory name...", this.handleDirCreationTextSubmit.bind(this));
    }

    handleGoToDirClick() {
        ModalService.showTextGetter("Go to...", "Directory id", this.handleGoToAction.bind(this));
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
        AppEvent.makeSymbolSelect(sym, null, null).travelAbove(this);
    }

    handleStatementClick(stmt:MathAsmStatement) {
        new AppEvent(AppEventType.STMT_SELECTED, stmt).travelAbove(this);
    }

    handleDirMoveSubmit(dirToMove:MathAsmDir, modalId:number, idToGo:string) {
        if (!DomUtils.isInt(idToGo)) {
            QuickInfoService.makeError("Please provide an integer as id to move to.");
            return;
        }
        if (+idToGo===this.props.dir.id) return;


        GraphQL.run(q.MOVE_DIR, {dirIdToMove: dirToMove.id, newParentId: idToGo, newName:dirToMove.name})
            .then(mutation => {
                //1. Remove the moved directory from the current one.
                const updatedCurrentDir = Object.assign({}, this.props.dir);
                const indexToRemove = updatedCurrentDir.subDirs.findIndex(subDir => subDir.id === dirToMove.id);
                if(indexToRemove>=0) updatedCurrentDir.subDirs.splice(indexToRemove, 1);
                AppEvent.makeDirTabUpdated(this.props.tabId, updatedCurrentDir).travelAbove(this);

                QuickInfoService.makeSuccess(dirToMove.name+" successfully moved.");
                ModalService.removeModal(modalId);
            })
            .catch(e => QuickInfoService.makeError("Could not move directory "+dirToMove.name));
    }

    handleDirRenameSubmit(dirToMove:MathAsmDir, modalId:number, newName:string) {
        if (!newName) {
            QuickInfoService.makeError("Please provide a name.");
            return;
        }
        if (newName==this.props.dir.name) return;

        GraphQL.run(q.MOVE_DIR, {dirIdToMove: dirToMove.id, newParentId: this.props.dir.id, newName:newName})
            .then(mutation => {
                //1. Remove the moved directory from the current one.
                const updatedCurrentDir = Object.assign({}, this.props.dir);
                const dirToRename:MathAsmDir = updatedCurrentDir.subDirs.find(subDir => subDir.id === dirToMove.id);
                if(dirToRename) dirToRename.name = newName;
                AppEvent.makeDirTabUpdated(this.props.tabId, updatedCurrentDir).travelAbove(this);

                QuickInfoService.makeSuccess(dirToMove.name+" successfully moved.");
                ModalService.removeModal(modalId);
            })
            .catch(e => QuickInfoService.makeError("Could not rename directory "+dirToMove.name));
    }

    handleStatementMoveSubmit(stmtToMove:MathAsmStatement, modalId:number, idToGo:string) {
        if (!DomUtils.isInt(idToGo)) {
            QuickInfoService.makeError("Please provide an integer as id to move to.");
            return;
        }
        if (+idToGo===this.props.dir.id) return;


        GraphQL.run(q.MOVE_STATEMENT, {statementIdToMove: stmtToMove.id, newParentId: idToGo})
            .then(mutation => {
                //1. Remove the moved directory from the current one.
                const updatedCurrentDir = Object.assign({}, this.props.dir);
                const indexToRemove = updatedCurrentDir.statements.findIndex(stmt => stmt.id === stmtToMove.id);
                if(indexToRemove>=0) updatedCurrentDir.statements.splice(indexToRemove, 1);
                AppEvent.makeDirTabUpdated(this.props.tabId, updatedCurrentDir).travelAbove(this);

                QuickInfoService.makeSuccess(stmtToMove.name+" successfully moved.");
                ModalService.removeModal(modalId);

            })
            .catch(e => QuickInfoService.makeError("Could not move directory "+stmtToMove.name));
    }

    handleStatementRenameSubmit(stmtToMove:MathAsmStatement, modalId:number, newName:string) {
        if (!newName) {
            QuickInfoService.makeError("Please provide a valid name.");
            return;
        }

        GraphQL.run(q.MOVE_STATEMENT, {statementIdToMove: stmtToMove.id, newParentId: this.props.dir.id, newName:newName})
            .then(mutation => {
                //1. Remove the moved directory from the current one.
                const updatedCurrentDir = Object.assign({}, this.props.dir);
                const dirToRename = updatedCurrentDir.statements.find(stmt => stmt.id === stmtToMove.id);
                if(dirToRename) dirToRename.name = newName;
                AppEvent.makeDirTabUpdated(this.props.tabId, updatedCurrentDir).travelAbove(this);

                QuickInfoService.makeSuccess(stmtToMove.name+" successfully renamed.");
                ModalService.removeModal(modalId);
            })
            .catch(e => QuickInfoService.makeError("Could not rename directory "+stmtToMove.name));

    }

    handleSymbolMoveSubmit(symbolToMove:MathAsmSymbol, modalId:number, idToGo:string) {
        if (!DomUtils.isInt(idToGo)) {
            QuickInfoService.makeError("Please provide an integer as id to move to.");
            return;
        }
        if (+idToGo===this.props.dir.id) return;


        GraphQL.run(q.MOVE_SYMBOL, {symbolUidToMove: symbolToMove.uid, newParentId: idToGo})
            .then(mutation => {
                //1. Remove the moved directory from the current one.
                const updatedCurrentDir = Object.assign({}, this.props.dir);
                const indexToRemove = updatedCurrentDir.symbols.findIndex(sym => sym.uid === symbolToMove.uid);
                if(indexToRemove>=0) updatedCurrentDir.symbols.splice(indexToRemove, 1);
                AppEvent.makeDirTabUpdated(this.props.tabId, updatedCurrentDir).travelAbove(this);

                QuickInfoService.makeSuccess(symbolToMove.text+" successfully moved.");
                ModalService.removeModal(modalId);

            })
            .catch(e => QuickInfoService.makeError("Could not move symbol "+symbolToMove.text));
    }

    handleSymbolRenameSubmit(symbolToMove:MathAsmSymbol, modalId:number, newText:string) {
        //1. Check text validity
        if (!newText) {
            QuickInfoService.makeError("Please provide an a text.");
            return;
        }

        GraphQL.run(q.RENAME_SYMBOL, {symbolUidToMove: symbolToMove.uid, newText: newText}).then(mutation=>{
            symbolToMove.text = newText;

            const symbolToRename:MathAsmSymbol = this.props.symbolMap[symbolToMove.uid];
            if(symbolToRename) symbolToRename.text = newText;

            QuickInfoService.makeSuccess(newText+" successfully renamed.");
            ModalService.removeModal(modalId);

            AppEvent.makeSymbolRenamed(symbolToRename).travelAbove(this);
            this.forceUpdate();
        })
        .catch(e => QuickInfoService.makeError("Could not rename symbol "+symbolToMove.text));
    }

    handleDirCreationTextSubmit(modalId:number, text:string) {
        if (!text) {
            QuickInfoService.makeWarning("Please provide a name to submit.");
            return;
        }

        GraphQL.run(q.CREATE_DIR, {name: text, parentId: this.props.dir.id})
            .then(resp => {
                //setup new directory object
                const updatedCurrentDir = Object.assign({}, this.props.dir);
                updatedCurrentDir.subDirs.push(resp.fsWSector.createDir);
                //update components
                AppEvent.makeDirTabUpdated(this.props.tabId, updatedCurrentDir).travelAbove(this);
                this.checkForNewSymbols(updatedCurrentDir);
                //remove the modal
                ModalService.removeModal(modalId);
            })
            .catch(err => {
                QuickInfoService.makeError("Could not create directory " + text)
            });
    }

    showDirMenu(dir:MathAsmDir, event:any) {
        event.stopPropagation();
        event.preventDefault();

        const modalId = ModalService.getNextId();
        ModalService.addModal(modalId, <DirectoryMenu
            modalId={modalId}
            directory={dir}
            onMoveClicked={()=> {
                ModalService.showTextGetter("Move "+dir.name+" to...", "New parent id", this.handleDirMoveSubmit.bind(this, dir));
            }}
            onRenameClicked={()=>{
                ModalService.showTextGetter("Rename "+dir.name+" to...", "New name", this.handleDirRenameSubmit.bind(this, dir));
            }}
        />);
    }

    showStmtMenu(stmt:MathAsmStatement, event:any) {
        event.stopPropagation();
        event.preventDefault();

        const modalId = ModalService.getNextId();
        ModalService.addModal(modalId, <StatementMenu
            modalId={modalId}
            statement={stmt}
            onMoveClicked={()=> {
                ModalService.showTextGetter("Move "+stmt.name+" to...", "New parent id", this.handleStatementMoveSubmit.bind(this, stmt));
            }}
            onRenameClicked={()=>{
                ModalService.showTextGetter("Rename "+stmt.name+" to...", "New name", this.handleStatementRenameSubmit.bind(this, stmt));
            }}
            onViewProof={stmt=>AppEvent.makeProofShow(stmt).travelAbove(this)}
        />);
    }

    showSymbolMenu(sym:MathAsmSymbol, event:any) {
        event.stopPropagation();
        event.preventDefault();

        const modalId = ModalService.getNextId();
        ModalService.addModal(modalId, <SymbolMenu
            modalId={modalId}
            symbol={sym}
            onMoveClicked={()=> {
                ModalService.showTextGetter("Move "+sym.text+" to...", "New parent id", this.handleSymbolMoveSubmit.bind(this, sym));
            }}
            onRenameClicked={()=>{
                ModalService.showTextGetter("Rename "+sym.text+" to...", "New text", this.handleSymbolRenameSubmit.bind(this, sym));
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
                className="DirViewer_stmtDiv"
                style={{backgroundColor:this.getColorForStatement(stmt)}}
                onClick={this.handleStatementClick.bind(this, stmt)}
                title={"Id: "+stmt.id}>
                <div className="DirViewer_stmtName">{stmt.name}</div>
                <Statement
                    statement={stmt}
                    symbolMap={this.props.symbolMap}
                    onSymbolClick={(sym, side) => {
                        AppEvent.makeSymbolSelect(sym, stmt, side).travelAbove(this);
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
                    style={{backgroundColor: "#3e49d1", width: "32px", height: "32px", margin:"0 20px 0 4px"}}
                    onClick={this.handleGoToDirClick.bind(this)}>
                    <FontAwesomeIcon icon="plane"/>
                </button>
                <button
                    className="MA_roundBut"
                    title="New directory"
                    style={{backgroundColor: "orange", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                    onClick={this.handleCreateDirClick.bind(this)}>
                    <FontAwesomeIcon icon="folder-plus"/>
                </button>
                <button
                    className="MA_roundBut"
                    title="New symbol"
                    style={{backgroundColor: "cornflowerblue", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                    onClick={this.handleCreateSymbolClick.bind(this)}>
                    <FontAwesomeIcon icon="dollar-sign"/>
                </button>
                <button
                    className="MA_roundBut"
                    title="New axiom"
                    style={{backgroundColor: "red", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                    onClick={this.handleCreateAxiomClick.bind(this)}>
                    <FontAwesomeIcon icon="font" className="MA_16px"/>
                </button>
                <button
                    className="MA_roundBut"
                    title="New Theorem"
                    style={{backgroundColor: "#24a033", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                    onClick={this.handleCreateTheoremClick.bind(this)}>
                    <FontAwesomeIcon icon="cubes"/>
                </button>
            </div>
        );
    }

    renderStatements() {
        const statements = SortingUtils.sortStatementsById(this.props.dir.statements);
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