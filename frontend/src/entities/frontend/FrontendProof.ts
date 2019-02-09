import FrontendMove from "./FrontendMove";
import MoveType from "../../enums/MoveType";
import BackendMoveType from "../../enums/BackendMoveType";
import SelectionType from "../../enums/SelectionType";
import LogicMove from "../backend/LogicMove";
import MathAsmStatement from "../backend/MathAsmStatement";
import LogicMoveInput from "../backend/inputs/LogicMoveInput";

export default class FrontendProof {
    //region FIELDS
    public moves:FrontendMove[];
    //endregion


    //region LIFE CYCLE
    constructor() {
        this.moves = [];
    }

    static fromBackendProof(backendProof:FrontendProof) : FrontendProof {
        //TODO
        return new FrontendProof();
    }
    //endregion



    //region MODIFIERS
    addMove(newMove:FrontendMove, indexToAdd:number) : void {
        //1. Slice the moves array, if move is not appended at the end.
        if (indexToAdd!==-1 && indexToAdd !== this.moves.length-1) {
            this.moves = this.moves.slice(0, indexToAdd+1);
        }

        //2. Push the new move
        this.moves.push(newMove);
    }

    goToMove(currentIndex:number, newMoveIndex:number, targets: MathAsmStatement[]) {
        if (currentIndex===-1) return;

        //1. Update the targets
        const difference = newMoveIndex - currentIndex;
        if (difference>0) {
            //we perform moves
            for (let i=currentIndex+1; i<=newMoveIndex; ++i) this.moves[i].execute(targets);
        }
        else if (difference<0) {
            //we revert moves
            for (let i=currentIndex; i>newMoveIndex; --i) this.moves[i].revert(targets);

        }

        //2. We setup the current move
        return targets.slice();
    }
    //endregion




    //region BACKEND-PROOF CONVERSION
    private static toBackendReplacementMove(move:FrontendMove) : LogicMoveInput {
        switch (move.selectionType) {
            case SelectionType.NONE: return null;

            case SelectionType.ONE_IN_LEFT: return LogicMoveInput.makeReplace(
                BackendMoveType.ONE_IN_LEFT,
                move.targetId,
                move.base._internalId==null? move.base.id : null,
                move.base._internalId,
                move.baseSide,
                move.pos
            );

            case SelectionType.ONE_IN_RIGHT: LogicMoveInput.makeReplace(
                BackendMoveType.ONE_IN_RIGHT,
                move.targetId,
                move.base._internalId==null? move.base.id : null,
                move.base._internalId,
                move.baseSide,
                move.pos
            );

            case SelectionType.LEFT: LogicMoveInput.makeReplace(
                BackendMoveType.REPLACE_LEFT,
                move.targetId,
                move.base._internalId==null? move.base.id : null,
                move.base._internalId,
                move.baseSide
            );

            case SelectionType.RIGHT: LogicMoveInput.makeReplace(
                BackendMoveType.REPLACE_RIGHT,
                move.targetId,
                move.base._internalId==null? move.base.id : null,
                move.base._internalId,
                move.baseSide
            );

            case SelectionType.ALL: LogicMoveInput.makeReplace(
                BackendMoveType.REPLACE_ALL,
                move.targetId,
                move.base._internalId==null? move.base.id : null,
                move.base._internalId,
                move.baseSide
            );

            default: return null;
        }
    }

    toBackendProof() {
        const data = {
            result:[] as LogicMoveInput[],
            currentExtBaseId:null as number,     //used to indicate external selects
            currentIntBaseId:null as number     //used to indicate internal selects. At every moment, one of those 2 is set.
        };

        this.moves.forEach(move => {
            switch (move.moveType) {
                case MoveType.START:
                    data.result.push(LogicMoveInput.makeStart(
                        move.targetId,
                        move.base._internalId==null? move.base.id : null,
                        move.base._internalId,
                        move.baseSide
                    ));
                    break;

                case MoveType.REPLACE: {
                    const backendMove = FrontendProof.toBackendReplacementMove(move);
                    if (backendMove!=null) data.result.push(backendMove);
                    break;
                }


                case MoveType.SAVE:
                    data.result.push(LogicMoveInput.makeSave(move.targetId, move.parentId, move.name));
                    break;
            }
        });

        return data.result;
    }
    //endregion
}