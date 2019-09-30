import React, {Component} from 'react';
import "./NotFoundPage.css";

class NotFoundPage extends Component {
    props : {
        //data
        history:any,

        //actions

        //styling
    };

    static defaultProps = {};


    //region LIFE CYCLE
    //constructor(props) {
    //    super(props);
    //    this.state = {};
    //}

    //componentDidMount() {}
    //static getDerivedStateFromProps(nextProps, prevState) {}
    //shouldComponentUpdate(nextProps, nextState) { return true; }
    //getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    //componentDidUpdate(prevProps, prevState, snapshot) {}
    //componentWillUnmount() {}

    //componentDidCatch(error, info) {
    //    console.error("Exception caught");
    //}

    //endregion


    //region EVENT HANDLERS
    //endregion


    //region RENDERING
    render() {
        return (
            <div className="NotFoundPage_root">
                hello from NotFoundPage
            </div>
        );
    }

    //endregion
}

export default NotFoundPage;