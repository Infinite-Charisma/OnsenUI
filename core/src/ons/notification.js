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

import util from './util';
import contentReady from 'ons/content-ready';

/**
 * @object ons.notification
 * @category dialog
 * @tutorial vanilla/Reference/dialog
 * @description
 *   [en]
 *     Utility methods to create different kinds of alert dialogs. There are three methods available:
 *
 *     * `ons.notification.alert()`
 *     * `ons.notification.confirm()`
 *     * `ons.notification.prompt()`
 *
 *     It will automatically display a Material Design dialog on Android devices.
 *   [/en]
 *   [ja]いくつかの種類のアラートダイアログを作成するためのユーティリティメソッドを収めたオブジェクトです。[/ja]
 * @example
 * ons.notification.alert('Hello, world!');
 *
 * ons.notification.confirm('Are you ready?')
 *   .then(
 *     function(answer) {
 *       if (answer === 1) {
 *         ons.notification.alert('Let\'s go!');
 *       }
 *     }
 *   );
 *
 * ons.notification.prompt('How old are ?')
 *   .then(
 *     function(age) {
 *       ons.notification.alert('You are ' + age + ' years old.');
 *     }
 *   );
 */
const notification = {};

notification._createAlertDialog = options => {
  // Prompt input string
  let inputString = '';
  if (options.isPrompt) {
    inputString = `
      <input
        class="text-input text-input--underbar"
        type="${options.inputType || 'text'}"
        placeholder="${options.placeholder || ''}"
        value="${options.defaultValue || ''}"
        style="width: 100%; margin-top: 10px;"
      />
    `;
  }

  // Buttons string
  let buttons = '';
  options.buttonLabels.forEach((label, index) => {
    buttons += `
      <button class="
        alert-dialog-button
        ${index === options.primaryButtonIndex ? ' alert-dialog-button--primal' : ''}
        ${options.buttonLabels.length <= 2 ? ' alert-dialog-button--one' : ''}
      ">
        ${label}
      </button>
    `;
  });

  // Dialog Element
  let dialogElement = document.createElement('ons-alert-dialog');
  innerHTML(dialogElement, `
    <div class="alert-dialog-mask"></div>
    <div class="alert-dialog">
      <div class="alert-dialog-container">
        <div class="alert-dialog-title">
          ${options.title || ''}
        </div>
        <div class="alert-dialog-content">
          ${options.message || options.messageHTML}
          ${inputString}
        </div>
        <div class="
          alert-dialog-footer
          ${options.buttonLabels.length <= 2 ? ' alert-dialog-footer--one' : ''}
        ">
          ${buttons}
        </div>
      </div>
    </div>
  `);
  contentReady(dialogElement);

  // Set attributes
  ['id', 'class', 'animation']
    .forEach(a => options.hasOwnProperty(a) && dialogElement.setAttribute(a, options[a]));
  if (options.modifier) {
    util.addModifier(dialogElement, options.modifier);
  }

  const deferred = util.defer();

  // Prompt events
  let inputElement;
  if (options.isPrompt && options.submitOnEnter) {
    inputElement = dialogElement.querySelector('.text-input');
    inputElement.addEventListener('keypress', event => {
      if (event.keyCode === 13) {
        dialogElement.hide()
          .then(() => {
            const resolveValue = inputElement.value;
            dialogElement.remove();
            dialogElement = inputElement = null;
            options.callback(resolveValue);
            deferred.resolve(resolveValue);
          });
      }
    }, false);
  }

  // Button events
  let footerElement = dialogElement.querySelector('.alert-dialog-footer');
  util.arrayFrom(dialogElement.querySelectorAll('.alert-dialog-button')).forEach((buttonElement, index) => {
    buttonElement.onclick = () => {
      dialogElement.hide()
        .then(() => {
          const resolveValue = options.isPrompt ? inputElement.value : index;
          dialogElement.remove();
          dialogElement = inputElement = buttonElement = null;
          options.callback(resolveValue);
          deferred.resolve(resolveValue);
        });
    };

    footerElement.appendChild(buttonElement);
  });
  footerElement = null;

  // Cancel events
  if (options.cancelable) {
    dialogElement.cancelable = true;
    dialogElement.addEventListener('dialog-cancel', () => {
      setImmediate(() => {
        dialogElement.remove();
        dialogElement = inputElement = null;
      });
      const resolveValue = options.isPrompt ? null : -1;
      options.callback(resolveValue);
      deferred.reject(resolveValue);
    }, false);
  }

  // Show dialog
  document.body.appendChild(dialogElement);
  options.compile(dialogElement);
  setImmediate(() => {
    dialogElement.show()
    .then(() => {
      if (inputElement && options.isPrompt && options.autofocus) {
        inputElement.focus();
      }
    });
  });

  return deferred.promise;
};

