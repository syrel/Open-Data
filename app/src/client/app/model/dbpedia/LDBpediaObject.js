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

        this.extensions = [
            {
                method: this.gtInspectorGeoIn.bind(this),
                order: 31,
                dynamic: false
            },
            {
                method: this.gtInspectorLindasIn.bind(this),
                order: 31,
                dynamic: false
            },
            {
                method: this.gtInspectorPropertiesIn.bind(this),
                order: 32,
                dynamic: true
            }
        ]
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
        return this.propertyValuesAt('neighboringMunicipality').then(municipalities => {
            return municipalities.map(municipality => this.serviceProvider().dbpediaObject({
                uri: municipality
            }));
        });
    }

    propertiesTitle() {
        return 'DBpedia Properties';
    }

    gtInspectorGeoIn(composite) {
        console.log('gtInspectorGeoIn');
        composite.dynamic(() => this.geo());
    }

    gtInspectorLindasIn(composite) {
        console.log('gtInspectorLindasIn');
        composite.dynamic(() => this.lindas());
    }


}

export default LDBpediaObject;