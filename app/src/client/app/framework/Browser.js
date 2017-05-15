/**
 * Created by syrel on 15.05.17.
 */

import _ from 'underscore'

class Browser {
    constructor(composite) {
        this.composite = composite;
    }

    openOn(entity) {
        if (!_.isUndefined(entity.extensions)) {
            _.each(_.sortBy(entity.extensions, extension => extension.order), extension => extension.method(this.composite));
        }
        this.on(entity);
    }

    on(entity) {
        this.composite.on(entity);
    }

    render() {
        return this.composite.render();
    }
}

export default Browser;