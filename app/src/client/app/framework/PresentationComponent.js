/**
 * Created by syrel on 14.05.17.
 */

import React from 'react';

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
            presentation: props.bind.presentation
        };
    }

    presentation() {
        return this.state.presentation;
    }
}

export default PresentationComponent;