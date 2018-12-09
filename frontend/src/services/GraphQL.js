import Urls from "../constants/Urls";
import ErrorCode from "../constants/ErrorCode";
import App from "../components/App/App";
import QuickInfoService from "./QuickInfoService";
import ModalService from "./ModalService";
import LoginDialog from "../components/Modals/LoginDialog/LoginDialog";



export default class GraphQL {
    //region HTTP RESPONSE GLOBAL HANDLING
    static resolveOrReject(data) {
        //1. Check for errors
        if (data.errors) {
            const firstWithCode = data.errors.find(e => e.extensions && e.extensions.code);
            const errorObject = {
                graphqlErrors:data.errors,
                code:firstWithCode? firstWithCode.extensions.code : ErrorCode.UNKNOWN,
                handled:false //the handled function
            };

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
    static handleGraphqlError(error) {
        switch(error.code) {
            case ErrorCode.UNAUTHORIZED:
                ModalService.showLogin();
                break;

            case ErrorCode.CONNECTION_ERROR:
                QuickInfoService.addWarning(null, "Connection lost.");
                break;
        }
    }
    //endregion

    /** runs a graphql query*/
    static run(query, params, name) {
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
    static runUrl(url, body) {
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