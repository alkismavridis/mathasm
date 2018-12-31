import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./DbVisualisationPage.css";
import GraphQL from "../../../services/GraphQL";
import Urls from "../../../constants/Urls";
import vis from "vis";
import Dropdown from "../../ReusableComponents/Inputs/Dropdown/Dropdown";


const GraphTypes = {
    USER:1,
    THEORY:2,
    SYMBOL:3,
    OBJECT:4,
    STATEMENT:5,
    MOVE:6,
    PROOF:7
};


const SAVED_COMMANDS = [
    {id:"1", name:"Watch Node", query:"match (o)-[r]-(f) where ID(o)=3 return o,r,f;"},
    {id:"2", name:"All users", query:"match (o:user) return o;"},
    {id:"3", name:"Watch all users", query:"match (o:user)-[r]-(f) return o,r,f;"},
    {id:"4", name:"File system", query:"match (o:dir)-[r]-(f:dir) return o,r,f;"},
    {id:"5", name:"Whole DB", query:"match (o)-[r]-(f) return o,r,f;"},
    {id:"5", name:"Update Node", query:"MATCH (n) WHERE ID(n)=39 SET n.type = 65 return n;"},
];

class DbVisualisationPage extends Component {
    //region PROPS AND STATE
    static propTypes = {
        //data
        //actions
        //styling
    };

    static defaultProps = {};


    state = {
        cypherCommand: SAVED_COMMANDS[0].query,
        selectedNode:null,
        isLoading:false,
    };

    _canvasRoot = null;
    _network = null;
    _visData = {
        nodes: [],
        edges: []
    };
    //endregion



    //region LIFE CYCLE

    componentDidMount() {
        this._network = new vis.Network(this._canvasRoot, this.toVisData(this._visData.nodes, this._visData.edges), {});
        this._network.on("select", this.nodeSelected.bind(this));
    }





    // componentDidUpdate(prevProps, prevState, snapshot) {}
    // static getDerivedStateFromProps(nextProps, prevState) {}
    // shouldComponentUpdate(nextProps, nextState) { return true; }
    // getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    // componentWillUnmount() {}

    // componentDidCatch(error, info) { console.error("Exception caught"); }

    //endregion



    //region UTILS
    toVisData(nodes, edges) {
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

    /** does the actual request to the server. */
    async runCypher() {
        //1. Set the loading state
        this.setState({
            selectedNode:null,
            isLoading:true
        });

        //2. Do the request
        try {
            const resp = await GraphQL.runUrl(Urls.cypher.raw, this.state.cypherCommand);
            if (resp.data) this.integrateDBData(resp.data);
            else window.alert(resp.message);
        }
        catch (e) {
            console.log("Error", e);
        }

        //3. Undo loading
        this.setState({isLoading:false});
    }

    setSavedQuery(queryId) {
        const queryObj = SAVED_COMMANDS.find(c => c.id == queryId);
        if (!queryObj) return;
        this.setState({cypherCommand:queryObj.query});
    }
    //endregion



    //region EVENT HANDLERS
    handlerCypherCommandKeyPress(keyEvent) {
        if (keyEvent.ctrlKey && keyEvent.charCode===13) this.runCypher();
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

    renderLoadingIcon() {
        return (
            <div className="DbVisualisationPage_loadingIcon" />
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
                <Dropdown
                    options={SAVED_COMMANDS}
                    toLabelFunc={v => v.name}
                    toValueFunc={v => v.id}
                    onChange={id => this.setSavedQuery(id)}/>
                <div className="Globals_pageMainContent" style={{position:"relative"}}>
                    <div className="DbVisualisationPage_canvasRoot" ref={el => this._canvasRoot=el}/>
                    {this.renderSelectedElement()}
                    {this.state.isLoading? this.renderLoadingIcon() : null}
                </div>
            </div>
        );
    }

    //endregion
}

export default DbVisualisationPage;