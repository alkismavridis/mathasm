import React, {Component} from 'react';
import "./GlobalHeader.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import ModalService from "../../services/ModalService";
import UserMenu from "../Modals/UserMenu/UserMenu";
import AboutDialog from "../Modals/AboutDialog/AboutDialog";
import User from "../../entities/backend/User";

export default class GlobalHeader extends Component {
    //region FIELDS
    props : {
        //data
        user?:User,
        //actions
        //styling
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
    handleUserIconClick() {
        if (!this.props.user) ModalService.showLogin();
        else {
            const id = ModalService.getNextId();
            ModalService.addModal(
                id,
                <UserMenu user={this.props.user} modalId={id}/>
            );
        }
    }

    handleAboutClick() {
        const id = ModalService.getNextId();
        ModalService.addModal(
            id,
            <AboutDialog modalId={id}/>
        )
    }
    //endregion


    //region RENDERING
    renderUserMenu() {
        return (
            <div
                className="MA_flexStart GlobalHeader_userDiv"
                onClick={this.handleUserIconClick.bind(this)}>
                <FontAwesomeIcon icon="user"/>
                <div className="GlobalHeader_userName">{this.props.user && this.props.user.userName}</div>
            </div>
        );
    }

    renderAboutButton() {
        return (
            <div className="GlobalHeader_aboutDiv" onClick={this.handleAboutClick.bind(this)}>
                <FontAwesomeIcon icon="info"/>
            </div>
        )
    }


    render() {
        return (
            <div className="MA_flexAway GlobalHeader_root">
                {this.renderUserMenu()}
                {this.renderAboutButton()}
            </div>
        );
    }

    //endregion
}