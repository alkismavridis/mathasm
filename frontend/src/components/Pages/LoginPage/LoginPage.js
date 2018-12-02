import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./LoginPage.css";
import GraphQL from "../../../services/GraphQL";
import Urls from "../../../constants/Urls";
import SessionService from "../../../services/SessionService";
import LoginForm from "./LoginForm/LoginForm";
import SignInForm from "./SignInForm/SignInForm";



const q = {
    LOGIN: `mutation($userName:String!, $password:String!) {
        login(username:$userName, password:$password) {
            sessionKey
            user {id, userName}
        }
    }`
};

class LoginPage extends Component {
    //region PROPS AND STATE
    static propTypes = {
        //data
        history:PropTypes.object.isRequired,

        //actions

        //styling
    };

    static defaultProps = {};


    state = {
        userName:"",
        password:"",
        showSignIn:false
    };
    //endregion



    //region LIFE CYCLE



    // componentDidMount() {}
    // componentDidUpdate(prevProps, prevState, snapshot) {}
    //static getDerivedStateFromProps(nextProps, prevState) {}
    //shouldComponentUpdate(nextProps, nextState) { return true; }
    //getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    //componentWillUnmount() {}

    //componentDidCatch(error, info) {
    //    console.error("Exception caught");
    //}

    //endregion


    //region EVENT HANDLERS
    handleUserLoggedIn(resp) {
        SessionService.setSessionKey(resp.sessionKey);
        this.props.history.push(Urls.pages.dbVisualisation);
    }
    //endregion


    //region RENDERING
    renderForm() {
        if (this.state.showSignIn) return  <SignInForm
                style={{margin:"auto"}}
                onSuccessfulSignIn={this.handleUserLoggedIn.bind(this)}
                onCancel={() => this.setState({showSignIn:false})}/>;

        else return <LoginForm
                style={{margin:"auto"}}
                onSuccessfulLogin={this.handleUserLoggedIn.bind(this)}
                onNoAccountClicked={() => this.setState({showSignIn:true})}/>;
    }


    render() {
        return (
            <div className="Globals_page">
                <div className="Globals_pageMainContent" style={{display: "flex"}}>
                    {this.renderForm()}
                </div>
            </div>
        );
    }

    //endregion
}

export default LoginPage;