import React, {Component} from 'react';
import "./ModalGroup.css";
import ModalData from "../../../entities/frontend/ModalData";


/**
 * A component that render modal windows.
 * Every modal window must be of the form:
 * {
 *    id:number,
 *    content: node or function that returns node,
 *    closeOnOutsideClick: boolean (dafault:true)
 * }
 * */
export default class ModalGroup extends Component {
    //region FIELDS
    props : {};

    state = {
        modals:[] as ModalData[]
    };

    _keyHandler = null;
    //endregion



    //region LIFE CYCLE
    // constructor(props) { super(props); }
    // componentDidMount() {}
    // static getDerivedStateFromProps(nextProps, prevState) {}
    // shouldComponentUpdate(nextProps, nextState) { return true; }
    // getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    // componentDidUpdate(prevProps, prevState, snapshot) {}
    // componentWillUnmount() {}
    // componentDidCatch(error, info) { console.error("Exception caught"); }
    //endregion


    //region EVENT HANDLERS
    handleEscape(e) {
        if (e.keyCode !== 27) return; //we care only about escape key
        const lastModal = this.state.modals[this.state.modals.length-1];
        if (!lastModal) return;
        this.removeModal(lastModal.id);
    }

    handleOverlayClick(modalData:ModalData, event) {
        if (modalData.closeOnOutsideClick===false) return;
        if(!event.target.classList.contains("ModalGroup_overlay")) return; //internal window click
        this.removeModal(modalData.id);
    }
    //endregion



    //region API
    addModal(modalData:ModalData) {
        //1. Append handler to body if this is our first modal
        if (this.state.modals.length===0) {
            this._keyHandler = this.handleEscape.bind(this);
            document.body.addEventListener("keydown", this._keyHandler);
        }

        //2. Add the modal in the state
        this.setState({modals: [...this.state.modals, modalData]});
    }

    getNextId() :number {
        const maxExistingId = this.state.modals.reduce((prev, curr) =>  Math.max(prev, curr.id), 0);
        return maxExistingId+1;
    }

    removeModal(id) {
        //1. Local the modal to remove
        const index = this.state.modals.findIndex(m => m.id === id);
        if (index<0) return;

        //2. Remove the modal
        const newList = this.state.modals;
        newList.splice(index, 1);
        this.setState({modals:newList});

        //3. Remove the key handler from body, if this was our last modal.
        if (newList.length===0 && this._keyHandler) {
            document.body.removeEventListener("keydown", this._keyHandler);
            this._keyHandler = null;
        }
    }
    //endregion




    //region RENDERING
    renderModal(data:ModalData) {
        return (
            <div
                data-id={data.id}
                className="ModalGroup_overlay"
                onClick={this.handleOverlayClick.bind(this, data)}
                key={data.id}>
                <div style={{margin:"auto"}}>{data.content}</div>
            </div>
        );
    }

    render() {
        return this.state.modals.map(data => this.renderModal(data));
    }

    //endregion
}