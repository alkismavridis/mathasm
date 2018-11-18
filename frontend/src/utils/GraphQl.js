import Urls from "../constants/Urls";


export default class GraphQl {
    static run(query, params, name) {
        if (!params && !name) {
            return fetch(Urls.graphql.simple, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: query,
            }).then(response => response.json());
        }

        else {
            return fetch(Urls.graphql.params, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    q:query,
                    p:params,
                    n:name
                }),
            }).then(response => response.json())
        }
    }
}