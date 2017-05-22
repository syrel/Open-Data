/**
 * Created by syrel on 23.05.17.
 */

import React from 'react';
import PresentationComponent from './PresentationComponent';
import Presentation from './Presentation';

class IFrameComponent extends PresentationComponent {
    defaultDisplayedValue() {
        return 'about:blank';
    }

    iframe() {
        return {
            __html: '<iframe style="border: 0" height="90%" width="95%" src="'+ this.displayedValue()+'"></iframe>'
        }
    }

    render() {
        return (<div><div dangerouslySetInnerHTML={ this.iframe() }/></div>);
    }
}

class IFramePresentation extends Presentation {
    constructor(props) {
        super(props);
    }

    render(index) {
        return (<IFrameComponent key={index} bind={ this.bindings() }/>)
    }
}

export default IFramePresentation;