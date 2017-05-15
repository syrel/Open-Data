/**
 * Created by syrel on 11.05.17.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {render} from 'react-dom';

import { Button } from 'react-bootstrap';
import { FormGroup } from 'react-bootstrap';
import { InputGroup } from 'react-bootstrap';
import { FormControl } from 'react-bootstrap';
import TablePresentation from './framework/TablePresentation';
import CompositePresentation from './framework/CompositePresentation';
import PagerPresentation from './framework/PagerPresentation';
import TabulatorPresentation from './framework/TabulatorPresentation';
import Browser from './framework/Browser';

import YASQE from 'yasgui-yasqe';
import Sparql from './Sparql';

import LEndpoint from './model/LEndpoint';
import LClass from './model/LClass';
import LObject from './model/LObject';

class LoadingButton extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false
        };

        this.callback = props.callback;
    }

    render() {
        let isLoading = this.state.isLoading;
        return (
            <Button
                bsStyle="primary"
                disabled={isLoading}
                onClick={!isLoading ? this.handleClick.bind(this) : null}>
                Query
            </Button>
        );
    }

    handleClick() {
        this.setState({isLoading: true});
        this.callback(() => this.setState({isLoading: false}));
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            yasqe: null,
            endpoint: 'https://ld.geo.admin.ch/query',
        };

        this.results = new TablePresentation()
            .header(xml => xml.root.children[0].children.map(each => each.attributes.name))
            .dynamic((header, column) => {
                column
                    .named(() => header)
                    .evaluated(result => result[column.index()].content + ' ('+(result[column.index()].name) + ')')
            })
            .display(xml => xml.root.children[1].children)
            .transformed(result => result.children.map(each => { return {
                datatype: each.children[0].attributes.datatype,
                name: each.children[0].name,
                content:  each.children[0].content
            }}));

        var endpoint = new LEndpoint('https://ld.geo.admin.ch/query');

        this.inspector = new Browser(new TabulatorPresentation());
        this.inspector.openOn(endpoint);

        // this.inspector = new TablePresentation();
        // this.inspector.column();
        // this.inspector.on([1,2,3]);

        // this.inspector = new TabulatorPresentation();
        // this.inspector.table(table => {
        //     table.column();
        // });
        // this.inspector.table(table => {
        //     table.column();
        // });
        // this.inspector.table(table => {
        //     table.column();
        // });
        //
        // this.inspector.on([1,2,3]);

        // endpoint.extensions[0].method(this.inspector);
        // this.inspector.on(endpoint);

        //var clazz = new LClass(endpoint, 'http://www.geonames.org/ontology#A.ADM2');
        // clazz.extensions[0].method(this.inspector);
        // this.inspector.on(clazz);

        // var object = new LObject(endpoint, 'https://ld.geo.admin.ch/boundaries/district/1842');
        // object.extensions[0].method(this.inspector);
        // this.inspector.on(object);
    }

    onClick (callback) {
        // var promise = new Endpoint('https://ld.geo.admin.ch/query').allClasses();
        // promise.then(result => console.log(result), error => console.error(error));
        callback();

        const source = Sparql.query(ReactDOM.findDOMNode(this.refs.endpoint).value, this.state.yasqe.getValue());
        source.then(result => this.results.on(result), (err) => {
            console.error(err);
            callback()
        });
    }

    componentDidMount() {
        this.state.yasqe = YASQE.fromTextArea(document.getElementById('query'));
    }

    componentDidUpdate() {
        this.state.yasqe = YASQE.fromTextArea(document.getElementById('query'));
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
                            <InputGroup.Button>
                                <LoadingButton callback={ (callback) => this.onClick.bind(this)(callback) }>Query</LoadingButton>
                            </InputGroup.Button>
                            <InputGroup.Addon>Endpoint:</InputGroup.Addon>
                            <FormControl type="text" ref='endpoint' value={this.state.endpoint} onChange={this.handleChange}/>
                        </InputGroup>
                    </FormGroup>
                </form>
                <textarea id="query">{`select distinct ?solutionName ?providerName ?providerUID ?hasSolutionProvider
where {
	?s a <http://lindas-data.ch/def/top/SoftwareSolution> ; <http://lindas-data.ch/def/top/hasSolutionProvider> ?sp .
	?sp <http://lindas-data.ch/def/top/uid> ?providerUID .
	?s <http://www.w3.org/2004/02/skos/core#prefLabel> ?solutionName.
	?sp <http://www.w3.org/2004/02/skos/core#prefLabel> ?providerName.
}
order by ?sp
`}</textarea>

                { this.results.render() }
                { this.inspector.render() }

            </div>
        )
    }
}

render(<App/>, document.getElementById('app'));