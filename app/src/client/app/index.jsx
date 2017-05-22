/**
 * Created by syrel on 11.05.17.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {render} from 'react-dom';

import { FormGroup } from 'react-bootstrap';
import { InputGroup } from 'react-bootstrap';
import { FormControl } from 'react-bootstrap';

import Inspector from './framework/Inspector';
import LEndpoint from './model/LEndpoint';
import LGeoEndpoint from './model/geo/LGeoEndpoint';
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

        this.inspector = new Inspector();
        this.inspector.openOn(this.state.endpoint);
    }

    handleChange() {
        const endpoint = new LEndpoint(ReactDOM.findDOMNode(this.refs.endpoint).value);
        this.setState({
            endpoint: endpoint
        });
        this.inspector = new Inspector();
        this.inspector.openOn(endpoint);
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
                { this.inspector.render() }
            </div>
        )
    }
}

render(<App/>, document.getElementById('app'));