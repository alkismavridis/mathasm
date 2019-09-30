import React, {Component} from 'react';
import "./StringInputDialog.css";
import ModalHeader from "../ModalHeader/ModalHeader";
import DomUtils from "../../../../core/utils/DomUtils";
import TextGetterState from "../../../../core/app/modals/TextGetterState";
import {unsubscribeAll, updateOn} from "../../../utils/SubscriptionUtils";
import {Subscription} from "rxjs/index";




export default class StringInputDialog extends Component {
    //region STATIC
    props : {
        data:TextGetterState,
    };

    subscriptions:Subscription[] = [];
    _inpRef = null;
    //endregion



    //region LIFE CYCLE
    componentDidMount() {
        updateOn(this.props.data.onChange, this);
        if (this._inpRef) this._inpRef.focus();
    }

    componentWillUnmount() {
        unsubscribeAll(this);
    }
    //endregion




    //region RENDERING
    render() {
        return (
            <div className="MA_window StringInputDialog_root">
                <ModalHeader
                    title={this.props.data.title}
                    onConfirm={()=>this.props.data.submit()}/>

                <input
                    ref={el => this._inpRef = el}
                    className="MA_inp"
                    placeholder={this.props.data.placeholder}
                    onKeyDown={DomUtils.handleEnter(()=>this.props.data.submit())}
                    value={this.props.data.value}
                    onChange={e => this.props.data.value = e.target.value}/>
            </div>
        );
    }
    //endregion
}