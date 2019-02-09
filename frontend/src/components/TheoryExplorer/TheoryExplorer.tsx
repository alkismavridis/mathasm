import React, {Component, CSSProperties} from 'react';
import "./TheoryExplorer.css";
import SymbolCreator from "../SymbolCreator/SymbolCreator";
import AxiomCreator from "../AxiomCreator/AxiomCreator";
import DirViewerGroup from "../ReusableComponents/DirViewerGroup/DirViewerGroup";
import TheoremCreator from "../TheoremCreator/TheoremCreator";
import {FrontendEvent, MathAsmEventType} from "../../entities/frontend/FrontendEvent";
import MathAsmDir from "../../entities/backend/MathAsmDir";
import MathAsmStatement from "../../entities/backend/MathAsmStatement";

enum Mode {
    VIEW = 1,
    CREATE_SYMBOL = 2,
    CREATE_AXIOM = 3,
    CREATE_THEOREM = 4,
    //etc
}


export default class TheoryExplorer extends Component {
    //region FIELDS
    props : {
        //data

        //actions

        //styling
        className?: string,
        style?: CSSProperties,
    };

    state = {
        symbolMap:{},
        mode:Mode.VIEW,

        //axiom creator
        activeDir:null as MathAsmDir, //the directory currently shown on the dir viewer group

    };

    _axiomCreator = null;
    _theoremCreator = null;
    _dirViewerGroup = null;
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
    toggleSymbolCreationMode(parentDirId:number) {
        const newState = this.state.mode === Mode.CREATE_SYMBOL?
            {mode:Mode.VIEW} :
            {mode:Mode.CREATE_SYMBOL, activeDir:parentDirId};

        this.setState(newState);
    }

    /** Enters or leaves axiom creation mode. Leaving is always performed towards Mode.VIEW. */
    toggleAxiomCreationMode(parentDirId:number) {
        const newState = this.state.mode === Mode.CREATE_AXIOM?
            {mode:Mode.VIEW} :
            {mode:Mode.CREATE_AXIOM, activeDir:parentDirId};

        this.setState(newState);
    }

    /** Enters or leaves theorem creation mode. Leaving is always performed towards Mode.VIEW. */
    toggleTheoremCreationMode(parentDirId:number) {
        const changes = this.state.mode === Mode.CREATE_THEOREM?
            {mode:Mode.VIEW} :
            {mode:Mode.CREATE_THEOREM, activeDir:parentDirId};

        this.setState(changes);
    }



    /** callback on symbol or statement click*/
    handleSelection(event:FrontendEvent) {
        debugger;
        switch (this.state.mode) {
            case Mode.CREATE_AXIOM:
                if (this._axiomCreator && event.type===MathAsmEventType.SYMBOL_SELECTED) {
                    this._axiomCreator.addSymbol(event.symbol);
                    this._axiomCreator.focus();
                }
                break;

            case Mode.CREATE_THEOREM:
                if (!this._theoremCreator) break;
                if (event.type===MathAsmEventType.SYMBOL_SELECTED && event.statement){
                    this._theoremCreator.setBase(event.statement);
                    this._theoremCreator.focus();
                }
                else if (event.type===MathAsmEventType.STATEMENT_SELECTED) {
                    this._theoremCreator.setBase(event.statement);
                    this._theoremCreator.focus();
                }
                break;
        }
    }

    handleAxiomSaved(axiom:MathAsmStatement) {
        if (this._dirViewerGroup && this.state.activeDir) {
            this._dirViewerGroup.statementCreated(axiom, this.state.activeDir.id);
        }
    }

    /** accepts an array of SavedTheoremInfo objects. Updates the keyboards. */
    handleProofSaved(saveInfo:any[]) {
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
            style={{maxHeight:"50vh"}}
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
                    onSelect={this.handleSelection.bind(this)}
                    onCreateSymbolStart={this.toggleSymbolCreationMode.bind(this)}
                    onCreateAxiomStart={this.toggleAxiomCreationMode.bind(this)}
                    onCreateTheoremStart={this.toggleTheoremCreationMode.bind(this)}
                    style={{flex:1}}/>
            </div>
        );
    }
    //endregion
}