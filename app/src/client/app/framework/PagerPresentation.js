/**
 * Created by syrel on 15.05.17.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';
import $ from 'jquery';
import CompositePresentation from './CompositePresentation';
import Thenable from './../Thenable'

class PagerComponent extends CompositePresentation.CompositeComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{ whiteSpace: 'nowrap', overflowX: 'auto', height: '100%', position: 'absolute', width: '100%' }}>
                {
                    this.presentations().map((presentation, index) => (
                        <div ref={ 'pane' + index } key={index} style={{ minWidth: '45%', maxWidth: '45%', height: '100%', display: 'inline-block', verticalAlign: 'top' }}>
                            { presentation.render() }
                        </div>
                    ))
                }
            </div>
        );
    }

    componentDidUpdate() {
        if (!this.props.scrollToLast) {
            return;
        }

        if (this.presentations().length < 1) {
            return;
        }

        const pane = this.refs['pane' + (this.presentations().length-1)];
        const pager = ReactDOM.findDOMNode(this);

        Thenable.delay(50).then(() => {
            $(pager).animate({
                scrollLeft: $(pager).scrollLeft() + $(pane).offset().left + $(pane).width()
            }, 750);
        });
    }
}

class PagerPresentation extends CompositePresentation {
    constructor(props) {
        super(props);

        Object.assign(this.state, {
            scrollToLast: true
        });
    }

    add(presentation) {
        super.add(presentation);
    }

    // return presentation pane that contains a given presentation
    paneOf(presentation) {
        return _.find(this.presentations, each => presentation.hasGivenOwner(each));
    }

    // pops all presentations after a given one
    popAfter(presentation) {
        var index = this.indexOf(presentation);
        if (index < -1) {
            return;
        }
        for (var i = this.presentations.length - 1; i > index; i--) {
            this.remove(this.presentations[i]);
        }
    }

    scrollToLast() {
        this.state.scrollToLast = true;
    }

    render() {
        var scroll = this.state.scrollToLast;
        this.state.scrollToLast = false;
        return (<PagerComponent bind={ this.bindings() } scrollToLast={ scroll } />);
    }
}


export default PagerPresentation;