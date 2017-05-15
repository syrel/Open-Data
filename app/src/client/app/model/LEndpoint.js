/**
 * Created by syrel on 14.05.17.
 */

import Sparql from '../Sparql'
import LClass from './LClass'
import _ from 'underscore'

const ALL_CLASSES_QUERY  = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        SELECT DISTINCT ?type
        WHERE {
            ?a ?property ?type.
            FILTER (?property in (rdf:type))
        }`;

class LEndpoint {
    constructor(uri) {
        this.uri = uri;

        this.extensions = [
            {
                method: this.gtInspectorClassesIn.bind(this),
                order: 10
            }
        ]
    }

    getUri() {
        return this.uri;
    }

    /**
     * Return all possible classes within this Endpoint
     * @returns {Promise}
     */
    allClasses() {
        return new Promise((resolve, reject) => {
            Sparql.query(this.uri, ALL_CLASSES_QUERY)
                .then(result => {
                    var classes = result.root.children[1].children.map(each => {
                        return new LClass(this, each.children[0].children[0].content);
                    });
                    resolve(classes);
                },
                error => reject(error))
        })
    }

    gtInspectorClassesIn(composite) {
        composite.table(table => {
            table.display(_.once((entity) => entity.allClasses()));
            table.column(column => {
                column
                    .named(() => 'Classes')
                    .display(each => each.toString())
            })
        });
    }
}

export default LEndpoint;