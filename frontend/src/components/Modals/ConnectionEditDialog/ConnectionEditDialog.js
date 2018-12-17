import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./ConnectionEditDialog.scss";
import ModalHeader from "../ModalHeader/ModalHeader";
import DomUtils from "../../../services/DomUtils";
import Checkbox from "../../Inputs/Checkbox/Checkbox";

export default class ConnectionEditDialog extends Component {
    //region STATIC
    static propTypes = {
        //data
        grade:PropTypes.number,
        isBidirectional:PropTypes.bool,

        //actions
        onSubmit:PropTypes.func,     //accepts: (grade, isBidirectional)

        //styling
    };

    //static defaultProps = {};
    //endregion


    //region FIELDS
    _inpRef = null;
    //endregion


    //region LIFE CYCLE
    constructor(props) {
        super(props);

        this.state = {
            grade: props.grade || 0,
            isBidirectional: props.isBidirectional || false
        };
    }

    componentDidMount() {
        if (this._inpRef) this._inpRef.focus();
    }

    // static getDerivedStateFromProps(nextProps, prevState) {}
    // shouldComponentUpdate(nextProps, nextState) { return true; }
    // getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    // componentDidUpdate(prevProps, prevState, snapshot) {}
    // componentWillUnmount() {}
    // componentDidCatch(error, info) { console.error("Exception caught"); }
    //endregion


    //region EVENT HANDLERS
    onSubmitResult() {
        if (this.props.onSubmit) this.props.onSubmit(
            parseInt(this.state.grade),
            this.state.isBidirectional
        );
    }
    //endregion


    //region RENDERING
    render() {
        return (
            <div className="Globals_window" style={{padding:"8px"}}>
                <ModalHeader title="Connection" onConfirm={this.onSubmitResult.bind(this)}/>
                <input
                    type="number"
                    ref={el => this._inpRef = el}
                    className="Globals_inp"
                    placeholder={this.props.placeholder}
                    onKeyDown={DomUtils.handleEnter(this.onSubmitResult.bind(this))}
                    value={this.state.grade}
                    onChange={e => this.setState({grade:e.target.value})}/>

                <Checkbox
                    style={{marginTop:"8px"}}
                    checked={this.state.isBidirectional}
                    label={<div>Bidirectional</div>}
                    onChange={e => this.setState({isBidirectional:e.target.checked})}/>

            </div>
        );
    }

    //endregion
}