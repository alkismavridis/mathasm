import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./TheoryExplorer.css";
import QuickInfoService from "../../services/QuickInfoService";
import GraphQL from "../../services/GraphQL";
import DomUtils from "../../services/DomUtils";
import SymbolCreator from "../SymbolCreator/SymbolCreator";
import ModalService from "../../services/ModalService";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import AxiomCreator from "../AxiomCreator/AxiomCreator";
import Dropdown from "../ReusableComponents/Inputs/Dropdown/Dropdown";


//region QUERIES
const FETCH_DIR = `query($id:Long!){
    logicDir(id:$id) {
        id,name
        statements {id,name,type}
        subDirs {id,name}
        symbols {uid, text}
    }
}`;

const FETCH_PARENT = `query($id:Long!){
    dirParent(id:$id) {
        id,name
        statements {id,name,type}
        subDirs {id,name}
        symbols {uid, text}
    }
}`;

const FETCH_ROOT = `{
    rootDir(depth:1) {
        id,name
        statements {id,name,type}
        subDirs {id,name}
        symbols {uid, text}
    }
}`;

const CREATE_DIR = `mutation($parentId:Long!, $name:String!) {
    createDir(parentId:$parentId, name:$name) {
        id,name
        statements {id,name,type}
        subDirs {id,name}
        symbols {uid, text}
    }
}`;
//endregion


const Mode = {
    VIEW: 1,
    CREATE_SYMBOL: 2,
    CREATE_AXIOM: 3,
    //etc
};


export default class TheoryExplorer extends Component {
    //region STATIC
    static propTypes = {
        //data

        //actions
        onChangeDir: PropTypes.func.isRequired,

        //styling
        className: PropTypes.string,
        style: PropTypes.object,
    };

    //static defaultProps = {};
    //endregion


    //region FIELDS
    _axiomCreator = null;

    state = {
        mode: Mode.VIEW,
        currentDir: null,

        //axiom creator
        axiomDir: null,

        goToField: "",
    };
    //endregion


    //region LIFE CYCLE
    componentDidMount() {
        this.navigateToRoot();
    }


    // constructor(props) { super(props); }
    // static getDerivedStateFromProps(nextProps, prevState) {}
    // shouldComponentUpdate(nextProps, nextState) { return true; }
    // getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    // componentDidUpdate(prevProps, prevState, snapshot) {}
    // componentWillUnmount() {}
    // componentDidCatch(error, info) { console.error("Exception caught"); }
    //endregion


    //region EVENT HANDLERS
    navigateTo(id) {
        GraphQL.run(FETCH_DIR, {id: id})
            .then(resp => {
                if (resp.logicDir) {
                    this.setState({currentDir: resp.logicDir});
                    this.props.onChangeDir(resp.logicDir);
                }
                else QuickInfoService.makeError("Could not navigate to directory with id: " + id);
            })
            .catch(err => QuickInfoService.makeError("Could not navigate to directory with id: " + id));
    }

    navigateToRoot() {
        GraphQL.run(FETCH_ROOT)
            .then(resp => this.setState({currentDir: resp.rootDir}))
            .catch(err => QuickInfoService.makeError("Could not fetch init data!"));

    }

    handleGoToAction() {
        if (!DomUtils.isInt(this.state.goToField)) {
            QuickInfoService.makeError("Please provide an integer as id to navigate to.");
            return;
        }


        this.navigateTo(parseInt(this.state.goToField));
    }

    goToParentDir() {
        if (!this.state.currentDir) return;
        GraphQL.run(FETCH_PARENT, {id: this.state.currentDir.id})
            .then(resp => {
                if (resp.dirParent) {
                    this.setState({currentDir: resp.dirParent});
                    this.props.onChangeDir(resp.dirParent);
                }
                else QuickInfoService.makeInfo("This is the root directory.");
            })
            .catch(err => QuickInfoService.makeError("Could not fetch init data!"));
    }

    saveAxiom() {

    }

    /** Enters or leaves the given mode. Leaving is always performed towards Mode.VIEW. */
    toggleMode(mode) {
        const newMode = this.state.mode === mode ? Mode.VIEW : mode;
        this.setState({mode: newMode});
    }

    /** Enters or leaves axiom creation mode. Leaving is always performed towards Mode.VIEW. */
    toggleAxiomCreationMode() {
        const newState = this.state.mode === Mode.CREATE_AXIOM ?
            {mode: Mode.VIEW} :
            {mode: Mode.CREATE_AXIOM, axiomDir: this.state.currentDir};

        this.setState(newState);
    }

