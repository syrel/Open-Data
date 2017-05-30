/**
 * Created by syrel on 23.05.17.
 */

import Sparql from './../../Sparql'
import template from './../../template'
import LEndpoint from './../LEndpoint'
import LGeoCountry from './LGeoCountry'
import Thenable from './../../Thenable'
import _ from 'underscore'

const COUNTRIES_QUERY = template`SELECT ?AdminUnit ?Name
WHERE {
  ?AdminUnit a <http://schema.org/Country>.
  ?AdminUnit <http://schema.org/name> ?Name.
}
ORDER BY ASC(?Name)`;


// ${0} type of children
// ${1} type of parent
// ${2} parent object
// Example:
// SELECT ?AdminUnit
//     WHERE {
//     ?AdminUnit a <http://www.geonames.org/ontology#A.ADM1>.
//     ?AdminUnit <http://www.geonames.org/ontology#parentCountry> ?InParent.
//     FILTER (?InParent = <https://ld.geo.admin.ch/boundaries/country/CH:2017>)
// }
const CHILDREN_QUERY = template`SELECT ?AdminUnit ?Name
WHERE {
  ?AdminUnit a <${0}>.
  ?AdminUnit <${1}> ?InParent.
  ?AdminUnit <http://schema.org/name> ?Name.
  FILTER (?InParent = <${2}>)
}
ORDER BY ASC(?Name)`;

var uniqueInstance;

class LGeoEndpoint extends LEndpoint {
    constructor() {
        super('https://ld.geo.admin.ch/query');

        this.extensions.push(
            {
                method: this.gtInspectorCountriesIn.bind(this),
                order: 5
            }
        );
    }

    static uniqueInstance() {
        if (_.isUndefined(uniqueInstance)) {
            uniqueInstance = new LGeoEndpoint();
        }
        return uniqueInstance;
    }

    countries() {
        if (_.isUndefined(this.cache.countries)) {
            this.cache.countries = Thenable.of((resolve, reject) => {
                Sparql.query(this.getUri(), COUNTRIES_QUERY())
                    .then(result => {
                        var countries = result.map(each => {
                            var country = each.binding[0];
                            var name = each.binding[1];
                            return this.serviceProvider().geoCountry({
                                uri: country.uri,
                                name: name.literal
                            });
                        });
                        resolve(countries);
                    }, error => reject(error));
            });
        }
        return this.cache.countries;
    }

    queryChildren(params) {
        return Sparql.query(this.getUri(), CHILDREN_QUERY(
                params.children,
                params.parent,
                params.object.uri))
            .then(result => result.map(each => {
                var child = each.binding[0];
                var name = each.binding[1];
                return this.object({
                    uri: child.uri,
                    name: name.literal
                });
            }));
    }

    gtInspectorCountriesIn(composite) {
        composite.table(table => {
            table.title(() => "Countries");
            table.display(entity => entity.countries());
            table.column(column => {
                column.display(each => each.toString())
            })
        });
    }

    object(props) {
        return this.serviceProvider().geoObject(props);
    }
}

export default LGeoEndpoint;