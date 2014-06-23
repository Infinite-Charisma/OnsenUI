/**
 * @ngdoc directive
 * @id tabbar
 * @name ons-tabbar
 * @param hide-tabs Wether to hide the tabs. Valid values are [true/false] or angular binding. eg: {{ shouldHide }}
 * @description
 * Used with tabbar-item to manage pages using tabs.
 */
(function() {
  'use strict';
  var module = angular.module('onsen');

  module.directive('onsTabbar', function($timeout, $compile, $onsen, TabbarStack) {
    return {
      restrict: 'E',
      replace: false,
      transclude: true,
      scope: {
        hide: '@',
        onActiveTabChanged: '&'
      },
      templateUrl: $onsen.DIRECTIVE_TEMPLATE_URL + '/tab_bar.tpl',
      controller: function($scope, $element, $attrs) {
        this.modifierTemplater = $scope.modifierTemplater = $onsen.generateModifierTemplater($attrs);

        var container = angular.element($element[0].querySelector('.ons-tab-bar__content'));
        var footer = $element[0].querySelector('.ons-tab-bar__footer');

        this.tabbarId = Date.now();

        $scope.selectedTabItem = {
          source: ''
        };

        $attrs.$observe('hideTabs', function(hide) {
          $scope.hideTabs = hide;
          onTabbarVisibilityChanged();
        });

        function triggerActiveTabChanged(index, tabItem){
          $scope.onActiveTabChanged({
            $index: index,
            $tabItem: tabItem
          });
        }

        function onTabbarVisibilityChanged() {
          if ($scope.hideTabs) {
            $scope.tabbarHeight = 0;
          } else {
            $scope.tabbarHeight = footer.clientHeight + 'px';
          }
        }

        var tabItems = [];

        this.gotSelected = function(selectedTabItem) {
          if (selectedTabItem.page) {
            this.setPage(selectedTabItem.page);
          }

          for (var i = 0; i < tabItems.length; i++) {
            if (tabItems[i] != selectedTabItem) {
              tabItems[i].setInactive();
            }else{
              triggerActiveTabChanged(i, selectedTabItem);
            }
          }
        };

        this.setPage = function(page) {
          var self = this;
          if (page) {
            $onsen.getPageHTMLAsync(page).then(function(html) {
              var templateHTML = angular.element(html.trim());
              var pageScope = $scope.$parent.$new();
              var pageContent = $compile(templateHTML)(pageScope);
              container.append(pageContent);

              if (self.currentPageElement) {
                self.currentPageElement.remove();
                self.currentPageScope.$destroy();
              }

              self.currentPageElement = pageContent;
              self.currentPageScope = pageScope;
            }, function() {
              throw new Error('Page is not found: ' + page);
            });
          } else {
            throw new Error('cannot set undefined page');
          }
        };

        this.addTabItem = function(tabItem) {
          tabItems.push(tabItem);
        };

        $scope.ons = $scope.ons || {};
        $scope.ons.tabbar = {};
        $scope.setTabbarVisibility = function(visible) {
          $scope.hideTabs = !visible;
          onTabbarVisibilityChanged();
        };

        $scope.setActiveTab = function(index){
          if(index < 0 || index >= tabItems.length){
            throw new Error('Cannot set tab with index ' + index + '. We have ' + tabItems.length + ' tabs.');
          }

          var tabItem = tabItems[index];
          tabItem.setActive();
        };

        TabbarStack.add($scope);
      }
    };
  });
})();
