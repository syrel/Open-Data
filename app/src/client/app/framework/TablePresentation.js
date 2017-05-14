/**
 * Created by syrel on 14.05.17.
 */

import React from 'react';
import PresentationComponent from './PresentationComponent';
import Presentation from './Presentation';
import { Table } from 'react-bootstrap';
import TableColumn from './TableColumn';

class TableComponent extends PresentationComponent {
    constructor(props) {
        super(props);

        Object.assign(this.state, {
           displayedValue: this.defaultDisplayedValue()
        });
    }

    defaultDisplayedValue() {
        return [];
    }

    displayedValue() {
        var hasEntity = this.presentation().hasEntity();
        var promise = hasEntity ? this.presentation().displayedValue() : Promise.resolve([]);

        promise.then(result => {
            if (hasEntity && this.state.displayedValue != result) {
                this.state.displayedValue = result;
                this.setState(this.state);
            }
        });
        return this.state.displayedValue;
    }

    render() {
        var values = this.displayedValue();
        var columns = this.presentation().columns();

        return (
            <Table hover>
                <thead>
                <tr>
                    { columns.map((column, index) => (<th> { column.getName(this.presentation().entity()) } </th>)) }
                </tr>
                </thead>
                <tbody>
                {values.map((value, valueIndex) =>
                    (<tr>
                        { columns.map((column, columnIndex) => (<td> {column.getValue(this.presentation().transform(values[valueIndex]))} </td>)) }
                    </tr>)
                )}
                </tbody>
            </Table>
        );
    }
}

class TablePresentation extends Presentation {
    constructor(props) {
        super(props);

        Object.assign(this.state, {
            transformed: object => object,
            displayed: entity => this.entity() === null ? [ ] : this.entity(),
            columns: [],
            dynamic: null,
            header: null,
        });
    }

    column(block) {
        let column = new TableColumn( this.state.columns.length);
        this.state.columns.push(column);
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

    transform(object) {
        return this.state.transformed(object);
    }

    render(entity) {
        return (<TableComponent bind={ this.bindings() }/>)
    }
}

export default TablePresentation;