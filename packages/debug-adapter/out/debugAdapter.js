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

// ../../../../../node_modules/@vscode/debugadapter/lib/messages.js
var require_messages = __commonJS({
  "../../../../../node_modules/@vscode/debugadapter/lib/messages.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Event = exports2.Response = exports2.Message = void 0;
    var Message = class {
      constructor(type) {
        this.seq = 0;
        this.type = type;
      }
    };
    exports2.Message = Message;
    var Response = class extends Message {
      constructor(request, message) {
        super("response");
        this.request_seq = request.seq;
        this.command = request.command;
        if (message) {
          this.success = false;
          this.message = message;
        } else {
          this.success = true;
        }
      }
    };
    exports2.Response = Response;
    var Event = class extends Message {
      constructor(event, body) {
        super("event");
        this.event = event;
        if (body) {
          this.body = body;
        }
      }
    };
    exports2.Event = Event;
  }
});

// ../../../../../node_modules/@vscode/debugadapter/lib/protocol.js
var require_protocol = __commonJS({
  "../../../../../node_modules/@vscode/debugadapter/lib/protocol.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ProtocolServer = void 0;
    var ee = require("events");
    var messages_1 = require_messages();
    var Emitter = class {
      get event() {
        if (!this._event) {
          this._event = (listener, thisArg) => {
            this._listener = listener;
            this._this = thisArg;
            let result;
            result = {
              dispose: () => {
                this._listener = void 0;
                this._this = void 0;
              }
            };
            return result;
          };
        }
        return this._event;
      }
      fire(event) {
        if (this._listener) {
          try {
            this._listener.call(this._this, event);
          } catch (e) {
          }
        }
      }
      hasListener() {
        return !!this._listener;
      }
      dispose() {
        this._listener = void 0;
        this._this = void 0;
      }
    };
    var ProtocolServer = class _ProtocolServer extends ee.EventEmitter {
      constructor() {
        super();
        this._sendMessage = new Emitter();
        this._sequence = 1;
        this._pendingRequests = /* @__PURE__ */ new Map();
        this.onDidSendMessage = this._sendMessage.event;
      }
      // ---- implements vscode.Debugadapter interface ---------------------------
      dispose() {
      }
      handleMessage(msg) {
        if (msg.type === "request") {
          this.dispatchRequest(msg);
        } else if (msg.type === "response") {
          const response = msg;
          const clb = this._pendingRequests.get(response.request_seq);
          if (clb) {
            this._pendingRequests.delete(response.request_seq);
            clb(response);
          }
        }
      }
      _isRunningInline() {
        return this._sendMessage && this._sendMessage.hasListener();
      }
      //--------------------------------------------------------------------------
      start(inStream, outStream) {
        this._writableStream = outStream;
        this._rawData = Buffer.alloc(0);
        inStream.on("data", (data) => this._handleData(data));
        inStream.on("close", () => {
          this._emitEvent(new messages_1.Event("close"));
        });
        inStream.on("error", (error) => {
          this._emitEvent(new messages_1.Event("error", "inStream error: " + (error && error.message)));
        });
        outStream.on("error", (error) => {
          this._emitEvent(new messages_1.Event("error", "outStream error: " + (error && error.message)));
        });
        inStream.resume();
      }
      stop() {
        if (this._writableStream) {
          this._writableStream.end();
        }
      }
      sendEvent(event) {
        this._send("event", event);
      }
      sendResponse(response) {
        if (response.seq > 0) {
          console.error(`attempt to send more than one response for command ${response.command}`);
        } else {
          this._send("response", response);
        }
      }
      sendRequest(command, args, timeout, cb) {
        const request = {
          command
        };
        if (args && Object.keys(args).length > 0) {
          request.arguments = args;
        }
        this._send("request", request);
        if (cb) {
          this._pendingRequests.set(request.seq, cb);
          const timer = setTimeout(() => {
            clearTimeout(timer);
            const clb = this._pendingRequests.get(request.seq);
            if (clb) {
              this._pendingRequests.delete(request.seq);
              clb(new messages_1.Response(request, "timeout"));
            }
          }, timeout);
        }
      }
      // ---- protected ----------------------------------------------------------
      dispatchRequest(request) {
      }
      // ---- private ------------------------------------------------------------
      _emitEvent(event) {
        this.emit(event.event, event);
      }
      _send(typ, message) {
        message.type = typ;
        message.seq = this._sequence++;
        if (this._writableStream) {
          const json = JSON.stringify(message);
          this._writableStream.write(`Content-Length: ${Buffer.byteLength(json, "utf8")}\r
\r
${json}`, "utf8");
        }
        this._sendMessage.fire(message);
      }
      _handleData(data) {
        this._rawData = Buffer.concat([this._rawData, data]);
        while (true) {
          if (this._contentLength >= 0) {
            if (this._rawData.length >= this._contentLength) {
              const message = this._rawData.toString("utf8", 0, this._contentLength);
              this._rawData = this._rawData.slice(this._contentLength);
              this._contentLength = -1;
              if (message.length > 0) {
                try {
                  let msg = JSON.parse(message);
                  this.handleMessage(msg);
                } catch (e) {
                  this._emitEvent(new messages_1.Event("error", "Error handling data: " + (e && e.message)));
                }
              }
              continue;
            }
          } else {
            const idx = this._rawData.indexOf(_ProtocolServer.TWO_CRLF);
            if (idx !== -1) {
              const header = this._rawData.toString("utf8", 0, idx);
              const lines = header.split("\r\n");
              for (let i = 0; i < lines.length; i++) {
                const pair = lines[i].split(/: +/);
                if (pair[0] == "Content-Length") {
                  this._contentLength = +pair[1];
                }
              }
              this._rawData = this._rawData.slice(idx + _ProtocolServer.TWO_CRLF.length);
              continue;
            }
          }
          break;
        }
      }
    };
    exports2.ProtocolServer = ProtocolServer;
    ProtocolServer.TWO_CRLF = "\r\n\r\n";
  }
});

// ../../../../../node_modules/@vscode/debugadapter/lib/runDebugAdapter.js
var require_runDebugAdapter = __commonJS({
  "../../../../../node_modules/@vscode/debugadapter/lib/runDebugAdapter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.runDebugAdapter = void 0;
    var Net = require("net");
    function runDebugAdapter(debugSession) {
      let port = 0;
      const args = process.argv.slice(2);
      args.forEach(function(val, index, array) {
        const portMatch = /^--server=(\d{4,5})$/.exec(val);
        if (portMatch) {
          port = parseInt(portMatch[1], 10);
        }
      });
      if (port > 0) {
        console.error(`waiting for debug protocol on port ${port}`);
        Net.createServer((socket) => {
          console.error(">> accepted connection from client");
          socket.on("end", () => {
            console.error(">> client connection closed\n");
          });
          const session = new debugSession(false, true);
          session.setRunAsServer(true);
          session.start(socket, socket);
        }).listen(port);
      } else {
        const session = new debugSession(false);
        process.on("SIGTERM", () => {
          session.shutdown();
        });
        session.start(process.stdin, process.stdout);
      }
    }
    exports2.runDebugAdapter = runDebugAdapter;
  }
});

