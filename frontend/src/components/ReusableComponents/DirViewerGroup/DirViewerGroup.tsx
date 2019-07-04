import React, {Component, CSSProperties} from 'react';
import cx from 'classnames';
import "./DirViewerGroup.scss";
import DirViewer from "./DirViewer/DirViewer";
import MathAsmDir from "../../../entities/backend/MathAsmDir";
import MathAsmStatement from "../../../entities/backend/MathAsmStatement";
import {AppNode} from "../../../entities/frontend/AppNode";
import {AppEvent} from "../../../entities/frontend/AppEvent";
import AppNodeReaction from "../../../enums/AppNodeReaction";
import MapUtils from "../../../services/MapUtils";
import AppEventType from "../../../enums/AppEventType";
import {NONAME} from "dns";

export class MathAsmTab {
    tabId:number;
    initDirId:number;
    currentDir:MathAsmDir;
}


export default class DirViewerGroup extends Component implements AppNode {
    //region FIELDS
    props : {
        //data
        /** A cache of all loaded symbols. Used to display statements. */
        parent:AppNode,
        symbolMap:any,

        //actions
        onCreateAxiomStart?: Function, //accepts the parent dir of the new axiom. This will popup the axiom creator.
        onCreateTheoremStart?: Function, //accepts the parent dir of the new theorem. This will popup the axiom creator.
        onCreateSymbolStart?: Function, //accepts the parent dir of the new symbol. This will popup the symbol creator.

        //styling
        style?: CSSProperties,
        className?: string,
    };

    state = {
        tabs:[
            {tabId:1, initDirId:null, currentDir:null}
        ] as MathAsmTab[],
        selectedTabId:1
    };


    _tabRefs = [];
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


    //region UTILS
    /**
     * Useful function when deleting tabs. It accepts the new list of tabs, and will return the best suitable selected Tab.
     * */
    calculateSelectedIdFor(tabs:MathAsmTab[]) {
        if (tabs.length===0) return null;
        const currentlySelected = tabs.find(t => t.tabId===this.state.selectedTabId);
        return currentlySelected? currentlySelected.tabId : tabs[0].tabId;
    }
    //endregion



    //region APP NODE
    getChildMap(): any {
        const ret = {};
        this._tabRefs.forEach((el, index)=>ret[index]= {current:el});
        return ret;
    }

    getParent(): AppNode {
        return this.props.parent;
    }

    handleChildEvent(event: AppEvent): AppNodeReaction {
        switch (event.type) {
            case AppEventType.DIR_TAB_UPDATED:
                this.handleDirChange(event.data.tabId, event.data.newDir);
                AppEvent.makeDirChange(event.data.newDir).travelAbove(this);
                return AppNodeReaction.NONE;

            default: return AppNodeReaction.UP;
        }
    }

    handleParentEvent(event: AppEvent): AppNodeReaction {
        switch (event.type) {
            case AppEventType.STMT_UPDATED:
            case AppEventType.PROOF_SAVED:
                return AppNodeReaction.DOWN;

            default: return AppNodeReaction.NONE;
        }
    }
    //endregion



    //region EVENT HANDLERS
    handleDirChange(tabId:number, newDirectory:MathAsmDir) {
        //1. Get the tab to update
        const newTabs = this.state.tabs;
        const tabToUpdate = newTabs.find(t => t.tabId===tabId);
        if(!tabToUpdate) return;

        //2. Update the tab
        tabToUpdate.currentDir = newDirectory;

        //3. Update the state
        this.setState({tabs:newTabs});
    }

    appendTab(initDirId:number) {
        //1. Find the new tabID
        const maxTabId = this.state.tabs.reduce(
            (max, current) => (max==null || current.tabId>max ? current.tabId : max),
            0
        );

        //2. Add the tab
        const tabs = this.state.tabs;
        const newTabId = maxTabId? maxTabId+1 : 1;
        tabs.push({tabId:newTabId, initDirId:initDirId, currentDir:null});

        //3. Update the state
        this.setState({
            tabs:tabs,
            selectedTabId:newTabId
        });
    }

    removeTab(tabId:number) {
        //1. Find index to remove
        const indexToRemove = this.state.tabs.findIndex(t => t.tabId===tabId);
        if (indexToRemove<0) return;

        //2. Update the tabs and the state.
        const newTabs = this.state.tabs;
        newTabs.splice(indexToRemove, 1);
        this.setState({tabs:newTabs, selectedTabId:this.calculateSelectedIdFor(newTabs)});
    }

    /** To be called when a tab is being clicked. If shift key was down, the tab will be deleted, otherwise selected*/
    handleTabClick(tabData:MathAsmTab, event:any) {
        if(event.shiftKey) this.removeTab(tabData.tabId);
        else {
            this.setState({selectedTabId:tabData.tabId});
            AppEvent.makeDirChange(tabData.currentDir).travelAbove(this);
        }
    }
    //endregion



    //region RENDERING
    renderTabs(selectedTabId:number) {
        return <div className="MA_flexStart DirViewerGroup_tabDiv">
            {this.state.tabs.map(t => this.renderTab(t, selectedTabId))}
            <div className="DirViewerGroup_addTab" onClick={this.appendTab.bind(this, null)}>+</div>
        </div>;
    }

    /** renders a tab. */
    renderTab(tabData:MathAsmTab, selectedTabId:number) {
        return <div
            key={tabData.tabId}
            onClick={this.handleTabClick.bind(this, tabData)}
            title={tabData.currentDir? "Id: "+tabData.currentDir.id : ""}
            className={cx("DirViewerGroup_tab", tabData.tabId===selectedTabId? "DirViewerGroup_selectedTab" : null)}>
            {tabData.currentDir? tabData.currentDir.name : ""}
        </div>
    }

    render() {
        this._tabRefs = [];

        return (
            <div className={cx("DirViewerGroup_root", this.props.className)} style={this.props.style}>
                {this.renderTabs(this.state.selectedTabId)}
                <div className="DirViewerGroup_main">
                    {this.state.tabs.map((t,index) => <DirViewer
                            ref={el => this._tabRefs[index]=el}
                            parent={this}
                            dir={t.currentDir}
                            style={{flex:1, overflow:"auto"}}
                            key={index}
                            symbolMap={this.props.symbolMap}
                            initDirId={t.initDirId}
                            tabId={t.tabId}
                            isOpen={this.state.selectedTabId === t.tabId}
                            onCreateAxiomStart={this.props.onCreateAxiomStart}
                            onCreateTheoremStart={this.props.onCreateTheoremStart}
                            onCreateSymbolStart={this.props.onCreateSymbolStart}/>
                    )}
                </div>
            </div>
        );
    }
    //endregion
}