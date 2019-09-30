import React, {Component} from 'react';
import "./LoginDialog.css";
import LoginForm from "./LoginForm/LoginForm";
import SignInForm from "./SignInForm/SignInForm";
import App from "../../../../core/app/App";
import LoginDialogState from "../../../../core/app/modals/LoginDialogState";
import {unsubscribeAll, updateOn} from "../../../utils/SubscriptionUtils";
import {Subscription} from "rxjs/index";


export default class LoginDialog extends Component {
    //region PROPS AND STATE
    props : {
        //data
        data:LoginDialogState,
    };

    subscriptions:Subscription[] = [];
    //endregion




    //region LIFE CYCLE
    componentDidMount() {
        updateOn(this.props.data.onChange, this);
    }

    componentWillUnmount() {
        unsubscribeAll(this);
    }
    //endregion



    //region RENDERING
    render() {
       if (this.props.data.showSignIn) return <SignInForm
           data={this.props.data}
           style={{margin:"auto", backgroundColor:"white"}}/>;

       else return <LoginForm
           data={this.props.data}
           style={{margin:"auto", backgroundColor:"white"}}/>;
    }

    //endregion
}