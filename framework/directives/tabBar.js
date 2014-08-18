/**
 * @ngdoc directive
 * @id tabbar
 * @name ons-tabbar
 * @description
 *  [en]A component to display a tab bar on the bottom of a page. Used with ons-tabbar-item to manage pages using tabs.[/en]
 *  [ja]タブバーをページ下部に表示するためのコンポーネントです。ons-tabbar-itemと組み合わせて使うことで、ページを管理できます。[/ja]
 * @param hide-tabs
 *  [en]Whether to hide the tabs. Valid values are true/false.[/en]
 *  [ja]タブを非表示にする場合に指定します。trueもしくはfalseを指定できます。[/ja]
 * @param var
 *  [en]Variable name to refer this tabbar.[/en]
 *  [ja]JavaScriptからコンポーネントにアクセスするための変数名を指定します。[/ja]
 * @param animation
 *  [en]Animation name. Preset values are none/fade.[/en]
 *  [ja]ページ読み込み時のアニメーションを指定します。nodeもしくはfadeを選択できます。デフォルトはnoneです。[/ja]
 * @property on(eventName,listener)
 *  [en]Add an event listener. Possible events are prechange and postchange.[/en]
 *  [ja]イベントリスナーを追加します。prechangeおよびpostchangeイベントが定義されています。[/ja]
 * @property setActiveTab(index,[options])
 * @property getActiveTabIndex()
 *  [en]Get tab index on current active tab. If active tab is not found, returns -1.[/en]
 *  [ja]現在アクティブになっているタブのインデックスを返す。現在アクティブなタブがない場合には-1を返す。[/ja]
 * @codepen pGuDL
 * @guide UsingTabBar [en]Using tab bar[/en][ja]タブバーを使う[/ja]
 * @guide EventHandling [en]Event handling descriptions[/en][ja]イベント処理の使い方[/ja]
 * @guide CallingComponentAPIsfromJavaScript [en]Using navigator from JavaScript[/en][ja]JavaScriptからコンポーネントを呼び出す[/ja]
 * @guide DefiningMultiplePagesinSingleHTML [en]Defining multiple pages in single html[/en][ja]複数のページを1つのHTMLに記述する[/ja]
 * @seealso ons-tabbar-item [en]ons-tabbar-item component[/en][ja]ons-tabbar-itemコンポーネント[/ja]
 * @seealso ons-page [en]ons-page component[/en][ja]ons-pageコンポーネント[/ja]
 */
(function() {
  'use strict';
  var module = angular.module('onsen');

  module.directive('onsTabbar', function($onsen, $compile, TabbarView) {
    return {
      restrict: 'E',
      replace: false,
      transclude: true,
      scope: {
        hide: '@',
        onActiveTabChanged: '&'
      },
      templateUrl: $onsen.DIRECTIVE_TEMPLATE_URL + '/tab_bar.tpl',
      link: function(scope, element, attrs, controller, transclude) {

        if (attrs.ngController) {
          throw new Error('This element can\'t accept ng-controller directive.');
        }

        scope.modifierTemplater = $onsen.generateModifierTemplater(attrs);
        scope.selectedTabItem = {source: ''};

        attrs.$observe('hideTabs', function(hide) {
          scope.hideTabs = hide;
          tabbarView._onTabbarVisibilityChanged();
        });

        var tabbarView = new TabbarView(scope, element, attrs);

        scope.tabbarId = tabbarView._tabbarId;

        $onsen.aliasStack.register('ons.tabbar', tabbarView);
        element.data('ons-tabbar', tabbarView);
        $onsen.declareVarAttribute(attrs, tabbarView);

        transclude(function(cloned) {
          angular.element(element[0].querySelector('.ons-tabbar-inner')).append(cloned);
        });

        scope.$on('$destroy', function() {
          element.data('ons-tabbar', undefined);
          $onsen.aliasStack.unregister('ons.tabbar', tabbarView);
        });
      }
    };
  });
})();
