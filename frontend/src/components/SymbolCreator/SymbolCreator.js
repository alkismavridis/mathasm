import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./SymbolCreator.css";
import QuickInfoService from "../../services/QuickInfoService";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import GraphQL from "../../services/GraphQL";
import ErrorCode from "../../enums/ErrorCode";
import {SymbolRangeUtils} from "../../services/symbol/SymbolRangeUtils";
import DomUtils from "../../services/DomUtils";


const CREATE_SYMBOL = `mutation($text:String!, $uid:Long!, $parentId:Long!) {
    symbolWSector {
        createSymbol(parentId:$parentId, text:$text, uid:$uid) {uid,text}
    }
}`;

class SymbolCreator extends Component {
    static propTypes = {
        //data
        parentId:PropTypes.number.isRequired,
        showCreatedSymbols:PropTypes.bool.isRequired,

        //actions
        onSymbolCreated:PropTypes.func,

        //styling
    };


    //region FIELDS
    state = {
        text:"",
        uid:"",
        isLoading:false,
        savedSymbols:[] //state or props?
    };
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

                //add the saved symbol in the array
                SymbolRangeUtils.addToSorted(this.state.savedSymbols, resp.symbolWSector.createSymbol);

                this.setState({
                    isLoading:false,
                    text:"",
                    uid:+this.state.uid+1,
                    savedSymbols:this.state.savedSymbols
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
    renderSavedSymbols() {
        const children = this.state.savedSymbols
            .map(s => <div key={s.uid} className="SymbolCreator_savedSymbol" title={"uid: "+s.uid}>{s.text}</div>);


        return (
            <div className="Globals_flexStart SymbolCreator_savedSymbolWrapper">
                {children}
            </div>
        );
    }


    render() {
        return (
            <div className="SymbolCreator_root">
                <input
                    value={this.state.text}
                    onKeyDown={DomUtils.handleEnter(this.submitSymbol.bind(this))}
                    onChange={e => this.setState({text:e.target.value})}
                    className="Globals_inp" />
                <input
                    value={this.state.uid}
                    type="number"
                    onChange={e => this.setState({uid:e.target.value})}
                    onKeyDown={DomUtils.handleEnter(this.submitSymbol.bind(this))}
                    className="Globals_inp" />
                {this.state.isLoading?
                    <FontAwesomeIcon icon="spinner" spin={true}/> :
                    <button onClick={this.submitSymbol.bind(this)}>Click me</button>
                }
                {this.props.showCreatedSymbols && this.renderSavedSymbols()}
            </div>
        );
    }

    //endregion
}

export default SymbolCreator;