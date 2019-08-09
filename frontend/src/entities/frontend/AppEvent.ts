import {AppNode} from "./AppNode";
import AppEventType from "../../enums/AppEventType";
import MathAsmStatement from "../backend/MathAsmStatement";
import MathAsmSymbol from "../backend/MathAsmSymbol";
import StatementSide from "../../enums/StatementSide";
import SavedTheoremInfo from "../backend/SavedTheoremInfo";
import MathAsmDir from "../backend/MathAsmDir";

export class AppEvent {
    //region FIELDS
    type:AppEventType;
    data:any;
    //endregion


    constructor(type: AppEventType, data: any) {
        this.type = type;
        this.data = data;
    }


    //region TREE TRAVELING
    travelAbove(caller:AppNode) {
        const parent:AppNode = caller!=null && caller.getParent();
        if(parent==null) return;

        const reaction = parent.handleChildEvent(this);
        if ((reaction & 1) != 0) this.travelUnder(parent, caller);
        if ((reaction & 2) != 0) this.travelAbove(parent); //recursion
    }

    travelUnder(caller:AppNode, excludedChild:AppNode) {
        const children:any = caller!=null && caller.getChildMap();
        if(children==null) return;

        for(const key in children) {
            if(!children.hasOwnProperty(key)) continue;
            const reactRef = children[key];
            if(reactRef==null) continue;

            const child = reactRef.current;
            if(child==null) continue;

            if (child == null || child == excludedChild) continue;
            const reaction = child.handleParentEvent(this);
            if ((reaction & 1) == 1) this.travelUnder(child, null); //recursion
        }
    }
    //endregion



    //region EVENT GENERATORS
    /**
     * Creates an event that indicates that a symbol has been clicked.
     * If that symbol was part of a statement, it is possible that the handler cares more about the statement (or sentence)
     * than the symbol itself.
     *
     * Thus, this event provides information about the statement, and the location of the symbol in that statement.
     * Those information can be undefined, if the symbol was not a part of a statement.
     * */
    static makeSymbolSelect(symbol:MathAsmSymbol, statementOfSymbol?:MathAsmStatement, sideInStatement?:StatementSide) : AppEvent {
        const data = {
            symbol: symbol,
            statement: statementOfSymbol,
            side: sideInStatement
        };
        return new AppEvent(AppEventType.SYMBOL_SELECTED, data);
    }

    static makeProofShow(stmt: MathAsmStatement) : AppEvent {
        return new AppEvent(AppEventType.SHOW_PROOF, stmt)
    }

    static makeStatementUpdate(stmt: MathAsmStatement, parendDirId:number) :AppEvent {
        const data = {
            statement: stmt,
            parentDirId: parendDirId
        };
        return new AppEvent(AppEventType.STMT_UPDATED, data);

    }

    static makeProofSaved(saveInfo:SavedTheoremInfo[]) : AppEvent {
        return new AppEvent(AppEventType.PROOF_SAVED, saveInfo);
    }

    /** sent by the DirViewer when a new directory is being shown. */
    static makeDirChange(newDir:MathAsmDir) : AppEvent {
        return new AppEvent(AppEventType.DIR_CHANGED, newDir);
    }

    /** sent by the DirViewer to its parent when a tab is being updated. */
    static makeDirTabUpdated(tabId:number, newDir:MathAsmDir) : AppEvent {
        const data = {
            tabId:tabId,
            newDir:newDir
        };
        return new AppEvent(AppEventType.DIR_TAB_UPDATED, data);
    }

    static makeNewTab(dirId:number, dirData:MathAsmDir, focus:boolean) : AppEvent {
        const data = {
            dirId:dirId,
            dirData:dirData,
            focus:focus
        };
        return new AppEvent(AppEventType.ADD_NEW_TAB, data);
    }

    /** sent by the DirViewer when a new directory is being shown. */
    static makeSymbolRenamed(symbol:MathAsmSymbol) : AppEvent {
        return new AppEvent(AppEventType.SYMBOL_RENAMED, symbol);
    }
    //endregion
}