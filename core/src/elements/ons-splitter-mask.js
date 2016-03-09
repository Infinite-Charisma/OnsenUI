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

import BaseElement from 'ons/base-element';

class SplitterMaskElement extends BaseElement {

  _createdCallback() {
    this._boundOnClick = this._onClick.bind(this);
  }

  _onClick(event) {
    if (this.parentElement && this.parentElement.nodeName.toLowerCase() === 'ons-splitter') {
      // close side menus
      this.parentElement.closeRight().catch(() => {});
      this.parentElement.closeLeft().catch(() => {});
    }
    event.stopPropagation();
  }

  _attributeChangedCallback(name, last, current) {
  }

  _attachedCallback() {
    this.addEventListener('click', this._boundOnClick);
  }

  _detachedCallback() {
    this.removeEventListener('click', this._boundOnClick);
  }
}

window.OnsSplitterMaskElement = document.registerElement('ons-splitter-mask', {
  prototype: SplitterMaskElement.prototype
});
