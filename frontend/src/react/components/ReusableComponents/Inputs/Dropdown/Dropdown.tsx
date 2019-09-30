import React, {Component, CSSProperties} from 'react';
import cx from 'classnames';
import "./Dropdown.scss";

export default class Dropdown extends Component {
    //region STATIC
    props : {
        //data
        options: any[],
        value?: number,

        //actions
        toLabelFunc: Function,
        toValueFunc: Function,
        onChange?:any,         //It may accept two parameters: the selected option, and the change event

        disabled?: boolean,


        //styling
        style?: CSSProperties,
        className?: string,
    };
    //endregion


    //region LIFE CYCLE
    constructor(props) {
        super(props);
    }

    // componentDidMount() {}
    // static getDerivedStateFromProps(nextProps, prevState) {}
    // shouldComponentUpdate(nextProps, nextState) { return true; }
    // getSnapshotBeforeUpdate(prevProps, prevState) { return null; }
    // componentDidUpdate(prevProps, prevState, snapshot) {}
    // componentWillUnmount() {}
    // componentDidCatch(error, info) { console.error("Exception caught"); }
    //endregion


    //region EVENT HANDLERS
    handleChange(e:any) {
        if(this.props.onChange) this.props.onChange(e.target.value);
    }
    //endregion


    //region RENDERING
    renderOptions() {
        return this.props.options.map(opt => {
            const key = this.props.toValueFunc(opt);
            return <option key={key} value={key}>{this.props.toLabelFunc(opt)}</option>;
        });
    }


    render() {
        return (
            <div className={cx("Dropdown_root", this.props.className)} style={this.props.style}>
                <select value={this.props.value} onChange={e => this.handleChange(e)} disabled={this.props.disabled} className="MA_inp">
                    {this.renderOptions()}
                </select>
            </div>
        );
    }

    //endregion
}