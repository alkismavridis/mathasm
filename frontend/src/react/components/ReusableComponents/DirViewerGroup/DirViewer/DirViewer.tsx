import React, {Component, CSSProperties} from 'react';
import cx from 'classnames';
import "./DirViewer.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome/index.es";
import Statement from "../../Statement/Statement";
import StatementType from "../../../../../core/enums/StatementType";
import SortingUtils from "../../../../../core/utils/SortingUtils";
import MathAsmDir from "../../../../../core/entities/backend/MathAsmDir";
import MathAsmStatement from "../../../../../core/entities/backend/MathAsmStatement";
import MathAsmSymbol from "../../../../../core/entities/backend/MathAsmSymbol";
import {Subscription} from "rxjs/index";
import {unsubscribeAll, updateOn} from "../../../../utils/SubscriptionUtils";
import {MathAsmTabController} from "../../../../../core/app/MathAsmTabController";



export default class DirViewer extends Component {
    //region FIELDS
    props : {
        ctrl:MathAsmTabController,
        style?: CSSProperties,
        className?: string,
    };

    subscriptions:Subscription[] = [];
    //endregion



    //region LIFE CYCLE
    componentDidMount() {
        updateOn(this.props.ctrl.onChange, this);
    }

    componentWillUnmount() {
        unsubscribeAll(this);
    }
    //endregion



    //region GETTERS
    private getCssClassForStatement(stmt:MathAsmStatement) : string {
        switch(stmt.type) {
            case StatementType.THEOREM: return "DirViewer_th";
            case StatementType.AXIOM: return "DirViewer_ax";
            default: return "";
        }
    }
    //endregion



    //region EVENT HANDLERS
    private showStmtMenu(stmt:MathAsmStatement, event:any) {
        event.stopPropagation();
        event.preventDefault();
        this.props.ctrl.showStmtMenu(stmt);
    }

    private showSymbolMenu(sym:MathAsmSymbol, event:any) {
        event.stopPropagation();
        event.preventDefault();
        this.props.ctrl.showSymbolMenu(sym);
    }

    private showDirMenu(dir:MathAsmDir, event:any) {
        event.stopPropagation();
        event.preventDefault();
        this.props.ctrl.showDirMenu(dir);
    }
    //endregion




    //region RENDERING
    //item rendering
    private renderSubDir(subDir:MathAsmDir) {
        return (
            <div
                key={subDir.id}
                className="DirViewer_subDir"
                title={"Id: " + subDir.id}
                onClick={e=>this.props.ctrl.navigateTo(subDir.id, e.ctrlKey)}>
                {subDir.name}
                <div className="DirViewer_menuBut" onClick={(event)=>this.showDirMenu(subDir, event)}>
                    <FontAwesomeIcon icon="bars" className="MA_12px"/>
                </div>
            </div>
        );
    }

    private renderStatement(stmt:MathAsmStatement) {
        return (
            <div
                key={stmt.id}
                className={`DirViewer_stmtDiv ${this.getCssClassForStatement(stmt)}`}
                onClick={()=>this.props.ctrl.handleStatementClick(stmt)}
                title={"Id: "+stmt.id}>
                <div className="DirViewer_stmtName">{stmt.name}</div>
                <Statement
                    statement={stmt}
                    symbolMap={this.props.ctrl.symbolMap}
                    onSymbolClick={(sym, side) => {
                        this.props.ctrl.handleSymbolClick({symbol:sym, statement:stmt, side:side});
                    }}/>
                <div className="DirViewer_menuBut" onClick={(event)=>this.showStmtMenu(stmt, event)}>
                    <FontAwesomeIcon icon="bars" className="MA_12px"/>
                </div>
            </div>
        );
    }

    private renderSymbol(sym:MathAsmSymbol) {
        return (
            <div
                key={sym.uid}
                title={"Id: " + sym.uid}
                className="DirViewer_sym"
                onClick={()=>this.props.ctrl.handleSymbolClick({symbol:sym})}>
                {sym.text}
                <div className="DirViewer_menuBut" onClick={(event)=>this.showSymbolMenu(sym, event)}>
                    <FontAwesomeIcon icon="bars" className="MA_12px"/>
                </div>
            </div>
        );
    }

    private renderToolbar() {
        return (
            <div className="MA_flexStart" style={{marginTop:"16px"}}>
                <button
                    className="MA_roundBut"
                    title="Go to parent dir"
                    style={{backgroundColor: "#62676d", width: "32px", height: "32px", fontSize: "16px", margin:"0 4px"}}
                    onClick={e => this.props.ctrl.goToParentDir(e.ctrlKey)}>
                    <FontAwesomeIcon icon="arrow-up"/>
                </button>
                <button
                    className="MA_roundBut"
                    title="Go to..."
                    style={{backgroundColor: "#3e49d1", width: "32px", height: "32px", margin:"0 4px"}}
                    onClick={()=>this.props.ctrl.handleGoToDirClick()}>
                    <FontAwesomeIcon icon="plane"/>
                </button>
                <button
                    className="MA_roundBut"
                    title="Create directory"
                    style={{backgroundColor: "orange", width: "32px", height: "32px", fontSize: "18px", margin:"0 20px 0 4px"}}
                    onClick={()=>this.props.ctrl.handleCreateDirClick()}>
                    <FontAwesomeIcon icon="folder-plus"/>
                </button>
                <button
                    className="MA_roundBut"
                    title="Create symbol"
                    style={{backgroundColor: "cornflowerblue", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                    onClick={()=>this.props.ctrl.toggleSymbolCreationMode()}>
                    <FontAwesomeIcon icon="dollar-sign"/>
                </button>
                <button
                    className="MA_roundBut"
                    title="Create axiom"
                    style={{backgroundColor: "red", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                    onClick={()=>this.props.ctrl.toggleAxiomCreationMode()}>
                    <FontAwesomeIcon icon="font" className="MA_16px"/>
                </button>
                <button
                    className="MA_roundBut"
                    title="Create theorem"
                    style={{backgroundColor: "#24a033", width: "32px", height: "32px", fontSize: "18px", margin:"0 4px"}}
                    onClick={()=>this.props.ctrl.toggleTheoremCreationMode()}>
                    <FontAwesomeIcon icon="cubes"/>
                </button>
            </div>
        );
    }

    private renderStatements() {
        const statements = this.props.ctrl.currentDir.statements;
        if (!statements || statements.length === 0) return null;

        return (
            <div className="MA_flexWrapDown" style={{margin:"8px 0 0 12px"}}>
                {statements.map(this.renderStatement.bind(this))}
            </div>
        );
    }

    private renderSubDirs() {
        const dirs = this.props.ctrl.currentDir.subDirs;

        return (
            <div className="MA_flexWrapDown" style={{margin:"24px 0 0 12px"}}>
                {dirs.map(this.renderSubDir.bind(this))}
            </div>
        );
    }

    private renderSymbols() {
        const symbols = SortingUtils.sortSymbolsById(this.props.ctrl.currentDir.symbols);
        if (!symbols || symbols.length === 0) return null;

        return (
            <div className="DirViewer_symbolsDiv">
                {symbols.map(this.renderSymbol.bind(this))}
            </div>
        );
    }


    render() {
        if (!this.props.ctrl.currentDir || !this.props.ctrl.isSelected) return null;

        return (
            <div className={cx("DirViewer_root", this.props.className)} style={this.props.style}>
                {this.renderToolbar()}
                {this.renderSubDirs()}
                {this.renderStatements()}
                {this.renderSymbols()}
            </div>
        );
    }
    //endregion
}