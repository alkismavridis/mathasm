import React, {Component} from 'react';
import "./SymbolCreator.css";
import QuickInfoService from "../../services/QuickInfoService";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import GraphQL from "../../services/GraphQL";
import ErrorCode from "../../enums/ErrorCode";
import DomUtils from "../../services/DomUtils";
import {AppNode} from "../../entities/frontend/AppNode";
import AppNodeReaction from "../../enums/AppNodeReaction";
import {AppEvent} from "../../entities/frontend/AppEvent";


const CREATE_SYMBOL = `mutation($text:String!, $uid:Long!, $parentId:Long!) {
    symbolWSector {
        createSymbol(parentId:$parentId, text:$text, uid:$uid) {uid,text}
    }
}`;

class SymbolCreator extends Component implements AppNode {
    //region FIELDS
    props : {
        //data
        parent:AppNode,
        parentId:number,

        //actions
        onSymbolCreated?:Function,

        //styling
    };

    state = {
        text:"",
        uid:"",
        isLoading:false,
    };
    //endregion




    //region APP NODE
    getChildMap(): any {
        return null;
    }

    getParent(): AppNode {
        return this.props.parent;
    }

    handleChildEvent(event: AppEvent): AppNodeReaction {
        return AppNodeReaction.UP;
    }

    handleParentEvent(event: AppEvent): AppNodeReaction {
        return AppNodeReaction.NONE;
    }
    //endregion



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
    submitSymbol() {
        this.setState({isLoading:true});

        GraphQL.run(CREATE_SYMBOL, {parentId:this.props.parentId, text:this.state.text, uid:this.state.uid})
            .then(resp => {
                QuickInfoService.makeSuccess(`Symbol "${this.state.text}" successfully created.`);

                this.setState({
                    isLoading:false,
                    text:"",
                    uid:+this.state.uid+1,
                });

                this.props.onSymbolCreated(resp.symbolWSector.createSymbol);
            })
            .catch(err => {
                this.handleSubmitError(err);
                this.setState({isLoading:false})
            });
    }

    handleSubmitError(err) {
        if (err.code === ErrorCode.SYMBOL_TEXT_ALREADY_REGISTERED) {
            QuickInfoService.makeError(`Symbol "${this.state.text}" is already registered.`);
        }
        else if (err.code === ErrorCode.SYMBOL_UID_ALREADY_REGISTERED) {
            QuickInfoService.makeError(`Symbol ${this.state.uid} is already registered.`);
        }
        else QuickInfoService.makeError(`Could not create symbol "${this.state.text}".`);
    }
    //endregion


    //region RENDERING
    render() {
        return (
            <div className="SymbolCreator_root">
                <input
                    value={this.state.text}
                    onKeyDown={DomUtils.handleEnter(this.submitSymbol.bind(this))}
                    onChange={e => this.setState({text:e.target.value})}
                    className="MA_inp" />
                <input
                    value={this.state.uid}
                    type="number"
                    onChange={e => this.setState({uid:e.target.value})}
                    onKeyDown={DomUtils.handleEnter(this.submitSymbol.bind(this))}
                    className="MA_inp" />
                {this.state.isLoading?
                    <FontAwesomeIcon icon="spinner" spin={true}/> :
                    <button onClick={this.submitSymbol.bind(this)}>Click me</button>
                }
            </div>
        );
    }

    //endregion
}

export default SymbolCreator;