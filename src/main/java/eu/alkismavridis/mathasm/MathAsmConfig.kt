package eu.alkismavridis.mathasm

import com.fasterxml.jackson.databind.JsonNode
import java.nio.file.Path

class MathAsmConfig {
    //region FIELDS
    val dataDir:Path

    var defaultLanguage:String = "en"
        private set

    var dbDirName:String = "db"
        private set

    var rootUserPassword:String = "root"
        private set
    //endregion




    //region LIFE CYCLE
    /** An optional json node may be provided in order to override default fields*/
    constructor(dataDir:Path, json:JsonNode?) {
        this.dataDir = dataDir
        if (json!=null) load(json)
    }

    private fun load(json: JsonNode) {
        if (json.has("defaultLanguage")) this.defaultLanguage = json["defaultLanguage"].asText()
        if (json.has("dbDir")) this.dbDirName = json["dbDir"].asText()
        if (json.has("rootUserPassword")) this.rootUserPassword = json["rootUserPassword"].asText()
    }
    //endregion



    //region GETTERS
    fun getDBDir() : Path {
        return this.dataDir.resolve(this.dbDirName)
    }
    //endregion

}