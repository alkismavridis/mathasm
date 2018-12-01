

//ugly but necessary global state.
const data = {};


export default class SessionService {
    //region LIFE CYCLE
    static initialize() {
        data.sessionKey =  window.localStorage.getItem("sessionKey");

        //more session properties...
    }
    //endregion



    //region ACCESSORS
    static getSessionKey() {
        return data.sessionKey;
    }

    static setSessionKey(key) {
        if (!key) return;
        data.sessionKey = key;
        window.localStorage.setItem("sessionKey", key);
    }
    //endregion
}