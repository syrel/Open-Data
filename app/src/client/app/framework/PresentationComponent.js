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
            entity: props.bind.entity,
            cache: {}
        };

        this.property (
            () => this.presentation().displayedValue(),
            () => this.defaultDisplayedValue(),
            'displayed'
        );
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.state.entity, nextProps.bind.entity)) {
            this.state.entity = nextProps.bind.entity;
            this.resetState(nextProps);
        }
    }

    resetState() {
        this.state.cache = {};
        console.log('reset cache');
    }

    defaultDisplayedValue() {
        return _.noop();
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

    // displayedValue() {
    //     return this.presentationProperty(
    //         presentation => presentation.displayedValue(),
    //         presentation => this.defaultDisplayedValue(),
    //         'displayedValue');
    // }
    //
    // presentationProperty(propertyBlock, defaultBlock, cacheName) {
    //     if (!this.presentation().hasEntity()) {
    //         return defaultBlock(this.presentation());
    //     }
    //
    //     if (_.isUndefined(this.state.cache[cacheName])) {
    //         this.state.cache[cacheName] = {
    //             value: _.noop(),
    //             thenable: _.noop(),
    //             valid: false,
    //             session: {}
    //         }
    //     }
    //
    //     // value is computed and valid, we can return it directly
    //     if (this.state.cache[cacheName].valid) {
    //         return this.state.cache[cacheName].value;
    //     }
    //
    //     var defaultValue = defaultBlock(this.presentation());
    //     var resolvedValue = defaultValue;
    //
    //     // value is not computed and we don't load value yet, create loader
    //     if (_.isUndefined(this.state.cache[cacheName].thenable)) {
    //         // create loader
    //         var session = this.state.cache[cacheName].session;
    //         var thenable = Thenable.of(propertyBlock(this.presentation()));
    //         var valueChanged = false;
    //
    //         this.state.cache[cacheName].thenable = thenable;
    //         thenable.then(result => {
    //             // we computed our real value, but first need to check if session is still the same
    //             if (!_.isUndefined(this.state.cache[cacheName])) {
    //                 if (session === this.state.cache[cacheName].session) {
    //                     resolvedValue = result;
    //                     valueChanged = !_.isEqual(this.state.cache[cacheName].value, resolvedValue);
    //                     this.state.cache[cacheName].value = resolvedValue;
    //                     this.state.cache[cacheName].valid = true;
    //                 }
    //             }
    //         });
    //         thenable.onCompleted(() => {
    //             if (!_.isUndefined(this.state.cache[cacheName])) {
    //                 if (session === this.state.cache[cacheName].session) {
    //                     if (!_.isEqual(defaultValue, resolvedValue) && valueChanged) {
    //                         this.setState(this.state)
    //                     }
    //                 }
    //             }
    //         });
    //     }
    //     return resolvedValue;
    // }

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