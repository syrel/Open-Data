/**
 * Created by syrel on 29.05.17.
 */

import LObject from './LObject';

import LGeoEndpoint from './geo/LGeoEndpoint';
import LGeoObject from './geo/LGeoObject';

import LDBpediaObject from './dbpedia/LDBpediaObject';
import LLindasObject from './lindas/LLindasObject';
import LLindasEndpoint from './lindas/LLindasEndpoint';

class LServiceProvider {

    static defaultObject(props) {
        return new LObject(props);
    }

    static geoObject(props) {
        return new LGeoObject(props);
    }

    static geoEndpoint() {
        return LGeoEndpoint.uniqueInstance();
    }

    static dbpediaObject(props) {
        return new LDBpediaObject(props);
    }

    static lindasObject(props) {
        return new LLindasObject(props);
    }

    static lindasEndpoint() {
        return LLindasEndpoint.uniqueInstance();
    }
}

export default LServiceProvider;