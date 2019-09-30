import React, {Component} from 'react';
import "./StatementMenu.scss";
import ModalHeader from "../ModalHeader/ModalHeader";
import MathAsmStatement from "../../../../core/entities/backend/MathAsmStatement";
import StatementType from "../../../../core/enums/StatementType";
import App from "../../../../core/app/App";
import StmtMenuController from "../../../../core/app/modals/StmtMenuController";

export default class StatementMenu extends Component {
    //region STATIC
    props : {
        ctrl:StmtMenuController,
    };
    //endregion



    isTheorem() : boolean {
        const stmt = this.props.ctrl.statement;
        return stmt && stmt.type == StatementType.THEOREM;
    }

    render() {
        return (
            <div className="MA_window" style={{padding:"8px", minWidth:"170px"}}>
                <ModalHeader title={this.props.ctrl.statement.name} onClose={e=>this.props.ctrl.close()}/>
                {this.isTheorem() &&
                    <button className="MA_menuItem" onClick={e=>this.props.ctrl.onViewProofClicked()}>View Proof</button>
                }
                <button className="MA_menuItem" onClick={e=>this.props.ctrl.onMoveClicked()}>Move</button>
                <button className="MA_menuItem" onClick={e=>this.props.ctrl.onRenameClicked()}>Rename</button>
            </div>
        );
    }
}