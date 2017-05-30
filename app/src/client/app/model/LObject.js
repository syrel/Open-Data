/**
 * Created by syrel on 15.05.17.
 */

import React from 'react';
import Sparql from '../Sparql'
import template from '../template'
import LEndpoint from './LEndpoint'
import LBinding from './LBinding'
import LValue from './LValue'
import Thenable from './../Thenable'
import _ from 'underscore'

const ALL_PROPERTIES_QUERY = template`SELECT ?property ?value
{ 
  <${0}> ?property ?value
}`;

// ${0} bfs number of municipality
const LINDAS_MUNICIPALITY_QUERY = template`
SELECT DISTINCT ?Municipality WHERE {
   ?Municipality <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.admin.ch/vocab/Municipality>.
   ?Municipality <http://data.admin.ch/vocab/municipalityId> ${0}
} LIMIT 1`;

class LObject {
    static setServiceProvider(serviceProvider) {
        LObject.serviceProvider = serviceProvider;
    }

    serviceProvider() {
        return LObject.serviceProvider;
    }

    constructor(props) {
        this.endpoint = props.endpoint;
        this.uri = props.uri;
        this.name = props.name; // optional

        if (_.isUndefined(this.endpoint)) {
            throw Error('Endpoint must not be nil!');
        }

        if (_.isUndefined(this.uri)) {
            throw Error('Uri must not be nil!');
        }

        this.cache = {};

        this.extensions = [
            {
                method: this.gtInspectorPropertiesIn.bind(this),
                order: 30,
                dynamic: true
            }
        ]
    }

    toString() {
        if (!_.isUndefined(this.name)) {
            return this.name;
        }
        return this.uri;
    }

    /**
     * Returns all properties of this object
     * @returns {Thenable}
     */
    properties() {
        if (_.isUndefined(this.cache.properties)) {
            this.cache.properties = Thenable.of((resolve, reject) => {
                Sparql.query(this.endpoint.getUri(), ALL_PROPERTIES_QUERY(this.uri))
                    .then(result => {
                        var properties = result.map(each => {
                            var bindings = each.binding;
                            var property = _.omit(bindings[0], '$');
                            var value = _.omit(bindings[1], '$');

                            var valueContent = value[_.keys(value)[0]];
                            if (_.isObject(valueContent)) {
                                valueContent = valueContent._;
                            }
                            var valueName = _.keys(value)[0];
                            try {
                                valueContent = decodeURIComponent(valueContent)
                            }
                            catch (e) {/* is not URI, simply ignore */}
                            return new LBinding({
                                endpoint: this.endpoint,
                                property: { content: property[_.keys(property)[0]], name: _.keys(property)[0] },
                                value: LValue.from(this.endpoint, valueContent, valueName)
                            });
                        });
                        resolve(properties);
                    }, error => reject(error));
            });
        }
        return this.cache.properties;
    }

    /**
     * Returns first property binding with the given name
     * @returns {Thenable}
     */
    propertyAt(aName) {
        return Thenable.of((resolve, reject) => {
            this.properties().then(properties => {
                let found = properties.filter(property => LObject.extractName(property.getProperty().content) == aName);
                if (found.length > 0) {
                    resolve(found[0]);
                }
                else reject(Error('Property #' + aName + ' not found'));
            },
            error => { reject(error) })
        });
    }

    /**
     * Returns a collection of property bindings with the given name
     * @returns {Thenable}
     */
    propertiesAt(aName) {
        return Thenable.of((resolve, reject) => {
            this.properties().then(properties => {
                    let found = properties.filter(property => LObject.extractName(property.getProperty().content) == aName);
                    resolve(found);
                },
                error => { reject(error) })
        });
    }

    /**
     * Return value(content) of a property with a given name
     * @param aName
     * @param defaultValue
     * @returns {Thenable}
     */
    propertyValueAt(aName, defaultValue) {
        if(!_.isUndefined(defaultValue)) {
            return this.hasProperty(aName).then(hasProperty => {
                if (hasProperty) {
                    return this.propertyAt(aName).then(property => property.getContent());
                }
                else return Thenable.resolve(defaultValue);
            })
        }
        return this.propertyAt(aName).then(property => property.getContent());
    }

