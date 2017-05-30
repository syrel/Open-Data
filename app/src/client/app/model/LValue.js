/**
 * Created by syrel on 21.05.17.
 */

import _ from 'underscore';
import Thenable from './../Thenable'

class LValue {
    constructor(endpoint, content, type) {
        this.endpoint = endpoint;
        this.content = content;
        this.type = type;

        this.extensions = [
            {
                method: this.gtInspectorLiteralIn,
                order: 10
            },
            {
                method: this.gtInspectorUriIn.bind(this),
                order: 10
            }
        ]
    }

    isUri() {
        return this.type.toLowerCase() == 'uri';
    }

    isLiteral() {
        return this.type.toLowerCase() == 'literal';
    }

    /**
     * Return {LObject}
     */
    getUriObject() {
        if (this.isUri()) {
            if (_.isUndefined(this.uriObject)) {
                this.uriObject =  this.endpoint.object({
                    uri: this.content
                });
            }
            return this.uriObject;
        }
    }

    /**
     * Return {Thenable}
     */
    getObject() {
        if (this.isUri()) {
            return Thenable.resolve(this.getUriObject());
        }
        return Thenable.reject(Error('Not an uri!'));
    }

    gtInspectorLiteralIn(composite) {
        composite.text(text => { text
            .title(() => 'Literal')
            .display(entity => entity.content)
            .when(entity => entity.isLiteral())
        })
    }

    gtInspectorUriIn(composite) {
        if (!this.isUri()) {
            return;
        }
        //console.log(this.getUriObject());
        composite.dynamic(() => this.getUriObject(), true);
    }

    static from(endpoint, content, type) {
        return new LValue(endpoint, content, type);
    }
}

export default LValue;