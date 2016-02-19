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
			expect(rimd.test.getClosestValues([150, 400, 550, 600], 410) === 400).to.be.true;
		});

		it('should return closest value above from array', function () {
			rimd.options.closestAbove = true;
			expect(rimd.test.getClosestValues([150, 400, 550, 600], 410) === 550).to.be.true;
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
				'width': 320
			}]);
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

			expect(path === 'resimage/?image=path/to/image.jpg&w=600').to.be.ok;
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
					expect(img.attributes[i].value === 'bar').to.be.ok;
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

			expect(path === 'path/to/image.jpg/600/').to.be.ok;
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
					'src': imagePath
				});

			expect(path === imagePath).to.be.ok;
		});
	});

	describe('getExtension', function() {
		var rimd = new Rimd;

		it('should return extenstion from path', function() {
			var ext = rimd.test.getExtension('path/to/image.jpg');

			expect(ext === 'jpg').to.be.ok;
		});

		it('should return extenstion from path with multiple periods', function() {
			var ext = rimd.test.getExtension('path/to.the/image.file.jpg');

			expect(ext === 'jpg').to.be.ok;
		});

		it('should return extenstion from url with search param', function() {
			var ext = rimd.test.getExtension('path/to/image.jpg?q=query');

			expect(ext === 'jpg').to.be.ok;
		});

		it('should return extenstion from url with search param and hash', function() {
			var ext = rimd.test.getExtension('path/to/image.jpg?q=query#hash');

			expect(ext === 'jpg').to.be.ok;
		});

		it('should return falsy when no extension', function() {
			var ext = rimd.test.getExtension('path/to/image?q=query');

			expect(!ext).to.be.ok;
		});

		it('should not crash on bad input', function() {
			expect(rimd.test.getExtension).to.not.throw(TypeError);
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
			});
		});
	});
});