'use strict';

import React from 'react/addons';
import { EventEmitter } from 'events';

export class Watchable extends EventEmitter {

    changed() { this.emit('change'); }

    watch(cbk) {
        this.on('change', cbk);
        return () => this.removeListener('change', cbk);
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
                (child) => React.addons.cloneWithProps(child, self.props)
            )}</div>);
        }
    };
};
