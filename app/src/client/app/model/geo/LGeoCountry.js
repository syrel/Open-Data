/**
 * Created by syrel on 23.05.17.
 */

import LGeoObject from './LGeoObject'

class LGeoCountry extends LGeoObject {
    constructor(props) {
        super(props);

        this.extensions = [
            {
                method: this.gtInspectorVersionsIn.bind(this),
                order: 10
            },
            {
                method: this.gtInspectorMapIn.bind(this),
                order: 20
            },
            {
                method: this.gtInspectorPropertiesIn.bind(this),
                order: 30
            },
        ]
    }

    gtInspectorMapIn(composite) {
        composite.iframe(iframe => {
            iframe.title(entity => 'Map');
            iframe.when(entity => entity.hasProperty('hasMap'));
            iframe.display(entity => entity.propertyValueAt('hasMap'))
        })
    }
}

export default LGeoCountry;