import React, {Component, CSSProperties} from 'react';
import cx from 'classnames';
import "./DirViewerGroup.scss";
import DirViewer from "./DirViewer/DirViewer";
import MathAsmDir from "../../../entities/backend/MathAsmDir";
import SortingUtils from "../../../services/symbol/SortingUtils";
import App from "../../../services/App";
import TheoryExplorerController from "../../TheoryExplorer/TheoryExplorerController";

export class MathAsmTab {
    tabId:number;
    initDirId:number;
    currentDir:MathAsmDir;
}


export default class DirViewerGroup extends Component {
    //region FIELDS
    props : {
        //data
        /** A cache of all loaded symbols. Used to display statements. */
        app:App,
        controller:TheoryExplorerController,
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



    //region EVENT HANDLERS
    handleTabUpdated(tabId:number, newDir:MathAsmDir) {
        this.handleDirChange(tabId, newDir);
        if(tabId==this.state.selectedTabId) this.props.controller.onDirChanged.next(newDir);
    }

    handleDirChange(tabId:number, newDirectory:MathAsmDir) {
        //1. Get the tab to update
        const newTabs = this.state.tabs;
        const tabToUpdate = newTabs.find(t => t.tabId===tabId);
        if(!tabToUpdate) return;

        //2. Update the tab
        if(newDirectory.statements) {
            newDirectory.statements = SortingUtils.sortByTypeAndId(newDirectory.statements);
        }
        tabToUpdate.currentDir = newDirectory;

        //3. Update the state
        this.setState({tabs:newTabs});
    }

    appendTab(initDirId:number, dirData:MathAsmDir, focus:boolean) {
        //1. Find the new tabID
        const maxTabId = this.state.tabs.reduce(
            (max, current) => (max==null || current.tabId>max ? current.tabId : max),
            0
        );

        //2. Sort the statements
        if(dirData && dirData.statements) {
            dirData.statements = SortingUtils.sortByTypeAndId(dirData.statements);
        }

        //3. Add the tab
        const tabs = this.state.tabs;
        const newTabId = maxTabId? maxTabId+1 : 1;
        tabs.push({tabId:newTabId, initDirId:initDirId, currentDir:dirData});

        //4. Update the state
        this.setState({
            tabs:tabs,
            selectedTabId:focus? newTabId : this.state.selectedTabId
        });
    }

    removeTab(tabId:number) {
        //1. Find index to remove
        const indexToRemove = this.state.tabs.findIndex(t => t.tabId===tabId);
        if (indexToRemove<0) return;

        //2. Update the tabs and the state.
        const newTabs = this.state.tabs;
        newTabs.splice(indexToRemove, 1);

        const selectedId = this.calculateSelectedIdFor(newTabs);
        this.setState({tabs:newTabs, selectedTabId:selectedId});

        if(selectedId!=null) {
            const tabData = this.state.tabs.find(t => t.tabId==selectedId);
            this.props.controller.onDirChanged.next(tabData.currentDir);
        }
        else this.props.controller.onDirChanged.next(null);
    }

    /** To be called when a tab is being clicked. If shift key was down, the tab will be deleted, otherwise selected*/
    handleTabClick(tabData:MathAsmTab, event:any) {
        if(event.shiftKey) this.removeTab(tabData.tabId);
        else {
            this.setState({selectedTabId:tabData.tabId});
            this.props.controller.onDirChanged.next(tabData.currentDir);
        }
    }
    //endregion



    //region RENDERING
    renderTabs(selectedTabId:number) {
        return <div className="MA_flexStart DirViewerGroup_tabDiv">
            {this.state.tabs.map(t => this.renderTab(t, selectedTabId))}
            <div className="DirViewerGroup_addTab" onClick={this.appendTab.bind(this, null, null, true)}>+</div>
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
        return (
            <div className={cx("DirViewerGroup_root", this.props.className)} style={this.props.style}>
                {this.renderTabs(this.state.selectedTabId)}
                <div className="DirViewerGroup_main">
                    {this.state.tabs.map((t,index) => <DirViewer
                            app={this.props.app}
                            controller={this.props.controller}
                            onAddTab={this.appendTab.bind(this)}
                            onTabUpdated={this.handleTabUpdated.bind(this)}
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