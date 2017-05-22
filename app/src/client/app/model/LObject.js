/**
 * Created by syrel on 15.05.17.
 */

import Sparql from '../Sparql'
import template from '../template'
import LEndpoint from './LEndpoint'
import LBinding from './LBinding'
import LValue from './LValue'
import Thenable from './../Thenable'
import { parse } from 'wellknown'
import _ from 'underscore'

const ALL_PROPERTIES_QUERY = template`SELECT ?property ?value
{ 
  <${0}> ?property ?value
}`;

// ${0} type of children
// ${1} type of parent
// ${2} parent object
const CHILDREN_QUERY = template`SELECT ?AdminUnit ?Name
WHERE {
  ?AdminUnit a <${0}>.
  ?AdminUnit <${1}> ?InParent.
  ?AdminUnit <http://schema.org/name> ?Name.
  FILTER (?InParent = <${2}>)
}
ORDER BY ASC(?Name)`;

// Example:
// SELECT ?AdminUnit
//     WHERE {
//     ?AdminUnit a <http://www.geonames.org/ontology#A.ADM1>.
//     ?AdminUnit <http://www.geonames.org/ontology#parentCountry> ?InParent.
//     FILTER (?InParent = <https://ld.geo.admin.ch/boundaries/country/CH:2017>)
// }


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
                method: this.gtInspectorPropertiesIn.bind(this),
                order: 10
            },
            {
                method: this.gtInspectorMunicipalityLindasIn.bind(this),
                order: 11
            },
            {
                method: this.gtInspectorMunicipalityDBpediaIn.bind(this),
                order: 12
            },
            {
                method: this.gtInspectorMapIn.bind(this),
                order: 20
            },
            {
                method: this.gtInspectorCantonsIn.bind(this),
                order: 30
            },
            {
                method: this.gtInspectorDistrictsIn.bind(this),
                order: 30
            },
            {
                method: this.gtInspectorMunicipalitiesIn.bind(this),
                order: 30
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
            table.title(() => "Properties");
            table.withHeader();
            table.display(entity => entity.properties());
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
                .then(property => JSON.stringify(parse(property.getContent()), null, 2)));
        });
    }

    gtInspectorMapIn(composite) {
        composite
            .with(composite => {
                composite.title(entity => 'Map');
                composite.when(entity => entity.hasProperty('geosparql#hasGeometry'));

                composite.text(text => {
                    text.when(entity => entity.hasProperty('name'));
                    text.beHeader(2);
                    text.display(entity => entity
                        .propertyAt('name')
                        .then(property => property.getContent()));
                });
                composite.map(map => {
                    map.when(entity => entity.hasProperty('geosparql#hasGeometry'));
                    map.display(entity => entity
                        .propertyAt('geosparql#hasGeometry')
                        .then(property => property.propertyAt('geosparql#asWKT'))
                        .then(property => parse(property.getContent())));
                });
                composite.text(text => {
                    text.when(entity => entity.hasProperty('ontology#population'));
                    text.beParagraph(14);
                    text.display(entity => entity
                        .propertyAt('ontology#population')
                        .then(property => property.getContent()));
                    text.format(string => 'Population: ' + string);
                });
                composite.text(text => {
                    text.when(entity => entity.hasProperty('area'));
                    text.beParagraph(14);
                    text.display(entity => entity
                        .propertyAt('area')
                        .then(property => property.getContent()));
                    text.format(string => 'Area: ' + string + ' km²');
                });
                composite.text(text => {
                    text.when(entity => entity.hasProperty('lakeArea'));
                    text.beParagraph(14);
                    text.display(entity => entity
                        .propertyAt('lakeArea')
                        .then(property => property.getContent()));
                    text.format(string => 'Lake area: ' + string + ' km²');
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
            table.title(() => "Lindas");
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
            table.title(() => "DBpedia");
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