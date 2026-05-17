export function on(element, eventName, handler, options) {
  element?.addEventListener(eventName, handler, options);
}
