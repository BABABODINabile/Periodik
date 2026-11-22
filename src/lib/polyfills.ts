// Hermes n'expose pas process.emitWarning, utilisé par certains builds CJS.
if (typeof globalThis.process !== 'undefined' && typeof globalThis.process.emitWarning !== 'function') {
  globalThis.process.emitWarning = () => {};
}

export {};
