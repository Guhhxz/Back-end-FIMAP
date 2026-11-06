var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf, __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from == "object" || typeof from == "function")
    for (let key of __getOwnPropNames(from))
      !__hasOwnProp.call(to, key) && key !== except && __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: !0 }) : target,
  mod
));

// ../../node_modules/.pnpm/heap-js@2.5.0/node_modules/heap-js/dist/heap-js.umd.js
var require_heap_js_umd = __commonJS({
  "../../node_modules/.pnpm/heap-js@2.5.0/node_modules/heap-js/dist/heap-js.umd.js"(exports, module) {
    (function(global, factory) {
      typeof exports == "object" && typeof module < "u" ? factory(exports) : typeof define == "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis < "u" ? globalThis : global || self, factory(global.heap = {}));
    })(exports, (function(exports2) {
      "use strict";
      var __awaiter = function(thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
          });
        }
        return new (P || (P = Promise))(function(resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }
          function rejected(value) {
            try {
              step(generator.throw(value));
            } catch (e) {
              reject(e);
            }
          }
          function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      }, __generator$1 = function(thisArg, body) {
        var _ = { label: 0, sent: function() {
          if (t[0] & 1) throw t[1];
          return t[1];
        }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), throw: verb(1), return: verb(2) }, typeof Symbol == "function" && (g[Symbol.iterator] = function() {
          return this;
        }), g;
        function verb(n2) {
          return function(v) {
            return step([n2, v]);
          };
        }
        function step(op) {
          if (f) throw new TypeError("Generator is already executing.");
          for (; g && (g = 0, op[0] && (_ = 0)), _; ) try {
            if (f = 1, y && (t = op[0] & 2 ? y.return : op[0] ? y.throw || ((t = y.return) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            switch (y = 0, t && (op = [op[0] & 2, t.value]), op[0]) {
              case 0:
              case 1:
                t = op;
                break;
              case 4:
                return _.label++, { value: op[1], done: !1 };
              case 5:
                _.label++, y = op[1], op = [0];
                continue;
              case 7:
                op = _.ops.pop(), _.trys.pop();
                continue;
              default:
                if (t = _.trys, !(t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                  _ = 0;
                  continue;
                }
                if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                  _.label = op[1];
                  break;
                }
                if (op[0] === 6 && _.label < t[1]) {
                  _.label = t[1], t = op;
                  break;
                }
                if (t && _.label < t[2]) {
                  _.label = t[2], _.ops.push(op);
                  break;
                }
                t[2] && _.ops.pop(), _.trys.pop();
                continue;
            }
            op = body.call(thisArg, _);
          } catch (e) {
            op = [6, e], y = 0;
          } finally {
            f = t = 0;
          }
          if (op[0] & 5) throw op[1];
          return { value: op[0] ? op[1] : void 0, done: !0 };
        }
      }, __read$1 = function(o, n2) {
        var m = typeof Symbol == "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r2, ar = [], e;
        try {
          for (; (n2 === void 0 || n2-- > 0) && !(r2 = i.next()).done; ) ar.push(r2.value);
        } catch (error) {
          e = { error };
        } finally {
          try {
            r2 && !r2.done && (m = i.return) && m.call(i);
          } finally {
            if (e) throw e.error;
          }
        }
        return ar;
      }, __spreadArray$1 = function(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++)
          (ar || !(i in from)) && (ar || (ar = Array.prototype.slice.call(from, 0, i)), ar[i] = from[i]);
        return to.concat(ar || Array.prototype.slice.call(from));
      }, __values = function(o) {
        var s = typeof Symbol == "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length == "number") return {
          next: function() {
            return o && i >= o.length && (o = void 0), { value: o && o[i++], done: !o };
          }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
      }, HeapAsync = (
        /** @class */
        (function() {
          function HeapAsync2(compare) {
            compare === void 0 && (compare = HeapAsync2.minComparator);
            var _this = this;
            this.compare = compare, this.heapArray = [], this._limit = 0, this.offer = this.add, this.element = this.peek, this.poll = this.pop, this._invertedCompare = function(a, b) {
              return _this.compare(a, b).then(function(res) {
                return -1 * res;
              });
            };
          }
          return HeapAsync2.getChildrenIndexOf = function(idx) {
            return [idx * 2 + 1, idx * 2 + 2];
          }, HeapAsync2.getParentIndexOf = function(idx) {
            if (idx <= 0)
              return -1;
            var whichChildren = idx % 2 ? 1 : 2;
            return Math.floor((idx - whichChildren) / 2);
          }, HeapAsync2.getSiblingIndexOf = function(idx) {
            if (idx <= 0)
              return -1;
            var whichChildren = idx % 2 ? 1 : -1;
            return idx + whichChildren;
          }, HeapAsync2.minComparator = function(a, b) {
            return __awaiter(this, void 0, void 0, function() {
              return __generator$1(this, function(_a) {
                return a > b ? [2, 1] : a < b ? [2, -1] : [2, 0];
              });
            });
          }, HeapAsync2.maxComparator = function(a, b) {
            return __awaiter(this, void 0, void 0, function() {
              return __generator$1(this, function(_a) {
                return b > a ? [2, 1] : b < a ? [2, -1] : [2, 0];
              });
            });
          }, HeapAsync2.minComparatorNumber = function(a, b) {
            return __awaiter(this, void 0, void 0, function() {
              return __generator$1(this, function(_a) {
                return [2, a - b];
              });
            });
          }, HeapAsync2.maxComparatorNumber = function(a, b) {
            return __awaiter(this, void 0, void 0, function() {
              return __generator$1(this, function(_a) {
                return [2, b - a];
              });
            });
          }, HeapAsync2.defaultIsEqual = function(a, b) {
            return __awaiter(this, void 0, void 0, function() {
              return __generator$1(this, function(_a) {
                return [2, a === b];
              });
            });
          }, HeapAsync2.print = function(heap) {
            function deep(i2) {
              var pi = HeapAsync2.getParentIndexOf(i2);
              return Math.floor(Math.log2(pi + 1));
            }
            function repeat(str, times) {
              for (var out = ""; times > 0; --times)
                out += str;
              return out;
            }
            for (var node = 0, lines = [], maxLines = deep(heap.length - 1) + 2, maxLength = 0; node < heap.length; ) {
              var i = deep(node) + 1;
              node === 0 && (i = 0);
              var nodeText = String(heap.get(node));
              nodeText.length > maxLength && (maxLength = nodeText.length), lines[i] = lines[i] || [], lines[i].push(nodeText), node += 1;
            }
            return lines.map(function(line, i2) {
              var times = Math.pow(2, maxLines - i2) - 1;
              return repeat(" ", Math.floor(times / 2) * maxLength) + line.map(function(el) {
                var half = (maxLength - el.length) / 2;
                return repeat(" ", Math.ceil(half)) + el + repeat(" ", Math.floor(half));
              }).join(repeat(" ", times * maxLength));
            }).join(`
`);
          }, HeapAsync2.heapify = function(arr, compare) {
            return __awaiter(this, void 0, void 0, function() {
              var heap;
              return __generator$1(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    return heap = new HeapAsync2(compare), heap.heapArray = arr, [4, heap.init()];
                  case 1:
                    return _a.sent(), [2, heap];
                }
              });
            });
          }, HeapAsync2.heappop = function(heapArr, compare) {
            var heap = new HeapAsync2(compare);
            return heap.heapArray = heapArr, heap.pop();
          }, HeapAsync2.heappush = function(heapArr, item, compare) {
            return __awaiter(this, void 0, void 0, function() {
              var heap;
              return __generator$1(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    return heap = new HeapAsync2(compare), heap.heapArray = heapArr, [4, heap.push(item)];
                  case 1:
                    return _a.sent(), [
                      2
                      /*return*/
                    ];
                }
              });
            });
          }, HeapAsync2.heappushpop = function(heapArr, item, compare) {
            var heap = new HeapAsync2(compare);
            return heap.heapArray = heapArr, heap.pushpop(item);
          }, HeapAsync2.heapreplace = function(heapArr, item, compare) {
            var heap = new HeapAsync2(compare);
            return heap.heapArray = heapArr, heap.replace(item);
          }, HeapAsync2.heaptop = function(heapArr, n2, compare) {
            n2 === void 0 && (n2 = 1);
            var heap = new HeapAsync2(compare);
            return heap.heapArray = heapArr, heap.top(n2);
          }, HeapAsync2.heapbottom = function(heapArr, n2, compare) {
            n2 === void 0 && (n2 = 1);
            var heap = new HeapAsync2(compare);
            return heap.heapArray = heapArr, heap.bottom(n2);
          }, HeapAsync2.nlargest = function(n2, iterable, compare) {
            return __awaiter(this, void 0, void 0, function() {
              var heap;
              return __generator$1(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    return heap = new HeapAsync2(compare), heap.heapArray = __spreadArray$1([], __read$1(iterable), !1), [4, heap.init()];
                  case 1:
                    return _a.sent(), [2, heap.top(n2)];
                }
              });
            });
          }, HeapAsync2.nsmallest = function(n2, iterable, compare) {
            return __awaiter(this, void 0, void 0, function() {
              var heap;
              return __generator$1(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    return heap = new HeapAsync2(compare), heap.heapArray = __spreadArray$1([], __read$1(iterable), !1), [4, heap.init()];
                  case 1:
                    return _a.sent(), [2, heap.bottom(n2)];
                }
              });
            });
          }, HeapAsync2.prototype.add = function(element) {
            return __awaiter(this, void 0, void 0, function() {
              return __generator$1(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    return [4, this._sortNodeUp(this.heapArray.push(element) - 1)];
                  case 1:
                    return _a.sent(), this._applyLimit(), [2, !0];
                }
              });
            });
          }, HeapAsync2.prototype.addAll = function(elements) {
            return __awaiter(this, void 0, void 0, function() {
              var i, l, _a;
              return __generator$1(this, function(_b) {
                switch (_b.label) {
                  case 0:
                    i = this.length, (_a = this.heapArray).push.apply(_a, __spreadArray$1([], __read$1(elements), !1)), l = this.length, _b.label = 1;
                  case 1:
                    return i < l ? [4, this._sortNodeUp(i)] : [3, 4];
                  case 2:
                    _b.sent(), _b.label = 3;
                  case 3:
                    return ++i, [3, 1];
                  case 4:
                    return this._applyLimit(), [2, !0];
                }
              });
            });
          }, HeapAsync2.prototype.bottom = function(n2) {
            return n2 === void 0 && (n2 = 1), __awaiter(this, void 0, void 0, function() {
              return __generator$1(this, function(_a) {
                return this.heapArray.length === 0 || n2 <= 0 ? [2, []] : this.heapArray.length === 1 ? [2, [this.heapArray[0]]] : n2 >= this.heapArray.length ? [2, __spreadArray$1([], __read$1(this.heapArray), !1)] : [2, this._bottomN_push(~~n2)];
              });
            });
          }, HeapAsync2.prototype.check = function() {
            return __awaiter(this, void 0, void 0, function() {
              var j, el, children, children_1, children_1_1, ch, e_1_1, e_1, _a;
              return __generator$1(this, function(_b) {
                switch (_b.label) {
                  case 0:
                    j = 0, _b.label = 1;
                  case 1:
                    if (!(j < this.heapArray.length)) return [3, 10];
                    el = this.heapArray[j], children = this.getChildrenOf(j), _b.label = 2;
                  case 2:
                    _b.trys.push([2, 7, 8, 9]), children_1 = (e_1 = void 0, __values(children)), children_1_1 = children_1.next(), _b.label = 3;
                  case 3:
                    return children_1_1.done ? [3, 6] : (ch = children_1_1.value, [4, this.compare(el, ch)]);
                  case 4:
                    if (_b.sent() > 0)
                      return [2, el];
                    _b.label = 5;
                  case 5:
                    return children_1_1 = children_1.next(), [3, 3];
                  case 6:
                    return [3, 9];
                  case 7:
                    return e_1_1 = _b.sent(), e_1 = { error: e_1_1 }, [3, 9];
                  case 8:
                    try {
                      children_1_1 && !children_1_1.done && (_a = children_1.return) && _a.call(children_1);
                    } finally {
                      if (e_1) throw e_1.error;
                    }
                    return [
                      7
                      /*endfinally*/
                    ];
                  case 9:
                    return ++j, [3, 1];
                  case 10:
                    return [
                      2
                      /*return*/
                    ];
                }
              });
            });
          }, HeapAsync2.prototype.clear = function() {
            this.heapArray = [];
          }, HeapAsync2.prototype.clone = function() {
            var cloned = new HeapAsync2(this.comparator());
            return cloned.heapArray = this.toArray(), cloned._limit = this._limit, cloned;
          }, HeapAsync2.prototype.comparator = function() {
            return this.compare;
          }, HeapAsync2.prototype.contains = function(o, fn) {
            return fn === void 0 && (fn = HeapAsync2.defaultIsEqual), __awaiter(this, void 0, void 0, function() {
              var _a, _b, el, e_2_1, e_2, _c;
              return __generator$1(this, function(_d) {
                switch (_d.label) {
                  case 0:
                    _d.trys.push([0, 5, 6, 7]), _a = __values(this.heapArray), _b = _a.next(), _d.label = 1;
                  case 1:
                    return _b.done ? [3, 4] : (el = _b.value, [4, fn(el, o)]);
                  case 2:
                    if (_d.sent())
                      return [2, !0];
                    _d.label = 3;
                  case 3:
                    return _b = _a.next(), [3, 1];
                  case 4:
                    return [3, 7];
                  case 5:
                    return e_2_1 = _d.sent(), e_2 = { error: e_2_1 }, [3, 7];
                  case 6:
                    try {
                      _b && !_b.done && (_c = _a.return) && _c.call(_a);
                    } finally {
                      if (e_2) throw e_2.error;
                    }
                    return [
                      7
                      /*endfinally*/
                    ];
                  case 7:
                    return [2, !1];
                }
              });
            });
          }, HeapAsync2.prototype.init = function(array) {
            return __awaiter(this, void 0, void 0, function() {
              var i;
              return __generator$1(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    array && (this.heapArray = __spreadArray$1([], __read$1(array), !1)), i = Math.floor(this.heapArray.length), _a.label = 1;
                  case 1:
                    return i >= 0 ? [4, this._sortNodeDown(i)] : [3, 4];
                  case 2:
                    _a.sent(), _a.label = 3;
                  case 3:
                    return --i, [3, 1];
                  case 4:
                    return this._applyLimit(), [
                      2
                      /*return*/
                    ];
                }
              });
            });
          }, HeapAsync2.prototype.isEmpty = function() {
            return this.length === 0;
          }, HeapAsync2.prototype.leafs = function() {
            if (this.heapArray.length === 0)
              return [];
            var pi = HeapAsync2.getParentIndexOf(this.heapArray.length - 1);
            return this.heapArray.slice(pi + 1);
          }, Object.defineProperty(HeapAsync2.prototype, "length", {
            /**
             * Length of the heap.
             * @return {Number}
             */
            get: function() {
              return this.heapArray.length;
            },
            enumerable: !1,
            configurable: !0
          }), Object.defineProperty(HeapAsync2.prototype, "limit", {
            /**
             * Get length limit of the heap.
             * @return {Number}
             */
            get: function() {
              return this._limit;
            },
            /**
             * Set length limit of the heap.
             * @return {Number}
             */
            set: function(_l) {
              this._limit = ~~_l, this._applyLimit();
            },
            enumerable: !1,
            configurable: !0
          }), HeapAsync2.prototype.peek = function() {
            return this.heapArray[0];
          }, HeapAsync2.prototype.pop = function() {
            return __awaiter(this, void 0, void 0, function() {
              var last;
              return __generator$1(this, function(_a) {
                return last = this.heapArray.pop(), this.length > 0 && last !== void 0 ? [2, this.replace(last)] : [2, last];
              });
            });
          }, HeapAsync2.prototype.push = function() {
            for (var elements = [], _i = 0; _i < arguments.length; _i++)
              elements[_i] = arguments[_i];
            return __awaiter(this, void 0, void 0, function() {
              return __generator$1(this, function(_a) {
                return elements.length < 1 ? [2, !1] : elements.length === 1 ? [2, this.add(elements[0])] : [2, this.addAll(elements)];
              });
            });
          }, HeapAsync2.prototype.pushpop = function(element) {
            return __awaiter(this, void 0, void 0, function() {
              var _a;
              return __generator$1(this, function(_b) {
                switch (_b.label) {
                  case 0:
                    return [4, this.compare(this.heapArray[0], element)];
                  case 1:
                    return _b.sent() < 0 ? (_a = __read$1([this.heapArray[0], element], 2), element = _a[0], this.heapArray[0] = _a[1], [4, this._sortNodeDown(0)]) : [3, 3];
                  case 2:
                    _b.sent(), _b.label = 3;
                  case 3:
                    return [2, element];
                }
              });
            });
          }, HeapAsync2.prototype.remove = function(o, fn) {
            return fn === void 0 && (fn = HeapAsync2.defaultIsEqual), __awaiter(this, void 0, void 0, function() {
              var idx, i;
              return __generator$1(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    return this.length > 0 ? o !== void 0 ? [3, 2] : [4, this.pop()] : [3, 13];
                  case 1:
                    return _a.sent(), [2, !0];
                  case 2:
                    idx = -1, i = 0, _a.label = 3;
                  case 3:
                    return i < this.heapArray.length ? [4, fn(this.heapArray[i], o)] : [3, 6];
                  case 4:
                    if (_a.sent())
                      return idx = i, [3, 6];
                    _a.label = 5;
                  case 5:
                    return ++i, [3, 3];
                  case 6:
                    return idx >= 0 ? idx !== 0 ? [3, 8] : [4, this.pop()] : [3, 13];
                  case 7:
                    return _a.sent(), [3, 12];
                  case 8:
                    return idx !== this.length - 1 ? [3, 9] : (this.heapArray.pop(), [3, 12]);
                  case 9:
                    return this.heapArray.splice(idx, 1, this.heapArray.pop()), [4, this._sortNodeUp(idx)];
                  case 10:
                    return _a.sent(), [4, this._sortNodeDown(idx)];
                  case 11:
                    _a.sent(), _a.label = 12;
                  case 12:
                    return [2, !0];
                  case 13:
                    return [2, !1];
                }
              });
            });
          }, HeapAsync2.prototype.replace = function(element) {
            return __awaiter(this, void 0, void 0, function() {
              var peek;
              return __generator$1(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    return peek = this.heapArray[0], this.heapArray[0] = element, [4, this._sortNodeDown(0)];
                  case 1:
                    return _a.sent(), [2, peek];
                }
              });
            });
          }, HeapAsync2.prototype.size = function() {
            return this.length;
          }, HeapAsync2.prototype.top = function(n2) {
            return n2 === void 0 && (n2 = 1), __awaiter(this, void 0, void 0, function() {
              return __generator$1(this, function(_a) {
                return this.heapArray.length === 0 || n2 <= 0 ? [2, []] : this.heapArray.length === 1 || n2 === 1 ? [2, [this.heapArray[0]]] : n2 >= this.heapArray.length ? [2, __spreadArray$1([], __read$1(this.heapArray), !1)] : [2, this._topN_push(~~n2)];
              });
            });
          }, HeapAsync2.prototype.toArray = function() {
            return __spreadArray$1([], __read$1(this.heapArray), !1);
          }, HeapAsync2.prototype.toString = function() {
            return this.heapArray.toString();
          }, HeapAsync2.prototype.get = function(i) {
            return this.heapArray[i];
          }, HeapAsync2.prototype.getChildrenOf = function(idx) {
            var _this = this;
            return HeapAsync2.getChildrenIndexOf(idx).map(function(i) {
              return _this.heapArray[i];
            }).filter(function(e) {
              return e !== void 0;
            });
          }, HeapAsync2.prototype.getParentOf = function(idx) {
            var pi = HeapAsync2.getParentIndexOf(idx);
            return this.heapArray[pi];
          }, HeapAsync2.prototype[Symbol.iterator] = function() {
            return __generator$1(this, function(_a) {
              switch (_a.label) {
                case 0:
                  return this.length ? [4, this.pop()] : [3, 2];
                case 1:
                  return _a.sent(), [3, 0];
                case 2:
                  return [
                    2
                    /*return*/
                  ];
              }
            });
          }, HeapAsync2.prototype.iterator = function() {
            return this;
          }, HeapAsync2.prototype._applyLimit = function() {
            if (this._limit && this._limit < this.heapArray.length)
              for (var rm = this.heapArray.length - this._limit; rm; )
                this.heapArray.pop(), --rm;
          }, HeapAsync2.prototype._bottomN_push = function(n2) {
            return __awaiter(this, void 0, void 0, function() {
              var bottomHeap, startAt, parentStartAt, indices, i, arr, i;
              return __generator$1(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    return bottomHeap = new HeapAsync2(this.compare), bottomHeap.limit = n2, bottomHeap.heapArray = this.heapArray.slice(-n2), [4, bottomHeap.init()];
                  case 1:
                    for (_a.sent(), startAt = this.heapArray.length - 1 - n2, parentStartAt = HeapAsync2.getParentIndexOf(startAt), indices = [], i = startAt; i > parentStartAt; --i)
                      indices.push(i);
                    arr = this.heapArray, _a.label = 2;
                  case 2:
                    return indices.length ? (i = indices.shift(), [4, this.compare(arr[i], bottomHeap.peek())]) : [3, 6];
                  case 3:
                    return _a.sent() > 0 ? [4, bottomHeap.replace(arr[i])] : [3, 5];
                  case 4:
                    _a.sent(), i % 2 && indices.push(HeapAsync2.getParentIndexOf(i)), _a.label = 5;
                  case 5:
                    return [3, 2];
                  case 6:
                    return [2, bottomHeap.toArray()];
                }
              });
            });
          }, HeapAsync2.prototype._moveNode = function(j, k) {
            var _a;
            _a = __read$1([this.heapArray[k], this.heapArray[j]], 2), this.heapArray[j] = _a[0], this.heapArray[k] = _a[1];
          }, HeapAsync2.prototype._sortNodeDown = function(i) {
            return __awaiter(this, void 0, void 0, function() {
              var moveIt, self2, getPotentialParent, childrenIdx, bestChildIndex, j, bestChild, _a, _this = this;
              return __generator$1(this, function(_b) {
                switch (_b.label) {
                  case 0:
                    moveIt = i < this.heapArray.length - 1, self2 = this.heapArray[i], getPotentialParent = function(best, j2) {
                      return __awaiter(_this, void 0, void 0, function() {
                        var _a2;
                        return __generator$1(this, function(_b2) {
                          switch (_b2.label) {
                            case 0:
                              return _a2 = this.heapArray.length > j2, _a2 ? [4, this.compare(this.heapArray[j2], this.heapArray[best])] : [3, 2];
                            case 1:
                              _a2 = _b2.sent() < 0, _b2.label = 2;
                            case 2:
                              return _a2 && (best = j2), [2, best];
                          }
                        });
                      });
                    }, _b.label = 1;
                  case 1:
                    if (!moveIt) return [3, 8];
                    childrenIdx = HeapAsync2.getChildrenIndexOf(i), bestChildIndex = childrenIdx[0], j = 1, _b.label = 2;
                  case 2:
                    return j < childrenIdx.length ? [4, getPotentialParent(bestChildIndex, childrenIdx[j])] : [3, 5];
                  case 3:
                    bestChildIndex = _b.sent(), _b.label = 4;
                  case 4:
                    return ++j, [3, 2];
                  case 5:
                    return bestChild = this.heapArray[bestChildIndex], _a = typeof bestChild < "u", _a ? [4, this.compare(self2, bestChild)] : [3, 7];
                  case 6:
                    _a = _b.sent() > 0, _b.label = 7;
                  case 7:
                    return _a ? (this._moveNode(i, bestChildIndex), i = bestChildIndex) : moveIt = !1, [3, 1];
                  case 8:
                    return [
                      2
                      /*return*/
                    ];
                }
              });
            });
          }, HeapAsync2.prototype._sortNodeUp = function(i) {
            return __awaiter(this, void 0, void 0, function() {
              var moveIt, pi, _a;
              return __generator$1(this, function(_b) {
                switch (_b.label) {
                  case 0:
                    moveIt = i > 0, _b.label = 1;
                  case 1:
                    return moveIt ? (pi = HeapAsync2.getParentIndexOf(i), _a = pi >= 0, _a ? [4, this.compare(this.heapArray[pi], this.heapArray[i])] : [3, 3]) : [3, 4];
                  case 2:
                    _a = _b.sent() > 0, _b.label = 3;
                  case 3:
                    return _a ? (this._moveNode(i, pi), i = pi) : moveIt = !1, [3, 1];
                  case 4:
                    return [
                      2
                      /*return*/
                    ];
                }
              });
            });
          }, HeapAsync2.prototype._topN_push = function(n2) {
            return __awaiter(this, void 0, void 0, function() {
              var topHeap, indices, arr, i;
              return __generator$1(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    topHeap = new HeapAsync2(this._invertedCompare), topHeap.limit = n2, indices = [0], arr = this.heapArray, _a.label = 1;
                  case 1:
                    return indices.length ? (i = indices.shift(), i < arr.length ? topHeap.length < n2 ? [4, topHeap.push(arr[i])] : [3, 3] : [3, 6]) : [3, 7];
                  case 2:
                    return _a.sent(), indices.push.apply(indices, __spreadArray$1([], __read$1(HeapAsync2.getChildrenIndexOf(i)), !1)), [3, 6];
                  case 3:
                    return [4, this.compare(arr[i], topHeap.peek())];
                  case 4:
                    return _a.sent() < 0 ? [4, topHeap.replace(arr[i])] : [3, 6];
                  case 5:
                    _a.sent(), indices.push.apply(indices, __spreadArray$1([], __read$1(HeapAsync2.getChildrenIndexOf(i)), !1)), _a.label = 6;
                  case 6:
                    return [3, 1];
                  case 7:
                    return [2, topHeap.toArray()];
                }
              });
            });
          }, HeapAsync2.prototype._topN_fill = function(n2) {
            return __awaiter(this, void 0, void 0, function() {
              var heapArray, topHeap, branch, indices, i, i;
              return __generator$1(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    return heapArray = this.heapArray, topHeap = new HeapAsync2(this._invertedCompare), topHeap.limit = n2, topHeap.heapArray = heapArray.slice(0, n2), [4, topHeap.init()];
                  case 1:
                    for (_a.sent(), branch = HeapAsync2.getParentIndexOf(n2 - 1) + 1, indices = [], i = branch; i < n2; ++i)
                      indices.push.apply(indices, __spreadArray$1([], __read$1(HeapAsync2.getChildrenIndexOf(i).filter(function(l) {
                        return l < heapArray.length;
                      })), !1));
                    (n2 - 1) % 2 && indices.push(n2), _a.label = 2;
                  case 2:
                    return indices.length ? (i = indices.shift(), i < heapArray.length ? [4, this.compare(heapArray[i], topHeap.peek())] : [3, 5]) : [3, 6];
                  case 3:
                    return _a.sent() < 0 ? [4, topHeap.replace(heapArray[i])] : [3, 5];
                  case 4:
                    _a.sent(), indices.push.apply(indices, __spreadArray$1([], __read$1(HeapAsync2.getChildrenIndexOf(i)), !1)), _a.label = 5;
                  case 5:
                    return [3, 2];
                  case 6:
                    return [2, topHeap.toArray()];
                }
              });
            });
          }, HeapAsync2.prototype._topN_heap = function(n2) {
            return __awaiter(this, void 0, void 0, function() {
              var topHeap, result, i, _a, _b;
              return __generator$1(this, function(_c) {
                switch (_c.label) {
                  case 0:
                    topHeap = this.clone(), result = [], i = 0, _c.label = 1;
                  case 1:
                    return i < n2 ? (_b = (_a = result).push, [4, topHeap.pop()]) : [3, 4];
                  case 2:
                    _b.apply(_a, [_c.sent()]), _c.label = 3;
                  case 3:
                    return ++i, [3, 1];
                  case 4:
                    return [2, result];
                }
              });
            });
          }, HeapAsync2.prototype._topIdxOf = function(list) {
            return __awaiter(this, void 0, void 0, function() {
              var idx, top, i, comp;
              return __generator$1(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    if (!list.length)
                      return [2, -1];
                    idx = 0, top = list[idx], i = 1, _a.label = 1;
                  case 1:
                    return i < list.length ? [4, this.compare(list[i], top)] : [3, 4];
                  case 2:
                    comp = _a.sent(), comp < 0 && (idx = i, top = list[i]), _a.label = 3;
                  case 3:
                    return ++i, [3, 1];
                  case 4:
                    return [2, idx];
                }
              });
            });
          }, HeapAsync2.prototype._topOf = function() {
            for (var list = [], _i = 0; _i < arguments.length; _i++)
              list[_i] = arguments[_i];
            return __awaiter(this, void 0, void 0, function() {
              var heap;
              return __generator$1(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    return heap = new HeapAsync2(this.compare), [4, heap.init(list)];
                  case 1:
                    return _a.sent(), [2, heap.peek()];
                }
              });
            });
          }, HeapAsync2;
        })()
      ), __generator = function(thisArg, body) {
        var _ = { label: 0, sent: function() {
          if (t[0] & 1) throw t[1];
          return t[1];
        }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), throw: verb(1), return: verb(2) }, typeof Symbol == "function" && (g[Symbol.iterator] = function() {
          return this;
        }), g;
        function verb(n2) {
          return function(v) {
            return step([n2, v]);
          };
        }
        function step(op) {
          if (f) throw new TypeError("Generator is already executing.");
          for (; g && (g = 0, op[0] && (_ = 0)), _; ) try {
            if (f = 1, y && (t = op[0] & 2 ? y.return : op[0] ? y.throw || ((t = y.return) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            switch (y = 0, t && (op = [op[0] & 2, t.value]), op[0]) {
              case 0:
              case 1:
                t = op;
                break;
              case 4:
                return _.label++, { value: op[1], done: !1 };
              case 5:
                _.label++, y = op[1], op = [0];
                continue;
              case 7:
                op = _.ops.pop(), _.trys.pop();
                continue;
              default:
                if (t = _.trys, !(t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                  _ = 0;
                  continue;
                }
                if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                  _.label = op[1];
                  break;
                }
                if (op[0] === 6 && _.label < t[1]) {
                  _.label = t[1], t = op;
                  break;
                }
                if (t && _.label < t[2]) {
                  _.label = t[2], _.ops.push(op);
                  break;
                }
                t[2] && _.ops.pop(), _.trys.pop();
                continue;
            }
            op = body.call(thisArg, _);
          } catch (e) {
            op = [6, e], y = 0;
          } finally {
            f = t = 0;
          }
          if (op[0] & 5) throw op[1];
          return { value: op[0] ? op[1] : void 0, done: !0 };
        }
      }, __read = function(o, n2) {
        var m = typeof Symbol == "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r2, ar = [], e;
        try {
          for (; (n2 === void 0 || n2-- > 0) && !(r2 = i.next()).done; ) ar.push(r2.value);
        } catch (error) {
          e = { error };
        } finally {
          try {
            r2 && !r2.done && (m = i.return) && m.call(i);
          } finally {
            if (e) throw e.error;
          }
        }
        return ar;
      }, __spreadArray = function(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++)
          (ar || !(i in from)) && (ar || (ar = Array.prototype.slice.call(from, 0, i)), ar[i] = from[i]);
        return to.concat(ar || Array.prototype.slice.call(from));
      }, toInt = function(n2) {
        return ~~n2;
      }, Heap2 = (
        /** @class */
        (function() {
          function Heap3(compare) {
            compare === void 0 && (compare = Heap3.minComparator);
            var _this = this;
            this.compare = compare, this.heapArray = [], this._limit = 0, this.offer = this.add, this.element = this.peek, this.poll = this.pop, this.removeAll = this.clear, this._invertedCompare = function(a, b) {
              return -1 * _this.compare(a, b);
            };
          }
          return Heap3.getChildrenIndexOf = function(idx) {
            return [idx * 2 + 1, idx * 2 + 2];
          }, Heap3.getParentIndexOf = function(idx) {
            if (idx <= 0)
              return -1;
            var whichChildren = idx % 2 ? 1 : 2;
            return Math.floor((idx - whichChildren) / 2);
          }, Heap3.getSiblingIndexOf = function(idx) {
            if (idx <= 0)
              return -1;
            var whichChildren = idx % 2 ? 1 : -1;
            return idx + whichChildren;
          }, Heap3.minComparator = function(a, b) {
            return a > b ? 1 : a < b ? -1 : 0;
          }, Heap3.maxComparator = function(a, b) {
            return b > a ? 1 : b < a ? -1 : 0;
          }, Heap3.minComparatorNumber = function(a, b) {
            return a - b;
          }, Heap3.maxComparatorNumber = function(a, b) {
            return b - a;
          }, Heap3.defaultIsEqual = function(a, b) {
            return a === b;
          }, Heap3.print = function(heap) {
            function deep(i2) {
              var pi = Heap3.getParentIndexOf(i2);
              return Math.floor(Math.log2(pi + 1));
            }
            function repeat(str, times) {
              for (var out = ""; times > 0; --times)
                out += str;
              return out;
            }
            for (var node = 0, lines = [], maxLines = deep(heap.length - 1) + 2, maxLength = 0; node < heap.length; ) {
              var i = deep(node) + 1;
              node === 0 && (i = 0);
              var nodeText = String(heap.get(node));
              nodeText.length > maxLength && (maxLength = nodeText.length), lines[i] = lines[i] || [], lines[i].push(nodeText), node += 1;
            }
            return lines.map(function(line, i2) {
              var times = Math.pow(2, maxLines - i2) - 1;
              return repeat(" ", Math.floor(times / 2) * maxLength) + line.map(function(el) {
                var half = (maxLength - el.length) / 2;
                return repeat(" ", Math.ceil(half)) + el + repeat(" ", Math.floor(half));
              }).join(repeat(" ", times * maxLength));
            }).join(`
`);
          }, Heap3.heapify = function(arr, compare) {
            var heap = new Heap3(compare);
            return heap.heapArray = arr, heap.init(), heap;
          }, Heap3.heappop = function(heapArr, compare) {
            var heap = new Heap3(compare);
            return heap.heapArray = heapArr, heap.pop();
          }, Heap3.heappush = function(heapArr, item, compare) {
            var heap = new Heap3(compare);
            heap.heapArray = heapArr, heap.push(item);
          }, Heap3.heappushpop = function(heapArr, item, compare) {
            var heap = new Heap3(compare);
            return heap.heapArray = heapArr, heap.pushpop(item);
          }, Heap3.heapreplace = function(heapArr, item, compare) {
            var heap = new Heap3(compare);
            return heap.heapArray = heapArr, heap.replace(item);
          }, Heap3.heaptop = function(heapArr, n2, compare) {
            n2 === void 0 && (n2 = 1);
            var heap = new Heap3(compare);
            return heap.heapArray = heapArr, heap.top(n2);
          }, Heap3.heapbottom = function(heapArr, n2, compare) {
            n2 === void 0 && (n2 = 1);
            var heap = new Heap3(compare);
            return heap.heapArray = heapArr, heap.bottom(n2);
          }, Heap3.nlargest = function(n2, iterable, compare) {
            var heap = new Heap3(compare);
            return heap.heapArray = __spreadArray([], __read(iterable), !1), heap.init(), heap.top(n2);
          }, Heap3.nsmallest = function(n2, iterable, compare) {
            var heap = new Heap3(compare);
            return heap.heapArray = __spreadArray([], __read(iterable), !1), heap.init(), heap.bottom(n2);
          }, Heap3.prototype.add = function(element) {
            return this._sortNodeUp(this.heapArray.push(element) - 1), this._applyLimit(), !0;
          }, Heap3.prototype.addAll = function(elements) {
            var _a, i = this.length;
            (_a = this.heapArray).push.apply(_a, __spreadArray([], __read(elements), !1));
            for (var l = this.length; i < l; ++i)
              this._sortNodeUp(i);
            return this._applyLimit(), !0;
          }, Heap3.prototype.bottom = function(n2) {
            return n2 === void 0 && (n2 = 1), this.heapArray.length === 0 || n2 <= 0 ? [] : this.heapArray.length === 1 ? [this.heapArray[0]] : n2 >= this.heapArray.length ? __spreadArray([], __read(this.heapArray), !1) : this._bottomN_push(~~n2);
          }, Heap3.prototype.check = function() {
            var _this = this;
            return this.heapArray.find(function(el, j) {
              return !!_this.getChildrenOf(j).find(function(ch) {
                return _this.compare(el, ch) > 0;
              });
            });
          }, Heap3.prototype.clear = function() {
            this.heapArray = [];
          }, Heap3.prototype.clone = function() {
            var cloned = new Heap3(this.comparator());
            return cloned.heapArray = this.toArray(), cloned._limit = this._limit, cloned;
          }, Heap3.prototype.comparator = function() {
            return this.compare;
          }, Heap3.prototype.contains = function(o, callbackFn) {
            return callbackFn === void 0 && (callbackFn = Heap3.defaultIsEqual), this.indexOf(o, callbackFn) !== -1;
          }, Heap3.prototype.init = function(array) {
            array && (this.heapArray = __spreadArray([], __read(array), !1));
            for (var i = Math.floor(this.heapArray.length); i >= 0; --i)
              this._sortNodeDown(i);
            this._applyLimit();
          }, Heap3.prototype.isEmpty = function() {
            return this.length === 0;
          }, Heap3.prototype.indexOf = function(element, callbackFn) {
            if (callbackFn === void 0 && (callbackFn = Heap3.defaultIsEqual), this.heapArray.length === 0)
              return -1;
            for (var indexes = [], currentIndex = 0; currentIndex < this.heapArray.length; ) {
              var currentElement = this.heapArray[currentIndex];
              if (callbackFn(currentElement, element))
                return currentIndex;
              this.compare(currentElement, element) <= 0 && indexes.push.apply(indexes, __spreadArray([], __read(Heap3.getChildrenIndexOf(currentIndex)), !1)), currentIndex = indexes.shift() || this.heapArray.length;
            }
            return -1;
          }, Heap3.prototype.indexOfEvery = function(element, callbackFn) {
            if (callbackFn === void 0 && (callbackFn = Heap3.defaultIsEqual), this.heapArray.length === 0)
              return [];
            for (var indexes = [], foundIndexes = [], currentIndex = 0; currentIndex < this.heapArray.length; ) {
              var currentElement = this.heapArray[currentIndex];
              callbackFn(currentElement, element) ? (foundIndexes.push(currentIndex), indexes.push.apply(indexes, __spreadArray([], __read(Heap3.getChildrenIndexOf(currentIndex)), !1))) : this.compare(currentElement, element) <= 0 && indexes.push.apply(indexes, __spreadArray([], __read(Heap3.getChildrenIndexOf(currentIndex)), !1)), currentIndex = indexes.shift() || this.heapArray.length;
            }
            return foundIndexes;
          }, Heap3.prototype.leafs = function() {
            if (this.heapArray.length === 0)
              return [];
            var pi = Heap3.getParentIndexOf(this.heapArray.length - 1);
            return this.heapArray.slice(pi + 1);
          }, Object.defineProperty(Heap3.prototype, "length", {
            /**
             * Length of the heap. Aliases: {@link size}.
             * @return {Number}
             * @see size
             */
            get: function() {
              return this.heapArray.length;
            },
            enumerable: !1,
            configurable: !0
          }), Object.defineProperty(Heap3.prototype, "limit", {
            /**
             * Get length limit of the heap.
             * Use {@link setLimit} or {@link limit} to set the limit.
             * @return {Number}
             * @see setLimit
             */
            get: function() {
              return this._limit;
            },
            /**
             * Set length limit of the heap. Same as using {@link setLimit}.
             * @description If the heap is longer than the limit, the needed amount of leafs are removed.
             * @param {Number} _l Limit, defaults to 0 (no limit). Negative, Infinity, or NaN values set the limit to 0.
             * @see setLimit
             */
            set: function(_l) {
              _l < 0 || isNaN(_l) ? this._limit = 0 : this._limit = ~~_l, this._applyLimit();
            },
            enumerable: !1,
            configurable: !0
          }), Heap3.prototype.setLimit = function(_l) {
            return this.limit = _l, _l < 0 || isNaN(_l) ? NaN : this._limit;
          }, Heap3.prototype.peek = function() {
            return this.heapArray[0];
          }, Heap3.prototype.pop = function() {
            var last = this.heapArray.pop();
            return this.length > 0 && last !== void 0 ? this.replace(last) : last;
          }, Heap3.prototype.push = function() {
            for (var elements = [], _i = 0; _i < arguments.length; _i++)
              elements[_i] = arguments[_i];
            return elements.length < 1 ? !1 : elements.length === 1 ? this.add(elements[0]) : this.addAll(elements);
          }, Heap3.prototype.pushpop = function(element) {
            var _a;
            return this.compare(this.heapArray[0], element) < 0 && (_a = __read([this.heapArray[0], element], 2), element = _a[0], this.heapArray[0] = _a[1], this._sortNodeDown(0)), element;
          }, Heap3.prototype.remove = function(o, callbackFn) {
            if (callbackFn === void 0 && (callbackFn = Heap3.defaultIsEqual), this.length > 0) {
              if (o === void 0)
                return this.pop(), !0;
              var idx = this.indexOf(o, callbackFn);
              if (idx >= 0)
                return idx === 0 ? this.pop() : idx === this.length - 1 ? this.heapArray.pop() : (this.heapArray.splice(idx, 1, this.heapArray.pop()), this._sortNodeUp(idx), this._sortNodeDown(idx)), !0;
            }
            return !1;
          }, Heap3.prototype.replace = function(element) {
            var peek = this.heapArray[0];
            return this.heapArray[0] = element, this._sortNodeDown(0), peek;
          }, Heap3.prototype.size = function() {
            return this.length;
          }, Heap3.prototype.top = function(n2) {
            return n2 === void 0 && (n2 = 1), this.heapArray.length === 0 || n2 <= 0 ? [] : this.heapArray.length === 1 || n2 === 1 ? [this.heapArray[0]] : n2 >= this.heapArray.length ? __spreadArray([], __read(this.heapArray), !1) : this._topN_push(~~n2);
          }, Heap3.prototype.toArray = function() {
            return __spreadArray([], __read(this.heapArray), !1);
          }, Heap3.prototype.toString = function() {
            return this.heapArray.toString();
          }, Heap3.prototype.get = function(i) {
            return this.heapArray[i];
          }, Heap3.prototype.getChildrenOf = function(idx) {
            var _this = this;
            return Heap3.getChildrenIndexOf(idx).map(function(i) {
              return _this.heapArray[i];
            }).filter(function(e) {
              return e !== void 0;
            });
          }, Heap3.prototype.getParentOf = function(idx) {
            var pi = Heap3.getParentIndexOf(idx);
            return this.heapArray[pi];
          }, Heap3.prototype[Symbol.iterator] = function() {
            return __generator(this, function(_a) {
              switch (_a.label) {
                case 0:
                  return this.length ? [4, this.pop()] : [3, 2];
                case 1:
                  return _a.sent(), [3, 0];
                case 2:
                  return [
                    2
                    /*return*/
                  ];
              }
            });
          }, Heap3.prototype.iterator = function() {
            return this.toArray();
          }, Heap3.prototype._applyLimit = function() {
            if (this._limit > 0 && this._limit < this.heapArray.length)
              for (var rm = this.heapArray.length - this._limit; rm; )
                this.heapArray.pop(), --rm;
          }, Heap3.prototype._bottomN_push = function(n2) {
            var bottomHeap = new Heap3(this.compare);
            bottomHeap.limit = n2, bottomHeap.heapArray = this.heapArray.slice(-n2), bottomHeap.init();
            for (var startAt = this.heapArray.length - 1 - n2, parentStartAt = Heap3.getParentIndexOf(startAt), indices = [], i = startAt; i > parentStartAt; --i)
              indices.push(i);
            for (var arr = this.heapArray; indices.length; ) {
              var i = indices.shift();
              this.compare(arr[i], bottomHeap.peek()) > 0 && (bottomHeap.replace(arr[i]), i % 2 && indices.push(Heap3.getParentIndexOf(i)));
            }
            return bottomHeap.toArray();
          }, Heap3.prototype._moveNode = function(j, k) {
            var _a;
            _a = __read([this.heapArray[k], this.heapArray[j]], 2), this.heapArray[j] = _a[0], this.heapArray[k] = _a[1];
          }, Heap3.prototype._sortNodeDown = function(i) {
            for (var _this = this, moveIt = i < this.heapArray.length - 1, self2 = this.heapArray[i], getPotentialParent = function(best, j) {
              return _this.heapArray.length > j && _this.compare(_this.heapArray[j], _this.heapArray[best]) < 0 && (best = j), best;
            }; moveIt; ) {
              var childrenIdx = Heap3.getChildrenIndexOf(i), bestChildIndex = childrenIdx.reduce(getPotentialParent, childrenIdx[0]), bestChild = this.heapArray[bestChildIndex];
              typeof bestChild < "u" && this.compare(self2, bestChild) > 0 ? (this._moveNode(i, bestChildIndex), i = bestChildIndex) : moveIt = !1;
            }
          }, Heap3.prototype._sortNodeUp = function(i) {
            for (var moveIt = i > 0; moveIt; ) {
              var pi = Heap3.getParentIndexOf(i);
              pi >= 0 && this.compare(this.heapArray[pi], this.heapArray[i]) > 0 ? (this._moveNode(i, pi), i = pi) : moveIt = !1;
            }
          }, Heap3.prototype._topN_push = function(n2) {
            var topHeap = new Heap3(this._invertedCompare);
            topHeap.limit = n2;
            for (var indices = [0], arr = this.heapArray; indices.length; ) {
              var i = indices.shift();
              i < arr.length && (topHeap.length < n2 ? (topHeap.push(arr[i]), indices.push.apply(indices, __spreadArray([], __read(Heap3.getChildrenIndexOf(i)), !1))) : this.compare(arr[i], topHeap.peek()) < 0 && (topHeap.replace(arr[i]), indices.push.apply(indices, __spreadArray([], __read(Heap3.getChildrenIndexOf(i)), !1))));
            }
            return topHeap.toArray();
          }, Heap3.prototype._topN_fill = function(n2) {
            var heapArray = this.heapArray, topHeap = new Heap3(this._invertedCompare);
            topHeap.limit = n2, topHeap.heapArray = heapArray.slice(0, n2), topHeap.init();
            for (var branch = Heap3.getParentIndexOf(n2 - 1) + 1, indices = [], i = branch; i < n2; ++i)
              indices.push.apply(indices, __spreadArray([], __read(Heap3.getChildrenIndexOf(i).filter(function(l) {
                return l < heapArray.length;
              })), !1));
            for ((n2 - 1) % 2 && indices.push(n2); indices.length; ) {
              var i = indices.shift();
              i < heapArray.length && this.compare(heapArray[i], topHeap.peek()) < 0 && (topHeap.replace(heapArray[i]), indices.push.apply(indices, __spreadArray([], __read(Heap3.getChildrenIndexOf(i)), !1)));
            }
            return topHeap.toArray();
          }, Heap3.prototype._topN_heap = function(n2) {
            for (var topHeap = this.clone(), result = [], i = 0; i < n2; ++i)
              result.push(topHeap.pop());
            return result;
          }, Heap3.prototype._topIdxOf = function(list) {
            if (!list.length)
              return -1;
            for (var idx = 0, top = list[idx], i = 1; i < list.length; ++i) {
              var comp = this.compare(list[i], top);
              comp < 0 && (idx = i, top = list[i]);
            }
            return idx;
          }, Heap3.prototype._topOf = function() {
            for (var list = [], _i = 0; _i < arguments.length; _i++)
              list[_i] = arguments[_i];
            var heap = new Heap3(this.compare);
            return heap.init(list), heap.peek();
          }, Heap3;
        })()
      );
      exports2.Heap = Heap2, exports2.HeapAsync = HeapAsync, exports2.default = Heap2, exports2.toInt = toInt, Object.defineProperty(exports2, "__esModule", { value: !0 });
    }));
  }
});

