/*
Copyright 2013-2014 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function() {
  'use strict';
  var directives = angular.module('onsen.directives');

  directives.directive('onsNavigator', function(ONSEN_CONSTANTS, $http, $compile, $parse, NavigatorStack, Navigator, OnsenUtil, $templateCache) {
    return {
      restrict: 'E',
      replace: false,
      transclude: true,
      scope: {},

      link: {
        post: function(scope, iElement, attrs, controller, transclude) {

          var navigator = new Navigator({
            scope: scope, 
            element: iElement
          });

          OnsenUtil.declareVarAttribute(attrs, navigator);

          var pageScope = navigator._createPageScope();
          transclude(pageScope, function(compiledPage) {
            setTimeout(function() {
              navigator._pushPageDOM('', compiledPage, pageScope, {});
            }, 1000 / 60);
          });

          NavigatorStack.addNavigator(navigator);
          scope.$on('$destroy', function(){
            NavigatorStack.removeNavigator(navigator);
          });
        }
      }
    };
  });
})();
