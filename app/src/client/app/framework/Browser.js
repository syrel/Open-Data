/**
 * Created by syrel on 15.05.17.
 */

import _ from 'underscore'

class Browser {
    constructor(composite) {
        this.composite = composite;
        this.composite.state.browser = this;
        this.composite.state.owner = this;

        this.state = {
            observers: {}
        }
    }

    openOn(entity) {
        this.composite.openOn(entity);
    }

    on(entity) {
        this.composite.on(entity);
    }

    notify(event) {
        var observers = _.find(this.state.observers, (value, key) => _.isEqual(key, event.event));
        if (_.isUndefined(observers)) {
            return;
        }
        observers.forEach(observer => observer(event));
    }

    hasGivenOwner() {
        return false;
    }

    when(eventName, block) {
        if (_.isUndefined(this.state.observers[eventName])) {
            this.state.observers[eventName] = [];
        }
        this.state.observers[eventName].push(block);
    }

    render() {
        return this.composite.render();
    }
}

export default Browser;