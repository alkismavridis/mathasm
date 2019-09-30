import React, {Component, CSSProperties} from 'react';
import "./MainPage.scss";
import SymbolCreator from "../../SymbolCreator/SymbolCreator";
import AxiomCreator from "../../AxiomCreator/AxiomCreator";
import DirViewerGroup from "../../ReusableComponents/DirViewerGroup/DirViewerGroup";
import TheoremCreator from "../../TheoremCreator/TheoremCreator";
import ProofViewer from "../../ProofViewer/ProofViewer";
import App from "../../../../core/app/App";
import {Subscription} from "rxjs/index";
import {unsubscribeAll, updateOn} from "../../../utils/SubscriptionUtils";
import MainPageController, {MainPageMode} from "../../../../core/app/pages/MainPageController";




export default class MainPage extends Component {
    //region FIELDS
    props : {
        app:App,
        ctrl:MainPageController,
        className?: string,
        style?: CSSProperties,
    };

    subscriptions:Subscription[] = [];
    //endregion



    //region LIFE CYCLE
    constructor(props) {
        super(props);

        updateOn(this.props.ctrl.onModeChanged, this);
        updateOn(this.props.ctrl.onActiveDirChanged, this);
        updateOn(this.props.ctrl.onSymbolMapUpdated, this);
    }

    componentWillUnmount() {
        unsubscribeAll(this);
    }
    //endregion




    //region RENDERING
    renderSymbolCreator() {
        return <SymbolCreator
            app={this.props.app}
            parentDir={this.props.ctrl.dirViewer.activeDir}
            style={{marginLeft:"8px"}}
            onSymbolCreated={s => this.props.ctrl.symbolCreated(s)}/>;
    }

    renderAxiomCreator() {
        return <AxiomCreator
            app={this.props.app}
            controller={this.props.ctrl}
            parentDir={this.props.ctrl.dirViewer.activeDir}/>;
    }

    renderTheoremCreator() {
        return <TheoremCreator
            app={this.props.app}
            controller={this.props.ctrl}
            symbolMap={this.props.ctrl.symbolMap}
            parentDir={this.props.ctrl.dirViewer.activeDir}
            style={{maxHeight:"30vh"}}
        />;
    }

    renderProofViewer() {
        return <ProofViewer
            app={this.props.app}
            controller={this.props.ctrl}
            symbolMap={this.props.ctrl.symbolMap}
            parentDir={this.props.ctrl.dirViewer.activeDir}
            statement={this.props.ctrl.statementForProof}
            style={{maxHeight:"50vh"}}
        />;
    }

    render() {
        return (
            <div className={`MainPage_root ${this.props.className || ""}`} style={this.props.style}>
                {this.props.ctrl.mode === MainPageMode.CREATE_SYMBOL && this.renderSymbolCreator()}
                {this.props.ctrl.mode === MainPageMode.CREATE_AXIOM && this.renderAxiomCreator()}
                {this.props.ctrl.mode === MainPageMode.CREATE_THEOREM && this.renderTheoremCreator()}
                {this.props.ctrl.mode === MainPageMode.SHOW_PROOF && this.renderProofViewer()}

                <DirViewerGroup
                    ctrl={this.props.ctrl.dirViewer}
                    style={{flex:1}}/>
            </div>
        );
    }
    //endregion
}