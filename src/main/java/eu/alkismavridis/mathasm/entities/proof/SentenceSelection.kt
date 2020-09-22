package eu.alkismavridis.mathasm.entities.proof



const val SentenceSelection_SIZE_INCREMENT:Int = 100

class SentenceSelection {
    //region FIELDS
    var length:Int = 0; private set
    var positions:IntArray; private set
    //endregion


    //region LIFE CYCLE
    constructor(capacity:Int) {
        this.positions = IntArray(capacity)
    }
    //endregion


    //region SELECTION MANAGEMENT
    fun clear() {
        this.length = 0
    }

    fun add(pos:Int) {
        //1. Ensure capacity
        if (length >= this.positions.size)  ensureCapacity(this.length + SentenceSelection_SIZE_INCREMENT)

        this.positions[this.length] = pos
        this.length++
    }

    private fun ensureCapacity(newCapacity:Int) {
        //1. Check if operation is needed
        if (newCapacity <= this.positions.size) return

        //2. Create a new array and copy the contents
        this.positions = this.positions.copyOf(newCapacity)
    }
    //endregion
}
