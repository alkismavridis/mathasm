import React, {Component, CSSProperties} from 'react';
import "./SymbolCreator.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import ErrorCode from "../../../core/enums/ErrorCode";
import DomUtils from "../../../core/utils/DomUtils";
import App from "../../../core/app/App";
import MathAsmDir from "../../../core/entities/backend/MathAsmDir";
import SymbolCreatorController from "../../../core/app/pages/main_page/content/SymbolCreatorController";
import {unsubscribeAll, updateOn} from "../../utils/SubscriptionUtils";
import {Subscription} from "rxjs";




class SymbolCreator extends Component {
    //region FIELDS
    props : {
        ctrl:SymbolCreatorController,
        style?: CSSProperties,
    };

    subscriptions:Subscription[] = [];
    //endregion


    //region LIFE CYCLE
    componentDidMount(): void {
        updateOn(this.props.ctrl.onChange, this);
    }

    componentWillUnmount(): void { unsubscribeAll(this); }
    //endregion


    //region RENDERING
    render() {
        return (
            <div className="SymbolCreator_root" style={this.props.style}>
                <div>New Symbol:</div>
                <input
                    value={this.props.ctrl.text}
                    placeholder="Symbol text"
                    style={{marginBottom:"8px"}}
                    onKeyDown={DomUtils.handleEnter(()=>this.props.ctrl.submitSymbol())}
                    onChange={e => this.props.ctrl.text = e.target.value}
                    className="MA_inp MA_block"/>
                <input
                    value={this.props.ctrl.uid}
                    type="number"
                    placeholder="Symbol Id"
                    style={{marginBottom:"8px"}}
                    onChange={e => this.props.ctrl.uid = e.target.value}
                    onKeyDown={DomUtils.handleEnter(()=>this.props.ctrl.submitSymbol())}
                    className="MA_inp MA_block" />
                <div style={{marginBottom:"8px"}}>{this.props.ctrl.isLoading
                    ? <FontAwesomeIcon icon="spinner" spin={true}/>
                    : <button onClick={()=>this.props.ctrl.submitSymbol()} className="MA_but MA_block">Save</button>
                }</div>
            </div>
        );
    }

    //endregion
}

export default SymbolCreator;