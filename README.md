# Geiger, the unfancy tool that does the job

Tiny (<100 SLOC), no-dependencies Flux implementation with store synchronization (waitFor) and Dependency Injection features.

Leverages React's (0.13+) contexts for injecting dependencies automatically down the component tree.

For a implementation reference, have a look at [Idiomatic React](https://github.com/netgusto/IdiomaticReact).

For a full-scale implementation reference, making use of **multiple synchronized stores**, have a look at [Idiomatic React Chat](https://github.com/netgusto/IdiomaticReact/tree/chat).

<a href="https://www.flickr.com/photos/redfiremg/3952257530" title="Victoreen CD-715 Model 1A by Jonathan Ferber, sur Flickr"><img src="https://c2.staticflickr.com/4/3455/3952257530_c274471191_z.jpg?zz=1" width="640" height="427" alt="Victoreen CD-715 Model 1A"></a>

## About Geiger

* **Dependency injection**: Services are injected in components, and so are relative to your application context, rather than being used as global services
* **No dispatcher**: rather than a central/global dispatcher, Geiger uses events and promises to manage the action flow, and to ensure that interdependent stores handle actions cooperatively
* **Readable source code**: the source code should be small enough to be readable, and so to serve as the primary source of documentation

## Installation

```bash
$ npm install --save geiger
```

## Usage

```javascript
// main.js
'use strict';

import React from 'react/addons';

import { ContextFactory, Action, Store } from 'geiger';
import TodoList from './TodoList';

// The Context component (think "Dependency Injection Container")
const Context = ContextFactory({
    todostore: React.PropTypes.object.isRequired,
    todoactions: React.PropTypes.object.isRequired
});

// Actions; just relay to the store, but can be much thicker
const todoactions = new (class extends Action {
    add(...args) { this.emit('add', ...args); }
    remove(...args) { this.emit('remove', ...args); }
})();

// Store (Mutable)
const todostore = new (class extends Store {

    constructor(actions, todos = []) {
        super();

        this.todos = todos;

        // action handlers
        this.listen(actions, 'add', (todo) => { this.todos.push(todo); this.changed(); });
    }

    // Public API
    getAll() { return this.todos; }

})(todoactions, ['Todo One', 'Todo Two', 'Todo three']);

React.render(
    (<Context
        todostore={todostore}
        todoactions={todoactions}
        render={() => <TodoList />} />),
    document.body
);
```

```javascript
//TodoList.js
'use strict';

import React from 'react/addons';

export default class TodoList extends React.Component {

    // declaring dependencies to inject; can be a subset of all the context
    static contextTypes = {
        todostore: React.PropTypes.object.isRequired,
        todoactions: React.PropTypes.object.isRequired
    };

    // watching store changes
    componentWillMount() {
        this.unwatch = [this.context.todostore.watch(this.forceUpdate.bind(this))];
    }

    // unwatching store changes
    componentWillUnmount() { this.unwatch.map(cbk => cbk()); }

    render() {
        const { todostore, todoactions } = this.context;

        return (
            <div>
                <h2>Todos</h2>

                <button onClick={() => todoactions.add('Another thing to do !')}>Add todo</button>

                <ul>
                    {todostore.getAll().map(todo => <li>{todo}</li>)}
                </ul>
            </div>
        );
    }
}

```

## Store synchronization

To synchronize store reaction to actions, use the `wait()` method of the store.

```javascript
'use strict';

import { Store } from 'geiger';

export default class StoreC extends Store {

    constructor({ actions, storea, storeb }) {
        super();

        this.listen(actions, 'createTodo', (todo) => {
            return this.wait([storea, storeb]).then(() => {
                doSomething(todo);
            });
        });
    }
}
```

In this example, `wait()` returns a promise that'll wait for all given stores to be idle, and that'll execute `then` when that happens. This promise has to be passed to Geiger (hence the `return`; this is asserted at runtime by Geiger, so no worries).

If you need to, you can `wait()` for stores that also `wait()` for other stores to complete their action handling.

## Licence

MIT.

## Maintainer

@netgusto
