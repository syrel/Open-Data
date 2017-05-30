/**
 * Created by syrel on 15.05.17.
 */

import $ from 'jquery';
import 'jquery-xml2json'
import _ from 'underscore'
import Thenable from './Thenable'

class Sparql {
    static query(endpoint, query) {
        return Thenable.of((resolve, reject) => {
            $.post(endpoint, { query: query }).done(function(data) {
                try {
                    // extract headers out of xml
                    var json = $.xml2json(data);
                    var result = json['#document'].sparql.results.result;
                    //console.log(query, result);
                    if (!_.isUndefined(result)) {
                        resolve(result);
                    }
                } catch (e) {
                    console.error(e);
                    //reject(Error("Failed to parse response"));
                }
            }).fail(function(error) {
                //reject(error);
            });
        });
    };
}

export default Sparql;