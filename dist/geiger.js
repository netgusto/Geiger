'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _events = require('events');

'use strict';

var Action = (function (_EventEmitter) {
    function Action() {
        _classCallCheck(this, Action);

        if (_EventEmitter != null) {
            _EventEmitter.apply(this, arguments);
        }
    }

    _inherits(Action, _EventEmitter);

    return Action;
})(_events.EventEmitter);

exports.Action = Action;

var Store = (function (_EventEmitter2) {
    function Store() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        _classCallCheck(this, Store);

        _get(Object.getPrototypeOf(Store.prototype), 'constructor', this).apply(this, args);
        this.dispatching = [];
        this.waiting = [];
    }

    _inherits(Store, _EventEmitter2);

    _createClass(Store, [{
        key: 'changed',
        value: function changed() {
            this.emit('change');
        }
    }, {
        key: 'watch',
        value: function watch(cbk) {
            var _this = this;

            this.on('change', cbk);
            return function () {
                return _this.removeListener('change', cbk);
            };
        }
    }, {
        key: 'isDispatching',
        value: function isDispatching() {
            return this.dispatching.length > 0;
        }
    }, {
        key: 'isWaiting',
        value: function isWaiting() {
            return this.waiting.length > 0;
        }
    }, {
        key: 'listen',
        value: function listen(actions, event, cbk) {
            var _this2 = this;

            if (typeof actions !== 'object' || typeof actions.on !== 'function') {
                throw new Error('Store ' + this.constructor.name + '.listen() method expects an EventEmitter-compatible object as a first parameter.');
            }

            actions.on(event, function () {
                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                //console.log(this.constructor.name + ':' + event + ':dispatching:begin');

                _this2.dispatching.push(event);

                var res = cbk.apply(undefined, args);
                var ispromise = typeof res === 'object' && typeof res.then === 'function';

                if (_this2.isWaiting() && !ispromise) {
                    throw new Error('Store ' + _this2.constructor.name + ' waiting; action has to return a promise');
                }

                if (ispromise) {
                    res.then(function () {
                        _this2.dispatching.pop();
                        _this2.emit('dispatching:end', event);
                        //console.log(this.constructor.name + ':' + event + ':dispatching:end');
                    });
                } else {
                    _this2.dispatching.pop();
                    _this2.emit('dispatching:end', event);
                    //console.log(this.constructor.name + ':' + event + ':dispatching:end');
                }

                return res;
            });
        }
    }, {
        key: 'wait',
        value: function wait(stores) {
            var _this3 = this;

            this.waiting.push(true);

            var promises = [];

            (stores instanceof Array ? stores : [stores]).map(function (store) {
                if (store.isDispatching()) {
                    promises.push(new Promise(function (resolve) {
                        return store.once('dispatching:end', resolve);
                    }));
                } else {
                    promises.push(true);
                }
            });

            return Promise.all(promises).then(function () {
                return _this3.waiting.pop();
            });
        }
    }]);

    return Store;
})(_events.EventEmitter);

exports.Store = Store;
var ContextFactory = function ContextFactory(propTypes) {

    return (function () {
        function FactoriedContext() {
            _classCallCheck(this, FactoriedContext);
        }

        _createClass(FactoriedContext, [{
            key: 'getChildContext',
            value: function getChildContext() {
                var res = {};
                for (var propname in propTypes) {
                    res[propname] = this.props[propname];
                }
                return res;
            }
        }, {
            key: 'render',
            value: function render() {
                return this.props.render();
            }
        }], [{
            key: 'childContextTypes',
            value: propTypes,
            enumerable: true
        }, {
            key: 'propTypes',
            value: propTypes,
            enumerable: true
        }]);

        return FactoriedContext;
    })();
};
exports.ContextFactory = ContextFactory;
//# sourceMappingURL=geiger.js.map