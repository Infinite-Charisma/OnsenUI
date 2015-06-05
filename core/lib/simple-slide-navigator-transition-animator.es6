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

((ons) => {
  'use strict';

  var NavigatorTransitionAnimator = ons._internal.NavigatorTransitionAnimator;


  /**
   * Slide animator for navigator transition.
   */
  class SimpleSlideNavigatorTransitionAnimator extends NavigatorTransitionAnimator {

    constructor(options) {
      options = ons._util.extend({
        duration: 0.3,
        timing: 'cubic-bezier(.1, .7, .4, 1)',
        delay: 0
      }, options || {});

      super(options);

      this.backgroundMask = ons._util.createElement(`
        <div style="position: absolute; width: 100%; height: 100%; 
          background-color: black; opacity: 0;"></div>
      `);
      this.blackMaskOpacity = 0.4;
    }

    /**
     * @param {Object} enterPage
     * @param {Object} leavePage
     * @param {Function} callback
     */
    push(enterPage, leavePage, callback) {
      var mask = this.backgroundMask.remove();
      leavePage.element[0].parentNode.insertBefore(mask[0], leavePage.element[0].nextSibling);

      animit.runAll(

        animit(mask[0])
          .queue({
            opacity: 0,
            transform: 'translate3d(0, 0, 0)'
          })
          .wait(this.delay)
          .queue({
            opacity: this.blackMaskOpacity
          }, {
            duration: this.duration,
            timing: this.timing
          })
          .resetStyle()
          .queue(function(done) {
            mask.remove();
            done();
          }),

        animit(enterPage.element[0])
          .queue({
            css: {
              transform: 'translate3D(100%, 0, 0)',
            },
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {
              transform: 'translate3D(0, 0, 0)',
            },
            duration: this.duration,
            timing: this.timing
          })
          .resetStyle(),

        animit(leavePage.element[0])
          .queue({
            css: {
              transform: 'translate3D(0, 0, 0)'
            },
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {
              transform: 'translate3D(-45%, 0px, 0px)'
            },
            duration: this.duration,
            timing: this.timing
          })
          .resetStyle()
          .wait(0.2)
          .queue(function(done) {
            callback();
            done();
          })
      );
    }

    /**
     * @param {Object} enterPage
     * @param {Object} leavePage
     * @param {Function} done
     */
    pop(enterPage, leavePage, done) {
      var mask = this.backgroundMask.remove();
      enterPage.element[0].parentNode.insertBefore(mask[0], enterPage.element[0].nextSibling);

      animit.runAll(

        animit(mask[0])
          .queue({
            opacity: this.blackMaskOpacity,
            transform: 'translate3d(0, 0, 0)'
          })
          .wait(this.delay)
          .queue({
            opacity: 0
          }, {
            duration: this.duration,
            timing: this.timing
          })
          .resetStyle()
          .queue(function(done) {
            mask.remove();
            done();
          }),

        animit(enterPage.element[0])
          .queue({
            css: {
              transform: 'translate3D(-45%, 0px, 0px)',
              opacity: 0.9
            },
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {
              transform: 'translate3D(0px, 0px, 0px)',
              opacity: 1.0
            },
            duration: this.duration,
            timing: this.timing
          })
          .resetStyle(),

        animit(leavePage.element[0])
          .queue({
            css: {
              transform: 'translate3D(0px, 0px, 0px)'
            },
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {
              transform: 'translate3D(100%, 0px, 0px)'
            },
            duration: this.duration,
            timing: this.timing
          })
          .wait(0.2)
          .queue(function(finish) {
            done();
            finish();
          })
      );
    }
  }

  ons._internal = ons._internal || {};
  ons._internal.SimpleSlideNavigatorTransitionAnimator = SimpleSlideNavigatorTransitionAnimator;

})(window.ons = window.ons || {});
