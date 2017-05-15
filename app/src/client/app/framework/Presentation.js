/**
 * Created by syrel on 14.05.17.
 */

import React from 'react';
import _ from 'underscore'

class Presentation {
    constructor(props) {
        this.state = {
            displayed: (entity) => { return { then: (resolved) => resolved(entity) } },
            title: (entity) => "Presentation",
            bindings: {
                presentation: this,
                entity: null,
                component: null
            },
            strongSelection: null,
            observers: {
                strongSelection: entity => entity
            },
            owner: null // owner presentation
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
        this.updateComponent();
    }

    getTitle() {
        return this.state.title(this.entity());
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

    title(block) {
        this.state.title = block;
        return this;
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

    browser() {
        if (!this.hasOwner()) {
            return;
        }
        return this.owner().browser();
    }

    hasBrowser() {
        if(!this.hasOwner())
            return false;
        return this.owner().hasBrowser();
    }

    owner() {
        return this.state.owner;
    }

    hasOwner() {
        return !_.isNull(this.owner());
    }

    hasGivenOwner(presentation) {
        if (presentation === this) {
            return true;
        }

        if (!this.hasOwner()) {
            return false;
        }

        if (this.owner() == presentation) {
            return true;
        }
        return this.owner().hasGivenOwner(presentation);
    }

    onDetached() {
        this.state.owner = null;
        this.state.browser = null;
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
        if (this.hasBrowser()) {
            this.browser().notify({
                event: 'strongSelection',
                entity: entity,
                presentation: this });
        }
    }

    strongSelection() {
        return this.state.strongSelection;
    }

    onStrongSelected(observer) {
        this.state.observers.strongSelection = observer;
    }

    updateComponent() {
        if (this.hasComponent()) {
            this.component().setState(this.component().state);
        }
    }

    render() {
        throw new Error('Subclass responsibility!');
    }


}

export default Presentation;