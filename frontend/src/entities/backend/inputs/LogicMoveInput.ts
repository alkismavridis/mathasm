import MoveType from "../../../enums/MoveType";
import StatementSide from "../../../enums/StatementSide";
import BackendMoveType from "../../../enums/BackendMoveType";

export default class LogicMoveInput {
    id:number;
    index:number;
    extBaseId:number;
    intBaseId:number;
    moveType:BackendMoveType;
    targetId:number;
    side:StatementSide;
    pos:number;
    parentId:number;
    name:string;


    //region CONSTRUCTORS AND GENERATORS

    static makeStart(targetId:number, extBaseId:number, intBaseId:number, side:StatementSide) : LogicMoveInput {
        const ret = new LogicMoveInput();
        ret.moveType = BackendMoveType.START;
        ret.targetId = targetId;
        ret.extBaseId = extBaseId;
        ret.intBaseId = intBaseId;
        ret.side = side;
        return ret;
    }

    /**
     * @param pos is needed only for ONE_IN_FOO moves
     *        to determine the position of the replacement.
     * */
    static makeReplace(moveType:BackendMoveType, targetId:number, extBaseId:number, intBaseId:number, side:StatementSide, pos?:number) : LogicMoveInput {
        const ret = new LogicMoveInput();
        ret.moveType = moveType;
        ret.targetId = targetId;
        ret.extBaseId = extBaseId;
        ret.intBaseId = intBaseId;
        ret.moveType = moveType;
        ret.targetId = BackendMoveType.ONE_IN_LEFT;

        return ret;
    }

    static makeSave(targetId:number, parentId:number, name:string) : LogicMoveInput {
        const ret = new LogicMoveInput();
        ret.moveType = BackendMoveType.SAVE;
        ret.targetId = targetId;
        ret.parentId = parentId;
        ret.name = name;
        return ret;
    }
    //endregion

}