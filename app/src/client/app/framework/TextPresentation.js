/**
 * Created by syrel on 21.05.17.
 */


import React from 'react';
import PresentationComponent from './PresentationComponent';
import Presentation from './Presentation';

class TextComponent extends PresentationComponent {

    defaultDisplayedValue() {
        return '';
    }

    render() {
        return (
            <pre style={{ padding: 10+'px' }}>{ this.presentation().formatted(this.displayedValue()) }</pre>
        );
    }
}

class TextPresentation extends Presentation {
    constructor(props) {
        super(props);

        Object.assign(this.state, {
            formatted: object => object
        });
    }

    /**
     * Format block always receives String as first argument
     * @param block
     * @returns {TextPresentation}
     */
    format(block) {
        Object.assign(this.state, {
            formatted: block
        });
        return this;
    }

    formatted(object) {
        return this.state.formatted(object);
    }

    render(entity) {
        return (<TextComponent bind={ this.bindings() }/>)
    }
}

export default TextPresentation;