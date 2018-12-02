import Urls from "../constants/Urls";
import ErrorCode from "../constants/ErrorCode";


export default class GraphQL {
    static resolveOrReject(data) {
        //1. Check for errors
        if (data.errors) {
            const firstWithCode = data.errors.find(e => e.extensions && e.extensions.code);
            throw {
                errors:data.errors,
                code:firstWithCode? firstWithCode.extensions.code : ErrorCode.UNKNOWN
            };
        }

        //2. Resolve the promise.
        else return data.data;
    }

    static run(credentials, query, params, name) {
        if (!params && !name) {
            return fetch(Urls.graphql.simple, {
                method: 'post',
                headers: {
                    'Authorization': credentials,
                    'Content-Type': 'application/json'
                },
                body: query,
            })
            .then(response => response.json(), () => {
                throw {code:ErrorCode.CONNECTION_ERROR};
            })
            .then(GraphQL.resolveOrReject);
        }

        else {
            return fetch(Urls.graphql.params, {
                method: 'post',
                headers: {
                    'Authorization': credentials,
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


    static runUrl(url, body, credentials) {
        return fetch(url, {
            method: 'post',
            headers: {
                'Authorization': credentials,
                'Content-Type': 'application/json'
            },
            body: body,
        }).then(response => response.json());
    }
}