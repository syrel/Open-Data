/**
 * Created by syrel on 30.05.17.
 */

import LGeoObject from './LGeoObject'

class LGeoMunicipality extends LGeoObject {
    constructor(props) {
        super(props);

        this.extensions = [
            {
                method: this.gtInspectorPropertiesIn.bind(this),
                order: 30
            },
            {
                method: this.gtInspectorVersionsIn.bind(this),
                order: 22,
                dynamic: true
            }
        ]
    }
}

export default LGeoMunicipality;