// ../workflows-shared/src/engine.ts
import { DurableObject } from "cloudflare:workers";

// ../workflows-shared/src/context.ts
import { RpcTarget as RpcTarget2 } from "cloudflare:workers";

// ../../node_modules/.pnpm/itty-time@2.0.2/node_modules/itty-time/index.mjs
var n = { year: 315576e5, month: 2592e6, week: 6048e5, day: 864e5, hour: 36e5, minute: 6e4, second: 1e3, m: 1 }, r = (e) => {
  if (!isNaN(+e)) return +e;
  let [, t, r2] = e.match(/^([^ ]+) +(\w\w*?)s?$/) || [, e];
  return +t * (n[r2] || 1);
};

// ../workflows-shared/src/instance.ts
var INSTANCE_METADATA = "INSTANCE_METADATA";
function instanceStatusName(status) {
  switch (status) {
    case 0 /* Queued */:
      return "queued";
    case 1 /* Running */:
      return "running";
    case 2 /* Paused */:
      return "paused";
    case 3 /* Errored */:
      return "errored";
    case 4 /* Terminated */:
      return "terminated";
    case 5 /* Complete */:
      return "complete";
    case 6 /* WaitingForPause */:
      return "waitingForPause";
    case 7 /* Waiting */:
      return "waiting";
    default:
      return "unknown";
  }
}
function toInstanceStatus(status) {
  switch (status) {
    case "queued":
      return 0 /* Queued */;
    case "running":
      return 1 /* Running */;
    case "paused":
      return 2 /* Paused */;
    case "errored":
      return 3 /* Errored */;
    case "terminated":
      return 4 /* Terminated */;
    case "complete":
      return 5 /* Complete */;
    case "waitingForPause":
      return 6 /* WaitingForPause */;
    case "waiting":
      return 7 /* Waiting */;
    case "unknown":
      throw new Error("unknown cannot be parsed into a InstanceStatus");
    default:
      throw new Error(
        `${status} was not handled because it's not a valid InstanceStatus`
      );
  }
}

