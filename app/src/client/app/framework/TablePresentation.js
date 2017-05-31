/**
 * Created by syrel on 14.05.17.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PresentationComponent from './PresentationComponent';
import Presentation from './Presentation';
import { DataTable as MaterialTable } from 'react-mdl';
import { TableHeader as MaterialTableHeader } from 'react-mdl';

import _ from 'underscore';
import $ from 'jquery';
import camelCase from 'lodash/camelCase';

class MaterialTableComponent extends PresentationComponent {
    defaultDisplayedValue() {
        return [];
    }

    handleStrongSelection(event) {
        var target = event._targetInst;

        while (!_.isEqual(target._tag, "tr") && !_.isEqual(target._tag, "table")) {
            target = target._hostParent;
        }

        if (_.isEqual(target._tag, "table")) {
            // clicked header
            return;
        }

        var key = parseInt(target._currentElement.key);

        this.presentation().strongSelected(this.displayedValue()[key]);
        this.forceUpdate();
    }

    render() {
        var values = this.displayedValue();
        var columns = this.presentation().columns();

        var rows = values.map(value =>
            _.object(columns.map(column => {
                return [camelCase(column.getName(this.entity())), column.getValue(this.presentation().transform(value))];
            }))
        );




        return (<div className='presentation--content'>
            <MaterialTable
                shadow={0}
                rows={rows}
                onClick={this.handleStrongSelection.bind(this)}
                className={'presentation-table pointable ' + (this.presentation().showHeader() ? '' : 'mdl-data-table--no-header') }
                style={{width: '100%'}}>{
                columns.map((column, index) => (
                    <MaterialTableHeader
                        key={index}
                        name={camelCase(column.getName(this.entity()))}>
                            { column.getName(this.entity()) }
                    </MaterialTableHeader>))}
            </MaterialTable></div>);
    }

    componentDidUpdate() {
        const table = $(ReactDOM.findDOMNode(this));
        var values = this.displayedValue();
        table
            .find('tbody>tr')
            .removeClass('is-selected')
            .filter(index => _.isEqual(this.strongSelection(), values[index]))
            .addClass('is-selected');
    }
}

class TableColumn {
    constructor(index) {
        this.state = {
            named: entity => 'Column '+(index+1),
            evaluated: entity => entity,
            displayed: entity => entity,
            index: index
        }
    }

    named(block) {
        this.state.named = block;
        return this;
    }

    evaluated(block) {
        this.state.evaluated = block;
        return this;
    }

    display(block) {
        this.state.displayed = block;
        return this;
    }

    getName(entity) {
        return this.state.named(entity);
    }

    getValue(object) {
        return this.state.displayed(this.state.evaluated(object));
    }

    index() {
        return this.state.index;
    }
}

class TablePresentation extends Presentation {
    constructor(props) {
        super(props);

        Object.assign(this.state, {
            transformed: object => object,
            columns: [],
            dynamic: null,
            header: null,
            showHeader: false
        });
    }

    column(block) {
        let column = new TableColumn( this.state.columns.length);
        this.state.columns.push(column);
        if (!_.isUndefined(block))
            block(column);
        return column;
    }

    columns() {
        if (this.state.dynamic !== null && this.entity() !== null) {
            this.state.columns = [];
            var headers = this.state.header(this.entity());
            headers.forEach(each => this.state.dynamic(each, this.column(c => c)));
        }
        return this.state.columns;
    }

    // creates dynamic columns
    dynamic(block) {
        Object.assign(this.state, {
            dynamic: block
        });
        return this;
    }

    // returns objects for header columns
    // must be used with dynamic
    header(block) {
        Object.assign(this.state, {
            header: block
        });
        return this;
    }

    // Executed on every row
    transformed(block) {
        Object.assign(this.state, {
            transformed: block
        });
        return this;
    }

    withoutHeader() {
        this.state.showHeader = false;
        return this;
    }

    withHeader() {
        this.state.showHeader = true;
        return this;
    }

    showHeader() {
        return this.state.showHeader;
    }

    transform(object) {
        return this.state.transformed(object);
    }

    render() {
        return (<MaterialTableComponent key={ this.uuid() } bind={ this.bindings() }/>)
    }
}

export default TablePresentation;