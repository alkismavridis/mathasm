import React, {Component, CSSProperties} from 'react';
import "./TheoryExplorer.css";
import SymbolCreator from "../SymbolCreator/SymbolCreator";
import AxiomCreator from "../AxiomCreator/AxiomCreator";
import DirViewerGroup from "../ReusableComponents/DirViewerGroup/DirViewerGroup";
import TheoremCreator from "../TheoremCreator/TheoremCreator";
import MathAsmDir from "../../entities/backend/MathAsmDir";
import ProofViewer from "../ProofViewer/ProofViewer";
import MathAsmStatement from "../../entities/backend/MathAsmStatement";
import App from "../../services/App";
import {Subscription} from "rxjs/index";
import TheoryExplorerController from "./TheoryExplorerController";

enum Mode {
    VIEW = 1,
    CREATE_SYMBOL = 2,
    CREATE_AXIOM = 3,
    CREATE_THEOREM = 4,
    SHOW_PROOF = 5,
    //etc
}


export default class TheoryExplorer extends Component {
    //region FIELDS
    props : {
        //data
        app:App,

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

    private subscriptions:Subscription[] = [];
    private _controller = new TheoryExplorerController();
    //endregion



    //region LIFE CYCLE
    constructor(props) {
        super(props);

        this.subscriptions.push(
            this._controller.onSymbolRenamed.subscribe(s => this.forceUpdate())
        );

        this.subscriptions.push(
            this._controller.onSymbolMapUpdated.subscribe(map => {
                this.setState({symbolMap:map});
            })
        );

        this.subscriptions.push(
            this._controller.onShowProof.subscribe(stmt => {
                this.setState({mode:Mode.SHOW_PROOF, statementForProof:stmt});
            })
        );

        this.subscriptions.push(
            this._controller.onDirChanged.subscribe(dir => {
                this.setState({activeDir:dir});
            })
        );

        this.subscriptions.push(
            this._controller.onProofSaved.subscribe(info => {
                this.setState({mode:Mode.VIEW});
            })
        );
    }

    componentWillUnmount() {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions = [];
    }

    // static getDerivedStateFromProps(nextProps, prevState) {}
    // shouldComponentUpdate(nextProps, nextState) { return true; }
    // getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    // componentDidUpdate(prevProps, prevState, snapshot) {}
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
    //endregion




    //region RENDERING
    renderSymbolCreator() {
        return <SymbolCreator
            app={this.props.app}
            parentId={this.state.activeDir.id}
            style={{marginLeft:"8px"}}
            onSymbolCreated={s => {
                const newDir = Object.assign({}, this.state.activeDir);
                newDir.symbols.push(s);
                this.setState({activeDir:newDir});
            }}/>;
    }

    renderAxiomCreator() {
        return <AxiomCreator
            app={this.props.app}
            controller={this._controller}
            parentDir={this.state.activeDir}/>;
    }

    renderTheoremCreator() {
        return <TheoremCreator
            app={this.props.app}
            controller={this._controller}
            symbolMap={this.state.symbolMap}
            parentDir={this.state.activeDir}
            style={{maxHeight:"30vh"}}
        />;
    }

    renderProofViewer() {
        return <ProofViewer
            app={this.props.app}
            controller={this._controller}
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
                    controller={this._controller}
                    app={this.props.app}
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