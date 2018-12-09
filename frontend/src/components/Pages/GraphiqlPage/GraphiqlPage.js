import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./GraphiqlPage.css";
import GraphiQL from "graphiql";
import GraphQL from "../../../services/GraphQL";

export default class GraphiqlPage extends Component {
    static propTypes = {
        //data
        //actions

        //styling
    };

    static defaultProps = {};


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
    graphQLFetcher(graphQLParams) {
        return GraphQL.run(
            graphQLParams.query,
            graphQLParams.variables,
            graphQLParams.operationName,
        );
    }
    //endregion


    //region RENDERING
    render() {
        return (
            <GraphiQL fetcher={this.graphQLFetcher.bind(this)} />
        );
    }

    //endregion
}