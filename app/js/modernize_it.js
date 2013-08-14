Modernizr.testStyles('#modernizr { -webkit-overflow-scrolling:touch }', function(elem, rule) {
	Modernizr.addTest(
		'overflowtouch',
		window.getComputedStyle && window.getComputedStyle(elem).getPropertyValue('-webkit-overflow-scrolling') == 'touch');
});

yepnope({
	test: Modernizr.svg,
	nope: ['maccha/css/polyfill/topcoat-mobile-light-polyfill.css']
});

yepnope({
	test: Modernizr.overflowtouch,
	nope: ['maccha/css/polyfill/sliding_menu_polyfill.css']
});