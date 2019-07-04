import React, {Component} from 'react';
import "./ConnectionEditDialog.scss";
import ModalHeader from "../ModalHeader/ModalHeader";
import DomUtils from "../../../services/DomUtils";
import Checkbox from "../../ReusableComponents/Inputs/Checkbox/Checkbox";

export default class ConnectionEditDialog extends Component {
    //region STATIC
    props : {
        //data
        grade?:number,
        isBidirectional?:boolean,
        placeholder?:string,

        //actions
        onSubmit?:Function,     //accepts: (grade, isBidirectional)

        //styling
    };

    state : {
        grade:string,
        isBidirectional:boolean,
    };
    //endregion


    //region FIELDS
    _inpRef = null;
    //endregion


    //region LIFE CYCLE
    constructor(props) {
        super(props);

        this.state = {
            grade: props.grade==null? "0" : props.grade.toString(),
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
            <div className="MA_window" style={{padding:"8px"}}>
                <ModalHeader title="Connection" onConfirm={this.onSubmitResult.bind(this)}/>
                <input
                    type="number"
                    ref={el => this._inpRef = el}
                    className="MA_inp"
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