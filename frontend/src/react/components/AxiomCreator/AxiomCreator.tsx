import React, {Component} from 'react';
import "./AxiomCreator.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import Connection from "../ReusableComponents/Connection/Connection";
import MathAsmSymbol from "../../../core/entities/backend/MathAsmSymbol";
import {Subscription} from "rxjs";
import AxiomCreatorController from "../../../core/app/pages/main_page/content/AxiomCreatorController";
import {unsubscribeAll, updateOn} from "../../utils/SubscriptionUtils";





export default class AxiomCreator extends Component {
    //region FIELDS
    props : {
        ctrl:AxiomCreatorController,
    };

    _rootRef = null;

    subscriptions:Subscription[] = [];
    //endregion



    //region LIFE CYCLE
    componentDidMount() {
        updateOn(this.props.ctrl.onChange, this);
    }

    componentWillUnmount() { unsubscribeAll(this); }
    //endregion




    //region EVENT HANDLERS
    /** If this component is selected, a key listener will track key events. Here is the handler. */
    handleKeyPress(e) {
        switch (e.keyCode) {
            case 38: //arrow up
                this.props.ctrl.changeSentence(true);
                break;

            case 40: //arrow down
                this.props.ctrl.changeSentence(false);
                break;

            case 37: //arrow left
                this.props.ctrl.moveCursor(false);
                break;

            case 39: //arrow right
                this.props.ctrl.moveCursor(true);
                break;

            case 8:  //backspace
                this.props.ctrl.deleteBackwards();
                break;

            case 46: //delete
                this.props.ctrl.deleteForward();
                break;

            case 13:
                this.props.ctrl.showSaveDialog();
                break;
        }

    }
    //endregion


    //region API
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
            onClick={e => {e.stopPropagation(); this.props.ctrl.goTo(currentIndex, isLeft);}}>
            {cursorPos===currentIndex && <div className="AxiomCreator_cursor"/>}
        </div>;
    }

    /**
     * Renders a sentence.
     * The isLeft parameter refers to the sentence to be rendered, NOT to the currently selected one.
     * */
    renderSentence(sentence:ReadonlyArray<MathAsmSymbol>, cursorPos:number, isLeft:boolean) {
        const symbolDivs = [];
        sentence.forEach((s,index) => {
            symbolDivs.push(this.renderMidSymbolDiv(cursorPos, index, isLeft));
            symbolDivs.push(
                <div
                    key={index}
                    className="AxiomCreator_sym"
                    onClick={e => {e.stopPropagation(); this.props.ctrl.addSymbol(s);}}>
                    {s.text}
                </div>
            );
        });
        symbolDivs.push(this.renderMidSymbolDiv(cursorPos, sentence.length, isLeft));


        return <div
            onClick={e => this.props.ctrl.goTo(sentence.length, isLeft)}
            className="MA_flexStart AxiomCreator_sen">
            {symbolDivs}
        </div>;
    }

    renderConnection() {
        return <Connection
            style={{margin:"8px"}}
            grade={this.props.ctrl.grade}
            isBidirectional={this.props.ctrl.isBidirectional}
            onClick={()=>this.props.ctrl.showConnectionEditMenu()}/>
    }

    render() {
        const ctrl = this.props.ctrl;

        return (
            <div ref={el => this._rootRef = el} className="AxiomCreator_root" onKeyDown={this.handleKeyPress.bind(this)} tabIndex={0}>
                <div className="MA_14px MA_bold">New axiom:</div>
                {this.renderSentence(ctrl.left, ctrl.isCursorLeft? ctrl.cursor : null, true)}
                {this.renderConnection()}
                {this.renderSentence(ctrl.right, ctrl.isCursorLeft? null : ctrl.cursor, false)}
                <div>
                    <button
                        className="MA_roundBut"
                        style={{width:"32px", height:"32px", marginTop:"8px"}}
                        onClick={e=>ctrl.showSaveDialog()}>
                        <FontAwesomeIcon icon="save"/>
                    </button>
                </div>
            </div>
        );
    }
    //endregion
}