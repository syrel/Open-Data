/**
 * Created by syrel on 29.05.17.
 */

import LEndpoint from './../LEndpoint'
import _ from 'underscore'

var uniqueInstance;

class LDBpediaEndpoint extends LEndpoint {
    constructor() {
        super('http://dbpedia.org/sparql');
    }

    static uniqueInstance() {
        if (_.isUndefined(uniqueInstance)) {
            uniqueInstance = new LDBpediaEndpoint();
        }
        return uniqueInstance;
    }

    object(props) {
        return this.serviceProvider().dbpediaObject(props);
    }
}

export default LDBpediaEndpoint;