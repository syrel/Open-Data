/**
 * Created by syrel on 21.05.17.
 */


import React from 'react';
import PresentationComponent from './PresentationComponent';
import Presentation from './Presentation';
import _ from 'underscore'
import Thenable from '../Thenable'


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

class Custom extends TextType {
    constructor(component, attributes) {
        super();
        this.component = component;
        this.attributes = attributes;
    }

    render(block) {
        return React.createElement(this.component, this.attributes, block());
    }
}

class TextComponent extends PresentationComponent {

    constructor(props) {
        super(props);

        this.property (
            () => this.displayedThenable().then(result => this.presentation().state.formatted(result)),
            () => _.noop(),
            'formatted'
        );
    }

    defaultDisplayedValue() {
        return '';
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

    beCustom(component, attributes) {
        this.state.type = new Custom(component, attributes);
        return this;
    }

    beParagraph(fontSize) {
        this.state.type = new Paragraph(fontSize);
        return this;
    }

    beHeader(level) {
        this.state.type = new Header(level);
        return this;
    }

    bePreformatted(fontSize) {
        this.state.type = new Preformatted(fontSize);
        return this;
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

    /**
     * Returns a formatted value of a given entity
     * @param aThenable
     * @returns {Thenable}
     */
    formattedValue(entity) {
        return Thenable.of(entity).then(value => this.state.formatted(value));
    }

    render(index) {
        return (<TextComponent key={ this.uuid() } bind={ this.bindings() }/>)
    }
}

export default TextPresentation;