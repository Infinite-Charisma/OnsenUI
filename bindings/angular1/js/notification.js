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

ons.notification.alert = function(message, options = {}) {
  typeof message === 'string' ? (options.message = message) : (options = message);

  var originalCompile = options.compile || function(element) {
    return element;
  };

  options.compile = function(element) {
    ons.compile(originalCompile(element));
  };

  return ons.notification._alertOriginal(options);
};

ons.notification.confirm = function(message, options = {}) {
  typeof message === 'string' ? (options.message = message) : (options = message);

  var originalCompile = options.compile || function(element) {
    return element;
  };

  options.compile = function(element) {
    ons.compile(originalCompile(element));
  };

  return ons.notification._confirmOriginal(options);
};

ons.notification.prompt = function(message, options = {}) {
  typeof message === 'string' ? (options.message = message) : (options = message);

  var originalCompile = options.compile || function(element) {
    return element;
  };

  options.compile = function(element) {
    ons.compile(originalCompile(element));
  };

  return ons.notification._promptOriginal(options);
};