// ../../../../../node_modules/@vscode/debugadapter/lib/debugSession.js
var require_debugSession = __commonJS({
  "../../../../../node_modules/@vscode/debugadapter/lib/debugSession.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DebugSession = exports2.ErrorDestination = exports2.MemoryEvent = exports2.InvalidatedEvent = exports2.ProgressEndEvent = exports2.ProgressUpdateEvent = exports2.ProgressStartEvent = exports2.CapabilitiesEvent = exports2.LoadedSourceEvent = exports2.ModuleEvent = exports2.BreakpointEvent = exports2.ThreadEvent = exports2.OutputEvent = exports2.ExitedEvent = exports2.TerminatedEvent = exports2.InitializedEvent = exports2.ContinuedEvent = exports2.StoppedEvent = exports2.CompletionItem = exports2.Module = exports2.Breakpoint = exports2.Variable = exports2.Thread = exports2.StackFrame = exports2.Scope = exports2.Source = void 0;
    var protocol_1 = require_protocol();
    var messages_1 = require_messages();
    var runDebugAdapter_1 = require_runDebugAdapter();
    var url_1 = require("url");
    var Source2 = class {
      constructor(name, path2, id = 0, origin, data) {
        this.name = name;
        this.path = path2;
        this.sourceReference = id;
        if (origin) {
          this.origin = origin;
        }
        if (data) {
          this.adapterData = data;
        }
      }
    };
    exports2.Source = Source2;
    var Scope2 = class {
      constructor(name, reference, expensive = false) {
        this.name = name;
        this.variablesReference = reference;
        this.expensive = expensive;
      }
    };
    exports2.Scope = Scope2;
    var StackFrame2 = class {
      constructor(i, nm, src, ln = 0, col = 0) {
        this.id = i;
        this.source = src;
        this.line = ln;
        this.column = col;
        this.name = nm;
      }
    };
    exports2.StackFrame = StackFrame2;
    var Thread2 = class {
      constructor(id, name) {
        this.id = id;
        if (name) {
          this.name = name;
        } else {
          this.name = "Thread #" + id;
        }
      }
    };
    exports2.Thread = Thread2;
    var Variable = class {
      constructor(name, value, ref = 0, indexedVariables, namedVariables) {
        this.name = name;
        this.value = value;
        this.variablesReference = ref;
        if (typeof namedVariables === "number") {
          this.namedVariables = namedVariables;
        }
        if (typeof indexedVariables === "number") {
          this.indexedVariables = indexedVariables;
        }
      }
    };
    exports2.Variable = Variable;
    var Breakpoint2 = class {
      constructor(verified, line, column, source) {
        this.verified = verified;
        const e = this;
        if (typeof line === "number") {
          e.line = line;
        }
        if (typeof column === "number") {
          e.column = column;
        }
        if (source) {
          e.source = source;
        }
      }
      setId(id) {
        this.id = id;
      }
    };
    exports2.Breakpoint = Breakpoint2;
    var Module = class {
      constructor(id, name) {
        this.id = id;
        this.name = name;
      }
    };
    exports2.Module = Module;
    var CompletionItem = class {
      constructor(label, start, length = 0) {
        this.label = label;
        this.start = start;
        this.length = length;
      }
    };
    exports2.CompletionItem = CompletionItem;
    var StoppedEvent2 = class extends messages_1.Event {
      constructor(reason, threadId, exceptionText) {
        super("stopped");
        this.body = {
          reason
        };
        if (typeof threadId === "number") {
          this.body.threadId = threadId;
        }
        if (typeof exceptionText === "string") {
          this.body.text = exceptionText;
        }
      }
    };
    exports2.StoppedEvent = StoppedEvent2;
    var ContinuedEvent = class extends messages_1.Event {
      constructor(threadId, allThreadsContinued) {
        super("continued");
        this.body = {
          threadId
        };
        if (typeof allThreadsContinued === "boolean") {
          this.body.allThreadsContinued = allThreadsContinued;
        }
      }
    };
    exports2.ContinuedEvent = ContinuedEvent;
    var InitializedEvent2 = class extends messages_1.Event {
      constructor() {
        super("initialized");
      }
    };
    exports2.InitializedEvent = InitializedEvent2;
    var TerminatedEvent2 = class extends messages_1.Event {
      constructor(restart) {
        super("terminated");
        if (typeof restart === "boolean" || restart) {
          const e = this;
          e.body = {
            restart
          };
        }
      }
    };
    exports2.TerminatedEvent = TerminatedEvent2;
    var ExitedEvent = class extends messages_1.Event {
      constructor(exitCode) {
        super("exited");
        this.body = {
          exitCode
        };
      }
    };
    exports2.ExitedEvent = ExitedEvent;
    var OutputEvent2 = class extends messages_1.Event {
      constructor(output, category = "console", data) {
        super("output");
        this.body = {
          category,
          output
        };
        if (data !== void 0) {
          this.body.data = data;
        }
      }
    };
    exports2.OutputEvent = OutputEvent2;
    var ThreadEvent = class extends messages_1.Event {
      constructor(reason, threadId) {
        super("thread");
        this.body = {
          reason,
          threadId
        };
      }
    };
    exports2.ThreadEvent = ThreadEvent;
    var BreakpointEvent2 = class extends messages_1.Event {
      constructor(reason, breakpoint) {
        super("breakpoint");
        this.body = {
          reason,
          breakpoint
        };
      }
    };
    exports2.BreakpointEvent = BreakpointEvent2;
    var ModuleEvent = class extends messages_1.Event {
      constructor(reason, module3) {
        super("module");
        this.body = {
          reason,
          module: module3
        };
      }
    };
    exports2.ModuleEvent = ModuleEvent;
    var LoadedSourceEvent = class extends messages_1.Event {
      constructor(reason, source) {
        super("loadedSource");
        this.body = {
          reason,
          source
        };
      }
    };
    exports2.LoadedSourceEvent = LoadedSourceEvent;
    var CapabilitiesEvent = class extends messages_1.Event {
      constructor(capabilities) {
        super("capabilities");
        this.body = {
          capabilities
        };
      }
    };
    exports2.CapabilitiesEvent = CapabilitiesEvent;
    var ProgressStartEvent = class extends messages_1.Event {
      constructor(progressId, title, message) {
        super("progressStart");
        this.body = {
          progressId,
          title
        };
        if (typeof message === "string") {
          this.body.message = message;
        }
      }
    };
    exports2.ProgressStartEvent = ProgressStartEvent;
    var ProgressUpdateEvent = class extends messages_1.Event {
      constructor(progressId, message) {
        super("progressUpdate");
        this.body = {
          progressId
        };
        if (typeof message === "string") {
          this.body.message = message;
        }
      }
    };
    exports2.ProgressUpdateEvent = ProgressUpdateEvent;
    var ProgressEndEvent = class extends messages_1.Event {
      constructor(progressId, message) {
        super("progressEnd");
        this.body = {
          progressId
        };
        if (typeof message === "string") {
          this.body.message = message;
        }
      }
    };
    exports2.ProgressEndEvent = ProgressEndEvent;
    var InvalidatedEvent = class extends messages_1.Event {
      constructor(areas, threadId, stackFrameId) {
        super("invalidated");
        this.body = {};
        if (areas) {
          this.body.areas = areas;
        }
        if (threadId) {
          this.body.threadId = threadId;
        }
        if (stackFrameId) {
          this.body.stackFrameId = stackFrameId;
        }
      }
    };
    exports2.InvalidatedEvent = InvalidatedEvent;
    var MemoryEvent = class extends messages_1.Event {
      constructor(memoryReference, offset, count) {
        super("memory");
        this.body = { memoryReference, offset, count };
      }
    };
    exports2.MemoryEvent = MemoryEvent;
    var ErrorDestination;
    (function(ErrorDestination2) {
      ErrorDestination2[ErrorDestination2["User"] = 1] = "User";
      ErrorDestination2[ErrorDestination2["Telemetry"] = 2] = "Telemetry";
    })(ErrorDestination = exports2.ErrorDestination || (exports2.ErrorDestination = {}));
    var DebugSession = class _DebugSession extends protocol_1.ProtocolServer {
      constructor(obsolete_debuggerLinesAndColumnsStartAt1, obsolete_isServer) {
        super();
        const linesAndColumnsStartAt1 = typeof obsolete_debuggerLinesAndColumnsStartAt1 === "boolean" ? obsolete_debuggerLinesAndColumnsStartAt1 : false;
        this._debuggerLinesStartAt1 = linesAndColumnsStartAt1;
        this._debuggerColumnsStartAt1 = linesAndColumnsStartAt1;
        this._debuggerPathsAreURIs = false;
        this._clientLinesStartAt1 = true;
        this._clientColumnsStartAt1 = true;
        this._clientPathsAreURIs = false;
        this._isServer = typeof obsolete_isServer === "boolean" ? obsolete_isServer : false;
        this.on("close", () => {
          this.shutdown();
        });
        this.on("error", (error) => {
          this.shutdown();
        });
      }
      setDebuggerPathFormat(format) {
        this._debuggerPathsAreURIs = format !== "path";
      }
      setDebuggerLinesStartAt1(enable) {
        this._debuggerLinesStartAt1 = enable;
      }
      setDebuggerColumnsStartAt1(enable) {
        this._debuggerColumnsStartAt1 = enable;
      }
      setRunAsServer(enable) {
        this._isServer = enable;
      }
      /**
       * A virtual constructor...
       */
      static run(debugSession) {
        (0, runDebugAdapter_1.runDebugAdapter)(debugSession);
      }
      shutdown() {
        if (this._isServer || this._isRunningInline()) {
        } else {
          setTimeout(() => {
            process.exit(0);
          }, 100);
        }
      }
      sendErrorResponse(response, codeOrMessage, format, variables, dest = ErrorDestination.User) {
        let msg;
        if (typeof codeOrMessage === "number") {
          msg = {
            id: codeOrMessage,
            format
          };
          if (variables) {
            msg.variables = variables;
          }
          if (dest & ErrorDestination.User) {
            msg.showUser = true;
          }
          if (dest & ErrorDestination.Telemetry) {
            msg.sendTelemetry = true;
          }
        } else {
          msg = codeOrMessage;
        }
        response.success = false;
        response.message = _DebugSession.formatPII(msg.format, true, msg.variables);
        if (!response.body) {
          response.body = {};
        }
        response.body.error = msg;
        this.sendResponse(response);
      }
      runInTerminalRequest(args, timeout, cb) {
        this.sendRequest("runInTerminal", args, timeout, cb);
      }
      dispatchRequest(request) {
        const response = new messages_1.Response(request);
        try {
          if (request.command === "initialize") {
            var args = request.arguments;
            if (typeof args.linesStartAt1 === "boolean") {
              this._clientLinesStartAt1 = args.linesStartAt1;
            }
            if (typeof args.columnsStartAt1 === "boolean") {
              this._clientColumnsStartAt1 = args.columnsStartAt1;
            }
            if (args.pathFormat !== "path") {
              this.sendErrorResponse(response, 2018, "debug adapter only supports native paths", null, ErrorDestination.Telemetry);
            } else {
              const initializeResponse = response;
              initializeResponse.body = {};
              this.initializeRequest(initializeResponse, args);
            }
          } else if (request.command === "launch") {
            this.launchRequest(response, request.arguments, request);
          } else if (request.command === "attach") {
            this.attachRequest(response, request.arguments, request);
          } else if (request.command === "disconnect") {
            this.disconnectRequest(response, request.arguments, request);
          } else if (request.command === "terminate") {
            this.terminateRequest(response, request.arguments, request);
          } else if (request.command === "restart") {
            this.restartRequest(response, request.arguments, request);
          } else if (request.command === "setBreakpoints") {
            this.setBreakPointsRequest(response, request.arguments, request);
          } else if (request.command === "setFunctionBreakpoints") {
            this.setFunctionBreakPointsRequest(response, request.arguments, request);
          } else if (request.command === "setExceptionBreakpoints") {
            this.setExceptionBreakPointsRequest(response, request.arguments, request);
          } else if (request.command === "configurationDone") {
            this.configurationDoneRequest(response, request.arguments, request);
          } else if (request.command === "continue") {
            this.continueRequest(response, request.arguments, request);
          } else if (request.command === "next") {
            this.nextRequest(response, request.arguments, request);
          } else if (request.command === "stepIn") {
            this.stepInRequest(response, request.arguments, request);
          } else if (request.command === "stepOut") {
            this.stepOutRequest(response, request.arguments, request);
          } else if (request.command === "stepBack") {
            this.stepBackRequest(response, request.arguments, request);
          } else if (request.command === "reverseContinue") {
            this.reverseContinueRequest(response, request.arguments, request);
          } else if (request.command === "restartFrame") {
            this.restartFrameRequest(response, request.arguments, request);
          } else if (request.command === "goto") {
            this.gotoRequest(response, request.arguments, request);
          } else if (request.command === "pause") {
            this.pauseRequest(response, request.arguments, request);
          } else if (request.command === "stackTrace") {
            this.stackTraceRequest(response, request.arguments, request);
          } else if (request.command === "scopes") {
            this.scopesRequest(response, request.arguments, request);
          } else if (request.command === "variables") {
            this.variablesRequest(response, request.arguments, request);
          } else if (request.command === "setVariable") {
            this.setVariableRequest(response, request.arguments, request);
          } else if (request.command === "setExpression") {
            this.setExpressionRequest(response, request.arguments, request);
          } else if (request.command === "source") {
            this.sourceRequest(response, request.arguments, request);
          } else if (request.command === "threads") {
            this.threadsRequest(response, request);
          } else if (request.command === "terminateThreads") {
            this.terminateThreadsRequest(response, request.arguments, request);
          } else if (request.command === "evaluate") {
            this.evaluateRequest(response, request.arguments, request);
          } else if (request.command === "stepInTargets") {
            this.stepInTargetsRequest(response, request.arguments, request);
          } else if (request.command === "gotoTargets") {
            this.gotoTargetsRequest(response, request.arguments, request);
          } else if (request.command === "completions") {
            this.completionsRequest(response, request.arguments, request);
          } else if (request.command === "exceptionInfo") {
            this.exceptionInfoRequest(response, request.arguments, request);
          } else if (request.command === "loadedSources") {
            this.loadedSourcesRequest(response, request.arguments, request);
          } else if (request.command === "dataBreakpointInfo") {
            this.dataBreakpointInfoRequest(response, request.arguments, request);
          } else if (request.command === "setDataBreakpoints") {
            this.setDataBreakpointsRequest(response, request.arguments, request);
          } else if (request.command === "readMemory") {
            this.readMemoryRequest(response, request.arguments, request);
          } else if (request.command === "writeMemory") {
            this.writeMemoryRequest(response, request.arguments, request);
          } else if (request.command === "disassemble") {
            this.disassembleRequest(response, request.arguments, request);
          } else if (request.command === "cancel") {
            this.cancelRequest(response, request.arguments, request);
          } else if (request.command === "breakpointLocations") {
            this.breakpointLocationsRequest(response, request.arguments, request);
          } else if (request.command === "setInstructionBreakpoints") {
            this.setInstructionBreakpointsRequest(response, request.arguments, request);
          } else {
            this.customRequest(request.command, response, request.arguments, request);
          }
        } catch (e) {
          this.sendErrorResponse(response, 1104, "{_stack}", { _exception: e.message, _stack: e.stack }, ErrorDestination.Telemetry);
        }
      }
      initializeRequest(response, args) {
        response.body.supportsConditionalBreakpoints = false;
        response.body.supportsHitConditionalBreakpoints = false;
        response.body.supportsFunctionBreakpoints = false;
        response.body.supportsConfigurationDoneRequest = true;
        response.body.supportsEvaluateForHovers = false;
        response.body.supportsStepBack = false;
        response.body.supportsSetVariable = false;
        response.body.supportsRestartFrame = false;
        response.body.supportsStepInTargetsRequest = false;
        response.body.supportsGotoTargetsRequest = false;
        response.body.supportsCompletionsRequest = false;
        response.body.supportsRestartRequest = false;
        response.body.supportsExceptionOptions = false;
        response.body.supportsValueFormattingOptions = false;
        response.body.supportsExceptionInfoRequest = false;
        response.body.supportTerminateDebuggee = false;
        response.body.supportsDelayedStackTraceLoading = false;
        response.body.supportsLoadedSourcesRequest = false;
        response.body.supportsLogPoints = false;
        response.body.supportsTerminateThreadsRequest = false;
        response.body.supportsSetExpression = false;
        response.body.supportsTerminateRequest = false;
        response.body.supportsDataBreakpoints = false;
        response.body.supportsReadMemoryRequest = false;
        response.body.supportsDisassembleRequest = false;
        response.body.supportsCancelRequest = false;
        response.body.supportsBreakpointLocationsRequest = false;
        response.body.supportsClipboardContext = false;
        response.body.supportsSteppingGranularity = false;
        response.body.supportsInstructionBreakpoints = false;
        response.body.supportsExceptionFilterOptions = false;
        this.sendResponse(response);
      }
      disconnectRequest(response, args, request) {
        this.sendResponse(response);
        this.shutdown();
      }
      launchRequest(response, args, request) {
        this.sendResponse(response);
      }
      attachRequest(response, args, request) {
        this.sendResponse(response);
      }
      terminateRequest(response, args, request) {
        this.sendResponse(response);
      }
      restartRequest(response, args, request) {
        this.sendResponse(response);
      }
      setBreakPointsRequest(response, args, request) {
        this.sendResponse(response);
      }
      setFunctionBreakPointsRequest(response, args, request) {
        this.sendResponse(response);
      }
      setExceptionBreakPointsRequest(response, args, request) {
        this.sendResponse(response);
      }
      configurationDoneRequest(response, args, request) {
        this.sendResponse(response);
      }
      continueRequest(response, args, request) {
        this.sendResponse(response);
      }
      nextRequest(response, args, request) {
        this.sendResponse(response);
      }
      stepInRequest(response, args, request) {
        this.sendResponse(response);
      }
      stepOutRequest(response, args, request) {
        this.sendResponse(response);
      }
      stepBackRequest(response, args, request) {
        this.sendResponse(response);
      }
      reverseContinueRequest(response, args, request) {
        this.sendResponse(response);
      }
      restartFrameRequest(response, args, request) {
        this.sendResponse(response);
      }
      gotoRequest(response, args, request) {
        this.sendResponse(response);
      }
      pauseRequest(response, args, request) {
        this.sendResponse(response);
      }
      sourceRequest(response, args, request) {
        this.sendResponse(response);
      }
      threadsRequest(response, request) {
        this.sendResponse(response);
      }
      terminateThreadsRequest(response, args, request) {
        this.sendResponse(response);
      }
      stackTraceRequest(response, args, request) {
        this.sendResponse(response);
      }
      scopesRequest(response, args, request) {
        this.sendResponse(response);
      }
      variablesRequest(response, args, request) {
        this.sendResponse(response);
      }
      setVariableRequest(response, args, request) {
        this.sendResponse(response);
      }
      setExpressionRequest(response, args, request) {
        this.sendResponse(response);
      }
      evaluateRequest(response, args, request) {
        this.sendResponse(response);
      }
      stepInTargetsRequest(response, args, request) {
        this.sendResponse(response);
      }
      gotoTargetsRequest(response, args, request) {
        this.sendResponse(response);
      }
      completionsRequest(response, args, request) {
        this.sendResponse(response);
      }
      exceptionInfoRequest(response, args, request) {
        this.sendResponse(response);
      }
      loadedSourcesRequest(response, args, request) {
        this.sendResponse(response);
      }
      dataBreakpointInfoRequest(response, args, request) {
        this.sendResponse(response);
      }
      setDataBreakpointsRequest(response, args, request) {
        this.sendResponse(response);
      }
      readMemoryRequest(response, args, request) {
        this.sendResponse(response);
      }
      writeMemoryRequest(response, args, request) {
        this.sendResponse(response);
      }
      disassembleRequest(response, args, request) {
        this.sendResponse(response);
      }
      cancelRequest(response, args, request) {
        this.sendResponse(response);
      }
      breakpointLocationsRequest(response, args, request) {
        this.sendResponse(response);
      }
      setInstructionBreakpointsRequest(response, args, request) {
        this.sendResponse(response);
      }
      /**
       * Override this hook to implement custom requests.
       */
      customRequest(command, response, args, request) {
        this.sendErrorResponse(response, 1014, "unrecognized request", null, ErrorDestination.Telemetry);
      }
      //---- protected -------------------------------------------------------------------------------------------------
      convertClientLineToDebugger(line) {
        if (this._debuggerLinesStartAt1) {
          return this._clientLinesStartAt1 ? line : line + 1;
        }
        return this._clientLinesStartAt1 ? line - 1 : line;
      }
      convertDebuggerLineToClient(line) {
        if (this._debuggerLinesStartAt1) {
          return this._clientLinesStartAt1 ? line : line - 1;
        }
        return this._clientLinesStartAt1 ? line + 1 : line;
      }
      convertClientColumnToDebugger(column) {
        if (this._debuggerColumnsStartAt1) {
          return this._clientColumnsStartAt1 ? column : column + 1;
        }
        return this._clientColumnsStartAt1 ? column - 1 : column;
      }
      convertDebuggerColumnToClient(column) {
        if (this._debuggerColumnsStartAt1) {
          return this._clientColumnsStartAt1 ? column : column - 1;
        }
        return this._clientColumnsStartAt1 ? column + 1 : column;
      }
      convertClientPathToDebugger(clientPath) {
        if (this._clientPathsAreURIs !== this._debuggerPathsAreURIs) {
          if (this._clientPathsAreURIs) {
            return _DebugSession.uri2path(clientPath);
          } else {
            return _DebugSession.path2uri(clientPath);
          }
        }
        return clientPath;
      }
      convertDebuggerPathToClient(debuggerPath) {
        if (this._debuggerPathsAreURIs !== this._clientPathsAreURIs) {
          if (this._debuggerPathsAreURIs) {
            return _DebugSession.uri2path(debuggerPath);
          } else {
            return _DebugSession.path2uri(debuggerPath);
          }
        }
        return debuggerPath;
      }
      //---- private -------------------------------------------------------------------------------
      static path2uri(path2) {
        if (process.platform === "win32") {
          if (/^[A-Z]:/.test(path2)) {
            path2 = path2[0].toLowerCase() + path2.substr(1);
          }
          path2 = path2.replace(/\\/g, "/");
        }
        path2 = encodeURI(path2);
        let uri = new url_1.URL(`file:`);
        uri.pathname = path2;
        return uri.toString();
      }
      static uri2path(sourceUri) {
        let uri = new url_1.URL(sourceUri);
        let s = decodeURIComponent(uri.pathname);
        if (process.platform === "win32") {
          if (/^\/[a-zA-Z]:/.test(s)) {
            s = s[1].toLowerCase() + s.substr(2);
          }
          s = s.replace(/\//g, "\\");
        }
        return s;
      }
      /*
      * If argument starts with '_' it is OK to send its value to telemetry.
      */
      static formatPII(format, excludePII, args) {
        return format.replace(_DebugSession._formatPIIRegexp, function(match, paramName) {
          if (excludePII && paramName.length > 0 && paramName[0] !== "_") {
            return match;
          }
          return args[paramName] && args.hasOwnProperty(paramName) ? args[paramName] : match;
        });
      }
    };
    exports2.DebugSession = DebugSession;
    DebugSession._formatPIIRegexp = /{([^}]+)}/g;
  }
});

