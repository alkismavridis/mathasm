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
        onChangeDir: PropTypes.func.isRequired,

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
        actionDir:null, //the directory for which an action is chosen
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
            {mode:Mode.CREATE_SYMBOL, actionDir:parentDirId};

        this.setState(newState);
    }

    /** Enters or leaves axiom creation mode. Leaving is always performed towards Mode.VIEW. */
    toggleAxiomCreationMode(parentDirId) {
        const newState = this.state.mode === Mode.CREATE_AXIOM?
            {mode:Mode.VIEW} :
            {mode:Mode.CREATE_AXIOM, actionDir:parentDirId};

        this.setState(newState);
    }

    /** Enters or leaves theorem creation mode. Leaving is always performed towards Mode.VIEW. */
    toggleTheoremCreationMode(parentDirId) {
        const newState = this.state.mode === Mode.CREATE_THEOREM?
            {mode:Mode.VIEW} :
            {mode:Mode.CREATE_THEOREM, actionDir:parentDirId};

        this.setState(newState);
    }



    /** callback on symbol click*/
    handleSymbolClick(sym) {
        switch (this.state.mode) {
            case Mode.CREATE_AXIOM:
                if (this._axiomCreator) this._axiomCreator.addSymbol(sym);
                break;

        }
    }

    handleStatementClick(stmt) {
        switch (this.state.mode) {
            case Mode.CREATE_THEOREM:
                if (this._theoremCreator) this._theoremCreator.setBase(stmt);
                break;

        }
    }

    handleAxiomSaved(axiom) {
        if (this._dirViewerGroup) this._dirViewerGroup.statementCreated(axiom, this.state.actionDir);
    }

    handleSymbolMapUpdated(newMap) {
        this.setState({symbolMap:newMap});
    }

    //endregion




    //region RENDERING
    renderSymbolCreator() {
        return <SymbolCreator
            parentId={this.state.actionDir.id}
            showCreatedSymbols={false}
            onSymbolCreated={s => {
                const newDir = Object.assign({}, this.state.actionDir);
                newDir.symbols.push(s);
                this.props.onChangeDir(newDir);
            }}/>;
    }

    renderAxiomCreator() {
        return <AxiomCreator
            ref={el => this._axiomCreator = el}
            parentDir={this.state.actionDir}
            onSetCurrentDir={() => this.setState({actionDir:this.state.activeDir})}
            onSave={this.handleAxiomSaved.bind(this)}/>;
    }

    renderTheoremCreator() {
        return <TheoremCreator
            ref={el => this._theoremCreator = el}
            symbolMap={this.state.symbolMap}
            parentDir={this.state.actionDir}
            onSetCurrentDir={() => this.setState({actionDir:this.state.activeDir})}
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