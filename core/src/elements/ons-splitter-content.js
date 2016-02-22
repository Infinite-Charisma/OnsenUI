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

import util from 'ons/util';
import internal from 'ons/internal';
import ModifierUtil from 'ons/internal/modifier-util';
import BaseElement from 'ons/base-element';

const rewritables = {
  /**
   * @param {Element} splitterSideElement
   * @param {Function} callback
   */
  ready(splitterSideElement, callback) {
    setImmediate(callback);
  },

  /**
   * @param {Element} splitterSideElement
   * @param {HTMLFragment} target
   * @param {Object} options
   * @param {Function} callback
   */
  link(splitterSideElement, target, options, callback) {
    callback(target);
  }
};

/**
 * @element ons-splitter-content
 * @category control
 * @description
 *  [en]The "ons-splitter-content" element is used as a child element of "ons-splitter".[/en]
 *  [ja]ons-splitter-content要素は、ons-splitter要素の子要素として利用します。[/ja]
 * @codepen rOQOML
 * @example
 * <ons-splitter>
 *   <ons-splitter-content>
 *     ...
 *   </ons-splitter-content>
 *
 *   <ons-splitter-side side="left" width="80%" collapse>
 *     ...
 *   </ons-splitter-side>
 * </ons-splitter>
 */
class SplitterContentElement extends BaseElement {

  /**
   * @attribute page
   * @initonly
   * @type {String}
   * @description
   *   [en]The url of the menu page.[/en]
   *   [ja]ons-splitter-side要素に表示するページのURLを指定します。[/ja]
   */

  get page() {
    return this._page;
  }

  createdCallback() {
    this._page = null;
  }

  /**
   * @method load
   * @signature load(pageUrl)
   * @param {String} pageUrl
   *   [en]Page URL. Can be either an HTML document or an <ons-template>.[/en]
   *   [ja]pageのURLか、ons-templateで宣言したテンプレートのid属性の値を指定します。[/ja]
   * @param {Object} [options]
   * @param {Function} [options.callback]
   * @description
   *   [en]Show the page specified in pageUrl in the right section[/en]
   *   [ja]指定したURLをメインページを読み込みます。[/ja]
   * @return {Promise}
   *   [en]Resolves to the new page element[/en]
   *   [ja][/ja]
   */
  load(page, options = {}) {
    this._page = page;

    options.callback = options.callback instanceof Function ? options.callback : () => {};
    return internal.getPageHTMLAsync(page).then((html) => {
      return new Promise(resolve => {
        rewritables.link(this, util.createFragment(html), options, (fragment) => {
          util.propagateAction(this, '_hide');
          this.innerHTML = '';

          this.appendChild(fragment);

          util.propagateAction(this, '_show');

          options.callback();
          resolve(this.firstChild);
        });
      });
    });
  }

  attachedCallback() {
    this._assertParent();

    if (this.hasAttribute('page')) {
      setImmediate(() => rewritables.ready(this, () => this.load(this.getAttribute('page'))));
    }
  }

  detachedCallback() {
  }

  _show() {
    util.propagateAction(this, '_show');
  }

  _hide() {
    util.propagateAction(this, '_hide');
  }

  _destroy() {
    util.propagateAction(this, '_destroy');
    this.remove();
  }

  _assertParent() {
    const parentElementName = this.parentElement.nodeName.toLowerCase();
    if (parentElementName !== 'ons-splitter') {
      throw new Error(`"${parentElementName}" element is not allowed as parent element.`);
    }
  }
}

window.OnsSplitterContentElement = document.registerElement('ons-splitter-content', {
  prototype: SplitterContentElement.prototype
});

window.OnsSplitterContentElement.rewritables = rewritables;
