import React, {Component} from 'react';
import "./LoginDialog.css";
import LoginForm from "./LoginForm/LoginForm";
import SignInForm from "./SignInForm/SignInForm";
import App from "../../../services/App";


export default class LoginDialog extends Component {
    //region PROPS AND STATE
    props : {
        //data
        app:App,

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
        this.props.app.quickInfoService.makeSuccess(`Hello ${resp.user.userName}. Welcome to MathAsm.`);
        this.props.app.sessionKey = resp.sessionKey;
        if (this.props.onLogin) this.props.onLogin(resp.user);
    }
    //endregion



    //region RENDERING
    render() {
       if (this.state.showSignIn) return  <SignInForm
           app={this.props.app}
           style={{margin:"auto", backgroundColor:"white"}}
           onSuccessfulSignIn={this.handleUserLoggedIn.bind(this)}
           onCancel={() => this.setState({showSignIn:false})}/>;

       else return <LoginForm
           app={this.props.app}
           style={{margin:"auto", backgroundColor:"white"}}
           onNoAccountClicked={() => this.setState({showSignIn:true})}
           onSuccessfulLogin={this.handleUserLoggedIn.bind(this)}/>;
    }

    //endregion
}