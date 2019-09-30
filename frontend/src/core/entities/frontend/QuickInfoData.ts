import QuickInfoType from "../../enums/frontend/QuickInfoType";

export default class QuickInfoData {
    message:string;
    title?:string;
    type:QuickInfoType;

    constructor(message:string, title?:string, type = QuickInfoType.INFO) {
        this.message = message;
        this.title = title;
        this.type = type;
    }
}