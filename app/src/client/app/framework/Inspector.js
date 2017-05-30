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

            var defaultTab;
            if (this.composite.isLast(pagerPane)) {
                defaultTab = pagerPane.selectedTab();
            }
            else {
                defaultTab = this.composite.presentations[this.composite.indexOf(pagerPane) + 1].selectedTab();
            }
            
            this.composite.popAfter(pagerPane);
            this.addPane(event.entity, defaultTab);
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