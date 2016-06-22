/**!
 * @author Per Stenström <per@vinnovera.se>
 */

(function (root, factory) {
	"use strict";

	if (typeof define === 'function' && define.amd) {
		define([], factory());
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.Rimd = factory();
	}
}(this, function () {
	"use strict";

	if (!window) {
		/* Doesn't work in node env */
		return false;
	}

	var
		win           = window,
		doc           = document,
		_retinaScreen = (win.devicePixelRatio > 1);

	// window.addEventListener polyfill
	if(!win.addEventListener) {
		(function (WindowPrototype, DocumentPrototype, ElementPrototype, addEventListener, removeEventListener, dispatchEvent, registry) {
			WindowPrototype[addEventListener] = DocumentPrototype[addEventListener] = ElementPrototype[addEventListener] = function (type, listener) {
				var 
					target = this;

				registry.unshift([target, type, listener, function (event) {
					event.currentTarget = target;
					event.preventDefault = function () { event.returnValue = false; };
					event.stopPropagation = function () { event.cancelBubble = true; };
					event.target = event.srcElement || target;

					listener.call(target, event);
				}]);

				this.attachEvent("on" + type, registry[0][3]);
			};

			WindowPrototype[removeEventListener] = DocumentPrototype[removeEventListener] = ElementPrototype[removeEventListener] = function (type, listener) {
					var 
						index = 0,
						register;

				for (index; register == registry[index]; ++index) {
					if (register[0] == this && register[1] == type && register[2] == listener) {
						return this.detachEvent("on" + type, registry.splice(index, 1)[0][3]);
					}
				}
			};

			WindowPrototype[dispatchEvent] = DocumentPrototype[dispatchEvent] = ElementPrototype[dispatchEvent] = function (eventObject) {
				return this.fireEvent("on" + eventObject.type, eventObject);
			};
		})(Window.prototype, HTMLDocument.prototype, Element.prototype, "addEventListener", "removeEventListener", "dispatchEvent", []);
	}

	function Rimd(params) {
		var 
			options = {},
			defaults = {
				nodeList:         [],
				className:        'rimd',
				widths:           ['320', '600', '1024'],
				heights:          ['320', '600', '1024'],
				path:             'resimage/?image={path}&w={width}',
				pathOverride:     {},
				blacklist:        [],
				reloadOnResize:   false,
				lazyload:         false,
				closestAbove:     false,
				centerImage:      false,
				dubbleSizeRetina: false
			},
			images = [],
			elems = [],
			attr = [],
			queue = [],
			regexes = {},
			pathHasGet, pathRegex, nodeList, resizeHandler, properties;

		options = extend(defaults, params);

		pathHasGet = options.path.split('?').length > 1;
		pathRegex = buildPathRegex(options.path);

		if(sizeOf(options.pathOverride)) {
			(function() {
				var key;

				for(key in options.pathOverride) {
					if(!options.pathOverride.hasOwnProperty(key)) continue;

					regexes[key] = buildPathRegex(options.pathOverride[key]);
				}
			})();
		}

		if(options.nodeList.length) {
			nodeList = options.nodeList;
		} else {
			nodeList = getElementByClass(options.className);
		}
		
		addImages(nodeList);
		nodeList = null;

		if(options.reloadOnResize) {
			resizeHandler = throttle(function () {
				var
					newAttr = getImageAttributes(elems),
					i = 0,
					len = elems.length;

				for (; i < len; i++) {
					if(!('src' in newAttr[i])) continue;

					if(attr[i].path !== getImagePath(newAttr[i])) {
						images[i].updateImage(newAttr[i]);
					}
				}

				attr = newAttr;
			});

			win.addEventListener('resize', resizeHandler);
		}

		function buildPathRegex(path) {
			var
				rex = /\{([\s\S]+?)\}/g,
				pathRegex = '',
				match;

			while((match = rex.exec(path)) !== null) {
				pathRegex += '|\\{' + match[1] + '\\}';
			}

			return new RegExp(pathRegex.substr(1), 'g');
		}

		function addImages(nodeList) {
			var
				attributes = getImageAttributes(nodeList),
				len = nodeList.length,
				i = 0;

			for (;i < len; i++) {
				if(attributes[i].offsetWidth) {
					images.push(singleImage(nodeList[i], attributes[i], options.lazyload, options.centerImage));
					elems.push(nodeList[i]);
					attr.push(attributes[i]);
				} else {
					queue.push(nodeList[i]);
				}
			}
		}

		function getImagePath(attr) {
			var 
				parts = attr.src.split('?'),
				rex = pathRegex,
				path = options.path,
				newPath,
				get;

			attr.path = parts[0];

			if(options.blacklist.indexOf(attr.ext) !== -1) return attr.path;

			if(attr.ext in regexes) {
				rex = regexes[attr.ext];
				path = options.pathOverride[attr.ext];
			}

			newPath = path.replace(rex, function(match, tag, cha){
				return pathReplace(attr, match, tag, cha);
			});

			if(parts.length > 1) {
				get = parts[1];
				
				if(pathHasGet) {
					newPath += '&' + get;
				} else {
					newPath += '?' + get;
				}
			}

			attr.path = newPath;
			return newPath;
		}

		function pathReplace(attr, match) {
			var
				tmp;

			switch (match) {
				case '{width}':
					tmp = getClosestValues(options.widths, attr.offsetWidth) * ((options.dubbleSizeRetina && _retinaScreen) ? 2 : 1);

					attr.width = tmp;

					return tmp;
				case '{height}':
					return getHeight(attr);
				case '{retina}':
					return _retinaScreen ? 1 : 0;
				case '{quality}':
					return _retinaScreen && options.dubbleSizeRetina ? 40 : 80;
				default:
					tmp = match.substr(1, match.length - 2);
					return (tmp in attr) ? attr[tmp] : '';
			}
		}

		function getHeight (attr) {
			var height;

			if(typeof options.heights === 'object') {
				height = getClosestValues(options.heights, attr.offsetHeight);
				
			} else if(options.heights === 'aspectratio') {
				height = ~~((attr.offsetHeight / attr.offsetWidth) * getClosestValues(options.widths, attr.offsetWidth));
			}

			height = height * ((options.dubbleSizeRetina && _retinaScreen) ? 2 : 1);

			attr.height = height;

			return height;
		}

		function getExtension(path) {
			var file, ext;

			if(!path) return false;
			
			file = path.split(/\?|\#/i)[0];
			ext = file.match(/(?:\.([^.]+))?$/)[1];

			return ext;
		}

		function getImageAttributes(images) {
			var 
				attr = [],
				len = images.length,
				i = 0,
				data = {},
				noscript,
				key;

			for (; i < len; i++) {
				attr[i] = {};

				attr[i].offsetWidth = images[i].offsetWidth;
				attr[i].offsetHeight = images[i].offsetHeight;

				noscript = images[i].getElementsByTagName('noscript')[0];

				if(!noscript) continue;

				data = (noscript.dataset) ? noscript.dataset : getDataAttr(noscript);

				if(!('src' in data)) continue;

				for(key in data) {
					/* Android DOMStringMap has no method "hasOwnProperty()" */
					attr[i][key] = data[key];
				}

				attr[i].ext = getExtension(attr[i].src);

				attr[i].path = getImagePath(attr[i]);
			}

			return attr;
		}

		// el.dataset fallback for IE8
		function getDataAttr(el) {
			var 
				data = {},
				i = 0,
				attr,
				len, 
				key;

			if(typeof el === 'undefined' || !('attributes' in el)) return data;

			attr = el.attributes;
			len = attr.length;
			
			for(; i < len; i++) {
				if (/^data-/.test(attr[i].name)) {
					key = attr[i].name.substr(5).replace(/-(.)/g);
					data[key] = attr[i].value;
				}
			}

			return data;
		}

		function getElementByClass(selector) {
			var 
				result = [];

			selector = selector.replace(/[.]/, '');

			if(doc.querySelectorAll) {
				result = doc.querySelectorAll('.' + selector);
			} else {
				result = legacyGetElementByClass(selector);
			}

			return result;
		}

		function legacyGetElementByClass(selector) {
			var 
				result = [],
				elems = doc.getElementsByTagName('*'),
				i;

			for (i in elems) {
				if((' ' + elems[i].className + ' ').indexOf(' ' + selector + ' ') > -1) {
					result.push(elems[i]);
				}
			}

			return result;
		}

		function updateQueue() {
			var imageQueue = queue;

			// Reset queue
			queue = [];
			addImages(imageQueue);
		}

		function getClosestValues(stack, needle) {
			var
				i = 0,
				len, lowDiff, diff, result;

			if(!stack) return needle;

			len = stack.length;
			result = stack[len - 1];

			for (; i < len; i++) {
				diff = stack[i] - needle;

				if(!options.closestAbove) {

					// Turn all values positive
					diff = (diff < 0) ? ~diff : diff;
				} else if (diff < 0) continue;

				if(lowDiff === undefined || lowDiff > diff) {
					lowDiff = diff;
					result = stack[i];
				}
			}

			return result;
		}

		function destruct () {
			var
				i = 0,
				len = images.length;

			if(options.reloadOnResize) {
				win.removeEventListener('resize', resizeHandler);
			}

			for (;i < len; i++) {
				images[i].destruct();
			}

			images = null;
			elems = null;
			attr = null;
		}

		properties = {
			destruct: destruct,
			options: options,
			update: resizeHandler,
			addImages: addImages,
			updateQueue: updateQueue 
		};

		// UglifyJS will remove this block
		if(DEBUG) {
			properties.test = {
				getClosestValues: getClosestValues,
				getImageAttributes: getImageAttributes,
				legacyGetElementByClass: legacyGetElementByClass,
				getImagePath: getImagePath,
				extend: extend,
				sizeOf: sizeOf,
				getExtension: getExtension,
				buildPathRegex: buildPathRegex,
				throttle: throttle
			};
		}

		return properties;
	}

	function singleImage(elem, attr, lazyload, centerImage) {
		var
			scrollHandler = throttle(function() {
				if(isElementInViewport(elem)) {
					elem.appendChild(img);

					removeListeners();
				}
			}),
			resizeHandler = throttle(function() {
				if(typeof elem.dataset !== 'undefined') {
					elem.dataset.top = elem.getBoundingClientRect().top;
				}

				scrollHandler();
			}),
			img;

		updateImage(attr);

		function updateImage(attr) {
			if(!attr.path) return;

			if(img && img.parentNode) {
				img.parentNode.removeChild(img);
			}

			img = doc.createElement('img');

			img.src = attr.path;
			if(attr.alt) img.alt = attr.alt;
			if(attr.title) img.title = attr.title;
			if(attr.class) img.className = attr.class;

			if(centerImage) {
				if(attr.width) {
					img.style.left = "50%";
					img.style.marginLeft = -attr.width / 2 + "px";
				}

				if(attr.height) {
					img.style.top = "50%";
					img.style.marginTop = -attr.height / 2 + "px";
				}
			}

			if(!lazyload || isElementInViewport(elem)) {
				elem.appendChild(img);
			} else {
				removeListeners();
				win.addEventListener('scroll', scrollHandler); 
				win.addEventListener('resize', resizeHandler);
			}
		}

		function isElementInViewport(el) {
			var 
				top = (el.dataset && el.dataset.top) ? el.dataset.top : el.getBoundingClientRect().top,
				docEl = doc.documentElement,
				isInViewport = top <= (win.pageYOffset || docEl.scrollTop)  - (docEl.clientTop || 0) + (win.innerHeight || docEl.clientHeight);

			if(!isInViewport && el.dataset && !el.dataset.top) {
				el.dataset.top = top;
			}

			return isInViewport;
		}

		function removeListeners() {
			win.removeEventListener('scroll', scrollHandler);
			win.removeEventListener('resize', resizeHandler);
		}

		function destruct () {
			removeListeners();

			if(img && img.parentNode) {
				img.parentNode.removeChild(img);
			}

			img = null;
		}

		return {
			removeListeners: removeListeners,
			updateImage: updateImage,
			destruct: destruct
		};
	}

	function extend(destination, source) {
		for (var property in source) {
			if(source.hasOwnProperty(property) && typeof source[property] !== 'undefined') destination[property] = source[property];
		}

		return destination;
	}

	function sizeOf(object) {
		var 
			length = 0,
			property;

		for (property in object) {
			if(object.hasOwnProperty(property)) length++;
		}

		return length;
	}

	// http://underscorejs.org/docs/underscore.html#section-82
	function throttle(fn, threshhold, context) {
		var 
			args,
			last = 0,
			deferTimer = null,
			later = function() {
				last = new Date().getTime();
				fn.apply(context, args);

				context = args = null;
			};

		threshhold = threshhold || 17; // ~ 1000 / 60

		return function() {
			var
				now = new Date().getTime(),
				remaining = threshhold - (now - last);
				
			args = arguments;

			context = context || this;

			if (last && (remaining <= 0 || remaining > threshhold)) {

				if (deferTimer) {
					clearTimeout(deferTimer);
					deferTimer = null;
				}

				later();

			} else if(!last) {

				// Leading call
				later();
			} else {

				// Trailing call
				clearTimeout(deferTimer);
				deferTimer = setTimeout(later, remaining);
			}
		};
	}

	return Rimd;
}));
