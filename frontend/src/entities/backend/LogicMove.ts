import MathAsmStatement from "./MathAsmStatement";
import MoveType from "../../enums/MoveType";
import StatementSide from "../../enums/StatementSide";
import BackendMoveType from "../../enums/BackendMoveType";

export default class LogicMove {
    id:number;
    index:number;
    extBase:MathAsmStatement;
    intBaseId:number;
    moveType:BackendMoveType;
    targetId:number;
    side:StatementSide;
    pos:number;
    parentId:number;
    name:string;
}