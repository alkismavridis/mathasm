import React, {Component} from 'react';
import "./MainPage.css";
import TheoryExplorer from "../../TheoryExplorer/TheoryExplorer";
import GraphQL from "../../../services/GraphQL";
import QuickInfoService from "../../../services/QuickInfoService";
import GlobalHeader from "../../GlobalHeader/GlobalHeader";
import PropTypes from "prop-types";


class MainPage extends Component {

    //region FIELDS
    state = {
        user: PropTypes.object,
        currentDir: null
    };
    //endregion


    //region LIFE CYCLE
    componentDidMount() {
        this.doInitialFetching();
    }

    doInitialFetching() {
        const qlQuery = `{
            rootDir(depth:1) {
                id,name
                statements {id,name,type}
                subDirs {id,name}
                symbols {uid, text}
            }
        }`;

        GraphQL.run(qlQuery)
            .then(resp => this.setState({currentDir: resp.rootDir}))
            .catch(err => QuickInfoService.makeError("Could not fetch init data!"));
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
    handleCurrentDirChange(newDir) {
        this.setState({currentDir: newDir});
    }

    //endregion


    //region RENDERING
    render() {
        return (
            <div className="MainPage_root">
                <GlobalHeader user={this.props.user}/>
                {this.state.currentDir && <TheoryExplorer
                    onChangeDir={this.handleCurrentDirChange.bind(this)}
                    currentDir={this.state.currentDir}
                    style={{marginTop: "10px"}}/>
                }
            </div>
        );
    }

    //endregion
}

export default MainPage;