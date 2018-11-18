package eu.alkismavridis.mathasm

import com.fasterxml.jackson.databind.JsonNode
import java.nio.file.Path

class MathAsmConfig {
    //region FIELDS
    /** the resources path. This is the only property that is not read from the json node.*/
    var resources: Path
        private set

    var defaultLanguage:String = "en"
        private set

    var dbUri:String = "file:///home/alkis/data/MathAsm/db"
        private set

    var rootUserPassword:String = "root"
        private set
    //endregion


    //region LIFE CYCLE
    /** An optional json node may be provided in order to override default fields*/
    constructor(resources: Path, json:JsonNode?) {
        this.resources = resources
        if (json!=null) load(json)
    }

    private fun load(json: JsonNode) {
        if (json.has("defaultLanguage")) this.defaultLanguage = json["defaultLanguage"].asText()
        if (json.has("dbUri")) this.dbUri = json["dbUri"].asText()
        if (json.has("rootUserPassword")) this.rootUserPassword = json["rootUserPassword"].asText()
    }
    //endregion

}