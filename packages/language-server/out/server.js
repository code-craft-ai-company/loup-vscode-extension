"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/vscode-languageserver/lib/common/utils/is.js
var require_is = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/utils/is.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.thenable = exports2.typedArray = exports2.stringArray = exports2.array = exports2.func = exports2.error = exports2.number = exports2.string = exports2.boolean = void 0;
    function boolean(value) {
      return value === true || value === false;
    }
    exports2.boolean = boolean;
    function string(value) {
      return typeof value === "string" || value instanceof String;
    }
    exports2.string = string;
    function number(value) {
      return typeof value === "number" || value instanceof Number;
    }
    exports2.number = number;
    function error(value) {
      return value instanceof Error;
    }
    exports2.error = error;
    function func(value) {
      return typeof value === "function";
    }
    exports2.func = func;
    function array(value) {
      return Array.isArray(value);
    }
    exports2.array = array;
    function stringArray(value) {
      return array(value) && value.every((elem) => string(elem));
    }
    exports2.stringArray = stringArray;
    function typedArray(value, check) {
      return Array.isArray(value) && value.every(check);
    }
    exports2.typedArray = typedArray;
    function thenable(value) {
      return value && func(value.then);
    }
    exports2.thenable = thenable;
  }
});

// ../../node_modules/vscode-jsonrpc/lib/common/is.js
var require_is2 = __commonJS({
  "../../node_modules/vscode-jsonrpc/lib/common/is.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.stringArray = exports2.array = exports2.func = exports2.error = exports2.number = exports2.string = exports2.boolean = void 0;
    function boolean(value) {
      return value === true || value === false;
    }
    exports2.boolean = boolean;
    function string(value) {
      return typeof value === "string" || value instanceof String;
    }
    exports2.string = string;
    function number(value) {
      return typeof value === "number" || value instanceof Number;
    }
    exports2.number = number;
    function error(value) {
      return value instanceof Error;
    }
    exports2.error = error;
    function func(value) {
      return typeof value === "function";
    }
    exports2.func = func;
    function array(value) {
      return Array.isArray(value);
    }
    exports2.array = array;
    function stringArray(value) {
      return array(value) && value.every((elem) => string(elem));
    }
    exports2.stringArray = stringArray;
  }
});

// ../../node_modules/vscode-jsonrpc/lib/common/messages.js
var require_messages = __commonJS({
  "../../node_modules/vscode-jsonrpc/lib/common/messages.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Message = exports2.NotificationType9 = exports2.NotificationType8 = exports2.NotificationType7 = exports2.NotificationType6 = exports2.NotificationType5 = exports2.NotificationType4 = exports2.NotificationType3 = exports2.NotificationType2 = exports2.NotificationType1 = exports2.NotificationType0 = exports2.NotificationType = exports2.RequestType9 = exports2.RequestType8 = exports2.RequestType7 = exports2.RequestType6 = exports2.RequestType5 = exports2.RequestType4 = exports2.RequestType3 = exports2.RequestType2 = exports2.RequestType1 = exports2.RequestType = exports2.RequestType0 = exports2.AbstractMessageSignature = exports2.ParameterStructures = exports2.ResponseError = exports2.ErrorCodes = void 0;
    var is = require_is2();
    var ErrorCodes;
    (function(ErrorCodes2) {
      ErrorCodes2.ParseError = -32700;
      ErrorCodes2.InvalidRequest = -32600;
      ErrorCodes2.MethodNotFound = -32601;
      ErrorCodes2.InvalidParams = -32602;
      ErrorCodes2.InternalError = -32603;
      ErrorCodes2.jsonrpcReservedErrorRangeStart = -32099;
      ErrorCodes2.serverErrorStart = -32099;
      ErrorCodes2.MessageWriteError = -32099;
      ErrorCodes2.MessageReadError = -32098;
      ErrorCodes2.PendingResponseRejected = -32097;
      ErrorCodes2.ConnectionInactive = -32096;
      ErrorCodes2.ServerNotInitialized = -32002;
      ErrorCodes2.UnknownErrorCode = -32001;
      ErrorCodes2.jsonrpcReservedErrorRangeEnd = -32e3;
      ErrorCodes2.serverErrorEnd = -32e3;
    })(ErrorCodes || (exports2.ErrorCodes = ErrorCodes = {}));
    var ResponseError = class _ResponseError extends Error {
      constructor(code, message, data) {
        super(message);
        this.code = is.number(code) ? code : ErrorCodes.UnknownErrorCode;
        this.data = data;
        Object.setPrototypeOf(this, _ResponseError.prototype);
      }
      toJson() {
        const result = {
          code: this.code,
          message: this.message
        };
        if (this.data !== void 0) {
          result.data = this.data;
        }
        return result;
      }
    };
    exports2.ResponseError = ResponseError;
    var ParameterStructures = class _ParameterStructures {
      constructor(kind) {
        this.kind = kind;
      }
      static is(value) {
        return value === _ParameterStructures.auto || value === _ParameterStructures.byName || value === _ParameterStructures.byPosition;
      }
      toString() {
        return this.kind;
      }
    };
    exports2.ParameterStructures = ParameterStructures;
    ParameterStructures.auto = new ParameterStructures("auto");
    ParameterStructures.byPosition = new ParameterStructures("byPosition");
    ParameterStructures.byName = new ParameterStructures("byName");
    var AbstractMessageSignature = class {
      constructor(method, numberOfParams) {
        this.method = method;
        this.numberOfParams = numberOfParams;
      }
      get parameterStructures() {
        return ParameterStructures.auto;
      }
    };
    exports2.AbstractMessageSignature = AbstractMessageSignature;
    var RequestType0 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 0);
      }
    };
    exports2.RequestType0 = RequestType0;
    var RequestType = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports2.RequestType = RequestType;
    var RequestType1 = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports2.RequestType1 = RequestType1;
    var RequestType2 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 2);
      }
    };
    exports2.RequestType2 = RequestType2;
    var RequestType3 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 3);
      }
    };
    exports2.RequestType3 = RequestType3;
    var RequestType4 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 4);
      }
    };
    exports2.RequestType4 = RequestType4;
    var RequestType5 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 5);
      }
    };
    exports2.RequestType5 = RequestType5;
    var RequestType6 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 6);
      }
    };
    exports2.RequestType6 = RequestType6;
    var RequestType7 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 7);
      }
    };
    exports2.RequestType7 = RequestType7;
    var RequestType8 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 8);
      }
    };
    exports2.RequestType8 = RequestType8;
    var RequestType9 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 9);
      }
    };
    exports2.RequestType9 = RequestType9;
    var NotificationType = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports2.NotificationType = NotificationType;
    var NotificationType0 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 0);
      }
    };
    exports2.NotificationType0 = NotificationType0;
    var NotificationType1 = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports2.NotificationType1 = NotificationType1;
    var NotificationType2 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 2);
      }
    };
    exports2.NotificationType2 = NotificationType2;
    var NotificationType3 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 3);
      }
    };
    exports2.NotificationType3 = NotificationType3;
    var NotificationType4 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 4);
      }
    };
    exports2.NotificationType4 = NotificationType4;
    var NotificationType5 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 5);
      }
    };
    exports2.NotificationType5 = NotificationType5;
    var NotificationType6 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 6);
      }
    };
    exports2.NotificationType6 = NotificationType6;
    var NotificationType7 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 7);
      }
    };
    exports2.NotificationType7 = NotificationType7;
    var NotificationType8 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 8);
      }
    };
    exports2.NotificationType8 = NotificationType8;
    var NotificationType9 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 9);
      }
    };
    exports2.NotificationType9 = NotificationType9;
    var Message;
    (function(Message2) {
      function isRequest(message) {
        const candidate = message;
        return candidate && is.string(candidate.method) && (is.string(candidate.id) || is.number(candidate.id));
      }
      Message2.isRequest = isRequest;
      function isNotification(message) {
        const candidate = message;
        return candidate && is.string(candidate.method) && message.id === void 0;
      }
      Message2.isNotification = isNotification;
      function isResponse(message) {
        const candidate = message;
        return candidate && (candidate.result !== void 0 || !!candidate.error) && (is.string(candidate.id) || is.number(candidate.id) || candidate.id === null);
      }
      Message2.isResponse = isResponse;
    })(Message || (exports2.Message = Message = {}));
  }
});

// ../../node_modules/vscode-jsonrpc/lib/common/linkedMap.js
var require_linkedMap = __commonJS({
  "../../node_modules/vscode-jsonrpc/lib/common/linkedMap.js"(exports2) {
    "use strict";
    var _a;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LRUCache = exports2.LinkedMap = exports2.Touch = void 0;
    var Touch;
    (function(Touch2) {
      Touch2.None = 0;
      Touch2.First = 1;
      Touch2.AsOld = Touch2.First;
      Touch2.Last = 2;
      Touch2.AsNew = Touch2.Last;
    })(Touch || (exports2.Touch = Touch = {}));
    var LinkedMap = class {
      constructor() {
        this[_a] = "LinkedMap";
        this._map = /* @__PURE__ */ new Map();
        this._head = void 0;
        this._tail = void 0;
        this._size = 0;
        this._state = 0;
      }
      clear() {
        this._map.clear();
        this._head = void 0;
        this._tail = void 0;
        this._size = 0;
        this._state++;
      }
      isEmpty() {
        return !this._head && !this._tail;
      }
      get size() {
        return this._size;
      }
      get first() {
        return this._head?.value;
      }
      get last() {
        return this._tail?.value;
      }
      has(key) {
        return this._map.has(key);
      }
      get(key, touch = Touch.None) {
        const item = this._map.get(key);
        if (!item) {
          return void 0;
        }
        if (touch !== Touch.None) {
          this.touch(item, touch);
        }
        return item.value;
      }
      set(key, value, touch = Touch.None) {
        let item = this._map.get(key);
        if (item) {
          item.value = value;
          if (touch !== Touch.None) {
            this.touch(item, touch);
          }
        } else {
          item = { key, value, next: void 0, previous: void 0 };
          switch (touch) {
            case Touch.None:
              this.addItemLast(item);
              break;
            case Touch.First:
              this.addItemFirst(item);
              break;
            case Touch.Last:
              this.addItemLast(item);
              break;
            default:
              this.addItemLast(item);
              break;
          }
          this._map.set(key, item);
          this._size++;
        }
        return this;
      }
      delete(key) {
        return !!this.remove(key);
      }
      remove(key) {
        const item = this._map.get(key);
        if (!item) {
          return void 0;
        }
        this._map.delete(key);
        this.removeItem(item);
        this._size--;
        return item.value;
      }
      shift() {
        if (!this._head && !this._tail) {
          return void 0;
        }
        if (!this._head || !this._tail) {
          throw new Error("Invalid list");
        }
        const item = this._head;
        this._map.delete(item.key);
        this.removeItem(item);
        this._size--;
        return item.value;
      }
      forEach(callbackfn, thisArg) {
        const state = this._state;
        let current = this._head;
        while (current) {
          if (thisArg) {
            callbackfn.bind(thisArg)(current.value, current.key, this);
          } else {
            callbackfn(current.value, current.key, this);
          }
          if (this._state !== state) {
            throw new Error(`LinkedMap got modified during iteration.`);
          }
          current = current.next;
        }
      }
      keys() {
        const state = this._state;
        let current = this._head;
        const iterator = {
          [Symbol.iterator]: () => {
            return iterator;
          },
          next: () => {
            if (this._state !== state) {
              throw new Error(`LinkedMap got modified during iteration.`);
            }
            if (current) {
              const result = { value: current.key, done: false };
              current = current.next;
              return result;
            } else {
              return { value: void 0, done: true };
            }
          }
        };
        return iterator;
      }
      values() {
        const state = this._state;
        let current = this._head;
        const iterator = {
          [Symbol.iterator]: () => {
            return iterator;
          },
          next: () => {
            if (this._state !== state) {
              throw new Error(`LinkedMap got modified during iteration.`);
            }
            if (current) {
              const result = { value: current.value, done: false };
              current = current.next;
              return result;
            } else {
              return { value: void 0, done: true };
            }
          }
        };
        return iterator;
      }
      entries() {
        const state = this._state;
        let current = this._head;
        const iterator = {
          [Symbol.iterator]: () => {
            return iterator;
          },
          next: () => {
            if (this._state !== state) {
              throw new Error(`LinkedMap got modified during iteration.`);
            }
            if (current) {
              const result = { value: [current.key, current.value], done: false };
              current = current.next;
              return result;
            } else {
              return { value: void 0, done: true };
            }
          }
        };
        return iterator;
      }
      [(_a = Symbol.toStringTag, Symbol.iterator)]() {
        return this.entries();
      }
      trimOld(newSize) {
        if (newSize >= this.size) {
          return;
        }
        if (newSize === 0) {
          this.clear();
          return;
        }
        let current = this._head;
        let currentSize = this.size;
        while (current && currentSize > newSize) {
          this._map.delete(current.key);
          current = current.next;
          currentSize--;
        }
        this._head = current;
        this._size = currentSize;
        if (current) {
          current.previous = void 0;
        }
        this._state++;
      }
      addItemFirst(item) {
        if (!this._head && !this._tail) {
          this._tail = item;
        } else if (!this._head) {
          throw new Error("Invalid list");
        } else {
          item.next = this._head;
          this._head.previous = item;
        }
        this._head = item;
        this._state++;
      }
      addItemLast(item) {
        if (!this._head && !this._tail) {
          this._head = item;
        } else if (!this._tail) {
          throw new Error("Invalid list");
        } else {
          item.previous = this._tail;
          this._tail.next = item;
        }
        this._tail = item;
        this._state++;
      }
      removeItem(item) {
        if (item === this._head && item === this._tail) {
          this._head = void 0;
          this._tail = void 0;
        } else if (item === this._head) {
          if (!item.next) {
            throw new Error("Invalid list");
          }
          item.next.previous = void 0;
          this._head = item.next;
        } else if (item === this._tail) {
          if (!item.previous) {
            throw new Error("Invalid list");
          }
          item.previous.next = void 0;
          this._tail = item.previous;
        } else {
          const next = item.next;
          const previous = item.previous;
          if (!next || !previous) {
            throw new Error("Invalid list");
          }
          next.previous = previous;
          previous.next = next;
        }
        item.next = void 0;
        item.previous = void 0;
        this._state++;
      }
      touch(item, touch) {
        if (!this._head || !this._tail) {
          throw new Error("Invalid list");
        }
        if (touch !== Touch.First && touch !== Touch.Last) {
          return;
        }
        if (touch === Touch.First) {
          if (item === this._head) {
            return;
          }
          const next = item.next;
          const previous = item.previous;
          if (item === this._tail) {
            previous.next = void 0;
            this._tail = previous;
          } else {
            next.previous = previous;
            previous.next = next;
          }
          item.previous = void 0;
          item.next = this._head;
          this._head.previous = item;
          this._head = item;
          this._state++;
        } else if (touch === Touch.Last) {
          if (item === this._tail) {
            return;
          }
          const next = item.next;
          const previous = item.previous;
          if (item === this._head) {
            next.previous = void 0;
            this._head = next;
          } else {
            next.previous = previous;
            previous.next = next;
          }
          item.next = void 0;
          item.previous = this._tail;
          this._tail.next = item;
          this._tail = item;
          this._state++;
        }
      }
      toJSON() {
        const data = [];
        this.forEach((value, key) => {
          data.push([key, value]);
        });
        return data;
      }
      fromJSON(data) {
        this.clear();
        for (const [key, value] of data) {
          this.set(key, value);
        }
      }
    };
    exports2.LinkedMap = LinkedMap;
    var LRUCache = class extends LinkedMap {
      constructor(limit, ratio = 1) {
        super();
        this._limit = limit;
        this._ratio = Math.min(Math.max(0, ratio), 1);
      }
      get limit() {
        return this._limit;
      }
      set limit(limit) {
        this._limit = limit;
        this.checkTrim();
      }
      get ratio() {
        return this._ratio;
      }
      set ratio(ratio) {
        this._ratio = Math.min(Math.max(0, ratio), 1);
        this.checkTrim();
      }
      get(key, touch = Touch.AsNew) {
        return super.get(key, touch);
      }
      peek(key) {
        return super.get(key, Touch.None);
      }
      set(key, value) {
        super.set(key, value, Touch.Last);
        this.checkTrim();
        return this;
      }
      checkTrim() {
        if (this.size > this._limit) {
          this.trimOld(Math.round(this._limit * this._ratio));
        }
      }
    };
    exports2.LRUCache = LRUCache;
  }
});

// ../../node_modules/vscode-jsonrpc/lib/common/disposable.js
var require_disposable = __commonJS({
  "../../node_modules/vscode-jsonrpc/lib/common/disposable.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Disposable = void 0;
    var Disposable;
    (function(Disposable2) {
      function create(func) {
        return {
          dispose: func
        };
      }
      Disposable2.create = create;
    })(Disposable || (exports2.Disposable = Disposable = {}));
  }
});

// ../../node_modules/vscode-jsonrpc/lib/common/ral.js
var require_ral = __commonJS({
  "../../node_modules/vscode-jsonrpc/lib/common/ral.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var _ral;
    function RAL() {
      if (_ral === void 0) {
        throw new Error(`No runtime abstraction layer installed`);
      }
      return _ral;
    }
    (function(RAL2) {
      function install(ral) {
        if (ral === void 0) {
          throw new Error(`No runtime abstraction layer provided`);
        }
        _ral = ral;
      }
      RAL2.install = install;
    })(RAL || (RAL = {}));
    exports2.default = RAL;
  }
});

// ../../node_modules/vscode-jsonrpc/lib/common/events.js
var require_events = __commonJS({
  "../../node_modules/vscode-jsonrpc/lib/common/events.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Emitter = exports2.Event = void 0;
    var ral_1 = require_ral();
    var Event;
    (function(Event2) {
      const _disposable = { dispose() {
      } };
      Event2.None = function() {
        return _disposable;
      };
    })(Event || (exports2.Event = Event = {}));
    var CallbackList = class {
      add(callback, context = null, bucket) {
        if (!this._callbacks) {
          this._callbacks = [];
          this._contexts = [];
        }
        this._callbacks.push(callback);
        this._contexts.push(context);
        if (Array.isArray(bucket)) {
          bucket.push({ dispose: () => this.remove(callback, context) });
        }
      }
      remove(callback, context = null) {
        if (!this._callbacks) {
          return;
        }
        let foundCallbackWithDifferentContext = false;
        for (let i = 0, len = this._callbacks.length; i < len; i++) {
          if (this._callbacks[i] === callback) {
            if (this._contexts[i] === context) {
              this._callbacks.splice(i, 1);
              this._contexts.splice(i, 1);
              return;
            } else {
              foundCallbackWithDifferentContext = true;
            }
          }
        }
        if (foundCallbackWithDifferentContext) {
          throw new Error("When adding a listener with a context, you should remove it with the same context");
        }
      }
      invoke(...args) {
        if (!this._callbacks) {
          return [];
        }
        const ret = [], callbacks = this._callbacks.slice(0), contexts = this._contexts.slice(0);
        for (let i = 0, len = callbacks.length; i < len; i++) {
          try {
            ret.push(callbacks[i].apply(contexts[i], args));
          } catch (e) {
            (0, ral_1.default)().console.error(e);
          }
        }
        return ret;
      }
      isEmpty() {
        return !this._callbacks || this._callbacks.length === 0;
      }
      dispose() {
        this._callbacks = void 0;
        this._contexts = void 0;
      }
    };
    var Emitter = class _Emitter {
      constructor(_options) {
        this._options = _options;
      }
      /**
       * For the public to allow to subscribe
       * to events from this Emitter
       */
      get event() {
        if (!this._event) {
          this._event = (listener, thisArgs, disposables) => {
            if (!this._callbacks) {
              this._callbacks = new CallbackList();
            }
            if (this._options && this._options.onFirstListenerAdd && this._callbacks.isEmpty()) {
              this._options.onFirstListenerAdd(this);
            }
            this._callbacks.add(listener, thisArgs);
            const result = {
              dispose: () => {
                if (!this._callbacks) {
                  return;
                }
                this._callbacks.remove(listener, thisArgs);
                result.dispose = _Emitter._noop;
                if (this._options && this._options.onLastListenerRemove && this._callbacks.isEmpty()) {
                  this._options.onLastListenerRemove(this);
                }
              }
            };
            if (Array.isArray(disposables)) {
              disposables.push(result);
            }
            return result;
          };
        }
        return this._event;
      }
      /**
       * To be kept private to fire an event to
       * subscribers
       */
      fire(event) {
        if (this._callbacks) {
          this._callbacks.invoke.call(this._callbacks, event);
        }
      }
      dispose() {
        if (this._callbacks) {
          this._callbacks.dispose();
          this._callbacks = void 0;
        }
      }
    };
    exports2.Emitter = Emitter;
    Emitter._noop = function() {
    };
  }
});

// ../../node_modules/vscode-jsonrpc/lib/common/cancellation.js
var require_cancellation = __commonJS({
  "../../node_modules/vscode-jsonrpc/lib/common/cancellation.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CancellationTokenSource = exports2.CancellationToken = void 0;
    var ral_1 = require_ral();
    var Is = require_is2();
    var events_1 = require_events();
    var CancellationToken;
    (function(CancellationToken2) {
      CancellationToken2.None = Object.freeze({
        isCancellationRequested: false,
        onCancellationRequested: events_1.Event.None
      });
      CancellationToken2.Cancelled = Object.freeze({
        isCancellationRequested: true,
        onCancellationRequested: events_1.Event.None
      });
      function is(value) {
        const candidate = value;
        return candidate && (candidate === CancellationToken2.None || candidate === CancellationToken2.Cancelled || Is.boolean(candidate.isCancellationRequested) && !!candidate.onCancellationRequested);
      }
      CancellationToken2.is = is;
    })(CancellationToken || (exports2.CancellationToken = CancellationToken = {}));
    var shortcutEvent = Object.freeze(function(callback, context) {
      const handle = (0, ral_1.default)().timer.setTimeout(callback.bind(context), 0);
      return { dispose() {
        handle.dispose();
      } };
    });
    var MutableToken = class {
      constructor() {
        this._isCancelled = false;
      }
      cancel() {
        if (!this._isCancelled) {
          this._isCancelled = true;
          if (this._emitter) {
            this._emitter.fire(void 0);
            this.dispose();
          }
        }
      }
      get isCancellationRequested() {
        return this._isCancelled;
      }
      get onCancellationRequested() {
        if (this._isCancelled) {
          return shortcutEvent;
        }
        if (!this._emitter) {
          this._emitter = new events_1.Emitter();
        }
        return this._emitter.event;
      }
      dispose() {
        if (this._emitter) {
          this._emitter.dispose();
          this._emitter = void 0;
        }
      }
    };
    var CancellationTokenSource = class {
      get token() {
        if (!this._token) {
          this._token = new MutableToken();
        }
        return this._token;
      }
      cancel() {
        if (!this._token) {
          this._token = CancellationToken.Cancelled;
        } else {
          this._token.cancel();
        }
      }
      dispose() {
        if (!this._token) {
          this._token = CancellationToken.None;
        } else if (this._token instanceof MutableToken) {
          this._token.dispose();
        }
      }
    };
    exports2.CancellationTokenSource = CancellationTokenSource;
  }
});

// ../../node_modules/vscode-jsonrpc/lib/common/sharedArrayCancellation.js
var require_sharedArrayCancellation = __commonJS({
  "../../node_modules/vscode-jsonrpc/lib/common/sharedArrayCancellation.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SharedArrayReceiverStrategy = exports2.SharedArraySenderStrategy = void 0;
    var cancellation_1 = require_cancellation();
    var CancellationState;
    (function(CancellationState2) {
      CancellationState2.Continue = 0;
      CancellationState2.Cancelled = 1;
    })(CancellationState || (CancellationState = {}));
    var SharedArraySenderStrategy = class {
      constructor() {
        this.buffers = /* @__PURE__ */ new Map();
      }
      enableCancellation(request) {
        if (request.id === null) {
          return;
        }
        const buffer = new SharedArrayBuffer(4);
        const data = new Int32Array(buffer, 0, 1);
        data[0] = CancellationState.Continue;
        this.buffers.set(request.id, buffer);
        request.$cancellationData = buffer;
      }
      async sendCancellation(_conn, id) {
        const buffer = this.buffers.get(id);
        if (buffer === void 0) {
          return;
        }
        const data = new Int32Array(buffer, 0, 1);
        Atomics.store(data, 0, CancellationState.Cancelled);
      }
      cleanup(id) {
        this.buffers.delete(id);
      }
      dispose() {
        this.buffers.clear();
      }
    };
    exports2.SharedArraySenderStrategy = SharedArraySenderStrategy;
    var SharedArrayBufferCancellationToken = class {
      constructor(buffer) {
        this.data = new Int32Array(buffer, 0, 1);
      }
      get isCancellationRequested() {
        return Atomics.load(this.data, 0) === CancellationState.Cancelled;
      }
      get onCancellationRequested() {
        throw new Error(`Cancellation over SharedArrayBuffer doesn't support cancellation events`);
      }
    };
    var SharedArrayBufferCancellationTokenSource = class {
      constructor(buffer) {
        this.token = new SharedArrayBufferCancellationToken(buffer);
      }
      cancel() {
      }
      dispose() {
      }
    };
    var SharedArrayReceiverStrategy = class {
      constructor() {
        this.kind = "request";
      }
      createCancellationTokenSource(request) {
        const buffer = request.$cancellationData;
        if (buffer === void 0) {
          return new cancellation_1.CancellationTokenSource();
        }
        return new SharedArrayBufferCancellationTokenSource(buffer);
      }
    };
    exports2.SharedArrayReceiverStrategy = SharedArrayReceiverStrategy;
  }
});

// ../../node_modules/vscode-jsonrpc/lib/common/semaphore.js
var require_semaphore = __commonJS({
  "../../node_modules/vscode-jsonrpc/lib/common/semaphore.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Semaphore = void 0;
    var ral_1 = require_ral();
    var Semaphore = class {
      constructor(capacity = 1) {
        if (capacity <= 0) {
          throw new Error("Capacity must be greater than 0");
        }
        this._capacity = capacity;
        this._active = 0;
        this._waiting = [];
      }
      lock(thunk) {
        return new Promise((resolve, reject) => {
          this._waiting.push({ thunk, resolve, reject });
          this.runNext();
        });
      }
      get active() {
        return this._active;
      }
      runNext() {
        if (this._waiting.length === 0 || this._active === this._capacity) {
          return;
        }
        (0, ral_1.default)().timer.setImmediate(() => this.doRunNext());
      }
      doRunNext() {
        if (this._waiting.length === 0 || this._active === this._capacity) {
          return;
        }
        const next = this._waiting.shift();
        this._active++;
        if (this._active > this._capacity) {
          throw new Error(`To many thunks active`);
        }
        try {
          const result = next.thunk();
          if (result instanceof Promise) {
            result.then((value) => {
              this._active--;
              next.resolve(value);
              this.runNext();
            }, (err) => {
              this._active--;
              next.reject(err);
              this.runNext();
            });
          } else {
            this._active--;
            next.resolve(result);
            this.runNext();
          }
        } catch (err) {
          this._active--;
          next.reject(err);
          this.runNext();
        }
      }
    };
    exports2.Semaphore = Semaphore;
  }
});

// ../../node_modules/vscode-jsonrpc/lib/common/messageReader.js
var require_messageReader = __commonJS({
  "../../node_modules/vscode-jsonrpc/lib/common/messageReader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReadableStreamMessageReader = exports2.AbstractMessageReader = exports2.MessageReader = void 0;
    var ral_1 = require_ral();
    var Is = require_is2();
    var events_1 = require_events();
    var semaphore_1 = require_semaphore();
    var MessageReader;
    (function(MessageReader2) {
      function is(value) {
        let candidate = value;
        return candidate && Is.func(candidate.listen) && Is.func(candidate.dispose) && Is.func(candidate.onError) && Is.func(candidate.onClose) && Is.func(candidate.onPartialMessage);
      }
      MessageReader2.is = is;
    })(MessageReader || (exports2.MessageReader = MessageReader = {}));
    var AbstractMessageReader = class {
      constructor() {
        this.errorEmitter = new events_1.Emitter();
        this.closeEmitter = new events_1.Emitter();
        this.partialMessageEmitter = new events_1.Emitter();
      }
      dispose() {
        this.errorEmitter.dispose();
        this.closeEmitter.dispose();
      }
      get onError() {
        return this.errorEmitter.event;
      }
      fireError(error) {
        this.errorEmitter.fire(this.asError(error));
      }
      get onClose() {
        return this.closeEmitter.event;
      }
      fireClose() {
        this.closeEmitter.fire(void 0);
      }
      get onPartialMessage() {
        return this.partialMessageEmitter.event;
      }
      firePartialMessage(info) {
        this.partialMessageEmitter.fire(info);
      }
      asError(error) {
        if (error instanceof Error) {
          return error;
        } else {
          return new Error(`Reader received error. Reason: ${Is.string(error.message) ? error.message : "unknown"}`);
        }
      }
    };
    exports2.AbstractMessageReader = AbstractMessageReader;
    var ResolvedMessageReaderOptions;
    (function(ResolvedMessageReaderOptions2) {
      function fromOptions(options) {
        let charset;
        let result;
        let contentDecoder;
        const contentDecoders = /* @__PURE__ */ new Map();
        let contentTypeDecoder;
        const contentTypeDecoders = /* @__PURE__ */ new Map();
        if (options === void 0 || typeof options === "string") {
          charset = options ?? "utf-8";
        } else {
          charset = options.charset ?? "utf-8";
          if (options.contentDecoder !== void 0) {
            contentDecoder = options.contentDecoder;
            contentDecoders.set(contentDecoder.name, contentDecoder);
          }
          if (options.contentDecoders !== void 0) {
            for (const decoder of options.contentDecoders) {
              contentDecoders.set(decoder.name, decoder);
            }
          }
          if (options.contentTypeDecoder !== void 0) {
            contentTypeDecoder = options.contentTypeDecoder;
            contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
          }
          if (options.contentTypeDecoders !== void 0) {
            for (const decoder of options.contentTypeDecoders) {
              contentTypeDecoders.set(decoder.name, decoder);
            }
          }
        }
        if (contentTypeDecoder === void 0) {
          contentTypeDecoder = (0, ral_1.default)().applicationJson.decoder;
          contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
        }
        return { charset, contentDecoder, contentDecoders, contentTypeDecoder, contentTypeDecoders };
      }
      ResolvedMessageReaderOptions2.fromOptions = fromOptions;
    })(ResolvedMessageReaderOptions || (ResolvedMessageReaderOptions = {}));
    var ReadableStreamMessageReader = class extends AbstractMessageReader {
      constructor(readable, options) {
        super();
        this.readable = readable;
        this.options = ResolvedMessageReaderOptions.fromOptions(options);
        this.buffer = (0, ral_1.default)().messageBuffer.create(this.options.charset);
        this._partialMessageTimeout = 1e4;
        this.nextMessageLength = -1;
        this.messageToken = 0;
        this.readSemaphore = new semaphore_1.Semaphore(1);
      }
      set partialMessageTimeout(timeout) {
        this._partialMessageTimeout = timeout;
      }
      get partialMessageTimeout() {
        return this._partialMessageTimeout;
      }
      listen(callback) {
        this.nextMessageLength = -1;
        this.messageToken = 0;
        this.partialMessageTimer = void 0;
        this.callback = callback;
        const result = this.readable.onData((data) => {
          this.onData(data);
        });
        this.readable.onError((error) => this.fireError(error));
        this.readable.onClose(() => this.fireClose());
        return result;
      }
      onData(data) {
        try {
          this.buffer.append(data);
          while (true) {
            if (this.nextMessageLength === -1) {
              const headers = this.buffer.tryReadHeaders(true);
              if (!headers) {
                return;
              }
              const contentLength = headers.get("content-length");
              if (!contentLength) {
                this.fireError(new Error(`Header must provide a Content-Length property.
${JSON.stringify(Object.fromEntries(headers))}`));
                return;
              }
              const length = parseInt(contentLength);
              if (isNaN(length)) {
                this.fireError(new Error(`Content-Length value must be a number. Got ${contentLength}`));
                return;
              }
              this.nextMessageLength = length;
            }
            const body = this.buffer.tryReadBody(this.nextMessageLength);
            if (body === void 0) {
              this.setPartialMessageTimer();
              return;
            }
            this.clearPartialMessageTimer();
            this.nextMessageLength = -1;
            this.readSemaphore.lock(async () => {
              const bytes = this.options.contentDecoder !== void 0 ? await this.options.contentDecoder.decode(body) : body;
              const message = await this.options.contentTypeDecoder.decode(bytes, this.options);
              this.callback(message);
            }).catch((error) => {
              this.fireError(error);
            });
          }
        } catch (error) {
          this.fireError(error);
        }
      }
      clearPartialMessageTimer() {
        if (this.partialMessageTimer) {
          this.partialMessageTimer.dispose();
          this.partialMessageTimer = void 0;
        }
      }
      setPartialMessageTimer() {
        this.clearPartialMessageTimer();
        if (this._partialMessageTimeout <= 0) {
          return;
        }
        this.partialMessageTimer = (0, ral_1.default)().timer.setTimeout((token, timeout) => {
          this.partialMessageTimer = void 0;
          if (token === this.messageToken) {
            this.firePartialMessage({ messageToken: token, waitingTime: timeout });
            this.setPartialMessageTimer();
          }
        }, this._partialMessageTimeout, this.messageToken, this._partialMessageTimeout);
      }
    };
    exports2.ReadableStreamMessageReader = ReadableStreamMessageReader;
  }
});

// ../../node_modules/vscode-jsonrpc/lib/common/messageWriter.js
var require_messageWriter = __commonJS({
  "../../node_modules/vscode-jsonrpc/lib/common/messageWriter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WriteableStreamMessageWriter = exports2.AbstractMessageWriter = exports2.MessageWriter = void 0;
    var ral_1 = require_ral();
    var Is = require_is2();
    var semaphore_1 = require_semaphore();
    var events_1 = require_events();
    var ContentLength = "Content-Length: ";
    var CRLF = "\r\n";
    var MessageWriter;
    (function(MessageWriter2) {
      function is(value) {
        let candidate = value;
        return candidate && Is.func(candidate.dispose) && Is.func(candidate.onClose) && Is.func(candidate.onError) && Is.func(candidate.write);
      }
      MessageWriter2.is = is;
    })(MessageWriter || (exports2.MessageWriter = MessageWriter = {}));
    var AbstractMessageWriter = class {
      constructor() {
        this.errorEmitter = new events_1.Emitter();
        this.closeEmitter = new events_1.Emitter();
      }
      dispose() {
        this.errorEmitter.dispose();
        this.closeEmitter.dispose();
      }
      get onError() {
        return this.errorEmitter.event;
      }
      fireError(error, message, count) {
        this.errorEmitter.fire([this.asError(error), message, count]);
      }
      get onClose() {
        return this.closeEmitter.event;
      }
      fireClose() {
        this.closeEmitter.fire(void 0);
      }
      asError(error) {
        if (error instanceof Error) {
          return error;
        } else {
          return new Error(`Writer received error. Reason: ${Is.string(error.message) ? error.message : "unknown"}`);
        }
      }
    };
    exports2.AbstractMessageWriter = AbstractMessageWriter;
    var ResolvedMessageWriterOptions;
    (function(ResolvedMessageWriterOptions2) {
      function fromOptions(options) {
        if (options === void 0 || typeof options === "string") {
          return { charset: options ?? "utf-8", contentTypeEncoder: (0, ral_1.default)().applicationJson.encoder };
        } else {
          return { charset: options.charset ?? "utf-8", contentEncoder: options.contentEncoder, contentTypeEncoder: options.contentTypeEncoder ?? (0, ral_1.default)().applicationJson.encoder };
        }
      }
      ResolvedMessageWriterOptions2.fromOptions = fromOptions;
    })(ResolvedMessageWriterOptions || (ResolvedMessageWriterOptions = {}));
    var WriteableStreamMessageWriter = class extends AbstractMessageWriter {
      constructor(writable, options) {
        super();
        this.writable = writable;
        this.options = ResolvedMessageWriterOptions.fromOptions(options);
        this.errorCount = 0;
        this.writeSemaphore = new semaphore_1.Semaphore(1);
        this.writable.onError((error) => this.fireError(error));
        this.writable.onClose(() => this.fireClose());
      }
      async write(msg) {
        return this.writeSemaphore.lock(async () => {
          const payload = this.options.contentTypeEncoder.encode(msg, this.options).then((buffer) => {
            if (this.options.contentEncoder !== void 0) {
              return this.options.contentEncoder.encode(buffer);
            } else {
              return buffer;
            }
          });
          return payload.then((buffer) => {
            const headers = [];
            headers.push(ContentLength, buffer.byteLength.toString(), CRLF);
            headers.push(CRLF);
            return this.doWrite(msg, headers, buffer);
          }, (error) => {
            this.fireError(error);
            throw error;
          });
        });
      }
      async doWrite(msg, headers, data) {
        try {
          await this.writable.write(headers.join(""), "ascii");
          return this.writable.write(data);
        } catch (error) {
          this.handleError(error, msg);
          return Promise.reject(error);
        }
      }
      handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
      }
      end() {
        this.writable.end();
      }
    };
    exports2.WriteableStreamMessageWriter = WriteableStreamMessageWriter;
  }
});

// ../../node_modules/vscode-jsonrpc/lib/common/messageBuffer.js
var require_messageBuffer = __commonJS({
  "../../node_modules/vscode-jsonrpc/lib/common/messageBuffer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AbstractMessageBuffer = void 0;
    var CR = 13;
    var LF = 10;
    var CRLF = "\r\n";
    var AbstractMessageBuffer = class {
      constructor(encoding = "utf-8") {
        this._encoding = encoding;
        this._chunks = [];
        this._totalLength = 0;
      }
      get encoding() {
        return this._encoding;
      }
      append(chunk) {
        const toAppend = typeof chunk === "string" ? this.fromString(chunk, this._encoding) : chunk;
        this._chunks.push(toAppend);
        this._totalLength += toAppend.byteLength;
      }
      tryReadHeaders(lowerCaseKeys = false) {
        if (this._chunks.length === 0) {
          return void 0;
        }
        let state = 0;
        let chunkIndex = 0;
        let offset = 0;
        let chunkBytesRead = 0;
        row:
          while (chunkIndex < this._chunks.length) {
            const chunk = this._chunks[chunkIndex];
            offset = 0;
            column:
              while (offset < chunk.length) {
                const value = chunk[offset];
                switch (value) {
                  case CR:
                    switch (state) {
                      case 0:
                        state = 1;
                        break;
                      case 2:
                        state = 3;
                        break;
                      default:
                        state = 0;
                    }
                    break;
                  case LF:
                    switch (state) {
                      case 1:
                        state = 2;
                        break;
                      case 3:
                        state = 4;
                        offset++;
                        break row;
                      default:
                        state = 0;
                    }
                    break;
                  default:
                    state = 0;
                }
                offset++;
              }
            chunkBytesRead += chunk.byteLength;
            chunkIndex++;
          }
        if (state !== 4) {
          return void 0;
        }
        const buffer = this._read(chunkBytesRead + offset);
        const result = /* @__PURE__ */ new Map();
        const headers = this.toString(buffer, "ascii").split(CRLF);
        if (headers.length < 2) {
          return result;
        }
        for (let i = 0; i < headers.length - 2; i++) {
          const header = headers[i];
          const index = header.indexOf(":");
          if (index === -1) {
            throw new Error(`Message header must separate key and value using ':'
${header}`);
          }
          const key = header.substr(0, index);
          const value = header.substr(index + 1).trim();
          result.set(lowerCaseKeys ? key.toLowerCase() : key, value);
        }
        return result;
      }
      tryReadBody(length) {
        if (this._totalLength < length) {
          return void 0;
        }
        return this._read(length);
      }
      get numberOfBytes() {
        return this._totalLength;
      }
      _read(byteCount) {
        if (byteCount === 0) {
          return this.emptyBuffer();
        }
        if (byteCount > this._totalLength) {
          throw new Error(`Cannot read so many bytes!`);
        }
        if (this._chunks[0].byteLength === byteCount) {
          const chunk = this._chunks[0];
          this._chunks.shift();
          this._totalLength -= byteCount;
          return this.asNative(chunk);
        }
        if (this._chunks[0].byteLength > byteCount) {
          const chunk = this._chunks[0];
          const result2 = this.asNative(chunk, byteCount);
          this._chunks[0] = chunk.slice(byteCount);
          this._totalLength -= byteCount;
          return result2;
        }
        const result = this.allocNative(byteCount);
        let resultOffset = 0;
        let chunkIndex = 0;
        while (byteCount > 0) {
          const chunk = this._chunks[chunkIndex];
          if (chunk.byteLength > byteCount) {
            const chunkPart = chunk.slice(0, byteCount);
            result.set(chunkPart, resultOffset);
            resultOffset += byteCount;
            this._chunks[chunkIndex] = chunk.slice(byteCount);
            this._totalLength -= byteCount;
            byteCount -= byteCount;
          } else {
            result.set(chunk, resultOffset);
            resultOffset += chunk.byteLength;
            this._chunks.shift();
            this._totalLength -= chunk.byteLength;
            byteCount -= chunk.byteLength;
          }
        }
        return result;
      }
    };
    exports2.AbstractMessageBuffer = AbstractMessageBuffer;
  }
});

// ../../node_modules/vscode-jsonrpc/lib/common/connection.js
var require_connection = __commonJS({
  "../../node_modules/vscode-jsonrpc/lib/common/connection.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createMessageConnection = exports2.ConnectionOptions = exports2.MessageStrategy = exports2.CancellationStrategy = exports2.CancellationSenderStrategy = exports2.CancellationReceiverStrategy = exports2.RequestCancellationReceiverStrategy = exports2.IdCancellationReceiverStrategy = exports2.ConnectionStrategy = exports2.ConnectionError = exports2.ConnectionErrors = exports2.LogTraceNotification = exports2.SetTraceNotification = exports2.TraceFormat = exports2.TraceValues = exports2.Trace = exports2.NullLogger = exports2.ProgressType = exports2.ProgressToken = void 0;
    var ral_1 = require_ral();
    var Is = require_is2();
    var messages_1 = require_messages();
    var linkedMap_1 = require_linkedMap();
    var events_1 = require_events();
    var cancellation_1 = require_cancellation();
    var CancelNotification;
    (function(CancelNotification2) {
      CancelNotification2.type = new messages_1.NotificationType("$/cancelRequest");
    })(CancelNotification || (CancelNotification = {}));
    var ProgressToken;
    (function(ProgressToken2) {
      function is(value) {
        return typeof value === "string" || typeof value === "number";
      }
      ProgressToken2.is = is;
    })(ProgressToken || (exports2.ProgressToken = ProgressToken = {}));
    var ProgressNotification;
    (function(ProgressNotification2) {
      ProgressNotification2.type = new messages_1.NotificationType("$/progress");
    })(ProgressNotification || (ProgressNotification = {}));
    var ProgressType = class {
      constructor() {
      }
    };
    exports2.ProgressType = ProgressType;
    var StarRequestHandler;
    (function(StarRequestHandler2) {
      function is(value) {
        return Is.func(value);
      }
      StarRequestHandler2.is = is;
    })(StarRequestHandler || (StarRequestHandler = {}));
    exports2.NullLogger = Object.freeze({
      error: () => {
      },
      warn: () => {
      },
      info: () => {
      },
      log: () => {
      }
    });
    var Trace;
    (function(Trace2) {
      Trace2[Trace2["Off"] = 0] = "Off";
      Trace2[Trace2["Messages"] = 1] = "Messages";
      Trace2[Trace2["Compact"] = 2] = "Compact";
      Trace2[Trace2["Verbose"] = 3] = "Verbose";
    })(Trace || (exports2.Trace = Trace = {}));
    var TraceValues;
    (function(TraceValues2) {
      TraceValues2.Off = "off";
      TraceValues2.Messages = "messages";
      TraceValues2.Compact = "compact";
      TraceValues2.Verbose = "verbose";
    })(TraceValues || (exports2.TraceValues = TraceValues = {}));
    (function(Trace2) {
      function fromString(value) {
        if (!Is.string(value)) {
          return Trace2.Off;
        }
        value = value.toLowerCase();
        switch (value) {
          case "off":
            return Trace2.Off;
          case "messages":
            return Trace2.Messages;
          case "compact":
            return Trace2.Compact;
          case "verbose":
            return Trace2.Verbose;
          default:
            return Trace2.Off;
        }
      }
      Trace2.fromString = fromString;
      function toString(value) {
        switch (value) {
          case Trace2.Off:
            return "off";
          case Trace2.Messages:
            return "messages";
          case Trace2.Compact:
            return "compact";
          case Trace2.Verbose:
            return "verbose";
          default:
            return "off";
        }
      }
      Trace2.toString = toString;
    })(Trace || (exports2.Trace = Trace = {}));
    var TraceFormat;
    (function(TraceFormat2) {
      TraceFormat2["Text"] = "text";
      TraceFormat2["JSON"] = "json";
    })(TraceFormat || (exports2.TraceFormat = TraceFormat = {}));
    (function(TraceFormat2) {
      function fromString(value) {
        if (!Is.string(value)) {
          return TraceFormat2.Text;
        }
        value = value.toLowerCase();
        if (value === "json") {
          return TraceFormat2.JSON;
        } else {
          return TraceFormat2.Text;
        }
      }
      TraceFormat2.fromString = fromString;
    })(TraceFormat || (exports2.TraceFormat = TraceFormat = {}));
    var SetTraceNotification;
    (function(SetTraceNotification2) {
      SetTraceNotification2.type = new messages_1.NotificationType("$/setTrace");
    })(SetTraceNotification || (exports2.SetTraceNotification = SetTraceNotification = {}));
    var LogTraceNotification;
    (function(LogTraceNotification2) {
      LogTraceNotification2.type = new messages_1.NotificationType("$/logTrace");
    })(LogTraceNotification || (exports2.LogTraceNotification = LogTraceNotification = {}));
    var ConnectionErrors;
    (function(ConnectionErrors2) {
      ConnectionErrors2[ConnectionErrors2["Closed"] = 1] = "Closed";
      ConnectionErrors2[ConnectionErrors2["Disposed"] = 2] = "Disposed";
      ConnectionErrors2[ConnectionErrors2["AlreadyListening"] = 3] = "AlreadyListening";
    })(ConnectionErrors || (exports2.ConnectionErrors = ConnectionErrors = {}));
    var ConnectionError = class _ConnectionError extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
        Object.setPrototypeOf(this, _ConnectionError.prototype);
      }
    };
    exports2.ConnectionError = ConnectionError;
    var ConnectionStrategy;
    (function(ConnectionStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.cancelUndispatched);
      }
      ConnectionStrategy2.is = is;
    })(ConnectionStrategy || (exports2.ConnectionStrategy = ConnectionStrategy = {}));
    var IdCancellationReceiverStrategy;
    (function(IdCancellationReceiverStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && (candidate.kind === void 0 || candidate.kind === "id") && Is.func(candidate.createCancellationTokenSource) && (candidate.dispose === void 0 || Is.func(candidate.dispose));
      }
      IdCancellationReceiverStrategy2.is = is;
    })(IdCancellationReceiverStrategy || (exports2.IdCancellationReceiverStrategy = IdCancellationReceiverStrategy = {}));
    var RequestCancellationReceiverStrategy;
    (function(RequestCancellationReceiverStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && candidate.kind === "request" && Is.func(candidate.createCancellationTokenSource) && (candidate.dispose === void 0 || Is.func(candidate.dispose));
      }
      RequestCancellationReceiverStrategy2.is = is;
    })(RequestCancellationReceiverStrategy || (exports2.RequestCancellationReceiverStrategy = RequestCancellationReceiverStrategy = {}));
    var CancellationReceiverStrategy;
    (function(CancellationReceiverStrategy2) {
      CancellationReceiverStrategy2.Message = Object.freeze({
        createCancellationTokenSource(_) {
          return new cancellation_1.CancellationTokenSource();
        }
      });
      function is(value) {
        return IdCancellationReceiverStrategy.is(value) || RequestCancellationReceiverStrategy.is(value);
      }
      CancellationReceiverStrategy2.is = is;
    })(CancellationReceiverStrategy || (exports2.CancellationReceiverStrategy = CancellationReceiverStrategy = {}));
    var CancellationSenderStrategy;
    (function(CancellationSenderStrategy2) {
      CancellationSenderStrategy2.Message = Object.freeze({
        sendCancellation(conn, id) {
          return conn.sendNotification(CancelNotification.type, { id });
        },
        cleanup(_) {
        }
      });
      function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.sendCancellation) && Is.func(candidate.cleanup);
      }
      CancellationSenderStrategy2.is = is;
    })(CancellationSenderStrategy || (exports2.CancellationSenderStrategy = CancellationSenderStrategy = {}));
    var CancellationStrategy;
    (function(CancellationStrategy2) {
      CancellationStrategy2.Message = Object.freeze({
        receiver: CancellationReceiverStrategy.Message,
        sender: CancellationSenderStrategy.Message
      });
      function is(value) {
        const candidate = value;
        return candidate && CancellationReceiverStrategy.is(candidate.receiver) && CancellationSenderStrategy.is(candidate.sender);
      }
      CancellationStrategy2.is = is;
    })(CancellationStrategy || (exports2.CancellationStrategy = CancellationStrategy = {}));
    var MessageStrategy;
    (function(MessageStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.handleMessage);
      }
      MessageStrategy2.is = is;
    })(MessageStrategy || (exports2.MessageStrategy = MessageStrategy = {}));
    var ConnectionOptions;
    (function(ConnectionOptions2) {
      function is(value) {
        const candidate = value;
        return candidate && (CancellationStrategy.is(candidate.cancellationStrategy) || ConnectionStrategy.is(candidate.connectionStrategy) || MessageStrategy.is(candidate.messageStrategy));
      }
      ConnectionOptions2.is = is;
    })(ConnectionOptions || (exports2.ConnectionOptions = ConnectionOptions = {}));
    var ConnectionState;
    (function(ConnectionState2) {
      ConnectionState2[ConnectionState2["New"] = 1] = "New";
      ConnectionState2[ConnectionState2["Listening"] = 2] = "Listening";
      ConnectionState2[ConnectionState2["Closed"] = 3] = "Closed";
      ConnectionState2[ConnectionState2["Disposed"] = 4] = "Disposed";
    })(ConnectionState || (ConnectionState = {}));
    function createMessageConnection(messageReader, messageWriter, _logger, options) {
      const logger = _logger !== void 0 ? _logger : exports2.NullLogger;
      let sequenceNumber = 0;
      let notificationSequenceNumber = 0;
      let unknownResponseSequenceNumber = 0;
      const version = "2.0";
      let starRequestHandler = void 0;
      const requestHandlers = /* @__PURE__ */ new Map();
      let starNotificationHandler = void 0;
      const notificationHandlers = /* @__PURE__ */ new Map();
      const progressHandlers = /* @__PURE__ */ new Map();
      let timer;
      let messageQueue = new linkedMap_1.LinkedMap();
      let responsePromises = /* @__PURE__ */ new Map();
      let knownCanceledRequests = /* @__PURE__ */ new Set();
      let requestTokens = /* @__PURE__ */ new Map();
      let trace = Trace.Off;
      let traceFormat = TraceFormat.Text;
      let tracer;
      let state = ConnectionState.New;
      const errorEmitter = new events_1.Emitter();
      const closeEmitter = new events_1.Emitter();
      const unhandledNotificationEmitter = new events_1.Emitter();
      const unhandledProgressEmitter = new events_1.Emitter();
      const disposeEmitter = new events_1.Emitter();
      const cancellationStrategy = options && options.cancellationStrategy ? options.cancellationStrategy : CancellationStrategy.Message;
      function createRequestQueueKey(id) {
        if (id === null) {
          throw new Error(`Can't send requests with id null since the response can't be correlated.`);
        }
        return "req-" + id.toString();
      }
      function createResponseQueueKey(id) {
        if (id === null) {
          return "res-unknown-" + (++unknownResponseSequenceNumber).toString();
        } else {
          return "res-" + id.toString();
        }
      }
      function createNotificationQueueKey() {
        return "not-" + (++notificationSequenceNumber).toString();
      }
      function addMessageToQueue(queue, message) {
        if (messages_1.Message.isRequest(message)) {
          queue.set(createRequestQueueKey(message.id), message);
        } else if (messages_1.Message.isResponse(message)) {
          queue.set(createResponseQueueKey(message.id), message);
        } else {
          queue.set(createNotificationQueueKey(), message);
        }
      }
      function cancelUndispatched(_message) {
        return void 0;
      }
      function isListening() {
        return state === ConnectionState.Listening;
      }
      function isClosed() {
        return state === ConnectionState.Closed;
      }
      function isDisposed() {
        return state === ConnectionState.Disposed;
      }
      function closeHandler() {
        if (state === ConnectionState.New || state === ConnectionState.Listening) {
          state = ConnectionState.Closed;
          closeEmitter.fire(void 0);
        }
      }
      function readErrorHandler(error) {
        errorEmitter.fire([error, void 0, void 0]);
      }
      function writeErrorHandler(data) {
        errorEmitter.fire(data);
      }
      messageReader.onClose(closeHandler);
      messageReader.onError(readErrorHandler);
      messageWriter.onClose(closeHandler);
      messageWriter.onError(writeErrorHandler);
      function triggerMessageQueue() {
        if (timer || messageQueue.size === 0) {
          return;
        }
        timer = (0, ral_1.default)().timer.setImmediate(() => {
          timer = void 0;
          processMessageQueue();
        });
      }
      function handleMessage(message) {
        if (messages_1.Message.isRequest(message)) {
          handleRequest(message);
        } else if (messages_1.Message.isNotification(message)) {
          handleNotification(message);
        } else if (messages_1.Message.isResponse(message)) {
          handleResponse(message);
        } else {
          handleInvalidMessage(message);
        }
      }
      function processMessageQueue() {
        if (messageQueue.size === 0) {
          return;
        }
        const message = messageQueue.shift();
        try {
          const messageStrategy = options?.messageStrategy;
          if (MessageStrategy.is(messageStrategy)) {
            messageStrategy.handleMessage(message, handleMessage);
          } else {
            handleMessage(message);
          }
        } finally {
          triggerMessageQueue();
        }
      }
      const callback = (message) => {
        try {
          if (messages_1.Message.isNotification(message) && message.method === CancelNotification.type.method) {
            const cancelId = message.params.id;
            const key = createRequestQueueKey(cancelId);
            const toCancel = messageQueue.get(key);
            if (messages_1.Message.isRequest(toCancel)) {
              const strategy = options?.connectionStrategy;
              const response = strategy && strategy.cancelUndispatched ? strategy.cancelUndispatched(toCancel, cancelUndispatched) : cancelUndispatched(toCancel);
              if (response && (response.error !== void 0 || response.result !== void 0)) {
                messageQueue.delete(key);
                requestTokens.delete(cancelId);
                response.id = toCancel.id;
                traceSendingResponse(response, message.method, Date.now());
                messageWriter.write(response).catch(() => logger.error(`Sending response for canceled message failed.`));
                return;
              }
            }
            const cancellationToken = requestTokens.get(cancelId);
            if (cancellationToken !== void 0) {
              cancellationToken.cancel();
              traceReceivedNotification(message);
              return;
            } else {
              knownCanceledRequests.add(cancelId);
            }
          }
          addMessageToQueue(messageQueue, message);
        } finally {
          triggerMessageQueue();
        }
      };
      function handleRequest(requestMessage) {
        if (isDisposed()) {
          return;
        }
        function reply(resultOrError, method, startTime2) {
          const message = {
            jsonrpc: version,
            id: requestMessage.id
          };
          if (resultOrError instanceof messages_1.ResponseError) {
            message.error = resultOrError.toJson();
          } else {
            message.result = resultOrError === void 0 ? null : resultOrError;
          }
          traceSendingResponse(message, method, startTime2);
          messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
        }
        function replyError(error, method, startTime2) {
          const message = {
            jsonrpc: version,
            id: requestMessage.id,
            error: error.toJson()
          };
          traceSendingResponse(message, method, startTime2);
          messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
        }
        function replySuccess(result, method, startTime2) {
          if (result === void 0) {
            result = null;
          }
          const message = {
            jsonrpc: version,
            id: requestMessage.id,
            result
          };
          traceSendingResponse(message, method, startTime2);
          messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
        }
        traceReceivedRequest(requestMessage);
        const element = requestHandlers.get(requestMessage.method);
        let type;
        let requestHandler;
        if (element) {
          type = element.type;
          requestHandler = element.handler;
        }
        const startTime = Date.now();
        if (requestHandler || starRequestHandler) {
          const tokenKey = requestMessage.id ?? String(Date.now());
          const cancellationSource = IdCancellationReceiverStrategy.is(cancellationStrategy.receiver) ? cancellationStrategy.receiver.createCancellationTokenSource(tokenKey) : cancellationStrategy.receiver.createCancellationTokenSource(requestMessage);
          if (requestMessage.id !== null && knownCanceledRequests.has(requestMessage.id)) {
            cancellationSource.cancel();
          }
          if (requestMessage.id !== null) {
            requestTokens.set(tokenKey, cancellationSource);
          }
          try {
            let handlerResult;
            if (requestHandler) {
              if (requestMessage.params === void 0) {
                if (type !== void 0 && type.numberOfParams !== 0) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines ${type.numberOfParams} params but received none.`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(cancellationSource.token);
              } else if (Array.isArray(requestMessage.params)) {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byName) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by name but received parameters by position`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(...requestMessage.params, cancellationSource.token);
              } else {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byPosition) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by position but received parameters by name`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(requestMessage.params, cancellationSource.token);
              }
            } else if (starRequestHandler) {
              handlerResult = starRequestHandler(requestMessage.method, requestMessage.params, cancellationSource.token);
            }
            const promise = handlerResult;
            if (!handlerResult) {
              requestTokens.delete(tokenKey);
              replySuccess(handlerResult, requestMessage.method, startTime);
            } else if (promise.then) {
              promise.then((resultOrError) => {
                requestTokens.delete(tokenKey);
                reply(resultOrError, requestMessage.method, startTime);
              }, (error) => {
                requestTokens.delete(tokenKey);
                if (error instanceof messages_1.ResponseError) {
                  replyError(error, requestMessage.method, startTime);
                } else if (error && Is.string(error.message)) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error.message}`), requestMessage.method, startTime);
                } else {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
                }
              });
            } else {
              requestTokens.delete(tokenKey);
              reply(handlerResult, requestMessage.method, startTime);
            }
          } catch (error) {
            requestTokens.delete(tokenKey);
            if (error instanceof messages_1.ResponseError) {
              reply(error, requestMessage.method, startTime);
            } else if (error && Is.string(error.message)) {
              replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error.message}`), requestMessage.method, startTime);
            } else {
              replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
            }
          }
        } else {
          replyError(new messages_1.ResponseError(messages_1.ErrorCodes.MethodNotFound, `Unhandled method ${requestMessage.method}`), requestMessage.method, startTime);
        }
      }
      function handleResponse(responseMessage) {
        if (isDisposed()) {
          return;
        }
        if (responseMessage.id === null) {
          if (responseMessage.error) {
            logger.error(`Received response message without id: Error is: 
${JSON.stringify(responseMessage.error, void 0, 4)}`);
          } else {
            logger.error(`Received response message without id. No further error information provided.`);
          }
        } else {
          const key = responseMessage.id;
          const responsePromise = responsePromises.get(key);
          traceReceivedResponse(responseMessage, responsePromise);
          if (responsePromise !== void 0) {
            responsePromises.delete(key);
            try {
              if (responseMessage.error) {
                const error = responseMessage.error;
                responsePromise.reject(new messages_1.ResponseError(error.code, error.message, error.data));
              } else if (responseMessage.result !== void 0) {
                responsePromise.resolve(responseMessage.result);
              } else {
                throw new Error("Should never happen.");
              }
            } catch (error) {
              if (error.message) {
                logger.error(`Response handler '${responsePromise.method}' failed with message: ${error.message}`);
              } else {
                logger.error(`Response handler '${responsePromise.method}' failed unexpectedly.`);
              }
            }
          }
        }
      }
      function handleNotification(message) {
        if (isDisposed()) {
          return;
        }
        let type = void 0;
        let notificationHandler;
        if (message.method === CancelNotification.type.method) {
          const cancelId = message.params.id;
          knownCanceledRequests.delete(cancelId);
          traceReceivedNotification(message);
          return;
        } else {
          const element = notificationHandlers.get(message.method);
          if (element) {
            notificationHandler = element.handler;
            type = element.type;
          }
        }
        if (notificationHandler || starNotificationHandler) {
          try {
            traceReceivedNotification(message);
            if (notificationHandler) {
              if (message.params === void 0) {
                if (type !== void 0) {
                  if (type.numberOfParams !== 0 && type.parameterStructures !== messages_1.ParameterStructures.byName) {
                    logger.error(`Notification ${message.method} defines ${type.numberOfParams} params but received none.`);
                  }
                }
                notificationHandler();
              } else if (Array.isArray(message.params)) {
                const params = message.params;
                if (message.method === ProgressNotification.type.method && params.length === 2 && ProgressToken.is(params[0])) {
                  notificationHandler({ token: params[0], value: params[1] });
                } else {
                  if (type !== void 0) {
                    if (type.parameterStructures === messages_1.ParameterStructures.byName) {
                      logger.error(`Notification ${message.method} defines parameters by name but received parameters by position`);
                    }
                    if (type.numberOfParams !== message.params.length) {
                      logger.error(`Notification ${message.method} defines ${type.numberOfParams} params but received ${params.length} arguments`);
                    }
                  }
                  notificationHandler(...params);
                }
              } else {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byPosition) {
                  logger.error(`Notification ${message.method} defines parameters by position but received parameters by name`);
                }
                notificationHandler(message.params);
              }
            } else if (starNotificationHandler) {
              starNotificationHandler(message.method, message.params);
            }
          } catch (error) {
            if (error.message) {
              logger.error(`Notification handler '${message.method}' failed with message: ${error.message}`);
            } else {
              logger.error(`Notification handler '${message.method}' failed unexpectedly.`);
            }
          }
        } else {
          unhandledNotificationEmitter.fire(message);
        }
      }
      function handleInvalidMessage(message) {
        if (!message) {
          logger.error("Received empty message.");
          return;
        }
        logger.error(`Received message which is neither a response nor a notification message:
${JSON.stringify(message, null, 4)}`);
        const responseMessage = message;
        if (Is.string(responseMessage.id) || Is.number(responseMessage.id)) {
          const key = responseMessage.id;
          const responseHandler = responsePromises.get(key);
          if (responseHandler) {
            responseHandler.reject(new Error("The received response has neither a result nor an error property."));
          }
        }
      }
      function stringifyTrace(params) {
        if (params === void 0 || params === null) {
          return void 0;
        }
        switch (trace) {
          case Trace.Verbose:
            return JSON.stringify(params, null, 4);
          case Trace.Compact:
            return JSON.stringify(params);
          default:
            return void 0;
        }
      }
      function traceSendingRequest(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) {
            data = `Params: ${stringifyTrace(message.params)}

`;
          }
          tracer.log(`Sending request '${message.method} - (${message.id})'.`, data);
        } else {
          logLSPMessage("send-request", message);
        }
      }
      function traceSendingNotification(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.params) {
              data = `Params: ${stringifyTrace(message.params)}

`;
            } else {
              data = "No parameters provided.\n\n";
            }
          }
          tracer.log(`Sending notification '${message.method}'.`, data);
        } else {
          logLSPMessage("send-notification", message);
        }
      }
      function traceSendingResponse(message, method, startTime) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.error && message.error.data) {
              data = `Error data: ${stringifyTrace(message.error.data)}

`;
            } else {
              if (message.result) {
                data = `Result: ${stringifyTrace(message.result)}

`;
              } else if (message.error === void 0) {
                data = "No result returned.\n\n";
              }
            }
          }
          tracer.log(`Sending response '${method} - (${message.id})'. Processing request took ${Date.now() - startTime}ms`, data);
        } else {
          logLSPMessage("send-response", message);
        }
      }
      function traceReceivedRequest(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) {
            data = `Params: ${stringifyTrace(message.params)}

`;
          }
          tracer.log(`Received request '${message.method} - (${message.id})'.`, data);
        } else {
          logLSPMessage("receive-request", message);
        }
      }
      function traceReceivedNotification(message) {
        if (trace === Trace.Off || !tracer || message.method === LogTraceNotification.type.method) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.params) {
              data = `Params: ${stringifyTrace(message.params)}

`;
            } else {
              data = "No parameters provided.\n\n";
            }
          }
          tracer.log(`Received notification '${message.method}'.`, data);
        } else {
          logLSPMessage("receive-notification", message);
        }
      }
      function traceReceivedResponse(message, responsePromise) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.error && message.error.data) {
              data = `Error data: ${stringifyTrace(message.error.data)}

`;
            } else {
              if (message.result) {
                data = `Result: ${stringifyTrace(message.result)}

`;
              } else if (message.error === void 0) {
                data = "No result returned.\n\n";
              }
            }
          }
          if (responsePromise) {
            const error = message.error ? ` Request failed: ${message.error.message} (${message.error.code}).` : "";
            tracer.log(`Received response '${responsePromise.method} - (${message.id})' in ${Date.now() - responsePromise.timerStart}ms.${error}`, data);
          } else {
            tracer.log(`Received response ${message.id} without active response promise.`, data);
          }
        } else {
          logLSPMessage("receive-response", message);
        }
      }
      function logLSPMessage(type, message) {
        if (!tracer || trace === Trace.Off) {
          return;
        }
        const lspMessage = {
          isLSPMessage: true,
          type,
          message,
          timestamp: Date.now()
        };
        tracer.log(lspMessage);
      }
      function throwIfClosedOrDisposed() {
        if (isClosed()) {
          throw new ConnectionError(ConnectionErrors.Closed, "Connection is closed.");
        }
        if (isDisposed()) {
          throw new ConnectionError(ConnectionErrors.Disposed, "Connection is disposed.");
        }
      }
      function throwIfListening() {
        if (isListening()) {
          throw new ConnectionError(ConnectionErrors.AlreadyListening, "Connection is already listening");
        }
      }
      function throwIfNotListening() {
        if (!isListening()) {
          throw new Error("Call listen() first.");
        }
      }
      function undefinedToNull(param) {
        if (param === void 0) {
          return null;
        } else {
          return param;
        }
      }
      function nullToUndefined(param) {
        if (param === null) {
          return void 0;
        } else {
          return param;
        }
      }
      function isNamedParam(param) {
        return param !== void 0 && param !== null && !Array.isArray(param) && typeof param === "object";
      }
      function computeSingleParam(parameterStructures, param) {
        switch (parameterStructures) {
          case messages_1.ParameterStructures.auto:
            if (isNamedParam(param)) {
              return nullToUndefined(param);
            } else {
              return [undefinedToNull(param)];
            }
          case messages_1.ParameterStructures.byName:
            if (!isNamedParam(param)) {
              throw new Error(`Received parameters by name but param is not an object literal.`);
            }
            return nullToUndefined(param);
          case messages_1.ParameterStructures.byPosition:
            return [undefinedToNull(param)];
          default:
            throw new Error(`Unknown parameter structure ${parameterStructures.toString()}`);
        }
      }
      function computeMessageParams(type, params) {
        let result;
        const numberOfParams = type.numberOfParams;
        switch (numberOfParams) {
          case 0:
            result = void 0;
            break;
          case 1:
            result = computeSingleParam(type.parameterStructures, params[0]);
            break;
          default:
            result = [];
            for (let i = 0; i < params.length && i < numberOfParams; i++) {
              result.push(undefinedToNull(params[i]));
            }
            if (params.length < numberOfParams) {
              for (let i = params.length; i < numberOfParams; i++) {
                result.push(null);
              }
            }
            break;
        }
        return result;
      }
      const connection2 = {
        sendNotification: (type, ...args) => {
          throwIfClosedOrDisposed();
          let method;
          let messageParams;
          if (Is.string(type)) {
            method = type;
            const first = args[0];
            let paramStart = 0;
            let parameterStructures = messages_1.ParameterStructures.auto;
            if (messages_1.ParameterStructures.is(first)) {
              paramStart = 1;
              parameterStructures = first;
            }
            let paramEnd = args.length;
            const numberOfParams = paramEnd - paramStart;
            switch (numberOfParams) {
              case 0:
                messageParams = void 0;
                break;
              case 1:
                messageParams = computeSingleParam(parameterStructures, args[paramStart]);
                break;
              default:
                if (parameterStructures === messages_1.ParameterStructures.byName) {
                  throw new Error(`Received ${numberOfParams} parameters for 'by Name' notification parameter structure.`);
                }
                messageParams = args.slice(paramStart, paramEnd).map((value) => undefinedToNull(value));
                break;
            }
          } else {
            const params = args;
            method = type.method;
            messageParams = computeMessageParams(type, params);
          }
          const notificationMessage = {
            jsonrpc: version,
            method,
            params: messageParams
          };
          traceSendingNotification(notificationMessage);
          return messageWriter.write(notificationMessage).catch((error) => {
            logger.error(`Sending notification failed.`);
            throw error;
          });
        },
        onNotification: (type, handler) => {
          throwIfClosedOrDisposed();
          let method;
          if (Is.func(type)) {
            starNotificationHandler = type;
          } else if (handler) {
            if (Is.string(type)) {
              method = type;
              notificationHandlers.set(type, { type: void 0, handler });
            } else {
              method = type.method;
              notificationHandlers.set(type.method, { type, handler });
            }
          }
          return {
            dispose: () => {
              if (method !== void 0) {
                notificationHandlers.delete(method);
              } else {
                starNotificationHandler = void 0;
              }
            }
          };
        },
        onProgress: (_type, token, handler) => {
          if (progressHandlers.has(token)) {
            throw new Error(`Progress handler for token ${token} already registered`);
          }
          progressHandlers.set(token, handler);
          return {
            dispose: () => {
              progressHandlers.delete(token);
            }
          };
        },
        sendProgress: (_type, token, value) => {
          return connection2.sendNotification(ProgressNotification.type, { token, value });
        },
        onUnhandledProgress: unhandledProgressEmitter.event,
        sendRequest: (type, ...args) => {
          throwIfClosedOrDisposed();
          throwIfNotListening();
          let method;
          let messageParams;
          let token = void 0;
          if (Is.string(type)) {
            method = type;
            const first = args[0];
            const last = args[args.length - 1];
            let paramStart = 0;
            let parameterStructures = messages_1.ParameterStructures.auto;
            if (messages_1.ParameterStructures.is(first)) {
              paramStart = 1;
              parameterStructures = first;
            }
            let paramEnd = args.length;
            if (cancellation_1.CancellationToken.is(last)) {
              paramEnd = paramEnd - 1;
              token = last;
            }
            const numberOfParams = paramEnd - paramStart;
            switch (numberOfParams) {
              case 0:
                messageParams = void 0;
                break;
              case 1:
                messageParams = computeSingleParam(parameterStructures, args[paramStart]);
                break;
              default:
                if (parameterStructures === messages_1.ParameterStructures.byName) {
                  throw new Error(`Received ${numberOfParams} parameters for 'by Name' request parameter structure.`);
                }
                messageParams = args.slice(paramStart, paramEnd).map((value) => undefinedToNull(value));
                break;
            }
          } else {
            const params = args;
            method = type.method;
            messageParams = computeMessageParams(type, params);
            const numberOfParams = type.numberOfParams;
            token = cancellation_1.CancellationToken.is(params[numberOfParams]) ? params[numberOfParams] : void 0;
          }
          const id = sequenceNumber++;
          let disposable;
          if (token) {
            disposable = token.onCancellationRequested(() => {
              const p = cancellationStrategy.sender.sendCancellation(connection2, id);
              if (p === void 0) {
                logger.log(`Received no promise from cancellation strategy when cancelling id ${id}`);
                return Promise.resolve();
              } else {
                return p.catch(() => {
                  logger.log(`Sending cancellation messages for id ${id} failed`);
                });
              }
            });
          }
          const requestMessage = {
            jsonrpc: version,
            id,
            method,
            params: messageParams
          };
          traceSendingRequest(requestMessage);
          if (typeof cancellationStrategy.sender.enableCancellation === "function") {
            cancellationStrategy.sender.enableCancellation(requestMessage);
          }
          return new Promise(async (resolve, reject) => {
            const resolveWithCleanup = (r) => {
              resolve(r);
              cancellationStrategy.sender.cleanup(id);
              disposable?.dispose();
            };
            const rejectWithCleanup = (r) => {
              reject(r);
              cancellationStrategy.sender.cleanup(id);
              disposable?.dispose();
            };
            const responsePromise = { method, timerStart: Date.now(), resolve: resolveWithCleanup, reject: rejectWithCleanup };
            try {
              await messageWriter.write(requestMessage);
              responsePromises.set(id, responsePromise);
            } catch (error) {
              logger.error(`Sending request failed.`);
              responsePromise.reject(new messages_1.ResponseError(messages_1.ErrorCodes.MessageWriteError, error.message ? error.message : "Unknown reason"));
              throw error;
            }
          });
        },
        onRequest: (type, handler) => {
          throwIfClosedOrDisposed();
          let method = null;
          if (StarRequestHandler.is(type)) {
            method = void 0;
            starRequestHandler = type;
          } else if (Is.string(type)) {
            method = null;
            if (handler !== void 0) {
              method = type;
              requestHandlers.set(type, { handler, type: void 0 });
            }
          } else {
            if (handler !== void 0) {
              method = type.method;
              requestHandlers.set(type.method, { type, handler });
            }
          }
          return {
            dispose: () => {
              if (method === null) {
                return;
              }
              if (method !== void 0) {
                requestHandlers.delete(method);
              } else {
                starRequestHandler = void 0;
              }
            }
          };
        },
        hasPendingResponse: () => {
          return responsePromises.size > 0;
        },
        trace: async (_value, _tracer, sendNotificationOrTraceOptions) => {
          let _sendNotification = false;
          let _traceFormat = TraceFormat.Text;
          if (sendNotificationOrTraceOptions !== void 0) {
            if (Is.boolean(sendNotificationOrTraceOptions)) {
              _sendNotification = sendNotificationOrTraceOptions;
            } else {
              _sendNotification = sendNotificationOrTraceOptions.sendNotification || false;
              _traceFormat = sendNotificationOrTraceOptions.traceFormat || TraceFormat.Text;
            }
          }
          trace = _value;
          traceFormat = _traceFormat;
          if (trace === Trace.Off) {
            tracer = void 0;
          } else {
            tracer = _tracer;
          }
          if (_sendNotification && !isClosed() && !isDisposed()) {
            await connection2.sendNotification(SetTraceNotification.type, { value: Trace.toString(_value) });
          }
        },
        onError: errorEmitter.event,
        onClose: closeEmitter.event,
        onUnhandledNotification: unhandledNotificationEmitter.event,
        onDispose: disposeEmitter.event,
        end: () => {
          messageWriter.end();
        },
        dispose: () => {
          if (isDisposed()) {
            return;
          }
          state = ConnectionState.Disposed;
          disposeEmitter.fire(void 0);
          const error = new messages_1.ResponseError(messages_1.ErrorCodes.PendingResponseRejected, "Pending response rejected since connection got disposed");
          for (const promise of responsePromises.values()) {
            promise.reject(error);
          }
          responsePromises = /* @__PURE__ */ new Map();
          requestTokens = /* @__PURE__ */ new Map();
          knownCanceledRequests = /* @__PURE__ */ new Set();
          messageQueue = new linkedMap_1.LinkedMap();
          if (Is.func(messageWriter.dispose)) {
            messageWriter.dispose();
          }
          if (Is.func(messageReader.dispose)) {
            messageReader.dispose();
          }
        },
        listen: () => {
          throwIfClosedOrDisposed();
          throwIfListening();
          state = ConnectionState.Listening;
          messageReader.listen(callback);
        },
        inspect: () => {
          (0, ral_1.default)().console.log("inspect");
        }
      };
      connection2.onNotification(LogTraceNotification.type, (params) => {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        const verbose = trace === Trace.Verbose || trace === Trace.Compact;
        tracer.log(params.message, verbose ? params.verbose : void 0);
      });
      connection2.onNotification(ProgressNotification.type, (params) => {
        const handler = progressHandlers.get(params.token);
        if (handler) {
          handler(params.value);
        } else {
          unhandledProgressEmitter.fire(params);
        }
      });
      return connection2;
    }
    exports2.createMessageConnection = createMessageConnection;
  }
});

// ../../node_modules/vscode-jsonrpc/lib/common/api.js
var require_api = __commonJS({
  "../../node_modules/vscode-jsonrpc/lib/common/api.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ProgressType = exports2.ProgressToken = exports2.createMessageConnection = exports2.NullLogger = exports2.ConnectionOptions = exports2.ConnectionStrategy = exports2.AbstractMessageBuffer = exports2.WriteableStreamMessageWriter = exports2.AbstractMessageWriter = exports2.MessageWriter = exports2.ReadableStreamMessageReader = exports2.AbstractMessageReader = exports2.MessageReader = exports2.SharedArrayReceiverStrategy = exports2.SharedArraySenderStrategy = exports2.CancellationToken = exports2.CancellationTokenSource = exports2.Emitter = exports2.Event = exports2.Disposable = exports2.LRUCache = exports2.Touch = exports2.LinkedMap = exports2.ParameterStructures = exports2.NotificationType9 = exports2.NotificationType8 = exports2.NotificationType7 = exports2.NotificationType6 = exports2.NotificationType5 = exports2.NotificationType4 = exports2.NotificationType3 = exports2.NotificationType2 = exports2.NotificationType1 = exports2.NotificationType0 = exports2.NotificationType = exports2.ErrorCodes = exports2.ResponseError = exports2.RequestType9 = exports2.RequestType8 = exports2.RequestType7 = exports2.RequestType6 = exports2.RequestType5 = exports2.RequestType4 = exports2.RequestType3 = exports2.RequestType2 = exports2.RequestType1 = exports2.RequestType0 = exports2.RequestType = exports2.Message = exports2.RAL = void 0;
    exports2.MessageStrategy = exports2.CancellationStrategy = exports2.CancellationSenderStrategy = exports2.CancellationReceiverStrategy = exports2.ConnectionError = exports2.ConnectionErrors = exports2.LogTraceNotification = exports2.SetTraceNotification = exports2.TraceFormat = exports2.TraceValues = exports2.Trace = void 0;
    var messages_1 = require_messages();
    Object.defineProperty(exports2, "Message", { enumerable: true, get: function() {
      return messages_1.Message;
    } });
    Object.defineProperty(exports2, "RequestType", { enumerable: true, get: function() {
      return messages_1.RequestType;
    } });
    Object.defineProperty(exports2, "RequestType0", { enumerable: true, get: function() {
      return messages_1.RequestType0;
    } });
    Object.defineProperty(exports2, "RequestType1", { enumerable: true, get: function() {
      return messages_1.RequestType1;
    } });
    Object.defineProperty(exports2, "RequestType2", { enumerable: true, get: function() {
      return messages_1.RequestType2;
    } });
    Object.defineProperty(exports2, "RequestType3", { enumerable: true, get: function() {
      return messages_1.RequestType3;
    } });
    Object.defineProperty(exports2, "RequestType4", { enumerable: true, get: function() {
      return messages_1.RequestType4;
    } });
    Object.defineProperty(exports2, "RequestType5", { enumerable: true, get: function() {
      return messages_1.RequestType5;
    } });
    Object.defineProperty(exports2, "RequestType6", { enumerable: true, get: function() {
      return messages_1.RequestType6;
    } });
    Object.defineProperty(exports2, "RequestType7", { enumerable: true, get: function() {
      return messages_1.RequestType7;
    } });
    Object.defineProperty(exports2, "RequestType8", { enumerable: true, get: function() {
      return messages_1.RequestType8;
    } });
    Object.defineProperty(exports2, "RequestType9", { enumerable: true, get: function() {
      return messages_1.RequestType9;
    } });
    Object.defineProperty(exports2, "ResponseError", { enumerable: true, get: function() {
      return messages_1.ResponseError;
    } });
    Object.defineProperty(exports2, "ErrorCodes", { enumerable: true, get: function() {
      return messages_1.ErrorCodes;
    } });
    Object.defineProperty(exports2, "NotificationType", { enumerable: true, get: function() {
      return messages_1.NotificationType;
    } });
    Object.defineProperty(exports2, "NotificationType0", { enumerable: true, get: function() {
      return messages_1.NotificationType0;
    } });
    Object.defineProperty(exports2, "NotificationType1", { enumerable: true, get: function() {
      return messages_1.NotificationType1;
    } });
    Object.defineProperty(exports2, "NotificationType2", { enumerable: true, get: function() {
      return messages_1.NotificationType2;
    } });
    Object.defineProperty(exports2, "NotificationType3", { enumerable: true, get: function() {
      return messages_1.NotificationType3;
    } });
    Object.defineProperty(exports2, "NotificationType4", { enumerable: true, get: function() {
      return messages_1.NotificationType4;
    } });
    Object.defineProperty(exports2, "NotificationType5", { enumerable: true, get: function() {
      return messages_1.NotificationType5;
    } });
    Object.defineProperty(exports2, "NotificationType6", { enumerable: true, get: function() {
      return messages_1.NotificationType6;
    } });
    Object.defineProperty(exports2, "NotificationType7", { enumerable: true, get: function() {
      return messages_1.NotificationType7;
    } });
    Object.defineProperty(exports2, "NotificationType8", { enumerable: true, get: function() {
      return messages_1.NotificationType8;
    } });
    Object.defineProperty(exports2, "NotificationType9", { enumerable: true, get: function() {
      return messages_1.NotificationType9;
    } });
    Object.defineProperty(exports2, "ParameterStructures", { enumerable: true, get: function() {
      return messages_1.ParameterStructures;
    } });
    var linkedMap_1 = require_linkedMap();
    Object.defineProperty(exports2, "LinkedMap", { enumerable: true, get: function() {
      return linkedMap_1.LinkedMap;
    } });
    Object.defineProperty(exports2, "LRUCache", { enumerable: true, get: function() {
      return linkedMap_1.LRUCache;
    } });
    Object.defineProperty(exports2, "Touch", { enumerable: true, get: function() {
      return linkedMap_1.Touch;
    } });
    var disposable_1 = require_disposable();
    Object.defineProperty(exports2, "Disposable", { enumerable: true, get: function() {
      return disposable_1.Disposable;
    } });
    var events_1 = require_events();
    Object.defineProperty(exports2, "Event", { enumerable: true, get: function() {
      return events_1.Event;
    } });
    Object.defineProperty(exports2, "Emitter", { enumerable: true, get: function() {
      return events_1.Emitter;
    } });
    var cancellation_1 = require_cancellation();
    Object.defineProperty(exports2, "CancellationTokenSource", { enumerable: true, get: function() {
      return cancellation_1.CancellationTokenSource;
    } });
    Object.defineProperty(exports2, "CancellationToken", { enumerable: true, get: function() {
      return cancellation_1.CancellationToken;
    } });
    var sharedArrayCancellation_1 = require_sharedArrayCancellation();
    Object.defineProperty(exports2, "SharedArraySenderStrategy", { enumerable: true, get: function() {
      return sharedArrayCancellation_1.SharedArraySenderStrategy;
    } });
    Object.defineProperty(exports2, "SharedArrayReceiverStrategy", { enumerable: true, get: function() {
      return sharedArrayCancellation_1.SharedArrayReceiverStrategy;
    } });
    var messageReader_1 = require_messageReader();
    Object.defineProperty(exports2, "MessageReader", { enumerable: true, get: function() {
      return messageReader_1.MessageReader;
    } });
    Object.defineProperty(exports2, "AbstractMessageReader", { enumerable: true, get: function() {
      return messageReader_1.AbstractMessageReader;
    } });
    Object.defineProperty(exports2, "ReadableStreamMessageReader", { enumerable: true, get: function() {
      return messageReader_1.ReadableStreamMessageReader;
    } });
    var messageWriter_1 = require_messageWriter();
    Object.defineProperty(exports2, "MessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.MessageWriter;
    } });
    Object.defineProperty(exports2, "AbstractMessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.AbstractMessageWriter;
    } });
    Object.defineProperty(exports2, "WriteableStreamMessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.WriteableStreamMessageWriter;
    } });
    var messageBuffer_1 = require_messageBuffer();
    Object.defineProperty(exports2, "AbstractMessageBuffer", { enumerable: true, get: function() {
      return messageBuffer_1.AbstractMessageBuffer;
    } });
    var connection_1 = require_connection();
    Object.defineProperty(exports2, "ConnectionStrategy", { enumerable: true, get: function() {
      return connection_1.ConnectionStrategy;
    } });
    Object.defineProperty(exports2, "ConnectionOptions", { enumerable: true, get: function() {
      return connection_1.ConnectionOptions;
    } });
    Object.defineProperty(exports2, "NullLogger", { enumerable: true, get: function() {
      return connection_1.NullLogger;
    } });
    Object.defineProperty(exports2, "createMessageConnection", { enumerable: true, get: function() {
      return connection_1.createMessageConnection;
    } });
    Object.defineProperty(exports2, "ProgressToken", { enumerable: true, get: function() {
      return connection_1.ProgressToken;
    } });
    Object.defineProperty(exports2, "ProgressType", { enumerable: true, get: function() {
      return connection_1.ProgressType;
    } });
    Object.defineProperty(exports2, "Trace", { enumerable: true, get: function() {
      return connection_1.Trace;
    } });
    Object.defineProperty(exports2, "TraceValues", { enumerable: true, get: function() {
      return connection_1.TraceValues;
    } });
    Object.defineProperty(exports2, "TraceFormat", { enumerable: true, get: function() {
      return connection_1.TraceFormat;
    } });
    Object.defineProperty(exports2, "SetTraceNotification", { enumerable: true, get: function() {
      return connection_1.SetTraceNotification;
    } });
    Object.defineProperty(exports2, "LogTraceNotification", { enumerable: true, get: function() {
      return connection_1.LogTraceNotification;
    } });
    Object.defineProperty(exports2, "ConnectionErrors", { enumerable: true, get: function() {
      return connection_1.ConnectionErrors;
    } });
    Object.defineProperty(exports2, "ConnectionError", { enumerable: true, get: function() {
      return connection_1.ConnectionError;
    } });
    Object.defineProperty(exports2, "CancellationReceiverStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationReceiverStrategy;
    } });
    Object.defineProperty(exports2, "CancellationSenderStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationSenderStrategy;
    } });
    Object.defineProperty(exports2, "CancellationStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationStrategy;
    } });
    Object.defineProperty(exports2, "MessageStrategy", { enumerable: true, get: function() {
      return connection_1.MessageStrategy;
    } });
    var ral_1 = require_ral();
    exports2.RAL = ral_1.default;
  }
});

// ../../node_modules/vscode-jsonrpc/lib/node/ril.js
var require_ril = __commonJS({
  "../../node_modules/vscode-jsonrpc/lib/node/ril.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var util_1 = require("util");
    var api_1 = require_api();
    var MessageBuffer = class _MessageBuffer extends api_1.AbstractMessageBuffer {
      constructor(encoding = "utf-8") {
        super(encoding);
      }
      emptyBuffer() {
        return _MessageBuffer.emptyBuffer;
      }
      fromString(value, encoding) {
        return Buffer.from(value, encoding);
      }
      toString(value, encoding) {
        if (value instanceof Buffer) {
          return value.toString(encoding);
        } else {
          return new util_1.TextDecoder(encoding).decode(value);
        }
      }
      asNative(buffer, length) {
        if (length === void 0) {
          return buffer instanceof Buffer ? buffer : Buffer.from(buffer);
        } else {
          return buffer instanceof Buffer ? buffer.slice(0, length) : Buffer.from(buffer, 0, length);
        }
      }
      allocNative(length) {
        return Buffer.allocUnsafe(length);
      }
    };
    MessageBuffer.emptyBuffer = Buffer.allocUnsafe(0);
    var ReadableStreamWrapper = class {
      constructor(stream) {
        this.stream = stream;
      }
      onClose(listener) {
        this.stream.on("close", listener);
        return api_1.Disposable.create(() => this.stream.off("close", listener));
      }
      onError(listener) {
        this.stream.on("error", listener);
        return api_1.Disposable.create(() => this.stream.off("error", listener));
      }
      onEnd(listener) {
        this.stream.on("end", listener);
        return api_1.Disposable.create(() => this.stream.off("end", listener));
      }
      onData(listener) {
        this.stream.on("data", listener);
        return api_1.Disposable.create(() => this.stream.off("data", listener));
      }
    };
    var WritableStreamWrapper = class {
      constructor(stream) {
        this.stream = stream;
      }
      onClose(listener) {
        this.stream.on("close", listener);
        return api_1.Disposable.create(() => this.stream.off("close", listener));
      }
      onError(listener) {
        this.stream.on("error", listener);
        return api_1.Disposable.create(() => this.stream.off("error", listener));
      }
      onEnd(listener) {
        this.stream.on("end", listener);
        return api_1.Disposable.create(() => this.stream.off("end", listener));
      }
      write(data, encoding) {
        return new Promise((resolve, reject) => {
          const callback = (error) => {
            if (error === void 0 || error === null) {
              resolve();
            } else {
              reject(error);
            }
          };
          if (typeof data === "string") {
            this.stream.write(data, encoding, callback);
          } else {
            this.stream.write(data, callback);
          }
        });
      }
      end() {
        this.stream.end();
      }
    };
    var _ril = Object.freeze({
      messageBuffer: Object.freeze({
        create: (encoding) => new MessageBuffer(encoding)
      }),
      applicationJson: Object.freeze({
        encoder: Object.freeze({
          name: "application/json",
          encode: (msg, options) => {
            try {
              return Promise.resolve(Buffer.from(JSON.stringify(msg, void 0, 0), options.charset));
            } catch (err) {
              return Promise.reject(err);
            }
          }
        }),
        decoder: Object.freeze({
          name: "application/json",
          decode: (buffer, options) => {
            try {
              if (buffer instanceof Buffer) {
                return Promise.resolve(JSON.parse(buffer.toString(options.charset)));
              } else {
                return Promise.resolve(JSON.parse(new util_1.TextDecoder(options.charset).decode(buffer)));
              }
            } catch (err) {
              return Promise.reject(err);
            }
          }
        })
      }),
      stream: Object.freeze({
        asReadableStream: (stream) => new ReadableStreamWrapper(stream),
        asWritableStream: (stream) => new WritableStreamWrapper(stream)
      }),
      console,
      timer: Object.freeze({
        setTimeout(callback, ms, ...args) {
          const handle = setTimeout(callback, ms, ...args);
          return { dispose: () => clearTimeout(handle) };
        },
        setImmediate(callback, ...args) {
          const handle = setImmediate(callback, ...args);
          return { dispose: () => clearImmediate(handle) };
        },
        setInterval(callback, ms, ...args) {
          const handle = setInterval(callback, ms, ...args);
          return { dispose: () => clearInterval(handle) };
        }
      })
    });
    function RIL() {
      return _ril;
    }
    (function(RIL2) {
      function install() {
        api_1.RAL.install(_ril);
      }
      RIL2.install = install;
    })(RIL || (RIL = {}));
    exports2.default = RIL;
  }
});

// ../../node_modules/vscode-jsonrpc/lib/node/main.js
var require_main = __commonJS({
  "../../node_modules/vscode-jsonrpc/lib/node/main.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createMessageConnection = exports2.createServerSocketTransport = exports2.createClientSocketTransport = exports2.createServerPipeTransport = exports2.createClientPipeTransport = exports2.generateRandomPipeName = exports2.StreamMessageWriter = exports2.StreamMessageReader = exports2.SocketMessageWriter = exports2.SocketMessageReader = exports2.PortMessageWriter = exports2.PortMessageReader = exports2.IPCMessageWriter = exports2.IPCMessageReader = void 0;
    var ril_1 = require_ril();
    ril_1.default.install();
    var path = require("path");
    var os = require("os");
    var crypto_1 = require("crypto");
    var net_1 = require("net");
    var api_1 = require_api();
    __exportStar(require_api(), exports2);
    var IPCMessageReader = class extends api_1.AbstractMessageReader {
      constructor(process2) {
        super();
        this.process = process2;
        let eventEmitter = this.process;
        eventEmitter.on("error", (error) => this.fireError(error));
        eventEmitter.on("close", () => this.fireClose());
      }
      listen(callback) {
        this.process.on("message", callback);
        return api_1.Disposable.create(() => this.process.off("message", callback));
      }
    };
    exports2.IPCMessageReader = IPCMessageReader;
    var IPCMessageWriter = class extends api_1.AbstractMessageWriter {
      constructor(process2) {
        super();
        this.process = process2;
        this.errorCount = 0;
        const eventEmitter = this.process;
        eventEmitter.on("error", (error) => this.fireError(error));
        eventEmitter.on("close", () => this.fireClose);
      }
      write(msg) {
        try {
          if (typeof this.process.send === "function") {
            this.process.send(msg, void 0, void 0, (error) => {
              if (error) {
                this.errorCount++;
                this.handleError(error, msg);
              } else {
                this.errorCount = 0;
              }
            });
          }
          return Promise.resolve();
        } catch (error) {
          this.handleError(error, msg);
          return Promise.reject(error);
        }
      }
      handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
      }
      end() {
      }
    };
    exports2.IPCMessageWriter = IPCMessageWriter;
    var PortMessageReader = class extends api_1.AbstractMessageReader {
      constructor(port) {
        super();
        this.onData = new api_1.Emitter();
        port.on("close", () => this.fireClose);
        port.on("error", (error) => this.fireError(error));
        port.on("message", (message) => {
          this.onData.fire(message);
        });
      }
      listen(callback) {
        return this.onData.event(callback);
      }
    };
    exports2.PortMessageReader = PortMessageReader;
    var PortMessageWriter = class extends api_1.AbstractMessageWriter {
      constructor(port) {
        super();
        this.port = port;
        this.errorCount = 0;
        port.on("close", () => this.fireClose());
        port.on("error", (error) => this.fireError(error));
      }
      write(msg) {
        try {
          this.port.postMessage(msg);
          return Promise.resolve();
        } catch (error) {
          this.handleError(error, msg);
          return Promise.reject(error);
        }
      }
      handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
      }
      end() {
      }
    };
    exports2.PortMessageWriter = PortMessageWriter;
    var SocketMessageReader = class extends api_1.ReadableStreamMessageReader {
      constructor(socket, encoding = "utf-8") {
        super((0, ril_1.default)().stream.asReadableStream(socket), encoding);
      }
    };
    exports2.SocketMessageReader = SocketMessageReader;
    var SocketMessageWriter = class extends api_1.WriteableStreamMessageWriter {
      constructor(socket, options) {
        super((0, ril_1.default)().stream.asWritableStream(socket), options);
        this.socket = socket;
      }
      dispose() {
        super.dispose();
        this.socket.destroy();
      }
    };
    exports2.SocketMessageWriter = SocketMessageWriter;
    var StreamMessageReader = class extends api_1.ReadableStreamMessageReader {
      constructor(readable, encoding) {
        super((0, ril_1.default)().stream.asReadableStream(readable), encoding);
      }
    };
    exports2.StreamMessageReader = StreamMessageReader;
    var StreamMessageWriter = class extends api_1.WriteableStreamMessageWriter {
      constructor(writable, options) {
        super((0, ril_1.default)().stream.asWritableStream(writable), options);
      }
    };
    exports2.StreamMessageWriter = StreamMessageWriter;
    var XDG_RUNTIME_DIR = process.env["XDG_RUNTIME_DIR"];
    var safeIpcPathLengths = /* @__PURE__ */ new Map([
      ["linux", 107],
      ["darwin", 103]
    ]);
    function generateRandomPipeName() {
      const randomSuffix = (0, crypto_1.randomBytes)(21).toString("hex");
      if (process.platform === "win32") {
        return `\\\\.\\pipe\\vscode-jsonrpc-${randomSuffix}-sock`;
      }
      let result;
      if (XDG_RUNTIME_DIR) {
        result = path.join(XDG_RUNTIME_DIR, `vscode-ipc-${randomSuffix}.sock`);
      } else {
        result = path.join(os.tmpdir(), `vscode-${randomSuffix}.sock`);
      }
      const limit = safeIpcPathLengths.get(process.platform);
      if (limit !== void 0 && result.length > limit) {
        (0, ril_1.default)().console.warn(`WARNING: IPC handle "${result}" is longer than ${limit} characters.`);
      }
      return result;
    }
    exports2.generateRandomPipeName = generateRandomPipeName;
    function createClientPipeTransport(pipeName, encoding = "utf-8") {
      let connectResolve;
      const connected = new Promise((resolve, _reject) => {
        connectResolve = resolve;
      });
      return new Promise((resolve, reject) => {
        let server = (0, net_1.createServer)((socket) => {
          server.close();
          connectResolve([
            new SocketMessageReader(socket, encoding),
            new SocketMessageWriter(socket, encoding)
          ]);
        });
        server.on("error", reject);
        server.listen(pipeName, () => {
          server.removeListener("error", reject);
          resolve({
            onConnected: () => {
              return connected;
            }
          });
        });
      });
    }
    exports2.createClientPipeTransport = createClientPipeTransport;
    function createServerPipeTransport(pipeName, encoding = "utf-8") {
      const socket = (0, net_1.createConnection)(pipeName);
      return [
        new SocketMessageReader(socket, encoding),
        new SocketMessageWriter(socket, encoding)
      ];
    }
    exports2.createServerPipeTransport = createServerPipeTransport;
    function createClientSocketTransport(port, encoding = "utf-8") {
      let connectResolve;
      const connected = new Promise((resolve, _reject) => {
        connectResolve = resolve;
      });
      return new Promise((resolve, reject) => {
        const server = (0, net_1.createServer)((socket) => {
          server.close();
          connectResolve([
            new SocketMessageReader(socket, encoding),
            new SocketMessageWriter(socket, encoding)
          ]);
        });
        server.on("error", reject);
        server.listen(port, "127.0.0.1", () => {
          server.removeListener("error", reject);
          resolve({
            onConnected: () => {
              return connected;
            }
          });
        });
      });
    }
    exports2.createClientSocketTransport = createClientSocketTransport;
    function createServerSocketTransport(port, encoding = "utf-8") {
      const socket = (0, net_1.createConnection)(port, "127.0.0.1");
      return [
        new SocketMessageReader(socket, encoding),
        new SocketMessageWriter(socket, encoding)
      ];
    }
    exports2.createServerSocketTransport = createServerSocketTransport;
    function isReadableStream(value) {
      const candidate = value;
      return candidate.read !== void 0 && candidate.addListener !== void 0;
    }
    function isWritableStream(value) {
      const candidate = value;
      return candidate.write !== void 0 && candidate.addListener !== void 0;
    }
    function createMessageConnection(input, output, logger, options) {
      if (!logger) {
        logger = api_1.NullLogger;
      }
      const reader = isReadableStream(input) ? new StreamMessageReader(input) : input;
      const writer = isWritableStream(output) ? new StreamMessageWriter(output) : output;
      if (api_1.ConnectionStrategy.is(options)) {
        options = { connectionStrategy: options };
      }
      return (0, api_1.createMessageConnection)(reader, writer, logger, options);
    }
    exports2.createMessageConnection = createMessageConnection;
  }
});

// ../../node_modules/vscode-jsonrpc/node.js
var require_node = __commonJS({
  "../../node_modules/vscode-jsonrpc/node.js"(exports2, module2) {
    "use strict";
    module2.exports = require_main();
  }
});

// ../../node_modules/vscode-languageserver-types/lib/umd/main.js
var require_main2 = __commonJS({
  "../../node_modules/vscode-languageserver-types/lib/umd/main.js"(exports2, module2) {
    (function(factory) {
      if (typeof module2 === "object" && typeof module2.exports === "object") {
        var v = factory(require, exports2);
        if (v !== void 0)
          module2.exports = v;
      } else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
      }
    })(function(require2, exports3) {
      "use strict";
      Object.defineProperty(exports3, "__esModule", { value: true });
      exports3.TextDocument = exports3.EOL = exports3.WorkspaceFolder = exports3.InlineCompletionContext = exports3.SelectedCompletionInfo = exports3.InlineCompletionTriggerKind = exports3.InlineCompletionList = exports3.InlineCompletionItem = exports3.StringValue = exports3.InlayHint = exports3.InlayHintLabelPart = exports3.InlayHintKind = exports3.InlineValueContext = exports3.InlineValueEvaluatableExpression = exports3.InlineValueVariableLookup = exports3.InlineValueText = exports3.SemanticTokens = exports3.SemanticTokenModifiers = exports3.SemanticTokenTypes = exports3.SelectionRange = exports3.DocumentLink = exports3.FormattingOptions = exports3.CodeLens = exports3.CodeAction = exports3.CodeActionContext = exports3.CodeActionTriggerKind = exports3.CodeActionKind = exports3.DocumentSymbol = exports3.WorkspaceSymbol = exports3.SymbolInformation = exports3.SymbolTag = exports3.SymbolKind = exports3.DocumentHighlight = exports3.DocumentHighlightKind = exports3.SignatureInformation = exports3.ParameterInformation = exports3.Hover = exports3.MarkedString = exports3.CompletionList = exports3.CompletionItem = exports3.CompletionItemLabelDetails = exports3.InsertTextMode = exports3.InsertReplaceEdit = exports3.CompletionItemTag = exports3.InsertTextFormat = exports3.CompletionItemKind = exports3.MarkupContent = exports3.MarkupKind = exports3.TextDocumentItem = exports3.OptionalVersionedTextDocumentIdentifier = exports3.VersionedTextDocumentIdentifier = exports3.TextDocumentIdentifier = exports3.WorkspaceChange = exports3.WorkspaceEdit = exports3.DeleteFile = exports3.RenameFile = exports3.CreateFile = exports3.TextDocumentEdit = exports3.AnnotatedTextEdit = exports3.ChangeAnnotationIdentifier = exports3.ChangeAnnotation = exports3.TextEdit = exports3.Command = exports3.Diagnostic = exports3.CodeDescription = exports3.DiagnosticTag = exports3.DiagnosticSeverity = exports3.DiagnosticRelatedInformation = exports3.FoldingRange = exports3.FoldingRangeKind = exports3.ColorPresentation = exports3.ColorInformation = exports3.Color = exports3.LocationLink = exports3.Location = exports3.Range = exports3.Position = exports3.uinteger = exports3.integer = exports3.URI = exports3.DocumentUri = void 0;
      var DocumentUri;
      (function(DocumentUri2) {
        function is(value) {
          return typeof value === "string";
        }
        DocumentUri2.is = is;
      })(DocumentUri || (exports3.DocumentUri = DocumentUri = {}));
      var URI;
      (function(URI2) {
        function is(value) {
          return typeof value === "string";
        }
        URI2.is = is;
      })(URI || (exports3.URI = URI = {}));
      var integer;
      (function(integer2) {
        integer2.MIN_VALUE = -2147483648;
        integer2.MAX_VALUE = 2147483647;
        function is(value) {
          return typeof value === "number" && integer2.MIN_VALUE <= value && value <= integer2.MAX_VALUE;
        }
        integer2.is = is;
      })(integer || (exports3.integer = integer = {}));
      var uinteger;
      (function(uinteger2) {
        uinteger2.MIN_VALUE = 0;
        uinteger2.MAX_VALUE = 2147483647;
        function is(value) {
          return typeof value === "number" && uinteger2.MIN_VALUE <= value && value <= uinteger2.MAX_VALUE;
        }
        uinteger2.is = is;
      })(uinteger || (exports3.uinteger = uinteger = {}));
      var Position;
      (function(Position2) {
        function create(line, character) {
          if (line === Number.MAX_VALUE) {
            line = uinteger.MAX_VALUE;
          }
          if (character === Number.MAX_VALUE) {
            character = uinteger.MAX_VALUE;
          }
          return { line, character };
        }
        Position2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.uinteger(candidate.line) && Is.uinteger(candidate.character);
        }
        Position2.is = is;
      })(Position || (exports3.Position = Position = {}));
      var Range;
      (function(Range2) {
        function create(one, two, three, four) {
          if (Is.uinteger(one) && Is.uinteger(two) && Is.uinteger(three) && Is.uinteger(four)) {
            return { start: Position.create(one, two), end: Position.create(three, four) };
          } else if (Position.is(one) && Position.is(two)) {
            return { start: one, end: two };
          } else {
            throw new Error("Range#create called with invalid arguments[".concat(one, ", ").concat(two, ", ").concat(three, ", ").concat(four, "]"));
          }
        }
        Range2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Position.is(candidate.start) && Position.is(candidate.end);
        }
        Range2.is = is;
      })(Range || (exports3.Range = Range = {}));
      var Location2;
      (function(Location3) {
        function create(uri, range) {
          return { uri, range };
        }
        Location3.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Range.is(candidate.range) && (Is.string(candidate.uri) || Is.undefined(candidate.uri));
        }
        Location3.is = is;
      })(Location2 || (exports3.Location = Location2 = {}));
      var LocationLink;
      (function(LocationLink2) {
        function create(targetUri, targetRange, targetSelectionRange, originSelectionRange) {
          return { targetUri, targetRange, targetSelectionRange, originSelectionRange };
        }
        LocationLink2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Range.is(candidate.targetRange) && Is.string(candidate.targetUri) && Range.is(candidate.targetSelectionRange) && (Range.is(candidate.originSelectionRange) || Is.undefined(candidate.originSelectionRange));
        }
        LocationLink2.is = is;
      })(LocationLink || (exports3.LocationLink = LocationLink = {}));
      var Color;
      (function(Color2) {
        function create(red, green, blue, alpha) {
          return {
            red,
            green,
            blue,
            alpha
          };
        }
        Color2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.numberRange(candidate.red, 0, 1) && Is.numberRange(candidate.green, 0, 1) && Is.numberRange(candidate.blue, 0, 1) && Is.numberRange(candidate.alpha, 0, 1);
        }
        Color2.is = is;
      })(Color || (exports3.Color = Color = {}));
      var ColorInformation;
      (function(ColorInformation2) {
        function create(range, color) {
          return {
            range,
            color
          };
        }
        ColorInformation2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Range.is(candidate.range) && Color.is(candidate.color);
        }
        ColorInformation2.is = is;
      })(ColorInformation || (exports3.ColorInformation = ColorInformation = {}));
      var ColorPresentation;
      (function(ColorPresentation2) {
        function create(label, textEdit, additionalTextEdits) {
          return {
            label,
            textEdit,
            additionalTextEdits
          };
        }
        ColorPresentation2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.string(candidate.label) && (Is.undefined(candidate.textEdit) || TextEdit2.is(candidate)) && (Is.undefined(candidate.additionalTextEdits) || Is.typedArray(candidate.additionalTextEdits, TextEdit2.is));
        }
        ColorPresentation2.is = is;
      })(ColorPresentation || (exports3.ColorPresentation = ColorPresentation = {}));
      var FoldingRangeKind;
      (function(FoldingRangeKind2) {
        FoldingRangeKind2.Comment = "comment";
        FoldingRangeKind2.Imports = "imports";
        FoldingRangeKind2.Region = "region";
      })(FoldingRangeKind || (exports3.FoldingRangeKind = FoldingRangeKind = {}));
      var FoldingRange2;
      (function(FoldingRange3) {
        function create(startLine, endLine, startCharacter, endCharacter, kind, collapsedText) {
          var result = {
            startLine,
            endLine
          };
          if (Is.defined(startCharacter)) {
            result.startCharacter = startCharacter;
          }
          if (Is.defined(endCharacter)) {
            result.endCharacter = endCharacter;
          }
          if (Is.defined(kind)) {
            result.kind = kind;
          }
          if (Is.defined(collapsedText)) {
            result.collapsedText = collapsedText;
          }
          return result;
        }
        FoldingRange3.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.uinteger(candidate.startLine) && Is.uinteger(candidate.startLine) && (Is.undefined(candidate.startCharacter) || Is.uinteger(candidate.startCharacter)) && (Is.undefined(candidate.endCharacter) || Is.uinteger(candidate.endCharacter)) && (Is.undefined(candidate.kind) || Is.string(candidate.kind));
        }
        FoldingRange3.is = is;
      })(FoldingRange2 || (exports3.FoldingRange = FoldingRange2 = {}));
      var DiagnosticRelatedInformation;
      (function(DiagnosticRelatedInformation2) {
        function create(location, message) {
          return {
            location,
            message
          };
        }
        DiagnosticRelatedInformation2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Location2.is(candidate.location) && Is.string(candidate.message);
        }
        DiagnosticRelatedInformation2.is = is;
      })(DiagnosticRelatedInformation || (exports3.DiagnosticRelatedInformation = DiagnosticRelatedInformation = {}));
      var DiagnosticSeverity2;
      (function(DiagnosticSeverity3) {
        DiagnosticSeverity3.Error = 1;
        DiagnosticSeverity3.Warning = 2;
        DiagnosticSeverity3.Information = 3;
        DiagnosticSeverity3.Hint = 4;
      })(DiagnosticSeverity2 || (exports3.DiagnosticSeverity = DiagnosticSeverity2 = {}));
      var DiagnosticTag;
      (function(DiagnosticTag2) {
        DiagnosticTag2.Unnecessary = 1;
        DiagnosticTag2.Deprecated = 2;
      })(DiagnosticTag || (exports3.DiagnosticTag = DiagnosticTag = {}));
      var CodeDescription;
      (function(CodeDescription2) {
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.string(candidate.href);
        }
        CodeDescription2.is = is;
      })(CodeDescription || (exports3.CodeDescription = CodeDescription = {}));
      var Diagnostic2;
      (function(Diagnostic3) {
        function create(range, message, severity, code, source, relatedInformation) {
          var result = { range, message };
          if (Is.defined(severity)) {
            result.severity = severity;
          }
          if (Is.defined(code)) {
            result.code = code;
          }
          if (Is.defined(source)) {
            result.source = source;
          }
          if (Is.defined(relatedInformation)) {
            result.relatedInformation = relatedInformation;
          }
          return result;
        }
        Diagnostic3.create = create;
        function is(value) {
          var _a;
          var candidate = value;
          return Is.defined(candidate) && Range.is(candidate.range) && Is.string(candidate.message) && (Is.number(candidate.severity) || Is.undefined(candidate.severity)) && (Is.integer(candidate.code) || Is.string(candidate.code) || Is.undefined(candidate.code)) && (Is.undefined(candidate.codeDescription) || Is.string((_a = candidate.codeDescription) === null || _a === void 0 ? void 0 : _a.href)) && (Is.string(candidate.source) || Is.undefined(candidate.source)) && (Is.undefined(candidate.relatedInformation) || Is.typedArray(candidate.relatedInformation, DiagnosticRelatedInformation.is));
        }
        Diagnostic3.is = is;
      })(Diagnostic2 || (exports3.Diagnostic = Diagnostic2 = {}));
      var Command;
      (function(Command2) {
        function create(title, command) {
          var args = [];
          for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
          }
          var result = { title, command };
          if (Is.defined(args) && args.length > 0) {
            result.arguments = args;
          }
          return result;
        }
        Command2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.string(candidate.title) && Is.string(candidate.command);
        }
        Command2.is = is;
      })(Command || (exports3.Command = Command = {}));
      var TextEdit2;
      (function(TextEdit3) {
        function replace(range, newText) {
          return { range, newText };
        }
        TextEdit3.replace = replace;
        function insert(position, newText) {
          return { range: { start: position, end: position }, newText };
        }
        TextEdit3.insert = insert;
        function del(range) {
          return { range, newText: "" };
        }
        TextEdit3.del = del;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.string(candidate.newText) && Range.is(candidate.range);
        }
        TextEdit3.is = is;
      })(TextEdit2 || (exports3.TextEdit = TextEdit2 = {}));
      var ChangeAnnotation;
      (function(ChangeAnnotation2) {
        function create(label, needsConfirmation, description) {
          var result = { label };
          if (needsConfirmation !== void 0) {
            result.needsConfirmation = needsConfirmation;
          }
          if (description !== void 0) {
            result.description = description;
          }
          return result;
        }
        ChangeAnnotation2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.string(candidate.label) && (Is.boolean(candidate.needsConfirmation) || candidate.needsConfirmation === void 0) && (Is.string(candidate.description) || candidate.description === void 0);
        }
        ChangeAnnotation2.is = is;
      })(ChangeAnnotation || (exports3.ChangeAnnotation = ChangeAnnotation = {}));
      var ChangeAnnotationIdentifier;
      (function(ChangeAnnotationIdentifier2) {
        function is(value) {
          var candidate = value;
          return Is.string(candidate);
        }
        ChangeAnnotationIdentifier2.is = is;
      })(ChangeAnnotationIdentifier || (exports3.ChangeAnnotationIdentifier = ChangeAnnotationIdentifier = {}));
      var AnnotatedTextEdit;
      (function(AnnotatedTextEdit2) {
        function replace(range, newText, annotation) {
          return { range, newText, annotationId: annotation };
        }
        AnnotatedTextEdit2.replace = replace;
        function insert(position, newText, annotation) {
          return { range: { start: position, end: position }, newText, annotationId: annotation };
        }
        AnnotatedTextEdit2.insert = insert;
        function del(range, annotation) {
          return { range, newText: "", annotationId: annotation };
        }
        AnnotatedTextEdit2.del = del;
        function is(value) {
          var candidate = value;
          return TextEdit2.is(candidate) && (ChangeAnnotation.is(candidate.annotationId) || ChangeAnnotationIdentifier.is(candidate.annotationId));
        }
        AnnotatedTextEdit2.is = is;
      })(AnnotatedTextEdit || (exports3.AnnotatedTextEdit = AnnotatedTextEdit = {}));
      var TextDocumentEdit;
      (function(TextDocumentEdit2) {
        function create(textDocument, edits) {
          return { textDocument, edits };
        }
        TextDocumentEdit2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && OptionalVersionedTextDocumentIdentifier.is(candidate.textDocument) && Array.isArray(candidate.edits);
        }
        TextDocumentEdit2.is = is;
      })(TextDocumentEdit || (exports3.TextDocumentEdit = TextDocumentEdit = {}));
      var CreateFile;
      (function(CreateFile2) {
        function create(uri, options, annotation) {
          var result = {
            kind: "create",
            uri
          };
          if (options !== void 0 && (options.overwrite !== void 0 || options.ignoreIfExists !== void 0)) {
            result.options = options;
          }
          if (annotation !== void 0) {
            result.annotationId = annotation;
          }
          return result;
        }
        CreateFile2.create = create;
        function is(value) {
          var candidate = value;
          return candidate && candidate.kind === "create" && Is.string(candidate.uri) && (candidate.options === void 0 || (candidate.options.overwrite === void 0 || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === void 0 || Is.boolean(candidate.options.ignoreIfExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
        }
        CreateFile2.is = is;
      })(CreateFile || (exports3.CreateFile = CreateFile = {}));
      var RenameFile;
      (function(RenameFile2) {
        function create(oldUri, newUri, options, annotation) {
          var result = {
            kind: "rename",
            oldUri,
            newUri
          };
          if (options !== void 0 && (options.overwrite !== void 0 || options.ignoreIfExists !== void 0)) {
            result.options = options;
          }
          if (annotation !== void 0) {
            result.annotationId = annotation;
          }
          return result;
        }
        RenameFile2.create = create;
        function is(value) {
          var candidate = value;
          return candidate && candidate.kind === "rename" && Is.string(candidate.oldUri) && Is.string(candidate.newUri) && (candidate.options === void 0 || (candidate.options.overwrite === void 0 || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === void 0 || Is.boolean(candidate.options.ignoreIfExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
        }
        RenameFile2.is = is;
      })(RenameFile || (exports3.RenameFile = RenameFile = {}));
      var DeleteFile;
      (function(DeleteFile2) {
        function create(uri, options, annotation) {
          var result = {
            kind: "delete",
            uri
          };
          if (options !== void 0 && (options.recursive !== void 0 || options.ignoreIfNotExists !== void 0)) {
            result.options = options;
          }
          if (annotation !== void 0) {
            result.annotationId = annotation;
          }
          return result;
        }
        DeleteFile2.create = create;
        function is(value) {
          var candidate = value;
          return candidate && candidate.kind === "delete" && Is.string(candidate.uri) && (candidate.options === void 0 || (candidate.options.recursive === void 0 || Is.boolean(candidate.options.recursive)) && (candidate.options.ignoreIfNotExists === void 0 || Is.boolean(candidate.options.ignoreIfNotExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
        }
        DeleteFile2.is = is;
      })(DeleteFile || (exports3.DeleteFile = DeleteFile = {}));
      var WorkspaceEdit;
      (function(WorkspaceEdit2) {
        function is(value) {
          var candidate = value;
          return candidate && (candidate.changes !== void 0 || candidate.documentChanges !== void 0) && (candidate.documentChanges === void 0 || candidate.documentChanges.every(function(change) {
            if (Is.string(change.kind)) {
              return CreateFile.is(change) || RenameFile.is(change) || DeleteFile.is(change);
            } else {
              return TextDocumentEdit.is(change);
            }
          }));
        }
        WorkspaceEdit2.is = is;
      })(WorkspaceEdit || (exports3.WorkspaceEdit = WorkspaceEdit = {}));
      var TextEditChangeImpl = (
        /** @class */
        function() {
          function TextEditChangeImpl2(edits, changeAnnotations) {
            this.edits = edits;
            this.changeAnnotations = changeAnnotations;
          }
          TextEditChangeImpl2.prototype.insert = function(position, newText, annotation) {
            var edit;
            var id;
            if (annotation === void 0) {
              edit = TextEdit2.insert(position, newText);
            } else if (ChangeAnnotationIdentifier.is(annotation)) {
              id = annotation;
              edit = AnnotatedTextEdit.insert(position, newText, annotation);
            } else {
              this.assertChangeAnnotations(this.changeAnnotations);
              id = this.changeAnnotations.manage(annotation);
              edit = AnnotatedTextEdit.insert(position, newText, id);
            }
            this.edits.push(edit);
            if (id !== void 0) {
              return id;
            }
          };
          TextEditChangeImpl2.prototype.replace = function(range, newText, annotation) {
            var edit;
            var id;
            if (annotation === void 0) {
              edit = TextEdit2.replace(range, newText);
            } else if (ChangeAnnotationIdentifier.is(annotation)) {
              id = annotation;
              edit = AnnotatedTextEdit.replace(range, newText, annotation);
            } else {
              this.assertChangeAnnotations(this.changeAnnotations);
              id = this.changeAnnotations.manage(annotation);
              edit = AnnotatedTextEdit.replace(range, newText, id);
            }
            this.edits.push(edit);
            if (id !== void 0) {
              return id;
            }
          };
          TextEditChangeImpl2.prototype.delete = function(range, annotation) {
            var edit;
            var id;
            if (annotation === void 0) {
              edit = TextEdit2.del(range);
            } else if (ChangeAnnotationIdentifier.is(annotation)) {
              id = annotation;
              edit = AnnotatedTextEdit.del(range, annotation);
            } else {
              this.assertChangeAnnotations(this.changeAnnotations);
              id = this.changeAnnotations.manage(annotation);
              edit = AnnotatedTextEdit.del(range, id);
            }
            this.edits.push(edit);
            if (id !== void 0) {
              return id;
            }
          };
          TextEditChangeImpl2.prototype.add = function(edit) {
            this.edits.push(edit);
          };
          TextEditChangeImpl2.prototype.all = function() {
            return this.edits;
          };
          TextEditChangeImpl2.prototype.clear = function() {
            this.edits.splice(0, this.edits.length);
          };
          TextEditChangeImpl2.prototype.assertChangeAnnotations = function(value) {
            if (value === void 0) {
              throw new Error("Text edit change is not configured to manage change annotations.");
            }
          };
          return TextEditChangeImpl2;
        }()
      );
      var ChangeAnnotations = (
        /** @class */
        function() {
          function ChangeAnnotations2(annotations) {
            this._annotations = annotations === void 0 ? /* @__PURE__ */ Object.create(null) : annotations;
            this._counter = 0;
            this._size = 0;
          }
          ChangeAnnotations2.prototype.all = function() {
            return this._annotations;
          };
          Object.defineProperty(ChangeAnnotations2.prototype, "size", {
            get: function() {
              return this._size;
            },
            enumerable: false,
            configurable: true
          });
          ChangeAnnotations2.prototype.manage = function(idOrAnnotation, annotation) {
            var id;
            if (ChangeAnnotationIdentifier.is(idOrAnnotation)) {
              id = idOrAnnotation;
            } else {
              id = this.nextId();
              annotation = idOrAnnotation;
            }
            if (this._annotations[id] !== void 0) {
              throw new Error("Id ".concat(id, " is already in use."));
            }
            if (annotation === void 0) {
              throw new Error("No annotation provided for id ".concat(id));
            }
            this._annotations[id] = annotation;
            this._size++;
            return id;
          };
          ChangeAnnotations2.prototype.nextId = function() {
            this._counter++;
            return this._counter.toString();
          };
          return ChangeAnnotations2;
        }()
      );
      var WorkspaceChange = (
        /** @class */
        function() {
          function WorkspaceChange2(workspaceEdit) {
            var _this = this;
            this._textEditChanges = /* @__PURE__ */ Object.create(null);
            if (workspaceEdit !== void 0) {
              this._workspaceEdit = workspaceEdit;
              if (workspaceEdit.documentChanges) {
                this._changeAnnotations = new ChangeAnnotations(workspaceEdit.changeAnnotations);
                workspaceEdit.changeAnnotations = this._changeAnnotations.all();
                workspaceEdit.documentChanges.forEach(function(change) {
                  if (TextDocumentEdit.is(change)) {
                    var textEditChange = new TextEditChangeImpl(change.edits, _this._changeAnnotations);
                    _this._textEditChanges[change.textDocument.uri] = textEditChange;
                  }
                });
              } else if (workspaceEdit.changes) {
                Object.keys(workspaceEdit.changes).forEach(function(key) {
                  var textEditChange = new TextEditChangeImpl(workspaceEdit.changes[key]);
                  _this._textEditChanges[key] = textEditChange;
                });
              }
            } else {
              this._workspaceEdit = {};
            }
          }
          Object.defineProperty(WorkspaceChange2.prototype, "edit", {
            /**
             * Returns the underlying {@link WorkspaceEdit} literal
             * use to be returned from a workspace edit operation like rename.
             */
            get: function() {
              this.initDocumentChanges();
              if (this._changeAnnotations !== void 0) {
                if (this._changeAnnotations.size === 0) {
                  this._workspaceEdit.changeAnnotations = void 0;
                } else {
                  this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
                }
              }
              return this._workspaceEdit;
            },
            enumerable: false,
            configurable: true
          });
          WorkspaceChange2.prototype.getTextEditChange = function(key) {
            if (OptionalVersionedTextDocumentIdentifier.is(key)) {
              this.initDocumentChanges();
              if (this._workspaceEdit.documentChanges === void 0) {
                throw new Error("Workspace edit is not configured for document changes.");
              }
              var textDocument = { uri: key.uri, version: key.version };
              var result = this._textEditChanges[textDocument.uri];
              if (!result) {
                var edits = [];
                var textDocumentEdit = {
                  textDocument,
                  edits
                };
                this._workspaceEdit.documentChanges.push(textDocumentEdit);
                result = new TextEditChangeImpl(edits, this._changeAnnotations);
                this._textEditChanges[textDocument.uri] = result;
              }
              return result;
            } else {
              this.initChanges();
              if (this._workspaceEdit.changes === void 0) {
                throw new Error("Workspace edit is not configured for normal text edit changes.");
              }
              var result = this._textEditChanges[key];
              if (!result) {
                var edits = [];
                this._workspaceEdit.changes[key] = edits;
                result = new TextEditChangeImpl(edits);
                this._textEditChanges[key] = result;
              }
              return result;
            }
          };
          WorkspaceChange2.prototype.initDocumentChanges = function() {
            if (this._workspaceEdit.documentChanges === void 0 && this._workspaceEdit.changes === void 0) {
              this._changeAnnotations = new ChangeAnnotations();
              this._workspaceEdit.documentChanges = [];
              this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
            }
          };
          WorkspaceChange2.prototype.initChanges = function() {
            if (this._workspaceEdit.documentChanges === void 0 && this._workspaceEdit.changes === void 0) {
              this._workspaceEdit.changes = /* @__PURE__ */ Object.create(null);
            }
          };
          WorkspaceChange2.prototype.createFile = function(uri, optionsOrAnnotation, options) {
            this.initDocumentChanges();
            if (this._workspaceEdit.documentChanges === void 0) {
              throw new Error("Workspace edit is not configured for document changes.");
            }
            var annotation;
            if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
              annotation = optionsOrAnnotation;
            } else {
              options = optionsOrAnnotation;
            }
            var operation;
            var id;
            if (annotation === void 0) {
              operation = CreateFile.create(uri, options);
            } else {
              id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
              operation = CreateFile.create(uri, options, id);
            }
            this._workspaceEdit.documentChanges.push(operation);
            if (id !== void 0) {
              return id;
            }
          };
          WorkspaceChange2.prototype.renameFile = function(oldUri, newUri, optionsOrAnnotation, options) {
            this.initDocumentChanges();
            if (this._workspaceEdit.documentChanges === void 0) {
              throw new Error("Workspace edit is not configured for document changes.");
            }
            var annotation;
            if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
              annotation = optionsOrAnnotation;
            } else {
              options = optionsOrAnnotation;
            }
            var operation;
            var id;
            if (annotation === void 0) {
              operation = RenameFile.create(oldUri, newUri, options);
            } else {
              id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
              operation = RenameFile.create(oldUri, newUri, options, id);
            }
            this._workspaceEdit.documentChanges.push(operation);
            if (id !== void 0) {
              return id;
            }
          };
          WorkspaceChange2.prototype.deleteFile = function(uri, optionsOrAnnotation, options) {
            this.initDocumentChanges();
            if (this._workspaceEdit.documentChanges === void 0) {
              throw new Error("Workspace edit is not configured for document changes.");
            }
            var annotation;
            if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
              annotation = optionsOrAnnotation;
            } else {
              options = optionsOrAnnotation;
            }
            var operation;
            var id;
            if (annotation === void 0) {
              operation = DeleteFile.create(uri, options);
            } else {
              id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
              operation = DeleteFile.create(uri, options, id);
            }
            this._workspaceEdit.documentChanges.push(operation);
            if (id !== void 0) {
              return id;
            }
          };
          return WorkspaceChange2;
        }()
      );
      exports3.WorkspaceChange = WorkspaceChange;
      var TextDocumentIdentifier;
      (function(TextDocumentIdentifier2) {
        function create(uri) {
          return { uri };
        }
        TextDocumentIdentifier2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.string(candidate.uri);
        }
        TextDocumentIdentifier2.is = is;
      })(TextDocumentIdentifier || (exports3.TextDocumentIdentifier = TextDocumentIdentifier = {}));
      var VersionedTextDocumentIdentifier;
      (function(VersionedTextDocumentIdentifier2) {
        function create(uri, version) {
          return { uri, version };
        }
        VersionedTextDocumentIdentifier2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.string(candidate.uri) && Is.integer(candidate.version);
        }
        VersionedTextDocumentIdentifier2.is = is;
      })(VersionedTextDocumentIdentifier || (exports3.VersionedTextDocumentIdentifier = VersionedTextDocumentIdentifier = {}));
      var OptionalVersionedTextDocumentIdentifier;
      (function(OptionalVersionedTextDocumentIdentifier2) {
        function create(uri, version) {
          return { uri, version };
        }
        OptionalVersionedTextDocumentIdentifier2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.string(candidate.uri) && (candidate.version === null || Is.integer(candidate.version));
        }
        OptionalVersionedTextDocumentIdentifier2.is = is;
      })(OptionalVersionedTextDocumentIdentifier || (exports3.OptionalVersionedTextDocumentIdentifier = OptionalVersionedTextDocumentIdentifier = {}));
      var TextDocumentItem;
      (function(TextDocumentItem2) {
        function create(uri, languageId, version, text) {
          return { uri, languageId, version, text };
        }
        TextDocumentItem2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.string(candidate.uri) && Is.string(candidate.languageId) && Is.integer(candidate.version) && Is.string(candidate.text);
        }
        TextDocumentItem2.is = is;
      })(TextDocumentItem || (exports3.TextDocumentItem = TextDocumentItem = {}));
      var MarkupKind2;
      (function(MarkupKind3) {
        MarkupKind3.PlainText = "plaintext";
        MarkupKind3.Markdown = "markdown";
        function is(value) {
          var candidate = value;
          return candidate === MarkupKind3.PlainText || candidate === MarkupKind3.Markdown;
        }
        MarkupKind3.is = is;
      })(MarkupKind2 || (exports3.MarkupKind = MarkupKind2 = {}));
      var MarkupContent;
      (function(MarkupContent2) {
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(value) && MarkupKind2.is(candidate.kind) && Is.string(candidate.value);
        }
        MarkupContent2.is = is;
      })(MarkupContent || (exports3.MarkupContent = MarkupContent = {}));
      var CompletionItemKind2;
      (function(CompletionItemKind3) {
        CompletionItemKind3.Text = 1;
        CompletionItemKind3.Method = 2;
        CompletionItemKind3.Function = 3;
        CompletionItemKind3.Constructor = 4;
        CompletionItemKind3.Field = 5;
        CompletionItemKind3.Variable = 6;
        CompletionItemKind3.Class = 7;
        CompletionItemKind3.Interface = 8;
        CompletionItemKind3.Module = 9;
        CompletionItemKind3.Property = 10;
        CompletionItemKind3.Unit = 11;
        CompletionItemKind3.Value = 12;
        CompletionItemKind3.Enum = 13;
        CompletionItemKind3.Keyword = 14;
        CompletionItemKind3.Snippet = 15;
        CompletionItemKind3.Color = 16;
        CompletionItemKind3.File = 17;
        CompletionItemKind3.Reference = 18;
        CompletionItemKind3.Folder = 19;
        CompletionItemKind3.EnumMember = 20;
        CompletionItemKind3.Constant = 21;
        CompletionItemKind3.Struct = 22;
        CompletionItemKind3.Event = 23;
        CompletionItemKind3.Operator = 24;
        CompletionItemKind3.TypeParameter = 25;
      })(CompletionItemKind2 || (exports3.CompletionItemKind = CompletionItemKind2 = {}));
      var InsertTextFormat;
      (function(InsertTextFormat2) {
        InsertTextFormat2.PlainText = 1;
        InsertTextFormat2.Snippet = 2;
      })(InsertTextFormat || (exports3.InsertTextFormat = InsertTextFormat = {}));
      var CompletionItemTag;
      (function(CompletionItemTag2) {
        CompletionItemTag2.Deprecated = 1;
      })(CompletionItemTag || (exports3.CompletionItemTag = CompletionItemTag = {}));
      var InsertReplaceEdit;
      (function(InsertReplaceEdit2) {
        function create(newText, insert, replace) {
          return { newText, insert, replace };
        }
        InsertReplaceEdit2.create = create;
        function is(value) {
          var candidate = value;
          return candidate && Is.string(candidate.newText) && Range.is(candidate.insert) && Range.is(candidate.replace);
        }
        InsertReplaceEdit2.is = is;
      })(InsertReplaceEdit || (exports3.InsertReplaceEdit = InsertReplaceEdit = {}));
      var InsertTextMode;
      (function(InsertTextMode2) {
        InsertTextMode2.asIs = 1;
        InsertTextMode2.adjustIndentation = 2;
      })(InsertTextMode || (exports3.InsertTextMode = InsertTextMode = {}));
      var CompletionItemLabelDetails;
      (function(CompletionItemLabelDetails2) {
        function is(value) {
          var candidate = value;
          return candidate && (Is.string(candidate.detail) || candidate.detail === void 0) && (Is.string(candidate.description) || candidate.description === void 0);
        }
        CompletionItemLabelDetails2.is = is;
      })(CompletionItemLabelDetails || (exports3.CompletionItemLabelDetails = CompletionItemLabelDetails = {}));
      var CompletionItem2;
      (function(CompletionItem3) {
        function create(label) {
          return { label };
        }
        CompletionItem3.create = create;
      })(CompletionItem2 || (exports3.CompletionItem = CompletionItem2 = {}));
      var CompletionList;
      (function(CompletionList2) {
        function create(items, isIncomplete) {
          return { items: items ? items : [], isIncomplete: !!isIncomplete };
        }
        CompletionList2.create = create;
      })(CompletionList || (exports3.CompletionList = CompletionList = {}));
      var MarkedString;
      (function(MarkedString2) {
        function fromPlainText(plainText) {
          return plainText.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&");
        }
        MarkedString2.fromPlainText = fromPlainText;
        function is(value) {
          var candidate = value;
          return Is.string(candidate) || Is.objectLiteral(candidate) && Is.string(candidate.language) && Is.string(candidate.value);
        }
        MarkedString2.is = is;
      })(MarkedString || (exports3.MarkedString = MarkedString = {}));
      var Hover2;
      (function(Hover3) {
        function is(value) {
          var candidate = value;
          return !!candidate && Is.objectLiteral(candidate) && (MarkupContent.is(candidate.contents) || MarkedString.is(candidate.contents) || Is.typedArray(candidate.contents, MarkedString.is)) && (value.range === void 0 || Range.is(value.range));
        }
        Hover3.is = is;
      })(Hover2 || (exports3.Hover = Hover2 = {}));
      var ParameterInformation2;
      (function(ParameterInformation3) {
        function create(label, documentation) {
          return documentation ? { label, documentation } : { label };
        }
        ParameterInformation3.create = create;
      })(ParameterInformation2 || (exports3.ParameterInformation = ParameterInformation2 = {}));
      var SignatureInformation2;
      (function(SignatureInformation3) {
        function create(label, documentation) {
          var parameters = [];
          for (var _i = 2; _i < arguments.length; _i++) {
            parameters[_i - 2] = arguments[_i];
          }
          var result = { label };
          if (Is.defined(documentation)) {
            result.documentation = documentation;
          }
          if (Is.defined(parameters)) {
            result.parameters = parameters;
          } else {
            result.parameters = [];
          }
          return result;
        }
        SignatureInformation3.create = create;
      })(SignatureInformation2 || (exports3.SignatureInformation = SignatureInformation2 = {}));
      var DocumentHighlightKind;
      (function(DocumentHighlightKind2) {
        DocumentHighlightKind2.Text = 1;
        DocumentHighlightKind2.Read = 2;
        DocumentHighlightKind2.Write = 3;
      })(DocumentHighlightKind || (exports3.DocumentHighlightKind = DocumentHighlightKind = {}));
      var DocumentHighlight;
      (function(DocumentHighlight2) {
        function create(range, kind) {
          var result = { range };
          if (Is.number(kind)) {
            result.kind = kind;
          }
          return result;
        }
        DocumentHighlight2.create = create;
      })(DocumentHighlight || (exports3.DocumentHighlight = DocumentHighlight = {}));
      var SymbolKind2;
      (function(SymbolKind3) {
        SymbolKind3.File = 1;
        SymbolKind3.Module = 2;
        SymbolKind3.Namespace = 3;
        SymbolKind3.Package = 4;
        SymbolKind3.Class = 5;
        SymbolKind3.Method = 6;
        SymbolKind3.Property = 7;
        SymbolKind3.Field = 8;
        SymbolKind3.Constructor = 9;
        SymbolKind3.Enum = 10;
        SymbolKind3.Interface = 11;
        SymbolKind3.Function = 12;
        SymbolKind3.Variable = 13;
        SymbolKind3.Constant = 14;
        SymbolKind3.String = 15;
        SymbolKind3.Number = 16;
        SymbolKind3.Boolean = 17;
        SymbolKind3.Array = 18;
        SymbolKind3.Object = 19;
        SymbolKind3.Key = 20;
        SymbolKind3.Null = 21;
        SymbolKind3.EnumMember = 22;
        SymbolKind3.Struct = 23;
        SymbolKind3.Event = 24;
        SymbolKind3.Operator = 25;
        SymbolKind3.TypeParameter = 26;
      })(SymbolKind2 || (exports3.SymbolKind = SymbolKind2 = {}));
      var SymbolTag;
      (function(SymbolTag2) {
        SymbolTag2.Deprecated = 1;
      })(SymbolTag || (exports3.SymbolTag = SymbolTag = {}));
      var SymbolInformation;
      (function(SymbolInformation2) {
        function create(name, kind, range, uri, containerName) {
          var result = {
            name,
            kind,
            location: { uri, range }
          };
          if (containerName) {
            result.containerName = containerName;
          }
          return result;
        }
        SymbolInformation2.create = create;
      })(SymbolInformation || (exports3.SymbolInformation = SymbolInformation = {}));
      var WorkspaceSymbol2;
      (function(WorkspaceSymbol3) {
        function create(name, kind, uri, range) {
          return range !== void 0 ? { name, kind, location: { uri, range } } : { name, kind, location: { uri } };
        }
        WorkspaceSymbol3.create = create;
      })(WorkspaceSymbol2 || (exports3.WorkspaceSymbol = WorkspaceSymbol2 = {}));
      var DocumentSymbol2;
      (function(DocumentSymbol3) {
        function create(name, detail, kind, range, selectionRange, children) {
          var result = {
            name,
            detail,
            kind,
            range,
            selectionRange
          };
          if (children !== void 0) {
            result.children = children;
          }
          return result;
        }
        DocumentSymbol3.create = create;
        function is(value) {
          var candidate = value;
          return candidate && Is.string(candidate.name) && Is.number(candidate.kind) && Range.is(candidate.range) && Range.is(candidate.selectionRange) && (candidate.detail === void 0 || Is.string(candidate.detail)) && (candidate.deprecated === void 0 || Is.boolean(candidate.deprecated)) && (candidate.children === void 0 || Array.isArray(candidate.children)) && (candidate.tags === void 0 || Array.isArray(candidate.tags));
        }
        DocumentSymbol3.is = is;
      })(DocumentSymbol2 || (exports3.DocumentSymbol = DocumentSymbol2 = {}));
      var CodeActionKind2;
      (function(CodeActionKind3) {
        CodeActionKind3.Empty = "";
        CodeActionKind3.QuickFix = "quickfix";
        CodeActionKind3.Refactor = "refactor";
        CodeActionKind3.RefactorExtract = "refactor.extract";
        CodeActionKind3.RefactorInline = "refactor.inline";
        CodeActionKind3.RefactorRewrite = "refactor.rewrite";
        CodeActionKind3.Source = "source";
        CodeActionKind3.SourceOrganizeImports = "source.organizeImports";
        CodeActionKind3.SourceFixAll = "source.fixAll";
      })(CodeActionKind2 || (exports3.CodeActionKind = CodeActionKind2 = {}));
      var CodeActionTriggerKind;
      (function(CodeActionTriggerKind2) {
        CodeActionTriggerKind2.Invoked = 1;
        CodeActionTriggerKind2.Automatic = 2;
      })(CodeActionTriggerKind || (exports3.CodeActionTriggerKind = CodeActionTriggerKind = {}));
      var CodeActionContext;
      (function(CodeActionContext2) {
        function create(diagnostics, only, triggerKind) {
          var result = { diagnostics };
          if (only !== void 0 && only !== null) {
            result.only = only;
          }
          if (triggerKind !== void 0 && triggerKind !== null) {
            result.triggerKind = triggerKind;
          }
          return result;
        }
        CodeActionContext2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.typedArray(candidate.diagnostics, Diagnostic2.is) && (candidate.only === void 0 || Is.typedArray(candidate.only, Is.string)) && (candidate.triggerKind === void 0 || candidate.triggerKind === CodeActionTriggerKind.Invoked || candidate.triggerKind === CodeActionTriggerKind.Automatic);
        }
        CodeActionContext2.is = is;
      })(CodeActionContext || (exports3.CodeActionContext = CodeActionContext = {}));
      var CodeAction2;
      (function(CodeAction3) {
        function create(title, kindOrCommandOrEdit, kind) {
          var result = { title };
          var checkKind = true;
          if (typeof kindOrCommandOrEdit === "string") {
            checkKind = false;
            result.kind = kindOrCommandOrEdit;
          } else if (Command.is(kindOrCommandOrEdit)) {
            result.command = kindOrCommandOrEdit;
          } else {
            result.edit = kindOrCommandOrEdit;
          }
          if (checkKind && kind !== void 0) {
            result.kind = kind;
          }
          return result;
        }
        CodeAction3.create = create;
        function is(value) {
          var candidate = value;
          return candidate && Is.string(candidate.title) && (candidate.diagnostics === void 0 || Is.typedArray(candidate.diagnostics, Diagnostic2.is)) && (candidate.kind === void 0 || Is.string(candidate.kind)) && (candidate.edit !== void 0 || candidate.command !== void 0) && (candidate.command === void 0 || Command.is(candidate.command)) && (candidate.isPreferred === void 0 || Is.boolean(candidate.isPreferred)) && (candidate.edit === void 0 || WorkspaceEdit.is(candidate.edit));
        }
        CodeAction3.is = is;
      })(CodeAction2 || (exports3.CodeAction = CodeAction2 = {}));
      var CodeLens;
      (function(CodeLens2) {
        function create(range, data) {
          var result = { range };
          if (Is.defined(data)) {
            result.data = data;
          }
          return result;
        }
        CodeLens2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.command) || Command.is(candidate.command));
        }
        CodeLens2.is = is;
      })(CodeLens || (exports3.CodeLens = CodeLens = {}));
      var FormattingOptions;
      (function(FormattingOptions2) {
        function create(tabSize, insertSpaces) {
          return { tabSize, insertSpaces };
        }
        FormattingOptions2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.uinteger(candidate.tabSize) && Is.boolean(candidate.insertSpaces);
        }
        FormattingOptions2.is = is;
      })(FormattingOptions || (exports3.FormattingOptions = FormattingOptions = {}));
      var DocumentLink;
      (function(DocumentLink2) {
        function create(range, target, data) {
          return { range, target, data };
        }
        DocumentLink2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.target) || Is.string(candidate.target));
        }
        DocumentLink2.is = is;
      })(DocumentLink || (exports3.DocumentLink = DocumentLink = {}));
      var SelectionRange;
      (function(SelectionRange2) {
        function create(range, parent) {
          return { range, parent };
        }
        SelectionRange2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Range.is(candidate.range) && (candidate.parent === void 0 || SelectionRange2.is(candidate.parent));
        }
        SelectionRange2.is = is;
      })(SelectionRange || (exports3.SelectionRange = SelectionRange = {}));
      var SemanticTokenTypes;
      (function(SemanticTokenTypes2) {
        SemanticTokenTypes2["namespace"] = "namespace";
        SemanticTokenTypes2["type"] = "type";
        SemanticTokenTypes2["class"] = "class";
        SemanticTokenTypes2["enum"] = "enum";
        SemanticTokenTypes2["interface"] = "interface";
        SemanticTokenTypes2["struct"] = "struct";
        SemanticTokenTypes2["typeParameter"] = "typeParameter";
        SemanticTokenTypes2["parameter"] = "parameter";
        SemanticTokenTypes2["variable"] = "variable";
        SemanticTokenTypes2["property"] = "property";
        SemanticTokenTypes2["enumMember"] = "enumMember";
        SemanticTokenTypes2["event"] = "event";
        SemanticTokenTypes2["function"] = "function";
        SemanticTokenTypes2["method"] = "method";
        SemanticTokenTypes2["macro"] = "macro";
        SemanticTokenTypes2["keyword"] = "keyword";
        SemanticTokenTypes2["modifier"] = "modifier";
        SemanticTokenTypes2["comment"] = "comment";
        SemanticTokenTypes2["string"] = "string";
        SemanticTokenTypes2["number"] = "number";
        SemanticTokenTypes2["regexp"] = "regexp";
        SemanticTokenTypes2["operator"] = "operator";
        SemanticTokenTypes2["decorator"] = "decorator";
      })(SemanticTokenTypes || (exports3.SemanticTokenTypes = SemanticTokenTypes = {}));
      var SemanticTokenModifiers;
      (function(SemanticTokenModifiers2) {
        SemanticTokenModifiers2["declaration"] = "declaration";
        SemanticTokenModifiers2["definition"] = "definition";
        SemanticTokenModifiers2["readonly"] = "readonly";
        SemanticTokenModifiers2["static"] = "static";
        SemanticTokenModifiers2["deprecated"] = "deprecated";
        SemanticTokenModifiers2["abstract"] = "abstract";
        SemanticTokenModifiers2["async"] = "async";
        SemanticTokenModifiers2["modification"] = "modification";
        SemanticTokenModifiers2["documentation"] = "documentation";
        SemanticTokenModifiers2["defaultLibrary"] = "defaultLibrary";
      })(SemanticTokenModifiers || (exports3.SemanticTokenModifiers = SemanticTokenModifiers = {}));
      var SemanticTokens2;
      (function(SemanticTokens3) {
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && (candidate.resultId === void 0 || typeof candidate.resultId === "string") && Array.isArray(candidate.data) && (candidate.data.length === 0 || typeof candidate.data[0] === "number");
        }
        SemanticTokens3.is = is;
      })(SemanticTokens2 || (exports3.SemanticTokens = SemanticTokens2 = {}));
      var InlineValueText;
      (function(InlineValueText2) {
        function create(range, text) {
          return { range, text };
        }
        InlineValueText2.create = create;
        function is(value) {
          var candidate = value;
          return candidate !== void 0 && candidate !== null && Range.is(candidate.range) && Is.string(candidate.text);
        }
        InlineValueText2.is = is;
      })(InlineValueText || (exports3.InlineValueText = InlineValueText = {}));
      var InlineValueVariableLookup;
      (function(InlineValueVariableLookup2) {
        function create(range, variableName, caseSensitiveLookup) {
          return { range, variableName, caseSensitiveLookup };
        }
        InlineValueVariableLookup2.create = create;
        function is(value) {
          var candidate = value;
          return candidate !== void 0 && candidate !== null && Range.is(candidate.range) && Is.boolean(candidate.caseSensitiveLookup) && (Is.string(candidate.variableName) || candidate.variableName === void 0);
        }
        InlineValueVariableLookup2.is = is;
      })(InlineValueVariableLookup || (exports3.InlineValueVariableLookup = InlineValueVariableLookup = {}));
      var InlineValueEvaluatableExpression;
      (function(InlineValueEvaluatableExpression2) {
        function create(range, expression) {
          return { range, expression };
        }
        InlineValueEvaluatableExpression2.create = create;
        function is(value) {
          var candidate = value;
          return candidate !== void 0 && candidate !== null && Range.is(candidate.range) && (Is.string(candidate.expression) || candidate.expression === void 0);
        }
        InlineValueEvaluatableExpression2.is = is;
      })(InlineValueEvaluatableExpression || (exports3.InlineValueEvaluatableExpression = InlineValueEvaluatableExpression = {}));
      var InlineValueContext;
      (function(InlineValueContext2) {
        function create(frameId, stoppedLocation) {
          return { frameId, stoppedLocation };
        }
        InlineValueContext2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Range.is(value.stoppedLocation);
        }
        InlineValueContext2.is = is;
      })(InlineValueContext || (exports3.InlineValueContext = InlineValueContext = {}));
      var InlayHintKind;
      (function(InlayHintKind2) {
        InlayHintKind2.Type = 1;
        InlayHintKind2.Parameter = 2;
        function is(value) {
          return value === 1 || value === 2;
        }
        InlayHintKind2.is = is;
      })(InlayHintKind || (exports3.InlayHintKind = InlayHintKind = {}));
      var InlayHintLabelPart;
      (function(InlayHintLabelPart2) {
        function create(value) {
          return { value };
        }
        InlayHintLabelPart2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && (candidate.tooltip === void 0 || Is.string(candidate.tooltip) || MarkupContent.is(candidate.tooltip)) && (candidate.location === void 0 || Location2.is(candidate.location)) && (candidate.command === void 0 || Command.is(candidate.command));
        }
        InlayHintLabelPart2.is = is;
      })(InlayHintLabelPart || (exports3.InlayHintLabelPart = InlayHintLabelPart = {}));
      var InlayHint;
      (function(InlayHint2) {
        function create(position, label, kind) {
          var result = { position, label };
          if (kind !== void 0) {
            result.kind = kind;
          }
          return result;
        }
        InlayHint2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Position.is(candidate.position) && (Is.string(candidate.label) || Is.typedArray(candidate.label, InlayHintLabelPart.is)) && (candidate.kind === void 0 || InlayHintKind.is(candidate.kind)) && candidate.textEdits === void 0 || Is.typedArray(candidate.textEdits, TextEdit2.is) && (candidate.tooltip === void 0 || Is.string(candidate.tooltip) || MarkupContent.is(candidate.tooltip)) && (candidate.paddingLeft === void 0 || Is.boolean(candidate.paddingLeft)) && (candidate.paddingRight === void 0 || Is.boolean(candidate.paddingRight));
        }
        InlayHint2.is = is;
      })(InlayHint || (exports3.InlayHint = InlayHint = {}));
      var StringValue;
      (function(StringValue2) {
        function createSnippet(value) {
          return { kind: "snippet", value };
        }
        StringValue2.createSnippet = createSnippet;
      })(StringValue || (exports3.StringValue = StringValue = {}));
      var InlineCompletionItem;
      (function(InlineCompletionItem2) {
        function create(insertText, filterText, range, command) {
          return { insertText, filterText, range, command };
        }
        InlineCompletionItem2.create = create;
      })(InlineCompletionItem || (exports3.InlineCompletionItem = InlineCompletionItem = {}));
      var InlineCompletionList;
      (function(InlineCompletionList2) {
        function create(items) {
          return { items };
        }
        InlineCompletionList2.create = create;
      })(InlineCompletionList || (exports3.InlineCompletionList = InlineCompletionList = {}));
      var InlineCompletionTriggerKind;
      (function(InlineCompletionTriggerKind2) {
        InlineCompletionTriggerKind2.Invoked = 0;
        InlineCompletionTriggerKind2.Automatic = 1;
      })(InlineCompletionTriggerKind || (exports3.InlineCompletionTriggerKind = InlineCompletionTriggerKind = {}));
      var SelectedCompletionInfo;
      (function(SelectedCompletionInfo2) {
        function create(range, text) {
          return { range, text };
        }
        SelectedCompletionInfo2.create = create;
      })(SelectedCompletionInfo || (exports3.SelectedCompletionInfo = SelectedCompletionInfo = {}));
      var InlineCompletionContext;
      (function(InlineCompletionContext2) {
        function create(triggerKind, selectedCompletionInfo) {
          return { triggerKind, selectedCompletionInfo };
        }
        InlineCompletionContext2.create = create;
      })(InlineCompletionContext || (exports3.InlineCompletionContext = InlineCompletionContext = {}));
      var WorkspaceFolder;
      (function(WorkspaceFolder2) {
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && URI.is(candidate.uri) && Is.string(candidate.name);
        }
        WorkspaceFolder2.is = is;
      })(WorkspaceFolder || (exports3.WorkspaceFolder = WorkspaceFolder = {}));
      exports3.EOL = ["\n", "\r\n", "\r"];
      var TextDocument2;
      (function(TextDocument3) {
        function create(uri, languageId, version, content) {
          return new FullTextDocument2(uri, languageId, version, content);
        }
        TextDocument3.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.string(candidate.uri) && (Is.undefined(candidate.languageId) || Is.string(candidate.languageId)) && Is.uinteger(candidate.lineCount) && Is.func(candidate.getText) && Is.func(candidate.positionAt) && Is.func(candidate.offsetAt) ? true : false;
        }
        TextDocument3.is = is;
        function applyEdits(document, edits) {
          var text = document.getText();
          var sortedEdits = mergeSort2(edits, function(a, b) {
            var diff = a.range.start.line - b.range.start.line;
            if (diff === 0) {
              return a.range.start.character - b.range.start.character;
            }
            return diff;
          });
          var lastModifiedOffset = text.length;
          for (var i = sortedEdits.length - 1; i >= 0; i--) {
            var e = sortedEdits[i];
            var startOffset = document.offsetAt(e.range.start);
            var endOffset = document.offsetAt(e.range.end);
            if (endOffset <= lastModifiedOffset) {
              text = text.substring(0, startOffset) + e.newText + text.substring(endOffset, text.length);
            } else {
              throw new Error("Overlapping edit");
            }
            lastModifiedOffset = startOffset;
          }
          return text;
        }
        TextDocument3.applyEdits = applyEdits;
        function mergeSort2(data, compare) {
          if (data.length <= 1) {
            return data;
          }
          var p = data.length / 2 | 0;
          var left = data.slice(0, p);
          var right = data.slice(p);
          mergeSort2(left, compare);
          mergeSort2(right, compare);
          var leftIdx = 0;
          var rightIdx = 0;
          var i = 0;
          while (leftIdx < left.length && rightIdx < right.length) {
            var ret = compare(left[leftIdx], right[rightIdx]);
            if (ret <= 0) {
              data[i++] = left[leftIdx++];
            } else {
              data[i++] = right[rightIdx++];
            }
          }
          while (leftIdx < left.length) {
            data[i++] = left[leftIdx++];
          }
          while (rightIdx < right.length) {
            data[i++] = right[rightIdx++];
          }
          return data;
        }
      })(TextDocument2 || (exports3.TextDocument = TextDocument2 = {}));
      var FullTextDocument2 = (
        /** @class */
        function() {
          function FullTextDocument3(uri, languageId, version, content) {
            this._uri = uri;
            this._languageId = languageId;
            this._version = version;
            this._content = content;
            this._lineOffsets = void 0;
          }
          Object.defineProperty(FullTextDocument3.prototype, "uri", {
            get: function() {
              return this._uri;
            },
            enumerable: false,
            configurable: true
          });
          Object.defineProperty(FullTextDocument3.prototype, "languageId", {
            get: function() {
              return this._languageId;
            },
            enumerable: false,
            configurable: true
          });
          Object.defineProperty(FullTextDocument3.prototype, "version", {
            get: function() {
              return this._version;
            },
            enumerable: false,
            configurable: true
          });
          FullTextDocument3.prototype.getText = function(range) {
            if (range) {
              var start = this.offsetAt(range.start);
              var end = this.offsetAt(range.end);
              return this._content.substring(start, end);
            }
            return this._content;
          };
          FullTextDocument3.prototype.update = function(event, version) {
            this._content = event.text;
            this._version = version;
            this._lineOffsets = void 0;
          };
          FullTextDocument3.prototype.getLineOffsets = function() {
            if (this._lineOffsets === void 0) {
              var lineOffsets = [];
              var text = this._content;
              var isLineStart = true;
              for (var i = 0; i < text.length; i++) {
                if (isLineStart) {
                  lineOffsets.push(i);
                  isLineStart = false;
                }
                var ch = text.charAt(i);
                isLineStart = ch === "\r" || ch === "\n";
                if (ch === "\r" && i + 1 < text.length && text.charAt(i + 1) === "\n") {
                  i++;
                }
              }
              if (isLineStart && text.length > 0) {
                lineOffsets.push(text.length);
              }
              this._lineOffsets = lineOffsets;
            }
            return this._lineOffsets;
          };
          FullTextDocument3.prototype.positionAt = function(offset) {
            offset = Math.max(Math.min(offset, this._content.length), 0);
            var lineOffsets = this.getLineOffsets();
            var low = 0, high = lineOffsets.length;
            if (high === 0) {
              return Position.create(0, offset);
            }
            while (low < high) {
              var mid = Math.floor((low + high) / 2);
              if (lineOffsets[mid] > offset) {
                high = mid;
              } else {
                low = mid + 1;
              }
            }
            var line = low - 1;
            return Position.create(line, offset - lineOffsets[line]);
          };
          FullTextDocument3.prototype.offsetAt = function(position) {
            var lineOffsets = this.getLineOffsets();
            if (position.line >= lineOffsets.length) {
              return this._content.length;
            } else if (position.line < 0) {
              return 0;
            }
            var lineOffset = lineOffsets[position.line];
            var nextLineOffset = position.line + 1 < lineOffsets.length ? lineOffsets[position.line + 1] : this._content.length;
            return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
          };
          Object.defineProperty(FullTextDocument3.prototype, "lineCount", {
            get: function() {
              return this.getLineOffsets().length;
            },
            enumerable: false,
            configurable: true
          });
          return FullTextDocument3;
        }()
      );
      var Is;
      (function(Is2) {
        var toString = Object.prototype.toString;
        function defined(value) {
          return typeof value !== "undefined";
        }
        Is2.defined = defined;
        function undefined2(value) {
          return typeof value === "undefined";
        }
        Is2.undefined = undefined2;
        function boolean(value) {
          return value === true || value === false;
        }
        Is2.boolean = boolean;
        function string(value) {
          return toString.call(value) === "[object String]";
        }
        Is2.string = string;
        function number(value) {
          return toString.call(value) === "[object Number]";
        }
        Is2.number = number;
        function numberRange(value, min, max) {
          return toString.call(value) === "[object Number]" && min <= value && value <= max;
        }
        Is2.numberRange = numberRange;
        function integer2(value) {
          return toString.call(value) === "[object Number]" && -2147483648 <= value && value <= 2147483647;
        }
        Is2.integer = integer2;
        function uinteger2(value) {
          return toString.call(value) === "[object Number]" && 0 <= value && value <= 2147483647;
        }
        Is2.uinteger = uinteger2;
        function func(value) {
          return toString.call(value) === "[object Function]";
        }
        Is2.func = func;
        function objectLiteral(value) {
          return value !== null && typeof value === "object";
        }
        Is2.objectLiteral = objectLiteral;
        function typedArray(value, check) {
          return Array.isArray(value) && value.every(check);
        }
        Is2.typedArray = typedArray;
      })(Is || (Is = {}));
    });
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/messages.js
var require_messages2 = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/messages.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ProtocolNotificationType = exports2.ProtocolNotificationType0 = exports2.ProtocolRequestType = exports2.ProtocolRequestType0 = exports2.RegistrationType = exports2.MessageDirection = void 0;
    var vscode_jsonrpc_1 = require_main();
    var MessageDirection;
    (function(MessageDirection2) {
      MessageDirection2["clientToServer"] = "clientToServer";
      MessageDirection2["serverToClient"] = "serverToClient";
      MessageDirection2["both"] = "both";
    })(MessageDirection || (exports2.MessageDirection = MessageDirection = {}));
    var RegistrationType = class {
      constructor(method) {
        this.method = method;
      }
    };
    exports2.RegistrationType = RegistrationType;
    var ProtocolRequestType0 = class extends vscode_jsonrpc_1.RequestType0 {
      constructor(method) {
        super(method);
      }
    };
    exports2.ProtocolRequestType0 = ProtocolRequestType0;
    var ProtocolRequestType = class extends vscode_jsonrpc_1.RequestType {
      constructor(method) {
        super(method, vscode_jsonrpc_1.ParameterStructures.byName);
      }
    };
    exports2.ProtocolRequestType = ProtocolRequestType;
    var ProtocolNotificationType0 = class extends vscode_jsonrpc_1.NotificationType0 {
      constructor(method) {
        super(method);
      }
    };
    exports2.ProtocolNotificationType0 = ProtocolNotificationType0;
    var ProtocolNotificationType = class extends vscode_jsonrpc_1.NotificationType {
      constructor(method) {
        super(method, vscode_jsonrpc_1.ParameterStructures.byName);
      }
    };
    exports2.ProtocolNotificationType = ProtocolNotificationType;
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/utils/is.js
var require_is3 = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/utils/is.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.objectLiteral = exports2.typedArray = exports2.stringArray = exports2.array = exports2.func = exports2.error = exports2.number = exports2.string = exports2.boolean = void 0;
    function boolean(value) {
      return value === true || value === false;
    }
    exports2.boolean = boolean;
    function string(value) {
      return typeof value === "string" || value instanceof String;
    }
    exports2.string = string;
    function number(value) {
      return typeof value === "number" || value instanceof Number;
    }
    exports2.number = number;
    function error(value) {
      return value instanceof Error;
    }
    exports2.error = error;
    function func(value) {
      return typeof value === "function";
    }
    exports2.func = func;
    function array(value) {
      return Array.isArray(value);
    }
    exports2.array = array;
    function stringArray(value) {
      return array(value) && value.every((elem) => string(elem));
    }
    exports2.stringArray = stringArray;
    function typedArray(value, check) {
      return Array.isArray(value) && value.every(check);
    }
    exports2.typedArray = typedArray;
    function objectLiteral(value) {
      return value !== null && typeof value === "object";
    }
    exports2.objectLiteral = objectLiteral;
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.implementation.js
var require_protocol_implementation = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.implementation.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ImplementationRequest = void 0;
    var messages_1 = require_messages2();
    var ImplementationRequest;
    (function(ImplementationRequest2) {
      ImplementationRequest2.method = "textDocument/implementation";
      ImplementationRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ImplementationRequest2.type = new messages_1.ProtocolRequestType(ImplementationRequest2.method);
    })(ImplementationRequest || (exports2.ImplementationRequest = ImplementationRequest = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.typeDefinition.js
var require_protocol_typeDefinition = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.typeDefinition.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TypeDefinitionRequest = void 0;
    var messages_1 = require_messages2();
    var TypeDefinitionRequest;
    (function(TypeDefinitionRequest2) {
      TypeDefinitionRequest2.method = "textDocument/typeDefinition";
      TypeDefinitionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      TypeDefinitionRequest2.type = new messages_1.ProtocolRequestType(TypeDefinitionRequest2.method);
    })(TypeDefinitionRequest || (exports2.TypeDefinitionRequest = TypeDefinitionRequest = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.workspaceFolder.js
var require_protocol_workspaceFolder = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.workspaceFolder.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DidChangeWorkspaceFoldersNotification = exports2.WorkspaceFoldersRequest = void 0;
    var messages_1 = require_messages2();
    var WorkspaceFoldersRequest;
    (function(WorkspaceFoldersRequest2) {
      WorkspaceFoldersRequest2.method = "workspace/workspaceFolders";
      WorkspaceFoldersRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      WorkspaceFoldersRequest2.type = new messages_1.ProtocolRequestType0(WorkspaceFoldersRequest2.method);
    })(WorkspaceFoldersRequest || (exports2.WorkspaceFoldersRequest = WorkspaceFoldersRequest = {}));
    var DidChangeWorkspaceFoldersNotification;
    (function(DidChangeWorkspaceFoldersNotification2) {
      DidChangeWorkspaceFoldersNotification2.method = "workspace/didChangeWorkspaceFolders";
      DidChangeWorkspaceFoldersNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeWorkspaceFoldersNotification2.type = new messages_1.ProtocolNotificationType(DidChangeWorkspaceFoldersNotification2.method);
    })(DidChangeWorkspaceFoldersNotification || (exports2.DidChangeWorkspaceFoldersNotification = DidChangeWorkspaceFoldersNotification = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.configuration.js
var require_protocol_configuration = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.configuration.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConfigurationRequest = void 0;
    var messages_1 = require_messages2();
    var ConfigurationRequest;
    (function(ConfigurationRequest2) {
      ConfigurationRequest2.method = "workspace/configuration";
      ConfigurationRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      ConfigurationRequest2.type = new messages_1.ProtocolRequestType(ConfigurationRequest2.method);
    })(ConfigurationRequest || (exports2.ConfigurationRequest = ConfigurationRequest = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.colorProvider.js
var require_protocol_colorProvider = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.colorProvider.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ColorPresentationRequest = exports2.DocumentColorRequest = void 0;
    var messages_1 = require_messages2();
    var DocumentColorRequest;
    (function(DocumentColorRequest2) {
      DocumentColorRequest2.method = "textDocument/documentColor";
      DocumentColorRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentColorRequest2.type = new messages_1.ProtocolRequestType(DocumentColorRequest2.method);
    })(DocumentColorRequest || (exports2.DocumentColorRequest = DocumentColorRequest = {}));
    var ColorPresentationRequest;
    (function(ColorPresentationRequest2) {
      ColorPresentationRequest2.method = "textDocument/colorPresentation";
      ColorPresentationRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ColorPresentationRequest2.type = new messages_1.ProtocolRequestType(ColorPresentationRequest2.method);
    })(ColorPresentationRequest || (exports2.ColorPresentationRequest = ColorPresentationRequest = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.foldingRange.js
var require_protocol_foldingRange = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.foldingRange.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.FoldingRangeRefreshRequest = exports2.FoldingRangeRequest = void 0;
    var messages_1 = require_messages2();
    var FoldingRangeRequest;
    (function(FoldingRangeRequest2) {
      FoldingRangeRequest2.method = "textDocument/foldingRange";
      FoldingRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      FoldingRangeRequest2.type = new messages_1.ProtocolRequestType(FoldingRangeRequest2.method);
    })(FoldingRangeRequest || (exports2.FoldingRangeRequest = FoldingRangeRequest = {}));
    var FoldingRangeRefreshRequest;
    (function(FoldingRangeRefreshRequest2) {
      FoldingRangeRefreshRequest2.method = `workspace/foldingRange/refresh`;
      FoldingRangeRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      FoldingRangeRefreshRequest2.type = new messages_1.ProtocolRequestType0(FoldingRangeRefreshRequest2.method);
    })(FoldingRangeRefreshRequest || (exports2.FoldingRangeRefreshRequest = FoldingRangeRefreshRequest = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.declaration.js
var require_protocol_declaration = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.declaration.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DeclarationRequest = void 0;
    var messages_1 = require_messages2();
    var DeclarationRequest;
    (function(DeclarationRequest2) {
      DeclarationRequest2.method = "textDocument/declaration";
      DeclarationRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DeclarationRequest2.type = new messages_1.ProtocolRequestType(DeclarationRequest2.method);
    })(DeclarationRequest || (exports2.DeclarationRequest = DeclarationRequest = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.selectionRange.js
var require_protocol_selectionRange = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.selectionRange.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SelectionRangeRequest = void 0;
    var messages_1 = require_messages2();
    var SelectionRangeRequest;
    (function(SelectionRangeRequest2) {
      SelectionRangeRequest2.method = "textDocument/selectionRange";
      SelectionRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SelectionRangeRequest2.type = new messages_1.ProtocolRequestType(SelectionRangeRequest2.method);
    })(SelectionRangeRequest || (exports2.SelectionRangeRequest = SelectionRangeRequest = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.progress.js
var require_protocol_progress = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.progress.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WorkDoneProgressCancelNotification = exports2.WorkDoneProgressCreateRequest = exports2.WorkDoneProgress = void 0;
    var vscode_jsonrpc_1 = require_main();
    var messages_1 = require_messages2();
    var WorkDoneProgress;
    (function(WorkDoneProgress2) {
      WorkDoneProgress2.type = new vscode_jsonrpc_1.ProgressType();
      function is(value) {
        return value === WorkDoneProgress2.type;
      }
      WorkDoneProgress2.is = is;
    })(WorkDoneProgress || (exports2.WorkDoneProgress = WorkDoneProgress = {}));
    var WorkDoneProgressCreateRequest;
    (function(WorkDoneProgressCreateRequest2) {
      WorkDoneProgressCreateRequest2.method = "window/workDoneProgress/create";
      WorkDoneProgressCreateRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      WorkDoneProgressCreateRequest2.type = new messages_1.ProtocolRequestType(WorkDoneProgressCreateRequest2.method);
    })(WorkDoneProgressCreateRequest || (exports2.WorkDoneProgressCreateRequest = WorkDoneProgressCreateRequest = {}));
    var WorkDoneProgressCancelNotification;
    (function(WorkDoneProgressCancelNotification2) {
      WorkDoneProgressCancelNotification2.method = "window/workDoneProgress/cancel";
      WorkDoneProgressCancelNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      WorkDoneProgressCancelNotification2.type = new messages_1.ProtocolNotificationType(WorkDoneProgressCancelNotification2.method);
    })(WorkDoneProgressCancelNotification || (exports2.WorkDoneProgressCancelNotification = WorkDoneProgressCancelNotification = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.callHierarchy.js
var require_protocol_callHierarchy = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.callHierarchy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CallHierarchyOutgoingCallsRequest = exports2.CallHierarchyIncomingCallsRequest = exports2.CallHierarchyPrepareRequest = void 0;
    var messages_1 = require_messages2();
    var CallHierarchyPrepareRequest;
    (function(CallHierarchyPrepareRequest2) {
      CallHierarchyPrepareRequest2.method = "textDocument/prepareCallHierarchy";
      CallHierarchyPrepareRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CallHierarchyPrepareRequest2.type = new messages_1.ProtocolRequestType(CallHierarchyPrepareRequest2.method);
    })(CallHierarchyPrepareRequest || (exports2.CallHierarchyPrepareRequest = CallHierarchyPrepareRequest = {}));
    var CallHierarchyIncomingCallsRequest;
    (function(CallHierarchyIncomingCallsRequest2) {
      CallHierarchyIncomingCallsRequest2.method = "callHierarchy/incomingCalls";
      CallHierarchyIncomingCallsRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CallHierarchyIncomingCallsRequest2.type = new messages_1.ProtocolRequestType(CallHierarchyIncomingCallsRequest2.method);
    })(CallHierarchyIncomingCallsRequest || (exports2.CallHierarchyIncomingCallsRequest = CallHierarchyIncomingCallsRequest = {}));
    var CallHierarchyOutgoingCallsRequest;
    (function(CallHierarchyOutgoingCallsRequest2) {
      CallHierarchyOutgoingCallsRequest2.method = "callHierarchy/outgoingCalls";
      CallHierarchyOutgoingCallsRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CallHierarchyOutgoingCallsRequest2.type = new messages_1.ProtocolRequestType(CallHierarchyOutgoingCallsRequest2.method);
    })(CallHierarchyOutgoingCallsRequest || (exports2.CallHierarchyOutgoingCallsRequest = CallHierarchyOutgoingCallsRequest = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.semanticTokens.js
var require_protocol_semanticTokens = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.semanticTokens.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SemanticTokensRefreshRequest = exports2.SemanticTokensRangeRequest = exports2.SemanticTokensDeltaRequest = exports2.SemanticTokensRequest = exports2.SemanticTokensRegistrationType = exports2.TokenFormat = void 0;
    var messages_1 = require_messages2();
    var TokenFormat;
    (function(TokenFormat2) {
      TokenFormat2.Relative = "relative";
    })(TokenFormat || (exports2.TokenFormat = TokenFormat = {}));
    var SemanticTokensRegistrationType;
    (function(SemanticTokensRegistrationType2) {
      SemanticTokensRegistrationType2.method = "textDocument/semanticTokens";
      SemanticTokensRegistrationType2.type = new messages_1.RegistrationType(SemanticTokensRegistrationType2.method);
    })(SemanticTokensRegistrationType || (exports2.SemanticTokensRegistrationType = SemanticTokensRegistrationType = {}));
    var SemanticTokensRequest;
    (function(SemanticTokensRequest2) {
      SemanticTokensRequest2.method = "textDocument/semanticTokens/full";
      SemanticTokensRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SemanticTokensRequest2.type = new messages_1.ProtocolRequestType(SemanticTokensRequest2.method);
      SemanticTokensRequest2.registrationMethod = SemanticTokensRegistrationType.method;
    })(SemanticTokensRequest || (exports2.SemanticTokensRequest = SemanticTokensRequest = {}));
    var SemanticTokensDeltaRequest;
    (function(SemanticTokensDeltaRequest2) {
      SemanticTokensDeltaRequest2.method = "textDocument/semanticTokens/full/delta";
      SemanticTokensDeltaRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SemanticTokensDeltaRequest2.type = new messages_1.ProtocolRequestType(SemanticTokensDeltaRequest2.method);
      SemanticTokensDeltaRequest2.registrationMethod = SemanticTokensRegistrationType.method;
    })(SemanticTokensDeltaRequest || (exports2.SemanticTokensDeltaRequest = SemanticTokensDeltaRequest = {}));
    var SemanticTokensRangeRequest;
    (function(SemanticTokensRangeRequest2) {
      SemanticTokensRangeRequest2.method = "textDocument/semanticTokens/range";
      SemanticTokensRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SemanticTokensRangeRequest2.type = new messages_1.ProtocolRequestType(SemanticTokensRangeRequest2.method);
      SemanticTokensRangeRequest2.registrationMethod = SemanticTokensRegistrationType.method;
    })(SemanticTokensRangeRequest || (exports2.SemanticTokensRangeRequest = SemanticTokensRangeRequest = {}));
    var SemanticTokensRefreshRequest;
    (function(SemanticTokensRefreshRequest2) {
      SemanticTokensRefreshRequest2.method = `workspace/semanticTokens/refresh`;
      SemanticTokensRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      SemanticTokensRefreshRequest2.type = new messages_1.ProtocolRequestType0(SemanticTokensRefreshRequest2.method);
    })(SemanticTokensRefreshRequest || (exports2.SemanticTokensRefreshRequest = SemanticTokensRefreshRequest = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.showDocument.js
var require_protocol_showDocument = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.showDocument.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ShowDocumentRequest = void 0;
    var messages_1 = require_messages2();
    var ShowDocumentRequest;
    (function(ShowDocumentRequest2) {
      ShowDocumentRequest2.method = "window/showDocument";
      ShowDocumentRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      ShowDocumentRequest2.type = new messages_1.ProtocolRequestType(ShowDocumentRequest2.method);
    })(ShowDocumentRequest || (exports2.ShowDocumentRequest = ShowDocumentRequest = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.linkedEditingRange.js
var require_protocol_linkedEditingRange = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.linkedEditingRange.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LinkedEditingRangeRequest = void 0;
    var messages_1 = require_messages2();
    var LinkedEditingRangeRequest;
    (function(LinkedEditingRangeRequest2) {
      LinkedEditingRangeRequest2.method = "textDocument/linkedEditingRange";
      LinkedEditingRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      LinkedEditingRangeRequest2.type = new messages_1.ProtocolRequestType(LinkedEditingRangeRequest2.method);
    })(LinkedEditingRangeRequest || (exports2.LinkedEditingRangeRequest = LinkedEditingRangeRequest = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.fileOperations.js
var require_protocol_fileOperations = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.fileOperations.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WillDeleteFilesRequest = exports2.DidDeleteFilesNotification = exports2.DidRenameFilesNotification = exports2.WillRenameFilesRequest = exports2.DidCreateFilesNotification = exports2.WillCreateFilesRequest = exports2.FileOperationPatternKind = void 0;
    var messages_1 = require_messages2();
    var FileOperationPatternKind;
    (function(FileOperationPatternKind2) {
      FileOperationPatternKind2.file = "file";
      FileOperationPatternKind2.folder = "folder";
    })(FileOperationPatternKind || (exports2.FileOperationPatternKind = FileOperationPatternKind = {}));
    var WillCreateFilesRequest;
    (function(WillCreateFilesRequest2) {
      WillCreateFilesRequest2.method = "workspace/willCreateFiles";
      WillCreateFilesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillCreateFilesRequest2.type = new messages_1.ProtocolRequestType(WillCreateFilesRequest2.method);
    })(WillCreateFilesRequest || (exports2.WillCreateFilesRequest = WillCreateFilesRequest = {}));
    var DidCreateFilesNotification;
    (function(DidCreateFilesNotification2) {
      DidCreateFilesNotification2.method = "workspace/didCreateFiles";
      DidCreateFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidCreateFilesNotification2.type = new messages_1.ProtocolNotificationType(DidCreateFilesNotification2.method);
    })(DidCreateFilesNotification || (exports2.DidCreateFilesNotification = DidCreateFilesNotification = {}));
    var WillRenameFilesRequest;
    (function(WillRenameFilesRequest2) {
      WillRenameFilesRequest2.method = "workspace/willRenameFiles";
      WillRenameFilesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillRenameFilesRequest2.type = new messages_1.ProtocolRequestType(WillRenameFilesRequest2.method);
    })(WillRenameFilesRequest || (exports2.WillRenameFilesRequest = WillRenameFilesRequest = {}));
    var DidRenameFilesNotification;
    (function(DidRenameFilesNotification2) {
      DidRenameFilesNotification2.method = "workspace/didRenameFiles";
      DidRenameFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidRenameFilesNotification2.type = new messages_1.ProtocolNotificationType(DidRenameFilesNotification2.method);
    })(DidRenameFilesNotification || (exports2.DidRenameFilesNotification = DidRenameFilesNotification = {}));
    var DidDeleteFilesNotification;
    (function(DidDeleteFilesNotification2) {
      DidDeleteFilesNotification2.method = "workspace/didDeleteFiles";
      DidDeleteFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidDeleteFilesNotification2.type = new messages_1.ProtocolNotificationType(DidDeleteFilesNotification2.method);
    })(DidDeleteFilesNotification || (exports2.DidDeleteFilesNotification = DidDeleteFilesNotification = {}));
    var WillDeleteFilesRequest;
    (function(WillDeleteFilesRequest2) {
      WillDeleteFilesRequest2.method = "workspace/willDeleteFiles";
      WillDeleteFilesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillDeleteFilesRequest2.type = new messages_1.ProtocolRequestType(WillDeleteFilesRequest2.method);
    })(WillDeleteFilesRequest || (exports2.WillDeleteFilesRequest = WillDeleteFilesRequest = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.moniker.js
var require_protocol_moniker = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.moniker.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MonikerRequest = exports2.MonikerKind = exports2.UniquenessLevel = void 0;
    var messages_1 = require_messages2();
    var UniquenessLevel;
    (function(UniquenessLevel2) {
      UniquenessLevel2.document = "document";
      UniquenessLevel2.project = "project";
      UniquenessLevel2.group = "group";
      UniquenessLevel2.scheme = "scheme";
      UniquenessLevel2.global = "global";
    })(UniquenessLevel || (exports2.UniquenessLevel = UniquenessLevel = {}));
    var MonikerKind;
    (function(MonikerKind2) {
      MonikerKind2.$import = "import";
      MonikerKind2.$export = "export";
      MonikerKind2.local = "local";
    })(MonikerKind || (exports2.MonikerKind = MonikerKind = {}));
    var MonikerRequest;
    (function(MonikerRequest2) {
      MonikerRequest2.method = "textDocument/moniker";
      MonikerRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      MonikerRequest2.type = new messages_1.ProtocolRequestType(MonikerRequest2.method);
    })(MonikerRequest || (exports2.MonikerRequest = MonikerRequest = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.typeHierarchy.js
var require_protocol_typeHierarchy = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.typeHierarchy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TypeHierarchySubtypesRequest = exports2.TypeHierarchySupertypesRequest = exports2.TypeHierarchyPrepareRequest = void 0;
    var messages_1 = require_messages2();
    var TypeHierarchyPrepareRequest;
    (function(TypeHierarchyPrepareRequest2) {
      TypeHierarchyPrepareRequest2.method = "textDocument/prepareTypeHierarchy";
      TypeHierarchyPrepareRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      TypeHierarchyPrepareRequest2.type = new messages_1.ProtocolRequestType(TypeHierarchyPrepareRequest2.method);
    })(TypeHierarchyPrepareRequest || (exports2.TypeHierarchyPrepareRequest = TypeHierarchyPrepareRequest = {}));
    var TypeHierarchySupertypesRequest;
    (function(TypeHierarchySupertypesRequest2) {
      TypeHierarchySupertypesRequest2.method = "typeHierarchy/supertypes";
      TypeHierarchySupertypesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      TypeHierarchySupertypesRequest2.type = new messages_1.ProtocolRequestType(TypeHierarchySupertypesRequest2.method);
    })(TypeHierarchySupertypesRequest || (exports2.TypeHierarchySupertypesRequest = TypeHierarchySupertypesRequest = {}));
    var TypeHierarchySubtypesRequest;
    (function(TypeHierarchySubtypesRequest2) {
      TypeHierarchySubtypesRequest2.method = "typeHierarchy/subtypes";
      TypeHierarchySubtypesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      TypeHierarchySubtypesRequest2.type = new messages_1.ProtocolRequestType(TypeHierarchySubtypesRequest2.method);
    })(TypeHierarchySubtypesRequest || (exports2.TypeHierarchySubtypesRequest = TypeHierarchySubtypesRequest = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.inlineValue.js
var require_protocol_inlineValue = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.inlineValue.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InlineValueRefreshRequest = exports2.InlineValueRequest = void 0;
    var messages_1 = require_messages2();
    var InlineValueRequest;
    (function(InlineValueRequest2) {
      InlineValueRequest2.method = "textDocument/inlineValue";
      InlineValueRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InlineValueRequest2.type = new messages_1.ProtocolRequestType(InlineValueRequest2.method);
    })(InlineValueRequest || (exports2.InlineValueRequest = InlineValueRequest = {}));
    var InlineValueRefreshRequest;
    (function(InlineValueRefreshRequest2) {
      InlineValueRefreshRequest2.method = `workspace/inlineValue/refresh`;
      InlineValueRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      InlineValueRefreshRequest2.type = new messages_1.ProtocolRequestType0(InlineValueRefreshRequest2.method);
    })(InlineValueRefreshRequest || (exports2.InlineValueRefreshRequest = InlineValueRefreshRequest = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.inlayHint.js
var require_protocol_inlayHint = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.inlayHint.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InlayHintRefreshRequest = exports2.InlayHintResolveRequest = exports2.InlayHintRequest = void 0;
    var messages_1 = require_messages2();
    var InlayHintRequest;
    (function(InlayHintRequest2) {
      InlayHintRequest2.method = "textDocument/inlayHint";
      InlayHintRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InlayHintRequest2.type = new messages_1.ProtocolRequestType(InlayHintRequest2.method);
    })(InlayHintRequest || (exports2.InlayHintRequest = InlayHintRequest = {}));
    var InlayHintResolveRequest;
    (function(InlayHintResolveRequest2) {
      InlayHintResolveRequest2.method = "inlayHint/resolve";
      InlayHintResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InlayHintResolveRequest2.type = new messages_1.ProtocolRequestType(InlayHintResolveRequest2.method);
    })(InlayHintResolveRequest || (exports2.InlayHintResolveRequest = InlayHintResolveRequest = {}));
    var InlayHintRefreshRequest;
    (function(InlayHintRefreshRequest2) {
      InlayHintRefreshRequest2.method = `workspace/inlayHint/refresh`;
      InlayHintRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      InlayHintRefreshRequest2.type = new messages_1.ProtocolRequestType0(InlayHintRefreshRequest2.method);
    })(InlayHintRefreshRequest || (exports2.InlayHintRefreshRequest = InlayHintRefreshRequest = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.diagnostic.js
var require_protocol_diagnostic = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.diagnostic.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DiagnosticRefreshRequest = exports2.WorkspaceDiagnosticRequest = exports2.DocumentDiagnosticRequest = exports2.DocumentDiagnosticReportKind = exports2.DiagnosticServerCancellationData = void 0;
    var vscode_jsonrpc_1 = require_main();
    var Is = require_is3();
    var messages_1 = require_messages2();
    var DiagnosticServerCancellationData;
    (function(DiagnosticServerCancellationData2) {
      function is(value) {
        const candidate = value;
        return candidate && Is.boolean(candidate.retriggerRequest);
      }
      DiagnosticServerCancellationData2.is = is;
    })(DiagnosticServerCancellationData || (exports2.DiagnosticServerCancellationData = DiagnosticServerCancellationData = {}));
    var DocumentDiagnosticReportKind;
    (function(DocumentDiagnosticReportKind2) {
      DocumentDiagnosticReportKind2.Full = "full";
      DocumentDiagnosticReportKind2.Unchanged = "unchanged";
    })(DocumentDiagnosticReportKind || (exports2.DocumentDiagnosticReportKind = DocumentDiagnosticReportKind = {}));
    var DocumentDiagnosticRequest;
    (function(DocumentDiagnosticRequest2) {
      DocumentDiagnosticRequest2.method = "textDocument/diagnostic";
      DocumentDiagnosticRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentDiagnosticRequest2.type = new messages_1.ProtocolRequestType(DocumentDiagnosticRequest2.method);
      DocumentDiagnosticRequest2.partialResult = new vscode_jsonrpc_1.ProgressType();
    })(DocumentDiagnosticRequest || (exports2.DocumentDiagnosticRequest = DocumentDiagnosticRequest = {}));
    var WorkspaceDiagnosticRequest;
    (function(WorkspaceDiagnosticRequest2) {
      WorkspaceDiagnosticRequest2.method = "workspace/diagnostic";
      WorkspaceDiagnosticRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WorkspaceDiagnosticRequest2.type = new messages_1.ProtocolRequestType(WorkspaceDiagnosticRequest2.method);
      WorkspaceDiagnosticRequest2.partialResult = new vscode_jsonrpc_1.ProgressType();
    })(WorkspaceDiagnosticRequest || (exports2.WorkspaceDiagnosticRequest = WorkspaceDiagnosticRequest = {}));
    var DiagnosticRefreshRequest;
    (function(DiagnosticRefreshRequest2) {
      DiagnosticRefreshRequest2.method = `workspace/diagnostic/refresh`;
      DiagnosticRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      DiagnosticRefreshRequest2.type = new messages_1.ProtocolRequestType0(DiagnosticRefreshRequest2.method);
    })(DiagnosticRefreshRequest || (exports2.DiagnosticRefreshRequest = DiagnosticRefreshRequest = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.notebook.js
var require_protocol_notebook = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.notebook.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DidCloseNotebookDocumentNotification = exports2.DidSaveNotebookDocumentNotification = exports2.DidChangeNotebookDocumentNotification = exports2.NotebookCellArrayChange = exports2.DidOpenNotebookDocumentNotification = exports2.NotebookDocumentSyncRegistrationType = exports2.NotebookDocument = exports2.NotebookCell = exports2.ExecutionSummary = exports2.NotebookCellKind = void 0;
    var vscode_languageserver_types_1 = require_main2();
    var Is = require_is3();
    var messages_1 = require_messages2();
    var NotebookCellKind;
    (function(NotebookCellKind2) {
      NotebookCellKind2.Markup = 1;
      NotebookCellKind2.Code = 2;
      function is(value) {
        return value === 1 || value === 2;
      }
      NotebookCellKind2.is = is;
    })(NotebookCellKind || (exports2.NotebookCellKind = NotebookCellKind = {}));
    var ExecutionSummary;
    (function(ExecutionSummary2) {
      function create(executionOrder, success) {
        const result = { executionOrder };
        if (success === true || success === false) {
          result.success = success;
        }
        return result;
      }
      ExecutionSummary2.create = create;
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && vscode_languageserver_types_1.uinteger.is(candidate.executionOrder) && (candidate.success === void 0 || Is.boolean(candidate.success));
      }
      ExecutionSummary2.is = is;
      function equals(one, other) {
        if (one === other) {
          return true;
        }
        if (one === null || one === void 0 || other === null || other === void 0) {
          return false;
        }
        return one.executionOrder === other.executionOrder && one.success === other.success;
      }
      ExecutionSummary2.equals = equals;
    })(ExecutionSummary || (exports2.ExecutionSummary = ExecutionSummary = {}));
    var NotebookCell;
    (function(NotebookCell2) {
      function create(kind, document) {
        return { kind, document };
      }
      NotebookCell2.create = create;
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && NotebookCellKind.is(candidate.kind) && vscode_languageserver_types_1.DocumentUri.is(candidate.document) && (candidate.metadata === void 0 || Is.objectLiteral(candidate.metadata));
      }
      NotebookCell2.is = is;
      function diff(one, two) {
        const result = /* @__PURE__ */ new Set();
        if (one.document !== two.document) {
          result.add("document");
        }
        if (one.kind !== two.kind) {
          result.add("kind");
        }
        if (one.executionSummary !== two.executionSummary) {
          result.add("executionSummary");
        }
        if ((one.metadata !== void 0 || two.metadata !== void 0) && !equalsMetadata(one.metadata, two.metadata)) {
          result.add("metadata");
        }
        if ((one.executionSummary !== void 0 || two.executionSummary !== void 0) && !ExecutionSummary.equals(one.executionSummary, two.executionSummary)) {
          result.add("executionSummary");
        }
        return result;
      }
      NotebookCell2.diff = diff;
      function equalsMetadata(one, other) {
        if (one === other) {
          return true;
        }
        if (one === null || one === void 0 || other === null || other === void 0) {
          return false;
        }
        if (typeof one !== typeof other) {
          return false;
        }
        if (typeof one !== "object") {
          return false;
        }
        const oneArray = Array.isArray(one);
        const otherArray = Array.isArray(other);
        if (oneArray !== otherArray) {
          return false;
        }
        if (oneArray && otherArray) {
          if (one.length !== other.length) {
            return false;
          }
          for (let i = 0; i < one.length; i++) {
            if (!equalsMetadata(one[i], other[i])) {
              return false;
            }
          }
        }
        if (Is.objectLiteral(one) && Is.objectLiteral(other)) {
          const oneKeys = Object.keys(one);
          const otherKeys = Object.keys(other);
          if (oneKeys.length !== otherKeys.length) {
            return false;
          }
          oneKeys.sort();
          otherKeys.sort();
          if (!equalsMetadata(oneKeys, otherKeys)) {
            return false;
          }
          for (let i = 0; i < oneKeys.length; i++) {
            const prop = oneKeys[i];
            if (!equalsMetadata(one[prop], other[prop])) {
              return false;
            }
          }
        }
        return true;
      }
    })(NotebookCell || (exports2.NotebookCell = NotebookCell = {}));
    var NotebookDocument;
    (function(NotebookDocument2) {
      function create(uri, notebookType, version, cells) {
        return { uri, notebookType, version, cells };
      }
      NotebookDocument2.create = create;
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && Is.string(candidate.uri) && vscode_languageserver_types_1.integer.is(candidate.version) && Is.typedArray(candidate.cells, NotebookCell.is);
      }
      NotebookDocument2.is = is;
    })(NotebookDocument || (exports2.NotebookDocument = NotebookDocument = {}));
    var NotebookDocumentSyncRegistrationType;
    (function(NotebookDocumentSyncRegistrationType2) {
      NotebookDocumentSyncRegistrationType2.method = "notebookDocument/sync";
      NotebookDocumentSyncRegistrationType2.messageDirection = messages_1.MessageDirection.clientToServer;
      NotebookDocumentSyncRegistrationType2.type = new messages_1.RegistrationType(NotebookDocumentSyncRegistrationType2.method);
    })(NotebookDocumentSyncRegistrationType || (exports2.NotebookDocumentSyncRegistrationType = NotebookDocumentSyncRegistrationType = {}));
    var DidOpenNotebookDocumentNotification;
    (function(DidOpenNotebookDocumentNotification2) {
      DidOpenNotebookDocumentNotification2.method = "notebookDocument/didOpen";
      DidOpenNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidOpenNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidOpenNotebookDocumentNotification2.method);
      DidOpenNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
    })(DidOpenNotebookDocumentNotification || (exports2.DidOpenNotebookDocumentNotification = DidOpenNotebookDocumentNotification = {}));
    var NotebookCellArrayChange;
    (function(NotebookCellArrayChange2) {
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && vscode_languageserver_types_1.uinteger.is(candidate.start) && vscode_languageserver_types_1.uinteger.is(candidate.deleteCount) && (candidate.cells === void 0 || Is.typedArray(candidate.cells, NotebookCell.is));
      }
      NotebookCellArrayChange2.is = is;
      function create(start, deleteCount, cells) {
        const result = { start, deleteCount };
        if (cells !== void 0) {
          result.cells = cells;
        }
        return result;
      }
      NotebookCellArrayChange2.create = create;
    })(NotebookCellArrayChange || (exports2.NotebookCellArrayChange = NotebookCellArrayChange = {}));
    var DidChangeNotebookDocumentNotification;
    (function(DidChangeNotebookDocumentNotification2) {
      DidChangeNotebookDocumentNotification2.method = "notebookDocument/didChange";
      DidChangeNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidChangeNotebookDocumentNotification2.method);
      DidChangeNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
    })(DidChangeNotebookDocumentNotification || (exports2.DidChangeNotebookDocumentNotification = DidChangeNotebookDocumentNotification = {}));
    var DidSaveNotebookDocumentNotification;
    (function(DidSaveNotebookDocumentNotification2) {
      DidSaveNotebookDocumentNotification2.method = "notebookDocument/didSave";
      DidSaveNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidSaveNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidSaveNotebookDocumentNotification2.method);
      DidSaveNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
    })(DidSaveNotebookDocumentNotification || (exports2.DidSaveNotebookDocumentNotification = DidSaveNotebookDocumentNotification = {}));
    var DidCloseNotebookDocumentNotification;
    (function(DidCloseNotebookDocumentNotification2) {
      DidCloseNotebookDocumentNotification2.method = "notebookDocument/didClose";
      DidCloseNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidCloseNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidCloseNotebookDocumentNotification2.method);
      DidCloseNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
    })(DidCloseNotebookDocumentNotification || (exports2.DidCloseNotebookDocumentNotification = DidCloseNotebookDocumentNotification = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.inlineCompletion.js
var require_protocol_inlineCompletion = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.inlineCompletion.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InlineCompletionRequest = void 0;
    var messages_1 = require_messages2();
    var InlineCompletionRequest;
    (function(InlineCompletionRequest2) {
      InlineCompletionRequest2.method = "textDocument/inlineCompletion";
      InlineCompletionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InlineCompletionRequest2.type = new messages_1.ProtocolRequestType(InlineCompletionRequest2.method);
    })(InlineCompletionRequest || (exports2.InlineCompletionRequest = InlineCompletionRequest = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/protocol.js
var require_protocol = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/protocol.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WorkspaceSymbolRequest = exports2.CodeActionResolveRequest = exports2.CodeActionRequest = exports2.DocumentSymbolRequest = exports2.DocumentHighlightRequest = exports2.ReferencesRequest = exports2.DefinitionRequest = exports2.SignatureHelpRequest = exports2.SignatureHelpTriggerKind = exports2.HoverRequest = exports2.CompletionResolveRequest = exports2.CompletionRequest = exports2.CompletionTriggerKind = exports2.PublishDiagnosticsNotification = exports2.WatchKind = exports2.RelativePattern = exports2.FileChangeType = exports2.DidChangeWatchedFilesNotification = exports2.WillSaveTextDocumentWaitUntilRequest = exports2.WillSaveTextDocumentNotification = exports2.TextDocumentSaveReason = exports2.DidSaveTextDocumentNotification = exports2.DidCloseTextDocumentNotification = exports2.DidChangeTextDocumentNotification = exports2.TextDocumentContentChangeEvent = exports2.DidOpenTextDocumentNotification = exports2.TextDocumentSyncKind = exports2.TelemetryEventNotification = exports2.LogMessageNotification = exports2.ShowMessageRequest = exports2.ShowMessageNotification = exports2.MessageType = exports2.DidChangeConfigurationNotification = exports2.ExitNotification = exports2.ShutdownRequest = exports2.InitializedNotification = exports2.InitializeErrorCodes = exports2.InitializeRequest = exports2.WorkDoneProgressOptions = exports2.TextDocumentRegistrationOptions = exports2.StaticRegistrationOptions = exports2.PositionEncodingKind = exports2.FailureHandlingKind = exports2.ResourceOperationKind = exports2.UnregistrationRequest = exports2.RegistrationRequest = exports2.DocumentSelector = exports2.NotebookCellTextDocumentFilter = exports2.NotebookDocumentFilter = exports2.TextDocumentFilter = void 0;
    exports2.MonikerRequest = exports2.MonikerKind = exports2.UniquenessLevel = exports2.WillDeleteFilesRequest = exports2.DidDeleteFilesNotification = exports2.WillRenameFilesRequest = exports2.DidRenameFilesNotification = exports2.WillCreateFilesRequest = exports2.DidCreateFilesNotification = exports2.FileOperationPatternKind = exports2.LinkedEditingRangeRequest = exports2.ShowDocumentRequest = exports2.SemanticTokensRegistrationType = exports2.SemanticTokensRefreshRequest = exports2.SemanticTokensRangeRequest = exports2.SemanticTokensDeltaRequest = exports2.SemanticTokensRequest = exports2.TokenFormat = exports2.CallHierarchyPrepareRequest = exports2.CallHierarchyOutgoingCallsRequest = exports2.CallHierarchyIncomingCallsRequest = exports2.WorkDoneProgressCancelNotification = exports2.WorkDoneProgressCreateRequest = exports2.WorkDoneProgress = exports2.SelectionRangeRequest = exports2.DeclarationRequest = exports2.FoldingRangeRefreshRequest = exports2.FoldingRangeRequest = exports2.ColorPresentationRequest = exports2.DocumentColorRequest = exports2.ConfigurationRequest = exports2.DidChangeWorkspaceFoldersNotification = exports2.WorkspaceFoldersRequest = exports2.TypeDefinitionRequest = exports2.ImplementationRequest = exports2.ApplyWorkspaceEditRequest = exports2.ExecuteCommandRequest = exports2.PrepareRenameRequest = exports2.RenameRequest = exports2.PrepareSupportDefaultBehavior = exports2.DocumentOnTypeFormattingRequest = exports2.DocumentRangesFormattingRequest = exports2.DocumentRangeFormattingRequest = exports2.DocumentFormattingRequest = exports2.DocumentLinkResolveRequest = exports2.DocumentLinkRequest = exports2.CodeLensRefreshRequest = exports2.CodeLensResolveRequest = exports2.CodeLensRequest = exports2.WorkspaceSymbolResolveRequest = void 0;
    exports2.InlineCompletionRequest = exports2.DidCloseNotebookDocumentNotification = exports2.DidSaveNotebookDocumentNotification = exports2.DidChangeNotebookDocumentNotification = exports2.NotebookCellArrayChange = exports2.DidOpenNotebookDocumentNotification = exports2.NotebookDocumentSyncRegistrationType = exports2.NotebookDocument = exports2.NotebookCell = exports2.ExecutionSummary = exports2.NotebookCellKind = exports2.DiagnosticRefreshRequest = exports2.WorkspaceDiagnosticRequest = exports2.DocumentDiagnosticRequest = exports2.DocumentDiagnosticReportKind = exports2.DiagnosticServerCancellationData = exports2.InlayHintRefreshRequest = exports2.InlayHintResolveRequest = exports2.InlayHintRequest = exports2.InlineValueRefreshRequest = exports2.InlineValueRequest = exports2.TypeHierarchySupertypesRequest = exports2.TypeHierarchySubtypesRequest = exports2.TypeHierarchyPrepareRequest = void 0;
    var messages_1 = require_messages2();
    var vscode_languageserver_types_1 = require_main2();
    var Is = require_is3();
    var protocol_implementation_1 = require_protocol_implementation();
    Object.defineProperty(exports2, "ImplementationRequest", { enumerable: true, get: function() {
      return protocol_implementation_1.ImplementationRequest;
    } });
    var protocol_typeDefinition_1 = require_protocol_typeDefinition();
    Object.defineProperty(exports2, "TypeDefinitionRequest", { enumerable: true, get: function() {
      return protocol_typeDefinition_1.TypeDefinitionRequest;
    } });
    var protocol_workspaceFolder_1 = require_protocol_workspaceFolder();
    Object.defineProperty(exports2, "WorkspaceFoldersRequest", { enumerable: true, get: function() {
      return protocol_workspaceFolder_1.WorkspaceFoldersRequest;
    } });
    Object.defineProperty(exports2, "DidChangeWorkspaceFoldersNotification", { enumerable: true, get: function() {
      return protocol_workspaceFolder_1.DidChangeWorkspaceFoldersNotification;
    } });
    var protocol_configuration_1 = require_protocol_configuration();
    Object.defineProperty(exports2, "ConfigurationRequest", { enumerable: true, get: function() {
      return protocol_configuration_1.ConfigurationRequest;
    } });
    var protocol_colorProvider_1 = require_protocol_colorProvider();
    Object.defineProperty(exports2, "DocumentColorRequest", { enumerable: true, get: function() {
      return protocol_colorProvider_1.DocumentColorRequest;
    } });
    Object.defineProperty(exports2, "ColorPresentationRequest", { enumerable: true, get: function() {
      return protocol_colorProvider_1.ColorPresentationRequest;
    } });
    var protocol_foldingRange_1 = require_protocol_foldingRange();
    Object.defineProperty(exports2, "FoldingRangeRequest", { enumerable: true, get: function() {
      return protocol_foldingRange_1.FoldingRangeRequest;
    } });
    Object.defineProperty(exports2, "FoldingRangeRefreshRequest", { enumerable: true, get: function() {
      return protocol_foldingRange_1.FoldingRangeRefreshRequest;
    } });
    var protocol_declaration_1 = require_protocol_declaration();
    Object.defineProperty(exports2, "DeclarationRequest", { enumerable: true, get: function() {
      return protocol_declaration_1.DeclarationRequest;
    } });
    var protocol_selectionRange_1 = require_protocol_selectionRange();
    Object.defineProperty(exports2, "SelectionRangeRequest", { enumerable: true, get: function() {
      return protocol_selectionRange_1.SelectionRangeRequest;
    } });
    var protocol_progress_1 = require_protocol_progress();
    Object.defineProperty(exports2, "WorkDoneProgress", { enumerable: true, get: function() {
      return protocol_progress_1.WorkDoneProgress;
    } });
    Object.defineProperty(exports2, "WorkDoneProgressCreateRequest", { enumerable: true, get: function() {
      return protocol_progress_1.WorkDoneProgressCreateRequest;
    } });
    Object.defineProperty(exports2, "WorkDoneProgressCancelNotification", { enumerable: true, get: function() {
      return protocol_progress_1.WorkDoneProgressCancelNotification;
    } });
    var protocol_callHierarchy_1 = require_protocol_callHierarchy();
    Object.defineProperty(exports2, "CallHierarchyIncomingCallsRequest", { enumerable: true, get: function() {
      return protocol_callHierarchy_1.CallHierarchyIncomingCallsRequest;
    } });
    Object.defineProperty(exports2, "CallHierarchyOutgoingCallsRequest", { enumerable: true, get: function() {
      return protocol_callHierarchy_1.CallHierarchyOutgoingCallsRequest;
    } });
    Object.defineProperty(exports2, "CallHierarchyPrepareRequest", { enumerable: true, get: function() {
      return protocol_callHierarchy_1.CallHierarchyPrepareRequest;
    } });
    var protocol_semanticTokens_1 = require_protocol_semanticTokens();
    Object.defineProperty(exports2, "TokenFormat", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.TokenFormat;
    } });
    Object.defineProperty(exports2, "SemanticTokensRequest", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensRequest;
    } });
    Object.defineProperty(exports2, "SemanticTokensDeltaRequest", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensDeltaRequest;
    } });
    Object.defineProperty(exports2, "SemanticTokensRangeRequest", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensRangeRequest;
    } });
    Object.defineProperty(exports2, "SemanticTokensRefreshRequest", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensRefreshRequest;
    } });
    Object.defineProperty(exports2, "SemanticTokensRegistrationType", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensRegistrationType;
    } });
    var protocol_showDocument_1 = require_protocol_showDocument();
    Object.defineProperty(exports2, "ShowDocumentRequest", { enumerable: true, get: function() {
      return protocol_showDocument_1.ShowDocumentRequest;
    } });
    var protocol_linkedEditingRange_1 = require_protocol_linkedEditingRange();
    Object.defineProperty(exports2, "LinkedEditingRangeRequest", { enumerable: true, get: function() {
      return protocol_linkedEditingRange_1.LinkedEditingRangeRequest;
    } });
    var protocol_fileOperations_1 = require_protocol_fileOperations();
    Object.defineProperty(exports2, "FileOperationPatternKind", { enumerable: true, get: function() {
      return protocol_fileOperations_1.FileOperationPatternKind;
    } });
    Object.defineProperty(exports2, "DidCreateFilesNotification", { enumerable: true, get: function() {
      return protocol_fileOperations_1.DidCreateFilesNotification;
    } });
    Object.defineProperty(exports2, "WillCreateFilesRequest", { enumerable: true, get: function() {
      return protocol_fileOperations_1.WillCreateFilesRequest;
    } });
    Object.defineProperty(exports2, "DidRenameFilesNotification", { enumerable: true, get: function() {
      return protocol_fileOperations_1.DidRenameFilesNotification;
    } });
    Object.defineProperty(exports2, "WillRenameFilesRequest", { enumerable: true, get: function() {
      return protocol_fileOperations_1.WillRenameFilesRequest;
    } });
    Object.defineProperty(exports2, "DidDeleteFilesNotification", { enumerable: true, get: function() {
      return protocol_fileOperations_1.DidDeleteFilesNotification;
    } });
    Object.defineProperty(exports2, "WillDeleteFilesRequest", { enumerable: true, get: function() {
      return protocol_fileOperations_1.WillDeleteFilesRequest;
    } });
    var protocol_moniker_1 = require_protocol_moniker();
    Object.defineProperty(exports2, "UniquenessLevel", { enumerable: true, get: function() {
      return protocol_moniker_1.UniquenessLevel;
    } });
    Object.defineProperty(exports2, "MonikerKind", { enumerable: true, get: function() {
      return protocol_moniker_1.MonikerKind;
    } });
    Object.defineProperty(exports2, "MonikerRequest", { enumerable: true, get: function() {
      return protocol_moniker_1.MonikerRequest;
    } });
    var protocol_typeHierarchy_1 = require_protocol_typeHierarchy();
    Object.defineProperty(exports2, "TypeHierarchyPrepareRequest", { enumerable: true, get: function() {
      return protocol_typeHierarchy_1.TypeHierarchyPrepareRequest;
    } });
    Object.defineProperty(exports2, "TypeHierarchySubtypesRequest", { enumerable: true, get: function() {
      return protocol_typeHierarchy_1.TypeHierarchySubtypesRequest;
    } });
    Object.defineProperty(exports2, "TypeHierarchySupertypesRequest", { enumerable: true, get: function() {
      return protocol_typeHierarchy_1.TypeHierarchySupertypesRequest;
    } });
    var protocol_inlineValue_1 = require_protocol_inlineValue();
    Object.defineProperty(exports2, "InlineValueRequest", { enumerable: true, get: function() {
      return protocol_inlineValue_1.InlineValueRequest;
    } });
    Object.defineProperty(exports2, "InlineValueRefreshRequest", { enumerable: true, get: function() {
      return protocol_inlineValue_1.InlineValueRefreshRequest;
    } });
    var protocol_inlayHint_1 = require_protocol_inlayHint();
    Object.defineProperty(exports2, "InlayHintRequest", { enumerable: true, get: function() {
      return protocol_inlayHint_1.InlayHintRequest;
    } });
    Object.defineProperty(exports2, "InlayHintResolveRequest", { enumerable: true, get: function() {
      return protocol_inlayHint_1.InlayHintResolveRequest;
    } });
    Object.defineProperty(exports2, "InlayHintRefreshRequest", { enumerable: true, get: function() {
      return protocol_inlayHint_1.InlayHintRefreshRequest;
    } });
    var protocol_diagnostic_1 = require_protocol_diagnostic();
    Object.defineProperty(exports2, "DiagnosticServerCancellationData", { enumerable: true, get: function() {
      return protocol_diagnostic_1.DiagnosticServerCancellationData;
    } });
    Object.defineProperty(exports2, "DocumentDiagnosticReportKind", { enumerable: true, get: function() {
      return protocol_diagnostic_1.DocumentDiagnosticReportKind;
    } });
    Object.defineProperty(exports2, "DocumentDiagnosticRequest", { enumerable: true, get: function() {
      return protocol_diagnostic_1.DocumentDiagnosticRequest;
    } });
    Object.defineProperty(exports2, "WorkspaceDiagnosticRequest", { enumerable: true, get: function() {
      return protocol_diagnostic_1.WorkspaceDiagnosticRequest;
    } });
    Object.defineProperty(exports2, "DiagnosticRefreshRequest", { enumerable: true, get: function() {
      return protocol_diagnostic_1.DiagnosticRefreshRequest;
    } });
    var protocol_notebook_1 = require_protocol_notebook();
    Object.defineProperty(exports2, "NotebookCellKind", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookCellKind;
    } });
    Object.defineProperty(exports2, "ExecutionSummary", { enumerable: true, get: function() {
      return protocol_notebook_1.ExecutionSummary;
    } });
    Object.defineProperty(exports2, "NotebookCell", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookCell;
    } });
    Object.defineProperty(exports2, "NotebookDocument", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookDocument;
    } });
    Object.defineProperty(exports2, "NotebookDocumentSyncRegistrationType", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookDocumentSyncRegistrationType;
    } });
    Object.defineProperty(exports2, "DidOpenNotebookDocumentNotification", { enumerable: true, get: function() {
      return protocol_notebook_1.DidOpenNotebookDocumentNotification;
    } });
    Object.defineProperty(exports2, "NotebookCellArrayChange", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookCellArrayChange;
    } });
    Object.defineProperty(exports2, "DidChangeNotebookDocumentNotification", { enumerable: true, get: function() {
      return protocol_notebook_1.DidChangeNotebookDocumentNotification;
    } });
    Object.defineProperty(exports2, "DidSaveNotebookDocumentNotification", { enumerable: true, get: function() {
      return protocol_notebook_1.DidSaveNotebookDocumentNotification;
    } });
    Object.defineProperty(exports2, "DidCloseNotebookDocumentNotification", { enumerable: true, get: function() {
      return protocol_notebook_1.DidCloseNotebookDocumentNotification;
    } });
    var protocol_inlineCompletion_1 = require_protocol_inlineCompletion();
    Object.defineProperty(exports2, "InlineCompletionRequest", { enumerable: true, get: function() {
      return protocol_inlineCompletion_1.InlineCompletionRequest;
    } });
    var TextDocumentFilter;
    (function(TextDocumentFilter2) {
      function is(value) {
        const candidate = value;
        return Is.string(candidate) || (Is.string(candidate.language) || Is.string(candidate.scheme) || Is.string(candidate.pattern));
      }
      TextDocumentFilter2.is = is;
    })(TextDocumentFilter || (exports2.TextDocumentFilter = TextDocumentFilter = {}));
    var NotebookDocumentFilter;
    (function(NotebookDocumentFilter2) {
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && (Is.string(candidate.notebookType) || Is.string(candidate.scheme) || Is.string(candidate.pattern));
      }
      NotebookDocumentFilter2.is = is;
    })(NotebookDocumentFilter || (exports2.NotebookDocumentFilter = NotebookDocumentFilter = {}));
    var NotebookCellTextDocumentFilter;
    (function(NotebookCellTextDocumentFilter2) {
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && (Is.string(candidate.notebook) || NotebookDocumentFilter.is(candidate.notebook)) && (candidate.language === void 0 || Is.string(candidate.language));
      }
      NotebookCellTextDocumentFilter2.is = is;
    })(NotebookCellTextDocumentFilter || (exports2.NotebookCellTextDocumentFilter = NotebookCellTextDocumentFilter = {}));
    var DocumentSelector;
    (function(DocumentSelector2) {
      function is(value) {
        if (!Array.isArray(value)) {
          return false;
        }
        for (let elem of value) {
          if (!Is.string(elem) && !TextDocumentFilter.is(elem) && !NotebookCellTextDocumentFilter.is(elem)) {
            return false;
          }
        }
        return true;
      }
      DocumentSelector2.is = is;
    })(DocumentSelector || (exports2.DocumentSelector = DocumentSelector = {}));
    var RegistrationRequest;
    (function(RegistrationRequest2) {
      RegistrationRequest2.method = "client/registerCapability";
      RegistrationRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      RegistrationRequest2.type = new messages_1.ProtocolRequestType(RegistrationRequest2.method);
    })(RegistrationRequest || (exports2.RegistrationRequest = RegistrationRequest = {}));
    var UnregistrationRequest;
    (function(UnregistrationRequest2) {
      UnregistrationRequest2.method = "client/unregisterCapability";
      UnregistrationRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      UnregistrationRequest2.type = new messages_1.ProtocolRequestType(UnregistrationRequest2.method);
    })(UnregistrationRequest || (exports2.UnregistrationRequest = UnregistrationRequest = {}));
    var ResourceOperationKind;
    (function(ResourceOperationKind2) {
      ResourceOperationKind2.Create = "create";
      ResourceOperationKind2.Rename = "rename";
      ResourceOperationKind2.Delete = "delete";
    })(ResourceOperationKind || (exports2.ResourceOperationKind = ResourceOperationKind = {}));
    var FailureHandlingKind;
    (function(FailureHandlingKind2) {
      FailureHandlingKind2.Abort = "abort";
      FailureHandlingKind2.Transactional = "transactional";
      FailureHandlingKind2.TextOnlyTransactional = "textOnlyTransactional";
      FailureHandlingKind2.Undo = "undo";
    })(FailureHandlingKind || (exports2.FailureHandlingKind = FailureHandlingKind = {}));
    var PositionEncodingKind;
    (function(PositionEncodingKind2) {
      PositionEncodingKind2.UTF8 = "utf-8";
      PositionEncodingKind2.UTF16 = "utf-16";
      PositionEncodingKind2.UTF32 = "utf-32";
    })(PositionEncodingKind || (exports2.PositionEncodingKind = PositionEncodingKind = {}));
    var StaticRegistrationOptions;
    (function(StaticRegistrationOptions2) {
      function hasId(value) {
        const candidate = value;
        return candidate && Is.string(candidate.id) && candidate.id.length > 0;
      }
      StaticRegistrationOptions2.hasId = hasId;
    })(StaticRegistrationOptions || (exports2.StaticRegistrationOptions = StaticRegistrationOptions = {}));
    var TextDocumentRegistrationOptions;
    (function(TextDocumentRegistrationOptions2) {
      function is(value) {
        const candidate = value;
        return candidate && (candidate.documentSelector === null || DocumentSelector.is(candidate.documentSelector));
      }
      TextDocumentRegistrationOptions2.is = is;
    })(TextDocumentRegistrationOptions || (exports2.TextDocumentRegistrationOptions = TextDocumentRegistrationOptions = {}));
    var WorkDoneProgressOptions;
    (function(WorkDoneProgressOptions2) {
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && (candidate.workDoneProgress === void 0 || Is.boolean(candidate.workDoneProgress));
      }
      WorkDoneProgressOptions2.is = is;
      function hasWorkDoneProgress(value) {
        const candidate = value;
        return candidate && Is.boolean(candidate.workDoneProgress);
      }
      WorkDoneProgressOptions2.hasWorkDoneProgress = hasWorkDoneProgress;
    })(WorkDoneProgressOptions || (exports2.WorkDoneProgressOptions = WorkDoneProgressOptions = {}));
    var InitializeRequest;
    (function(InitializeRequest2) {
      InitializeRequest2.method = "initialize";
      InitializeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InitializeRequest2.type = new messages_1.ProtocolRequestType(InitializeRequest2.method);
    })(InitializeRequest || (exports2.InitializeRequest = InitializeRequest = {}));
    var InitializeErrorCodes;
    (function(InitializeErrorCodes2) {
      InitializeErrorCodes2.unknownProtocolVersion = 1;
    })(InitializeErrorCodes || (exports2.InitializeErrorCodes = InitializeErrorCodes = {}));
    var InitializedNotification;
    (function(InitializedNotification2) {
      InitializedNotification2.method = "initialized";
      InitializedNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      InitializedNotification2.type = new messages_1.ProtocolNotificationType(InitializedNotification2.method);
    })(InitializedNotification || (exports2.InitializedNotification = InitializedNotification = {}));
    var ShutdownRequest;
    (function(ShutdownRequest2) {
      ShutdownRequest2.method = "shutdown";
      ShutdownRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ShutdownRequest2.type = new messages_1.ProtocolRequestType0(ShutdownRequest2.method);
    })(ShutdownRequest || (exports2.ShutdownRequest = ShutdownRequest = {}));
    var ExitNotification;
    (function(ExitNotification2) {
      ExitNotification2.method = "exit";
      ExitNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      ExitNotification2.type = new messages_1.ProtocolNotificationType0(ExitNotification2.method);
    })(ExitNotification || (exports2.ExitNotification = ExitNotification = {}));
    var DidChangeConfigurationNotification;
    (function(DidChangeConfigurationNotification2) {
      DidChangeConfigurationNotification2.method = "workspace/didChangeConfiguration";
      DidChangeConfigurationNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeConfigurationNotification2.type = new messages_1.ProtocolNotificationType(DidChangeConfigurationNotification2.method);
    })(DidChangeConfigurationNotification || (exports2.DidChangeConfigurationNotification = DidChangeConfigurationNotification = {}));
    var MessageType;
    (function(MessageType2) {
      MessageType2.Error = 1;
      MessageType2.Warning = 2;
      MessageType2.Info = 3;
      MessageType2.Log = 4;
      MessageType2.Debug = 5;
    })(MessageType || (exports2.MessageType = MessageType = {}));
    var ShowMessageNotification;
    (function(ShowMessageNotification2) {
      ShowMessageNotification2.method = "window/showMessage";
      ShowMessageNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
      ShowMessageNotification2.type = new messages_1.ProtocolNotificationType(ShowMessageNotification2.method);
    })(ShowMessageNotification || (exports2.ShowMessageNotification = ShowMessageNotification = {}));
    var ShowMessageRequest;
    (function(ShowMessageRequest2) {
      ShowMessageRequest2.method = "window/showMessageRequest";
      ShowMessageRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      ShowMessageRequest2.type = new messages_1.ProtocolRequestType(ShowMessageRequest2.method);
    })(ShowMessageRequest || (exports2.ShowMessageRequest = ShowMessageRequest = {}));
    var LogMessageNotification;
    (function(LogMessageNotification2) {
      LogMessageNotification2.method = "window/logMessage";
      LogMessageNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
      LogMessageNotification2.type = new messages_1.ProtocolNotificationType(LogMessageNotification2.method);
    })(LogMessageNotification || (exports2.LogMessageNotification = LogMessageNotification = {}));
    var TelemetryEventNotification;
    (function(TelemetryEventNotification2) {
      TelemetryEventNotification2.method = "telemetry/event";
      TelemetryEventNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
      TelemetryEventNotification2.type = new messages_1.ProtocolNotificationType(TelemetryEventNotification2.method);
    })(TelemetryEventNotification || (exports2.TelemetryEventNotification = TelemetryEventNotification = {}));
    var TextDocumentSyncKind2;
    (function(TextDocumentSyncKind3) {
      TextDocumentSyncKind3.None = 0;
      TextDocumentSyncKind3.Full = 1;
      TextDocumentSyncKind3.Incremental = 2;
    })(TextDocumentSyncKind2 || (exports2.TextDocumentSyncKind = TextDocumentSyncKind2 = {}));
    var DidOpenTextDocumentNotification;
    (function(DidOpenTextDocumentNotification2) {
      DidOpenTextDocumentNotification2.method = "textDocument/didOpen";
      DidOpenTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidOpenTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidOpenTextDocumentNotification2.method);
    })(DidOpenTextDocumentNotification || (exports2.DidOpenTextDocumentNotification = DidOpenTextDocumentNotification = {}));
    var TextDocumentContentChangeEvent;
    (function(TextDocumentContentChangeEvent2) {
      function isIncremental(event) {
        let candidate = event;
        return candidate !== void 0 && candidate !== null && typeof candidate.text === "string" && candidate.range !== void 0 && (candidate.rangeLength === void 0 || typeof candidate.rangeLength === "number");
      }
      TextDocumentContentChangeEvent2.isIncremental = isIncremental;
      function isFull(event) {
        let candidate = event;
        return candidate !== void 0 && candidate !== null && typeof candidate.text === "string" && candidate.range === void 0 && candidate.rangeLength === void 0;
      }
      TextDocumentContentChangeEvent2.isFull = isFull;
    })(TextDocumentContentChangeEvent || (exports2.TextDocumentContentChangeEvent = TextDocumentContentChangeEvent = {}));
    var DidChangeTextDocumentNotification;
    (function(DidChangeTextDocumentNotification2) {
      DidChangeTextDocumentNotification2.method = "textDocument/didChange";
      DidChangeTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidChangeTextDocumentNotification2.method);
    })(DidChangeTextDocumentNotification || (exports2.DidChangeTextDocumentNotification = DidChangeTextDocumentNotification = {}));
    var DidCloseTextDocumentNotification;
    (function(DidCloseTextDocumentNotification2) {
      DidCloseTextDocumentNotification2.method = "textDocument/didClose";
      DidCloseTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidCloseTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidCloseTextDocumentNotification2.method);
    })(DidCloseTextDocumentNotification || (exports2.DidCloseTextDocumentNotification = DidCloseTextDocumentNotification = {}));
    var DidSaveTextDocumentNotification;
    (function(DidSaveTextDocumentNotification2) {
      DidSaveTextDocumentNotification2.method = "textDocument/didSave";
      DidSaveTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidSaveTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidSaveTextDocumentNotification2.method);
    })(DidSaveTextDocumentNotification || (exports2.DidSaveTextDocumentNotification = DidSaveTextDocumentNotification = {}));
    var TextDocumentSaveReason;
    (function(TextDocumentSaveReason2) {
      TextDocumentSaveReason2.Manual = 1;
      TextDocumentSaveReason2.AfterDelay = 2;
      TextDocumentSaveReason2.FocusOut = 3;
    })(TextDocumentSaveReason || (exports2.TextDocumentSaveReason = TextDocumentSaveReason = {}));
    var WillSaveTextDocumentNotification;
    (function(WillSaveTextDocumentNotification2) {
      WillSaveTextDocumentNotification2.method = "textDocument/willSave";
      WillSaveTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillSaveTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(WillSaveTextDocumentNotification2.method);
    })(WillSaveTextDocumentNotification || (exports2.WillSaveTextDocumentNotification = WillSaveTextDocumentNotification = {}));
    var WillSaveTextDocumentWaitUntilRequest;
    (function(WillSaveTextDocumentWaitUntilRequest2) {
      WillSaveTextDocumentWaitUntilRequest2.method = "textDocument/willSaveWaitUntil";
      WillSaveTextDocumentWaitUntilRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillSaveTextDocumentWaitUntilRequest2.type = new messages_1.ProtocolRequestType(WillSaveTextDocumentWaitUntilRequest2.method);
    })(WillSaveTextDocumentWaitUntilRequest || (exports2.WillSaveTextDocumentWaitUntilRequest = WillSaveTextDocumentWaitUntilRequest = {}));
    var DidChangeWatchedFilesNotification;
    (function(DidChangeWatchedFilesNotification2) {
      DidChangeWatchedFilesNotification2.method = "workspace/didChangeWatchedFiles";
      DidChangeWatchedFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeWatchedFilesNotification2.type = new messages_1.ProtocolNotificationType(DidChangeWatchedFilesNotification2.method);
    })(DidChangeWatchedFilesNotification || (exports2.DidChangeWatchedFilesNotification = DidChangeWatchedFilesNotification = {}));
    var FileChangeType;
    (function(FileChangeType2) {
      FileChangeType2.Created = 1;
      FileChangeType2.Changed = 2;
      FileChangeType2.Deleted = 3;
    })(FileChangeType || (exports2.FileChangeType = FileChangeType = {}));
    var RelativePattern;
    (function(RelativePattern2) {
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && (vscode_languageserver_types_1.URI.is(candidate.baseUri) || vscode_languageserver_types_1.WorkspaceFolder.is(candidate.baseUri)) && Is.string(candidate.pattern);
      }
      RelativePattern2.is = is;
    })(RelativePattern || (exports2.RelativePattern = RelativePattern = {}));
    var WatchKind;
    (function(WatchKind2) {
      WatchKind2.Create = 1;
      WatchKind2.Change = 2;
      WatchKind2.Delete = 4;
    })(WatchKind || (exports2.WatchKind = WatchKind = {}));
    var PublishDiagnosticsNotification;
    (function(PublishDiagnosticsNotification2) {
      PublishDiagnosticsNotification2.method = "textDocument/publishDiagnostics";
      PublishDiagnosticsNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
      PublishDiagnosticsNotification2.type = new messages_1.ProtocolNotificationType(PublishDiagnosticsNotification2.method);
    })(PublishDiagnosticsNotification || (exports2.PublishDiagnosticsNotification = PublishDiagnosticsNotification = {}));
    var CompletionTriggerKind;
    (function(CompletionTriggerKind2) {
      CompletionTriggerKind2.Invoked = 1;
      CompletionTriggerKind2.TriggerCharacter = 2;
      CompletionTriggerKind2.TriggerForIncompleteCompletions = 3;
    })(CompletionTriggerKind || (exports2.CompletionTriggerKind = CompletionTriggerKind = {}));
    var CompletionRequest;
    (function(CompletionRequest2) {
      CompletionRequest2.method = "textDocument/completion";
      CompletionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CompletionRequest2.type = new messages_1.ProtocolRequestType(CompletionRequest2.method);
    })(CompletionRequest || (exports2.CompletionRequest = CompletionRequest = {}));
    var CompletionResolveRequest;
    (function(CompletionResolveRequest2) {
      CompletionResolveRequest2.method = "completionItem/resolve";
      CompletionResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CompletionResolveRequest2.type = new messages_1.ProtocolRequestType(CompletionResolveRequest2.method);
    })(CompletionResolveRequest || (exports2.CompletionResolveRequest = CompletionResolveRequest = {}));
    var HoverRequest;
    (function(HoverRequest2) {
      HoverRequest2.method = "textDocument/hover";
      HoverRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      HoverRequest2.type = new messages_1.ProtocolRequestType(HoverRequest2.method);
    })(HoverRequest || (exports2.HoverRequest = HoverRequest = {}));
    var SignatureHelpTriggerKind;
    (function(SignatureHelpTriggerKind2) {
      SignatureHelpTriggerKind2.Invoked = 1;
      SignatureHelpTriggerKind2.TriggerCharacter = 2;
      SignatureHelpTriggerKind2.ContentChange = 3;
    })(SignatureHelpTriggerKind || (exports2.SignatureHelpTriggerKind = SignatureHelpTriggerKind = {}));
    var SignatureHelpRequest;
    (function(SignatureHelpRequest2) {
      SignatureHelpRequest2.method = "textDocument/signatureHelp";
      SignatureHelpRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SignatureHelpRequest2.type = new messages_1.ProtocolRequestType(SignatureHelpRequest2.method);
    })(SignatureHelpRequest || (exports2.SignatureHelpRequest = SignatureHelpRequest = {}));
    var DefinitionRequest;
    (function(DefinitionRequest2) {
      DefinitionRequest2.method = "textDocument/definition";
      DefinitionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DefinitionRequest2.type = new messages_1.ProtocolRequestType(DefinitionRequest2.method);
    })(DefinitionRequest || (exports2.DefinitionRequest = DefinitionRequest = {}));
    var ReferencesRequest;
    (function(ReferencesRequest2) {
      ReferencesRequest2.method = "textDocument/references";
      ReferencesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ReferencesRequest2.type = new messages_1.ProtocolRequestType(ReferencesRequest2.method);
    })(ReferencesRequest || (exports2.ReferencesRequest = ReferencesRequest = {}));
    var DocumentHighlightRequest;
    (function(DocumentHighlightRequest2) {
      DocumentHighlightRequest2.method = "textDocument/documentHighlight";
      DocumentHighlightRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentHighlightRequest2.type = new messages_1.ProtocolRequestType(DocumentHighlightRequest2.method);
    })(DocumentHighlightRequest || (exports2.DocumentHighlightRequest = DocumentHighlightRequest = {}));
    var DocumentSymbolRequest;
    (function(DocumentSymbolRequest2) {
      DocumentSymbolRequest2.method = "textDocument/documentSymbol";
      DocumentSymbolRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentSymbolRequest2.type = new messages_1.ProtocolRequestType(DocumentSymbolRequest2.method);
    })(DocumentSymbolRequest || (exports2.DocumentSymbolRequest = DocumentSymbolRequest = {}));
    var CodeActionRequest;
    (function(CodeActionRequest2) {
      CodeActionRequest2.method = "textDocument/codeAction";
      CodeActionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CodeActionRequest2.type = new messages_1.ProtocolRequestType(CodeActionRequest2.method);
    })(CodeActionRequest || (exports2.CodeActionRequest = CodeActionRequest = {}));
    var CodeActionResolveRequest;
    (function(CodeActionResolveRequest2) {
      CodeActionResolveRequest2.method = "codeAction/resolve";
      CodeActionResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CodeActionResolveRequest2.type = new messages_1.ProtocolRequestType(CodeActionResolveRequest2.method);
    })(CodeActionResolveRequest || (exports2.CodeActionResolveRequest = CodeActionResolveRequest = {}));
    var WorkspaceSymbolRequest;
    (function(WorkspaceSymbolRequest2) {
      WorkspaceSymbolRequest2.method = "workspace/symbol";
      WorkspaceSymbolRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WorkspaceSymbolRequest2.type = new messages_1.ProtocolRequestType(WorkspaceSymbolRequest2.method);
    })(WorkspaceSymbolRequest || (exports2.WorkspaceSymbolRequest = WorkspaceSymbolRequest = {}));
    var WorkspaceSymbolResolveRequest;
    (function(WorkspaceSymbolResolveRequest2) {
      WorkspaceSymbolResolveRequest2.method = "workspaceSymbol/resolve";
      WorkspaceSymbolResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WorkspaceSymbolResolveRequest2.type = new messages_1.ProtocolRequestType(WorkspaceSymbolResolveRequest2.method);
    })(WorkspaceSymbolResolveRequest || (exports2.WorkspaceSymbolResolveRequest = WorkspaceSymbolResolveRequest = {}));
    var CodeLensRequest;
    (function(CodeLensRequest2) {
      CodeLensRequest2.method = "textDocument/codeLens";
      CodeLensRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CodeLensRequest2.type = new messages_1.ProtocolRequestType(CodeLensRequest2.method);
    })(CodeLensRequest || (exports2.CodeLensRequest = CodeLensRequest = {}));
    var CodeLensResolveRequest;
    (function(CodeLensResolveRequest2) {
      CodeLensResolveRequest2.method = "codeLens/resolve";
      CodeLensResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CodeLensResolveRequest2.type = new messages_1.ProtocolRequestType(CodeLensResolveRequest2.method);
    })(CodeLensResolveRequest || (exports2.CodeLensResolveRequest = CodeLensResolveRequest = {}));
    var CodeLensRefreshRequest;
    (function(CodeLensRefreshRequest2) {
      CodeLensRefreshRequest2.method = `workspace/codeLens/refresh`;
      CodeLensRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      CodeLensRefreshRequest2.type = new messages_1.ProtocolRequestType0(CodeLensRefreshRequest2.method);
    })(CodeLensRefreshRequest || (exports2.CodeLensRefreshRequest = CodeLensRefreshRequest = {}));
    var DocumentLinkRequest;
    (function(DocumentLinkRequest2) {
      DocumentLinkRequest2.method = "textDocument/documentLink";
      DocumentLinkRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentLinkRequest2.type = new messages_1.ProtocolRequestType(DocumentLinkRequest2.method);
    })(DocumentLinkRequest || (exports2.DocumentLinkRequest = DocumentLinkRequest = {}));
    var DocumentLinkResolveRequest;
    (function(DocumentLinkResolveRequest2) {
      DocumentLinkResolveRequest2.method = "documentLink/resolve";
      DocumentLinkResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentLinkResolveRequest2.type = new messages_1.ProtocolRequestType(DocumentLinkResolveRequest2.method);
    })(DocumentLinkResolveRequest || (exports2.DocumentLinkResolveRequest = DocumentLinkResolveRequest = {}));
    var DocumentFormattingRequest;
    (function(DocumentFormattingRequest2) {
      DocumentFormattingRequest2.method = "textDocument/formatting";
      DocumentFormattingRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentFormattingRequest2.type = new messages_1.ProtocolRequestType(DocumentFormattingRequest2.method);
    })(DocumentFormattingRequest || (exports2.DocumentFormattingRequest = DocumentFormattingRequest = {}));
    var DocumentRangeFormattingRequest;
    (function(DocumentRangeFormattingRequest2) {
      DocumentRangeFormattingRequest2.method = "textDocument/rangeFormatting";
      DocumentRangeFormattingRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentRangeFormattingRequest2.type = new messages_1.ProtocolRequestType(DocumentRangeFormattingRequest2.method);
    })(DocumentRangeFormattingRequest || (exports2.DocumentRangeFormattingRequest = DocumentRangeFormattingRequest = {}));
    var DocumentRangesFormattingRequest;
    (function(DocumentRangesFormattingRequest2) {
      DocumentRangesFormattingRequest2.method = "textDocument/rangesFormatting";
      DocumentRangesFormattingRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentRangesFormattingRequest2.type = new messages_1.ProtocolRequestType(DocumentRangesFormattingRequest2.method);
    })(DocumentRangesFormattingRequest || (exports2.DocumentRangesFormattingRequest = DocumentRangesFormattingRequest = {}));
    var DocumentOnTypeFormattingRequest;
    (function(DocumentOnTypeFormattingRequest2) {
      DocumentOnTypeFormattingRequest2.method = "textDocument/onTypeFormatting";
      DocumentOnTypeFormattingRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentOnTypeFormattingRequest2.type = new messages_1.ProtocolRequestType(DocumentOnTypeFormattingRequest2.method);
    })(DocumentOnTypeFormattingRequest || (exports2.DocumentOnTypeFormattingRequest = DocumentOnTypeFormattingRequest = {}));
    var PrepareSupportDefaultBehavior;
    (function(PrepareSupportDefaultBehavior2) {
      PrepareSupportDefaultBehavior2.Identifier = 1;
    })(PrepareSupportDefaultBehavior || (exports2.PrepareSupportDefaultBehavior = PrepareSupportDefaultBehavior = {}));
    var RenameRequest;
    (function(RenameRequest2) {
      RenameRequest2.method = "textDocument/rename";
      RenameRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      RenameRequest2.type = new messages_1.ProtocolRequestType(RenameRequest2.method);
    })(RenameRequest || (exports2.RenameRequest = RenameRequest = {}));
    var PrepareRenameRequest;
    (function(PrepareRenameRequest2) {
      PrepareRenameRequest2.method = "textDocument/prepareRename";
      PrepareRenameRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      PrepareRenameRequest2.type = new messages_1.ProtocolRequestType(PrepareRenameRequest2.method);
    })(PrepareRenameRequest || (exports2.PrepareRenameRequest = PrepareRenameRequest = {}));
    var ExecuteCommandRequest;
    (function(ExecuteCommandRequest2) {
      ExecuteCommandRequest2.method = "workspace/executeCommand";
      ExecuteCommandRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ExecuteCommandRequest2.type = new messages_1.ProtocolRequestType(ExecuteCommandRequest2.method);
    })(ExecuteCommandRequest || (exports2.ExecuteCommandRequest = ExecuteCommandRequest = {}));
    var ApplyWorkspaceEditRequest;
    (function(ApplyWorkspaceEditRequest2) {
      ApplyWorkspaceEditRequest2.method = "workspace/applyEdit";
      ApplyWorkspaceEditRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      ApplyWorkspaceEditRequest2.type = new messages_1.ProtocolRequestType("workspace/applyEdit");
    })(ApplyWorkspaceEditRequest || (exports2.ApplyWorkspaceEditRequest = ApplyWorkspaceEditRequest = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/connection.js
var require_connection2 = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/connection.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createProtocolConnection = void 0;
    var vscode_jsonrpc_1 = require_main();
    function createProtocolConnection(input, output, logger, options) {
      if (vscode_jsonrpc_1.ConnectionStrategy.is(options)) {
        options = { connectionStrategy: options };
      }
      return (0, vscode_jsonrpc_1.createMessageConnection)(input, output, logger, options);
    }
    exports2.createProtocolConnection = createProtocolConnection;
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/common/api.js
var require_api2 = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/common/api.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LSPErrorCodes = exports2.createProtocolConnection = void 0;
    __exportStar(require_main(), exports2);
    __exportStar(require_main2(), exports2);
    __exportStar(require_messages2(), exports2);
    __exportStar(require_protocol(), exports2);
    var connection_1 = require_connection2();
    Object.defineProperty(exports2, "createProtocolConnection", { enumerable: true, get: function() {
      return connection_1.createProtocolConnection;
    } });
    var LSPErrorCodes;
    (function(LSPErrorCodes2) {
      LSPErrorCodes2.lspReservedErrorRangeStart = -32899;
      LSPErrorCodes2.RequestFailed = -32803;
      LSPErrorCodes2.ServerCancelled = -32802;
      LSPErrorCodes2.ContentModified = -32801;
      LSPErrorCodes2.RequestCancelled = -32800;
      LSPErrorCodes2.lspReservedErrorRangeEnd = -32800;
    })(LSPErrorCodes || (exports2.LSPErrorCodes = LSPErrorCodes = {}));
  }
});

// ../../node_modules/vscode-languageserver-protocol/lib/node/main.js
var require_main3 = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/lib/node/main.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createProtocolConnection = void 0;
    var node_1 = require_node();
    __exportStar(require_node(), exports2);
    __exportStar(require_api2(), exports2);
    function createProtocolConnection(input, output, logger, options) {
      return (0, node_1.createMessageConnection)(input, output, logger, options);
    }
    exports2.createProtocolConnection = createProtocolConnection;
  }
});

// ../../node_modules/vscode-languageserver/lib/common/utils/uuid.js
var require_uuid = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/utils/uuid.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.generateUuid = exports2.parse = exports2.isUUID = exports2.v4 = exports2.empty = void 0;
    var ValueUUID = class {
      constructor(_value) {
        this._value = _value;
      }
      asHex() {
        return this._value;
      }
      equals(other) {
        return this.asHex() === other.asHex();
      }
    };
    var V4UUID = class _V4UUID extends ValueUUID {
      static _oneOf(array) {
        return array[Math.floor(array.length * Math.random())];
      }
      static _randomHex() {
        return _V4UUID._oneOf(_V4UUID._chars);
      }
      constructor() {
        super([
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          "-",
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          "-",
          "4",
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          "-",
          _V4UUID._oneOf(_V4UUID._timeHighBits),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          "-",
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex()
        ].join(""));
      }
    };
    V4UUID._chars = ["0", "1", "2", "3", "4", "5", "6", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    V4UUID._timeHighBits = ["8", "9", "a", "b"];
    exports2.empty = new ValueUUID("00000000-0000-0000-0000-000000000000");
    function v4() {
      return new V4UUID();
    }
    exports2.v4 = v4;
    var _UUIDPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    function isUUID(value) {
      return _UUIDPattern.test(value);
    }
    exports2.isUUID = isUUID;
    function parse(value) {
      if (!isUUID(value)) {
        throw new Error("invalid uuid");
      }
      return new ValueUUID(value);
    }
    exports2.parse = parse;
    function generateUuid() {
      return v4().asHex();
    }
    exports2.generateUuid = generateUuid;
  }
});

// ../../node_modules/vscode-languageserver/lib/common/progress.js
var require_progress = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/progress.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.attachPartialResult = exports2.ProgressFeature = exports2.attachWorkDone = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var uuid_1 = require_uuid();
    var WorkDoneProgressReporterImpl = class _WorkDoneProgressReporterImpl {
      constructor(_connection, _token) {
        this._connection = _connection;
        this._token = _token;
        _WorkDoneProgressReporterImpl.Instances.set(this._token, this);
      }
      begin(title, percentage, message, cancellable) {
        let param = {
          kind: "begin",
          title,
          percentage,
          message,
          cancellable
        };
        this._connection.sendProgress(vscode_languageserver_protocol_1.WorkDoneProgress.type, this._token, param);
      }
      report(arg0, arg1) {
        let param = {
          kind: "report"
        };
        if (typeof arg0 === "number") {
          param.percentage = arg0;
          if (arg1 !== void 0) {
            param.message = arg1;
          }
        } else {
          param.message = arg0;
        }
        this._connection.sendProgress(vscode_languageserver_protocol_1.WorkDoneProgress.type, this._token, param);
      }
      done() {
        _WorkDoneProgressReporterImpl.Instances.delete(this._token);
        this._connection.sendProgress(vscode_languageserver_protocol_1.WorkDoneProgress.type, this._token, { kind: "end" });
      }
    };
    WorkDoneProgressReporterImpl.Instances = /* @__PURE__ */ new Map();
    var WorkDoneProgressServerReporterImpl = class extends WorkDoneProgressReporterImpl {
      constructor(connection2, token) {
        super(connection2, token);
        this._source = new vscode_languageserver_protocol_1.CancellationTokenSource();
      }
      get token() {
        return this._source.token;
      }
      done() {
        this._source.dispose();
        super.done();
      }
      cancel() {
        this._source.cancel();
      }
    };
    var NullProgressReporter = class {
      constructor() {
      }
      begin() {
      }
      report() {
      }
      done() {
      }
    };
    var NullProgressServerReporter = class extends NullProgressReporter {
      constructor() {
        super();
        this._source = new vscode_languageserver_protocol_1.CancellationTokenSource();
      }
      get token() {
        return this._source.token;
      }
      done() {
        this._source.dispose();
      }
      cancel() {
        this._source.cancel();
      }
    };
    function attachWorkDone(connection2, params) {
      if (params === void 0 || params.workDoneToken === void 0) {
        return new NullProgressReporter();
      }
      const token = params.workDoneToken;
      delete params.workDoneToken;
      return new WorkDoneProgressReporterImpl(connection2, token);
    }
    exports2.attachWorkDone = attachWorkDone;
    var ProgressFeature = (Base) => {
      return class extends Base {
        constructor() {
          super();
          this._progressSupported = false;
        }
        initialize(capabilities) {
          super.initialize(capabilities);
          if (capabilities?.window?.workDoneProgress === true) {
            this._progressSupported = true;
            this.connection.onNotification(vscode_languageserver_protocol_1.WorkDoneProgressCancelNotification.type, (params) => {
              let progress = WorkDoneProgressReporterImpl.Instances.get(params.token);
              if (progress instanceof WorkDoneProgressServerReporterImpl || progress instanceof NullProgressServerReporter) {
                progress.cancel();
              }
            });
          }
        }
        attachWorkDoneProgress(token) {
          if (token === void 0) {
            return new NullProgressReporter();
          } else {
            return new WorkDoneProgressReporterImpl(this.connection, token);
          }
        }
        createWorkDoneProgress() {
          if (this._progressSupported) {
            const token = (0, uuid_1.generateUuid)();
            return this.connection.sendRequest(vscode_languageserver_protocol_1.WorkDoneProgressCreateRequest.type, { token }).then(() => {
              const result = new WorkDoneProgressServerReporterImpl(this.connection, token);
              return result;
            });
          } else {
            return Promise.resolve(new NullProgressServerReporter());
          }
        }
      };
    };
    exports2.ProgressFeature = ProgressFeature;
    var ResultProgress;
    (function(ResultProgress2) {
      ResultProgress2.type = new vscode_languageserver_protocol_1.ProgressType();
    })(ResultProgress || (ResultProgress = {}));
    var ResultProgressReporterImpl = class {
      constructor(_connection, _token) {
        this._connection = _connection;
        this._token = _token;
      }
      report(data) {
        this._connection.sendProgress(ResultProgress.type, this._token, data);
      }
    };
    function attachPartialResult(connection2, params) {
      if (params === void 0 || params.partialResultToken === void 0) {
        return void 0;
      }
      const token = params.partialResultToken;
      delete params.partialResultToken;
      return new ResultProgressReporterImpl(connection2, token);
    }
    exports2.attachPartialResult = attachPartialResult;
  }
});

// ../../node_modules/vscode-languageserver/lib/common/configuration.js
var require_configuration = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/configuration.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConfigurationFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var Is = require_is();
    var ConfigurationFeature = (Base) => {
      return class extends Base {
        getConfiguration(arg) {
          if (!arg) {
            return this._getConfiguration({});
          } else if (Is.string(arg)) {
            return this._getConfiguration({ section: arg });
          } else {
            return this._getConfiguration(arg);
          }
        }
        _getConfiguration(arg) {
          let params = {
            items: Array.isArray(arg) ? arg : [arg]
          };
          return this.connection.sendRequest(vscode_languageserver_protocol_1.ConfigurationRequest.type, params).then((result) => {
            if (Array.isArray(result)) {
              return Array.isArray(arg) ? result : result[0];
            } else {
              return Array.isArray(arg) ? [] : null;
            }
          });
        }
      };
    };
    exports2.ConfigurationFeature = ConfigurationFeature;
  }
});

// ../../node_modules/vscode-languageserver/lib/common/workspaceFolder.js
var require_workspaceFolder = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/workspaceFolder.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WorkspaceFoldersFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var WorkspaceFoldersFeature = (Base) => {
      return class extends Base {
        constructor() {
          super();
          this._notificationIsAutoRegistered = false;
        }
        initialize(capabilities) {
          super.initialize(capabilities);
          let workspaceCapabilities = capabilities.workspace;
          if (workspaceCapabilities && workspaceCapabilities.workspaceFolders) {
            this._onDidChangeWorkspaceFolders = new vscode_languageserver_protocol_1.Emitter();
            this.connection.onNotification(vscode_languageserver_protocol_1.DidChangeWorkspaceFoldersNotification.type, (params) => {
              this._onDidChangeWorkspaceFolders.fire(params.event);
            });
          }
        }
        fillServerCapabilities(capabilities) {
          super.fillServerCapabilities(capabilities);
          const changeNotifications = capabilities.workspace?.workspaceFolders?.changeNotifications;
          this._notificationIsAutoRegistered = changeNotifications === true || typeof changeNotifications === "string";
        }
        getWorkspaceFolders() {
          return this.connection.sendRequest(vscode_languageserver_protocol_1.WorkspaceFoldersRequest.type);
        }
        get onDidChangeWorkspaceFolders() {
          if (!this._onDidChangeWorkspaceFolders) {
            throw new Error("Client doesn't support sending workspace folder change events.");
          }
          if (!this._notificationIsAutoRegistered && !this._unregistration) {
            this._unregistration = this.connection.client.register(vscode_languageserver_protocol_1.DidChangeWorkspaceFoldersNotification.type);
          }
          return this._onDidChangeWorkspaceFolders.event;
        }
      };
    };
    exports2.WorkspaceFoldersFeature = WorkspaceFoldersFeature;
  }
});

// ../../node_modules/vscode-languageserver/lib/common/callHierarchy.js
var require_callHierarchy = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/callHierarchy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CallHierarchyFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var CallHierarchyFeature = (Base) => {
      return class extends Base {
        get callHierarchy() {
          return {
            onPrepare: (handler) => {
              return this.connection.onRequest(vscode_languageserver_protocol_1.CallHierarchyPrepareRequest.type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), void 0);
              });
            },
            onIncomingCalls: (handler) => {
              const type = vscode_languageserver_protocol_1.CallHierarchyIncomingCallsRequest.type;
              return this.connection.onRequest(type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
              });
            },
            onOutgoingCalls: (handler) => {
              const type = vscode_languageserver_protocol_1.CallHierarchyOutgoingCallsRequest.type;
              return this.connection.onRequest(type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
              });
            }
          };
        }
      };
    };
    exports2.CallHierarchyFeature = CallHierarchyFeature;
  }
});

// ../../node_modules/vscode-languageserver/lib/common/semanticTokens.js
var require_semanticTokens = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/semanticTokens.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SemanticTokensBuilder = exports2.SemanticTokensDiff = exports2.SemanticTokensFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var SemanticTokensFeature = (Base) => {
      return class extends Base {
        get semanticTokens() {
          return {
            refresh: () => {
              return this.connection.sendRequest(vscode_languageserver_protocol_1.SemanticTokensRefreshRequest.type);
            },
            on: (handler) => {
              const type = vscode_languageserver_protocol_1.SemanticTokensRequest.type;
              return this.connection.onRequest(type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
              });
            },
            onDelta: (handler) => {
              const type = vscode_languageserver_protocol_1.SemanticTokensDeltaRequest.type;
              return this.connection.onRequest(type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
              });
            },
            onRange: (handler) => {
              const type = vscode_languageserver_protocol_1.SemanticTokensRangeRequest.type;
              return this.connection.onRequest(type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
              });
            }
          };
        }
      };
    };
    exports2.SemanticTokensFeature = SemanticTokensFeature;
    var SemanticTokensDiff = class {
      constructor(originalSequence, modifiedSequence) {
        this.originalSequence = originalSequence;
        this.modifiedSequence = modifiedSequence;
      }
      computeDiff() {
        const originalLength = this.originalSequence.length;
        const modifiedLength = this.modifiedSequence.length;
        let startIndex = 0;
        while (startIndex < modifiedLength && startIndex < originalLength && this.originalSequence[startIndex] === this.modifiedSequence[startIndex]) {
          startIndex++;
        }
        if (startIndex < modifiedLength && startIndex < originalLength) {
          let originalEndIndex = originalLength - 1;
          let modifiedEndIndex = modifiedLength - 1;
          while (originalEndIndex >= startIndex && modifiedEndIndex >= startIndex && this.originalSequence[originalEndIndex] === this.modifiedSequence[modifiedEndIndex]) {
            originalEndIndex--;
            modifiedEndIndex--;
          }
          if (originalEndIndex < startIndex || modifiedEndIndex < startIndex) {
            originalEndIndex++;
            modifiedEndIndex++;
          }
          const deleteCount = originalEndIndex - startIndex + 1;
          const newData = this.modifiedSequence.slice(startIndex, modifiedEndIndex + 1);
          if (newData.length === 1 && newData[0] === this.originalSequence[originalEndIndex]) {
            return [
              { start: startIndex, deleteCount: deleteCount - 1 }
            ];
          } else {
            return [
              { start: startIndex, deleteCount, data: newData }
            ];
          }
        } else if (startIndex < modifiedLength) {
          return [
            { start: startIndex, deleteCount: 0, data: this.modifiedSequence.slice(startIndex) }
          ];
        } else if (startIndex < originalLength) {
          return [
            { start: startIndex, deleteCount: originalLength - startIndex }
          ];
        } else {
          return [];
        }
      }
    };
    exports2.SemanticTokensDiff = SemanticTokensDiff;
    var SemanticTokensBuilder2 = class {
      constructor() {
        this._prevData = void 0;
        this.initialize();
      }
      initialize() {
        this._id = Date.now();
        this._prevLine = 0;
        this._prevChar = 0;
        this._data = [];
        this._dataLen = 0;
      }
      push(line, char, length, tokenType, tokenModifiers2) {
        let pushLine = line;
        let pushChar = char;
        if (this._dataLen > 0) {
          pushLine -= this._prevLine;
          if (pushLine === 0) {
            pushChar -= this._prevChar;
          }
        }
        this._data[this._dataLen++] = pushLine;
        this._data[this._dataLen++] = pushChar;
        this._data[this._dataLen++] = length;
        this._data[this._dataLen++] = tokenType;
        this._data[this._dataLen++] = tokenModifiers2;
        this._prevLine = line;
        this._prevChar = char;
      }
      get id() {
        return this._id.toString();
      }
      previousResult(id) {
        if (this.id === id) {
          this._prevData = this._data;
        }
        this.initialize();
      }
      build() {
        this._prevData = void 0;
        return {
          resultId: this.id,
          data: this._data
        };
      }
      canBuildEdits() {
        return this._prevData !== void 0;
      }
      buildEdits() {
        if (this._prevData !== void 0) {
          return {
            resultId: this.id,
            edits: new SemanticTokensDiff(this._prevData, this._data).computeDiff()
          };
        } else {
          return this.build();
        }
      }
    };
    exports2.SemanticTokensBuilder = SemanticTokensBuilder2;
  }
});

// ../../node_modules/vscode-languageserver/lib/common/showDocument.js
var require_showDocument = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/showDocument.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ShowDocumentFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var ShowDocumentFeature = (Base) => {
      return class extends Base {
        showDocument(params) {
          return this.connection.sendRequest(vscode_languageserver_protocol_1.ShowDocumentRequest.type, params);
        }
      };
    };
    exports2.ShowDocumentFeature = ShowDocumentFeature;
  }
});

// ../../node_modules/vscode-languageserver/lib/common/fileOperations.js
var require_fileOperations = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/fileOperations.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.FileOperationsFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var FileOperationsFeature = (Base) => {
      return class extends Base {
        onDidCreateFiles(handler) {
          return this.connection.onNotification(vscode_languageserver_protocol_1.DidCreateFilesNotification.type, (params) => {
            handler(params);
          });
        }
        onDidRenameFiles(handler) {
          return this.connection.onNotification(vscode_languageserver_protocol_1.DidRenameFilesNotification.type, (params) => {
            handler(params);
          });
        }
        onDidDeleteFiles(handler) {
          return this.connection.onNotification(vscode_languageserver_protocol_1.DidDeleteFilesNotification.type, (params) => {
            handler(params);
          });
        }
        onWillCreateFiles(handler) {
          return this.connection.onRequest(vscode_languageserver_protocol_1.WillCreateFilesRequest.type, (params, cancel) => {
            return handler(params, cancel);
          });
        }
        onWillRenameFiles(handler) {
          return this.connection.onRequest(vscode_languageserver_protocol_1.WillRenameFilesRequest.type, (params, cancel) => {
            return handler(params, cancel);
          });
        }
        onWillDeleteFiles(handler) {
          return this.connection.onRequest(vscode_languageserver_protocol_1.WillDeleteFilesRequest.type, (params, cancel) => {
            return handler(params, cancel);
          });
        }
      };
    };
    exports2.FileOperationsFeature = FileOperationsFeature;
  }
});

// ../../node_modules/vscode-languageserver/lib/common/linkedEditingRange.js
var require_linkedEditingRange = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/linkedEditingRange.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LinkedEditingRangeFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var LinkedEditingRangeFeature = (Base) => {
      return class extends Base {
        onLinkedEditingRange(handler) {
          return this.connection.onRequest(vscode_languageserver_protocol_1.LinkedEditingRangeRequest.type, (params, cancel) => {
            return handler(params, cancel, this.attachWorkDoneProgress(params), void 0);
          });
        }
      };
    };
    exports2.LinkedEditingRangeFeature = LinkedEditingRangeFeature;
  }
});

// ../../node_modules/vscode-languageserver/lib/common/typeHierarchy.js
var require_typeHierarchy = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/typeHierarchy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TypeHierarchyFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var TypeHierarchyFeature = (Base) => {
      return class extends Base {
        get typeHierarchy() {
          return {
            onPrepare: (handler) => {
              return this.connection.onRequest(vscode_languageserver_protocol_1.TypeHierarchyPrepareRequest.type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), void 0);
              });
            },
            onSupertypes: (handler) => {
              const type = vscode_languageserver_protocol_1.TypeHierarchySupertypesRequest.type;
              return this.connection.onRequest(type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
              });
            },
            onSubtypes: (handler) => {
              const type = vscode_languageserver_protocol_1.TypeHierarchySubtypesRequest.type;
              return this.connection.onRequest(type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
              });
            }
          };
        }
      };
    };
    exports2.TypeHierarchyFeature = TypeHierarchyFeature;
  }
});

// ../../node_modules/vscode-languageserver/lib/common/inlineValue.js
var require_inlineValue = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/inlineValue.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InlineValueFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var InlineValueFeature = (Base) => {
      return class extends Base {
        get inlineValue() {
          return {
            refresh: () => {
              return this.connection.sendRequest(vscode_languageserver_protocol_1.InlineValueRefreshRequest.type);
            },
            on: (handler) => {
              return this.connection.onRequest(vscode_languageserver_protocol_1.InlineValueRequest.type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params));
              });
            }
          };
        }
      };
    };
    exports2.InlineValueFeature = InlineValueFeature;
  }
});

// ../../node_modules/vscode-languageserver/lib/common/foldingRange.js
var require_foldingRange = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/foldingRange.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.FoldingRangeFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var FoldingRangeFeature = (Base) => {
      return class extends Base {
        get foldingRange() {
          return {
            refresh: () => {
              return this.connection.sendRequest(vscode_languageserver_protocol_1.FoldingRangeRefreshRequest.type);
            },
            on: (handler) => {
              const type = vscode_languageserver_protocol_1.FoldingRangeRequest.type;
              return this.connection.onRequest(type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
              });
            }
          };
        }
      };
    };
    exports2.FoldingRangeFeature = FoldingRangeFeature;
  }
});

// ../../node_modules/vscode-languageserver/lib/common/inlayHint.js
var require_inlayHint = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/inlayHint.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InlayHintFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var InlayHintFeature = (Base) => {
      return class extends Base {
        get inlayHint() {
          return {
            refresh: () => {
              return this.connection.sendRequest(vscode_languageserver_protocol_1.InlayHintRefreshRequest.type);
            },
            on: (handler) => {
              return this.connection.onRequest(vscode_languageserver_protocol_1.InlayHintRequest.type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params));
              });
            },
            resolve: (handler) => {
              return this.connection.onRequest(vscode_languageserver_protocol_1.InlayHintResolveRequest.type, (params, cancel) => {
                return handler(params, cancel);
              });
            }
          };
        }
      };
    };
    exports2.InlayHintFeature = InlayHintFeature;
  }
});

// ../../node_modules/vscode-languageserver/lib/common/diagnostic.js
var require_diagnostic = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/diagnostic.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DiagnosticFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var DiagnosticFeature = (Base) => {
      return class extends Base {
        get diagnostics() {
          return {
            refresh: () => {
              return this.connection.sendRequest(vscode_languageserver_protocol_1.DiagnosticRefreshRequest.type);
            },
            on: (handler) => {
              return this.connection.onRequest(vscode_languageserver_protocol_1.DocumentDiagnosticRequest.type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(vscode_languageserver_protocol_1.DocumentDiagnosticRequest.partialResult, params));
              });
            },
            onWorkspace: (handler) => {
              return this.connection.onRequest(vscode_languageserver_protocol_1.WorkspaceDiagnosticRequest.type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(vscode_languageserver_protocol_1.WorkspaceDiagnosticRequest.partialResult, params));
              });
            }
          };
        }
      };
    };
    exports2.DiagnosticFeature = DiagnosticFeature;
  }
});

// ../../node_modules/vscode-languageserver/lib/common/textDocuments.js
var require_textDocuments = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/textDocuments.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TextDocuments = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var TextDocuments2 = class {
      /**
       * Create a new text document manager.
       */
      constructor(configuration) {
        this._configuration = configuration;
        this._syncedDocuments = /* @__PURE__ */ new Map();
        this._onDidChangeContent = new vscode_languageserver_protocol_1.Emitter();
        this._onDidOpen = new vscode_languageserver_protocol_1.Emitter();
        this._onDidClose = new vscode_languageserver_protocol_1.Emitter();
        this._onDidSave = new vscode_languageserver_protocol_1.Emitter();
        this._onWillSave = new vscode_languageserver_protocol_1.Emitter();
      }
      /**
       * An event that fires when a text document managed by this manager
       * has been opened.
       */
      get onDidOpen() {
        return this._onDidOpen.event;
      }
      /**
       * An event that fires when a text document managed by this manager
       * has been opened or the content changes.
       */
      get onDidChangeContent() {
        return this._onDidChangeContent.event;
      }
      /**
       * An event that fires when a text document managed by this manager
       * will be saved.
       */
      get onWillSave() {
        return this._onWillSave.event;
      }
      /**
       * Sets a handler that will be called if a participant wants to provide
       * edits during a text document save.
       */
      onWillSaveWaitUntil(handler) {
        this._willSaveWaitUntil = handler;
      }
      /**
       * An event that fires when a text document managed by this manager
       * has been saved.
       */
      get onDidSave() {
        return this._onDidSave.event;
      }
      /**
       * An event that fires when a text document managed by this manager
       * has been closed.
       */
      get onDidClose() {
        return this._onDidClose.event;
      }
      /**
       * Returns the document for the given URI. Returns undefined if
       * the document is not managed by this instance.
       *
       * @param uri The text document's URI to retrieve.
       * @return the text document or `undefined`.
       */
      get(uri) {
        return this._syncedDocuments.get(uri);
      }
      /**
       * Returns all text documents managed by this instance.
       *
       * @return all text documents.
       */
      all() {
        return Array.from(this._syncedDocuments.values());
      }
      /**
       * Returns the URIs of all text documents managed by this instance.
       *
       * @return the URI's of all text documents.
       */
      keys() {
        return Array.from(this._syncedDocuments.keys());
      }
      /**
       * Listens for `low level` notification on the given connection to
       * update the text documents managed by this instance.
       *
       * Please note that the connection only provides handlers not an event model. Therefore
       * listening on a connection will overwrite the following handlers on a connection:
       * `onDidOpenTextDocument`, `onDidChangeTextDocument`, `onDidCloseTextDocument`,
       * `onWillSaveTextDocument`, `onWillSaveTextDocumentWaitUntil` and `onDidSaveTextDocument`.
       *
       * Use the corresponding events on the TextDocuments instance instead.
       *
       * @param connection The connection to listen on.
       */
      listen(connection2) {
        connection2.__textDocumentSync = vscode_languageserver_protocol_1.TextDocumentSyncKind.Incremental;
        const disposables = [];
        disposables.push(connection2.onDidOpenTextDocument((event) => {
          const td = event.textDocument;
          const document = this._configuration.create(td.uri, td.languageId, td.version, td.text);
          this._syncedDocuments.set(td.uri, document);
          const toFire = Object.freeze({ document });
          this._onDidOpen.fire(toFire);
          this._onDidChangeContent.fire(toFire);
        }));
        disposables.push(connection2.onDidChangeTextDocument((event) => {
          const td = event.textDocument;
          const changes = event.contentChanges;
          if (changes.length === 0) {
            return;
          }
          const { version } = td;
          if (version === null || version === void 0) {
            throw new Error(`Received document change event for ${td.uri} without valid version identifier`);
          }
          let syncedDocument = this._syncedDocuments.get(td.uri);
          if (syncedDocument !== void 0) {
            syncedDocument = this._configuration.update(syncedDocument, changes, version);
            this._syncedDocuments.set(td.uri, syncedDocument);
            this._onDidChangeContent.fire(Object.freeze({ document: syncedDocument }));
          }
        }));
        disposables.push(connection2.onDidCloseTextDocument((event) => {
          let syncedDocument = this._syncedDocuments.get(event.textDocument.uri);
          if (syncedDocument !== void 0) {
            this._syncedDocuments.delete(event.textDocument.uri);
            this._onDidClose.fire(Object.freeze({ document: syncedDocument }));
          }
        }));
        disposables.push(connection2.onWillSaveTextDocument((event) => {
          let syncedDocument = this._syncedDocuments.get(event.textDocument.uri);
          if (syncedDocument !== void 0) {
            this._onWillSave.fire(Object.freeze({ document: syncedDocument, reason: event.reason }));
          }
        }));
        disposables.push(connection2.onWillSaveTextDocumentWaitUntil((event, token) => {
          let syncedDocument = this._syncedDocuments.get(event.textDocument.uri);
          if (syncedDocument !== void 0 && this._willSaveWaitUntil) {
            return this._willSaveWaitUntil(Object.freeze({ document: syncedDocument, reason: event.reason }), token);
          } else {
            return [];
          }
        }));
        disposables.push(connection2.onDidSaveTextDocument((event) => {
          let syncedDocument = this._syncedDocuments.get(event.textDocument.uri);
          if (syncedDocument !== void 0) {
            this._onDidSave.fire(Object.freeze({ document: syncedDocument }));
          }
        }));
        return vscode_languageserver_protocol_1.Disposable.create(() => {
          disposables.forEach((disposable) => disposable.dispose());
        });
      }
    };
    exports2.TextDocuments = TextDocuments2;
  }
});

// ../../node_modules/vscode-languageserver/lib/common/notebook.js
var require_notebook = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/notebook.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NotebookDocuments = exports2.NotebookSyncFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var textDocuments_1 = require_textDocuments();
    var NotebookSyncFeature = (Base) => {
      return class extends Base {
        get synchronization() {
          return {
            onDidOpenNotebookDocument: (handler) => {
              return this.connection.onNotification(vscode_languageserver_protocol_1.DidOpenNotebookDocumentNotification.type, (params) => {
                handler(params);
              });
            },
            onDidChangeNotebookDocument: (handler) => {
              return this.connection.onNotification(vscode_languageserver_protocol_1.DidChangeNotebookDocumentNotification.type, (params) => {
                handler(params);
              });
            },
            onDidSaveNotebookDocument: (handler) => {
              return this.connection.onNotification(vscode_languageserver_protocol_1.DidSaveNotebookDocumentNotification.type, (params) => {
                handler(params);
              });
            },
            onDidCloseNotebookDocument: (handler) => {
              return this.connection.onNotification(vscode_languageserver_protocol_1.DidCloseNotebookDocumentNotification.type, (params) => {
                handler(params);
              });
            }
          };
        }
      };
    };
    exports2.NotebookSyncFeature = NotebookSyncFeature;
    var CellTextDocumentConnection = class _CellTextDocumentConnection {
      onDidOpenTextDocument(handler) {
        this.openHandler = handler;
        return vscode_languageserver_protocol_1.Disposable.create(() => {
          this.openHandler = void 0;
        });
      }
      openTextDocument(params) {
        this.openHandler && this.openHandler(params);
      }
      onDidChangeTextDocument(handler) {
        this.changeHandler = handler;
        return vscode_languageserver_protocol_1.Disposable.create(() => {
          this.changeHandler = handler;
        });
      }
      changeTextDocument(params) {
        this.changeHandler && this.changeHandler(params);
      }
      onDidCloseTextDocument(handler) {
        this.closeHandler = handler;
        return vscode_languageserver_protocol_1.Disposable.create(() => {
          this.closeHandler = void 0;
        });
      }
      closeTextDocument(params) {
        this.closeHandler && this.closeHandler(params);
      }
      onWillSaveTextDocument() {
        return _CellTextDocumentConnection.NULL_DISPOSE;
      }
      onWillSaveTextDocumentWaitUntil() {
        return _CellTextDocumentConnection.NULL_DISPOSE;
      }
      onDidSaveTextDocument() {
        return _CellTextDocumentConnection.NULL_DISPOSE;
      }
    };
    CellTextDocumentConnection.NULL_DISPOSE = Object.freeze({ dispose: () => {
    } });
    var NotebookDocuments = class {
      constructor(configurationOrTextDocuments) {
        if (configurationOrTextDocuments instanceof textDocuments_1.TextDocuments) {
          this._cellTextDocuments = configurationOrTextDocuments;
        } else {
          this._cellTextDocuments = new textDocuments_1.TextDocuments(configurationOrTextDocuments);
        }
        this.notebookDocuments = /* @__PURE__ */ new Map();
        this.notebookCellMap = /* @__PURE__ */ new Map();
        this._onDidOpen = new vscode_languageserver_protocol_1.Emitter();
        this._onDidChange = new vscode_languageserver_protocol_1.Emitter();
        this._onDidSave = new vscode_languageserver_protocol_1.Emitter();
        this._onDidClose = new vscode_languageserver_protocol_1.Emitter();
      }
      get cellTextDocuments() {
        return this._cellTextDocuments;
      }
      getCellTextDocument(cell) {
        return this._cellTextDocuments.get(cell.document);
      }
      getNotebookDocument(uri) {
        return this.notebookDocuments.get(uri);
      }
      getNotebookCell(uri) {
        const value = this.notebookCellMap.get(uri);
        return value && value[0];
      }
      findNotebookDocumentForCell(cell) {
        const key = typeof cell === "string" ? cell : cell.document;
        const value = this.notebookCellMap.get(key);
        return value && value[1];
      }
      get onDidOpen() {
        return this._onDidOpen.event;
      }
      get onDidSave() {
        return this._onDidSave.event;
      }
      get onDidChange() {
        return this._onDidChange.event;
      }
      get onDidClose() {
        return this._onDidClose.event;
      }
      /**
       * Listens for `low level` notification on the given connection to
       * update the notebook documents managed by this instance.
       *
       * Please note that the connection only provides handlers not an event model. Therefore
       * listening on a connection will overwrite the following handlers on a connection:
       * `onDidOpenNotebookDocument`, `onDidChangeNotebookDocument`, `onDidSaveNotebookDocument`,
       *  and `onDidCloseNotebookDocument`.
       *
       * @param connection The connection to listen on.
       */
      listen(connection2) {
        const cellTextDocumentConnection = new CellTextDocumentConnection();
        const disposables = [];
        disposables.push(this.cellTextDocuments.listen(cellTextDocumentConnection));
        disposables.push(connection2.notebooks.synchronization.onDidOpenNotebookDocument((params) => {
          this.notebookDocuments.set(params.notebookDocument.uri, params.notebookDocument);
          for (const cellTextDocument of params.cellTextDocuments) {
            cellTextDocumentConnection.openTextDocument({ textDocument: cellTextDocument });
          }
          this.updateCellMap(params.notebookDocument);
          this._onDidOpen.fire(params.notebookDocument);
        }));
        disposables.push(connection2.notebooks.synchronization.onDidChangeNotebookDocument((params) => {
          const notebookDocument = this.notebookDocuments.get(params.notebookDocument.uri);
          if (notebookDocument === void 0) {
            return;
          }
          notebookDocument.version = params.notebookDocument.version;
          const oldMetadata = notebookDocument.metadata;
          let metadataChanged = false;
          const change = params.change;
          if (change.metadata !== void 0) {
            metadataChanged = true;
            notebookDocument.metadata = change.metadata;
          }
          const opened = [];
          const closed = [];
          const data = [];
          const text = [];
          if (change.cells !== void 0) {
            const changedCells = change.cells;
            if (changedCells.structure !== void 0) {
              const array = changedCells.structure.array;
              notebookDocument.cells.splice(array.start, array.deleteCount, ...array.cells !== void 0 ? array.cells : []);
              if (changedCells.structure.didOpen !== void 0) {
                for (const open of changedCells.structure.didOpen) {
                  cellTextDocumentConnection.openTextDocument({ textDocument: open });
                  opened.push(open.uri);
                }
              }
              if (changedCells.structure.didClose) {
                for (const close of changedCells.structure.didClose) {
                  cellTextDocumentConnection.closeTextDocument({ textDocument: close });
                  closed.push(close.uri);
                }
              }
            }
            if (changedCells.data !== void 0) {
              const cellUpdates = new Map(changedCells.data.map((cell) => [cell.document, cell]));
              for (let i = 0; i <= notebookDocument.cells.length; i++) {
                const change2 = cellUpdates.get(notebookDocument.cells[i].document);
                if (change2 !== void 0) {
                  const old = notebookDocument.cells.splice(i, 1, change2);
                  data.push({ old: old[0], new: change2 });
                  cellUpdates.delete(change2.document);
                  if (cellUpdates.size === 0) {
                    break;
                  }
                }
              }
            }
            if (changedCells.textContent !== void 0) {
              for (const cellTextDocument of changedCells.textContent) {
                cellTextDocumentConnection.changeTextDocument({ textDocument: cellTextDocument.document, contentChanges: cellTextDocument.changes });
                text.push(cellTextDocument.document.uri);
              }
            }
          }
          this.updateCellMap(notebookDocument);
          const changeEvent = { notebookDocument };
          if (metadataChanged) {
            changeEvent.metadata = { old: oldMetadata, new: notebookDocument.metadata };
          }
          const added = [];
          for (const open of opened) {
            added.push(this.getNotebookCell(open));
          }
          const removed = [];
          for (const close of closed) {
            removed.push(this.getNotebookCell(close));
          }
          const textContent = [];
          for (const change2 of text) {
            textContent.push(this.getNotebookCell(change2));
          }
          if (added.length > 0 || removed.length > 0 || data.length > 0 || textContent.length > 0) {
            changeEvent.cells = { added, removed, changed: { data, textContent } };
          }
          if (changeEvent.metadata !== void 0 || changeEvent.cells !== void 0) {
            this._onDidChange.fire(changeEvent);
          }
        }));
        disposables.push(connection2.notebooks.synchronization.onDidSaveNotebookDocument((params) => {
          const notebookDocument = this.notebookDocuments.get(params.notebookDocument.uri);
          if (notebookDocument === void 0) {
            return;
          }
          this._onDidSave.fire(notebookDocument);
        }));
        disposables.push(connection2.notebooks.synchronization.onDidCloseNotebookDocument((params) => {
          const notebookDocument = this.notebookDocuments.get(params.notebookDocument.uri);
          if (notebookDocument === void 0) {
            return;
          }
          this._onDidClose.fire(notebookDocument);
          for (const cellTextDocument of params.cellTextDocuments) {
            cellTextDocumentConnection.closeTextDocument({ textDocument: cellTextDocument });
          }
          this.notebookDocuments.delete(params.notebookDocument.uri);
          for (const cell of notebookDocument.cells) {
            this.notebookCellMap.delete(cell.document);
          }
        }));
        return vscode_languageserver_protocol_1.Disposable.create(() => {
          disposables.forEach((disposable) => disposable.dispose());
        });
      }
      updateCellMap(notebookDocument) {
        for (const cell of notebookDocument.cells) {
          this.notebookCellMap.set(cell.document, [cell, notebookDocument]);
        }
      }
    };
    exports2.NotebookDocuments = NotebookDocuments;
  }
});

// ../../node_modules/vscode-languageserver/lib/common/moniker.js
var require_moniker = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/moniker.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MonikerFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var MonikerFeature = (Base) => {
      return class extends Base {
        get moniker() {
          return {
            on: (handler) => {
              const type = vscode_languageserver_protocol_1.MonikerRequest.type;
              return this.connection.onRequest(type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
              });
            }
          };
        }
      };
    };
    exports2.MonikerFeature = MonikerFeature;
  }
});

// ../../node_modules/vscode-languageserver/lib/common/server.js
var require_server = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/server.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createConnection = exports2.combineFeatures = exports2.combineNotebooksFeatures = exports2.combineLanguagesFeatures = exports2.combineWorkspaceFeatures = exports2.combineWindowFeatures = exports2.combineClientFeatures = exports2.combineTracerFeatures = exports2.combineTelemetryFeatures = exports2.combineConsoleFeatures = exports2._NotebooksImpl = exports2._LanguagesImpl = exports2.BulkUnregistration = exports2.BulkRegistration = exports2.ErrorMessageTracker = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var Is = require_is();
    var UUID = require_uuid();
    var progress_1 = require_progress();
    var configuration_1 = require_configuration();
    var workspaceFolder_1 = require_workspaceFolder();
    var callHierarchy_1 = require_callHierarchy();
    var semanticTokens_1 = require_semanticTokens();
    var showDocument_1 = require_showDocument();
    var fileOperations_1 = require_fileOperations();
    var linkedEditingRange_1 = require_linkedEditingRange();
    var typeHierarchy_1 = require_typeHierarchy();
    var inlineValue_1 = require_inlineValue();
    var foldingRange_1 = require_foldingRange();
    var inlayHint_1 = require_inlayHint();
    var diagnostic_1 = require_diagnostic();
    var notebook_1 = require_notebook();
    var moniker_1 = require_moniker();
    function null2Undefined(value) {
      if (value === null) {
        return void 0;
      }
      return value;
    }
    var ErrorMessageTracker = class {
      constructor() {
        this._messages = /* @__PURE__ */ Object.create(null);
      }
      /**
       * Add a message to the tracker.
       *
       * @param message The message to add.
       */
      add(message) {
        let count = this._messages[message];
        if (!count) {
          count = 0;
        }
        count++;
        this._messages[message] = count;
      }
      /**
       * Send all tracked messages to the connection's window.
       *
       * @param connection The connection established between client and server.
       */
      sendErrors(connection2) {
        Object.keys(this._messages).forEach((message) => {
          connection2.window.showErrorMessage(message);
        });
      }
    };
    exports2.ErrorMessageTracker = ErrorMessageTracker;
    var RemoteConsoleImpl = class {
      constructor() {
      }
      rawAttach(connection2) {
        this._rawConnection = connection2;
      }
      attach(connection2) {
        this._connection = connection2;
      }
      get connection() {
        if (!this._connection) {
          throw new Error("Remote is not attached to a connection yet.");
        }
        return this._connection;
      }
      fillServerCapabilities(_capabilities) {
      }
      initialize(_capabilities) {
      }
      error(message) {
        this.send(vscode_languageserver_protocol_1.MessageType.Error, message);
      }
      warn(message) {
        this.send(vscode_languageserver_protocol_1.MessageType.Warning, message);
      }
      info(message) {
        this.send(vscode_languageserver_protocol_1.MessageType.Info, message);
      }
      log(message) {
        this.send(vscode_languageserver_protocol_1.MessageType.Log, message);
      }
      debug(message) {
        this.send(vscode_languageserver_protocol_1.MessageType.Debug, message);
      }
      send(type, message) {
        if (this._rawConnection) {
          this._rawConnection.sendNotification(vscode_languageserver_protocol_1.LogMessageNotification.type, { type, message }).catch(() => {
            (0, vscode_languageserver_protocol_1.RAL)().console.error(`Sending log message failed`);
          });
        }
      }
    };
    var _RemoteWindowImpl = class {
      constructor() {
      }
      attach(connection2) {
        this._connection = connection2;
      }
      get connection() {
        if (!this._connection) {
          throw new Error("Remote is not attached to a connection yet.");
        }
        return this._connection;
      }
      initialize(_capabilities) {
      }
      fillServerCapabilities(_capabilities) {
      }
      showErrorMessage(message, ...actions) {
        let params = { type: vscode_languageserver_protocol_1.MessageType.Error, message, actions };
        return this.connection.sendRequest(vscode_languageserver_protocol_1.ShowMessageRequest.type, params).then(null2Undefined);
      }
      showWarningMessage(message, ...actions) {
        let params = { type: vscode_languageserver_protocol_1.MessageType.Warning, message, actions };
        return this.connection.sendRequest(vscode_languageserver_protocol_1.ShowMessageRequest.type, params).then(null2Undefined);
      }
      showInformationMessage(message, ...actions) {
        let params = { type: vscode_languageserver_protocol_1.MessageType.Info, message, actions };
        return this.connection.sendRequest(vscode_languageserver_protocol_1.ShowMessageRequest.type, params).then(null2Undefined);
      }
    };
    var RemoteWindowImpl = (0, showDocument_1.ShowDocumentFeature)((0, progress_1.ProgressFeature)(_RemoteWindowImpl));
    var BulkRegistration;
    (function(BulkRegistration2) {
      function create() {
        return new BulkRegistrationImpl();
      }
      BulkRegistration2.create = create;
    })(BulkRegistration || (exports2.BulkRegistration = BulkRegistration = {}));
    var BulkRegistrationImpl = class {
      constructor() {
        this._registrations = [];
        this._registered = /* @__PURE__ */ new Set();
      }
      add(type, registerOptions) {
        const method = Is.string(type) ? type : type.method;
        if (this._registered.has(method)) {
          throw new Error(`${method} is already added to this registration`);
        }
        const id = UUID.generateUuid();
        this._registrations.push({
          id,
          method,
          registerOptions: registerOptions || {}
        });
        this._registered.add(method);
      }
      asRegistrationParams() {
        return {
          registrations: this._registrations
        };
      }
    };
    var BulkUnregistration;
    (function(BulkUnregistration2) {
      function create() {
        return new BulkUnregistrationImpl(void 0, []);
      }
      BulkUnregistration2.create = create;
    })(BulkUnregistration || (exports2.BulkUnregistration = BulkUnregistration = {}));
    var BulkUnregistrationImpl = class {
      constructor(_connection, unregistrations) {
        this._connection = _connection;
        this._unregistrations = /* @__PURE__ */ new Map();
        unregistrations.forEach((unregistration) => {
          this._unregistrations.set(unregistration.method, unregistration);
        });
      }
      get isAttached() {
        return !!this._connection;
      }
      attach(connection2) {
        this._connection = connection2;
      }
      add(unregistration) {
        this._unregistrations.set(unregistration.method, unregistration);
      }
      dispose() {
        let unregistrations = [];
        for (let unregistration of this._unregistrations.values()) {
          unregistrations.push(unregistration);
        }
        let params = {
          unregisterations: unregistrations
        };
        this._connection.sendRequest(vscode_languageserver_protocol_1.UnregistrationRequest.type, params).catch(() => {
          this._connection.console.info(`Bulk unregistration failed.`);
        });
      }
      disposeSingle(arg) {
        const method = Is.string(arg) ? arg : arg.method;
        const unregistration = this._unregistrations.get(method);
        if (!unregistration) {
          return false;
        }
        let params = {
          unregisterations: [unregistration]
        };
        this._connection.sendRequest(vscode_languageserver_protocol_1.UnregistrationRequest.type, params).then(() => {
          this._unregistrations.delete(method);
        }, (_error) => {
          this._connection.console.info(`Un-registering request handler for ${unregistration.id} failed.`);
        });
        return true;
      }
    };
    var RemoteClientImpl = class {
      attach(connection2) {
        this._connection = connection2;
      }
      get connection() {
        if (!this._connection) {
          throw new Error("Remote is not attached to a connection yet.");
        }
        return this._connection;
      }
      initialize(_capabilities) {
      }
      fillServerCapabilities(_capabilities) {
      }
      register(typeOrRegistrations, registerOptionsOrType, registerOptions) {
        if (typeOrRegistrations instanceof BulkRegistrationImpl) {
          return this.registerMany(typeOrRegistrations);
        } else if (typeOrRegistrations instanceof BulkUnregistrationImpl) {
          return this.registerSingle1(typeOrRegistrations, registerOptionsOrType, registerOptions);
        } else {
          return this.registerSingle2(typeOrRegistrations, registerOptionsOrType);
        }
      }
      registerSingle1(unregistration, type, registerOptions) {
        const method = Is.string(type) ? type : type.method;
        const id = UUID.generateUuid();
        let params = {
          registrations: [{ id, method, registerOptions: registerOptions || {} }]
        };
        if (!unregistration.isAttached) {
          unregistration.attach(this.connection);
        }
        return this.connection.sendRequest(vscode_languageserver_protocol_1.RegistrationRequest.type, params).then((_result) => {
          unregistration.add({ id, method });
          return unregistration;
        }, (_error) => {
          this.connection.console.info(`Registering request handler for ${method} failed.`);
          return Promise.reject(_error);
        });
      }
      registerSingle2(type, registerOptions) {
        const method = Is.string(type) ? type : type.method;
        const id = UUID.generateUuid();
        let params = {
          registrations: [{ id, method, registerOptions: registerOptions || {} }]
        };
        return this.connection.sendRequest(vscode_languageserver_protocol_1.RegistrationRequest.type, params).then((_result) => {
          return vscode_languageserver_protocol_1.Disposable.create(() => {
            this.unregisterSingle(id, method).catch(() => {
              this.connection.console.info(`Un-registering capability with id ${id} failed.`);
            });
          });
        }, (_error) => {
          this.connection.console.info(`Registering request handler for ${method} failed.`);
          return Promise.reject(_error);
        });
      }
      unregisterSingle(id, method) {
        let params = {
          unregisterations: [{ id, method }]
        };
        return this.connection.sendRequest(vscode_languageserver_protocol_1.UnregistrationRequest.type, params).catch(() => {
          this.connection.console.info(`Un-registering request handler for ${id} failed.`);
        });
      }
      registerMany(registrations) {
        let params = registrations.asRegistrationParams();
        return this.connection.sendRequest(vscode_languageserver_protocol_1.RegistrationRequest.type, params).then(() => {
          return new BulkUnregistrationImpl(this._connection, params.registrations.map((registration) => {
            return { id: registration.id, method: registration.method };
          }));
        }, (_error) => {
          this.connection.console.info(`Bulk registration failed.`);
          return Promise.reject(_error);
        });
      }
    };
    var _RemoteWorkspaceImpl = class {
      constructor() {
      }
      attach(connection2) {
        this._connection = connection2;
      }
      get connection() {
        if (!this._connection) {
          throw new Error("Remote is not attached to a connection yet.");
        }
        return this._connection;
      }
      initialize(_capabilities) {
      }
      fillServerCapabilities(_capabilities) {
      }
      applyEdit(paramOrEdit) {
        function isApplyWorkspaceEditParams(value) {
          return value && !!value.edit;
        }
        let params = isApplyWorkspaceEditParams(paramOrEdit) ? paramOrEdit : { edit: paramOrEdit };
        return this.connection.sendRequest(vscode_languageserver_protocol_1.ApplyWorkspaceEditRequest.type, params);
      }
    };
    var RemoteWorkspaceImpl = (0, fileOperations_1.FileOperationsFeature)((0, workspaceFolder_1.WorkspaceFoldersFeature)((0, configuration_1.ConfigurationFeature)(_RemoteWorkspaceImpl)));
    var TracerImpl = class {
      constructor() {
        this._trace = vscode_languageserver_protocol_1.Trace.Off;
      }
      attach(connection2) {
        this._connection = connection2;
      }
      get connection() {
        if (!this._connection) {
          throw new Error("Remote is not attached to a connection yet.");
        }
        return this._connection;
      }
      initialize(_capabilities) {
      }
      fillServerCapabilities(_capabilities) {
      }
      set trace(value) {
        this._trace = value;
      }
      log(message, verbose) {
        if (this._trace === vscode_languageserver_protocol_1.Trace.Off) {
          return;
        }
        this.connection.sendNotification(vscode_languageserver_protocol_1.LogTraceNotification.type, {
          message,
          verbose: this._trace === vscode_languageserver_protocol_1.Trace.Verbose ? verbose : void 0
        }).catch(() => {
        });
      }
    };
    var TelemetryImpl = class {
      constructor() {
      }
      attach(connection2) {
        this._connection = connection2;
      }
      get connection() {
        if (!this._connection) {
          throw new Error("Remote is not attached to a connection yet.");
        }
        return this._connection;
      }
      initialize(_capabilities) {
      }
      fillServerCapabilities(_capabilities) {
      }
      logEvent(data) {
        this.connection.sendNotification(vscode_languageserver_protocol_1.TelemetryEventNotification.type, data).catch(() => {
          this.connection.console.log(`Sending TelemetryEventNotification failed`);
        });
      }
    };
    var _LanguagesImpl = class {
      constructor() {
      }
      attach(connection2) {
        this._connection = connection2;
      }
      get connection() {
        if (!this._connection) {
          throw new Error("Remote is not attached to a connection yet.");
        }
        return this._connection;
      }
      initialize(_capabilities) {
      }
      fillServerCapabilities(_capabilities) {
      }
      attachWorkDoneProgress(params) {
        return (0, progress_1.attachWorkDone)(this.connection, params);
      }
      attachPartialResultProgress(_type, params) {
        return (0, progress_1.attachPartialResult)(this.connection, params);
      }
    };
    exports2._LanguagesImpl = _LanguagesImpl;
    var LanguagesImpl = (0, foldingRange_1.FoldingRangeFeature)((0, moniker_1.MonikerFeature)((0, diagnostic_1.DiagnosticFeature)((0, inlayHint_1.InlayHintFeature)((0, inlineValue_1.InlineValueFeature)((0, typeHierarchy_1.TypeHierarchyFeature)((0, linkedEditingRange_1.LinkedEditingRangeFeature)((0, semanticTokens_1.SemanticTokensFeature)((0, callHierarchy_1.CallHierarchyFeature)(_LanguagesImpl)))))))));
    var _NotebooksImpl = class {
      constructor() {
      }
      attach(connection2) {
        this._connection = connection2;
      }
      get connection() {
        if (!this._connection) {
          throw new Error("Remote is not attached to a connection yet.");
        }
        return this._connection;
      }
      initialize(_capabilities) {
      }
      fillServerCapabilities(_capabilities) {
      }
      attachWorkDoneProgress(params) {
        return (0, progress_1.attachWorkDone)(this.connection, params);
      }
      attachPartialResultProgress(_type, params) {
        return (0, progress_1.attachPartialResult)(this.connection, params);
      }
    };
    exports2._NotebooksImpl = _NotebooksImpl;
    var NotebooksImpl = (0, notebook_1.NotebookSyncFeature)(_NotebooksImpl);
    function combineConsoleFeatures(one, two) {
      return function(Base) {
        return two(one(Base));
      };
    }
    exports2.combineConsoleFeatures = combineConsoleFeatures;
    function combineTelemetryFeatures(one, two) {
      return function(Base) {
        return two(one(Base));
      };
    }
    exports2.combineTelemetryFeatures = combineTelemetryFeatures;
    function combineTracerFeatures(one, two) {
      return function(Base) {
        return two(one(Base));
      };
    }
    exports2.combineTracerFeatures = combineTracerFeatures;
    function combineClientFeatures(one, two) {
      return function(Base) {
        return two(one(Base));
      };
    }
    exports2.combineClientFeatures = combineClientFeatures;
    function combineWindowFeatures(one, two) {
      return function(Base) {
        return two(one(Base));
      };
    }
    exports2.combineWindowFeatures = combineWindowFeatures;
    function combineWorkspaceFeatures(one, two) {
      return function(Base) {
        return two(one(Base));
      };
    }
    exports2.combineWorkspaceFeatures = combineWorkspaceFeatures;
    function combineLanguagesFeatures(one, two) {
      return function(Base) {
        return two(one(Base));
      };
    }
    exports2.combineLanguagesFeatures = combineLanguagesFeatures;
    function combineNotebooksFeatures(one, two) {
      return function(Base) {
        return two(one(Base));
      };
    }
    exports2.combineNotebooksFeatures = combineNotebooksFeatures;
    function combineFeatures(one, two) {
      function combine(one2, two2, func) {
        if (one2 && two2) {
          return func(one2, two2);
        } else if (one2) {
          return one2;
        } else {
          return two2;
        }
      }
      let result = {
        __brand: "features",
        console: combine(one.console, two.console, combineConsoleFeatures),
        tracer: combine(one.tracer, two.tracer, combineTracerFeatures),
        telemetry: combine(one.telemetry, two.telemetry, combineTelemetryFeatures),
        client: combine(one.client, two.client, combineClientFeatures),
        window: combine(one.window, two.window, combineWindowFeatures),
        workspace: combine(one.workspace, two.workspace, combineWorkspaceFeatures),
        languages: combine(one.languages, two.languages, combineLanguagesFeatures),
        notebooks: combine(one.notebooks, two.notebooks, combineNotebooksFeatures)
      };
      return result;
    }
    exports2.combineFeatures = combineFeatures;
    function createConnection2(connectionFactory, watchDog, factories) {
      const logger = factories && factories.console ? new (factories.console(RemoteConsoleImpl))() : new RemoteConsoleImpl();
      const connection2 = connectionFactory(logger);
      logger.rawAttach(connection2);
      const tracer = factories && factories.tracer ? new (factories.tracer(TracerImpl))() : new TracerImpl();
      const telemetry = factories && factories.telemetry ? new (factories.telemetry(TelemetryImpl))() : new TelemetryImpl();
      const client = factories && factories.client ? new (factories.client(RemoteClientImpl))() : new RemoteClientImpl();
      const remoteWindow = factories && factories.window ? new (factories.window(RemoteWindowImpl))() : new RemoteWindowImpl();
      const workspace = factories && factories.workspace ? new (factories.workspace(RemoteWorkspaceImpl))() : new RemoteWorkspaceImpl();
      const languages = factories && factories.languages ? new (factories.languages(LanguagesImpl))() : new LanguagesImpl();
      const notebooks = factories && factories.notebooks ? new (factories.notebooks(NotebooksImpl))() : new NotebooksImpl();
      const allRemotes = [logger, tracer, telemetry, client, remoteWindow, workspace, languages, notebooks];
      function asPromise(value) {
        if (value instanceof Promise) {
          return value;
        } else if (Is.thenable(value)) {
          return new Promise((resolve, reject) => {
            value.then((resolved) => resolve(resolved), (error) => reject(error));
          });
        } else {
          return Promise.resolve(value);
        }
      }
      let shutdownHandler = void 0;
      let initializeHandler = void 0;
      let exitHandler = void 0;
      let protocolConnection = {
        listen: () => connection2.listen(),
        sendRequest: (type, ...params) => connection2.sendRequest(Is.string(type) ? type : type.method, ...params),
        onRequest: (type, handler) => connection2.onRequest(type, handler),
        sendNotification: (type, param) => {
          const method = Is.string(type) ? type : type.method;
          return connection2.sendNotification(method, param);
        },
        onNotification: (type, handler) => connection2.onNotification(type, handler),
        onProgress: connection2.onProgress,
        sendProgress: connection2.sendProgress,
        onInitialize: (handler) => {
          initializeHandler = handler;
          return {
            dispose: () => {
              initializeHandler = void 0;
            }
          };
        },
        onInitialized: (handler) => connection2.onNotification(vscode_languageserver_protocol_1.InitializedNotification.type, handler),
        onShutdown: (handler) => {
          shutdownHandler = handler;
          return {
            dispose: () => {
              shutdownHandler = void 0;
            }
          };
        },
        onExit: (handler) => {
          exitHandler = handler;
          return {
            dispose: () => {
              exitHandler = void 0;
            }
          };
        },
        get console() {
          return logger;
        },
        get telemetry() {
          return telemetry;
        },
        get tracer() {
          return tracer;
        },
        get client() {
          return client;
        },
        get window() {
          return remoteWindow;
        },
        get workspace() {
          return workspace;
        },
        get languages() {
          return languages;
        },
        get notebooks() {
          return notebooks;
        },
        onDidChangeConfiguration: (handler) => connection2.onNotification(vscode_languageserver_protocol_1.DidChangeConfigurationNotification.type, handler),
        onDidChangeWatchedFiles: (handler) => connection2.onNotification(vscode_languageserver_protocol_1.DidChangeWatchedFilesNotification.type, handler),
        __textDocumentSync: void 0,
        onDidOpenTextDocument: (handler) => connection2.onNotification(vscode_languageserver_protocol_1.DidOpenTextDocumentNotification.type, handler),
        onDidChangeTextDocument: (handler) => connection2.onNotification(vscode_languageserver_protocol_1.DidChangeTextDocumentNotification.type, handler),
        onDidCloseTextDocument: (handler) => connection2.onNotification(vscode_languageserver_protocol_1.DidCloseTextDocumentNotification.type, handler),
        onWillSaveTextDocument: (handler) => connection2.onNotification(vscode_languageserver_protocol_1.WillSaveTextDocumentNotification.type, handler),
        onWillSaveTextDocumentWaitUntil: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.WillSaveTextDocumentWaitUntilRequest.type, handler),
        onDidSaveTextDocument: (handler) => connection2.onNotification(vscode_languageserver_protocol_1.DidSaveTextDocumentNotification.type, handler),
        sendDiagnostics: (params) => connection2.sendNotification(vscode_languageserver_protocol_1.PublishDiagnosticsNotification.type, params),
        onHover: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.HoverRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), void 0);
        }),
        onCompletion: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.CompletionRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onCompletionResolve: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.CompletionResolveRequest.type, handler),
        onSignatureHelp: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.SignatureHelpRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), void 0);
        }),
        onDeclaration: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DeclarationRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onDefinition: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DefinitionRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onTypeDefinition: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.TypeDefinitionRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onImplementation: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.ImplementationRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onReferences: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.ReferencesRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onDocumentHighlight: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DocumentHighlightRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onDocumentSymbol: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DocumentSymbolRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onWorkspaceSymbol: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.WorkspaceSymbolRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onWorkspaceSymbolResolve: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.WorkspaceSymbolResolveRequest.type, handler),
        onCodeAction: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.CodeActionRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onCodeActionResolve: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.CodeActionResolveRequest.type, (params, cancel) => {
          return handler(params, cancel);
        }),
        onCodeLens: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.CodeLensRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onCodeLensResolve: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.CodeLensResolveRequest.type, (params, cancel) => {
          return handler(params, cancel);
        }),
        onDocumentFormatting: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DocumentFormattingRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), void 0);
        }),
        onDocumentRangeFormatting: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DocumentRangeFormattingRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), void 0);
        }),
        onDocumentOnTypeFormatting: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DocumentOnTypeFormattingRequest.type, (params, cancel) => {
          return handler(params, cancel);
        }),
        onRenameRequest: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.RenameRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), void 0);
        }),
        onPrepareRename: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.PrepareRenameRequest.type, (params, cancel) => {
          return handler(params, cancel);
        }),
        onDocumentLinks: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DocumentLinkRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onDocumentLinkResolve: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DocumentLinkResolveRequest.type, (params, cancel) => {
          return handler(params, cancel);
        }),
        onDocumentColor: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DocumentColorRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onColorPresentation: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.ColorPresentationRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onFoldingRanges: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.FoldingRangeRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onSelectionRanges: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.SelectionRangeRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onExecuteCommand: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.ExecuteCommandRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), void 0);
        }),
        dispose: () => connection2.dispose()
      };
      for (let remote of allRemotes) {
        remote.attach(protocolConnection);
      }
      connection2.onRequest(vscode_languageserver_protocol_1.InitializeRequest.type, (params) => {
        watchDog.initialize(params);
        if (Is.string(params.trace)) {
          tracer.trace = vscode_languageserver_protocol_1.Trace.fromString(params.trace);
        }
        for (let remote of allRemotes) {
          remote.initialize(params.capabilities);
        }
        if (initializeHandler) {
          let result = initializeHandler(params, new vscode_languageserver_protocol_1.CancellationTokenSource().token, (0, progress_1.attachWorkDone)(connection2, params), void 0);
          return asPromise(result).then((value) => {
            if (value instanceof vscode_languageserver_protocol_1.ResponseError) {
              return value;
            }
            let result2 = value;
            if (!result2) {
              result2 = { capabilities: {} };
            }
            let capabilities = result2.capabilities;
            if (!capabilities) {
              capabilities = {};
              result2.capabilities = capabilities;
            }
            if (capabilities.textDocumentSync === void 0 || capabilities.textDocumentSync === null) {
              capabilities.textDocumentSync = Is.number(protocolConnection.__textDocumentSync) ? protocolConnection.__textDocumentSync : vscode_languageserver_protocol_1.TextDocumentSyncKind.None;
            } else if (!Is.number(capabilities.textDocumentSync) && !Is.number(capabilities.textDocumentSync.change)) {
              capabilities.textDocumentSync.change = Is.number(protocolConnection.__textDocumentSync) ? protocolConnection.__textDocumentSync : vscode_languageserver_protocol_1.TextDocumentSyncKind.None;
            }
            for (let remote of allRemotes) {
              remote.fillServerCapabilities(capabilities);
            }
            return result2;
          });
        } else {
          let result = { capabilities: { textDocumentSync: vscode_languageserver_protocol_1.TextDocumentSyncKind.None } };
          for (let remote of allRemotes) {
            remote.fillServerCapabilities(result.capabilities);
          }
          return result;
        }
      });
      connection2.onRequest(vscode_languageserver_protocol_1.ShutdownRequest.type, () => {
        watchDog.shutdownReceived = true;
        if (shutdownHandler) {
          return shutdownHandler(new vscode_languageserver_protocol_1.CancellationTokenSource().token);
        } else {
          return void 0;
        }
      });
      connection2.onNotification(vscode_languageserver_protocol_1.ExitNotification.type, () => {
        try {
          if (exitHandler) {
            exitHandler();
          }
        } finally {
          if (watchDog.shutdownReceived) {
            watchDog.exit(0);
          } else {
            watchDog.exit(1);
          }
        }
      });
      connection2.onNotification(vscode_languageserver_protocol_1.SetTraceNotification.type, (params) => {
        tracer.trace = vscode_languageserver_protocol_1.Trace.fromString(params.value);
      });
      return protocolConnection;
    }
    exports2.createConnection = createConnection2;
  }
});

// ../../node_modules/vscode-languageserver/lib/node/files.js
var require_files = __commonJS({
  "../../node_modules/vscode-languageserver/lib/node/files.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.resolveModulePath = exports2.FileSystem = exports2.resolveGlobalYarnPath = exports2.resolveGlobalNodePath = exports2.resolve = exports2.uriToFilePath = void 0;
    var url = require("url");
    var path = require("path");
    var fs = require("fs");
    var child_process_1 = require("child_process");
    function uriToFilePath(uri) {
      let parsed = url.parse(uri);
      if (parsed.protocol !== "file:" || !parsed.path) {
        return void 0;
      }
      let segments = parsed.path.split("/");
      for (var i = 0, len = segments.length; i < len; i++) {
        segments[i] = decodeURIComponent(segments[i]);
      }
      if (process.platform === "win32" && segments.length > 1) {
        let first = segments[0];
        let second = segments[1];
        if (first.length === 0 && second.length > 1 && second[1] === ":") {
          segments.shift();
        }
      }
      return path.normalize(segments.join("/"));
    }
    exports2.uriToFilePath = uriToFilePath;
    function isWindows() {
      return process.platform === "win32";
    }
    function resolve(moduleName, nodePath, cwd, tracer) {
      const nodePathKey = "NODE_PATH";
      const app = [
        "var p = process;",
        "p.on('message',function(m){",
        "if(m.c==='e'){",
        "p.exit(0);",
        "}",
        "else if(m.c==='rs'){",
        "try{",
        "var r=require.resolve(m.a);",
        "p.send({c:'r',s:true,r:r});",
        "}",
        "catch(err){",
        "p.send({c:'r',s:false});",
        "}",
        "}",
        "});"
      ].join("");
      return new Promise((resolve2, reject) => {
        let env = process.env;
        let newEnv = /* @__PURE__ */ Object.create(null);
        Object.keys(env).forEach((key) => newEnv[key] = env[key]);
        if (nodePath && fs.existsSync(nodePath)) {
          if (newEnv[nodePathKey]) {
            newEnv[nodePathKey] = nodePath + path.delimiter + newEnv[nodePathKey];
          } else {
            newEnv[nodePathKey] = nodePath;
          }
          if (tracer) {
            tracer(`NODE_PATH value is: ${newEnv[nodePathKey]}`);
          }
        }
        newEnv["ELECTRON_RUN_AS_NODE"] = "1";
        try {
          let cp = (0, child_process_1.fork)("", [], {
            cwd,
            env: newEnv,
            execArgv: ["-e", app]
          });
          if (cp.pid === void 0) {
            reject(new Error(`Starting process to resolve node module  ${moduleName} failed`));
            return;
          }
          cp.on("error", (error) => {
            reject(error);
          });
          cp.on("message", (message2) => {
            if (message2.c === "r") {
              cp.send({ c: "e" });
              if (message2.s) {
                resolve2(message2.r);
              } else {
                reject(new Error(`Failed to resolve module: ${moduleName}`));
              }
            }
          });
          let message = {
            c: "rs",
            a: moduleName
          };
          cp.send(message);
        } catch (error) {
          reject(error);
        }
      });
    }
    exports2.resolve = resolve;
    function resolveGlobalNodePath(tracer) {
      let npmCommand = "npm";
      const env = /* @__PURE__ */ Object.create(null);
      Object.keys(process.env).forEach((key) => env[key] = process.env[key]);
      env["NO_UPDATE_NOTIFIER"] = "true";
      const options = {
        encoding: "utf8",
        env
      };
      if (isWindows()) {
        npmCommand = "npm.cmd";
        options.shell = true;
      }
      let handler = () => {
      };
      try {
        process.on("SIGPIPE", handler);
        let stdout = (0, child_process_1.spawnSync)(npmCommand, ["config", "get", "prefix"], options).stdout;
        if (!stdout) {
          if (tracer) {
            tracer(`'npm config get prefix' didn't return a value.`);
          }
          return void 0;
        }
        let prefix = stdout.trim();
        if (tracer) {
          tracer(`'npm config get prefix' value is: ${prefix}`);
        }
        if (prefix.length > 0) {
          if (isWindows()) {
            return path.join(prefix, "node_modules");
          } else {
            return path.join(prefix, "lib", "node_modules");
          }
        }
        return void 0;
      } catch (err) {
        return void 0;
      } finally {
        process.removeListener("SIGPIPE", handler);
      }
    }
    exports2.resolveGlobalNodePath = resolveGlobalNodePath;
    function resolveGlobalYarnPath(tracer) {
      let yarnCommand = "yarn";
      let options = {
        encoding: "utf8"
      };
      if (isWindows()) {
        yarnCommand = "yarn.cmd";
        options.shell = true;
      }
      let handler = () => {
      };
      try {
        process.on("SIGPIPE", handler);
        let results = (0, child_process_1.spawnSync)(yarnCommand, ["global", "dir", "--json"], options);
        let stdout = results.stdout;
        if (!stdout) {
          if (tracer) {
            tracer(`'yarn global dir' didn't return a value.`);
            if (results.stderr) {
              tracer(results.stderr);
            }
          }
          return void 0;
        }
        let lines = stdout.trim().split(/\r?\n/);
        for (let line of lines) {
          try {
            let yarn = JSON.parse(line);
            if (yarn.type === "log") {
              return path.join(yarn.data, "node_modules");
            }
          } catch (e) {
          }
        }
        return void 0;
      } catch (err) {
        return void 0;
      } finally {
        process.removeListener("SIGPIPE", handler);
      }
    }
    exports2.resolveGlobalYarnPath = resolveGlobalYarnPath;
    var FileSystem;
    (function(FileSystem2) {
      let _isCaseSensitive = void 0;
      function isCaseSensitive() {
        if (_isCaseSensitive !== void 0) {
          return _isCaseSensitive;
        }
        if (process.platform === "win32") {
          _isCaseSensitive = false;
        } else {
          _isCaseSensitive = !fs.existsSync(__filename.toUpperCase()) || !fs.existsSync(__filename.toLowerCase());
        }
        return _isCaseSensitive;
      }
      FileSystem2.isCaseSensitive = isCaseSensitive;
      function isParent(parent, child) {
        if (isCaseSensitive()) {
          return path.normalize(child).indexOf(path.normalize(parent)) === 0;
        } else {
          return path.normalize(child).toLowerCase().indexOf(path.normalize(parent).toLowerCase()) === 0;
        }
      }
      FileSystem2.isParent = isParent;
    })(FileSystem || (exports2.FileSystem = FileSystem = {}));
    function resolveModulePath(workspaceRoot, moduleName, nodePath, tracer) {
      if (nodePath) {
        if (!path.isAbsolute(nodePath)) {
          nodePath = path.join(workspaceRoot, nodePath);
        }
        return resolve(moduleName, nodePath, nodePath, tracer).then((value) => {
          if (FileSystem.isParent(nodePath, value)) {
            return value;
          } else {
            return Promise.reject(new Error(`Failed to load ${moduleName} from node path location.`));
          }
        }).then(void 0, (_error) => {
          return resolve(moduleName, resolveGlobalNodePath(tracer), workspaceRoot, tracer);
        });
      } else {
        return resolve(moduleName, resolveGlobalNodePath(tracer), workspaceRoot, tracer);
      }
    }
    exports2.resolveModulePath = resolveModulePath;
  }
});

// ../../node_modules/vscode-languageserver-protocol/node.js
var require_node2 = __commonJS({
  "../../node_modules/vscode-languageserver-protocol/node.js"(exports2, module2) {
    "use strict";
    module2.exports = require_main3();
  }
});

// ../../node_modules/vscode-languageserver/lib/common/inlineCompletion.proposed.js
var require_inlineCompletion_proposed = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/inlineCompletion.proposed.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InlineCompletionFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var InlineCompletionFeature = (Base) => {
      return class extends Base {
        get inlineCompletion() {
          return {
            on: (handler) => {
              return this.connection.onRequest(vscode_languageserver_protocol_1.InlineCompletionRequest.type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params));
              });
            }
          };
        }
      };
    };
    exports2.InlineCompletionFeature = InlineCompletionFeature;
  }
});

// ../../node_modules/vscode-languageserver/lib/common/api.js
var require_api3 = __commonJS({
  "../../node_modules/vscode-languageserver/lib/common/api.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ProposedFeatures = exports2.NotebookDocuments = exports2.TextDocuments = exports2.SemanticTokensBuilder = void 0;
    var semanticTokens_1 = require_semanticTokens();
    Object.defineProperty(exports2, "SemanticTokensBuilder", { enumerable: true, get: function() {
      return semanticTokens_1.SemanticTokensBuilder;
    } });
    var ic = require_inlineCompletion_proposed();
    __exportStar(require_main3(), exports2);
    var textDocuments_1 = require_textDocuments();
    Object.defineProperty(exports2, "TextDocuments", { enumerable: true, get: function() {
      return textDocuments_1.TextDocuments;
    } });
    var notebook_1 = require_notebook();
    Object.defineProperty(exports2, "NotebookDocuments", { enumerable: true, get: function() {
      return notebook_1.NotebookDocuments;
    } });
    __exportStar(require_server(), exports2);
    var ProposedFeatures2;
    (function(ProposedFeatures3) {
      ProposedFeatures3.all = {
        __brand: "features",
        languages: ic.InlineCompletionFeature
      };
    })(ProposedFeatures2 || (exports2.ProposedFeatures = ProposedFeatures2 = {}));
  }
});

// ../../node_modules/vscode-languageserver/lib/node/main.js
var require_main4 = __commonJS({
  "../../node_modules/vscode-languageserver/lib/node/main.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createConnection = exports2.Files = void 0;
    var node_util_1 = require("node:util");
    var Is = require_is();
    var server_1 = require_server();
    var fm = require_files();
    var node_1 = require_node2();
    __exportStar(require_node2(), exports2);
    __exportStar(require_api3(), exports2);
    var Files;
    (function(Files2) {
      Files2.uriToFilePath = fm.uriToFilePath;
      Files2.resolveGlobalNodePath = fm.resolveGlobalNodePath;
      Files2.resolveGlobalYarnPath = fm.resolveGlobalYarnPath;
      Files2.resolve = fm.resolve;
      Files2.resolveModulePath = fm.resolveModulePath;
    })(Files || (exports2.Files = Files = {}));
    var _protocolConnection;
    function endProtocolConnection() {
      if (_protocolConnection === void 0) {
        return;
      }
      try {
        _protocolConnection.end();
      } catch (_err) {
      }
    }
    var _shutdownReceived = false;
    var exitTimer = void 0;
    function setupExitTimer() {
      const argName = "--clientProcessId";
      function runTimer(value) {
        try {
          let processId = parseInt(value);
          if (!isNaN(processId)) {
            exitTimer = setInterval(() => {
              try {
                process.kill(processId, 0);
              } catch (ex) {
                endProtocolConnection();
                process.exit(_shutdownReceived ? 0 : 1);
              }
            }, 3e3);
          }
        } catch (e) {
        }
      }
      for (let i = 2; i < process.argv.length; i++) {
        let arg = process.argv[i];
        if (arg === argName && i + 1 < process.argv.length) {
          runTimer(process.argv[i + 1]);
          return;
        } else {
          let args = arg.split("=");
          if (args[0] === argName) {
            runTimer(args[1]);
          }
        }
      }
    }
    setupExitTimer();
    var watchDog = {
      initialize: (params) => {
        const processId = params.processId;
        if (Is.number(processId) && exitTimer === void 0) {
          setInterval(() => {
            try {
              process.kill(processId, 0);
            } catch (ex) {
              process.exit(_shutdownReceived ? 0 : 1);
            }
          }, 3e3);
        }
      },
      get shutdownReceived() {
        return _shutdownReceived;
      },
      set shutdownReceived(value) {
        _shutdownReceived = value;
      },
      exit: (code) => {
        endProtocolConnection();
        process.exit(code);
      }
    };
    function createConnection2(arg1, arg2, arg3, arg4) {
      let factories;
      let input;
      let output;
      let options;
      if (arg1 !== void 0 && arg1.__brand === "features") {
        factories = arg1;
        arg1 = arg2;
        arg2 = arg3;
        arg3 = arg4;
      }
      if (node_1.ConnectionStrategy.is(arg1) || node_1.ConnectionOptions.is(arg1)) {
        options = arg1;
      } else {
        input = arg1;
        output = arg2;
        options = arg3;
      }
      return _createConnection(input, output, options, factories);
    }
    exports2.createConnection = createConnection2;
    function _createConnection(input, output, options, factories) {
      let stdio = false;
      if (!input && !output && process.argv.length > 2) {
        let port = void 0;
        let pipeName = void 0;
        let argv = process.argv.slice(2);
        for (let i = 0; i < argv.length; i++) {
          let arg = argv[i];
          if (arg === "--node-ipc") {
            input = new node_1.IPCMessageReader(process);
            output = new node_1.IPCMessageWriter(process);
            break;
          } else if (arg === "--stdio") {
            stdio = true;
            input = process.stdin;
            output = process.stdout;
            break;
          } else if (arg === "--socket") {
            port = parseInt(argv[i + 1]);
            break;
          } else if (arg === "--pipe") {
            pipeName = argv[i + 1];
            break;
          } else {
            var args = arg.split("=");
            if (args[0] === "--socket") {
              port = parseInt(args[1]);
              break;
            } else if (args[0] === "--pipe") {
              pipeName = args[1];
              break;
            }
          }
        }
        if (port) {
          let transport = (0, node_1.createServerSocketTransport)(port);
          input = transport[0];
          output = transport[1];
        } else if (pipeName) {
          let transport = (0, node_1.createServerPipeTransport)(pipeName);
          input = transport[0];
          output = transport[1];
        }
      }
      var commandLineMessage = "Use arguments of createConnection or set command line parameters: '--node-ipc', '--stdio' or '--socket={number}'";
      if (!input) {
        throw new Error("Connection input stream is not set. " + commandLineMessage);
      }
      if (!output) {
        throw new Error("Connection output stream is not set. " + commandLineMessage);
      }
      if (Is.func(input.read) && Is.func(input.on)) {
        let inputStream = input;
        inputStream.on("end", () => {
          endProtocolConnection();
          process.exit(_shutdownReceived ? 0 : 1);
        });
        inputStream.on("close", () => {
          endProtocolConnection();
          process.exit(_shutdownReceived ? 0 : 1);
        });
      }
      const connectionFactory = (logger) => {
        const result = (0, node_1.createProtocolConnection)(input, output, logger, options);
        if (stdio) {
          patchConsole(logger);
        }
        return result;
      };
      return (0, server_1.createConnection)(connectionFactory, watchDog, factories);
    }
    function patchConsole(logger) {
      function serialize(args) {
        return args.map((arg) => typeof arg === "string" ? arg : (0, node_util_1.inspect)(arg)).join(" ");
      }
      const counters = /* @__PURE__ */ new Map();
      console.assert = function assert(assertion, ...args) {
        if (assertion) {
          return;
        }
        if (args.length === 0) {
          logger.error("Assertion failed");
        } else {
          const [message, ...rest] = args;
          logger.error(`Assertion failed: ${message} ${serialize(rest)}`);
        }
      };
      console.count = function count(label = "default") {
        const message = String(label);
        let counter = counters.get(message) ?? 0;
        counter += 1;
        counters.set(message, counter);
        logger.log(`${message}: ${message}`);
      };
      console.countReset = function countReset(label) {
        if (label === void 0) {
          counters.clear();
        } else {
          counters.delete(String(label));
        }
      };
      console.debug = function debug(...args) {
        logger.log(serialize(args));
      };
      console.dir = function dir(arg, options) {
        logger.log((0, node_util_1.inspect)(arg, options));
      };
      console.log = function log(...args) {
        logger.log(serialize(args));
      };
      console.error = function error(...args) {
        logger.error(serialize(args));
      };
      console.trace = function trace(...args) {
        const stack = new Error().stack.replace(/(.+\n){2}/, "");
        let message = "Trace";
        if (args.length !== 0) {
          message += `: ${serialize(args)}`;
        }
        logger.log(`${message}
${stack}`);
      };
      console.warn = function warn(...args) {
        logger.warn(serialize(args));
      };
    }
  }
});

// ../../node_modules/vscode-languageserver/node.js
var require_node3 = __commonJS({
  "../../node_modules/vscode-languageserver/node.js"(exports2, module2) {
    "use strict";
    module2.exports = require_main4();
  }
});

// src/server.ts
var import_node = __toESM(require_node3());

// ../../node_modules/vscode-languageserver-textdocument/lib/esm/main.js
var FullTextDocument = class _FullTextDocument {
  constructor(uri, languageId, version, content) {
    this._uri = uri;
    this._languageId = languageId;
    this._version = version;
    this._content = content;
    this._lineOffsets = void 0;
  }
  get uri() {
    return this._uri;
  }
  get languageId() {
    return this._languageId;
  }
  get version() {
    return this._version;
  }
  getText(range) {
    if (range) {
      const start = this.offsetAt(range.start);
      const end = this.offsetAt(range.end);
      return this._content.substring(start, end);
    }
    return this._content;
  }
  update(changes, version) {
    for (const change of changes) {
      if (_FullTextDocument.isIncremental(change)) {
        const range = getWellformedRange(change.range);
        const startOffset = this.offsetAt(range.start);
        const endOffset = this.offsetAt(range.end);
        this._content = this._content.substring(0, startOffset) + change.text + this._content.substring(endOffset, this._content.length);
        const startLine = Math.max(range.start.line, 0);
        const endLine = Math.max(range.end.line, 0);
        let lineOffsets = this._lineOffsets;
        const addedLineOffsets = computeLineOffsets(change.text, false, startOffset);
        if (endLine - startLine === addedLineOffsets.length) {
          for (let i = 0, len = addedLineOffsets.length; i < len; i++) {
            lineOffsets[i + startLine + 1] = addedLineOffsets[i];
          }
        } else {
          if (addedLineOffsets.length < 1e4) {
            lineOffsets.splice(startLine + 1, endLine - startLine, ...addedLineOffsets);
          } else {
            this._lineOffsets = lineOffsets = lineOffsets.slice(0, startLine + 1).concat(addedLineOffsets, lineOffsets.slice(endLine + 1));
          }
        }
        const diff = change.text.length - (endOffset - startOffset);
        if (diff !== 0) {
          for (let i = startLine + 1 + addedLineOffsets.length, len = lineOffsets.length; i < len; i++) {
            lineOffsets[i] = lineOffsets[i] + diff;
          }
        }
      } else if (_FullTextDocument.isFull(change)) {
        this._content = change.text;
        this._lineOffsets = void 0;
      } else {
        throw new Error("Unknown change event received");
      }
    }
    this._version = version;
  }
  getLineOffsets() {
    if (this._lineOffsets === void 0) {
      this._lineOffsets = computeLineOffsets(this._content, true);
    }
    return this._lineOffsets;
  }
  positionAt(offset) {
    offset = Math.max(Math.min(offset, this._content.length), 0);
    const lineOffsets = this.getLineOffsets();
    let low = 0, high = lineOffsets.length;
    if (high === 0) {
      return { line: 0, character: offset };
    }
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (lineOffsets[mid] > offset) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    const line = low - 1;
    offset = this.ensureBeforeEOL(offset, lineOffsets[line]);
    return { line, character: offset - lineOffsets[line] };
  }
  offsetAt(position) {
    const lineOffsets = this.getLineOffsets();
    if (position.line >= lineOffsets.length) {
      return this._content.length;
    } else if (position.line < 0) {
      return 0;
    }
    const lineOffset = lineOffsets[position.line];
    if (position.character <= 0) {
      return lineOffset;
    }
    const nextLineOffset = position.line + 1 < lineOffsets.length ? lineOffsets[position.line + 1] : this._content.length;
    const offset = Math.min(lineOffset + position.character, nextLineOffset);
    return this.ensureBeforeEOL(offset, lineOffset);
  }
  ensureBeforeEOL(offset, lineOffset) {
    while (offset > lineOffset && isEOL(this._content.charCodeAt(offset - 1))) {
      offset--;
    }
    return offset;
  }
  get lineCount() {
    return this.getLineOffsets().length;
  }
  static isIncremental(event) {
    const candidate = event;
    return candidate !== void 0 && candidate !== null && typeof candidate.text === "string" && candidate.range !== void 0 && (candidate.rangeLength === void 0 || typeof candidate.rangeLength === "number");
  }
  static isFull(event) {
    const candidate = event;
    return candidate !== void 0 && candidate !== null && typeof candidate.text === "string" && candidate.range === void 0 && candidate.rangeLength === void 0;
  }
};
var TextDocument;
(function(TextDocument2) {
  function create(uri, languageId, version, content) {
    return new FullTextDocument(uri, languageId, version, content);
  }
  TextDocument2.create = create;
  function update(document, changes, version) {
    if (document instanceof FullTextDocument) {
      document.update(changes, version);
      return document;
    } else {
      throw new Error("TextDocument.update: document must be created by TextDocument.create");
    }
  }
  TextDocument2.update = update;
  function applyEdits(document, edits) {
    const text = document.getText();
    const sortedEdits = mergeSort(edits.map(getWellformedEdit), (a, b) => {
      const diff = a.range.start.line - b.range.start.line;
      if (diff === 0) {
        return a.range.start.character - b.range.start.character;
      }
      return diff;
    });
    let lastModifiedOffset = 0;
    const spans = [];
    for (const e of sortedEdits) {
      const startOffset = document.offsetAt(e.range.start);
      if (startOffset < lastModifiedOffset) {
        throw new Error("Overlapping edit");
      } else if (startOffset > lastModifiedOffset) {
        spans.push(text.substring(lastModifiedOffset, startOffset));
      }
      if (e.newText.length) {
        spans.push(e.newText);
      }
      lastModifiedOffset = document.offsetAt(e.range.end);
    }
    spans.push(text.substr(lastModifiedOffset));
    return spans.join("");
  }
  TextDocument2.applyEdits = applyEdits;
})(TextDocument || (TextDocument = {}));
function mergeSort(data, compare) {
  if (data.length <= 1) {
    return data;
  }
  const p = data.length / 2 | 0;
  const left = data.slice(0, p);
  const right = data.slice(p);
  mergeSort(left, compare);
  mergeSort(right, compare);
  let leftIdx = 0;
  let rightIdx = 0;
  let i = 0;
  while (leftIdx < left.length && rightIdx < right.length) {
    const ret = compare(left[leftIdx], right[rightIdx]);
    if (ret <= 0) {
      data[i++] = left[leftIdx++];
    } else {
      data[i++] = right[rightIdx++];
    }
  }
  while (leftIdx < left.length) {
    data[i++] = left[leftIdx++];
  }
  while (rightIdx < right.length) {
    data[i++] = right[rightIdx++];
  }
  return data;
}
function computeLineOffsets(text, isAtLineStart, textOffset = 0) {
  const result = isAtLineStart ? [textOffset] : [];
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    if (isEOL(ch)) {
      if (ch === 13 && i + 1 < text.length && text.charCodeAt(i + 1) === 10) {
        i++;
      }
      result.push(textOffset + i + 1);
    }
  }
  return result;
}
function isEOL(char) {
  return char === 13 || char === 10;
}
function getWellformedRange(range) {
  const start = range.start;
  const end = range.end;
  if (start.line > end.line || start.line === end.line && start.character > end.character) {
    return { start: end, end: start };
  }
  return range;
}
function getWellformedEdit(textEdit) {
  const range = getWellformedRange(textEdit.range);
  if (range !== textEdit.range) {
    return { newText: textEdit.newText, range };
  }
  return textEdit;
}

// src/parser/lexer.ts
var TokenKind = /* @__PURE__ */ ((TokenKind2) => {
  TokenKind2["IntLiteral"] = "IntLiteral";
  TokenKind2["FloatLiteral"] = "FloatLiteral";
  TokenKind2["StringLiteral"] = "StringLiteral";
  TokenKind2["CharLiteral"] = "CharLiteral";
  TokenKind2["InterpolatedStringLiteral"] = "InterpolatedStringLiteral";
  TokenKind2["RawStringLiteral"] = "RawStringLiteral";
  TokenKind2["BytesLiteral"] = "BytesLiteral";
  TokenKind2["MultilineStringLiteral"] = "MultilineStringLiteral";
  TokenKind2["BoolLiteral"] = "BoolLiteral";
  TokenKind2["NoneLiteral"] = "NoneLiteral";
  TokenKind2["TemplateFenceOpen"] = "TemplateFenceOpen";
  TokenKind2["TemplateFenceClose"] = "TemplateFenceClose";
  TokenKind2["TemplateContent"] = "TemplateContent";
  TokenKind2["TemplateExprOpen"] = "TemplateExprOpen";
  TokenKind2["TemplateExprClose"] = "TemplateExprClose";
  TokenKind2["TemplateDirOpen"] = "TemplateDirOpen";
  TokenKind2["TemplateDirClose"] = "TemplateDirClose";
  TokenKind2["TemplateComment"] = "TemplateComment";
  TokenKind2["Identifier"] = "Identifier";
  TokenKind2["TypeIdentifier"] = "TypeIdentifier";
  TokenKind2["LifetimeLabel"] = "LifetimeLabel";
  TokenKind2["MacroSplice"] = "MacroSplice";
  TokenKind2["Let"] = "let";
  TokenKind2["Var"] = "var";
  TokenKind2["Const"] = "const";
  TokenKind2["Fun"] = "func";
  TokenKind2["Gen"] = "gen";
  TokenKind2["Macro"] = "macro";
  TokenKind2["Quote"] = "quote";
  TokenKind2["Return"] = "return";
  TokenKind2["Yield"] = "yield";
  TokenKind2["Suspend"] = "suspend";
  TokenKind2["If"] = "if";
  TokenKind2["Else"] = "else";
  TokenKind2["For"] = "for";
  TokenKind2["While"] = "while";
  TokenKind2["Do"] = "do";
  TokenKind2["Match"] = "match";
  TokenKind2["Break"] = "break";
  TokenKind2["Continue"] = "continue";
  TokenKind2["Defer"] = "defer";
  TokenKind2["With"] = "with";
  TokenKind2["Portal"] = "portal";
  TokenKind2["Async"] = "async";
  TokenKind2["Await"] = "await";
  TokenKind2["Spawn"] = "spawn";
  TokenKind2["Group"] = "group";
  TokenKind2["Concurrent"] = "concurrent";
  TokenKind2["Try"] = "try";
  TokenKind2["Catch"] = "catch";
  TokenKind2["Finally"] = "finally";
  TokenKind2["Throw"] = "throw";
  TokenKind2["Attempt"] = "attempt";
  TokenKind2["Unreachable"] = "unreachable";
  TokenKind2["From"] = "from";
  TokenKind2["Import"] = "import";
  TokenKind2["As"] = "as";
  TokenKind2["In"] = "in";
  TokenKind2["Is"] = "is";
  TokenKind2["Instanceof"] = "instanceof";
  TokenKind2["Typeof"] = "typeof";
  TokenKind2["Not"] = "not";
  TokenKind2["Bnot"] = "bnot";
  TokenKind2["Del"] = "del";
  TokenKind2["Global"] = "global";
  TokenKind2["Nonlocal"] = "nonlocal";
  TokenKind2["Pub"] = "pub";
  TokenKind2["Static"] = "static";
  TokenKind2["Override"] = "override";
  TokenKind2["Final"] = "final";
  TokenKind2["Sealed"] = "sealed";
  TokenKind2["Class"] = "class";
  TokenKind2["Struct"] = "struct";
  TokenKind2["Abstract"] = "abstract";
  TokenKind2["Dynamic"] = "dynamic";
  TokenKind2["Interface"] = "interface";
  TokenKind2["Implements"] = "implements";
  TokenKind2["Enum"] = "enum";
  TokenKind2["Type"] = "type";
  TokenKind2["Namespace"] = "namespace";
  TokenKind2["Template"] = "template";
  TokenKind2["Foundation"] = "foundation";
  TokenKind2["Overlay"] = "overlay";
  TokenKind2["Onto"] = "onto";
  TokenKind2["Part"] = "part";
  TokenKind2["Extern"] = "extern";
  TokenKind2["Js"] = "js";
  TokenKind2["Native"] = "native";
  TokenKind2["Val"] = "val";
  TokenKind2["New"] = "new";
  TokenKind2["Box"] = "box";
  TokenKind2["True"] = "true";
  TokenKind2["False"] = "false";
  TokenKind2["None"] = "None";
  TokenKind2["This"] = "this";
  TokenKind2["Self"] = "Self";
  TokenKind2["Super"] = "super";
  TokenKind2["Fn"] = "fn";
  TokenKind2["Once"] = "once";
  TokenKind2["Operator"] = "operator";
  TokenKind2["Weak"] = "weak";
  TokenKind2["Unowned"] = "unowned";
  TokenKind2["Arc"] = "arc";
  TokenKind2["Borrow"] = "borrow";
  TokenKind2["Excl"] = "excl";
  TokenKind2["Unique"] = "unique";
  TokenKind2["Local"] = "local";
  TokenKind2["Shared"] = "shared";
  TokenKind2["Onstack"] = "onstack";
  TokenKind2["Lifetime"] = "lifetime";
  TokenKind2["Noescape"] = "noescape";
  TokenKind2["Consume"] = "consume";
  TokenKind2["Noreturn"] = "noreturn";
  TokenKind2["Impossible"] = "impossible";
  TokenKind2["Prefer"] = "prefer";
  TokenKind2["Compiled"] = "compiled";
  TokenKind2["Scripted"] = "scripted";
  TokenKind2["Dual"] = "dual";
  TokenKind2["Freestanding"] = "freestanding";
  TokenKind2["Portable"] = "portable";
  TokenKind2["Reads"] = "reads";
  TokenKind2["Edits"] = "edits";
  TokenKind2["Takes"] = "takes";
  TokenKind2["Shares"] = "shares";
  TokenKind2["Modifier"] = "modifier";
  TokenKind2["Safe"] = "safe";
  TokenKind2["Synchronized"] = "synchronized";
  TokenKind2["Unsafe"] = "unsafe";
  TokenKind2["Requires"] = "requires";
  TokenKind2["Distinct"] = "distinct";
  TokenKind2["Atomic"] = "atomic";
  TokenKind2["Asm"] = "asm";
  TokenKind2["Volatile"] = "volatile";
  TokenKind2["Where"] = "where";
  TokenKind2["SizeOf"] = "size_of";
  TokenKind2["AlignOf"] = "align_of";
  TokenKind2["Reinterpret"] = "reinterpret";
  TokenKind2["ReinterpretChecked"] = "reinterpretChecked";
  TokenKind2["Get"] = "get";
  TokenKind2["Set"] = "set";
  TokenKind2["Plus"] = "+";
  TokenKind2["Minus"] = "-";
  TokenKind2["Star"] = "*";
  TokenKind2["StarStar"] = "**";
  TokenKind2["Slash"] = "/";
  TokenKind2["SlashSlash"] = "//";
  TokenKind2["Percent"] = "%";
  TokenKind2["Assign"] = "=";
  TokenKind2["PlusAssign"] = "+=";
  TokenKind2["MinusAssign"] = "-=";
  TokenKind2["StarAssign"] = "*=";
  TokenKind2["SlashAssign"] = "/=";
  TokenKind2["SlashSlashAssign"] = "//=";
  TokenKind2["PercentAssign"] = "%=";
  TokenKind2["StarStarAssign"] = "**=";
  TokenKind2["AmpersandAssign"] = "&=";
  TokenKind2["PipeAssign"] = "|=";
  TokenKind2["CaretAssign"] = "^=";
  TokenKind2["ShiftLeftAssign"] = "<<=";
  TokenKind2["ShiftRightAssign"] = ">>=";
  TokenKind2["EqualEqual"] = "==";
  TokenKind2["BangEqual"] = "!=";
  TokenKind2["LessThan"] = "<";
  TokenKind2["LessEqual"] = "<=";
  TokenKind2["GreaterThan"] = ">";
  TokenKind2["GreaterEqual"] = ">=";
  TokenKind2["ShiftLeft"] = "<<";
  TokenKind2["ShiftRight"] = ">>";
  TokenKind2["And"] = "&&";
  TokenKind2["Or"] = "||";
  TokenKind2["Bang"] = "!";
  TokenKind2["Ampersand"] = "&";
  TokenKind2["Caret"] = "^";
  TokenKind2["Tilde"] = "~";
  TokenKind2["Question"] = "?";
  TokenKind2["QuestionDot"] = "?.";
  TokenKind2["QuestionQuestion"] = "??";
  TokenKind2["Arrow"] = "=>";
  TokenKind2["Pipe"] = "|";
  TokenKind2["Dot"] = ".";
  TokenKind2["DotDot"] = "..";
  TokenKind2["DotDotEqual"] = "..=";
  TokenKind2["DotDotDot"] = "...";
  TokenKind2["Colon"] = ":";
  TokenKind2["Semicolon"] = ";";
  TokenKind2["Comma"] = ",";
  TokenKind2["At"] = "@";
  TokenKind2["BangLeftBrace"] = "!{";
  TokenKind2["LeftParen"] = "(";
  TokenKind2["RightParen"] = ")";
  TokenKind2["LeftBrace"] = "{";
  TokenKind2["RightBrace"] = "}";
  TokenKind2["LeftBracket"] = "[";
  TokenKind2["RightBracket"] = "]";
  TokenKind2["LineComment"] = "LineComment";
  TokenKind2["DocComment"] = "DocComment";
  TokenKind2["BlockComment"] = "BlockComment";
  TokenKind2["EOF"] = "EOF";
  TokenKind2["Error"] = "Error";
  return TokenKind2;
})(TokenKind || {});
var KEYWORD_TABLE = {
  let: "let" /* Let */,
  var: "var" /* Var */,
  const: "const" /* Const */,
  func: "func" /* Fun */,
  gen: "gen" /* Gen */,
  macro: "macro" /* Macro */,
  quote: "quote" /* Quote */,
  return: "return" /* Return */,
  yield: "yield" /* Yield */,
  suspend: "suspend" /* Suspend */,
  if: "if" /* If */,
  else: "else" /* Else */,
  for: "for" /* For */,
  while: "while" /* While */,
  do: "do" /* Do */,
  match: "match" /* Match */,
  break: "break" /* Break */,
  continue: "continue" /* Continue */,
  defer: "defer" /* Defer */,
  with: "with" /* With */,
  portal: "portal" /* Portal */,
  async: "async" /* Async */,
  await: "await" /* Await */,
  spawn: "spawn" /* Spawn */,
  group: "group" /* Group */,
  concurrent: "concurrent" /* Concurrent */,
  try: "try" /* Try */,
  catch: "catch" /* Catch */,
  finally: "finally" /* Finally */,
  throw: "throw" /* Throw */,
  attempt: "attempt" /* Attempt */,
  unreachable: "unreachable" /* Unreachable */,
  from: "from" /* From */,
  import: "import" /* Import */,
  as: "as" /* As */,
  in: "in" /* In */,
  is: "is" /* Is */,
  instanceof: "instanceof" /* Instanceof */,
  typeof: "typeof" /* Typeof */,
  not: "not" /* Not */,
  and: "&&" /* And */,
  or: "||" /* Or */,
  bnot: "bnot" /* Bnot */,
  del: "del" /* Del */,
  global: "global" /* Global */,
  nonlocal: "nonlocal" /* Nonlocal */,
  pub: "pub" /* Pub */,
  static: "static" /* Static */,
  override: "override" /* Override */,
  final: "final" /* Final */,
  sealed: "sealed" /* Sealed */,
  class: "class" /* Class */,
  struct: "struct" /* Struct */,
  abstract: "abstract" /* Abstract */,
  dynamic: "dynamic" /* Dynamic */,
  interface: "interface" /* Interface */,
  implements: "implements" /* Implements */,
  enum: "enum" /* Enum */,
  type: "type" /* Type */,
  namespace: "namespace" /* Namespace */,
  template: "template" /* Template */,
  foundation: "foundation" /* Foundation */,
  overlay: "overlay" /* Overlay */,
  onto: "onto" /* Onto */,
  part: "part" /* Part */,
  extern: "extern" /* Extern */,
  js: "js" /* Js */,
  native: "native" /* Native */,
  val: "val" /* Val */,
  new: "new" /* New */,
  box: "box" /* Box */,
  true: "true" /* True */,
  false: "false" /* False */,
  None: "None" /* None */,
  this: "this" /* This */,
  Self: "Self" /* Self */,
  super: "super" /* Super */,
  fn: "fn" /* Fn */,
  once: "once" /* Once */,
  operator: "operator" /* Operator */,
  weak: "weak" /* Weak */,
  unowned: "unowned" /* Unowned */,
  arc: "arc" /* Arc */,
  borrow: "borrow" /* Borrow */,
  excl: "excl" /* Excl */,
  unique: "unique" /* Unique */,
  local: "local" /* Local */,
  shared: "shared" /* Shared */,
  onstack: "onstack" /* Onstack */,
  lifetime: "lifetime" /* Lifetime */,
  noescape: "noescape" /* Noescape */,
  consume: "consume" /* Consume */,
  noreturn: "noreturn" /* Noreturn */,
  impossible: "impossible" /* Impossible */,
  prefer: "prefer" /* Prefer */,
  compiled: "compiled" /* Compiled */,
  scripted: "scripted" /* Scripted */,
  dual: "dual" /* Dual */,
  freestanding: "freestanding" /* Freestanding */,
  portable: "portable" /* Portable */,
  reads: "reads" /* Reads */,
  edits: "edits" /* Edits */,
  takes: "takes" /* Takes */,
  shares: "shares" /* Shares */,
  modifier: "modifier" /* Modifier */,
  safe: "safe" /* Safe */,
  synchronized: "synchronized" /* Synchronized */,
  unsafe: "unsafe" /* Unsafe */,
  requires: "requires" /* Requires */,
  distinct: "distinct" /* Distinct */,
  atomic: "atomic" /* Atomic */,
  asm: "asm" /* Asm */,
  volatile: "volatile" /* Volatile */,
  where: "where" /* Where */,
  size_of: "size_of" /* SizeOf */,
  align_of: "align_of" /* AlignOf */,
  reinterpret: "reinterpret" /* Reinterpret */,
  reinterpretChecked: "reinterpretChecked" /* ReinterpretChecked */,
  get: "get" /* Get */,
  set: "set" /* Set */
};
var KEYWORDS = new Map(Object.entries(KEYWORD_TABLE));
var KEYWORD_KINDS = new Set(KEYWORDS.values());
var RESERVED_WORDS = /* @__PURE__ */ new Set([
  "abstract",
  "and",
  "as",
  "async",
  "attempt",
  "await",
  "bnot",
  "borrow",
  "break",
  "catch",
  "class",
  "const",
  "continue",
  "defer",
  "del",
  "do",
  "dynamic",
  "else",
  "enum",
  "extern",
  "false",
  "final",
  "finally",
  "fn",
  "for",
  "from",
  "func",
  "gen",
  "global",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "is",
  "let",
  "lifetime",
  "macro",
  "match",
  "new",
  "namespace",
  "noescape",
  "nonlocal",
  "not",
  "onstack",
  "or",
  "override",
  "portal",
  "prefer",
  "pub",
  "return",
  "sealed",
  "static",
  "super",
  "struct",
  "suspend",
  "throw",
  "true",
  "try",
  "type",
  "Self",
  "this",
  "typeof",
  "unique",
  "var",
  "volatile",
  "where",
  "while",
  "with",
  "yield",
  "consume",
  "reads",
  "edits",
  "takes",
  "shares",
  "modifier",
  "safe",
  "synchronized",
  "unsafe",
  "requires",
  "atomic",
  "unreachable",
  "local",
  "shared"
]);
function isReservedWord(text) {
  return RESERVED_WORDS.has(text);
}
var RESERVED_WORD_SPELLINGS = [...RESERVED_WORDS];
function isKeywordKind(kind) {
  return KEYWORD_KINDS.has(kind);
}
var KEYWORD_SPELLINGS = [...KEYWORDS.keys()];
var SINGLE_CHAR_TOKENS = /* @__PURE__ */ new Map([
  ["+", "+" /* Plus */],
  ["-", "-" /* Minus */],
  ["*", "*" /* Star */],
  ["/", "/" /* Slash */],
  ["%", "%" /* Percent */],
  ["=", "=" /* Assign */],
  ["<", "<" /* LessThan */],
  [">", ">" /* GreaterThan */],
  ["!", "!" /* Bang */],
  ["&", "&" /* Ampersand */],
  ["^", "^" /* Caret */],
  ["~", "~" /* Tilde */],
  ["?", "?" /* Question */],
  ["|", "|" /* Pipe */],
  [".", "." /* Dot */],
  [":", ":" /* Colon */],
  [";", ";" /* Semicolon */],
  [",", "," /* Comma */],
  ["@", "@" /* At */],
  ["(", "(" /* LeftParen */],
  [")", ")" /* RightParen */],
  ["{", "{" /* LeftBrace */],
  ["}", "}" /* RightBrace */],
  ["[", "[" /* LeftBracket */],
  ["]", "]" /* RightBracket */]
]);
var UNICODE_LETTER = /^\p{L}$/u;
var UNICODE_DIGIT = /^\p{Nd}$/u;
var Lexer = class {
  source;
  pos = 0;
  line = 0;
  column = 0;
  tokens = [];
  constructor(source) {
    this.source = source;
  }
  tokenize() {
    this.tokens = [];
    while (this.pos < this.source.length) {
      this.skipWhitespace();
      if (this.pos >= this.source.length)
        break;
      const token = this.nextToken();
      if (token) {
        this.tokens.push(token);
      }
    }
    this.tokens.push({
      kind: "EOF" /* EOF */,
      text: "",
      offset: this.pos,
      line: this.line,
      column: this.column,
      length: 0,
      endLine: this.line,
      endColumn: this.column
    });
    return this.tokens;
  }
  peek(offset = 0) {
    return this.source[this.pos + offset] ?? "";
  }
  advance(count = 1) {
    let result = "";
    for (let i = 0; i < count && this.pos < this.source.length; i++) {
      const ch = this.source[this.pos++];
      result += ch;
      if (ch === "\n") {
        this.line++;
        this.column = 0;
      } else {
        this.column++;
      }
    }
    return result;
  }
  skipWhitespace() {
    while (this.pos < this.source.length) {
      const ch = this.peek();
      if (ch === " " || ch === "	" || ch === "\r" || ch === "\n") {
        this.advance();
      } else {
        break;
      }
    }
  }
  makeToken(kind, startOffset, startLine, startCol) {
    const text = this.source.slice(startOffset, this.pos);
    return {
      kind,
      text,
      offset: startOffset,
      line: startLine,
      column: startCol,
      length: this.pos - startOffset,
      endLine: this.line,
      endColumn: this.column
    };
  }
  nextToken() {
    const startOffset = this.pos;
    const startLine = this.line;
    const startCol = this.column;
    const ch = this.peek();
    if (ch === "#") {
      if (this.peek(1) === "#") {
        return this.readDocComment(startOffset, startLine, startCol);
      }
      return this.readHashLineComment(startOffset, startLine, startCol);
    }
    if (ch === "/" && this.peek(1) === "*") {
      return this.readBlockComment(startOffset, startLine, startCol);
    }
    if (ch === "`" && this.peek(1) === "`" && this.peek(2) === "`") {
      return this.readTemplateFence(startOffset, startLine, startCol);
    }
    if ((ch === "r" || ch === "i" || ch === "b" || ch === "c") && (this.peek(1) === '"' || this.peek(1) === "'")) {
      const prefix = this.advance();
      const q = this.peek();
      if (this.peek(1) === q && this.peek(2) === q) {
        return this.readMultilineString(startOffset, startLine, startCol, q, prefix);
      }
      const kind = prefix === "r" ? "RawStringLiteral" /* RawStringLiteral */ : prefix === "i" ? "InterpolatedStringLiteral" /* InterpolatedStringLiteral */ : prefix === "c" ? "CharLiteral" /* CharLiteral */ : "BytesLiteral" /* BytesLiteral */;
      return this.readString(startOffset, startLine, startCol, q, kind);
    }
    if (ch === '"' && this.peek(1) === '"' && this.peek(2) === '"' || ch === "'" && this.peek(1) === "'" && this.peek(2) === "'") {
      return this.readMultilineString(startOffset, startLine, startCol, ch, "");
    }
    if (ch === '"' || ch === "'") {
      return this.readString(startOffset, startLine, startCol, ch, "StringLiteral" /* StringLiteral */);
    }
    if (this.isDigit(ch)) {
      return this.readNumber(startOffset, startLine, startCol);
    }
    if (this.isIdentStart(ch)) {
      return this.readIdentifier(startOffset, startLine, startCol);
    }
    if (ch === "$" && this.peek(1) === "{") {
      let i = 2;
      while (this.isIdentContinue(this.peek(i)))
        i++;
      if (i > 2 && this.peek(i) === "}") {
        this.advance(i + 1);
        return this.makeToken("MacroSplice" /* MacroSplice */, startOffset, startLine, startCol);
      }
    }
    if (ch === "!" && this.peek(1) === "{" && this.isDynamicFieldAhead()) {
      this.advance(2);
      return this.makeToken("!{" /* BangLeftBrace */, startOffset, startLine, startCol);
    }
    if (ch === "~" && (this.peek(1) >= "a" && this.peek(1) <= "z" || this.peek(1) === "_")) {
      this.advance();
      while (this.pos < this.source.length && this.isIdentContinue(this.peek())) {
        this.advance();
      }
      return this.makeToken("LifetimeLabel" /* LifetimeLabel */, startOffset, startLine, startCol);
    }
    if (ch === "=" && this.peek(1) === ">") {
      this.advance(2);
      return this.makeToken("=>" /* Arrow */, startOffset, startLine, startCol);
    }
    if (ch === "=" && this.peek(1) === "=") {
      this.advance(2);
      return this.makeToken("==" /* EqualEqual */, startOffset, startLine, startCol);
    }
    if (ch === "!" && this.peek(1) === "=") {
      this.advance(2);
      return this.makeToken("!=" /* BangEqual */, startOffset, startLine, startCol);
    }
    if (ch === "<" && this.peek(1) === "<") {
      if (this.peek(2) === "=") {
        this.advance(3);
        return this.makeToken("<<=" /* ShiftLeftAssign */, startOffset, startLine, startCol);
      }
      this.advance(2);
      return this.makeToken("<<" /* ShiftLeft */, startOffset, startLine, startCol);
    }
    if (ch === ">" && this.peek(1) === ">") {
      if (this.peek(2) === "=") {
        this.advance(3);
        return this.makeToken(">>=" /* ShiftRightAssign */, startOffset, startLine, startCol);
      }
      this.advance(2);
      return this.makeToken(">>" /* ShiftRight */, startOffset, startLine, startCol);
    }
    if (ch === "<" && this.peek(1) === "=") {
      this.advance(2);
      return this.makeToken("<=" /* LessEqual */, startOffset, startLine, startCol);
    }
    if (ch === ">" && this.peek(1) === "=") {
      this.advance(2);
      return this.makeToken(">=" /* GreaterEqual */, startOffset, startLine, startCol);
    }
    if (ch === "&" && this.peek(1) === "&") {
      this.advance(2);
      return this.makeToken("&&" /* And */, startOffset, startLine, startCol);
    }
    if (ch === "|" && this.peek(1) === "|") {
      this.advance(2);
      return this.makeToken("||" /* Or */, startOffset, startLine, startCol);
    }
    if (ch === "?" && this.peek(1) === ".") {
      this.advance(2);
      return this.makeToken("?." /* QuestionDot */, startOffset, startLine, startCol);
    }
    if (ch === "?" && this.peek(1) === "?") {
      this.advance(2);
      return this.makeToken("??" /* QuestionQuestion */, startOffset, startLine, startCol);
    }
    if (ch === "*" && this.peek(1) === "*") {
      if (this.peek(2) === "=") {
        this.advance(3);
        return this.makeToken("**=" /* StarStarAssign */, startOffset, startLine, startCol);
      }
      this.advance(2);
      return this.makeToken("**" /* StarStar */, startOffset, startLine, startCol);
    }
    if (ch === "/" && this.peek(1) === "/") {
      if (this.peek(2) === "=") {
        this.advance(3);
        return this.makeToken("//=" /* SlashSlashAssign */, startOffset, startLine, startCol);
      }
      this.advance(2);
      return this.makeToken("//" /* SlashSlash */, startOffset, startLine, startCol);
    }
    if (ch === "+" && this.peek(1) === "=") {
      this.advance(2);
      return this.makeToken("+=" /* PlusAssign */, startOffset, startLine, startCol);
    }
    if (ch === "-" && this.peek(1) === "=") {
      this.advance(2);
      return this.makeToken("-=" /* MinusAssign */, startOffset, startLine, startCol);
    }
    if (ch === "*" && this.peek(1) === "=") {
      this.advance(2);
      return this.makeToken("*=" /* StarAssign */, startOffset, startLine, startCol);
    }
    if (ch === "/" && this.peek(1) === "=") {
      this.advance(2);
      return this.makeToken("/=" /* SlashAssign */, startOffset, startLine, startCol);
    }
    if (ch === "%" && this.peek(1) === "=") {
      this.advance(2);
      return this.makeToken("%=" /* PercentAssign */, startOffset, startLine, startCol);
    }
    if (ch === "&" && this.peek(1) === "=") {
      this.advance(2);
      return this.makeToken("&=" /* AmpersandAssign */, startOffset, startLine, startCol);
    }
    if (ch === "|" && this.peek(1) === "=") {
      this.advance(2);
      return this.makeToken("|=" /* PipeAssign */, startOffset, startLine, startCol);
    }
    if (ch === "^" && this.peek(1) === "=") {
      this.advance(2);
      return this.makeToken("^=" /* CaretAssign */, startOffset, startLine, startCol);
    }
    if (ch === "." && this.peek(1) === ".") {
      if (this.peek(2) === ".") {
        this.advance(3);
        return this.makeToken("..." /* DotDotDot */, startOffset, startLine, startCol);
      }
      if (this.peek(2) === "=") {
        this.advance(3);
        return this.makeToken("..=" /* DotDotEqual */, startOffset, startLine, startCol);
      }
      this.advance(2);
      return this.makeToken(".." /* DotDot */, startOffset, startLine, startCol);
    }
    const single = SINGLE_CHAR_TOKENS.get(ch);
    if (single !== void 0) {
      this.advance();
      return this.makeToken(single, startOffset, startLine, startCol);
    }
    this.advance();
    return this.makeToken("Error" /* Error */, startOffset, startLine, startCol);
  }
  readDocComment(startOffset, startLine, startCol) {
    this.advance(2);
    while (this.pos < this.source.length && this.peek() !== "\n") {
      this.advance();
    }
    return this.makeToken("DocComment" /* DocComment */, startOffset, startLine, startCol);
  }
  readHashLineComment(startOffset, startLine, startCol) {
    this.advance(1);
    while (this.pos < this.source.length && this.peek() !== "\n") {
      this.advance();
    }
    return this.makeToken("LineComment" /* LineComment */, startOffset, startLine, startCol);
  }
  /** At `!{`: is this `!{ name }` / `!{ "name" }` (a dynamic field access)? */
  isDynamicFieldAhead() {
    let i = this.pos + 2;
    const src = this.source;
    while (src[i] === " " || src[i] === "	")
      i++;
    const first = src[i] ?? "";
    if (first === '"' || first === "'") {
      i++;
      while (i < src.length && src[i] !== first && src[i] !== "\n") {
        if (src[i] === "\\")
          i++;
        i++;
      }
      if (src[i] !== first)
        return false;
      i++;
    } else if (this.isIdentStart(first)) {
      while (this.isIdentContinue(src[i] ?? ""))
        i++;
    } else {
      return false;
    }
    while (src[i] === " " || src[i] === "	")
      i++;
    return src[i] === "}";
  }
  /** Advance to `index` in one step (the text skipped holds no token boundary). */
  advanceTo(index) {
    const end = Math.min(index, this.source.length);
    for (let i = this.pos; i < end; i++) {
      if (this.source.charCodeAt(i) === 10) {
        this.line++;
        this.column = 0;
      } else {
        this.column++;
      }
    }
    this.pos = end;
  }
  readBlockComment(startOffset, startLine, startCol) {
    const close = this.source.indexOf("*/", this.pos + 2);
    this.advanceTo(close < 0 ? this.source.length : close + 2);
    const token = this.makeToken("BlockComment" /* BlockComment */, startOffset, startLine, startCol);
    if (close < 0)
      token.unterminated = true;
    return token;
  }
  readTemplateFence(startOffset, startLine, startCol) {
    const src = this.source;
    let i = this.pos;
    while (src[i] === "`")
      i++;
    const fenceLength = i - this.pos;
    let closed = false;
    while (i < src.length) {
      const tick = src.indexOf("`", i);
      if (tick < 0) {
        i = src.length;
        break;
      }
      let runEnd = tick;
      while (src[runEnd] === "`")
        runEnd++;
      i = runEnd;
      if (runEnd - tick === fenceLength) {
        closed = true;
        break;
      }
    }
    this.advanceTo(i);
    const token = this.makeToken("TemplateFenceOpen" /* TemplateFenceOpen */, startOffset, startLine, startCol);
    if (!closed)
      token.unterminated = true;
    return token;
  }
  /**
   * At `{$` inside an interpolated string: skip the inline expression up to and
   * including its `$}`. The expression may hold string literals of its own
   * (`i"{$ d["key"] $}"`), which must not end the outer string.
   */
  skipInlineExpr(multiline) {
    this.advance(2);
    while (this.pos < this.source.length) {
      const ch = this.peek();
      if (ch === "$" && this.peek(1) === "}") {
        this.advance(2);
        return;
      }
      if (ch === "\n" && !multiline)
        return;
      if (ch === '"' || ch === "'") {
        this.advance();
        while (this.pos < this.source.length && this.peek() !== ch && this.peek() !== "\n") {
          if (this.peek() === "\\")
            this.advance();
          this.advance();
        }
        if (this.peek() === ch)
          this.advance();
        continue;
      }
      this.advance();
    }
  }
  readMultilineString(startOffset, startLine, startCol, quote, prefix) {
    this.advance(3);
    let closed = false;
    while (this.pos < this.source.length) {
      if (this.peek() === quote && this.peek(1) === quote && this.peek(2) === quote) {
        this.advance(3);
        closed = true;
        break;
      }
      if (prefix !== "r" && this.peek() === "\\") {
        this.advance(2);
      } else if (prefix === "i" && this.peek() === "{" && this.peek(1) === "$") {
        this.skipInlineExpr(true);
      } else {
        this.advance();
      }
    }
    const kind = prefix === "r" ? "RawStringLiteral" /* RawStringLiteral */ : prefix === "i" ? "InterpolatedStringLiteral" /* InterpolatedStringLiteral */ : "MultilineStringLiteral" /* MultilineStringLiteral */;
    const token = this.makeToken(kind, startOffset, startLine, startCol);
    if (!closed)
      token.unterminated = true;
    return token;
  }
  readString(startOffset, startLine, startCol, quote, kind = "StringLiteral" /* StringLiteral */) {
    this.advance();
    const isRaw = kind === "RawStringLiteral" /* RawStringLiteral */;
    const isInterpolated = kind === "InterpolatedStringLiteral" /* InterpolatedStringLiteral */;
    let closed = false;
    while (this.pos < this.source.length) {
      const ch = this.peek();
      if (ch === "\n" || ch === "\r") {
        break;
      }
      if (!isRaw && ch === "\\") {
        if (this.peek(1) === "\n" || this.peek(1) === "\r") {
          this.advance();
          break;
        }
        this.advance(2);
      } else if (ch === quote) {
        this.advance();
        closed = true;
        break;
      } else if (isInterpolated && ch === "{" && this.peek(1) === "$") {
        this.skipInlineExpr(false);
      } else {
        this.advance();
      }
    }
    const token = this.makeToken(kind, startOffset, startLine, startCol);
    if (!closed)
      token.unterminated = true;
    return token;
  }
  readNumber(startOffset, startLine, startCol) {
    let isFloat = false;
    if (this.peek() === "0") {
      const next = this.peek(1);
      if (next === "x" || next === "X") {
        this.advance(2);
        while (this.pos < this.source.length && (this.isHexDigit(this.peek()) || this.peek() === "_")) {
          this.advance();
        }
        this.readIntTypeSuffix();
        return this.makeToken("IntLiteral" /* IntLiteral */, startOffset, startLine, startCol);
      }
      if (next === "b" || next === "B") {
        this.advance(2);
        while (this.pos < this.source.length && (this.peek() === "0" || this.peek() === "1" || this.peek() === "_")) {
          this.advance();
        }
        this.readIntTypeSuffix();
        return this.makeToken("IntLiteral" /* IntLiteral */, startOffset, startLine, startCol);
      }
      if (next === "o" || next === "O") {
        this.advance(2);
        while (this.pos < this.source.length && (this.peek() >= "0" && this.peek() <= "7" || this.peek() === "_")) {
          this.advance();
        }
        this.readIntTypeSuffix();
        return this.makeToken("IntLiteral" /* IntLiteral */, startOffset, startLine, startCol);
      }
    }
    while (this.pos < this.source.length && (this.isDigit(this.peek()) || this.peek() === "_")) {
      this.advance();
    }
    if (this.peek() === "." && this.isDigit(this.peek(1))) {
      isFloat = true;
      this.advance();
      while (this.pos < this.source.length && (this.isDigit(this.peek()) || this.peek() === "_")) {
        this.advance();
      }
    }
    if ((this.peek() === "e" || this.peek() === "E") && this.isExponentAhead()) {
      isFloat = true;
      this.advance();
      if (this.peek() === "+" || this.peek() === "-") {
        this.advance();
      }
      while (this.pos < this.source.length && (this.isDigit(this.peek()) || this.peek() === "_")) {
        this.advance();
      }
    }
    if (this.readFloatOrComplexSuffix(isFloat)) {
      isFloat = true;
    } else if (!isFloat) {
      this.readIntTypeSuffix();
    }
    return this.makeToken(
      isFloat ? "FloatLiteral" /* FloatLiteral */ : "IntLiteral" /* IntLiteral */,
      startOffset,
      startLine,
      startCol
    );
  }
  /** At `e`/`E` after digits: do exponent digits follow (`1e5`, `1e-3`)? */
  isExponentAhead() {
    const next = this.peek(1);
    if (this.isDigit(next))
      return true;
    return (next === "+" || next === "-") && this.isDigit(this.peek(2));
  }
  readIntTypeSuffix() {
    const ch = this.peek();
    if (ch === "n" && !this.isIdentContinue(this.peek(1))) {
      this.advance();
      return true;
    }
    if (ch === "i" || ch === "u") {
      const rest = this.source.slice(this.pos, this.pos + 4);
      for (const sfx of ["i8", "i16", "i32", "i64", "u8", "u16", "u32", "u64"]) {
        if (rest.startsWith(sfx) && !this.isIdentContinue(this.peek(sfx.length))) {
          this.advance(sfx.length);
          return true;
        }
      }
    }
    return false;
  }
  readFloatOrComplexSuffix(isFloatForm) {
    const ch = this.peek();
    if (ch === "d" && !this.isIdentContinue(this.peek(1))) {
      this.advance();
      return true;
    }
    if (ch === "f") {
      const rest = this.source.slice(this.pos, this.pos + 4);
      for (const sfx of ["f32", "f64"]) {
        if (rest.startsWith(sfx) && !this.isIdentContinue(this.peek(sfx.length))) {
          this.advance(sfx.length);
          return true;
        }
      }
    }
    if (ch === "i") {
      const rest = this.source.slice(this.pos, this.pos + 4);
      for (const sfx of ["i32", "i64", "i"]) {
        if (rest.startsWith(sfx) && !this.isIdentContinue(this.peek(sfx.length))) {
          if (sfx === "i" || isFloatForm) {
            this.advance(sfx.length);
            return true;
          }
        }
      }
    }
    return false;
  }
  readIdentifier(startOffset, startLine, startCol) {
    while (this.pos < this.source.length && this.isIdentContinue(this.peek())) {
      this.advance();
    }
    const text = this.source.slice(startOffset, this.pos);
    const keyword = KEYWORDS.get(text);
    if (keyword !== void 0) {
      return this.makeToken(keyword, startOffset, startLine, startCol);
    }
    const firstChar = text[0];
    if (firstChar >= "A" && firstChar <= "Z") {
      return this.makeToken("TypeIdentifier" /* TypeIdentifier */, startOffset, startLine, startCol);
    }
    return this.makeToken("Identifier" /* Identifier */, startOffset, startLine, startCol);
  }
  isDigit(ch) {
    return ch >= "0" && ch <= "9";
  }
  isHexDigit(ch) {
    return ch >= "0" && ch <= "9" || ch >= "a" && ch <= "f" || ch >= "A" && ch <= "F";
  }
  isIdentStart(ch) {
    if (ch >= "a" && ch <= "z" || ch >= "A" && ch <= "Z" || ch === "_") {
      return true;
    }
    return ch > "\x7F" && UNICODE_LETTER.test(ch);
  }
  isIdentContinue(ch) {
    if (this.isIdentStart(ch) || this.isDigit(ch))
      return true;
    return ch > "\x7F" && UNICODE_DIGIT.test(ch);
  }
};

// src/symbols/symbolTable.ts
var SymbolTable = class {
  rootScope = { symbols: /* @__PURE__ */ new Map(), children: [] };
  build(program) {
    const symbols = [];
    for (const stmt of program.statements) {
      const sym = this.collectSymbol(stmt, this.rootScope);
      if (sym)
        symbols.push(sym);
    }
    return symbols;
  }
  getRoot() {
    return this.rootScope;
  }
  findSymbol(name, scope) {
    let current = scope || this.rootScope;
    while (current) {
      const sym = current.symbols.get(name);
      if (sym)
        return sym;
      current = current.parent;
    }
    return void 0;
  }
  collectSymbol(stmt, scope) {
    switch (stmt.kind) {
      case "FunDecl": {
        const sym = {
          name: stmt.name,
          kind: stmt.isOperator ? "Operator" /* Operator */ : "Function" /* Function */,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: this.formatFunType(stmt),
          children: []
        };
        scope.symbols.set(stmt.name, sym);
        const childScope = this.createChildScope(scope);
        for (const p of stmt.params) {
          childScope.symbols.set(p.name, {
            name: p.name,
            kind: "Parameter" /* Parameter */,
            range: p.range,
            selectionRange: p.nameRange ?? p.range,
            type: p.type ? this.formatType(p.type) : void 0
          });
        }
        for (const bodyStmt of stmt.body.statements) {
          const childSym = this.collectSymbol(bodyStmt, childScope);
          if (childSym)
            sym.children.push(childSym);
        }
        return sym;
      }
      case "AsyncFunDecl": {
        const sym = {
          name: stmt.name,
          kind: "AsyncFunction" /* AsyncFunction */,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: this.formatAsyncFunType(stmt),
          children: []
        };
        scope.symbols.set(stmt.name, sym);
        const childScope = this.createChildScope(scope);
        for (const p of stmt.params) {
          childScope.symbols.set(p.name, {
            name: p.name,
            kind: "Parameter" /* Parameter */,
            range: p.range,
            selectionRange: p.nameRange ?? p.range,
            type: p.type ? this.formatType(p.type) : void 0
          });
        }
        for (const bodyStmt of stmt.body.statements) {
          const childSym = this.collectSymbol(bodyStmt, childScope);
          if (childSym)
            sym.children.push(childSym);
        }
        return sym;
      }
      case "ClassDecl": {
        const sym = {
          name: stmt.name,
          kind: "Class" /* Class */,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          children: []
        };
        scope.symbols.set(stmt.name, sym);
        const childScope = this.createChildScope(scope);
        for (const member of stmt.members) {
          const childSym = this.collectSymbol(member, childScope);
          if (childSym)
            sym.children.push(childSym);
        }
        return sym;
      }
      case "EnumDecl": {
        const sym = {
          name: stmt.name,
          kind: "Enum" /* Enum */,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          children: stmt.variants.map((v) => ({
            name: v.name,
            kind: "EnumVariant" /* EnumVariant */,
            range: v.range,
            selectionRange: v.range
          }))
        };
        scope.symbols.set(stmt.name, sym);
        return sym;
      }
      case "InterfaceDecl": {
        const sym = {
          name: stmt.name,
          kind: "Interface" /* Interface */,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          children: stmt.methods.map((m) => ({
            name: m.name,
            kind: "Function" /* Function */,
            range: m.range,
            selectionRange: m.nameRange ?? m.range,
            type: this.formatFunType(m)
          }))
        };
        scope.symbols.set(stmt.name, sym);
        return sym;
      }
      case "LetDecl":
      case "VarDecl": {
        const typeStr = stmt.typeAnnotation ? this.formatType(stmt.typeAnnotation) : void 0;
        let mainSym;
        const extractNames = (pattern) => {
          if (pattern.kind === "IdentifierPattern") {
            const sym = {
              name: pattern.name,
              kind: "Variable" /* Variable */,
              range: stmt.range,
              selectionRange: pattern.range,
              type: typeStr
            };
            scope.symbols.set(pattern.name, sym);
            if (!mainSym)
              mainSym = sym;
          } else if (pattern.kind === "TuplePattern" || pattern.kind === "ListPattern") {
            pattern.elements.forEach(extractNames);
            if (pattern.rest) {
              const sym = { name: pattern.rest, kind: "Variable" /* Variable */, range: stmt.range, selectionRange: stmt.range };
              scope.symbols.set(pattern.rest, sym);
            }
          } else if (pattern.kind === "DictPattern") {
            pattern.fields.forEach((f) => {
              const name = f.alias || f.key;
              const sym = { name, kind: "Variable" /* Variable */, range: stmt.range, selectionRange: stmt.range };
              scope.symbols.set(name, sym);
            });
            if (pattern.rest) {
              const sym = { name: pattern.rest, kind: "Variable" /* Variable */, range: stmt.range, selectionRange: stmt.range };
              scope.symbols.set(pattern.rest, sym);
            }
          }
        };
        extractNames(stmt.pattern);
        return mainSym || { name: "_", kind: "Variable" /* Variable */, range: stmt.range, selectionRange: stmt.range };
      }
      case "PortalStmt": {
        const sym = {
          name: stmt.name,
          kind: "Portal" /* Portal */,
          range: stmt.range,
          selectionRange: stmt.range
        };
        scope.symbols.set(`portal:${stmt.name}`, sym);
        return sym;
      }
      case "ExternJsFunDecl": {
        const sym = {
          name: stmt.name,
          kind: "ExternFunction" /* ExternFunction */,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: `extern js func`
        };
        scope.symbols.set(stmt.name, sym);
        return sym;
      }
      case "ExternJsValDecl": {
        const sym = {
          name: stmt.name,
          kind: "ExternValue" /* ExternValue */,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: `extern js val`
        };
        scope.symbols.set(stmt.name, sym);
        return sym;
      }
      case "ExternNativeFunDecl": {
        const sym = {
          name: stmt.name,
          kind: "ExternFunction" /* ExternFunction */,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: `extern native "${stmt.library}" func`
        };
        scope.symbols.set(stmt.name, sym);
        return sym;
      }
      case "ImportStmt": {
        for (const n of stmt.names) {
          scope.symbols.set(n.alias || n.name, {
            name: n.alias || n.name,
            kind: "Import" /* Import */,
            range: n.range,
            selectionRange: n.range
          });
        }
        return null;
      }
      case "ReExportStmt": {
        for (const n of stmt.names) {
          scope.symbols.set(n.alias || n.name, {
            name: n.alias || n.name,
            kind: "Import" /* Import */,
            range: n.range,
            selectionRange: n.range
          });
        }
        return null;
      }
      case "GenFunDecl": {
        const sym = {
          name: stmt.name,
          kind: "GenFunction" /* GenFunction */,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: this.formatGenFunType(stmt),
          children: []
        };
        scope.symbols.set(stmt.name, sym);
        const childScope = this.createChildScope(scope);
        for (const p of stmt.params) {
          childScope.symbols.set(p.name, {
            name: p.name,
            kind: "Parameter" /* Parameter */,
            range: p.range,
            selectionRange: p.nameRange ?? p.range,
            type: p.type ? this.formatType(p.type) : void 0
          });
        }
        for (const bodyStmt of stmt.body.statements) {
          const childSym = this.collectSymbol(bodyStmt, childScope);
          if (childSym)
            sym.children.push(childSym);
        }
        return sym;
      }
      case "AsyncGenFunDecl": {
        const sym = {
          name: stmt.name,
          kind: "AsyncGenFunction" /* AsyncGenFunction */,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: this.formatAsyncGenFunType(stmt),
          children: []
        };
        scope.symbols.set(stmt.name, sym);
        const childScope = this.createChildScope(scope);
        for (const p of stmt.params) {
          childScope.symbols.set(p.name, {
            name: p.name,
            kind: "Parameter" /* Parameter */,
            range: p.range,
            selectionRange: p.nameRange ?? p.range,
            type: p.type ? this.formatType(p.type) : void 0
          });
        }
        for (const bodyStmt of stmt.body.statements) {
          const childSym = this.collectSymbol(bodyStmt, childScope);
          if (childSym)
            sym.children.push(childSym);
        }
        return sym;
      }
      case "StructDecl": {
        const sym = {
          name: stmt.name,
          kind: "Struct" /* Struct */,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          children: stmt.fields.map((f) => ({
            name: f.name,
            kind: "Field" /* Field */,
            range: f.range,
            selectionRange: f.range,
            type: this.formatType(f.type)
          }))
        };
        scope.symbols.set(stmt.name, sym);
        const childScope = this.createChildScope(scope);
        for (const method of stmt.methods) {
          const methodSym = this.collectSymbol(method, childScope);
          if (methodSym)
            sym.children.push(methodSym);
        }
        return sym;
      }
      case "TypeAliasDecl": {
        const sym = {
          name: stmt.name,
          kind: "TypeAlias" /* TypeAlias */,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: `type ${stmt.name} = ${this.formatType(stmt.value)}`
        };
        scope.symbols.set(stmt.name, sym);
        return sym;
      }
      case "MacroDecl": {
        const sym = {
          name: stmt.name,
          kind: "Macro" /* Macro */,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: `macro ${stmt.name}(${stmt.params.map((p) => p.name).join(", ")})`,
          children: []
        };
        scope.symbols.set(stmt.name, sym);
        return sym;
      }
      case "ExternNativeValDecl": {
        const sym = {
          name: stmt.name,
          kind: "ExternValue" /* ExternValue */,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: `extern native "${stmt.library}" val`
        };
        scope.symbols.set(stmt.name, sym);
        return sym;
      }
      case "NamespaceDecl": {
        if (!stmt.body)
          return null;
        const sym = {
          name: stmt.name,
          kind: "Namespace" /* Namespace */,
          range: stmt.range,
          selectionRange: stmt.range,
          children: []
        };
        for (const inner of stmt.body) {
          const childSym = this.collectSymbol(inner, scope);
          if (childSym)
            sym.children.push(childSym);
        }
        return sym;
      }
      case "AnnotatedDecl":
        return stmt.declaration ? this.collectSymbol(stmt.declaration, scope) : null;
      default:
        return null;
    }
  }
  createChildScope(parent) {
    const child = { parent, symbols: /* @__PURE__ */ new Map(), children: [] };
    parent.children.push(child);
    return child;
  }
  formatFunType(fun) {
    const params = fun.params.map((p) => p.type ? `${p.name}: ${this.formatType(p.type)}` : p.name).join(", ");
    const ret = fun.returnType ? `: ${this.formatType(fun.returnType)}` : "";
    return `func(${params})${ret}`;
  }
  formatAsyncFunType(fun) {
    const params = fun.params.map((p) => p.type ? `${p.name}: ${this.formatType(p.type)}` : p.name).join(", ");
    const ret = fun.returnType ? `: ${this.formatType(fun.returnType)}` : "";
    return `async func(${params})${ret}`;
  }
  formatGenFunType(fun) {
    const params = fun.params.map((p) => p.type ? `${p.name}: ${this.formatType(p.type)}` : p.name).join(", ");
    const ret = fun.returnType ? `: ${this.formatType(fun.returnType)}` : "";
    return `gen func(${params})${ret}`;
  }
  formatAsyncGenFunType(fun) {
    const params = fun.params.map((p) => p.type ? `${p.name}: ${this.formatType(p.type)}` : p.name).join(", ");
    const ret = fun.returnType ? `: ${this.formatType(fun.returnType)}` : "";
    return `async gen func(${params})${ret}`;
  }
  formatType(type) {
    switch (type.kind) {
      case "SimpleType":
        return type.name;
      case "GenericType":
        return `${type.name}[${type.args.map((a) => this.formatType(a)).join(", ")}]`;
      case "FunctionType":
        return `fn(${type.params.map((p) => this.formatType(p)).join(", ")}): ${this.formatType(type.returnType)}`;
      case "AsyncFunctionType":
        return `async fn(${type.params.map((p) => this.formatType(p)).join(", ")}): ${this.formatType(type.returnType)}`;
      case "OptionalType":
        return `${this.formatType(type.inner)}?`;
      case "UnionType":
        return type.members.map((m) => this.formatType(m)).join(" | ");
      case "TupleType":
        return `tuple[${type.elements.map((e) => this.formatType(e)).join(", ")}]`;
    }
  }
};

// src/parser/parser.ts
var ParseError = class extends Error {
  constructor() {
    super("parse error");
    this.name = "ParseError";
  }
};
var ParseAbort = class extends Error {
  constructor() {
    super("parse aborted");
    this.name = "ParseAbort";
  }
};
var MAX_DIAGNOSTICS = 200;
var MAX_NESTING = 200;
var K = TokenKind;
var MODIFIER_KINDS = /* @__PURE__ */ new Set([
  K.Pub,
  K.Static,
  K.Abstract,
  K.Override,
  K.Final,
  K.Sealed,
  K.Safe,
  K.Async,
  K.Gen,
  K.Synchronized,
  K.Local,
  K.Shared,
  K.Unique,
  K.Dynamic,
  K.Modifier,
  K.Operator,
  K.Reads,
  K.Edits,
  K.Takes,
  K.Shares,
  K.Arc,
  K.Onstack,
  K.Weak,
  K.Unowned,
  K.Borrow,
  K.Excl,
  K.Volatile,
  K.Part
]);
var OWNERSHIP_KINDS = /* @__PURE__ */ new Set([
  K.Reads,
  K.Edits,
  K.Takes,
  K.Shares,
  K.Borrow,
  K.Excl,
  K.Weak,
  K.Unowned,
  K.Unique,
  K.Volatile,
  K.Noescape
]);
var NOT_AN_EXPRESSION = /* @__PURE__ */ new Set([
  K.Let,
  K.Var,
  K.Const,
  K.Else,
  K.For,
  K.While,
  K.Do,
  K.Defer,
  K.With,
  K.Portal,
  K.Try,
  K.Catch,
  K.Finally,
  K.Import,
  K.As,
  K.In,
  K.Is,
  K.Instanceof,
  K.Del,
  K.Global,
  K.Nonlocal,
  K.Pub,
  K.Static,
  K.Override,
  K.Final,
  K.Sealed,
  K.Class,
  K.Struct,
  K.Abstract,
  K.Interface,
  K.Implements,
  K.Enum,
  K.Namespace,
  K.Extern,
  K.Macro,
  K.Where,
  K.Requires,
  K.Prefer,
  K.Synchronized,
  K.And,
  K.Or,
  K.Local
]);
var COMPOUND_ASSIGN = /* @__PURE__ */ new Set([
  K.PlusAssign,
  K.MinusAssign,
  K.StarAssign,
  K.SlashAssign,
  K.SlashSlashAssign,
  K.PercentAssign,
  K.StarStarAssign,
  K.AmpersandAssign,
  K.PipeAssign,
  K.CaretAssign,
  K.ShiftLeftAssign,
  K.ShiftRightAssign
]);
var STATEMENT_START = /* @__PURE__ */ new Set([
  K.Let,
  K.Var,
  K.Const,
  K.Fun,
  K.Class,
  K.Struct,
  K.Enum,
  K.Interface,
  K.If,
  K.For,
  K.While,
  K.Do,
  K.Return,
  K.Try,
  K.Match,
  K.Pub,
  K.Static,
  K.From,
  K.Import,
  K.At,
  K.Break,
  K.Continue,
  K.Throw,
  K.Defer,
  K.With,
  K.Portal,
  K.Extern,
  K.Macro,
  K.Abstract,
  K.Namespace,
  K.Del,
  K.Yield
]);
var RESERVED_EVERYWHERE = /* @__PURE__ */ new Set([
  "Self",
  "abstract",
  "and",
  "as",
  "async",
  "atomic",
  "await",
  "bnot",
  "break",
  "catch",
  "class",
  "const",
  "consume",
  "continue",
  "defer",
  "del",
  "do",
  "dynamic",
  "else",
  "enum",
  "extern",
  "false",
  "final",
  "finally",
  "fn",
  "for",
  "func",
  "gen",
  "global",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "is",
  "let",
  "local",
  "macro",
  "match",
  "namespace",
  "noescape",
  "nonlocal",
  "not",
  "onstack",
  "or",
  "override",
  "portal",
  "pub",
  "requires",
  "return",
  "safe",
  "sealed",
  "shared",
  "static",
  "struct",
  "super",
  "suspend",
  "synchronized",
  "this",
  "throw",
  "true",
  "try",
  "type",
  "typeof",
  "unique",
  "unsafe",
  "var",
  "where",
  "while",
  "with",
  "yield"
]);
var VERBS = ["borrow", "edits", "reads", "shares", "takes", "volatile"];
var RESERVED_BY_POSITION = {
  "binding": /* @__PURE__ */ new Set(["None", "Some", "from", "lifetime", "new", "spawn", "template", ...VERBS]),
  "parameter": /* @__PURE__ */ new Set(["None", "Some", "from", "lifetime", "new", "spawn", "template"]),
  "function": /* @__PURE__ */ new Set(["None", "Some", "lifetime", ...VERBS]),
  "type": /* @__PURE__ */ new Set(["None", "Some", "from", "impossible", "lifetime", "new", "noreturn", "spawn", "template", ...VERBS]),
  "type parameter": /* @__PURE__ */ new Set(["None", "Some", "from", "impossible", "new", "noreturn", "spawn", "template", ...VERBS]),
  "field": /* @__PURE__ */ new Set(["None", "Some", "from", "lifetime", "new", "template", ...VERBS]),
  "enum variant": /* @__PURE__ */ new Set(["from", "lifetime", "new", "spawn", "template", ...VERBS]),
  "macro": /* @__PURE__ */ new Set(["None", "Some", "from", "lifetime", "new", "spawn", "template", ...VERBS]),
  "import alias": /* @__PURE__ */ new Set(["None", "Some", "from", "lifetime", "new", "spawn", "template", ...VERBS])
};
var CLOSERS = {
  [K.LeftParen]: K.RightParen,
  [K.LeftBracket]: K.RightBracket,
  [K.LeftBrace]: K.RightBrace,
  [K.BangLeftBrace]: K.RightBrace
};
var Parser = class {
  tokens = [];
  pos = 0;
  diagnostics = [];
  source = "";
  eof = { kind: K.EOF, text: "", offset: 0, line: 0, column: 0, length: 0, endLine: 0, endColumn: 0 };
  depth = 0;
  work = 0;
  workLimit = 0;
  parse(source) {
    this.source = source;
    const lexer = new Lexer(source);
    this.tokens = lexer.tokenize().filter(
      (t) => t.kind !== K.LineComment && t.kind !== K.BlockComment && t.kind !== K.DocComment
    );
    this.eof = this.tokens[this.tokens.length - 1];
    this.pos = 0;
    this.diagnostics = [];
    this.depth = 0;
    this.work = 0;
    this.workLimit = 1e5 + this.tokens.length * 4e3;
    let statements = [];
    try {
      statements = this.parseStatementList(K.EOF, "top");
    } catch (err) {
      if (!(err instanceof ParseAbort) && !(err instanceof RangeError))
        throw err;
    }
    const program = {
      kind: "Program",
      statements,
      isCompiled: false,
      range: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: this.eof.line, column: this.eof.column, offset: this.eof.offset }
      }
    };
    return { program, diagnostics: this.diagnostics };
  }
  // ==========================================================================
  // Statement lists and recovery
  // ==========================================================================
  /**
   * Parse statements up to (not including) `close`. A statement that fails is
   * reported once, skipped, and parsing resumes at the next statement boundary.
   */
  parseStatementList(close, ctx) {
    const statements = [];
    while (!this.at(close) && !this.atEnd()) {
      const startPos = this.pos;
      const depth = this.depth;
      try {
        const stmt = this.parseStatement(ctx);
        if (stmt)
          statements.push(stmt);
      } catch (err) {
        if (!(err instanceof ParseError))
          throw err;
        this.depth = depth;
        this.recover(startPos);
      }
      if (this.pos === startPos && !this.atEnd()) {
        this.advance();
      }
    }
    return statements;
  }
  /** Skip to the next statement boundary after an error. */
  recover(startPos) {
    let nesting = 0;
    while (!this.atEnd()) {
      const tok = this.cur();
      if (nesting === 0) {
        if (tok.kind === K.Semicolon) {
          this.advance();
          return;
        }
        if (tok.kind === K.RightBrace)
          return;
        if (this.pos > startPos && STATEMENT_START.has(tok.kind) && this.startsLine())
          return;
      }
      if (tok.kind === K.LeftBrace || tok.kind === K.LeftParen || tok.kind === K.LeftBracket || tok.kind === K.BangLeftBrace) {
        nesting++;
      } else if (tok.kind === K.RightBrace || tok.kind === K.RightParen || tok.kind === K.RightBracket) {
        if (nesting > 0) {
          nesting--;
          if (nesting === 0 && tok.kind === K.RightBrace) {
            this.advance();
            if (this.at(K.Semicolon))
              this.advance();
            return;
          }
        }
      }
      this.advance();
    }
  }
  // ==========================================================================
  // Statements
  // ==========================================================================
  parseStatement(ctx) {
    this.enter();
    try {
      return this.parseStatementInner(ctx);
    } finally {
      this.depth--;
    }
  }
  parseStatementInner(ctx) {
    const tok = this.cur();
    switch (tok.kind) {
      case K.Semicolon:
        this.advance();
        return null;
      case K.At:
        return this.parseAnnotated(ctx);
      case K.LeftBrace:
        if (ctx === "top" || ctx === "block")
          return this.parseBlock();
        break;
      default:
        break;
    }
    const decl = this.tryParseDeclaration(ctx);
    if (decl)
      return decl;
    switch (tok.kind) {
      case K.If:
        return this.parseIfStmt();
      case K.While:
        return this.parseWhileStmt();
      case K.For:
        return this.parseForStmt();
      case K.Do:
        return this.parseDoWhileStmt();
      case K.Try:
        return this.parseTryStmt();
      case K.With:
        return this.parseWithStmt();
      case K.Defer:
        return this.parseDeferStmt();
      case K.Portal:
        return this.parsePortalStmt();
      case K.Del:
        return this.parseDelStmt();
      case K.Global:
        return this.parseGlobalDecl();
      case K.Nonlocal:
        return this.parseNonlocalDecl();
      case K.Yield:
        return this.parseYieldStmt();
      case K.From:
        return this.parseImportStmt(false);
      case K.Import:
        return this.parseModuleImport();
      case K.Namespace:
        return this.parseNamespaceDecl();
      case K.Extern:
        return this.parseExternDecl();
      case K.Return:
      case K.Break:
      case K.Continue:
      case K.Throw: {
        const expression = this.parseJump();
        this.endStatement();
        return this.jumpToStatement(expression, tok);
      }
      case K.Match: {
        const expression = this.parseMatchExpr();
        return this.finishBlockExpression(expression, tok);
      }
      case K.Await:
        if (this.kindAt(1) === K.Group && this.kindAt(2) === K.LeftBrace)
          return this.parseAwaitGroupStmt();
        break;
      case K.Safe:
      case K.Atomic:
        if (this.kindAt(1) === K.LeftBrace) {
          this.advance();
          return this.parseBlock();
        }
        break;
      case K.Unsafe:
        if (this.kindAt(1) === K.LeftParen) {
          const close = this.matchingClose(this.pos + 1);
          const body = close >= 0 ? this.tokens[close + 1] : void 0;
          if (body?.kind === K.LeftBrace) {
            this.advance();
            this.skipBalanced();
            return this.parseBlock();
          }
          if (body?.kind === K.Asm && this.tokens[close + 2]?.kind === K.LeftBrace) {
            this.advance();
            this.skipBalanced();
            return this.parseOpaqueBlock("asm");
          }
        }
        break;
      case K.Asm:
        if (this.kindAt(1) === K.LeftBrace)
          return this.parseOpaqueBlock("asm");
        break;
      case K.Quote:
        if (this.kindAt(1) === K.LeftBrace)
          return this.parseOpaqueBlock("quote");
        break;
      case K.Dynamic:
        return this.parseDynamicViewStmt();
      default:
        break;
    }
    if (this.isWord(tok) && this.kindAt(1) === K.Colon) {
      const after = this.kindAt(2);
      if (after === K.For || after === K.While || after === K.Do)
        return this.parseLabeledStmt();
      if (ctx === "class" || ctx === "struct" || ctx === "interface") {
        return this.parseFieldDecl(tok, /* @__PURE__ */ new Set());
      }
    }
    return this.parseExpressionStmt();
  }
  /** `return` / `break` / `continue` / `throw` are parsed as expressions so match arms can hold them. */
  jumpToStatement(expression, start) {
    if (expression.kind === "StatementExpr")
      return expression.statement;
    return { kind: "ExpressionStmt", expression, range: this.rangeFrom(start) };
  }
  /** A `match` / `if` in statement position needs no terminator, but may carry one or a postfix chain. */
  finishBlockExpression(expression, start) {
    if (this.at(K.Dot) || this.at(K.QuestionDot) || this.at(K.Question)) {
      this.parsePostfixOps(expression);
      this.endStatement();
    } else if (this.at(K.Semicolon)) {
      this.advance();
    }
    return { kind: "ExpressionStmt", expression, range: this.rangeFrom(start) };
  }
  // ---- Annotations ----
  parseAnnotated(ctx) {
    const start = this.cur();
    const annotation = this.parseAnnotation();
    if (annotation === "mode" || this.at(K.RightBrace) || this.atEnd()) {
      return { kind: "AnnotatedDecl", annotation, range: this.rangeFrom(start) };
    }
    const declaration = this.parseStatement(ctx) ?? void 0;
    return { kind: "AnnotatedDecl", annotation, declaration, range: this.rangeFrom(start) };
  }
  /** `@name`, `@name(args)`, `@pkg.name(args)`. The arguments are skipped as a token tree. */
  parseAnnotation() {
    this.expect(K.At);
    let name = this.expectWord("an annotation name").text;
    while (this.at(K.Dot) && this.isWord(this.peekTok(1))) {
      this.advance();
      name += "." + this.advance().text;
    }
    if (this.at(K.LeftParen))
      this.skipBalanced();
    return name;
  }
  skipAnnotations() {
    while (this.at(K.At))
      this.parseAnnotation();
  }
  // ---- Declarations ----
  /**
   * Parse a declaration if one starts here. The modifier words are contextual, so
   * the decision is made on the token after them: `part = 3;` and `shared.x` are
   * expressions, `part func f()` and `shared class C` are declarations.
   */
  tryParseDeclaration(ctx) {
    let i = this.pos;
    while (MODIFIER_KINDS.has(this.kindAt(i - this.pos))) {
      i++;
      if (this.tokens[i]?.kind === K.LeftBracket && this.tokens[i + 1]?.kind === K.LifetimeLabel && this.tokens[i + 2]?.kind === K.RightBracket) {
        i += 3;
      }
    }
    const head = this.tokens[i] ?? this.eof;
    const next = this.tokens[i + 1] ?? this.eof;
    const after = this.tokens[i + 2] ?? this.eof;
    const hasModifiers = i > this.pos;
    const inType = ctx === "class" || ctx === "struct" || ctx === "interface";
    const lastModifier = hasModifiers ? this.tokens[i - 1] : void 0;
    let form = null;
    switch (head.kind) {
      case K.Fun:
        if (next.kind !== K.LeftParen || lastModifier?.kind === K.Operator)
          form = "func";
        break;
      case K.Class:
        if (this.isNameToken(next))
          form = "class";
        break;
      case K.Struct:
        if (this.isNameToken(next))
          form = "struct";
        break;
      case K.Enum:
        if (this.isNameToken(next))
          form = "enum";
        break;
      case K.Interface:
        if (this.isNameToken(next))
          form = "interface";
        break;
      case K.Type:
        if (this.isNameToken(next) && (after.kind === K.Assign || after.kind === K.LeftBracket || // an associated type in an interface: `type Item;`
        inType && (after.kind === K.Semicolon || after.kind === K.Colon || after.kind === K.RightBrace || after.line > next.endLine))) {
          form = "type";
        }
        break;
      case K.Macro:
        if (this.isNameToken(next) && after.kind === K.LeftParen)
          form = "macro";
        break;
      case K.Let:
      case K.Var:
        form = "binding";
        break;
      case K.Const:
        form = "const";
        break;
      case K.Template:
        if (this.isWord(next) && this.isNameToken(after))
          form = "template";
        break;
      case K.New:
        if (next.kind === K.LeftParen && (inType || hasModifiers))
          form = "ctor";
        break;
      case K.Get:
      case K.Set:
        if (inType && this.isNameToken(next) && after.kind === K.LeftParen)
          form = "property";
        break;
      case K.From:
        if (hasModifiers && i === this.pos + 1 && this.at(K.Pub))
          form = "reexport";
        break;
      case K.Namespace:
        if (hasModifiers)
          form = "namespace";
        break;
      case K.Extern:
        if (hasModifiers)
          form = "extern";
        break;
      default:
        break;
    }
    if (form === null && hasModifiers) {
      if (lastModifier.kind === K.Modifier && this.isNameToken(head) && (next.kind === K.LeftParen || next.kind === K.LeftBracket) && i - 1 >= this.pos) {
        form = "bareMethod";
      } else if (inType && this.isNameToken(head) && next.kind === K.Colon) {
        form = "field";
      } else if (inType && head.kind === K.Colon && i - 1 > this.pos) {
        form = "fieldLastModifier";
      }
    }
    if (form === null)
      return null;
    const start = this.cur();
    const modifierEnd = form === "fieldLastModifier" ? i - 1 : i;
    const modifiers = /* @__PURE__ */ new Set();
    while (this.pos < modifierEnd)
      modifiers.add(this.advance().text);
    switch (form) {
      case "func":
        return this.parseFunDecl(start, modifiers, ctx, false);
      case "bareMethod":
        return this.parseFunDecl(start, modifiers, ctx, true);
      case "class":
        return this.parseClassDecl(start, modifiers);
      case "struct":
        return this.parseStructDecl(start);
      case "enum":
        return this.parseEnumDecl(start);
      case "interface":
        return this.parseInterfaceDecl(start);
      case "type":
        return this.parseTypeAliasDecl(start);
      case "macro":
        return this.parseMacroDecl(start);
      case "binding": {
        const decl = this.parseBindingDecl(start, inType ? "field" : "binding");
        this.endStatement();
        return decl;
      }
      case "const":
        if (this.kindAt(1) === K.Fun) {
          this.advance();
          return this.parseFunDecl(start, modifiers, ctx, false);
        } else {
          const decl = this.parseBindingDecl(start, inType ? "field" : "binding");
          this.endStatement();
          return decl;
        }
      case "template":
        return this.parseTemplateDecl(start);
      case "ctor":
        return this.parseConstructorDecl(start, modifiers);
      case "property":
        return this.parsePropertyDecl(start, modifiers);
      case "reexport":
        return this.parseImportStmt(true, start);
      case "namespace":
        return this.parseNamespaceDecl(start);
      case "extern":
        return this.parseExternDecl(start);
      case "field":
      case "fieldLastModifier":
        return this.parseFieldDecl(start, modifiers);
    }
  }
  /** `let` / `var` / `const` binding, without its terminator. */
  parseBindingDecl(start, position = "binding") {
    const keyword = this.advance();
    const pattern = this.parseDestructPattern(position);
    const typeAnnotation = this.eat(K.Colon) ? this.parseType() : void 0;
    const initializer = this.eat(K.Assign) ? this.parseExpression() : void 0;
    const kind = keyword.kind === K.Var ? "VarDecl" : "LetDecl";
    return { kind, pattern, typeAnnotation, initializer, range: this.rangeFrom(start) };
  }
  /** A field written without `let` / `var`: `[pub] [borrow[~a]] name: Type [= default];` */
  parseFieldDecl(start, modifiers) {
    const nameTok = this.advance();
    this.expect(K.Colon);
    const typeAnnotation = this.parseType();
    const initializer = this.eat(K.Assign) ? this.parseExpression() : void 0;
    this.endStatement();
    return {
      kind: "VarDecl",
      pattern: { kind: "IdentifierPattern", name: nameTok.text, range: this.tokenRange(nameTok) },
      typeAnnotation,
      initializer,
      range: this.rangeFrom(start)
    };
  }
  parseDestructPattern(position = "binding") {
    this.enter();
    try {
      return this.parseDestructPatternInner(position);
    } finally {
      this.depth--;
    }
  }
  parseDestructPatternInner(position) {
    const start = this.cur();
    if (this.at(K.LeftParen) || this.at(K.LeftBracket)) {
      const isTuple = this.at(K.LeftParen);
      const close = isTuple ? K.RightParen : K.RightBracket;
      this.advance();
      const elements = [];
      let rest;
      while (!this.at(close)) {
        if (this.at(K.Star)) {
          this.advance();
          rest = this.expectDeclaredName(position).text;
        } else {
          elements.push(this.parseDestructPattern(position));
        }
        if (!this.eat(K.Comma))
          break;
      }
      this.expect(close);
      return { kind: isTuple ? "TuplePattern" : "ListPattern", elements, rest, range: this.rangeFrom(start) };
    }
    if (this.at(K.LeftBrace)) {
      this.advance();
      const fields = [];
      let rest;
      while (!this.at(K.RightBrace)) {
        if (this.at(K.StarStar)) {
          this.advance();
          rest = this.expectName('a name after "**"').text;
        } else if (this.at(K.Star) && this.kindAt(1) === K.Star) {
          this.advance();
          this.advance();
          rest = this.expectName('a name after "**"').text;
        } else {
          const fStart = this.cur();
          let key;
          if (this.at(K.StringLiteral)) {
            key = this.advance().text.slice(1, -1);
          } else {
            key = this.expectName("a key").text;
          }
          let alias;
          if (this.eat(K.Colon))
            alias = this.expectDeclaredName(position).text;
          const defaultValue = this.eat(K.Assign) ? this.parseExpression() : void 0;
          fields.push({ kind: "DictDestructField", key, alias, defaultValue, range: this.rangeFrom(fStart) });
        }
        if (!this.eat(K.Comma))
          break;
      }
      this.expect(K.RightBrace);
      return { kind: "DictPattern", fields, rest, range: this.rangeFrom(start) };
    }
    if (this.isNameToken(this.cur()) && this.kindAt(1) === K.LeftParen && this.peekTok(1).line === this.cur().endLine) {
      this.advance();
      this.advance();
      const elements = [];
      while (!this.at(K.RightParen)) {
        if (this.isWord(this.cur()) && this.kindAt(1) === K.Assign) {
          this.advance();
          this.advance();
        }
        elements.push(this.parseDestructPattern(position));
        if (!this.eat(K.Comma))
          break;
      }
      this.expect(K.RightParen);
      return { kind: "TuplePattern", elements, range: this.rangeFrom(start) };
    }
    const nameTok = this.expectDeclaredName(position);
    return { kind: "IdentifierPattern", name: nameTok.text, range: this.tokenRange(nameTok) };
  }
  parseFunDecl(start, modifiers, ctx, bare) {
    if (!bare)
      this.expect(K.Fun);
    const isOperator = modifiers.has("operator");
    const nameTok = this.cur();
    const name = isOperator ? this.parseOperatorSymbol() : this.expectDeclaredName("function").text;
    const nameRange = isOperator ? this.rangeFrom(nameTok) : this.tokenRange(nameTok);
    const typeParams = this.parseOptionalTypeParams();
    this.expect(K.LeftParen);
    const params = this.parseParamList();
    this.expect(K.RightParen);
    const returnType = this.parseSignatureTail();
    let body;
    if (this.at(K.LeftBrace)) {
      body = this.parseBlock();
    } else if (this.at(K.Arrow)) {
      this.advance();
      const exprStart = this.cur();
      this.parseExpression();
      this.endStatement();
      body = { kind: "Block", statements: [], range: this.rangeFrom(exprStart) };
    } else if (this.at(K.Semicolon)) {
      body = { kind: "Block", statements: [], range: this.tokenRange(this.advance()) };
    } else if ((ctx === "interface" || ctx === "class" || ctx === "struct" || modifiers.has("abstract") || modifiers.has("part")) && (this.at(K.RightBrace) || this.atEnd() || this.startsLine())) {
      body = { kind: "Block", statements: [], range: this.rangeFrom(this.prev()) };
    } else {
      this.fail(`Expected '{' but found ${this.describe(this.cur())}`);
    }
    const common = {
      name,
      nameRange,
      params,
      returnType,
      body,
      isPublic: modifiers.has("pub"),
      isStatic: modifiers.has("static"),
      typeParams,
      range: this.rangeFrom(start)
    };
    const isAsync = modifiers.has("async");
    const isGen = modifiers.has("gen");
    if (isAsync && isGen)
      return { kind: "AsyncGenFunDecl", ...common };
    if (isGen)
      return { kind: "GenFunDecl", ...common };
    if (isAsync)
      return { kind: "AsyncFunDecl", isAbstract: modifiers.has("abstract"), ...common };
    return { kind: "FunDecl", isAbstract: modifiers.has("abstract"), isOperator, ...common };
  }
  /** After a parameter list: `requires ...`, `: ReturnType` and `where ...`, in any order. */
  parseSignatureTail() {
    let returnType;
    for (; ; ) {
      if (this.at(K.Requires)) {
        this.advance();
        do {
          this.expectWord("a contract");
          if (this.at(K.LeftParen))
            this.skipBalanced();
        } while (this.eat(K.Comma));
      } else if (this.at(K.Colon)) {
        this.advance();
        returnType = this.parseType();
      } else if (this.at(K.Where)) {
        this.parseWhereClause();
      } else {
        return returnType;
      }
    }
  }
  /** `where T: A + B, U: C` */
  parseWhereClause() {
    this.expect(K.Where);
    for (; ; ) {
      this.expectWord("a type parameter name");
      this.expect(K.Colon);
      this.parseType();
      while (this.eat(K.Plus))
        this.parseType();
      if (this.at(K.Comma) && this.isWord(this.peekTok(1)) && this.kindAt(2) === K.Colon) {
        this.advance();
        continue;
      }
      return;
    }
  }
  /** The symbol of an `operator func`: `+`, `[]`, `[]=`, `()`, `==`, `contains`, ... */
  parseOperatorSymbol() {
    if (this.at(K.LeftBracket)) {
      this.advance();
      this.expect(K.RightBracket);
      if (this.at(K.Assign) && this.kindAt(1) !== K.Assign) {
        this.advance();
        return "[]=";
      }
      return "[]";
    }
    if (this.at(K.LeftParen) && this.kindAt(1) === K.RightParen) {
      this.advance();
      this.advance();
      return "()";
    }
    if (this.at(K.LeftParen) || this.atEnd()) {
      this.fail(`Expected an operator symbol but found ${this.describe(this.cur())}`);
    }
    return this.advance().text;
  }
  parseConstructorDecl(start, modifiers) {
    const nameTok = this.expect(K.New);
    this.expect(K.LeftParen);
    const params = this.parseParamList();
    this.expect(K.RightParen);
    const returnType = this.parseSignatureTail();
    const body = this.parseBlock();
    return {
      kind: "FunDecl",
      name: "new",
      nameRange: this.tokenRange(nameTok),
      params,
      returnType,
      body,
      isPublic: modifiers.has("pub"),
      isStatic: false,
      isAbstract: false,
      isOperator: false,
      range: this.rangeFrom(start)
    };
  }
  /** `get name(): T { ... }` / `set name(v: T) { ... }` (a `;` body in an interface). */
  parsePropertyDecl(start, modifiers) {
    this.advance();
    const nameTok = this.expectName("a property name");
    this.expect(K.LeftParen);
    const params = this.parseParamList();
    this.expect(K.RightParen);
    const returnType = this.parseSignatureTail();
    let body;
    if (this.at(K.LeftBrace)) {
      body = this.parseBlock();
    } else {
      body = { kind: "Block", statements: [], range: this.rangeFrom(this.prev()) };
      this.endStatement();
    }
    return {
      kind: "FunDecl",
      name: nameTok.text,
      nameRange: this.tokenRange(nameTok),
      params,
      returnType,
      body,
      isPublic: modifiers.has("pub"),
      isStatic: modifiers.has("static"),
      isAbstract: false,
      isOperator: false,
      range: this.rangeFrom(start)
    };
  }
  /** Supertypes after `:` and any number of `implements A, B [where ...]` clauses. */
  parseHeritage() {
    let superClass;
    const implementsList = [];
    if (this.eat(K.Colon)) {
      superClass = this.typeName(this.parseType());
      while (this.at(K.Comma) && this.kindAt(1) !== K.Implements) {
        this.advance();
        this.parseType();
      }
    }
    for (; ; ) {
      if (this.at(K.Comma) && this.kindAt(1) === K.Implements)
        this.advance();
      if (!this.at(K.Implements))
        break;
      this.advance();
      implementsList.push(this.typeName(this.parseType()));
      while (this.at(K.Comma) && this.kindAt(1) !== K.Implements) {
        this.advance();
        implementsList.push(this.typeName(this.parseType()));
      }
      if (this.at(K.Where))
        this.parseWhereClause();
    }
    if (this.at(K.Where))
      this.parseWhereClause();
    return { superClass, implementsList };
  }
  typeName(type) {
    return type.kind === "SimpleType" || type.kind === "GenericType" ? type.name : "";
  }
  /** `{ members }`. A body left open at end of file is reported but still returned. */
  parseBody(ctx) {
    this.expect(K.LeftBrace);
    const members = this.parseStatementList(K.RightBrace, ctx);
    this.closeBrace();
    return members;
  }
  parseClassDecl(start, modifiers) {
    this.expect(K.Class);
    const nameTok = this.expectDeclaredName("type");
    const typeParams = this.parseOptionalTypeParams();
    const { superClass, implementsList } = this.parseHeritage();
    const members = this.parseBody("class");
    return {
      kind: "ClassDecl",
      name: nameTok.text,
      nameRange: this.tokenRange(nameTok),
      isDynamic: modifiers.has("dynamic"),
      isAbstract: modifiers.has("abstract"),
      superClass,
      implements: implementsList.length > 0 ? implementsList : void 0,
      members,
      typeParams,
      range: this.rangeFrom(start)
    };
  }
  /** `template foundation Name [implements ...] { ... }` / `template overlay Name onto Base { ... }` */
  parseTemplateDecl(start) {
    this.expect(K.Template);
    this.advance();
    const nameTok = this.expectName("a template name");
    let superClass;
    if (this.at(K.Onto)) {
      this.advance();
      superClass = this.expectName("a template name").text;
    }
    const { implementsList } = this.parseHeritage();
    const members = this.parseBody("class");
    return {
      kind: "ClassDecl",
      name: nameTok.text,
      nameRange: this.tokenRange(nameTok),
      isDynamic: false,
      isAbstract: false,
      superClass,
      implements: implementsList.length > 0 ? implementsList : void 0,
      members,
      range: this.rangeFrom(start)
    };
  }
  parseStructDecl(start) {
    this.expect(K.Struct);
    const nameTok = this.expectDeclaredName("type");
    const typeParams = this.parseOptionalTypeParams();
    const { implementsList } = this.parseHeritage();
    const members = this.parseBody("struct");
    const fields = [];
    const methods = [];
    for (const rawMember of members) {
      const member = this.unwrapAnnotated(rawMember);
      if (!member)
        continue;
      if (member.kind === "FunDecl" || member.kind === "AsyncFunDecl") {
        methods.push(member);
      } else if ((member.kind === "LetDecl" || member.kind === "VarDecl") && member.pattern.kind === "IdentifierPattern") {
        fields.push({
          kind: "StructField",
          name: member.pattern.name,
          type: member.typeAnnotation ?? { kind: "SimpleType", name: "", range: member.pattern.range },
          defaultValue: member.initializer,
          isVar: member.kind === "VarDecl",
          range: member.range
        });
      }
    }
    return {
      kind: "StructDecl",
      name: nameTok.text,
      nameRange: this.tokenRange(nameTok),
      fields,
      methods,
      implements: implementsList.length > 0 ? implementsList : void 0,
      typeParams,
      range: this.rangeFrom(start)
    };
  }
  unwrapAnnotated(stmt) {
    let current = stmt;
    while (current && current.kind === "AnnotatedDecl")
      current = current.declaration;
    return current;
  }
  parseInterfaceDecl(start) {
    this.expect(K.Interface);
    const nameTok = this.expectDeclaredName("type");
    const typeParams = this.parseOptionalTypeParams();
    this.parseHeritage();
    const members = this.parseBody("interface");
    const methods = [];
    for (const rawMember of members) {
      const member = this.unwrapAnnotated(rawMember);
      if (member && member.kind === "FunDecl")
        methods.push(member);
    }
    return {
      kind: "InterfaceDecl",
      name: nameTok.text,
      nameRange: this.tokenRange(nameTok),
      methods,
      typeParams,
      range: this.rangeFrom(start)
    };
  }
  parseEnumDecl(start) {
    this.expect(K.Enum);
    const nameTok = this.expectDeclaredName("type");
    const typeParams = this.parseOptionalTypeParams();
    this.parseHeritage();
    this.expect(K.LeftBrace);
    const variants = [];
    while (!this.at(K.RightBrace) && !this.atEnd()) {
      if (this.at(K.Comma) || this.at(K.Semicolon)) {
        this.advance();
        continue;
      }
      this.skipAnnotations();
      if (this.at(K.RightBrace))
        break;
      if (this.at(K.Fun) || this.at(K.Pub) || this.at(K.Static)) {
        const member = this.tryParseDeclaration("class");
        if (member)
          continue;
      }
      const varStart = this.cur();
      const varName = this.expectDeclaredName("enum variant").text;
      const fields = [];
      if (this.at(K.LeftParen) || this.at(K.LeftBrace)) {
        const close = this.at(K.LeftParen) ? K.RightParen : K.RightBrace;
        this.advance();
        while (!this.at(close)) {
          if (this.at(K.Comma) || this.at(K.Semicolon)) {
            this.advance();
            continue;
          }
          this.skipAnnotations();
          const fStart = this.cur();
          let fieldName = "";
          if (this.isWord(this.cur()) && this.kindAt(1) === K.Colon) {
            fieldName = this.advance().text;
            this.advance();
          }
          const type = this.parseType();
          const defaultValue = this.eat(K.Assign) ? this.parseExpression() : void 0;
          fields.push({ kind: "Parameter", name: fieldName, type, defaultValue, range: this.rangeFrom(fStart) });
          if (!this.at(K.Comma) && !this.at(K.Semicolon) && !this.at(close) && !this.startsLine()) {
            this.fail(`Expected ',' or '${close}' but found ${this.describe(this.cur())}`);
          }
        }
        this.expect(close);
      }
      if (this.eat(K.Assign))
        this.parseExpression();
      variants.push({ kind: "EnumVariant", name: varName, fields, range: this.rangeFrom(varStart) });
      if (!this.at(K.Comma) && !this.at(K.Semicolon) && !this.at(K.RightBrace) && !this.atEnd() && !this.startsLine()) {
        this.fail(`Expected ',' or '}' but found ${this.describe(this.cur())}`);
      }
    }
    this.closeBrace();
    return { kind: "EnumDecl", name: nameTok.text, nameRange: this.tokenRange(nameTok), variants, typeParams, range: this.rangeFrom(start) };
  }
  parseTypeAliasDecl(start) {
    this.expect(K.Type);
    const nameTok = this.expectDeclaredName("type");
    const typeParams = this.parseOptionalTypeParams();
    let value = { kind: "SimpleType", name: "", range: this.tokenRange(nameTok) };
    if (this.eat(K.Colon)) {
      this.parseType();
      while (this.eat(K.Plus))
        this.parseType();
    }
    if (this.eat(K.Assign))
      value = this.parseType();
    this.endStatement();
    return { kind: "TypeAliasDecl", name: nameTok.text, nameRange: this.tokenRange(nameTok), typeParams, value, range: this.rangeFrom(start) };
  }
  parseMacroDecl(start) {
    this.expect(K.Macro);
    const nameTok = this.expectDeclaredName("macro");
    this.expect(K.LeftParen);
    const params = this.parseParamList();
    this.expect(K.RightParen);
    const body = this.parseBlock();
    return { kind: "MacroDecl", name: nameTok.text, nameRange: this.tokenRange(nameTok), params, body, range: this.rangeFrom(start) };
  }
  /** `namespace a.b.c;` or `namespace a.b { ... }` */
  parseNamespaceDecl(start = this.cur()) {
    this.expect(K.Namespace);
    let name = this.expectName("a namespace name").text;
    while (this.at(K.Dot)) {
      this.advance();
      name += "." + this.expectName("a namespace name").text;
    }
    let body;
    if (this.at(K.LeftBrace)) {
      body = this.parseBody("top");
    } else {
      this.endStatement();
    }
    return { kind: "NamespaceDecl", name, body, range: this.rangeFrom(start) };
  }
  // ---- Imports ----
  /** The module path of an import: `core.text`, `.`, `..sibling`, `.pkg.mod`. */
  parseModulePath() {
    let path = "";
    for (; ; ) {
      const tok = this.cur();
      if (tok.kind === K.Import || tok.kind === K.Defer || tok.kind === K.As || tok.kind === K.Prefer)
        break;
      if (tok.kind === K.Dot || tok.kind === K.DotDot || tok.kind === K.DotDotDot || this.isWord(tok)) {
        if (path !== "" && !this.sameLine())
          break;
        path += this.advance().text;
        continue;
      }
      break;
    }
    if (path === "")
      this.fail(`Expected a module path but found ${this.describe(this.cur())}`);
    return path;
  }
  parseImportNames() {
    this.expect(K.LeftParen);
    const names = [];
    while (!this.at(K.RightParen)) {
      const nameTok = this.at(K.Star) ? this.advance() : this.expectName("an imported name");
      let alias;
      if (this.eat(K.As))
        alias = this.expectDeclaredName("import alias").text;
      names.push({ kind: "ImportName", name: nameTok.text, alias, range: this.rangeFrom(nameTok) });
      if (!this.eat(K.Comma))
        break;
    }
    this.expect(K.RightParen);
    return names;
  }
  parsePreferCompiled() {
    if (!this.at(K.Prefer))
      return false;
    this.advance();
    this.expect(K.Compiled);
    return true;
  }
  /** `from path import (names) [prefer compiled];`, `from path defer import (...)`, `from path { ... }` */
  parseImportStmt(isReExport, start = this.cur()) {
    this.expect(K.From);
    const path = this.parseModulePath();
    if (this.at(K.LeftBrace)) {
      this.advance();
      const imports = [];
      while (!this.at(K.RightBrace) && !this.atEnd()) {
        if (this.eat(K.Semicolon))
          continue;
        const itemStart = this.cur();
        const subPath = this.parseModulePath();
        this.eat(K.Defer);
        this.expect(K.Import);
        const names2 = this.parseImportNames();
        const preferCompiled2 = this.parsePreferCompiled();
        imports.push({ kind: "ImportStmt", path: subPath, names: names2, preferCompiled: preferCompiled2, range: this.rangeFrom(itemStart) });
        if (!this.at(K.RightBrace))
          this.endStatement();
      }
      this.closeBrace();
      return { kind: "ImportBlockStmt", path, imports, range: this.rangeFrom(start) };
    }
    this.eat(K.Defer);
    this.expect(K.Import);
    const names = this.parseImportNames();
    const preferCompiled = this.parsePreferCompiled();
    this.endStatement();
    if (isReExport)
      return { kind: "ReExportStmt", path, names, range: this.rangeFrom(start) };
    return { kind: "ImportStmt", path, names, preferCompiled, range: this.rangeFrom(start) };
  }
  /** `import path [as name] [prefer compiled];` binds the module itself. */
  parseModuleImport() {
    const start = this.cur();
    this.expect(K.Import);
    const pathStart = this.cur();
    const path = this.parseModulePath();
    const pathEnd = this.prev();
    const names = [];
    if (this.eat(K.As)) {
      const aliasTok = this.expectName("an alias");
      names.push({ kind: "ImportName", name: aliasTok.text, range: this.tokenRange(aliasTok) });
    } else if (pathStart === pathEnd && this.isWord(pathStart)) {
      names.push({ kind: "ImportName", name: path, range: this.tokenRange(pathStart) });
    }
    const preferCompiled = this.parsePreferCompiled();
    this.endStatement();
    return { kind: "ImportStmt", path, names, preferCompiled, range: this.rangeFrom(start) };
  }
  /** `extern js func|val ...;`, `extern native "lib" func|val ...;` */
  parseExternDecl(start = this.cur()) {
    this.expect(K.Extern);
    let library;
    const isJs = this.at(K.Js);
    if (isJs) {
      this.advance();
    } else if (this.at(K.Native)) {
      this.advance();
    }
    if (this.at(K.StringLiteral))
      library = this.advance().text.slice(1, -1);
    if (this.at(K.LeftBrace)) {
      const body = this.parseBody("interface");
      return { kind: "Block", statements: body, range: this.rangeFrom(start) };
    }
    if (this.at(K.Fun)) {
      this.advance();
      const nameTok = this.expectName("a function name");
      this.parseOptionalTypeParams();
      this.expect(K.LeftParen);
      const params = this.parseParamList();
      this.expect(K.RightParen);
      const returnType = this.parseSignatureTail() ?? { kind: "SimpleType", name: "void", range: this.tokenRange(nameTok) };
      this.endStatement();
      if (isJs || library === void 0) {
        return { kind: "ExternJsFunDecl", name: nameTok.text, nameRange: this.tokenRange(nameTok), params, returnType, range: this.rangeFrom(start) };
      }
      return { kind: "ExternNativeFunDecl", library, name: nameTok.text, nameRange: this.tokenRange(nameTok), params, returnType, range: this.rangeFrom(start) };
    }
    if (this.at(K.Val) || this.at(K.Let) || this.at(K.Var)) {
      this.advance();
      const nameTok = this.expectName("a name");
      this.expect(K.Colon);
      const type = this.parseType();
      this.endStatement();
      if (isJs || library === void 0) {
        return { kind: "ExternJsValDecl", name: nameTok.text, nameRange: this.tokenRange(nameTok), type, range: this.rangeFrom(start) };
      }
      return { kind: "ExternNativeValDecl", library, name: nameTok.text, nameRange: this.tokenRange(nameTok), type, range: this.rangeFrom(start) };
    }
    this.fail(`Expected 'func' or 'val' in an extern declaration but found ${this.describe(this.cur())}`);
  }
  // ---- Control flow ----
  parseCondition() {
    this.expect(K.LeftParen);
    const condition = this.parseExpression();
    this.expect(K.RightParen);
    return condition;
  }
  parseIfStmt() {
    const start = this.cur();
    this.expect(K.If);
    this.eat(K.Const);
    const condition = this.parseCondition();
    const consequent = this.parseBlock();
    const root = { kind: "IfStmt", condition, consequent, range: this.rangeFrom(start) };
    let tail = root;
    while (this.at(K.Else)) {
      this.advance();
      if (this.at(K.If)) {
        const elifStart = this.advance();
        this.eat(K.Const);
        const elifCondition = this.parseCondition();
        const elifBlock = this.parseBlock();
        const next = { kind: "IfStmt", condition: elifCondition, consequent: elifBlock, range: this.rangeFrom(elifStart) };
        tail.alternate = next;
        tail = next;
      } else {
        tail.alternate = this.parseBlock();
        break;
      }
    }
    root.range = this.rangeFrom(start);
    return root;
  }
  parseWhileStmt(label) {
    const start = this.cur();
    this.expect(K.While);
    const condition = this.parseCondition();
    const body = this.parseBlock();
    return { kind: "WhileStmt", condition, body, label, range: this.rangeFrom(start) };
  }
  parseForStmt(label) {
    const start = this.cur();
    this.expect(K.For);
    this.eat(K.Concurrent);
    const isAwait = this.eat(K.Await);
    const open = this.expect(K.LeftParen);
    if (isAwait || this.hasInAhead()) {
      let pattern;
      let iterable;
      do {
        if (this.at(K.Let) || this.at(K.Var))
          this.advance();
        const p = this.parseDestructPattern();
        this.expect(K.In);
        const it = this.parseExpression();
        pattern = pattern ?? p;
        iterable = iterable ?? it;
      } while (this.eat(K.Comma));
      this.expect(K.RightParen);
      const body2 = this.parseBlock();
      const kind = isAwait ? "ForAwaitStmt" : "ForInStmt";
      return { kind, pattern, iterable, body: body2, label, range: this.rangeFrom(start) };
    }
    let init = { kind: "Block", statements: [], range: this.tokenRange(open) };
    if (!this.at(K.Semicolon)) {
      const initStart = this.cur();
      if (this.at(K.Let) || this.at(K.Var) || this.at(K.Const)) {
        init = this.parseBindingDecl(initStart);
      } else {
        init = { kind: "ExpressionStmt", expression: this.parseExpression(), range: this.rangeFrom(initStart) };
      }
    }
    this.expect(K.Semicolon);
    const condition = this.at(K.Semicolon) ? { kind: "BoolLiteral", value: true, range: this.tokenRange(this.cur()) } : this.parseExpression();
    this.expect(K.Semicolon);
    const step = this.at(K.RightParen) ? { kind: "BoolLiteral", value: true, range: this.tokenRange(this.cur()) } : this.parseExpression();
    this.expect(K.RightParen);
    const body = this.parseBlock();
    return { kind: "ForStmt", init, condition, step, body, label, range: this.rangeFrom(start) };
  }
  /** Just past `for (`: is there an `in` at bracket depth 0 before a `;` or the closing `)`? */
  hasInAhead() {
    return this.hasInAheadFrom(this.pos);
  }
  hasInAheadFrom(from) {
    let nesting = 0;
    for (let i = from; i < this.tokens.length; i++) {
      const kind = this.tokens[i].kind;
      if (kind === K.LeftParen || kind === K.LeftBracket || kind === K.LeftBrace || kind === K.BangLeftBrace) {
        nesting++;
      } else if (kind === K.RightParen || kind === K.RightBracket || kind === K.RightBrace) {
        if (nesting === 0)
          return false;
        nesting--;
      } else if (nesting === 0) {
        if (kind === K.In)
          return true;
        if (kind === K.Semicolon || kind === K.Assign)
          return false;
      }
    }
    return false;
  }
  parseDoWhileStmt(label) {
    const start = this.cur();
    this.expect(K.Do);
    const body = this.parseBlock();
    this.expect(K.While);
    const condition = this.parseCondition();
    this.endStatement();
    return { kind: "DoWhileStmt", body, condition, label, range: this.rangeFrom(start) };
  }
  parseTryStmt() {
    const start = this.cur();
    this.expect(K.Try);
    const tryBlock = this.parseBlock();
    const catchClauses = [];
    while (this.at(K.Catch)) {
      const cStart = this.advance();
      const types = [];
      let name;
      if (this.isWord(this.cur()) && this.kindAt(1) === K.LeftParen) {
        types.push(this.advance().text);
      }
      if (this.at(K.LeftParen)) {
        const close = this.matchingClose(this.pos);
        if (close < 0)
          this.fail("Expected ')' to close the catch clause", this.cur());
        for (let i = this.pos + 1; i < close; i++) {
          const tok = this.tokens[i];
          if (tok.kind === K.As && this.isWord(this.tokens[i + 1])) {
            name = this.tokens[i + 1].text;
            break;
          }
          if (this.isWord(tok) && this.tokens[i - 1].kind !== K.Dot)
            types.push(tok.text);
        }
        if (name === void 0 && types.length > 0 && close - this.pos >= 2 && this.isWord(this.tokens[this.pos + 1])) {
          const first = this.tokens[this.pos + 1].text;
          if (close - this.pos === 2 || this.tokens[this.pos + 2].kind === K.Colon) {
            name = first;
            types.splice(types.indexOf(first), 1);
          }
        }
        this.skipBalanced();
      }
      const body = this.parseBlock();
      catchClauses.push({ kind: "CatchClause", types, name, body, range: this.rangeFrom(cStart) });
    }
    let finallyBlock;
    if (this.eat(K.Finally))
      finallyBlock = this.parseBlock();
    return { kind: "TryStmt", tryBlock, catchClauses, finallyBlock, range: this.rangeFrom(start) };
  }
  parseWithStmt() {
    const start = this.cur();
    this.expect(K.With);
    this.expect(K.LeftParen);
    const bindings = [];
    while (!this.at(K.RightParen)) {
      const bStart = this.cur();
      let name = "";
      if (this.isWord(bStart) && this.kindAt(1) === K.Assign) {
        name = this.advance().text;
        this.advance();
      }
      const resource = this.parseExpression();
      bindings.push({ kind: "WithBinding", name, resource, range: this.rangeFrom(bStart) });
      if (!this.eat(K.Comma))
        break;
    }
    this.expect(K.RightParen);
    const body = this.parseBlock();
    return { kind: "WithStmt", bindings, body, range: this.rangeFrom(start) };
  }
  parseDeferStmt() {
    const start = this.cur();
    this.expect(K.Defer);
    if (this.at(K.LeftBrace)) {
      const body = this.parseBlock();
      return { kind: "DeferBlockStmt", body, range: this.rangeFrom(start) };
    }
    const expression = this.parseExpression();
    this.endStatement();
    return { kind: "DeferCallStmt", expression, range: this.rangeFrom(start) };
  }
  parsePortalStmt() {
    const start = this.cur();
    this.expect(K.Portal);
    let name;
    if (this.at(K.StringLiteral)) {
      name = this.advance().text.slice(1, -1);
    } else {
      name = this.expectName("a portal name").text;
    }
    const body = this.parseBlock();
    return { kind: "PortalStmt", name, body, range: this.rangeFrom(start) };
  }
  parseAwaitGroupStmt() {
    const start = this.cur();
    this.expect(K.Await);
    this.expect(K.Group);
    const body = this.parseBlock();
    return { kind: "AwaitGroupStmt", body, range: this.rangeFrom(start) };
  }
  /** `dynamic obj as alias { ... }`; `dynamic` alone is an ordinary name. */
  parseDynamicViewStmt() {
    const start = this.cur();
    const next = this.peekTok(1);
    const startsOperand = next.line === start.endLine && (this.isWord(next) || next.kind === K.LeftParen) && !NOT_AN_EXPRESSION.has(next.kind);
    if (!startsOperand)
      return this.parseExpressionStmt();
    this.advance();
    let object = this.parseExpression();
    let alias = "";
    if (object.kind === "CastExpr" && object.targetType.kind === "SimpleType") {
      alias = object.targetType.name;
      object = object.expression;
    }
    const body = this.parseBlock();
    return { kind: "DynamicViewStmt", object, alias, body, range: this.rangeFrom(start) };
  }
  /** `asm { ... }` and `quote { ... }`: the body is not Loup statement syntax; skip it as a token tree. */
  parseOpaqueBlock(name) {
    const start = this.advance();
    this.skipBalanced();
    this.eat(K.Semicolon);
    return {
      kind: "ExpressionStmt",
      expression: { kind: "Identifier", name, range: this.tokenRange(start) },
      range: this.rangeFrom(start)
    };
  }
  parseDelStmt() {
    const start = this.cur();
    this.expect(K.Del);
    const target = this.parseExpression();
    this.endStatement();
    return { kind: "DelStmt", target, range: this.rangeFrom(start) };
  }
  parseGlobalDecl() {
    const start = this.cur();
    this.expect(K.Global);
    const name = this.expectName("a name").text;
    while (this.eat(K.Comma))
      this.expectName("a name");
    this.endStatement();
    return { kind: "GlobalDecl", name, range: this.rangeFrom(start) };
  }
  parseNonlocalDecl() {
    const start = this.cur();
    this.expect(K.Nonlocal);
    const name = this.expectName("a name").text;
    while (this.eat(K.Comma))
      this.expectName("a name");
    this.endStatement();
    return { kind: "NonlocalDecl", name, range: this.rangeFrom(start) };
  }
  parseYieldStmt() {
    const start = this.cur();
    this.expect(K.Yield);
    if (this.at(K.Star)) {
      this.advance();
      const iterable = this.parseExpression();
      this.endStatement();
      return { kind: "YieldFromStmt", iterable, range: this.rangeFrom(start) };
    }
    const value = this.startsExpression() && this.sameLine() ? this.parseExpression() : void 0;
    this.endStatement();
    return { kind: "YieldStmt", value, range: this.rangeFrom(start) };
  }
  parseLabeledStmt() {
    const label = this.advance().text;
    this.expect(K.Colon);
    if (this.at(K.For))
      return this.parseForStmt(label);
    if (this.at(K.While))
      return this.parseWhileStmt(label);
    return this.parseDoWhileStmt(label);
  }
  parseExpressionStmt() {
    const start = this.cur();
    const expression = this.parseExpression();
    if (expression.kind === "StatementExpr" && (start.kind === K.If || start.kind === K.Match)) {
      return this.finishBlockExpression(expression, start);
    }
    this.endStatement();
    return { kind: "ExpressionStmt", expression, range: this.rangeFrom(start) };
  }
  parseBlock() {
    const start = this.cur();
    this.expect(K.LeftBrace);
    const statements = this.parseStatementList(K.RightBrace, "block");
    this.closeBrace();
    return { kind: "Block", statements, range: this.rangeFrom(start) };
  }
  /**
   * The `}` of a block or body. Reaching end of file instead is reported without
   * throwing, so the declaration being typed keeps its place in the outline.
   */
  closeBrace() {
    if (this.at(K.RightBrace)) {
      this.advance();
      return;
    }
    if (this.atEnd()) {
      this.addDiagnostic("Expected '}' but found end of file", this.rangeAfterPrev());
      return;
    }
    this.fail(`Expected '}' but found ${this.describe(this.cur())}`);
  }
  // ==========================================================================
  // Expressions
  // ==========================================================================
  parseExpression() {
    this.enter();
    try {
      return this.parseAssignment();
    } finally {
      this.depth--;
    }
  }
  parseAssignment() {
    const left = this.parseNullCoalesce();
    if (this.at(K.Assign)) {
      this.advance();
      const value = this.parseExpression();
      return { kind: "AssignExpr", target: left, value, range: this.spanFrom(left) };
    }
    if (COMPOUND_ASSIGN.has(this.cur().kind)) {
      const operator = this.advance().text;
      const value = this.parseExpression();
      return { kind: "CompoundAssignExpr", operator, target: left, value, range: this.spanFrom(left) };
    }
    return left;
  }
  parseNullCoalesce() {
    let left = this.parseOr();
    while (this.at(K.QuestionQuestion)) {
      this.advance();
      const right = this.parseOr();
      left = { kind: "NullCoalesceExpr", left, right, range: this.spanFrom(left) };
    }
    return left;
  }
  parseOr() {
    let left = this.parseAnd();
    while (this.at(K.Or)) {
      this.advance();
      const right = this.parseAnd();
      left = { kind: "BinaryExpr", operator: "||", left, right, range: this.spanFrom(left) };
    }
    return left;
  }
  parseAnd() {
    let left = this.parseBitwiseOr();
    while (this.at(K.And)) {
      this.advance();
      const right = this.parseBitwiseOr();
      left = { kind: "BinaryExpr", operator: "&&", left, right, range: this.spanFrom(left) };
    }
    return left;
  }
  parseBitwiseOr() {
    let left = this.parseBitwiseXor();
    while (this.at(K.Pipe)) {
      this.advance();
      const right = this.parseBitwiseXor();
      left = { kind: "BinaryExpr", operator: "|", left, right, range: this.spanFrom(left) };
    }
    return left;
  }
  parseBitwiseXor() {
    let left = this.parseBitwiseAnd();
    while (this.at(K.Caret)) {
      this.advance();
      const right = this.parseBitwiseAnd();
      left = { kind: "BinaryExpr", operator: "^", left, right, range: this.spanFrom(left) };
    }
    return left;
  }
  parseBitwiseAnd() {
    let left = this.parseEquality();
    while (this.at(K.Ampersand)) {
      this.advance();
      const right = this.parseEquality();
      left = { kind: "BinaryExpr", operator: "&", left, right, range: this.spanFrom(left) };
    }
    return left;
  }
  parseEquality() {
    let left = this.parseComparison();
    while (this.at(K.EqualEqual) || this.at(K.BangEqual)) {
      const operator = this.advance().text;
      const right = this.parseComparison();
      left = { kind: "BinaryExpr", operator, left, right, range: this.spanFrom(left) };
    }
    return left;
  }
  parseComparison() {
    let left = this.parseMembership();
    while (this.at(K.LessThan) || this.at(K.LessEqual) || this.at(K.GreaterThan) || this.at(K.GreaterEqual)) {
      const operator = this.advance().text;
      const right = this.parseMembership();
      left = { kind: "BinaryExpr", operator, left, right, range: this.spanFrom(left) };
    }
    return left;
  }
  parseMembership() {
    let left = this.parseShift();
    while (this.at(K.In) || this.at(K.Not) && this.kindAt(1) === K.In) {
      const operator = this.at(K.Not) ? (this.advance(), "not in") : "in";
      this.expect(K.In);
      const right = this.parseShift();
      left = { kind: "BinaryExpr", operator, left, right, range: this.spanFrom(left) };
    }
    return left;
  }
  parseShift() {
    let left = this.parseRange();
    while (this.at(K.ShiftLeft) || this.at(K.ShiftRight)) {
      const operator = this.advance().text;
      const right = this.parseRange();
      left = { kind: "BinaryExpr", operator, left, right, range: this.spanFrom(left) };
    }
    return left;
  }
  parseRange() {
    let left = this.parseAddition();
    while (this.at(K.DotDot) || this.at(K.DotDotEqual)) {
      const operator = this.advance().text;
      if (!this.startsExpression()) {
        return { kind: "UnaryExpr", operator, operand: left, range: this.spanFrom(left) };
      }
      const right = this.parseAddition();
      left = { kind: "BinaryExpr", operator, left, right, range: this.spanFrom(left) };
    }
    return left;
  }
  parseAddition() {
    let left = this.parseMultiplication();
    while (this.at(K.Plus) || this.at(K.Minus)) {
      const operator = this.advance().text;
      const right = this.parseMultiplication();
      left = { kind: "BinaryExpr", operator, left, right, range: this.spanFrom(left) };
    }
    return left;
  }
  parseMultiplication() {
    let left = this.parseExponentiation();
    while (this.at(K.Star) || this.at(K.Slash) || this.at(K.SlashSlash) || this.at(K.Percent)) {
      const operator = this.advance().text;
      const right = this.parseExponentiation();
      left = { kind: "BinaryExpr", operator, left, right, range: this.spanFrom(left) };
    }
    return left;
  }
  parseExponentiation() {
    const left = this.parseUnary();
    if (this.at(K.StarStar)) {
      const operator = this.advance().text;
      const right = this.parseExponentiation();
      return { kind: "BinaryExpr", operator, left, right, range: this.spanFrom(left) };
    }
    return left;
  }
  parseUnary() {
    this.enter();
    try {
      return this.parseUnaryInner();
    } finally {
      this.depth--;
    }
  }
  parseUnaryInner() {
    const start = this.cur();
    switch (start.kind) {
      case K.Bang:
      case K.Minus:
      case K.Plus:
      case K.Tilde:
      case K.Not:
      case K.Bnot:
      case K.Typeof:
      case K.Attempt:
      case K.Consume: {
        this.advance();
        const operand = this.parseUnary();
        return { kind: "UnaryExpr", operator: start.text, operand, range: this.rangeFrom(start) };
      }
      case K.Star:
      case K.StarStar: {
        this.advance();
        let operator = start.kind === K.Star ? "*" : "**";
        if (operator === "*" && this.at(K.Star)) {
          this.advance();
          operator = "**";
        }
        const expression = this.parseUnary();
        return { kind: "SpreadExpr", operator, expression, range: this.rangeFrom(start) };
      }
      case K.DotDot:
      case K.DotDotEqual: {
        this.advance();
        const operand = this.parseAddition();
        return { kind: "UnaryExpr", operator: start.text, operand, range: this.rangeFrom(start) };
      }
      case K.Await: {
        this.advance();
        const expression = this.parseUnary();
        return { kind: "AwaitExpr", expression, range: this.rangeFrom(start) };
      }
      case K.Spawn:
        if (this.startsExpressionAt(1) && this.kindAt(1) !== K.LeftParen) {
          this.advance();
          const expression = this.parseUnary();
          return { kind: "SpawnExpr", expression, range: this.rangeFrom(start) };
        }
        break;
      case K.Box:
        if (this.startsOperandAt(1)) {
          this.advance();
          const expression = this.parseUnary();
          return { kind: "BoxExpr", expression, range: this.rangeFrom(start) };
        }
        break;
      case K.Shared:
        this.advance();
        if (this.at(K.LeftParen))
          this.skipBalanced();
        return this.parseUnary();
      default:
        break;
    }
    return this.parsePostfix();
  }
  /** Is the token `offset` ahead the start of an operand on the current token's line? */
  startsOperandAt(offset) {
    const tok = this.peekTok(offset);
    if (tok.line !== this.cur().endLine)
      return false;
    switch (tok.kind) {
      case K.Identifier:
      case K.TypeIdentifier:
      case K.IntLiteral:
      case K.FloatLiteral:
      case K.StringLiteral:
      case K.CharLiteral:
      case K.InterpolatedStringLiteral:
      case K.RawStringLiteral:
      case K.BytesLiteral:
      case K.MultilineStringLiteral:
      case K.True:
      case K.False:
      case K.None:
      case K.This:
      case K.Self:
      case K.LeftBrace:
      case K.MacroSplice:
      case K.Fun:
      case K.Match:
      case K.If:
      case K.Minus:
      case K.Not:
      case K.Box:
      case K.Await:
        return true;
      default:
        return isKeywordKind(tok.kind) && !NOT_AN_EXPRESSION.has(tok.kind) && this.peekTok(offset + 1).kind !== K.Assign;
    }
  }
  parsePostfix() {
    return this.parsePostfixOps(this.parsePrimary());
  }
  parsePostfixOps(operand) {
    let expr = operand;
    for (; ; ) {
      const tok = this.cur();
      switch (tok.kind) {
        case K.LeftParen: {
          const args = this.parseArgs();
          expr = { kind: "CallExpr", callee: expr, args, range: this.spanFrom(expr) };
          continue;
        }
        case K.Dot: {
          this.advance();
          const member = this.cur();
          if (!this.isWord(member) && member.kind !== K.IntLiteral && member.kind !== K.FloatLiteral && member.kind !== K.MacroSplice) {
            this.fail(`Expected a member name after '.' but found ${this.describe(member)}`);
          }
          this.advance();
          expr = { kind: "MemberExpr", object: expr, property: member.text, range: this.spanFrom(expr) };
          continue;
        }
        case K.QuestionDot: {
          this.advance();
          if (this.at(K.LeftBracket)) {
            expr = this.parseIndex(expr, true);
          } else {
            const member = this.cur();
            if (!this.isWord(member) && member.kind !== K.IntLiteral) {
              this.fail(`Expected a member name after '?.' but found ${this.describe(member)}`);
            }
            this.advance();
            expr = { kind: "OptionalChainExpr", object: expr, property: member.text, range: this.spanFrom(expr) };
          }
          continue;
        }
        case K.LeftBracket:
          expr = this.parseIndex(expr, false);
          continue;
        case K.BangLeftBrace: {
          this.advance();
          const fieldTok = this.advance();
          const field = fieldTok.kind === K.StringLiteral ? fieldTok.text.slice(1, -1) : fieldTok.text;
          this.expect(K.RightBrace);
          expr = { kind: "DynamicFieldExpr", object: expr, field, range: this.spanFrom(expr) };
          continue;
        }
        case K.Question:
          this.advance();
          expr = { kind: "PropagationExpr", expression: expr, range: this.spanFrom(expr) };
          continue;
        case K.Bang:
          this.advance();
          expr = { kind: "UnaryExpr", operator: "!", operand: expr, range: this.spanFrom(expr) };
          continue;
        case K.As: {
          this.advance();
          let safe = false;
          if ((this.at(K.Question) || this.at(K.Bang)) && this.cur().offset === this.prev().offset + this.prev().length) {
            safe = this.at(K.Question);
            this.advance();
          }
          const targetType = this.parseTypeNoUnion();
          expr = { kind: "CastExpr", expression: expr, targetType, safe, range: this.spanFrom(expr) };
          continue;
        }
        case K.Is: {
          this.advance();
          const negated = this.eat(K.Not);
          const targetType = this.parseTypeNoUnion();
          expr = { kind: "IsExpr", expression: expr, targetType, range: this.spanFrom(expr) };
          if (negated)
            expr = { kind: "UnaryExpr", operator: "not", operand: expr, range: expr.range };
          continue;
        }
        case K.Instanceof: {
          this.advance();
          const targetType = this.parseTypeNoUnion();
          expr = { kind: "IsExpr", expression: expr, targetType, range: this.spanFrom(expr) };
          continue;
        }
        case K.With:
          if (this.kindAt(1) === K.LeftParen && this.sameLine()) {
            this.advance();
            const args = this.parseArgs();
            expr = { kind: "CallExpr", callee: expr, args, range: this.spanFrom(expr) };
            continue;
          }
          return expr;
        default:
          return expr;
      }
    }
  }
  /** `( args )`: positional, named (`a = 1`, `a: 1`), verb acknowledgments (`edits: x`), spreads. */
  parseArgs() {
    this.expect(K.LeftParen);
    const args = [];
    while (!this.at(K.RightParen)) {
      if (this.at(K.At)) {
        this.parseAnnotation();
        if (this.at(K.Comma)) {
          this.advance();
          continue;
        }
        if (this.at(K.RightParen))
          break;
      }
      if (this.isWord(this.cur()) && this.kindAt(1) === K.Colon) {
        this.advance();
        this.advance();
      }
      let arg = this.parseExpression();
      if (this.at(K.For))
        arg = this.parseComprehensionTail(arg, "list", arg);
      args.push(arg);
      if (!this.eat(K.Comma))
        break;
    }
    this.expect(K.RightParen);
    return args;
  }
  /** `[i]`, `[a:b:c]`, `[i, j:k, ::2]` and explicit type arguments `f[T](x)`. */
  parseIndex(object, optional) {
    this.expect(K.LeftBracket);
    let first;
    let slice;
    let count = 0;
    while (!this.at(K.RightBracket)) {
      let start;
      if (!this.at(K.Colon))
        start = this.parseExpression();
      if (this.at(K.Colon)) {
        this.advance();
        const end = this.atIndexBoundary() ? void 0 : this.parseExpression();
        let step;
        if (this.eat(K.Colon))
          step = this.atIndexBoundary() ? void 0 : this.parseExpression();
        if (count === 0)
          slice = { start, end, step };
      } else if (count === 0) {
        first = start;
      }
      count++;
      if (!this.eat(K.Comma))
        break;
    }
    this.expect(K.RightBracket);
    const range = this.spanFrom(object);
    if (slice) {
      return { kind: "SliceExpr", object, start: slice.start, end: slice.end, step: slice.step, optional: optional || void 0, range };
    }
    const index = first ?? { kind: "TupleLiteral", elements: [], range };
    return { kind: "IndexExpr", object, index, optional: optional || void 0, range };
  }
  atIndexBoundary() {
    return this.at(K.RightBracket) || this.at(K.Colon) || this.at(K.Comma);
  }
  parsePrimary() {
    const token = this.cur();
    switch (token.kind) {
      case K.IntLiteral:
        this.advance();
        return { kind: "IntLiteral", value: token.text, range: this.tokenRange(token) };
      case K.FloatLiteral:
        this.advance();
        return { kind: "FloatLiteral", value: token.text, range: this.tokenRange(token) };
      case K.StringLiteral:
      case K.CharLiteral:
      case K.RawStringLiteral:
      case K.MultilineStringLiteral:
        this.advance();
        this.checkTerminated(token, "string literal");
        return { kind: "StringLiteral", value: token.text, hasInterpolation: false, range: this.tokenRange(token) };
      case K.InterpolatedStringLiteral:
        this.advance();
        this.checkTerminated(token, "string literal");
        return { kind: "StringLiteral", value: token.text, hasInterpolation: token.text.includes("{$"), range: this.tokenRange(token) };
      case K.BytesLiteral:
        this.advance();
        this.checkTerminated(token, "bytes literal");
        return { kind: "BytesLiteral", value: token.text, range: this.tokenRange(token) };
      case K.TemplateFenceOpen:
        this.advance();
        this.checkTerminated(token, "template fence");
        return { kind: "TemplateFenceExpr", language: "", format: "", descriptors: {}, content: token.text, range: this.tokenRange(token) };
      case K.True:
      case K.False:
        this.advance();
        return { kind: "BoolLiteral", value: token.kind === K.True, range: this.tokenRange(token) };
      case K.None:
        this.advance();
        return { kind: "NoneLiteral", range: this.tokenRange(token) };
      case K.MacroSplice:
        this.advance();
        return { kind: "Identifier", name: token.text, range: this.tokenRange(token) };
      case K.Match:
        return this.parseMatchExpr();
      case K.If: {
        const statement = this.parseIfStmt();
        return { kind: "StatementExpr", statement, range: statement.range };
      }
      case K.Fun:
        return this.parseFunExpr();
      case K.Async:
        if (this.kindAt(1) === K.Fun || this.kindAt(1) === K.Gen && this.kindAt(2) === K.Fun)
          return this.parseFunExpr();
        break;
      case K.Gen:
        if (this.kindAt(1) === K.Fun)
          return this.parseFunExpr();
        this.fail(`Expected an expression but found ${this.describe(token)}`);
        break;
      case K.LifetimeLabel:
        this.advance();
        return { kind: "Identifier", name: token.text, range: this.tokenRange(token) };
      case K.Fn:
      case K.Noescape:
        if (this.kindAt(1) === K.LeftParen || this.kindAt(1) === K.Fn) {
          const type = this.parseType();
          return { kind: "Identifier", name: "fn", range: type.range };
        }
        break;
      case K.Return:
      case K.Break:
      case K.Continue:
      case K.Throw:
        return this.parseJump();
      case K.Yield: {
        const statement = this.parseYieldExprAsStatement();
        return { kind: "StatementExpr", statement, range: statement.range };
      }
      case K.Try: {
        const statement = this.parseTryStmt();
        return { kind: "StatementExpr", statement, range: statement.range };
      }
      case K.Unsafe:
      case K.Safe:
      case K.Atomic:
        if (token.kind === K.Unsafe && this.kindAt(1) === K.LeftParen || this.kindAt(1) === K.LeftBrace) {
          const close = token.kind === K.Unsafe ? this.matchingClose(this.pos + 1) : this.pos;
          if (close >= 0 && this.tokens[close + 1]?.kind === K.LeftBrace) {
            this.advance();
            if (this.at(K.LeftParen))
              this.skipBalanced();
            const statement = this.parseBlock();
            return { kind: "StatementExpr", statement, range: this.rangeFrom(token) };
          }
        }
        break;
      case K.New:
        if (this.isWord(this.peekTok(1)) && this.peekTok(1).line === token.endLine) {
          this.advance();
          const className = this.advance().text;
          const args = this.at(K.LeftParen) ? this.parseArgs() : [];
          return { kind: "NewExpr", className, args, range: this.rangeFrom(token) };
        }
        break;
      case K.Dot:
        if (this.isWord(this.peekTok(1))) {
          this.advance();
          const member = this.advance();
          return { kind: "Identifier", name: "." + member.text, range: this.rangeFrom(token) };
        }
        break;
      case K.At: {
        this.parseAnnotation();
        return this.parseExpression();
      }
      case K.LeftParen:
        return this.parseParenthesized();
      case K.LeftBracket:
        return this.parseListLiteral();
      case K.LeftBrace:
        return this.parseBraceLiteral();
      case K.Identifier:
      case K.TypeIdentifier:
        break;
      default:
        if (!isKeywordKind(token.kind) || NOT_AN_EXPRESSION.has(token.kind)) {
          this.fail(`Expected an expression but found ${this.describe(token)}`);
        }
        break;
    }
    this.advance();
    if (this.at(K.Bang) && this.kindAt(1) === K.LeftParen && this.cur().offset === token.offset + token.length) {
      this.advance();
      this.skipBalanced();
      return { kind: "MacroInvocationExpr", name: token.text, args: [], range: this.rangeFrom(token) };
    }
    return { kind: "Identifier", name: token.text, range: this.tokenRange(token) };
  }
  /** `return [expr]`, `throw expr [from cause]`, `break [label]`, `continue [label]`. */
  parseJump() {
    const start = this.advance();
    let statement;
    switch (start.kind) {
      case K.Return: {
        const value = this.startsExpression() && this.sameLine() ? this.parseExpression() : void 0;
        statement = { kind: "ReturnStmt", value, range: this.rangeFrom(start) };
        break;
      }
      case K.Throw: {
        const value = this.parseExpression();
        const from = this.eat(K.From) ? this.parseExpression() : void 0;
        statement = { kind: "ThrowStmt", value, from, range: this.rangeFrom(start) };
        break;
      }
      default: {
        const labelTok = this.cur();
        const label = (labelTok.kind === K.Identifier || labelTok.kind === K.TypeIdentifier) && this.sameLine() ? this.advance().text : void 0;
        statement = start.kind === K.Break ? { kind: "BreakStmt", label, range: this.rangeFrom(start) } : { kind: "ContinueStmt", label, range: this.rangeFrom(start) };
        break;
      }
    }
    return { kind: "StatementExpr", statement, range: statement.range };
  }
  parseYieldExprAsStatement() {
    const start = this.advance();
    if (this.at(K.Star)) {
      this.advance();
      const iterable = this.parseExpression();
      return { kind: "YieldFromStmt", iterable, range: this.rangeFrom(start) };
    }
    const value = this.startsExpression() && this.sameLine() ? this.parseExpression() : void 0;
    return { kind: "YieldStmt", value, range: this.rangeFrom(start) };
  }
  /** `()`, `(expr)`, `(a, b)`, `(expr for (x in xs))` */
  parseParenthesized() {
    const start = this.advance();
    if (this.at(K.RightParen)) {
      this.advance();
      return { kind: "TupleLiteral", elements: [], range: this.rangeFrom(start) };
    }
    const first = this.parseTupleElement();
    if (this.at(K.For)) {
      const comprehension = this.parseComprehensionTail(first, "list", first);
      this.expect(K.RightParen);
      comprehension.range = this.rangeFrom(start);
      return comprehension;
    }
    if (this.at(K.Comma)) {
      const elements = [first];
      while (this.eat(K.Comma)) {
        if (this.at(K.RightParen))
          break;
        elements.push(this.parseTupleElement());
      }
      this.expect(K.RightParen);
      return { kind: "TupleLiteral", elements, range: this.rangeFrom(start) };
    }
    this.expect(K.RightParen);
    return { kind: "GroupExpr", expression: first, range: this.rangeFrom(start) };
  }
  /** A tuple element; a named one (`(x: 1, y: 2)`) drops its label. */
  parseTupleElement() {
    if (this.isWord(this.cur()) && this.kindAt(1) === K.Colon) {
      this.advance();
      this.advance();
    }
    return this.parseExpression();
  }
  parseListLiteral() {
    const start = this.advance();
    const elements = [];
    while (!this.at(K.RightBracket)) {
      const element = this.parseExpression();
      if (elements.length === 0 && this.at(K.For)) {
        const comprehension = this.parseComprehensionTail(element, "list", element);
        this.expect(K.RightBracket);
        comprehension.range = this.rangeFrom(start);
        return comprehension;
      }
      if (elements.length === 0 && this.at(K.Semicolon)) {
        this.advance();
        this.parseExpression();
        elements.push(element);
        break;
      }
      elements.push(element);
      if (!this.eat(K.Comma))
        break;
    }
    this.expect(K.RightBracket);
    return { kind: "ListLiteral", elements, range: this.rangeFrom(start) };
  }
  /** `{}`, `{k: v, **rest}`, `{a, b}`, and the dict / set comprehensions. */
  parseBraceLiteral() {
    const start = this.advance();
    const entries = [];
    const elements = [];
    let isDict = this.at(K.RightBrace);
    while (!this.at(K.RightBrace)) {
      const key = this.parseExpression();
      if (this.at(K.Colon)) {
        this.advance();
        const value = this.parseExpression();
        if (entries.length === 0 && elements.length === 0 && this.at(K.For)) {
          const body = { kind: "TupleLiteral", elements: [key, value], range: this.spanFrom(key) };
          const comprehension = this.parseComprehensionTail(body, "dict", body);
          this.expect(K.RightBrace);
          comprehension.range = this.rangeFrom(start);
          return comprehension;
        }
        isDict = true;
        entries.push([key, value]);
      } else {
        if (entries.length === 0 && elements.length === 0 && this.at(K.For)) {
          const comprehension = this.parseComprehensionTail(key, "set", key);
          this.expect(K.RightBrace);
          comprehension.range = this.rangeFrom(start);
          return comprehension;
        }
        if (key.kind === "SpreadExpr" && key.operator === "**")
          isDict = true;
        elements.push(key);
      }
      if (!this.eat(K.Comma))
        break;
    }
    this.expect(K.RightBrace);
    if (isDict)
      return { kind: "DictLiteral", entries, range: this.rangeFrom(start) };
    return { kind: "SetLiteral", elements, range: this.rangeFrom(start) };
  }
  /** `for (pattern in iterable)` followed by any number of `if (cond)` / `for (...)` clauses. */
  parseComprehensionTail(body, resultKind, anchor) {
    let pattern;
    let iterable;
    let condition;
    while (this.at(K.For) || this.at(K.If)) {
      if (this.eat(K.If)) {
        const cond = this.parseExpression();
        condition = condition ?? cond;
        continue;
      }
      this.advance();
      const parenthesized = this.at(K.LeftParen) && this.hasInAheadFrom(this.pos + 1);
      if (parenthesized)
        this.advance();
      if (this.at(K.Let) || this.at(K.Var))
        this.advance();
      const p = this.parseDestructPattern();
      this.expect(K.In);
      const it = this.parseExpression();
      if (parenthesized)
        this.expect(K.RightParen);
      pattern = pattern ?? p;
      iterable = iterable ?? it;
    }
    return { kind: "ComprehensionExpr", resultKind, body, pattern, iterable, condition, range: this.spanFrom(anchor) };
  }
  parseMatchExpr() {
    const start = this.cur();
    this.expect(K.Match);
    const subject = this.parseExpression();
    this.expect(K.LeftBrace);
    const arms = [];
    while (!this.at(K.RightBrace) && !this.atEnd()) {
      if (this.at(K.Comma) || this.at(K.Semicolon)) {
        this.advance();
        continue;
      }
      const armStart = this.cur();
      this.skipAnnotations();
      const pattern = this.parsePattern();
      let guard;
      if (this.eat(K.If))
        guard = this.parseExpression();
      this.expect(K.Arrow);
      const body = this.parseArrowBody();
      arms.push({ kind: "MatchArm", pattern, guard, body, range: this.rangeFrom(armStart) });
    }
    this.closeBrace();
    return { kind: "MatchExpr", subject, arms, range: this.rangeFrom(start) };
  }
  /** After `=>`: an expression, or a block (`None => { db.commit(); return true; }`). */
  parseArrowBody() {
    if (this.at(K.LeftBrace) && this.looksLikeBlock()) {
      const statement = this.parseBlock();
      return { kind: "StatementExpr", statement, range: statement.range };
    }
    return this.parseExpression();
  }
  /** At `{` in a position that admits both a block and a dict / set literal. */
  looksLikeBlock() {
    const first = this.peekTok(1);
    const second = this.peekTok(2);
    if (first.kind === K.RightBrace)
      return true;
    if (first.kind === K.StarStar)
      return false;
    if (second.kind === K.Colon) {
      const third = this.kindAt(3);
      const isLabel = this.isWord(first) && (third === K.For || third === K.While || third === K.Do);
      return isLabel;
    }
    if (second.kind === K.Comma) {
      return false;
    }
    return true;
  }
  // ---- Patterns ----
  parsePattern() {
    this.enter();
    try {
      const first = this.parsePatternPrimary();
      while (this.at(K.Pipe)) {
        this.advance();
        this.parsePatternPrimary();
      }
      return first;
    } finally {
      this.depth--;
    }
  }
  parsePatternPrimary() {
    const token = this.cur();
    switch (token.kind) {
      case K.Minus:
      case K.IntLiteral:
      case K.FloatLiteral:
      case K.StringLiteral:
      case K.CharLiteral:
      case K.RawStringLiteral:
      case K.BytesLiteral:
      case K.InterpolatedStringLiteral:
      case K.MultilineStringLiteral:
      case K.True:
      case K.False: {
        if (token.kind === K.Minus)
          this.advance();
        this.advance();
        if (this.at(K.DotDot) || this.at(K.DotDotEqual)) {
          this.advance();
          this.eat(K.Minus);
          if (this.at(K.IntLiteral) || this.at(K.FloatLiteral) || this.at(K.CharLiteral) || this.at(K.StringLiteral))
            this.advance();
        }
        return { kind: "IdentifierPattern", name: token.text, range: this.rangeFrom(token) };
      }
      case K.LeftParen:
      case K.LeftBracket: {
        const close = token.kind === K.LeftParen ? K.RightParen : K.RightBracket;
        this.advance();
        const fields = this.parsePatternItems(close);
        this.expect(close);
        return { kind: "ConstructorPattern", name: "", fields, range: this.rangeFrom(token) };
      }
      case K.LeftBrace: {
        this.advance();
        const fields = this.parseNamedPatternItems();
        this.expect(K.RightBrace);
        return { kind: "ConstructorPattern", name: "", fields, range: this.rangeFrom(token) };
      }
      case K.Star: {
        this.advance();
        const rest = this.expectName('a name after "*"');
        return { kind: "IdentifierPattern", name: rest.text, range: this.rangeFrom(token) };
      }
      case K.Borrow:
        if (this.kindAt(1) === K.LeftBracket || this.isWord(this.peekTok(1))) {
          this.advance();
          if (this.at(K.LeftBracket))
            this.skipBalanced();
          const bound = this.expectName("a binding name");
          return { kind: "IdentifierPattern", name: bound.text, range: this.rangeFrom(token) };
        }
        break;
      default:
        break;
    }
    if (!this.isNameToken(token)) {
      this.fail(`Expected a pattern but found ${this.describe(token)}`);
    }
    this.advance();
    if (token.text === "_")
      return { kind: "WildcardPattern", range: this.tokenRange(token) };
    let name = token.text;
    while (this.at(K.Dot) && this.isNameToken(this.peekTok(1))) {
      this.advance();
      name += "." + this.advance().text;
    }
    if (this.at(K.LeftBracket))
      this.skipBalanced();
    if (this.at(K.LeftParen)) {
      this.advance();
      const fields = this.parsePatternItems(K.RightParen);
      this.expect(K.RightParen);
      return { kind: "ConstructorPattern", name, fields, range: this.rangeFrom(token) };
    }
    if (this.at(K.LeftBrace)) {
      this.advance();
      const fields = this.parseNamedPatternItems();
      this.expect(K.RightBrace);
      return { kind: "ConstructorPattern", name, fields, range: this.rangeFrom(token) };
    }
    return { kind: "IdentifierPattern", name, range: this.rangeFrom(token) };
  }
  /** Positional or `name = pattern` items up to `close`. */
  parsePatternItems(close) {
    const items = [];
    while (!this.at(close)) {
      if (this.at(K.DotDot) || this.at(K.DotDotDot)) {
        this.advance();
      } else {
        if (this.isWord(this.cur()) && (this.kindAt(1) === K.Assign || this.kindAt(1) === K.Colon)) {
          this.advance();
          this.advance();
        }
        items.push(this.parsePattern());
      }
      if (!this.eat(K.Comma))
        break;
    }
    return items;
  }
  /** `{ name: pattern, "key": name = default, **rest }` */
  parseNamedPatternItems() {
    const items = [];
    while (!this.at(K.RightBrace)) {
      if (this.at(K.StarStar)) {
        this.advance();
        this.expectName('a name after "**"');
      } else {
        const key = this.cur();
        if (key.kind !== K.StringLiteral && !this.isNameToken(key)) {
          this.fail(`Expected a field name but found ${this.describe(key)}`);
        }
        this.advance();
        if (this.eat(K.Colon)) {
          items.push(this.parsePattern());
        } else {
          items.push({ kind: "IdentifierPattern", name: key.text, range: this.tokenRange(key) });
        }
        if (this.eat(K.Assign))
          this.parseExpression();
      }
      if (!this.eat(K.Comma) && !this.eat(K.Semicolon))
        break;
    }
    return items;
  }
  // ---- Lambdas ----
  /** `func(params) [: Type] [captures] => expr` or `... { block }`, optionally `async`. */
  parseFunExpr() {
    const start = this.cur();
    const isAsync = this.eat(K.Async);
    this.eat(K.Gen);
    this.expect(K.Fun);
    this.expect(K.LeftParen);
    const params = this.parseParamList();
    this.expect(K.RightParen);
    let returnType;
    for (; ; ) {
      if (this.at(K.Colon)) {
        this.advance();
        returnType = this.parseType();
      } else if (this.at(K.LeftBracket)) {
        this.skipBalanced();
      } else {
        break;
      }
    }
    let body;
    if (this.eat(K.Arrow)) {
      body = this.at(K.LeftBrace) && this.looksLikeBlock() ? this.parseBlock() : this.parseExpression();
    } else {
      body = this.parseBlock();
    }
    return { kind: isAsync ? "AsyncFunExpr" : "FunExpr", params, returnType, body, range: this.rangeFrom(start) };
  }
  // ==========================================================================
  // Types
  // ==========================================================================
  parseType() {
    const first = this.parseTypeNoUnion();
    if (!this.at(K.Pipe))
      return first;
    const members = [first];
    while (this.eat(K.Pipe))
      members.push(this.parseTypeNoUnion());
    return { kind: "UnionType", members, range: this.spanFromRange(first.range) };
  }
  parseTypeNoUnion() {
    this.enter();
    try {
      let type = this.parseTypePrimary();
      while (this.at(K.Question)) {
        this.advance();
        type = { kind: "OptionalType", inner: type, range: this.spanFromRange(type.range) };
      }
      return type;
    } finally {
      this.depth--;
    }
  }
  parseTypePrimary() {
    const token = this.cur();
    let i = 0;
    while (this.kindAt(i) === K.Async || this.kindAt(i) === K.Gen || this.kindAt(i) === K.Noescape)
      i++;
    if ((this.kindAt(i) === K.Fn || this.kindAt(i) === K.Fun) && this.kindAt(i + 1) === K.LeftParen) {
      let isAsync = false;
      let isNoescape = false;
      for (; i > 0; i--) {
        const modifier = this.advance();
        if (modifier.kind === K.Async)
          isAsync = true;
        if (modifier.kind === K.Noescape)
          isNoescape = true;
      }
      this.advance();
      this.expect(K.LeftParen);
      const params = [];
      while (!this.at(K.RightParen)) {
        if (this.at(K.Star) || this.at(K.StarStar))
          this.advance();
        while (OWNERSHIP_KINDS.has(this.cur().kind) && this.kindAt(1) !== K.LeftBracket && this.startsTypeAt(1))
          this.advance();
        if (this.isWord(this.cur()) && this.kindAt(1) === K.Colon) {
          this.advance();
          this.advance();
        }
        params.push(this.parseType());
        if (this.eat(K.Assign))
          this.parseExpression();
        if (!this.eat(K.Comma))
          break;
      }
      this.expect(K.RightParen);
      const returnType = this.eat(K.Colon) ? this.parseTypeNoUnion() : { kind: "SimpleType", name: "void", range: this.tokenRange(this.prev()) };
      if (isAsync)
        return { kind: "AsyncFunctionType", params, returnType, range: this.rangeFrom(token) };
      return { kind: "FunctionType", params, returnType, isNoescape, range: this.rangeFrom(token) };
    }
    if (token.kind === K.LeftParen) {
      this.advance();
      const elements = [];
      while (!this.at(K.RightParen)) {
        elements.push(this.parseType());
        if (!this.eat(K.Comma))
          break;
      }
      this.expect(K.RightParen);
      if (elements.length === 1)
        return elements[0];
      return { kind: "TupleType", elements, range: this.rangeFrom(token) };
    }
    if (OWNERSHIP_KINDS.has(token.kind)) {
      if (this.kindAt(1) === K.LeftBracket && this.kindAt(2) === K.LifetimeLabel) {
        this.advance();
        this.skipBalanced();
        return this.parseTypeNoUnion();
      }
      if (this.startsTypeAt(1) && this.peekTok(1).line === token.endLine) {
        this.advance();
        return this.parseTypeNoUnion();
      }
    }
    if (token.kind === K.MacroSplice) {
      this.advance();
      return { kind: "SimpleType", name: token.text, range: this.tokenRange(token) };
    }
    if (!this.isWord(token)) {
      this.fail(`Expected a type but found ${this.describe(token)}`);
    }
    this.advance();
    let name = token.text;
    while (this.at(K.Dot) && this.isWord(this.peekTok(1))) {
      this.advance();
      name += "." + this.advance().text;
    }
    if (name === "decimal" && this.at(K.LeftParen)) {
      this.skipBalanced();
      return { kind: "SimpleType", name, range: this.rangeFrom(token) };
    }
    if (this.at(K.LeftBracket) && this.kindAt(1) !== K.Weak && this.kindAt(1) !== K.Unowned) {
      const args = this.parseTypeArgs();
      if (name === "tuple")
        return { kind: "TupleType", elements: args, range: this.rangeFrom(token) };
      return { kind: "GenericType", name, args, range: this.rangeFrom(token) };
    }
    return { kind: "SimpleType", name, range: this.rangeFrom(token) };
  }
  startsTypeAt(offset) {
    const tok = this.peekTok(offset);
    return this.isWord(tok) || tok.kind === K.LeftParen || tok.kind === K.MacroSplice;
  }
  /**
   * `[T, U]`. A type argument may also be a value (`buffer[uint8, 64]`,
   * `array[float, rank + 1]`, `decimal`-style `name: value`), a lifetime (`~a`) or `_`.
   */
  parseTypeArgs() {
    this.expect(K.LeftBracket);
    const args = [];
    while (!this.at(K.RightBracket)) {
      const tok = this.cur();
      if (tok.kind === K.LifetimeLabel) {
        this.advance();
      } else if (this.isWord(tok) && this.kindAt(1) === K.Colon) {
        this.advance();
        this.advance();
        this.skipTypeArgValue();
      } else if (this.startsTypeAt(0) && !this.isValueWord(tok)) {
        args.push(this.parseType());
        if (!this.at(K.Comma) && !this.at(K.RightBracket))
          this.skipTypeArgValue();
      } else {
        this.skipTypeArgValue();
      }
      if (!this.eat(K.Comma))
        break;
    }
    this.expect(K.RightBracket);
    return args;
  }
  isValueWord(tok) {
    return tok.kind === K.True || tok.kind === K.False;
  }
  /** Skip one value-typed generic argument: tokens up to the `,` or `]` at this bracket depth. */
  skipTypeArgValue() {
    let consumed = false;
    for (; ; ) {
      const tok = this.cur();
      if (tok.kind === K.EOF)
        break;
      if (tok.kind === K.Comma || tok.kind === K.RightBracket)
        break;
      if (tok.kind === K.RightParen || tok.kind === K.RightBrace || tok.kind === K.Semicolon)
        break;
      if (CLOSERS[tok.kind] !== void 0) {
        this.skipBalanced();
      } else {
        this.advance();
      }
      consumed = true;
    }
    if (!consumed)
      this.fail(`Expected a type but found ${this.describe(this.cur())}`);
  }
  // ---- Parameters ----
  parseParamList() {
    const params = [];
    while (!this.at(K.RightParen)) {
      params.push(this.parseParam());
      if (!this.eat(K.Comma))
        break;
    }
    return params;
  }
  parseParam() {
    const start = this.cur();
    this.skipAnnotations();
    if (this.at(K.Star) || this.at(K.StarStar)) {
      const star = this.advance();
      if (star.kind === K.Star && this.at(K.Star))
        this.advance();
      if (this.at(K.Comma) || this.at(K.RightParen)) {
        return { kind: "Parameter", name: "*", range: this.rangeFrom(start) };
      }
    }
    let qualifier;
    for (; ; ) {
      const tok = this.cur();
      if (!OWNERSHIP_KINDS.has(tok.kind))
        break;
      const next = this.kindAt(1);
      if (next === K.Colon || next === K.Comma || next === K.RightParen || next === K.Assign)
        break;
      this.advance();
      if (tok.kind === K.Weak)
        qualifier = "weak";
      else if (tok.kind === K.Unowned)
        qualifier = "unowned";
      else if (tok.kind === K.Borrow)
        qualifier = qualifier === void 0 && this.tokens[this.pos - 2]?.kind === K.Excl ? "excl borrow" : "borrow";
      if (this.at(K.LeftBracket) && this.kindAt(1) === K.LifetimeLabel)
        this.skipBalanced();
    }
    let name;
    let nameRange;
    if (this.at(K.LeftParen) || this.at(K.LeftBracket) || this.at(K.LeftBrace)) {
      const pattern = this.parseDestructPattern("parameter");
      name = "_";
      nameRange = pattern.range;
    } else {
      const nameTok = this.expectDeclaredName("parameter");
      name = nameTok.text;
      nameRange = this.tokenRange(nameTok);
    }
    const type = this.eat(K.Colon) ? this.parseType() : void 0;
    const defaultValue = this.eat(K.Assign) ? this.parseExpression() : void 0;
    return { kind: "Parameter", name, nameRange, type, defaultValue, qualifier, range: this.rangeFrom(start) };
  }
  /** `[T, U: Bound + Other, lifetime ~a, out V, N: int]` */
  parseOptionalTypeParams() {
    if (!this.at(K.LeftBracket))
      return void 0;
    this.advance();
    const params = [];
    while (!this.at(K.RightBracket)) {
      const pStart = this.cur();
      if (this.at(K.Lifetime))
        this.advance();
      if (this.at(K.LifetimeLabel)) {
        const label = this.advance();
        params.push({ kind: "TypeParam", name: label.text, range: this.rangeFrom(pStart) });
      } else {
        if ((this.at(K.In) || this.cur().text === "out") && this.isWord(this.peekTok(1)))
          this.advance();
        const name = this.expectDeclaredName("type parameter").text;
        let constraint;
        if (this.eat(K.Colon)) {
          constraint = this.parseType();
          while (this.eat(K.Plus))
            this.parseType();
        }
        if (this.eat(K.Assign))
          this.parseType();
        params.push({ kind: "TypeParam", name, constraint, range: this.rangeFrom(pStart) });
      }
      if (!this.eat(K.Comma))
        break;
    }
    this.expect(K.RightBracket);
    return params.length > 0 ? params : void 0;
  }
  // ==========================================================================
  // Token helpers
  // ==========================================================================
  cur() {
    if (++this.work > this.workLimit)
      throw new ParseAbort();
    return this.tokens[this.pos] ?? this.eof;
  }
  prev() {
    return this.tokens[this.pos - 1] ?? this.tokens[0] ?? this.eof;
  }
  peekTok(offset) {
    return this.tokens[this.pos + offset] ?? this.eof;
  }
  kindAt(offset) {
    const tok = this.tokens[this.pos + offset];
    return tok ? tok.kind : K.EOF;
  }
  advance() {
    const token = this.cur();
    if (token.kind !== K.EOF)
      this.pos++;
    return token;
  }
  at(kind) {
    return this.cur().kind === kind;
  }
  eat(kind) {
    if (this.cur().kind !== kind)
      return false;
    this.pos++;
    return true;
  }
  atEnd() {
    return this.cur().kind === K.EOF;
  }
  /** Does the current token start on the line the previous token ended on? */
  sameLine() {
    if (this.pos === 0)
      return false;
    return this.cur().line === this.tokens[this.pos - 1].endLine;
  }
  startsLine() {
    return !this.sameLine();
  }
  /** Any identifier-like token: a name or a keyword spelling. */
  isWord(tok) {
    if (!tok)
      return false;
    return tok.kind === K.Identifier || tok.kind === K.TypeIdentifier || isKeywordKind(tok.kind);
  }
  /** A token that can stand where a declaration or pattern introduces a name. */
  isNameToken(tok) {
    return this.isWord(tok) || tok?.kind === K.MacroSplice;
  }
  startsExpression() {
    return this.startsExpressionAt(0);
  }
  startsExpressionAt(offset) {
    const tok = this.peekTok(offset);
    switch (tok.kind) {
      case K.EOF:
      case K.Semicolon:
      case K.Comma:
      case K.RightParen:
      case K.RightBracket:
      case K.RightBrace:
      case K.Colon:
      case K.Arrow:
      case K.Assign:
      case K.Error:
        return false;
      default:
        return !NOT_AN_EXPRESSION.has(tok.kind);
    }
  }
  expect(kind) {
    const token = this.cur();
    if (token.kind === kind) {
      this.pos++;
      return token;
    }
    this.fail(`Expected '${kind}' but found ${this.describe(token)}`);
  }
  expectWord(what) {
    const token = this.cur();
    if (this.isWord(token)) {
      this.pos++;
      return token;
    }
    this.fail(`Expected ${what} but found ${this.describe(token)}`);
  }
  /** A name being introduced or referenced by a declaration: any word, or a macro splice. */
  expectName(what) {
    const token = this.cur();
    if (this.isNameToken(token)) {
      this.pos++;
      return token;
    }
    this.fail(`Expected ${what} but found ${this.describe(token)}`);
  }
  /**
   * A name a declaration introduces. A reserved word is reported once and kept as
   * the name, so the rest of the declaration is still checked (§1-3.4).
   */
  expectDeclaredName(position) {
    const token = this.expectName(position === "enum variant" || position === "import alias" ? `an ${position} name` : `a ${position} name`);
    if (token.kind !== K.Identifier && (RESERVED_EVERYWHERE.has(token.text) || RESERVED_BY_POSITION[position].has(token.text))) {
      this.addDiagnostic(
        `\`${token.text}\` is a reserved word (\xA71-3.4) and cannot name ${position === "enum variant" || position === "import alias" ? "an" : "a"} ${position}`,
        this.tokenRange(token)
      );
    }
    return token;
  }
  /**
   * End of a simple statement. `;` is optional before `}`, at end of file and
   * when the next statement starts on a new line (§1-19.4).
   */
  endStatement() {
    if (this.eat(K.Semicolon))
      return;
    if (this.at(K.RightBrace) || this.atEnd() || this.startsLine())
      return;
    this.addDiagnostic(`Expected ';' but found ${this.describe(this.cur())}`, this.tokenRange(this.cur()));
  }
  /** Index of the bracket closing the one at `openIndex`, or -1. */
  matchingClose(openIndex) {
    let nesting = 0;
    for (let i = openIndex; i < this.tokens.length; i++) {
      const kind = this.tokens[i].kind;
      if (kind === K.LeftParen || kind === K.LeftBracket || kind === K.LeftBrace || kind === K.BangLeftBrace) {
        nesting++;
      } else if (kind === K.RightParen || kind === K.RightBracket || kind === K.RightBrace) {
        nesting--;
        if (nesting === 0)
          return i;
        if (nesting < 0)
          return -1;
      }
    }
    return -1;
  }
  /** At an opening bracket: consume through its matching closer, whatever lies between. */
  skipBalanced() {
    const open = this.cur();
    const close = this.matchingClose(this.pos);
    if (close < 0) {
      this.fail(`'${open.text}' is never closed`, open);
    }
    this.pos = close + 1;
  }
  enter() {
    if (++this.depth > MAX_NESTING) {
      this.fail("Nesting is too deep to analyse");
    }
  }
  checkTerminated(token, what) {
    if (token.unterminated) {
      this.addDiagnostic(`Unterminated ${what}`, this.tokenRange(token));
    }
  }
  // ==========================================================================
  // Diagnostics & ranges
  // ==========================================================================
  describe(token) {
    if (token.kind === K.EOF)
      return "end of file";
    const text = token.text.length > 24 ? token.text.slice(0, 24).split("\n")[0] + "\u2026" : token.text.split("\n")[0];
    return `'${text}'`;
  }
  /** Record a diagnostic at `token` (default: the current token) and abandon the statement. */
  fail(message, token = this.cur()) {
    const range = token.kind === K.EOF ? this.rangeAfterPrev() : this.tokenRange(token);
    this.addDiagnostic(message, range);
    throw new ParseError();
  }
  addDiagnostic(message, range) {
    if (this.diagnostics.length >= MAX_DIAGNOSTICS)
      return;
    const last = this.diagnostics[this.diagnostics.length - 1];
    if (last && last.range.start.offset === range.start.offset)
      return;
    this.diagnostics.push({ message, range, severity: "error" });
  }
  tokenRange(token) {
    return {
      start: { line: token.line, column: token.column, offset: token.offset },
      end: { line: token.endLine, column: token.endColumn, offset: token.offset + token.length }
    };
  }
  /** From `start` through the last token consumed. */
  rangeFrom(start) {
    const last = this.pos > 0 ? this.tokens[this.pos - 1] : start;
    const end = last.offset + last.length >= start.offset + start.length ? last : start;
    return {
      start: { line: start.line, column: start.column, offset: start.offset },
      end: { line: end.endLine, column: end.endColumn, offset: end.offset + end.length }
    };
  }
  /** From the start of `node` through the last token consumed. */
  spanFrom(node) {
    return this.spanFromRange(node.range);
  }
  spanFromRange(range) {
    const last = this.pos > 0 ? this.tokens[this.pos - 1] : void 0;
    if (!last || last.offset + last.length < range.end.offset)
      return range;
    return {
      start: range.start,
      end: { line: last.endLine, column: last.endColumn, offset: last.offset + last.length }
    };
  }
  /** A zero-width range just past the last token consumed: where something is missing. */
  rangeAfterPrev() {
    const last = this.pos > 0 ? this.tokens[this.pos - 1] : this.eof;
    const position = { line: last.endLine, column: last.endColumn, offset: last.offset + last.length };
    return { start: position, end: position };
  }
};

// src/analysis.ts
function isManifestUri(uri) {
  const path = uri.split(/[?#]/)[0].toLowerCase();
  return path.endsWith(".lppkg") || path.endsWith(".pkg");
}
function toPlainRange(range) {
  return {
    start: { line: range.start.line, character: range.start.column },
    end: { line: range.end.line, character: range.end.column }
  };
}
function analyze(text) {
  const { program, diagnostics: parseDiagnostics } = new Parser().parse(text);
  const symbolTable = new SymbolTable();
  const symbols = symbolTable.build(program);
  const diagnostics = parseDiagnostics.map((d) => ({
    severity: d.severity,
    range: toPlainRange(d.range),
    message: d.message
  }));
  return { program, symbols, symbolTable, diagnostics };
}
var WORD_CHAR = /[\p{L}\p{Nd}_]/u;
function getWordAtOffset(text, offset) {
  let start = Math.max(0, Math.min(offset, text.length));
  let end = start;
  while (start > 0 && WORD_CHAR.test(text[start - 1]))
    start--;
  while (end < text.length && WORD_CHAR.test(text[end]))
    end++;
  return end > start ? text.slice(start, end) : null;
}
function importInsertLine(text) {
  const lines = text.split("\n");
  let insertAt = 0;
  let inBlockComment = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (inBlockComment) {
      if (line.includes("*/"))
        inBlockComment = false;
      insertAt = i + 1;
      continue;
    }
    if (line === "" || line.startsWith("#"))
      continue;
    if (line.startsWith("/*")) {
      inBlockComment = !line.includes("*/");
      continue;
    }
    if (/^@mode\b/.test(line) || /^@compiled\b/.test(line) || /^namespace\b[^{]*;?$/.test(line)) {
      insertAt = i + 1;
      continue;
    }
    break;
  }
  return Math.min(insertAt, lines.length);
}
function splitTopLevel(text) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const ch of text) {
    if (ch === "(" || ch === "[" || ch === "{")
      depth++;
    else if (ch === ")" || ch === "]" || ch === "}")
      depth--;
    if (ch === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim() !== "")
    parts.push(current.trim());
  return parts;
}

// src/folding.ts
function computeFoldingRanges(text) {
  const tokens = new Lexer(text).tokenize();
  const ranges = [];
  const stack = [];
  let commentRun;
  const flushComments = () => {
    if (commentRun && commentRun.end > commentRun.start) {
      ranges.push({ startLine: commentRun.start, endLine: commentRun.end, kind: "comment" });
    }
    commentRun = void 0;
  };
  for (const tok of tokens) {
    const isLineComment = tok.kind === "LineComment" /* LineComment */ || tok.kind === "DocComment" /* DocComment */;
    if (isLineComment) {
      if (commentRun && tok.line === commentRun.end + 1) {
        commentRun.end = tok.line;
      } else if (!commentRun || tok.line !== commentRun.end) {
        flushComments();
        commentRun = { start: tok.line, end: tok.line };
      }
      continue;
    }
    flushComments();
    switch (tok.kind) {
      case "{" /* LeftBrace */:
      case "[" /* LeftBracket */:
      case "(" /* LeftParen */:
        stack.push(tok.line);
        break;
      case "}" /* RightBrace */:
      case "]" /* RightBracket */:
      case ")" /* RightParen */: {
        const startLine = stack.pop();
        if (startLine !== void 0 && tok.line - 1 > startLine) {
          ranges.push({ startLine, endLine: tok.line - 1 });
        }
        break;
      }
      case "BlockComment" /* BlockComment */:
        if (tok.endLine > tok.line)
          ranges.push({ startLine: tok.line, endLine: tok.endLine, kind: "comment" });
        break;
      case "TemplateFenceOpen" /* TemplateFenceOpen */:
      case "MultilineStringLiteral" /* MultilineStringLiteral */:
      case "RawStringLiteral" /* RawStringLiteral */:
      case "InterpolatedStringLiteral" /* InterpolatedStringLiteral */:
        if (tok.endLine - 1 > tok.line)
          ranges.push({ startLine: tok.line, endLine: tok.endLine - 1, kind: "region" });
        break;
      default:
        break;
    }
  }
  flushComments();
  ranges.sort((a, b) => a.startLine - b.startLine || b.endLine - a.endLine);
  return ranges;
}

// src/formatting.ts
var OPENERS = /* @__PURE__ */ new Set(["{" /* LeftBrace */, "[" /* LeftBracket */, "(" /* LeftParen */]);
var CLOSERS2 = /* @__PURE__ */ new Set(["}" /* RightBrace */, "]" /* RightBracket */, ")" /* RightParen */]);
function formatSource(text, indentUnit) {
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text.split("\n").map((line) => line.endsWith("\r") ? line.slice(0, -1) : line);
  const tokens = new Lexer(text).tokenize();
  const insideToken = new Array(lines.length).fill(false);
  const indentLevel = new Array(lines.length).fill(0);
  const openLines = [];
  const levelNow = () => {
    let level = 0;
    for (let i = 0; i < openLines.length; i++) {
      if (i === 0 || openLines[i] !== openLines[i - 1])
        level++;
    }
    return level;
  };
  let currentLine = -1;
  let assigned = false;
  let leadingCloser = false;
  for (const tok of tokens) {
    if (tok.kind === "EOF" /* EOF */)
      break;
    if (tok.line !== currentLine) {
      currentLine = tok.line;
      assigned = false;
      leadingCloser = false;
    }
    const isCloser = CLOSERS2.has(tok.kind);
    const openedOn = isCloser ? openLines.pop() : void 0;
    if (!assigned && tok.line < lines.length) {
      if (isCloser) {
        indentLevel[tok.line] = openedOn !== void 0 && openedOn < tok.line ? indentLevel[openedOn] : levelNow();
      } else {
        if (!leadingCloser)
          indentLevel[tok.line] = levelNow();
        assigned = true;
      }
      leadingCloser = isCloser;
    }
    if (OPENERS.has(tok.kind) || tok.kind === "!{" /* BangLeftBrace */)
      openLines.push(tok.line);
    for (let inner = tok.line + 1; inner <= tok.endLine && inner < lines.length; inner++) {
      insideToken[inner] = true;
    }
    if (tok.endLine !== tok.line) {
      currentLine = tok.endLine;
      assigned = true;
    }
  }
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (insideToken[i]) {
      out.push(raw);
      continue;
    }
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      out.push("");
      continue;
    }
    out.push(indentUnit.repeat(indentLevel[i]) + trimmed);
  }
  return out.join(eol);
}

// src/semanticTokens.ts
var TOKEN_TYPES = [
  "keyword",
  "type",
  "class",
  "enum",
  "enumMember",
  "interface",
  "struct",
  "typeParameter",
  "function",
  "method",
  "macro",
  "variable",
  "parameter",
  "property",
  "decorator",
  "namespace",
  "string",
  "number",
  "operator",
  "comment"
];
var TOKEN_MODIFIERS = [
  "declaration",
  "definition",
  "readonly",
  "static",
  "async",
  "modification",
  "documentation",
  "defaultLibrary"
];
var PRIMITIVE_TYPES = [
  "int",
  "int8",
  "int16",
  "int32",
  "int64",
  "uint",
  "uint8",
  "uint16",
  "uint32",
  "uint64",
  "bigint",
  "float",
  "float32",
  "float64",
  "decimal",
  "complex",
  "complex32",
  "complex64",
  "fixed",
  "bool",
  "char",
  "string",
  "bytes",
  "void",
  "noreturn",
  "impossible",
  "list",
  "dict",
  "set",
  "tuple",
  "buffer",
  "array"
];
function isContextualKeywordUse(tokens, i) {
  const tok = tokens[i];
  const prev = tokens[i - 1];
  const next = tokens[i + 1];
  if (prev && (prev.kind === "." /* Dot */ || prev.kind === "?." /* QuestionDot */))
    return false;
  const nextIsWord = next !== void 0 && next.line === tok.endLine && (next.kind === "Identifier" /* Identifier */ || next.kind === "TypeIdentifier" /* TypeIdentifier */ || isKeywordKind(next.kind));
  switch (tok.kind) {
    case "get" /* Get */:
    case "set" /* Set */:
      return nextIsWord && tokens[i + 2]?.kind === "(" /* LeftParen */;
    case "quote" /* Quote */:
    case "asm" /* Asm */:
      return next?.kind === "{" /* LeftBrace */;
    case "group" /* Group */:
      return prev?.kind === "await" /* Await */ && next?.kind === "{" /* LeftBrace */;
    case "concurrent" /* Concurrent */:
      return prev?.kind === "for" /* For */;
    case "excl" /* Excl */:
      return next?.kind === "borrow" /* Borrow */;
    case "arc" /* Arc */:
      return next?.kind === "let" /* Let */ || next?.kind === "var" /* Var */;
    case "operator" /* Operator */:
      return next?.kind === "func" /* Fun */ || next?.kind === "modifier" /* Modifier */;
    case "compiled" /* Compiled */:
      return prev?.kind === "prefer" /* Prefer */;
    case "js" /* Js */:
    case "native" /* Native */:
      return prev?.kind === "extern" /* Extern */;
    case "val" /* Val */:
      return prev?.kind === "js" /* Js */ || prev?.kind === "StringLiteral" /* StringLiteral */;
    case "foundation" /* Foundation */:
    case "overlay" /* Overlay */:
      return prev?.kind === "template" /* Template */;
    case "onto" /* Onto */:
      return nextIsWord && tokens[i - 2]?.kind === "overlay" /* Overlay */;
    case "part" /* Part */:
      return next?.kind === "func" /* Fun */ || next !== void 0 && isKeywordKind(next.kind) && tokens[i + 2]?.kind === "func" /* Fun */;
    case "spawn" /* Spawn */:
    case "box" /* Box */:
      return nextIsWord || next?.kind === "{" /* LeftBrace */;
    case "weak" /* Weak */:
    case "unowned" /* Unowned */:
      return nextIsWord || next?.kind === "[" /* LeftBracket */;
    case "size_of" /* SizeOf */:
    case "align_of" /* AlignOf */:
    case "reinterpret" /* Reinterpret */:
    case "reinterpretChecked" /* ReinterpretChecked */:
      return next?.kind === "[" /* LeftBracket */;
    case "distinct" /* Distinct */:
      return next?.kind === "(" /* LeftParen */ && (prev?.kind === "requires" /* Requires */ || prev?.kind === "," /* Comma */ || prev?.kind === "(" /* LeftParen */);
    case "None" /* None */:
    case "this" /* This */:
    case "super" /* Super */:
      return true;
    default:
      return false;
  }
}
function classifyTokens(text) {
  const tokens = new Lexer(text).tokenize();
  const primitives = new Set(PRIMITIVE_TYPES);
  const out = [];
  const push = (tok, length, type, modifiers = []) => {
    out.push({ line: tok.line, character: tok.column, length, type, modifiers });
  };
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok.kind === "EOF" /* EOF */)
      break;
    if (tok.endLine !== tok.line)
      continue;
    const prev = tokens[i - 1];
    const next = tokens[i + 1];
    switch (tok.kind) {
      case "LineComment" /* LineComment */:
      case "BlockComment" /* BlockComment */:
        push(tok, tok.length, "comment");
        continue;
      case "DocComment" /* DocComment */:
        push(tok, tok.length, "comment", ["documentation"]);
        continue;
      case "StringLiteral" /* StringLiteral */:
      case "CharLiteral" /* CharLiteral */:
      case "InterpolatedStringLiteral" /* InterpolatedStringLiteral */:
      case "RawStringLiteral" /* RawStringLiteral */:
      case "BytesLiteral" /* BytesLiteral */:
      case "MultilineStringLiteral" /* MultilineStringLiteral */:
        push(tok, tok.length, "string");
        continue;
      case "IntLiteral" /* IntLiteral */:
      case "FloatLiteral" /* FloatLiteral */:
        push(tok, tok.length, "number");
        continue;
      case "@" /* At */:
        if (next && next.offset === tok.offset + tok.length && next.line === tok.line && (next.kind === "Identifier" /* Identifier */ || next.kind === "TypeIdentifier" /* TypeIdentifier */ || isKeywordKind(next.kind))) {
          push(tok, tok.length + next.length, "decorator");
          i++;
        } else {
          push(tok, tok.length, "decorator");
        }
        continue;
      default:
        break;
    }
    const isName = tok.kind === "Identifier" /* Identifier */ || tok.kind === "TypeIdentifier" /* TypeIdentifier */;
    if (!isName && !isKeywordKind(tok.kind))
      continue;
    const afterDot = prev !== void 0 && (prev.kind === "." /* Dot */ || prev.kind === "?." /* QuestionDot */);
    if (!isName && !afterDot) {
      if (isReservedWord(tok.text) || isContextualKeywordUse(tokens, i)) {
        const modifiers = [];
        if (tok.kind === "async" /* Async */)
          modifiers.push("async");
        if (tok.kind === "static" /* Static */)
          modifiers.push("static");
        if (tok.kind === "let" /* Let */ || tok.kind === "const" /* Const */)
          modifiers.push("readonly");
        if (tok.kind === "var" /* Var */)
          modifiers.push("modification");
        push(tok, tok.length, "keyword", modifiers);
        continue;
      }
    }
    if (afterDot) {
      push(tok, tok.length, next?.kind === "(" /* LeftParen */ ? "method" : "property");
      continue;
    }
    if (primitives.has(tok.text)) {
      push(tok, tok.length, "type", ["defaultLibrary"]);
      continue;
    }
    switch (prev?.kind) {
      case "class" /* Class */:
        push(tok, tok.length, "class", ["declaration"]);
        continue;
      case "struct" /* Struct */:
        push(tok, tok.length, "struct", ["declaration"]);
        continue;
      case "enum" /* Enum */:
        push(tok, tok.length, "enum", ["declaration"]);
        continue;
      case "interface" /* Interface */:
        push(tok, tok.length, "interface", ["declaration"]);
        continue;
      case "type" /* Type */:
        push(tok, tok.length, "type", ["declaration"]);
        continue;
      case "func" /* Fun */:
        push(tok, tok.length, "function", ["declaration"]);
        continue;
      case "macro" /* Macro */:
        push(tok, tok.length, "macro", ["declaration"]);
        continue;
      case "let" /* Let */:
      case "const" /* Const */:
        push(tok, tok.length, "variable", ["declaration", "readonly"]);
        continue;
      case "var" /* Var */:
        push(tok, tok.length, "variable", ["declaration", "modification"]);
        continue;
      default:
        break;
    }
    if (next?.kind === "!" /* Bang */ && tokens[i + 2]?.kind === "(" /* LeftParen */ && next.offset === tok.offset + tok.length) {
      push(tok, tok.length, "macro");
    } else if (next?.kind === "(" /* LeftParen */) {
      push(tok, tok.length, tok.kind === "TypeIdentifier" /* TypeIdentifier */ ? "type" : "function");
    } else if (tok.kind === "TypeIdentifier" /* TypeIdentifier */) {
      push(tok, tok.length, "type");
    }
  }
  return out;
}

// src/server.ts
var connection = (0, import_node.createConnection)(import_node.ProposedFeatures.all);
var documents = new import_node.TextDocuments(TextDocument);
var analysisCache = /* @__PURE__ */ new Map();
var tokenTypes = [...TOKEN_TYPES];
var tokenModifiers = [...TOKEN_MODIFIERS];
var semanticTokensLegend = {
  tokenTypes,
  tokenModifiers
};
connection.onInitialize((_params) => {
  return {
    capabilities: {
      textDocumentSync: import_node.TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: false,
        triggerCharacters: [".", ":", "@", "{", "("]
      },
      hoverProvider: true,
      documentSymbolProvider: true,
      definitionProvider: true,
      foldingRangeProvider: true,
      semanticTokensProvider: {
        legend: semanticTokensLegend,
        full: true
      },
      documentFormattingProvider: true,
      codeActionProvider: {
        codeActionKinds: [import_node.CodeActionKind.QuickFix]
      },
      signatureHelpProvider: {
        triggerCharacters: ["(", ","]
      },
      workspaceSymbolProvider: true
    }
  };
});
var VALIDATION_DELAY_MS = 200;
var pendingValidation = /* @__PURE__ */ new Map();
function getAnalysis(document) {
  const cached = analysisCache.get(document.uri);
  if (cached && cached.version === document.version)
    return cached.analysis;
  const analysis = analyze(document.getText());
  analysisCache.set(document.uri, { version: document.version, analysis });
  return analysis;
}
function getSymbols(uri) {
  const document = documents.get(uri);
  if (!document || isManifestUri(uri))
    return [];
  return getAnalysis(document).symbols;
}
documents.onDidChangeContent((change) => {
  const uri = change.document.uri;
  const pending = pendingValidation.get(uri);
  if (pending !== void 0)
    clearTimeout(pending);
  pendingValidation.set(uri, setTimeout(() => {
    pendingValidation.delete(uri);
    const current = documents.get(uri);
    if (!current)
      return;
    try {
      validateDocument(current);
    } catch (err) {
      connection.console.error(`loup: validation of ${uri} failed: ${err instanceof Error ? err.stack ?? err.message : String(err)}`);
    }
  }, VALIDATION_DELAY_MS));
});
documents.onDidClose((event) => {
  const uri = event.document.uri;
  const pending = pendingValidation.get(uri);
  if (pending !== void 0)
    clearTimeout(pending);
  pendingValidation.delete(uri);
  analysisCache.delete(uri);
  connection.sendDiagnostics({ uri, diagnostics: [] });
});
function validateDocument(textDocument) {
  const uri = textDocument.uri;
  if (isManifestUri(uri)) {
    connection.sendDiagnostics({ uri, diagnostics: [] });
    return;
  }
  const { diagnostics } = getAnalysis(textDocument);
  const lspDiagnostics = diagnostics.map((d) => ({
    severity: d.severity === "error" ? import_node.DiagnosticSeverity.Error : d.severity === "warning" ? import_node.DiagnosticSeverity.Warning : import_node.DiagnosticSeverity.Information,
    range: d.range,
    message: d.message,
    source: "loup"
  }));
  connection.sendDiagnostics({ uri, version: textDocument.version, diagnostics: lspDiagnostics });
}
var LOUP_KEYWORDS = [...KEYWORD_SPELLINGS, "self"];
var LOUP_MODES = [
  { label: "@mode(host.scripted)", detail: "Host JIT mode (default for .loup / .lpscr)", doc: "Write-and-run scripting on the host environment." },
  { label: "@mode(host.dual)", detail: "Host hybrid mode \u2014 JIT or AOT (.lpscr / .lphc)", doc: "Compiles cleanly to either script JIT or AOT native binary." },
  { label: "@mode(host.native)", detail: "Host AOT native binary (.lphc)", doc: "Full LLVM/Cranelift AOT with ARC, SIMD, inline asm, and C FFI." },
  { label: "@mode(web.scripted)", detail: "Browser JIT mode (.lpweb)", doc: "Runs in browser Wasm JIT engine with DOM/WebComponent access." },
  { label: "@mode(web.compiled)", detail: "Browser AOT Wasm mode (.lpweb)", doc: "Compiles ahead-of-time to a standalone Wasm module." },
  { label: "@mode(freestanding)", detail: "Bare-metal mode \u2014 no runtime (.lpfree)", doc: "Compiles to bare-metal binary with @entry and manual @allocator." },
  { label: "@mode(portable)", detail: "Portable library mode \u2014 compiled in importer's mode", doc: "Checked against PORTABLE-SUBSET (\xA71-2.4.7) and lowered in each importing unit's mode." }
];
var LOUP_TYPES = [
  ...PRIMITIVE_TYPES,
  "fn",
  "Any",
  "Self",
  "Task",
  "TaskGroup",
  "Option",
  "Result",
  "Some",
  "None",
  "Ok",
  "Err",
  "Signal",
  "ReadonlySignal",
  "View",
  "Template",
  "Scoped",
  "AsyncScoped",
  "Channel",
  "WaitGroup",
  "Semaphore",
  "Barrier",
  "Mutex",
  "RwLock",
  "CancellationToken",
  "CancellationError",
  "NativeHandle",
  "Ptr",
  "Equatable",
  "Comparable",
  "Hashable",
  "Display",
  "Debug",
  "Iterable",
  "Iterator",
  "AsyncIterable",
  "AsyncIterator",
  "From",
  "Into",
  "Clone",
  "Default",
  "Index",
  "IndexMut",
  "Slice",
  "Contains",
  "Len",
  "Sendable",
  "ValueType",
  "SharedRef",
  "SharedBuffer",
  "SharedArray",
  "SharedMutex",
  "SharedRwLock",
  "SharedQueue",
  "Serializable",
  "Deserializable",
  "RemoteException",
  "MaybeUninit",
  "PartialInit",
  "Volatile",
  "PinnedRef",
  "OwnedHandle",
  "BorrowedHandle",
  "Thread",
  "ThreadPool",
  "ThreadLocal",
  "ScriptWorker",
  "InterruptGuard",
  "DmaBuffer",
  "MemoryOrder",
  "AlignmentError",
  "DesktopGrant",
  "Order",
  "RoundingMode",
  "OverflowPolicy",
  "ComplexArithmeticError",
  "ArrayShapeError",
  "ArrayShapeErrorKind",
  "ArrayIndexError",
  "ConcurrentIterationError",
  "Interchange",
  "InterchangeError",
  "InterchangeErrorKind",
  "Encoding",
  "Charset",
  "Endianness",
  "Sign",
  "Padding",
  "Justify",
  "PriorityQueue",
  "Mark"
];
var STDLIB_MODULE_TABLE = {
  "core.text": {
    label: "core.text",
    detail: "String manipulation, formatting, and regex (\xA721.1)",
    exports: ["split", "join", "trim", "trimStart", "trimEnd", "toUpper", "toLower", "startsWith", "endsWith", "contains", "replace", "replaceAll", "padStart", "padEnd", "repeat", "charAt", "indexOf", "substring", "format", "Regex", "Match"]
  },
  "core.math": {
    label: "core.math",
    detail: "Mathematical constants and functions (\xA721.2)",
    exports: ["PI", "E", "TAU", "INF", "NAN", "abs", "min", "max", "clamp", "floor", "ceil", "round", "trunc", "sqrt", "cbrt", "pow", "exp", "log", "log2", "log10", "sin", "cos", "tan", "asin", "acos", "atan", "atan2", "hypot", "sign", "isNan", "isInf", "isFinite"]
  },
  "core.complex": {
    label: "core.complex",
    detail: "Complex numbers and transcendental functions (\xA721.9)",
    exports: ["complex", "complex32", "complex64", "fromPolar", "abs", "arg", "conj", "norm", "polar", "sqrt", "exp", "log", "pow", "sin", "cos", "tan", "sinh", "cosh", "tanh", "ComplexArithmeticError"]
  },
  "core.array": {
    label: "core.array",
    detail: "Rank-typed N-dimensional arrays (\xA721.10)",
    exports: ["zeros", "ones", "full", "fromBuffer", "fromList", "iota", "reshape", "transpose", "slice", "Order", "RowMajor", "ColumnMajor", "ArrayShapeError", "ArrayShapeErrorKind", "ArrayIndexError"]
  },
  "core.fpenv": {
    label: "core.fpenv",
    detail: "IEEE 754 floating-point environment control (\xA721.11)",
    exports: ["RoundingMode", "withRounding", "getRounding", "testExceptions", "clearExceptions", "signalingNan"]
  },
  "core.numeric": {
    label: "core.numeric",
    detail: "Fixed-point and decimal rounding/overflow policies (\xA721.12)",
    exports: ["RoundingMode", "OverflowPolicy"]
  },
  "core.interchange": {
    label: "core.interchange",
    detail: "Declarative binary/text record interchange (\xA74-2)",
    exports: ["Interchange", "InterchangeError", "InterchangeErrorKind", "Encoding", "Charset", "Endianness", "Sign", "Padding", "Justify"]
  },
  "core.sensitivity": {
    label: "core.sensitivity",
    detail: "Zero-overhead data sensitivity marking (\xA73-3.20)",
    exports: ["Mark", "mark", "unmark"]
  },
  "core.random": {
    label: "core.random",
    detail: "Random number generation (\xA721.3)",
    exports: ["nextInt", "nextFloat", "nextBool", "nextBytes", "choice", "shuffle", "Rng", "SeededRng"]
  },
  "core.time": {
    label: "core.time",
    detail: "Clocks, durations, and timers (\xA721.4)",
    exports: ["Instant", "Duration", "sleep", "timeout", "interval"]
  },
  "core.datetime": {
    label: "core.datetime",
    detail: "Calendar dates, times, and timezones (\xA721.5)",
    exports: ["DateTime", "LocalDate", "LocalTime", "TimeZone", "Weekday", "parseIso", "formatIso"]
  },
  "core.uuid": {
    label: "core.uuid",
    detail: "UUID generation and parsing (\xA721.6)",
    exports: ["Uuid", "v4", "v7", "parse", "NIL"]
  },
  "core.collections": {
    label: "core.collections",
    detail: "Functional collection utilities and iterators (\xA721.7)",
    exports: ["map", "filter", "reduce", "fold", "flatMap", "zip", "enumerate", "range", "take", "skip", "chunk", "groupBy", "partition", "sortBy", "unique", "find", "any", "all", "count", "sum", "min", "max"]
  },
  "core.atomic": {
    label: "core.atomic",
    detail: "Lock-free atomic primitives (\xA721.8)",
    exports: ["AtomicInt", "AtomicBool", "AtomicRef", "MemoryOrder"]
  },
  "core.reflect": {
    label: "core.reflect",
    detail: "Compile-time and runtime type reflection (\xA71-16)",
    exports: ["typeOf", "TypeInfo", "FieldInfo", "MethodInfo", "getAnnotations"]
  },
  "core.inspect": {
    label: "core.inspect",
    detail: "Live runtime type and object inspection (\xA71-16)",
    exports: ["inspect", "fields", "methods", "typeName", "isInstance"]
  },
  "core.serialization": {
    label: "core.serialization",
    detail: "Format-agnostic serialization framework (\xA74-1)",
    exports: ["Value", "Serializer", "Deserializer", "Serializable", "Deserializable", "toValue", "fromValue"]
  },
  "core.waiting": {
    label: "core.waiting",
    detail: "Polling and backoff waiting helpers",
    exports: ["waitFor", "Backoff", "ExponentialBackoff"]
  },
  "core.shlex": {
    label: "core.shlex",
    detail: "POSIX shell-style lexical splitting and quoting",
    exports: ["split", "quote", "join"]
  },
  "io.fs": {
    label: "io.fs",
    detail: "Filesystem operations (host capability)",
    exports: ["readText", "writeText", "readBytes", "writeBytes", "exists", "mkdir", "remove", "listDir", "stat", "open", "linesAsync", "watch", "File", "FileStat"]
  },
  "io.path": {
    label: "io.path",
    detail: "Cross-platform path manipulation",
    exports: ["Path", "join", "resolve", "dirname", "basename", "extname", "normalize", "isAbsolute", "relative"]
  },
  "io.streams": {
    label: "io.streams",
    detail: "Buffered and async byte/text streams",
    exports: ["Reader", "Writer", "BufferedReader", "BufferedWriter", "ByteStream", "pipe"]
  },
  "io.proc": {
    label: "io.proc",
    detail: "Process execution and environment (host capability)",
    exports: ["exec", "spawn", "env", "args", "cwd", "exit", "pid", "Command", "ChildProcess"]
  },
  "net.http": {
    label: "net.http",
    detail: "HTTP client and server",
    exports: ["fetch", "get", "post", "Request", "Response", "Headers", "Server", "serve", "StatusCode"]
  },
  "net.websocket": {
    label: "net.websocket",
    detail: "WebSocket client and server",
    exports: ["WebSocket", "connect", "WebSocketServer", "Message"]
  },
  "net.addressing": {
    label: "net.addressing",
    detail: "IP addresses and socket endpoints",
    exports: ["IpAddr", "Ipv4Addr", "Ipv6Addr", "SocketAddr", "Cidr"]
  },
  "net.tcp": {
    label: "net.tcp",
    detail: "TCP sockets and listeners",
    exports: ["TcpStream", "TcpListener", "connect", "bind"]
  },
  "net.tls": {
    label: "net.tls",
    detail: "TLS streams and certificate configuration",
    exports: ["TlsStream", "TlsConfig", "Certificate", "wrapClient", "wrapServer"]
  },
  "net.dns": {
    label: "net.dns",
    detail: "DNS resolution",
    exports: ["lookupHost", "lookupIp", "resolveTxt", "resolveMx"]
  },
  "data.json": {
    label: "data.json",
    detail: "JSON parsing, serialization, and accessors",
    exports: ["parse", "stringify", "getString", "getInt", "getFloat", "getBool", "getList", "getDict", "JsonValue", "JsonError"]
  },
  "data.csv": {
    label: "data.csv",
    detail: "CSV reader and writer",
    exports: ["parse", "stringify", "CsvReader", "CsvWriter"]
  },
  "data.toml": {
    label: "data.toml",
    detail: "TOML configuration parsing and serialization",
    exports: ["parse", "stringify", "TomlValue"]
  },
  "data.yaml": {
    label: "data.yaml",
    detail: "YAML parsing and serialization",
    exports: ["parse", "stringify", "YamlValue"]
  },
  "data.xml": {
    label: "data.xml",
    detail: "XML DOM and streaming parser",
    exports: ["parse", "stringify", "XmlElement", "XmlNode"]
  },
  "data.ini": {
    label: "data.ini",
    detail: "INI configuration file parser",
    exports: ["parse", "stringify", "IniDocument"]
  },
  "data.query": {
    label: "data.query",
    detail: "Structured data querying and path selectors",
    exports: ["select", "query", "QueryPath"]
  },
  "data.msgpack": {
    label: "data.msgpack",
    detail: "MessagePack binary serialization",
    exports: ["encode", "decode", "pack", "unpack"]
  },
  "data.cbor": {
    label: "data.cbor",
    detail: "CBOR binary serialization (RFC 8949)",
    exports: ["encode", "decode"]
  },
  "sync.primitives": {
    label: "sync.primitives",
    detail: "Synchronization primitives and shared locks",
    exports: ["Mutex", "RwLock", "Semaphore", "Barrier", "WaitGroup", "Condvar", "SharedMutex", "SharedRwLock", "SharedQueue"]
  },
  "sync.channels": {
    label: "sync.channels",
    detail: "Typed async and cross-thread channels",
    exports: ["Channel", "bounded", "unbounded", "oneshot", "select", "Sender", "Receiver"]
  },
  "structures.collections": {
    label: "structures.collections",
    detail: "Specialized data structures",
    exports: ["Deque", "BTreeMap", "BTreeSet", "OrderedMap", "RingBuffer", "BitSet", "LruCache"]
  },
  "structures.priority_queue": {
    label: "structures.priority_queue",
    detail: "Binary heap priority queue",
    exports: ["PriorityQueue", "MinHeap", "MaxHeap"]
  },
  "ui.web": {
    label: "ui.web",
    detail: "Browser reactive UI, signals, and Web Components (@mode(web.*))",
    exports: ["signal", "derived", "effect", "batch", "View", "ComponentRegistry", "mount", "html"]
  },
  "ui.desktop": {
    label: "ui.desktop",
    detail: "Native desktop reactive UI (@mode(host.*))",
    exports: ["signal", "derived", "effect", "batch", "View", "Window", "App", "runApp", "DesktopGrant"]
  },
  "debug.runtime": {
    label: "debug.runtime",
    detail: "Portals, trace capture, time-travel, and MCP debug server (\xA72-6)",
    exports: ["DebugRuntime", "activatePortal", "deactivatePortal", "startCaptureServer", "startMcpServer", "TraceEvent"]
  },
  "debug.assert": {
    label: "debug.assert",
    detail: "Runtime assertions and invariant checks",
    exports: ["assert", "assertEq", "assertNe", "assertThrows", "unreachable"]
  },
  "debug.profiler": {
    label: "debug.profiler",
    detail: "CPU and allocation profiling",
    exports: ["startProfile", "stopProfile", "ProfileReport", "span"]
  },
  "debug.recording": {
    label: "debug.recording",
    detail: "Time-travel trace recording and replay",
    exports: ["startRecording", "stopRecording", "saveRecording", "loadRecording", "Recording"]
  },
  "native.simd": {
    label: "native.simd",
    detail: "Hardware vector intrinsics (@mode(host.native) / @mode(freestanding))",
    exports: ["Vec", "f32x4", "f64x2", "i32x4", "i64x2", "u8x16", "splat", "load", "store"]
  },
  "native.atomic": {
    label: "native.atomic",
    detail: "Hardware atomics and memory fences (@mode(host.native) / @mode(freestanding))",
    exports: ["hwFence", "compilerFence", "MemoryOrder", "compareExchange", "fetchAdd"]
  },
  "native.mem": {
    label: "native.mem",
    detail: "Raw memory operations (@mode(host.native) / @mode(freestanding))",
    exports: ["alloc", "free", "copy", "zero", "Ptr", "Volatile", "MaybeUninit", "PartialInit"]
  },
  "native.dma": {
    label: "native.dma",
    detail: "DMA-safe buffer management (@mode(freestanding), \xA73-3.20)",
    exports: ["DmaBuffer", "allocCoherent", "syncForCpu", "syncForDevice"]
  },
  "native.mpu": {
    label: "native.mpu",
    detail: "Memory Protection Unit configuration (@mode(freestanding), \xA73-3.20)",
    exports: ["installStackGuard", "configureRegion", "MpuRegion"]
  },
  "native.window": {
    label: "native.window",
    detail: "OS windowing and input events",
    exports: ["Window", "WindowOptions", "EventLoop", "KeyEvent", "MouseEvent"]
  },
  "native.audio": {
    label: "native.audio",
    detail: "Low-latency native audio streams",
    exports: ["AudioDevice", "AudioStream", "AudioFormat"]
  },
  "native.webgpu": {
    label: "native.webgpu",
    detail: "WebGPU compute and rendering pipeline",
    exports: ["Adapter", "Device", "Queue", "Buffer", "ShaderModule", "ComputePipeline", "RenderPipeline"]
  },
  "testing": {
    label: "testing",
    detail: "Loup testing framework (loup-testing-reference-v1_10)",
    exports: ["test", "describe", "it", "expect", "assertEqual", "assertThrows", "beforeEach", "afterEach", "mock", "spy"]
  },
  "loup.log": {
    label: "loup.log",
    detail: "Structured logging package",
    exports: ["Logger", "info", "warn", "error", "debug", "trace", "withFields"]
  },
  "loup.config": {
    label: "loup.config",
    detail: "Layered configuration loader",
    exports: ["Config", "load", "fromEnv", "fromFile"]
  },
  "loup.cli": {
    label: "loup.cli",
    detail: "Command-line argument parser and subcommands",
    exports: ["App", "Command", "Arg", "Flag", "parse"]
  },
  "loup.tensor": {
    label: "loup.tensor",
    detail: "Multi-dimensional tensor operations and accelerator dispatch",
    exports: ["Tensor", "zeros", "ones", "randn", "matmul", "einsum", "Device"]
  },
  "loup.autodiff": {
    label: "loup.autodiff",
    detail: "Reverse- and forward-mode automatic differentiation",
    exports: ["grad", "valueAndGrad", "jvp", "vjp", "Dual"]
  },
  "loup.tpu": {
    label: "loup.tpu",
    detail: "TPU / accelerator compilation and mesh collectives",
    exports: ["TpuDevice", "Mesh", "ShardSpec", "compileKernel", "allReduce"]
  },
  "loup.crypto": {
    label: "loup.crypto",
    detail: "Cryptographic primitives (loup-crypto-packages-v0_1)",
    exports: ["sha256", "sha512", "blake3", "hmac", "aead", "ed25519", "x25519", "hkdf"]
  },
  "loup.fortran": {
    label: "loup.fortran",
    detail: "Fortran & HPC interop (loup-fortran-hpc-packages-v1_0)",
    exports: ["FortranArray", "ColumnMajor", "blas", "lapack", "fftw", "mpi"]
  },
  "loup.ui": {
    label: "loup.ui",
    detail: "Loup Common UI portable packages (@mode(portable), \xA72-4)",
    exports: ["Node", "Layout", "Style", "Color", "Event", "Widget", "Painter"]
  }
};
var STDLIB_MODULES = new Map(Object.entries(STDLIB_MODULE_TABLE));
connection.onCompletion((params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document || isManifestUri(params.textDocument.uri))
    return [];
  const linePrefix = document.getText({
    start: { line: params.position.line, character: 0 },
    end: params.position
  });
  const items = [];
  if (/(^|[\s(,])@[A-Za-z_]*$/.test(linePrefix)) {
    for (const m of LOUP_MODES) {
      items.push({
        label: m.label,
        kind: import_node.CompletionItemKind.Keyword,
        detail: m.detail,
        documentation: m.doc,
        insertText: m.label.slice(1)
        // strip leading @ since user typed @
      });
    }
    const annotations = [
      { label: "jsexport", detail: "Export function to JS host" },
      { label: 'unsafe("reason")', detail: "Mark declaration as unsafe with mandatory reason" },
      { label: "compiled", detail: "Legacy compiled directive (use @mode)" },
      { label: "inline", detail: "Hint inlining to compiler" },
      { label: "repr(C)", detail: "C ABI struct layout (@mode(freestanding) / FFI)" },
      { label: "repr(packed)", detail: "Packed struct layout" },
      { label: "entry", detail: "Bare-metal entry point (@mode(freestanding))" },
      { label: "panic_handler", detail: "Bare-metal panic handler (@mode(freestanding))" },
      { label: "interrupt", detail: "Hardware interrupt handler (@mode(freestanding))" },
      { label: "interruptSafe", detail: "Callable from interrupt context (\xA73-3.24)" },
      { label: "allocator", detail: "Register custom heap allocator (@mode(freestanding))" },
      { label: "deallocator", detail: "Register custom heap deallocator (@mode(freestanding))" },
      { label: "scheduler", detail: "Register custom scheduler for for concurrent (@mode(freestanding), \xA73-3.16a)" },
      { label: "vectorize", detail: "SIMD vectorization hint (@mode(host.native))" },
      { label: "signalSafe", detail: "Signal-safe function verification" },
      { label: 'webcomponent("tag-name")', detail: "Register class as Custom Element (@mode(web.*))" },
      { label: "polymorphic", detail: "Enable polymorphic serialization (\xA74-1)" },
      { label: 'tagged("field")', detail: "Discriminator tag for polymorphic serialization" },
      { label: 'serialField("name")', detail: "Custom serialized field name" },
      { label: "sensitive", detail: "Redact field in Debug/logs" },
      { label: "total", detail: "Verify function is total \u2014 no panic, throw, or divergence (\xA71-8.12)" },
      { label: "complete", detail: "Verify match/enum handling has no wildcard fallback (\xA71-8.12)" },
      { label: "must_resolve", detail: "Require Result/Option return value to be explicitly handled (\xA71-8.12)" },
      { label: "noderef", detail: "Pointer/address value that must not be dereferenced directly (\xA71-8.12)" },
      { label: "strategy(threadPool)", detail: "Execution strategy for for concurrent (\xA72-1.11)" },
      { label: "assume(ivdep)", detail: "Loop independence assumption for for concurrent (\xA72-1.11)" },
      { label: "domain", detail: "Declare execution domain constraint" },
      { label: "interchange", detail: "Declarative binary/text record layout (\xA74-2)" },
      { label: "field", detail: "Field descriptor inside @interchange struct (\xA74-2)" }
    ];
    for (const a of annotations) {
      items.push({
        label: `@${a.label}`,
        kind: import_node.CompletionItemKind.Property,
        detail: a.detail,
        insertText: a.label
      });
    }
    return items;
  }
  const fromMatch = linePrefix.match(/\bfrom\s+([a-zA-Z0-9_.]*)$/);
  if (fromMatch) {
    for (const mod of STDLIB_MODULES.values()) {
      items.push({
        label: mod.label,
        kind: import_node.CompletionItemKind.Module,
        detail: mod.detail
      });
    }
    return items;
  }
  const importMatch = linePrefix.match(/\bfrom\s+([a-zA-Z0-9_.]+)\s+(?:defer\s+)?import\s*\([^)]*$/);
  if (importMatch) {
    const modName = importMatch[1];
    const mod = STDLIB_MODULES.get(modName);
    if (mod) {
      for (const exp of mod.exports) {
        items.push({
          label: exp.trim(),
          kind: import_node.CompletionItemKind.Function,
          detail: `from ${modName}`
        });
      }
      return items;
    }
  }
  const nsDotMatch = linePrefix.match(/\b(core|io|net|data|sync|structures|ui|debug|native|loup)\.\s*([a-zA-Z0-9_]*)$/);
  if (nsDotMatch) {
    const prefix = `${nsDotMatch[1]}.`;
    for (const [key, mod] of STDLIB_MODULES) {
      if (key.startsWith(prefix)) {
        const subName = key.slice(prefix.length);
        items.push({
          label: subName,
          kind: import_node.CompletionItemKind.Module,
          detail: mod.detail
        });
      }
    }
  }
  const moduleDot = linePrefix.match(/(?:^|[^A-Za-z0-9_.])([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)\.\s*$/);
  if (moduleDot) {
    const modName = moduleDot[1];
    const mod = STDLIB_MODULES.get(modName);
    if (mod) {
      for (const exp of mod.exports) {
        items.push({
          label: exp.trim(),
          kind: import_node.CompletionItemKind.Function,
          detail: `${modName}.${exp.trim()}`
        });
      }
      return items;
    }
  }
  if (items.length > 0)
    return items;
  if (/\bruntime\.\s*$/.test(linePrefix)) {
    const runtimeMethods = [
      { name: "fs", detail: "func fs(): FileSystem \u2014 Host filesystem access" },
      { name: "proc", detail: "func proc(): Process \u2014 Host process & env access" },
      { name: "net", detail: "func net(): Network \u2014 Host network access" },
      { name: "ui", detail: "func ui(): UiRuntime \u2014 Reactive UI runtime" },
      { name: "debug", detail: "func debug(): DebugRuntime \u2014 Debug & portal runtime" },
      { name: "compile", detail: "func compile(source: string): Module \u2014 Dynamic JIT compilation" },
      { name: "configure", detail: "func configure(opts: RuntimeOptions): void \u2014 Executor configuration" },
      { name: "args", detail: "func args(): list[string] \u2014 Command-line arguments (\xA72-5.1)" }
    ];
    for (const m of runtimeMethods) {
      items.push({
        label: m.name,
        kind: import_node.CompletionItemKind.Method,
        detail: m.detail
      });
    }
    return items;
  }
  const symbols = getAnalysis(document).symbols;
  for (const sym of symbols) {
    if (sym.name === "")
      continue;
    items.push({
      label: sym.name,
      kind: symbolKindToCompletionKind(sym.kind),
      detail: sym.type || sym.kind
    });
  }
  for (const kw of LOUP_KEYWORDS) {
    items.push({
      label: kw,
      kind: import_node.CompletionItemKind.Keyword
    });
  }
  for (const t of LOUP_TYPES) {
    items.push({
      label: t,
      kind: import_node.CompletionItemKind.TypeParameter
    });
  }
  for (const mod of STDLIB_MODULES.values()) {
    items.push({
      label: mod.label,
      kind: import_node.CompletionItemKind.Module,
      detail: mod.detail
    });
  }
  return items;
});
function symbolKindToCompletionKind(kind) {
  switch (kind) {
    case "Function" /* Function */:
    case "AsyncFunction" /* AsyncFunction */:
    case "GenFunction" /* GenFunction */:
    case "AsyncGenFunction" /* AsyncGenFunction */:
    case "ExternFunction" /* ExternFunction */:
      return import_node.CompletionItemKind.Function;
    case "Class" /* Class */:
      return import_node.CompletionItemKind.Class;
    case "Struct" /* Struct */:
      return import_node.CompletionItemKind.Struct;
    case "Enum" /* Enum */:
      return import_node.CompletionItemKind.Enum;
    case "EnumVariant" /* EnumVariant */:
      return import_node.CompletionItemKind.EnumMember;
    case "Interface" /* Interface */:
      return import_node.CompletionItemKind.Interface;
    case "TypeAlias" /* TypeAlias */:
      return import_node.CompletionItemKind.TypeParameter;
    case "Macro" /* Macro */:
      return import_node.CompletionItemKind.Keyword;
    case "Variable" /* Variable */:
    case "ExternValue" /* ExternValue */:
      return import_node.CompletionItemKind.Variable;
    case "Parameter" /* Parameter */:
      return import_node.CompletionItemKind.Variable;
    case "Field" /* Field */:
      return import_node.CompletionItemKind.Field;
    case "Operator" /* Operator */:
      return import_node.CompletionItemKind.Operator;
    case "Portal" /* Portal */:
      return import_node.CompletionItemKind.Event;
    case "Import" /* Import */:
      return import_node.CompletionItemKind.Reference;
    case "Namespace" /* Namespace */:
      return import_node.CompletionItemKind.Module;
  }
}
var KEYWORD_DOC_TABLE = {
  portal: "**`portal`** \u2014 Named diagnostic and debug observation point (\xA72-6).\n\nZero cost when inactive; can be activated at runtime or in the debugger with optional conditions.",
  defer: "**`defer`** \u2014 Schedules a call or block to execute when the enclosing scope exits (\xA71-6.5).",
  with: "**`with`** \u2014 Scoped resource management (`Scoped[T]` / `AsyncScoped[T]`, \xA71-6.6). Automatically closes the resource on scope exit.",
  spawn: "**`spawn`** \u2014 Starts a concurrent child task inside an `await group` block (\xA72-1.2).",
  concurrent: "**`for concurrent`** \u2014 Structured parallel iteration over a range or array (\xA72-1.11). Supports `@strategy(threadPool)` and `@strategy(accelerator)`.",
  match: "**`match`** \u2014 Exhaustive pattern matching expression (\xA71-5.5).",
  attempt: "**`attempt`** \u2014 Unwraps `Ok(v)` from a `Result[T, E]` or branches to the enclosing `try ... catch Err` arm (\xA71-5.10).",
  unreachable: "**`unreachable`** \u2014 Expression of type `noreturn` asserting that control flow can never reach this point (\xA71-5.11). Panics in all build profiles if reached.",
  noreturn: "**`noreturn`** \u2014 Return-type marker for functions that never return normally (\xA71-4.4a).",
  impossible: "**`impossible`** \u2014 Uninhabited type with no values, legal in enum payload type arguments such as `Result[T, impossible]` (\xA71-4.4b).",
  const: "**`const`** \u2014 Compile-time constant binding (`const N = ...`), compile-time evaluable function (`const func`), or compile-time conditional (`if const (...)`) (\xA71-6.2, \xA71-6.3, \xA71-7.1).",
  dynamic: "**`dynamic`** \u2014 Declares a dynamic class supporting `!{field}` access, or opens a `dynamic obj as alias` view block.",
  extern: '**`extern`** \u2014 Foreign Function Interface declaration (`extern js` or `extern native "lib"`).',
  box: "**`box`** \u2014 Explicitly widens a value type to `Any` (\xA71-4.3). Prohibited in `@mode(freestanding)`.",
  gen: "**`gen`** \u2014 Declares a generator function (`gen func` or `async gen func`) that yields values lazily via `yield`.",
  yield: "**`yield`** \u2014 Produces a value from a generator function (`yield expr;`) or delegates to another generator (`yield* iterable;`).",
  macro: "**`macro`** \u2014 Declares a hygienic compile-time AST macro using `quote { ... }` (\xA71-17).",
  struct: "**`struct`** \u2014 Declares a stack-allocated value type with copy semantics (\xA71-8).",
  type: "**`type`** \u2014 Declares a type alias (`type Name[T] = TargetType;`, \xA71-4.6).",
  del: "**`del`** \u2014 Deletes a key/slice from a mutable collection (`del dict[key];`).",
  borrow: "**`borrow`** \u2014 Non-owning parameter or field reference (\xA73-2.4.1). Use `excl borrow` for exclusive mutable access.",
  unique: "**`unique`** \u2014 Single-owner binding (`unique let`/`unique var`) or class (`unique class`) with zero ARC overhead (\xA71-8.11, \xA73-2.4.7).",
  onstack: "**`onstack`** \u2014 Guarantees local aggregate storage is materialized in the stack frame (`@mode(freestanding)`, \xA73-3.17c).",
  consume: "**`consume`** \u2014 Explicitly transfers a `unique` binding into an ARC-managed reference (`@mode(host.native)` / `@mode(host.dual)`, \xA73-2.4.7).",
  lifetime: "**`lifetime`** \u2014 Declares a named lifetime region parameter (`[lifetime ~a]`, \xA73-2.4.2).",
  noescape: "**`noescape`** \u2014 Guarantees a closure parameter does not escape the call (`noescape fn(...)`, \xA73-2.4.3).",
  reads: "**`reads`** \u2014 Ownership verb: function inspects the parameter without mutating or retaining it (default, \xA73-2.4.9).",
  edits: "**`edits`** \u2014 Ownership verb: function mutates the parameter in place (\xA73-2.4.9).",
  takes: "**`takes`** \u2014 Ownership verb: function consumes ownership of the parameter (\xA73-2.4.9).",
  shares: "**`shares`** \u2014 Ownership verb: function retains a shared reference to the parameter (\xA73-2.4.9).",
  modifier: "**`modifier`** \u2014 Marks a class method that mutates `var` fields on `this` (\xA73-2.4.11).",
  safe: "**`safe`** \u2014 Introduces a compile-time verified safe ownership context (`safe {}` or `safe func`, \xA73-2.4.12).",
  synchronized: "**`synchronized`** \u2014 Equips a class with a mutex serializing all `modifier` methods (\xA73-2.4.13).",
  unsafe: '**`unsafe`** \u2014 Programmer-audited unsafe block (`unsafe("reason") { ... }`, \xA73-2.4.6).',
  requires: "**`requires`** \u2014 Function contract precondition clause (`requires distinct(a, b)`, \xA73-2.4.10).",
  atomic: "**`atomic`** \u2014 Cooperative atomicity block verified to contain no suspension points (`await`, `spawn`) (\xA72-1.7).",
  volatile: "**`volatile`** \u2014 Hardware register / memory-mapped access qualifier (`@mode(host.native)` / `@mode(freestanding)`, \xA73-3.8).",
  portable: "**`@mode(portable)`** \u2014 Portable library mode (\xA71-2.4.7). Checked against the PORTABLE-SUBSET and compiled in each importing unit's mode.",
  complex: "**`complex`** \u2014 128-bit complex floating-point primitive (`complex64`, pair of `float64` real/imaginary parts, \xA71-4.1.6). Also `complex32` (pair of `float32`).",
  fixed: "**`fixed`** \u2014 Signed 64-bit Q32.32 fixed-point primitive type.",
  array: "**`array[T, rank]`** \u2014 Rank-typed N-dimensional dense array type (\xA71-4.10, `core.array`).",
  reinterpretChecked: "**`reinterpretChecked[T, U](expr)`** \u2014 Safe bit-cast with runtime alignment check returning `Result[U, AlignmentError]` (\xA73-3.18)."
};
var KEYWORD_DOCS = new Map(Object.entries(KEYWORD_DOC_TABLE));
connection.onHover((params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document || isManifestUri(params.textDocument.uri))
    return null;
  const text = document.getText();
  const offset = document.offsetAt(params.position);
  const word = getWordAtOffset(text, offset);
  if (!word)
    return null;
  const keywordDoc = KEYWORD_DOCS.get(word);
  if (keywordDoc !== void 0) {
    return {
      contents: {
        kind: import_node.MarkupKind.Markdown,
        value: keywordDoc
      }
    };
  }
  const sym = getAnalysis(document).symbolTable.findSymbol(word);
  if (sym) {
    const codeBlock = sym.type ? `\`\`\`loup
${sym.name}: ${sym.type}
\`\`\`` : `\`\`\`loup
(${sym.kind}) ${sym.name}
\`\`\``;
    return {
      contents: {
        kind: import_node.MarkupKind.Markdown,
        value: codeBlock
      }
    };
  }
  for (const [modName, mod] of STDLIB_MODULES) {
    if (mod.exports.includes(word)) {
      return {
        contents: {
          kind: import_node.MarkupKind.Markdown,
          value: `\`\`\`loup
from ${modName} import (${word})
\`\`\`
${mod.detail}`
        }
      };
    }
  }
  return null;
});
connection.onDocumentSymbol((params) => {
  return getSymbols(params.textDocument.uri).map((sym) => symbolInfoToDocumentSymbol(sym));
});
function symbolInfoToDocumentSymbol(sym) {
  return {
    // The client rejects the whole outline if any name is empty.
    name: sym.name === "" ? "_" : sym.name,
    detail: sym.type,
    kind: symbolKindToLspKind(sym.kind),
    range: toPlainRange(sym.range),
    selectionRange: toPlainRange(sym.selectionRange),
    children: sym.children?.map((c) => symbolInfoToDocumentSymbol(c))
  };
}
function symbolKindToLspKind(kind) {
  switch (kind) {
    case "Function" /* Function */:
    case "AsyncFunction" /* AsyncFunction */:
    case "GenFunction" /* GenFunction */:
    case "AsyncGenFunction" /* AsyncGenFunction */:
    case "ExternFunction" /* ExternFunction */:
      return import_node.SymbolKind.Function;
    case "Class" /* Class */:
      return import_node.SymbolKind.Class;
    case "Struct" /* Struct */:
      return import_node.SymbolKind.Struct;
    case "Enum" /* Enum */:
      return import_node.SymbolKind.Enum;
    case "EnumVariant" /* EnumVariant */:
      return import_node.SymbolKind.EnumMember;
    case "Interface" /* Interface */:
      return import_node.SymbolKind.Interface;
    case "TypeAlias" /* TypeAlias */:
      return import_node.SymbolKind.TypeParameter;
    case "Macro" /* Macro */:
      return import_node.SymbolKind.Function;
    case "Variable" /* Variable */:
    case "ExternValue" /* ExternValue */:
      return import_node.SymbolKind.Variable;
    case "Parameter" /* Parameter */:
      return import_node.SymbolKind.Variable;
    case "Field" /* Field */:
      return import_node.SymbolKind.Field;
    case "Operator" /* Operator */:
      return import_node.SymbolKind.Operator;
    case "Portal" /* Portal */:
      return import_node.SymbolKind.Event;
    case "Import" /* Import */:
      return import_node.SymbolKind.Package;
    case "Namespace" /* Namespace */:
      return import_node.SymbolKind.Namespace;
  }
}
connection.onDefinition((params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document || isManifestUri(params.textDocument.uri))
    return null;
  const text = document.getText();
  const offset = document.offsetAt(params.position);
  const word = getWordAtOffset(text, offset);
  if (!word)
    return null;
  const symTable = getAnalysis(document).symbolTable;
  const sym = symTable.findSymbol(word) || symTable.findSymbol(`portal:${word}`);
  if (!sym)
    return null;
  return {
    uri: params.textDocument.uri,
    range: toPlainRange(sym.selectionRange)
  };
});
connection.onFoldingRanges((params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document || isManifestUri(params.textDocument.uri))
    return [];
  return computeFoldingRanges(document.getText());
});
var tokenTypeMap = /* @__PURE__ */ new Map();
tokenTypes.forEach((t, i) => tokenTypeMap.set(t, i));
var tokenModMap = /* @__PURE__ */ new Map();
tokenModifiers.forEach((m, i) => tokenModMap.set(m, 1 << i));
connection.languages.semanticTokens.on((params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document || isManifestUri(params.textDocument.uri))
    return { data: [] };
  const builder = new import_node.SemanticTokensBuilder();
  for (const tok of classifyTokens(document.getText())) {
    const typeIdx = tokenTypeMap.get(tok.type);
    if (typeIdx === void 0)
      continue;
    let modBits = 0;
    for (const modifier of tok.modifiers)
      modBits |= tokenModMap.get(modifier) ?? 0;
    builder.push(tok.line, tok.character, tok.length, typeIdx, modBits);
  }
  return builder.build();
});
connection.onDocumentFormatting((params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document || isManifestUri(params.textDocument.uri))
    return [];
  const text = document.getText();
  const indentUnit = params.options.insertSpaces ? " ".repeat(params.options.tabSize || 2) : "	";
  const formatted = formatSource(text, indentUnit);
  if (formatted === text)
    return [];
  return [
    import_node.TextEdit.replace(
      {
        start: { line: 0, character: 0 },
        end: document.positionAt(text.length)
      },
      formatted
    )
  ];
});
connection.onCodeAction((params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document || isManifestUri(params.textDocument.uri))
    return [];
  const actions = [];
  const text = document.getText();
  const uri = params.textDocument.uri;
  for (const diag of params.context.diagnostics) {
    const word = getWordAtOffset(text, document.offsetAt(diag.range.start));
    if (word) {
      for (const [modName, mod] of STDLIB_MODULES) {
        if (mod.exports.includes(word)) {
          if (!text.includes(`from ${modName}`)) {
            actions.push({
              title: `Import '${word}' from ${modName}`,
              kind: import_node.CodeActionKind.QuickFix,
              diagnostics: [diag],
              edit: {
                changes: {
                  [uri]: [
                    import_node.TextEdit.insert(
                      // below `@mode(...)` and `namespace`, which must stay first
                      { line: importInsertLine(text), character: 0 },
                      `from ${modName} import (${word});
`
                    )
                  ]
                }
              }
            });
          }
        }
      }
    }
    if (diag.message.includes("match") && diag.message.includes("exhaustive")) {
      actions.push({
        title: 'Add wildcard arm "_ => ..."',
        kind: import_node.CodeActionKind.QuickFix,
        diagnostics: [diag],
        edit: {
          changes: {
            [uri]: [{
              range: {
                start: diag.range.end,
                end: diag.range.end
              },
              newText: "\n  _ => { # TODO }"
            }]
          }
        }
      });
    }
  }
  return actions;
});
connection.onSignatureHelp((params) => {
  const uri = params.textDocument.uri;
  const document = documents.get(uri);
  if (!document || isManifestUri(uri))
    return null;
  const symbols = getAnalysis(document).symbols;
  const text = document.getText();
  const offset = document.offsetAt(params.position);
  let parenDepth = 0;
  let commaCount = 0;
  let funcNameEnd = -1;
  for (let i = offset - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === ")")
      parenDepth++;
    else if (ch === "(") {
      if (parenDepth === 0) {
        funcNameEnd = i;
        break;
      }
      parenDepth--;
    } else if (ch === "," && parenDepth === 0) {
      commaCount++;
    }
  }
  if (funcNameEnd < 0)
    return null;
  const funcName = getWordAtOffset(text, funcNameEnd);
  if (!funcName)
    return null;
  const sym = findSymbolByName(symbols, funcName);
  if (!sym || !sym.type)
    return null;
  const sigMatch = sym.type.match(/^(?:async )?(?:gen )?func\((.*)\)(.*)$/);
  if (!sigMatch)
    return null;
  const paramsStr = sigMatch[1];
  const returnType = sigMatch[2] || "";
  const paramList = splitTopLevel(paramsStr);
  const sig = {
    label: `${funcName}(${paramsStr})${returnType}`,
    parameters: paramList.map((p) => ({
      label: p
    }))
  };
  return {
    signatures: [sig],
    activeSignature: 0,
    activeParameter: Math.min(commaCount, Math.max(0, paramList.length - 1))
  };
});
function findSymbolByName(symbols, name) {
  for (const sym of symbols) {
    if (sym.name === name)
      return sym;
    if (sym.children) {
      const found = findSymbolByName(sym.children, name);
      if (found)
        return found;
    }
  }
  return void 0;
}
connection.onWorkspaceSymbol((_params) => {
  const results = [];
  const query = (_params.query || "").toLowerCase();
  for (const document of documents.all()) {
    const uri = document.uri;
    if (isManifestUri(uri))
      continue;
    for (const sym of getAnalysis(document).symbols) {
      if (query && !sym.name.toLowerCase().includes(query))
        continue;
      results.push({
        name: sym.name,
        kind: symbolKindToLspKind(sym.kind),
        location: {
          uri,
          range: toPlainRange(sym.selectionRange)
        }
      });
      if (sym.children) {
        for (const child of sym.children) {
          if (query && !child.name.toLowerCase().includes(query))
            continue;
          results.push({
            name: `${sym.name}.${child.name}`,
            kind: symbolKindToLspKind(child.kind),
            containerName: sym.name,
            location: {
              uri,
              range: toPlainRange(child.selectionRange)
            }
          });
        }
      }
    }
  }
  return results;
});
documents.listen(connection);
connection.listen();
//# sourceMappingURL=server.js.map
