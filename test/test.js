var
	expect = chai.expect,
	DEBUG = true;

describe('Rimd', function() {
	describe('constructor', function() {
		var
			rimd = new Rimd;

		it('should load the image', function() {
			var
				elem = rimd.test.legacyGetElementByClass('rimd'),
				localRimd = new Rimd();

			expect(elem[0].getElementsByTagName('img').length).to.be.ok;
		});
	});

	describe('getClosestValues', function() {
		var
			rimd = new Rimd;

		it('should return closest value from array', function () {
			expect(rimd.test.getClosestValues([150, 400, 550, 600], 410)).to.be.equal(400);
		});

		it('should return closest value above from array', function () {
			rimd.options.closestAbove = true;
			expect(rimd.test.getClosestValues([150, 400, 550, 600], 410)).to.be.equal(550);
		});
	});

	describe('extend', function() {
		var
			rimd = new Rimd;

		it('should extend an object with another', function () {
			expect(rimd.test.extend({
				a: 'b',
				c: 'd'
			}, {
				a: 'e',
				f: 'g'
			})).to.deep.equal({
				a: 'e',
				c: 'd',
				f: 'g'
			});
		});
	});

	describe('sizeOf', function() {
		var
			rimd = new Rimd;

		it('should return size of object', function () {
			expect(rimd.test.sizeOf({
				a: 'b',
				c: 'd'
			})).to.deep.equal(2);
		});

		it('should return zero of empty object', function () {
			expect(rimd.test.sizeOf({})).to.deep.equal(0);
		});

		it('should not crash on bad input', function () {
			expect(rimd.test.sizeOf.bind(null, '')).to.not.throw(TypeError);
		});
	});

	describe('legacyGetElementByClass', function() {
		var
			rimd = new Rimd;

		it('should return a nodeList with elements with the class', function() {
			expect(rimd.test.legacyGetElementByClass('legacyGetElementByClass').length).to.be.equal(2);
		});
	});

	describe('getImageAttributes', function() {
		var
			rimd = new Rimd;

		it('should return the data attributes of the element', function() {
			var
				elem = rimd.test.legacyGetElementByClass('getImageAttributes');

			expect(rimd.test.getImageAttributes(elem)).to.deep.equal([{
				'src': 'path/to/image.jpg',
				'alt': 'Alt',
				'title': 'Title',
				'offsetHeight': 0,
				'offsetWidth': 400,
				'path': 'resimage/?image=path/to/image.jpg&w=320',
				'ext': 'jpg',
				'width': 320
			}]);
		});

		it('should return the extension of image', function() {
			var
				elem = rimd.test.legacyGetElementByClass('getImageAttributesExt'),
				attr = rimd.test.getImageAttributes(elem)[0];

			expect(attr).to.include.keys('ext');
			expect(attr.ext).to.be.equal('jpg');
		});
	});

	describe('getImagePath', function() {
		it('should return the image src path', function() {
			var 
				rimd = new Rimd,
				path = rimd.test.getImagePath({
					'src': 'path/to/image.jpg',
					'offsetWidth': 500
				});

			expect(path).to.be.equal('resimage/?image=path/to/image.jpg&w=600');
		});

		it('should add arbitrary data values to the path', function() {
			var 
				rimd = new Rimd({
					className: 'getImagePath',
					path: '{foo}'
				}),
				elem = rimd.test.legacyGetElementByClass('getImagePath')[0],
				img = elem.getElementsByTagName('img')[0],
				i, len;

			for(i = 0, len = img.attributes.length; i < len; i++) {
				if(img.attributes[i].name === 'src') {
					expect(img.attributes[i].value).to.be.equal('bar');
					
					rimd.destruct();
					return;
				}
			}

			throw new Error('src attribute not found');
		});

		it('should not break even with unreasonable requests', function() {
			var
				rimd = new Rimd({
					path: '{path}/{width}/{nothing}'
				}),
				path = rimd.test.getImagePath({
					'src': 'path/to/image.jpg',
					'offsetWidth': 500
				});

			expect(path).to.be.equal('path/to/image.jpg/600/');
			rimd.destruct();
		});
	});

	describe('pathOverride', function() {
		it('should use separate path for certain file extensions', function() {
			var 
				rimd = new Rimd({
					className: 'pathOverride',
					path: 'normal/{path}/to/image/{width}',
					pathOverride: {
						gif: 'overridden/{path}/to/image'
					}
				}),
				elem = rimd.test.legacyGetElementByClass('pathOverride')[0],
				img = elem.getElementsByTagName('img')[0],
				i, len;

			for(i = 0, len = img.attributes.length; i < len; i++) {
				if(img.attributes[i].name === 'src') {
					expect(img.attributes[i].value).to.be.equal('overridden/image.gif/to/image');
					
					rimd.destruct();
					return;
				}
			}

			throw new Error('src attribute not found');
		});

		it('should use the regular path', function() {
			var 
				rimd = new Rimd({
					className: 'pathOverride2',
					path: 'normal/{path}/to/image/{width}',
					pathOverride: {
						gif: 'overridden/{path}/to/image'
					},
					widths: [400]
				}),
				elem = rimd.test.legacyGetElementByClass('pathOverride2')[0],
				img = elem.getElementsByTagName('img')[0],
				i, len;

			for(i = 0, len = img.attributes.length; i < len; i++) {
				if(img.attributes[i].name === 'src') {
					expect(img.attributes[i].value).to.be.equal('normal/image.jpg/to/image/400');
					
					rimd.destruct();
					return;
				}
			}

			throw new Error('src attribute not found');
		});
	});

	describe('blacklist', function() {
		it('should not transform images with blacklisted extension', function() {
			var 
				rimd = new Rimd({
					blacklist: ['gif']
				}),
				imagePath = 'path/to/image.gif',
				path = rimd.test.getImagePath({
					'src': imagePath,
					'ext': 'gif'
				});

			expect(path).to.be.equal(imagePath);
			rimd.destruct();
		});

		it('should have untransformed path', function() {
			var 
				rimd = new Rimd({
					className: 'blacklist',
					blacklist: ['gif'],
					widths: [400]
				}),
				elem = rimd.test.legacyGetElementByClass('blacklist')[0],
				img = elem.getElementsByTagName('img')[0],
				i, len;

			for(i = 0, len = img.attributes.length; i < len; i++) {
				if(img.attributes[i].name === 'src') {
					expect(img.attributes[i].value).to.be.equal('path/to/image.gif');

					rimd.destruct();
					return;
				}
			}

			throw new Error('src attribute not found');
		});
	});

	describe('getExtension', function() {
		var rimd = new Rimd;

		it('should return extenstion from path', function() {
			var ext = rimd.test.getExtension('path/to/image.jpg');

			expect(ext).to.be.equal('jpg');
		});

		it('should return extenstion from path with multiple periods', function() {
			var ext = rimd.test.getExtension('path/to.the/image.file.jpg');

			expect(ext).to.be.equal('jpg');
		});

		it('should return extenstion from url with search param', function() {
			var ext = rimd.test.getExtension('path/to/image.jpg?q=query');

			expect(ext).to.be.equal('jpg');
		});

		it('should return extenstion from url with search param and hash', function() {
			var ext = rimd.test.getExtension('path/to/image.jpg?q=query#hash');

			expect(ext).to.be.equal('jpg');
		});

		it('should return falsy when no extension', function() {
			var ext = rimd.test.getExtension('path/to/image?q=query');

			expect(!ext).to.be.ok;
		});

		it('should not crash on bad input', function() {
			expect(rimd.test.getExtension).to.not.throw(TypeError);
		});
	});

	describe('buildPathRegex', function() {

		it('should return a regular expression based on path', function() {
			var rimd = new Rimd;

			expect(rimd.test.buildPathRegex('{path}').toString()).to.be.equal('/\\{path\\}/g');
			rimd.destruct();
		});

		it('should return a regular expression based on path', function() {
			var rimd = new Rimd;

			expect(rimd.test.buildPathRegex('/path/{path}/width/{width}/{nothing}').toString()).to.be.equal('/\\{path\\}|\\{width\\}|\\{nothing\\}/g');
			rimd.destruct();
		});
	});

	describe('malfromed input', function() {
		describe('missing data-src', function() {
			it('should not crash', function() {
				var rimd = new Rimd({
					className: 'missingSrc',
					reloadOnResize: true
				});

				expect(rimd.update).to.not.throw(TypeError);
				rimd.destruct();
			});

		});

		describe('missing path', function() {
			it('should not crash', function() {
				var 
					path, // undefined
					rimd = new Rimd({
						path: path,
						className: 'missingPath',
						reloadOnResize: true
					});

				expect(rimd.update).to.not.throw(TypeError);
				rimd.destruct();
			});
		});

		describe('missing noscript element', function() {
			it('should not crash', function() {
				var 
					rimd = new Rimd({
						className: 'missingNoscript',
						reloadOnResize: true
					});

				expect(rimd.update).to.not.throw(TypeError);
				rimd.destruct();
			});
		});
	});

	describe('throttle', function() {
		it('should allow the leading call to trigger', function() {
			var 
				rimd = new Rimd,
				callback = sinon.spy(),
				throttledCallack = rimd.test.throttle(callback);

			throttledCallack('le1');

			expect(callback.called).to.be.ok;
			rimd.destruct();
		});

		it('should allow the trailing call to trigger', function(done) {
			var 
				rimd = new Rimd,
				callback = sinon.spy(),
				throttledCallack = rimd.test.throttle(callback, 5);

			throttledCallack('se1');
			throttledCallack('se2');
			throttledCallack('se3');
			throttledCallack('se4');

			expect(callback.calledOnce).to.be.ok;
			expect(callback.args[0][0]).to.be.equal('se1');

			setTimeout(function() {
				expect(callback.calledTwice).to.be.ok;
				expect(callback.args[1][0]).to.be.equal('se4');

				rimd.destruct();
				done();
			}, 6);
		});

		it('should limit the freaquency a function continously being called is triggered', function(done) {
			var 
				rimd = new Rimd,
				callback = sinon.spy(),
				throttledCallack = rimd.test.throttle(callback, 40),
				idx = 0,
				interval;

			interval = setInterval(function() {
				idx++;
				throttledCallack('int' + idx);

				if(idx >= 12) {
					clearTimeout(interval);
					expect(callback.callCount).to.be.equal(3);

					rimd.destruct();
					done();
				}
			}, 10);
		});

	});

	
	describe('reloadOnResize', function() {
		var rimd = new Rimd;

		it('should reload image when window resizes', function() {
			var
				elem = rimd.test.legacyGetElementByClass('reloadOnResize'),
				localRimd;

			if(window.callPhantom) {
				window.callPhantom({
					viewportSize: {
						width : 800,
						height : 600
					}
				});
			}

			localRimd = new Rimd({
				widths: ['700', '800'],
				reloadOnResize: true,
				className: 'reloadOnResize'
			});

			expect(getQuery(elem[0].getElementsByTagName('img')[0].src)).to.be.equal('?image=path/to/image.jpg&w=800');

			if(window.callPhantom) {
				window.callPhantom({
					viewportSize: {
						width : 700,
						height : 600
					}
				});

				expect(elem[0].getElementsByTagName('img').length).to.be.equal(1);
				expect(getQuery(elem[0].getElementsByTagName('img')[0].src)).to.be.equal('?image=path/to/image.jpg&w=700');

				localRimd.destruct();
			}
		});
	});

	describe('lazyload', function() {
		var rimd = new Rimd;

		it('should load image when scrolled into view', function() {
			var
				elem = rimd.test.legacyGetElementByClass('lazyload'),
				localRimd;

			if(window.callPhantom) {
				window.callPhantom({
					viewportSize: {
						width : 400,
						height : 100
					}
				});
			}

			localRimd = new Rimd({
				widths: ['400'],
				lazyload: true,
				className: 'lazyload'
			});

			expect(elem[0].getElementsByTagName('img').length).to.be.equal(0);

			if(window.callPhantom) {
				window.scrollTo(0, 400);
				window.callPhantom({
					viewportSize: {
						width : 400,
						height : 200
					}
				});

				expect(getQuery(elem[0].getElementsByTagName('img')[0].src)).to.be.equal('?image=path/to/image.jpg&w=400');
				localRimd.destruct();
			}
		});

		it('should not load multiple images when page is resized before image is loaded', function(done) {
			var
				elem = rimd.test.legacyGetElementByClass('lazyloadResize'),
				localRimd;

			if(window.callPhantom) {
				window.callPhantom({
					viewportSize: {
						width : 400,
						height : 100
					}
				});
			}

			localRimd = new Rimd({
				widths: ['200', '400', '600'],
				lazyload: true,
				reloadOnResize: true,
				className: 'lazyloadResize'
			});

			expect(elem[0].getElementsByTagName('img').length).to.be.equal(0);

			if(window.callPhantom) {
				window.scrollTo(0, 300);
				window.callPhantom({
					viewportSize: {
						width : 600,
						height : 100
					}
				});

				setTimeout(function () {
					window.scrollTo(0, 600);
					window.callPhantom({
						viewportSize: {
							width : 200,
							height : 100
						}
					});
					expect(elem[0].getElementsByTagName('img').length).to.be.equal(0);
				}, 200);

				setTimeout(function () {
					window.scrollTo(0, 1400);
					window.callPhantom({
						viewportSize: {
							width : 200,
							height : 200
						}
					});

					setTimeout(function () {
						expect(elem[0].getElementsByTagName('img').length).to.be.equal(1);
						expect(getQuery(elem[0].getElementsByTagName('img')[0].src)).to.be.equal('?image=path/to/image.jpg&w=200');
						done();
					}, 100);
				}, 400);
			}
		});
	});
});