// ../../../../../node_modules/@vscode/debugadapter/lib/internalLogger.js
var require_internalLogger = __commonJS({
  "../../../../../node_modules/@vscode/debugadapter/lib/internalLogger.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InternalLogger = void 0;
    var fs = require("fs");
    var path2 = require("path");
    var logger_1 = require_logger();
    var InternalLogger = class {
      constructor(logCallback, isServer) {
        this.beforeExitCallback = () => this.dispose();
        this._logCallback = logCallback;
        this._logToConsole = isServer;
        this._minLogLevel = logger_1.LogLevel.Warn;
        this.disposeCallback = (signal, code) => {
          this.dispose();
          code = code || 2;
          code += 128;
          process.exit(code);
        };
      }
      async setup(options) {
        this._minLogLevel = options.consoleMinLogLevel;
        this._prependTimestamp = options.prependTimestamp;
        if (options.logFilePath) {
          if (!path2.isAbsolute(options.logFilePath)) {
            this.log(`logFilePath must be an absolute path: ${options.logFilePath}`, logger_1.LogLevel.Error);
          } else {
            const handleError = (err) => this.sendLog(`Error creating log file at path: ${options.logFilePath}. Error: ${err.toString()}
`, logger_1.LogLevel.Error);
            try {
              await fs.promises.mkdir(path2.dirname(options.logFilePath), { recursive: true });
              this.log(`Verbose logs are written to:
`, logger_1.LogLevel.Warn);
              this.log(options.logFilePath + "\n", logger_1.LogLevel.Warn);
              this._logFileStream = fs.createWriteStream(options.logFilePath);
              this.logDateTime();
              this.setupShutdownListeners();
              this._logFileStream.on("error", (err) => {
                handleError(err);
              });
            } catch (err) {
              handleError(err);
            }
          }
        }
      }
      logDateTime() {
        let d = /* @__PURE__ */ new Date();
        let dateString = d.getUTCFullYear() + `-${d.getUTCMonth() + 1}-` + d.getUTCDate();
        const timeAndDateStamp = dateString + ", " + getFormattedTimeString();
        this.log(timeAndDateStamp + "\n", logger_1.LogLevel.Verbose, false);
      }
      setupShutdownListeners() {
        process.on("beforeExit", this.beforeExitCallback);
        process.on("SIGTERM", this.disposeCallback);
        process.on("SIGINT", this.disposeCallback);
      }
      removeShutdownListeners() {
        process.removeListener("beforeExit", this.beforeExitCallback);
        process.removeListener("SIGTERM", this.disposeCallback);
        process.removeListener("SIGINT", this.disposeCallback);
      }
      dispose() {
        return new Promise((resolve) => {
          this.removeShutdownListeners();
          if (this._logFileStream) {
            this._logFileStream.end(resolve);
            this._logFileStream = null;
          } else {
            resolve();
          }
        });
      }
      log(msg, level, prependTimestamp = true) {
        if (this._minLogLevel === logger_1.LogLevel.Stop) {
          return;
        }
        if (level >= this._minLogLevel) {
          this.sendLog(msg, level);
        }
        if (this._logToConsole) {
          const logFn = level === logger_1.LogLevel.Error ? console.error : level === logger_1.LogLevel.Warn ? console.warn : null;
          if (logFn) {
            logFn((0, logger_1.trimLastNewline)(msg));
          }
        }
        if (level === logger_1.LogLevel.Error) {
          msg = `[${logger_1.LogLevel[level]}] ${msg}`;
        }
        if (this._prependTimestamp && prependTimestamp) {
          msg = "[" + getFormattedTimeString() + "] " + msg;
        }
        if (this._logFileStream) {
          this._logFileStream.write(msg);
        }
      }
      sendLog(msg, level) {
        if (msg.length > 1500) {
          const endsInNewline = !!msg.match(/(\n|\r\n)$/);
          msg = msg.substr(0, 1500) + "[...]";
          if (endsInNewline) {
            msg = msg + "\n";
          }
        }
        if (this._logCallback) {
          const event = new logger_1.LogOutputEvent(msg, level);
          this._logCallback(event);
        }
      }
    };
    exports2.InternalLogger = InternalLogger;
    function getFormattedTimeString() {
      let d = /* @__PURE__ */ new Date();
      let hourString = _padZeroes(2, String(d.getUTCHours()));
      let minuteString = _padZeroes(2, String(d.getUTCMinutes()));
      let secondString = _padZeroes(2, String(d.getUTCSeconds()));
      let millisecondString = _padZeroes(3, String(d.getUTCMilliseconds()));
      return hourString + ":" + minuteString + ":" + secondString + "." + millisecondString + " UTC";
    }
    function _padZeroes(minDesiredLength, numberToPad) {
      if (numberToPad.length >= minDesiredLength) {
        return numberToPad;
      } else {
        return String("0".repeat(minDesiredLength) + numberToPad).slice(-minDesiredLength);
      }
    }
  }
});

