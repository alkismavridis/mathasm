import React, {Component} from 'react';
import "./ModalGroup.css";
import ModalData from "../../../entities/frontend/ModalData";
import App from "../../../services/App";
import {Subscription} from "rxjs/index";


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
    props : {
        app:App,
    };

    state = {
        modalData: [] as ModalData[]
    };

    _keyHandler = null;
    private subscriptions:Subscription[] = [];
    //endregion



    //region LIFE CYCLE
    constructor(props) {
        super(props);
        this.state.modalData = this.props.app.modalService.modalData.slice();

        this.subscriptions.push(
            this.props.app.onModalChanged.subscribe(data => this.handleModalChange(data))
        );
    }

    componentWillUnmount() {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions = [];
    }
    //endregion




    //region EVENT HANDLERS
    handleModalChange(data:ReadonlyArray<ModalData>) {
        if (data.length===0 && this._keyHandler) {
            document.body.removeEventListener("keydown", this._keyHandler);
            this._keyHandler = null;
        }

        if (this.state.modalData.length===0 && data.length>0) {
            this._keyHandler = this.handleEscape.bind(this);
            document.body.addEventListener("keydown", this._keyHandler);
        }

        this.setState({modalData:data});
    }

    handleEscape(e) {
        if (e.keyCode !== 27) return; //we care only about escape key
        const lastModal = this.props.app.modalService.lastModalData;
        if (!lastModal) return;
        this.props.app.modalService.removeModal(lastModal.id);
    }

    handleOverlayClick(modalData:ModalData, event) {
        if (modalData.closeOnOutsideClick===false) return;
        if(!event.target.classList.contains("ModalGroup_overlay")) return; //internal window click
        this.props.app.modalService.removeModal(modalData.id);
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
        return this.state.modalData.map(data => this.renderModal(data));
    }

    //endregion
}