    handleDirCreationTextSubmit(modalId, text) {
        if (!text) {
            QuickInfoService.makeWarning("Please provide a name to submit.");
            return;
        }

        GraphQL.run(CREATE_DIR, {name: text, parentId: this.state.currentDir.id})
            .then(resp => {
                //setup new directory object
                const updatedCurrentDir = Object.assign({}, this.state.currentDir);
                updatedCurrentDir.subDirs.push(resp.createDir);
                //update components
                this.setState({currentDir: updatedCurrentDir});
                this.props.onChangeDir(updatedCurrentDir);
                //remove the modal
                ModalService.removeModal(modalId);
            })
            .catch(err => {
                QuickInfoService.makeError("Could not create directory " + text)
            });
    }

    /** callback on symbol click*/
    handleSymbolClick(sym) {
        switch (this.state.mode) {
            case Mode.CREATE_AXIOM:
                if (this._axiomCreator) this._axiomCreator.addSymbol(sym);
                break;

        }
    }

    handleAxiomSaved(axiom) {
        //update the dir object.
        const updatedCurrentDir = Object.assign({}, this.state.currentDir);
        updatedCurrentDir.statements.push(axiom);
        //update the components
        this.setState({currentDir: updatedCurrentDir});
        this.props.onChangeDir(updatedCurrentDir);
    }

    createDir() {
        ModalService.showTextGetter("New Directory", "Directory name...", this.handleDirCreationTextSubmit.bind(this));
    }

    //endregion


    //region RENDERING
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
                    onClick={this.toggleMode.bind(this, Mode.CREATE_SYMBOL)}>
                    <FontAwesomeIcon icon="hashtag"/>
                </button>
                <button
                    className="Globals_roundBut"
                    title="New symbol"
                    style={{backgroundColor: "#76b7e6", width: "32px", height: "32px", fontSize: "16px"}}
                    onClick={this.toggleAxiomCreationMode.bind(this)}>
                    <FontAwesomeIcon icon="hashtag"/>
                </button>
                <button
                    className="Globals_roundBut"
                    title="New directory"
                    style={{backgroundColor: "#00ced1", width: "32px", height: "32px"}}
                    onClick={this.createDir.bind(this)}>
                    <FontAwesomeIcon icon="plus"/>
                </button>
            </div>
        );
    }

    renderSymbolCreator() {
        return <SymbolCreator
            parentId={this.state.currentDir.id}
            showCreatedSymbols={false}
            onSymbolCreated={s => {
                const newDir = Object.assign({}, this.state.currentDir);
                newDir.symbols.push(s);
                this.setState({currentDir: newDir});
                this.props.onChangeDir(newDir);
            }}/>;
    }

    renderAxiomCreator() {
        return <AxiomCreator
            ref={el => this._axiomCreator = el}
            parentDir={this.state.axiomDir}
            onSave={this.handleAxiomSaved.bind(this)}/>;
    }

    //SUB-DIR RENDERING
    renderSubDirs() {
        const dirs = this.state.currentDir.subDirs;

        return (
            <div className="TheoryExplorer_subDirsDiv">
                {dirs.map(this.renderSubDir.bind(this))}
            </div>
        );
    }

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


    //STATEMENT RENDERING
    renderStatements() {
        const statements = this.state.currentDir.statements;
        if (!statements || statements.length === 0) return null;

        return (
            <div className="TheoryExplorer_stmtDiv">
                {statements.map(this.renderStatement.bind(this))}
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


    //SYMBOL RENDERING
    renderSymbols() {
        const symbols = this.state.currentDir.symbols;
        if (!symbols || symbols.length === 0) return null;

        return (
            <div className="TheoryExplorer_symbolsDiv">
                {symbols.map(this.renderSymbol.bind(this))}
            </div>
        );
    }

    renderDropdown() {

        const options = [
            {value: 1, label: "Opt1"},
            {value: 2, label: "Opt2"},
            {value: 3, label: "Opt3"}
        ];
        
        return (
            <Dropdown options={options}
                      toLabelFunc={o => { return o.label} }
                      toValueFunc={o => { return o.value}}
                      onChange={c => console.log(c)}/>
        )
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

    render() {
        if (!this.state.currentDir) return null;

    return (
        <div className={`TheoryExplorer_root ${this.props.className || ""}`} style={this.props.style}>
            {this.state.mode === Mode.CREATE_SYMBOL && this.renderSymbolCreator()}
            {this.state.mode === Mode.CREATE_AXIOM && this.renderAxiomCreator()}


            {this.renderToolbar()}
            <div style={{marginTop: "16px"}}>Directories:</div>
            {this.renderSubDirs()}
            {this.renderStatements()}
            <div>Symbols:</div>
            {this.renderSymbols()}
            {this.renderDropdown()}
        </div>
    );
}

//endregion
}