// ../workflows-shared/src/lib/cache.ts
async function computeHash(value) {
  let msgUint8 = new TextEncoder().encode(value), hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ../workflows-shared/src/lib/retries.ts
var DelayFunctionError = class extends Error {
  constructor(reason) {
    super(reason), this.name = "DelayFunctionError";
  }
};
function calcRetryDuration(config, stepState, delayValue) {
  let { attemptedCount: attemptCount } = stepState, { retries } = config, base;
  try {
    base = r(delayValue);
  } catch {
    throw new DelayFunctionError(
      'returned an invalid delay value (expected a number of ms or a duration string like "30 seconds")'
    );
  }
  if (!Number.isFinite(base) || base < 0)
    throw new DelayFunctionError(
      'returned an invalid delay value (expected a number of ms or a duration string like "30 seconds")'
    );
  switch (retries.backoff) {
    case "exponential":
      return base * Math.pow(2, attemptCount - 1);
    case "linear":
      return base * attemptCount;
    default:
      return base;
  }
}

// ../workflows-shared/src/lib/delay.ts
var DEFAULT_RETRY_DELAY_MS = 1e3, DELAY_FUNCTION_TIMEOUT_MS = r("5 seconds");
function schedulerWait(durationMs, opts) {
  let signal = opts?.signal;
  if (signal?.aborted)
    return Promise.resolve();
  let safeDuration = Math.max(0, durationMs);
  return (signal === void 0 ? scheduler.wait(safeDuration) : scheduler.wait(safeDuration, { signal })).then(
    () => {
    },
    (error) => {
      if (!signal?.aborted)
        throw error;
    }
  );
}
async function raceAgainstAbort(promise, signal) {
  let resultPromise = promise.then((value) => ({
    aborted: !1,
    value
  }));
  if (signal.aborted)
    return resultPromise.catch(() => {
    }), { aborted: !0 };
  let resolveAbort, abortPromise = new Promise((resolve) => {
    resolveAbort = resolve;
  }), onAbort = () => resolveAbort?.({ aborted: !0 });
  signal.addEventListener("abort", onAbort, { once: !0 });
  try {
    return await Promise.race([resultPromise, abortPromise]);
  } finally {
    signal.removeEventListener("abort", onAbort);
  }
}
async function invokeDelayFunction(delay, input, options) {
  let { wait, signal, logger } = options, logFields = { step: input.ctx.step.name, attempt: input.ctx.attempt }, settled = new AbortController(), timeoutSignal = signal ? AbortSignal.any([signal, settled.signal]) : settled.signal;
  try {
    let result = await Promise.race([
      Promise.resolve(delay(input)).then((value) => ({
        timedOut: !1,
        value
      })),
      wait(options.timeoutMs, { signal: timeoutSignal }).then(() => ({ timedOut: !0 })).catch(() => ({ timedOut: !0 }))
    ]);
    if (result.timedOut) {
      if (signal?.aborted)
        return logger?.debug(
          "delay function aborted by engine shutdown; using default delay",
          logFields
        ), DEFAULT_RETRY_DELAY_MS;
      throw logger?.warn(
        `delay function did not resolve within ${options.timeoutMs}ms`,
        logFields
      ), new DelayFunctionError(
        `did not return within ${options.timeoutMs / 1e3} seconds`
      );
    }
    return result.value;
  } catch (e) {
    if (e instanceof DelayFunctionError)
      throw e;
    let message = e instanceof Error ? e.message : String(e);
    throw logger?.warn("delay function threw", { ...logFields, error: message }), new DelayFunctionError(`threw an error: ${message}`);
  } finally {
    settled.abort();
  }
}

// ../workflows-shared/src/lib/errors.ts
var WorkflowTimeoutError = class extends Error {
  name = "WorkflowTimeoutError";
}, WorkflowInternalError = class extends Error {
  name = "WorkflowInternalError";
}, WorkflowFatalError = class extends Error {
  name = "WorkflowFatalError";
  toJSON() {
    return {
      name: this.name,
      message: this.message
    };
  }
}, NonRetryableDelayError = class extends WorkflowFatalError {
  name = "NonRetryableDelayError";
}, PreservedNonRetryableError = class extends WorkflowFatalError {
  name = "NonRetryableError";
  constructor(err) {
    let message = err.name === "NonRetryableError" ? err.message : err.message.replace(/^NonRetryableError:?\s*/, "");
    super(message);
  }
}, WorkflowError = class extends Error {
  name = "WorkflowError";
}, InvalidStepReadableStreamError = class extends Error {
  name = "InvalidStepReadableStreamError";
}, OversizedStreamChunkError = class extends Error {
  name = "OversizedStreamChunkError";
}, UnsupportedStreamChunkError = class extends Error {
  name = "UnsupportedStreamChunkError";
}, StreamOutputStorageLimitError = class extends Error {
  name = "StreamOutputStorageLimitError";
};
function createWorkflowError(message, errorCode) {
  return new WorkflowError(`(${errorCode}) ${message}`);
}
var ABORT_PREFIX = "Aborting engine:", ABORT_REASONS = {
  USER_PAUSE: `${ABORT_PREFIX} User called pause`,
  USER_RESTART: `${ABORT_PREFIX} User called restart`,
  USER_TERMINATE: `${ABORT_PREFIX} User called terminate`,
  USER_DELETE: `${ABORT_PREFIX} User called delete`,
  NON_RETRYABLE_ERROR: `${ABORT_PREFIX} A step threw a NonRetryableError`,
  NOT_SERIALISABLE: `${ABORT_PREFIX} Value is not serialisable`,
  STORAGE_LIMIT_EXCEEDED: `${ABORT_PREFIX} Storage limit exceeded`,
  GRACE_PERIOD_COMPLETE: `${ABORT_PREFIX} Grace period complete`
}, ABORT_REASON_SET = new Set(
  Object.values(ABORT_REASONS)
);
function getErrorMessage(e) {
  if (e instanceof Error)
    return e.message;
  if (typeof e == "object" && e !== null) {
    let msg = e.message;
    if (typeof msg == "string")
      return msg;
  }
}
function isAbortError(e) {
  let msg = getErrorMessage(e);
  return msg !== void 0 && ABORT_REASON_SET.has(msg);
}
function isUserTriggeredPause(e) {
  return getErrorMessage(e) === ABORT_REASONS.USER_PAUSE;
}
function isUserTriggeredRestart(e) {
  return getErrorMessage(e) === ABORT_REASONS.USER_RESTART;
}
function isUserTriggeredTerminate(e) {
  return getErrorMessage(e) === ABORT_REASONS.USER_TERMINATE;
}
function isUserTriggeredDelete(e) {
  return getErrorMessage(e) === ABORT_REASONS.USER_DELETE;
}
function getCompatFlag(name) {
  return globalThis.Cloudflare?.compatibilityFlags?.[name] ?? !1;
}
function shouldPreserveNonRetryableError() {
  return getCompatFlag("workflows_preserve_non_retryable_error_message");
}
function stepNotFoundError(name) {
  return createWorkflowError(
    `Step "${name}" not found in execution history`,
    "instance.cannot_restart"
  );
}
function duplicateInstanceError(id) {
  return createWorkflowError(
    `Workflow instance with id "${id}" already exists`,
    "instance.already_exists"
  );
}

// ../workflows-shared/src/lib/validators.ts
import { z } from "miniflare:zod";
var SENSITIVE_STEP_OUTPUT = "output";
var MAX_WORKFLOW_INSTANCE_ID_LENGTH = 100, MAX_ADDRESSABLE_WORKFLOW_INSTANCE_ID_LENGTH = 271, MAX_STEP_NAME_LENGTH = 256, ALLOWED_STRING_ID_PATTERN = "^[a-zA-Z0-9_][a-zA-Z0-9-_]*$", ALLOWED_ADDRESSABLE_WORKFLOW_INSTANCE_ID_PATTERN = "^[a-zA-Z0-9, */#_-]+$", ALLOWED_WORKFLOW_INSTANCE_ID_REGEX = new RegExp(
  ALLOWED_STRING_ID_PATTERN
), ALLOWED_ADDRESSABLE_WORKFLOW_INSTANCE_ID_REGEX = new RegExp(
  ALLOWED_ADDRESSABLE_WORKFLOW_INSTANCE_ID_PATTERN
);
var CONTROL_CHAR_REGEX = new RegExp("[\0-]");
function isValidWorkflowInstanceId(id) {
  return typeof id != "string" || id.length > MAX_WORKFLOW_INSTANCE_ID_LENGTH ? !1 : ALLOWED_WORKFLOW_INSTANCE_ID_REGEX.test(id);
}
function isValidAddressableWorkflowInstanceId(id) {
  return typeof id == "string" && id.length > 0 && id.length <= MAX_ADDRESSABLE_WORKFLOW_INSTANCE_ID_LENGTH && ALLOWED_ADDRESSABLE_WORKFLOW_INSTANCE_ID_REGEX.test(id);
}
function isValidStepName(name) {
  return name.length > MAX_STEP_NAME_LENGTH ? !1 : !CONTROL_CHAR_REGEX.test(name);
}
var STEP_CONFIG_SCHEMA = z.object({
  retries: z.object({
    delay: z.number().gte(0).or(z.string()).or(z.function()),
    limit: z.number().gte(0),
    backoff: z.enum(["constant", "linear", "exponential"]).optional()
  }).strict().optional(),
  timeout: z.number().gte(0).or(z.string()).optional(),
  sensitive: z.literal(SENSITIVE_STEP_OUTPUT).optional()
}).strict();
function isValidStepConfig(stepConfig) {
  let config = STEP_CONFIG_SCHEMA.safeParse(stepConfig);
  return !(!config.success || config.data.retries !== void 0 && typeof config.data.retries.delay != "function" && Number.isNaN(r(config.data.retries.delay)) || config.data.timeout !== void 0 && (config.data.timeout == 0 || Number.isNaN(r(config.data.timeout))));
}

// ../workflows-shared/src/lib/rollback.ts
var ROLLBACK_CACHE_KEY_PREFIX = "rollback:";
function parseRollbackOptions(stepName, options) {
  if (options === void 0)
    return;
  if (typeof options != "object" || options === null || Array.isArray(options)) {
    let error = new WorkflowFatalError(
      `Rollback options for "${stepName}" must be an object`
    );
    throw error.isUserError = !0, error;
  }
  let rollbackOptions = options;
  if (typeof rollbackOptions.rollback != "function") {
    let error = new WorkflowFatalError(
      `Rollback for "${stepName}" must be a function`
    );
    throw error.isUserError = !0, error;
  }
  if (rollbackOptions.rollbackConfig !== void 0 && !isValidStepConfig(rollbackOptions.rollbackConfig)) {
    let error = new WorkflowFatalError(
      `Rollback config for "${stepName}" is in a invalid format. See https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/`
    );
    throw error.isUserError = !0, error;
  }
  return rollbackOptions;
}
function dupRollbackStub(fn) {
  return fn.dup ? fn.dup() : fn;
}
function disposeRollbackStub(fn) {
  try {
    fn[Symbol.dispose]?.();
  } catch (err) {
    console.warn("Failed to dispose rollback stub", err);
  }
}
function registerRollbackFn(registry, registration) {
  let { cacheKey, fn, stepContext, output, config } = registration, existing = registry.get(cacheKey);
  if (existing) {
    registry.set(cacheKey, {
      ...existing,
      stepContext,
      ..."output" in registration && { output }
    });
    return;
  }
  registry.set(cacheKey, {
    fn: dupRollbackStub(fn),
    stepContext,
    ..."output" in registration && { output },
    ...config !== void 0 && { config }
  });
}
function clearRollbackRegistry(registry) {
  for (let entry of registry.values())
    disposeRollbackStub(entry.fn);
  registry.clear();
}
async function executeRollbacks(engine, triggerError) {
  let eligibleSteps = engine.readEligibleRollbackStepsDesc();
  if (eligibleSteps.length === 0)
    return clearRollbackRegistry(engine.rollbackRegistry), { ranAny: !1, allSucceeded: !0 };
  engine.writeLog(17 /* ROLLBACK_START */, null, null, {
    triggerError: { name: triggerError.name, message: triggerError.message },
    totalSteps: eligibleSteps.length
  });
  let allSucceeded = !0, completed = 0;
  try {
    for (let step of eligibleSteps) {
      let entry = engine.rollbackRegistry.get(step.cacheKey);
      if (entry === void 0) {
        engine.writeLog(
          23 /* ROLLBACK_STEP_FAILURE */,
          step.cacheKey,
          step.target,
          {
            error: {
              name: "RollbackMissing",
              message: "Rollback function not available in registry"
            }
          }
        ), allSucceeded = !1;
        break;
      }
      let ctx = engine.createRollbackContext({ cacheKey: step.cacheKey });
      try {
        await ctx.do(step.target, entry.config ?? {}, async () => {
          await entry.fn({
            ctx: structuredClone(entry.stepContext),
            error: triggerError,
            output: entry.output,
            stepName: step.target
          });
        }), completed++;
      } catch {
        allSucceeded = !1;
        break;
      } finally {
        disposeRollbackStub(entry.fn), engine.rollbackRegistry.delete(step.cacheKey);
      }
    }
  } finally {
    clearRollbackRegistry(engine.rollbackRegistry);
  }
  return engine.writeLog(
    allSucceeded ? 24 /* ROLLBACK_COMPLETE */ : 25 /* ROLLBACK_FAILED */,
    null,
    null,
    { totalSteps: eligibleSteps.length, completedSteps: completed }
  ), { ranAny: completed > 0, allSucceeded };
}

// ../workflows-shared/src/lib/serialization.ts
function buildCompactView(view) {
  let tightBuffer = view.buffer.slice(
    view.byteOffset,
    view.byteOffset + view.byteLength
  );
  return new view.constructor(tightBuffer);
}
function normalizeForStorage(value, seen = /* @__PURE__ */ new WeakMap()) {
  if (value === null || typeof value != "object")
    return value;
  if (seen.has(value))
    return seen.get(value);
  if (ArrayBuffer.isView(value))
    return buildCompactView(value);
  if (Array.isArray(value)) {
    let result = [];
    seen.set(value, result);
    for (let item of value)
      result.push(normalizeForStorage(item, seen));
    return result;
  }
  if (value instanceof Map) {
    let result = /* @__PURE__ */ new Map();
    seen.set(value, result);
    for (let [key, item] of value)
      result.set(
        normalizeForStorage(key, seen),
        normalizeForStorage(item, seen)
      );
    return result;
  }
  if (value instanceof Set) {
    let result = /* @__PURE__ */ new Set();
    seen.set(value, result);
    for (let item of value)
      result.add(normalizeForStorage(item, seen));
    return result;
  }
  let prototype = Object.getPrototypeOf(value);
  if (prototype === Object.prototype || prototype === null) {
    let result = {};
    seen.set(value, result);
    for (let key of Object.keys(value))
      result[key] = normalizeForStorage(
        value[key],
        seen
      );
    return result;
  }
  return value;
}

// ../workflows-shared/src/lib/streams.ts
var DEFAULT_STREAM_OUTPUT_CHUNK_SIZE = 256 * 1024, STREAM_OUTPUT_META_SUFFIX = "-value-stream-meta", MAX_STREAM_OUTPUT_INPUT_CHUNK_BYTES = 16 * 1024 * 1024, STREAMING_STEP_CHUNKS_TABLE = "streaming_step_chunks";
var DO_STORAGE_LIMIT = 1024 * 1024 * 1024 + 100 * 1024 * 1024, STREAM_OUTPUT_STORAGE_WRITE_HEADROOM_BYTES = 16 * 1024;
var InvalidStoredStreamOutputError = class extends Error {
  name = "InvalidStoredStreamOutputError";
};
function getStreamOutputMetaKey(cacheKey) {
  return `${cacheKey}${STREAM_OUTPUT_META_SUFFIX}`;
}
function isReadableStreamLike(value) {
  return value instanceof ReadableStream;
}
function createInvalidStepReadableStreamError() {
  return new InvalidStepReadableStreamError(
    "Step returned a ReadableStream that is already locked or otherwise unreadable. Return a fresh, unlocked ReadableStream from step.do()."
  );
}
function createOversizedStreamChunkError() {
  return new OversizedStreamChunkError(
    `Step returned a ReadableStream chunk larger than the maximum allowed size of ${MAX_STREAM_OUTPUT_INPUT_CHUNK_BYTES} bytes. Return smaller chunks from step.do().`
  );
}
function normalizeChunkToUint8Array(value) {
  if (value instanceof Uint8Array)
    return value;
  if (value instanceof ArrayBuffer)
    return new Uint8Array(value);
  if (ArrayBuffer.isView(value) && !(value instanceof DataView))
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  throw new UnsupportedStreamChunkError(
    "Step returned a ReadableStream with unsupported chunk type. Only ArrayBuffer and TypedArray chunks are supported."
  );
}
function takeBufferedBytes(bufferedChunks, byteLength) {
  let output = new Uint8Array(byteLength), offset = 0;
  for (; offset < byteLength; ) {
    let chunk = bufferedChunks[0], remaining = byteLength - offset;
    if (chunk.byteLength <= remaining) {
      output.set(chunk, offset), offset += chunk.byteLength, bufferedChunks.shift();
      continue;
    }
    output.set(chunk.subarray(0, remaining), offset), bufferedChunks[0] = chunk.subarray(remaining), offset += remaining;
  }
  return output;
}
async function* iterateStreamChunks(stream, signal) {
  if (stream.locked)
    throw createInvalidStepReadableStreamError();
  if (signal?.aborted)
    throw signal.reason ?? new DOMException("The operation was aborted.", "AbortError");
  let reader;
  try {
    reader = stream.getReader();
  } catch (error) {
    throw error instanceof TypeError ? createInvalidStepReadableStreamError() : error;
  }
  let onAbort = () => {
    reader.cancel(
      signal?.reason ?? new DOMException("The operation was aborted.", "AbortError")
    ).catch(() => {
    });
  };
  signal?.addEventListener("abort", onAbort, { once: !0 });
  let fullyRead = !1;
  try {
    for (; ; ) {
      let readResult;
      try {
        readResult = await reader.read();
      } catch (readError) {
        throw signal?.aborted ? signal.reason ?? new DOMException("The operation was aborted.", "AbortError") : new InvalidStepReadableStreamError(
          "Failed to read from step ReadableStream output. " + (readError instanceof Error ? readError.message : String(readError))
        );
      }
      if (signal?.aborted)
        throw signal.reason ?? new DOMException("The operation was aborted.", "AbortError");
      if (readResult.done) {
        fullyRead = !0;
        return;
      }
      yield normalizeChunkToUint8Array(readResult.value);
    }
  } finally {
    signal?.removeEventListener("abort", onAbort), fullyRead || await reader.cancel(
      new Error("stream output consumption stopped before completion")
    ).catch(() => {
    });
    try {
      reader.releaseLock();
    } catch {
    }
  }
}
function deleteAttemptChunks(storage, cacheKey, attempt) {
  storage.sql.exec(
    `DELETE FROM ${STREAMING_STEP_CHUNKS_TABLE} WHERE cache_key = ? AND attempt = ?`,
    cacheKey,
    attempt
  );
}
async function deleteMetaForAttempt(storage, cacheKey, attempt) {
  let metaKey = getStreamOutputMetaKey(cacheKey), maybeMeta = await storage.get(metaKey);
  maybeMeta !== void 0 && maybeMeta.attempt === attempt && await storage.delete(metaKey);
}
function getStreamOutputChunkSummary(storage, cacheKey, attempt) {
  let row = storage.sql.exec(
    [
      "SELECT",
      "  COUNT(*) AS chunkCount,",
      "  MIN(chunk_index) AS minChunkIndex,",
      "  MAX(chunk_index) AS maxChunkIndex,",
      "  CAST(COALESCE(SUM(LENGTH(chunk)), 0) AS INTEGER) AS totalBytes",
      `FROM ${STREAMING_STEP_CHUNKS_TABLE}`,
      "WHERE cache_key = ? AND attempt = ?"
    ].join(`
`),
    cacheKey,
    attempt
  ).one();
  if (row === null)
    throw new Error("Expected stream chunk summary query to return a row");
  return row;
}
function getInvalidStoredStreamOutputError(storage, cacheKey, meta) {
  let summary = getStreamOutputChunkSummary(storage, cacheKey, meta.attempt);
  if (meta.chunkCount === 0) {
    if (summary.chunkCount === 0 && summary.totalBytes === 0 && summary.minChunkIndex === null && summary.maxChunkIndex === null)
      return;
  } else if (summary.chunkCount === meta.chunkCount && summary.minChunkIndex === 0 && summary.maxChunkIndex === meta.chunkCount - 1 && summary.totalBytes === meta.totalBytes)
    return;
  return new InvalidStoredStreamOutputError(
    `Stored streamed step output is corrupt or incomplete for cache key ${cacheKey}. Expected ${meta.chunkCount} chunks / ${meta.totalBytes} bytes, found ${summary.chunkCount} chunks / ${summary.totalBytes} bytes with chunk index range ${summary.minChunkIndex ?? "null"}..${summary.maxChunkIndex ?? "null"}.`
  );
}
function readStreamOutputPreviewBytes(options) {
  let { storage, cacheKey, attempt, maxBytes } = options, cursor = storage.sql.exec(
    `SELECT chunk_index, chunk FROM ${STREAMING_STEP_CHUNKS_TABLE} WHERE cache_key = ? AND attempt = ? ORDER BY chunk_index`,
    cacheKey,
    attempt
  ), previewChunks = [], expectedChunkIndex = 0, totalBytes = 0;
  for (; totalBytes < maxBytes; ) {
    let row = cursor.next();
    if (row.done)
      break;
    if (row.value.chunk_index !== expectedChunkIndex)
      throw new InvalidStoredStreamOutputError(
        `Missing chunk ${expectedChunkIndex} for streamed step output`
      );
    if (!(row.value.chunk instanceof ArrayBuffer))
      throw new InvalidStoredStreamOutputError(
        "Invalid chunk type returned from streaming_step_chunks table"
      );
    let chunkBytes = new Uint8Array(row.value.chunk), remainingBytes = maxBytes - totalBytes, previewChunk = chunkBytes.byteLength > remainingBytes ? chunkBytes.subarray(0, remainingBytes) : chunkBytes;
    previewChunks.push(previewChunk), totalBytes += previewChunk.byteLength, expectedChunkIndex++;
  }
  return takeBufferedBytes(previewChunks, totalBytes);
}
function getStoredStreamOutputPreview(options) {
  let { storage, cacheKey, meta, maxChars } = options;
  if (meta.state !== "complete" /* Complete */)
    throw new Error(
      "Cannot preview streamed step output before it is complete"
    );
  let maxPreviewBytes = maxChars * 4, previewBytes = readStreamOutputPreviewBytes({
    storage,
    cacheKey,
    attempt: meta.attempt,
    maxBytes: maxPreviewBytes
  }), previewTruncatedByBytes = meta.totalBytes > previewBytes.byteLength;
  try {
    let decoded = new TextDecoder("utf-8", {
      fatal: !0,
      ignoreBOM: !1
    }).decode(previewBytes, { stream: previewTruncatedByBytes }), previewOutput = decoded.substring(0, maxChars);
    return decoded.length > maxChars || previewTruncatedByBytes ? { type: "text", output: previewOutput + "[truncated output]" } : { type: "text", output: previewOutput };
  } catch {
    return { type: "binary" };
  }
}
async function cleanupPendingStreamOutput(storage, cacheKey) {
  let metaKey = getStreamOutputMetaKey(cacheKey), maybeMeta = await storage.get(metaKey);
  maybeMeta !== void 0 && maybeMeta.state !== "complete" /* Complete */ && await rollbackStreamOutput(storage, cacheKey, maybeMeta.attempt);
}
async function rollbackStreamOutput(storage, cacheKey, attempt) {
  deleteAttemptChunks(storage, cacheKey, attempt), await deleteMetaForAttempt(storage, cacheKey, attempt);
}
async function doWriteStreamOutput(options) {
  let { storage, cacheKey, attempt, stream, signal, skipMetaWrite } = options, chunkSizeBytes = options.chunkSizeBytes ?? DEFAULT_STREAM_OUTPUT_CHUNK_SIZE, metaKey = getStreamOutputMetaKey(cacheKey), maybeInvalidState = (additionalBytes = 0) => {
    if (signal?.aborted)
      return signal.reason ?? new DOMException("The operation was aborted.", "AbortError");
    if (storage.sql.databaseSize + additionalBytes + STREAM_OUTPUT_STORAGE_WRITE_HEADROOM_BYTES > DO_STORAGE_LIMIT)
      return new StreamOutputStorageLimitError(
        "The instance has exceeded the 1GiB storage limit"
      );
  }, initialInvalidState = maybeInvalidState();
  if (initialInvalidState !== void 0)
    throw initialInvalidState;
  let startedAt = Date.now();
  skipMetaWrite || await storage.put(metaKey, {
    version: 1,
    state: "pending" /* Pending */,
    attempt,
    startedAt,
    chunkCount: 0,
    totalBytes: 0,
    committedAt: null
  });
  let chunkCount = 0, totalBytes = 0, bufferedChunks = [], bufferedBytes = 0, outputCommitted = !1, flushChunk = async (bytes) => {
    let invalidState = maybeInvalidState(bytes.byteLength);
    if (invalidState !== void 0)
      throw invalidState;
    storage.sql.exec(
      `INSERT INTO ${STREAMING_STEP_CHUNKS_TABLE} (cache_key, attempt, chunk_index, chunk) VALUES (?, ?, ?, ?)`,
      cacheKey,
      attempt,
      chunkCount,
      bytes
    ), totalBytes += bytes.byteLength, chunkCount++;
  };
  try {
    for await (let bytes of iterateStreamChunks(stream, signal))
      if (bytes.byteLength !== 0) {
        if (bytes.byteLength > MAX_STREAM_OUTPUT_INPUT_CHUNK_BYTES)
          throw createOversizedStreamChunkError();
        for (bufferedChunks.push(bytes), bufferedBytes += bytes.byteLength; bufferedBytes >= chunkSizeBytes; ) {
          let chunk = takeBufferedBytes(bufferedChunks, chunkSizeBytes);
          bufferedBytes -= chunk.byteLength, await flushChunk(chunk);
        }
      }
    bufferedBytes > 0 && (await flushChunk(takeBufferedBytes(bufferedChunks, bufferedBytes)), bufferedBytes = 0);
    let meta = {
      version: 1,
      state: "complete" /* Complete */,
      attempt,
      startedAt,
      chunkCount,
      totalBytes,
      committedAt: Date.now()
    }, invalidState = maybeInvalidState();
    if (invalidState !== void 0)
      throw invalidState;
    return skipMetaWrite || (await storage.put(metaKey, {
      version: 1,
      state: "committing" /* Committing */,
      attempt,
      startedAt,
      chunkCount,
      totalBytes,
      committedAt: null
    }), await storage.put(metaKey, meta)), outputCommitted = !0, meta;
  } catch (error) {
    throw outputCommitted || await rollbackStreamOutput(storage, cacheKey, attempt), error;
  }
}
async function writeStreamOutput(options) {
  let { storage, cacheKey, attempt, timeoutTask, ...writeOptions } = options, writeTask = doWriteStreamOutput({
    storage,
    cacheKey,
    attempt,
    ...writeOptions
  });
  if (timeoutTask === void 0)
    return writeTask;
  try {
    return await Promise.race([writeTask, timeoutTask]);
  } catch (error) {
    if (error instanceof WorkflowTimeoutError) {
      if (options.skipMetaWrite)
        throw writeTask.catch(() => {
        }), error;
      let maybeMeta = await storage.get(
        getStreamOutputMetaKey(cacheKey)
      );
      if (maybeMeta?.attempt === attempt && (maybeMeta.state === "committing" /* Committing */ || maybeMeta.state === "complete" /* Complete */))
        return await writeTask;
      throw writeTask.catch(() => {
      }), error;
    }
    throw error;
  }
}
function createReplayReadableStream(options) {
  let { storage, cacheKey, meta } = options;
  if (meta.state !== "complete" /* Complete */)
    throw new Error("Cannot replay streamed step output before it is complete");
  let chunkCursor = storage.sql.exec(
    `SELECT chunk_index, chunk FROM ${STREAMING_STEP_CHUNKS_TABLE} WHERE cache_key = ? AND attempt = ? ORDER BY chunk_index`,
    cacheKey,
    meta.attempt
  ), index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index >= meta.chunkCount) {
        controller.close();
        return;
      }
      let row = chunkCursor.next();
      if (row.done) {
        controller.error(
          new Error(`Missing chunk ${index} for streamed step output`)
        );
        return;
      }
      if (row.value.chunk_index !== index) {
        controller.error(
          new Error(`Missing chunk ${index} for streamed step output`)
        );
        return;
      }
      if (!(row.value.chunk instanceof ArrayBuffer)) {
        controller.error(
          new Error(
            "Invalid chunk type returned from streaming_step_chunks table"
          )
        );
        return;
      }
      controller.enqueue(new Uint8Array(row.value.chunk)), index++;
    }
  });
}

