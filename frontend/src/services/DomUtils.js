export default class DomUtils {
    //region INPUT UTILS
    static handleEnter(callBack) {
        return keyEvent => {
            if (keyEvent.keyCode===13 && callBack) callBack(keyEvent);
        }
    }

    static isInt(value) {
        if (isNaN(value)) return false;
        const x = parseFloat(value);
        return (x | 0) === x;
    }
    //endregion
}