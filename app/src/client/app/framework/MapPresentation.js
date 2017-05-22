/**
 * Created by syrel on 22.05.17.
 */

import React from 'react';
import * as d3 from "d3";
import PresentationComponent from './PresentationComponent';
import Presentation from './Presentation';

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
        var value = this.displayedValue();

        var projection = d3.geoMercator().fitSize([this.props.width, this.props.height], value);
        var path = d3.geoPath().projection(projection);

        var svg = d3.select(this.refs.svg)
            .attr("width", this.props.width)
            .attr("height", this.props.height);

        svg.selectAll("*").remove();

        svg.append("path")
            .datum(value)
            .style("fill", "rgba(255,0,0,0.5)")
            .style("stroke", "rgba(200,0,0,1)")
            .attr("d", path);
    }

    render() {
        return <svg width={this.props.width} height={this.props.height} ref="svg"></svg>
    }
}

class MapPresentation extends Presentation {
    render(entity) {
        return (<MapComponent bind={ this.bindings() } width={600} height={500}/>)
    }
}

export default MapPresentation;