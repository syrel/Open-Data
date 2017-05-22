/**
 * Created by syrel on 21.05.17.
 */

class Thenable {
    constructor(thenable) {
        this.state = {
            onCompleted: [],
            then: []
        };

        if (typeof thenable == 'undefined') {
            return;
        }

        thenable.then(result => {
            this.resolved = { result: result };
            this.state.then.forEach(then => {
                if (typeof result != 'undefined') {
                    if (typeof result.then != 'undefined') {
                        result.then(then.resolved, then.rejected);
                    }
                    else {
                        then.resolved(result);
                    }
                }
                else {
                    then.resolved(result);
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
        if (typeof chain == 'undefined') {
            chain = true;
        }

        if (!this.isPending()) {
            if (this.isResolved()) {
                var result = resolved(this.resolved.result);
                if (chain) {
                    if (typeof result != 'undefined') {
                        if (typeof result.then != 'undefined') {
                            return new Thenable(result);
                        }
                        return Thenable.resolve(result);
                    }
                    return Thenable.resolve(this.resolved.result);
                }
            }
            if (this.isRejected()) {
                var error = rejected(this.rejected.error);
                if (chain) {
                    return Thenable.reject(error);
                }
            }
        }
        else {
            this.state.then.push({
                resolved: resolved,
                rejected: rejected
            });
            if(chain) {
                return Thenable.of((resolve, reject) => {
                    this.then(result => {
                        resolve(resolved(result));
                    }, error => reject(error), false)
                });
            }
        }
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
}

export default Thenable;