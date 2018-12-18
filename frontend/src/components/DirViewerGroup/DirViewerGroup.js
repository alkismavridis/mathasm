import React, {Component} from 'react';
import PropTypes from "prop-types";
import cx from 'classnames';
import "./DirViewerGroup.scss";

export default class DirViewerGroup extends Component {
    //region STATIC
    static propTypes = {
        //data

        //actions
        //onFooBar:PropTypes.func,

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
    render() {
        return (
            <div className={cx("DirViewerGroup_root", this.props.className)} style={this.props.style}>
                hello from DirViewerGroup
            </div>
        );
    }

    //endregion
}