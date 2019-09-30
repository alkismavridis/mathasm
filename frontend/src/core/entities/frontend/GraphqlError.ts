import ErrorCode from "../../enums/ErrorCode";

export default class GraphqlError {
    //region FIELDS
    code:ErrorCode;
    handled:boolean;
    errorList:any[];
    //endregion



    //region CONSTRUCTORS
    constructor(code: ErrorCode, handled: boolean, errorList: any[]) {
        this.code = code;
        this.handled = handled;
        this.errorList = errorList;
    }
    //endregion
}