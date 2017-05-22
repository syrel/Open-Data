/**
 * Created by syrel on 15.05.17.
 */

import Thenable from './../Thenable'

class LBinding {
    constructor(props) {
        this.endpoint = props.endpoint;
        this.property = props.property;
        this.value = props.value;
    }

    getProperty() {
        return this.property;
    }

    getValue() {
        return this.value;
    }

    getEndpoint() {
        return this.endpoint;
    }

    /**
     * @returns {Thenable}
     */
    propertyAt(aName) {
        return Thenable.of((resolve, reject) => {
            this.value.getObject().then(result => {
                result.propertyAt(aName).then(property => {
                    resolve(property);
                }, error => reject(error))
            }, error => reject(error))
        });
    }
}

export default LBinding;