import * as React from 'react';
import "./DirectoryMenu.scss";
import ModalHeader from "../ModalHeader/ModalHeader";
import App from "../../../services/App";

const q = {

};


export default class DirectoryMenu extends React.Component {
    //region FIELDS
    public props:{
        app:App,
        modalId?:number,
        directory:any,

        //actions
        onMoveClicked?:Function,
        onRenameClicked?:Function,

        //styling
    };
    //endregion



    //region LIFE CYCLE
    //endregion


    //region EVENT HANDLERS
    closeDialog() {
        this.props.app.modalService.removeModal(this.props.modalId);
    }

    handleMoveClick = ()=> {
        this.closeDialog();
        if(this.props.onMoveClicked) this.props.onMoveClicked();
    };

    handleRenameClick = ()=> {
        this.closeDialog();
        if(this.props.onRenameClicked) this.props.onRenameClicked();
    };
    //endregion


    //region RENDERING
    render() {
        return (
            <div className="MA_window DirectoryMenu_root" style={{padding:"8px"}}>
                <ModalHeader
                    title={this.props.directory.name}
                    onClose={()=>this.closeDialog()}/>

                <button className="MA_menuItem" onClick={this.handleMoveClick}>Move</button>
                <button className="MA_menuItem" onClick={this.handleRenameClick}>Rename</button>
            </div>
        );
    }

    //endregion
}