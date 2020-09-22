package eu.alkismavridis.mathasm.infrastructure.db.util_entities

import eu.alkismavridis.mathasm.entities.env.SymbolProvider


//TODO maybe will be removed. Not really needed.
class SymbolProviderImpl : SymbolProvider {
    //region FIELDS
    private val name : String
    private val symbols : HashMap<Long, String> =  HashMap()
    private val unknownSymbol:String
    private var lastGivenId:Long = 0
    //endregion



    //region LIFE CYCLE
    constructor(name:String, unknownSymbol:String) {
        this.name = name
        this.unknownSymbol = unknownSymbol
    }
    //endregion



    //region GETTERS
    override fun get(id:Long) : String {
        val ret = this.symbols[id]
        if (ret!=null) return ret
        return this.unknownSymbol
    }

    /**
     * gets the symbol with the given uid. If found, it will be returned.
     * If not orElse parameter will be returned.
     * */
    override fun get(id:Long, orElse:String) : String {
        val ret = this.symbols[id]
        if (ret!=null) return ret
        return orElse
    }

    override fun getBridge(grade:Short, isBidirectional:Boolean) : String {
        if (isBidirectional) return "__${grade}__"
        else return "__$grade--"
    }

    override fun getLastGivenId() : Long { return this.lastGivenId }
    //endregion


    //region MODIFIERS
    /**
     * adds the new symbol, if it does not already exists.
     * @return the uid assigned to the new symbol, or null if the symbol existed and thus, was not added.
     * */
    fun addIfNotExists(newSymbol:String) : Long? {
        if (symbols.containsValue(newSymbol)) return null

        this.symbols[++this.lastGivenId] = newSymbol
        return this.lastGivenId
    }

    /**
     * adds the given symbol with the given uid to the symbols map, if the uid does not already exists
     * @return true if the symbol was added into the map, false if it already existed and thus, it wan not added.
     * */
    fun addIfNotExists(id:Long, newSymbol: String) : Boolean {
        if (this.symbols.containsKey(id)) return false
        this.symbols[id] = newSymbol
        if (id>this.lastGivenId) this.lastGivenId = id

        return true
    }

    /**
     * adds the symbol with the given uid to the symbols map.
     * No check will be made whether the symbol already existed.
     * Useful when we fetch symbols from a DB, and we are sure that every uid appears oe time
     * */
    fun addWithoutCheck(id:Long, newSymbol: String) {
        this.symbols[id] = newSymbol
        if (id>this.lastGivenId) this.lastGivenId = id

        return
    }
    //endregion
}
