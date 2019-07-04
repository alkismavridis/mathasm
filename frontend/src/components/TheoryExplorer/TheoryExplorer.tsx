import React, {Component, createRef, CSSProperties} from 'react';
import "./TheoryExplorer.css";
import SymbolCreator from "../SymbolCreator/SymbolCreator";
import AxiomCreator from "../AxiomCreator/AxiomCreator";
import DirViewerGroup from "../ReusableComponents/DirViewerGroup/DirViewerGroup";
import TheoremCreator from "../TheoremCreator/TheoremCreator";
import MathAsmDir from "../../entities/backend/MathAsmDir";
import ProofViewer from "../ProofViewer/ProofViewer";
import MathAsmStatement from "../../entities/backend/MathAsmStatement";
import {AppNode} from "../../entities/frontend/AppNode";
import {AppEvent} from "../../entities/frontend/AppEvent";
import AppNodeReaction from "../../enums/AppNodeReaction";
import AppEventType from "../../enums/AppEventType";

enum Mode {
    VIEW = 1,
    CREATE_SYMBOL = 2,
    CREATE_AXIOM = 3,
    CREATE_THEOREM = 4,
    SHOW_PROOF = 5,
    //etc
}


export default class TheoryExplorer extends Component implements AppNode {
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

        //proof viewer
        statementForProof:null as MathAsmStatement,
    };

    childMap = {
      dirViewerGroup: createRef<DirViewerGroup>(),
      axiomCreator: createRef<AxiomCreator>(),
      theoremCreator: createRef<TheoremCreator>(),
      proofViewer : createRef<ProofViewer>(),
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



    //region APP NODE
    getChildMap(): any { return this.childMap; }

    getParent(): AppNode {
        return null; //TODO connect this with page
    }

    handleChildEvent(event: AppEvent): AppNodeReaction {
        switch (event.type) {
            case AppEventType.STMT_SELECTED:
            case AppEventType.SYMBOL_SELECTED:
            case AppEventType.SYMBOL_RENAMED:
            case AppEventType.STMT_UPDATED:
                return AppNodeReaction.DOWN;

            case AppEventType.SYMBOL_MAP_CHANGED:
                this.setState({symbolMap:event.data});
                return AppNodeReaction.NONE;

            case AppEventType.SHOW_PROOF:
                this.setState({mode:Mode.SHOW_PROOF, statementForProof:event.data});
                return AppNodeReaction.NONE;

            case AppEventType.DIR_CHANGED:
                this.setState({activeDir:event.data});
                return AppNodeReaction.NONE;

            default: return AppNodeReaction.UP;
        }
    }

    handleParentEvent(event: AppEvent): AppNodeReaction {
        return AppNodeReaction.NONE;
    }
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
    //endregion




    //region RENDERING
    renderSymbolCreator() {
        return <SymbolCreator
            parentId={this.state.activeDir.id}
            parent={this}
            onSymbolCreated={s => {
                const newDir = Object.assign({}, this.state.activeDir);
                newDir.symbols.push(s);
                this.setState({activeDir:newDir});
            }}/>;
    }

    renderAxiomCreator() {
        return <AxiomCreator
            ref={this.childMap.axiomCreator}
            parent={this}
            parentDir={this.state.activeDir}/>;
    }

    renderTheoremCreator() {
        return <TheoremCreator
            ref={this.childMap.theoremCreator}
            parent={this}
            symbolMap={this.state.symbolMap}
            parentDir={this.state.activeDir}
            style={{maxHeight:"50vh"}}
        />;
    }

    renderProofViewer() {
        return <ProofViewer
            ref={this.childMap.proofViewer}
            parent={this}
            symbolMap={this.state.symbolMap}
            parentDir={this.state.activeDir}
            statement={this.state.statementForProof}
            style={{maxHeight:"50vh"}}
        />;
    }

    render() {
        return (
            <div className={`TheoryExplorer_root ${this.props.className || ""}`} style={this.props.style}>
                {this.state.mode === Mode.CREATE_SYMBOL && this.renderSymbolCreator()}
                {this.state.mode === Mode.CREATE_AXIOM && this.renderAxiomCreator()}
                {this.state.mode === Mode.CREATE_THEOREM && this.renderTheoremCreator()}
                {this.state.mode === Mode.SHOW_PROOF && this.renderProofViewer()}

                <DirViewerGroup
                    ref={this.childMap.dirViewerGroup}
                    parent={this}
                    symbolMap={this.state.symbolMap}
                    onCreateSymbolStart={this.toggleSymbolCreationMode.bind(this)}
                    onCreateAxiomStart={this.toggleAxiomCreationMode.bind(this)}
                    onCreateTheoremStart={this.toggleTheoremCreationMode.bind(this)}
                    style={{flex:1}}/>
            </div>
        );
    }
    //endregion
}