// ../workflows-shared/src/modifier.ts
import { RpcTarget } from "cloudflare:workers";
var MODIFIER_KEYS = {
  REPLACE_RESULT: "replace-result-",
  MOCK_STEP_ERROR: "mock-step-error-",
  MOCK_EVENT: "mock-event-",
  FORCE_STEP_TIMEOUT: "force-step-timeout-",
  FORCE_EVENT_TIMEOUT: "force-event-timeout-",
  FAILURE_INDEX: "failure-index-",
  DISABLE_SLEEP: "disable-sleep-",
  DISABLE_ALL_SLEEPS: "disableAllSleeps",
  DISABLE_RETRY_DELAY: "disable-retry-delay-",
  DISABLE_ALL_RETRY_DELAYS: "disableAllRetryDelays"
};
var WorkflowInstanceModifier = class extends RpcTarget {
  #engine;
  #state;
  constructor(engine, state) {
    super(), this.#engine = engine, this.#state = state;
  }
  async #getWaitForEventCacheKey(step) {
    let count = 1;
    step.index && (count = step.index);
    let name = `${step.name}-${count}`;
    return `${`${await computeHash(name)}-${count}`}-value`;
  }
  async #getBaseCacheKey(step) {
    let hash = await computeHash(step.name), count = 1;
    return step.index && (count = step.index), `${hash}-${count}`;
  }
  async #getStepCacheKey(step) {
    return `${await this.#getBaseCacheKey(step)}-value`;
  }
  #getAndIncrementCounter = async (valueKey, by) => {
    let counterKey = `${MODIFIER_KEYS.FAILURE_INDEX}${valueKey}`, next = await this.#state.storage.get(counterKey) ?? 1;
    return await this.#state.storage.put(counterKey, next + by), next;
  };
  async #getSleepStepDisableKey(step) {
    let count = 1;
    step.index && (count = step.index);
    let sleepNameCountHash = await computeHash(step.name + count);
    return `${MODIFIER_KEYS.DISABLE_SLEEP}${sleepNameCountHash}`;
  }
  async disableSleeps(steps) {
    if (!steps)
      await this.#state.storage.put(MODIFIER_KEYS.DISABLE_ALL_SLEEPS, !0);
    else
      for (let step of steps) {
        let sleepDisableKey = await this.#getSleepStepDisableKey(step);
        await this.#state.storage.put(sleepDisableKey, !0);
      }
  }
  async disableRetryDelays(steps) {
    if (!steps)
      await this.#state.storage.put(
        MODIFIER_KEYS.DISABLE_ALL_RETRY_DELAYS,
        !0
      );
    else
      for (let step of steps) {
        let valueKey = await this.#getStepCacheKey(step);
        await this.#state.storage.put(
          `${MODIFIER_KEYS.DISABLE_RETRY_DELAY}${valueKey}`,
          !0
        );
      }
  }
  // step.do() flow: It first checks if a result or error is already in the cache and, if so, returns it immediately.
  // If nothing is in the cache, it checks for remaining attempts and runs the user's code against the defined timeout.
  // Since `step.do()` performs this initial cache check, directly changing the `valueKey` would cause it to
  // assume the value was pre-cached, preventing it from writing any logs about the step's execution state.
  // Storing the value under a separate key is crucial because it ensures all execution logs for the step are
  // generated, rather than the step being skipped due to a premature cache hit.
  async mockStepResult(step, stepResult) {
    let valueKey = await this.#getStepCacheKey(step);
    if (await this.#state.storage.get(
      `${MODIFIER_KEYS.REPLACE_RESULT}${valueKey}`
    ))
      throw new Error(
        `[WorkflowIntrospector] Trying to mock step '${step.name}' multiple times!`
      );
    if (isReadableStreamLike(stepResult)) {
      let baseCacheKey = await this.#getBaseCacheKey(step), streamMeta = await writeStreamOutput({
        storage: this.#state.storage,
        cacheKey: baseCacheKey,
        attempt: 0,
        stream: stepResult,
        skipMetaWrite: !0
      });
      await this.#state.storage.put(
        `${MODIFIER_KEYS.REPLACE_RESULT}${valueKey}`,
        {
          __mockStreamOutput: !0,
          cacheKey: baseCacheKey,
          meta: streamMeta
        }
      );
    } else
      await this.#state.storage.put(
        `${MODIFIER_KEYS.REPLACE_RESULT}${valueKey}`,
        stepResult
      );
  }
  // Same logic of `mockStepResult` but stores an error instead of a value.
  async mockStepError(step, error, times) {
    let valueKey = await this.#getStepCacheKey(step), serializableError = {
      name: error.name,
      message: error.message
    };
    if (await this.#state.storage.get(
      `${MODIFIER_KEYS.REPLACE_RESULT}${valueKey}`
    ))
      throw new Error(
        `[WorkflowIntrospector] Trying to mock error on step '${step.name}' after mocking its result!`
      );
    if (times) {
      let start = await this.#getAndIncrementCounter(valueKey, times), mockErrorsPuts = Array.from({ length: times }, (_, i) => {
        let attempt = start + i, mockErrorKey = `${MODIFIER_KEYS.MOCK_STEP_ERROR}${valueKey}-${attempt}`;
        return this.#state.storage.put(mockErrorKey, serializableError);
      });
      await Promise.all(mockErrorsPuts);
    } else {
      let mockErrorKey = `${MODIFIER_KEYS.MOCK_STEP_ERROR}${valueKey}`;
      await this.#state.storage.put(mockErrorKey, serializableError);
    }
  }
  async forceStepTimeout(step, times) {
    let valueKey = await this.#getStepCacheKey(step);
    if (await this.#state.storage.get(
      `${MODIFIER_KEYS.REPLACE_RESULT}${valueKey}`
    ))
      throw new Error(
        `[WorkflowIntrospector] Trying to force timeout on step '${step.name}' after mocking its result!`
      );
    if (times) {
      let start = await this.#getAndIncrementCounter(valueKey, times), forceTimeouts = Array.from({ length: times }, (_, i) => {
        let attempt = start + i, forceStepTimeoutKey = `${MODIFIER_KEYS.FORCE_STEP_TIMEOUT}${valueKey}-${attempt}`;
        return this.#state.storage.put(forceStepTimeoutKey, !0);
      });
      await Promise.all(forceTimeouts);
    } else {
      let forceStepTimeoutKey = `${MODIFIER_KEYS.FORCE_STEP_TIMEOUT}${valueKey}`;
      await this.#state.storage.put(forceStepTimeoutKey, !0);
    }
  }
  async mockEvent(event) {
    let myEvent = {
      timestamp: /* @__PURE__ */ new Date(),
      payload: event.payload,
      type: event.type
    };
    await this.#state.storage.put(
      `${MODIFIER_KEYS.MOCK_EVENT}${event.type}`,
      !0
    ), await this.#engine.receiveEvent(myEvent);
  }
  async forceEventTimeout(step) {
    let waitForEventKey = await this.#getWaitForEventCacheKey(step);
    await this.#state.storage.put(
      `${MODIFIER_KEYS.FORCE_EVENT_TIMEOUT}${waitForEventKey}`,
      !0
    );
  }
};

