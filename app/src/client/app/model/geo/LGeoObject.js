/**
 * Created by syrel on 29.05.17.
 */

import LGeoEndpoint from './LGeoEndpoint';
import LObject from './../LObject';
import Thenable from './../../Thenable';
import template from '../../template'
import _ from 'underscore';
import CardPresentation from './../../framework/CardPresentation';
import geometry from './../../geometry';
import React from 'react';
import { parse as wkt } from 'wellknown'
import Sparql from '../../Sparql'

// ${0} bfs number of municipality
const LINDAS_MUNICIPALITY_QUERY = template`
SELECT DISTINCT ?Municipality WHERE {
   ?Municipality <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.admin.ch/vocab/Municipality>.
   ?Municipality <http://data.admin.ch/vocab/municipalityId> ${0}
} LIMIT 1`;


class LGeoObject extends LObject {
    constructor(props) {
        super(Object.assign(props, {
            endpoint: LGeoEndpoint.uniqueInstance()
        }));

        this.cache.lindas = Thenable.of(props.lindas);
        this.cache.dbpedia = Thenable.of(props.dbpedia);

        this.extensions.push(
            {
                method: this.gtInspectorCantonsIn.bind(this),
                order: 10,
                dynamic: true
            },
            {
                method: this.gtInspectorDistrictsIn.bind(this),
                order: 10,
                dynamic: true
            },
            {
                method: this.gtInspectorMunicipalitiesIn.bind(this),
                order: 10,
                dynamic: true
            },
            {
                method: this.gtInspectorVersionsIn.bind(this),
                order: 15,
                dynamic: true
            },
            {
                method: this.gtInspectorWebMapIn.bind(this),
                order: 20,
                dynamic: true
            },
            {
                method: this.gtInspectorMapIn.bind(this),
                order: 20,
                dynamic: true
            },
            {
                method: this.gtInspectorPolygonIn.bind(this),
                order: 40,
                dynamic: true
            });
    }

    versions() {
        if (_.isUndefined(this.cache.versions)) {
            this.cache.versions = this
                .propertyValuesAt('hasVersion')
                .then(versions => versions.map(version => new (Object.getPrototypeOf(this).constructor)({
                    uri: version,
                    lindas: this.cache.lindas,
                    dbpedia: this.cache.dbpedia
                })))
        }
        return this.cache.versions;
    }

    geo() {
        return Thenable.resolve(this);
    }

    lindas() {
        throw Error('Should be implemented');
        // if (_.isUndefined(this.cache.lindas)) {
        //     this.cache.lindas = this.propertyValueAt('bfsNumber').then(bfsNumber =>
        //         this.serviceProvider().lindasEndpoint().query(this.lindasQuery(bfsNumber))
        //         .then(result => this.serviceProvider().lindasObject({
        //             uri: result.binding.uri,
        //             geo: this,
        //             dbpedia: this.cache.dbpedia
        //         })));
        // }
        // return this.cache.lindas;
    }

    dbpedia() {
        //return this.lindas().then(lindas => lindas.dbpedia());
        throw Error('Should be implemented');
    }


    propertiesTitle() {
        return 'Geo';
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
            this.cache.cantons = this.endpoint.queryChildren({
                children: 'http://www.geonames.org/ontology#A.ADM1',
                parent: 'http://www.geonames.org/ontology#parentCountry',
                object: this
            });
        }
        return this.cache.cantons;
    }

    /**
     * Helper method of gtInspectorDistrictsIn()
     */
    districts() {
        if (_.isUndefined(this.cache.districts)) {
            this.cache.districts = this.endpoint.queryChildren({
                children: 'http://www.geonames.org/ontology#A.ADM2',
                parent: 'http://www.geonames.org/ontology#parentADM1',
                object: this
            });
        }
        return this.cache.districts;
    }

    /**
     * Helper method of gtInspectorMunicipalitiesIn()
     */
    municipalities() {
        if (_.isUndefined(this.cache.municipalities)) {
            this.cache.municipalities = this.endpoint.queryChildren({
                children: 'http://www.geonames.org/ontology#A.ADM3',
                parent: 'http://www.geonames.org/ontology#parentADM2',
                object: this
            });
        }
        return this.cache.municipalities;
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

    gtInspectorLindasIn(composite) {
        composite.dynamic(() => this.lindas());
    }

    gtInspectorVersionsIn(composite) {
        composite.table(table => {
            table.title(() => 'Geo Versions');
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
            table.title(() => 'Cantons');
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
            table.title(() => 'Districts');
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
            table.title(() => 'Municipalities');
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

    gtInspectorWebMapIn(composite) {
        composite.iframe(iframe => {
            iframe.title(entity => 'Map');
            iframe.when(entity => entity.hasProperty('hasMap'));
            iframe.display(entity => entity.propertyValueAt('hasMap'))
        })
    }

    gtInspectorMapIn(composite) {
        composite
            .with(composite => {
                composite.title(entity => 'Map');
                composite.when(entity => {
                    return entity.hasProperty('geosparql#hasGeometry')
                });
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
}

export default LGeoObject;