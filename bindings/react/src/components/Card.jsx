import SimpleWrapper from './SimpleWrapper.jsx';
import React from 'react';

/**
 * @original ons-card
 * @category visual
 * @tutorial react/Reference/visual
 * @description
 * [en]Card component that can be used to display content.[/en]
 * [ja][/ja]
 * @example
 *
<Card>
  <p>Some content</p>
</Card>
 */
class Card extends SimpleWrapper {
  _getDomNodeName() {
    return 'ons-card';
  }
}

Card.propTypes = {
  /**
   * @name modifier
   * @type string
   * @description
   *  [en]
   *  Specify modifier name to specify custom styles. Optional.
   *  [/en]
   *  [ja][/ja]
   */
  modifier: React.PropTypes.string
};

export default Card;
