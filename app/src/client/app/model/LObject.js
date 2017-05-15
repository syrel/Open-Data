/**
 * Created by syrel on 15.05.17.
 */

import Sparql from '../Sparql'
import template from '../template'
import LBinding from './LBinding'

const ALL_PROPERTIES_QUERY = template`SELECT ?property ?value
{ 
  <${0}> ?property ?value
}`;

class LObject {
    constructor(endpoint, uri) {
        this.endpoint = endpoint;
        this.uri = uri;
        this.properties = null;

        this.extensions = [
            {
                method: this.gtInspectorPropertiesIn,
                order: 10
            }
        ]
    }

    toString() {
        return this.uri;
    }

    /**
     * Return all properties of this object
     * @returns {Promise}
     */
    allProperties() {
        if (this.properties !== null) {
            return Promise.resolve(this.properties);
        }
        return new Promise((resolve, reject) => {
            Sparql.query(this.endpoint.getUri(), ALL_PROPERTIES_QUERY(this.uri))
                .then(result => {
                        var properties = result.root.children[1].children.map(each => {
                            var property = each.children[0].children[0];
                            var value = each.children[1].children[0];
                            return new LBinding({
                                endpoint: this.endpoint,
                                property: { content: property.content, name: property.name },
                                value: { content: value.content, name: value.name }});
                        });
                        this.properties = properties;
                        resolve(properties);
                    },
                    error => reject(error))
        })
    }

    gtInspectorPropertiesIn(composite) {
        composite.table(table => {
            table.title(() => "Properties");
            table.withHeader();
            table.display((entity) => entity.allProperties());
            table.column(column => {column
                    .named(() => 'Property')
                    .evaluated(each => {
                        var content = each.getProperty().content;
                        return content.substr(content.lastIndexOf('/') + 1);
                    })
            });
            table.column(column => {column
                    .named(() => 'Value')
                    .evaluated(each => each.getValue().content + " (" + each.getValue().name + ")")
            });
        });
    }
}

export default LObject;