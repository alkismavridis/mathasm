export default class DomUtils {
    //region INPUT UTILS
    static handleEnter(callBack:Function) {
        return keyEvent => {
            if (keyEvent.keyCode===13 && callBack) callBack(keyEvent);
        }
    }

    static isInt(value:string) : boolean {
        const asInt = parseInt(value);
        return !isNaN(asInt);
    }
    //endregion
}