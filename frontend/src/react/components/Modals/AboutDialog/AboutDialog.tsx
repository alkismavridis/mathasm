import React, {Component} from 'react';
import "./AboutDialog.css";
import ModalHeader from "../ModalHeader/ModalHeader";
import App from "../../../../core/app/App";
import AboutDialogController from "../../../../core/app/modals/AboutDialogController";



const CONTRIBUTORS = [
    {name:"Mavridis Alkiviadis", "link":"https://alkismavridis/my-cool-profile-page/goes/here"},
    {name:"Inzillo Hermann", "link":"https://hermanninzillo/my-cool-profile-page/goes/here"},
].sort((c1,c2) => c1.name.localeCompare(c2.name));


export default class AboutDialog extends Component {
    //region STATIC
    props : {
        ctrl:AboutDialogController,
    };
    //endregion



    //region RENDERING
    renderContributors() {
        //1. Create the list items
        const contributorItems = CONTRIBUTORS.map((c,index) =>
            <li key={index}>
                <a target="_blank" href={c.link}>{c.name}</a>
            </li>
        );

        //2. Render the div
        return (
            <div className="AboutDialog_contrib">
                <div>Contributors (in alphabetical order):</div>
                <ul style={{margin:"4px 24px", padding:"0"}}>{contributorItems}</ul>
            </div>
        );
    }

    renderTitle() {
        return <div style={{textAlign:"center", margin:"16px 0"}}>
            <div className="AboutDialog_title">MathAsm</div>
            <div>
                licensed under
                <a target="_blank" href="https://www.gnu.org/licenses/old-licenses/gpl-2.0.html"> GLP 2</a>
            </div>
        </div>;
    }

    renderBlahBlah() {
        return (
            <div style={{marginBottom:"16px"}}>
                This application implements MathAsm rules of building mathematical theories.<br/>
                More blah blah goes here...
            </div>
        );
    }


    render() {
        return (
            <div className="MA_window AboutDialog_root">
                <ModalHeader
                    title="About..."
                    onConfirm={() => this.props.ctrl.close()}/>
                {this.renderTitle()}
                {this.renderBlahBlah()}
                {this.renderContributors()}
            </div>
        );
    }

    //endregion
}