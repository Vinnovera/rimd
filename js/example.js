var DEBUG = true;

(function(){
	"use strict";

	if(DEBUG) {
		var 
			options = {
				path: 'resimagecrop.php?image={path}&w={width}',
				reloadOnResize: true
			},
			rimd;

		rimd = new Rimd(options);
	}
})();