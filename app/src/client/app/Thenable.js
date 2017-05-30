/**
 * Created by syrel on 21.05.17.
 */

import Rx from 'rxjs';
import _ from 'underscore';

class Thenable {
    /**
     * Default value is optional value that is returned by get() until thenable is not resolved
     * @param thenable
     * @param defaultBlock
     */
    constructor(thenable, defaultBlock) {
        this.state = {
            onCompleted: [],
            then: [],
            default: defaultBlock
        };

        if (Thenable.isUndefined(thenable)) {
            return;
        }

        var resolved = (result) => {
            this.state.then.forEach(then => {
                if (Thenable.isUndefined(then.resolved)) {
                    throw Error('then.resolved must not be undefined');
                }

                if (!Thenable.isUndefined(result)) {
                    if (!Thenable.isUndefined(result.then)) {
                        // here result is Thenable or polymorphic
                        // we should unpack result recursively
                        result.then((innerResult) => {
                            then.result = then.resolved(innerResult);
                            return then.resolved;
                        }, then.rejected);
                    }
                    else {
                        then.result = then.resolved(result);
                    }
                }
                else {
                    // result is undefined
                    then.result = then.resolved(result);
                }
            });
            this.state.onCompleted.forEach(onCompleted => onCompleted());
            this.state.onCompleted = [];
            this.state.then = [];
        };

        var rejected = (error) => {
            console.error(error);
            this.rejected = { error: error };
            this.state.then.forEach(then => { if (!Thenable.isUndefined(then.rejected)) then.rejected(error) });
            this.state.onCompleted.forEach(onCompleted => onCompleted());
            this.state.onCompleted = [];
            this.state.then = [];
        };


        thenable.then(result => {
            if (!Thenable.isUndefined(result)) {
                if (!Thenable.isUndefined(result.then)) {
                    // here result is Thenable or polymorphic
                    // we should unpack result recursively
                    result.then((innerResult) => {
                        this.resolved = { result: innerResult };
                        resolved(innerResult);
                    }, rejected);
                }
                else {
                    this.resolved = { result: result };
                    resolved(result);
                }
            }
            else {
                // result is undefined
                this.resolved = { result: result };
                resolved(result);
            }
        }, rejected,
        false)
    }

    then(resolved, rejected, chain) {
        if (Thenable.isUndefined(chain)) {
            chain = true;
        }

        if (!this.isPending()) {
            if (this.isResolved()) {
                if (!Thenable.isFunction(resolved)) {
                    return Thenable.resolve(this.resolved.result);
                }
                // now we can guarantee that resolved is function


                var result = resolved(this.resolved.result);

                if (chain) {
                    if (!Thenable.isUndefined(result)) {
                        if (!Thenable.isUndefined(result.then)) {
                            return new Thenable(result);
                        }
                        return Thenable.resolve(result);
                    }
                    return Thenable.resolve(this.resolved.result);
                }
            }
            if (this.isRejected()) {
                if (!Thenable.isFunction(rejected)) {
                    return Thenable.reject(this.rejected.error);
                }
                // now we can guarantee that rejected is function

                if (!Thenable.isUndefined(rejected)) {
                    var error = rejected(this.rejected.error);
                    if (chain) {
                        return Thenable.reject(error);
                    }
                }
                if (chain) {
                    return Thenable.reject(this.rejected.error);
                }
            }
        }
        else {
            if (!Thenable.isFunction(resolved)) {
                return Thenable.of((resolved, rejected) => {
                    this.then((result) => resolved(result),rejected, false)
                }, () => {
                    if (!Thenable.isUndefined(this.state.default)) {
                        var resolvedDefault = resolved(this.getDefault());
                        if (!Thenable.isUndefined(resolvedDefault)) {
                            if (!Thenable.isUndefined(resolvedDefault.then)) {
                                return resolvedDefault.get();
                            }
                            return resolvedDefault;
                        }
                    }
                    return this.state.default;
                })
            }
            // now we can guarantee that resolved is function

            var then = {
                resolved: resolved,
                rejected: rejected
            };
            this.state.then.push(then);

            if(chain) {
                return Thenable.of((resolve, reject) => {
                    // then.result will be already computed resolved result
                    this.then(() => { resolve(then.result) }, reject, false)
                }, () => {
                    if (!Thenable.isUndefined(this.state.default)) {
                        var resolvedDefault = resolved(this.getDefault());
                        if (!Thenable.isUndefined(resolvedDefault)) {
                            if (!Thenable.isUndefined(resolvedDefault.then)) {
                                return resolvedDefault.get();
                            }
                            return resolvedDefault;
                        }
                    }
                    return this.state.default;
                });
            }
        }
    }

