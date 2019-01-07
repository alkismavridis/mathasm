import React, {Component} from 'react';
import PropTypes from "prop-types";
import cx from 'classnames';
import "./DirViewer.scss";
import DomUtils from "../../../../services/DomUtils";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import GraphQL from "../../../../services/GraphQL";
import QuickInfoService from "../../../../services/QuickInfoService";
import ModalService from "../../../../services/ModalService";
import {SymbolRangeUtils} from "../../../../services/symbol/SymbolRangeUtils";
import Connection from "../../Connection/Connection";
import Statement from "../../Statement/Statement";
import StatementType from "../../../../constants/StatementType";
import SortingUtils from "../../../../services/symbol/SortingUtils";

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
        createDir(parentId:$parentId, name:$name) {
            id,name
            statements {id,name,type, left, right, isBidirectional, grade}
            subDirs {id,name}
            symbols {uid, text}
        }
    }`,

    FETCH_SYMBOLS: `query($ids:[Long!]!) {
        symbols(ids:$ids) { uid, text }
    }`,
};

export default class DirViewer extends Component {
    //region STATIC
    static propTypes = {
        //data
        /** The initial directory to load. If null, the root directory will be loaded. */
        initDirId:PropTypes.number,
        /** Determines whether the component should render anything or not. If null, render will return null. Useful for using in groups with tabs */
        isOpen:PropTypes.bool,
        /** A cache of all loaded symbols. Used to display statements. */
        symbolMap:PropTypes.object.isRequired,

        //actions
        onUpdateSymbolMap: PropTypes.func.isRequired, //accepts a map of symbols. This must be called every time new, unknown symbols have been loaded from the server.
        onCreateAxiomStart: PropTypes.func, //accepts the parent dir of the new axiom. This will popup the axiom creator.
        onCreateTheoremStart: PropTypes.func, //accepts the parent dir of the new theorem. This will popup the axiom creator.
        onCreateSymbolStart: PropTypes.func, //accepts the parent dir of the new symbol. This will popup the symbol creator.
        onDirChanged: PropTypes.func.isRequired, //accepts the new directory.
        onSymbolClicked: PropTypes.func, //accepts the clicked symbol.
        onStatementClicked: PropTypes.func, //accepts the clicked statement.


        //styling
        style: PropTypes.object,
        className: PropTypes.string,
    };

    //static defaultProps = {};
    //endregion


    //region FIELDS
    state = {
        currentDir:null
    };
    //endregion


    //region LIFE CYCLE
    // constructor(props) { super(props); }
    componentDidMount() {
        if (this.props.initDirId) this.navigateTo(this.props.initDirId);
        else this.navigateToRoot();
    }
    // static getDerivedStateFromProps(nextProps, prevState) {}
    // shouldComponentUpdate(nextProps, nextState) { return true; }
    // getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    // componentDidUpdate(prevProps, prevState, snapshot) {}
    // componentWillUnmount() {}
    // componentDidCatch(error, info) { console.error("Exception caught"); }
    //endregion



    //region UTILS
    /**
     * Scans the given directory for unknown symbols. I any are found, they will be added to this.props.symbolMap,
     * and the parent component will be notified for the change.
     * */
    checkForNewSymbols(dir) {
        //1. Detect new symbols
        const newIds = SymbolRangeUtils.getMissingIdsFromDirectory(dir, this.props.symbolMap);
        if (newIds.size === 0) return;

        //2. If unknown symbols exist, get them from the server.
        GraphQL.run(q.FETCH_SYMBOLS, {ids:Array.from(newIds)}).then(resp => {
            SymbolRangeUtils.addSymbolsToMap(this.props.symbolMap, resp.symbols);
            this.props.onUpdateSymbolMap(this.props.symbolMap);
        });
    }

    getColorForStatement(stmt) {
        switch(stmt.type) {
            case StatementType.THEOREM: return "#23d289";
            case StatementType.AXIOM: return "#2fbdc3";
            default: return "#c7bb23";
        }
    }
    //endregion



    //region API
    statementCreated(stmt, directoryId) {
        //1. Check if the new statement affect us in any way...
        if (this.state.currentDir==null || (directoryId !== this.state.currentDir.id)) return;

        //2. update the dir object.
        const updatedCurrentDir = Object.assign({}, this.state.currentDir);
        updatedCurrentDir.statements.push(stmt);

        //3. update the components
        this.setState({currentDir: updatedCurrentDir});
        this.props.onDirChanged(updatedCurrentDir);

        //4. Fetch new symbols, if needed
        this.checkForNewSymbols(updatedCurrentDir);
    }
    //endregion




    //region EVENT HANDLERS
    /** Navigates to the root directory. Data will be fetched from the server. */
    navigateToRoot() {
        GraphQL.run(q.FETCH_ROOT)
            .then(resp => {
                this.setState({currentDir: resp.rootDir});
                this.props.onDirChanged(resp.rootDir);
                this.checkForNewSymbols(resp.rootDir);
            })
            .catch(err => QuickInfoService.makeError("Could not fetch init data!"));

    }

    /** Navigates to the parent directory of the current one. Data will be fetched from the server. */
    goToParentDir() {
        if (!this.state.currentDir) return;
        GraphQL.run(q.FETCH_PARENT, {id: this.state.currentDir.id})
            .then(resp => {
                if (resp.dirParent) {
                    this.setState({currentDir: resp.dirParent});
                    this.props.onDirChanged(resp.dirParent);
                    this.checkForNewSymbols(resp.dirParent);
                }
                else QuickInfoService.makeInfo("This is the root directory.");
            })
            .catch(err => QuickInfoService.makeError("Could not fetch init data!"));
    }

    /** Navigates to directory with teh given id. Data will be fetched from the server. */
    navigateTo(id) {
        GraphQL.run(q.FETCH_DIR, {id: id})
            .then(resp => {
                if (resp.logicDir) {
                    this.setState({currentDir: resp.logicDir});
                    this.props.onDirChanged(resp.logicDir);
                    this.checkForNewSymbols(resp.logicDir);
                }
                else QuickInfoService.makeError("Could not navigate to directory with id: " + id);
            })
            .catch(err => QuickInfoService.makeError("Could not navigate to directory with id: " + id));
    }

    /** Is triggered when the go To action is being hit.. */
    handleGoToAction(modalId, idToGo) {
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
        if (this.props.onCreateSymbolStart) this.props.onCreateSymbolStart(this.state.currentDir);
    }

    handleCreateAxiomClick() {
        if (this.props.onCreateAxiomStart) this.props.onCreateAxiomStart(this.state.currentDir);
    }

    handleCreateTheoremClick() {
        if (this.props.onCreateTheoremStart) this.props.onCreateTheoremStart(this.state.currentDir);
    }

    handleSymbolClick(sym) {
        if (this.props.onSymbolClicked) this.props.onSymbolClicked(sym);
    }

    handleStatementClick(stmt) {
        if (this.props.onStatementClicked) this.props.onStatementClicked(stmt);
    }

    handleDirCreationTextSubmit(modalId, text) {
        if (!text) {
            QuickInfoService.makeWarning("Please provide a name to submit.");
            return;
        }

        GraphQL.run(q.CREATE_DIR, {name: text, parentId: this.state.currentDir.id})
            .then(resp => {
                //setup new directory object
                const updatedCurrentDir = Object.assign({}, this.state.currentDir);
                updatedCurrentDir.subDirs.push(resp.createDir);
                //update components
                this.setState({currentDir: updatedCurrentDir});
                this.props.onDirChanged(updatedCurrentDir);
                this.checkForNewSymbols(updatedCurrentDir);
                //remove the modal
                ModalService.removeModal(modalId);
            })
            .catch(err => {
                QuickInfoService.makeError("Could not create directory " + text)
            });
    }
    //endregion




    //region RENDERING
    //ITEM RENDERING
    renderSubDir(subDir) {
        return (
            <div
                key={subDir.id}
                className="DirViewer_subDir"
                title={"Id: " + subDir.id}
                onClick={this.navigateTo.bind(this, subDir.id)}>
                {subDir.name}
            </div>
        );
    }

    renderStatement(stmt) {
        return (
            <div
                key={stmt.id}
                className="DirViewer_stmtDiv"
                style={{backgroundColor:this.getColorForStatement(stmt)}}
                onClick={this.handleStatementClick.bind(this, stmt)}
                title={"Id: "+stmt.id}>
                <div className="DirViewer_stmtName">{stmt.name}</div>
                <Statement statement={stmt} symbolMap={this.props.symbolMap}/>
            </div>
        );
    }

    renderSymbol(sym) {
        return (
            <div
                key={sym.uid}
                title={"Id: " + sym.uid}
                className="DirViewer_sym"
                onClick={this.handleSymbolClick.bind(this, sym)}>
                {sym.text}
            </div>
        );
    }

    //SECTIONS RENDERING
    renderToolbar() {
        return (
            <div className="Globals_flexStart" style={{marginTop:"16px"}}>
                <button
                    className="Globals_roundBut"
                    title="Go to parent dir"
                    style={{backgroundColor: "#62676d", width: "32px", height: "32px", fontSize: "16px", margin:"0 4px"}}
                    onClick={this.goToParentDir.bind(this)}>
                    <FontAwesomeIcon icon="arrow-up"/>
                </button>
                <button
                    className="Globals_roundBut"
                    title="Go to..."
                    style={{backgroundColor: "#3e49d1", width: "32px", height: "32px", margin:"0 4px"}}
                    onClick={this.handleGoToDirClick.bind(this)}>
                    <FontAwesomeIcon icon="plane"/>
                </button>
                <button
                    className="Globals_roundBut"
                    title="New directory"
                    style={{backgroundColor: "orange", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                    onClick={this.handleCreateDirClick.bind(this)}>
                    <FontAwesomeIcon icon="folder-plus"/>
                </button>
                <button
                    className="Globals_roundBut"
                    title="New symbol"
                    style={{backgroundColor: "cornflowerblue", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                    onClick={this.handleCreateSymbolClick.bind(this)}>
                    <FontAwesomeIcon icon="atom"/>
                </button>
                <button
                    className="Globals_roundBut"
                    title="New axiom"
                    style={{backgroundColor: "red", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                    onClick={this.handleCreateAxiomClick.bind(this)}>
                    <FontAwesomeIcon icon="pencil-alt"/>
                </button>
                <button
                    className="Globals_roundBut"
                    title="New Theorem"
                    style={{backgroundColor: "orange", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                    onClick={this.handleCreateTheoremClick.bind(this)}>
                    <FontAwesomeIcon icon="cogs"/>
                </button>
                <div className="DirViewer_dirTitle" title={"Id: "+this.state.currentDir.id}>
                    {this.state.currentDir.name}
                </div>
            </div>
        );
    }

    renderStatements() {
        const statements = SortingUtils.sortStatementsById(this.state.currentDir.statements);
        if (!statements || statements.length === 0) return null;

        return (
            <div className="Globals_flexWrapDown" style={{marginTop:"8px"}}>
                {statements.map(this.renderStatement.bind(this))}
            </div>
        );
    }

    renderSubDirs() {
        const dirs = this.state.currentDir.subDirs;

        return (
            <div className="Globals_flexWrapDown" style={{marginTop:"24px"}}>
                {dirs.map(this.renderSubDir.bind(this))}
            </div>
        );
    }

    renderSymbols() {
        const symbols = SortingUtils.sortSymbolsById(this.state.currentDir.symbols);
        if (!symbols || symbols.length === 0) return null;

        return (
            <div className="DirViewer_symbolsDiv">
                {symbols.map(this.renderSymbol.bind(this))}
            </div>
        );
    }


    render() {
        if (!this.props.isOpen || !this.state.currentDir) return null;

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