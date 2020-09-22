package eu.alkismavridis.mathasm.entities.env

interface SymbolProvider {
    fun get(id:Long) : String

    /**
     * gets the symbol with the given uid. If found, it will be returned.
     * If not orElse parameter will be returned.
     * */
    fun get(id:Long, orElse:String) : String
    fun getBridge(grade:Short, isBidirectional:Boolean) : String
    fun getLastGivenId() : Long
}