    static isFunction(obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    }

    static isUndefined(obj) {
        return typeof obj === 'undefined';
    }

    // is not called if completed
    onCompleted(block) {
        if (this.isPending()) {
            this.state.onCompleted.push(block);
        }
    }

    isPending() {
        return !this.isResolved() && !this.isRejected();
    }

    isResolved() {
        return !(typeof this.resolved == 'undefined');
    }

    isRejected() {
        return !(typeof this.rejected == 'undefined');
    }

    get() {
        if (this.isPending() || this.isRejected()) {
            var defaultValue = this.getDefault();
            if (!Thenable.isUndefined(defaultValue)) {
                if (!Thenable.isUndefined(defaultValue.then)) {
                    return defaultValue.get();
                }
            }
            return defaultValue;
        }

        var resolvedResult = this.resolved.result;
        if (!Thenable.isUndefined(resolvedResult)) {
            if (!Thenable.isUndefined(resolvedResult.then)) {
                return resolvedResult.get();
            }
        }
        return resolvedResult;
    }

    getDefault() {
        if (Thenable.isFunction(this.state.default)) {
            return this.state.default();
        }
        return this.state.default;
    }

    static resolve(value) {
        let thenable = new Thenable();
        thenable.resolved = { result: value };
        return thenable;
    }

    static reject(error) {
        let thenable = new Thenable();
        thenable.rejected = { error: error };
        return thenable;
    }

    static of(anObject, defaultBlock) {
        if (_.isUndefined(anObject)) {
            return defaultBlock;
        }

        if (Thenable.isFunction(anObject)) {
            return new Thenable({ then: anObject }, defaultBlock);
        }

        if (anObject instanceof Thenable) {
            if (Thenable.isUndefined(defaultBlock)) {
                return anObject;
            }
        }

        if (!Thenable.isUndefined(anObject.then)) {
            return new Thenable(anObject, defaultBlock);
        }
        return Thenable.resolve(anObject);
    }

    static multiple(map) {
        if(_.isArray(map)) {
            return Thenable.multipleArray(map);
        }
        return Thenable.multipleObject(map);
    }

    static multipleArray(array) {
        return Thenable.of((resolve, reject) => {
            var errors = [];
            var results = [];

            Rx.Observable.from(array.map(each => Thenable.of(each))).concatMap(each => each)
                .subscribe(
                    result => {
                        results.push(result);
                    },
                    err => {
                        console.error(err);
                        errors.push(err);
                    },
                    () => {
                        if (errors.length == 0) {
                            resolve(results);
                        }
                        else {
                            reject(errors);
                        }
                    });
        })
    }

    static multipleObject(map) {
        return Thenable.of((resolve, reject) => {

            var errors = [];

            var pairs = _.pairs(map);
            var keys = _.map(pairs, pair => pair[0]);
            var thenables = _.map(pairs, pair => Thenable.of(pair[1]));

            var results = [];

            Rx.Observable.from(thenables).concatMap(each => each)
                .subscribe(
                    result => {
                        results.push([ keys[results.length], result]);
                    },
                    err => {
                        console.error(err);
                        errors.push(err);
                    },
                    () => {
                        if (errors.length == 0) {
                            resolve(_.object(results));
                        }
                        else {
                            reject(errors);
                        }
                    });
        });
    }

    static delay(milliseconds, defaultBlock) {
        var now = Math.floor(Date.now());

        if (Thenable.isUndefined(defaultBlock)) {
            defaultBlock = () => Math.floor(Date.now()) - now;
        }

        return Thenable.of((resolve) => {
            var start = Math.floor(Date.now());
            setTimeout(() => resolve(Math.floor(Date.now()) - start), milliseconds);
        }, defaultBlock);
    }
}

export default Thenable;