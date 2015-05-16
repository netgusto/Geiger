'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _reactAddons = require('react/addons');

var _reactAddons2 = _interopRequireDefault(_reactAddons);

var _events = require('events');

'use strict';

var Watchable = (function (_EventEmitter) {
    function Watchable() {
        _classCallCheck(this, Watchable);

        if (_EventEmitter != null) {
            _EventEmitter.apply(this, arguments);
        }
    }

    _inherits(Watchable, _EventEmitter);

    _createClass(Watchable, [{
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
    }]);

    return Watchable;
})(_events.EventEmitter);

exports.Watchable = Watchable;
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
                var _this2 = this;

                return _reactAddons2['default'].createElement(
                    'div',
                    null,
                    _reactAddons2['default'].Children.map(this.props.children, function (child) {
                        return _reactAddons2['default'].addons.cloneWithProps(child, _this2.props);
                    })
                );
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