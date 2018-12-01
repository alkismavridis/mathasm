import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./DbVisualisationPage.css";
import GraphQL from "../../../services/GraphQL";
import Urls from "../../../constants/Urls";
import SessionService from "../../../services/SessionService";
import vis from "vis";
import CypherService from "../../../services/CypherService";
import {nl2br} from "../../../services/FormattingUtils";



const GraphTypes = {
    USER:1,
    THEORY:2,
    SYMBOL:3,
    OBJECT:4,
    STATEMENT:5,
    MOVE:6,
    PROOF:7
};

class DbVisualisationPage extends Component {
    //region PROPS AND STATE
    static propTypes = {
        //data
        history:PropTypes.object.isRequired,

        //actions

        //styling
    };

    static defaultProps = {};


    state = {
        cypherCommand:"match (o)-[r]-(f) return o,r,f;",
        selectedNode:null,
    };

    _canvasRoot = null;
    _network = null;
    _visData = {
        nodes: [
            {id: 1, label: 'Node 1'},
            {id: 2, label: 'Node 2'},
            {id: 3, label: 'Node 3'},
            {id: 4, label: 'Node 4'},
            {id: 5, label: 'Node 5'}
        ],
        edges: [
            {from: 1, to: 3},
            {from: 1, to: 2},
            {from: 2, to: 4},
            {from: 2, to: 5},
            {from: 3, to: 3}
        ]
    };
    //endregion



    //region LIFE CYCLE

    componentDidMount() {
        console.log(this._canvasRoot);
        this._network = new vis.Network(this._canvasRoot, this.toVisData(this._visData.nodes, this._visData.edges), {});
        this._network.on("select", this.nodeSelected.bind(this));
    }


    componentDidUpdate(prevProps, prevState, snapshot) {

    }



    //static getDerivedStateFromProps(nextProps, prevState) {}
    //shouldComponentUpdate(nextProps, nextState) { return true; }
    //getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    //componentWillUnmount() {}

    //componentDidCatch(error, info) {
    //    console.error("Exception caught");
    //}

    //endregion



    //region UTILS
    toVisData(nodes, edges) {
        console.log("nodes are", nodes);
        for (let node of nodes) {
            switch (node._t) {
                case GraphTypes.USER:
                    node.color = "green";
                    break;

                case GraphTypes.THEORY:
                    node.color = "red";
                    break;

                case GraphTypes.SYMBOL:
                    node.color = "gray";
                    break;

                case GraphTypes.OBJECT:
                    node.color = "gray";
                    break;

                case GraphTypes.STATEMENT:
                    node.color = "yellow";
                    break;

                case GraphTypes.MOVE:
                    node.color = "purple";
                    break;

                case GraphTypes.PROOF:
                    node.color = "blue";
                    break;
            }
        }

        return {
            nodes: new vis.DataSet(nodes),
            edges: new vis.DataSet(edges),
        };
    }
    //endregion


    //region STATE HANDLING
    integrateDBData(dbData) {
        this._visData = dbData;
        this._network.setData(this.toVisData(this._visData.nodes, this._visData.edges));
    }

    runCypher() {
        console.log("I run the cypher!");
        GraphQL.runUrl(Urls.cypher.raw, this.state.cypherCommand, SessionService.getSessionKey()).then(resp => {
            if (resp.data) this.integrateDBData(resp.data);
            else window.alert(resp.message);
        }, err => {
            console.log("ERRPR", err);
        })
    }
    //endregion



    //region EVENT HANDLERS
    handlerCypherCommandKeyPress(keyEvent) {
        if (keyEvent.ctrlKey && keyEvent.charCode==13) {
            this.runCypher();
            return;
        }
    }

    handlerCypherCommandChange(e) {
        this.setState({
            cypherCommand: e.target.value
        });
    }

    nodeSelected(e) {
        //1. Get the selected id
        const selectedId = e.nodes[0];
        if (selectedId==null) {
            this.setState({selectedNode:null});
            return;
        }

        //2. Get the selected node
        console.log(selectedId);
        const node = this._visData.nodes.find(n => n.id === selectedId);
        if (node==null) return;

        //3. Display the data
        this.setState({selectedNode:node});
    }
    //endregion


    //region RENDERING
    renderSelectedElement() {
        if (!this.state.selectedNode) return null;

        return (
            <div className="DbVisualisationPage_selectedNode">
                {JSON.stringify(this.state.selectedNode._data, null, 2)}
            </div>
        );
    }

    render() {
        return (
            <div className="Globals_page">
                <textarea
                    value={this.state.cypherCommand}
                    onKeyPress={this.handlerCypherCommandKeyPress.bind(this)}
                    onChange={this.handlerCypherCommandChange.bind(this)}
                    style={{
                        minHeight:"50px",
                        background:"#b3dbef",
                        outline:"none",
                        borderRadius:"10px",
                        margin:"16px",
                        padding:"16px"
                    }}>
                </textarea>
                <div className="Globals_pageMainContent" style={{position:"relative"}}>
                    <div className="DbVisualisationPage_canvasRoot" ref={el => this._canvasRoot=el}/>
                    {this.renderSelectedElement()}
                </div>
            </div>
        );
    }

    //endregion
}

export default DbVisualisationPage;