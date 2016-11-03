(function () {
'use strict';

function Vnode$1(tag, key, attrs, children, text, dom) {
	return {tag: tag, key: key, attrs: attrs, children: children, text: text, dom: dom, domSize: undefined, state: {}, events: undefined, instance: undefined, skip: false}
}
Vnode$1.normalize = function(node) {
	if (node instanceof Array) { return Vnode$1("[", undefined, undefined, Vnode$1.normalizeChildren(node), undefined, undefined) }
	else if (node != null && typeof node !== "object") { return Vnode$1("#", undefined, undefined, node, undefined, undefined) }
	return node
};
Vnode$1.normalizeChildren = function normalizeChildren(children) {
	for (var i = 0; i < children.length; i++) {
		children[i] = Vnode$1.normalize(children[i]);
	}
	return children
};

var vnode = Vnode$1;

var Vnode = vnode;

var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g;
var selectorCache = {};
function hyperscript$1(selector) {
	var arguments$1 = arguments;

	if (selector == null || typeof selector !== "string" && selector.view == null) {
		throw Error("The selector must be either a string or a component.");
	}

	if (typeof selector === "string" && selectorCache[selector] === undefined) {
		var match, tag, classes = [], attributes = {};
		while (match = selectorParser.exec(selector)) {
			var type = match[1], value = match[2];
			if (type === "" && value !== "") { tag = value; }
			else if (type === "#") { attributes.id = value; }
			else if (type === ".") { classes.push(value); }
			else if (match[3][0] === "[") {
				var attrValue = match[6];
				if (attrValue) { attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\"); }
				attributes[match[4]] = attrValue || true;
			}
		}
		if (classes.length > 0) { attributes.className = classes.join(" "); }
		selectorCache[selector] = function(attrs, children) {
			var hasAttrs = false, childList, text;
			var className = attrs.className || attrs.class;
			for (var key in attributes) { attrs[key] = attributes[key]; }
			if (className !== undefined) {
				if (attrs.class !== undefined) {
					attrs.class = undefined;
					attrs.className = className;
				}
				if (attributes.className !== undefined) { attrs.className = attributes.className + " " + className; }
			}
			for (var key in attrs) {
				if (key !== "key") {
					hasAttrs = true;
					break
				}
			}
			if (children instanceof Array && children.length == 1 && children[0] != null && children[0].tag === "#") { text = children[0].children; }
			else { childList = children; }

			return Vnode(tag || "div", attrs.key, hasAttrs ? attrs : undefined, childList, text, undefined)
		};
	}
	var attrs, children, childrenIndex;
	if (arguments[1] == null || typeof arguments[1] === "object" && arguments[1].tag === undefined && !(arguments[1] instanceof Array)) {
		attrs = arguments[1];
		childrenIndex = 2;
	}
	else { childrenIndex = 1; }
	if (arguments.length === childrenIndex + 1) {
		children = arguments[childrenIndex] instanceof Array ? arguments[childrenIndex] : [arguments[childrenIndex]];
	}
	else {
		children = [];
		for (var i = childrenIndex; i < arguments.length; i++) { children.push(arguments$1[i]); }
	}

	if (typeof selector === "string") { return selectorCache[selector](attrs || {}, Vnode.normalizeChildren(children)) }

	return Vnode(selector, attrs && attrs.key, attrs || {}, Vnode.normalizeChildren(children), undefined, undefined)
}

var hyperscript_1$2 = hyperscript$1;

var Vnode$2 = vnode;

var trust = function(html) {
	return Vnode$2("<", undefined, undefined, html, undefined, undefined)
};

var Vnode$3 = vnode;

var fragment = function(attrs, children) {
	return Vnode$3("[", attrs.key, attrs, Vnode$3.normalizeChildren(children), undefined, undefined)
};

var hyperscript = hyperscript_1$2;

hyperscript.trust = trust;
hyperscript.fragment = fragment;

var hyperscript_1 = hyperscript;

var stream$2 = function(log) {
	var guid = 0, noop = function() {}, HALT = {};
	function createStream() {
		function stream() {
			if (arguments.length > 0 && arguments[0] !== HALT) { updateStream(stream, arguments[0], undefined); }
			return stream._state.value
		}
		initStream(stream);

		if (arguments.length > 0 && arguments[0] !== HALT) { updateStream(stream, arguments[0], undefined); }

		return stream
	}
	function initStream(stream) {
		stream.constructor = createStream;
		stream._state = {id: guid++, value: undefined, error: undefined, state: 0, derive: undefined, recover: undefined, deps: {}, parents: [], errorStream: undefined, endStream: undefined};
		stream.map = map, stream.ap = ap, stream.of = createStream;
		stream.valueOf = valueOf, stream.toJSON = toJSON, stream.toString = valueOf;
		stream.run = run, stream.catch = doCatch;

		Object.defineProperties(stream, {
			error: {get: function() {
				if (!stream._state.errorStream) {
					var errorStream = function() {
						if (arguments.length > 0 && arguments[0] !== HALT) { updateStream(stream, undefined, arguments[0]); }
						return stream._state.error
					};
					initStream(errorStream);
					initDependency(errorStream, [stream], noop, noop);
					stream._state.errorStream = errorStream;
				}
				return stream._state.errorStream
			}},
			end: {get: function() {
				if (!stream._state.endStream) {
					var endStream = createStream();
					endStream.map(function(value) {
						if (value === true) { unregisterStream(stream), unregisterStream(endStream); }
						return value
					});
					stream._state.endStream = endStream;
				}
				return stream._state.endStream
			}}
		});
	}
	function updateStream(stream, value, error) {
		updateState(stream, value, error);
		for (var id in stream._state.deps) { updateDependency(stream._state.deps[id], false); }
		finalize(stream);
	}
	function updateState(stream, value, error) {
		error = unwrapError(value, error);
		if (error !== undefined && typeof stream._state.recover === "function") {
			if (!resolve(stream, updateValues, true)) { return }
		}
		else { updateValues(stream, value, error); }
		stream._state.changed = true;
		if (stream._state.state !== 2) { stream._state.state = 1; }
	}
	function updateValues(stream, value, error) {
		stream._state.value = value;
		stream._state.error = error;
	}
	function updateDependency(stream, mustSync) {
		var state = stream._state, parents = state.parents;
		if (parents.length > 0 && parents.filter(active).length === parents.length && (mustSync || parents.filter(changed).length > 0)) {
			var failed = parents.filter(errored);
			if (failed.length > 0) { updateState(stream, undefined, failed[0]._state.error); }
			else { resolve(stream, updateState, false); }
		}
	}
	function resolve(stream, update, shouldRecover) {
		try {
			var value = shouldRecover ? stream._state.recover() : stream._state.derive();
			if (value === HALT) { return false }
			update(stream, value, undefined);
		}
		catch (e) {
			update(stream, undefined, e.__error != null ? e.__error : e);
			if (e.__error == null) { reportUncaughtError(stream, e); }
		}
		return true
	}
	function unwrapError(value, error) {
		if (value != null && value.constructor === createStream) {
			if (value._state.error !== undefined) { error = value._state.error; }
			else { error = unwrapError(value._state.value, value._state.error); }
		}
		return error
	}
	function finalize(stream) {
		stream._state.changed = false;
		for (var id in stream._state.deps) { stream._state.deps[id]._state.changed = false; }
	}
	function reportUncaughtError(stream, e) {
		if (Object.keys(stream._state.deps).length === 0) {
			setTimeout(function() {
				if (Object.keys(stream._state.deps).length === 0) { log(e); }
			}, 0);
		}
	}

	function run(fn) {
		var self = createStream(), stream = this;
		return initDependency(self, [stream], function() {
			return absorb(self, fn(stream()))
		}, undefined)
	}
	function doCatch(fn) {
		var self = createStream(), stream = this;
		var derive = function() {return stream._state.value};
		var recover = function() {return absorb(self, fn(stream._state.error))};
		return initDependency(self, [stream], derive, recover)
	}
	function combine(fn, streams) {
		if (streams.length > streams.filter(valid).length) { throw new Error("Ensure that each item passed to m.prop.combine/m.prop.merge is a stream") }
		return initDependency(createStream(), streams, function() {
			var failed = streams.filter(errored);
			if (failed.length > 0) { throw {__error: failed[0]._state.error} }
			return fn.apply(this, streams.concat([streams.filter(changed)]))
		}, undefined)
	}
	function absorb(stream, value) {
		if (value != null && value.constructor === createStream) {
			var absorbable = value;
			var update = function() {
				updateState(stream, absorbable._state.value, absorbable._state.error);
				for (var id in stream._state.deps) { updateDependency(stream._state.deps[id], false); }
			};
			absorbable.map(update).catch(function(e) {
				update();
				throw {__error: e}
			});
			
			if (absorbable._state.state === 0) { return HALT }
			if (absorbable._state.error) { throw {__error: absorbable._state.error} }
			value = absorbable._state.value;
		}
		return value
	}

	function initDependency(dep, streams, derive, recover) {
		var state = dep._state;
		state.derive = derive;
		state.recover = recover;
		state.parents = streams.filter(notEnded);

		registerDependency(dep, state.parents);
		updateDependency(dep, true);

		return dep
	}
	function registerDependency(stream, parents) {
		for (var i = 0; i < parents.length; i++) {
			parents[i]._state.deps[stream._state.id] = stream;
			registerDependency(stream, parents[i]._state.parents);
		}
	}
	function unregisterStream(stream) {
		for (var i = 0; i < stream._state.parents.length; i++) {
			var parent = stream._state.parents[i];
			delete parent._state.deps[stream._state.id];
		}
		for (var id in stream._state.deps) {
			var dependent = stream._state.deps[id];
			var index = dependent._state.parents.indexOf(stream);
			if (index > -1) { dependent._state.parents.splice(index, 1); }
		}
		stream._state.state = 2; //ended
		stream._state.deps = {};
	}

	function map(fn) {return combine(function(stream) {return fn(stream())}, [this])}
	function ap(stream) {return combine(function(s1, s2) {return s1()(s2())}, [this, stream])}
	function valueOf() {return this._state.value}
	function toJSON() {return this._state.value != null && typeof this._state.value.toJSON === "function" ? this._state.value.toJSON() : this._state.value}

	function valid(stream) {return stream._state }
	function active(stream) {return stream._state.state === 1}
	function changed(stream) {return stream._state.changed}
	function notEnded(stream) {return stream._state.state !== 2}
	function errored(stream) {return stream._state.error}

	function reject(e) {
		var stream = createStream();
		stream.error(e);
		return stream
	}

	function merge(streams) {
		return combine(function () {
			return streams.map(function(s) {return s()})
		}, streams)
	}
	createStream.merge = merge;
	createStream.combine = combine;
	createStream.reject = reject;
	createStream.HALT = HALT;

	return createStream
};

var stream = stream$2(console.log.bind(console));

var build = function(object) {
	if (Object.prototype.toString.call(object) !== "[object Object]") { return "" }

	var args = [];
	for (var key in object) {
		destructure(key, object[key]);
	}
	return args.join("&")

	function destructure(key, value) {
		if (value instanceof Array) {
			for (var i = 0; i < value.length; i++) {
				destructure(key + "[" + i + "]", value[i]);
			}
		}
		else if (Object.prototype.toString.call(value) === "[object Object]") {
			for (var i in value) {
				destructure(key + "[" + i + "]", value[i]);
			}
		}
		else { args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : "")); }
	}
};

var buildQueryString = build;

var request$2 = function($window, Stream) {
	var callbackCount = 0;

	var oncompletion;
	function setCompletionCallback(callback) {oncompletion = callback;}
	
	function request(args) {
		var stream = Stream();
		if (args.initialValue !== undefined) { stream(args.initialValue); }
		
		var useBody = typeof args.useBody === "boolean" ? args.useBody : args.method !== "GET" && args.method !== "TRACE";
		
		if (typeof args.serialize !== "function") { args.serialize = typeof FormData !== "undefined" && args.data instanceof FormData ? function(value) {return value} : JSON.stringify; }
		if (typeof args.deserialize !== "function") { args.deserialize = deserialize; }
		if (typeof args.extract !== "function") { args.extract = extract; }
		
		args.url = interpolate(args.url, args.data);
		if (useBody) { args.data = args.serialize(args.data); }
		else { args.url = assemble(args.url, args.data); }
		
		var xhr = new $window.XMLHttpRequest();
		xhr.open(args.method, args.url, typeof args.async === "boolean" ? args.async : true, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined);
		
		if (args.serialize === JSON.stringify && useBody) {
			xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
		}
		if (args.deserialize === deserialize) {
			xhr.setRequestHeader("Accept", "application/json, text/*");
		}
		
		if (typeof args.config === "function") { xhr = args.config(xhr, args) || xhr; }
		
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				try {
					var response = (args.extract !== extract) ? args.extract(xhr, args) : args.deserialize(args.extract(xhr, args));
					if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
						stream(cast(args.type, response));
					}
					else {
						var error = new Error(xhr.responseText);
						for (var key in response) { error[key] = response[key]; }
						stream.error(error);
					}
				}
				catch (e) {
					stream.error(e);
				}
				if (typeof oncompletion === "function") { oncompletion(); }
			}
		};
		
		if (useBody) { xhr.send(args.data); }
		else { xhr.send(); }
		
		return stream
	}

	function jsonp(args) {
		var stream = Stream();
		if (args.initialValue !== undefined) { stream(args.initialValue); }
		
		var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++;
		var script = $window.document.createElement("script");
		$window[callbackName] = function(data) {
			script.parentNode.removeChild(script);
			stream(cast(args.type, data));
			if (typeof oncompletion === "function") { oncompletion(); }
			delete $window[callbackName];
		};
		script.onerror = function() {
			script.parentNode.removeChild(script);
			stream.error(new Error("JSONP request failed"));
			if (typeof oncompletion === "function") { oncompletion(); }
			delete $window[callbackName];
		};
		if (args.data == null) { args.data = {}; }
		args.url = interpolate(args.url, args.data);
		args.data[args.callbackKey || "callback"] = callbackName;
		script.src = assemble(args.url, args.data);
		$window.document.documentElement.appendChild(script);
		return stream
	}

	function interpolate(url, data) {
		if (data == null) { return url }

		var tokens = url.match(/:[^\/]+/gi) || [];
		for (var i = 0; i < tokens.length; i++) {
			var key = tokens[i].slice(1);
			if (data[key] != null) {
				url = url.replace(tokens[i], data[key]);
				delete data[key];
			}
		}
		return url
	}

	function assemble(url, data) {
		var querystring = buildQueryString(data);
		if (querystring !== "") {
			var prefix = url.indexOf("?") < 0 ? "?" : "&";
			url += prefix + querystring;
		}
		return url
	}

	function deserialize(data) {
		try {return data !== "" ? JSON.parse(data) : null}
		catch (e) {throw new Error(data)}
	}

	function extract(xhr) {return xhr.responseText}
	
	function cast(type, data) {
		if (typeof type === "function") {
			if (data instanceof Array) {
				for (var i = 0; i < data.length; i++) {
					data[i] = new type(data[i]);
				}
			}
			else { return new type(data) }
		}
		return data
	}
	
	return {request: request, jsonp: jsonp, setCompletionCallback: setCompletionCallback}
};

