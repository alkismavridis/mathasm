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
import MainPageController from "../../../../core/app/pages/main_page/MainPageController";
import MainPageContentController from "../../../../core/app/pages/main_page/content/MainPageContentController";
import SymbolCreatorController from "../../../../core/app/pages/main_page/content/SymbolCreatorController";
import MainPageMode from "../../../../core/app/pages/main_page/MainPageMode";
import AxiomCreatorController from "../../../../core/app/pages/main_page/content/AxiomCreatorController";
import TheoremCreatorController from "../../../../core/app/pages/main_page/content/TheoremCreatorController";
import ProofViewerController from "../../../../core/app/pages/main_page/content/ProofViewerController";




export default class MainPage extends Component {
    //SECTION FIELDS
    props : {
        app:App,
        ctrl:MainPageController,
        className?: string,
        style?: CSSProperties,
    };

    subscriptions:Subscription[] = [];



    //SECTION LIFE CYCLE
    componentDidMount() {
        updateOn(this.props.ctrl.onContentChanged, this);
        updateOn(this.props.ctrl.onActiveDirChanged, this);
        updateOn(this.props.ctrl.onSymbolMapUpdated, this);
    }

    componentWillUnmount() { unsubscribeAll(this); }


    //SECTION RENDERING
    renderContent(contentCtrl:MainPageContentController) {
        if(!contentCtrl) return null;
        switch(contentCtrl.mode) {
            case MainPageMode.CREATE_SYMBOL:
                return <SymbolCreator ctrl={contentCtrl as SymbolCreatorController}/>;

            case MainPageMode.CREATE_AXIOM:
                return <AxiomCreator ctrl={contentCtrl as AxiomCreatorController} />;

            case MainPageMode.CREATE_THEOREM: return <TheoremCreator
                ctrl={contentCtrl as TheoremCreatorController}
                style={{maxHeight:"30vh"}}
            />;
            
            case MainPageMode.SHOW_PROOF: return <ProofViewer
                ctrl={contentCtrl as ProofViewerController}
                style={{maxHeight:"50vh"}}
            />;
        }

        return null;
    }

    render() {
        return (
            <div className={`MainPage_root ${this.props.className || ""}`} style={this.props.style}>
                {this.renderContent(this.props.ctrl.content)}
                <DirViewerGroup ctrl={this.props.ctrl.dirViewer} style={{flex:1}} />
            </div>
        );
    }
}