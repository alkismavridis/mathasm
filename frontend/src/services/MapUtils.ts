export default class MapUtils {
    //region MAP RETURNING FUNCTIONS
    static arrayToMap(arr:any[], key = "id") : any {
        const ret = {};
        arr.forEach(el => ret[el[key]] = el);
        return ret;
    }
    //endregion
}