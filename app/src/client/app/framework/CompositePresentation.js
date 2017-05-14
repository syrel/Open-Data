/**
 * Created by syrel on 14.05.17.
 */

import React from 'react';
import Presentation from './Presentation';
import PresentationComponent from './PresentationComponent';
import TablePresentation from './TablePresentation';


class CompositeComponent extends PresentationComponent {
    constructor(props) {
        super(props);

        Object.assign(this.state, {
            presentations: props.presentations
        });
    }

    render() {
        return (
           <div>{this.state.presentations.map(presentation => presentation.render())}</div>
        );
    }
}

class CompositePresentation extends Presentation {
    constructor(props) {
        super(props);
        this.presentations = [];
    }

    table(block) {
        let table = new TablePresentation({ key: this.presentations.length });
        this.presentations.push(table);
        block(table);
        return table;
    }

    on(entity) {
        super.on(entity);
        this.presentations.forEach(presentation => presentation.on(entity));
    }

    render() {
        return (<CompositeComponent bind={ this.bindings() } presentations={ this.presentations }>{this.presentations.map(presentation => presentation.render())}</CompositeComponent>);
    }
}

export default CompositePresentation;