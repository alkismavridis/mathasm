export default class ArrayUtils {
    static updateOrInsert(arr:any[], newElement:any, key="id") {
        const indexOfExistingElement = arr.findIndex(e=>e[key]==newElement[key]);
        if(indexOfExistingElement<0) arr.push(newElement);
        else arr[indexOfExistingElement] = newElement;
    }

    static mergeOrInsert(arr:any[], newElement:any, key="id") {
        const existingElement = arr.find(e=>e[key]==newElement[key]);
        if(existingElement==null) arr.push(newElement);
        else Object.assign(existingElement, newElement);
    }
}