const _normalizeArguments = (message, options = {}, defaults = {}) => {
  typeof message === 'string' ? (options.message = message) : (options = message);
  if (!options.message && !options.messageHTML) {
    throw new Error('Alert dialog must contain a message.');
  }

  if (options.hasOwnProperty('buttonLabels') || options.hasOwnProperty('buttonLabel')) {
    options.buttonLabels = options.buttonLabels || options.buttonLabel;
    if (!Array.isArray(options.buttonLabels)) {
      options.buttonLabels = [options.buttonLabels || '']
    }
  }

  return util.extend({
      compile: param => param,
      callback: param => param,
      buttonLabels: ['OK'],
      primaryButtonIndex: 0,
      animation: 'default',
      cancelable: false
    }, defaults, options);
};

/**
 * @method alert
 * @signature alert(message [, options] | options)
 * @return {Promise}
 *   [en]Will resolve when the dialog is closed.[/en]
 *   [ja][/ja]
 * @param {String} message
 *   [en]Alert message. This argument is optional but if it's not defined either `options.message` or `options.messageHTML` must be defined instead.[/en]
 *   [ja][/ja]
 * @param {Object} options
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクトです。[/ja]
 * @param {String} [options.message]
 *   [en]Alert message.[/en]
 *   [ja]アラートダイアログに表示する文字列を指定します。[/ja]
 * @param {String} [options.messageHTML]
 *   [en]Alert message in HTML.[/en]
 *   [ja]アラートダイアログに表示するHTMLを指定します。[/ja]
 * @param {String | Array} [options.buttonLabels]
 *   [en]Labels for the buttons. Default is `"OK"`.[/en]
 *   [ja]確認ボタンのラベルを指定します。"OK"がデフォルトです。[/ja]
 * @param {Number} [options.primaryButtonIndex]
 *   [en]Index of primary button. Default is `0`.[/en]
 *   [ja]プライマリボタンのインデックスを指定します。デフォルトは 0 です。[/ja]
 * @param {Boolean} [options.cancelable]
 *   [en]Whether the dialog is cancelable or not. Default is `false`. If the dialog is cancelable it can be closed by clicking the background or pressing the Android back button.[/en]
 *   [ja]ダイアログがキャンセル可能かどうかを指定します。[/ja]
 * @param {String} [options.animation]
 *   [en]Animation name. Available animations are `none` and `fade`. Default is `fade`.[/en]
 *   [ja]アラートダイアログを表示する際のアニメーション名を指定します。"none", "fade"のいずれかを指定できます。[/ja]
 * @param {String} [options.id]
 *   [en]The `<ons-alert-dialog>` element's ID.[/en]
 *   [ja]ons-alert-dialog要素のID。[/ja]
 * @param {String} [options.class]
 *   [en]The `<ons-alert-dialog>` element's class.[/en]
 *   [ja]ons-alert-dialog要素のclass。[/ja]
 * @param {String} [options.title]
 *   [en]Dialog title. Default is `"Alert"`.[/en]
 *   [ja]アラートダイアログの上部に表示するタイトルを指定します。"Alert"がデフォルトです。[/ja]
 * @param {String} [options.modifier]
 *   [en]Modifier for the dialog.[/en]
 *   [ja]アラートダイアログのmodifier属性の値を指定します。[/ja]
 * @param {Function} [options.callback]
 *   [en]Function that executes after dialog has been closed.[/en]
 *   [ja]アラートダイアログが閉じられた時に呼び出される関数オブジェクトを指定します。[/ja]
 * @description
 *   [en]
 *     Display an alert dialog to show the user a message.
 *
 *     The content of the message can be either simple text or HTML.
 *
 *     It can be called in the following ways:
 *
 *     ```
 *     ons.notification.alert(message, options);
 *     ons.notification.alert(options);
 *     ```
 *
 *     Must specify either `message` or `messageHTML`.
 *   [/en]
 *   [ja]
 *     ユーザーへメッセージを見せるためのアラートダイアログを表示します。
 *     表示するメッセージは、テキストかもしくはHTMLを指定できます。
 *     このメソッドの引数には、options.messageもしくはoptions.messageHTMLのどちらかを必ず指定する必要があります。
 *   [/ja]
 */
notification.alert = (message, options) => {
  options = _normalizeArguments(message, options, {
    title: 'Alert'
  });

  return notification._createAlertDialog(options);
};

