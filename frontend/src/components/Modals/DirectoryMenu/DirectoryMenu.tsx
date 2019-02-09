import * as React from 'react';
import "./DirectoryMenu.scss";
import ModalHeader from "../ModalHeader/ModalHeader";
import ModalService from "../../../services/ModalService";

const q = {

};


export default class DirectoryMenu extends React.Component {
    //region FIELDS
    public props:{
        modalId?:number,
        directory:any,

        //actions
        onMoveClicked?:Function,

        //styling
    };
    //endregion



    //region LIFE CYCLE
    //endregion


    //region EVENT HANDLERS
    closeDialog() {
        ModalService.removeModal(this.props.modalId);
    }

    handleMoveClick = ()=> {
        this.closeDialog();
        if(this.props.onMoveClicked) this.props.onMoveClicked();
    };
    //endregion


    //region RENDERING
    render() {
        return (
            <div className="Globals_window" style={{padding:"8px"}}>
                <ModalHeader
                    title={this.props.directory.name}
                    onClose={()=>this.closeDialog()}/>

                <div className="Globals_menuItem" onClick={this.handleMoveClick}>Move</div>
                <div className="Globals_menuItem" onClick={()=>{
                    window.alert("TODO not yet implemented");
                    this.closeDialog();
                }}>Rename</div>
            </div>
        );
    }

    //endregion
}