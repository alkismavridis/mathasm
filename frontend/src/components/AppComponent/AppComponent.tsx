import React, {Component} from 'react';
import './AppComponent.scss';


import createHistory from "history/createBrowserHistory";
import Urls from "../../constants/Urls";
import GraphiqlPage from "../Pages/GraphiqlPage/GraphiqlPage";
import DbVisualisationPage from "../Pages/DbVisualisationPage/DbVisualisationPage";
import AboutPage from "../Pages/AboutPage/AboutPage";
import MainPage from "../Pages/MainPage/MainPage";
import ReactNotification from "react-notifications-component";
import {Subscription} from "rxjs";


//font awesome
import {library} from '@fortawesome/fontawesome-svg-core'
import {fas} from '@fortawesome/free-solid-svg-icons'


import "react-notifications-component/dist/theme.css";
import ModalGroup from "../Modals/ModalGroup/ModalGroup";
import User from "../../entities/backend/User";
import App from "../../services/App";

library.add(fas);


/**
 * This is our app class.
 * The App object plays many important roles.
 *
 * 1. It does all the contact with the browser. This means it has access to:
 *      - We get the URL and the query parameters
 *      - Local Storage: State shared by all tabs.
 *      - Session Storage: State for the given tab only.
 *      - Makes http requests.
 *
 *      ONLY THIS OBJECT do those things. Only the App object does them. This is very important.
 *      No other UI component should access those.
 *      ==== It is App and only App ====
 *
 *
 * 2. App is the first thing that will be called when:
 *      - user opens the app for the first time from the current browser.
 *      - user opens the app some time after. Data saved from the first time in LocalStorage are still here. :)
 *      - user opens a new tab.
 *      - user refreshes a page.
 *
 *    So, App must setup variables and initialize stuff.
 *
 *
 * 3. We render the universe.
 *    The user sees whatever we render here, and only what we render here.
 *    This means that this class is the "graphics card" of the application.
 *
 *    At the moment we render:
 *      - A page object, based on the incoming URL.
 *      - A notification list on the right side of the application.
 *      - A list of modal windows (at the moment starting with )
 *
 *      - Ideas for the future:
 *              A theory explorer perhaps on the bottom?
 *              His tabs with currently the working theorems?
 *              A symbol keyboard?
 *              It could go here.
 *
 *
 * 4. Provides an statically available API, for every UI component to use, without having to get it from its parent component.
 *    Just import App and do stuff.
 *
 *    This API includes:
 *      - show notifications to the user. Notifications are good if you want to interact with the user, but not necessarily interrupt him.
 *      - show modals. You can use modals to demand the user's attention, in order to do something. Nice for getting some input and do stuff with it.
 *      - Navigate to an other site.
 *
 *      - Get/set variables in local storage / session storage. We should have cashed for both of those.
 *      - Make http requests.
 *
 *
 * 5. An app instance provides the global state of the application. Both temporary and permanent global state.
 *    It is VERY VERY important that no other global state is saved anywhere in the Application.
 *    Global state is evil and dangerous.
 *    This means that we have to control it. WE control it by putting it and managing it in one place.
 *    Ant this place is App.
 * */
export default class AppComponent extends Component {
    //region FIELDS
    state = {
        location: null,
        user: null as User
    };

    //non-react states
    _notificationDOMRef = null;
    _history = null;

    private app: App;
    private subscriptions: Subscription[] = [];
    //endregion


    //region LIFE CYCLE
    constructor(props) {
        super(props);
        this.app = new App();
    }


    componentDidMount() {
        //STEP Setup the history object
        this._history = createHistory();
        this._history.listen((location, action) => {
            this.setState({location: location});
        });
        this.setState({location: this._history.location});

        //STEP setup subscriptions
        this.subscriptions.push(
            this.app.onNotificationAdded.subscribe(data => {
                if (!this._notificationDOMRef) return;
                this._notificationDOMRef.addNotification(data);
            })
        );

        this.subscriptions.push(
            this.app.onUserChanged.subscribe(()=>this.forceUpdate())
        );

        //STEP Fetch global init data
        this.fetchInitData();
    }

    componentWillUnmount() {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions = [];
    }


    fetchInitData() {
        const initQuery = `{ user { id, userName, rights } }`;

        this.app.graphql.run(initQuery)
            .then(resp => this.app.user = resp.user);
    }

    //endregion


    //region RENDERING
    renderPage() {
        if (this.state.location == null) return null;

        switch (this.state.location.pathname) {
            case Urls.pages.graphiql:
                return <GraphiqlPage app={this.app} key="1"/>;
            case Urls.pages.main:
                return <MainPage key="1" app={this.app}/>;
            case Urls.pages.dbVisualisation:
                return <DbVisualisationPage app={this.app} key="1"/>;
            case Urls.pages.about:
                return <AboutPage key="1"/>;
            default:
                return <MainPage app={this.app} key="1"/>;
        }
    }


    render() {
        return [
            this.renderPage(),
            <ModalGroup key="3" app={this.app}/>,
            <ReactNotification key="2" ref={el => this._notificationDOMRef = el}/>,
        ];
    }

    //endregion
}