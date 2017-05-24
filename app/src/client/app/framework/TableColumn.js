/**
 * Created by syrel on 14.05.17.
 */

class TableColumn {
    constructor(index) {
        this.state = {
            named: entity => 'Column '+(index+1),
            evaluated: entity => entity,
            displayed: entity => entity,
            index: index
        }
    }

    named(block) {
        this.state.named = block;
        return this;
    }

    evaluated(block) {
        this.state.evaluated = block;
        return this;
    }

    display(block) {
        this.state.displayed = block;
        return this;
    }

    getName(entity) {
        return this.state.named(entity);
    }

    getValue(object) {
        return this.state.displayed(this.state.evaluated(object));
    }

    index() {
        return this.state.index;
    }
}

export default TableColumn;