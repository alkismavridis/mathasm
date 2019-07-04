import React, {Component} from 'react';
import "./StringInputDialog.css";
import ModalHeader from "../ModalHeader/ModalHeader";
import DomUtils from "../../../services/DomUtils";




export default class StringInputDialog extends Component {
    //region STATIC
    props : {
        //data
        initialText?:string,
        title?:any,
        placeholder?:string,

        //actions
        onSubmit?:Function,

        //styling
    };

    state : {
        text: string
    };

    _inpRef = null;
    //endregion



    //region LIFE CYCLE
    constructor(props) {
        super(props);
        this.state = {
            text: props.initialText || ""
        }
    }

    componentDidMount() {
        if (this._inpRef) this._inpRef.focus();
    }
    //endregion


    //region EVENT HANDLERS
    onSubmitResult() {
        if (this.props.onSubmit) this.props.onSubmit(this.state.text);
    }
    //endregion


    //region RENDERING
    render() {
        return (
            <div className="MA_window StringInputDialog_root">
                <ModalHeader
                    title={this.props.title}
                    onConfirm={this.onSubmitResult.bind(this)}/>

                <input
                    ref={el => this._inpRef = el}
                    className="MA_inp"
                    placeholder={this.props.placeholder}
                    onKeyDown={DomUtils.handleEnter(this.onSubmitResult.bind(this))}
                    value={this.state.text}
                    onChange={e => this.setState({text:e.target.value})}/>
            </div>
        );
    }

    //endregion
}