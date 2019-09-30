import React, {Component, CSSProperties} from 'react';
import "./SymbolCreator.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import ErrorCode from "../../../core/enums/ErrorCode";
import DomUtils from "../../../core/utils/DomUtils";
import App from "../../../core/app/App";
import MathAsmDir from "../../../core/entities/backend/MathAsmDir";


const CREATE_SYMBOL = `mutation($text:String!, $uid:Long!, $parentId:Long!) {
    symbolWSector {
        createSymbol(parentId:$parentId, text:$text, uid:$uid) {uid,text}
    }
}`;

class SymbolCreator extends Component {
    //region FIELDS
    props : {
        //data
        app:App,
        parentDir:MathAsmDir,

        //actions
        onSymbolCreated?:Function,

        //styling
        style?: CSSProperties,
    };

    state = {
        text:"",
        uid:"",
        isLoading:false,
    };
    //endregion



    //region EVENT HANDLERS
    submitSymbol() {
        if(!this.props.parentDir) return;
        this.setState({isLoading:true});

        this.props.app.graphql.run(CREATE_SYMBOL, {parentId:this.props.parentDir.id, text:this.state.text, uid:this.state.uid})
            .then(resp => {
                this.props.app.quickInfos.makeSuccess(`Symbol "${this.state.text}" successfully created.`);

                this.setState({
                    isLoading:false,
                    text:"",
                    uid:+this.state.uid+1,
                });

                this.props.onSymbolCreated(resp.symbolWSector.symbolCreated);
            })
            .catch(err => {
                this.handleSubmitError(err);
                this.setState({isLoading:false})
            });
    }

    handleSubmitError(err) {
        if (err.code === ErrorCode.SYMBOL_TEXT_ALREADY_REGISTERED) {
            this.props.app.quickInfos.makeError(`Symbol "${this.state.text}" is already registered.`);
        }
        else if (err.code === ErrorCode.SYMBOL_UID_ALREADY_REGISTERED) {
            this.props.app.quickInfos.makeError(`Symbol ${this.state.uid} is already registered.`);
        }
        else this.props.app.quickInfos.makeError(`Could not create symbol "${this.state.text}".`);
    }
    //endregion


    //region RENDERING
    render() {
        return (
            <div className="SymbolCreator_root" style={this.props.style}>
                <div>New Symbol:</div>
                <input
                    value={this.state.text}
                    placeholder="Symbol text"
                    style={{marginBottom:"8px"}}
                    onKeyDown={DomUtils.handleEnter(this.submitSymbol.bind(this))}
                    onChange={e => this.setState({text:e.target.value})}
                    className="MA_inp MA_block"/>
                <input
                    value={this.state.uid}
                    type="number"
                    placeholder="Symbol Id"
                    style={{marginBottom:"8px"}}
                    onChange={e => this.setState({uid:e.target.value})}
                    onKeyDown={DomUtils.handleEnter(this.submitSymbol.bind(this))}
                    className="MA_inp MA_block" />
                <div style={{marginBottom:"8px"}}>{this.state.isLoading?
                    <FontAwesomeIcon icon="spinner" spin={true}/> :
                    <button onClick={this.submitSymbol.bind(this)} className="MA_but MA_block">Save</button>
                }</div>
            </div>
        );
    }

    //endregion
}

export default SymbolCreator;