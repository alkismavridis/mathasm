import {AppEvent} from "./AppEvent";
import AppNodeReaction from "../../enums/AppNodeReaction";

export interface AppNode {
    getParent():AppNode;
    getChildMap():any; //a map of React.createRef elements.

    handleParentEvent(event:AppEvent) : AppNodeReaction; //return AppNodeReaction.NONE by default
    handleChildEvent(event:AppEvent) : AppNodeReaction;  //return AppNodeReaction.UP by default
}