/**
 * Created by syrel on 21.05.17.
 */


import React from 'react';
import PresentationComponent from './PresentationComponent';
import Presentation from './Presentation';
import _ from 'underscore'



class TextType {
    renderComponent(textComponent) {
        return this.render(() => textComponent.formattedValue());
    }

    render(block) {
        throw Error('Subclass responsibility');
    }
}

class Paragraph extends TextType {
    constructor(fontSize) {
        super();
        this.fontSize = (_.isUndefined(fontSize)) ? 12 : fontSize;
    }

    render(block) {
        return (<p key={0} style={{ paddingLeft: 10+'px', marginBottom: 5+'px', fontSize: this.fontSize + 'pt' }}>{ block() }</p>);
    }
}

class Preformatted extends TextType {
    constructor(fontSize) {
        super();
        this.fontSize = (_.isUndefined(fontSize)) ? 12 : fontSize;
    }

    render(block) {
        return (<pre key={0} style={{ paddingLeft: 10+'px', marginBottom: 5+'px', fontSize: this.fontSize + 'pt' }}>{ block() }</pre>);
    }
}


class Header extends TextType {
    constructor(level) {
        super();
        this.level = level;
    }

    render(block) {
        const HeaderTag = `h${this.level}`;
        return (<HeaderTag key={0} style={{ padding: 10+'px' }}>{ block() }</HeaderTag>);
    }
}



class TextComponent extends PresentationComponent {

    defaultDisplayedValue() {
        return '';
    }

    formattedValue() {
        return this.presentation().formatted(this.displayedValue());
    }

    render() {
        return this.presentation().type().renderComponent(this);
    }
}

class TextPresentation extends Presentation {
    constructor(props) {
        super(props);

        Object.assign(this.state, {
            formatted: object => object,
            type: new Paragraph()
        });
    }

    beParagraph(fontSize) {
        this.state.type = new Paragraph(fontSize);
    }

    beHeader(level) {
        this.state.type = new Header(level);
    }

    bePreformatted(fontSize) {
        this.state.type = new Preformatted(fontSize);
    }

    type() {
        return this.state.type;
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

    render(index) {
        return (<TextComponent key={index} bind={ this.bindings() }/>)
    }
}

export default TextPresentation;