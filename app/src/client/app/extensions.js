/**
 * Created by syrel on 21.05.17.
 */

var stringExtensions = [
    {
        method: composite => {
            "use strict";
            composite.text()
        },
        order: 10
    }
];

Object.defineProperty( String.prototype, 'extensions', {
    get: function () {
        return stringExtensions;
    }
});