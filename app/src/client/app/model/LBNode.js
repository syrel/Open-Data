/**
 * Created by syrel on 22.05.17.
 */

class LBNode {
    constructor(endpoint, node) {
        this.endpoint = endpoint;
        this.node = node;

        this.extensions = [

        ]
    }

    toString() {
        return this.node;
    }
}

export default LBNode;