import 'regenerator-runtime/runtime';
import { TextEncoder, TextDecoder } from 'util';

require('setimmediate');

// see https://stackoverflow.com/questions/68468203/why-am-i-getting-textencoder-is-not-defined-in-jest
Object.assign(global, { TextDecoder, TextEncoder });

//  Error: Not implemented: HTMLFormElement.prototype.submit
// see https://github.com/jsdom/jsdom/issues/1937#issuecomment-461810980
window.HTMLFormElement.prototype.submit = function submit() {
  this.dispatchEvent(new Event('submit'));
};

afterEach(() => {
  jest.clearAllMocks();
});