var Stream = stream;
var request = request$2(window, Stream);

var pubsub = function() {
	var callbacks = [];
	function unsubscribe(callback) {
		var index = callbacks.indexOf(callback);
		if (index > -1) { callbacks.splice(index, 1); }
	}
    function publish() {
        var arguments$1 = arguments;
        var this$1 = this;

        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i].apply(this$1, arguments$1);
        }
    }
	return {subscribe: callbacks.push.bind(callbacks), unsubscribe: unsubscribe, publish: publish}
};

var redraw = pubsub();

var Vnode$4 = vnode;

var render$2 = function($window) {
	var $doc = $window.document;
	var $emptyFragment = $doc.createDocumentFragment();

	var onevent;
	function setEventCallback(callback) {return onevent = callback}

	//create
	function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
		for (var i = start; i < end; i++) {
			var vnode$$1 = vnodes[i];
			if (vnode$$1 != null) {
				insertNode(parent, createNode(vnode$$1, hooks, ns), nextSibling);
			}
		}
	}
	function createNode(vnode$$1, hooks, ns) {
		var tag = vnode$$1.tag;
		if (vnode$$1.attrs != null) { initLifecycle(vnode$$1.attrs, vnode$$1, hooks); }
		if (typeof tag === "string") {
			switch (tag) {
				case "#": return createText(vnode$$1)
				case "<": return createHTML(vnode$$1)
				case "[": return createFragment(vnode$$1, hooks, ns)
				default: return createElement(vnode$$1, hooks, ns)
			}
		}
		else { return createComponent(vnode$$1, hooks, ns) }
	}
	function createText(vnode$$1) {
		return vnode$$1.dom = $doc.createTextNode(vnode$$1.children)
	}
	function createHTML(vnode$$1) {
		var match = vnode$$1.children.match(/^\s*?<(\w+)/im) || [];
		var parent = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}[match[1]] || "div";
		var temp = $doc.createElement(parent);

		temp.innerHTML = vnode$$1.children;
		vnode$$1.dom = temp.firstChild;
		vnode$$1.domSize = temp.childNodes.length;
		var fragment = $doc.createDocumentFragment();
		var child;
		while (child = temp.firstChild) {
			fragment.appendChild(child);
		}
		return fragment
	}
	function createFragment(vnode$$1, hooks, ns) {
		var fragment = $doc.createDocumentFragment();
		if (vnode$$1.children != null) {
			var children = vnode$$1.children;
			createNodes(fragment, children, 0, children.length, hooks, null, ns);
		}
		vnode$$1.dom = fragment.firstChild;
		vnode$$1.domSize = fragment.childNodes.length;
		return fragment
	}
	function createElement(vnode$$1, hooks, ns) {
		var tag = vnode$$1.tag;
		switch (vnode$$1.tag) {
			case "svg": ns = "http://www.w3.org/2000/svg"; break
			case "math": ns = "http://www.w3.org/1998/Math/MathML"; break
		}

		var attrs = vnode$$1.attrs;
		var is = attrs && attrs.is;

		var element = ns ?
			is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
			is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag);
		vnode$$1.dom = element;

		if (attrs != null) {
			setAttrs(vnode$$1, attrs, ns);
		}

		if (vnode$$1.text != null) {
			if (vnode$$1.text !== "") { element.textContent = vnode$$1.text; }
			else { vnode$$1.children = [Vnode$4("#", undefined, undefined, vnode$$1.text, undefined, undefined)]; }
		}

		if (vnode$$1.children != null) {
			var children = vnode$$1.children;
			createNodes(element, children, 0, children.length, hooks, null, ns);
			setLateAttrs(vnode$$1);
		}
		return element
	}
	function createComponent(vnode$$1, hooks, ns) {
		// For object literals since `Vnode()` always sets the `state` field.
		if (!vnode$$1.state) { vnode$$1.state = {}; }
		assign(vnode$$1.state, vnode$$1.tag);

		initLifecycle(vnode$$1.tag, vnode$$1, hooks);
		vnode$$1.instance = Vnode$4.normalize(vnode$$1.tag.view.call(vnode$$1.state, vnode$$1));
		if (vnode$$1.instance != null) {
			if (vnode$$1.instance === vnode$$1) { throw Error("A view cannot return the vnode it received as arguments") }
			var element = createNode(vnode$$1.instance, hooks, ns);
			vnode$$1.dom = vnode$$1.instance.dom;
			vnode$$1.domSize = vnode$$1.dom != null ? vnode$$1.instance.domSize : 0;
			return element
		}
		else {
			vnode$$1.domSize = 0;
			return $emptyFragment
		}
	}

	//update
	function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
		if (old === vnodes || old == null && vnodes == null) { return }
		else if (old == null) { createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, undefined); }
		else if (vnodes == null) { removeNodes(parent, old, 0, old.length, vnodes); }
		else {
			var recycling = isRecyclable(old, vnodes);
			if (recycling) { old = old.concat(old.pool); }

			if (old.length === vnodes.length && vnodes[0] != null && vnodes[0].key == null) {
				for (var i = 0; i < old.length; i++) {
					if (old[i] === vnodes[i] || old[i] == null && vnodes[i] == null) { continue }
					else if (old[i] == null) { insertNode(parent, createNode(vnodes[i], hooks, ns), getNextSibling(old, i + 1, nextSibling)); }
					else if (vnodes[i] == null) { removeNodes(parent, old, i, i + 1, vnodes); }
					else { updateNode(parent, old[i], vnodes[i], hooks, getNextSibling(old, i + 1, nextSibling), recycling, ns); }
					if (recycling && old[i].tag === vnodes[i].tag) { insertNode(parent, toFragment(old[i]), getNextSibling(old, i + 1, nextSibling)); }
				}
			}
			else {
				var oldStart = 0, start = 0, oldEnd = old.length - 1, end = vnodes.length - 1, map;
				while (oldEnd >= oldStart && end >= start) {
					var o = old[oldStart], v = vnodes[start];
					if (o === v && !recycling) { oldStart++, start++; }
					else if (o != null && v != null && o.key === v.key) {
						oldStart++, start++;
						updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), recycling, ns);
						if (recycling && o.tag === v.tag) { insertNode(parent, toFragment(o), nextSibling); }
					}
					else {
						var o = old[oldEnd];
						if (o === v && !recycling) { oldEnd--, start++; }
						else if (o != null && v != null && o.key === v.key) {
							updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), recycling, ns);
							if (recycling || start < end) { insertNode(parent, toFragment(o), getNextSibling(old, oldStart, nextSibling)); }
							oldEnd--, start++;
						}
						else { break }
					}
				}
				while (oldEnd >= oldStart && end >= start) {
					var o = old[oldEnd], v = vnodes[end];
					if (o === v && !recycling) { oldEnd--, end--; }
					else if (o != null && v != null && o.key === v.key) {
						updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), recycling, ns);
						if (recycling && o.tag === v.tag) { insertNode(parent, toFragment(o), nextSibling); }
						if (o.dom != null) { nextSibling = o.dom; }
						oldEnd--, end--;
					}
					else {
						if (!map) { map = getKeyMap(old, oldEnd); }
						if (v != null) {
							var oldIndex = map[v.key];
							if (oldIndex != null) {
								var movable = old[oldIndex];
								updateNode(parent, movable, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), recycling, ns);
								insertNode(parent, toFragment(movable), nextSibling);
								old[oldIndex].skip = true;
								if (movable.dom != null) { nextSibling = movable.dom; }
							}
							else {
								var dom = createNode(v, hooks, undefined);
								insertNode(parent, dom, nextSibling);
								nextSibling = dom;
							}
						}
						end--;
					}
					if (end < start) { break }
				}
				createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
				removeNodes(parent, old, oldStart, oldEnd + 1, vnodes);
			}
		}
	}
	function updateNode(parent, old, vnode$$1, hooks, nextSibling, recycling, ns) {
		var oldTag = old.tag, tag = vnode$$1.tag;
		if (oldTag === tag) {
			vnode$$1.state = old.state;
			vnode$$1.events = old.events;
			if (shouldUpdate(vnode$$1, old)) { return }
			if (vnode$$1.attrs != null) {
				updateLifecycle(vnode$$1.attrs, vnode$$1, hooks, recycling);
			}
			if (typeof oldTag === "string") {
				switch (oldTag) {
					case "#": updateText(old, vnode$$1); break
					case "<": updateHTML(parent, old, vnode$$1, nextSibling); break
					case "[": updateFragment(parent, old, vnode$$1, hooks, nextSibling, ns); break
					default: updateElement(old, vnode$$1, hooks, ns);
				}
			}
			else { updateComponent(parent, old, vnode$$1, hooks, nextSibling, recycling, ns); }
		}
		else {
			removeNode(parent, old, null);
			insertNode(parent, createNode(vnode$$1, hooks, undefined), nextSibling);
		}
	}
	function updateText(old, vnode$$1) {
		if (old.children.toString() !== vnode$$1.children.toString()) {
			old.dom.nodeValue = vnode$$1.children;
		}
		vnode$$1.dom = old.dom;
	}
	function updateHTML(parent, old, vnode$$1, nextSibling) {
		if (old.children !== vnode$$1.children) {
			toFragment(old);
			insertNode(parent, createHTML(vnode$$1), nextSibling);
		}
		else { vnode$$1.dom = old.dom, vnode$$1.domSize = old.domSize; }
	}
	function updateFragment(parent, old, vnode$$1, hooks, nextSibling, ns) {
		updateNodes(parent, old.children, vnode$$1.children, hooks, nextSibling, ns);
		var domSize = 0, children = vnode$$1.children;
		vnode$$1.dom = null;
		if (children != null) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				if (child != null && child.dom != null) {
					if (vnode$$1.dom == null) { vnode$$1.dom = child.dom; }
					domSize += child.domSize || 1;
				}
			}
			if (domSize !== 1) { vnode$$1.domSize = domSize; }
		}
	}
	function updateElement(old, vnode$$1, hooks, ns) {
		var element = vnode$$1.dom = old.dom;
		switch (vnode$$1.tag) {
			case "svg": ns = "http://www.w3.org/2000/svg"; break
			case "math": ns = "http://www.w3.org/1998/Math/MathML"; break
		}
		if (vnode$$1.tag === "textarea") {
			if (vnode$$1.attrs == null) { vnode$$1.attrs = {}; }
			if (vnode$$1.text != null) { vnode$$1.attrs.value = vnode$$1.text; } //FIXME handle multiple children
		}
		updateAttrs(vnode$$1, old.attrs, vnode$$1.attrs, ns);
		if (old.text != null && vnode$$1.text != null && vnode$$1.text !== "") {
			if (old.text.toString() !== vnode$$1.text.toString()) { old.dom.firstChild.nodeValue = vnode$$1.text; }
		}
		else {
			if (old.text != null) { old.children = [Vnode$4("#", undefined, undefined, old.text, undefined, old.dom.firstChild)]; }
			if (vnode$$1.text != null) { vnode$$1.children = [Vnode$4("#", undefined, undefined, vnode$$1.text, undefined, undefined)]; }
			updateNodes(element, old.children, vnode$$1.children, hooks, null, ns);
		}
	}
	function updateComponent(parent, old, vnode$$1, hooks, nextSibling, recycling, ns) {
		vnode$$1.instance = Vnode$4.normalize(vnode$$1.tag.view.call(vnode$$1.state, vnode$$1));
		updateLifecycle(vnode$$1.tag, vnode$$1, hooks, recycling);
		if (vnode$$1.instance != null) {
			if (old.instance == null) { insertNode(parent, createNode(vnode$$1.instance, hooks, ns), nextSibling); }
			else { updateNode(parent, old.instance, vnode$$1.instance, hooks, nextSibling, recycling, ns); }
			vnode$$1.dom = vnode$$1.instance.dom;
			vnode$$1.domSize = vnode$$1.instance.domSize;
		}
		else if (old.instance != null) {
			removeNode(parent, old.instance, null);
			vnode$$1.dom = undefined;
			vnode$$1.domSize = 0;
		}
		else {
			vnode$$1.dom = old.dom;
			vnode$$1.domSize = old.domSize;
		}
	}
	function isRecyclable(old, vnodes) {
		if (old.pool != null && Math.abs(old.pool.length - vnodes.length) <= Math.abs(old.length - vnodes.length)) {
			var oldChildrenLength = old[0] && old[0].children && old[0].children.length || 0;
			var poolChildrenLength = old.pool[0] && old.pool[0].children && old.pool[0].children.length || 0;
			var vnodesChildrenLength = vnodes[0] && vnodes[0].children && vnodes[0].children.length || 0;
			if (Math.abs(poolChildrenLength - vnodesChildrenLength) <= Math.abs(oldChildrenLength - vnodesChildrenLength)) {
				return true
			}
		}
		return false
	}
	function getKeyMap(vnodes, end) {
		var map = {}, i = 0;
		for (var i = 0; i < end; i++) {
			var vnode$$1 = vnodes[i];
			if (vnode$$1 != null) {
				var key = vnode$$1.key;
				if (key != null) { map[key] = i; }
			}
		}
		return map
	}
	function toFragment(vnode$$1) {
		var count = vnode$$1.domSize;
		if (count != null || vnode$$1.dom == null) {
			var fragment = $doc.createDocumentFragment();
			if (count > 0) {
				var dom = vnode$$1.dom;
				while (--count) { fragment.appendChild(dom.nextSibling); }
				fragment.insertBefore(dom, fragment.firstChild);
			}
			return fragment
		}
		else { return vnode$$1.dom }
	}
	function getNextSibling(vnodes, i, nextSibling) {
		for (; i < vnodes.length; i++) {
			if (vnodes[i] != null && vnodes[i].dom != null) { return vnodes[i].dom }
		}
		return nextSibling
	}

	function insertNode(parent, dom, nextSibling) {
		if (nextSibling && nextSibling.parentNode) { parent.insertBefore(dom, nextSibling); }
		else { parent.appendChild(dom); }
	}

	//remove
	function removeNodes(parent, vnodes, start, end, context) {
		for (var i = start; i < end; i++) {
			var vnode$$1 = vnodes[i];
			if (vnode$$1 != null) {
				if (vnode$$1.skip) { vnode$$1.skip = false; }
				else { removeNode(parent, vnode$$1, context); }
			}
		}
	}
	function once(f) {
		var called = false;
		return function() {
			if (!called) {
				called = true;
				f();
			}
		}
	}
	function removeNode(parent, vnode$$1, context) {
		var expected = 1, called = 0;
		if (vnode$$1.attrs && vnode$$1.attrs.onbeforeremove) {
			expected++;
			vnode$$1.attrs.onbeforeremove.call(vnode$$1.state, vnode$$1, once(continuation));
		}
		if (typeof vnode$$1.tag !== "string" && vnode$$1.tag.onbeforeremove) {
			expected++;
			vnode$$1.tag.onbeforeremove.call(vnode$$1.state, vnode$$1, once(continuation));
		}
		continuation();
		function continuation() {
			if (++called === expected) {
				onremove(vnode$$1);
				if (vnode$$1.dom) {
					var count = vnode$$1.domSize || 1;
					if (count > 1) {
						var dom = vnode$$1.dom;
						while (--count) {
							parent.removeChild(dom.nextSibling);
						}
					}
					if (vnode$$1.dom.parentNode != null) { parent.removeChild(vnode$$1.dom); }
					if (context != null && vnode$$1.domSize == null && !hasIntegrationMethods(vnode$$1.attrs) && typeof vnode$$1.tag === "string") { //TODO test custom elements
						if (!context.pool) { context.pool = [vnode$$1]; }
						else { context.pool.push(vnode$$1); }
					}
				}
			}
		}
	}
	function onremove(vnode$$1) {
		if (vnode$$1.attrs && vnode$$1.attrs.onremove) { vnode$$1.attrs.onremove.call(vnode$$1.state, vnode$$1); }
		if (typeof vnode$$1.tag !== "string" && vnode$$1.tag.onremove) { vnode$$1.tag.onremove.call(vnode$$1.state, vnode$$1); }
		if (vnode$$1.instance != null) { onremove(vnode$$1.instance); }
		else {
			var children = vnode$$1.children;
			if (children instanceof Array) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i];
					if (child != null) { onremove(child); }
				}
			}
		}
	}

	//attrs
	function setAttrs(vnode$$1, attrs, ns) {
		for (var key in attrs) {
			setAttr(vnode$$1, key, null, attrs[key], ns);
		}
	}
	function setAttr(vnode$$1, key, old, value, ns) {
		var element = vnode$$1.dom;
		if (key === "key" || (old === value && !isFormAttribute(vnode$$1, key)) && typeof value !== "object" || typeof value === "undefined" || isLifecycleMethod(key)) { return }
		var nsLastIndex = key.indexOf(":");
		if (nsLastIndex > -1 && key.substr(0, nsLastIndex) === "xlink") {
			element.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(nsLastIndex + 1), value);
		}
		else if (key[0] === "o" && key[1] === "n" && typeof value === "function") { updateEvent(vnode$$1, key, value); }
		else if (key === "style") { updateStyle(element, old, value); }
		else if (key in element && !isAttribute(key) && ns === undefined) {
			//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
			if (vnode$$1.tag === "input" && key === "value" && vnode$$1.dom.value === value && vnode$$1.dom === $doc.activeElement) { return }
			element[key] = value;
		}
		else {
			if (typeof value === "boolean") {
				if (value) { element.setAttribute(key, ""); }
				else { element.removeAttribute(key); }
			}
			else { element.setAttribute(key === "className" ? "class" : key, value); }
		}
	}
	function setLateAttrs(vnode$$1) {
		var attrs = vnode$$1.attrs;
		if (vnode$$1.tag === "select" && attrs != null) {
			if ("value" in attrs) { setAttr(vnode$$1, "value", null, attrs.value, undefined); }
			if ("selectedIndex" in attrs) { setAttr(vnode$$1, "selectedIndex", null, attrs.selectedIndex, undefined); }
		}
	}
	function updateAttrs(vnode$$1, old, attrs, ns) {
		if (attrs != null) {
			for (var key in attrs) {
				setAttr(vnode$$1, key, old && old[key], attrs[key], ns);
			}
		}
		if (old != null) {
			for (var key in old) {
				if (attrs == null || !(key in attrs)) {
					if (key === "className") { key = "class"; }
					if (key[0] === "o" && key[1] === "n" && !isLifecycleMethod(key)) { updateEvent(vnode$$1, key, undefined); }
					else if (key !== "key") { vnode$$1.dom.removeAttribute(key); }
				}
			}
		}
	}
	function isFormAttribute(vnode$$1, attr) {
		return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode$$1.dom === $doc.activeElement
	}
	function isLifecycleMethod(attr) {
		return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
	}
	function isAttribute(attr) {
		return attr === "href" || attr === "list" || attr === "form" || attr === "width" || attr === "height"// || attr === "type"
	}
	function hasIntegrationMethods(source) {
		return source != null && (source.oncreate || source.onupdate || source.onbeforeremove || source.onremove)
	}

	//style
	function updateStyle(element, old, style) {
		if (old === style) { element.style.cssText = "", old = null; }
		if (style == null) { element.style.cssText = ""; }
		else if (typeof style === "string") { element.style.cssText = style; }
		else {
			if (typeof old === "string") { element.style.cssText = ""; }
			for (var key in style) {
				element.style[key] = style[key];
			}
			if (old != null && typeof old !== "string") {
				for (var key in old) {
					if (!(key in style)) { element.style[key] = ""; }
				}
			}
		}
	}

	//event
	function updateEvent(vnode$$1, key, value) {
		var element = vnode$$1.dom;
		var callback = function(e) {
			var result = value.call(element, e);
			if (typeof onevent === "function") { onevent.call(element, e); }
			return result
		};
		if (key in element) { element[key] = callback; }
		else {
			var eventName = key.slice(2);
			if (vnode$$1.events === undefined) { vnode$$1.events = {}; }
			if (vnode$$1.events[key] != null) { element.removeEventListener(eventName, vnode$$1.events[key], false); }
			if (typeof value === "function") {
				vnode$$1.events[key] = callback;
				element.addEventListener(eventName, vnode$$1.events[key], false);
			}
		}
	}

	//lifecycle
	function initLifecycle(source, vnode$$1, hooks) {
		if (typeof source.oninit === "function") { source.oninit.call(vnode$$1.state, vnode$$1); }
		if (typeof source.oncreate === "function") { hooks.push(source.oncreate.bind(vnode$$1.state, vnode$$1)); }
	}
	function updateLifecycle(source, vnode$$1, hooks, recycling) {
		if (recycling) { initLifecycle(source, vnode$$1, hooks); }
		else if (typeof source.onupdate === "function") { hooks.push(source.onupdate.bind(vnode$$1.state, vnode$$1)); }
	}
	function shouldUpdate(vnode$$1, old) {
		var forceVnodeUpdate, forceComponentUpdate;
		if (vnode$$1.attrs != null && typeof vnode$$1.attrs.onbeforeupdate === "function") { forceVnodeUpdate = vnode$$1.attrs.onbeforeupdate.call(vnode$$1.state, vnode$$1, old); }
		if (typeof vnode$$1.tag !== "string" && typeof vnode$$1.tag.onbeforeupdate === "function") { forceComponentUpdate = vnode$$1.tag.onbeforeupdate.call(vnode$$1.state, vnode$$1, old); }
		if (!(forceVnodeUpdate === undefined && forceComponentUpdate === undefined) && !forceVnodeUpdate && !forceComponentUpdate) {
			vnode$$1.dom = old.dom;
			vnode$$1.domSize = old.domSize;
			vnode$$1.instance = old.instance;
			return true
		}
		return false
	}

	function assign(target, source) {
		Object.keys(source).forEach(function(k){target[k] = source[k];});
	}

	function render(dom, vnodes) {
		if (!dom) { throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.") }
		var hooks = [];
		var active = $doc.activeElement;

		// First time rendering into a node clears it out
		if (dom.vnodes == null) { dom.textContent = ""; }

		if (!(vnodes instanceof Array)) { vnodes = [vnodes]; }
		updateNodes(dom, dom.vnodes, Vnode$4.normalizeChildren(vnodes), hooks, null, undefined);
		dom.vnodes = vnodes;
		for (var i = 0; i < hooks.length; i++) { hooks[i](); }
		if ($doc.activeElement !== active) { active.focus(); }
	}

	return {render: render, setEventCallback: setEventCallback}
};

