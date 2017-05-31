/**
 * Created by syrel on 15.05.17.
 */

import React from 'react';
import { Tabs as MaterialTabs } from 'react-mdl';
import { Tab as MaterialTab } from 'react-mdl';
import camelCase from 'lodash/camelCase';
import _ from 'underscore';
import uuid from '../uuid'

import CompositePresentation from './CompositePresentation';

class MaterialTabulatorComponent extends CompositePresentation.CompositeComponent {
    constructor(props) {
        super(props);

        Object.assign(this.state, {
            activeTab: props.defaultTab
        });
    }

    tabKey(presentation) {
        return camelCase(presentation.getTitle());
    }

    handleSelect(activeTab) {
        this.presentation().selectTab(activeTab);
        this.setState({
            activeTab: activeTab
        });
    }

    generateAttributes() {
        var presentations = this.presentations();
        var selectedTab = this.state.activeTab;

        if (_.isUndefined(selectedTab)) {
            if (presentations.length > 0) {
                selectedTab = this.tabKey(presentations[0]);
            }
        }

        var selectedIndex = -1;
        var selectedPresentation = _.find(
            presentations,
            presentation => {
                selectedIndex++;
                return _.isEqual(this.tabKey(presentation),selectedTab)
            });

        if (_.isUndefined(selectedPresentation)) {
            selectedPresentation = presentations[0];
            selectedTab = this.tabKey(selectedPresentation);
            selectedIndex = 0;
        }

        var attributes = {
            style: { display: 'table-row' },
            activeTab: selectedIndex,
            value: selectedTab,
            onChange: tabId => {
                this.handleSelect(this.tabKey(presentations[tabId]))
            }
        };
        this.presentation().selectTab(selectedTab);
        return attributes;
    }

    render() {
        var attributes = this.generateAttributes();
        return (
            <div style={{width: '100%', maxHeight: '100%', display: 'flex', flexDirection: 'column'}}>
                <MaterialTabs { ... attributes } ripple>
                    {
                        this.presentations().map((presentation, index) => (
                            <MaterialTab key={ this.tabKey(presentation) }>{ presentation.getTitle() }</MaterialTab>
                        ))
                    }
                </MaterialTabs>
                <section style={{overflowY: 'auto'}}>
                    { this.renderTab(attributes.value) }
                </section>
            </div>
        );
    }

    presentationForKey(tabKey) {
        return _.find(this.presentations(), presentation => _.isEqual(this.tabKey(presentation), tabKey));
    }

    renderTab(tabKey) {
        var presentations = this.presentations();
        if (presentations.length == 0) {
            return <div key={uuid()} className="content"></div>;
        }

        var presentation = this.presentationForKey(tabKey);
        if (_.isUndefined(presentation)) {
            return <div key={uuid()} className="content"></div>;
        }
        return <div key={ tabKey } className="content"> { presentation.render(tabKey) }</div>
    }
}

class TabulatorPresentation extends CompositePresentation {
    constructor(props) {
        super(props);

        if (!_.isUndefined(props)) {
            Object.assign(this.state, {
                defaultTab: props.defaultTab,
                selectedTab: _.noop()
            });
        }
    }

    selectTab(tab) {
        Object.assign(this.state, {
            selectedTab: tab
        });
    }

    selectedTab() {
        return this.state.selectedTab;
    }

    render(index) {
        return (<MaterialTabulatorComponent key={ this.uuid() + index }  bind={ this.bindings() } defaultTab={ this.state.defaultTab }/>);
    }
}

export default TabulatorPresentation;