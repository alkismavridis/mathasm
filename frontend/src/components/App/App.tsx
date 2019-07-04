import React, { Component } from 'react';
import './App.css';


import createHistory from "history/createBrowserHistory";
import NotFoundPage from "../Pages/NotFoundPage/NotFoundPage";
import Urls from "../../constants/Urls";
import GraphiqlPage from "../Pages/GraphiqlPage/GraphiqlPage";
import DbVisualisationPage from "../Pages/DbVisualisationPage/DbVisualisationPage";
import AboutPage from "../Pages/AboutPage/AboutPage";
import MainPage from "../Pages/MainPage/MainPage";
import ReactNotification from "react-notifications-component";


//font awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'


import "react-notifications-component/dist/theme.css";
import ModalGroup from "../Modals/ModalGroup/ModalGroup";
import GraphQL from "../../services/GraphQL";
import User from "../../entities/backend/User";
import {AppNode} from "../../entities/frontend/AppNode";
import {AppEvent} from "../../entities/frontend/AppEvent";
import AppNodeReaction from "../../enums/AppNodeReaction";

library.add(fas);

/** The app singleton. */
let instance;



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
export default class App extends Component implements AppNode {
  //region FIELDS
    state = {
        location:null,
        user:null as User
    };


    //storage caches
    _localStorageCache = {
        sessionKey: undefined as string,
    };
    _sessionStorageCache = {};

    //non-react states
    _notificationDOMRef = null;
    _modalGroupRef = null;
    _history = null;
    _eventListeners = [];

    _children = {};
  //endregion



  //region LIFE CYCLE
  componentDidMount() {
      instance = this;

    //1. Setup the history object
    this._history = createHistory();

    //2. Setup a listener to react to url changes...
    this._history.listen((location, action) => {
        // location is an object like window.location
        this.setState({location:location});
    });

    //3. Set the current url into the state.
    this.setState({location:this._history.location});

    //4. Load local storage and session storage
    this._localStorageCache.sessionKey =  window.localStorage.getItem("sessionKey");

    //5. Fetch global init data
      this.fetchInitData();
  }


  fetchInitData() {
      const initQuery = `{
        user { id, userName, rights }
      }`;

      GraphQL.run(initQuery)
          .then(resp => this.setState({user:resp.user}));
  }
  //endregion




    //region NOTIFICATIONS
    static getNotificationGroup() {
        return instance._notificationDOMRef;
    }
    //endregion



    //region GLOBAL STATE INTERACTION
    static getSessionKey() {
      if (instance._localStorageCache.sessionKey === undefined) {
          instance._localStorageCache.sessionKey = window.localStorage.getItem("sessionKey") || null;
      }
      return instance._localStorageCache.sessionKey;
    }

    static setSessionKey(key) {
        if (!key) {
            delete instance._localStorageCache.sessionKey;
            window.localStorage.removeItem("sessionKey")
        }
        else {
            instance._localStorageCache.sessionKey = key;
            window.localStorage.setItem("sessionKey", key)
        }
    }

    static setUser(user) {
      instance.setState({user:user});
    }

    static getEventListeners() { return instance._eventListeners; }
    static setEventListeners(newlist) { instance._eventListeners = newlist; }
    //endregion




    //region MODALS
    static getModalGroup() { return instance._modalGroupRef; }
    //endregion




    //region APP NODE
    getChildMap(): any {
        return this._children;
    }

    getParent(): AppNode {
        return null;
    }

    handleChildEvent(event: AppEvent) : AppNodeReaction {
      return AppNodeReaction.BOTH;
    }

    handleParentEvent(event: AppEvent) : AppNodeReaction {
        //there is no parent. This should be never called
        console.error("app.handleParentEvent was called. THis is for sure an error. app has no parent.", event);
        return AppNodeReaction.NONE;
    }
    //endregion



    //region RENDERING
    renderPage() {
        if (this.state.location==null) return null;

        switch (this.state.location.pathname) {
            case Urls.pages.graphiql: return <GraphiqlPage key="1"/>;
            case Urls.pages.theory: return <div key="1">Theory page!!</div>;
            case Urls.pages.main: return <MainPage parent={this} key="1" user={this.state.user}/>;
            case Urls.pages.dbVisualisation: return <DbVisualisationPage key="1"/>;
            case Urls.pages.about: return <AboutPage key="1"/>;
            default: return <MainPage parent={this} user={this.state.user} key="1"/>;
        }
    }


