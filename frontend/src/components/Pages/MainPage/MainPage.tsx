import React, {Component, useState} from 'react';
import "./MainPage.css";
import TheoryExplorer from "../../TheoryExplorer/TheoryExplorer";
import GlobalHeader from "../../GlobalHeader/GlobalHeader";
import User from "../../../entities/backend/User";
import {AppNode} from "../../../entities/frontend/AppNode";
import {AppEvent} from "../../../entities/frontend/AppEvent";
import AppEventType from "../../../enums/AppEventType";
import AppNodeReaction from "../../../enums/AppNodeReaction";


class MainPage extends Component implements AppNode{
    //region FIELDS
    props : {
        //data
        parent:AppNode,
        user:User,

        //actions
        //styling
    };
    //endregion


    //region LIFE CYCLE
    componentDidMount() {
    }



    //static getDerivedStateFromProps(nextProps, prevState) {}
    //shouldComponentUpdate(nextProps, nextState) { return true; }
    //getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    //componentDidUpdate(prevProps, prevState, snapshot) {}
    //componentWillUnmount() {}

    //componentDidCatch(error, info) {
    //    console.error("Exception caught");
    //}

    //endregion



    //region APP NODE
    getChildMap(): any {
    }

    getParent(): AppNode {
        return this.props.parent;
    }

    handleChildEvent(event: AppEvent) : AppNodeReaction {
        return AppNodeReaction.BOTH;
    }

    handleParentEvent(event: AppEvent) : AppNodeReaction {
        return AppNodeReaction.BOTH;
    }
    //endregion



    //region RENDERING
    render() {
        return (
            <div className="MA_page MainPage_root">
                <GlobalHeader user={this.props.user}/>
                <TheoryExplorer style={{marginTop: "10px", flex:1}}/>
            </div>
        );
    }

    //endregion
}

export default MainPage;