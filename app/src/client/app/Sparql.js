/**
 * Created by syrel on 15.05.17.
 */

import XMLParser from 'xml-parser';

class Sparql {
    static query (endpoint, query) {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('GET', endpoint+'?query='+encodeURIComponent(query), true);
            req.onload = () => {
                if (req.status === 200) {
                    try {
                        // extract headers out of xml
                        var xml = XMLParser(req.response);
                        resolve(xml);
                    } catch (e) {
                        reject(Error("Failed to parse response"));
                    }
                } else {
                    reject(Error(req.statusText));
                }
            };
            req.onerror = () => {
                reject(Error("Network Error"));
            };
            req.send();
        });
    };
}

export default Sparql;