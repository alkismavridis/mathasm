import React, {Component, CSSProperties} from 'react';
import "./Checkbox.scss";

export default class Checkbox extends Component {
    //region STATIC
    props : {
        //data
        label?: React.ReactNode,
        checked:boolean,

        //actions
        onChange?:any,

        //styling
        style?:CSSProperties,
    };

    //static defaultProps = {};
    //endregion


    //region LIFE CYCLE
    // constructor(props) { super(props); }
    // componentDidMount() {}
    // static getDerivedStateFromProps(nextProps, prevState) {}
    // shouldComponentUpdate(nextProps, nextState) { return true; }
    // getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    // componentDidUpdate(prevProps, prevState, snapshot) {}
    // componentWillUnmount() {}
    // componentDidCatch(error, info) { console.error("Exception caught"); }
    //endregion


    //region EVENT HANDLERS
    //endregion


    //region RENDERING
    render() {
        return (
            <label className="MA_flexStart Checkbox_root" style={this.props.style}>
                <input
                    type="checkbox"
                    checked={this.props.checked}
                    onChange={this.props.onChange}/>
                {this.props.label}
            </label>
        );
    }

    //endregion
}