/**
 * Created by syrel on 23.05.17.
 */

import LGeoObject from './LGeoObject'

class LGeoCountry extends LGeoObject {
    constructor(props) {
        super(props);

        this.extensions.push(
            {
                method: this.gtInspectorWebMapIn.bind(this),
                order: 20
            })
    }

    gtInspectorWebMapIn(composite) {
        composite.iframe(iframe => {
            iframe.title(entity => 'Map');
            iframe.when(entity => entity.hasProperty('hasMap'));
            iframe.display(entity => entity.propertyValueAt('hasMap'))
        })
    }
}

export default LGeoCountry;