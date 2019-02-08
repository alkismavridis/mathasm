import MathAsmMove from "./MathAsmMove.ts";
import MoveType from "../enums/MoveType";
import BackendMoveType from "../enums/BackendMoveType";
import SelectionType from "../enums/SelectionType";

export default class MathAsmProof {
    //region LIFE CYCLE
    constructor() {
        this.moves = [];
    }

    static fromBackendProof(backendProof) {
        //TODO
        return new MathAsmProof();
    }
    //endregion



    //region MODIFIERS
    addMove(newMove, indexToAdd) {
        //1. Slice the moves array, if move is not appended at the end.
        if (indexToAdd!==-1 && indexToAdd !== this.moves.length-1) {
            this.moves = this.moves.slice(0, indexToAdd+1);
        }

        //2. Push the new move
        this.moves.push(newMove);
    }

    goToMove(currentIndex, newMoveIndex, targets) {
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
    /*private*/ static toBackendReplacementMove(move) {
        switch (move.selectionType) {
            case SelectionType.NONE: return null;

            case SelectionType.ONE_IN_LEFT: return {
                moveType:BackendMoveType.ONE_IN_LEFT,
                targetId: move.targetId,
                extBaseId:move.base._internalId==null? move.base.id : null,
                intBaseId:move.base._internalId,
                side: move.baseSide,
                pos: move.pos
            };

            case SelectionType.ONE_IN_RIGHT: return {
                moveType:BackendMoveType.ONE_IN_RIGHT,
                targetId: move.targetId,
                extBaseId:move.base._internalId==null? move.base.id : null,
                intBaseId:move.base._internalId,
                side: move.baseSide,
                pos: move.pos
            };

            case SelectionType.LEFT: return {
                moveType:BackendMoveType.REPLACE_LEFT,
                targetId:move.targetId,
                extBaseId:move.base._internalId==null? move.base.id : null,
                intBaseId:move.base._internalId,
                side:move.baseSide
            };

            case SelectionType.RIGHT: return {
                moveType:BackendMoveType.REPLACE_RIGHT,
                targetId:move.targetId,
                extBaseId:move.base._internalId==null? move.base.id : null,
                intBaseId:move.base._internalId,
                side:move.baseSide
            };

            case SelectionType.ALL: return {
                moveType:BackendMoveType.REPLACE_ALL,
                targetId:move.targetId,
                extBaseId:move.base._internalId==null? move.base.id : null,
                intBaseId:move.base._internalId,
                side:move.baseSide,
            };

            default: return null;
        }
    }

    toBackendProof() {
        const data = {
            result:[],
            currentExtBaseId:null,     //used to indicate external selects
            currentIntBaseId:null   //used to indicate internal selects. At every moment, one of those 2 is set.
        };

        this.moves.forEach(move => {
            switch (move.moveType) {
                case MoveType.START:
                    data.result.push({
                        moveType:BackendMoveType.START,
                        targetId:move.targetId,
                        extBaseId:move.base._internalId==null? move.base.id : null,
                        intBaseId:move.base._internalId,
                        side:move.baseSide
                    });
                    break;

                case MoveType.REPLACE: {
                    const backendMove = MathAsmProof.toBackendReplacementMove(move);
                    if (backendMove!=null) data.result.push(backendMove);
                    break;
                }


                case MoveType.SAVE:
                    data.result.push({
                        moveType:BackendMoveType.SAVE,
                        targetId: move.targetId,
                        parentId: move.parentId,
                        name: move.name
                    });
                    break;
            }
        });

        return data.result;
    }
    //endregion
}