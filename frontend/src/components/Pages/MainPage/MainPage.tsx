import React, {Component} from 'react';
import "./MainPage.css";
import TheoryExplorer from "../../TheoryExplorer/TheoryExplorer";
import GlobalHeader from "../../GlobalHeader/GlobalHeader";
import User from "../../../entities/backend/User";


class MainPage extends Component {
    //region FIELDS
    props : {
        //data
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



    //region RENDERING
    render() {
        return (
            <div className="Globals_page MainPage_root">
                <GlobalHeader user={this.props.user}/>
                <TheoryExplorer style={{marginTop: "10px", flex:1}}/>
            </div>
        );
    }

    //endregion
}

export default MainPage;