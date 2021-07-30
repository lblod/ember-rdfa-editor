export function isKeyUpEvent(event: Event): event is KeyboardEvent {
  return event.type === "keyup";
}

export function isKeyDownEvent(event: Event): event is KeyboardEvent {
  return event.type === "keydown";
}

export function isInputEvent(event: Event): event is InputEvent {
  return event.type === "input";
}

export function isBeforeInputEvent(event: Event): event is InputEvent {
  return event.type === "beforeinput";
}
