package eu.alkismavridis.mathasm.entities.proof

class
LogicSelection {
    //region FIELDS
    val side1: SentenceSelection
    val side2: SentenceSelection
    //endregion

    constructor(sideCapacity:Int) {
        this.side1 = SentenceSelection(sideCapacity)
        this.side2 = SentenceSelection(sideCapacity)
    }
}
