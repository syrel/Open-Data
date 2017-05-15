/**
 * Created by syrel on 15.05.17.
 */

import React from 'react';
import CompositePresentation from './CompositePresentation';

class PagerComponent extends CompositePresentation.CompositeComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{whiteSpace: 'nowrap', overflowX: 'auto'}}>
                {
                    this.presentations().map(presentation => (
                        <div style={{width: 45+ '%', display: 'inline-block'}}>{ presentation.render() }</div>
                    ))
                }
            </div>
        );
    }
}

class PagerPresentation extends CompositePresentation {
    constructor(props) {
        super(props);
    }

    render() {
        return (<PagerComponent bind={ this.bindings() } presentations={ this.presentations }/>);
    }
}


export default PagerPresentation;