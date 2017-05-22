/**
 * Created by syrel on 14.05.17.
 */

import React from 'react';
import _ from 'underscore'

// this.state hold inner component state
// presentation must be passed as part of this.props
class PresentationComponent extends React.Component {
    constructor(props) {
        super(props);

        if (typeof props.bind === 'undefined') {
            var message = 'Error: Binding property is not defined!';
            if (typeof console !== 'undefined') {
                console.error(message);
            }
        }

        props.bind.component = this;
        this.state = {
            entity: props.bind.entity
        };
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.state.entity, nextProps.bind.entity)) {
            this.state.entity = nextProps.bind.entity;
            this.resetState(nextProps);
        }
    }

    resetState() {
        this.state.displayedValue = _.noop();
    }

    defaultDisplayedValue() {
        return null;
    }

    displayedValue() {
        if (!this.presentation().hasEntity()) {
            return this.defaultDisplayedValue();
        }

        if (!_.isUndefined(this.state.displayedValue)) {
            return this.state.displayedValue;
        }

        var value = this.defaultDisplayedValue();
        var thenable = this.presentation().displayedValue();
        thenable.then(result => {
            this.state.displayedValue = result;
            value = result;
        });
        thenable.onCompleted(() => this.setState(this.state));
        return value;
    }

    /**
     * Return presentation I represent
     * I am pure props function and can be used within render()
     * @returns {Presentation}
     */
    presentation() {
        return this.props.bind.presentation;
    }

    /**
     * Return presentation's entity I represent
     * I am pure props function and can be used within render()
     * @returns {Object}
     */
    entity() {
        return this.presentation().entity();
    }

    /**
     * Return presentation's strong selection
     * I am pure props function and can be used within render()
     * @returns {Object}
     */
    strongSelection() {
        return this.presentation().strongSelection();
    }
}

export default PresentationComponent;