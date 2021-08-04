export function isKeyDownEvent(event: Event): event is KeyboardEvent {
  return event.type === "keydown";
}
