/**
 * Created by syrel on 14.05.17.
 */

import React from 'react';
import _ from 'underscore';
import Thenable from '../Thenable';
import Presentation from './Presentation';
import PresentationComponent from './PresentationComponent';
import TablePresentation from './TablePresentation';
import TextPresentation from './TextPresentation';
import MapPresentation from './MapPresentation';
import IFramePresentation from './IFramePresentation';

// Forward declaration
class CompositeComponent extends PresentationComponent {
    constructor(props) {
        super(props);

        Object.assign(this.state, {
            browser: null
        });
    }

    allPresentations() {
        var thenLeft = this.presentation().presentations.length;
        var presentations = this.presentation().presentations.map(presentation => {
            var thenable = presentation.shouldShow();
            var result = {
                presentation: presentation,
                available: false
            };
            thenable.then(available => {
                result.available = available;
                thenLeft--;
            });
            thenable.onCompleted(() => {
                if (!_.isEqual(this.state.presentations, presentations)) {
                    this.state.presentations = CompositeComponent.copyPresentations(presentations);
                    this.setState(this.state);
                }
            });
            return result;
        });

        if (thenLeft <= 0) {
            this.state.presentations = CompositeComponent.copyPresentations(presentations);
        }

        return presentations;
    }

    static copyPresentations(presentations) {
        return presentations.map(each => { return {
            presentation: each.presentation,
            available: each.available
        }});
    }

    presentations() {
        return this.allPresentations()
            .filter(presentation => presentation.available)
            .map(each => each.presentation);
    }

    resetState(nextProps) {
        super.resetState(nextProps);
        this.state.presentations = _.noop();
    }

    render() {
        return (
           <div>{this.presentations().map((presentation, index) => {
               return <div key={ index }> { presentation.render(index) }</div>
           })}</div>
        );
    }
}

class CompositePresentation extends Presentation {
    constructor(props) {
        super(props);
        this.presentations = [];

        Object.assign(this.state, {
            browser: null
        });
    }

    add(presentation) {
        this.presentations.push(presentation);
        presentation.state.owner = this;
        this.setComponentState({ presentations: this.presentations })
    }

    remove(presentation) {
        presentation.onDetached();
        this.presentations = this.presentations.filter(each => each !== presentation);
        this.setComponentState({ presentations: this.presentations });
    }

    removeAll() {
        this.presentations.forEach(presentation => presentation.onDetached());
        this.presentations = [];
        this.setComponentState({ presentations: this.presentations });
    }

    indexOf(presentation) {
        return this.presentations.findIndex(each => each == presentation);
    }

    table(block) {
        return this.compose(TablePresentation, block);
    }

    text(block) {
        return this.compose(TextPresentation, block);
    }

    iframe(block) {
        return this.compose(IFramePresentation, block);
    }

    map(block) {
        return this.compose(MapPresentation, block);
    }

    with(block) {
        return this.compose(CompositePresentation, block);
    }

    sortedPresentations() {
        return _.sortBy(this.presentations, presentation => presentation.state.order);
    }

    dynamic(block, forceDynamic) {

        if (_.isUndefined(forceDynamic)){
            forceDynamic = false;
        }

        const entityThenable = Thenable.of(block());
        entityThenable.then(entity => {
            const presentationsCount = this.presentations.length;

            if (!_.isUndefined(entity.extensions)) {
                var dynamicPresentations = entity.extensions.filter(extension => forceDynamic || _.isUndefined(extension.dynamic) || extension.dynamic);
                _.each(_.sortBy(dynamicPresentations, extension => extension.order), extension => {
                    const count = this.presentations.length;
                    const order = extension.order;
                    extension.method(this);
                    for (var index = count; index < this.presentations.length; index++) {
                        var presentation = this.presentations[index];
                        // breaks recursion
                        if (presentation.state.__dynamic__order__ !== true) {
                            presentation.state.order = order;
                            presentation.state.__dynamic__order__ = true;
                        }
                    }
                });
            }

            for (var index = presentationsCount; index < this.presentations.length; index++) {
                var presentation = this.presentations[index];
                // breaks recursion
                if (presentation.state.__dynamic__ !== true) {
                    presentation.of(() => entity);
                    presentation.on(entity);
                    presentation.state.__dynamic__ = true;
                }
            }
        });
        entityThenable.onCompleted(() => {
            this.presentations = this.sortedPresentations();
            this.updateComponent()
        });
        this.presentations = this.sortedPresentations();
        this.updateComponent();
    }

    compose(presentationClass, block) {
        return this.composeNew(new presentationClass(), block);
    }

    composeNew(presentation, block) {
        this.add(presentation);
        if (!_.isUndefined(block))
            block(presentation);
        return presentation;
    }

    browser() {
        if (!this.hasOwner()) {
            return;
        }
        if (!_.isNull(this.state.browser)) {
            return this.state.browser;
        }
        return this.owner().browser();
    }

    hasBrowser() {
        if(!this.hasOwner()) {
            return false;
        }

        if (!_.isNull(this.state.browser)) {
            return true;
        }

        return this.owner().hasBrowser();
    }

    on(entity) {
        super.on(entity);
        this.presentations.forEach(presentation => presentation.on(this.state.of(entity)));
    }

    last() {
        return this.presentations[this.presentations.length - 1];
    }

    isLast(presentation) {
        return this.last() === presentation;
    }

    openOn(entity) {
        if (!_.isUndefined(entity.extensions)) {
            _.each(_.sortBy(entity.extensions, extension => extension.order), extension => {
                const count = this.presentations.length;
                const order = extension.order;
                extension.method(this);
                for (var index = count; index < this.presentations.length; index++) {
                    var presentation = this.presentations[index];
                    // breaks recursion
                    if (presentation.state.__dynamic__order__ !== true) {
                        presentation.state.order = order;
                        presentation.state.__dynamic__order__ = true;
                    }
                }
            });
        }
        this.on(entity);
    }

    render(index) {
        return (<CompositeComponent key={ this.uuid() } bind={ this.bindings() }/>);
    }
}

CompositePresentation.CompositeComponent = CompositeComponent;
export default CompositePresentation;