// ../../../../../node_modules/@vscode/debugadapter/lib/logger.js
var require_logger = __commonJS({
  "../../../../../node_modules/@vscode/debugadapter/lib/logger.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.trimLastNewline = exports2.LogOutputEvent = exports2.logger = exports2.Logger = exports2.LogLevel = void 0;
    var internalLogger_1 = require_internalLogger();
    var debugSession_1 = require_debugSession();
    var LogLevel;
    (function(LogLevel2) {
      LogLevel2[LogLevel2["Verbose"] = 0] = "Verbose";
      LogLevel2[LogLevel2["Log"] = 1] = "Log";
      LogLevel2[LogLevel2["Warn"] = 2] = "Warn";
      LogLevel2[LogLevel2["Error"] = 3] = "Error";
      LogLevel2[LogLevel2["Stop"] = 4] = "Stop";
    })(LogLevel = exports2.LogLevel || (exports2.LogLevel = {}));
    var Logger = class {
      constructor() {
        this._pendingLogQ = [];
      }
      log(msg, level = LogLevel.Log) {
        msg = msg + "\n";
        this._write(msg, level);
      }
      verbose(msg) {
        this.log(msg, LogLevel.Verbose);
      }
      warn(msg) {
        this.log(msg, LogLevel.Warn);
      }
      error(msg) {
        this.log(msg, LogLevel.Error);
      }
      dispose() {
        if (this._currentLogger) {
          const disposeP = this._currentLogger.dispose();
          this._currentLogger = null;
          return disposeP;
        } else {
          return Promise.resolve();
        }
      }
      /**
       * `log` adds a newline, `write` doesn't
       */
      _write(msg, level = LogLevel.Log) {
        msg = msg + "";
        if (this._pendingLogQ) {
          this._pendingLogQ.push({ msg, level });
        } else if (this._currentLogger) {
          this._currentLogger.log(msg, level);
        }
      }
      /**
       * Set the logger's minimum level to log in the console, and whether to log to the file. Log messages are queued before this is
       * called the first time, because minLogLevel defaults to Warn.
       */
      setup(consoleMinLogLevel, _logFilePath, prependTimestamp = true) {
        const logFilePath = typeof _logFilePath === "string" ? _logFilePath : _logFilePath && this._logFilePathFromInit;
        if (this._currentLogger) {
          const options = {
            consoleMinLogLevel,
            logFilePath,
            prependTimestamp
          };
          this._currentLogger.setup(options).then(() => {
            if (this._pendingLogQ) {
              const logQ = this._pendingLogQ;
              this._pendingLogQ = null;
              logQ.forEach((item) => this._write(item.msg, item.level));
            }
          });
        }
      }
      init(logCallback, logFilePath, logToConsole) {
        this._pendingLogQ = this._pendingLogQ || [];
        this._currentLogger = new internalLogger_1.InternalLogger(logCallback, logToConsole);
        this._logFilePathFromInit = logFilePath;
      }
    };
    exports2.Logger = Logger;
    exports2.logger = new Logger();
    var LogOutputEvent = class extends debugSession_1.OutputEvent {
      constructor(msg, level) {
        const category = level === LogLevel.Error ? "stderr" : level === LogLevel.Warn ? "console" : "stdout";
        super(msg, category);
      }
    };
    exports2.LogOutputEvent = LogOutputEvent;
    function trimLastNewline(str) {
      return str.replace(/(\n|\r\n)$/, "");
    }
    exports2.trimLastNewline = trimLastNewline;
  }
});

