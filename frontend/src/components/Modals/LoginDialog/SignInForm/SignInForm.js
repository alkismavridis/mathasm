import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./SignInForm.css";
import GraphQL from "../../../../services/GraphQL";
import ErrorCode from "../../../../constants/ErrorCode";
import ModalHeader from "../../ModalHeader/ModalHeader";
import DomUtils from "../../../../services/DomUtils";



const q = {
    SIGN_IN: `mutation($userName:String!, $password:String!) {
        signin(username:$userName, password:$password) {
            sessionKey
            user {id, userName}
        }
    }`
};


export default class SignInForm extends Component {
    static propTypes = {
        //data

        //actions
        onSuccessfulSignIn: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,

        //styling
        style:PropTypes.object,
    };

    static defaultProps = {};


    //region LIFE CYCLE
    constructor(props) {
        super(props);
        this.state = {
            userName:"",
            password:"",
            errorCode:null,
        };
    }

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
                if (!data || !data.signin) return;
                this.props.onSuccessfulSignIn(data.signin);
            })
            .catch(err => this.setState({errorCode:err.code}));
    }
    //endregion


    //region RENDERING
    renderErrorMessage(code) {
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
                    className="Globals_inp SignInForm_inp"
                    value={this.state.userName}
                    placeholder={"Username"}
                    onKeyDown={DomUtils.handleEnter(formHandler)}
                    onChange={event => this.setState({userName:event.target.value, errorCode:null})}/>

                <input
                    className="Globals_inp SignInForm_inp"
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
