/**
 * Created by syrel on 14.05.17.
 */

import React from 'react';
import _ from 'underscore'

class Presentation {
    constructor(props) {
        this.state = {
            displayed: (entity) => { return { then: (resolved) => resolved(entity) } },
            bindings: {
                presentation: this,
                entity: null,
                component: null
            },
            strongSelection: null,
            observers: {
                strongSelection: entity => entity
            }
        };
    }

    display(block) {
        this.state.displayed = block;
        return this;
    }

    on(entity) {
        if (typeof entity === 'undefined' || entity === null) {
            throw Error('Entity can not be nil!');
        }
        this.state.bindings.entity = entity;
        this.setComponentState({ entity: entity });
    }

    getTitle() {
        return "Presentation";
    }

    entity() {
        return this.state.bindings.entity;
    }

    displayedValue() {
        var thenable = this.state.displayed(this.entity());
        if (_.isUndefined(thenable.then)) {
            var value = thenable;
            thenable = { then: (resolved => resolved(value)) };
        }
        return thenable;
    }

    bindings() {
        return this.state.bindings;
    }

    component() {
        return this.state.bindings.component;
    }

    hasComponent() {
        return this.state.bindings.component != null;
    }

    hasEntity() {
        return this.entity() != null;
    }

    render() {
        throw new Error('Subclass responsibility!');
    }

    setComponentState(state) {
        if (this.hasComponent()) {
            this.component().setState(state);
        }
    }

    strongSelected(entity) {
        this.state.strongSelection = entity;
        this.state.observers.strongSelection(entity);
        this.setComponentState({strongSelection: entity});
    }

    strongSelection() {
        return this.state.strongSelection;
    }

    onStrongSelected(observer) {
        this.state.observers.strongSelection = observer;
    }
}

export default Presentation;