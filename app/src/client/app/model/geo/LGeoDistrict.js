/**
 * Created by syrel on 30.05.17.
 */

import LGeoObject from './LGeoObject'

class LGeoDistrict extends LGeoObject {
    constructor(props) {
        super(props);

        this.extensions = [
            {
                method: this.gtInspectorPropertiesIn.bind(this),
                order: 30
            }
        ]
    }
}

export default LGeoDistrict;