// ../workflows-shared/src/context.ts
var SERIALIZABLE_DELAY_MARKER = "[dynamic]", REDACTED_STEP_OUTPUT = "[REDACTED]";
function toEngineStepConfig(config) {
  let { delay, ...retries } = config.retries;
  return typeof delay == "number" || typeof delay == "string" && delay !== SERIALIZABLE_DELAY_MARKER ? { ...config, retries: { ...retries, delay } } : { ...config, retries };
}
var defaultConfig = {
  retries: {
    limit: 5,
    delay: 1e3,
    backoff: "exponential"
  },
  timeout: "10 minutes"
}, PAUSE_DATETIME = "PAUSE_DATETIME", Context = class extends RpcTarget2 {
  #engine;
  #state;
  #counters = /* @__PURE__ */ new Map();
  #lifetimeStepCounter = 0;
  #rollbackStep;
  constructor(engine, state, rollbackStep) {
    super(), this.#engine = engine, this.#state = state, this.#rollbackStep = rollbackStep;
  }
  async #checkForPendingPause() {
    if (this.#engine.timeoutHandler.isRunningStep())
      return;
    let status = await this.#engine.getStatus();
    if (status === 2 /* Paused */)
      throw new Error(ABORT_REASONS.USER_PAUSE);
    if (status === 6 /* WaitingForPause */) {
      await this.#state.storage.put(PAUSE_DATETIME, /* @__PURE__ */ new Date());
      let metadata = await this.#state.storage.get(INSTANCE_METADATA);
      throw metadata && await this.#engine.setStatus(
        metadata.accountId,
        metadata.instance.id,
        2 /* Paused */
      ), new Error(ABORT_REASONS.USER_PAUSE);
    }
  }
  #getCount(name) {
    let val = this.#counters.get(name) ?? 0;
    return val++, this.#counters.set(name, val), val;
  }
  #registerRollback(options) {
    let { cacheKey, rollbackFn, stepContext, output, rollbackConfig } = options;
    rollbackFn && this.#rollbackStep === void 0 && this.#engine.registerRollbackFn({
      cacheKey,
      fn: rollbackFn,
      stepContext,
      ..."output" in options && { output },
      ...rollbackConfig !== void 0 && { config: rollbackConfig }
    });
  }
  async do(name, ...rest) {
    let closure, stepConfig, rollbackOptions, first = rest[0];
    if (typeof first == "function")
      closure = first, stepConfig = {}, rollbackOptions = parseRollbackOptions(name, rest[1]);
    else {
      if (stepConfig = first ?? {}, closure = rest[1], typeof closure != "function") {
        let error = new WorkflowFatalError(
          `Step "${name}" requires a callback function`
        );
        throw error.isUserError = !0, error;
      }
      rollbackOptions = parseRollbackOptions(name, rest[2]);
    }
    let { rollback: rollbackFn, rollbackConfig } = rollbackOptions ?? {}, isRollback = this.#rollbackStep !== void 0;
    if (this.#engine.rollbackPhase === "rollback" && !isRollback)
      throw new WorkflowFatalError(
        "Cannot execute steps during rollback phase"
      );
    let events = isRollback ? {
      start: 18 /* ROLLBACK_STEP_START */,
      attemptStart: 19 /* ROLLBACK_ATTEMPT_START */,
      attemptSuccess: 20 /* ROLLBACK_ATTEMPT_SUCCESS */,
      attemptFailure: 21 /* ROLLBACK_ATTEMPT_FAILURE */,
      success: 22 /* ROLLBACK_STEP_SUCCESS */,
      failure: 23 /* ROLLBACK_STEP_FAILURE */
    } : {
      start: 5 /* STEP_START */,
      attemptStart: 10 /* ATTEMPT_START */,
      attemptSuccess: 11 /* ATTEMPT_SUCCESS */,
      attemptFailure: 12 /* ATTEMPT_FAILURE */,
      success: 6 /* STEP_SUCCESS */,
      failure: 7 /* STEP_FAILURE */
    };
    if (!isRollback) {
      this.#lifetimeStepCounter++;
      let stepLimit = this.#engine.stepLimit;
      if (this.#lifetimeStepCounter > stepLimit)
        throw new WorkflowFatalError(
          `The limit of ${stepLimit} steps has been reached. This limit can be changed in your worker configuration.`
        );
    }
    if (!isValidStepName(name)) {
      let error = new WorkflowFatalError(
        `Step name "${name}" exceeds max length (${MAX_STEP_NAME_LENGTH} chars) or invalid characters found`
      );
      throw error.isUserError = !0, error;
    }
    if (!isValidStepConfig(stepConfig)) {
      let error = new WorkflowFatalError(
        `Step config for "${name}" is in a invalid format. See https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/`
      );
      throw error.isUserError = !0, error;
    }
    let liveDelay = stepConfig.retries?.delay ?? DEFAULT_RETRY_DELAY_MS, config = {
      ...defaultConfig,
      ...stepConfig,
      retries: {
        ...defaultConfig.retries,
        ...stepConfig.retries,
        delay: typeof liveDelay == "function" ? SERIALIZABLE_DELAY_MARKER : liveDelay
      }
    }, cacheKey, count, stepNameWithCounter, rollbackStep = this.#rollbackStep;
    if (rollbackStep !== void 0)
      cacheKey = `${ROLLBACK_CACHE_KEY_PREFIX}${rollbackStep.cacheKey}`, count = 1, stepNameWithCounter = name;
    else {
      let hash = await computeHash(name);
      count = this.#getCount("run-" + name), cacheKey = `${hash}-${count}`, stepNameWithCounter = `${name}-${count}`;
    }
    let valueKey = `${cacheKey}-value`, streamMetaKey = getStreamOutputMetaKey(cacheKey), configKey = `${cacheKey}-config`, errorKey = `${cacheKey}-error`, stepStateKey = `${cacheKey}-metadata`, retryDelayDisableKey = `${MODIFIER_KEYS.DISABLE_RETRY_DELAY}${valueKey}`, maybeMap = await this.#state.storage.get([
      valueKey,
      streamMetaKey,
      configKey,
      errorKey,
      stepStateKey
    ]), maybeStreamMeta = maybeMap.get(streamMetaKey), cachedConfig = maybeMap.get(configKey);
    if (maybeStreamMeta?.state === "complete" /* Complete */) {
      let cachedState = maybeMap.get(stepStateKey);
      if (getInvalidStoredStreamOutputError(
        this.#state.storage,
        cacheKey,
        maybeStreamMeta
      ) !== void 0)
        throw new WorkflowInternalError(
          `Stored output for ${stepNameWithCounter} is corrupt or incomplete.`
        );
      let result2 = createReplayReadableStream({
        storage: this.#state.storage,
        cacheKey,
        meta: maybeStreamMeta
      });
      return this.#registerRollback({
        cacheKey,
        rollbackFn,
        stepContext: {
          step: { name, count },
          attempt: cachedState?.attemptedCount ?? 1,
          config: toEngineStepConfig(cachedConfig ?? config)
        },
        output: result2,
        rollbackConfig
      }), result2;
    } else maybeStreamMeta != null && await cleanupPendingStreamOutput(this.#state.storage, cacheKey).catch(
      () => {
      }
    );
    let maybeResult = maybeMap.get(valueKey);
    if (maybeResult) {
      let cachedState = maybeMap.get(stepStateKey), result2 = maybeResult.value;
      return this.#registerRollback({
        cacheKey,
        rollbackFn,
        stepContext: {
          step: { name, count },
          attempt: cachedState?.attemptedCount ?? 1,
          config: toEngineStepConfig(cachedConfig ?? config)
        },
        output: result2,
        rollbackConfig
      }), result2;
    }
    let maybeError = maybeMap.get(
      errorKey
    );
    if (maybeError) {
      let cachedState = maybeMap.get(stepStateKey);
      throw this.#registerRollback({
        cacheKey,
        rollbackFn,
        stepContext: {
          step: { name, count },
          attempt: cachedState?.attemptedCount ?? 1,
          config: toEngineStepConfig(cachedConfig ?? config)
        },
        rollbackConfig
      }), maybeError.isUserError = !0, maybeError;
    }
    if (cachedConfig === void 0 ? await this.#state.storage.put(configKey, config) : (config = cachedConfig, liveDelay = config.retries.delay === SERIALIZABLE_DELAY_MARKER ? typeof stepConfig.retries?.delay == "function" ? stepConfig.retries.delay : DEFAULT_RETRY_DELAY_MS : config.retries.delay), this.#engine.rollbackPhase === "replay" && !isRollback) {
      let cachedState = maybeMap.get(stepStateKey);
      this.#registerRollback({
        cacheKey,
        rollbackFn,
        stepContext: {
          step: { name, count },
          attempt: cachedState?.attemptedCount ?? 1,
          config: toEngineStepConfig(config)
        },
        rollbackConfig
      });
      return;
    }
    let attemptLogs = this.#engine.readLogsFromStep(cacheKey).filter(
      (val) => [
        events.attemptSuccess,
        events.attemptFailure,
        events.attemptStart
      ].includes(val.event)
    );
    if (attemptLogs.length > 0 && attemptLogs.at(-1)?.event === events.attemptStart) {
      let stepState = await this.#state.storage.get(
        stepStateKey
      ) ?? {
        attemptedCount: 1
      }, priorityQueueHash = `${cacheKey}-${stepState.attemptedCount}`, timeoutEntryPQ = this.#engine.priorityQueue.getFirst(
        (a) => a.hash === priorityQueueHash && a.type === "timeout"
      );
      timeoutEntryPQ !== void 0 && this.#engine.priorityQueue.remove(timeoutEntryPQ), this.#engine.writeLog(
        events.attemptFailure,
        cacheKey,
        stepNameWithCounter,
        {
          attempt: stepState.attemptedCount,
          error: {
            name: "WorkflowInternalError",
            message: "Attempt failed due to internal workflows error"
          }
        }
      ), await this.#state.storage.put(stepStateKey, stepState);
    }
    let doWrapper = async (doWrapperClosure) => {
      let stepState = await this.#state.storage.get(
        stepStateKey
      ) ?? {
        attemptedCount: 0
      }, forwardStepContext = () => ({
        step: { name, count },
        attempt: stepState.attemptedCount,
        config: toEngineStepConfig(config)
      });
      if (await cleanupPendingStreamOutput(this.#state.storage, cacheKey).catch(
        () => {
        }
      ), await this.#engine.timeoutHandler.acquire(this.#engine), stepState.attemptedCount == 0)
        this.#engine.writeLog(events.start, cacheKey, stepNameWithCounter, {
          config: toEngineStepConfig(config),
          ...!isRollback && rollbackFn ? { hasRollback: !0 } : {}
        });
      else {
        let priorityQueueHash = `${cacheKey}-${stepState.attemptedCount}`, retryEntryPQ = this.#engine.priorityQueue.getFirst(
          (a) => a.hash === priorityQueueHash && a.type === "retry"
        );
        if (retryEntryPQ !== void 0) {
          let disableAllRetryDelays = await this.#state.storage.get(
            MODIFIER_KEYS.DISABLE_ALL_RETRY_DELAYS
          ), disableThisRetryDelay = await this.#state.storage.get(retryDelayDisableKey), disableRetryDelay = disableAllRetryDelays || disableThisRetryDelay;
          await this.#engine.timeoutHandler.release(this.#engine), await scheduler.wait(
            disableRetryDelay ? 0 : retryEntryPQ.targetTimestamp - Date.now()
          ), await this.#engine.timeoutHandler.acquire(this.#engine), this.#engine.priorityQueue.remove({
            hash: priorityQueueHash,
            type: "retry"
          });
        }
      }
      let result2, instanceMetadata = await this.#state.storage.get(INSTANCE_METADATA);
      if (!instanceMetadata)
        throw new Error("instanceMetadata is undefined");
      let { accountId, instance } = instanceMetadata, streamResultSeen = !1, lastStreamMeta, abortController = new AbortController(), stepExecutionSignal = AbortSignal.any([
        abortController.signal,
        this.#engine.engineAbortController.signal
      ]);
      try {
        let timeoutPromise = async () => {
          let priorityQueueHash2 = `${cacheKey}-${stepState.attemptedCount}`, timeout = r(config.timeout);
          forceStepTimeout && (timeout = 0), await this.#engine.priorityQueue.add({
            hash: priorityQueueHash2,
            targetTimestamp: Date.now() + timeout,
            type: "timeout"
          }), await schedulerWait(timeout, { signal: stepExecutionSignal }), stepExecutionSignal.aborted && await new Promise(() => {
          }), await this.#engine.priorityQueue.remove({
            hash: priorityQueueHash2,
            type: "timeout"
          });
          let error = new WorkflowTimeoutError(
            `Execution timed out after ${timeout}ms`
          );
          throw abortController.abort(error), error;
        };
        this.#engine.writeLog(
          events.attemptStart,
          cacheKey,
          stepNameWithCounter,
          {
            attempt: stepState.attemptedCount + 1
          }
        ), stepState.attemptedCount++, this.#registerRollback({
          cacheKey,
          rollbackFn,
          stepContext: forwardStepContext(),
          rollbackConfig
        }), await this.#state.storage.put(stepStateKey, stepState);
        let priorityQueueHash = `${cacheKey}-${stepState.attemptedCount}`, mockErrorKey = `${MODIFIER_KEYS.MOCK_STEP_ERROR}${valueKey}`, persistentMockError = await this.#state.storage.get(mockErrorKey), transientMockError = await this.#state.storage.get(`${mockErrorKey}-${stepState.attemptedCount}`), mockErrorPayload = persistentMockError || transientMockError;
        if (mockErrorPayload) {
          let errorToThrow = new Error(mockErrorPayload.message);
          throw errorToThrow.name = mockErrorPayload.name, errorToThrow;
        }
        let replaceResult = await this.#state.storage.get(
          `${MODIFIER_KEYS.REPLACE_RESULT}${valueKey}`
        ), forceStepTimeoutKey = `${MODIFIER_KEYS.FORCE_STEP_TIMEOUT}${valueKey}`, persistentStepTimeout = await this.#state.storage.get(forceStepTimeoutKey), transientStepTimeout = await this.#state.storage.get(
          `${forceStepTimeoutKey}-${stepState.attemptedCount}`
        ), forceStepTimeout = persistentStepTimeout || transientStepTimeout, timeoutTask, persistStepResult = async (value, activeTimeoutTask) => {
          if (!isReadableStreamLike(value))
            try {
              let cloned = structuredClone(value), stored = normalizeForStorage(cloned);
              return await this.#state.storage.put(valueKey, { value: stored }), abortController.abort("step finished"), this.#engine.priorityQueue.remove({
                hash: priorityQueueHash,
                type: "timeout"
              }), cloned;
            } finally {
              value?.[Symbol.dispose]?.();
            }
          streamResultSeen = !0;
          let streamMeta = await writeStreamOutput({
            storage: this.#state.storage,
            cacheKey,
            attempt: stepState.attemptedCount,
            stream: value,
            signal: stepExecutionSignal,
            timeoutTask: activeTimeoutTask
          });
          return lastStreamMeta = streamMeta, abortController.abort("step finished"), this.#engine.priorityQueue.remove({
            hash: priorityQueueHash,
            type: "timeout"
          }), createReplayReadableStream({
            storage: this.#state.storage,
            cacheKey,
            meta: streamMeta
          });
        };
        if (forceStepTimeout)
          result2 = await timeoutPromise();
        else if (replaceResult)
          if (replaceResult && typeof replaceResult == "object" && replaceResult.__mockStreamOutput) {
            let sentinel = replaceResult;
            result2 = createReplayReadableStream({
              storage: this.#state.storage,
              cacheKey: sentinel.cacheKey,
              meta: sentinel.meta
            });
          } else
            result2 = replaceResult;
        else {
          timeoutTask = timeoutPromise();
          let callbackTask = doWrapperClosure({
            step: { name, count },
            attempt: stepState.attemptedCount,
            config: toEngineStepConfig(config)
          });
          try {
            result2 = await Promise.race([callbackTask, timeoutTask]);
          } catch (error) {
            throw callbackTask.then(async (value) => {
              try {
                isReadableStreamLike(value) && await value.cancel(error);
              } finally {
                value?.[Symbol.dispose]?.();
              }
            }).catch(() => {
            }), error;
          }
        }
        try {
          result2 = await persistStepResult(result2, timeoutTask);
        } catch (e) {
          if (abortController.abort("step errored"), this.#engine.priorityQueue.remove({
            hash: priorityQueueHash,
            type: "timeout"
          }), e instanceof WorkflowTimeoutError)
            throw e;
          if (e instanceof InvalidStepReadableStreamError || e instanceof OversizedStreamChunkError || e instanceof UnsupportedStreamChunkError) {
            this.#engine.writeLog(
              events.attemptFailure,
              cacheKey,
              stepNameWithCounter,
              {
                attempt: stepState.attemptedCount,
                error: new WorkflowFatalError(e.message)
              }
            ), this.#engine.writeLog(
              events.failure,
              cacheKey,
              stepNameWithCounter,
              {}
            ), this.#engine.writeLog(3 /* WORKFLOW_FAILURE */, null, null, {
              error: new WorkflowFatalError(
                `The execution of the Workflow instance was terminated, as the step "${name}" returned an invalid ReadableStream output. ${e.message}`
              )
            }), await this.#engine.setStatus(
              accountId,
              instance.id,
              3 /* Errored */
            ), await this.#engine.timeoutHandler.release(this.#engine), await this.#engine.abort(ABORT_REASONS.NOT_SERIALISABLE);
            return;
          }
          if (e instanceof StreamOutputStorageLimitError) {
            this.#engine.writeLog(
              events.attemptFailure,
              cacheKey,
              stepNameWithCounter,
              {
                attempt: stepState.attemptedCount,
                error: new WorkflowFatalError(e.message)
              }
            ), this.#engine.writeLog(
              events.failure,
              cacheKey,
              stepNameWithCounter,
              {}
            ), this.#engine.writeLog(3 /* WORKFLOW_FAILURE */, null, null, {
              error: new WorkflowFatalError(
                "The instance has exceeded the 1GiB storage limit"
              )
            }), await this.#engine.setStatus(
              accountId,
              instance.id,
              3 /* Errored */
            ), await this.#engine.timeoutHandler.release(this.#engine), await this.#engine.abort(ABORT_REASONS.STORAGE_LIMIT_EXCEEDED);
            return;
          }
          if (e instanceof Error && e.name === "DataCloneError")
            this.#engine.writeLog(
              events.attemptFailure,
              cacheKey,
              stepNameWithCounter,
              {
                attempt: stepState.attemptedCount,
                error: new WorkflowFatalError(
                  `Value returned from step "${name}" is not serialisable`
                )
              }
            ), this.#engine.writeLog(
              events.failure,
              cacheKey,
              stepNameWithCounter,
              {}
            ), this.#engine.writeLog(3 /* WORKFLOW_FAILURE */, null, null, {
              error: new WorkflowFatalError(
                `The execution of the Workflow instance was terminated, as the step "${name}" returned a value which is not serialisable`
              )
            }), await this.#engine.setStatus(
              accountId,
              instance.id,
              3 /* Errored */
            ), await this.#engine.timeoutHandler.release(this.#engine), await this.#engine.abort(ABORT_REASONS.NOT_SERIALISABLE);
          else throw e instanceof Error && e.message.includes("string or blob too big: SQLITE_TOOBIG") ? new WorkflowInternalError(
            `Step ${stepNameWithCounter} output is too large. Maximum allowed size is 1MiB.`
          ) : new WorkflowInternalError(
            `Storage failure for ${stepNameWithCounter} due to internal error.`
          );
          return;
        }
        this.#engine.priorityQueue.remove({
          hash: priorityQueueHash,
          type: "timeout"
        }), this.#engine.writeLog(
          events.attemptSuccess,
          cacheKey,
          stepNameWithCounter,
          {
            attempt: stepState.attemptedCount
          }
        );
      } catch (e) {
        let error = e;
        if (abortController.abort("step errored"), this.#engine.priorityQueue.remove({
          hash: `${cacheKey}-${stepState.attemptedCount}`,
          type: "timeout"
        }), streamResultSeen)
          try {
            await rollbackStreamOutput(
              this.#state.storage,
              cacheKey,
              stepState.attemptedCount
            );
          } catch {
          }
        if (e instanceof Error && (error.name === "NonRetryableError" || error.message.startsWith("NonRetryableError"))) {
          let attemptError = shouldPreserveNonRetryableError() ? new PreservedNonRetryableError(e) : new WorkflowFatalError(
            `Step threw a NonRetryableError with message "${e.message}"`
          );
          throw this.#engine.writeLog(
            events.attemptFailure,
            cacheKey,
            stepNameWithCounter,
            {
              attempt: stepState.attemptedCount,
              error: attemptError
            }
          ), this.#engine.writeLog(
            events.failure,
            cacheKey,
            stepNameWithCounter,
            !isRollback && rollbackFn ? { hasRollback: !0 } : {}
          ), this.#registerRollback({
            cacheKey,
            rollbackFn,
            stepContext: forwardStepContext(),
            rollbackConfig
          }), error;
        }
        await this.#state.storage.put(stepStateKey, stepState);
        let willRetry = stepState.attemptedCount <= config.retries.limit, priorityQueueHash = `${cacheKey}-${stepState.attemptedCount}`, retryDelayMs, delayFailure;
        if (willRetry)
          try {
            let resolvedDelay;
            if (typeof liveDelay == "function") {
              await this.#engine.priorityQueue.add({
                hash: priorityQueueHash,
                targetTimestamp: Date.now() + DEFAULT_RETRY_DELAY_MS,
                type: "retry"
              });
              let stepCtx = {
                step: { name, count },
                attempt: stepState.attemptedCount,
                config: toEngineStepConfig(config)
              };
              resolvedDelay = await invokeDelayFunction(
                liveDelay,
                { ctx: stepCtx, error },
                {
                  timeoutMs: DELAY_FUNCTION_TIMEOUT_MS,
                  wait: schedulerWait,
                  signal: this.#engine.engineAbortController.signal
                }
              );
            } else
              resolvedDelay = liveDelay;
            retryDelayMs = calcRetryDuration(config, stepState, resolvedDelay);
          } catch (delayErr) {
            if (!(delayErr instanceof DelayFunctionError))
              throw delayErr;
            this.#engine.priorityQueue.remove({
              hash: priorityQueueHash,
              type: "retry"
            });
            let userError = new NonRetryableDelayError(
              `The delay function for step "${stepNameWithCounter}" ${delayErr.message}`
            );
            userError.isUserError = !0, delayFailure = userError;
          }
        if (this.#engine.writeLog(
          events.attemptFailure,
          cacheKey,
          stepNameWithCounter,
          {
            attempt: stepState.attemptedCount,
            error: {
              name: error.name,
              message: error.message
              // TODO (WOR-79): Stacks are all incorrect over RPC and need work
              // stack: error.stack,
            },
            ...retryDelayMs !== void 0 ? { retryDelayMs } : {}
          }
        ), willRetry && delayFailure === void 0) {
          let durationMs = retryDelayMs ?? DEFAULT_RETRY_DELAY_MS, disableAllRetryDelays = await this.#state.storage.get(
            MODIFIER_KEYS.DISABLE_ALL_RETRY_DELAYS
          ), disableThisRetryDelay = await this.#state.storage.get(retryDelayDisableKey), effectiveDuration = disableAllRetryDelays || disableThisRetryDelay ? 0 : durationMs;
          typeof liveDelay != "function" && await this.#engine.priorityQueue.add({
            hash: priorityQueueHash,
            targetTimestamp: Date.now() + effectiveDuration,
            type: "retry"
          }), await this.#engine.timeoutHandler.release(this.#engine);
          {
            let retryPauseSignal = this.#engine.pauseController.signal;
            await raceAgainstAbort(
              schedulerWait(effectiveDuration, { signal: retryPauseSignal }),
              retryPauseSignal
            );
            let retryStatus = await this.#engine.getStatus();
            if (retryStatus === 2 /* Paused */ || retryStatus === 6 /* WaitingForPause */)
              throw new Error(ABORT_REASONS.USER_PAUSE);
          }
          return this.#engine.priorityQueue.remove({
            hash: priorityQueueHash,
            type: "retry"
          }), doWrapper(doWrapperClosure);
        } else {
          await this.#engine.timeoutHandler.release(this.#engine);
          try {
            await rollbackStreamOutput(
              this.#state.storage,
              cacheKey,
              stepState.attemptedCount
            );
          } catch {
          }
          this.#engine.writeLog(
            events.failure,
            cacheKey,
            stepNameWithCounter,
            !isRollback && rollbackFn ? { hasRollback: !0 } : {}
          ), this.#registerRollback({
            cacheKey,
            rollbackFn,
            stepContext: forwardStepContext(),
            rollbackConfig
          });
          let finalError = delayFailure ?? error;
          throw await this.#state.storage.put(errorKey, finalError), finalError;
        }
      }
      let redactOutput = config.sensitive === SENSITIVE_STEP_OUTPUT;
      return this.#engine.writeLog(events.success, cacheKey, stepNameWithCounter, {
        // TODO (WOR-86): Add limits, figure out serialization
        result: redactOutput ? REDACTED_STEP_OUTPUT : lastStreamMeta ? void 0 : result2,
        ...!redactOutput && lastStreamMeta && {
          streamOutput: { cacheKey, meta: lastStreamMeta }
        },
        ...!isRollback && rollbackFn ? { hasRollback: !0 } : {}
      }), this.#registerRollback({
        cacheKey,
        rollbackFn,
        stepContext: forwardStepContext(),
        output: result2,
        rollbackConfig
      }), await this.#engine.timeoutHandler.release(this.#engine), result2;
    }, result = await doWrapper(closure);
    return isRollback || await this.#checkForPendingPause(), result;
  }
  async sleep(name, duration) {
    if (this.#engine.rollbackPhase === "replay")
      return;
    typeof duration == "string" && (duration = r(duration));
    let hash = await computeHash(name + duration.toString()), count = this.#getCount("sleep-" + name + duration.toString()), cacheKey = `${hash}-${count}`, sleepNameWithCounter = `${name}-${count}`, sleepKey = `${cacheKey}-value`, sleepLogWrittenKey = `${cacheKey}-log-written`, maybeResult = await this.#state.storage.get(sleepKey), sleepNameCountHash = await computeHash(
      name + this.#getCount("sleep-" + name)
    ), disableThisSleep = await this.#state.storage.get(
      `${MODIFIER_KEYS.DISABLE_SLEEP}${sleepNameCountHash}`
    ), disableSleep = await this.#state.storage.get(
      MODIFIER_KEYS.DISABLE_ALL_SLEEPS
    ) || disableThisSleep;
    if (maybeResult != null) {
      let entryPQ = this.#engine.priorityQueue.getFirst(
        (a) => a.hash === cacheKey && a.type === "sleep"
      );
      if (entryPQ !== void 0) {
        let pauseSignal2 = this.#engine.pauseController.signal, raceResult = await raceAgainstAbort(
          schedulerWait(
            disableSleep ? 0 : entryPQ.targetTimestamp - Date.now(),
            { signal: pauseSignal2 }
          ),
          pauseSignal2
        ), statusAfterSleep2 = await this.#engine.getStatus();
        if (raceResult.aborted || statusAfterSleep2 === 2 /* Paused */ || statusAfterSleep2 === 6 /* WaitingForPause */)
          throw new Error(ABORT_REASONS.USER_PAUSE);
        this.#engine.priorityQueue.remove({ hash: cacheKey, type: "sleep" });
      }
      await this.#state.storage.get(sleepLogWrittenKey) == null && (this.#engine.writeLog(
        9 /* SLEEP_COMPLETE */,
        cacheKey,
        sleepNameWithCounter,
        {}
      ), await this.#state.storage.put(sleepLogWrittenKey, !0));
      return;
    }
    if (this.#engine.writeLog(
      8 /* SLEEP_START */,
      cacheKey,
      sleepNameWithCounter,
      {
        durationMs: duration
      }
    ), !await this.#state.storage.get(INSTANCE_METADATA))
      throw new Error("instanceMetadata is undefined");
    await this.#state.storage.put(sleepKey, !0), await this.#engine.priorityQueue.add({
      hash: cacheKey,
      targetTimestamp: Date.now() + (disableSleep ? 0 : duration),
      type: "sleep"
    });
    let pauseSignal = this.#engine.pauseController.signal;
    await raceAgainstAbort(
      schedulerWait(disableSleep ? 0 : duration, { signal: pauseSignal }),
      pauseSignal
    );
    let statusAfterSleep = await this.#engine.getStatus();
    if (statusAfterSleep === 2 /* Paused */ || statusAfterSleep === 6 /* WaitingForPause */)
      throw new Error(ABORT_REASONS.USER_PAUSE);
    this.#engine.writeLog(
      9 /* SLEEP_COMPLETE */,
      cacheKey,
      sleepNameWithCounter,
      {}
    ), await this.#state.storage.put(sleepLogWrittenKey, !0), this.#engine.priorityQueue.remove({ hash: cacheKey, type: "sleep" });
  }
  async sleepUntil(name, timestamp) {
    if (this.#engine.rollbackPhase === "replay")
      return;
    timestamp instanceof Date && (timestamp = timestamp.valueOf());
    let now = Date.now();
    if (timestamp < now)
      throw new Error(
        "You can't sleep until a time in the past, time-traveler"
      );
    return this.sleep(name, timestamp - now);
  }
  async waitForEvent(name, options) {
    if (this.#engine.rollbackPhase === "rollback")
      throw new WorkflowFatalError(
        "Cannot execute steps during rollback phase"
      );
    options.timeout || (options.timeout = "24 hours");
    let count = this.#getCount("waitForEvent-" + name), waitForEventNameWithCounter = `${name}-${count}`, cacheKey = `${await computeHash(waitForEventNameWithCounter)}-${count}`, waitForEventKey = `${cacheKey}-value`, errorKey = `${cacheKey}-error`, pendingWaiterRegistered = `${cacheKey}-pending`, timeoutError = new WorkflowTimeoutError(
      `Execution timed out after ${r(options.timeout)}ms`
    ), maybeResult = await this.#state.storage.get(waitForEventKey);
    if (this.#engine.rollbackPhase === "replay")
      return maybeResult;
    if (maybeResult)
      return await this.#state.storage.get(waitForEventKey) == null && this.#engine.writeLog(
        15 /* WAIT_COMPLETE */,
        cacheKey,
        waitForEventNameWithCounter,
        maybeResult
      ), maybeResult;
    let maybeError = await this.#state.storage.get(errorKey);
    if (maybeError)
      throw maybeError.isUserError = !0, maybeError;
    await this.#state.storage.get(
      pendingWaiterRegistered
    ) || (this.#engine.writeLog(
      14 /* WAIT_START */,
      cacheKey,
      waitForEventNameWithCounter,
      {
        event: options.type
      }
    ), await this.#state.storage.put(pendingWaiterRegistered, !0));
    let timeoutEntryPQ = this.#engine.priorityQueue.getFirst(
      (a) => a.hash === cacheKey && a.type === "timeout"
    ), forceEventTimeout = await this.#state.storage.get(
      `${MODIFIER_KEYS.FORCE_EVENT_TIMEOUT}${waitForEventKey}`
    );
    if (timeoutEntryPQ === void 0 && this.#engine.priorityQueue !== void 0 && this.#engine.priorityQueue.checkIfExistedInPast({
      hash: cacheKey,
      type: "timeout"
    }) || timeoutEntryPQ !== void 0 && timeoutEntryPQ.targetTimestamp < Date.now() || forceEventTimeout)
      throw this.#engine.writeLog(
        16 /* WAIT_TIMED_OUT */,
        cacheKey,
        waitForEventNameWithCounter,
        {
          name: timeoutError.name,
          message: timeoutError.message
        }
      ), await this.#state.storage.put(errorKey, timeoutError), timeoutError;
    let pauseSignal = this.#engine.pauseController.signal, timeoutAbortController = new AbortController(), timeoutSignal = AbortSignal.any([
      timeoutAbortController.signal,
      pauseSignal
    ]), timeoutPromise = async (timeoutToWait, addToPQ) => {
      let priorityQueueHash = cacheKey;
      addToPQ && await this.#engine.priorityQueue.add({
        hash: priorityQueueHash,
        targetTimestamp: Date.now() + timeoutToWait,
        type: "timeout"
      }), await schedulerWait(timeoutToWait, { signal: timeoutSignal }), timeoutSignal.aborted && await new Promise(() => {
      }), this.#engine.priorityQueue.remove({
        hash: priorityQueueHash,
        type: "timeout"
      });
      let error = timeoutError;
      throw error.isUserError = !0, error;
    }, eventPromise = new Promise((resolve) => {
      let eventTypeQueue = this.#engine.eventMap.get(options.type);
      if (eventTypeQueue) {
        let event = eventTypeQueue.shift();
        if (event)
          return this.#engine.eventMap.set(options.type, eventTypeQueue), resolve(event);
      }
      let callbacks = this.#engine.waiters.get(options.type) ?? [];
      callbacks.push([cacheKey, resolve]), this.#engine.waiters.set(options.type, callbacks);
    });
    try {
      let raceResult = await raceAgainstAbort(
        Promise.race([
          eventPromise,
          timeoutEntryPQ !== void 0 ? timeoutPromise(timeoutEntryPQ.targetTimestamp - Date.now(), !1) : timeoutPromise(r(options.timeout), !0)
        ]),
        pauseSignal
      ).catch(async (error) => {
        let callbacks = this.#engine.waiters.get(options.type);
        if (callbacks) {
          let idx = callbacks.findIndex(([key]) => key === cacheKey);
          idx !== -1 && callbacks.splice(idx, 1);
        }
        throw this.#engine.writeLog(
          16 /* WAIT_TIMED_OUT */,
          cacheKey,
          waitForEventNameWithCounter,
          error
        ), await this.#state.storage.put(errorKey, error), error;
      });
      if (raceResult.aborted)
        throw new Error(ABORT_REASONS.USER_PAUSE);
      let event = raceResult.value;
      return this.#engine.priorityQueue.remove({
        hash: cacheKey,
        type: "timeout"
      }), this.#engine.writeLog(
        15 /* WAIT_COMPLETE */,
        cacheKey,
        waitForEventNameWithCounter,
        event
      ), await this.#state.storage.put(waitForEventKey, event), event;
    } finally {
      timeoutAbortController.abort();
    }
  }
};

