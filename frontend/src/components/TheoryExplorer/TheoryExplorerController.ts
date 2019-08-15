import {Subject} from "rxjs/index";
import SavedTheoremInfo from "../../entities/backend/SavedTheoremInfo";
import MathAsmStatement from "../../entities/backend/MathAsmStatement";
import MathAsmSymbol from "../../entities/backend/MathAsmSymbol";
import StatementSide from "../../enums/StatementSide";
import MathAsmDir from "../../entities/backend/MathAsmDir";

class SymbolClickInfo {
    symbol: MathAsmSymbol;
    statement?: MathAsmStatement;
    side?: StatementSide;
}


class AxiomSaveInfo {
    statement: MathAsmStatement;
    parentDirId: number;

}

export default class TheoryExplorerController {
    //region FIELDS
    onProofSaved = new Subject<SavedTheoremInfo[]>();
    onAxiomSaved = new Subject<AxiomSaveInfo>();
    onSymbolMapUpdated = new Subject<any>();
    onSymbolClicked = new Subject<SymbolClickInfo>();
    onStmtClicked = new Subject<MathAsmStatement>();
    onShowProof = new Subject<MathAsmStatement>();
    onSymbolRenamed = new Subject<MathAsmSymbol>();
    onDirChanged = new Subject<MathAsmDir>();
    //endregion
}