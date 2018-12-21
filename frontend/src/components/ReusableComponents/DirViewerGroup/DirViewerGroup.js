import React, {Component} from 'react';
import PropTypes from "prop-types";
import cx from 'classnames';
import "./DirViewerGroup.scss";
import DirViewer from "./DirViewer/DirViewer";

export default class DirViewerGroup extends Component {
    //region STATIC
    static propTypes = {
        //data

        //actions
        onCreateAxiomStart: PropTypes.func, //accepts the parent dir of the new axiom. This will popup the axiom creator.
        onCreateSymbolStart: PropTypes.func, //accepts the parent dir of the new symbol. This will popup the symbol creator.
        onSymbolClicked: PropTypes.func, //accepts the clicked symbol.

        //styling
        style: PropTypes.object,
        className: PropTypes.string,
    };

    //static defaultProps = {};
    //endregion


    //region FIELDS
    state = {
        tabs:[
            {tabId:1, initDir:null}
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




    //region API
    /** Integrates a new statement into the group. */
    addStatement(stmt, directory) {
        console.log(stmt);
        console.log(this._tabRefs);
        this._tabRefs.forEach(tabRef => {
            //TODO if directory matches
            console.log(tabRef);

            tabRef.addStatement(stmt);
        });
    }
    //endregion


    //region EVENT HANDLERS
    handleDirChange(tabId, newDirectory) {
        //TODO
    }
    //endregion


    //region RENDERING
    render() {
        this._tabRefs = [];

        return (
            <div className={cx("DirViewerGroup_root", this.props.className)} style={this.props.style}>
                <div className="DirViewerGroup_tabDiv">TABS</div>
                <div className="DirViewerGroup_main">
                    {this.state.tabs.map((t,index) => <DirViewer
                            ref={el => this._tabRefs[index]=el}
                            key={index}
                            initDirId={t.initDir}
                            onDirChanged={this.handleDirChange.bind(this, t.tabId)}
                            onSymbolClicked={this.props.onSymbolClicked}
                            onCreateAxiomStart={this.props.onCreateAxiomStart}
                            onCreateSymbolStart={this.props.onCreateSymbolStart}/>
                    )}
                </div>
            </div>
        );
    }

    //endregion
}