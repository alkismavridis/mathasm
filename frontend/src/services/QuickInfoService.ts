/**
 * fallback properties for react-notifications-component that we use.
 * Any property passed on addNotification will override those.
 * See https://www.npmjs.com/package/react-notifications-component for more info
 */
import App from "./App";


const DEFAULT_NOTIFICATION_OPTIONS = {
    type: "success",        //success, danger, default, info, warning, custom
    insert: "top",
    container: "top-right",
    dismiss: { duration: 6000 },
    dismissable: { click: true },
    slidingExit:{duration:100, delay:0},
    slidingEnter:{duration:100, delay:0}
};


export default class QuickInfoService {
    constructor(private app:App) {}


    makeSuccess(message:string, title?:string) {
        const mergedNotification = Object.assign({}, DEFAULT_NOTIFICATION_OPTIONS, {title: title, message: message});
        this.app.onNotificationAdded.next(mergedNotification);
    }

    makeWarning(message:string, title?:string) {
        const mergedNotification = Object.assign({}, DEFAULT_NOTIFICATION_OPTIONS, {title: title, message: message, type:"warning"});
        this.app.onNotificationAdded.next(mergedNotification);
    }

    makeError(message:string, title?:string) {
        const mergedNotification = Object.assign({}, DEFAULT_NOTIFICATION_OPTIONS, {title: title, message: message, type:"danger"});
        this.app.onNotificationAdded.next(mergedNotification);
    }

    makeInfo(message:string, title?:string) {
        const mergedNotification = Object.assign({}, DEFAULT_NOTIFICATION_OPTIONS, {title: title, message: message, type:"info"});
        this.app.onNotificationAdded.next(mergedNotification);
    }

    makeDefault(message:string, title?:string) {
        const mergedNotification = Object.assign({}, DEFAULT_NOTIFICATION_OPTIONS, {title: title, message: message, type:"default"});
        this.app.onNotificationAdded.next(mergedNotification);
    }

    /** A bit lower level. It just merges the incoming object with default settings and passes it to react-notifications lib. */
    show(notification:any) {
        const mergedNotification = Object.assign({}, DEFAULT_NOTIFICATION_OPTIONS, notification);
        this.app.onNotificationAdded.next(mergedNotification);
    }
}