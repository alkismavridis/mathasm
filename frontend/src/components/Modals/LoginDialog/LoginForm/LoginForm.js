import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./LoginForm.css";
import GraphQL from "../../../../services/GraphQL";
import ErrorCode from "../../../../enums/ErrorCode";
import ModalHeader from "../../ModalHeader/ModalHeader";
import DomUtils from "../../../../services/DomUtils";



const q = {
    LOGIN: `mutation($userName:String!, $password:String!) {
        authWSector{
            login(username:$userName, password:$password) {
                sessionKey
                user {id, userName}
            }
        }
        
    }`
};


class LoginForm extends Component {
    static propTypes = {
        //data

        //actions
        onSuccessfulLogin: PropTypes.func.isRequired,
        onNoAccountClicked: PropTypes.func.isRequired,

        //styling
        style: PropTypes.object,
    };


    //region LIFE CYCLE
    _userNameRef = null;
    constructor(props) {
        super(props);
        this.state = {
            userName:"",
            password:"",
            errorCode:null,
        };
    }

    componentDidMount() {
        if (this._userNameRef) this._userNameRef.focus();
    }

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

        GraphQL.run(q.LOGIN, {userName:this.state.userName, password:this.state.password})
            .then(mutation => {
                let login;
                try {
                    login = mutation.authWSector.login;
                    if(!login) return;
                }
                catch(e) { return; }

                this.props.onSuccessfulLogin(login);
            })
            .catch(err => {
                console.log(err);
                this.setState({errorCode:err.code || ErrorCode.UNKNOWN})
            });
    }
    //endregion


    //region RENDERING
    renderErrorMessage(code) {
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
                    className="Globals_inp LoginForm_inp"
                    value={this.state.userName}
                    placeholder={"Username"}
                    onKeyDown={DomUtils.handleEnter(formHandler)}
                    onChange={event => this.setState({userName:event.target.value, errorCode:null})}/>

                <input
                    className="Globals_inp LoginForm_inp"
                    type="password"
                    value={this.state.password}
                    placeholder={"Password"}
                    onKeyDown={DomUtils.handleEnter(formHandler)}
                    onChange={event => this.setState({password:event.target.value, errorCode:null})}/>

                {this.state.errorCode==null? null : this.renderErrorMessage(this.state.errorCode)}
                <div
                    className="LoginForm_noAccount"
                    onClick={this.props.onNoAccountClicked}>
                    I am new here...
                </div>
            </form>
        );
    }
    //endregion
}

export default LoginForm;