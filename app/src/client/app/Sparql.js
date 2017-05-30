/**
 * Created by syrel on 15.05.17.
 */

import $ from 'jquery';
import 'jquery-xml2json'
import _ from 'underscore'
import Thenable from './Thenable'

class Sparql {
    static query(endpoint, query, defaultResult) {
        return Thenable.of((resolve, reject) => {
            $.post(endpoint, { query: query, output: 'xml' }).done(function(data) {
                var result;
                try {
                    // extract headers out of xml
                    var json = $.xml2json(data);
                    result = json['#document'].sparql.results.result;
                } catch (e) {
                    console.error(e);
                    return reject(Error('Failed to parse response!'));
                }

                if (!_.isUndefined(result)) {
                    try {
                        resolve(result);
                    }
                    catch(e) {
                        console.error(e);
                        return reject(Error('Failed to resolve response!'));
                    }
                }
                else {
                    if (_.isUndefined(defaultResult)) {
                        try {
                            resolve([]);
                        }
                        catch(e) {
                            console.error(e);
                            return reject(Error('Failed to resolve response with empty array [] as guessed result value!'));
                        }
                    }
                    else {
                        try {
                            resolve(defaultResult);
                        }
                        catch(e) {
                            console.error(e);
                            return reject(Error('Failed to resolve response with default result value!', defaultResult));
                        }
                    }
                }
            }).fail(function(error) {
                console.error(error);
                reject(error);
            });
        });
    };
}

export default Sparql;