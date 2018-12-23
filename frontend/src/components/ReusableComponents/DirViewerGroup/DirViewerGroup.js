import React, {Component} from 'react';
import PropTypes from "prop-types";
import cx from 'classnames';
import "./DirViewerGroup.scss";
import DirViewer from "./DirViewer/DirViewer";

export default class DirViewerGroup extends Component {
    //region STATIC
    static propTypes = {
        //data
        /** A cache of all loaded symbols. Used to display statements. */
        symbolMap:PropTypes.object.isRequired,

        //actions
        onCreateAxiomStart: PropTypes.func, //accepts the parent dir of the new axiom. This will popup the axiom creator.
        onCreateSymbolStart: PropTypes.func, //accepts the parent dir of the new symbol. This will popup the symbol creator.
        onUpdateSymbolMap: PropTypes.func.isRequired, //accepts a map of symbols. This must be called every time new, unknown symbols have been loaded from the server.
        onSymbolClicked: PropTypes.func, //accepts the clicked symbol.
        onStatementClicked: PropTypes.func, //accepts the clicked statement.

        //styling
        style: PropTypes.object,
        className: PropTypes.string,
    };

    //static defaultProps = {};
    //endregion


    //region FIELDS
    state = {
        tabs:[
            {tabId:1, initDirId:null, currentDir:null}
        ],
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
    calculateSelectedIdFor(tabs) {
        if (tabs.length===0) return null;
        const currentlySelected = tabs.find(t => t.tabId===this.state.selectedTabId);
        return currentlySelected? currentlySelected.tabId : tabs[0].tabId;
    }
    //endregion


    //region API
    /** Integrates a new statement into the group. */
    statementCreated(stmt, directory) {
        this._tabRefs.forEach(tabRef => {
            tabRef.statementCreated(stmt, directory);
        });
    }
    //endregion


    //region EVENT HANDLERS
    handleDirChange(tabId, newDirectory) {
        //1. Get the tab to update
        const newTabs = this.state.tabs;
        const tabToUpdate = newTabs.find(t => t.tabId===tabId);
        if(!tabToUpdate) return;

        //2. Update the tab
        tabToUpdate.currentDir = newDirectory;

        //3. Update the state
        this.setState({tabs:newTabs});
    }

    appendTab(initDirId) {
        //1. Find the new tabID
        const maxTabId = this.state.tabs.reduce(
            (max, current) => (max==null || current.tabId>max ? current.tabId : max),
            0
        );

        //2. Add the tab
        const tabs = this.state.tabs;
        tabs.push({tabId:maxTabId? maxTabId+1 : 1, initDirId:initDirId, currentDir:null});

        //3. Update the state
        this.setState({tabs:tabs});
    }

    removeTab(tabId) {
        //1. Find index to remove
        const indexToRemove = this.state.tabs.findIndex(t => t.tabId===tabId);
        if (indexToRemove<0) return;

        //2. Update the tabs and the state.
        const newTabs = this.state.tabs;
        newTabs.splice(indexToRemove, 1);
        this.setState({tabs:newTabs, selectedTabId:this.calculateSelectedIdFor(newTabs)});
    }

    /** To be called when a tab is being clicked. If shift key was down, the tab will be deleted, otherwise selected*/
    handleTabClick(tabData, event) {
        if(event.shiftKey) this.removeTab(tabData.tabId);
        else this.setState({selectedTabId:tabData.tabId})
    }
    //endregion



    //region RENDERING
    renderTabs(selectedTabId) {
        return <div className="Globals_flexStart DirViewerGroup_tabDiv">
            {this.state.tabs.map(t => this.renderTab(t, selectedTabId))}
            <div className="DirViewerGroup_addTab" onClick={this.appendTab.bind(this, null)}>+</div>
        </div>;
    }

    /** renders a tab. */
    renderTab(tabData, selectedTabId) {
        return <div
            key={tabData.tabId}
            onClick={this.handleTabClick.bind(this, tabData)}
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
                            style={{flex:1, overflow:"auto"}}
                            key={index}
                            symbolMap={this.props.symbolMap}
                            initDirId={t.initDirId}
                            isOpen={this.state.selectedTabId === t.tabId}
                            onUpdateSymbolMap={this.props.onUpdateSymbolMap}
                            onDirChanged={this.handleDirChange.bind(this, t.tabId)}
                            onSymbolClicked={this.props.onSymbolClicked}
                            onCreateAxiomStart={this.props.onCreateAxiomStart}
                            onCreateSymbolStart={this.props.onCreateSymbolStart}
                            onStatementClicked={this.props.onStatementClicked}/>
                    )}
                </div>
            </div>
        );
    }

    //endregion
}