/**
 * Created by syrel on 14.05.17.
 */

import React from 'react';
import _ from 'underscore';
import Thenable from '../Thenable';

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
            entity: props.bind.presentation.entity(),
            cache: {}
        };

        this.property (
            () => this.presentation().displayedValue(),
            () => this.defaultDisplayedValue(),
            'displayed'
        );
    }

    componentWillReceiveProps(nextProps) {
        nextProps.bind.component = this;
        var nextEntity = nextProps.bind.presentation.entity();
        if (!_.isEqual(this.state.entity, nextEntity)) {
            this.state.entity = nextEntity;
            this.resetState(nextProps);
        }
    }

    componentWillUnmount() {
        this.props.bind.component = _.noop();
        this.resetState();
    }

    resetState() {
        this.state.cache = {};
    }

    defaultDisplayedValue() {
        return this.presentation().defaultDisplayedValue();
    }

    /**
     * Register a new presentation property
     * @param propertyBlock
     * @param defaultBlock
     * @param propertyName
     */
    property(propertyBlock, defaultBlock, propertyName) {
        this[propertyName+'Thenable'] = () => {
            if (_.isUndefined(this.state.cache[propertyName])) {
                this.state.cache[propertyName] = Thenable.of(propertyBlock(), defaultBlock());
                this.state.cache[propertyName].onCompleted(() => {
                    this.setState(this.state);
                })
            }
            return this.state.cache[propertyName];
        };

        this[propertyName+'Value'] = () => this[propertyName+'Thenable']().get();
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

    render() {
        return <div></div>
    }
}

export default PresentationComponent;