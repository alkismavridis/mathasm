import Urls from "../constants/Urls";
import ErrorCode from "../enums/ErrorCode";
import App from "../components/App/App";
import QuickInfoService from "./QuickInfoService";
import ModalService from "./ModalService";
import LoginDialog from "../components/Modals/LoginDialog/LoginDialog";
import GraphqlError from "../entities/frontend/GraphqlError";



export default class GraphQL {
    //region HTTP RESPONSE GLOBAL HANDLING
    /**
     * Global response handler for the frontend app.
     * Every response from the server will path though this method.
     * This method will decide if the response is successful or if an error has happened.
     *
     * - If the request was successful, the response.data will be passed on to the caller's then() method.
     * - If it was an error, an error object will be constructed, passed though our global error handler,
     *   and then passed on tp the caller's catch() method.
     * */
    static resolveOrReject(data:any) : any {
        //1. Check for errors
        if (data.errors) {
            const firstWithCode = data.errors.find(e => e.extensions && e.extensions.code);
            const errorObject = new GraphqlError(
                firstWithCode? firstWithCode.extensions.code : ErrorCode.UNKNOWN,
                false, //the handled function
                data.errors
            );

            GraphQL.handleGraphqlError(errorObject);
            throw errorObject;
        }

        //2. Resolve the promise.
        else return data.data;
    }
    //endregion




    //region HTTP ERROR GLOBAL HANDING
    /**
     * BEYOND!
     * Global graphQL error handing of the frontend app.
     * This function will be called BEFORE any local/individual handler is being called.
     *
     * An error object has the form: {
     *  graphqlErrors: the raw array that the backend graphQL service returns as: { error:[] }
     *  code: the ErrorCode enum code that we found on graphqlErrors field. Most of the times, there is only one error, so this is the only thing that the local handler would care about.
     * }
     * */
    static handleGraphqlError(error:GraphqlError) {
        switch(error.code) {
            case ErrorCode.UNAUTHORIZED:
                ModalService.showLogin();
                error.handled = true; //this way we inform the caller that this error is already handled. Still, the called may choose to do more things with it.
                break;

            case ErrorCode.CONNECTION_ERROR:
                QuickInfoService.makeWarning(null, "Connection lost.");
                error.handled = true; //this way we inform the caller that this error is already handled. Still, the called may choose to do more things with it.
                break;
        }
    }
    //endregion

    /** runs a graphql query*/
    static run(query:string, params?:any, name?:string) : Promise<any> {
        if (!params && !name) {
            return fetch(Urls.graphql.simple, {
                method: 'post',
                headers: {
                    'Authorization': App.getSessionKey(),
                    'Content-Type': 'application/json'
                },
                body: query,
            })
            .then(response => response.json(), () => {
                throw {graphqlErrors:[], code:ErrorCode.CONNECTION_ERROR};
            })
            .then(GraphQL.resolveOrReject);
        }

        else {
            return fetch(Urls.graphql.params, {
                method: 'post',
                headers: {
                    'Authorization': App.getSessionKey(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    q:query,
                    p:params,
                    n:name
                }),
            })
            .then(response => response.json(), () => {
                throw {code:ErrorCode.CONNECTION_ERROR};
            })
            .then(GraphQL.resolveOrReject);
        }
    }

    /** calls a url. */
    static runUrl(url:string, body:any) : Promise<any> {
        return fetch(url, {
            method: 'post',
            headers: {
                'Authorization': App.getSessionKey(),
                'Content-Type': 'application/json'
            },
            body: body, //TODO chain one more promise to check various errors (network etc)
        }).then(response => response.json());
    }
}