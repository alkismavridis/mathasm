import React, {Component, CSSProperties} from 'react';
import cx from 'classnames';
import "./TheoremCreator.scss";
import Statement from "../ReusableComponents/Statement/Statement";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import SelectionType from "../../../core/enums/SelectionType";
import StatementSide from "../../../core/enums/StatementSide";
import ProofStepsViewer from "../ReusableComponents/ProofStepsViewer/ProofStepsViewer";
import MathAsmStatement from "../../../core/entities/backend/MathAsmStatement";
import {Subscription} from "rxjs/index";
import TheoremCreatorController from "../../../core/app/pages/main_page/content/TheoremCreatorController";
import {unsubscribeAll, updateOn} from "../../utils/SubscriptionUtils";



export default class TheoremCreator extends Component {
    //region STATIC
    props : {
        ctrl:TheoremCreatorController;
        style?: CSSProperties,
        className?: string,
    };


    _rootRef = null;
    subscriptions:Subscription[] = [];
    //endregion



    //region LIFE CYCLE
    componentDidMount() {
        updateOn(this.props.ctrl.onChange, this);
    }

    componentWillUnmount() {
        unsubscribeAll(this);
    }
    //endregion


    //region EVENT HANDLERS
    focus() {
        if (this._rootRef) this._rootRef.focus();
    }

    /** The user could interact with this component with the keyboard too. Here are the controls: */
    handleKeyPress(e:KeyboardEvent) {
        switch (e.keyCode) {
            case 32: //space bar (Action: switch base direction)
                this.props.ctrl.swapBaseDir();
                break;

            case 13: //enter key (Action: perform replacement)
                this.props.ctrl.performReplacement();
                break;

            case 38: //arrow up (Action: change selected target)
                e.preventDefault();
                this.props.ctrl.choosePrevTarget();
                break;

            case 40: //arrow down (Action: change selected target)
                e.preventDefault();
                this.props.ctrl.chooseNextTarget();
                break;

            case 37: //arrow left (Action: moves the selection to the left)
                this.props.ctrl.moveSelection(-1);
                break;

            case 39: //arrow right (Action: moves the selection to the right)
                this.props.ctrl.moveSelection(1);
                break;

            case 65: //"a" key (Action: Select all)
                this.props.ctrl.changeSelectionType(SelectionType.ALL);
                break;

            case 83: //"s" key (Action: select sentence)
                this.props.ctrl.switchToSelectSentenceMode();
                break;

            case 68: //"d" key (Action: Select distinct)
                this.props.ctrl.switchToSingleSelectionMode();
                break;

            case 88: //"x" key (Action: clone base - left side)
                this.props.ctrl.cloneBase(StatementSide.LEFT);
                break;

            case 67: //"c" key (Action: clone base)
                this.props.ctrl.cloneBase(StatementSide.BOTH);
                break;

            case 86: //"v" key (Action: clone base - right side)
                this.props.ctrl.cloneBase(StatementSide.RIGHT);
                break;

            case 80: //"p" key (Action: persist selected template)
                this.props.ctrl.handleSaveClicked();
                break;

            case 66: //"b" key (Action: use target as base)
                this.props.ctrl.useTargetAsBase();
                break;

            case 27: //escape key (Action: Select none)
                this.props.ctrl.changeSelectionType(SelectionType.NONE);
                break;

            case 90: { //z key
                if (e.shiftKey && e.ctrlKey) this.props.ctrl.redoMove();
                else if (e.ctrlKey) this.props.ctrl.undoMove();
                break;
            }
        }
    }
    //endregion



