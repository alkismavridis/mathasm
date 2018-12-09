import React, {Component} from 'react';
import PropTypes from "prop-types";
import "./GlobalHeader.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import ModalService from "../../services/ModalService";

export default class GlobalHeader extends Component {
    //region STATIC
    static propTypes = {
        //data
        user:PropTypes.object,
        //actions
        //styling
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
    renderUserMenu() {
        return (
            <div
                className="Globals_flexStart GlobalHeader_userDiv"
                onClick={ModalService.showLogin.bind(ModalService)}>
                <FontAwesomeIcon icon="user"/>
                <div className="GlobalHeader_userName">{this.props.user && this.props.user.userName}</div>
            </div>
        );
    }


    render() {
        return (
            <div className="Globals_flexAway GlobalHeader_root">
                {this.renderUserMenu()}
            </div>
        );
    }

    //endregion
}