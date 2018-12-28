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

        //matches
        leftMatches:PropTypes.array,
        rightMatches:PropTypes.array,
        matchLength:PropTypes.number,

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
    addSentenceChunk(targetArray, symbols, fromIndex, toIndex, cssClass) {
        for (let i=fromIndex; i<toIndex; ++i) {
            targetArray.push(this.renderStatementSymbol(symbols[i], cssClass, i));
        }
    }

    /** Renders the symbol with the given id. Use this for statements. */
    renderStatementSymbol(id, cssClass, key) {
        const symbol = this.props.symbolMap[id];
        if (symbol) return <div key={key} className={cssClass}>{symbol.text}</div>;
        else return <div key={key} className={cssClass}>?</div>;
    }

    /** renders the connection of the given statement. */
    renderStatementConnection(stmt) {
        return <div className="Statement_conn">
            {stmt.grade>0 && <div className="Statement_grade">{stmt.grade}</div>}
            <div>{stmt.isBidirectional? "<----->" : "----->"}</div>
        </div>;
    }

    /** Renders a sentence, taking the match and selection info into account. */
    renderSentence(sen, matches) {
        //1. If there is no matches, simply render all symbols
        if (matches==null || matches.length===0 || this.props.matchLength===0) {
            return sen.map((s,index) => this.renderStatementSymbol(s,"Statement_sym",index));
        }

        //2. At this point, we have for sure a matches. Render the sentence chunks
        const ret = [];
        let chunkStart  = 0;

        matches.forEach(match => {
            const matchIndex = match.index;
            const cssClass = match.selected? "Statement_sym Statement_selected" : "Statement_sym Statement_matched";

            //2a. Add non-matched chunk, before the matched one (if any)
            this.addSentenceChunk(ret, sen, chunkStart, matchIndex, "Statement_sym");

            //2b. Render the matched chunk
            this.addSentenceChunk(ret, sen, matchIndex, matchIndex+this.props.matchLength, cssClass);

            //2c. Update next chunk start.
            chunkStart = matchIndex+this.props.matchLength;
        });

        //2d. Render the non-matched part after the last matched one (if any.)
        this.addSentenceChunk(ret, sen, chunkStart, sen.length, "Statement_sym");
        return ret;
    }


    render() {
        const stmt = this.props.statement;
        if(!stmt) return null;

        return (
            <div className={cx("Statement_root", this.props.className)} style={this.props.style} onClick={this.props.onClick}>
                {this.renderSentence(stmt.left, this.props.leftMatches)}
                {this.renderStatementConnection(stmt)}
                {this.renderSentence(stmt.right, this.props.rightMatches)}
            </div>
        );
    }

    //endregion
}