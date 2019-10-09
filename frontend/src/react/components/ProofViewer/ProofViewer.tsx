import React, {Component, CSSProperties} from 'react';
import "./ProofViewer.scss";
import cx from 'classnames';

import SelectionType from "../../../core/enums/SelectionType";
import StatementSide from "../../../core/enums/StatementSide";
import MathAsmDir from "../../../core/entities/backend/MathAsmDir";
import SentenceMatch from "../../../core/entities/frontend/SentenceMatch";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import ProofStepsViewer from "../ReusableComponents/ProofStepsViewer/ProofStepsViewer";
import Statement from "../ReusableComponents/Statement/Statement";
import MathAsmStatement from "../../../core/entities/backend/MathAsmStatement";
import ProofPlayer from "../../../core/entities/frontend/ProofPlayer";
import {SymbolRangeUtils} from "../../../core/utils/SymbolRangeUtils";
import q from "./ProofViewer.graphql";
import App from "../../../core/app/App";
import MainPageController from "../../../core/app/pages/main_page/MainPageController";
import MathAsmSymbol from "../../../core/entities/backend/MathAsmSymbol";
import ProofViewerController from "../../../core/app/pages/main_page/content/ProofViewerController";
import {unsubscribeAll, updateOn} from "../../utils/SubscriptionUtils";
import {Subscription} from "rxjs";



class ProofViewer extends Component {
    //SECTION FIELDS
    props : {
        ctrl:ProofViewerController,
        style?: CSSProperties,
        className?: string,
    };

    _rootRef = null;
    subscriptions:Subscription[] = [];


    //SECTION LIFE CYCLE
    componentDidMount() {
        updateOn(this.props.ctrl.onChange, this);
    }

    componentWillUnmount() {
        unsubscribeAll(this);
    }


    //SECTION EVENT HANDLERS
    /** The user could interact with this component with the keyboard too. Here are the controls: */
    handleKeyPress(e:KeyboardEvent) {
        switch (e.keyCode) {
            case 38: //arrow up
                this.props.ctrl.goToPrevMove();
                break;

            case 40: //arrow down
                this.props.ctrl.goToNextMove();
                break;
        }
    }


    //SECTION RENDERING
    renderTarget(target:MathAsmStatement, index:number) {
        if (!target) return <div>Empty target</div>;

        const player = this.props.ctrl.player;
        const isSelected = player.selectedTargetIndex===index;
        return <div key={index} className="MA_flexStartDown">
            <div
                className="MA_textBut"
                title="Replace (enter)"
                style={{
                    width: "16px",
                    height: "16px",
                    color:isSelected? "#001fff" : "#001fff73",
                    backgroundColor:"transparent",
                    marginRight:"8px"
                }}>
                <FontAwesomeIcon icon="angle-right"/>
            </div>
            <Statement
                symbolMap={this.props.ctrl.symbolMap}
                statement={target}
                leftMatches={isSelected? player.leftMatches : null}
                rightMatches={isSelected? player.rightMatches : null}
                matchLength={isSelected? player.getBaseSentenceLength() : 0}/>
        </div>;
    }

    renderBase() {
        const player = this.props.ctrl.player;

        return <div className="ProofViewer_base">
            <div>{player.base?
                "Base for next move: "+MathAsmStatement.getDisplayName(player.base) :
                "No base selected..."
            }</div>
            {player.base && <Statement symbolMap={this.props.ctrl.symbolMap} statement={player.base} side={player.baseSide}/>}
        </div>;
    }

    render() {
        return (
            <div
                className={cx("ProofViewer_root", this.props.className)}
                style={this.props.style}
                onKeyUp={(e:any)=>this.handleKeyPress(e)}
                ref={el => this._rootRef = el}
                tabIndex={0}>
                <ProofStepsViewer
                    proofPlayer={this.props.ctrl.player}
                    onNavigateAction={index => this.props.ctrl.goToMove(index)}/>
                <div className="ProofViewer_main">
                    {this.renderBase()}
                    <div>
                        {this.props.ctrl.player.targets.map((t,index) => this.renderTarget(t, index))}
                    </div>
                </div>
            </div>
        );
    }
}

export default ProofViewer;