var render = render$2(window);

var throttle$1 = function(callback) {
	//60fps translates to 16.6ms, round it down since setTimeout requires int
	var time = 16;
	var last = 0, pending = null;
	var timeout = typeof requestAnimationFrame === "function" ? requestAnimationFrame : setTimeout;
	return function(synchronous) {
		var now = Date.now();
		if (synchronous === true || last === 0 || now - last >= time) {
			last = now;
			callback();
		}
		else if (pending === null) {
			pending = timeout(function() {
				pending = null;
				callback();
				last = Date.now();
			}, time - (now - last));
		}
	}
};

var throttle = throttle$1;

var autoredraw$1 = function(root, renderer, pubsub, callback) {
	var run = throttle(callback);
	if (renderer != null) {
		renderer.setEventCallback(function(e) {
			if (e.redraw !== false) { pubsub.publish(); }
		});
	}

	if (pubsub != null) {
		if (root.redraw) { pubsub.unsubscribe(root.redraw); }
		pubsub.subscribe(run);
	}

	return root.redraw = run
};

var Vnode$5 = vnode;
var autoredraw = autoredraw$1;

var mount$2 = function(renderer, pubsub) {
	return function(root, component) {
		if (component === null) {
			renderer.render(root, []);
			pubsub.unsubscribe(root.redraw);
			delete root.redraw;
			return
		}

		var run = autoredraw(root, renderer, pubsub, function() {
			renderer.render(
				root,
				Vnode$5(component, undefined, undefined, undefined, undefined, undefined)
			);
		});

		run();
	}
};

