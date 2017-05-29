/**
 * Created by syrel on 22.05.17.
 */

import React from 'react';
import * as d3 from "d3";
import PresentationComponent from './PresentationComponent';
import Presentation from './Presentation';
import _ from 'underscore'

class MapLayer {
    constructor(index, presentation) {
        this.state = {
            evaluated: entity => entity,
            displayed: entity => entity,
            selected: entity => entity,
            when: entity => true,
            labeled: value => '',
            index: index,
            presentation: presentation
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

    when(block) {
        this.state.when = block;
        return this;
    }

    labeled(block) {
        this.state.labeled = block;
        return this;
    }

    selected(block) {
        this.state.selected = block;
        return this;
    }

    getData(object) {
        return this.state.evaluated(this.state.displayed(object));
    }

    getEvaluated(object) {
        return this.state.evaluated(object);
    }

    getDisplayed(object) {
        return this.state.displayed(object);
    }

    getLabel(object) {
        return this.state.labeled(object);
    }

    getSelected(object) {
        return this.state.selected(object);
    }

    presentation() {
        return this.state.presentation;
    }

    index() {
        return this.state.index;
    }

    /**
     * @param {Object} context - specification of rendering context
     * @param {Selection} context.svg - svg to render on
     * @param {int} context.width - svg width
     * @param {int} context.height - svg height
     * @param {Object} context.entity - presentation's displayed value
     * @param {Object} context.data - result of this.getData(entity)
     * @param {Object} context.datum - result of this.getDisplayed(entity)
     */
    renderOn(context) {
        throw Error('Subclass responsibility');
    }
}


class PathLayer extends MapLayer {
    constructor(index, presentation) {
        super(index, presentation);
    }

    /**
     * @param {Object} context - specification of rendering context
     * @param {Selection} context.svg - svg to render on
     * @param {int} context.width - svg width
     * @param {int} context.height - svg height
     * @param {Object} context.entity - presentation's displayed value
     * @param {Object} context.data - result of this.getData(entity)
     * @param {Object} context.datum - result of this.getDisplayed(entity)
     */
    renderOn(context) {
        var projection = d3.geoMercator().fitSize([context.width, context.height], context.datum);
        var path = d3.geoPath().projection(projection);
        var svg = context.svg;

        svg.append('path')
            .datum(context.datum)
            .attr("class", "boundary")
            .attr("d", path);

        svg.append("g")
            .selectAll("path")
            .data(context.data)
            .enter().append("path")
            .attr("class", "feature")
            .classed('selected', value => this.getSelected(value) === this.presentation().strongSelection())
            .attr("d", path)
            .on('mouseover', (value, index, paths) => {
                d3.select(paths[index]).classed('hovered', true);
            })
            .on('mouseout', (value, index, paths) => {
                d3.select(paths[index]).classed('hovered', false);
            })
            .on('click', value => {
                this.presentation().strongSelected(this.getSelected(value))
            });

        var labels = svg.append('g').attr('class', 'labels');
        labels
            .selectAll('.label')
            .data(context.data)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('transform', d => 'translate(' + path.centroid(d) + ')')
            .style('text-anchor', 'middle')
            .on('mouseover', null).on('mouseout', null)
            .text(value => this.getLabel(value));
    }
}

class MapComponent extends PresentationComponent {

    componentDidMount() {
        this.renderMap();
    }

    componentDidUpdate() {
        this.renderMap();
    }

    layers() {
        var value = this.displayedValue();
        return this.presentation().layers().filter(layer => layer.state.when(value));
    }

    renderMap() {
        var svg = d3.select(this.refs.svg)
            .attr('width', this.props.width)
            .attr('height', this.props.height);

        svg.selectAll('*').remove();

        var layers = this.layers();
        if (layers.length == 0) {
           return;
        }

        var displayedValue = this.displayedValue();
        layers
            .map(layer => {
                return {
                    layer: layer,
                    data: layer.getData(displayedValue),
                    entity: displayedValue
                }
            })
            .filter(spec => !_.isUndefined(spec.data))
            .forEach(spec =>
                spec.layer.renderOn({
                    svg: svg,
                    width: this.props.width,
                    height: this.props.height,
                    entity: spec.entity,
                    data: spec.data,
                    datum: spec.layer.getDisplayed(spec.entity)
                })
            );
    }

    render() {
        return <svg width={ this.props.width } height={ this.props.height } ref="svg" style={{ display: 'block', margin: 'auto' }}/>
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

    path(block) {
        let pathLayer = new PathLayer(this.state.layers.length, this);
        this.state.layers.push(pathLayer);
        if (!_.isUndefined(block))
            block(pathLayer);
        return pathLayer;
    }

    layers() {
        return this.state.layers;
    }

    render(index) {
        return (<MapComponent key={ index } bind={ this.bindings() } width={600} height={500}/>)
    }
}

export default MapPresentation;