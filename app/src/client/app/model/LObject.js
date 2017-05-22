/**
 * Created by syrel on 15.05.17.
 */

import Sparql from '../Sparql'
import template from '../template'
import LBinding from './LBinding'
import LValue from './LValue'
import Thenable from './../Thenable'
import { parse } from 'wellknown'

const ALL_PROPERTIES_QUERY = template`SELECT ?property ?value
{ 
  <${0}> ?property ?value
}`;

class LObject {
    constructor(endpoint, uri) {
        this.endpoint = endpoint;
        this.uri = uri;
        this.cache = {
            properties: null
        };

        this.extensions = [
            {
                method: this.gtInspectorPropertiesIn.bind(this),
                order: 10
            },
            {
                method: this.gtInspectorGeometryIn.bind(this),
                order: 20
            },
            {
                method: this.gtInspectorPolygonIn.bind(this),
                order: 30
            }
        ]
    }

    toString() {
        return this.uri;
    }

    /**
     * Return all properties of this object
     * @returns {Thenable}
     */
    properties() {
        if (this.cache.properties !== null) {
            return Thenable.resolve(this.cache.properties);
        }
        return new Thenable(new Promise((resolve, reject) => {
            Sparql.query(this.endpoint.getUri(), ALL_PROPERTIES_QUERY(this.uri))
                .then(result => {
                        var properties = result.root.children[1].children.map(each => {
                            var property = each.children[0].children[0];
                            var value = each.children[1].children[0];
                            return new LBinding({
                                endpoint: this.endpoint,
                                property: { content: property.content, name: property.name },
                                value: LValue.from(this.endpoint, value.content, value.name)});
                        });
                        this.cache.properties = properties;
                        resolve(properties);
                    },
                    error => reject(error));
        }));
    }

    /**
     * Return property binding with the given name
     * @returns {Thenable}
     */
    propertyAt(aName) {
        return Thenable.of((resolve, reject) => {
            this.properties().then(properties => {
                let found = properties.filter(property => this.extractName(property.getProperty().content) == aName);
                if (found.length > 0) {
                    resolve(found[0]);
                }
                else reject(Error('Property #' + aName + ' not found'));
            },
            error => { reject(error) })
        });
    }

    /**
     * Return true if there a property with a given name
     * @param aName
     * @returns {Thenable}
     */
    hasProperty(aName) {
        return this
            .properties()
            .then(properties => properties
                .filter(binding => this.extractName(binding.getProperty().content) == aName)
                .length > 0)
    }



    extractName(content) {
        return content.substr(content.lastIndexOf('/') + 1)
    }

    gtInspectorPropertiesIn(composite) {
        composite.table(table => {
            table.title(() => "Properties");
            table.withHeader();
            table.display(entity => entity.properties());
            table.strongTransmit(binding => binding.getValue());
            table.column(column => {column
                    .named(() => 'Property')
                    .evaluated(each => each.getProperty().content)
            });
            table.column(column => {column
                    .named(() => 'Value')
                    .evaluated(each => each.getValue().content + " (" + each.getValue().type + ")")
            });
        });
    }

    gtInspectorPolygonIn(composite) {
        composite.text(text => {
            text.title(entity => 'Polygon');
            text.when(entity => entity.hasProperty('geosparql#hasGeometry'));
            text.display(entity => entity
                .propertyAt('geosparql#hasGeometry')
                .then(property => property.propertyAt('geosparql#asWKT'))
                .then(property => JSON.stringify(parse(property.getValue().content), null, 2)));
        });
    }

    gtInspectorGeometryIn(composite) {
        composite.map(map => {
            map.title(entity => 'Map');
            map.when(entity => entity.hasProperty('geosparql#hasGeometry'));
            map.display(entity => entity
                .propertyAt('geosparql#hasGeometry')
                .then(property => property.propertyAt('geosparql#asWKT'))
                .then(property => parse(property.getValue().content)));
        });

    }
}

export default LObject;