var renderService = render;
var redrawService$1 = redraw;

var mount = mount$2(renderService, redrawService$1);

var parse = function(string) {
	if (string === "" || string == null) { return {} }
	if (string.charAt(0) === "?") { string = string.slice(1); }

	var entries = string.split("&"), data = {}, counters = {};
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i].split("=");
		var key = decodeURIComponent(entry[0]);
		var value = entry.length === 2 ? decodeURIComponent(entry[1]) : "";

		//TODO refactor out
		var number = Number(value);
		if (value !== "" && !isNaN(number) || value === "NaN") { value = number; }
		else if (value === "true") { value = true; }
		else if (value === "false") { value = false; }

		var levels = key.split(/\]\[?|\[/);
		var cursor = data;
		if (key.indexOf("[") > -1) { levels.pop(); }
		for (var j = 0; j < levels.length; j++) {
			var level = levels[j], nextLevel = levels[j + 1];
			var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10));
			var isValue = j === levels.length - 1;
			if (level === "") {
				var key = levels.slice(0, j).join();
				if (counters[key] == null) { counters[key] = 0; }
				level = counters[key]++;
			}
			if (cursor[level] == null) {
				cursor[level] = isValue ? value : isNumber ? [] : {};
			}
			cursor = cursor[level];
		}
	}
	return data
};