// ../workflows-shared/src/lib/gracePeriodSemaphore.ts
var ENGINE_TIMEOUT = r("5 minutes"), GracePeriodSemaphore = class {
  #counter = 0;
  callback;
  timeoutMs;
  latestGracePeriodTimestamp = void 0;
  latestGracePeriodAbortController = void 0;
  #waitingPromises = [];
  #canInitiateSteps = !0;
  #waitingSteps = [];
  constructor(callback, timeoutMs) {
    this.callback = callback, this.timeoutMs = timeoutMs;
  }
  // acquire takes engine to be the same as release
  async acquire(_engine) {
    this.#canInitiateSteps || await new Promise((resolve, reject) => {
      this.#waitingSteps.push({
        resolveCallback: resolve,
        rejectCallback: reject
      });
    }), this.#counter == 0 && (this.latestGracePeriodTimestamp = void 0, this.latestGracePeriodAbortController?.abort(), this.latestGracePeriodAbortController = void 0), this.#counter += 1;
  }
  async release(engine) {
    if (this.#counter = Math.max(this.#counter - 1, 0), this.#counter == 0) {
      this.callback(engine, this.timeoutMs);
      for (let promise of this.#waitingPromises)
        promise.resolveCallback(void 0);
      this.#waitingPromises = [];
    }
  }
  async waitUntilNothingIsRunning(type, callback) {
    if (this.#canInitiateSteps = !1, this.#counter > 0)
      try {
        await new Promise((resolve, reject) => {
          this.#waitingPromises.push({
            resolveCallback: resolve,
            rejectCallback: reject,
            type
          });
        });
      } catch {
        for (let promise of this.#waitingSteps)
          promise.resolveCallback(void 0);
        this.#waitingSteps = [], this.#canInitiateSteps = !0;
        return;
      }
    await callback();
    for (let promise of this.#waitingSteps)
      promise.resolveCallback(void 0);
    this.#waitingSteps = [], this.#canInitiateSteps = !0;
  }
  cancelWaitingPromisesByType(type) {
    let sameTypePromises = this.#waitingPromises.filter(
      (val) => val.type === type
    );
    if (sameTypePromises.length !== 0) {
      for (let promise of sameTypePromises)
        promise.rejectCallback();
      this.#waitingPromises = this.#waitingPromises.filter(
        (val) => val.type !== type
      ), this.#canInitiateSteps = !0;
      for (let promise of this.#waitingSteps)
        promise.resolveCallback(void 0);
      this.#waitingSteps = [];
    }
  }
  dispose() {
    this.latestGracePeriodTimestamp = void 0, this.latestGracePeriodAbortController?.abort(), this.latestGracePeriodAbortController = void 0;
    for (let promise of this.#waitingSteps)
      promise.rejectCallback();
    this.#waitingSteps = [];
    for (let promise of this.#waitingPromises)
      promise.rejectCallback();
    this.#waitingPromises = [], this.#canInitiateSteps = !1;
  }
  isRunningStep() {
    return this.#counter > 0;
  }
}, startGracePeriod = async (engine, timeoutMs) => {
  let semaphore = engine.timeoutHandler;
  (async () => {
    let thisTimestamp = (/* @__PURE__ */ new Date()).valueOf();
    if (!(semaphore.latestGracePeriodTimestamp === void 0 || semaphore.latestGracePeriodTimestamp < thisTimestamp))
      throw new Error(
        "Can't start grace period since there is already an active one started on " + semaphore.latestGracePeriodTimestamp
      );
    semaphore.latestGracePeriodAbortController?.abort();
    let abortController = new AbortController();
    semaphore.latestGracePeriodAbortController = abortController, semaphore.latestGracePeriodTimestamp = thisTimestamp;
    let abortSignal = engine.engineAbortController?.signal ? AbortSignal.any([
      abortController.signal,
      engine.engineAbortController.signal
    ]) : abortController.signal;
    await schedulerWait(timeoutMs, { signal: abortSignal }), !(abortSignal.aborted || thisTimestamp !== semaphore.latestGracePeriodTimestamp || engine.timeoutHandler.isRunningStep()) && await engine.priorityQueue?.handleNextAlarm();
  })().catch(() => {
  });
};

// ../workflows-shared/src/lib/restart.ts
var EVENT_MAP_PREFIX = "EVENT_MAP", RESTART_FROM_STEP_KEY = "RESTART_FROM_STEP", KV_STEP_SUFFIXES = [
  "-value",
  "-error",
  "-config",
  "-metadata",
  "-log-written",
  "-pending",
  "-value-stream-meta"
];
function resolveGroupKeysToWipe(sql, param) {
  let targetEvent = {
    do: 5 /* STEP_START */,
    sleep: 8 /* SLEEP_START */,
    waitForEvent: 14 /* WAIT_START */
  }[param.type ?? "do"], targetCount = param.count ?? 1, cursor = sql.exec(
    "SELECT event, target, groupKey FROM states WHERE event IN (?, ?, ?) ORDER BY id",
    5 /* STEP_START */,
    8 /* SLEEP_START */,
    14 /* WAIT_START */
  ), nameOccurrence = 0, found = !1, groupKeys = /* @__PURE__ */ new Set();
  for (let row of cursor) {
    if (row.groupKey === null)
      continue;
    let groupKey = String(row.groupKey);
    if (found) {
      groupKeys.add(groupKey);
      continue;
    }
    row.target === null || String(row.target).replace(/-\d+$/, "") !== param.name || row.event === targetEvent && (nameOccurrence++, nameOccurrence === targetCount && (found = !0, groupKeys.add(groupKey)));
  }
  return found ? groupKeys : null;
}
function getMockedEventMapKeys(allKeys) {
  let mockEventTypes = /* @__PURE__ */ new Set();
  for (let key of allKeys.keys())
    key.startsWith(MODIFIER_KEYS.MOCK_EVENT) && mockEventTypes.add(key.slice(MODIFIER_KEYS.MOCK_EVENT.length));
  if (mockEventTypes.size === 0)
    return /* @__PURE__ */ new Set();
  let preserved = /* @__PURE__ */ new Set();
  for (let key of allKeys.keys())
    if (key.startsWith(`${EVENT_MAP_PREFIX}
`)) {
      let eventType = key.split(`
`)[1];
      eventType !== void 0 && mockEventTypes.has(eventType) && preserved.add(key);
    }
  return preserved;
}
async function deleteGroupKeyBatch(storage, batch) {
  let kvKeys = [];
  for (let groupKey of batch) {
    for (let suffix of KV_STEP_SUFFIXES)
      kvKeys.push(`${groupKey}${suffix}`);
    storage.sql.exec("DELETE FROM states WHERE groupKey = ?", groupKey), storage.sql.exec(
      "DELETE FROM streaming_step_chunks WHERE attempt != 0 AND cache_key = ?",
      groupKey
    );
  }
  await storage.delete(kvKeys);
}
async function wipeRestartState(storage, engineStatusKey, pauseDatetimeKey, groupKeysToWipe) {
  if (groupKeysToWipe)
    await deleteGroupKeyBatch(storage, Array.from(groupKeysToWipe)), storage.sql.exec(
      "DELETE FROM states WHERE groupKey IS NULL AND event NOT IN (?, ?)",
      1 /* WORKFLOW_START */,
      0 /* WORKFLOW_QUEUED */
    );
  else {
    let allGroupKeys = [...storage.sql.exec(
      "SELECT DISTINCT groupKey FROM states WHERE groupKey IS NOT NULL"
    )].map((r2) => r2.groupKey);
    allGroupKeys.length > 0 && await deleteGroupKeyBatch(storage, allGroupKeys), storage.sql.exec("DELETE FROM states");
  }
  let keysToDelete = [engineStatusKey, pauseDatetimeKey], allKeys = await storage.list(), preservedEventMapKeys = getMockedEventMapKeys(allKeys);
  for (let key of allKeys.keys())
    key.startsWith(`${EVENT_MAP_PREFIX}
`) && !preservedEventMapKeys.has(key) && keysToDelete.push(key);
  await storage.delete(keysToDelete), storage.sql.exec("DELETE FROM priority_queue");
}
async function readAndClearRestartFromStep(storage) {
  let value = await storage.get(RESTART_FROM_STEP_KEY);
  return await storage.delete(RESTART_FROM_STEP_KEY), value;
}
async function storeRestartFromStep(storage, from) {
  await storage.put(RESTART_FROM_STEP_KEY, from);
}

// ../workflows-shared/src/lib/timePriorityQueue.ts
var import_heap_js = __toESM(require_heap_js_umd()), wakerPriorityEntryComparator = (a, b) => a.targetTimestamp - b.targetTimestamp;
var TimePriorityQueue = class {
  #heap = new import_heap_js.default(wakerPriorityEntryComparator);
  #ctx;
  constructor(ctx, _instanceMetadata) {
    this.#ctx = ctx, this.#heap.init(this.getEntries());
  }
  popPastEntries() {
    if (this.#heap.length === 0)
      return;
    let res = [], currentTimestamp = (/* @__PURE__ */ new Date()).valueOf();
    for (; ; ) {
      let element = this.#heap.peek();
      if (element === void 0 || element.targetTimestamp > currentTimestamp)
        break;
      res.push(element), this.#heap.pop();
    }
    return this.#ctx.storage.transactionSync(() => {
      for (let entry of res)
        this.removeEntryDB(entry);
    }), res;
  }
  /**
   * `add` is ran using a transaction so it's race condition free, if it's ran atomically
   * @param entry
   */
  async add(entry) {
    await this.#ctx.storage.transaction(async () => {
      this.#heap.add(entry), this.addEntryDB(entry);
    });
  }
  /**
   * `remove` is ran using a transaction so it's race condition free, if it's ran atomically
   * @param entry
   */
  remove(entry) {
    this.#ctx.storage.transactionSync(() => {
      this.removeFirst((e) => e.hash === entry.hash && e.type === entry.type);
    });
  }
  offsetAll(offset) {
    this.#ctx.storage.transactionSync(() => {
      let entries = this.#heap.toArray();
      this.#ctx.storage.sql.exec("DELETE FROM priority_queue");
      let newEntries = entries.map((value) => ({
        ...value,
        targetTimestamp: value.targetTimestamp + offset
      }));
      for (let entry of newEntries)
        this.addEntryDB(entry);
      this.#heap = new import_heap_js.default(wakerPriorityEntryComparator), this.#heap.init(newEntries);
    });
  }
  popTypeAll(entryType) {
    this.#ctx.storage.transactionSync(() => {
      this.filter((e) => e.type !== entryType);
    });
  }
  // Idempotent, perhaps name should suggest so
  async handleNextAlarm() {
    this.#heap.peek();
  }
  getFirst(callbackFn) {
    return structuredClone(this.#heap.toArray().find(callbackFn));
  }
  removeFirst(callbackFn) {
    let elements = this.#heap.toArray(), index = elements.findIndex(callbackFn);
    if (index === -1)
      return;
    let removedEntry = elements.splice(index, 1)[0];
    this.removeEntryDB(removedEntry), this.#heap = new import_heap_js.default(wakerPriorityEntryComparator), this.#heap.init(elements);
  }
  filter(callbackFn) {
    let filteredElements = this.#heap.toArray().filter(callbackFn), removedElements = this.#heap.toArray().filter((a) => !callbackFn(a));
    this.#ctx.storage.transactionSync(() => {
      for (let entry of removedElements)
        this.removeEntryDB(entry);
    }), this.#heap = new import_heap_js.default(wakerPriorityEntryComparator), this.#heap.init(filteredElements);
  }
  length() {
    return this.#heap.length;
  }
  getEntries() {
    let entries = [
      ...this.#ctx.storage.sql.exec("SELECT * FROM priority_queue ORDER BY id")
    ], activeEntries = [];
    return entries.forEach((val) => {
      let entryType = toWakerPriorityType(val.entryType);
      if (val.action == 0) {
        let index = activeEntries.findIndex(
          (activeVal) => val.hash == activeVal.hash && entryType == activeVal.type
        );
        index !== -1 && activeEntries.splice(index, 1);
      } else
        activeEntries.findIndex(
          (activeVal) => val.hash == activeVal.hash && entryType == activeVal.type
        ) === -1 && activeEntries.push({
          hash: val.hash,
          targetTimestamp: val.target_timestamp,
          type: entryType
        });
    }), activeEntries;
  }
  removeEntryDB(entry) {
    this.#ctx.storage.sql.exec(
      `
			INSERT INTO priority_queue (target_timestamp, action, entryType, hash)
			VALUES (?, ?, ? ,?)
			`,
      entry.targetTimestamp,
      0 /* FALSE */,
      fromWakerPriorityType(entry.type),
      entry.hash
    );
  }
  checkIfExistedInPast(entry) {
    return this.#ctx.storage.sql.exec(
      "SELECT * FROM priority_queue WHERE entryType = ? AND hash = ? AND action = ?",
      fromWakerPriorityType(entry.type),
      entry.hash,
      0
    ).toArray().length >= 1;
  }
  addEntryDB(entry) {
    this.#ctx.storage.sql.exec(
      `
			INSERT INTO priority_queue (target_timestamp, action, entryType, hash)
			VALUES (?, ?, ? ,?)
			`,
      entry.targetTimestamp,
      1 /* TRUE */,
      fromWakerPriorityType(entry.type),
      entry.hash
    );
  }
}, toWakerPriorityType = (entryType) => {
  switch (entryType) {
    case 0 /* RETRY */:
      return "retry";
    case 1 /* SLEEP */:
      return "sleep";
    case 2 /* TIMEOUT */:
      return "timeout";
  }
}, fromWakerPriorityType = (entryType) => {
  switch (entryType) {
    case "retry":
      return 0 /* RETRY */;
    case "sleep":
      return 1 /* SLEEP */;
    case "timeout":
      return 2 /* TIMEOUT */;
    default:
      throw new Error(`WakerPriorityType "${entryType}" has not been handled`);
  }
};

// ../workflows-shared/src/subscription.ts
import { RpcTarget as RpcTarget3 } from "cloudflare:workers";
import { z as z2 } from "miniflare:zod";
var WorkflowSubscriptionEventCommonSchema = z2.object({
  instanceId: z2.string(),
  eventId: z2.number(),
  timestamp: z2.number()
}), StepDurationSchema = z2.custom(
  (value) => typeof value == "number" || typeof value == "string" && !Number.isNaN(r(value))
), ResolvedStepDelaySchema = z2.union([
  StepDurationSchema,
  z2.literal("[dynamic]")
]), ResolvedStepConfigSchema = z2.object({
  retries: z2.object({
    limit: z2.union([z2.number(), z2.literal(1 / 0)]),
    delay: ResolvedStepDelaySchema,
    backoff: z2.enum(["constant", "linear", "exponential"]).optional()
  }),
  timeout: StepDurationSchema,
  sensitive: z2.literal("output").optional()
});
function parseResolvedStepConfig(value) {
  let result = ResolvedStepConfigSchema.safeParse(value);
  return result.success ? result.data : void 0;
}
var WorkflowSubscriptionEventSchema = z2.discriminatedUnion("type", [
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("workflow_queued")
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("workflow_started"),
    params: z2.unknown().optional()
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("workflow_running")
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("workflow_paused")
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("workflow_waiting_for_pause")
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("workflow_waiting")
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("workflow_completed"),
    output: z2.unknown().optional()
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("workflow_errored"),
    error: z2.object({ name: z2.string(), message: z2.string() })
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("workflow_terminated")
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("step_started"),
    stepName: z2.string(),
    config: ResolvedStepConfigSchema.optional()
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("step_completed"),
    stepName: z2.string(),
    output: z2.unknown().optional()
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("step_errored"),
    stepName: z2.string()
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("attempt_started"),
    stepName: z2.string(),
    attempt: z2.number()
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("attempt_completed"),
    stepName: z2.string(),
    attempt: z2.number()
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("attempt_errored"),
    stepName: z2.string(),
    attempt: z2.number(),
    retryDelayMs: z2.number().optional(),
    error: z2.object({ name: z2.string(), message: z2.string() })
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("sleep_started"),
    stepName: z2.string(),
    durationMs: z2.number()
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("sleep_completed"),
    stepName: z2.string()
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("wait_started"),
    stepName: z2.string(),
    eventType: z2.string()
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("wait_completed"),
    stepName: z2.string()
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("wait_timed_out"),
    stepName: z2.string()
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("rollback_started")
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("rollback_step_started"),
    stepName: z2.string(),
    config: ResolvedStepConfigSchema.optional()
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("rollback_step_completed"),
    stepName: z2.string()
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("rollback_step_errored"),
    stepName: z2.string(),
    error: z2.object({ name: z2.string(), message: z2.string() })
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("rollback_attempt_started"),
    stepName: z2.string(),
    attempt: z2.number()
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("rollback_attempt_completed"),
    stepName: z2.string(),
    attempt: z2.number()
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("rollback_attempt_errored"),
    stepName: z2.string(),
    attempt: z2.number(),
    retryDelayMs: z2.number().optional(),
    error: z2.object({ name: z2.string(), message: z2.string() })
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("rollback_completed")
  }),
  WorkflowSubscriptionEventCommonSchema.extend({
    type: z2.literal("rollback_errored")
  })
]), workflowSubscriptionEventTypeNames = new Set(
  WorkflowSubscriptionEventSchema.options.map(
    (option) => option.shape.type.value
  )
), WorkflowSubscriptionEventTypeSchema = z2.custom(
  (value) => typeof value == "string" && workflowSubscriptionEventTypeNames.has(
    value
  )
), WORKFLOW_SUBSCRIPTION_OPTIONS_SCHEMA = z2.object({
  cursor: z2.number().int().nonnegative().optional(),
  filter: z2.array(WorkflowSubscriptionEventTypeSchema).optional()
}).strict();
function parseWorkflowSubscriptionOptions(options) {
  if (options === void 0)
    return {};
  let parsed = WORKFLOW_SUBSCRIPTION_OPTIONS_SCHEMA.safeParse(options);
  if (!parsed.success)
    throw new Error("Invalid Workflow subscription options");
  return parsed.data;
}
function isTerminalEvent(event) {
  return event.type === "workflow_completed" || event.type === "workflow_errored" || event.type === "workflow_terminated";
}
var WorkflowSubscriptionTarget = class extends RpcTarget3 {
  #nextEvent;
  #onClose;
  #nextRequest = Promise.resolve(void 0);
  #closed = !1;
  constructor(nextEvent, onClose) {
    super(), this.#nextEvent = nextEvent, this.#onClose = onClose;
  }
  async next() {
    if (this.#closed)
      return { done: !0, value: void 0 };
    let request = this.#nextRequest.then(async () => {
      if (this.#closed)
        return { done: !0, value: void 0 };
      try {
        let result = await this.#nextEvent();
        return this.#closed ? { done: !0, value: void 0 } : ((result.done || isTerminalEvent(result.value)) && this.#finish(), result);
      } catch (error) {
        throw this.#finish(), error;
      }
    });
    return this.#nextRequest = request, request;
  }
  [Symbol.dispose]() {
    this.#finish();
  }
  #finish() {
    this.#closed || (this.#closed = !0, this.#onClose());
  }
};