    /**
     * Return values(content) of the properties with a given name
     * @param aName
     * @returns {Thenable}
     */
    propertyValuesAt(aName) {
        return this.propertiesAt(aName).then(properties => properties.map(property => property.getContent()));
    }

    /**
     * Returns true if there is a property with a given name
     * @param aName
     * @returns {Thenable}
     */
    hasProperty(aName) {
        return this
            .properties()
            .then(properties => properties
                .filter(binding => LObject.extractName(binding.getName()) == aName)
                .length > 0)
    }

    /**
     * Returns true if there is a property with given name and value
     * @param aName
     * @param aValue
     * @returns {Thenable}
     */
    hasPropertyValue(aName, aValue) {
        return this
            .properties()
            .then(properties => properties
                .filter(binding => {
                    return LObject.extractName(binding.getName()) == aName
                        && binding.getContent() == aValue;
                })
                .length > 0)
    }

    /**
     * Return property with a given name and value containing a provided substring
     * @param aName
     * @param aSubstring
     * @returns {Thenable}
     */
    propertyContaining(aName, aSubstring) {
        return Thenable.of((resolve, reject) => {
            this.properties().then(properties => {
                let found = properties.filter(binding =>
                        LObject.extractName(binding.getName()) == aName
                            && binding.getContent().toString().includes(aSubstring));
                if (found.length > 0) {
                    resolve(found[0]);
                }
                else reject(Error('Property #' + aName + ' not found'));
            }, error => { reject(error) });
        });
    }

    /**
     * Return true if there is a property with a given name and value containing a provided substring
     * @param aName
     * @param aSubstring
     * @returns {Thenable}
     */
    hasPropertyContaining(aName, aSubstring) {
        return this
            .properties()
            .then(properties => properties
                .filter(binding => {
                    return LObject.extractName(binding.getName()) == aName
                        && binding.getContent().toString().includes(aSubstring);
                })
                .length > 0)
    }

    municipalityBy(bfsNumber) {
        var id = 'municipality'+bfsNumber;
        if (_.isUndefined(this.cache[id])) {
            this.cache[id] = Thenable.of((resolve, reject) => {
                Sparql.query(LEndpoint.lindas().getUri(), LINDAS_MUNICIPALITY_QUERY(bfsNumber))
                    .then(result => {
                        var municipality = new LObject({
                            endpoint: LEndpoint.lindas(),
                            uri: result.binding.uri});
                        resolve(municipality);
                    }, error => reject(error));
            });
        }
        return this.cache[id];
    }

    hasDBpedia() {
        return this.hasPropertyContaining('owl#sameAs', 'dbpedia.org');
    }

    lindas() {
        if (_.isUndefined(this.cache.lindas)) {
            this.cache.lindas = this.propertyValueAt('bfsNumber').then(bfsNumber => Sparql
                .query(this.serviceProvider().lindasEndpoint().getUri(), LINDAS_MUNICIPALITY_QUERY(bfsNumber))
                .then(result => this.serviceProvider().lindasObject({
                    uri: result.binding.uri
                })));
        }
        return this.cache.lindas;
    }

    dbpedia() {
        return this.lindas().then(lindas => lindas.dbpedia());
    }

    static extractName(content) {
        return content.substr(content.lastIndexOf('/') + 1)
    }


    propertiesTitle() {
        return 'Properties';
    }

    gtInspectorPropertiesIn(composite) {
        composite.table(table => {
            table.title(entity => entity.propertiesTitle());
            table.withHeader();
            table.display(entity => entity.properties());
            table.strongTransmit(binding => binding.getValue());
            table.column(column => {column
                    .named(() => 'Property')
                    .evaluated(each => each.getFullname())
            });
            table.column(column => {column
                    .named(() => 'Value')
                    .evaluated(each => each.getContent() + " (" + each.getValue().type + ")")
            });
        });
    }
}

export default LObject;