// ../../../../../node_modules/@vscode/debugadapter/lib/loggingDebugSession.js
var require_loggingDebugSession = __commonJS({
  "../../../../../node_modules/@vscode/debugadapter/lib/loggingDebugSession.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LoggingDebugSession = void 0;
    var Logger = require_logger();
    var logger = Logger.logger;
    var debugSession_1 = require_debugSession();
    var LoggingDebugSession2 = class extends debugSession_1.DebugSession {
      constructor(obsolete_logFilePath, obsolete_debuggerLinesAndColumnsStartAt1, obsolete_isServer) {
        super(obsolete_debuggerLinesAndColumnsStartAt1, obsolete_isServer);
        this.obsolete_logFilePath = obsolete_logFilePath;
        this.on("error", (event) => {
          logger.error(event.body);
        });
      }
      start(inStream, outStream) {
        super.start(inStream, outStream);
        logger.init((e) => this.sendEvent(e), this.obsolete_logFilePath, this._isServer);
      }
      /**
       * Overload sendEvent to log
       */
      sendEvent(event) {
        if (!(event instanceof Logger.LogOutputEvent)) {
          let objectToLog = event;
          if (event instanceof debugSession_1.OutputEvent && event.body && event.body.data && event.body.data.doNotLogOutput) {
            delete event.body.data.doNotLogOutput;
            objectToLog = { ...event };
            objectToLog.body = { ...event.body, output: "<output not logged>" };
          }
          logger.verbose(`To client: ${JSON.stringify(objectToLog)}`);
        }
        super.sendEvent(event);
      }
      /**
       * Overload sendRequest to log
       */
      sendRequest(command, args, timeout, cb) {
        logger.verbose(`To client: ${JSON.stringify(command)}(${JSON.stringify(args)}), timeout: ${timeout}`);
        super.sendRequest(command, args, timeout, cb);
      }
      /**
       * Overload sendResponse to log
       */
      sendResponse(response) {
        logger.verbose(`To client: ${JSON.stringify(response)}`);
        super.sendResponse(response);
      }
      dispatchRequest(request) {
        logger.verbose(`From client: ${request.command}(${JSON.stringify(request.arguments)})`);
        super.dispatchRequest(request);
      }
    };
    exports2.LoggingDebugSession = LoggingDebugSession2;
  }
});