/**
 * @method confirm
 * @signature confirm(message [, options] | options)
 * @return {Promise}
 *   [en]Will resolve to the index of the button that was pressed.[/en]
 *   [ja][/ja]
 * @param {String} message
 *   [en]Alert message. This argument is optional but if it's not defined either `options.message` or `options.messageHTML` must be defined instead.[/en]
 *   [ja][/ja]
 * @param {Object} options
 *   [en]Parameter object.[/en]
 * @param {Array} [options.buttonLabels]
 *   [en]Labels for the buttons. Default is `["Cancel", "OK"]`.[/en]
 *   [ja]ボタンのラベルの配列を指定します。["Cancel", "OK"]がデフォルトです。[/ja]
 * @param {Number} [options.primaryButtonIndex]
 *   [en]Index of primary button. Default is `1`.[/en]
 *   [ja]プライマリボタンのインデックスを指定します。デフォルトは 1 です。[/ja]
 * @description
 *   [en]
 *     Display a dialog to ask the user for confirmation. Extends `alert()` parameters.
 *     The default button labels are `"Cancel"` and `"OK"` but they can be customized.
 *
 *     It can be called in the following ways:
 *
 *     ```
 *     ons.notification.confirm(message, options);
 *     ons.notification.confirm(options);
 *     ```
 *
 *     Must specify either `message` or `messageHTML`.
 *   [/en]
 *   [ja]
 *     ユーザに確認を促すダイアログを表示します。
 *     デオルとのボタンラベルは、"Cancel"と"OK"ですが、これはこのメソッドの引数でカスタマイズできます。
 *     このメソッドの引数には、options.messageもしくはoptions.messageHTMLのどちらかを必ず指定する必要があります。
 *   [/ja]
 */
notification.confirm = (message, options) => {
  options = _normalizeArguments(message, options, {
    buttonLabels: ['Cancel', 'OK'],
    primaryButtonIndex: 1,
    title: 'Confirm'
  });

  return notification._createAlertDialog(options);
};

/**
 * @method prompt
 * @signature prompt(message [, options] | options)
 * @param {String} message
 *   [en]Alert message. This argument is optional but if it's not defined either `options.message` or `options.messageHTML` must be defined instead.[/en]
 *   [ja][/ja]
 * @return {Promise}
 *   [en]Will resolve to the input value when the dialog is closed.[/en]
 *   [ja][/ja]
 * @param {Object} options
 *   [en]Parameter object.[/en]
 *   [ja]オプションを指定するオブジェクトです。[/ja]
 * @param {String | Array} [options.buttonLabels]
 *   [en]Labels for the buttons. Default is `"OK"`.[/en]
 *   [ja]確認ボタンのラベルを指定します。"OK"がデフォルトです。[/ja]
 * @param {Number} [options.primaryButtonIndex]
 *   [en]Index of primary button. Default is `0`.[/en]
 *   [ja]プライマリボタンのインデックスを指定します。デフォルトは 0 です。[/ja]
 * @param {String} [options.placeholder]
 *   [en]Placeholder for the text input.[/en]
 *   [ja]テキスト欄のプレースホルダに表示するテキストを指定します。[/ja]
 * @param {String} [options.defaultValue]
 *   [en]Default value for the text input.[/en]
 *   [ja]テキスト欄のデフォルトの値を指定します。[/ja]
 * @param {String} [options.inputType]
 *   [en]Type of the input element (`password`, `date`...). Default is `text`.[/en]
 *   [ja][/ja]
 * @param {Boolean} [options.autofocus]
 *   [en]Autofocus the input element. Default is `true`.[/en]
 *   [ja]input要素に自動的にフォーカスするかどうかを指定します。デフォルトはtrueです。[/ja]
 * @param {Boolean} [options.submitOnEnter]
 *   [en]Submit automatically when enter is pressed. Default is `true`.[/en]
 *   [ja]Enterが押された際にそのformをsubmitするかどうかを指定します。デフォルトはtrueです。[/ja]
 * @description
 *   [en]
 *     Display a dialog with a prompt to ask the user a question. Extends `alert()` parameters.
 *
 *     It can be called in the following ways:
 *
 *     ```
 *     ons.notification.prompt(message, options);
 *     ons.notification.prompt(options);
 *     ```
 *
 *     Must specify either `message` or `messageHTML`.
 *   [/en]
 *   [ja]
 *     ユーザーに入力を促すダイアログを表示します。
 *     このメソッドの引数には、options.messageもしくはoptions.messageHTMLのどちらかを必ず指定する必要があります。
 *   [/ja]
 */
notification.prompt = (message, options) => {
  options = _normalizeArguments(message, options, {
    title: 'Alert',
    isPrompt: true,
    autofocus: true,
    submitOnEnter: true
  });

  return notification._createAlertDialog(options);
};

export default notification;
