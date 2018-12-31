import MathAsmMove from "./MathAsmMove";
import MoveType from "../constants/MoveType";
import BackendMoveType from "../constants/BackendMoveType";
import StatementType from "../constants/StatementType";
import SelectionType from "../constants/SelectionType";
import StatementSide from "../constants/StatementSide";

export default class MathAsmProof {
    //region GENERATOR FUNCTIONS

    static emptyProof() {
        return {
            currentMove:0,
            moves:[]
        };
    }


    static fromBackendProof(backendProof) {
        //TODO
        return MathAsmProof.emptyProof();
    }
    //endregion



    //region MODIFIERS
    static addMove(proof, newMove) {
        //1. Slice the moves array, if move is not appended at the end.
        if (proof.currentMove!=null && proof.currentMove !== proof.moves.length-1) {
            proof.moves = proof.moves.slice(0, proof.currentMove+1);
        }

        //2. Push the new move, and update the currentMove counter
        proof.moves.push(newMove);
        proof.currentMove = proof.moves.length-1;
    }

    static goToMove(proof, newMoveIndex, targets) {
        if (proof.currentMove==null) return;

        //1. Update the targets
        const difference = newMoveIndex - proof.currentMove;
        if (difference>0) {
            //we perform moves
            for (let i=proof.currentMove+1; i<=newMoveIndex; ++i) MathAsmMove.execute(proof.moves[i], targets);
        }
        else if (difference<0) {
            //we revert moves
            for (let i=proof.currentMove; i>newMoveIndex; --i) MathAsmMove.revert(proof.moves[i], targets);

        }

        //2. We setup the current move
        proof.currentMove = newMoveIndex;
    }
    //endregion




    //region BACKEND-PROOF CONVERSION

    /*private*/ static addReplaceMove(data, move) {
        switch (move.selectionType) {
            case SelectionType.NONE: break;

            case SelectionType.ONE_IN_LEFT:
                data.result.push({
                    moveType:BackendMoveType.ONE_IN_LEFT,
                    targetId: move.targetId,
                    extBaseId:move.base._internalId==null? move.base.id : null,
                    intBaseId:move.base._internalId,
                    side: move.baseSide,
                    pos: move.pos
                });
                break;

            case SelectionType.ONE_IN_RIGHT:
                data.result.push({
                    moveType:BackendMoveType.ONE_IN_RIGHT,
                    targetId: move.targetId,
                    extBaseId:move.base._internalId==null? move.base.id : null,
                    intBaseId:move.base._internalId,
                    side: move.baseSide,
                    pos: move.pos
                });
                break;

            case SelectionType.LEFT:
                data.result.push({
                    moveType:BackendMoveType.REPLACE_LEFT,
                    targetId:move.targetId,
                    extBaseId:move.base._internalId==null? move.base.id : null,
                    intBaseId:move.base._internalId,
                    side:move.baseSide
                });
                break;

            case SelectionType.RIGHT:
                data.result.push({
                    moveType:BackendMoveType.REPLACE_RIGHT,
                    targetId:move.targetId,
                    extBaseId:move.base._internalId==null? move.base.id : null,
                    intBaseId:move.base._internalId,
                    side:move.baseSide
                });
                break;

            case SelectionType.ALL:
                data.result.push({
                    moveType:BackendMoveType.REPLACE_ALL,
                    targetId:move.targetId,
                    extBaseId:move.base._internalId==null? move.base.id : null,
                    intBaseId:move.base._internalId,
                    side:move.baseSide,
                });
                break;
        }
    }

    static toBackendProof(proof) {
        const data = {
            result:[],
            currentExtBaseId:null,     //used to indicate external selects
            currentIntBaseId:null   //used to indicate internal selects. At every moment, one of those 2 is set.
        };

        proof.moves.forEach(move => {
            switch (move.moveType) {
                case MoveType.START:
                    data.result.push({
                        moveType:BackendMoveType.START,
                        targetId:move.targetId,
                        extBaseId:move.base._internalId==null? move.base.id : null,
                        intBaseId:move.base._internalId,
                        side:move.side
                    });
                    break;

                case MoveType.REPLACE:
                    MathAsmProof.addReplaceMove(data, move);
                    break;

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