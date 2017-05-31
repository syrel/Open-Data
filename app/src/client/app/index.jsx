/**
 * Created by syrel on 11.05.17.
 */

// Styles
import '!style-loader!css-loader!./../styles.css';
import '!style-loader!css-loader!bootstrap/dist/css/bootstrap.css';

import '!style-loader!css-loader!bootstrap-material-design/dist/css/bootstrap-material-design.css';
import '!style-loader!css-loader!bootstrap-material-design/dist/css/ripples.css';
import 'bootstrap-material-design';

import '!style-loader!css-loader!material-design-lite/material.css';
import 'material-design-lite'

import 'react-mdl/extra/material.css';
import '!style-loader!css-loader!./../styles.css';

import 'react-mdl/extra/material.js';

// Modules
import React from 'react';
import {render} from 'react-dom';
import Inspector from './framework/Inspector';
import LEndpoint from './model/LEndpoint';
import LObject from './model/LObject';
import './extensions';
import { ElementQueries } from 'css-element-queries';

import LServiceProvider from './model/LServiceProvider';

class App extends React.Component {
    constructor(props) {
        super(props);

        LObject.setServiceProvider(LServiceProvider);
        LEndpoint.setServiceProvider(LServiceProvider);

        this.state = {
            endpoint: LServiceProvider.geoEndpoint()
            //endpoint: LServiceProvider.lindasEndpoint()
            //endpoint: new LEndpoint('http://dbpedia.org/sparql')

            //endpoint: new LEndpoint('http://eurostat.linked-statistics.org/sparql')

            //endpoint: new LEndpoint('https://query.wikidata.org/bigdata/namespace/wdq/sparql')
            //endpoint: new LEndpoint('http://data.alod.ch/query')
        };
        this.inspector = new Inspector();
        this.inspector.openOn(this.state.endpoint);
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
                    { this.inspector.render() }
                </main>
            </div>
        )
    }
}

render(<App/>, document.getElementById('app'));
$.material.init();