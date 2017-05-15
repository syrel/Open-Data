/**
 * Created by syrel on 14.05.17.
 */

import React from 'react';

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
        this.state = {};
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

    bindTo(presentation) {
        this.props.bind.entity = presentation.entity();
        this.props.bind.component = this;
        this.props.bind.presentation = presentation;
        presentation.bindings().component = this;
        Object.assign(this.state, {
            entity: presentation.entity(),
            presentation: presentation,
            strongSelection: presentation.strongSelection()
        });
    }




}

export default PresentationComponent;