/**
 * Created by syrel on 14.05.17.
 */

import Sparql from '../Sparql'

const ALL_CLASSES_QUERY  = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        SELECT DISTINCT ?type
        WHERE {
            ?a ?property ?type.
            FILTER (?property in (rdf:type))
        }`;

class Endpoint {
    constructor(endpoint) {
        this.endpoint = endpoint;

        this.extensions = [
            {
                method: this.gtInspectorClassesIn.bind(this),
                order: 10
            }
        ]
    }

    /**
     * Return all possible classes within this Endpoint
     * @returns {Promise}
     */
    allClasses() {
        return new Promise((resolve, reject) => {
            Sparql.query(this.endpoint, ALL_CLASSES_QUERY)
                .then(result => {
                    var classes = result.root.children[1].children.map(each => {
                        return each.children[0].children[0].content;
                    });
                    resolve(classes);
                },
                error => reject(error))
        })
    }

    gtInspectorClassesIn(composite) {
        composite.table(table => {
            table.display((entity) => entity.allClasses());
            table.column(column => {
                column
                    .named(() => 'Classes')
                    .evaluated(each => each)
            })
        });
    }
}

export default Endpoint;