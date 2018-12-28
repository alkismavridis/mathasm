import React, {Component} from 'react';
import PropTypes from "prop-types";
import cx from 'classnames';
import "./Dropdown.scss";

export default class Dropdown extends Component {
    //region STATIC
    static propTypes = {
        //data
        options: PropTypes.array.isRequired,
        value: PropTypes.number,

        //actions
        toLabelFunc: PropTypes.func.isRequired,
        toValueFunc: PropTypes.func.isRequired,
        onChange:PropTypes.func,         //It may accept two parameters: the selected option, and the change event

        disabled: PropTypes.bool,


        //styling
        style: PropTypes.object,
        className: PropTypes.string,
    };

    //static defaultProps = {};
    //endregion


    //region FIELDS
    state = {};
    //endregion


    //region LIFE CYCLE
    constructor(props) {
        super(props);
    }

    // componentDidMount() {}
    // static getDerivedStateFromProps(nextProps, prevState) {}
    // shouldComponentUpdate(nextProps, nextState) { return true; }
    // getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    // componentDidUpdate(prevProps, prevState, snapshot) {}
    // componentWillUnmount() {}
    // componentDidCatch(error, info) { console.error("Exception caught"); }
    //endregion


    //region EVENT HANDLERS
    handleChange(e) {
        if(this.props.onChange) this.props.onChange(e.target.value);
    }
    //endregion


    //region RENDERING
    renderOptions() {
        return this.props.options.map(opt => {
            const key = this.props.toValueFunc(opt);
            return <option key={key} value={key}>{this.props.toLabelFunc(opt)}</option>;
        });
    }


    render() {
        return (
            <div className={cx("Dropdown_root", this.props.className)} style={this.props.style}>
                <select value={this.props.value} onChange={e => this.handleChange(e)} disabled={this.props.disabled}>
                    {this.renderOptions()}
                </select>
            </div>
        );
    }

    //endregion
}