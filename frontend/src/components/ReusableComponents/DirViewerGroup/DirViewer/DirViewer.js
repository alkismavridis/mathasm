import React, {Component} from 'react';
import PropTypes from "prop-types";
import cx from 'classnames';
import "./DirViewer.scss";
import DomUtils from "../../../../services/DomUtils";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import GraphQL from "../../../../services/GraphQL";
import QuickInfoService from "../../../../services/QuickInfoService";
import ModalService from "../../../../services/ModalService";

const q = {
    FETCH_PARENT: `query($id:Long!){
        dirParent(id:$id) {
            id,name
            statements {id,name,type}
            subDirs {id,name}
            symbols {uid, text}
        }
    }`,

    FETCH_DIR: `query($id:Long!){
        logicDir(id:$id) {
            id,name
            statements {id,name,type}
            subDirs {id,name}
            symbols {uid, text}
        }
    }`,

    FETCH_ROOT: `{
        rootDir(depth:1) {
            id,name
            statements {id,name,type}
            subDirs {id,name}
            symbols {uid, text}
        }
    }`,

    CREATE_DIR: `mutation($parentId:Long!, $name:String!) {
        createDir(parentId:$parentId, name:$name) {
            id,name
            statements {id,name,type}
            subDirs {id,name}
            symbols {uid, text}
        }
    }`
};

export default class DirViewer extends Component {
    //region STATIC
    static propTypes = {
        //data
        /** The initial directory to load. If null, the root directory will be loaded. */
        initDirId:PropTypes.number,

        //actions
        onCreateAxiomStart: PropTypes.func, //accepts the parent dir of the new axiom. This will popup the axiom creator.
        onCreateSymbolStart: PropTypes.func, //accepts the parent dir of the new symbol. This will popup the symbol creator.
        onDirChanged: PropTypes.func.isRequired, //accepts the new directory.
        onSymbolClicked: PropTypes.func, //accepts the clicked symbol.


        //styling
        style: PropTypes.object,
        className: PropTypes.string,
    };

    //static defaultProps = {};
    //endregion


    //region FIELDS
    state = {
        currentDir:null,
        goToField: "",
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



    //region API
    addStatement(stmt) {
        //update the dir object.
        const updatedCurrentDir = Object.assign({}, this.state.currentDir);
        updatedCurrentDir.statements.push(stmt);
        //update the components
        this.setState({currentDir: updatedCurrentDir});
        this.props.onDirChanged(updatedCurrentDir);
    }
    //endregion




    //region EVENT HANDLERS
    /** Navigates to the root directory. Data will be fetched from the server. */
    navigateToRoot() {
        GraphQL.run(q.FETCH_ROOT)
            .then(resp => this.setState({currentDir: resp.rootDir}))
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
                }
                else QuickInfoService.makeError("Could not navigate to directory with id: " + id);
            })
            .catch(err => QuickInfoService.makeError("Could not navigate to directory with id: " + id));
    }

    /** Is triggered when the go To action is being hit.. */
    handleGoToAction() {
        if (!DomUtils.isInt(this.state.goToField)) {
            QuickInfoService.makeError("Please provide an integer as id to navigate to.");
            return;
        }
        this.navigateTo(parseInt(this.state.goToField));
    }

    handleCreateDirClick() {
        ModalService.showTextGetter("New Directory", "Directory name...", this.handleDirCreationTextSubmit.bind(this));
    }

    handleCreateSymbolClick() {
        if (this.props.onCreateSymbolStart) this.props.onCreateSymbolStart(this.state.currentDir);
    }

    handleCreateAxiomClick() {
        if (this.props.onCreateAxiomStart) this.props.onCreateAxiomStart(this.state.currentDir);
    }

    handleSymbolClick(sym) {
        if (this.props.onSymbolClicked) this.props.onSymbolClicked(sym);
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
                updatedCurrentDir.subDirs.push(resp.handleCreateDirClick);
                //update components
                this.setState({currentDir: updatedCurrentDir});
                this.props.onDirChanged(updatedCurrentDir);
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
                className="TheoryExplorer_subDir"
                title={"Id: " + subDir.id}
                onClick={this.navigateTo.bind(this, subDir.id)}>
                {subDir.name}
            </div>
        );
    }

    renderStatement(stmt) {
        return (
            <div key={stmt.id}>
                {stmt.name}
            </div>
        );
    }

    renderSymbol(sym) {
        return (
            <div
                key={sym.uid}
                title={"Id: " + sym.uid}
                className="TheoryExplorer_sym"
                onClick={this.handleSymbolClick.bind(this, sym)}>
                {sym.text}
            </div>
        );
    }

    //SECTIONS RENDERING
    renderToolbar() {
        return (
            <div className="Globals_flexStart">
                <button
                    className="Globals_roundBut"
                    title="Parent dir"
                    style={{backgroundColor: "#62676d", width: "32px", height: "32px", fontSize: "16px"}}
                    onClick={this.goToParentDir.bind(this)}>
                    <FontAwesomeIcon icon="arrow-up"/>
                </button>
                <div style={{margin: "0 16px"}}>{this.state.currentDir.name}</div>
                <div style={{margin: "0 8px"}}>Id: {this.state.currentDir.id}</div>
                <input
                    value={this.state.goToField}
                    onChange={e => this.setState({goToField: e.target.value})}
                    className="Globals_inp"
                    placeholder="Navigate to id..."
                    onKeyDown={DomUtils.handleEnter(this.handleGoToAction.bind(this))}/>
                <button
                    className="Globals_roundBut"
                    title="New symbol"
                    style={{backgroundColor: "#e61919", width: "32px", height: "32px", fontSize: "16px"}}
                    onClick={this.handleCreateSymbolClick.bind(this)}>
                    <FontAwesomeIcon icon="hashtag"/>
                </button>
                <button
                    className="Globals_roundBut"
                    title="New axiom"
                    style={{backgroundColor: "#76b7e6", width: "32px", height: "32px", fontSize: "16px"}}
                    onClick={this.handleCreateAxiomClick.bind(this)}>
                    <FontAwesomeIcon icon="hashtag"/>
                </button>
                <button
                    className="Globals_roundBut"
                    title="New directory"
                    style={{backgroundColor: "#00ced1", width: "32px", height: "32px"}}
                    onClick={this.handleCreateDirClick.bind(this)}>
                    <FontAwesomeIcon icon="plus"/>
                </button>
            </div>
        );
    }

    renderStatements() {
        const statements = this.state.currentDir.statements;
        if (!statements || statements.length === 0) return null;

        return (
            <div className="TheoryExplorer_stmtDiv">
                {statements.map(this.renderStatement.bind(this))}
            </div>
        );
    }

    renderSubDirs() {
        const dirs = this.state.currentDir.subDirs;

        return (
            <div className="TheoryExplorer_subDirsDiv">
                {dirs.map(this.renderSubDir.bind(this))}
            </div>
        );
    }

    renderSymbols() {
        const symbols = this.state.currentDir.symbols;
        if (!symbols || symbols.length === 0) return null;

        return (
            <div className="TheoryExplorer_symbolsDiv">
                {symbols.map(this.renderSymbol.bind(this))}
            </div>
        );
    }


    render() {
        if (!this.state.currentDir) return null;

        return (
            <div className={cx("DirViewer_root", this.props.className)} style={this.props.style}>
                {this.renderToolbar()}
                <div style={{marginTop: "16px"}}>Directories:</div>
                {this.renderSubDirs()}
                {this.renderStatements()}
                <div>Symbols:</div>
                {this.renderSymbols()}
            </div>
        );
    }

    //endregion
}