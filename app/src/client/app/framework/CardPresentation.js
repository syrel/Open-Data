/**
 * Created by syrel on 24.05.17.
 */

import React from 'react';
import { Card } from 'react-mdl';
import { CardTitle } from 'react-mdl';
import { CardText } from 'react-mdl';
import { CardActions } from 'react-mdl';
import { Button } from 'react-mdl';
import { CardMenu } from 'react-mdl';
import { IconButton } from 'react-mdl';

import CompositePresentation from './CompositePresentation';

class MaterialCardComponent extends CompositePresentation.CompositeComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return (<Card shadow={0} style={{ width: '100%', margin: 'auto'}}>
            <div style={{color: '#fff', background: '#46B6AC'}}>
                <div>{ this.presentations().map((presentation, index) => presentation.render(index)) }</div>
                <CardTitle expand style={{color: '#fff', background: '#46B6AC'}}>Update</CardTitle>
            </div>
            <CardText>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Aenan convallis.
            </CardText>
            <CardActions border>
                <Button colored>View Updates</Button>
            </CardActions>
        </Card>);
    }
}

class CardPresentation extends CompositePresentation {
    constructor(props) {
        super(props);
    }

    render(index) {
        return (<MaterialCardComponent key={index} bind={ this.bindings() }/>);
    }
}

export default CardPresentation;