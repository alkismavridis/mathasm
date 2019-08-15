import React, {Component} from 'react';
import "./MainPage.css";
import TheoryExplorer from "../../TheoryExplorer/TheoryExplorer";
import GlobalHeader from "../../GlobalHeader/GlobalHeader";
import App from "../../../services/App";


class MainPage extends Component {
    //region FIELDS
    props : {
        //data
        app:App,

        //actions
        //styling
    };
    //endregion


    //region LIFE CYCLE
    componentDidMount() {
    }
    //endregion



    //region RENDERING
    render() {
        return (
            <div className="MA_page MainPage_root">
                <GlobalHeader app={this.props.app}/>
                <TheoryExplorer app={this.props.app} style={{marginTop: "10px", flex:1}}/>
            </div>
        );
    }

    //endregion
}

export default MainPage;