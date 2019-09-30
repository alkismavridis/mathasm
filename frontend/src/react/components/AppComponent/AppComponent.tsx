import React, {Component} from 'react';
import './AppComponent.scss';


import createHistory from "history/createBrowserHistory";
import GraphiqlPage from "../Pages/GraphiqlPage/GraphiqlPage";
import DbVisualisationPage from "../Pages/DbVisualisationPage/DbVisualisationPage";
import MainPage from "../Pages/MainPage/MainPage";
import AboutPage from "../Pages/AboutPage/AboutPage";
import {Subscription} from "rxjs";


//font awesome
import {library} from '@fortawesome/fontawesome-svg-core'
import {fas} from '@fortawesome/free-solid-svg-icons'


import "react-notifications-component/dist/theme.css";
import ModalGroup from "../Modals/ModalGroup/ModalGroup";
import User from "../../../core/entities/backend/User";
import App from "../../../core/app/App";
import {unsubscribeAll, updateOn} from "../../utils/SubscriptionUtils";
import QuickInfos from "../QuickInfos/QuickInfos";
import PageType from "../../../core/enums/frontend/PageType";
import GlobalHeader from "../GlobalHeader/GlobalHeader";
import GraphiqlPageController from "../../../core/app/pages/GraphiqlPageController";
import MainPageController from "../../../core/app/pages/MainPageController";

library.add(fas);

export default class AppComponent extends Component {
    //region FIELDS
    _history = null;

    private app= new App(window.location.href);
    subscriptions: Subscription[] = [];
    //endregion


    //region LIFE CYCLE
    constructor(props) {
        super(props);
    }


    componentDidMount() {
        //STEP Setup the history object
        this._history = createHistory();
        this._history.listen((location, action) => {
            console.log("ROUTE CHANGED!", location);
        });

        //STEP setup subscriptions
        updateOn(this.app.auth.onUserChanged, this);
    }

    componentWillUnmount() {
        unsubscribeAll(this);
    }


    //endregion


    //region RENDERING
    renderPage() {
        switch(this.app.router.pageController.type) {
            case PageType.MAIN: return <MainPage app={this.app} ctrl={this.app.router.pageController as MainPageController}/>;
            case PageType.ABOUT: return <AboutPage />;
            case PageType.GRAPHIQL: return <GraphiqlPage ctrl={this.app.router.pageController as GraphiqlPageController}/>;
            case PageType.DB_VIS: return <DbVisualisationPage app={this.app}/>;
        }
    }


    render() {
        return [
            <GlobalHeader app={this.app} className="AppComponent_header" key="1"/>,
            <div key="2" className="AppComponent_main">
                {this.renderPage()}
            </div>,
            <ModalGroup key="3" app={this.app}/>,
            <QuickInfos key="4" app={this.app}/>
        ];
    }

    //endregion
}