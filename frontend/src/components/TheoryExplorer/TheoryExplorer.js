import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./TheoryExplorer.css";
import SymbolCreator from "../SymbolCreator/SymbolCreator";
import AxiomCreator from "../AxiomCreator/AxiomCreator";
import DirViewerGroup from "../ReusableComponents/DirViewerGroup/DirViewerGroup";
import TheoremCreator from "../TheoremCreator/TheoremCreator";

const Mode = {
    VIEW: 1,
    CREATE_SYMBOL: 2,
    CREATE_AXIOM: 3,
    CREATE_THEOREM: 4,
    //etc
};


export default class TheoryExplorer extends Component {
    //region STATIC
    static propTypes = {
        //data

        //actions

        //styling
        className: PropTypes.string,
        style: PropTypes.object,
    };

    //static defaultProps = {};
    //endregion


    //region FIELDS
    _axiomCreator = null;
    _theoremCreator = null;
    _dirViewerGroup = null;

    state = {
        symbolMap:{},
        mode:Mode.VIEW,

        //axiom creator
        activeDir:null, //the directory currently shown on the dir viewer group

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
    /** Enters or leaves the symbol creation mode. Leaving is always performed towards Mode.VIEW. */
    toggleSymbolCreationMode(parentDirId) {
        const newState = this.state.mode === Mode.CREATE_SYMBOL?
            {mode:Mode.VIEW} :
            {mode:Mode.CREATE_SYMBOL, activeDir:parentDirId};

        this.setState(newState);
    }

    /** Enters or leaves axiom creation mode. Leaving is always performed towards Mode.VIEW. */
    toggleAxiomCreationMode(parentDirId) {
        const newState = this.state.mode === Mode.CREATE_AXIOM?
            {mode:Mode.VIEW} :
            {mode:Mode.CREATE_AXIOM, activeDir:parentDirId};

        this.setState(newState);
    }

    /** Enters or leaves theorem creation mode. Leaving is always performed towards Mode.VIEW. */
    toggleTheoremCreationMode(parentDirId) {
        const changes = this.state.mode === Mode.CREATE_THEOREM?
            {mode:Mode.VIEW} :
            {mode:Mode.CREATE_THEOREM, activeDir:parentDirId};

        this.setState(changes);
    }



    /** callback on symbol click*/
    handleSymbolClick(sym) {
        switch (this.state.mode) {
            case Mode.CREATE_AXIOM:
                if (this._axiomCreator) {
                    this._axiomCreator.addSymbol(sym);
                    this._axiomCreator.focus();
                }
                break;

        }
    }

    handleStatementClick(stmt) {
        switch (this.state.mode) {
            case Mode.CREATE_THEOREM:
                if (this._theoremCreator) {
                    this._theoremCreator.setBase(stmt);
                    this._theoremCreator.focus();
                }
                break;

        }
    }

    handleAxiomSaved(axiom) {
        if (this._dirViewerGroup && this.state.activeDir) {
            this._dirViewerGroup.statementCreated(axiom, this.state.activeDir.id);
        }
    }

    /** accepts an array of SavedTheoremInfo objects. Updates the keyboards. */
    handleProofSaved(saveInfo) {
        if (this._dirViewerGroup) {
            saveInfo.forEach(si => {
                this._dirViewerGroup.statementCreated(si.theorem, si.parentId)
            });
        }
    }

    handleSymbolMapUpdated(newMap) {
        this.setState({symbolMap:newMap});
    }

    //endregion




    //region RENDERING
    renderSymbolCreator() {
        return <SymbolCreator
            parentId={this.state.activeDir.id}
            showCreatedSymbols={false}
            onSymbolCreated={s => {
                const newDir = Object.assign({}, this.state.activeDir);
                newDir.symbols.push(s);
                this.setState({activeDir:newDir});
            }}/>;
    }

    renderAxiomCreator() {
        return <AxiomCreator
            ref={el => this._axiomCreator = el}
            parentDir={this.state.activeDir}
            onSave={this.handleAxiomSaved.bind(this)}/>;
    }

    renderTheoremCreator() {
        return <TheoremCreator
            ref={el => this._theoremCreator = el}
            symbolMap={this.state.symbolMap}
            onCreateStatements={info => this.handleProofSaved(info)}
            parentDir={this.state.activeDir}
            style={{maxHeight:"200px"}}
        />;
    }

    render() {
        return (
            <div className={`TheoryExplorer_root ${this.props.className || ""}`} style={this.props.style}>
                {this.state.mode === Mode.CREATE_SYMBOL && this.renderSymbolCreator()}
                {this.state.mode === Mode.CREATE_AXIOM && this.renderAxiomCreator()}
                {this.state.mode === Mode.CREATE_THEOREM && this.renderTheoremCreator()}

                <DirViewerGroup
                    ref={el => this._dirViewerGroup = el}
                    symbolMap={this.state.symbolMap}
                    onUpdateSymbolMap={this.handleSymbolMapUpdated.bind(this)}
                    onShowDir={dir => this.setState({activeDir:dir})}
                    onSymbolClicked={this.handleSymbolClick.bind(this)}
                    onStatementClicked={this.handleStatementClick.bind(this)}
                    onCreateSymbolStart={this.toggleSymbolCreationMode.bind(this)}
                    onCreateAxiomStart={this.toggleAxiomCreationMode.bind(this)}
                    onCreateTheoremStart={this.toggleTheoremCreationMode.bind(this)}
                    style={{flex:1}}/>
            </div>
        );
    }
    //endregion
}