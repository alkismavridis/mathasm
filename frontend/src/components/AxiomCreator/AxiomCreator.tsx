import React, {Component} from 'react';
import "./AxiomCreator.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import Connection from "../ReusableComponents/Connection/Connection";
import ModalService from "../../services/ModalService";
import ModalHeader from "../Modals/ModalHeader/ModalHeader";
import ConnectionEditDialog from "../Modals/ConnectionEditDialog/ConnectionEditDialog";
import StringInputDialog from "../Modals/StringInputDialog/StringInputDialog";
import GraphQL from "../../services/GraphQL";
import QuickInfoService from "../../services/QuickInfoService";
import MathAsmDir from "../../entities/backend/MathAsmDir";
import MathAsmSymbol from "../../entities/backend/MathAsmSymbol";
import {AppNode} from "../../entities/frontend/AppNode";
import AppNodeReaction from "../../enums/AppNodeReaction";
import {AppEvent} from "../../entities/frontend/AppEvent";
import AppEventType from "../../enums/AppEventType";


const q = {
    MAKE_AXIOM : `mutation($parentId:Long!, $name:String!, $left:[Long!]!, $grade:Int, $isBidirectional: Boolean, $right:[Long!]!){
      statementWSector {
        createAxiom(parentId:$parentId, name:$name, left:$left, grade:$grade, isBidirectional:$isBidirectional, right:$right) {
	        id,name,type,left,right,grade,isBidirectional
        }
      }
    }`
};


export default class AxiomCreator extends Component {
    //region STATIC
    props : {
        //data
        parent:AppNode,
        parentDir:MathAsmDir,

        //actions

        //styling
    };

    //static defaultProps = {};


    state = {
        left:[] as MathAsmSymbol[],
        right:[] as MathAsmSymbol[],
        grade:0,
        isBidirectional:true,

        axiomDir:null as MathAsmDir,
        cursor:0,
        isCursorLeft:true
    };

    _rootRef = null;
    //endregion



