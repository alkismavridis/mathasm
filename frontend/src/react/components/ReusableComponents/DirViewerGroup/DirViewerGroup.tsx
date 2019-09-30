import React, {Component, CSSProperties} from 'react';
import cx from 'classnames';
import "./DirViewerGroup.scss";
import DirViewer from "./DirViewer/DirViewer";
import DirViewerGroupController from "../../../../core/app/DirViewerGroupController";
import MapUtils from "../../../../core/utils/MapUtils";
import {MathAsmTabController} from "../../../../core/app/MathAsmTabController";
import {Subscription} from "rxjs/index";
import {unsubscribeAll, updateOn} from "../../../utils/SubscriptionUtils";




export default class DirViewerGroup extends Component {
    //region FIELDS
    props : {
        ctrl:DirViewerGroupController,
        style?: CSSProperties,
        className?: string,
    };

    subscriptions:Subscription[] = [];
    //endregion



    //region LIFE CYCLE
    componentDidMount() {
        updateOn(this.props.ctrl.onChange, this);
    }

    componentWillUnmount() { unsubscribeAll(this); }
    //endregion



    //region EVENT HANDLERS
    /** To be called when a ctrl is being clicked. If shift key was down, the ctrl will be deleted, otherwise selected*/
    handleTabClick(tabData:MathAsmTabController, event:any) {
        if(event.shiftKey) this.props.ctrl.removeTab(tabData.tabId);
        else this.props.ctrl.setActiveTab(tabData.tabId);
    }
    //endregion



    //region RENDERING
    renderTabs(selectedTabId:number) {
        return <div className="MA_flexStart DirViewerGroup_tabDiv">
            {MapUtils.mapToArray(this.props.ctrl.tabs, t => this.renderTab(t, selectedTabId))}
            <div className="DirViewerGroup_addTab" onClick={()=>this.props.ctrl.appendTab(null, null, true)}>+</div>
        </div>;
    }

    /** renders a ctrl. */
    renderTab(tabData:MathAsmTabController, selectedTabId:number) {
        return <div
            key={tabData.tabId}
            onClick={this.handleTabClick.bind(this, tabData)}
            title={tabData.currentDir? "Id: "+tabData.currentDir.id : ""}
            className={cx("DirViewerGroup_tab", tabData.tabId===selectedTabId? "DirViewerGroup_selectedTab" : null)}>
            {tabData.currentDir? tabData.currentDir.name : ""}
        </div>
    }

    render() {
        return (
            <div className={cx("DirViewerGroup_root", this.props.className)} style={this.props.style}>
                {this.renderTabs(this.props.ctrl.selectedTabId)}
                <div className="DirViewerGroup_main">
                    {MapUtils.mapToArray(
                        this.props.ctrl.tabs,
                        (t,id) => <DirViewer key={id} ctrl={t} style={{flex:1, overflow:"auto"}}/>
                    )}
                </div>
            </div>
        );
    }
    //endregion
}