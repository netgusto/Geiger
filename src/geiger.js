'use strict';

import { EventEmitter } from 'events';

export class Action extends EventEmitter { }

export class Store extends EventEmitter {

    constructor(...args) {
        super(...args);
        this.dispatching = [];
        this.waiting = [];
    }

    changed() { this.emit('change'); }

    watch(cbk) {
        this.on('change', cbk);
        return () => this.removeListener('change', cbk);
    }

    isDispatching() { return this.dispatching.length > 0; }

    isWaiting() { return this.waiting.length > 0; }

    listen(actions, event, cbk) {

        if(typeof actions !== 'object' || typeof actions.on !== 'function') { throw new Error('Store ' + this.constructor.name + '.listen() method expects an EventEmitter-compatible object as a first parameter.'); }

        actions.on(event, (...args) => {

            //console.log(this.constructor.name + ':' + event + ':dispatching:begin');

            this.dispatching.push(event);

            const res = cbk(...args);
            const ispromise = (typeof res === 'object' && typeof res.then === 'function');

            if(this.isWaiting() && !ispromise) { throw new Error('Store ' + this.constructor.name + ' waiting; action has to return a promise'); }

            if(ispromise) {
                res.then(() => {
                    this.dispatching.pop();
                    this.emit('dispatching:end', event);
                    //console.log(this.constructor.name + ':' + event + ':dispatching:end');
                });
            } else {
                this.dispatching.pop();
                this.emit('dispatching:end', event);
                //console.log(this.constructor.name + ':' + event + ':dispatching:end');
            }

            return res;
        });
    }

    wait(stores) {

        this.waiting.push(true);

        const promises = [];

        (Array.isArray(stores) ? stores : [stores]).map(store => {
            if(store.isDispatching()) {
                promises.push(new Promise(resolve => store.once('dispatching:end', resolve)));
            } else { promises.push(true); }
        });

        return Promise.all(promises).then(() => this.waiting.pop());
    }
}

export const ContextFactory = (propTypes) => {

    return class FactoriedContext {

        static childContextTypes = propTypes;
        static propTypes = propTypes;

        getChildContext() {
            const res = {};
            for(let propname in propTypes) { res[propname] = this.props[propname]; }
            return res;
        }

        render() { return this.props.render(); }
    };

};
