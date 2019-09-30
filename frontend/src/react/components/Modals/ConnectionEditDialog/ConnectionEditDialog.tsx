import React, {Component} from 'react';
import "./ConnectionEditDialog.scss";
import ModalHeader from "../ModalHeader/ModalHeader";
import DomUtils from "../../../../core/utils/DomUtils";
import Checkbox from "../../ReusableComponents/Inputs/Checkbox/Checkbox";
import ConnectionEditController from "../../../../core/app/modals/ConnectionEditController";
import {unsubscribeAll, updateOn} from "../../../utils/SubscriptionUtils";
import {Subscription} from "rxjs/index";

export default class ConnectionEditDialog extends Component {
    //region FIELDS
    props : {
        ctrl:ConnectionEditController,
    };
    _inpRef = null;

    subscriptions:Subscription[] = [];
    //endregion



    //region LIFE CYCLE
    componentDidMount() {
        if (this._inpRef) this._inpRef.focus();
        updateOn(this.props.ctrl.onChange, this);
    }

    componentWillUnmount() { unsubscribeAll(this); }
    //endregion



    //region RENDERING
    render() {
        const handler = this.props.ctrl.submit.bind(this.props.ctrl);
        return (
            <div className="MA_window" style={{padding:"8px"}}>
                <ModalHeader title="Connection" onConfirm={handler}/>
                <input
                    type="number"
                    ref={el => this._inpRef = el}
                    className="MA_inp"
                    placeholder={"Please enter the grade..."}
                    onKeyDown={DomUtils.handleEnter(handler)}
                    value={this.props.ctrl.grade}
                    onChange={e => this.props.ctrl.grade = e.target.value}/>

                <Checkbox
                    style={{marginTop:"8px"}}
                    checked={this.props.ctrl.isBidirectional}
                    label={<div>Bidirectional</div>}
                    onChange={e => this.props.ctrl.isBidirectional = e.target.checked}/>
            </div>
        );
    }

    //endregion
}