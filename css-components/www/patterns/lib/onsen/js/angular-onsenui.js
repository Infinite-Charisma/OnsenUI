/*! angular-onsenui.js for onsenui - v2.0.0-rc.11 - 2016-06-20 */
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function () {
  var initializing = false,
      fnTest = /xyz/.test(function () {
    xyz;
  }) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  this.Class = function () {};

  // Create a new Class that inherits from this class
  Class.extend = function (prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ? function (name, fn) {
        return function () {
          var tmp = this._super;

          // Add a new ._super() method that is the same method
          // but on the super-class
          this._super = _super[name];

          // The method only need to be bound temporarily, so we
          // remove it when we're done executing
          var ret = fn.apply(this, arguments);
          this._super = tmp;

          return ret;
        };
      }(name, prop[name]) : prop[name];
    }

    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if (!initializing && this.init) this.init.apply(this, arguments);
    }

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
  };
})();
//HEAD
(function (app) {
    try {
        app = angular.module("templates-main");
    } catch (err) {
        app = angular.module("templates-main", []);
    }
    app.run(["$templateCache", function ($templateCache) {
        "use strict";

        $templateCache.put("templates/sliding_menu.tpl", "<div class=\"onsen-sliding-menu__menu ons-sliding-menu-inner\"></div>\n" + "<div class=\"onsen-sliding-menu__main ons-sliding-menu-inner\"></div>\n" + "");

        $templateCache.put("templates/split_view.tpl", "<div class=\"onsen-split-view__secondary full-screen ons-split-view-inner\"></div>\n" + "<div class=\"onsen-split-view__main full-screen ons-split-view-inner\"></div>\n" + "");
    }]);
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

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

/**
 * @object ons
 * @description
 *   [ja]Onsen UIで利用できるグローバルなオブジェクトです。このオブジェクトは、AngularJSのスコープから参照することができます。 [/ja]
 *   [en]A global object that's used in Onsen UI. This object can be reached from the AngularJS scope.[/en]
 */

(function (ons) {
  'use strict';

  var module = angular.module('onsen', ['templates-main']);
  angular.module('onsen.directives', ['onsen']); // for BC

  // JS Global facade for Onsen UI.
  initOnsenFacade();
  waitOnsenUILoad();
  initAngularModule();

  function waitOnsenUILoad() {
    var unlockOnsenUI = ons._readyLock.lock();
    module.run(['$compile', '$rootScope', function ($compile, $rootScope) {
      // for initialization hook.
      if (document.readyState === 'loading' || document.readyState == 'uninitialized') {
        window.addEventListener('DOMContentLoaded', function () {
          document.body.appendChild(document.createElement('ons-dummy-for-init'));
        });
      } else if (document.body) {
        document.body.appendChild(document.createElement('ons-dummy-for-init'));
      } else {
        throw new Error('Invalid initialization state.');
      }

      $rootScope.$on('$ons-ready', unlockOnsenUI);
    }]);
  }

  function initAngularModule() {
    module.value('$onsGlobal', ons);
    module.run(['$compile', '$rootScope', '$onsen', '$q', function ($compile, $rootScope, $onsen, $q) {
      ons._onsenService = $onsen;
      ons._qService = $q;

      $rootScope.ons = window.ons;
      $rootScope.console = window.console;
      $rootScope.alert = window.alert;

      ons.$compile = $compile;
    }]);
  }

  function initOnsenFacade() {
    ons._onsenService = null;

    // Object to attach component variables to when using the var="..." attribute.
    // Can be set to null to avoid polluting the global scope.
    ons.componentBase = window;

    /**
     * @method bootstrap
     * @signature bootstrap([moduleName, [dependencies]])
     * @description
     *   [ja]Onsen UIの初期化を行います。Angular.jsのng-app属性を利用すること無しにOnsen UIを読み込んで初期化してくれます。[/ja]
     *   [en]Initialize Onsen UI. Can be used to load Onsen UI without using the <code>ng-app</code> attribute from AngularJS.[/en]
     * @param {String} [moduleName]
     *   [en]AngularJS module name.[/en]
     *   [ja]Angular.jsでのモジュール名[/ja]
     * @param {Array} [dependencies]
     *   [en]List of AngularJS module dependencies.[/en]
     *   [ja]依存するAngular.jsのモジュール名の配列[/ja]
     * @return {Object}
     *   [en]An AngularJS module object.[/en]
     *   [ja]AngularJSのModuleオブジェクトを表します。[/ja]
     */
    ons.bootstrap = function (name, deps) {
      if (angular.isArray(name)) {
        deps = name;
        name = undefined;
      }

      if (!name) {
        name = 'myOnsenApp';
      }

      deps = ['onsen'].concat(angular.isArray(deps) ? deps : []);
      var module = angular.module(name, deps);

      var doc = window.document;
      if (doc.readyState == 'loading' || doc.readyState == 'uninitialized' || doc.readyState == 'interactive') {
        doc.addEventListener('DOMContentLoaded', function () {
          angular.bootstrap(doc.documentElement, [name]);
        }, false);
      } else if (doc.documentElement) {
        angular.bootstrap(doc.documentElement, [name]);
      } else {
        throw new Error('Invalid state');
      }

      return module;
    };

    /**
     * @method findParentComponentUntil
     * @signature findParentComponentUntil(name, [dom])
     * @param {String} name
     *   [en]Name of component, i.e. 'ons-page'.[/en]
     *   [ja]コンポーネント名を指定します。例えばons-pageなどを指定します。[/ja]
     * @param {Object/jqLite/HTMLElement} [dom]
     *   [en]$event, jqLite or HTMLElement object.[/en]
     *   [ja]$eventオブジェクト、jqLiteオブジェクト、HTMLElementオブジェクトのいずれかを指定できます。[/ja]
     * @return {Object}
     *   [en]Component object. Will return null if no component was found.[/en]
     *   [ja]コンポーネントのオブジェクトを返します。もしコンポーネントが見つからなかった場合にはnullを返します。[/ja]
     * @description
     *   [en]Find parent component object of <code>dom</code> element.[/en]
     *   [ja]指定されたdom引数の親要素をたどってコンポーネントを検索します。[/ja]
     */
    ons.findParentComponentUntil = function (name, dom) {
      var element;
      if (dom instanceof HTMLElement) {
        element = angular.element(dom);
      } else if (dom instanceof angular.element) {
        element = dom;
      } else if (dom.target) {
        element = angular.element(dom.target);
      }

      return element.inheritedData(name);
    };

    /**
     * @method findComponent
     * @signature findComponent(selector, [dom])
     * @param {String} selector
     *   [en]CSS selector[/en]
     *   [ja]CSSセレクターを指定します。[/ja]
     * @param {HTMLElement} [dom]
     *   [en]DOM element to search from.[/en]
     *   [ja]検索対象とするDOM要素を指定します。[/ja]
     * @return {Object/null}
     *   [en]Component object. Will return null if no component was found.[/en]
     *   [ja]コンポーネントのオブジェクトを返します。もしコンポーネントが見つからなかった場合にはnullを返します。[/ja]
     * @description
     *   [en]Find component object using CSS selector.[/en]
     *   [ja]CSSセレクタを使ってコンポーネントのオブジェクトを検索します。[/ja]
     */
    ons.findComponent = function (selector, dom) {
      var target = (dom ? dom : document).querySelector(selector);
      return target ? angular.element(target).data(target.nodeName.toLowerCase()) || null : null;
    };

    /**
     * @method compile
     * @signature compile(dom)
     * @param {HTMLElement} dom
     *   [en]Element to compile.[/en]
     *   [ja]コンパイルする要素を指定します。[/ja]
     * @description
     *   [en]Compile Onsen UI components.[/en]
     *   [ja]通常のHTMLの要素をOnsen UIのコンポーネントにコンパイルします。[/ja]
     */
    ons.compile = function (dom) {
      if (!ons.$compile) {
        throw new Error('ons.$compile() is not ready. Wait for initialization with ons.ready().');
      }

      if (!(dom instanceof HTMLElement)) {
        throw new Error('First argument must be an instance of HTMLElement.');
      }

      var scope = angular.element(dom).scope();
      if (!scope) {
        throw new Error('AngularJS Scope is null. Argument DOM element must be attached in DOM document.');
      }

      ons.$compile(dom)(scope);
    };

    ons._getOnsenService = function () {
      if (!this._onsenService) {
        throw new Error('$onsen is not loaded, wait for ons.ready().');
      }

      return this._onsenService;
    };

    /**
     * @param {String} elementName
     * @param {Function} lastReady
     * @return {Function}
     */
    ons._waitDiretiveInit = function (elementName, lastReady) {
      return function (element, callback) {
        if (angular.element(element).data(elementName)) {
          lastReady(element, callback);
        } else {
          var listen = function listen() {
            lastReady(element, callback);
            element.removeEventListener(elementName + ':init', listen, false);
          };
          element.addEventListener(elementName + ':init', listen, false);
        }
      };
    };

    /**
     * @method createAlertDialog
     * @signature createAlertDialog(page, [options])
     * @param {String} page
     *   [en]Page name. Can be either an HTML file or an <ons-template> containing a <ons-alert-dialog> component.[/en]
     *   [ja]pageのURLか、もしくはons-templateで宣言したテンプレートのid属性の値を指定できます。[/ja]
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {Object} [options.parentScope]
     *   [en]Parent scope of the dialog. Used to bind models and access scope methods from the dialog.[/en]
     *   [ja]ダイアログ内で利用する親スコープを指定します。ダイアログからモデルやスコープのメソッドにアクセスするのに使います。このパラメータはAngularJSバインディングでのみ利用できます。[/ja]
     * @return {Promise}
     *   [en]Promise object that resolves to the alert dialog component object.[/en]
     *   [ja]ダイアログのコンポーネントオブジェクトを解決するPromiseオブジェクトを返します。[/ja]
     * @description
     *   [en]Create a alert dialog instance from a template.[/en]
     *   [ja]テンプレートからアラートダイアログのインスタンスを生成します。[/ja]
     */
    ons.createAlertDialog = function (page, options) {
      options = options || {};

      options.link = function (element) {
        if (options.parentScope) {
          ons.$compile(angular.element(element))(options.parentScope.$new());
        } else {
          ons.compile(element);
        }
      };

      return ons._createAlertDialogOriginal(page, options).then(function (alertDialog) {
        return angular.element(alertDialog).data('ons-alert-dialog');
      });
    };

    /**
     * @method createDialog
     * @signature createDialog(page, [options])
     * @param {String} page
     *   [en]Page name. Can be either an HTML file or an <ons-template> containing a <ons-dialog> component.[/en]
     *   [ja]pageのURLか、もしくはons-templateで宣言したテンプレートのid属性の値を指定できます。[/ja]
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {Object} [options.parentScope]
     *   [en]Parent scope of the dialog. Used to bind models and access scope methods from the dialog.[/en]
     *   [ja]ダイアログ内で利用する親スコープを指定します。ダイアログからモデルやスコープのメソッドにアクセスするのに使います。このパラメータはAngularJSバインディングでのみ利用できます。[/ja]
     * @return {Promise}
     *   [en]Promise object that resolves to the dialog component object.[/en]
     *   [ja]ダイアログのコンポーネントオブジェクトを解決するPromiseオブジェクトを返します。[/ja]
     * @description
     *   [en]Create a dialog instance from a template.[/en]
     *   [ja]テンプレートからダイアログのインスタンスを生成します。[/ja]
     */
    ons.createDialog = function (page, options) {
      options = options || {};

      options.link = function (element) {
        if (options.parentScope) {
          ons.$compile(angular.element(element))(options.parentScope.$new());
        } else {
          ons.compile(element);
        }
      };

      return ons._createDialogOriginal(page, options).then(function (dialog) {
        return angular.element(dialog).data('ons-dialog');
      });
    };

    /**
     * @method createPopover
     * @signature createPopover(page, [options])
     * @param {String} page
     *   [en]Page name. Can be either an HTML file or an <ons-template> containing a <ons-dialog> component.[/en]
     *   [ja]pageのURLか、もしくはons-templateで宣言したテンプレートのid属性の値を指定できます。[/ja]
     * @param {Object} [options]
     *   [en]Parameter object.[/en]
     *   [ja]オプションを指定するオブジェクト。[/ja]
     * @param {Object} [options.parentScope]
     *   [en]Parent scope of the dialog. Used to bind models and access scope methods from the dialog.[/en]
     *   [ja]ダイアログ内で利用する親スコープを指定します。ダイアログからモデルやスコープのメソッドにアクセスするのに使います。このパラメータはAngularJSバインディングでのみ利用できます。[/ja]
     * @return {Promise}
     *   [en]Promise object that resolves to the popover component object.[/en]
     *   [ja]ポップオーバーのコンポーネントオブジェクトを解決するPromiseオブジェクトを返します。[/ja]
     * @description
     *   [en]Create a popover instance from a template.[/en]
     *   [ja]テンプレートからポップオーバーのインスタンスを生成します。[/ja]
     */
    ons.createPopover = function (page, options) {
      options = options || {};

      options.link = function (element) {
        if (options.parentScope) {
          ons.$compile(angular.element(element))(options.parentScope.$new());
        } else {
          ons.compile(element);
        }
      };

      return ons._createPopoverOriginal(page, options).then(function (popover) {
        return angular.element(popover).data('ons-popover');
      });
    };

    /**
     * @param {String} page
     */
    ons.resolveLoadingPlaceholder = function (page) {
      return ons._resolveLoadingPlaceholderOriginal(page, function (element, done) {
        ons.compile(element);
        angular.element(element).scope().$evalAsync(function () {
          setImmediate(done);
        });
      });
    };

    ons._setupLoadingPlaceHolders = function () {
      // Do nothing
    };
  }
})(window.ons = window.ons || {});
/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.factory('AlertDialogView', ['$onsen', function ($onsen) {

    var AlertDialogView = Class.extend({

      /**
       * @param {Object} scope
       * @param {jqLite} element
       * @param {Object} attrs
       */
      init: function init(scope, element, attrs) {
        this._scope = scope;
        this._element = element;
        this._attrs = attrs;

        this._clearDerivingMethods = $onsen.deriveMethods(this, this._element[0], ['show', 'hide']);

        this._clearDerivingEvents = $onsen.deriveEvents(this, this._element[0], ['preshow', 'postshow', 'prehide', 'posthide', 'cancel'], function (detail) {
          if (detail.alertDialog) {
            detail.alertDialog = this;
          }
          return detail;
        }.bind(this));

        this._scope.$on('$destroy', this._destroy.bind(this));
      },

      _destroy: function _destroy() {
        this.emit('destroy');

        this._element.remove();

        this._clearDerivingMethods();
        this._clearDerivingEvents();

        this._scope = this._attrs = this._element = null;
      }

    });

    MicroEvent.mixin(AlertDialogView);
    $onsen.derivePropertiesFromElement(AlertDialogView, ['disabled', 'cancelable', 'visible', 'onDeviceBackButton']);

    return AlertDialogView;
  }]);
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

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

angular.module('onsen').value('AlertDialogAnimator', ons._internal.AlertDialogAnimator).value('AndroidAlertDialogAnimator', ons._internal.AndroidAlertDialogAnimator).value('IOSAlertDialogAnimator', ons._internal.IOSAlertDialogAnimator);
/*
Copyright 2013-2015 ASIAL CORPORATION

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

angular.module('onsen').value('AnimationChooser', ons._internal.AnimatorFactory);
/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.factory('CarouselView', ['$onsen', function ($onsen) {

    /**
     * @class CarouselView
     */
    var CarouselView = Class.extend({

      /**
       * @param {Object} scope
       * @param {jqLite} element
       * @param {Object} attrs
       */
      init: function init(scope, element, attrs) {
        this._element = element;
        this._scope = scope;
        this._attrs = attrs;

        this._scope.$on('$destroy', this._destroy.bind(this));

        this._clearDerivingMethods = $onsen.deriveMethods(this, element[0], ['setActiveIndex', 'getActiveIndex', 'next', 'prev', 'refresh', 'first', 'last']);

        this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], ['refresh', 'postchange', 'overscroll'], function (detail) {
          if (detail.carousel) {
            detail.carousel = this;
          }
          return detail;
        }.bind(this));
      },

      _destroy: function _destroy() {
        this.emit('destroy');

        this._clearDerivingEvents();
        this._clearDerivingMethods();

        this._element = this._scope = this._attrs = null;
      }
    });

    MicroEvent.mixin(CarouselView);

    $onsen.derivePropertiesFromElement(CarouselView, ['centered', 'overscrollable', 'disabled', 'autoScroll', 'swipeable', 'autoScrollRatio', 'itemCount']);

    return CarouselView;
  }]);
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.factory('DialogView', ['$onsen', function ($onsen) {

    var DialogView = Class.extend({

      init: function init(scope, element, attrs) {
        this._scope = scope;
        this._element = element;
        this._attrs = attrs;

        this._clearDerivingMethods = $onsen.deriveMethods(this, this._element[0], ['show', 'hide']);

        this._clearDerivingEvents = $onsen.deriveEvents(this, this._element[0], ['preshow', 'postshow', 'prehide', 'posthide', 'cancel'], function (detail) {
          if (detail.dialog) {
            detail.dialog = this;
          }
          return detail;
        }.bind(this));

        this._scope.$on('$destroy', this._destroy.bind(this));
      },

      _destroy: function _destroy() {
        this.emit('destroy');

        this._element.remove();
        this._clearDerivingMethods();
        this._clearDerivingEvents();

        this._scope = this._attrs = this._element = null;
      }
    });

    DialogView.registerAnimator = function (name, Animator) {
      return window.OnsDialogElement.registerAnimator(name, Animator);
    };

    MicroEvent.mixin(DialogView);
    $onsen.derivePropertiesFromElement(DialogView, ['disabled', 'cancelable', 'visible', 'onDeviceBackButton']);

    return DialogView;
  }]);
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

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

angular.module('onsen').value('DialogAnimator', ons._internal.DialogAnimator).value('IOSDialogAnimator', ons._internal.IOSDialogAnimator).value('AndroidDialogAnimator', ons._internal.AndroidDialogAnimator).value('SlideDialogAnimator', ons._internal.SlideDialogAnimator);
/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  angular.module('onsen').factory('GenericView', ['$onsen', function ($onsen) {

    var GenericView = Class.extend({

      /**
       * @param {Object} scope
       * @param {jqLite} element
       * @param {Object} attrs
       * @param {Object} [options]
       * @param {Boolean} [options.directiveOnly]
       * @param {Function} [options.onDestroy]
       * @param {String} [options.modifierTemplate]
       */
      init: function init(scope, element, attrs, options) {
        var self = this;
        options = {};

        this._element = element;
        this._scope = scope;
        this._attrs = attrs;

        if (options.directiveOnly) {
          if (!options.modifierTemplate) {
            throw new Error('options.modifierTemplate is undefined.');
          }
          $onsen.addModifierMethods(this, options.modifierTemplate, element);
        } else {
          $onsen.addModifierMethodsForCustomElements(this, element);
        }

        $onsen.cleaner.onDestroy(scope, function () {
          self._events = undefined;
          $onsen.removeModifierMethods(self);

          if (options.onDestroy) {
            options.onDestroy(self);
          }

          $onsen.clearComponent({
            scope: scope,
            attrs: attrs,
            element: element
          });

          self = element = self._element = self._scope = scope = self._attrs = attrs = options = null;
        });
      }
    });

    /**
     * @param {Object} scope
     * @param {jqLite} element
     * @param {Object} attrs
     * @param {Object} options
     * @param {String} options.viewKey
     * @param {Boolean} [options.directiveOnly]
     * @param {Function} [options.onDestroy]
     * @param {String} [options.modifierTemplate]
     */
    GenericView.register = function (scope, element, attrs, options) {
      var view = new GenericView(scope, element, attrs, options);

      if (!options.viewKey) {
        throw new Error('options.viewKey is required.');
      }

      $onsen.declareVarAttribute(attrs, view);
      element.data(options.viewKey, view);

      var destroy = options.onDestroy || angular.noop;
      options.onDestroy = function (view) {
        destroy(view);
        element.data(options.viewKey, null);
      };

      return view;
    };

    MicroEvent.mixin(GenericView);

    return GenericView;
  }]);
})();
/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.factory('LazyRepeatView', ['AngularLazyRepeatDelegate', function (AngularLazyRepeatDelegate) {

    var LazyRepeatView = Class.extend({

      /**
       * @param {Object} scope
       * @param {jqLite} element
       * @param {Object} attrs
       */
      init: function init(scope, element, attrs, linker) {
        var _this = this;

        this._element = element;
        this._scope = scope;
        this._attrs = attrs;
        this._linker = linker;

        ons._util.updateParentPosition(element[0]);

        var userDelegate = this._scope.$eval(this._attrs.onsLazyRepeat);
        var internalDelegate = new AngularLazyRepeatDelegate(userDelegate, element[0], element.scope());

        this._provider = new ons._internal.LazyRepeatProvider(element[0].parentNode, internalDelegate);
        element.remove();

        // Render when number of items change.
        this._scope.$watch(internalDelegate.countItems.bind(internalDelegate), this._provider._onChange.bind(this._provider));

        this._scope.$on('$destroy', function () {
          _this._element = _this._scope = _this._attrs = _this._linker = null;
        });
      }
    });

    return LazyRepeatView;
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  angular.module('onsen').factory('AngularLazyRepeatDelegate', ['$compile', function ($compile) {

    var directiveAttributes = ['ons-lazy-repeat', 'ons:lazy:repeat', 'ons_lazy_repeat', 'data-ons-lazy-repeat', 'x-ons-lazy-repeat'];

    var AngularLazyRepeatDelegate = function (_ons$_internal$LazyRe) {
      babelHelpers.inherits(AngularLazyRepeatDelegate, _ons$_internal$LazyRe);

      /**
       * @param {Object} userDelegate
       * @param {Element} templateElement
       * @param {Scope} parentScope
       */

      function AngularLazyRepeatDelegate(userDelegate, templateElement, parentScope) {
        babelHelpers.classCallCheck(this, AngularLazyRepeatDelegate);

        var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(AngularLazyRepeatDelegate).call(this, userDelegate, templateElement));

        _this._parentScope = parentScope;

        directiveAttributes.forEach(function (attr) {
          return templateElement.removeAttribute(attr);
        });
        _this._linker = $compile(templateElement ? templateElement.cloneNode(true) : null);
        return _this;
      }

      babelHelpers.createClass(AngularLazyRepeatDelegate, [{
        key: 'configureItemScope',
        value: function configureItemScope(item, scope) {
          if (this._userDelegate.configureItemScope instanceof Function) {
            this._userDelegate.configureItemScope(item, scope);
          }
        }
      }, {
        key: 'destroyItemScope',
        value: function destroyItemScope(item, element) {
          if (this._userDelegate.destroyItemScope instanceof Function) {
            this._userDelegate.destroyItemScope(item, element);
          }
        }
      }, {
        key: '_usingBinding',
        value: function _usingBinding() {
          if (this._userDelegate.configureItemScope) {
            return true;
          }

          if (this._userDelegate.createItemContent) {
            return false;
          }

          throw new Error('`lazy-repeat` delegate object is vague.');
        }
      }, {
        key: 'loadItemElement',
        value: function loadItemElement(index, parent, done) {
          this._prepareItemElement(index, function (_ref) {
            var element = _ref.element;
            var scope = _ref.scope;

            parent.appendChild(element);
            done({ element: element, scope: scope });
          });
        }
      }, {
        key: '_prepareItemElement',
        value: function _prepareItemElement(index, done) {
          var _this2 = this;

          var scope = this._parentScope.$new();
          this._addSpecialProperties(index, scope);

          if (this._usingBinding()) {
            this.configureItemScope(index, scope);
          }

          this._linker(scope, function (cloned) {
            var element = cloned[0];
            if (!_this2._usingBinding()) {
              element = _this2._userDelegate.createItemContent(index, element);
              $compile(element)(scope);
            }

            done({ element: element, scope: scope });
          });
        }

        /**
         * @param {Number} index
         * @param {Object} scope
         */

      }, {
        key: '_addSpecialProperties',
        value: function _addSpecialProperties(i, scope) {
          var last = this.countItems() - 1;
          angular.extend(scope, {
            $index: i,
            $first: i === 0,
            $last: i === last,
            $middle: i !== 0 && i !== last,
            $even: i % 2 === 0,
            $odd: i % 2 === 1
          });
        }
      }, {
        key: 'updateItem',
        value: function updateItem(index, item) {
          var _this3 = this;

          if (this._usingBinding()) {
            item.scope.$evalAsync(function () {
              return _this3.configureItemScope(index, item.scope);
            });
          } else {
            babelHelpers.get(Object.getPrototypeOf(AngularLazyRepeatDelegate.prototype), 'updateItem', this).call(this, index, item);
          }
        }

        /**
         * @param {Number} index
         * @param {Object} item
         * @param {Object} item.scope
         * @param {Element} item.element
         */

      }, {
        key: 'destroyItem',
        value: function destroyItem(index, item) {
          if (this._usingBinding()) {
            this.destroyItemScope(index, item.scope);
          } else {
            babelHelpers.get(Object.getPrototypeOf(AngularLazyRepeatDelegate.prototype), 'destroyItem', this).call(this, index, item.element);
          }
          item.scope.$destroy();
        }
      }, {
        key: 'destroy',
        value: function destroy() {
          babelHelpers.get(Object.getPrototypeOf(AngularLazyRepeatDelegate.prototype), 'destroy', this).call(this);
          this._scope = null;
        }
      }]);
      return AngularLazyRepeatDelegate;
    }(ons._internal.LazyRepeatDelegate);

    return AngularLazyRepeatDelegate;
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.value('ModalAnimator', ons._internal.ModalAnimator);
  module.value('FadeModalAnimator', ons._internal.FadeModalAnimator);

  module.factory('ModalView', ['$onsen', '$parse', function ($onsen, $parse) {

    var ModalView = Class.extend({
      _element: undefined,
      _scope: undefined,

      init: function init(scope, element, attrs) {
        this._scope = scope;
        this._element = element;
        this._scope.$on('$destroy', this._destroy.bind(this));

        element[0]._animatorFactory.setAnimationOptions($parse(attrs.animationOptions)());
      },

      show: function show(options) {
        return this._element[0].show(options);
      },

      hide: function hide(options) {
        return this._element[0].hide(options);
      },

      toggle: function toggle(options) {
        return this._element[0].toggle(options);
      },

      _destroy: function _destroy() {
        this.emit('destroy', { page: this });

        this._events = this._element = this._scope = null;
      }
    });

    ModalView.registerAnimator = function (name, Animator) {
      return window.OnsModalElement.registerAnimator(name, Animator);
    };

    MicroEvent.mixin(ModalView);
    $onsen.derivePropertiesFromElement(ModalView, ['onDeviceBackButton']);

    return ModalView;
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.factory('NavigatorView', ['$compile', '$onsen', function ($compile, $onsen) {

    /**
     * Manages the page navigation backed by page stack.
     *
     * @class NavigatorView
     */
    var NavigatorView = Class.extend({

      /**
       * @member {jqLite} Object
       */
      _element: undefined,

      /**
       * @member {Object} Object
       */
      _attrs: undefined,

      /**
       * @member {Object}
       */
      _scope: undefined,

      /**
       * @param {Object} scope
       * @param {jqLite} element jqLite Object to manage with navigator
       * @param {Object} attrs
       */
      init: function init(scope, element, attrs) {

        this._element = element || angular.element(window.document.body);
        this._scope = scope || this._element.scope();
        this._attrs = attrs;
        this._previousPageScope = null;

        this._boundOnPrepop = this._onPrepop.bind(this);
        this._boundOnPostpop = this._onPostpop.bind(this);
        this._element.on('prepop', this._boundOnPrepop);
        this._element.on('postpop', this._boundOnPostpop);

        this._scope.$on('$destroy', this._destroy.bind(this));

        this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], ['prepush', 'postpush', 'prepop', 'postpop', 'init', 'show', 'hide', 'destroy'], function (detail) {
          if (detail.navigator) {
            detail.navigator = this;
          }
          return detail;
        }.bind(this));

        this._clearDerivingMethods = $onsen.deriveMethods(this, element[0], ['insertPage', 'pushPage', 'bringPageTop', 'popPage', 'replacePage', 'resetToPage', 'canPopPage']);
      },

      _onPrepop: function _onPrepop(event) {
        var pages = event.detail.navigator.pages;
        angular.element(pages[pages.length - 2]).data('_scope').$evalAsync();
        this._previousPageScope = angular.element(pages[pages.length - 1]).data('_scope');
      },

      _onPostpop: function _onPostpop(event) {
        this._previousPageScope.$destroy();
      },

      _compileAndLink: function _compileAndLink(pageElement, callback) {
        var link = $compile(pageElement);
        var pageScope = this._createPageScope();
        link(pageScope);

        pageScope.$evalAsync(function () {
          callback(pageElement);
        });
      },

      _destroy: function _destroy() {
        this.emit('destroy');
        this._clearDerivingEvents();
        this._clearDerivingMethods();
        this._element.off('prepop', this._boundOnPrepop);
        this._element.off('postpop', this._boundOnPostpop);
        this._element = this._scope = this._attrs = null;
      },

      _createPageScope: function _createPageScope() {
        return this._scope.$new();
      }
    });

    MicroEvent.mixin(NavigatorView);
    $onsen.derivePropertiesFromElement(NavigatorView, ['pages', 'topPage']);

    return NavigatorView;
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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

angular.module('onsen').value('NavigatorTransitionAnimator', ons._internal.NavigatorTransitionAnimator).value('FadeTransitionAnimator', ons._internal.FadeNavigatorTransitionAnimator).value('IOSSlideTransitionAnimator', ons._internal.IOSSlideNavigatorTransitionAnimator).value('LiftTransitionAnimator', ons._internal.LiftNavigatorTransitionAnimator).value('NullTransitionAnimator', ons._internal.NavigatorTransitionAnimator).value('SimpleSlideTransitionAnimator', ons._internal.SimpleSlideNavigatorTransitionAnimator);
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.factory('OverlaySlidingMenuAnimator', ['SlidingMenuAnimator', function (SlidingMenuAnimator) {

    var OverlaySlidingMenuAnimator = SlidingMenuAnimator.extend({

      _blackMask: undefined,

      _isRight: false,
      _element: false,
      _menuPage: false,
      _mainPage: false,
      _width: false,

      /**
       * @param {jqLite} element "ons-sliding-menu" or "ons-split-view" element
       * @param {jqLite} mainPage
       * @param {jqLite} menuPage
       * @param {Object} options
       * @param {String} options.width "width" style value
       * @param {Boolean} options.isRight
       */
      setup: function setup(element, mainPage, menuPage, options) {
        options = options || {};
        this._width = options.width || '90%';
        this._isRight = !!options.isRight;
        this._element = element;
        this._mainPage = mainPage;
        this._menuPage = menuPage;

        menuPage.css('box-shadow', '0px 0 10px 0px rgba(0, 0, 0, 0.2)');
        menuPage.css({
          width: options.width,
          display: 'none',
          zIndex: 2
        });

        // Fix for transparent menu page on iOS8.
        menuPage.css('-webkit-transform', 'translate3d(0px, 0px, 0px)');

        mainPage.css({ zIndex: 1 });

        if (this._isRight) {
          menuPage.css({
            right: '-' + options.width,
            left: 'auto'
          });
        } else {
          menuPage.css({
            right: 'auto',
            left: '-' + options.width
          });
        }

        this._blackMask = angular.element('<div></div>').css({
          backgroundColor: 'black',
          top: '0px',
          left: '0px',
          right: '0px',
          bottom: '0px',
          position: 'absolute',
          display: 'none',
          zIndex: 0
        });

        element.prepend(this._blackMask);
      },

      /**
       * @param {Object} options
       * @param {String} options.width
       */
      onResized: function onResized(options) {
        this._menuPage.css('width', options.width);

        if (this._isRight) {
          this._menuPage.css({
            right: '-' + options.width,
            left: 'auto'
          });
        } else {
          this._menuPage.css({
            right: 'auto',
            left: '-' + options.width
          });
        }

        if (options.isOpened) {
          var max = this._menuPage[0].clientWidth;
          var menuStyle = this._generateMenuPageStyle(max);
          animit(this._menuPage[0]).queue(menuStyle).play();
        }
      },

      /**
       */
      destroy: function destroy() {
        if (this._blackMask) {
          this._blackMask.remove();
          this._blackMask = null;
        }

        this._mainPage.removeAttr('style');
        this._menuPage.removeAttr('style');

        this._element = this._mainPage = this._menuPage = null;
      },

      /**
       * @param {Function} callback
       * @param {Boolean} instant
       */
      openMenu: function openMenu(callback, instant) {
        var duration = instant === true ? 0.0 : this.duration;
        var delay = instant === true ? 0.0 : this.delay;

        this._menuPage.css('display', 'block');
        this._blackMask.css('display', 'block');

        var max = this._menuPage[0].clientWidth;
        var menuStyle = this._generateMenuPageStyle(max);
        var mainPageStyle = this._generateMainPageStyle(max);

        setTimeout(function () {

          animit(this._mainPage[0]).wait(delay).queue(mainPageStyle, {
            duration: duration,
            timing: this.timing
          }).queue(function (done) {
            callback();
            done();
          }).play();

          animit(this._menuPage[0]).wait(delay).queue(menuStyle, {
            duration: duration,
            timing: this.timing
          }).play();
        }.bind(this), 1000 / 60);
      },

      /**
       * @param {Function} callback
       * @param {Boolean} instant
       */
      closeMenu: function closeMenu(callback, instant) {
        var duration = instant === true ? 0.0 : this.duration;
        var delay = instant === true ? 0.0 : this.delay;

        this._blackMask.css({ display: 'block' });

        var menuPageStyle = this._generateMenuPageStyle(0);
        var mainPageStyle = this._generateMainPageStyle(0);

        setTimeout(function () {

          animit(this._mainPage[0]).wait(delay).queue(mainPageStyle, {
            duration: duration,
            timing: this.timing
          }).queue(function (done) {
            this._menuPage.css('display', 'none');
            callback();
            done();
          }.bind(this)).play();

          animit(this._menuPage[0]).wait(delay).queue(menuPageStyle, {
            duration: duration,
            timing: this.timing
          }).play();
        }.bind(this), 1000 / 60);
      },

      /**
       * @param {Object} options
       * @param {Number} options.distance
       * @param {Number} options.maxDistance
       */
      translateMenu: function translateMenu(options) {

        this._menuPage.css('display', 'block');
        this._blackMask.css({ display: 'block' });

        var menuPageStyle = this._generateMenuPageStyle(Math.min(options.maxDistance, options.distance));
        var mainPageStyle = this._generateMainPageStyle(Math.min(options.maxDistance, options.distance));
        delete mainPageStyle.opacity;

        animit(this._menuPage[0]).queue(menuPageStyle).play();

        if (Object.keys(mainPageStyle).length > 0) {
          animit(this._mainPage[0]).queue(mainPageStyle).play();
        }
      },

      _generateMenuPageStyle: function _generateMenuPageStyle(distance) {
        var x = this._isRight ? -distance : distance;
        var transform = 'translate3d(' + x + 'px, 0, 0)';

        return {
          transform: transform,
          'box-shadow': distance === 0 ? 'none' : '0px 0 10px 0px rgba(0, 0, 0, 0.2)'
        };
      },

      _generateMainPageStyle: function _generateMainPageStyle(distance) {
        var max = this._menuPage[0].clientWidth;
        var opacity = 1 - 0.1 * distance / max;

        return {
          opacity: opacity
        };
      },

      copy: function copy() {
        return new OverlaySlidingMenuAnimator();
      }
    });

    return OverlaySlidingMenuAnimator;
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.factory('PageView', ['$onsen', '$parse', function ($onsen, $parse) {

    var PageView = Class.extend({
      init: function init(scope, element, attrs) {
        var _this = this;

        this._scope = scope;
        this._element = element;
        this._attrs = attrs;

        this._clearListener = scope.$on('$destroy', this._destroy.bind(this));

        this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], ['init', 'show', 'hide', 'destroy']);

        Object.defineProperty(this, 'onDeviceBackButton', {
          get: function get() {
            return _this._element[0].onDeviceBackButton;
          },
          set: function set(value) {
            if (!_this._userBackButtonHandler) {
              _this._enableBackButtonHandler();
            }
            _this._userBackButtonHandler = value;
          }
        });

        if (this._attrs.ngDeviceBackButton || this._attrs.onDeviceBackButton) {
          this._enableBackButtonHandler();
        }
        if (this._attrs.ngInfiniteScroll) {
          this._element[0].onInfiniteScroll = function (done) {
            $parse(_this._attrs.ngInfiniteScroll)(_this._scope)(done);
          };
        }
      },

      _enableBackButtonHandler: function _enableBackButtonHandler() {
        this._userBackButtonHandler = angular.noop;
        this._element[0].onDeviceBackButton = this._onDeviceBackButton.bind(this);
      },

      _onDeviceBackButton: function _onDeviceBackButton($event) {
        this._userBackButtonHandler($event);

        // ng-device-backbutton
        if (this._attrs.ngDeviceBackButton) {
          $parse(this._attrs.ngDeviceBackButton)(this._scope, { $event: $event });
        }

        // on-device-backbutton
        /* jshint ignore:start */
        if (this._attrs.onDeviceBackButton) {
          var lastEvent = window.$event;
          window.$event = $event;
          new Function(this._attrs.onDeviceBackButton)(); // eslint-disable-line no-new-func
          window.$event = lastEvent;
        }
        /* jshint ignore:end */
      },

      _destroy: function _destroy() {
        this._clearDerivingEvents();

        this._element = null;
        this._scope = null;

        this._clearListener();
      }
    });
    MicroEvent.mixin(PageView);

    return PageView;
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  angular.module('onsen').factory('PopoverView', ['$onsen', function ($onsen) {

    var PopoverView = Class.extend({

      /**
       * @param {Object} scope
       * @param {jqLite} element
       * @param {Object} attrs
       */
      init: function init(scope, element, attrs) {
        this._element = element;
        this._scope = scope;
        this._attrs = attrs;

        this._scope.$on('$destroy', this._destroy.bind(this));

        this._clearDerivingMethods = $onsen.deriveMethods(this, this._element[0], ['show', 'hide']);

        this._clearDerivingEvents = $onsen.deriveEvents(this, this._element[0], ['preshow', 'postshow', 'prehide', 'posthide'], function (detail) {
          if (detail.popover) {
            detail.popover = this;
          }
          return detail;
        }.bind(this));
      },

      _destroy: function _destroy() {
        this.emit('destroy');

        this._clearDerivingMethods();
        this._clearDerivingEvents();

        this._element.remove();

        this._element = this._scope = null;
      }
    });

    MicroEvent.mixin(PopoverView);
    $onsen.derivePropertiesFromElement(PopoverView, ['cancelable', 'disabled', 'onDeviceBackButton']);

    return PopoverView;
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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

angular.module('onsen').value('PopoverAnimator', ons._internal.PopoverAnimator).value('FadePopoverAnimator', ons._internal.FadePopoverAnimator);
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.factory('PullHookView', ['$onsen', '$parse', function ($onsen, $parse) {

    var PullHookView = Class.extend({

      init: function init(scope, element, attrs) {
        var _this = this;

        this._element = element;
        this._scope = scope;
        this._attrs = attrs;

        this._clearDerivingEvents = $onsen.deriveEvents(this, this._element[0], ['changestate'], function (detail) {
          if (detail.pullHook) {
            detail.pullHook = _this;
          }
          return detail;
        });

        this.on('changestate', function () {
          return _this._scope.$evalAsync();
        });

        this._element[0].onAction = function (done) {
          if (_this._attrs.ngAction) {
            _this._scope.$eval(_this._attrs.ngAction, { $done: done });
          } else {
            _this.onAction ? _this.onAction(done) : done();
          }
        };

        this._scope.$on('$destroy', this._destroy.bind(this));
      },

      _destroy: function _destroy() {
        this.emit('destroy');

        this._clearDerivingEvents();

        this._element = this._scope = this._attrs = null;
      }
    });

    MicroEvent.mixin(PullHookView);
    $onsen.derivePropertiesFromElement(PullHookView, ['state', 'pullDistance', 'height', 'thresholdHeight', 'disabled']);

    return PullHookView;
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.factory('PushSlidingMenuAnimator', ['SlidingMenuAnimator', function (SlidingMenuAnimator) {

    var PushSlidingMenuAnimator = SlidingMenuAnimator.extend({

      _isRight: false,
      _element: undefined,
      _menuPage: undefined,
      _mainPage: undefined,
      _width: undefined,

      /**
       * @param {jqLite} element "ons-sliding-menu" or "ons-split-view" element
       * @param {jqLite} mainPage
       * @param {jqLite} menuPage
       * @param {Object} options
       * @param {String} options.width "width" style value
       * @param {Boolean} options.isRight
       */
      setup: function setup(element, mainPage, menuPage, options) {
        options = options || {};

        this._element = element;
        this._mainPage = mainPage;
        this._menuPage = menuPage;

        this._isRight = !!options.isRight;
        this._width = options.width || '90%';

        menuPage.css({
          width: options.width,
          display: 'none'
        });

        if (this._isRight) {
          menuPage.css({
            right: '-' + options.width,
            left: 'auto'
          });
        } else {
          menuPage.css({
            right: 'auto',
            left: '-' + options.width
          });
        }
      },

      /**
       * @param {Object} options
       * @param {String} options.width
       * @param {Object} options.isRight
       */
      onResized: function onResized(options) {
        this._menuPage.css('width', options.width);

        if (this._isRight) {
          this._menuPage.css({
            right: '-' + options.width,
            left: 'auto'
          });
        } else {
          this._menuPage.css({
            right: 'auto',
            left: '-' + options.width
          });
        }

        if (options.isOpened) {
          var max = this._menuPage[0].clientWidth;
          var mainPageTransform = this._generateAbovePageTransform(max);
          var menuPageStyle = this._generateBehindPageStyle(max);

          animit(this._mainPage[0]).queue({ transform: mainPageTransform }).play();
          animit(this._menuPage[0]).queue(menuPageStyle).play();
        }
      },

      /**
       */
      destroy: function destroy() {
        this._mainPage.removeAttr('style');
        this._menuPage.removeAttr('style');

        this._element = this._mainPage = this._menuPage = null;
      },

      /**
       * @param {Function} callback
       * @param {Boolean} instant
       */
      openMenu: function openMenu(callback, instant) {
        var duration = instant === true ? 0.0 : this.duration;
        var delay = instant === true ? 0.0 : this.delay;

        this._menuPage.css('display', 'block');

        var max = this._menuPage[0].clientWidth;

        var aboveTransform = this._generateAbovePageTransform(max);
        var behindStyle = this._generateBehindPageStyle(max);

        setTimeout(function () {

          animit(this._mainPage[0]).wait(delay).queue({
            transform: aboveTransform
          }, {
            duration: duration,
            timing: this.timing
          }).queue(function (done) {
            callback();
            done();
          }).play();

          animit(this._menuPage[0]).wait(delay).queue(behindStyle, {
            duration: duration,
            timing: this.timing
          }).play();
        }.bind(this), 1000 / 60);
      },

      /**
       * @param {Function} callback
       * @param {Boolean} instant
       */
      closeMenu: function closeMenu(callback, instant) {
        var duration = instant === true ? 0.0 : this.duration;
        var delay = instant === true ? 0.0 : this.delay;

        var aboveTransform = this._generateAbovePageTransform(0);
        var behindStyle = this._generateBehindPageStyle(0);

        setTimeout(function () {

          animit(this._mainPage[0]).wait(delay).queue({
            transform: aboveTransform
          }, {
            duration: duration,
            timing: this.timing
          }).queue({
            transform: 'translate3d(0, 0, 0)'
          }).queue(function (done) {
            this._menuPage.css('display', 'none');
            callback();
            done();
          }.bind(this)).play();

          animit(this._menuPage[0]).wait(delay).queue(behindStyle, {
            duration: duration,
            timing: this.timing
          }).queue(function (done) {
            done();
          }).play();
        }.bind(this), 1000 / 60);
      },

      /**
       * @param {Object} options
       * @param {Number} options.distance
       * @param {Number} options.maxDistance
       */
      translateMenu: function translateMenu(options) {

        this._menuPage.css('display', 'block');

        var aboveTransform = this._generateAbovePageTransform(Math.min(options.maxDistance, options.distance));
        var behindStyle = this._generateBehindPageStyle(Math.min(options.maxDistance, options.distance));

        animit(this._mainPage[0]).queue({ transform: aboveTransform }).play();

        animit(this._menuPage[0]).queue(behindStyle).play();
      },

      _generateAbovePageTransform: function _generateAbovePageTransform(distance) {
        var x = this._isRight ? -distance : distance;
        var aboveTransform = 'translate3d(' + x + 'px, 0, 0)';

        return aboveTransform;
      },

      _generateBehindPageStyle: function _generateBehindPageStyle(distance) {
        var behindX = this._isRight ? -distance : distance;
        var behindTransform = 'translate3d(' + behindX + 'px, 0, 0)';

        return {
          transform: behindTransform
        };
      },

      copy: function copy() {
        return new PushSlidingMenuAnimator();
      }
    });

    return PushSlidingMenuAnimator;
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.factory('RevealSlidingMenuAnimator', ['SlidingMenuAnimator', function (SlidingMenuAnimator) {

    var RevealSlidingMenuAnimator = SlidingMenuAnimator.extend({

      _blackMask: undefined,

      _isRight: false,

      _menuPage: undefined,
      _element: undefined,
      _mainPage: undefined,

      /**
       * @param {jqLite} element "ons-sliding-menu" or "ons-split-view" element
       * @param {jqLite} mainPage
       * @param {jqLite} menuPage
       * @param {Object} options
       * @param {String} options.width "width" style value
       * @param {Boolean} options.isRight
       */
      setup: function setup(element, mainPage, menuPage, options) {
        this._element = element;
        this._menuPage = menuPage;
        this._mainPage = mainPage;
        this._isRight = !!options.isRight;
        this._width = options.width || '90%';

        mainPage.css({
          boxShadow: '0px 0 10px 0px rgba(0, 0, 0, 0.2)'
        });

        menuPage.css({
          width: options.width,
          opacity: 0.9,
          display: 'none'
        });

        if (this._isRight) {
          menuPage.css({
            right: '0px',
            left: 'auto'
          });
        } else {
          menuPage.css({
            right: 'auto',
            left: '0px'
          });
        }

        this._blackMask = angular.element('<div></div>').css({
          backgroundColor: 'black',
          top: '0px',
          left: '0px',
          right: '0px',
          bottom: '0px',
          position: 'absolute',
          display: 'none'
        });

        element.prepend(this._blackMask);

        // Dirty fix for broken rendering bug on android 4.x.
        animit(mainPage[0]).queue({ transform: 'translate3d(0, 0, 0)' }).play();
      },

      /**
       * @param {Object} options
       * @param {Boolean} options.isOpened
       * @param {String} options.width
       */
      onResized: function onResized(options) {
        this._width = options.width;
        this._menuPage.css('width', this._width);

        if (options.isOpened) {
          var max = this._menuPage[0].clientWidth;

          var aboveTransform = this._generateAbovePageTransform(max);
          var behindStyle = this._generateBehindPageStyle(max);

          animit(this._mainPage[0]).queue({ transform: aboveTransform }).play();
          animit(this._menuPage[0]).queue(behindStyle).play();
        }
      },

      /**
       * @param {jqLite} element "ons-sliding-menu" or "ons-split-view" element
       * @param {jqLite} mainPage
       * @param {jqLite} menuPage
       */
      destroy: function destroy() {
        if (this._blackMask) {
          this._blackMask.remove();
          this._blackMask = null;
        }

        if (this._mainPage) {
          this._mainPage.attr('style', '');
        }

        if (this._menuPage) {
          this._menuPage.attr('style', '');
        }

        this._mainPage = this._menuPage = this._element = undefined;
      },

      /**
       * @param {Function} callback
       * @param {Boolean} instant
       */
      openMenu: function openMenu(callback, instant) {
        var duration = instant === true ? 0.0 : this.duration;
        var delay = instant === true ? 0.0 : this.delay;

        this._menuPage.css('display', 'block');
        this._blackMask.css('display', 'block');

        var max = this._menuPage[0].clientWidth;

        var aboveTransform = this._generateAbovePageTransform(max);
        var behindStyle = this._generateBehindPageStyle(max);

        setTimeout(function () {

          animit(this._mainPage[0]).wait(delay).queue({
            transform: aboveTransform
          }, {
            duration: duration,
            timing: this.timing
          }).queue(function (done) {
            callback();
            done();
          }).play();

          animit(this._menuPage[0]).wait(delay).queue(behindStyle, {
            duration: duration,
            timing: this.timing
          }).play();
        }.bind(this), 1000 / 60);
      },

      /**
       * @param {Function} callback
       * @param {Boolean} instant
       */
      closeMenu: function closeMenu(callback, instant) {
        var duration = instant === true ? 0.0 : this.duration;
        var delay = instant === true ? 0.0 : this.delay;

        this._blackMask.css('display', 'block');

        var aboveTransform = this._generateAbovePageTransform(0);
        var behindStyle = this._generateBehindPageStyle(0);

        setTimeout(function () {

          animit(this._mainPage[0]).wait(delay).queue({
            transform: aboveTransform
          }, {
            duration: duration,
            timing: this.timing
          }).queue({
            transform: 'translate3d(0, 0, 0)'
          }).queue(function (done) {
            this._menuPage.css('display', 'none');
            callback();
            done();
          }.bind(this)).play();

          animit(this._menuPage[0]).wait(delay).queue(behindStyle, {
            duration: duration,
            timing: this.timing
          }).queue(function (done) {
            done();
          }).play();
        }.bind(this), 1000 / 60);
      },

      /**
       * @param {Object} options
       * @param {Number} options.distance
       * @param {Number} options.maxDistance
       */
      translateMenu: function translateMenu(options) {

        this._menuPage.css('display', 'block');
        this._blackMask.css('display', 'block');

        var aboveTransform = this._generateAbovePageTransform(Math.min(options.maxDistance, options.distance));
        var behindStyle = this._generateBehindPageStyle(Math.min(options.maxDistance, options.distance));
        delete behindStyle.opacity;

        animit(this._mainPage[0]).queue({ transform: aboveTransform }).play();

        animit(this._menuPage[0]).queue(behindStyle).play();
      },

      _generateAbovePageTransform: function _generateAbovePageTransform(distance) {
        var x = this._isRight ? -distance : distance;
        var aboveTransform = 'translate3d(' + x + 'px, 0, 0)';

        return aboveTransform;
      },

      _generateBehindPageStyle: function _generateBehindPageStyle(distance) {
        var max = this._menuPage[0].getBoundingClientRect().width;

        var behindDistance = (distance - max) / max * 10;
        behindDistance = isNaN(behindDistance) ? 0 : Math.max(Math.min(behindDistance, 0), -10);

        var behindX = this._isRight ? -behindDistance : behindDistance;
        var behindTransform = 'translate3d(' + behindX + '%, 0, 0)';
        var opacity = 1 + behindDistance / 100;

        return {
          transform: behindTransform,
          opacity: opacity
        };
      },

      copy: function copy() {
        return new RevealSlidingMenuAnimator();
      }
    });

    return RevealSlidingMenuAnimator;
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  var module = angular.module('onsen');

  var SlidingMenuViewModel = Class.extend({

    /**
     * @member Number
     */
    _distance: 0,

    /**
     * @member Number
     */
    _maxDistance: undefined,

    /**
     * @param {Object} options
     * @param {Number} maxDistance
     */
    init: function init(options) {
      if (!angular.isNumber(options.maxDistance)) {
        throw new Error('options.maxDistance must be number');
      }

      this.setMaxDistance(options.maxDistance);
    },

    /**
     * @param {Number} maxDistance
     */
    setMaxDistance: function setMaxDistance(maxDistance) {
      if (maxDistance <= 0) {
        throw new Error('maxDistance must be greater then zero.');
      }

      if (this.isOpened()) {
        this._distance = maxDistance;
      }
      this._maxDistance = maxDistance;
    },

    /**
     * @return {Boolean}
     */
    shouldOpen: function shouldOpen() {
      return !this.isOpened() && this._distance >= this._maxDistance / 2;
    },

    /**
     * @return {Boolean}
     */
    shouldClose: function shouldClose() {
      return !this.isClosed() && this._distance < this._maxDistance / 2;
    },

    openOrClose: function openOrClose(options) {
      if (this.shouldOpen()) {
        this.open(options);
      } else if (this.shouldClose()) {
        this.close(options);
      }
    },

    close: function close(options) {
      var callback = options.callback || function () {};

      if (!this.isClosed()) {
        this._distance = 0;
        this.emit('close', options);
      } else {
        callback();
      }
    },

    open: function open(options) {
      var callback = options.callback || function () {};

      if (!this.isOpened()) {
        this._distance = this._maxDistance;
        this.emit('open', options);
      } else {
        callback();
      }
    },

    /**
     * @return {Boolean}
     */
    isClosed: function isClosed() {
      return this._distance === 0;
    },

    /**
     * @return {Boolean}
     */
    isOpened: function isOpened() {
      return this._distance === this._maxDistance;
    },

    /**
     * @return {Number}
     */
    getX: function getX() {
      return this._distance;
    },

    /**
     * @return {Number}
     */
    getMaxDistance: function getMaxDistance() {
      return this._maxDistance;
    },

    /**
     * @param {Number} x
     */
    translate: function translate(x) {
      this._distance = Math.max(1, Math.min(this._maxDistance - 1, x));

      var options = {
        distance: this._distance,
        maxDistance: this._maxDistance
      };

      this.emit('translate', options);
    },

    toggle: function toggle() {
      if (this.isClosed()) {
        this.open();
      } else {
        this.close();
      }
    }
  });
  MicroEvent.mixin(SlidingMenuViewModel);

  module.factory('SlidingMenuView', ['$onsen', '$compile', '$parse', 'AnimationChooser', 'SlidingMenuAnimator', 'RevealSlidingMenuAnimator', 'PushSlidingMenuAnimator', 'OverlaySlidingMenuAnimator', function ($onsen, $compile, $parse, AnimationChooser, SlidingMenuAnimator, RevealSlidingMenuAnimator, PushSlidingMenuAnimator, OverlaySlidingMenuAnimator) {

    var SlidingMenuView = Class.extend({
      _scope: undefined,
      _attrs: undefined,

      _element: undefined,
      _menuPage: undefined,
      _mainPage: undefined,

      _doorLock: undefined,

      _isRightMenu: false,

      init: function init(scope, element, attrs) {
        this._scope = scope;
        this._attrs = attrs;
        this._element = element;

        this._menuPage = angular.element(element[0].querySelector('.onsen-sliding-menu__menu'));
        this._mainPage = angular.element(element[0].querySelector('.onsen-sliding-menu__main'));

        this._doorLock = new ons._DoorLock();

        this._isRightMenu = attrs.side === 'right';

        // Close menu on tap event.
        this._mainPageGestureDetector = new ons.GestureDetector(this._mainPage[0]);
        this._boundOnTap = this._onTap.bind(this);

        var maxDistance = this._normalizeMaxSlideDistanceAttr();
        this._logic = new SlidingMenuViewModel({ maxDistance: Math.max(maxDistance, 1) });
        this._logic.on('translate', this._translate.bind(this));
        this._logic.on('open', function (options) {
          this._open(options);
        }.bind(this));
        this._logic.on('close', function (options) {
          this._close(options);
        }.bind(this));

        attrs.$observe('maxSlideDistance', this._onMaxSlideDistanceChanged.bind(this));
        attrs.$observe('swipeable', this._onSwipeableChanged.bind(this));

        this._boundOnWindowResize = this._onWindowResize.bind(this);
        window.addEventListener('resize', this._boundOnWindowResize);

        this._boundHandleEvent = this._handleEvent.bind(this);
        this._bindEvents();

        if (attrs.mainPage) {
          this.setMainPage(attrs.mainPage);
        }

        if (attrs.menuPage) {
          this.setMenuPage(attrs.menuPage);
        }

        this._deviceBackButtonHandler = ons._deviceBackButtonDispatcher.createHandler(this._element[0], this._onDeviceBackButton.bind(this));

        var unlock = this._doorLock.lock();

        window.setTimeout(function () {
          var maxDistance = this._normalizeMaxSlideDistanceAttr();
          this._logic.setMaxDistance(maxDistance);

          this._menuPage.css({ opacity: 1 });

          var animationChooser = new AnimationChooser({
            animators: SlidingMenuView._animatorDict,
            baseClass: SlidingMenuAnimator,
            baseClassName: 'SlidingMenuAnimator',
            defaultAnimation: attrs.type,
            defaultAnimationOptions: $parse(attrs.animationOptions)()
          });
          this._animator = animationChooser.newAnimator();
          this._animator.setup(this._element, this._mainPage, this._menuPage, {
            isRight: this._isRightMenu,
            width: this._attrs.maxSlideDistance || '90%'
          });

          unlock();
        }.bind(this), 400);

        scope.$on('$destroy', this._destroy.bind(this));

        this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], ['init', 'show', 'hide', 'destroy']);

        if (!attrs.swipeable) {
          this.setSwipeable(true);
        }
      },

      getDeviceBackButtonHandler: function getDeviceBackButtonHandler() {
        return this._deviceBackButtonHandler;
      },

      _onDeviceBackButton: function _onDeviceBackButton(event) {
        if (this.isMenuOpened()) {
          this.closeMenu();
        } else {
          event.callParentHandler();
        }
      },

      _onTap: function _onTap() {
        if (this.isMenuOpened()) {
          this.closeMenu();
        }
      },

      _refreshMenuPageWidth: function _refreshMenuPageWidth() {
        var width = 'maxSlideDistance' in this._attrs ? this._attrs.maxSlideDistance : '90%';

        if (this._animator) {
          this._animator.onResized({
            isOpened: this._logic.isOpened(),
            width: width
          });
        }
      },

      _destroy: function _destroy() {
        this.emit('destroy');

        this._clearDerivingEvents();

        this._deviceBackButtonHandler.destroy();
        window.removeEventListener('resize', this._boundOnWindowResize);

        this._mainPageGestureDetector.off('tap', this._boundOnTap);
        this._element = this._scope = this._attrs = null;
      },

      _onSwipeableChanged: function _onSwipeableChanged(swipeable) {
        swipeable = swipeable === '' || swipeable === undefined || swipeable == 'true';

        this.setSwipeable(swipeable);
      },

      /**
       * @param {Boolean} enabled
       */
      setSwipeable: function setSwipeable(enabled) {
        if (enabled) {
          this._activateGestureDetector();
        } else {
          this._deactivateGestureDetector();
        }
      },

      _onWindowResize: function _onWindowResize() {
        this._recalculateMAX();
        this._refreshMenuPageWidth();
      },

      _onMaxSlideDistanceChanged: function _onMaxSlideDistanceChanged() {
        this._recalculateMAX();
        this._refreshMenuPageWidth();
      },

      /**
       * @return {Number}
       */
      _normalizeMaxSlideDistanceAttr: function _normalizeMaxSlideDistanceAttr() {
        var maxDistance = this._attrs.maxSlideDistance;

        if (!('maxSlideDistance' in this._attrs)) {
          maxDistance = 0.9 * this._mainPage[0].clientWidth;
        } else if (typeof maxDistance == 'string') {
          if (maxDistance.indexOf('px', maxDistance.length - 2) !== -1) {
            maxDistance = parseInt(maxDistance.replace('px', ''), 10);
          } else if (maxDistance.indexOf('%', maxDistance.length - 1) > 0) {
            maxDistance = maxDistance.replace('%', '');
            maxDistance = parseFloat(maxDistance) / 100 * this._mainPage[0].clientWidth;
          }
        } else {
          throw new Error('invalid state');
        }

        return maxDistance;
      },

      _recalculateMAX: function _recalculateMAX() {
        var maxDistance = this._normalizeMaxSlideDistanceAttr();

        if (maxDistance) {
          this._logic.setMaxDistance(parseInt(maxDistance, 10));
        }
      },

      _activateGestureDetector: function _activateGestureDetector() {
        this._gestureDetector.on('touch dragleft dragright swipeleft swiperight release', this._boundHandleEvent);
      },

      _deactivateGestureDetector: function _deactivateGestureDetector() {
        this._gestureDetector.off('touch dragleft dragright swipeleft swiperight release', this._boundHandleEvent);
      },

      _bindEvents: function _bindEvents() {
        this._gestureDetector = new ons.GestureDetector(this._element[0], {
          dragMinDistance: 1
        });
      },

      _appendMainPage: function _appendMainPage(pageUrl, templateHTML) {
        var pageScope = this._scope.$new();
        var pageContent = angular.element(templateHTML);
        var link = $compile(pageContent);

        this._mainPage.append(pageContent);

        if (this._currentPageElement) {
          this._currentPageElement.remove();
          this._currentPageScope.$destroy();
        }

        link(pageScope);

        this._currentPageElement = pageContent;
        this._currentPageScope = pageScope;
        this._currentPageUrl = pageUrl;
        this._currentPageElement[0]._show();
      },

      /**
       * @param {String}
       */
      _appendMenuPage: function _appendMenuPage(templateHTML) {
        var pageScope = this._scope.$new();
        var pageContent = angular.element(templateHTML);
        var link = $compile(pageContent);

        this._menuPage.append(pageContent);

        if (this._currentMenuPageScope) {
          this._currentMenuPageScope.$destroy();
          this._currentMenuPageElement.remove();
        }

        link(pageScope);

        this._currentMenuPageElement = pageContent;
        this._currentMenuPageScope = pageScope;
      },

      /**
       * @param {String} page
       * @param {Object} options
       * @param {Boolean} [options.closeMenu]
       * @param {Boolean} [options.callback]
       */
      setMenuPage: function setMenuPage(page, options) {
        if (page) {
          options = options || {};
          options.callback = options.callback || function () {};

          var self = this;
          $onsen.getPageHTMLAsync(page).then(function (html) {
            self._appendMenuPage(angular.element(html));
            if (options.closeMenu) {
              self.close();
            }
            options.callback();
          }, function () {
            throw new Error('Page is not found: ' + page);
          });
        } else {
          throw new Error('cannot set undefined page');
        }
      },

      /**
       * @param {String} pageUrl
       * @param {Object} options
       * @param {Boolean} [options.closeMenu]
       * @param {Boolean} [options.callback]
       */
      setMainPage: function setMainPage(pageUrl, options) {
        options = options || {};
        options.callback = options.callback || function () {};

        var done = function () {
          if (options.closeMenu) {
            this.close();
          }
          options.callback();
        }.bind(this);

        if (this._currentPageUrl === pageUrl) {
          done();
          return;
        }

        if (pageUrl) {
          var self = this;
          $onsen.getPageHTMLAsync(pageUrl).then(function (html) {
            self._appendMainPage(pageUrl, html);
            done();
          }, function () {
            throw new Error('Page is not found: ' + page);
          });
        } else {
          throw new Error('cannot set undefined page');
        }
      },

      _handleEvent: function _handleEvent(event) {

        if (this._doorLock.isLocked()) {
          return;
        }

        if (this._isInsideIgnoredElement(event.target)) {
          this._deactivateGestureDetector();
        }

        switch (event.type) {
          case 'dragleft':
          case 'dragright':

            if (this._logic.isClosed() && !this._isInsideSwipeTargetArea(event)) {
              return;
            }

            event.gesture.preventDefault();

            var deltaX = event.gesture.deltaX;
            var deltaDistance = this._isRightMenu ? -deltaX : deltaX;

            var startEvent = event.gesture.startEvent;

            if (!('isOpened' in startEvent)) {
              startEvent.isOpened = this._logic.isOpened();
            }

            if (deltaDistance < 0 && this._logic.isClosed()) {
              break;
            }

            if (deltaDistance > 0 && this._logic.isOpened()) {
              break;
            }

            var distance = startEvent.isOpened ? deltaDistance + this._logic.getMaxDistance() : deltaDistance;

            this._logic.translate(distance);

            break;

          case 'swipeleft':
            event.gesture.preventDefault();

            if (this._logic.isClosed() && !this._isInsideSwipeTargetArea(event)) {
              return;
            }

            if (this._isRightMenu) {
              this.open();
            } else {
              this.close();
            }

            event.gesture.stopDetect();
            break;

          case 'swiperight':
            event.gesture.preventDefault();

            if (this._logic.isClosed() && !this._isInsideSwipeTargetArea(event)) {
              return;
            }

            if (this._isRightMenu) {
              this.close();
            } else {
              this.open();
            }

            event.gesture.stopDetect();
            break;

          case 'release':
            this._lastDistance = null;

            if (this._logic.shouldOpen()) {
              this.open();
            } else if (this._logic.shouldClose()) {
              this.close();
            }

            break;
        }
      },

      /**
       * @param {jqLite} element
       * @return {Boolean}
       */
      _isInsideIgnoredElement: function _isInsideIgnoredElement(element) {
        do {
          if (element.getAttribute && element.getAttribute('sliding-menu-ignore')) {
            return true;
          }
          element = element.parentNode;
        } while (element);

        return false;
      },

      _isInsideSwipeTargetArea: function _isInsideSwipeTargetArea(event) {
        var x = event.gesture.center.pageX;

        if (!('_swipeTargetWidth' in event.gesture.startEvent)) {
          event.gesture.startEvent._swipeTargetWidth = this._getSwipeTargetWidth();
        }

        var targetWidth = event.gesture.startEvent._swipeTargetWidth;
        return this._isRightMenu ? this._mainPage[0].clientWidth - x < targetWidth : x < targetWidth;
      },

      _getSwipeTargetWidth: function _getSwipeTargetWidth() {
        var targetWidth = this._attrs.swipeTargetWidth;

        if (typeof targetWidth == 'string') {
          targetWidth = targetWidth.replace('px', '');
        }

        var width = parseInt(targetWidth, 10);
        if (width < 0 || !targetWidth) {
          return this._mainPage[0].clientWidth;
        } else {
          return width;
        }
      },

      closeMenu: function closeMenu() {
        return this.close.apply(this, arguments);
      },

      /**
       * Close sliding-menu page.
       *
       * @param {Object} options
       */
      close: function close(options) {
        options = options || {};
        options = typeof options == 'function' ? { callback: options } : options;

        if (!this._logic.isClosed()) {
          this.emit('preclose', {
            slidingMenu: this
          });

          this._doorLock.waitUnlock(function () {
            this._logic.close(options);
          }.bind(this));
        }
      },

      _close: function _close(options) {
        var callback = options.callback || function () {},
            unlock = this._doorLock.lock(),
            instant = options.animation == 'none';

        this._animator.closeMenu(function () {
          unlock();

          this._mainPage.children().css('pointer-events', '');
          this._mainPageGestureDetector.off('tap', this._boundOnTap);

          this.emit('postclose', {
            slidingMenu: this
          });

          callback();
        }.bind(this), instant);
      },

      /**
       * Open sliding-menu page.
       *
       * @param {Object} [options]
       * @param {Function} [options.callback]
       */
      openMenu: function openMenu() {
        return this.open.apply(this, arguments);
      },

      /**
       * Open sliding-menu page.
       *
       * @param {Object} [options]
       * @param {Function} [options.callback]
       */
      open: function open(options) {
        options = options || {};
        options = typeof options == 'function' ? { callback: options } : options;

        this.emit('preopen', {
          slidingMenu: this
        });

        this._doorLock.waitUnlock(function () {
          this._logic.open(options);
        }.bind(this));
      },

      _open: function _open(options) {
        var callback = options.callback || function () {},
            unlock = this._doorLock.lock(),
            instant = options.animation == 'none';

        this._animator.openMenu(function () {
          unlock();

          this._mainPage.children().css('pointer-events', 'none');
          this._mainPageGestureDetector.on('tap', this._boundOnTap);

          this.emit('postopen', {
            slidingMenu: this
          });

          callback();
        }.bind(this), instant);
      },

      /**
       * Toggle sliding-menu page.
       * @param {Object} [options]
       * @param {Function} [options.callback]
       */
      toggle: function toggle(options) {
        if (this._logic.isClosed()) {
          this.open(options);
        } else {
          this.close(options);
        }
      },

      /**
       * Toggle sliding-menu page.
       */
      toggleMenu: function toggleMenu() {
        return this.toggle.apply(this, arguments);
      },

      /**
       * @return {Boolean}
       */
      isMenuOpened: function isMenuOpened() {
        return this._logic.isOpened();
      },

      /**
       * @param {Object} event
       */
      _translate: function _translate(event) {
        this._animator.translateMenu(event);
      }
    });

    // Preset sliding menu animators.
    SlidingMenuView._animatorDict = {
      'default': RevealSlidingMenuAnimator,
      'overlay': OverlaySlidingMenuAnimator,
      'reveal': RevealSlidingMenuAnimator,
      'push': PushSlidingMenuAnimator
    };

    /**
     * @param {String} name
     * @param {Function} Animator
     */
    SlidingMenuView.registerAnimator = function (name, Animator) {
      if (!(Animator.prototype instanceof SlidingMenuAnimator)) {
        throw new Error('"Animator" param must inherit SlidingMenuAnimator');
      }

      this._animatorDict[name] = Animator;
    };

    MicroEvent.mixin(SlidingMenuView);

    return SlidingMenuView;
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.factory('SlidingMenuAnimator', function () {
    return Class.extend({

      delay: 0,
      duration: 0.4,
      timing: 'cubic-bezier(.1, .7, .1, 1)',

      /**
       * @param {Object} options
       * @param {String} options.timing
       * @param {Number} options.duration
       * @param {Number} options.delay
       */
      init: function init(options) {
        options = options || {};

        this.timing = options.timing || this.timing;
        this.duration = options.duration !== undefined ? options.duration : this.duration;
        this.delay = options.delay !== undefined ? options.delay : this.delay;
      },

      /**
       * @param {jqLite} element "ons-sliding-menu" or "ons-split-view" element
       * @param {jqLite} mainPage
       * @param {jqLite} menuPage
       * @param {Object} options
       * @param {String} options.width "width" style value
       * @param {Boolean} options.isRight
       */
      setup: function setup(element, mainPage, menuPage, options) {},

      /**
       * @param {Object} options
       * @param {Boolean} options.isRight
       * @param {Boolean} options.isOpened
       * @param {String} options.width
       */
      onResized: function onResized(options) {},

      /**
       * @param {Function} callback
       */
      openMenu: function openMenu(callback) {},

      /**
       * @param {Function} callback
       */
      closeClose: function closeClose(callback) {},

      /**
       */
      destroy: function destroy() {},

      /**
       * @param {Object} options
       * @param {Number} options.distance
       * @param {Number} options.maxDistance
       */
      translateMenu: function translateMenu(mainPage, menuPage, options) {},

      /**
       * @return {SlidingMenuAnimator}
       */
      copy: function copy() {
        throw new Error('Override copy method.');
      }
    });
  });
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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
(function () {
  'use strict';

  var module = angular.module('onsen');

  module.factory('SplitView', ['$compile', 'RevealSlidingMenuAnimator', '$onsen', '$onsGlobal', function ($compile, RevealSlidingMenuAnimator, $onsen, $onsGlobal) {
    var SPLIT_MODE = 0;
    var COLLAPSE_MODE = 1;
    var MAIN_PAGE_RATIO = 0.9;

    var SplitView = Class.extend({

      init: function init(scope, element, attrs) {
        element.addClass('onsen-sliding-menu');

        this._element = element;
        this._scope = scope;
        this._attrs = attrs;

        this._mainPage = angular.element(element[0].querySelector('.onsen-split-view__main'));
        this._secondaryPage = angular.element(element[0].querySelector('.onsen-split-view__secondary'));

        this._max = this._mainPage[0].clientWidth * MAIN_PAGE_RATIO;
        this._mode = SPLIT_MODE;
        this._doorLock = new ons._DoorLock();

        this._doSplit = false;
        this._doCollapse = false;

        $onsGlobal.orientation.on('change', this._onResize.bind(this));

        this._animator = new RevealSlidingMenuAnimator();

        this._element.css('display', 'none');

        if (attrs.mainPage) {
          this.setMainPage(attrs.mainPage);
        }

        if (attrs.secondaryPage) {
          this.setSecondaryPage(attrs.secondaryPage);
        }

        var unlock = this._doorLock.lock();

        this._considerChangingCollapse();
        this._setSize();

        setTimeout(function () {
          this._element.css('display', 'block');
          unlock();
        }.bind(this), 1000 / 60 * 2);

        scope.$on('$destroy', this._destroy.bind(this));

        this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], ['init', 'show', 'hide', 'destroy']);
      },

      /**
       * @param {String} templateHTML
       */
      _appendSecondPage: function _appendSecondPage(templateHTML) {
        var pageScope = this._scope.$new();
        var pageContent = $compile(templateHTML)(pageScope);

        this._secondaryPage.append(pageContent);

        if (this._currentSecondaryPageElement) {
          this._currentSecondaryPageElement.remove();
          this._currentSecondaryPageScope.$destroy();
        }

        this._currentSecondaryPageElement = pageContent;
        this._currentSecondaryPageScope = pageScope;
      },

      /**
       * @param {String} templateHTML
       */
      _appendMainPage: function _appendMainPage(templateHTML) {
        var pageScope = this._scope.$new();
        var pageContent = $compile(templateHTML)(pageScope);

        this._mainPage.append(pageContent);

        if (this._currentPage) {
          this._currentPageScope.$destroy();
        }

        this._currentPage = pageContent;
        this._currentPageScope = pageScope;
        this._currentPage[0]._show();
      },

      /**
       * @param {String} page
       */
      setSecondaryPage: function setSecondaryPage(page) {
        if (page) {
          $onsen.getPageHTMLAsync(page).then(function (html) {
            this._appendSecondPage(angular.element(html.trim()));
          }.bind(this), function () {
            throw new Error('Page is not found: ' + page);
          });
        } else {
          throw new Error('cannot set undefined page');
        }
      },

      /**
       * @param {String} page
       */
      setMainPage: function setMainPage(page) {
        if (page) {
          $onsen.getPageHTMLAsync(page).then(function (html) {
            this._appendMainPage(angular.element(html.trim()));
          }.bind(this), function () {
            throw new Error('Page is not found: ' + page);
          });
        } else {
          throw new Error('cannot set undefined page');
        }
      },

      _onResize: function _onResize() {
        var lastMode = this._mode;

        this._considerChangingCollapse();

        if (lastMode === COLLAPSE_MODE && this._mode === COLLAPSE_MODE) {
          this._animator.onResized({
            isOpened: false,
            width: '90%'
          });
        }

        this._max = this._mainPage[0].clientWidth * MAIN_PAGE_RATIO;
      },

      _considerChangingCollapse: function _considerChangingCollapse() {
        var should = this._shouldCollapse();

        if (should && this._mode !== COLLAPSE_MODE) {
          this._fireUpdateEvent();
          if (this._doSplit) {
            this._activateSplitMode();
          } else {
            this._activateCollapseMode();
          }
        } else if (!should && this._mode === COLLAPSE_MODE) {
          this._fireUpdateEvent();
          if (this._doCollapse) {
            this._activateCollapseMode();
          } else {
            this._activateSplitMode();
          }
        }

        this._doCollapse = this._doSplit = false;
      },

      update: function update() {
        this._fireUpdateEvent();

        var should = this._shouldCollapse();

        if (this._doSplit) {
          this._activateSplitMode();
        } else if (this._doCollapse) {
          this._activateCollapseMode();
        } else if (should) {
          this._activateCollapseMode();
        } else if (!should) {
          this._activateSplitMode();
        }

        this._doSplit = this._doCollapse = false;
      },

      _getOrientation: function _getOrientation() {
        if ($onsGlobal.orientation.isPortrait()) {
          return 'portrait';
        } else {
          return 'landscape';
        }
      },

      getCurrentMode: function getCurrentMode() {
        if (this._mode === COLLAPSE_MODE) {
          return 'collapse';
        } else {
          return 'split';
        }
      },

      _shouldCollapse: function _shouldCollapse() {
        var c = 'portrait';
        if (typeof this._attrs.collapse === 'string') {
          c = this._attrs.collapse.trim();
        }

        if (c == 'portrait') {
          return $onsGlobal.orientation.isPortrait();
        } else if (c == 'landscape') {
          return $onsGlobal.orientation.isLandscape();
        } else if (c.substr(0, 5) == 'width') {
          var num = c.split(' ')[1];
          if (num.indexOf('px') >= 0) {
            num = num.substr(0, num.length - 2);
          }

          var width = window.innerWidth;

          return isNumber(num) && width < num;
        } else {
          var mq = window.matchMedia(c);
          return mq.matches;
        }
      },

      _setSize: function _setSize() {
        if (this._mode === SPLIT_MODE) {
          if (!this._attrs.mainPageWidth) {
            this._attrs.mainPageWidth = '70';
          }

          var secondarySize = 100 - this._attrs.mainPageWidth.replace('%', '');
          this._secondaryPage.css({
            width: secondarySize + '%',
            opacity: 1
          });

          this._mainPage.css({
            width: this._attrs.mainPageWidth + '%'
          });

          this._mainPage.css('left', secondarySize + '%');
        }
      },

      _fireEvent: function _fireEvent(name) {
        this.emit(name, {
          splitView: this,
          width: window.innerWidth,
          orientation: this._getOrientation()
        });
      },

      _fireUpdateEvent: function _fireUpdateEvent() {
        var that = this;

        this.emit('update', {
          splitView: this,
          shouldCollapse: this._shouldCollapse(),
          currentMode: this.getCurrentMode(),
          split: function split() {
            that._doSplit = true;
            that._doCollapse = false;
          },
          collapse: function collapse() {
            that._doSplit = false;
            that._doCollapse = true;
          },
          width: window.innerWidth,
          orientation: this._getOrientation()
        });
      },

      _activateCollapseMode: function _activateCollapseMode() {
        if (this._mode !== COLLAPSE_MODE) {
          this._fireEvent('precollapse');
          this._secondaryPage.attr('style', '');
          this._mainPage.attr('style', '');

          this._mode = COLLAPSE_MODE;

          this._animator.setup(this._element, this._mainPage, this._secondaryPage, { isRight: false, width: '90%' });

          this._fireEvent('postcollapse');
        }
      },

      _activateSplitMode: function _activateSplitMode() {
        if (this._mode !== SPLIT_MODE) {
          this._fireEvent('presplit');

          this._animator.destroy();

          this._secondaryPage.attr('style', '');
          this._mainPage.attr('style', '');

          this._mode = SPLIT_MODE;
          this._setSize();

          this._fireEvent('postsplit');
        }
      },

      _destroy: function _destroy() {
        this.emit('destroy');

        this._clearDerivingEvents();

        this._element = null;
        this._scope = null;
      }
    });

    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    MicroEvent.mixin(SplitView);

    return SplitView;
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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
(function () {
  'use strict';

  angular.module('onsen').factory('SplitterContent', ['$onsen', '$compile', function ($onsen, $compile) {

    var SplitterContent = Class.extend({

      init: function init(scope, element, attrs) {
        var _this = this;

        this._element = element;
        this._scope = scope;
        this._attrs = attrs;

        this.load = function () {
          var _element$;

          _this._pageScope && _this._pageScope.$destroy();
          return (_element$ = _this._element[0]).load.apply(_element$, arguments);
        };
        scope.$on('$destroy', this._destroy.bind(this));
      },

      _link: function _link(fragment, done) {
        this._pageScope = this._scope.$new();
        $compile(fragment)(this._pageScope);

        this._pageScope.$evalAsync(function () {
          return done(fragment);
        });
      },

      _destroy: function _destroy() {
        this.emit('destroy');
        this._element = this._scope = this._attrs = this.load = this._pageScope = null;
      }
    });

    MicroEvent.mixin(SplitterContent);
    $onsen.derivePropertiesFromElement(SplitterContent, ['page']);

    return SplitterContent;
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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
(function () {
  'use strict';

  angular.module('onsen').factory('SplitterSide', ['$onsen', '$compile', function ($onsen, $compile) {

    var SplitterSide = Class.extend({

      init: function init(scope, element, attrs) {
        var _this = this;

        this._element = element;
        this._scope = scope;
        this._attrs = attrs;

        this._clearDerivingMethods = $onsen.deriveMethods(this, this._element[0], ['open', 'close', 'toggle']);

        this.load = function () {
          var _element$;

          _this._pageScope && _this._pageScope.$destroy();
          return (_element$ = _this._element[0]).load.apply(_element$, arguments);
        };

        this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], ['modechange', 'preopen', 'preclose', 'postopen', 'postclose'], function (detail) {
          return detail.side ? angular.extend(detail, { side: _this }) : detail;
        });

        scope.$on('$destroy', this._destroy.bind(this));
      },

      _link: function _link(fragment, done) {
        var link = $compile(fragment);
        this._pageScope = this._scope.$new();
        link(this._pageScope);

        this._pageScope.$evalAsync(function () {
          return done(fragment);
        });
      },

      _destroy: function _destroy() {
        this.emit('destroy');

        this._clearDerivingMethods();
        this._clearDerivingEvents();

        this._element = this._scope = this._attrs = this.load = this._pageScope = null;
      }
    });

    MicroEvent.mixin(SplitterSide);
    $onsen.derivePropertiesFromElement(SplitterSide, ['page', 'mode', 'isOpen']);

    return SplitterSide;
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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
(function () {
  'use strict';

  angular.module('onsen').factory('Splitter', ['$onsen', function ($onsen) {

    var Splitter = Class.extend({
      init: function init(scope, element, attrs) {
        this._element = element;
        this._scope = scope;
        this._attrs = attrs;
        scope.$on('$destroy', this._destroy.bind(this));
      },

      _destroy: function _destroy() {
        this.emit('destroy');
        this._element = this._scope = this._attrs = null;
      }
    });

    MicroEvent.mixin(Splitter);
    $onsen.derivePropertiesFromElement(Splitter, ['onDeviceBackButton']);

    ['left', 'right', 'content', 'mask'].forEach(function (prop, i) {
      Object.defineProperty(Splitter.prototype, prop, {
        get: function get() {
          var tagName = 'ons-splitter-' + (i < 2 ? 'side' : prop);
          return angular.element(this._element[0][prop]).data(tagName);
        }
      });
    });

    return Splitter;
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  angular.module('onsen').factory('SwitchView', ['$parse', '$onsen', function ($parse, $onsen) {

    var SwitchView = Class.extend({

      /**
       * @param {jqLite} element
       * @param {Object} scope
       * @param {Object} attrs
       */
      init: function init(element, scope, attrs) {
        var _this = this;

        this._element = element;
        this._checkbox = angular.element(element[0].querySelector('input[type=checkbox]'));
        this._scope = scope;

        this._checkbox.on('change', function () {
          _this.emit('change', { 'switch': _this, value: _this._checkbox[0].checked, isInteractive: true });
        });

        this._prepareNgModel(element, scope, attrs);

        this._scope.$on('$destroy', function () {
          _this.emit('destroy');
          _this._element = _this._checkbox = _this._scope = null;
        });
      },

      _prepareNgModel: function _prepareNgModel(element, scope, attrs) {
        var _this2 = this;

        if (attrs.ngModel) {
          var set = $parse(attrs.ngModel).assign;

          scope.$parent.$watch(attrs.ngModel, function (value) {
            _this2.checked = !!value;
          });

          this._checkbox.on('change', function (e) {
            set(scope.$parent, _this2.checked);

            if (attrs.ngChange) {
              scope.$eval(attrs.ngChange);
            }

            scope.$parent.$evalAsync();
          });
        }
      }
    });

    MicroEvent.mixin(SwitchView);
    $onsen.derivePropertiesFromElement(SwitchView, ['disabled', 'checked', 'checkbox']);

    return SwitchView;
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.value('TabbarNoneAnimator', ons._internal.TabbarNoneAnimator);
  module.value('TabbarFadeAnimator', ons._internal.TabbarFadeAnimator);
  module.value('TabbarSlideAnimator', ons._internal.TabbarSlideAnimator);

  module.factory('TabbarView', ['$onsen', '$compile', '$parse', function ($onsen, $compile, $parse) {
    var TabbarView = Class.extend({

      init: function init(scope, element, attrs) {
        if (element[0].nodeName.toLowerCase() !== 'ons-tabbar') {
          throw new Error('"element" parameter must be a "ons-tabbar" element.');
        }

        this._scope = scope;
        this._element = element;
        this._attrs = attrs;
        this._lastPageElement = null;
        this._lastPageScope = null;

        this._scope.$on('$destroy', this._destroy.bind(this));

        this._clearDerivingEvents = $onsen.deriveEvents(this, element[0], ['reactive', 'postchange', 'prechange', 'init', 'show', 'hide', 'destroy']);

        this._clearDerivingMethods = $onsen.deriveMethods(this, element[0], ['setActiveTab', 'setTabbarVisibility', 'getActiveTabIndex', 'loadPage']);
      },

      _compileAndLink: function _compileAndLink(pageElement, callback) {
        var link = $compile(pageElement);
        var pageScope = this._scope.$new();
        link(pageScope);

        pageScope.$evalAsync(function () {
          callback(pageElement);
        });
      },

      _destroy: function _destroy() {
        this.emit('destroy');

        this._clearDerivingEvents();
        this._clearDerivingMethods();

        this._element = this._scope = this._attrs = null;
      }
    });
    MicroEvent.mixin(TabbarView);

    TabbarView.registerAnimator = function (name, Animator) {
      return window.OnsTabbarElement.registerAnimator(name, Animator);
    };

    return TabbarView;
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-alert-dialog
 */

/**
 * @attribute var
 * @initonly
 * @type {String}
 * @description
 *  [en]Variable name to refer this alert dialog.[/en]
 *  [ja]このアラートダイアログを参照するための名前を指定します。[/ja]
 */

/**
 * @attribute ons-preshow
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "preshow" event is fired.[/en]
 *  [ja]"preshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-prehide
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "prehide" event is fired.[/en]
 *  [ja]"prehide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-postshow
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postshow" event is fired.[/en]
 *  [ja]"postshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-posthide
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "posthide" event is fired.[/en]
 *  [ja]"posthide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-destroy
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
 *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @method on
 * @signature on(eventName, listener)
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火された際に呼び出されるコールバックを指定します。[/ja]
 */

/**
 * @method once
 * @signature once(eventName, listener)
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出されるコールバックを指定します。[/ja]
 */

/**
 * @method off
 * @signature off(eventName, [listener])
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしlistenerパラメータが指定されなかった場合、そのイベントのリスナーが全て削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]削除するイベントリスナーの関数オブジェクトを渡します。[/ja]
 */

(function () {
  'use strict';

  /**
   * Alert dialog directive.
   */

  angular.module('onsen').directive('onsAlertDialog', ['$onsen', 'AlertDialogView', function ($onsen, AlertDialogView) {
    return {
      restrict: 'E',
      replace: false,
      scope: true,
      transclude: false,

      compile: function compile(element, attrs) {
        CustomElements.upgrade(element[0]);

        return {
          pre: function pre(scope, element, attrs) {
            CustomElements.upgrade(element[0]);
            var alertDialog = new AlertDialogView(scope, element, attrs);

            $onsen.declareVarAttribute(attrs, alertDialog);
            $onsen.registerEventHandlers(alertDialog, 'preshow prehide postshow posthide destroy');
            $onsen.addModifierMethodsForCustomElements(alertDialog, element);

            element.data('ons-alert-dialog', alertDialog);

            scope.$on('$destroy', function () {
              alertDialog._events = undefined;
              $onsen.removeModifierMethods(alertDialog);
              element.data('ons-alert-dialog', undefined);
              element = null;
            });
          },
          post: function post(scope, element) {
            $onsen.fireComponentEvent(element[0], 'init');
          }
        };
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.directive('onsBackButton', ['$onsen', '$compile', 'GenericView', 'ComponentCleaner', function ($onsen, $compile, GenericView, ComponentCleaner) {
    return {
      restrict: 'E',
      replace: false,

      compile: function compile(element, attrs) {
        CustomElements.upgrade(element[0]);

        return {
          pre: function pre(scope, element, attrs, controller, transclude) {
            CustomElements.upgrade(element[0]);
            var backButton = GenericView.register(scope, element, attrs, {
              viewKey: 'ons-back-button'
            });

            scope.$on('$destroy', function () {
              backButton._events = undefined;
              $onsen.removeModifierMethods(backButton);
              element = null;
            });

            ComponentCleaner.onDestroy(scope, function () {
              ComponentCleaner.destroyScope(scope);
              ComponentCleaner.destroyAttributes(attrs);
              element = scope = attrs = null;
            });
          },
          post: function post(scope, element) {
            $onsen.fireComponentEvent(element[0], 'init');
          }
        };
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

(function () {
  'use strict';

  angular.module('onsen').directive('onsBottomToolbar', ['$onsen', 'GenericView', function ($onsen, GenericView) {
    return {
      restrict: 'E',
      link: {
        pre: function pre(scope, element, attrs) {
          CustomElements.upgrade(element[0]);
          GenericView.register(scope, element, attrs, {
            viewKey: 'ons-bottomToolbar'
          });
        },

        post: function post(scope, element, attrs) {
          $onsen.fireComponentEvent(element[0], 'init');
        }
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-button
 */

(function () {
  'use strict';

  angular.module('onsen').directive('onsButton', ['$onsen', 'GenericView', function ($onsen, GenericView) {
    return {
      restrict: 'E',
      link: function link(scope, element, attrs) {
        CustomElements.upgrade(element[0]);
        var button = GenericView.register(scope, element, attrs, {
          viewKey: 'ons-button'
        });

        Object.defineProperty(button, 'disabled', {
          get: function get() {
            return this._element[0].disabled;
          },
          set: function set(value) {
            return this._element[0].disabled = value;
          }
        });
        $onsen.fireComponentEvent(element[0], 'init');
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-carousel
 * @description
 *   [en]Carousel component.[/en]
 *   [ja]カルーセルを表示できるコンポーネント。[/ja]
 * @codepen xbbzOQ
 * @guide UsingCarousel
 *   [en]Learn how to use the carousel component.[/en]
 *   [ja]carouselコンポーネントの使い方[/ja]
 * @example
 * <ons-carousel style="width: 100%; height: 200px">
 *   <ons-carousel-item>
 *    ...
 *   </ons-carousel-item>
 *   <ons-carousel-item>
 *    ...
 *   </ons-carousel-item>
 * </ons-carousel>
 */

/**
 * @attribute var
 * @initonly
 * @type {String}
 * @description
 *   [en]Variable name to refer this carousel.[/en]
 *   [ja]このカルーセルを参照するための変数名を指定します。[/ja]
 */

/**
 * @attribute ons-postchange
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postchange" event is fired.[/en]
 *  [ja]"postchange"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-refresh
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "refresh" event is fired.[/en]
 *  [ja]"refresh"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-overscroll
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "overscroll" event is fired.[/en]
 *  [ja]"overscroll"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-destroy
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
 *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @method once
 * @signature once(eventName, listener)
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method off
 * @signature off(eventName, [listener])
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしイベントリスナーが指定されなかった場合には、そのイベントに紐付いているイベントリスナーが全て削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method on
 * @signature on(eventName, listener)
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.directive('onsCarousel', ['$onsen', 'CarouselView', function ($onsen, CarouselView) {
    return {
      restrict: 'E',
      replace: false,

      // NOTE: This element must coexists with ng-controller.
      // Do not use isolated scope and template's ng-transclude.
      scope: false,
      transclude: false,

      compile: function compile(element, attrs) {
        CustomElements.upgrade(element[0]);

        return function (scope, element, attrs) {
          CustomElements.upgrade(element[0]);
          var carousel = new CarouselView(scope, element, attrs);

          element.data('ons-carousel', carousel);

          $onsen.registerEventHandlers(carousel, 'postchange refresh overscroll destroy');
          $onsen.declareVarAttribute(attrs, carousel);

          scope.$on('$destroy', function () {
            carousel._events = undefined;
            element.data('ons-carousel', undefined);
            element = null;
          });

          $onsen.fireComponentEvent(element[0], 'init');
        };
      }

    };
  }]);

  module.directive('onsCarouselItem', function () {
    return {
      restrict: 'E',
      compile: function compile(element, attrs) {
        CustomElements.upgrade(element[0]);
        return function (scope, element, attrs) {
          CustomElements.upgrade(element[0]);
          if (scope.$last) {
            element[0].parentElement._setup();
            element[0].parentElement._setupInitialIndex();
            element[0].parentElement._saveLastState();
          }
        };
      }
    };
  });
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-dialog
 */

/**
 * @attribute var
 * @initonly
 * @type {String}
 * @description
 *  [en]Variable name to refer this dialog.[/en]
 *  [ja]このダイアログを参照するための名前を指定します。[/ja]
 */

/**
 * @attribute ons-preshow
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "preshow" event is fired.[/en]
 *  [ja]"preshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-prehide
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "prehide" event is fired.[/en]
 *  [ja]"prehide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-postshow
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postshow" event is fired.[/en]
 *  [ja]"postshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-posthide
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "posthide" event is fired.[/en]
 *  [ja]"posthide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-destroy
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
 *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @method on
 * @signature on(eventName, listener)
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method once
 * @signature once(eventName, listener)
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method off
 * @signature off(eventName, [listener])
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしイベントリスナーが指定されなかった場合には、そのイベントに紐付いているイベントリスナーが全て削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */
(function () {
  'use strict';

  angular.module('onsen').directive('onsDialog', ['$onsen', 'DialogView', function ($onsen, DialogView) {
    return {
      restrict: 'E',
      scope: true,
      compile: function compile(element, attrs) {
        CustomElements.upgrade(element[0]);

        return {
          pre: function pre(scope, element, attrs) {
            CustomElements.upgrade(element[0]);

            var dialog = new DialogView(scope, element, attrs);
            $onsen.declareVarAttribute(attrs, dialog);
            $onsen.registerEventHandlers(dialog, 'preshow prehide postshow posthide destroy');
            $onsen.addModifierMethodsForCustomElements(dialog, element);

            element.data('ons-dialog', dialog);
            scope.$on('$destroy', function () {
              dialog._events = undefined;
              $onsen.removeModifierMethods(dialog);
              element.data('ons-dialog', undefined);
              element = null;
            });
          },

          post: function post(scope, element) {
            $onsen.fireComponentEvent(element[0], 'init');
          }
        };
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.directive('onsDummyForInit', ['$rootScope', function ($rootScope) {
    var isReady = false;

    return {
      restrict: 'E',
      replace: false,

      link: {
        post: function post(scope, element) {
          if (!isReady) {
            isReady = true;
            $rootScope.$broadcast('$ons-ready');
          }
          element.remove();
        }
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

(function () {
  'use strict';

  var EVENTS = ('drag dragleft dragright dragup dragdown hold release swipe swipeleft swiperight ' + 'swipeup swipedown tap doubletap touch transform pinch pinchin pinchout rotate').split(/ +/);

  angular.module('onsen').directive('onsGestureDetector', ['$onsen', function ($onsen) {

    var scopeDef = EVENTS.reduce(function (dict, name) {
      dict['ng' + titlize(name)] = '&';
      return dict;
    }, {});

    function titlize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return {
      restrict: 'E',
      scope: scopeDef,

      // NOTE: This element must coexists with ng-controller.
      // Do not use isolated scope and template's ng-transclude.
      replace: false,
      transclude: true,

      compile: function compile(element, attrs) {
        return function link(scope, element, attrs, _, transclude) {

          transclude(scope.$parent, function (cloned) {
            element.append(cloned);
          });

          var handler = function handler(event) {
            var attr = 'ng' + titlize(event.type);

            if (attr in scopeDef) {
              scope[attr]({ $event: event });
            }
          };

          var gestureDetector;

          setImmediate(function () {
            gestureDetector = element[0]._gestureDetector;
            gestureDetector.on(EVENTS.join(' '), handler);
          });

          $onsen.cleaner.onDestroy(scope, function () {
            gestureDetector.off(EVENTS.join(' '), handler);
            $onsen.clearComponent({
              scope: scope,
              element: element,
              attrs: attrs
            });
            gestureDetector.element = scope = element = attrs = null;
          });

          $onsen.fireComponentEvent(element[0], 'init');
        };
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-if-orientation
 * @category conditional
 * @description
 *   [en]Conditionally display content depending on screen orientation. Valid values are portrait and landscape. Different from other components, this component is used as attribute in any element.[/en]
 *   [ja]画面の向きに応じてコンテンツの制御を行います。portraitもしくはlandscapeを指定できます。すべての要素の属性に使用できます。[/ja]
 * @seealso ons-if-platform [en]ons-if-platform component[/en][ja]ons-if-platformコンポーネント[/ja]
 * @guide UtilityAPIs [en]Other utility APIs[/en][ja]他のユーティリティAPI[/ja]
 * @example
 * <div ons-if-orientation="portrait">
 *   <p>This will only be visible in portrait mode.</p>
 * </div>
 */

/**
 * @attribute ons-if-orientation
 * @initonly
 * @type {String}
 * @description
 *   [en]Either "portrait" or "landscape".[/en]
 *   [ja]portraitもしくはlandscapeを指定します。[/ja]
 */

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.directive('onsIfOrientation', ['$onsen', '$onsGlobal', function ($onsen, $onsGlobal) {
    return {
      restrict: 'A',
      replace: false,

      // NOTE: This element must coexists with ng-controller.
      // Do not use isolated scope and template's ng-transclude.
      transclude: false,
      scope: false,

      compile: function compile(element) {
        element.css('display', 'none');

        return function (scope, element, attrs) {
          element.addClass('ons-if-orientation-inner');

          attrs.$observe('onsIfOrientation', update);
          $onsGlobal.orientation.on('change', update);

          update();

          $onsen.cleaner.onDestroy(scope, function () {
            $onsGlobal.orientation.off('change', update);

            $onsen.clearComponent({
              element: element,
              scope: scope,
              attrs: attrs
            });
            element = scope = attrs = null;
          });

          function update() {
            var userOrientation = ('' + attrs.onsIfOrientation).toLowerCase();
            var orientation = getLandscapeOrPortrait();

            if (userOrientation === 'portrait' || userOrientation === 'landscape') {
              if (userOrientation === orientation) {
                element.css('display', '');
              } else {
                element.css('display', 'none');
              }
            }
          }

          function getLandscapeOrPortrait() {
            return $onsGlobal.orientation.isPortrait() ? 'portrait' : 'landscape';
          }
        };
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-if-platform
 * @category conditional
 * @description
 *    [en]Conditionally display content depending on the platform / browser. Valid values are "opera", "firefox", "safari", "chrome", "ie", "edge", "android", "blackberry", "ios" and "wp".[/en]
 *    [ja]プラットフォームやブラウザーに応じてコンテンツの制御をおこないます。opera, firefox, safari, chrome, ie, edge, android, blackberry, ios, wpのいずれかの値を空白区切りで複数指定できます。[/ja]
 * @seealso ons-if-orientation [en]ons-if-orientation component[/en][ja]ons-if-orientationコンポーネント[/ja]
 * @guide UtilityAPIs [en]Other utility APIs[/en][ja]他のユーティリティAPI[/ja]
 * @example
 * <div ons-if-platform="android">
 *   ...
 * </div>
 */

/**
 * @attribute ons-if-platform
 * @type {String}
 * @initonly
 * @description
 *   [en]One or multiple space separated values: "opera", "firefox", "safari", "chrome", "ie", "edge", "android", "blackberry", "ios" or "wp".[/en]
 *   [ja]"opera", "firefox", "safari", "chrome", "ie", "edge", "android", "blackberry", "ios", "wp"のいずれか空白区切りで複数指定できます。[/ja]
 */

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.directive('onsIfPlatform', ['$onsen', function ($onsen) {
    return {
      restrict: 'A',
      replace: false,

      // NOTE: This element must coexists with ng-controller.
      // Do not use isolated scope and template's ng-transclude.
      transclude: false,
      scope: false,

      compile: function compile(element) {
        element.addClass('ons-if-platform-inner');
        element.css('display', 'none');

        var platform = getPlatformString();

        return function (scope, element, attrs) {
          attrs.$observe('onsIfPlatform', function (userPlatform) {
            if (userPlatform) {
              update();
            }
          });

          update();

          $onsen.cleaner.onDestroy(scope, function () {
            $onsen.clearComponent({
              element: element,
              scope: scope,
              attrs: attrs
            });
            element = scope = attrs = null;
          });

          function update() {
            var userPlatforms = attrs.onsIfPlatform.toLowerCase().trim().split(/\s+/);
            if (userPlatforms.indexOf(platform.toLowerCase()) >= 0) {
              element.css('display', 'block');
            } else {
              element.css('display', 'none');
            }
          }
        };

        function getPlatformString() {

          if (navigator.userAgent.match(/Android/i)) {
            return 'android';
          }

          if (navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/RIM Tablet OS/i) || navigator.userAgent.match(/BB10/i)) {
            return 'blackberry';
          }

          if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
            return 'ios';
          }

          if (navigator.userAgent.match(/Windows Phone|IEMobile|WPDesktop/i)) {
            return 'wp';
          }

          // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
          var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
          if (isOpera) {
            return 'opera';
          }

          var isFirefox = typeof InstallTrigger !== 'undefined'; // Firefox 1.0+
          if (isFirefox) {
            return 'firefox';
          }

          var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
          // At least Safari 3+: "[object HTMLElementConstructor]"
          if (isSafari) {
            return 'safari';
          }

          var isEdge = navigator.userAgent.indexOf(' Edge/') >= 0;
          if (isEdge) {
            return 'edge';
          }

          var isChrome = !!window.chrome && !isOpera && !isEdge; // Chrome 1+
          if (isChrome) {
            return 'chrome';
          }

          var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6
          if (isIE) {
            return 'ie';
          }

          return 'unknown';
        }
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @ngdoc directive
 * @id input
 * @name ons-input
 * @category form
 * @description
 *  [en]Input component.[/en]
 *  [ja]inputコンポ―ネントです。[/ja]
 * @codepen ojQxLj
 * @guide UsingFormComponents
 *   [en]Using form components[/en]
 *   [ja]フォームを使う[/ja]
 * @guide EventHandling
 *   [en]Event handling descriptions[/en]
 *   [ja]イベント処理の使い方[/ja]
 * @example
 * <ons-input></ons-input>
 * <ons-input modifier="material" label="Username"></ons-input>
 */

/**
 * @ngdoc attribute
 * @name label
 * @type {String}
 * @description
 *   [en]Text for animated floating label.[/en]
 *   [ja]アニメーションさせるフローティングラベルのテキストを指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name float
 * @description
 *  [en]If this attribute is present, the label will be animated.[/en]
 *  [ja]この属性が設定された時、ラベルはアニメーションするようになります。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ng-model
 * @extensionOf angular
 * @description
 *   [en]Bind the value to a model. Works just like for normal input elements.[/en]
 *   [ja]この要素の値をモデルに紐付けます。通常のinput要素の様に動作します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name ng-change
 * @extensionOf angular
 * @description
 *   [en]Executes an expression when the value changes. Works just like for normal input elements.[/en]
 *   [ja]値が変わった時にこの属性で指定したexpressionが実行されます。通常のinput要素の様に動作します。[/ja]
 */

(function () {
  'use strict';

  angular.module('onsen').directive('onsInput', ['$parse', function ($parse) {
    return {
      restrict: 'E',
      replace: false,
      scope: false,

      link: function link(scope, element, attrs) {
        CustomElements.upgrade(element[0]);
        var el = element[0];

        var onInput = function onInput() {
          var set = $parse(attrs.ngModel).assign;

          if (el._isTextInput) {
            set(scope, el.value);
          } else if (el.type === 'radio' && el.checked) {
            set(scope, el.value);
          } else {
            set(scope, el.checked);
          }

          if (attrs.ngChange) {
            scope.$eval(attrs.ngChange);
          }

          scope.$parent.$evalAsync();
        };

        if (attrs.ngModel) {
          scope.$watch(attrs.ngModel, function (value) {
            if (el._isTextInput && typeof value !== 'undefined') {
              el.value = value;
            } else if (el.type === 'radio') {
              el.checked = value === el.value;
            } else {
              el.checked = value;
            }
          });

          el._isTextInput ? element.on('input', onInput) : element.on('change', onInput);
        }

        scope.$on('$destroy', function () {
          el._isTextInput ? element.off('input', onInput) : element.off('change', onInput);

          scope = element = attrs = el = null;
        });
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-keyboard-active
 * @category form
 * @description
 *   [en]
 *     Conditionally display content depending on if the software keyboard is visible or hidden.
 *     This component requires cordova and that the com.ionic.keyboard plugin is installed.
 *   [/en]
 *   [ja]
 *     ソフトウェアキーボードが表示されているかどうかで、コンテンツを表示するかどうかを切り替えることが出来ます。
 *     このコンポーネントは、Cordovaやcom.ionic.keyboardプラグインを必要とします。
 *   [/ja]
 * @guide UtilityAPIs
 *   [en]Other utility APIs[/en]
 *   [ja]他のユーティリティAPI[/ja]
 * @example
 * <div ons-keyboard-active>
 *   This will only be displayed if the software keyboard is open.
 * </div>
 * <div ons-keyboard-inactive>
 *   There is also a component that does the opposite.
 * </div>
 */

/**
 * @attribute ons-keyboard-active
 * @description
 *   [en]The content of tags with this attribute will be visible when the software keyboard is open.[/en]
 *   [ja]この属性がついた要素は、ソフトウェアキーボードが表示された時に初めて表示されます。[/ja]
 */

/**
 * @attribute ons-keyboard-inactive
 * @description
 *   [en]The content of tags with this attribute will be visible when the software keyboard is hidden.[/en]
 *   [ja]この属性がついた要素は、ソフトウェアキーボードが隠れている時のみ表示されます。[/ja]
 */

(function () {
  'use strict';

  var module = angular.module('onsen');

  var compileFunction = function compileFunction(show, $onsen) {
    return function (element) {
      return function (scope, element, attrs) {
        var dispShow = show ? 'block' : 'none',
            dispHide = show ? 'none' : 'block';

        var onShow = function onShow() {
          element.css('display', dispShow);
        };

        var onHide = function onHide() {
          element.css('display', dispHide);
        };

        var onInit = function onInit(e) {
          if (e.visible) {
            onShow();
          } else {
            onHide();
          }
        };

        ons.softwareKeyboard.on('show', onShow);
        ons.softwareKeyboard.on('hide', onHide);
        ons.softwareKeyboard.on('init', onInit);

        if (ons.softwareKeyboard._visible) {
          onShow();
        } else {
          onHide();
        }

        $onsen.cleaner.onDestroy(scope, function () {
          ons.softwareKeyboard.off('show', onShow);
          ons.softwareKeyboard.off('hide', onHide);
          ons.softwareKeyboard.off('init', onInit);

          $onsen.clearComponent({
            element: element,
            scope: scope,
            attrs: attrs
          });
          element = scope = attrs = null;
        });
      };
    };
  };

  module.directive('onsKeyboardActive', ['$onsen', function ($onsen) {
    return {
      restrict: 'A',
      replace: false,
      transclude: false,
      scope: false,
      compile: compileFunction(true, $onsen)
    };
  }]);

  module.directive('onsKeyboardInactive', ['$onsen', function ($onsen) {
    return {
      restrict: 'A',
      replace: false,
      transclude: false,
      scope: false,
      compile: compileFunction(false, $onsen)
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-lazy-repeat
 * @description
 *   [en]
 *     Using this component a list with millions of items can be rendered without a drop in performance.
 *     It does that by "lazily" loading elements into the DOM when they come into view and
 *     removing items from the DOM when they are not visible.
 *   [/en]
 *   [ja]
 *     このコンポーネント内で描画されるアイテムのDOM要素の読み込みは、画面に見えそうになった時まで自動的に遅延され、
 *     画面から見えなくなった場合にはその要素は動的にアンロードされます。
 *     このコンポーネントを使うことで、パフォーマンスを劣化させること無しに巨大な数の要素を描画できます。
 *   [/ja]
 * @codepen QwrGBm
 * @guide UsingLazyRepeat
 *   [en]How to use Lazy Repeat[/en]
 *   [ja]レイジーリピートの使い方[/ja]
 * @example
 * <script>
 *   ons.bootstrap()
 *
 *   .controller('MyController', function($scope) {
 *     $scope.MyDelegate = {
 *       countItems: function() {
 *         // Return number of items.
 *         return 1000000;
 *       },
 *
 *       calculateItemHeight: function(index) {
 *         // Return the height of an item in pixels.
 *         return 45;
 *       },
 *
 *       configureItemScope: function(index, itemScope) {
 *         // Initialize scope
 *         itemScope.item = 'Item #' + (index + 1);
 *       },
 *
 *       destroyItemScope: function(index, itemScope) {
 *         // Optional method that is called when an item is unloaded.
 *         console.log('Destroyed item with index: ' + index);
 *       }
 *     };
 *   });
 * </script>
 *
 * <ons-list ng-controller="MyController">
 *   <ons-list-item ons-lazy-repeat="MyDelegate">
 *     {{ item }}
 *   </ons-list-item>
 * </ons-list>
 */

/**
 * @attribute ons-lazy-repeat
 * @type {Expression}
 * @initonly
 * @description
 *  [en]A delegate object, can be either an object attached to the scope (when using AngularJS) or a normal JavaScript variable.[/en]
 *  [ja]要素のロード、アンロードなどの処理を委譲するオブジェクトを指定します。AngularJSのスコープの変数名や、通常のJavaScriptの変数名を指定します。[/ja]
 */

/**
 * @property delegate.configureItemScope
 * @type {Function}
 * @description
 *   [en]Function which recieves an index and the scope for the item. Can be used to configure values in the item scope.[/en]
 *   [ja][/ja]
 */

(function () {
  'use strict';

  var module = angular.module('onsen');

  /**
   * Lazy repeat directive.
   */
  module.directive('onsLazyRepeat', ['$onsen', 'LazyRepeatView', function ($onsen, LazyRepeatView) {
    return {
      restrict: 'A',
      replace: false,
      priority: 1000,
      terminal: true,

      compile: function compile(element, attrs) {
        return function (scope, element, attrs) {
          var lazyRepeat = new LazyRepeatView(scope, element, attrs);

          scope.$on('$destroy', function () {
            scope = element = attrs = lazyRepeat = null;
          });
        };
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

(function () {
  'use strict';

  angular.module('onsen').directive('onsList', ['$onsen', 'GenericView', function ($onsen, GenericView) {
    return {
      restrict: 'E',
      link: function link(scope, element, attrs) {
        CustomElements.upgrade(element[0]);
        GenericView.register(scope, element, attrs, { viewKey: 'ons-list' });
        $onsen.fireComponentEvent(element[0], 'init');
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

(function () {
  'use strict';

  angular.module('onsen').directive('onsListHeader', ['$onsen', 'GenericView', function ($onsen, GenericView) {
    return {
      restrict: 'E',
      link: function link(scope, element, attrs) {
        CustomElements.upgrade(element[0]);
        GenericView.register(scope, element, attrs, { viewKey: 'ons-listHeader' });
        $onsen.fireComponentEvent(element[0], 'init');
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

(function () {
  'use strict';

  angular.module('onsen').directive('onsListItem', ['$onsen', 'GenericView', function ($onsen, GenericView) {
    return {
      restrict: 'E',
      link: function link(scope, element, attrs) {
        CustomElements.upgrade(element[0]);
        GenericView.register(scope, element, attrs, { viewKey: 'ons-list-item' });
        $onsen.fireComponentEvent(element[0], 'init');
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-loading-placeholder
 * @category util
 * @description
 *   [en]Display a placeholder while the content is loading.[/en]
 *   [ja]Onsen UIが読み込まれるまでに表示するプレースホルダーを表現します。[/ja]
 * @guide UtilityAPIs [en]Other utility APIs[/en][ja]他のユーティリティAPI[/ja]
 * @example
 * <div ons-loading-placeholder="page.html">
 *   Loading...
 * </div>
 */

/**
 * @attribute ons-loading-placeholder
 * @initonly
 * @type {String}
 * @description
 *   [en]The url of the page to load.[/en]
 *   [ja]読み込むページのURLを指定します。[/ja]
 */

(function () {
  'use strict';

  angular.module('onsen').directive('onsLoadingPlaceholder', function () {
    return {
      restrict: 'A',
      link: function link(scope, element, attrs) {
        CustomElements.upgrade(element[0]);
        if (attrs.onsLoadingPlaceholder) {
          ons._resolveLoadingPlaceholder(element[0], attrs.onsLoadingPlaceholder, function (contentElement, done) {
            CustomElements.upgrade(contentElement);
            ons.compile(contentElement);
            scope.$evalAsync(function () {
              setImmediate(done);
            });
          });
        }
      }
    };
  });
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-modal
 */

/**
 * @attribute var
 * @type {String}
 * @initonly
 * @description
 *   [en]Variable name to refer this modal.[/en]
 *   [ja]このモーダルを参照するための名前を指定します。[/ja]
 */

(function () {
  'use strict';

  /**
   * Modal directive.
   */

  angular.module('onsen').directive('onsModal', ['$onsen', 'ModalView', function ($onsen, ModalView) {
    return {
      restrict: 'E',
      replace: false,

      // NOTE: This element must coexists with ng-controller.
      // Do not use isolated scope and template's ng-transclude.
      scope: false,
      transclude: false,

      link: {
        pre: function pre(scope, element, attrs) {
          CustomElements.upgrade(element[0]);
          var modal = new ModalView(scope, element, attrs);
          $onsen.addModifierMethodsForCustomElements(modal, element);

          $onsen.declareVarAttribute(attrs, modal);
          element.data('ons-modal', modal);

          element[0]._ensureNodePosition();

          scope.$on('$destroy', function () {
            $onsen.removeModifierMethods(modal);
            element.data('ons-modal', undefined);
            modal = element = scope = attrs = null;
          });
        },

        post: function post(scope, element) {
          $onsen.fireComponentEvent(element[0], 'init');
        }
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-navigator
 * @example
 * <ons-navigator animation="slide" var="app.navi">
 *   <ons-page>
 *     <ons-toolbar>
 *       <div class="center">Title</div>
 *     </ons-toolbar>
 *
 *     <p style="text-align: center">
 *       <ons-button modifier="light" ng-click="app.navi.pushPage('page.html');">Push</ons-button>
 *     </p>
 *   </ons-page>
 * </ons-navigator>
 *
 * <ons-template id="page.html">
 *   <ons-page>
 *     <ons-toolbar>
 *       <div class="center">Title</div>
 *     </ons-toolbar>
 *
 *     <p style="text-align: center">
 *       <ons-button modifier="light" ng-click="app.navi.popPage();">Pop</ons-button>
 *     </p>
 *   </ons-page>
 * </ons-template>
 */

/**
 * @attribute var
 * @initonly
 * @type {String}
 * @description
 *  [en]Variable name to refer this navigator.[/en]
 *  [ja]このナビゲーターを参照するための名前を指定します。[/ja]
 */

/**
 * @attribute ons-prepush
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "prepush" event is fired.[/en]
 *  [ja]"prepush"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-prepop
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "prepop" event is fired.[/en]
 *  [ja]"prepop"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-postpush
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postpush" event is fired.[/en]
 *  [ja]"postpush"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-postpop
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postpop" event is fired.[/en]
 *  [ja]"postpop"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-init
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "init" event is fired.[/en]
 *  [ja]ページの"init"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-show
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "show" event is fired.[/en]
 *  [ja]ページの"show"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-hide
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "hide" event is fired.[/en]
 *  [ja]ページの"hide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-destroy
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "destroy" event is fired.[/en]
 *  [ja]ページの"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @method on
 * @signature on(eventName, listener)
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method once
 * @signature once(eventName, listener)
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method off
 * @signature off(eventName, [listener])
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]削除するイベントリスナーを指定します。[/ja]
 */

(function () {
  'use strict';

  var lastReady = window.OnsNavigatorElement.rewritables.ready;
  window.OnsNavigatorElement.rewritables.ready = ons._waitDiretiveInit('ons-navigator', lastReady);

  var lastLink = window.OnsNavigatorElement.rewritables.link;
  window.OnsNavigatorElement.rewritables.link = function (navigatorElement, target, options, callback) {
    var view = angular.element(navigatorElement).data('ons-navigator');
    view._compileAndLink(target, function (target) {
      lastLink(navigatorElement, target, options, callback);
    });
  };

  angular.module('onsen').directive('onsNavigator', ['NavigatorView', '$onsen', function (NavigatorView, $onsen) {
    return {
      restrict: 'E',

      // NOTE: This element must coexists with ng-controller.
      // Do not use isolated scope and template's ng-transclude.
      transclude: false,
      scope: true,

      compile: function compile(element) {
        CustomElements.upgrade(element[0]);

        return {
          pre: function pre(scope, element, attrs, controller) {
            CustomElements.upgrade(element[0]);
            var navigator = new NavigatorView(scope, element, attrs);

            $onsen.declareVarAttribute(attrs, navigator);
            $onsen.registerEventHandlers(navigator, 'prepush prepop postpush postpop init show hide destroy');

            element.data('ons-navigator', navigator);

            scope.$on('$destroy', function () {
              navigator._events = undefined;
              element.data('ons-navigator', undefined);
              element = null;
            });
          },
          post: function post(scope, element, attrs) {
            $onsen.fireComponentEvent(element[0], 'init');
          }
        };
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-page
 */

/**
 * @attribute var
 * @initonly
 * @type {String}
 * @description
 *   [en]Variable name to refer this page.[/en]
 *   [ja]このページを参照するための名前を指定します。[/ja]
 */

/**
 * @attribute ng-infinite-scroll
 * @initonly
 * @type {String}
 * @description
 *   [en]Path of the function to be executed on infinite scrolling. The path is relative to $scope. The function receives a done callback that must be called when it's finished.[/en]
 *   [ja][/ja]
 */

/**
 * @attribute on-device-back-button
 * @type {Expression}
 * @description
 *   [en]Allows you to specify custom behavior when the back button is pressed.[/en]
 *   [ja]デバイスのバックボタンが押された時の挙動を設定できます。[/ja]
 */

/**
 * @attribute ng-device-back-button
 * @initonly
 * @type {Expression}
 * @description
 *   [en]Allows you to specify custom behavior with an AngularJS expression when the back button is pressed.[/en]
 *   [ja]デバイスのバックボタンが押された時の挙動を設定できます。AngularJSのexpressionを指定できます。[/ja]
 */

/**
 * @attribute ons-init
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "init" event is fired.[/en]
 *  [ja]"init"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-show
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "show" event is fired.[/en]
 *  [ja]"show"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-hide
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "hide" event is fired.[/en]
 *  [ja]"hide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-destroy
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
 *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.directive('onsPage', ['$onsen', 'PageView', function ($onsen, PageView) {

    function firePageInitEvent(element) {
      // TODO: remove dirty fix
      var i = 0,
          f = function f() {
        if (i++ < 15) {
          if (isAttached(element)) {
            $onsen.fireComponentEvent(element, 'init');
            fireActualPageInitEvent(element);
          } else {
            if (i > 10) {
              setTimeout(f, 1000 / 60);
            } else {
              setImmediate(f);
            }
          }
        } else {
          throw new Error('Fail to fire "pageinit" event. Attach "ons-page" element to the document after initialization.');
        }
      };

      f();
    }

    function fireActualPageInitEvent(element) {
      var event = document.createEvent('HTMLEvents');
      event.initEvent('pageinit', true, true);
      element.dispatchEvent(event);
    }

    function isAttached(element) {
      if (document.documentElement === element) {
        return true;
      }
      return element.parentNode ? isAttached(element.parentNode) : false;
    }

    return {
      restrict: 'E',

      // NOTE: This element must coexists with ng-controller.
      // Do not use isolated scope and template's ng-transclude.
      transclude: false,
      scope: true,

      compile: function compile(element, attrs) {
        CustomElements.upgrade(element[0]);
        return {
          pre: function pre(scope, element, attrs) {
            CustomElements.upgrade(element[0]);
            var page = new PageView(scope, element, attrs);

            $onsen.declareVarAttribute(attrs, page);
            $onsen.registerEventHandlers(page, 'init show hide destroy');

            element.data('ons-page', page);
            $onsen.addModifierMethodsForCustomElements(page, element);

            element.data('_scope', scope);

            $onsen.cleaner.onDestroy(scope, function () {
              page._events = undefined;
              $onsen.removeModifierMethods(page);
              element.data('ons-page', undefined);
              element.data('_scope', undefined);

              $onsen.clearComponent({
                element: element,
                scope: scope,
                attrs: attrs
              });
              scope = element = attrs = null;
            });
          },

          post: function postLink(scope, element, attrs) {
            firePageInitEvent(element[0]);
          }
        };
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-popover
 */

/**
 * @attribute var
 * @initonly
 * @type {String}
 * @description
 *  [en]Variable name to refer this popover.[/en]
 *  [ja]このポップオーバーを参照するための名前を指定します。[/ja]
 */

/**
 * @attribute ons-preshow
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "preshow" event is fired.[/en]
 *  [ja]"preshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-prehide
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "prehide" event is fired.[/en]
 *  [ja]"prehide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-postshow
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postshow" event is fired.[/en]
 *  [ja]"postshow"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-posthide
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "posthide" event is fired.[/en]
 *  [ja]"posthide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-destroy
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
 *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @method on
 * @signature on(eventName, listener)
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method once
 * @signature once(eventName, listener)
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method off
 * @signature off(eventName, [listener])
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]削除するイベントリスナーを指定します。[/ja]
 */

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.directive('onsPopover', ['$onsen', 'PopoverView', function ($onsen, PopoverView) {
    return {
      restrict: 'E',
      replace: false,
      scope: true,
      compile: function compile(element, attrs) {
        CustomElements.upgrade(element[0]);
        return {
          pre: function pre(scope, element, attrs) {
            CustomElements.upgrade(element[0]);

            var popover = new PopoverView(scope, element, attrs);

            $onsen.declareVarAttribute(attrs, popover);
            $onsen.registerEventHandlers(popover, 'preshow prehide postshow posthide destroy');
            $onsen.addModifierMethodsForCustomElements(popover, element);

            element.data('ons-popover', popover);

            scope.$on('$destroy', function () {
              popover._events = undefined;
              $onsen.removeModifierMethods(popover);
              element.data('ons-popover', undefined);
              element = null;
            });
          },

          post: function post(scope, element) {
            $onsen.fireComponentEvent(element[0], 'init');
          }
        };
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-pull-hook
 * @example
 * <script>
 *   ons.bootstrap()
 *
 *   .controller('MyController', function($scope, $timeout) {
 *     $scope.items = [3, 2 ,1];
 *
 *     $scope.load = function($done) {
 *       $timeout(function() {
 *         $scope.items.unshift($scope.items.length + 1);
 *         $done();
 *       }, 1000);
 *     };
 *   });
 * </script>
 *
 * <ons-page ng-controller="MyController">
 *   <ons-pull-hook var="loader" ng-action="load($done)">
 *     <span ng-switch="loader.state">
 *       <span ng-switch-when="initial">Pull down to refresh</span>
 *       <span ng-switch-when="preaction">Release to refresh</span>
 *       <span ng-switch-when="action">Loading data. Please wait...</span>
 *     </span>
 *   </ons-pull-hook>
 *   <ons-list>
 *     <ons-list-item ng-repeat="item in items">
 *       Item #{{ item }}
 *     </ons-list-item>
 *   </ons-list>
 * </ons-page>
 */

/**
 * @attribute var
 * @initonly
 * @type {String}
 * @description
 *   [en]Variable name to refer this component.[/en]
 *   [ja]このコンポーネントを参照するための名前を指定します。[/ja]
 */

/**
 * @attribute ng-action
 * @initonly
 * @type {Expression}
 * @description
 *   [en]Use to specify custom behavior when the page is pulled down. A <code>$done</code> function is available to tell the component that the action is completed.[/en]
 *   [ja]pull downしたときの振る舞いを指定します。アクションが完了した時には<code>$done</code>関数を呼び出します。[/ja]
 */

/**
 * @attribute ons-changestate
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "changestate" event is fired.[/en]
 *  [ja]"changestate"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @method on
 * @signature on(eventName, listener)
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method once
 * @signature once(eventName, listener)
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method off
 * @signature off(eventName, [listener])
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]削除するイベントリスナーを指定します。[/ja]
 */

(function () {
  'use strict';

  /**
   * Pull hook directive.
   */

  angular.module('onsen').directive('onsPullHook', ['$onsen', 'PullHookView', function ($onsen, PullHookView) {
    return {
      restrict: 'E',
      replace: false,
      scope: true,

      compile: function compile(element, attrs) {
        CustomElements.upgrade(element[0]);
        return {
          pre: function pre(scope, element, attrs) {
            CustomElements.upgrade(element[0]);
            var pullHook = new PullHookView(scope, element, attrs);

            $onsen.declareVarAttribute(attrs, pullHook);
            $onsen.registerEventHandlers(pullHook, 'changestate destroy');
            element.data('ons-pull-hook', pullHook);

            scope.$on('$destroy', function () {
              pullHook._events = undefined;
              element.data('ons-pull-hook', undefined);
              scope = element = attrs = null;
            });
          },
          post: function post(scope, element) {
            $onsen.fireComponentEvent(element[0], 'init');
          }
        };
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

(function () {
  'use strict';

  angular.module('onsen').directive('onsRange', ['$parse', function ($parse) {
    return {
      restrict: 'E',
      replace: false,
      scope: false,

      link: function link(scope, element, attrs) {
        CustomElements.upgrade(element[0]);

        var onInput = function onInput() {
          var set = $parse(attrs.ngModel).assign;

          set(scope, element[0].value);
          if (attrs.ngChange) {
            scope.$eval(attrs.ngChange);
          }
          scope.$parent.$evalAsync();
        };

        if (attrs.ngModel) {
          scope.$watch(attrs.ngModel, function (value) {
            element[0].value = value;
          });

          element.on('input', onInput);
        }

        scope.$on('$destroy', function () {
          element.off('input', onInput);
          scope = element = attrs = null;
        });
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

(function () {
  'use strict';

  angular.module('onsen').directive('onsRipple', ['$onsen', 'GenericView', function ($onsen, GenericView) {
    return {
      restrict: 'E',
      link: function link(scope, element, attrs) {
        CustomElements.upgrade(element[0]);
        GenericView.register(scope, element, attrs, { viewKey: 'ons-ripple' });
        $onsen.fireComponentEvent(element[0], 'init');
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-scope
 * @category util
 * @description
 *   [en]All child elements using the "var" attribute will be attached to the scope of this element.[/en]
 *   [ja]"var"属性を使っている全ての子要素のviewオブジェクトは、この要素のAngularJSスコープに追加されます。[/ja]
 * @example
 * <ons-list>
 *   <ons-list-item ons-scope ng-repeat="item in items">
 *     <ons-carousel var="carousel">
 *       <ons-carousel-item ng-click="carousel.next()">
 *         {{ item }}
 *       </ons-carousel-item>
 *       </ons-carousel-item ng-click="carousel.prev()">
 *         ...
 *       </ons-carousel-item>
 *     </ons-carousel>
 *   </ons-list-item>
 * </ons-list>
 */

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.directive('onsScope', ['$onsen', function ($onsen) {
    return {
      restrict: 'A',
      replace: false,
      transclude: false,
      scope: false,

      link: function link(scope, element) {
        element.data('_scope', scope);

        scope.$on('$destroy', function () {
          element.data('_scope', undefined);
        });
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-sliding-menu
 * @category sliding-menu
 * @description
 *   [en]Component for sliding UI where one page is overlayed over another page. The above page can be slided aside to reveal the page behind.[/en]
 *   [ja]スライディングメニューを表現するためのコンポーネントで、片方のページが別のページの上にオーバーレイで表示されます。above-pageで指定されたページは、横からスライドして表示します。[/ja]
 * @codepen IDvFJ
 * @seealso ons-page
 *   [en]ons-page component[/en]
 *   [ja]ons-pageコンポーネント[/ja]
 * @guide UsingSlidingMenu
 *   [en]Using sliding menu[/en]
 *   [ja]スライディングメニューを使う[/ja]
 * @guide EventHandling
 *   [en]Using events[/en]
 *   [ja]イベントの利用[/ja]
 * @guide CallingComponentAPIsfromJavaScript
 *   [en]Using navigator from JavaScript[/en]
 *   [ja]JavaScriptからコンポーネントを呼び出す[/ja]
 * @guide DefiningMultiplePagesinSingleHTML
 *   [en]Defining multiple pages in single html[/en]
 *   [ja]複数のページを1つのHTMLに記述する[/ja]
 * @example
 * <ons-sliding-menu var="app.menu" main-page="page.html" menu-page="menu.html" max-slide-distance="200px" type="reveal" side="left">
 * </ons-sliding-menu>
 *
 * <ons-template id="page.html">
 *   <ons-page>
 *    <p style="text-align: center">
 *      <ons-button ng-click="app.menu.toggleMenu()">Toggle</ons-button>
 *    </p>
 *   </ons-page>
 * </ons-template>
 *
 * <ons-template id="menu.html">
 *   <ons-page>
 *     <!-- menu page's contents -->
 *   </ons-page>
 * </ons-template>
 *
 */

/**
 * @event preopen
 * @description
 *   [en]Fired just before the sliding menu is opened.[/en]
 *   [ja]スライディングメニューが開く前に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクトです。[/ja]
 * @param {Object} event.slidingMenu
 *   [en]Sliding menu view object.[/en]
 *   [ja]イベントが発火したSlidingMenuオブジェクトです。[/ja]
 */

/**
 * @event postopen
 * @description
 *   [en]Fired just after the sliding menu is opened.[/en]
 *   [ja]スライディングメニューが開き終わった後に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクトです。[/ja]
 * @param {Object} event.slidingMenu
 *   [en]Sliding menu view object.[/en]
 *   [ja]イベントが発火したSlidingMenuオブジェクトです。[/ja]
 */

/**
 * @event preclose
 * @description
 *   [en]Fired just before the sliding menu is closed.[/en]
 *   [ja]スライディングメニューが閉じる前に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクトです。[/ja]
 * @param {Object} event.slidingMenu
 *   [en]Sliding menu view object.[/en]
 *   [ja]イベントが発火したSlidingMenuオブジェクトです。[/ja]
 */

/**
 * @event postclose
 * @description
 *   [en]Fired just after the sliding menu is closed.[/en]
 *   [ja]スライディングメニューが閉じ終わった後に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクトです。[/ja]
 * @param {Object} event.slidingMenu
 *   [en]Sliding menu view object.[/en]
 *   [ja]イベントが発火したSlidingMenuオブジェクトです。[/ja]
 */

/**
 * @attribute var
 * @initonly
 * @type {String}
 * @description
 *  [en]Variable name to refer this sliding menu.[/en]
 *  [ja]このスライディングメニューを参照するための名前を指定します。[/ja]
 */

/**
 * @attribute menu-page
 * @initonly
 * @type {String}
 * @description
 *   [en]The url of the menu page.[/en]
 *   [ja]左に位置するメニューページのURLを指定します。[/ja]
 */

/**
 * @attribute main-page
 * @initonly
 * @type {String}
 * @description
 *   [en]The url of the main page.[/en]
 *   [ja]右に位置するメインページのURLを指定します。[/ja]
 */

/**
 * @attribute swipeable
 * @initonly
 * @type {Boolean}
 * @description
 *   [en]Whether to enable swipe interaction.[/en]
 *   [ja]スワイプ操作を有効にする場合に指定します。[/ja]
 */

/**
 * @attribute swipe-target-width
 * @initonly
 * @type {String}
 * @description
 *   [en]The width of swipeable area calculated from the left (in pixels). Use this to enable swipe only when the finger touch on the screen edge.[/en]
 *   [ja]スワイプの判定領域をピクセル単位で指定します。画面の端から指定した距離に達するとページが表示されます。[/ja]
 */

/**
 * @attribute max-slide-distance
 * @initonly
 * @type {String}
 * @description
 *   [en]How far the menu page will slide open. Can specify both in px and %. eg. 90%, 200px[/en]
 *   [ja]menu-pageで指定されたページの表示幅を指定します。ピクセルもしくは%の両方で指定できます（例: 90%, 200px）[/ja]
 */

/**
 * @attribute side
 * @initonly
 * @type {String}
 * @description
 *   [en]Specify which side of the screen the menu page is located on. Possible values are "left" and "right".[/en]
 *   [ja]menu-pageで指定されたページが画面のどちら側から表示されるかを指定します。leftもしくはrightのいずれかを指定できます。[/ja]
 */

/**
 * @attribute type
 * @initonly
 * @type {String}
 * @description
 *   [en]Sliding menu animator. Possible values are reveal (default), push and overlay.[/en]
 *   [ja]スライディングメニューのアニメーションです。"reveal"（デフォルト）、"push"、"overlay"のいずれかを指定できます。[/ja]
 */

/**
 * @attribute ons-preopen
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "preopen" event is fired.[/en]
 *  [ja]"preopen"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-preclose
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "preclose" event is fired.[/en]
 *  [ja]"preclose"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-postopen
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postopen" event is fired.[/en]
 *  [ja]"postopen"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-postclose
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postclose" event is fired.[/en]
 *  [ja]"postclose"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-init
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "init" event is fired.[/en]
 *  [ja]ページの"init"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-show
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "show" event is fired.[/en]
 *  [ja]ページの"show"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-hide
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "hide" event is fired.[/en]
 *  [ja]ページの"hide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-destroy
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "destroy" event is fired.[/en]
 *  [ja]ページの"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @method setMainPage
 * @signature setMainPage(pageUrl, [options])
 * @param {String} pageUrl
 *   [en]Page URL. Can be either an HTML document or an <code>&lt;ons-template&gt;</code>.[/en]
 *   [ja]pageのURLか、ons-templateで宣言したテンプレートのid属性の値を指定します。[/ja]
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Boolean} [options.closeMenu]
 *   [en]If true the menu will be closed.[/en]
 *   [ja]trueを指定すると、開いているメニューを閉じます。[/ja]
 * @param {Function} [options.callback]
 *   [en]Function that is executed after the page has been set.[/en]
 *   [ja]ページが読み込まれた後に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Show the page specified in pageUrl in the main contents pane.[/en]
 *   [ja]中央部分に表示されるページをpageUrlに指定します。[/ja]
 */

/**
 * @method setMenuPage
 * @signature setMenuPage(pageUrl, [options])
 * @param {String} pageUrl
 *   [en]Page URL. Can be either an HTML document or an <code>&lt;ons-template&gt;</code>.[/en]
 *   [ja]pageのURLか、ons-templateで宣言したテンプレートのid属性の値を指定します。[/ja]
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Boolean} [options.closeMenu]
 *   [en]If true the menu will be closed after the menu page has been set.[/en]
 *   [ja]trueを指定すると、開いているメニューを閉じます。[/ja]
 * @param {Function} [options.callback]
 *   [en]This function will be executed after the menu page has been set.[/en]
 *   [ja]メニューページが読み込まれた後に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Show the page specified in pageUrl in the side menu pane.[/en]
 *   [ja]メニュー部分に表示されるページをpageUrlに指定します。[/ja]
 */

/**
 * @method openMenu
 * @signature openMenu([options])
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Function} [options.callback]
 *   [en]This function will be called after the menu has been opened.[/en]
 *   [ja]メニューが開いた後に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Slide the above layer to reveal the layer behind.[/en]
 *   [ja]メニューページを表示します。[/ja]
 */

/**
 * @method closeMenu
 * @signature closeMenu([options])
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Function} [options.callback]
 *   [en]This function will be called after the menu has been closed.[/en]
 *   [ja]メニューが閉じられた後に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]Slide the above layer to hide the layer behind.[/en]
 *   [ja]メニューページを非表示にします。[/ja]
 */

/**
 * @method toggleMenu
 * @signature toggleMenu([options])
 * @param {Object} [options]
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクト。[/ja]
 * @param {Function} [options.callback]
 *   [en]This function will be called after the menu has been opened or closed.[/en]
 *   [ja]メニューが開き終わった後か、閉じ終わった後に呼び出される関数オブジェクトです。[/ja]
 * @description
 *   [en]Slide the above layer to reveal the layer behind if it is currently hidden, otherwise, hide the layer behind.[/en]
 *   [ja]現在の状況に合わせて、メニューページを表示もしくは非表示にします。[/ja]
 */

/**
 * @method isMenuOpened
 * @signature isMenuOpened()
 * @return {Boolean}
 *   [en]true if the menu is currently open.[/en]
 *   [ja]メニューが開いていればtrueとなります。[/ja]
 * @description
 *   [en]Returns true if the menu page is open, otherwise false.[/en]
 *   [ja]メニューページが開いている場合はtrue、そうでない場合はfalseを返します。[/ja]
 */

/**
 * @method getDeviceBackButtonHandler
 * @signature getDeviceBackButtonHandler()
 * @return {Object}
 *   [en]Device back button handler.[/en]
 *   [ja]デバイスのバックボタンハンドラを返します。[/ja]
 * @description
 *   [en]Retrieve the back-button handler.[/en]
 *   [ja]ons-sliding-menuに紐付いているバックボタンハンドラを取得します。[/ja]
 */

/**
 * @method setSwipeable
 * @signature setSwipeable(swipeable)
 * @param {Boolean} swipeable
 *   [en]If true the menu will be swipeable.[/en]
 *   [ja]スワイプで開閉できるようにする場合にはtrueを指定します。[/ja]
 * @description
 *   [en]Specify if the menu should be swipeable or not.[/en]
 *   [ja]スワイプで開閉するかどうかを設定する。[/ja]
 */

/**
 * @method on
 * @signature on(eventName, listener)
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method once
 * @signature once(eventName, listener)
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method off
 * @signature off(eventName, [listener])
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]削除するイベントリスナーを指定します。[/ja]
 */

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.directive('onsSlidingMenu', ['$compile', 'SlidingMenuView', '$onsen', function ($compile, SlidingMenuView, $onsen) {
    return {
      restrict: 'E',
      replace: false,

      // NOTE: This element must coexists with ng-controller.
      // Do not use isolated scope and template's ng-transclude.
      transclude: false,
      scope: true,

      compile: function compile(element, attrs) {
        var main = element[0].querySelector('.main'),
            menu = element[0].querySelector('.menu');

        if (main) {
          var mainHtml = angular.element(main).remove().html().trim();
        }

        if (menu) {
          var menuHtml = angular.element(menu).remove().html().trim();
        }

        return function (scope, element, attrs) {
          element.append(angular.element('<div></div>').addClass('onsen-sliding-menu__menu ons-sliding-menu-inner'));
          element.append(angular.element('<div></div>').addClass('onsen-sliding-menu__main ons-sliding-menu-inner'));

          var slidingMenu = new SlidingMenuView(scope, element, attrs);

          $onsen.registerEventHandlers(slidingMenu, 'preopen preclose postopen postclose init show hide destroy');

          if (mainHtml && !attrs.mainPage) {
            slidingMenu._appendMainPage(null, mainHtml);
          }

          if (menuHtml && !attrs.menuPage) {
            slidingMenu._appendMenuPage(menuHtml);
          }

          $onsen.declareVarAttribute(attrs, slidingMenu);
          element.data('ons-sliding-menu', slidingMenu);

          scope.$on('$destroy', function () {
            slidingMenu._events = undefined;
            element.data('ons-sliding-menu', undefined);
          });

          $onsen.fireComponentEvent(element[0], 'init');
        };
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-split-view
 * @category split-view
 * @description
 *  [en]Divides the screen into a left and right section.[/en]
 *  [ja]画面を左右に分割するコンポーネントです。[/ja]
 * @codepen nKqfv {wide}
 * @guide Usingonssplitviewcomponent
 *   [en]Using ons-split-view.[/en]
 *   [ja]ons-split-viewコンポーネントを使う[/ja]
 * @guide CallingComponentAPIsfromJavaScript
 *   [en]Using navigator from JavaScript[/en]
 *   [ja]JavaScriptからコンポーネントを呼び出す[/ja]
 * @example
 * <ons-split-view
 *   secondary-page="secondary.html"
 *   main-page="main.html"
 *   main-page-width="70%"
 *   collapse="portrait">
 * </ons-split-view>
 */

/**
 * @event update
 * @description
 *   [en]Fired when the split view is updated.[/en]
 *   [ja]split viewの状態が更新された際に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクトです。[/ja]
 * @param {Object} event.splitView
 *   [en]Split view object.[/en]
 *   [ja]イベントが発火したSplitViewオブジェクトです。[/ja]
 * @param {Boolean} event.shouldCollapse
 *   [en]True if the view should collapse.[/en]
 *   [ja]collapse状態の場合にtrueになります。[/ja]
 * @param {String} event.currentMode
 *   [en]Current mode.[/en]
 *   [ja]現在のモード名を返します。"collapse"か"split"かのいずれかです。[/ja]
 * @param {Function} event.split
 *   [en]Call to force split.[/en]
 *   [ja]この関数を呼び出すと強制的にsplitモードにします。[/ja]
 * @param {Function} event.collapse
 *   [en]Call to force collapse.[/en]
 *   [ja]この関数を呼び出すと強制的にcollapseモードにします。[/ja]
 * @param {Number} event.width
 *   [en]Current width.[/en]
 *   [ja]現在のSplitViewの幅を返します。[/ja]
 * @param {String} event.orientation
 *   [en]Current orientation.[/en]
 *   [ja]現在の画面のオリエンテーションを返します。"portrait"かもしくは"landscape"です。 [/ja]
 */

/**
 * @event presplit
 * @description
 *   [en]Fired just before the view is split.[/en]
 *   [ja]split状態にる前に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクト。[/ja]
 * @param {Object} event.splitView
 *   [en]Split view object.[/en]
 *   [ja]イベントが発火したSplitViewオブジェクトです。[/ja]
 * @param {Number} event.width
 *   [en]Current width.[/en]
 *   [ja]現在のSplitViewnの幅です。[/ja]
 * @param {String} event.orientation
 *   [en]Current orientation.[/en]
 *   [ja]現在の画面のオリエンテーションを返します。"portrait"もしくは"landscape"です。[/ja]
 */

/**
 * @event postsplit
 * @description
 *   [en]Fired just after the view is split.[/en]
 *   [ja]split状態になった後に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクト。[/ja]
 * @param {Object} event.splitView
 *   [en]Split view object.[/en]
 *   [ja]イベントが発火したSplitViewオブジェクトです。[/ja]
 * @param {Number} event.width
 *   [en]Current width.[/en]
 *   [ja]現在のSplitViewnの幅です。[/ja]
 * @param {String} event.orientation
 *   [en]Current orientation.[/en]
 *   [ja]現在の画面のオリエンテーションを返します。"portrait"もしくは"landscape"です。[/ja]
 */

/**
 * @event precollapse
 * @description
 *   [en]Fired just before the view is collapsed.[/en]
 *   [ja]collapse状態になる前に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクト。[/ja]
 * @param {Object} event.splitView
 *   [en]Split view object.[/en]
 *   [ja]イベントが発火したSplitViewオブジェクトです。[/ja]
 * @param {Number} event.width
 *   [en]Current width.[/en]
 *   [ja]現在のSplitViewnの幅です。[/ja]
 * @param {String} event.orientation
 *   [en]Current orientation.[/en]
 *   [ja]現在の画面のオリエンテーションを返します。"portrait"もしくは"landscape"です。[/ja]
 */

/**
 * @event postcollapse
 * @description
 *   [en]Fired just after the view is collapsed.[/en]
 *   [ja]collapse状態になった後に発火します。[/ja]
 * @param {Object} event
 *   [en]Event object.[/en]
 *   [ja]イベントオブジェクト。[/ja]
 * @param {Object} event.splitView
 *   [en]Split view object.[/en]
 *   [ja]イベントが発火したSplitViewオブジェクトです。[/ja]
 * @param {Number} event.width
 *   [en]Current width.[/en]
 *   [ja]現在のSplitViewnの幅です。[/ja]
 * @param {String} event.orientation
 *   [en]Current orientation.[/en]
 *   [ja]現在の画面のオリエンテーションを返します。"portrait"もしくは"landscape"です。[/ja]
 */

/**
 * @attribute var
 * @initonly
 * @type {String}
 * @description
 *   [en]Variable name to refer this split view.[/en]
 *   [ja]このスプリットビューコンポーネントを参照するための名前を指定します。[/ja]
 */

/**
 * @attribute main-page
 * @initonly
 * @type {String}
 * @description
 *   [en]The url of the page on the right.[/en]
 *   [ja]右側に表示するページのURLを指定します。[/ja]
 */

/**
 * @attribute main-page-width
 * @initonly
 * @type {Number}
 * @description
 *   [en]Main page width percentage. The secondary page width will be the remaining percentage.[/en]
 *   [ja]右側のページの幅をパーセント単位で指定します。[/ja]
 */

/**
 * @attribute secondary-page
 * @initonly
 * @type {String}
 * @description
 *   [en]The url of the page on the left.[/en]
 *   [ja]左側に表示するページのURLを指定します。[/ja]
 */

/**
 * @attribute collapse
 * @initonly
 * @type {String}
 * @description
 *   [en]
 *     Specify the collapse behavior. Valid values are portrait, landscape, width #px or a media query.
 *     "portrait" or "landscape" means the view will collapse when device is in landscape or portrait orientation.
 *     "width #px" means the view will collapse when the window width is smaller than the specified #px.
 *     If the value is a media query, the view will collapse when the media query is true.
 *   [/en]
 *   [ja]
 *     左側のページを非表示にする条件を指定します。portrait, landscape、width #pxもしくはメディアクエリの指定が可能です。
 *     portraitもしくはlandscapeを指定すると、デバイスの画面が縦向きもしくは横向きになった時に適用されます。
 *     width #pxを指定すると、画面が指定した横幅よりも短い場合に適用されます。
 *     メディアクエリを指定すると、指定したクエリに適合している場合に適用されます。
 *   [/ja]
 */

/**
 * @attribute ons-update
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "update" event is fired.[/en]
 *  [ja]"update"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-presplit
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "presplit" event is fired.[/en]
 *  [ja]"presplit"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-precollapse
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "precollapse" event is fired.[/en]
 *  [ja]"precollapse"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-postsplit
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postsplit" event is fired.[/en]
 *  [ja]"postsplit"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-postcollapse
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postcollapse" event is fired.[/en]
 *  [ja]"postcollapse"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-init
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "init" event is fired.[/en]
 *  [ja]ページの"init"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-show
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "show" event is fired.[/en]
 *  [ja]ページの"show"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-hide
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "hide" event is fired.[/en]
 *  [ja]ページの"hide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-destroy
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "destroy" event is fired.[/en]
 *  [ja]ページの"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @method setMainPage
 * @signature setMainPage(pageUrl)
 * @param {String} pageUrl
 *   [en]Page URL. Can be either an HTML document or an <ons-template>.[/en]
 *   [ja]pageのURLか、ons-templateで宣言したテンプレートのid属性の値を指定します。[/ja]
 * @description
 *   [en]Show the page specified in pageUrl in the right section[/en]
 *   [ja]指定したURLをメインページを読み込みます。[/ja]
 */

/**
 * @method setSecondaryPage
 * @signature setSecondaryPage(pageUrl)
 * @param {String} pageUrl
 *   [en]Page URL. Can be either an HTML document or an <ons-template>.[/en]
 *   [ja]pageのURLか、ons-templateで宣言したテンプレートのid属性の値を指定します。[/ja]
 * @description
 *   [en]Show the page specified in pageUrl in the left section[/en]
 *   [ja]指定したURLを左のページの読み込みます。[/ja]
 */

/**
 * @method update
 * @signature update()
 * @description
 *   [en]Trigger an 'update' event and try to determine if the split behavior should be changed.[/en]
 *   [ja]splitモードを変えるべきかどうかを判断するための'update'イベントを発火します。[/ja]
 */

/**
 * @method on
 * @signature on(eventName, listener)
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method once
 * @signature once(eventName, listener)
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method off
 * @signature off(eventName, [listener])
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]削除するイベントリスナーを指定します。[/ja]
 */

(function () {
  'use strict';

  var module = angular.module('onsen');

  module.directive('onsSplitView', ['$compile', 'SplitView', '$onsen', function ($compile, SplitView, $onsen) {

    return {
      restrict: 'E',
      replace: false,
      transclude: false,
      scope: true,

      compile: function compile(element, attrs) {
        var mainPage = element[0].querySelector('.main-page'),
            secondaryPage = element[0].querySelector('.secondary-page');

        if (mainPage) {
          var mainHtml = angular.element(mainPage).remove().html().trim();
        }

        if (secondaryPage) {
          var secondaryHtml = angular.element(secondaryPage).remove().html().trim();
        }

        return function (scope, element, attrs) {
          element.append(angular.element('<div></div>').addClass('onsen-split-view__secondary full-screen ons-split-view-inner'));
          element.append(angular.element('<div></div>').addClass('onsen-split-view__main full-screen ons-split-view-inner'));

          var splitView = new SplitView(scope, element, attrs);

          if (mainHtml && !attrs.mainPage) {
            splitView._appendMainPage(mainHtml);
          }

          if (secondaryHtml && !attrs.secondaryPage) {
            splitView._appendSecondPage(secondaryHtml);
          }

          $onsen.declareVarAttribute(attrs, splitView);
          $onsen.registerEventHandlers(splitView, 'update presplit precollapse postsplit postcollapse init show hide destroy');

          element.data('ons-split-view', splitView);

          scope.$on('$destroy', function () {
            splitView._events = undefined;
            element.data('ons-split-view', undefined);
          });

          $onsen.fireComponentEvent(element[0], 'init');
        };
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-splitter
 */

/**
 * @attribute var
 * @initonly
 * @type {String}
 * @description
 *   [en]Variable name to refer this split view.[/en]
 *   [ja]このスプリットビューコンポーネントを参照するための名前を指定します。[/ja]
 */

/**
 * @attribute ons-destroy
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
 *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @method on
 * @signature on(eventName, listener)
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method once
 * @signature once(eventName, listener)
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method off
 * @signature off(eventName, [listener])
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]削除するイベントリスナーを指定します。[/ja]
 */

(function () {
  'use strict';

  angular.module('onsen').directive('onsSplitter', ['$compile', 'Splitter', '$onsen', function ($compile, Splitter, $onsen) {
    return {
      restrict: 'E',
      scope: true,

      compile: function compile(element, attrs) {
        CustomElements.upgrade(element[0]);

        return function (scope, element, attrs) {
          CustomElements.upgrade(element[0]);

          var splitter = new Splitter(scope, element, attrs);

          $onsen.declareVarAttribute(attrs, splitter);
          $onsen.registerEventHandlers(splitter, 'destroy');

          element.data('ons-splitter', splitter);

          scope.$on('$destroy', function () {
            splitter._events = undefined;
            element.data('ons-splitter', undefined);
          });

          $onsen.fireComponentEvent(element[0], 'init');
        };
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-splitter-content
 */

/**
 * @attribute ons-destroy
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
 *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */
(function () {
  'use strict';

  var lastReady = window.OnsSplitterContentElement.rewritables.ready;
  window.OnsSplitterContentElement.rewritables.ready = ons._waitDiretiveInit('ons-splitter-content', lastReady);

  var lastLink = window.OnsSplitterContentElement.rewritables.link;
  window.OnsSplitterContentElement.rewritables.link = function (element, target, options, callback) {
    var view = angular.element(element).data('ons-splitter-content');
    lastLink(element, target, options, function (target) {
      view._link(target, callback);
    });
  };

  angular.module('onsen').directive('onsSplitterContent', ['$compile', 'SplitterContent', '$onsen', function ($compile, SplitterContent, $onsen) {
    return {
      restrict: 'E',

      compile: function compile(element, attrs) {
        CustomElements.upgrade(element[0]);

        return function (scope, element, attrs) {
          CustomElements.upgrade(element[0]);

          var view = new SplitterContent(scope, element, attrs);

          $onsen.declareVarAttribute(attrs, view);
          $onsen.registerEventHandlers(view, 'destroy');

          element.data('ons-splitter-content', view);

          scope.$on('$destroy', function () {
            view._events = undefined;
            element.data('ons-splitter-content', undefined);
          });

          $onsen.fireComponentEvent(element[0], 'init');
        };
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-splitter-side
 */

/**
 * @attribute ons-destroy
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "destroy" event is fired.[/en]
 *  [ja]"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-preopen
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "preopen" event is fired.[/en]
 *  [ja]"preopen"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-preclose
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "preclose" event is fired.[/en]
 *  [ja]"preclose"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-postopen
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postopen" event is fired.[/en]
 *  [ja]"postopen"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-postclose
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postclose" event is fired.[/en]
 *  [ja]"postclose"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */
(function () {
  'use strict';

  var lastReady = window.OnsSplitterSideElement.rewritables.ready;
  window.OnsSplitterSideElement.rewritables.ready = ons._waitDiretiveInit('ons-splitter-side', lastReady);

  var lastLink = window.OnsSplitterSideElement.rewritables.link;
  window.OnsSplitterSideElement.rewritables.link = function (element, target, options, callback) {
    var view = angular.element(element).data('ons-splitter-side');
    lastLink(element, target, options, function (target) {
      view._link(target, callback);
    });
  };

  angular.module('onsen').directive('onsSplitterSide', ['$compile', 'SplitterSide', '$onsen', function ($compile, SplitterSide, $onsen) {
    return {
      restrict: 'E',

      compile: function compile(element, attrs) {
        CustomElements.upgrade(element[0]);

        return function (scope, element, attrs) {
          CustomElements.upgrade(element[0]);

          var view = new SplitterSide(scope, element, attrs);

          $onsen.declareVarAttribute(attrs, view);
          $onsen.registerEventHandlers(view, 'destroy');

          element.data('ons-splitter-side', view);

          scope.$on('$destroy', function () {
            view._events = undefined;
            element.data('ons-splitter-side', undefined);
          });

          $onsen.fireComponentEvent(element[0], 'init');
        };
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-switch
 */

/**
 * @attribute var
 * @initonly
 * @type {String}
 * @description
 *   [en]Variable name to refer this switch.[/en]
 *   [ja]JavaScriptから参照するための変数名を指定します。[/ja]
 */

/**
 * @method on
 * @signature on(eventName, listener)
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method once
 * @signature once(eventName, listener)
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method off
 * @signature off(eventName, [listener])
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]削除するイベントリスナーを指定します。[/ja]
 */

(function () {
  'use strict';

  angular.module('onsen').directive('onsSwitch', ['$onsen', 'SwitchView', function ($onsen, SwitchView) {
    return {
      restrict: 'E',
      replace: false,
      scope: true,

      link: function link(scope, element, attrs) {
        CustomElements.upgrade(element[0]);

        if (attrs.ngController) {
          throw new Error('This element can\'t accept ng-controller directive.');
        }

        var switchView = new SwitchView(element, scope, attrs);
        $onsen.addModifierMethodsForCustomElements(switchView, element);

        $onsen.declareVarAttribute(attrs, switchView);
        element.data('ons-switch', switchView);

        $onsen.cleaner.onDestroy(scope, function () {
          switchView._events = undefined;
          $onsen.removeModifierMethods(switchView);
          element.data('ons-switch', undefined);
          $onsen.clearComponent({
            element: element,
            scope: scope,
            attrs: attrs
          });
          element = attrs = scope = null;
        });

        $onsen.fireComponentEvent(element[0], 'init');
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

(function () {
  'use strict';

  tab.$inject = ['$onsen'];
  angular.module('onsen').directive('onsTab', tab).directive('onsTabbarItem', tab); // for BC

  function tab($onsen) {
    return {
      restrict: 'E',
      link: function link(scope, element, attrs) {
        CustomElements.upgrade(element[0]);
        $onsen.fireComponentEvent(element[0], 'init');
      }
    };
  }
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-tabbar
 */

/**
 * @attribute var
 * @initonly
 * @type {String}
 * @description
 *   [en]Variable name to refer this tab bar.[/en]
 *   [ja]このタブバーを参照するための名前を指定します。[/ja]
 */

/**
 * @attribute hide-tabs
 * @initonly
 * @type {Boolean}
 * @default false
 * @description
 *   [en]Whether to hide the tabs. Valid values are true/false.[/en]
 *   [ja]タブを非表示にする場合に指定します。trueもしくはfalseを指定できます。[/ja]
 */

/**
 * @attribute ons-reactive
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "reactive" event is fired.[/en]
 *  [ja]"reactive"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-prechange
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "prechange" event is fired.[/en]
 *  [ja]"prechange"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-postchange
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when the "postchange" event is fired.[/en]
 *  [ja]"postchange"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-init
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "init" event is fired.[/en]
 *  [ja]ページの"init"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-show
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "show" event is fired.[/en]
 *  [ja]ページの"show"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-hide
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "hide" event is fired.[/en]
 *  [ja]ページの"hide"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @attribute ons-destroy
 * @initonly
 * @type {Expression}
 * @description
 *  [en]Allows you to specify custom behavior when a page's "destroy" event is fired.[/en]
 *  [ja]ページの"destroy"イベントが発火された時の挙動を独自に指定できます。[/ja]
 */

/**
 * @method on
 * @signature on(eventName, listener)
 * @description
 *   [en]Add an event listener.[/en]
 *   [ja]イベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]このイベントが発火された際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method once
 * @signature once(eventName, listener)
 * @description
 *  [en]Add an event listener that's only triggered once.[/en]
 *  [ja]一度だけ呼び出されるイベントリスナーを追加します。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]イベントが発火した際に呼び出される関数オブジェクトを指定します。[/ja]
 */

/**
 * @method off
 * @signature off(eventName, [listener])
 * @description
 *  [en]Remove an event listener. If the listener is not specified all listeners for the event type will be removed.[/en]
 *  [ja]イベントリスナーを削除します。もしイベントリスナーを指定しなかった場合には、そのイベントに紐づく全てのイベントリスナーが削除されます。[/ja]
 * @param {String} eventName
 *   [en]Name of the event.[/en]
 *   [ja]イベント名を指定します。[/ja]
 * @param {Function} listener
 *   [en]Function to execute when the event is triggered.[/en]
 *   [ja]削除するイベントリスナーを指定します。[/ja]
 */

(function () {
  'use strict';

  var lastReady = window.OnsTabbarElement.rewritables.ready;
  window.OnsTabbarElement.rewritables.ready = ons._waitDiretiveInit('ons-tabbar', lastReady);

  var lastLink = window.OnsTabbarElement.rewritables.link;
  window.OnsTabbarElement.rewritables.link = function (tabbarElement, target, options, callback) {
    var view = angular.element(tabbarElement).data('ons-tabbar');
    view._compileAndLink(target, function (target) {
      lastLink(tabbarElement, target, options, callback);
    });
  };

  var lastUnlink = window.OnsTabbarElement.rewritables.unlink;
  window.OnsTabbarElement.rewritables.unlink = function (tabbarElement, target, callback) {
    angular.element(target).data('_scope').$destroy();
    lastUnlink(tabbarElement, target, callback);
  };

  angular.module('onsen').directive('onsTabbar', ['$onsen', '$compile', '$parse', 'TabbarView', function ($onsen, $compile, $parse, TabbarView) {

    return {
      restrict: 'E',

      replace: false,
      scope: true,

      link: function link(scope, element, attrs, controller) {

        CustomElements.upgrade(element[0]);

        scope.$watch(attrs.hideTabs, function (hide) {
          if (typeof hide === 'string') {
            hide = hide === 'true';
          }
          element[0].setTabbarVisibility(!hide);
        });

        var tabbarView = new TabbarView(scope, element, attrs);
        $onsen.addModifierMethodsForCustomElements(tabbarView, element);

        $onsen.registerEventHandlers(tabbarView, 'reactive prechange postchange init show hide destroy');

        element.data('ons-tabbar', tabbarView);
        $onsen.declareVarAttribute(attrs, tabbarView);

        scope.$on('$destroy', function () {
          tabbarView._events = undefined;
          $onsen.removeModifierMethods(tabbarView);
          element.data('ons-tabbar', undefined);
        });

        $onsen.fireComponentEvent(element[0], 'init');
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

(function () {
  'use strict';

  angular.module('onsen').directive('onsTemplate', ['$templateCache', function ($templateCache) {
    return {
      restrict: 'E',
      terminal: true,
      compile: function compile(element) {
        CustomElements.upgrade(element[0]);
        var content = element[0].template || element.html();
        $templateCache.put(element.attr('id'), content);
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-toolbar
 */

/**
 * @attribute var
 * @initonly
 * @type {String}
 * @description
 *  [en]Variable name to refer this toolbar.[/en]
 *  [ja]このツールバーを参照するための名前を指定します。[/ja]
 */
(function () {
  'use strict';

  angular.module('onsen').directive('onsToolbar', ['$onsen', 'GenericView', function ($onsen, GenericView) {
    return {
      restrict: 'E',

      // NOTE: This element must coexists with ng-controller.
      // Do not use isolated scope and template's ng-transclude.
      scope: false,
      transclude: false,

      compile: function compile(element) {
        CustomElements.upgrade(element[0]);
        return {
          pre: function pre(scope, element, attrs) {
            // TODO: Remove this dirty fix!
            if (element[0].nodeName === 'ons-toolbar') {
              CustomElements.upgrade(element[0]);
              GenericView.register(scope, element, attrs, { viewKey: 'ons-toolbar' });
              element[0]._ensureNodePosition();
            }
          },
          post: function post(scope, element, attrs) {
            $onsen.fireComponentEvent(element[0], 'init');
          }
        };
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/**
 * @element ons-toolbar-button
 */

/**
 * @attribute var
 * @initonly
 * @type {String}
 * @description
 *   [en]Variable name to refer this button.[/en]
 *   [ja]このボタンを参照するための名前を指定します。[/ja]
 */
(function () {
  'use strict';

  var module = angular.module('onsen');

  module.directive('onsToolbarButton', ['$onsen', 'GenericView', function ($onsen, GenericView) {
    return {
      restrict: 'E',
      scope: false,
      link: {
        pre: function pre(scope, element, attrs) {
          CustomElements.upgrade(element[0]);
          var toolbarButton = new GenericView(scope, element, attrs);
          element.data('ons-toolbar-button', toolbarButton);
          $onsen.declareVarAttribute(attrs, toolbarButton);

          $onsen.addModifierMethodsForCustomElements(toolbarButton, element);

          $onsen.cleaner.onDestroy(scope, function () {
            toolbarButton._events = undefined;
            $onsen.removeModifierMethods(toolbarButton);
            element.data('ons-toolbar-button', undefined);
            element = null;

            $onsen.clearComponent({
              scope: scope,
              attrs: attrs,
              element: element
            });
            scope = element = attrs = null;
          });
        },
        post: function post(scope, element, attrs) {
          $onsen.fireComponentEvent(element[0], 'init');
        }
      }
    };
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  var module = angular.module('onsen');

  var ComponentCleaner = {
    /**
     * @param {jqLite} element
     */
    decomposeNode: function decomposeNode(element) {
      var children = element.remove().children();
      for (var i = 0; i < children.length; i++) {
        ComponentCleaner.decomposeNode(angular.element(children[i]));
      }
    },

    /**
     * @param {Attributes} attrs
     */
    destroyAttributes: function destroyAttributes(attrs) {
      attrs.$$element = null;
      attrs.$$observers = null;
    },

    /**
     * @param {jqLite} element
     */
    destroyElement: function destroyElement(element) {
      element.remove();
    },

    /**
     * @param {Scope} scope
     */
    destroyScope: function destroyScope(scope) {
      scope.$$listeners = {};
      scope.$$watchers = null;
      scope = null;
    },

    /**
     * @param {Scope} scope
     * @param {Function} fn
     */
    onDestroy: function onDestroy(scope, fn) {
      var clear = scope.$on('$destroy', function () {
        clear();
        fn.apply(null, arguments);
      });
    }
  };

  module.factory('ComponentCleaner', function () {
    return ComponentCleaner;
  });

  // override builtin ng-(eventname) directives
  (function () {
    var ngEventDirectives = {};
    'click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste'.split(' ').forEach(function (name) {
      var directiveName = directiveNormalize('ng-' + name);
      ngEventDirectives[directiveName] = ['$parse', function ($parse) {
        return {
          compile: function compile($element, attr) {
            var fn = $parse(attr[directiveName]);
            return function (scope, element, attr) {
              var listener = function listener(event) {
                scope.$apply(function () {
                  fn(scope, { $event: event });
                });
              };
              element.on(name, listener);

              ComponentCleaner.onDestroy(scope, function () {
                element.off(name, listener);
                element = null;

                ComponentCleaner.destroyScope(scope);
                scope = null;

                ComponentCleaner.destroyAttributes(attr);
                attr = null;
              });
            };
          }
        };
      }];

      function directiveNormalize(name) {
        return name.replace(/-([a-z])/g, function (matches) {
          return matches[1].toUpperCase();
        });
      }
    });
    module.config(['$provide', function ($provide) {
      var shift = function shift($delegate) {
        $delegate.shift();
        return $delegate;
      };
      Object.keys(ngEventDirectives).forEach(function (directiveName) {
        $provide.decorator(directiveName + 'Directive', ['$delegate', shift]);
      });
    }]);
    Object.keys(ngEventDirectives).forEach(function (directiveName) {
      module.directive(directiveName, ngEventDirectives[directiveName]);
    });
  })();
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  var module = angular.module('onsen');

  /**
   * Internal service class for framework implementation.
   */
  module.factory('$onsen', ['$rootScope', '$window', '$cacheFactory', '$document', '$templateCache', '$http', '$q', '$onsGlobal', 'ComponentCleaner', function ($rootScope, $window, $cacheFactory, $document, $templateCache, $http, $q, $onsGlobal, ComponentCleaner) {

    var $onsen = createOnsenService();
    var ModifierUtil = $onsGlobal._internal.ModifierUtil;

    return $onsen;

    function createOnsenService() {
      return {

        DIRECTIVE_TEMPLATE_URL: 'templates',

        cleaner: ComponentCleaner,

        DeviceBackButtonHandler: $onsGlobal._deviceBackButtonDispatcher,

        _defaultDeviceBackButtonHandler: $onsGlobal._defaultDeviceBackButtonHandler,

        /**
         * @return {Object}
         */
        getDefaultDeviceBackButtonHandler: function getDefaultDeviceBackButtonHandler() {
          return this._defaultDeviceBackButtonHandler;
        },

        /**
         * @param {Object} view
         * @param {Element} element
         * @param {Array} methodNames
         * @return {Function} A function that dispose all driving methods.
         */
        deriveMethods: function deriveMethods(view, element, methodNames) {
          methodNames.forEach(function (methodName) {
            view[methodName] = function () {
              return element[methodName].apply(element, arguments);
            };
          });

          return function () {
            methodNames.forEach(function (methodName) {
              view[methodName] = null;
            });
            view = element = null;
          };
        },

        /**
         * @param {Class} klass
         * @param {Array} properties
         */
        derivePropertiesFromElement: function derivePropertiesFromElement(klass, properties) {
          properties.forEach(function (property) {
            Object.defineProperty(klass.prototype, property, {
              get: function get() {
                return this._element[0][property];
              },
              set: function set(value) {
                return this._element[0][property] = value; // eslint-disable-line no-return-assign
              }
            });
          });
        },

        /**
         * @param {Object} view
         * @param {Element} element
         * @param {Array} eventNames
         * @param {Function} [map]
         * @return {Function} A function that clear all event listeners
         */
        deriveEvents: function deriveEvents(view, element, eventNames, map) {
          map = map || function (detail) {
            return detail;
          };
          eventNames = [].concat(eventNames);
          var listeners = [];

          eventNames.forEach(function (eventName) {
            var listener = function listener(event) {
              view.emit(eventName, map(Object.create(event.detail)));
            };
            listeners.push(listener);
            element.addEventListener(eventName, listener, false);
          });

          return function () {
            eventNames.forEach(function (eventName, index) {
              element.removeEventListener(eventName, listeners[index], false);
            });
            view = element = listeners = map = null;
          };
        },

        /**
         * @return {Boolean}
         */
        isEnabledAutoStatusBarFill: function isEnabledAutoStatusBarFill() {
          return !!$onsGlobal._config.autoStatusBarFill;
        },

        /**
         * @return {Boolean}
         */
        shouldFillStatusBar: $onsGlobal.shouldFillStatusBar,

        /**
         * @param {Function} action
         */
        autoStatusBarFill: $onsGlobal.autoStatusBarFill,

        /**
         * @param {Object} params
         * @param {Scope} [params.scope]
         * @param {jqLite} [params.element]
         * @param {Array} [params.elements]
         * @param {Attributes} [params.attrs]
         */
        clearComponent: function clearComponent(params) {
          if (params.scope) {
            ComponentCleaner.destroyScope(params.scope);
          }

          if (params.attrs) {
            ComponentCleaner.destroyAttributes(params.attrs);
          }

          if (params.element) {
            ComponentCleaner.destroyElement(params.element);
          }

          if (params.elements) {
            params.elements.forEach(function (element) {
              ComponentCleaner.destroyElement(element);
            });
          }
        },

        /**
         * @param {jqLite} element
         * @param {String} name
         */
        findElementeObject: function findElementeObject(element, name) {
          return element.inheritedData(name);
        },

        /**
         * @param {String} page
         * @return {Promise}
         */
        getPageHTMLAsync: function getPageHTMLAsync(page) {
          var cache = $templateCache.get(page);

          if (cache) {
            var deferred = $q.defer();

            var html = typeof cache === 'string' ? cache : cache[1];
            deferred.resolve(this.normalizePageHTML(html));

            return deferred.promise;
          } else {
            return $http({
              url: page,
              method: 'GET'
            }).then(function (response) {
              var html = response.data;

              return this.normalizePageHTML(html);
            }.bind(this));
          }
        },

        /**
         * @param {String} html
         * @return {String}
         */
        normalizePageHTML: function normalizePageHTML(html) {
          html = ('' + html).trim();

          if (!html.match(/^<ons-page/)) {
            html = '<ons-page _muted>' + html + '</ons-page>';
          }

          return html;
        },

        /**
         * Create modifier templater function. The modifier templater generate css classes bound modifier name.
         *
         * @param {Object} attrs
         * @param {Array} [modifiers] an array of appendix modifier
         * @return {Function}
         */
        generateModifierTemplater: function generateModifierTemplater(attrs, modifiers) {
          var attrModifiers = attrs && typeof attrs.modifier === 'string' ? attrs.modifier.trim().split(/ +/) : [];
          modifiers = angular.isArray(modifiers) ? attrModifiers.concat(modifiers) : attrModifiers;

          /**
           * @return {String} template eg. 'ons-button--*', 'ons-button--*__item'
           * @return {String}
           */
          return function (template) {
            return modifiers.map(function (modifier) {
              return template.replace('*', modifier);
            }).join(' ');
          };
        },

        /**
         * Add modifier methods to view object for custom elements.
         *
         * @param {Object} view object
         * @param {jqLite} element
         */
        addModifierMethodsForCustomElements: function addModifierMethodsForCustomElements(view, element) {
          var methods = {
            hasModifier: function hasModifier(needle) {
              var tokens = ModifierUtil.split(element.attr('modifier'));
              needle = typeof needle === 'string' ? needle.trim() : '';

              return ModifierUtil.split(needle).some(function (needle) {
                return tokens.indexOf(needle) != -1;
              });
            },

            removeModifier: function removeModifier(needle) {
              needle = typeof needle === 'string' ? needle.trim() : '';

              var modifier = ModifierUtil.split(element.attr('modifier')).filter(function (token) {
                return token !== needle;
              }).join(' ');

              element.attr('modifier', modifier);
            },

            addModifier: function addModifier(modifier) {
              element.attr('modifier', element.attr('modifier') + ' ' + modifier);
            },

            setModifier: function setModifier(modifier) {
              element.attr('modifier', modifier);
            },

            toggleModifier: function toggleModifier(modifier) {
              if (this.hasModifier(modifier)) {
                this.removeModifier(modifier);
              } else {
                this.addModifier(modifier);
              }
            }
          };

          for (var method in methods) {
            if (methods.hasOwnProperty(method)) {
              view[method] = methods[method];
            }
          }
        },

        /**
         * Add modifier methods to view object.
         *
         * @param {Object} view object
         * @param {String} template
         * @param {jqLite} element
         */
        addModifierMethods: function addModifierMethods(view, template, element) {
          var _tr = function _tr(modifier) {
            return template.replace('*', modifier);
          };

          var fns = {
            hasModifier: function hasModifier(modifier) {
              return element.hasClass(_tr(modifier));
            },

            removeModifier: function removeModifier(modifier) {
              element.removeClass(_tr(modifier));
            },

            addModifier: function addModifier(modifier) {
              element.addClass(_tr(modifier));
            },

            setModifier: function setModifier(modifier) {
              var classes = element.attr('class').split(/\s+/),
                  patt = template.replace('*', '.');

              for (var i = 0; i < classes.length; i++) {
                var cls = classes[i];

                if (cls.match(patt)) {
                  element.removeClass(cls);
                }
              }

              element.addClass(_tr(modifier));
            },

            toggleModifier: function toggleModifier(modifier) {
              var cls = _tr(modifier);
              if (element.hasClass(cls)) {
                element.removeClass(cls);
              } else {
                element.addClass(cls);
              }
            }
          };

          var append = function append(oldFn, newFn) {
            if (typeof oldFn !== 'undefined') {
              return function () {
                return oldFn.apply(null, arguments) || newFn.apply(null, arguments);
              };
            } else {
              return newFn;
            }
          };

          view.hasModifier = append(view.hasModifier, fns.hasModifier);
          view.removeModifier = append(view.removeModifier, fns.removeModifier);
          view.addModifier = append(view.addModifier, fns.addModifier);
          view.setModifier = append(view.setModifier, fns.setModifier);
          view.toggleModifier = append(view.toggleModifier, fns.toggleModifier);
        },

        /**
         * Remove modifier methods.
         *
         * @param {Object} view object
         */
        removeModifierMethods: function removeModifierMethods(view) {
          view.hasModifier = view.removeModifier = view.addModifier = view.setModifier = view.toggleModifier = undefined;
        },

        /**
         * Define a variable to JavaScript global scope and AngularJS scope as 'var' attribute name.
         *
         * @param {Object} attrs
         * @param object
         */
        declareVarAttribute: function declareVarAttribute(attrs, object) {
          if (typeof attrs.var === 'string') {
            var varName = attrs.var;
            this._defineVar(varName, object);
          }
        },

        _registerEventHandler: function _registerEventHandler(component, eventName) {
          var capitalizedEventName = eventName.charAt(0).toUpperCase() + eventName.slice(1);

          component.on(eventName, function (event) {
            $onsen.fireComponentEvent(component._element[0], eventName, event);

            var handler = component._attrs['ons' + capitalizedEventName];
            if (handler) {
              component._scope.$eval(handler, { $event: event });
              component._scope.$evalAsync();
            }
          });
        },

        /**
         * Register event handlers for attributes.
         *
         * @param {Object} component
         * @param {String} eventNames
         */
        registerEventHandlers: function registerEventHandlers(component, eventNames) {
          eventNames = eventNames.trim().split(/\s+/);

          for (var i = 0, l = eventNames.length; i < l; i++) {
            var eventName = eventNames[i];
            this._registerEventHandler(component, eventName);
          }
        },

        /**
         * @return {Boolean}
         */
        isAndroid: function isAndroid() {
          return !!window.navigator.userAgent.match(/android/i);
        },

        /**
         * @return {Boolean}
         */
        isIOS: function isIOS() {
          return !!window.navigator.userAgent.match(/(ipad|iphone|ipod touch)/i);
        },

        /**
         * @return {Boolean}
         */
        isWebView: function isWebView() {
          return window.ons.isWebView();
        },

        /**
         * @return {Boolean}
         */
        isIOS7above: function () {
          var ua = window.navigator.userAgent;
          var match = ua.match(/(iPad|iPhone|iPod touch);.*CPU.*OS (\d+)_(\d+)/i);

          var result = match ? parseFloat(match[2] + '.' + match[3]) >= 7 : false;

          return function () {
            return result;
          };
        }(),

        /**
         * Fire a named event for a component. The view object, if it exists, is attached to event.component.
         *
         * @param {HTMLElement} [dom]
         * @param {String} event name
         */
        fireComponentEvent: function fireComponentEvent(dom, eventName, data) {
          data = data || {};

          var event = document.createEvent('HTMLEvents');

          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              event[key] = data[key];
            }
          }

          event.component = dom ? angular.element(dom).data(dom.nodeName.toLowerCase()) || null : null;
          event.initEvent(dom.nodeName.toLowerCase() + ':' + eventName, true, true);

          dom.dispatchEvent(event);
        },

        /**
         * Define a variable to JavaScript global scope and AngularJS scope.
         *
         * Util.defineVar('foo', 'foo-value');
         * // => window.foo and $scope.foo is now 'foo-value'
         *
         * Util.defineVar('foo.bar', 'foo-bar-value');
         * // => window.foo.bar and $scope.foo.bar is now 'foo-bar-value'
         *
         * @param {String} name
         * @param object
         */
        _defineVar: function _defineVar(name, object) {
          var names = name.split(/\./);

          function set(container, names, object) {
            var name;
            for (var i = 0; i < names.length - 1; i++) {
              name = names[i];
              if (container[name] === undefined || container[name] === null) {
                container[name] = {};
              }
              container = container[name];
            }

            container[names[names.length - 1]] = object;

            if (container[names[names.length - 1]] !== object) {
              throw new Error('Cannot set var="' + object._attrs.var + '" because it will overwrite a read-only variable.');
            }
          }

          if (ons.componentBase) {
            set(ons.componentBase, names, object);
          }

          // Attach to ancestor with ons-scope attribute.
          var element = object._element[0];

          while (element.parentNode) {
            if (element.hasAttribute('ons-scope')) {
              set(angular.element(element).data('_scope'), names, object);
              element = null;
              return;
            }

            element = element.parentNode;
          }
          element = null;

          // If no ons-scope element was found, attach to $rootScope.
          set($rootScope, names, object);
        }
      };
    }
  }]);
})();
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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

['alert', 'confirm', 'prompt'].forEach(function (name) {
  ons.notification[name] = function (message) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    typeof message === 'string' ? options.message = message : options = message;

    var compile = options.compile;

    options.compile = function (element) {
      var $element = angular.element(compile ? compile(element) : element);
      return ons.$compile($element)($element.injector().get('$rootScope'));
    };

    return ons.notification['_' + name + 'Original'](options);
  };
});
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

// confirm to use jqLite
if (window.jQuery && angular.element === window.jQuery) {
  console.warn('Onsen UI require jqLite. Load jQuery after loading AngularJS to fix this error. jQuery may break Onsen UI behavior.'); // eslint-disable-line no-console
}
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

/*
Copyright 2013-2015 ASIAL CORPORATION

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

(function () {
  'use strict';

  angular.module('onsen').run(['$templateCache', function ($templateCache) {
    var templates = window.document.querySelectorAll('script[type="text/ons-template"]');

    for (var i = 0; i < templates.length; i++) {
      var template = angular.element(templates[i]);
      var id = template.attr('id');
      if (typeof id === 'string') {
        $templateCache.put(id, template.text());
      }
    }
  }]);
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzLmpzIiwidGVtcGxhdGVzLmpzIiwib25zZW4uanMiLCJhbGVydERpYWxvZy5qcyIsImFsZXJ0RGlhbG9nQW5pbWF0b3IuanMiLCJhbmltYXRpb25DaG9vc2VyLmpzIiwiY2Fyb3VzZWwuanMiLCJkaWFsb2cuanMiLCJkaWFsb2dBbmltYXRvci5qcyIsImdlbmVyaWMuanMiLCJsYXp5UmVwZWF0LmpzIiwibGF6eVJlcGVhdERlbGVnYXRlLmpzIiwibW9kYWwuanMiLCJuYXZpZ2F0b3IuanMiLCJuYXZpZ2F0b3JUcmFuc2l0aW9uQW5pbWF0b3IuanMiLCJvdmVybGF5U2xpZGluZ01lbnVBbmltYXRvci5qcyIsInBhZ2UuanMiLCJwb3BvdmVyLmpzIiwicG9wb3ZlckFuaW1hdG9yLmpzIiwicHVsbEhvb2suanMiLCJwdXNoU2xpZGluZ01lbnVBbmltYXRvci5qcyIsInJldmVhbFNsaWRpbmdNZW51QW5pbWF0b3IuanMiLCJzbGlkaW5nTWVudS5qcyIsInNsaWRpbmdNZW51QW5pbWF0b3IuanMiLCJzcGxpdFZpZXcuanMiLCJzcGxpdHRlci1jb250ZW50LmpzIiwic3BsaXR0ZXItc2lkZS5qcyIsInNwbGl0dGVyLmpzIiwic3dpdGNoLmpzIiwidGFiYmFyVmlldy5qcyIsImJhY2tCdXR0b24uanMiLCJib3R0b21Ub29sYmFyLmpzIiwiYnV0dG9uLmpzIiwiZHVtbXlGb3JJbml0LmpzIiwiZ2VzdHVyZURldGVjdG9yLmpzIiwiaWNvbi5qcyIsImlmT3JpZW50YXRpb24uanMiLCJpZlBsYXRmb3JtLmpzIiwiaW5wdXQuanMiLCJrZXlib2FyZC5qcyIsImxpc3QuanMiLCJsaXN0SGVhZGVyLmpzIiwibGlzdEl0ZW0uanMiLCJsb2FkaW5nUGxhY2Vob2xkZXIuanMiLCJwcm9ncmVzc0Jhci5qcyIsInJhbmdlLmpzIiwicmlwcGxlLmpzIiwic2NvcGUuanMiLCJzcGxpdHRlckNvbnRlbnQuanMiLCJzcGxpdHRlclNpZGUuanMiLCJ0YWIuanMiLCJ0YWJCYXIuanMiLCJ0ZW1wbGF0ZS5qcyIsInRvb2xiYXIuanMiLCJ0b29sYmFyQnV0dG9uLmpzIiwiY29tcG9uZW50Q2xlYW5lci5qcyIsIm5vdGlmaWNhdGlvbi5qcyIsInNldHVwLmpzIiwidGVtcGxhdGVMb2FkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7OztBQUtBLENBQUMsWUFBVTtFQUNULElBQUksZUFBZTtNQUFPLFNBQVMsTUFBTSxLQUFLLFlBQVU7SUFFdEQ7T0FGZ0UsZUFBZTs7O0VBTWpGLEtBSEssUUFBUSxZQUFVOzs7RUFNdkIsTUFITSxTQUFTLFVBQVMsTUFBTTtJQUk1QixJQUhJLFNBQVMsS0FBSzs7OztJQU9sQixlQUhlO0lBSWYsSUFISSxZQUFZLElBQUk7SUFJcEIsZUFIZTs7O0lBTWYsS0FISyxJQUFJLFFBQVEsTUFBTTs7TUFLckIsVUFIVSxRQUFRLE9BQU8sS0FBSyxTQUFTLGNBQ3JDLE9BQU8sT0FBTyxTQUFTLGNBQWMsT0FBTyxLQUFLLEtBQUssU0FDckQsVUFBUyxNQUFNLElBQUc7UUFFbkIsT0FEUyxZQUFXO1VBRWxCLElBRE0sTUFBTSxLQUFLOzs7O1VBS2pCLEtBRE8sU0FBUyxPQUFPOzs7O1VBS3ZCLElBRE0sTUFBTSxHQUFHLE1BQU0sTUFBTTtVQUUzQixLQURPLFNBQVM7O1VBR2hCLE9BRFM7O1FBRVIsTUFBTSxLQUFLLFNBQ2QsS0FBSzs7OztJQUlULFNBQVMsUUFBUTs7TUFFZixJQUFLLENBQUMsZ0JBQWdCLEtBQUssTUFDekIsS0FBSyxLQUFLLE1BQU0sTUFBTTs7OztJQUcxQixNQUNNLFlBQVk7OztJQUVsQixNQUNNLFVBQVUsY0FBYzs7O0lBRTlCLE1BQ00sU0FBUyxVQUFVOztJQUN6QixPQUNPOztLQXhEWDtBQ0xBO0FBQ0EsQ0FBQyxVQUFTLEtBQUs7SUFDWCxJQUFBO1FBQ0ksTUFESSxRQUFRLE9BQU87TUFDM0IsT0FBTSxLQUFLO1FBRUgsTUFGVyxRQUFRLE9BQU8sa0JBQWtCOztJQUloRCxJQUhBLElBQUksQ0FBQyxrQkFBa0IsVUFB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ZmlsZSI6ImFuZ3VsYXItb25zZW51aS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIFNpbXBsZSBKYXZhU2NyaXB0IEluaGVyaXRhbmNlXG4gKiBCeSBKb2huIFJlc2lnIGh0dHA6Ly9lam9obi5vcmcvXG4gKiBNSVQgTGljZW5zZWQuXG4gKi9cbi8vIEluc3BpcmVkIGJ5IGJhc2UyIGFuZCBQcm90b3R5cGVcbihmdW5jdGlvbigpe1xuICB2YXIgaW5pdGlhbGl6aW5nID0gZmFsc2UsIGZuVGVzdCA9IC94eXovLnRlc3QoZnVuY3Rpb24oKXt4eXo7fSkgPyAvXFxiX3N1cGVyXFxiLyA6IC8uKi87XG4gXG4gIC8vIFRoZSBiYXNlIENsYXNzIGltcGxlbWVudGF0aW9uIChkb2VzIG5vdGhpbmcpXG4gIHRoaXMuQ2xhc3MgPSBmdW5jdGlvbigpe307XG4gXG4gIC8vIENyZWF0ZSBhIG5ldyBDbGFzcyB0aGF0IGluaGVyaXRzIGZyb20gdGhpcyBjbGFzc1xuICBDbGFzcy5leHRlbmQgPSBmdW5jdGlvbihwcm9wKSB7XG4gICAgdmFyIF9zdXBlciA9IHRoaXMucHJvdG90eXBlO1xuICAgXG4gICAgLy8gSW5zdGFudGlhdGUgYSBiYXNlIGNsYXNzIChidXQgb25seSBjcmVhdGUgdGhlIGluc3RhbmNlLFxuICAgIC8vIGRvbid0IHJ1biB0aGUgaW5pdCBjb25zdHJ1Y3RvcilcbiAgICBpbml0aWFsaXppbmcgPSB0cnVlO1xuICAgIHZhciBwcm90b3R5cGUgPSBuZXcgdGhpcygpO1xuICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgXG4gICAgLy8gQ29weSB0aGUgcHJvcGVydGllcyBvdmVyIG9udG8gdGhlIG5ldyBwcm90b3R5cGVcbiAgICBmb3IgKHZhciBuYW1lIGluIHByb3ApIHtcbiAgICAgIC8vIENoZWNrIGlmIHdlJ3JlIG92ZXJ3cml0aW5nIGFuIGV4aXN0aW5nIGZ1bmN0aW9uXG4gICAgICBwcm90b3R5cGVbbmFtZV0gPSB0eXBlb2YgcHJvcFtuYW1lXSA9PSBcImZ1bmN0aW9uXCIgJiZcbiAgICAgICAgdHlwZW9mIF9zdXBlcltuYW1lXSA9PSBcImZ1bmN0aW9uXCIgJiYgZm5UZXN0LnRlc3QocHJvcFtuYW1lXSkgP1xuICAgICAgICAoZnVuY3Rpb24obmFtZSwgZm4pe1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0bXAgPSB0aGlzLl9zdXBlcjtcbiAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBBZGQgYSBuZXcgLl9zdXBlcigpIG1ldGhvZCB0aGF0IGlzIHRoZSBzYW1lIG1ldGhvZFxuICAgICAgICAgICAgLy8gYnV0IG9uIHRoZSBzdXBlci1jbGFzc1xuICAgICAgICAgICAgdGhpcy5fc3VwZXIgPSBfc3VwZXJbbmFtZV07XG4gICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVGhlIG1ldGhvZCBvbmx5IG5lZWQgdG8gYmUgYm91bmQgdGVtcG9yYXJpbHksIHNvIHdlXG4gICAgICAgICAgICAvLyByZW1vdmUgaXQgd2hlbiB3ZSdyZSBkb25lIGV4ZWN1dGluZ1xuICAgICAgICAgICAgdmFyIHJldCA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7ICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuX3N1cGVyID0gdG1wO1xuICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkobmFtZSwgcHJvcFtuYW1lXSkgOlxuICAgICAgICBwcm9wW25hbWVdO1xuICAgIH1cbiAgIFxuICAgIC8vIFRoZSBkdW1teSBjbGFzcyBjb25zdHJ1Y3RvclxuICAgIGZ1bmN0aW9uIENsYXNzKCkge1xuICAgICAgLy8gQWxsIGNvbnN0cnVjdGlvbiBpcyBhY3R1YWxseSBkb25lIGluIHRoZSBpbml0IG1ldGhvZFxuICAgICAgaWYgKCAhaW5pdGlhbGl6aW5nICYmIHRoaXMuaW5pdCApXG4gICAgICAgIHRoaXMuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgIFxuICAgIC8vIFBvcHVsYXRlIG91ciBjb25zdHJ1Y3RlZCBwcm90b3R5cGUgb2JqZWN0XG4gICAgQ2xhc3MucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICAgXG4gICAgLy8gRW5mb3JjZSB0aGUgY29uc3RydWN0b3IgdG8gYmUgd2hhdCB3ZSBleHBlY3RcbiAgICBDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDbGFzcztcbiBcbiAgICAvLyBBbmQgbWFrZSB0aGlzIGNsYXNzIGV4dGVuZGFibGVcbiAgICBDbGFzcy5leHRlbmQgPSBhcmd1bWVudHMuY2FsbGVlO1xuICAgXG4gICAgcmV0dXJuIENsYXNzO1xuICB9O1xufSkoKTsiLCIvL0hFQUQgXG4oZnVuY3Rpb24oYXBwKSB7XG50cnkgeyBhcHAgPSBhbmd1bGFyLm1vZHVsZShcInRlbXBsYXRlcy1tYWluXCIpOyB9XG5jYXRjaChlcnIpIHsgYXBwID0gYW5ndWxhci5tb2R1bGUoXCJ0ZW1wbGF0ZXMtbWFpblwiLCBbXSk7IH1cbmFwcC5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIiwgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcblwidXNlIHN0cmljdFwiO1xuXG4kdGVtcGxhdGVDYWNoZS5wdXQoXCJ0ZW1wbGF0ZXMvc2xpZGluZ19tZW51LnRwbFwiLFwiPGRpdiBjbGFzcz1cXFwib25zZW4tc2xpZGluZy1tZW51X19tZW51IG9ucy1zbGlkaW5nLW1lbnUtaW5uZXJcXFwiPjwvZGl2PlxcblwiICtcbiAgICBcIjxkaXYgY2xhc3M9XFxcIm9uc2VuLXNsaWRpbmctbWVudV9fbWFpbiBvbnMtc2xpZGluZy1tZW51LWlubmVyXFxcIj48L2Rpdj5cXG5cIiArXG4gICAgXCJcIilcblxuJHRlbXBsYXRlQ2FjaGUucHV0KFwidGVtcGxhdGVzL3NwbGl0X3ZpZXcudHBsXCIsXCI8ZGl2IGNsYXNzPVxcXCJvbnNlbi1zcGxpdC12aWV3X19zZWNvbmRhcnkgZnVsbC1zY3JlZW4gb25zLXNwbGl0LXZpZXctaW5uZXJcXFwiPjwvZGl2PlxcblwiICtcbiAgICBcIjxkaXYgY2xhc3M9XFxcIm9uc2VuLXNwbGl0LXZpZXdfX21haW4gZnVsbC1zY3JlZW4gb25zLXNwbGl0LXZpZXctaW5uZXJcXFwiPjwvZGl2PlxcblwiICtcbiAgICBcIlwiKVxufV0pO1xufSkoKTsiLCIvKlxuQ29weXJpZ2h0IDIwMTMtMjAxNSBBU0lBTCBDT1JQT1JBVElPTlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4qL1xuXG4oZnVuY3Rpb24oKXtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKTtcblxuICAvKipcbiAgICogSW50ZXJuYWwgc2VydmljZSBjbGFzcyBmb3IgZnJhbWV3b3JrIGltcGxlbWVudGF0aW9uLlxuICAgKi9cbiAgbW9kdWxlLmZhY3RvcnkoJyRvbnNlbicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICR3aW5kb3csICRjYWNoZUZhY3RvcnksICRkb2N1bWVudCwgJHRlbXBsYXRlQ2FjaGUsICRodHRwLCAkcSwgJG9uc0dsb2JhbCwgQ29tcG9uZW50Q2xlYW5lcikge1xuXG4gICAgdmFyICRvbnNlbiA9IGNyZWF0ZU9uc2VuU2VydmljZSgpO1xuICAgIHZhciBNb2RpZmllclV0aWwgPSAkb25zR2xvYmFsLl9pbnRlcm5hbC5Nb2RpZmllclV0aWw7XG5cbiAgICByZXR1cm4gJG9uc2VuO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlT25zZW5TZXJ2aWNlKCkge1xuICAgICAgcmV0dXJuIHtcblxuICAgICAgICBESVJFQ1RJVkVfVEVNUExBVEVfVVJMOiAndGVtcGxhdGVzJyxcblxuICAgICAgICBjbGVhbmVyOiBDb21wb25lbnRDbGVhbmVyLFxuXG4gICAgICAgIERldmljZUJhY2tCdXR0b25IYW5kbGVyOiAkb25zR2xvYmFsLl9kZXZpY2VCYWNrQnV0dG9uRGlzcGF0Y2hlcixcblxuICAgICAgICBfZGVmYXVsdERldmljZUJhY2tCdXR0b25IYW5kbGVyOiAkb25zR2xvYmFsLl9kZWZhdWx0RGV2aWNlQmFja0J1dHRvbkhhbmRsZXIsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIGdldERlZmF1bHREZXZpY2VCYWNrQnV0dG9uSGFuZGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2RlZmF1bHREZXZpY2VCYWNrQnV0dG9uSGFuZGxlcjtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHZpZXdcbiAgICAgICAgICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50XG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IG1ldGhvZE5hbWVzXG4gICAgICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBBIGZ1bmN0aW9uIHRoYXQgZGlzcG9zZSBhbGwgZHJpdmluZyBtZXRob2RzLlxuICAgICAgICAgKi9cbiAgICAgICAgZGVyaXZlTWV0aG9kczogZnVuY3Rpb24odmlldywgZWxlbWVudCwgbWV0aG9kTmFtZXMpIHtcbiAgICAgICAgICBtZXRob2ROYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZE5hbWUpIHtcbiAgICAgICAgICAgIHZpZXdbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnRbbWV0aG9kTmFtZV0uYXBwbHkoZWxlbWVudCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBtZXRob2ROYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZE5hbWUpIHtcbiAgICAgICAgICAgICAgdmlld1ttZXRob2ROYW1lXSA9IG51bGw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZpZXcgPSBlbGVtZW50ID0gbnVsbDtcbiAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge0NsYXNzfSBrbGFzc1xuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBwcm9wZXJ0aWVzXG4gICAgICAgICAqL1xuICAgICAgICBkZXJpdmVQcm9wZXJ0aWVzRnJvbUVsZW1lbnQ6IGZ1bmN0aW9uKGtsYXNzLCBwcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5KSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoa2xhc3MucHJvdG90eXBlLCBwcm9wZXJ0eSwge1xuICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZWxlbWVudFswXVtwcm9wZXJ0eV07XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZWxlbWVudFswXVtwcm9wZXJ0eV0gPSB2YWx1ZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1yZXR1cm4tYXNzaWduXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gdmlld1xuICAgICAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gZXZlbnROYW1lc1xuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbbWFwXVxuICAgICAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gQSBmdW5jdGlvbiB0aGF0IGNsZWFyIGFsbCBldmVudCBsaXN0ZW5lcnNcbiAgICAgICAgICovXG4gICAgICAgIGRlcml2ZUV2ZW50czogZnVuY3Rpb24odmlldywgZWxlbWVudCwgZXZlbnROYW1lcywgbWFwKSB7XG4gICAgICAgICAgbWFwID0gbWFwIHx8IGZ1bmN0aW9uKGRldGFpbCkgeyByZXR1cm4gZGV0YWlsOyB9O1xuICAgICAgICAgIGV2ZW50TmFtZXMgPSBbXS5jb25jYXQoZXZlbnROYW1lcyk7XG4gICAgICAgICAgdmFyIGxpc3RlbmVycyA9IFtdO1xuXG4gICAgICAgICAgZXZlbnROYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50TmFtZSkge1xuICAgICAgICAgICAgdmFyIGxpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgdmlldy5lbWl0KGV2ZW50TmFtZSwgbWFwKE9iamVjdC5jcmVhdGUoZXZlbnQuZGV0YWlsKSkpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGxpc3RlbmVyLCBmYWxzZSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBldmVudE5hbWVzLmZvckVhY2goZnVuY3Rpb24oZXZlbnROYW1lLCBpbmRleCkge1xuICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBsaXN0ZW5lcnNbaW5kZXhdLCBmYWxzZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZpZXcgPSBlbGVtZW50ID0gbGlzdGVuZXJzID0gbWFwID0gbnVsbDtcbiAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgaXNFbmFibGVkQXV0b1N0YXR1c0JhckZpbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAhISRvbnNHbG9iYWwuX2NvbmZpZy5hdXRvU3RhdHVzQmFyRmlsbDtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHNob3VsZEZpbGxTdGF0dXNCYXI6ICRvbnNHbG9iYWwuc2hvdWxkRmlsbFN0YXR1c0JhcixcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gYWN0aW9uXG4gICAgICAgICAqL1xuICAgICAgICBhdXRvU3RhdHVzQmFyRmlsbDogJG9uc0dsb2JhbC5hdXRvU3RhdHVzQmFyRmlsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xuICAgICAgICAgKiBAcGFyYW0ge1Njb3BlfSBbcGFyYW1zLnNjb3BlXVxuICAgICAgICAgKiBAcGFyYW0ge2pxTGl0ZX0gW3BhcmFtcy5lbGVtZW50XVxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBbcGFyYW1zLmVsZW1lbnRzXVxuICAgICAgICAgKiBAcGFyYW0ge0F0dHJpYnV0ZXN9IFtwYXJhbXMuYXR0cnNdXG4gICAgICAgICAqL1xuICAgICAgICBjbGVhckNvbXBvbmVudDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgICAgaWYgKHBhcmFtcy5zY29wZSkge1xuICAgICAgICAgICAgQ29tcG9uZW50Q2xlYW5lci5kZXN0cm95U2NvcGUocGFyYW1zLnNjb3BlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmF0dHJzKSB7XG4gICAgICAgICAgICBDb21wb25lbnRDbGVhbmVyLmRlc3Ryb3lBdHRyaWJ1dGVzKHBhcmFtcy5hdHRycyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHBhcmFtcy5lbGVtZW50KSB7XG4gICAgICAgICAgICBDb21wb25lbnRDbGVhbmVyLmRlc3Ryb3lFbGVtZW50KHBhcmFtcy5lbGVtZW50KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmVsZW1lbnRzKSB7XG4gICAgICAgICAgICBwYXJhbXMuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgICAgIENvbXBvbmVudENsZWFuZXIuZGVzdHJveUVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7anFMaXRlfSBlbGVtZW50XG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICAgICAqL1xuICAgICAgICBmaW5kRWxlbWVudGVPYmplY3Q6IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWUpIHtcbiAgICAgICAgICByZXR1cm4gZWxlbWVudC5pbmhlcml0ZWREYXRhKG5hbWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGFnZVxuICAgICAgICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0UGFnZUhUTUxBc3luYzogZnVuY3Rpb24ocGFnZSkge1xuICAgICAgICAgIHZhciBjYWNoZSA9ICR0ZW1wbGF0ZUNhY2hlLmdldChwYWdlKTtcblxuICAgICAgICAgIGlmIChjYWNoZSkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICAgICAgdmFyIGh0bWwgPSB0eXBlb2YgY2FjaGUgPT09ICdzdHJpbmcnID8gY2FjaGUgOiBjYWNoZVsxXTtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUodGhpcy5ub3JtYWxpemVQYWdlSFRNTChodG1sKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgICAgICAgIHVybDogcGFnZSxcbiAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJ1xuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICB2YXIgaHRtbCA9IHJlc3BvbnNlLmRhdGE7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplUGFnZUhUTUwoaHRtbCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgbm9ybWFsaXplUGFnZUhUTUw6IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgICAgICBodG1sID0gKCcnICsgaHRtbCkudHJpbSgpO1xuXG4gICAgICAgICAgaWYgKCFodG1sLm1hdGNoKC9ePG9ucy1wYWdlLykpIHtcbiAgICAgICAgICAgIGh0bWwgPSAnPG9ucy1wYWdlIF9tdXRlZD4nICsgaHRtbCArICc8L29ucy1wYWdlPic7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSBtb2RpZmllciB0ZW1wbGF0ZXIgZnVuY3Rpb24uIFRoZSBtb2RpZmllciB0ZW1wbGF0ZXIgZ2VuZXJhdGUgY3NzIGNsYXNzZXMgYm91bmQgbW9kaWZpZXIgbmFtZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IFttb2RpZmllcnNdIGFuIGFycmF5IG9mIGFwcGVuZGl4IG1vZGlmaWVyXG4gICAgICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgICAgICAgKi9cbiAgICAgICAgZ2VuZXJhdGVNb2RpZmllclRlbXBsYXRlcjogZnVuY3Rpb24oYXR0cnMsIG1vZGlmaWVycykge1xuICAgICAgICAgIHZhciBhdHRyTW9kaWZpZXJzID0gYXR0cnMgJiYgdHlwZW9mIGF0dHJzLm1vZGlmaWVyID09PSAnc3RyaW5nJyA/IGF0dHJzLm1vZGlmaWVyLnRyaW0oKS5zcGxpdCgvICsvKSA6IFtdO1xuICAgICAgICAgIG1vZGlmaWVycyA9IGFuZ3VsYXIuaXNBcnJheShtb2RpZmllcnMpID8gYXR0ck1vZGlmaWVycy5jb25jYXQobW9kaWZpZXJzKSA6IGF0dHJNb2RpZmllcnM7XG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IHRlbXBsYXRlIGVnLiAnb25zLWJ1dHRvbi0tKicsICdvbnMtYnV0dG9uLS0qX19pdGVtJ1xuICAgICAgICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgICAgICAgKi9cbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24odGVtcGxhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiBtb2RpZmllcnMubWFwKGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZS5yZXBsYWNlKCcqJywgbW9kaWZpZXIpO1xuICAgICAgICAgICAgfSkuam9pbignICcpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFkZCBtb2RpZmllciBtZXRob2RzIHRvIHZpZXcgb2JqZWN0IGZvciBjdXN0b20gZWxlbWVudHMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSB2aWV3IG9iamVjdFxuICAgICAgICAgKiBAcGFyYW0ge2pxTGl0ZX0gZWxlbWVudFxuICAgICAgICAgKi9cbiAgICAgICAgYWRkTW9kaWZpZXJNZXRob2RzRm9yQ3VzdG9tRWxlbWVudHM6IGZ1bmN0aW9uKHZpZXcsIGVsZW1lbnQpIHtcbiAgICAgICAgICB2YXIgbWV0aG9kcyA9IHtcbiAgICAgICAgICAgIGhhc01vZGlmaWVyOiBmdW5jdGlvbihuZWVkbGUpIHtcbiAgICAgICAgICAgICAgdmFyIHRva2VucyA9IE1vZGlmaWVyVXRpbC5zcGxpdChlbGVtZW50LmF0dHIoJ21vZGlmaWVyJykpO1xuICAgICAgICAgICAgICBuZWVkbGUgPSB0eXBlb2YgbmVlZGxlID09PSAnc3RyaW5nJyA/IG5lZWRsZS50cmltKCkgOiAnJztcblxuICAgICAgICAgICAgICByZXR1cm4gTW9kaWZpZXJVdGlsLnNwbGl0KG5lZWRsZSkuc29tZShmdW5jdGlvbihuZWVkbGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW5zLmluZGV4T2YobmVlZGxlKSAhPSAtMTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICByZW1vdmVNb2RpZmllcjogZnVuY3Rpb24obmVlZGxlKSB7XG4gICAgICAgICAgICAgIG5lZWRsZSA9IHR5cGVvZiBuZWVkbGUgPT09ICdzdHJpbmcnID8gbmVlZGxlLnRyaW0oKSA6ICcnO1xuXG4gICAgICAgICAgICAgIHZhciBtb2RpZmllciA9IE1vZGlmaWVyVXRpbC5zcGxpdChlbGVtZW50LmF0dHIoJ21vZGlmaWVyJykpLmZpbHRlcihmdW5jdGlvbih0b2tlbikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbiAhPT0gbmVlZGxlO1xuICAgICAgICAgICAgICB9KS5qb2luKCcgJyk7XG5cbiAgICAgICAgICAgICAgZWxlbWVudC5hdHRyKCdtb2RpZmllcicsIG1vZGlmaWVyKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGFkZE1vZGlmaWVyOiBmdW5jdGlvbihtb2RpZmllcikge1xuICAgICAgICAgICAgICBlbGVtZW50LmF0dHIoJ21vZGlmaWVyJywgZWxlbWVudC5hdHRyKCdtb2RpZmllcicpICsgJyAnICsgbW9kaWZpZXIpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgc2V0TW9kaWZpZXI6IGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgICAgICAgICAgIGVsZW1lbnQuYXR0cignbW9kaWZpZXInLCBtb2RpZmllcik7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICB0b2dnbGVNb2RpZmllcjogZnVuY3Rpb24obW9kaWZpZXIpIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuaGFzTW9kaWZpZXIobW9kaWZpZXIpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVNb2RpZmllcihtb2RpZmllcik7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRNb2RpZmllcihtb2RpZmllcik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgZm9yICh2YXIgbWV0aG9kIGluIG1ldGhvZHMpIHtcbiAgICAgICAgICAgIGlmIChtZXRob2RzLmhhc093blByb3BlcnR5KG1ldGhvZCkpIHtcbiAgICAgICAgICAgICAgdmlld1ttZXRob2RdID0gbWV0aG9kc1ttZXRob2RdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkIG1vZGlmaWVyIG1ldGhvZHMgdG8gdmlldyBvYmplY3QuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSB2aWV3IG9iamVjdFxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGVtcGxhdGVcbiAgICAgICAgICogQHBhcmFtIHtqcUxpdGV9IGVsZW1lbnRcbiAgICAgICAgICovXG4gICAgICAgIGFkZE1vZGlmaWVyTWV0aG9kczogZnVuY3Rpb24odmlldywgdGVtcGxhdGUsIGVsZW1lbnQpIHtcbiAgICAgICAgICB2YXIgX3RyID0gZnVuY3Rpb24obW9kaWZpZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZS5yZXBsYWNlKCcqJywgbW9kaWZpZXIpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICB2YXIgZm5zID0ge1xuICAgICAgICAgICAgaGFzTW9kaWZpZXI6IGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgICAgICAgICAgIHJldHVybiBlbGVtZW50Lmhhc0NsYXNzKF90cihtb2RpZmllcikpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgcmVtb3ZlTW9kaWZpZXI6IGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoX3RyKG1vZGlmaWVyKSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBhZGRNb2RpZmllcjogZnVuY3Rpb24obW9kaWZpZXIpIHtcbiAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcyhfdHIobW9kaWZpZXIpKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHNldE1vZGlmaWVyOiBmdW5jdGlvbihtb2RpZmllcikge1xuICAgICAgICAgICAgICB2YXIgY2xhc3NlcyA9IGVsZW1lbnQuYXR0cignY2xhc3MnKS5zcGxpdCgvXFxzKy8pLFxuICAgICAgICAgICAgICAgICAgcGF0dCA9IHRlbXBsYXRlLnJlcGxhY2UoJyonLCAnLicpO1xuXG4gICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBjbHMgPSBjbGFzc2VzW2ldO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNscy5tYXRjaChwYXR0KSkge1xuICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcyhjbHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoX3RyKG1vZGlmaWVyKSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICB0b2dnbGVNb2RpZmllcjogZnVuY3Rpb24obW9kaWZpZXIpIHtcbiAgICAgICAgICAgICAgdmFyIGNscyA9IF90cihtb2RpZmllcik7XG4gICAgICAgICAgICAgIGlmIChlbGVtZW50Lmhhc0NsYXNzKGNscykpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKGNscyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcyhjbHMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHZhciBhcHBlbmQgPSBmdW5jdGlvbihvbGRGbiwgbmV3Rm4pIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2xkRm4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2xkRm4uYXBwbHkobnVsbCwgYXJndW1lbnRzKSB8fCBuZXdGbi5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5ld0ZuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICB2aWV3Lmhhc01vZGlmaWVyID0gYXBwZW5kKHZpZXcuaGFzTW9kaWZpZXIsIGZucy5oYXNNb2RpZmllcik7XG4gICAgICAgICAgdmlldy5yZW1vdmVNb2RpZmllciA9IGFwcGVuZCh2aWV3LnJlbW92ZU1vZGlmaWVyLCBmbnMucmVtb3ZlTW9kaWZpZXIpO1xuICAgICAgICAgIHZpZXcuYWRkTW9kaWZpZXIgPSBhcHBlbmQodmlldy5hZGRNb2RpZmllciwgZm5zLmFkZE1vZGlmaWVyKTtcbiAgICAgICAgICB2aWV3LnNldE1vZGlmaWVyID0gYXBwZW5kKHZpZXcuc2V0TW9kaWZpZXIsIGZucy5zZXRNb2RpZmllcik7XG4gICAgICAgICAgdmlldy50b2dnbGVNb2RpZmllciA9IGFwcGVuZCh2aWV3LnRvZ2dsZU1vZGlmaWVyLCBmbnMudG9nZ2xlTW9kaWZpZXIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmUgbW9kaWZpZXIgbWV0aG9kcy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHZpZXcgb2JqZWN0XG4gICAgICAgICAqL1xuICAgICAgICByZW1vdmVNb2RpZmllck1ldGhvZHM6IGZ1bmN0aW9uKHZpZXcpIHtcbiAgICAgICAgICB2aWV3Lmhhc01vZGlmaWVyID0gdmlldy5yZW1vdmVNb2RpZmllciA9XG4gICAgICAgICAgICB2aWV3LmFkZE1vZGlmaWVyID0gdmlldy5zZXRNb2RpZmllciA9XG4gICAgICAgICAgICB2aWV3LnRvZ2dsZU1vZGlmaWVyID0gdW5kZWZpbmVkO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZWZpbmUgYSB2YXJpYWJsZSB0byBKYXZhU2NyaXB0IGdsb2JhbCBzY29wZSBhbmQgQW5ndWxhckpTIHNjb3BlIGFzICd2YXInIGF0dHJpYnV0ZSBuYW1lLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICAgICAgICogQHBhcmFtIG9iamVjdFxuICAgICAgICAgKi9cbiAgICAgICAgZGVjbGFyZVZhckF0dHJpYnV0ZTogZnVuY3Rpb24oYXR0cnMsIG9iamVjdCkge1xuICAgICAgICAgIGlmICh0eXBlb2YgYXR0cnMudmFyID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdmFyIHZhck5hbWUgPSBhdHRycy52YXI7XG4gICAgICAgICAgICB0aGlzLl9kZWZpbmVWYXIodmFyTmFtZSwgb2JqZWN0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3JlZ2lzdGVyRXZlbnRIYW5kbGVyOiBmdW5jdGlvbihjb21wb25lbnQsIGV2ZW50TmFtZSkge1xuICAgICAgICAgIHZhciBjYXBpdGFsaXplZEV2ZW50TmFtZSA9IGV2ZW50TmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGV2ZW50TmFtZS5zbGljZSgxKTtcblxuICAgICAgICAgIGNvbXBvbmVudC5vbihldmVudE5hbWUsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAkb25zZW4uZmlyZUNvbXBvbmVudEV2ZW50KGNvbXBvbmVudC5fZWxlbWVudFswXSwgZXZlbnROYW1lLCBldmVudCk7XG5cbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gY29tcG9uZW50Ll9hdHRyc1snb25zJyArIGNhcGl0YWxpemVkRXZlbnROYW1lXTtcbiAgICAgICAgICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudC5fc2NvcGUuJGV2YWwoaGFuZGxlciwgeyRldmVudDogZXZlbnR9KTtcbiAgICAgICAgICAgICAgY29tcG9uZW50Ll9zY29wZS4kZXZhbEFzeW5jKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlZ2lzdGVyIGV2ZW50IGhhbmRsZXJzIGZvciBhdHRyaWJ1dGVzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gY29tcG9uZW50XG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVzXG4gICAgICAgICAqL1xuICAgICAgICByZWdpc3RlckV2ZW50SGFuZGxlcnM6IGZ1bmN0aW9uKGNvbXBvbmVudCwgZXZlbnROYW1lcykge1xuICAgICAgICAgIGV2ZW50TmFtZXMgPSBldmVudE5hbWVzLnRyaW0oKS5zcGxpdCgvXFxzKy8pO1xuXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBldmVudE5hbWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdmFyIGV2ZW50TmFtZSA9IGV2ZW50TmFtZXNbaV07XG4gICAgICAgICAgICB0aGlzLl9yZWdpc3RlckV2ZW50SGFuZGxlcihjb21wb25lbnQsIGV2ZW50TmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgaXNBbmRyb2lkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gISF3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvYW5kcm9pZC9pKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIGlzSU9TOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gISF3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvKGlwYWR8aXBob25lfGlwb2QgdG91Y2gpL2kpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgaXNXZWJWaWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gd2luZG93Lm9ucy5pc1dlYlZpZXcoKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIGlzSU9TN2Fib3ZlOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHVhID0gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQ7XG4gICAgICAgICAgdmFyIG1hdGNoID0gdWEubWF0Y2goLyhpUGFkfGlQaG9uZXxpUG9kIHRvdWNoKTsuKkNQVS4qT1MgKFxcZCspXyhcXGQrKS9pKTtcblxuICAgICAgICAgIHZhciByZXN1bHQgPSBtYXRjaCA/IHBhcnNlRmxvYXQobWF0Y2hbMl0gKyAnLicgKyBtYXRjaFszXSkgPj0gNyA6IGZhbHNlO1xuXG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9O1xuICAgICAgICB9KSgpLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaXJlIGEgbmFtZWQgZXZlbnQgZm9yIGEgY29tcG9uZW50LiBUaGUgdmlldyBvYmplY3QsIGlmIGl0IGV4aXN0cywgaXMgYXR0YWNoZWQgdG8gZXZlbnQuY29tcG9uZW50LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBbZG9tXVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgbmFtZVxuICAgICAgICAgKi9cbiAgICAgICAgZmlyZUNvbXBvbmVudEV2ZW50OiBmdW5jdGlvbihkb20sIGV2ZW50TmFtZSwgZGF0YSkge1xuICAgICAgICAgIGRhdGEgPSBkYXRhIHx8IHt9O1xuXG4gICAgICAgICAgdmFyIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0hUTUxFdmVudHMnKTtcblxuICAgICAgICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG4gICAgICAgICAgICBpZiAoZGF0YS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgIGV2ZW50W2tleV0gPSBkYXRhW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZXZlbnQuY29tcG9uZW50ID0gZG9tID9cbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb20pLmRhdGEoZG9tLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpIHx8IG51bGwgOiBudWxsO1xuICAgICAgICAgIGV2ZW50LmluaXRFdmVudChkb20ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSArICc6JyArIGV2ZW50TmFtZSwgdHJ1ZSwgdHJ1ZSk7XG5cbiAgICAgICAgICBkb20uZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlZmluZSBhIHZhcmlhYmxlIHRvIEphdmFTY3JpcHQgZ2xvYmFsIHNjb3BlIGFuZCBBbmd1bGFySlMgc2NvcGUuXG4gICAgICAgICAqXG4gICAgICAgICAqIFV0aWwuZGVmaW5lVmFyKCdmb28nLCAnZm9vLXZhbHVlJyk7XG4gICAgICAgICAqIC8vID0+IHdpbmRvdy5mb28gYW5kICRzY29wZS5mb28gaXMgbm93ICdmb28tdmFsdWUnXG4gICAgICAgICAqXG4gICAgICAgICAqIFV0aWwuZGVmaW5lVmFyKCdmb28uYmFyJywgJ2Zvby1iYXItdmFsdWUnKTtcbiAgICAgICAgICogLy8gPT4gd2luZG93LmZvby5iYXIgYW5kICRzY29wZS5mb28uYmFyIGlzIG5vdyAnZm9vLWJhci12YWx1ZSdcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgICAgICogQHBhcmFtIG9iamVjdFxuICAgICAgICAgKi9cbiAgICAgICAgX2RlZmluZVZhcjogZnVuY3Rpb24obmFtZSwgb2JqZWN0KSB7XG4gICAgICAgICAgdmFyIG5hbWVzID0gbmFtZS5zcGxpdCgvXFwuLyk7XG5cbiAgICAgICAgICBmdW5jdGlvbiBzZXQoY29udGFpbmVyLCBuYW1lcywgb2JqZWN0KSB7XG4gICAgICAgICAgICB2YXIgbmFtZTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgICAgIG5hbWUgPSBuYW1lc1tpXTtcbiAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lcltuYW1lXSA9PT0gdW5kZWZpbmVkIHx8IGNvbnRhaW5lcltuYW1lXSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lcltuYW1lXSA9IHt9O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnRhaW5lciA9IGNvbnRhaW5lcltuYW1lXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29udGFpbmVyW25hbWVzW25hbWVzLmxlbmd0aCAtIDFdXSA9IG9iamVjdDtcblxuICAgICAgICAgICAgaWYgKGNvbnRhaW5lcltuYW1lc1tuYW1lcy5sZW5ndGggLSAxXV0gIT09IG9iamVjdCkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBzZXQgdmFyPVwiJyArIG9iamVjdC5fYXR0cnMudmFyICsgJ1wiIGJlY2F1c2UgaXQgd2lsbCBvdmVyd3JpdGUgYSByZWFkLW9ubHkgdmFyaWFibGUuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG9ucy5jb21wb25lbnRCYXNlKSB7XG4gICAgICAgICAgICBzZXQob25zLmNvbXBvbmVudEJhc2UsIG5hbWVzLCBvYmplY3QpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEF0dGFjaCB0byBhbmNlc3RvciB3aXRoIG9ucy1zY29wZSBhdHRyaWJ1dGUuXG4gICAgICAgICAgdmFyIGVsZW1lbnQgPSBvYmplY3QuX2VsZW1lbnRbMF07XG5cbiAgICAgICAgICB3aGlsZSAoZWxlbWVudC5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ29ucy1zY29wZScpKSB7XG4gICAgICAgICAgICAgIHNldChhbmd1bGFyLmVsZW1lbnQoZWxlbWVudCkuZGF0YSgnX3Njb3BlJyksIG5hbWVzLCBvYmplY3QpO1xuICAgICAgICAgICAgICBlbGVtZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbGVtZW50ID0gbnVsbDtcblxuICAgICAgICAgIC8vIElmIG5vIG9ucy1zY29wZSBlbGVtZW50IHdhcyBmb3VuZCwgYXR0YWNoIHRvICRyb290U2NvcGUuXG4gICAgICAgICAgc2V0KCRyb290U2NvcGUsIG5hbWVzLCBvYmplY3QpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICB9KTtcbn0pKCk7XG4iLCIvKipcbiAqIEBlbGVtZW50IG9ucy1hbGVydC1kaWFsb2dcbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgdmFyXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dVmFyaWFibGUgbmFtZSB0byByZWZlciB0aGlzIGFsZXJ0IGRpYWxvZy5bL2VuXVxuICogIFtqYV3jgZPjga7jgqLjg6njg7zjg4jjg4DjgqTjgqLjg63jgrDjgpLlj4LnhafjgZnjgovjgZ/jgoHjga7lkI3liY3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBvbnMtcHJlc2hvd1xuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BbGxvd3MgeW91IHRvIHNwZWNpZnkgY3VzdG9tIGJlaGF2aW9yIHdoZW4gdGhlIFwicHJlc2hvd1wiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXVwicHJlc2hvd1wi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLXByZWhpZGVcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIHRoZSBcInByZWhpZGVcIiBldmVudCBpcyBmaXJlZC5bL2VuXVxuICogIFtqYV1cInByZWhpZGVcIuOCpOODmeODs+ODiOOBjOeZuueBq+OBleOCjOOBn+aZguOBruaMmeWLleOCkueLrOiHquOBq+aMh+WumuOBp+OBjeOBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIG9ucy1wb3N0c2hvd1xuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BbGxvd3MgeW91IHRvIHNwZWNpZnkgY3VzdG9tIGJlaGF2aW9yIHdoZW4gdGhlIFwicG9zdHNob3dcIiBldmVudCBpcyBmaXJlZC5bL2VuXVxuICogIFtqYV1cInBvc3RzaG93XCLjgqTjg5njg7Pjg4jjgYznmbrngavjgZXjgozjgZ/mmYLjga7mjJnli5XjgpLni6zoh6rjgavmjIflrprjgafjgY3jgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBvbnMtcG9zdGhpZGVcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIHRoZSBcInBvc3RoaWRlXCIgZXZlbnQgaXMgZmlyZWQuWy9lbl1cbiAqICBbamFdXCJwb3N0aGlkZVwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWRlc3Ryb3lcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIHRoZSBcImRlc3Ryb3lcIiBldmVudCBpcyBmaXJlZC5bL2VuXVxuICogIFtqYV1cImRlc3Ryb3lcIuOCpOODmeODs+ODiOOBjOeZuueBq+OBleOCjOOBn+aZguOBruaMmeWLleOCkueLrOiHquOBq+aMh+WumuOBp+OBjeOBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAbWV0aG9kIG9uXG4gKiBAc2lnbmF0dXJlIG9uKGV2ZW50TmFtZSwgbGlzdGVuZXIpXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXUFkZCBhbiBldmVudCBsaXN0ZW5lci5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI44Oq44K544OK44O844KS6L+95Yqg44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAqICAgW2VuXU5hbWUgb2YgdGhlIGV2ZW50LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jlkI3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAqICAgW2VuXUZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jjgYznmbrngavjgZXjgozjgZ/pmpvjgavlkbzjgbPlh7rjgZXjgozjgovjgrPjg7zjg6vjg5Djg4Pjgq/jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQG1ldGhvZCBvbmNlXG4gKiBAc2lnbmF0dXJlIG9uY2UoZXZlbnROYW1lLCBsaXN0ZW5lcilcbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BZGQgYW4gZXZlbnQgbGlzdGVuZXIgdGhhdCdzIG9ubHkgdHJpZ2dlcmVkIG9uY2UuWy9lbl1cbiAqICBbamFd5LiA5bqm44Gg44GR5ZG844Gz5Ye644GV44KM44KL44Kk44OZ44Oz44OI44Oq44K544OK44O844KS6L+95Yqg44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAqICAgW2VuXU5hbWUgb2YgdGhlIGV2ZW50LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jlkI3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAqICAgW2VuXUZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jjgYznmbrngavjgZfjgZ/pmpvjgavlkbzjgbPlh7rjgZXjgozjgovjgrPjg7zjg6vjg5Djg4Pjgq/jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQG1ldGhvZCBvZmZcbiAqIEBzaWduYXR1cmUgb2ZmKGV2ZW50TmFtZSwgW2xpc3RlbmVyXSlcbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1SZW1vdmUgYW4gZXZlbnQgbGlzdGVuZXIuIElmIHRoZSBsaXN0ZW5lciBpcyBub3Qgc3BlY2lmaWVkIGFsbCBsaXN0ZW5lcnMgZm9yIHRoZSBldmVudCB0eXBlIHdpbGwgYmUgcmVtb3ZlZC5bL2VuXVxuICogIFtqYV3jgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgpLliYrpmaTjgZfjgb7jgZnjgILjgoLjgZdsaXN0ZW5lcuODkeODqeODoeODvOOCv+OBjOaMh+WumuOBleOCjOOBquOBi+OBo+OBn+WgtOWQiOOAgeOBneOBruOCpOODmeODs+ODiOOBruODquOCueODiuODvOOBjOWFqOOBpuWJiumZpOOBleOCjOOBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lXG4gKiAgIFtlbl1OYW1lIG9mIHRoZSBldmVudC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI5ZCN44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXG4gKiAgIFtlbl1GdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZC5bL2VuXVxuICogICBbamFd5YmK6Zmk44GZ44KL44Kk44OZ44Oz44OI44Oq44K544OK44O844Gu6Zai5pWw44Kq44OW44K444Kn44Kv44OI44KS5rih44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKipcbiAgICogQWxlcnQgZGlhbG9nIGRpcmVjdGl2ZS5cbiAgICovXG4gIGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpLmRpcmVjdGl2ZSgnb25zQWxlcnREaWFsb2cnLCBmdW5jdGlvbigkb25zZW4sIEFsZXJ0RGlhbG9nVmlldykge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgcmVwbGFjZTogZmFsc2UsXG4gICAgICBzY29wZTogdHJ1ZSxcbiAgICAgIHRyYW5zY2x1ZGU6IGZhbHNlLFxuXG4gICAgICBjb21waWxlOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xuICAgICAgICBDdXN0b21FbGVtZW50cy51cGdyYWRlKGVsZW1lbnRbMF0pO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcHJlOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIEN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoZWxlbWVudFswXSk7XG4gICAgICAgICAgICB2YXIgYWxlcnREaWFsb2cgPSBuZXcgQWxlcnREaWFsb2dWaWV3KHNjb3BlLCBlbGVtZW50LCBhdHRycyk7XG5cbiAgICAgICAgICAgICRvbnNlbi5kZWNsYXJlVmFyQXR0cmlidXRlKGF0dHJzLCBhbGVydERpYWxvZyk7XG4gICAgICAgICAgICAkb25zZW4ucmVnaXN0ZXJFdmVudEhhbmRsZXJzKGFsZXJ0RGlhbG9nLCAncHJlc2hvdyBwcmVoaWRlIHBvc3RzaG93IHBvc3RoaWRlIGRlc3Ryb3knKTtcbiAgICAgICAgICAgICRvbnNlbi5hZGRNb2RpZmllck1ldGhvZHNGb3JDdXN0b21FbGVtZW50cyhhbGVydERpYWxvZywgZWxlbWVudCk7XG5cbiAgICAgICAgICAgIGVsZW1lbnQuZGF0YSgnb25zLWFsZXJ0LWRpYWxvZycsIGFsZXJ0RGlhbG9nKTtcblxuICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBhbGVydERpYWxvZy5fZXZlbnRzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAkb25zZW4ucmVtb3ZlTW9kaWZpZXJNZXRob2RzKGFsZXJ0RGlhbG9nKTtcbiAgICAgICAgICAgICAgZWxlbWVudC5kYXRhKCdvbnMtYWxlcnQtZGlhbG9nJywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgZWxlbWVudCA9IG51bGw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHBvc3Q6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAkb25zZW4uZmlyZUNvbXBvbmVudEV2ZW50KGVsZW1lbnRbMF0sICdpbml0Jyk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuXG59KSgpO1xuIiwiXG4vKlxuQ29weXJpZ2h0IDIwMTMtMjAxNSBBU0lBTCBDT1JQT1JBVElPTlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4qL1xuXG5hbmd1bGFyLm1vZHVsZSgnb25zZW4nKVxuICAudmFsdWUoJ0FsZXJ0RGlhbG9nQW5pbWF0b3InLCBvbnMuX2ludGVybmFsLkFsZXJ0RGlhbG9nQW5pbWF0b3IpXG4gIC52YWx1ZSgnQW5kcm9pZEFsZXJ0RGlhbG9nQW5pbWF0b3InLCBvbnMuX2ludGVybmFsLkFuZHJvaWRBbGVydERpYWxvZ0FuaW1hdG9yKVxuICAudmFsdWUoJ0lPU0FsZXJ0RGlhbG9nQW5pbWF0b3InLCBvbnMuX2ludGVybmFsLklPU0FsZXJ0RGlhbG9nQW5pbWF0b3IpO1xuIiwiLypcbkNvcHlyaWdodCAyMDEzLTIwMTUgQVNJQUwgQ09SUE9SQVRJT05cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuKi9cblxuYW5ndWxhci5tb2R1bGUoJ29uc2VuJykudmFsdWUoJ0FuaW1hdGlvbkNob29zZXInLCBvbnMuX2ludGVybmFsLkFuaW1hdG9yRmFjdG9yeSk7XG4iLCIvKipcbiAqIEBlbGVtZW50IG9ucy1jYXJvdXNlbFxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1DYXJvdXNlbCBjb21wb25lbnQuWy9lbl1cbiAqICAgW2phXeOCq+ODq+ODvOOCu+ODq+OCkuihqOekuuOBp+OBjeOCi+OCs+ODs+ODneODvOODjeODs+ODiOOAglsvamFdXG4gKiBAY29kZXBlbiB4YmJ6T1FcbiAqIEBndWlkZSBVc2luZ0Nhcm91c2VsXG4gKiAgIFtlbl1MZWFybiBob3cgdG8gdXNlIHRoZSBjYXJvdXNlbCBjb21wb25lbnQuWy9lbl1cbiAqICAgW2phXWNhcm91c2Vs44Kz44Oz44Od44O844ON44Oz44OI44Gu5L2/44GE5pa5Wy9qYV1cbiAqIEBleGFtcGxlXG4gKiA8b25zLWNhcm91c2VsIHN0eWxlPVwid2lkdGg6IDEwMCU7IGhlaWdodDogMjAwcHhcIj5cbiAqICAgPG9ucy1jYXJvdXNlbC1pdGVtPlxuICogICAgLi4uXG4gKiAgIDwvb25zLWNhcm91c2VsLWl0ZW0+XG4gKiAgIDxvbnMtY2Fyb3VzZWwtaXRlbT5cbiAqICAgIC4uLlxuICogICA8L29ucy1jYXJvdXNlbC1pdGVtPlxuICogPC9vbnMtY2Fyb3VzZWw+XG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIHZhclxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7U3RyaW5nfVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1WYXJpYWJsZSBuYW1lIHRvIHJlZmVyIHRoaXMgY2Fyb3VzZWwuWy9lbl1cbiAqICAgW2phXeOBk+OBruOCq+ODq+ODvOOCu+ODq+OCkuWPgueFp+OBmeOCi+OBn+OCgeOBruWkieaVsOWQjeOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIG9ucy1wb3N0Y2hhbmdlXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtFeHByZXNzaW9ufVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXUFsbG93cyB5b3UgdG8gc3BlY2lmeSBjdXN0b20gYmVoYXZpb3Igd2hlbiB0aGUgXCJwb3N0Y2hhbmdlXCIgZXZlbnQgaXMgZmlyZWQuWy9lbl1cbiAqICBbamFdXCJwb3N0Y2hhbmdlXCLjgqTjg5njg7Pjg4jjgYznmbrngavjgZXjgozjgZ/mmYLjga7mjJnli5XjgpLni6zoh6rjgavmjIflrprjgafjgY3jgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBvbnMtcmVmcmVzaFxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BbGxvd3MgeW91IHRvIHNwZWNpZnkgY3VzdG9tIGJlaGF2aW9yIHdoZW4gdGhlIFwicmVmcmVzaFwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXVwicmVmcmVzaFwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLW92ZXJzY3JvbGxcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIHRoZSBcIm92ZXJzY3JvbGxcIiBldmVudCBpcyBmaXJlZC5bL2VuXVxuICogIFtqYV1cIm92ZXJzY3JvbGxcIuOCpOODmeODs+ODiOOBjOeZuueBq+OBleOCjOOBn+aZguOBruaMmeWLleOCkueLrOiHquOBq+aMh+WumuOBp+OBjeOBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIG9ucy1kZXN0cm95XG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtFeHByZXNzaW9ufVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXUFsbG93cyB5b3UgdG8gc3BlY2lmeSBjdXN0b20gYmVoYXZpb3Igd2hlbiB0aGUgXCJkZXN0cm95XCIgZXZlbnQgaXMgZmlyZWQuWy9lbl1cbiAqICBbamFdXCJkZXN0cm95XCLjgqTjg5njg7Pjg4jjgYznmbrngavjgZXjgozjgZ/mmYLjga7mjJnli5XjgpLni6zoh6rjgavmjIflrprjgafjgY3jgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQG1ldGhvZCBvbmNlXG4gKiBAc2lnbmF0dXJlIG9uY2UoZXZlbnROYW1lLCBsaXN0ZW5lcilcbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BZGQgYW4gZXZlbnQgbGlzdGVuZXIgdGhhdCdzIG9ubHkgdHJpZ2dlcmVkIG9uY2UuWy9lbl1cbiAqICBbamFd5LiA5bqm44Gg44GR5ZG844Gz5Ye644GV44KM44KL44Kk44OZ44Oz44OI44Oq44K544OK44KS6L+95Yqg44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAqICAgW2VuXU5hbWUgb2YgdGhlIGV2ZW50LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jlkI3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAqICAgW2VuXUZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jjgYznmbrngavjgZfjgZ/pmpvjgavlkbzjgbPlh7rjgZXjgozjgovplqLmlbDjgqrjg5bjgrjjgqfjgq/jg4jjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQG1ldGhvZCBvZmZcbiAqIEBzaWduYXR1cmUgb2ZmKGV2ZW50TmFtZSwgW2xpc3RlbmVyXSlcbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1SZW1vdmUgYW4gZXZlbnQgbGlzdGVuZXIuIElmIHRoZSBsaXN0ZW5lciBpcyBub3Qgc3BlY2lmaWVkIGFsbCBsaXN0ZW5lcnMgZm9yIHRoZSBldmVudCB0eXBlIHdpbGwgYmUgcmVtb3ZlZC5bL2VuXVxuICogIFtqYV3jgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgpLliYrpmaTjgZfjgb7jgZnjgILjgoLjgZfjgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgYzmjIflrprjgZXjgozjgarjgYvjgaPjgZ/loLTlkIjjgavjga/jgIHjgZ3jga7jgqTjg5njg7Pjg4jjgavntJDku5jjgYTjgabjgYTjgovjgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgYzlhajjgabliYrpmaTjgZXjgozjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZVxuICogICBbZW5dTmFtZSBvZiB0aGUgZXZlbnQuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOWQjeOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICogICBbZW5dRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOOBjOeZuueBq+OBl+OBn+mam+OBq+WRvOOBs+WHuuOBleOCjOOCi+mWouaVsOOCquODluOCuOOCp+OCr+ODiOOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAbWV0aG9kIG9uXG4gKiBAc2lnbmF0dXJlIG9uKGV2ZW50TmFtZSwgbGlzdGVuZXIpXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXUFkZCBhbiBldmVudCBsaXN0ZW5lci5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI44Oq44K544OK44O844KS6L+95Yqg44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAqICAgW2VuXU5hbWUgb2YgdGhlIGV2ZW50LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jlkI3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAqICAgW2VuXUZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jjgYznmbrngavjgZfjgZ/pmpvjgavlkbzjgbPlh7rjgZXjgozjgovplqLmlbDjgqrjg5bjgrjjgqfjgq/jg4jjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKTtcblxuICBtb2R1bGUuZGlyZWN0aXZlKCdvbnNDYXJvdXNlbCcsIGZ1bmN0aW9uKCRvbnNlbiwgQ2Fyb3VzZWxWaWV3KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICByZXBsYWNlOiBmYWxzZSxcblxuICAgICAgLy8gTk9URTogVGhpcyBlbGVtZW50IG11c3QgY29leGlzdHMgd2l0aCBuZy1jb250cm9sbGVyLlxuICAgICAgLy8gRG8gbm90IHVzZSBpc29sYXRlZCBzY29wZSBhbmQgdGVtcGxhdGUncyBuZy10cmFuc2NsdWRlLlxuICAgICAgc2NvcGU6IGZhbHNlLFxuICAgICAgdHJhbnNjbHVkZTogZmFsc2UsXG5cbiAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgIEN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoZWxlbWVudFswXSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgIEN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoZWxlbWVudFswXSk7XG4gICAgICAgICAgdmFyIGNhcm91c2VsID0gbmV3IENhcm91c2VsVmlldyhzY29wZSwgZWxlbWVudCwgYXR0cnMpO1xuXG4gICAgICAgICAgZWxlbWVudC5kYXRhKCdvbnMtY2Fyb3VzZWwnLCBjYXJvdXNlbCk7XG5cbiAgICAgICAgICAkb25zZW4ucmVnaXN0ZXJFdmVudEhhbmRsZXJzKGNhcm91c2VsLCAncG9zdGNoYW5nZSByZWZyZXNoIG92ZXJzY3JvbGwgZGVzdHJveScpO1xuICAgICAgICAgICRvbnNlbi5kZWNsYXJlVmFyQXR0cmlidXRlKGF0dHJzLCBjYXJvdXNlbCk7XG5cbiAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjYXJvdXNlbC5fZXZlbnRzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgZWxlbWVudC5kYXRhKCdvbnMtY2Fyb3VzZWwnLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgZWxlbWVudCA9IG51bGw7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAkb25zZW4uZmlyZUNvbXBvbmVudEV2ZW50KGVsZW1lbnRbMF0sICdpbml0Jyk7XG4gICAgICAgIH07XG4gICAgICB9LFxuXG4gICAgfTtcbiAgfSk7XG5cbiAgbW9kdWxlLmRpcmVjdGl2ZSgnb25zQ2Fyb3VzZWxJdGVtJywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICBjb21waWxlOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xuICAgICAgICBDdXN0b21FbGVtZW50cy51cGdyYWRlKGVsZW1lbnRbMF0pO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgQ3VzdG9tRWxlbWVudHMudXBncmFkZShlbGVtZW50WzBdKTtcbiAgICAgICAgICBpZiAoc2NvcGUuJGxhc3QpIHtcbiAgICAgICAgICAgIGVsZW1lbnRbMF0ucGFyZW50RWxlbWVudC5fc2V0dXAoKTtcbiAgICAgICAgICAgIGVsZW1lbnRbMF0ucGFyZW50RWxlbWVudC5fc2V0dXBJbml0aWFsSW5kZXgoKTtcbiAgICAgICAgICAgIGVsZW1lbnRbMF0ucGFyZW50RWxlbWVudC5fc2F2ZUxhc3RTdGF0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcblxufSkoKTtcblxuIiwiLyoqXG4gKiBAZWxlbWVudCBvbnMtZGlhbG9nXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIHZhclxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7U3RyaW5nfVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXVZhcmlhYmxlIG5hbWUgdG8gcmVmZXIgdGhpcyBkaWFsb2cuWy9lbl1cbiAqICBbamFd44GT44Gu44OA44Kk44Ki44Ot44Kw44KS5Y+C54Wn44GZ44KL44Gf44KB44Gu5ZCN5YmN44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLXByZXNob3dcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIHRoZSBcInByZXNob3dcIiBldmVudCBpcyBmaXJlZC5bL2VuXVxuICogIFtqYV1cInByZXNob3dcIuOCpOODmeODs+ODiOOBjOeZuueBq+OBleOCjOOBn+aZguOBruaMmeWLleOCkueLrOiHquOBq+aMh+WumuOBp+OBjeOBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIG9ucy1wcmVoaWRlXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtFeHByZXNzaW9ufVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXUFsbG93cyB5b3UgdG8gc3BlY2lmeSBjdXN0b20gYmVoYXZpb3Igd2hlbiB0aGUgXCJwcmVoaWRlXCIgZXZlbnQgaXMgZmlyZWQuWy9lbl1cbiAqICBbamFdXCJwcmVoaWRlXCLjgqTjg5njg7Pjg4jjgYznmbrngavjgZXjgozjgZ/mmYLjga7mjJnli5XjgpLni6zoh6rjgavmjIflrprjgafjgY3jgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBvbnMtcG9zdHNob3dcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIHRoZSBcInBvc3RzaG93XCIgZXZlbnQgaXMgZmlyZWQuWy9lbl1cbiAqICBbamFdXCJwb3N0c2hvd1wi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLXBvc3RoaWRlXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtFeHByZXNzaW9ufVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXUFsbG93cyB5b3UgdG8gc3BlY2lmeSBjdXN0b20gYmVoYXZpb3Igd2hlbiB0aGUgXCJwb3N0aGlkZVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXVwicG9zdGhpZGVcIuOCpOODmeODs+ODiOOBjOeZuueBq+OBleOCjOOBn+aZguOBruaMmeWLleOCkueLrOiHquOBq+aMh+WumuOBp+OBjeOBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIG9ucy1kZXN0cm95XG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtFeHByZXNzaW9ufVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXUFsbG93cyB5b3UgdG8gc3BlY2lmeSBjdXN0b20gYmVoYXZpb3Igd2hlbiB0aGUgXCJkZXN0cm95XCIgZXZlbnQgaXMgZmlyZWQuWy9lbl1cbiAqICBbamFdXCJkZXN0cm95XCLjgqTjg5njg7Pjg4jjgYznmbrngavjgZXjgozjgZ/mmYLjga7mjJnli5XjgpLni6zoh6rjgavmjIflrprjgafjgY3jgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQG1ldGhvZCBvblxuICogQHNpZ25hdHVyZSBvbihldmVudE5hbWUsIGxpc3RlbmVyKVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1BZGQgYW4gZXZlbnQgbGlzdGVuZXIuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOODquOCueODiuODvOOCkui/veWKoOOBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lXG4gKiAgIFtlbl1OYW1lIG9mIHRoZSBldmVudC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI5ZCN44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXG4gKiAgIFtlbl1GdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI44GM55m654Gr44GX44Gf6Zqb44Gr5ZG844Gz5Ye644GV44KM44KL6Zai5pWw44Kq44OW44K444Kn44Kv44OI44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBtZXRob2Qgb25jZVxuICogQHNpZ25hdHVyZSBvbmNlKGV2ZW50TmFtZSwgbGlzdGVuZXIpXG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRoYXQncyBvbmx5IHRyaWdnZXJlZCBvbmNlLlsvZW5dXG4gKiAgW2phXeS4gOW6puOBoOOBkeWRvOOBs+WHuuOBleOCjOOCi+OCpOODmeODs+ODiOODquOCueODiuOCkui/veWKoOOBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lXG4gKiAgIFtlbl1OYW1lIG9mIHRoZSBldmVudC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI5ZCN44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXG4gKiAgIFtlbl1GdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI44GM55m654Gr44GX44Gf6Zqb44Gr5ZG844Gz5Ye644GV44KM44KL6Zai5pWw44Kq44OW44K444Kn44Kv44OI44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBtZXRob2Qgb2ZmXG4gKiBAc2lnbmF0dXJlIG9mZihldmVudE5hbWUsIFtsaXN0ZW5lcl0pXG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dUmVtb3ZlIGFuIGV2ZW50IGxpc3RlbmVyLiBJZiB0aGUgbGlzdGVuZXIgaXMgbm90IHNwZWNpZmllZCBhbGwgbGlzdGVuZXJzIGZvciB0aGUgZXZlbnQgdHlwZSB3aWxsIGJlIHJlbW92ZWQuWy9lbl1cbiAqICBbamFd44Kk44OZ44Oz44OI44Oq44K544OK44O844KS5YmK6Zmk44GX44G+44GZ44CC44KC44GX44Kk44OZ44Oz44OI44Oq44K544OK44O844GM5oyH5a6a44GV44KM44Gq44GL44Gj44Gf5aC05ZCI44Gr44Gv44CB44Gd44Gu44Kk44OZ44Oz44OI44Gr57SQ5LuY44GE44Gm44GE44KL44Kk44OZ44Oz44OI44Oq44K544OK44O844GM5YWo44Gm5YmK6Zmk44GV44KM44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAqICAgW2VuXU5hbWUgb2YgdGhlIGV2ZW50LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jlkI3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAqICAgW2VuXUZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jjgYznmbrngavjgZfjgZ/pmpvjgavlkbzjgbPlh7rjgZXjgozjgovplqLmlbDjgqrjg5bjgrjjgqfjgq/jg4jjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKS5kaXJlY3RpdmUoJ29uc0RpYWxvZycsIGZ1bmN0aW9uKCRvbnNlbiwgRGlhbG9nVmlldykge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgc2NvcGU6IHRydWUsXG4gICAgICBjb21waWxlOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xuICAgICAgICBDdXN0b21FbGVtZW50cy51cGdyYWRlKGVsZW1lbnRbMF0pO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcHJlOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIEN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoZWxlbWVudFswXSk7XG5cbiAgICAgICAgICAgIHZhciBkaWFsb2cgPSBuZXcgRGlhbG9nVmlldyhzY29wZSwgZWxlbWVudCwgYXR0cnMpO1xuICAgICAgICAgICAgJG9uc2VuLmRlY2xhcmVWYXJBdHRyaWJ1dGUoYXR0cnMsIGRpYWxvZyk7XG4gICAgICAgICAgICAkb25zZW4ucmVnaXN0ZXJFdmVudEhhbmRsZXJzKGRpYWxvZywgJ3ByZXNob3cgcHJlaGlkZSBwb3N0c2hvdyBwb3N0aGlkZSBkZXN0cm95Jyk7XG4gICAgICAgICAgICAkb25zZW4uYWRkTW9kaWZpZXJNZXRob2RzRm9yQ3VzdG9tRWxlbWVudHMoZGlhbG9nLCBlbGVtZW50KTtcblxuICAgICAgICAgICAgZWxlbWVudC5kYXRhKCdvbnMtZGlhbG9nJywgZGlhbG9nKTtcbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgZGlhbG9nLl9ldmVudHMgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICRvbnNlbi5yZW1vdmVNb2RpZmllck1ldGhvZHMoZGlhbG9nKTtcbiAgICAgICAgICAgICAgZWxlbWVudC5kYXRhKCdvbnMtZGlhbG9nJywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgZWxlbWVudCA9IG51bGw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgcG9zdDogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICRvbnNlbi5maXJlQ29tcG9uZW50RXZlbnQoZWxlbWVudFswXSwgJ2luaXQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG5cbn0pKCk7XG4iLCIvKlxuQ29weXJpZ2h0IDIwMTMtMjAxNSBBU0lBTCBDT1JQT1JBVElPTlxuXG4gICBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbmh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4qL1xuXG5hbmd1bGFyLm1vZHVsZSgnb25zZW4nKVxuICAudmFsdWUoJ0RpYWxvZ0FuaW1hdG9yJywgb25zLl9pbnRlcm5hbC5EaWFsb2dBbmltYXRvcilcbiAgLnZhbHVlKCdJT1NEaWFsb2dBbmltYXRvcicsIG9ucy5faW50ZXJuYWwuSU9TRGlhbG9nQW5pbWF0b3IpXG4gIC52YWx1ZSgnQW5kcm9pZERpYWxvZ0FuaW1hdG9yJywgb25zLl9pbnRlcm5hbC5BbmRyb2lkRGlhbG9nQW5pbWF0b3IpXG4gIC52YWx1ZSgnU2xpZGVEaWFsb2dBbmltYXRvcicsIG9ucy5faW50ZXJuYWwuU2xpZGVEaWFsb2dBbmltYXRvcik7XG4iLCIvKlxuQ29weXJpZ2h0IDIwMTMtMjAxNSBBU0lBTCBDT1JQT1JBVElPTlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4qL1xuXG4oZnVuY3Rpb24oKXtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpLmZhY3RvcnkoJ0dlbmVyaWNWaWV3JywgZnVuY3Rpb24oJG9uc2VuKSB7XG5cbiAgICB2YXIgR2VuZXJpY1ZpZXcgPSBDbGFzcy5leHRlbmQoe1xuXG4gICAgICAvKipcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzY29wZVxuICAgICAgICogQHBhcmFtIHtqcUxpdGV9IGVsZW1lbnRcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyc1xuICAgICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgICAgICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5kaXJlY3RpdmVPbmx5XVxuICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW29wdGlvbnMub25EZXN0cm95XVxuICAgICAgICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLm1vZGlmaWVyVGVtcGxhdGVdXG4gICAgICAgKi9cbiAgICAgIGluaXQ6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgb3B0aW9ucykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcblxuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5fc2NvcGUgPSBzY29wZTtcbiAgICAgICAgdGhpcy5fYXR0cnMgPSBhdHRycztcblxuICAgICAgICBpZiAob3B0aW9ucy5kaXJlY3RpdmVPbmx5KSB7XG4gICAgICAgICAgaWYgKCFvcHRpb25zLm1vZGlmaWVyVGVtcGxhdGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignb3B0aW9ucy5tb2RpZmllclRlbXBsYXRlIGlzIHVuZGVmaW5lZC4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgJG9uc2VuLmFkZE1vZGlmaWVyTWV0aG9kcyh0aGlzLCBvcHRpb25zLm1vZGlmaWVyVGVtcGxhdGUsIGVsZW1lbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRvbnNlbi5hZGRNb2RpZmllck1ldGhvZHNGb3JDdXN0b21FbGVtZW50cyh0aGlzLCBlbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgICRvbnNlbi5jbGVhbmVyLm9uRGVzdHJveShzY29wZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2VsZi5fZXZlbnRzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICRvbnNlbi5yZW1vdmVNb2RpZmllck1ldGhvZHMoc2VsZik7XG5cbiAgICAgICAgICBpZiAob3B0aW9ucy5vbkRlc3Ryb3kpIHtcbiAgICAgICAgICAgIG9wdGlvbnMub25EZXN0cm95KHNlbGYpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgICRvbnNlbi5jbGVhckNvbXBvbmVudCh7XG4gICAgICAgICAgICBzY29wZTogc2NvcGUsXG4gICAgICAgICAgICBhdHRyczogYXR0cnMsXG4gICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBzZWxmID0gZWxlbWVudCA9IHNlbGYuX2VsZW1lbnQgPSBzZWxmLl9zY29wZSA9IHNjb3BlID0gc2VsZi5fYXR0cnMgPSBhdHRycyA9IG9wdGlvbnMgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzY29wZVxuICAgICAqIEBwYXJhbSB7anFMaXRlfSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy52aWV3S2V5XG4gICAgICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5kaXJlY3RpdmVPbmx5XVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtvcHRpb25zLm9uRGVzdHJveV1cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMubW9kaWZpZXJUZW1wbGF0ZV1cbiAgICAgKi9cbiAgICBHZW5lcmljVmlldy5yZWdpc3RlciA9IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgb3B0aW9ucykge1xuICAgICAgdmFyIHZpZXcgPSBuZXcgR2VuZXJpY1ZpZXcoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBvcHRpb25zKTtcblxuICAgICAgaWYgKCFvcHRpb25zLnZpZXdLZXkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdvcHRpb25zLnZpZXdLZXkgaXMgcmVxdWlyZWQuJyk7XG4gICAgICB9XG5cbiAgICAgICRvbnNlbi5kZWNsYXJlVmFyQXR0cmlidXRlKGF0dHJzLCB2aWV3KTtcbiAgICAgIGVsZW1lbnQuZGF0YShvcHRpb25zLnZpZXdLZXksIHZpZXcpO1xuXG4gICAgICB2YXIgZGVzdHJveSA9IG9wdGlvbnMub25EZXN0cm95IHx8IGFuZ3VsYXIubm9vcDtcbiAgICAgIG9wdGlvbnMub25EZXN0cm95ID0gZnVuY3Rpb24odmlldykge1xuICAgICAgICBkZXN0cm95KHZpZXcpO1xuICAgICAgICBlbGVtZW50LmRhdGEob3B0aW9ucy52aWV3S2V5LCBudWxsKTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB2aWV3O1xuICAgIH07XG5cbiAgICBNaWNyb0V2ZW50Lm1peGluKEdlbmVyaWNWaWV3KTtcblxuICAgIHJldHVybiBHZW5lcmljVmlldztcbiAgfSk7XG59KSgpO1xuIiwiLyoqXG4gKiBAZWxlbWVudCBvbnMtbGF6eS1yZXBlYXRcbiAqIEBkZXNjcmlwdGlvblxuICogICBbZW5dXG4gKiAgICAgVXNpbmcgdGhpcyBjb21wb25lbnQgYSBsaXN0IHdpdGggbWlsbGlvbnMgb2YgaXRlbXMgY2FuIGJlIHJlbmRlcmVkIHdpdGhvdXQgYSBkcm9wIGluIHBlcmZvcm1hbmNlLlxuICogICAgIEl0IGRvZXMgdGhhdCBieSBcImxhemlseVwiIGxvYWRpbmcgZWxlbWVudHMgaW50byB0aGUgRE9NIHdoZW4gdGhleSBjb21lIGludG8gdmlldyBhbmRcbiAqICAgICByZW1vdmluZyBpdGVtcyBmcm9tIHRoZSBET00gd2hlbiB0aGV5IGFyZSBub3QgdmlzaWJsZS5cbiAqICAgWy9lbl1cbiAqICAgW2phXVxuICogICAgIOOBk+OBruOCs+ODs+ODneODvOODjeODs+ODiOWGheOBp+aPj+eUu+OBleOCjOOCi+OCouOCpOODhuODoOOBrkRPTeimgee0oOOBruiqreOBv+i+vOOBv+OBr+OAgeeUu+mdouOBq+imi+OBiOOBneOBhuOBq+OBquOBo+OBn+aZguOBvuOBp+iHquWLleeahOOBq+mBheW7tuOBleOCjOOAgVxuICogICAgIOeUu+mdouOBi+OCieimi+OBiOOBquOBj+OBquOBo+OBn+WgtOWQiOOBq+OBr+OBneOBruimgee0oOOBr+WLleeahOOBq+OCouODs+ODreODvOODieOBleOCjOOBvuOBmeOAglxuICogICAgIOOBk+OBruOCs+ODs+ODneODvOODjeODs+ODiOOCkuS9v+OBhuOBk+OBqOOBp+OAgeODkeODleOCqeODvOODnuODs+OCueOCkuWKo+WMluOBleOBm+OCi+OBk+OBqOeEoeOBl+OBq+W3qOWkp+OBquaVsOOBruimgee0oOOCkuaPj+eUu+OBp+OBjeOBvuOBmeOAglxuICogICBbL2phXVxuICogQGNvZGVwZW4gUXdyR0JtXG4gKiBAZ3VpZGUgVXNpbmdMYXp5UmVwZWF0XG4gKiAgIFtlbl1Ib3cgdG8gdXNlIExhenkgUmVwZWF0Wy9lbl1cbiAqICAgW2phXeODrOOCpOOCuOODvOODquODlOODvOODiOOBruS9v+OBhOaWuVsvamFdXG4gKiBAZXhhbXBsZVxuICogPHNjcmlwdD5cbiAqICAgb25zLmJvb3RzdHJhcCgpXG4gKlxuICogICAuY29udHJvbGxlcignTXlDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlKSB7XG4gKiAgICAgJHNjb3BlLk15RGVsZWdhdGUgPSB7XG4gKiAgICAgICBjb3VudEl0ZW1zOiBmdW5jdGlvbigpIHtcbiAqICAgICAgICAgLy8gUmV0dXJuIG51bWJlciBvZiBpdGVtcy5cbiAqICAgICAgICAgcmV0dXJuIDEwMDAwMDA7XG4gKiAgICAgICB9LFxuICpcbiAqICAgICAgIGNhbGN1bGF0ZUl0ZW1IZWlnaHQ6IGZ1bmN0aW9uKGluZGV4KSB7XG4gKiAgICAgICAgIC8vIFJldHVybiB0aGUgaGVpZ2h0IG9mIGFuIGl0ZW0gaW4gcGl4ZWxzLlxuICogICAgICAgICByZXR1cm4gNDU7XG4gKiAgICAgICB9LFxuICpcbiAqICAgICAgIGNvbmZpZ3VyZUl0ZW1TY29wZTogZnVuY3Rpb24oaW5kZXgsIGl0ZW1TY29wZSkge1xuICogICAgICAgICAvLyBJbml0aWFsaXplIHNjb3BlXG4gKiAgICAgICAgIGl0ZW1TY29wZS5pdGVtID0gJ0l0ZW0gIycgKyAoaW5kZXggKyAxKTtcbiAqICAgICAgIH0sXG4gKlxuICogICAgICAgZGVzdHJveUl0ZW1TY29wZTogZnVuY3Rpb24oaW5kZXgsIGl0ZW1TY29wZSkge1xuICogICAgICAgICAvLyBPcHRpb25hbCBtZXRob2QgdGhhdCBpcyBjYWxsZWQgd2hlbiBhbiBpdGVtIGlzIHVubG9hZGVkLlxuICogICAgICAgICBjb25zb2xlLmxvZygnRGVzdHJveWVkIGl0ZW0gd2l0aCBpbmRleDogJyArIGluZGV4KTtcbiAqICAgICAgIH1cbiAqICAgICB9O1xuICogICB9KTtcbiAqIDwvc2NyaXB0PlxuICpcbiAqIDxvbnMtbGlzdCBuZy1jb250cm9sbGVyPVwiTXlDb250cm9sbGVyXCI+XG4gKiAgIDxvbnMtbGlzdC1pdGVtIG9ucy1sYXp5LXJlcGVhdD1cIk15RGVsZWdhdGVcIj5cbiAqICAgICB7eyBpdGVtIH19XG4gKiAgIDwvb25zLWxpc3QtaXRlbT5cbiAqIDwvb25zLWxpc3Q+XG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIG9ucy1sYXp5LXJlcGVhdFxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAaW5pdG9ubHlcbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BIGRlbGVnYXRlIG9iamVjdCwgY2FuIGJlIGVpdGhlciBhbiBvYmplY3QgYXR0YWNoZWQgdG8gdGhlIHNjb3BlICh3aGVuIHVzaW5nIEFuZ3VsYXJKUykgb3IgYSBub3JtYWwgSmF2YVNjcmlwdCB2YXJpYWJsZS5bL2VuXVxuICogIFtqYV3opoHntKDjga7jg63jg7zjg4njgIHjgqLjg7Pjg63jg7zjg4njgarjganjga7lh6bnkIbjgpLlp5TorbLjgZnjgovjgqrjg5bjgrjjgqfjgq/jg4jjgpLmjIflrprjgZfjgb7jgZnjgIJBbmd1bGFySlPjga7jgrnjgrPjg7zjg5fjga7lpInmlbDlkI3jgoTjgIHpgJrluLjjga5KYXZhU2NyaXB044Gu5aSJ5pWw5ZCN44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBwcm9wZXJ0eSBkZWxlZ2F0ZS5jb25maWd1cmVJdGVtU2NvcGVcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogICBbZW5dRnVuY3Rpb24gd2hpY2ggcmVjaWV2ZXMgYW4gaW5kZXggYW5kIHRoZSBzY29wZSBmb3IgdGhlIGl0ZW0uIENhbiBiZSB1c2VkIHRvIGNvbmZpZ3VyZSB2YWx1ZXMgaW4gdGhlIGl0ZW0gc2NvcGUuWy9lbl1cbiAqICAgW2phXVsvamFdXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpO1xuXG4gIC8qKlxuICAgKiBMYXp5IHJlcGVhdCBkaXJlY3RpdmUuXG4gICAqL1xuICBtb2R1bGUuZGlyZWN0aXZlKCdvbnNMYXp5UmVwZWF0JywgZnVuY3Rpb24oJG9uc2VuLCBMYXp5UmVwZWF0Vmlldykge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgcmVwbGFjZTogZmFsc2UsXG4gICAgICBwcmlvcml0eTogMTAwMCxcbiAgICAgIHRlcm1pbmFsOiB0cnVlLFxuXG4gICAgICBjb21waWxlOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgdmFyIGxhenlSZXBlYXQgPSBuZXcgTGF6eVJlcGVhdFZpZXcoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKTtcblxuICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNjb3BlID0gZWxlbWVudCA9IGF0dHJzID0gbGF6eVJlcGVhdCA9IG51bGw7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG5cbn0pKCk7XG4iLCIvKlxuQ29weXJpZ2h0IDIwMTMtMjAxNSBBU0lBTCBDT1JQT1JBVElPTlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4qL1xuXG4oZnVuY3Rpb24oKXtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpLmZhY3RvcnkoJ0FuZ3VsYXJMYXp5UmVwZWF0RGVsZWdhdGUnLCBmdW5jdGlvbigkY29tcGlsZSkge1xuXG4gICAgY29uc3QgZGlyZWN0aXZlQXR0cmlidXRlcyA9IFsnb25zLWxhenktcmVwZWF0JywgJ29uczpsYXp5OnJlcGVhdCcsICdvbnNfbGF6eV9yZXBlYXQnLCAnZGF0YS1vbnMtbGF6eS1yZXBlYXQnLCAneC1vbnMtbGF6eS1yZXBlYXQnXTtcbiAgICBjbGFzcyBBbmd1bGFyTGF6eVJlcGVhdERlbGVnYXRlIGV4dGVuZHMgb25zLl9pbnRlcm5hbC5MYXp5UmVwZWF0RGVsZWdhdGUge1xuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gdXNlckRlbGVnYXRlXG4gICAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRlbXBsYXRlRWxlbWVudFxuICAgICAgICogQHBhcmFtIHtTY29wZX0gcGFyZW50U2NvcGVcbiAgICAgICAqL1xuICAgICAgY29uc3RydWN0b3IodXNlckRlbGVnYXRlLCB0ZW1wbGF0ZUVsZW1lbnQsIHBhcmVudFNjb3BlKSB7XG4gICAgICAgIHN1cGVyKHVzZXJEZWxlZ2F0ZSwgdGVtcGxhdGVFbGVtZW50KTtcbiAgICAgICAgdGhpcy5fcGFyZW50U2NvcGUgPSBwYXJlbnRTY29wZTtcblxuICAgICAgICBkaXJlY3RpdmVBdHRyaWJ1dGVzLmZvckVhY2goYXR0ciA9PiB0ZW1wbGF0ZUVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKGF0dHIpKTtcbiAgICAgICAgdGhpcy5fbGlua2VyID0gJGNvbXBpbGUodGVtcGxhdGVFbGVtZW50ID8gdGVtcGxhdGVFbGVtZW50LmNsb25lTm9kZSh0cnVlKSA6IG51bGwpO1xuICAgICAgfVxuXG4gICAgICBjb25maWd1cmVJdGVtU2NvcGUoaXRlbSwgc2NvcGUpe1xuICAgICAgICBpZiAodGhpcy5fdXNlckRlbGVnYXRlLmNvbmZpZ3VyZUl0ZW1TY29wZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAgICAgdGhpcy5fdXNlckRlbGVnYXRlLmNvbmZpZ3VyZUl0ZW1TY29wZShpdGVtLCBzY29wZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZGVzdHJveUl0ZW1TY29wZShpdGVtLCBlbGVtZW50KXtcbiAgICAgICAgaWYgKHRoaXMuX3VzZXJEZWxlZ2F0ZS5kZXN0cm95SXRlbVNjb3BlIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgICAgICB0aGlzLl91c2VyRGVsZWdhdGUuZGVzdHJveUl0ZW1TY29wZShpdGVtLCBlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBfdXNpbmdCaW5kaW5nKCkge1xuICAgICAgICBpZiAodGhpcy5fdXNlckRlbGVnYXRlLmNvbmZpZ3VyZUl0ZW1TY29wZSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX3VzZXJEZWxlZ2F0ZS5jcmVhdGVJdGVtQ29udGVudCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYGxhenktcmVwZWF0YCBkZWxlZ2F0ZSBvYmplY3QgaXMgdmFndWUuJyk7XG4gICAgICB9XG5cbiAgICAgIGxvYWRJdGVtRWxlbWVudChpbmRleCwgcGFyZW50LCBkb25lKSB7XG4gICAgICAgIHRoaXMuX3ByZXBhcmVJdGVtRWxlbWVudChpbmRleCwgKHtlbGVtZW50LCBzY29wZX0pID0+IHtcbiAgICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgICAgICAgZG9uZSh7ZWxlbWVudCwgc2NvcGV9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIF9wcmVwYXJlSXRlbUVsZW1lbnQoaW5kZXgsIGRvbmUpIHtcbiAgICAgICAgY29uc3Qgc2NvcGUgPSB0aGlzLl9wYXJlbnRTY29wZS4kbmV3KCk7XG4gICAgICAgIHRoaXMuX2FkZFNwZWNpYWxQcm9wZXJ0aWVzKGluZGV4LCBzY29wZSk7XG5cbiAgICAgICAgaWYgKHRoaXMuX3VzaW5nQmluZGluZygpKSB7XG4gICAgICAgICAgdGhpcy5jb25maWd1cmVJdGVtU2NvcGUoaW5kZXgsIHNjb3BlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2xpbmtlcihzY29wZSwgKGNsb25lZCkgPT4ge1xuICAgICAgICAgIGxldCBlbGVtZW50ID0gY2xvbmVkWzBdO1xuICAgICAgICAgIGlmICghdGhpcy5fdXNpbmdCaW5kaW5nKCkpIHtcbiAgICAgICAgICAgIGVsZW1lbnQgPSB0aGlzLl91c2VyRGVsZWdhdGUuY3JlYXRlSXRlbUNvbnRlbnQoaW5kZXgsIGVsZW1lbnQpO1xuICAgICAgICAgICAgJGNvbXBpbGUoZWxlbWVudCkoc2NvcGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvbmUoe2VsZW1lbnQsIHNjb3BlfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IHNjb3BlXG4gICAgICAgKi9cbiAgICAgIF9hZGRTcGVjaWFsUHJvcGVydGllcyhpLCBzY29wZSkge1xuICAgICAgICBjb25zdCBsYXN0ID0gdGhpcy5jb3VudEl0ZW1zKCkgLSAxO1xuICAgICAgICBhbmd1bGFyLmV4dGVuZChzY29wZSwge1xuICAgICAgICAgICRpbmRleDogaSxcbiAgICAgICAgICAkZmlyc3Q6IGkgPT09IDAsXG4gICAgICAgICAgJGxhc3Q6IGkgPT09IGxhc3QsXG4gICAgICAgICAgJG1pZGRsZTogaSAhPT0gMCAmJiBpICE9PSBsYXN0LFxuICAgICAgICAgICRldmVuOiBpICUgMiA9PT0gMCxcbiAgICAgICAgICAkb2RkOiBpICUgMiA9PT0gMVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdXBkYXRlSXRlbShpbmRleCwgaXRlbSkge1xuICAgICAgICBpZiAodGhpcy5fdXNpbmdCaW5kaW5nKCkpIHtcbiAgICAgICAgICBpdGVtLnNjb3BlLiRldmFsQXN5bmMoKCkgPT4gdGhpcy5jb25maWd1cmVJdGVtU2NvcGUoaW5kZXgsIGl0ZW0uc2NvcGUpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdXBlci51cGRhdGVJdGVtKGluZGV4LCBpdGVtKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGl0ZW1cbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtLnNjb3BlXG4gICAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGl0ZW0uZWxlbWVudFxuICAgICAgICovXG4gICAgICBkZXN0cm95SXRlbShpbmRleCwgaXRlbSkge1xuICAgICAgICBpZiAodGhpcy5fdXNpbmdCaW5kaW5nKCkpIHtcbiAgICAgICAgICB0aGlzLmRlc3Ryb3lJdGVtU2NvcGUoaW5kZXgsIGl0ZW0uc2NvcGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN1cGVyLmRlc3Ryb3lJdGVtKGluZGV4LCBpdGVtLmVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICAgIGl0ZW0uc2NvcGUuJGRlc3Ryb3koKTtcbiAgICAgIH1cblxuICAgICAgZGVzdHJveSgpIHtcbiAgICAgICAgc3VwZXIuZGVzdHJveSgpO1xuICAgICAgICB0aGlzLl9zY29wZSA9IG51bGw7XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICByZXR1cm4gQW5ndWxhckxhenlSZXBlYXREZWxlZ2F0ZTtcbiAgfSk7XG59KSgpO1xuIiwiLyoqXG4gKiBAZWxlbWVudCBvbnMtbW9kYWxcbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgdmFyXG4gKiBAdHlwZSB7U3RyaW5nfVxuICogQGluaXRvbmx5XG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXVZhcmlhYmxlIG5hbWUgdG8gcmVmZXIgdGhpcyBtb2RhbC5bL2VuXVxuICogICBbamFd44GT44Gu44Oi44O844OA44Or44KS5Y+C54Wn44GZ44KL44Gf44KB44Gu5ZCN5YmN44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKipcbiAgICogTW9kYWwgZGlyZWN0aXZlLlxuICAgKi9cbiAgYW5ndWxhci5tb2R1bGUoJ29uc2VuJykuZGlyZWN0aXZlKCdvbnNNb2RhbCcsIGZ1bmN0aW9uKCRvbnNlbiwgTW9kYWxWaWV3KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICByZXBsYWNlOiBmYWxzZSxcblxuICAgICAgLy8gTk9URTogVGhpcyBlbGVtZW50IG11c3QgY29leGlzdHMgd2l0aCBuZy1jb250cm9sbGVyLlxuICAgICAgLy8gRG8gbm90IHVzZSBpc29sYXRlZCBzY29wZSBhbmQgdGVtcGxhdGUncyBuZy10cmFuc2NsdWRlLlxuICAgICAgc2NvcGU6IGZhbHNlLFxuICAgICAgdHJhbnNjbHVkZTogZmFsc2UsXG5cbiAgICAgIGxpbms6IHtcbiAgICAgICAgcHJlOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICBDdXN0b21FbGVtZW50cy51cGdyYWRlKGVsZW1lbnRbMF0pO1xuICAgICAgICAgIHZhciBtb2RhbCA9IG5ldyBNb2RhbFZpZXcoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKTtcbiAgICAgICAgICAkb25zZW4uYWRkTW9kaWZpZXJNZXRob2RzRm9yQ3VzdG9tRWxlbWVudHMobW9kYWwsIGVsZW1lbnQpO1xuXG4gICAgICAgICAgJG9uc2VuLmRlY2xhcmVWYXJBdHRyaWJ1dGUoYXR0cnMsIG1vZGFsKTtcbiAgICAgICAgICBlbGVtZW50LmRhdGEoJ29ucy1tb2RhbCcsIG1vZGFsKTtcblxuICAgICAgICAgIGVsZW1lbnRbMF0uX2Vuc3VyZU5vZGVQb3NpdGlvbigpO1xuXG4gICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJG9uc2VuLnJlbW92ZU1vZGlmaWVyTWV0aG9kcyhtb2RhbCk7XG4gICAgICAgICAgICBlbGVtZW50LmRhdGEoJ29ucy1tb2RhbCcsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICBtb2RhbCA9IGVsZW1lbnQgPSBzY29wZSA9IGF0dHJzID0gbnVsbDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBwb3N0OiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCkge1xuICAgICAgICAgICRvbnNlbi5maXJlQ29tcG9uZW50RXZlbnQoZWxlbWVudFswXSwgJ2luaXQnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH0pO1xuXG59KSgpO1xuIiwiLyoqXG4gKiBAZWxlbWVudCBvbnMtbmF2aWdhdG9yXG4gKiBAZXhhbXBsZVxuICogPG9ucy1uYXZpZ2F0b3IgYW5pbWF0aW9uPVwic2xpZGVcIiB2YXI9XCJhcHAubmF2aVwiPlxuICogICA8b25zLXBhZ2U+XG4gKiAgICAgPG9ucy10b29sYmFyPlxuICogICAgICAgPGRpdiBjbGFzcz1cImNlbnRlclwiPlRpdGxlPC9kaXY+XG4gKiAgICAgPC9vbnMtdG9vbGJhcj5cbiAqXG4gKiAgICAgPHAgc3R5bGU9XCJ0ZXh0LWFsaWduOiBjZW50ZXJcIj5cbiAqICAgICAgIDxvbnMtYnV0dG9uIG1vZGlmaWVyPVwibGlnaHRcIiBuZy1jbGljaz1cImFwcC5uYXZpLnB1c2hQYWdlKCdwYWdlLmh0bWwnKTtcIj5QdXNoPC9vbnMtYnV0dG9uPlxuICogICAgIDwvcD5cbiAqICAgPC9vbnMtcGFnZT5cbiAqIDwvb25zLW5hdmlnYXRvcj5cbiAqXG4gKiA8b25zLXRlbXBsYXRlIGlkPVwicGFnZS5odG1sXCI+XG4gKiAgIDxvbnMtcGFnZT5cbiAqICAgICA8b25zLXRvb2xiYXI+XG4gKiAgICAgICA8ZGl2IGNsYXNzPVwiY2VudGVyXCI+VGl0bGU8L2Rpdj5cbiAqICAgICA8L29ucy10b29sYmFyPlxuICpcbiAqICAgICA8cCBzdHlsZT1cInRleHQtYWxpZ246IGNlbnRlclwiPlxuICogICAgICAgPG9ucy1idXR0b24gbW9kaWZpZXI9XCJsaWdodFwiIG5nLWNsaWNrPVwiYXBwLm5hdmkucG9wUGFnZSgpO1wiPlBvcDwvb25zLWJ1dHRvbj5cbiAqICAgICA8L3A+XG4gKiAgIDwvb25zLXBhZ2U+XG4gKiA8L29ucy10ZW1wbGF0ZT5cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgdmFyXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dVmFyaWFibGUgbmFtZSB0byByZWZlciB0aGlzIG5hdmlnYXRvci5bL2VuXVxuICogIFtqYV3jgZPjga7jg4rjg5PjgrLjg7zjgr/jg7zjgpLlj4LnhafjgZnjgovjgZ/jgoHjga7lkI3liY3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBvbnMtcHJlcHVzaFxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BbGxvd3MgeW91IHRvIHNwZWNpZnkgY3VzdG9tIGJlaGF2aW9yIHdoZW4gdGhlIFwicHJlcHVzaFwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXVwicHJlcHVzaFwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLXByZXBvcFxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BbGxvd3MgeW91IHRvIHNwZWNpZnkgY3VzdG9tIGJlaGF2aW9yIHdoZW4gdGhlIFwicHJlcG9wXCIgZXZlbnQgaXMgZmlyZWQuWy9lbl1cbiAqICBbamFdXCJwcmVwb3BcIuOCpOODmeODs+ODiOOBjOeZuueBq+OBleOCjOOBn+aZguOBruaMmeWLleOCkueLrOiHquOBq+aMh+WumuOBp+OBjeOBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIG9ucy1wb3N0cHVzaFxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BbGxvd3MgeW91IHRvIHNwZWNpZnkgY3VzdG9tIGJlaGF2aW9yIHdoZW4gdGhlIFwicG9zdHB1c2hcIiBldmVudCBpcyBmaXJlZC5bL2VuXVxuICogIFtqYV1cInBvc3RwdXNoXCLjgqTjg5njg7Pjg4jjgYznmbrngavjgZXjgozjgZ/mmYLjga7mjJnli5XjgpLni6zoh6rjgavmjIflrprjgafjgY3jgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBvbnMtcG9zdHBvcFxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BbGxvd3MgeW91IHRvIHNwZWNpZnkgY3VzdG9tIGJlaGF2aW9yIHdoZW4gdGhlIFwicG9zdHBvcFwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXVwicG9zdHBvcFwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWluaXRcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIGEgcGFnZSdzIFwiaW5pdFwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXeODmuODvOOCuOOBrlwiaW5pdFwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLXNob3dcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIGEgcGFnZSdzIFwic2hvd1wiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXeODmuODvOOCuOOBrlwic2hvd1wi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWhpZGVcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIGEgcGFnZSdzIFwiaGlkZVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXeODmuODvOOCuOOBrlwiaGlkZVwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWRlc3Ryb3lcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIGEgcGFnZSdzIFwiZGVzdHJveVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXeODmuODvOOCuOOBrlwiZGVzdHJveVwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBtZXRob2Qgb25cbiAqIEBzaWduYXR1cmUgb24oZXZlbnROYW1lLCBsaXN0ZW5lcilcbiAqIEBkZXNjcmlwdGlvblxuICogICBbZW5dQWRkIGFuIGV2ZW50IGxpc3RlbmVyLlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgpLov73liqDjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZVxuICogICBbZW5dTmFtZSBvZiB0aGUgZXZlbnQuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOWQjeOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICogICBbZW5dRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuWy9lbl1cbiAqICAgW2phXeOBk+OBruOCpOODmeODs+ODiOOBjOeZuueBq+OBleOCjOOBn+mam+OBq+WRvOOBs+WHuuOBleOCjOOCi+mWouaVsOOCquODluOCuOOCp+OCr+ODiOOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAbWV0aG9kIG9uY2VcbiAqIEBzaWduYXR1cmUgb25jZShldmVudE5hbWUsIGxpc3RlbmVyKVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXUFkZCBhbiBldmVudCBsaXN0ZW5lciB0aGF0J3Mgb25seSB0cmlnZ2VyZWQgb25jZS5bL2VuXVxuICogIFtqYV3kuIDluqbjgaDjgZHlkbzjgbPlh7rjgZXjgozjgovjgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgpLov73liqDjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZVxuICogICBbZW5dTmFtZSBvZiB0aGUgZXZlbnQuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOWQjeOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICogICBbZW5dRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOOBjOeZuueBq+OBl+OBn+mam+OBq+WRvOOBs+WHuuOBleOCjOOCi+mWouaVsOOCquODluOCuOOCp+OCr+ODiOOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAbWV0aG9kIG9mZlxuICogQHNpZ25hdHVyZSBvZmYoZXZlbnROYW1lLCBbbGlzdGVuZXJdKVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXVJlbW92ZSBhbiBldmVudCBsaXN0ZW5lci4gSWYgdGhlIGxpc3RlbmVyIGlzIG5vdCBzcGVjaWZpZWQgYWxsIGxpc3RlbmVycyBmb3IgdGhlIGV2ZW50IHR5cGUgd2lsbCBiZSByZW1vdmVkLlsvZW5dXG4gKiAgW2phXeOCpOODmeODs+ODiOODquOCueODiuODvOOCkuWJiumZpOOBl+OBvuOBmeOAguOCguOBl+OCpOODmeODs+ODiOODquOCueODiuODvOOCkuaMh+WumuOBl+OBquOBi+OBo+OBn+WgtOWQiOOBq+OBr+OAgeOBneOBruOCpOODmeODs+ODiOOBq+e0kOOBpeOBj+WFqOOBpuOBruOCpOODmeODs+ODiOODquOCueODiuODvOOBjOWJiumZpOOBleOCjOOBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lXG4gKiAgIFtlbl1OYW1lIG9mIHRoZSBldmVudC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI5ZCN44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXG4gKiAgIFtlbl1GdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZC5bL2VuXVxuICogICBbamFd5YmK6Zmk44GZ44KL44Kk44OZ44Oz44OI44Oq44K544OK44O844KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgbGFzdFJlYWR5ID0gd2luZG93Lk9uc05hdmlnYXRvckVsZW1lbnQucmV3cml0YWJsZXMucmVhZHk7XG4gIHdpbmRvdy5PbnNOYXZpZ2F0b3JFbGVtZW50LnJld3JpdGFibGVzLnJlYWR5ID0gb25zLl93YWl0RGlyZXRpdmVJbml0KCdvbnMtbmF2aWdhdG9yJywgbGFzdFJlYWR5KTtcblxuICB2YXIgbGFzdExpbmsgPSB3aW5kb3cuT25zTmF2aWdhdG9yRWxlbWVudC5yZXdyaXRhYmxlcy5saW5rO1xuICB3aW5kb3cuT25zTmF2aWdhdG9yRWxlbWVudC5yZXdyaXRhYmxlcy5saW5rID0gZnVuY3Rpb24obmF2aWdhdG9yRWxlbWVudCwgdGFyZ2V0LCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIHZhciB2aWV3ID0gYW5ndWxhci5lbGVtZW50KG5hdmlnYXRvckVsZW1lbnQpLmRhdGEoJ29ucy1uYXZpZ2F0b3InKTtcbiAgICB2aWV3Ll9jb21waWxlQW5kTGluayh0YXJnZXQsIGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgbGFzdExpbmsobmF2aWdhdG9yRWxlbWVudCwgdGFyZ2V0LCBvcHRpb25zLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH07XG5cbiAgYW5ndWxhci5tb2R1bGUoJ29uc2VuJykuZGlyZWN0aXZlKCdvbnNOYXZpZ2F0b3InLCBmdW5jdGlvbihOYXZpZ2F0b3JWaWV3LCAkb25zZW4pIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcblxuICAgICAgLy8gTk9URTogVGhpcyBlbGVtZW50IG11c3QgY29leGlzdHMgd2l0aCBuZy1jb250cm9sbGVyLlxuICAgICAgLy8gRG8gbm90IHVzZSBpc29sYXRlZCBzY29wZSBhbmQgdGVtcGxhdGUncyBuZy10cmFuc2NsdWRlLlxuICAgICAgdHJhbnNjbHVkZTogZmFsc2UsXG4gICAgICBzY29wZTogdHJ1ZSxcblxuICAgICAgY29tcGlsZTogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICBDdXN0b21FbGVtZW50cy51cGdyYWRlKGVsZW1lbnRbMF0pO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcHJlOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGNvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgIEN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoZWxlbWVudFswXSk7XG4gICAgICAgICAgICB2YXIgbmF2aWdhdG9yID0gbmV3IE5hdmlnYXRvclZpZXcoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKTtcblxuICAgICAgICAgICAgJG9uc2VuLmRlY2xhcmVWYXJBdHRyaWJ1dGUoYXR0cnMsIG5hdmlnYXRvcik7XG4gICAgICAgICAgICAkb25zZW4ucmVnaXN0ZXJFdmVudEhhbmRsZXJzKG5hdmlnYXRvciwgJ3ByZXB1c2ggcHJlcG9wIHBvc3RwdXNoIHBvc3Rwb3AgaW5pdCBzaG93IGhpZGUgZGVzdHJveScpO1xuXG4gICAgICAgICAgICBlbGVtZW50LmRhdGEoJ29ucy1uYXZpZ2F0b3InLCBuYXZpZ2F0b3IpO1xuXG4gICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIG5hdmlnYXRvci5fZXZlbnRzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICBlbGVtZW50LmRhdGEoJ29ucy1uYXZpZ2F0b3InLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgICBlbGVtZW50ID0gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwb3N0OiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgICRvbnNlbi5maXJlQ29tcG9uZW50RXZlbnQoZWxlbWVudFswXSwgJ2luaXQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59KSgpO1xuIiwiLypcbkNvcHlyaWdodCAyMDEzLTIwMTUgQVNJQUwgQ09SUE9SQVRJT05cblxuICAgTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAgIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG5odHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuKi9cblxuYW5ndWxhci5tb2R1bGUoJ29uc2VuJylcbiAgLnZhbHVlKCdOYXZpZ2F0b3JUcmFuc2l0aW9uQW5pbWF0b3InLCBvbnMuX2ludGVybmFsLk5hdmlnYXRvclRyYW5zaXRpb25BbmltYXRvcilcbiAgLnZhbHVlKCdGYWRlVHJhbnNpdGlvbkFuaW1hdG9yJywgb25zLl9pbnRlcm5hbC5GYWRlTmF2aWdhdG9yVHJhbnNpdGlvbkFuaW1hdG9yKVxuICAudmFsdWUoJ0lPU1NsaWRlVHJhbnNpdGlvbkFuaW1hdG9yJywgb25zLl9pbnRlcm5hbC5JT1NTbGlkZU5hdmlnYXRvclRyYW5zaXRpb25BbmltYXRvcilcbiAgLnZhbHVlKCdMaWZ0VHJhbnNpdGlvbkFuaW1hdG9yJywgb25zLl9pbnRlcm5hbC5MaWZ0TmF2aWdhdG9yVHJhbnNpdGlvbkFuaW1hdG9yKVxuICAudmFsdWUoJ051bGxUcmFuc2l0aW9uQW5pbWF0b3InLCBvbnMuX2ludGVybmFsLk5hdmlnYXRvclRyYW5zaXRpb25BbmltYXRvcilcbiAgLnZhbHVlKCdTaW1wbGVTbGlkZVRyYW5zaXRpb25BbmltYXRvcicsIG9ucy5faW50ZXJuYWwuU2ltcGxlU2xpZGVOYXZpZ2F0b3JUcmFuc2l0aW9uQW5pbWF0b3IpO1xuIiwiLypcbkNvcHlyaWdodCAyMDEzLTIwMTUgQVNJQUwgQ09SUE9SQVRJT05cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuKi9cblxuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKTtcblxuICBtb2R1bGUuZmFjdG9yeSgnT3ZlcmxheVNsaWRpbmdNZW51QW5pbWF0b3InLCBmdW5jdGlvbihTbGlkaW5nTWVudUFuaW1hdG9yKSB7XG5cbiAgICB2YXIgT3ZlcmxheVNsaWRpbmdNZW51QW5pbWF0b3IgPSBTbGlkaW5nTWVudUFuaW1hdG9yLmV4dGVuZCh7XG5cbiAgICAgIF9ibGFja01hc2s6IHVuZGVmaW5lZCxcblxuICAgICAgX2lzUmlnaHQ6IGZhbHNlLFxuICAgICAgX2VsZW1lbnQ6IGZhbHNlLFxuICAgICAgX21lbnVQYWdlOiBmYWxzZSxcbiAgICAgIF9tYWluUGFnZTogZmFsc2UsXG4gICAgICBfd2lkdGg6IGZhbHNlLFxuXG4gICAgICAvKipcbiAgICAgICAqIEBwYXJhbSB7anFMaXRlfSBlbGVtZW50IFwib25zLXNsaWRpbmctbWVudVwiIG9yIFwib25zLXNwbGl0LXZpZXdcIiBlbGVtZW50XG4gICAgICAgKiBAcGFyYW0ge2pxTGl0ZX0gbWFpblBhZ2VcbiAgICAgICAqIEBwYXJhbSB7anFMaXRlfSBtZW51UGFnZVxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLndpZHRoIFwid2lkdGhcIiBzdHlsZSB2YWx1ZVxuICAgICAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLmlzUmlnaHRcbiAgICAgICAqL1xuICAgICAgc2V0dXA6IGZ1bmN0aW9uKGVsZW1lbnQsIG1haW5QYWdlLCBtZW51UGFnZSwgb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgdGhpcy5fd2lkdGggPSBvcHRpb25zLndpZHRoIHx8ICc5MCUnO1xuICAgICAgICB0aGlzLl9pc1JpZ2h0ID0gISFvcHRpb25zLmlzUmlnaHQ7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLl9tYWluUGFnZSA9IG1haW5QYWdlO1xuICAgICAgICB0aGlzLl9tZW51UGFnZSA9IG1lbnVQYWdlO1xuXG4gICAgICAgIG1lbnVQYWdlLmNzcygnYm94LXNoYWRvdycsICcwcHggMCAxMHB4IDBweCByZ2JhKDAsIDAsIDAsIDAuMiknKTtcbiAgICAgICAgbWVudVBhZ2UuY3NzKHtcbiAgICAgICAgICB3aWR0aDogb3B0aW9ucy53aWR0aCxcbiAgICAgICAgICBkaXNwbGF5OiAnbm9uZScsXG4gICAgICAgICAgekluZGV4OiAyXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEZpeCBmb3IgdHJhbnNwYXJlbnQgbWVudSBwYWdlIG9uIGlPUzguXG4gICAgICAgIG1lbnVQYWdlLmNzcygnLXdlYmtpdC10cmFuc2Zvcm0nLCAndHJhbnNsYXRlM2QoMHB4LCAwcHgsIDBweCknKTtcblxuICAgICAgICBtYWluUGFnZS5jc3Moe3pJbmRleDogMX0pO1xuXG4gICAgICAgIGlmICh0aGlzLl9pc1JpZ2h0KSB7XG4gICAgICAgICAgbWVudVBhZ2UuY3NzKHtcbiAgICAgICAgICAgIHJpZ2h0OiAnLScgKyBvcHRpb25zLndpZHRoLFxuICAgICAgICAgICAgbGVmdDogJ2F1dG8nXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWVudVBhZ2UuY3NzKHtcbiAgICAgICAgICAgIHJpZ2h0OiAnYXV0bycsXG4gICAgICAgICAgICBsZWZ0OiAnLScgKyBvcHRpb25zLndpZHRoXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9ibGFja01hc2sgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXY+PC9kaXY+JykuY3NzKHtcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICdibGFjaycsXG4gICAgICAgICAgdG9wOiAnMHB4JyxcbiAgICAgICAgICBsZWZ0OiAnMHB4JyxcbiAgICAgICAgICByaWdodDogJzBweCcsXG4gICAgICAgICAgYm90dG9tOiAnMHB4JyxcbiAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICBkaXNwbGF5OiAnbm9uZScsXG4gICAgICAgICAgekluZGV4OiAwXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVsZW1lbnQucHJlcGVuZCh0aGlzLl9ibGFja01hc2spO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMud2lkdGhcbiAgICAgICAqL1xuICAgICAgb25SZXNpemVkOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuX21lbnVQYWdlLmNzcygnd2lkdGgnLCBvcHRpb25zLndpZHRoKTtcblxuICAgICAgICBpZiAodGhpcy5faXNSaWdodCkge1xuICAgICAgICAgIHRoaXMuX21lbnVQYWdlLmNzcyh7XG4gICAgICAgICAgICByaWdodDogJy0nICsgb3B0aW9ucy53aWR0aCxcbiAgICAgICAgICAgIGxlZnQ6ICdhdXRvJ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX21lbnVQYWdlLmNzcyh7XG4gICAgICAgICAgICByaWdodDogJ2F1dG8nLFxuICAgICAgICAgICAgbGVmdDogJy0nICsgb3B0aW9ucy53aWR0aFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuaXNPcGVuZWQpIHtcbiAgICAgICAgICB2YXIgbWF4ID0gdGhpcy5fbWVudVBhZ2VbMF0uY2xpZW50V2lkdGg7XG4gICAgICAgICAgdmFyIG1lbnVTdHlsZSA9IHRoaXMuX2dlbmVyYXRlTWVudVBhZ2VTdHlsZShtYXgpO1xuICAgICAgICAgIGFuaW1pdCh0aGlzLl9tZW51UGFnZVswXSkucXVldWUobWVudVN0eWxlKS5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICovXG4gICAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2JsYWNrTWFzaykge1xuICAgICAgICAgIHRoaXMuX2JsYWNrTWFzay5yZW1vdmUoKTtcbiAgICAgICAgICB0aGlzLl9ibGFja01hc2sgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbWFpblBhZ2UucmVtb3ZlQXR0cignc3R5bGUnKTtcbiAgICAgICAgdGhpcy5fbWVudVBhZ2UucmVtb3ZlQXR0cignc3R5bGUnKTtcblxuICAgICAgICB0aGlzLl9lbGVtZW50ID0gdGhpcy5fbWFpblBhZ2UgPSB0aGlzLl9tZW51UGFnZSA9IG51bGw7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGluc3RhbnRcbiAgICAgICAqL1xuICAgICAgb3Blbk1lbnU6IGZ1bmN0aW9uKGNhbGxiYWNrLCBpbnN0YW50KSB7XG4gICAgICAgIHZhciBkdXJhdGlvbiA9IGluc3RhbnQgPT09IHRydWUgPyAwLjAgOiB0aGlzLmR1cmF0aW9uO1xuICAgICAgICB2YXIgZGVsYXkgPSBpbnN0YW50ID09PSB0cnVlID8gMC4wIDogdGhpcy5kZWxheTtcblxuICAgICAgICB0aGlzLl9tZW51UGFnZS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgICAgICAgdGhpcy5fYmxhY2tNYXNrLmNzcygnZGlzcGxheScsICdibG9jaycpO1xuXG4gICAgICAgIHZhciBtYXggPSB0aGlzLl9tZW51UGFnZVswXS5jbGllbnRXaWR0aDtcbiAgICAgICAgdmFyIG1lbnVTdHlsZSA9IHRoaXMuX2dlbmVyYXRlTWVudVBhZ2VTdHlsZShtYXgpO1xuICAgICAgICB2YXIgbWFpblBhZ2VTdHlsZSA9IHRoaXMuX2dlbmVyYXRlTWFpblBhZ2VTdHlsZShtYXgpO1xuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICBhbmltaXQodGhpcy5fbWFpblBhZ2VbMF0pXG4gICAgICAgICAgICAud2FpdChkZWxheSlcbiAgICAgICAgICAgIC5xdWV1ZShtYWluUGFnZVN0eWxlLCB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbixcbiAgICAgICAgICAgICAgdGltaW5nOiB0aGlzLnRpbWluZ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5xdWV1ZShmdW5jdGlvbihkb25lKSB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAucGxheSgpO1xuXG4gICAgICAgICAgYW5pbWl0KHRoaXMuX21lbnVQYWdlWzBdKVxuICAgICAgICAgICAgLndhaXQoZGVsYXkpXG4gICAgICAgICAgICAucXVldWUobWVudVN0eWxlLCB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbixcbiAgICAgICAgICAgICAgdGltaW5nOiB0aGlzLnRpbWluZ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5wbGF5KCk7XG5cbiAgICAgICAgfS5iaW5kKHRoaXMpLCAxMDAwIC8gNjApO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAgICogQHBhcmFtIHtCb29sZWFufSBpbnN0YW50XG4gICAgICAgKi9cbiAgICAgIGNsb3NlTWVudTogZnVuY3Rpb24oY2FsbGJhY2ssIGluc3RhbnQpIHtcbiAgICAgICAgdmFyIGR1cmF0aW9uID0gaW5zdGFudCA9PT0gdHJ1ZSA/IDAuMCA6IHRoaXMuZHVyYXRpb247XG4gICAgICAgIHZhciBkZWxheSA9IGluc3RhbnQgPT09IHRydWUgPyAwLjAgOiB0aGlzLmRlbGF5O1xuXG4gICAgICAgIHRoaXMuX2JsYWNrTWFzay5jc3Moe2Rpc3BsYXk6ICdibG9jayd9KTtcblxuICAgICAgICB2YXIgbWVudVBhZ2VTdHlsZSA9IHRoaXMuX2dlbmVyYXRlTWVudVBhZ2VTdHlsZSgwKTtcbiAgICAgICAgdmFyIG1haW5QYWdlU3R5bGUgPSB0aGlzLl9nZW5lcmF0ZU1haW5QYWdlU3R5bGUoMCk7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgIGFuaW1pdCh0aGlzLl9tYWluUGFnZVswXSlcbiAgICAgICAgICAgIC53YWl0KGRlbGF5KVxuICAgICAgICAgICAgLnF1ZXVlKG1haW5QYWdlU3R5bGUsIHtcbiAgICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uLFxuICAgICAgICAgICAgICB0aW1pbmc6IHRoaXMudGltaW5nXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnF1ZXVlKGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgICAgICAgICAgdGhpcy5fbWVudVBhZ2UuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICAgICAgLnBsYXkoKTtcblxuICAgICAgICAgIGFuaW1pdCh0aGlzLl9tZW51UGFnZVswXSlcbiAgICAgICAgICAgIC53YWl0KGRlbGF5KVxuICAgICAgICAgICAgLnF1ZXVlKG1lbnVQYWdlU3R5bGUsIHtcbiAgICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uLFxuICAgICAgICAgICAgICB0aW1pbmc6IHRoaXMudGltaW5nXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnBsYXkoKTtcblxuICAgICAgICB9LmJpbmQodGhpcyksIDEwMDAgLyA2MCk7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5kaXN0YW5jZVxuICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMubWF4RGlzdGFuY2VcbiAgICAgICAqL1xuICAgICAgdHJhbnNsYXRlTWVudTogZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgICAgIHRoaXMuX21lbnVQYWdlLmNzcygnZGlzcGxheScsICdibG9jaycpO1xuICAgICAgICB0aGlzLl9ibGFja01hc2suY3NzKHtkaXNwbGF5OiAnYmxvY2snfSk7XG5cbiAgICAgICAgdmFyIG1lbnVQYWdlU3R5bGUgPSB0aGlzLl9nZW5lcmF0ZU1lbnVQYWdlU3R5bGUoTWF0aC5taW4ob3B0aW9ucy5tYXhEaXN0YW5jZSwgb3B0aW9ucy5kaXN0YW5jZSkpO1xuICAgICAgICB2YXIgbWFpblBhZ2VTdHlsZSA9IHRoaXMuX2dlbmVyYXRlTWFpblBhZ2VTdHlsZShNYXRoLm1pbihvcHRpb25zLm1heERpc3RhbmNlLCBvcHRpb25zLmRpc3RhbmNlKSk7XG4gICAgICAgIGRlbGV0ZSBtYWluUGFnZVN0eWxlLm9wYWNpdHk7XG5cbiAgICAgICAgYW5pbWl0KHRoaXMuX21lbnVQYWdlWzBdKVxuICAgICAgICAgIC5xdWV1ZShtZW51UGFnZVN0eWxlKVxuICAgICAgICAgIC5wbGF5KCk7XG5cbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKG1haW5QYWdlU3R5bGUpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBhbmltaXQodGhpcy5fbWFpblBhZ2VbMF0pXG4gICAgICAgICAgICAucXVldWUobWFpblBhZ2VTdHlsZSlcbiAgICAgICAgICAgIC5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIF9nZW5lcmF0ZU1lbnVQYWdlU3R5bGU6IGZ1bmN0aW9uKGRpc3RhbmNlKSB7XG4gICAgICAgIHZhciB4ID0gdGhpcy5faXNSaWdodCA/IC1kaXN0YW5jZSA6IGRpc3RhbmNlO1xuICAgICAgICB2YXIgdHJhbnNmb3JtID0gJ3RyYW5zbGF0ZTNkKCcgKyB4ICsgJ3B4LCAwLCAwKSc7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybSxcbiAgICAgICAgICAnYm94LXNoYWRvdyc6IGRpc3RhbmNlID09PSAwID8gJ25vbmUnIDogJzBweCAwIDEwcHggMHB4IHJnYmEoMCwgMCwgMCwgMC4yKSdcbiAgICAgICAgfTtcbiAgICAgIH0sXG5cbiAgICAgIF9nZW5lcmF0ZU1haW5QYWdlU3R5bGU6IGZ1bmN0aW9uKGRpc3RhbmNlKSB7XG4gICAgICAgIHZhciBtYXggPSB0aGlzLl9tZW51UGFnZVswXS5jbGllbnRXaWR0aDtcbiAgICAgICAgdmFyIG9wYWNpdHkgPSAxIC0gKDAuMSAqIGRpc3RhbmNlIC8gbWF4KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG9wYWNpdHk6IG9wYWNpdHlcbiAgICAgICAgfTtcbiAgICAgIH0sXG5cbiAgICAgIGNvcHk6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IE92ZXJsYXlTbGlkaW5nTWVudUFuaW1hdG9yKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gT3ZlcmxheVNsaWRpbmdNZW51QW5pbWF0b3I7XG4gIH0pO1xuXG59KSgpO1xuIiwiLyoqXG4gKiBAZWxlbWVudCBvbnMtcGFnZVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSB2YXJcbiAqIEBpbml0b25seVxuICogQHR5cGUge1N0cmluZ31cbiAqIEBkZXNjcmlwdGlvblxuICogICBbZW5dVmFyaWFibGUgbmFtZSB0byByZWZlciB0aGlzIHBhZ2UuWy9lbl1cbiAqICAgW2phXeOBk+OBruODmuODvOOCuOOCkuWPgueFp+OBmeOCi+OBn+OCgeOBruWQjeWJjeOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIG5nLWluZmluaXRlLXNjcm9sbFxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7U3RyaW5nfVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1QYXRoIG9mIHRoZSBmdW5jdGlvbiB0byBiZSBleGVjdXRlZCBvbiBpbmZpbml0ZSBzY3JvbGxpbmcuIFRoZSBwYXRoIGlzIHJlbGF0aXZlIHRvICRzY29wZS4gVGhlIGZ1bmN0aW9uIHJlY2VpdmVzIGEgZG9uZSBjYWxsYmFjayB0aGF0IG11c3QgYmUgY2FsbGVkIHdoZW4gaXQncyBmaW5pc2hlZC5bL2VuXVxuICogICBbamFdWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb24tZGV2aWNlLWJhY2stYnV0dG9uXG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIHRoZSBiYWNrIGJ1dHRvbiBpcyBwcmVzc2VkLlsvZW5dXG4gKiAgIFtqYV3jg4fjg5DjgqTjgrnjga7jg5Djg4Pjgq/jg5zjgr/jg7PjgYzmirzjgZXjgozjgZ/mmYLjga7mjJnli5XjgpLoqK3lrprjgafjgY3jgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBuZy1kZXZpY2UtYmFjay1idXR0b25cbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXUFsbG93cyB5b3UgdG8gc3BlY2lmeSBjdXN0b20gYmVoYXZpb3Igd2l0aCBhbiBBbmd1bGFySlMgZXhwcmVzc2lvbiB3aGVuIHRoZSBiYWNrIGJ1dHRvbiBpcyBwcmVzc2VkLlsvZW5dXG4gKiAgIFtqYV3jg4fjg5DjgqTjgrnjga7jg5Djg4Pjgq/jg5zjgr/jg7PjgYzmirzjgZXjgozjgZ/mmYLjga7mjJnli5XjgpLoqK3lrprjgafjgY3jgb7jgZnjgIJBbmd1bGFySlPjga5leHByZXNzaW9u44KS5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWluaXRcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIHRoZSBcImluaXRcIiBldmVudCBpcyBmaXJlZC5bL2VuXVxuICogIFtqYV1cImluaXRcIuOCpOODmeODs+ODiOOBjOeZuueBq+OBleOCjOOBn+aZguOBruaMmeWLleOCkueLrOiHquOBq+aMh+WumuOBp+OBjeOBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIG9ucy1zaG93XG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtFeHByZXNzaW9ufVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXUFsbG93cyB5b3UgdG8gc3BlY2lmeSBjdXN0b20gYmVoYXZpb3Igd2hlbiB0aGUgXCJzaG93XCIgZXZlbnQgaXMgZmlyZWQuWy9lbl1cbiAqICBbamFdXCJzaG93XCLjgqTjg5njg7Pjg4jjgYznmbrngavjgZXjgozjgZ/mmYLjga7mjJnli5XjgpLni6zoh6rjgavmjIflrprjgafjgY3jgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBvbnMtaGlkZVxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BbGxvd3MgeW91IHRvIHNwZWNpZnkgY3VzdG9tIGJlaGF2aW9yIHdoZW4gdGhlIFwiaGlkZVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXVwiaGlkZVwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWRlc3Ryb3lcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIHRoZSBcImRlc3Ryb3lcIiBldmVudCBpcyBmaXJlZC5bL2VuXVxuICogIFtqYV1cImRlc3Ryb3lcIuOCpOODmeODs+ODiOOBjOeZuueBq+OBleOCjOOBn+aZguOBruaMmeWLleOCkueLrOiHquOBq+aMh+WumuOBp+OBjeOBvuOBmeOAglsvamFdXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpO1xuXG4gIG1vZHVsZS5kaXJlY3RpdmUoJ29uc1BhZ2UnLCBmdW5jdGlvbigkb25zZW4sIFBhZ2VWaWV3KSB7XG5cbiAgICBmdW5jdGlvbiBmaXJlUGFnZUluaXRFdmVudChlbGVtZW50KSB7XG4gICAgICAvLyBUT0RPOiByZW1vdmUgZGlydHkgZml4XG4gICAgICB2YXIgaSA9IDAsIGYgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGkrKyA8IDE1KSAge1xuICAgICAgICAgIGlmIChpc0F0dGFjaGVkKGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAkb25zZW4uZmlyZUNvbXBvbmVudEV2ZW50KGVsZW1lbnQsICdpbml0Jyk7XG4gICAgICAgICAgICBmaXJlQWN0dWFsUGFnZUluaXRFdmVudChlbGVtZW50KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGkgPiAxMCkge1xuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGYsIDEwMDAgLyA2MCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUoZik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbCB0byBmaXJlIFwicGFnZWluaXRcIiBldmVudC4gQXR0YWNoIFwib25zLXBhZ2VcIiBlbGVtZW50IHRvIHRoZSBkb2N1bWVudCBhZnRlciBpbml0aWFsaXphdGlvbi4nKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgZigpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpcmVBY3R1YWxQYWdlSW5pdEV2ZW50KGVsZW1lbnQpIHtcbiAgICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdIVE1MRXZlbnRzJyk7XG4gICAgICBldmVudC5pbml0RXZlbnQoJ3BhZ2Vpbml0JywgdHJ1ZSwgdHJ1ZSk7XG4gICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzQXR0YWNoZWQoZWxlbWVudCkge1xuICAgICAgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA9PT0gZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlbGVtZW50LnBhcmVudE5vZGUgPyBpc0F0dGFjaGVkKGVsZW1lbnQucGFyZW50Tm9kZSkgOiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcblxuICAgICAgLy8gTk9URTogVGhpcyBlbGVtZW50IG11c3QgY29leGlzdHMgd2l0aCBuZy1jb250cm9sbGVyLlxuICAgICAgLy8gRG8gbm90IHVzZSBpc29sYXRlZCBzY29wZSBhbmQgdGVtcGxhdGUncyBuZy10cmFuc2NsdWRlLlxuICAgICAgdHJhbnNjbHVkZTogZmFsc2UsXG4gICAgICBzY29wZTogdHJ1ZSxcblxuICAgICAgY29tcGlsZTogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgQ3VzdG9tRWxlbWVudHMudXBncmFkZShlbGVtZW50WzBdKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBwcmU6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgQ3VzdG9tRWxlbWVudHMudXBncmFkZShlbGVtZW50WzBdKTtcbiAgICAgICAgICAgIHZhciBwYWdlID0gbmV3IFBhZ2VWaWV3KHNjb3BlLCBlbGVtZW50LCBhdHRycyk7XG5cbiAgICAgICAgICAgICRvbnNlbi5kZWNsYXJlVmFyQXR0cmlidXRlKGF0dHJzLCBwYWdlKTtcbiAgICAgICAgICAgICRvbnNlbi5yZWdpc3RlckV2ZW50SGFuZGxlcnMocGFnZSwgJ2luaXQgc2hvdyBoaWRlIGRlc3Ryb3knKTtcblxuICAgICAgICAgICAgZWxlbWVudC5kYXRhKCdvbnMtcGFnZScsIHBhZ2UpO1xuICAgICAgICAgICAgJG9uc2VuLmFkZE1vZGlmaWVyTWV0aG9kc0ZvckN1c3RvbUVsZW1lbnRzKHBhZ2UsIGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBlbGVtZW50LmRhdGEoJ19zY29wZScsIHNjb3BlKTtcblxuICAgICAgICAgICAgJG9uc2VuLmNsZWFuZXIub25EZXN0cm95KHNjb3BlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcGFnZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAkb25zZW4ucmVtb3ZlTW9kaWZpZXJNZXRob2RzKHBhZ2UpO1xuICAgICAgICAgICAgICBlbGVtZW50LmRhdGEoJ29ucy1wYWdlJywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgZWxlbWVudC5kYXRhKCdfc2NvcGUnLCB1bmRlZmluZWQpO1xuXG4gICAgICAgICAgICAgICRvbnNlbi5jbGVhckNvbXBvbmVudCh7XG4gICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICAgICBzY29wZTogc2NvcGUsXG4gICAgICAgICAgICAgICAgYXR0cnM6IGF0dHJzXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBzY29wZSA9IGVsZW1lbnQgPSBhdHRycyA9IG51bGw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgcG9zdDogZnVuY3Rpb24gcG9zdExpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICBmaXJlUGFnZUluaXRFdmVudChlbGVtZW50WzBdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59KSgpO1xuIiwiLyoqXG4gKiBAZWxlbWVudCBvbnMtcG9wb3ZlclxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSB2YXJcbiAqIEBpbml0b25seVxuICogQHR5cGUge1N0cmluZ31cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1WYXJpYWJsZSBuYW1lIHRvIHJlZmVyIHRoaXMgcG9wb3Zlci5bL2VuXVxuICogIFtqYV3jgZPjga7jg53jg4Pjg5fjgqrjg7zjg5Djg7zjgpLlj4LnhafjgZnjgovjgZ/jgoHjga7lkI3liY3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBvbnMtcHJlc2hvd1xuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BbGxvd3MgeW91IHRvIHNwZWNpZnkgY3VzdG9tIGJlaGF2aW9yIHdoZW4gdGhlIFwicHJlc2hvd1wiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXVwicHJlc2hvd1wi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLXByZWhpZGVcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIHRoZSBcInByZWhpZGVcIiBldmVudCBpcyBmaXJlZC5bL2VuXVxuICogIFtqYV1cInByZWhpZGVcIuOCpOODmeODs+ODiOOBjOeZuueBq+OBleOCjOOBn+aZguOBruaMmeWLleOCkueLrOiHquOBq+aMh+WumuOBp+OBjeOBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIG9ucy1wb3N0c2hvd1xuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BbGxvd3MgeW91IHRvIHNwZWNpZnkgY3VzdG9tIGJlaGF2aW9yIHdoZW4gdGhlIFwicG9zdHNob3dcIiBldmVudCBpcyBmaXJlZC5bL2VuXVxuICogIFtqYV1cInBvc3RzaG93XCLjgqTjg5njg7Pjg4jjgYznmbrngavjgZXjgozjgZ/mmYLjga7mjJnli5XjgpLni6zoh6rjgavmjIflrprjgafjgY3jgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBvbnMtcG9zdGhpZGVcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIHRoZSBcInBvc3RoaWRlXCIgZXZlbnQgaXMgZmlyZWQuWy9lbl1cbiAqICBbamFdXCJwb3N0aGlkZVwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWRlc3Ryb3lcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIHRoZSBcImRlc3Ryb3lcIiBldmVudCBpcyBmaXJlZC5bL2VuXVxuICogIFtqYV1cImRlc3Ryb3lcIuOCpOODmeODs+ODiOOBjOeZuueBq+OBleOCjOOBn+aZguOBruaMmeWLleOCkueLrOiHquOBq+aMh+WumuOBp+OBjeOBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAbWV0aG9kIG9uXG4gKiBAc2lnbmF0dXJlIG9uKGV2ZW50TmFtZSwgbGlzdGVuZXIpXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXUFkZCBhbiBldmVudCBsaXN0ZW5lci5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI44Oq44K544OK44O844KS6L+95Yqg44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAqICAgW2VuXU5hbWUgb2YgdGhlIGV2ZW50LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jlkI3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAqICAgW2VuXUZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlsvZW5dXG4gKiAgIFtqYV3jgZPjga7jgqTjg5njg7Pjg4jjgYznmbrngavjgZXjgozjgZ/pmpvjgavlkbzjgbPlh7rjgZXjgozjgovplqLmlbDjgqrjg5bjgrjjgqfjgq/jg4jjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQG1ldGhvZCBvbmNlXG4gKiBAc2lnbmF0dXJlIG9uY2UoZXZlbnROYW1lLCBsaXN0ZW5lcilcbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BZGQgYW4gZXZlbnQgbGlzdGVuZXIgdGhhdCdzIG9ubHkgdHJpZ2dlcmVkIG9uY2UuWy9lbl1cbiAqICBbamFd5LiA5bqm44Gg44GR5ZG844Gz5Ye644GV44KM44KL44Kk44OZ44Oz44OI44Oq44K544OK44O844KS6L+95Yqg44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAqICAgW2VuXU5hbWUgb2YgdGhlIGV2ZW50LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jlkI3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAqICAgW2VuXUZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jjgYznmbrngavjgZfjgZ/pmpvjgavlkbzjgbPlh7rjgZXjgozjgovplqLmlbDjgqrjg5bjgrjjgqfjgq/jg4jjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQG1ldGhvZCBvZmZcbiAqIEBzaWduYXR1cmUgb2ZmKGV2ZW50TmFtZSwgW2xpc3RlbmVyXSlcbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1SZW1vdmUgYW4gZXZlbnQgbGlzdGVuZXIuIElmIHRoZSBsaXN0ZW5lciBpcyBub3Qgc3BlY2lmaWVkIGFsbCBsaXN0ZW5lcnMgZm9yIHRoZSBldmVudCB0eXBlIHdpbGwgYmUgcmVtb3ZlZC5bL2VuXVxuICogIFtqYV3jgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgpLliYrpmaTjgZfjgb7jgZnjgILjgoLjgZfjgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgpLmjIflrprjgZfjgarjgYvjgaPjgZ/loLTlkIjjgavjga/jgIHjgZ3jga7jgqTjg5njg7Pjg4jjgavntJDjgaXjgY/lhajjgabjga7jgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgYzliYrpmaTjgZXjgozjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZVxuICogICBbZW5dTmFtZSBvZiB0aGUgZXZlbnQuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOWQjeOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICogICBbZW5dRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuWy9lbl1cbiAqICAgW2phXeWJiumZpOOBmeOCi+OCpOODmeODs+ODiOODquOCueODiuODvOOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKi9cblxuKGZ1bmN0aW9uKCl7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ29uc2VuJyk7XG5cbiAgbW9kdWxlLmRpcmVjdGl2ZSgnb25zUG9wb3ZlcicsIGZ1bmN0aW9uKCRvbnNlbiwgUG9wb3ZlclZpZXcpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIHJlcGxhY2U6IGZhbHNlLFxuICAgICAgc2NvcGU6IHRydWUsXG4gICAgICBjb21waWxlOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xuICAgICAgICBDdXN0b21FbGVtZW50cy51cGdyYWRlKGVsZW1lbnRbMF0pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHByZTogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICBDdXN0b21FbGVtZW50cy51cGdyYWRlKGVsZW1lbnRbMF0pO1xuXG4gICAgICAgICAgICB2YXIgcG9wb3ZlciA9IG5ldyBQb3BvdmVyVmlldyhzY29wZSwgZWxlbWVudCwgYXR0cnMpO1xuXG4gICAgICAgICAgICAkb25zZW4uZGVjbGFyZVZhckF0dHJpYnV0ZShhdHRycywgcG9wb3Zlcik7XG4gICAgICAgICAgICAkb25zZW4ucmVnaXN0ZXJFdmVudEhhbmRsZXJzKHBvcG92ZXIsICdwcmVzaG93IHByZWhpZGUgcG9zdHNob3cgcG9zdGhpZGUgZGVzdHJveScpO1xuICAgICAgICAgICAgJG9uc2VuLmFkZE1vZGlmaWVyTWV0aG9kc0ZvckN1c3RvbUVsZW1lbnRzKHBvcG92ZXIsIGVsZW1lbnQpO1xuXG4gICAgICAgICAgICBlbGVtZW50LmRhdGEoJ29ucy1wb3BvdmVyJywgcG9wb3Zlcik7XG5cbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcG9wb3Zlci5fZXZlbnRzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAkb25zZW4ucmVtb3ZlTW9kaWZpZXJNZXRob2RzKHBvcG92ZXIpO1xuICAgICAgICAgICAgICBlbGVtZW50LmRhdGEoJ29ucy1wb3BvdmVyJywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgZWxlbWVudCA9IG51bGw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgcG9zdDogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICRvbnNlbi5maXJlQ29tcG9uZW50RXZlbnQoZWxlbWVudFswXSwgJ2luaXQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59KSgpO1xuXG4iLCIvKlxuQ29weXJpZ2h0IDIwMTMtMjAxNSBBU0lBTCBDT1JQT1JBVElPTlxuXG4gICBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbmh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4qL1xuXG5hbmd1bGFyLm1vZHVsZSgnb25zZW4nKVxuICAudmFsdWUoJ1BvcG92ZXJBbmltYXRvcicsIG9ucy5faW50ZXJuYWwuUG9wb3ZlckFuaW1hdG9yKVxuICAudmFsdWUoJ0ZhZGVQb3BvdmVyQW5pbWF0b3InLCBvbnMuX2ludGVybmFsLkZhZGVQb3BvdmVyQW5pbWF0b3IpO1xuIiwiLyoqXG4gKiBAZWxlbWVudCBvbnMtcHVsbC1ob29rXG4gKiBAZXhhbXBsZVxuICogPHNjcmlwdD5cbiAqICAgb25zLmJvb3RzdHJhcCgpXG4gKlxuICogICAuY29udHJvbGxlcignTXlDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCkge1xuICogICAgICRzY29wZS5pdGVtcyA9IFszLCAyICwxXTtcbiAqXG4gKiAgICAgJHNjb3BlLmxvYWQgPSBmdW5jdGlvbigkZG9uZSkge1xuICogICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gKiAgICAgICAgICRzY29wZS5pdGVtcy51bnNoaWZ0KCRzY29wZS5pdGVtcy5sZW5ndGggKyAxKTtcbiAqICAgICAgICAgJGRvbmUoKTtcbiAqICAgICAgIH0sIDEwMDApO1xuICogICAgIH07XG4gKiAgIH0pO1xuICogPC9zY3JpcHQ+XG4gKlxuICogPG9ucy1wYWdlIG5nLWNvbnRyb2xsZXI9XCJNeUNvbnRyb2xsZXJcIj5cbiAqICAgPG9ucy1wdWxsLWhvb2sgdmFyPVwibG9hZGVyXCIgbmctYWN0aW9uPVwibG9hZCgkZG9uZSlcIj5cbiAqICAgICA8c3BhbiBuZy1zd2l0Y2g9XCJsb2FkZXIuc3RhdGVcIj5cbiAqICAgICAgIDxzcGFuIG5nLXN3aXRjaC13aGVuPVwiaW5pdGlhbFwiPlB1bGwgZG93biB0byByZWZyZXNoPC9zcGFuPlxuICogICAgICAgPHNwYW4gbmctc3dpdGNoLXdoZW49XCJwcmVhY3Rpb25cIj5SZWxlYXNlIHRvIHJlZnJlc2g8L3NwYW4+XG4gKiAgICAgICA8c3BhbiBuZy1zd2l0Y2gtd2hlbj1cImFjdGlvblwiPkxvYWRpbmcgZGF0YS4gUGxlYXNlIHdhaXQuLi48L3NwYW4+XG4gKiAgICAgPC9zcGFuPlxuICogICA8L29ucy1wdWxsLWhvb2s+XG4gKiAgIDxvbnMtbGlzdD5cbiAqICAgICA8b25zLWxpc3QtaXRlbSBuZy1yZXBlYXQ9XCJpdGVtIGluIGl0ZW1zXCI+XG4gKiAgICAgICBJdGVtICN7eyBpdGVtIH19XG4gKiAgICAgPC9vbnMtbGlzdC1pdGVtPlxuICogICA8L29ucy1saXN0PlxuICogPC9vbnMtcGFnZT5cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgdmFyXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXVZhcmlhYmxlIG5hbWUgdG8gcmVmZXIgdGhpcyBjb21wb25lbnQuWy9lbl1cbiAqICAgW2phXeOBk+OBruOCs+ODs+ODneODvOODjeODs+ODiOOCkuWPgueFp+OBmeOCi+OBn+OCgeOBruWQjeWJjeOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIG5nLWFjdGlvblxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogICBbZW5dVXNlIHRvIHNwZWNpZnkgY3VzdG9tIGJlaGF2aW9yIHdoZW4gdGhlIHBhZ2UgaXMgcHVsbGVkIGRvd24uIEEgPGNvZGU+JGRvbmU8L2NvZGU+IGZ1bmN0aW9uIGlzIGF2YWlsYWJsZSB0byB0ZWxsIHRoZSBjb21wb25lbnQgdGhhdCB0aGUgYWN0aW9uIGlzIGNvbXBsZXRlZC5bL2VuXVxuICogICBbamFdcHVsbCBkb3du44GX44Gf44Go44GN44Gu5oyv44KL6Iie44GE44KS5oyH5a6a44GX44G+44GZ44CC44Ki44Kv44K344On44Oz44GM5a6M5LqG44GX44Gf5pmC44Gr44GvPGNvZGU+JGRvbmU8L2NvZGU+6Zai5pWw44KS5ZG844Gz5Ye644GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWNoYW5nZXN0YXRlXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtFeHByZXNzaW9ufVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXUFsbG93cyB5b3UgdG8gc3BlY2lmeSBjdXN0b20gYmVoYXZpb3Igd2hlbiB0aGUgXCJjaGFuZ2VzdGF0ZVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXVwiY2hhbmdlc3RhdGVcIuOCpOODmeODs+ODiOOBjOeZuueBq+OBleOCjOOBn+aZguOBruaMmeWLleOCkueLrOiHquOBq+aMh+WumuOBp+OBjeOBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAbWV0aG9kIG9uXG4gKiBAc2lnbmF0dXJlIG9uKGV2ZW50TmFtZSwgbGlzdGVuZXIpXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXUFkZCBhbiBldmVudCBsaXN0ZW5lci5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI44Oq44K544OK44O844KS6L+95Yqg44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAqICAgW2VuXU5hbWUgb2YgdGhlIGV2ZW50LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jlkI3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAqICAgW2VuXUZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlsvZW5dXG4gKiAgIFtqYV3jgZPjga7jgqTjg5njg7Pjg4jjgYznmbrngavjgZXjgozjgZ/pmpvjgavlkbzjgbPlh7rjgZXjgozjgovplqLmlbDjgqrjg5bjgrjjgqfjgq/jg4jjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQG1ldGhvZCBvbmNlXG4gKiBAc2lnbmF0dXJlIG9uY2UoZXZlbnROYW1lLCBsaXN0ZW5lcilcbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BZGQgYW4gZXZlbnQgbGlzdGVuZXIgdGhhdCdzIG9ubHkgdHJpZ2dlcmVkIG9uY2UuWy9lbl1cbiAqICBbamFd5LiA5bqm44Gg44GR5ZG844Gz5Ye644GV44KM44KL44Kk44OZ44Oz44OI44Oq44K544OK44O844KS6L+95Yqg44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAqICAgW2VuXU5hbWUgb2YgdGhlIGV2ZW50LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jlkI3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAqICAgW2VuXUZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jjgYznmbrngavjgZfjgZ/pmpvjgavlkbzjgbPlh7rjgZXjgozjgovplqLmlbDjgqrjg5bjgrjjgqfjgq/jg4jjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQG1ldGhvZCBvZmZcbiAqIEBzaWduYXR1cmUgb2ZmKGV2ZW50TmFtZSwgW2xpc3RlbmVyXSlcbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1SZW1vdmUgYW4gZXZlbnQgbGlzdGVuZXIuIElmIHRoZSBsaXN0ZW5lciBpcyBub3Qgc3BlY2lmaWVkIGFsbCBsaXN0ZW5lcnMgZm9yIHRoZSBldmVudCB0eXBlIHdpbGwgYmUgcmVtb3ZlZC5bL2VuXVxuICogIFtqYV3jgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgpLliYrpmaTjgZfjgb7jgZnjgILjgoLjgZfjgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgpLmjIflrprjgZfjgarjgYvjgaPjgZ/loLTlkIjjgavjga/jgIHjgZ3jga7jgqTjg5njg7Pjg4jjgavntJDjgaXjgY/lhajjgabjga7jgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgYzliYrpmaTjgZXjgozjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZVxuICogICBbZW5dTmFtZSBvZiB0aGUgZXZlbnQuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOWQjeOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICogICBbZW5dRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuWy9lbl1cbiAqICAgW2phXeWJiumZpOOBmeOCi+OCpOODmeODs+ODiOODquOCueODiuODvOOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLyoqXG4gICAqIFB1bGwgaG9vayBkaXJlY3RpdmUuXG4gICAqL1xuICBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKS5kaXJlY3RpdmUoJ29uc1B1bGxIb29rJywgZnVuY3Rpb24oJG9uc2VuLCBQdWxsSG9va1ZpZXcpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIHJlcGxhY2U6IGZhbHNlLFxuICAgICAgc2NvcGU6IHRydWUsXG5cbiAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgIEN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoZWxlbWVudFswXSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcHJlOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIEN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoZWxlbWVudFswXSk7XG4gICAgICAgICAgICB2YXIgcHVsbEhvb2sgPSBuZXcgUHVsbEhvb2tWaWV3KHNjb3BlLCBlbGVtZW50LCBhdHRycyk7XG5cbiAgICAgICAgICAgICRvbnNlbi5kZWNsYXJlVmFyQXR0cmlidXRlKGF0dHJzLCBwdWxsSG9vayk7XG4gICAgICAgICAgICAkb25zZW4ucmVnaXN0ZXJFdmVudEhhbmRsZXJzKHB1bGxIb29rLCAnY2hhbmdlc3RhdGUgZGVzdHJveScpO1xuICAgICAgICAgICAgZWxlbWVudC5kYXRhKCdvbnMtcHVsbC1ob29rJywgcHVsbEhvb2spO1xuXG4gICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHB1bGxIb29rLl9ldmVudHMgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgIGVsZW1lbnQuZGF0YSgnb25zLXB1bGwtaG9vaycsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgIHNjb3BlID0gZWxlbWVudCA9IGF0dHJzID0gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgcG9zdDogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICRvbnNlbi5maXJlQ29tcG9uZW50RXZlbnQoZWxlbWVudFswXSwgJ2luaXQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG5cbn0pKCk7XG4iLCIvKlxuQ29weXJpZ2h0IDIwMTMtMjAxNSBBU0lBTCBDT1JQT1JBVElPTlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4qL1xuXG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpO1xuXG4gIG1vZHVsZS5mYWN0b3J5KCdQdXNoU2xpZGluZ01lbnVBbmltYXRvcicsIGZ1bmN0aW9uKFNsaWRpbmdNZW51QW5pbWF0b3IpIHtcblxuICAgIHZhciBQdXNoU2xpZGluZ01lbnVBbmltYXRvciA9IFNsaWRpbmdNZW51QW5pbWF0b3IuZXh0ZW5kKHtcblxuICAgICAgX2lzUmlnaHQ6IGZhbHNlLFxuICAgICAgX2VsZW1lbnQ6IHVuZGVmaW5lZCxcbiAgICAgIF9tZW51UGFnZTogdW5kZWZpbmVkLFxuICAgICAgX21haW5QYWdlOiB1bmRlZmluZWQsXG4gICAgICBfd2lkdGg6IHVuZGVmaW5lZCxcblxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge2pxTGl0ZX0gZWxlbWVudCBcIm9ucy1zbGlkaW5nLW1lbnVcIiBvciBcIm9ucy1zcGxpdC12aWV3XCIgZWxlbWVudFxuICAgICAgICogQHBhcmFtIHtqcUxpdGV9IG1haW5QYWdlXG4gICAgICAgKiBAcGFyYW0ge2pxTGl0ZX0gbWVudVBhZ2VcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy53aWR0aCBcIndpZHRoXCIgc3R5bGUgdmFsdWVcbiAgICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5pc1JpZ2h0XG4gICAgICAgKi9cbiAgICAgIHNldHVwOiBmdW5jdGlvbihlbGVtZW50LCBtYWluUGFnZSwgbWVudVBhZ2UsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuX21haW5QYWdlID0gbWFpblBhZ2U7XG4gICAgICAgIHRoaXMuX21lbnVQYWdlID0gbWVudVBhZ2U7XG5cbiAgICAgICAgdGhpcy5faXNSaWdodCA9ICEhb3B0aW9ucy5pc1JpZ2h0O1xuICAgICAgICB0aGlzLl93aWR0aCA9IG9wdGlvbnMud2lkdGggfHwgJzkwJSc7XG5cbiAgICAgICAgbWVudVBhZ2UuY3NzKHtcbiAgICAgICAgICB3aWR0aDogb3B0aW9ucy53aWR0aCxcbiAgICAgICAgICBkaXNwbGF5OiAnbm9uZSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzUmlnaHQpIHtcbiAgICAgICAgICBtZW51UGFnZS5jc3Moe1xuICAgICAgICAgICAgcmlnaHQ6ICctJyArIG9wdGlvbnMud2lkdGgsXG4gICAgICAgICAgICBsZWZ0OiAnYXV0bydcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtZW51UGFnZS5jc3Moe1xuICAgICAgICAgICAgcmlnaHQ6ICdhdXRvJyxcbiAgICAgICAgICAgIGxlZnQ6ICctJyArIG9wdGlvbnMud2lkdGhcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMud2lkdGhcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zLmlzUmlnaHRcbiAgICAgICAqL1xuICAgICAgb25SZXNpemVkOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuX21lbnVQYWdlLmNzcygnd2lkdGgnLCBvcHRpb25zLndpZHRoKTtcblxuICAgICAgICBpZiAodGhpcy5faXNSaWdodCkge1xuICAgICAgICAgIHRoaXMuX21lbnVQYWdlLmNzcyh7XG4gICAgICAgICAgICByaWdodDogJy0nICsgb3B0aW9ucy53aWR0aCxcbiAgICAgICAgICAgIGxlZnQ6ICdhdXRvJ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX21lbnVQYWdlLmNzcyh7XG4gICAgICAgICAgICByaWdodDogJ2F1dG8nLFxuICAgICAgICAgICAgbGVmdDogJy0nICsgb3B0aW9ucy53aWR0aFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuaXNPcGVuZWQpIHtcbiAgICAgICAgICB2YXIgbWF4ID0gdGhpcy5fbWVudVBhZ2VbMF0uY2xpZW50V2lkdGg7XG4gICAgICAgICAgdmFyIG1haW5QYWdlVHJhbnNmb3JtID0gdGhpcy5fZ2VuZXJhdGVBYm92ZVBhZ2VUcmFuc2Zvcm0obWF4KTtcbiAgICAgICAgICB2YXIgbWVudVBhZ2VTdHlsZSA9IHRoaXMuX2dlbmVyYXRlQmVoaW5kUGFnZVN0eWxlKG1heCk7XG5cbiAgICAgICAgICBhbmltaXQodGhpcy5fbWFpblBhZ2VbMF0pLnF1ZXVlKHt0cmFuc2Zvcm06IG1haW5QYWdlVHJhbnNmb3JtfSkucGxheSgpO1xuICAgICAgICAgIGFuaW1pdCh0aGlzLl9tZW51UGFnZVswXSkucXVldWUobWVudVBhZ2VTdHlsZSkucGxheSgpO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqL1xuICAgICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX21haW5QYWdlLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG4gICAgICAgIHRoaXMuX21lbnVQYWdlLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IHRoaXMuX21haW5QYWdlID0gdGhpcy5fbWVudVBhZ2UgPSBudWxsO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAgICogQHBhcmFtIHtCb29sZWFufSBpbnN0YW50XG4gICAgICAgKi9cbiAgICAgIG9wZW5NZW51OiBmdW5jdGlvbihjYWxsYmFjaywgaW5zdGFudCkge1xuICAgICAgICB2YXIgZHVyYXRpb24gPSBpbnN0YW50ID09PSB0cnVlID8gMC4wIDogdGhpcy5kdXJhdGlvbjtcbiAgICAgICAgdmFyIGRlbGF5ID0gaW5zdGFudCA9PT0gdHJ1ZSA/IDAuMCA6IHRoaXMuZGVsYXk7XG5cbiAgICAgICAgdGhpcy5fbWVudVBhZ2UuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG5cbiAgICAgICAgdmFyIG1heCA9IHRoaXMuX21lbnVQYWdlWzBdLmNsaWVudFdpZHRoO1xuXG4gICAgICAgIHZhciBhYm92ZVRyYW5zZm9ybSA9IHRoaXMuX2dlbmVyYXRlQWJvdmVQYWdlVHJhbnNmb3JtKG1heCk7XG4gICAgICAgIHZhciBiZWhpbmRTdHlsZSA9IHRoaXMuX2dlbmVyYXRlQmVoaW5kUGFnZVN0eWxlKG1heCk7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgIGFuaW1pdCh0aGlzLl9tYWluUGFnZVswXSlcbiAgICAgICAgICAgIC53YWl0KGRlbGF5KVxuICAgICAgICAgICAgLnF1ZXVlKHtcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiBhYm92ZVRyYW5zZm9ybVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICAgICAgICAgIHRpbWluZzogdGhpcy50aW1pbmdcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAucXVldWUoZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnBsYXkoKTtcblxuICAgICAgICAgIGFuaW1pdCh0aGlzLl9tZW51UGFnZVswXSlcbiAgICAgICAgICAgIC53YWl0KGRlbGF5KVxuICAgICAgICAgICAgLnF1ZXVlKGJlaGluZFN0eWxlLCB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbixcbiAgICAgICAgICAgICAgdGltaW5nOiB0aGlzLnRpbWluZ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5wbGF5KCk7XG5cbiAgICAgICAgfS5iaW5kKHRoaXMpLCAxMDAwIC8gNjApO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAgICogQHBhcmFtIHtCb29sZWFufSBpbnN0YW50XG4gICAgICAgKi9cbiAgICAgIGNsb3NlTWVudTogZnVuY3Rpb24oY2FsbGJhY2ssIGluc3RhbnQpIHtcbiAgICAgICAgdmFyIGR1cmF0aW9uID0gaW5zdGFudCA9PT0gdHJ1ZSA/IDAuMCA6IHRoaXMuZHVyYXRpb247XG4gICAgICAgIHZhciBkZWxheSA9IGluc3RhbnQgPT09IHRydWUgPyAwLjAgOiB0aGlzLmRlbGF5O1xuXG4gICAgICAgIHZhciBhYm92ZVRyYW5zZm9ybSA9IHRoaXMuX2dlbmVyYXRlQWJvdmVQYWdlVHJhbnNmb3JtKDApO1xuICAgICAgICB2YXIgYmVoaW5kU3R5bGUgPSB0aGlzLl9nZW5lcmF0ZUJlaGluZFBhZ2VTdHlsZSgwKTtcblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgYW5pbWl0KHRoaXMuX21haW5QYWdlWzBdKVxuICAgICAgICAgICAgLndhaXQoZGVsYXkpXG4gICAgICAgICAgICAucXVldWUoe1xuICAgICAgICAgICAgICB0cmFuc2Zvcm06IGFib3ZlVHJhbnNmb3JtXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbixcbiAgICAgICAgICAgICAgdGltaW5nOiB0aGlzLnRpbWluZ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5xdWV1ZSh7XG4gICAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKDAsIDAsIDApJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5xdWV1ZShmdW5jdGlvbihkb25lKSB7XG4gICAgICAgICAgICAgIHRoaXMuX21lbnVQYWdlLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgICAgIC5wbGF5KCk7XG5cbiAgICAgICAgICBhbmltaXQodGhpcy5fbWVudVBhZ2VbMF0pXG4gICAgICAgICAgICAud2FpdChkZWxheSlcbiAgICAgICAgICAgIC5xdWV1ZShiZWhpbmRTdHlsZSwge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICAgICAgICAgIHRpbWluZzogdGhpcy50aW1pbmdcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAucXVldWUoZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnBsYXkoKTtcblxuICAgICAgICB9LmJpbmQodGhpcyksIDEwMDAgLyA2MCk7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5kaXN0YW5jZVxuICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMubWF4RGlzdGFuY2VcbiAgICAgICAqL1xuICAgICAgdHJhbnNsYXRlTWVudTogZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgICAgIHRoaXMuX21lbnVQYWdlLmNzcygnZGlzcGxheScsICdibG9jaycpO1xuXG4gICAgICAgIHZhciBhYm92ZVRyYW5zZm9ybSA9IHRoaXMuX2dlbmVyYXRlQWJvdmVQYWdlVHJhbnNmb3JtKE1hdGgubWluKG9wdGlvbnMubWF4RGlzdGFuY2UsIG9wdGlvbnMuZGlzdGFuY2UpKTtcbiAgICAgICAgdmFyIGJlaGluZFN0eWxlID0gdGhpcy5fZ2VuZXJhdGVCZWhpbmRQYWdlU3R5bGUoTWF0aC5taW4ob3B0aW9ucy5tYXhEaXN0YW5jZSwgb3B0aW9ucy5kaXN0YW5jZSkpO1xuXG4gICAgICAgIGFuaW1pdCh0aGlzLl9tYWluUGFnZVswXSlcbiAgICAgICAgICAucXVldWUoe3RyYW5zZm9ybTogYWJvdmVUcmFuc2Zvcm19KVxuICAgICAgICAgIC5wbGF5KCk7XG5cbiAgICAgICAgYW5pbWl0KHRoaXMuX21lbnVQYWdlWzBdKVxuICAgICAgICAgIC5xdWV1ZShiZWhpbmRTdHlsZSlcbiAgICAgICAgICAucGxheSgpO1xuICAgICAgfSxcblxuICAgICAgX2dlbmVyYXRlQWJvdmVQYWdlVHJhbnNmb3JtOiBmdW5jdGlvbihkaXN0YW5jZSkge1xuICAgICAgICB2YXIgeCA9IHRoaXMuX2lzUmlnaHQgPyAtZGlzdGFuY2UgOiBkaXN0YW5jZTtcbiAgICAgICAgdmFyIGFib3ZlVHJhbnNmb3JtID0gJ3RyYW5zbGF0ZTNkKCcgKyB4ICsgJ3B4LCAwLCAwKSc7XG5cbiAgICAgICAgcmV0dXJuIGFib3ZlVHJhbnNmb3JtO1xuICAgICAgfSxcblxuICAgICAgX2dlbmVyYXRlQmVoaW5kUGFnZVN0eWxlOiBmdW5jdGlvbihkaXN0YW5jZSkge1xuICAgICAgICB2YXIgYmVoaW5kWCA9IHRoaXMuX2lzUmlnaHQgPyAtZGlzdGFuY2UgOiBkaXN0YW5jZTtcbiAgICAgICAgdmFyIGJlaGluZFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgnICsgYmVoaW5kWCArICdweCwgMCwgMCknO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdHJhbnNmb3JtOiBiZWhpbmRUcmFuc2Zvcm1cbiAgICAgICAgfTtcbiAgICAgIH0sXG5cbiAgICAgIGNvcHk6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbmV3IFB1c2hTbGlkaW5nTWVudUFuaW1hdG9yKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gUHVzaFNsaWRpbmdNZW51QW5pbWF0b3I7XG4gIH0pO1xuXG59KSgpO1xuIiwiLypcbkNvcHlyaWdodCAyMDEzLTIwMTUgQVNJQUwgQ09SUE9SQVRJT05cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuKi9cblxuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKTtcblxuICBtb2R1bGUuZmFjdG9yeSgnUmV2ZWFsU2xpZGluZ01lbnVBbmltYXRvcicsIGZ1bmN0aW9uKFNsaWRpbmdNZW51QW5pbWF0b3IpIHtcblxuICAgIHZhciBSZXZlYWxTbGlkaW5nTWVudUFuaW1hdG9yID0gU2xpZGluZ01lbnVBbmltYXRvci5leHRlbmQoe1xuXG4gICAgICBfYmxhY2tNYXNrOiB1bmRlZmluZWQsXG5cbiAgICAgIF9pc1JpZ2h0OiBmYWxzZSxcblxuICAgICAgX21lbnVQYWdlOiB1bmRlZmluZWQsXG4gICAgICBfZWxlbWVudDogdW5kZWZpbmVkLFxuICAgICAgX21haW5QYWdlOiB1bmRlZmluZWQsXG5cbiAgICAgIC8qKlxuICAgICAgICogQHBhcmFtIHtqcUxpdGV9IGVsZW1lbnQgXCJvbnMtc2xpZGluZy1tZW51XCIgb3IgXCJvbnMtc3BsaXQtdmlld1wiIGVsZW1lbnRcbiAgICAgICAqIEBwYXJhbSB7anFMaXRlfSBtYWluUGFnZVxuICAgICAgICogQHBhcmFtIHtqcUxpdGV9IG1lbnVQYWdlXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMud2lkdGggXCJ3aWR0aFwiIHN0eWxlIHZhbHVlXG4gICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMuaXNSaWdodFxuICAgICAgICovXG4gICAgICBzZXR1cDogZnVuY3Rpb24oZWxlbWVudCwgbWFpblBhZ2UsIG1lbnVQYWdlLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLl9tZW51UGFnZSA9IG1lbnVQYWdlO1xuICAgICAgICB0aGlzLl9tYWluUGFnZSA9IG1haW5QYWdlO1xuICAgICAgICB0aGlzLl9pc1JpZ2h0ID0gISFvcHRpb25zLmlzUmlnaHQ7XG4gICAgICAgIHRoaXMuX3dpZHRoID0gb3B0aW9ucy53aWR0aCB8fCAnOTAlJztcblxuICAgICAgICBtYWluUGFnZS5jc3Moe1xuICAgICAgICAgIGJveFNoYWRvdzogJzBweCAwIDEwcHggMHB4IHJnYmEoMCwgMCwgMCwgMC4yKSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbWVudVBhZ2UuY3NzKHtcbiAgICAgICAgICB3aWR0aDogb3B0aW9ucy53aWR0aCxcbiAgICAgICAgICBvcGFjaXR5OiAwLjksXG4gICAgICAgICAgZGlzcGxheTogJ25vbmUnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLl9pc1JpZ2h0KSB7XG4gICAgICAgICAgbWVudVBhZ2UuY3NzKHtcbiAgICAgICAgICAgIHJpZ2h0OiAnMHB4JyxcbiAgICAgICAgICAgIGxlZnQ6ICdhdXRvJ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1lbnVQYWdlLmNzcyh7XG4gICAgICAgICAgICByaWdodDogJ2F1dG8nLFxuICAgICAgICAgICAgbGVmdDogJzBweCdcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2JsYWNrTWFzayA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdj48L2Rpdj4nKS5jc3Moe1xuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ2JsYWNrJyxcbiAgICAgICAgICB0b3A6ICcwcHgnLFxuICAgICAgICAgIGxlZnQ6ICcwcHgnLFxuICAgICAgICAgIHJpZ2h0OiAnMHB4JyxcbiAgICAgICAgICBib3R0b206ICcwcHgnLFxuICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgIGRpc3BsYXk6ICdub25lJ1xuICAgICAgICB9KTtcblxuICAgICAgICBlbGVtZW50LnByZXBlbmQodGhpcy5fYmxhY2tNYXNrKTtcblxuICAgICAgICAvLyBEaXJ0eSBmaXggZm9yIGJyb2tlbiByZW5kZXJpbmcgYnVnIG9uIGFuZHJvaWQgNC54LlxuICAgICAgICBhbmltaXQobWFpblBhZ2VbMF0pLnF1ZXVlKHt0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCAwLCAwKSd9KS5wbGF5KCk7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMuaXNPcGVuZWRcbiAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLndpZHRoXG4gICAgICAgKi9cbiAgICAgIG9uUmVzaXplZDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB0aGlzLl93aWR0aCA9IG9wdGlvbnMud2lkdGg7XG4gICAgICAgIHRoaXMuX21lbnVQYWdlLmNzcygnd2lkdGgnLCB0aGlzLl93aWR0aCk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuaXNPcGVuZWQpIHtcbiAgICAgICAgICB2YXIgbWF4ID0gdGhpcy5fbWVudVBhZ2VbMF0uY2xpZW50V2lkdGg7XG5cbiAgICAgICAgICB2YXIgYWJvdmVUcmFuc2Zvcm0gPSB0aGlzLl9nZW5lcmF0ZUFib3ZlUGFnZVRyYW5zZm9ybShtYXgpO1xuICAgICAgICAgIHZhciBiZWhpbmRTdHlsZSA9IHRoaXMuX2dlbmVyYXRlQmVoaW5kUGFnZVN0eWxlKG1heCk7XG5cbiAgICAgICAgICBhbmltaXQodGhpcy5fbWFpblBhZ2VbMF0pLnF1ZXVlKHt0cmFuc2Zvcm06IGFib3ZlVHJhbnNmb3JtfSkucGxheSgpO1xuICAgICAgICAgIGFuaW1pdCh0aGlzLl9tZW51UGFnZVswXSkucXVldWUoYmVoaW5kU3R5bGUpLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge2pxTGl0ZX0gZWxlbWVudCBcIm9ucy1zbGlkaW5nLW1lbnVcIiBvciBcIm9ucy1zcGxpdC12aWV3XCIgZWxlbWVudFxuICAgICAgICogQHBhcmFtIHtqcUxpdGV9IG1haW5QYWdlXG4gICAgICAgKiBAcGFyYW0ge2pxTGl0ZX0gbWVudVBhZ2VcbiAgICAgICAqL1xuICAgICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLl9ibGFja01hc2spIHtcbiAgICAgICAgICB0aGlzLl9ibGFja01hc2sucmVtb3ZlKCk7XG4gICAgICAgICAgdGhpcy5fYmxhY2tNYXNrID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9tYWluUGFnZSkge1xuICAgICAgICAgIHRoaXMuX21haW5QYWdlLmF0dHIoJ3N0eWxlJywgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX21lbnVQYWdlKSB7XG4gICAgICAgICAgdGhpcy5fbWVudVBhZ2UuYXR0cignc3R5bGUnLCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9tYWluUGFnZSA9IHRoaXMuX21lbnVQYWdlID0gdGhpcy5fZWxlbWVudCA9IHVuZGVmaW5lZDtcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaW5zdGFudFxuICAgICAgICovXG4gICAgICBvcGVuTWVudTogZnVuY3Rpb24oY2FsbGJhY2ssIGluc3RhbnQpIHtcbiAgICAgICAgdmFyIGR1cmF0aW9uID0gaW5zdGFudCA9PT0gdHJ1ZSA/IDAuMCA6IHRoaXMuZHVyYXRpb247XG4gICAgICAgIHZhciBkZWxheSA9IGluc3RhbnQgPT09IHRydWUgPyAwLjAgOiB0aGlzLmRlbGF5O1xuXG4gICAgICAgIHRoaXMuX21lbnVQYWdlLmNzcygnZGlzcGxheScsICdibG9jaycpO1xuICAgICAgICB0aGlzLl9ibGFja01hc2suY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG5cbiAgICAgICAgdmFyIG1heCA9IHRoaXMuX21lbnVQYWdlWzBdLmNsaWVudFdpZHRoO1xuXG4gICAgICAgIHZhciBhYm92ZVRyYW5zZm9ybSA9IHRoaXMuX2dlbmVyYXRlQWJvdmVQYWdlVHJhbnNmb3JtKG1heCk7XG4gICAgICAgIHZhciBiZWhpbmRTdHlsZSA9IHRoaXMuX2dlbmVyYXRlQmVoaW5kUGFnZVN0eWxlKG1heCk7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgIGFuaW1pdCh0aGlzLl9tYWluUGFnZVswXSlcbiAgICAgICAgICAgIC53YWl0KGRlbGF5KVxuICAgICAgICAgICAgLnF1ZXVlKHtcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiBhYm92ZVRyYW5zZm9ybVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICAgICAgICAgIHRpbWluZzogdGhpcy50aW1pbmdcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAucXVldWUoZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnBsYXkoKTtcblxuICAgICAgICAgIGFuaW1pdCh0aGlzLl9tZW51UGFnZVswXSlcbiAgICAgICAgICAgIC53YWl0KGRlbGF5KVxuICAgICAgICAgICAgLnF1ZXVlKGJlaGluZFN0eWxlLCB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvbixcbiAgICAgICAgICAgICAgdGltaW5nOiB0aGlzLnRpbWluZ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5wbGF5KCk7XG5cbiAgICAgICAgfS5iaW5kKHRoaXMpLCAxMDAwIC8gNjApO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAgICogQHBhcmFtIHtCb29sZWFufSBpbnN0YW50XG4gICAgICAgKi9cbiAgICAgIGNsb3NlTWVudTogZnVuY3Rpb24oY2FsbGJhY2ssIGluc3RhbnQpIHtcbiAgICAgICAgdmFyIGR1cmF0aW9uID0gaW5zdGFudCA9PT0gdHJ1ZSA/IDAuMCA6IHRoaXMuZHVyYXRpb247XG4gICAgICAgIHZhciBkZWxheSA9IGluc3RhbnQgPT09IHRydWUgPyAwLjAgOiB0aGlzLmRlbGF5O1xuXG4gICAgICAgIHRoaXMuX2JsYWNrTWFzay5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcblxuICAgICAgICB2YXIgYWJvdmVUcmFuc2Zvcm0gPSB0aGlzLl9nZW5lcmF0ZUFib3ZlUGFnZVRyYW5zZm9ybSgwKTtcbiAgICAgICAgdmFyIGJlaGluZFN0eWxlID0gdGhpcy5fZ2VuZXJhdGVCZWhpbmRQYWdlU3R5bGUoMCk7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcblxuICAgICAgICAgIGFuaW1pdCh0aGlzLl9tYWluUGFnZVswXSlcbiAgICAgICAgICAgIC53YWl0KGRlbGF5KVxuICAgICAgICAgICAgLnF1ZXVlKHtcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiBhYm92ZVRyYW5zZm9ybVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICAgICAgICAgIHRpbWluZzogdGhpcy50aW1pbmdcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAucXVldWUoe1xuICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCAwLCAwKSdcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAucXVldWUoZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICAgICAgICB0aGlzLl9tZW51UGFnZS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICAgICAucGxheSgpO1xuXG4gICAgICAgICAgYW5pbWl0KHRoaXMuX21lbnVQYWdlWzBdKVxuICAgICAgICAgICAgLndhaXQoZGVsYXkpXG4gICAgICAgICAgICAucXVldWUoYmVoaW5kU3R5bGUsIHtcbiAgICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uLFxuICAgICAgICAgICAgICB0aW1pbmc6IHRoaXMudGltaW5nXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnF1ZXVlKGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5wbGF5KCk7XG5cbiAgICAgICAgfS5iaW5kKHRoaXMpLCAxMDAwIC8gNjApO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMuZGlzdGFuY2VcbiAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLm1heERpc3RhbmNlXG4gICAgICAgKi9cbiAgICAgIHRyYW5zbGF0ZU1lbnU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgICAgICB0aGlzLl9tZW51UGFnZS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgICAgICAgdGhpcy5fYmxhY2tNYXNrLmNzcygnZGlzcGxheScsICdibG9jaycpO1xuXG4gICAgICAgIHZhciBhYm92ZVRyYW5zZm9ybSA9IHRoaXMuX2dlbmVyYXRlQWJvdmVQYWdlVHJhbnNmb3JtKE1hdGgubWluKG9wdGlvbnMubWF4RGlzdGFuY2UsIG9wdGlvbnMuZGlzdGFuY2UpKTtcbiAgICAgICAgdmFyIGJlaGluZFN0eWxlID0gdGhpcy5fZ2VuZXJhdGVCZWhpbmRQYWdlU3R5bGUoTWF0aC5taW4ob3B0aW9ucy5tYXhEaXN0YW5jZSwgb3B0aW9ucy5kaXN0YW5jZSkpO1xuICAgICAgICBkZWxldGUgYmVoaW5kU3R5bGUub3BhY2l0eTtcblxuICAgICAgICBhbmltaXQodGhpcy5fbWFpblBhZ2VbMF0pXG4gICAgICAgICAgLnF1ZXVlKHt0cmFuc2Zvcm06IGFib3ZlVHJhbnNmb3JtfSlcbiAgICAgICAgICAucGxheSgpO1xuXG4gICAgICAgIGFuaW1pdCh0aGlzLl9tZW51UGFnZVswXSlcbiAgICAgICAgICAucXVldWUoYmVoaW5kU3R5bGUpXG4gICAgICAgICAgLnBsYXkoKTtcbiAgICAgIH0sXG5cbiAgICAgIF9nZW5lcmF0ZUFib3ZlUGFnZVRyYW5zZm9ybTogZnVuY3Rpb24oZGlzdGFuY2UpIHtcbiAgICAgICAgdmFyIHggPSB0aGlzLl9pc1JpZ2h0ID8gLWRpc3RhbmNlIDogZGlzdGFuY2U7XG4gICAgICAgIHZhciBhYm92ZVRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgnICsgeCArICdweCwgMCwgMCknO1xuXG4gICAgICAgIHJldHVybiBhYm92ZVRyYW5zZm9ybTtcbiAgICAgIH0sXG5cbiAgICAgIF9nZW5lcmF0ZUJlaGluZFBhZ2VTdHlsZTogZnVuY3Rpb24oZGlzdGFuY2UpIHtcbiAgICAgICAgdmFyIG1heCA9IHRoaXMuX21lbnVQYWdlWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xuXG4gICAgICAgIHZhciBiZWhpbmREaXN0YW5jZSA9IChkaXN0YW5jZSAtIG1heCkgLyBtYXggKiAxMDtcbiAgICAgICAgYmVoaW5kRGlzdGFuY2UgPSBpc05hTihiZWhpbmREaXN0YW5jZSkgPyAwIDogTWF0aC5tYXgoTWF0aC5taW4oYmVoaW5kRGlzdGFuY2UsIDApLCAtMTApO1xuXG4gICAgICAgIHZhciBiZWhpbmRYID0gdGhpcy5faXNSaWdodCA/IC1iZWhpbmREaXN0YW5jZSA6IGJlaGluZERpc3RhbmNlO1xuICAgICAgICB2YXIgYmVoaW5kVHJhbnNmb3JtID0gJ3RyYW5zbGF0ZTNkKCcgKyBiZWhpbmRYICsgJyUsIDAsIDApJztcbiAgICAgICAgdmFyIG9wYWNpdHkgPSAxICsgYmVoaW5kRGlzdGFuY2UgLyAxMDA7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0cmFuc2Zvcm06IGJlaGluZFRyYW5zZm9ybSxcbiAgICAgICAgICBvcGFjaXR5OiBvcGFjaXR5XG4gICAgICAgIH07XG4gICAgICB9LFxuXG4gICAgICBjb3B5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZXZlYWxTbGlkaW5nTWVudUFuaW1hdG9yKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gUmV2ZWFsU2xpZGluZ01lbnVBbmltYXRvcjtcbiAgfSk7XG5cbn0pKCk7XG4iLCIvKipcbiAqIEBlbGVtZW50IG9ucy1zbGlkaW5nLW1lbnVcbiAqIEBjYXRlZ29yeSBzbGlkaW5nLW1lbnVcbiAqIEBkZXNjcmlwdGlvblxuICogICBbZW5dQ29tcG9uZW50IGZvciBzbGlkaW5nIFVJIHdoZXJlIG9uZSBwYWdlIGlzIG92ZXJsYXllZCBvdmVyIGFub3RoZXIgcGFnZS4gVGhlIGFib3ZlIHBhZ2UgY2FuIGJlIHNsaWRlZCBhc2lkZSB0byByZXZlYWwgdGhlIHBhZ2UgYmVoaW5kLlsvZW5dXG4gKiAgIFtqYV3jgrnjg6njgqTjg4fjgqPjg7PjgrDjg6Hjg4vjg6Xjg7zjgpLooajnj77jgZnjgovjgZ/jgoHjga7jgrPjg7Pjg53jg7zjg43jg7Pjg4jjgafjgIHniYfmlrnjga7jg5rjg7zjgrjjgYzliKXjga7jg5rjg7zjgrjjga7kuIrjgavjgqrjg7zjg5Djg7zjg6zjgqTjgafooajnpLrjgZXjgozjgb7jgZnjgIJhYm92ZS1wYWdl44Gn5oyH5a6a44GV44KM44Gf44Oa44O844K444Gv44CB5qiq44GL44KJ44K544Op44Kk44OJ44GX44Gm6KGo56S644GX44G+44GZ44CCWy9qYV1cbiAqIEBjb2RlcGVuIElEdkZKXG4gKiBAc2VlYWxzbyBvbnMtcGFnZVxuICogICBbZW5db25zLXBhZ2UgY29tcG9uZW50Wy9lbl1cbiAqICAgW2phXW9ucy1wYWdl44Kz44Oz44Od44O844ON44Oz44OIWy9qYV1cbiAqIEBndWlkZSBVc2luZ1NsaWRpbmdNZW51XG4gKiAgIFtlbl1Vc2luZyBzbGlkaW5nIG1lbnVbL2VuXVxuICogICBbamFd44K544Op44Kk44OH44Kj44Oz44Kw44Oh44OL44Ol44O844KS5L2/44GGWy9qYV1cbiAqIEBndWlkZSBFdmVudEhhbmRsaW5nXG4gKiAgIFtlbl1Vc2luZyBldmVudHNbL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI44Gu5Yip55SoWy9qYV1cbiAqIEBndWlkZSBDYWxsaW5nQ29tcG9uZW50QVBJc2Zyb21KYXZhU2NyaXB0XG4gKiAgIFtlbl1Vc2luZyBuYXZpZ2F0b3IgZnJvbSBKYXZhU2NyaXB0Wy9lbl1cbiAqICAgW2phXUphdmFTY3JpcHTjgYvjgonjgrPjg7Pjg53jg7zjg43jg7Pjg4jjgpLlkbzjgbPlh7rjgZlbL2phXVxuICogQGd1aWRlIERlZmluaW5nTXVsdGlwbGVQYWdlc2luU2luZ2xlSFRNTFxuICogICBbZW5dRGVmaW5pbmcgbXVsdGlwbGUgcGFnZXMgaW4gc2luZ2xlIGh0bWxbL2VuXVxuICogICBbamFd6KSH5pWw44Gu44Oa44O844K444KSMeOBpOOBrkhUTUzjgavoqJjov7DjgZnjgotbL2phXVxuICogQGV4YW1wbGVcbiAqIDxvbnMtc2xpZGluZy1tZW51IHZhcj1cImFwcC5tZW51XCIgbWFpbi1wYWdlPVwicGFnZS5odG1sXCIgbWVudS1wYWdlPVwibWVudS5odG1sXCIgbWF4LXNsaWRlLWRpc3RhbmNlPVwiMjAwcHhcIiB0eXBlPVwicmV2ZWFsXCIgc2lkZT1cImxlZnRcIj5cbiAqIDwvb25zLXNsaWRpbmctbWVudT5cbiAqXG4gKiA8b25zLXRlbXBsYXRlIGlkPVwicGFnZS5odG1sXCI+XG4gKiAgIDxvbnMtcGFnZT5cbiAqICAgIDxwIHN0eWxlPVwidGV4dC1hbGlnbjogY2VudGVyXCI+XG4gKiAgICAgIDxvbnMtYnV0dG9uIG5nLWNsaWNrPVwiYXBwLm1lbnUudG9nZ2xlTWVudSgpXCI+VG9nZ2xlPC9vbnMtYnV0dG9uPlxuICogICAgPC9wPlxuICogICA8L29ucy1wYWdlPlxuICogPC9vbnMtdGVtcGxhdGU+XG4gKlxuICogPG9ucy10ZW1wbGF0ZSBpZD1cIm1lbnUuaHRtbFwiPlxuICogICA8b25zLXBhZ2U+XG4gKiAgICAgPCEtLSBtZW51IHBhZ2UncyBjb250ZW50cyAtLT5cbiAqICAgPC9vbnMtcGFnZT5cbiAqIDwvb25zLXRlbXBsYXRlPlxuICpcbiAqL1xuXG4vKipcbiAqIEBldmVudCBwcmVvcGVuXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXUZpcmVkIGp1c3QgYmVmb3JlIHRoZSBzbGlkaW5nIG1lbnUgaXMgb3BlbmVkLlsvZW5dXG4gKiAgIFtqYV3jgrnjg6njgqTjg4fjgqPjg7PjgrDjg6Hjg4vjg6Xjg7zjgYzplovjgY/liY3jgavnmbrngavjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG4gKiAgIFtlbl1FdmVudCBvYmplY3QuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOOCquODluOCuOOCp+OCr+ODiOOBp+OBmeOAglsvamFdXG4gKiBAcGFyYW0ge09iamVjdH0gZXZlbnQuc2xpZGluZ01lbnVcbiAqICAgW2VuXVNsaWRpbmcgbWVudSB2aWV3IG9iamVjdC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI44GM55m654Gr44GX44GfU2xpZGluZ01lbnXjgqrjg5bjgrjjgqfjgq/jg4jjgafjgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGV2ZW50IHBvc3RvcGVuXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXUZpcmVkIGp1c3QgYWZ0ZXIgdGhlIHNsaWRpbmcgbWVudSBpcyBvcGVuZWQuWy9lbl1cbiAqICAgW2phXeOCueODqeOCpOODh+OCo+ODs+OCsOODoeODi+ODpeODvOOBjOmWi+OBjee1guOCj+OBo+OBn+W+jOOBq+eZuueBq+OBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcbiAqICAgW2VuXUV2ZW50IG9iamVjdC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI44Kq44OW44K444Kn44Kv44OI44Gn44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7T2JqZWN0fSBldmVudC5zbGlkaW5nTWVudVxuICogICBbZW5dU2xpZGluZyBtZW51IHZpZXcgb2JqZWN0LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jjgYznmbrngavjgZfjgZ9TbGlkaW5nTWVudeOCquODluOCuOOCp+OCr+ODiOOBp+OBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAZXZlbnQgcHJlY2xvc2VcbiAqIEBkZXNjcmlwdGlvblxuICogICBbZW5dRmlyZWQganVzdCBiZWZvcmUgdGhlIHNsaWRpbmcgbWVudSBpcyBjbG9zZWQuWy9lbl1cbiAqICAgW2phXeOCueODqeOCpOODh+OCo+ODs+OCsOODoeODi+ODpeODvOOBjOmWieOBmOOCi+WJjeOBq+eZuueBq+OBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcbiAqICAgW2VuXUV2ZW50IG9iamVjdC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI44Kq44OW44K444Kn44Kv44OI44Gn44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7T2JqZWN0fSBldmVudC5zbGlkaW5nTWVudVxuICogICBbZW5dU2xpZGluZyBtZW51IHZpZXcgb2JqZWN0LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jjgYznmbrngavjgZfjgZ9TbGlkaW5nTWVudeOCquODluOCuOOCp+OCr+ODiOOBp+OBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAZXZlbnQgcG9zdGNsb3NlXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXUZpcmVkIGp1c3QgYWZ0ZXIgdGhlIHNsaWRpbmcgbWVudSBpcyBjbG9zZWQuWy9lbl1cbiAqICAgW2phXeOCueODqeOCpOODh+OCo+ODs+OCsOODoeODi+ODpeODvOOBjOmWieOBmOe1guOCj+OBo+OBn+W+jOOBq+eZuueBq+OBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcbiAqICAgW2VuXUV2ZW50IG9iamVjdC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI44Kq44OW44K444Kn44Kv44OI44Gn44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7T2JqZWN0fSBldmVudC5zbGlkaW5nTWVudVxuICogICBbZW5dU2xpZGluZyBtZW51IHZpZXcgb2JqZWN0LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jjgYznmbrngavjgZfjgZ9TbGlkaW5nTWVudeOCquODluOCuOOCp+OCr+ODiOOBp+OBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIHZhclxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7U3RyaW5nfVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXVZhcmlhYmxlIG5hbWUgdG8gcmVmZXIgdGhpcyBzbGlkaW5nIG1lbnUuWy9lbl1cbiAqICBbamFd44GT44Gu44K544Op44Kk44OH44Kj44Oz44Kw44Oh44OL44Ol44O844KS5Y+C54Wn44GZ44KL44Gf44KB44Gu5ZCN5YmN44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgbWVudS1wYWdlXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXVRoZSB1cmwgb2YgdGhlIG1lbnUgcGFnZS5bL2VuXVxuICogICBbamFd5bem44Gr5L2N572u44GZ44KL44Oh44OL44Ol44O844Oa44O844K444GuVVJM44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgbWFpbi1wYWdlXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXVRoZSB1cmwgb2YgdGhlIG1haW4gcGFnZS5bL2VuXVxuICogICBbamFd5Y+z44Gr5L2N572u44GZ44KL44Oh44Kk44Oz44Oa44O844K444GuVVJM44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgc3dpcGVhYmxlXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtCb29sZWFufVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1XaGV0aGVyIHRvIGVuYWJsZSBzd2lwZSBpbnRlcmFjdGlvbi5bL2VuXVxuICogICBbamFd44K544Ov44Kk44OX5pON5L2c44KS5pyJ5Yq544Gr44GZ44KL5aC05ZCI44Gr5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgc3dpcGUtdGFyZ2V0LXdpZHRoXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXVRoZSB3aWR0aCBvZiBzd2lwZWFibGUgYXJlYSBjYWxjdWxhdGVkIGZyb20gdGhlIGxlZnQgKGluIHBpeGVscykuIFVzZSB0aGlzIHRvIGVuYWJsZSBzd2lwZSBvbmx5IHdoZW4gdGhlIGZpbmdlciB0b3VjaCBvbiB0aGUgc2NyZWVuIGVkZ2UuWy9lbl1cbiAqICAgW2phXeOCueODr+OCpOODl+OBruWIpOWumumgmOWfn+OCkuODlOOCr+OCu+ODq+WNmOS9jeOBp+aMh+WumuOBl+OBvuOBmeOAgueUu+mdouOBruerr+OBi+OCieaMh+WumuOBl+OBn+i3nembouOBq+mBlOOBmeOCi+OBqOODmuODvOOCuOOBjOihqOekuuOBleOCjOOBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIG1heC1zbGlkZS1kaXN0YW5jZVxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7U3RyaW5nfVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1Ib3cgZmFyIHRoZSBtZW51IHBhZ2Ugd2lsbCBzbGlkZSBvcGVuLiBDYW4gc3BlY2lmeSBib3RoIGluIHB4IGFuZCAlLiBlZy4gOTAlLCAyMDBweFsvZW5dXG4gKiAgIFtqYV1tZW51LXBhZ2XjgafmjIflrprjgZXjgozjgZ/jg5rjg7zjgrjjga7ooajnpLrluYXjgpLmjIflrprjgZfjgb7jgZnjgILjg5Tjgq/jgrvjg6vjgoLjgZfjgY/jga8l44Gu5Lih5pa544Gn5oyH5a6a44Gn44GN44G+44GZ77yI5L6LOiA5MCUsIDIwMHB477yJWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgc2lkZVxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7U3RyaW5nfVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1TcGVjaWZ5IHdoaWNoIHNpZGUgb2YgdGhlIHNjcmVlbiB0aGUgbWVudSBwYWdlIGlzIGxvY2F0ZWQgb24uIFBvc3NpYmxlIHZhbHVlcyBhcmUgXCJsZWZ0XCIgYW5kIFwicmlnaHRcIi5bL2VuXVxuICogICBbamFdbWVudS1wYWdl44Gn5oyH5a6a44GV44KM44Gf44Oa44O844K444GM55S76Z2i44Gu44Gp44Gh44KJ5YG044GL44KJ6KGo56S644GV44KM44KL44GL44KS5oyH5a6a44GX44G+44GZ44CCbGVmdOOCguOBl+OBj+OBr3JpZ2h044Gu44GE44Ga44KM44GL44KS5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgdHlwZVxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7U3RyaW5nfVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1TbGlkaW5nIG1lbnUgYW5pbWF0b3IuIFBvc3NpYmxlIHZhbHVlcyBhcmUgcmV2ZWFsIChkZWZhdWx0KSwgcHVzaCBhbmQgb3ZlcmxheS5bL2VuXVxuICogICBbamFd44K544Op44Kk44OH44Kj44Oz44Kw44Oh44OL44Ol44O844Gu44Ki44OL44Oh44O844K344On44Oz44Gn44GZ44CCXCJyZXZlYWxcIu+8iOODh+ODleOCqeODq+ODiO+8ieOAgVwicHVzaFwi44CBXCJvdmVybGF5XCLjga7jgYTjgZrjgozjgYvjgpLmjIflrprjgafjgY3jgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBvbnMtcHJlb3BlblxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BbGxvd3MgeW91IHRvIHNwZWNpZnkgY3VzdG9tIGJlaGF2aW9yIHdoZW4gdGhlIFwicHJlb3BlblwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXVwicHJlb3Blblwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLXByZWNsb3NlXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtFeHByZXNzaW9ufVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXUFsbG93cyB5b3UgdG8gc3BlY2lmeSBjdXN0b20gYmVoYXZpb3Igd2hlbiB0aGUgXCJwcmVjbG9zZVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXVwicHJlY2xvc2VcIuOCpOODmeODs+ODiOOBjOeZuueBq+OBleOCjOOBn+aZguOBruaMmeWLleOCkueLrOiHquOBq+aMh+WumuOBp+OBjeOBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIG9ucy1wb3N0b3BlblxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BbGxvd3MgeW91IHRvIHNwZWNpZnkgY3VzdG9tIGJlaGF2aW9yIHdoZW4gdGhlIFwicG9zdG9wZW5cIiBldmVudCBpcyBmaXJlZC5bL2VuXVxuICogIFtqYV1cInBvc3RvcGVuXCLjgqTjg5njg7Pjg4jjgYznmbrngavjgZXjgozjgZ/mmYLjga7mjJnli5XjgpLni6zoh6rjgavmjIflrprjgafjgY3jgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBvbnMtcG9zdGNsb3NlXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtFeHByZXNzaW9ufVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXUFsbG93cyB5b3UgdG8gc3BlY2lmeSBjdXN0b20gYmVoYXZpb3Igd2hlbiB0aGUgXCJwb3N0Y2xvc2VcIiBldmVudCBpcyBmaXJlZC5bL2VuXVxuICogIFtqYV1cInBvc3RjbG9zZVwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWluaXRcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIGEgcGFnZSdzIFwiaW5pdFwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXeODmuODvOOCuOOBrlwiaW5pdFwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLXNob3dcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIGEgcGFnZSdzIFwic2hvd1wiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXeODmuODvOOCuOOBrlwic2hvd1wi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWhpZGVcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIGEgcGFnZSdzIFwiaGlkZVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXeODmuODvOOCuOOBrlwiaGlkZVwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWRlc3Ryb3lcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIGEgcGFnZSdzIFwiZGVzdHJveVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXeODmuODvOOCuOOBrlwiZGVzdHJveVwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBtZXRob2Qgc2V0TWFpblBhZ2VcbiAqIEBzaWduYXR1cmUgc2V0TWFpblBhZ2UocGFnZVVybCwgW29wdGlvbnNdKVxuICogQHBhcmFtIHtTdHJpbmd9IHBhZ2VVcmxcbiAqICAgW2VuXVBhZ2UgVVJMLiBDYW4gYmUgZWl0aGVyIGFuIEhUTUwgZG9jdW1lbnQgb3IgYW4gPGNvZGU+Jmx0O29ucy10ZW1wbGF0ZSZndDs8L2NvZGU+LlsvZW5dXG4gKiAgIFtqYV1wYWdl44GuVVJM44GL44CBb25zLXRlbXBsYXRl44Gn5a6j6KiA44GX44Gf44OG44Oz44OX44Os44O844OI44GuaWTlsZ7mgKfjga7lgKTjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogICBbZW5dUGFyYW1ldGVyIG9iamVjdC5bL2VuXVxuICogICBbamFd44Kq44OX44K344On44Oz44KS5oyH5a6a44GZ44KL44Kq44OW44K444Kn44Kv44OI44CCWy9qYV1cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuY2xvc2VNZW51XVxuICogICBbZW5dSWYgdHJ1ZSB0aGUgbWVudSB3aWxsIGJlIGNsb3NlZC5bL2VuXVxuICogICBbamFddHJ1ZeOCkuaMh+WumuOBmeOCi+OBqOOAgemWi+OBhOOBpuOBhOOCi+ODoeODi+ODpeODvOOCkumWieOBmOOBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbb3B0aW9ucy5jYWxsYmFja11cbiAqICAgW2VuXUZ1bmN0aW9uIHRoYXQgaXMgZXhlY3V0ZWQgYWZ0ZXIgdGhlIHBhZ2UgaGFzIGJlZW4gc2V0LlsvZW5dXG4gKiAgIFtqYV3jg5rjg7zjgrjjgYzoqq3jgb/ovrzjgb7jgozjgZ/lvozjgavlkbzjgbPlh7rjgZXjgozjgovplqLmlbDjgqrjg5bjgrjjgqfjgq/jg4jjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1TaG93IHRoZSBwYWdlIHNwZWNpZmllZCBpbiBwYWdlVXJsIGluIHRoZSBtYWluIGNvbnRlbnRzIHBhbmUuWy9lbl1cbiAqICAgW2phXeS4reWkrumDqOWIhuOBq+ihqOekuuOBleOCjOOCi+ODmuODvOOCuOOCknBhZ2VVcmzjgavmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQG1ldGhvZCBzZXRNZW51UGFnZVxuICogQHNpZ25hdHVyZSBzZXRNZW51UGFnZShwYWdlVXJsLCBbb3B0aW9uc10pXG4gKiBAcGFyYW0ge1N0cmluZ30gcGFnZVVybFxuICogICBbZW5dUGFnZSBVUkwuIENhbiBiZSBlaXRoZXIgYW4gSFRNTCBkb2N1bWVudCBvciBhbiA8Y29kZT4mbHQ7b25zLXRlbXBsYXRlJmd0OzwvY29kZT4uWy9lbl1cbiAqICAgW2phXXBhZ2Xjga5VUkzjgYvjgIFvbnMtdGVtcGxhdGXjgaflrqPoqIDjgZfjgZ/jg4bjg7Pjg5fjg6zjg7zjg4jjga5pZOWxnuaAp+OBruWApOOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiAgIFtlbl1QYXJhbWV0ZXIgb2JqZWN0LlsvZW5dXG4gKiAgIFtqYV3jgqrjg5fjgrfjg6fjg7PjgpLmjIflrprjgZnjgovjgqrjg5bjgrjjgqfjgq/jg4jjgIJbL2phXVxuICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5jbG9zZU1lbnVdXG4gKiAgIFtlbl1JZiB0cnVlIHRoZSBtZW51IHdpbGwgYmUgY2xvc2VkIGFmdGVyIHRoZSBtZW51IHBhZ2UgaGFzIGJlZW4gc2V0LlsvZW5dXG4gKiAgIFtqYV10cnVl44KS5oyH5a6a44GZ44KL44Go44CB6ZaL44GE44Gm44GE44KL44Oh44OL44Ol44O844KS6ZaJ44GY44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtvcHRpb25zLmNhbGxiYWNrXVxuICogICBbZW5dVGhpcyBmdW5jdGlvbiB3aWxsIGJlIGV4ZWN1dGVkIGFmdGVyIHRoZSBtZW51IHBhZ2UgaGFzIGJlZW4gc2V0LlsvZW5dXG4gKiAgIFtqYV3jg6Hjg4vjg6Xjg7zjg5rjg7zjgrjjgYzoqq3jgb/ovrzjgb7jgozjgZ/lvozjgavlkbzjgbPlh7rjgZXjgozjgovplqLmlbDjgqrjg5bjgrjjgqfjgq/jg4jjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1TaG93IHRoZSBwYWdlIHNwZWNpZmllZCBpbiBwYWdlVXJsIGluIHRoZSBzaWRlIG1lbnUgcGFuZS5bL2VuXVxuICogICBbamFd44Oh44OL44Ol44O86YOo5YiG44Gr6KGo56S644GV44KM44KL44Oa44O844K444KScGFnZVVybOOBq+aMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAbWV0aG9kIG9wZW5NZW51XG4gKiBAc2lnbmF0dXJlIG9wZW5NZW51KFtvcHRpb25zXSlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqICAgW2VuXVBhcmFtZXRlciBvYmplY3QuWy9lbl1cbiAqICAgW2phXeOCquODl+OCt+ODp+ODs+OCkuaMh+WumuOBmeOCi+OCquODluOCuOOCp+OCr+ODiOOAglsvamFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbb3B0aW9ucy5jYWxsYmFja11cbiAqICAgW2VuXVRoaXMgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgdGhlIG1lbnUgaGFzIGJlZW4gb3BlbmVkLlsvZW5dXG4gKiAgIFtqYV3jg6Hjg4vjg6Xjg7zjgYzplovjgYTjgZ/lvozjgavlkbzjgbPlh7rjgZXjgozjgovplqLmlbDjgqrjg5bjgrjjgqfjgq/jg4jjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1TbGlkZSB0aGUgYWJvdmUgbGF5ZXIgdG8gcmV2ZWFsIHRoZSBsYXllciBiZWhpbmQuWy9lbl1cbiAqICAgW2phXeODoeODi+ODpeODvOODmuODvOOCuOOCkuihqOekuuOBl+OBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAbWV0aG9kIGNsb3NlTWVudVxuICogQHNpZ25hdHVyZSBjbG9zZU1lbnUoW29wdGlvbnNdKVxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogICBbZW5dUGFyYW1ldGVyIG9iamVjdC5bL2VuXVxuICogICBbamFd44Kq44OX44K344On44Oz44KS5oyH5a6a44GZ44KL44Kq44OW44K444Kn44Kv44OI44CCWy9qYV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtvcHRpb25zLmNhbGxiYWNrXVxuICogICBbZW5dVGhpcyBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBhZnRlciB0aGUgbWVudSBoYXMgYmVlbiBjbG9zZWQuWy9lbl1cbiAqICAgW2phXeODoeODi+ODpeODvOOBjOmWieOBmOOCieOCjOOBn+W+jOOBq+WRvOOBs+WHuuOBleOCjOOCi+mWouaVsOOCquODluOCuOOCp+OCr+ODiOOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXVNsaWRlIHRoZSBhYm92ZSBsYXllciB0byBoaWRlIHRoZSBsYXllciBiZWhpbmQuWy9lbl1cbiAqICAgW2phXeODoeODi+ODpeODvOODmuODvOOCuOOCkumdnuihqOekuuOBq+OBl+OBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAbWV0aG9kIHRvZ2dsZU1lbnVcbiAqIEBzaWduYXR1cmUgdG9nZ2xlTWVudShbb3B0aW9uc10pXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiAgIFtlbl1QYXJhbWV0ZXIgb2JqZWN0LlsvZW5dXG4gKiAgIFtqYV3jgqrjg5fjgrfjg6fjg7PjgpLmjIflrprjgZnjgovjgqrjg5bjgrjjgqfjgq/jg4jjgIJbL2phXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW29wdGlvbnMuY2FsbGJhY2tdXG4gKiAgIFtlbl1UaGlzIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIGFmdGVyIHRoZSBtZW51IGhhcyBiZWVuIG9wZW5lZCBvciBjbG9zZWQuWy9lbl1cbiAqICAgW2phXeODoeODi+ODpeODvOOBjOmWi+OBjee1guOCj+OBo+OBn+W+jOOBi+OAgemWieOBmOe1guOCj+OBo+OBn+W+jOOBq+WRvOOBs+WHuuOBleOCjOOCi+mWouaVsOOCquODluOCuOOCp+OCr+ODiOOBp+OBmeOAglsvamFdXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXVNsaWRlIHRoZSBhYm92ZSBsYXllciB0byByZXZlYWwgdGhlIGxheWVyIGJlaGluZCBpZiBpdCBpcyBjdXJyZW50bHkgaGlkZGVuLCBvdGhlcndpc2UsIGhpZGUgdGhlIGxheWVyIGJlaGluZC5bL2VuXVxuICogICBbamFd54++5Zyo44Gu54q25rOB44Gr5ZCI44KP44Gb44Gm44CB44Oh44OL44Ol44O844Oa44O844K444KS6KGo56S644KC44GX44GP44Gv6Z2e6KGo56S644Gr44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBtZXRob2QgaXNNZW51T3BlbmVkXG4gKiBAc2lnbmF0dXJlIGlzTWVudU9wZW5lZCgpXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogICBbZW5ddHJ1ZSBpZiB0aGUgbWVudSBpcyBjdXJyZW50bHkgb3Blbi5bL2VuXVxuICogICBbamFd44Oh44OL44Ol44O844GM6ZaL44GE44Gm44GE44KM44GwdHJ1ZeOBqOOBquOCiuOBvuOBmeOAglsvamFdXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXVJldHVybnMgdHJ1ZSBpZiB0aGUgbWVudSBwYWdlIGlzIG9wZW4sIG90aGVyd2lzZSBmYWxzZS5bL2VuXVxuICogICBbamFd44Oh44OL44Ol44O844Oa44O844K444GM6ZaL44GE44Gm44GE44KL5aC05ZCI44GvdHJ1ZeOAgeOBneOBhuOBp+OBquOBhOWgtOWQiOOBr2ZhbHNl44KS6L+U44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBtZXRob2QgZ2V0RGV2aWNlQmFja0J1dHRvbkhhbmRsZXJcbiAqIEBzaWduYXR1cmUgZ2V0RGV2aWNlQmFja0J1dHRvbkhhbmRsZXIoKVxuICogQHJldHVybiB7T2JqZWN0fVxuICogICBbZW5dRGV2aWNlIGJhY2sgYnV0dG9uIGhhbmRsZXIuWy9lbl1cbiAqICAgW2phXeODh+ODkOOCpOOCueOBruODkOODg+OCr+ODnOOCv+ODs+ODj+ODs+ODieODqeOCkui/lOOBl+OBvuOBmeOAglsvamFdXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXVJldHJpZXZlIHRoZSBiYWNrLWJ1dHRvbiBoYW5kbGVyLlsvZW5dXG4gKiAgIFtqYV1vbnMtc2xpZGluZy1tZW5144Gr57SQ5LuY44GE44Gm44GE44KL44OQ44OD44Kv44Oc44K/44Oz44OP44Oz44OJ44Op44KS5Y+W5b6X44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBtZXRob2Qgc2V0U3dpcGVhYmxlXG4gKiBAc2lnbmF0dXJlIHNldFN3aXBlYWJsZShzd2lwZWFibGUpXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHN3aXBlYWJsZVxuICogICBbZW5dSWYgdHJ1ZSB0aGUgbWVudSB3aWxsIGJlIHN3aXBlYWJsZS5bL2VuXVxuICogICBbamFd44K544Ov44Kk44OX44Gn6ZaL6ZaJ44Gn44GN44KL44KI44GG44Gr44GZ44KL5aC05ZCI44Gr44GvdHJ1ZeOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXVNwZWNpZnkgaWYgdGhlIG1lbnUgc2hvdWxkIGJlIHN3aXBlYWJsZSBvciBub3QuWy9lbl1cbiAqICAgW2phXeOCueODr+OCpOODl+OBp+mWi+mWieOBmeOCi+OBi+OBqeOBhuOBi+OCkuioreWumuOBmeOCi+OAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAbWV0aG9kIG9uXG4gKiBAc2lnbmF0dXJlIG9uKGV2ZW50TmFtZSwgbGlzdGVuZXIpXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXUFkZCBhbiBldmVudCBsaXN0ZW5lci5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI44Oq44K544OK44O844KS6L+95Yqg44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAqICAgW2VuXU5hbWUgb2YgdGhlIGV2ZW50LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jlkI3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAqICAgW2VuXUZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlsvZW5dXG4gKiAgIFtqYV3jgZPjga7jgqTjg5njg7Pjg4jjgYznmbrngavjgZXjgozjgZ/pmpvjgavlkbzjgbPlh7rjgZXjgozjgovplqLmlbDjgqrjg5bjgrjjgqfjgq/jg4jjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQG1ldGhvZCBvbmNlXG4gKiBAc2lnbmF0dXJlIG9uY2UoZXZlbnROYW1lLCBsaXN0ZW5lcilcbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BZGQgYW4gZXZlbnQgbGlzdGVuZXIgdGhhdCdzIG9ubHkgdHJpZ2dlcmVkIG9uY2UuWy9lbl1cbiAqICBbamFd5LiA5bqm44Gg44GR5ZG844Gz5Ye644GV44KM44KL44Kk44OZ44Oz44OI44Oq44K544OK44O844KS6L+95Yqg44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAqICAgW2VuXU5hbWUgb2YgdGhlIGV2ZW50LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jlkI3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAqICAgW2VuXUZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jjgYznmbrngavjgZfjgZ/pmpvjgavlkbzjgbPlh7rjgZXjgozjgovplqLmlbDjgqrjg5bjgrjjgqfjgq/jg4jjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQG1ldGhvZCBvZmZcbiAqIEBzaWduYXR1cmUgb2ZmKGV2ZW50TmFtZSwgW2xpc3RlbmVyXSlcbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1SZW1vdmUgYW4gZXZlbnQgbGlzdGVuZXIuIElmIHRoZSBsaXN0ZW5lciBpcyBub3Qgc3BlY2lmaWVkIGFsbCBsaXN0ZW5lcnMgZm9yIHRoZSBldmVudCB0eXBlIHdpbGwgYmUgcmVtb3ZlZC5bL2VuXVxuICogIFtqYV3jgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgpLliYrpmaTjgZfjgb7jgZnjgILjgoLjgZfjgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgpLmjIflrprjgZfjgarjgYvjgaPjgZ/loLTlkIjjgavjga/jgIHjgZ3jga7jgqTjg5njg7Pjg4jjgavntJDjgaXjgY/lhajjgabjga7jgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgYzliYrpmaTjgZXjgozjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZVxuICogICBbZW5dTmFtZSBvZiB0aGUgZXZlbnQuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOWQjeOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICogICBbZW5dRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuWy9lbl1cbiAqICAgW2phXeWJiumZpOOBmeOCi+OCpOODmeODs+ODiOODquOCueODiuODvOOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKTtcblxuICBtb2R1bGUuZGlyZWN0aXZlKCdvbnNTbGlkaW5nTWVudScsIGZ1bmN0aW9uKCRjb21waWxlLCBTbGlkaW5nTWVudVZpZXcsICRvbnNlbikge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgcmVwbGFjZTogZmFsc2UsXG5cbiAgICAgIC8vIE5PVEU6IFRoaXMgZWxlbWVudCBtdXN0IGNvZXhpc3RzIHdpdGggbmctY29udHJvbGxlci5cbiAgICAgIC8vIERvIG5vdCB1c2UgaXNvbGF0ZWQgc2NvcGUgYW5kIHRlbXBsYXRlJ3MgbmctdHJhbnNjbHVkZS5cbiAgICAgIHRyYW5zY2x1ZGU6IGZhbHNlLFxuICAgICAgc2NvcGU6IHRydWUsXG5cbiAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgIHZhciBtYWluID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcubWFpbicpLFxuICAgICAgICAgICAgbWVudSA9IGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLm1lbnUnKTtcblxuICAgICAgICBpZiAobWFpbikge1xuICAgICAgICAgIHZhciBtYWluSHRtbCA9IGFuZ3VsYXIuZWxlbWVudChtYWluKS5yZW1vdmUoKS5odG1sKCkudHJpbSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1lbnUpIHtcbiAgICAgICAgICB2YXIgbWVudUh0bWwgPSBhbmd1bGFyLmVsZW1lbnQobWVudSkucmVtb3ZlKCkuaHRtbCgpLnRyaW0oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICBlbGVtZW50LmFwcGVuZChhbmd1bGFyLmVsZW1lbnQoJzxkaXY+PC9kaXY+JykuYWRkQ2xhc3MoJ29uc2VuLXNsaWRpbmctbWVudV9fbWVudSBvbnMtc2xpZGluZy1tZW51LWlubmVyJykpO1xuICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKGFuZ3VsYXIuZWxlbWVudCgnPGRpdj48L2Rpdj4nKS5hZGRDbGFzcygnb25zZW4tc2xpZGluZy1tZW51X19tYWluIG9ucy1zbGlkaW5nLW1lbnUtaW5uZXInKSk7XG5cbiAgICAgICAgICB2YXIgc2xpZGluZ01lbnUgPSBuZXcgU2xpZGluZ01lbnVWaWV3KHNjb3BlLCBlbGVtZW50LCBhdHRycyk7XG5cbiAgICAgICAgICAkb25zZW4ucmVnaXN0ZXJFdmVudEhhbmRsZXJzKHNsaWRpbmdNZW51LCAncHJlb3BlbiBwcmVjbG9zZSBwb3N0b3BlbiBwb3N0Y2xvc2UgaW5pdCBzaG93IGhpZGUgZGVzdHJveScpO1xuXG4gICAgICAgICAgaWYgKG1haW5IdG1sICYmICFhdHRycy5tYWluUGFnZSkge1xuICAgICAgICAgICAgc2xpZGluZ01lbnUuX2FwcGVuZE1haW5QYWdlKG51bGwsIG1haW5IdG1sKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobWVudUh0bWwgJiYgIWF0dHJzLm1lbnVQYWdlKSB7XG4gICAgICAgICAgICBzbGlkaW5nTWVudS5fYXBwZW5kTWVudVBhZ2UobWVudUh0bWwpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgICRvbnNlbi5kZWNsYXJlVmFyQXR0cmlidXRlKGF0dHJzLCBzbGlkaW5nTWVudSk7XG4gICAgICAgICAgZWxlbWVudC5kYXRhKCdvbnMtc2xpZGluZy1tZW51Jywgc2xpZGluZ01lbnUpO1xuXG4gICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBzbGlkaW5nTWVudS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgZWxlbWVudC5kYXRhKCdvbnMtc2xpZGluZy1tZW51JywgdW5kZWZpbmVkKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgICRvbnNlbi5maXJlQ29tcG9uZW50RXZlbnQoZWxlbWVudFswXSwgJ2luaXQnKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbn0pKCk7XG4iLCIvKlxuQ29weXJpZ2h0IDIwMTMtMjAxNSBBU0lBTCBDT1JQT1JBVElPTlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4qL1xuXG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpO1xuXG4gIG1vZHVsZS5mYWN0b3J5KCdTbGlkaW5nTWVudUFuaW1hdG9yJywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIENsYXNzLmV4dGVuZCh7XG5cbiAgICAgIGRlbGF5OiAwLFxuICAgICAgZHVyYXRpb246IDAuNCxcbiAgICAgIHRpbWluZzogJ2N1YmljLWJlemllciguMSwgLjcsIC4xLCAxKScsXG5cbiAgICAgIC8qKlxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLnRpbWluZ1xuICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMuZHVyYXRpb25cbiAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLmRlbGF5XG4gICAgICAgKi9cbiAgICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgICAgdGhpcy50aW1pbmcgPSBvcHRpb25zLnRpbWluZyB8fCB0aGlzLnRpbWluZztcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb24gIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuZHVyYXRpb24gOiB0aGlzLmR1cmF0aW9uO1xuICAgICAgICB0aGlzLmRlbGF5ID0gb3B0aW9ucy5kZWxheSAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5kZWxheSA6IHRoaXMuZGVsYXk7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIEBwYXJhbSB7anFMaXRlfSBlbGVtZW50IFwib25zLXNsaWRpbmctbWVudVwiIG9yIFwib25zLXNwbGl0LXZpZXdcIiBlbGVtZW50XG4gICAgICAgKiBAcGFyYW0ge2pxTGl0ZX0gbWFpblBhZ2VcbiAgICAgICAqIEBwYXJhbSB7anFMaXRlfSBtZW51UGFnZVxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLndpZHRoIFwid2lkdGhcIiBzdHlsZSB2YWx1ZVxuICAgICAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLmlzUmlnaHRcbiAgICAgICAqL1xuICAgICAgc2V0dXA6IGZ1bmN0aW9uKGVsZW1lbnQsIG1haW5QYWdlLCBtZW51UGFnZSwgb3B0aW9ucykge1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLmlzUmlnaHRcbiAgICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5pc09wZW5lZFxuICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMud2lkdGhcbiAgICAgICAqL1xuICAgICAgb25SZXNpemVkOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgICAgKi9cbiAgICAgIG9wZW5NZW51OiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAgICovXG4gICAgICBjbG9zZUNsb3NlOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKi9cbiAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMuZGlzdGFuY2VcbiAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLm1heERpc3RhbmNlXG4gICAgICAgKi9cbiAgICAgIHRyYW5zbGF0ZU1lbnU6IGZ1bmN0aW9uKG1haW5QYWdlLCBtZW51UGFnZSwgb3B0aW9ucykge1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBAcmV0dXJuIHtTbGlkaW5nTWVudUFuaW1hdG9yfVxuICAgICAgICovXG4gICAgICBjb3B5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPdmVycmlkZSBjb3B5IG1ldGhvZC4nKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59KSgpO1xuIiwiLyoqXG4gKiBAZWxlbWVudCBvbnMtc3BsaXQtdmlld1xuICogQGNhdGVnb3J5IHNwbGl0LXZpZXdcbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1EaXZpZGVzIHRoZSBzY3JlZW4gaW50byBhIGxlZnQgYW5kIHJpZ2h0IHNlY3Rpb24uWy9lbl1cbiAqICBbamFd55S76Z2i44KS5bem5Y+z44Gr5YiG5Ymy44GZ44KL44Kz44Oz44Od44O844ON44Oz44OI44Gn44GZ44CCWy9qYV1cbiAqIEBjb2RlcGVuIG5LcWZ2IHt3aWRlfVxuICogQGd1aWRlIFVzaW5nb25zc3BsaXR2aWV3Y29tcG9uZW50XG4gKiAgIFtlbl1Vc2luZyBvbnMtc3BsaXQtdmlldy5bL2VuXVxuICogICBbamFdb25zLXNwbGl0LXZpZXfjgrPjg7Pjg53jg7zjg43jg7Pjg4jjgpLkvb/jgYZbL2phXVxuICogQGd1aWRlIENhbGxpbmdDb21wb25lbnRBUElzZnJvbUphdmFTY3JpcHRcbiAqICAgW2VuXVVzaW5nIG5hdmlnYXRvciBmcm9tIEphdmFTY3JpcHRbL2VuXVxuICogICBbamFdSmF2YVNjcmlwdOOBi+OCieOCs+ODs+ODneODvOODjeODs+ODiOOCkuWRvOOBs+WHuuOBmVsvamFdXG4gKiBAZXhhbXBsZVxuICogPG9ucy1zcGxpdC12aWV3XG4gKiAgIHNlY29uZGFyeS1wYWdlPVwic2Vjb25kYXJ5Lmh0bWxcIlxuICogICBtYWluLXBhZ2U9XCJtYWluLmh0bWxcIlxuICogICBtYWluLXBhZ2Utd2lkdGg9XCI3MCVcIlxuICogICBjb2xsYXBzZT1cInBvcnRyYWl0XCI+XG4gKiA8L29ucy1zcGxpdC12aWV3PlxuICovXG5cbi8qKlxuICogQGV2ZW50IHVwZGF0ZVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1GaXJlZCB3aGVuIHRoZSBzcGxpdCB2aWV3IGlzIHVwZGF0ZWQuWy9lbl1cbiAqICAgW2phXXNwbGl0IHZpZXfjga7nirbmhYvjgYzmm7TmlrDjgZXjgozjgZ/pmpvjgavnmbrngavjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG4gKiAgIFtlbl1FdmVudCBvYmplY3QuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOOCquODluOCuOOCp+OCr+ODiOOBp+OBmeOAglsvamFdXG4gKiBAcGFyYW0ge09iamVjdH0gZXZlbnQuc3BsaXRWaWV3XG4gKiAgIFtlbl1TcGxpdCB2aWV3IG9iamVjdC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI44GM55m654Gr44GX44GfU3BsaXRWaWV344Kq44OW44K444Kn44Kv44OI44Gn44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXZlbnQuc2hvdWxkQ29sbGFwc2VcbiAqICAgW2VuXVRydWUgaWYgdGhlIHZpZXcgc2hvdWxkIGNvbGxhcHNlLlsvZW5dXG4gKiAgIFtqYV1jb2xsYXBzZeeKtuaFi+OBruWgtOWQiOOBq3RydWXjgavjgarjgorjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50LmN1cnJlbnRNb2RlXG4gKiAgIFtlbl1DdXJyZW50IG1vZGUuWy9lbl1cbiAqICAgW2phXeePvuWcqOOBruODouODvOODieWQjeOCkui/lOOBl+OBvuOBmeOAglwiY29sbGFwc2VcIuOBi1wic3BsaXRcIuOBi+OBruOBhOOBmuOCjOOBi+OBp+OBmeOAglsvamFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBldmVudC5zcGxpdFxuICogICBbZW5dQ2FsbCB0byBmb3JjZSBzcGxpdC5bL2VuXVxuICogICBbamFd44GT44Gu6Zai5pWw44KS5ZG844Gz5Ye644GZ44Go5by35Yi255qE44Grc3BsaXTjg6Ljg7zjg4njgavjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZXZlbnQuY29sbGFwc2VcbiAqICAgW2VuXUNhbGwgdG8gZm9yY2UgY29sbGFwc2UuWy9lbl1cbiAqICAgW2phXeOBk+OBrumWouaVsOOCkuWRvOOBs+WHuuOBmeOBqOW8t+WItueahOOBq2NvbGxhcHNl44Oi44O844OJ44Gr44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7TnVtYmVyfSBldmVudC53aWR0aFxuICogICBbZW5dQ3VycmVudCB3aWR0aC5bL2VuXVxuICogICBbamFd54++5Zyo44GuU3BsaXRWaWV344Gu5bmF44KS6L+U44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudC5vcmllbnRhdGlvblxuICogICBbZW5dQ3VycmVudCBvcmllbnRhdGlvbi5bL2VuXVxuICogICBbamFd54++5Zyo44Gu55S76Z2i44Gu44Kq44Oq44Ko44Oz44OG44O844K344On44Oz44KS6L+U44GX44G+44GZ44CCXCJwb3J0cmFpdFwi44GL44KC44GX44GP44GvXCJsYW5kc2NhcGVcIuOBp+OBmeOAgiBbL2phXVxuICovXG5cbi8qKlxuICogQGV2ZW50IHByZXNwbGl0XG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXUZpcmVkIGp1c3QgYmVmb3JlIHRoZSB2aWV3IGlzIHNwbGl0LlsvZW5dXG4gKiAgIFtqYV1zcGxpdOeKtuaFi+OBq+OCi+WJjeOBq+eZuueBq+OBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcbiAqICAgW2VuXUV2ZW50IG9iamVjdC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI44Kq44OW44K444Kn44Kv44OI44CCWy9qYV1cbiAqIEBwYXJhbSB7T2JqZWN0fSBldmVudC5zcGxpdFZpZXdcbiAqICAgW2VuXVNwbGl0IHZpZXcgb2JqZWN0LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jjgYznmbrngavjgZfjgZ9TcGxpdFZpZXfjgqrjg5bjgrjjgqfjgq/jg4jjgafjgZnjgIJbL2phXVxuICogQHBhcmFtIHtOdW1iZXJ9IGV2ZW50LndpZHRoXG4gKiAgIFtlbl1DdXJyZW50IHdpZHRoLlsvZW5dXG4gKiAgIFtqYV3nj77lnKjjga5TcGxpdFZpZXdu44Gu5bmF44Gn44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudC5vcmllbnRhdGlvblxuICogICBbZW5dQ3VycmVudCBvcmllbnRhdGlvbi5bL2VuXVxuICogICBbamFd54++5Zyo44Gu55S76Z2i44Gu44Kq44Oq44Ko44Oz44OG44O844K344On44Oz44KS6L+U44GX44G+44GZ44CCXCJwb3J0cmFpdFwi44KC44GX44GP44GvXCJsYW5kc2NhcGVcIuOBp+OBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAZXZlbnQgcG9zdHNwbGl0XG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXUZpcmVkIGp1c3QgYWZ0ZXIgdGhlIHZpZXcgaXMgc3BsaXQuWy9lbl1cbiAqICAgW2phXXNwbGl054q25oWL44Gr44Gq44Gj44Gf5b6M44Gr55m654Gr44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuICogICBbZW5dRXZlbnQgb2JqZWN0LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jjgqrjg5bjgrjjgqfjgq/jg4jjgIJbL2phXVxuICogQHBhcmFtIHtPYmplY3R9IGV2ZW50LnNwbGl0Vmlld1xuICogICBbZW5dU3BsaXQgdmlldyBvYmplY3QuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOOBjOeZuueBq+OBl+OBn1NwbGl0Vmlld+OCquODluOCuOOCp+OCr+ODiOOBp+OBmeOAglsvamFdXG4gKiBAcGFyYW0ge051bWJlcn0gZXZlbnQud2lkdGhcbiAqICAgW2VuXUN1cnJlbnQgd2lkdGguWy9lbl1cbiAqICAgW2phXeePvuWcqOOBrlNwbGl0Vmlld27jga7luYXjgafjgZnjgIJbL2phXVxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50Lm9yaWVudGF0aW9uXG4gKiAgIFtlbl1DdXJyZW50IG9yaWVudGF0aW9uLlsvZW5dXG4gKiAgIFtqYV3nj77lnKjjga7nlLvpnaLjga7jgqrjg6rjgqjjg7Pjg4bjg7zjgrfjg6fjg7PjgpLov5TjgZfjgb7jgZnjgIJcInBvcnRyYWl0XCLjgoLjgZfjgY/jga9cImxhbmRzY2FwZVwi44Gn44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBldmVudCBwcmVjb2xsYXBzZVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1GaXJlZCBqdXN0IGJlZm9yZSB0aGUgdmlldyBpcyBjb2xsYXBzZWQuWy9lbl1cbiAqICAgW2phXWNvbGxhcHNl54q25oWL44Gr44Gq44KL5YmN44Gr55m654Gr44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuICogICBbZW5dRXZlbnQgb2JqZWN0LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jjgqrjg5bjgrjjgqfjgq/jg4jjgIJbL2phXVxuICogQHBhcmFtIHtPYmplY3R9IGV2ZW50LnNwbGl0Vmlld1xuICogICBbZW5dU3BsaXQgdmlldyBvYmplY3QuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOOBjOeZuueBq+OBl+OBn1NwbGl0Vmlld+OCquODluOCuOOCp+OCr+ODiOOBp+OBmeOAglsvamFdXG4gKiBAcGFyYW0ge051bWJlcn0gZXZlbnQud2lkdGhcbiAqICAgW2VuXUN1cnJlbnQgd2lkdGguWy9lbl1cbiAqICAgW2phXeePvuWcqOOBrlNwbGl0Vmlld27jga7luYXjgafjgZnjgIJbL2phXVxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50Lm9yaWVudGF0aW9uXG4gKiAgIFtlbl1DdXJyZW50IG9yaWVudGF0aW9uLlsvZW5dXG4gKiAgIFtqYV3nj77lnKjjga7nlLvpnaLjga7jgqrjg6rjgqjjg7Pjg4bjg7zjgrfjg6fjg7PjgpLov5TjgZfjgb7jgZnjgIJcInBvcnRyYWl0XCLjgoLjgZfjgY/jga9cImxhbmRzY2FwZVwi44Gn44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBldmVudCBwb3N0Y29sbGFwc2VcbiAqIEBkZXNjcmlwdGlvblxuICogICBbZW5dRmlyZWQganVzdCBhZnRlciB0aGUgdmlldyBpcyBjb2xsYXBzZWQuWy9lbl1cbiAqICAgW2phXWNvbGxhcHNl54q25oWL44Gr44Gq44Gj44Gf5b6M44Gr55m654Gr44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuICogICBbZW5dRXZlbnQgb2JqZWN0LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jjgqrjg5bjgrjjgqfjgq/jg4jjgIJbL2phXVxuICogQHBhcmFtIHtPYmplY3R9IGV2ZW50LnNwbGl0Vmlld1xuICogICBbZW5dU3BsaXQgdmlldyBvYmplY3QuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOOBjOeZuueBq+OBl+OBn1NwbGl0Vmlld+OCquODluOCuOOCp+OCr+ODiOOBp+OBmeOAglsvamFdXG4gKiBAcGFyYW0ge051bWJlcn0gZXZlbnQud2lkdGhcbiAqICAgW2VuXUN1cnJlbnQgd2lkdGguWy9lbl1cbiAqICAgW2phXeePvuWcqOOBrlNwbGl0Vmlld27jga7luYXjgafjgZnjgIJbL2phXVxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50Lm9yaWVudGF0aW9uXG4gKiAgIFtlbl1DdXJyZW50IG9yaWVudGF0aW9uLlsvZW5dXG4gKiAgIFtqYV3nj77lnKjjga7nlLvpnaLjga7jgqrjg6rjgqjjg7Pjg4bjg7zjgrfjg6fjg7PjgpLov5TjgZfjgb7jgZnjgIJcInBvcnRyYWl0XCLjgoLjgZfjgY/jga9cImxhbmRzY2FwZVwi44Gn44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgdmFyXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXVZhcmlhYmxlIG5hbWUgdG8gcmVmZXIgdGhpcyBzcGxpdCB2aWV3LlsvZW5dXG4gKiAgIFtqYV3jgZPjga7jgrnjg5fjg6rjg4Pjg4jjg5Pjg6Xjg7zjgrPjg7Pjg53jg7zjg43jg7Pjg4jjgpLlj4LnhafjgZnjgovjgZ/jgoHjga7lkI3liY3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBtYWluLXBhZ2VcbiAqIEBpbml0b25seVxuICogQHR5cGUge1N0cmluZ31cbiAqIEBkZXNjcmlwdGlvblxuICogICBbZW5dVGhlIHVybCBvZiB0aGUgcGFnZSBvbiB0aGUgcmlnaHQuWy9lbl1cbiAqICAgW2phXeWPs+WBtOOBq+ihqOekuuOBmeOCi+ODmuODvOOCuOOBrlVSTOOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIG1haW4tcGFnZS13aWR0aFxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7TnVtYmVyfVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1NYWluIHBhZ2Ugd2lkdGggcGVyY2VudGFnZS4gVGhlIHNlY29uZGFyeSBwYWdlIHdpZHRoIHdpbGwgYmUgdGhlIHJlbWFpbmluZyBwZXJjZW50YWdlLlsvZW5dXG4gKiAgIFtqYV3lj7PlgbTjga7jg5rjg7zjgrjjga7luYXjgpLjg5Hjg7zjgrvjg7Pjg4jljZjkvY3jgafmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBzZWNvbmRhcnktcGFnZVxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7U3RyaW5nfVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1UaGUgdXJsIG9mIHRoZSBwYWdlIG9uIHRoZSBsZWZ0LlsvZW5dXG4gKiAgIFtqYV3lt6blgbTjgavooajnpLrjgZnjgovjg5rjg7zjgrjjga5VUkzjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBjb2xsYXBzZVxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7U3RyaW5nfVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1cbiAqICAgICBTcGVjaWZ5IHRoZSBjb2xsYXBzZSBiZWhhdmlvci4gVmFsaWQgdmFsdWVzIGFyZSBwb3J0cmFpdCwgbGFuZHNjYXBlLCB3aWR0aCAjcHggb3IgYSBtZWRpYSBxdWVyeS5cbiAqICAgICBcInBvcnRyYWl0XCIgb3IgXCJsYW5kc2NhcGVcIiBtZWFucyB0aGUgdmlldyB3aWxsIGNvbGxhcHNlIHdoZW4gZGV2aWNlIGlzIGluIGxhbmRzY2FwZSBvciBwb3J0cmFpdCBvcmllbnRhdGlvbi5cbiAqICAgICBcIndpZHRoICNweFwiIG1lYW5zIHRoZSB2aWV3IHdpbGwgY29sbGFwc2Ugd2hlbiB0aGUgd2luZG93IHdpZHRoIGlzIHNtYWxsZXIgdGhhbiB0aGUgc3BlY2lmaWVkICNweC5cbiAqICAgICBJZiB0aGUgdmFsdWUgaXMgYSBtZWRpYSBxdWVyeSwgdGhlIHZpZXcgd2lsbCBjb2xsYXBzZSB3aGVuIHRoZSBtZWRpYSBxdWVyeSBpcyB0cnVlLlxuICogICBbL2VuXVxuICogICBbamFdXG4gKiAgICAg5bem5YG044Gu44Oa44O844K444KS6Z2e6KGo56S644Gr44GZ44KL5p2h5Lu244KS5oyH5a6a44GX44G+44GZ44CCcG9ydHJhaXQsIGxhbmRzY2FwZeOAgXdpZHRoICNweOOCguOBl+OBj+OBr+ODoeODh+OCo+OCouOCr+OCqOODquOBruaMh+WumuOBjOWPr+iDveOBp+OBmeOAglxuICogICAgIHBvcnRyYWl044KC44GX44GP44GvbGFuZHNjYXBl44KS5oyH5a6a44GZ44KL44Go44CB44OH44OQ44Kk44K544Gu55S76Z2i44GM57im5ZCR44GN44KC44GX44GP44Gv5qiq5ZCR44GN44Gr44Gq44Gj44Gf5pmC44Gr6YGp55So44GV44KM44G+44GZ44CCXG4gKiAgICAgd2lkdGggI3B444KS5oyH5a6a44GZ44KL44Go44CB55S76Z2i44GM5oyH5a6a44GX44Gf5qiq5bmF44KI44KK44KC55+t44GE5aC05ZCI44Gr6YGp55So44GV44KM44G+44GZ44CCXG4gKiAgICAg44Oh44OH44Kj44Ki44Kv44Ko44Oq44KS5oyH5a6a44GZ44KL44Go44CB5oyH5a6a44GX44Gf44Kv44Ko44Oq44Gr6YGp5ZCI44GX44Gm44GE44KL5aC05ZCI44Gr6YGp55So44GV44KM44G+44GZ44CCXG4gKiAgIFsvamFdXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIG9ucy11cGRhdGVcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIHRoZSBcInVwZGF0ZVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXVwidXBkYXRlXCLjgqTjg5njg7Pjg4jjgYznmbrngavjgZXjgozjgZ/mmYLjga7mjJnli5XjgpLni6zoh6rjgavmjIflrprjgafjgY3jgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBvbnMtcHJlc3BsaXRcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIHRoZSBcInByZXNwbGl0XCIgZXZlbnQgaXMgZmlyZWQuWy9lbl1cbiAqICBbamFdXCJwcmVzcGxpdFwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLXByZWNvbGxhcHNlXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtFeHByZXNzaW9ufVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXUFsbG93cyB5b3UgdG8gc3BlY2lmeSBjdXN0b20gYmVoYXZpb3Igd2hlbiB0aGUgXCJwcmVjb2xsYXBzZVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXVwicHJlY29sbGFwc2VcIuOCpOODmeODs+ODiOOBjOeZuueBq+OBleOCjOOBn+aZguOBruaMmeWLleOCkueLrOiHquOBq+aMh+WumuOBp+OBjeOBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIG9ucy1wb3N0c3BsaXRcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIHRoZSBcInBvc3RzcGxpdFwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXVwicG9zdHNwbGl0XCLjgqTjg5njg7Pjg4jjgYznmbrngavjgZXjgozjgZ/mmYLjga7mjJnli5XjgpLni6zoh6rjgavmjIflrprjgafjgY3jgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBvbnMtcG9zdGNvbGxhcHNlXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtFeHByZXNzaW9ufVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXUFsbG93cyB5b3UgdG8gc3BlY2lmeSBjdXN0b20gYmVoYXZpb3Igd2hlbiB0aGUgXCJwb3N0Y29sbGFwc2VcIiBldmVudCBpcyBmaXJlZC5bL2VuXVxuICogIFtqYV1cInBvc3Rjb2xsYXBzZVwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWluaXRcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIGEgcGFnZSdzIFwiaW5pdFwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXeODmuODvOOCuOOBrlwiaW5pdFwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLXNob3dcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIGEgcGFnZSdzIFwic2hvd1wiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXeODmuODvOOCuOOBrlwic2hvd1wi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWhpZGVcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIGEgcGFnZSdzIFwiaGlkZVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXeODmuODvOOCuOOBrlwiaGlkZVwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWRlc3Ryb3lcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIGEgcGFnZSdzIFwiZGVzdHJveVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXeODmuODvOOCuOOBrlwiZGVzdHJveVwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBtZXRob2Qgc2V0TWFpblBhZ2VcbiAqIEBzaWduYXR1cmUgc2V0TWFpblBhZ2UocGFnZVVybClcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYWdlVXJsXG4gKiAgIFtlbl1QYWdlIFVSTC4gQ2FuIGJlIGVpdGhlciBhbiBIVE1MIGRvY3VtZW50IG9yIGFuIDxvbnMtdGVtcGxhdGU+LlsvZW5dXG4gKiAgIFtqYV1wYWdl44GuVVJM44GL44CBb25zLXRlbXBsYXRl44Gn5a6j6KiA44GX44Gf44OG44Oz44OX44Os44O844OI44GuaWTlsZ7mgKfjga7lgKTjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1TaG93IHRoZSBwYWdlIHNwZWNpZmllZCBpbiBwYWdlVXJsIGluIHRoZSByaWdodCBzZWN0aW9uWy9lbl1cbiAqICAgW2phXeaMh+WumuOBl+OBn1VSTOOCkuODoeOCpOODs+ODmuODvOOCuOOCkuiqreOBv+i+vOOBv+OBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAbWV0aG9kIHNldFNlY29uZGFyeVBhZ2VcbiAqIEBzaWduYXR1cmUgc2V0U2Vjb25kYXJ5UGFnZShwYWdlVXJsKVxuICogQHBhcmFtIHtTdHJpbmd9IHBhZ2VVcmxcbiAqICAgW2VuXVBhZ2UgVVJMLiBDYW4gYmUgZWl0aGVyIGFuIEhUTUwgZG9jdW1lbnQgb3IgYW4gPG9ucy10ZW1wbGF0ZT4uWy9lbl1cbiAqICAgW2phXXBhZ2Xjga5VUkzjgYvjgIFvbnMtdGVtcGxhdGXjgaflrqPoqIDjgZfjgZ/jg4bjg7Pjg5fjg6zjg7zjg4jjga5pZOWxnuaAp+OBruWApOOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXVNob3cgdGhlIHBhZ2Ugc3BlY2lmaWVkIGluIHBhZ2VVcmwgaW4gdGhlIGxlZnQgc2VjdGlvblsvZW5dXG4gKiAgIFtqYV3mjIflrprjgZfjgZ9VUkzjgpLlt6bjga7jg5rjg7zjgrjjga7oqq3jgb/ovrzjgb/jgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQG1ldGhvZCB1cGRhdGVcbiAqIEBzaWduYXR1cmUgdXBkYXRlKClcbiAqIEBkZXNjcmlwdGlvblxuICogICBbZW5dVHJpZ2dlciBhbiAndXBkYXRlJyBldmVudCBhbmQgdHJ5IHRvIGRldGVybWluZSBpZiB0aGUgc3BsaXQgYmVoYXZpb3Igc2hvdWxkIGJlIGNoYW5nZWQuWy9lbl1cbiAqICAgW2phXXNwbGl044Oi44O844OJ44KS5aSJ44GI44KL44G544GN44GL44Gp44GG44GL44KS5Yik5pat44GZ44KL44Gf44KB44GuJ3VwZGF0ZSfjgqTjg5njg7Pjg4jjgpLnmbrngavjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQG1ldGhvZCBvblxuICogQHNpZ25hdHVyZSBvbihldmVudE5hbWUsIGxpc3RlbmVyKVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1BZGQgYW4gZXZlbnQgbGlzdGVuZXIuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOODquOCueODiuODvOOCkui/veWKoOOBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lXG4gKiAgIFtlbl1OYW1lIG9mIHRoZSBldmVudC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI5ZCN44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXG4gKiAgIFtlbl1GdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZC5bL2VuXVxuICogICBbamFd44GT44Gu44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf6Zqb44Gr5ZG844Gz5Ye644GV44KM44KL6Zai5pWw44Kq44OW44K444Kn44Kv44OI44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBtZXRob2Qgb25jZVxuICogQHNpZ25hdHVyZSBvbmNlKGV2ZW50TmFtZSwgbGlzdGVuZXIpXG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRoYXQncyBvbmx5IHRyaWdnZXJlZCBvbmNlLlsvZW5dXG4gKiAgW2phXeS4gOW6puOBoOOBkeWRvOOBs+WHuuOBleOCjOOCi+OCpOODmeODs+ODiOODquOCueODiuODvOOCkui/veWKoOOBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lXG4gKiAgIFtlbl1OYW1lIG9mIHRoZSBldmVudC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI5ZCN44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXG4gKiAgIFtlbl1GdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI44GM55m654Gr44GX44Gf6Zqb44Gr5ZG844Gz5Ye644GV44KM44KL6Zai5pWw44Kq44OW44K444Kn44Kv44OI44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBtZXRob2Qgb2ZmXG4gKiBAc2lnbmF0dXJlIG9mZihldmVudE5hbWUsIFtsaXN0ZW5lcl0pXG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dUmVtb3ZlIGFuIGV2ZW50IGxpc3RlbmVyLiBJZiB0aGUgbGlzdGVuZXIgaXMgbm90IHNwZWNpZmllZCBhbGwgbGlzdGVuZXJzIGZvciB0aGUgZXZlbnQgdHlwZSB3aWxsIGJlIHJlbW92ZWQuWy9lbl1cbiAqICBbamFd44Kk44OZ44Oz44OI44Oq44K544OK44O844KS5YmK6Zmk44GX44G+44GZ44CC44KC44GX44Kk44OZ44Oz44OI44Oq44K544OK44O844KS5oyH5a6a44GX44Gq44GL44Gj44Gf5aC05ZCI44Gr44Gv44CB44Gd44Gu44Kk44OZ44Oz44OI44Gr57SQ44Gl44GP5YWo44Gm44Gu44Kk44OZ44Oz44OI44Oq44K544OK44O844GM5YmK6Zmk44GV44KM44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAqICAgW2VuXU5hbWUgb2YgdGhlIGV2ZW50LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jlkI3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAqICAgW2VuXUZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlsvZW5dXG4gKiAgIFtqYV3liYrpmaTjgZnjgovjgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICB2YXIgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ29uc2VuJyk7XG5cbiAgbW9kdWxlLmRpcmVjdGl2ZSgnb25zU3BsaXRWaWV3JywgZnVuY3Rpb24oJGNvbXBpbGUsIFNwbGl0VmlldywgJG9uc2VuKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIHJlcGxhY2U6IGZhbHNlLFxuICAgICAgdHJhbnNjbHVkZTogZmFsc2UsXG4gICAgICBzY29wZTogdHJ1ZSxcblxuICAgICAgY29tcGlsZTogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgdmFyIG1haW5QYWdlID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcubWFpbi1wYWdlJyksXG4gICAgICAgICAgICBzZWNvbmRhcnlQYWdlID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuc2Vjb25kYXJ5LXBhZ2UnKTtcblxuICAgICAgICBpZiAobWFpblBhZ2UpIHtcbiAgICAgICAgICB2YXIgbWFpbkh0bWwgPSBhbmd1bGFyLmVsZW1lbnQobWFpblBhZ2UpLnJlbW92ZSgpLmh0bWwoKS50cmltKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2Vjb25kYXJ5UGFnZSkge1xuICAgICAgICAgIHZhciBzZWNvbmRhcnlIdG1sID0gYW5ndWxhci5lbGVtZW50KHNlY29uZGFyeVBhZ2UpLnJlbW92ZSgpLmh0bWwoKS50cmltKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgZWxlbWVudC5hcHBlbmQoYW5ndWxhci5lbGVtZW50KCc8ZGl2PjwvZGl2PicpLmFkZENsYXNzKCdvbnNlbi1zcGxpdC12aWV3X19zZWNvbmRhcnkgZnVsbC1zY3JlZW4gb25zLXNwbGl0LXZpZXctaW5uZXInKSk7XG4gICAgICAgICAgZWxlbWVudC5hcHBlbmQoYW5ndWxhci5lbGVtZW50KCc8ZGl2PjwvZGl2PicpLmFkZENsYXNzKCdvbnNlbi1zcGxpdC12aWV3X19tYWluIGZ1bGwtc2NyZWVuIG9ucy1zcGxpdC12aWV3LWlubmVyJykpO1xuXG4gICAgICAgICAgdmFyIHNwbGl0VmlldyA9IG5ldyBTcGxpdFZpZXcoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKTtcblxuICAgICAgICAgIGlmIChtYWluSHRtbCAmJiAhYXR0cnMubWFpblBhZ2UpIHtcbiAgICAgICAgICAgIHNwbGl0Vmlldy5fYXBwZW5kTWFpblBhZ2UobWFpbkh0bWwpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWNvbmRhcnlIdG1sICYmICFhdHRycy5zZWNvbmRhcnlQYWdlKSB7XG4gICAgICAgICAgICBzcGxpdFZpZXcuX2FwcGVuZFNlY29uZFBhZ2Uoc2Vjb25kYXJ5SHRtbCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgJG9uc2VuLmRlY2xhcmVWYXJBdHRyaWJ1dGUoYXR0cnMsIHNwbGl0Vmlldyk7XG4gICAgICAgICAgJG9uc2VuLnJlZ2lzdGVyRXZlbnRIYW5kbGVycyhzcGxpdFZpZXcsICd1cGRhdGUgcHJlc3BsaXQgcHJlY29sbGFwc2UgcG9zdHNwbGl0IHBvc3Rjb2xsYXBzZSBpbml0IHNob3cgaGlkZSBkZXN0cm95Jyk7XG5cbiAgICAgICAgICBlbGVtZW50LmRhdGEoJ29ucy1zcGxpdC12aWV3Jywgc3BsaXRWaWV3KTtcblxuICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNwbGl0Vmlldy5fZXZlbnRzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgZWxlbWVudC5kYXRhKCdvbnMtc3BsaXQtdmlldycsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAkb25zZW4uZmlyZUNvbXBvbmVudEV2ZW50KGVsZW1lbnRbMF0sICdpbml0Jyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59KSgpO1xuIiwiLypcbkNvcHlyaWdodCAyMDEzLTIwMTUgQVNJQUwgQ09SUE9SQVRJT05cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuKi9cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpLmZhY3RvcnkoJ1NwbGl0dGVyQ29udGVudCcsIGZ1bmN0aW9uKCRvbnNlbiwgJGNvbXBpbGUpIHtcblxuICAgIHZhciBTcGxpdHRlckNvbnRlbnQgPSBDbGFzcy5leHRlbmQoe1xuXG4gICAgICBpbml0OiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuX3Njb3BlID0gc2NvcGU7XG4gICAgICAgIHRoaXMuX2F0dHJzID0gYXR0cnM7XG5cbiAgICAgICAgdGhpcy5sb2FkID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICB0aGlzLl9wYWdlU2NvcGUgJiYgdGhpcy5fcGFnZVNjb3BlLiRkZXN0cm95KCk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRbMF0ubG9hZCguLi5hcmdzKTtcbiAgICAgICAgfTtcbiAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIHRoaXMuX2Rlc3Ryb3kuYmluZCh0aGlzKSk7XG4gICAgICB9LFxuXG4gICAgICBfbGluazogZnVuY3Rpb24oZnJhZ21lbnQsIGRvbmUpIHtcbiAgICAgICAgdGhpcy5fcGFnZVNjb3BlID0gdGhpcy5fc2NvcGUuJG5ldygpO1xuICAgICAgICAkY29tcGlsZShmcmFnbWVudCkodGhpcy5fcGFnZVNjb3BlKTtcblxuICAgICAgICB0aGlzLl9wYWdlU2NvcGUuJGV2YWxBc3luYygoKSA9PiBkb25lKGZyYWdtZW50KSk7XG4gICAgICB9LFxuXG4gICAgICBfZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZW1pdCgnZGVzdHJveScpO1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gdGhpcy5fc2NvcGUgPSB0aGlzLl9hdHRycyA9IHRoaXMubG9hZCA9IHRoaXMuX3BhZ2VTY29wZSA9IG51bGw7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBNaWNyb0V2ZW50Lm1peGluKFNwbGl0dGVyQ29udGVudCk7XG4gICAgJG9uc2VuLmRlcml2ZVByb3BlcnRpZXNGcm9tRWxlbWVudChTcGxpdHRlckNvbnRlbnQsIFsncGFnZSddKTtcblxuICAgIHJldHVybiBTcGxpdHRlckNvbnRlbnQ7XG4gIH0pO1xufSkoKTtcbiIsIi8qXG5Db3B5cmlnaHQgMjAxMy0yMDE1IEFTSUFMIENPUlBPUkFUSU9OXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbiovXG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKS5mYWN0b3J5KCdTcGxpdHRlclNpZGUnLCBmdW5jdGlvbigkb25zZW4sICRjb21waWxlKSB7XG5cbiAgICB2YXIgU3BsaXR0ZXJTaWRlID0gQ2xhc3MuZXh0ZW5kKHtcblxuICAgICAgaW5pdDogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLl9zY29wZSA9IHNjb3BlO1xuICAgICAgICB0aGlzLl9hdHRycyA9IGF0dHJzO1xuXG4gICAgICAgIHRoaXMuX2NsZWFyRGVyaXZpbmdNZXRob2RzID0gJG9uc2VuLmRlcml2ZU1ldGhvZHModGhpcywgdGhpcy5fZWxlbWVudFswXSwgW1xuICAgICAgICAgICdvcGVuJywgJ2Nsb3NlJywgJ3RvZ2dsZSdcbiAgICAgICAgXSk7XG5cbiAgICAgICAgdGhpcy5sb2FkID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICB0aGlzLl9wYWdlU2NvcGUgJiYgdGhpcy5fcGFnZVNjb3BlLiRkZXN0cm95KCk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRbMF0ubG9hZCguLi5hcmdzKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9jbGVhckRlcml2aW5nRXZlbnRzID0gJG9uc2VuLmRlcml2ZUV2ZW50cyh0aGlzLCBlbGVtZW50WzBdLCBbXG4gICAgICAgICAgJ21vZGVjaGFuZ2UnLCAncHJlb3BlbicsICdwcmVjbG9zZScsICdwb3N0b3BlbicsICdwb3N0Y2xvc2UnXG4gICAgICAgIF0sIGRldGFpbCA9PiBkZXRhaWwuc2lkZSA/IGFuZ3VsYXIuZXh0ZW5kKGRldGFpbCwge3NpZGU6IHRoaXN9KSA6IGRldGFpbCk7XG5cbiAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIHRoaXMuX2Rlc3Ryb3kuYmluZCh0aGlzKSk7XG4gICAgICB9LFxuXG4gICAgICBfbGluazogZnVuY3Rpb24oZnJhZ21lbnQsIGRvbmUpIHtcbiAgICAgICAgdmFyIGxpbmsgPSAkY29tcGlsZShmcmFnbWVudCk7XG4gICAgICAgIHRoaXMuX3BhZ2VTY29wZSA9IHRoaXMuX3Njb3BlLiRuZXcoKTtcbiAgICAgICAgbGluayh0aGlzLl9wYWdlU2NvcGUpO1xuXG4gICAgICAgIHRoaXMuX3BhZ2VTY29wZS4kZXZhbEFzeW5jKCgpID0+IGRvbmUoZnJhZ21lbnQpKTtcbiAgICAgIH0sXG5cbiAgICAgIF9kZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdkZXN0cm95Jyk7XG5cbiAgICAgICAgdGhpcy5fY2xlYXJEZXJpdmluZ01ldGhvZHMoKTtcbiAgICAgICAgdGhpcy5fY2xlYXJEZXJpdmluZ0V2ZW50cygpO1xuXG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSB0aGlzLl9zY29wZSA9IHRoaXMuX2F0dHJzID0gdGhpcy5sb2FkID0gdGhpcy5fcGFnZVNjb3BlID0gbnVsbDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIE1pY3JvRXZlbnQubWl4aW4oU3BsaXR0ZXJTaWRlKTtcbiAgICAkb25zZW4uZGVyaXZlUHJvcGVydGllc0Zyb21FbGVtZW50KFNwbGl0dGVyU2lkZSwgWydwYWdlJywgJ21vZGUnLCAnaXNPcGVuJ10pO1xuXG4gICAgcmV0dXJuIFNwbGl0dGVyU2lkZTtcbiAgfSk7XG59KSgpO1xuIiwiLyoqXG4gKiBAZWxlbWVudCBvbnMtc3BsaXR0ZXJcbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgdmFyXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXVZhcmlhYmxlIG5hbWUgdG8gcmVmZXIgdGhpcyBzcGxpdCB2aWV3LlsvZW5dXG4gKiAgIFtqYV3jgZPjga7jgrnjg5fjg6rjg4Pjg4jjg5Pjg6Xjg7zjgrPjg7Pjg53jg7zjg43jg7Pjg4jjgpLlj4LnhafjgZnjgovjgZ/jgoHjga7lkI3liY3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBvbnMtZGVzdHJveVxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BbGxvd3MgeW91IHRvIHNwZWNpZnkgY3VzdG9tIGJlaGF2aW9yIHdoZW4gdGhlIFwiZGVzdHJveVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXVwiZGVzdHJveVwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBtZXRob2Qgb25cbiAqIEBzaWduYXR1cmUgb24oZXZlbnROYW1lLCBsaXN0ZW5lcilcbiAqIEBkZXNjcmlwdGlvblxuICogICBbZW5dQWRkIGFuIGV2ZW50IGxpc3RlbmVyLlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgpLov73liqDjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZVxuICogICBbZW5dTmFtZSBvZiB0aGUgZXZlbnQuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOWQjeOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICogICBbZW5dRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuWy9lbl1cbiAqICAgW2phXeOBk+OBruOCpOODmeODs+ODiOOBjOeZuueBq+OBleOCjOOBn+mam+OBq+WRvOOBs+WHuuOBleOCjOOCi+mWouaVsOOCquODluOCuOOCp+OCr+ODiOOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAbWV0aG9kIG9uY2VcbiAqIEBzaWduYXR1cmUgb25jZShldmVudE5hbWUsIGxpc3RlbmVyKVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXUFkZCBhbiBldmVudCBsaXN0ZW5lciB0aGF0J3Mgb25seSB0cmlnZ2VyZWQgb25jZS5bL2VuXVxuICogIFtqYV3kuIDluqbjgaDjgZHlkbzjgbPlh7rjgZXjgozjgovjgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgpLov73liqDjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZVxuICogICBbZW5dTmFtZSBvZiB0aGUgZXZlbnQuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOWQjeOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICogICBbZW5dRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOOBjOeZuueBq+OBl+OBn+mam+OBq+WRvOOBs+WHuuOBleOCjOOCi+mWouaVsOOCquODluOCuOOCp+OCr+ODiOOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAbWV0aG9kIG9mZlxuICogQHNpZ25hdHVyZSBvZmYoZXZlbnROYW1lLCBbbGlzdGVuZXJdKVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXVJlbW92ZSBhbiBldmVudCBsaXN0ZW5lci4gSWYgdGhlIGxpc3RlbmVyIGlzIG5vdCBzcGVjaWZpZWQgYWxsIGxpc3RlbmVycyBmb3IgdGhlIGV2ZW50IHR5cGUgd2lsbCBiZSByZW1vdmVkLlsvZW5dXG4gKiAgW2phXeOCpOODmeODs+ODiOODquOCueODiuODvOOCkuWJiumZpOOBl+OBvuOBmeOAguOCguOBl+OCpOODmeODs+ODiOODquOCueODiuODvOOCkuaMh+WumuOBl+OBquOBi+OBo+OBn+WgtOWQiOOBq+OBr+OAgeOBneOBruOCpOODmeODs+ODiOOBq+e0kOOBpeOBj+WFqOOBpuOBruOCpOODmeODs+ODiOODquOCueODiuODvOOBjOWJiumZpOOBleOCjOOBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lXG4gKiAgIFtlbl1OYW1lIG9mIHRoZSBldmVudC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI5ZCN44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXG4gKiAgIFtlbl1GdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZC5bL2VuXVxuICogICBbamFd5YmK6Zmk44GZ44KL44Kk44OZ44Oz44OI44Oq44K544OK44O844KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKS5kaXJlY3RpdmUoJ29uc1NwbGl0dGVyJywgZnVuY3Rpb24oJGNvbXBpbGUsIFNwbGl0dGVyLCAkb25zZW4pIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIHNjb3BlOiB0cnVlLFxuXG4gICAgICBjb21waWxlOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xuICAgICAgICBDdXN0b21FbGVtZW50cy51cGdyYWRlKGVsZW1lbnRbMF0pO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICBDdXN0b21FbGVtZW50cy51cGdyYWRlKGVsZW1lbnRbMF0pO1xuXG4gICAgICAgICAgdmFyIHNwbGl0dGVyID0gbmV3IFNwbGl0dGVyKHNjb3BlLCBlbGVtZW50LCBhdHRycyk7XG5cbiAgICAgICAgICAkb25zZW4uZGVjbGFyZVZhckF0dHJpYnV0ZShhdHRycywgc3BsaXR0ZXIpO1xuICAgICAgICAgICRvbnNlbi5yZWdpc3RlckV2ZW50SGFuZGxlcnMoc3BsaXR0ZXIsICdkZXN0cm95Jyk7XG5cbiAgICAgICAgICBlbGVtZW50LmRhdGEoJ29ucy1zcGxpdHRlcicsIHNwbGl0dGVyKTtcblxuICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNwbGl0dGVyLl9ldmVudHMgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBlbGVtZW50LmRhdGEoJ29ucy1zcGxpdHRlcicsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAkb25zZW4uZmlyZUNvbXBvbmVudEV2ZW50KGVsZW1lbnRbMF0sICdpbml0Jyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59KSgpO1xuIiwiLyoqXG4gKiBAZWxlbWVudCBvbnMtc3dpdGNoXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIHZhclxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7U3RyaW5nfVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1WYXJpYWJsZSBuYW1lIHRvIHJlZmVyIHRoaXMgc3dpdGNoLlsvZW5dXG4gKiAgIFtqYV1KYXZhU2NyaXB044GL44KJ5Y+C54Wn44GZ44KL44Gf44KB44Gu5aSJ5pWw5ZCN44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBtZXRob2Qgb25cbiAqIEBzaWduYXR1cmUgb24oZXZlbnROYW1lLCBsaXN0ZW5lcilcbiAqIEBkZXNjcmlwdGlvblxuICogICBbZW5dQWRkIGFuIGV2ZW50IGxpc3RlbmVyLlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgpLov73liqDjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZVxuICogICBbZW5dTmFtZSBvZiB0aGUgZXZlbnQuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOWQjeOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICogICBbZW5dRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuWy9lbl1cbiAqICAgW2phXeOBk+OBruOCpOODmeODs+ODiOOBjOeZuueBq+OBleOCjOOBn+mam+OBq+WRvOOBs+WHuuOBleOCjOOCi+mWouaVsOOCquODluOCuOOCp+OCr+ODiOOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAbWV0aG9kIG9uY2VcbiAqIEBzaWduYXR1cmUgb25jZShldmVudE5hbWUsIGxpc3RlbmVyKVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXUFkZCBhbiBldmVudCBsaXN0ZW5lciB0aGF0J3Mgb25seSB0cmlnZ2VyZWQgb25jZS5bL2VuXVxuICogIFtqYV3kuIDluqbjgaDjgZHlkbzjgbPlh7rjgZXjgozjgovjgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgpLov73liqDjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZVxuICogICBbZW5dTmFtZSBvZiB0aGUgZXZlbnQuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOWQjeOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICogICBbZW5dRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOOBjOeZuueBq+OBl+OBn+mam+OBq+WRvOOBs+WHuuOBleOCjOOCi+mWouaVsOOCquODluOCuOOCp+OCr+ODiOOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAbWV0aG9kIG9mZlxuICogQHNpZ25hdHVyZSBvZmYoZXZlbnROYW1lLCBbbGlzdGVuZXJdKVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXVJlbW92ZSBhbiBldmVudCBsaXN0ZW5lci4gSWYgdGhlIGxpc3RlbmVyIGlzIG5vdCBzcGVjaWZpZWQgYWxsIGxpc3RlbmVycyBmb3IgdGhlIGV2ZW50IHR5cGUgd2lsbCBiZSByZW1vdmVkLlsvZW5dXG4gKiAgW2phXeOCpOODmeODs+ODiOODquOCueODiuODvOOCkuWJiumZpOOBl+OBvuOBmeOAguOCguOBl+OCpOODmeODs+ODiOODquOCueODiuODvOOCkuaMh+WumuOBl+OBquOBi+OBo+OBn+WgtOWQiOOBq+OBr+OAgeOBneOBruOCpOODmeODs+ODiOOBq+e0kOOBpeOBj+WFqOOBpuOBruOCpOODmeODs+ODiOODquOCueODiuODvOOBjOWJiumZpOOBleOCjOOBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lXG4gKiAgIFtlbl1OYW1lIG9mIHRoZSBldmVudC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI5ZCN44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXG4gKiAgIFtlbl1GdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZC5bL2VuXVxuICogICBbamFd5YmK6Zmk44GZ44KL44Kk44OZ44Oz44OI44Oq44K544OK44O844KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4oZnVuY3Rpb24oKXtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpLmRpcmVjdGl2ZSgnb25zU3dpdGNoJywgZnVuY3Rpb24oJG9uc2VuLCBTd2l0Y2hWaWV3KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICByZXBsYWNlOiBmYWxzZSxcbiAgICAgIHNjb3BlOiB0cnVlLFxuXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgQ3VzdG9tRWxlbWVudHMudXBncmFkZShlbGVtZW50WzBdKTtcblxuICAgICAgICBpZiAoYXR0cnMubmdDb250cm9sbGVyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIGVsZW1lbnQgY2FuXFwndCBhY2NlcHQgbmctY29udHJvbGxlciBkaXJlY3RpdmUuJyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3dpdGNoVmlldyA9IG5ldyBTd2l0Y2hWaWV3KGVsZW1lbnQsIHNjb3BlLCBhdHRycyk7XG4gICAgICAgICRvbnNlbi5hZGRNb2RpZmllck1ldGhvZHNGb3JDdXN0b21FbGVtZW50cyhzd2l0Y2hWaWV3LCBlbGVtZW50KTtcblxuICAgICAgICAkb25zZW4uZGVjbGFyZVZhckF0dHJpYnV0ZShhdHRycywgc3dpdGNoVmlldyk7XG4gICAgICAgIGVsZW1lbnQuZGF0YSgnb25zLXN3aXRjaCcsIHN3aXRjaFZpZXcpO1xuXG4gICAgICAgICRvbnNlbi5jbGVhbmVyLm9uRGVzdHJveShzY29wZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc3dpdGNoVmlldy5fZXZlbnRzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICRvbnNlbi5yZW1vdmVNb2RpZmllck1ldGhvZHMoc3dpdGNoVmlldyk7XG4gICAgICAgICAgZWxlbWVudC5kYXRhKCdvbnMtc3dpdGNoJywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAkb25zZW4uY2xlYXJDb21wb25lbnQoe1xuICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgIHNjb3BlOiBzY29wZSxcbiAgICAgICAgICAgIGF0dHJzOiBhdHRyc1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGVsZW1lbnQgPSBhdHRycyA9IHNjb3BlID0gbnVsbDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJG9uc2VuLmZpcmVDb21wb25lbnRFdmVudChlbGVtZW50WzBdLCAnaW5pdCcpO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xufSkoKTtcbiIsIi8qXG5Db3B5cmlnaHQgMjAxMy0yMDE1IEFTSUFMIENPUlBPUkFUSU9OXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbiovXG5cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKTtcblxuICBtb2R1bGUudmFsdWUoJ1RhYmJhck5vbmVBbmltYXRvcicsIG9ucy5faW50ZXJuYWwuVGFiYmFyTm9uZUFuaW1hdG9yKTtcbiAgbW9kdWxlLnZhbHVlKCdUYWJiYXJGYWRlQW5pbWF0b3InLCBvbnMuX2ludGVybmFsLlRhYmJhckZhZGVBbmltYXRvcik7XG4gIG1vZHVsZS52YWx1ZSgnVGFiYmFyU2xpZGVBbmltYXRvcicsIG9ucy5faW50ZXJuYWwuVGFiYmFyU2xpZGVBbmltYXRvcik7XG5cbiAgbW9kdWxlLmZhY3RvcnkoJ1RhYmJhclZpZXcnLCBmdW5jdGlvbigkb25zZW4sICRjb21waWxlLCAkcGFyc2UpIHtcbiAgICB2YXIgVGFiYmFyVmlldyA9IENsYXNzLmV4dGVuZCh7XG5cbiAgICAgIGluaXQ6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICBpZiAoZWxlbWVudFswXS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAnb25zLXRhYmJhcicpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wiZWxlbWVudFwiIHBhcmFtZXRlciBtdXN0IGJlIGEgXCJvbnMtdGFiYmFyXCIgZWxlbWVudC4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3Njb3BlID0gc2NvcGU7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLl9hdHRycyA9IGF0dHJzO1xuICAgICAgICB0aGlzLl9sYXN0UGFnZUVsZW1lbnQgPSBudWxsO1xuICAgICAgICB0aGlzLl9sYXN0UGFnZVNjb3BlID0gbnVsbDtcblxuICAgICAgICB0aGlzLl9zY29wZS4kb24oJyRkZXN0cm95JywgdGhpcy5fZGVzdHJveS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLl9jbGVhckRlcml2aW5nRXZlbnRzID0gJG9uc2VuLmRlcml2ZUV2ZW50cyh0aGlzLCBlbGVtZW50WzBdLCBbXG4gICAgICAgICAgJ3JlYWN0aXZlJywgJ3Bvc3RjaGFuZ2UnLCAncHJlY2hhbmdlJywgJ2luaXQnLCAnc2hvdycsICdoaWRlJywgJ2Rlc3Ryb3knXG4gICAgICAgIF0pO1xuXG4gICAgICAgIHRoaXMuX2NsZWFyRGVyaXZpbmdNZXRob2RzID0gJG9uc2VuLmRlcml2ZU1ldGhvZHModGhpcywgZWxlbWVudFswXSwgW1xuICAgICAgICAgICdzZXRBY3RpdmVUYWInLFxuICAgICAgICAgICdzZXRUYWJiYXJWaXNpYmlsaXR5JyxcbiAgICAgICAgICAnZ2V0QWN0aXZlVGFiSW5kZXgnLFxuICAgICAgICAgICdsb2FkUGFnZSdcbiAgICAgICAgXSk7XG5cbiAgICAgIH0sXG5cbiAgICAgIF9jb21waWxlQW5kTGluazogZnVuY3Rpb24ocGFnZUVsZW1lbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBsaW5rID0gJGNvbXBpbGUocGFnZUVsZW1lbnQpO1xuICAgICAgICB2YXIgcGFnZVNjb3BlID0gdGhpcy5fc2NvcGUuJG5ldygpO1xuICAgICAgICBsaW5rKHBhZ2VTY29wZSk7XG5cbiAgICAgICAgcGFnZVNjb3BlLiRldmFsQXN5bmMoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY2FsbGJhY2socGFnZUVsZW1lbnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG5cbiAgICAgIF9kZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdkZXN0cm95Jyk7XG5cbiAgICAgICAgdGhpcy5fY2xlYXJEZXJpdmluZ0V2ZW50cygpO1xuICAgICAgICB0aGlzLl9jbGVhckRlcml2aW5nTWV0aG9kcygpO1xuXG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSB0aGlzLl9zY29wZSA9IHRoaXMuX2F0dHJzID0gbnVsbDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBNaWNyb0V2ZW50Lm1peGluKFRhYmJhclZpZXcpO1xuXG4gICAgVGFiYmFyVmlldy5yZWdpc3RlckFuaW1hdG9yID0gZnVuY3Rpb24obmFtZSwgQW5pbWF0b3IpIHtcbiAgICAgIHJldHVybiB3aW5kb3cuT25zVGFiYmFyRWxlbWVudC5yZWdpc3RlckFuaW1hdG9yKG5hbWUsIEFuaW1hdG9yKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFRhYmJhclZpZXc7XG4gIH0pO1xuXG59KSgpO1xuIiwiKGZ1bmN0aW9uKCl7XG4gICd1c2Ugc3RyaWN0JztcbiAgdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpO1xuXG4gIG1vZHVsZS5kaXJlY3RpdmUoJ29uc0JhY2tCdXR0b24nLCBmdW5jdGlvbigkb25zZW4sICRjb21waWxlLCBHZW5lcmljVmlldywgQ29tcG9uZW50Q2xlYW5lcikge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgcmVwbGFjZTogZmFsc2UsXG5cbiAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgIEN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoZWxlbWVudFswXSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBwcmU6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY29udHJvbGxlciwgdHJhbnNjbHVkZSkge1xuICAgICAgICAgICAgQ3VzdG9tRWxlbWVudHMudXBncmFkZShlbGVtZW50WzBdKTtcbiAgICAgICAgICAgIHZhciBiYWNrQnV0dG9uID0gR2VuZXJpY1ZpZXcucmVnaXN0ZXIoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCB7XG4gICAgICAgICAgICAgIHZpZXdLZXk6ICdvbnMtYmFjay1idXR0b24nXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBiYWNrQnV0dG9uLl9ldmVudHMgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICRvbnNlbi5yZW1vdmVNb2RpZmllck1ldGhvZHMoYmFja0J1dHRvbik7XG4gICAgICAgICAgICAgIGVsZW1lbnQgPSBudWxsO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIENvbXBvbmVudENsZWFuZXIub25EZXN0cm95KHNjb3BlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgQ29tcG9uZW50Q2xlYW5lci5kZXN0cm95U2NvcGUoc2NvcGUpO1xuICAgICAgICAgICAgICBDb21wb25lbnRDbGVhbmVyLmRlc3Ryb3lBdHRyaWJ1dGVzKGF0dHJzKTtcbiAgICAgICAgICAgICAgZWxlbWVudCA9IHNjb3BlID0gYXR0cnMgPSBudWxsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwb3N0OiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCkge1xuICAgICAgICAgICAgJG9uc2VuLmZpcmVDb21wb25lbnRFdmVudChlbGVtZW50WzBdLCAnaW5pdCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKXtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpLmRpcmVjdGl2ZSgnb25zQm90dG9tVG9vbGJhcicsIGZ1bmN0aW9uKCRvbnNlbiwgR2VuZXJpY1ZpZXcpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIGxpbms6IHtcbiAgICAgICAgcHJlOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICBDdXN0b21FbGVtZW50cy51cGdyYWRlKGVsZW1lbnRbMF0pO1xuICAgICAgICAgIEdlbmVyaWNWaWV3LnJlZ2lzdGVyKHNjb3BlLCBlbGVtZW50LCBhdHRycywge1xuICAgICAgICAgICAgdmlld0tleTogJ29ucy1ib3R0b21Ub29sYmFyJ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBvc3Q6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICRvbnNlbi5maXJlQ29tcG9uZW50RXZlbnQoZWxlbWVudFswXSwgJ2luaXQnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH0pO1xuXG59KSgpO1xuXG4iLCJcbi8qKlxuICogQGVsZW1lbnQgb25zLWJ1dHRvblxuICovXG5cbihmdW5jdGlvbigpe1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhci5tb2R1bGUoJ29uc2VuJykuZGlyZWN0aXZlKCdvbnNCdXR0b24nLCBmdW5jdGlvbigkb25zZW4sIEdlbmVyaWNWaWV3KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgQ3VzdG9tRWxlbWVudHMudXBncmFkZShlbGVtZW50WzBdKTtcbiAgICAgICAgdmFyIGJ1dHRvbiA9IEdlbmVyaWNWaWV3LnJlZ2lzdGVyKHNjb3BlLCBlbGVtZW50LCBhdHRycywge1xuICAgICAgICAgIHZpZXdLZXk6ICdvbnMtYnV0dG9uJ1xuICAgICAgICB9KTtcblxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYnV0dG9uLCAnZGlzYWJsZWQnLCB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZWxlbWVudFswXS5kaXNhYmxlZDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5fZWxlbWVudFswXS5kaXNhYmxlZCA9IHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAkb25zZW4uZmlyZUNvbXBvbmVudEV2ZW50KGVsZW1lbnRbMF0sICdpbml0Jyk7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG5cblxuXG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpO1xuXG4gIG1vZHVsZS5kaXJlY3RpdmUoJ29uc0R1bW15Rm9ySW5pdCcsIGZ1bmN0aW9uKCRyb290U2NvcGUpIHtcbiAgICB2YXIgaXNSZWFkeSA9IGZhbHNlO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICByZXBsYWNlOiBmYWxzZSxcblxuICAgICAgbGluazoge1xuICAgICAgICBwb3N0OiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCkge1xuICAgICAgICAgIGlmICghaXNSZWFkeSkge1xuICAgICAgICAgICAgaXNSZWFkeSA9IHRydWU7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJyRvbnMtcmVhZHknKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH0pO1xuXG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIEVWRU5UUyA9XG4gICAgKCdkcmFnIGRyYWdsZWZ0IGRyYWdyaWdodCBkcmFndXAgZHJhZ2Rvd24gaG9sZCByZWxlYXNlIHN3aXBlIHN3aXBlbGVmdCBzd2lwZXJpZ2h0ICcgK1xuICAgICAgJ3N3aXBldXAgc3dpcGVkb3duIHRhcCBkb3VibGV0YXAgdG91Y2ggdHJhbnNmb3JtIHBpbmNoIHBpbmNoaW4gcGluY2hvdXQgcm90YXRlJykuc3BsaXQoLyArLyk7XG5cbiAgYW5ndWxhci5tb2R1bGUoJ29uc2VuJykuZGlyZWN0aXZlKCdvbnNHZXN0dXJlRGV0ZWN0b3InLCBmdW5jdGlvbigkb25zZW4pIHtcblxuICAgIHZhciBzY29wZURlZiA9IEVWRU5UUy5yZWR1Y2UoZnVuY3Rpb24oZGljdCwgbmFtZSkge1xuICAgICAgZGljdFsnbmcnICsgdGl0bGl6ZShuYW1lKV0gPSAnJic7XG4gICAgICByZXR1cm4gZGljdDtcbiAgICB9LCB7fSk7XG5cbiAgICBmdW5jdGlvbiB0aXRsaXplKHN0cikge1xuICAgICAgcmV0dXJuIHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIHNjb3BlOiBzY29wZURlZixcblxuICAgICAgLy8gTk9URTogVGhpcyBlbGVtZW50IG11c3QgY29leGlzdHMgd2l0aCBuZy1jb250cm9sbGVyLlxuICAgICAgLy8gRG8gbm90IHVzZSBpc29sYXRlZCBzY29wZSBhbmQgdGVtcGxhdGUncyBuZy10cmFuc2NsdWRlLlxuICAgICAgcmVwbGFjZTogZmFsc2UsXG4gICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuXG4gICAgICBjb21waWxlOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMsIF8sIHRyYW5zY2x1ZGUpIHtcblxuICAgICAgICAgIHRyYW5zY2x1ZGUoc2NvcGUuJHBhcmVudCwgZnVuY3Rpb24oY2xvbmVkKSB7XG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZChjbG9uZWQpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdmFyIGhhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGF0dHIgPSAnbmcnICsgdGl0bGl6ZShldmVudC50eXBlKTtcblxuICAgICAgICAgICAgaWYgKGF0dHIgaW4gc2NvcGVEZWYpIHtcbiAgICAgICAgICAgICAgc2NvcGVbYXR0cl0oeyRldmVudDogZXZlbnR9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgdmFyIGdlc3R1cmVEZXRlY3RvcjtcblxuICAgICAgICAgIHNldEltbWVkaWF0ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGdlc3R1cmVEZXRlY3RvciA9IGVsZW1lbnRbMF0uX2dlc3R1cmVEZXRlY3RvcjtcbiAgICAgICAgICAgIGdlc3R1cmVEZXRlY3Rvci5vbihFVkVOVFMuam9pbignICcpLCBoYW5kbGVyKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgICRvbnNlbi5jbGVhbmVyLm9uRGVzdHJveShzY29wZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBnZXN0dXJlRGV0ZWN0b3Iub2ZmKEVWRU5UUy5qb2luKCcgJyksIGhhbmRsZXIpO1xuICAgICAgICAgICAgJG9uc2VuLmNsZWFyQ29tcG9uZW50KHtcbiAgICAgICAgICAgICAgc2NvcGU6IHNjb3BlLFxuICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgICBhdHRyczogYXR0cnNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZ2VzdHVyZURldGVjdG9yLmVsZW1lbnQgPSBzY29wZSA9IGVsZW1lbnQgPSBhdHRycyA9IG51bGw7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAkb25zZW4uZmlyZUNvbXBvbmVudEV2ZW50KGVsZW1lbnRbMF0sICdpbml0Jyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59KSgpO1xuXG4iLCJ2YXIgYmFiZWxIZWxwZXJzID0ge307XG5cbmJhYmVsSGVscGVycy5jbGFzc0NhbGxDaGVjayA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59O1xuXG5iYWJlbEhlbHBlcnMuY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gICAgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgICBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgICByZXR1cm4gQ29uc3RydWN0b3I7XG4gIH07XG59KCk7XG5cbmJhYmVsSGVscGVycy5nZXQgPSBmdW5jdGlvbiBnZXQob2JqZWN0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpIHtcbiAgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcblxuICAgIGlmIChwYXJlbnQgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBnZXQocGFyZW50LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYykge1xuICAgIHJldHVybiBkZXNjLnZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHZhciBnZXR0ZXIgPSBkZXNjLmdldDtcblxuICAgIGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpO1xuICB9XG59O1xuXG5iYWJlbEhlbHBlcnMuaW5oZXJpdHMgPSBmdW5jdGlvbiAoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpO1xuICB9XG5cbiAgc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IHtcbiAgICAgIHZhbHVlOiBzdWJDbGFzcyxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9XG4gIH0pO1xuICBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7XG59O1xuXG5iYWJlbEhlbHBlcnMucG9zc2libGVDb25zdHJ1Y3RvclJldHVybiA9IGZ1bmN0aW9uIChzZWxmLCBjYWxsKSB7XG4gIGlmICghc2VsZikge1xuICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtcbiAgfVxuXG4gIHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmO1xufTtcblxuYmFiZWxIZWxwZXJzOyIsIi8qKlxuICogQGVsZW1lbnQgb25zLWlmLW9yaWVudGF0aW9uXG4gKiBAY2F0ZWdvcnkgY29uZGl0aW9uYWxcbiAqIEBkZXNjcmlwdGlvblxuICogICBbZW5dQ29uZGl0aW9uYWxseSBkaXNwbGF5IGNvbnRlbnQgZGVwZW5kaW5nIG9uIHNjcmVlbiBvcmllbnRhdGlvbi4gVmFsaWQgdmFsdWVzIGFyZSBwb3J0cmFpdCBhbmQgbGFuZHNjYXBlLiBEaWZmZXJlbnQgZnJvbSBvdGhlciBjb21wb25lbnRzLCB0aGlzIGNvbXBvbmVudCBpcyB1c2VkIGFzIGF0dHJpYnV0ZSBpbiBhbnkgZWxlbWVudC5bL2VuXVxuICogICBbamFd55S76Z2i44Gu5ZCR44GN44Gr5b+c44GY44Gm44Kz44Oz44OG44Oz44OE44Gu5Yi25b6h44KS6KGM44GE44G+44GZ44CCcG9ydHJhaXTjgoLjgZfjgY/jga9sYW5kc2NhcGXjgpLmjIflrprjgafjgY3jgb7jgZnjgILjgZnjgbnjgabjga7opoHntKDjga7lsZ7mgKfjgavkvb/nlKjjgafjgY3jgb7jgZnjgIJbL2phXVxuICogQHNlZWFsc28gb25zLWlmLXBsYXRmb3JtIFtlbl1vbnMtaWYtcGxhdGZvcm0gY29tcG9uZW50Wy9lbl1bamFdb25zLWlmLXBsYXRmb3Jt44Kz44Oz44Od44O844ON44Oz44OIWy9qYV1cbiAqIEBndWlkZSBVdGlsaXR5QVBJcyBbZW5dT3RoZXIgdXRpbGl0eSBBUElzWy9lbl1bamFd5LuW44Gu44Om44O844OG44Kj44Oq44OG44KjQVBJWy9qYV1cbiAqIEBleGFtcGxlXG4gKiA8ZGl2IG9ucy1pZi1vcmllbnRhdGlvbj1cInBvcnRyYWl0XCI+XG4gKiAgIDxwPlRoaXMgd2lsbCBvbmx5IGJlIHZpc2libGUgaW4gcG9ydHJhaXQgbW9kZS48L3A+XG4gKiA8L2Rpdj5cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWlmLW9yaWVudGF0aW9uXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXUVpdGhlciBcInBvcnRyYWl0XCIgb3IgXCJsYW5kc2NhcGVcIi5bL2VuXVxuICogICBbamFdcG9ydHJhaXTjgoLjgZfjgY/jga9sYW5kc2NhcGXjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbihmdW5jdGlvbigpe1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpO1xuXG4gIG1vZHVsZS5kaXJlY3RpdmUoJ29uc0lmT3JpZW50YXRpb24nLCBmdW5jdGlvbigkb25zZW4sICRvbnNHbG9iYWwpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgIHJlcGxhY2U6IGZhbHNlLFxuXG4gICAgICAvLyBOT1RFOiBUaGlzIGVsZW1lbnQgbXVzdCBjb2V4aXN0cyB3aXRoIG5nLWNvbnRyb2xsZXIuXG4gICAgICAvLyBEbyBub3QgdXNlIGlzb2xhdGVkIHNjb3BlIGFuZCB0ZW1wbGF0ZSdzIG5nLXRyYW5zY2x1ZGUuXG4gICAgICB0cmFuc2NsdWRlOiBmYWxzZSxcbiAgICAgIHNjb3BlOiBmYWxzZSxcblxuICAgICAgY29tcGlsZTogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LmNzcygnZGlzcGxheScsICdub25lJyk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ29ucy1pZi1vcmllbnRhdGlvbi1pbm5lcicpO1xuXG4gICAgICAgICAgYXR0cnMuJG9ic2VydmUoJ29uc0lmT3JpZW50YXRpb24nLCB1cGRhdGUpO1xuICAgICAgICAgICRvbnNHbG9iYWwub3JpZW50YXRpb24ub24oJ2NoYW5nZScsIHVwZGF0ZSk7XG5cbiAgICAgICAgICB1cGRhdGUoKTtcblxuICAgICAgICAgICRvbnNlbi5jbGVhbmVyLm9uRGVzdHJveShzY29wZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkb25zR2xvYmFsLm9yaWVudGF0aW9uLm9mZignY2hhbmdlJywgdXBkYXRlKTtcblxuICAgICAgICAgICAgJG9uc2VuLmNsZWFyQ29tcG9uZW50KHtcbiAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICAgc2NvcGU6IHNjb3BlLFxuICAgICAgICAgICAgICBhdHRyczogYXR0cnNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZWxlbWVudCA9IHNjb3BlID0gYXR0cnMgPSBudWxsO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgdmFyIHVzZXJPcmllbnRhdGlvbiA9ICgnJyArIGF0dHJzLm9uc0lmT3JpZW50YXRpb24pLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICB2YXIgb3JpZW50YXRpb24gPSBnZXRMYW5kc2NhcGVPclBvcnRyYWl0KCk7XG5cbiAgICAgICAgICAgIGlmICh1c2VyT3JpZW50YXRpb24gPT09ICdwb3J0cmFpdCcgfHwgdXNlck9yaWVudGF0aW9uID09PSAnbGFuZHNjYXBlJykge1xuICAgICAgICAgICAgICBpZiAodXNlck9yaWVudGF0aW9uID09PSBvcmllbnRhdGlvbikge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuY3NzKCdkaXNwbGF5JywgJycpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGZ1bmN0aW9uIGdldExhbmRzY2FwZU9yUG9ydHJhaXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gJG9uc0dsb2JhbC5vcmllbnRhdGlvbi5pc1BvcnRyYWl0KCkgPyAncG9ydHJhaXQnIDogJ2xhbmRzY2FwZSc7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xufSkoKTtcblxuIiwiLyoqXG4gKiBAZWxlbWVudCBvbnMtaWYtcGxhdGZvcm1cbiAqIEBjYXRlZ29yeSBjb25kaXRpb25hbFxuICogQGRlc2NyaXB0aW9uXG4gKiAgICBbZW5dQ29uZGl0aW9uYWxseSBkaXNwbGF5IGNvbnRlbnQgZGVwZW5kaW5nIG9uIHRoZSBwbGF0Zm9ybSAvIGJyb3dzZXIuIFZhbGlkIHZhbHVlcyBhcmUgXCJvcGVyYVwiLCBcImZpcmVmb3hcIiwgXCJzYWZhcmlcIiwgXCJjaHJvbWVcIiwgXCJpZVwiLCBcImVkZ2VcIiwgXCJhbmRyb2lkXCIsIFwiYmxhY2tiZXJyeVwiLCBcImlvc1wiIGFuZCBcIndwXCIuWy9lbl1cbiAqICAgIFtqYV3jg5fjg6njg4Pjg4jjg5Xjgqnjg7zjg6DjgoTjg5bjg6njgqbjgrbjg7zjgavlv5zjgZjjgabjgrPjg7Pjg4bjg7Pjg4Tjga7liLblvqHjgpLjgYrjgZPjgarjgYTjgb7jgZnjgIJvcGVyYSwgZmlyZWZveCwgc2FmYXJpLCBjaHJvbWUsIGllLCBlZGdlLCBhbmRyb2lkLCBibGFja2JlcnJ5LCBpb3MsIHdw44Gu44GE44Ga44KM44GL44Gu5YCk44KS56m655m95Yy65YiH44KK44Gn6KSH5pWw5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqIEBzZWVhbHNvIG9ucy1pZi1vcmllbnRhdGlvbiBbZW5db25zLWlmLW9yaWVudGF0aW9uIGNvbXBvbmVudFsvZW5dW2phXW9ucy1pZi1vcmllbnRhdGlvbuOCs+ODs+ODneODvOODjeODs+ODiFsvamFdXG4gKiBAZ3VpZGUgVXRpbGl0eUFQSXMgW2VuXU90aGVyIHV0aWxpdHkgQVBJc1svZW5dW2phXeS7luOBruODpuODvOODhuOCo+ODquODhuOCo0FQSVsvamFdXG4gKiBAZXhhbXBsZVxuICogPGRpdiBvbnMtaWYtcGxhdGZvcm09XCJhbmRyb2lkXCI+XG4gKiAgIC4uLlxuICogPC9kaXY+XG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIG9ucy1pZi1wbGF0Zm9ybVxuICogQHR5cGUge1N0cmluZ31cbiAqIEBpbml0b25seVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1PbmUgb3IgbXVsdGlwbGUgc3BhY2Ugc2VwYXJhdGVkIHZhbHVlczogXCJvcGVyYVwiLCBcImZpcmVmb3hcIiwgXCJzYWZhcmlcIiwgXCJjaHJvbWVcIiwgXCJpZVwiLCBcImVkZ2VcIiwgXCJhbmRyb2lkXCIsIFwiYmxhY2tiZXJyeVwiLCBcImlvc1wiIG9yIFwid3BcIi5bL2VuXVxuICogICBbamFdXCJvcGVyYVwiLCBcImZpcmVmb3hcIiwgXCJzYWZhcmlcIiwgXCJjaHJvbWVcIiwgXCJpZVwiLCBcImVkZ2VcIiwgXCJhbmRyb2lkXCIsIFwiYmxhY2tiZXJyeVwiLCBcImlvc1wiLCBcIndwXCLjga7jgYTjgZrjgozjgYvnqbrnmb3ljLrliIfjgorjgafopIfmlbDmjIflrprjgafjgY3jgb7jgZnjgIJbL2phXVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKTtcblxuICBtb2R1bGUuZGlyZWN0aXZlKCdvbnNJZlBsYXRmb3JtJywgZnVuY3Rpb24oJG9uc2VuKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICByZXBsYWNlOiBmYWxzZSxcblxuICAgICAgLy8gTk9URTogVGhpcyBlbGVtZW50IG11c3QgY29leGlzdHMgd2l0aCBuZy1jb250cm9sbGVyLlxuICAgICAgLy8gRG8gbm90IHVzZSBpc29sYXRlZCBzY29wZSBhbmQgdGVtcGxhdGUncyBuZy10cmFuc2NsdWRlLlxuICAgICAgdHJhbnNjbHVkZTogZmFsc2UsXG4gICAgICBzY29wZTogZmFsc2UsXG5cbiAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnb25zLWlmLXBsYXRmb3JtLWlubmVyJyk7XG4gICAgICAgIGVsZW1lbnQuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcblxuICAgICAgICB2YXIgcGxhdGZvcm0gPSBnZXRQbGF0Zm9ybVN0cmluZygpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnb25zSWZQbGF0Zm9ybScsIGZ1bmN0aW9uKHVzZXJQbGF0Zm9ybSkge1xuICAgICAgICAgICAgaWYgKHVzZXJQbGF0Zm9ybSkge1xuICAgICAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHVwZGF0ZSgpO1xuXG4gICAgICAgICAgJG9uc2VuLmNsZWFuZXIub25EZXN0cm95KHNjb3BlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRvbnNlbi5jbGVhckNvbXBvbmVudCh7XG4gICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICAgIHNjb3BlOiBzY29wZSxcbiAgICAgICAgICAgICAgYXR0cnM6IGF0dHJzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVsZW1lbnQgPSBzY29wZSA9IGF0dHJzID0gbnVsbDtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICAgIHZhciB1c2VyUGxhdGZvcm1zID0gYXR0cnMub25zSWZQbGF0Zm9ybS50b0xvd2VyQ2FzZSgpLnRyaW0oKS5zcGxpdCgvXFxzKy8pO1xuICAgICAgICAgICAgaWYgKHVzZXJQbGF0Zm9ybXMuaW5kZXhPZihwbGF0Zm9ybS50b0xvd2VyQ2FzZSgpKSA+PSAwKSB7XG4gICAgICAgICAgICAgIGVsZW1lbnQuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBlbGVtZW50LmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIGdldFBsYXRmb3JtU3RyaW5nKCkge1xuXG4gICAgICAgICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0FuZHJvaWQvaSkpIHtcbiAgICAgICAgICAgIHJldHVybiAnYW5kcm9pZCc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKChuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9CbGFja0JlcnJ5L2kpKSB8fCAobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvUklNIFRhYmxldCBPUy9pKSkgfHwgKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0JCMTAvaSkpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2JsYWNrYmVycnknO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9pUGhvbmV8aVBhZHxpUG9kL2kpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2lvcyc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1dpbmRvd3MgUGhvbmV8SUVNb2JpbGV8V1BEZXNrdG9wL2kpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3dwJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBPcGVyYSA4LjArIChVQSBkZXRlY3Rpb24gdG8gZGV0ZWN0IEJsaW5rL3Y4LXBvd2VyZWQgT3BlcmEpXG4gICAgICAgICAgdmFyIGlzT3BlcmEgPSAhIXdpbmRvdy5vcGVyYSB8fCBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJyBPUFIvJykgPj0gMDtcbiAgICAgICAgICBpZiAoaXNPcGVyYSkge1xuICAgICAgICAgICAgcmV0dXJuICdvcGVyYSc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIGlzRmlyZWZveCA9IHR5cGVvZiBJbnN0YWxsVHJpZ2dlciAhPT0gJ3VuZGVmaW5lZCc7ICAgLy8gRmlyZWZveCAxLjArXG4gICAgICAgICAgaWYgKGlzRmlyZWZveCkge1xuICAgICAgICAgICAgcmV0dXJuICdmaXJlZm94JztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgaXNTYWZhcmkgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwod2luZG93LkhUTUxFbGVtZW50KS5pbmRleE9mKCdDb25zdHJ1Y3RvcicpID4gMDtcbiAgICAgICAgICAvLyBBdCBsZWFzdCBTYWZhcmkgMys6IFwiW29iamVjdCBIVE1MRWxlbWVudENvbnN0cnVjdG9yXVwiXG4gICAgICAgICAgaWYgKGlzU2FmYXJpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3NhZmFyaSc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIGlzRWRnZSA9IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignIEVkZ2UvJykgPj0gMDtcbiAgICAgICAgICBpZiAoaXNFZGdlKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2VkZ2UnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBpc0Nocm9tZSA9ICEhd2luZG93LmNocm9tZSAmJiAhaXNPcGVyYSAmJiAhaXNFZGdlOyAvLyBDaHJvbWUgMStcbiAgICAgICAgICBpZiAoaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiAnY2hyb21lJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgaXNJRSA9IC8qQGNjX29uIUAqL2ZhbHNlIHx8ICEhZG9jdW1lbnQuZG9jdW1lbnRNb2RlOyAvLyBBdCBsZWFzdCBJRTZcbiAgICAgICAgICBpZiAoaXNJRSkge1xuICAgICAgICAgICAgcmV0dXJuICdpZSc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuICd1bmtub3duJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH0pO1xufSkoKTtcbiIsIi8qKlxuICogQG5nZG9jIGRpcmVjdGl2ZVxuICogQGlkIGlucHV0XG4gKiBAbmFtZSBvbnMtaW5wdXRcbiAqIEBjYXRlZ29yeSBmb3JtXG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dSW5wdXQgY29tcG9uZW50LlsvZW5dXG4gKiAgW2phXWlucHV044Kz44Oz44Od4oCV44ON44Oz44OI44Gn44GZ44CCWy9qYV1cbiAqIEBjb2RlcGVuIG9qUXhMalxuICogQGd1aWRlIFVzaW5nRm9ybUNvbXBvbmVudHNcbiAqICAgW2VuXVVzaW5nIGZvcm0gY29tcG9uZW50c1svZW5dXG4gKiAgIFtqYV3jg5Xjgqnjg7zjg6DjgpLkvb/jgYZbL2phXVxuICogQGd1aWRlIEV2ZW50SGFuZGxpbmdcbiAqICAgW2VuXUV2ZW50IGhhbmRsaW5nIGRlc2NyaXB0aW9uc1svZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jlh6bnkIbjga7kvb/jgYTmlrlbL2phXVxuICogQGV4YW1wbGVcbiAqIDxvbnMtaW5wdXQ+PC9vbnMtaW5wdXQ+XG4gKiA8b25zLWlucHV0IG1vZGlmaWVyPVwibWF0ZXJpYWxcIiBsYWJlbD1cIlVzZXJuYW1lXCI+PC9vbnMtaW5wdXQ+XG4gKi9cblxuLyoqXG4gKiBAbmdkb2MgYXR0cmlidXRlXG4gKiBAbmFtZSBsYWJlbFxuICogQHR5cGUge1N0cmluZ31cbiAqIEBkZXNjcmlwdGlvblxuICogICBbZW5dVGV4dCBmb3IgYW5pbWF0ZWQgZmxvYXRpbmcgbGFiZWwuWy9lbl1cbiAqICAgW2phXeOCouODi+ODoeODvOOCt+ODp+ODs+OBleOBm+OCi+ODleODreODvOODhuOCo+ODs+OCsOODqeODmeODq+OBruODhuOCreOCueODiOOCkuaMh+WumuOBl+OBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAbmdkb2MgYXR0cmlidXRlXG4gKiBAbmFtZSBmbG9hdFxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXUlmIHRoaXMgYXR0cmlidXRlIGlzIHByZXNlbnQsIHRoZSBsYWJlbCB3aWxsIGJlIGFuaW1hdGVkLlsvZW5dXG4gKiAgW2phXeOBk+OBruWxnuaAp+OBjOioreWumuOBleOCjOOBn+aZguOAgeODqeODmeODq+OBr+OCouODi+ODoeODvOOCt+ODp+ODs+OBmeOCi+OCiOOBhuOBq+OBquOCiuOBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAbmdkb2MgYXR0cmlidXRlXG4gKiBAbmFtZSBuZy1tb2RlbFxuICogQGV4dGVuc2lvbk9mIGFuZ3VsYXJcbiAqIEBkZXNjcmlwdGlvblxuICogICBbZW5dQmluZCB0aGUgdmFsdWUgdG8gYSBtb2RlbC4gV29ya3MganVzdCBsaWtlIGZvciBub3JtYWwgaW5wdXQgZWxlbWVudHMuWy9lbl1cbiAqICAgW2phXeOBk+OBruimgee0oOOBruWApOOCkuODouODh+ODq+OBq+e0kOS7mOOBkeOBvuOBmeOAgumAmuW4uOOBrmlucHV06KaB57Sg44Gu5qeY44Gr5YuV5L2c44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBuZ2RvYyBhdHRyaWJ1dGVcbiAqIEBuYW1lIG5nLWNoYW5nZVxuICogQGV4dGVuc2lvbk9mIGFuZ3VsYXJcbiAqIEBkZXNjcmlwdGlvblxuICogICBbZW5dRXhlY3V0ZXMgYW4gZXhwcmVzc2lvbiB3aGVuIHRoZSB2YWx1ZSBjaGFuZ2VzLiBXb3JrcyBqdXN0IGxpa2UgZm9yIG5vcm1hbCBpbnB1dCBlbGVtZW50cy5bL2VuXVxuICogICBbamFd5YCk44GM5aSJ44KP44Gj44Gf5pmC44Gr44GT44Gu5bGe5oCn44Gn5oyH5a6a44GX44GfZXhwcmVzc2lvbuOBjOWun+ihjOOBleOCjOOBvuOBmeOAgumAmuW4uOOBrmlucHV06KaB57Sg44Gu5qeY44Gr5YuV5L2c44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4oZnVuY3Rpb24oKXtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpLmRpcmVjdGl2ZSgnb25zSW5wdXQnLCBmdW5jdGlvbigkcGFyc2UpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIHJlcGxhY2U6IGZhbHNlLFxuICAgICAgc2NvcGU6IGZhbHNlLFxuXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgQ3VzdG9tRWxlbWVudHMudXBncmFkZShlbGVtZW50WzBdKTtcbiAgICAgICAgbGV0IGVsID0gZWxlbWVudFswXTtcblxuICAgICAgICBjb25zdCBvbklucHV0ID0gKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHNldCA9ICRwYXJzZShhdHRycy5uZ01vZGVsKS5hc3NpZ247XG5cbiAgICAgICAgICBpZiAoZWwuX2lzVGV4dElucHV0KSB7XG4gICAgICAgICAgICBzZXQoc2NvcGUsIGVsLnZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoZWwudHlwZSA9PT0gJ3JhZGlvJyAmJiBlbC5jaGVja2VkKSB7XG4gICAgICAgICAgICBzZXQoc2NvcGUsIGVsLnZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzZXQoc2NvcGUsIGVsLmNoZWNrZWQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChhdHRycy5uZ0NoYW5nZSkge1xuICAgICAgICAgICAgc2NvcGUuJGV2YWwoYXR0cnMubmdDaGFuZ2UpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNjb3BlLiRwYXJlbnQuJGV2YWxBc3luYygpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChhdHRycy5uZ01vZGVsKSB7XG4gICAgICAgICAgc2NvcGUuJHdhdGNoKGF0dHJzLm5nTW9kZWwsICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGVsLl9pc1RleHRJbnB1dCAmJiB0eXBlb2YgdmFsdWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIGVsLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChlbC50eXBlID09PSAncmFkaW8nKSB7XG4gICAgICAgICAgICAgIGVsLmNoZWNrZWQgPSB2YWx1ZSA9PT0gZWwudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgZWwuY2hlY2tlZCA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgZWwuX2lzVGV4dElucHV0XG4gICAgICAgICAgICA/IGVsZW1lbnQub24oJ2lucHV0Jywgb25JbnB1dClcbiAgICAgICAgICAgIDogZWxlbWVudC5vbignY2hhbmdlJywgb25JbnB1dCk7XG4gICAgICAgIH1cblxuICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICAgIGVsLl9pc1RleHRJbnB1dFxuICAgICAgICAgICAgPyBlbGVtZW50Lm9mZignaW5wdXQnLCBvbklucHV0KVxuICAgICAgICAgICAgOiBlbGVtZW50Lm9mZignY2hhbmdlJywgb25JbnB1dCk7XG5cbiAgICAgICAgICBzY29wZSA9IGVsZW1lbnQgPSBhdHRycyA9IGVsID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59KSgpO1xuIiwiLyoqXG4gKiBAZWxlbWVudCBvbnMta2V5Ym9hcmQtYWN0aXZlXG4gKiBAY2F0ZWdvcnkgZm9ybVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1cbiAqICAgICBDb25kaXRpb25hbGx5IGRpc3BsYXkgY29udGVudCBkZXBlbmRpbmcgb24gaWYgdGhlIHNvZnR3YXJlIGtleWJvYXJkIGlzIHZpc2libGUgb3IgaGlkZGVuLlxuICogICAgIFRoaXMgY29tcG9uZW50IHJlcXVpcmVzIGNvcmRvdmEgYW5kIHRoYXQgdGhlIGNvbS5pb25pYy5rZXlib2FyZCBwbHVnaW4gaXMgaW5zdGFsbGVkLlxuICogICBbL2VuXVxuICogICBbamFdXG4gKiAgICAg44K944OV44OI44Km44Kn44Ki44Kt44O844Oc44O844OJ44GM6KGo56S644GV44KM44Gm44GE44KL44GL44Gp44GG44GL44Gn44CB44Kz44Oz44OG44Oz44OE44KS6KGo56S644GZ44KL44GL44Gp44GG44GL44KS5YiH44KK5pu/44GI44KL44GT44Go44GM5Ye65p2l44G+44GZ44CCXG4gKiAgICAg44GT44Gu44Kz44Oz44Od44O844ON44Oz44OI44Gv44CBQ29yZG92YeOChGNvbS5pb25pYy5rZXlib2FyZOODl+ODqeOCsOOCpOODs+OCkuW/heimgeOBqOOBl+OBvuOBmeOAglxuICogICBbL2phXVxuICogQGd1aWRlIFV0aWxpdHlBUElzXG4gKiAgIFtlbl1PdGhlciB1dGlsaXR5IEFQSXNbL2VuXVxuICogICBbamFd5LuW44Gu44Om44O844OG44Kj44Oq44OG44KjQVBJWy9qYV1cbiAqIEBleGFtcGxlXG4gKiA8ZGl2IG9ucy1rZXlib2FyZC1hY3RpdmU+XG4gKiAgIFRoaXMgd2lsbCBvbmx5IGJlIGRpc3BsYXllZCBpZiB0aGUgc29mdHdhcmUga2V5Ym9hcmQgaXMgb3Blbi5cbiAqIDwvZGl2PlxuICogPGRpdiBvbnMta2V5Ym9hcmQtaW5hY3RpdmU+XG4gKiAgIFRoZXJlIGlzIGFsc28gYSBjb21wb25lbnQgdGhhdCBkb2VzIHRoZSBvcHBvc2l0ZS5cbiAqIDwvZGl2PlxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBvbnMta2V5Ym9hcmQtYWN0aXZlXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXVRoZSBjb250ZW50IG9mIHRhZ3Mgd2l0aCB0aGlzIGF0dHJpYnV0ZSB3aWxsIGJlIHZpc2libGUgd2hlbiB0aGUgc29mdHdhcmUga2V5Ym9hcmQgaXMgb3Blbi5bL2VuXVxuICogICBbamFd44GT44Gu5bGe5oCn44GM44Gk44GE44Gf6KaB57Sg44Gv44CB44K944OV44OI44Km44Kn44Ki44Kt44O844Oc44O844OJ44GM6KGo56S644GV44KM44Gf5pmC44Gr5Yid44KB44Gm6KGo56S644GV44KM44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWtleWJvYXJkLWluYWN0aXZlXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXVRoZSBjb250ZW50IG9mIHRhZ3Mgd2l0aCB0aGlzIGF0dHJpYnV0ZSB3aWxsIGJlIHZpc2libGUgd2hlbiB0aGUgc29mdHdhcmUga2V5Ym9hcmQgaXMgaGlkZGVuLlsvZW5dXG4gKiAgIFtqYV3jgZPjga7lsZ7mgKfjgYzjgaTjgYTjgZ/opoHntKDjga/jgIHjgr3jg5Xjg4jjgqbjgqfjgqLjgq3jg7zjg5zjg7zjg4njgYzpmqDjgozjgabjgYTjgovmmYLjga7jgb/ooajnpLrjgZXjgozjgb7jgZnjgIJbL2phXVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKTtcblxuICB2YXIgY29tcGlsZUZ1bmN0aW9uID0gZnVuY3Rpb24oc2hvdywgJG9uc2VuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgdmFyIGRpc3BTaG93ID0gc2hvdyA/ICdibG9jaycgOiAnbm9uZScsXG4gICAgICAgICAgICBkaXNwSGlkZSA9IHNob3cgPyAnbm9uZScgOiAnYmxvY2snO1xuXG4gICAgICAgIHZhciBvblNob3cgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBlbGVtZW50LmNzcygnZGlzcGxheScsIGRpc3BTaG93KTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgb25IaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZWxlbWVudC5jc3MoJ2Rpc3BsYXknLCBkaXNwSGlkZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIG9uSW5pdCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBpZiAoZS52aXNpYmxlKSB7XG4gICAgICAgICAgICBvblNob3coKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb25IaWRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIG9ucy5zb2Z0d2FyZUtleWJvYXJkLm9uKCdzaG93Jywgb25TaG93KTtcbiAgICAgICAgb25zLnNvZnR3YXJlS2V5Ym9hcmQub24oJ2hpZGUnLCBvbkhpZGUpO1xuICAgICAgICBvbnMuc29mdHdhcmVLZXlib2FyZC5vbignaW5pdCcsIG9uSW5pdCk7XG5cbiAgICAgICAgaWYgKG9ucy5zb2Z0d2FyZUtleWJvYXJkLl92aXNpYmxlKSB7XG4gICAgICAgICAgb25TaG93KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb25IaWRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAkb25zZW4uY2xlYW5lci5vbkRlc3Ryb3koc2NvcGUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIG9ucy5zb2Z0d2FyZUtleWJvYXJkLm9mZignc2hvdycsIG9uU2hvdyk7XG4gICAgICAgICAgb25zLnNvZnR3YXJlS2V5Ym9hcmQub2ZmKCdoaWRlJywgb25IaWRlKTtcbiAgICAgICAgICBvbnMuc29mdHdhcmVLZXlib2FyZC5vZmYoJ2luaXQnLCBvbkluaXQpO1xuXG4gICAgICAgICAgJG9uc2VuLmNsZWFyQ29tcG9uZW50KHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICBzY29wZTogc2NvcGUsXG4gICAgICAgICAgICBhdHRyczogYXR0cnNcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBlbGVtZW50ID0gc2NvcGUgPSBhdHRycyA9IG51bGw7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9O1xuICB9O1xuXG4gIG1vZHVsZS5kaXJlY3RpdmUoJ29uc0tleWJvYXJkQWN0aXZlJywgZnVuY3Rpb24oJG9uc2VuKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICByZXBsYWNlOiBmYWxzZSxcbiAgICAgIHRyYW5zY2x1ZGU6IGZhbHNlLFxuICAgICAgc2NvcGU6IGZhbHNlLFxuICAgICAgY29tcGlsZTogY29tcGlsZUZ1bmN0aW9uKHRydWUsICRvbnNlbilcbiAgICB9O1xuICB9KTtcblxuICBtb2R1bGUuZGlyZWN0aXZlKCdvbnNLZXlib2FyZEluYWN0aXZlJywgZnVuY3Rpb24oJG9uc2VuKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICByZXBsYWNlOiBmYWxzZSxcbiAgICAgIHRyYW5zY2x1ZGU6IGZhbHNlLFxuICAgICAgc2NvcGU6IGZhbHNlLFxuICAgICAgY29tcGlsZTogY29tcGlsZUZ1bmN0aW9uKGZhbHNlLCAkb25zZW4pXG4gICAgfTtcbiAgfSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhci5tb2R1bGUoJ29uc2VuJykuZGlyZWN0aXZlKCdvbnNMaXN0JywgZnVuY3Rpb24oJG9uc2VuLCBHZW5lcmljVmlldykge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgIEN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoZWxlbWVudFswXSk7XG4gICAgICAgIEdlbmVyaWNWaWV3LnJlZ2lzdGVyKHNjb3BlLCBlbGVtZW50LCBhdHRycywge3ZpZXdLZXk6ICdvbnMtbGlzdCd9KTtcbiAgICAgICAgJG9uc2VuLmZpcmVDb21wb25lbnRFdmVudChlbGVtZW50WzBdLCAnaW5pdCcpO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuXG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhci5tb2R1bGUoJ29uc2VuJykuZGlyZWN0aXZlKCdvbnNMaXN0SGVhZGVyJywgZnVuY3Rpb24oJG9uc2VuLCBHZW5lcmljVmlldykge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgIEN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoZWxlbWVudFswXSk7XG4gICAgICAgIEdlbmVyaWNWaWV3LnJlZ2lzdGVyKHNjb3BlLCBlbGVtZW50LCBhdHRycywge3ZpZXdLZXk6ICdvbnMtbGlzdEhlYWRlcid9KTtcbiAgICAgICAgJG9uc2VuLmZpcmVDb21wb25lbnRFdmVudChlbGVtZW50WzBdLCAnaW5pdCcpO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuXG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhci5tb2R1bGUoJ29uc2VuJykuZGlyZWN0aXZlKCdvbnNMaXN0SXRlbScsIGZ1bmN0aW9uKCRvbnNlbiwgR2VuZXJpY1ZpZXcpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICBDdXN0b21FbGVtZW50cy51cGdyYWRlKGVsZW1lbnRbMF0pO1xuICAgICAgICBHZW5lcmljVmlldy5yZWdpc3RlcihzY29wZSwgZWxlbWVudCwgYXR0cnMsIHt2aWV3S2V5OiAnb25zLWxpc3QtaXRlbSd9KTtcbiAgICAgICAgJG9uc2VuLmZpcmVDb21wb25lbnRFdmVudChlbGVtZW50WzBdLCAnaW5pdCcpO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xufSkoKTtcbiIsIi8qKlxuICogQGVsZW1lbnQgb25zLWxvYWRpbmctcGxhY2Vob2xkZXJcbiAqIEBjYXRlZ29yeSB1dGlsXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXURpc3BsYXkgYSBwbGFjZWhvbGRlciB3aGlsZSB0aGUgY29udGVudCBpcyBsb2FkaW5nLlsvZW5dXG4gKiAgIFtqYV1PbnNlbiBVSeOBjOiqreOBv+i+vOOBvuOCjOOCi+OBvuOBp+OBq+ihqOekuuOBmeOCi+ODl+ODrOODvOOCueODm+ODq+ODgOODvOOCkuihqOePvuOBl+OBvuOBmeOAglsvamFdXG4gKiBAZ3VpZGUgVXRpbGl0eUFQSXMgW2VuXU90aGVyIHV0aWxpdHkgQVBJc1svZW5dW2phXeS7luOBruODpuODvOODhuOCo+ODquODhuOCo0FQSVsvamFdXG4gKiBAZXhhbXBsZVxuICogPGRpdiBvbnMtbG9hZGluZy1wbGFjZWhvbGRlcj1cInBhZ2UuaHRtbFwiPlxuICogICBMb2FkaW5nLi4uXG4gKiA8L2Rpdj5cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWxvYWRpbmctcGxhY2Vob2xkZXJcbiAqIEBpbml0b25seVxuICogQHR5cGUge1N0cmluZ31cbiAqIEBkZXNjcmlwdGlvblxuICogICBbZW5dVGhlIHVybCBvZiB0aGUgcGFnZSB0byBsb2FkLlsvZW5dXG4gKiAgIFtqYV3oqq3jgb/ovrzjgoDjg5rjg7zjgrjjga5VUkzjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbihmdW5jdGlvbigpe1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhci5tb2R1bGUoJ29uc2VuJykuZGlyZWN0aXZlKCdvbnNMb2FkaW5nUGxhY2Vob2xkZXInLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICBDdXN0b21FbGVtZW50cy51cGdyYWRlKGVsZW1lbnRbMF0pO1xuICAgICAgICBpZiAoYXR0cnMub25zTG9hZGluZ1BsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgb25zLl9yZXNvbHZlTG9hZGluZ1BsYWNlaG9sZGVyKGVsZW1lbnRbMF0sIGF0dHJzLm9uc0xvYWRpbmdQbGFjZWhvbGRlciwgZnVuY3Rpb24oY29udGVudEVsZW1lbnQsIGRvbmUpIHtcbiAgICAgICAgICAgIEN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoY29udGVudEVsZW1lbnQpO1xuICAgICAgICAgICAgb25zLmNvbXBpbGUoY29udGVudEVsZW1lbnQpO1xuICAgICAgICAgICAgc2NvcGUuJGV2YWxBc3luYyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgc2V0SW1tZWRpYXRlKGRvbmUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbn0pKCk7XG4iLCJ2YXIgYmFiZWxIZWxwZXJzID0ge307XG5cbmJhYmVsSGVscGVycy5jbGFzc0NhbGxDaGVjayA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59O1xuXG5iYWJlbEhlbHBlcnMuY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gICAgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgICBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgICByZXR1cm4gQ29uc3RydWN0b3I7XG4gIH07XG59KCk7XG5cbmJhYmVsSGVscGVycy5nZXQgPSBmdW5jdGlvbiBnZXQob2JqZWN0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpIHtcbiAgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcblxuICAgIGlmIChwYXJlbnQgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBnZXQocGFyZW50LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYykge1xuICAgIHJldHVybiBkZXNjLnZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHZhciBnZXR0ZXIgPSBkZXNjLmdldDtcblxuICAgIGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpO1xuICB9XG59O1xuXG5iYWJlbEhlbHBlcnMuaW5oZXJpdHMgPSBmdW5jdGlvbiAoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpO1xuICB9XG5cbiAgc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IHtcbiAgICAgIHZhbHVlOiBzdWJDbGFzcyxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9XG4gIH0pO1xuICBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7XG59O1xuXG5iYWJlbEhlbHBlcnMucG9zc2libGVDb25zdHJ1Y3RvclJldHVybiA9IGZ1bmN0aW9uIChzZWxmLCBjYWxsKSB7XG4gIGlmICghc2VsZikge1xuICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtcbiAgfVxuXG4gIHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmO1xufTtcblxuYmFiZWxIZWxwZXJzOyIsIihmdW5jdGlvbigpe1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhci5tb2R1bGUoJ29uc2VuJykuZGlyZWN0aXZlKCdvbnNSYW5nZScsIGZ1bmN0aW9uKCRwYXJzZSkge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgcmVwbGFjZTogZmFsc2UsXG4gICAgICBzY29wZTogZmFsc2UsXG5cbiAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICBDdXN0b21FbGVtZW50cy51cGdyYWRlKGVsZW1lbnRbMF0pO1xuXG4gICAgICAgIGNvbnN0IG9uSW5wdXQgPSAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgc2V0ID0gJHBhcnNlKGF0dHJzLm5nTW9kZWwpLmFzc2lnbjtcblxuICAgICAgICAgIHNldChzY29wZSwgZWxlbWVudFswXS52YWx1ZSk7XG4gICAgICAgICAgaWYgKGF0dHJzLm5nQ2hhbmdlKSB7XG4gICAgICAgICAgICBzY29wZS4kZXZhbChhdHRycy5uZ0NoYW5nZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNjb3BlLiRwYXJlbnQuJGV2YWxBc3luYygpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChhdHRycy5uZ01vZGVsKSB7XG4gICAgICAgICAgc2NvcGUuJHdhdGNoKGF0dHJzLm5nTW9kZWwsICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgZWxlbWVudFswXS52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgZWxlbWVudC5vbignaW5wdXQnLCBvbklucHV0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgICAgICAgZWxlbWVudC5vZmYoJ2lucHV0Jywgb25JbnB1dCk7XG4gICAgICAgICAgc2NvcGUgPSBlbGVtZW50ID0gYXR0cnMgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKS5kaXJlY3RpdmUoJ29uc1JpcHBsZScsIGZ1bmN0aW9uKCRvbnNlbiwgR2VuZXJpY1ZpZXcpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICBDdXN0b21FbGVtZW50cy51cGdyYWRlKGVsZW1lbnRbMF0pO1xuICAgICAgICBHZW5lcmljVmlldy5yZWdpc3RlcihzY29wZSwgZWxlbWVudCwgYXR0cnMsIHt2aWV3S2V5OiAnb25zLXJpcHBsZSd9KTtcbiAgICAgICAgJG9uc2VuLmZpcmVDb21wb25lbnRFdmVudChlbGVtZW50WzBdLCAnaW5pdCcpO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xufSkoKTtcbiIsIi8qKlxuICogQGVsZW1lbnQgb25zLXNjb3BlXG4gKiBAY2F0ZWdvcnkgdXRpbFxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1BbGwgY2hpbGQgZWxlbWVudHMgdXNpbmcgdGhlIFwidmFyXCIgYXR0cmlidXRlIHdpbGwgYmUgYXR0YWNoZWQgdG8gdGhlIHNjb3BlIG9mIHRoaXMgZWxlbWVudC5bL2VuXVxuICogICBbamFdXCJ2YXJcIuWxnuaAp+OCkuS9v+OBo+OBpuOBhOOCi+WFqOOBpuOBruWtkOimgee0oOOBrnZpZXfjgqrjg5bjgrjjgqfjgq/jg4jjga/jgIHjgZPjga7opoHntKDjga5Bbmd1bGFySlPjgrnjgrPjg7zjg5fjgavov73liqDjgZXjgozjgb7jgZnjgIJbL2phXVxuICogQGV4YW1wbGVcbiAqIDxvbnMtbGlzdD5cbiAqICAgPG9ucy1saXN0LWl0ZW0gb25zLXNjb3BlIG5nLXJlcGVhdD1cIml0ZW0gaW4gaXRlbXNcIj5cbiAqICAgICA8b25zLWNhcm91c2VsIHZhcj1cImNhcm91c2VsXCI+XG4gKiAgICAgICA8b25zLWNhcm91c2VsLWl0ZW0gbmctY2xpY2s9XCJjYXJvdXNlbC5uZXh0KClcIj5cbiAqICAgICAgICAge3sgaXRlbSB9fVxuICogICAgICAgPC9vbnMtY2Fyb3VzZWwtaXRlbT5cbiAqICAgICAgIDwvb25zLWNhcm91c2VsLWl0ZW0gbmctY2xpY2s9XCJjYXJvdXNlbC5wcmV2KClcIj5cbiAqICAgICAgICAgLi4uXG4gKiAgICAgICA8L29ucy1jYXJvdXNlbC1pdGVtPlxuICogICAgIDwvb25zLWNhcm91c2VsPlxuICogICA8L29ucy1saXN0LWl0ZW0+XG4gKiA8L29ucy1saXN0PlxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKTtcblxuICBtb2R1bGUuZGlyZWN0aXZlKCdvbnNTY29wZScsIGZ1bmN0aW9uKCRvbnNlbikge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgcmVwbGFjZTogZmFsc2UsXG4gICAgICB0cmFuc2NsdWRlOiBmYWxzZSxcbiAgICAgIHNjb3BlOiBmYWxzZSxcblxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5kYXRhKCdfc2NvcGUnLCBzY29wZSk7XG5cbiAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGVsZW1lbnQuZGF0YSgnX3Njb3BlJywgdW5kZWZpbmVkKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59KSgpO1xuIiwiLyoqXG4gKiBAZWxlbWVudCBvbnMtc3BsaXR0ZXItY29udGVudFxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBvbnMtZGVzdHJveVxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BbGxvd3MgeW91IHRvIHNwZWNpZnkgY3VzdG9tIGJlaGF2aW9yIHdoZW4gdGhlIFwiZGVzdHJveVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXVwiZGVzdHJveVwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIGxhc3RSZWFkeSA9IHdpbmRvdy5PbnNTcGxpdHRlckNvbnRlbnRFbGVtZW50LnJld3JpdGFibGVzLnJlYWR5O1xuICB3aW5kb3cuT25zU3BsaXR0ZXJDb250ZW50RWxlbWVudC5yZXdyaXRhYmxlcy5yZWFkeSA9IG9ucy5fd2FpdERpcmV0aXZlSW5pdCgnb25zLXNwbGl0dGVyLWNvbnRlbnQnLCBsYXN0UmVhZHkpO1xuXG4gIHZhciBsYXN0TGluayA9IHdpbmRvdy5PbnNTcGxpdHRlckNvbnRlbnRFbGVtZW50LnJld3JpdGFibGVzLmxpbms7XG4gIHdpbmRvdy5PbnNTcGxpdHRlckNvbnRlbnRFbGVtZW50LnJld3JpdGFibGVzLmxpbmsgPSBmdW5jdGlvbihlbGVtZW50LCB0YXJnZXQsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHZpZXcgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudCkuZGF0YSgnb25zLXNwbGl0dGVyLWNvbnRlbnQnKTtcbiAgICBsYXN0TGluayhlbGVtZW50LCB0YXJnZXQsIG9wdGlvbnMsIGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgdmlldy5fbGluayh0YXJnZXQsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcblxuICBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKS5kaXJlY3RpdmUoJ29uc1NwbGl0dGVyQ29udGVudCcsIGZ1bmN0aW9uKCRjb21waWxlLCBTcGxpdHRlckNvbnRlbnQsICRvbnNlbikge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuXG4gICAgICBjb21waWxlOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xuICAgICAgICBDdXN0b21FbGVtZW50cy51cGdyYWRlKGVsZW1lbnRbMF0pO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICBDdXN0b21FbGVtZW50cy51cGdyYWRlKGVsZW1lbnRbMF0pO1xuXG4gICAgICAgICAgdmFyIHZpZXcgPSBuZXcgU3BsaXR0ZXJDb250ZW50KHNjb3BlLCBlbGVtZW50LCBhdHRycyk7XG5cbiAgICAgICAgICAkb25zZW4uZGVjbGFyZVZhckF0dHJpYnV0ZShhdHRycywgdmlldyk7XG4gICAgICAgICAgJG9uc2VuLnJlZ2lzdGVyRXZlbnRIYW5kbGVycyh2aWV3LCAnZGVzdHJveScpO1xuXG4gICAgICAgICAgZWxlbWVudC5kYXRhKCdvbnMtc3BsaXR0ZXItY29udGVudCcsIHZpZXcpO1xuXG4gICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmlldy5fZXZlbnRzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgZWxlbWVudC5kYXRhKCdvbnMtc3BsaXR0ZXItY29udGVudCcsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAkb25zZW4uZmlyZUNvbXBvbmVudEV2ZW50KGVsZW1lbnRbMF0sICdpbml0Jyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59KSgpO1xuIiwiLyoqXG4gKiBAZWxlbWVudCBvbnMtc3BsaXR0ZXItc2lkZVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBvbnMtZGVzdHJveVxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BbGxvd3MgeW91IHRvIHNwZWNpZnkgY3VzdG9tIGJlaGF2aW9yIHdoZW4gdGhlIFwiZGVzdHJveVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXVwiZGVzdHJveVwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLXByZW9wZW5cbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIHRoZSBcInByZW9wZW5cIiBldmVudCBpcyBmaXJlZC5bL2VuXVxuICogIFtqYV1cInByZW9wZW5cIuOCpOODmeODs+ODiOOBjOeZuueBq+OBleOCjOOBn+aZguOBruaMmeWLleOCkueLrOiHquOBq+aMh+WumuOBp+OBjeOBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIG9ucy1wcmVjbG9zZVxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BbGxvd3MgeW91IHRvIHNwZWNpZnkgY3VzdG9tIGJlaGF2aW9yIHdoZW4gdGhlIFwicHJlY2xvc2VcIiBldmVudCBpcyBmaXJlZC5bL2VuXVxuICogIFtqYV1cInByZWNsb3NlXCLjgqTjg5njg7Pjg4jjgYznmbrngavjgZXjgozjgZ/mmYLjga7mjJnli5XjgpLni6zoh6rjgavmjIflrprjgafjgY3jgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBvbnMtcG9zdG9wZW5cbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIHRoZSBcInBvc3RvcGVuXCIgZXZlbnQgaXMgZmlyZWQuWy9lbl1cbiAqICBbamFdXCJwb3N0b3Blblwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLXBvc3RjbG9zZVxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BbGxvd3MgeW91IHRvIHNwZWNpZnkgY3VzdG9tIGJlaGF2aW9yIHdoZW4gdGhlIFwicG9zdGNsb3NlXCIgZXZlbnQgaXMgZmlyZWQuWy9lbl1cbiAqICBbamFdXCJwb3N0Y2xvc2VcIuOCpOODmeODs+ODiOOBjOeZuueBq+OBleOCjOOBn+aZguOBruaMmeWLleOCkueLrOiHquOBq+aMh+WumuOBp+OBjeOBvuOBmeOAglsvamFdXG4gKi9cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBsYXN0UmVhZHkgPSB3aW5kb3cuT25zU3BsaXR0ZXJTaWRlRWxlbWVudC5yZXdyaXRhYmxlcy5yZWFkeTtcbiAgd2luZG93Lk9uc1NwbGl0dGVyU2lkZUVsZW1lbnQucmV3cml0YWJsZXMucmVhZHkgPSBvbnMuX3dhaXREaXJldGl2ZUluaXQoJ29ucy1zcGxpdHRlci1zaWRlJywgbGFzdFJlYWR5KTtcblxuICB2YXIgbGFzdExpbmsgPSB3aW5kb3cuT25zU3BsaXR0ZXJTaWRlRWxlbWVudC5yZXdyaXRhYmxlcy5saW5rO1xuICB3aW5kb3cuT25zU3BsaXR0ZXJTaWRlRWxlbWVudC5yZXdyaXRhYmxlcy5saW5rID0gZnVuY3Rpb24oZWxlbWVudCwgdGFyZ2V0LCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIHZhciB2aWV3ID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnQpLmRhdGEoJ29ucy1zcGxpdHRlci1zaWRlJyk7XG4gICAgbGFzdExpbmsoZWxlbWVudCwgdGFyZ2V0LCBvcHRpb25zLCBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIHZpZXcuX2xpbmsodGFyZ2V0LCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH07XG5cbiAgYW5ndWxhci5tb2R1bGUoJ29uc2VuJykuZGlyZWN0aXZlKCdvbnNTcGxpdHRlclNpZGUnLCBmdW5jdGlvbigkY29tcGlsZSwgU3BsaXR0ZXJTaWRlLCAkb25zZW4pIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcblxuICAgICAgY29tcGlsZTogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgQ3VzdG9tRWxlbWVudHMudXBncmFkZShlbGVtZW50WzBdKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgQ3VzdG9tRWxlbWVudHMudXBncmFkZShlbGVtZW50WzBdKTtcblxuICAgICAgICAgIHZhciB2aWV3ID0gbmV3IFNwbGl0dGVyU2lkZShzY29wZSwgZWxlbWVudCwgYXR0cnMpO1xuXG4gICAgICAgICAgJG9uc2VuLmRlY2xhcmVWYXJBdHRyaWJ1dGUoYXR0cnMsIHZpZXcpO1xuICAgICAgICAgICRvbnNlbi5yZWdpc3RlckV2ZW50SGFuZGxlcnModmlldywgJ2Rlc3Ryb3knKTtcblxuICAgICAgICAgIGVsZW1lbnQuZGF0YSgnb25zLXNwbGl0dGVyLXNpZGUnLCB2aWV3KTtcblxuICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZpZXcuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGVsZW1lbnQuZGF0YSgnb25zLXNwbGl0dGVyLXNpZGUnLCB1bmRlZmluZWQpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgJG9uc2VuLmZpcmVDb21wb25lbnRFdmVudChlbGVtZW50WzBdLCAnaW5pdCcpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpXG4gICAgLmRpcmVjdGl2ZSgnb25zVGFiJywgdGFiKVxuICAgIC5kaXJlY3RpdmUoJ29uc1RhYmJhckl0ZW0nLCB0YWIpOyAvLyBmb3IgQkNcblxuICBmdW5jdGlvbiB0YWIoJG9uc2VuKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgQ3VzdG9tRWxlbWVudHMudXBncmFkZShlbGVtZW50WzBdKTtcbiAgICAgICAgJG9uc2VuLmZpcmVDb21wb25lbnRFdmVudChlbGVtZW50WzBdLCAnaW5pdCcpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKCk7XG4iLCIvKipcbiAqIEBlbGVtZW50IG9ucy10YWJiYXJcbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgdmFyXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKiBAZGVzY3JpcHRpb25cbiAqICAgW2VuXVZhcmlhYmxlIG5hbWUgdG8gcmVmZXIgdGhpcyB0YWIgYmFyLlsvZW5dXG4gKiAgIFtqYV3jgZPjga7jgr/jg5bjg5Djg7zjgpLlj4LnhafjgZnjgovjgZ/jgoHjga7lkI3liY3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBoaWRlLXRhYnNcbiAqIEBpbml0b25seVxuICogQHR5cGUge0Jvb2xlYW59XG4gKiBAZGVmYXVsdCBmYWxzZVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1XaGV0aGVyIHRvIGhpZGUgdGhlIHRhYnMuIFZhbGlkIHZhbHVlcyBhcmUgdHJ1ZS9mYWxzZS5bL2VuXVxuICogICBbamFd44K/44OW44KS6Z2e6KGo56S644Gr44GZ44KL5aC05ZCI44Gr5oyH5a6a44GX44G+44GZ44CCdHJ1ZeOCguOBl+OBj+OBr2ZhbHNl44KS5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLXJlYWN0aXZlXG4gKiBAaW5pdG9ubHlcbiAqIEB0eXBlIHtFeHByZXNzaW9ufVxuICogQGRlc2NyaXB0aW9uXG4gKiAgW2VuXUFsbG93cyB5b3UgdG8gc3BlY2lmeSBjdXN0b20gYmVoYXZpb3Igd2hlbiB0aGUgXCJyZWFjdGl2ZVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXVwicmVhY3RpdmVcIuOCpOODmeODs+ODiOOBjOeZuueBq+OBleOCjOOBn+aZguOBruaMmeWLleOCkueLrOiHquOBq+aMh+WumuOBp+OBjeOBvuOBmeOAglsvamFdXG4gKi9cblxuLyoqXG4gKiBAYXR0cmlidXRlIG9ucy1wcmVjaGFuZ2VcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIHRoZSBcInByZWNoYW5nZVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXVwicHJlY2hhbmdlXCLjgqTjg5njg7Pjg4jjgYznmbrngavjgZXjgozjgZ/mmYLjga7mjJnli5XjgpLni6zoh6rjgavmjIflrprjgafjgY3jgb7jgZnjgIJbL2phXVxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSBvbnMtcG9zdGNoYW5nZVxuICogQGluaXRvbmx5XG4gKiBAdHlwZSB7RXhwcmVzc2lvbn1cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1BbGxvd3MgeW91IHRvIHNwZWNpZnkgY3VzdG9tIGJlaGF2aW9yIHdoZW4gdGhlIFwicG9zdGNoYW5nZVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXVwicG9zdGNoYW5nZVwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWluaXRcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIGEgcGFnZSdzIFwiaW5pdFwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXeODmuODvOOCuOOBrlwiaW5pdFwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLXNob3dcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIGEgcGFnZSdzIFwic2hvd1wiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXeODmuODvOOCuOOBrlwic2hvd1wi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWhpZGVcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIGEgcGFnZSdzIFwiaGlkZVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXeODmuODvOOCuOOBrlwiaGlkZVwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBhdHRyaWJ1dGUgb25zLWRlc3Ryb3lcbiAqIEBpbml0b25seVxuICogQHR5cGUge0V4cHJlc3Npb259XG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWxsb3dzIHlvdSB0byBzcGVjaWZ5IGN1c3RvbSBiZWhhdmlvciB3aGVuIGEgcGFnZSdzIFwiZGVzdHJveVwiIGV2ZW50IGlzIGZpcmVkLlsvZW5dXG4gKiAgW2phXeODmuODvOOCuOOBrlwiZGVzdHJveVwi44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf5pmC44Gu5oyZ5YuV44KS54us6Ieq44Gr5oyH5a6a44Gn44GN44G+44GZ44CCWy9qYV1cbiAqL1xuXG5cbi8qKlxuICogQG1ldGhvZCBvblxuICogQHNpZ25hdHVyZSBvbihldmVudE5hbWUsIGxpc3RlbmVyKVxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFtlbl1BZGQgYW4gZXZlbnQgbGlzdGVuZXIuWy9lbl1cbiAqICAgW2phXeOCpOODmeODs+ODiOODquOCueODiuODvOOCkui/veWKoOOBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lXG4gKiAgIFtlbl1OYW1lIG9mIHRoZSBldmVudC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI5ZCN44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXG4gKiAgIFtlbl1GdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZC5bL2VuXVxuICogICBbamFd44GT44Gu44Kk44OZ44Oz44OI44GM55m654Gr44GV44KM44Gf6Zqb44Gr5ZG844Gz5Ye644GV44KM44KL6Zai5pWw44Kq44OW44K444Kn44Kv44OI44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBtZXRob2Qgb25jZVxuICogQHNpZ25hdHVyZSBvbmNlKGV2ZW50TmFtZSwgbGlzdGVuZXIpXG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRoYXQncyBvbmx5IHRyaWdnZXJlZCBvbmNlLlsvZW5dXG4gKiAgW2phXeS4gOW6puOBoOOBkeWRvOOBs+WHuuOBleOCjOOCi+OCpOODmeODs+ODiOODquOCueODiuODvOOCkui/veWKoOOBl+OBvuOBmeOAglsvamFdXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lXG4gKiAgIFtlbl1OYW1lIG9mIHRoZSBldmVudC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI5ZCN44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXG4gKiAgIFtlbl1GdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZC5bL2VuXVxuICogICBbamFd44Kk44OZ44Oz44OI44GM55m654Gr44GX44Gf6Zqb44Gr5ZG844Gz5Ye644GV44KM44KL6Zai5pWw44Kq44OW44K444Kn44Kv44OI44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqL1xuXG4vKipcbiAqIEBtZXRob2Qgb2ZmXG4gKiBAc2lnbmF0dXJlIG9mZihldmVudE5hbWUsIFtsaXN0ZW5lcl0pXG4gKiBAZGVzY3JpcHRpb25cbiAqICBbZW5dUmVtb3ZlIGFuIGV2ZW50IGxpc3RlbmVyLiBJZiB0aGUgbGlzdGVuZXIgaXMgbm90IHNwZWNpZmllZCBhbGwgbGlzdGVuZXJzIGZvciB0aGUgZXZlbnQgdHlwZSB3aWxsIGJlIHJlbW92ZWQuWy9lbl1cbiAqICBbamFd44Kk44OZ44Oz44OI44Oq44K544OK44O844KS5YmK6Zmk44GX44G+44GZ44CC44KC44GX44Kk44OZ44Oz44OI44Oq44K544OK44O844KS5oyH5a6a44GX44Gq44GL44Gj44Gf5aC05ZCI44Gr44Gv44CB44Gd44Gu44Kk44OZ44Oz44OI44Gr57SQ44Gl44GP5YWo44Gm44Gu44Kk44OZ44Oz44OI44Oq44K544OK44O844GM5YmK6Zmk44GV44KM44G+44GZ44CCWy9qYV1cbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAqICAgW2VuXU5hbWUgb2YgdGhlIGV2ZW50LlsvZW5dXG4gKiAgIFtqYV3jgqTjg5njg7Pjg4jlkI3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAqICAgW2VuXUZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlsvZW5dXG4gKiAgIFtqYV3liYrpmaTjgZnjgovjgqTjg5njg7Pjg4jjg6rjgrnjg4rjg7zjgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBsYXN0UmVhZHkgPSB3aW5kb3cuT25zVGFiYmFyRWxlbWVudC5yZXdyaXRhYmxlcy5yZWFkeTtcbiAgd2luZG93Lk9uc1RhYmJhckVsZW1lbnQucmV3cml0YWJsZXMucmVhZHkgPSBvbnMuX3dhaXREaXJldGl2ZUluaXQoJ29ucy10YWJiYXInLCBsYXN0UmVhZHkpO1xuXG4gIHZhciBsYXN0TGluayA9IHdpbmRvdy5PbnNUYWJiYXJFbGVtZW50LnJld3JpdGFibGVzLmxpbms7XG4gIHdpbmRvdy5PbnNUYWJiYXJFbGVtZW50LnJld3JpdGFibGVzLmxpbmsgPSBmdW5jdGlvbih0YWJiYXJFbGVtZW50LCB0YXJnZXQsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHZpZXcgPSBhbmd1bGFyLmVsZW1lbnQodGFiYmFyRWxlbWVudCkuZGF0YSgnb25zLXRhYmJhcicpO1xuICAgIHZpZXcuX2NvbXBpbGVBbmRMaW5rKHRhcmdldCwgZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBsYXN0TGluayh0YWJiYXJFbGVtZW50LCB0YXJnZXQsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfTtcblxuICB2YXIgbGFzdFVubGluayA9IHdpbmRvdy5PbnNUYWJiYXJFbGVtZW50LnJld3JpdGFibGVzLnVubGluaztcbiAgd2luZG93Lk9uc1RhYmJhckVsZW1lbnQucmV3cml0YWJsZXMudW5saW5rID0gZnVuY3Rpb24odGFiYmFyRWxlbWVudCwgdGFyZ2V0LCBjYWxsYmFjaykge1xuICAgIGFuZ3VsYXIuZWxlbWVudCh0YXJnZXQpLmRhdGEoJ19zY29wZScpLiRkZXN0cm95KCk7XG4gICAgbGFzdFVubGluayh0YWJiYXJFbGVtZW50LCB0YXJnZXQsIGNhbGxiYWNrKTtcbiAgfTtcblxuICBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKS5kaXJlY3RpdmUoJ29uc1RhYmJhcicsIGZ1bmN0aW9uKCRvbnNlbiwgJGNvbXBpbGUsICRwYXJzZSwgVGFiYmFyVmlldykge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG5cbiAgICAgIHJlcGxhY2U6IGZhbHNlLFxuICAgICAgc2NvcGU6IHRydWUsXG5cbiAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY29udHJvbGxlcikge1xuXG4gICAgICAgIEN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoZWxlbWVudFswXSk7XG5cbiAgICAgICAgc2NvcGUuJHdhdGNoKGF0dHJzLmhpZGVUYWJzLCBmdW5jdGlvbihoaWRlKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBoaWRlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgaGlkZSA9IGhpZGUgPT09ICd0cnVlJztcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxlbWVudFswXS5zZXRUYWJiYXJWaXNpYmlsaXR5KCFoaWRlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHRhYmJhclZpZXcgPSBuZXcgVGFiYmFyVmlldyhzY29wZSwgZWxlbWVudCwgYXR0cnMpO1xuICAgICAgICAkb25zZW4uYWRkTW9kaWZpZXJNZXRob2RzRm9yQ3VzdG9tRWxlbWVudHModGFiYmFyVmlldywgZWxlbWVudCk7XG5cbiAgICAgICAgJG9uc2VuLnJlZ2lzdGVyRXZlbnRIYW5kbGVycyh0YWJiYXJWaWV3LCAncmVhY3RpdmUgcHJlY2hhbmdlIHBvc3RjaGFuZ2UgaW5pdCBzaG93IGhpZGUgZGVzdHJveScpO1xuXG4gICAgICAgIGVsZW1lbnQuZGF0YSgnb25zLXRhYmJhcicsIHRhYmJhclZpZXcpO1xuICAgICAgICAkb25zZW4uZGVjbGFyZVZhckF0dHJpYnV0ZShhdHRycywgdGFiYmFyVmlldyk7XG5cbiAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRhYmJhclZpZXcuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAkb25zZW4ucmVtb3ZlTW9kaWZpZXJNZXRob2RzKHRhYmJhclZpZXcpO1xuICAgICAgICAgIGVsZW1lbnQuZGF0YSgnb25zLXRhYmJhcicsIHVuZGVmaW5lZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRvbnNlbi5maXJlQ29tcG9uZW50RXZlbnQoZWxlbWVudFswXSwgJ2luaXQnKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKXtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpLmRpcmVjdGl2ZSgnb25zVGVtcGxhdGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgdGVybWluYWw6IHRydWUsXG4gICAgICBjb21waWxlOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIEN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoZWxlbWVudFswXSk7XG4gICAgICAgIHZhciBjb250ZW50ID0gZWxlbWVudFswXS50ZW1wbGF0ZSB8fCBlbGVtZW50Lmh0bWwoKTtcbiAgICAgICAgJHRlbXBsYXRlQ2FjaGUucHV0KGVsZW1lbnQuYXR0cignaWQnKSwgY29udGVudCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59KSgpO1xuIiwiLyoqXG4gKiBAZWxlbWVudCBvbnMtdG9vbGJhclxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSB2YXJcbiAqIEBpbml0b25seVxuICogQHR5cGUge1N0cmluZ31cbiAqIEBkZXNjcmlwdGlvblxuICogIFtlbl1WYXJpYWJsZSBuYW1lIHRvIHJlZmVyIHRoaXMgdG9vbGJhci5bL2VuXVxuICogIFtqYV3jgZPjga7jg4Tjg7zjg6vjg5Djg7zjgpLlj4LnhafjgZnjgovjgZ/jgoHjga7lkI3liY3jgpLmjIflrprjgZfjgb7jgZnjgIJbL2phXVxuICovXG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyLm1vZHVsZSgnb25zZW4nKS5kaXJlY3RpdmUoJ29uc1Rvb2xiYXInLCBmdW5jdGlvbigkb25zZW4sIEdlbmVyaWNWaWV3KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG5cbiAgICAgIC8vIE5PVEU6IFRoaXMgZWxlbWVudCBtdXN0IGNvZXhpc3RzIHdpdGggbmctY29udHJvbGxlci5cbiAgICAgIC8vIERvIG5vdCB1c2UgaXNvbGF0ZWQgc2NvcGUgYW5kIHRlbXBsYXRlJ3MgbmctdHJhbnNjbHVkZS5cbiAgICAgIHNjb3BlOiBmYWxzZSxcbiAgICAgIHRyYW5zY2x1ZGU6IGZhbHNlLFxuXG4gICAgICBjb21waWxlOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIEN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoZWxlbWVudFswXSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcHJlOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSB0aGlzIGRpcnR5IGZpeCFcbiAgICAgICAgICAgIGlmIChlbGVtZW50WzBdLm5vZGVOYW1lID09PSAnb25zLXRvb2xiYXInKSB7XG4gICAgICAgICAgICAgIEN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoZWxlbWVudFswXSk7XG4gICAgICAgICAgICAgIEdlbmVyaWNWaWV3LnJlZ2lzdGVyKHNjb3BlLCBlbGVtZW50LCBhdHRycywge3ZpZXdLZXk6ICdvbnMtdG9vbGJhcid9KTtcbiAgICAgICAgICAgICAgZWxlbWVudFswXS5fZW5zdXJlTm9kZVBvc2l0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBwb3N0OiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgICRvbnNlbi5maXJlQ29tcG9uZW50RXZlbnQoZWxlbWVudFswXSwgJ2luaXQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG5cbn0pKCk7XG4iLCIvKipcbiAqIEBlbGVtZW50IG9ucy10b29sYmFyLWJ1dHRvblxuICovXG5cbi8qKlxuICogQGF0dHJpYnV0ZSB2YXJcbiAqIEBpbml0b25seVxuICogQHR5cGUge1N0cmluZ31cbiAqIEBkZXNjcmlwdGlvblxuICogICBbZW5dVmFyaWFibGUgbmFtZSB0byByZWZlciB0aGlzIGJ1dHRvbi5bL2VuXVxuICogICBbamFd44GT44Gu44Oc44K/44Oz44KS5Y+C54Wn44GZ44KL44Gf44KB44Gu5ZCN5YmN44KS5oyH5a6a44GX44G+44GZ44CCWy9qYV1cbiAqL1xuKGZ1bmN0aW9uKCl7XG4gICd1c2Ugc3RyaWN0JztcbiAgdmFyIG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpO1xuXG4gIG1vZHVsZS5kaXJlY3RpdmUoJ29uc1Rvb2xiYXJCdXR0b24nLCBmdW5jdGlvbigkb25zZW4sIEdlbmVyaWNWaWV3KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICBzY29wZTogZmFsc2UsXG4gICAgICBsaW5rOiB7XG4gICAgICAgIHByZTogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgQ3VzdG9tRWxlbWVudHMudXBncmFkZShlbGVtZW50WzBdKTtcbiAgICAgICAgICB2YXIgdG9vbGJhckJ1dHRvbiA9IG5ldyBHZW5lcmljVmlldyhzY29wZSwgZWxlbWVudCwgYXR0cnMpO1xuICAgICAgICAgIGVsZW1lbnQuZGF0YSgnb25zLXRvb2xiYXItYnV0dG9uJywgdG9vbGJhckJ1dHRvbik7XG4gICAgICAgICAgJG9uc2VuLmRlY2xhcmVWYXJBdHRyaWJ1dGUoYXR0cnMsIHRvb2xiYXJCdXR0b24pO1xuXG4gICAgICAgICAgJG9uc2VuLmFkZE1vZGlmaWVyTWV0aG9kc0ZvckN1c3RvbUVsZW1lbnRzKHRvb2xiYXJCdXR0b24sIGVsZW1lbnQpO1xuXG4gICAgICAgICAgJG9uc2VuLmNsZWFuZXIub25EZXN0cm95KHNjb3BlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRvb2xiYXJCdXR0b24uX2V2ZW50cyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICRvbnNlbi5yZW1vdmVNb2RpZmllck1ldGhvZHModG9vbGJhckJ1dHRvbik7XG4gICAgICAgICAgICBlbGVtZW50LmRhdGEoJ29ucy10b29sYmFyLWJ1dHRvbicsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICBlbGVtZW50ID0gbnVsbDtcblxuICAgICAgICAgICAgJG9uc2VuLmNsZWFyQ29tcG9uZW50KHtcbiAgICAgICAgICAgICAgc2NvcGU6IHNjb3BlLFxuICAgICAgICAgICAgICBhdHRyczogYXR0cnMsXG4gICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNjb3BlID0gZWxlbWVudCA9IGF0dHJzID0gbnVsbDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgcG9zdDogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgJG9uc2VuLmZpcmVDb21wb25lbnRFdmVudChlbGVtZW50WzBdLCAnaW5pdCcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59KSgpO1xuIiwiLypcbkNvcHlyaWdodCAyMDEzLTIwMTUgQVNJQUwgQ09SUE9SQVRJT05cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuKi9cblxuKGZ1bmN0aW9uKCl7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ29uc2VuJyk7XG5cbiAgdmFyIENvbXBvbmVudENsZWFuZXIgPSB7XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtqcUxpdGV9IGVsZW1lbnRcbiAgICAgKi9cbiAgICBkZWNvbXBvc2VOb2RlOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB2YXIgY2hpbGRyZW4gPSBlbGVtZW50LnJlbW92ZSgpLmNoaWxkcmVuKCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIENvbXBvbmVudENsZWFuZXIuZGVjb21wb3NlTm9kZShhbmd1bGFyLmVsZW1lbnQoY2hpbGRyZW5baV0pKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtBdHRyaWJ1dGVzfSBhdHRyc1xuICAgICAqL1xuICAgIGRlc3Ryb3lBdHRyaWJ1dGVzOiBmdW5jdGlvbihhdHRycykge1xuICAgICAgYXR0cnMuJCRlbGVtZW50ID0gbnVsbDtcbiAgICAgIGF0dHJzLiQkb2JzZXJ2ZXJzID0gbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtqcUxpdGV9IGVsZW1lbnRcbiAgICAgKi9cbiAgICBkZXN0cm95RWxlbWVudDogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgZWxlbWVudC5yZW1vdmUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtTY29wZX0gc2NvcGVcbiAgICAgKi9cbiAgICBkZXN0cm95U2NvcGU6IGZ1bmN0aW9uKHNjb3BlKSB7XG4gICAgICBzY29wZS4kJGxpc3RlbmVycyA9IHt9O1xuICAgICAgc2NvcGUuJCR3YXRjaGVycyA9IG51bGw7XG4gICAgICBzY29wZSA9IG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U2NvcGV9IHNjb3BlXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICAgKi9cbiAgICBvbkRlc3Ryb3k6IGZ1bmN0aW9uKHNjb3BlLCBmbikge1xuICAgICAgdmFyIGNsZWFyID0gc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICAgICBjbGVhcigpO1xuICAgICAgICBmbi5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIG1vZHVsZS5mYWN0b3J5KCdDb21wb25lbnRDbGVhbmVyJywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIENvbXBvbmVudENsZWFuZXI7XG4gIH0pO1xuXG4gIC8vIG92ZXJyaWRlIGJ1aWx0aW4gbmctKGV2ZW50bmFtZSkgZGlyZWN0aXZlc1xuICAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5nRXZlbnREaXJlY3RpdmVzID0ge307XG4gICAgJ2NsaWNrIGRibGNsaWNrIG1vdXNlZG93biBtb3VzZXVwIG1vdXNlb3ZlciBtb3VzZW91dCBtb3VzZW1vdmUgbW91c2VlbnRlciBtb3VzZWxlYXZlIGtleWRvd24ga2V5dXAga2V5cHJlc3Mgc3VibWl0IGZvY3VzIGJsdXIgY29weSBjdXQgcGFzdGUnLnNwbGl0KCcgJykuZm9yRWFjaChcbiAgICAgIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdmFyIGRpcmVjdGl2ZU5hbWUgPSBkaXJlY3RpdmVOb3JtYWxpemUoJ25nLScgKyBuYW1lKTtcbiAgICAgICAgbmdFdmVudERpcmVjdGl2ZXNbZGlyZWN0aXZlTmFtZV0gPSBbJyRwYXJzZScsIGZ1bmN0aW9uKCRwYXJzZSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb21waWxlOiBmdW5jdGlvbigkZWxlbWVudCwgYXR0cikge1xuICAgICAgICAgICAgICB2YXIgZm4gPSAkcGFyc2UoYXR0cltkaXJlY3RpdmVOYW1lXSk7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cikge1xuICAgICAgICAgICAgICAgIHZhciBsaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGZuKHNjb3BlLCB7JGV2ZW50OiBldmVudH0pO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm9uKG5hbWUsIGxpc3RlbmVyKTtcblxuICAgICAgICAgICAgICAgIENvbXBvbmVudENsZWFuZXIub25EZXN0cm95KHNjb3BlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIGVsZW1lbnQub2ZmKG5hbWUsIGxpc3RlbmVyKTtcbiAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgICBDb21wb25lbnRDbGVhbmVyLmRlc3Ryb3lTY29wZShzY29wZSk7XG4gICAgICAgICAgICAgICAgICBzY29wZSA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICAgIENvbXBvbmVudENsZWFuZXIuZGVzdHJveUF0dHJpYnV0ZXMoYXR0cik7XG4gICAgICAgICAgICAgICAgICBhdHRyID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9XTtcblxuICAgICAgICBmdW5jdGlvbiBkaXJlY3RpdmVOb3JtYWxpemUobmFtZSkge1xuICAgICAgICAgIHJldHVybiBuYW1lLnJlcGxhY2UoLy0oW2Etel0pL2csIGZ1bmN0aW9uKG1hdGNoZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXRjaGVzWzFdLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICAgIG1vZHVsZS5jb25maWcoZnVuY3Rpb24oJHByb3ZpZGUpIHtcbiAgICAgIHZhciBzaGlmdCA9IGZ1bmN0aW9uKCRkZWxlZ2F0ZSkge1xuICAgICAgICAkZGVsZWdhdGUuc2hpZnQoKTtcbiAgICAgICAgcmV0dXJuICRkZWxlZ2F0ZTtcbiAgICAgIH07XG4gICAgICBPYmplY3Qua2V5cyhuZ0V2ZW50RGlyZWN0aXZlcykuZm9yRWFjaChmdW5jdGlvbihkaXJlY3RpdmVOYW1lKSB7XG4gICAgICAgICRwcm92aWRlLmRlY29yYXRvcihkaXJlY3RpdmVOYW1lICsgJ0RpcmVjdGl2ZScsIFsnJGRlbGVnYXRlJywgc2hpZnRdKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIE9iamVjdC5rZXlzKG5nRXZlbnREaXJlY3RpdmVzKS5mb3JFYWNoKGZ1bmN0aW9uKGRpcmVjdGl2ZU5hbWUpIHtcbiAgICAgIG1vZHVsZS5kaXJlY3RpdmUoZGlyZWN0aXZlTmFtZSwgbmdFdmVudERpcmVjdGl2ZXNbZGlyZWN0aXZlTmFtZV0pO1xuICAgIH0pO1xuICB9KSgpO1xufSkoKTtcbiIsIi8qXG5Db3B5cmlnaHQgMjAxMy0yMDE1IEFTSUFMIENPUlBPUkFUSU9OXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbiovXG5cblsnYWxlcnQnLCAnY29uZmlybScsICdwcm9tcHQnXS5mb3JFYWNoKG5hbWUgPT4ge1xuICBvbnMubm90aWZpY2F0aW9uW25hbWVdID0gKG1lc3NhZ2UsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICAgIHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJyA/IChvcHRpb25zLm1lc3NhZ2UgPSBtZXNzYWdlKSA6IChvcHRpb25zID0gbWVzc2FnZSk7XG5cbiAgICBjb25zdCBjb21waWxlID0gb3B0aW9ucy5jb21waWxlO1xuXG4gICAgb3B0aW9ucy5jb21waWxlID0gZWxlbWVudCA9PiB7XG4gICAgICBjb25zdCAkZWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudChjb21waWxlID8gY29tcGlsZShlbGVtZW50KSA6IGVsZW1lbnQpO1xuICAgICAgcmV0dXJuIG9ucy4kY29tcGlsZSgkZWxlbWVudCkoJGVsZW1lbnQuaW5qZWN0b3IoKS5nZXQoJyRyb290U2NvcGUnKSk7XG4gICAgfTtcblxuICAgIHJldHVybiBvbnMubm90aWZpY2F0aW9uW2BfJHtuYW1lfU9yaWdpbmFsYF0ob3B0aW9ucyk7XG4gIH07XG59KTsiLCIvLyBjb25maXJtIHRvIHVzZSBqcUxpdGVcbmlmICh3aW5kb3cualF1ZXJ5ICYmIGFuZ3VsYXIuZWxlbWVudCA9PT0gd2luZG93LmpRdWVyeSkge1xuICBjb25zb2xlLndhcm4oJ09uc2VuIFVJIHJlcXVpcmUganFMaXRlLiBMb2FkIGpRdWVyeSBhZnRlciBsb2FkaW5nIEFuZ3VsYXJKUyB0byBmaXggdGhpcyBlcnJvci4galF1ZXJ5IG1heSBicmVhayBPbnNlbiBVSSBiZWhhdmlvci4nKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG59XG4iLCIvKlxuQ29weXJpZ2h0IDIwMTMtMjAxNSBBU0lBTCBDT1JQT1JBVElPTlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4qL1xuXG4oZnVuY3Rpb24oKXtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXIubW9kdWxlKCdvbnNlbicpLnJ1bihmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAgIHZhciB0ZW1wbGF0ZXMgPSB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W3R5cGU9XCJ0ZXh0L29ucy10ZW1wbGF0ZVwiXScpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZW1wbGF0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB0ZW1wbGF0ZSA9IGFuZ3VsYXIuZWxlbWVudCh0ZW1wbGF0ZXNbaV0pO1xuICAgICAgdmFyIGlkID0gdGVtcGxhdGUuYXR0cignaWQnKTtcbiAgICAgIGlmICh0eXBlb2YgaWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICR0ZW1wbGF0ZUNhY2hlLnB1dChpZCwgdGVtcGxhdGUudGV4dCgpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG59KSgpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
