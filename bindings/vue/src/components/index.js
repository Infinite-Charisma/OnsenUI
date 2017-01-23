export { default as VOnsInput } from './VOnsInput.vue';
export { default as VOnsPullHook } from './VOnsPullHook.vue';
export { default as VOnsPopover } from './VOnsPopover.vue';
export { default as VOnsAlertDialog } from './VOnsAlertDialog.vue';
export { default as VOnsTabbar } from './VOnsTabbar.vue';
export { default as VOnsTab } from './VOnsTab.vue';
export { default as VOnsNavigator } from './VOnsNavigator.vue';
export { default as VOnsSplitter } from './VOnsSplitter.vue';
export { default as VOnsSplitterSide } from './VOnsSplitterSide.vue';
export { default as VOnsSplitterContent } from './VOnsSplitterContent.vue';
export { default as VOnsRange } from './VOnsRange.vue';

// Generic components
import VGeneric from './VGeneric.vue';

const extend = (component, mixins = []) => ({ name: 'v-ons-' + component, mixins, extends: VGeneric });

export const VOnsPage = extend('page');
export const VOnsToolbar = extend('toolbar');
export const VOnsToolbarButton = extend('toolbar-button');
export const VOnsBackButton = extend('back-button');
export const VOnsButton = extend('button');
export const VOnsCarousel = extend('carousel');
export const VOnsCarouselItem = extend('carousel-item');
export const VOnsIcon = extend('icon');
export const VOnsSwitch = extend('switch');
export const VOnsBottomToolbar = extend('bottom-toolbar');
export const VOnsFab = extend('fab');
export const VOnsSpeedDial = extend('speed-dial');
export const VOnsSpeedDialItem = extend('speed-dial-item');
export const VOnsList = extend('speed-list');
export const VOnsListItem = extend('speed-list-item');
export const VOnsListHeader = extend('speed-list-header');
export const VOnsRipple = extend('ripple');
export const VOnsRow = extend('row');
export const VOnsCol = extend('col');
export const VOnsProgressBar = extend('progress-bar');
export const VOnsSplitterMask = extend('splitter-mask');


// Generic Dialogs
import { defaultAPI as dialogAPI } from '../internal/mixins/dialogs';

export const VOnsDialog = extend('dialog', [dialogAPI]);
export const VOnsModal = extend('modal', [dialogAPI]);

