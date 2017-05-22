/**
 * Created by syrel on 14.05.17.
 */

import React from 'react';
import PresentationComponent from './PresentationComponent';
import Presentation from './Presentation';
import { Table } from 'react-bootstrap';
import TableColumn from './TableColumn';
import _ from 'underscore'

/**
 * this.state.displayedValue is cached value to support Promises
 */
class TableComponent extends PresentationComponent {

    defaultDisplayedValue() {
        return [];
    }

    handleStrongSelection(entity) {
        this.presentation().strongSelected(entity);
        this.forceUpdate();
    }

    render() {
        var values = this.displayedValue();
        var columns = this.presentation().columns();

        return (
            <div>
            <Table hover>
                {this.presentation().showHeader() &&
                    <thead>
                    <tr>
                        { columns.map((column, index) => (<th key={index}> { column.getName(this.entity()) } </th>)) }
                    </tr>
                    </thead>
                }
                <tbody>
                    { values.map((value, index) => this.renderRow(value, index, columns)) }
                </tbody>
            </Table>
            </div>
        );
    }

    renderRow(value, valueIndex, columns) {
        return (<tr key={valueIndex} value={value} onClick={() => this.handleStrongSelection(value) } className={ (_.isEqual(this.strongSelection(), value) ? 'Table-strongSelection' : '') }>
            { columns.map((column, columnIndex) =>
                (<td key={columnIndex} style={{'wordWrap': 'break-all'}}>
                    {
                        column.getValue(this.presentation().transform(value))
                    }
                </td>))
            }
        </tr>)
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
        return (<TableComponent bind={ this.bindings() }/>)
    }
}

export default TablePresentation;