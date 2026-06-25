this["dev-tools"] = (function () {
  'use strict';

  /**
   * A function that always returns `false`. Any passed in parameters are ignored.
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category Function
   * @sig * -> Boolean
   * @param {*}
   * @return {Boolean}
   * @see R.T
   * @example
   *
   *      R.F(); //=> false
   */
  var F$1 = function () {
    return false;
  };

  /**
   * A function that always returns `true`. Any passed in parameters are ignored.
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category Function
   * @sig * -> Boolean
   * @param {*}
   * @return {Boolean}
   * @see R.F
   * @example
   *
   *      R.T(); //=> true
   */
  var T = function () {
    return true;
  };

  /**
   * A special placeholder value used to specify "gaps" within curried functions,
   * allowing partial application of any combination of arguments, regardless of
   * their positions.
   *
   * If `g` is a curried ternary function and `_` is `R.__`, the following are
   * equivalent:
   *
   *   - `g(1, 2, 3)`
   *   - `g(_, 2, 3)(1)`
   *   - `g(_, _, 3)(1)(2)`
   *   - `g(_, _, 3)(1, 2)`
   *   - `g(_, 2, _)(1, 3)`
   *   - `g(_, 2)(1)(3)`
   *   - `g(_, 2)(1, 3)`
   *   - `g(_, 2)(_, 3)(1)`
   *
   * @name __
   * @constant
   * @memberOf R
   * @since v0.6.0
   * @category Function
   * @example
   *
   *      const greet = R.replace('{name}', R.__, 'Hello, {name}!');
   *      greet('Alice'); //=> 'Hello, Alice!'
   */
  var __ = {
    '@@functional/placeholder': true
  };

  function _isPlaceholder(a) {
    return a != null && typeof a === 'object' && a['@@functional/placeholder'] === true;
  }

  /**
   * Optimized internal one-arity curry function.
   *
   * @private
   * @category Function
   * @param {Function} fn The function to curry.
   * @return {Function} The curried function.
   */

  function _curry1(fn) {
    return function f1(a) {
      if (arguments.length === 0 || _isPlaceholder(a)) {
        return f1;
      } else {
        return fn.apply(this, arguments);
      }
    };
  }

  /**
   * Optimized internal two-arity curry function.
   *
   * @private
   * @category Function
   * @param {Function} fn The function to curry.
   * @return {Function} The curried function.
   */

  function _curry2(fn) {
    return function f2(a, b) {
      switch (arguments.length) {
        case 0:
          return f2;

        case 1:
          return _isPlaceholder(a) ? f2 : _curry1(function (_b) {
            return fn(a, _b);
          });

        default:
          return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function (_a) {
            return fn(_a, b);
          }) : _isPlaceholder(b) ? _curry1(function (_b) {
            return fn(a, _b);
          }) : fn(a, b);
      }
    };
  }

  /**
   * Adds two values.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Math
   * @sig Number -> Number -> Number
   * @param {Number} a
   * @param {Number} b
   * @return {Number}
   * @see R.subtract
   * @example
   *
   *      R.add(2, 3);       //=>  5
   *      R.add(7)(10);      //=> 17
   */

  var add =
  /*#__PURE__*/
  _curry2(function add(a, b) {
    return Number(a) + Number(b);
  });

  /**
   * Private `concat` function to merge two array-like objects.
   *
   * @private
   * @param {Array|Arguments} [set1=[]] An array-like object.
   * @param {Array|Arguments} [set2=[]] An array-like object.
   * @return {Array} A new, merged array.
   * @example
   *
   *      _concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
   */
  function _concat(set1, set2) {
    set1 = set1 || [];
    set2 = set2 || [];
    var idx;
    var len1 = set1.length;
    var len2 = set2.length;
    var result = [];
    idx = 0;

    while (idx < len1) {
      result[result.length] = set1[idx];
      idx += 1;
    }

    idx = 0;

    while (idx < len2) {
      result[result.length] = set2[idx];
      idx += 1;
    }

    return result;
  }

  function _arity(n, fn) {
    /* eslint-disable no-unused-vars */
    switch (n) {
      case 0:
        return function () {
          return fn.apply(this, arguments);
        };

      case 1:
        return function (a0) {
          return fn.apply(this, arguments);
        };

      case 2:
        return function (a0, a1) {
          return fn.apply(this, arguments);
        };

      case 3:
        return function (a0, a1, a2) {
          return fn.apply(this, arguments);
        };

      case 4:
        return function (a0, a1, a2, a3) {
          return fn.apply(this, arguments);
        };

      case 5:
        return function (a0, a1, a2, a3, a4) {
          return fn.apply(this, arguments);
        };

      case 6:
        return function (a0, a1, a2, a3, a4, a5) {
          return fn.apply(this, arguments);
        };

      case 7:
        return function (a0, a1, a2, a3, a4, a5, a6) {
          return fn.apply(this, arguments);
        };

      case 8:
        return function (a0, a1, a2, a3, a4, a5, a6, a7) {
          return fn.apply(this, arguments);
        };

      case 9:
        return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
          return fn.apply(this, arguments);
        };

      case 10:
        return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
          return fn.apply(this, arguments);
        };

      default:
        throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
    }
  }

  /**
   * Internal curryN function.
   *
   * @private
   * @category Function
   * @param {Number} length The arity of the curried function.
   * @param {Array} received An array of arguments received thus far.
   * @param {Function} fn The function to curry.
   * @return {Function} The curried function.
   */

  function _curryN(length, received, fn) {
    return function () {
      var combined = [];
      var argsIdx = 0;
      var left = length;
      var combinedIdx = 0;
      var hasPlaceholder = false;

      while (combinedIdx < received.length || argsIdx < arguments.length) {
        var result;

        if (combinedIdx < received.length && (!_isPlaceholder(received[combinedIdx]) || argsIdx >= arguments.length)) {
          result = received[combinedIdx];
        } else {
          result = arguments[argsIdx];
          argsIdx += 1;
        }

        combined[combinedIdx] = result;

        if (!_isPlaceholder(result)) {
          left -= 1;
        } else {
          hasPlaceholder = true;
        }

        combinedIdx += 1;
      }

      return !hasPlaceholder && left <= 0 ? fn.apply(this, combined) : _arity(Math.max(0, left), _curryN(length, combined, fn));
    };
  }

  /**
   * Returns a curried equivalent of the provided function, with the specified
   * arity. The curried function has two unusual capabilities. First, its
   * arguments needn't be provided one at a time. If `g` is `R.curryN(3, f)`, the
   * following are equivalent:
   *
   *   - `g(1)(2)(3)`
   *   - `g(1)(2, 3)`
   *   - `g(1, 2)(3)`
   *   - `g(1, 2, 3)`
   *
   * Secondly, the special placeholder value [`R.__`](#__) may be used to specify
   * "gaps", allowing partial application of any combination of arguments,
   * regardless of their positions. If `g` is as above and `_` is [`R.__`](#__),
   * the following are equivalent:
   *
   *   - `g(1, 2, 3)`
   *   - `g(_, 2, 3)(1)`
   *   - `g(_, _, 3)(1)(2)`
   *   - `g(_, _, 3)(1, 2)`
   *   - `g(_, 2)(1)(3)`
   *   - `g(_, 2)(1, 3)`
   *   - `g(_, 2)(_, 3)(1)`
   *
   * @func
   * @memberOf R
   * @since v0.5.0
   * @category Function
   * @sig Number -> (* -> a) -> (* -> a)
   * @param {Number} length The arity for the returned function.
   * @param {Function} fn The function to curry.
   * @return {Function} A new, curried function.
   * @see R.curry
   * @example
   *
   *      const sumArgs = (...args) => R.sum(args);
   *
   *      const curriedAddFourNumbers = R.curryN(4, sumArgs);
   *      const f = curriedAddFourNumbers(1, 2);
   *      const g = f(3);
   *      g(4); //=> 10
   */

  var curryN =
  /*#__PURE__*/
  _curry2(function curryN(length, fn) {
    if (length === 1) {
      return _curry1(fn);
    }

    return _arity(length, _curryN(length, [], fn));
  });

  /**
   * Creates a new list iteration function from an existing one by adding two new
   * parameters to its callback function: the current index, and the entire list.
   *
   * This would turn, for instance, [`R.map`](#map) function into one that
   * more closely resembles `Array.prototype.map`. Note that this will only work
   * for functions in which the iteration callback function is the first
   * parameter, and where the list is the last parameter. (This latter might be
   * unimportant if the list parameter is not used.)
   *
   * @func
   * @memberOf R
   * @since v0.15.0
   * @category Function
   * @category List
   * @sig (((a ...) -> b) ... -> [a] -> *) -> (((a ..., Int, [a]) -> b) ... -> [a] -> *)
   * @param {Function} fn A list iteration function that does not pass index or list to its callback
   * @return {Function} An altered list iteration function that passes (item, index, list) to its callback
   * @example
   *
   *      const mapIndexed = R.addIndex(R.map);
   *      mapIndexed((val, idx) => idx + '-' + val, ['f', 'o', 'o', 'b', 'a', 'r']);
   *      //=> ['0-f', '1-o', '2-o', '3-b', '4-a', '5-r']
   */

  var addIndex =
  /*#__PURE__*/
  _curry1(function addIndex(fn) {
    return curryN(fn.length, function () {
      var idx = 0;
      var origFn = arguments[0];
      var list = arguments[arguments.length - 1];
      var args = Array.prototype.slice.call(arguments, 0);

      args[0] = function () {
        var result = origFn.apply(this, _concat(arguments, [idx, list]));
        idx += 1;
        return result;
      };

      return fn.apply(this, args);
    });
  });

  /**
   * As with `addIndex`, `addIndexRight` creates a new list iteration function
   * from an existing one by adding two new parameters to its callback function:
   * the current index, and the entire list.
   *
   * Unlike `addIndex`, `addIndexRight` iterates from the right to the left.
   *
   * @func
   * @memberOf R
   * @since v0.29.0
   * @category Function
   * @category List
   * @sig ((a ... -> b) ... -> [a] -> *) -> (a ..., Int, [a] -> b) ... -> [a] -> *)
   * @param {Function} fn A list iteration function that does not pass index or list to its callback
   * @return {Function} An altered list iteration function that passes (item, index, list) to its callback
   * @example
   *
   *      const revmap = (fn, ary) => R.map(fn, R.reverse(ary));
   *      const revmapIndexed = R.addIndexRight(revmap);
   *      revmapIndexed((val, idx) => idx + '-' + val, ['f', 'o', 'o', 'b', 'a', 'r']);
   *      //=> [ '5-r', '4-a', '3-b', '2-o', '1-o', '0-f' ]
   */

  var addIndexRight =
  /*#__PURE__*/
  _curry1(function addIndex(fn) {
    return curryN(fn.length, function () {
      var origFn = arguments[0];
      var list = arguments[arguments.length - 1];
      var idx = list.length - 1;
      var args = Array.prototype.slice.call(arguments, 0);

      args[0] = function () {
        var result = origFn.apply(this, _concat(arguments, [idx, list]));
        idx -= 1;
        return result;
      };

      return fn.apply(this, args);
    });
  });

  /**
   * Optimized internal three-arity curry function.
   *
   * @private
   * @category Function
   * @param {Function} fn The function to curry.
   * @return {Function} The curried function.
   */

  function _curry3(fn) {
    return function f3(a, b, c) {
      switch (arguments.length) {
        case 0:
          return f3;

        case 1:
          return _isPlaceholder(a) ? f3 : _curry2(function (_b, _c) {
            return fn(a, _b, _c);
          });

        case 2:
          return _isPlaceholder(a) && _isPlaceholder(b) ? f3 : _isPlaceholder(a) ? _curry2(function (_a, _c) {
            return fn(_a, b, _c);
          }) : _isPlaceholder(b) ? _curry2(function (_b, _c) {
            return fn(a, _b, _c);
          }) : _curry1(function (_c) {
            return fn(a, b, _c);
          });

        default:
          return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3 : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function (_a, _b) {
            return fn(_a, _b, c);
          }) : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function (_a, _c) {
            return fn(_a, b, _c);
          }) : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function (_b, _c) {
            return fn(a, _b, _c);
          }) : _isPlaceholder(a) ? _curry1(function (_a) {
            return fn(_a, b, c);
          }) : _isPlaceholder(b) ? _curry1(function (_b) {
            return fn(a, _b, c);
          }) : _isPlaceholder(c) ? _curry1(function (_c) {
            return fn(a, b, _c);
          }) : fn(a, b, c);
      }
    };
  }

  /**
   * Applies a function to the value at the given index of an array, returning a
   * new copy of the array with the element at the given index replaced with the
   * result of the function application.
   *
   * @func
   * @memberOf R
   * @since v0.14.0
   * @category List
   * @sig Number -> (a -> a) -> [a] -> [a]
   * @param {Number} idx The index.
   * @param {Function} fn The function to apply.
   * @param {Array|Arguments} list An array-like object whose value
   *        at the supplied index will be replaced.
   * @return {Array} A copy of the supplied array-like object with
   *         the element at index `idx` replaced with the value
   *         returned by applying `fn` to the existing element.
   * @see R.update
   * @example
   *
   *      R.adjust(1, R.toUpper, ['a', 'b', 'c', 'd']);      //=> ['a', 'B', 'c', 'd']
   *      R.adjust(-1, R.toUpper, ['a', 'b', 'c', 'd']);     //=> ['a', 'b', 'c', 'D']
   * @symb R.adjust(-1, f, [a, b]) = [a, f(b)]
   * @symb R.adjust(0, f, [a, b]) = [f(a), b]
   */

  var adjust =
  /*#__PURE__*/
  _curry3(function adjust(idx, fn, list) {
    var len = list.length;

    if (idx >= len || idx < -len) {
      return list;
    }

    var _idx = (len + idx) % len;

    var _list = _concat(list);

    _list[_idx] = fn(list[_idx]);
    return _list;
  });

  /**
   * Tests whether or not an object is an array.
   *
   * @private
   * @param {*} val The object to test.
   * @return {Boolean} `true` if `val` is an array, `false` otherwise.
   * @example
   *
   *      _isArray([]); //=> true
   *      _isArray(null); //=> false
   *      _isArray({}); //=> false
   */
  var _isArray = Array.isArray || function _isArray(val) {
    return val != null && val.length >= 0 && Object.prototype.toString.call(val) === '[object Array]';
  };

  function _isTransformer(obj) {
    return obj != null && typeof obj['@@transducer/step'] === 'function';
  }

  /**
   * Returns a function that dispatches with different strategies based on the
   * object in list position (last argument). If it is an array, executes [fn].
   * Otherwise, if it has a function with one of the given method names, it will
   * execute that function (functor case). Otherwise, if it is a transformer,
   * uses transducer created by [transducerCreator] to return a new transformer
   * (transducer case).
   * Otherwise, it will default to executing [fn].
   *
   * @private
   * @param {Array} methodNames properties to check for a custom implementation
   * @param {Function} transducerCreator transducer factory if object is transformer
   * @param {Function} fn default ramda implementation
   * @return {Function} A function that dispatches on object in list position
   */

  function _dispatchable(methodNames, transducerCreator, fn) {
    return function () {
      if (arguments.length === 0) {
        return fn();
      }

      var obj = arguments[arguments.length - 1];

      if (!_isArray(obj)) {
        var idx = 0;

        while (idx < methodNames.length) {
          if (typeof obj[methodNames[idx]] === 'function') {
            return obj[methodNames[idx]].apply(obj, Array.prototype.slice.call(arguments, 0, -1));
          }

          idx += 1;
        }

        if (_isTransformer(obj)) {
          var transducer = transducerCreator.apply(null, Array.prototype.slice.call(arguments, 0, -1));
          return transducer(obj);
        }
      }

      return fn.apply(this, arguments);
    };
  }

  function _reduced(x) {
    return x && x['@@transducer/reduced'] ? x : {
      '@@transducer/value': x,
      '@@transducer/reduced': true
    };
  }

  var _xfBase = {
    init: function () {
      return this.xf['@@transducer/init']();
    },
    result: function (result) {
      return this.xf['@@transducer/result'](result);
    }
  };

  var XAll =
  /*#__PURE__*/
  function () {
    function XAll(f, xf) {
      this.xf = xf;
      this.f = f;
      this.all = true;
    }

    XAll.prototype['@@transducer/init'] = _xfBase.init;

    XAll.prototype['@@transducer/result'] = function (result) {
      if (this.all) {
        result = this.xf['@@transducer/step'](result, true);
      }

      return this.xf['@@transducer/result'](result);
    };

    XAll.prototype['@@transducer/step'] = function (result, input) {
      if (!this.f(input)) {
        this.all = false;
        result = _reduced(this.xf['@@transducer/step'](result, false));
      }

      return result;
    };

    return XAll;
  }();

  function _xall(f) {
    return function (xf) {
      return new XAll(f, xf);
    };
  }

  /**
   * Returns `true` if all elements of the list match the predicate, `false` if
   * there are any that don't.
   *
   * Dispatches to the `all` method of the second argument, if present.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig (a -> Boolean) -> [a] -> Boolean
   * @param {Function} fn The predicate function.
   * @param {Array} list The array to consider.
   * @return {Boolean} `true` if the predicate is satisfied by every element, `false`
   *         otherwise.
   * @see R.any, R.none, R.transduce
   * @example
   *
   *      const equals3 = R.equals(3);
   *      R.all(equals3)([3, 3, 3, 3]); //=> true
   *      R.all(equals3)([3, 3, 1, 3]); //=> false
   */

  var all =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable(['all'], _xall, function all(fn, list) {
    var idx = 0;

    while (idx < list.length) {
      if (!fn(list[idx])) {
        return false;
      }

      idx += 1;
    }

    return true;
  }));

  function _arrayFromIterator(iter) {
    var list = [];
    var next;

    while (!(next = iter.next()).done) {
      list.push(next.value);
    }

    return list;
  }

  function _includesWith(pred, x, list) {
    var idx = 0;
    var len = list.length;

    while (idx < len) {
      if (pred(x, list[idx])) {
        return true;
      }

      idx += 1;
    }

    return false;
  }

  function _functionName(f) {
    // String(x => x) evaluates to "x => x", so the pattern may not match.
    var match = String(f).match(/^function (\w*)/);
    return match == null ? '' : match[1];
  }

  function _has(prop, obj) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }

  // Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
  function _objectIs(a, b) {
    // SameValue algorithm
    if (a === b) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return a !== 0 || 1 / a === 1 / b;
    } else {
      // Step 6.a: NaN == NaN
      return a !== a && b !== b;
    }
  }

  var _objectIs$1 = typeof Object.is === 'function' ? Object.is : _objectIs;

  var toString$1 = Object.prototype.toString;

  var _isArguments =
  /*#__PURE__*/
  function () {
    return toString$1.call(arguments) === '[object Arguments]' ? function _isArguments(x) {
      return toString$1.call(x) === '[object Arguments]';
    } : function _isArguments(x) {
      return _has('callee', x);
    };
  }();

  var hasEnumBug = !
  /*#__PURE__*/
  {
    toString: null
  }.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString']; // Safari bug

  var hasArgsEnumBug =
  /*#__PURE__*/
  function () {

    return arguments.propertyIsEnumerable('length');
  }();

  var contains = function contains(list, item) {
    var idx = 0;

    while (idx < list.length) {
      if (list[idx] === item) {
        return true;
      }

      idx += 1;
    }

    return false;
  };
  /**
   * Returns a list containing the names of all the enumerable own properties of
   * the supplied object.
   * Note that the order of the output array is not guaranteed to be consistent
   * across different JS platforms.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Object
   * @sig {k: v} -> [k]
   * @param {Object} obj The object to extract properties from
   * @return {Array} An array of the object's own properties.
   * @see R.keysIn, R.values, R.toPairs
   * @example
   *
   *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
   */


  var keys = typeof Object.keys === 'function' && !hasArgsEnumBug ?
  /*#__PURE__*/
  _curry1(function keys(obj) {
    return Object(obj) !== obj ? [] : Object.keys(obj);
  }) :
  /*#__PURE__*/
  _curry1(function keys(obj) {
    if (Object(obj) !== obj) {
      return [];
    }

    var prop, nIdx;
    var ks = [];

    var checkArgsLength = hasArgsEnumBug && _isArguments(obj);

    for (prop in obj) {
      if (_has(prop, obj) && (!checkArgsLength || prop !== 'length')) {
        ks[ks.length] = prop;
      }
    }

    if (hasEnumBug) {
      nIdx = nonEnumerableProps.length - 1;

      while (nIdx >= 0) {
        prop = nonEnumerableProps[nIdx];

        if (_has(prop, obj) && !contains(ks, prop)) {
          ks[ks.length] = prop;
        }

        nIdx -= 1;
      }
    }

    return ks;
  });

  /**
   * Gives a single-word string description of the (native) type of a value,
   * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
   * attempt to distinguish user Object types any further, reporting them all as
   * 'Object'.
   *
   * @func
   * @memberOf R
   * @since v0.8.0
   * @category Type
   * @sig * -> String
   * @param {*} val The value to test
   * @return {String}
   * @example
   *
   *      R.type({}); //=> "Object"
   *      R.type(1); //=> "Number"
   *      R.type(false); //=> "Boolean"
   *      R.type('s'); //=> "String"
   *      R.type(null); //=> "Null"
   *      R.type([]); //=> "Array"
   *      R.type(/[A-z]/); //=> "RegExp"
   *      R.type(() => {}); //=> "Function"
   *      R.type(async () => {}); //=> "AsyncFunction"
   *      R.type(undefined); //=> "Undefined"
   */

  var type =
  /*#__PURE__*/
  _curry1(function type(val) {
    return val === null ? 'Null' : val === undefined ? 'Undefined' : Object.prototype.toString.call(val).slice(8, -1);
  });

  /**
   * private _uniqContentEquals function.
   * That function is checking equality of 2 iterator contents with 2 assumptions
   * - iterators lengths are the same
   * - iterators values are unique
   *
   * false-positive result will be returned for comparison of, e.g.
   * - [1,2,3] and [1,2,3,4]
   * - [1,1,1] and [1,2,3]
   * */

  function _uniqContentEquals(aIterator, bIterator, stackA, stackB) {
    var a = _arrayFromIterator(aIterator);

    var b = _arrayFromIterator(bIterator);

    function eq(_a, _b) {
      return _equals(_a, _b, stackA.slice(), stackB.slice());
    } // if *a* array contains any element that is not included in *b*


    return !_includesWith(function (b, aItem) {
      return !_includesWith(eq, aItem, b);
    }, b, a);
  }

  function _equals(a, b, stackA, stackB) {
    if (_objectIs$1(a, b)) {
      return true;
    }

    var typeA = type(a);

    if (typeA !== type(b)) {
      return false;
    }

    if (typeof a['fantasy-land/equals'] === 'function' || typeof b['fantasy-land/equals'] === 'function') {
      return typeof a['fantasy-land/equals'] === 'function' && a['fantasy-land/equals'](b) && typeof b['fantasy-land/equals'] === 'function' && b['fantasy-land/equals'](a);
    }

    if (typeof a.equals === 'function' || typeof b.equals === 'function') {
      return typeof a.equals === 'function' && a.equals(b) && typeof b.equals === 'function' && b.equals(a);
    }

    switch (typeA) {
      case 'Arguments':
      case 'Array':
      case 'Object':
        if (typeof a.constructor === 'function' && _functionName(a.constructor) === 'Promise') {
          return a === b;
        }

        break;

      case 'Boolean':
      case 'Number':
      case 'String':
        if (!(typeof a === typeof b && _objectIs$1(a.valueOf(), b.valueOf()))) {
          return false;
        }

        break;

      case 'Date':
        if (!_objectIs$1(a.valueOf(), b.valueOf())) {
          return false;
        }

        break;

      case 'Error':
        return a.name === b.name && a.message === b.message;

      case 'RegExp':
        if (!(a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.sticky === b.sticky && a.unicode === b.unicode)) {
          return false;
        }

        break;
    }

    var idx = stackA.length - 1;

    while (idx >= 0) {
      if (stackA[idx] === a) {
        return stackB[idx] === b;
      }

      idx -= 1;
    }

    switch (typeA) {
      case 'Map':
        if (a.size !== b.size) {
          return false;
        }

        return _uniqContentEquals(a.entries(), b.entries(), stackA.concat([a]), stackB.concat([b]));

      case 'Set':
        if (a.size !== b.size) {
          return false;
        }

        return _uniqContentEquals(a.values(), b.values(), stackA.concat([a]), stackB.concat([b]));

      case 'Arguments':
      case 'Array':
      case 'Object':
      case 'Boolean':
      case 'Number':
      case 'String':
      case 'Date':
      case 'Error':
      case 'RegExp':
      case 'Int8Array':
      case 'Uint8Array':
      case 'Uint8ClampedArray':
      case 'Int16Array':
      case 'Uint16Array':
      case 'Int32Array':
      case 'Uint32Array':
      case 'Float32Array':
      case 'Float64Array':
      case 'ArrayBuffer':
        break;

      default:
        // Values of other types are only equal if identical.
        return false;
    }

    var keysA = keys(a);

    if (keysA.length !== keys(b).length) {
      return false;
    }

    var extendedStackA = stackA.concat([a]);
    var extendedStackB = stackB.concat([b]);
    idx = keysA.length - 1;

    while (idx >= 0) {
      var key = keysA[idx];

      if (!(_has(key, b) && _equals(b[key], a[key], extendedStackA, extendedStackB))) {
        return false;
      }

      idx -= 1;
    }

    return true;
  }

  /**
   * Returns `true` if its arguments are equivalent, `false` otherwise. Handles
   * cyclical data structures.
   *
   * Dispatches symmetrically to the `equals` methods of both arguments, if
   * present.
   *
   * @func
   * @memberOf R
   * @since v0.15.0
   * @category Relation
   * @sig a -> b -> Boolean
   * @param {*} a
   * @param {*} b
   * @return {Boolean}
   * @example
   *
   *      R.equals(1, 1); //=> true
   *      R.equals(1, '1'); //=> false
   *      R.equals([1, 2, 3], [1, 2, 3]); //=> true
   *
   *      const a = {}; a.v = a;
   *      const b = {}; b.v = b;
   *      R.equals(a, b); //=> true
   */

  var equals =
  /*#__PURE__*/
  _curry2(function equals(a, b) {
    return _equals(a, b, [], []);
  });

  function _indexOf(list, a, idx) {
    var inf, item; // Array.prototype.indexOf doesn't exist below IE9

    if (typeof list.indexOf === 'function') {
      switch (typeof a) {
        case 'number':
          if (a === 0) {
            // manually crawl the list to distinguish between +0 and -0
            inf = 1 / a;

            while (idx < list.length) {
              item = list[idx];

              if (item === 0 && 1 / item === inf) {
                return idx;
              }

              idx += 1;
            }

            return -1;
          } else if (a !== a) {
            // NaN
            while (idx < list.length) {
              item = list[idx];

              if (typeof item === 'number' && item !== item) {
                return idx;
              }

              idx += 1;
            }

            return -1;
          } // non-zero numbers can utilise Set


          return list.indexOf(a, idx);
        // all these types can utilise Set

        case 'string':
        case 'boolean':
        case 'function':
        case 'undefined':
          return list.indexOf(a, idx);

        case 'object':
          if (a === null) {
            // null can utilise Set
            return list.indexOf(a, idx);
          }

      }
    } // anything else not covered above, defer to R.equals


    while (idx < list.length) {
      if (equals(list[idx], a)) {
        return idx;
      }

      idx += 1;
    }

    return -1;
  }

  function _includes(a, list) {
    return _indexOf(list, a, 0) >= 0;
  }

  function _map(fn, functor) {
    var idx = 0;
    var len = functor.length;
    var result = Array(len);

    while (idx < len) {
      result[idx] = fn(functor[idx]);
      idx += 1;
    }

    return result;
  }

  function _quote(s) {
    var escaped = s.replace(/\\/g, '\\\\').replace(/[\b]/g, '\\b') // \b matches word boundary; [\b] matches backspace
    .replace(/\f/g, '\\f').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/\v/g, '\\v').replace(/\0/g, '\\0');
    return '"' + escaped.replace(/"/g, '\\"') + '"';
  }

  /**
   * Polyfill from <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString>.
   */
  var pad = function pad(n) {
    return (n < 10 ? '0' : '') + n;
  };

  var _toISOString = typeof Date.prototype.toISOString === 'function' ? function _toISOString(d) {
    return d.toISOString();
  } : function _toISOString(d) {
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + '.' + (d.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) + 'Z';
  };

  function _complement(f) {
    return function () {
      return !f.apply(this, arguments);
    };
  }

  function _arrayReduce(reducer, acc, list) {
    var index = 0;
    var length = list.length;

    while (index < length) {
      acc = reducer(acc, list[index]);
      index += 1;
    }

    return acc;
  }

  function _filter(fn, list) {
    var idx = 0;
    var len = list.length;
    var result = [];

    while (idx < len) {
      if (fn(list[idx])) {
        result[result.length] = list[idx];
      }

      idx += 1;
    }

    return result;
  }

  function _isObject(x) {
    return Object.prototype.toString.call(x) === '[object Object]';
  }

  var XFilter =
  /*#__PURE__*/
  function () {
    function XFilter(f, xf) {
      this.xf = xf;
      this.f = f;
    }

    XFilter.prototype['@@transducer/init'] = _xfBase.init;
    XFilter.prototype['@@transducer/result'] = _xfBase.result;

    XFilter.prototype['@@transducer/step'] = function (result, input) {
      return this.f(input) ? this.xf['@@transducer/step'](result, input) : result;
    };

    return XFilter;
  }();

  function _xfilter(f) {
    return function (xf) {
      return new XFilter(f, xf);
    };
  }

  /**
   * Takes a predicate and a `Filterable`, and returns a new filterable of the
   * same type containing the members of the given filterable which satisfy the
   * given predicate. Filterable objects include plain objects or any object
   * that has a filter method such as `Array`.
   *
   * Dispatches to the `filter` method of the second argument, if present.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @category Object
   * @sig Filterable f => (a -> Boolean) -> f a -> f a
   * @param {Function} pred
   * @param {Array} filterable
   * @return {Array} Filterable
   * @see R.reject, R.transduce, R.addIndex
   * @example
   *
   *      const isEven = n => n % 2 === 0;
   *
   *      R.filter(isEven, [1, 2, 3, 4]); //=> [2, 4]
   *
   *      R.filter(isEven, {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, d: 4}
   */

  var filter =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable(['fantasy-land/filter', 'filter'], _xfilter, function (pred, filterable) {
    return _isObject(filterable) ? _arrayReduce(function (acc, key) {
      if (pred(filterable[key])) {
        acc[key] = filterable[key];
      }

      return acc;
    }, {}, keys(filterable)) : // else
    _filter(pred, filterable);
  }));

  /**
   * The complement of [`filter`](#filter).
   *
   * Acts as a transducer if a transformer is given in list position. Filterable
   * objects include plain objects or any object that has a filter method such
   * as `Array`.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig Filterable f => (a -> Boolean) -> f a -> f a
   * @param {Function} pred
   * @param {Array} filterable
   * @return {Array}
   * @see R.filter, R.transduce, R.addIndex
   * @example
   *
   *      const isOdd = (n) => n % 2 !== 0;
   *
   *      R.reject(isOdd, [1, 2, 3, 4]); //=> [2, 4]
   *
   *      R.reject(isOdd, {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, d: 4}
   */

  var reject =
  /*#__PURE__*/
  _curry2(function reject(pred, filterable) {
    return filter(_complement(pred), filterable);
  });

  function _toString(x, seen) {
    var recur = function recur(y) {
      var xs = seen.concat([x]);
      return _includes(y, xs) ? '<Circular>' : _toString(y, xs);
    }; //  mapPairs :: (Object, [String]) -> [String]


    var mapPairs = function (obj, keys) {
      return _map(function (k) {
        return _quote(k) + ': ' + recur(obj[k]);
      }, keys.slice().sort());
    };

    switch (Object.prototype.toString.call(x)) {
      case '[object Arguments]':
        return '(function() { return arguments; }(' + _map(recur, x).join(', ') + '))';

      case '[object Array]':
        return '[' + _map(recur, x).concat(mapPairs(x, reject(function (k) {
          return /^\d+$/.test(k);
        }, keys(x)))).join(', ') + ']';

      case '[object Boolean]':
        return typeof x === 'object' ? 'new Boolean(' + recur(x.valueOf()) + ')' : x.toString();

      case '[object Date]':
        return 'new Date(' + (isNaN(x.valueOf()) ? recur(NaN) : _quote(_toISOString(x))) + ')';

      case '[object Map]':
        return 'new Map(' + recur(Array.from(x)) + ')';

      case '[object Null]':
        return 'null';

      case '[object Number]':
        return typeof x === 'object' ? 'new Number(' + recur(x.valueOf()) + ')' : 1 / x === -Infinity ? '-0' : x.toString(10);

      case '[object Set]':
        return 'new Set(' + recur(Array.from(x).sort()) + ')';

      case '[object String]':
        return typeof x === 'object' ? 'new String(' + recur(x.valueOf()) + ')' : _quote(x);

      case '[object Undefined]':
        return 'undefined';

      default:
        if (typeof x.toString === 'function') {
          var repr = x.toString();

          if (repr !== '[object Object]') {
            return repr;
          }
        }

        return '{' + mapPairs(x, keys(x)).join(', ') + '}';
    }
  }

  /**
   * Returns the string representation of the given value. `eval`'ing the output
   * should result in a value equivalent to the input value. Many of the built-in
   * `toString` methods do not satisfy this requirement.
   *
   * If the given value is an `[object Object]` with a `toString` method other
   * than `Object.prototype.toString`, this method is invoked with no arguments
   * to produce the return value. This means user-defined constructor functions
   * can provide a suitable `toString` method. For example:
   *
   *     function Point(x, y) {
   *       this.x = x;
   *       this.y = y;
   *     }
   *
   *     Point.prototype.toString = function() {
   *       return 'new Point(' + this.x + ', ' + this.y + ')';
   *     };
   *
   *     R.toString(new Point(1, 2)); //=> 'new Point(1, 2)'
   *
   * @func
   * @memberOf R
   * @since v0.14.0
   * @category String
   * @sig * -> String
   * @param {*} val
   * @return {String}
   * @example
   *
   *      R.toString(42); //=> '42'
   *      R.toString('abc'); //=> '"abc"'
   *      R.toString([1, 2, 3]); //=> '[1, 2, 3]'
   *      R.toString({foo: 1, bar: 2, baz: 3}); //=> '{"bar": 2, "baz": 3, "foo": 1}'
   *      R.toString(new Date('2001-02-03T04:05:06Z')); //=> 'new Date("2001-02-03T04:05:06.000Z")'
   */

  var toString =
  /*#__PURE__*/
  _curry1(function toString(val) {
    return _toString(val, []);
  });

  /**
   * Returns the larger of its two arguments.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Relation
   * @sig Ord a => a -> a -> a
   * @param {*} a
   * @param {*} b
   * @return {*}
   * @see R.maxBy, R.min
   * @example
   *
   *      R.max(789, 123); //=> 789
   *      R.max('a', 'b'); //=> 'b'
   */

  var max =
  /*#__PURE__*/
  _curry2(function max(a, b) {
    if (a === b) {
      return b;
    }

    function safeMax(x, y) {
      if (x > y !== y > x) {
        return y > x ? y : x;
      }

      return undefined;
    }

    var maxByValue = safeMax(a, b);

    if (maxByValue !== undefined) {
      return maxByValue;
    }

    var maxByType = safeMax(typeof a, typeof b);

    if (maxByType !== undefined) {
      return maxByType === typeof a ? a : b;
    }

    var stringA = toString(a);
    var maxByStringValue = safeMax(stringA, toString(b));

    if (maxByStringValue !== undefined) {
      return maxByStringValue === stringA ? a : b;
    }

    return b;
  });

  var XMap =
  /*#__PURE__*/
  function () {
    function XMap(f, xf) {
      this.xf = xf;
      this.f = f;
    }

    XMap.prototype['@@transducer/init'] = _xfBase.init;
    XMap.prototype['@@transducer/result'] = _xfBase.result;

    XMap.prototype['@@transducer/step'] = function (result, input) {
      return this.xf['@@transducer/step'](result, this.f(input));
    };

    return XMap;
  }();

  var _xmap = function _xmap(f) {
    return function (xf) {
      return new XMap(f, xf);
    };
  };

  /**
   * Takes a function and
   * a [functor](https://github.com/fantasyland/fantasy-land#functor),
   * applies the function to each of the functor's values, and returns
   * a functor of the same shape.
   *
   * Ramda provides suitable `map` implementations for `Array` and `Object`,
   * so this function may be applied to `[1, 2, 3]` or `{x: 1, y: 2, z: 3}`.
   *
   * Dispatches to the `map` method of the second argument, if present.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * Also treats functions as functors and will compose them together.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig Functor f => (a -> b) -> f a -> f b
   * @param {Function} fn The function to be called on every element of the input `list`.
   * @param {Array} list The list to be iterated over.
   * @return {Array} The new list.
   * @see R.transduce, R.addIndex, R.pluck, R.project
   * @example
   *
   *      const double = x => x * 2;
   *
   *      R.map(double, [1, 2, 3]); //=> [2, 4, 6]
   *
   *      R.map(double, {x: 1, y: 2, z: 3}); //=> {x: 2, y: 4, z: 6}
   * @symb R.map(f, [a, b]) = [f(a), f(b)]
   * @symb R.map(f, { x: a, y: b }) = { x: f(a), y: f(b) }
   * @symb R.map(f, functor_o) = functor_o.map(f)
   */

  var map =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable(['fantasy-land/map', 'map'], _xmap, function map(fn, functor) {
    switch (Object.prototype.toString.call(functor)) {
      case '[object Function]':
        return curryN(functor.length, function () {
          return fn.call(this, functor.apply(this, arguments));
        });

      case '[object Object]':
        return _arrayReduce(function (acc, key) {
          acc[key] = fn(functor[key]);
          return acc;
        }, {}, keys(functor));

      default:
        return _map(fn, functor);
    }
  }));

  /**
   * Determine if the passed argument is an integer.
   *
   * @private
   * @param {*} n
   * @category Type
   * @return {Boolean}
   */
  var _isInteger = Number.isInteger || function _isInteger(n) {
    return n << 0 === n;
  };

  function _isString(x) {
    return Object.prototype.toString.call(x) === '[object String]';
  }

  /**
   * Returns the nth element of the given list or string. If n is negative the
   * element at index length + n is returned.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig Number -> [a] -> a | Undefined
   * @sig Number -> String -> String
   * @param {Number} offset
   * @param {*} list
   * @return {*}
   * @example
   *
   *      const list = ['foo', 'bar', 'baz', 'quux'];
   *      R.nth(1, list); //=> 'bar'
   *      R.nth(-1, list); //=> 'quux'
   *      R.nth(-99, list); //=> undefined
   *
   *      R.nth(2, 'abc'); //=> 'c'
   *      R.nth(3, 'abc'); //=> ''
   * @symb R.nth(-1, [a, b, c]) = c
   * @symb R.nth(0, [a, b, c]) = a
   * @symb R.nth(1, [a, b, c]) = b
   */

  var nth =
  /*#__PURE__*/
  _curry2(function nth(offset, list) {
    var idx = offset < 0 ? list.length + offset : offset;
    return _isString(list) ? list.charAt(idx) : list[idx];
  });

  /**
   * Returns a function that when supplied an object returns the indicated
   * property of that object, if it exists.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Object
   * @typedefn Idx = String | Int | Symbol
   * @sig Idx -> {s: a} -> a | Undefined
   * @param {String|Number} p The property name or array index
   * @param {Object} obj The object to query
   * @return {*} The value at `obj.p`.
   * @see R.path, R.props, R.pluck, R.project, R.nth
   * @example
   *
   *      R.prop('x', {x: 100}); //=> 100
   *      R.prop('x', {}); //=> undefined
   *      R.prop(0, [100]); //=> 100
   *      R.compose(R.inc, R.prop('x'))({ x: 3 }) //=> 4
   */

  var prop =
  /*#__PURE__*/
  _curry2(function prop(p, obj) {
    if (obj == null) {
      return;
    }

    return _isInteger(p) ? nth(p, obj) : obj[p];
  });

  /**
   * Returns a new list by plucking the same named property off all objects in
   * the list supplied.
   *
   * `pluck` will work on
   * any [functor](https://github.com/fantasyland/fantasy-land#functor) in
   * addition to arrays, as it is equivalent to `R.map(R.prop(k), f)`.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig Functor f => k -> f {k: v} -> f v
   * @param {Number|String} key The key name to pluck off of each object.
   * @param {Array} f The array or functor to consider.
   * @return {Array} The list of values for the given key.
   * @see R.project, R.prop, R.props
   * @example
   *
   *      var getAges = R.pluck('age');
   *      getAges([{name: 'fred', age: 29}, {name: 'wilma', age: 27}]); //=> [29, 27]
   *
   *      R.pluck(0, [[1, 2], [3, 4]]);               //=> [1, 3]
   *      R.pluck('val', {a: {val: 3}, b: {val: 5}}); //=> {a: 3, b: 5}
   * @symb R.pluck('x', [{x: 1, y: 2}, {x: 3, y: 4}, {x: 5, y: 6}]) = [1, 3, 5]
   * @symb R.pluck(0, [[1, 2], [3, 4], [5, 6]]) = [1, 3, 5]
   */

  var pluck =
  /*#__PURE__*/
  _curry2(function pluck(p, list) {
    return map(prop(p), list);
  });

  /**
   * Tests whether or not an object is similar to an array.
   *
   * @private
   * @category Type
   * @category List
   * @sig * -> Boolean
   * @param {*} x The object to test.
   * @return {Boolean} `true` if `x` has a numeric length property and extreme indices defined; `false` otherwise.
   * @example
   *
   *      _isArrayLike([]); //=> true
   *      _isArrayLike(true); //=> false
   *      _isArrayLike({}); //=> false
   *      _isArrayLike({length: 10}); //=> false
   *      _isArrayLike({0: 'zero', 9: 'nine', length: 10}); //=> true
   *      _isArrayLike({nodeType: 1, length: 1}) // => false
   */

  var _isArrayLike =
  /*#__PURE__*/
  _curry1(function isArrayLike(x) {
    if (_isArray(x)) {
      return true;
    }

    if (!x) {
      return false;
    }

    if (typeof x !== 'object') {
      return false;
    }

    if (_isString(x)) {
      return false;
    }

    if (x.length === 0) {
      return true;
    }

    if (x.length > 0) {
      return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
    }

    return false;
  });

  var symIterator = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';
  function _createReduce(arrayReduce, methodReduce, iterableReduce) {
    return function _reduce(xf, acc, list) {
      if (_isArrayLike(list)) {
        return arrayReduce(xf, acc, list);
      }

      if (list == null) {
        return acc;
      }

      if (typeof list['fantasy-land/reduce'] === 'function') {
        return methodReduce(xf, acc, list, 'fantasy-land/reduce');
      }

      if (list[symIterator] != null) {
        return iterableReduce(xf, acc, list[symIterator]());
      }

      if (typeof list.next === 'function') {
        return iterableReduce(xf, acc, list);
      }

      if (typeof list.reduce === 'function') {
        return methodReduce(xf, acc, list, 'reduce');
      }

      throw new TypeError('reduce: list must be array or iterable');
    };
  }

  function _xArrayReduce(xf, acc, list) {
    var idx = 0;
    var len = list.length;

    while (idx < len) {
      acc = xf['@@transducer/step'](acc, list[idx]);

      if (acc && acc['@@transducer/reduced']) {
        acc = acc['@@transducer/value'];
        break;
      }

      idx += 1;
    }

    return xf['@@transducer/result'](acc);
  }

  /**
   * Creates a function that is bound to a context.
   * Note: `R.bind` does not provide the additional argument-binding capabilities of
   * [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
   *
   * @func
   * @memberOf R
   * @since v0.6.0
   * @category Function
   * @category Object
   * @sig (* -> *) -> {*} -> (* -> *)
   * @param {Function} fn The function to bind to context
   * @param {Object} thisObj The context to bind `fn` to
   * @return {Function} A function that will execute in the context of `thisObj`.
   * @see R.partial
   * @example
   *
   *      const log = R.bind(console.log, console);
   *      R.pipe(R.assoc('a', 2), R.tap(log), R.assoc('a', 3))({a: 1}); //=> {a: 3}
   *      // logs {a: 2}
   * @symb R.bind(f, o)(a, b) = f.call(o, a, b)
   */

  var bind =
  /*#__PURE__*/
  _curry2(function bind(fn, thisObj) {
    return _arity(fn.length, function () {
      return fn.apply(thisObj, arguments);
    });
  });

  function _xIterableReduce(xf, acc, iter) {
    var step = iter.next();

    while (!step.done) {
      acc = xf['@@transducer/step'](acc, step.value);

      if (acc && acc['@@transducer/reduced']) {
        acc = acc['@@transducer/value'];
        break;
      }

      step = iter.next();
    }

    return xf['@@transducer/result'](acc);
  }

  function _xMethodReduce(xf, acc, obj, methodName) {
    return xf['@@transducer/result'](obj[methodName](bind(xf['@@transducer/step'], xf), acc));
  }

  var _xReduce =
  /*#__PURE__*/
  _createReduce(_xArrayReduce, _xMethodReduce, _xIterableReduce);

  var XWrap =
  /*#__PURE__*/
  function () {
    function XWrap(fn) {
      this.f = fn;
    }

    XWrap.prototype['@@transducer/init'] = function () {
      throw new Error('init not implemented on XWrap');
    };

    XWrap.prototype['@@transducer/result'] = function (acc) {
      return acc;
    };

    XWrap.prototype['@@transducer/step'] = function (acc, x) {
      return this.f(acc, x);
    };

    return XWrap;
  }();

  function _xwrap(fn) {
    return new XWrap(fn);
  }

  /**
   * Returns a single item by iterating through the list, successively calling
   * the iterator function and passing it an accumulator value and the current
   * value from the array, and then passing the result to the next call.
   *
   * The iterator function receives two values: *(acc, value)*. It may use
   * [`R.reduced`](#reduced) to shortcut the iteration.
   *
   * The arguments' order of [`reduceRight`](#reduceRight)'s iterator function
   * is *(value, acc)*.
   *
   * Note: `R.reduce` does not skip deleted or unassigned indices (sparse
   * arrays), unlike the native `Array.prototype.reduce` method. For more details
   * on this behavior, see:
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Description
   *
   * Be cautious of mutating and returning the accumulator. If you reuse it across
   * invocations, it will continue to accumulate onto the same value. The general
   * recommendation is to always return a new value. If you can't do so for
   * performance reasons, then be sure to reinitialize the accumulator on each
   * invocation.
   *
   * Dispatches to the `reduce` method of the third argument, if present. When
   * doing so, it is up to the user to handle the [`R.reduced`](#reduced)
   * shortcuting, as this is not implemented by `reduce`.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig ((a, b) -> a) -> a -> [b] -> a
   * @param {Function} fn The iterator function. Receives two values, the accumulator and the
   *        current element from the array.
   * @param {*} acc The accumulator value.
   * @param {Array} list The list to iterate over.
   * @return {*} The final, accumulated value.
   * @see R.reduced, R.addIndex, R.reduceRight
   * @example
   *
   *      R.reduce(R.subtract, 0, [1, 2, 3, 4]) // => ((((0 - 1) - 2) - 3) - 4) = -10
   *      //          -               -10
   *      //         / \              / \
   *      //        -   4           -6   4
   *      //       / \              / \
   *      //      -   3   ==>     -3   3
   *      //     / \              / \
   *      //    -   2           -1   2
   *      //   / \              / \
   *      //  0   1            0   1
   *
   * @symb R.reduce(f, a, [b, c, d]) = f(f(f(a, b), c), d)
   */

  var reduce =
  /*#__PURE__*/
  _curry3(function (xf, acc, list) {
    return _xReduce(typeof xf === 'function' ? _xwrap(xf) : xf, acc, list);
  });

  /**
   * Takes a list of predicates and returns a predicate that returns true for a
   * given list of arguments if every one of the provided predicates is satisfied
   * by those arguments.
   *
   * The function returned is a curried function whose arity matches that of the
   * highest-arity predicate.
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category Logic
   * @sig [(*... -> Boolean)] -> (*... -> Boolean)
   * @param {Array} predicates An array of predicates to check
   * @return {Function} The combined predicate
   * @see R.anyPass, R.both
   * @example
   *
   *      const isQueen = R.propEq('Q', 'rank');
   *      const isSpade = R.propEq('♠︎', 'suit');
   *      const isQueenOfSpades = R.allPass([isQueen, isSpade]);
   *
   *      isQueenOfSpades({rank: 'Q', suit: '♣︎'}); //=> false
   *      isQueenOfSpades({rank: 'Q', suit: '♠︎'}); //=> true
   */

  var allPass =
  /*#__PURE__*/
  _curry1(function allPass(preds) {
    return curryN(reduce(max, 0, pluck('length', preds)), function () {
      var idx = 0;
      var len = preds.length;

      while (idx < len) {
        if (!preds[idx].apply(this, arguments)) {
          return false;
        }

        idx += 1;
      }

      return true;
    });
  });

  /**
   * Returns a function that always returns the given value. Note that for
   * non-primitives the value returned is a reference to the original value.
   *
   * This function is known as `const`, `constant`, or `K` (for K combinator) in
   * other languages and libraries.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Function
   * @sig a -> (* -> a)
   * @param {*} val The value to wrap in a function
   * @return {Function} A Function :: * -> val.
   * @example
   *
   *      const t = R.always('Tee');
   *      t(); //=> 'Tee'
   */

  var always =
  /*#__PURE__*/
  _curry1(function always(val) {
    return function () {
      return val;
    };
  });

  /**
   * Returns the first argument if it is falsy, otherwise the second argument.
   * Acts as the boolean `and` statement if both inputs are `Boolean`s.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Logic
   * @sig a -> b -> a | b
   * @param {Any} a
   * @param {Any} b
   * @return {Any}
   * @see R.both, R.or
   * @example
   *
   *      R.and(true, true); //=> true
   *      R.and(true, false); //=> false
   *      R.and(false, true); //=> false
   *      R.and(false, false); //=> false
   */

  var and =
  /*#__PURE__*/
  _curry2(function and(a, b) {
    return a && b;
  });

  var XAny =
  /*#__PURE__*/
  function () {
    function XAny(f, xf) {
      this.xf = xf;
      this.f = f;
      this.any = false;
    }

    XAny.prototype['@@transducer/init'] = _xfBase.init;

    XAny.prototype['@@transducer/result'] = function (result) {
      if (!this.any) {
        result = this.xf['@@transducer/step'](result, false);
      }

      return this.xf['@@transducer/result'](result);
    };

    XAny.prototype['@@transducer/step'] = function (result, input) {
      if (this.f(input)) {
        this.any = true;
        result = _reduced(this.xf['@@transducer/step'](result, true));
      }

      return result;
    };

    return XAny;
  }();

  function _xany(f) {
    return function (xf) {
      return new XAny(f, xf);
    };
  }

  /**
   * Returns `true` if at least one of the elements of the list match the predicate,
   * `false` otherwise.
   *
   * Dispatches to the `any` method of the second argument, if present.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig (a -> Boolean) -> [a] -> Boolean
   * @param {Function} fn The predicate function.
   * @param {Array} list The array to consider.
   * @return {Boolean} `true` if the predicate is satisfied by at least one element, `false`
   *         otherwise.
   * @see R.all, R.none, R.transduce
   * @example
   *
   *      const lessThan0 = R.flip(R.lt)(0);
   *      const lessThan2 = R.flip(R.lt)(2);
   *      R.any(lessThan0)([1, 2]); //=> false
   *      R.any(lessThan2)([1, 2]); //=> true
   */

  var any =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable(['any'], _xany, function any(fn, list) {
    var idx = 0;

    while (idx < list.length) {
      if (fn(list[idx])) {
        return true;
      }

      idx += 1;
    }

    return false;
  }));

  /**
   * Takes a list of predicates and returns a predicate that returns true for a
   * given list of arguments if at least one of the provided predicates is
   * satisfied by those arguments.
   *
   * The function returned is a curried function whose arity matches that of the
   * highest-arity predicate.
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category Logic
   * @sig [(*... -> Boolean)] -> (*... -> Boolean)
   * @param {Array} predicates An array of predicates to check
   * @return {Function} The combined predicate
   * @see R.allPass, R.either
   * @example
   *
   *      const isClub = R.propEq('♣', 'suit');
   *      const isSpade = R.propEq('♠', 'suit');
   *      const isBlackCard = R.anyPass([isClub, isSpade]);
   *
   *      isBlackCard({rank: '10', suit: '♣'}); //=> true
   *      isBlackCard({rank: 'Q', suit: '♠'}); //=> true
   *      isBlackCard({rank: 'Q', suit: '♦'}); //=> false
   */

  var anyPass =
  /*#__PURE__*/
  _curry1(function anyPass(preds) {
    return curryN(reduce(max, 0, pluck('length', preds)), function () {
      var idx = 0;
      var len = preds.length;

      while (idx < len) {
        if (preds[idx].apply(this, arguments)) {
          return true;
        }

        idx += 1;
      }

      return false;
    });
  });

  function _iterableReduce(reducer, acc, iter) {
    var step = iter.next();

    while (!step.done) {
      acc = reducer(acc, step.value);
      step = iter.next();
    }

    return acc;
  }

  function _methodReduce(reducer, acc, obj, methodName) {
    return obj[methodName](reducer, acc);
  }

  var _reduce =
  /*#__PURE__*/
  _createReduce(_arrayReduce, _methodReduce, _iterableReduce);

  /**
   * ap applies a list of functions to a list of values.
   *
   * Dispatches to the `ap` method of the first argument, if present. Also
   * treats curried functions as applicatives.
   *
   * @func
   * @memberOf R
   * @since v0.3.0
   * @category Function
   * @sig [a -> b] -> [a] -> [b]
   * @sig Apply f => f (a -> b) -> f a -> f b
   * @sig (r -> a -> b) -> (r -> a) -> (r -> b)
   * @param {*} applyF
   * @param {*} applyX
   * @return {*}
   * @example
   *
   *      R.ap([R.multiply(2), R.add(3)], [1,2,3]); //=> [2, 4, 6, 4, 5, 6]
   *      R.ap([R.concat('tasty '), R.toUpper], ['pizza', 'salad']); //=> ["tasty pizza", "tasty salad", "PIZZA", "SALAD"]
   *
   *      // R.ap can also be used as S combinator
   *      // when only two functions are passed
   *      R.ap(R.concat, R.toUpper)('Ramda') //=> 'RamdaRAMDA'
   * @symb R.ap([f, g], [a, b]) = [f(a), f(b), g(a), g(b)]
   */

  var ap =
  /*#__PURE__*/
  _curry2(function ap(applyF, applyX) {
    return typeof applyX['fantasy-land/ap'] === 'function' ? applyX['fantasy-land/ap'](applyF) : typeof applyF.ap === 'function' ? applyF.ap(applyX) : typeof applyF === 'function' ? function (x) {
      return applyF(x)(applyX(x));
    } : _reduce(function (acc, f) {
      return _concat(acc, map(f, applyX));
    }, [], applyF);
  });

  function _aperture(n, list) {
    var idx = 0;
    var limit = list.length - (n - 1);
    var acc = new Array(limit >= 0 ? limit : 0);

    while (idx < limit) {
      acc[idx] = Array.prototype.slice.call(list, idx, idx + n);
      idx += 1;
    }

    return acc;
  }

  var XAperture =
  /*#__PURE__*/
  function () {
    function XAperture(n, xf) {
      this.xf = xf;
      this.pos = 0;
      this.full = false;
      this.acc = new Array(n);
    }

    XAperture.prototype['@@transducer/init'] = _xfBase.init;

    XAperture.prototype['@@transducer/result'] = function (result) {
      this.acc = null;
      return this.xf['@@transducer/result'](result);
    };

    XAperture.prototype['@@transducer/step'] = function (result, input) {
      this.store(input);
      return this.full ? this.xf['@@transducer/step'](result, this.getCopy()) : result;
    };

    XAperture.prototype.store = function (input) {
      this.acc[this.pos] = input;
      this.pos += 1;

      if (this.pos === this.acc.length) {
        this.pos = 0;
        this.full = true;
      }
    };

    XAperture.prototype.getCopy = function () {
      return _concat(Array.prototype.slice.call(this.acc, this.pos), Array.prototype.slice.call(this.acc, 0, this.pos));
    };

    return XAperture;
  }();

  function _xaperture(n) {
    return function (xf) {
      return new XAperture(n, xf);
    };
  }

  /**
   * Returns a new list, composed of n-tuples of consecutive elements. If `n` is
   * greater than the length of the list, an empty list is returned.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.12.0
   * @category List
   * @sig Number -> [a] -> [[a]]
   * @param {Number} n The size of the tuples to create
   * @param {Array} list The list to split into `n`-length tuples
   * @return {Array} The resulting list of `n`-length tuples
   * @see R.transduce
   * @example
   *
   *      R.aperture(2, [1, 2, 3, 4, 5]); //=> [[1, 2], [2, 3], [3, 4], [4, 5]]
   *      R.aperture(3, [1, 2, 3, 4, 5]); //=> [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
   *      R.aperture(7, [1, 2, 3, 4, 5]); //=> []
   */

  var aperture =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable([], _xaperture, _aperture));

  /**
   * Returns a new list containing the contents of the given list, followed by
   * the given element.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig a -> [a] -> [a]
   * @param {*} el The element to add to the end of the new list.
   * @param {Array} list The list of elements to add a new item to.
   *        list.
   * @return {Array} A new list containing the elements of the old list followed by `el`.
   * @see R.prepend
   * @example
   *
   *      R.append('tests', ['write', 'more']); //=> ['write', 'more', 'tests']
   *      R.append('tests', []); //=> ['tests']
   *      R.append(['tests'], ['write', 'more']); //=> ['write', 'more', ['tests']]
   */

  var append =
  /*#__PURE__*/
  _curry2(function append(el, list) {
    return _concat(list, [el]);
  });

  /**
   * Applies function `fn` to the argument list `args`. This is useful for
   * creating a fixed-arity function from a variadic function. `fn` should be a
   * bound function if context is significant.
   *
   * @func
   * @memberOf R
   * @since v0.7.0
   * @category Function
   * @sig (*... -> a) -> [*] -> a
   * @param {Function} fn The function which will be called with `args`
   * @param {Array} args The arguments to call `fn` with
   * @return {*} result The result, equivalent to `fn(...args)`
   * @see R.call, R.unapply
   * @example
   *
   *      const nums = [1, 2, 3, -99, 42, 6, 7];
   *      R.apply(Math.max, nums); //=> 42
   * @symb R.apply(f, [a, b, c]) = f(a, b, c)
   */

  var apply =
  /*#__PURE__*/
  _curry2(function apply(fn, args) {
    return fn.apply(this, args);
  });

  /**
   * Returns a list of all the enumerable own properties of the supplied object.
   * Note that the order of the output array is not guaranteed across different
   * JS platforms.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Object
   * @sig {k: v} -> [v]
   * @param {Object} obj The object to extract values from
   * @return {Array} An array of the values of the object's own properties.
   * @see R.valuesIn, R.keys, R.toPairs
   * @example
   *
   *      R.values({a: 1, b: 2, c: 3}); //=> [1, 2, 3]
   */

  var values =
  /*#__PURE__*/
  _curry1(function values(obj) {
    var props = keys(obj);
    var len = props.length;
    var vals = [];
    var idx = 0;

    while (idx < len) {
      vals[idx] = obj[props[idx]];
      idx += 1;
    }

    return vals;
  });

  // delegating calls to .map

  function mapValues(fn, obj) {
    return _isArray(obj) ? obj.map(fn) : keys(obj).reduce(function (acc, key) {
      acc[key] = fn(obj[key]);
      return acc;
    }, {});
  }
  /**
   * Given a spec object recursively mapping properties to functions, creates a
   * function producing an object of the same structure, by mapping each property
   * to the result of calling its associated function with the supplied arguments.
   *
   * @func
   * @memberOf R
   * @since v0.20.0
   * @category Function
   * @sig {k: ((a, b, ..., m) -> v)} -> ((a, b, ..., m) -> {k: v})
   * @param {Object} spec an object recursively mapping properties to functions for
   *        producing the values for these properties.
   * @return {Function} A function that returns an object of the same structure
   * as `spec', with each property set to the value returned by calling its
   * associated function with the supplied arguments.
   * @see R.converge, R.juxt
   * @example
   *
   *      const getMetrics = R.applySpec({
   *        sum: R.add,
   *        nested: { mul: R.multiply }
   *      });
   *      getMetrics(2, 4); // => { sum: 6, nested: { mul: 8 } }
   * @symb R.applySpec({ x: f, y: { z: g } })(a, b) = { x: f(a, b), y: { z: g(a, b) } }
   */


  var applySpec =
  /*#__PURE__*/
  _curry1(function applySpec(spec) {
    spec = mapValues(function (v) {
      return typeof v == 'function' ? v : applySpec(v);
    }, spec);
    return curryN(reduce(max, 0, pluck('length', values(spec))), function () {
      var args = arguments;
      return mapValues(function (f) {
        return apply(f, args);
      }, spec);
    });
  });

  /**
   * Takes a value and applies a function to it.
   *
   * This function is also known as the `thrush` combinator.
   *
   * @func
   * @memberOf R
   * @since v0.25.0
   * @category Function
   * @sig a -> (a -> b) -> b
   * @param {*} x The value
   * @param {Function} f The function to apply
   * @return {*} The result of applying `f` to `x`
   * @example
   *
   *      const t42 = R.applyTo(42);
   *      t42(R.identity); //=> 42
   *      t42(R.add(1)); //=> 43
   */

  var applyTo =
  /*#__PURE__*/
  _curry2(function applyTo(x, f) {
    return f(x);
  });

  /**
   * Makes an ascending comparator function out of a function that returns a value
   * that can be compared with `<` and `>`.
   *
   * @func
   * @memberOf R
   * @since v0.23.0
   * @category Function
   * @sig Ord b => (a -> b) -> a -> a -> Number
   * @param {Function} fn A function of arity one that returns a value that can be compared
   * @param {*} a The first item to be compared.
   * @param {*} b The second item to be compared.
   * @return {Number} `-1` if fn(a) < fn(b), `1` if fn(b) < fn(a), otherwise `0`
   * @see R.descend
   * @example
   *
   *      const byAge = R.ascend(R.prop('age'));
   *      const people = [
   *        { name: 'Emma', age: 70 },
   *        { name: 'Peter', age: 78 },
   *        { name: 'Mikhail', age: 62 },
   *      ];
   *      const peopleByYoungestFirst = R.sort(byAge, people);
   *        //=> [{ name: 'Mikhail', age: 62 },{ name: 'Emma', age: 70 }, { name: 'Peter', age: 78 }]
   */

  var ascend =
  /*#__PURE__*/
  _curry3(function ascend(fn, a, b) {
    var aa = fn(a);
    var bb = fn(b);
    return aa < bb ? -1 : aa > bb ? 1 : 0;
  });

  /**
   * Makes a shallow clone of an object, setting or overriding the specified
   * property with the given value. Note that this copies and flattens prototype
   * properties onto the new object as well. All non-primitive properties are
   * copied by reference.
   *
   * @private
   * @param {String|Number} prop The property name to set
   * @param {*} val The new value
   * @param {Object|Array} obj The object to clone
   * @return {Object|Array} A new object equivalent to the original except for the changed property.
   */

  function _assoc(prop, val, obj) {
    if (_isInteger(prop) && _isArray(obj)) {
      var arr = [].concat(obj);
      arr[prop] = val;
      return arr;
    }

    var result = {};

    for (var p in obj) {
      result[p] = obj[p];
    }

    result[prop] = val;
    return result;
  }

  /**
   * Checks if the input value is `null` or `undefined`.
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category Type
   * @sig * -> Boolean
   * @param {*} x The value to test.
   * @return {Boolean} `true` if `x` is `undefined` or `null`, otherwise `false`.
   * @example
   *
   *      R.isNil(null); //=> true
   *      R.isNil(undefined); //=> true
   *      R.isNil(0); //=> false
   *      R.isNil([]); //=> false
   */

  var isNil =
  /*#__PURE__*/
  _curry1(function isNil(x) {
    return x == null;
  });

  /**
   * Makes a shallow clone of an object, setting or overriding the nodes required
   * to create the given path, and placing the specific value at the tail end of
   * that path. Note that this copies and flattens prototype properties onto the
   * new object as well. All non-primitive properties are copied by reference.
   *
   * @func
   * @memberOf R
   * @since v0.8.0
   * @category Object
   * @typedefn Idx = String | Int | Symbol
   * @sig [Idx] -> a -> {a} -> {a}
   * @param {Array} path the path to set
   * @param {*} val The new value
   * @param {Object} obj The object to clone
   * @return {Object} A new object equivalent to the original except along the specified path.
   * @see R.dissocPath
   * @example
   *
   *      R.assocPath(['a', 'b', 'c'], 42, {a: {b: {c: 0}}}); //=> {a: {b: {c: 42}}}
   *
   *      // Any missing or non-object keys in path will be overridden
   *      R.assocPath(['a', 'b', 'c'], 42, {a: 5}); //=> {a: {b: {c: 42}}}
   */

  var assocPath =
  /*#__PURE__*/
  _curry3(function assocPath(path, val, obj) {
    if (path.length === 0) {
      return val;
    }

    var idx = path[0];

    if (path.length > 1) {
      var nextObj = !isNil(obj) && _has(idx, obj) && typeof obj[idx] === 'object' ? obj[idx] : _isInteger(path[1]) ? [] : {};
      val = assocPath(Array.prototype.slice.call(path, 1), val, nextObj);
    }

    return _assoc(idx, val, obj);
  });

  /**
   * Makes a shallow clone of an object, setting or overriding the specified
   * property with the given value. Note that this copies and flattens prototype
   * properties onto the new object as well. All non-primitive properties are
   * copied by reference.
   *
   * @func
   * @memberOf R
   * @since v0.8.0
   * @category Object
   * @typedefn Idx = String | Int
   * @sig Idx -> a -> {k: v} -> {k: v}
   * @param {String|Number} prop The property name to set
   * @param {*} val The new value
   * @param {Object} obj The object to clone
   * @return {Object} A new object equivalent to the original except for the changed property.
   * @see R.dissoc, R.pick
   * @example
   *
   *      R.assoc('c', 3, {a: 1, b: 2}); //=> {a: 1, b: 2, c: 3}
   */

  var assoc =
  /*#__PURE__*/
  _curry3(function assoc(prop, val, obj) {
    return assocPath([prop], val, obj);
  });

  /**
   * Wraps a function of any arity (including nullary) in a function that accepts
   * exactly `n` parameters. Any extraneous parameters will not be passed to the
   * supplied function.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Function
   * @sig Number -> (* -> a) -> (* -> a)
   * @param {Number} n The desired arity of the new function.
   * @param {Function} fn The function to wrap.
   * @return {Function} A new function wrapping `fn`. The new function is guaranteed to be of
   *         arity `n`.
   * @see R.binary, R.unary
   * @example
   *
   *      const takesTwoArgs = (a, b) => [a, b];
   *
   *      takesTwoArgs.length; //=> 2
   *      takesTwoArgs(1, 2); //=> [1, 2]
   *
   *      const takesOneArg = R.nAry(1, takesTwoArgs);
   *      takesOneArg.length; //=> 1
   *      // Only `n` arguments are passed to the wrapped function
   *      takesOneArg(1, 2); //=> [1, undefined]
   * @symb R.nAry(0, f)(a, b) = f()
   * @symb R.nAry(1, f)(a, b) = f(a)
   * @symb R.nAry(2, f)(a, b) = f(a, b)
   */

  var nAry =
  /*#__PURE__*/
  _curry2(function nAry(n, fn) {
    switch (n) {
      case 0:
        return function () {
          return fn.call(this);
        };

      case 1:
        return function (a0) {
          return fn.call(this, a0);
        };

      case 2:
        return function (a0, a1) {
          return fn.call(this, a0, a1);
        };

      case 3:
        return function (a0, a1, a2) {
          return fn.call(this, a0, a1, a2);
        };

      case 4:
        return function (a0, a1, a2, a3) {
          return fn.call(this, a0, a1, a2, a3);
        };

      case 5:
        return function (a0, a1, a2, a3, a4) {
          return fn.call(this, a0, a1, a2, a3, a4);
        };

      case 6:
        return function (a0, a1, a2, a3, a4, a5) {
          return fn.call(this, a0, a1, a2, a3, a4, a5);
        };

      case 7:
        return function (a0, a1, a2, a3, a4, a5, a6) {
          return fn.call(this, a0, a1, a2, a3, a4, a5, a6);
        };

      case 8:
        return function (a0, a1, a2, a3, a4, a5, a6, a7) {
          return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7);
        };

      case 9:
        return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
          return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8);
        };

      case 10:
        return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
          return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
        };

      default:
        throw new Error('First argument to nAry must be a non-negative integer no greater than ten');
    }
  });

  /**
   * Wraps a function of any arity (including nullary) in a function that accepts
   * exactly 2 parameters. Any extraneous parameters will not be passed to the
   * supplied function.
   *
   * @func
   * @memberOf R
   * @since v0.2.0
   * @category Function
   * @sig (a -> b -> c -> ... -> z) -> ((a, b) -> z)
   * @param {Function} fn The function to wrap.
   * @return {Function} A new function wrapping `fn`. The new function is guaranteed to be of
   *         arity 2.
   * @see R.nAry, R.unary
   * @example
   *
   *      const takesThreeArgs = function(a, b, c) {
   *        return [a, b, c];
   *      };
   *      takesThreeArgs.length; //=> 3
   *      takesThreeArgs(1, 2, 3); //=> [1, 2, 3]
   *
   *      const takesTwoArgs = R.binary(takesThreeArgs);
   *      takesTwoArgs.length; //=> 2
   *      // Only 2 arguments are passed to the wrapped function
   *      takesTwoArgs(1, 2, 3); //=> [1, 2, undefined]
   * @symb R.binary(f)(a, b, c) = f(a, b)
   */

  var binary =
  /*#__PURE__*/
  _curry1(function binary(fn) {
    return nAry(2, fn);
  });

  function _isFunction(x) {
    var type = Object.prototype.toString.call(x);
    return type === '[object Function]' || type === '[object AsyncFunction]' || type === '[object GeneratorFunction]' || type === '[object AsyncGeneratorFunction]';
  }

  /**
   * "lifts" a function to be the specified arity, so that it may "map over" that
   * many lists, Functions or other objects that satisfy the [FantasyLand Apply spec](https://github.com/fantasyland/fantasy-land#apply).
   *
   * @func
   * @memberOf R
   * @since v0.7.0
   * @category Function
   * @sig Number -> (*... -> *) -> ([*]... -> [*])
   * @param {Function} fn The function to lift into higher context
   * @return {Function} The lifted function.
   * @see R.lift, R.ap
   * @example
   *
   *      const madd3 = R.liftN(3, (...args) => R.sum(args));
   *      madd3([1,2,3], [1,2,3], [1]); //=> [3, 4, 5, 4, 5, 6, 5, 6, 7]
   */

  var liftN =
  /*#__PURE__*/
  _curry2(function liftN(arity, fn) {
    var lifted = curryN(arity, fn);
    return curryN(arity, function () {
      return _arrayReduce(ap, map(lifted, arguments[0]), Array.prototype.slice.call(arguments, 1));
    });
  });

  /**
   * "lifts" a function of arity >= 1 so that it may "map over" a list, Function or other
   * object that satisfies the [FantasyLand Apply spec](https://github.com/fantasyland/fantasy-land#apply).
   *
   * @func
   * @memberOf R
   * @since v0.7.0
   * @category Function
   * @sig (*... -> *) -> ([*]... -> [*])
   * @param {Function} fn The function to lift into higher context
   * @return {Function} The lifted function.
   * @see R.liftN
   * @example
   *
   *      const madd3 = R.lift((a, b, c) => a + b + c);
   *
   *      madd3([100, 200], [30, 40], [5, 6, 7]); //=> [135, 136, 137, 145, 146, 147, 235, 236, 237, 245, 246, 247]
   *
   *      const madd5 = R.lift((a, b, c, d, e) => a + b + c + d + e);
   *
   *      madd5([10, 20], [1], [2, 3], [4], [100, 200]); //=> [117, 217, 118, 218, 127, 227, 128, 228]
   */

  var lift =
  /*#__PURE__*/
  _curry1(function lift(fn) {
    return liftN(fn.length, fn);
  });

  /**
   * A function which calls the two provided functions and returns the `&&`
   * of the results.
   * It returns the result of the first function if it is false-y and the result
   * of the second function otherwise. Note that this is short-circuited,
   * meaning that the second function will not be invoked if the first returns a
   * false-y value.
   *
   * In addition to functions, `R.both` also accepts any fantasy-land compatible
   * applicative functor.
   *
   * @func
   * @memberOf R
   * @since v0.12.0
   * @category Logic
   * @sig (*... -> Boolean) -> (*... -> Boolean) -> (*... -> Boolean)
   * @param {Function} f A predicate
   * @param {Function} g Another predicate
   * @return {Function} a function that applies its arguments to `f` and `g` and `&&`s their outputs together.
   * @see R.either, R.allPass, R.and
   * @example
   *
   *      const gt10 = R.gt(R.__, 10)
   *      const lt20 = R.lt(R.__, 20)
   *      const f = R.both(gt10, lt20);
   *      f(15); //=> true
   *      f(30); //=> false
   *
   *      R.both(Maybe.Just(false), Maybe.Just(55)); // => Maybe.Just(false)
   *      R.both([false, false, 'a'], [11]); //=> [false, false, 11]
   */

  var both =
  /*#__PURE__*/
  _curry2(function both(f, g) {
    return _isFunction(f) ? function _both() {
      return f.apply(this, arguments) && g.apply(this, arguments);
    } : lift(and)(f, g);
  });

  /**
   * Returns the result of calling its first argument with the remaining
   * arguments. This is occasionally useful as a converging function for
   * [`R.converge`](#converge): the first branch can produce a function while the
   * remaining branches produce values to be passed to that function as its
   * arguments.
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category Function
   * @sig ((*... -> a), *...) -> a
   * @param {Function} fn The function to apply to the remaining arguments.
   * @param {...*} args Any number of positional arguments.
   * @return {*}
   * @see R.apply
   * @example
   *
   *      R.call(R.add, 1, 2); //=> 3
   *
   *      const indentN = R.pipe(
   *        R.repeat(' '),
   *        R.join(''),
   *        R.replace(/^(?!$)/gm)
   *      );
   *
   *      const format = R.converge(
   *        R.call,
   *        [
   *          R.pipe(R.prop('indent'), indentN),
   *          R.prop('value')
   *        ]
   *      );
   *
   *      format({indent: 2, value: 'foo\nbar\nbaz\n'}); //=> '  foo\n  bar\n  baz\n'
   * @symb R.call(f, a, b) = f(a, b)
   */

  var call =
  /*#__PURE__*/
  _curry1(function call(fn) {
    return fn.apply(this, Array.prototype.slice.call(arguments, 1));
  });

  /**
   * `_makeFlat` is a helper function that returns a one-level or fully recursive
   * function based on the flag passed in.
   *
   * @private
   */

  function _makeFlat(recursive) {
    return function flatt(list) {
      var value, jlen, j;
      var result = [];
      var idx = 0;
      var ilen = list.length;

      while (idx < ilen) {
        if (_isArrayLike(list[idx])) {
          value = recursive ? flatt(list[idx]) : list[idx];
          j = 0;
          jlen = value.length;

          while (j < jlen) {
            result[result.length] = value[j];
            j += 1;
          }
        } else {
          result[result.length] = list[idx];
        }

        idx += 1;
      }

      return result;
    };
  }

  function _forceReduced(x) {
    return {
      '@@transducer/value': x,
      '@@transducer/reduced': true
    };
  }

  var tInit$1 = '@@transducer/init';
  var tStep$1 = '@@transducer/step';
  var tResult = '@@transducer/result';

  var XPreservingReduced =
  /*#__PURE__*/
  function () {
    function XPreservingReduced(xf) {
      this.xf = xf;
    }

    XPreservingReduced.prototype[tInit$1] = _xfBase.init;
    XPreservingReduced.prototype[tResult] = _xfBase.result;

    XPreservingReduced.prototype[tStep$1] = function (result, input) {
      var ret = this.xf[tStep$1](result, input);
      return ret['@@transducer/reduced'] ? _forceReduced(ret) : ret;
    };

    return XPreservingReduced;
  }();

  var XFlatCat =
  /*#__PURE__*/
  function () {
    function XFlatCat(xf) {
      this.xf = new XPreservingReduced(xf);
    }

    XFlatCat.prototype[tInit$1] = _xfBase.init;
    XFlatCat.prototype[tResult] = _xfBase.result;

    XFlatCat.prototype[tStep$1] = function (result, input) {
      return !_isArrayLike(input) ? _xArrayReduce(this.xf, result, [input]) : _xReduce(this.xf, result, input);
    };

    return XFlatCat;
  }();

  var _flatCat = function _xcat(xf) {
    return new XFlatCat(xf);
  };

  function _xchain(f) {
    return function (xf) {
      return _xmap(f)(_flatCat(xf));
    };
  }

  /**
   * `chain` maps a function over a list and concatenates the results. `chain`
   * is also known as `flatMap` in some libraries.
   *
   * Dispatches to the `chain` method of the second argument, if present,
   * according to the [FantasyLand Chain spec](https://github.com/fantasyland/fantasy-land#chain).
   *
   * If second argument is a function, `chain(f, g)(x)` is equivalent to `f(g(x), x)`.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.3.0
   * @category List
   * @sig Chain m => (a -> m b) -> m a -> m b
   * @param {Function} fn The function to map with
   * @param {Array} list The list to map over
   * @return {Array} The result of flat-mapping `list` with `fn`
   * @example
   *
   *      const duplicate = n => [n, n];
   *      R.chain(duplicate, [1, 2, 3]); //=> [1, 1, 2, 2, 3, 3]
   *
   *      R.chain(R.append, R.head)([1, 2, 3]); //=> [1, 2, 3, 1]
   */

  var chain =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable(['fantasy-land/chain', 'chain'], _xchain, function chain(fn, monad) {
    if (typeof monad === 'function') {
      return function (x) {
        return fn(monad(x))(x);
      };
    }

    return _makeFlat(false)(map(fn, monad));
  }));

  /**
   * Restricts a number to be within a range.
   *
   * Also works for other ordered types such as Strings and Dates.
   *
   * @func
   * @memberOf R
   * @since v0.20.0
   * @category Relation
   * @sig Ord a => a -> a -> a -> a
   * @param {Number} minimum The lower limit of the clamp (inclusive)
   * @param {Number} maximum The upper limit of the clamp (inclusive)
   * @param {Number} value Value to be clamped
   * @return {Number} Returns `minimum` when `val < minimum`, `maximum` when `val > maximum`, returns `val` otherwise
   * @example
   *
   *      R.clamp(1, 10, -5) // => 1
   *      R.clamp(1, 10, 15) // => 10
   *      R.clamp(1, 10, 4)  // => 4
   */

  var clamp =
  /*#__PURE__*/
  _curry3(function clamp(min, max, value) {
    if (min > max) {
      throw new Error('min must not be greater than max in clamp(min, max, value)');
    }

    return value < min ? min : value > max ? max : value;
  });

  function _cloneRegExp(pattern) {
    return new RegExp(pattern.source, pattern.flags ? pattern.flags : (pattern.global ? 'g' : '') + (pattern.ignoreCase ? 'i' : '') + (pattern.multiline ? 'm' : '') + (pattern.sticky ? 'y' : '') + (pattern.unicode ? 'u' : '') + (pattern.dotAll ? 's' : ''));
  }

  /**
   * Copies an object.
   *
   * @private
   * @param {*} value The value to be copied
   * @param {Boolean} deep Whether or not to perform deep cloning.
   * @return {*} The copied value.
   */

  function _clone(value, deep, map) {
    map || (map = new _ObjectMap()); // this avoids the slower switch with a quick if decision removing some milliseconds in each run.

    if (_isPrimitive(value)) {
      return value;
    }

    var copy = function copy(copiedValue) {
      // Check for circular and same references on the object graph and return its corresponding clone.
      var cachedCopy = map.get(value);

      if (cachedCopy) {
        return cachedCopy;
      }

      map.set(value, copiedValue);

      for (var key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          copiedValue[key] = deep ? _clone(value[key], true, map) : value[key];
        }
      }

      return copiedValue;
    };

    switch (type(value)) {
      case 'Object':
        return copy(Object.create(Object.getPrototypeOf(value)));

      case 'Array':
        return copy([]);

      case 'Date':
        return new Date(value.valueOf());

      case 'RegExp':
        return _cloneRegExp(value);

      case 'Int8Array':
      case 'Uint8Array':
      case 'Uint8ClampedArray':
      case 'Int16Array':
      case 'Uint16Array':
      case 'Int32Array':
      case 'Uint32Array':
      case 'Float32Array':
      case 'Float64Array':
      case 'BigInt64Array':
      case 'BigUint64Array':
        return value.slice();

      default:
        return value;
    }
  }

  function _isPrimitive(param) {
    var type = typeof param;
    return param == null || type != 'object' && type != 'function';
  }

  var _ObjectMap =
  /*#__PURE__*/
  function () {
    function _ObjectMap() {
      this.map = {};
      this.length = 0;
    }

    _ObjectMap.prototype.set = function (key, value) {
      const hashedKey = this.hash(key);
      let bucket = this.map[hashedKey];

      if (!bucket) {
        this.map[hashedKey] = bucket = [];
      }

      bucket.push([key, value]);
      this.length += 1;
    };

    _ObjectMap.prototype.hash = function (key) {
      let hashedKey = [];

      for (var value in key) {
        hashedKey.push(Object.prototype.toString.call(key[value]));
      }

      return hashedKey.join();
    };

    _ObjectMap.prototype.get = function (key) {
      /**
       * depending on the number of objects to be cloned is faster to just iterate over the items in the map just because the hash function is so costly,
       * on my tests this number is 180, anything above that using the hash function is faster.
       */
      if (this.length <= 180) {
        for (const p in this.map) {
          const bucket = this.map[p];

          for (let i = 0; i < bucket.length; i += 1) {
            const element = bucket[i];

            if (element[0] === key) {
              return element[1];
            }
          }
        }

        return;
      }

      const hashedKey = this.hash(key);
      const bucket = this.map[hashedKey];

      if (!bucket) {
        return;
      }

      for (let i = 0; i < bucket.length; i += 1) {
        const element = bucket[i];

        if (element[0] === key) {
          return element[1];
        }
      }
    };

    return _ObjectMap;
  }();

  /**
   * Creates a deep copy of the source that can be used in place of the source
   * object without retaining any references to it.
   * The source object may contain (nested) `Array`s and `Object`s,
   * `Number`s, `String`s, `Boolean`s and `Date`s.
   * `Function`s are assigned by reference rather than copied.
   *
   * Dispatches to a `clone` method if present.
   *
   * Note that if the source object has multiple nodes that share a reference,
   * the returned object will have the same structure, but the references will
   * be pointed to the location within the cloned value.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Object
   * @sig {*} -> {*}
   * @param {*} value The object or array to clone
   * @return {*} A deeply cloned copy of `val`
   * @example
   *
   *      const objects = [{}, {}, {}];
   *      const objectsClone = R.clone(objects);
   *      objects === objectsClone; //=> false
   *      objects[0] === objectsClone[0]; //=> false
   */

  var clone$1 =
  /*#__PURE__*/
  _curry1(function clone(value) {
    return value != null && typeof value.clone === 'function' ? value.clone() : _clone(value, true);
  });

  /**
   * Splits a list into sub-lists, based on the result of calling a key-returning function on each element,
   * and grouping the results according to values returned.
   *
   * @func
   * @memberOf R
   * @since v0.28.0
   * @category List
   * @typedefn Idx = String | Int | Symbol
   * @sig Idx a => (b -> a) -> [b] -> [[b]]
   * @param {Function} fn Function :: a -> Idx
   * @param {Array} list The array to group
   * @return {Array}
   *    An array of arrays where each sub-array contains items for which
   *    the String-returning function has returned the same value.
   * @see R.groupBy, R.partition
   * @example
   *      R.collectBy(R.prop('type'), [
   *        {type: 'breakfast', item: '☕️'},
   *        {type: 'lunch', item: '🌯'},
   *        {type: 'dinner', item: '🍝'},
   *        {type: 'breakfast', item: '🥐'},
   *        {type: 'lunch', item: '🍕'}
   *      ]);
   *
   *      // [ [ {type: 'breakfast', item: '☕️'},
   *      //     {type: 'breakfast', item: '🥐'} ],
   *      //   [ {type: 'lunch', item: '🌯'},
   *      //     {type: 'lunch', item: '🍕'} ],
   *      //   [ {type: 'dinner', item: '🍝'} ] ]
   */

  var collectBy =
  /*#__PURE__*/
  _curry2(function collectBy(fn, list) {
    var group = _reduce(function (o, x) {
      var tag = fn(x);

      if (o[tag] === undefined) {
        o[tag] = [];
      }

      o[tag].push(x);
      return o;
    }, {}, list);

    var newList = [];

    for (var tag in group) {
      newList.push(group[tag]);
    }

    return newList;
  });

  /**
   * Makes a comparator function out of a function that reports whether the first
   * element is less than the second.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Function
   * @sig ((a, b) -> Boolean) -> ((a, b) -> Number)
   * @param {Function} pred A predicate function of arity two which will return `true` if the first argument
   * is less than the second, `false` otherwise
   * @return {Function} A Function :: a -> b -> Int that returns `-1` if a < b, `1` if b < a, otherwise `0`
   * @example
   *
   *      const byAge = R.comparator((a, b) => a.age < b.age);
   *      const people = [
   *        { name: 'Emma', age: 70 },
   *        { name: 'Peter', age: 78 },
   *        { name: 'Mikhail', age: 62 },
   *      ];
   *      const peopleByIncreasingAge = R.sort(byAge, people);
   *        //=> [{ name: 'Mikhail', age: 62 },{ name: 'Emma', age: 70 }, { name: 'Peter', age: 78 }]
   */

  var comparator =
  /*#__PURE__*/
  _curry1(function comparator(pred) {
    return function (a, b) {
      return pred(a, b) ? -1 : pred(b, a) ? 1 : 0;
    };
  });

  /**
   * A function that returns the `!` of its argument. It will return `true` when
   * passed false-y value, and `false` when passed a truth-y one.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Logic
   * @sig * -> Boolean
   * @param {*} a any value
   * @return {Boolean} the logical inverse of passed argument.
   * @see R.complement
   * @example
   *
   *      R.not(true); //=> false
   *      R.not(false); //=> true
   *      R.not(0); //=> true
   *      R.not(1); //=> false
   */

  var not =
  /*#__PURE__*/
  _curry1(function not(a) {
    return !a;
  });

  /**
   * Takes a function `f` and returns a function `g` such that if called with the same arguments
   * when `f` returns a "truthy" value, `g` returns `false` and when `f` returns a "falsy" value `g` returns `true`.
   *
   * `R.complement` may be applied to any functor
   *
   * @func
   * @memberOf R
   * @since v0.12.0
   * @category Logic
   * @sig (*... -> *) -> (*... -> Boolean)
   * @param {Function} f
   * @return {Function}
   * @see R.not
   * @example
   *
   *      const isNotNil = R.complement(R.isNil);
   *      R.isNil(null); //=> true
   *      isNotNil(null); //=> false
   *      R.isNil(7); //=> false
   *      isNotNil(7); //=> true
   */

  var complement =
  /*#__PURE__*/
  lift(not);

  function _pipe(f, g) {
    return function () {
      return g.call(this, f.apply(this, arguments));
    };
  }

  /**
   * This checks whether a function has a [methodname] function. If it isn't an
   * array it will execute that function otherwise it will default to the ramda
   * implementation.
   *
   * @private
   * @param {Function} fn ramda implementation
   * @param {String} methodname property to check for a custom implementation
   * @return {Object} Whatever the return value of the method is.
   */

  function _checkForMethod(methodname, fn) {
    return function () {
      var length = arguments.length;

      if (length === 0) {
        return fn();
      }

      var obj = arguments[length - 1];
      return _isArray(obj) || typeof obj[methodname] !== 'function' ? fn.apply(this, arguments) : obj[methodname].apply(obj, Array.prototype.slice.call(arguments, 0, length - 1));
    };
  }

  /**
   * Returns the elements of the given list or string (or object with a `slice`
   * method) from `fromIndex` (inclusive) to `toIndex` (exclusive).
   *
   * Dispatches to the `slice` method of the third argument, if present.
   *
   * @func
   * @memberOf R
   * @since v0.1.4
   * @category List
   * @sig Number -> Number -> [a] -> [a]
   * @sig Number -> Number -> String -> String
   * @param {Number} fromIndex The start index (inclusive).
   * @param {Number} toIndex The end index (exclusive).
   * @param {*} list
   * @return {*}
   * @example
   *
   *      R.slice(1, 3, ['a', 'b', 'c', 'd']);        //=> ['b', 'c']
   *      R.slice(1, Infinity, ['a', 'b', 'c', 'd']); //=> ['b', 'c', 'd']
   *      R.slice(0, -1, ['a', 'b', 'c', 'd']);       //=> ['a', 'b', 'c']
   *      R.slice(-3, -1, ['a', 'b', 'c', 'd']);      //=> ['b', 'c']
   *      R.slice(0, 3, 'ramda');                     //=> 'ram'
   */

  var slice =
  /*#__PURE__*/
  _curry3(
  /*#__PURE__*/
  _checkForMethod('slice', function slice(fromIndex, toIndex, list) {
    return Array.prototype.slice.call(list, fromIndex, toIndex);
  }));

  /**
   * Returns all but the first element of the given list or string (or object
   * with a `tail` method).
   *
   * Dispatches to the `slice` method of the first argument, if present.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig [a] -> [a]
   * @sig String -> String
   * @param {*} list
   * @return {*}
   * @see R.head, R.init, R.last
   * @example
   *
   *      R.tail([1, 2, 3]);  //=> [2, 3]
   *      R.tail([1, 2]);     //=> [2]
   *      R.tail([1]);        //=> []
   *      R.tail([]);         //=> []
   *
   *      R.tail('abc');  //=> 'bc'
   *      R.tail('ab');   //=> 'b'
   *      R.tail('a');    //=> ''
   *      R.tail('');     //=> ''
   */

  var tail =
  /*#__PURE__*/
  _curry1(
  /*#__PURE__*/
  _checkForMethod('tail',
  /*#__PURE__*/
  slice(1, Infinity)));

  /**
   * Performs left-to-right function composition. The first argument may have
   * any arity; the remaining arguments must be unary.
   *
   * In some libraries this function is named `sequence`.
   *
   * **Note:** The result of pipe is not automatically curried.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Function
   * @sig (((a, b, ..., n) -> o), (o -> p), ..., (x -> y), (y -> z)) -> ((a, b, ..., n) -> z)
   * @param {...Function} functions
   * @return {Function}
   * @see R.compose
   * @example
   *
   *      const f = R.pipe(Math.pow, R.negate, R.inc);
   *
   *      f(3, 4); // -(3^4) + 1
   * @symb R.pipe(f, g, h)(a, b) = h(g(f(a, b)))
   * @symb R.pipe(f, g, h)(a)(b) = h(g(f(a)))(b)
   */

  function pipe() {
    if (arguments.length === 0) {
      throw new Error('pipe requires at least one argument');
    }

    return _arity(arguments[0].length, reduce(_pipe, arguments[0], tail(arguments)));
  }

  /**
   * Returns a new list or string with the elements or characters in reverse
   * order.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig [a] -> [a]
   * @sig String -> String
   * @param {Array|String} list
   * @return {Array|String}
   * @example
   *
   *      R.reverse([1, 2, 3]);  //=> [3, 2, 1]
   *      R.reverse([1, 2]);     //=> [2, 1]
   *      R.reverse([1]);        //=> [1]
   *      R.reverse([]);         //=> []
   *
   *      R.reverse('abc');      //=> 'cba'
   *      R.reverse('ab');       //=> 'ba'
   *      R.reverse('a');        //=> 'a'
   *      R.reverse('');         //=> ''
   */

  var reverse =
  /*#__PURE__*/
  _curry1(function reverse(list) {
    return _isString(list) ? list.split('').reverse().join('') : Array.prototype.slice.call(list, 0).reverse();
  });

  /**
   * Performs right-to-left function composition. The last argument may have
   * any arity; the remaining arguments must be unary.
   *
   * **Note:** The result of compose is not automatically curried.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Function
   * @sig ((y -> z), (x -> y), ..., (o -> p), ((a, b, ..., n) -> o)) -> ((a, b, ..., n) -> z)
   * @param {...Function} ...functions The functions to compose
   * @return {Function}
   * @see R.pipe
   * @example
   *
   *      const classyGreeting = (firstName, lastName) => "The name's " + lastName + ", " + firstName + " " + lastName
   *      const yellGreeting = R.compose(R.toUpper, classyGreeting);
   *      yellGreeting('James', 'Bond'); //=> "THE NAME'S BOND, JAMES BOND"
   *
   *      R.compose(Math.abs, R.add(1), R.multiply(2))(-4) //=> 7
   *
   * @symb R.compose(f, g, h)(a, b) = f(g(h(a, b)))
   * @symb R.compose(f, g, h)(a)(b) = f(g(h(a)))(b)
   */

  function compose() {
    if (arguments.length === 0) {
      throw new Error('compose requires at least one argument');
    }

    return pipe.apply(this, reverse(arguments));
  }

  /**
   * Returns the first element of the given list or string. In some libraries
   * this function is named `first`.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig [a] -> a | Undefined
   * @sig String -> String
   * @param {Array|String} list
   * @return {*}
   * @see R.tail, R.init, R.last
   * @example
   *
   *      R.head(['fi', 'fo', 'fum']); //=> 'fi'
   *      R.head([]); //=> undefined
   *
   *      R.head('abc'); //=> 'a'
   *      R.head(''); //=> ''
   */

  var head =
  /*#__PURE__*/
  nth(0);

  function _identity(x) {
    return x;
  }

  /**
   * A function that does nothing but return the parameter supplied to it. Good
   * as a default or placeholder function.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Function
   * @sig a -> a
   * @param {*} x The value to return.
   * @return {*} The input value, `x`.
   * @example
   *
   *      R.identity(1); //=> 1
   *
   *      const obj = {};
   *      R.identity(obj) === obj; //=> true
   * @symb R.identity(a) = a
   */

  var identity =
  /*#__PURE__*/
  _curry1(_identity);

  /**
   * Performs left-to-right function composition using transforming function. The first function may have
   * any arity; the remaining functions must be unary.
   *
   * **Note:** The result of pipeWith is not automatically curried. Transforming function is not used on the
   * first argument.
   *
   * @func
   * @memberOf R
   * @since v0.26.0
   * @category Function
   * @sig ((* -> *), [((a, b, ..., n) -> o), (o -> p), ..., (x -> y), (y -> z)]) -> ((a, b, ..., n) -> z)
   * @param {Function} transformer The transforming function
   * @param {Array} functions The functions to pipe
   * @return {Function}
   * @see R.composeWith, R.pipe
   * @example
   *
   *      const pipeWhileNotNil = R.pipeWith((f, res) => R.isNil(res) ? res : f(res));
   *      const f = pipeWhileNotNil([Math.pow, R.negate, R.inc])
   *
   *      f(3, 4); // -(3^4) + 1
   * @symb R.pipeWith(f)([g, h, i])(...args) = f(i, f(h, g(...args)))
   */

  var pipeWith =
  /*#__PURE__*/
  _curry2(function pipeWith(xf, list) {
    if (list.length <= 0) {
      return identity;
    }

    var headList = head(list);
    var tailList = tail(list);
    return _arity(headList.length, function () {
      return _reduce(function (result, f) {
        return xf.call(this, f, result);
      }, headList.apply(this, arguments), tailList);
    });
  });

  /**
   * Performs right-to-left function composition using transforming function. The last function may have
   * any arity; the remaining functions must be unary. Unlike `compose`, functions are passed in an array.
   *
   * **Note:** The result of composeWith is not automatically curried. Transforming function is not used
   * on the last argument.
   *
   * @func
   * @memberOf R
   * @since v0.26.0
   * @category Function
   * @sig ((* -> *), [(y -> z), (x -> y), ..., (o -> p), ((a, b, ..., n) -> o)]) -> ((a, b, ..., n) -> z)
   * @param {Function} transformer The transforming function
   * @param {Array} functions The functions to compose
   * @return {Function}
   * @see R.compose, R.pipeWith
   * @example
   *
   *      const composeWhileNotNil = R.composeWith((f, res) => R.isNil(res) ? res : f(res));
   *
   *      composeWhileNotNil([R.inc, R.prop('age')])({age: 1}) //=> 2
   *      composeWhileNotNil([R.inc, R.prop('age')])({}) //=> undefined
   *
   * @symb R.composeWith(f)([g, h, i])(...args) = f(g, f(h, i(...args)))
   */

  var composeWith =
  /*#__PURE__*/
  _curry2(function composeWith(xf, list) {
    return pipeWith.apply(this, [xf, reverse(list)]);
  });

  /**
   * Returns the result of concatenating the given lists or strings.
   *
   * Note: `R.concat` expects both arguments to be of the same type,
   * unlike the native `Array.prototype.concat` method. It will throw
   * an error if you `concat` an Array with a non-Array value.
   *
   * Dispatches to the `concat` method of the first argument, if present.
   * Can also concatenate two members of a [fantasy-land
   * compatible semigroup](https://github.com/fantasyland/fantasy-land#semigroup).
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig [a] -> [a] -> [a]
   * @sig String -> String -> String
   * @param {Array|String} firstList The first list
   * @param {Array|String} secondList The second list
   * @return {Array|String} A list consisting of the elements of `firstList` followed by the elements of
   * `secondList`.
   *
   * @example
   *
   *      R.concat('ABC', 'DEF'); // 'ABCDEF'
   *      R.concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
   *      R.concat([], []); //=> []
   */

  var concat =
  /*#__PURE__*/
  _curry2(function concat(a, b) {
    if (_isArray(a)) {
      if (_isArray(b)) {
        return a.concat(b);
      }

      throw new TypeError(toString(b) + ' is not an array');
    }

    if (_isString(a)) {
      if (_isString(b)) {
        return a + b;
      }

      throw new TypeError(toString(b) + ' is not a string');
    }

    if (a != null && _isFunction(a['fantasy-land/concat'])) {
      return a['fantasy-land/concat'](b);
    }

    if (a != null && _isFunction(a.concat)) {
      return a.concat(b);
    }

    throw new TypeError(toString(a) + ' does not have a method named "concat" or "fantasy-land/concat"');
  });

  /**
   * Returns a function, `fn`, which encapsulates `if/else, if/else, ...` logic.
   * `R.cond` takes a list of [predicate, transformer] pairs. All of the arguments
   * to `fn` are applied to each of the predicates in turn until one returns a
   * "truthy" value, at which point `fn` returns the result of applying its
   * arguments to the corresponding transformer. If none of the predicates
   * matches, `fn` returns undefined.
   *
   * **Please note**: This is not a direct substitute for a `switch` statement.
   * Remember that both elements of every pair passed to `cond` are *functions*,
   * and `cond` returns a function.
   *
   * @func
   * @memberOf R
   * @since v0.6.0
   * @category Logic
   * @sig [[(*... -> Boolean),(*... -> *)]] -> (*... -> *)
   * @param {Array} pairs A list of [predicate, transformer]
   * @return {Function}
   * @see R.ifElse, R.unless, R.when
   * @example
   *
   *      const fn = R.cond([
   *        [R.equals(0),   R.always('water freezes at 0°C')],
   *        [R.equals(100), R.always('water boils at 100°C')],
   *        [R.T,           temp => 'nothing special happens at ' + temp + '°C']
   *      ]);
   *      fn(0); //=> 'water freezes at 0°C'
   *      fn(50); //=> 'nothing special happens at 50°C'
   *      fn(100); //=> 'water boils at 100°C'
   */

  var cond =
  /*#__PURE__*/
  _curry1(function cond(pairs) {
    var arity = reduce(max, 0, map(function (pair) {
      return pair[0].length;
    }, pairs));
    return _arity(arity, function () {
      var idx = 0;

      while (idx < pairs.length) {
        if (pairs[idx][0].apply(this, arguments)) {
          return pairs[idx][1].apply(this, arguments);
        }

        idx += 1;
      }
    });
  });

  /**
   * Returns a curried equivalent of the provided function. The curried function
   * has two unusual capabilities. First, its arguments needn't be provided one
   * at a time. If `f` is a ternary function and `g` is `R.curry(f)`, the
   * following are equivalent:
   *
   *   - `g(1)(2)(3)`
   *   - `g(1)(2, 3)`
   *   - `g(1, 2)(3)`
   *   - `g(1, 2, 3)`
   *
   * Secondly, the special placeholder value [`R.__`](#__) may be used to specify
   * "gaps", allowing partial application of any combination of arguments,
   * regardless of their positions. If `g` is as above and `_` is [`R.__`](#__),
   * the following are equivalent:
   *
   *   - `g(1, 2, 3)`
   *   - `g(_, 2, 3)(1)`
   *   - `g(_, _, 3)(1)(2)`
   *   - `g(_, _, 3)(1, 2)`
   *   - `g(_, 2)(1)(3)`
   *   - `g(_, 2)(1, 3)`
   *   - `g(_, 2)(_, 3)(1)`
   *
   * Please note that default parameters don't count towards a [function arity](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/length)
   * and therefore `curry` won't work well with those.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Function
   * @sig (* -> a) -> (* -> a)
   * @param {Function} fn The function to curry.
   * @return {Function} A new, curried function.
   * @see R.curryN, R.partial
   * @example
   *
   *      const addFourNumbers = (a, b, c, d) => a + b + c + d;
   *      const curriedAddFourNumbers = R.curry(addFourNumbers);
   *      const f = curriedAddFourNumbers(1, 2);
   *      const g = f(3);
   *      g(4); //=> 10
   *
   *      // R.curry not working well with default parameters
   *      const h = R.curry((a, b, c = 2) => a + b + c);
   *      h(1)(2)(7); //=> Error! (`3` is not a function!)
   */

  var curry =
  /*#__PURE__*/
  _curry1(function curry(fn) {
    return curryN(fn.length, fn);
  });

  /**
   * Wraps a constructor function inside a curried function that can be called
   * with the same arguments and returns the same type. The arity of the function
   * returned is specified to allow using variadic constructor functions.
   *
   * @func
   * @memberOf R
   * @since v0.4.0
   * @category Function
   * @sig Number -> (* -> {*}) -> (* -> {*})
   * @param {Number} n The arity of the constructor function.
   * @param {Function} Fn The constructor function to wrap.
   * @return {Function} A wrapped, curried constructor function.
   * @example
   *
   *      // Variadic Constructor function
   *      function Salad() {
   *        this.ingredients = arguments;
   *      }
   *
   *      Salad.prototype.recipe = function() {
   *        const instructions = R.map(ingredient => 'Add a dollop of ' + ingredient, this.ingredients);
   *        return R.join('\n', instructions);
   *      };
   *
   *      const ThreeLayerSalad = R.constructN(3, Salad);
   *
   *      // Notice we no longer need the 'new' keyword, and the constructor is curried for 3 arguments.
   *      const salad = ThreeLayerSalad('Mayonnaise')('Potato Chips')('Ketchup');
   *
   *      console.log(salad.recipe());
   *      // Add a dollop of Mayonnaise
   *      // Add a dollop of Potato Chips
   *      // Add a dollop of Ketchup
   */

  var constructN =
  /*#__PURE__*/
  _curry2(function constructN(n, Fn) {
    if (n > 10) {
      throw new Error('Constructor with greater than ten arguments');
    }

    if (n === 0) {
      return function () {
        return new Fn();
      };
    }

    return curry(nAry(n, function ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9) {
      switch (n) {
        case 1:
          return new Fn($0);

        case 2:
          return new Fn($0, $1);

        case 3:
          return new Fn($0, $1, $2);

        case 4:
          return new Fn($0, $1, $2, $3);

        case 5:
          return new Fn($0, $1, $2, $3, $4);

        case 6:
          return new Fn($0, $1, $2, $3, $4, $5);

        case 7:
          return new Fn($0, $1, $2, $3, $4, $5, $6);

        case 8:
          return new Fn($0, $1, $2, $3, $4, $5, $6, $7);

        case 9:
          return new Fn($0, $1, $2, $3, $4, $5, $6, $7, $8);

        case 10:
          return new Fn($0, $1, $2, $3, $4, $5, $6, $7, $8, $9);
      }
    }));
  });

  /**
   * Wraps a constructor function inside a curried function that can be called
   * with the same arguments and returns the same type.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Function
   * @sig (* -> {*}) -> (* -> {*})
   * @param {Function} fn The constructor function to wrap.
   * @return {Function} A wrapped, curried constructor function.
   * @see R.invoker
   * @example
   *
   *      // Constructor function
   *      function Animal(kind) {
   *        this.kind = kind;
   *      };
   *      Animal.prototype.sighting = function() {
   *        return "It's a " + this.kind + "!";
   *      }
   *
   *      const AnimalConstructor = R.construct(Animal)
   *
   *      // Notice we no longer need the 'new' keyword:
   *      AnimalConstructor('Pig'); //=> {"kind": "Pig", "sighting": function (){...}};
   *
   *      const animalTypes = ["Lion", "Tiger", "Bear"];
   *      const animalSighting = R.invoker(0, 'sighting');
   *      const sightNewAnimal = R.compose(animalSighting, AnimalConstructor);
   *      R.map(sightNewAnimal, animalTypes); //=> ["It's a Lion!", "It's a Tiger!", "It's a Bear!"]
   */

  var construct =
  /*#__PURE__*/
  _curry1(function construct(Fn) {
    return constructN(Fn.length, Fn);
  });

  /**
   * Accepts a converging function and a list of branching functions and returns
   * a new function. The arity of the new function is the same as the arity of
   * the longest branching function. When invoked, this new function is applied
   * to some arguments, and each branching function is applied to those same
   * arguments. The results of each branching function are passed as arguments
   * to the converging function to produce the return value.
   *
   * @func
   * @memberOf R
   * @since v0.4.2
   * @category Function
   * @sig ((x1, x2, ...) -> z) -> [((a, b, ...) -> x1), ((a, b, ...) -> x2), ...] -> (a -> b -> ... -> z)
   * @param {Function} after A function. `after` will be invoked with the return values of
   *        `fn1` and `fn2` as its arguments.
   * @param {Array} functions A list of functions.
   * @return {Function} A new function.
   * @see R.useWith
   * @example
   *
   *      const average = R.converge(R.divide, [R.sum, R.length])
   *      average([1, 2, 3, 4, 5, 6, 7]) //=> 4
   *
   *      const strangeConcat = R.converge(R.concat, [R.toUpper, R.toLower])
   *      strangeConcat("Yodel") //=> "YODELyodel"
   *
   * @symb R.converge(f, [g, h])(a, b) = f(g(a, b), h(a, b))
   */

  var converge =
  /*#__PURE__*/
  _curry2(function converge(after, fns) {
    return curryN(reduce(max, 0, pluck('length', fns)), function () {
      var args = arguments;
      var context = this;
      return after.apply(context, _map(function (fn) {
        return fn.apply(context, args);
      }, fns));
    });
  });

  /**
   * Returns the number of items in a given `list` matching the predicate `f`
   *
   * @func
   * @memberOf R
   * @since v0.28.0
   * @category List
   * @sig (a -> Boolean) -> [a] -> Number
   * @param {Function} predicate to match items against
   * @return {Array} list of items to count in
   * @example
   *
   *      const even = x => x % 2 == 0;
   *
   *      R.count(even, [1, 2, 3, 4, 5]); // => 2
   *      R.map(R.count(even), [[1, 1, 1], [2, 3, 4, 5], [6]]); // => [0, 2, 1]
   */

  var count =
  /*#__PURE__*/
  curry(function (pred, list) {
    return _reduce(function (a, e) {
      return pred(e) ? a + 1 : a;
    }, 0, list);
  });

  var XReduceBy =
  /*#__PURE__*/
  function () {
    function XReduceBy(valueFn, valueAcc, keyFn, xf) {
      this.valueFn = valueFn;
      this.valueAcc = valueAcc;
      this.keyFn = keyFn;
      this.xf = xf;
      this.inputs = {};
    }

    XReduceBy.prototype['@@transducer/init'] = _xfBase.init;

    XReduceBy.prototype['@@transducer/result'] = function (result) {
      var key;

      for (key in this.inputs) {
        if (_has(key, this.inputs)) {
          result = this.xf['@@transducer/step'](result, this.inputs[key]);

          if (result['@@transducer/reduced']) {
            result = result['@@transducer/value'];
            break;
          }
        }
      }

      this.inputs = null;
      return this.xf['@@transducer/result'](result);
    };

    XReduceBy.prototype['@@transducer/step'] = function (result, input) {
      var key = this.keyFn(input);
      this.inputs[key] = this.inputs[key] || [key, _clone(this.valueAcc, false)];
      this.inputs[key][1] = this.valueFn(this.inputs[key][1], input);
      return result;
    };

    return XReduceBy;
  }();

  function _xreduceBy(valueFn, valueAcc, keyFn) {
    return function (xf) {
      return new XReduceBy(valueFn, valueAcc, keyFn, xf);
    };
  }

  /**
   * Groups the elements of the list according to the result of calling
   * the String-returning function `keyFn` on each element and reduces the elements
   * of each group to a single value via the reducer function `valueFn`.
   *
   * The value function receives two values: *(acc, value)*. It may use
   * [`R.reduced`](#reduced) to short circuit the iteration.
   *
   * This function is basically a more general [`groupBy`](#groupBy) function.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.20.0
   * @category List
   * @sig ((a, b) -> a) -> a -> (b -> String) -> [b] -> {String: a}
   * @param {Function} valueFn The function that reduces the elements of each group to a single
   *        value. Receives two values, accumulator for a particular group and the current element.
   * @param {*} acc The (initial) accumulator value for each group.
   * @param {Function} keyFn The function that maps the list's element into a key.
   * @param {Array} list The array to group.
   * @return {Object} An object with the output of `keyFn` for keys, mapped to the output of
   *         `valueFn` for elements which produced that key when passed to `keyFn`.
   * @see R.groupBy, R.reduce, R.reduced
   * @example
   *
   *      const groupNames = (acc, {name}) => acc.concat(name)
   *      const toGrade = ({score}) =>
   *        score < 65 ? 'F' :
   *        score < 70 ? 'D' :
   *        score < 80 ? 'C' :
   *        score < 90 ? 'B' : 'A'
   *
   *      var students = [
   *        {name: 'Abby', score: 83},
   *        {name: 'Bart', score: 62},
   *        {name: 'Curt', score: 88},
   *        {name: 'Dora', score: 92},
   *      ]
   *
   *      reduceBy(groupNames, [], toGrade, students)
   *      //=> {"A": ["Dora"], "B": ["Abby", "Curt"], "F": ["Bart"]}
   */

  var reduceBy =
  /*#__PURE__*/
  _curryN(4, [],
  /*#__PURE__*/
  _dispatchable([], _xreduceBy, function reduceBy(valueFn, valueAcc, keyFn, list) {
    var xf = _xwrap(function (acc, elt) {
      var key = keyFn(elt);
      var value = valueFn(_has(key, acc) ? acc[key] : _clone(valueAcc, false), elt);

      if (value && value['@@transducer/reduced']) {
        return _reduced(acc);
      }

      acc[key] = value;
      return acc;
    });

    return _xReduce(xf, {}, list);
  }));

  /**
   * Counts the elements of a list according to how many match each value of a
   * key generated by the supplied function. Returns an object mapping the keys
   * produced by `fn` to the number of occurrences in the list. Note that all
   * keys are coerced to strings because of how JavaScript objects work.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Relation
   * @sig (a -> String) -> [a] -> {*}
   * @param {Function} fn The function used to map values to keys.
   * @param {Array} list The list to count elements from.
   * @return {Object} An object mapping keys to number of occurrences in the list.
   * @example
   *
   *      const numbers = [1.0, 1.1, 1.2, 2.0, 3.0, 2.2];
   *      R.countBy(Math.floor)(numbers);    //=> {'1': 3, '2': 2, '3': 1}
   *
   *      const letters = ['a', 'b', 'A', 'a', 'B', 'c'];
   *      R.countBy(R.toLower)(letters);   //=> {'a': 3, 'b': 2, 'c': 1}
   */

  var countBy =
  /*#__PURE__*/
  reduceBy(function (acc, elem) {
    return acc + 1;
  }, 0);

  /**
   * Decrements its argument.
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category Math
   * @sig Number -> Number
   * @param {Number} n
   * @return {Number} n - 1
   * @see R.inc
   * @example
   *
   *      R.dec(42); //=> 41
   */

  var dec =
  /*#__PURE__*/
  add(-1);

  /**
   * Returns the second argument if it is not `null`, `undefined` or `NaN`;
   * otherwise the first argument is returned.
   *
   * @func
   * @memberOf R
   * @since v0.10.0
   * @category Logic
   * @sig a -> b -> a | b
   * @param {a} default The default value.
   * @param {b} val `val` will be returned instead of `default` unless `val` is `null`, `undefined` or `NaN`.
   * @return {*} The second value if it is not `null`, `undefined` or `NaN`, otherwise the default value
   * @example
   *
   *      const defaultTo42 = R.defaultTo(42);
   *
   *      defaultTo42(null);  //=> 42
   *      defaultTo42(undefined);  //=> 42
   *      defaultTo42(false);  //=> false
   *      defaultTo42('Ramda');  //=> 'Ramda'
   *      // parseInt('string') results in NaN
   *      defaultTo42(parseInt('string')); //=> 42
   */

  var defaultTo =
  /*#__PURE__*/
  _curry2(function defaultTo(d, v) {
    return v == null || v !== v ? d : v;
  });

  /**
   * Makes a descending comparator function out of a function that returns a value
   * that can be compared with `<` and `>`.
   *
   * @func
   * @memberOf R
   * @since v0.23.0
   * @category Function
   * @sig Ord b => (a -> b) -> a -> a -> Number
   * @param {Function} fn A function of arity one that returns a value that can be compared
   * @param {*} a The first item to be compared.
   * @param {*} b The second item to be compared.
   * @return {Number} `-1` if fn(a) > fn(b), `1` if fn(b) > fn(a), otherwise `0`
   * @see R.ascend
   * @example
   *
   *      const byAge = R.descend(R.prop('age'));
   *      const people = [
   *        { name: 'Emma', age: 70 },
   *        { name: 'Peter', age: 78 },
   *        { name: 'Mikhail', age: 62 },
   *      ];
   *      const peopleByOldestFirst = R.sort(byAge, people);
   *        //=> [{ name: 'Peter', age: 78 }, { name: 'Emma', age: 70 }, { name: 'Mikhail', age: 62 }]
   */

  var descend =
  /*#__PURE__*/
  _curry3(function descend(fn, a, b) {
    var aa = fn(a);
    var bb = fn(b);
    return aa > bb ? -1 : aa < bb ? 1 : 0;
  });

  var _Set =
  /*#__PURE__*/
  function () {
    function _Set() {
      /* globals Set */
      this._nativeSet = typeof Set === 'function' ? new Set() : null;
      this._items = {};
    }

    // until we figure out why jsdoc chokes on this
    // @param item The item to add to the Set
    // @returns {boolean} true if the item did not exist prior, otherwise false
    //
    _Set.prototype.add = function (item) {
      return !hasOrAdd(item, true, this);
    }; //
    // @param item The item to check for existence in the Set
    // @returns {boolean} true if the item exists in the Set, otherwise false
    //


    _Set.prototype.has = function (item) {
      return hasOrAdd(item, false, this);
    }; //
    // Combines the logic for checking whether an item is a member of the set and
    // for adding a new item to the set.
    //
    // @param item       The item to check or add to the Set instance.
    // @param shouldAdd  If true, the item will be added to the set if it doesn't
    //                   already exist.
    // @param set        The set instance to check or add to.
    // @return {boolean} true if the item already existed, otherwise false.
    //


    return _Set;
  }();

  function hasOrAdd(item, shouldAdd, set) {
    var type = typeof item;
    var prevSize, newSize;

    switch (type) {
      case 'string':
      case 'number':
        // distinguish between +0 and -0
        if (item === 0 && 1 / item === -Infinity) {
          if (set._items['-0']) {
            return true;
          } else {
            if (shouldAdd) {
              set._items['-0'] = true;
            }

            return false;
          }
        } // these types can all utilise the native Set


        if (set._nativeSet !== null) {
          if (shouldAdd) {
            prevSize = set._nativeSet.size;

            set._nativeSet.add(item);

            newSize = set._nativeSet.size;
            return newSize === prevSize;
          } else {
            return set._nativeSet.has(item);
          }
        } else {
          if (!(type in set._items)) {
            if (shouldAdd) {
              set._items[type] = {};
              set._items[type][item] = true;
            }

            return false;
          } else if (item in set._items[type]) {
            return true;
          } else {
            if (shouldAdd) {
              set._items[type][item] = true;
            }

            return false;
          }
        }

      case 'boolean':
        // set._items['boolean'] holds a two element array
        // representing [ falseExists, trueExists ]
        if (type in set._items) {
          var bIdx = item ? 1 : 0;

          if (set._items[type][bIdx]) {
            return true;
          } else {
            if (shouldAdd) {
              set._items[type][bIdx] = true;
            }

            return false;
          }
        } else {
          if (shouldAdd) {
            set._items[type] = item ? [false, true] : [true, false];
          }

          return false;
        }

      case 'function':
        // compare functions for reference equality
        if (set._nativeSet !== null) {
          if (shouldAdd) {
            prevSize = set._nativeSet.size;

            set._nativeSet.add(item);

            newSize = set._nativeSet.size;
            return newSize === prevSize;
          } else {
            return set._nativeSet.has(item);
          }
        } else {
          if (!(type in set._items)) {
            if (shouldAdd) {
              set._items[type] = [item];
            }

            return false;
          }

          if (!_includes(item, set._items[type])) {
            if (shouldAdd) {
              set._items[type].push(item);
            }

            return false;
          }

          return true;
        }

      case 'undefined':
        if (set._items[type]) {
          return true;
        } else {
          if (shouldAdd) {
            set._items[type] = true;
          }

          return false;
        }

      case 'object':
        if (item === null) {
          if (!set._items['null']) {
            if (shouldAdd) {
              set._items['null'] = true;
            }

            return false;
          }

          return true;
        }

      /* falls through */

      default:
        // reduce the search size of heterogeneous sets by creating buckets
        // for each type.
        type = Object.prototype.toString.call(item);

        if (!(type in set._items)) {
          if (shouldAdd) {
            set._items[type] = [item];
          }

          return false;
        } // scan through all previously applied items


        if (!_includes(item, set._items[type])) {
          if (shouldAdd) {
            set._items[type].push(item);
          }

          return false;
        }

        return true;
    }
  } // A simple Set type that honours R.equals semantics

  /**
   * Finds the set (i.e. no duplicates) of all elements in the first list not
   * contained in the second list. Objects and Arrays are compared in terms of
   * value equality, not reference equality.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Relation
   * @sig [*] -> [*] -> [*]
   * @param {Array} list1 The first list.
   * @param {Array} list2 The second list.
   * @return {Array} The elements in `list1` that are not in `list2`.
   * @see R.differenceWith, R.symmetricDifference, R.symmetricDifferenceWith, R.without
   * @example
   *
   *      R.difference([1,2,3,4], [7,6,5,4,3]); //=> [1,2]
   *      R.difference([7,6,5,4,3], [1,2,3,4]); //=> [7,6,5]
   *      R.difference([{a: 1}, {b: 2}], [{a: 1}, {c: 3}]) //=> [{b: 2}]
   */

  var difference =
  /*#__PURE__*/
  _curry2(function difference(first, second) {
    var out = [];
    var idx = 0;
    var firstLen = first.length;
    var secondLen = second.length;
    var toFilterOut = new _Set();

    for (var i = 0; i < secondLen; i += 1) {
      toFilterOut.add(second[i]);
    }

    while (idx < firstLen) {
      if (toFilterOut.add(first[idx])) {
        out[out.length] = first[idx];
      }

      idx += 1;
    }

    return out;
  });

  /**
   * Finds the set (i.e. no duplicates) of all elements in the first list not
   * contained in the second list. Duplication is determined according to the
   * value returned by applying the supplied predicate to two list elements.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Relation
   * @sig ((a, a) -> Boolean) -> [a] -> [a] -> [a]
   * @param {Function} pred A predicate used to test whether two items are equal.
   * @param {Array} list1 The first list.
   * @param {Array} list2 The second list.
   * @return {Array} The elements in `list1` that are not in `list2`.
   * @see R.difference, R.symmetricDifference, R.symmetricDifferenceWith
   * @example
   *
   *      const cmp = (x, y) => x.a === y.a;
   *      const l1 = [{a: 1}, {a: 2}, {a: 3}];
   *      const l2 = [{a: 3}, {a: 4}];
   *      R.differenceWith(cmp, l1, l2); //=> [{a: 1}, {a: 2}]
   *
   *      R.differenceWith(R.equals, [1, 2, 3, 3, 3], []); //=> [1, 2, 3]
   *      R.differenceWith(R.equals, [1, 2, 3, 3, 3], [1]); //=> [2, 3]
   */

  var differenceWith =
  /*#__PURE__*/
  _curry3(function differenceWith(pred, first, second) {
    var out = [];
    var idx = 0;
    var firstLen = first.length;

    while (idx < firstLen) {
      if (!_includesWith(pred, first[idx], second) && !_includesWith(pred, first[idx], out)) {
        out.push(first[idx]);
      }

      idx += 1;
    }

    return out;
  });

  /**
   * Removes the sub-list of `list` starting at index `start` and containing
   * `count` elements. _Note that this is not destructive_: it returns a copy of
   * the list with the changes.
   * <small>No lists have been harmed in the application of this function.</small>
   *
   * @func
   * @memberOf R
   * @since v0.2.2
   * @category List
   * @sig Number -> Number -> [a] -> [a]
   * @param {Number} start The position to start removing elements
   * @param {Number} count The number of elements to remove
   * @param {Array} list The list to remove from
   * @return {Array} A new Array with `count` elements from `start` removed.
   * @see R.without
   * @example
   *
   *      R.remove(2, 3, [1,2,3,4,5,6,7,8]); //=> [1,2,6,7,8]
   */

  var remove =
  /*#__PURE__*/
  _curry3(function remove(start, count, list) {
    var result = Array.prototype.slice.call(list, 0);
    result.splice(start, count);
    return result;
  });

  /**
   * Returns a new object that does not contain a `prop` property.
   *
   * @private
   * @param {String|Number} prop The name of the property to dissociate
   * @param {Object|Array} obj The object to clone
   * @return {Object} A new object equivalent to the original but without the specified property
   */

  function _dissoc(prop, obj) {
    if (obj == null) {
      return obj;
    }

    if (_isInteger(prop) && _isArray(obj)) {
      return remove(prop, 1, obj);
    }

    var result = {};

    for (var p in obj) {
      result[p] = obj[p];
    }

    delete result[prop];
    return result;
  }

  /**
   * Makes a shallow clone of an object. Note that this copies and flattens
   * prototype properties onto the new object as well. All non-primitive
   * properties are copied by reference.
   *
   * @private
   * @param {String|Integer} prop The prop operating
   * @param {Object|Array} obj The object to clone
   * @return {Object|Array} A new object equivalent to the original.
   */

  function _shallowCloneObject(prop, obj) {
    if (_isInteger(prop) && _isArray(obj)) {
      return [].concat(obj);
    }

    var result = {};

    for (var p in obj) {
      result[p] = obj[p];
    }

    return result;
  }
  /**
   * Makes a shallow clone of an object, omitting the property at the given path.
   * Note that this copies and flattens prototype properties onto the new object
   * as well. All non-primitive properties are copied by reference.
   *
   * @func
   * @memberOf R
   * @since v0.11.0
   * @category Object
   * @typedefn Idx = String | Int | Symbol
   * @sig [Idx] -> {k: v} -> {k: v}
   * @param {Array} path The path to the value to omit
   * @param {Object} obj The object to clone
   * @return {Object} A new object without the property at path
   * @see R.assocPath
   * @example
   *
   *      R.dissocPath(['a', 'b', 'c'], {a: {b: {c: 42}}}); //=> {a: {b: {}}}
   */


  var dissocPath =
  /*#__PURE__*/
  _curry2(function dissocPath(path, obj) {
    if (obj == null) {
      return obj;
    }

    switch (path.length) {
      case 0:
        return obj;

      case 1:
        return _dissoc(path[0], obj);

      default:
        var head = path[0];
        var tail = Array.prototype.slice.call(path, 1);

        if (obj[head] == null) {
          return _shallowCloneObject(head, obj);
        } else {
          return assoc(head, dissocPath(tail, obj[head]), obj);
        }

    }
  });

  /**
   * Returns a new object that does not contain a `prop` property.
   *
   * @func
   * @memberOf R
   * @since v0.10.0
   * @category Object
   * @sig String -> {k: v} -> {k: v}
   * @param {String} prop The name of the property to dissociate
   * @param {Object} obj The object to clone
   * @return {Object} A new object equivalent to the original but without the specified property
   * @see R.assoc, R.omit
   * @example
   *
   *      R.dissoc('b', {a: 1, b: 2, c: 3}); //=> {a: 1, c: 3}
   */

  var dissoc =
  /*#__PURE__*/
  _curry2(function dissoc(prop, obj) {
    return dissocPath([prop], obj);
  });

  /**
   * Divides two numbers. Equivalent to `a / b`.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Math
   * @sig Number -> Number -> Number
   * @param {Number} a The first value.
   * @param {Number} b The second value.
   * @return {Number} The result of `a / b`.
   * @see R.multiply
   * @example
   *
   *      R.divide(71, 100); //=> 0.71
   *
   *      const half = R.divide(R.__, 2);
   *      half(42); //=> 21
   *
   *      const reciprocal = R.divide(1);
   *      reciprocal(4);   //=> 0.25
   */

  var divide =
  /*#__PURE__*/
  _curry2(function divide(a, b) {
    return a / b;
  });

  var XDrop =
  /*#__PURE__*/
  function () {
    function XDrop(n, xf) {
      this.xf = xf;
      this.n = n;
    }

    XDrop.prototype['@@transducer/init'] = _xfBase.init;
    XDrop.prototype['@@transducer/result'] = _xfBase.result;

    XDrop.prototype['@@transducer/step'] = function (result, input) {
      if (this.n > 0) {
        this.n -= 1;
        return result;
      }

      return this.xf['@@transducer/step'](result, input);
    };

    return XDrop;
  }();

  function _xdrop(n) {
    return function (xf) {
      return new XDrop(n, xf);
    };
  }

  /**
   * Returns all but the first `n` elements of the given list, string, or
   * transducer/transformer (or object with a `drop` method).
   *
   * Dispatches to the `drop` method of the second argument, if present.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig Number -> [a] -> [a]
   * @sig Number -> String -> String
   * @param {Number} n
   * @param {*} list
   * @return {*} A copy of list without the first `n` elements
   * @see R.take, R.transduce, R.dropLast, R.dropWhile
   * @example
   *
   *      R.drop(1, ['foo', 'bar', 'baz']); //=> ['bar', 'baz']
   *      R.drop(2, ['foo', 'bar', 'baz']); //=> ['baz']
   *      R.drop(3, ['foo', 'bar', 'baz']); //=> []
   *      R.drop(4, ['foo', 'bar', 'baz']); //=> []
   *      R.drop(3, 'ramda');               //=> 'da'
   */

  var drop$1 =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable(['drop'], _xdrop, function drop(n, xs) {
    return slice(Math.max(0, n), Infinity, xs);
  }));

  var XTake =
  /*#__PURE__*/
  function () {
    function XTake(n, xf) {
      this.xf = xf;
      this.n = n;
      this.i = 0;
    }

    XTake.prototype['@@transducer/init'] = _xfBase.init;
    XTake.prototype['@@transducer/result'] = _xfBase.result;

    XTake.prototype['@@transducer/step'] = function (result, input) {
      this.i += 1;
      var ret = this.n === 0 ? result : this.xf['@@transducer/step'](result, input);
      return this.n >= 0 && this.i >= this.n ? _reduced(ret) : ret;
    };

    return XTake;
  }();

  function _xtake(n) {
    return function (xf) {
      return new XTake(n, xf);
    };
  }

  /**
   * Returns the first `n` elements of the given list, string, or
   * transducer/transformer (or object with a `take` method).
   *
   * Dispatches to the `take` method of the second argument, if present.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig Number -> [a] -> [a]
   * @sig Number -> String -> String
   * @param {Number} n
   * @param {*} list
   * @return {*}
   * @see R.drop
   * @example
   *
   *      R.take(1, ['foo', 'bar', 'baz']); //=> ['foo']
   *      R.take(2, ['foo', 'bar', 'baz']); //=> ['foo', 'bar']
   *      R.take(3, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
   *      R.take(4, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
   *      R.take(3, 'ramda');               //=> 'ram'
   *
   *      const personnel = [
   *        'Dave Brubeck',
   *        'Paul Desmond',
   *        'Eugene Wright',
   *        'Joe Morello',
   *        'Gerry Mulligan',
   *        'Bob Bates',
   *        'Joe Dodge',
   *        'Ron Crotty'
   *      ];
   *
   *      const takeFive = R.take(5);
   *      takeFive(personnel);
   *      //=> ['Dave Brubeck', 'Paul Desmond', 'Eugene Wright', 'Joe Morello', 'Gerry Mulligan']
   * @symb R.take(-1, [a, b]) = [a, b]
   * @symb R.take(0, [a, b]) = []
   * @symb R.take(1, [a, b]) = [a]
   * @symb R.take(2, [a, b]) = [a, b]
   */

  var take =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable(['take'], _xtake, function take(n, xs) {
    return slice(0, n < 0 ? Infinity : n, xs);
  }));

  function dropLast$1(n, xs) {
    return take(n < xs.length ? xs.length - n : 0, xs);
  }

  var XDropLast =
  /*#__PURE__*/
  function () {
    function XDropLast(n, xf) {
      if (n <= 0) {
        return xf;
      }

      this.xf = xf;
      this.pos = 0;
      this.full = false;
      this.acc = new Array(n);
    }

    XDropLast.prototype['@@transducer/init'] = _xfBase.init;

    XDropLast.prototype['@@transducer/result'] = function (result) {
      this.acc = null;
      return this.xf['@@transducer/result'](result);
    };

    XDropLast.prototype['@@transducer/step'] = function (result, input) {
      if (this.full) {
        result = this.xf['@@transducer/step'](result, this.acc[this.pos]);
      }

      this.store(input);
      return result;
    };

    XDropLast.prototype.store = function (input) {
      this.acc[this.pos] = input;
      this.pos += 1;

      if (this.pos === this.acc.length) {
        this.pos = 0;
        this.full = true;
      }
    };

    return XDropLast;
  }();

  function _xdropLast(n) {
    return function (xf) {
      return new XDropLast(n, xf);
    };
  }

  /**
   * Returns a list containing all but the last `n` elements of the given `list`.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.16.0
   * @category List
   * @sig Number -> [a] -> [a]
   * @sig Number -> String -> String
   * @param {Number} n The number of elements of `list` to skip.
   * @param {Array} list The list of elements to consider.
   * @return {Array} A copy of the list with only the first `list.length - n` elements
   * @see R.takeLast, R.drop, R.dropWhile, R.dropLastWhile
   * @example
   *
   *      R.dropLast(1, ['foo', 'bar', 'baz']); //=> ['foo', 'bar']
   *      R.dropLast(2, ['foo', 'bar', 'baz']); //=> ['foo']
   *      R.dropLast(3, ['foo', 'bar', 'baz']); //=> []
   *      R.dropLast(4, ['foo', 'bar', 'baz']); //=> []
   *      R.dropLast(3, 'ramda');               //=> 'ra'
   */

  var dropLast =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable([], _xdropLast, dropLast$1));

  function dropLastWhile$1(pred, xs) {
    var idx = xs.length - 1;

    while (idx >= 0 && pred(xs[idx])) {
      idx -= 1;
    }

    return slice(0, idx + 1, xs);
  }

  var XDropLastWhile =
  /*#__PURE__*/
  function () {
    function XDropLastWhile(fn, xf) {
      this.f = fn;
      this.retained = [];
      this.xf = xf;
    }

    XDropLastWhile.prototype['@@transducer/init'] = _xfBase.init;

    XDropLastWhile.prototype['@@transducer/result'] = function (result) {
      this.retained = null;
      return this.xf['@@transducer/result'](result);
    };

    XDropLastWhile.prototype['@@transducer/step'] = function (result, input) {
      return this.f(input) ? this.retain(result, input) : this.flush(result, input);
    };

    XDropLastWhile.prototype.flush = function (result, input) {
      result = _xReduce(this.xf, result, this.retained);
      this.retained = [];
      return this.xf['@@transducer/step'](result, input);
    };

    XDropLastWhile.prototype.retain = function (result, input) {
      this.retained.push(input);
      return result;
    };

    return XDropLastWhile;
  }();

  function _xdropLastWhile(fn) {
    return function (xf) {
      return new XDropLastWhile(fn, xf);
    };
  }

  /**
   * Returns a new list excluding all the tailing elements of a given list which
   * satisfy the supplied predicate function. It passes each value from the right
   * to the supplied predicate function, skipping elements until the predicate
   * function returns a `falsy` value. The predicate function is applied to one argument:
   * *(value)*.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.16.0
   * @category List
   * @sig (a -> Boolean) -> [a] -> [a]
   * @sig (a -> Boolean) -> String -> String
   * @param {Function} predicate The function to be called on each element
   * @param {Array} xs The collection to iterate over.
   * @return {Array} A new array without any trailing elements that return `falsy` values from the `predicate`.
   * @see R.takeLastWhile, R.addIndex, R.drop, R.dropWhile
   * @example
   *
   *      const lteThree = x => x <= 3;
   *
   *      R.dropLastWhile(lteThree, [1, 2, 3, 4, 3, 2, 1]); //=> [1, 2, 3, 4]
   *
   *      R.dropLastWhile(x => x !== 'd' , 'Ramda'); //=> 'Ramd'
   */

  var dropLastWhile =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable([], _xdropLastWhile, dropLastWhile$1));

  var XDropRepeatsWith =
  /*#__PURE__*/
  function () {
    function XDropRepeatsWith(pred, xf) {
      this.xf = xf;
      this.pred = pred;
      this.lastValue = undefined;
      this.seenFirstValue = false;
    }

    XDropRepeatsWith.prototype['@@transducer/init'] = _xfBase.init;
    XDropRepeatsWith.prototype['@@transducer/result'] = _xfBase.result;

    XDropRepeatsWith.prototype['@@transducer/step'] = function (result, input) {
      var sameAsLast = false;

      if (!this.seenFirstValue) {
        this.seenFirstValue = true;
      } else if (this.pred(this.lastValue, input)) {
        sameAsLast = true;
      }

      this.lastValue = input;
      return sameAsLast ? result : this.xf['@@transducer/step'](result, input);
    };

    return XDropRepeatsWith;
  }();

  function _xdropRepeatsWith(pred) {
    return function (xf) {
      return new XDropRepeatsWith(pred, xf);
    };
  }

  /**
   * Returns the last element of the given list or string.
   *
   * @func
   * @memberOf R
   * @since v0.1.4
   * @category List
   * @sig [a] -> a | Undefined
   * @sig String -> String
   * @param {*} list
   * @return {*}
   * @see R.init, R.head, R.tail
   * @example
   *
   *      R.last(['fi', 'fo', 'fum']); //=> 'fum'
   *      R.last([]); //=> undefined
   *
   *      R.last('abc'); //=> 'c'
   *      R.last(''); //=> ''
   */

  var last =
  /*#__PURE__*/
  nth(-1);

  /**
   * Returns a new list without any consecutively repeating elements. Equality is
   * determined by applying the supplied predicate to each pair of consecutive elements. The
   * first element in a series of equal elements will be preserved.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.14.0
   * @category List
   * @sig ((a, a) -> Boolean) -> [a] -> [a]
   * @param {Function} pred A predicate used to test whether two items are equal.
   * @param {Array} list The array to consider.
   * @return {Array} `list` without repeating elements.
   * @see R.transduce
   * @example
   *
   *      const l = [1, -1, 1, 3, 4, -4, -4, -5, 5, 3, 3];
   *      R.dropRepeatsWith(R.eqBy(Math.abs), l); //=> [1, 3, 4, -5, 3]
   */

  var dropRepeatsWith =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable([], _xdropRepeatsWith, function dropRepeatsWith(pred, list) {
    var result = [];
    var idx = 1;
    var len = list.length;

    if (len !== 0) {
      result[0] = list[0];

      while (idx < len) {
        if (!pred(last(result), list[idx])) {
          result[result.length] = list[idx];
        }

        idx += 1;
      }
    }

    return result;
  }));

  /**
   * Returns a new list without any consecutively repeating elements.
   * [`R.equals`](#equals) is used to determine equality.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.14.0
   * @category List
   * @sig [a] -> [a]
   * @param {Array} list The array to consider.
   * @return {Array} `list` without repeating elements.
   * @see R.transduce
   * @example
   *
   *     R.dropRepeats([1, 1, 1, 2, 3, 4, 4, 2, 2]); //=> [1, 2, 3, 4, 2]
   */

  var dropRepeats =
  /*#__PURE__*/
  _curry1(
  /*#__PURE__*/
  _dispatchable([], function () {
    return _xdropRepeatsWith(equals);
  },
  /*#__PURE__*/
  dropRepeatsWith(equals)));

  /**
   * Takes a function and two values in its domain and returns `true` if the
   * values map to the same value in the codomain; `false` otherwise.
   *
   * @func
   * @memberOf R
   * @since v0.18.0
   * @category Relation
   * @sig (a -> b) -> a -> a -> Boolean
   * @param {Function} f
   * @param {*} x
   * @param {*} y
   * @return {Boolean}
   * @example
   *
   *      R.eqBy(Math.abs, 5, -5); //=> true
   */

  var eqBy =
  /*#__PURE__*/
  _curry3(function eqBy(f, x, y) {
    return equals(f(x), f(y));
  });

  /**
   * Returns a new list without any consecutively repeating elements,
   * based upon the value returned by applying the supplied function to
   * each list element. [`R.equals`](#equals) is used to determine equality.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.29.0
   * @category List
   * @sig (a -> b) -> [a] -> [a]
   * @param {Function} fn A function used to produce a value to use during comparisons.
   * @param {Array} list The array to consider.
   * @return {Array} `list` without repeating elements.
   * @see R.transduce
   * @example
   *
   *     R.dropRepeatsBy(Math.abs, [1, -1, -1, 2, 3, -4, 4, 2, 2]); //=> [1, 2, 3, -4, 2]
   */

  var dropRepeatsBy =
  /*#__PURE__*/
  _curry2(function (fn, list) {
    return _dispatchable([], function () {
      return _xdropRepeatsWith(eqBy(fn));
    }, dropRepeatsWith(eqBy(fn)))(list);
  });

  var XDropWhile =
  /*#__PURE__*/
  function () {
    function XDropWhile(f, xf) {
      this.xf = xf;
      this.f = f;
    }

    XDropWhile.prototype['@@transducer/init'] = _xfBase.init;
    XDropWhile.prototype['@@transducer/result'] = _xfBase.result;

    XDropWhile.prototype['@@transducer/step'] = function (result, input) {
      if (this.f) {
        if (this.f(input)) {
          return result;
        }

        this.f = null;
      }

      return this.xf['@@transducer/step'](result, input);
    };

    return XDropWhile;
  }();

  function _xdropWhile(f) {
    return function (xf) {
      return new XDropWhile(f, xf);
    };
  }

  /**
   * Returns a new list excluding the leading elements of a given list which
   * satisfy the supplied predicate function. It passes each value to the supplied
   * predicate function, skipping elements while the predicate function returns
   * `true`. The predicate function is applied to one argument: *(value)*.
   *
   * Dispatches to the `dropWhile` method of the second argument, if present.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category List
   * @sig (a -> Boolean) -> [a] -> [a]
   * @sig (a -> Boolean) -> String -> String
   * @param {Function} fn The function called per iteration.
   * @param {Array} xs The collection to iterate over.
   * @return {Array} A new array.
   * @see R.takeWhile, R.transduce, R.addIndex
   * @example
   *
   *      const lteTwo = x => x <= 2;
   *
   *      R.dropWhile(lteTwo, [1, 2, 3, 4, 3, 2, 1]); //=> [3, 4, 3, 2, 1]
   *
   *      R.dropWhile(x => x !== 'd' , 'Ramda'); //=> 'da'
   */

  var dropWhile =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable(['dropWhile'], _xdropWhile, function dropWhile(pred, xs) {
    var idx = 0;
    var len = xs.length;

    while (idx < len && pred(xs[idx])) {
      idx += 1;
    }

    return slice(idx, Infinity, xs);
  }));

  /**
   * Returns the first argument if it is truthy, otherwise the second argument.
   * Acts as the boolean `or` statement if both inputs are `Boolean`s.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Logic
   * @sig a -> b -> a | b
   * @param {Any} a
   * @param {Any} b
   * @return {Any}
   * @see R.either, R.and
   * @example
   *
   *      R.or(true, true); //=> true
   *      R.or(true, false); //=> true
   *      R.or(false, true); //=> true
   *      R.or(false, false); //=> false
   */

  var or =
  /*#__PURE__*/
  _curry2(function or(a, b) {
    return a || b;
  });

  /**
   * A function wrapping calls to the two functions in an `||` operation,
   * returning the result of the first function if it is truth-y and the result
   * of the second function otherwise. Note that this is short-circuited,
   * meaning that the second function will not be invoked if the first returns a
   * truth-y value.
   *
   * In addition to functions, `R.either` also accepts any fantasy-land compatible
   * applicative functor.
   *
   * @func
   * @memberOf R
   * @since v0.12.0
   * @category Logic
   * @sig (*... -> Boolean) -> (*... -> Boolean) -> (*... -> Boolean)
   * @param {Function} f a predicate
   * @param {Function} g another predicate
   * @return {Function} a function that applies its arguments to `f` and `g` and `||`s their outputs together.
   * @see R.both, R.anyPass, R.or
   * @example
   *
   *      const gt10 = x => x > 10;
   *      const even = x => x % 2 === 0;
   *      const f = R.either(gt10, even);
   *      f(101); //=> true
   *      f(8); //=> true
   *
   *      R.either(Maybe.Just(false), Maybe.Just(55)); // => Maybe.Just(55)
   *      R.either([false, false, 'a'], [11]) // => [11, 11, "a"]
   */

  var either =
  /*#__PURE__*/
  _curry2(function either(f, g) {
    return _isFunction(f) ? function _either() {
      return f.apply(this, arguments) || g.apply(this, arguments);
    } : lift(or)(f, g);
  });

  /**
   * Tests whether or not an object is a typed array.
   *
   * @private
   * @param {*} val The object to test.
   * @return {Boolean} `true` if `val` is a typed array, `false` otherwise.
   * @example
   *
   *      _isTypedArray(new Uint8Array([])); //=> true
   *      _isTypedArray(new Float32Array([])); //=> true
   *      _isTypedArray([]); //=> false
   *      _isTypedArray(null); //=> false
   *      _isTypedArray({}); //=> false
   */
  function _isTypedArray(val) {
    var type = Object.prototype.toString.call(val);
    return type === '[object Uint8ClampedArray]' || type === '[object Int8Array]' || type === '[object Uint8Array]' || type === '[object Int16Array]' || type === '[object Uint16Array]' || type === '[object Int32Array]' || type === '[object Uint32Array]' || type === '[object Float32Array]' || type === '[object Float64Array]' || type === '[object BigInt64Array]' || type === '[object BigUint64Array]';
  }

  /**
   * Returns the empty value of its argument's type. Ramda defines the empty
   * value of Array (`[]`), Object (`{}`), String (`''`),
   * TypedArray (`Uint8Array []`, `Float32Array []`, etc), and Arguments. Other
   * types are supported if they define `<Type>.empty`,
   * `<Type>.prototype.empty` or implement the
   * [FantasyLand Monoid spec](https://github.com/fantasyland/fantasy-land#monoid).
   *
   * Dispatches to the `empty` method of the first argument, if present.
   *
   * @func
   * @memberOf R
   * @since v0.3.0
   * @category Function
   * @sig a -> a
   * @param {*} x
   * @return {*}
   * @example
   *
   *      R.empty(Just(42));               //=> Nothing()
   *      R.empty([1, 2, 3]);              //=> []
   *      R.empty('unicorns');             //=> ''
   *      R.empty({x: 1, y: 2});           //=> {}
   *      R.empty(Uint8Array.from('123')); //=> Uint8Array []
   */

  var empty =
  /*#__PURE__*/
  _curry1(function empty(x) {
    return x != null && typeof x['fantasy-land/empty'] === 'function' ? x['fantasy-land/empty']() : x != null && x.constructor != null && typeof x.constructor['fantasy-land/empty'] === 'function' ? x.constructor['fantasy-land/empty']() : x != null && typeof x.empty === 'function' ? x.empty() : x != null && x.constructor != null && typeof x.constructor.empty === 'function' ? x.constructor.empty() : _isArray(x) ? [] : _isString(x) ? '' : _isObject(x) ? {} : _isArguments(x) ? function () {
      return arguments;
    }() : _isTypedArray(x) ? x.constructor.from('') : void 0 // else
    ;
  });

  /**
   * Returns a new list containing the last `n` elements of the given list.
   * If `n > list.length`, returns a list of `list.length` elements.
   *
   * @func
   * @memberOf R
   * @since v0.16.0
   * @category List
   * @sig Number -> [a] -> [a]
   * @sig Number -> String -> String
   * @param {Number} n The number of elements to return.
   * @param {Array} xs The collection to consider.
   * @return {Array}
   * @see R.dropLast
   * @example
   *
   *      R.takeLast(1, ['foo', 'bar', 'baz']); //=> ['baz']
   *      R.takeLast(2, ['foo', 'bar', 'baz']); //=> ['bar', 'baz']
   *      R.takeLast(3, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
   *      R.takeLast(4, ['foo', 'bar', 'baz']); //=> ['foo', 'bar', 'baz']
   *      R.takeLast(3, 'ramda');               //=> 'mda'
   */

  var takeLast =
  /*#__PURE__*/
  _curry2(function takeLast(n, xs) {
    return drop$1(n >= 0 ? xs.length - n : 0, xs);
  });

  /**
   * Checks if a list ends with the provided sublist.
   *
   * Similarly, checks if a string ends with the provided substring.
   *
   * @func
   * @memberOf R
   * @since v0.24.0
   * @category List
   * @sig [a] -> [a] -> Boolean
   * @sig String -> String -> Boolean
   * @param {*} suffix
   * @param {*} list
   * @return {Boolean}
   * @see R.startsWith
   * @example
   *
   *      R.endsWith('c', 'abc')                //=> true
   *      R.endsWith('b', 'abc')                //=> false
   *      R.endsWith(['c'], ['a', 'b', 'c'])    //=> true
   *      R.endsWith(['b'], ['a', 'b', 'c'])    //=> false
   */

  var endsWith =
  /*#__PURE__*/
  _curry2(function (suffix, list) {
    return equals(takeLast(suffix.length, list), suffix);
  });

  /**
   * Reports whether two objects have the same value, in [`R.equals`](#equals)
   * terms, for the specified property. Useful as a curried predicate.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Object
   * @sig k -> {k: v} -> {k: v} -> Boolean
   * @param {String} prop The name of the property to compare
   * @param {Object} obj1
   * @param {Object} obj2
   * @return {Boolean}
   *
   * @example
   *
   *      const o1 = { a: 1, b: 2, c: 3, d: 4 };
   *      const o2 = { a: 10, b: 20, c: 3, d: 40 };
   *      R.eqProps('a', o1, o2); //=> false
   *      R.eqProps('c', o1, o2); //=> true
   */

  var eqProps =
  /*#__PURE__*/
  _curry3(function eqProps(prop, obj1, obj2) {
    return equals(obj1[prop], obj2[prop]);
  });

  /**
   * Creates a new object by recursively evolving a shallow copy of `object`,
   * according to the `transformation` functions. All non-primitive properties
   * are copied by reference.
   *
   * A `transformation` function will not be invoked if its corresponding key
   * does not exist in the evolved object.
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category Object
   * @sig {k: (v -> v)} -> {k: v} -> {k: v}
   * @param {Object} transformations The object specifying transformation functions to apply
   *        to the object.
   * @param {Object} object The object to be transformed.
   * @return {Object} The transformed object.
   * @example
   *
   *      const tomato = {firstName: '  Tomato ', data: {elapsed: 100, remaining: 1400}, id:123};
   *      const transformations = {
   *        firstName: R.trim,
   *        lastName: R.trim, // Will not get invoked.
   *        data: {elapsed: R.add(1), remaining: R.add(-1)}
   *      };
   *      R.evolve(transformations, tomato); //=> {firstName: 'Tomato', data: {elapsed: 101, remaining: 1399}, id:123}
   */

  var evolve =
  /*#__PURE__*/
  _curry2(function evolve(transformations, object) {
    if (!_isObject(object) && !_isArray(object)) {
      return object;
    }

    var result = object instanceof Array ? [] : {};
    var transformation, key, type;

    for (key in object) {
      transformation = transformations[key];
      type = typeof transformation;
      result[key] = type === 'function' ? transformation(object[key]) : transformation && type === 'object' ? evolve(transformation, object[key]) : object[key];
    }

    return result;
  });

  var XFind =
  /*#__PURE__*/
  function () {
    function XFind(f, xf) {
      this.xf = xf;
      this.f = f;
      this.found = false;
    }

    XFind.prototype['@@transducer/init'] = _xfBase.init;

    XFind.prototype['@@transducer/result'] = function (result) {
      if (!this.found) {
        result = this.xf['@@transducer/step'](result, void 0);
      }

      return this.xf['@@transducer/result'](result);
    };

    XFind.prototype['@@transducer/step'] = function (result, input) {
      if (this.f(input)) {
        this.found = true;
        result = _reduced(this.xf['@@transducer/step'](result, input));
      }

      return result;
    };

    return XFind;
  }();

  function _xfind(f) {
    return function (xf) {
      return new XFind(f, xf);
    };
  }

  /**
   * Returns the first element of the list which matches the predicate, or
   * `undefined` if no element matches.
   *
   * Dispatches to the `find` method of the second argument, if present.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig (a -> Boolean) -> [a] -> a | undefined
   * @param {Function} fn The predicate function used to determine if the element is the
   *        desired one.
   * @param {Array} list The array to consider.
   * @return {Object} The element found, or `undefined`.
   * @see R.transduce
   * @example
   *
   *      const xs = [{a: 1}, {a: 2}, {a: 3}];
   *      R.find(R.propEq(2, 'a'))(xs); //=> {a: 2}
   *      R.find(R.propEq(4, 'a'))(xs); //=> undefined
   */

  var find$1 =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable(['find'], _xfind, function find(fn, list) {
    var idx = 0;
    var len = list.length;

    while (idx < len) {
      if (fn(list[idx])) {
        return list[idx];
      }

      idx += 1;
    }
  }));

  var XFindIndex =
  /*#__PURE__*/
  function () {
    function XFindIndex(f, xf) {
      this.xf = xf;
      this.f = f;
      this.idx = -1;
      this.found = false;
    }

    XFindIndex.prototype['@@transducer/init'] = _xfBase.init;

    XFindIndex.prototype['@@transducer/result'] = function (result) {
      if (!this.found) {
        result = this.xf['@@transducer/step'](result, -1);
      }

      return this.xf['@@transducer/result'](result);
    };

    XFindIndex.prototype['@@transducer/step'] = function (result, input) {
      this.idx += 1;

      if (this.f(input)) {
        this.found = true;
        result = _reduced(this.xf['@@transducer/step'](result, this.idx));
      }

      return result;
    };

    return XFindIndex;
  }();

  function _xfindIndex(f) {
    return function (xf) {
      return new XFindIndex(f, xf);
    };
  }

  /**
   * Returns the index of the first element of the list which matches the
   * predicate, or `-1` if no element matches.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.1.1
   * @category List
   * @sig (a -> Boolean) -> [a] -> Number
   * @param {Function} fn The predicate function used to determine if the element is the
   * desired one.
   * @param {Array} list The array to consider.
   * @return {Number} The index of the element found, or `-1`.
   * @see R.transduce, R.indexOf
   * @example
   *
   *      const xs = [{a: 1}, {a: 2}, {a: 3}];
   *      R.findIndex(R.propEq(2, 'a'))(xs); //=> 1
   *      R.findIndex(R.propEq(4, 'a'))(xs); //=> -1
   */

  var findIndex$1 =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable([], _xfindIndex, function findIndex(fn, list) {
    var idx = 0;
    var len = list.length;

    while (idx < len) {
      if (fn(list[idx])) {
        return idx;
      }

      idx += 1;
    }

    return -1;
  }));

  var XFindLast =
  /*#__PURE__*/
  function () {
    function XFindLast(f, xf) {
      this.xf = xf;
      this.f = f;
    }

    XFindLast.prototype['@@transducer/init'] = _xfBase.init;

    XFindLast.prototype['@@transducer/result'] = function (result) {
      return this.xf['@@transducer/result'](this.xf['@@transducer/step'](result, this.last));
    };

    XFindLast.prototype['@@transducer/step'] = function (result, input) {
      if (this.f(input)) {
        this.last = input;
      }

      return result;
    };

    return XFindLast;
  }();

  function _xfindLast(f) {
    return function (xf) {
      return new XFindLast(f, xf);
    };
  }

  /**
   * Returns the last element of the list which matches the predicate, or
   * `undefined` if no element matches.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.1.1
   * @category List
   * @sig (a -> Boolean) -> [a] -> a | undefined
   * @param {Function} fn The predicate function used to determine if the element is the
   * desired one.
   * @param {Array} list The array to consider.
   * @return {Object} The element found, or `undefined`.
   * @see R.transduce
   * @example
   *
   *      const xs = [{a: 1, b: 0}, {a:1, b: 1}];
   *      R.findLast(R.propEq(1, 'a'))(xs); //=> {a: 1, b: 1}
   *      R.findLast(R.propEq(4, 'a'))(xs); //=> undefined
   */

  var findLast =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable([], _xfindLast, function findLast(fn, list) {
    var idx = list.length - 1;

    while (idx >= 0) {
      if (fn(list[idx])) {
        return list[idx];
      }

      idx -= 1;
    }
  }));

  var XFindLastIndex =
  /*#__PURE__*/
  function () {
    function XFindLastIndex(f, xf) {
      this.xf = xf;
      this.f = f;
      this.idx = -1;
      this.lastIdx = -1;
    }

    XFindLastIndex.prototype['@@transducer/init'] = _xfBase.init;

    XFindLastIndex.prototype['@@transducer/result'] = function (result) {
      return this.xf['@@transducer/result'](this.xf['@@transducer/step'](result, this.lastIdx));
    };

    XFindLastIndex.prototype['@@transducer/step'] = function (result, input) {
      this.idx += 1;

      if (this.f(input)) {
        this.lastIdx = this.idx;
      }

      return result;
    };

    return XFindLastIndex;
  }();

  function _xfindLastIndex(f) {
    return function (xf) {
      return new XFindLastIndex(f, xf);
    };
  }

  /**
   * Returns the index of the last element of the list which matches the
   * predicate, or `-1` if no element matches.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.1.1
   * @category List
   * @sig (a -> Boolean) -> [a] -> Number
   * @param {Function} fn The predicate function used to determine if the element is the
   * desired one.
   * @param {Array} list The array to consider.
   * @return {Number} The index of the element found, or `-1`.
   * @see R.transduce, R.lastIndexOf
   * @example
   *
   *      const xs = [{a: 1, b: 0}, {a:1, b: 1}];
   *      R.findLastIndex(R.propEq(1, 'a'))(xs); //=> 1
   *      R.findLastIndex(R.propEq(4, 'a'))(xs); //=> -1
   */

  var findLastIndex =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable([], _xfindLastIndex, function findLastIndex(fn, list) {
    var idx = list.length - 1;

    while (idx >= 0) {
      if (fn(list[idx])) {
        return idx;
      }

      idx -= 1;
    }

    return -1;
  }));

  /**
   * Returns a new list by pulling every item out of it (and all its sub-arrays)
   * and putting them in a new array, depth-first.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig [a] -> [b]
   * @param {Array} list The array to consider.
   * @return {Array} The flattened list.
   * @see R.unnest
   * @example
   *
   *      R.flatten([1, 2, [3, 4], 5, [6, [7, 8, [9, [10, 11], 12]]]]);
   *      //=> [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
   */

  var flatten =
  /*#__PURE__*/
  _curry1(
  /*#__PURE__*/
  _makeFlat(true));

  /**
   * Returns a new function much like the supplied one, except that the first two
   * arguments' order is reversed.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Function
   * @sig ((a, b, c, ...) -> z) -> (b -> a -> c -> ... -> z)
   * @param {Function} fn The function to invoke with its first two parameters reversed.
   * @return {*} The result of invoking `fn` with its first two parameters' order reversed.
   * @example
   *
   *      const mergeThree = (a, b, c) => [].concat(a, b, c);
   *
   *      mergeThree(1, 2, 3); //=> [1, 2, 3]
   *
   *      R.flip(mergeThree)(1, 2, 3); //=> [2, 1, 3]
   * @symb R.flip(f)(a, b, c) = f(b, a, c)
   */

  var flip =
  /*#__PURE__*/
  _curry1(function flip(fn) {
    return curryN(fn.length, function (a, b) {
      var args = Array.prototype.slice.call(arguments, 0);
      args[0] = b;
      args[1] = a;
      return fn.apply(this, args);
    });
  });

  /**
   * Iterate over an input `list`, calling a provided function `fn` for each
   * element in the list.
   *
   * `fn` receives one argument: *(value)*.
   *
   * Note: `R.forEach` does not skip deleted or unassigned indices (sparse
   * arrays), unlike the native `Array.prototype.forEach` method. For more
   * details on this behavior, see:
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#Description
   *
   * Also note that, unlike `Array.prototype.forEach`, Ramda's `forEach` returns
   * the original array. In some libraries this function is named `each`.
   *
   * Dispatches to the `forEach` method of the second argument, if present.
   *
   * @func
   * @memberOf R
   * @since v0.1.1
   * @category List
   * @sig (a -> *) -> [a] -> [a]
   * @param {Function} fn The function to invoke. Receives one argument, `value`.
   * @param {Array} list The list to iterate over.
   * @return {Array} The original list.
   * @see R.addIndex
   * @example
   *
   *      const printXPlusFive = x => console.log(x + 5);
   *      R.forEach(printXPlusFive, [1, 2, 3]); //=> [1, 2, 3]
   *      // logs 6
   *      // logs 7
   *      // logs 8
   * @symb R.forEach(f, [a, b, c]) = [a, b, c]
   */

  var forEach =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _checkForMethod('forEach', function forEach(fn, list) {
    var len = list.length;
    var idx = 0;

    while (idx < len) {
      fn(list[idx]);
      idx += 1;
    }

    return list;
  }));

  /**
   * Iterate over an input `object`, calling a provided function `fn` for each
   * key and value in the object.
   *
   * `fn` receives three argument: *(value, key, obj)*.
   *
   * @func
   * @memberOf R
   * @since v0.23.0
   * @category Object
   * @sig ((a, String, StrMap a) -> Any) -> StrMap a -> StrMap a
   * @param {Function} fn The function to invoke. Receives three argument, `value`, `key`, `obj`.
   * @param {Object} obj The object to iterate over.
   * @return {Object} The original object.
   * @example
   *
   *      const printKeyConcatValue = (value, key) => console.log(key + ':' + value);
   *      R.forEachObjIndexed(printKeyConcatValue, {x: 1, y: 2}); //=> {x: 1, y: 2}
   *      // logs x:1
   *      // logs y:2
   * @symb R.forEachObjIndexed(f, {x: a, y: b}) = {x: a, y: b}
   */

  var forEachObjIndexed =
  /*#__PURE__*/
  _curry2(function forEachObjIndexed(fn, obj) {
    var keyList = keys(obj);
    var idx = 0;

    while (idx < keyList.length) {
      var key = keyList[idx];
      fn(obj[key], key, obj);
      idx += 1;
    }

    return obj;
  });

  /**
   * Creates a new object from a list key-value pairs. If a key appears in
   * multiple pairs, the rightmost pair is included in the object.
   *
   * @func
   * @memberOf R
   * @since v0.3.0
   * @category List
   * @sig [[k,v]] -> {k: v}
   * @param {Array} pairs An array of two-element arrays that will be the keys and values of the output object.
   * @return {Object} The object made by pairing up `keys` and `values`.
   * @see R.toPairs, R.pair
   * @example
   *
   *      R.fromPairs([['a', 1], ['b', 2], ['c', 3]]); //=> {a: 1, b: 2, c: 3}
   */

  var fromPairs =
  /*#__PURE__*/
  _curry1(function fromPairs(pairs) {
    var result = {};
    var idx = 0;

    while (idx < pairs.length) {
      result[pairs[idx][0]] = pairs[idx][1];
      idx += 1;
    }

    return result;
  });

  /**
   * Splits a list into sub-lists stored in an object, based on the result of
   * calling a key-returning function on each element, and grouping the
   * results according to values returned.
   *
   * Dispatches to the `groupBy` method of the second argument, if present.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @typedefn Idx = String | Int | Symbol
   * @sig Idx a => (b -> a) -> [b] -> {a: [b]}
   * @param {Function} fn Function :: a -> Idx
   * @param {Array} list The array to group
   * @return {Object} An object with the output of `fn` for keys, mapped to arrays of elements
   *         that produced that key when passed to `fn`.
   * @see R.reduceBy, R.transduce, R.indexBy, R.collectBy
   * @example
   *
   *      const byGrade = R.groupBy(function(student) {
   *        const score = student.score;
   *        return score < 65 ? 'F' :
   *               score < 70 ? 'D' :
   *               score < 80 ? 'C' :
   *               score < 90 ? 'B' : 'A';
   *      });
   *      const students = [{name: 'Abby', score: 84},
   *                      {name: 'Eddy', score: 58},
   *                      // ...
   *                      {name: 'Jack', score: 69}];
   *      byGrade(students);
   *      // {
   *      //   'A': [{name: 'Dianne', score: 99}],
   *      //   'B': [{name: 'Abby', score: 84}]
   *      //   // ...,
   *      //   'F': [{name: 'Eddy', score: 58}]
   *      // }
   */

  var groupBy =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _checkForMethod('groupBy',
  /*#__PURE__*/
  reduceBy(function (acc, item) {
    acc.push(item);
    return acc;
  }, [])));

  /**
   * Takes a list and returns a list of lists where each sublist's elements are
   * all satisfied pairwise comparison according to the provided function.
   * Only adjacent elements are passed to the comparison function.
   *
   * @func
   * @memberOf R
   * @since v0.21.0
   * @category List
   * @sig ((a, a) → Boolean) → [a] → [[a]]
   * @param {Function} fn Function for determining whether two given (adjacent)
   *        elements should be in the same group
   * @param {Array} list The array to group. Also accepts a string, which will be
   *        treated as a list of characters.
   * @return {List} A list that contains sublists of elements,
   *         whose concatenations are equal to the original list.
   * @example
   *
   * R.groupWith(R.equals, [0, 1, 1, 2, 3, 5, 8, 13, 21])
   * //=> [[0], [1, 1], [2], [3], [5], [8], [13], [21]]
   *
   * R.groupWith((a, b) => a + 1 === b, [0, 1, 1, 2, 3, 5, 8, 13, 21])
   * //=> [[0, 1], [1, 2, 3], [5], [8], [13], [21]]
   *
   * R.groupWith((a, b) => a % 2 === b % 2, [0, 1, 1, 2, 3, 5, 8, 13, 21])
   * //=> [[0], [1, 1], [2], [3, 5], [8], [13, 21]]
   *
   * const isVowel = R.test(/^[aeiou]$/i);
   * R.groupWith(R.eqBy(isVowel), 'aestiou')
   * //=> ['ae', 'st', 'iou']
   */

  var groupWith =
  /*#__PURE__*/
  _curry2(function (fn, list) {
    var res = [];
    var idx = 0;
    var len = list.length;

    while (idx < len) {
      var nextidx = idx + 1;

      while (nextidx < len && fn(list[nextidx - 1], list[nextidx])) {
        nextidx += 1;
      }

      res.push(list.slice(idx, nextidx));
      idx = nextidx;
    }

    return res;
  });

  /**
   * Returns `true` if the first argument is greater than the second; `false`
   * otherwise.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Relation
   * @sig Ord a => a -> a -> Boolean
   * @param {*} a
   * @param {*} b
   * @return {Boolean}
   * @see R.lt
   * @example
   *
   *      R.gt(2, 1); //=> true
   *      R.gt(2, 2); //=> false
   *      R.gt(2, 3); //=> false
   *      R.gt('a', 'z'); //=> false
   *      R.gt('z', 'a'); //=> true
   */

  var gt =
  /*#__PURE__*/
  _curry2(function gt(a, b) {
    return a > b;
  });

  /**
   * Returns `true` if the first argument is greater than or equal to the second;
   * `false` otherwise.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Relation
   * @sig Ord a => a -> a -> Boolean
   * @param {Number} a
   * @param {Number} b
   * @return {Boolean}
   * @see R.lte
   * @example
   *
   *      R.gte(2, 1); //=> true
   *      R.gte(2, 2); //=> true
   *      R.gte(2, 3); //=> false
   *      R.gte('a', 'z'); //=> false
   *      R.gte('z', 'a'); //=> true
   */

  var gte =
  /*#__PURE__*/
  _curry2(function gte(a, b) {
    return a >= b;
  });

  /**
   * Returns whether or not a path exists in an object. Only the object's
   * own properties are checked.
   *
   * @func
   * @memberOf R
   * @since v0.26.0
   * @category Object
   * @typedefn Idx = String | Int | Symbol
   * @sig [Idx] -> {a} -> Boolean
   * @param {Array} path The path to use.
   * @param {Object} obj The object to check the path in.
   * @return {Boolean} Whether the path exists.
   * @see R.has
   * @example
   *
   *      R.hasPath(['a', 'b'], {a: {b: 2}});         // => true
   *      R.hasPath(['a', 'b'], {a: {b: undefined}}); // => true
   *      R.hasPath(['a', 'b'], {a: {c: 2}});         // => false
   *      R.hasPath(['a', 'b'], {});                  // => false
   */

  var hasPath =
  /*#__PURE__*/
  _curry2(function hasPath(_path, obj) {
    if (_path.length === 0 || isNil(obj)) {
      return false;
    }

    var val = obj;
    var idx = 0;

    while (idx < _path.length) {
      if (!isNil(val) && _has(_path[idx], val)) {
        val = val[_path[idx]];
        idx += 1;
      } else {
        return false;
      }
    }

    return true;
  });

  /**
   * Returns whether or not an object has an own property with the specified name
   *
   * @func
   * @memberOf R
   * @since v0.7.0
   * @category Object
   * @sig s -> {s: x} -> Boolean
   * @param {String} prop The name of the property to check for.
   * @param {Object} obj The object to query.
   * @return {Boolean} Whether the property exists.
   * @example
   *
   *      const hasName = R.has('name');
   *      hasName({name: 'alice'});   //=> true
   *      hasName({name: 'bob'});     //=> true
   *      hasName({});                //=> false
   *
   *      const point = {x: 0, y: 0};
   *      const pointHas = R.has(R.__, point);
   *      pointHas('x');  //=> true
   *      pointHas('y');  //=> true
   *      pointHas('z');  //=> false
   */

  var has =
  /*#__PURE__*/
  _curry2(function has(prop, obj) {
    return hasPath([prop], obj);
  });

  /**
   * Returns whether or not an object or its prototype chain has a property with
   * the specified name
   *
   * @func
   * @memberOf R
   * @since v0.7.0
   * @category Object
   * @sig s -> {s: x} -> Boolean
   * @param {String} prop The name of the property to check for.
   * @param {Object} obj The object to query.
   * @return {Boolean} Whether the property exists.
   * @example
   *
   *      function Rectangle(width, height) {
   *        this.width = width;
   *        this.height = height;
   *      }
   *      Rectangle.prototype.area = function() {
   *        return this.width * this.height;
   *      };
   *
   *      const square = new Rectangle(2, 2);
   *      R.hasIn('width', square);  //=> true
   *      R.hasIn('area', square);  //=> true
   */

  var hasIn =
  /*#__PURE__*/
  _curry2(function hasIn(prop, obj) {
    if (isNil(obj)) {
      return false;
    }

    return prop in obj;
  });

  /**
   * Returns true if its arguments are identical, false otherwise. Values are
   * identical if they reference the same memory. `NaN` is identical to `NaN`;
   * `0` and `-0` are not identical.
   *
   * Note this is merely a curried version of ES6 `Object.is`.
   *
   * `identical` does not support the `__` placeholder.
   *
   * @func
   * @memberOf R
   * @since v0.15.0
   * @category Relation
   * @sig a -> a -> Boolean
   * @param {*} a
   * @param {*} b
   * @return {Boolean}
   * @example
   *
   *      const o = {};
   *      R.identical(o, o); //=> true
   *      R.identical(1, 1); //=> true
   *      R.identical(1, '1'); //=> false
   *      R.identical([], []); //=> false
   *      R.identical(0, -0); //=> false
   *      R.identical(NaN, NaN); //=> true
   */

  var identical = function (a, b) {
    switch (arguments.length) {
      case 0:
        return identical;

      case 1:
        return function () {
          return function unaryIdentical(_b) {
            switch (arguments.length) {
              case 0:
                return unaryIdentical;

              default:
                return _objectIs$1(a, _b);
            }
          };
        }();

      default:
        return _objectIs$1(a, b);
    }
  }; // In order to support Cross-origin Window objects as arguments to identical,

  /**
   * Creates a function that will process either the `onTrue` or the `onFalse`
   * function depending upon the result of the `condition` predicate.
   *
   * Note that `ifElse` takes its arity from the longest of the three functions passed to it.
   *
   * @func
   * @memberOf R
   * @since v0.8.0
   * @category Logic
   * @sig (*... -> Boolean) -> (*... -> *) -> (*... -> *) -> (*... -> *)
   * @param {Function} condition A predicate function
   * @param {Function} onTrue A function to invoke when the `condition` evaluates to a truthy value.
   * @param {Function} onFalse A function to invoke when the `condition` evaluates to a falsy value.
   * @return {Function} A new function that will process either the `onTrue` or the `onFalse`
   *                    function depending upon the result of the `condition` predicate.
   * @see R.unless, R.when, R.cond
   * @example
   *
   *      const incCount = R.ifElse(
   *        R.has('count'),
   *        R.over(R.lensProp('count'), R.inc),
   *        R.assoc('count', 1)
   *      );
   *      incCount({ count: 1 }); //=> { count: 2 }
   *      incCount({});           //=> { count: 1 }
   */

  var ifElse =
  /*#__PURE__*/
  _curry3(function ifElse(condition, onTrue, onFalse) {
    return curryN(Math.max(condition.length, onTrue.length, onFalse.length), function _ifElse() {
      return condition.apply(this, arguments) ? onTrue.apply(this, arguments) : onFalse.apply(this, arguments);
    });
  });

  /**
   * Increments its argument.
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category Math
   * @sig Number -> Number
   * @param {Number} n
   * @return {Number} n + 1
   * @see R.dec
   * @example
   *
   *      R.inc(42); //=> 43
   */

  var inc =
  /*#__PURE__*/
  add(1);

  /**
   * Returns `true` if the specified value is equal, in [`R.equals`](#equals)
   * terms, to at least one element of the given list; `false` otherwise.
   * Also works with strings.
   *
   * @func
   * @memberOf R
   * @since v0.26.0
   * @category List
   * @sig a -> [a] -> Boolean
   * @param {Object} a The item to compare against.
   * @param {Array} list The array to consider.
   * @return {Boolean} `true` if an equivalent item is in the list, `false` otherwise.
   * @see R.any
   * @example
   *
   *      R.includes(3, [1, 2, 3]); //=> true
   *      R.includes(4, [1, 2, 3]); //=> false
   *      R.includes({ name: 'Fred' }, [{ name: 'Fred' }]); //=> true
   *      R.includes([42], [[42]]); //=> true
   *      R.includes('ba', 'banana'); //=>true
   */

  var includes =
  /*#__PURE__*/
  _curry2(_includes);

  /**
   * Given a function that generates a key, turns a list of objects into an
   * object indexing the objects by the given key. Note that if multiple
   * objects generate the same value for the indexing key only the last value
   * will be included in the generated object.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.19.0
   * @category List
   * @typedefn Idx = String | Int | Symbol
   * @sig Idx a => (b -> a) -> [b] -> {a: b}
   * @param {Function} fn Function :: a -> Idx
   * @param {Array} array The array of objects to index
   * @return {Object} An object indexing each array element by the given property.
   * @see R.groupBy
   * @example
   *
   *      const list = [{id: 'xyz', title: 'A'}, {id: 'abc', title: 'B'}];
   *      R.indexBy(R.prop('id'), list);
   *      //=> {abc: {id: 'abc', title: 'B'}, xyz: {id: 'xyz', title: 'A'}}
   */

  var indexBy =
  /*#__PURE__*/
  reduceBy(function (acc, elem) {
    return elem;
  }, null);

  /**
   * Returns the position of the first occurrence of an item in an array, or -1
   * if the item is not included in the array. [`R.equals`](#equals) is used to
   * determine equality.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig a -> [a] -> Number
   * @param {*} target The item to find.
   * @param {Array} xs The array to search in.
   * @return {Number} the index of the target, or -1 if the target is not found.
   * @see R.lastIndexOf, R.findIndex
   * @example
   *
   *      R.indexOf(3, [1,2,3,4]); //=> 2
   *      R.indexOf(10, [1,2,3,4]); //=> -1
   */

  var indexOf =
  /*#__PURE__*/
  _curry2(function indexOf(target, xs) {
    return typeof xs.indexOf === 'function' && !_isArray(xs) ? xs.indexOf(target) : _indexOf(xs, target, 0);
  });

  /**
   * Returns all but the last element of the given list or string.
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category List
   * @sig [a] -> [a]
   * @sig String -> String
   * @param {*} list
   * @return {*}
   * @see R.last, R.head, R.tail
   * @example
   *
   *      R.init([1, 2, 3]);  //=> [1, 2]
   *      R.init([1, 2]);     //=> [1]
   *      R.init([1]);        //=> []
   *      R.init([]);         //=> []
   *
   *      R.init('abc');  //=> 'ab'
   *      R.init('ab');   //=> 'a'
   *      R.init('a');    //=> ''
   *      R.init('');     //=> ''
   */

  var init =
  /*#__PURE__*/
  slice(0, -1);

  /**
   * Takes a predicate `pred`, a list `xs`, and a list `ys`, and returns a list
   * `xs'` comprising each of the elements of `xs` which is equal to one or more
   * elements of `ys` according to `pred`.
   *
   * `pred` must be a binary function expecting an element from each list.
   *
   * `xs`, `ys`, and `xs'` are treated as sets, semantically, so ordering should
   * not be significant, but since `xs'` is ordered the implementation guarantees
   * that its values are in the same order as they appear in `xs`. Duplicates are
   * not removed, so `xs'` may contain duplicates if `xs` contains duplicates.
   *
   * @func
   * @memberOf R
   * @since v0.24.0
   * @category Relation
   * @sig ((a, b) -> Boolean) -> [a] -> [b] -> [a]
   * @param {Function} pred
   * @param {Array} xs
   * @param {Array} ys
   * @return {Array}
   * @see R.intersection
   * @example
   *
   *      R.innerJoin(
   *        (record, id) => record.id === id,
   *        [{id: 824, name: 'Richie Furay'},
   *         {id: 956, name: 'Dewey Martin'},
   *         {id: 313, name: 'Bruce Palmer'},
   *         {id: 456, name: 'Stephen Stills'},
   *         {id: 177, name: 'Neil Young'}],
   *        [177, 456, 999]
   *      );
   *      //=> [{id: 456, name: 'Stephen Stills'}, {id: 177, name: 'Neil Young'}]
   */

  var innerJoin =
  /*#__PURE__*/
  _curry3(function innerJoin(pred, xs, ys) {
    return _filter(function (x) {
      return _includesWith(pred, x, ys);
    }, xs);
  });

  /**
   * Inserts the supplied element into the list, at the specified `index`. _Note that

   * this is not destructive_: it returns a copy of the list with the changes.
   * <small>No lists have been harmed in the application of this function.</small>
   *
   * @func
   * @memberOf R
   * @since v0.2.2
   * @category List
   * @sig Number -> a -> [a] -> [a]
   * @param {Number} index The position to insert the element
   * @param {*} elt The element to insert into the Array
   * @param {Array} list The list to insert into
   * @return {Array} A new Array with `elt` inserted at `index`.
   * @example
   *
   *      R.insert(2, 'x', [1,2,3,4]); //=> [1,2,'x',3,4]
   */

  var insert =
  /*#__PURE__*/
  _curry3(function insert(idx, elt, list) {
    idx = idx < list.length && idx >= 0 ? idx : list.length;
    var result = Array.prototype.slice.call(list, 0);
    result.splice(idx, 0, elt);
    return result;
  });

  /**
   * Inserts the sub-list into the list, at the specified `index`. _Note that this is not
   * destructive_: it returns a copy of the list with the changes.
   * <small>No lists have been harmed in the application of this function.</small>
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category List
   * @sig Number -> [a] -> [a] -> [a]
   * @param {Number} index The position to insert the sub-list
   * @param {Array} elts The sub-list to insert into the Array
   * @param {Array} list The list to insert the sub-list into
   * @return {Array} A new Array with `elts` inserted starting at `index`.
   * @example
   *
   *      R.insertAll(2, ['x','y','z'], [1,2,3,4]); //=> [1,2,'x','y','z',3,4]
   */

  var insertAll =
  /*#__PURE__*/
  _curry3(function insertAll(idx, elts, list) {
    idx = idx < list.length && idx >= 0 ? idx : list.length;
    return [].concat(Array.prototype.slice.call(list, 0, idx), elts, Array.prototype.slice.call(list, idx));
  });

  var XUniqBy =
  /*#__PURE__*/
  function () {
    function XUniqBy(f, xf) {
      this.xf = xf;
      this.f = f;
      this.set = new _Set();
    }

    XUniqBy.prototype['@@transducer/init'] = _xfBase.init;
    XUniqBy.prototype['@@transducer/result'] = _xfBase.result;

    XUniqBy.prototype['@@transducer/step'] = function (result, input) {
      return this.set.add(this.f(input)) ? this.xf['@@transducer/step'](result, input) : result;
    };

    return XUniqBy;
  }();

  function _xuniqBy(f) {
    return function (xf) {
      return new XUniqBy(f, xf);
    };
  }

  /**
   * Returns a new list containing only one copy of each element in the original
   * list, based upon the value returned by applying the supplied function to
   * each list element. Prefers the first item if the supplied function produces
   * the same value on two items. [`R.equals`](#equals) is used for comparison.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.16.0
   * @category List
   * @sig (a -> b) -> [a] -> [a]
   * @param {Function} fn A function used to produce a value to use during comparisons.
   * @param {Array} list The array to consider.
   * @return {Array} The list of unique items.
   * @example
   *
   *      R.uniqBy(Math.abs, [-1, -5, 2, 10, 1, 2]); //=> [-1, -5, 2, 10]
   */

  var uniqBy =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable([], _xuniqBy, function (fn, list) {
    var set = new _Set();
    var result = [];
    var idx = 0;
    var appliedItem, item;

    while (idx < list.length) {
      item = list[idx];
      appliedItem = fn(item);

      if (set.add(appliedItem)) {
        result.push(item);
      }

      idx += 1;
    }

    return result;
  }));

  /**
   * Returns a new list containing only one copy of each element in the original
   * list. [`R.equals`](#equals) is used to determine equality.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig [a] -> [a]
   * @param {Array} list The array to consider.
   * @return {Array} The list of unique items.
   * @example
   *
   *      R.uniq([1, 1, 2, 1]); //=> [1, 2]
   *      R.uniq([1, '1']);     //=> [1, '1']
   *      R.uniq([[42], [42]]); //=> [[42]]
   */

  var uniq =
  /*#__PURE__*/
  uniqBy(identity);

  /**
   * Combines two lists into a set (i.e. no duplicates) composed of those
   * elements common to both lists.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Relation
   * @sig [*] -> [*] -> [*]
   * @param {Array} list1 The first list.
   * @param {Array} list2 The second list.
   * @return {Array} The list of elements found in both `list1` and `list2`.
   * @see R.innerJoin
   * @example
   *
   *      R.intersection([1,2,3,4], [7,6,5,4,3]); //=> [4, 3]
   */

  var intersection =
  /*#__PURE__*/
  _curry2(function intersection(list1, list2) {
    var toKeep = new _Set();

    for (var i = 0; i < list1.length; i += 1) {
      toKeep.add(list1[i]);
    }

    return uniq(_filter(toKeep.has.bind(toKeep), list2));
  });

  /**
   * Creates a new list with the separator interposed between elements.
   *
   * Dispatches to the `intersperse` method of the second argument, if present.
   *
   * @func
   * @memberOf R
   * @since v0.14.0
   * @category List
   * @sig a -> [a] -> [a]
   * @param {*} separator The element to add to the list.
   * @param {Array} list The list to be interposed.
   * @return {Array} The new list.
   * @example
   *
   *      R.intersperse('a', ['b', 'n', 'n', 's']); //=> ['b', 'a', 'n', 'a', 'n', 'a', 's']
   */

  var intersperse =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _checkForMethod('intersperse', function intersperse(separator, list) {
    var out = [];
    var idx = 0;
    var length = list.length;

    while (idx < length) {
      if (idx === length - 1) {
        out.push(list[idx]);
      } else {
        out.push(list[idx], separator);
      }

      idx += 1;
    }

    return out;
  }));

  function _objectAssign(target) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var output = Object(target);
    var idx = 1;
    var length = arguments.length;

    while (idx < length) {
      var source = arguments[idx];

      if (source != null) {
        for (var nextKey in source) {
          if (_has(nextKey, source)) {
            output[nextKey] = source[nextKey];
          }
        }
      }

      idx += 1;
    }

    return output;
  }

  var _objectAssign$1 = typeof Object.assign === 'function' ? Object.assign : _objectAssign;

  /**
   * Creates an object containing a single key:value pair.
   *
   * @func
   * @memberOf R
   * @since v0.18.0
   * @category Object
   * @sig String -> a -> {String:a}
   * @param {String} key
   * @param {*} val
   * @return {Object}
   * @see R.pair
   * @example
   *
   *      const matchPhrases = R.compose(
   *        R.objOf('must'),
   *        R.map(R.objOf('match_phrase'))
   *      );
   *      matchPhrases(['foo', 'bar', 'baz']); //=> {must: [{match_phrase: 'foo'}, {match_phrase: 'bar'}, {match_phrase: 'baz'}]}
   */

  var objOf =
  /*#__PURE__*/
  _curry2(function objOf(key, val) {
    var obj = {};
    obj[key] = val;
    return obj;
  });

  var _stepCatArray = {
    '@@transducer/init': Array,
    '@@transducer/step': function (xs, x) {
      xs.push(x);
      return xs;
    },
    '@@transducer/result': _identity
  };
  var _stepCatString = {
    '@@transducer/init': String,
    '@@transducer/step': function (a, b) {
      return a + b;
    },
    '@@transducer/result': _identity
  };
  var _stepCatObject = {
    '@@transducer/init': Object,
    '@@transducer/step': function (result, input) {
      return _objectAssign$1(result, _isArrayLike(input) ? objOf(input[0], input[1]) : input);
    },
    '@@transducer/result': _identity
  };
  function _stepCat(obj) {
    if (_isTransformer(obj)) {
      return obj;
    }

    if (_isArrayLike(obj)) {
      return _stepCatArray;
    }

    if (typeof obj === 'string') {
      return _stepCatString;
    }

    if (typeof obj === 'object') {
      return _stepCatObject;
    }

    throw new Error('Cannot create transformer for ' + obj);
  }

  /**
   * Transforms the items of the list with the transducer and appends the
   * transformed items to the accumulator using an appropriate iterator function
   * based on the accumulator type.
   *
   * The accumulator can be an array, string, object or a transformer. Iterated
   * items will be appended to arrays and concatenated to strings. Objects will
   * be merged directly or 2-item arrays will be merged as key, value pairs.
   *
   * The accumulator can also be a transformer object that provides a 2-arity
   * reducing iterator function, step, 0-arity initial value function, init, and
   * 1-arity result extraction function result. The step function is used as the
   * iterator function in reduce. The result function is used to convert the
   * final accumulator into the return type and in most cases is R.identity. The
   * init function is used to provide the initial accumulator.
   *
   * The iteration is performed with [`R.reduce`](#reduce) after initializing the
   * transducer.
   *
   * @func
   * @memberOf R
   * @since v0.12.0
   * @category List
   * @sig a -> (b -> b) -> [c] -> a
   * @param {*} acc The initial accumulator value.
   * @param {Function} xf The transducer function. Receives a transformer and returns a transformer.
   * @param {Array} list The list to iterate over.
   * @return {*} The final, accumulated value.
   * @see R.transduce
   * @example
   *
   *      const numbers = [1, 2, 3, 4];
   *      const transducer = R.compose(R.map(R.add(1)), R.take(2));
   *
   *      R.into([], transducer, numbers); //=> [2, 3]
   *
   *      const intoArray = R.into([]);
   *      intoArray(transducer, numbers); //=> [2, 3]
   */

  var into =
  /*#__PURE__*/
  _curry3(function into(acc, transducer, list) {
    var xf = transducer(_isTransformer(acc) ? acc : _stepCat(acc));
    return _xReduce(xf, xf['@@transducer/init'](), list);
  });

  /**
   * Same as [`R.invertObj`](#invertObj), however this accounts for objects with
   * duplicate values by putting the values into an array.
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category Object
   * @sig {s: x} -> {x: [ s, ... ]}
   * @param {Object} obj The object or array to invert
   * @return {Object} out A new object with keys in an array.
   * @see R.invertObj
   * @example
   *
   *      const raceResultsByFirstName = {
   *        first: 'alice',
   *        second: 'jake',
   *        third: 'alice',
   *      };
   *      R.invert(raceResultsByFirstName);
   *      //=> { 'alice': ['first', 'third'], 'jake':['second'] }
   */

  var invert =
  /*#__PURE__*/
  _curry1(function invert(obj) {
    var props = keys(obj);
    var len = props.length;
    var idx = 0;
    var out = {};

    while (idx < len) {
      var key = props[idx];
      var val = obj[key];
      var list = _has(val, out) ? out[val] : out[val] = [];
      list[list.length] = key;
      idx += 1;
    }

    return out;
  });

  /**
   * Returns a new object with the keys of the given object as values, and the
   * values of the given object, which are coerced to strings, as keys. Note
   * that the last key found is preferred when handling the same value.
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category Object
   * @sig {s: x} -> {x: s}
   * @param {Object} obj The object or array to invert
   * @return {Object} out A new object
   * @see R.invert
   * @example
   *
   *      const raceResults = {
   *        first: 'alice',
   *        second: 'jake'
   *      };
   *      R.invertObj(raceResults);
   *      //=> { 'alice': 'first', 'jake':'second' }
   *
   *      // Alternatively:
   *      const raceResults = ['alice', 'jake'];
   *      R.invertObj(raceResults);
   *      //=> { 'alice': '0', 'jake':'1' }
   */

  var invertObj =
  /*#__PURE__*/
  _curry1(function invertObj(obj) {
    var props = keys(obj);
    var len = props.length;
    var idx = 0;
    var out = {};

    while (idx < len) {
      var key = props[idx];
      out[obj[key]] = key;
      idx += 1;
    }

    return out;
  });

  /**
   * Given an `arity` (Number) and a `name` (String) the `invoker` function
   * returns a curried function that takes `arity` arguments and a `context`
   * object. It will "invoke" the `name`'d function (a method) on the `context`
   * object.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Function
   * @sig Number -> String -> (a -> b -> ... -> n -> Object -> *)
   * @param {Number} arity Number of arguments the returned function should take
   *        before the target object.
   * @param {String} method Name of any of the target object's methods to call.
   * @return {Function} A new curried function.
   * @see R.construct
   * @example
   *      // A function with no arguments
   *      const asJson = invoker(0, "json")
   *      // Just like calling .then((response) => response.json())
   *      fetch("http://example.com/index.json").then(asJson)
   *
   *      // A function with one argument
   *      const sliceFrom = invoker(1, 'slice');
   *      sliceFrom(6, 'abcdefghijklm'); //=> 'ghijklm'
   *
   *      // A function with two arguments
   *      const sliceFrom6 = invoker(2, 'slice')(6);
   *      sliceFrom6(8, 'abcdefghijklm'); //=> 'gh'
   *
   *      // NOTE: You can't simply pass some of the arguments to the initial invoker function.
   *      const firstCreditCardSection = invoker(2, "slice", 0, 4)
   *      firstCreditCardSection("4242 4242 4242 4242") // => Function<...>
   *
   *      // Since invoker returns a curried function, you may partially apply it to create the function you need.
   *      const firstCreditCardSection = invoker(2, "slice")(0, 4)
   *      firstCreditCardSection("4242 4242 4242 4242") // => "4242"
   *
   * @symb R.invoker(0, 'method')(o) = o['method']()
   * @symb R.invoker(1, 'method')(a, o) = o['method'](a)
   * @symb R.invoker(2, 'method')(a, b, o) = o['method'](a, b)
   */

  var invoker =
  /*#__PURE__*/
  _curry2(function invoker(arity, method) {
    return curryN(arity + 1, function () {
      var target = arguments[arity];

      if (target != null && _isFunction(target[method])) {
        return target[method].apply(target, Array.prototype.slice.call(arguments, 0, arity));
      }

      throw new TypeError(toString(target) + ' does not have a method named "' + method + '"');
    });
  });

  /**
   * See if an object (i.e. `val`) is an instance of the supplied constructor. This
   * function will check up the inheritance chain, if any.
   * If `val` was created using `Object.create`, `R.is(Object, val) === true`.
   *
   * @func
   * @memberOf R
   * @since v0.3.0
   * @category Type
   * @sig (* -> {*}) -> a -> Boolean
   * @param {Object} ctor A constructor
   * @param {*} val The value to test
   * @return {Boolean}
   * @example
   *
   *      R.is(Object, {}); //=> true
   *      R.is(Number, 1); //=> true
   *      R.is(Object, 1); //=> false
   *      R.is(String, 's'); //=> true
   *      R.is(String, new String('')); //=> true
   *      R.is(Object, new String('')); //=> true
   *      R.is(Object, 's'); //=> false
   *      R.is(Number, {}); //=> false
   */

  var is =
  /*#__PURE__*/
  _curry2(function is(Ctor, val) {
    return val instanceof Ctor || val != null && (val.constructor === Ctor || Ctor.name === 'Object' && typeof val === 'object');
  });

  /**
   * Returns `true` if the given value is its type's empty value; `false`
   * otherwise.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Logic
   * @sig a -> Boolean
   * @param {*} x
   * @return {Boolean}
   * @see R.empty
   * @example
   *
   *      R.isEmpty([1, 2, 3]);           //=> false
   *      R.isEmpty([]);                  //=> true
   *      R.isEmpty('');                  //=> true
   *      R.isEmpty(null);                //=> false
   *      R.isEmpty({});                  //=> true
   *      R.isEmpty({length: 0});         //=> false
   *      R.isEmpty(Uint8Array.from('')); //=> true
   */

  var isEmpty =
  /*#__PURE__*/
  _curry1(function isEmpty(x) {
    return x != null && equals(x, empty(x));
  });

  /**
   * Checks if the input value is not `null` and not `undefined`.
   *
   * @func
   * @memberOf R
   * @since v0.29.0
   * @category Type
   * @sig * -> Boolean
   * @param {*} x The value to test.
   * @return {Boolean} `true` if `x` is not `undefined` or not `null`, otherwise `false`.
   * @example
   *
   *      R.isNotNil(null); //=> false
   *      R.isNotNil(undefined); //=> false
   *      R.isNotNil(0); //=> true
   *      R.isNotNil([]); //=> true
   */

  var isNotNil =
  /*#__PURE__*/
  _curry1(function isNotNil(x) {
    return !isNil(x);
  });

  /**
   * Returns a string made by inserting the `separator` between each element and
   * concatenating all the elements into a single string.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig String -> [a] -> String
   * @param {Number|String} separator The string used to separate the elements.
   * @param {Array} xs The elements to join into a string.
   * @return {String} str The string made by concatenating `xs` with `separator`.
   * @see R.split
   * @example
   *
   *      const spacer = R.join(' ');
   *      spacer(['a', 2, 3.4]);   //=> 'a 2 3.4'
   *      R.join('|', [1, 2, 3]);    //=> '1|2|3'
   */

  var join =
  /*#__PURE__*/
  invoker(1, 'join');

  /**
   * juxt applies a list of functions to a list of values.
   *
   * @func
   * @memberOf R
   * @since v0.19.0
   * @category Function
   * @sig [(a, b, ..., m) -> n] -> ((a, b, ..., m) -> [n])
   * @param {Array} fns An array of functions
   * @return {Function} A function that returns a list of values after applying each of the original `fns` to its parameters.
   * @see R.applySpec
   * @example
   *
   *      const getRange = R.juxt([Math.min, Math.max]);
   *      getRange(3, 4, 9, -3); //=> [-3, 9]
   * @symb R.juxt([f, g, h])(a, b) = [f(a, b), g(a, b), h(a, b)]
   */

  var juxt =
  /*#__PURE__*/
  _curry1(function juxt(fns) {
    return converge(function () {
      return Array.prototype.slice.call(arguments, 0);
    }, fns);
  });

  /**
   * Returns a list containing the names of all the properties of the supplied
   * object, including prototype properties.
   * Note that the order of the output array is not guaranteed to be consistent
   * across different JS platforms.
   *
   * @func
   * @memberOf R
   * @since v0.2.0
   * @category Object
   * @sig {k: v} -> [k]
   * @param {Object} obj The object to extract properties from
   * @return {Array} An array of the object's own and prototype properties.
   * @see R.keys, R.valuesIn
   * @example
   *
   *      const F = function() { this.x = 'X'; };
   *      F.prototype.y = 'Y';
   *      const f = new F();
   *      R.keysIn(f); //=> ['x', 'y']
   */

  var keysIn =
  /*#__PURE__*/
  _curry1(function keysIn(obj) {
    var prop;
    var ks = [];

    for (prop in obj) {
      ks[ks.length] = prop;
    }

    return ks;
  });

  /**
   * Returns the position of the last occurrence of an item in an array, or -1 if
   * the item is not included in the array. [`R.equals`](#equals) is used to
   * determine equality.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig a -> [a] -> Number
   * @param {*} target The item to find.
   * @param {Array} xs The array to search in.
   * @return {Number} the index of the target, or -1 if the target is not found.
   * @see R.indexOf, R.findLastIndex
   * @example
   *
   *      R.lastIndexOf(3, [-1,3,3,0,1,2,3,4]); //=> 6
   *      R.lastIndexOf(10, [1,2,3,4]); //=> -1
   */

  var lastIndexOf =
  /*#__PURE__*/
  _curry2(function lastIndexOf(target, xs) {
    if (typeof xs.lastIndexOf === 'function' && !_isArray(xs)) {
      return xs.lastIndexOf(target);
    } else {
      var idx = xs.length - 1;

      while (idx >= 0) {
        if (equals(xs[idx], target)) {
          return idx;
        }

        idx -= 1;
      }

      return -1;
    }
  });

  function _isNumber(x) {
    return Object.prototype.toString.call(x) === '[object Number]';
  }

  /**
   * Returns the number of elements in the array by returning `list.length`.
   *
   * @func
   * @memberOf R
   * @since v0.3.0
   * @category List
   * @sig [a] -> Number
   * @param {Array} list The array to inspect.
   * @return {Number} The length of the array.
   * @example
   *
   *      R.length([]); //=> 0
   *      R.length([1, 2, 3]); //=> 3
   */

  var length =
  /*#__PURE__*/
  _curry1(function length(list) {
    return list != null && _isNumber(list.length) ? list.length : NaN;
  });

  /**
   * Returns a lens for the given getter and setter functions. The getter "gets"
   * the value of the focus; the setter "sets" the value of the focus. The setter
   * should not mutate the data structure.
   *
   * @func
   * @memberOf R
   * @since v0.8.0
   * @category Object
   * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
   * @sig (s -> a) -> ((a, s) -> s) -> Lens s a
   * @param {Function} getter
   * @param {Function} setter
   * @return {Lens}
   * @see R.view, R.set, R.over, R.lensIndex, R.lensProp
   * @example
   *
   *      const xLens = R.lens(R.prop('x'), R.assoc('x'));
   *
   *      R.view(xLens, {x: 1, y: 2});            //=> 1
   *      R.set(xLens, 4, {x: 1, y: 2});          //=> {x: 4, y: 2}
   *      R.over(xLens, R.negate, {x: 1, y: 2});  //=> {x: -1, y: 2}
   */

  var lens =
  /*#__PURE__*/
  _curry2(function lens(getter, setter) {
    return function (toFunctorFn) {
      return function (target) {
        return map(function (focus) {
          return setter(focus, target);
        }, toFunctorFn(getter(target)));
      };
    };
  });

  /**
   * Returns a new copy of the array with the element at the provided index
   * replaced with the given value.
   *
   * @func
   * @memberOf R
   * @since v0.14.0
   * @category List
   * @sig Number -> a -> [a] -> [a]
   * @param {Number} idx The index to update.
   * @param {*} x The value to exist at the given index of the returned array.
   * @param {Array|Arguments} list The source array-like object to be updated.
   * @return {Array} A copy of `list` with the value at index `idx` replaced with `x`.
   * @see R.adjust
   * @example
   *
   *      R.update(1, '_', ['a', 'b', 'c']);      //=> ['a', '_', 'c']
   *      R.update(-1, '_', ['a', 'b', 'c']);     //=> ['a', 'b', '_']
   * @symb R.update(-1, a, [b, c]) = [b, a]
   * @symb R.update(0, a, [b, c]) = [a, c]
   * @symb R.update(1, a, [b, c]) = [b, a]
   */

  var update =
  /*#__PURE__*/
  _curry3(function update(idx, x, list) {
    return adjust(idx, always(x), list);
  });

  /**
   * Returns a lens whose focus is the specified index.
   *
   * @func
   * @memberOf R
   * @since v0.14.0
   * @category Object
   * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
   * @sig Number -> Lens s a
   * @param {Number} n
   * @return {Lens}
   * @see R.view, R.set, R.over, R.nth
   * @example
   *
   *      const headLens = R.lensIndex(0);
   *
   *      R.view(headLens, ['a', 'b', 'c']);            //=> 'a'
   *      R.set(headLens, 'x', ['a', 'b', 'c']);        //=> ['x', 'b', 'c']
   *      R.over(headLens, R.toUpper, ['a', 'b', 'c']); //=> ['A', 'b', 'c']
   */

  var lensIndex =
  /*#__PURE__*/
  _curry1(function lensIndex(n) {
    return lens(nth(n), update(n));
  });

  /**
   * Retrieves the values at given paths of an object.
   *
   * @func
   * @memberOf R
   * @since v0.27.1
   * @category Object
   * @typedefn Idx = [String | Int | Symbol]
   * @sig [Idx] -> {a} -> [a | Undefined]
   * @param {Array} pathsArray The array of paths to be fetched.
   * @param {Object} obj The object to retrieve the nested properties from.
   * @return {Array} A list consisting of values at paths specified by "pathsArray".
   * @see R.path
   * @example
   *
   *      R.paths([['a', 'b'], ['p', 0, 'q']], {a: {b: 2}, p: [{q: 3}]}); //=> [2, 3]
   *      R.paths([['a', 'b'], ['p', 'r']], {a: {b: 2}, p: [{q: 3}]}); //=> [2, undefined]
   */

  var paths =
  /*#__PURE__*/
  _curry2(function paths(pathsArray, obj) {
    return pathsArray.map(function (paths) {
      var val = obj;
      var idx = 0;
      var p;

      while (idx < paths.length) {
        if (val == null) {
          return;
        }

        p = paths[idx];
        val = _isInteger(p) ? nth(p, val) : val[p];
        idx += 1;
      }

      return val;
    });
  });

  /**
   * Retrieves the value at a given path. The nodes of the path can be arbitrary strings or non-negative integers.
   * For anything else, the value is unspecified. Integer paths are meant to index arrays, strings are meant for objects.
   *
   * @func
   * @memberOf R
   * @since v0.2.0
   * @category Object
   * @typedefn Idx = String | Int | Symbol
   * @sig [Idx] -> {a} -> a | Undefined
   * @sig Idx = String | NonNegativeInt
   * @param {Array} path The path to use.
   * @param {Object} obj The object or array to retrieve the nested property from.
   * @return {*} The data at `path`.
   * @see R.prop, R.nth, R.assocPath, R.dissocPath
   * @example
   *
   *      R.path(['a', 'b'], {a: {b: 2}}); //=> 2
   *      R.path(['a', 'b'], {c: {b: 2}}); //=> undefined
   *      R.path(['a', 'b', 0], {a: {b: [1, 2, 3]}}); //=> 1
   *      R.path(['a', 'b', -2], {a: {b: [1, 2, 3]}}); //=> 2
   *      R.path([2], {'2': 2}); //=> 2
   *      R.path([-2], {'-2': 'a'}); //=> undefined
   */

  var path =
  /*#__PURE__*/
  _curry2(function path(pathAr, obj) {
    return paths([pathAr], obj)[0];
  });

  /**
   * Returns a lens whose focus is the specified path.
   *
   * @func
   * @memberOf R
   * @since v0.19.0
   * @category Object
   * @typedefn Idx = String | Int | Symbol
   * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
   * @sig [Idx] -> Lens s a
   * @param {Array} path The path to use.
   * @return {Lens}
   * @see R.view, R.set, R.over
   * @example
   *
   *      const xHeadYLens = R.lensPath(['x', 0, 'y']);
   *
   *      R.view(xHeadYLens, {x: [{y: 2, z: 3}, {y: 4, z: 5}]});
   *      //=> 2
   *      R.set(xHeadYLens, 1, {x: [{y: 2, z: 3}, {y: 4, z: 5}]});
   *      //=> {x: [{y: 1, z: 3}, {y: 4, z: 5}]}
   *      R.over(xHeadYLens, R.negate, {x: [{y: 2, z: 3}, {y: 4, z: 5}]});
   *      //=> {x: [{y: -2, z: 3}, {y: 4, z: 5}]}
   */

  var lensPath =
  /*#__PURE__*/
  _curry1(function lensPath(p) {
    return lens(path(p), assocPath(p));
  });

  /**
   * Returns a lens whose focus is the specified property.
   *
   * @func
   * @memberOf R
   * @since v0.14.0
   * @category Object
   * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
   * @sig String -> Lens s a
   * @param {String} k
   * @return {Lens}
   * @see R.view, R.set, R.over
   * @example
   *
   *      const xLens = R.lensProp('x');
   *
   *      R.view(xLens, {x: 1, y: 2});            //=> 1
   *      R.set(xLens, 4, {x: 1, y: 2});          //=> {x: 4, y: 2}
   *      R.over(xLens, R.negate, {x: 1, y: 2});  //=> {x: -1, y: 2}
   */

  var lensProp =
  /*#__PURE__*/
  _curry1(function lensProp(k) {
    return lens(prop(k), assoc(k));
  });

  /**
   * Returns `true` if the first argument is less than the second; `false`
   * otherwise.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Relation
   * @sig Ord a => a -> a -> Boolean
   * @param {*} a
   * @param {*} b
   * @return {Boolean}
   * @see R.gt
   * @example
   *
   *      R.lt(2, 1); //=> false
   *      R.lt(2, 2); //=> false
   *      R.lt(2, 3); //=> true
   *      R.lt('a', 'z'); //=> true
   *      R.lt('z', 'a'); //=> false
   */

  var lt =
  /*#__PURE__*/
  _curry2(function lt(a, b) {
    return a < b;
  });

  /**
   * Returns `true` if the first argument is less than or equal to the second;
   * `false` otherwise.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Relation
   * @sig Ord a => a -> a -> Boolean
   * @param {Number} a
   * @param {Number} b
   * @return {Boolean}
   * @see R.gte
   * @example
   *
   *      R.lte(2, 1); //=> false
   *      R.lte(2, 2); //=> true
   *      R.lte(2, 3); //=> true
   *      R.lte('a', 'z'); //=> true
   *      R.lte('z', 'a'); //=> false
   */

  var lte =
  /*#__PURE__*/
  _curry2(function lte(a, b) {
    return a <= b;
  });

  /**
   * The `mapAccum` function behaves like a combination of map and reduce; it
   * applies a function to each element of a list, passing an accumulating
   * parameter from left to right, and returning a final value of this
   * accumulator together with the new list.
   *
   * The iterator function receives two arguments, *acc* and *value*, and should
   * return a tuple *[acc, value]*.
   *
   * @func
   * @memberOf R
   * @since v0.10.0
   * @category List
   * @sig ((acc, x) -> (acc, y)) -> acc -> [x] -> (acc, [y])
   * @param {Function} fn The function to be called on every element of the input `list`.
   * @param {*} acc The accumulator value.
   * @param {Array} list The list to iterate over.
   * @return {*} The final, accumulated value.
   * @see R.scan, R.addIndex, R.mapAccumRight
   * @example
   *
   *      const digits = ['1', '2', '3', '4'];
   *      const appender = (a, b) => [a + b, a + b];
   *
   *      R.mapAccum(appender, 0, digits); //=> ['01234', ['01', '012', '0123', '01234']]
   * @symb R.mapAccum(f, a, [b, c, d]) = [
   *   f(f(f(a, b)[0], c)[0], d)[0],
   *   [
   *     f(a, b)[1],
   *     f(f(a, b)[0], c)[1],
   *     f(f(f(a, b)[0], c)[0], d)[1]
   *   ]
   * ]
   */

  var mapAccum =
  /*#__PURE__*/
  _curry3(function mapAccum(fn, acc, list) {
    var idx = 0;
    var len = list.length;
    var result = [];
    var tuple = [acc];

    while (idx < len) {
      tuple = fn(tuple[0], list[idx]);
      result[idx] = tuple[1];
      idx += 1;
    }

    return [tuple[0], result];
  });

  /**
   * The `mapAccumRight` function behaves like a combination of map and reduce; it
   * applies a function to each element of a list, passing an accumulating
   * parameter from right to left, and returning a final value of this
   * accumulator together with the new list.
   *
   * Similar to [`mapAccum`](#mapAccum), except moves through the input list from
   * the right to the left.
   *
   * The iterator function receives two arguments, *acc* and *value*, and should
   * return a tuple *[acc, value]*.
   *
   * @func
   * @memberOf R
   * @since v0.10.0
   * @category List
   * @sig ((acc, x) -> (acc, y)) -> acc -> [x] -> (acc, [y])
   * @param {Function} fn The function to be called on every element of the input `list`.
   * @param {*} acc The accumulator value.
   * @param {Array} list The list to iterate over.
   * @return {*} The final, accumulated value.
   * @see R.addIndex, R.mapAccum
   * @example
   *
   *      const digits = ['1', '2', '3', '4'];
   *      const appender = (a, b) => [b + a, b + a];
   *
   *      R.mapAccumRight(appender, 5, digits); //=> ['12345', ['12345', '2345', '345', '45']]
   * @symb R.mapAccumRight(f, a, [b, c, d]) = [
   *   f(f(f(a, d)[0], c)[0], b)[0],
   *   [
   *     f(a, d)[1],
   *     f(f(a, d)[0], c)[1],
   *     f(f(f(a, d)[0], c)[0], b)[1]
   *   ]
   * ]
   */

  var mapAccumRight =
  /*#__PURE__*/
  _curry3(function mapAccumRight(fn, acc, list) {
    var idx = list.length - 1;
    var result = [];
    var tuple = [acc];

    while (idx >= 0) {
      tuple = fn(tuple[0], list[idx]);
      result[idx] = tuple[1];
      idx -= 1;
    }

    return [tuple[0], result];
  });

  /**
   * An Object-specific version of [`map`](#map). The function is applied to three
   * arguments: *(value, key, obj)*. If only the value is significant, use
   * [`map`](#map) instead.
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category Object
   * @sig ((*, String, Object) -> *) -> Object -> Object
   * @param {Function} fn
   * @param {Object} obj
   * @return {Object}
   * @see R.map
   * @example
   *
   *      const xyz = { x: 1, y: 2, z: 3 };
   *      const prependKeyAndDouble = (num, key, obj) => key + (num * 2);
   *
   *      R.mapObjIndexed(prependKeyAndDouble, xyz); //=> { x: 'x2', y: 'y4', z: 'z6' }
   */

  var mapObjIndexed =
  /*#__PURE__*/
  _curry2(function mapObjIndexed(fn, obj) {
    return _arrayReduce(function (acc, key) {
      acc[key] = fn(obj[key], key, obj);
      return acc;
    }, {}, keys(obj));
  });

  /**
   * Tests a regular expression against a String. Note that this function will
   * return an empty array when there are no matches. This differs from
   * [`String.prototype.match`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match)
   * which returns `null` when there are no matches.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category String
   * @sig RegExp -> String -> [String | Undefined]
   * @param {RegExp} rx A regular expression.
   * @param {String} str The string to match against
   * @return {Array} The list of matches or empty array.
   * @see R.test
   * @example
   *
   *      R.match(/([a-z]a)/g, 'bananas'); //=> ['ba', 'na', 'na']
   *      R.match(/a/, 'b'); //=> []
   *      R.match(/a/, null); //=> TypeError: null does not have a method named "match"
   */

  var match$1 =
  /*#__PURE__*/
  _curry2(function match(rx, str) {
    return str.match(rx) || [];
  });

  /**
   * `mathMod` behaves like the modulo operator should mathematically, unlike the
   * `%` operator (and by extension, [`R.modulo`](#modulo)). So while
   * `-17 % 5` is `-2`, `mathMod(-17, 5)` is `3`. `mathMod` requires Integer
   * arguments, and returns NaN when the modulus is zero or negative.
   *
   * @func
   * @memberOf R
   * @since v0.3.0
   * @category Math
   * @sig Number -> Number -> Number
   * @param {Number} m The dividend.
   * @param {Number} p the modulus.
   * @return {Number} The result of `b mod a`.
   * @see R.modulo
   * @example
   *
   *      R.mathMod(-17, 5);  //=> 3
   *      R.mathMod(17, 5);   //=> 2
   *      R.mathMod(17, -5);  //=> NaN
   *      R.mathMod(17, 0);   //=> NaN
   *      R.mathMod(17.2, 5); //=> NaN
   *      R.mathMod(17, 5.3); //=> NaN
   *
   *      const clock = R.mathMod(R.__, 12);
   *      clock(15); //=> 3
   *      clock(24); //=> 0
   *
   *      const seventeenMod = R.mathMod(17);
   *      seventeenMod(3);  //=> 2
   *      seventeenMod(4);  //=> 1
   *      seventeenMod(10); //=> 7
   */

  var mathMod =
  /*#__PURE__*/
  _curry2(function mathMod(m, p) {
    if (!_isInteger(m)) {
      return NaN;
    }

    if (!_isInteger(p) || p < 1) {
      return NaN;
    }

    return (m % p + p) % p;
  });

  /**
   * Takes a function and two values, and returns whichever value produces the
   * larger result when passed to the provided function.
   *
   * @func
   * @memberOf R
   * @since v0.8.0
   * @category Relation
   * @sig Ord b => (a -> b) -> a -> a -> a
   * @param {Function} f
   * @param {*} a
   * @param {*} b
   * @return {*}
   * @see R.max, R.minBy
   * @example
   *
   *      //  square :: Number -> Number
   *      const square = n => n * n;
   *
   *      R.maxBy(square, -3, 2); //=> -3
   *
   *      R.reduce(R.maxBy(square), 0, [3, -5, 4, 1, -2]); //=> -5
   *      R.reduce(R.maxBy(square), 0, []); //=> 0
   */

  var maxBy =
  /*#__PURE__*/
  _curry3(function maxBy(f, a, b) {
    var resultB = f(b);
    return max(f(a), resultB) === resultB ? b : a;
  });

  /**
   * Adds together all the elements of a list.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Math
   * @sig [Number] -> Number
   * @param {Array} list An array of numbers
   * @return {Number} The sum of all the numbers in the list.
   * @see R.reduce
   * @example
   *
   *      R.sum([2,4,6,8,100,1]); //=> 121
   */

  var sum =
  /*#__PURE__*/
  reduce(add, 0);

  /**
   * Returns the mean of the given list of numbers.
   *
   * @func
   * @memberOf R
   * @since v0.14.0
   * @category Math
   * @sig [Number] -> Number
   * @param {Array} list
   * @return {Number}
   * @see R.median
   * @example
   *
   *      R.mean([2, 7, 9]); //=> 6
   *      R.mean([]); //=> NaN
   */

  var mean =
  /*#__PURE__*/
  _curry1(function mean(list) {
    return sum(list) / list.length;
  });

  /**
   * Returns the median of the given list of numbers.
   *
   * @func
   * @memberOf R
   * @since v0.14.0
   * @category Math
   * @sig [Number] -> Number
   * @param {Array} list
   * @return {Number}
   * @see R.mean
   * @example
   *
   *      R.median([2, 9, 7]); //=> 7
   *      R.median([7, 2, 10, 9]); //=> 8
   *      R.median([]); //=> NaN
   */

  var median =
  /*#__PURE__*/
  _curry1(function median(list) {
    var len = list.length;

    if (len === 0) {
      return NaN;
    }

    var width = 2 - len % 2;
    var idx = (len - width) / 2;
    return mean(Array.prototype.slice.call(list, 0).sort(function (a, b) {
      return a < b ? -1 : a > b ? 1 : 0;
    }).slice(idx, idx + width));
  });

  /**
   * Takes a string-returning function `keyGen` and a function `fn` and returns
   * a new function that returns cached results for subsequent
   * calls with the same arguments.
   *
   * When the function is invoked, `keyGen` is applied to the same arguments
   * and its result becomes the cache key. If the cache contains something
   * under that key, the function simply returns it and does not invoke `fn` at all.
   *
   * Otherwise `fn` is applied to the same arguments and its return value
   * is cached under that key and returned by the function.
   *
   * Care must be taken when implementing `keyGen` to avoid key collision,
   * or if tracking references, memory leaks and mutating arguments.
   *
   * @func
   * @memberOf R
   * @since v0.24.0
   * @category Function
   * @sig (*... -> String) -> (*... -> a) -> (*... -> a)
   * @param {Function} keyGen The function to generate the cache key.
   * @param {Function} fn The function to memoize.
   * @return {Function} Memoized version of `fn`.
   * @example
   *      const withAge = memoizeWith(o => `${o.birth}/${o.death}`, ({birth, death}) => {
   *      //                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^
   *      //                          keyGen                        fn
   *        console.log(`computing age for ${birth}/${death}`);
   *        return ({birth, death, age: death - birth});
   *      });
   *
   *      withAge({birth: 1921, death: 1999});
   *      //=> LOG: computing age for 1921/1999
   *      //=> {birth: 1921, death: 1999, age: 78} (returned from fn)
   *
   *      withAge({birth: 1921, death: 1999});
   *      //=> {birth: 1921, death: 1999, age: 78} (returned from cache)
   */

  var memoizeWith =
  /*#__PURE__*/
  _curry2(function memoizeWith(keyGen, fn) {
    var cache = {};
    return _arity(fn.length, function () {
      var key = keyGen.apply(this, arguments);

      if (!_has(key, cache)) {
        cache[key] = fn.apply(this, arguments);
      }

      return cache[key];
    });
  });

  /**
   * Creates one new object with the own properties from a list of objects.
   * If a key exists in more than one object, the value from the last
   * object it exists in will be used.
   *
   * @func
   * @memberOf R
   * @since v0.10.0
   * @category List
   * @sig [{k: v}] -> {k: v}
   * @param {Array} list An array of objects
   * @return {Object} A merged object.
   * @see R.reduce
   * @example
   *
   *      R.mergeAll([{foo:1},{bar:2},{baz:3}]); //=> {foo:1,bar:2,baz:3}
   *      R.mergeAll([{foo:1},{foo:2},{bar:2}]); //=> {foo:2,bar:2}
   * @symb R.mergeAll([{ x: 1 }, { y: 2 }, { z: 3 }]) = { x: 1, y: 2, z: 3 }
   */

  var mergeAll =
  /*#__PURE__*/
  _curry1(function mergeAll(list) {
    return _objectAssign$1.apply(null, [{}].concat(list));
  });

  /**
   * Creates a new object with the own properties of the two provided objects. If
   * a key exists in both objects, the provided function is applied to the key
   * and the values associated with the key in each object, with the result being
   * used as the value associated with the key in the returned object.
   *
   * @func
   * @memberOf R
   * @since v0.19.0
   * @category Object
   * @sig ((String, a, a) -> a) -> {a} -> {a} -> {a}
   * @param {Function} fn
   * @param {Object} l
   * @param {Object} r
   * @return {Object}
   * @see R.mergeDeepWithKey, R.merge, R.mergeWith
   * @example
   *
   *      let concatValues = (k, l, r) => k == 'values' ? R.concat(l, r) : r
   *      R.mergeWithKey(concatValues,
   *                     { a: true, thing: 'foo', values: [10, 20] },
   *                     { b: true, thing: 'bar', values: [15, 35] });
   *      //=> { a: true, b: true, thing: 'bar', values: [10, 20, 15, 35] }
   * @symb R.mergeWithKey(f, { x: 1, y: 2 }, { y: 5, z: 3 }) = { x: 1, y: f('y', 2, 5), z: 3 }
   */

  var mergeWithKey =
  /*#__PURE__*/
  _curry3(function mergeWithKey(fn, l, r) {
    var result = {};
    var k;
    l = l || {};
    r = r || {};

    for (k in l) {
      if (_has(k, l)) {
        result[k] = _has(k, r) ? fn(k, l[k], r[k]) : l[k];
      }
    }

    for (k in r) {
      if (_has(k, r) && !_has(k, result)) {
        result[k] = r[k];
      }
    }

    return result;
  });

  /**
   * Creates a new object with the own properties of the two provided objects.
   * If a key exists in both objects:
   * - and both associated values are also objects then the values will be
   *   recursively merged.
   * - otherwise the provided function is applied to the key and associated values
   *   using the resulting value as the new value associated with the key.
   * If a key only exists in one object, the value will be associated with the key
   * of the resulting object.
   *
   * @func
   * @memberOf R
   * @since v0.24.0
   * @category Object
   * @sig ((String, a, a) -> a) -> {a} -> {a} -> {a}
   * @param {Function} fn
   * @param {Object} lObj
   * @param {Object} rObj
   * @return {Object}
   * @see R.mergeWithKey, R.mergeDeepWith
   * @example
   *
   *      let concatValues = (k, l, r) => k == 'values' ? R.concat(l, r) : r
   *      R.mergeDeepWithKey(concatValues,
   *                         { a: true, c: { thing: 'foo', values: [10, 20] }},
   *                         { b: true, c: { thing: 'bar', values: [15, 35] }});
   *      //=> { a: true, b: true, c: { thing: 'bar', values: [10, 20, 15, 35] }}
   */

  var mergeDeepWithKey =
  /*#__PURE__*/
  _curry3(function mergeDeepWithKey(fn, lObj, rObj) {
    return mergeWithKey(function (k, lVal, rVal) {
      if (_isObject(lVal) && _isObject(rVal)) {
        return mergeDeepWithKey(fn, lVal, rVal);
      } else {
        return fn(k, lVal, rVal);
      }
    }, lObj, rObj);
  });

  /**
   * Creates a new object with the own properties of the first object merged with
   * the own properties of the second object. If a key exists in both objects:
   * - and both values are objects, the two values will be recursively merged
   * - otherwise the value from the first object will be used.
   *
   * @func
   * @memberOf R
   * @since v0.24.0
   * @category Object
   * @sig {a} -> {a} -> {a}
   * @param {Object} lObj
   * @param {Object} rObj
   * @return {Object}
   * @see R.merge, R.mergeDeepRight, R.mergeDeepWith, R.mergeDeepWithKey
   * @example
   *
   *      R.mergeDeepLeft({ name: 'fred', age: 10, contact: { email: 'moo@example.com' }},
   *                      { age: 40, contact: { email: 'baa@example.com' }});
   *      //=> { name: 'fred', age: 10, contact: { email: 'moo@example.com' }}
   */

  var mergeDeepLeft =
  /*#__PURE__*/
  _curry2(function mergeDeepLeft(lObj, rObj) {
    return mergeDeepWithKey(function (k, lVal, rVal) {
      return lVal;
    }, lObj, rObj);
  });

  /**
   * Creates a new object with the own properties of the first object merged with
   * the own properties of the second object. If a key exists in both objects:
   * - and both values are objects, the two values will be recursively merged
   * - otherwise the value from the second object will be used.
   *
   * @func
   * @memberOf R
   * @since v0.24.0
   * @category Object
   * @sig {a} -> {a} -> {a}
   * @param {Object} lObj
   * @param {Object} rObj
   * @return {Object}
   * @see R.merge, R.mergeDeepLeft, R.mergeDeepWith, R.mergeDeepWithKey
   * @example
   *
   *      R.mergeDeepRight({ name: 'fred', age: 10, contact: { email: 'moo@example.com' }},
   *                       { age: 40, contact: { email: 'baa@example.com' }});
   *      //=> { name: 'fred', age: 40, contact: { email: 'baa@example.com' }}
   */

  var mergeDeepRight =
  /*#__PURE__*/
  _curry2(function mergeDeepRight(lObj, rObj) {
    return mergeDeepWithKey(function (k, lVal, rVal) {
      return rVal;
    }, lObj, rObj);
  });

  /**
   * Creates a new object with the own properties of the two provided objects.
   * If a key exists in both objects:
   * - and both associated values are also objects then the values will be
   *   recursively merged.
   * - otherwise the provided function is applied to associated values using the
   *   resulting value as the new value associated with the key.
   * If a key only exists in one object, the value will be associated with the key
   * of the resulting object.
   *
   * @func
   * @memberOf R
   * @since v0.24.0
   * @category Object
   * @sig ((a, a) -> a) -> {a} -> {a} -> {a}
   * @param {Function} fn
   * @param {Object} lObj
   * @param {Object} rObj
   * @return {Object}
   * @see R.mergeWith, R.mergeDeepWithKey
   * @example
   *
   *      R.mergeDeepWith(R.concat,
   *                      { a: true, c: { values: [10, 20] }},
   *                      { b: true, c: { values: [15, 35] }});
   *      //=> { a: true, b: true, c: { values: [10, 20, 15, 35] }}
   */

  var mergeDeepWith =
  /*#__PURE__*/
  _curry3(function mergeDeepWith(fn, lObj, rObj) {
    return mergeDeepWithKey(function (k, lVal, rVal) {
      return fn(lVal, rVal);
    }, lObj, rObj);
  });

  /**
   * Create a new object with the own properties of the first object merged with
   * the own properties of the second object. If a key exists in both objects,
   * the value from the first object will be used.
   *
   * @func
   * @memberOf R
   * @since v0.26.0
   * @category Object
   * @sig {k: v} -> {k: v} -> {k: v}
   * @param {Object} l
   * @param {Object} r
   * @return {Object}
   * @see R.mergeRight, R.mergeDeepLeft, R.mergeWith, R.mergeWithKey
   * @example
   *
   *      R.mergeLeft({ 'age': 40 }, { 'name': 'fred', 'age': 10 });
   *      //=> { 'name': 'fred', 'age': 40 }
   *
   *      const resetToDefault = R.mergeLeft({x: 0});
   *      resetToDefault({x: 5, y: 2}); //=> {x: 0, y: 2}
   * @symb R.mergeLeft(a, b) = {...b, ...a}
   */

  var mergeLeft =
  /*#__PURE__*/
  _curry2(function mergeLeft(l, r) {
    return _objectAssign$1({}, r, l);
  });

  /**
   * Create a new object with the own properties of the first object merged with
   * the own properties of the second object. If a key exists in both objects,
   * the value from the second object will be used.
   *
   * @func
   * @memberOf R
   * @since v0.26.0
   * @category Object
   * @sig {k: v} -> {k: v} -> {k: v}
   * @param {Object} l
   * @param {Object} r
   * @return {Object}
   * @see R.mergeLeft, R.mergeDeepRight, R.mergeWith, R.mergeWithKey
   * @example
   *
   *      R.mergeRight({ 'name': 'fred', 'age': 10 }, { 'age': 40 });
   *      //=> { 'name': 'fred', 'age': 40 }
   *
   *      const withDefaults = R.mergeRight({x: 0, y: 0});
   *      withDefaults({y: 2}); //=> {x: 0, y: 2}
   * @symb R.mergeRight(a, b) = {...a, ...b}
   */

  var mergeRight =
  /*#__PURE__*/
  _curry2(function mergeRight(l, r) {
    return _objectAssign$1({}, l, r);
  });

  /**
   * Creates a new object with the own properties of the two provided objects. If
   * a key exists in both objects, the provided function is applied to the values
   * associated with the key in each object, with the result being used as the
   * value associated with the key in the returned object.
   *
   * @func
   * @memberOf R
   * @since v0.19.0
   * @category Object
   * @sig ((a, a) -> a) -> {a} -> {a} -> {a}
   * @param {Function} fn
   * @param {Object} l
   * @param {Object} r
   * @return {Object}
   * @see R.mergeDeepWith, R.merge, R.mergeWithKey
   * @example
   *
   *      R.mergeWith(R.concat,
   *                  { a: true, values: [10, 20] },
   *                  { b: true, values: [15, 35] });
   *      //=> { a: true, b: true, values: [10, 20, 15, 35] }
   */

  var mergeWith =
  /*#__PURE__*/
  _curry3(function mergeWith(fn, l, r) {
    return mergeWithKey(function (_, _l, _r) {
      return fn(_l, _r);
    }, l, r);
  });

  /**
   * Returns the smaller of its two arguments.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Relation
   * @sig Ord a => a -> a -> a
   * @param {*} a
   * @param {*} b
   * @return {*}
   * @see R.minBy, R.max
   * @example
   *
   *      R.min(789, 123); //=> 123
   *      R.min('a', 'b'); //=> 'a'
   */

  var min =
  /*#__PURE__*/
  _curry2(function min(a, b) {
    if (a === b) {
      return a;
    }

    function safeMin(x, y) {
      if (x < y !== y < x) {
        return y < x ? y : x;
      }

      return undefined;
    }

    var minByValue = safeMin(a, b);

    if (minByValue !== undefined) {
      return minByValue;
    }

    var minByType = safeMin(typeof a, typeof b);

    if (minByType !== undefined) {
      return minByType === typeof a ? a : b;
    }

    var stringA = toString(a);
    var minByStringValue = safeMin(stringA, toString(b));

    if (minByStringValue !== undefined) {
      return minByStringValue === stringA ? a : b;
    }

    return a;
  });

  /**
   * Takes a function and two values, and returns whichever value produces the
   * smaller result when passed to the provided function.
   *
   * @func
   * @memberOf R
   * @since v0.8.0
   * @category Relation
   * @sig Ord b => (a -> b) -> a -> a -> a
   * @param {Function} f
   * @param {*} a
   * @param {*} b
   * @return {*}
   * @see R.min, R.maxBy
   * @example
   *
   *      //  square :: Number -> Number
   *      const square = n => n * n;
   *
   *      R.minBy(square, -3, 2); //=> 2
   *
   *      R.reduce(R.minBy(square), Infinity, [3, -5, 4, 1, -2]); //=> 1
   *      R.reduce(R.minBy(square), Infinity, []); //=> Infinity
   */

  var minBy =
  /*#__PURE__*/
  _curry3(function minBy(f, a, b) {
    var resultB = f(b);
    return min(f(a), resultB) === resultB ? b : a;
  });

  /**
   * Makes a shallow clone of an object, applying the given fn to the specified
   * property with the given value. Note that this copies and flattens prototype
   * properties onto the new object as well. All non-primitive properties are
   * copied by reference.
   *
   * @private
   * @param {String|Number} prop The property name to set
   * @param {Function} fn The function to apply to the property
   * @param {Object|Array} obj The object to clone
   * @return {Object|Array} A new object equivalent to the original except for the changed property.
   */

  function _modify(prop, fn, obj) {
    if (_isInteger(prop) && _isArray(obj)) {
      var arr = [].concat(obj);
      arr[prop] = fn(arr[prop]);
      return arr;
    }

    var result = {};

    for (var p in obj) {
      result[p] = obj[p];
    }

    result[prop] = fn(result[prop]);
    return result;
  }

  /**
   * Creates a shallow clone of the passed object by applying an `fn` function
   * to the value at the given path.
   *
   * The function will not be invoked, and the object will not change
   * if its corresponding path does not exist in the object.
   * All non-primitive properties are copied to the new object by reference.
   *
   * @func
   * @memberOf R
   * @since v0.28.0
   * @category Object
   * @sig [Idx] -> (v -> v) -> {k: v} -> {k: v}
   * @param {Array} path The path to be modified.
   * @param {Function} fn The function to apply to the path.
   * @param {Object} object The object to be transformed.
   * @return {Object} The transformed object.
   * @example
   *
   *      const person = {name: 'James', address: { zipCode: '90216' }};
   *      R.modifyPath(['address', 'zipCode'], R.reverse, person); //=> {name: 'James', address: { zipCode: '61209' }}
   *
   *      // Can handle arrays too
   *      const person = {name: 'James', addresses: [{ zipCode: '90216' }]};
   *      R.modifyPath(['addresses', 0, 'zipCode'], R.reverse, person); //=> {name: 'James', addresses: [{ zipCode: '61209' }]}
   */

  var modifyPath =
  /*#__PURE__*/
  _curry3(function modifyPath(path, fn, object) {
    if (!_isObject(object) && !_isArray(object)) {
      return object;
    }

    if (path.length === 0) {
      return fn(object);
    }

    var idx = path[0];

    if (!_has(idx, object)) {
      return object;
    }

    if (path.length === 1) {
      return _modify(idx, fn, object);
    }

    var val = modifyPath(Array.prototype.slice.call(path, 1), fn, object[idx]);

    if (val === object[idx]) {
      return object;
    }

    return _assoc(idx, val, object);
  });

  /**
   * Creates a copy of the passed object by applying an `fn` function to the given `prop` property.
   *
   * The function will not be invoked, and the object will not change
   * if its corresponding property does not exist in the object.
   * All non-primitive properties are copied to the new object by reference.
   *
   * @func
   * @memberOf R
   * @since v0.28.0
   * @category Object
   * @sig Idx -> (v -> v) -> {k: v} -> {k: v}
   * @param {String|Number} prop The property to be modified.
   * @param {Function} fn The function to apply to the property.
   * @param {Object} object The object to be transformed.
   * @return {Object} The transformed object.
   * @example
   *
   *      const person = {name: 'James', age: 20, pets: ['dog', 'cat']};
   *      R.modify('age', R.add(1), person); //=> {name: 'James', age: 21, pets: ['dog', 'cat']}
   *      R.modify('pets', R.append('turtle'), person); //=> {name: 'James', age: 20, pets: ['dog', 'cat', 'turtle']}
   */

  var modify =
  /*#__PURE__*/
  _curry3(function modify(prop, fn, object) {
    return modifyPath([prop], fn, object);
  });

  /**
   * Divides the first parameter by the second and returns the remainder. Note
   * that this function preserves the JavaScript-style behavior for modulo. For
   * mathematical modulo see [`mathMod`](#mathMod).
   *
   * @func
   * @memberOf R
   * @since v0.1.1
   * @category Math
   * @sig Number -> Number -> Number
   * @param {Number} a The value to the divide.
   * @param {Number} b The pseudo-modulus
   * @return {Number} The result of `b % a`.
   * @see R.mathMod
   * @example
   *
   *      R.modulo(17, 3); //=> 2
   *      // JS behavior:
   *      R.modulo(-17, 3); //=> -2
   *      R.modulo(17, -3); //=> 2
   *
   *      const isOdd = R.modulo(R.__, 2);
   *      isOdd(42); //=> 0
   *      isOdd(21); //=> 1
   */

  var modulo =
  /*#__PURE__*/
  _curry2(function modulo(a, b) {
    return a % b;
  });

  /**
   * Move an item, at index `from`, to index `to`, in a list of elements.
   * A new list will be created containing the new elements order.
   *
   * @func
   * @memberOf R
   * @since v0.27.1
   * @category List
   * @sig Number -> Number -> [a] -> [a]
   * @param {Number} from The source index
   * @param {Number} to The destination index
   * @param {Array} list The list which will serve to realise the move
   * @return {Array} The new list reordered
   * @example
   *
   *      R.move(0, 2, ['a', 'b', 'c', 'd', 'e', 'f']); //=> ['b', 'c', 'a', 'd', 'e', 'f']
   *      R.move(-1, 0, ['a', 'b', 'c', 'd', 'e', 'f']); //=> ['f', 'a', 'b', 'c', 'd', 'e'] list rotation
   */

  var move =
  /*#__PURE__*/
  _curry3(function (from, to, list) {
    var length = list.length;
    var result = list.slice();
    var positiveFrom = from < 0 ? length + from : from;
    var positiveTo = to < 0 ? length + to : to;
    var item = result.splice(positiveFrom, 1);
    return positiveFrom < 0 || positiveFrom >= list.length || positiveTo < 0 || positiveTo >= list.length ? list : [].concat(result.slice(0, positiveTo)).concat(item).concat(result.slice(positiveTo, list.length));
  });

  /**
   * Multiplies two numbers. Equivalent to `a * b` but curried.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Math
   * @sig Number -> Number -> Number
   * @param {Number} a The first value.
   * @param {Number} b The second value.
   * @return {Number} The result of `a * b`.
   * @see R.divide
   * @example
   *
   *      const double = R.multiply(2);
   *      const triple = R.multiply(3);
   *      double(3);       //=>  6
   *      triple(4);       //=> 12
   *      R.multiply(2, 5);  //=> 10
   */

  var multiply =
  /*#__PURE__*/
  _curry2(function multiply(a, b) {
    return a * b;
  });

  /**
   * Takes a function `f` and an object, and returns a function `g`.
   * When applied, `g` returns the result of applying `f` to the object
   * provided initially merged deeply (right) with the object provided as an argument to `g`.
   *
   * @func
   * @memberOf R
   * @since v0.28.0
   * @category Function
   * @sig (({ a, b, c, ..., n }) -> x) -> { a, b, c, ...} -> ({ d, e, f, ..., n } -> x)
   * @param {Function} f
   * @param {Object} props
   * @return {Function}
   * @see R.partial, R.partialRight, R.curry, R.mergeDeepRight
   * @example
   *
   *      const multiply2 = ({ a, b }) => a * b;
   *      const double = R.partialObject(multiply2, { a: 2 });
   *      double({ b: 2 }); //=> 4
   *
   *      const greet = ({ salutation, title, firstName, lastName }) =>
   *        salutation + ', ' + title + ' ' + firstName + ' ' + lastName + '!';
   *
   *      const sayHello = R.partialObject(greet, { salutation: 'Hello' });
   *      const sayHelloToMs = R.partialObject(sayHello, { title: 'Ms.' });
   *      sayHelloToMs({ firstName: 'Jane', lastName: 'Jones' }); //=> 'Hello, Ms. Jane Jones!'
   * @symb R.partialObject(f, { a, b })({ c, d }) = f({ a, b, c, d })
   */

  var partialObject =
  /*#__PURE__*/
  _curry2((f, o) => props => f.call(undefined, mergeDeepRight(o, props)));

  /**
   * Negates its argument.
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category Math
   * @sig Number -> Number
   * @param {Number} n
   * @return {Number}
   * @example
   *
   *      R.negate(42); //=> -42
   */

  var negate =
  /*#__PURE__*/
  _curry1(function negate(n) {
    return -n;
  });

  /**
   * Returns `true` if no elements of the list match the predicate, `false`
   * otherwise.
   *
   * Dispatches to the `all` method of the second argument, if present.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.12.0
   * @category List
   * @sig (a -> Boolean) -> [a] -> Boolean
   * @param {Function} fn The predicate function.
   * @param {Array} list The array to consider.
   * @return {Boolean} `true` if the predicate is not satisfied by every element, `false` otherwise.
   * @see R.all, R.any
   * @example
   *
   *      const isEven = n => n % 2 === 0;
   *      const isOdd = n => n % 2 !== 0;
   *
   *      R.none(isEven, [1, 3, 5, 7, 9, 11]); //=> true
   *      R.none(isOdd, [1, 3, 5, 7, 8, 11]); //=> false
   */

  var none =
  /*#__PURE__*/
  _curry2(function none(fn, input) {
    return all(_complement(fn), input);
  });

  /**
   * Returns a function which returns its nth argument.
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category Function
   * @sig Number -> *... -> *
   * @param {Number} n
   * @return {Function}
   * @example
   *
   *      R.nthArg(1)('a', 'b', 'c'); //=> 'b'
   *      R.nthArg(-1)('a', 'b', 'c'); //=> 'c'
   * @symb R.nthArg(-1)(a, b, c) = c
   * @symb R.nthArg(0)(a, b, c) = a
   * @symb R.nthArg(1)(a, b, c) = b
   */

  var nthArg =
  /*#__PURE__*/
  _curry1(function nthArg(n) {
    var arity = n < 0 ? 1 : n + 1;
    return curryN(arity, function () {
      return nth(n, arguments);
    });
  });

  /**
   * `o` is a curried composition function that returns a unary function.
   * Like [`compose`](#compose), `o` performs right-to-left function composition.
   * Unlike [`compose`](#compose), the rightmost function passed to `o` will be
   * invoked with only one argument. Also, unlike [`compose`](#compose), `o` is
   * limited to accepting only 2 unary functions. The name o was chosen because
   * of its similarity to the mathematical composition operator ∘.
   *
   * @func
   * @memberOf R
   * @since v0.24.0
   * @category Function
   * @sig (b -> c) -> (a -> b) -> a -> c
   * @param {Function} f
   * @param {Function} g
   * @return {Function}
   * @see R.compose, R.pipe
   * @example
   *
   *      const classyGreeting = name => "The name's " + name.last + ", " + name.first + " " + name.last
   *      const yellGreeting = R.o(R.toUpper, classyGreeting);
   *      yellGreeting({first: 'James', last: 'Bond'}); //=> "THE NAME'S BOND, JAMES BOND"
   *
   *      R.o(R.multiply(10), R.add(10))(-4) //=> 60
   *
   * @symb R.o(f, g, x) = f(g(x))
   */

  var o =
  /*#__PURE__*/
  _curry3(function o(f, g, x) {
    return f(g(x));
  });

  /**
   * Given a constructor and a value, returns a new instance of that constructor
   * containing the value.
   *
   * Dispatches to the `fantasy-land/of` method of the constructor first (if present)
   * or to the `of` method last (if present). When neither are present, wraps the
   * value in an array.
   *
   * Note this `of` is different from the ES6 `of`; See
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of
   *
   * @func
   * @memberOf R
   * @since v0.3.0
   * @category Function
   * @sig (* -> {*}) -> a -> {a}
   * @param {Object} Ctor A constructor
   * @param {*} val any value
   * @return {*} An instance of the `Ctor` wrapping `val`.
   * @example
   *
   *      R.of(Array, 42);   //=> [42]
   *      R.of(Array, [42]); //=> [[42]]
   *      R.of(Maybe, 42);   //=> Maybe.Just(42)
   */

  var of =
  /*#__PURE__*/
  _curry2(function of(Ctor, val) {
    return typeof Ctor['fantasy-land/of'] === 'function' ? Ctor['fantasy-land/of'](val) : typeof Ctor.of === 'function' ? Ctor.of(val) : [val];
  });

  /**
   * Returns a partial copy of an object omitting the keys specified.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Object
   * @sig [String] -> {String: *} -> {String: *}
   * @param {Array} names an array of String property names to omit from the new object
   * @param {Object} obj The object to copy from
   * @return {Object} A new object with properties from `names` not on it.
   * @see R.pick
   * @example
   *
   *      R.omit(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, c: 3}
   */

  var omit =
  /*#__PURE__*/
  _curry2(function omit(names, obj) {
    var result = {};
    var index = {};
    var idx = 0;
    var len = names.length;

    while (idx < len) {
      index[names[idx]] = 1;
      idx += 1;
    }

    for (var prop in obj) {
      if (!index.hasOwnProperty(prop)) {
        result[prop] = obj[prop];
      }
    }

    return result;
  });

  /**
   * Takes a binary function `f`, a unary function `g`, and two values.
   * Applies `g` to each value, then applies the result of each to `f`.
   *
   * Also known as the P combinator.
   *
   * @func
   * @memberOf R
   * @since v0.28.0
   * @category Function
   * @sig ((a, a) -> b) -> (c -> a) -> c -> c -> b
   * @param {Function} f a binary function
   * @param {Function} g a unary function
   * @param {any} a any value
   * @param {any} b any value
   * @return {any} The result of `f`
   * @example
   *
   *      const eqBy = R.on((a, b) => a === b);
   *      eqBy(R.prop('a'), {b:0, a:1}, {a:1}) //=> true;
   *
   *      const containsInsensitive = R.on(R.includes, R.toLower);
   *      containsInsensitive('o', 'FOO'); //=> true
   * @symb R.on(f, g, a, b) = f(g(a), g(b))
   */

  var on$1 =
  /*#__PURE__*/
  _curryN(4, [], function on(f, g, a, b) {
    return f(g(a), g(b));
  });

  /**
   * Accepts a function `fn` and returns a function that guards invocation of
   * `fn` such that `fn` can only ever be called once, no matter how many times
   * the returned function is invoked. The first value calculated is returned in
   * subsequent invocations.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Function
   * @sig (a... -> b) -> (a... -> b)
   * @param {Function} fn The function to wrap in a call-only-once wrapper.
   * @return {Function} The wrapped function.
   * @example
   *
   *      const addOneOnce = R.once(x => x + 1);
   *      addOneOnce(10); //=> 11
   *      addOneOnce(addOneOnce(50)); //=> 11
   */

  var once =
  /*#__PURE__*/
  _curry1(function once(fn) {
    var called = false;
    var result;
    return _arity(fn.length, function () {
      if (called) {
        return result;
      }

      called = true;
      result = fn.apply(this, arguments);
      return result;
    });
  });

  function _assertPromise(name, p) {
    if (p == null || !_isFunction(p.then)) {
      throw new TypeError('`' + name + '` expected a Promise, received ' + _toString(p, []));
    }
  }

  /**
   * Returns the result of applying the onFailure function to the value inside
   * a failed promise. This is useful for handling rejected promises
   * inside function compositions.
   *
   * @func
   * @memberOf R
   * @since v0.26.0
   * @category Function
   * @sig (e -> b) -> (Promise e a) -> (Promise e b)
   * @sig (e -> (Promise f b)) -> (Promise e a) -> (Promise f b)
   * @param {Function} onFailure The function to apply. Can return a value or a promise of a value.
   * @param {Promise} p
   * @return {Promise} The result of calling `p.then(null, onFailure)`
   * @see R.andThen
   * @example
   *
   *      const failedFetch = id => Promise.reject('bad ID');
   *      const useDefault = () => ({ firstName: 'Bob', lastName: 'Loblaw' });
   *
   *      //recoverFromFailure :: String -> Promise ({ firstName, lastName })
   *      const recoverFromFailure = R.pipe(
   *        failedFetch,
   *        R.otherwise(useDefault),
   *        R.andThen(R.pick(['firstName', 'lastName'])),
   *      );
   *      recoverFromFailure(12345).then(console.log);
   */

  var otherwise =
  /*#__PURE__*/
  _curry2(function otherwise(f, p) {
    _assertPromise('otherwise', p);

    return p.then(null, f);
  });

  // transforms the held value with the provided function.

  var Identity = function (x) {
    return {
      value: x,
      map: function (f) {
        return Identity(f(x));
      }
    };
  };
  /**
   * Returns the result of "setting" the portion of the given data structure
   * focused by the given lens to the result of applying the given function to
   * the focused value.
   *
   * @func
   * @memberOf R
   * @since v0.16.0
   * @category Object
   * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
   * @sig Lens s a -> (a -> a) -> s -> s
   * @param {Lens} lens
   * @param {*} v
   * @param {*} x
   * @return {*}
   * @see R.view, R.set, R.lens, R.lensIndex, R.lensProp, R.lensPath
   * @example
   *
   *      const headLens = R.lensIndex(0);
   *
   *      R.over(headLens, R.toUpper, ['foo', 'bar', 'baz']); //=> ['FOO', 'bar', 'baz']
   */


  var over =
  /*#__PURE__*/
  _curry3(function over(lens, f, x) {
    // The value returned by the getter function is first transformed with `f`,
    // then set as the value of an `Identity`. This is then mapped over with the
    // setter function of the lens.
    return lens(function (y) {
      return Identity(f(y));
    })(x).value;
  });

  /**
   * Takes two arguments, `fst` and `snd`, and returns `[fst, snd]`.
   *
   * @func
   * @memberOf R
   * @since v0.18.0
   * @category List
   * @sig a -> b -> (a,b)
   * @param {*} fst
   * @param {*} snd
   * @return {Array}
   * @see R.objOf, R.of
   * @example
   *
   *      R.pair('foo', 'bar'); //=> ['foo', 'bar']
   */

  var pair =
  /*#__PURE__*/
  _curry2(function pair(fst, snd) {
    return [fst, snd];
  });

  function _createPartialApplicator(concat) {
    return _curry2(function (fn, args) {
      return _arity(Math.max(0, fn.length - args.length), function () {
        return fn.apply(this, concat(args, arguments));
      });
    });
  }

  /**
   * Takes a function `f` and a list of arguments, and returns a function `g`.
   * When applied, `g` returns the result of applying `f` to the arguments
   * provided initially followed by the arguments provided to `g`.
   *
   * @func
   * @memberOf R
   * @since v0.10.0
   * @category Function
   * @sig ((a, b, c, ..., n) -> x) -> [a, b, c, ...] -> ((d, e, f, ..., n) -> x)
   * @param {Function} f
   * @param {Array} args
   * @return {Function}
   * @see R.partialRight, R.curry
   * @example
   *
   *      const multiply2 = (a, b) => a * b;
   *      const double = R.partial(multiply2, [2]);
   *      double(3); //=> 6
   *
   *      const greet = (salutation, title, firstName, lastName) =>
   *        salutation + ', ' + title + ' ' + firstName + ' ' + lastName + '!';
   *
   *      const sayHello = R.partial(greet, ['Hello']);
   *      const sayHelloToMs = R.partial(sayHello, ['Ms.']);
   *      sayHelloToMs('Jane', 'Jones'); //=> 'Hello, Ms. Jane Jones!'
   * @symb R.partial(f, [a, b])(c, d) = f(a, b, c, d)
   */

  var partial =
  /*#__PURE__*/
  _createPartialApplicator(_concat);

  /**
   * Takes a function `f` and a list of arguments, and returns a function `g`.
   * When applied, `g` returns the result of applying `f` to the arguments
   * provided to `g` followed by the arguments provided initially.
   *
   * @func
   * @memberOf R
   * @since v0.10.0
   * @category Function
   * @sig ((a, b, c, ..., n) -> x) -> [d, e, f, ..., n] -> ((a, b, c, ...) -> x)
   * @param {Function} f
   * @param {Array} args
   * @return {Function}
   * @see R.partial
   * @example
   *
   *      const greet = (salutation, title, firstName, lastName) =>
   *        salutation + ', ' + title + ' ' + firstName + ' ' + lastName + '!';
   *
   *      const greetMsJaneJones = R.partialRight(greet, ['Ms.', 'Jane', 'Jones']);
   *
   *      greetMsJaneJones('Hello'); //=> 'Hello, Ms. Jane Jones!'
   * @symb R.partialRight(f, [a, b])(c, d) = f(c, d, a, b)
   */

  var partialRight =
  /*#__PURE__*/
  _createPartialApplicator(
  /*#__PURE__*/
  flip(_concat));

  /**
   * Takes a predicate and a list or other `Filterable` object and returns the
   * pair of filterable objects of the same type of elements which do and do not
   * satisfy, the predicate, respectively. Filterable objects include plain objects or any object
   * that has a filter method such as `Array`.
   *
   * @func
   * @memberOf R
   * @since v0.1.4
   * @category List
   * @sig Filterable f => (a -> Boolean) -> f a -> [f a, f a]
   * @param {Function} pred A predicate to determine which side the element belongs to.
   * @param {Array} filterable the list (or other filterable) to partition.
   * @return {Array} An array, containing first the subset of elements that satisfy the
   *         predicate, and second the subset of elements that do not satisfy.
   * @see R.filter, R.reject
   * @example
   *
   *      R.partition(R.includes('s'), ['sss', 'ttt', 'foo', 'bars']);
   *      // => [ [ 'sss', 'bars' ],  [ 'ttt', 'foo' ] ]
   *
   *      R.partition(R.includes('s'), { a: 'sss', b: 'ttt', foo: 'bars' });
   *      // => [ { a: 'sss', foo: 'bars' }, { b: 'ttt' }  ]
   */

  var partition =
  /*#__PURE__*/
  juxt([filter, reject]);

  /**
   * Determines whether a nested path on an object has a specific value, in
   * [`R.equals`](#equals) terms. Most likely used to filter a list.
   *
   * @func
   * @memberOf R
   * @since v0.7.0
   * @category Relation
   * @typedefn Idx = String | Int | Symbol
   * @sig a -> [Idx] -> {a} -> Boolean
   * @param {*} val The value to compare the nested property with
   * @param {Array} path The path of the nested property to use
   * @param {Object} obj The object to check the nested property in
   * @return {Boolean} `true` if the value equals the nested object property,
   *         `false` otherwise.
   * @see R.whereEq, R.propEq, R.pathSatisfies, R.equals
   * @example
   *
   *      const user1 = { address: { zipCode: 90210 } };
   *      const user2 = { address: { zipCode: 55555 } };
   *      const user3 = { name: 'Bob' };
   *      const users = [ user1, user2, user3 ];
   *      const isFamous = R.pathEq(90210, ['address', 'zipCode']);
   *      R.filter(isFamous, users); //=> [ user1 ]
   */

  var pathEq =
  /*#__PURE__*/
  _curry3(function pathEq(val, _path, obj) {
    return equals(path(_path, obj), val);
  });

  /**
   * If the given, non-null object has a value at the given path, returns the
   * value at that path. Otherwise returns the provided default value.
   *
   * @func
   * @memberOf R
   * @since v0.18.0
   * @category Object
   * @typedefn Idx = String | Int | Symbol
   * @sig a -> [Idx] -> {a} -> a
   * @param {*} d The default value.
   * @param {Array} p The path to use.
   * @param {Object} obj The object to retrieve the nested property from.
   * @return {*} The data at `path` of the supplied object or the default value.
   * @example
   *
   *      R.pathOr('N/A', ['a', 'b'], {a: {b: 2}}); //=> 2
   *      R.pathOr('N/A', ['a', 'b'], {c: {b: 2}}); //=> "N/A"
   */

  var pathOr =
  /*#__PURE__*/
  _curry3(function pathOr(d, p, obj) {
    return defaultTo(d, path(p, obj));
  });

  /**
   * Returns `true` if the specified object property at given path satisfies the
   * given predicate; `false` otherwise.
   *
   * @func
   * @memberOf R
   * @since v0.19.0
   * @category Logic
   * @typedefn Idx = String | Int | Symbol
   * @sig (a -> Boolean) -> [Idx] -> {a} -> Boolean
   * @param {Function} pred
   * @param {Array} propPath
   * @param {*} obj
   * @return {Boolean}
   * @see R.propSatisfies, R.path
   * @example
   *
   *      R.pathSatisfies(y => y > 0, ['x', 'y'], {x: {y: 2}}); //=> true
   *      R.pathSatisfies(R.is(Object), [], {x: {y: 2}}); //=> true
   */

  var pathSatisfies =
  /*#__PURE__*/
  _curry3(function pathSatisfies(pred, propPath, obj) {
    return pred(path(propPath, obj));
  });

  /**
   * Returns a partial copy of an object containing only the keys specified. If
   * the key does not exist, the property is ignored.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Object
   * @sig [k] -> {k: v} -> {k: v}
   * @param {Array} names an array of String property names to copy onto a new object
   * @param {Object} obj The object to copy from
   * @return {Object} A new object with only properties from `names` on it.
   * @see R.omit, R.props
   * @example
   *
   *      R.pick(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, d: 4}
   *      R.pick(['a', 'e', 'f'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1}
   */

  var pick =
  /*#__PURE__*/
  _curry2(function pick(names, obj) {
    var result = {};
    var idx = 0;

    while (idx < names.length) {
      if (names[idx] in obj) {
        result[names[idx]] = obj[names[idx]];
      }

      idx += 1;
    }

    return result;
  });

  /**
   * Similar to `pick` except that this one includes a `key: undefined` pair for
   * properties that don't exist.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Object
   * @sig [k] -> {k: v} -> {k: v}
   * @param {Array} names an array of String property names to copy onto a new object
   * @param {Object} obj The object to copy from
   * @return {Object} A new object with only properties from `names` on it.
   * @see R.pick
   * @example
   *
   *      R.pickAll(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, d: 4}
   *      R.pickAll(['a', 'e', 'f'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, e: undefined, f: undefined}
   */

  var pickAll =
  /*#__PURE__*/
  _curry2(function pickAll(names, obj) {
    var result = {};
    var idx = 0;
    var len = names.length;

    while (idx < len) {
      var name = names[idx];
      result[name] = obj[name];
      idx += 1;
    }

    return result;
  });

  /**
   * Returns a partial copy of an object containing only the keys that satisfy
   * the supplied predicate.
   *
   * @func
   * @memberOf R
   * @since v0.8.0
   * @category Object
   * @sig ((v, k) -> Boolean) -> {k: v} -> {k: v}
   * @param {Function} pred A predicate to determine whether or not a key
   *        should be included on the output object.
   * @param {Object} obj The object to copy from
   * @return {Object} A new object with only properties that satisfy `pred`
   *         on it.
   * @see R.pick, R.filter
   * @example
   *
   *      const isUpperCase = (val, key) => key.toUpperCase() === key;
   *      R.pickBy(isUpperCase, {a: 1, b: 2, A: 3, B: 4}); //=> {A: 3, B: 4}
   */

  var pickBy =
  /*#__PURE__*/
  _curry2(function pickBy(test, obj) {
    var result = {};

    for (var prop in obj) {
      if (test(obj[prop], prop, obj)) {
        result[prop] = obj[prop];
      }
    }

    return result;
  });

  /**
   * Returns a new list with the given element at the front, followed by the
   * contents of the list.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig a -> [a] -> [a]
   * @param {*} el The item to add to the head of the output list.
   * @param {Array} list The array to add to the tail of the output list.
   * @return {Array} A new array.
   * @see R.append
   * @example
   *
   *      R.prepend('fee', ['fi', 'fo', 'fum']); //=> ['fee', 'fi', 'fo', 'fum']
   */

  var prepend =
  /*#__PURE__*/
  _curry2(function prepend(el, list) {
    return _concat([el], list);
  });

  /**
   * Multiplies together all the elements of a list.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Math
   * @sig [Number] -> Number
   * @param {Array} list An array of numbers
   * @return {Number} The product of all the numbers in the list.
   * @see R.reduce
   * @example
   *
   *      R.product([2,4,6,8,100,1]); //=> 38400
   */

  var product =
  /*#__PURE__*/
  reduce(multiply, 1);

  /**
   * Accepts a function `fn` and a list of transformer functions and returns a
   * new curried function. When the new function is invoked, it calls the
   * function `fn` with parameters consisting of the result of calling each
   * supplied handler on successive arguments to the new function.
   *
   * If more arguments are passed to the returned function than transformer
   * functions, those arguments are passed directly to `fn` as additional
   * parameters. If you expect additional arguments that don't need to be
   * transformed, although you can ignore them, it's best to pass an identity
   * function so that the new function reports the correct arity.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Function
   * @sig ((x1, x2, ...) -> z) -> [(a -> x1), (b -> x2), ...] -> (a -> b -> ... -> z)
   * @param {Function} fn The function to wrap.
   * @param {Array} transformers A list of transformer functions
   * @return {Function} The wrapped function.
   * @see R.converge
   * @example
   *
   *      R.useWith(Math.pow, [R.identity, R.identity])(3, 4); //=> 81
   *      R.useWith(Math.pow, [R.identity, R.identity])(3)(4); //=> 81
   *      R.useWith(Math.pow, [R.dec, R.inc])(3, 4); //=> 32
   *      R.useWith(Math.pow, [R.dec, R.inc])(3)(4); //=> 32
   * @symb R.useWith(f, [g, h])(a, b) = f(g(a), h(b))
   */

  var useWith =
  /*#__PURE__*/
  _curry2(function useWith(fn, transformers) {
    return curryN(transformers.length, function () {
      var args = [];
      var idx = 0;

      while (idx < transformers.length) {
        args.push(transformers[idx].call(this, arguments[idx]));
        idx += 1;
      }

      return fn.apply(this, args.concat(Array.prototype.slice.call(arguments, transformers.length)));
    });
  });

  /**
   * Reasonable analog to SQL `select` statement.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Object
   * @category Relation
   * @sig [k] -> [{k: v}] -> [{k: v}]
   * @param {Array} props The property names to project
   * @param {Array} objs The objects to query
   * @return {Array} An array of objects with just the `props` properties.
   * @see R.pluck, R.props, R.prop
   * @example
   *
   *      const abby = {name: 'Abby', age: 7, hair: 'blond', grade: 2};
   *      const fred = {name: 'Fred', age: 12, hair: 'brown', grade: 7};
   *      const kids = [abby, fred];
   *      R.project(['name', 'grade'], kids); //=> [{name: 'Abby', grade: 2}, {name: 'Fred', grade: 7}]
   */

  var project =
  /*#__PURE__*/
  useWith(_map, [pickAll, identity]); // passing `identity` gives correct arity

  function _promap(f, g, profunctor) {
    return function (x) {
      return g(profunctor(f(x)));
    };
  }

  var XPromap =
  /*#__PURE__*/
  function () {
    function XPromap(f, g, xf) {
      this.xf = xf;
      this.f = f;
      this.g = g;
    }

    XPromap.prototype['@@transducer/init'] = _xfBase.init;
    XPromap.prototype['@@transducer/result'] = _xfBase.result;

    XPromap.prototype['@@transducer/step'] = function (result, input) {
      return this.xf['@@transducer/step'](result, _promap(this.f, this.g, input));
    };

    return XPromap;
  }();

  function _xpromap(f, g) {
    return function (xf) {
      return new XPromap(f, g, xf);
    };
  }

  /**
   * Takes two functions as pre- and post- processors respectively for a third function,
   * i.e. `promap(f, g, h)(x) === g(h(f(x)))`.
   *
   * Dispatches to the `promap` method of the third argument, if present,
   * according to the [FantasyLand Profunctor spec](https://github.com/fantasyland/fantasy-land#profunctor).
   *
   * Acts as a transducer if a transformer is given in profunctor position.
   *
   * @func
   * @memberOf R
   * @since v0.28.0
   * @category Function
   * @sig (a -> b) -> (c -> d) -> (b -> c) -> (a -> d)
   * @sig Profunctor p => (a -> b) -> (c -> d) -> p b c -> p a d
   * @param {Function} f The preprocessor function, a -> b
   * @param {Function} g The postprocessor function, c -> d
   * @param {Profunctor} profunctor The profunctor instance to be promapped, e.g. b -> c
   * @return {Profunctor} The new profunctor instance, e.g. a -> d
   * @see R.transduce
   * @example
   *
   *      const decodeChar = R.promap(s => s.charCodeAt(), String.fromCharCode, R.add(-8))
   *      const decodeString = R.promap(R.split(''), R.join(''), R.map(decodeChar))
   *      decodeString("ziuli") //=> "ramda"
   *
   * @symb R.promap(f, g, h) = x => g(h(f(x)))
   * @symb R.promap(f, g, profunctor) = profunctor.promap(f, g)
   */

  var promap =
  /*#__PURE__*/
  _curry3(
  /*#__PURE__*/
  _dispatchable(['fantasy-land/promap', 'promap'], _xpromap, _promap));

  /**
   * Returns `true` if the specified object property is equal, in
   * [`R.equals`](#equals) terms, to the given value; `false` otherwise.
   * You can test multiple properties with [`R.whereEq`](#whereEq),
   * and test nested path property with [`R.pathEq`](#pathEq).
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Relation
   * @sig a -> String -> Object -> Boolean
   * @param {*} val The value to compare the property with
   * @param {String} name the specified object property's key
   * @param {*} obj The object to check the property in
   * @return {Boolean} `true` if the value equals the specified object property,
   *         `false` otherwise.
   * @see R.whereEq, R.pathEq, R.propSatisfies, R.equals
   * @example
   *
   *      const abby = {name: 'Abby', age: 7, hair: 'blond'};
   *      const fred = {name: 'Fred', age: 12, hair: 'brown'};
   *      const rusty = {name: 'Rusty', age: 10, hair: 'brown'};
   *      const alois = {name: 'Alois', age: 15, disposition: 'surly'};
   *      const kids = [abby, fred, rusty, alois];
   *      const hasBrownHair = R.propEq('brown', 'hair');
   *      R.filter(hasBrownHair, kids); //=> [fred, rusty]
   */

  var propEq =
  /*#__PURE__*/
  _curry3(function propEq(val, name, obj) {
    return equals(val, prop(name, obj));
  });

  /**
   * Returns `true` if the specified object property is of the given type;
   * `false` otherwise.
   *
   * @func
   * @memberOf R
   * @since v0.16.0
   * @category Type
   * @sig Type -> String -> Object -> Boolean
   * @param {Function} type
   * @param {String} name
   * @param {*} obj
   * @return {Boolean}
   * @see R.is, R.propSatisfies
   * @example
   *
   *      R.propIs(Number, 'x', {x: 1, y: 2});  //=> true
   *      R.propIs(Number, 'x', {x: 'foo'});    //=> false
   *      R.propIs(Number, 'x', {});            //=> false
   */

  var propIs =
  /*#__PURE__*/
  _curry3(function propIs(type, name, obj) {
    return is(type, prop(name, obj));
  });

  /**
   * Return the specified property of the given non-null object if the property
   * is present and it's value is not `null`, `undefined` or `NaN`.
   *
   * Otherwise the first argument is returned.
   *
   * @func
   * @memberOf R
   * @since v0.6.0
   * @category Object
   * @sig a -> String -> Object -> a
   * @param {*} val The default value.
   * @param {String} p The name of the property to return.
   * @param {Object} obj The object to query.
   * @return {*} The value of given property of the supplied object or the default value.
   * @example
   *
   *      const alice = {
   *        name: 'ALICE',
   *        age: 101
   *      };
   *      const favorite = R.prop('favoriteLibrary');
   *      const favoriteWithDefault = R.propOr('Ramda', 'favoriteLibrary');
   *
   *      favorite(alice);  //=> undefined
   *      favoriteWithDefault(alice);  //=> 'Ramda'
   */

  var propOr =
  /*#__PURE__*/
  _curry3(function propOr(val, p, obj) {
    return defaultTo(val, prop(p, obj));
  });

  /**
   * Returns `true` if the specified object property satisfies the given
   * predicate; `false` otherwise. You can test multiple properties with
   * [`R.where`](#where).
   *
   * @func
   * @memberOf R
   * @since v0.16.0
   * @category Logic
   * @sig (a -> Boolean) -> String -> {String: a} -> Boolean
   * @param {Function} pred
   * @param {String} name
   * @param {*} obj
   * @return {Boolean}
   * @see R.where, R.propEq, R.propIs
   * @example
   *
   *      R.propSatisfies(x => x > 0, 'x', {x: 1, y: 2}); //=> true
   */

  var propSatisfies =
  /*#__PURE__*/
  _curry3(function propSatisfies(pred, name, obj) {
    return pred(prop(name, obj));
  });

  /**
   * Acts as multiple `prop`: array of keys in, array of values out. Preserves
   * order.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Object
   * @sig [k] -> {k: v} -> [v]
   * @param {Array} ps The property names to fetch
   * @param {Object} obj The object to query
   * @return {Array} The corresponding values or partially applied function.
   * @see R.prop, R.pluck, R.project
   * @example
   *
   *      R.props(['x', 'y'], {x: 1, y: 2}); //=> [1, 2]
   *      R.props(['c', 'a', 'b'], {b: 2, a: 1}); //=> [undefined, 1, 2]
   *
   *      const fullName = R.compose(R.join(' '), R.props(['first', 'last']));
   *      fullName({last: 'Bullet-Tooth', age: 33, first: 'Tony'}); //=> 'Tony Bullet-Tooth'
   */

  var props =
  /*#__PURE__*/
  _curry2(function props(ps, obj) {
    return ps.map(function (p) {
      return path([p], obj);
    });
  });

  /**
   * Returns a list of numbers from `from` (inclusive) to `to` (exclusive).
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig Number -> Number -> [Number]
   * @param {Number} from The first number in the list.
   * @param {Number} to One more than the last number in the list.
   * @return {Array} The list of numbers in the set `[a, b)`.
   * @example
   *
   *      R.range(1, 5);    //=> [1, 2, 3, 4]
   *      R.range(50, 53);  //=> [50, 51, 52]
   */

  var range =
  /*#__PURE__*/
  _curry2(function range(from, to) {
    if (!(_isNumber(from) && _isNumber(to))) {
      throw new TypeError('Both arguments to range must be numbers');
    }

    var result = [];
    var n = from;

    while (n < to) {
      result.push(n);
      n += 1;
    }

    return result;
  });

  /**
   * Returns a single item by iterating through the list, successively calling
   * the iterator function and passing it an accumulator value and the current
   * value from the array, and then passing the result to the next call.
   *
   * Similar to [`reduce`](#reduce), except moves through the input list from the
   * right to the left.
   *
   * The iterator function receives two values: *(value, acc)*, while the arguments'
   * order of `reduce`'s iterator function is *(acc, value)*. `reduceRight` may use [`reduced`](#reduced)
   * to short circuit the iteration.
   *
   * Note: `R.reduceRight` does not skip deleted or unassigned indices (sparse
   * arrays), unlike the native `Array.prototype.reduceRight` method. For more details
   * on this behavior, see:
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight#Description
   *
   * Be cautious of mutating and returning the accumulator. If you reuse it across
   * invocations, it will continue to accumulate onto the same value. The general
   * recommendation is to always return a new value. If you can't do so for
   * performance reasons, then be sure to reinitialize the accumulator on each
   * invocation.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig ((a, b) -> b) -> b -> [a] -> b
   * @param {Function} fn The iterator function. Receives two values, the current element from the array
   *        and the accumulator.
   * @param {*} acc The accumulator value.
   * @param {Array} list The list to iterate over.
   * @return {*} The final, accumulated value.
   * @see R.reduce, R.addIndex, R.reduced
   * @example
   *
   *      R.reduceRight(R.subtract, 0, [1, 2, 3, 4]) // => (1 - (2 - (3 - (4 - 0)))) = -2
   *      //    -               -2
   *      //   / \              / \
   *      //  1   -            1   3
   *      //     / \              / \
   *      //    2   -     ==>    2  -1
   *      //       / \              / \
   *      //      3   -            3   4
   *      //         / \              / \
   *      //        4   0            4   0
   *
   * @symb R.reduceRight(f, a, [b, c, d]) = f(b, f(c, f(d, a)))
   */

  var reduceRight =
  /*#__PURE__*/
  _curry3(function reduceRight(fn, acc, list) {
    var idx = list.length - 1;

    while (idx >= 0) {
      acc = fn(list[idx], acc);

      if (acc && acc['@@transducer/reduced']) {
        acc = acc['@@transducer/value'];
        break;
      }

      idx -= 1;
    }

    return acc;
  });

  /**
   * Like [`reduce`](#reduce), `reduceWhile` returns a single item by iterating
   * through the list, successively calling the iterator function. `reduceWhile`
   * also takes a predicate that is evaluated before each step. If the predicate
   * returns `false`, it "short-circuits" the iteration and returns the current
   * value of the accumulator. `reduceWhile` may alternatively be short-circuited
   * via [`reduced`](#reduced).
   *
   * @func
   * @memberOf R
   * @since v0.22.0
   * @category List
   * @sig ((a, b) -> Boolean) -> ((a, b) -> a) -> a -> [b] -> a
   * @param {Function} pred The predicate. It is passed the accumulator and the
   *        current element.
   * @param {Function} fn The iterator function. Receives two values, the
   *        accumulator and the current element.
   * @param {*} a The accumulator value.
   * @param {Array} list The list to iterate over.
   * @return {*} The final, accumulated value.
   * @see R.reduce, R.reduced
   * @example
   *
   *      const isOdd = (acc, x) => x % 2 !== 0;
   *      const xs = [1, 3, 5, 60, 777, 800];
   *      R.reduceWhile(isOdd, R.add, 0, xs); //=> 9
   *
   *      const ys = [2, 4, 6]
   *      R.reduceWhile(isOdd, R.add, 111, ys); //=> 111
   */

  var reduceWhile =
  /*#__PURE__*/
  _curryN(4, [], function _reduceWhile(pred, fn, a, list) {
    var xf = _xwrap(function (acc, x) {
      return pred(acc, x) ? fn(acc, x) : _reduced(acc);
    });

    return _xReduce(xf, a, list);
  });

  /**
   * Returns a value wrapped to indicate that it is the final value of the reduce
   * and transduce functions. The returned value should be considered a black
   * box: the internal structure is not guaranteed to be stable.
   *
   * This optimization is available to the below functions:
   * - [`reduce`](#reduce)
   * - [`reduceWhile`](#reduceWhile)
   * - [`reduceBy`](#reduceBy)
   * - [`reduceRight`](#reduceRight)
   * - [`transduce`](#transduce)
   *
   * @func
   * @memberOf R
   * @since v0.15.0
   * @category List
   * @sig a -> *
   * @param {*} x The final value of the reduce.
   * @return {*} The wrapped value.
   * @see R.reduce, R.reduceWhile, R.reduceBy, R.reduceRight, R.transduce
   * @example
   *
   *     R.reduce(
   *       (acc, item) => item > 3 ? R.reduced(acc) : acc.concat(item),
   *       [],
   *       [1, 2, 3, 4, 5]) // [1, 2, 3]
   */

  var reduced =
  /*#__PURE__*/
  _curry1(_reduced);

  /**
   * Calls an input function `n` times, returning an array containing the results
   * of those function calls.
   *
   * `fn` is passed one argument: The current value of `n`, which begins at `0`
   * and is gradually incremented to `n - 1`.
   *
   * @func
   * @memberOf R
   * @since v0.2.3
   * @category List
   * @sig (Number -> a) -> Number -> [a]
   * @param {Function} fn The function to invoke. Passed one argument, the current value of `n`.
   * @param {Number} n A value between `0` and `n - 1`. Increments after each function call.
   * @return {Array} An array containing the return values of all calls to `fn`.
   * @see R.repeat
   * @example
   *
   *      R.times(R.identity, 5); //=> [0, 1, 2, 3, 4]
   * @symb R.times(f, 0) = []
   * @symb R.times(f, 1) = [f(0)]
   * @symb R.times(f, 2) = [f(0), f(1)]
   */

  var times =
  /*#__PURE__*/
  _curry2(function times(fn, n) {
    var len = Number(n);
    var idx = 0;
    var list;

    if (len < 0 || isNaN(len)) {
      throw new RangeError('n must be a non-negative number');
    }

    list = [];

    while (idx < len) {
      list.push(fn(idx));
      idx += 1;
    }

    return list;
  });

  /**
   * Returns a fixed list of size `n` containing a specified identical value.
   *
   * @func
   * @memberOf R
   * @since v0.1.1
   * @category List
   * @sig a -> n -> [a]
   * @param {*} value The value to repeat.
   * @param {Number} n The desired size of the output list.
   * @return {Array} A new array containing `n` `value`s.
   * @see R.times
   * @example
   *
   *      R.repeat('hi', 5); //=> ['hi', 'hi', 'hi', 'hi', 'hi']
   *
   *      const obj = {};
   *      const repeatedObjs = R.repeat(obj, 5); //=> [{}, {}, {}, {}, {}]
   *      repeatedObjs[0] === repeatedObjs[1]; //=> true
   * @symb R.repeat(a, 0) = []
   * @symb R.repeat(a, 1) = [a]
   * @symb R.repeat(a, 2) = [a, a]
   */

  var repeat =
  /*#__PURE__*/
  _curry2(function repeat(value, n) {
    return times(always(value), n);
  });

  /**
   * Replace a substring or regex match in a string with a replacement.
   *
   * The first two parameters correspond to the parameters of the
   * `String.prototype.replace()` function, so the second parameter can also be a
   * function.
   *
   * @func
   * @memberOf R
   * @since v0.7.0
   * @category String
   * @sig RegExp|String -> String -> String -> String
   * @param {RegExp|String} pattern A regular expression or a substring to match.
   * @param {String} replacement The string to replace the matches with.
   * @param {String} str The String to do the search and replacement in.
   * @return {String} The result.
   * @example
   *
   *      R.replace('foo', 'bar', 'foo foo foo'); //=> 'bar foo foo'
   *      R.replace(/foo/, 'bar', 'foo foo foo'); //=> 'bar foo foo'
   *
   *      // Use the "g" (global) flag to replace all occurrences:
   *      R.replace(/foo/g, 'bar', 'foo foo foo'); //=> 'bar bar bar'
   */

  var replace =
  /*#__PURE__*/
  _curry3(function replace(regex, replacement, str) {
    return str.replace(regex, replacement);
  });

  var tInit = '@@transducer/init';
  var tStep = '@@transducer/step';

  var XScan =
  /*#__PURE__*/
  function () {
    function XScan(reducer, acc, xf) {
      this.xf = xf;
      this.f = reducer;
      this.acc = acc;
    }

    XScan.prototype[tInit] = function () {
      return this.xf[tStep](this.xf[tInit](), this.acc);
    };

    XScan.prototype['@@transducer/result'] = _xfBase.result;

    XScan.prototype[tStep] = function (result, input) {
      if (result['@@transducer/reduced']) {
        return result;
      }

      this.acc = this.f(this.acc, input);
      return this.xf[tStep](result, this.acc);
    };

    return XScan;
  }();

  var _xscan =
  /*#__PURE__*/
  _curry3(function _xscan(reducer, acc, xf) {
    return new XScan(reducer, acc, xf);
  });

  /**
   * Scan is similar to [`reduce`](#reduce), but returns a list of successively
   * reduced values from the left.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.10.0
   * @category List
   * @sig ((a, b) -> a) -> a -> [b] -> [a]
   * @param {Function} fn The iterator function. Receives two values, the accumulator and the
   *        current element from the array
   * @param {*} acc The accumulator value.
   * @param {Array} list The list to iterate over.
   * @return {Array} A list of all intermediately reduced values.
   * @see R.reduce, R.mapAccum
   * @example
   *
   *      const numbers = [1, 2, 3, 4];
   *      const factorials = R.scan(R.multiply, 1, numbers); //=> [1, 1, 2, 6, 24]
   * @symb R.scan(f, a, [b, c]) = [a, f(a, b), f(f(a, b), c)]
   */

  var scan =
  /*#__PURE__*/
  _curry3(
  /*#__PURE__*/
  _dispatchable([], _xscan, function scan(fn, acc, list) {
    var idx = 0;
    var len = list.length;
    var result = [acc];

    while (idx < len) {
      acc = fn(acc, list[idx]);
      result[idx + 1] = acc;
      idx += 1;
    }

    return result;
  }));

  /**
   * Transforms a [Traversable](https://github.com/fantasyland/fantasy-land#traversable)
   * of [Applicative](https://github.com/fantasyland/fantasy-land#applicative) into an
   * Applicative of Traversable.
   *
   * Dispatches to the `"fantasy-land/traverse"` or the `traverse` method of the second argument, if present.
   *
   * @func
   * @memberOf R
   * @since v0.19.0
   * @category List
   * @sig fantasy-land/of :: TypeRep f => f ~> a -> f a
   * @sig (Applicative f, Traversable t) => TypeRep f -> t (f a) -> f (t a)
   * @sig (Applicative f, Traversable t) => (a -> f a) -> t (f a) -> f (t a)
   * @param {Object|Function} TypeRepresentative with an `of` or `fantasy-land/of` method
   * @param {*} traversable
   * @return {*}
   * @see R.traverse
   * @example
   *
   *      R.sequence(Maybe.of, [Just(1), Just(2), Just(3)]);   //=> Just([1, 2, 3])
   *      R.sequence(Maybe.of, [Just(1), Just(2), Nothing()]); //=> Nothing()
   *
   *      R.sequence(R.of(Array), Just([1, 2, 3])); //=> [Just(1), Just(2), Just(3)]
   *      R.sequence(R.of(Array), Nothing());       //=> [Nothing()]
   */

  var sequence =
  /*#__PURE__*/
  _curry2(function sequence(F, traversable) {
    var of = typeof F['fantasy-land/of'] === 'function' ? F['fantasy-land/of'] : typeof F.of === 'function' ? F.of : F;
    var TypeRep = {
      'fantasy-land/of': of
    };
    return typeof traversable['fantasy-land/traverse'] === 'function' ? traversable['fantasy-land/traverse'](TypeRep, _identity) : typeof traversable.traverse === 'function' ? traversable.traverse(TypeRep, _identity) : reduceRight(function (x, acc) {
      return ap(map(prepend, x), acc);
    }, of([]), traversable);
  });

  /**
   * Returns the result of "setting" the portion of the given data structure
   * focused by the given lens to the given value.
   *
   * @func
   * @memberOf R
   * @since v0.16.0
   * @category Object
   * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
   * @sig Lens s a -> a -> s -> s
   * @param {Lens} lens
   * @param {*} v
   * @param {*} x
   * @return {*}
   * @see R.view, R.over, R.lens, R.lensIndex, R.lensProp, R.lensPath
   * @example
   *
   *      const xLens = R.lensProp('x');
   *
   *      R.set(xLens, 4, {x: 1, y: 2});  //=> {x: 4, y: 2}
   *      R.set(xLens, 8, {x: 1, y: 2});  //=> {x: 8, y: 2}
   */

  var set =
  /*#__PURE__*/
  _curry3(function set(lens, v, x) {
    return over(lens, always(v), x);
  });

  /**
   * Returns a copy of the list, sorted according to the comparator function,
   * which should accept two values at a time and return a negative number if the
   * first value is smaller, a positive number if it's larger, and zero if they
   * are equal. Please note that this is a **copy** of the list. It does not
   * modify the original.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig ((a, a) -> Number) -> [a] -> [a]
   * @param {Function} comparator A sorting function :: a -> b -> Int
   * @param {Array} list The list to sort
   * @return {Array} a new array with its elements sorted by the comparator function.
   * @see R.ascend, R.descend
   * @example
   *
   *      const diff = function(a, b) { return a - b; };
   *      R.sort(diff, [4,2,7,5]); //=> [2, 4, 5, 7]
   */

  var sort =
  /*#__PURE__*/
  _curry2(function sort(comparator, list) {
    return Array.prototype.slice.call(list, 0).sort(comparator);
  });

  /**
   * Sorts the list according to the supplied function.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Relation
   * @sig Ord b => (a -> b) -> [a] -> [a]
   * @param {Function} fn
   * @param {Array} list The list to sort.
   * @return {Array} A new list sorted by the keys generated by `fn`.
   * @example
   *
   *      const sortByFirstItem = R.sortBy(R.prop(0));
   *      const pairs = [[-1, 1], [-2, 2], [-3, 3]];
   *      sortByFirstItem(pairs); //=> [[-3, 3], [-2, 2], [-1, 1]]
   *
   *      const sortByNameCaseInsensitive = R.sortBy(R.compose(R.toLower, R.prop('name')));
   *      const alice = {
   *        name: 'ALICE',
   *        age: 101
   *      };
   *      const bob = {
   *        name: 'Bob',
   *        age: -10
   *      };
   *      const clara = {
   *        name: 'clara',
   *        age: 314.159
   *      };
   *      const people = [clara, bob, alice];
   *      sortByNameCaseInsensitive(people); //=> [alice, bob, clara]
   */

  var sortBy =
  /*#__PURE__*/
  _curry2(function sortBy(fn, list) {
    return Array.prototype.slice.call(list, 0).sort(function (a, b) {
      var aa = fn(a);
      var bb = fn(b);
      return aa < bb ? -1 : aa > bb ? 1 : 0;
    });
  });

  /**
   * Sorts a list according to a list of comparators.
   *
   * @func
   * @memberOf R
   * @since v0.23.0
   * @category Relation
   * @sig [(a, a) -> Number] -> [a] -> [a]
   * @param {Array} functions A list of comparator functions.
   * @param {Array} list The list to sort.
   * @return {Array} A new list sorted according to the comarator functions.
   * @see R.ascend, R.descend
   * @example
   *
   *      const alice = {
   *        name: 'alice',
   *        age: 40
   *      };
   *      const bob = {
   *        name: 'bob',
   *        age: 30
   *      };
   *      const clara = {
   *        name: 'clara',
   *        age: 40
   *      };
   *      const people = [clara, bob, alice];
   *      const ageNameSort = R.sortWith([
   *        R.descend(R.prop('age')),
   *        R.ascend(R.prop('name'))
   *      ]);
   *      ageNameSort(people); //=> [alice, clara, bob]
   */

  var sortWith =
  /*#__PURE__*/
  _curry2(function sortWith(fns, list) {
    return Array.prototype.slice.call(list, 0).sort(function (a, b) {
      var result = 0;
      var i = 0;

      while (result === 0 && i < fns.length) {
        result = fns[i](a, b);
        i += 1;
      }

      return result;
    });
  });

  /**
   * Splits a string into an array of strings based on the given
   * separator.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category String
   * @sig (String | RegExp) -> String -> [String]
   * @param {String|RegExp} sep The pattern.
   * @param {String} str The string to separate into an array.
   * @return {Array} The array of strings from `str` separated by `sep`.
   * @see R.join
   * @example
   *
   *      const pathComponents = R.split('/');
   *      R.tail(pathComponents('/usr/local/bin/node')); //=> ['usr', 'local', 'bin', 'node']
   *
   *      R.split('.', 'a.b.c.xyz.d'); //=> ['a', 'b', 'c', 'xyz', 'd']
   */

  var split =
  /*#__PURE__*/
  invoker(1, 'split');

  /**
   * Splits a given list or string at a given index.
   *
   * @func
   * @memberOf R
   * @since v0.19.0
   * @category List
   * @sig Number -> [a] -> [[a], [a]]
   * @sig Number -> String -> [String, String]
   * @param {Number} index The index where the array/string is split.
   * @param {Array|String} array The array/string to be split.
   * @return {Array}
   * @example
   *
   *      R.splitAt(1, [1, 2, 3]);          //=> [[1], [2, 3]]
   *      R.splitAt(5, 'hello world');      //=> ['hello', ' world']
   *      R.splitAt(-1, 'foobar');          //=> ['fooba', 'r']
   */

  var splitAt =
  /*#__PURE__*/
  _curry2(function splitAt(index, array) {
    return [slice(0, index, array), slice(index, length(array), array)];
  });

  /**
   * Splits a collection into slices of the specified length.
   *
   * @func
   * @memberOf R
   * @since v0.16.0
   * @category List
   * @sig Number -> [a] -> [[a]]
   * @sig Number -> String -> [String]
   * @param {Number} n
   * @param {Array} list
   * @return {Array}
   * @example
   *
   *      R.splitEvery(3, [1, 2, 3, 4, 5, 6, 7]); //=> [[1, 2, 3], [4, 5, 6], [7]]
   *      R.splitEvery(3, 'foobarbaz'); //=> ['foo', 'bar', 'baz']
   */

  var splitEvery =
  /*#__PURE__*/
  _curry2(function splitEvery(n, list) {
    if (n <= 0) {
      throw new Error('First argument to splitEvery must be a positive integer');
    }

    var result = [];
    var idx = 0;

    while (idx < list.length) {
      result.push(slice(idx, idx += n, list));
    }

    return result;
  });

  /**
   * Takes a list and a predicate and returns a pair of lists with the following properties:
   *
   *  - the result of concatenating the two output lists is equivalent to the input list;
   *  - none of the elements of the first output list satisfies the predicate; and
   *  - if the second output list is non-empty, its first element satisfies the predicate.
   *
   * @func
   * @memberOf R
   * @since v0.19.0
   * @category List
   * @sig (a -> Boolean) -> [a] -> [[a], [a]]
   * @param {Function} pred The predicate that determines where the array is split.
   * @param {Array} list The array to be split.
   * @return {Array}
   * @example
   *
   *      R.splitWhen(R.equals(2), [1, 2, 3, 1, 2, 3]);   //=> [[1], [2, 3, 1, 2, 3]]
   */

  var splitWhen =
  /*#__PURE__*/
  _curry2(function splitWhen(pred, list) {
    var idx = 0;
    var len = list.length;
    var prefix = [];

    while (idx < len && !pred(list[idx])) {
      prefix.push(list[idx]);
      idx += 1;
    }

    return [prefix, Array.prototype.slice.call(list, idx)];
  });

  /**
   * Splits an array into slices on every occurrence of a value.
   *
   * @func
   * @memberOf R
   * @since v0.26.1
   * @category List
   * @sig (a -> Boolean) -> [a] -> [[a]]
   * @param {Function} pred The predicate that determines where the array is split.
   * @param {Array} list The array to be split.
   * @return {Array}
   * @example
   *
   *      R.splitWhenever(R.equals(2), [1, 2, 3, 2, 4, 5, 2, 6, 7]); //=> [[1], [3], [4, 5], [6, 7]]
   */

  var splitWhenever =
  /*#__PURE__*/
  _curryN(2, [], function splitWhenever(pred, list) {
    var acc = [];
    var curr = [];

    for (var i = 0; i < list.length; i = i + 1) {
      if (!pred(list[i])) {
        curr.push(list[i]);
      }

      if ((i < list.length - 1 && pred(list[i + 1]) || i === list.length - 1) && curr.length > 0) {
        acc.push(curr);
        curr = [];
      }
    }

    return acc;
  });

  /**
   * Checks if a list starts with the provided sublist.
   *
   * Similarly, checks if a string starts with the provided substring.
   *
   * @func
   * @memberOf R
   * @since v0.24.0
   * @category List
   * @sig [a] -> [a] -> Boolean
   * @sig String -> String -> Boolean
   * @param {*} prefix
   * @param {*} list
   * @return {Boolean}
   * @see R.endsWith
   * @example
   *
   *      R.startsWith('a', 'abc')                //=> true
   *      R.startsWith('b', 'abc')                //=> false
   *      R.startsWith(['a'], ['a', 'b', 'c'])    //=> true
   *      R.startsWith(['b'], ['a', 'b', 'c'])    //=> false
   */

  var startsWith =
  /*#__PURE__*/
  _curry2(function (prefix, list) {
    return equals(take(prefix.length, list), prefix);
  });

  /**
   * Subtracts its second argument from its first argument.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Math
   * @sig Number -> Number -> Number
   * @param {Number} a The first value.
   * @param {Number} b The second value.
   * @return {Number} The result of `a - b`.
   * @see R.add
   * @example
   *
   *      R.subtract(10, 8); //=> 2
   *
   *      const minus5 = R.subtract(R.__, 5);
   *      minus5(17); //=> 12
   *
   *      const complementaryAngle = R.subtract(90);
   *      complementaryAngle(30); //=> 60
   *      complementaryAngle(72); //=> 18
   */

  var subtract =
  /*#__PURE__*/
  _curry2(function subtract(a, b) {
    return Number(a) - Number(b);
  });

  var swapObject = function (indexA, indexB, o) {
    var copy = clone$1(o);
    var properties = Object.getOwnPropertyNames(copy);

    if (properties.includes(indexA) && properties.includes(indexB)) {
      var tmp = copy[indexA];
      copy[indexA] = copy[indexB];
      copy[indexB] = tmp;
    }

    return copy;
  };

  var swapList = function (indexA, indexB, list) {
    var length = list.length;
    var result = list.slice();
    var positiveIndexA = indexA < 0 ? length + indexA : indexA;
    var positiveIndexB = indexB < 0 ? length + indexB : indexB;
    var positiveMin = Math.min(positiveIndexA, positiveIndexB);
    var positiveMax = Math.max(positiveIndexA, positiveIndexB);

    if (positiveIndexA < 0 || positiveIndexA > length) {
      return result;
    }

    if (positiveIndexB < 0 || positiveIndexB > length) {
      return result;
    }

    if (positiveIndexA === positiveIndexB) {
      return result;
    }

    result = [].concat(result.slice(0, positiveMin)).concat([result[positiveMax]]).concat(result.slice(positiveMin + 1, positiveMax)).concat([result[positiveMin]]).concat(result.slice(positiveMax + 1, length));
    return result;
  };

  var swapString = function (indexA, indexB, s) {
    var result = swapList(indexA, indexB, s);
    return _isArray(result) ? result.join('') : result;
  };
  /**
   * Swap an item, at index `indexA` with another item, at index `indexB`, in an object or a list of elements.
   * A new result will be created containing the new elements order.
   *
   * @func
   * @memberOf R
   * @since v0.29.0
   * @category List
   * @sig Number -> Number -> [a] -> [a]
   * @param {Number|string|Object} indexA The first index
   * @param {Number|string|Object} indexB The second index
   * @param {Array|Object} o Either the object or list which will serve to realise the swap
   * @return {Array|Object} The new object or list reordered
   * @example
   *
   *      R.swap(0, 2, ['a', 'b', 'c', 'd', 'e', 'f']); //=> ['c', 'b', 'a', 'd', 'e', 'f']
   *      R.swap(-1, 0, ['a', 'b', 'c', 'd', 'e', 'f']); //=> ['f', 'b', 'c', 'd', 'e', 'a']
   *      R.swap('a', 'b', {a: 1, b: 2}); //=> {a: 2, b: 1}
   *      R.swap(0, 2, 'foo'); //=> 'oof'
   */


  var swap =
  /*#__PURE__*/
  _curry3(function (indexA, indexB, o) {
    if (_isArray(o)) {
      return swapList(indexA, indexB, o);
    } else if (_isString(o)) {
      return swapString(indexA, indexB, o);
    } else {
      return swapObject(indexA, indexB, o);
    }
  });

  /**
   * Finds the set (i.e. no duplicates) of all elements contained in the first or
   * second list, but not both.
   *
   * @func
   * @memberOf R
   * @since v0.19.0
   * @category Relation
   * @sig [*] -> [*] -> [*]
   * @param {Array} list1 The first list.
   * @param {Array} list2 The second list.
   * @return {Array} The elements in `list1` or `list2`, but not both.
   * @see R.symmetricDifferenceWith, R.difference, R.differenceWith
   * @example
   *
   *      R.symmetricDifference([1,2,3,4], [7,6,5,4,3]); //=> [1,2,7,6,5]
   *      R.symmetricDifference([7,6,5,4,3], [1,2,3,4]); //=> [7,6,5,1,2]
   */

  var symmetricDifference =
  /*#__PURE__*/
  _curry2(function symmetricDifference(list1, list2) {
    return concat(difference(list1, list2), difference(list2, list1));
  });

  /**
   * Finds the set (i.e. no duplicates) of all elements contained in the first or
   * second list, but not both. Duplication is determined according to the value
   * returned by applying the supplied predicate to two list elements.
   *
   * @func
   * @memberOf R
   * @since v0.19.0
   * @category Relation
   * @sig ((a, a) -> Boolean) -> [a] -> [a] -> [a]
   * @param {Function} pred A predicate used to test whether two items are equal.
   * @param {Array} list1 The first list.
   * @param {Array} list2 The second list.
   * @return {Array} The elements in `list1` or `list2`, but not both.
   * @see R.symmetricDifference, R.difference, R.differenceWith
   * @example
   *
   *      const eqA = R.eqBy(R.prop('a'));
   *      const l1 = [{a: 1}, {a: 2}, {a: 3}, {a: 4}];
   *      const l2 = [{a: 3}, {a: 4}, {a: 5}, {a: 6}];
   *      R.symmetricDifferenceWith(eqA, l1, l2); //=> [{a: 1}, {a: 2}, {a: 5}, {a: 6}]
   */

  var symmetricDifferenceWith =
  /*#__PURE__*/
  _curry3(function symmetricDifferenceWith(pred, list1, list2) {
    return concat(differenceWith(pred, list1, list2), differenceWith(pred, list2, list1));
  });

  /**
   * Returns a new list containing the last `n` elements of a given list, passing
   * each value to the supplied predicate function, and terminating when the
   * predicate function returns `false`. Excludes the element that caused the
   * predicate function to fail. The predicate function is passed one argument:
   * *(value)*.
   *
   * @func
   * @memberOf R
   * @since v0.16.0
   * @category List
   * @sig (a -> Boolean) -> [a] -> [a]
   * @sig (a -> Boolean) -> String -> String
   * @param {Function} fn The function called per iteration.
   * @param {Array} xs The collection to iterate over.
   * @return {Array} A new array.
   * @see R.dropLastWhile, R.addIndex
   * @example
   *
   *      const isNotOne = x => x !== 1;
   *
   *      R.takeLastWhile(isNotOne, [1, 2, 3, 4]); //=> [2, 3, 4]
   *
   *      R.takeLastWhile(x => x !== 'R' , 'Ramda'); //=> 'amda'
   */

  var takeLastWhile =
  /*#__PURE__*/
  _curry2(function takeLastWhile(fn, xs) {
    var idx = xs.length - 1;

    while (idx >= 0 && fn(xs[idx])) {
      idx -= 1;
    }

    return slice(idx + 1, Infinity, xs);
  });

  var XTakeWhile =
  /*#__PURE__*/
  function () {
    function XTakeWhile(f, xf) {
      this.xf = xf;
      this.f = f;
    }

    XTakeWhile.prototype['@@transducer/init'] = _xfBase.init;
    XTakeWhile.prototype['@@transducer/result'] = _xfBase.result;

    XTakeWhile.prototype['@@transducer/step'] = function (result, input) {
      return this.f(input) ? this.xf['@@transducer/step'](result, input) : _reduced(result);
    };

    return XTakeWhile;
  }();

  function _xtakeWhile(f) {
    return function (xf) {
      return new XTakeWhile(f, xf);
    };
  }

  /**
   * Returns a new list containing the first `n` elements of a given list,
   * passing each value to the supplied predicate function, and terminating when
   * the predicate function returns `false`. Excludes the element that caused the
   * predicate function to fail. The predicate function is passed one argument:
   * *(value)*.
   *
   * Dispatches to the `takeWhile` method of the second argument, if present.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig (a -> Boolean) -> [a] -> [a]
   * @sig (a -> Boolean) -> String -> String
   * @param {Function} fn The function called per iteration.
   * @param {Array} xs The collection to iterate over.
   * @return {Array} A new array.
   * @see R.dropWhile, R.transduce, R.addIndex
   * @example
   *
   *      const isNotFour = x => x !== 4;
   *
   *      R.takeWhile(isNotFour, [1, 2, 3, 4, 3, 2, 1]); //=> [1, 2, 3]
   *
   *      R.takeWhile(x => x !== 'd' , 'Ramda'); //=> 'Ram'
   */

  var takeWhile =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable(['takeWhile'], _xtakeWhile, function takeWhile(fn, xs) {
    var idx = 0;
    var len = xs.length;

    while (idx < len && fn(xs[idx])) {
      idx += 1;
    }

    return slice(0, idx, xs);
  }));

  var XTap =
  /*#__PURE__*/
  function () {
    function XTap(f, xf) {
      this.xf = xf;
      this.f = f;
    }

    XTap.prototype['@@transducer/init'] = _xfBase.init;
    XTap.prototype['@@transducer/result'] = _xfBase.result;

    XTap.prototype['@@transducer/step'] = function (result, input) {
      this.f(input);
      return this.xf['@@transducer/step'](result, input);
    };

    return XTap;
  }();

  function _xtap(f) {
    return function (xf) {
      return new XTap(f, xf);
    };
  }

  /**
   * Runs the given function with the supplied object, then returns the object.
   *
   * Acts as a transducer if a transformer is given as second parameter.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Function
   * @sig (a -> *) -> a -> a
   * @param {Function} fn The function to call with `x`. The return value of `fn` will be thrown away.
   * @param {*} x
   * @return {*} `x`.
   * @example
   *
   *      const sayX = x => console.log('x is ' + x);
   *      R.tap(sayX, 100); //=> 100
   *      // logs 'x is 100'
   * @symb R.tap(f, a) = (f(a), a)
   */

  var tap =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable([], _xtap, function tap(fn, x) {
    fn(x);
    return x;
  }));

  function _isRegExp(x) {
    return Object.prototype.toString.call(x) === '[object RegExp]';
  }

  /**
   * Determines whether a given string matches a given regular expression.
   *
   * @func
   * @memberOf R
   * @since v0.12.0
   * @category String
   * @sig RegExp -> String -> Boolean
   * @param {RegExp} pattern
   * @param {String} str
   * @return {Boolean}
   * @see R.match
   * @example
   *
   *      R.test(/^x/, 'xyz'); //=> true
   *      R.test(/^y/, 'xyz'); //=> false
   */

  var test =
  /*#__PURE__*/
  _curry2(function test(pattern, str) {
    if (!_isRegExp(pattern)) {
      throw new TypeError('‘test’ requires a value of type RegExp as its first argument; received ' + toString(pattern));
    }

    return _cloneRegExp(pattern).test(str);
  });

  /**
   * Returns the result of applying the onSuccess function to the value inside
   * a successfully resolved promise. This is useful for working with promises
   * inside function compositions.
   *
   * @func
   * @memberOf R
   * @since v0.27.1
   * @category Function
   * @sig (a -> b) -> (Promise e a) -> (Promise e b)
   * @sig (a -> (Promise e b)) -> (Promise e a) -> (Promise e b)
   * @param {Function} onSuccess The function to apply. Can return a value or a promise of a value.
   * @param {Promise} p
   * @return {Promise} The result of calling `p.then(onSuccess)`
   * @see R.otherwise
   * @example
   *
   *      const makeQuery = email => ({ query: { email }});
   *      const fetchMember = request =>
   *        Promise.resolve({ firstName: 'Bob', lastName: 'Loblaw', id: 42 });
   *
   *      //getMemberName :: String -> Promise ({ firstName, lastName })
   *      const getMemberName = R.pipe(
   *        makeQuery,
   *        fetchMember,
   *        R.andThen(R.pick(['firstName', 'lastName']))
   *      );
   *
   *      getMemberName('bob@gmail.com').then(console.log);
   */

  var andThen =
  /*#__PURE__*/
  _curry2(function andThen(f, p) {
    _assertPromise('andThen', p);

    return p.then(f);
  });

  /**
   * The lower case version of a string.
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category String
   * @sig String -> String
   * @param {String} str The string to lower case.
   * @return {String} The lower case version of `str`.
   * @see R.toUpper
   * @example
   *
   *      R.toLower('XYZ'); //=> 'xyz'
   */

  var toLower =
  /*#__PURE__*/
  invoker(0, 'toLowerCase');

  /**
   * Converts an object into an array of key, value arrays. Only the object's
   * own properties are used.
   * Note that the order of the output array is not guaranteed to be consistent
   * across different JS platforms.
   *
   * @func
   * @memberOf R
   * @since v0.4.0
   * @category Object
   * @sig {String: *} -> [[String,*]]
   * @param {Object} obj The object to extract from
   * @return {Array} An array of key, value arrays from the object's own properties.
   * @see R.fromPairs, R.keys, R.values
   * @example
   *
   *      R.toPairs({a: 1, b: 2, c: 3}); //=> [['a', 1], ['b', 2], ['c', 3]]
   */

  var toPairs =
  /*#__PURE__*/
  _curry1(function toPairs(obj) {
    var pairs = [];

    for (var prop in obj) {
      if (_has(prop, obj)) {
        pairs[pairs.length] = [prop, obj[prop]];
      }
    }

    return pairs;
  });

  /**
   * Converts an object into an array of key, value arrays. The object's own
   * properties and prototype properties are used. Note that the order of the
   * output array is not guaranteed to be consistent across different JS
   * platforms.
   *
   * @func
   * @memberOf R
   * @since v0.4.0
   * @category Object
   * @sig {String: *} -> [[String,*]]
   * @param {Object} obj The object to extract from
   * @return {Array} An array of key, value arrays from the object's own
   *         and prototype properties.
   * @example
   *
   *      const F = function() { this.x = 'X'; };
   *      F.prototype.y = 'Y';
   *      const f = new F();
   *      R.toPairsIn(f); //=> [['x','X'], ['y','Y']]
   */

  var toPairsIn =
  /*#__PURE__*/
  _curry1(function toPairsIn(obj) {
    var pairs = [];

    for (var prop in obj) {
      pairs[pairs.length] = [prop, obj[prop]];
    }

    return pairs;
  });

  /**
   * The upper case version of a string.
   *
   * @func
   * @memberOf R
   * @since v0.9.0
   * @category String
   * @sig String -> String
   * @param {String} str The string to upper case.
   * @return {String} The upper case version of `str`.
   * @see R.toLower
   * @example
   *
   *      R.toUpper('abc'); //=> 'ABC'
   */

  var toUpper =
  /*#__PURE__*/
  invoker(0, 'toUpperCase');

  /**
   * Initializes a transducer using supplied iterator function. Returns a single
   * item by iterating through the list, successively calling the transformed
   * iterator function and passing it an accumulator value and the current value
   * from the array, and then passing the result to the next call.
   *
   * The iterator function receives two values: *(acc, value)*. It will be
   * wrapped as a transformer to initialize the transducer. A transformer can be
   * passed directly in place of an iterator function. In both cases, iteration
   * may be stopped early with the [`R.reduced`](#reduced) function.
   *
   * A transducer is a function that accepts a transformer and returns a
   * transformer and can be composed directly.
   *
   * A transformer is an object that provides a 2-arity reducing iterator
   * function, step, 0-arity initial value function, init, and 1-arity result
   * extraction function, result. The step function is used as the iterator
   * function in reduce. The result function is used to convert the final
   * accumulator into the return type and in most cases is
   * [`R.identity`](#identity). The init function can be used to provide an
   * initial accumulator, but is ignored by transduce.
   *
   * The iteration is performed with [`R.reduce`](#reduce) after initializing the transducer.
   *
   * @func
   * @memberOf R
   * @since v0.12.0
   * @category List
   * @sig (c -> c) -> ((a, b) -> a) -> a -> [b] -> a
   * @param {Function} xf The transducer function. Receives a transformer and returns a transformer.
   * @param {Function} fn The iterator function. Receives two values, the accumulator and the
   *        current element from the array. Wrapped as transformer, if necessary, and used to
   *        initialize the transducer
   * @param {*} acc The initial accumulator value.
   * @param {Array} list The list to iterate over.
   * @return {*} The final, accumulated value.
   * @see R.reduce, R.reduced, R.into
   * @example
   *
   *      const numbers = [1, 2, 3, 4];
   *      const transducer = R.compose(R.map(R.add(1)), R.take(2));
   *      R.transduce(transducer, R.flip(R.append), [], numbers); //=> [2, 3]
   *
   *      const isOdd = (x) => x % 2 !== 0;
   *      const firstOddTransducer = R.compose(R.filter(isOdd), R.take(1));
   *      R.transduce(firstOddTransducer, R.flip(R.append), [], R.range(0, 100)); //=> [1]
   */

  var transduce =
  /*#__PURE__*/
  curryN(4, function transduce(xf, fn, acc, list) {
    return _xReduce(xf(typeof fn === 'function' ? _xwrap(fn) : fn), acc, list);
  });

  /**
   * Transposes the rows and columns of a 2D list.
   * When passed a list of `n` lists of length `x`,
   * returns a list of `x` lists of length `n`.
   *
   *
   * @func
   * @memberOf R
   * @since v0.19.0
   * @category List
   * @sig [[a]] -> [[a]]
   * @param {Array} list A 2D list
   * @return {Array} A 2D list
   * @example
   *
   *      R.transpose([[1, 'a'], [2, 'b'], [3, 'c']]) //=> [[1, 2, 3], ['a', 'b', 'c']]
   *      R.transpose([[1, 2, 3], ['a', 'b', 'c']]) //=> [[1, 'a'], [2, 'b'], [3, 'c']]
   *
   *      // If some of the rows are shorter than the following rows, their elements are skipped:
   *      R.transpose([[10, 11], [20], [], [30, 31, 32]]) //=> [[10, 20, 30], [11, 31], [32]]
   * @symb R.transpose([[a], [b], [c]]) = [a, b, c]
   * @symb R.transpose([[a, b], [c, d]]) = [[a, c], [b, d]]
   * @symb R.transpose([[a, b], [c]]) = [[a, c], [b]]
   */

  var transpose =
  /*#__PURE__*/
  _curry1(function transpose(outerlist) {
    var i = 0;
    var result = [];

    while (i < outerlist.length) {
      var innerlist = outerlist[i];
      var j = 0;

      while (j < innerlist.length) {
        if (typeof result[j] === 'undefined') {
          result[j] = [];
        }

        result[j].push(innerlist[j]);
        j += 1;
      }

      i += 1;
    }

    return result;
  });

  /**
   * Maps an [Applicative](https://github.com/fantasyland/fantasy-land#applicative)-returning
   * function over a [Traversable](https://github.com/fantasyland/fantasy-land#traversable),
   * then uses [`sequence`](#sequence) to transform the resulting Traversable of Applicative
   * into an Applicative of Traversable.
   *
   * Dispatches to the `traverse` method of the third argument, if present.
   *
   * @func
   * @memberOf R
   * @since v0.19.0
   * @category List
   * @sig fantasy-land/of :: TypeRep f => f ~> a -> f a
   * @sig (Applicative f, Traversable t) => TypeRep f -> (a -> f b) -> t a -> f (t b)
   * @sig (Applicative f, Traversable t) => (b -> f b) -> (a -> f b) -> t a -> f (t b)
   * @param {Object|Function} TypeRepresentative with an `of` or `fantasy-land/of` method
   * @param {Function} f
   * @param {*} traversable
   * @return {*}
   * @see R.sequence
   * @example
   *
   *      // Returns `Maybe.Nothing` if the given divisor is `0`
   *      const safeDiv = n => d => d === 0 ? Maybe.Nothing() : Maybe.Just(n / d)
   *
   *      R.traverse(Maybe.of, safeDiv(10), [2, 4, 5]); //=> Maybe.Just([5, 2.5, 2])
   *      R.traverse(Maybe.of, safeDiv(10), [2, 0, 5]); //=> Maybe.Nothing
   *
   *      // Using a Type Representative
   *      R.traverse(Maybe, safeDiv(10), Right(4)); //=> Just(Right(2.5))
   *      R.traverse(Maybe, safeDiv(10), Right(0)); //=> Nothing
   *      R.traverse(Maybe, safeDiv(10), Left("X")); //=> Just(Left("X"))
   */

  var traverse =
  /*#__PURE__*/
  _curry3(function traverse(F, f, traversable) {
    var of = typeof F['fantasy-land/of'] === 'function' ? F['fantasy-land/of'] : typeof F.of === 'function' ? F.of : F;
    var TypeRep = {
      'fantasy-land/of': of
    };
    return typeof traversable['fantasy-land/traverse'] === 'function' ? traversable['fantasy-land/traverse'](TypeRep, f) : typeof traversable.traverse === 'function' ? traversable.traverse(TypeRep, f) : sequence(TypeRep, map(f, traversable));
  });

  var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u2000\u2001\u2002\u2003' + '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' + '\u2029\uFEFF';
  var zeroWidth = '\u200b';
  var hasProtoTrim = typeof String.prototype.trim === 'function';
  /**
   * Removes (strips) whitespace from both ends of the string.
   *
   * @func
   * @memberOf R
   * @since v0.6.0
   * @category String
   * @sig String -> String
   * @param {String} str The string to trim.
   * @return {String} Trimmed version of `str`.
   * @example
   *
   *      R.trim('   xyz  '); //=> 'xyz'
   *      R.map(R.trim, R.split(',', 'x, y, z')); //=> ['x', 'y', 'z']
   */

  var trim = !hasProtoTrim ||
  /*#__PURE__*/
  ws.trim() || !
  /*#__PURE__*/
  zeroWidth.trim() ?
  /*#__PURE__*/
  _curry1(function trim(str) {
    var beginRx = new RegExp('^[' + ws + '][' + ws + ']*');
    var endRx = new RegExp('[' + ws + '][' + ws + ']*$');
    return str.replace(beginRx, '').replace(endRx, '');
  }) :
  /*#__PURE__*/
  _curry1(function trim(str) {
    return str.trim();
  });

  /**
   * `tryCatch` takes two functions, a `tryer` and a `catcher`. The returned
   * function evaluates the `tryer`; if it does not throw, it simply returns the
   * result. If the `tryer` *does* throw, the returned function evaluates the
   * `catcher` function and returns its result. Note that for effective
   * composition with this function, both the `tryer` and `catcher` functions
   * must return the same type of results.
   *
   * @func
   * @memberOf R
   * @since v0.20.0
   * @category Function
   * @sig (...x -> a) -> ((e, ...x) -> a) -> (...x -> a)
   * @param {Function} tryer The function that may throw.
   * @param {Function} catcher The function that will be evaluated if `tryer` throws.
   * @return {Function} A new function that will catch exceptions and send them to the catcher.
   * @example
   *
   *      R.tryCatch(R.prop('x'), R.F)({x: true}); //=> true
   *      R.tryCatch(() => { throw 'foo'}, R.always('caught'))('bar') // =>
   *      'caught'
   *      R.tryCatch(R.times(R.identity), R.always([]))('s') // => []
   *      R.tryCatch(() => { throw 'this is not a valid value'}, (err, value)=>({error : err,  value }))('bar') // => {'error': 'this is not a valid value', 'value': 'bar'}
   */

  var tryCatch =
  /*#__PURE__*/
  _curry2(function _tryCatch(tryer, catcher) {
    return _arity(tryer.length, function () {
      try {
        return tryer.apply(this, arguments);
      } catch (e) {
        return catcher.apply(this, _concat([e], arguments));
      }
    });
  });

  /**
   * Takes a function `fn`, which takes a single array argument, and returns a
   * function which:
   *
   *   - takes any number of positional arguments;
   *   - passes these arguments to `fn` as an array; and
   *   - returns the result.
   *
   * In other words, `R.unapply` derives a variadic function from a function which
   * takes an array. `R.unapply` is the inverse of [`R.apply`](#apply).
   *
   * @func
   * @memberOf R
   * @since v0.8.0
   * @category Function
   * @sig ([*...] -> a) -> (*... -> a)
   * @param {Function} fn
   * @return {Function}
   * @see R.apply
   * @example
   *
   *      R.unapply(JSON.stringify)(1, 2, 3); //=> '[1,2,3]'
   * @symb R.unapply(f)(a, b) = f([a, b])
   */

  var unapply =
  /*#__PURE__*/
  _curry1(function unapply(fn) {
    return function () {
      return fn(Array.prototype.slice.call(arguments, 0));
    };
  });

  /**
   * Wraps a function of any arity (including nullary) in a function that accepts
   * exactly 1 parameter. Any extraneous parameters will not be passed to the
   * supplied function.
   *
   * @func
   * @memberOf R
   * @since v0.2.0
   * @category Function
   * @sig (a -> b -> c -> ... -> z) -> (a -> z)
   * @param {Function} fn The function to wrap.
   * @return {Function} A new function wrapping `fn`. The new function is guaranteed to be of
   *         arity 1.
   * @see R.binary, R.nAry
   * @example
   *
   *      const takesTwoArgs = function(a, b) {
   *        return [a, b];
   *      };
   *      takesTwoArgs.length; //=> 2
   *      takesTwoArgs(1, 2); //=> [1, 2]
   *
   *      const takesOneArg = R.unary(takesTwoArgs);
   *      takesOneArg.length; //=> 1
   *      // Only 1 argument is passed to the wrapped function
   *      takesOneArg(1, 2); //=> [1, undefined]
   * @symb R.unary(f)(a, b, c) = f(a)
   */

  var unary =
  /*#__PURE__*/
  _curry1(function unary(fn) {
    return nAry(1, fn);
  });

  /**
   * Returns a function of arity `n` from a (manually) curried function.
   * Note that, the returned function is actually a ramda style
   * curryied function, which can accept one or more arguments in each
   * function calling.
   *
   * @func
   * @memberOf R
   * @since v0.14.0
   * @category Function
   * @sig Number -> (a -> b -> c ... -> z) -> ((a -> b -> c ...) -> z)
   * @param {Number} length The arity for the returned function.
   * @param {Function} fn The function to uncurry.
   * @return {Function} A new function.
   * @see R.curry, R.curryN
   * @example
   *
   *      const addFour = a => b => c => d => a + b + c + d;
   *
   *      const uncurriedAddFour = R.uncurryN(4, addFour);
   *      uncurriedAddFour(1, 2, 3, 4); //=> 10
   */

  var uncurryN =
  /*#__PURE__*/
  _curry2(function uncurryN(depth, fn) {
    return curryN(depth, function () {
      var currentDepth = 1;
      var value = fn;
      var idx = 0;
      var endIdx;

      while (currentDepth <= depth && typeof value === 'function') {
        endIdx = currentDepth === depth ? arguments.length : idx + value.length;
        value = value.apply(this, Array.prototype.slice.call(arguments, idx, endIdx));
        currentDepth += 1;
        idx = endIdx;
      }

      return value;
    });
  });

  /**
   * Builds a list from a seed value. Accepts an iterator function, which returns
   * either false to stop iteration or an array of length 2 containing the value
   * to add to the resulting list and the seed to be used in the next call to the
   * iterator function.
   *
   * The iterator function receives one argument: *(seed)*.
   *
   * @func
   * @memberOf R
   * @since v0.10.0
   * @category List
   * @sig (a -> [b]) -> * -> [b]
   * @param {Function} fn The iterator function. receives one argument, `seed`, and returns
   *        either false to quit iteration or an array of length two to proceed. The element
   *        at index 0 of this array will be added to the resulting array, and the element
   *        at index 1 will be passed to the next call to `fn`.
   * @param {*} seed The seed value.
   * @return {Array} The final list.
   * @example
   *
   *      const f = n => n > 50 ? false : [-n, n + 10];
   *      R.unfold(f, 10); //=> [-10, -20, -30, -40, -50]
   * @symb R.unfold(f, x) = [f(x)[0], f(f(x)[1])[0], f(f(f(x)[1])[1])[0], ...]
   */

  var unfold =
  /*#__PURE__*/
  _curry2(function unfold(fn, seed) {
    var pair = fn(seed);
    var result = [];

    while (pair && pair.length) {
      result[result.length] = pair[0];
      pair = fn(pair[1]);
    }

    return result;
  });

  /**
   * Combines two lists into a set (i.e. no duplicates) composed of the elements
   * of each list.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Relation
   * @sig [*] -> [*] -> [*]
   * @param {Array} as The first list.
   * @param {Array} bs The second list.
   * @return {Array} The first and second lists concatenated, with
   *         duplicates removed.
   * @example
   *
   *      R.union([1, 2, 3], [2, 3, 4]); //=> [1, 2, 3, 4]
   */

  var union =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  compose(uniq, _concat));

  var XUniqWith =
  /*#__PURE__*/
  function () {
    function XUniqWith(pred, xf) {
      this.xf = xf;
      this.pred = pred;
      this.items = [];
    }

    XUniqWith.prototype['@@transducer/init'] = _xfBase.init;
    XUniqWith.prototype['@@transducer/result'] = _xfBase.result;

    XUniqWith.prototype['@@transducer/step'] = function (result, input) {
      if (_includesWith(this.pred, input, this.items)) {
        return result;
      } else {
        this.items.push(input);
        return this.xf['@@transducer/step'](result, input);
      }
    };

    return XUniqWith;
  }();

  function _xuniqWith(pred) {
    return function (xf) {
      return new XUniqWith(pred, xf);
    };
  }

  /**
   * Returns a new list containing only one copy of each element in the original
   * list, based upon the value returned by applying the supplied predicate to
   * two list elements. Prefers the first item if two items compare equal based
   * on the predicate.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.2.0
   * @category List
   * @sig ((a, a) -> Boolean) -> [a] -> [a]
   * @param {Function} pred A predicate used to test whether two items are equal.
   * @param {Array} list The array to consider.
   * @return {Array} The list of unique items.
   * @example
   *
   *      const strEq = R.eqBy(String);
   *      R.uniqWith(strEq)([1, '1', 2, 1]); //=> [1, 2]
   *      R.uniqWith(strEq)([{}, {}]);       //=> [{}]
   *      R.uniqWith(strEq)([1, '1', 1]);    //=> [1]
   *      R.uniqWith(strEq)(['1', 1, 1]);    //=> ['1']
   */

  var uniqWith =
  /*#__PURE__*/
  _curry2(
  /*#__PURE__*/
  _dispatchable([], _xuniqWith, function (pred, list) {
    var idx = 0;
    var len = list.length;
    var result = [];
    var item;

    while (idx < len) {
      item = list[idx];

      if (!_includesWith(pred, item, result)) {
        result[result.length] = item;
      }

      idx += 1;
    }

    return result;
  }));

  /**
   * Combines two lists into a set (i.e. no duplicates) composed of the elements
   * of each list. Duplication is determined according to the value returned by
   * applying the supplied predicate to two list elements. If an element exists
   * in both lists, the first element from the first list will be used.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category Relation
   * @sig ((a, a) -> Boolean) -> [*] -> [*] -> [*]
   * @param {Function} pred A predicate used to test whether two items are equal.
   * @param {Array} list1 The first list.
   * @param {Array} list2 The second list.
   * @return {Array} The first and second lists concatenated, with
   *         duplicates removed.
   * @see R.union
   * @example
   *
   *      const l1 = [{a: 1}, {a: 2}];
   *      const l2 = [{a: 1}, {a: 4}];
   *      R.unionWith(R.eqBy(R.prop('a')), l1, l2); //=> [{a: 1}, {a: 2}, {a: 4}]
   */

  var unionWith =
  /*#__PURE__*/
  _curry3(function unionWith(pred, list1, list2) {
    return uniqWith(pred, _concat(list1, list2));
  });

  /**
   * Tests the final argument by passing it to the given predicate function. If
   * the predicate is not satisfied, the function will return the result of
   * calling the `whenFalseFn` function with the same argument. If the predicate
   * is satisfied, the argument is returned as is.
   *
   * @func
   * @memberOf R
   * @since v0.18.0
   * @category Logic
   * @sig (a -> Boolean) -> (a -> b) -> a -> a | b
   * @param {Function} pred        A predicate function
   * @param {Function} whenFalseFn A function to invoke when the `pred` evaluates
   *                               to a falsy value.
   * @param {*}        x           An object to test with the `pred` function and
   *                               pass to `whenFalseFn` if necessary.
   * @return {*} Either `x` or the result of applying `x` to `whenFalseFn`.
   * @see R.ifElse, R.when, R.cond
   * @example
   *
   *      let safeInc = R.unless(R.isNil, R.inc);
   *      safeInc(null); //=> null
   *      safeInc(1); //=> 2
   */

  var unless =
  /*#__PURE__*/
  _curry3(function unless(pred, whenFalseFn, x) {
    return pred(x) ? x : whenFalseFn(x);
  });

  /**
   * Shorthand for `R.chain(R.identity)`, which removes one level of nesting from
   * any [Chain](https://github.com/fantasyland/fantasy-land#chain).
   *
   * @func
   * @memberOf R
   * @since v0.3.0
   * @category List
   * @sig Chain c => c (c a) -> c a
   * @param {*} list
   * @return {*}
   * @see R.flatten, R.chain
   * @example
   *
   *      R.unnest([1, [2], [[3]]]); //=> [1, 2, [3]]
   *      R.unnest([[1, 2], [3, 4], [5, 6]]); //=> [1, 2, 3, 4, 5, 6]
   */

  var unnest =
  /*#__PURE__*/
  chain(_identity);

  /**
   * Takes a predicate, a transformation function, and an initial value,
   * and returns a value of the same type as the initial value.
   * It does so by applying the transformation until the predicate is satisfied,
   * at which point it returns the satisfactory value.
   *
   * @func
   * @memberOf R
   * @since v0.20.0
   * @category Logic
   * @sig (a -> Boolean) -> (a -> a) -> a -> a
   * @param {Function} pred A predicate function
   * @param {Function} fn The iterator function
   * @param {*} init Initial value
   * @return {*} Final value that satisfies predicate
   * @example
   *
   *      R.until(R.gt(R.__, 100), R.multiply(2))(1) // => 128
   */

  var until =
  /*#__PURE__*/
  _curry3(function until(pred, fn, init) {
    var val = init;

    while (!pred(val)) {
      val = fn(val);
    }

    return val;
  });

  /**
   *
   * Deconstructs an array field from the input documents to output a document for each element.
   * Each output document is the input document with the value of the array field replaced by the element.
   *
   * @func
   * @memberOf R
   * @since v0.28.0
   * @category Object
   * @sig String -> {k: [v]} -> [{k: v}]
   * @param {String} key The key to determine which property of the object should be unwind
   * @param {Object} object The object containing list under property named as key which is to unwind
   * @return {List} A new list of object containing the value of input key having list replaced by each element in the object.
   * @example
   *
   * R.unwind('hobbies', {
   *   name: 'alice',
   *   hobbies: ['Golf', 'Hacking'],
   *   colors: ['red', 'green'],
   * });
   * // [
   * //   { name: 'alice', hobbies: 'Golf', colors: ['red', 'green'] },
   * //   { name: 'alice', hobbies: 'Hacking', colors: ['red', 'green'] }
   * // ]
   */

  var unwind =
  /*#__PURE__*/
  _curry2(function (key, object) {
    // If key is not in object or key is not as a list in object
    if (!(key in object && _isArray(object[key]))) {
      return [object];
    } // Map over object[key] which is a list and assoc each element with key


    return _map(function (item) {
      return _assoc(key, item, object);
    }, object[key]);
  });

  /**
   * Returns a list of all the properties, including prototype properties, of the
   * supplied object.
   * Note that the order of the output array is not guaranteed to be consistent
   * across different JS platforms.
   *
   * @func
   * @memberOf R
   * @since v0.2.0
   * @category Object
   * @sig {k: v} -> [v]
   * @param {Object} obj The object to extract values from
   * @return {Array} An array of the values of the object's own and prototype properties.
   * @see R.values, R.keysIn
   * @example
   *
   *      const F = function() { this.x = 'X'; };
   *      F.prototype.y = 'Y';
   *      const f = new F();
   *      R.valuesIn(f); //=> ['X', 'Y']
   */

  var valuesIn =
  /*#__PURE__*/
  _curry1(function valuesIn(obj) {
    var prop;
    var vs = [];

    for (prop in obj) {
      vs[vs.length] = obj[prop];
    }

    return vs;
  });

  var Const = function (x) {
    return {
      value: x,
      'fantasy-land/map': function () {
        return this;
      }
    };
  };
  /**
   * Returns a "view" of the given data structure, determined by the given lens.
   * The lens's focus determines which portion of the data structure is visible.
   *
   * @func
   * @memberOf R
   * @since v0.16.0
   * @category Object
   * @typedefn Lens s a = Functor f => (a -> f a) -> s -> f s
   * @sig Lens s a -> s -> a
   * @param {Lens} lens
   * @param {*} x
   * @return {*}
   * @see R.set, R.over, R.lens, R.lensIndex, R.lensProp, R.lensPath
   * @example
   *
   *      const xLens = R.lensProp('x');
   *
   *      R.view(xLens, {x: 1, y: 2});  //=> 1
   *      R.view(xLens, {x: 4, y: 2});  //=> 4
   */


  var view =
  /*#__PURE__*/
  _curry2(function view(lens, x) {
    // Using `Const` effectively ignores the setter function of the `lens`,
    // leaving the value returned by the getter function unmodified.
    return lens(Const)(x).value;
  });

  /**
   * Tests the final argument by passing it to the given predicate function. If
   * the predicate is satisfied, the function will return the result of calling
   * the `whenTrueFn` function with the same argument. If the predicate is not
   * satisfied, the argument is returned as is.
   *
   * @func
   * @memberOf R
   * @since v0.18.0
   * @category Logic
   * @sig (a -> Boolean) -> (a -> b) -> a -> a | b
   * @param {Function} pred       A predicate function
   * @param {Function} whenTrueFn A function to invoke when the `condition`
   *                              evaluates to a truthy value.
   * @param {*}        x          An object to test with the `pred` function and
   *                              pass to `whenTrueFn` if necessary.
   * @return {*} Either `x` or the result of applying `x` to `whenTrueFn`.
   * @see R.ifElse, R.unless, R.cond
   * @example
   *
   *      // truncate :: String -> String
   *      const truncate = R.when(
   *        R.propSatisfies(R.gt(R.__, 10), 'length'),
   *        R.pipe(R.take(10), R.append('…'), R.join(''))
   *      );
   *      truncate('12345');         //=> '12345'
   *      truncate('0123456789ABC'); //=> '0123456789…'
   */

  var when =
  /*#__PURE__*/
  _curry3(function when(pred, whenTrueFn, x) {
    return pred(x) ? whenTrueFn(x) : x;
  });

  /**
   * Takes a spec object and a test object; returns true if the test satisfies
   * the spec. Each of the spec's own properties must be a predicate function.
   * Each predicate is applied to the value of the corresponding property of the
   * test object. `where` returns true if all the predicates return true, false
   * otherwise.
   *
   * `where` is well suited to declaratively expressing constraints for other
   * functions such as [`filter`](#filter) and [`find`](#find).
   *
   * @func
   * @memberOf R
   * @since v0.1.1
   * @category Object
   * @sig {String: (* -> Boolean)} -> {String: *} -> Boolean
   * @param {Object} spec
   * @param {Object} testObj
   * @return {Boolean}
   * @see R.propSatisfies, R.whereEq
   * @example
   *
   *      // pred :: Object -> Boolean
   *      const pred = R.where({
   *        a: R.equals('foo'),
   *        b: R.complement(R.equals('bar')),
   *        x: R.gt(R.__, 10),
   *        y: R.lt(R.__, 20)
   *      });
   *
   *      pred({a: 'foo', b: 'xxx', x: 11, y: 19}); //=> true
   *      pred({a: 'xxx', b: 'xxx', x: 11, y: 19}); //=> false
   *      pred({a: 'foo', b: 'bar', x: 11, y: 19}); //=> false
   *      pred({a: 'foo', b: 'xxx', x: 10, y: 19}); //=> false
   *      pred({a: 'foo', b: 'xxx', x: 11, y: 20}); //=> false
   */

  var where =
  /*#__PURE__*/
  _curry2(function where(spec, testObj) {
    for (var prop in spec) {
      if (_has(prop, spec) && !spec[prop](testObj[prop])) {
        return false;
      }
    }

    return true;
  });

  /**
   * Takes a spec object and a test object; each of the spec's own properties must be a predicate function.
   * Each predicate is applied to the value of the corresponding property of the
   * test object. `whereAny` returns true if at least one of the predicates return true,
   * false otherwise.
   *
   * `whereAny` is well suited to declaratively expressing constraints for other
   * functions such as [`filter`](#filter) and [`find`](#find).
   *
   * @func
   * @memberOf R
   * @since v0.28.0
   * @category Object
   * @sig {String: (* -> Boolean)} -> {String: *} -> Boolean
   * @param {Object} spec
   * @param {Object} testObj
   * @return {Boolean}
   * @see R.propSatisfies, R.where
   * @example
   *
   *      // pred :: Object -> Boolean
   *      const pred = R.whereAny({
   *        a: R.equals('foo'),
   *        b: R.complement(R.equals('xxx')),
   *        x: R.gt(R.__, 10),
   *        y: R.lt(R.__, 20)
   *      });
   *
   *      pred({a: 'foo', b: 'xxx', x: 8, y: 34}); //=> true
   *      pred({a: 'xxx', b: 'xxx', x: 9, y: 21}); //=> false
   *      pred({a: 'bar', b: 'xxx', x: 10, y: 20}); //=> false
   *      pred({a: 'foo', b: 'bar', x: 10, y: 20}); //=> true
   *      pred({a: 'foo', b: 'xxx', x: 11, y: 20}); //=> true
   */

  var whereAny =
  /*#__PURE__*/
  _curry2(function whereAny(spec, testObj) {
    for (var prop in spec) {
      if (_has(prop, spec) && spec[prop](testObj[prop])) {
        return true;
      }
    }

    return false;
  });

  /**
   * Takes a spec object and a test object; returns true if the test satisfies
   * the spec, false otherwise. An object satisfies the spec if, for each of the
   * spec's own properties, accessing that property of the object gives the same
   * value (in [`R.equals`](#equals) terms) as accessing that property of the
   * spec.
   *
   * `whereEq` is a specialization of [`where`](#where).
   *
   * @func
   * @memberOf R
   * @since v0.14.0
   * @category Object
   * @sig {String: *} -> {String: *} -> Boolean
   * @param {Object} spec
   * @param {Object} testObj
   * @return {Boolean}
   * @see R.propEq, R.where
   * @example
   *
   *      // pred :: Object -> Boolean
   *      const pred = R.whereEq({a: 1, b: 2});
   *
   *      pred({a: 1});              //=> false
   *      pred({a: 1, b: 2});        //=> true
   *      pred({a: 1, b: 2, c: 3});  //=> true
   *      pred({a: 1, b: 1});        //=> false
   */

  var whereEq =
  /*#__PURE__*/
  _curry2(function whereEq(spec, testObj) {
    return where(map(equals, spec), testObj);
  });

  /**
   * Returns a new list without values in the first argument.
   * [`R.equals`](#equals) is used to determine equality.
   *
   * Acts as a transducer if a transformer is given in list position.
   *
   * @func
   * @memberOf R
   * @since v0.19.0
   * @category List
   * @sig [a] -> [a] -> [a]
   * @param {Array} list1 The values to be removed from `list2`.
   * @param {Array} list2 The array to remove values from.
   * @return {Array} The new array without values in `list1`.
   * @see R.transduce, R.difference, R.remove
   * @example
   *
   *      R.without([1, 2], [1, 2, 1, 3, 4]); //=> [3, 4]
   */

  var without =
  /*#__PURE__*/
  _curry2(function without(xs, list) {
    var toRemove = new _Set();

    for (var i = 0; i < xs.length; i += 1) {
      toRemove.add(xs[i]);
    }

    return reject(toRemove.has.bind(toRemove), list);
  });

  /**
   * Exclusive disjunction logical operation.
   * Returns `true` if one of the arguments is truthy and the other is falsy.
   * Otherwise, it returns `false`.
   *
   * @func
   * @memberOf R
   * @since v0.27.1
   * @category Logic
   * @sig a -> b -> Boolean
   * @param {Any} a
   * @param {Any} b
   * @return {Boolean} true if one of the arguments is truthy and the other is falsy
   * @see R.or, R.and
   * @example
   *
   *      R.xor(true, true); //=> false
   *      R.xor(true, false); //=> true
   *      R.xor(false, true); //=> true
   *      R.xor(false, false); //=> false
   */

  var xor =
  /*#__PURE__*/
  _curry2(function xor(a, b) {
    return Boolean(!a ^ !b);
  });

  /**
   * Creates a new list out of the two supplied by creating each possible pair
   * from the lists.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig [a] -> [b] -> [[a,b]]
   * @param {Array} as The first list.
   * @param {Array} bs The second list.
   * @return {Array} The list made by combining each possible pair from
   *         `as` and `bs` into pairs (`[a, b]`).
   * @example
   *
   *      R.xprod([1, 2], ['a', 'b']); //=> [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]
   * @symb R.xprod([a, b], [c, d]) = [[a, c], [a, d], [b, c], [b, d]]
   */

  var xprod =
  /*#__PURE__*/
  _curry2(function xprod(a, b) {
    // = xprodWith(prepend); (takes about 3 times as long...)
    var idx = 0;
    var ilen = a.length;
    var j;
    var jlen = b.length;
    var result = [];

    while (idx < ilen) {
      j = 0;

      while (j < jlen) {
        result[result.length] = [a[idx], b[j]];
        j += 1;
      }

      idx += 1;
    }

    return result;
  });

  /**
   * Creates a new list out of the two supplied by pairing up equally-positioned
   * items from both lists. The returned list is truncated to the length of the
   * shorter of the two input lists.
   * Note: `zip` is equivalent to `zipWith(function(a, b) { return [a, b] })`.
   *
   * @func
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig [a] -> [b] -> [[a,b]]
   * @param {Array} list1 The first array to consider.
   * @param {Array} list2 The second array to consider.
   * @return {Array} The list made by pairing up same-indexed elements of `list1` and `list2`.
   * @example
   *
   *      R.zip([1, 2, 3], ['a', 'b', 'c']); //=> [[1, 'a'], [2, 'b'], [3, 'c']]
   * @symb R.zip([a, b, c], [d, e, f]) = [[a, d], [b, e], [c, f]]
   */

  var zip =
  /*#__PURE__*/
  _curry2(function zip(a, b) {
    var rv = [];
    var idx = 0;
    var len = Math.min(a.length, b.length);

    while (idx < len) {
      rv[idx] = [a[idx], b[idx]];
      idx += 1;
    }

    return rv;
  });

  /**
   * Creates a new object out of a list of keys and a list of values.
   * Key/value pairing is truncated to the length of the shorter of the two lists.
   * Note: `zipObj` is equivalent to `pipe(zip, fromPairs)`.
   *
   * @func
   * @memberOf R
   * @since v0.3.0
   * @category List
   * @sig [String] -> [*] -> {String: *}
   * @param {Array} keys The array that will be properties on the output object.
   * @param {Array} values The list of values on the output object.
   * @return {Object} The object made by pairing up same-indexed elements of `keys` and `values`.
   * @example
   *
   *      R.zipObj(['a', 'b', 'c'], [1, 2, 3]); //=> {a: 1, b: 2, c: 3}
   */

  var zipObj =
  /*#__PURE__*/
  _curry2(function zipObj(keys, values) {
    var idx = 0;
    var len = Math.min(keys.length, values.length);
    var out = {};

    while (idx < len) {
      out[keys[idx]] = values[idx];
      idx += 1;
    }

    return out;
  });

  /**
   * Creates a new list out of the two supplied by applying the function to each
   * equally-positioned pair in the lists. The returned list is truncated to the
   * length of the shorter of the two input lists.
   *
   * @function
   * @memberOf R
   * @since v0.1.0
   * @category List
   * @sig ((a, b) -> c) -> [a] -> [b] -> [c]
   * @param {Function} fn The function used to combine the two elements into one value.
   * @param {Array} list1 The first array to consider.
   * @param {Array} list2 The second array to consider.
   * @return {Array} The list made by combining same-indexed elements of `list1` and `list2`
   *         using `fn`.
   * @example
   *
   *      const f = (x, y) => {
   *        // ...
   *      };
   *      R.zipWith(f, [1, 2, 3], ['a', 'b', 'c']);
   *      //=> [f(1, 'a'), f(2, 'b'), f(3, 'c')]
   * @symb R.zipWith(fn, [a, b, c], [d, e, f]) = [fn(a, d), fn(b, e), fn(c, f)]
   */

  var zipWith =
  /*#__PURE__*/
  _curry3(function zipWith(fn, a, b) {
    var rv = [];
    var idx = 0;
    var len = Math.min(a.length, b.length);

    while (idx < len) {
      rv[idx] = fn(a[idx], b[idx]);
      idx += 1;
    }

    return rv;
  });

  /**
   * Creates a thunk out of a function. A thunk delays a calculation until
   * its result is needed, providing lazy evaluation of arguments.
   *
   * @func
   * @memberOf R
   * @since v0.26.0
   * @category Function
   * @sig ((a, b, ..., j) -> k) -> (a, b, ..., j) -> (() -> k)
   * @param {Function} fn A function to wrap in a thunk
   * @return {Function} Expects arguments for `fn` and returns a new function
   *  that, when called, applies those arguments to `fn`.
   * @see R.partial, R.partialRight
   * @example
   *
   *      R.thunkify(R.identity)(42)(); //=> 42
   *      R.thunkify((a, b) => a + b)(25, 17)(); //=> 42
   */

  var thunkify =
  /*#__PURE__*/
  _curry1(function thunkify(fn) {
    return curryN(fn.length, function createThunk() {
      var fnArgs = arguments;
      return function invokeThunk() {
        return fn.apply(this, fnArgs);
      };
    });
  });

  var ramda = /*#__PURE__*/Object.freeze({
    __proto__: null,
    F: F$1,
    T: T,
    __: __,
    add: add,
    addIndex: addIndex,
    addIndexRight: addIndexRight,
    adjust: adjust,
    all: all,
    allPass: allPass,
    always: always,
    and: and,
    andThen: andThen,
    any: any,
    anyPass: anyPass,
    ap: ap,
    aperture: aperture,
    append: append,
    apply: apply,
    applySpec: applySpec,
    applyTo: applyTo,
    ascend: ascend,
    assoc: assoc,
    assocPath: assocPath,
    binary: binary,
    bind: bind,
    both: both,
    call: call,
    chain: chain,
    clamp: clamp,
    clone: clone$1,
    collectBy: collectBy,
    comparator: comparator,
    complement: complement,
    compose: compose,
    composeWith: composeWith,
    concat: concat,
    cond: cond,
    construct: construct,
    constructN: constructN,
    converge: converge,
    count: count,
    countBy: countBy,
    curry: curry,
    curryN: curryN,
    dec: dec,
    defaultTo: defaultTo,
    descend: descend,
    difference: difference,
    differenceWith: differenceWith,
    dissoc: dissoc,
    dissocPath: dissocPath,
    divide: divide,
    drop: drop$1,
    dropLast: dropLast,
    dropLastWhile: dropLastWhile,
    dropRepeats: dropRepeats,
    dropRepeatsBy: dropRepeatsBy,
    dropRepeatsWith: dropRepeatsWith,
    dropWhile: dropWhile,
    either: either,
    empty: empty,
    endsWith: endsWith,
    eqBy: eqBy,
    eqProps: eqProps,
    equals: equals,
    evolve: evolve,
    filter: filter,
    find: find$1,
    findIndex: findIndex$1,
    findLast: findLast,
    findLastIndex: findLastIndex,
    flatten: flatten,
    flip: flip,
    forEach: forEach,
    forEachObjIndexed: forEachObjIndexed,
    fromPairs: fromPairs,
    groupBy: groupBy,
    groupWith: groupWith,
    gt: gt,
    gte: gte,
    has: has,
    hasIn: hasIn,
    hasPath: hasPath,
    head: head,
    identical: identical,
    identity: identity,
    ifElse: ifElse,
    inc: inc,
    includes: includes,
    indexBy: indexBy,
    indexOf: indexOf,
    init: init,
    innerJoin: innerJoin,
    insert: insert,
    insertAll: insertAll,
    intersection: intersection,
    intersperse: intersperse,
    into: into,
    invert: invert,
    invertObj: invertObj,
    invoker: invoker,
    is: is,
    isEmpty: isEmpty,
    isNil: isNil,
    isNotNil: isNotNil,
    join: join,
    juxt: juxt,
    keys: keys,
    keysIn: keysIn,
    last: last,
    lastIndexOf: lastIndexOf,
    length: length,
    lens: lens,
    lensIndex: lensIndex,
    lensPath: lensPath,
    lensProp: lensProp,
    lift: lift,
    liftN: liftN,
    lt: lt,
    lte: lte,
    map: map,
    mapAccum: mapAccum,
    mapAccumRight: mapAccumRight,
    mapObjIndexed: mapObjIndexed,
    match: match$1,
    mathMod: mathMod,
    max: max,
    maxBy: maxBy,
    mean: mean,
    median: median,
    memoizeWith: memoizeWith,
    mergeAll: mergeAll,
    mergeDeepLeft: mergeDeepLeft,
    mergeDeepRight: mergeDeepRight,
    mergeDeepWith: mergeDeepWith,
    mergeDeepWithKey: mergeDeepWithKey,
    mergeLeft: mergeLeft,
    mergeRight: mergeRight,
    mergeWith: mergeWith,
    mergeWithKey: mergeWithKey,
    min: min,
    minBy: minBy,
    modify: modify,
    modifyPath: modifyPath,
    modulo: modulo,
    move: move,
    multiply: multiply,
    nAry: nAry,
    negate: negate,
    none: none,
    not: not,
    nth: nth,
    nthArg: nthArg,
    o: o,
    objOf: objOf,
    of: of,
    omit: omit,
    on: on$1,
    once: once,
    or: or,
    otherwise: otherwise,
    over: over,
    pair: pair,
    partial: partial,
    partialObject: partialObject,
    partialRight: partialRight,
    partition: partition,
    path: path,
    pathEq: pathEq,
    pathOr: pathOr,
    pathSatisfies: pathSatisfies,
    paths: paths,
    pick: pick,
    pickAll: pickAll,
    pickBy: pickBy,
    pipe: pipe,
    pipeWith: pipeWith,
    pluck: pluck,
    prepend: prepend,
    product: product,
    project: project,
    promap: promap,
    prop: prop,
    propEq: propEq,
    propIs: propIs,
    propOr: propOr,
    propSatisfies: propSatisfies,
    props: props,
    range: range,
    reduce: reduce,
    reduceBy: reduceBy,
    reduceRight: reduceRight,
    reduceWhile: reduceWhile,
    reduced: reduced,
    reject: reject,
    remove: remove,
    repeat: repeat,
    replace: replace,
    reverse: reverse,
    scan: scan,
    sequence: sequence,
    set: set,
    slice: slice,
    sort: sort,
    sortBy: sortBy,
    sortWith: sortWith,
    split: split,
    splitAt: splitAt,
    splitEvery: splitEvery,
    splitWhen: splitWhen,
    splitWhenever: splitWhenever,
    startsWith: startsWith,
    subtract: subtract,
    sum: sum,
    swap: swap,
    symmetricDifference: symmetricDifference,
    symmetricDifferenceWith: symmetricDifferenceWith,
    tail: tail,
    take: take,
    takeLast: takeLast,
    takeLastWhile: takeLastWhile,
    takeWhile: takeWhile,
    tap: tap,
    test: test,
    thunkify: thunkify,
    times: times,
    toLower: toLower,
    toPairs: toPairs,
    toPairsIn: toPairsIn,
    toString: toString,
    toUpper: toUpper,
    transduce: transduce,
    transpose: transpose,
    traverse: traverse,
    trim: trim,
    tryCatch: tryCatch,
    type: type,
    unapply: unapply,
    unary: unary,
    uncurryN: uncurryN,
    unfold: unfold,
    union: union,
    unionWith: unionWith,
    uniq: uniq,
    uniqBy: uniqBy,
    uniqWith: uniqWith,
    unless: unless,
    unnest: unnest,
    until: until,
    unwind: unwind,
    update: update,
    useWith: useWith,
    values: values,
    valuesIn: valuesIn,
    view: view,
    when: when,
    where: where,
    whereAny: whereAny,
    whereEq: whereEq,
    without: without,
    xor: xor,
    xprod: xprod,
    zip: zip,
    zipObj: zipObj,
    zipWith: zipWith
  });

  function defaultFormatter(value) {
      if (value === null || value === undefined)
          return '';
      return `${value}`;
  }

  function numberFormatter(opts = {}) {
      const { separator, decimals } = opts;
      if (separator) {
          if (decimals) {
              return (value) => value.toFixed(decimals).replace('.', separator);
          }
          return (value) => `${value}`.replace('.', separator);
      }
      if (decimals) {
          return (value) => value.toFixed(decimals);
      }
      return (value) => `${value}`;
  }

  function stringFormatter(opts = {}) {
      const quote = typeof opts.quote === 'string' ? opts.quote : '"';
      const escapedQuote = typeof opts.escapedQuote === 'string'
          ? opts.escapedQuote
          : `${quote}${quote}`;
      if (!quote || quote === escapedQuote) {
          return (value) => value;
      }
      const quoteRegExp = new RegExp(quote, 'g');
      return (value) => {
          if (value.includes(quote)) {
              value = value.replace(quoteRegExp, escapedQuote);
          }
          return `${quote}${value}${quote}`;
      };
  }

  function symbolFormatter(opts = { stringFormatter: stringFormatter() }) {
      return (value) => opts.stringFormatter(value.toString().slice(7, -1));
  }

  function objectFormatter(opts = { stringFormatter: stringFormatter() }) {
      return (value) => {
          if (value === null)
              return '';
          let stringifiedValue = JSON.stringify(value);
          if (stringifiedValue === undefined)
              return '';
          if (stringifiedValue[0] === '"')
              stringifiedValue = stringifiedValue.replace(/^"(.+)"$/, '$1');
          return opts.stringFormatter(stringifiedValue);
      };
  }

  const rePropName = RegExp(
  // Match anything that isn't a dot or bracket.
  '[^.[\\]]+' +
      '|' +
      // Or match property names within brackets.
      '\\[(?:' +
      // Match a non-string expression.
      '([^"\'][^[]*)' +
      '|' +
      // Or match strings (supports escaping characters).
      '(["\'])((?:(?!\\2)[^\\\\]|\\\\.)*?)\\2' +
      ')\\]' +
      '|' +
      // Or match "" as the space between consecutive dots or empty brackets.
      '(?=(?:\\.|\\[\\])(?:\\.|\\[\\]|$))', 'g');
  function castPath(value) {
      var _a, _b, _c;
      const result = [];
      let match;
      while ((match = rePropName.exec(value))) {
          result.push((_c = (_a = match[3]) !== null && _a !== void 0 ? _a : (_b = match[1]) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : match[0]);
      }
      return result;
  }
  function getProp(obj, path, defaultValue) {
      if (path in obj) {
          const value = obj[path];
          return value === undefined ? defaultValue : value;
      }
      const processedPath = Array.isArray(path) ? path : castPath(path);
      let currentValue = obj;
      for (const key of processedPath) {
          currentValue = currentValue === null || currentValue === void 0 ? void 0 : currentValue[key];
          if (currentValue === undefined)
              return defaultValue;
      }
      return currentValue;
  }
  function flattenReducer(acc, arr) {
      try {
          // This is faster but susceptible to `RangeError: Maximum call stack size exceeded`
          Array.isArray(arr) ? acc.push(...arr) : acc.push(arr);
          return acc;
      }
      catch (err) {
          // Fallback to a slower but safer option
          return acc.concat(arr);
      }
  }
  function fastJoin(arr, separator) {
      let isFirst = true;
      return arr.reduce((acc, elem) => {
          if (elem === null || elem === undefined) {
              elem = '';
          }
          if (isFirst) {
              isFirst = false;
              return `${elem}`;
          }
          return `${acc}${separator}${elem}`;
      }, '');
  }

  var FormatterTypes;
  (function (FormatterTypes) {
      FormatterTypes["header"] = "header";
      FormatterTypes["undefined"] = "undefined";
      FormatterTypes["boolean"] = "boolean";
      FormatterTypes["number"] = "number";
      FormatterTypes["bigint"] = "bigint";
      FormatterTypes["string"] = "string";
      FormatterTypes["symbol"] = "symbol";
      FormatterTypes["function"] = "function";
      FormatterTypes["object"] = "object";
  })(FormatterTypes || (FormatterTypes = {}));
  class JSON2CSVBase {
      constructor(opts) {
          this.opts = this.preprocessOpts(opts);
      }
      /**
       * Check passing opts and set defaults.
       *
       * @param {Json2CsvOptions} opts Options object containing fields,
       * delimiter, default value, header, etc.
       */
      preprocessOpts(opts) {
          const processedOpts = Object.assign({}, opts);
          if (processedOpts.fields) {
              processedOpts.fields = this.preprocessFieldsInfo(processedOpts.fields, processedOpts.defaultValue);
          }
          processedOpts.transforms = processedOpts.transforms || [];
          const stringFormatter$1 = (processedOpts.formatters && processedOpts.formatters['string']) ||
              stringFormatter();
          const objectFormatter$1 = objectFormatter({ stringFormatter: stringFormatter$1 });
          const defaultFormatters = {
              header: stringFormatter$1,
              undefined: defaultFormatter,
              boolean: defaultFormatter,
              number: numberFormatter(),
              bigint: defaultFormatter,
              string: stringFormatter$1,
              symbol: symbolFormatter({ stringFormatter: stringFormatter$1 }),
              function: objectFormatter$1,
              object: objectFormatter$1,
          };
          processedOpts.formatters = Object.assign(Object.assign({}, defaultFormatters), processedOpts.formatters);
          processedOpts.delimiter = processedOpts.delimiter || ',';
          processedOpts.eol = processedOpts.eol || '\n';
          processedOpts.header = processedOpts.header !== false;
          processedOpts.includeEmptyRows = processedOpts.includeEmptyRows || false;
          processedOpts.withBOM = processedOpts.withBOM || false;
          return processedOpts;
      }
      /**
       * Check and normalize the fields configuration.
       *
       * @param {(string|object)[]} fields Fields configuration provided by the user
       * or inferred from the data
       * @returns {object[]} preprocessed FieldsInfo array
       */
      preprocessFieldsInfo(fields, globalDefaultValue) {
          return fields.map((fieldInfo) => {
              if (typeof fieldInfo === 'string') {
                  return {
                      label: fieldInfo,
                      value: (row) => getProp(row, fieldInfo, globalDefaultValue),
                  };
              }
              if (typeof fieldInfo === 'object') {
                  const defaultValue = 'default' in fieldInfo ? fieldInfo.default : globalDefaultValue;
                  if (typeof fieldInfo.value === 'string') {
                      const fieldPath = fieldInfo.value;
                      return {
                          label: fieldInfo.label || fieldInfo.value,
                          value: (row) => getProp(row, fieldPath, defaultValue),
                      };
                  }
                  if (typeof fieldInfo.value === 'function') {
                      const label = fieldInfo.label || fieldInfo.value.name || '';
                      const field = { label, default: defaultValue };
                      const valueGetter = fieldInfo.value;
                      return {
                          label,
                          value(row) {
                              const value = valueGetter(row, field);
                              return value === undefined ? defaultValue : value;
                          },
                      };
                  }
              }
              throw new Error('Invalid field info option. ' + JSON.stringify(fieldInfo));
          });
      }
      /**
       * Create the title row with all the provided fields as column headings
       *
       * @returns {String} titles as a string
       */
      getHeader() {
          return fastJoin(this.opts.fields.map((fieldInfo) => this.opts.formatters.header(fieldInfo.label)), this.opts.delimiter);
      }
      /**
       * Preprocess each object according to the given transforms (unwind, flatten, etc.).
       * @param {Object} row JSON object to be converted in a CSV row
       */
      preprocessRow(row) {
          return this.opts.transforms.reduce((rows, transform) => rows.map((row) => transform(row)).reduce(flattenReducer, []), [row]);
      }
      /**
       * Create the content of a specific CSV row
       *
       * @param {Object} row JSON object to be converted in a CSV row
       * @returns {String} CSV string (row)
       */
      processRow(row) {
          if (!row) {
              return undefined;
          }
          const processedRow = this.opts.fields.map((fieldInfo) => this.processCell(row, fieldInfo));
          if (!this.opts.includeEmptyRows &&
              processedRow.every((field) => field === '')) {
              return undefined;
          }
          return fastJoin(processedRow, this.opts.delimiter);
      }
      /**
       * Create the content of a specfic CSV row cell
       *
       * @param {Object} row JSON object representing the  CSV row that the cell belongs to
       * @param {FieldInfo} fieldInfo Details of the field to process to be a CSV cell
       * @returns {String} CSV string (cell)
       */
      processCell(row, fieldInfo) {
          return this.processValue(fieldInfo.value(row));
      }
      /**
       * Create the content of a specfic CSV row cell
       *
       * @param {T} value Value to be included in a CSV cell
       * @returns {String} Value stringified and processed
       */
      processValue(value) {
          const formatter = this.opts.formatters[typeof value];
          return formatter(value);
      }
  }

  class JSON2CSVParser extends JSON2CSVBase {
      constructor(opts) {
          super(opts);
      }
      /**
       * Main function that converts json to csv.
       *
       * @param {Array|Object} data Array of JSON objects to be converted to CSV
       * @returns {String} The CSV formated data as a string
       */
      parse(data) {
          const preprocessedData = this.preprocessData(data);
          this.opts.fields =
              this.opts.fields ||
                  this.preprocessFieldsInfo(preprocessedData.reduce((fields, item) => {
                      Object.keys(item).forEach((field) => {
                          if (!fields.includes(field)) {
                              fields.push(field);
                          }
                      });
                      return fields;
                  }, []), this.opts.defaultValue);
          const header = this.opts.header ? this.getHeader() : '';
          const rows = this.processData(preprocessedData);
          const csv = (this.opts.withBOM ? '\ufeff' : '') +
              header +
              (header && rows ? this.opts.eol : '') +
              rows;
          return csv;
      }
      /**
       * Preprocess the data according to the give opts (unwind, flatten, etc.)
        and calculate the fields and field names if they are not provided.
       *
       * @param {Array|Object} data Array or object to be converted to CSV
       */
      preprocessData(data) {
          const processedData = Array.isArray(data) ? data : [data];
          if (!this.opts.fields) {
              if (data === undefined || data === null || processedData.length === 0) {
                  throw new Error('Data should not be empty or the "fields" option should be included');
              }
              if (typeof processedData[0] !== 'object') {
                  throw new Error('Data items should be objects or the "fields" option should be included');
              }
          }
          if (this.opts.transforms.length === 0)
              return processedData;
          return processedData
              .map((row) => this.preprocessRow(row))
              .reduce(flattenReducer, []);
      }
      /**
       * Create the content row by row below the header
       *
       * @param {Array} data Array of JSON objects to be converted to CSV
       * @returns {String} CSV string (body)
       */
      processData(data) {
          return fastJoin(data.map((row) => this.processRow(row)).filter((row) => row), // Filter empty rows
          this.opts.eol);
      }
  }

  var charset;
  (function (charset) {
      charset[charset["BACKSPACE"] = 8] = "BACKSPACE";
      charset[charset["FORM_FEED"] = 12] = "FORM_FEED";
      charset[charset["NEWLINE"] = 10] = "NEWLINE";
      charset[charset["CARRIAGE_RETURN"] = 13] = "CARRIAGE_RETURN";
      charset[charset["TAB"] = 9] = "TAB";
      charset[charset["SPACE"] = 32] = "SPACE";
      charset[charset["EXCLAMATION_MARK"] = 33] = "EXCLAMATION_MARK";
      charset[charset["QUOTATION_MARK"] = 34] = "QUOTATION_MARK";
      charset[charset["NUMBER_SIGN"] = 35] = "NUMBER_SIGN";
      charset[charset["DOLLAR_SIGN"] = 36] = "DOLLAR_SIGN";
      charset[charset["PERCENT_SIGN"] = 37] = "PERCENT_SIGN";
      charset[charset["AMPERSAND"] = 38] = "AMPERSAND";
      charset[charset["APOSTROPHE"] = 39] = "APOSTROPHE";
      charset[charset["LEFT_PARENTHESIS"] = 40] = "LEFT_PARENTHESIS";
      charset[charset["RIGHT_PARENTHESIS"] = 41] = "RIGHT_PARENTHESIS";
      charset[charset["ASTERISK"] = 42] = "ASTERISK";
      charset[charset["PLUS_SIGN"] = 43] = "PLUS_SIGN";
      charset[charset["COMMA"] = 44] = "COMMA";
      charset[charset["HYPHEN_MINUS"] = 45] = "HYPHEN_MINUS";
      charset[charset["FULL_STOP"] = 46] = "FULL_STOP";
      charset[charset["SOLIDUS"] = 47] = "SOLIDUS";
      charset[charset["DIGIT_ZERO"] = 48] = "DIGIT_ZERO";
      charset[charset["DIGIT_ONE"] = 49] = "DIGIT_ONE";
      charset[charset["DIGIT_TWO"] = 50] = "DIGIT_TWO";
      charset[charset["DIGIT_THREE"] = 51] = "DIGIT_THREE";
      charset[charset["DIGIT_FOUR"] = 52] = "DIGIT_FOUR";
      charset[charset["DIGIT_FIVE"] = 53] = "DIGIT_FIVE";
      charset[charset["DIGIT_SIX"] = 54] = "DIGIT_SIX";
      charset[charset["DIGIT_SEVEN"] = 55] = "DIGIT_SEVEN";
      charset[charset["DIGIT_EIGHT"] = 56] = "DIGIT_EIGHT";
      charset[charset["DIGIT_NINE"] = 57] = "DIGIT_NINE";
      charset[charset["COLON"] = 58] = "COLON";
      charset[charset["SEMICOLON"] = 59] = "SEMICOLON";
      charset[charset["LESS_THAN_SIGN"] = 60] = "LESS_THAN_SIGN";
      charset[charset["EQUALS_SIGN"] = 61] = "EQUALS_SIGN";
      charset[charset["GREATER_THAN_SIGN"] = 62] = "GREATER_THAN_SIGN";
      charset[charset["QUESTION_MARK"] = 63] = "QUESTION_MARK";
      charset[charset["COMMERCIAL_AT"] = 64] = "COMMERCIAL_AT";
      charset[charset["LATIN_CAPITAL_LETTER_A"] = 65] = "LATIN_CAPITAL_LETTER_A";
      charset[charset["LATIN_CAPITAL_LETTER_B"] = 66] = "LATIN_CAPITAL_LETTER_B";
      charset[charset["LATIN_CAPITAL_LETTER_C"] = 67] = "LATIN_CAPITAL_LETTER_C";
      charset[charset["LATIN_CAPITAL_LETTER_D"] = 68] = "LATIN_CAPITAL_LETTER_D";
      charset[charset["LATIN_CAPITAL_LETTER_E"] = 69] = "LATIN_CAPITAL_LETTER_E";
      charset[charset["LATIN_CAPITAL_LETTER_F"] = 70] = "LATIN_CAPITAL_LETTER_F";
      charset[charset["LATIN_CAPITAL_LETTER_G"] = 71] = "LATIN_CAPITAL_LETTER_G";
      charset[charset["LATIN_CAPITAL_LETTER_H"] = 72] = "LATIN_CAPITAL_LETTER_H";
      charset[charset["LATIN_CAPITAL_LETTER_I"] = 73] = "LATIN_CAPITAL_LETTER_I";
      charset[charset["LATIN_CAPITAL_LETTER_J"] = 74] = "LATIN_CAPITAL_LETTER_J";
      charset[charset["LATIN_CAPITAL_LETTER_K"] = 75] = "LATIN_CAPITAL_LETTER_K";
      charset[charset["LATIN_CAPITAL_LETTER_L"] = 76] = "LATIN_CAPITAL_LETTER_L";
      charset[charset["LATIN_CAPITAL_LETTER_M"] = 77] = "LATIN_CAPITAL_LETTER_M";
      charset[charset["LATIN_CAPITAL_LETTER_N"] = 78] = "LATIN_CAPITAL_LETTER_N";
      charset[charset["LATIN_CAPITAL_LETTER_O"] = 79] = "LATIN_CAPITAL_LETTER_O";
      charset[charset["LATIN_CAPITAL_LETTER_P"] = 80] = "LATIN_CAPITAL_LETTER_P";
      charset[charset["LATIN_CAPITAL_LETTER_Q"] = 81] = "LATIN_CAPITAL_LETTER_Q";
      charset[charset["LATIN_CAPITAL_LETTER_R"] = 82] = "LATIN_CAPITAL_LETTER_R";
      charset[charset["LATIN_CAPITAL_LETTER_S"] = 83] = "LATIN_CAPITAL_LETTER_S";
      charset[charset["LATIN_CAPITAL_LETTER_T"] = 84] = "LATIN_CAPITAL_LETTER_T";
      charset[charset["LATIN_CAPITAL_LETTER_U"] = 85] = "LATIN_CAPITAL_LETTER_U";
      charset[charset["LATIN_CAPITAL_LETTER_V"] = 86] = "LATIN_CAPITAL_LETTER_V";
      charset[charset["LATIN_CAPITAL_LETTER_W"] = 87] = "LATIN_CAPITAL_LETTER_W";
      charset[charset["LATIN_CAPITAL_LETTER_X"] = 88] = "LATIN_CAPITAL_LETTER_X";
      charset[charset["LATIN_CAPITAL_LETTER_Y"] = 89] = "LATIN_CAPITAL_LETTER_Y";
      charset[charset["LATIN_CAPITAL_LETTER_Z"] = 90] = "LATIN_CAPITAL_LETTER_Z";
      charset[charset["LEFT_SQUARE_BRACKET"] = 91] = "LEFT_SQUARE_BRACKET";
      charset[charset["REVERSE_SOLIDUS"] = 92] = "REVERSE_SOLIDUS";
      charset[charset["RIGHT_SQUARE_BRACKET"] = 93] = "RIGHT_SQUARE_BRACKET";
      charset[charset["CIRCUMFLEX_ACCENT"] = 94] = "CIRCUMFLEX_ACCENT";
      charset[charset["LOW_LINE"] = 95] = "LOW_LINE";
      charset[charset["GRAVE_ACCENT"] = 96] = "GRAVE_ACCENT";
      charset[charset["LATIN_SMALL_LETTER_A"] = 97] = "LATIN_SMALL_LETTER_A";
      charset[charset["LATIN_SMALL_LETTER_B"] = 98] = "LATIN_SMALL_LETTER_B";
      charset[charset["LATIN_SMALL_LETTER_C"] = 99] = "LATIN_SMALL_LETTER_C";
      charset[charset["LATIN_SMALL_LETTER_D"] = 100] = "LATIN_SMALL_LETTER_D";
      charset[charset["LATIN_SMALL_LETTER_E"] = 101] = "LATIN_SMALL_LETTER_E";
      charset[charset["LATIN_SMALL_LETTER_F"] = 102] = "LATIN_SMALL_LETTER_F";
      charset[charset["LATIN_SMALL_LETTER_G"] = 103] = "LATIN_SMALL_LETTER_G";
      charset[charset["LATIN_SMALL_LETTER_H"] = 104] = "LATIN_SMALL_LETTER_H";
      charset[charset["LATIN_SMALL_LETTER_I"] = 105] = "LATIN_SMALL_LETTER_I";
      charset[charset["LATIN_SMALL_LETTER_J"] = 106] = "LATIN_SMALL_LETTER_J";
      charset[charset["LATIN_SMALL_LETTER_K"] = 107] = "LATIN_SMALL_LETTER_K";
      charset[charset["LATIN_SMALL_LETTER_L"] = 108] = "LATIN_SMALL_LETTER_L";
      charset[charset["LATIN_SMALL_LETTER_M"] = 109] = "LATIN_SMALL_LETTER_M";
      charset[charset["LATIN_SMALL_LETTER_N"] = 110] = "LATIN_SMALL_LETTER_N";
      charset[charset["LATIN_SMALL_LETTER_O"] = 111] = "LATIN_SMALL_LETTER_O";
      charset[charset["LATIN_SMALL_LETTER_P"] = 112] = "LATIN_SMALL_LETTER_P";
      charset[charset["LATIN_SMALL_LETTER_Q"] = 113] = "LATIN_SMALL_LETTER_Q";
      charset[charset["LATIN_SMALL_LETTER_R"] = 114] = "LATIN_SMALL_LETTER_R";
      charset[charset["LATIN_SMALL_LETTER_S"] = 115] = "LATIN_SMALL_LETTER_S";
      charset[charset["LATIN_SMALL_LETTER_T"] = 116] = "LATIN_SMALL_LETTER_T";
      charset[charset["LATIN_SMALL_LETTER_U"] = 117] = "LATIN_SMALL_LETTER_U";
      charset[charset["LATIN_SMALL_LETTER_V"] = 118] = "LATIN_SMALL_LETTER_V";
      charset[charset["LATIN_SMALL_LETTER_W"] = 119] = "LATIN_SMALL_LETTER_W";
      charset[charset["LATIN_SMALL_LETTER_X"] = 120] = "LATIN_SMALL_LETTER_X";
      charset[charset["LATIN_SMALL_LETTER_Y"] = 121] = "LATIN_SMALL_LETTER_Y";
      charset[charset["LATIN_SMALL_LETTER_Z"] = 122] = "LATIN_SMALL_LETTER_Z";
      charset[charset["LEFT_CURLY_BRACKET"] = 123] = "LEFT_CURLY_BRACKET";
      charset[charset["VERTICAL_LINE"] = 124] = "VERTICAL_LINE";
      charset[charset["RIGHT_CURLY_BRACKET"] = 125] = "RIGHT_CURLY_BRACKET";
      charset[charset["TILDE"] = 126] = "TILDE";
  })(charset || (charset = {}));
  ({
      [charset.QUOTATION_MARK]: charset.QUOTATION_MARK,
      [charset.REVERSE_SOLIDUS]: charset.REVERSE_SOLIDUS,
      [charset.SOLIDUS]: charset.SOLIDUS,
      [charset.LATIN_SMALL_LETTER_B]: charset.BACKSPACE,
      [charset.LATIN_SMALL_LETTER_F]: charset.FORM_FEED,
      [charset.LATIN_SMALL_LETTER_N]: charset.NEWLINE,
      [charset.LATIN_SMALL_LETTER_R]: charset.CARRIAGE_RETURN,
      [charset.LATIN_SMALL_LETTER_T]: charset.TAB,
  });

  var TokenType;
  (function (TokenType) {
      TokenType[TokenType["LEFT_BRACE"] = 0] = "LEFT_BRACE";
      TokenType[TokenType["RIGHT_BRACE"] = 1] = "RIGHT_BRACE";
      TokenType[TokenType["LEFT_BRACKET"] = 2] = "LEFT_BRACKET";
      TokenType[TokenType["RIGHT_BRACKET"] = 3] = "RIGHT_BRACKET";
      TokenType[TokenType["COLON"] = 4] = "COLON";
      TokenType[TokenType["COMMA"] = 5] = "COMMA";
      TokenType[TokenType["TRUE"] = 6] = "TRUE";
      TokenType[TokenType["FALSE"] = 7] = "FALSE";
      TokenType[TokenType["NULL"] = 8] = "NULL";
      TokenType[TokenType["STRING"] = 9] = "STRING";
      TokenType[TokenType["NUMBER"] = 10] = "NUMBER";
      TokenType[TokenType["SEPARATOR"] = 11] = "SEPARATOR";
  })(TokenType || (TokenType = {}));

  // Tokenizer States
  var TokenizerStates;
  (function (TokenizerStates) {
      TokenizerStates[TokenizerStates["START"] = 0] = "START";
      TokenizerStates[TokenizerStates["ENDED"] = 1] = "ENDED";
      TokenizerStates[TokenizerStates["ERROR"] = 2] = "ERROR";
      TokenizerStates[TokenizerStates["TRUE1"] = 3] = "TRUE1";
      TokenizerStates[TokenizerStates["TRUE2"] = 4] = "TRUE2";
      TokenizerStates[TokenizerStates["TRUE3"] = 5] = "TRUE3";
      TokenizerStates[TokenizerStates["FALSE1"] = 6] = "FALSE1";
      TokenizerStates[TokenizerStates["FALSE2"] = 7] = "FALSE2";
      TokenizerStates[TokenizerStates["FALSE3"] = 8] = "FALSE3";
      TokenizerStates[TokenizerStates["FALSE4"] = 9] = "FALSE4";
      TokenizerStates[TokenizerStates["NULL1"] = 10] = "NULL1";
      TokenizerStates[TokenizerStates["NULL2"] = 11] = "NULL2";
      TokenizerStates[TokenizerStates["NULL3"] = 12] = "NULL3";
      TokenizerStates[TokenizerStates["STRING_DEFAULT"] = 13] = "STRING_DEFAULT";
      TokenizerStates[TokenizerStates["STRING_AFTER_BACKSLASH"] = 14] = "STRING_AFTER_BACKSLASH";
      TokenizerStates[TokenizerStates["STRING_UNICODE_DIGIT_1"] = 15] = "STRING_UNICODE_DIGIT_1";
      TokenizerStates[TokenizerStates["STRING_UNICODE_DIGIT_2"] = 16] = "STRING_UNICODE_DIGIT_2";
      TokenizerStates[TokenizerStates["STRING_UNICODE_DIGIT_3"] = 17] = "STRING_UNICODE_DIGIT_3";
      TokenizerStates[TokenizerStates["STRING_UNICODE_DIGIT_4"] = 18] = "STRING_UNICODE_DIGIT_4";
      TokenizerStates[TokenizerStates["STRING_INCOMPLETE_CHAR"] = 19] = "STRING_INCOMPLETE_CHAR";
      TokenizerStates[TokenizerStates["NUMBER_AFTER_INITIAL_MINUS"] = 20] = "NUMBER_AFTER_INITIAL_MINUS";
      TokenizerStates[TokenizerStates["NUMBER_AFTER_INITIAL_ZERO"] = 21] = "NUMBER_AFTER_INITIAL_ZERO";
      TokenizerStates[TokenizerStates["NUMBER_AFTER_INITIAL_NON_ZERO"] = 22] = "NUMBER_AFTER_INITIAL_NON_ZERO";
      TokenizerStates[TokenizerStates["NUMBER_AFTER_FULL_STOP"] = 23] = "NUMBER_AFTER_FULL_STOP";
      TokenizerStates[TokenizerStates["NUMBER_AFTER_DECIMAL"] = 24] = "NUMBER_AFTER_DECIMAL";
      TokenizerStates[TokenizerStates["NUMBER_AFTER_E"] = 25] = "NUMBER_AFTER_E";
      TokenizerStates[TokenizerStates["NUMBER_AFTER_E_AND_SIGN"] = 26] = "NUMBER_AFTER_E_AND_SIGN";
      TokenizerStates[TokenizerStates["NUMBER_AFTER_E_AND_DIGIT"] = 27] = "NUMBER_AFTER_E_AND_DIGIT";
      TokenizerStates[TokenizerStates["SEPARATOR"] = 28] = "SEPARATOR";
      TokenizerStates[TokenizerStates["BOM_OR_START"] = 29] = "BOM_OR_START";
      TokenizerStates[TokenizerStates["BOM"] = 30] = "BOM";
  })(TokenizerStates || (TokenizerStates = {}));

  var TokenParserMode;
  (function (TokenParserMode) {
      TokenParserMode[TokenParserMode["OBJECT"] = 0] = "OBJECT";
      TokenParserMode[TokenParserMode["ARRAY"] = 1] = "ARRAY";
  })(TokenParserMode || (TokenParserMode = {}));

  // Parser States
  var TokenParserState;
  (function (TokenParserState) {
      TokenParserState[TokenParserState["VALUE"] = 0] = "VALUE";
      TokenParserState[TokenParserState["KEY"] = 1] = "KEY";
      TokenParserState[TokenParserState["COLON"] = 2] = "COLON";
      TokenParserState[TokenParserState["COMMA"] = 3] = "COMMA";
      TokenParserState[TokenParserState["ENDED"] = 4] = "ENDED";
      TokenParserState[TokenParserState["ERROR"] = 5] = "ERROR";
      TokenParserState[TokenParserState["SEPARATOR"] = 6] = "SEPARATOR";
  })(TokenParserState || (TokenParserState = {}));

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z$6 = ":root{--sans-font:-apple-system,BlinkMacSystemFont,\"Avenir Next\",Avenir,\"Nimbus Sans L\",Roboto,\"Noto Sans\",\"Segoe UI\",Arial,Helvetica,\"Helvetica Neue\",sans-serif;--mono-font:Consolas,Menlo,Monaco,\"Andale Mono\",\"Ubuntu Mono\",monospace;--standard-border-radius:5px;--border-width:1px;--bg:#fff;--accent-bg:#f5f7ff;--text:#212121;--text-light:#585858;--border:#898ea4;--accent:#0d47a1;--accent-hover:#1266e2;--accent-text:var(--bg);--code:#d81b60;--preformatted:#444;--marked:#fd3;--disabled:#efefef}.demo-tools{color:var(--text);font-family:var(--sans-font);font-size:12px;font-weight:500}@media (prefers-color-scheme:dark){.demo-tools :root{--bg:#212121;--accent-bg:#2b2b2b;--text:#dcdcdc;--text-light:#ababab;--accent:#ffb300;--accent-hover:#ffe099;--accent-text:var(--bg);--code:#f06292;--preformatted:#ccc;--disabled:#111;color-scheme:dark}.demo-tools img,.demo-tools video{opacity:.8}}.demo-tools *,.demo-tools :after,.demo-tools :before{box-sizing:border-box}.demo-tools input,.demo-tools progress,.demo-tools select,.demo-tools textarea{appearance:none;-webkit-appearance:none;-moz-appearance:none}.demo-tools header{background-color:var(--accent-bg);border-bottom:var(--border-width) solid var(--border);grid-column:1/-1;padding:0 .5rem 2rem;text-align:center}.demo-tools header>:only-child{margin-block-start:2rem}.demo-tools header h1{margin:1rem auto;max-width:1200px}.demo-tools header p{margin:1rem auto;max-width:40rem}.demo-tools main{padding-top:1.5rem}.demo-tools footer{border-top:var(--border-width) solid var(--border);color:var(--text-light);font-size:.9rem;margin-top:4rem;padding:2rem 1rem 1.5rem;text-align:center}.demo-tools h1{font-size:3rem}.demo-tools h2{font-size:2.6rem;margin-top:3rem}.demo-tools h3{font-size:2rem;margin-top:3rem}.demo-tools h4{font-size:1.44rem}.demo-tools h5{font-size:1.15rem}.demo-tools h6{font-size:.96rem}.demo-tools p{margin:1.5rem 0}.demo-tools h1,.demo-tools h2,.demo-tools h3,.demo-tools h4,.demo-tools h5,.demo-tools h6,.demo-tools p{overflow-wrap:break-word}.demo-tools h1,.demo-tools h2,.demo-tools h3{line-height:1.1}@media only screen and (max-width:720px){.demo-tools h1{font-size:2.5rem}.demo-tools h2{font-size:2.1rem}.demo-tools h3{font-size:1.75rem}.demo-tools h4{font-size:1.25rem}}.demo-tools a,.demo-tools a:visited{color:var(--accent)}.demo-tools a:hover{text-decoration:none}.demo-tools .button,.demo-tools a.button,.demo-tools button,.demo-tools input[type=button],.demo-tools input[type=reset],.demo-tools input[type=submit]{background-color:var(--accent);border:var(--border-width) solid var(--accent);color:var(--accent-text);font-style:normal;line-height:normal;padding:.5em;text-decoration:none}.demo-tools .button[aria-disabled=true],.demo-tools button[disabled],.demo-tools input:disabled,.demo-tools select:disabled,.demo-tools textarea:disabled{background-color:var(--disabled);border-color:var(--disabled);color:var(--text-light);cursor:not-allowed}.demo-tools input[type=range]{padding:0}.demo-tools abbr[title]{cursor:help;text-decoration-line:underline;text-decoration-style:dotted}.demo-tools .button:not([aria-disabled=true]):hover,.demo-tools button:enabled:hover,.demo-tools input[type=button]:enabled:hover,.demo-tools input[type=reset]:enabled:hover,.demo-tools input[type=submit]:enabled:hover{background-color:var(--accent-hover);border-color:var(--accent-hover);cursor:pointer}.demo-tools .button:focus-visible,.demo-tools button:focus-visible:where(:enabled),.demo-tools input:enabled:focus-visible:where([type=submit],[type=reset],[type=button]){outline:2px solid var(--accent);outline-offset:1px}.demo-tools header nav{font-size:1rem;line-height:2;padding:1rem 0 0}.demo-tools header nav ol,.demo-tools header nav ul{align-content:space-around;align-items:center;display:flex;flex-direction:row;flex-wrap:wrap;justify-content:center;list-style-type:none;margin:0;padding:0}.demo-tools header nav ol li,.demo-tools header nav ul li{display:inline-block}.demo-tools header nav a,.demo-tools header nav a:visited{border:var(--border-width) solid var(--border);border-radius:var(--standard-border-radius);color:var(--text);display:inline-block;margin:0 .5rem 1rem;padding:.1rem 1rem;text-decoration:none}.demo-tools header nav a.current,.demo-tools header nav a:hover,.demo-tools header nav a[aria-current=page],.demo-tools header nav a[aria-current=true]{background:var(--bg);border-color:var(--accent);color:var(--accent);cursor:pointer}@media only screen and (max-width:720px){.demo-tools header nav a{border:none;line-height:1;padding:0;text-decoration:underline}.demo-tools header nav a.current{background:none}}.demo-tools aside,.demo-tools details,.demo-tools pre,.demo-tools progress{background-color:var(--accent-bg);border:var(--border-width) solid var(--border);border-radius:var(--standard-border-radius);margin-bottom:1rem}.demo-tools aside{float:right;font-size:1rem;margin-inline-start:15px;padding:0 15px;width:30%}.demo-tools [dir=rtl] aside{float:left}@media only screen and (max-width:720px){.demo-tools aside{float:none;margin-inline-start:0;width:100%}}.demo-tools article,.demo-tools dialog,.demo-tools fieldset{border:var(--border-width) solid var(--border);border-radius:var(--standard-border-radius);margin-bottom:1rem;padding:1rem}.demo-tools article h2:first-child,.demo-tools article h3:first-child,.demo-tools section h2:first-child,.demo-tools section h3:first-child{margin-top:1rem}.demo-tools section{border-bottom:var(--border-width) solid var(--border);border-top:var(--border-width) solid var(--border);margin:3rem 0;padding:2rem 1rem}.demo-tools section+section,.demo-tools section:first-child{border-top:0;padding-top:0}.demo-tools section+section{margin-top:0}.demo-tools section:last-child{border-bottom:0;padding-bottom:0}.demo-tools details{padding:.7rem 1rem}.demo-tools summary{cursor:pointer;font-weight:700;margin:-.7rem -1rem;padding:.7rem 1rem;word-break:break-all}.demo-tools details[open]>summary+*{margin-top:0}.demo-tools details[open]>summary{margin-bottom:.5rem}.demo-tools details[open]>:last-child{margin-bottom:0}.demo-tools table{border-collapse:collapse;margin:1.5rem 0}.demo-tools figure>table{margin:0;width:max-content}.demo-tools td,.demo-tools th{border:var(--border-width) solid var(--border);padding:.5rem;text-align:start}.demo-tools th{font-weight:700}.demo-tools th,.demo-tools tr:nth-child(2n){background-color:var(--accent-bg)}.demo-tools table caption{font-weight:700;margin-bottom:.5rem}.demo-tools .button,.demo-tools button,.demo-tools input,.demo-tools select,.demo-tools textarea{border-radius:var(--standard-border-radius);box-shadow:none;display:inline-block;font-family:inherit;font-size:inherit;max-width:100%;padding:.5em}.demo-tools input,.demo-tools select,.demo-tools textarea{background-color:var(--bg);border:var(--border-width) solid var(--border);color:var(--text)}.demo-tools label{display:block}.demo-tools textarea:not([cols]){width:100%}.demo-tools select:not([multiple]){background-image:linear-gradient(45deg,transparent 49%,var(--text) 51%),linear-gradient(135deg,var(--text) 51%,transparent 49%);background-position:calc(100% - 15px),calc(100% - 10px);background-repeat:no-repeat;background-size:5px 5px,5px 5px;padding-inline-end:25px}.demo-tools [dir=rtl] select:not([multiple]){background-position:10px,15px}.demo-tools input[type=checkbox],.demo-tools input[type=radio]{position:relative;vertical-align:middle;width:min-content}.demo-tools input[type=checkbox]+label,.demo-tools input[type=radio]+label{display:inline-block}.demo-tools input[type=radio]{border-radius:100%}.demo-tools input[type=checkbox]:checked,.demo-tools input[type=radio]:checked{background-color:var(--accent)}.demo-tools input[type=checkbox]:checked:after{background-color:transparent;border-bottom:.08em solid var(--bg);border-radius:0;border-right:.08em solid var(--bg);content:\" \";font-size:1.8em;height:.4em;left:.18em;position:absolute;top:.04em;transform:rotate(45deg);width:.2em}.demo-tools input[type=radio]:checked:after{background-color:var(--bg);border-radius:100%;content:\" \";font-size:1.8em;height:.3em;left:.125em;position:absolute;top:.125em;width:.3em}@media only screen and (max-width:720px){.demo-tools input,.demo-tools select,.demo-tools textarea{width:100%}}.demo-tools input[type=color]{height:2.5rem;padding:.2rem}.demo-tools input[type=file]{border:0}.demo-tools hr{background:var(--border);border:none;height:var(--border-width);margin:1rem auto}.demo-tools mark{background-color:var(--marked);border-radius:var(--standard-border-radius);color:#000;padding:2px 5px}.demo-tools mark a{color:#0d47a1}.demo-tools img,.demo-tools video{border-radius:var(--standard-border-radius);height:auto;max-width:100%}.demo-tools figure{display:block;margin:0;overflow-x:auto}.demo-tools figure>img,.demo-tools figure>picture>img{display:block;margin-inline:auto}.demo-tools figcaption{color:var(--text-light);font-size:.9rem;left:0;margin-block:1rem;position:sticky;text-align:center}.demo-tools blockquote{border-inline-start:.35rem solid var(--accent);color:var(--text-light);font-style:italic;margin-block:2rem;margin-inline-end:0;margin-inline-start:2rem;padding:.4rem .8rem}.demo-tools cite{font-size:.9rem;font-style:normal}.demo-tools cite,.demo-tools dt{color:var(--text-light)}.demo-tools code,.demo-tools kbd,.demo-tools pre,.demo-tools pre span,.demo-tools samp{color:var(--code);font-family:var(--mono-font)}.demo-tools kbd{border:var(--border-width) solid var(--preformatted);border-bottom:3px solid var(--preformatted);border-radius:var(--standard-border-radius);color:var(--preformatted);padding:.1rem .4rem}.demo-tools pre{color:var(--preformatted);max-width:100%;overflow:auto;padding:1rem 1.4rem}.demo-tools pre code{background:none;color:var(--preformatted);margin:0;padding:0}.demo-tools progress{width:100%}.demo-tools progress:indeterminate{background-color:var(--accent-bg)}.demo-tools progress::-webkit-progress-bar{background-color:var(--accent-bg);border-radius:var(--standard-border-radius)}.demo-tools progress::-webkit-progress-value{background-color:var(--accent);border-radius:var(--standard-border-radius)}.demo-tools progress::-moz-progress-bar{background-color:var(--accent);border-radius:var(--standard-border-radius);transition-duration:.3s;transition-property:width}.demo-tools progress:indeterminate::-moz-progress-bar{background-color:var(--accent-bg)}.demo-tools dialog{background-color:var(--bg);margin:auto;max-width:40rem}.demo-tools dialog::backdrop{background-color:var(--bg);opacity:.8}@media only screen and (max-width:720px){.demo-tools dialog{max-width:calc(100vw - 2rem)}}.demo-tools sub,.demo-tools sup{position:relative;vertical-align:baseline}.demo-tools sup{top:-.4em}.demo-tools sub{top:.3em}.demo-tools .notice{background:var(--accent-bg);border:var(--border-width) solid var(--border);border-radius:var(--standard-border-radius);margin:2rem 0;padding:1.5rem}.demo-tools div.notice p:first-of-type{margin-top:0}.demo-tools div.notice p:last-of-type{margin-bottom:0}@media print{@page{margin:1cm}.demo-tools header{background-color:unset}.demo-tools footer,.demo-tools header nav{display:none}.demo-tools article{border:none;padding:0}.demo-tools a[href^=http]:after{content:\" <\" attr(href) \">\"}.demo-tools abbr[title]:after{content:\" (\" attr(title) \")\"}.demo-tools a{text-decoration:none}.demo-tools p{orphans:3;widows:3}.demo-tools hr{border-top:var(--border-width) solid var(--border)}.demo-tools mark{border:var(--border-width) solid var(--border)}.demo-tools figure,.demo-tools img,.demo-tools pre,.demo-tools svg,.demo-tools table{break-inside:avoid}.demo-tools pre code{white-space:pre-wrap}}\n/*# sourceMappingURL=data:application/json;base64,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 */";
  styleInject(css_248z$6);

  function diff(obj1 = {}, obj2 = {}, exclude) {
      var r = {};
      if (!exclude)
          exclude = [];
      for (var prop in obj1) {
          if (obj1.hasOwnProperty(prop) && prop != '__proto__') {
              if (exclude.indexOf(obj1[prop]) == -1) {
                  if (!obj2.hasOwnProperty(prop))
                      r[prop] = obj1[prop];
                  else if (obj1[prop] === Object(obj1[prop])) {
                      var difference = diff(obj1[prop], obj2[prop]);
                      if (Object.keys(difference).length > 0)
                          r[prop] = difference;
                  }
                  else if (obj1[prop] !== obj2[prop]) {
                      if (obj1[prop] === undefined)
                          r[prop] = 'undefined';
                      if (obj1[prop] === null)
                          r[prop] = null;
                      else if (typeof obj1[prop] === 'function')
                          r[prop] = 'function';
                      else if (typeof obj1[prop] === 'object')
                          r[prop] = 'object';
                      else
                          r[prop] = obj1[prop];
                  }
              }
          }
      }
      return r;
  }

  class Logger {
      static setOptions(options) {
          Logger.options = Object.assign(Object.assign({}, Logger.options), options);
      }
      static log(...args) {
          if (isEmpty(args)) {
              return;
          }
          let record;
          if (Logger.options.diff) {
              record = [...values(args), ...values(args).map((argument, i) => diff(args || {}, Logger.values[Logger.values.length - 1][i] || {}))];
          }
          else {
              record = [...values(args)];
          }
          Logger.values.push(record);
          if (Logger.live) {
              if (Logger.prefix) {
                  console.log(Logger.prefix + ':', ...args);
              }
              else {
                  console.log(...args);
              }
          }
      }
      static print() {
          console.table(Logger.values);
      }
      static reset() {
          Logger.values = [[]];
      }
      static getValues() {
          return Logger.values;
      }
  }
  Logger.live = false;
  Logger.values = [[]];
  Logger.prefix = '';
  Logger.options = {
      diff: false
  };

  const isPrimitive = value => {
      if (value === null) {
          return true;
      }
      if (typeof value === 'object' || typeof value === 'function') {
          return false;
      }
      return true;
  };
  function isFunctionLikeString(s) {
      if (typeof s !== 'string')
          return false;
      const trimmed = s.trim();
      if (trimmed.length === 0)
          return false;
      if (/^function\b/.test(trimmed))
          return true;
      if (/^async function\b/.test(trimmed))
          return true;
      if (trimmed.includes('=>'))
          return true;
      if (/^\[native code\]$/.test(trimmed))
          return true;
      return false;
  }
  function isNumber(string) {
      return /^[0-9\.]+$/.test(String(string));
  }
  function isBoolean(string) {
      return String(string).toLowerCase() === 'true' || String(string).toLowerCase() === 'false';
  }
  function isObject(string) {
      try {
          const obj = JSON.parse(string);
          return obj !== null && typeof obj === 'object';
      }
      catch (_a) {
          return false;
      }
  }
  function isArray(string) {
      try {
          const obj = JSON.parse(string);
          return obj !== null && (obj === null || obj === void 0 ? void 0 : obj.constructor) === Array;
      }
      catch (_a) {
          return false;
      }
  }
  const setOnLoad = (fn) => {
      window.setVar('onLoad', String(fn));
  };
  const getElementByXPath = (xpath) => {
      if (isEmpty(xpath) || !is(String, xpath)) {
          return null;
      }
      let result;
      let xpath1 = xpath;
      do {
          result = document.evaluate(xpath1, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
          if (result.singleNodeValue) {
              return result.singleNodeValue;
          }
          xpath1 = xpath1.substring(0, xpath1.lastIndexOf('/'));
      } while (!isEmpty(xpath1) && !(result === null || result === void 0 ? void 0 : result.singleNodeValue));
  };
  const stringToSlug = (str) => {
      return str.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  };

  const localStorageKey = 'dev-tools';
  const reviveVar = (value) => {
      if (isNumber(value)) {
          return Number(value);
      }
      else if (isBoolean(value)) {
          return String(value).toLowerCase() === 'true';
      }
      else if (isObject(value) || typeof value === 'object') {
          if (isArray(value) || (value === null || value === void 0 ? void 0 : value.constructor) === Array) {
              return map(reviveVar, isArray(value) ? JSON.parse(value) : value);
          }
          return mapObjIndexed(reviveVar, isObject(value) ? JSON.parse(value) : value);
      }
      else if (isFunctionLikeString(value)) {
          const wrapped = `(${value})`;
          return eval(wrapped);
      }
      else {
          return value;
      }
  };
  const stringifyVar = (value) => {
      if (isPrimitive(value)) {
          return String(value);
      }
      if (typeof value === 'function') {
          return value.toString();
      }
      else {
          const seen = new WeakSet();
          const replacer = (key, v) => {
              if (typeof v === 'function') {
                  return v.toString();
              }
              if (typeof v === 'object' && v !== null) {
                  if (seen.has(v)) {
                      return '[Circular]';
                  }
                  seen.add(v);
              }
              return v;
          };
          return JSON.stringify(value, replacer);
      }
  };
  const setVar = (varName, value) => {
      if (!/^[a-z_A-Z0-9]+$/.test(varName)) {
          throw new Error(`${varName} is a not a valid variable name`);
      }
      const vars = localStorage.getItem(localStorageKey);
      const varsObj = JSON.parse(vars) || {};
      let adjustedValue = { type: (value === null || value === void 0 ? void 0 : value.constructor) === Array ? 'array' : typeof value, value: stringifyVar(value) };
      varsObj[String(varName)] = adjustedValue;
      localStorage.setItem(localStorageKey, JSON.stringify(varsObj));
      window[varName] = value;
  };
  const getVars = () => {
      const vars = localStorage.getItem(localStorageKey);
      const varsObj = JSON.parse(vars);
      const varsParsed = [];
      mapObjIndexed((variable, varName) => {
          switch (variable.type) {
              case 'array':
                  varsParsed.push({ name: varName, value: reviveVar(variable.value) });
                  break;
              case 'object':
                  varsParsed.push({ name: varName, value: reviveVar(variable.value) });
                  break;
              case 'number':
                  varsParsed.push({ name: varName, value: Number(variable.value) });
                  break;
              case 'boolean':
                  varsParsed.push({ name: varName, value: variable.value === 'true' });
                  break;
              default:
                  varsParsed.push({ name: varName, value: variable.value });
          }
      }, varsObj);
      return varsParsed;
  };
  const getVar = (varName) => {
      var _a, _b, _c;
      if (window[varName] !== undefined)
          return window[varName];
      const vars = localStorage.getItem(localStorageKey);
      const varsObj = JSON.parse(vars);
      return ((_a = varsObj === null || varsObj === void 0 ? void 0 : varsObj[varName]) === null || _a === void 0 ? void 0 : _a.value) ? reviveVar((_b = varsObj === null || varsObj === void 0 ? void 0 : varsObj[varName]) === null || _b === void 0 ? void 0 : _b.value) : (_c = varsObj === null || varsObj === void 0 ? void 0 : varsObj[varName]) === null || _c === void 0 ? void 0 : _c.value;
  };
  const deleteVar = varName => {
      const vars = localStorage.getItem(localStorageKey);
      const varsObj = JSON.parse(vars);
      delete varsObj[varName];
      localStorage.setItem(localStorageKey, JSON.stringify(varsObj));
      delete window[varName];
  };
  const clearVars = () => {
      const vars = localStorage.getItem(localStorageKey);
      const varsObj = JSON.parse(vars);
      mapObjIndexed((variable, varName) => {
          delete window[varName];
      }, varsObj);
      localStorage.removeItem(localStorageKey);
  };

  var PROJECT_PATH = "D:/Users/m_botezatu/projects/fifx-client";
  var SRC_PATH = "src";
  var APP_ID = "fifx-client";
  var SERVER_PORT = "8080";
  var constants = {
  	APP_ID: APP_ID};

  const stub = (path, varName) => {
      return fetch(`http://localhost:${SERVER_PORT}/stub/${encodeURIComponent(`${PROJECT_PATH}/${SRC_PATH}/${path}`)}`)
          .then(result => {
          if (!isNil(result) && !isEmpty(result)) {
              return result.json();
          }
          return null;
      }).then(result => {
          if (!isNil(result) && !isEmpty(result) && !isNil(varName)) {
              setVar(String(varName), result);
          }
          return result;
      })
          .catch(e => {
          throw new Error(e);
      });
  };

  function findProp(obj, propName) {
      const results = [];
      if (obj == null || typeof propName !== 'string' || propName.length === 0) {
          return results;
      }
      const seen = new WeakSet();
      const stack = [{ current: obj, path: [] }];
      while (stack.length) {
          const { current, path } = stack.pop();
          if (current && (typeof current === 'object' || typeof current === 'function')) {
              if (seen.has(current))
                  continue;
              seen.add(current);
              const entries = Array.isArray(current)
                  ? current.map((v, i) => [String(i), v])
                  : Object.keys(current).map(k => [k, current[k]]);
              for (let i = 0; i < entries.length; i++) {
                  const [key, val] = entries[i];
                  const keyPathSegment = Array.isArray(current) ? Number(key) : key;
                  const newPath = path.concat(keyPathSegment);
                  if (key.toLowerCase().indexOf(propName.toLowerCase()) !== -1) {
                      results.push({
                          key,
                          value: val,
                          path: newPath
                      });
                  }
                  if (val && (typeof val === 'object' || typeof val === 'function')) {
                      stack.push({ current: val, path: newPath });
                  }
              }
          }
      }
      return results;
  }
  function findValue(obj, value) {
      const results = [];
      if (obj == null ||
          (typeof value !== 'string' &&
              typeof value !== 'number' &&
              typeof value !== 'boolean' &&
              !is(Array, value) &&
              !isNil(value))) {
          return results;
      }
      const seen = new WeakSet();
      const stack = [{ current: obj, path: [] }];
      while (stack.length) {
          const { current, path } = stack.pop();
          if (current && (typeof current === 'object' || typeof current === 'function')) {
              if (seen.has(current))
                  continue;
              seen.add(current);
              const entries = Array.isArray(current)
                  ? current.map((v, i) => [String(i), v])
                  : Object.keys(current).map(k => [k, current[k]]);
              for (let i = 0; i < entries.length; i++) {
                  const [key, val] = entries[i];
                  const keyPathSegment = Array.isArray(current) ? Number(key) : key;
                  const newPath = path.concat(keyPathSegment);
                  switch (typeof value) {
                      case 'string':
                          if (typeof val !== 'string')
                              break;
                          if (val.toLowerCase().indexOf(value.toLowerCase()) !== -1) {
                              results.push({
                                  key,
                                  value: val,
                                  path: newPath
                              });
                          }
                          break;
                      case 'boolean':
                      case 'number':
                          if (val === value) {
                              results.push({
                                  key,
                                  value: val,
                                  path: newPath
                              });
                          }
                      case 'object':
                          if ((values(value) || []).every(v => val.includes(v))) {
                              results.push({
                                  key,
                                  value: val,
                                  path: newPath
                              });
                          }
                  }
                  if (val && (typeof val === 'object' || typeof val === 'function')) {
                      stack.push({ current: val, path: newPath });
                  }
              }
          }
      }
      return results;
  }
  const findMatch = (obj1, obj2, path$1 = []) => {
      let result = null;
      const search = (obj, path = []) => {
          if (!is(Object, obj) || isNil(obj))
              return;
          if (whereEq(obj2, obj)) {
              if (!result) {
                  result = { path, value: obj };
                  return;
              }
          }
          forEachObjIndexed((value, key) => {
              if (is(Object, value) && !isNil(value)) {
                  search(value, [...path, key]);
              }
          }, obj);
      };
      search(path(path$1, obj1));
      return result;
  };
  const findMatches = (obj1, obj2) => {
      let results = [];
      const search = (obj, path = []) => {
          if (!is(Object, obj) || isNil(obj))
              return;
          if (whereEq(obj2, obj)) {
              results.push({ path, value: obj });
          }
          forEachObjIndexed((value, key) => {
              if (is(Object, value) && !isNil(value)) {
                  search(value, [...path, isNaN(key) ? key : Number(key)]);
              }
          }, obj);
      };
      search(obj1);
      return results;
  };
  const flattenObj = (obj, prefix = '', res = {}) => {
      if (Array.isArray(obj)) {
          obj.forEach((v, i) => {
              const newKey = prefix ? `${prefix}.${i}` : `${i}`;
              if (v && typeof v === 'object')
                  flattenObj(v, newKey, res);
              else
                  res[newKey] = v;
          });
          return res;
      }
      for (const key in obj) {
          const value = obj[key];
          const newKey = prefix ? `${prefix}.${key}` : key;
          if (value && typeof value === 'object') {
              flattenObj(value, newKey, res);
          }
          else
              res[newKey] = value;
      }
      return res;
  };
  const getStringSimilarity = (str1, str2) => {
      function levenshteinDistance(str1, str2) {
          const track = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
          for (let i = 0; i <= str1.length; i += 1)
              track[0][i] = i;
          for (let j = 0; j <= str2.length; j += 1)
              track[j][0] = j;
          for (let j = 1; j <= str2.length; j += 1) {
              for (let i = 1; i <= str1.length; i += 1) {
                  const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                  track[j][i] = Math.min(track[j - 1][i] + 1, track[j][i - 1] + 1, track[j - 1][i - 1] + indicator);
              }
          }
          return track[str2.length][str1.length];
      }
      const distance = levenshteinDistance(str1, str2);
      const maxLength = Math.max(str1.length, str2.length);
      if (maxLength === 0)
          return 1.0;
      return 1.0 - (distance / maxLength);
  };

  var _$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    findMatch: findMatch,
    findMatches: findMatches,
    findProp: findProp,
    findValue: findValue,
    flattenObj: flattenObj,
    getStringSimilarity: getStringSimilarity
  });

  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */
  /* global Reflect, Promise, SuppressedError, Symbol, Iterator */


  function __awaiter(thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }

  typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
      var e = new Error(message);
      return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };

  let z = {}, J;
  function F(e = {}) {
    z = {
      animate: true,
      allowClose: true,
      overlayClickBehavior: "close",
      overlayOpacity: 0.7,
      smoothScroll: false,
      disableActiveInteraction: false,
      showProgress: false,
      stagePadding: 10,
      stageRadius: 5,
      popoverOffset: 10,
      showButtons: ["next", "previous", "close"],
      disableButtons: [],
      overlayColor: "#000",
      ...e
    };
  }
  function s(e) {
    return e ? z[e] : z;
  }
  function le(e) {
    J = e;
  }
  function _() {
    return J;
  }
  let I = {};
  function N(e, o) {
    I[e] = o;
  }
  function L(e) {
    var o;
    (o = I[e]) == null || o.call(I);
  }
  function de() {
    I = {};
  }
  function O(e, o, t, i) {
    return (e /= i / 2) < 1 ? t / 2 * e * e + o : -t / 2 * (--e * (e - 2) - 1) + o;
  }
  function U(e) {
    const o = 'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])';
    return e.flatMap((t) => {
      const i = t.matches(o), d = Array.from(t.querySelectorAll(o));
      return [...i ? [t] : [], ...d];
    }).filter((t) => getComputedStyle(t).pointerEvents !== "none" && ve(t));
  }
  function ee(e) {
    if (!e || ue(e))
      return;
    const o = s("smoothScroll"), t = e.offsetHeight > window.innerHeight;
    e.scrollIntoView({
      // Removing the smooth scrolling for elements which exist inside the scrollable parent
      // This was causing the highlight to not properly render
      behavior: !o || pe(e) ? "auto" : "smooth",
      inline: "center",
      block: t ? "start" : "center"
    });
  }
  function pe(e) {
    if (!e || !e.parentElement)
      return;
    const o = e.parentElement;
    return o.scrollHeight > o.clientHeight;
  }
  function ue(e) {
    const o = e.getBoundingClientRect();
    return o.top >= 0 && o.left >= 0 && o.bottom <= (window.innerHeight || document.documentElement.clientHeight) && o.right <= (window.innerWidth || document.documentElement.clientWidth);
  }
  function ve(e) {
    return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
  }
  let D = {};
  function k(e, o) {
    D[e] = o;
  }
  function l(e) {
    return e ? D[e] : D;
  }
  function X() {
    D = {};
  }
  function fe(e, o, t, i) {
    let d = l("__activeStagePosition");
    const n = d || t.getBoundingClientRect(), f = i.getBoundingClientRect(), w = O(e, n.x, f.x - n.x, o), r = O(e, n.y, f.y - n.y, o), v = O(e, n.width, f.width - n.width, o), g = O(e, n.height, f.height - n.height, o);
    d = {
      x: w,
      y: r,
      width: v,
      height: g
    }, oe(d), k("__activeStagePosition", d);
  }
  function te(e) {
    if (!e)
      return;
    const o = e.getBoundingClientRect(), t = {
      x: o.x,
      y: o.y,
      width: o.width,
      height: o.height
    };
    k("__activeStagePosition", t), oe(t);
  }
  function he() {
    const e = l("__activeStagePosition"), o = l("__overlaySvg");
    if (!e)
      return;
    if (!o) {
      console.warn("No stage svg found.");
      return;
    }
    const t = window.innerWidth, i = window.innerHeight;
    o.setAttribute("viewBox", `0 0 ${t} ${i}`);
  }
  function ge(e) {
    const o = we(e);
    document.body.appendChild(o), re(o, (t) => {
      t.target.tagName === "path" && L("overlayClick");
    }), k("__overlaySvg", o);
  }
  function oe(e) {
    const o = l("__overlaySvg");
    if (!o) {
      ge(e);
      return;
    }
    const t = o.firstElementChild;
    if ((t == null ? void 0 : t.tagName) !== "path")
      throw new Error("no path element found in stage svg");
    t.setAttribute("d", ie(e));
  }
  function we(e) {
    const o = window.innerWidth, t = window.innerHeight, i = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    i.classList.add("driver-overlay", "driver-overlay-animated"), i.setAttribute("viewBox", `0 0 ${o} ${t}`), i.setAttribute("xmlSpace", "preserve"), i.setAttribute("xmlnsXlink", "http://www.w3.org/1999/xlink"), i.setAttribute("version", "1.1"), i.setAttribute("preserveAspectRatio", "xMinYMin slice"), i.style.fillRule = "evenodd", i.style.clipRule = "evenodd", i.style.strokeLinejoin = "round", i.style.strokeMiterlimit = "2", i.style.zIndex = "10000", i.style.position = "fixed", i.style.top = "0", i.style.left = "0", i.style.width = "100%", i.style.height = "100%";
    const d = document.createElementNS("http://www.w3.org/2000/svg", "path");
    return d.setAttribute("d", ie(e)), d.style.fill = s("overlayColor") || "rgb(0,0,0)", d.style.opacity = `${s("overlayOpacity")}`, d.style.pointerEvents = "auto", d.style.cursor = "auto", i.appendChild(d), i;
  }
  function ie(e) {
    const o = window.innerWidth, t = window.innerHeight, i = s("stagePadding") || 0, d = s("stageRadius") || 0, n = e.width + i * 2, f = e.height + i * 2, w = Math.min(d, n / 2, f / 2), r = Math.floor(Math.max(w, 0)), v = e.x - i + r, g = e.y - i, y = n - r * 2, a = f - r * 2;
    return `M${o},0L0,0L0,${t}L${o},${t}L${o},0Z
    M${v},${g} h${y} a${r},${r} 0 0 1 ${r},${r} v${a} a${r},${r} 0 0 1 -${r},${r} h-${y} a${r},${r} 0 0 1 -${r},-${r} v-${a} a${r},${r} 0 0 1 ${r},-${r} z`;
  }
  function me() {
    const e = l("__overlaySvg");
    e && e.remove();
  }
  function ye() {
    const e = document.getElementById("driver-dummy-element");
    if (e)
      return e;
    let o = document.createElement("div");
    return o.id = "driver-dummy-element", o.style.width = "0", o.style.height = "0", o.style.pointerEvents = "none", o.style.opacity = "0", o.style.position = "fixed", o.style.top = "50%", o.style.left = "50%", document.body.appendChild(o), o;
  }
  function j(e) {
    const { element: o } = e;
    let t = typeof o == "function" ? o() : typeof o == "string" ? document.querySelector(o) : o;
    t || (t = ye()), be(t, e);
  }
  function xe() {
    const e = l("__activeElement"), o = l("__activeStep");
    e && (te(e), he(), ae(e, o));
  }
  function be(e, o) {
    var C;
    const i = Date.now(), d = l("__activeStep"), n = l("__activeElement") || e, f = !n || n === e, w = e.id === "driver-dummy-element", r = n.id === "driver-dummy-element", v = s("animate"), g = o.onHighlightStarted || s("onHighlightStarted"), y = (o == null ? void 0 : o.onHighlighted) || s("onHighlighted"), a = (d == null ? void 0 : d.onDeselected) || s("onDeselected"), p = s(), c = l();
    !f && a && a(r ? void 0 : n, d, {
      config: p,
      state: c,
      driver: _()
    }), g && g(w ? void 0 : e, o, {
      config: p,
      state: c,
      driver: _()
    });
    const u = !f && v;
    let h = false;
    _e(), k("previousStep", d), k("previousElement", n), k("activeStep", o), k("activeElement", e);
    const m = () => {
      if (l("__transitionCallback") !== m)
        return;
      const b = Date.now() - i, E = 400 - b <= 400 / 2;
      o.popover && E && !h && u && (Q(e, o), h = true), s("animate") && b < 400 ? fe(b, 400, n, e) : (te(e), y && y(w ? void 0 : e, o, {
        config: s(),
        state: l(),
        driver: _()
      }), k("__transitionCallback", void 0), k("__previousStep", d), k("__previousElement", n), k("__activeStep", o), k("__activeElement", e)), window.requestAnimationFrame(m);
    };
    k("__transitionCallback", m), window.requestAnimationFrame(m), ee(e), !u && o.popover && Q(e, o), n.classList.remove("driver-active-element", "driver-no-interaction"), n.removeAttribute("aria-haspopup"), n.removeAttribute("aria-expanded"), n.removeAttribute("aria-controls"), ((C = o.disableActiveInteraction) != null ? C : s("disableActiveInteraction")) && e.classList.add("driver-no-interaction"), e.classList.add("driver-active-element"), e.setAttribute("aria-haspopup", "dialog"), e.setAttribute("aria-expanded", "true"), e.setAttribute("aria-controls", "driver-popover-content");
  }
  function Ce() {
    var e;
    (e = document.getElementById("driver-dummy-element")) == null || e.remove(), document.querySelectorAll(".driver-active-element").forEach((o) => {
      o.classList.remove("driver-active-element", "driver-no-interaction"), o.removeAttribute("aria-haspopup"), o.removeAttribute("aria-expanded"), o.removeAttribute("aria-controls");
    });
  }
  function M() {
    const e = l("__resizeTimeout");
    e && window.cancelAnimationFrame(e), k("__resizeTimeout", window.requestAnimationFrame(xe));
  }
  function Pe(e) {
    var r;
    if (!l("isInitialized") || !(e.key === "Tab" || e.keyCode === 9))
      return;
    const i = l("__activeElement"), d = (r = l("popover")) == null ? void 0 : r.wrapper, n = U([
      ...d ? [d] : [],
      ...i ? [i] : []
    ]), f = n[0], w = n[n.length - 1];
    if (e.preventDefault(), e.shiftKey) {
      const v = n[n.indexOf(document.activeElement) - 1] || w;
      v == null || v.focus();
    } else {
      const v = n[n.indexOf(document.activeElement) + 1] || f;
      v == null || v.focus();
    }
  }
  function ne(e) {
    var t;
    ((t = s("allowKeyboardControl")) == null || t) && (e.key === "Escape" ? L("escapePress") : e.key === "ArrowRight" ? L("arrowRightPress") : e.key === "ArrowLeft" && L("arrowLeftPress"));
  }
  function re(e, o, t) {
    const i = (n, f) => {
      const w = n.target;
      e.contains(w) && ((!t || t(w)) && (n.preventDefault(), n.stopPropagation(), n.stopImmediatePropagation()), f == null || f(n));
    };
    document.addEventListener("pointerdown", i, true), document.addEventListener("mousedown", i, true), document.addEventListener("pointerup", i, true), document.addEventListener("mouseup", i, true), document.addEventListener(
      "click",
      (n) => {
        i(n, o);
      },
      true
    );
  }
  function ke() {
    window.addEventListener("keyup", ne, false), window.addEventListener("keydown", Pe, false), window.addEventListener("resize", M), window.addEventListener("scroll", M);
  }
  function Se() {
    window.removeEventListener("keyup", ne), window.removeEventListener("resize", M), window.removeEventListener("scroll", M);
  }
  function _e() {
    const e = l("popover");
    e && (e.wrapper.style.display = "none");
  }
  function Q(e, o) {
    var b, P;
    let t = l("popover");
    t && document.body.removeChild(t.wrapper), t = Le(), document.body.appendChild(t.wrapper);
    const {
      title: i,
      description: d,
      showButtons: n,
      disableButtons: f,
      showProgress: w,
      nextBtnText: r = s("nextBtnText") || "Next &rarr;",
      prevBtnText: v = s("prevBtnText") || "&larr; Previous",
      progressText: g = s("progressText") || "{current} of {total}"
    } = o.popover || {};
    t.nextButton.innerHTML = r, t.previousButton.innerHTML = v, t.progress.innerHTML = g, i ? (t.title.innerHTML = i, t.title.style.display = "block") : t.title.style.display = "none", d ? (t.description.innerHTML = d, t.description.style.display = "block") : t.description.style.display = "none";
    const y = n || s("showButtons"), a = w || s("showProgress") || false, p = (y == null ? void 0 : y.includes("next")) || (y == null ? void 0 : y.includes("previous")) || a;
    t.closeButton.style.display = y.includes("close") ? "block" : "none", p ? (t.footer.style.display = "flex", t.progress.style.display = a ? "block" : "none", t.nextButton.style.display = y.includes("next") ? "block" : "none", t.previousButton.style.display = y.includes("previous") ? "block" : "none") : t.footer.style.display = "none";
    const c = f || s("disableButtons") || [];
    c != null && c.includes("next") && (t.nextButton.disabled = true, t.nextButton.classList.add("driver-popover-btn-disabled")), c != null && c.includes("previous") && (t.previousButton.disabled = true, t.previousButton.classList.add("driver-popover-btn-disabled")), c != null && c.includes("close") && (t.closeButton.disabled = true, t.closeButton.classList.add("driver-popover-btn-disabled"));
    const u = t.wrapper;
    u.style.display = "block", u.style.left = "", u.style.top = "", u.style.bottom = "", u.style.right = "", u.id = "driver-popover-content", u.setAttribute("role", "dialog"), u.setAttribute("aria-labelledby", "driver-popover-title"), u.setAttribute("aria-describedby", "driver-popover-description");
    const h = t.arrow;
    h.className = "driver-popover-arrow";
    const m = ((b = o.popover) == null ? void 0 : b.popoverClass) || s("popoverClass") || "";
    u.className = `driver-popover ${m}`.trim(), re(
      t.wrapper,
      (E) => {
        var B, R, W;
        const T = E.target, A = ((B = o.popover) == null ? void 0 : B.onNextClick) || s("onNextClick"), H = ((R = o.popover) == null ? void 0 : R.onPrevClick) || s("onPrevClick"), $ = ((W = o.popover) == null ? void 0 : W.onCloseClick) || s("onCloseClick");
        if (T.closest(".driver-popover-next-btn"))
          return A ? A(e, o, {
            config: s(),
            state: l(),
            driver: _()
          }) : L("nextClick");
        if (T.closest(".driver-popover-prev-btn"))
          return H ? H(e, o, {
            config: s(),
            state: l(),
            driver: _()
          }) : L("prevClick");
        if (T.closest(".driver-popover-close-btn"))
          return $ ? $(e, o, {
            config: s(),
            state: l(),
            driver: _()
          }) : L("closeClick");
      },
      (E) => !(t != null && t.description.contains(E)) && !(t != null && t.title.contains(E)) && typeof E.className == "string" && E.className.includes("driver-popover")
    ), k("popover", t);
    const x = ((P = o.popover) == null ? void 0 : P.onPopoverRender) || s("onPopoverRender");
    x && x(t, {
      config: s(),
      state: l(),
      driver: _()
    }), ae(e, o), ee(u);
    const C = e.classList.contains("driver-dummy-element"), S = U([u, ...C ? [] : [e]]);
    S.length > 0 && S[0].focus();
  }
  function se() {
    const e = l("popover");
    if (!(e != null && e.wrapper))
      return;
    const o = e.wrapper.getBoundingClientRect(), t = s("stagePadding") || 0, i = s("popoverOffset") || 0;
    return {
      width: o.width + t + i,
      height: o.height + t + i,
      realWidth: o.width,
      realHeight: o.height
    };
  }
  function Z(e, o) {
    const { elementDimensions: t, popoverDimensions: i, popoverPadding: d, popoverArrowDimensions: n } = o;
    return e === "start" ? Math.max(
      Math.min(
        t.top - d,
        window.innerHeight - i.realHeight - n.width
      ),
      n.width
    ) : e === "end" ? Math.max(
      Math.min(
        t.top - (i == null ? void 0 : i.realHeight) + t.height + d,
        window.innerHeight - (i == null ? void 0 : i.realHeight) - n.width
      ),
      n.width
    ) : e === "center" ? Math.max(
      Math.min(
        t.top + t.height / 2 - (i == null ? void 0 : i.realHeight) / 2,
        window.innerHeight - (i == null ? void 0 : i.realHeight) - n.width
      ),
      n.width
    ) : 0;
  }
  function G(e, o) {
    const { elementDimensions: t, popoverDimensions: i, popoverPadding: d, popoverArrowDimensions: n } = o;
    return e === "start" ? Math.max(
      Math.min(
        t.left - d,
        window.innerWidth - i.realWidth - n.width
      ),
      n.width
    ) : e === "end" ? Math.max(
      Math.min(
        t.left - (i == null ? void 0 : i.realWidth) + t.width + d,
        window.innerWidth - (i == null ? void 0 : i.realWidth) - n.width
      ),
      n.width
    ) : e === "center" ? Math.max(
      Math.min(
        t.left + t.width / 2 - (i == null ? void 0 : i.realWidth) / 2,
        window.innerWidth - (i == null ? void 0 : i.realWidth) - n.width
      ),
      n.width
    ) : 0;
  }
  function ae(e, o) {
    const t = l("popover");
    if (!t)
      return;
    const { align: i = "start", side: d = "left" } = (o == null ? void 0 : o.popover) || {}, n = i, f = e.id === "driver-dummy-element" ? "over" : d, w = s("stagePadding") || 0, r = se(), v = t.arrow.getBoundingClientRect(), g = e.getBoundingClientRect(), y = g.top - r.height;
    let a = y >= 0;
    const p = window.innerHeight - (g.bottom + r.height);
    let c = p >= 0;
    const u = g.left - r.width;
    let h = u >= 0;
    const m = window.innerWidth - (g.right + r.width);
    let x = m >= 0;
    const C = !a && !c && !h && !x;
    let S = f;
    if (f === "top" && a ? x = h = c = false : f === "bottom" && c ? x = h = a = false : f === "left" && h ? x = a = c = false : f === "right" && x && (h = a = c = false), f === "over") {
      const b = window.innerWidth / 2 - r.realWidth / 2, P = window.innerHeight / 2 - r.realHeight / 2;
      t.wrapper.style.left = `${b}px`, t.wrapper.style.right = "auto", t.wrapper.style.top = `${P}px`, t.wrapper.style.bottom = "auto";
    } else if (C) {
      const b = window.innerWidth / 2 - (r == null ? void 0 : r.realWidth) / 2, P = 10;
      t.wrapper.style.left = `${b}px`, t.wrapper.style.right = "auto", t.wrapper.style.bottom = `${P}px`, t.wrapper.style.top = "auto";
    } else if (h) {
      const b = Math.min(
        u,
        window.innerWidth - (r == null ? void 0 : r.realWidth) - v.width
      ), P = Z(n, {
        elementDimensions: g,
        popoverDimensions: r,
        popoverPadding: w,
        popoverArrowDimensions: v
      });
      t.wrapper.style.left = `${b}px`, t.wrapper.style.top = `${P}px`, t.wrapper.style.bottom = "auto", t.wrapper.style.right = "auto", S = "left";
    } else if (x) {
      const b = Math.min(
        m,
        window.innerWidth - (r == null ? void 0 : r.realWidth) - v.width
      ), P = Z(n, {
        elementDimensions: g,
        popoverDimensions: r,
        popoverPadding: w,
        popoverArrowDimensions: v
      });
      t.wrapper.style.right = `${b}px`, t.wrapper.style.top = `${P}px`, t.wrapper.style.bottom = "auto", t.wrapper.style.left = "auto", S = "right";
    } else if (a) {
      const b = Math.min(
        y,
        window.innerHeight - r.realHeight - v.width
      );
      let P = G(n, {
        elementDimensions: g,
        popoverDimensions: r,
        popoverPadding: w,
        popoverArrowDimensions: v
      });
      t.wrapper.style.top = `${b}px`, t.wrapper.style.left = `${P}px`, t.wrapper.style.bottom = "auto", t.wrapper.style.right = "auto", S = "top";
    } else if (c) {
      const b = Math.min(
        p,
        window.innerHeight - (r == null ? void 0 : r.realHeight) - v.width
      );
      let P = G(n, {
        elementDimensions: g,
        popoverDimensions: r,
        popoverPadding: w,
        popoverArrowDimensions: v
      });
      t.wrapper.style.left = `${P}px`, t.wrapper.style.bottom = `${b}px`, t.wrapper.style.top = "auto", t.wrapper.style.right = "auto", S = "bottom";
    }
    C ? t.arrow.classList.add("driver-popover-arrow-none") : Ee(n, S, e);
  }
  function Ee(e, o, t) {
    const i = l("popover");
    if (!i)
      return;
    const d = t.getBoundingClientRect(), n = se(), f = i.arrow, w = n.width, r = window.innerWidth, v = d.width, g = d.left, y = n.height, a = window.innerHeight, p = d.top, c = d.height;
    f.className = "driver-popover-arrow";
    let u = o, h = e;
    if (o === "top" ? (g + v <= 0 ? (u = "right", h = "end") : g + v - w <= 0 && (u = "top", h = "start"), g >= r ? (u = "left", h = "end") : g + w >= r && (u = "top", h = "end")) : o === "bottom" ? (g + v <= 0 ? (u = "right", h = "start") : g + v - w <= 0 && (u = "bottom", h = "start"), g >= r ? (u = "left", h = "start") : g + w >= r && (u = "bottom", h = "end")) : o === "left" ? (p + c <= 0 ? (u = "bottom", h = "end") : p + c - y <= 0 && (u = "left", h = "start"), p >= a ? (u = "top", h = "end") : p + y >= a && (u = "left", h = "end")) : o === "right" && (p + c <= 0 ? (u = "bottom", h = "start") : p + c - y <= 0 && (u = "right", h = "start"), p >= a ? (u = "top", h = "start") : p + y >= a && (u = "right", h = "end")), !u)
      f.classList.add("driver-popover-arrow-none");
    else {
      f.classList.add(`driver-popover-arrow-side-${u}`), f.classList.add(`driver-popover-arrow-align-${h}`);
      const m = t.getBoundingClientRect(), x = f.getBoundingClientRect(), C = s("stagePadding") || 0, S = m.left - C < window.innerWidth && m.right + C > 0 && m.top - C < window.innerHeight && m.bottom + C > 0;
      o === "bottom" && S && (x.x > m.x && x.x + x.width < m.x + m.width ? i.wrapper.style.transform = "translateY(0)" : (f.classList.remove(`driver-popover-arrow-align-${h}`), f.classList.add("driver-popover-arrow-none"), i.wrapper.style.transform = `translateY(-${C / 2}px)`));
    }
  }
  function Le() {
    const e = document.createElement("div");
    e.classList.add("driver-popover");
    const o = document.createElement("div");
    o.classList.add("driver-popover-arrow");
    const t = document.createElement("header");
    t.id = "driver-popover-title", t.classList.add("driver-popover-title"), t.style.display = "none", t.innerText = "Popover Title";
    const i = document.createElement("div");
    i.id = "driver-popover-description", i.classList.add("driver-popover-description"), i.style.display = "none", i.innerText = "Popover description is here";
    const d = document.createElement("button");
    d.type = "button", d.classList.add("driver-popover-close-btn"), d.setAttribute("aria-label", "Close"), d.innerHTML = "&times;";
    const n = document.createElement("footer");
    n.classList.add("driver-popover-footer");
    const f = document.createElement("span");
    f.classList.add("driver-popover-progress-text"), f.innerText = "";
    const w = document.createElement("span");
    w.classList.add("driver-popover-navigation-btns");
    const r = document.createElement("button");
    r.type = "button", r.classList.add("driver-popover-prev-btn"), r.innerHTML = "&larr; Previous";
    const v = document.createElement("button");
    return v.type = "button", v.classList.add("driver-popover-next-btn"), v.innerHTML = "Next &rarr;", w.appendChild(r), w.appendChild(v), n.appendChild(f), n.appendChild(w), e.appendChild(d), e.appendChild(o), e.appendChild(t), e.appendChild(i), e.appendChild(n), {
      wrapper: e,
      arrow: o,
      title: t,
      description: i,
      footer: n,
      previousButton: r,
      nextButton: v,
      closeButton: d,
      footerButtons: w,
      progress: f
    };
  }
  function Te() {
    var o;
    const e = l("popover");
    e && ((o = e.wrapper.parentElement) == null || o.removeChild(e.wrapper));
  }
  function Ae(e = {}) {
    F(e);
    function o() {
      s("allowClose") && g();
    }
    function t() {
      const a = s("overlayClickBehavior");
      if (s("allowClose") && a === "close") {
        g();
        return;
      }
      a === "nextStep" && i();
    }
    function i() {
      const a = l("activeIndex"), p = s("steps") || [];
      if (typeof a == "undefined")
        return;
      const c = a + 1;
      p[c] ? v(c) : g();
    }
    function d() {
      const a = l("activeIndex"), p = s("steps") || [];
      if (typeof a == "undefined")
        return;
      const c = a - 1;
      p[c] ? v(c) : g();
    }
    function n(a) {
      (s("steps") || [])[a] ? v(a) : g();
    }
    function f() {
      var x;
      if (l("__transitionCallback"))
        return;
      const p = l("activeIndex"), c = l("__activeStep"), u = l("__activeElement");
      if (typeof p == "undefined" || typeof c == "undefined" || typeof l("activeIndex") == "undefined")
        return;
      const m = ((x = c.popover) == null ? void 0 : x.onPrevClick) || s("onPrevClick");
      if (m)
        return m(u, c, {
          config: s(),
          state: l(),
          driver: _()
        });
      d();
    }
    function w() {
      var m;
      if (l("__transitionCallback"))
        return;
      const p = l("activeIndex"), c = l("__activeStep"), u = l("__activeElement");
      if (typeof p == "undefined" || typeof c == "undefined")
        return;
      const h = ((m = c.popover) == null ? void 0 : m.onNextClick) || s("onNextClick");
      if (h)
        return h(u, c, {
          config: s(),
          state: l(),
          driver: _()
        });
      i();
    }
    function r() {
      l("isInitialized") || (k("isInitialized", true), document.body.classList.add("driver-active", s("animate") ? "driver-fade" : "driver-simple"), ke(), N("overlayClick", t), N("escapePress", o), N("arrowLeftPress", f), N("arrowRightPress", w));
    }
    function v(a = 0) {
      var $, B, R, W, V, q, K, Y;
      const p = s("steps");
      if (!p) {
        console.error("No steps to drive through"), g();
        return;
      }
      if (!p[a]) {
        g();
        return;
      }
      k("__activeOnDestroyed", document.activeElement), k("activeIndex", a);
      const c = p[a], u = p[a + 1], h = p[a - 1], m = (($ = c.popover) == null ? void 0 : $.doneBtnText) || s("doneBtnText") || "Done", x = s("allowClose"), C = typeof ((B = c.popover) == null ? void 0 : B.showProgress) != "undefined" ? (R = c.popover) == null ? void 0 : R.showProgress : s("showProgress"), b = (((W = c.popover) == null ? void 0 : W.progressText) || s("progressText") || "{{current}} of {{total}}").replace("{{current}}", `${a + 1}`).replace("{{total}}", `${p.length}`), P = ((V = c.popover) == null ? void 0 : V.showButtons) || s("showButtons"), E = [
        "next",
        "previous",
        ...x ? ["close"] : []
      ].filter((ce) => !(P != null && P.length) || P.includes(ce)), T = ((q = c.popover) == null ? void 0 : q.onNextClick) || s("onNextClick"), A = ((K = c.popover) == null ? void 0 : K.onPrevClick) || s("onPrevClick"), H = ((Y = c.popover) == null ? void 0 : Y.onCloseClick) || s("onCloseClick");
      j({
        ...c,
        popover: {
          showButtons: E,
          nextBtnText: u ? void 0 : m,
          disableButtons: [...h ? [] : ["previous"]],
          showProgress: C,
          progressText: b,
          onNextClick: T || (() => {
            u ? v(a + 1) : g();
          }),
          onPrevClick: A || (() => {
            v(a - 1);
          }),
          onCloseClick: H || (() => {
            g();
          }),
          ...(c == null ? void 0 : c.popover) || {}
        }
      });
    }
    function g(a = true) {
      const p = l("__activeElement"), c = l("__activeStep"), u = l("__activeOnDestroyed"), h = s("onDestroyStarted");
      if (a && h) {
        const C = !p || (p == null ? void 0 : p.id) === "driver-dummy-element";
        h(C ? void 0 : p, c, {
          config: s(),
          state: l(),
          driver: _()
        });
        return;
      }
      const m = (c == null ? void 0 : c.onDeselected) || s("onDeselected"), x = s("onDestroyed");
      if (document.body.classList.remove("driver-active", "driver-fade", "driver-simple"), Se(), Te(), Ce(), me(), de(), X(), p && c) {
        const C = p.id === "driver-dummy-element";
        m && m(C ? void 0 : p, c, {
          config: s(),
          state: l(),
          driver: _()
        }), x && x(C ? void 0 : p, c, {
          config: s(),
          state: l(),
          driver: _()
        });
      }
      u && u.focus();
    }
    const y = {
      isActive: () => l("isInitialized") || false,
      refresh: M,
      drive: (a = 0) => {
        r(), v(a);
      },
      setConfig: F,
      setSteps: (a) => {
        X(), F({
          ...s(),
          steps: a
        });
      },
      getConfig: s,
      getState: l,
      getActiveIndex: () => l("activeIndex"),
      isFirstStep: () => l("activeIndex") === 0,
      isLastStep: () => {
        const a = s("steps") || [], p = l("activeIndex");
        return p !== void 0 && p === a.length - 1;
      },
      getActiveStep: () => l("activeStep"),
      getActiveElement: () => l("activeElement"),
      getPreviousElement: () => l("previousElement"),
      getPreviousStep: () => l("previousStep"),
      moveNext: i,
      movePrevious: d,
      moveTo: n,
      hasNextStep: () => {
        const a = s("steps") || [], p = l("activeIndex");
        return p !== void 0 && !!a[p + 1];
      },
      hasPreviousStep: () => {
        const a = s("steps") || [], p = l("activeIndex");
        return p !== void 0 && !!a[p - 1];
      },
      highlight: (a) => {
        r(), j({
          ...a,
          popover: a.popover ? {
            showButtons: [],
            showProgress: false,
            progressText: "",
            ...a.popover
          } : void 0
        });
      },
      destroy: () => {
        g(false);
      }
    };
    return le(y), y;
  }

  var css_248z$5 = ".driver-active *,.driver-active .driver-overlay{pointer-events:none}.driver-active .driver-active-element,.driver-active .driver-active-element *,.driver-popover,.driver-popover *{pointer-events:auto}@keyframes animate-fade-in{0%{opacity:0}to{opacity:1}}.driver-fade .driver-overlay{animation:animate-fade-in .2s ease-in-out}.driver-fade .driver-popover{animation:animate-fade-in .2s}.driver-popover{all:unset;background-color:#fff;border-radius:5px;box-shadow:0 1px 10px #0006;box-sizing:border-box;color:#2d2d2d;margin:0;max-width:300px;min-width:250px;padding:15px;position:fixed;right:0;top:0;z-index:1000000000}.driver-popover *{font-family:Helvetica Neue,Inter,ui-sans-serif,Apple Color Emoji,Helvetica,Arial,sans-serif}.driver-popover-title{zoom:1;display:block;font:19px/normal sans-serif;font-weight:700;line-height:1.5;margin:0;position:relative}.driver-popover-close-btn{all:unset;color:#d2d2d2;cursor:pointer;font-size:18px;font-weight:500;height:28px;position:absolute;right:0;text-align:center;top:0;transition:color;transition-duration:.2s;width:32px;z-index:1}.driver-popover-close-btn:focus,.driver-popover-close-btn:hover{color:#2d2d2d}.driver-popover-title[style*=block]+.driver-popover-description{margin-top:5px}.driver-popover-description{zoom:1;font:14px/normal sans-serif;font-weight:400;line-height:1.5;margin-bottom:0}.driver-popover-footer{zoom:1;align-items:center;display:flex;justify-content:space-between;margin-top:15px;text-align:right}.driver-popover-progress-text{zoom:1;color:#727272;font-size:13px;font-weight:400}.driver-popover-footer button{zoom:1;all:unset;background-color:#fff;border:1px solid #ccc;border-radius:3px;box-sizing:border-box;color:#2d2d2d;cursor:pointer;display:inline-block;font:12px/normal sans-serif;line-height:1.3;outline:0;padding:3px 7px;text-decoration:none;text-shadow:1px 1px 0 #fff}.driver-popover-footer .driver-popover-btn-disabled{opacity:.5;pointer-events:none}:not(body):has(>.driver-active-element){overflow:hidden!important}.driver-no-interaction,.driver-no-interaction *{pointer-events:none!important}.driver-popover-footer button:focus,.driver-popover-footer button:hover{background-color:#f7f7f7}.driver-popover-navigation-btns{display:flex;flex-grow:1;justify-content:flex-end}.driver-popover-navigation-btns button+button{margin-left:4px}.driver-popover-arrow{border:5px solid #fff;content:\"\";position:absolute}.driver-popover-arrow-side-over{display:none}.driver-popover-arrow-side-left{border-bottom-color:transparent;border-right-color:transparent;border-top-color:transparent;left:100%}.driver-popover-arrow-side-right{border-bottom-color:transparent;border-left-color:transparent;border-top-color:transparent;right:100%}.driver-popover-arrow-side-top{border-bottom-color:transparent;border-left-color:transparent;border-right-color:transparent;top:100%}.driver-popover-arrow-side-bottom{border-left-color:transparent;border-right-color:transparent;border-top-color:transparent;bottom:100%}.driver-popover-arrow-side-center{display:none}.driver-popover-arrow-side-left.driver-popover-arrow-align-start,.driver-popover-arrow-side-right.driver-popover-arrow-align-start{top:15px}.driver-popover-arrow-side-bottom.driver-popover-arrow-align-start,.driver-popover-arrow-side-top.driver-popover-arrow-align-start{left:15px}.driver-popover-arrow-align-end.driver-popover-arrow-side-left,.driver-popover-arrow-align-end.driver-popover-arrow-side-right{bottom:15px}.driver-popover-arrow-side-bottom.driver-popover-arrow-align-end,.driver-popover-arrow-side-top.driver-popover-arrow-align-end{right:15px}.driver-popover-arrow-side-left.driver-popover-arrow-align-center,.driver-popover-arrow-side-right.driver-popover-arrow-align-center{margin-top:-5px;top:50%}.driver-popover-arrow-side-bottom.driver-popover-arrow-align-center,.driver-popover-arrow-side-top.driver-popover-arrow-align-center{left:50%;margin-left:-5px}.driver-popover-arrow-none{display:none}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRyaXZlci5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsZ0RBQWdELG1CQUFtQixDQUFDLGdIQUFnSCxtQkFBbUIsQ0FBQywyQkFBMkIsR0FBRyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyw2QkFBNkIseUNBQXlDLENBQUMsNkJBQTZCLDZCQUE2QixDQUFDLGdCQUFnQixTQUFTLENBQXlMLHFCQUFvQixDQUFsSixpQkFBaUIsQ0FBaUMsMkJBQTJCLENBQXZJLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQWdELGVBQWUsQ0FBL0IsZUFBZSxDQUE5QyxZQUFZLENBQWtHLGNBQWMsQ0FBTyxPQUFPLENBQWIsS0FBSyxDQUF2QyxrQkFBcUUsQ0FBQyxrQkFBa0IsMkZBQTZGLENBQUMsc0JBQWtILE1BQU0sQ0FBdEQsYUFBYSxDQUF6RCwyQkFBMkIsQ0FBQyxlQUFlLENBQWlDLGVBQWUsQ0FBUSxRQUFPLENBQWhELGlCQUFpRCxDQUFDLDBCQUEwQixTQUFTLENBQXNHLGFBQWEsQ0FBM0QsY0FBYyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQXpELFdBQVcsQ0FBdEQsaUJBQWlCLENBQU8sT0FBTyxDQUE4RixpQkFBaUIsQ0FBNUgsS0FBSyxDQUF3SCxnQkFBZ0IsQ0FBQyx1QkFBc0IsQ0FBdEosVUFBVSxDQUF5RSxTQUFvRSxDQUFDLGdFQUFnRSxhQUFhLENBQUMsZ0VBQWdFLGNBQWMsQ0FBQyw0QkFBd0csTUFBSyxDQUFqRSwyQkFBMkIsQ0FBaUIsZUFBZSxDQUEvQixlQUFlLENBQTNELGVBQWtGLENBQUMsdUJBQXdELE1BQU0sQ0FBYyxrQkFBa0IsQ0FBL0IsWUFBWSxDQUFvQiw2QkFBNEIsQ0FBcEcsZUFBZSxDQUFDLGdCQUFxRixDQUFDLDhCQUEyRSxNQUFLLENBQW5CLGFBQWEsQ0FBNUMsY0FBYyxDQUFDLGVBQW9DLENBQUMsOEJBQTRPLE1BQU0sQ0FBcE4sU0FBUyxDQUE0RyxxQkFBcUIsQ0FBMkYscUJBQXFCLENBQUMsaUJBQWdCLENBQTVPLHFCQUFxQixDQUF1RixhQUFhLENBQTZCLGNBQWMsQ0FBekwsb0JBQW9CLENBQTJILDJCQUEyQixDQUFpQyxlQUFlLENBQWhDLFNBQVMsQ0FBeEosZUFBZSxDQUFDLG9CQUFvQixDQUFDLDBCQUFrTCxDQUFDLG9EQUFvRCxVQUFVLENBQUMsbUJBQW1CLENBQUMsd0NBQXdDLHlCQUF5QixDQUFDLGdEQUFnRCw2QkFBNkIsQ0FBQyx3RUFBd0Usd0JBQXdCLENBQUMsZ0NBQWdDLFlBQVksQ0FBQyxXQUFXLENBQUMsd0JBQXdCLENBQUMsOENBQThDLGVBQWUsQ0FBQyxzQkFBbUQscUJBQW9CLENBQWpELFVBQVUsQ0FBQyxpQkFBdUMsQ0FBQyxnQ0FBZ0MsWUFBWSxDQUFDLGdDQUF5RSwrQkFBK0IsQ0FBOUQsOEJBQThCLENBQWlDLDRCQUEyQixDQUFwRyxTQUFxRyxDQUFDLGlDQUEwRSwrQkFBK0IsQ0FBN0QsNkJBQTZCLENBQWlDLDRCQUEyQixDQUFwRyxVQUFxRyxDQUFDLCtCQUF1RSwrQkFBK0IsQ0FBQyw2QkFBNEIsQ0FBM0YsOEJBQThCLENBQXZDLFFBQXFHLENBQUMsa0NBQThDLDZCQUE2QixDQUE4Qiw4QkFBNkIsQ0FBMUQsNEJBQTRCLENBQXRFLFdBQXFHLENBQUMsa0NBQWtDLFlBQVksQ0FBQyxtSUFBbUksUUFBUSxDQUFDLG1JQUFtSSxTQUFTLENBQUMsK0hBQStILFdBQVcsQ0FBQywrSEFBK0gsVUFBVSxDQUFDLHFJQUE2SSxlQUFjLENBQXRCLE9BQXVCLENBQUMscUlBQXFJLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQywyQkFBMkIsWUFBWSIsImZpbGUiOiJkcml2ZXIuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmRyaXZlci1hY3RpdmUgLmRyaXZlci1vdmVybGF5LC5kcml2ZXItYWN0aXZlICp7cG9pbnRlci1ldmVudHM6bm9uZX0uZHJpdmVyLWFjdGl2ZSAuZHJpdmVyLWFjdGl2ZS1lbGVtZW50LC5kcml2ZXItYWN0aXZlIC5kcml2ZXItYWN0aXZlLWVsZW1lbnQgKiwuZHJpdmVyLXBvcG92ZXIsLmRyaXZlci1wb3BvdmVyICp7cG9pbnRlci1ldmVudHM6YXV0b31Aa2V5ZnJhbWVzIGFuaW1hdGUtZmFkZS1pbnswJXtvcGFjaXR5OjB9dG97b3BhY2l0eToxfX0uZHJpdmVyLWZhZGUgLmRyaXZlci1vdmVybGF5e2FuaW1hdGlvbjphbmltYXRlLWZhZGUtaW4gLjJzIGVhc2UtaW4tb3V0fS5kcml2ZXItZmFkZSAuZHJpdmVyLXBvcG92ZXJ7YW5pbWF0aW9uOmFuaW1hdGUtZmFkZS1pbiAuMnN9LmRyaXZlci1wb3BvdmVye2FsbDp1bnNldDtib3gtc2l6aW5nOmJvcmRlci1ib3g7Y29sb3I6IzJkMmQyZDttYXJnaW46MDtwYWRkaW5nOjE1cHg7Ym9yZGVyLXJhZGl1czo1cHg7bWluLXdpZHRoOjI1MHB4O21heC13aWR0aDozMDBweDtib3gtc2hhZG93OjAgMXB4IDEwcHggIzAwMDY7ei1pbmRleDoxMDAwMDAwMDAwO3Bvc2l0aW9uOmZpeGVkO3RvcDowO3JpZ2h0OjA7YmFja2dyb3VuZC1jb2xvcjojZmZmfS5kcml2ZXItcG9wb3ZlciAqe2ZvbnQtZmFtaWx5OkhlbHZldGljYSBOZXVlLEludGVyLHVpLXNhbnMtc2VyaWYsXCJBcHBsZSBDb2xvciBFbW9qaVwiLEhlbHZldGljYSxBcmlhbCxzYW5zLXNlcmlmfS5kcml2ZXItcG9wb3Zlci10aXRsZXtmb250OjE5cHgvbm9ybWFsIHNhbnMtc2VyaWY7Zm9udC13ZWlnaHQ6NzAwO2Rpc3BsYXk6YmxvY2s7cG9zaXRpb246cmVsYXRpdmU7bGluZS1oZWlnaHQ6MS41O3pvb206MTttYXJnaW46MH0uZHJpdmVyLXBvcG92ZXItY2xvc2UtYnRue2FsbDp1bnNldDtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtyaWdodDowO3dpZHRoOjMycHg7aGVpZ2h0OjI4cHg7Y3Vyc29yOnBvaW50ZXI7Zm9udC1zaXplOjE4cHg7Zm9udC13ZWlnaHQ6NTAwO2NvbG9yOiNkMmQyZDI7ei1pbmRleDoxO3RleHQtYWxpZ246Y2VudGVyO3RyYW5zaXRpb246Y29sb3I7dHJhbnNpdGlvbi1kdXJhdGlvbjouMnN9LmRyaXZlci1wb3BvdmVyLWNsb3NlLWJ0bjpob3ZlciwuZHJpdmVyLXBvcG92ZXItY2xvc2UtYnRuOmZvY3Vze2NvbG9yOiMyZDJkMmR9LmRyaXZlci1wb3BvdmVyLXRpdGxlW3N0eWxlKj1ibG9ja10rLmRyaXZlci1wb3BvdmVyLWRlc2NyaXB0aW9ue21hcmdpbi10b3A6NXB4fS5kcml2ZXItcG9wb3Zlci1kZXNjcmlwdGlvbnttYXJnaW4tYm90dG9tOjA7Zm9udDoxNHB4L25vcm1hbCBzYW5zLXNlcmlmO2xpbmUtaGVpZ2h0OjEuNTtmb250LXdlaWdodDo0MDA7em9vbToxfS5kcml2ZXItcG9wb3Zlci1mb290ZXJ7bWFyZ2luLXRvcDoxNXB4O3RleHQtYWxpZ246cmlnaHQ7em9vbToxO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW59LmRyaXZlci1wb3BvdmVyLXByb2dyZXNzLXRleHR7Zm9udC1zaXplOjEzcHg7Zm9udC13ZWlnaHQ6NDAwO2NvbG9yOiM3MjcyNzI7em9vbToxfS5kcml2ZXItcG9wb3Zlci1mb290ZXIgYnV0dG9ue2FsbDp1bnNldDtkaXNwbGF5OmlubGluZS1ibG9jaztib3gtc2l6aW5nOmJvcmRlci1ib3g7cGFkZGluZzozcHggN3B4O3RleHQtZGVjb3JhdGlvbjpub25lO3RleHQtc2hhZG93OjFweCAxcHggMCAjZmZmO2JhY2tncm91bmQtY29sb3I6I2ZmZjtjb2xvcjojMmQyZDJkO2ZvbnQ6MTJweC9ub3JtYWwgc2Fucy1zZXJpZjtjdXJzb3I6cG9pbnRlcjtvdXRsaW5lOjA7em9vbToxO2xpbmUtaGVpZ2h0OjEuMztib3JkZXI6MXB4IHNvbGlkICNjY2M7Ym9yZGVyLXJhZGl1czozcHh9LmRyaXZlci1wb3BvdmVyLWZvb3RlciAuZHJpdmVyLXBvcG92ZXItYnRuLWRpc2FibGVke29wYWNpdHk6LjU7cG9pbnRlci1ldmVudHM6bm9uZX06bm90KGJvZHkpOmhhcyg+LmRyaXZlci1hY3RpdmUtZWxlbWVudCl7b3ZlcmZsb3c6aGlkZGVuIWltcG9ydGFudH0uZHJpdmVyLW5vLWludGVyYWN0aW9uLC5kcml2ZXItbm8taW50ZXJhY3Rpb24gKntwb2ludGVyLWV2ZW50czpub25lIWltcG9ydGFudH0uZHJpdmVyLXBvcG92ZXItZm9vdGVyIGJ1dHRvbjpob3ZlciwuZHJpdmVyLXBvcG92ZXItZm9vdGVyIGJ1dHRvbjpmb2N1c3tiYWNrZ3JvdW5kLWNvbG9yOiNmN2Y3Zjd9LmRyaXZlci1wb3BvdmVyLW5hdmlnYXRpb24tYnRuc3tkaXNwbGF5OmZsZXg7ZmxleC1ncm93OjE7anVzdGlmeS1jb250ZW50OmZsZXgtZW5kfS5kcml2ZXItcG9wb3Zlci1uYXZpZ2F0aW9uLWJ0bnMgYnV0dG9uK2J1dHRvbnttYXJnaW4tbGVmdDo0cHh9LmRyaXZlci1wb3BvdmVyLWFycm93e2NvbnRlbnQ6XCJcIjtwb3NpdGlvbjphYnNvbHV0ZTtib3JkZXI6NXB4IHNvbGlkICNmZmZ9LmRyaXZlci1wb3BvdmVyLWFycm93LXNpZGUtb3ZlcntkaXNwbGF5Om5vbmV9LmRyaXZlci1wb3BvdmVyLWFycm93LXNpZGUtbGVmdHtsZWZ0OjEwMCU7Ym9yZGVyLXJpZ2h0LWNvbG9yOnRyYW5zcGFyZW50O2JvcmRlci1ib3R0b20tY29sb3I6dHJhbnNwYXJlbnQ7Ym9yZGVyLXRvcC1jb2xvcjp0cmFuc3BhcmVudH0uZHJpdmVyLXBvcG92ZXItYXJyb3ctc2lkZS1yaWdodHtyaWdodDoxMDAlO2JvcmRlci1sZWZ0LWNvbG9yOnRyYW5zcGFyZW50O2JvcmRlci1ib3R0b20tY29sb3I6dHJhbnNwYXJlbnQ7Ym9yZGVyLXRvcC1jb2xvcjp0cmFuc3BhcmVudH0uZHJpdmVyLXBvcG92ZXItYXJyb3ctc2lkZS10b3B7dG9wOjEwMCU7Ym9yZGVyLXJpZ2h0LWNvbG9yOnRyYW5zcGFyZW50O2JvcmRlci1ib3R0b20tY29sb3I6dHJhbnNwYXJlbnQ7Ym9yZGVyLWxlZnQtY29sb3I6dHJhbnNwYXJlbnR9LmRyaXZlci1wb3BvdmVyLWFycm93LXNpZGUtYm90dG9te2JvdHRvbToxMDAlO2JvcmRlci1sZWZ0LWNvbG9yOnRyYW5zcGFyZW50O2JvcmRlci10b3AtY29sb3I6dHJhbnNwYXJlbnQ7Ym9yZGVyLXJpZ2h0LWNvbG9yOnRyYW5zcGFyZW50fS5kcml2ZXItcG9wb3Zlci1hcnJvdy1zaWRlLWNlbnRlcntkaXNwbGF5Om5vbmV9LmRyaXZlci1wb3BvdmVyLWFycm93LXNpZGUtbGVmdC5kcml2ZXItcG9wb3Zlci1hcnJvdy1hbGlnbi1zdGFydCwuZHJpdmVyLXBvcG92ZXItYXJyb3ctc2lkZS1yaWdodC5kcml2ZXItcG9wb3Zlci1hcnJvdy1hbGlnbi1zdGFydHt0b3A6MTVweH0uZHJpdmVyLXBvcG92ZXItYXJyb3ctc2lkZS10b3AuZHJpdmVyLXBvcG92ZXItYXJyb3ctYWxpZ24tc3RhcnQsLmRyaXZlci1wb3BvdmVyLWFycm93LXNpZGUtYm90dG9tLmRyaXZlci1wb3BvdmVyLWFycm93LWFsaWduLXN0YXJ0e2xlZnQ6MTVweH0uZHJpdmVyLXBvcG92ZXItYXJyb3ctYWxpZ24tZW5kLmRyaXZlci1wb3BvdmVyLWFycm93LXNpZGUtbGVmdCwuZHJpdmVyLXBvcG92ZXItYXJyb3ctYWxpZ24tZW5kLmRyaXZlci1wb3BvdmVyLWFycm93LXNpZGUtcmlnaHR7Ym90dG9tOjE1cHh9LmRyaXZlci1wb3BvdmVyLWFycm93LXNpZGUtdG9wLmRyaXZlci1wb3BvdmVyLWFycm93LWFsaWduLWVuZCwuZHJpdmVyLXBvcG92ZXItYXJyb3ctc2lkZS1ib3R0b20uZHJpdmVyLXBvcG92ZXItYXJyb3ctYWxpZ24tZW5ke3JpZ2h0OjE1cHh9LmRyaXZlci1wb3BvdmVyLWFycm93LXNpZGUtbGVmdC5kcml2ZXItcG9wb3Zlci1hcnJvdy1hbGlnbi1jZW50ZXIsLmRyaXZlci1wb3BvdmVyLWFycm93LXNpZGUtcmlnaHQuZHJpdmVyLXBvcG92ZXItYXJyb3ctYWxpZ24tY2VudGVye3RvcDo1MCU7bWFyZ2luLXRvcDotNXB4fS5kcml2ZXItcG9wb3Zlci1hcnJvdy1zaWRlLXRvcC5kcml2ZXItcG9wb3Zlci1hcnJvdy1hbGlnbi1jZW50ZXIsLmRyaXZlci1wb3BvdmVyLWFycm93LXNpZGUtYm90dG9tLmRyaXZlci1wb3BvdmVyLWFycm93LWFsaWduLWNlbnRlcntsZWZ0OjUwJTttYXJnaW4tbGVmdDotNXB4fS5kcml2ZXItcG9wb3Zlci1hcnJvdy1ub25le2Rpc3BsYXk6bm9uZX1cbiJdfQ== */";
  styleInject(css_248z$5);

  /**!
   * Sortable 1.15.6
   * @author	RubaXa   <trash@rubaxa.org>
   * @author	owenm    <owen23355@gmail.com>
   * @license MIT
   */
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) {
        symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      }
      keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }
    return target;
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }
    return _typeof(obj);
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends.apply(this, arguments);
  }
  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }
    return target;
  }
  function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
        target[key] = source[key];
      }
    }
    return target;
  }

  var version = "1.15.6";

  function userAgent(pattern) {
    if (typeof window !== 'undefined' && window.navigator) {
      return !! /*@__PURE__*/navigator.userAgent.match(pattern);
    }
  }
  var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
  var Edge = userAgent(/Edge/i);
  var FireFox = userAgent(/firefox/i);
  var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
  var IOS = userAgent(/iP(ad|od|hone)/i);
  var ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);

  var captureMode = {
    capture: false,
    passive: false
  };
  function on(el, event, fn) {
    el.addEventListener(event, fn, !IE11OrLess && captureMode);
  }
  function off(el, event, fn) {
    el.removeEventListener(event, fn, !IE11OrLess && captureMode);
  }
  function matches( /**HTMLElement*/el, /**String*/selector) {
    if (!selector) return;
    selector[0] === '>' && (selector = selector.substring(1));
    if (el) {
      try {
        if (el.matches) {
          return el.matches(selector);
        } else if (el.msMatchesSelector) {
          return el.msMatchesSelector(selector);
        } else if (el.webkitMatchesSelector) {
          return el.webkitMatchesSelector(selector);
        }
      } catch (_) {
        return false;
      }
    }
    return false;
  }
  function getParentOrHost(el) {
    return el.host && el !== document && el.host.nodeType ? el.host : el.parentNode;
  }
  function closest( /**HTMLElement*/el, /**String*/selector, /**HTMLElement*/ctx, includeCTX) {
    if (el) {
      ctx = ctx || document;
      do {
        if (selector != null && (selector[0] === '>' ? el.parentNode === ctx && matches(el, selector) : matches(el, selector)) || includeCTX && el === ctx) {
          return el;
        }
        if (el === ctx) break;
        /* jshint boss:true */
      } while (el = getParentOrHost(el));
    }
    return null;
  }
  var R_SPACE = /\s+/g;
  function toggleClass(el, name, state) {
    if (el && name) {
      if (el.classList) {
        el.classList[state ? 'add' : 'remove'](name);
      } else {
        var className = (' ' + el.className + ' ').replace(R_SPACE, ' ').replace(' ' + name + ' ', ' ');
        el.className = (className + (state ? ' ' + name : '')).replace(R_SPACE, ' ');
      }
    }
  }
  function css(el, prop, val) {
    var style = el && el.style;
    if (style) {
      if (val === void 0) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
          val = document.defaultView.getComputedStyle(el, '');
        } else if (el.currentStyle) {
          val = el.currentStyle;
        }
        return prop === void 0 ? val : val[prop];
      } else {
        if (!(prop in style) && prop.indexOf('webkit') === -1) {
          prop = '-webkit-' + prop;
        }
        style[prop] = val + (typeof val === 'string' ? '' : 'px');
      }
    }
  }
  function matrix(el, selfOnly) {
    var appliedTransforms = '';
    if (typeof el === 'string') {
      appliedTransforms = el;
    } else {
      do {
        var transform = css(el, 'transform');
        if (transform && transform !== 'none') {
          appliedTransforms = transform + ' ' + appliedTransforms;
        }
        /* jshint boss:true */
      } while (!selfOnly && (el = el.parentNode));
    }
    var matrixFn = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
    /*jshint -W056 */
    return matrixFn && new matrixFn(appliedTransforms);
  }
  function find(ctx, tagName, iterator) {
    if (ctx) {
      var list = ctx.getElementsByTagName(tagName),
        i = 0,
        n = list.length;
      if (iterator) {
        for (; i < n; i++) {
          iterator(list[i], i);
        }
      }
      return list;
    }
    return [];
  }
  function getWindowScrollingElement() {
    var scrollingElement = document.scrollingElement;
    if (scrollingElement) {
      return scrollingElement;
    } else {
      return document.documentElement;
    }
  }

  /**
   * Returns the "bounding client rect" of given element
   * @param  {HTMLElement} el                       The element whose boundingClientRect is wanted
   * @param  {[Boolean]} relativeToContainingBlock  Whether the rect should be relative to the containing block of (including) the container
   * @param  {[Boolean]} relativeToNonStaticParent  Whether the rect should be relative to the relative parent of (including) the contaienr
   * @param  {[Boolean]} undoScale                  Whether the container's scale() should be undone
   * @param  {[HTMLElement]} container              The parent the element will be placed in
   * @return {Object}                               The boundingClientRect of el, with specified adjustments
   */
  function getRect(el, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
    if (!el.getBoundingClientRect && el !== window) return;
    var elRect, top, left, bottom, right, height, width;
    if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
      elRect = el.getBoundingClientRect();
      top = elRect.top;
      left = elRect.left;
      bottom = elRect.bottom;
      right = elRect.right;
      height = elRect.height;
      width = elRect.width;
    } else {
      top = 0;
      left = 0;
      bottom = window.innerHeight;
      right = window.innerWidth;
      height = window.innerHeight;
      width = window.innerWidth;
    }
    if ((relativeToContainingBlock || relativeToNonStaticParent) && el !== window) {
      // Adjust for translate()
      container = container || el.parentNode;

      // solves #1123 (see: https://stackoverflow.com/a/37953806/6088312)
      // Not needed on <= IE11
      if (!IE11OrLess) {
        do {
          if (container && container.getBoundingClientRect && (css(container, 'transform') !== 'none' || relativeToNonStaticParent && css(container, 'position') !== 'static')) {
            var containerRect = container.getBoundingClientRect();

            // Set relative to edges of padding box of container
            top -= containerRect.top + parseInt(css(container, 'border-top-width'));
            left -= containerRect.left + parseInt(css(container, 'border-left-width'));
            bottom = top + elRect.height;
            right = left + elRect.width;
            break;
          }
          /* jshint boss:true */
        } while (container = container.parentNode);
      }
    }
    if (undoScale && el !== window) {
      // Adjust for scale()
      var elMatrix = matrix(container || el),
        scaleX = elMatrix && elMatrix.a,
        scaleY = elMatrix && elMatrix.d;
      if (elMatrix) {
        top /= scaleY;
        left /= scaleX;
        width /= scaleX;
        height /= scaleY;
        bottom = top + height;
        right = left + width;
      }
    }
    return {
      top: top,
      left: left,
      bottom: bottom,
      right: right,
      width: width,
      height: height
    };
  }

  /**
   * Checks if a side of an element is scrolled past a side of its parents
   * @param  {HTMLElement}  el           The element who's side being scrolled out of view is in question
   * @param  {String}       elSide       Side of the element in question ('top', 'left', 'right', 'bottom')
   * @param  {String}       parentSide   Side of the parent in question ('top', 'left', 'right', 'bottom')
   * @return {HTMLElement}               The parent scroll element that the el's side is scrolled past, or null if there is no such element
   */
  function isScrolledPast(el, elSide, parentSide) {
    var parent = getParentAutoScrollElement(el, true),
      elSideVal = getRect(el)[elSide];

    /* jshint boss:true */
    while (parent) {
      var parentSideVal = getRect(parent)[parentSide],
        visible = void 0;
      {
        visible = elSideVal >= parentSideVal;
      }
      if (!visible) return parent;
      if (parent === getWindowScrollingElement()) break;
      parent = getParentAutoScrollElement(parent, false);
    }
    return false;
  }

  /**
   * Gets nth child of el, ignoring hidden children, sortable's elements (does not ignore clone if it's visible)
   * and non-draggable elements
   * @param  {HTMLElement} el       The parent element
   * @param  {Number} childNum      The index of the child
   * @param  {Object} options       Parent Sortable's options
   * @return {HTMLElement}          The child at index childNum, or null if not found
   */
  function getChild(el, childNum, options, includeDragEl) {
    var currentChild = 0,
      i = 0,
      children = el.children;
    while (i < children.length) {
      if (children[i].style.display !== 'none' && children[i] !== Sortable.ghost && (includeDragEl || children[i] !== Sortable.dragged) && closest(children[i], options.draggable, el, false)) {
        if (currentChild === childNum) {
          return children[i];
        }
        currentChild++;
      }
      i++;
    }
    return null;
  }

  /**
   * Gets the last child in the el, ignoring ghostEl or invisible elements (clones)
   * @param  {HTMLElement} el       Parent element
   * @param  {selector} selector    Any other elements that should be ignored
   * @return {HTMLElement}          The last child, ignoring ghostEl
   */
  function lastChild(el, selector) {
    var last = el.lastElementChild;
    while (last && (last === Sortable.ghost || css(last, 'display') === 'none' || selector && !matches(last, selector))) {
      last = last.previousElementSibling;
    }
    return last || null;
  }

  /**
   * Returns the index of an element within its parent for a selected set of
   * elements
   * @param  {HTMLElement} el
   * @param  {selector} selector
   * @return {number}
   */
  function index$1(el, selector) {
    var index = 0;
    if (!el || !el.parentNode) {
      return -1;
    }

    /* jshint boss:true */
    while (el = el.previousElementSibling) {
      if (el.nodeName.toUpperCase() !== 'TEMPLATE' && el !== Sortable.clone && (!selector || matches(el, selector))) {
        index++;
      }
    }
    return index;
  }

  /**
   * Returns the scroll offset of the given element, added with all the scroll offsets of parent elements.
   * The value is returned in real pixels.
   * @param  {HTMLElement} el
   * @return {Array}             Offsets in the format of [left, top]
   */
  function getRelativeScrollOffset(el) {
    var offsetLeft = 0,
      offsetTop = 0,
      winScroller = getWindowScrollingElement();
    if (el) {
      do {
        var elMatrix = matrix(el),
          scaleX = elMatrix.a,
          scaleY = elMatrix.d;
        offsetLeft += el.scrollLeft * scaleX;
        offsetTop += el.scrollTop * scaleY;
      } while (el !== winScroller && (el = el.parentNode));
    }
    return [offsetLeft, offsetTop];
  }

  /**
   * Returns the index of the object within the given array
   * @param  {Array} arr   Array that may or may not hold the object
   * @param  {Object} obj  An object that has a key-value pair unique to and identical to a key-value pair in the object you want to find
   * @return {Number}      The index of the object in the array, or -1
   */
  function indexOfObject(arr, obj) {
    for (var i in arr) {
      if (!arr.hasOwnProperty(i)) continue;
      for (var key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] === arr[i][key]) return Number(i);
      }
    }
    return -1;
  }
  function getParentAutoScrollElement(el, includeSelf) {
    // skip to window
    if (!el || !el.getBoundingClientRect) return getWindowScrollingElement();
    var elem = el;
    var gotSelf = false;
    do {
      // we don't need to get elem css if it isn't even overflowing in the first place (performance)
      if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
        var elemCSS = css(elem);
        if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == 'auto' || elemCSS.overflowX == 'scroll') || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == 'auto' || elemCSS.overflowY == 'scroll')) {
          if (!elem.getBoundingClientRect || elem === document.body) return getWindowScrollingElement();
          if (gotSelf || includeSelf) return elem;
          gotSelf = true;
        }
      }
      /* jshint boss:true */
    } while (elem = elem.parentNode);
    return getWindowScrollingElement();
  }
  function extend(dst, src) {
    if (dst && src) {
      for (var key in src) {
        if (src.hasOwnProperty(key)) {
          dst[key] = src[key];
        }
      }
    }
    return dst;
  }
  function isRectEqual(rect1, rect2) {
    return Math.round(rect1.top) === Math.round(rect2.top) && Math.round(rect1.left) === Math.round(rect2.left) && Math.round(rect1.height) === Math.round(rect2.height) && Math.round(rect1.width) === Math.round(rect2.width);
  }
  var _throttleTimeout;
  function throttle(callback, ms) {
    return function () {
      if (!_throttleTimeout) {
        var args = arguments,
          _this = this;
        if (args.length === 1) {
          callback.call(_this, args[0]);
        } else {
          callback.apply(_this, args);
        }
        _throttleTimeout = setTimeout(function () {
          _throttleTimeout = void 0;
        }, ms);
      }
    };
  }
  function cancelThrottle() {
    clearTimeout(_throttleTimeout);
    _throttleTimeout = void 0;
  }
  function scrollBy(el, x, y) {
    el.scrollLeft += x;
    el.scrollTop += y;
  }
  function clone(el) {
    var Polymer = window.Polymer;
    var $ = window.jQuery || window.Zepto;
    if (Polymer && Polymer.dom) {
      return Polymer.dom(el).cloneNode(true);
    } else if ($) {
      return $(el).clone(true)[0];
    } else {
      return el.cloneNode(true);
    }
  }
  function getChildContainingRectFromElement(container, options, ghostEl) {
    var rect = {};
    Array.from(container.children).forEach(function (child) {
      var _rect$left, _rect$top, _rect$right, _rect$bottom;
      if (!closest(child, options.draggable, container, false) || child.animated || child === ghostEl) return;
      var childRect = getRect(child);
      rect.left = Math.min((_rect$left = rect.left) !== null && _rect$left !== void 0 ? _rect$left : Infinity, childRect.left);
      rect.top = Math.min((_rect$top = rect.top) !== null && _rect$top !== void 0 ? _rect$top : Infinity, childRect.top);
      rect.right = Math.max((_rect$right = rect.right) !== null && _rect$right !== void 0 ? _rect$right : -Infinity, childRect.right);
      rect.bottom = Math.max((_rect$bottom = rect.bottom) !== null && _rect$bottom !== void 0 ? _rect$bottom : -Infinity, childRect.bottom);
    });
    rect.width = rect.right - rect.left;
    rect.height = rect.bottom - rect.top;
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
  }
  var expando = 'Sortable' + new Date().getTime();

  function AnimationStateManager() {
    var animationStates = [],
      animationCallbackId;
    return {
      captureAnimationState: function captureAnimationState() {
        animationStates = [];
        if (!this.options.animation) return;
        var children = [].slice.call(this.el.children);
        children.forEach(function (child) {
          if (css(child, 'display') === 'none' || child === Sortable.ghost) return;
          animationStates.push({
            target: child,
            rect: getRect(child)
          });
          var fromRect = _objectSpread2({}, animationStates[animationStates.length - 1].rect);

          // If animating: compensate for current animation
          if (child.thisAnimationDuration) {
            var childMatrix = matrix(child, true);
            if (childMatrix) {
              fromRect.top -= childMatrix.f;
              fromRect.left -= childMatrix.e;
            }
          }
          child.fromRect = fromRect;
        });
      },
      addAnimationState: function addAnimationState(state) {
        animationStates.push(state);
      },
      removeAnimationState: function removeAnimationState(target) {
        animationStates.splice(indexOfObject(animationStates, {
          target: target
        }), 1);
      },
      animateAll: function animateAll(callback) {
        var _this = this;
        if (!this.options.animation) {
          clearTimeout(animationCallbackId);
          if (typeof callback === 'function') callback();
          return;
        }
        var animating = false,
          animationTime = 0;
        animationStates.forEach(function (state) {
          var time = 0,
            target = state.target,
            fromRect = target.fromRect,
            toRect = getRect(target),
            prevFromRect = target.prevFromRect,
            prevToRect = target.prevToRect,
            animatingRect = state.rect,
            targetMatrix = matrix(target, true);
          if (targetMatrix) {
            // Compensate for current animation
            toRect.top -= targetMatrix.f;
            toRect.left -= targetMatrix.e;
          }
          target.toRect = toRect;
          if (target.thisAnimationDuration) {
            // Could also check if animatingRect is between fromRect and toRect
            if (isRectEqual(prevFromRect, toRect) && !isRectEqual(fromRect, toRect) &&
            // Make sure animatingRect is on line between toRect & fromRect
            (animatingRect.top - toRect.top) / (animatingRect.left - toRect.left) === (fromRect.top - toRect.top) / (fromRect.left - toRect.left)) {
              // If returning to same place as started from animation and on same axis
              time = calculateRealTime(animatingRect, prevFromRect, prevToRect, _this.options);
            }
          }

          // if fromRect != toRect: animate
          if (!isRectEqual(toRect, fromRect)) {
            target.prevFromRect = fromRect;
            target.prevToRect = toRect;
            if (!time) {
              time = _this.options.animation;
            }
            _this.animate(target, animatingRect, toRect, time);
          }
          if (time) {
            animating = true;
            animationTime = Math.max(animationTime, time);
            clearTimeout(target.animationResetTimer);
            target.animationResetTimer = setTimeout(function () {
              target.animationTime = 0;
              target.prevFromRect = null;
              target.fromRect = null;
              target.prevToRect = null;
              target.thisAnimationDuration = null;
            }, time);
            target.thisAnimationDuration = time;
          }
        });
        clearTimeout(animationCallbackId);
        if (!animating) {
          if (typeof callback === 'function') callback();
        } else {
          animationCallbackId = setTimeout(function () {
            if (typeof callback === 'function') callback();
          }, animationTime);
        }
        animationStates = [];
      },
      animate: function animate(target, currentRect, toRect, duration) {
        if (duration) {
          css(target, 'transition', '');
          css(target, 'transform', '');
          var elMatrix = matrix(this.el),
            scaleX = elMatrix && elMatrix.a,
            scaleY = elMatrix && elMatrix.d,
            translateX = (currentRect.left - toRect.left) / (scaleX || 1),
            translateY = (currentRect.top - toRect.top) / (scaleY || 1);
          target.animatingX = !!translateX;
          target.animatingY = !!translateY;
          css(target, 'transform', 'translate3d(' + translateX + 'px,' + translateY + 'px,0)');
          this.forRepaintDummy = repaint(target); // repaint

          css(target, 'transition', 'transform ' + duration + 'ms' + (this.options.easing ? ' ' + this.options.easing : ''));
          css(target, 'transform', 'translate3d(0,0,0)');
          typeof target.animated === 'number' && clearTimeout(target.animated);
          target.animated = setTimeout(function () {
            css(target, 'transition', '');
            css(target, 'transform', '');
            target.animated = false;
            target.animatingX = false;
            target.animatingY = false;
          }, duration);
        }
      }
    };
  }
  function repaint(target) {
    return target.offsetWidth;
  }
  function calculateRealTime(animatingRect, fromRect, toRect, options) {
    return Math.sqrt(Math.pow(fromRect.top - animatingRect.top, 2) + Math.pow(fromRect.left - animatingRect.left, 2)) / Math.sqrt(Math.pow(fromRect.top - toRect.top, 2) + Math.pow(fromRect.left - toRect.left, 2)) * options.animation;
  }

  var plugins = [];
  var defaults = {
    initializeByDefault: true
  };
  var PluginManager = {
    mount: function mount(plugin) {
      // Set default static properties
      for (var option in defaults) {
        if (defaults.hasOwnProperty(option) && !(option in plugin)) {
          plugin[option] = defaults[option];
        }
      }
      plugins.forEach(function (p) {
        if (p.pluginName === plugin.pluginName) {
          throw "Sortable: Cannot mount plugin ".concat(plugin.pluginName, " more than once");
        }
      });
      plugins.push(plugin);
    },
    pluginEvent: function pluginEvent(eventName, sortable, evt) {
      var _this = this;
      this.eventCanceled = false;
      evt.cancel = function () {
        _this.eventCanceled = true;
      };
      var eventNameGlobal = eventName + 'Global';
      plugins.forEach(function (plugin) {
        if (!sortable[plugin.pluginName]) return;
        // Fire global events if it exists in this sortable
        if (sortable[plugin.pluginName][eventNameGlobal]) {
          sortable[plugin.pluginName][eventNameGlobal](_objectSpread2({
            sortable: sortable
          }, evt));
        }

        // Only fire plugin event if plugin is enabled in this sortable,
        // and plugin has event defined
        if (sortable.options[plugin.pluginName] && sortable[plugin.pluginName][eventName]) {
          sortable[plugin.pluginName][eventName](_objectSpread2({
            sortable: sortable
          }, evt));
        }
      });
    },
    initializePlugins: function initializePlugins(sortable, el, defaults, options) {
      plugins.forEach(function (plugin) {
        var pluginName = plugin.pluginName;
        if (!sortable.options[pluginName] && !plugin.initializeByDefault) return;
        var initialized = new plugin(sortable, el, sortable.options);
        initialized.sortable = sortable;
        initialized.options = sortable.options;
        sortable[pluginName] = initialized;

        // Add default options from plugin
        _extends(defaults, initialized.defaults);
      });
      for (var option in sortable.options) {
        if (!sortable.options.hasOwnProperty(option)) continue;
        var modified = this.modifyOption(sortable, option, sortable.options[option]);
        if (typeof modified !== 'undefined') {
          sortable.options[option] = modified;
        }
      }
    },
    getEventProperties: function getEventProperties(name, sortable) {
      var eventProperties = {};
      plugins.forEach(function (plugin) {
        if (typeof plugin.eventProperties !== 'function') return;
        _extends(eventProperties, plugin.eventProperties.call(sortable[plugin.pluginName], name));
      });
      return eventProperties;
    },
    modifyOption: function modifyOption(sortable, name, value) {
      var modifiedValue;
      plugins.forEach(function (plugin) {
        // Plugin must exist on the Sortable
        if (!sortable[plugin.pluginName]) return;

        // If static option listener exists for this option, call in the context of the Sortable's instance of this plugin
        if (plugin.optionListeners && typeof plugin.optionListeners[name] === 'function') {
          modifiedValue = plugin.optionListeners[name].call(sortable[plugin.pluginName], value);
        }
      });
      return modifiedValue;
    }
  };

  function dispatchEvent(_ref) {
    var sortable = _ref.sortable,
      rootEl = _ref.rootEl,
      name = _ref.name,
      targetEl = _ref.targetEl,
      cloneEl = _ref.cloneEl,
      toEl = _ref.toEl,
      fromEl = _ref.fromEl,
      oldIndex = _ref.oldIndex,
      newIndex = _ref.newIndex,
      oldDraggableIndex = _ref.oldDraggableIndex,
      newDraggableIndex = _ref.newDraggableIndex,
      originalEvent = _ref.originalEvent,
      putSortable = _ref.putSortable,
      extraEventProperties = _ref.extraEventProperties;
    sortable = sortable || rootEl && rootEl[expando];
    if (!sortable) return;
    var evt,
      options = sortable.options,
      onName = 'on' + name.charAt(0).toUpperCase() + name.substr(1);
    // Support for new CustomEvent feature
    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent(name, {
        bubbles: true,
        cancelable: true
      });
    } else {
      evt = document.createEvent('Event');
      evt.initEvent(name, true, true);
    }
    evt.to = toEl || rootEl;
    evt.from = fromEl || rootEl;
    evt.item = targetEl || rootEl;
    evt.clone = cloneEl;
    evt.oldIndex = oldIndex;
    evt.newIndex = newIndex;
    evt.oldDraggableIndex = oldDraggableIndex;
    evt.newDraggableIndex = newDraggableIndex;
    evt.originalEvent = originalEvent;
    evt.pullMode = putSortable ? putSortable.lastPutMode : undefined;
    var allEventProperties = _objectSpread2(_objectSpread2({}, extraEventProperties), PluginManager.getEventProperties(name, sortable));
    for (var option in allEventProperties) {
      evt[option] = allEventProperties[option];
    }
    if (rootEl) {
      rootEl.dispatchEvent(evt);
    }
    if (options[onName]) {
      options[onName].call(sortable, evt);
    }
  }

  var _excluded = ["evt"];
  var pluginEvent = function pluginEvent(eventName, sortable) {
    var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      originalEvent = _ref.evt,
      data = _objectWithoutProperties(_ref, _excluded);
    PluginManager.pluginEvent.bind(Sortable)(eventName, sortable, _objectSpread2({
      dragEl: dragEl,
      parentEl: parentEl,
      ghostEl: ghostEl,
      rootEl: rootEl,
      nextEl: nextEl,
      lastDownEl: lastDownEl,
      cloneEl: cloneEl,
      cloneHidden: cloneHidden,
      dragStarted: moved,
      putSortable: putSortable,
      activeSortable: Sortable.active,
      originalEvent: originalEvent,
      oldIndex: oldIndex,
      oldDraggableIndex: oldDraggableIndex,
      newIndex: newIndex,
      newDraggableIndex: newDraggableIndex,
      hideGhostForTarget: _hideGhostForTarget,
      unhideGhostForTarget: _unhideGhostForTarget,
      cloneNowHidden: function cloneNowHidden() {
        cloneHidden = true;
      },
      cloneNowShown: function cloneNowShown() {
        cloneHidden = false;
      },
      dispatchSortableEvent: function dispatchSortableEvent(name) {
        _dispatchEvent({
          sortable: sortable,
          name: name,
          originalEvent: originalEvent
        });
      }
    }, data));
  };
  function _dispatchEvent(info) {
    dispatchEvent(_objectSpread2({
      putSortable: putSortable,
      cloneEl: cloneEl,
      targetEl: dragEl,
      rootEl: rootEl,
      oldIndex: oldIndex,
      oldDraggableIndex: oldDraggableIndex,
      newIndex: newIndex,
      newDraggableIndex: newDraggableIndex
    }, info));
  }
  var dragEl,
    parentEl,
    ghostEl,
    rootEl,
    nextEl,
    lastDownEl,
    cloneEl,
    cloneHidden,
    oldIndex,
    newIndex,
    oldDraggableIndex,
    newDraggableIndex,
    activeGroup,
    putSortable,
    awaitingDragStarted = false,
    ignoreNextClick = false,
    sortables = [],
    tapEvt,
    touchEvt,
    lastDx,
    lastDy,
    tapDistanceLeft,
    tapDistanceTop,
    moved,
    lastTarget,
    lastDirection,
    pastFirstInvertThresh = false,
    isCircumstantialInvert = false,
    targetMoveDistance,
    // For positioning ghost absolutely
    ghostRelativeParent,
    ghostRelativeParentInitialScroll = [],
    // (left, top)

    _silent = false,
    savedInputChecked = [];

  /** @const */
  var documentExists = typeof document !== 'undefined',
    PositionGhostAbsolutely = IOS,
    CSSFloatProperty = Edge || IE11OrLess ? 'cssFloat' : 'float',
    // This will not pass for IE9, because IE9 DnD only works on anchors
    supportDraggable = documentExists && !ChromeForAndroid && !IOS && 'draggable' in document.createElement('div'),
    supportCssPointerEvents = function () {
      if (!documentExists) return;
      // false when <= IE11
      if (IE11OrLess) {
        return false;
      }
      var el = document.createElement('x');
      el.style.cssText = 'pointer-events:auto';
      return el.style.pointerEvents === 'auto';
    }(),
    _detectDirection = function _detectDirection(el, options) {
      var elCSS = css(el),
        elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth),
        child1 = getChild(el, 0, options),
        child2 = getChild(el, 1, options),
        firstChildCSS = child1 && css(child1),
        secondChildCSS = child2 && css(child2),
        firstChildWidth = firstChildCSS && parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + getRect(child1).width,
        secondChildWidth = secondChildCSS && parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + getRect(child2).width;
      if (elCSS.display === 'flex') {
        return elCSS.flexDirection === 'column' || elCSS.flexDirection === 'column-reverse' ? 'vertical' : 'horizontal';
      }
      if (elCSS.display === 'grid') {
        return elCSS.gridTemplateColumns.split(' ').length <= 1 ? 'vertical' : 'horizontal';
      }
      if (child1 && firstChildCSS["float"] && firstChildCSS["float"] !== 'none') {
        var touchingSideChild2 = firstChildCSS["float"] === 'left' ? 'left' : 'right';
        return child2 && (secondChildCSS.clear === 'both' || secondChildCSS.clear === touchingSideChild2) ? 'vertical' : 'horizontal';
      }
      return child1 && (firstChildCSS.display === 'block' || firstChildCSS.display === 'flex' || firstChildCSS.display === 'table' || firstChildCSS.display === 'grid' || firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === 'none' || child2 && elCSS[CSSFloatProperty] === 'none' && firstChildWidth + secondChildWidth > elWidth) ? 'vertical' : 'horizontal';
    },
    _dragElInRowColumn = function _dragElInRowColumn(dragRect, targetRect, vertical) {
      var dragElS1Opp = vertical ? dragRect.left : dragRect.top,
        dragElS2Opp = vertical ? dragRect.right : dragRect.bottom,
        dragElOppLength = vertical ? dragRect.width : dragRect.height,
        targetS1Opp = vertical ? targetRect.left : targetRect.top,
        targetS2Opp = vertical ? targetRect.right : targetRect.bottom,
        targetOppLength = vertical ? targetRect.width : targetRect.height;
      return dragElS1Opp === targetS1Opp || dragElS2Opp === targetS2Opp || dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2;
    },
    /**
     * Detects first nearest empty sortable to X and Y position using emptyInsertThreshold.
     * @param  {Number} x      X position
     * @param  {Number} y      Y position
     * @return {HTMLElement}   Element of the first found nearest Sortable
     */
    _detectNearestEmptySortable = function _detectNearestEmptySortable(x, y) {
      var ret;
      sortables.some(function (sortable) {
        var threshold = sortable[expando].options.emptyInsertThreshold;
        if (!threshold || lastChild(sortable)) return;
        var rect = getRect(sortable),
          insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold,
          insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
        if (insideHorizontally && insideVertically) {
          return ret = sortable;
        }
      });
      return ret;
    },
    _prepareGroup = function _prepareGroup(options) {
      function toFn(value, pull) {
        return function (to, from, dragEl, evt) {
          var sameGroup = to.options.group.name && from.options.group.name && to.options.group.name === from.options.group.name;
          if (value == null && (pull || sameGroup)) {
            // Default pull value
            // Default pull and put value if same group
            return true;
          } else if (value == null || value === false) {
            return false;
          } else if (pull && value === 'clone') {
            return value;
          } else if (typeof value === 'function') {
            return toFn(value(to, from, dragEl, evt), pull)(to, from, dragEl, evt);
          } else {
            var otherGroup = (pull ? to : from).options.group.name;
            return value === true || typeof value === 'string' && value === otherGroup || value.join && value.indexOf(otherGroup) > -1;
          }
        };
      }
      var group = {};
      var originalGroup = options.group;
      if (!originalGroup || _typeof(originalGroup) != 'object') {
        originalGroup = {
          name: originalGroup
        };
      }
      group.name = originalGroup.name;
      group.checkPull = toFn(originalGroup.pull, true);
      group.checkPut = toFn(originalGroup.put);
      group.revertClone = originalGroup.revertClone;
      options.group = group;
    },
    _hideGhostForTarget = function _hideGhostForTarget() {
      if (!supportCssPointerEvents && ghostEl) {
        css(ghostEl, 'display', 'none');
      }
    },
    _unhideGhostForTarget = function _unhideGhostForTarget() {
      if (!supportCssPointerEvents && ghostEl) {
        css(ghostEl, 'display', '');
      }
    };

  // #1184 fix - Prevent click event on fallback if dragged but item not changed position
  if (documentExists && !ChromeForAndroid) {
    document.addEventListener('click', function (evt) {
      if (ignoreNextClick) {
        evt.preventDefault();
        evt.stopPropagation && evt.stopPropagation();
        evt.stopImmediatePropagation && evt.stopImmediatePropagation();
        ignoreNextClick = false;
        return false;
      }
    }, true);
  }
  var nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent(evt) {
    if (dragEl) {
      evt = evt.touches ? evt.touches[0] : evt;
      var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);
      if (nearest) {
        // Create imitation event
        var event = {};
        for (var i in evt) {
          if (evt.hasOwnProperty(i)) {
            event[i] = evt[i];
          }
        }
        event.target = event.rootEl = nearest;
        event.preventDefault = void 0;
        event.stopPropagation = void 0;
        nearest[expando]._onDragOver(event);
      }
    }
  };
  var _checkOutsideTargetEl = function _checkOutsideTargetEl(evt) {
    if (dragEl) {
      dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
    }
  };

  /**
   * @class  Sortable
   * @param  {HTMLElement}  el
   * @param  {Object}       [options]
   */
  function Sortable(el, options) {
    if (!(el && el.nodeType && el.nodeType === 1)) {
      throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
    }
    this.el = el; // root element
    this.options = options = _extends({}, options);

    // Export instance
    el[expando] = this;
    var defaults = {
      group: null,
      sort: true,
      disabled: false,
      store: null,
      handle: null,
      draggable: /^[uo]l$/i.test(el.nodeName) ? '>li' : '>*',
      swapThreshold: 1,
      // percentage; 0 <= x <= 1
      invertSwap: false,
      // invert always
      invertedSwapThreshold: null,
      // will be set to same as swapThreshold if default
      removeCloneOnHide: true,
      direction: function direction() {
        return _detectDirection(el, this.options);
      },
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      ignore: 'a, img',
      filter: null,
      preventOnFilter: true,
      animation: 0,
      easing: null,
      setData: function setData(dataTransfer, dragEl) {
        dataTransfer.setData('Text', dragEl.textContent);
      },
      dropBubble: false,
      dragoverBubble: false,
      dataIdAttr: 'data-id',
      delay: 0,
      delayOnTouchOnly: false,
      touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
      forceFallback: false,
      fallbackClass: 'sortable-fallback',
      fallbackOnBody: false,
      fallbackTolerance: 0,
      fallbackOffset: {
        x: 0,
        y: 0
      },
      // Disabled on Safari: #1571; Enabled on Safari IOS: #2244
      supportPointer: Sortable.supportPointer !== false && 'PointerEvent' in window && (!Safari || IOS),
      emptyInsertThreshold: 5
    };
    PluginManager.initializePlugins(this, el, defaults);

    // Set default options
    for (var name in defaults) {
      !(name in options) && (options[name] = defaults[name]);
    }
    _prepareGroup(options);

    // Bind all private methods
    for (var fn in this) {
      if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
        this[fn] = this[fn].bind(this);
      }
    }

    // Setup drag mode
    this.nativeDraggable = options.forceFallback ? false : supportDraggable;
    if (this.nativeDraggable) {
      // Touch start threshold cannot be greater than the native dragstart threshold
      this.options.touchStartThreshold = 1;
    }

    // Bind events
    if (options.supportPointer) {
      on(el, 'pointerdown', this._onTapStart);
    } else {
      on(el, 'mousedown', this._onTapStart);
      on(el, 'touchstart', this._onTapStart);
    }
    if (this.nativeDraggable) {
      on(el, 'dragover', this);
      on(el, 'dragenter', this);
    }
    sortables.push(this.el);

    // Restore sorting
    options.store && options.store.get && this.sort(options.store.get(this) || []);

    // Add animation state manager
    _extends(this, AnimationStateManager());
  }
  Sortable.prototype = /** @lends Sortable.prototype */{
    constructor: Sortable,
    _isOutsideThisEl: function _isOutsideThisEl(target) {
      if (!this.el.contains(target) && target !== this.el) {
        lastTarget = null;
      }
    },
    _getDirection: function _getDirection(evt, target) {
      return typeof this.options.direction === 'function' ? this.options.direction.call(this, evt, target, dragEl) : this.options.direction;
    },
    _onTapStart: function _onTapStart( /** Event|TouchEvent */evt) {
      if (!evt.cancelable) return;
      var _this = this,
        el = this.el,
        options = this.options,
        preventOnFilter = options.preventOnFilter,
        type = evt.type,
        touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === 'touch' && evt,
        target = (touch || evt).target,
        originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0] || evt.composedPath && evt.composedPath()[0]) || target,
        filter = options.filter;
      _saveInputCheckedState(el);

      // Don't trigger start event when an element is been dragged, otherwise the evt.oldindex always wrong when set option.group.
      if (dragEl) {
        return;
      }
      if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) {
        return; // only left button and enabled
      }

      // cancel dnd if original target is content editable
      if (originalTarget.isContentEditable) {
        return;
      }

      // Safari ignores further event handling after mousedown
      if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === 'SELECT') {
        return;
      }
      target = closest(target, options.draggable, el, false);
      if (target && target.animated) {
        return;
      }
      if (lastDownEl === target) {
        // Ignoring duplicate `down`
        return;
      }

      // Get the index of the dragged element within its parent
      oldIndex = index$1(target);
      oldDraggableIndex = index$1(target, options.draggable);

      // Check filter
      if (typeof filter === 'function') {
        if (filter.call(this, evt, target, this)) {
          _dispatchEvent({
            sortable: _this,
            rootEl: originalTarget,
            name: 'filter',
            targetEl: target,
            toEl: el,
            fromEl: el
          });
          pluginEvent('filter', _this, {
            evt: evt
          });
          preventOnFilter && evt.preventDefault();
          return; // cancel dnd
        }
      } else if (filter) {
        filter = filter.split(',').some(function (criteria) {
          criteria = closest(originalTarget, criteria.trim(), el, false);
          if (criteria) {
            _dispatchEvent({
              sortable: _this,
              rootEl: criteria,
              name: 'filter',
              targetEl: target,
              fromEl: el,
              toEl: el
            });
            pluginEvent('filter', _this, {
              evt: evt
            });
            return true;
          }
        });
        if (filter) {
          preventOnFilter && evt.preventDefault();
          return; // cancel dnd
        }
      }
      if (options.handle && !closest(originalTarget, options.handle, el, false)) {
        return;
      }

      // Prepare `dragstart`
      this._prepareDragStart(evt, touch, target);
    },
    _prepareDragStart: function _prepareDragStart( /** Event */evt, /** Touch */touch, /** HTMLElement */target) {
      var _this = this,
        el = _this.el,
        options = _this.options,
        ownerDocument = el.ownerDocument,
        dragStartFn;
      if (target && !dragEl && target.parentNode === el) {
        var dragRect = getRect(target);
        rootEl = el;
        dragEl = target;
        parentEl = dragEl.parentNode;
        nextEl = dragEl.nextSibling;
        lastDownEl = target;
        activeGroup = options.group;
        Sortable.dragged = dragEl;
        tapEvt = {
          target: dragEl,
          clientX: (touch || evt).clientX,
          clientY: (touch || evt).clientY
        };
        tapDistanceLeft = tapEvt.clientX - dragRect.left;
        tapDistanceTop = tapEvt.clientY - dragRect.top;
        this._lastX = (touch || evt).clientX;
        this._lastY = (touch || evt).clientY;
        dragEl.style['will-change'] = 'all';
        dragStartFn = function dragStartFn() {
          pluginEvent('delayEnded', _this, {
            evt: evt
          });
          if (Sortable.eventCanceled) {
            _this._onDrop();
            return;
          }
          // Delayed drag has been triggered
          // we can re-enable the events: touchmove/mousemove
          _this._disableDelayedDragEvents();
          if (!FireFox && _this.nativeDraggable) {
            dragEl.draggable = true;
          }

          // Bind the events: dragstart/dragend
          _this._triggerDragStart(evt, touch);

          // Drag start event
          _dispatchEvent({
            sortable: _this,
            name: 'choose',
            originalEvent: evt
          });

          // Chosen item
          toggleClass(dragEl, options.chosenClass, true);
        };

        // Disable "draggable"
        options.ignore.split(',').forEach(function (criteria) {
          find(dragEl, criteria.trim(), _disableDraggable);
        });
        on(ownerDocument, 'dragover', nearestEmptyInsertDetectEvent);
        on(ownerDocument, 'mousemove', nearestEmptyInsertDetectEvent);
        on(ownerDocument, 'touchmove', nearestEmptyInsertDetectEvent);
        if (options.supportPointer) {
          on(ownerDocument, 'pointerup', _this._onDrop);
          // Native D&D triggers pointercancel
          !this.nativeDraggable && on(ownerDocument, 'pointercancel', _this._onDrop);
        } else {
          on(ownerDocument, 'mouseup', _this._onDrop);
          on(ownerDocument, 'touchend', _this._onDrop);
          on(ownerDocument, 'touchcancel', _this._onDrop);
        }

        // Make dragEl draggable (must be before delay for FireFox)
        if (FireFox && this.nativeDraggable) {
          this.options.touchStartThreshold = 4;
          dragEl.draggable = true;
        }
        pluginEvent('delayStart', this, {
          evt: evt
        });

        // Delay is impossible for native DnD in Edge or IE
        if (options.delay && (!options.delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
          if (Sortable.eventCanceled) {
            this._onDrop();
            return;
          }
          // If the user moves the pointer or let go the click or touch
          // before the delay has been reached:
          // disable the delayed drag
          if (options.supportPointer) {
            on(ownerDocument, 'pointerup', _this._disableDelayedDrag);
            on(ownerDocument, 'pointercancel', _this._disableDelayedDrag);
          } else {
            on(ownerDocument, 'mouseup', _this._disableDelayedDrag);
            on(ownerDocument, 'touchend', _this._disableDelayedDrag);
            on(ownerDocument, 'touchcancel', _this._disableDelayedDrag);
          }
          on(ownerDocument, 'mousemove', _this._delayedDragTouchMoveHandler);
          on(ownerDocument, 'touchmove', _this._delayedDragTouchMoveHandler);
          options.supportPointer && on(ownerDocument, 'pointermove', _this._delayedDragTouchMoveHandler);
          _this._dragStartTimer = setTimeout(dragStartFn, options.delay);
        } else {
          dragStartFn();
        }
      }
    },
    _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler( /** TouchEvent|PointerEvent **/e) {
      var touch = e.touches ? e.touches[0] : e;
      if (Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1))) {
        this._disableDelayedDrag();
      }
    },
    _disableDelayedDrag: function _disableDelayedDrag() {
      dragEl && _disableDraggable(dragEl);
      clearTimeout(this._dragStartTimer);
      this._disableDelayedDragEvents();
    },
    _disableDelayedDragEvents: function _disableDelayedDragEvents() {
      var ownerDocument = this.el.ownerDocument;
      off(ownerDocument, 'mouseup', this._disableDelayedDrag);
      off(ownerDocument, 'touchend', this._disableDelayedDrag);
      off(ownerDocument, 'touchcancel', this._disableDelayedDrag);
      off(ownerDocument, 'pointerup', this._disableDelayedDrag);
      off(ownerDocument, 'pointercancel', this._disableDelayedDrag);
      off(ownerDocument, 'mousemove', this._delayedDragTouchMoveHandler);
      off(ownerDocument, 'touchmove', this._delayedDragTouchMoveHandler);
      off(ownerDocument, 'pointermove', this._delayedDragTouchMoveHandler);
    },
    _triggerDragStart: function _triggerDragStart( /** Event */evt, /** Touch */touch) {
      touch = touch || evt.pointerType == 'touch' && evt;
      if (!this.nativeDraggable || touch) {
        if (this.options.supportPointer) {
          on(document, 'pointermove', this._onTouchMove);
        } else if (touch) {
          on(document, 'touchmove', this._onTouchMove);
        } else {
          on(document, 'mousemove', this._onTouchMove);
        }
      } else {
        on(dragEl, 'dragend', this);
        on(rootEl, 'dragstart', this._onDragStart);
      }
      try {
        if (document.selection) {
          _nextTick(function () {
            document.selection.empty();
          });
        } else {
          window.getSelection().removeAllRanges();
        }
      } catch (err) {}
    },
    _dragStarted: function _dragStarted(fallback, evt) {
      awaitingDragStarted = false;
      if (rootEl && dragEl) {
        pluginEvent('dragStarted', this, {
          evt: evt
        });
        if (this.nativeDraggable) {
          on(document, 'dragover', _checkOutsideTargetEl);
        }
        var options = this.options;

        // Apply effect
        !fallback && toggleClass(dragEl, options.dragClass, false);
        toggleClass(dragEl, options.ghostClass, true);
        Sortable.active = this;
        fallback && this._appendGhost();

        // Drag start event
        _dispatchEvent({
          sortable: this,
          name: 'start',
          originalEvent: evt
        });
      } else {
        this._nulling();
      }
    },
    _emulateDragOver: function _emulateDragOver() {
      if (touchEvt) {
        this._lastX = touchEvt.clientX;
        this._lastY = touchEvt.clientY;
        _hideGhostForTarget();
        var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
        var parent = target;
        while (target && target.shadowRoot) {
          target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
          if (target === parent) break;
          parent = target;
        }
        dragEl.parentNode[expando]._isOutsideThisEl(target);
        if (parent) {
          do {
            if (parent[expando]) {
              var inserted = void 0;
              inserted = parent[expando]._onDragOver({
                clientX: touchEvt.clientX,
                clientY: touchEvt.clientY,
                target: target,
                rootEl: parent
              });
              if (inserted && !this.options.dragoverBubble) {
                break;
              }
            }
            target = parent; // store last element
          }
          /* jshint boss:true */ while (parent = getParentOrHost(parent));
        }
        _unhideGhostForTarget();
      }
    },
    _onTouchMove: function _onTouchMove( /**TouchEvent*/evt) {
      if (tapEvt) {
        var options = this.options,
          fallbackTolerance = options.fallbackTolerance,
          fallbackOffset = options.fallbackOffset,
          touch = evt.touches ? evt.touches[0] : evt,
          ghostMatrix = ghostEl && matrix(ghostEl, true),
          scaleX = ghostEl && ghostMatrix && ghostMatrix.a,
          scaleY = ghostEl && ghostMatrix && ghostMatrix.d,
          relativeScrollOffset = PositionGhostAbsolutely && ghostRelativeParent && getRelativeScrollOffset(ghostRelativeParent),
          dx = (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) + (relativeScrollOffset ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0] : 0) / (scaleX || 1),
          dy = (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) + (relativeScrollOffset ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1] : 0) / (scaleY || 1);

        // only set the status to dragging, when we are actually dragging
        if (!Sortable.active && !awaitingDragStarted) {
          if (fallbackTolerance && Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) < fallbackTolerance) {
            return;
          }
          this._onDragStart(evt, true);
        }
        if (ghostEl) {
          if (ghostMatrix) {
            ghostMatrix.e += dx - (lastDx || 0);
            ghostMatrix.f += dy - (lastDy || 0);
          } else {
            ghostMatrix = {
              a: 1,
              b: 0,
              c: 0,
              d: 1,
              e: dx,
              f: dy
            };
          }
          var cssMatrix = "matrix(".concat(ghostMatrix.a, ",").concat(ghostMatrix.b, ",").concat(ghostMatrix.c, ",").concat(ghostMatrix.d, ",").concat(ghostMatrix.e, ",").concat(ghostMatrix.f, ")");
          css(ghostEl, 'webkitTransform', cssMatrix);
          css(ghostEl, 'mozTransform', cssMatrix);
          css(ghostEl, 'msTransform', cssMatrix);
          css(ghostEl, 'transform', cssMatrix);
          lastDx = dx;
          lastDy = dy;
          touchEvt = touch;
        }
        evt.cancelable && evt.preventDefault();
      }
    },
    _appendGhost: function _appendGhost() {
      // Bug if using scale(): https://stackoverflow.com/questions/2637058
      // Not being adjusted for
      if (!ghostEl) {
        var container = this.options.fallbackOnBody ? document.body : rootEl,
          rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container),
          options = this.options;

        // Position absolutely
        if (PositionGhostAbsolutely) {
          // Get relatively positioned parent
          ghostRelativeParent = container;
          while (css(ghostRelativeParent, 'position') === 'static' && css(ghostRelativeParent, 'transform') === 'none' && ghostRelativeParent !== document) {
            ghostRelativeParent = ghostRelativeParent.parentNode;
          }
          if (ghostRelativeParent !== document.body && ghostRelativeParent !== document.documentElement) {
            if (ghostRelativeParent === document) ghostRelativeParent = getWindowScrollingElement();
            rect.top += ghostRelativeParent.scrollTop;
            rect.left += ghostRelativeParent.scrollLeft;
          } else {
            ghostRelativeParent = getWindowScrollingElement();
          }
          ghostRelativeParentInitialScroll = getRelativeScrollOffset(ghostRelativeParent);
        }
        ghostEl = dragEl.cloneNode(true);
        toggleClass(ghostEl, options.ghostClass, false);
        toggleClass(ghostEl, options.fallbackClass, true);
        toggleClass(ghostEl, options.dragClass, true);
        css(ghostEl, 'transition', '');
        css(ghostEl, 'transform', '');
        css(ghostEl, 'box-sizing', 'border-box');
        css(ghostEl, 'margin', 0);
        css(ghostEl, 'top', rect.top);
        css(ghostEl, 'left', rect.left);
        css(ghostEl, 'width', rect.width);
        css(ghostEl, 'height', rect.height);
        css(ghostEl, 'opacity', '0.8');
        css(ghostEl, 'position', PositionGhostAbsolutely ? 'absolute' : 'fixed');
        css(ghostEl, 'zIndex', '100000');
        css(ghostEl, 'pointerEvents', 'none');
        Sortable.ghost = ghostEl;
        container.appendChild(ghostEl);

        // Set transform-origin
        css(ghostEl, 'transform-origin', tapDistanceLeft / parseInt(ghostEl.style.width) * 100 + '% ' + tapDistanceTop / parseInt(ghostEl.style.height) * 100 + '%');
      }
    },
    _onDragStart: function _onDragStart( /**Event*/evt, /**boolean*/fallback) {
      var _this = this;
      var dataTransfer = evt.dataTransfer;
      var options = _this.options;
      pluginEvent('dragStart', this, {
        evt: evt
      });
      if (Sortable.eventCanceled) {
        this._onDrop();
        return;
      }
      pluginEvent('setupClone', this);
      if (!Sortable.eventCanceled) {
        cloneEl = clone(dragEl);
        cloneEl.removeAttribute("id");
        cloneEl.draggable = false;
        cloneEl.style['will-change'] = '';
        this._hideClone();
        toggleClass(cloneEl, this.options.chosenClass, false);
        Sortable.clone = cloneEl;
      }

      // #1143: IFrame support workaround
      _this.cloneId = _nextTick(function () {
        pluginEvent('clone', _this);
        if (Sortable.eventCanceled) return;
        if (!_this.options.removeCloneOnHide) {
          rootEl.insertBefore(cloneEl, dragEl);
        }
        _this._hideClone();
        _dispatchEvent({
          sortable: _this,
          name: 'clone'
        });
      });
      !fallback && toggleClass(dragEl, options.dragClass, true);

      // Set proper drop events
      if (fallback) {
        ignoreNextClick = true;
        _this._loopId = setInterval(_this._emulateDragOver, 50);
      } else {
        // Undo what was set in _prepareDragStart before drag started
        off(document, 'mouseup', _this._onDrop);
        off(document, 'touchend', _this._onDrop);
        off(document, 'touchcancel', _this._onDrop);
        if (dataTransfer) {
          dataTransfer.effectAllowed = 'move';
          options.setData && options.setData.call(_this, dataTransfer, dragEl);
        }
        on(document, 'drop', _this);

        // #1276 fix:
        css(dragEl, 'transform', 'translateZ(0)');
      }
      awaitingDragStarted = true;
      _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
      on(document, 'selectstart', _this);
      moved = true;
      window.getSelection().removeAllRanges();
      if (Safari) {
        css(document.body, 'user-select', 'none');
      }
    },
    // Returns true - if no further action is needed (either inserted or another condition)
    _onDragOver: function _onDragOver( /**Event*/evt) {
      var el = this.el,
        target = evt.target,
        dragRect,
        targetRect,
        revert,
        options = this.options,
        group = options.group,
        activeSortable = Sortable.active,
        isOwner = activeGroup === group,
        canSort = options.sort,
        fromSortable = putSortable || activeSortable,
        vertical,
        _this = this,
        completedFired = false;
      if (_silent) return;
      function dragOverEvent(name, extra) {
        pluginEvent(name, _this, _objectSpread2({
          evt: evt,
          isOwner: isOwner,
          axis: vertical ? 'vertical' : 'horizontal',
          revert: revert,
          dragRect: dragRect,
          targetRect: targetRect,
          canSort: canSort,
          fromSortable: fromSortable,
          target: target,
          completed: completed,
          onMove: function onMove(target, after) {
            return _onMove(rootEl, el, dragEl, dragRect, target, getRect(target), evt, after);
          },
          changed: changed
        }, extra));
      }

      // Capture animation state
      function capture() {
        dragOverEvent('dragOverAnimationCapture');
        _this.captureAnimationState();
        if (_this !== fromSortable) {
          fromSortable.captureAnimationState();
        }
      }

      // Return invocation when dragEl is inserted (or completed)
      function completed(insertion) {
        dragOverEvent('dragOverCompleted', {
          insertion: insertion
        });
        if (insertion) {
          // Clones must be hidden before folding animation to capture dragRectAbsolute properly
          if (isOwner) {
            activeSortable._hideClone();
          } else {
            activeSortable._showClone(_this);
          }
          if (_this !== fromSortable) {
            // Set ghost class to new sortable's ghost class
            toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : activeSortable.options.ghostClass, false);
            toggleClass(dragEl, options.ghostClass, true);
          }
          if (putSortable !== _this && _this !== Sortable.active) {
            putSortable = _this;
          } else if (_this === Sortable.active && putSortable) {
            putSortable = null;
          }

          // Animation
          if (fromSortable === _this) {
            _this._ignoreWhileAnimating = target;
          }
          _this.animateAll(function () {
            dragOverEvent('dragOverAnimationComplete');
            _this._ignoreWhileAnimating = null;
          });
          if (_this !== fromSortable) {
            fromSortable.animateAll();
            fromSortable._ignoreWhileAnimating = null;
          }
        }

        // Null lastTarget if it is not inside a previously swapped element
        if (target === dragEl && !dragEl.animated || target === el && !target.animated) {
          lastTarget = null;
        }

        // no bubbling and not fallback
        if (!options.dragoverBubble && !evt.rootEl && target !== document) {
          dragEl.parentNode[expando]._isOutsideThisEl(evt.target);

          // Do not detect for empty insert if already inserted
          !insertion && nearestEmptyInsertDetectEvent(evt);
        }
        !options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
        return completedFired = true;
      }

      // Call when dragEl has been inserted
      function changed() {
        newIndex = index$1(dragEl);
        newDraggableIndex = index$1(dragEl, options.draggable);
        _dispatchEvent({
          sortable: _this,
          name: 'change',
          toEl: el,
          newIndex: newIndex,
          newDraggableIndex: newDraggableIndex,
          originalEvent: evt
        });
      }
      if (evt.preventDefault !== void 0) {
        evt.cancelable && evt.preventDefault();
      }
      target = closest(target, options.draggable, el, true);
      dragOverEvent('dragOver');
      if (Sortable.eventCanceled) return completedFired;
      if (dragEl.contains(evt.target) || target.animated && target.animatingX && target.animatingY || _this._ignoreWhileAnimating === target) {
        return completed(false);
      }
      ignoreNextClick = false;
      if (activeSortable && !options.disabled && (isOwner ? canSort || (revert = parentEl !== rootEl) // Reverting item into the original list
      : putSortable === this || (this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) && group.checkPut(this, activeSortable, dragEl, evt))) {
        vertical = this._getDirection(evt, target) === 'vertical';
        dragRect = getRect(dragEl);
        dragOverEvent('dragOverValid');
        if (Sortable.eventCanceled) return completedFired;
        if (revert) {
          parentEl = rootEl; // actualization
          capture();
          this._hideClone();
          dragOverEvent('revert');
          if (!Sortable.eventCanceled) {
            if (nextEl) {
              rootEl.insertBefore(dragEl, nextEl);
            } else {
              rootEl.appendChild(dragEl);
            }
          }
          return completed(true);
        }
        var elLastChild = lastChild(el, options.draggable);
        if (!elLastChild || _ghostIsLast(evt, vertical, this) && !elLastChild.animated) {
          // Insert to end of list

          // If already at end of list: Do not insert
          if (elLastChild === dragEl) {
            return completed(false);
          }

          // if there is a last element, it is the target
          if (elLastChild && el === evt.target) {
            target = elLastChild;
          }
          if (target) {
            targetRect = getRect(target);
          }
          if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
            capture();
            if (elLastChild && elLastChild.nextSibling) {
              // the last draggable element is not the last node
              el.insertBefore(dragEl, elLastChild.nextSibling);
            } else {
              el.appendChild(dragEl);
            }
            parentEl = el; // actualization

            changed();
            return completed(true);
          }
        } else if (elLastChild && _ghostIsFirst(evt, vertical, this)) {
          // Insert to start of list
          var firstChild = getChild(el, 0, options, true);
          if (firstChild === dragEl) {
            return completed(false);
          }
          target = firstChild;
          targetRect = getRect(target);
          if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, false) !== false) {
            capture();
            el.insertBefore(dragEl, firstChild);
            parentEl = el; // actualization

            changed();
            return completed(true);
          }
        } else if (target.parentNode === el) {
          targetRect = getRect(target);
          var direction = 0,
            targetBeforeFirstSwap,
            differentLevel = dragEl.parentNode !== el,
            differentRowCol = !_dragElInRowColumn(dragEl.animated && dragEl.toRect || dragRect, target.animated && target.toRect || targetRect, vertical),
            side1 = vertical ? 'top' : 'left',
            scrolledPastTop = isScrolledPast(target, 'top', 'top') || isScrolledPast(dragEl, 'top', 'top'),
            scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;
          if (lastTarget !== target) {
            targetBeforeFirstSwap = targetRect[side1];
            pastFirstInvertThresh = false;
            isCircumstantialInvert = !differentRowCol && options.invertSwap || differentLevel;
          }
          direction = _getSwapDirection(evt, target, targetRect, vertical, differentRowCol ? 1 : options.swapThreshold, options.invertedSwapThreshold == null ? options.swapThreshold : options.invertedSwapThreshold, isCircumstantialInvert, lastTarget === target);
          var sibling;
          if (direction !== 0) {
            // Check if target is beside dragEl in respective direction (ignoring hidden elements)
            var dragIndex = index$1(dragEl);
            do {
              dragIndex -= direction;
              sibling = parentEl.children[dragIndex];
            } while (sibling && (css(sibling, 'display') === 'none' || sibling === ghostEl));
          }
          // If dragEl is already beside target: Do not insert
          if (direction === 0 || sibling === target) {
            return completed(false);
          }
          lastTarget = target;
          lastDirection = direction;
          var nextSibling = target.nextElementSibling,
            after = false;
          after = direction === 1;
          var moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, after);
          if (moveVector !== false) {
            if (moveVector === 1 || moveVector === -1) {
              after = moveVector === 1;
            }
            _silent = true;
            setTimeout(_unsilent, 30);
            capture();
            if (after && !nextSibling) {
              el.appendChild(dragEl);
            } else {
              target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
            }

            // Undo chrome's scroll adjustment (has no effect on other browsers)
            if (scrolledPastTop) {
              scrollBy(scrolledPastTop, 0, scrollBefore - scrolledPastTop.scrollTop);
            }
            parentEl = dragEl.parentNode; // actualization

            // must be done before animation
            if (targetBeforeFirstSwap !== undefined && !isCircumstantialInvert) {
              targetMoveDistance = Math.abs(targetBeforeFirstSwap - getRect(target)[side1]);
            }
            changed();
            return completed(true);
          }
        }
        if (el.contains(dragEl)) {
          return completed(false);
        }
      }
      return false;
    },
    _ignoreWhileAnimating: null,
    _offMoveEvents: function _offMoveEvents() {
      off(document, 'mousemove', this._onTouchMove);
      off(document, 'touchmove', this._onTouchMove);
      off(document, 'pointermove', this._onTouchMove);
      off(document, 'dragover', nearestEmptyInsertDetectEvent);
      off(document, 'mousemove', nearestEmptyInsertDetectEvent);
      off(document, 'touchmove', nearestEmptyInsertDetectEvent);
    },
    _offUpEvents: function _offUpEvents() {
      var ownerDocument = this.el.ownerDocument;
      off(ownerDocument, 'mouseup', this._onDrop);
      off(ownerDocument, 'touchend', this._onDrop);
      off(ownerDocument, 'pointerup', this._onDrop);
      off(ownerDocument, 'pointercancel', this._onDrop);
      off(ownerDocument, 'touchcancel', this._onDrop);
      off(document, 'selectstart', this);
    },
    _onDrop: function _onDrop( /**Event*/evt) {
      var el = this.el,
        options = this.options;

      // Get the index of the dragged element within its parent
      newIndex = index$1(dragEl);
      newDraggableIndex = index$1(dragEl, options.draggable);
      pluginEvent('drop', this, {
        evt: evt
      });
      parentEl = dragEl && dragEl.parentNode;

      // Get again after plugin event
      newIndex = index$1(dragEl);
      newDraggableIndex = index$1(dragEl, options.draggable);
      if (Sortable.eventCanceled) {
        this._nulling();
        return;
      }
      awaitingDragStarted = false;
      isCircumstantialInvert = false;
      pastFirstInvertThresh = false;
      clearInterval(this._loopId);
      clearTimeout(this._dragStartTimer);
      _cancelNextTick(this.cloneId);
      _cancelNextTick(this._dragStartId);

      // Unbind events
      if (this.nativeDraggable) {
        off(document, 'drop', this);
        off(el, 'dragstart', this._onDragStart);
      }
      this._offMoveEvents();
      this._offUpEvents();
      if (Safari) {
        css(document.body, 'user-select', '');
      }
      css(dragEl, 'transform', '');
      if (evt) {
        if (moved) {
          evt.cancelable && evt.preventDefault();
          !options.dropBubble && evt.stopPropagation();
        }
        ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
        if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== 'clone') {
          // Remove clone(s)
          cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
        }
        if (dragEl) {
          if (this.nativeDraggable) {
            off(dragEl, 'dragend', this);
          }
          _disableDraggable(dragEl);
          dragEl.style['will-change'] = '';

          // Remove classes
          // ghostClass is added in dragStarted
          if (moved && !awaitingDragStarted) {
            toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : this.options.ghostClass, false);
          }
          toggleClass(dragEl, this.options.chosenClass, false);

          // Drag stop event
          _dispatchEvent({
            sortable: this,
            name: 'unchoose',
            toEl: parentEl,
            newIndex: null,
            newDraggableIndex: null,
            originalEvent: evt
          });
          if (rootEl !== parentEl) {
            if (newIndex >= 0) {
              // Add event
              _dispatchEvent({
                rootEl: parentEl,
                name: 'add',
                toEl: parentEl,
                fromEl: rootEl,
                originalEvent: evt
              });

              // Remove event
              _dispatchEvent({
                sortable: this,
                name: 'remove',
                toEl: parentEl,
                originalEvent: evt
              });

              // drag from one list and drop into another
              _dispatchEvent({
                rootEl: parentEl,
                name: 'sort',
                toEl: parentEl,
                fromEl: rootEl,
                originalEvent: evt
              });
              _dispatchEvent({
                sortable: this,
                name: 'sort',
                toEl: parentEl,
                originalEvent: evt
              });
            }
            putSortable && putSortable.save();
          } else {
            if (newIndex !== oldIndex) {
              if (newIndex >= 0) {
                // drag & drop within the same list
                _dispatchEvent({
                  sortable: this,
                  name: 'update',
                  toEl: parentEl,
                  originalEvent: evt
                });
                _dispatchEvent({
                  sortable: this,
                  name: 'sort',
                  toEl: parentEl,
                  originalEvent: evt
                });
              }
            }
          }
          if (Sortable.active) {
            /* jshint eqnull:true */
            if (newIndex == null || newIndex === -1) {
              newIndex = oldIndex;
              newDraggableIndex = oldDraggableIndex;
            }
            _dispatchEvent({
              sortable: this,
              name: 'end',
              toEl: parentEl,
              originalEvent: evt
            });

            // Save sorting
            this.save();
          }
        }
      }
      this._nulling();
    },
    _nulling: function _nulling() {
      pluginEvent('nulling', this);
      rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = cloneHidden = tapEvt = touchEvt = moved = newIndex = newDraggableIndex = oldIndex = oldDraggableIndex = lastTarget = lastDirection = putSortable = activeGroup = Sortable.dragged = Sortable.ghost = Sortable.clone = Sortable.active = null;
      savedInputChecked.forEach(function (el) {
        el.checked = true;
      });
      savedInputChecked.length = lastDx = lastDy = 0;
    },
    handleEvent: function handleEvent( /**Event*/evt) {
      switch (evt.type) {
        case 'drop':
        case 'dragend':
          this._onDrop(evt);
          break;
        case 'dragenter':
        case 'dragover':
          if (dragEl) {
            this._onDragOver(evt);
            _globalDragOver(evt);
          }
          break;
        case 'selectstart':
          evt.preventDefault();
          break;
      }
    },
    /**
     * Serializes the item into an array of string.
     * @returns {String[]}
     */
    toArray: function toArray() {
      var order = [],
        el,
        children = this.el.children,
        i = 0,
        n = children.length,
        options = this.options;
      for (; i < n; i++) {
        el = children[i];
        if (closest(el, options.draggable, this.el, false)) {
          order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
        }
      }
      return order;
    },
    /**
     * Sorts the elements according to the array.
     * @param  {String[]}  order  order of the items
     */
    sort: function sort(order, useAnimation) {
      var items = {},
        rootEl = this.el;
      this.toArray().forEach(function (id, i) {
        var el = rootEl.children[i];
        if (closest(el, this.options.draggable, rootEl, false)) {
          items[id] = el;
        }
      }, this);
      useAnimation && this.captureAnimationState();
      order.forEach(function (id) {
        if (items[id]) {
          rootEl.removeChild(items[id]);
          rootEl.appendChild(items[id]);
        }
      });
      useAnimation && this.animateAll();
    },
    /**
     * Save the current sorting
     */
    save: function save() {
      var store = this.options.store;
      store && store.set && store.set(this);
    },
    /**
     * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
     * @param   {HTMLElement}  el
     * @param   {String}       [selector]  default: `options.draggable`
     * @returns {HTMLElement|null}
     */
    closest: function closest$1(el, selector) {
      return closest(el, selector || this.options.draggable, this.el, false);
    },
    /**
     * Set/get option
     * @param   {string} name
     * @param   {*}      [value]
     * @returns {*}
     */
    option: function option(name, value) {
      var options = this.options;
      if (value === void 0) {
        return options[name];
      } else {
        var modifiedValue = PluginManager.modifyOption(this, name, value);
        if (typeof modifiedValue !== 'undefined') {
          options[name] = modifiedValue;
        } else {
          options[name] = value;
        }
        if (name === 'group') {
          _prepareGroup(options);
        }
      }
    },
    /**
     * Destroy
     */
    destroy: function destroy() {
      pluginEvent('destroy', this);
      var el = this.el;
      el[expando] = null;
      off(el, 'mousedown', this._onTapStart);
      off(el, 'touchstart', this._onTapStart);
      off(el, 'pointerdown', this._onTapStart);
      if (this.nativeDraggable) {
        off(el, 'dragover', this);
        off(el, 'dragenter', this);
      }
      // Remove draggable attributes
      Array.prototype.forEach.call(el.querySelectorAll('[draggable]'), function (el) {
        el.removeAttribute('draggable');
      });
      this._onDrop();
      this._disableDelayedDragEvents();
      sortables.splice(sortables.indexOf(this.el), 1);
      this.el = el = null;
    },
    _hideClone: function _hideClone() {
      if (!cloneHidden) {
        pluginEvent('hideClone', this);
        if (Sortable.eventCanceled) return;
        css(cloneEl, 'display', 'none');
        if (this.options.removeCloneOnHide && cloneEl.parentNode) {
          cloneEl.parentNode.removeChild(cloneEl);
        }
        cloneHidden = true;
      }
    },
    _showClone: function _showClone(putSortable) {
      if (putSortable.lastPutMode !== 'clone') {
        this._hideClone();
        return;
      }
      if (cloneHidden) {
        pluginEvent('showClone', this);
        if (Sortable.eventCanceled) return;

        // show clone at dragEl or original position
        if (dragEl.parentNode == rootEl && !this.options.group.revertClone) {
          rootEl.insertBefore(cloneEl, dragEl);
        } else if (nextEl) {
          rootEl.insertBefore(cloneEl, nextEl);
        } else {
          rootEl.appendChild(cloneEl);
        }
        if (this.options.group.revertClone) {
          this.animate(dragEl, cloneEl);
        }
        css(cloneEl, 'display', '');
        cloneHidden = false;
      }
    }
  };
  function _globalDragOver( /**Event*/evt) {
    if (evt.dataTransfer) {
      evt.dataTransfer.dropEffect = 'move';
    }
    evt.cancelable && evt.preventDefault();
  }
  function _onMove(fromEl, toEl, dragEl, dragRect, targetEl, targetRect, originalEvent, willInsertAfter) {
    var evt,
      sortable = fromEl[expando],
      onMoveFn = sortable.options.onMove,
      retVal;
    // Support for new CustomEvent feature
    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent('move', {
        bubbles: true,
        cancelable: true
      });
    } else {
      evt = document.createEvent('Event');
      evt.initEvent('move', true, true);
    }
    evt.to = toEl;
    evt.from = fromEl;
    evt.dragged = dragEl;
    evt.draggedRect = dragRect;
    evt.related = targetEl || toEl;
    evt.relatedRect = targetRect || getRect(toEl);
    evt.willInsertAfter = willInsertAfter;
    evt.originalEvent = originalEvent;
    fromEl.dispatchEvent(evt);
    if (onMoveFn) {
      retVal = onMoveFn.call(sortable, evt, originalEvent);
    }
    return retVal;
  }
  function _disableDraggable(el) {
    el.draggable = false;
  }
  function _unsilent() {
    _silent = false;
  }
  function _ghostIsFirst(evt, vertical, sortable) {
    var firstElRect = getRect(getChild(sortable.el, 0, sortable.options, true));
    var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
    var spacer = 10;
    return vertical ? evt.clientX < childContainingRect.left - spacer || evt.clientY < firstElRect.top && evt.clientX < firstElRect.right : evt.clientY < childContainingRect.top - spacer || evt.clientY < firstElRect.bottom && evt.clientX < firstElRect.left;
  }
  function _ghostIsLast(evt, vertical, sortable) {
    var lastElRect = getRect(lastChild(sortable.el, sortable.options.draggable));
    var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
    var spacer = 10;
    return vertical ? evt.clientX > childContainingRect.right + spacer || evt.clientY > lastElRect.bottom && evt.clientX > lastElRect.left : evt.clientY > childContainingRect.bottom + spacer || evt.clientX > lastElRect.right && evt.clientY > lastElRect.top;
  }
  function _getSwapDirection(evt, target, targetRect, vertical, swapThreshold, invertedSwapThreshold, invertSwap, isLastTarget) {
    var mouseOnAxis = vertical ? evt.clientY : evt.clientX,
      targetLength = vertical ? targetRect.height : targetRect.width,
      targetS1 = vertical ? targetRect.top : targetRect.left,
      targetS2 = vertical ? targetRect.bottom : targetRect.right,
      invert = false;
    if (!invertSwap) {
      // Never invert or create dragEl shadow when target movemenet causes mouse to move past the end of regular swapThreshold
      if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
        // multiplied only by swapThreshold because mouse will already be inside target by (1 - threshold) * targetLength / 2
        // check if past first invert threshold on side opposite of lastDirection
        if (!pastFirstInvertThresh && (lastDirection === 1 ? mouseOnAxis > targetS1 + targetLength * invertedSwapThreshold / 2 : mouseOnAxis < targetS2 - targetLength * invertedSwapThreshold / 2)) {
          // past first invert threshold, do not restrict inverted threshold to dragEl shadow
          pastFirstInvertThresh = true;
        }
        if (!pastFirstInvertThresh) {
          // dragEl shadow (target move distance shadow)
          if (lastDirection === 1 ? mouseOnAxis < targetS1 + targetMoveDistance // over dragEl shadow
          : mouseOnAxis > targetS2 - targetMoveDistance) {
            return -lastDirection;
          }
        } else {
          invert = true;
        }
      } else {
        // Regular
        if (mouseOnAxis > targetS1 + targetLength * (1 - swapThreshold) / 2 && mouseOnAxis < targetS2 - targetLength * (1 - swapThreshold) / 2) {
          return _getInsertDirection(target);
        }
      }
    }
    invert = invert || invertSwap;
    if (invert) {
      // Invert of regular
      if (mouseOnAxis < targetS1 + targetLength * invertedSwapThreshold / 2 || mouseOnAxis > targetS2 - targetLength * invertedSwapThreshold / 2) {
        return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1;
      }
    }
    return 0;
  }

  /**
   * Gets the direction dragEl must be swapped relative to target in order to make it
   * seem that dragEl has been "inserted" into that element's position
   * @param  {HTMLElement} target       The target whose position dragEl is being inserted at
   * @return {Number}                   Direction dragEl must be swapped
   */
  function _getInsertDirection(target) {
    if (index$1(dragEl) < index$1(target)) {
      return 1;
    } else {
      return -1;
    }
  }

  /**
   * Generate id
   * @param   {HTMLElement} el
   * @returns {String}
   * @private
   */
  function _generateId(el) {
    var str = el.tagName + el.className + el.src + el.href + el.textContent,
      i = str.length,
      sum = 0;
    while (i--) {
      sum += str.charCodeAt(i);
    }
    return sum.toString(36);
  }
  function _saveInputCheckedState(root) {
    savedInputChecked.length = 0;
    var inputs = root.getElementsByTagName('input');
    var idx = inputs.length;
    while (idx--) {
      var el = inputs[idx];
      el.checked && savedInputChecked.push(el);
    }
  }
  function _nextTick(fn) {
    return setTimeout(fn, 0);
  }
  function _cancelNextTick(id) {
    return clearTimeout(id);
  }

  // Fixed #973:
  if (documentExists) {
    on(document, 'touchmove', function (evt) {
      if ((Sortable.active || awaitingDragStarted) && evt.cancelable) {
        evt.preventDefault();
      }
    });
  }

  // Export utils
  Sortable.utils = {
    on: on,
    off: off,
    css: css,
    find: find,
    is: function is(el, selector) {
      return !!closest(el, selector, el, false);
    },
    extend: extend,
    throttle: throttle,
    closest: closest,
    toggleClass: toggleClass,
    clone: clone,
    index: index$1,
    nextTick: _nextTick,
    cancelNextTick: _cancelNextTick,
    detectDirection: _detectDirection,
    getChild: getChild,
    expando: expando
  };

  /**
   * Get the Sortable instance of an element
   * @param  {HTMLElement} element The element
   * @return {Sortable|undefined}         The instance of Sortable
   */
  Sortable.get = function (element) {
    return element[expando];
  };

  /**
   * Mount a plugin to Sortable
   * @param  {...SortablePlugin|SortablePlugin[]} plugins       Plugins being mounted
   */
  Sortable.mount = function () {
    for (var _len = arguments.length, plugins = new Array(_len), _key = 0; _key < _len; _key++) {
      plugins[_key] = arguments[_key];
    }
    if (plugins[0].constructor === Array) plugins = plugins[0];
    plugins.forEach(function (plugin) {
      if (!plugin.prototype || !plugin.prototype.constructor) {
        throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(plugin));
      }
      if (plugin.utils) Sortable.utils = _objectSpread2(_objectSpread2({}, Sortable.utils), plugin.utils);
      PluginManager.mount(plugin);
    });
  };

  /**
   * Create sortable instance
   * @param {HTMLElement}  el
   * @param {Object}      [options]
   */
  Sortable.create = function (el, options) {
    return new Sortable(el, options);
  };

  // Export
  Sortable.version = version;

  var autoScrolls = [],
    scrollEl,
    scrollRootEl,
    scrolling = false,
    lastAutoScrollX,
    lastAutoScrollY,
    touchEvt$1,
    pointerElemChangedInterval;
  function AutoScrollPlugin() {
    function AutoScroll() {
      this.defaults = {
        scroll: true,
        forceAutoScrollFallback: false,
        scrollSensitivity: 30,
        scrollSpeed: 10,
        bubbleScroll: true
      };

      // Bind all private methods
      for (var fn in this) {
        if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
          this[fn] = this[fn].bind(this);
        }
      }
    }
    AutoScroll.prototype = {
      dragStarted: function dragStarted(_ref) {
        var originalEvent = _ref.originalEvent;
        if (this.sortable.nativeDraggable) {
          on(document, 'dragover', this._handleAutoScroll);
        } else {
          if (this.options.supportPointer) {
            on(document, 'pointermove', this._handleFallbackAutoScroll);
          } else if (originalEvent.touches) {
            on(document, 'touchmove', this._handleFallbackAutoScroll);
          } else {
            on(document, 'mousemove', this._handleFallbackAutoScroll);
          }
        }
      },
      dragOverCompleted: function dragOverCompleted(_ref2) {
        var originalEvent = _ref2.originalEvent;
        // For when bubbling is canceled and using fallback (fallback 'touchmove' always reached)
        if (!this.options.dragOverBubble && !originalEvent.rootEl) {
          this._handleAutoScroll(originalEvent);
        }
      },
      drop: function drop() {
        if (this.sortable.nativeDraggable) {
          off(document, 'dragover', this._handleAutoScroll);
        } else {
          off(document, 'pointermove', this._handleFallbackAutoScroll);
          off(document, 'touchmove', this._handleFallbackAutoScroll);
          off(document, 'mousemove', this._handleFallbackAutoScroll);
        }
        clearPointerElemChangedInterval();
        clearAutoScrolls();
        cancelThrottle();
      },
      nulling: function nulling() {
        touchEvt$1 = scrollRootEl = scrollEl = scrolling = pointerElemChangedInterval = lastAutoScrollX = lastAutoScrollY = null;
        autoScrolls.length = 0;
      },
      _handleFallbackAutoScroll: function _handleFallbackAutoScroll(evt) {
        this._handleAutoScroll(evt, true);
      },
      _handleAutoScroll: function _handleAutoScroll(evt, fallback) {
        var _this = this;
        var x = (evt.touches ? evt.touches[0] : evt).clientX,
          y = (evt.touches ? evt.touches[0] : evt).clientY,
          elem = document.elementFromPoint(x, y);
        touchEvt$1 = evt;

        // IE does not seem to have native autoscroll,
        // Edge's autoscroll seems too conditional,
        // MACOS Safari does not have autoscroll,
        // Firefox and Chrome are good
        if (fallback || this.options.forceAutoScrollFallback || Edge || IE11OrLess || Safari) {
          autoScroll(evt, this.options, elem, fallback);

          // Listener for pointer element change
          var ogElemScroller = getParentAutoScrollElement(elem, true);
          if (scrolling && (!pointerElemChangedInterval || x !== lastAutoScrollX || y !== lastAutoScrollY)) {
            pointerElemChangedInterval && clearPointerElemChangedInterval();
            // Detect for pointer elem change, emulating native DnD behaviour
            pointerElemChangedInterval = setInterval(function () {
              var newElem = getParentAutoScrollElement(document.elementFromPoint(x, y), true);
              if (newElem !== ogElemScroller) {
                ogElemScroller = newElem;
                clearAutoScrolls();
              }
              autoScroll(evt, _this.options, newElem, fallback);
            }, 10);
            lastAutoScrollX = x;
            lastAutoScrollY = y;
          }
        } else {
          // if DnD is enabled (and browser has good autoscrolling), first autoscroll will already scroll, so get parent autoscroll of first autoscroll
          if (!this.options.bubbleScroll || getParentAutoScrollElement(elem, true) === getWindowScrollingElement()) {
            clearAutoScrolls();
            return;
          }
          autoScroll(evt, this.options, getParentAutoScrollElement(elem, false), false);
        }
      }
    };
    return _extends(AutoScroll, {
      pluginName: 'scroll',
      initializeByDefault: true
    });
  }
  function clearAutoScrolls() {
    autoScrolls.forEach(function (autoScroll) {
      clearInterval(autoScroll.pid);
    });
    autoScrolls = [];
  }
  function clearPointerElemChangedInterval() {
    clearInterval(pointerElemChangedInterval);
  }
  var autoScroll = throttle(function (evt, options, rootEl, isFallback) {
    // Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=505521
    if (!options.scroll) return;
    var x = (evt.touches ? evt.touches[0] : evt).clientX,
      y = (evt.touches ? evt.touches[0] : evt).clientY,
      sens = options.scrollSensitivity,
      speed = options.scrollSpeed,
      winScroller = getWindowScrollingElement();
    var scrollThisInstance = false,
      scrollCustomFn;

    // New scroll root, set scrollEl
    if (scrollRootEl !== rootEl) {
      scrollRootEl = rootEl;
      clearAutoScrolls();
      scrollEl = options.scroll;
      scrollCustomFn = options.scrollFn;
      if (scrollEl === true) {
        scrollEl = getParentAutoScrollElement(rootEl, true);
      }
    }
    var layersOut = 0;
    var currentParent = scrollEl;
    do {
      var el = currentParent,
        rect = getRect(el),
        top = rect.top,
        bottom = rect.bottom,
        left = rect.left,
        right = rect.right,
        width = rect.width,
        height = rect.height,
        canScrollX = void 0,
        canScrollY = void 0,
        scrollWidth = el.scrollWidth,
        scrollHeight = el.scrollHeight,
        elCSS = css(el),
        scrollPosX = el.scrollLeft,
        scrollPosY = el.scrollTop;
      if (el === winScroller) {
        canScrollX = width < scrollWidth && (elCSS.overflowX === 'auto' || elCSS.overflowX === 'scroll' || elCSS.overflowX === 'visible');
        canScrollY = height < scrollHeight && (elCSS.overflowY === 'auto' || elCSS.overflowY === 'scroll' || elCSS.overflowY === 'visible');
      } else {
        canScrollX = width < scrollWidth && (elCSS.overflowX === 'auto' || elCSS.overflowX === 'scroll');
        canScrollY = height < scrollHeight && (elCSS.overflowY === 'auto' || elCSS.overflowY === 'scroll');
      }
      var vx = canScrollX && (Math.abs(right - x) <= sens && scrollPosX + width < scrollWidth) - (Math.abs(left - x) <= sens && !!scrollPosX);
      var vy = canScrollY && (Math.abs(bottom - y) <= sens && scrollPosY + height < scrollHeight) - (Math.abs(top - y) <= sens && !!scrollPosY);
      if (!autoScrolls[layersOut]) {
        for (var i = 0; i <= layersOut; i++) {
          if (!autoScrolls[i]) {
            autoScrolls[i] = {};
          }
        }
      }
      if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el) {
        autoScrolls[layersOut].el = el;
        autoScrolls[layersOut].vx = vx;
        autoScrolls[layersOut].vy = vy;
        clearInterval(autoScrolls[layersOut].pid);
        if (vx != 0 || vy != 0) {
          scrollThisInstance = true;
          /* jshint loopfunc:true */
          autoScrolls[layersOut].pid = setInterval(function () {
            // emulate drag over during autoscroll (fallback), emulating native DnD behaviour
            if (isFallback && this.layer === 0) {
              Sortable.active._onTouchMove(touchEvt$1); // To move ghost if it is positioned absolutely
            }
            var scrollOffsetY = autoScrolls[this.layer].vy ? autoScrolls[this.layer].vy * speed : 0;
            var scrollOffsetX = autoScrolls[this.layer].vx ? autoScrolls[this.layer].vx * speed : 0;
            if (typeof scrollCustomFn === 'function') {
              if (scrollCustomFn.call(Sortable.dragged.parentNode[expando], scrollOffsetX, scrollOffsetY, evt, touchEvt$1, autoScrolls[this.layer].el) !== 'continue') {
                return;
              }
            }
            scrollBy(autoScrolls[this.layer].el, scrollOffsetX, scrollOffsetY);
          }.bind({
            layer: layersOut
          }), 24);
        }
      }
      layersOut++;
    } while (options.bubbleScroll && currentParent !== winScroller && (currentParent = getParentAutoScrollElement(currentParent, false)));
    scrolling = scrollThisInstance; // in case another function catches scrolling as false in between when it is not
  }, 30);

  var drop = function drop(_ref) {
    var originalEvent = _ref.originalEvent,
      putSortable = _ref.putSortable,
      dragEl = _ref.dragEl,
      activeSortable = _ref.activeSortable,
      dispatchSortableEvent = _ref.dispatchSortableEvent,
      hideGhostForTarget = _ref.hideGhostForTarget,
      unhideGhostForTarget = _ref.unhideGhostForTarget;
    if (!originalEvent) return;
    var toSortable = putSortable || activeSortable;
    hideGhostForTarget();
    var touch = originalEvent.changedTouches && originalEvent.changedTouches.length ? originalEvent.changedTouches[0] : originalEvent;
    var target = document.elementFromPoint(touch.clientX, touch.clientY);
    unhideGhostForTarget();
    if (toSortable && !toSortable.el.contains(target)) {
      dispatchSortableEvent('spill');
      this.onSpill({
        dragEl: dragEl,
        putSortable: putSortable
      });
    }
  };
  function Revert() {}
  Revert.prototype = {
    startIndex: null,
    dragStart: function dragStart(_ref2) {
      var oldDraggableIndex = _ref2.oldDraggableIndex;
      this.startIndex = oldDraggableIndex;
    },
    onSpill: function onSpill(_ref3) {
      var dragEl = _ref3.dragEl,
        putSortable = _ref3.putSortable;
      this.sortable.captureAnimationState();
      if (putSortable) {
        putSortable.captureAnimationState();
      }
      var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);
      if (nextSibling) {
        this.sortable.el.insertBefore(dragEl, nextSibling);
      } else {
        this.sortable.el.appendChild(dragEl);
      }
      this.sortable.animateAll();
      if (putSortable) {
        putSortable.animateAll();
      }
    },
    drop: drop
  };
  _extends(Revert, {
    pluginName: 'revertOnSpill'
  });
  function Remove() {}
  Remove.prototype = {
    onSpill: function onSpill(_ref4) {
      var dragEl = _ref4.dragEl,
        putSortable = _ref4.putSortable;
      var parentSortable = putSortable || this.sortable;
      parentSortable.captureAnimationState();
      dragEl.parentNode && dragEl.parentNode.removeChild(dragEl);
      parentSortable.animateAll();
    },
    drop: drop
  };
  _extends(Remove, {
    pluginName: 'removeOnSpill'
  });

  Sortable.mount(new AutoScrollPlugin());
  Sortable.mount(Remove, Revert);

  class PlanStepForm {
      static init() {
          PlanStepForm.setElement();
      }
      static setElement() {
          PlanStepForm.area = document.createElement('div');
          PlanStepForm.area.style.display = 'flex';
          PlanStepForm.area.style.gap = '5px';
          PlanStepForm.area.style.padding = '5px';
          const field = document.createElement('input');
          const button = document.createElement('button');
          field.setAttribute('type', 'text');
          field.classList.add('lg');
          button.innerText = 'Add';
          button.classList.add('lg');
          button.addEventListener('click', PlanStepForm.handleAddClick);
          field.addEventListener('keypress', PlanStepForm.handleKeypress);
          field.style.flex = '1';
          PlanStepForm.area.appendChild(field);
          PlanStepForm.area.appendChild(button);
      }
      static planStep() {
          const field = PlanStepForm.area.querySelector('input');
          window.dispatchEvent(new CustomEvent(PlanStepForm.eventTypes.PLAN_STEP, { detail: { title: field.value } }));
          field.value = '';
      }
      static handleAddClick(event) {
          PlanStepForm.planStep();
      }
      static handleKeypress(event) {
          if (event.key !== 'Enter')
              return;
          PlanStepForm.planStep();
      }
      static destroy() {
          var _a;
          (_a = PlanStepForm.area) === null || _a === void 0 ? void 0 : _a.remove();
          PlanStepForm.area = null;
      }
  }
  PlanStepForm.area = null;
  PlanStepForm.eventTypes = {
      PLAN_STEP: 'Demo:Steps:PlanStepForm:PlanStep',
  };

  var css_248z$4 = "body>*{position:relative;transform:translateZ(0)}.demo-tools-steps{display:flex;flex-direction:column;font-weight:700;height:100%;z-index:10001}.demo-tools-steps .demo-tools-step{border:1px solid #444;border-left-width:4px;color:#444;cursor:pointer;display:flex;font-weight:500;justify-content:space-between;padding:3px 12px;white-space:nowrap}.demo-tools-steps .demo-tools-step.unfilled{font-style:italic}.demo-tools-steps .demo-tools-step.active.unavailable,.demo-tools-steps .demo-tools-step.unavailable{color:#d81b60}.demo-tools-steps .demo-tools-step.ignored{text-decoration:underline wavy}.demo-tools-steps .demo-tools-step.type-section{font-weight:800;padding-bottom:6px;padding-left:7px;padding-top:6px}.demo-tools-steps .demo-tools-step .demo-tools-steps-edit-form{display:flex;gap:5px}.demo-tools-steps .demo-tools-step .demo-tools-steps-edit-form input{height:15px!important}.demo-tools-steps .demo-tools-step .demo-tools-steps-edit-form input[type=text]{padding:2px .5em!important}.demo-tools-steps .demo-tools-step .demo-tools-steps-edit-form input[type=number]{padding:2px 0 0 .5em!important}.demo-tools-steps .demo-tools-step .demo-tools-steps-edit-form>div:first-child{min-width:15px}.demo-tools-steps .demo-tools-step .demo-tools-step-label{color:#1266e2}.demo-tools-steps .demo-tools-step.active{border-color:#52c41a;color:#52c41a}.demo-tools-steps .demo-tools-step.completed{opacity:.5}@keyframes fade-out{0%{opacity:1;transform:translate(-50%,-50%) scale(1)}to{opacity:0;transform:translate(-50%,-50%) scale(2)}}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0ZXBzLmxlc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FDRSxpQkFBQSxDQUNBLHVCQUNGLENBRUEsa0JBQ0UsWUFBQSxDQUNBLHFCQUFBLENBQ0EsZUFBQSxDQUNBLFdBQUEsQ0FDQSxhQUFGLENBR0EsbUNBR0UscUJBQUEsQ0FBQSxxQkFBQSxDQUNBLFVBQUEsQ0FDQSxjQUFBLENBRUEsWUFBQSxDQUVBLGVBQUEsQ0FEQSw2QkFBQSxDQVBBLGdCQUFBLENBS0Esa0JBRUYsQ0FHRSw0Q0FDRSxpQkFESixDQUlFLHFHQUNFLGFBREosQ0FJRSwyQ0FDRSw4QkFGSixDQUtFLGdEQUNFLGVBQUEsQ0FDQSxrQkFBQSxDQUVBLGdCQUFBLENBREEsZUFGSixDQXhCQSwrREErQkksWUFBQSxDQUNBLE9BSkosQ0E1QkEscUVBbUNNLHFCQUpOLENBL0JBLGdGQXVDTSwwQkFMTixDQWxDQSxrRkEyQ00sOEJBTk4sQ0FyQ0EsK0VBK0NNLGNBUE4sQ0F4Q0EsMERBb0RJLGFBVEosQ0FhQSwwQ0FDRSxvQkFBQSxDQUNBLGFBWEYsQ0FjQSw2Q0FDRSxVQVpGLENBZUEsb0JBQ0UsR0FDRSxTQUFBLENBQ0EsdUNBYkYsQ0FlQSxHQUNFLFNBQUEsQ0FDQSx1Q0FiRixDQUNGIiwiZmlsZSI6InN0ZXBzLmxlc3MifQ== */";
  styleInject(css_248z$4);

  let Step$1 = class Step {
      constructor(step) {
          this.title = step.title;
          this.description = step.description;
          this.interval = step.interval;
          this.type = step.type;
          this.list = step.list;
          this.xPathCheck = step.xPathCheck;
          this.coordCheck = step.coordCheck;
          this.xPath = step.xPath;
          this.element = step.element;
          this.xPathError = step.xPathError;
          this.isFilled = step.isFilled;
          this.hasCorrectCoordinates = step.hasCorrectCoordinates;
          this.hasCorrectXPath = step.hasCorrectXPath;
          this.elementBoundCheck = step.elementBoundCheck;
          this.labels = step.labels;
      }
  };

  var css_248z$3 = ".demo-tools-cursor{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAakAAAKJCAYAAAABaNbwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxIAAAsSAdLdfvwAAATuaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA5LjAtYzAwMCA3OS4xNzFjMjdmLCAyMDIyLzA4LzE2LTE4OjAyOjQzICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjQuMCAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIzLTA1LTI1VDIxOjEwOjE2KzAxOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMy0wNS0yNlQwMDo1NDozMSswMTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0wNS0yNlQwMDo1NDozMSswMTowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NzIwZTI1MjUtNDBlMi0zODQ1LTllMGMtMzAx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rE5UfTOqsO8Ryem0119/nZXTTwq9LUjbaDQ2KVqSWjiqD054ktpqq6262RTlihUrRtdff32XqG6//fZx9MyMqidR7RvFGSGsnM5vUm3XORqNRmMToCWpRcKTE7MlPSzx9NNPd4+m8zDFHXfc0dnAE1VOWFHnKb/3hPAz9O+IRNWWT2o0GpsELUktEiQav5VHsuK2XySY0eOPPz76xje+MfrsZz87uvvuuzs/EKt4lSLqB0RxDrf+Qmf5pLYqRaPR2OhpSWoBiATR+z2pEiQdkhafUVE+9thjo6997Wvd96j4PpVQXInwHRLFea+99tplsQskKlaqaDQajY2WlqQWht9Fwph5lrwAiUYiyGsIn1PtsMMO3azq/vvv75ZOQh566KFx5Bq8/RiS0pvCfmGUF0R/h7VE1Wg0NmZakloYSFCvzqh1lGRITtzme/3110fLly8f7bfffqO99tqrW+PvV7/6VZek+JzqiSee6OKhZzbFbb63RH8XRXlR9M06f+19bjQaGyVt8FoYXg95bUadDMmKBPXKK6+Mdtlll9Gxxx47OvLII0fbbbdd92j6L3/5y9EXv/jF0be+9a3uCUBBOyW6BA9OvC0S1SUh50WSOnTG3Gg0GhsXLUktDHwe9dtKAlmNJxmWRGL1CZZLete73jU688wzRwcddNBom222GT333HPd8knXXHNN94j6888/37VR+8p2to3k9PYoL41EdWbIG2bMjUajsfHQktQCU0kg6yQYzaR4cILkRKI69dRTu1t/3NpjpfQbb7yxe5DiRz/60ejFF1/s2uV+nLBtH4nquFCZUZGo+E5Vo9FobDS0JLWI+OdKkUA6YUZFwtp9991H55577uid73znaJ999ukepOCHElk+6XOf+1xXMvOCWpKCsO8YieqkUN8b/bd1/hqNxkZFS1LrgVISqSUVEo9+toPPpS655JLRySefPNp7772771LxaPr3v//97jtUzKw8UZH0Sv2GbZdIVO8MuSQS4DsjUbXlkxqNxkZBS1IbCJFAulIzKeDzqBNPPHF08cUXj0444YTRHnvs0dkfeeSR0Xe/+93R5z//+dEtt9zStQESVC35hZ0Z1LtDWOfvxEhU/ORHo9FobNC0JLUwdF/mhZnqupSSCTMhmqgZJT/ncfzxx48uuOCC0XHHHdfdBqQt35viIQoepuDpP7WZkKj2jbgz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);background-position:50%;background-repeat:no-repeat;background-size:contain;min-height:23px;min-width:18px;pointer-events:none;position:absolute;transform:translateX(-5px);z-index:99999}.demo-tools-cursor.demo-tools-cursor-click{transform:rotateY(-15deg) rotateX(15deg) translateX(-5px)}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS5sZXNzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLG1CQU1FLHcvcUhBQUEsQ0FDQSx1QkFBQSxDQUVBLDJCQUFBLENBREEsdUJBQUEsQ0FMQSxlQUFBLENBREEsY0FBQSxDQUVBLG1CQUFBLENBSEEsaUJBQUEsQ0FRK0IsMEJBQUEsQ0FKL0IsYUFNRixDQUFFLDJDQUNFLHlEQUVKIiwiZmlsZSI6ImRvbS5sZXNzIn0= */";
  styleInject(css_248z$3);

  class MouseCursor {
      constructor(x, y) {
          this.x = x;
          this.y = y;
          this.cursor = document.createElement('div');
          this.cursor.classList.add('demo-tools-cursor');
          document.body.appendChild(this.cursor);
      }
      static moveCursor(x, y, startX, startY) {
          return new Promise(resolve => {
              let mouseCursor;
              if (MouseCursor.instance) {
                  mouseCursor = MouseCursor.getInstance();
              }
              else {
                  mouseCursor = MouseCursor.getInstance(startX || x, startY || y);
              }
              function updateFrame() {
                  return __awaiter(this, void 0, void 0, function* () {
                      const dx = x - mouseCursor.x;
                      const dy = y - mouseCursor.y;
                      const distance = Math.sqrt(dx * dx + dy * dy);
                      if (distance < 1.1) {
                          mouseCursor.x = x;
                          mouseCursor.y = y;
                          mouseCursor.cursor.style.left = `${x}px`;
                          mouseCursor.cursor.style.top = `${y}px`;
                          yield MouseCursor.clickAnimation();
                          resolve(undefined);
                          return;
                      }
                      mouseCursor.x = MouseCursor.lerp(mouseCursor.x, x, MouseCursor.amt);
                      mouseCursor.y = MouseCursor.lerp(mouseCursor.y, y, MouseCursor.amt);
                      mouseCursor.cursor.style.left = `${mouseCursor.x}px`;
                      mouseCursor.cursor.style.top = `${mouseCursor.y}px`;
                      requestAnimationFrame(updateFrame);
                  });
              }
              requestAnimationFrame(updateFrame);
          });
      }
      static lerp(start, end, amt) {
          return (1 - amt) * start + amt * end;
      }
      static clickAnimation() {
          var _a, _b;
          return __awaiter(this, void 0, void 0, function* () {
              if (!((_a = MouseCursor.getInstance()) === null || _a === void 0 ? void 0 : _a.cursor)) {
                  return;
              }
              (_b = MouseCursor.getInstance()) === null || _b === void 0 ? void 0 : _b.cursor.classList.add('demo-tools-cursor-click');
              yield new Promise(r => setTimeout(() => {
                  var _a;
                  (_a = MouseCursor.getInstance()) === null || _a === void 0 ? void 0 : _a.cursor.classList.remove('demo-tools-cursor-click');
                  r(undefined);
              }, 300));
          });
      }
      static destroy() {
          var _a, _b;
          (_b = (_a = MouseCursor.getInstance()) === null || _a === void 0 ? void 0 : _a.cursor) === null || _b === void 0 ? void 0 : _b.remove();
          MouseCursor.instance = null;
      }
      static getInstance(x, y) {
          if (!MouseCursor.instance) {
              MouseCursor.instance = new MouseCursor(x || 0, y || 0);
          }
          return MouseCursor.instance;
      }
  }
  MouseCursor.amt = 0.3;

  var X_PATH_ERROR;
  (function (X_PATH_ERROR) {
      X_PATH_ERROR["CLASS_MISTMATCH"] = "Class mistmatch: ";
      X_PATH_ERROR["ID_MISTMATCH"] = "ID mistmatch: ";
      X_PATH_ERROR["ELEMENT_NOT_FOUND"] = "Element not found";
  })(X_PATH_ERROR || (X_PATH_ERROR = {}));
  class Dom {
      static getElement(arg) {
          if (isNil(arg)) {
              return;
          }
          if (is(String, arg)) {
              return document.querySelector(arg);
          }
          else if (is(HTMLElement, arg)) {
              return arg;
          }
          else if (!isNil(arg.selector) && arg.hasCorrectSelector) {
              return document.querySelector(arg.selector);
          }
          else if (!isNil(arg.xPath) && arg.hasCorrectXPath) {
              return getElementByXPath(arg.xPath);
          }
          else if (!isNil(arg.elementX) && !isNil(arg.elementY) && arg.hasCorrectCoordinates) {
              return document.elementFromPoint(arg.elementX, arg.elementY);
          }
          else if (!isNil(arg.element) && is(HTMLElement, arg.element)) {
              return arg.element;
          }
          else {
              return null;
          }
      }
      static getNthParent(element, nth) {
          if (nth === 0 || !element) {
              return element;
          }
          return Dom.getNthParent(element.parentElement, nth - 1);
      }
      static getElementXPath(element) {
          if (!element) {
              return '';
          }
          let xPath = '';
          let els = [element];
          while (els[els.length - 1].parentElement) {
              els.push(els[els.length - 1].parentElement);
          }
          els = els.reverse();
          els.forEach((el) => {
              let index = 0;
              if (el.parentElement) {
                  index = Array.from(el.parentElement.children).indexOf(el);
              }
              xPath += `/*[${index + 1}]`;
          });
          return xPath;
      }
      static click(arg) {
          try {
              const element = Dom.getElement(arg);
              if (!element) {
                  return;
              }
              const rect = element.getBoundingClientRect();
              return MouseCursor.moveCursor(rect.x + rect.width / 2, rect.y + rect.height / 2).then(() => {
                  element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                  element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
                  element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
                  Dom.blink(rect.x + rect.width / 2, rect.y + rect.height / 2);
              });
          }
          catch (e) {
          }
      }
      static rightClick(arg) {
          try {
              const element = Dom.getElement(arg);
              if (!element) {
                  return;
              }
              const rect = element.getBoundingClientRect();
              return MouseCursor.moveCursor(rect.x + rect.width / 2, rect.y + rect.height / 2).then(() => {
                  element.dispatchEvent(new MouseEvent('rightclick', { bubbles: true, cancelable: true }));
                  element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
                  Dom.blink(rect.x + rect.width / 2, rect.y + rect.height / 2, { color: 'green' });
              });
          }
          catch (e) {
          }
      }
      static hover(arg) {
          try {
              const element = Dom.getElement(arg);
              if (!element) {
                  return;
              }
              const rect = element.getBoundingClientRect();
              return MouseCursor.moveCursor(rect.x + rect.width / 2, rect.y + rect.height / 2).then(() => {
                  element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));
                  element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }));
              });
          }
          catch (e) {
          }
      }
      static focus(arg) {
          try {
              const element = Dom.getElement(arg);
              if (!element) {
                  return;
              }
              const rect = element.getBoundingClientRect();
              return MouseCursor.moveCursor(rect.x + rect.width / 2, rect.y + rect.height / 2).then(() => {
                  element.dispatchEvent(new FocusEvent('focus', { bubbles: true, cancelable: true }));
              });
          }
          catch (e) {
          }
      }
      static keydown(arg, key) {
          try {
              const element = Dom.getElement(arg);
              if (!element) {
                  return;
              }
              element.dispatchEvent(new KeyboardEvent('keydown', { key, code: key, bubbles: true }));
              element.dispatchEvent(new KeyboardEvent('keypress', { key, code: key, bubbles: true }));
          }
          catch (e) {
          }
      }
      static setValue(arg, value) {
          try {
              const element = Dom.getElement(arg);
              if (!element) {
                  return;
              }
              const rect = element.getBoundingClientRect();
              return MouseCursor.moveCursor(rect.x + rect.width / 2, rect.y + rect.height / 2)
                  .then(() => { return Dom.typeIntoInput(String(value), element); })
                  .then(() => {
                  var _a;
                  const nativeSetter = (_a = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')) === null || _a === void 0 ? void 0 : _a.set;
                  element.setAttribute('value', value);
                  nativeSetter.call(element, value);
                  element.dispatchEvent(new Event('change', { bubbles: true }));
                  element.dispatchEvent(new Event('input', { bubbles: true }));
              });
          }
          catch (e) {
          }
      }
      static typeIntoInput(text, element, speed = 10) {
          return new Promise((resolve) => {
              element.value = '';
              element.focus();
              let index = 0;
              function typeNextChar() {
                  if (index < text.length) {
                      element.value += text.charAt(index);
                      index++;
                      element.dispatchEvent(new Event('input', { bubbles: true }));
                      const randomDelay = speed + (Math.random() * 40 - 20);
                      setTimeout(typeNextChar, Math.max(10, randomDelay));
                  }
                  else {
                      element.dispatchEvent(new Event('change', { bubbles: true }));
                      resolve(undefined);
                  }
              }
              typeNextChar();
          });
      }
      static mouseCursorClickAnimation(cursorElement) {
      }
      static blink(x, y, options = {}) {
          const { size = 40, color = 'yellow', border = '2px solid yellow', duration = 400, } = options;
          const circle = document.createElement('div');
          circle.style.position = 'absolute';
          circle.style.left = `${x - size / 2}px`;
          circle.style.top = `${y - size / 2}px`;
          circle.style.width = `${size}px`;
          circle.style.height = `${size}px`;
          circle.style.borderRadius = '50%';
          circle.style.backgroundColor = color;
          circle.style.border = border;
          circle.style.pointerEvents = 'none';
          circle.style.zIndex = '999999999';
          circle.style.boxShadow = `0 0 10px ${color}`;
          circle.style.transition = `transform ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`;
          circle.style.transform = 'scale(0.2)';
          circle.style.opacity = '1';
          document.body.appendChild(circle);
          circle.getBoundingClientRect();
          circle.style.transform = 'scale(1)';
          circle.style.opacity = '0';
          setTimeout(() => {
              circle.remove();
          }, duration);
      }
      static scrollBy(arg, scrollAxe, scrollBy) {
          try {
              const element = Dom.getElement(arg);
              if (!element) {
                  return;
              }
              if (scrollAxe === 'x') {
                  element.scrollBy({
                      top: 0,
                      left: scrollBy,
                      behavior: 'smooth'
                  });
              }
              else {
                  element.scrollBy({
                      top: scrollBy,
                      left: 0,
                      behavior: 'smooth'
                  });
              }
          }
          catch (e) {
          }
      }
      static attrsMatch(el1, el2) {
          if (!el1) {
              return `${X_PATH_ERROR.ELEMENT_NOT_FOUND}: el2.toString()}`;
          }
          if (el1 instanceof HTMLElement) {
              if (!equals(el1.id, el2.id) && el2.id !== '' && !isNil(el2.id)) {
                  return `${X_PATH_ERROR.ID_MISTMATCH}: ${el1.id || '-empty-'} !== ${el2.id || '-empty-'}`;
              }
              const intersectionClasses = intersection(values(el1.classList), values(el2.classList));
              const excessiveClasses = values(el1.classList).filter(c => !values(el1.classList).includes(c));
              const missingClasses = values(el2.classList).filter(c => !values(el1.classList).includes(c));
              if (Math.abs(1 - intersectionClasses.length / values(el2.classList).length) > 0.25) {
                  return `${X_PATH_ERROR.CLASS_MISTMATCH}\n\tMissing classes: ${missingClasses.join(', ')}\n\tExcessive classes: ${excessiveClasses.join(', ')}`;
              }
          }
          return true;
      }
      static getClosestToXPathIndex(elements, xPath) {
          const xPaths = elements.map(e => Dom.getElementXPath(e));
          const similarities = xPaths.map(curXPAth => getStringSimilarity(xPath, curXPAth));
          let index = 0;
          let maxSimilarity = 0;
          similarities.forEach((similarity, i) => {
              if (similarity > maxSimilarity) {
                  maxSimilarity = similarity;
                  index = i;
              }
          });
          return index;
      }
      static isElementInViewport(arg) {
          const element = Dom.getElement(arg);
          if (!element) {
              return false;
          }
          return Boolean(element.checkVisibility());
      }
  }

  class Steps {
      static init() {
          window.addEventListener('Demo:OptionsChanged', Steps.handleDemoToolsOptionsChanged);
          window.addEventListener('Demo:StepsChanged', Steps.handleDemoToolsStepsChanged);
          window.addEventListener('Demo:StepChanged', Steps.handleDemoToolsStepChanged);
          window.addEventListener('Demo:ActiveStepChanged', Steps.handleDemoToolsActiveStepChanged);
          window.addEventListener('Demo:ElementBoundStepCheckFail', Steps.handleDemoToolsElementBoundStepCheckFail);
          if (options.mode === 'compose') {
              PlanStepForm.init();
          }
          Steps.setElement();
          Steps.state.initialized = true;
      }
      static handleDemoToolsOptionsChanged() {
          Steps.renderStepList();
      }
      static handleDemoToolsStepsChanged({ detail: { steps } }) {
          if (options.editable) {
              (Steps.steps || []).forEach((step, index) => {
                  var _a;
                  (_a = step.editForm) === null || _a === void 0 ? void 0 : _a.destroy();
                  Steps.steps[index].editForm = null;
              });
          }
          Steps.steps = steps.map(step => new Step$1(step));
          Steps.renderStepList();
      }
      static handleDemoToolsStepChanged({ detail: { step, index } }) {
          const updatedStep = new Step$1(step);
          updatedStep.editForm = Steps.steps[index].editForm;
          Steps.steps[index] = updatedStep;
          Steps.renderStep(index);
      }
      static handleDemoToolsActiveStepChanged({ detail: { activeStep, scrollntoView } }) {
          Steps.setActiveStep(activeStep, scrollntoView);
      }
      static handleStepDoubleClick(index) {
          window.dispatchEvent(new CustomEvent(Steps.eventTypes.STEP_DOUBLECLICK, { detail: { index } }));
      }
      static handleDemoToolsElementBoundStepCheckFail({ detail: { step, index } }) {
          Steps.markFailedElementBoundStep(step, index);
      }
      static handleStepClick(event, index) {
          if (event.ctrlKey) {
              window.dispatchEvent(new CustomEvent(Steps.eventTypes.STEP_CTRL_CLICK, { detail: { index } }));
          }
          else {
              window.dispatchEvent(new CustomEvent(Steps.eventTypes.STEP_CLICK, { detail: { index } }));
          }
      }
      static add(step) {
          Steps.steps.push(step);
      }
      static setElement() {
          const area = document.createElement('div');
          area.setAttribute('class', 'demo-tools-steps');
          const title = document.createElement('h3');
          title.innerHTML = 'Demo steps';
          title.setAttribute('class', 'demo-tools-steps-title');
          const list = Steps.getStepListElement();
          area.appendChild(title);
          if (options.mode === 'compose') {
              area.appendChild(PlanStepForm.area);
          }
          area.appendChild(list);
          Steps.area = area;
          Steps.setupInteractivity();
      }
      static renderStepList() {
          var _a;
          if (!Steps.state.initialized) {
              throw new Error('DevTools: Steps are not initialized');
          }
          if (options.editable) {
              (Steps.steps || []).forEach((step, index) => {
                  Steps.steps[index].editForm = new StepEditForm(step, index);
              });
          }
          const scrollTop = ((_a = Steps.area.querySelector('.demo-tools-steps-list')) === null || _a === void 0 ? void 0 : _a.scrollTop) || 0;
          Steps.unmountStepList();
          const list = Steps.getStepListElement();
          Steps.area.appendChild(list);
          Steps.setupInteractivity();
          list.scrollTo({
              top: scrollTop
          });
          window.dispatchEvent(new CustomEvent(Steps.eventTypes.STEP_LIST_RENDERED));
      }
      static renderStep(index) {
          const stepEl = document.querySelectorAll('.demo-tools-steps-list .demo-tools-step')[index];
          const newStepEl = Steps.getStepElement(index);
          stepEl.replaceWith(newStepEl);
          Steps.addStepEventListeners(newStepEl, index);
      }
      static setActiveStep(index, scrollntoView) {
          if (!isNil(index) && !Steps.steps[index].list && !(options.verbose || options.editable)) {
              return;
          }
          const stepEls = document.querySelectorAll('.demo-tools-steps-list .demo-tools-step');
          for (let i = 0; i < stepEls.length; i++) {
              if (!Steps.steps[i].list && !(options.verbose || options.editable)) {
                  continue;
              }
              stepEls[i].classList.remove('completed');
              stepEls[i].classList.remove('active');
          }
          if (isNil(index)) {
              return;
          }
          for (let i = 0; i < index; i++) {
              if (!Steps.steps[i].list && !(options.verbose || options.editable)) {
                  continue;
              }
              stepEls[i].classList.add('completed');
              stepEls[i].classList.remove('active');
          }
          stepEls[index].classList.add('active');
          Steps.setActiveSection(index);
          if (scrollntoView) {
              stepEls[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }
      static setActiveSection(activeStepIndex) {
          let index = activeStepIndex;
          while (index >= 0 && Steps.steps[index].type !== 'section') {
              index--;
          }
          if (index < 0) {
              return;
          }
          const stepEls = document.querySelectorAll('.demo-tools-steps-list .demo-tools-step');
          stepEls[index].classList.remove('completed');
          stepEls[index].classList.add('active');
      }
      static getStepListElement() {
          const list = document.createElement('div');
          list.setAttribute('style', 'overflow-y: auto; padding-left: 1px; display: flex; flex-direction: column; gap: 2px;');
          list.setAttribute('class', 'demo-tools-steps-list');
          Steps.steps.forEach((_, index) => {
              list.appendChild(Steps.getStepElement(index));
          });
          return list;
      }
      static getStepElement(index) {
          var _a, _b, _c;
          const step = Steps.steps[index];
          const div = document.createElement('div');
          if (!step.list && !(options.verbose || options.editable)) {
              div.setAttribute('style', 'display: none;');
          }
          div.classList.add('demo-tools-step');
          div.classList.add(`type-${step.type}`);
          if (!step.isFilled) {
              div.classList.add('unfilled');
              div.setAttribute('title', 'This step is not properly defined');
          }
          const titleElement = document.createElement('div');
          const labelsElement = document.createElement('div');
          if (options.verbose && !options.editable) {
              if (!step.list) {
                  titleElement.innerHTML = `<div>${index} ${step.title} <sub>unlisted</sub></div>`;
              }
              else {
                  titleElement.innerHTML = `<div>${index} ${step.title}</div>`;
              }
          }
          else if (options.editable) {
              titleElement.appendChild(step.editForm.area);
          }
          else {
              titleElement.innerHTML = step.title;
          }
          if (!(options === null || options === void 0 ? void 0 : options.skipChecks) && !step.elementBoundCheck) {
              if (step.xPathCheck === false && step.coordCheck === false) {
                  const element = getElementByXPath(step.xPath);
                  const selector = `${step.element.localName}${((_a = step.element.classList) === null || _a === void 0 ? void 0 : _a.length) ? `.${values(step.element.classList).join('.')}` : ''}`;
                  const elementNew = (element === null || element === void 0 ? void 0 : element.closest(selector)) ||
                      ((_b = element.parentElement) === null || _b === void 0 ? void 0 : _b.querySelector(selector));
                  div.classList.add('unavailable');
                  div.setAttribute('title', `HTML Element looks unavailable:\n${step.xPathError}`);
                  const buttons = [];
                  buttons.push(`<button onclick="window.demoTools.demo?.checkStep(${index}, event)">Check</button>`);
                  if (elementNew) {
                      buttons.push(`<button onclick="window.demoTools.demo?.fixStepXPath(${index}, event)" title="Look around">Fix</button>`);
                  }
                  buttons.push(`<button onclick="window.demoTools.demo?.ignoreXPathError(${index}, event)">Ignore</button>`);
                  div.appendChild(titleElement);
                  div.innerHTML += `<div class="demo-tools-action-buttons">
            ${buttons.join('')}
          </div>`;
              }
              else if (step.xPathCheck === 'ignored') {
                  div.classList.add('ignored');
                  div.setAttribute('title', 'XPath error is ignored');
                  div.appendChild(titleElement);
              }
              else {
                  div.appendChild(titleElement);
              }
          }
          else {
              div.appendChild(titleElement);
          }
          if ((_c = step.labels) === null || _c === void 0 ? void 0 : _c.length) {
              const labels = step.labels.map(label => `<span class="demo-tools-step-label">${label}</span>`);
              labelsElement.innerHTML = labels.join('');
              div.appendChild(labelsElement);
          }
          return div;
      }
      static markFailedElementBoundStep(step, index) {
          var _a;
          if (isNil(index) || isNil(step) || isNil(Steps.area)) {
              return;
          }
          let selector = step.element.localName
              + (step.element.id ? `#${step.element.id}` : '')
              + ((_a = step.element.classList) === null || _a === void 0 ? void 0 : _a.length) ? `.${values(step.element.classList).join('.')}` : '';
          const similarElements = selector ?
              Array.from(document.querySelectorAll(selector)).filter((e) => e.checkVisibility()) :
              [];
          const stepEls = Steps.area.querySelectorAll('.demo-tools-steps-list .demo-tools-step');
          const stepEl = stepEls[index];
          stepEl.classList.add('unavailable');
          let title = 'HTML Element not found';
          let description = `<p>Selector: ${selector}</p>`;
          let highlightEl = stepEl;
          window.demoTools.demo.driver = window.demoTools.demo.Driver({
              showButtons: [],
              overlayOpacity: 0.4,
              popoverClass: 'demo-tools-driver-popover',
          });
          if (similarElements.length > 0) {
              title = 'Original HTML Element looks like not found';
              const elsArr = similarElements.slice(0, 50);
              window.demoTools.demo.highlighter.items = elsArr.map((e) => ({
                  element: e,
                  actions: [{
                          label: 'Ok',
                          action: () => {
                              var _a;
                              (_a = window.demoTools.demo) === null || _a === void 0 ? void 0 : _a.updateStep(index, Dom.getElementXPath(e));
                          }
                      }]
              }));
              let mostSimilarIndex = 0;
              if (elsArr.length === 1) {
                  description += `<p>
          Found 1 similar element 
          <div class="demo-tools-action-buttons">
            <button autofocus onclick="window.demoTools.demo.driver.destroy(); window.demoTools.demo?.updateStep(${index}, window.demoTools.demo.dom.getElementXPath(window.demoTools.demo.highlighter.items[0].element)); window.demoTools.demo.highlighter.destroy();">Ok</button>
          </div>
        </p>`;
              }
              else {
                  mostSimilarIndex = Dom.getClosestToXPathIndex(elsArr, step.xPath);
                  description += `<p>
        Found ${similarElements.length} similar elements 
        <div class="demo-tools-action-buttons">
          <button autofocus onclick="window.demoTools.demo.driver.destroy(); window.demoTools.demo?.updateStep(${index}, window.demoTools.demo.dom.getElementXPath(window.demoTools.demo.highlighter.items[${mostSimilarIndex}].element)); window.demoTools.demo.highlighter.destroy();">Ok</button>
          <button onclick="window.demoTools.demo.driver.destroy(); window.demoTools.demo.highlighter.highlight();">Check All</button>
        </div>
      </p>`;
              }
              highlightEl = window.demoTools.demo.highlighter.items[mostSimilarIndex].element;
          }
          else {
              description += '<p>No similar elements found</p>';
          }
          window.demoTools.demo.driver.highlight({
              element: highlightEl,
              popover: {
                  description: `<b>${title}</b>${description}`,
                  onCloseClick: () => {
                      window.demoTools.demo.driver.destroy();
                      window.demoTools.demo.highlighter.destroy();
                  }
              }
          });
      }
      static allocate(width) {
          const area = document.createElement('div');
          area.setAttribute('class', 'demo-tools-steps');
          if (width) {
              area.setAttribute('style', `width: ${width}px;`);
          }
          document.body.style.display = 'flex';
          document.body.appendChild(area);
      }
      static clear() {
          document.body.querySelectorAll('.demo-tools-steps').forEach((el) => {
              var _a;
              el.setAttribute('style', `width: ${el.clientWidth}px; min-width: ${el.clientWidth}px;`);
              (_a = el.querySelector('.demo-tools-steps-list')) === null || _a === void 0 ? void 0 : _a.remove();
          });
      }
      static unmountStepList() {
          document.body.querySelectorAll('.demo-tools-steps .demo-tools-steps-list').forEach(el => el.remove());
      }
      static unmount() {
          document.body.querySelectorAll('.demo-tools-steps').forEach(el => el.remove());
      }
      static destroy() {
          Steps.unmount();
          window.removeEventListener('Demo:StepsChanged', Steps.handleDemoToolsStepsChanged);
          window.removeEventListener('Demo:StepChanged', Steps.handleDemoToolsStepChanged);
          window.removeEventListener('Demo:OptionsChanged', Steps.handleDemoToolsOptionsChanged);
          window.removeEventListener('Demo:StepChanged', Steps.handleDemoToolsStepChanged);
          window.removeEventListener('Demo:ElementBoundStepCheckFail', Steps.handleDemoToolsElementBoundStepCheckFail);
          Steps.area = null;
          Steps.steps = [];
          if (options.mode === 'compose') {
              PlanStepForm.destroy();
          }
          Steps.state.initialized = false;
      }
      static setupInteractivity() {
          if (options.editable) {
              return;
          }
          Sortable.create(Steps.area.querySelector('.demo-tools-steps-list'), {
              onEnd: (evt) => {
                  var _a;
                  if ((_a = evt === null || evt === void 0 ? void 0 : evt.originalEvent) === null || _a === void 0 ? void 0 : _a.ctrlKey) {
                      const newIndex = evt.newIndex < evt.oldIndex ? evt.newIndex : evt.newIndex + 1;
                      window.dispatchEvent(new CustomEvent(Steps.eventTypes.STEP_COPY, {
                          detail: {
                              from: evt.oldIndex,
                              to: newIndex
                          }
                      }));
                  }
                  else {
                      window.dispatchEvent(new CustomEvent(Steps.eventTypes.STEP_MOVE, {
                          detail: {
                              from: evt.oldIndex,
                              to: evt.newIndex
                          }
                      }));
                  }
              }
          });
          Steps.area.querySelectorAll('.demo-tools-steps-list .demo-tools-step').forEach((el, index) => {
              Steps.addStepEventListeners(el, index);
          });
      }
      static addStepEventListeners(el, index) {
          el.addEventListener('click', (e) => {
              Steps.handleStepClick(e, index);
          });
          el.addEventListener('dblclick', () => {
              Steps.handleStepDoubleClick(index);
          });
      }
  }
  Steps.area = null;
  Steps.steps = [];
  Steps.state = {
      initialized: false,
  };
  Steps.eventTypes = {
      STEP_DOUBLECLICK: 'DemoTools:Steps:StepDoubleclick',
      STEP_MOVE: 'DemoTools:Steps:StepMove',
      STEP_COPY: 'DemoTools:Steps:StepCopy',
      STEP_CLICK: 'DemoTools:Steps:StepClick',
      STEP_CTRL_CLICK: 'DemoTools:Steps:StepCtrlClick',
      STEP_LIST_RENDERED: 'DemoTools:Steps:StepListRendered',
  };
  class StepEditForm {
      constructor(step, index) {
          this.area = null;
          this.index = null;
          this.index = index;
          const div = document.createElement('div');
          const indexWrapper = document.createElement('div');
          const titleWrapper = document.createElement('div');
          const intervalWrapper = document.createElement('div');
          const listWrapper = document.createElement('div');
          const titleInput = document.createElement('input');
          const intervalInput = document.createElement('input');
          const listCheckbox = document.createElement('input');
          indexWrapper.innerHTML = `<span>${index}</span>`;
          titleInput.setAttribute('value', step.title);
          titleInput.setAttribute('type', 'text');
          intervalInput.setAttribute('type', 'number');
          intervalInput.setAttribute('min', '0');
          intervalInput.setAttribute('value', String(step.interval));
          intervalInput.setAttribute('step', '1000');
          intervalInput.setAttribute('size', '3');
          listCheckbox.setAttribute('type', 'checkbox');
          if (step.list) {
              listCheckbox.setAttribute('checked', 'checked');
          }
          titleInput.classList.add('demo-tools-steps-edit-form-title');
          intervalInput.classList.add('demo-tools-steps-edit-form-interval');
          listCheckbox.classList.add('demo-tools-steps-edit-form-list');
          titleInput.addEventListener('blur', this.onTitleBlur.bind(this));
          intervalInput.addEventListener('blur', this.onIntervalBlur.bind(this));
          intervalInput.addEventListener('change', this.onIntervalChange.bind(this));
          listCheckbox.addEventListener('blur', this.onListBlur.bind(this));
          titleWrapper.appendChild(titleInput);
          intervalWrapper.appendChild(intervalInput);
          listWrapper.appendChild(listCheckbox);
          div.classList.add('demo-tools-steps-edit-form');
          div.appendChild(indexWrapper);
          div.appendChild(titleWrapper);
          div.appendChild(intervalWrapper);
          div.appendChild(listWrapper);
          this.area = div;
      }
      onTitleBlur(e) {
          window.dispatchEvent(new CustomEvent(StepEditForm.eventTypes.CHANGE, { detail: { value: e.currentTarget.value, field: 'title', index: this.index } }));
      }
      onIntervalBlur(e) {
          window.dispatchEvent(new CustomEvent(StepEditForm.eventTypes.CHANGE, { detail: { value: e.currentTarget.value, field: 'interval', index: this.index } }));
      }
      onIntervalChange(e) {
          window.dispatchEvent(new CustomEvent(StepEditForm.eventTypes.CHANGE, { detail: { value: e.currentTarget.value, field: 'interval', index: this.index } }));
      }
      onListBlur(e) {
          window.dispatchEvent(new CustomEvent(StepEditForm.eventTypes.CHANGE, { detail: { value: e.currentTarget.checked, field: 'list', index: this.index } }));
      }
      destroy() {
          const titleInput = this.area.querySelector('.demo-tools-steps-edit-form-title');
          const intervalInput = this.area.querySelector('.demo-tools-steps-edit-form-interval');
          const listCheckbox = this.area.querySelector('.demo-tools-steps-edit-form-list');
          titleInput === null || titleInput === void 0 ? void 0 : titleInput.removeEventListener('blur', this.onTitleBlur.bind(this));
          intervalInput === null || intervalInput === void 0 ? void 0 : intervalInput.removeEventListener('blur', this.onIntervalBlur.bind(this));
          intervalInput.removeEventListener('change', this.onIntervalChange.bind(this));
          listCheckbox === null || listCheckbox === void 0 ? void 0 : listCheckbox.removeEventListener('blur', this.onListBlur.bind(this));
          this.area.remove();
          this.area = null;
      }
  }
  StepEditForm.eventTypes = {
      CHANGE: 'DemoTools:Steps:EditForm:Change',
  };

  var css_248z$2 = ".demo-tools-driver-popover{max-width:500px}.demo-tools-driver-popover #demo-tools-step-picker-form{align-items:center;display:grid;gap:5px;grid-template-columns:auto 1fr}.demo-tools-driver-popover #demo-tools-step-picker-form #demo-tools-step-picker-form-highlight-fields{display:grid;grid-column:1/3;grid-template-columns:auto 1fr}.demo-tools-driver-popover #demo-tools-step-picker-form #demo-tools-step-picker-form-selector-fields .demo-tools-step-picker-form-control{align-items:center;display:flex;gap:3px}.demo-tools-driver-popover #demo-tools-step-picker-form #demo-tools-step-picker-form-selector-fields .demo-tools-step-picker-form-control input:first-child{flex:1}.demo-tools{background-color:#fff;display:flex;flex-direction:column}.demo-tools h3{border-bottom:2px solid #eee;color:#333;font-weight:600;margin-top:0;padding:0 4px 4px}.demo-tools .demo-tools-action-buttons{display:flex;gap:3px}.demo-tools .demo-tools-action-buttons button{font-size:.8em;line-height:.4em}.demo-tools.demo-tools-toolbar{border:2px solid #ddd;display:flex;flex-direction:column;width:500px;z-index:99999999}.demo-tools.demo-tools-toolbar .demo-tools-toolbar-section.demo-tools-toolbar-steps{flex:1;min-height:60%}.demo-tools #demo-tools-info{display:flex;flex-direction:column}.demo-tools #demo-tools-info .demo-tools-info-section{display:grid;gap:0 5px;grid-template-columns:auto 1fr;padding:2px}.demo-tools #demo-tools-info .demo-tools-info-section *{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.demo-tools.demo-tools-help-popover{inset:10px!important;margin:20px;max-height:100%;max-width:max-content}.demo-tools.demo-tools-help-popover #driver-popover-description{max-height:calc(100vh - 170px);overflow:auto}.demo-tools.demo-tools-help-popover .demo-tools-help{display:flex;gap:20px}.demo-tools.demo-tools-help-popover .demo-tools-help td{vertical-align:top}.demo-tools button:not(.lg),.demo-tools input[type=number]:not(.lg),.demo-tools input[type=text]:not(.lg),.demo-tools select:not(.lg){height:20px}.demo-tools select{padding-top:0!important}.driver-overlay{z-index:10000000!important}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0eWxlLmxlc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMkJBQ0UsZUFDRixDQUZBLHdEQU1JLGtCQUFBLENBSEEsWUFBQSxDQUVBLE9BQUEsQ0FEQSw4QkFJSixDQVJBLHNHQVVNLFlBQUEsQ0FEQSxlQUFBLENBRUEsOEJBRU4sQ0FiQSwwSUFpQlEsa0JBQUEsQ0FEQSxZQUFBLENBRUEsT0FBUixDQWxCQSw0SkFxQlUsTUFBVixDQVFBLFlBQ0UscUJBQUEsQ0FDQSxZQUFBLENBQ0EscUJBTkYsQ0FHQSxlQVFJLDRCQUFBLENBREEsVUFBQSxDQURBLGVBQUEsQ0FJQSxZQUFBLENBREEsaUJBTEosQ0FKQSx1Q0FjSSxZQUFBLENBQ0EsT0FQSixDQVJBLDhDQW1CTSxjQUFBLENBREEsZ0JBTk4sQ0FXRSwrQkFLRSxxQkFBQSxDQUpBLFlBQUEsQ0FDQSxxQkFBQSxDQUNBLFdBQUEsQ0FDQSxnQkFSSixDQVlNLG9GQUVFLE1BQUEsQ0FEQSxjQVRSLENBdkJBLDZCQXVDSSxZQUFBLENBQ0EscUJBYkosQ0EzQkEsc0RBNENNLFlBQUEsQ0FFQSxTQUFBLENBREEsOEJBQUEsQ0FGQSxXQVZOLENBakNBLHdEQW1EUSxlQUFBLENBREEsc0JBQUEsQ0FEQSxrQkFYUixDQWtCRSxvQ0FDRSxvQkFBQSxDQUdBLFdBQUEsQ0FEQSxlQUFBLENBREEscUJBZEosQ0FZRSxnRUFRSSw4QkFBQSxDQURBLGFBZk4sQ0FRRSxxREFZSSxZQUFBLENBQ0EsUUFqQk4sQ0FJRSx3REFnQk0sa0JBakJSLENBdUJJLHNJQUNFLFdBbEJOLENBN0RBLG1CQW9GSSx1QkFwQkosQ0F3QkEsZ0JBQ0UsMEJBdEJGIiwiZmlsZSI6InN0eWxlLmxlc3MifQ== */";
  styleInject(css_248z$2);

  class StepForm {
      static init() {
          StepForm.driver = Ae({
              popoverClass: 'demo-tools-driver-popover',
          });
      }
      static getFormValues() {
          return {
              title: document.getElementById('demo-tools-step-picker-form-title').value,
              type: document.getElementById('demo-tools-step-picker-form-type').value,
              description: document.getElementById('demo-tools-step-picker-form-description').value,
              shiftX: +document.getElementById('demo-tools-step-picker-form-shiftX').value,
              shiftY: +document.getElementById('demo-tools-step-picker-form-shiftY').value,
              shiftWidth: +document.getElementById('demo-tools-step-picker-form-shiftWidth').value,
              shiftHeight: +document.getElementById('demo-tools-step-picker-form-shiftHeight').value,
              interval: +document.getElementById('demo-tools-step-picker-form-interval').value,
              list: document.getElementById('demo-tools-step-picker-form-list').checked,
              xPath: StepForm.getSelectorValue() ? null : document.getElementById('demo-tools-step-picker-form-xPath').value,
              value: document.getElementById('demo-tools-step-picker-form-type').value === 'setValue' ?
                  document.getElementById('demo-tools-step-picker-form-value').value :
                  undefined,
              keyboardKey: document.getElementById('demo-tools-step-picker-form-type').value === 'keyboard' ?
                  document.getElementById('demo-tools-step-picker-form-keyboardKey').value :
                  undefined,
              selector: StepForm.getSelectorValue(),
              scrollAxe: document.getElementById('demo-tools-step-picker-form-scrollAxe').value,
              scrollBy: document.getElementById('demo-tools-step-picker-form-scrollBy').value,
          };
      }
      static setFormValues(values) {
          Object.entries(values).forEach(([key, value]) => {
              const formElement = document.getElementById(`demo-tools-step-picker-form-${key}`);
              if (formElement) {
                  formElement.value = String(value);
              }
          });
      }
      static getPrompt(arg) {
          return __awaiter(this, void 0, void 0, function* () {
              if (isNil(StepForm.driver)) {
                  throw new Error('DevTools: StepPicker is not initialized');
              }
              let formValues = {};
              let element = {};
              if (isNil(arg)) {
                  throw new Error('DevTools: Step not passed');
              }
              if (is(String, arg)) {
                  element = getElementByXPath(arg);
                  formValues = { xPath: arg };
              }
              else if (arg.selector) {
                  element = document.querySelector(arg.selector);
                  formValues = arg;
              }
              else if (arg.xPath) {
                  element = getElementByXPath(arg.xPath);
                  formValues = arg;
              }
              return yield new Promise((resolve) => {
                  StepForm.driver.highlight({
                      element,
                      popover: {
                          popoverClass: 'demo-tools-driver-popover',
                          description: StepForm.getForm(formValues),
                          showButtons: ['next', 'close'],
                          nextBtnText: 'Done',
                          onPopoverRender: (popoverDom) => {
                              var _a, _b;
                              const handleKeydown = (e) => {
                                  if (e.key === 'Enter') {
                                      if (StepForm.resolveForm(resolve)) {
                                          StepForm.driver.destroy();
                                      }
                                  }
                              };
                              setTimeout(() => { var _a; return (_a = popoverDom.wrapper.querySelector('input')) === null || _a === void 0 ? void 0 : _a.focus(); }, 100);
                              (_a = popoverDom.wrapper) === null || _a === void 0 ? void 0 : _a.removeEventListener('keydown', handleKeydown);
                              (_b = popoverDom.wrapper) === null || _b === void 0 ? void 0 : _b.addEventListener('keydown', handleKeydown);
                          },
                          onNextClick: () => {
                              if (StepForm.resolveForm(resolve)) {
                                  StepForm.driver.destroy();
                              }
                          },
                          onCloseClick: () => {
                              resolve(undefined);
                              StepForm.driver.destroy();
                          },
                      },
                  });
              });
          });
      }
      static resolveForm(resolve) {
          const formValues = StepForm.getFormValues();
          const element = formValues.xPath ? getElementByXPath(formValues.xPath) : document.querySelector(formValues.selector);
          const resElement = {
              classList: pipe(values, filter(cl => cl !== 'driver-active-element'))((element === null || element === void 0 ? void 0 : element.classList) || []),
              id: element === null || element === void 0 ? void 0 : element.id,
              localName: element === null || element === void 0 ? void 0 : element.localName,
          };
          if ((isEmpty(resElement.classList) || isNil(resElement.classList)) && (isEmpty(resElement.id) || isNil(resElement.id))) {
              if (!confirm('Element class list and id are missing')) {
                  return false;
              }
          }
          resolve(Object.assign(Object.assign({}, formValues), { element: resElement }));
          return true;
      }
      static getForm(values) {
          let element;
          if (values === null || values === void 0 ? void 0 : values.element) {
              element = values === null || values === void 0 ? void 0 : values.element;
          }
          else if (values === null || values === void 0 ? void 0 : values.selector) {
              element = document.querySelector(values === null || values === void 0 ? void 0 : values.selector);
          }
          else if (values === null || values === void 0 ? void 0 : values.xPath) {
              element = getElementByXPath(values === null || values === void 0 ? void 0 : values.xPath);
          }
          else {
              throw new Error('DevTools: Step element is missing');
          }
          if (!element) {
              throw new Error('DevTools: Step element is missing');
          }
          const xPathSegments = (values.xPath || '').split('/').filter(Boolean);
          return `
      <div class="demo-tools" id="demo-tools-step-picker-form">
        <div class="demo-tools-step-picker-form-label">Title:</div>
        <div class="demo-tools-step-picker-form-control"><input type="text" id="demo-tools-step-picker-form-title" autofocus value="${(values === null || values === void 0 ? void 0 : values.title) || ''}" /></div>
        <div class="demo-tools-step-picker-form-label">Interval:</div>
        <div class="demo-tools-step-picker-form-control"><input type="number" id="demo-tools-step-picker-form-interval" value="${(values === null || values === void 0 ? void 0 : values.interval) || Demo.defaultInterval}" step="100" />&nbsp;ms</div>
        <div class="demo-tools-step-picker-form-label">Listed:</div>
        <div class="demo-tools-step-picker-form-control"><input type="checkbox" id="demo-tools-step-picker-form-list" checked="${is(Boolean, values === null || values === void 0 ? void 0 : values.list) ? values.list.toString() : 'true'}" /></div>
        <div class="demo-tools-step-picker-form-label">Type:</div>
        <div class="demo-tools-step-picker-form-control">
          <select id="demo-tools-step-picker-form-type" onchange="window.demoTools.demo.stepForm.onStepTypeChange()">
            <option value="highlight" ${(values === null || values === void 0 ? void 0 : values.type) === 'highlight' || isNil(values === null || values === void 0 ? void 0 : values.type) ? 'selected' : ''}>Highlight</option>
            <option value="click" ${(values === null || values === void 0 ? void 0 : values.type) === 'click' ? 'selected' : ''}>Click</option>
            <option value="rightclick" ${(values === null || values === void 0 ? void 0 : values.type) === 'rightclick' ? 'selected' : ''}>Right Click</option>
            <option value="hover" ${(values === null || values === void 0 ? void 0 : values.type) === 'hover' ? 'selected' : ''}>Hover</option>
            <option value="setValue" ${(values === null || values === void 0 ? void 0 : values.type) === 'setValue' ? 'selected' : ''}>Set Value</option>
            <option value="keyboard" ${(values === null || values === void 0 ? void 0 : values.type) === 'keyboard' ? 'selected' : ''}>Keyboard</option>
            <option value="scroll" ${(values === null || values === void 0 ? void 0 : values.type) === 'scroll' ? 'selected' : ''}>Scroll</option>
          </select>
        </div>
        <div class="demo-tools-step-picker-form-label">Ascend:</div>
        <div class="demo-tools-step-picker-form-control" style="align-items: flex-start;display: flex;gap: 5px;">
          <select id="demo-tools-step-picker-form-xPath" style="width: 50px;" onchange="window.demoTools.demo.stepForm.onXpathChange()">
            ${xPathSegments.map((_, index) => {
            return `<option value="/${xPathSegments.slice(0, xPathSegments.length - index).join('/')}">${index}</option>`;
        })}
          </select>
          <span title="${element.localName}.${[...element.classList].join('.')}" style="color: blue; font-size: 1.2em; line-height: 1em; cursor: pointer;">&#9432;</span>
        </div>
        <div class="demo-tools-step-picker-form-label">Selector:</div>
        <div class="demo-tools-step-picker-form-control">
            <input type="checkbox" id="demo-tools-step-picker-form-useSelector" onclick="window.demoTools.demo.stepForm.onUseSelectorClick()" ${(values === null || values === void 0 ? void 0 : values.selector) ? 'checked' : ''} />
        </div>
        <div id="demo-tools-step-picker-form-highlight-fields" style="gap: 5px; align-items: center; grid-column: 1/3; grid-template-columns: auto 1fr; display: ${(values === null || values === void 0 ? void 0 : values.type) === 'highlight' || isNil(values === null || values === void 0 ? void 0 : values.type) ? 'grid' : 'none'};">
          <div class="demo-tools-step-picker-form-label">Description:</div>
          <div class="demo-tools-step-picker-form-control"><input type="text" id="demo-tools-step-picker-form-description" value="${(values === null || values === void 0 ? void 0 : values.description) || ''}" /></div>
          <div class="demo-tools-step-picker-form-label">Shift X:</div>
          <div class="demo-tools-step-picker-form-control"><input type="number" id="demo-tools-step-picker-form-shiftX" step="10" value="${values === null || values === void 0 ? void 0 : values.shiftX}" /></div>
          <div class="demo-tools-step-picker-form-label">Shift Y:</div>
          <div class="demo-tools-step-picker-form-control"><input type="number" id="demo-tools-step-picker-form-shiftY" step="10" value="${values === null || values === void 0 ? void 0 : values.shiftY}" /></div>
          <div class="demo-tools-step-picker-form-label">Shift Width:</div>
          <div class="demo-tools-step-picker-form-control"><input type="number" id="demo-tools-step-picker-form-shiftWidth" step="10" value="${values === null || values === void 0 ? void 0 : values.shiftWidth}" /></div>
          <div class="demo-tools-step-picker-form-label">Shift Height:</div>
          <div class="demo-tools-step-picker-form-control"><input type="number" id="demo-tools-step-picker-form-shiftHeight" step="10" value="${values === null || values === void 0 ? void 0 : values.shiftHeight}" /></div>
        </div>
        <div id="demo-tools-step-picker-form-setValue-fields" style="gap: 5px; align-items: center; grid-column: 1/3; grid-template-columns: auto 1fr; display: ${(values === null || values === void 0 ? void 0 : values.type) === 'setValue' ? 'grid' : 'none'};">
          <div class="demo-tools-step-picker-form-label">Value:</div>
          <div class="demo-tools-step-picker-form-control"><input type="text" id="demo-tools-step-picker-form-value" value="${(values === null || values === void 0 ? void 0 : values.value) || ''}" /></div>
        </div>
        <div id="demo-tools-step-picker-form-keyboard-fields" style="gap: 5px; align-items: center; grid-column: 1/3; grid-template-columns: auto 1fr; display: ${(values === null || values === void 0 ? void 0 : values.type) === 'keyboard' ? 'grid' : 'none'};">
          <div class="demo-tools-step-picker-form-label">Keyboard Key:</div>
          <div class="demo-tools-step-picker-form-control">
            <select id="demo-tools-step-picker-form-keyboardKey" value="${(values === null || values === void 0 ? void 0 : values.keyboardKey) || 'Enter'}">
                <option value="Enter">Enter</option>
                <option value="Escape">Escape</option>
                <option value="Tab">Tab</option>
                <option value="Delete">Delete</option>
                <option value="Backspace">Backspace</option>
                <option value="ArrowUp">Arrow Up</option>
                <option value="ArrowDown">Arrow Down</option>
                <option value="ArrowLeft">Arrow Left</option>
                <option value="ArrowRight">Arrow Right</option>
            </select>
          </div>
        </div>
        <div id="demo-tools-step-picker-form-scroll-fields" style="gap: 5px; align-items: center; grid-column: 1/3; grid-template-columns: auto 1fr; display: ${(values === null || values === void 0 ? void 0 : values.type) === 'keyboard' ? 'grid' : 'none'};">
          <div class="demo-tools-step-picker-form-label">Axe:</div>
          <div class="demo-tools-step-picker-form-control">
            <select id="demo-tools-step-picker-form-scrollAxe" value="${(values === null || values === void 0 ? void 0 : values.scrollAxe) || 'y'}">
                <option value="y">Y</option>
                <option value="x">X</option>
            </select>
          </div>
          <div class="demo-tools-step-picker-form-label">Scroll by:</div>
          <div class="demo-tools-step-picker-form-control">
            <input id="demo-tools-step-picker-form-scrollBy" value="${(values === null || values === void 0 ? void 0 : values.scrollBy) || 100}" type="number" />&nbsp;px
          </div>
        </div>
        <div id="demo-tools-step-picker-form-selector-fields" style="gap: 5px; grid-column: 1 / 3; flex-direction: column; display: ${(values === null || values === void 0 ? void 0 : values.useSelector) || (values === null || values === void 0 ? void 0 : values.selector) ? 'flex' : 'none'};">
          <div class="demo-tools-step-picker-form-label">Element selector</div>
          <div class="demo-tools-step-picker-form-control">
            <input type="text" id="demo-tools-step-picker-form-selectorLvl0" value="${(values === null || values === void 0 ? void 0 : values.selector) || StepForm.getSelectorLvlValue(element, 0)}" title="${(values === null || values === void 0 ? void 0 : values.selector) || StepForm.getSelectorLvlValue(element, 0)}" />
            <input type="checkbox" id="demo-tools-step-picker-form-selectorLvl0Checked" checked="true" />
          </div>
          <div class="demo-tools-step-picker-form-control">
            <input type="text" id="demo-tools-step-picker-form-selectorLvl1" value="${StepForm.getSelectorLvlValue(element, 1)}" title="${StepForm.getSelectorLvlValue(element, 1)}" />
            <input type="checkbox" id="demo-tools-step-picker-form-selectorLvl1Checked" checked="true" />
          </div>
          <div class="demo-tools-step-picker-form-control">
            <input type="text" id="demo-tools-step-picker-form-selectorLvl2" value="${StepForm.getSelectorLvlValue(element, 2)}" title="${StepForm.getSelectorLvlValue(element, 2)}" />
            <input type="checkbox" id="demo-tools-step-picker-form-selectorLvl2Checked" checked="true" />
          </div>
          <div class="demo-tools-step-picker-form-control">
            <input type="text" id="demo-tools-step-picker-form-selectorLvl3" value="${StepForm.getSelectorLvlValue(element, 3)}" title="${StepForm.getSelectorLvlValue(element, 3)}" />
            <input type="checkbox" id="demo-tools-step-picker-form-selectorLvl3Checked" checked="true" />
          </div>
          <div class="demo-tools-step-picker-form-control">
            <input type="text" id="demo-tools-step-picker-form-selectorLvl4" value="${StepForm.getSelectorLvlValue(element, 4)}" title="${StepForm.getSelectorLvlValue(element, 4)}" />
            <input type="checkbox" id="demo-tools-step-picker-form-selectorLvl4Checked" checked="true" />
          </div>
        </div>
      </div>
    `;
      }
      static getSelectorValue() {
          const values = {
              useSelector: document.getElementById('demo-tools-step-picker-form-useSelector').checked,
              selectorLvl0: document.getElementById('demo-tools-step-picker-form-selectorLvl0').value,
              selectorLvl0Checked: document.getElementById('demo-tools-step-picker-form-selectorLvl0Checked').checked,
              selectorLvl1: document.getElementById('demo-tools-step-picker-form-selectorLvl1').value,
              selectorLvl1Checked: document.getElementById('demo-tools-step-picker-form-selectorLvl1Checked').checked,
              selectorLvl2: document.getElementById('demo-tools-step-picker-form-selectorLvl2').value,
              selectorLvl2Checked: document.getElementById('demo-tools-step-picker-form-selectorLvl2Checked').checked,
              selectorLvl3: document.getElementById('demo-tools-step-picker-form-selectorLvl3').value,
              selectorLvl3Checked: document.getElementById('demo-tools-step-picker-form-selectorLvl3Checked').checked,
              selectorLvl4: document.getElementById('demo-tools-step-picker-form-selectorLvl4').value,
              selectorLvl4Checked: document.getElementById('demo-tools-step-picker-form-selectorLvl4Checked').checked,
          };
          if (!values.useSelector) {
              return;
          }
          else {
              const selectors = [];
              if (values.selectorLvl4 && values.selectorLvl4Checked) {
                  selectors.push(values.selectorLvl4);
              }
              if (values.selectorLvl3 && values.selectorLvl3Checked) {
                  selectors.push(values.selectorLvl3);
              }
              if (values.selectorLvl2 && values.selectorLvl2Checked) {
                  selectors.push(values.selectorLvl2);
              }
              if (values.selectorLvl1 && values.selectorLvl1Checked) {
                  selectors.push(values.selectorLvl1);
              }
              if (values.selectorLvl0 && values.selectorLvl0Checked) {
                  selectors.push(values.selectorLvl0);
              }
              return selectors.join(' ');
          }
      }
      static getSelectorLvlValue(element, lvl) {
          const parentElement = Dom.getNthParent(element, lvl);
          if (!parentElement) {
              return '';
          }
          const selectors = [parentElement.localName];
          if (parentElement.id) {
              selectors.push(`#${parentElement.id}`);
          }
          if (parentElement.classList.length) {
              selectors.push(`.${[...parentElement.classList].join('.')}`);
          }
          return selectors.join('');
      }
      static onStepTypeChange() {
          document.getElementById('demo-tools-step-picker-form-highlight-fields').style.display = document.getElementById('demo-tools-step-picker-form-type').value === 'highlight' ? 'grid' : 'none';
          document.getElementById('demo-tools-step-picker-form-setValue-fields').style.display = document.getElementById('demo-tools-step-picker-form-type').value === 'setValue' ? 'grid' : 'none';
          document.getElementById('demo-tools-step-picker-form-keyboard-fields').style.display = document.getElementById('demo-tools-step-picker-form-type').value === 'keyboard' ? 'grid' : 'none';
          document.getElementById('demo-tools-step-picker-form-scroll-fields').style.display = document.getElementById('demo-tools-step-picker-form-type').value === 'scroll' ? 'grid' : 'none';
      }
      static onXpathChange() {
          var _a;
          const driver = (_a = window.demoTools.demo) === null || _a === void 0 ? void 0 : _a.stepForm.driver;
          const formValues = window.demoTools.demo.stepForm.getFormValues();
          const xPath = document.getElementById('demo-tools-step-picker-form-xPath').value;
          const element = getElementByXPath(xPath);
          driver.getActiveStep().element = element;
          driver.highlight(Object.assign(Object.assign({}, driver.getActiveStep()), { popover: Object.assign(Object.assign({}, driver.getActiveStep().popover), { description: StepForm.getForm(formValues) }) }));
          driver.refresh();
          setTimeout(() => {
              var _a;
              const infoIcon = document.getElementById('demo-tools-step-picker-form-xPath').nextElementSibling;
              if (infoIcon) {
                  infoIcon.title = element.localName + (element.classList.value ? '.' + ((_a = element.classList.value) === null || _a === void 0 ? void 0 : _a.replace(/ +/g, '.')) : '');
              }
          }, 1000);
      }
      static onUseSelectorClick() {
          document.getElementById('demo-tools-step-picker-form-selector-fields').style.display = document.getElementById('demo-tools-step-picker-form-useSelector').checked ? 'flex' : 'none';
      }
      static destroy() {
          var _a;
          (_a = StepForm.driver) === null || _a === void 0 ? void 0 : _a.destroy();
          StepForm.driver = null;
      }
  }

  class Step {
      constructor(step) {
          var _a, _b, _c;
          this.title = String(step.title);
          this.description = (step === null || step === void 0 ? void 0 : step.description) ? String(step.description) : '';
          this.interval = step.type === 'section' ? 0 : Number(step === null || step === void 0 ? void 0 : step.interval) || Demo.defaultInterval;
          this.type = String(step.type || 'custom');
          this.list = Boolean(step.list);
          this.selector = step.selector ? String(step.selector) : undefined;
          this.func = step.type === 'custom' && typeof step.func === 'function' ? step.func : undefined;
          this.element = (step === null || step === void 0 ? void 0 : step.element) ? {
              classList: Object.values((_a = step === null || step === void 0 ? void 0 : step.element) === null || _a === void 0 ? void 0 : _a.classList),
              id: String(((_b = step === null || step === void 0 ? void 0 : step.element) === null || _b === void 0 ? void 0 : _b.id) || ''),
              localName: String(((_c = step === null || step === void 0 ? void 0 : step.element) === null || _c === void 0 ? void 0 : _c.localName) || '')
          } : undefined;
          this.xPath = step.xPath ? String(step.xPath) : undefined;
          this.area = step.area ? {
              left: Number(step.area.left || 0),
              top: Number(step.area.top || 0),
              width: Number(step.area.width || 0),
              height: Number(step.area.height || 0),
          } : undefined;
          this.shiftX = Number(step.shiftX || 0);
          this.shiftY = Number(step.shiftY || 0);
          this.shiftWidth = Number(step.shiftWidth || 0);
          this.shiftHeight = Number(step.shiftHeight || 0);
          this.customData = step.customData ? step.customData : undefined;
          this.xPathCheck = typeof step.xPathCheck === 'boolean' ? step.xPathCheck : 'ignored';
          this.coordCheck = typeof step.coordCheck === 'boolean' ? step.coordCheck : 'ignored';
          this.value = !isEmpty(step.value) && !isNil(step.value) ?
              isNaN(step.value) ? String(step.value) : Number(step.value)
              : undefined;
          this.keyboardKey = step.keyboardKey ? String(step.keyboardKey) : undefined;
          this.areaStyle = step.areaStyle ? {
              backgroundColor: String(step.areaStyle.backgroundColor || 'revert'),
              zIndex: Number(step.areaStyle.zIndex) || 'revert',
              opacity: Number(step.areaStyle.opacity || 1),
          } : undefined;
          this.elementX = Number(step.elementX) || null;
          this.elementY = Number(step.elementY) || null;
          this.scrollAxe = step.scrollAxe ? String(step.scrollAxe) : undefined;
          this.scrollBy = step.scrollBy ? Number(step.scrollBy) : undefined;
          this.labels = step.labels ? step.labels : undefined;
      }
      get isFilled() {
          if (this.type === 'section' || this.type === 'stop' || this.type === 'wait') {
              return !!this.title;
          }
          return Boolean((this.element || this.xPath || this.selector || this.func || this.area) && this.title && !isNil(this.interval));
      }
      get xPathError() {
          if (!this.xPath) {
              return null;
          }
          if (!this.element) {
              return null;
          }
          const el = getElementByXPath(this.xPath);
          const match = Dom.attrsMatch(el, this.element);
          if (match === true) {
              return null;
          }
          else {
              return match;
          }
      }
      get hasCorrectXPath() {
          return this.xPathError === null;
      }
      get hasCorrectCoordinates() {
          if ((this.elementX === null || this.elementY === null)) {
              return true;
          }
          const element = document.elementFromPoint(this.elementX, this.elementY);
          return Dom.attrsMatch(element, this.element) === true;
      }
      get hasCorrectSelector() {
          if (!this.selector) {
              return true;
          }
          const element = document.querySelector(this.selector);
          if (!element) {
              return false;
          }
          if (!this.element) {
              return true;
          }
          return Dom.attrsMatch(element, this.element) === true;
      }
      get isVisible() {
          return Dom.isElementInViewport(this);
      }
      get isElementBound() {
          return !isNil(this.selector) || !isNil(this.xPath) || !isNil(this.area);
      }
      get elementBoundCheck() {
          return !this.isElementBound ||
              this.isVisible && ((this.xPath && this.hasCorrectXPath) ||
                  (this.elementX && this.elementY && this.hasCorrectCoordinates) ||
                  (this.selector && this.hasCorrectSelector));
      }
      get f() {
          return this.func.toString();
      }
      static pickStep(step = null) {
          return __awaiter(this, void 0, void 0, function* () {
              const hoveredEls = document.querySelectorAll(':hover');
              if (isNil(hoveredEls) || isEmpty(hoveredEls)) {
                  return;
              }
              let xPath = '';
              hoveredEls.forEach((el, i) => {
                  let index = 0;
                  if (el.parentElement) {
                      index = Array.from(el.parentElement.children).indexOf(el);
                  }
                  xPath += `/*[${index + 1}]`;
              });
              if (isEmpty(xPath)) {
                  return;
              }
              let newStep;
              if (step !== null) {
                  newStep = yield StepForm.getPrompt({
                      title: step.title,
                      xPath
                  });
              }
              else {
                  newStep = yield StepForm.getPrompt(xPath);
              }
              if (!newStep) {
                  return null;
              }
              const element = getElementByXPath(newStep.xPath);
              if (Dom.attrsMatch(element, newStep.element) === true) {
                  const rect = element.getBoundingClientRect();
                  newStep.elementX = rect.left + window.scrollX;
                  newStep.elementY = rect.top + window.scrollY;
              }
              return new Step(newStep);
          });
      }
      static getReduxActionStep(params) {
          if (isNil(window === null || window === void 0 ? void 0 : window.store)) {
              throw new Error('DemoTools: Redux store is not initialized');
          }
          return new Step({
              type: 'custom',
              title: params.title || 'Action Step',
              list: params.list === false ? false : true,
              customData: (params === null || params === void 0 ? void 0 : params.actions) ? params === null || params === void 0 ? void 0 : params.actions : window.store.getActions(params),
              func: () => {
                  const activeStep = window.demoTools.demo.steps[window.demoTools.demo.state.activeStep];
                  if (isNil(activeStep.customData) || !is(Array, activeStep.customData)) {
                      return;
                  }
                  values(activeStep.customData).forEach((action) => {
                      window.store.dispatch(action);
                  });
              }
          });
      }
      static getRestoringAppStateStep() {
          var _a;
          if (isNil(window === null || window === void 0 ? void 0 : window.store)) {
              throw new Error('DemoTools: Redux store is not initialized');
          }
          const appState = clone$1((_a = window.store) === null || _a === void 0 ? void 0 : _a.getAppState());
          if (!appState) {
              return;
          }
          appState.panels = pipe(mapObjIndexed((panel, panelId) => (Object.assign(Object.assign({}, panel), { panelId }))), values)(appState.panels);
          return new Step({
              type: 'custom',
              title: 'Restoring Panel State',
              list: false,
              customData: appState,
              func: () => {
                  var _a, _b;
                  const activeStep = window.demoTools.demo.steps[window.demoTools.demo.state.activeStep];
                  const existingAppState = ((_b = (_a = window.store) === null || _a === void 0 ? void 0 : _a.getState()) === null || _b === void 0 ? void 0 : _b[constants.APP_ID]) || [];
                  if (!existingAppState) {
                      return;
                  }
                  const storedAppState = activeStep.customData;
                  if (!storedAppState) {
                      return;
                  }
                  let newAppState = Object.assign(Object.assign({}, clone$1(storedAppState)), { panels: {} });
                  const panelIdsMap = {};
                  forEachObjIndexed((panelState, panelId) => {
                      const storedPanelState = find$1(propEq(panelState.panelType, 'panelType'), (storedAppState === null || storedAppState === void 0 ? void 0 : storedAppState.panels) || []);
                      if (storedPanelState) {
                          panelIdsMap[storedPanelState.panelId] = panelId;
                      }
                  }, existingAppState.panels || {});
                  forEachObjIndexed((existingPanelId, storedPanelId) => {
                      const props = findProp(newAppState, storedPanelId);
                      forEach(({ key, path }) => {
                          newAppState = Object.assign(Object.assign({}, newAppState), modifyPath(path.slice(0, path.length - 1), (value = {}) => (Object.assign(Object.assign({}, value), { [existingPanelId]: value === null || value === void 0 ? void 0 : value[storedPanelId] })), newAppState));
                      }, props || []);
                  }, panelIdsMap);
                  forEach((panel) => {
                      newAppState.panels[panelIdsMap[panel.panelId]] = panel;
                  }, storedAppState.panels);
                  Object.keys(existingAppState).forEach((reducerName) => {
                      if (newAppState[reducerName]) {
                          window.store.setField(`${constants.APP_ID}.${reducerName}`, newAppState[reducerName]);
                      }
                  });
              }
          });
      }
      static getRestoringGridDataStep() {
          const gridData = window.getGridData();
          if (isNil(gridData) || isEmpty(gridData)) {
              console.error('DemoTools: Grid data is not available');
              return;
          }
          return new Step({
              type: 'custom',
              title: 'Restoring Grid Data',
              list: false,
              customData: gridData,
              func: () => {
                  const activeStep = window.demoTools.demo.steps[window.demoTools.demo.state.activeStep];
                  window.setGridData(null, activeStep.customData);
              }
          });
      }
  }

  class CheckStepPrompt {
      static init() {
          CheckStepPrompt.initialized = true;
          CheckStepPrompt.driver = Ae();
      }
      static getPrompt(step, popoverTitle) {
          return __awaiter(this, void 0, void 0, function* () {
              if (isNil(CheckStepPrompt.driver)) {
                  throw new Error('DevTools: CheckStepPrompt is not initialized');
              }
              if (isNil(step)) {
                  throw new Error('DevTools: Step not passed');
              }
              const element = getElementByXPath(step.xPath);
              if (isNil(element)) {
                  throw new Error('DevTools: Element not found');
              }
              return yield new Promise((resolve) => {
                  CheckStepPrompt.driver.highlight({
                      element,
                      popover: {
                          title: popoverTitle || 'Element Check',
                          description: CheckStepPrompt.getDescription(element),
                          showButtons: ['next', 'previous', 'close'],
                          nextBtnText: 'Approve',
                          prevBtnText: 'Close',
                          onPopoverRender: (popoverDom) => {
                              var _a, _b;
                              const handleKeydown = (e) => {
                                  if (e.key === 'Enter') {
                                      CheckStepPrompt.resolve(resolve, Object.assign(Object.assign({}, step), { xPathCheck: true }));
                                      CheckStepPrompt.driver.destroy();
                                  }
                              };
                              (_a = popoverDom.wrapper) === null || _a === void 0 ? void 0 : _a.removeEventListener('keydown', handleKeydown);
                              (_b = popoverDom.wrapper) === null || _b === void 0 ? void 0 : _b.addEventListener('keydown', handleKeydown);
                          },
                          onNextClick: () => {
                              CheckStepPrompt.resolve(resolve, Object.assign(Object.assign({}, step), { xPathCheck: true }));
                              CheckStepPrompt.driver.destroy();
                          },
                          onPrevClick: () => {
                              CheckStepPrompt.resolve(resolve, undefined);
                              CheckStepPrompt.driver.destroy();
                          },
                          onCloseClick: () => {
                              CheckStepPrompt.resolve(resolve, undefined);
                              CheckStepPrompt.driver.destroy();
                          },
                      }
                  });
              });
          });
      }
      static getDescription(element) {
          var _a;
          return `${element.localName}.${(_a = element.classList.value) === null || _a === void 0 ? void 0 : _a.replaceAll(' ', '.')}`;
      }
      static resolve(resolve, step) {
          if (isNil(step)) {
              resolve(undefined);
              return;
          }
          const element = pick(['classList', 'id', 'localName'], getElementByXPath(step.xPath));
          resolve(Object.assign(Object.assign({}, step), { element }));
      }
      static destroy() {
          var _a;
          CheckStepPrompt.initialized = false;
          (_a = CheckStepPrompt.driver) === null || _a === void 0 ? void 0 : _a.destroy();
          CheckStepPrompt.driver = null;
      }
  }
  CheckStepPrompt.initialized = false;

  var css_248z$1 = ".demo-tools .menu-bar{align-items:center;color:#1266e2;display:flex;justify-content:space-between}.demo-tools .menu-bar .menu-list{align-items:flex-end;display:flex;gap:5px;padding:5px 5px 0}.demo-tools .menu-bar .menu-list .menu-item{align-items:center;border:1px solid #1266e2;border-radius:3px;cursor:pointer;display:flex;font-size:10px;font-weight:700;height:15px;justify-content:center;line-height:1em;text-align:center;width:15px}.demo-tools .menu-bar .menu-list .menu-item:hover{background-color:#fff1bd;opacity:.8}.demo-tools .menu-bar .menu-list .menu-item.gg-software-download{border:2px solid;border-bottom-left-radius:2px;border-bottom-right-radius:2px;border-top:0;box-sizing:border-box;display:block;height:6px;margin-top:8px;position:relative;transform:scale(var(--ggs,1));width:16px}.demo-tools .menu-bar .menu-list .menu-item.gg-software-download:after{border-bottom:2px solid;border-left:2px solid;bottom:4px;box-sizing:border-box;content:\"\";display:block;height:8px;left:2px;position:absolute;transform:rotate(-45deg);width:8px}.demo-tools .menu-bar .menu-list .menu-item.gg-software-download:before{background:currentColor;border-radius:3px;bottom:5px;box-sizing:border-box;content:\"\";display:block;height:10px;left:5px;position:absolute;width:2px}.demo-tools .menu-bar .menu-list .menu-item.gg-export{border:2px solid;border-top:0;box-shadow:-6px -8px 0 -6px,6px -8px 0 -6px;box-sizing:border-box;display:block;height:14px;position:relative;transform:scale(var(--ggs,1));width:18px}.demo-tools .menu-bar .menu-list .menu-item.gg-export:after,.demo-tools .menu-bar .menu-list .menu-item.gg-export:before{box-sizing:border-box;content:\"\";display:block;position:absolute}.demo-tools .menu-bar .menu-list .menu-item.gg-export:before{background:currentColor;bottom:5px;height:14px;right:6px;width:2px}.demo-tools .menu-bar .menu-list .menu-item.gg-export:after{border-left:2px solid;border-top:2px solid;bottom:14px;height:6px;right:4px;transform:rotate(45deg);width:6px}.demo-tools .menu-bar .menu-list .menu-item.gg-import{border:2px solid;border-top:0;box-shadow:-6px -8px 0 -6px,6px -8px 0 -6px;box-sizing:border-box;display:block;height:14px;position:relative;transform:scale(var(--ggs,1));width:18px}.demo-tools .menu-bar .menu-list .menu-item.gg-import:after,.demo-tools .menu-bar .menu-list .menu-item.gg-import:before{box-sizing:border-box;content:\"\";display:block;position:absolute}.demo-tools .menu-bar .menu-list .menu-item.gg-import:before{background:currentColor;bottom:5px;height:14px;right:6px;width:2px}.demo-tools .menu-bar .menu-list .menu-item.gg-import:after{border-bottom:2px solid;border-right:2px solid;bottom:4px;height:6px;right:4px;transform:rotate(45deg);width:6px}.demo-tools .menu-bar .menu-list .menu-item.gg-add-r{border:2px solid;border-radius:4px;box-sizing:border-box;display:block;height:22px;position:relative;transform:scale(var(--ggs,1));width:22px}.demo-tools .menu-bar .menu-list .menu-item.gg-add-r:after,.demo-tools .menu-bar .menu-list .menu-item.gg-add-r:before{background:currentColor;border-radius:5px;box-sizing:border-box;content:\"\";display:block;height:2px;left:4px;position:absolute;top:8px;width:10px}.demo-tools .menu-bar .menu-list .menu-item.gg-add-r:after{height:10px;left:8px;top:4px;width:2px}.demo-tools .menu-bar .menu-list .menu-item.gg-view-comfortable{border:2px solid;border-radius:3px;box-sizing:border-box;display:block;height:14px;position:relative;transform:scale(var(--ggs,1));width:20px}.demo-tools .menu-bar .menu-list .menu-item.gg-view-comfortable.gg-view-comfortable:after,.demo-tools .menu-bar .menu-list .menu-item.gg-view-comfortable.gg-view-comfortable:before{background:currentColor;box-sizing:border-box;content:\"\";display:block;position:absolute}.demo-tools .menu-bar .menu-list .menu-item.gg-view-comfortable.gg-view-comfortable:after{bottom:-2px;height:8px;left:4px;width:2px}.demo-tools .menu-bar .menu-list .menu-item.gg-view-comfortable.gg-view-comfortable:before{height:2px;left:-2px;top:4px;width:20px}.demo-tools .menu-bar .menu-list .menu-item.gg-pen{border-bottom-right-radius:1px;border-right:2px solid transparent;border-top-right-radius:1px;box-shadow:0 0 0 2px,inset -2px 0 0;box-sizing:border-box;display:block;height:4px;margin-right:-2px;position:relative;transform:rotate(-45deg) scale(var(--ggs,1));width:14px}.demo-tools .menu-bar .menu-list .menu-item.gg-pen:after,.demo-tools .menu-bar .menu-list .menu-item.gg-pen:before{box-sizing:border-box;content:\"\";display:block;position:absolute}.demo-tools .menu-bar .menu-list .menu-item.gg-pen:before{background:currentColor;border-left:0;border-radius:1px;height:4px;right:-6px;top:0;width:3px}.demo-tools .menu-bar .menu-list .menu-item.gg-pen:after{border-bottom:4px solid transparent;border-right:7px solid;border-top:4px solid transparent;height:7px;left:-11px;top:-2px;width:8px}.demo-tools .menu-bar .menu-list .menu-item.gg-check{border:2px solid transparent;border-radius:100px;box-sizing:border-box;display:block;height:22px;position:relative;transform:scale(var(--ggs,1));width:22px}.demo-tools .menu-bar .menu-list .menu-item.gg-check:after{border-style:solid;border-width:0 2px 2px 0;box-sizing:border-box;content:\"\";display:block;height:10px;left:3px;position:absolute;top:-1px;transform:rotate(45deg);transform-origin:bottom left;width:6px}.demo-tools .menu-bar .right-section{align-items:flex-end;color:#1266e2;cursor:default;display:flex;font-size:14px;font-weight:700;gap:5px;padding:0 5px}.demo-tools .menu-bar .right-section>div{cursor:pointer}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0eWxlLmxlc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsc0JBSUksa0JBQUEsQ0FDQSxhQUFBLENBSEEsWUFBQSxDQUNBLDZCQUVKLENBTEEsaUNBV00sb0JBQUEsQ0FGQSxZQUFBLENBQ0EsT0FBQSxDQUZBLGlCQUdOLENBWEEsNENBb0JRLGtCQUFBLENBSm9CLHdCQUFBLENBUXBCLGlCQUFBLENBVkEsY0FBQSxDQUdBLFlBQUEsQ0FGQSxjQUFBLENBQ0EsZUFBQSxDQUdBLFdBQUEsQ0FHQSxzQkFBQSxDQUNBLGVBQUEsQ0FGQSxpQkFBQSxDQUhBLFVBT1IsQ0FDUSxrREFFRSx3QkFBQSxDQURBLFVBRVYsQ0FFUSxpRUFPRSxnQkFBQSxDQUVBLDZCQUFBLENBQ0EsOEJBQUEsQ0FGQSxZQUFBLENBUEEscUJBQUEsQ0FFQSxhQUFBLENBR0EsVUFBQSxDQUtBLGNBQUEsQ0FUQSxpQkFBQSxDQUVBLDZCQUFBLENBQ0EsVUFPVixDQUNVLHVFQVFFLHVCQUFBLENBREEscUJBQUEsQ0FJQSxVQUFBLENBUkEscUJBQUEsQ0FGQSxVQUFBLENBQ0EsYUFBQSxDQUlBLFVBQUEsQ0FJQSxRQUFBLENBTkEsaUJBQUEsQ0FLQSx3QkFBQSxDQUpBLFNBT1osQ0FFVSx3RUFRRSx1QkFBQSxDQUhBLGlCQUFBLENBS0EsVUFBQSxDQVBBLHFCQUFBLENBRkEsVUFBQSxDQUNBLGFBQUEsQ0FLQSxXQUFBLENBRUEsUUFBQSxDQUxBLGlCQUFBLENBRUEsU0FJWixDQUlRLHNEQU9FLGdCQUFBLENBQ0EsWUFBQSxDQUNBLDJDQUFBLENBUkEscUJBQUEsQ0FFQSxhQUFBLENBR0EsV0FBQSxDQUpBLGlCQUFBLENBRUEsNkJBQUEsQ0FDQSxVQUVWLENBT1UseUhBSUUscUJBQUEsQ0FGQSxVQUFBLENBQ0EsYUFBQSxDQUVBLGlCQUxaLENBT1UsNkRBQ0UsdUJBQUEsQ0FJQSxVQUFBLENBRkEsV0FBQSxDQUNBLFNBQUEsQ0FGQSxTQUZaLENBT1UsNERBR0UscUJBQUEsQ0FDQSxvQkFBQSxDQUVBLFdBQUEsQ0FKQSxVQUFBLENBR0EsU0FBQSxDQUVBLHVCQUFBLENBTkEsU0FDWixDQVNRLHNEQU9FLGdCQUFBLENBQ0EsWUFBQSxDQUNBLDJDQUFBLENBUkEscUJBQUEsQ0FFQSxhQUFBLENBR0EsV0FBQSxDQUpBLGlCQUFBLENBRUEsNkJBQUEsQ0FDQSxVQUhWLENBV1UseUhBSUUscUJBQUEsQ0FGQSxVQUFBLENBQ0EsYUFBQSxDQUVBLGlCQVRaLENBV1UsNkRBQ0UsdUJBQUEsQ0FJQSxVQUFBLENBRkEsV0FBQSxDQUNBLFNBQUEsQ0FGQSxTQU5aLENBV1UsNERBSUUsdUJBQUEsQ0FEQSxzQkFBQSxDQUdBLFVBQUEsQ0FKQSxVQUFBLENBR0EsU0FBQSxDQUVBLHVCQUFBLENBTkEsU0FIWixDQWFRLHFEQU1FLGdCQUFBLENBRUEsaUJBQUEsQ0FQQSxxQkFBQSxDQUVBLGFBQUEsQ0FFQSxXQUFBLENBSEEsaUJBQUEsQ0FLQSw2QkFBQSxDQUhBLFVBUFYsQ0FZVSx1SEFRRSx1QkFBQSxDQUNBLGlCQUFBLENBTEEscUJBQUEsQ0FGQSxVQUFBLENBQ0EsYUFBQSxDQUlBLFVBQUEsQ0FJQSxRQUFBLENBTkEsaUJBQUEsQ0FLQSxPQUFBLENBSkEsVUFMWixDQVlVLDJEQUVFLFdBQUEsQ0FFQSxRQUFBLENBREEsT0FBQSxDQUZBLFNBUFosQ0FjUSxnRUFLRSxnQkFBQSxDQUNBLGlCQUFBLENBTEEscUJBQUEsQ0FFQSxhQUFBLENBS0EsV0FBQSxDQU5BLGlCQUFBLENBRUEsNkJBQUEsQ0FHQSxVQVhWLENBZVUscUxBTUUsdUJBQUEsQ0FGQSxxQkFBQSxDQUZBLFVBQUEsQ0FDQSxhQUFBLENBRUEsaUJBWlosQ0FlVSwwRkFHRSxXQUFBLENBREEsVUFBQSxDQUVBLFFBQUEsQ0FIQSxTQVZaLENBZVUsMkZBRUUsVUFBQSxDQUNBLFNBQUEsQ0FDQSxPQUFBLENBSEEsVUFWWixDQWlCUSxtREFZRSw4QkFBQSxDQUxBLGtDQUFBLENBSUEsMkJBQUEsQ0FIQSxtQ0FBQSxDQVBBLHFCQUFBLENBRUEsYUFBQSxDQUdBLFVBQUEsQ0FPQSxpQkFBQSxDQVhBLGlCQUFBLENBRUEsNENBQUEsQ0FDQSxVQVRWLENBbUJVLG1IQUlFLHFCQUFBLENBRkEsVUFBQSxDQUNBLGFBQUEsQ0FFQSxpQkFqQlosQ0FtQlUsMERBQ0UsdUJBQUEsQ0FDQSxhQUFBLENBSUEsaUJBQUEsQ0FEQSxVQUFBLENBRkEsVUFBQSxDQUlBLEtBQUEsQ0FIQSxTQWRaLENBbUJVLHlEQUlFLG1DQUFBLENBQ0Esc0JBQUEsQ0FGQSxnQ0FBQSxDQURBLFVBQUEsQ0FJQSxVQUFBLENBQ0EsUUFBQSxDQU5BLFNBWFosQ0FxQlEscURBT0UsNEJBQUEsQ0FDQSxtQkFBQSxDQVBBLHFCQUFBLENBRUEsYUFBQSxDQUdBLFdBQUEsQ0FKQSxpQkFBQSxDQUVBLDZCQUFBLENBQ0EsVUFoQlYsQ0FxQlUsMkRBVUUsa0JBQUEsQ0FEQSx3QkFBQSxDQU5BLHFCQUFBLENBRkEsVUFBQSxDQUNBLGFBQUEsQ0FNQSxXQUFBLENBSEEsUUFBQSxDQURBLGlCQUFBLENBRUEsUUFBQSxDQU1BLHVCQUFBLENBREEsNEJBQUEsQ0FKQSxTQWRaLENBalFBLHFDQWlTTSxvQkFBQSxDQU5BLGFBQUEsQ0FDQSxjQUFBLENBSUEsWUFBQSxDQUZBLGNBQUEsQ0FDQSxlQUFBLENBR0EsT0FBQSxDQUxBLGFBbEJOLENBeUJNLHlDQUNFLGNBdkJSIiwiZmlsZSI6InN0eWxlLmxlc3MifQ== */";
  styleInject(css_248z$1);

  class MenuBar {
      static get items() {
          const items = [
              { title: 'Demo mode, Ctrl+Alt+M', eventType: MenuBar.eventTypes.MODE_CLICK, iconClass: '', glyph: 'M' },
              { title: 'Edit, Ctrl+Alt+E', eventType: MenuBar.eventTypes.EDIT_CLICK, iconClass: '', glyph: 'E' },
              { title: 'Verbose, Ctrl+Alt+V', eventType: MenuBar.eventTypes.VERBOSE_CLICK, iconClass: '', glyph: 'V' },
          ];
          if (!options.editable) ;
          return items;
      }
      static init() {
          MenuBar.setElement();
          window.addEventListener('Demo:OptionsChanged', MenuBar.handleDemoToolsOptionsChanged);
          MenuBar.initialized = true;
      }
      static setElement() {
          if (MenuBar.initialized) {
              return;
          }
          MenuBar.area = document.createElement('div');
          MenuBar.area.classList.add('menu-bar');
          MenuBar.area.appendChild(MenuBar.getMenuListElement());
          MenuBar.area.appendChild(MenuBar.getRightElement());
      }
      static renderMenuList() {
          if (!MenuBar.area)
              return;
          const element = MenuBar.area.querySelector('.menu-list');
          element === null || element === void 0 ? void 0 : element.replaceWith(MenuBar.getMenuListElement());
      }
      static getMenuListElement() {
          const menuList = document.createElement('div');
          menuList.classList.add('menu-list');
          MenuBar.items.forEach((item) => {
              const el = document.createElement('div');
              el.classList.add('menu-item');
              el.classList.add('menu-item-icon');
              if (item.iconClass)
                  el.classList.add(item.iconClass);
              el.setAttribute('title', item.title);
              el.setAttribute('data-eventtype', item.eventType);
              menuList.appendChild(el);
              el.addEventListener('click', MenuBar.handleItemClick);
              if (item.glyph) {
                  el.innerText = item.glyph;
              }
          });
          return menuList;
      }
      static getRightElement() {
          const el = document.createElement('div');
          el.classList.add('right-section');
          const instructions = document.createElement('div');
          if (options.instructions) {
              instructions.classList.add('instructions');
              instructions.innerHTML = '?';
              instructions.setAttribute('title', options.instructions);
          }
          const refreshELement = document.createElement('div');
          refreshELement.classList.add('refresh-demo');
          refreshELement.innerText = '⟲';
          refreshELement.setAttribute('title', 'Refresh demo');
          refreshELement.setAttribute('data-eventtype', MenuBar.eventTypes.REFERSH_DEMO_CLICK);
          refreshELement.addEventListener('click', MenuBar.handleItemClick);
          const closeELement = document.createElement('div');
          closeELement.classList.add('close-demo');
          closeELement.innerHTML = 'X';
          closeELement.setAttribute('title', 'Close demo');
          closeELement.setAttribute('data-eventtype', MenuBar.eventTypes.CLOSE_DEMO_CLICK);
          closeELement.addEventListener('click', MenuBar.handleItemClick);
          if (options.instructions) {
              el.appendChild(instructions);
          }
          el.appendChild(refreshELement);
          el.appendChild(closeELement);
          return el;
      }
      static handleItemClick(e) {
          var _a;
          window.dispatchEvent(new CustomEvent((_a = e === null || e === void 0 ? void 0 : e.target) === null || _a === void 0 ? void 0 : _a.dataset.eventtype));
      }
      static handleDemoToolsOptionsChanged() {
          MenuBar.renderMenuList();
      }
      static destroy() {
          var _a, _b;
          MenuBar.initialized = false;
          window.removeEventListener('Demo:OptionsChanged', MenuBar.handleDemoToolsOptionsChanged);
          (_b = (_a = MenuBar.area) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.menu-item')) === null || _b === void 0 ? void 0 : _b.forEach((item) => {
              item.removeEventListener('click', MenuBar.handleItemClick);
          });
          MenuBar.area = null;
      }
  }
  MenuBar.initialized = false;
  MenuBar.area = null;
  MenuBar.eventTypes = {
      MODE_CLICK: 'DemoTools:MenuBar:modeClick',
      EDIT_CLICK: 'DemoTools:MenuBar:editClick',
      VERBOSE_CLICK: 'DemoTools:MenuBar:verboseClick',
      RESTORING_APP_STATE_STEP_CLICK: 'DemoTools:MenuBar:addRestoringAppStateStepClick',
      EXPORT_DEMO_TO_CONSOLE_CLICK: 'DemoTools:MenuBar:exportDemoToConsoleClick',
      IMPORT_DEMO_CLICK: 'DemoTools:MenuBar:importDemoClick',
      REFERSH_DEMO_CLICK: 'DemoTools:MenuBar:refreshDemoClick',
      CLOSE_DEMO_CLICK: 'DemoTools:MenuBar:closeDemoClick',
  };

  /**
   * @name toDate
   * @category Common Helpers
   * @summary Convert the given argument to an instance of Date.
   *
   * @description
   * Convert the given argument to an instance of Date.
   *
   * If the argument is an instance of Date, the function returns its clone.
   *
   * If the argument is a number, it is treated as a timestamp.
   *
   * If the argument is none of the above, the function returns Invalid Date.
   *
   * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   *
   * @param argument - The value to convert
   *
   * @returns The parsed date in the local time zone
   *
   * @example
   * // Clone the date:
   * const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
   * //=> Tue Feb 11 2014 11:30:30
   *
   * @example
   * // Convert the timestamp to date:
   * const result = toDate(1392098430000)
   * //=> Tue Feb 11 2014 11:30:30
   */
  function toDate(argument) {
    const argStr = Object.prototype.toString.call(argument);

    // Clone the date
    if (
      argument instanceof Date ||
      (typeof argument === "object" && argStr === "[object Date]")
    ) {
      // Prevent the date to lose the milliseconds when passed to new Date() in IE10
      return new argument.constructor(+argument);
    } else if (
      typeof argument === "number" ||
      argStr === "[object Number]" ||
      typeof argument === "string" ||
      argStr === "[object String]"
    ) {
      // TODO: Can we get rid of as?
      return new Date(argument);
    } else {
      // TODO: Can we get rid of as?
      return new Date(NaN);
    }
  }

  /**
   * @name constructFrom
   * @category Generic Helpers
   * @summary Constructs a date using the reference date and the value
   *
   * @description
   * The function constructs a new date using the constructor from the reference
   * date and the given value. It helps to build generic functions that accept
   * date extensions.
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   *
   * @param date - The reference date to take constructor from
   * @param value - The value to create the date
   *
   * @returns Date initialized using the given date and value
   *
   * @example
   * import { constructFrom } from 'date-fns'
   *
   * // A function that clones a date preserving the original type
   * function cloneDate<DateType extends Date(date: DateType): DateType {
   *   return constructFrom(
   *     date, // Use contrustor from the given date
   *     date.getTime() // Use the date value to create a new date
   *   )
   * }
   */
  function constructFrom(date, value) {
    if (date instanceof Date) {
      return new date.constructor(value);
    } else {
      return new Date(value);
    }
  }

  /**
   * @module constants
   * @summary Useful constants
   * @description
   * Collection of useful date constants.
   *
   * The constants could be imported from `date-fns/constants`:
   *
   * ```ts
   * import { maxTime, minTime } from "./constants/date-fns/constants";
   *
   * function isAllowedTime(time) {
   *   return time <= maxTime && time >= minTime;
   * }
   * ```
   */


  /**
   * @constant
   * @name millisecondsInWeek
   * @summary Milliseconds in 1 week.
   */
  const millisecondsInWeek = 604800000;

  /**
   * @constant
   * @name millisecondsInDay
   * @summary Milliseconds in 1 day.
   */
  const millisecondsInDay = 86400000;

  let defaultOptions = {};

  function getDefaultOptions() {
    return defaultOptions;
  }

  /**
   * The {@link startOfWeek} function options.
   */

  /**
   * @name startOfWeek
   * @category Week Helpers
   * @summary Return the start of a week for the given date.
   *
   * @description
   * Return the start of a week for the given date.
   * The result will be in the local timezone.
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   *
   * @param date - The original date
   * @param options - An object with options
   *
   * @returns The start of a week
   *
   * @example
   * // The start of a week for 2 September 2014 11:55:00:
   * const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0))
   * //=> Sun Aug 31 2014 00:00:00
   *
   * @example
   * // If the week starts on Monday, the start of the week for 2 September 2014 11:55:00:
   * const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0), { weekStartsOn: 1 })
   * //=> Mon Sep 01 2014 00:00:00
   */
  function startOfWeek(date, options) {
    const defaultOptions = getDefaultOptions();
    const weekStartsOn =
      options?.weekStartsOn ??
      options?.locale?.options?.weekStartsOn ??
      defaultOptions.weekStartsOn ??
      defaultOptions.locale?.options?.weekStartsOn ??
      0;

    const _date = toDate(date);
    const day = _date.getDay();
    const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;

    _date.setDate(_date.getDate() - diff);
    _date.setHours(0, 0, 0, 0);
    return _date;
  }

  /**
   * @name startOfISOWeek
   * @category ISO Week Helpers
   * @summary Return the start of an ISO week for the given date.
   *
   * @description
   * Return the start of an ISO week for the given date.
   * The result will be in the local timezone.
   *
   * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   *
   * @param date - The original date
   *
   * @returns The start of an ISO week
   *
   * @example
   * // The start of an ISO week for 2 September 2014 11:55:00:
   * const result = startOfISOWeek(new Date(2014, 8, 2, 11, 55, 0))
   * //=> Mon Sep 01 2014 00:00:00
   */
  function startOfISOWeek(date) {
    return startOfWeek(date, { weekStartsOn: 1 });
  }

  /**
   * @name getISOWeekYear
   * @category ISO Week-Numbering Year Helpers
   * @summary Get the ISO week-numbering year of the given date.
   *
   * @description
   * Get the ISO week-numbering year of the given date,
   * which always starts 3 days before the year's first Thursday.
   *
   * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   *
   * @param date - The given date
   *
   * @returns The ISO week-numbering year
   *
   * @example
   * // Which ISO-week numbering year is 2 January 2005?
   * const result = getISOWeekYear(new Date(2005, 0, 2))
   * //=> 2004
   */
  function getISOWeekYear(date) {
    const _date = toDate(date);
    const year = _date.getFullYear();

    const fourthOfJanuaryOfNextYear = constructFrom(date, 0);
    fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
    fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
    const startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear);

    const fourthOfJanuaryOfThisYear = constructFrom(date, 0);
    fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4);
    fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0);
    const startOfThisYear = startOfISOWeek(fourthOfJanuaryOfThisYear);

    if (_date.getTime() >= startOfNextYear.getTime()) {
      return year + 1;
    } else if (_date.getTime() >= startOfThisYear.getTime()) {
      return year;
    } else {
      return year - 1;
    }
  }

  /**
   * @name startOfDay
   * @category Day Helpers
   * @summary Return the start of a day for the given date.
   *
   * @description
   * Return the start of a day for the given date.
   * The result will be in the local timezone.
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   *
   * @param date - The original date
   *
   * @returns The start of a day
   *
   * @example
   * // The start of a day for 2 September 2014 11:55:00:
   * const result = startOfDay(new Date(2014, 8, 2, 11, 55, 0))
   * //=> Tue Sep 02 2014 00:00:00
   */
  function startOfDay(date) {
    const _date = toDate(date);
    _date.setHours(0, 0, 0, 0);
    return _date;
  }

  /**
   * Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
   * They usually appear for dates that denote time before the timezones were introduced
   * (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
   * and GMT+01:00:00 after that date)
   *
   * Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
   * which would lead to incorrect calculations.
   *
   * This function returns the timezone offset in milliseconds that takes seconds in account.
   */
  function getTimezoneOffsetInMilliseconds(date) {
    const utcDate = new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds(),
      ),
    );
    utcDate.setUTCFullYear(date.getFullYear());
    return date.getTime() - utcDate.getTime();
  }

  /**
   * @name differenceInCalendarDays
   * @category Day Helpers
   * @summary Get the number of calendar days between the given dates.
   *
   * @description
   * Get the number of calendar days between the given dates. This means that the times are removed
   * from the dates and then the difference in days is calculated.
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   *
   * @param dateLeft - The later date
   * @param dateRight - The earlier date
   *
   * @returns The number of calendar days
   *
   * @example
   * // How many calendar days are between
   * // 2 July 2011 23:00:00 and 2 July 2012 00:00:00?
   * const result = differenceInCalendarDays(
   *   new Date(2012, 6, 2, 0, 0),
   *   new Date(2011, 6, 2, 23, 0)
   * )
   * //=> 366
   * // How many calendar days are between
   * // 2 July 2011 23:59:00 and 3 July 2011 00:01:00?
   * const result = differenceInCalendarDays(
   *   new Date(2011, 6, 3, 0, 1),
   *   new Date(2011, 6, 2, 23, 59)
   * )
   * //=> 1
   */
  function differenceInCalendarDays(dateLeft, dateRight) {
    const startOfDayLeft = startOfDay(dateLeft);
    const startOfDayRight = startOfDay(dateRight);

    const timestampLeft =
      startOfDayLeft.getTime() - getTimezoneOffsetInMilliseconds(startOfDayLeft);
    const timestampRight =
      startOfDayRight.getTime() -
      getTimezoneOffsetInMilliseconds(startOfDayRight);

    // Round the number of days to the nearest integer
    // because the number of milliseconds in a day is not constant
    // (e.g. it's different in the day of the daylight saving time clock shift)
    return Math.round((timestampLeft - timestampRight) / millisecondsInDay);
  }

  /**
   * @name startOfISOWeekYear
   * @category ISO Week-Numbering Year Helpers
   * @summary Return the start of an ISO week-numbering year for the given date.
   *
   * @description
   * Return the start of an ISO week-numbering year,
   * which always starts 3 days before the year's first Thursday.
   * The result will be in the local timezone.
   *
   * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   *
   * @param date - The original date
   *
   * @returns The start of an ISO week-numbering year
   *
   * @example
   * // The start of an ISO week-numbering year for 2 July 2005:
   * const result = startOfISOWeekYear(new Date(2005, 6, 2))
   * //=> Mon Jan 03 2005 00:00:00
   */
  function startOfISOWeekYear(date) {
    const year = getISOWeekYear(date);
    const fourthOfJanuary = constructFrom(date, 0);
    fourthOfJanuary.setFullYear(year, 0, 4);
    fourthOfJanuary.setHours(0, 0, 0, 0);
    return startOfISOWeek(fourthOfJanuary);
  }

  /**
   * @name isDate
   * @category Common Helpers
   * @summary Is the given value a date?
   *
   * @description
   * Returns true if the given value is an instance of Date. The function works for dates transferred across iframes.
   *
   * @param value - The value to check
   *
   * @returns True if the given value is a date
   *
   * @example
   * // For a valid date:
   * const result = isDate(new Date())
   * //=> true
   *
   * @example
   * // For an invalid date:
   * const result = isDate(new Date(NaN))
   * //=> true
   *
   * @example
   * // For some value:
   * const result = isDate('2014-02-31')
   * //=> false
   *
   * @example
   * // For an object:
   * const result = isDate({})
   * //=> false
   */
  function isDate(value) {
    return (
      value instanceof Date ||
      (typeof value === "object" &&
        Object.prototype.toString.call(value) === "[object Date]")
    );
  }

  /**
   * @name isValid
   * @category Common Helpers
   * @summary Is the given date valid?
   *
   * @description
   * Returns false if argument is Invalid Date and true otherwise.
   * Argument is converted to Date using `toDate`. See [toDate](https://date-fns.org/docs/toDate)
   * Invalid Date is a Date, whose time value is NaN.
   *
   * Time value of Date: http://es5.github.io/#x15.9.1.1
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   *
   * @param date - The date to check
   *
   * @returns The date is valid
   *
   * @example
   * // For the valid date:
   * const result = isValid(new Date(2014, 1, 31))
   * //=> true
   *
   * @example
   * // For the value, convertable into a date:
   * const result = isValid(1393804800000)
   * //=> true
   *
   * @example
   * // For the invalid date:
   * const result = isValid(new Date(''))
   * //=> false
   */
  function isValid(date) {
    if (!isDate(date) && typeof date !== "number") {
      return false;
    }
    const _date = toDate(date);
    return !isNaN(Number(_date));
  }

  /**
   * @name startOfYear
   * @category Year Helpers
   * @summary Return the start of a year for the given date.
   *
   * @description
   * Return the start of a year for the given date.
   * The result will be in the local timezone.
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   *
   * @param date - The original date
   *
   * @returns The start of a year
   *
   * @example
   * // The start of a year for 2 September 2014 11:55:00:
   * const result = startOfYear(new Date(2014, 8, 2, 11, 55, 00))
   * //=> Wed Jan 01 2014 00:00:00
   */
  function startOfYear(date) {
    const cleanDate = toDate(date);
    const _date = constructFrom(date, 0);
    _date.setFullYear(cleanDate.getFullYear(), 0, 1);
    _date.setHours(0, 0, 0, 0);
    return _date;
  }

  const formatDistanceLocale = {
    lessThanXSeconds: {
      one: "less than a second",
      other: "less than {{count}} seconds",
    },

    xSeconds: {
      one: "1 second",
      other: "{{count}} seconds",
    },

    halfAMinute: "half a minute",

    lessThanXMinutes: {
      one: "less than a minute",
      other: "less than {{count}} minutes",
    },

    xMinutes: {
      one: "1 minute",
      other: "{{count}} minutes",
    },

    aboutXHours: {
      one: "about 1 hour",
      other: "about {{count}} hours",
    },

    xHours: {
      one: "1 hour",
      other: "{{count}} hours",
    },

    xDays: {
      one: "1 day",
      other: "{{count}} days",
    },

    aboutXWeeks: {
      one: "about 1 week",
      other: "about {{count}} weeks",
    },

    xWeeks: {
      one: "1 week",
      other: "{{count}} weeks",
    },

    aboutXMonths: {
      one: "about 1 month",
      other: "about {{count}} months",
    },

    xMonths: {
      one: "1 month",
      other: "{{count}} months",
    },

    aboutXYears: {
      one: "about 1 year",
      other: "about {{count}} years",
    },

    xYears: {
      one: "1 year",
      other: "{{count}} years",
    },

    overXYears: {
      one: "over 1 year",
      other: "over {{count}} years",
    },

    almostXYears: {
      one: "almost 1 year",
      other: "almost {{count}} years",
    },
  };

  const formatDistance = (token, count, options) => {
    let result;

    const tokenValue = formatDistanceLocale[token];
    if (typeof tokenValue === "string") {
      result = tokenValue;
    } else if (count === 1) {
      result = tokenValue.one;
    } else {
      result = tokenValue.other.replace("{{count}}", count.toString());
    }

    if (options?.addSuffix) {
      if (options.comparison && options.comparison > 0) {
        return "in " + result;
      } else {
        return result + " ago";
      }
    }

    return result;
  };

  function buildFormatLongFn(args) {
    return (options = {}) => {
      // TODO: Remove String()
      const width = options.width ? String(options.width) : args.defaultWidth;
      const format = args.formats[width] || args.formats[args.defaultWidth];
      return format;
    };
  }

  const dateFormats = {
    full: "EEEE, MMMM do, y",
    long: "MMMM do, y",
    medium: "MMM d, y",
    short: "MM/dd/yyyy",
  };

  const timeFormats = {
    full: "h:mm:ss a zzzz",
    long: "h:mm:ss a z",
    medium: "h:mm:ss a",
    short: "h:mm a",
  };

  const dateTimeFormats = {
    full: "{{date}} 'at' {{time}}",
    long: "{{date}} 'at' {{time}}",
    medium: "{{date}}, {{time}}",
    short: "{{date}}, {{time}}",
  };

  const formatLong = {
    date: buildFormatLongFn({
      formats: dateFormats,
      defaultWidth: "full",
    }),

    time: buildFormatLongFn({
      formats: timeFormats,
      defaultWidth: "full",
    }),

    dateTime: buildFormatLongFn({
      formats: dateTimeFormats,
      defaultWidth: "full",
    }),
  };

  const formatRelativeLocale = {
    lastWeek: "'last' eeee 'at' p",
    yesterday: "'yesterday at' p",
    today: "'today at' p",
    tomorrow: "'tomorrow at' p",
    nextWeek: "eeee 'at' p",
    other: "P",
  };

  const formatRelative = (token, _date, _baseDate, _options) =>
    formatRelativeLocale[token];

  /* eslint-disable no-unused-vars */

  /**
   * The localize function argument callback which allows to convert raw value to
   * the actual type.
   *
   * @param value - The value to convert
   *
   * @returns The converted value
   */

  /**
   * The map of localized values for each width.
   */

  /**
   * The index type of the locale unit value. It types conversion of units of
   * values that don't start at 0 (i.e. quarters).
   */

  /**
   * Converts the unit value to the tuple of values.
   */

  /**
   * The tuple of localized era values. The first element represents BC,
   * the second element represents AD.
   */

  /**
   * The tuple of localized quarter values. The first element represents Q1.
   */

  /**
   * The tuple of localized day values. The first element represents Sunday.
   */

  /**
   * The tuple of localized month values. The first element represents January.
   */

  function buildLocalizeFn(args) {
    return (value, options) => {
      const context = options?.context ? String(options.context) : "standalone";

      let valuesArray;
      if (context === "formatting" && args.formattingValues) {
        const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
        const width = options?.width ? String(options.width) : defaultWidth;

        valuesArray =
          args.formattingValues[width] || args.formattingValues[defaultWidth];
      } else {
        const defaultWidth = args.defaultWidth;
        const width = options?.width ? String(options.width) : args.defaultWidth;

        valuesArray = args.values[width] || args.values[defaultWidth];
      }
      const index = args.argumentCallback ? args.argumentCallback(value) : value;

      // @ts-expect-error - For some reason TypeScript just don't want to match it, no matter how hard we try. I challenge you to try to remove it!
      return valuesArray[index];
    };
  }

  const eraValues = {
    narrow: ["B", "A"],
    abbreviated: ["BC", "AD"],
    wide: ["Before Christ", "Anno Domini"],
  };

  const quarterValues = {
    narrow: ["1", "2", "3", "4"],
    abbreviated: ["Q1", "Q2", "Q3", "Q4"],
    wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"],
  };

  // Note: in English, the names of days of the week and months are capitalized.
  // If you are making a new locale based on this one, check if the same is true for the language you're working on.
  // Generally, formatted dates should look like they are in the middle of a sentence,
  // e.g. in Spanish language the weekdays and months should be in the lowercase.
  const monthValues = {
    narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    abbreviated: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],

    wide: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  };

  const dayValues = {
    narrow: ["S", "M", "T", "W", "T", "F", "S"],
    short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    wide: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
  };

  const dayPeriodValues = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night",
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night",
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night",
    },
  };

  const formattingDayPeriodValues = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night",
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night",
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night",
    },
  };

  const ordinalNumber = (dirtyNumber, _options) => {
    const number = Number(dirtyNumber);

    // If ordinal numbers depend on context, for example,
    // if they are different for different grammatical genders,
    // use `options.unit`.
    //
    // `unit` can be 'year', 'quarter', 'month', 'week', 'date', 'dayOfYear',
    // 'day', 'hour', 'minute', 'second'.

    const rem100 = number % 100;
    if (rem100 > 20 || rem100 < 10) {
      switch (rem100 % 10) {
        case 1:
          return number + "st";
        case 2:
          return number + "nd";
        case 3:
          return number + "rd";
      }
    }
    return number + "th";
  };

  const localize = {
    ordinalNumber,

    era: buildLocalizeFn({
      values: eraValues,
      defaultWidth: "wide",
    }),

    quarter: buildLocalizeFn({
      values: quarterValues,
      defaultWidth: "wide",
      argumentCallback: (quarter) => quarter - 1,
    }),

    month: buildLocalizeFn({
      values: monthValues,
      defaultWidth: "wide",
    }),

    day: buildLocalizeFn({
      values: dayValues,
      defaultWidth: "wide",
    }),

    dayPeriod: buildLocalizeFn({
      values: dayPeriodValues,
      defaultWidth: "wide",
      formattingValues: formattingDayPeriodValues,
      defaultFormattingWidth: "wide",
    }),
  };

  function buildMatchFn(args) {
    return (string, options = {}) => {
      const width = options.width;

      const matchPattern =
        (width && args.matchPatterns[width]) ||
        args.matchPatterns[args.defaultMatchWidth];
      const matchResult = string.match(matchPattern);

      if (!matchResult) {
        return null;
      }
      const matchedString = matchResult[0];

      const parsePatterns =
        (width && args.parsePatterns[width]) ||
        args.parsePatterns[args.defaultParseWidth];

      const key = Array.isArray(parsePatterns)
        ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString))
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any -- I challange you to fix the type
          findKey(parsePatterns, (pattern) => pattern.test(matchedString));

      let value;

      value = args.valueCallback ? args.valueCallback(key) : key;
      value = options.valueCallback
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any -- I challange you to fix the type
          options.valueCallback(value)
        : value;

      const rest = string.slice(matchedString.length);

      return { value, rest };
    };
  }

  function findKey(object, predicate) {
    for (const key in object) {
      if (
        Object.prototype.hasOwnProperty.call(object, key) &&
        predicate(object[key])
      ) {
        return key;
      }
    }
    return undefined;
  }

  function findIndex(array, predicate) {
    for (let key = 0; key < array.length; key++) {
      if (predicate(array[key])) {
        return key;
      }
    }
    return undefined;
  }

  function buildMatchPatternFn(args) {
    return (string, options = {}) => {
      const matchResult = string.match(args.matchPattern);
      if (!matchResult) return null;
      const matchedString = matchResult[0];

      const parseResult = string.match(args.parsePattern);
      if (!parseResult) return null;
      let value = args.valueCallback
        ? args.valueCallback(parseResult[0])
        : parseResult[0];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- I challange you to fix the type
      value = options.valueCallback ? options.valueCallback(value) : value;

      const rest = string.slice(matchedString.length);

      return { value, rest };
    };
  }

  const matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
  const parseOrdinalNumberPattern = /\d+/i;

  const matchEraPatterns = {
    narrow: /^(b|a)/i,
    abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
    wide: /^(before christ|before common era|anno domini|common era)/i,
  };
  const parseEraPatterns = {
    any: [/^b/i, /^(a|c)/i],
  };

  const matchQuarterPatterns = {
    narrow: /^[1234]/i,
    abbreviated: /^q[1234]/i,
    wide: /^[1234](th|st|nd|rd)? quarter/i,
  };
  const parseQuarterPatterns = {
    any: [/1/i, /2/i, /3/i, /4/i],
  };

  const matchMonthPatterns = {
    narrow: /^[jfmasond]/i,
    abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i,
  };
  const parseMonthPatterns = {
    narrow: [
      /^j/i,
      /^f/i,
      /^m/i,
      /^a/i,
      /^m/i,
      /^j/i,
      /^j/i,
      /^a/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i,
    ],

    any: [
      /^ja/i,
      /^f/i,
      /^mar/i,
      /^ap/i,
      /^may/i,
      /^jun/i,
      /^jul/i,
      /^au/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i,
    ],
  };

  const matchDayPatterns = {
    narrow: /^[smtwf]/i,
    short: /^(su|mo|tu|we|th|fr|sa)/i,
    abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
    wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i,
  };
  const parseDayPatterns = {
    narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
    any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i],
  };

  const matchDayPeriodPatterns = {
    narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
    any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i,
  };
  const parseDayPeriodPatterns = {
    any: {
      am: /^a/i,
      pm: /^p/i,
      midnight: /^mi/i,
      noon: /^no/i,
      morning: /morning/i,
      afternoon: /afternoon/i,
      evening: /evening/i,
      night: /night/i,
    },
  };

  const match = {
    ordinalNumber: buildMatchPatternFn({
      matchPattern: matchOrdinalNumberPattern,
      parsePattern: parseOrdinalNumberPattern,
      valueCallback: (value) => parseInt(value, 10),
    }),

    era: buildMatchFn({
      matchPatterns: matchEraPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseEraPatterns,
      defaultParseWidth: "any",
    }),

    quarter: buildMatchFn({
      matchPatterns: matchQuarterPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseQuarterPatterns,
      defaultParseWidth: "any",
      valueCallback: (index) => index + 1,
    }),

    month: buildMatchFn({
      matchPatterns: matchMonthPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseMonthPatterns,
      defaultParseWidth: "any",
    }),

    day: buildMatchFn({
      matchPatterns: matchDayPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseDayPatterns,
      defaultParseWidth: "any",
    }),

    dayPeriod: buildMatchFn({
      matchPatterns: matchDayPeriodPatterns,
      defaultMatchWidth: "any",
      parsePatterns: parseDayPeriodPatterns,
      defaultParseWidth: "any",
    }),
  };

  /**
   * @category Locales
   * @summary English locale (United States).
   * @language English
   * @iso-639-2 eng
   * @author Sasha Koss [@kossnocorp](https://github.com/kossnocorp)
   * @author Lesha Koss [@leshakoss](https://github.com/leshakoss)
   */
  const enUS = {
    code: "en-US",
    formatDistance: formatDistance,
    formatLong: formatLong,
    formatRelative: formatRelative,
    localize: localize,
    match: match,
    options: {
      weekStartsOn: 0 /* Sunday */,
      firstWeekContainsDate: 1,
    },
  };

  /**
   * @name getDayOfYear
   * @category Day Helpers
   * @summary Get the day of the year of the given date.
   *
   * @description
   * Get the day of the year of the given date.
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   *
   * @param date - The given date
   *
   * @returns The day of year
   *
   * @example
   * // Which day of the year is 2 July 2014?
   * const result = getDayOfYear(new Date(2014, 6, 2))
   * //=> 183
   */
  function getDayOfYear(date) {
    const _date = toDate(date);
    const diff = differenceInCalendarDays(_date, startOfYear(_date));
    const dayOfYear = diff + 1;
    return dayOfYear;
  }

  /**
   * @name getISOWeek
   * @category ISO Week Helpers
   * @summary Get the ISO week of the given date.
   *
   * @description
   * Get the ISO week of the given date.
   *
   * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   *
   * @param date - The given date
   *
   * @returns The ISO week
   *
   * @example
   * // Which week of the ISO-week numbering year is 2 January 2005?
   * const result = getISOWeek(new Date(2005, 0, 2))
   * //=> 53
   */
  function getISOWeek(date) {
    const _date = toDate(date);
    const diff =
      startOfISOWeek(_date).getTime() - startOfISOWeekYear(_date).getTime();

    // Round the number of days to the nearest integer
    // because the number of milliseconds in a week is not constant
    // (e.g. it's different in the week of the daylight saving time clock shift)
    return Math.round(diff / millisecondsInWeek) + 1;
  }

  /**
   * The {@link getWeekYear} function options.
   */

  /**
   * @name getWeekYear
   * @category Week-Numbering Year Helpers
   * @summary Get the local week-numbering year of the given date.
   *
   * @description
   * Get the local week-numbering year of the given date.
   * The exact calculation depends on the values of
   * `options.weekStartsOn` (which is the index of the first day of the week)
   * and `options.firstWeekContainsDate` (which is the day of January, which is always in
   * the first week of the week-numbering year)
   *
   * Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   *
   * @param date - The given date
   * @param options - An object with options.
   *
   * @returns The local week-numbering year
   *
   * @example
   * // Which week numbering year is 26 December 2004 with the default settings?
   * const result = getWeekYear(new Date(2004, 11, 26))
   * //=> 2005
   *
   * @example
   * // Which week numbering year is 26 December 2004 if week starts on Saturday?
   * const result = getWeekYear(new Date(2004, 11, 26), { weekStartsOn: 6 })
   * //=> 2004
   *
   * @example
   * // Which week numbering year is 26 December 2004 if the first week contains 4 January?
   * const result = getWeekYear(new Date(2004, 11, 26), { firstWeekContainsDate: 4 })
   * //=> 2004
   */
  function getWeekYear(date, options) {
    const _date = toDate(date);
    const year = _date.getFullYear();

    const defaultOptions = getDefaultOptions();
    const firstWeekContainsDate =
      options?.firstWeekContainsDate ??
      options?.locale?.options?.firstWeekContainsDate ??
      defaultOptions.firstWeekContainsDate ??
      defaultOptions.locale?.options?.firstWeekContainsDate ??
      1;

    const firstWeekOfNextYear = constructFrom(date, 0);
    firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
    firstWeekOfNextYear.setHours(0, 0, 0, 0);
    const startOfNextYear = startOfWeek(firstWeekOfNextYear, options);

    const firstWeekOfThisYear = constructFrom(date, 0);
    firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
    firstWeekOfThisYear.setHours(0, 0, 0, 0);
    const startOfThisYear = startOfWeek(firstWeekOfThisYear, options);

    if (_date.getTime() >= startOfNextYear.getTime()) {
      return year + 1;
    } else if (_date.getTime() >= startOfThisYear.getTime()) {
      return year;
    } else {
      return year - 1;
    }
  }

  /**
   * The {@link startOfWeekYear} function options.
   */

  /**
   * @name startOfWeekYear
   * @category Week-Numbering Year Helpers
   * @summary Return the start of a local week-numbering year for the given date.
   *
   * @description
   * Return the start of a local week-numbering year.
   * The exact calculation depends on the values of
   * `options.weekStartsOn` (which is the index of the first day of the week)
   * and `options.firstWeekContainsDate` (which is the day of January, which is always in
   * the first week of the week-numbering year)
   *
   * Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   *
   * @param date - The original date
   * @param options - An object with options
   *
   * @returns The start of a week-numbering year
   *
   * @example
   * // The start of an a week-numbering year for 2 July 2005 with default settings:
   * const result = startOfWeekYear(new Date(2005, 6, 2))
   * //=> Sun Dec 26 2004 00:00:00
   *
   * @example
   * // The start of a week-numbering year for 2 July 2005
   * // if Monday is the first day of week
   * // and 4 January is always in the first week of the year:
   * const result = startOfWeekYear(new Date(2005, 6, 2), {
   *   weekStartsOn: 1,
   *   firstWeekContainsDate: 4
   * })
   * //=> Mon Jan 03 2005 00:00:00
   */
  function startOfWeekYear(date, options) {
    const defaultOptions = getDefaultOptions();
    const firstWeekContainsDate =
      options?.firstWeekContainsDate ??
      options?.locale?.options?.firstWeekContainsDate ??
      defaultOptions.firstWeekContainsDate ??
      defaultOptions.locale?.options?.firstWeekContainsDate ??
      1;

    const year = getWeekYear(date, options);
    const firstWeek = constructFrom(date, 0);
    firstWeek.setFullYear(year, 0, firstWeekContainsDate);
    firstWeek.setHours(0, 0, 0, 0);
    const _date = startOfWeek(firstWeek, options);
    return _date;
  }

  /**
   * The {@link getWeek} function options.
   */

  /**
   * @name getWeek
   * @category Week Helpers
   * @summary Get the local week index of the given date.
   *
   * @description
   * Get the local week index of the given date.
   * The exact calculation depends on the values of
   * `options.weekStartsOn` (which is the index of the first day of the week)
   * and `options.firstWeekContainsDate` (which is the day of January, which is always in
   * the first week of the week-numbering year)
   *
   * Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   *
   * @param date - The given date
   * @param options - An object with options
   *
   * @returns The week
   *
   * @example
   * // Which week of the local week numbering year is 2 January 2005 with default options?
   * const result = getWeek(new Date(2005, 0, 2))
   * //=> 2
   *
   * @example
   * // Which week of the local week numbering year is 2 January 2005,
   * // if Monday is the first day of the week,
   * // and the first week of the year always contains 4 January?
   * const result = getWeek(new Date(2005, 0, 2), {
   *   weekStartsOn: 1,
   *   firstWeekContainsDate: 4
   * })
   * //=> 53
   */

  function getWeek(date, options) {
    const _date = toDate(date);
    const diff =
      startOfWeek(_date, options).getTime() -
      startOfWeekYear(_date, options).getTime();

    // Round the number of days to the nearest integer
    // because the number of milliseconds in a week is not constant
    // (e.g. it's different in the week of the daylight saving time clock shift)
    return Math.round(diff / millisecondsInWeek) + 1;
  }

  function addLeadingZeros(number, targetLength) {
    const sign = number < 0 ? "-" : "";
    const output = Math.abs(number).toString().padStart(targetLength, "0");
    return sign + output;
  }

  /*
   * |     | Unit                           |     | Unit                           |
   * |-----|--------------------------------|-----|--------------------------------|
   * |  a  | AM, PM                         |  A* |                                |
   * |  d  | Day of month                   |  D  |                                |
   * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
   * |  m  | Minute                         |  M  | Month                          |
   * |  s  | Second                         |  S  | Fraction of second             |
   * |  y  | Year (abs)                     |  Y  |                                |
   *
   * Letters marked by * are not implemented but reserved by Unicode standard.
   */

  const lightFormatters = {
    // Year
    y(date, token) {
      // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_tokens
      // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
      // |----------|-------|----|-------|-------|-------|
      // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
      // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
      // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
      // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
      // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |

      const signedYear = date.getFullYear();
      // Returns 1 for 1 BC (which is year 0 in JavaScript)
      const year = signedYear > 0 ? signedYear : 1 - signedYear;
      return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
    },

    // Month
    M(date, token) {
      const month = date.getMonth();
      return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
    },

    // Day of the month
    d(date, token) {
      return addLeadingZeros(date.getDate(), token.length);
    },

    // AM or PM
    a(date, token) {
      const dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";

      switch (token) {
        case "a":
        case "aa":
          return dayPeriodEnumValue.toUpperCase();
        case "aaa":
          return dayPeriodEnumValue;
        case "aaaaa":
          return dayPeriodEnumValue[0];
        case "aaaa":
        default:
          return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
      }
    },

    // Hour [1-12]
    h(date, token) {
      return addLeadingZeros(date.getHours() % 12 || 12, token.length);
    },

    // Hour [0-23]
    H(date, token) {
      return addLeadingZeros(date.getHours(), token.length);
    },

    // Minute
    m(date, token) {
      return addLeadingZeros(date.getMinutes(), token.length);
    },

    // Second
    s(date, token) {
      return addLeadingZeros(date.getSeconds(), token.length);
    },

    // Fraction of second
    S(date, token) {
      const numberOfDigits = token.length;
      const milliseconds = date.getMilliseconds();
      const fractionalSeconds = Math.floor(
        milliseconds * Math.pow(10, numberOfDigits - 3),
      );
      return addLeadingZeros(fractionalSeconds, token.length);
    },
  };

  const dayPeriodEnum = {
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night",
  };

  /*
   * |     | Unit                           |     | Unit                           |
   * |-----|--------------------------------|-----|--------------------------------|
   * |  a  | AM, PM                         |  A* | Milliseconds in day            |
   * |  b  | AM, PM, noon, midnight         |  B  | Flexible day period            |
   * |  c  | Stand-alone local day of week  |  C* | Localized hour w/ day period   |
   * |  d  | Day of month                   |  D  | Day of year                    |
   * |  e  | Local day of week              |  E  | Day of week                    |
   * |  f  |                                |  F* | Day of week in month           |
   * |  g* | Modified Julian day            |  G  | Era                            |
   * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
   * |  i! | ISO day of week                |  I! | ISO week of year               |
   * |  j* | Localized hour w/ day period   |  J* | Localized hour w/o day period  |
   * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                    |
   * |  l* | (deprecated)                   |  L  | Stand-alone month              |
   * |  m  | Minute                         |  M  | Month                          |
   * |  n  |                                |  N  |                                |
   * |  o! | Ordinal number modifier        |  O  | Timezone (GMT)                 |
   * |  p! | Long localized time            |  P! | Long localized date            |
   * |  q  | Stand-alone quarter            |  Q  | Quarter                        |
   * |  r* | Related Gregorian year         |  R! | ISO week-numbering year        |
   * |  s  | Second                         |  S  | Fraction of second             |
   * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp         |
   * |  u  | Extended year                  |  U* | Cyclic year                    |
   * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)            |
   * |  w  | Local week of year             |  W* | Week of month                  |
   * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)            |
   * |  y  | Year (abs)                     |  Y  | Local week-numbering year      |
   * |  z  | Timezone (specific non-locat.) |  Z* | Timezone (aliases)             |
   *
   * Letters marked by * are not implemented but reserved by Unicode standard.
   *
   * Letters marked by ! are non-standard, but implemented by date-fns:
   * - `o` modifies the previous token to turn it into an ordinal (see `format` docs)
   * - `i` is ISO day of week. For `i` and `ii` is returns numeric ISO week days,
   *   i.e. 7 for Sunday, 1 for Monday, etc.
   * - `I` is ISO week of year, as opposed to `w` which is local week of year.
   * - `R` is ISO week-numbering year, as opposed to `Y` which is local week-numbering year.
   *   `R` is supposed to be used in conjunction with `I` and `i`
   *   for universal ISO week-numbering date, whereas
   *   `Y` is supposed to be used in conjunction with `w` and `e`
   *   for week-numbering date specific to the locale.
   * - `P` is long localized date format
   * - `p` is long localized time format
   */

  const formatters = {
    // Era
    G: function (date, token, localize) {
      const era = date.getFullYear() > 0 ? 1 : 0;
      switch (token) {
        // AD, BC
        case "G":
        case "GG":
        case "GGG":
          return localize.era(era, { width: "abbreviated" });
        // A, B
        case "GGGGG":
          return localize.era(era, { width: "narrow" });
        // Anno Domini, Before Christ
        case "GGGG":
        default:
          return localize.era(era, { width: "wide" });
      }
    },

    // Year
    y: function (date, token, localize) {
      // Ordinal number
      if (token === "yo") {
        const signedYear = date.getFullYear();
        // Returns 1 for 1 BC (which is year 0 in JavaScript)
        const year = signedYear > 0 ? signedYear : 1 - signedYear;
        return localize.ordinalNumber(year, { unit: "year" });
      }

      return lightFormatters.y(date, token);
    },

    // Local week-numbering year
    Y: function (date, token, localize, options) {
      const signedWeekYear = getWeekYear(date, options);
      // Returns 1 for 1 BC (which is year 0 in JavaScript)
      const weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;

      // Two digit year
      if (token === "YY") {
        const twoDigitYear = weekYear % 100;
        return addLeadingZeros(twoDigitYear, 2);
      }

      // Ordinal number
      if (token === "Yo") {
        return localize.ordinalNumber(weekYear, { unit: "year" });
      }

      // Padding
      return addLeadingZeros(weekYear, token.length);
    },

    // ISO week-numbering year
    R: function (date, token) {
      const isoWeekYear = getISOWeekYear(date);

      // Padding
      return addLeadingZeros(isoWeekYear, token.length);
    },

    // Extended year. This is a single number designating the year of this calendar system.
    // The main difference between `y` and `u` localizers are B.C. years:
    // | Year | `y` | `u` |
    // |------|-----|-----|
    // | AC 1 |   1 |   1 |
    // | BC 1 |   1 |   0 |
    // | BC 2 |   2 |  -1 |
    // Also `yy` always returns the last two digits of a year,
    // while `uu` pads single digit years to 2 characters and returns other years unchanged.
    u: function (date, token) {
      const year = date.getFullYear();
      return addLeadingZeros(year, token.length);
    },

    // Quarter
    Q: function (date, token, localize) {
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      switch (token) {
        // 1, 2, 3, 4
        case "Q":
          return String(quarter);
        // 01, 02, 03, 04
        case "QQ":
          return addLeadingZeros(quarter, 2);
        // 1st, 2nd, 3rd, 4th
        case "Qo":
          return localize.ordinalNumber(quarter, { unit: "quarter" });
        // Q1, Q2, Q3, Q4
        case "QQQ":
          return localize.quarter(quarter, {
            width: "abbreviated",
            context: "formatting",
          });
        // 1, 2, 3, 4 (narrow quarter; could be not numerical)
        case "QQQQQ":
          return localize.quarter(quarter, {
            width: "narrow",
            context: "formatting",
          });
        // 1st quarter, 2nd quarter, ...
        case "QQQQ":
        default:
          return localize.quarter(quarter, {
            width: "wide",
            context: "formatting",
          });
      }
    },

    // Stand-alone quarter
    q: function (date, token, localize) {
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      switch (token) {
        // 1, 2, 3, 4
        case "q":
          return String(quarter);
        // 01, 02, 03, 04
        case "qq":
          return addLeadingZeros(quarter, 2);
        // 1st, 2nd, 3rd, 4th
        case "qo":
          return localize.ordinalNumber(quarter, { unit: "quarter" });
        // Q1, Q2, Q3, Q4
        case "qqq":
          return localize.quarter(quarter, {
            width: "abbreviated",
            context: "standalone",
          });
        // 1, 2, 3, 4 (narrow quarter; could be not numerical)
        case "qqqqq":
          return localize.quarter(quarter, {
            width: "narrow",
            context: "standalone",
          });
        // 1st quarter, 2nd quarter, ...
        case "qqqq":
        default:
          return localize.quarter(quarter, {
            width: "wide",
            context: "standalone",
          });
      }
    },

    // Month
    M: function (date, token, localize) {
      const month = date.getMonth();
      switch (token) {
        case "M":
        case "MM":
          return lightFormatters.M(date, token);
        // 1st, 2nd, ..., 12th
        case "Mo":
          return localize.ordinalNumber(month + 1, { unit: "month" });
        // Jan, Feb, ..., Dec
        case "MMM":
          return localize.month(month, {
            width: "abbreviated",
            context: "formatting",
          });
        // J, F, ..., D
        case "MMMMM":
          return localize.month(month, {
            width: "narrow",
            context: "formatting",
          });
        // January, February, ..., December
        case "MMMM":
        default:
          return localize.month(month, { width: "wide", context: "formatting" });
      }
    },

    // Stand-alone month
    L: function (date, token, localize) {
      const month = date.getMonth();
      switch (token) {
        // 1, 2, ..., 12
        case "L":
          return String(month + 1);
        // 01, 02, ..., 12
        case "LL":
          return addLeadingZeros(month + 1, 2);
        // 1st, 2nd, ..., 12th
        case "Lo":
          return localize.ordinalNumber(month + 1, { unit: "month" });
        // Jan, Feb, ..., Dec
        case "LLL":
          return localize.month(month, {
            width: "abbreviated",
            context: "standalone",
          });
        // J, F, ..., D
        case "LLLLL":
          return localize.month(month, {
            width: "narrow",
            context: "standalone",
          });
        // January, February, ..., December
        case "LLLL":
        default:
          return localize.month(month, { width: "wide", context: "standalone" });
      }
    },

    // Local week of year
    w: function (date, token, localize, options) {
      const week = getWeek(date, options);

      if (token === "wo") {
        return localize.ordinalNumber(week, { unit: "week" });
      }

      return addLeadingZeros(week, token.length);
    },

    // ISO week of year
    I: function (date, token, localize) {
      const isoWeek = getISOWeek(date);

      if (token === "Io") {
        return localize.ordinalNumber(isoWeek, { unit: "week" });
      }

      return addLeadingZeros(isoWeek, token.length);
    },

    // Day of the month
    d: function (date, token, localize) {
      if (token === "do") {
        return localize.ordinalNumber(date.getDate(), { unit: "date" });
      }

      return lightFormatters.d(date, token);
    },

    // Day of year
    D: function (date, token, localize) {
      const dayOfYear = getDayOfYear(date);

      if (token === "Do") {
        return localize.ordinalNumber(dayOfYear, { unit: "dayOfYear" });
      }

      return addLeadingZeros(dayOfYear, token.length);
    },

    // Day of week
    E: function (date, token, localize) {
      const dayOfWeek = date.getDay();
      switch (token) {
        // Tue
        case "E":
        case "EE":
        case "EEE":
          return localize.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting",
          });
        // T
        case "EEEEE":
          return localize.day(dayOfWeek, {
            width: "narrow",
            context: "formatting",
          });
        // Tu
        case "EEEEEE":
          return localize.day(dayOfWeek, {
            width: "short",
            context: "formatting",
          });
        // Tuesday
        case "EEEE":
        default:
          return localize.day(dayOfWeek, {
            width: "wide",
            context: "formatting",
          });
      }
    },

    // Local day of week
    e: function (date, token, localize, options) {
      const dayOfWeek = date.getDay();
      const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
      switch (token) {
        // Numerical value (Nth day of week with current locale or weekStartsOn)
        case "e":
          return String(localDayOfWeek);
        // Padded numerical value
        case "ee":
          return addLeadingZeros(localDayOfWeek, 2);
        // 1st, 2nd, ..., 7th
        case "eo":
          return localize.ordinalNumber(localDayOfWeek, { unit: "day" });
        case "eee":
          return localize.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting",
          });
        // T
        case "eeeee":
          return localize.day(dayOfWeek, {
            width: "narrow",
            context: "formatting",
          });
        // Tu
        case "eeeeee":
          return localize.day(dayOfWeek, {
            width: "short",
            context: "formatting",
          });
        // Tuesday
        case "eeee":
        default:
          return localize.day(dayOfWeek, {
            width: "wide",
            context: "formatting",
          });
      }
    },

    // Stand-alone local day of week
    c: function (date, token, localize, options) {
      const dayOfWeek = date.getDay();
      const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
      switch (token) {
        // Numerical value (same as in `e`)
        case "c":
          return String(localDayOfWeek);
        // Padded numerical value
        case "cc":
          return addLeadingZeros(localDayOfWeek, token.length);
        // 1st, 2nd, ..., 7th
        case "co":
          return localize.ordinalNumber(localDayOfWeek, { unit: "day" });
        case "ccc":
          return localize.day(dayOfWeek, {
            width: "abbreviated",
            context: "standalone",
          });
        // T
        case "ccccc":
          return localize.day(dayOfWeek, {
            width: "narrow",
            context: "standalone",
          });
        // Tu
        case "cccccc":
          return localize.day(dayOfWeek, {
            width: "short",
            context: "standalone",
          });
        // Tuesday
        case "cccc":
        default:
          return localize.day(dayOfWeek, {
            width: "wide",
            context: "standalone",
          });
      }
    },

    // ISO day of week
    i: function (date, token, localize) {
      const dayOfWeek = date.getDay();
      const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
      switch (token) {
        // 2
        case "i":
          return String(isoDayOfWeek);
        // 02
        case "ii":
          return addLeadingZeros(isoDayOfWeek, token.length);
        // 2nd
        case "io":
          return localize.ordinalNumber(isoDayOfWeek, { unit: "day" });
        // Tue
        case "iii":
          return localize.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting",
          });
        // T
        case "iiiii":
          return localize.day(dayOfWeek, {
            width: "narrow",
            context: "formatting",
          });
        // Tu
        case "iiiiii":
          return localize.day(dayOfWeek, {
            width: "short",
            context: "formatting",
          });
        // Tuesday
        case "iiii":
        default:
          return localize.day(dayOfWeek, {
            width: "wide",
            context: "formatting",
          });
      }
    },

    // AM or PM
    a: function (date, token, localize) {
      const hours = date.getHours();
      const dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";

      switch (token) {
        case "a":
        case "aa":
          return localize.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting",
          });
        case "aaa":
          return localize
            .dayPeriod(dayPeriodEnumValue, {
              width: "abbreviated",
              context: "formatting",
            })
            .toLowerCase();
        case "aaaaa":
          return localize.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting",
          });
        case "aaaa":
        default:
          return localize.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting",
          });
      }
    },

    // AM, PM, midnight, noon
    b: function (date, token, localize) {
      const hours = date.getHours();
      let dayPeriodEnumValue;
      if (hours === 12) {
        dayPeriodEnumValue = dayPeriodEnum.noon;
      } else if (hours === 0) {
        dayPeriodEnumValue = dayPeriodEnum.midnight;
      } else {
        dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
      }

      switch (token) {
        case "b":
        case "bb":
          return localize.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting",
          });
        case "bbb":
          return localize
            .dayPeriod(dayPeriodEnumValue, {
              width: "abbreviated",
              context: "formatting",
            })
            .toLowerCase();
        case "bbbbb":
          return localize.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting",
          });
        case "bbbb":
        default:
          return localize.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting",
          });
      }
    },

    // in the morning, in the afternoon, in the evening, at night
    B: function (date, token, localize) {
      const hours = date.getHours();
      let dayPeriodEnumValue;
      if (hours >= 17) {
        dayPeriodEnumValue = dayPeriodEnum.evening;
      } else if (hours >= 12) {
        dayPeriodEnumValue = dayPeriodEnum.afternoon;
      } else if (hours >= 4) {
        dayPeriodEnumValue = dayPeriodEnum.morning;
      } else {
        dayPeriodEnumValue = dayPeriodEnum.night;
      }

      switch (token) {
        case "B":
        case "BB":
        case "BBB":
          return localize.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting",
          });
        case "BBBBB":
          return localize.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting",
          });
        case "BBBB":
        default:
          return localize.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting",
          });
      }
    },

    // Hour [1-12]
    h: function (date, token, localize) {
      if (token === "ho") {
        let hours = date.getHours() % 12;
        if (hours === 0) hours = 12;
        return localize.ordinalNumber(hours, { unit: "hour" });
      }

      return lightFormatters.h(date, token);
    },

    // Hour [0-23]
    H: function (date, token, localize) {
      if (token === "Ho") {
        return localize.ordinalNumber(date.getHours(), { unit: "hour" });
      }

      return lightFormatters.H(date, token);
    },

    // Hour [0-11]
    K: function (date, token, localize) {
      const hours = date.getHours() % 12;

      if (token === "Ko") {
        return localize.ordinalNumber(hours, { unit: "hour" });
      }

      return addLeadingZeros(hours, token.length);
    },

    // Hour [1-24]
    k: function (date, token, localize) {
      let hours = date.getHours();
      if (hours === 0) hours = 24;

      if (token === "ko") {
        return localize.ordinalNumber(hours, { unit: "hour" });
      }

      return addLeadingZeros(hours, token.length);
    },

    // Minute
    m: function (date, token, localize) {
      if (token === "mo") {
        return localize.ordinalNumber(date.getMinutes(), { unit: "minute" });
      }

      return lightFormatters.m(date, token);
    },

    // Second
    s: function (date, token, localize) {
      if (token === "so") {
        return localize.ordinalNumber(date.getSeconds(), { unit: "second" });
      }

      return lightFormatters.s(date, token);
    },

    // Fraction of second
    S: function (date, token) {
      return lightFormatters.S(date, token);
    },

    // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
    X: function (date, token, _localize, options) {
      const originalDate = options._originalDate || date;
      const timezoneOffset = originalDate.getTimezoneOffset();

      if (timezoneOffset === 0) {
        return "Z";
      }

      switch (token) {
        // Hours and optional minutes
        case "X":
          return formatTimezoneWithOptionalMinutes(timezoneOffset);

        // Hours, minutes and optional seconds without `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `XX`
        case "XXXX":
        case "XX": // Hours and minutes without `:` delimiter
          return formatTimezone(timezoneOffset);

        // Hours, minutes and optional seconds with `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `XXX`
        case "XXXXX":
        case "XXX": // Hours and minutes with `:` delimiter
        default:
          return formatTimezone(timezoneOffset, ":");
      }
    },

    // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
    x: function (date, token, _localize, options) {
      const originalDate = options._originalDate || date;
      const timezoneOffset = originalDate.getTimezoneOffset();

      switch (token) {
        // Hours and optional minutes
        case "x":
          return formatTimezoneWithOptionalMinutes(timezoneOffset);

        // Hours, minutes and optional seconds without `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `xx`
        case "xxxx":
        case "xx": // Hours and minutes without `:` delimiter
          return formatTimezone(timezoneOffset);

        // Hours, minutes and optional seconds with `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `xxx`
        case "xxxxx":
        case "xxx": // Hours and minutes with `:` delimiter
        default:
          return formatTimezone(timezoneOffset, ":");
      }
    },

    // Timezone (GMT)
    O: function (date, token, _localize, options) {
      const originalDate = options._originalDate || date;
      const timezoneOffset = originalDate.getTimezoneOffset();

      switch (token) {
        // Short
        case "O":
        case "OO":
        case "OOO":
          return "GMT" + formatTimezoneShort(timezoneOffset, ":");
        // Long
        case "OOOO":
        default:
          return "GMT" + formatTimezone(timezoneOffset, ":");
      }
    },

    // Timezone (specific non-location)
    z: function (date, token, _localize, options) {
      const originalDate = options._originalDate || date;
      const timezoneOffset = originalDate.getTimezoneOffset();

      switch (token) {
        // Short
        case "z":
        case "zz":
        case "zzz":
          return "GMT" + formatTimezoneShort(timezoneOffset, ":");
        // Long
        case "zzzz":
        default:
          return "GMT" + formatTimezone(timezoneOffset, ":");
      }
    },

    // Seconds timestamp
    t: function (date, token, _localize, options) {
      const originalDate = options._originalDate || date;
      const timestamp = Math.floor(originalDate.getTime() / 1000);
      return addLeadingZeros(timestamp, token.length);
    },

    // Milliseconds timestamp
    T: function (date, token, _localize, options) {
      const originalDate = options._originalDate || date;
      const timestamp = originalDate.getTime();
      return addLeadingZeros(timestamp, token.length);
    },
  };

  function formatTimezoneShort(offset, delimiter = "") {
    const sign = offset > 0 ? "-" : "+";
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset / 60);
    const minutes = absOffset % 60;
    if (minutes === 0) {
      return sign + String(hours);
    }
    return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
  }

  function formatTimezoneWithOptionalMinutes(offset, delimiter) {
    if (offset % 60 === 0) {
      const sign = offset > 0 ? "-" : "+";
      return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
    }
    return formatTimezone(offset, delimiter);
  }

  function formatTimezone(offset, delimiter = "") {
    const sign = offset > 0 ? "-" : "+";
    const absOffset = Math.abs(offset);
    const hours = addLeadingZeros(Math.floor(absOffset / 60), 2);
    const minutes = addLeadingZeros(absOffset % 60, 2);
    return sign + hours + delimiter + minutes;
  }

  const dateLongFormatter = (pattern, formatLong) => {
    switch (pattern) {
      case "P":
        return formatLong.date({ width: "short" });
      case "PP":
        return formatLong.date({ width: "medium" });
      case "PPP":
        return formatLong.date({ width: "long" });
      case "PPPP":
      default:
        return formatLong.date({ width: "full" });
    }
  };

  const timeLongFormatter = (pattern, formatLong) => {
    switch (pattern) {
      case "p":
        return formatLong.time({ width: "short" });
      case "pp":
        return formatLong.time({ width: "medium" });
      case "ppp":
        return formatLong.time({ width: "long" });
      case "pppp":
      default:
        return formatLong.time({ width: "full" });
    }
  };

  const dateTimeLongFormatter = (pattern, formatLong) => {
    const matchResult = pattern.match(/(P+)(p+)?/) || [];
    const datePattern = matchResult[1];
    const timePattern = matchResult[2];

    if (!timePattern) {
      return dateLongFormatter(pattern, formatLong);
    }

    let dateTimeFormat;

    switch (datePattern) {
      case "P":
        dateTimeFormat = formatLong.dateTime({ width: "short" });
        break;
      case "PP":
        dateTimeFormat = formatLong.dateTime({ width: "medium" });
        break;
      case "PPP":
        dateTimeFormat = formatLong.dateTime({ width: "long" });
        break;
      case "PPPP":
      default:
        dateTimeFormat = formatLong.dateTime({ width: "full" });
        break;
    }

    return dateTimeFormat
      .replace("{{date}}", dateLongFormatter(datePattern, formatLong))
      .replace("{{time}}", timeLongFormatter(timePattern, formatLong));
  };

  const longFormatters = {
    p: timeLongFormatter,
    P: dateTimeLongFormatter,
  };

  const dayOfYearTokenRE = /^D+$/;
  const weekYearTokenRE = /^Y+$/;

  const throwTokens = ["D", "DD", "YY", "YYYY"];

  function isProtectedDayOfYearToken(token) {
    return dayOfYearTokenRE.test(token);
  }

  function isProtectedWeekYearToken(token) {
    return weekYearTokenRE.test(token);
  }

  function warnOrThrowProtectedError(token, format, input) {
    const _message = message(token, format, input);
    console.warn(_message);
    if (throwTokens.includes(token)) throw new RangeError(_message);
  }

  function message(token, format, input) {
    const subject = token[0] === "Y" ? "years" : "days of the month";
    return `Use \`${token.toLowerCase()}\` instead of \`${token}\` (in \`${format}\`) for formatting ${subject} to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
  }

  // This RegExp consists of three parts separated by `|`:
  // - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
  //   (one of the certain letters followed by `o`)
  // - (\w)\1* matches any sequences of the same letter
  // - '' matches two quote characters in a row
  // - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
  //   except a single quote symbol, which ends the sequence.
  //   Two quote characters do not end the sequence.
  //   If there is no matching single quote
  //   then the sequence will continue until the end of the string.
  // - . matches any single character unmatched by previous parts of the RegExps
  const formattingTokensRegExp =
    /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;

  // This RegExp catches symbols escaped by quotes, and also
  // sequences of symbols P, p, and the combinations like `PPPPPPPppppp`
  const longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;

  const escapedStringRegExp = /^'([^]*?)'?$/;
  const doubleQuoteRegExp = /''/g;
  const unescapedLatinCharacterRegExp = /[a-zA-Z]/;

  /**
   * The {@link format} function options.
   */

  /**
   * @name format
   * @category Common Helpers
   * @summary Format the date.
   *
   * @description
   * Return the formatted date string in the given format. The result may vary by locale.
   *
   * > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
   * > See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   *
   * The characters wrapped between two single quotes characters (') are escaped.
   * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
   * (see the last example)
   *
   * Format of the string is based on Unicode Technical Standard #35:
   * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
   * with a few additions (see note 7 below the table).
   *
   * Accepted patterns:
   * | Unit                            | Pattern | Result examples                   | Notes |
   * |---------------------------------|---------|-----------------------------------|-------|
   * | Era                             | G..GGG  | AD, BC                            |       |
   * |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
   * |                                 | GGGGG   | A, B                              |       |
   * | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
   * |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
   * |                                 | yy      | 44, 01, 00, 17                    | 5     |
   * |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
   * |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
   * |                                 | yyyyy   | ...                               | 3,5   |
   * | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
   * |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
   * |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
   * |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
   * |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
   * |                                 | YYYYY   | ...                               | 3,5   |
   * | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
   * |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
   * |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
   * |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
   * |                                 | RRRRR   | ...                               | 3,5,7 |
   * | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
   * |                                 | uu      | -43, 01, 1900, 2017               | 5     |
   * |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
   * |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
   * |                                 | uuuuu   | ...                               | 3,5   |
   * | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
   * |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
   * |                                 | QQ      | 01, 02, 03, 04                    |       |
   * |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
   * |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
   * |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
   * | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
   * |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
   * |                                 | qq      | 01, 02, 03, 04                    |       |
   * |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
   * |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
   * |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
   * | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
   * |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
   * |                                 | MM      | 01, 02, ..., 12                   |       |
   * |                                 | MMM     | Jan, Feb, ..., Dec                |       |
   * |                                 | MMMM    | January, February, ..., December  | 2     |
   * |                                 | MMMMM   | J, F, ..., D                      |       |
   * | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
   * |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
   * |                                 | LL      | 01, 02, ..., 12                   |       |
   * |                                 | LLL     | Jan, Feb, ..., Dec                |       |
   * |                                 | LLLL    | January, February, ..., December  | 2     |
   * |                                 | LLLLL   | J, F, ..., D                      |       |
   * | Local week of year              | w       | 1, 2, ..., 53                     |       |
   * |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
   * |                                 | ww      | 01, 02, ..., 53                   |       |
   * | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
   * |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
   * |                                 | II      | 01, 02, ..., 53                   | 7     |
   * | Day of month                    | d       | 1, 2, ..., 31                     |       |
   * |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
   * |                                 | dd      | 01, 02, ..., 31                   |       |
   * | Day of year                     | D       | 1, 2, ..., 365, 366               | 9     |
   * |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
   * |                                 | DD      | 01, 02, ..., 365, 366             | 9     |
   * |                                 | DDD     | 001, 002, ..., 365, 366           |       |
   * |                                 | DDDD    | ...                               | 3     |
   * | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Sun           |       |
   * |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
   * |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
   * |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
   * | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
   * |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
   * |                                 | ii      | 01, 02, ..., 07                   | 7     |
   * |                                 | iii     | Mon, Tue, Wed, ..., Sun           | 7     |
   * |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
   * |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
   * |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Sa, Su        | 7     |
   * | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
   * |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
   * |                                 | ee      | 02, 03, ..., 01                   |       |
   * |                                 | eee     | Mon, Tue, Wed, ..., Sun           |       |
   * |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
   * |                                 | eeeee   | M, T, W, T, F, S, S               |       |
   * |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
   * | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
   * |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
   * |                                 | cc      | 02, 03, ..., 01                   |       |
   * |                                 | ccc     | Mon, Tue, Wed, ..., Sun           |       |
   * |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
   * |                                 | ccccc   | M, T, W, T, F, S, S               |       |
   * |                                 | cccccc  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
   * | AM, PM                          | a..aa   | AM, PM                            |       |
   * |                                 | aaa     | am, pm                            |       |
   * |                                 | aaaa    | a.m., p.m.                        | 2     |
   * |                                 | aaaaa   | a, p                              |       |
   * | AM, PM, noon, midnight          | b..bb   | AM, PM, noon, midnight            |       |
   * |                                 | bbb     | am, pm, noon, midnight            |       |
   * |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
   * |                                 | bbbbb   | a, p, n, mi                       |       |
   * | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
   * |                                 | BBBB    | at night, in the morning, ...     | 2     |
   * |                                 | BBBBB   | at night, in the morning, ...     |       |
   * | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
   * |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
   * |                                 | hh      | 01, 02, ..., 11, 12               |       |
   * | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
   * |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
   * |                                 | HH      | 00, 01, 02, ..., 23               |       |
   * | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
   * |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
   * |                                 | KK      | 01, 02, ..., 11, 00               |       |
   * | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
   * |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
   * |                                 | kk      | 24, 01, 02, ..., 23               |       |
   * | Minute                          | m       | 0, 1, ..., 59                     |       |
   * |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
   * |                                 | mm      | 00, 01, ..., 59                   |       |
   * | Second                          | s       | 0, 1, ..., 59                     |       |
   * |                                 | so      | 0th, 1st, ..., 59th               | 7     |
   * |                                 | ss      | 00, 01, ..., 59                   |       |
   * | Fraction of second              | S       | 0, 1, ..., 9                      |       |
   * |                                 | SS      | 00, 01, ..., 99                   |       |
   * |                                 | SSS     | 000, 001, ..., 999                |       |
   * |                                 | SSSS    | ...                               | 3     |
   * | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
   * |                                 | XX      | -0800, +0530, Z                   |       |
   * |                                 | XXX     | -08:00, +05:30, Z                 |       |
   * |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
   * |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
   * | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
   * |                                 | xx      | -0800, +0530, +0000               |       |
   * |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
   * |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
   * |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
   * | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
   * |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
   * | Timezone (specific non-locat.)  | z...zzz | GMT-8, GMT+5:30, GMT+0            | 6     |
   * |                                 | zzzz    | GMT-08:00, GMT+05:30, GMT+00:00   | 2,6   |
   * | Seconds timestamp               | t       | 512969520                         | 7     |
   * |                                 | tt      | ...                               | 3,7   |
   * | Milliseconds timestamp          | T       | 512969520900                      | 7     |
   * |                                 | TT      | ...                               | 3,7   |
   * | Long localized date             | P       | 04/29/1453                        | 7     |
   * |                                 | PP      | Apr 29, 1453                      | 7     |
   * |                                 | PPP     | April 29th, 1453                  | 7     |
   * |                                 | PPPP    | Friday, April 29th, 1453          | 2,7   |
   * | Long localized time             | p       | 12:00 AM                          | 7     |
   * |                                 | pp      | 12:00:00 AM                       | 7     |
   * |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
   * |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
   * | Combination of date and time    | Pp      | 04/29/1453, 12:00 AM              | 7     |
   * |                                 | PPpp    | Apr 29, 1453, 12:00:00 AM         | 7     |
   * |                                 | PPPppp  | April 29th, 1453 at ...           | 7     |
   * |                                 | PPPPpppp| Friday, April 29th, 1453 at ...   | 2,7   |
   * Notes:
   * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
   *    are the same as "stand-alone" units, but are different in some languages.
   *    "Formatting" units are declined according to the rules of the language
   *    in the context of a date. "Stand-alone" units are always nominative singular:
   *
   *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
   *
   *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
   *
   * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
   *    the single quote characters (see below).
   *    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
   *    the output will be the same as default pattern for this unit, usually
   *    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
   *    are marked with "2" in the last column of the table.
   *
   *    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
   *
   *    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
   *
   *    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
   *
   *    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
   *
   *    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
   *
   * 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
   *    The output will be padded with zeros to match the length of the pattern.
   *
   *    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
   *
   * 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
   *    These tokens represent the shortest form of the quarter.
   *
   * 5. The main difference between `y` and `u` patterns are B.C. years:
   *
   *    | Year | `y` | `u` |
   *    |------|-----|-----|
   *    | AC 1 |   1 |   1 |
   *    | BC 1 |   1 |   0 |
   *    | BC 2 |   2 |  -1 |
   *
   *    Also `yy` always returns the last two digits of a year,
   *    while `uu` pads single digit years to 2 characters and returns other years unchanged:
   *
   *    | Year | `yy` | `uu` |
   *    |------|------|------|
   *    | 1    |   01 |   01 |
   *    | 14   |   14 |   14 |
   *    | 376  |   76 |  376 |
   *    | 1453 |   53 | 1453 |
   *
   *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
   *    except local week-numbering years are dependent on `options.weekStartsOn`
   *    and `options.firstWeekContainsDate` (compare [getISOWeekYear](https://date-fns.org/docs/getISOWeekYear)
   *    and [getWeekYear](https://date-fns.org/docs/getWeekYear)).
   *
   * 6. Specific non-location timezones are currently unavailable in `date-fns`,
   *    so right now these tokens fall back to GMT timezones.
   *
   * 7. These patterns are not in the Unicode Technical Standard #35:
   *    - `i`: ISO day of week
   *    - `I`: ISO week of year
   *    - `R`: ISO week-numbering year
   *    - `t`: seconds timestamp
   *    - `T`: milliseconds timestamp
   *    - `o`: ordinal number modifier
   *    - `P`: long localized date
   *    - `p`: long localized time
   *
   * 8. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
   *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   *
   * 9. `D` and `DD` tokens represent days of the year but they are often confused with days of the month.
   *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   *
   * @param date - The original date
   * @param format - The string of tokens
   * @param options - An object with options
   *
   * @returns The formatted date string
   *
   * @throws `date` must not be Invalid Date
   * @throws `options.locale` must contain `localize` property
   * @throws `options.locale` must contain `formatLong` property
   * @throws use `yyyy` instead of `YYYY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   * @throws use `yy` instead of `YY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   * @throws use `d` instead of `D` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   * @throws use `dd` instead of `DD` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   * @throws format string contains an unescaped latin alphabet character
   *
   * @example
   * // Represent 11 February 2014 in middle-endian format:
   * const result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
   * //=> '02/11/2014'
   *
   * @example
   * // Represent 2 July 2014 in Esperanto:
   * import { eoLocale } from 'date-fns/locale/eo'
   * const result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
   *   locale: eoLocale
   * })
   * //=> '2-a de julio 2014'
   *
   * @example
   * // Escape string by single quote characters:
   * const result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
   * //=> "3 o'clock"
   */
  function format(date, formatStr, options) {
    const defaultOptions = getDefaultOptions();
    const locale = defaultOptions.locale ?? enUS;

    const firstWeekContainsDate =
      defaultOptions.firstWeekContainsDate ??
      defaultOptions.locale?.options?.firstWeekContainsDate ??
      1;

    const weekStartsOn =
      defaultOptions.weekStartsOn ??
      defaultOptions.locale?.options?.weekStartsOn ??
      0;

    const originalDate = toDate(date);

    if (!isValid(originalDate)) {
      throw new RangeError("Invalid time value");
    }

    const formatterOptions = {
      firstWeekContainsDate: firstWeekContainsDate,
      weekStartsOn: weekStartsOn,
      locale: locale,
      _originalDate: originalDate,
    };

    const result = formatStr
      .match(longFormattingTokensRegExp)
      .map(function (substring) {
        const firstCharacter = substring[0];
        if (firstCharacter === "p" || firstCharacter === "P") {
          const longFormatter = longFormatters[firstCharacter];
          return longFormatter(substring, locale.formatLong);
        }
        return substring;
      })
      .join("")
      .match(formattingTokensRegExp)
      .map(function (substring) {
        // Replace two single quote characters with one single quote character
        if (substring === "''") {
          return "'";
        }

        const firstCharacter = substring[0];
        if (firstCharacter === "'") {
          return cleanEscapedString(substring);
        }

        const formatter = formatters[firstCharacter];
        if (formatter) {
          if (
            isProtectedWeekYearToken(substring)
          ) {
            warnOrThrowProtectedError(substring, formatStr, String(date));
          }
          if (
            isProtectedDayOfYearToken(substring)
          ) {
            warnOrThrowProtectedError(substring, formatStr, String(date));
          }
          return formatter(
            originalDate,
            substring,
            locale.localize,
            formatterOptions,
          );
        }

        if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
          throw new RangeError(
            "Format string contains an unescaped latin alphabet character `" +
              firstCharacter +
              "`",
          );
        }

        return substring;
      })
      .join("");

    return result;
  }

  function cleanEscapedString(input) {
    const matched = input.match(escapedStringRegExp);

    if (!matched) {
      return input;
    }

    return matched[1].replace(doubleQuoteRegExp, "'");
  }

  class DevServer {
      static get(path, varName) {
          return fetch(`http://localhost:${SERVER_PORT}/${String(path)}`)
              .then(result => {
              var _a;
              if (!isNil(result) && !isEmpty(result)) {
                  if ((_a = result.headers.get('Content-Type')) === null || _a === void 0 ? void 0 : _a.includes('application/json')) {
                      return result.json();
                  }
                  else {
                      return result.text();
                  }
              }
              return null;
          }).then(result => {
              if (!isNil(result) && !isEmpty(result) && !isNil(varName)) {
                  setVar(String(varName), result);
              }
              return result;
          })
              .catch(e => {
              throw new Error(e);
          });
      }
  }
  DevServer.set = (path, value) => {
      return fetch(`http://localhost:${SERVER_PORT}/${String(path)}`, {
          method: 'POST',
          body: JSON.stringify(value),
          headers: {
              'Content-Type': 'application/json',
          },
          mode: 'no-cors'
      }).then(result => {
          if (!isNil(result) && !isEmpty(result)) {
              return result.json();
          }
          return null;
      }).then(result => {
          return result;
      })
          .catch(e => {
      });
  };

  const fetchGitSummary = (varName) => {
      return DevServer.get('git/summary', varName);
  };

  const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
  class Info {
      static init() {
          var _a;
          if (((_a = options === null || options === void 0 ? void 0 : options.toolbarOptions) === null || _a === void 0 ? void 0 : _a.showInfo) === false) {
              window.dispatchEvent(new CustomEvent(Info.eventTypes.ELEMENT_SET));
              return;
          }
          window.addEventListener('Demo:OptionsChanged', Info.handleOptionsChangedEvent);
          Info.initialized = true;
          Info.setElement();
          Info.reduxStateUnsubscribe = window === null || window === void 0 ? void 0 : window.store.subscribe(() => {
              Info.updateData('app');
          });
      }
      static setElement() {
          Info.area = document.createElement('div');
          Info.area.setAttribute('id', 'demo-tools-info');
          Info.area.appendChild(Info.getHeaderElement());
          Info.area.appendChild(Info.getLoadingElement());
          Info.setData()
              .then(() => Info.render())
              .finally(() => {
              Info.area.querySelectorAll('.demo-tools-info-loading').forEach(el => el.remove());
              window.dispatchEvent(new CustomEvent(Info.eventTypes.ELEMENT_SET));
          });
      }
      static render() {
          if (!Info.area) {
              return;
          }
          const wrapper = document.createElement('div');
          wrapper.classList.add('demo-tools-info-section');
          Info.data.forEach(section => {
              const html = section.data.map(Info.renderEntry).join('');
              wrapper.innerHTML += html;
          });
          if (Info.area.querySelector('.demo-tools-info-section')) {
              Info.area.querySelector('.demo-tools-info-section').replaceWith(wrapper);
          }
          else {
              Info.area.appendChild(wrapper);
          }
      }
      static setData() {
          return __awaiter(this, void 0, void 0, function* () {
              Info.data = [];
              return Info.getGitData()
                  .then(section => Info.data.push(section))
                  .then(() => Info.getProjectInfoData())
                  .then(section => Info.data.push(section))
                  .then(() => Info.getPageInfoData())
                  .then(data => Info.data.push(data))
                  .then(() => Info.getAppInfoData())
                  .then(data => Info.data.push(data));
          });
      }
      static updateData(key) {
          const index = findIndex$1(propEq(key, 'key'), Info.data);
          if (index === -1) {
              return;
          }
          let promise;
          switch (key) {
              case 'git':
                  promise = Info.getGitData();
                  break;
              case 'project':
                  promise = Info.getProjectInfoData();
                  break;
              case 'page':
                  promise = Info.getPageInfoData();
                  break;
              case 'app':
                  promise = Info.getAppInfoData();
                  break;
          }
          promise.then(section => {
              Info.data[index] = section;
              Info.render();
          });
      }
      static renderEntry(entry) {
          const pair = Object.entries(entry);
          return `<div class="${stringToSlug(pair[0][0])}-label">${pair[0][0]}:</div><div title="${pair[0][1]}" class="${stringToSlug(pair[0][0])}-value">${pair[0][1]}</div>`;
      }
      static getHeaderElement() {
          const title = document.createElement('h3');
          title.innerHTML = 'Info';
          title.setAttribute('class', 'demo-tools-info-title');
          return title;
      }
      static getGitData() {
          return __awaiter(this, void 0, void 0, function* () {
              let gitSummary = {};
              try {
                  gitSummary = yield fetchGitSummary();
              }
              catch (e) { }
              return {
                  key: 'git',
                  data: [
                      { ['Commit Id']: gitSummary.commit || 'unknown' },
                      { ['Date']: gitSummary.date ? format(new Date(gitSummary.date), DATE_TIME_FORMAT) : 'unknown' },
                      { ['Message']: gitSummary.message || 'unknown' },
                      { ['Tag']: gitSummary.tag || 'unknown' },
                      { ['Branch']: gitSummary.branch || 'unknown' },
                      { ['Branch switched']: gitSummary.branchSwitchTime || 'unknown' },
                  ]
              };
          });
      }
      static getProjectInfoData() {
          return __awaiter(this, void 0, void 0, function* () {
              let projectInfo = {};
              try {
                  projectInfo = yield DevServer.get('project-info');
              }
              catch (e) { }
              return {
                  key: 'project',
                  data: [
                      { ['Compiled at']: projectInfo.bundleMTime ? format(new Date(projectInfo.bundleMTime), DATE_TIME_FORMAT) : 'unknown' },
                  ]
              };
          });
      }
      static getPageInfoData() {
          return __awaiter(this, void 0, void 0, function* () {
              return {
                  key: 'page',
                  data: [
                      { ['Page loaded at']: (performance === null || performance === void 0 ? void 0 : performance.timeOrigin) ? format(new Date(performance === null || performance === void 0 ? void 0 : performance.timeOrigin), DATE_TIME_FORMAT) : 'unknown' },
                  ]
              };
          });
      }
      static getAppInfoData() {
          var _a;
          return __awaiter(this, void 0, void 0, function* () {
              const state = window.store.getState();
              const roles = (_a = pipe(prop('permissions'), keys)(state)) === null || _a === void 0 ? void 0 : _a.sort().map((role) => role.replace('fifx-', '').replace('-role', '')).join(', ');
              return {
                  key: 'app',
                  data: [
                      { ['User roles']: roles }
                  ]
              };
          });
      }
      static getGitElement() {
          return __awaiter(this, void 0, void 0, function* () {
              let gitSummary = {};
              try {
                  gitSummary = yield fetchGitSummary();
              }
              catch (e) {
              }
              const element = document.createElement('div');
              element.setAttribute('id', 'demo-tools-info-git');
              element.classList.add('demo-tools-info-section');
              const innerHTML = `
      <div>Commit Id:</div>
      <div>${gitSummary.commit || 'unknown'}</div>
      <div>Date:</div>
      <div>${gitSummary.date ? format(new Date(gitSummary.date), DATE_TIME_FORMAT) : 'unknown'}</div>
      <div>Message:</div>
      <div title="${gitSummary.message}">${gitSummary.message || 'unknown'}</div>
      <div>Branch:</div>
      <div>${gitSummary.branch || 'unknown'}</div>
      <div>Branch switched:</div>
      <div>${gitSummary.branchSwitchTime || 'unknown'}</div>`;
              element.innerHTML = innerHTML;
              return element;
          });
      }
      static getLoadingElement() {
          const element = document.createElement('div');
          element.setAttribute('class', 'demo-tools-info-loading');
          element.innerHTML = 'Loading...';
          return element;
      }
      static getProjectInfoElement() {
          return __awaiter(this, void 0, void 0, function* () {
              let projectInfo = {};
              try {
                  projectInfo = yield DevServer.get('project-info');
              }
              catch (e) {
              }
              const element = document.createElement('div');
              element.classList.add('demo-tools-info-section');
              const innerHTML = `
    <div>Compiled at:</div>
    <div>${projectInfo.bundleMTime ? format(new Date(projectInfo.bundleMTime), DATE_TIME_FORMAT) : 'unknown'}</div>
    `;
              element.innerHTML = innerHTML;
              return element;
          });
      }
      static getPageInfoElement() {
          return __awaiter(this, void 0, void 0, function* () {
              const element = document.createElement('div');
              element.classList.add('demo-tools-info-section');
              const innerHTML = `
    <div>Page loaded at:</div>
    <div>${(performance === null || performance === void 0 ? void 0 : performance.timeOrigin) ? format(new Date(performance === null || performance === void 0 ? void 0 : performance.timeOrigin), DATE_TIME_FORMAT) : 'unknown'}</div>
    `;
              element.innerHTML = innerHTML;
              return element;
          });
      }
      static handleOptionsChangedEvent(e) {
          var _a;
          Info.destroy();
          if ((_a = options === null || options === void 0 ? void 0 : options.toolbarOptions) === null || _a === void 0 ? void 0 : _a.showInfo) {
              Info.init();
          }
      }
      static destroy() {
          var _a;
          Info.initialized = false;
          Info.area = null;
          (_a = Info.reduxStateUnsubscribe) === null || _a === void 0 ? void 0 : _a.call(Info);
          window.removeEventListener('Demo:OptionsChanged', Info.handleOptionsChangedEvent);
      }
  }
  Info.initialized = false;
  Info.eventTypes = {
      ELEMENT_SET: 'DemoTools:Info:ElementSet',
  };
  Info.area = null;
  Info.data = [];
  Info.reduxStateUnsubscribe = null;

  class Toolbar {
      static init() {
          window.addEventListener('Demo:DemoRun', Toolbar.handleDemoRunEvent);
          window.addEventListener('Demo:DemoStop', Toolbar.handleDemoStopEvent);
          window.addEventListener(Info.eventTypes.ELEMENT_SET, Toolbar.handleInfoElementSet);
          if (options.mode === 'compose') {
              MenuBar.init();
          }
          Steps.init();
          Info.init();
          Toolbar.mount();
          Toolbar.state.initialized = true;
      }
      static mount() {
          var _a, _b, _c;
          Toolbar.setElement();
          if (options.mode === 'compose') {
              (_a = Toolbar.area.querySelector('.demo-tools-toolbar-menuBar')) === null || _a === void 0 ? void 0 : _a.appendChild(MenuBar.area);
          }
          (_b = Toolbar.area.querySelector('.demo-tools-toolbar-steps')) === null || _b === void 0 ? void 0 : _b.replaceChildren(Steps.area);
          Info.area && ((_c = Toolbar.area.querySelector('.demo-tools-toolbar-info')) === null || _c === void 0 ? void 0 : _c.appendChild(Info.area));
          document.body.style.display = 'flex';
          document.body.appendChild(Toolbar.area);
      }
      static setElement() {
          if (Toolbar.area) {
              return;
          }
          const area = document.createElement('div');
          const sections = Toolbar.sections.map(sectionName => {
              const el = document.createElement('div');
              el.setAttribute('class', `demo-tools-toolbar-section demo-tools-toolbar-${sectionName}`);
              return el;
          });
          area.setAttribute('class', 'demo-tools demo-tools-toolbar');
          sections.forEach(section => area.appendChild(section));
          Toolbar.area = area;
      }
      static unmount() {
          document.body.querySelectorAll('.demo-tools-toolbar').forEach(el => el.remove());
          Toolbar.area = null;
      }
      static hideSection(sectionName) {
          if (Toolbar.area.querySelector(`.demo-tools-toolbar-${sectionName}`) instanceof HTMLElement) {
              Toolbar.area.querySelector(`.demo-tools-toolbar-${sectionName}`).style.display = 'none';
          }
      }
      static showSection(sectionName) {
          if (Toolbar.area.querySelector(`.demo-tools-toolbar-${sectionName}`) instanceof HTMLElement) {
              Toolbar.area.querySelector(`.demo-tools-toolbar-${sectionName}`).style.display = 'block';
          }
      }
      static destroy() {
          Toolbar.unmount();
          if (options.mode === 'compose') {
              MenuBar.destroy();
          }
          Steps.destroy();
          Info.destroy();
          document.body.style.display = 'block';
          Toolbar.state.initialized = false;
          window.removeEventListener('Demo:DemoRun', Toolbar.handleDemoRunEvent);
          window.removeEventListener('Demo:DemoStop', Toolbar.handleDemoStopEvent);
          window.removeEventListener(Info.eventTypes.ELEMENT_SET, Toolbar.handleInfoElementSet);
      }
      static handleDemoRunEvent() {
      }
      static handleDemoStopEvent() {
      }
      static handleInfoElementSet() {
          setTimeout(() => window.dispatchEvent(new CustomEvent(Toolbar.eventTypes.ELEMENT_SET)));
      }
  }
  Toolbar.state = {
      initialized: false,
  };
  Toolbar.eventTypes = {
      ELEMENT_SET: 'DemoTools:Toolbar:ElementSet',
  };
  Toolbar.sections = [
      'menuBar',
      'steps',
      'info',
  ];
  Toolbar.area = null;

  class Storage {
      constructor() {
          this.log = (logsKey, value) => {
              return fetch(`http://localhost:${SERVER_PORT}/storage/log/${encodeURIComponent(`${logsKey}`)}`, {
                  method: 'POST',
                  body: JSON.stringify(value),
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  mode: 'no-cors'
              }).then(result => {
                  if (!isNil(result) && !isEmpty(result)) {
                      return result.json();
                  }
                  return null;
              }).then(result => {
                  return result;
              })
                  .catch(e => {
              });
          };
          this.set = (key, value) => {
              return fetch(`http://localhost:${SERVER_PORT}/storage/set/${encodeURIComponent(`${key}`)}`, {
                  method: 'POST',
                  body: JSON.stringify(value),
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  mode: 'no-cors'
              }).then(result => {
                  if (!isNil(result) && !isEmpty(result)) {
                      return result.json();
                  }
                  return null;
              }).then(result => {
                  return result;
              })
                  .catch(e => {
              });
          };
          this.clear = (key) => {
              return fetch(`http://localhost:${SERVER_PORT}/storage/clear/${encodeURIComponent(`${key}`)}`)
                  .then(result => {
                  if (!isNil(result) && !isEmpty(result)) {
                      return result.json();
                  }
                  return null;
              }).then(result => {
                  return result;
              })
                  .catch(e => {
                  throw new Error(e);
              });
          };
          this.get = (key) => {
              return fetch(`http://localhost:${SERVER_PORT}/storage/get/${encodeURIComponent(`${key}`)}`).then(result => {
                  if (!isNil(result) && !isEmpty(result)) {
                      return result.json();
                  }
                  return null;
              }).then(result => {
                  return result;
              })
                  .catch(e => {
                  throw new Error(e);
              });
          };
      }
  }
  var Storage$1 = new Storage();

  const STEPS_KEY = 'steps';
  class DemoStorage {
      static setDemo(options) {
          return __awaiter(this, void 0, void 0, function* () {
              return Storage$1.set(`${DEMOS_KEY}.${options.title}`, stringifyVar(options));
          });
      }
      static getDemo(title) {
          return __awaiter(this, void 0, void 0, function* () {
              const demoStr = yield Storage$1.get(`${DEMOS_KEY}.${title}`);
              return reviveVar(demoStr);
          });
      }
      static setStep(step) {
          return __awaiter(this, void 0, void 0, function* () {
              return Storage$1.set(`${STEPS_KEY}.${step.title}`, stringifyVar(step));
          });
      }
      static getStep(title) {
          return __awaiter(this, void 0, void 0, function* () {
              const stepStr = yield Storage$1.get(`${STEPS_KEY}.${title}`);
              return reviveVar(stepStr);
          });
      }
      static setReduxActionStep(params) {
          return __awaiter(this, void 0, void 0, function* () {
              return DemoStorage.setStep(Step.getReduxActionStep(params));
          });
      }
      static setRestoringAppStateStep(params) {
          return __awaiter(this, void 0, void 0, function* () {
              const step = Step.getRestoringAppStateStep();
              if (params.title) {
                  step.title = params.title;
              }
              return DemoStorage.setStep(step);
          });
      }
  }

  var css_248z = ".demo-tools.console{border:1px solid #bbb;bottom:0;box-sizing:border-box;font-family:monospace;left:0;max-height:200px;min-height:200px;overflow:hidden;padding:8px;position:fixed;width:calc(100% - 397px);z-index:9999}.demo-tools.console .topbar{align-items:center;border-bottom:1px solid #bbb;display:flex;gap:8px;padding:6px}.demo-tools.console .topbar input{flex:1;outline:none;padding:4px 6px;width:300px}.demo-tools.console .logs{flex:1;overflow:auto;padding-top:8px}.demo-tools.console .logs>div{display:flex;gap:5px;margin-top:1px;overflow-wrap:anywhere}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0eWxlLmxlc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsb0JBV0UscUJBQUEsQ0FUQSxRQUFBLENBTUEscUJBQUEsQ0FGQSxxQkFBQSxDQUhBLE1BQUEsQ0FPQSxnQkFBQSxDQURBLGdCQUFBLENBSkEsZUFBQSxDQUVBLFdBQUEsQ0FOQSxjQUFBLENBR0Esd0JBQUEsQ0FRQSxZQUNGLENBYkEsNEJBa0JJLGtCQUFBLENBRkEsNEJBQUEsQ0FDQSxZQUFBLENBRUEsT0FBQSxDQUpBLFdBS0osQ0FwQkEsa0NBc0JNLE1BQUEsQ0FDQSxZQUFBLENBQ0EsZUFBQSxDQUNBLFdBQ04sQ0ExQkEsMEJBOEJJLE1BQUEsQ0FDQSxhQUFBLENBQ0EsZUFESixDQUdJLDhCQUdFLFlBQUEsQ0FDQSxPQUFBLENBSEEsY0FBQSxDQUNBLHNCQUNOIiwiZmlsZSI6InN0eWxlLmxlc3MifQ== */";
  styleInject(css_248z);

  const defaultConsoleOptions = {
      override: false,
      style: {},
      logTypes: ['log', 'info'],
  };
  class Console {
      static init() {
          Console.initialized = true;
          Console.originalConsole = {
              log: console.log.bind(console),
              warn: console.warn.bind(console),
              error: console.error.bind(console),
              clear: console.clear.bind(console),
              info: console.info.bind(console),
              groupCollapsed: console.groupCollapsed.bind(console),
              groupEnd: console.groupEnd.bind(console),
          };
          if (options.consoleOptions.override) {
              console.groupCollapsed = () => null;
              console.groupEnd = () => null;
          }
          console.log = (...args) => {
              if (options.consoleOptions.logTypes.includes('log')) {
                  Console.write('log', args);
              }
              if (!options.consoleOptions.override) {
                  Console.originalConsole.log(...args);
              }
          };
          console.info = (...args) => {
              if (options.consoleOptions.logTypes.includes('info')) {
                  Console.write('info', args);
              }
              if (!options.consoleOptions.override) {
                  Console.originalConsole.info(...args);
              }
          };
          console.warn = (...args) => {
              if (options.consoleOptions.logTypes.includes('warn')) {
                  Console.write('warn', args);
              }
              if (!options.consoleOptions.override) {
                  Console.originalConsole.warn(...args);
              }
          };
          console.error = (...args) => {
              if (options.consoleOptions.logTypes.includes('error')) {
                  Console.write('error', args);
              }
              if (!options.consoleOptions.override) {
                  Console.originalConsole.error(...args);
              }
          };
          console.clear = () => {
              Console.area.querySelector('.demo-tools.console .logs').innerHTML = '';
              if (!options.consoleOptions.override) {
                  Console.originalConsole.clear();
              }
          };
          window.addEventListener('Demo:OptionsChanged', Console.handleDemoOptionsChanged);
          Console.show();
      }
      static setElement() {
          if (!Console.initialized) {
              return;
          }
          Console.area = document.createElement('div');
          Console.area.classList.add('demo-tools');
          Console.area.classList.add('console');
          if (options.consoleOptions.style) {
              Object.assign(Console.area.style, options.consoleOptions.style);
          }
          Console.area.appendChild(Console.getTopbarElement());
          Console.area.appendChild(Console.getLogsElement());
      }
      static getTopbarElement() {
          const topbar = document.createElement('div');
          const title = document.createElement('span');
          title.textContent = 'Custom Console';
          const filterInput = document.createElement('input');
          filterInput.placeholder = 'Filter logs...';
          filterInput.classList.add('filter-input');
          const pathInput = document.createElement('input');
          pathInput.placeholder = 'Path...';
          pathInput.classList.add('path-input');
          topbar.appendChild(title);
          topbar.appendChild(filterInput);
          topbar.appendChild(pathInput);
          topbar.classList.add('topbar');
          return topbar;
      }
      static getLogsElement() {
          const logs = document.createElement('div');
          logs.classList.add('logs');
          return logs;
      }
      static show() {
          if (!Console.area) {
              Console.setElement();
          }
          document.body.prepend(Console.area);
      }
      static write(type, args) {
          var _a, _b, _c;
          const line = document.createElement('div');
          const filtervalue = (_b = (_a = Console.area.querySelector('.demo-tools.console .filter-input')) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.toLowerCase();
          const pathValue = (_c = Console.area.querySelector('.demo-tools.console .path-input')) === null || _c === void 0 ? void 0 : _c.value;
          if (!any((arg) => {
              var _a;
              if (filtervalue) {
                  return (_a = JSON.stringify(arg)) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(filtervalue);
              }
              else {
                  return true;
              }
          }, args)) {
              return;
          }
          const html = pipe(map(arg => {
              var _a;
              if (typeof arg === 'object') {
                  if (pathValue) {
                      return JSON.stringify(path(pathValue.split('.'), arg));
                  }
                  else {
                      const obj = {};
                      for (const key in arg) {
                          obj[key] = (_a = arg[key]) === null || _a === void 0 ? void 0 : _a.toString();
                      }
                      return JSON.stringify(obj);
                  }
              }
              else {
                  return String(arg);
              }
          }), map(part => `<div style="${part.length > 30 ? 'white-space: normal' : 'white-space: nowrap'}">${part}</div>`), join(''))(args);
          if (isNil(html) || isEmpty(html)) {
              return;
          }
          line.innerHTML = `<div style="white-space: nowrap">[${type.toUpperCase()}]</div>${html}`;
          line.classList.add('log-line');
          Console.area.querySelector('.logs').appendChild(line);
          Console.area.querySelector('.logs').scrollTop = Console.area.querySelector('.logs').scrollHeight;
      }
      static refresh() {
          Console.destroy();
          Console.init();
      }
      static handleDemoOptionsChanged() {
          Console.refresh();
      }
      static destroy() {
          var _a;
          (_a = Console.area) === null || _a === void 0 ? void 0 : _a.remove();
          Console.area = null;
          if (Console.originalConsole) {
              console.log = Console.originalConsole.log;
              console.warn = Console.originalConsole.warn;
              console.error = Console.originalConsole.error;
              console.clear = Console.originalConsole.clear;
              console.info = Console.originalConsole.info;
              console.groupCollapsed = Console.originalConsole.groupCollapsed;
              console.groupEnd = Console.originalConsole.groupEnd;
              Console.originalConsole = null;
          }
          Console.initialized = false;
      }
  }
  Console.initialized = false;
  Console.area = null;
  Console.eventTypes = {};
  Console.originalConsole = null;

  class Highlighter {
      static highlight(items) {
          var _a;
          if (items) {
              Highlighter.items = Array.from(items);
          }
          const svgNS = 'http://www.w3.org/2000/svg';
          Highlighter.rootElement = document.createElement('div');
          Highlighter.rootElement.style.position = 'fixed';
          Highlighter.rootElement.style.inset = '0';
          Highlighter.rootElement.style.zIndex = '999999';
          Highlighter.rootElement.style.pointerEvents = 'none';
          const svg = document.createElementNS(svgNS, 'svg');
          svg.setAttribute('width', '100%');
          svg.setAttribute('height', '100%');
          svg.style.position = 'absolute';
          svg.style.inset = '0';
          const defs = document.createElementNS(svgNS, 'defs');
          const mask = document.createElementNS(svgNS, 'mask');
          mask.setAttribute('id', 'spotlight-mask');
          const whiteBg = document.createElementNS(svgNS, 'rect');
          whiteBg.setAttribute('width', '100%');
          whiteBg.setAttribute('height', '100%');
          whiteBg.setAttribute('fill', 'white');
          mask.appendChild(whiteBg);
          defs.appendChild(mask);
          svg.appendChild(defs);
          const dim = document.createElementNS(svgNS, 'rect');
          dim.setAttribute('width', '100%');
          dim.setAttribute('height', '100%');
          dim.setAttribute('fill', 'rgba(0,0,0,0.65)');
          dim.setAttribute('mask', 'url(#spotlight-mask)');
          svg.appendChild(dim);
          const actionLayer = document.createElement('div');
          actionLayer.style.position = 'absolute';
          actionLayer.style.inset = '0';
          actionLayer.style.pointerEvents = 'none';
          Highlighter.rootElement.appendChild(svg);
          Highlighter.rootElement.appendChild(actionLayer);
          document.body.appendChild(Highlighter.rootElement);
          Highlighter.items.forEach((item, itemIndex) => {
              const hole = document.createElementNS(svgNS, 'rect');
              hole.setAttribute('fill', 'black');
              hole.setAttribute('rx', '8');
              mask.appendChild(hole);
              Highlighter.holeNodes.push(hole);
              const toolbar = document.createElement('div');
              toolbar.style.position = 'fixed';
              toolbar.style.pointerEvents = 'auto';
              toolbar.style.background = 'white';
              toolbar.style.borderRadius = '8px';
              toolbar.style.padding = '3px';
              toolbar.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
              toolbar.style.display = 'flex';
              toolbar.style.gap = '4px';
              toolbar.style.transform = 'translateX(-50%)';
              item.actions.forEach((action, actionIndex) => {
                  const button = document.createElement('button');
                  button.textContent = action.label;
                  button.style.border = 'none';
                  button.style.color = 'black';
                  button.style.cursor = 'pointer';
                  button.style.fontWeight = '500';
                  button.style.borderRadius = '4px';
                  button.style.transition = 'background-color 0.2s';
                  button.dataset.itemIndex = String(itemIndex);
                  button.dataset.actionIndex = String(actionIndex);
                  button.addEventListener('click', Highlighter.onActionClick);
                  toolbar.appendChild(button);
              });
              actionLayer.appendChild(toolbar);
              Highlighter.toolbarNodes.push(toolbar);
          });
          (_a = actionLayer.querySelector('button:nth-child(1)')) === null || _a === void 0 ? void 0 : _a.focus();
          Highlighter.update();
          window.addEventListener('scroll', Highlighter.onScroll);
          window.addEventListener('resize', Highlighter.onResize);
          window.addEventListener('click', Highlighter.onClick);
      }
      static update() {
          Highlighter.items.forEach((item, index) => {
              const element = item.element;
              const rect = element.getBoundingClientRect();
              const pad = 6;
              const hole = Highlighter.holeNodes[index];
              hole.setAttribute('x', String(rect.left - pad));
              hole.setAttribute('y', String(rect.top - pad));
              hole.setAttribute('width', String(rect.width + pad * 2));
              hole.setAttribute('height', String(rect.height + pad * 2));
              const toolbar = Highlighter.toolbarNodes[index];
              toolbar.style.left = `${rect.left + rect.width / 2}px`;
              toolbar.style.top = `${rect.bottom + 8}px`;
          });
      }
      static unhighlight(element) {
          const index = Highlighter.items.findIndex(item => item.element === element);
          if (index !== -1) {
              Highlighter.holeNodes[index].remove();
              Highlighter.holeNodes.splice(index, 1);
              Highlighter.toolbarNodes[index].remove();
              Highlighter.toolbarNodes.splice(index, 1);
              Highlighter.items.splice(index, 1);
          }
      }
      static destroy() {
          var _a, _b, _c, _d;
          window.removeEventListener('scroll', Highlighter.onScroll);
          window.removeEventListener('resize', Highlighter.onResize);
          window.removeEventListener('click', Highlighter.onClick, true);
          Highlighter.items.forEach((item, itemIndex) => {
              item.actions.forEach((_, actionIndex) => {
                  var _a;
                  const button = (_a = Highlighter.toolbarNodes[itemIndex]) === null || _a === void 0 ? void 0 : _a.children[actionIndex];
                  button === null || button === void 0 ? void 0 : button.removeEventListener('click', Highlighter.onActionClick);
              });
          });
          (_a = Highlighter.rootElement) === null || _a === void 0 ? void 0 : _a.remove();
          (_b = Highlighter.rootElement) === null || _b === void 0 ? void 0 : _b.remove();
          (_c = Highlighter.holeNodes) === null || _c === void 0 ? void 0 : _c.forEach(node => node.remove());
          Highlighter.holeNodes = [];
          (_d = Highlighter.toolbarNodes) === null || _d === void 0 ? void 0 : _d.forEach(node => node.remove());
          Highlighter.toolbarNodes = [];
          Highlighter.items = [];
      }
  }
  Highlighter.items = [];
  Highlighter.rootElement = null;
  Highlighter.holeNodes = [];
  Highlighter.toolbarNodes = [];
  Highlighter.onScroll = () => Highlighter.update();
  Highlighter.onResize = () => Highlighter.update();
  Highlighter.onClick = (e) => {
      var _a;
      if (((_a = e.target) === null || _a === void 0 ? void 0 : _a.localName) === 'button')
          return;
      Highlighter.destroy();
  };
  Highlighter.onActionClick = (e) => {
      const action = Highlighter.items[Number(e.target.dataset.itemIndex)].actions[Number(e.target.dataset.actionIndex)];
      if (!action)
          return;
      Highlighter.destroy();
      action.action();
      e.stopPropagation();
  };

  let steps = [];
  class Demo {
      get steps() { return [...steps]; }
      get customData() {
          return Options.getInstance().customData;
      }
      get title() { return Options.getInstance().title; }
      get options() { return Options.getInstance(); }
      constructor(options = {}) {
          this.Driver = Ae;
          this.stepList = Steps;
          this.stepForm = StepForm;
          this.dom = Dom;
          this.highlighter = Highlighter;
          this.initialState = {
              running: false,
              activeStep: null,
              lastUpdatedStep: null,
          };
          this.state = Object.assign({}, this.initialState);
          this.defaultDriverOptions = {
              showButtons: ['close'],
              overlayOpacity: 0.4,
              popoverClass: 'demo-tools-driver-popover',
          };
          this.console = Console;
          steps = [];
          Options.setInstance(options);
          StepForm.init();
          CheckStepPrompt.init();
          window.addEventListener('keydown', EventHandlers.handleKeydown);
          if (Options.getInstance().renderToolbar) {
              Toolbar.init();
              window.addEventListener('beforeunload', EventHandlers.handleBeforeUnload);
              window.addEventListener(Steps.eventTypes.STEP_MOVE, EventHandlers.handleStepMoved);
              window.addEventListener(Steps.eventTypes.STEP_COPY, EventHandlers.handleStepCopied);
              window.addEventListener(Steps.eventTypes.STEP_DOUBLECLICK, EventHandlers.handleStepDoubleclick);
              window.addEventListener(Steps.eventTypes.STEP_CLICK, EventHandlers.handleStepClick);
              window.addEventListener(Steps.eventTypes.STEP_CTRL_CLICK, EventHandlers.handleStepCtrlClick);
              window.addEventListener(PlanStepForm.eventTypes.PLAN_STEP, EventHandlers.handlePlanStep);
              window.addEventListener(MenuBar.eventTypes.RESTORING_APP_STATE_STEP_CLICK, EventHandlers.handleRestoringAppStateStepClick);
              window.addEventListener(MenuBar.eventTypes.MODE_CLICK, EventHandlers.handleModeClick);
              window.addEventListener(MenuBar.eventTypes.EDIT_CLICK, EventHandlers.handleEditClick);
              window.addEventListener(MenuBar.eventTypes.VERBOSE_CLICK, EventHandlers.handleVerboseClick);
              window.addEventListener(MenuBar.eventTypes.REFERSH_DEMO_CLICK, EventHandlers.handleRefreshDemoClick);
              window.addEventListener(MenuBar.eventTypes.CLOSE_DEMO_CLICK, EventHandlers.handleCloseDemoClick);
              window.addEventListener(Toolbar.eventTypes.ELEMENT_SET, EventHandlers.handleToolbarElementSet);
              window.addEventListener(StepEditForm.eventTypes.CHANGE, EventHandlers.handleStepEditFormChange);
          }
          else {
              if (options.steps) {
                  this.setSteps(values(options.steps));
              }
          }
      }
      static getInstance(options = {}) {
          if (!Demo.instance) {
              Demo.instance = new Demo(options);
          }
          return Demo.instance;
      }
      setOptions(newOptions = {}) {
          Options.setInstance(Object.assign(Object.assign({}, Options.getInstance()), newOptions));
          this.dispatchOptionsChangedEvent();
      }
      edit() {
          if (this.options.editable === false) {
              this.setOptions({ editable: true });
          }
          else {
              this.setOptions({ editable: false });
          }
      }
      verbose() {
          if (this.options.verbose === false) {
              this.setOptions({ verbose: true });
          }
          else {
              this.setOptions({ verbose: false });
          }
      }
      addStep(step = {}) {
          this.insertStep(step, steps.length);
      }
      addHighlightStep(step = {}) {
          this.addStep(Object.assign(Object.assign({}, step), { title: step.title || `Step ${steps.length}`, type: 'highlight' }));
      }
      pickStep() {
          var _a;
          return __awaiter(this, void 0, void 0, function* () {
              const step = yield Step.pickStep(steps[this.state.activeStep]);
              if (!step) {
                  return;
              }
              if (this.state.activeStep !== null) {
                  this.updateStep(this.state.activeStep, step);
                  if (((_a = steps[this.state.activeStep + 1]) === null || _a === void 0 ? void 0 : _a.isFilled) === false) {
                      this.select(this.state.activeStep + 1);
                  }
                  else {
                      this.select(null);
                  }
                  return;
              }
              else {
                  this.addStep(step);
              }
          });
      }
      addReduxActionsStep(params) {
          if (isNil(window === null || window === void 0 ? void 0 : window.store)) {
              throw new Error('DemoTools: Redux store is not initialized');
          }
          this.insertStep(Step.getReduxActionStep(params), 0);
      }
      addRestoringAppStateStep() {
          this.insertStep(Step.getRestoringAppStateStep(), 0);
      }
      addRestoringGridDataStep() {
          this.insertStep(Step.getRestoringGridDataStep(), 0);
      }
      addStopStep() {
          this.insertStep({ title: 'Stop', type: 'stop', interval: 0 }, this.state.activeStep !== null ? this.state.activeStep + 1 : steps.length);
      }
      addPreset1() {
          this.addRestoringAppStateStep();
          this.addPreset3();
      }
      addPreset2() {
          this.addRestoringGridDataStep();
          this.addPreset3();
      }
      addPreset3() {
          this.insertStep({ func: () => window.store.isolateFe(), type: 'custom', title: 'Isolate FE', list: false }, 0);
          this.addStep({ func: () => window.store.deisolateFe(), type: 'custom', title: 'Deisolate FE', list: false });
          this.setOptions({ verbose: true });
      }
      addManualStep(title) {
          this.insertStep({ title, type: 'wait' }, this.state.activeStep !== null ? this.state.activeStep + 1 : steps.length);
      }
      restoreStep(title, index) {
          return __awaiter(this, void 0, void 0, function* () {
              if (!title) {
                  return;
              }
              const step = yield DemoStorage.getStep(title);
              if (!step) {
                  return;
              }
              this.insertStep(step, isNil(index) ? steps.length : index);
          });
      }
      setSteps(newSteps) {
          if (isNil(newSteps) || isEmpty(newSteps)) {
              return;
          }
          if (this.state.running) {
              this.stop();
          }
          steps = values(newSteps).map((step, index) => new Step(Object.assign(Object.assign({}, step), { title: step.title || `Custom step ${index}`, type: step.type || 'click', list: typeof step.list === 'boolean' ? step.list : true })));
          this.dispatchStepsChangedEvent();
      }
      insertStep(step = {}, index) {
          const adjustedStep = new Step(Object.assign(Object.assign({}, step), { title: step.title || `Custom step ${index}`, type: step.type || 'click', list: typeof step.list === 'boolean' ? step.list : true }));
          const index1 = !isNil(index) ? Number(index) : this.state.activeStep !== null ? this.state.activeStep + 1 : steps.length;
          steps = insert(index1, adjustedStep, steps);
          this.state.lastUpdatedStep = index1;
          this.dispatchStepsChangedEvent();
      }
      updateStep(title, step) {
          return __awaiter(this, void 0, void 0, function* () {
              if (this.state.running) {
                  this.pause();
              }
              let index;
              if (!isNil(title)) {
                  if (isNaN(Number(title))) {
                      index = findIndex$1((step) => step.title.toLowerCase().includes(title.toLowerCase()), steps);
                  }
                  else {
                      index = title;
                  }
              }
              else {
                  index = Number(isNil(this.state.activeStep) ? this.state.lastUpdatedStep : this.state.activeStep || 0);
              }
              if (index >= steps.length || index < 0) {
                  return;
              }
              let updatedStep;
              if (typeof step === 'string') {
                  const step1 = new Step(Object.assign(Object.assign({}, steps[index]), { xPath: step, selector: null }));
                  updatedStep = yield StepForm.getPrompt(step1);
              }
              else if (is(Object, step)) {
                  updatedStep = step;
              }
              else {
                  updatedStep = yield StepForm.getPrompt(steps[index]);
              }
              this.state.lastUpdatedStep = index;
              if (!isNil(updatedStep === null || updatedStep === void 0 ? void 0 : updatedStep.xPath) && updatedStep.xPath !== steps[index].xPath) {
                  updatedStep.xPathCheck = false;
              }
              steps[index] = new Step(Object.assign(Object.assign({}, steps[index]), updatedStep));
              this.dispatchStepChangedEvent(index);
          });
      }
      removeStep(title) {
          let index;
          if (isNaN(Number(title))) {
              index = findIndex$1((step) => step.title.toLowerCase().includes(title.toLowerCase()), steps);
          }
          else {
              index = title;
          }
          if (index === -1) {
              return;
          }
          steps = remove(index, 1, steps);
          if (this.state.activeStep === index) {
              this.select(null);
          }
          this.dispatchStepsChangedEvent();
      }
      removeAllSteps() {
          steps = [];
          this.dispatchStepsChangedEvent();
      }
      doStep(title) {
          var _a;
          return __awaiter(this, void 0, void 0, function* () {
              this.state.lastUpdatedStep = null;
              let index;
              if (isNaN(Number(title))) {
                  index = findIndex$1((step) => step.title.toLowerCase().includes(title.toLowerCase()), steps);
              }
              else {
                  index = title;
              }
              if (index === -1 || index >= steps.length) {
                  return;
              }
              this.select(index);
              if (!steps[index].elementBoundCheck) {
                  this.stop();
                  this.dispatchElementBoundStepCheckFailEvent(index);
                  return;
              }
              if (steps[index].type === 'highlight') {
                  this.highlight(index);
              }
              else if (steps[index].type === 'click') {
                  yield Dom.click(steps[index]);
              }
              else if (steps[index].type === 'rightclick') {
                  yield Dom.rightClick(steps[index]);
              }
              else if (steps[index].type === 'hover') {
                  yield Dom.hover(steps[index]);
              }
              else if (steps[index].type === 'setValue') {
                  yield Dom.setValue(steps[index], steps[index].value);
              }
              else if (steps[index].type === 'keyboard') {
                  Dom.keydown(steps[index], steps[index].keyboardKey);
              }
              else if (steps[index].type === 'scroll') {
                  Dom.scrollBy(steps[index], steps[index].scrollAxe, steps[index].scrollBy);
              }
              else if (steps[index].type === 'section') {
                  return;
              }
              else if (steps[index].type === 'stop') {
                  this.stop();
              }
              else if (steps[index].type === 'wait') {
                  this.pause();
                  this.state.activeStep = index + 1;
              }
              else {
                  (_a = steps[index]) === null || _a === void 0 ? void 0 : _a.func();
              }
          });
      }
      run(options = {}) {
          return __awaiter(this, void 0, void 0, function* () {
              this.dispatchRunEvent();
              Options.setInstance(Object.assign(Object.assign({}, Options.getInstance()), options));
              this.state.running = true;
              for (let i = (options === null || options === void 0 ? void 0 : options.from) || this.state.activeStep || 0; i <= ((options === null || options === void 0 ? void 0 : options.till) || steps.length - 1); i++) {
                  yield this.doStep(i);
                  const step = steps[i];
                  yield new Promise(resolve => setTimeout(resolve, (!isNil(step === null || step === void 0 ? void 0 : step.interval) && !isNaN(step === null || step === void 0 ? void 0 : step.interval) ? step === null || step === void 0 ? void 0 : step.interval : (Options.getInstance().interval || Demo.defaultInterval))));
                  if (step.type === 'highlight') {
                      this.unhighlight();
                  }
                  if (!this.state.running) {
                      return;
                  }
              }
              if (this.state.activeStep === ((options === null || options === void 0 ? void 0 : options.till) || steps.length - 1)) {
                  this.stop();
                  this.dispatchCompleteEvent();
              }
          });
      }
      jump(index) {
          if (index < 0 || index >= steps.length) {
              return;
          }
          this.doStep(index);
      }
      select(index) {
          this.state.activeStep = index;
          this.dispatchActiveStepChangedEvent();
      }
      swap(index1, index2) {
          if (isNil(index1) || isNil(index2) || index1 === index2 || index1 < 0 || index2 < 0 || index1 >= steps.length || index2 >= steps.length) {
              return;
          }
          const tmp = steps[Number(index1)];
          steps[Number(index1)] = steps[Number(index2)];
          steps[Number(index2)] = tmp;
          this.dispatchStepsChangedEvent();
          if (index1 === this.state.activeStep || index2 === this.state.activeStep) {
              if (index1 === this.state.activeStep) {
                  this.select(index2);
              }
              else {
                  this.select(index1);
              }
          }
      }
      move(index1, index2) {
          const index = !isNil(index2) ? index1 : this.state.activeStep;
          const tmp = steps[index];
          steps.splice(index, 1);
          steps.splice(!isNil(index2) ? index2 : index1, 0, tmp);
          this.dispatchStepsChangedEvent();
      }
      copy(index1, index2) {
          const index = !isNil(index1) ? index1 : this.state.activeStep;
          this.insertStep(clone$1(steps[index]), !isNil(index2) ? index2 : index1 + 1);
      }
      stop() {
          this.unhighlight();
          this.state.lastUpdatedStep = null;
          this.select(null);
          MouseCursor.destroy();
          if (this.state.running) {
              this.pause();
              this.dispatchStopEvent();
          }
      }
      pause() {
          this.state.running = false;
      }
      resume() {
          this.run();
      }
      destroy() {
          this.removeAllSteps();
          this.close();
      }
      close() {
          this.stop();
          this.state = Object.assign({}, this.initialState);
          window.removeEventListener('keydown', EventHandlers.handleKeydown);
          if (Options.getInstance().renderToolbar) {
              window.removeEventListener('beforeunload', EventHandlers.handleBeforeUnload);
              window.removeEventListener(Steps.eventTypes.STEP_MOVE, EventHandlers.handleStepMoved);
              window.removeEventListener(Steps.eventTypes.STEP_COPY, EventHandlers.handleStepCopied);
              window.removeEventListener(Steps.eventTypes.STEP_DOUBLECLICK, EventHandlers.handleStepDoubleclick);
              window.removeEventListener(Steps.eventTypes.STEP_CLICK, EventHandlers.handleStepClick);
              window.removeEventListener(Steps.eventTypes.STEP_CTRL_CLICK, EventHandlers.handleStepCtrlClick);
              window.removeEventListener(PlanStepForm.eventTypes.PLAN_STEP, EventHandlers.handlePlanStep);
              window.removeEventListener(MenuBar.eventTypes.RESTORING_APP_STATE_STEP_CLICK, EventHandlers.handleRestoringAppStateStepClick);
              window.removeEventListener(MenuBar.eventTypes.MODE_CLICK, EventHandlers.handleModeClick);
              window.removeEventListener(MenuBar.eventTypes.EDIT_CLICK, EventHandlers.handleEditClick);
              window.removeEventListener(MenuBar.eventTypes.VERBOSE_CLICK, EventHandlers.handleVerboseClick);
              window.removeEventListener(MenuBar.eventTypes.REFERSH_DEMO_CLICK, EventHandlers.handleRefreshDemoClick);
              window.removeEventListener(MenuBar.eventTypes.CLOSE_DEMO_CLICK, EventHandlers.handleCloseDemoClick);
              window.removeEventListener(Toolbar.eventTypes.ELEMENT_SET, EventHandlers.handleToolbarElementSet);
              window.removeEventListener(StepEditForm.eventTypes.CHANGE, EventHandlers.handleStepEditFormChange);
          }
          Options.setInstance({});
          Toolbar.destroy();
          CheckStepPrompt.destroy();
          StepForm.destroy();
          Console.destroy();
          Demo.instance = undefined;
      }
      highlight(stepIndex) {
          if (isNil(steps[stepIndex])) {
              return;
          }
          const { title, description, selector, xPath, area, shiftX, shiftY, shiftHeight, shiftWidth } = steps[stepIndex];
          let areaNew = undefined;
          if (isNil(area)) {
              let tmpElement;
              if (is(String, xPath)) {
                  tmpElement = getElementByXPath(xPath);
              }
              else if (is(String, selector)) {
                  tmpElement = document.querySelector(selector);
              }
              else {
                  tmpElement = selector;
              }
              if (!tmpElement) {
                  return;
              }
              const rect = tmpElement.getBoundingClientRect();
              areaNew = {
                  left: rect.left + (shiftX || 0) + window.scrollX,
                  top: rect.top + (shiftY || 0) + window.scrollY,
                  width: rect.width + (shiftWidth || 0),
                  height: rect.height + (shiftHeight || 0),
              };
          }
          const element = this.appendHighlightArea(area || areaNew, steps[stepIndex].areaStyle);
          if (!element) {
              return;
          }
          this.driver = this.Driver(Object.assign(Object.assign({}, this.defaultDriverOptions), { steps: [{
                      element,
                      popover: {
                          description: description || title,
                      },
                      onDeselected: () => {
                          this.unhighlight();
                      },
                  }] }));
          this.driver.drive();
      }
      unhighlight() {
          if (this.driver) {
              this.driver.destroy();
          }
          const highlightArea = document.querySelectorAll('#demo-tools-highlight-area');
          if (highlightArea) {
              highlightArea.forEach(el => el.remove());
          }
      }
      appendHighlightArea(area, customStyle) {
          const { left, top, width, height } = area;
          const style = `position: absolute; left: ${left}px; top: ${top}px; width: ${width}px; height: ${height}px;`;
          const div = document.createElement('div');
          div.setAttribute('style', style);
          if (customStyle) {
              Object.assign(div.style, customStyle);
          }
          div.setAttribute('id', 'demo-tools-highlight-area');
          document.body.appendChild(div);
          return div;
      }
      check(selector) {
          var _a, _b, _c;
          (_a = document.querySelectorAll('#demo-tools-highlight-area')) === null || _a === void 0 ? void 0 : _a.forEach(el => { el.remove(); });
          let element;
          if (is(String, selector)) {
              element = document.querySelector(selector);
          }
          else {
              element = this.appendHighlightArea(selector);
          }
          if (!element) {
              return;
          }
          this.driver = this.Driver(Object.assign(Object.assign({}, this.defaultDriverOptions), { onDestroyed: () => { var _a; return (_a = document.querySelectorAll('#demo-tools-highlight-area')) === null || _a === void 0 ? void 0 : _a.forEach(el => { el.remove(); }); } }));
          this.driver.highlight({
              element,
              popover: {
                  description: is(String, selector) ?
                      `Element: ${element.nodeName.toLowerCase()}${selector}<br />parent element: ${(_b = element.parentElement) === null || _b === void 0 ? void 0 : _b.nodeName.toLowerCase()}.${Array.from((_c = element.parentElement) === null || _c === void 0 ? void 0 : _c.classList).join('.')}` :
                      'Appended area',
              }
          });
      }
      printSteps() {
          console.table(steps.map((step) => ({ title: step.title, type: step.type })));
      }
      checkStep(index, event) {
          event === null || event === void 0 ? void 0 : event.stopPropagation();
          const step = steps[index];
          if (step.hasCorrectXPath) {
              this.updateStep(index, { xPathCheck: true });
              return;
          }
          if (step.hasCorrectCoordinates) {
              this.updateStep(index, { coordCheck: true });
              return;
          }
          this.pause();
          CheckStepPrompt.getPrompt(step)
              .then(result => {
              if (result) {
                  this.updateStep(index, { xPathCheck: true });
              }
          });
      }
      fixStepXPath(index, event, { interactive = true } = {}) {
          var _a, _b;
          event === null || event === void 0 ? void 0 : event.stopPropagation();
          const step = steps[index];
          const element = getElementByXPath(step.xPath);
          if (!element) {
              return;
          }
          const selector = `${step.element.localName}${((_a = step.element.classList) === null || _a === void 0 ? void 0 : _a.length) ? `.${values(step.element.classList).join('.')}` : ''}`;
          const elementNew = (element === null || element === void 0 ? void 0 : element.closest(selector)) ||
              ((_b = element.parentElement) === null || _b === void 0 ? void 0 : _b.querySelector(selector));
          if (!elementNew) {
              return;
          }
          const hierarchy = [elementNew];
          let current = elementNew.parentElement;
          while (current) {
              hierarchy.push(current);
              current = current.parentElement;
          }
          let xPath = '';
          hierarchy.reverse().forEach((el) => {
              let index = 0;
              if (el.parentElement) {
                  index = Array.from(el.parentElement.children).indexOf(el);
              }
              xPath += `/*[${index + 1}]`;
          });
          if (isEmpty(xPath)) {
              return;
          }
          if (!interactive) {
              const elementFix = getElementByXPath(xPath);
              this.updateStep(index, { xPath: xPath, element: pick(['classList', 'id', 'localName'], elementFix) });
              return;
          }
          const stepFix = { xPath };
          CheckStepPrompt.getPrompt(stepFix, 'Anticipated element')
              .then(result => {
              if (result) {
                  this.updateStep(index, result);
              }
          });
      }
      ignoreXPathError(index, event) {
          event.stopPropagation();
          this.updateStep(index, { xPathCheck: 'ignored' });
      }
      dispatchOptionsChangedEvent() {
          window.dispatchEvent(new CustomEvent('Demo:OptionsChanged'));
      }
      dispatchStepsChangedEvent() {
          window.dispatchEvent(new CustomEvent('Demo:StepsChanged', { detail: { steps: steps } }));
      }
      dispatchStepChangedEvent(index) {
          window.dispatchEvent(new CustomEvent('Demo:StepChanged', { detail: { step: steps[index], index } }));
      }
      dispatchActiveStepChangedEvent() {
          window.dispatchEvent(new CustomEvent('Demo:ActiveStepChanged', { detail: { activeStep: this.state.activeStep, scrollntoView: this.state.running } }));
      }
      dispatchRunEvent() {
          window.dispatchEvent(new CustomEvent('Demo:DemoRun'));
      }
      dispatchStopEvent() {
          window.dispatchEvent(new CustomEvent('Demo:DemoStop'));
      }
      dispatchElementBoundStepCheckFailEvent(index) {
          window.dispatchEvent(new CustomEvent('Demo:ElementBoundStepCheckFail', { detail: { step: steps[index], index } }));
      }
      dispatchCompleteEvent() {
          window.dispatchEvent(new CustomEvent('Demo:DemoComplete'));
      }
  }
  Demo.defaultInterval = 2000;
  class EventHandlers {
      static handleKeydown(e) {
          if (e.ctrlKey && e.altKey) {
              switch (e.key) {
                  case 'p': {
                      if (DemoTools.demo.state.running) {
                          DemoTools.demo.pause();
                          return;
                      }
                      DemoTools.demo.pickStep();
                      break;
                  }
                  case 'r': {
                      DemoTools.demo.run();
                      break;
                  }
                  case 's': {
                      DemoTools.demo.stop();
                      break;
                  }
                  case 'm': {
                      DemoTools.refresh({ mode: (Options.getInstance().mode === 'compose' ? 'present' : 'compose') });
                      break;
                  }
                  case 'e': {
                      DemoTools.demo.edit();
                      DemoTools.demo.setOptions({ verbose: true });
                      break;
                  }
                  case 'v': {
                      DemoTools.demo.verbose();
                      break;
                  }
                  case 'ArrowRight': {
                      if (DemoTools.demo.state.activeStep !== null && DemoTools.demo.state.activeStep < steps.length - 1) {
                          if (steps[DemoTools.demo.state.activeStep].type === 'highlight') {
                              DemoTools.demo.unhighlight();
                          }
                          if (e.shiftKey) {
                              DemoTools.demo.select(DemoTools.demo.state.activeStep + 1);
                          }
                          else {
                              DemoTools.demo.jump(DemoTools.demo.state.activeStep + 1);
                          }
                      }
                      break;
                  }
                  case 'ArrowLeft': {
                      if (DemoTools.demo.state.activeStep !== null && DemoTools.demo.state.activeStep > 0) {
                          if (steps[DemoTools.demo.state.activeStep].type === 'highlight') {
                              DemoTools.demo.unhighlight();
                          }
                          if (e.shiftKey) {
                              DemoTools.demo.select(DemoTools.demo.state.activeStep - 1);
                          }
                          else {
                              DemoTools.demo.jump(DemoTools.demo.state.activeStep - 1);
                          }
                      }
                      break;
                  }
                  case 'ArrowUp': {
                      DemoTools.demo.swap(DemoTools.demo.state.activeStep, DemoTools.demo.state.activeStep - 1);
                      break;
                  }
                  case 'ArrowDown': {
                      DemoTools.demo.swap(DemoTools.demo.state.activeStep, DemoTools.demo.state.activeStep + 1);
                      break;
                  }
                  case 'u': {
                      if (steps[DemoTools.demo.state.activeStep].isElementBound) {
                          DemoTools.demo.updateStep();
                      }
                      break;
                  }
                  case 'd': {
                      DemoTools.demo.removeStep(DemoTools.demo.state.activeStep);
                      break;
                  }
                  case 'c': {
                      DemoTools.demo.checkStep(DemoTools.demo.state.activeStep);
                      break;
                  }
                  case 'h': {
                      DemoTools.help();
                      break;
                  }
              }
          }
      }
      static handleToolbarElementSet() {
          if (Options.getInstance().steps) {
              DemoTools.demo.setSteps(values(Options.getInstance().steps));
          }
          if (Options.getInstance().renderConsole) {
              Console.init();
          }
      }
      static handleStepMoved(e) {
          DemoTools.demo.move(e.detail.from, e.detail.to);
      }
      static handleStepCopied(e) {
          DemoTools.demo.copy(e.detail.from, e.detail.to);
      }
      static handleStepDoubleclick(e) {
          DemoTools.demo.jump(e.detail.index);
      }
      static handleStepClick(e) {
          DemoTools.demo.pause();
          if (e.detail.index === DemoTools.demo.state.activeStep) {
              DemoTools.demo.select(null);
          }
          else {
              DemoTools.demo.select(e.detail.index);
          }
      }
      static handleStepCtrlClick(e) {
          DemoTools.demo.updateStep(e.detail.index);
      }
      static handlePlanStep(e) {
          DemoTools.demo.addStep(e.detail);
      }
      static handleRestoringAppStateStepClick() {
          DemoTools.demo.addRestoringAppStateStep();
      }
      static handleModeClick() {
          DemoTools.refresh({ mode: (Options.getInstance().mode === 'compose' ? 'present' : 'compose') });
      }
      static handleVerboseClick() {
          DemoTools.demo.verbose();
      }
      static handleEditClick() {
          DemoTools.demo.edit();
          DemoTools.demo.setOptions({ verbose: true });
      }
      static handleRefreshDemoClick() {
          DemoTools.refresh();
      }
      static handleCloseDemoClick() {
          DemoTools.close();
      }
      static handleStepEditFormChange(e) {
          DemoTools.demo.updateStep(e.detail.index, { [e.detail.field]: e.detail.value });
      }
      static handleBeforeUnload() {
          var _a;
          if ((_a = window.store) === null || _a === void 0 ? void 0 : _a.isFeIsolated()) {
              window.store.deisolateFe();
          }
      }
  }
  class Options {
      constructor() {
          this.renderToolbar = true;
          this.renderStepsStyle = {};
          this.interval = 2000;
          this.steps = [];
          this.skipChecks = false;
          this.renderConsole = false;
          this.customData = undefined;
          this.verbose = false;
          this.editable = false;
          this.instructions = undefined;
          this.consoleOptions = {};
          this.mode = 'compose';
          this.toolbarOptions = {};
          this.renderMouseCursor = true;
      }
      static getInstance(options = {}) {
          if (!Options.instance) {
              Options.setInstance(options);
          }
          return Options.instance;
      }
      static setInstance(options) {
          Options.instance.mode = options.mode ? options.mode : 'compose';
          Options.instance.title = options.title;
          Options.instance.renderToolbar = options.renderToolbar === false ? false : true;
          Options.instance.renderStepsStyle = options.renderStepsStyle;
          Options.instance.interval = options.interval;
          Options.instance.steps = options.steps || [];
          Options.instance.skipChecks = options.skipChecks !== false;
          Options.instance.renderConsole = options.renderConsole === true;
          Options.instance.customData = options.customData;
          Options.instance.verbose = Options.instance.mode === 'present' ? false : options.verbose === true && options.editable !== true;
          Options.instance.editable = options.editable === true;
          Options.instance.instructions = options.instructions ? String(options.instructions) : undefined;
          Options.instance.consoleOptions = Object.assign(Object.assign(Object.assign({}, defaultConsoleOptions), (Options.instance.consoleOptions || {})), (options.consoleOptions || {}));
          Options.instance.toolbarOptions = Object.assign(Object.assign({}, (Options.instance.toolbarOptions || {})), (options.toolbarOptions || {}));
          Options.instance.toolbarOptions.showInfo = Options.instance.mode === 'present';
          Options.instance.renderMouseCursor = options.renderMouseCursor === false ? false : true;
      }
  }
  Options.instance = {};
  const options = Options.getInstance();

  var api = {
  	demoTools: {
  		init: {
  			type: "function",
  			"static": true,
  			async: true,
  			parameters: [
  				{
  					name: "options",
  					type: "IOptions",
  					optional: true
  				}
  			],
  			returnType: "Promise<void>",
  			description: "Initializes DemoTools once. Ensures persisted demos storage exists, optionally fetches git summary to derive a default title, creates/obtains a Demo singleton populated with steps (from options or persisted demos), registers 'Demo:StepsChanged' listener and marks DemoTools as initialized."
  		},
  		getDemos: {
  			type: "function",
  			"static": true,
  			async: false,
  			parameters: [
  			],
  			returnType: "{ [title: string]: IStep[] }",
  			description: "Returns the persisted map of demos (title -> steps). Returns an empty object when nothing is stored."
  		},
  		getDemo: {
  			type: "function",
  			"static": true,
  			async: false,
  			parameters: [
  				{
  					name: "title",
  					type: "string",
  					optional: true
  				}
  			],
  			returnType: "IStep[]",
  			description: "Returns steps array for the given demo title, or for the current options.title when title is omitted. Uses persisted demos as the source."
  		},
  		removeDemo: {
  			type: "function",
  			"static": true,
  			async: false,
  			parameters: [
  				{
  					name: "title",
  					type: "string",
  					optional: true
  				}
  			],
  			returnType: "void",
  			description: "Deletes the persisted demo with the provided title (or current options.title if omitted) and persists the updated demos map."
  		},
  		removeDemos: {
  			type: "function",
  			"static": true,
  			async: false,
  			parameters: [
  			],
  			returnType: "void",
  			description: "Clears all persisted demos by setting the demos storage to an empty object."
  		},
  		listDemos: {
  			type: "function",
  			"static": true,
  			async: false,
  			parameters: [
  			],
  			returnType: "void",
  			description: "Logs a table to console showing persisted demos with title and number of steps for each."
  		},
  		setDemo: {
  			type: "function",
  			"static": true,
  			async: false,
  			parameters: [
  				{
  					name: "title",
  					type: "string"
  				},
  				{
  					name: "steps",
  					type: "IStep[]"
  				}
  			],
  			returnType: "void",
  			description: "Stores or updates the demo under the given title with the provided steps and persists the demos map."
  		},
  		close: {
  			type: "function",
  			"static": true,
  			async: false,
  			parameters: [
  			],
  			returnType: "void",
  			description: "Closes DemoTools: closes and clears the Demo singleton if present, removes the 'Demo:StepsChanged' event listener, and marks DemoTools as uninitialized."
  		},
  		demo: {
  			type: "class",
  			getSteps: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  				],
  				returnType: "Step[]",
  				description: "Getter that returns a shallow copy of internal steps array."
  			},
  			addStep: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  					{
  						name: "step",
  						type: "IStep",
  						optional: true
  					}
  				],
  				returnType: "void",
  				description: "Appends a new step to the end of the steps list (delegates to insertStep)."
  			},
  			addHighlightStep: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  					{
  						name: "step",
  						type: "Omit<IHighlightingStep, 'type'>",
  						optional: true
  					}
  				],
  				returnType: "void",
  				description: "Adds a highlight-type step with default title if missing."
  			},
  			pickStep: {
  				type: "function",
  				"static": false,
  				async: true,
  				parameters: [
  				],
  				returnType: "Promise<void>",
  				description: "Captures the currently hovered element(s), builds an XPath, prompts the user for step details via StepForm, and either updates the active step or adds a new step."
  			},
  			setSteps: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  					{
  						name: "steps",
  						type: "IStep[] | { [key: number]: IStep }"
  					}
  				],
  				returnType: "void",
  				description: "Replaces current steps with provided collection (stops any running demo first), inserts each provided step, and selects the first step."
  			},
  			insertStep: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  					{
  						name: "step",
  						type: "IStep",
  						optional: true
  					},
  					{
  						name: "index",
  						type: "number",
  						optional: true
  					}
  				],
  				returnType: "void",
  				description: "Creates an adjusted Step instance and inserts it at the specified index (or activeStep+1 or end). Updates lastUpdatedStep and dispatches steps-changed event."
  			},
  			updateStep: {
  				type: "function",
  				"static": false,
  				async: true,
  				parameters: [
  					{
  						name: "title",
  						type: "string | number",
  						optional: true
  					},
  					{
  						name: "step",
  						type: "Partial<IStep>",
  						optional: true
  					}
  				],
  				returnType: "Promise<void>",
  				description: "Updates a step by index or title. If not provided, prompts user for updated data. Pauses run if running. Ensures xPathCheck is reset when xPath changes, replaces the step and dispatches steps-changed event."
  			},
  			removeStep: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  					{
  						name: "title",
  						type: "string | number"
  					}
  				],
  				returnType: "void",
  				description: "Removes step by index or by title substring match. If the removed step was active, clears selection. Dispatches steps-changed event."
  			},
  			removeAllSteps: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  				],
  				returnType: "void",
  				description: "Clears all steps and dispatches steps-changed event."
  			},
  			doStep: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  					{
  						name: "title",
  						type: "string | number"
  					}
  				],
  				returnType: "void",
  				description: "Executes a single step by index or title. Selects the step and performs actions depending on step.type (highlight, click, rightclick, hover, setValue, keyboard, or custom function)."
  			},
  			run: {
  				type: "function",
  				"static": false,
  				async: true,
  				parameters: [
  					{
  						name: "options",
  						type: "IRunOptions",
  						optional: true
  					}
  				],
  				returnType: "Promise<void>",
  				description: "Runs steps sequentially from options.from (or activeStep or 0) to options.till (or last). Dispatches run event, honors per-step interval or global interval, unhighlights after highlight steps, and stops when finished or paused."
  			},
  			jump: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  					{
  						name: "index",
  						type: "number"
  					}
  				],
  				returnType: "void",
  				description: "Validates index and executes the step at that index (delegates to doStep)."
  			},
  			select: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  					{
  						name: "index",
  						type: "number | null"
  					}
  				],
  				returnType: "void",
  				description: "Sets activeStep in state and dispatches active-step-changed event."
  			},
  			swap: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  					{
  						name: "index1",
  						type: "number"
  					},
  					{
  						name: "index2",
  						type: "number"
  					}
  				],
  				returnType: "void",
  				description: "Swaps two steps by index (with validation), dispatches steps-changed event, and updates active selection if needed."
  			},
  			move: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  					{
  						name: "index1",
  						type: "number"
  					},
  					{
  						name: "index2",
  						type: "number",
  						optional: true
  					}
  				],
  				returnType: "void",
  				description: "Moves a step from index to index2 (or moves activeStep if index2 omitted). Updates steps array and dispatches steps-changed event."
  			},
  			copy: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  					{
  						name: "index1",
  						type: "number",
  						optional: true
  					},
  					{
  						name: "index2",
  						type: "number",
  						optional: true
  					}
  				],
  				returnType: "void",
  				description: "Copies a step (from index1 or activeStep) and inserts the copy at index2 or adjacent position."
  			},
  			stop: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  				],
  				returnType: "void",
  				description: "Stops the demo run (pauses), clears lastUpdatedStep, removes highlight areas, clears selection and dispatches stop event."
  			},
  			pause: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  				],
  				returnType: "void",
  				description: "Sets running state to false to pause execution."
  			},
  			resume: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  				],
  				returnType: "void",
  				description: "Resumes execution by calling run() with no options."
  			},
  			destroy: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  				],
  				returnType: "void",
  				description: "Removes all steps and fully closes/destroys the demo instance (delegates to close)."
  			},
  			close: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  				],
  				returnType: "void",
  				description: "Stops demo, resets internal state, removes event listeners, destroys UI helpers (Toolbar, prompts, forms), clears Options instance and clears singleton instance."
  			},
  			highlight: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  					{
  						name: "stepIndex",
  						type: "number"
  					}
  				],
  				returnType: "void",
  				description: "Highlights area for the specified highlighting step: determines area (from step.area or computes from selector/xPath), appends highlight area element, initializes driver.js with that element and drives the tour."
  			},
  			unhighlight: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  				],
  				returnType: "void",
  				description: "Destroys any active driver instance and removes any appended highlight area DOM nodes."
  			},
  			check: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  					{
  						name: "selector",
  						type: "string | IArea"
  					}
  				],
  				returnType: "void",
  				description: "Used to quickly inspect an element or area: removes any existing highlight area, resolves element (from selector or appended area), then uses driver.js highlight to show a popover with a description. Ensures cleanup on driver destroy."
  			},
  			printSteps: {
  				type: "function",
  				"static": false,
  				async: false,
  				parameters: [
  				],
  				returnType: "void",
  				description: "Logs a console.table showing each step's title and type."
  			}
  		}
  	}
  };
  var hotKeys = [
  	{
  		hotKey: "Ctrl+Alt+P",
  		description: "Pause the running demo or start picking the currently hovered element as a new step."
  	},
  	{
  		hotKey: "Ctrl+Alt+R",
  		description: "Start/resume running the demo steps."
  	},
  	{
  		hotKey: "Ctrl+Alt+S",
  		description: "Stop the demo run and clear selection/highlights."
  	},
  	{
  		hotKey: "Ctrl+Alt+ArrowRight",
  		description: "Advance to the next step: with Shift -> select the next step; without Shift -> execute (jump to) the next step."
  	},
  	{
  		hotKey: "Ctrl+Alt+ArrowLeft",
  		description: "Move to the previous step: with Shift -> select the previous step; without Shift -> execute (jump to) the previous step."
  	},
  	{
  		hotKey: "Ctrl+Alt+ArrowUp",
  		description: "Swap the active step with the previous step (move it up)."
  	},
  	{
  		hotKey: "Ctrl+Alt+ArrowDown",
  		description: "Swap the active step with the next step (move it down)."
  	},
  	{
  		hotKey: "Ctrl+Alt+U",
  		description: "Open update flow for the active step (only if the step is element-bound)."
  	},
  	{
  		hotKey: "Ctrl+Alt+D",
  		description: "Remove the active step."
  	},
  	{
  		hotKey: "Ctrl+Alt+C",
  		description: "Open check prompt for the active step to validate or fix its target element."
  	}
  ];
  var json = {
  	api: api,
  	hotKeys: hotKeys
  };

  class Help {
      static show(inConsole = false) {
          if (inConsole) {
              Help.print();
              return;
          }
          Help.driver.highlight({
              element: document.body,
              popover: {
                  showButtons: ['next'],
                  nextBtnText: 'Close',
                  description: Help.getHtml(),
                  popoverClass: 'demo-tools demo-tools-help-popover',
                  side: 'left',
                  onCloseClick: () => Help.driver.destroy(),
                  onNextClick: () => Help.driver.destroy(),
              }
          });
      }
      static print() {
          console.table(json);
      }
      static getHtml() {
          return `
      <div class="demo-tools-help">
        <div class="demo-tools-help-column">
          <div class="demo-tools-help-title"><h3>demoTools</h3></div>
          ${Help.getMethodsTable(json.api.demoTools)}
        </div>
        <div class="demo-tools-help-column">
          <div class="demo-tools-help-title"><h3>demoTools.demo</h3></div>
          ${Help.getMethodsTable(json.api.demoTools.demo)}
        </div>
        <div class="demo-tools-help-column">
          <div class="demo-tools-help-title"><h3>Hot keys</h3></div>
          <table class="demo-tools-help-description">
            <thead>
              <tr>
                <th>Hot key</th>
                <th>Action</th>
              </tr>
            </thead>
            ${json.hotKeys
            .map(e => `<tr><td>${e.hotKey}</td><td>${e.description}</td></tr>`)
            .join('')}
          </table>
        </div>
      </div>
    `;
      }
      static getMethodsTable(json) {
          const html = `
      <table class="demo-tools-help-description">
        <thead>
          <tr>
            <th>Method</th>
            <th>Parameters</th>
            <th>Return Type</th>
            <th>Description</th>
          </tr>
        </thead>
    `;
          const rows = values(mapObjIndexed((e, key) => (Object.assign(Object.assign({}, e), { method: key })), json))
              .filter(e => { var _a; return ((_a = e.type) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'function'; })
              .map(e => `
          <tr>
            <td>${e.method}</td>
            <td>${e.parameters.map(p => `${p.name}: ${p.type}`).join('<br/>')}</td>
            <td>${e.returnType}</td>
            <td>${e.description}</td>
          </tr>
      `)
              .join('');
          return html + rows + '</table>';
      }
  }
  Help.driver = Ae({
      overlayOpacity: 0.3,
  });

  const DEMOS_KEY = 'demos';
  const DEMO_TOOLS_KEY = 'demoToolsOptions';
  let demos = null;
  class DemoTools {
      static init() {
          return __awaiter(this, void 0, void 0, function* () {
              if (DemoTools.initialized) {
                  return;
              }
              try {
                  DemoTools.gitSummary = yield fetchGitSummary();
              }
              catch (e) {
              }
              demos = DemoTools.getDemos();
              DemoTools.initialized = true;
          });
      }
      static open(arg = {}) {
          var _a;
          return __awaiter(this, void 0, void 0, function* () {
              if (!DemoTools.initialized) {
                  yield DemoTools.init();
              }
              if (DemoTools.demo) {
                  DemoTools.close();
              }
              if (isNil(getVar(DEMO_TOOLS_KEY))) {
                  setVar(DEMO_TOOLS_KEY, {});
              }
              if (isNil(getVar(DEMOS_KEY))) {
                  setVar(DEMOS_KEY, []);
              }
              const options = is(String, arg) ? { title: arg } : arg;
              const title = options.title || ((_a = DemoTools.gitSummary) === null || _a === void 0 ? void 0 : _a.branch) || 'default';
              const existingOptions = demos.find(demo => propEq(title, 'title')(demo)) || {};
              window.addEventListener('Demo:OptionsChanged', DemoTools.handleOptionsChanged);
              window.addEventListener('Demo:StepsChanged', DemoTools.handleStepsChanged);
              window.addEventListener('Demo:StepChanged', DemoTools.handleStepChanged);
              window.addEventListener(Steps.eventTypes.STEP_LIST_RENDERED, DemoTools.handleStepListRendered);
              window.addEventListener(MenuBar.eventTypes.EXPORT_DEMO_TO_CONSOLE_CLICK, DemoTools.handleExportDemoToConsoleClick);
              DemoTools.demo = Demo.getInstance(Object.assign(Object.assign(Object.assign({}, existingOptions), options), { title, skipChecks: is(Boolean, options.skipChecks) ? options.skipChecks : Boolean(existingOptions.skipChecks) }));
              window.d = DemoTools.demo;
              const demoToolsOptions = getVar(DEMO_TOOLS_KEY) || {};
              setVar(DEMO_TOOLS_KEY, Object.assign(Object.assign({}, demoToolsOptions), { store: is(Boolean, options.store) ? options.store : true }));
              if (options.preloadDemo) {
                  setVar(DEMO_TOOLS_KEY, Object.assign(Object.assign({}, demoToolsOptions), { preloadDemo: options.preloadDemo }));
                  if (typeof options.autostart !== 'undefined') {
                      const demoToolsOptions = getVar(DEMO_TOOLS_KEY) || {};
                      setVar(DEMO_TOOLS_KEY, Object.assign(Object.assign({}, demoToolsOptions), { autostart: options.autostart }));
                  }
              }
          });
      }
      static getDemos() {
          if (demos) {
              return demos;
          }
          return getVar(DEMOS_KEY) || [];
      }
      static getDemo(title) {
          const demos = DemoTools.getDemos();
          return find$1(propEq(title || DemoTools.demo.options.title, 'title'), values(demos || []));
      }
      static removeDemo(title) {
          const demos = DemoTools.getDemos();
          if (is(String, title)) {
              setVar(DEMOS_KEY, filter((demo) => !propEq(title, 'title', demo), demos));
          }
          else {
              demos.splice(title, 1);
              setVar(DEMOS_KEY, demos);
          }
      }
      static removeDemos() {
          setVar(DEMOS_KEY, []);
      }
      static listDemos() {
          console.table(values(map((demo) => ({ title: demo.title, stepsNumber: (values(demo.steps) || []).length }), DemoTools.getDemos())));
      }
      static setDemo(options) {
          const index = findIndex$1(propEq(options.title, 'title'), demos);
          if (index === -1) {
              demos.push(options);
          }
          else {
              demos[index] = options;
          }
          setVar(DEMOS_KEY, demos);
          const demoToolsOptions = getVar(DEMO_TOOLS_KEY) || {};
          if (demoToolsOptions.store) {
              DemoStorage.setDemo(options);
          }
      }
      static cloneDemo(title1, title2) {
          var _a;
          return __awaiter(this, void 0, void 0, function* () {
              const demo = DemoTools.getDemo(title1);
              if (!demo) {
                  return;
              }
              if (!!title2) {
                  DemoTools.setDemo(Object.assign(Object.assign({}, demo), { title: title2 }));
              }
              else {
                  if (!DemoTools.gitSummary) {
                      try {
                          DemoTools.gitSummary = yield fetchGitSummary();
                      }
                      catch (e) { }
                  }
                  const title = ((_a = DemoTools.gitSummary) === null || _a === void 0 ? void 0 : _a.branch) || 'default';
                  DemoTools.setDemo(Object.assign(Object.assign({}, demo), { title }));
              }
          });
      }
      static importDemo(title) {
          return __awaiter(this, void 0, void 0, function* () {
              const demo = yield DemoStorage.getDemo(title);
              if (!is(Object, demo)) {
                  return;
              }
              const newOptions = Object.assign(Object.assign({}, demo), { title: options.title || demo.title });
              DemoTools.setDemo(newOptions);
              if (DemoTools.demo) {
                  DemoTools.refresh(newOptions);
              }
          });
      }
      static exportDemoToConsole(title) {
          const demo = DemoTools.getDemo(title);
          if (!demo) {
              return;
          }
          console.log(stringifyVar(demo));
      }
      static handleOptionsChanged() {
          const demoToolsOptions = getVar(DEMO_TOOLS_KEY) || {};
          if (options.mode === 'compose') {
              DemoTools.setDemoToolsOptions({ preloadDemo: options.title });
          }
          else if (!demoToolsOptions.autostart) {
              DemoTools.setDemoToolsOptions({ preloadDemo: undefined });
          }
          DemoTools.setDemo(Object.assign(Object.assign({}, options), { steps: DemoTools.demo.steps }));
      }
      static handleStepsChanged({ detail: { steps } }) {
          DemoTools.setDemo(Object.assign(Object.assign({}, options), { steps }));
      }
      static handleStepChanged() {
          DemoTools.setDemo(Object.assign(Object.assign({}, options), { steps: DemoTools.demo.steps }));
      }
      static handleStepListRendered() {
          setTimeout(() => {
              const demoToolsOptions = getVar(DEMO_TOOLS_KEY) || {};
              if (demoToolsOptions.autostart === true) {
                  if (demoToolsOptions.preloadActiveStep) {
                      DemoTools.demo.select(Number(demoToolsOptions.preloadActiveStep) || 0);
                  }
                  DemoTools.demo.run();
              }
              window.removeEventListener(Steps.eventTypes.STEP_LIST_RENDERED, DemoTools.handleStepListRendered);
          });
      }
      static handleExportDemoToConsoleClick() {
          DemoTools.exportDemoToConsole(DemoTools.demo.title);
      }
      static refresh(optionsChanges = {}) {
          var _a;
          if (!DemoTools.initialized || !DemoTools.demo) {
              return;
          }
          const existingOptions = clone$1(options);
          DemoTools.close(true);
          DemoTools.open(Object.assign(Object.assign(Object.assign({}, existingOptions), { steps: ((_a = DemoTools.getDemo(existingOptions.title)) === null || _a === void 0 ? void 0 : _a.steps) || [] }), optionsChanges));
      }
      static setDemoToolsOptions(options) {
          const demoToolsOptions = getVar(DEMO_TOOLS_KEY) || {};
          setVar(DEMO_TOOLS_KEY, Object.assign(Object.assign({}, demoToolsOptions), options));
      }
      static close(refresh = false) {
          if (DemoTools.demo) {
              DemoTools.setDemoToolsOptions({ preloadDemo: undefined });
              DemoTools.demo.close();
              DemoTools.demo = null;
              window.d = undefined;
          }
          if (refresh) {
              return;
          }
          demos = null;
          window.removeEventListener('Demo:OptionsChanged', DemoTools.handleOptionsChanged);
          window.removeEventListener('Demo:StepsChanged', DemoTools.handleStepsChanged);
          window.removeEventListener('Demo:StepChanged', DemoTools.handleStepChanged);
          window.removeEventListener(MenuBar.eventTypes.EXPORT_DEMO_TO_CONSOLE_CLICK, DemoTools.handleExportDemoToConsoleClick);
          DemoTools.initialized = false;
      }
      static help(inConsole = false) {
          Help.show(inConsole);
      }
  }
  DemoTools.initialized = false;
  DemoTools.gitSummary = undefined;
  DemoTools.storage = DemoStorage;
  const demoToolsOptions = getVar(DEMO_TOOLS_KEY) || {};
  if (demoToolsOptions.preloadDemo) {
      DemoTools.open({ title: demoToolsOptions.preloadDemo });
  }

  const setFieldValue = (index, value) => {
      if (!window.form) {
          throw new Error('window.form not found');
      }
      const form = window.form;
      const values = form.getFieldsValue();
      const flattenedValues = flattenObj(values);
      const path = pipe(keys, (dotNotationPaths) => { var _a; return (_a = dotNotationPaths[index]) === null || _a === void 0 ? void 0 : _a.split('.'); })(flattenedValues);
      form.setFieldsValue(path === null || path === void 0 ? void 0 : path.reduceRight((acc, e) => ({ [e]: acc }), value));
  };

  class FIFX {
      static setUserRole(roles, store) {
          const permissions = reduce((acc, role) => { acc[role] = FIFX.role; return acc; }, {}, roles);
          if (store) {
              store.setField('permissions', permissions);
              return;
          }
          window.store.setField('permissions', permissions);
      }
      static setGlobalSetting(key, value) {
          window.store.setField('globalSettings', Object.assign(Object.assign({}, window.store.getState().globalSettings), { userSettings: Object.assign(Object.assign({}, window.store.getState().globalSettings.userSettings), { [key]: value }), defaultSettings: Object.assign(Object.assign({}, window.store.getState().globalSettings.defaultSettings), { allKeys: [
                      ...window.store.getState().globalSettings.defaultSettings.allKeys,
                      key
                  ], byKey: Object.assign(Object.assign({}, window.store.getState().globalSettings.defaultSettings.byKey), { [key]: { key: key, name: key, parent: 'COMMON_SETTINGS', disabled: false } }), defaultKeys: Object.assign(Object.assign({}, window.store.getState().globalSettings.defaultSettings.defaultKeys), { [key]: { key: key, name: key, parent: 'COMMON_SETTINGS', disabled: false } }) }) }));
      }
  }
  FIFX.role = {
      action: 'connection-allowed',
      application: 'fifx',
      component: '',
      region: '*',
      resource: '*',
  };

  var extensions = {
      expose: { fifx: FIFX, setFieldValue }
  };

  var sh = (command) => __awaiter(void 0, void 0, void 0, function* () {
      return DevServer.get(`sh/${encodeURIComponent(command)}`)
          .then(result => result);
  });

  var object = () => {
      Object.defineProperty(Object.prototype, 'vals', {
          value: function () { return Object.values(this); },
          enumerable: false,
      });
  };

  var number = () => {
      Number.prototype.slice = function (num1, num2) { return this.toString().slice(num1, num2); };
  };

  var overrides = () => {
      object();
      number();
  };

  class Telemetry {
      static startSpan(filePath, functionName, line, column) {
          Telemetry.spans.filter(s => s.name === `${filePath}:${functionName}:${line}:${column}`);
          Telemetry.spans.push({
              name: `${filePath}:${functionName}:${line}:${column}`,
              startTime: Date.now(),
          });
      }
      static endSpan(filePath, functionName, line, column) {
          const spans = Telemetry.spans.filter(s => s.name === `${filePath}:${functionName}:${line}:${column}`);
          if (spans) {
              spans[spans.length - 1].endTime = Date.now();
          }
      }
  }
  Telemetry.spans = [];

  var index = () => console.log('dev tools');
  Error.stackTradeLimit = Infinity;
  overrides();
  if (window) {
      window.devTools = {};
      window.devTools.extensions = {};
      window.r = ramda;
      window.setVar = setVar;
      window.deleteVar = deleteVar;
      window.clearVars = clearVars;
      window.stub = stub;
      window.logger = Logger;
      window.csvParser = new JSON2CSVParser({ delimiter: '\t' });
      window.setOnLoad = setOnLoad;
      window.__ = _$1;
      window.demoTools = DemoTools;
      window.getVars = getVars;
      window.sh = sh;
      window.telemetry = Telemetry;
      const persistent_vars = getVars();
      for (let variable of persistent_vars) {
          window[variable.name] = variable.value;
      }
      if (window === null || window === void 0 ? void 0 : window.onLoad) {
          try {
              eval(window === null || window === void 0 ? void 0 : window.onLoad)();
          }
          catch (e) { }
      }
      if (extensions === null || extensions === void 0 ? void 0 : extensions.expose) {
          for (let exposeKey in extensions.expose) {
              window[exposeKey] = extensions.expose[exposeKey];
          }
      }
  }

  return index;

})();
//# sourceMappingURL=dev-tools.js.map
