import React, { Component } from 'react';
import './App.css';
import logo from '../../img/logo.svg';

import createHistory from "history/createBrowserHistory";
import NotFoundPage from "../Pages/NotFoundPage/NotFoundPage";
import Urls from "../../constants/Urls";
import GraphiqlPage from "../Pages/GraphiqlPage/GraphiqlPage";
import LoginPage from "../Pages/LoginPage/LoginPage";
import SessionService from "../../services/SessionService";
import DbVisualisationPage from "../Pages/DbVisualisationPage/DbVisualisationPage";
import AboutPage from "../Pages/AboutPage/AboutPage";


export default class App extends Component {
  //region FIELDS
    _history = null;

    state = {
        location:null
    };
  //endregion



  //region LIFE CYCLE
  componentDidMount() {
    //1. Setup the history object
    this._history = createHistory();

    //2. Setup a listener to react to url changes...
    this._history.listen((location, action) => {
        // location is an object like window.location
        this.setState({location:location});
    });

    //3. Set the current url into the state.
    this.setState({location:this._history.location});

    //4. Load session storage
    SessionService.initialize();
  }
  //endregion



  render() {
    if (this.state.location==null) return null;

    switch (this.state.location.pathname) {
        case Urls.pages.graphiql: return <GraphiqlPage history={this._history}/>;
        case Urls.pages.login: return <LoginPage history={this._history}/>;
        case Urls.pages.theory: return <div>Theory page!!</div>;
        case Urls.pages.dbVisualisation: return <DbVisualisationPage history={this._history}/>;
        case Urls.pages.about: return <AboutPage history={this._history}/>;
        default: return <NotFoundPage history={this._history}/>;
    }

   /* return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p onClick={ () => this._history.push("/graphiql/hello", {foo:123})}>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );*/
  }
}