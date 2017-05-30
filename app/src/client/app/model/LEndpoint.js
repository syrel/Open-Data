/**
 * Created by syrel on 14.05.17.
 */

import Sparql from '../Sparql'
import LClass from './LClass'
import LBNode from './LBNode'
import _ from 'underscore'

const ALL_CLASSES_QUERY  = `
SELECT DISTINCT ?type
WHERE {
    ?a ?property ?type.
    FILTER (?property in (<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>))
}`;

class LEndpoint {
    static setServiceProvider(serviceProvider) {
        LEndpoint.serviceProvider = serviceProvider;
    }

    serviceProvider() {
        return LEndpoint.serviceProvider;
    }

    constructor(uri) {
        this.uri = uri;
        this.cache = {};

        this.extensions = [
            {
                method: this.gtInspectorClassesIn,
                order: 10
            }
        ]
    }

    static lindas() {
        return new LEndpoint('http://lindas-data.ch/sparql');
    }

    static dbpedia() {
        return new LEndpoint('http://dbpedia.org/sparql');
    }

    object(props) {
        return this.serviceProvider().defaultObject(Object.assign(props, {
            endpoint: this
        }));
    }

    query(query) {
        return Sparql.query(this.getUri(), query);
    }

    getUri() {
        return this.uri;
    }

    toString() {
        return this.uri;
    }

    /**
     * Return all possible classes within this Endpoint
     * @returns {Promise}
     */
    classes() {
        if (_.isUndefined(this.cache.classes)) {
            this.cache.classes = new Promise((resolve, reject) => {
                Sparql.query(this.uri, ALL_CLASSES_QUERY)
                    .then(result => {
                        var classes = result.map((each, index) => {
                            if (!_.isUndefined(each.binding.uri)) {
                                return new LClass(this, each.binding.uri)
                            }
                            else if (!_.isUndefined(each.binding.bnode)) {
                                return new LBNode(this, each.binding.bnode)
                            }
                            else {
                                console.error('Unknown class: ('+ index + ')', each);
                            }
                        });
                        resolve(classes);
                    }, error => reject(error))
            });
        }
        return this.cache.classes;
    }

    gtInspectorClassesIn(composite) {
        composite.table(table => {
            table.title(() => "Classes");
            table.display(_.once((entity) => entity.classes()));
            table.column(column => {
                column.display(each => each.toString())
            })
        });
    }
}

export default LEndpoint;