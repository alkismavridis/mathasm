import MainPageContentController from "./MainPageContentController";
import MainPageMode from "../MainPageMode";
import MainPageController from "../MainPageController";
import App from "../../../App";
import MathAsmStatement from "../../../../entities/backend/MathAsmStatement";
import {Subject} from "rxjs";
import q from "../../../../../react/components/ProofViewer/ProofViewer.graphql";
import ProofPlayer from "../../../../entities/frontend/ProofPlayer";
import {SymbolRangeUtils} from "../../../../utils/SymbolRangeUtils";
import MathAsmSymbol from "../../../../entities/backend/MathAsmSymbol";

export default class ProofViewerController implements MainPageContentController {
    //region FIELDS
    readonly mode = MainPageMode.SHOW_PROOF;
    readonly onChange = new Subject<ProofViewerController>();
    readonly player = new ProofPlayer();

    private _stmt:MathAsmStatement = null;
    //endregion


    constructor(statement:MathAsmStatement, private mainPage:MainPageController, private app:App) {
        this._stmt = statement;
        this.fetchProof();
    }



    //region GETTERS
    get statement(): MathAsmStatement { return this._stmt; }
    get symbolMap() : Map<number, MathAsmSymbol> { return this.mainPage.symbolMap; }
    //endregion


    //SECTION ACTIONS
    fetchProof() {
        if (this._stmt==null) return;

        this.app.graphql.run(q.FETCH_PROOF, {id:this._stmt.id}).then(resp=> {
            this.player.setupFrom(resp.statement.proof);
            this.checkForMissingSymbols(resp.statement.proof.bases);
            this.onChange.next(this);
        });
    }

    checkForMissingSymbols(statements:MathAsmStatement[]) {
        const missingIds = SymbolRangeUtils.getMissingIdsFromStatements(statements, this.mainPage.symbolMap);
        if (missingIds.size === 0) return;

        this.app.graphql.run(q.FETCH_SYMBOLS, {ids:Array.from(missingIds)}).then(resp => {
            SymbolRangeUtils.addSymbolsToMap(this.mainPage.symbolMap, resp.symbols); //TODO this sould be a responsibiity of mainPage itself!
            this.mainPage.onSymbolMapUpdated.next(this.mainPage.symbolMap);
        });
    }

    /** Navigates to the selected move of the proof. */
    goToMove(index:number) {
        this.player.goToMove(index);
        this.onChange.next(this);
    }

    goToPrevMove() {
        const currentMoveIndex = this.player.currentMoveIndex;
        const moveCount = this.player.getMoveCount();
        if (moveCount!==0 && currentMoveIndex>=0) this.goToMove(currentMoveIndex-1);
    }

    goToNextMove() {
        const currentMoveIndex = this.player.currentMoveIndex;
        const moveCount = this.player.getMoveCount();
        if (moveCount!==0 && currentMoveIndex!==moveCount-1) this.goToMove(currentMoveIndex+1);
    }
}