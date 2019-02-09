import React, {Component} from 'react';
import "./LoginDialog.css";
import LoginForm from "./LoginForm/LoginForm";
import SignInForm from "./SignInForm/SignInForm";
import App from "../../App/App";
import QuickInfoService from "../../../services/QuickInfoService";


export default class LoginDialog extends Component {
    //region PROPS AND STATE
    props : {
        //data

        //actions
        onLogin?:Function,

        //styling
    };

    state = {
        showSignIn:false
    };
    //endregion




    //region EVENT HANDLERS
    handleUserLoggedIn(resp:any) {
        QuickInfoService.makeSuccess(`Hello ${resp.user.userName}. Welcome to MathAsm.`);
        App.setSessionKey(resp.sessionKey);
        if (this.props.onLogin) this.props.onLogin(resp.user);
    }
    //endregion



    //region RENDERING
    render() {
       if (this.state.showSignIn) return  <SignInForm
           style={{margin:"auto", backgroundColor:"white"}}
           onSuccessfulSignIn={this.handleUserLoggedIn.bind(this)}
           onCancel={() => this.setState({showSignIn:false})}/>;

       else return <LoginForm
           style={{margin:"auto", backgroundColor:"white"}}
           onNoAccountClicked={() => this.setState({showSignIn:true})}
           onSuccessfulLogin={this.handleUserLoggedIn.bind(this)}/>;
    }

    //endregion
}