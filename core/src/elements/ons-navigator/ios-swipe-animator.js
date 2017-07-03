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

import IOSSlideNavigatorTransitionAnimator from './ios-slide-animator';
import util from '../../ons/util';
import animit from '../../ons/animit';
import contentReady from '../../ons/content-ready';

/**
 * Swipe animator for iOS navigator transition.
 */
export default class IOSSwipeNavigatorTransitionAnimator extends IOSSlideNavigatorTransitionAnimator {

  constructor({ duration = 0.15, timing = 'linear', delay = 0 } = {}) {
    super({duration, timing, delay});
    this.durationRestore = 0.1;

    this.swipeShadow = util.createElement(`
      <div style="position: absolute; height: 100%; width: 12px; right: 100%; top: 0; bottom: 0; z-index: -1;
        background: linear-gradient(to right, transparent 0, rgba(0,0,0,.04) 40%, rgba(0,0,0,.12) 80%, rgba(0,0,0,.16) 100%);"></div>
    `);
  }

  translate(distance, maxWidth, enterPage, leavePage) {
    if (!this.backgroundMask.parentElement) { // dragStart
      enterPage.parentElement.insertBefore(this.backgroundMask, enterPage);

      // Decomposition
      this.target = {
        enter: util.findToolbarPage(enterPage) || enterPage,
        leave: util.findToolbarPage(leavePage) || leavePage,
      };
      this.decomp = {
        enter: this._decompose(this.target.enter),
        leave: this._decompose(this.target.leave)
      };
      this.delta = this._calculateDelta(leavePage, this.decomp.leave);
      this.shouldAnimateToolbar = this._shouldAnimateToolbar(this.target.enter, this.target.leave);

      (this.shouldAnimateToolbar ? this.target.leave : leavePage)._contentElement.appendChild(this.swipeShadow);
      leavePage.classList.add('overflow-visible');
      this.overflowElement = leavePage;
    }

    const behindOffset = (distance - maxWidth) / maxWidth;

    if (this.shouldAnimateToolbar) {

      animit.runAll(

        /* Enter page */

        animit([this.decomp.enter.content, this.decomp.enter.bottomToolbar, this.decomp.enter.background])
          .queue({
            transform: `translate3d(${behindOffset * 25}%, 0, 0)`,
            opacity: 1 + behindOffset * 10 / 100 // 0.9 -> 1
          }),

        animit(this.decomp.enter.toolbarCenter)
          .queue({
            transform: `translate3d(${this.delta.title * behindOffset}px, 0, 0)`,
            opacity: 1 + behindOffset // 0 -> 1
          }),

        animit(this.decomp.enter.backButtonLabel)
          .queue({
            opacity: 1 + behindOffset * 10 / 100, // 0.9 -> 1
            transform: `translate3d(${this.delta.label * behindOffset}px, 0, 0)`
          }),

        animit(this.decomp.enter.other)
          .queue({
            opacity: 1 + behindOffset // 0 -> 1
          }),

        /* Leave page */

        animit([this.decomp.leave.content, this.decomp.leave.bottomToolbar, this.decomp.leave.background])
          .queue({
            transform: `translate3d(${distance}px, 0px, 0px)`
          }),

        animit(this.decomp.leave.toolbar)
          .queue({
            opacity: -1 * behindOffset // 1 -> 0
          }),

        animit(this.decomp.leave.toolbarCenter)
          .queue({
            transform: `translate3d(${(1 + behindOffset) * 125}%, 0, 0)`
          }),

        animit(this.decomp.leave.backButtonLabel)
          .queue({
            opacity: -1 * behindOffset, // 1 -> 0
            transform: `translate3d(${this.delta.title * (1 + behindOffset)}px, 0, 0)`
          }),


        /* Other */

        animit(this.swipeShadow)
          .queue({
            opacity: -1 * behindOffset // 1 -> 0
          })
      );


    } else {
      animit.runAll(
        animit(leavePage)
          .queue({
            transform: `translate3d(${distance}px, 0px, 0px)`
          }),

        animit(enterPage)
          .queue({
            transform: `translate3d(${behindOffset * 25}%, 0, 0)`,
            opacity: 1 + behindOffset * 10 / 100 // 0.9 -> 1
          }),

        animit(this.swipeShadow)
          .queue({
            opacity: -1 * behindOffset // 1 -> 0
          })
      );
    }
  }

