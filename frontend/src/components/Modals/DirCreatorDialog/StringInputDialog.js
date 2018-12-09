import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./StringInputDialog.css";
import ModalHeader from "../ModalHeader/ModalHeader";
import DomUtils from "../../../services/DomUtils";




export default class StringInputDialog extends Component {
    //region STATIC
    static propTypes = {
        //data
        initialText:PropTypes.string,
        title:PropTypes.node,
        placeholder:PropTypes.string,

        //actions
        onSubmit:PropTypes.func,

        //styling
    };

    //static defaultProps = {};
    //endregion



    //region LIFE CYCLE
    constructor(props) {
        super(props);
        this.state = {
            text: props.initialText || ""
        }
    }
    //endregion


    //region EVENT HANDLERS
    onSubmitResult() {
        console.log("SUBMIT!");
        if (this.props.onSubmit) this.props.onSubmit(this.state.text);
    }
    //endregion


    //region RENDERING
    render() {
        return (
            <div className="Globals_window StringInputDialog_root">
                <ModalHeader
                    title={this.props.title}
                    onConfirm={this.onSubmitResult.bind(this)}/>

                <input
                    className="Globals_inp"
                    placeholder={this.props.placeholder}
                    onKeyDown={DomUtils.handleEnter(this.onSubmitResult.bind(this))}
                    value={this.state.text}
                    onChange={e => this.setState({text:e.target.value})}/>
            </div>
        );
    }

    //endregion
}