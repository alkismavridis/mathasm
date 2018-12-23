import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./Connection.scss";
import cx from 'classnames';

export default class Connection extends Component {
    //region STATIC
    static propTypes = {
        //data
        grade: PropTypes.number.isRequired,
        isBidirectional: PropTypes.bool.isRequired,

        //actions
        onClick: PropTypes.func,

        //styling
        style:PropTypes.object,
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
    render() {
        return (
            <div
                className={cx("Connection_root", this.props.onClick? "Connection_clickable":null)}
                style={this.props.style}
                onClick={this.props.onClick}>
                {this.props.grade>0 && <div className="Connection_grade">{this.props.grade}</div>}
                <div className="Connection_arrow">
                    {this.props.isBidirectional? "<---->" : "---->"}
                </div>
            </div>
        );
    }

    //endregion
}