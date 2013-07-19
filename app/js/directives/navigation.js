'use strict';

/* Directives */
var directives = angular.module('monaca.directives');

directives.directive('monacaNavigation', function() {
	return {
		restrict: 'E',
		replace: false,
		transclude: true,
		scope: {
			navigationItem: '='
		},
		templateUrl: 'templates/navigation.html',
		// The linking function will add behavior to the template
		link: function(scope, element, attrs) {
			var childSources = [];
			var isBack = false;

			scope.transitionEndCallback = function() {
				console.log('animation ended');
				isBack = false;
			}

			var title = angular.element(element.children()[0]);
			scope.$watch('navigationItem', function(newNavigationItem) {
				if (newNavigationItem) {
					childSources.push(newNavigationItem);
					console.log('childSources', childSources);
				}
			});

			//TODO: find a better way to check when the animation is ended.
			// Tried webkitTransitionEnd event but it wont get called if we dont stop the break point in debug.
			var count = 0;
			var countAnimation = function() {
				count++;
				console.log("count " + count);
				if (count === 2) {
					count = 0;
					scope.transitionEndCallback();
				}
			}

			scope.getAnimation = function() {
				var animation;
				if (isBack) {
					console.log('animation backward');
					animation = {
						enter: 'animate-enter-reverse',
						leave: 'animate-leave-reverse'
					};
				} else {
					console.log('animation forward');
					animation = {
						enter: 'animate-enter',
						leave: 'animate-leave'
					};
				}
				countAnimation();
				return animation;
			}

			scope.leftButtonClicked = function() {
				console.log('left button clicked');
				if (childSources.length < 2) {
					return;
				}

				isBack = true;
				count = 0;
				childSources.pop();
				var previousNavigationItem = childSources.pop();
				console.log('previous nav ', previousNavigationItem);
				scope.navigationItem = previousNavigationItem;
			}
		}
	}
});