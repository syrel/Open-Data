/**
 * Created by syrel on 24.05.17.
 */

import React from 'react';
import { Card } from 'react-mdl';
import { CardTitle } from 'react-mdl';
import { CardText } from 'react-mdl';
import { CardActions } from 'react-mdl';
import { Button } from 'react-mdl';
import TextPresentation from './TextPresentation';

import CompositePresentation from './CompositePresentation';

class MaterialCardComponent extends CompositePresentation.CompositeComponent {
    constructor(props) {
        super(props);

        this.property (
            () => this.displayedThenable().then(result => this.presentation().state.named(result)),
            () => '',
            'named'
        );
    }

    render() {
        return (
            <div className="presentation--content" style={{width: '100%'}}>
                <Card shadow={0} style={{ width: '100%', margin: 'auto'}}>
                    <div style={{color: '#fff', background: this.presentation().state.background(this.entity())}}>
                        <div>{ this.presentation().state.contentPresentation.render(-1) }</div>
                        <CardTitle expand style={{color: '#fff', background: this.presentation().state.background(this.entity())}}>
                            { this.namedValue() }
                        </CardTitle>
                    </div>
                    { this.renderPresentations() }
                </Card>
            </div>);
    }

    renderPresentations() {
        var presentations = this.presentations().filter(presentation => {
            return presentation !== this.presentation().state.contentPresentation;
        });

        if (presentations.length == 0) {
            return <div></div>;
        }

        return <div>
            { presentations.map((presentation, index) => presentation.render(index)) }
        </div>
    }
}

class CardPresentation extends CompositePresentation {
    constructor(props) {
        super(props);

        this.add(new CompositePresentation());

        Object.assign(this.state, {
            contentPresentation: this.presentations[0],
            named: entity => '',
            background: entity => '#46B6AC'
        });
    }

    content(block) {
        block(this.state.contentPresentation);
        return this;
    }

    named(block) {
        this.state.named = block;
        return this;
    }

    background(block) {
        this.state.background = block;
        return this;
    }

    text(block) {
        return this.composeNew(new TextPresentation().beCustom(CardText), block);
    }

    render(index) {
        return (<MaterialCardComponent key={ this.uuid() } bind={ this.bindings() }/>);
    }
}

export default CardPresentation;