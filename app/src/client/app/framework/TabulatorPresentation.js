/**
 * Created by syrel on 15.05.17.
 */

import React from 'react';
import { Tabs as MaterialTabs } from 'react-mdl';
import { Tab as MaterialTab } from 'react-mdl';
import { Tabs as BootstrapTabs } from 'react-bootstrap';
import { Tab as BootstrapTab } from 'react-bootstrap';

import CompositePresentation from './CompositePresentation';

class MaterialTabulatorComponent extends CompositePresentation.CompositeComponent {
    constructor(props) {
        super(props);
        this.state.activeTab = 0;
    }

    handleSelect(activeTab) {
        this.setState({ activeTab: activeTab });
    }

    render() {
        return (
            <div>
                <MaterialTabs activeTab={this.state.activeTab} onChange={ tabId => this.handleSelect(tabId)} ripple>
                    {
                        this.presentations().map((presentation, index) => (
                            <MaterialTab key={index}>{ presentation.getTitle() }</MaterialTab>
                        ))
                    }
                </MaterialTabs>
                <section>
                    <div key={this.state.activeTab} className="content"> { this.renderTab(this.state.activeTab) }</div>
                </section>
            </div>
        );
    }

    renderTab(index) {
        var presentations = this.presentations();
        if (presentations.length == 0) {
            return '';
        }
        index = Math.min(index, presentations.length - 1);
        return presentations[index].render(index);
    }
}

class BootstrapTabulatorComponent extends CompositePresentation.CompositeComponent {
    constructor(props) {
        super(props);

        this.state.activeTab = 0;
    }

    handleSelect(activeTab) {
        this.setState({activeTab});
    }

    render() {
        return (
            <BootstrapTabs activeKey={this.state.activeTab} onSelect={this.handleSelect.bind(this)} animation={false} id="tabulator">
                {
                    this.presentations().map((presentation, index) => (
                        <BootstrapTab key={index} eventKey={index}
                             title={ presentation.getTitle() }>{ presentation.render(index) }</BootstrapTab>
                    ))
                }
            </BootstrapTabs>);
    }
}

class TabulatorPresentation extends CompositePresentation {
    constructor(props) {
        super(props);
    }
    render(index) {
        return (<MaterialTabulatorComponent key={index} bind={ this.bindings() }/>);
    }
}

export default TabulatorPresentation;