import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./Checkbox.scss";

export default class Checkbox extends Component {
    //region STATIC
    static propTypes = {
        //data
        label: PropTypes.node,
        checked:PropTypes.bool.isRequired,

        //actions
        onChange:PropTypes.func,

        //styling
        style:PropTypes.object,
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
            <label className="Globals_flexStart Checkbox_root" style={this.props.style}>
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