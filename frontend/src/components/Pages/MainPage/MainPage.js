import React, {Component} from 'react';
import "./MainPage.css";
import TheoryExplorer from "../../TheoryExplorer/TheoryExplorer";
import GraphQL from "../../../services/GraphQL";
import QuickInfoService from "../../../services/QuickInfoService";
import GlobalHeader from "../../GlobalHeader/GlobalHeader";
import PropTypes from "prop-types";


class MainPage extends Component {
    //region STATIC
    static propTypes = {
        //data
        user:PropTypes.object,

        //actions
        //styling
    };
    //endregion



    //region FIELDS
    state = {
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


    //region PAGE STUFF
    //endregion


    //region EVENT HANDLERS
    handleCurrentDirChange(newDir) {}

    //endregion


    //region RENDERING
    render() {
        return (
            <div className="MainPage_root">
                <GlobalHeader user={this.props.user}/>
                <TheoryExplorer
                    onChangeDir={this.handleCurrentDirChange.bind(this)}
                    style={{marginTop: "10px"}}/>
            </div>
        );
    }

    //endregion
}

export default MainPage;