    //region LIFE CYCLE
    // componentDidMount() {}
    // shouldComponentUpdate(nextProps, nextState) { return true; }
    // getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    // componentDidUpdate(prevProps, prevState, snapshot) {}
    // componentWillUnmount() {}
    // componentDidCatch(error, info) { console.error("Exception caught"); }
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
        switch (event.type) {
            case AppEventType.SYMBOL_SELECTED:
                this.addSymbol(event.data.symbol);
                this.focus();
                break;

            case AppEventType.SYMBOL_RENAMED:
                this.forceUpdate();
                break;
        }
        return AppNodeReaction.NONE;
    }
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
                this.setState({cursor: 0, isCursorLeft: true});
                break;

            case 40: //arrow down
                this.setState({cursor: 0, isCursorLeft: false});
                break;

            case 37: //arrow left
                this.setState({cursor: Math.max(0, this.state.cursor - 1)});
                break;

            case 39: //arrow right
                const len = this.getCurrentSentence().length;
                this.setState({cursor: Math.min(len, this.state.cursor + 1)});
                break;

            case 8: { //backspace
                const array = this.getCurrentSentence().slice();
                if (this.state.cursor === 0 || array.length === 0) return;
                array.splice(this.state.cursor - 1, 1);


                const newState: any = {cursor: this.state.cursor - 1};
                if (this.state.isCursorLeft) newState.left = array;
                else newState.right = array;
                this.setState(newState);

                break;
            }

            case 46: { //delete
                const array = this.getCurrentSentence().slice();
                if (this.state.cursor === array.length || array.length === 0) return;
                array.splice(this.state.cursor, 1);

                const newState:any = {};
                if (this.state.isCursorLeft) newState.left = array;
                else newState.right = array;
                this.setState(newState);

                break;
            }

            case 13:
                this.handleSaveClicked();
                break;
        }

    }

    /** Sends a save request to the server in order to save the axiom with the given name. */
    commitSaveRequest(modalId:number, name:string) {
        const data = {
            parentId: this.props.parentDir.id,
            name: name,
            left: this.state.left.map(s => s.uid),
            grade: this.state.grade,
            isBidirectional: this.state.isBidirectional,
            right: this.state.right.map(s => s.uid)
        };

        GraphQL.run(q.MAKE_AXIOM, data).then(resp => {
            AppEvent.makeStatementUpdate(resp.statementWSector.createAxiom, this.props.parentDir.id).travelAbove(this);
            ModalService.removeModal(modalId);
        })
        .catch(err => {
            QuickInfoService.makeError("Error while creating axiom...")
        });
    }

    /** Fired when the save button is clicked. Will open a dialog to get the new axiom's name. */
    handleSaveClicked() {
        const id = ModalService.getNextId();
        ModalService.addModal(
            id,
            <StringInputDialog
                title={"Save under "+this.props.parentDir.name}
                placeholder="Axiom's name..."
                onSubmit={this.commitSaveRequest.bind(this, id)}/>
        )
    }
    //endregion


    //region API
    /** cat be called by the parent component. Adds a symbol into the current cursor position. */
    addSymbol(sym:MathAsmSymbol) {
        //1. Create the new sentence
        const newSentence = this.getCurrentSentence().slice();
        newSentence.splice(this.state.cursor, 0, sym);

        //2. Integrate the new sentence into the state.
        const newState:any = this.state.isCursorLeft?
            {left:newSentence}:
            {right:newSentence};

        //Advance the cursor too
        newState.cursor = this.state.cursor+1;
        this.setState(newState);
    }

    focus() {
        if (this._rootRef) this._rootRef.focus();
    }
    //endregion



    //region RENDERING
    /**
     * Renders the div between symbols.
     * The isLeft parameter refers to the sentence to be rendered, NOT to the currently selected one.
     * */
    renderMidSymbolDiv(cursorPos:number, currentIndex:number, isLeft:boolean) {
        return <div
            key={"c"+currentIndex}
            className="AxiomCreator_midDiv"
            onClick={e => {
                e.stopPropagation();
                this.setState({cursor:currentIndex, isCursorLeft:isLeft});
            }}>
            {cursorPos===currentIndex && <div className="AxiomCreator_cursor"/>}
        </div>;
    }

    /**
     * Renders a sentence.
     * The isLeft parameter refers to the sentence to be rendered, NOT to the currently selected one.
     * */
    renderSentence(sentence:MathAsmSymbol[], cursorPos:number, isLeft:boolean) {
        const symbolDivs = [];
        sentence.forEach((s,index) => {
            symbolDivs.push(this.renderMidSymbolDiv(cursorPos, index, isLeft));
            symbolDivs.push(
                <div
                    key={index}
                    className="AxiomCreator_sym"
                    onClick={e => {
                        e.stopPropagation();
                        this.addSymbol(s);
                    }}>
                    {s.text}
                </div>
            );
        });
        symbolDivs.push(this.renderMidSymbolDiv(cursorPos, sentence.length, isLeft));


        return <div
            onClick={e => this.setState({cursor:sentence.length, isCursorLeft:isLeft})}
            className="MA_flexStart AxiomCreator_sen">
            {symbolDivs}
        </div>;
    }

    renderConnection() {
        return <Connection
            style={{margin:"8px"}}
            grade={this.state.grade}
            isBidirectional={this.state.isBidirectional}
            onClick={this.handleConnectionClick.bind(this)}/>
    }

    render() {
        return (
            <div ref={el => this._rootRef = el} className="AxiomCreator_root" onKeyDown={this.handleKeyPress.bind(this)} tabIndex={0}>
                <div className="MA_14px MA_bold">New axiom:</div>
                {this.renderSentence(this.state.left, this.state.isCursorLeft? this.state.cursor : null, true)}
                {this.renderConnection()}
                {this.renderSentence(this.state.right, this.state.isCursorLeft? null : this.state.cursor, false)}
                <div>
                    <button
                        className="MA_roundBut"
                        style={{width:"32px", height:"32px", marginTop:"8px"}}
                        onClick={this.handleSaveClicked.bind(this)}>
                        <FontAwesomeIcon icon="save"/>
                    </button>
                </div>
            </div>
        );
    }
    //endregion
}