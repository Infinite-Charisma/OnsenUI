import React from 'react';
import ReactDOM from 'react-dom';
import Util from './Util.js';

class BaseDialog extends React.Component {

  constructor(...args) {
    super(...args);

    const callback = (name, event) => {
      if (this.props[name]) {
        return this.props[name](event);
      }
    };
    this.onCancel = callback.bind(this, 'onCancel');
    this.onPreShow = callback.bind(this, 'onPreShow');
    this.onPostShow = callback.bind(this, 'onPostShow');
    this.onPreHide = callback.bind(this, 'onPreHide');
    this.onPostHide = callback.bind(this, 'onPostHide');
  }

  show() {
    this.node.firstChild.show();
  }

  updateClasses() {
    var node = this.node.firstChild;

    if (this.props.className) {
      if (this.lastClass) {
        node.className = node.className.replace(this.lastClass, '');
      }

      this.lastClass = ' ' + this.props.className;
      node.className += this.lastClass;
    }
  }

  hide() {
    this.node.firstChild.hide();
  }

  componentDidMount() {
    this.node = document.createElement('div');
    document.body.appendChild(this.node);

    this.node.addEventListener('dialog-cancel', this.onCancel);
    this.node.addEventListener('preshow', this.onPreShow);
    this.node.addEventListener('postshow', this.onPostShow);
    this.node.addEventListener('prehide', this.onPreHide);
    this.node.addEventListener('posthide', this.onPostHide);

    this.renderPortal(this.props, false, this.props.onDeviceBackButton);
  }

  componentWillReceiveProps(newProps) {
    this.renderPortal(newProps, this.props.isOpen);
  }

  componentWillUnmount() {
    this.node.removeEventListener('dialog-cancel', this.onCancel);
    this.node.removeEventListener('preshow', this.onPreShow);
    this.node.removeEventListener('postshow', this.onPostShow);
    this.node.removeEventListener('prehide', this.onPreHide);
    this.node.removeEventListener('posthide', this.onPostHide);

    ReactDOM.unmountComponentAtNode(this.node);
    document.body.removeChild(this.node);
  }

  _update(isShown, onDeviceBackButton) {
    if (this.props.isOpen) {
      if (!isShown) {
        this.show();
      }
    } else {
      this.hide();
    }

    this.updateClasses();

    if (onDeviceBackButton instanceof Function) {
      this.node.firstChild.onDeviceBackButton = onDeviceBackButton;
    }
  }

  _getDomNodeName() {
    throw new Error('_getDomNodeName is not implemented');
  }

  renderPortal(props, isShown, onDeviceBackButton = null) {
    var {...newProps} = props;

    Util.convert(newProps, 'isCancelable', {newName: 'cancelable'});
    Util.convert(newProps, 'isDisabled', {newName: 'disabled'});
    Util.convert(newProps, 'maskColor', {newName: 'mask-color'});
    Util.convert(newProps, 'animationOptions', {fun: Util.animationOptionsConverter, newName: 'animation-options'});

    var DomNodeName = this._getDomNodeName();

    ReactDOM.unstable_renderSubtreeIntoContainer(
      this,
      <DomNodeName {...newProps} />,
      this.node,
      this._update.bind(this, isShown, onDeviceBackButton)
    );
  }

  render() {
    return null;
  }
}

BaseDialog.propTypes = {
  onCancel: React.PropTypes.func,
  isOpen: React.PropTypes.bool.isRequired,
  isCancelable: React.PropTypes.bool,
  isDisabled: React.PropTypes.bool,
  animation: React.PropTypes.string,
  maskColor: React.PropTypes.string,
  animationOptions: React.PropTypes.object,
  onPreShow: React.PropTypes.func,
  onPostShow: React.PropTypes.func,
  onPreHide: React.PropTypes.func,
  onPostHide: React.PropTypes.func,
  onDeviceBackButton: React.PropTypes.func
};

BaseDialog.defaultProps = {
  isCancelable: true,
  isDisabled: false
};

export default BaseDialog;
