/**
 * Created by syrel on 31.05.17.
 */

import React from 'react';
import PresentationComponent from './PresentationComponent';
import Presentation from './Presentation';
import ElementQueries from 'css-element-queries';
import $ from 'jquery';
import _ from 'underscore';

class SvgComponent extends PresentationComponent {
    updateHeight() {
        if (_.isUndefined(this.refs.svg)) {
            return;
        }
        $(this.refs.svg.parentNode).height(Math.ceil($(this.refs.svg).height()));
    }

    componentDidMount() {
        this.renderSVG();
        new ElementQueries.ResizeSensor(this.refs.svg.parentNode.parentNode, _.throttle(this.updateHeight, 100).bind(this));
        this.updateHeight();
    }

    componentDidUpdate() {
        this.renderSVG();
        this.updateHeight();
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

    renderSVG() {
        throw Error('Subclass responsibility');
    }

    render() {
        return <div style={{
            position: 'relative',
            margin: '0 auto',
            width: '100%',
        }}>

            <svg
                ref='svg'
                style={{position: 'absolute'}}
                viewBox={'0 0 ' + this.props.width + ' ' + this.props.height }
                preserveAspectRatio='xMidYMid meet'
            />
        </div>
    }
}

class SvgPresentation extends Presentation {

}

SvgPresentation.SvgComponent = SvgComponent;
export default SvgPresentation;