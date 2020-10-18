/**
 * Code directly taken from the Promise module for chat triggers.
 * Altered to use different Promise polyfill
 */

import Promise from '../Promise';
import RequestObj from './RequestObj';

function request(o) {
  var options = {}

  if (typeof o === 'string') {
    options.url = o;
  } else {
    options = o;
  }

  options.method = options.method?.toUpperCase()?.trim() ?? 'GET';
  options.timeout = options.timeout ?? 0;
  options.connectTimeout = options.connectTimeout ?? options.timeout;
  options.readTimeout = options.readTimeout ?? options.timeout;
  options.headers = options.headers ?? {};
  options.qs = options.qs ?? {};
  options.followRedirect = options.followRedirect ?? true;
  options.json = options.json ?? false;

  return new Promise((resolve, reject) => RequestObj(options, resolve, reject));
}

export default request;