// ../workflows-shared/src/engine.ts
var ENGINE_STATUS_KEY = "ENGINE_STATUS", WORKFLOW_OUTPUT_KEY = "WORKFLOW_OUTPUT", EVENT_MAP_PREFIX2 = "EVENT_MAP", DEFAULT_STEP_LIMIT = 1e4, PAUSE_DATETIME2 = "PAUSE_DATETIME";
function binaryReplacer(_key, value) {
  return typeof value == "bigint" ? `[BigInt(${value})]` : value instanceof ArrayBuffer ? `[ArrayBuffer(${value.byteLength} bytes)]` : ArrayBuffer.isView(value) && !(value instanceof DataView) ? `[${value.constructor.name}(${value.byteLength} bytes)]` : value;
}
function isStepSuccessEvent(event) {
  return event === 6 /* STEP_SUCCESS */ || event === 22 /* ROLLBACK_STEP_SUCCESS */;
}
async function readStepConfig(storage, groupKey) {
  if (groupKey !== null)
    return parseResolvedStepConfig(await storage.get(`${groupKey}-config`));
}
async function readStepCompletedOutput(storage, groupKey) {
  if (groupKey === null)
    return;
  let valueKey = `${groupKey}-value`, streamMetaKey = getStreamOutputMetaKey(groupKey), configKey = `${groupKey}-config`, stored = await storage.get([valueKey, streamMetaKey, configKey]), config = parseResolvedStepConfig(stored.get(configKey));
  if (config === void 0)
    return;
  if (config.sensitive === "output")
    return REDACTED_STEP_OUTPUT;
  let streamMeta = stored.get(streamMetaKey);
  if (streamMeta?.state === "complete" /* Complete */) {
    if (getInvalidStoredStreamOutputError(
      storage,
      groupKey,
      streamMeta
    ) !== void 0)
      throw createWorkflowError(
        "Step has completed but its stored stream output is corrupt or incomplete",
        "instance.step_output_corrupt"
      );
    return createReplayReadableStream({
      storage,
      cacheKey: groupKey,
      meta: streamMeta
    });
  }
  return stored.get(valueKey)?.value;
}
async function buildWorkflowSubscriptionEvent(storage, log, instanceId, params) {
  let common = {
    instanceId,
    eventId: log.id,
    timestamp: new Date(log.timestamp).valueOf()
  }, parseMetadata = () => JSON.parse(log.metadata), stepEvent = (createEvent) => log.target === null ? { ...common, type: "internal" } : createEvent(log.target);
  switch (log.event) {
    case 0 /* WORKFLOW_QUEUED */:
      return { ...common, type: "workflow_queued" };
    case 1 /* WORKFLOW_START */:
      return { ...common, type: "workflow_started", params };
    case 26 /* WORKFLOW_RUNNING */:
      return { ...common, type: "workflow_running" };
    case 27 /* WORKFLOW_PAUSED */:
      return { ...common, type: "workflow_paused" };
    case 28 /* WORKFLOW_WAITING_FOR_PAUSE */:
      return { ...common, type: "workflow_waiting_for_pause" };
    case 29 /* WORKFLOW_WAITING */:
      return { ...common, type: "workflow_waiting" };
    case 2 /* WORKFLOW_SUCCESS */: {
      let storedOutput = await storage.get(
        WORKFLOW_OUTPUT_KEY
      );
      return {
        ...common,
        type: "workflow_completed",
        output: storedOutput === void 0 ? parseMetadata().result : storedOutput.value
      };
    }
    case 3 /* WORKFLOW_FAILURE */:
      return {
        ...common,
        type: "workflow_errored",
        error: parseMetadata().error
      };
    case 4 /* WORKFLOW_TERMINATED */:
      return { ...common, type: "workflow_terminated" };
    case 5 /* STEP_START */: {
      let config = await readStepConfig(storage, log.groupKey);
      return stepEvent((stepName) => ({
        ...common,
        type: "step_started",
        stepName,
        ...config === void 0 ? {} : { config }
      }));
    }
    case 6 /* STEP_SUCCESS */: {
      let output = await readStepCompletedOutput(storage, log.groupKey);
      return stepEvent((stepName) => ({
        ...common,
        type: "step_completed",
        stepName,
        ...output === void 0 ? {} : { output }
      }));
    }
    case 7 /* STEP_FAILURE */:
      return stepEvent((stepName) => ({
        ...common,
        type: "step_errored",
        stepName
      }));
    case 10 /* ATTEMPT_START */:
      return stepEvent((stepName) => ({
        ...common,
        type: "attempt_started",
        stepName,
        attempt: parseMetadata().attempt
      }));
    case 11 /* ATTEMPT_SUCCESS */:
      return stepEvent((stepName) => ({
        ...common,
        type: "attempt_completed",
        stepName,
        attempt: parseMetadata().attempt
      }));
    case 12 /* ATTEMPT_FAILURE */: {
      let metadata = parseMetadata();
      return stepEvent((stepName) => ({
        ...common,
        type: "attempt_errored",
        stepName,
        attempt: metadata.attempt,
        error: metadata.error,
        ...metadata.retryDelayMs === void 0 ? {} : { retryDelayMs: metadata.retryDelayMs }
      }));
    }
    case 8 /* SLEEP_START */:
      return stepEvent((stepName) => ({
        ...common,
        type: "sleep_started",
        stepName,
        durationMs: parseMetadata().durationMs
      }));
    case 9 /* SLEEP_COMPLETE */:
      return stepEvent((stepName) => ({
        ...common,
        type: "sleep_completed",
        stepName
      }));
    case 14 /* WAIT_START */:
      return stepEvent((stepName) => ({
        ...common,
        type: "wait_started",
        stepName,
        eventType: parseMetadata().event
      }));
    case 15 /* WAIT_COMPLETE */:
      return stepEvent((stepName) => ({
        ...common,
        type: "wait_completed",
        stepName
      }));
    case 16 /* WAIT_TIMED_OUT */:
      return stepEvent((stepName) => ({
        ...common,
        type: "wait_timed_out",
        stepName
      }));
    case 17 /* ROLLBACK_START */:
      return { ...common, type: "rollback_started" };
    case 18 /* ROLLBACK_STEP_START */: {
      let config = await readStepConfig(storage, log.groupKey);
      return stepEvent((stepName) => ({
        ...common,
        type: "rollback_step_started",
        stepName,
        ...config === void 0 ? {} : { config }
      }));
    }
    case 22 /* ROLLBACK_STEP_SUCCESS */:
      return stepEvent((stepName) => ({
        ...common,
        type: "rollback_step_completed",
        stepName
      }));
    case 23 /* ROLLBACK_STEP_FAILURE */:
      return stepEvent((stepName) => ({
        ...common,
        type: "rollback_step_errored",
        stepName,
        error: parseMetadata().error
      }));
    case 19 /* ROLLBACK_ATTEMPT_START */:
      return stepEvent((stepName) => ({
        ...common,
        type: "rollback_attempt_started",
        stepName,
        attempt: parseMetadata().attempt
      }));
    case 20 /* ROLLBACK_ATTEMPT_SUCCESS */:
      return stepEvent((stepName) => ({
        ...common,
        type: "rollback_attempt_completed",
        stepName,
        attempt: parseMetadata().attempt
      }));
    case 21 /* ROLLBACK_ATTEMPT_FAILURE */: {
      let metadata = parseMetadata();
      return stepEvent((stepName) => ({
        ...common,
        type: "rollback_attempt_errored",
        stepName,
        attempt: metadata.attempt,
        error: metadata.error,
        ...metadata.retryDelayMs === void 0 ? {} : { retryDelayMs: metadata.retryDelayMs }
      }));
    }
    case 24 /* ROLLBACK_COMPLETE */:
      return { ...common, type: "rollback_completed" };
    case 25 /* ROLLBACK_FAILED */:
      return { ...common, type: "rollback_errored" };
    case 13 /* __INTERNAL_PROD */:
      return { ...common, type: "internal" };
  }
}
var Engine = class extends DurableObject {
  logs = [];
  isRunning = !1;
  accountId;
  instanceId;
  workflowName;
  timeoutHandler;
  priorityQueue;
  stepLimit;
  engineAbortController = new AbortController();
  pauseController = new AbortController();
  rollbackPhase = void 0;
  rollbackEligibleCacheKeys = void 0;
  waiters = /* @__PURE__ */ new Map();
  eventMap = /* @__PURE__ */ new Map();
  // Not persisted: rollback fns are RPC stubs, dead across DO restarts.
  rollbackRegistry = /* @__PURE__ */ new Map();
  subscribers = /* @__PURE__ */ new Set();
  constructor(state, env) {
    super(state, env);
    let { workflowName } = this.ctx.props;
    this.stepLimit = (workflowName === void 0 ? void 0 : env.STEP_LIMITS?.[workflowName]) ?? (env.STEP_LIMIT ? JSON.parse(env.STEP_LIMIT) : DEFAULT_STEP_LIMIT), this.ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.transactionSync(() => {
        try {
          this.ctx.storage.sql.exec(`
						CREATE TABLE IF NOT EXISTS priority_queue (
							id INTEGER PRIMARY KEY NOT NULL,
							created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
							target_timestamp INTEGER NOT NULL,
							action INTEGER NOT NULL, -- should only be 0 or 1 (1 for added, 0 for deleted),
							entryType INTEGER NOT NULL,
							hash TEXT NOT NULL,
							CHECK (action IN (0, 1)), -- guararentee that action can only be 0 or 1
							UNIQUE (action, entryType, hash)
						);
				CREATE TABLE IF NOT EXISTS states (
					id INTEGER PRIMARY KEY NOT NULL,
					timestamp TIMESTAMP DEFAULT (DATETIME('now','subsec')),
					groupKey TEXT,
					target TEXT,
					metadata TEXT,
					event INTEGER NOT NULL
				);
				CREATE TABLE IF NOT EXISTS streaming_step_chunks (
					cache_key TEXT NOT NULL,
					attempt INTEGER NOT NULL,
					chunk_index INTEGER NOT NULL,
					chunk BLOB NOT NULL,
					PRIMARY KEY (cache_key, attempt, chunk_index)
				) WITHOUT ROWID
				`);
        } catch (e) {
          throw console.error(e), e;
        }
      });
    }), this.timeoutHandler = new GracePeriodSemaphore(
      startGracePeriod,
      ENGINE_TIMEOUT
    );
  }
  writeLog(event, group, target = null, metadata) {
    this.ctx.storage.sql.exec(
      "INSERT INTO states (event, groupKey, target, metadata) VALUES (?, ?, ?, ?)",
      event,
      group,
      target,
      JSON.stringify(metadata, binaryReplacer)
    );
    for (let subscriber of this.subscribers) {
      let waiter = subscriber.waiter;
      waiter !== void 0 && (subscriber.waiter = void 0, waiter.resolve());
    }
    group && this.handleStepResultWaiter(group, event, metadata);
  }
  readEligibleRollbackStepsDesc(limit) {
    let rollbackTerminalGroups = /* @__PURE__ */ new Set(), rollbackEligibleGroups = /* @__PURE__ */ new Set(), stepStartsDesc = [], rows = [
      ...this.ctx.storage.sql.exec(
        "SELECT event, groupKey, target, metadata FROM states WHERE groupKey IS NOT NULL ORDER BY id DESC"
      )
    ];
    for (let row of rows) {
      if (row.event === 5 /* STEP_START */ && stepStartsDesc.push({ groupKey: row.groupKey, target: row.target }), row.event === 22 /* ROLLBACK_STEP_SUCCESS */ || row.event === 23 /* ROLLBACK_STEP_FAILURE */) {
        rollbackTerminalGroups.add(
          row.groupKey.startsWith(ROLLBACK_CACHE_KEY_PREFIX) ? row.groupKey.slice(ROLLBACK_CACHE_KEY_PREFIX.length) : row.groupKey
        );
        continue;
      }
      if (!(row.event !== 5 /* STEP_START */ && row.event !== 6 /* STEP_SUCCESS */ && row.event !== 7 /* STEP_FAILURE */))
        try {
          JSON.parse(row.metadata).hasRollback === !0 && rollbackEligibleGroups.add(row.groupKey);
        } catch {
        }
    }
    let eligible = [];
    for (let { groupKey, target } of stepStartsDesc)
      if (rollbackEligibleGroups.has(groupKey) && !rollbackTerminalGroups.has(groupKey) && (eligible.push({ cacheKey: groupKey, target: target ?? groupKey }), limit !== void 0 && eligible.length >= limit))
        break;
    return eligible;
  }
  getEligibleRollbackSteps(limit) {
    return this.readEligibleRollbackStepsDesc(limit).map(
      ({ cacheKey }) => cacheKey
    );
  }
  registerRollbackFn(registration) {
    if (this.rollbackPhase === "replay" && this.rollbackEligibleCacheKeys !== void 0 && !this.rollbackEligibleCacheKeys.has(registration.cacheKey)) {
      disposeRollbackStub(registration.fn);
      return;
    }
    registerRollbackFn(this.rollbackRegistry, registration);
  }
  setRollbackPhase(phase) {
    this.rollbackPhase = phase;
  }
  // Lives here for access to the protected DurableObject `ctx`.
  createRollbackContext(rollbackStep) {
    return new Context(this, this.ctx, rollbackStep);
  }
  readLogsFromStep(_cacheKey) {
    return [];
  }
  async subscribe(options) {
    let { cursor, filter } = options ?? {}, metadata = await this.ctx.storage.get(INSTANCE_METADATA);
    if (metadata === void 0)
      throw createWorkflowError(
        "Instance does not exist",
        "instance.not_found"
      );
    let state = {
      instanceId: metadata.instance.id,
      params: metadata.event.payload,
      lastEventId: cursor ?? -1,
      filter: filter === void 0 ? void 0 : new Set(filter),
      waiter: void 0,
      closed: !1
    }, subscription = new WorkflowSubscriptionTarget(
      () => this.nextWorkflowEvent(state),
      () => {
        state.closed = !0, this.subscribers.delete(state), state.waiter?.resolve(), state.waiter = void 0;
      }
    );
    return this.subscribers.add(state), subscription;
  }
  async nextWorkflowEvent(state) {
    for (; !state.closed; ) {
      let row = this.ctx.storage.sql.exec(
        "SELECT id, timestamp, event, groupKey, target, metadata FROM states WHERE id > ? ORDER BY id ASC LIMIT 1",
        state.lastEventId
      ).toArray()[0];
      if (row === void 0) {
        if (this.ctx.storage.sql.exec(
          "SELECT id FROM states WHERE id <= ? AND event IN (?, ?, ?) LIMIT 1",
          state.lastEventId,
          2 /* WORKFLOW_SUCCESS */,
          3 /* WORKFLOW_FAILURE */,
          4 /* WORKFLOW_TERMINATED */
        ).toArray()[0] !== void 0)
          return state.closed = !0, { done: !0, value: void 0 };
        await new Promise((resolve) => {
          state.waiter = { resolve };
        });
        continue;
      }
      state.lastEventId = row.id;
      let event = await buildWorkflowSubscriptionEvent(
        this.ctx.storage,
        row,
        state.instanceId,
        state.params
      );
      if (event.type !== "internal") {
        if (state.filter === void 0 || state.filter.has(event.type))
          return { done: !1, value: event };
        if (isTerminalEvent(event))
          return { done: !0, value: void 0 };
      }
    }
    return { done: !0, value: void 0 };
  }
  readLogs() {
    return {
      logs: [
        ...this.ctx.storage.sql.exec("SELECT event, groupKey, target, metadata FROM states")
      ].map((log) => {
        let metadata = JSON.parse(log.metadata);
        if (!isStepSuccessEvent(log.event) || !metadata.streamOutput)
          return { ...log, metadata, group: log.groupKey };
        let { cacheKey, meta } = metadata.streamOutput;
        try {
          let preview = getStoredStreamOutputPreview({
            storage: this.ctx.storage,
            cacheKey,
            meta,
            maxChars: 1024
          });
          metadata.result = preview.type === "text" ? preview.output : `[ReadableStream (binary): ${meta.totalBytes} bytes]`;
        } catch {
          metadata.result = `[ReadableStream: ${meta.totalBytes} bytes]`;
        }
        return delete metadata.streamOutput, { ...log, metadata, group: log.groupKey };
      })
    };
  }
  /**
   * Returns detailed logs including timestamps, ordered by ID.
   * Used by the local explorer to reconstruct step-level detail.
   */
  readDetailedLogs() {
    return [
      ...this.ctx.storage.sql.exec(
        "SELECT id, timestamp, event, groupKey, target, metadata FROM states ORDER BY id ASC"
      )
    ].map((row) => {
      let metadata = JSON.parse(row.metadata);
      if (!isStepSuccessEvent(row.event) || !metadata.streamOutput)
        return {
          id: row.id,
          timestamp: String(row.timestamp).replace(" ", "T") + "Z",
          event: row.event,
          group: row.groupKey,
          target: row.target,
          metadata
        };
      let { cacheKey, meta } = metadata.streamOutput;
      try {
        let preview = getStoredStreamOutputPreview({
          storage: this.ctx.storage,
          cacheKey,
          meta,
          maxChars: 1024
        });
        metadata.result = preview.type === "text" ? preview.output : `[ReadableStream (binary): ${meta.totalBytes} bytes]`;
      } catch {
        metadata.result = `[ReadableStream: ${meta.totalBytes} bytes]`;
      }
      return delete metadata.streamOutput, {
        id: row.id,
        timestamp: String(row.timestamp).replace(" ", "T") + "Z",
        event: row.event,
        group: row.groupKey,
        target: row.target,
        metadata
      };
    });
  }
  readLogsFromEvent(eventType) {
    return {
      logs: [
        ...this.ctx.storage.sql.exec(
          "SELECT event, groupKey, target, metadata FROM states WHERE event = ?",
          eventType
        )
      ].map((log) => ({
        ...log,
        metadata: JSON.parse(log.metadata),
        group: log.groupKey
      }))
    };
  }
  async getStatus() {
    if (this.accountId === void 0) {
      let metadata = await this.ctx.storage.get(INSTANCE_METADATA);
      if (metadata === void 0)
        throw new Error("Engine was never started");
      this.accountId = metadata.accountId, this.instanceId = metadata.instance.id, this.workflowName = metadata.workflow.name;
    }
    let res = await this.ctx.storage.get(ENGINE_STATUS_KEY);
    return res === void 0 ? 0 /* Queued */ : res;
  }
  // Returns instance metadata for the local explorer.
  async getInstanceMetadata() {
    let status = await this.getStatus(), createdOn = (await this.ctx.storage.get(INSTANCE_METADATA))?.instance?.created_on ?? "";
    if (!createdOn) {
      let queries = [
        "SELECT timestamp AS ts FROM states ORDER BY id ASC LIMIT 1",
        "SELECT created_on AS ts FROM priority_queue ORDER BY id ASC LIMIT 1"
      ];
      for (let query of queries) {
        if (createdOn)
          break;
        try {
          for (let row of this.ctx.storage.sql.exec(query))
            row.ts && (createdOn = String(row.ts).replace(" ", "T") + "Z");
        } catch {
        }
      }
    }
    return {
      instanceId: this.instanceId ?? "",
      status,
      createdOn
    };
  }
  async setStatus(accountId, instanceId, status) {
    let previousStatus = await this.ctx.storage.get(ENGINE_STATUS_KEY);
    if (await this.ctx.storage.put(ENGINE_STATUS_KEY, status), previousStatus !== status)
      switch (status) {
        case 0 /* Queued */: {
          let hasQueuedEvent = this.ctx.storage.sql.exec(
            "SELECT id FROM states WHERE event = ? LIMIT 1",
            0 /* WORKFLOW_QUEUED */
          ).toArray()[0] !== void 0;
          previousStatus === void 0 && hasQueuedEvent || this.writeLog(0 /* WORKFLOW_QUEUED */, null, null, {});
          break;
        }
        case 1 /* Running */:
          this.writeLog(26 /* WORKFLOW_RUNNING */, null, null, {});
          break;
        case 2 /* Paused */:
          this.writeLog(27 /* WORKFLOW_PAUSED */, null, null, {});
          break;
        case 6 /* WaitingForPause */:
          this.writeLog(
            28 /* WORKFLOW_WAITING_FOR_PAUSE */,
            null,
            null,
            {}
          );
          break;
        case 7 /* Waiting */:
          this.writeLog(29 /* WORKFLOW_WAITING */, null, null, {});
          break;
      }
    this.handleStatusWaiter(status);
  }
  statusWaiters = /* @__PURE__ */ new Map();
  async waitForStatus(status) {
    let targetStatus = toInstanceStatus(status), currentStatus = await this.ctx.storage.get(ENGINE_STATUS_KEY);
    if (currentStatus !== targetStatus)
      return new Promise((resolve, reject) => {
        this.statusWaiters.set(targetStatus, { resolve, reject }), this.handleStatusWaiter(currentStatus);
      });
  }
  handleStatusWaiter(status) {
    let waiter = this.statusWaiters.get(status);
    if (waiter) {
      waiter.resolve(), this.statusWaiters.delete(status);
      return;
    }
    switch (status) {
      case 3 /* Errored */: {
        let unreachableStatuses = [
          5 /* Complete */,
          4 /* Terminated */
        ];
        this.rejectUnreachableStatus(status, unreachableStatuses);
        break;
      }
      case 4 /* Terminated */: {
        let unreachableStatuses = [
          5 /* Complete */,
          3 /* Errored */
        ];
        this.rejectUnreachableStatus(status, unreachableStatuses);
        break;
      }
      case 5 /* Complete */: {
        let unreachableStatuses = [
          4 /* Terminated */,
          3 /* Errored */
        ];
        this.rejectUnreachableStatus(status, unreachableStatuses);
        break;
      }
      default:
        break;
    }
  }
  rejectUnreachableStatus(reachedStatus, unreachableStatuses) {
    if (unreachableStatuses)
      for (let unreachableStatus of unreachableStatuses) {
        let waiter = this.statusWaiters.get(unreachableStatus);
        if (waiter) {
          waiter.reject(
            new Error(
              `[WorkflowIntrospector] The Workflow instance ${this.instanceId} has reached status '${instanceStatusName(
                reachedStatus
              )}'. This is a finite status that prevents it from ever reaching the expected status of '${instanceStatusName(
                unreachableStatus
              )}'.`
            )
          ), this.statusWaiters.delete(unreachableStatus);
          return;
        }
      }
  }
  /**
   * Create a replay ReadableStream from stored stream output metadata.
   * Returns undefined if the stream data is not in a valid/complete state.
   */
  replayStreamFromMeta(streamOutput) {
    if (!(streamOutput.meta.state !== "complete" /* Complete */ || getInvalidStoredStreamOutputError(
      this.ctx.storage,
      streamOutput.cacheKey,
      streamOutput.meta
    ) !== void 0))
      return createReplayReadableStream({
        storage: this.ctx.storage,
        cacheKey: streamOutput.cacheKey,
        meta: streamOutput.meta
      });
  }
  stepResultWaiters = /* @__PURE__ */ new Map();
  async waitForStepResult(stepName, stepCount) {
    let cacheKey = `${await computeHash(stepName)}-${stepCount ?? 1}`, rows = [
      ...this.ctx.storage.sql.exec(
        "SELECT event, metadata FROM states WHERE groupKey = ? ORDER BY id DESC LIMIT 1",
        cacheKey
      )
    ];
    if (rows.length > 0) {
      let { event, metadata } = rows[0], parsed = JSON.parse(metadata);
      if (event === 6 /* STEP_SUCCESS */)
        return parsed?.streamOutput ? this.replayStreamFromMeta(parsed.streamOutput) : parsed?.result;
      if (event === 7 /* STEP_FAILURE */)
        throw parsed?.error ?? parsed;
    }
    return new Promise((resolve, reject) => {
      this.stepResultWaiters.set(cacheKey, { resolve, reject });
    });
  }
  handleStepResultWaiter(group, event, metadata) {
    let waiter = this.stepResultWaiters.get(group);
    if (waiter) {
      if (event === 6 /* STEP_SUCCESS */)
        metadata?.streamOutput ? waiter.resolve(
          this.replayStreamFromMeta(
            metadata.streamOutput
          )
        ) : waiter.resolve(metadata?.result), this.stepResultWaiters.delete(group);
      else if (event === 7 /* STEP_FAILURE */) {
        let error = metadata?.error ?? new Error("Step failed");
        waiter.reject(error), this.stepResultWaiters.delete(group);
      }
    }
  }
  async getOutputOrError(isOutput) {
    let status = await this.getStatus();
    if (isOutput) {
      if (status !== 5 /* Complete */)
        throw new Error(
          `Cannot retrieve output: Workflow instance is in status "${instanceStatusName(
            status
          )}" but must be "complete" to have an output available`
        );
      return this.readLogsFromEvent(2 /* WORKFLOW_SUCCESS */).logs.at(0)?.metadata.result;
    } else {
      if (status !== 3 /* Errored */)
        throw new Error(
          `Cannot retrieve error: Workflow instance is in status "${instanceStatusName(
            status
          )}" but must be "errored" to have error information available`
        );
      let log = this.readLogsFromEvent(3 /* WORKFLOW_FAILURE */).logs.at(0);
      if (!log?.metadata.error)
        throw new Error(
          "Cannot retrieve error: No workflow instance failure log found"
        );
      return log.metadata.error;
    }
  }
  async abort(reason) {
    await this.ctx.storage.sync(), this.timeoutHandler.dispose(), this.engineAbortController.abort(new Error(reason)), this.ctx.abort(reason);
  }
  // Called by the dispose function when introspecting the instance in tests
  // TODO: Ideally this abort should be done by `abortAllDurableObjects` from worked called by vitest-plugin
  async unsafeAbort(reason) {
    await this.ctx.storage.sync(), await this.ctx.storage.deleteAll(), this.ctx.abort(reason);
  }
  async storeEventMap() {
    await this.ctx.blockConcurrencyWhile(async () => {
      let entries = {};
      for (let [type, events] of this.eventMap.entries())
        for (let i = 0; i < events.length; i++)
          entries[`${EVENT_MAP_PREFIX2}
${type}
${i}`] = events[i];
      Object.keys(entries).length > 0 && await this.ctx.storage.put(entries);
    });
  }
  async restoreEventMap() {
    await this.ctx.blockConcurrencyWhile(async () => {
      let entries = await this.ctx.storage.list({
        prefix: EVENT_MAP_PREFIX2
      });
      for (let [key, value] of entries) {
        let [_, eventType, _idx] = key.split(`
`), eventList = this.eventMap.get(eventType) ?? [];
        eventList.push(value), this.eventMap.set(eventType, eventList);
      }
    });
  }
  async receiveEvent(event) {
    let eventTypeQueue = this.eventMap.get(event.type) ?? [];
    if (eventTypeQueue.push(event), this.eventMap.set(event.type, eventTypeQueue), await this.storeEventMap(), this.isRunning) {
      let callbacks = this.waiters.get(event.type);
      if (callbacks) {
        let entry = callbacks[0];
        if (entry) {
          let [, resolve] = entry;
          resolve(event), callbacks.shift(), this.waiters.set(event.type, callbacks), eventTypeQueue = this.eventMap.get(event.type) ?? [], eventTypeQueue.shift(), this.eventMap.set(event.type, eventTypeQueue);
          return;
        }
      }
    } else {
      if (await this.ctx.storage.get(
        `${MODIFIER_KEYS.MOCK_EVENT}${event.type}`
      ))
        return;
      let metadata = await this.ctx.storage.get(INSTANCE_METADATA);
      if (metadata === void 0)
        throw new Error("Engine was never started");
      this.init(
        metadata.accountId,
        metadata.workflow,
        metadata.version,
        metadata.instance,
        metadata.event
      );
    }
  }
  getInstanceModifier() {
    return new WorkflowInstanceModifier(this, this.ctx);
  }
  async changeInstanceStatus(newStatus, from, terminateOptions) {
    let metadata = await this.ctx.storage.get(INSTANCE_METADATA);
    if (metadata === void 0)
      throw createWorkflowError(
        "Instance does not exist",
        "instance.not_found"
      );
    switch (newStatus) {
      case "pause":
        await this.userTriggeredPause();
        break;
      case "resume": {
        let currentStatus = await this.getStatus();
        currentStatus === 6 /* WaitingForPause */ ? (this.timeoutHandler.cancelWaitingPromisesByType("pause"), await this.setStatus(
          metadata.accountId,
          metadata.instance.id,
          1 /* Running */
        )) : currentStatus === 2 /* Paused */ && await this.attemptResume();
        break;
      }
      case "terminate": {
        let currentStatus = await this.getStatus();
        if ([
          4 /* Terminated */,
          5 /* Complete */,
          3 /* Errored */
        ].includes(currentStatus))
          throw createWorkflowError(
            "Cannot terminate instance since its on a finite state",
            "instance.cannot_terminate"
          );
        await this.userTriggeredTerminate(terminateOptions);
        break;
      }
      case "restart":
        if (from) {
          if (!resolveGroupKeysToWipe(this.ctx.storage.sql, from))
            throw stepNotFoundError(from.name);
          await storeRestartFromStep(this.ctx.storage, from);
        }
        await this.userTriggeredRestart();
        break;
    }
  }
  async replayRollbackRegistry(metadata) {
    if (this.rollbackRegistry.size > 0)
      return;
    let eligible = this.getEligibleRollbackSteps();
    if (eligible.length === 0)
      return;
    this.rollbackEligibleCacheKeys = new Set(eligible);
    let stubStep = this.createRollbackContext();
    this.setRollbackPhase("replay");
    try {
      await (this.ctx.props.workflowClass ?? this.env.USER_WORKFLOW).run(
        metadata.event,
        stubStep
      );
    } catch (replayErr) {
      console.debug("Rollback replay stopped:", replayErr);
    } finally {
      this.setRollbackPhase(void 0), this.rollbackEligibleCacheKeys = void 0;
    }
  }
  async userTriggeredTerminate(options) {
    let metadata = await this.ctx.storage.get(INSTANCE_METADATA);
    if (metadata === void 0)
      throw createWorkflowError(
        "Instance does not exist",
        "instance.not_found"
      );
    if (options?.rollback === !0) {
      this.priorityQueue ??= new TimePriorityQueue(this.ctx, metadata), await this.replayRollbackRegistry(metadata);
      let error = new Error("Instance terminated during rollback");
      error.name = "Terminated", this.setRollbackPhase("rollback");
      try {
        await executeRollbacks(this, error);
      } catch (rollbackErr) {
        console.error("Rollback execution failed:", rollbackErr);
      } finally {
        this.setRollbackPhase(void 0);
      }
    }
    this.writeLog(4 /* WORKFLOW_TERMINATED */, null, null, {
      trigger: {
        source: 0 /* API */
      }
    }), await this.setStatus(
      metadata.accountId,
      metadata.instance.id,
      4 /* Terminated */
    ), await this.abort(ABORT_REASONS.USER_TERMINATE);
  }
  /** Deletes all instance state and aborts its current execution. */
  async deleteInstance() {
    if (await this.ctx.storage.get(INSTANCE_METADATA) === void 0)
      throw createWorkflowError(
        "Instance does not exist",
        "instance.not_found"
      );
    await this.ctx.storage.deleteAll(), await this.abort(ABORT_REASONS.USER_DELETE);
  }
  async userTriggeredPause() {
    let status = await this.getStatus();
    if (status === 2 /* Paused */ || status === 6 /* WaitingForPause */ || status !== 1 /* Running */ && status !== 7 /* Waiting */)
      return;
    let metadata = await this.ctx.storage.get(INSTANCE_METADATA);
    if (metadata === void 0)
      throw createWorkflowError(
        "Instance does not exist",
        "instance.not_found"
      );
    await this.setStatus(
      metadata.accountId,
      metadata.instance.id,
      6 /* WaitingForPause */
    ), this.timeoutHandler.waitUntilNothingIsRunning("pause", async () => {
      await this.ctx.storage.put(PAUSE_DATETIME2, /* @__PURE__ */ new Date()), await this.setStatus(
        metadata.accountId,
        metadata.instance.id,
        2 /* Paused */
      ), this.pauseController.abort(ABORT_REASONS.USER_PAUSE);
    }).catch(() => {
    });
  }
  async userTriggeredRestart() {
    await this.abort(ABORT_REASONS.USER_RESTART);
  }
  async attemptRestart() {
    let restartFromStep = await readAndClearRestartFromStep(this.ctx.storage), groupKeysToWipe = null;
    if (restartFromStep && (groupKeysToWipe = resolveGroupKeysToWipe(
      this.ctx.storage.sql,
      restartFromStep
    ), !groupKeysToWipe))
      throw stepNotFoundError(restartFromStep.name);
    await wipeRestartState(
      this.ctx.storage,
      ENGINE_STATUS_KEY,
      PAUSE_DATETIME2,
      groupKeysToWipe
    );
    let metadata = await this.ctx.storage.get(INSTANCE_METADATA);
    if (metadata === void 0)
      throw createWorkflowError(
        "Instance does not exist",
        "instance.not_found"
      );
    let { accountId, workflow, version, instance, event } = metadata;
    groupKeysToWipe || (this.writeLog(0 /* WORKFLOW_QUEUED */, null, null, {
      params: event.payload,
      versionId: version.id,
      trigger: {
        source: 0 /* API */
      }
    }), this.writeLog(1 /* WORKFLOW_START */, null, null, {})), this.init(accountId, workflow, version, instance, event);
  }
  async attemptResume() {
    let metadata = await this.ctx.storage.get(INSTANCE_METADATA);
    if (metadata === void 0)
      throw createWorkflowError(
        "Instance does not exist",
        "instance.not_found"
      );
    if (await this.ctx.storage.get(ENGINE_STATUS_KEY) !== 2 /* Paused */)
      return;
    let pausedDate = await this.ctx.storage.get(PAUSE_DATETIME2);
    if (pausedDate !== void 0) {
      let offset = Date.now() - new Date(pausedDate).valueOf();
      this.priorityQueue ? this.priorityQueue.offsetAll(offset) : new TimePriorityQueue(this.ctx, metadata).offsetAll(offset);
    }
    await this.ctx.storage.delete(PAUSE_DATETIME2);
    let { accountId, workflow, version, instance, event } = metadata;
    await this.ctx.storage.put(ENGINE_STATUS_KEY, 0 /* Queued */), this.pauseController = new AbortController(), this.waiters = /* @__PURE__ */ new Map(), this.eventMap = /* @__PURE__ */ new Map(), clearRollbackRegistry(this.rollbackRegistry), this.init(accountId, workflow, version, instance, event);
  }
  async hasInstance() {
    return await this.ctx.storage.get(INSTANCE_METADATA) !== void 0;
  }
  async init(accountId, workflow, version, instance, event) {
    if (this.priorityQueue === void 0 && (this.priorityQueue = new TimePriorityQueue(
      this.ctx,
      // this.env,
      {
        accountId,
        workflow,
        version,
        instance,
        event
      }
    )), this.isRunning)
      return;
    this.priorityQueue.popPastEntries(), await this.priorityQueue.handleNextAlarm(), this.accountId = accountId, this.instanceId = instance.id, this.workflowName = workflow.name;
    let status = await this.getStatus();
    if ([
      3 /* Errored */,
      // TODO (WOR-85): Remove this once upgrade story is done
      4 /* Terminated */,
      5 /* Complete */,
      2 /* Paused */
    ].includes(status))
      return;
    if (status === 6 /* WaitingForPause */) {
      await this.ctx.storage.put(PAUSE_DATETIME2, /* @__PURE__ */ new Date()), await this.setStatus(accountId, instance.id, 2 /* Paused */);
      return;
    }
    if (await this.ctx.storage.get(INSTANCE_METADATA) == null) {
      let instanceMetadata = {
        accountId,
        workflow,
        version,
        instance,
        event
      };
      await this.ctx.storage.put(INSTANCE_METADATA, instanceMetadata), this.writeLog(0 /* WORKFLOW_QUEUED */, null, null, {
        params: event.payload,
        versionId: version.id,
        trigger: {
          source: 0 /* API */
        }
      }), this.writeLog(1 /* WORKFLOW_START */, null, null, {});
    }
    await this.restoreEventMap();
    let stubStep = new Context(this, this.ctx), workflowRunningHandler = async () => {
      await this.ctx.storage.transaction(async () => {
        await this.setStatus(accountId, instance.id, 1 /* Running */);
      });
    };
    this.isRunning = !0, workflowRunningHandler();
    try {
      let result = await (this.ctx.props.workflowClass ?? this.env.USER_WORKFLOW).run(
        event,
        stubStep
      );
      await this.ctx.storage.put(WORKFLOW_OUTPUT_KEY, {
        value: normalizeForStorage(result)
      }), this.writeLog(2 /* WORKFLOW_SUCCESS */, null, null, {
        result
      }), await this.ctx.storage.transaction(async () => {
        await this.setStatus(accountId, instance.id, 5 /* Complete */);
      }), clearRollbackRegistry(this.rollbackRegistry), this.isRunning = !1;
    } catch (err) {
      if (isAbortError(err)) {
        this.isRunning = !1;
        return;
      }
      try {
        await executeRollbacks(
          this,
          err instanceof Error ? err : new Error(String(err))
        );
      } catch (rollbackErr) {
        console.error("Rollback execution failed:", rollbackErr);
      }
      let error;
      if (err instanceof Error) {
        if (err.name === "NonRetryableError" || err.message.startsWith("NonRetryableError")) {
          let fatalError = shouldPreserveNonRetryableError() ? new PreservedNonRetryableError(err) : new WorkflowFatalError(
            "The execution of the Workflow instance was terminated, as a step threw an NonRetryableError and it was not handled"
          );
          this.writeLog(3 /* WORKFLOW_FAILURE */, null, null, {
            error: fatalError
          }), await this.setStatus(accountId, instance.id, 3 /* Errored */), await this.abort(ABORT_REASONS.NON_RETRYABLE_ERROR), this.isRunning = !1;
          return;
        }
        error = {
          message: err.message,
          name: err.name
        };
      } else
        error = {
          name: "Error",
          message: err
        };
      this.writeLog(3 /* WORKFLOW_FAILURE */, null, null, {
        error
      }), await this.ctx.storage.transaction(async () => {
        await this.setStatus(accountId, instance.id, 3 /* Errored */);
      }), this.isRunning = !1;
    }
    return {
      id: instance.id
    };
  }
};

