import PageController from "./PageController";
import PageType from "../../enums/frontend/PageType";

export default class BasicPageController implements PageController{
    //region FIELDS
    readonly type:PageType;
    //endregion



    constructor(type:PageType) {
        this.type = type;
    }
}