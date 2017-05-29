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
import CardPresentation from './../framework/CardPresentation';
import { parse as wkt } from 'wellknown'
import _ from 'underscore'
import geometry from './../geometry';

const ALL_PROPERTIES_QUERY = template`SELECT ?property ?value
{ 
  <${0}> ?property ?value
}`;

// ${0} type of children
// ${1} type of parent
// ${2} parent object
// Example:
// SELECT ?AdminUnit
//     WHERE {
//     ?AdminUnit a <http://www.geonames.org/ontology#A.ADM1>.
//     ?AdminUnit <http://www.geonames.org/ontology#parentCountry> ?InParent.
//     FILTER (?InParent = <https://ld.geo.admin.ch/boundaries/country/CH:2017>)
// }
const CHILDREN_QUERY = template`SELECT ?AdminUnit ?Name
WHERE {
  ?AdminUnit a <${0}>.
  ?AdminUnit <${1}> ?InParent.
  ?AdminUnit <http://schema.org/name> ?Name.
  FILTER (?InParent = <${2}>)
}
ORDER BY ASC(?Name)`;



// ${0} bfs number of municipality
const LINDAS_MUNICIPALITY_QUERY = template`
SELECT DISTINCT ?Municipality WHERE {
   ?Municipality <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.admin.ch/vocab/Municipality>.
   ?Municipality <http://data.admin.ch/vocab/municipalityId> ${0}
} LIMIT 1`;

