import React, {Component, CSSProperties} from 'react';
import "./SignInForm.css";
import ErrorCode from "../../../../../core/enums/ErrorCode";
import ModalHeader from "../../ModalHeader/ModalHeader";
import DomUtils from "../../../../../core/utils/DomUtils";
import App from "../../../../../core/app/App";
import LoginDialogState from "../../../../../core/app/modals/LoginDialogState";






export default class SignInForm extends Component {
    //region FIELDS
    props : {
        data:LoginDialogState,
        style?:CSSProperties,
    };
    //endregion



    //region EVENT HANDLERS
    handleFormSubmit(event) {
        event.preventDefault();
        this.props.data.attemptSignin();
    }
    //endregion


    //region RENDERING
    renderErrorMessage(code:ErrorCode) {
        if(code==null) return null;

        let message = "Error while creating user.";
        switch(code) {
            case ErrorCode.CONNECTION_ERROR: message = "Could not connect to server."; break;
            case ErrorCode.USER_ALREADY_EXISTS:  message = "This Username is already used by an other user."; break;
        }

        return <div className="SignInForm_errorMes">{message}</div>;
    }


    render() {
        const formHandler = this.handleFormSubmit.bind(this);
        return (
            <form onSubmit={formHandler} style={this.props.style} className="SignInForm_root">
                <ModalHeader
                    title="Sign in"
                    onConfirm={formHandler}/>

                <input
                    className="MA_inp SignInForm_inp"
                    value={this.props.data.userName}
                    placeholder={"Username"}
                    onKeyDown={DomUtils.handleEnter(formHandler)}
                    onChange={event => this.props.data.userName = event.target.value}/>

                <input
                    className="MA_inp SignInForm_inp"
                    type="password"
                    value={this.props.data.password}
                    placeholder={"Password"}
                    onKeyDown={DomUtils.handleEnter(formHandler)}
                    onChange={event => this.props.data.password = event.target.value}/>
                {this.renderErrorMessage(this.props.data.errorCode)}

                <div
                    className="SignInForm_hasAccount"
                    onClick={()=>this.props.data.showSignIn=false}>
                    I already have an account...
                </div>
            </form>
        );
    }
    //endregion
}
