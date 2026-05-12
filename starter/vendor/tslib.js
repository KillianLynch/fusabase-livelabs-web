export function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) {
    throw new TypeError("Private accessor was defined without a getter.");
  }

  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) {
    throw new TypeError("Cannot read private member from an object whose class did not declare it.");
  }

  if (kind === "m") {
    return f;
  }

  if (kind === "a") {
    return f.call(receiver);
  }

  if (f) {
    return f.value;
  }

  return state.get(receiver);
}

export function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") {
    throw new TypeError("Private method is not writable.");
  }

  if (kind === "a" && !f) {
    throw new TypeError("Private accessor was defined without a setter.");
  }

  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) {
    throw new TypeError("Cannot write private member to an object whose class did not declare it.");
  }

  if (kind === "a") {
    f.call(receiver, value);
  } else if (f) {
    f.value = value;
  } else {
    state.set(receiver, value);
  }

  return value;
}
