import React, {Component, CSSProperties} from 'react';
import "./GraphiqlPage.css";
import GraphiQL from "graphiql";
import GraphiqlPageController from "../../../../core/app/pages/GraphiqlPageController";

export default class GraphiqlPage extends Component {
    props : {
        ctrl:GraphiqlPageController
    };


    //region LIFE CYCLE
    constructor(props) {
        super(props);
    }
    //endregion




    //region RENDERING
    render() {
        const ctrl = this.props.ctrl;
        return (
            <div style={{height:"100%"}}>
                <GraphiQL fetcher={ctrl.doRequest.bind(ctrl)} />
            </div>
        );
    }

    //endregion
}