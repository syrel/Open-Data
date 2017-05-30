/**
 * Created by syrel on 29.05.17.
 */

import LObject from './../LObject';
import LDBpediaEndpoint from './LDBpediaEndpoint';
import Thenable from './../../Thenable';
import _ from 'underscore';
import template from '../../template'

// ${0} dbpedia uri
const LINDAS_OBJECT_QUERY = template`
SELECT DISTINCT ?Object WHERE {
   ?Object <http://www.w3.org/2002/07/owl#sameAs> <${0}>.
} LIMIT 1`;

class LDBpediaObject extends LObject {
    constructor(props) {
        super(Object.assign(props, {
            endpoint: LDBpediaEndpoint.uniqueInstance()
        }));
        this.cache.lindas = Thenable.of(props.lindas);
        this.cache.geo = Thenable.of(props.geo);

        this.extensions.push(
            {
                method: this.gtInspectorNeighboringMunicipalitiesIn.bind(this),
                order: 15,
                dynamic: true
            },
            {
                method: this.gtInspectorGeoIn.bind(this),
                order: 31,
                dynamic: false
            },
            {
                method: this.gtInspectorLindasIn.bind(this),
                order: 31,
                dynamic: false
            });
    }

    geo() {
        return this.lindas().then(lindas => lindas.geo());
    }

    lindas() {
        if (_.isUndefined(this.cache.lindas)) {
            this.cache.lindas = this.serviceProvider().lindasEndpoint().query(LINDAS_OBJECT_QUERY(encodeURI(this.uri)))
                .then(result => this.serviceProvider().lindasObject({
                    uri: result.binding.uri,
                    dbpedia: this,
                    geo: this.cache.geo
                }));
        }
        return this.cache.lindas;
    }

    dbpedia() {
        return Thenable.resolve(this);
    }

    neighbors() {
        if (_.isUndefined(this.cache.neighbors)) {
            this.cache.neighbors = this.propertyValuesAt('neighboringMunicipality').then(municipalities => {
                return municipalities.map(municipality => this.serviceProvider().dbpediaObject({
                    uri: municipality
                }));
            });
        }
        return this.cache.neighbors;
    }

    propertiesTitle() {
        return 'DBpedia';
    }

    gtInspectorGeoIn(composite) {
        composite.dynamic(() => this.geo());
    }

    gtInspectorLindasIn(composite) {
        composite.dynamic(() => this.lindas());
    }

    gtInspectorNeighboringMunicipalitiesIn(composite) {
        composite.table(table => {
            table.title(() => 'Neighbors');
            table.when(entity => entity.hasProperty('neighboringMunicipality'));
            table.display(entity => {
                return entity.neighbors()
                    .then(neighbors => Thenable.multiple(neighbors.map(neighbour => {
                        return Thenable.multiple({
                            neighbour: neighbour,
                            name: neighbour.propertyValueAt('name')
                        })
                    })))
            });
            table.strongTransmit(entity => entity.neighbour);
            table.column(column => column
                .evaluated(each => each.name)
            );
        });
    }


}

export default LDBpediaObject;