    //region RENDERING
    renderTarget(target:MathAsmStatement, index:number) {
        if (!target) return <div>Empty target</div>;

        const player = this.props.ctrl.player;
        const changeHandler = () => this.props.ctrl.selectTarget(player.selectedTargetIndex===index? null : index);

        const isSelected = player.selectedTargetIndex===index;
        return <div key={index} className="MA_flexStartDown">
            <button
                className="MA_textBut"
                title="Use as base (b)"
                style={{
                    width: "16px",
                    height: "16px",
                    color:"green",
                    marginRight:"8px"
                }}
                onClick={e => this.props.ctrl.setBase(player.targets[index])}>
                <FontAwesomeIcon icon="cog"/>
            </button>
            <button
                className="MA_textBut"
                title="Replace (enter)"
                style={{
                    visibility:!isSelected || player.base==null || player.selectedTargetIndex==null || player.selectionType===SelectionType.NONE? "hidden" : "visible",
                    width: "16px",
                    height: "16px",
                    color:"red",
                    backgroundColor:"transparent",
                    marginRight:"8px"
                }}
                onClick={()=>this.props.ctrl.performReplacement()}>
                <FontAwesomeIcon icon="check"/>
            </button>
            <button
                className="MA_textBut"
                title="Replace (enter)"
                style={{
                    width: "16px",
                    height: "16px",
                    color:isSelected? "#001fff" : "#001fff73",
                    backgroundColor:"transparent",
                    marginRight:"8px"
                }}
                onClick={changeHandler}>
                <FontAwesomeIcon icon="angle-right"/>
            </button>
            <Statement
                symbolMap={this.props.ctrl.symbolMap}
                statement={target}
                leftMatches={isSelected? player.leftMatches : null}
                rightMatches={isSelected? player.rightMatches : null}
                matchLength={isSelected? player.getBaseSentenceLength() : 0}
                onClick={changeHandler}/>
        </div>;
    }

    renderBase() {
        const player = this.props.ctrl.player;
        if (!player.base) return <div>Please select a base...</div>;

        const isBidirectional = player.base && player.base.isBidirectional;
        return <div className="MA_flexStartDown">
            <button
                className="MA_textBut"
                title="Change base dir (space)"
                style={{
                    width: "16px",
                    height: "16px",
                    color: isBidirectional? "#38d0f3" : "#afb3d06e",
                    marginRight:"8px"
                }}
                disabled={!isBidirectional}
                onClick={()=>this.props.ctrl.swapBaseDir()}>
                <FontAwesomeIcon icon="exchange-alt"/>
            </button>
            <Statement symbolMap={this.props.ctrl.symbolMap} statement={player.base} side={player.baseSide}/>
        </div>
    }

