/**
 * Created by syrel on 15.05.17.
 */

import Sparql from '../Sparql'
import template from '../template'
import LObject from './LObject'

const ALL_OBJECTS_QUERY  = template`SELECT ?object
{ 
  ?object ?pred ?class
  FILTER (?class in (<${0}>))
}`;

class LClass {
    constructor(endpoint, clazz) {
        this.endpoint = endpoint;
        this.clazz = clazz;

        this.extensions = [
            {
                method: this.gtInspectorObjectsIn,
                order: 10
            }
        ]
    }

    toString() {
        return this.clazz;
    }

    /**
     * Return all objects of this Class
     * @returns {Promise}
     */
    allObjects() {
        return new Promise((resolve, reject) => {
            Sparql.query(this.endpoint.getUri(), ALL_OBJECTS_QUERY(this.clazz))
                .then(result => {
                        var objects = result.root.children[1].children.map(each => {
                            return new LObject(this.endpoint, each.children[0].children[0].content);
                        });
                        resolve(objects);
                    },
                    error => reject(error))
        })
    }

    gtInspectorObjectsIn(composite) {
        composite.table(table => {
            table.title(() => "Objects");
            table.display((entity) => entity.allObjects());
            table.column(column => {
                column.display(each => each.toString())
            })
        });
    }
}

export default LClass;