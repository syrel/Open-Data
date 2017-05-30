/**
 * Created by syrel on 29.05.17.
 */

import LGeoEndpoint from './LGeoEndpoint';
import LObject from './../LObject';
import Thenable from './../../Thenable';
import template from '../../template'
import _ from 'underscore';

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

        this.extensions = [
            // {
            //     method: this.gtInspectorLindasIn.bind(this),
            //     order: 31,
            //     dynamic: false
            // },
            {
                method: this.gtInspectorPropertiesIn.bind(this),
                order: 32,
                dynamic: true
            },
            {
                method: this.gtInspectorVersionsIn.bind(this),
                order: 22,
                dynamic: true
            }
        ]
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
        return 'Geo Properties';
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
}

export default LGeoObject;