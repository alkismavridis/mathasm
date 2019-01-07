/**
 * This class is used to subscribe event listeners, and fire some event, that every subscribed listener will get.
 * THERE IS NO UNSUBSCRIBE EVENT.
 */
import App from "../components/App/App";

export default class EventService {
    /**
     Every event listeners that is subscribed here must:
     * 1. return a boolean.
     *      true means "I am listening. Keep sending me events".
     *      false means: "I am done with you. Stop annoying me with your events."
     *
     * 2. accept one parameter: the events array. Each element on thsi array has the following form:
     * {
     *    "eventType":EventType.FOO_BAR,
     *    "params":{} //not null, but maybe empty object. Every eventType will have its own params. Some will have no params at all.
     */
    static subscribe(listener) {

    }


    /**
     * Useful for firing single events.
     * The fire() method accepts an event type and (optionally), params object.
     * An event array will be created with one element: an event with the given eventType and params.
     * This "events" array will be passed to each subscribed listener.
    */
     static fire(eventType, /*optional. default value:{}*/params) {
        const event = {
            eventType:eventType,
            params:params || {}
        };

        EventService.fireList([event]);
    }

    /**
     * Fires a list of events.
     * */
    static fireList(events) {
        //2. Notify all listeners and gather back the ones who returned true
        const listenersThatAreStillListening = App
            .instance
            .getEventListeners()
            .filter(listener => listener(events));

        //3. Update the global state
        App.setEventListeners(listenersThatAreStillListening);
    }
}