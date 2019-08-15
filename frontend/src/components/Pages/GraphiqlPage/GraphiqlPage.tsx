import React, {Component, CSSProperties} from 'react';
import "./GraphiqlPage.css";
import GraphiQL from "graphiql";
import Urls from "../../../constants/Urls";
import ErrorCode from "../../../enums/ErrorCode";
import App from "../../../services/App";

export default class GraphiqlPage extends Component {
    props : {
        //data
        app:App
    };


    //region LIFE CYCLE
    //constructor(props) {
    //    super(props);
    //    this.state = {};
    //}

    //componentDidMount() {}
    //static getDerivedStateFromProps(nextProps, prevState) {}
    //shouldComponentUpdate(nextProps, nextState) { return true; }
    //getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    //componentDidUpdate(prevProps, prevState, snapshot) {}
    //componentWillUnmount() {}

    //componentDidCatch(error, info) {
    //    console.error("Exception caught");
    //}

    //endregion


    //region EVENT HANDLERS
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
        return fetch(Urls.graphql.params, {
            method: 'post',
            headers: {
                'Authorization': this.props.app.sessionKey,
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
    //endregion


    //region RENDERING
    render() {
        return (
            <GraphiQL fetcher={this.doRequest.bind(this)} />
        );
    }

    //endregion
}