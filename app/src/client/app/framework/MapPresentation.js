/**
 * Created by syrel on 22.05.17.
 */

import React from 'react';
import * as d3 from "d3";
import PresentationComponent from './PresentationComponent';
import Presentation from './Presentation';
import _ from 'underscore'

class MapLayer {
    constructor(index) {
        this.state = {
            evaluated: entity => entity,
            displayed: entity => entity,
            index: index
        }
    }

    evaluated(block) {
        this.state.evaluated = block;
        return this;
    }

    display(block) {
        this.state.displayed = block;
        return this;
    }

    getValue(object) {
        return this.state.displayed(this.state.evaluated(object));
    }

    getEvaluated(object) {
        return this.state.evaluated(object);
    }

    getDisplayed(object) {
        return this.state.displayed(object);
    }

    index() {
        return this.state.index;
    }
}

class MapComponent extends PresentationComponent {
    defaultDisplayedValue() {
        return null;
    }

    componentDidMount() {
        this.renderMap();
    }

    componentDidUpdate() {
        this.renderMap();
    }

    renderMap() {
        var svg = d3.select(this.refs.svg)
            .attr("width", this.props.width)
            .attr("height", this.props.height);

        svg.selectAll("*").remove();

        if (this.presentation().layers().length == 0) {
           return;
        }

        var value = this.displayedValue();
        if (_.isNull(value)) {
            return;
        }

        var projection = d3.geoMercator().fitSize([this.props.width, this.props.height], this.presentation().layers()[0].getEvaluated(value));
        var path = d3.geoPath().projection(projection);

        var color = d3.scaleLinear().domain([1,1181600])
            .interpolate(d3.interpolateHcl)
            .range([d3.rgb("#FFB3B7"), d3.rgb('#FF3533')]);

        this.presentation().layers().forEach(layer => {
            var data = layer.getValue(value);
            if (!_.isUndefined(data)) {
                svg.append("path")
                    .datum(layer.getEvaluated(value))
                    .attr("class", "boundary")
                    .attr("d", path);
                svg.append("g")
                    .selectAll("path")
                    .data(data)
                    .enter().append("path")
                    .attr("class", "feature")
                    .style("fill", d => {
                        var area = 0;
                        d.properties.unit.propertyValueAt('ontology#population').then(result => area = result);
                        return color(area);
                    })
                    .attr("d", path)
                    // .on('mouseover', (d, i) => {
                    //     console.log('mouseover', d, i);
                    // })
                    // .on('mousemove', (d, i) => {
                    //     console.log('mousemove', d, i);
                    // })
                    // .on('mouseout', (d,i) => {
                    //     console.log('mouseout', d, i);
                    // })
                    .on('click', entity => this.presentation().strongSelected(entity));
            }
        });

    }

    render() {
        return <svg width={this.props.width} height={this.props.height} ref="svg"></svg>
    }
}

class MapPresentation extends Presentation {
    constructor(props) {
        super(props);

        Object.assign(this.state, {
            transformed: object => object,
            layers: []
        });
    }

    layer(block) {
        let layer = new MapLayer(this.state.layers.length);
        this.state.layers.push(layer);
        if (!_.isUndefined(block))
            block(layer);
        return layer;
    }

    layers() {
        return this.state.layers;
    }

    render(entity) {
        return (<MapComponent bind={ this.bindings() } width={600} height={400}/>)
    }
}

export default MapPresentation;