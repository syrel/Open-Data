/**
 * Created by syrel on 15.05.17.
 */

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
}

export default LBinding;