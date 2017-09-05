Rimd
============

Responsive image dispatcher

Introduction
------------

Rimd is a small javascript library for loading images based on the wrapping element size. For a simple responsive image server in PHP see [Vinnovera/rimd-resimage](https://github.com/Vinnovera/rimd-resimage).

Usage
-----

Supports IE8+

### Markup

```html
<div class="rimd">
	<noscript data-src="path/to/image.jpg" data-alt="">
		<img src="path/to/image.jpg" alt="">
	</noscript>
</div>
```

### Options

```javascript
defaults = {
	className:        'rimd',
	nodeList:         [],
	widths:           ['320', '600', '1024'],
	heights:          ['320', '600', '1024'],
	path:             'resimage/?image={path}&w={width}&h={height}&r={retina}',
	reloadOnResize:   false,
	lazyload:         false,
	closestAbove:     false,
	centerImage:      false,
	dubbleSizeRetina: false,
	retinaMultiplyer: 2,
	retinaQuality:    40,
	normalQuality:    80
};
```

#### className
Classname of the rimd element.

#### nodeList
List of rimd elements to load, takes precedence over className if not empty.

#### widths
Width breakpoints. Rimd will only request images at these widths

#### heights
Height breakpoints. Rimd will only request images at these heights

#### path
Image path pattern. 

```javascript
// The path of the original image
{path}

// The calculated width
{width}

// The calculated height
{height}

// If the device has a retina display: 1 for true, 0 for false
{retina}
```
You can add any data attribute to the `<noscript>` element and pass it to the path with the data name.

```html
<noscript data-name="value">
```

```javascript
new Rimd({
	path: '/path/to/{path}?custom={name}'
});
```

#### reloadOnResize
Re-evaluate the image on window resize. If a breakpoint is passed the new image will load

#### Lazyload
Lazyload images when scrolled in to view

#### closestAbove
Rimd will load a width from the `widths` array closes to that of the element. If you instead always want to load the width closes above set this to `true`.

#### centerImage
Calculate width and height to center the image in the element using top/left 50% and negative margins.

#### dubbleSizeRetina
Load twice as big images for retina screens. 

#### retinaMultiplyer
You might not always want double size retina images. This multiplier will be used for `dubbleSizeRetina` images.

#### retinaQuality
Set as value for `{quality}` in the path for retina images.

#### normalQuality
Set as value for `{quality}` in the path for non-retina images.

### Methods

```javascript
rimd.update();
rimd.addImages(nodeList);
rimd.destruct();
```

#### update
Re-evaluate images. If a breakpoint is passed the new image will load. Useful for layout changes that are not a result of a window.resize.

#### addImages
Add a nodeList of images to the rimd instance. Useful for dynamically added images.

#### destruct
Removes all images and tears down all event listeners. Useful for avoiding memory leaks in JavaScript apps.


Contribute
----------

Install development dependencies:

```bash
$ npm install
```

Run jshint file watcher:

```bash
$ gulp
```

Build `rimd.min.js`:

```bash
$ gulp build
```

Make sure tests are passing:

```bash
$ npm test
```