var buildQueryString$1 = build;
var parseQueryString = parse;

var router$2 = function($window) {
	var supportsPushState = typeof $window.history.pushState === "function";
	var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout;

	var prefix = "#!";
	function setPrefix(value) {prefix = value;}

	function normalize(fragment) {
		var data = $window.location[fragment].replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent);
		if (fragment === "pathname" && data[0] !== "/") { data = "/" + data; }
		return data
	}

	var asyncId;
	function debounceAsync(f) {
		return function() {
			if (asyncId != null) { return }
			asyncId = callAsync(function() {
				asyncId = null;
				f();
			});

		}
	}

	function parsePath(path, queryData, hashData) {
		var queryIndex = path.indexOf("?");
		var hashIndex = path.indexOf("#");
		var pathEnd = queryIndex > -1 ? queryIndex : hashIndex > -1 ? hashIndex : path.length;
		if (queryIndex > -1) {
			var queryEnd = hashIndex > -1 ? hashIndex : path.length;
			var queryParams = parseQueryString(path.slice(queryIndex + 1, queryEnd));
			for (var key in queryParams) { queryData[key] = queryParams[key]; }
		}
		if (hashIndex > -1) {
			var hashParams = parseQueryString(path.slice(hashIndex + 1));
			for (var key in hashParams) { hashData[key] = hashParams[key]; }
		}
		return path.slice(0, pathEnd)
	}

	function getPath() {
		var type = prefix.charAt(0);
		switch (type) {
			case "#": return normalize("hash").slice(prefix.length)
			case "?": return normalize("search").slice(prefix.length) + normalize("hash")
			default: return normalize("pathname").slice(prefix.length) + normalize("search") + normalize("hash")
		}
	}

	function setPath(path, data, options) {
		var queryData = {}, hashData = {};
		path = parsePath(path, queryData, hashData);
		if (data != null) {
			for (var key in data) { queryData[key] = data[key]; }
			path = path.replace(/:([^\/]+)/g, function(match, token) {
				delete queryData[token];
				return data[token]
			});
		}

		var query = buildQueryString$1(queryData);
		if (query) { path += "?" + query; }

		var hash = buildQueryString$1(hashData);
		if (hash) { path += "#" + hash; }

		if (supportsPushState) {
			if (options && options.replace) { $window.history.replaceState(null, null, prefix + path); }
			else { $window.history.pushState(null, null, prefix + path); }
			$window.onpopstate();
		}
		else { $window.location.href = prefix + path; }
	}

	function defineRoutes(routes, resolve, reject) {
		if (supportsPushState) { $window.onpopstate = debounceAsync(resolveRoute); }
		else if (prefix.charAt(0) === "#") { $window.onhashchange = resolveRoute; }
		resolveRoute();
		
		function resolveRoute() {
			var path = getPath();
			var params = {};
			var pathname = parsePath(path, params, params);
			
			for (var route in routes) {
				var matcher = new RegExp("^" + route.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$");

				if (matcher.test(pathname)) {
					pathname.replace(matcher, function() {
						var keys = route.match(/:[^\/]+/g) || [];
						var values = [].slice.call(arguments, 1, -2);
						for (var i = 0; i < keys.length; i++) {
							params[keys[i].replace(/:|\./g, "")] = decodeURIComponent(values[i]);
						}
						resolve(routes[route], params, path, route);
					});
					return
				}
			}

			reject(path, params);
		}
		return resolveRoute
	}

	function link(vnode) {
		vnode.dom.setAttribute("href", prefix + vnode.attrs.href);
		vnode.dom.onclick = function(e) {
			e.preventDefault();
			e.redraw = false;
			var href = this.getAttribute("href");
			if (href.indexOf(prefix) === 0) { href = href.slice(prefix.length); }
			setPath(href, undefined, undefined);
		};
	}

	return {setPrefix: setPrefix, getPath: getPath, setPath: setPath, defineRoutes: defineRoutes, link: link}
};

