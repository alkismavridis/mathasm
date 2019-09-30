import React, {Component} from 'react';
import App from "../../../core/app/App";
import {Subscription} from "rxjs/index";
import ReactNotification from "react-notifications-component";
import {reactOn, unsubscribeAll} from "../../utils/SubscriptionUtils";
import QuickInfoData from "../../../core/entities/frontend/QuickInfoData";
import QuickInfoType from "../../../core/enums/frontend/QuickInfoType";



const DEFAULT_NOTIFICATION_OPTIONS = {
    type: "success",        //success, danger, default, info, warning, custom
    insert: "top",
    container: "top-right",
    dismiss: { duration: 6000 },
    dismissable: { click: true },
    slidingExit:{duration:100, delay:0},
    slidingEnter:{duration:100, delay:0}
};


export default class QuickInfos extends Component {
    //region FIELDS
    props: {
        app:App,
    };

    state = {};

    subscriptions:Subscription[] = [];
    _notificationDOMRef = null;
    //endregion


    //region LIFE CYCLE
    // constructor(props) { super(props); }
    componentDidMount() {
        reactOn(this.props.app.quickInfos.onNotificationAdded, this, (data:QuickInfoData) => {
            if (!this._notificationDOMRef) return;

            const not = Object.assign({}, DEFAULT_NOTIFICATION_OPTIONS) as any;
            not.title = data.title;
            not.message = data.message;
            not.type = this.getNameFor(data.type);

            this._notificationDOMRef.addNotification(not);
        });
    }
    componentWillUnmount() { unsubscribeAll(this); }
    //endregion


    //region GETTERS
    getNameFor(t:QuickInfoType) {
        switch (t) {
            case QuickInfoType.INFO: return "info";
            case QuickInfoType.SUCCESS: return "success";
            case QuickInfoType.WARNING: return "warning";
            case QuickInfoType.ERROR: return "danger";
        }
    }
    //endregion


    //region RENDERING
    render() {
        return <ReactNotification ref={el => this._notificationDOMRef = el}/>
    }
    //endregion
}