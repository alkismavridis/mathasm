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
    renderOptions() {
        return (
            function () {
                var options = [];

                this.props.options.forEach(function (option) {

                        options.push(
                            <option value={option.value}>{option.label}</option>
                        );
                    }
                )

                return options;
            });
    }


    render() {
        return (
            <div className={cx("Dropdown_root", this.props.className)} style={this.props.style}>
                <select value={this.props.value}>
                    {this.renderOptions()}
                </select>
            </div>
        );
    }

    //endregion
}