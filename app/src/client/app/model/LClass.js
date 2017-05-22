/**
 * Created by syrel on 15.05.17.
 */

import Sparql from '../Sparql'
import template from '../template'
import LObject from './LObject'
import Thenable from './../Thenable'
import _ from 'underscore'

const ALL_OBJECTS_QUERY  = template`SELECT ?object
{ 
  ?object ?pred ?class
  FILTER (?class in (<${0}>))
}`;

class LClass {
    constructor(endpoint, clazz) {
        this.endpoint = endpoint;
        this.clazz = clazz;
        this.cache = {};

        this.extensions = [
            {
                method: this.gtInspectorObjectsIn,
                order: 10
            }
        ]
    }

    toString() {
        return this.clazz.substr(this.clazz.lastIndexOf('/') + 1);
    }

    /**
     * Return all objects of this Class
     * @returns {Promise}
     */
    objects() {
        if (_.isUndefined(this.cache.objects)) {
            this.cache.objects = Thenable.of((resolve, reject) => {
                Sparql.query(this.endpoint.getUri(), ALL_OBJECTS_QUERY(this.clazz))
                    .then(result => {
                        var objects = result.map(each => {
                            return new LObject(this.endpoint, each.binding.uri);
                        });
                        resolve(objects);
                    }, error => reject(error))
            });
        }
        return this.cache.objects;
    }

    gtInspectorObjectsIn(composite) {
        composite.table(table => {
            table.title(() => "Objects");
            table.display((entity) => entity.objects());
            table.column(column => {
                column.display(each => each.toString())
            })
        });
    }
}

export default LClass;