import React, {Component, CSSProperties} from 'react';
import "./SignInForm.css";
import GraphQL from "../../../../services/GraphQL";
import ErrorCode from "../../../../enums/ErrorCode";
import ModalHeader from "../../ModalHeader/ModalHeader";
import DomUtils from "../../../../services/DomUtils";



const q = {
  SIGN_IN: `mutation($userName:String!, $password:String!) {
    authWSector {
      signin(username:$userName, password:$password) {
        sessionKey
        user {id, userName}
      }
    }
  }`
};


export default class SignInForm extends Component {
    //region FIELDS
    props : {
        //data

        //actions
        onSuccessfulSignIn: any,
        onCancel: any,

        //styling
        style?:CSSProperties,
    };

    state = {
        userName:"",
        password:"",
        errorCode:null as ErrorCode
    };
    //endregion



    //region LIFE CYCLE
    //componentDidMount() {}
    //static getDerivedStateFromProps(nextProps, prevState) {}
    //shouldComponentUpdate(nextProps, nextState) { return true; }
    //getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    //componentDidUpdate(prevProps, prevState, snapshot) {}
    //componentWillUnmount() {}

    //componentDidCatch(error, info) {
    //    console.error("Exception caught");
    //}
    //endregion


    //region EVENT HANDLERS
    handleFormSubmit(event) {
        event.preventDefault();

        GraphQL.run(q.SIGN_IN, {userName:this.state.userName, password:this.state.password})
            .then(data => {
                if (!data || !data.authWSector || !data.authWSector.signin) return;
                this.props.onSuccessfulSignIn(data.signin);
            })
            .catch(err => this.setState({errorCode:err.code}));
    }
    //endregion


    //region RENDERING
    renderErrorMessage(code:ErrorCode) {
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
                    value={this.state.userName}
                    placeholder={"Username"}
                    onKeyDown={DomUtils.handleEnter(formHandler)}
                    onChange={event => this.setState({userName:event.target.value, errorCode:null})}/>

                <input
                    className="MA_inp SignInForm_inp"
                    type="password"
                    value={this.state.password}
                    placeholder={"Password"}
                    onKeyDown={DomUtils.handleEnter(formHandler)}
                    onChange={event => this.setState({password:event.target.value, errorCode:null})}/>
                {this.state.errorCode==null? null : this.renderErrorMessage(this.state.errorCode)}

                <div
                    className="SignInForm_noAccount"
                    onClick={this.props.onCancel}>
                    I already have an account...
                </div>
            </form>
        );
    }
    //endregion
}