    renderButtons() {
        const player = this.props.ctrl.player;

        return <div style={{margin:"16px 0"}} className="MA_flexStart">
            <button
                className="MA_roundBut"
                title="Clone left side of base (x)"
                style={{
                    visibility:player.base==null? "hidden" : "visible",
                    backgroundColor: "cornflowerblue",
                    width: "24px",
                    height: "24px",
                    fontSize: "14px",
                    margin:"0 4px"
                }}
                onClick={()=>this.props.ctrl.cloneBase(StatementSide.LEFT)}>
                <FontAwesomeIcon icon="ruler-combined" flip="horizontal"/>
            </button>
            <button
                className="MA_roundBut"
                title="Clone base (c)"
                style={{
                    visibility:player.base==null? "hidden" : "visible",
                    backgroundColor: "cornflowerblue",
                    width: "24px",
                    height: "24px",
                    fontSize: "14px",
                    margin:"0 4px"
                }}
                onClick={()=>this.props.ctrl.cloneBase(StatementSide.BOTH)}>
                <FontAwesomeIcon icon="bolt"/>
            </button>
            <button
                className="MA_roundBut"
                title="Clone right side of base (v)"
                style={{
                    visibility:player.base==null? "hidden" : "visible",
                    backgroundColor: "cornflowerblue",
                    width: "24px",
                    height: "24px",
                    fontSize: "14px",
                    margin:"0 20px 0 4px"
                }}
                onClick={()=>this.props.ctrl.cloneBase(StatementSide.RIGHT)}>
                <FontAwesomeIcon icon="ruler-combined"/>
            </button>

            <button
                className="MA_roundBut"
                title="Move selection left (left arrow)"
                style={{
                    visibility:player.selectionType===SelectionType.ALL || player.leftMatches.length+player.rightMatches.length<=1? "hidden" : "visible",
                    backgroundColor: "#e2b228",
                    width: "24px",
                    height: "24px",
                    fontSize: "18px",
                    margin:"0 4px"
                }}
                onClick={()=>this.props.ctrl.moveSelection(-1)}>
                <FontAwesomeIcon icon="caret-left"/>
            </button>
            <button
                className="MA_roundBut"
                title="Select all (a)"
                style={{
                    visibility:player.base==null || player.selectedTargetIndex==null? "hidden" : "visible",
                    backgroundColor: player.selectionType===SelectionType.ALL? "#f1814c" : "#e2b228",
                    width: "24px",
                    height: "24px",
                    fontSize: "14px",
                    margin:"0 4px"
                }}
                onClick={()=>this.props.ctrl.changeSelectionType(SelectionType.ALL)}>
                <FontAwesomeIcon icon="asterisk"/>
            </button>
            <button
                className="MA_roundBut"
                title="Sentence selection (s)"
                style={{
                    visibility:player.base==null || player.selectedTargetIndex==null? "hidden" : "visible",
                    backgroundColor: player.selectionType===SelectionType.LEFT || player.selectionType===SelectionType.RIGHT? "#f1814c" : "#e2b228",
                    width: "24px",
                    height: "24px",
                    fontSize: "14px",
                    margin:"0 4px"
                }}
                onClick={()=>this.props.ctrl.switchToSelectSentenceMode()}>
                <FontAwesomeIcon icon="balance-scale"/>
            </button>
            <button
                className="MA_roundBut"
                title="Distinct selection (d)"
                style={{
                    visibility:player.base==null || player.selectedTargetIndex==null? "hidden" : "visible",
                    backgroundColor: player.selectionType===SelectionType.ONE_IN_LEFT || player.selectionType===SelectionType.ONE_IN_RIGHT? "#f1814c" : "#e2b228",
                    width: "24px",
                    height: "24px",
                    fontSize: "14px",
                    margin:"0 4px"
                }}
                onClick={()=>this.props.ctrl.switchToSingleSelectionMode()}>
                <FontAwesomeIcon icon="highlighter"/>
            </button>
            <button
                className="MA_roundBut"
                title="Move selection right (right arrow)"
                style={{
                    visibility:player.selectionType===SelectionType.ALL || player.leftMatches.length+player.rightMatches.length<=1? "hidden" : "visible",
                    backgroundColor: "#e2b228",
                    width: "24px",
                    height: "24px",
                    fontSize: "18px",
                    margin:"0 20px 0 4px"
                }}
                onClick={()=>this.props.ctrl.moveSelection(1)}>
                <FontAwesomeIcon icon="caret-right"/>
            </button>

            <button
                className="MA_roundBut"
                title={"Persist selected template under "+this.props.ctrl.getActiveDirName()+" (p)"}
                style={{
                    visibility:player.selectedTargetIndex==null? "hidden" : "visible",
                    backgroundColor: "#5db969",
                    width: "24px",
                    height: "24px",
                    fontSize: "16px",
                    margin:"0 4px"
                }}
                onClick={()=>this.props.ctrl.handleSaveClicked()}>
                <FontAwesomeIcon icon="save"/>
            </button>
            <button
                className="MA_roundBut"
                title="Upload proof"
                style={{
                    visibility:player.getMoveCount()===0? "hidden" : "visible",
                    backgroundColor: "#5db969",
                    width: "24px",
                    height: "24px",
                    fontSize: "16px",
                    margin:"0 4px"
                }}
                onClick={()=>this.props.ctrl.uploadProof()}>
                <FontAwesomeIcon icon="cloud-upload-alt"/>
            </button>
        </div>;
    }

    renderEmptyStmtDiv() {
        return (
            <div
                onClick={() => this.props.ctrl.selectTarget(null)}
                style={{
                    marginLeft:"48px",
                    marginTop:"16px",
                    visibility:this.props.ctrl.player.base==null? "hidden" : "visible"
                }}>
                <button
                    className="MA_textBut"
                    title="Replace (enter)"
                    style={{
                        width: "16px",
                        height: "16px",
                        color:this.props.ctrl.player.selectedTargetIndex==null? "#001fff" : "#001fff73",
                        backgroundColor:"transparent",
                        marginRight:"8px"
                    }}
                    onClick={() => this.props.ctrl.selectTarget(null)}>
                    <FontAwesomeIcon icon="angle-right"/>
                </button>
                <span>New...</span>
            </div>
        );
    }

    render() {
        return (
            <div
                className={cx("TheoremCreator_root", this.props.className)}
                style={this.props.style}
                onKeyUp={(e:any)=>this.handleKeyPress(e)}
                ref={el => this._rootRef = el}
                tabIndex={0}>
                <div className="TheoremCreator_main">
                    {this.renderBase()}
                    {this.renderButtons()}
                    <div>
                        {this.props.ctrl.player.targets.map((t,index) => this.renderTarget(t, index))}
                        {this.renderEmptyStmtDiv()}
                    </div>
                </div>
                <ProofStepsViewer
                    proofPlayer={this.props.ctrl.player}
                    onNavigateAction={index => this.props.ctrl.goToMove(index)}/>
            </div>
        );
    }

    //endregion
}