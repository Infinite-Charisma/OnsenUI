import {
  Injector,
  ElementRef,
  ComponentFactoryResolver,
  Injectable,
  ApplicationRef,
  ComponentRef,
  ViewContainerRef,
  ReflectiveInjector,
  Type
} from '@angular/core';
import {Params} from './params';
import {ComponentLoader} from './component-loader';

export interface PopoverRef {
  popover: any;
  destroy: Function;
}

/**
 * @object PopoverFactory
 */
@Injectable()
export class PopoverFactory {

  constructor(
    private _injector: Injector,
    private _resolver: ComponentFactoryResolver,
    private _appRef: ApplicationRef,
    private _componentLoader: ComponentLoader
  ) {
  }

  createPopover(componentType: any, params: Object = {}): Promise<PopoverRef> { // TODO: fix "any"
    return new Promise(resolve => {
      setImmediate(() => {
        const factory = this._resolver.resolveComponentFactory(componentType);
        const injector = ReflectiveInjector.resolveAndCreate([
          {provide: Params, useValue: new Params(params)}
        ], this._injector);
        const componentRef = factory.create(injector);
        const rootElement = componentRef.location.nativeElement;

        this._componentLoader.load(componentRef);

        const element = rootElement.children[0];
        const popoverElement = element.tagName === 'ONS-POPOVER' ? element : element.querySelector('ons-popover');

        if (!popoverElement) {
          throw Error('<ons-popover> element is not found in component\'s template.');
        }

        resolve({popover: popoverElement, destroy: () => componentRef.destroy()});
      });
    });
  }
}
