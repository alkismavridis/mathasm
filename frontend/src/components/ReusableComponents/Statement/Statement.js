import React, {Component} from 'react';
import PropTypes from "prop-types";
import cx from 'classnames';
import "./Statement.scss";

export default class Statement extends Component {
    //region STATIC
    static propTypes = {
        //data
        /** The cache of all loaded symbols. */
        symbolMap:PropTypes.object.isRequired,
        statement:PropTypes.object,

        //actions
        onClick:PropTypes.func,

        //styling
        style: PropTypes.object,
        className: PropTypes.string,
    };

    //static defaultProps = {};
    //endregion


    //region FIELDS
    state = {};
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
    //endregion


    //region RENDERING
    /** Renders the symbol with the given id. Use this for statements. */
    renderStatementSymbol(id, key) {
        const symbol = this.props.symbolMap[id];
        if (symbol) return <div key={key} className="Statement_sym">{symbol.text}</div>;
        else return <div key={key}>?</div>;
    }

    /** renders the connection of the given statement. */
    renderStatementConnection(stmt) {
        return <div className="Statement_conn">
            {stmt.grade>0 && <div className="Statement_grade">{stmt.grade}</div>}
            <div>{stmt.isBidirectional? "<----->" : "----->"}</div>
        </div>;
    }


    render() {
        const stmt = this.props.statement;
        if(!stmt) return null;

        return (
            <div className={cx("Statement_root", this.props.className)} style={this.props.style}>
                {stmt.left.map((s,index) => this.renderStatementSymbol(s,index))}
                {this.renderStatementConnection(stmt)}
                {stmt.right.map((s,index) => this.renderStatementSymbol(s,index))}
            </div>
        );
    }

    //endregion
}