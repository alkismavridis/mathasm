import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./AxiomCreator.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import Connection from "../Connection/Connection";
import ModalService from "../../services/ModalService";
import ModalHeader from "../Modals/ModalHeader/ModalHeader";
import ConnectionEditDialog from "../Modals/ConnectionEditDialog/ConnectionEditDialog";
import StringInputDialog from "../Modals/StringInputDialog/StringInputDialog";
import GraphQL from "../../services/GraphQL";
import QuickInfoService from "../../services/QuickInfoService";


const q = {
    MAKE_AXIOM : `mutation($parentId:Long!, $name:String!, $left:[Long!]!, $grade:Int, $isBidirectional: Boolean, $right:[Long!]!){
        createAxiom(parentId:$parentId, name:$name, left:$left, grade:$grade, isBidirectional:$isBidirectional, right:$right) {
	        id,name,type
        }
    }`
};


export default class AxiomCreator extends Component {
    //region STATIC
    static propTypes = {
        //data
        parentDir:PropTypes.object.isRequired,

        //actions
        onSave:PropTypes.func.isRequired,               //accepts: statement


        //styling
    };

    //static defaultProps = {};
    //endregion


    state = {
        left:[],
        right:[],
        grade:0,
        isBidirectional:true,

        axiomDir:null,
        cursor:0,
        isCursorLeft:true
    };


    //region LIFE CYCLE


    // componentDidMount() {}
    // shouldComponentUpdate(nextProps, nextState) { return true; }
    // getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    // componentDidUpdate(prevProps, prevState, snapshot) {}
    // componentWillUnmount() {}
    // componentDidCatch(error, info) { console.error("Exception caught"); }
    //endregion


    //region UTILS
    /** return either this.state.left or this.state.right depending on this.state.isCursorLeft. */
    getCurrentSentence() {
        return this.state.isCursorLeft? this.state.left : this.state.right;
    }
    //endregion



    //region EVENT HANDLERS
    /** opens a dialog in order to edit the connection. */
    handleConnectionClick() {
        const id = ModalService.getNextId();
        ModalService.addModal(
            id,
            <ConnectionEditDialog
                isBidirectional={this.state.isBidirectional}
                grade={this.state.grade}
                onSubmit={(grade, isBd) => {
                    this.setState({grade:grade, isBidirectional:isBd});
                    ModalService.removeModal(id);
                }}/>
        );
    }

    /** If this component is selected, a key listener will track key events. Here is the handler. */
    handleKeyPress(e) {
        switch (e.keyCode) {
            case 38: //arrow up
                this.setState({cursor:0, isCursorLeft:true});
                break;

            case 40: //arrow down
                this.setState({cursor:0, isCursorLeft:false});
                break;

            case 37: //arrow left
                this.setState({cursor:Math.max(0, this.state.cursor-1)});
                break;

            case 39: //arrow right
                const len = this.getCurrentSentence().length;
                this.setState({cursor:Math.min(len, this.state.cursor+1)});
                break;

            case 8: { //backspace
                const array = this.getCurrentSentence().slice();
                if (this.state.cursor === 0 || array.length === 0) return;
                array.splice(this.state.cursor - 1, 1);


                const newState = {cursor:this.state.cursor - 1};
                if (this.state.isCursorLeft) newState.left = array;
                else newState.right = array;
                this.setState(newState);

                break;
            }

            case 46: { //delete
                const array = this.getCurrentSentence().slice();
                if (this.state.cursor === array.length || array.length === 0) return;
                array.splice(this.state.cursor, 1);

                const newState = {};
                if (this.state.isCursorLeft) newState.left = array;
                else newState.right = array;
                this.setState(newState);

                break;
            }
        }
    }

    /** Sends a save request to the server in order to save the axiom with the given name. */
    commitSaveRequest(modalId, name) {
        const data = {
            parentId: this.props.parentDir.id,
            name: name,
            left: this.state.left.map(s => s.uid),
            grade: this.state.grade,
            isBidirectional: this.state.isBidirectional,
            right: this.state.right.map(s => s.uid)
        };

        GraphQL.run(q.MAKE_AXIOM, data).then(resp => {
            this.props.onSave(resp.createAxiom);
            ModalService.removeModal(modalId);
        })
        .catch(err => QuickInfoService.makeError("Error while creating axiom..."));
    }

    /** Fired when the save button is clicked. Will open a dialog to get the new axiom's name. */
    handleSaveClicked() {
        const id = ModalService.getNextId();
        ModalService.addModal(
            id,
            <StringInputDialog
                title="Axiom's name..."
                placeholder="Axiom's name..."
                onSubmit={this.commitSaveRequest.bind(this, id)}/>
        )
    }
    //endregion


    //region API
    /** cat be called by the parent component. Adds a symbol into the current cursor position. */
    addSymbol(sym) {
        //1. Create the new sentence
        const newSentence = this.getCurrentSentence().slice();
        newSentence.splice(this.state.cursor, 0, sym);

        //2. Integrate the new sentence into the state.
        const newState = this.state.isCursorLeft?
            {left:newSentence}:
            {right:newSentence};

        //Advance the cursor too
        newState.cursor = this.state.cursor+1;
        this.setState(newState);
    }
    //endregion



    //region RENDERING
    renderCursor() {
        return <div key="c" className="AxiomCreator_cursor"/>;
    }

    renderSentence(sentence, cursor) {
        const symbolDivs = [];
        sentence.forEach((s,index) => {
            if (cursor===index) symbolDivs.push(this.renderCursor());
            symbolDivs.push(<div key={index} className="AxiomCreator_sym">{s.text}</div>);
        });
        if(cursor===symbolDivs.length) symbolDivs.push(this.renderCursor());


        return <div className="Globals_flexStart">
            {symbolDivs}
            <button className="Globals_roundBut" style={{backgroundColor:"#d37833", width:"32px", height:"32px"}}>
                <FontAwesomeIcon icon="times"/>
            </button>
        </div>;
    }

    renderConnection() {
        return <Connection
            grade={this.state.grade}
            isBidirectional={this.state.isBidirectional}
            onClick={this.handleConnectionClick.bind(this)}/>
    }

    render() {
        return (
            <div className="AxiomCreator_root" onKeyDown={this.handleKeyPress.bind(this)} tabIndex="0">
                <div>
                    Axiom for {this.props.parentDir.name}
                    <button
                        className="Globals_roundBut"
                        style={{width:"32px", height:"32px"}}
                        onClick={this.handleSaveClicked.bind(this)}>
                        <FontAwesomeIcon icon="save"/>
                    </button>
                </div>
                {this.renderSentence(this.state.left, this.state.isCursorLeft? this.state.cursor : null)}
                {this.renderConnection()}
                {this.renderSentence(this.state.right, this.state.isCursorLeft? null : this.state.cursor)}
            </div>
        );
    }
    //endregion
}