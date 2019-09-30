import Router from 'url-router';
import App from "./App";
import {Subject} from "rxjs/index";
import PageController from "./pages/PageController";
import MainPageController from "./pages/MainPageController";
import BasicPageController from "./pages/BasicPageController";
import PageType from "../enums/frontend/PageType";
import Constants from "../Constants";
import GraphiqlPageController from "./pages/GraphiqlPageController";



export default class AppRouter {
    //region FIELDS
    private router:Router;
    private _pageController:PageController = new BasicPageController(PageType.NONE);
    readonly onUrlChange = new Subject<AppRouter>();
    //endregion




    //region LIFE CYC:E
    constructor(private app:App, initUrl:string) {
        this.router = new Router([
           ["/pages/main",  data => this.pageController = new MainPageController(this.app)],
           ["/pages/graphiql",  data => this.pageController = new GraphiqlPageController(this.app)],
           ["/pages/vis",  data => this.pageController = new BasicPageController(PageType.DB_VIS)],
           ["/pages/about",  data => this.pageController = new BasicPageController(PageType.ABOUT)],
        ]);

        this.handleUrlChange(initUrl);
    }
    //endregion



    //region GETTERS
    get pageController(): PageController {
        return this._pageController;
    }
    //endregion




    //region ACTIONS
    handleUrlChange(newUrl:string) {
        const route = this.router.find(window.location.pathname);
        if(route==null) this.pageController = new MainPageController(this.app);
        else route.handler(route);
        this.onUrlChange.next(this);
    }

    set pageController(ctrl:PageController) {
        this._pageController = ctrl;
    }
    //endregion



}