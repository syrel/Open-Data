/**
 * Created by syrel on 14.05.17.
 */

import React from 'react';
import _ from 'underscore'
import Thenable from './../Thenable'


class Presentation {
    constructor(props) {
        this.state = {
            of: entity => entity,
            displayed: entity => Thenable.resolve(entity),
            defaultDisplayed: entity => _.noop(),
            title: (entity) => "Presentation",
            when: (entity) => Thenable.resolve(true),
            bindings: {
                presentation: this,
                entity: _.noop(),
                component: null
            },
            strongSelection: null,
            strongTransmit: entity => entity,
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

    defaultDisplay(block) {
        this.state.defaultDisplayed = block;
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

    /**
     * Returns a displayed value of the entity
     * @returns {Thenable}
     */
    displayedValue() {
        return Thenable.of(this.state.displayed(this.state.of(this.entity())));
    }

    defaultDisplayedValue() {
        return this.state.defaultDisplayed(this.state.of(this.entity()));
    }

    title(block) {
        this.state.title = block;
        return this;
    }

    when(block) {
        this.state.when = block;
        return this;
    }

    of(block) {
        this.state.of = block;
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
        return !_.isUndefined(this.entity()) && !_.isNull(this.entity());
    }

    /**
     * @returns {Thenable}
     */
    shouldShow() {
        var thenable = this.state.when(this.state.of(this.entity()));
        if (_.isUndefined(thenable.then)) {
            thenable = Thenable.resolve(thenable);
        }
        else {
            thenable = new Thenable(thenable);
        }
        return thenable;
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


    strongTransmit(block) {
        this.state.strongTransmit = block;
        return this;
    }

    strongSelected(entity) {
        this.state.strongSelection = entity;
        this.state.observers.strongSelection(entity);
        this.setComponentState({strongSelection: entity});
        if (this.hasBrowser()) {
            this.browser().notify({
                event: 'strongSelection',
                entity: this.state.strongTransmit(entity),
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