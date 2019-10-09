import MathAsmSymbol from "../backend/MathAsmSymbol";
import MathAsmStatement from "../backend/MathAsmStatement";
import StatementSide from "../../enums/StatementSide";

export default class SymbolSelectionInfo {
    symbol: MathAsmSymbol;
    statement?: MathAsmStatement;
    side?: StatementSide;
}