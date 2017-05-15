/**
 * Created by syrel on 15.05.17.
 */

import Browser from './Browser';
import PagerPresentation from './PagerPresentation';
import TabulatorPresentation from './TabulatorPresentation';

class Inspector extends Browser {
    constructor() {
        super(new PagerPresentation());

        this.when('strongSelection', event => {
            var pagerPane = this.composite.paneOf(event.presentation);
            this.composite.popAfter(pagerPane);
            this.addPane(event.entity);
            this.composite.scrollToLast();
        });
    }

    openOn(entity) {
        this.addPane(entity);
        this.composite.on(entity);
    }

    addPane(entity) {
        var tabulator = new TabulatorPresentation();
        this.composite.add(tabulator);
        tabulator.openOn(entity);
    }
}

export default Inspector;