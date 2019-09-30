/**
 * fallback properties for react-notifications-component that we use.
 * Any property passed on addNotification will override those.
 * See https://www.npmjs.com/package/react-notifications-component for more info
 */
import App from "./App";
import {Subject} from "rxjs/index";
import QuickInfoData from "../entities/frontend/QuickInfoData";
import QuickInfoType from "../enums/frontend/QuickInfoType";





export default class QuickInfoService {
    onNotificationAdded = new Subject<QuickInfoData>();
    constructor(private app:App) {}


    makeSuccess(message:string, title?:string) {
        this.onNotificationAdded.next(new QuickInfoData(message, title, QuickInfoType.SUCCESS));
    }

    makeWarning(message:string, title?:string) {
        this.onNotificationAdded.next(new QuickInfoData(message, title, QuickInfoType.WARNING));
    }

    makeError(message:string, title?:string) {
        this.onNotificationAdded.next(new QuickInfoData(message, title, QuickInfoType.ERROR));
    }

    makeInfo(message:string, title?:string) {
        this.onNotificationAdded.next(new QuickInfoData(message, title));
    }
}