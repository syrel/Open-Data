/**
 * Created by syrel on 29.05.17.
 */


import LEndpoint from './../LEndpoint'
import _ from 'underscore'

var uniqueInstance;

class LLindasEndpoint extends LEndpoint {
    constructor() {
        super('http://lindas-data.ch/sparql');
    }

    static uniqueInstance() {
        if (_.isUndefined(uniqueInstance)) {
            uniqueInstance = new LLindasEndpoint();
        }
        return uniqueInstance;
    }

    object(props) {
        return this.serviceProvider().lindasObject(props);
    }
}

export default LLindasEndpoint;