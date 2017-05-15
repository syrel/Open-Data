/**
 * Created by syrel on 15.05.17.
 */

import React from 'react';
import { Tabs } from 'react-bootstrap';
import { Tab } from 'react-bootstrap';
import CompositePresentation from './CompositePresentation';

class TabulatorComponent extends CompositePresentation.CompositeComponent {
    constructor(props) {
        super(props);
    }

    handleSelect(key) {
        this.setState({key});
    }

    render() {
        return (
            <Tabs activeKey={this.state.key} onSelect={this.handleSelect} animation={false} id="tabulator">
                {
                    this.presentations().map((presentation, index) => (
                        <Tab eventKey={index} title={ presentation.getTitle() }>{ presentation.render() }</Tab>
                    ))
                }
            </Tabs>
        );
    }
}

class TabulatorPresentation extends CompositePresentation {
    constructor(props) {
        super(props);
    }

    render() {
        return (<TabulatorComponent bind={ this.bindings() } presentations={ this.presentations }/>);
    }
}


export default TabulatorPresentation;