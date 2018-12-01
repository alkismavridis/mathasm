import Urls from "../constants/Urls";


export default class GraphQL {
    static run(credentials, query, params, name) {
        if (!params && !name) {
            return fetch(Urls.graphql.simple, {
                method: 'post',
                headers: {
                    'Authorization': credentials,
                    'Content-Type': 'application/json'
                },
                body: query,
            }).then(response => response.json());
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
            }).then(response => response.json())
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