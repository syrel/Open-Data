/**
 * Created by syrel on 11.05.17.
 */

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
import Thenable from './Thenable';

import { parse as wkt } from 'wellknown'

import './extensions';

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

        // var delay = Thenable.delay(3000);
        // var delay1 = delay.then(delta => {
        //     console.log('delay:', delta);
        //     return Thenable.delay(delta / 2);
        // });
        //
        // delay1.then().then(result => {
        //     console.log('then():', result);
        // });
        //
        // var delay2 = delay1.then(delta => {
        //     console.log('delay:', delta);
        // });

        this.inspector = new Inspector();
        this.inspector.openOn(this.state.endpoint);

        // var endpoint = new LGeoEndpoint();
        // var canton = new LObject(endpoint, 'https://ld.geo.admin.ch/boundaries/canton/2:2017', 'Bern');
        //
        // var geometry = Thenable.of((resolved, rejected) => canton.districts().then(districts => {
        //     var geometries = districts.map(district => district
        //         .propertyAt('geosparql#hasGeometry')
        //         .then(property => property.propertyAt('geosparql#asWKT'))
        //         .then(property => property.getName()));
        //
        //     var results = [];
        //     var error = false;
        //
        //     Rx.Observable
        //         .from(geometries)
        //         .concatMap(x => x)
        //         .subscribe(
        //             x => results.push(x),
        //             err => {
        //                 error = true;
        //                 console.error(err);
        //             },
        //             () => {
        //                 if (!error) {
        //                     resolved(results);
        //                 }
        //             });
        // }));

        // var geometries = canton.districts().then(districts =>
        //     districts.map(district => district
        //         .propertyAt('geosparql#hasGeometry')
        //         .then(property => property.propertyAt('geosparql#asWKT'))
        //         .then(property => property.getName()))
        // );

        // geometry.then(result => {
        //     console.log(result);
        // });
        //
        //
        // this.map = new MapPresentation();
        // this.map.display(entity => entity
        //     .propertyAt('geosparql#hasGeometry')
        //     .then(property => property.propertyAt('geosparql#asWKT'))
        //     .then(property => wkt(property.getContent())));
        // this.map.layer(layer => {
        //     layer.evaluated(entity => entity);
        // });
        // this.map.on(canton);
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
            <div>
                <form>
                    <FormGroup>
                        <InputGroup>
                            <InputGroup.Addon>Endpoint:</InputGroup.Addon>
                            <FormControl type="text" ref='endpoint' value={this.state.endpoint.getUri()} onChange={this.handleChange.bind(this)}/>
                        </InputGroup>
                    </FormGroup>
                </form>
                {/*{ this.map.render() }*/}
                { this.inspector.render() }
            </div>
        )
    }
}

render(<App/>, document.getElementById('app'));