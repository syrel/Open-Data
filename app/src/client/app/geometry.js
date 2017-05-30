/**
 * Created by syrel on 29.05.17.
 */

import Thenable from './Thenable';
import { parse as wkt } from 'wellknown';
import * as simplifyTurf from 'turf-simplify';

/**
 * @param geometryName, 'geosparql#hasGeometry'
 * @param wktName, 'geosparql#asWKT'
 * @param linkedBlock, optional
 * @returns {function(*=, *)}
 */
function geometry(geometryName, wktName, linkedBlock) {
    return (unit, childrenBlock) => {
        return Thenable.multiple({
            unit: unit
                .propertyAt(geometryName)
                .then(property => property.propertyAt(wktName))
                .then(property => Thenable.multiple(Object.assign(simplifyTurf.default(wkt(property.getContent()), 0.002), {
                    properties: Thenable.multiple({
                        unit: unit,
                        data: linkedBlock(unit)
                    })
                }))),
            children: Thenable.of(childrenBlock(unit)).then(children => {
                "use strict";
                return Thenable.multiple({
                    type: 'FeatureCollection',
                    features: Thenable.multiple(children.map(child => {
                        return Thenable.multiple({
                            type: 'Feature',
                            geometry: child.propertyAt(geometryName).then(property => property.propertyValueAt(wktName)).then(geometry => wkt(geometry)),
                            properties: Thenable.multiple({
                                unit: child,
                                data: linkedBlock(child)
                            })
                        }).then(feature => simplifyTurf.default(feature, 0.001));
                    }))
                });
            })
        });
    }
}

export default geometry;