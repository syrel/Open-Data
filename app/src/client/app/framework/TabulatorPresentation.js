/**
 * Created by syrel on 15.05.17.
 */

import React from 'react';
import { Tabs } from 'react-mdl';
import { Tab } from 'react-mdl';
import CompositePresentation from './CompositePresentation';

class TabulatorComponent extends CompositePresentation.CompositeComponent {
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
                <Tabs activeTab={this.state.activeTab} onChange={ tabId => this.handleSelect(tabId)} ripple>
                    {
                        this.presentations().map((presentation, index) => (
                            <Tab key={index}>{ presentation.getTitle() }</Tab>
                        ))
                    }
                </Tabs>
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

class TabulatorPresentation extends CompositePresentation {
    constructor(props) {
        super(props);
    }

    render(index) {
        return (<TabulatorComponent key={index} bind={ this.bindings() }/>);
    }
}


export default TabulatorPresentation;