var Vnode$6 = vnode;
var coreRouter = router$2;

var router = function($window, mount) {
	var router = coreRouter($window);
	var currentResolve, currentComponent, currentRender, currentArgs, currentPath;

	var RouteComponent = {view: function() {
		return [currentRender(Vnode$6(currentComponent, null, currentArgs, undefined, undefined, undefined))]
	}};
	function defaultRender(vnode$$1) {
		return vnode$$1
	}
	var route = function(root, defaultRoute, routes) {
		currentComponent = "div";
		currentRender = defaultRender;
		currentArgs = null;

		mount(root, RouteComponent);

		router.defineRoutes(routes, function(payload, args, path) {
			var isResolver = typeof payload.view !== "function";
			var render = defaultRender;

			var resolve = currentResolve = function (component) {
				if (resolve !== currentResolve) { return }
				currentResolve = null;

				currentComponent = component != null ? component : isResolver ? "div" : payload;
				currentRender = render;
				currentArgs = args;
				currentPath = path;

				root.redraw(true);
			};
			var onmatch = function() {
				resolve();
			};
			if (isResolver) {
				if (typeof payload.render === "function") { render = payload.render.bind(payload); }
				if (typeof payload.onmatch === "function") { onmatch = payload.onmatch; }
			}
		
			onmatch.call(payload, resolve, args, path);
		}, function() {
			router.setPath(defaultRoute, null, {replace: true});
		});
	};
	route.link = router.link;
	route.prefix = router.setPrefix;
	route.set = router.setPath;
	route.get = function() {return currentPath};

	return route
};

