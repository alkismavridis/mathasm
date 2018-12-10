import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./TheoryExplorer.css";
import QuickInfoService from "../../services/QuickInfoService";
import GraphQL from "../../services/GraphQL";
import DomUtils from "../../services/DomUtils";
import SymbolCreator from "../SymbolCreator/SymbolCreator";
import ModalService from "../../services/ModalService";
import StringInputDialog from "../Modals/StringInputDialog/StringInputDialog";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";




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

const CREATE_DIR = `mutation($parentId:Long!, $name:String!) {
    createDir(parentId:$parentId, name:$name) {
        id,name
        statements {id,name,type}
        subDirs {id,name}
        symbols {uid, text}
    }
}`;
//endregion


export default class TheoryExplorer extends Component {
    //region STATIC
    static propTypes = {
        //data
        currentDir:PropTypes.object.isRequired,



        //actions
        onChangeDir:PropTypes.func.isRequired,

        //styling
        className:PropTypes.string.isRequired,
        style:PropTypes.object.isRequired,
    };

    //static defaultProps = {};
    //endregion


    //region FIELDS
    state = {
        goToField:"",
        showSymbolCreator:false
    };
    //endregion


    //region LIFE CYCLE
    // constructor(props) { super(props); }
    // componentDidMount() {}
    // static getDerivedStateFromProps(nextProps, prevState) {}
    // shouldComponentUpdate(nextProps, nextState) { return true; }
    // getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    // componentDidUpdate(prevProps, prevState, snapshot) {}
    // componentWillUnmount() {}
    // componentDidCatch(error, info) { console.error("Exception caught"); }
    //endregion


    //region EVENT HANDLERS
    navigateTo(id) {
        GraphQL.run(FETCH_DIR, {id:id})
            .then(resp => {
                if (resp.logicDir) this.props.onChangeDir(resp.logicDir);
                else QuickInfoService.makeError("Could not navigate to directory with id: "+id);
            })
            .catch(err => QuickInfoService.makeError("Could not navigate to directory with id: "+id));
    }

    handleGoToAction() {
        if (!DomUtils.isInt(this.state.goToField)) {
            QuickInfoService.makeError("Please provide an integer as id to navigate to.");
            return;
        }


        this.navigateTo(parseInt(this.state.goToField));
    }

    goToParentDir() {
        GraphQL.run(FETCH_PARENT, {id:this.props.currentDir.id})
            .then(resp => {
                if (resp.dirParent) this.props.onChangeDir(resp.dirParent);
                else QuickInfoService.makeInfo("This is the root directory.");
            })
            .catch(err => QuickInfoService.makeError("Could not fetch init data!"));
    }

    toggleSymbolCreator() {
        this.setState({showSymbolCreator: !this.state.showSymbolCreator});
    }

    handleDirCreationTextSubmit(modalId, text) {
        if (!text) {
            QuickInfoService.makeWarning("Please provide a name to submit.");
            return;
        }

        GraphQL.run(CREATE_DIR, {name:text, parentId:this.props.currentDir.id})
            .then(resp => {
                const updatedCurrentDir = Object.assign({}, this.props.currentDir);
                updatedCurrentDir.subDirs.push(resp.createDir);
                this.props.onChangeDir(updatedCurrentDir);
                ModalService.removeModal(modalId);
            })
            .catch(err => {
                QuickInfoService.makeError("Could not create directory "+this.state.text)
            });
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
                    style={{backgroundColor:"#62676d", width:"32px", height:"32px", fontSize:"16px"}}
                    onClick={this.goToParentDir.bind(this)}>
                    <FontAwesomeIcon icon="arrow-up"/>
                </button>
                <div style={{margin:"0 16px"}}>{this.props.currentDir.name}</div>
                <div style={{margin:"0 8px"}}>Id: {this.props.currentDir.id}</div>
                <input
                    value={this.state.goToField}
                    onChange={e => this.setState({goToField:e.target.value})}
                    className="Globals_inp"
                    placeholder="Navigate to id..."
                    onKeyDown={DomUtils.handleEnter(this.handleGoToAction.bind(this))} />
                <button
                    className="Globals_roundBut"
                    title="New symbol"
                    style={{backgroundColor:"#e61919", width:"32px", height:"32px", fontSize:"16px"}}
                    onClick={this.toggleSymbolCreator.bind(this)}>
                    <FontAwesomeIcon icon="hashtag"/>
                </button>
            </div>
        );
    }

    renderSymbolCreator() {
        return <SymbolCreator
            parentId={this.props.currentDir.id}
            showCreatedSymbols={false}
            onSymbolCreated={s => {
                const newDir = Object.assign({}, this.props.currentDir);
                newDir.symbols.push(s);
                this.props.onChangeDir(newDir);
            }}/>;
    }

    //SUB-DIR RENDERING
    renderSubDirs() {
        const dirs = this.props.currentDir.subDirs;

        return (
            <div className="TheoryExplorer_subDirsDiv">
                {dirs.map(this.renderSubDir.bind(this))}
                <button
                    className="Globals_roundBut"
                    title="New directory"
                    style={{backgroundColor:"#00ced1", width:"32px", height:"32px"}}
                    onClick={this.createDir.bind(this)}>
                    <FontAwesomeIcon icon="plus"/>
                </button>
            </div>
        );
    }

    renderSubDir(subDir) {
        return(
            <div
                key={subDir.id}
                className="TheoryExplorer_subDir"
                title={"Id: "+subDir.id}
                onClick={this.navigateTo.bind(this, subDir.id)}>
                {subDir.name}
            </div>
        );
    }




    //STATEMENT RENDERING
    renderStatements() {
        const statements = this.props.currentDir.statements;
        if (!statements || statements.length===0) return null;

        return (
            <div className="TheoryExplorer_stmtDiv">
                {statements.map(this.renderStatement.bind(this))}
            </div>
        );
    }

    renderStatement(stmt) {
        return(
            <div key={stmt.id} >
                {stmt.name}
            </div>
        );
    }


    //SYMBOL RENDERING
    renderSymbols() {
        const symbols = this.props.currentDir.symbols;
        if (!symbols || symbols.length===0) return null;

        return (
            <div className="TheoryExplorer_symbolsDiv">
                {symbols.map(this.renderSymbol.bind(this))}
            </div>
        );
    }

    renderSymbol(sym) {
        return(
            <div key={sym.uid} title={"Id: "+sym.uid} className="TheoryExplorer_sym">
                {sym.text}
            </div>
        );
    }

    render() {
        return (
            <div className={`TheoryExplorer_root ${this.props.className || ""}`} style={this.props.style}>
                {this.renderToolbar()}
                {this.state.showSymbolCreator && this.renderSymbolCreator()}
                <div style={{marginTop:"16px"}}>Directories:</div>
                {this.renderSubDirs()}
                {this.renderStatements()}

                <div>Symbols:</div>
                {this.renderSymbols()}
            </div>
        );
    }

    //endregion
}