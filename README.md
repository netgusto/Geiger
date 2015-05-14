# Geiger
Tiny (<50 SLOC) flux implementation for ReactJS with Dependency Injection features.

Leverages React's contexts for passign dependencies automatically down the component tree.

For a full-scale implementation reference, have a look at [IdiomaticReact](https://github.com/netgusto/IdiomaticReact).

## Usage

```javascript
// main.js
'use strict';

import React from 'react/addons';

import { ContextFactory, Watchable } from 'geiger';
import TodoList from './TodoList';

// The Context component (think "Dependency Injection Container")
const Context = ContextFactory({
    todostore: React.PropTypes.object.isRequired,
    todoactions: React.PropTypes.object.isRequired
});

// Actions; just relay to the store, but can be much thicker
const todoactions = new (class extends Watchable {
    add(...args) { this.emit('add', ...args); }
    remove(...args) { this.emit('remove', ...args); }
})();

// Store (Mutable)
const todostore = new (class extends Watchable {

    constructor(actions, todos = []) {
        super();

        // action handlers
        actions.on('add', (todo) => { this.todos.push(todo); this.changed(); });

        actions.on('remove', (todo) => {
            const i = this.todos.indexOf(todo);
            if(i > -1) { delete this.todos[i]; this.changed(); }
        });

        this.todos = todos;
    }

    // Public API
    getAll() { return this.todos; }

})(todoactions, ['Todo One', 'Todo Two', 'Todo three']);

React.render((
    <Context todostore={todostore} todoactions={todoactions}>
        <TodoList />
    </Context>),
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
        this.unwatchTodo = this.context.todostore.watch(this.forceUpdate.bind(this));
    }

    // unwatching store changes
    componentWillUnmount() { this.unwatchTodo(); }

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

## Licence

MIT.

## Maintainer

@netgusto
