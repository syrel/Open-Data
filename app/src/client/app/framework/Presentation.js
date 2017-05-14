/**
 * Created by syrel on 14.05.17.
 */

import React from 'react';

class Presentation {
    constructor(props) {
        this.state = {
            displayed: (entity) => entity,
            displayedValue: null,
            bindings: {
                presentation: this,
                entity: null,
                component: null
            },
        };
    }

    display(block) {
        this.state.displayed = block;
        if (!(block instanceof Promise)) {
            this.state.displayed = () => new Promise((resolve, reject) => {
                if (this.hasEntity()) {
                    resolve(block(this.entity()));
                }
            })
        }
        return this;
    }

    on(entity) {
        if (typeof entity === 'undefined' || entity === null) {
            throw Error('Entity can not be nil!');
        }
        this.state.bindings.entity = entity;
        if (this.hasComponent()) {
            this.component().setState({ entity: entity });
        }
    }

    entity() {
        return this.state.bindings.entity;
    }

    displayedValue() {
        return this.state.displayed();
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
}

export default Presentation;