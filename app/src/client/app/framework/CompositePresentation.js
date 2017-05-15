/**
 * Created by syrel on 14.05.17.
 */

import React from 'react';
import _ from 'underscore';
import Presentation from './Presentation';
import PresentationComponent from './PresentationComponent';
import TablePresentation from './TablePresentation';

class CompositeComponent extends PresentationComponent {
    constructor(props) {
        super(props);
    }

    presentations() {
        return this.presentation().presentations;
    }

    render() {
        return (
           <div>{this.presentations().map(presentation => presentation.render())}</div>
        );
    }
}

class CompositePresentation extends Presentation {
    constructor(props) {
        super(props);
        this.presentations = [];

        Object.assign(this.state, {
            browser: null
        });
    }

    add(presentation) {
        this.presentations.push(presentation);
        presentation.state.owner = this;
        this.setComponentState({ presentations: this.presentations })
    }

    remove(presentation) {
        presentation.onDetached();
        this.presentations = this.presentations.filter(each => each !== presentation);
        this.setComponentState({ presentations: this.presentations });
    }

    indexOf(presentation) {
        return this.presentations.findIndex(each => each == presentation);
    }

    table(block) {
        let table = new TablePresentation({ key: this.presentations.length });
        this.add(table);
        block(table);
        return table;
    }

    browser() {
        if (!this.hasOwner()) {
            return;
        }
        if (!_.isNull(this.state.browser)) {
            return this.state.browser;
        }
        return this.owner().browser();
    }

    hasBrowser() {
        if(!this.hasOwner()) {
            return false;
        }

        if (!_.isNull(this.state.browser)) {
            return true;
        }

        return this.owner().hasBrowser();
    }

    on(entity) {
        super.on(entity);
        this.presentations.forEach(presentation => presentation.on(entity));
    }

    last() {
        return this.presentations[this.presentations.length - 1];
    }

    isLast(presentation) {
        return this.last() === presentation;
    }

    openOn(entity) {
        if (!_.isUndefined(entity.extensions)) {
            _.each(_.sortBy(entity.extensions, extension => extension.order), extension => extension.method(this));
        }
        this.on(entity);
    }

    render() {
        return (<CompositeComponent bind={ this.bindings() }>{this.presentations.map(presentation => presentation.render())}</CompositeComponent>);
    }
}

CompositePresentation.CompositeComponent = CompositeComponent;
export default CompositePresentation;