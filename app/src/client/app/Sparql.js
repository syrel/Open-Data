/**
 * Created by syrel on 15.05.17.
 */

import $ from 'jquery';
import xml2json from 'jquery-xml2json'
import _ from 'underscore'

class Sparql {
    static query (endpoint, query) {
        console.log(endpoint,query);
        return new Promise((resolve, reject) => {
            $.post(endpoint, { query: query }).done(function(data) {
                try {
                    // extract headers out of xml
                    var json = xml2json(data);
                    var result = json['#document'].sparql.results.result;
                    if (_.isUndefined(result)) {
                        result = [];
                    }
                    resolve(result);
                } catch (e) {
                    //reject(Error("Failed to parse response"));
                }
            }).fail(function(error) {
                //reject(error);
            });
        });
    };
}

export default Sparql;