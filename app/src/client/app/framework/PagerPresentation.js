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

        this.cache = {
            scrollTo: _.noop()
        };
    }

    render() {
        return (
            <div style={{ whiteSpace: 'nowrap', overflowX: 'auto', height: '100%', position: 'absolute', width: '100%' }}>
                {
                    this.presentations().map((presentation, index) => (
                        <div className='pager-pane' ref={ 'pane' + index } key={index}>
                            { presentation.render() }
                        </div>
                    ))
                }
            </div>
        );
    }

    scrollToLast(animated) {
        animated = _.isUndefined(animated) ? true : animated;
        const lastPane = this.refs['pane' + (this.presentations().length-1)];
        const pager = ReactDOM.findDOMNode(this);

        this.presentation().state.scrollToLast = {
            scroll: false,
            animated: false
        };

        var scrollLeft = () => {
            return $(pager).scrollLeft() + $(lastPane).offset().left + $(lastPane).width();
        };

        if (animated) {
            $(pager).animate({
                scrollLeft: scrollLeft()
            }, 750);
        }
        else {
            $(pager).scrollLeft(scrollLeft());
        }
    };

    componentDidUpdate() {
        if (!this.presentation().state.scrollToLast.scroll) {
            return;
        }

        if (!this.presentation().state.scrollToLast.animated) {
            return this.scrollToLast(false);
        }

        const scrollToThenable = Thenable.delay(50).then(() => {
            if (this.presentations().length < 1) {
                return;
            }

            if (scrollToThenable !== this.cache.scrollTo) {
                return;
            }
            this.scrollToLast(this.presentation().state.scrollToLast.animated);
        });
        this.cache.scrollTo = scrollToThenable;
    }
}

class PagerPresentation extends CompositePresentation {
    constructor(props) {
        super(props);

        Object.assign(this.state, {
            scrollToLast: {
                scroll: true,
                animated: false
            }
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

    scrollToLast(isAnimated) {
        this.state.scrollToLast = {
            scroll: true,
            animated: isAnimated
        };
        this.updateComponent();
    }

    render() {
        return (<PagerComponent key={ this.uuid() } bind={ this.bindings() } />);
    }
}


export default PagerPresentation;