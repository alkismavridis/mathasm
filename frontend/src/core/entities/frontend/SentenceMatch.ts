export default class SentenceMatch {
    //region FIELDS
    index:number;
    selected:boolean;
    //endregion



    //region CONSTRUCTORS
    constructor(index: number, selected: boolean) {
        this.index = index;
        this.selected = selected;
    }
    //endregion
}