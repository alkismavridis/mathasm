import React, {Component, CSSProperties} from 'react';
import "./LoginForm.css";
import ErrorCode from "../../../../../core/enums/ErrorCode";
import ModalHeader from "../../ModalHeader/ModalHeader";
import DomUtils from "../../../../../core/utils/DomUtils";
import App from "../../../../../core/app/App";
import LoginDialogState from "../../../../../core/app/modals/LoginDialogState";


class LoginForm extends Component {
    //region FIELDS
    props : {
        data:LoginDialogState,
        style?: CSSProperties,
    };

    _userNameRef = null;
    //endregion


    //region LIFE CYCLE

    componentDidMount() {
        if (this._userNameRef) this._userNameRef.focus();
    }
    //endregion


    //region EVENT HANDLERS
    handleFormSubmit(event) {
        event.preventDefault();
        this.props.data.attemptLogin();
    }
    //endregion


    //region RENDERING
    renderErrorMessage(code:ErrorCode) {
        if(code==null) return null;

        let message = "Failed to log in.";
        switch(code) {
            case ErrorCode.CONNECTION_ERROR: message = "Could not connect to server."; break;
            case ErrorCode.USER_NOT_EXISTS:  message = "Username not found."; break;
            case ErrorCode.WRONG_PASSWORD:  message = "Wrong password."; break;
        }

        return <div className="LoginForm_errorMes">{message}</div>;
    }

    render() {
        const formHandler = this.handleFormSubmit.bind(this);
        return (
            <form onSubmit={formHandler} style={this.props.style} className="LoginForm_root">
                <ModalHeader
                    title="Login"
                    onConfirm={formHandler}/>
                <input
                    ref={el => this._userNameRef = el}
                    className="MA_inp LoginForm_inp"
                    value={this.props.data.userName}
                    placeholder={"Username"}
                    onKeyDown={DomUtils.handleEnter(formHandler)}
                    onChange={event => this.props.data.userName = event.target.value}/>

                <input
                    className="MA_inp LoginForm_inp"
                    type="password"
                    value={this.props.data.password}
                    placeholder={"Password"}
                    onKeyDown={DomUtils.handleEnter(formHandler)}
                    onChange={event => this.props.data.password = event.target.value}/>

                {this.renderErrorMessage(this.props.data.errorCode)}
                <div
                    className="LoginForm_noAccount"
                    onClick={()=>this.props.data.showSignIn=true}>
                    I am new here...
                </div>
            </form>
        );
    }
    //endregion
}

export default LoginForm;