// ../../../../../node_modules/@vscode/debugadapter/lib/handles.js
var require_handles = __commonJS({
  "../../../../../node_modules/@vscode/debugadapter/lib/handles.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Handles = void 0;
    var Handles = class {
      constructor(startHandle) {
        this.START_HANDLE = 1e3;
        this._handleMap = /* @__PURE__ */ new Map();
        this._nextHandle = typeof startHandle === "number" ? startHandle : this.START_HANDLE;
      }
      reset() {
        this._nextHandle = this.START_HANDLE;
        this._handleMap = /* @__PURE__ */ new Map();
      }
      create(value) {
        var handle = this._nextHandle++;
        this._handleMap.set(handle, value);
        return handle;
      }
      get(handle, dflt) {
        return this._handleMap.get(handle) || dflt;
      }
    };
    exports2.Handles = Handles;
  }
});

// ../../../../../node_modules/@vscode/debugadapter/lib/main.js
var require_main = __commonJS({
  "../../../../../node_modules/@vscode/debugadapter/lib/main.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Handles = exports2.Response = exports2.Event = exports2.ErrorDestination = exports2.CompletionItem = exports2.Module = exports2.Source = exports2.Breakpoint = exports2.Variable = exports2.Scope = exports2.StackFrame = exports2.Thread = exports2.MemoryEvent = exports2.InvalidatedEvent = exports2.ProgressEndEvent = exports2.ProgressUpdateEvent = exports2.ProgressStartEvent = exports2.CapabilitiesEvent = exports2.LoadedSourceEvent = exports2.ModuleEvent = exports2.BreakpointEvent = exports2.ThreadEvent = exports2.OutputEvent = exports2.ContinuedEvent = exports2.StoppedEvent = exports2.ExitedEvent = exports2.TerminatedEvent = exports2.InitializedEvent = exports2.logger = exports2.Logger = exports2.LoggingDebugSession = exports2.DebugSession = void 0;
    var debugSession_1 = require_debugSession();
    Object.defineProperty(exports2, "DebugSession", { enumerable: true, get: function() {
      return debugSession_1.DebugSession;
    } });
    Object.defineProperty(exports2, "InitializedEvent", { enumerable: true, get: function() {
      return debugSession_1.InitializedEvent;
    } });
    Object.defineProperty(exports2, "TerminatedEvent", { enumerable: true, get: function() {
      return debugSession_1.TerminatedEvent;
    } });
    Object.defineProperty(exports2, "ExitedEvent", { enumerable: true, get: function() {
      return debugSession_1.ExitedEvent;
    } });
    Object.defineProperty(exports2, "StoppedEvent", { enumerable: true, get: function() {
      return debugSession_1.StoppedEvent;
    } });
    Object.defineProperty(exports2, "ContinuedEvent", { enumerable: true, get: function() {
      return debugSession_1.ContinuedEvent;
    } });
    Object.defineProperty(exports2, "OutputEvent", { enumerable: true, get: function() {
      return debugSession_1.OutputEvent;
    } });
    Object.defineProperty(exports2, "ThreadEvent", { enumerable: true, get: function() {
      return debugSession_1.ThreadEvent;
    } });
    Object.defineProperty(exports2, "BreakpointEvent", { enumerable: true, get: function() {
      return debugSession_1.BreakpointEvent;
    } });
    Object.defineProperty(exports2, "ModuleEvent", { enumerable: true, get: function() {
      return debugSession_1.ModuleEvent;
    } });
    Object.defineProperty(exports2, "LoadedSourceEvent", { enumerable: true, get: function() {
      return debugSession_1.LoadedSourceEvent;
    } });
    Object.defineProperty(exports2, "CapabilitiesEvent", { enumerable: true, get: function() {
      return debugSession_1.CapabilitiesEvent;
    } });
    Object.defineProperty(exports2, "ProgressStartEvent", { enumerable: true, get: function() {
      return debugSession_1.ProgressStartEvent;
    } });
    Object.defineProperty(exports2, "ProgressUpdateEvent", { enumerable: true, get: function() {
      return debugSession_1.ProgressUpdateEvent;
    } });
    Object.defineProperty(exports2, "ProgressEndEvent", { enumerable: true, get: function() {
      return debugSession_1.ProgressEndEvent;
    } });
    Object.defineProperty(exports2, "InvalidatedEvent", { enumerable: true, get: function() {
      return debugSession_1.InvalidatedEvent;
    } });
    Object.defineProperty(exports2, "MemoryEvent", { enumerable: true, get: function() {
      return debugSession_1.MemoryEvent;
    } });
    Object.defineProperty(exports2, "Thread", { enumerable: true, get: function() {
      return debugSession_1.Thread;
    } });
    Object.defineProperty(exports2, "StackFrame", { enumerable: true, get: function() {
      return debugSession_1.StackFrame;
    } });
    Object.defineProperty(exports2, "Scope", { enumerable: true, get: function() {
      return debugSession_1.Scope;
    } });
    Object.defineProperty(exports2, "Variable", { enumerable: true, get: function() {
      return debugSession_1.Variable;
    } });
    Object.defineProperty(exports2, "Breakpoint", { enumerable: true, get: function() {
      return debugSession_1.Breakpoint;
    } });
    Object.defineProperty(exports2, "Source", { enumerable: true, get: function() {
      return debugSession_1.Source;
    } });
    Object.defineProperty(exports2, "Module", { enumerable: true, get: function() {
      return debugSession_1.Module;
    } });
    Object.defineProperty(exports2, "CompletionItem", { enumerable: true, get: function() {
      return debugSession_1.CompletionItem;
    } });
    Object.defineProperty(exports2, "ErrorDestination", { enumerable: true, get: function() {
      return debugSession_1.ErrorDestination;
    } });
    var loggingDebugSession_1 = require_loggingDebugSession();
    Object.defineProperty(exports2, "LoggingDebugSession", { enumerable: true, get: function() {
      return loggingDebugSession_1.LoggingDebugSession;
    } });
    var Logger = require_logger();
    exports2.Logger = Logger;
    var messages_1 = require_messages();
    Object.defineProperty(exports2, "Event", { enumerable: true, get: function() {
      return messages_1.Event;
    } });
    Object.defineProperty(exports2, "Response", { enumerable: true, get: function() {
      return messages_1.Response;
    } });
    var handles_1 = require_handles();
    Object.defineProperty(exports2, "Handles", { enumerable: true, get: function() {
      return handles_1.Handles;
    } });
    var logger = Logger.logger;
    exports2.logger = logger;
  }
});

