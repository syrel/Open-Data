/**
 * Created by syrel on 29.05.17.
 */

import LLindasEndpoint from './LLindasEndpoint';
import LObject from './../LObject';
import Thenable from './../../Thenable';
import _ from 'underscore';
import template from '../../template'

// ${0} bfs number
const GEO_CANTON_QUERY = template`
SELECT DISTINCT ?Object WHERE {
    ?Object a <http://www.geonames.org/ontology#A.ADM1>.
    ?Object <https://ld.geo.admin.ch/def/bfsNumber> ${0}
} LIMIT 1`;

// ${0} bfs number
const GEO_DISTRICT_QUERY = template`
SELECT DISTINCT ?Object WHERE {
    ?Object a <http://www.geonames.org/ontology#A.ADM2>.
    ?Object <https://ld.geo.admin.ch/def/bfsNumber> ${0}
} LIMIT 1`;

// ${0} bfs number
const GEO_MUNICIPALITY_QUERY = template`
SELECT DISTINCT ?Object WHERE {
    ?Object a <http://www.geonames.org/ontology#A.ADM3>.
    ?Object <https://ld.geo.admin.ch/def/bfsNumber> ${0}
} LIMIT 1`;


class LLindasObject extends LObject {
    constructor(props) {
        super(Object.assign(props, {
            endpoint: LLindasEndpoint.uniqueInstance()
        }));
        this.cache.dbpedia = Thenable.of(props.dbpedia);
        this.cache.geo = Thenable.of(props.geo);

        this.extensions = [
            {
                method: this.gtInspectorGeoIn.bind(this),
                order: 31,
                dynamic: false
            },
            {
                method: this.gtInspectorPropertiesIn.bind(this),
                order: 31,
                dynamic: true
            },
            {
                method: this.gtInspectorDBpediaIn.bind(this),
                order: 31,
                dynamic: false
            },
        ]
    }

    isDistrict() {
        return this.hasPropertyContaining('22-rdf-syntax-ns#type', 'District')
    }

    isMunicipality() {
        return this.hasPropertyContaining('22-rdf-syntax-ns#type', 'Municipality')
    }

    isCanton() {
        return this.hasPropertyContaining('22-rdf-syntax-ns#type', 'Canton')
    }

    geo() {
        if (_.isUndefined(this.cache.geo)) {
            var geoQuery = (predicate, id, query, constructor) => (next) => {
                return () => predicate(this).then(isPredicate => {
                    if (isPredicate) {
                        return this
                            .propertyValueAt(id)
                            .then(bfsNumber => this.serviceProvider().geoEndpoint().query(query(bfsNumber)))
                            .then(result => constructor(this, {
                                uri: result.binding.uri,
                                lindas: this,
                                dbpedia: this.cache.dbpedia
                            }))
                    }
                    else if (!_.isUndefined(next)) {
                        return next()
                    }
                })
            };

            var cantonQuery = geoQuery(
                entity => entity.isCanton(),
                'cantonId',
                GEO_CANTON_QUERY,
                (entity, props) => this.serviceProvider().geoCanton(props)
            );

            var districtQuery = geoQuery(
                entity => entity.isDistrict(),
                'districtId',
                GEO_DISTRICT_QUERY,
                (entity, props) => this.serviceProvider().geoDistrict(props)
            );

            var municipalityQuery = geoQuery(
                entity => entity.isMunicipality(),
                'municipalityId',
                GEO_MUNICIPALITY_QUERY,
                (entity, props) => this.serviceProvider().geoMunicipality(props)
            );

            var query = municipalityQuery(districtQuery(cantonQuery()));

            this.cache.geo = query();
        }
        return this.cache.geo;
    }

    lindas() {
        return Thenable.resolve(this);
    }

    dbpedia() {
        if (_.isUndefined(this.cache.dbpedia)) {
            this.cache.dbpedia = this
                .propertyContaining('owl#sameAs', 'dbpedia.org')
                .then(property => this.serviceProvider().dbpediaObject({
                    uri: property.getContent(),
                    lindas: this,
                    geo: this.cache.geo
                }))
        }
        return this.cache.dbpedia;
    }

    propertiesTitle() {
        return 'Lindas Properties';
    }

    gtInspectorGeoIn(composite) {
        composite.dynamic(() => this.geo());
    }

    gtInspectorDBpediaIn(composite) {
        composite.dynamic(() => this.dbpedia());
    }
}

export default LLindasObject;