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

    index() {
        return this.state.index;
    }
}

class MapComponent extends PresentationComponent {
    defaultDisplayedValue() {
        return {
            "type": "MultiPolygon",
            "coordinates": []
        }
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

        var projection = d3.geoMercator().fitSize([this.props.width, this.props.height], this.presentation().layers()[0].getValue(value));
        var path = d3.geoPath().projection(projection);

        this.presentation().layers().forEach(layer => {
            svg.append("path")
                .datum(layer.getValue(value))
                .style("fill", "rgba(255,0,0,0.5)")
                .style("stroke", "rgba(200,0,0,1)")
                .attr("d", path);
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