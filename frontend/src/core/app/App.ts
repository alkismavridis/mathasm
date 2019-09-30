import GraphQL from "./GraphQL";
import QuickInfoService from "./QuickInfoService";
import AuthService from "./AuthService";
import ModalService from "./ModalService";
import AppRouter from "./AppRouter";

export default class App {
    //region FIELDS
    modals:ModalService;
    graphql:GraphQL;
    quickInfos:QuickInfoService;
    auth:AuthService;
    router:AppRouter;
    //endregion




    //region LIFE CYCLE
    constructor(url:string) {
        this.auth = new AuthService(this);
        this.graphql = new GraphQL(this);
        this.modals = new ModalService(this);
        this.quickInfos = new QuickInfoService(this);
        this.router = new AppRouter(this, url);

        this.auth.postConstruct();
    }
    //endregion




    //region GETTERS
    //endregion



    //region SETTERS
    //endregion
}