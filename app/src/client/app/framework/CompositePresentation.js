/**
 * Created by syrel on 14.05.17.
 */

import React from 'react';
import _ from 'underscore';
import Presentation from './Presentation';
import PresentationComponent from './PresentationComponent';
import TablePresentation from './TablePresentation';
import TextPresentation from './TextPresentation';
import MapPresentation from './MapPresentation';

class CompositeComponent extends PresentationComponent {
    constructor(props) {
        super(props);

        Object.assign(this.state, {
            browser: null
        });
    }

    allPresentations() {
        var thenLeft = this.presentation().presentations.length;
        var presentations = this.presentation().presentations.map(presentation => {
            var thenable = presentation.shouldShow();
            var result = {
                presentation: presentation,
                available: false
            };
            thenable.then(available => {
                result.available = available;
                thenLeft--;
            });
            thenable.onCompleted(() => {
                if (thenLeft <= 0) {
                    if (!_.isEqual(this.state.presentations, presentations)) {
                        this.state.presentations = CompositeComponent.copyPresentations(presentations);
                        this.setState(this.state);
                    }
                }
            });
            return result;
        });

        if (thenLeft == 0) {
            this.state.presentations = CompositeComponent.copyPresentations(presentations);
        }

        return presentations;
    }

    static copyPresentations(presentations) {
        return presentations.map(each => { return {
            presentation: each.presentation,
            available: each.available
        }});
    }

    presentations() {
        return this.allPresentations()
            .filter(presentation => presentation.available)
            .map(each => each.presentation);
    }

    resetState(nextProps) {
        super.resetState(nextProps);
        this.state.presentations = _.noop();
    }

    render() {
        return (
           <div>{this.presentations().map((presentation, index) => {
               return <div key={ index }> { presentation.render() }</div>
           })}</div>
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

    removeAll() {
        this.presentations.forEach(presentation => presentation.onDetached());
        this.presentations = [];
        this.setComponentState({ presentations: this.presentations });
    }

    indexOf(presentation) {
        return this.presentations.findIndex(each => each == presentation);
    }

    table(block) {
        let table = new TablePresentation();
        this.add(table);
        if (!_.isUndefined(block))
            block(table);
        return table;
    }

    text(block) {
        let text = new TextPresentation();
        this.add(text);
        if (!_.isUndefined(block))
            block(text);
        return text;
    }

    map(block) {
        let map = new MapPresentation();
        this.add(map);
        if (!_.isUndefined(block))
            block(map);
        return map;
    }

    with(block) {
        let composite = new CompositePresentation();
        this.add(composite);
        if (!_.isUndefined(block))
            block(composite);
        return composite;
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
        this.presentations.forEach(presentation => presentation.on(this.state.of(entity)));
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
        return (<CompositeComponent bind={ this.bindings() }>{this.presentations.map((presentation, index) => presentation.render(index))}</CompositeComponent>);
    }
}

CompositePresentation.CompositeComponent = CompositeComponent;
export default CompositePresentation;