'use strict';

import React from 'react';
import { EventEmitter } from 'events';

export class Watchable extends EventEmitter {

    constructor(...args) {
        super(...args);
        this.dispatching = [];
        this.waiting = [];
    }

    changed() { this.emit('change'); }

    isDispatching() { return this.dispatching.length > 0; }

    isWaiting() { return this.waiting.length > 0; }

    watch(cbk) {
        this.on('change', cbk);
        return () => this.removeListener('change', cbk);
    }

    listen(actions, event, cbk) {

        actions.on(event, (...args) => {
            this.dispatching.push(event);

            const res = cbk(...args);
            const ispromise = (typeof res === 'object' && typeof res.then === 'function');

            if(this.isWaiting() && !ispromise) {
                throw new Error('Store ' + this.constructor.name + ' waiting; action has to return a promise');
            }

            if(ispromise) {
                if(!this.isWaiting() || ispromise) {
                    res.then(() => {
                        this.dispatching.pop();
                        this.emit('dispatching:end', event);
                    });
                } else {
                    throw new Error('Store ' + this.constructor.name + ' waiting; action has to return a promise');
                }
            } else {
                this.dispatching.pop();
                this.emit('dispatching:end', event);
            }

            return res;
        });
    }

    wait(stores) {

        this.waiting.push(true);

        if(!(stores instanceof Array)) { stores = [stores]; }

        const promises = [];
        stores.map(store => {
            if(store.isDispatching()) {
                promises.push(new Promise(resolve => {
                    const cbk = () => {
                        store.removeListener('dispatching:end', cbk);
                        resolve();
                    };
                    store.on('dispatching:end', cbk);
                }));
            } else {
                promises.push(new Promise(resolve => resolve()));
            }
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
            for(let propname in propTypes) {
                res[propname] = this.props[propname];
            }
            return res;
        }

        render() {
            return (<div>{React.Children.map(
                this.props.children,
                (child) => <child.type {...child.props} />
            )}</div>);
        }
    };
};
