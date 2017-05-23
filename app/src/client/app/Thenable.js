/**
 * Created by syrel on 21.05.17.
 */

class Thenable {
    constructor(thenable) {
        this.state = {
            onCompleted: [],
            then: []
        };

        if (this.isUndefined(thenable)) {
            return;
        }

        thenable.then(result => {
            this.resolved = { result: result };
            this.state.then.forEach(then => {
                if (this.isUndefined(then.resolved)) {
                    throw Error('then.resolved must not be undefined');
                }

                if (!this.isUndefined(result)) {
                    if (!this.isUndefined(result.then)) {
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
        }, error => {
            console.error(error);
            this.rejected = { error: error };
            this.state.then.forEach(then => { if (typeof then.rejected !== 'undefined') then.rejected(error) });
            this.state.onCompleted.forEach(onCompleted => onCompleted());
            this.state.onCompleted = [];
            this.state.then = [];
        },
        false)
    }

    then(resolved, rejected, chain) {
        if (this.isUndefined(chain)) {
            chain = true;
        }

        if (!this.isPending()) {
            if (this.isResolved()) {
                if (!this.isFunction(resolved)) {
                    return Thenable.resolve(this.resolved.result);
                }
                // now we can guarantee that resolved is function


                var result = resolved(this.resolved.result);

                if (chain) {
                    if (!this.isUndefined(result)) {
                        if (!this.isUndefined(result.then)) {
                            return new Thenable(result);
                        }
                        return Thenable.resolve(result);
                    }
                    return Thenable.resolve(this.resolved.result);
                }
            }
            if (this.isRejected()) {
                if (!this.isFunction(resolved)) {
                    return Thenable.resolve(this.rejected.error);
                }
                // now we can guarantee that resolved is function

                var error = rejected(this.rejected.error);
                if (chain) {
                    return Thenable.reject(error);
                }
            }
        }
        else {
            if (!this.isFunction(resolved)) {
                return Thenable.of((resolved, rejected) => {
                    this.then((result) => resolved(result),rejected, false)
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
                });
            }
        }
    }

    isFunction(obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    }

    isUndefined(obj) {
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

    static of(aFunction) {
        return new Thenable({ then: aFunction });
    }

    static delay(milliseconds) {
        return Thenable.of((resolve) => {
            var start = Math.floor(Date.now());
            setTimeout(() => resolve(Math.floor(Date.now()) - start), milliseconds);
        });
    }
}

export default Thenable;