var mount$4 = mount;

var route = router(window, mount$4);

var withAttr = function(attrName, callback, context) {
	return function(e) {
		return callback.call(context || this, attrName in e.currentTarget ? e.currentTarget[attrName] : e.currentTarget.getAttribute(attrName))
	}
};

var m = hyperscript_1;
var requestService = request;
var redrawService = redraw;

requestService.setCompletionCallback(redrawService.publish);

m.mount = mount;
m.route = route;
m.withAttr = withAttr;
m.prop = stream;
m.render = render.render;
m.redraw = redrawService.publish;
m.request = requestService.request;
m.jsonp = requestService.jsonp;
m.parseQueryString = parse;
m.buildQueryString = build;
m.version = "bleeding-edge";

var index$1 = m;

function getType(x) {
	var currentType = Object.prototype.toString.call(x).slice(8, -1).toLowerCase();
	if (currentType === 'array' && x.length > 0) {
		return '[array of ' + getType(x[0]) + 's]';
	}
	return currentType;
}

function typeStringFromArray(arr) {
	if (arr.length === 1) {
		return arr[0].type;
	}
	return arr.map(function(typeCheckFn) {
		return typeCheckFn.type;
	}).join(' || ');
}

function T(schema) {

	return function(props, label) {

		var loop = function ( key ) {

			if (schema.hasOwnProperty(key)) {

				var rules = Array.isArray(schema[key]) ? schema[key] : [schema[key]];
				var success = rules.reduce(function(prev, rule) {
					return prev || rule(props[key]);
				}, false);

				if (!success) {

					// recursive call will report errors in next round of checks
					if (typeStringFromArray(rules).indexOf('interface') > -1) {
						return;
					}

					var errorMessage =
						'Failed type check in ' + (label || 'unknown object') + '\n' +
						'Expected prop \'' + key + '\' of type ' + typeStringFromArray(rules) + '\n' +
						'You provided \'' + key + '\' of type ' + getType(props[key]);

					console.error(errorMessage);
					return { v: errorMessage };
				}
			
			}

		};

		for (var key in schema) {
			var returned = loop( key );

			if ( returned ) return returned.v;
		}

		for (var key$1 in props) {
			if (props.hasOwnProperty(key$1) && !schema.hasOwnProperty(key$1)) {
				var errorMessage$1 = 'Did not expect to find prop \'' + key$1 + '\' in ' + label;
				console.error(errorMessage$1);
				return errorMessage$1;
			}
		}

		return null;

	};

}

T.fn = T['function'] = function(x) {
	return typeof x === 'function';
};

T.fn.type = 'function';

T.str = T.string = function(x) {
	return typeof x === 'string';
};

T.str.type = 'string';

T.num = T.number = function(x) {
	return typeof x === 'number';
};

T.num.type = 'number';

T.date = function(x) {
	return getType(x) === 'date';
};

T.date.type = 'date';

T.NULL = T['null'] = function(x) {
	return getType(x) === 'null';
};

T.NULL.type = 'null';

T.nil = function(x) {
	return typeof x === 'undefined' || getType(x) === 'null';
};

T.nil.type = 'nil';

T.obj = T.object = function(x) {
	return getType(x) === 'object';
};

T.obj.type = 'object';

T.arr = T.array = function(x) {
	return Array.isArray(x);
};

T.arr.type = 'array';

T.arrayOf = function(propType) {

	var arrayOfType = function(x) {

		if (!Array.isArray(x)) {
			return false;
		}

		for (var i = 0; i < x.length; i++) {
			if (!propType(x[i])) {
				return false;
			}
		}

		return true;

	};

	arrayOfType.type = '[array of ' + propType.type + 's]';

	return arrayOfType;

};

T['int'] = T.integer = function(x) {
	return typeof x === 'number' && isFinite(x) && Math.floor(x) === x;
};


T.integer.type = 'integer';

T.optional = T.undefined = function(x) {
	return typeof x === 'undefined';
};

T.optional.type = 'undefined';

T.bool = T['boolean'] = function(x) {
	return typeof x === 'boolean';
};

T.bool.type = 'boolean';

T.any = function() {
	return true;
};

T.any.type = 'any';

