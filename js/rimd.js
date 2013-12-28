(function(){
	"use strict";

	var Rimd = function(params){
		var test, options = {};

		init(params);

		function init(params){
			var defaults = {
			    	className: 'rimd_img',
			    	widths:    ['320', '600', '1024'],
			    	path:      'resimagecrop.php?image={path}&w={width}&r={retina}'
			    };

			options = extend(defaults, params);

			doImages();
		}

		function doImages() {
			var i,
			    widths = {}, 
			    images = getElementByClass(options.className);

			// Batch width checks to minimize the impact of forced reflow
			for (i in images) {
				if(images.hasOwnProperty(i) && i !== 'length') {
					widths[i] = images[i].offsetWidth;
				}
			}

			i = null;

			for (i in images) {
				if(images.hasOwnProperty(i) && i !== 'length') {
					parseImage(images[i], widths[i]);
				}
			}
		}

		function parseImage(image, width) {
			var newImage, attr;
			
			attr = getImageAttributes(image);

			if(!attr.src || !attr.src[1]) return;
			attr.offsetWidth = width;

			newImage = createNewImage(attr);

			image.appendChild(newImage);
		}

		function createNewImage(attr) {
			var img = document.createElement('img');

			img.src = options.path.replace(/\{width\}|\{path\}|\{retina\}/g, function(match, tag, cha){
				return pathReplace(attr, match, tag, cha);
			});

			if(attr.alt) img.alt = attr.alt;
			if(attr.title) img.title = attr.title;

			return img;
    }

    function pathReplace(attr, match) {
			switch (match) {
				case '{path}':
					return attr.src;
				case '{width}':
					return getClosestValues(options.widths, attr.offsetWidth);
				case '{retina}':
					return (window.devicePixelRatio > 1) ? 1 : 0;
			}
		}

		function getImageAttributes(image) {
			var noscript = image.children[0],
			    content  = noscript.textContent || noscript.innerHTML,
			    srcRex   = /<img[^>]+src="([^">]+)/g,
			    altRex   = /<img[^>]+alt="([^">]+)/g,
			    titleRex = /<img[^>]+title="([^">]+)/g,
			    result   = {},
			    src, alt, title;

			src = srcRex.exec(content);
			alt = altRex.exec(content);
			title = titleRex.exec(content);

			if(src && src[1]) result.src = src[1];
			if(alt && alt[1]) result.alt = alt[1];
			if(title && title[1]) result.title = title[1];

			return result;
		}

		function getElementByClass(selector) {
			var result = [];

			selector = selector.replace(/[.]/, '');

			if(document.querySelectorAll) {
				result = document.querySelectorAll('.' + selector);
			} else {
				result = legacyGetElementByClass(selector);
			}

			return result;
    }

    function legacyGetElementByClass(selector) {
			var result = [],
					elems = document.getElementsByTagName('*'),
					i;

			for (i in elems) {
				if((' ' + elems[i].className + ' ').indexOf(' ' + selector + ' ') > -1) {
					result.push(elems[i]);
				}
			}

			return result;
		}

		function extend(destination, source) {
			for (var property in source) {
				if(source.hasOwnProperty(property)) destination[property] = source[property];
			}

			return destination;
		}

		function getClosestValues (stack, needle) {
			var lowDiff, diff, result,
			    i   = 0,
			    len = stack.length;

			for (; i < len; i++) {
				diff = stack[i] - needle;
				// Turn all values positive
				diff = (diff < 0) ? ~diff : diff;
				if(lowDiff === undefined || lowDiff > diff) {
					lowDiff = diff;
					result = stack[i];
				}
			}

			return result;
		}

		// UglifyJS will discard any code within an if (DEBUG) clause
		if (DEBUG) {
			test = {
				// Expose private methods to QUnit
				'getClosestValues': getClosestValues,
				'extend': extend,
				'legacyGetElementByClass': legacyGetElementByClass,
				'getImageAttributes': getImageAttributes
			};
		}

		return {
			options: options,
			t: test
		};
	};

	window.Rimd = Rimd;
})();