// src/loupDebugSession.ts
var import_debugadapter = __toESM(require_main());

// src/loupRuntime.ts
var import_events = require("events");
var import_child_process = require("child_process");
var LoupRuntime = class extends import_events.EventEmitter {
  process = null;
  breakpoints = /* @__PURE__ */ new Map();
  breakpointIdCounter = 1;
  stackFrames = [];
  variables = /* @__PURE__ */ new Map();
  nextVarRef = 1e3;
  running = false;
  // ---- Lifecycle ----
  async launch(program, args, target, env, enableTimeTravel, traceLevel) {
    const loupArgs = ["run", program, "--target", target];
    if (enableTimeTravel) {
      loupArgs.push("--enable-time-travel");
    }
    if (traceLevel && traceLevel !== "off") {
      loupArgs.push("--trace-level", traceLevel);
    }
    if (args.length > 0) {
      loupArgs.push("--", ...args);
    }
    const loupPath = process.env["LOUP_PATH"] || "loup";
    this.process = (0, import_child_process.spawn)(loupPath, loupArgs, {
      cwd: this.workingDir(program),
      env: { ...process.env, ...env, LOUP_DEBUG: "1" },
      stdio: ["pipe", "pipe", "pipe"]
    });
    this.running = true;
    this.process.stdout?.on("data", (data) => {
      this.emit("output", "stdout", data.toString());
    });
    this.process.stderr?.on("data", (data) => {
      const text = data.toString();
      for (const line of text.split("\n")) {
        const trimmed = line.trim();
        if (trimmed.startsWith("{")) {
          try {
            const msg = JSON.parse(trimmed);
            this.handleDebugMessage(msg);
            continue;
          } catch {
          }
        }
        if (trimmed.length > 0) {
          this.emit("output", "stderr", trimmed + "\n");
        }
      }
    });
    this.process.on("exit", (code) => {
      this.running = false;
      this.emit("output", "console", `Process exited with code ${code}
`);
      this.emit("end");
    });
    this.process.on("error", (err) => {
      this.running = false;
      this.emit("error", `Failed to launch Loup: ${err.message}`);
      this.emit("end");
    });
  }
  async attach(host, port) {
    this.emit("output", "console", `Attaching to ${host}:${port}...
`);
    this.emit("error", "Attach mode is not yet implemented. Use launch mode.");
    this.emit("end");
  }
  disconnect() {
    if (this.process) {
      this.sendCommand({ command: "disconnect" });
      this.process.kill();
      this.process = null;
    }
    this.running = false;
  }
  // ---- Breakpoints ----
  setBreakpoints(source, lines) {
    const bps = lines.map((line) => ({
      id: this.breakpointIdCounter++,
      line,
      verified: true,
      source
    }));
    this.breakpoints.set(source, bps);
    this.sendCommand({
      command: "setBreakpoints",
      source,
      breakpoints: bps.map((bp) => ({ line: bp.line }))
    });
    return bps;
  }
  setExceptionBreakpoints(filters) {
    this.sendCommand({
      command: "setExceptionBreakpoints",
      filters
    });
  }
  // ---- Execution control ----
  continue(threadId) {
    this.sendCommand({ command: "continue", threadId });
  }
  next(threadId) {
    this.sendCommand({ command: "next", threadId });
  }
  stepIn(threadId) {
    this.sendCommand({ command: "stepIn", threadId });
  }
  stepOut(threadId) {
    this.sendCommand({ command: "stepOut", threadId });
  }
  pause(threadId) {
    this.sendCommand({ command: "pause", threadId });
  }
  // ---- Stack & variables ----
  getStackTrace(_threadId) {
    return this.stackFrames;
  }
  getScopes(frameId) {
    return [
      { name: "Locals", variablesReference: frameId * 10 + 1, expensive: false },
      { name: "Globals", variablesReference: frameId * 10 + 2, expensive: true }
    ];
  }
  getVariables(variablesReference) {
    return this.variables.get(variablesReference) || [];
  }
  // ---- Evaluation ----
  evaluate(expression, frameId) {
    this.sendCommand({ command: "evaluate", expression, frameId });
    return {
      result: `<evaluating: ${expression}>`,
      type: "string",
      variablesReference: 0
    };
  }
  // ---- Portal support (Phase 3 prep) ----
  getPortals() {
    return [];
  }
  activatePortal(name) {
    this.sendCommand({ command: "activatePortal", name });
  }
  deactivatePortal(name) {
    this.sendCommand({ command: "deactivatePortal", name });
  }
  activatePortalWithCondition(name, condition) {
    this.sendCommand({ command: "activatePortal", name, condition });
  }
  // ---- Internal ----
  handleDebugMessage(msg) {
    switch (msg["event"]) {
      case "stopped": {
        const reason = msg["reason"];
        const threadId = msg["threadId"] || 1;
        if (Array.isArray(msg["stackFrames"])) {
          this.stackFrames = msg["stackFrames"].map((f, i) => ({
            id: i,
            name: String(f["name"] || "<unknown>"),
            source: String(f["source"] || ""),
            line: Number(f["line"] || 0),
            column: Number(f["column"] || 0),
            execMode: f["execMode"] || "interpreted",
            traceLevel: f["traceLevel"] || "off",
            isPortal: Boolean(f["isPortal"]),
            portalName: f["portalName"],
            portalCondition: f["portalCondition"]
          }));
        }
        if (msg["locals"] && typeof msg["locals"] === "object") {
          const locals = [];
          for (const [name, info] of Object.entries(msg["locals"])) {
            locals.push({
              name,
              value: String(info["value"] || ""),
              type: String(info["type"] || "Any"),
              variablesReference: info["children"] ? this.nextVarRef++ : 0
            });
          }
          if (this.stackFrames.length > 0) {
            this.variables.set(this.stackFrames[0].id * 10 + 1, locals);
          }
        }
        this.emit("stopOnBreakpoint", threadId, reason);
        break;
      }
      case "output": {
        const category = msg["category"] || "stdout";
        const text = msg["text"] || "";
        this.emit("output", category, text, msg["source"], msg["line"]);
        break;
      }
      case "breakpointValidated": {
        const bp = {
          id: msg["id"],
          line: msg["line"],
          verified: msg["verified"],
          source: msg["source"]
        };
        this.emit("breakpointValidated", bp);
        break;
      }
      case "exited": {
        this.running = false;
        this.emit("end");
        break;
      }
    }
  }
  sendCommand(cmd) {
    if (this.process?.stdin?.writable) {
      this.process.stdin.write(JSON.stringify(cmd) + "\n");
    }
  }
  workingDir(program) {
    const path2 = require("path");
    return path2.dirname(path2.resolve(program));
  }
};