// recursive
T.schema = T['interface'] = function(schema) {
	var schemaType = function(prop) {
		return !T(schema)(prop, 'nested interface'); // returns null if success, so invert as boolean
	};
	schemaType.type = 'interface';
	return schemaType;
};

var index$2 = T;

var activeClass = function (a, b) { return a === b ? 'active' : ''; };

var navType = index$2({
	active: index$2.string
});

function view$2(ref) {
	var attrs = ref.attrs;


	if (window.__DEV__) {
		navType(attrs, 'Nav');
	}

	return (
		index$1('nav.Nav',
			index$1('a.Nav-link[href=/photography]', {
				className: activeClass('photography', attrs.active),
				oncreate: index$1.route.link
			}, 'Photography'),
			index$1('a.Nav-link[href=/web]', {
				className: activeClass('web', attrs.active),
				oncreate: index$1.route.link
			}, 'Web design')
		)
	);
}

var Nav = {
	view: view$2
};

function view$1(ref) {
	var attrs = ref.attrs;
	var children = ref.children;

	return (
		index$1('div',
			index$1('.Header',
				index$1('h1.Header-text', 'Sebastian Sandqvist'),
				index$1('.logo.logo-left'),
				index$1('.logo.logo-right')
			),
			index$1(Nav, attrs),
			index$1('div', children)
		)
	);
}

var Page = {
	view: view$1
};

function view() {
	return (
		index$1(Page, { active: 'photography' },
			index$1('.Section',
				index$1('img.Photo[src=/images/photos/tomato.jpg]'),
				index$1('img.Photo[src=/images/photos/mountains.jpg]')
			)
		)
	);
}

var Photography = {
	view: view
};

function view$3() {
	return (
		index$1(Page, { active: 'web' },
			index$1('.Section',
				index$1('h1.white', 'Sparque'),
				index$1('p', 'Sparque is a website for saving and organizing artwork and inspiration.'),
				index$1('img.Web[src=/images/web/sparque.jpg]'),
				index$1('p.details', 'Project type: personal, work-in-progress'),
				index$1('p.details', 'Technology: Adobe Photoshop')
			),
			index$1('.Section',
				index$1('h1.white', 'Mithril Examples'),
				index$1('p',
					'Mithril.js is a front-end library for building complex web interfaces. ',
					'The Mithril Examples website demonstrates various parts of the API.'
				),
				index$1('img.Web[src=/images/web/mithril-examples.jpg]'),
				index$1('a.Button[href=https://mithril-examples.firebaseapp.com]', 'Visit Mithril Examples'),
				index$1('p.details', 'Project type: personal'),
				index$1('p.details', 'Technology: Mithril, CSS')
			),
			index$1('.Section',
				index$1('h1.white', 'Collage'),
				index$1('p', 'Collage.io is a social marketplace for university students.'),
				index$1('img.Web[src=/images/web/collage-login.png]'),
				index$1('img.Web[src=/images/web/collage-market.png]'),
				index$1('a.Button[href=https://collage.io]', 'Visit Collage.io'),
				index$1('p.details', 'Project type: professional'),
				index$1('p.details', 'Role: web designer & developer'),
				index$1('p.details', 'Technology: Mithril, React-Native, Node.js, Express, SASS, Canvas API, Stripe, Flow')
			),
			index$1('.Section',
				index$1('h1.white', 'UNLV Wilderness'),
				index$1('p', 'UNLV Wilderness is a club dedicated to exploring Nevada lands.'),
				index$1('img.Web[src=/images/web/wilderness.jpg]'),
				index$1('a.Button[href=http://unlv-wilderness.com]', 'Visit UNLV Wilderness'),
				index$1('p.details', 'Project type: volunteer work'),
				index$1('p.details', 'Role: web designer & developer, logo designer'),
				index$1('p.details', 'Technology: Node.js, Express, Jade, SASS')
			),
			index$1('.Section',
				index$1('h1.white', 'Ski Area Visualizer'),
				index$1('p',
					'The ski resort visualizer displays public information ',
					'about ski resorts across the United States.'
				),
				index$1('img.Web[src=/images/web/ski.jpg]'),
				index$1('p.details', 'Project type: personal'),
				index$1('p.details', 'Technology: D3.js, Node.js')
			),
			index$1('.Section',
				index$1('h1.white', 'Let\'s Join Paws'),
				index$1('p', 'Let\'s Join Paws is a social network bringing together dog owners and caregivers.'),
				index$1('img.Web[src=/images/web/letsjoinpaws.jpg]'),
				index$1('p.details', 'Project type: professional'),
				index$1('p.details', 'Role: web designer & developer'),
				index$1('p.details', 'Technology: Node.js, MongoDB, jQuery, Stripe, Mailchimp')
			),
			index$1('.Section',
				index$1('h1.white', 'Prynt'),
				index$1('p', 'Prynt is a service for remote 3d printing (built during a hackathon).'),
				index$1('img.Web[src=/images/web/prynt.jpg]'),
				index$1('p.details', 'Project type: personal'),
				index$1('p.details', 'Technology: Raspberry Pi, Node.js, Jade, SASS')
			),
			index$1('.Section',
				index$1('h1.white', 'CrowdHall'),
				index$1('p', 'CrowdHall allowed its users to create and participate in online town halls.'),
				index$1('img.Web[src=/images/web/crowdhall.jpg]'),
				index$1('img.Web[src=/images/web/crowdhall-form.jpg]'),
				index$1('p.details', 'Project type: professional'),
				index$1('p.details', 'Role: UI & UX designer'),
				index$1('p.details', 'Technology: Adobe Photoshop')
			),
			index$1('.Section',
				index$1('h1.white', 'Flying Aviation Expo'),
				index$1('p', 'The promotional website for the 2014 Flying Aviation Expo helped attendees and exhibitors find information about the event.'),
				index$1('img.Web[src=/images/web/aviation.jpg]'),
				index$1('a.Button[href=https://aviation-expo-dev.firebaseapp.com]', 'Visit Flying Aviation Expo'),
				index$1('p.details', 'Project type: professional'),
				index$1('p.details', 'Role: web designer & developer'),
				index$1('p.details', 'Technology: HTML, CSS, jQuery')
			),
			index$1('.Section',
				index$1('h1.white', 'Web Audio Editor'),
				index$1('p', 'The web audio editor helps users write and play music directly in the browser.'),
				index$1('img.Web[src=/images/web/audio.jpg]'),
				index$1('img.Web[src=/images/web/audio-instruments.jpg]'),
				index$1('p.details', 'Project type: personal'),
				index$1('p.details', 'Technology: jQuery, Web Audio API')
			),
			index$1('.Section',
				index$1('h1.white', 'Cellular Automata Visualizer'),
				index$1('p', 'This visualizer displays all 256 rules for cellular automata.'),
				index$1('img.Web[src=/images/web/cells.jpg]'),
				index$1('a.Button[href=https://cellular-automata-test.firebaseapp.com]', 'Visit Cell Visualizer'),
				index$1('p.details', 'Project type: personal'),
				index$1('p.details', 'Technology: Mithril')
			)
		)
	);
}

var Web = {
	view: view$3
};

window.__DEV__ = window.location.hostname === 'localhost';

var routes = {
	'/photography': Photography,
	'/web': Web
};

index$1.route.prefix('');
index$1.route(document.getElementById('app'), '/photography', routes);

}());