// ../workflows-shared/src/binding.ts
import { RpcTarget as RpcTarget4, WorkerEntrypoint } from "cloudflare:workers";
import { z as z3 } from "miniflare:zod";
var STORAGE_DELETE_RETRY_INTERVAL_MS = 50, STORAGE_DELETE_RETRY_BUDGET_MS = 2e3, STORAGE_DELETE_MAX_RETRIES = STORAGE_DELETE_RETRY_BUDGET_MS / STORAGE_DELETE_RETRY_INTERVAL_MS, pendingDeletes = /* @__PURE__ */ new Map();
function getStorageUrl(workflowName, hexId) {
  if (/[\\/]/.test(workflowName) || workflowName.includes("\0") || !/^[a-f0-9]{64}$/i.test(hexId))
    throw new Error("Invalid Workflow storage path");
  return `http://disk/${encodeURIComponent(`miniflare-workflows-${workflowName}`)}/${hexId}`;
}
async function removeFile(disk, url) {
  for (let attempt = 0; ; attempt++) {
    let isDirectory = !1;
    try {
      let file = await disk.fetch(url, { method: "HEAD" });
      if (file.status === 404)
        return !1;
      if (file.ok && file.headers.get("Content-Type") !== "application/octet-stream")
        isDirectory = !0;
      else if (file.ok) {
        let response = await disk.fetch(url, { method: "DELETE" });
        if (response.ok || response.status === 404)
          return response.ok;
      }
    } catch (error) {
      if (attempt === STORAGE_DELETE_MAX_RETRIES)
        throw error;
    }
    if (isDirectory)
      throw new Error("Refusing to delete a Workflow storage directory");
    if (attempt === STORAGE_DELETE_MAX_RETRIES)
      throw new Error("Failed to delete Workflow storage file");
    await scheduler.wait(STORAGE_DELETE_RETRY_INTERVAL_MS);
  }
}
async function deleteWorkflowStorageFiles(disk, url, deleted = !1) {
  let failure;
  for (let extension of [".sqlite", ".sqlite-shm", ".sqlite-wal"])
    try {
      let removed = await removeFile(disk, url + extension);
      deleted ||= extension === ".sqlite" && removed;
    } catch (error) {
      failure ??= error;
    }
  if (failure !== void 0)
    throw failure;
  return deleted;
}
function deleteWorkflowStorage({
  disk,
  workflowName,
  ctx,
  hexId,
  abort,
  abortOnlyIfPersisted = !1
}) {
  if (disk === void 0)
    return abort().then(() => !1);
  let url = getStorageUrl(workflowName, hexId), previous = pendingDeletes.get(url), readyToDelete = (previous ?? Promise.resolve(!1)).catch(() => !1).then(async (deleted) => ((!abortOnlyIfPersisted || (await disk.fetch(url + ".sqlite", { method: "HEAD" })).status !== 404) && (await abort(), await scheduler.wait(100)), deleted)), cleanup = readyToDelete.then(
    (deleted) => deleteWorkflowStorageFiles(disk, url, deleted)
  ), pendingDelete = readyToDelete.then(
    () => cleanup,
    () => previous ?? !1
  );
  return pendingDeletes.set(url, pendingDelete), ctx.waitUntil(
    pendingDelete.then(
      () => {
        pendingDeletes.get(url) === pendingDelete && pendingDeletes.delete(url);
      },
      () => {
      }
    )
  ), cleanup;
}
async function waitForPersistedInstanceDelete(env, id) {
  if (id === void 0 || env.WORKFLOW_STORAGE === void 0)
    return;
  let hexId = env.ENGINE.idFromName(id).toString(), url = getStorageUrl(env.WORKFLOW_NAME, hexId), retried = !1, pending = pendingDeletes.get(url);
  for (; pending !== void 0; ) {
    try {
      await pending;
    } catch (error) {
      if (pendingDeletes.get(url) === pending) {
        if (retried)
          throw error;
        retried = !0, pendingDeletes.set(
          url,
          deleteWorkflowStorageFiles(env.WORKFLOW_STORAGE, url)
        );
      }
    }
    let latest = pendingDeletes.get(url);
    if (latest === pending) {
      pendingDeletes.delete(url);
      return;
    }
    pending = latest;
  }
}
async function deletePersistedInstance(env, ctx, id) {
  if (env.WORKFLOW_STORAGE === void 0)
    return;
  let stub = env.ENGINE.get(env.ENGINE.idFromName(id));
  await deleteWorkflowStorage({
    disk: env.WORKFLOW_STORAGE,
    workflowName: env.WORKFLOW_NAME,
    ctx,
    hexId: stub.id.toString(),
    abort: async () => {
      try {
        await stub.unsafeAbort();
      } catch {
      }
    }
  });
}
var workflowIntrospectionSessions = /* @__PURE__ */ new Map();
function getWorkflowIntrospectionSession(workflowName, sessionId) {
  let session = workflowIntrospectionSessions.get(workflowName);
  if (session?.id !== sessionId)
    throw new Error(
      `Workflow ${JSON.stringify(workflowName)} does not have an active introspection session for this introspector.`
    );
  return session;
}
function isWorkflowIntrospectionStreamResult(value) {
  return value !== null && typeof value == "object" && "__workflowIntrospectionStreamResult" in value && "chunks" in value && value.__workflowIntrospectionStreamResult === !0 && Array.isArray(value.chunks);
}
function createWorkflowIntrospectionReadableStream(result) {
  return new ReadableStream({
    start(controller) {
      for (let chunk of result.chunks)
        controller.enqueue(chunk.slice());
      controller.close();
    }
  });
}
async function applyWorkflowIntrospectionOperation(modifier, operation) {
  switch (operation.type) {
    case "disableSleeps":
      await modifier.disableSleeps(operation.steps);
      break;
    case "disableRetryDelays":
      await modifier.disableRetryDelays(operation.steps);
      break;
    case "mockStepResult":
      await modifier.mockStepResult(
        operation.step,
        isWorkflowIntrospectionStreamResult(operation.stepResult) ? createWorkflowIntrospectionReadableStream(operation.stepResult) : operation.stepResult
      );
      break;
    case "mockStepError": {
      let error = new Error(operation.error.message);
      error.name = operation.error.name, await modifier.mockStepError(operation.step, error, operation.times);
      break;
    }
    case "forceStepTimeout":
      await modifier.forceStepTimeout(operation.step, operation.times);
      break;
    case "mockEvent":
      await modifier.mockEvent(operation.event);
      break;
    case "forceEventTimeout":
      await modifier.forceEventTimeout(operation.step);
      break;
  }
}
var retentionDurationSchema = z3.union([z3.number(), z3.string()]).refine(
  (value) => {
    if (typeof value == "number")
      return Number.isInteger(value) && value > 0;
    try {
      let duration = r(value);
      return Number.isFinite(duration) && duration > 0;
    } catch {
      return !1;
    }
  },
  {
    message: "Duration must be a number or a string in format '{{number}} {{unit}}' where unit is second(s), minute(s), etc."
  }
), workflowInstanceCreateOptionsSchema = z3.object({
  id: z3.string().optional(),
  params: z3.any().optional(),
  retention: z3.object({
    successRetention: retentionDurationSchema.optional(),
    errorRetention: retentionDurationSchema.optional()
  }).optional(),
  locationHint: z3.enum([
    "wnam",
    "weur",
    "enam",
    "eeur",
    "apac",
    "apac-ne",
    "apac-se",
    "oc",
    "sam",
    "afr",
    "me"
  ]).optional()
}), WorkflowBinding = class extends WorkerEntrypoint {
  constructor(ctx, env) {
    super(ctx, env);
  }
  async #instanceExists(id) {
    return await waitForPersistedInstanceDelete(this.env, id), await this.env.ENGINE.get(this.env.ENGINE.idFromName(id)).hasInstance();
  }
  async create(options = {}) {
    let { id = crypto.randomUUID() } = options;
    if (!isValidWorkflowInstanceId(id))
      throw new WorkflowError("Workflow instance has invalid id");
    if (options.id !== void 0 && await this.#instanceExists(id))
      throw duplicateInstanceError(id);
    return this.#createUnchecked(id, options);
  }
  // Creation body shared by create() and createBatch(), which perform their
  // own validation and existence checks before calling this.
  async #createUnchecked(id, options) {
    let { params = {} } = options;
    options.id === void 0 && await waitForPersistedInstanceDelete(this.env, id);
    let stubId = this.env.ENGINE.idFromName(id), stub = this.env.ENGINE.get(stubId), introspectionSession = workflowIntrospectionSessions.get(
      this.env.WORKFLOW_NAME
    );
    if (introspectionSession !== void 0) {
      using modifier = await stub.getInstanceModifier();
      introspectionSession.instanceIds.push(id);
      for (let operation of introspectionSession.operations)
        await applyWorkflowIntrospectionOperation(modifier, operation);
    }
    let now = (/* @__PURE__ */ new Date()).toISOString(), initPromise = stub.init(
      0,
      // accountId: number,
      {},
      // workflow: DatabaseWorkflow,
      {},
      // version: DatabaseVersion,
      {
        id,
        created_on: now,
        modified_on: now,
        workflow_id: "",
        version_id: "",
        status: 0,
        // InstanceStatus.Queued
        started_on: now,
        ended_on: null
      },
      {
        timestamp: /* @__PURE__ */ new Date(),
        payload: params,
        instanceId: id,
        workflowName: this.env.WORKFLOW_NAME
      }
    ).then((val) => {
      val !== void 0 && val[Symbol.dispose]();
    }).catch(() => {
    });
    return this.ctx.waitUntil(initPromise), {
      id
    };
  }
  async get(id) {
    let stubId = this.env.ENGINE.idFromName(id), stub = this.env.ENGINE.get(stubId), getStub = () => this.env.ENGINE.get(this.env.ENGINE.idFromName(id)), handle = new WorkflowHandle(id, stub, getStub, this);
    try {
      await handle.status();
    } catch {
      throw new Error("instance.not_found");
    }
    return handle;
  }
  // A Workflow on `ctx.exports` is built by workerd's
  // `cloudflare-internal:workflows-api`, which addresses each instance by id
  // on the binding rather than calling the instance returned by `get()`. Each
  // method goes through `get()` so a missing instance still fails with
  // `instance.not_found`.
  async getInstance(id) {
    return await this.get(id), { id };
  }
  async pause(id) {
    await (await this.get(id)).pause();
  }
  async resume(id) {
    await (await this.get(id)).resume();
  }
  async terminate(id, options) {
    await (await this.get(id)).terminate(options);
  }
  async restart(id, options) {
    await (await this.get(id)).restart(options);
  }
  async status(id) {
    return await (await this.get(id)).status();
  }
  async sendEvent(id, event) {
    await (await this.get(id)).sendEvent(event);
  }
  async subscribe(id, options) {
    return await (await this.get(id)).subscribe(options);
  }
  async createBatch(options) {
    let isLegacyBatch = Array.isArray(options), batch;
    if (isLegacyBatch)
      batch = options;
    else if (options !== null && typeof options == "object")
      if ("count" in options && options.count !== void 0) {
        if (!Number.isInteger(options.count) || options.count <= 0)
          throw createWorkflowError("count must be a positive integer", "body");
        if (options.count > 100)
          throw createWorkflowError(
            "batchCreate only supports 100 instances at a time",
            "body"
          );
        batch = Array.from({ length: options.count }, () => ({
          params: options.params,
          retention: options.retention,
          locationHint: options.locationHint
        }));
      } else if ("instances" in options && Array.isArray(options.instances))
        batch = options.instances;
      else
        throw createWorkflowError("Provided argument is invalid", "body");
    else
      throw createWorkflowError("Provided argument is invalid", "body");
    if (batch.length === 0)
      throw isLegacyBatch ? new Error(
        "WorkflowError: batchCreate should have at least 1 instance"
      ) : createWorkflowError("Batch size exceeds maximum allowed", "body");
    if (batch.length > 100)
      throw isLegacyBatch ? new Error(
        "WorkflowError: batchCreate only supports 100 instances at a time"
      ) : createWorkflowError("Batch size exceeds maximum allowed", "body");
    for (let instanceOptions of batch) {
      if (!isLegacyBatch) {
        let validation = workflowInstanceCreateOptionsSchema.safeParse(instanceOptions);
        if (!validation.success)
          throw createWorkflowError(
            validation.error.issues.map((issue) => issue.message).join("; "),
            "body"
          );
      }
      if (instanceOptions.id !== void 0 && (!isValidWorkflowInstanceId(instanceOptions.id) || !isLegacyBatch && (["batch", "terminate", "terminateAll"].includes(
        instanceOptions.id
      ) || /^cf_[0-9a-f]{64}$/.test(instanceOptions.id))))
        throw isLegacyBatch ? new WorkflowError("Workflow instance has invalid id") : createWorkflowError(
          "Instance ID is invalid",
          "instance.invalid_id"
        );
    }
    let providedIds = [
      ...new Set(
        batch.map((instanceOptions) => instanceOptions.id).filter((id) => id !== void 0)
      )
    ], existing = /* @__PURE__ */ new Set();
    await Promise.all(
      providedIds.map(async (id) => {
        await this.#instanceExists(id) && existing.add(id);
      })
    );
    let result = { created: [], errors: [] }, seenIds = /* @__PURE__ */ new Set();
    for (let [index, instanceOptions] of batch.entries()) {
      if (instanceOptions.id !== void 0) {
        if (seenIds.has(instanceOptions.id)) {
          isLegacyBatch || result.errors.push({
            index,
            id: instanceOptions.id,
            code: 10415,
            message: "workflows.api.error.instance.duplicate_in_batch"
          });
          continue;
        }
        if (seenIds.add(instanceOptions.id), existing.has(instanceOptions.id)) {
          isLegacyBatch || result.errors.push({
            index,
            id: instanceOptions.id,
            code: 10405,
            message: "workflows.api.error.instance.already_exists"
          });
          continue;
        }
      }
      let { id = crypto.randomUUID() } = instanceOptions;
      result.created.push(await this.#createUnchecked(id, instanceOptions));
    }
    return isLegacyBatch ? result.created : result;
  }
  /**
   * Deletes an instance. Named `deleteInstance` because `Fetcher.delete()` shadows
   * a same-named JSRPC method.
   */
  async deleteInstance(id) {
    if (!isValidAddressableWorkflowInstanceId(id))
      throw createWorkflowError(
        "Instance ID is invalid",
        "instance.invalid_id"
      );
    let stub = this.env.ENGINE.get(this.env.ENGINE.idFromName(id));
    await deleteWorkflowStorage({
      disk: this.env.WORKFLOW_STORAGE,
      workflowName: this.env.WORKFLOW_NAME,
      ctx: this.ctx,
      hexId: stub.id.toString(),
      abort: async () => {
        try {
          await stub.deleteInstance();
        } catch (error) {
          if (!isUserTriggeredDelete(error))
            throw error;
        }
      }
    });
  }
  /** Removes local persistence by hex ID, including orphaned instances in Explorer. */
  async unsafeDeletePersistedInstance(hexId) {
    if (this.env.WORKFLOW_STORAGE === void 0)
      throw new Error("Workflow storage service not available");
    return deleteWorkflowStorage({
      disk: this.env.WORKFLOW_STORAGE,
      workflowName: this.env.WORKFLOW_NAME,
      ctx: this.ctx,
      hexId,
      abort: async () => {
        try {
          await this.env.ENGINE.get(this.env.ENGINE.idFromString(hexId)).unsafeAbort();
        } catch {
        }
      },
      abortOnlyIfPersisted: !0
    });
  }
  /** Deletes each unique instance once while preserving duplicate results. */
  async deleteBatch(options) {
    let instanceIds = options?.instances;
    if (!Array.isArray(instanceIds))
      throw createWorkflowError("Provided argument is invalid", "body");
    if (instanceIds.length > 100)
      throw createWorkflowError(
        "batchDeleteInstances only supports 100 instances at a time",
        "body"
      );
    if (instanceIds.length === 0)
      throw createWorkflowError(
        "batchDeleteInstances should have at least 1 instance",
        "body"
      );
    if (!instanceIds.every(isValidAddressableWorkflowInstanceId))
      throw createWorkflowError(
        "Instance ID is invalid",
        "instance.invalid_id"
      );
    let uniqueIds = [...new Set(instanceIds)], settled = await Promise.allSettled(
      uniqueIds.map((id) => this.deleteInstance(id))
    ), resultsById = new Map(
      uniqueIds.map((id, index) => [id, settled[index]])
    ), result = { deleted: [], errors: [] };
    for (let id of instanceIds) {
      let deletion = resultsById.get(id);
      if (deletion === void 0)
        throw new Error("Missing batch deletion result");
      if (deletion.status === "fulfilled" || isUserTriggeredDelete(deletion.reason)) {
        result.deleted.push({ id });
        continue;
      }
      let isNotFound = deletion.reason instanceof Error && deletion.reason.message.includes("(instance.not_found)");
      result.errors.push({
        id,
        code: isNotFound ? 10400 : 10001,
        message: isNotFound ? "workflows.api.error.instance.not_found" : "workflows.api.error.internal_server"
      });
    }
    let cleanupIds = [...new Set(
      result.errors.filter(({ code }) => code === 10400).map(({ id }) => id)
    )], cleanups = await Promise.allSettled(
      cleanupIds.map((id) => deletePersistedInstance(this.env, this.ctx, id))
    ), failedCleanupIds = new Set(
      cleanupIds.filter((_, index) => cleanups[index]?.status === "rejected")
    );
    if (failedCleanupIds.size === 0)
      return result;
    let errorsById = new Map(result.errors.map((error) => [error.id, error]));
    return {
      deleted: result.deleted.filter(({ id }) => !failedCleanupIds.has(id)),
      errors: instanceIds.flatMap((id) => {
        if (failedCleanupIds.has(id))
          return [
            { id, code: 10001, message: "workflows.api.error.internal_server" }
          ];
        let error = errorsById.get(id);
        return error === void 0 ? [] : [error];
      })
    };
  }
  async unsafeGetBindingName() {
    return this.env.BINDING_NAME;
  }
  async unsafeStartIntrospection() {
    if (workflowIntrospectionSessions.has(this.env.WORKFLOW_NAME))
      throw new Error(
        `Workflow ${JSON.stringify(this.env.WORKFLOW_NAME)} already has an active introspection session for binding ${JSON.stringify(this.env.BINDING_NAME)}.`
      );
    let sessionId = crypto.randomUUID();
    return workflowIntrospectionSessions.set(this.env.WORKFLOW_NAME, {
      id: sessionId,
      operations: [],
      instanceIds: []
    }), sessionId;
  }
  async unsafeStopIntrospection(sessionId) {
    workflowIntrospectionSessions.get(this.env.WORKFLOW_NAME)?.id === sessionId && workflowIntrospectionSessions.delete(this.env.WORKFLOW_NAME);
  }
  async unsafeSetIntrospectionOperations(sessionId, operations) {
    let session = getWorkflowIntrospectionSession(
      this.env.WORKFLOW_NAME,
      sessionId
    );
    session.operations = operations;
  }
  async unsafeGetIntrospectionInstances(sessionId) {
    return getWorkflowIntrospectionSession(this.env.WORKFLOW_NAME, sessionId).instanceIds;
  }
  async unsafeGetInstanceModifier(instanceId) {
    let stubId = this.env.ENGINE.idFromName(instanceId);
    return this.env.ENGINE.get(stubId).getInstanceModifier();
  }
  async unsafeWaitForStepResult(instanceId, name, index) {
    let stubId = this.env.ENGINE.idFromName(instanceId);
    return await this.env.ENGINE.get(stubId).waitForStepResult(name, index);
  }
  async unsafeAbort(instanceId, reason) {
    let stubId = this.env.ENGINE.idFromName(instanceId), stub = this.env.ENGINE.get(stubId);
    try {
      await stub.unsafeAbort(reason);
    } catch {
    }
  }
  async unsafeWaitForStatus(instanceId, status) {
    let stubId = this.env.ENGINE.idFromName(instanceId);
    return await this.env.ENGINE.get(stubId).waitForStatus(status);
  }
  async unsafeGetOutputOrError(instanceId, isOutput) {
    let stubId = this.env.ENGINE.idFromName(instanceId);
    return await this.env.ENGINE.get(stubId).getOutputOrError(isOutput);
  }
}, WorkflowHandle = class extends RpcTarget4 {
  constructor(id, stub, getStub, binding) {
    super();
    this.id = id;
    this.getStub = getStub;
    this.binding = binding;
    this.stub = stub;
  }
  id;
  getStub;
  binding;
  stub;
  async pause() {
    try {
      await this.stub.changeInstanceStatus("pause");
    } catch (e) {
      if (!isUserTriggeredPause(e))
        throw e;
    }
  }
  async resume() {
    await this.stub.changeInstanceStatus("resume");
  }
  async terminate(options) {
    try {
      await this.stub.changeInstanceStatus("terminate", void 0, options);
    } catch (e) {
      if (!isUserTriggeredTerminate(e))
        throw e;
    }
  }
  async delete() {
    await this.binding.deleteInstance(this.id);
  }
  async restart(options) {
    try {
      await this.stub.changeInstanceStatus("restart", options?.from);
    } catch (e) {
      if (!isUserTriggeredRestart(e))
        throw e;
    }
    this.stub = this.getStub(), await this.stub.attemptRestart();
  }
  async status() {
    let fetchStatusAndLogs = async () => {
      let status = await this.stub.getStatus(), logs2 = await this.stub.readLogs();
      return { status, logs: logs2 };
    }, result;
    try {
      result = await fetchStatusAndLogs();
    } catch {
      this.stub = this.getStub(), result = await fetchStatusAndLogs();
    }
    using logs = result.logs;
    let stepOutputs = logs.logs.filter(
      (log) => log.event === 6 /* STEP_SUCCESS */ || log.event === 15 /* WAIT_COMPLETE */
    ).map(
      (log) => log.event === 6 /* STEP_SUCCESS */ ? log.metadata.result : log.metadata.payload
    ), workflowOutput = logs.logs.find((log) => log.event === 2 /* WORKFLOW_SUCCESS */)?.metadata.result ?? null, workflowError = logs.logs.find(
      (log) => log.event === 3 /* WORKFLOW_FAILURE */
    )?.metadata.error;
    return {
      status: instanceStatusName(result.status),
      __LOCAL_DEV_STEP_OUTPUTS: stepOutputs,
      output: workflowOutput,
      error: workflowError
    };
  }
  async subscribe(options) {
    let parsedOptions = parseWorkflowSubscriptionOptions(options);
    return this.stub.subscribe(parsedOptions);
  }
  async sendEvent(args) {
    await this.stub.receiveEvent({
      payload: args.payload,
      type: args.type,
      timestamp: /* @__PURE__ */ new Date()
    });
  }
};
export {
  Engine,
  WorkflowBinding
};
