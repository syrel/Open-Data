/**
 * Created by syrel on 30.05.17.
 */

import React from 'react';
import * as d3 from "d3";
import PresentationComponent from './PresentationComponent';
import Presentation from './Presentation';
import _ from 'underscore'

class BarChartComponent extends PresentationComponent {

    componentDidMount() {
        this.renderChart();
    }

    componentDidUpdate() {
        this.renderChart();
    }

    p(x,y){
        return x+" "+y+" ";
    }

    roundedRectangle(x, y, w, h, r1, r2, r3, r4){
        var strPath = "M" + this.p(x+r1,y);
        strPath+="L"+this.p(x+w-r2,y)+"Q"+this.p(x+w,y)+this.p(x+w,y+r2);
        strPath+="L"+this.p(x+w,y+h-r3)+"Q"+this.p(x+w,y+h)+this.p(x+w-r3,y+h);
        strPath+="L"+this.p(x+r4,y+h)+"Q"+this.p(x,y+h)+this.p(x,y+h-r4);
        strPath+="L"+this.p(x,y+r1)+"Q"+this.p(x,y)+this.p(x+r1,y);
        strPath+="Z";
        return strPath;
}


    renderChart() {
        var svg = d3.select(this.refs.svg)
            .attr('width', this.props.width)
            .attr('height', this.props.height);

        svg.selectAll('*').remove();


        var data = this.displayedValue();

        var g = svg.append('g');

        var margin = {
            top: 40,
            right: 20,
            bottom: 30,
            left: 20
        };

        var radius = 5;

        var x = d3.scaleBand().rangeRound([ margin.left, this.props.width - margin.right]).padding(0.15);
        var y = d3.scaleLinear().rangeRound([this.props.height - margin.top, margin.bottom]);

        var valueX = entity => this.presentation().state.x(entity);
        var valueY = entity => this.presentation().state.y(entity);
        var label = entity => this.presentation().state.labeled(entity);

        x.domain(data.map(valueX));
        y.domain([0, d3.max(data, valueY)]);

        g.selectAll('.background')
            .data(data)
            .enter().append('rect')
            .attr('class', 'background')
            .attr('x', entity => x(valueX(entity)))
            .attr('y', margin.top)
            .attr('rx', radius)
            .attr('ry', radius)
            .attr('width', x.bandwidth())
            .attr('height', this.props.height - margin.top - margin.bottom)
            .attr('fill', 'rgba(255,255,255,0.28)')
            .on('click', value => {
                this.presentation().strongSelected(this.presentation().state.selected(value))
            });

        g.selectAll('.bar')
            .data(data)
            .enter()
            .append('path')
            .attr('d', entity => {
                var coordX = x(valueX(entity));
                var coordY = y(valueY(entity));

                var isFull = Math.abs(coordY - margin.bottom) <= 1;
                return this.roundedRectangle(
                    coordX,
                    coordY - margin.bottom + margin.top,
                    x.bandwidth(),
                    this.props.height - coordY - margin.top,
                    isFull ? radius : 0,
                    isFull ? radius : 0,
                    radius,
                    radius)
            })
            .attr('class', 'bar')
            .attr('fill', 'rgba(255,255,255,0.6)')
            .on('click', value => {
                this.presentation().strongSelected(this.presentation().state.selected(value))
            });

        var nodes = g.selectAll('.labels')
            .data(data)
            .enter()
            .append('g')
            .attr('transform', entity => 'translate('+ x(valueX(entity)) +',' + (this.props.height - margin.top) + ')');

        nodes
            .append('text')
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .attr('x', '0')
            .attr('y', '0')
            .attr('dy', margin.top - margin.bottom / 2)
            .attr('dx', x.bandwidth() / 2)
            .attr('fill', 'rgba(255,255,255,1)')
            .attr('font-size', '9pt')
            .text(entity => label(entity));
    }

    render() { // , background: 'rgb(0,200,198)'
        return <svg width={ this.props.width } height={ this.props.height } ref="svg" style={{ display: 'block', margin: 'auto' }}/>
    }
}

class BarChartPresentation extends Presentation {
    constructor(props) {
        super(props);

        Object.assign(this.state, {
            x: entity => entity.x,
            y: entity => entity.y,
            labeled: entity => entity.x,
            selected: entity => entity
        });
    }

    x(block) {
        this.state.x = block;
        return this;
    }

    y(block) {
        this.state.y = block;
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

    render(index) {
        return (<BarChartComponent key={ this.uuid() } bind={ this.bindings() } width={800} height={250}/>)
    }
}

export default BarChartPresentation;