import {Subject, Subscription} from "rxjs/index";

interface ComponentWithSubs {
    subscriptions:Subscription[];
    forceUpdate(callback?);
}

/**
 * Adds a subscription to the given component, based on the given subject.
 * When the subject fires, forceUpdate() will be called.
 * The subscription is stored in the component.subscriptions array. Use the function unsubscribeAll to delete them.
 * */
export function updateOn(sbj:Subject<any>, component:ComponentWithSubs) {
    if(!component || !component.subscriptions) return;
    component.subscriptions.push(
        sbj.subscribe(data => component.forceUpdate())
    );
}

export function reactOn(sbj:Subject<any>, component:ComponentWithSubs, callback:(any)=>void) {
    if(!component || !component.subscriptions) return;
    component.subscriptions.push(
        sbj.subscribe(callback)
    );
}

export function unsubscribeAll(component:ComponentWithSubs) {
    if(!component || !component.subscriptions) return;
    component.subscriptions.forEach((s:Subscription) => s.unsubscribe());
    component.subscriptions = [];
}