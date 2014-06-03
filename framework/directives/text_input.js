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


(function(){
  'use strict';

  var directives = angular.module('onsen.directives');

  directives.directive('onsTextInput', function(ONSEN_CONSTANTS, OnsenUtil) {
    return {
      restrict: 'E',
      replace: true,
      transclude: false,
      scope: {
        disabled: '='
      },
      templateUrl: ONSEN_CONSTANTS.DIRECTIVE_TEMPLATE_URL + '/text_input.tpl',
      link: function($scope, element, attrs) {
        element.addClass(OnsenUtil.generateModifierTemplater(attrs)('topcoat-text-input--*'));

        $scope.$watch(function() {
          return $scope.disabled;
        }, function(disabled) {
          var isDisabled = $scope.$eval(disabled);
          element.attr('disabled', isDisabled);
        });
      }
    };
  });
})();