// src/loupDebugSession.ts
var path = __toESM(require("path"));
var THREAD_ID = 1;
var LoupDebugSession = class extends import_debugadapter.LoggingDebugSession {
  runtime;
  constructor() {
    super("loup-debug.log");
    this.setDebuggerLinesStartAt1(true);
    this.setDebuggerColumnsStartAt1(true);
    this.runtime = new LoupRuntime();
    this.runtime.on("stopOnBreakpoint", (threadId, reason) => {
      this.sendEvent(new import_debugadapter.StoppedEvent(reason, threadId));
    });
    this.runtime.on("stopOnStep", (threadId) => {
      this.sendEvent(new import_debugadapter.StoppedEvent("step", threadId));
    });
    this.runtime.on("stopOnException", (threadId, message) => {
      const event = new import_debugadapter.StoppedEvent("exception", threadId, message);
      this.sendEvent(event);
    });
    this.runtime.on("breakpointValidated", (bp) => {
      const breakpoint = new import_debugadapter.Breakpoint(bp.verified, bp.line);
      breakpoint.id = bp.id;
      this.sendEvent(new import_debugadapter.BreakpointEvent("changed", breakpoint));
    });
    this.runtime.on("output", (category, text, source, line) => {
      const event = new import_debugadapter.OutputEvent(text, category);
      if (source) {
        event.body.source = new import_debugadapter.Source(
          path.basename(source),
          source
        );
      }
      if (line !== void 0) {
        event.body.line = line;
      }
      this.sendEvent(event);
    });
    this.runtime.on("end", () => {
      this.sendEvent(new import_debugadapter.TerminatedEvent());
    });
  }
  // ---- Initialize ----
  initializeRequest(response, _args) {
    response.body = response.body || {};
    response.body.supportsConfigurationDoneRequest = true;
    response.body.supportsFunctionBreakpoints = false;
    response.body.supportsConditionalBreakpoints = false;
    response.body.supportsHitConditionalBreakpoints = false;
    response.body.supportsEvaluateForHovers = true;
    response.body.exceptionBreakpointFilters = [
      {
        filter: "all",
        label: "All Exceptions",
        description: "Break on all thrown exceptions",
        default: false
      },
      {
        filter: "uncaught",
        label: "Uncaught Exceptions",
        description: "Break on exceptions not caught by try/catch",
        default: true
      }
    ];
    response.body.supportsStepBack = false;
    response.body.supportsSetVariable = false;
    response.body.supportsRestartFrame = false;
    response.body.supportsGotoTargetsRequest = false;
    response.body.supportsStepInTargetsRequest = false;
    response.body.supportsCompletionsRequest = false;
    response.body.supportsModulesRequest = false;
    response.body.supportsRestartRequest = true;
    response.body.supportsExceptionOptions = false;
    response.body.supportsValueFormattingOptions = false;
    response.body.supportsExceptionInfoRequest = true;
    response.body.supportTerminateDebuggee = true;
    response.body.supportsDelayedStackTraceLoading = false;
    response.body.supportsLoadedSourcesRequest = false;
    response.body.supportsTerminateThreadsRequest = false;
    response.body.supportsSetExpression = false;
    response.body.supportsTerminateRequest = true;
    response.body.supportsDataBreakpoints = false;
    response.body.supportsReadMemoryRequest = false;
    response.body.supportsDisassembleRequest = false;
    response.body.supportsCancelRequest = false;
    response.body.supportsBreakpointLocationsRequest = false;
    response.body.supportsClipboardContext = false;
    response.body.supportsSteppingGranularity = false;
    response.body.supportsInstructionBreakpoints = false;
    response.body.supportsExceptionFilterOptions = false;
    this.sendResponse(response);
    this.sendEvent(new import_debugadapter.InitializedEvent());
  }
  configurationDoneRequest(response, _args) {
    super.configurationDoneRequest(response, _args);
  }
  // ---- Launch / Attach ----
  async launchRequest(response, args) {
    try {
      await this.runtime.launch(
        args.program,
        args.args || [],
        args.target || "cli",
        args.env || {},
        args.enableTimeTravel || false,
        args.traceLevel || "off"
      );
      if (args.portalBreakpoints && args.portalBreakpoints.length > 0) {
        for (const portal of args.portalBreakpoints) {
          this.runtime.activatePortal(portal);
        }
      }
      this.sendResponse(response);
    } catch (err) {
      this.sendErrorResponse(response, 1, `Failed to launch: ${err}`);
    }
  }
  async attachRequest(response, args) {
    try {
      await this.runtime.attach(args.host || "localhost", args.port || 9229);
      this.sendResponse(response);
    } catch (err) {
      this.sendErrorResponse(response, 2, `Failed to attach: ${err}`);
    }
  }
  terminateRequest(response, _args) {
    this.runtime.disconnect();
    this.sendResponse(response);
  }
  disconnectRequest(response, _args) {
    this.runtime.disconnect();
    this.sendResponse(response);
  }
  restartRequest(response, _args) {
    this.runtime.disconnect();
    this.sendResponse(response);
  }
  // ---- Breakpoints ----
  setBreakPointsRequest(response, args) {
    const source = args.source.path || "";
    const requestedLines = args.breakpoints?.map((bp) => bp.line) || [];
    const bps = this.runtime.setBreakpoints(source, requestedLines);
    response.body = {
      breakpoints: bps.map((bp) => ({
        id: bp.id,
        verified: bp.verified,
        line: bp.line,
        source: new import_debugadapter.Source(path.basename(source), source)
      }))
    };
    this.sendResponse(response);
  }
  setExceptionBreakPointsRequest(response, args) {
    this.runtime.setExceptionBreakpoints(args.filters);
    this.sendResponse(response);
  }
  // ---- Threads ----
  threadsRequest(response) {
    response.body = {
      threads: [new import_debugadapter.Thread(THREAD_ID, "Main Thread")]
    };
    this.sendResponse(response);
  }
  // ---- Stack trace ----
  stackTraceRequest(response, args) {
    const frames = this.runtime.getStackTrace(args.threadId);
    response.body = {
      stackFrames: frames.map((f) => {
        const sf = new import_debugadapter.StackFrame(
          f.id,
          f.name,
          new import_debugadapter.Source(path.basename(f.source), f.source),
          f.line,
          f.column
        );
        if (f.isPortal) {
          sf.presentationHint = "subtle";
        }
        if (f.execMode === "native") {
          sf.presentationHint = "label";
        }
        return sf;
      }),
      totalFrames: frames.length
    };
    this.sendResponse(response);
  }
  // ---- Scopes & Variables ----
  scopesRequest(response, args) {
    const scopes = this.runtime.getScopes(args.frameId);
    response.body = {
      scopes: scopes.map((s) => new import_debugadapter.Scope(s.name, s.variablesReference, s.expensive))
    };
    this.sendResponse(response);
  }
  variablesRequest(response, args) {
    const variables = this.runtime.getVariables(args.variablesReference);
    response.body = {
      variables: variables.map((v) => ({
        name: v.name,
        value: v.value,
        type: v.type,
        variablesReference: v.variablesReference,
        namedVariables: v.namedVariables,
        indexedVariables: v.indexedVariables
      }))
    };
    this.sendResponse(response);
  }
  // ---- Execution control ----
  continueRequest(response, args) {
    this.runtime.continue(args.threadId);
    response.body = { allThreadsContinued: true };
    this.sendResponse(response);
  }
  nextRequest(response, args) {
    this.runtime.next(args.threadId);
    this.sendResponse(response);
  }
  stepInRequest(response, args) {
    this.runtime.stepIn(args.threadId);
    this.sendResponse(response);
  }
  stepOutRequest(response, args) {
    this.runtime.stepOut(args.threadId);
    this.sendResponse(response);
  }
  pauseRequest(response, args) {
    this.runtime.pause(args.threadId);
    this.sendResponse(response);
  }
  // ---- Evaluation ----
  evaluateRequest(response, args) {
    const result = this.runtime.evaluate(args.expression, args.frameId);
    response.body = {
      result: result.result,
      type: result.type,
      variablesReference: result.variablesReference
    };
    this.sendResponse(response);
  }
  // ---- Exception info ----
  exceptionInfoRequest(response, _args) {
    response.body = {
      exceptionId: "LoupException",
      description: "An exception was thrown",
      breakMode: "always"
    };
    this.sendResponse(response);
  }
};

// src/debugAdapter.ts
LoupDebugSession.run(LoupDebugSession);