  restore(enterPage, leavePage, callback) {

    if (this.shouldAnimateToolbar) {

      animit.runAll(

        /* Enter page */

        animit([this.decomp.enter.content, this.decomp.enter.bottomToolbar, this.decomp.enter.background])
          .queue({
            transform: 'translate3d(-25%, 0, 0)',
            opacity: 0.9
          }, {
            timing: this.timing,
            duration: this.durationRestore
          }),

        animit(this.decomp.enter.toolbarCenter)
          .queue({
            transform: `translate3d(-${this.delta.title}px, 0, 0)`,
            transition: `opacity ${this.durationRestore}s linear, transform ${this.durationRestore}s ${this.timing}`,
            opacity: 0
          }),

        animit(this.decomp.enter.backButtonLabel)
          .queue({
            transform: `translate3d(-${this.delta.label}px, 0, 0)`
          }, {
            timing: this.timing,
            duration: this.durationRestore
          }),

        animit(this.decomp.enter.other)
          .queue({
            opacity: 0
          }, {
            timing: this.timing,
            duration: this.durationRestore
          }),

        // /* Leave page */

        animit([this.decomp.leave.content, this.decomp.leave.bottomToolbar, this.decomp.leave.background])
          .queue({
            transform: `translate3d(0, 0px, 0px)`
          }, {
            timing: this.timing,
            duration: this.durationRestore
          }),

        animit(this.decomp.leave.toolbar)
          .queue({
            opacity: 1
          }, {
            timing: this.timing,
            duration: this.durationRestore
          }),

        animit(this.decomp.leave.toolbarCenter)
          .queue({
            transform: `translate3d(0, 0, 0)`
          }, {
            timing: this.timing,
            duration: this.durationRestore
          }),

        animit(this.decomp.leave.backButtonLabel)
          .queue({
            opacity: 1,
            transform: `translate3d(0, 0, 0)`,
            transition: `opacity ${this.durationRestore}s linear, transform ${this.durationRestore}s ${this.timing}`
          }),


        // /* Other */

        animit(this.swipeShadow)
          .queue({
            opacity: 0
          }, {
            timing: this.timing,
            duration: this.durationRestore
          })
          .queue(done => {
            this._reset(this.target.enter, this.target.leave);
            callback && callback();
            done();
          })
      );


    } else {
      animit.runAll(

        animit(enterPage)
        .queue({
          css: {
            transform: 'translate3D(-25%, 0px, 0px)',
            opacity: 0.9
          },
          timing: this.timing,
          duration: this.durationRestore
        }),

        animit(leavePage)
        .queue({
          css: {
            transform: 'translate3D(0px, 0px, 0px)'
          },
          timing: this.timing,
          duration: this.durationRestore
        })
        .queue(done => {
          this._reset(enterPage, leavePage);
          callback && callback();
          done();
        })
      );
    }
  }

  pop(enterPage, leavePage, callback) {

    if (this.shouldAnimateToolbar) {

      animit.runAll(

        /* Enter page */

        animit([this.decomp.enter.content, this.decomp.enter.bottomToolbar, this.decomp.enter.background])
          .queue({
            transform: 'translate3d(0, 0, 0)',
            opacity: 1
          }, {
            timing: this.timing,
            duration: this.duration
          }),

        animit(this.decomp.enter.toolbarCenter)
          .queue({
            transform: `translate3d(0, 0, 0)`,
            transition: `opacity ${this.duration}s linear, transform ${this.duration}s ${this.timing}`,
            opacity: 1
          }),

        animit(this.decomp.enter.backButtonLabel)
          .queue({
            transform: `translate3d(0, 0, 0)`
          }, {
            timing: this.timing,
            duration: this.duration
          }),

        animit(this.decomp.enter.other)
          .queue({
            opacity: 1
          }, {
            timing: this.timing,
            duration: this.duration
          }),

        // /* Leave page */

        animit([this.decomp.leave.content, this.decomp.leave.bottomToolbar, this.decomp.leave.background])
          .queue({
            transform: `translate3d(100%, 0px, 0px)`
          }, {
            timing: this.timing,
            duration: this.duration
          }),

        animit(this.decomp.leave.toolbar)
          .queue({
            opacity: 0
          }, {
            timing: this.timing,
            duration: this.duration
          }),

        animit(this.decomp.leave.toolbarCenter)
          .queue({
            transform: `translate3d(125%, 0, 0)`
          }, {
            timing: this.timing,
            duration: this.duration
          }),

        animit(this.decomp.leave.backButtonLabel)
          .queue({
            opacity: 0,
            transform: `translate3d(${this.delta.title}px, 0, 0)`,
            transition: `opacity ${this.duration}s linear, transform ${this.duration}s ${this.timing}`
          }),


        // /* Other */

        animit(this.swipeShadow)
          .queue({
            opacity: 0
          }, {
            timing: this.timing,
            duration: this.duration
          })
          .queue(done => {
            this._reset(this.target.enter, this.target.leave);
            callback && callback();
            done();
          })
      );

    } else {
      animit.runAll(

        animit(enterPage)
        .queue({
          css: {
            transform: 'translate3D(0px, 0px, 0px)',
            opacity: 1.0
          },
          duration: this.duration,
          timing: this.timing
        }),

        animit(leavePage)
        .queue({
          css: {
            transform: 'translate3D(100%, 0px, 0px)'
          },
          duration: this.duration,
          timing: this.timing
        })
        .queue(done => {
          this._reset(enterPage, leavePage);
          callback && callback();
          done();
        })
      );
    }
  }

  _reset(...pages) {
    this.swipeShadow.remove();
    this.backgroundMask.remove();

    [...pages]
      .reduce((result, el) => result.concat([el, el._contentElement, el._backgroundElement]), [])
      .forEach(el => el.style.transform = el.style.opacity = el.style.transition = null);

    this.overflowElement.classList.remove('overflow-visible');
    this.decomp = this.target = this.overflowElement = null;
  }
}