class LObject {
    constructor(endpoint, uri, name) {
        this.endpoint = endpoint;
        this.uri = uri;
        this.name = name; // optional

        this.cache = {};

        this.extensions = [
            {
                method: this.gtInspectorVersionsIn.bind(this),
                order: 15
            },
            {
                method: this.gtInspectorCantonsIn.bind(this),
                order: 10
            },
            {
                method: this.gtInspectorDistrictsIn.bind(this),
                order: 10
            },
            {
                method: this.gtInspectorMunicipalitiesIn.bind(this),
                order: 10
            },
            {
                method: this.gtInspectorMapIn.bind(this),
                order: 20
            },
            {
                method: this.gtInspectorPropertiesIn.bind(this),
                order: 30
            },
            {
                method: this.gtInspectorMunicipalityLindasIn.bind(this),
                order: 31
            },
            {
                method: this.gtInspectorMunicipalityDBpediaIn.bind(this),
                order: 32
            },
            {
                method: this.gtInspectorPolygonIn.bind(this),
                order: 40
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

                            return new LBinding({
                                endpoint: this.endpoint,
                                property: { content: property[_.keys(property)[0]], name: _.keys(property)[0] },
                                value: LValue.from(this.endpoint, decodeURIComponent(valueContent), valueName)
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
     * @returns {Thenable}
     */
    propertyValueAt(aName) {
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


    /**
     * Returns true if I am a country
     * @returns {Thenable}
     */
    isCountry() {
        return this.hasPropertyValue('22-rdf-syntax-ns#type', 'http://www.geonames.org/ontology#A.PCLI');
    }

    /**
     * Returns true if I am a canton
     * @returns {Thenable}
     */
    isCanton() {
        return this.hasPropertyValue('22-rdf-syntax-ns#type', 'http://www.geonames.org/ontology#A.ADM1');
    }

    /**
     * Returns true if I am a district
     * @returns {Thenable}
     */
    isDistrict() {
        return this.hasPropertyValue('22-rdf-syntax-ns#type', 'http://www.geonames.org/ontology#A.ADM2');
    }

    /**
     * Returns true if I am a municipality
     * @returns {Thenable}
     */
    isMunicipality() {
        return this.hasPropertyValue('22-rdf-syntax-ns#type', 'http://www.geonames.org/ontology#A.ADM3');
    }

    /**
     * Helper method of gtInspectorCantonsIn()
     */
    cantons() {
        if (_.isUndefined(this.cache.cantons)) {
            this.cache.cantons = Thenable.of((resolve, reject) => {
                Sparql.query(this.endpoint.getUri(), CHILDREN_QUERY(
                    'http://www.geonames.org/ontology#A.ADM1',
                    'http://www.geonames.org/ontology#parentCountry',
                    this.uri))
                    .then(result => {
                        var cantons = result.map(each => {
                            var canton = each.binding[0];
                            var name = each.binding[1];
                            return new LObject(this.endpoint, canton.uri, name.literal);
                        });
                        resolve(cantons);
                    }, error => reject(error));
            });
        }
        return this.cache.cantons;
    }

    /**
     * Helper method of gtInspectorDistrictsIn()
     */
    districts() {
        if (_.isUndefined(this.cache.districts)) {
            this.cache.districts = Thenable.of((resolve, reject) => {
                Sparql.query(this.endpoint.getUri(), CHILDREN_QUERY(
                    'http://www.geonames.org/ontology#A.ADM2',
                    'http://www.geonames.org/ontology#parentADM1',
                    this.uri))
                    .then(result => {
                        var districts = result.map(each => {
                            var district = each.binding[0];
                            var name  = each.binding[1];
                            return new LObject(this.endpoint, district.uri, name.literal);
                        });
                        resolve(districts);
                    }, error => reject(error));
            });
        }
        return this.cache.districts;
    }

    /**
     * Helper method of gtInspectorMunicipalitiesIn()
     */
    municipalities() {
        if (_.isUndefined(this.cache.municipalities)) {
            this.cache.municipalities = Thenable.of((resolve, reject) => {
                Sparql.query(this.endpoint.getUri(), CHILDREN_QUERY(
                    'http://www.geonames.org/ontology#A.ADM3',
                    'http://www.geonames.org/ontology#parentADM2',
                    this.uri))
                    .then(result => {
                        var municipalities = result.map(each => {
                            var municipality = each.binding[0];
                            var name  = each.binding[1];
                            return new LObject(this.endpoint, municipality.uri, name.literal);
                        });
                        resolve(municipalities);
                    }, error => reject(error));
            });
        }
        return this.cache.municipalities;
    }

    versions() {
        if (_.isUndefined(this.cache.versions)) {
            this.cache.versions = this
                .propertyValuesAt('hasVersion')
                .then(versions => versions.map(version => new LObject(this.endpoint, version)))
        }
        return this.cache.versions;
    }

    municipalityBy(bfsNumber) {
        var id = 'municipality'+bfsNumber;
        if (_.isUndefined(this.cache[id])) {
            this.cache[id] = Thenable.of((resolve, reject) => {
                Sparql.query(LEndpoint.lindas().getUri(), LINDAS_MUNICIPALITY_QUERY(bfsNumber))
                    .then(result => {
                        var municipality = new LObject(LEndpoint.lindas(), result.binding.uri);
                        resolve(municipality);
                    }, error => reject(error));
            });
        }
        return this.cache[id];
    }

    children() {
        return Thenable.of((resolve, reject) => {
            this.isCountry().then(isCountry => {
                if (isCountry) {
                    resolve(this.cantons());
                }
                else this.isCanton().then(isCanton => {
                    if (isCanton) {
                        resolve(this.districts())
                    }
                    else this.isDistrict().then(isDistrict => {
                        if (isDistrict) {
                            resolve(this.municipalities())
                        }
                        else resolve([])
                    }, reject)
                }, reject)
            }, reject);
        });
    }

    hasDBpedia() {
        return this.hasPropertyContaining('owl#sameAs', 'dbpedia.org');
    }

    dbpedia() {
        return this
            .propertyContaining('owl#sameAs', 'dbpedia.org')
            .then(property => new LObject(LEndpoint.dbpedia(), property.getContent()));
    }

    static extractName(content) {
        return content.substr(content.lastIndexOf('/') + 1)
    }

    gtInspectorPropertiesIn(composite) {
        composite.table(table => {
            table.title(() => 'Geo Properties');
            table.withHeader();
            table.display(entity => {
                return entity.properties()});

            table.strongTransmit(binding => binding.getValue());
            table.column(column => {column
                    .named(() => 'Property')
                    .evaluated(each => each.getName())
            });
            table.column(column => {column
                    .named(() => 'Value')
                    .evaluated(each => each.getContent() + " (" + each.getValue().type + ")")
            });
        });
    }

    gtInspectorPolygonIn(composite) {
        composite.text(text => {
            text.title(entity => 'Polygon');
            text.when(entity => entity.hasProperty('geosparql#hasGeometry'));
            text.bePreformatted();
            text.display(entity => entity
                .propertyAt('geosparql#hasGeometry')
                .then(property => property.propertyAt('geosparql#asWKT'))
                .then(property => JSON.stringify(wkt(property.getContent()), null, 2)));
        });
    }

    gtInspectorMapIn(composite) {
        composite
            .with(composite => {
                composite.title(entity => 'Map');
                composite.when(entity => entity.hasProperty('geosparql#hasGeometry'));

                composite.compose(CardPresentation, card => {
                    card.content(content => content.map(map => {
                        map.when(entity => entity.hasProperty('geosparql#hasGeometry'));
                        map.defaultDisplay(() => {
                            return {
                                unit: {
                                    type: 'MultiPolygon',
                                    coordinates: [],
                                    properties: {}
                                },
                                children: {
                                    type: 'FeatureCollection',
                                    features: [],
                                    properties: {}
                                }
                            }
                        });
                        var geo = geometry(
                            'geosparql#hasGeometry',
                            'geosparql#asWKT',
                            child => child.propertyValueAt('name'));

                        map.display(entity => geo(entity, entity => entity.children()));
                        map.path(layer => { layer
                            .when(entity => entity.children.features.length == 0)
                            .display(entity => entity.unit)
                            .evaluated(geo => geo)
                            .labeled(feature => feature.properties.data)
                            .selected(feature => feature.properties.unit)
                        });
                        map.path(layer => { layer
                            .display(entity => entity.children)
                            .evaluated(geo => geo.features)
                            .labeled(feature => feature.properties.data)
                            .selected(feature => feature.properties.unit)
                        });
                    }));

                    card.named(entity => entity.propertyValueAt('name'));
                    card.text(text => {
                        text.when(entity => entity.hasProperty('ontology#population'));
                        text.display(entity => Thenable.multiple({
                            population: entity.propertyValueAt('ontology#population'),
                            area: entity.propertyValueAt('area'),
                            lakeArea: entity.propertyValueAt('lakeArea')
                        }));
                        text.format(data => {
                            var br = React.createElement('br');
                            return (<div>
                                Population: { data.population  } { br }
                                Area:  { (parseInt(data.area) / 100.0) + ' km²' } { br }
                                Lake area:  { (parseInt(data.lakeArea) / 100.0) + ' km²' } { br }
                            </div>);
                        });
                    });
                });
            });
    }

    gtInspectorVersionsIn(composite) {
        composite.table(table => {
            table.title(() => "Versions");
            table.when(entity => entity.hasProperty('hasVersion'));
            table.display(entity => entity.versions());
            table.strongTransmit(version => version);
            table.column(column => {column
                .evaluated(each => each.toString())
                .display(uri => uri.substr(uri.lastIndexOf(':') + 1))
            });
        });
    }

    gtInspectorCantonsIn(composite) {
        composite.table(table => {
            table.title(() => "Cantons");
            table.when(entity => entity
                .isCountry()
                .then(result => result
                    ? entity.cantons().then(cantons => cantons.length > 0)
                    : result));
            table.display(entity => entity.cantons());
            table.strongTransmit(canton => canton);
            table.column(column => {column
                .evaluated(each => each.toString())
            });
        });
    }

    gtInspectorDistrictsIn(composite) {
        composite.table(table => {
            table.title(() => "Districts");
            table.when(entity => entity
                .isCanton()
                .then(result => result
                    ? entity.districts().then(districts => districts.length > 0)
                    : result));
            table.display(entity => entity.districts());
            table.strongTransmit(district => district);
            table.column(column => {column
                .evaluated(each => each.toString())
            });
        });
    }

    gtInspectorMunicipalitiesIn(composite) {
        composite.table(table => {
            table.title(() => "Municipalities");
            table.when(entity => entity
                .isDistrict()
                .then(result => result
                    ? entity.municipalities().then(municipalities => municipalities.length > 0)
                    : result));
            table.display(entity => entity.municipalities());
            table.strongTransmit(municipality => municipality);
            table.column(column => {column
                .evaluated(each => each.toString())
            });
        });
    }

    gtInspectorMunicipalityLindasIn(composite) {
        composite.table(table => {
            table.when(entity => entity.isMunicipality());
            table.title(() => "Lindas Properties");
            table.withHeader();
            table.display(entity => entity
                .propertyAt('bfsNumber')
                .then(property => this.municipalityBy(property.getContent()))
                .then(municipality => municipality.properties()));
            table.strongTransmit(binding => binding.getValue());
            table.column(column => {column
                .named(() => 'Property')
                .evaluated(each => each.getName())
            });
            table.column(column => {column
                .named(() => 'Value')
                .evaluated(each => each.getContent() + " (" + each.getValue().type + ")")
            });
        });
    }

    gtInspectorMunicipalityDBpediaIn(composite) {
        composite.table(table => {
            table.title(() => "DBpedia Properties");
            table.when(entity => entity
                .isMunicipality()
                .then(result => result
                    ? entity
                    .propertyAt('bfsNumber')
                    .then(property => this.municipalityBy(property.getContent()))
                    .then(municipality => municipality.hasDBpedia())
                    : result));
            table.withHeader();
            table.display(entity => entity
                .propertyAt('bfsNumber')
                .then(property => this.municipalityBy(property.getContent()))
                .then(municipality => municipality.dbpedia())
                .then(dbpedia => dbpedia.properties()));
            table.strongTransmit(binding => binding.getValue());
            table.column(column => {column
                .named(() => 'Property')
                .evaluated(each => each.getName())
            });
            table.column(column => {column
                .named(() => 'Value')
                .evaluated(each => each.getContent() + " (" + each.getValue().type + ")")
            });
        });
    }
}

export default LObject;