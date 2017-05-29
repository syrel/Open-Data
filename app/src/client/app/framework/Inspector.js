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
            this.addPane(event.entity, pagerPane.selectedTab());
            this.composite.scrollToLast();
        });
    }

    openOn(entity) {
        this.addPane(entity);
        this.composite.on(entity);
    }

    addPane(entity, defaultTab) {
        var tabulator = new TabulatorPresentation({
            defaultTab: defaultTab
        });
        tabulator.openOn(entity);
        this.composite.add(tabulator);
    }
}

export default Inspector;