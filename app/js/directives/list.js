'use strict';

var directives = angular.module('monaca.directives'); // no [] -> referencing existing module

directives.directive('monacaList', function() {
	return {
		restrict: 'E',
		replace: false,
		transclude: true,
		scope: {
			monacaItems: "=",
			triggerItemClicked: "&itemClick"
		},
		templateUrl: 'templates/list.html',
		link: function(scope, element, attrs) {
			console.log('items');

			scope.itemClick = function(index){
				scope.triggerItemClicked({
					index: index
				});
			}			
		}
	};
});