    render() {
        return [
          this.renderPage(),
          <ModalGroup key="3" ref={el => this._modalGroupRef = el} />,
          <ReactNotification key="2" ref={el => this._notificationDOMRef = el}/>,
        ];
    }
    //endregion
}
//
//
//
// class Concept {
//     name:string;
//     notes:string;
//     layer:number;
//
//     isDirectlyStateful:boolean;
//     isIndirectlyStateful:boolean;
//
//
//     haveBusinessLogic:boolean;
//     canAccessServices:boolean;
// }
//
//
//
// const arch:Concept[] = [
//     {
//         name:"FooEntity",
//         layer:1,
//         isDirectlyStateful:true,        //entities are definatelly state holders
//         isIndirectlyStateful:true,
//         haveBusinessLogic:true,         //not sure if this should be true, to be honnest...
//         canAccessServices:false,        //Only in its util functions!
//
//         notes:`
//             private setters and immutable sub-fields, including lists and maps.
//             All have an update function that accept the.
//
//             UTIL read-only functions that accept the App object would be useful and elegant semantically.
//
//         `,
//     },
//     {
//         name:"FooService",
//         layer:1,
//         isDirectlyStateful:true,            //some include DB+cache, some only DB. In any case, they have state.
//         isIndirectlyStateful:true,
//         haveBusinessLogic: true,     //most of it goes here.
//
//         notes:`
//             They Implement big part of the business logic.
//             Have getter operations that implement THE AUTHORIZATION.
//             Have setter operations that implement THE VALIDATION AND THE AUTHORIZATION.
//             Save new entity. Update entity (all sorts of change functions eill be listed)/
//
//         `,
//         canAccessServices:false, //only itself! Code that involves many services go to LAYER 2. (this is precisely why layer 2 exists)
//     },
//     {
//         name:"App",
//         layer:2,
//         isDirectlyStateful:false,
//         isIndirectlyStateful:true,
//         haveBusinessLogic:true,         //Yes. a LOT of business logic goes here.
//         canAccessServices:true,
//         notes:`
//             The only one to access services.
//         `,
//     },
//
//     {
//         name:"FooGetRestController",
//         layer:3,
//         isDirectlyStateful:false,
//         isIndirectlyStateful:true,
//         haveBusinessLogic:false, //FOR ZEUS SHAKE! NO BUSINESS LOGIC HERE!!!
//         canAccessServices:false, //WE ARE ON LAYER 3. WE ONLY ACCESS LAYER 2 STUFF, NEVER LAYER 1.
//         notes:`
//             Very small in code.
//             Accepts a few parameters.
//             DO NOT OVER-GENERALIZE you can write many, because they are so small.
//             No exception handling! Free to throw Exceptions!
//
//
//             It gets / requires the userAccessKey. (1 line of code)
//             Fetches some result from the app (1 line of code: probably calling some layer-2 function)
//             Serializes a response (1 line of code - Use global util functions, for example).
//             Total: 3 lines of code.
//
//             IMPORTANT: They should be very small and easy-to-understand!!!!
//             IMPORTANT: no business logic!!!
//         `,
//     },
//
//     {
//         name:"FooUpdateRestController",
//         layer:3,
//         isDirectlyStateful:false,
//         isIndirectlyStateful:true,
//         haveBusinessLogic:true,
//         canAccessServices:true,
//         notes:`
//             Very small in code.
//             Accepts a few parameters.
//             DO NOT OVER-GENERALIZE you can write many, because they are so small.
//             No exception handling! Free to throw Exceptions!
//
//
//             It requires the userAccessKey. (1 line of code)
//             Fetches some result from the app (1 line of code: probably calling some layer-2 function)
//             Serializes a response (1 line of code - Use global util functions, for example).
//             Total: 3 lines of code.
//
//             IMPORTANT: They should be very small and easy-to-understand!!!!
//             IMPORTANT: no business logic!!!
//         `,
//     },
//
//     {
//         name:"FooView",
//         layer:3,
//         isDirectlyStateful:false, //Those are temporary objects. They are created on the fly and garbage collected just after that...
//         isIndirectlyStateful:false,
//         haveBusinessLogic:true,        //IT MUST BE VERY LIMITED: THEY DO NOT IMPLEMENT BUSINESS LOGIC, THEY JUST CALL FUNCTIONS WHO DO. For example, filter a list using an userAccessKey.
//         canAccessServices:false,       //Layer 2 stuff only.
//         notes:`
//             Very small in code.
//             Accepts a few parameters.
//             DO NOT OVER-GENERALIZE you can write many, because they are so small.
//             No exception handling! Free to throw Exceptions!
//
//
//             It requires the userAccessKey. (1 line of code)
//             Fetches some result from the app (1 line of code: probably calling some layer-2 function)
//             Serializes a response (1 line of code - Use global util functions, for example).
//             Total: 3 lines of code.
//
//             IMPORTANT: They should be very small and easy-to-understand!!!!
//             IMPORTANT: no business logic!!!
//         `,
//
//     },
//     {
//         name:"FooCreationView",
//         layer:1,
//         isDirectlyStateful:false,      //Those are temporary objects. They are created on the fly and garbage collected just after that...
//         isIndirectlyStateful:false,
//         haveBusinessLogic:false,       //No code here. Fields only.
//         canAccessServices:false,       //No code here. Fields only.
//         notes:`
//             Almost no code.
//             The actual job is done in some Layer 2 function
//         `,
//     },
//     {
//         name:"FooUpdateView",
//         layer:1,
//         isDirectlyStateful:false,      //Those are temporary objects. They are created on the fly and garbage collected just after that...
//         isIndirectlyStateful:false,
//         haveBusinessLogic:false,       //No code here. Fields only.
//         canAccessServices:false,       //No code here. Fields only.
//         notes:`
//             Almost no code.
//             The actual job is done in some Layer 2 function
//         `,
//     },
// ];