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

import YASQE from 'yasgui-yasqe';
import Sparql from './Sparql';

import LEndpoint from './model/LEndpoint';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            yasqe: null,
            endpoint: 'https://ld.geo.admin.ch/query',
        };

        // this.results = new TablePresentation()
        //     .header(xml => xml.root.children[0].children.map(each => each.attributes.name))
        //     .dynamic((header, column) => {
        //         column
        //             .named(() => header)
        //             .evaluated(result => result[column.index()].content + ' ('+(result[column.index()].name) + ')')
        //     })
        //     .display(xml => xml.root.children[1].children)
        //     .transformed(result => result.children.map(each => { return {
        //         datatype: each.children[0].attributes.datatype,
        //         name: each.children[0].name,
        //         content:  each.children[0].content
        //     }}));

        //var endpoint = new LEndpoint('http://lindas-data.ch/sparql');
        var endpoint = new LEndpoint('https://ld.geo.admin.ch/query');
        this.inspector = new Inspector();
        this.inspector.openOn(endpoint);
    }

    onClick (callback) {
        callback();

        // const source = Sparql.query(ReactDOM.findDOMNode(this.refs.endpoint).value, this.state.yasqe.getValue());
        // source.then(result => this.results.on(result), (err) => {
        //     console.error(err);
        //     callback()
        // });
    }

    componentDidMount() {
       // this.state.yasqe = YASQE.fromTextArea(document.getElementById('query'));
    }

    componentDidUpdate() {
        //this.state.yasqe = YASQE.fromTextArea(document.getElementById('query'));
    }

    handleChange() {
        this.state.endpoint = ReactDOM.findDOMNode(this.refs.endpoint).value;
    }

    render () {
        return (
            <div>
                <form>
                    <FormGroup>
                        <InputGroup>
                            <InputGroup.Addon>Endpoint:</InputGroup.Addon>
                            <FormControl type="text" ref='endpoint' value={this.state.endpoint} onChange={this.handleChange}/>
                        </InputGroup>
                    </FormGroup>
                </form>
                {/*<textarea id="query">{`select distinct ?solutionName ?providerName ?providerUID ?hasSolutionProvider*/}
{/*where {*/}
	{/*?s a <http://lindas-data.ch/def/top/SoftwareSolution> ; <http://lindas-data.ch/def/top/hasSolutionProvider> ?sp .*/}
	{/*?sp <http://lindas-data.ch/def/top/uid> ?providerUID .*/}
	{/*?s <http://www.w3.org/2004/02/skos/core#prefLabel> ?solutionName.*/}
	{/*?sp <http://www.w3.org/2004/02/skos/core#prefLabel> ?providerName.*/}
{/*}*/}
{/*order by ?sp*/}
{/*`}</textarea>*/}

                {/*{ this.results.render() }*/}
                { this.inspector.render() }

            </div>
        )
    }
}

render(<App/>, document.getElementById('app'));