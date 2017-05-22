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

    countries() {
        if (_.isUndefined(this.cache.countries)) {
            this.cache.countries = Thenable.of((resolve, reject) => {
                Sparql.query(this.getUri(), COUNTRIES_QUERY())
                    .then(result => {
                        var countries = result.map(each => {
                            var country = each.binding[0];
                            var name = each.binding[1];
                            return new LGeoCountry(this, country.uri, name.literal);
                        });
                        resolve(countries);
                    }, error => reject(error));
            });
        }
        return this.cache.countries;
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
}

export default LGeoEndpoint;