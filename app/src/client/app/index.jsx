/**
 * Created by syrel on 11.05.17.
 */

import '!style-loader!css-loader!bootstrap/dist/css/bootstrap.css';

import '!style-loader!css-loader!bootstrap-material-design/dist/css/bootstrap-material-design.css';
import '!style-loader!css-loader!bootstrap-material-design/dist/css/ripples.css';
import 'bootstrap-material-design';

import '!style-loader!css-loader!material-design-lite/material.css';
import 'material-design-lite'

import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';

import React from 'react';
import Rx from 'rxjs';

import ReactDOM from 'react-dom';
import {render} from 'react-dom';

import { FormGroup } from 'react-bootstrap';
import { InputGroup } from 'react-bootstrap';
import { FormControl } from 'react-bootstrap';

import Inspector from './framework/Inspector';
import LEndpoint from './model/LEndpoint';
import LGeoEndpoint from './model/geo/LGeoEndpoint';
import LObject from './model/LObject';
import MapPresentation from './framework/MapPresentation'
import TextPresentation from './framework/TextPresentation'
import Thenable from './Thenable';

import { parse as wkt } from 'wellknown'

import './extensions';
import template from './template';

var geometry = (object, childrenBlock) => {
    var children = Thenable.of((resolved, rejected) => childrenBlock(object).then(units => {
        var geometries = units.map(unit => unit
            .propertyAt('geosparql#hasGeometry')
            .then(property => property.propertyAt('geosparql#asWKT'))
            .then(property => { return {
                unit: unit,
                geometry: wkt(property.getContent())
            }}));

        var geo = {
            type: "FeatureCollection",
            features: []
        };

        var error = false;
        Rx.Observable.from(geometries).concatMap(each => each)
            .subscribe(
                each => geo.features.push({
                    type: "Feature",
                    geometry: each.geometry,
                    properties: { unit: each.unit }
                }),
                err => {
                    error = true;
                    console.error(err);
                },
                () => {
                    if (!error) {
                        resolved(geo);
                    }
                });
    }));

    var unitGeometry = object
        .propertyAt('geosparql#hasGeometry')
        .then(property => property.propertyAt('geosparql#asWKT'))
        .then(property => wkt(property.getContent()));

    return Thenable.of(resolved => {
        var results = [];
        var error = false;
        Rx.Observable.from([unitGeometry, children]).concatMap(each => each)
            .subscribe(
                each => results.push(each),
                err => {
                    error = true;
                    console.error(err);
                },
                () => {
                    if (!error) {
                        resolved({
                            unit: results[0],
                            children: results[1]
                        });
                    }
                })});
};

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            endpoint: new LGeoEndpoint()
            //endpoint: new LEndpoint('http://lindas-data.ch/sparql')
            //endpoint: new LEndpoint('http://dbpedia.org/sparql')

            //endpoint: new LEndpoint('https://query.wikidata.org/bigdata/namespace/wdq/sparql')
            //endpoint: new LEndpoint('http://data.alod.ch/query')
        };

        var endpoint = new LGeoEndpoint();
        var country = new LObject(endpoint, 'https://ld.geo.admin.ch/boundaries/country/CH:2017');
        var canton = new LObject(endpoint, 'https://ld.geo.admin.ch/boundaries/canton/2:2017', 'Bern');


        // var num = 1000;
        //
        //
        // var display = Thenable.delay(2500, () => num++)
        //     .then(delay => 'My value: ' + delay + ' >')
        //     .then(delay => delay + '>')
        //     .then(delay => delay + '>')
        //     .then(delay => delay + ' >')
        //     .then(delay => delay + '>')
        //     .then(delay => delay + '>')
        //     .then(delay => delay + ' >')
        //     .then(delay => delay + '>')
        //     .then(delay => delay + '>');
        //
        //
        // console.log(display.get());
        // console.log(display.get());
        // console.log(display.get());
        // console.log(display.get());
        //
        // display.then(result => console.log(result));
        //
        // display.onCompleted(() => {
        //     console.log('Done!');
        //
        //     console.log(display.get());
        //     console.log(display.get());
        //     console.log(display.get());
        //     console.log(display.get());
        // });

        // var format = Thenable.delay(1000)
        //     .then((formatDelay) => display.then(displayDelay => '('+displayDelay+'+'+formatDelay+')ms'));

        // this.text = new TextPresentation();
        // this.text.display(entity => Thenable.of((resolved) => {
        //     //alksufhlasufl
        //     var data = [];
        //     resolved(data);
        // }), []);
        // this.text.format(delay => template`(${0} + ${1})ms`(delay, 3000));
        // this.text.on(5000);

        // console.log('Before');
        //
        // var promise = Promise.resolve(10);
        // promise.then(result => {
        //     console.log('Result:', result);
        // });
        //
        // console.log('After');


        // this.map = new MapPresentation();
        // this.map.display(entity => geometry(country, country => country.cantons()));
        // this.map.layer(layer => { layer
        //     .evaluated(entity => entity.children)
        //     .display(geo => geo.features);
        // });
        // this.map.on(canton);

        this.inspector = new Inspector();
        this.inspector.openOn(this.state.endpoint);
    }

    handleChange() {
        const endpoint = new LEndpoint(ReactDOM.findDOMNode(this.refs.endpoint).value);
        this.setState({
            endpoint: endpoint
        });
        // this.inspector = new Inspector();
        // this.inspector.openOn(endpoint);
    }

    render () {
        return (
            <div className="mdl-layout mdl-js-layout mdl-layout--fixed-header">
                <header className="mdl-layout__header mdl-layout__header--scroll mdl-color--primary">
                    <div className="mdl-layout--large-screen-only mdl-layout__header-row"></div>
                    <div className="mdl-layout--large-screen-only mdl-layout__header-row">
                        <h3>Linked data</h3>
                    </div>
                    <div className="mdl-layout--large-screen-only mdl-layout__header-row"></div>
                </header>
                <main className="mdl-layout__content">
                    {/*{ this.map.render() }*/}
                    { this.inspector.render() }
                    {/*{ this.text.render() }*/}
                </main>
            </div>
        )
    }
}

render(<App/>, document.getElementById('app'));
$.material.init();