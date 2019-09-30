import App from "../App";
import ErrorCode from "../../enums/ErrorCode";
import Constants from "../../Constants";
import PageController from "./PageController";
import PageType from "../../enums/frontend/PageType";

export default class GraphiqlPageController implements PageController {
    readonly type = PageType.GRAPHIQL;

    constructor(private app:App) {}


    /**
     * normally all http traffic goes through GraphQL.ts class
     * For the purposes of GraphiQL plugin, we will create one more function that performs http requests.
     *
     * The reason that we need the second handler is the following:
     * Our regular GraphQL.run function performs some globally-setup handling of the response.
     * For errors, this means a global error handling.
     * For success, this means return the response.data property instead of the raw response.
     * This global handling is a middle man between the response that the server sends, and our app.
     *
     * On the other hand, GraphiQL plugin needs the RAW response, without any middle man in order to function.
     * We do not want any global error/success handling here.
     * */
    doRequest(graphQLParams) {
        return fetch(Constants.graphql.params, {
            method: 'post',
            headers: {
                'Authorization': this.app.auth.sessionKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: graphQLParams.query,
                p: graphQLParams.variables,
                n: graphQLParams.operationName
            }),
        })
            .then(response => response.json(), () => {
                throw {code: ErrorCode.CONNECTION_ERROR};
            })
    }
}