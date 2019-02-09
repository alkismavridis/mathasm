import * as React from 'react';
import "./Connection.scss";
import cx from 'classnames';
import {CSSProperties} from "react";

export default class Connection extends React.Component {
    //region STATIC
    props: {
        //data
        grade: number,
        isBidirectional: boolean,

        //actions
        onClick?: any,

        //styling
        style?:CSSProperties,
    };
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