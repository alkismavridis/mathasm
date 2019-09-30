import * as React from 'react';
import "./DirectoryMenu.scss";
import ModalHeader from "../ModalHeader/ModalHeader";
import App from "../../../../core/app/App";
import DirMenuController from "../../../../core/app/modals/DirMenuController";


export default class DirectoryMenu extends React.Component {
    //region FIELDS
    public props:{
        ctrl:DirMenuController
    };
    //endregion



    //region RENDERING
    render() {
        return (
            <div className="MA_window DirectoryMenu_root" style={{padding:"8px"}}>
                <ModalHeader title={this.props.ctrl.directory.name} onClose={()=>this.props.ctrl.close()}/>
                <button className="MA_menuItem" onClick={e=>this.props.ctrl.onMoveClicked()}>Move</button>
                <button className="MA_menuItem" onClick={e=>this.props.ctrl.onRenameClicked()}>Rename</button>
            </div>
        );
    }
    //endregion
}