import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./LoginPage.css";
import GraphQL from "../../../services/GraphQL";
import Urls from "../../../constants/Urls";
import SessionService from "../../../services/SessionService";



const q = {
    LOGIN: `mutation($userName:String!, $password:String!) {
        login(username:$userName, password:$password) {
            sessionKey
            user {id, userName}
        }
    }`
}

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
    handleFormSubmit(event) {
        event.preventDefault();

        GraphQL.run("", q.LOGIN, {userName:this.state.userName, password:this.state.password})
            .then(response => {
                if (!response.data || !response.data.login.sessionKey) return;

                SessionService.setSessionKey(response.data.login.sessionKey);
                this.props.history.push(Urls.pages.dbVisualisation);
            });
    }
    //endregion


    //region RENDERING
    renderForm() {
        return (
            <form onSubmit={this.handleFormSubmit.bind(this)}>
                <input
                    value={this.state.userName}
                    placeholder={"Username"}
                    onChange={event => this.setState({userName:event.target.value})}/>

                <input
                    type="password"
                    value={this.state.password}
                    placeholder={"Password"}
                    onChange={event => this.setState({password:event.target.value})}/>

                <button onClick={this.handleFormSubmit.bind(this)}>Submit</button>
            </form>
        );
    }


    render() {
        return (
            <div className="Globals_page">
                <div className="Globals_pageMainContent">
                    hello from LoginPage
                    {this.renderForm()}
                </div>
            </div>
        );
    }

    //endregion
}

export default LoginPage;