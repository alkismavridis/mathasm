export default class MapUtils {
    //region MAP RETURNING FUNCTIONS
    static arrayToMap(arr:any[], key = "id") : any {
        const ret = {};
        arr.forEach(el => ret[el[key]] = el);
        return ret;
    }
    //endregion



    //region ARRAY RETURNING FUNCTIONS
    static mapToArray(map:Map<any, any>, callback:Function) : any[] {
        const ret = [];
        for(let entry of map.entries()) {
            ret.push(callback(entry[1], entry[0]));
        }
        return ret;
    }
    //endregion
}