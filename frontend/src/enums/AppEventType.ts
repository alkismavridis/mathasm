enum AppEventType {
    //DIR VIEWER EVENTS
    STMT_SELECTED = 1,
    SYMBOL_SELECTED = 2,
    DIR_CHANGED = 3,        //event.data is directory that was shown. This function is called every time the displayed directory changes.
    SYMBOL_MAP_CHANGED = 4, //event.data is a map of symbols. Send this event every time new, unknown symbols have been loaded from the server.
    SHOW_PROOF = 5,         //event.data is a statmenet for which the proof must be shown.
    DIR_TAB_UPDATED = 6,    //event.data is {tabId:number, newDir:MathAsmDir}




    //CREATION - UPDATE EVENTS
    STMT_UPDATED = 1001,
    PROOF_SAVED = 1002,      //accepts an array of SavedTheoremInfo objects: the newly created theorems.
    SYMBOL_RENAMED = 1003
}

export default AppEventType;