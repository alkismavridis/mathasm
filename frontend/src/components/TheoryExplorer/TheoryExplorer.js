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
import DirViewerGroup from "../ReusableComponents/DirViewerGroup/DirViewerGroup";


const Mode = {
    VIEW:1,
    CREATE_SYMBOL:2,
    CREATE_AXIOM:3,
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
    _dirViewerGroup = null;

    state = {
        mode:Mode.VIEW,

        //axiom creator
        axiomDir:null,
        symbolDir:null,

    };
    //endregion


    //region LIFE CYCLE



    // constructor(props) { super(props); }
    // static getDerivedStateFromProps(nextProps, prevState) {}
    // shouldComponentUpdate(nextProps, nextState) { return true; }
    // getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    // componentDidUpdate(prevProps, prevState, snapshot) {}
    // componentWillUnmount() {}
    // componentDidCatch(error, info) { console.error("Exception caught"); }
    //endregion




    //region EVENT HANDLERS


    saveAxiom() {

    }

    /** Enters or leaves the symbol creation mode. Leaving is always performed towards Mode.VIEW. */
    toggleSymbolCreationMode(parentDirId) {
        const newState = this.state.mode === Mode.CREATE_SYMBOL?
            {mode:Mode.VIEW} :
            {mode:Mode.CREATE_SYMBOL, symbolDir:parentDirId};

        this.setState(newState);
    }

    /** Enters or leaves axiom creation mode. Leaving is always performed towards Mode.VIEW. */
    toggleAxiomCreationMode(parentDirId) {
        console.log(parentDirId);

        const newState = this.state.mode === Mode.CREATE_AXIOM?
            {mode:Mode.VIEW} :
            {mode:Mode.CREATE_AXIOM, axiomDir:parentDirId};

        console.log(newState);
        this.setState(newState);
    }



    /** callback on symbol click*/
    handleSymbolClick(sym) {
        switch(this.state.mode) {
            case Mode.CREATE_AXIOM:
                if (this._axiomCreator) this._axiomCreator.addSymbol(sym);
                break;

        }
    }

    handleAxiomSaved(axiom) {
        if (this._dirViewerGroup) this._dirViewerGroup.addStatement(axiom, this.state.axiomDir);
    }
    //endregion




    //region RENDERING
    renderSymbolCreator() {
        return <SymbolCreator
            parentId={this.state.symbolDir.id}
            showCreatedSymbols={false}
            onSymbolCreated={s => {
                const newDir = Object.assign({}, this.state.symbolDir);
                newDir.symbols.push(s);
                this.props.onChangeDir(newDir);
            }}/>;
    }

    renderAxiomCreator() {
        return <AxiomCreator
            ref={el => this._axiomCreator = el}
            parentDir={this.state.axiomDir}
            onSave={this.handleAxiomSaved.bind(this)}/>;
    }

    render() {
        return (
            <div className={`TheoryExplorer_root ${this.props.className || ""}`} style={this.props.style}>
                {this.state.mode === Mode.CREATE_SYMBOL && this.renderSymbolCreator()}
                {this.state.mode === Mode.CREATE_AXIOM && this.renderAxiomCreator()}

                <DirViewerGroup
                    ref={el => this._dirViewerGroup = el}
                    onCreateAxiomStart={this.toggleAxiomCreationMode.bind(this)}
                    onCreateSymbolStart={this.toggleSymbolCreationMode.bind(this)}
                    onSymbolClicked={this.handleSymbolClick.bind(this)}
                    style={{flex:1}}/>
            </div>
        );
    }
    //endregion
}