/**
 * fallback properties for react-notifications-component that we use.
 * Any property passed on addNotification will override those.
 * See https://www.npmjs.com/package/react-notifications-component for more info
 */
import App from "../components/App/App";


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
    static makeSuccess(title, message) {
        const group = App.getNotificationGroup();
        if (!group) return;

        const mergedNotification = Object.assign({}, DEFAULT_NOTIFICATION_OPTIONS, {title: title, message: message});
        group.addNotification(mergedNotification);
    }

    static makeWarning(title, message) {
        const group = App.getNotificationGroup();
        if (!group) return;

        const mergedNotification = Object.assign({}, DEFAULT_NOTIFICATION_OPTIONS, {title: title, message: message, type:"warning"});
        group.addNotification(mergedNotification);
    }

    static makeError(title, message) {
        const group = App.getNotificationGroup();
        if (!group) return;

        const mergedNotification = Object.assign({}, DEFAULT_NOTIFICATION_OPTIONS, {title: title, message: message, type:"danger"});
        group.addNotification(mergedNotification);
    }

    static makeInfo(title, message) {
        const group = App.getNotificationGroup();
        if (!group) return;

        const mergedNotification = Object.assign({}, DEFAULT_NOTIFICATION_OPTIONS, {title: title, message: message, type:"info"});
        group.addNotification(mergedNotification);
    }

    static makeDefault(title, message) {
        const group = App.getNotificationGroup();
        if (!group) return;

        const mergedNotification = Object.assign({}, DEFAULT_NOTIFICATION_OPTIONS, {title: title, message: message, type:"default"});
        group.addNotification(mergedNotification);
    }

    /** A bit lower level. It just merges the incoming object with default settings and passes it to react-notifications lib. */
    static show(notification) {
        const group = App.getNotificationGroup();
        if (!group) return;

        const mergedNotification = Object.assign({}, DEFAULT_NOTIFICATION_OPTIONS, notification);
        group.addNotification(mergedNotification);
    }
}