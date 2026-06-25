var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// deno:https://deno.land/std@0.200.0/bytes/bytes_list.ts
var BytesList = class {
  #len = 0;
  #chunks = [];
  constructor() {
  }
  /**
   * Total size of bytes
   */
  size() {
    return this.#len;
  }
  /**
   * Push bytes with given offset infos
   */
  add(value, start = 0, end = value.byteLength) {
    if (value.byteLength === 0 || end - start === 0) {
      return;
    }
    checkRange(start, end, value.byteLength);
    this.#chunks.push({
      value,
      end,
      start,
      offset: this.#len
    });
    this.#len += end - start;
  }
  /**
   * Drop head `n` bytes.
   */
  shift(n) {
    if (n === 0) {
      return;
    }
    if (this.#len <= n) {
      this.#chunks = [];
      this.#len = 0;
      return;
    }
    const idx = this.getChunkIndex(n);
    this.#chunks.splice(0, idx);
    const [chunk] = this.#chunks;
    if (chunk) {
      const diff = n - chunk.offset;
      chunk.start += diff;
    }
    let offset = 0;
    for (const chunk2 of this.#chunks) {
      chunk2.offset = offset;
      offset += chunk2.end - chunk2.start;
    }
    this.#len = offset;
  }
  /**
   * Find chunk index in which `pos` locates by binary-search
   * returns -1 if out of range
   */
  getChunkIndex(pos) {
    let max = this.#chunks.length;
    let min = 0;
    while (true) {
      const i = min + Math.floor((max - min) / 2);
      if (i < 0 || this.#chunks.length <= i) {
        return -1;
      }
      const { offset, start, end } = this.#chunks[i];
      const len = end - start;
      if (offset <= pos && pos < offset + len) {
        return i;
      } else if (offset + len <= pos) {
        min = i + 1;
      } else {
        max = i - 1;
      }
    }
  }
  /**
   * Get indexed byte from chunks
   */
  get(i) {
    if (i < 0 || this.#len <= i) {
      throw new Error("out of range");
    }
    const idx = this.getChunkIndex(i);
    const { value, offset, start } = this.#chunks[idx];
    return value[start + i - offset];
  }
  /**
   * Iterator of bytes from given position
   */
  *iterator(start = 0) {
    const startIdx = this.getChunkIndex(start);
    if (startIdx < 0) return;
    const first = this.#chunks[startIdx];
    let firstOffset = start - first.offset;
    for (let i = startIdx; i < this.#chunks.length; i++) {
      const chunk = this.#chunks[i];
      for (let j = chunk.start + firstOffset; j < chunk.end; j++) {
        yield chunk.value[j];
      }
      firstOffset = 0;
    }
  }
  /**
   * Returns subset of bytes copied
   */
  slice(start, end = this.#len) {
    if (end === start) {
      return new Uint8Array();
    }
    checkRange(start, end, this.#len);
    const result = new Uint8Array(end - start);
    const startIdx = this.getChunkIndex(start);
    const endIdx = this.getChunkIndex(end - 1);
    let written = 0;
    for (let i = startIdx; i <= endIdx; i++) {
      const { value: chunkValue, start: chunkStart, end: chunkEnd, offset: chunkOffset } = this.#chunks[i];
      const readStart = chunkStart + (i === startIdx ? start - chunkOffset : 0);
      const readEnd = i === endIdx ? end - chunkOffset + chunkStart : chunkEnd;
      const len = readEnd - readStart;
      result.set(chunkValue.subarray(readStart, readEnd), written);
      written += len;
    }
    return result;
  }
  /**
   * Concatenate chunks into single Uint8Array copied.
   */
  concat() {
    const result = new Uint8Array(this.#len);
    let sum = 0;
    for (const { value, start, end } of this.#chunks) {
      result.set(value.subarray(start, end), sum);
      sum += end - start;
    }
    return result;
  }
};
function checkRange(start, end, len) {
  if (start < 0 || len < start || end < 0 || len < end || end < start) {
    throw new Error("invalid range");
  }
}

// deno:https://deno.land/std@0.200.0/bytes/concat.ts
function concat(...buf) {
  let length = 0;
  for (const b of buf) {
    length += b.length;
  }
  const output = new Uint8Array(length);
  let index = 0;
  for (const b of buf) {
    output.set(b, index);
    index += b.length;
  }
  return output;
}

// deno:https://deno.land/std@0.200.0/bytes/copy.ts
function copy(src, dst, off = 0) {
  off = Math.max(0, Math.min(off, dst.byteLength));
  const dstBytesAvailable = dst.byteLength - off;
  if (src.byteLength > dstBytesAvailable) {
    src = src.subarray(0, dstBytesAvailable);
  }
  dst.set(src, off);
  return src.byteLength;
}

// deno:https://deno.land/std@0.200.0/bytes/equals.ts
function equalsNaive(a, b) {
  for (let i = 0; i < b.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
function equals32Bit(a, b) {
  const len = a.length;
  const compressible = Math.floor(len / 4);
  const compressedA = new Uint32Array(a.buffer, 0, compressible);
  const compressedB = new Uint32Array(b.buffer, 0, compressible);
  for (let i = compressible * 4; i < len; i++) {
    if (a[i] !== b[i]) return false;
  }
  for (let i = 0; i < compressedA.length; i++) {
    if (compressedA[i] !== compressedB[i]) return false;
  }
  return true;
}
function equals(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  return a.length < 1e3 ? equalsNaive(a, b) : equals32Bit(a, b);
}

// deno:https://deno.land/std@0.200.0/assert/assertion_error.ts
var AssertionError = class extends Error {
  name = "AssertionError";
  constructor(message) {
    super(message);
  }
};

// deno:https://deno.land/std@0.200.0/assert/assert.ts
function assert(expr, msg = "") {
  if (!expr) {
    throw new AssertionError(msg);
  }
}

// deno:https://deno.land/std@0.200.0/crypto/timing_safe_equal.ts
function timingSafeEqual(a, b) {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  if (!(a instanceof DataView)) {
    a = ArrayBuffer.isView(a) ? new DataView(a.buffer, a.byteOffset, a.byteLength) : new DataView(a);
  }
  if (!(b instanceof DataView)) {
    b = ArrayBuffer.isView(b) ? new DataView(b.buffer, b.byteOffset, b.byteLength) : new DataView(b);
  }
  assert(a instanceof DataView);
  assert(b instanceof DataView);
  const length = a.byteLength;
  let out = 0;
  let i = -1;
  while (++i < length) {
    out |= a.getUint8(i) ^ b.getUint8(i);
  }
  return out === 0;
}

// deno:https://deno.land/std@0.200.0/encoding/base64.ts
var base64abc = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "+",
  "/"
];
function encode(data) {
  const uint8 = typeof data === "string" ? new TextEncoder().encode(data) : data instanceof Uint8Array ? data : new Uint8Array(data);
  let result = "", i;
  const l = uint8.length;
  for (i = 2; i < l; i += 3) {
    result += base64abc[uint8[i - 2] >> 2];
    result += base64abc[(uint8[i - 2] & 3) << 4 | uint8[i - 1] >> 4];
    result += base64abc[(uint8[i - 1] & 15) << 2 | uint8[i] >> 6];
    result += base64abc[uint8[i] & 63];
  }
  if (i === l + 1) {
    result += base64abc[uint8[i - 2] >> 2];
    result += base64abc[(uint8[i - 2] & 3) << 4];
    result += "==";
  }
  if (i === l) {
    result += base64abc[uint8[i - 2] >> 2];
    result += base64abc[(uint8[i - 2] & 3) << 4 | uint8[i - 1] >> 4];
    result += base64abc[(uint8[i - 1] & 15) << 2];
    result += "=";
  }
  return result;
}

// deno:https://deno.land/std@0.200.0/encoding/base64url.ts
function convertBase64ToBase64url(b64) {
  return b64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function encode2(data) {
  return convertBase64ToBase64url(encode(data));
}

// deno:https://deno.land/std@0.200.0/crypto/keystack.ts
var _computedKey;
var _computedKey1;
var encoder = new TextEncoder();
function importKey(key) {
  if (typeof key === "string") {
    key = encoder.encode(key);
  } else if (Array.isArray(key)) {
    key = new Uint8Array(key);
  }
  return crypto.subtle.importKey("raw", key, {
    name: "HMAC",
    hash: {
      name: "SHA-256"
    }
  }, true, [
    "sign",
    "verify"
  ]);
}
function sign(data, key) {
  if (typeof data === "string") {
    data = encoder.encode(data);
  } else if (Array.isArray(data)) {
    data = Uint8Array.from(data);
  }
  return crypto.subtle.sign("HMAC", key, data);
}
async function compare(a, b) {
  const key = new Uint8Array(32);
  globalThis.crypto.getRandomValues(key);
  const cryptoKey = await importKey(key);
  const ah = await sign(a, cryptoKey);
  const bh = await sign(b, cryptoKey);
  return timingSafeEqual(ah, bh);
}
_computedKey = Symbol.for("Deno.customInspect"), _computedKey1 = Symbol.for("nodejs.util.inspect.custom");
var KeyStack = class {
  #cryptoKeys = /* @__PURE__ */ new Map();
  #keys;
  async #toCryptoKey(key) {
    if (!this.#cryptoKeys.has(key)) {
      this.#cryptoKeys.set(key, await importKey(key));
    }
    return this.#cryptoKeys.get(key);
  }
  get length() {
    return this.#keys.length;
  }
  /** A class which accepts an array of keys that are used to sign and verify
   * data and allows easy key rotation without invalidation of previously signed
   * data.
   *
   * @param keys An iterable of keys, of which the index 0 will be used to sign
   *             data, but verification can happen against any key.
   */
  constructor(keys2) {
    const values = Array.isArray(keys2) ? keys2 : [
      ...keys2
    ];
    if (!values.length) {
      throw new TypeError("keys must contain at least one value");
    }
    this.#keys = values;
  }
  /** Take `data` and return a SHA256 HMAC digest that uses the current 0 index
   * of the `keys` passed to the constructor.  This digest is in the form of a
   * URL safe base64 encoded string. */
  async sign(data) {
    const key = await this.#toCryptoKey(this.#keys[0]);
    return encode2(await sign(data, key));
  }
  /** Given `data` and a `digest`, verify that one of the `keys` provided the
   * constructor was used to generate the `digest`.  Returns `true` if one of
   * the keys was used, otherwise `false`. */
  async verify(data, digest) {
    return await this.indexOf(data, digest) > -1;
  }
  /** Given `data` and a `digest`, return the current index of the key in the
   * `keys` passed the constructor that was used to generate the digest.  If no
   * key can be found, the method returns `-1`. */
  async indexOf(data, digest) {
    for (let i = 0; i < this.#keys.length; i++) {
      const cryptoKey = await this.#toCryptoKey(this.#keys[i]);
      if (await compare(digest, encode2(await sign(data, cryptoKey)))) {
        return i;
      }
    }
    return -1;
  }
  [_computedKey](inspect) {
    const { length } = this;
    return `${this.constructor.name} ${inspect({
      length
    })}`;
  }
  [_computedKey1](depth, options, inspect) {
    if (depth < 0) {
      return options.stylize(`[${this.constructor.name}]`, "special");
    }
    const newOptions = Object.assign({}, options, {
      depth: options.depth === null ? null : options.depth - 1
    });
    const { length } = this;
    return `${options.stylize(this.constructor.name, "special")} ${inspect({
      length
    }, newOptions)}`;
  }
};

// deno:https://deno.land/std@0.200.0/http/cookie_map.ts
var _computedKey2;
var _computedKey12;
var _computedKey22;
var _computedKey3;
var FIELD_CONTENT_REGEXP = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
var KEY_REGEXP = /(?:^|;) *([^=]*)=[^;]*/g;
var SAME_SITE_REGEXP = /^(?:lax|none|strict)$/i;
var matchCache = {};
function getPattern(name) {
  if (name in matchCache) {
    return matchCache[name];
  }
  return matchCache[name] = new RegExp(`(?:^|;) *${name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}=([^;]*)`);
}
function pushCookie(values, cookie) {
  if (cookie.overwrite) {
    for (let i = values.length - 1; i >= 0; i--) {
      if (values[i].indexOf(`${cookie.name}=`) === 0) {
        values.splice(i, 1);
      }
    }
  }
  values.push(cookie.toHeaderValue());
}
function validateCookieProperty(key, value) {
  if (value && !FIELD_CONTENT_REGEXP.test(value)) {
    throw new TypeError(`The "${key}" of the cookie (${value}) is invalid.`);
  }
}
var Cookie = class {
  domain;
  expires;
  httpOnly = true;
  maxAge;
  name;
  overwrite = false;
  path = "/";
  sameSite = false;
  secure = false;
  signed;
  value;
  constructor(name, value, attributes) {
    validateCookieProperty("name", name);
    this.name = name;
    validateCookieProperty("value", value);
    this.value = value ?? "";
    Object.assign(this, attributes);
    if (!this.value) {
      this.expires = /* @__PURE__ */ new Date(0);
      this.maxAge = void 0;
    }
    validateCookieProperty("path", this.path);
    validateCookieProperty("domain", this.domain);
    if (this.sameSite && typeof this.sameSite === "string" && !SAME_SITE_REGEXP.test(this.sameSite)) {
      throw new TypeError(`The "sameSite" of the cookie ("${this.sameSite}") is invalid.`);
    }
  }
  toHeaderValue() {
    let value = this.toString();
    if (this.maxAge) {
      this.expires = new Date(Date.now() + this.maxAge * 1e3);
    }
    if (this.path) {
      value += `; path=${this.path}`;
    }
    if (this.expires) {
      value += `; expires=${this.expires.toUTCString()}`;
    }
    if (this.domain) {
      value += `; domain=${this.domain}`;
    }
    if (this.sameSite) {
      value += `; samesite=${this.sameSite === true ? "strict" : this.sameSite.toLowerCase()}`;
    }
    if (this.secure) {
      value += "; secure";
    }
    if (this.httpOnly) {
      value += "; httponly";
    }
    return value;
  }
  toString() {
    return `${this.name}=${this.value}`;
  }
};
var cookieMapHeadersInitSymbol = Symbol.for("Deno.std.cookieMap.headersInit");
var keys = Symbol("#keys");
var requestHeaders = Symbol("#requestHeaders");
var responseHeaders = Symbol("#responseHeaders");
var isSecure = Symbol("#secure");
var requestKeys = Symbol("#requestKeys");
_computedKey2 = Symbol.for("Deno.customInspect"), _computedKey12 = Symbol.for("nodejs.util.inspect.custom");
var CookieMapBase = class {
  [keys];
  [requestHeaders];
  [responseHeaders];
  [isSecure];
  [requestKeys]() {
    if (this[keys]) {
      return this[keys];
    }
    const result = this[keys] = [];
    const header = this[requestHeaders].get("cookie");
    if (!header) {
      return result;
    }
    let matches;
    while (matches = KEY_REGEXP.exec(header)) {
      const [, key] = matches;
      result.push(key);
    }
    return result;
  }
  constructor(request, options) {
    this[requestHeaders] = "headers" in request ? request.headers : request;
    const { secure = false, response = new Headers() } = options;
    this[responseHeaders] = "headers" in response ? response.headers : response;
    this[isSecure] = secure;
  }
  /** A method used by {@linkcode mergeHeaders} to be able to merge
   * headers from various sources when forming a {@linkcode Response}. */
  [cookieMapHeadersInitSymbol]() {
    const init = [];
    for (const [key, value] of this[responseHeaders]) {
      if (key === "set-cookie") {
        init.push([
          key,
          value
        ]);
      }
    }
    return init;
  }
  [_computedKey2]() {
    return `${this.constructor.name} []`;
  }
  [_computedKey12](depth, options, inspect) {
    if (depth < 0) {
      return options.stylize(`[${this.constructor.name}]`, "special");
    }
    const newOptions = Object.assign({}, options, {
      depth: options.depth === null ? null : options.depth - 1
    });
    return `${options.stylize(this.constructor.name, "special")} ${inspect([], newOptions)}`;
  }
};
_computedKey22 = Symbol.iterator;
var CookieMap = class extends CookieMapBase {
  /** Contains the number of valid cookies in the request headers. */
  get size() {
    return [
      ...this
    ].length;
  }
  constructor(request, options = {}) {
    super(request, options);
  }
  /** Deletes all the cookies from the {@linkcode Request} in the response. */
  clear(options = {}) {
    for (const key of this.keys()) {
      this.set(key, null, options);
    }
  }
  /** Set a cookie to be deleted in the response.
   *
   * This is a convenience function for `set(key, null, options?)`.
   */
  delete(key, options = {}) {
    this.set(key, null, options);
    return true;
  }
  /** Return the value of a matching key present in the {@linkcode Request}. If
   * the key is not present `undefined` is returned. */
  get(key) {
    const headerValue = this[requestHeaders].get("cookie");
    if (!headerValue) {
      return void 0;
    }
    const match2 = headerValue.match(getPattern(key));
    if (!match2) {
      return void 0;
    }
    const [, value] = match2;
    return value;
  }
  /** Returns `true` if the matching key is present in the {@linkcode Request},
   * otherwise `false`. */
  has(key) {
    const headerValue = this[requestHeaders].get("cookie");
    if (!headerValue) {
      return false;
    }
    return getPattern(key).test(headerValue);
  }
  /** Set a named cookie in the response. The optional
   * {@linkcode CookieMapSetDeleteOptions} are applied to the cookie being set.
   */
  set(key, value, options = {}) {
    const resHeaders = this[responseHeaders];
    const values = [];
    for (const [key2, value2] of resHeaders) {
      if (key2 === "set-cookie") {
        values.push(value2);
      }
    }
    const secure = this[isSecure];
    if (!secure && options.secure && !options.ignoreInsecure) {
      throw new TypeError("Cannot send secure cookie over unencrypted connection.");
    }
    const cookie = new Cookie(key, value, options);
    cookie.secure = options.secure ?? secure;
    pushCookie(values, cookie);
    resHeaders.delete("set-cookie");
    for (const value2 of values) {
      resHeaders.append("set-cookie", value2);
    }
    return this;
  }
  /** Iterate over the cookie keys and values that are present in the
   * {@linkcode Request}. This is an alias of the `[Symbol.iterator]` method
   * present on the class. */
  entries() {
    return this[Symbol.iterator]();
  }
  /** Iterate over the cookie keys that are present in the
   * {@linkcode Request}. */
  *keys() {
    for (const [key] of this) {
      yield key;
    }
  }
  /** Iterate over the cookie values that are present in the
   * {@linkcode Request}. */
  *values() {
    for (const [, value] of this) {
      yield value;
    }
  }
  /** Iterate over the cookie keys and values that are present in the
   * {@linkcode Request}. */
  *[_computedKey22]() {
    const keys2 = this[requestKeys]();
    for (const key of keys2) {
      const value = this.get(key);
      if (value) {
        yield [
          key,
          value
        ];
      }
    }
  }
};
_computedKey3 = Symbol.asyncIterator;
var SecureCookieMap = class extends CookieMapBase {
  #keyRing;
  /** Is set to a promise which resolves with the number of cookies in the
   * {@linkcode Request}. */
  get size() {
    return (async () => {
      let size = 0;
      for await (const _ of this) {
        size++;
      }
      return size;
    })();
  }
  constructor(request, options = {}) {
    super(request, options);
    const { keys: keys2 } = options;
    this.#keyRing = keys2;
  }
  /** Sets all cookies in the {@linkcode Request} to be deleted in the
   * response. */
  async clear(options) {
    for await (const key of this.keys()) {
      await this.set(key, null, options);
    }
  }
  /** Set a cookie to be deleted in the response.
   *
   * This is a convenience function for `set(key, null, options?)`. */
  async delete(key, options = {}) {
    await this.set(key, null, options);
    return true;
  }
  /** Get the value of a cookie from the {@linkcode Request}.
   *
   * If the cookie is signed, and the signature is invalid, `undefined` will be
   * returned and the cookie will be set to be deleted in the response. If the
   * cookie is using an "old" key from the keyring, the cookie will be re-signed
   * with the current key and be added to the response to be updated. */
  async get(key, options = {}) {
    const signed = options.signed ?? !!this.#keyRing;
    const nameSig = `${key}.sig`;
    const header = this[requestHeaders].get("cookie");
    if (!header) {
      return;
    }
    const match2 = header.match(getPattern(key));
    if (!match2) {
      return;
    }
    const [, value] = match2;
    if (!signed) {
      return value;
    }
    const digest = await this.get(nameSig, {
      signed: false
    });
    if (!digest) {
      return;
    }
    const data = `${key}=${value}`;
    if (!this.#keyRing) {
      throw new TypeError("key ring required for signed cookies");
    }
    const index = await this.#keyRing.indexOf(data, digest);
    if (index < 0) {
      await this.delete(nameSig, {
        path: "/",
        signed: false
      });
    } else {
      if (index) {
        await this.set(nameSig, await this.#keyRing.sign(data), {
          signed: false
        });
      }
      return value;
    }
  }
  /** Returns `true` if the key is in the {@linkcode Request}.
   *
   * If the cookie is signed, and the signature is invalid, `false` will be
   * returned and the cookie will be set to be deleted in the response. If the
   * cookie is using an "old" key from the keyring, the cookie will be re-signed
   * with the current key and be added to the response to be updated. */
  async has(key, options = {}) {
    const signed = options.signed ?? !!this.#keyRing;
    const nameSig = `${key}.sig`;
    const header = this[requestHeaders].get("cookie");
    if (!header) {
      return false;
    }
    const match2 = header.match(getPattern(key));
    if (!match2) {
      return false;
    }
    if (!signed) {
      return true;
    }
    const digest = await this.get(nameSig, {
      signed: false
    });
    if (!digest) {
      return false;
    }
    const [, value] = match2;
    const data = `${key}=${value}`;
    if (!this.#keyRing) {
      throw new TypeError("key ring required for signed cookies");
    }
    const index = await this.#keyRing.indexOf(data, digest);
    if (index < 0) {
      await this.delete(nameSig, {
        path: "/",
        signed: false
      });
      return false;
    } else {
      if (index) {
        await this.set(nameSig, await this.#keyRing.sign(data), {
          signed: false
        });
      }
      return true;
    }
  }
  /** Set a cookie in the response headers.
   *
   * If there was a keyring set, cookies will be automatically signed, unless
   * overridden by the passed options. Cookies can be deleted by setting the
   * value to `null`. */
  async set(key, value, options = {}) {
    const resHeaders = this[responseHeaders];
    const headers = [];
    for (const [key2, value2] of resHeaders.entries()) {
      if (key2 === "set-cookie") {
        headers.push(value2);
      }
    }
    const secure = this[isSecure];
    const signed = options.signed ?? !!this.#keyRing;
    if (!secure && options.secure && !options.ignoreInsecure) {
      throw new TypeError("Cannot send secure cookie over unencrypted connection.");
    }
    const cookie = new Cookie(key, value, options);
    cookie.secure = options.secure ?? secure;
    pushCookie(headers, cookie);
    if (signed) {
      if (!this.#keyRing) {
        throw new TypeError("keys required for signed cookies.");
      }
      cookie.value = await this.#keyRing.sign(cookie.toString());
      cookie.name += ".sig";
      pushCookie(headers, cookie);
    }
    resHeaders.delete("set-cookie");
    for (const header of headers) {
      resHeaders.append("set-cookie", header);
    }
    return this;
  }
  /** Iterate over the {@linkcode Request} cookies, yielding up a tuple
   * containing the key and value of each cookie.
   *
   * If a key ring was provided, only properly signed cookie keys and values are
   * returned. */
  entries() {
    return this[Symbol.asyncIterator]();
  }
  /** Iterate over the request's cookies, yielding up the key of each cookie.
   *
   * If a keyring was provided, only properly signed cookie keys are
   * returned. */
  async *keys() {
    for await (const [key] of this) {
      yield key;
    }
  }
  /** Iterate over the request's cookies, yielding up the value of each cookie.
   *
   * If a keyring was provided, only properly signed cookie values are
   * returned. */
  async *values() {
    for await (const [, value] of this) {
      yield value;
    }
  }
  /** Iterate over the {@linkcode Request} cookies, yielding up a tuple
   * containing the key and value of each cookie.
   *
   * If a key ring was provided, only properly signed cookie keys and values are
   * returned. */
  async *[_computedKey3]() {
    const keys2 = this[requestKeys]();
    for (const key of keys2) {
      const value = await this.get(key);
      if (value) {
        yield [
          key,
          value
        ];
      }
    }
  }
};

// deno:https://deno.land/std@0.200.0/http/http_status.ts
var Status = /* @__PURE__ */ function(Status2) {
  Status2[Status2["Continue"] = 100] = "Continue";
  Status2[Status2["SwitchingProtocols"] = 101] = "SwitchingProtocols";
  Status2[Status2["Processing"] = 102] = "Processing";
  Status2[Status2["EarlyHints"] = 103] = "EarlyHints";
  Status2[Status2["OK"] = 200] = "OK";
  Status2[Status2["Created"] = 201] = "Created";
  Status2[Status2["Accepted"] = 202] = "Accepted";
  Status2[Status2["NonAuthoritativeInfo"] = 203] = "NonAuthoritativeInfo";
  Status2[Status2["NoContent"] = 204] = "NoContent";
  Status2[Status2["ResetContent"] = 205] = "ResetContent";
  Status2[Status2["PartialContent"] = 206] = "PartialContent";
  Status2[Status2["MultiStatus"] = 207] = "MultiStatus";
  Status2[Status2["AlreadyReported"] = 208] = "AlreadyReported";
  Status2[Status2["IMUsed"] = 226] = "IMUsed";
  Status2[Status2["MultipleChoices"] = 300] = "MultipleChoices";
  Status2[Status2["MovedPermanently"] = 301] = "MovedPermanently";
  Status2[Status2["Found"] = 302] = "Found";
  Status2[Status2["SeeOther"] = 303] = "SeeOther";
  Status2[Status2["NotModified"] = 304] = "NotModified";
  Status2[Status2["UseProxy"] = 305] = "UseProxy";
  Status2[Status2["TemporaryRedirect"] = 307] = "TemporaryRedirect";
  Status2[Status2["PermanentRedirect"] = 308] = "PermanentRedirect";
  Status2[Status2["BadRequest"] = 400] = "BadRequest";
  Status2[Status2["Unauthorized"] = 401] = "Unauthorized";
  Status2[Status2["PaymentRequired"] = 402] = "PaymentRequired";
  Status2[Status2["Forbidden"] = 403] = "Forbidden";
  Status2[Status2["NotFound"] = 404] = "NotFound";
  Status2[Status2["MethodNotAllowed"] = 405] = "MethodNotAllowed";
  Status2[Status2["NotAcceptable"] = 406] = "NotAcceptable";
  Status2[Status2["ProxyAuthRequired"] = 407] = "ProxyAuthRequired";
  Status2[Status2["RequestTimeout"] = 408] = "RequestTimeout";
  Status2[Status2["Conflict"] = 409] = "Conflict";
  Status2[Status2["Gone"] = 410] = "Gone";
  Status2[Status2["LengthRequired"] = 411] = "LengthRequired";
  Status2[Status2["PreconditionFailed"] = 412] = "PreconditionFailed";
  Status2[Status2["RequestEntityTooLarge"] = 413] = "RequestEntityTooLarge";
  Status2[Status2["RequestURITooLong"] = 414] = "RequestURITooLong";
  Status2[Status2["UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
  Status2[Status2["RequestedRangeNotSatisfiable"] = 416] = "RequestedRangeNotSatisfiable";
  Status2[Status2["ExpectationFailed"] = 417] = "ExpectationFailed";
  Status2[Status2["Teapot"] = 418] = "Teapot";
  Status2[Status2["MisdirectedRequest"] = 421] = "MisdirectedRequest";
  Status2[Status2["UnprocessableEntity"] = 422] = "UnprocessableEntity";
  Status2[Status2["Locked"] = 423] = "Locked";
  Status2[Status2["FailedDependency"] = 424] = "FailedDependency";
  Status2[Status2["TooEarly"] = 425] = "TooEarly";
  Status2[Status2["UpgradeRequired"] = 426] = "UpgradeRequired";
  Status2[Status2["PreconditionRequired"] = 428] = "PreconditionRequired";
  Status2[Status2["TooManyRequests"] = 429] = "TooManyRequests";
  Status2[Status2["RequestHeaderFieldsTooLarge"] = 431] = "RequestHeaderFieldsTooLarge";
  Status2[Status2["UnavailableForLegalReasons"] = 451] = "UnavailableForLegalReasons";
  Status2[Status2["InternalServerError"] = 500] = "InternalServerError";
  Status2[Status2["NotImplemented"] = 501] = "NotImplemented";
  Status2[Status2["BadGateway"] = 502] = "BadGateway";
  Status2[Status2["ServiceUnavailable"] = 503] = "ServiceUnavailable";
  Status2[Status2["GatewayTimeout"] = 504] = "GatewayTimeout";
  Status2[Status2["HTTPVersionNotSupported"] = 505] = "HTTPVersionNotSupported";
  Status2[Status2["VariantAlsoNegotiates"] = 506] = "VariantAlsoNegotiates";
  Status2[Status2["InsufficientStorage"] = 507] = "InsufficientStorage";
  Status2[Status2["LoopDetected"] = 508] = "LoopDetected";
  Status2[Status2["NotExtended"] = 510] = "NotExtended";
  Status2[Status2["NetworkAuthenticationRequired"] = 511] = "NetworkAuthenticationRequired";
  return Status2;
}({});
var STATUS_TEXT = {
  [Status.Accepted]: "Accepted",
  [Status.AlreadyReported]: "Already Reported",
  [Status.BadGateway]: "Bad Gateway",
  [Status.BadRequest]: "Bad Request",
  [Status.Conflict]: "Conflict",
  [Status.Continue]: "Continue",
  [Status.Created]: "Created",
  [Status.EarlyHints]: "Early Hints",
  [Status.ExpectationFailed]: "Expectation Failed",
  [Status.FailedDependency]: "Failed Dependency",
  [Status.Forbidden]: "Forbidden",
  [Status.Found]: "Found",
  [Status.GatewayTimeout]: "Gateway Timeout",
  [Status.Gone]: "Gone",
  [Status.HTTPVersionNotSupported]: "HTTP Version Not Supported",
  [Status.IMUsed]: "IM Used",
  [Status.InsufficientStorage]: "Insufficient Storage",
  [Status.InternalServerError]: "Internal Server Error",
  [Status.LengthRequired]: "Length Required",
  [Status.Locked]: "Locked",
  [Status.LoopDetected]: "Loop Detected",
  [Status.MethodNotAllowed]: "Method Not Allowed",
  [Status.MisdirectedRequest]: "Misdirected Request",
  [Status.MovedPermanently]: "Moved Permanently",
  [Status.MultiStatus]: "Multi Status",
  [Status.MultipleChoices]: "Multiple Choices",
  [Status.NetworkAuthenticationRequired]: "Network Authentication Required",
  [Status.NoContent]: "No Content",
  [Status.NonAuthoritativeInfo]: "Non Authoritative Info",
  [Status.NotAcceptable]: "Not Acceptable",
  [Status.NotExtended]: "Not Extended",
  [Status.NotFound]: "Not Found",
  [Status.NotImplemented]: "Not Implemented",
  [Status.NotModified]: "Not Modified",
  [Status.OK]: "OK",
  [Status.PartialContent]: "Partial Content",
  [Status.PaymentRequired]: "Payment Required",
  [Status.PermanentRedirect]: "Permanent Redirect",
  [Status.PreconditionFailed]: "Precondition Failed",
  [Status.PreconditionRequired]: "Precondition Required",
  [Status.Processing]: "Processing",
  [Status.ProxyAuthRequired]: "Proxy Auth Required",
  [Status.RequestEntityTooLarge]: "Request Entity Too Large",
  [Status.RequestHeaderFieldsTooLarge]: "Request Header Fields Too Large",
  [Status.RequestTimeout]: "Request Timeout",
  [Status.RequestURITooLong]: "Request URI Too Long",
  [Status.RequestedRangeNotSatisfiable]: "Requested Range Not Satisfiable",
  [Status.ResetContent]: "Reset Content",
  [Status.SeeOther]: "See Other",
  [Status.ServiceUnavailable]: "Service Unavailable",
  [Status.SwitchingProtocols]: "Switching Protocols",
  [Status.Teapot]: "I'm a teapot",
  [Status.TemporaryRedirect]: "Temporary Redirect",
  [Status.TooEarly]: "Too Early",
  [Status.TooManyRequests]: "Too Many Requests",
  [Status.Unauthorized]: "Unauthorized",
  [Status.UnavailableForLegalReasons]: "Unavailable For Legal Reasons",
  [Status.UnprocessableEntity]: "Unprocessable Entity",
  [Status.UnsupportedMediaType]: "Unsupported Media Type",
  [Status.UpgradeRequired]: "Upgrade Required",
  [Status.UseProxy]: "Use Proxy",
  [Status.VariantAlsoNegotiates]: "Variant Also Negotiates"
};
function isRedirectStatus(status) {
  return status >= 300 && status < 400;
}
function isClientErrorStatus(status) {
  return status >= 400 && status < 500;
}

// deno:https://deno.land/std@0.200.0/http/http_errors.ts
var ERROR_STATUS_MAP = {
  "BadRequest": 400,
  "Unauthorized": 401,
  "PaymentRequired": 402,
  "Forbidden": 403,
  "NotFound": 404,
  "MethodNotAllowed": 405,
  "NotAcceptable": 406,
  "ProxyAuthRequired": 407,
  "RequestTimeout": 408,
  "Conflict": 409,
  "Gone": 410,
  "LengthRequired": 411,
  "PreconditionFailed": 412,
  "RequestEntityTooLarge": 413,
  "RequestURITooLong": 414,
  "UnsupportedMediaType": 415,
  "RequestedRangeNotSatisfiable": 416,
  "ExpectationFailed": 417,
  "Teapot": 418,
  "MisdirectedRequest": 421,
  "UnprocessableEntity": 422,
  "Locked": 423,
  "FailedDependency": 424,
  "UpgradeRequired": 426,
  "PreconditionRequired": 428,
  "TooManyRequests": 429,
  "RequestHeaderFieldsTooLarge": 431,
  "UnavailableForLegalReasons": 451,
  "InternalServerError": 500,
  "NotImplemented": 501,
  "BadGateway": 502,
  "ServiceUnavailable": 503,
  "GatewayTimeout": 504,
  "HTTPVersionNotSupported": 505,
  "VariantAlsoNegotiates": 506,
  "InsufficientStorage": 507,
  "LoopDetected": 508,
  "NotExtended": 510,
  "NetworkAuthenticationRequired": 511
};
var HttpError = class extends Error {
  #status = Status.InternalServerError;
  #expose;
  #headers;
  constructor(message = "Http Error", options) {
    super(message, options);
    this.#expose = options?.expose === void 0 ? isClientErrorStatus(this.status) : options.expose;
    if (options?.headers) {
      this.#headers = new Headers(options.headers);
    }
  }
  /** A flag to indicate if the internals of the error, like the stack, should
   * be exposed to a client, or if they are "private" and should not be leaked.
   * By default, all client errors are `true` and all server errors are
   * `false`. */
  get expose() {
    return this.#expose;
  }
  /** The optional headers object that is set on the error. */
  get headers() {
    return this.#headers;
  }
  /** The error status that is set on the error. */
  get status() {
    return this.#status;
  }
};
function createHttpErrorConstructor(status) {
  const name = `${Status[status]}Error`;
  const ErrorCtor = class extends HttpError {
    constructor(message = STATUS_TEXT[status], options) {
      super(message, options);
      Object.defineProperty(this, "name", {
        configurable: true,
        enumerable: false,
        value: name,
        writable: true
      });
    }
    get status() {
      return status;
    }
  };
  return ErrorCtor;
}
var errors = {};
for (const [key, value] of Object.entries(ERROR_STATUS_MAP)) {
  errors[key] = createHttpErrorConstructor(value);
}
function createHttpError(status = Status.InternalServerError, message, options) {
  return new errors[Status[status]](message, options);
}

// deno:https://deno.land/std@0.200.0/http/etag.ts
var encoder2 = new TextEncoder();
var DEFAULT_ALGORITHM = "SHA-256";
function isFileInfo(value) {
  return Boolean(value && typeof value === "object" && "mtime" in value && "size" in value);
}
async function calcEntity(entity, { algorithm = DEFAULT_ALGORITHM }) {
  if (entity.length === 0) {
    return `0-47DEQpj8HBSa+/TImW+5JCeuQeR`;
  }
  if (typeof entity === "string") {
    entity = encoder2.encode(entity);
  }
  const hash = encode(await crypto.subtle.digest(algorithm, entity)).substring(0, 27);
  return `${entity.length.toString(16)}-${hash}`;
}
async function calcFileInfo(fileInfo, { algorithm = DEFAULT_ALGORITHM }) {
  if (fileInfo.mtime) {
    const hash = encode(await crypto.subtle.digest(algorithm, encoder2.encode(fileInfo.mtime.toJSON()))).substring(0, 27);
    return `${fileInfo.size.toString(16)}-${hash}`;
  }
}
async function calculate(entity, options = {}) {
  const weak = options.weak ?? isFileInfo(entity);
  const tag = await (isFileInfo(entity) ? calcFileInfo(entity, options) : calcEntity(entity, options));
  return tag ? weak ? `W/"${tag}"` : `"${tag}"` : void 0;
}
function ifNoneMatch(value, etag) {
  if (!value || !etag) {
    return true;
  }
  if (value.trim() === "*") {
    return false;
  }
  etag = etag.startsWith("W/") ? etag.slice(2) : etag;
  const tags = value.split(/\s*,\s*/).map((tag) => tag.startsWith("W/") ? tag.slice(2) : tag);
  return !tags.includes(etag);
}

// deno:https://deno.land/std@0.200.0/http/_negotiation/common.ts
function compareSpecs(a, b) {
  return b.q - a.q || (b.s ?? 0) - (a.s ?? 0) || (a.o ?? 0) - (b.o ?? 0) || a.i - b.i || 0;
}
function isQuality(spec) {
  return spec.q > 0;
}

// deno:https://deno.land/std@0.200.0/http/_negotiation/encoding.ts
var simpleEncodingRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/;
function parseEncoding(str, i) {
  const match2 = simpleEncodingRegExp.exec(str);
  if (!match2) {
    return void 0;
  }
  const encoding = match2[1];
  let q = 1;
  if (match2[2]) {
    const params = match2[2].split(";");
    for (const param of params) {
      const p = param.trim().split("=");
      if (p[0] === "q") {
        q = parseFloat(p[1]);
        break;
      }
    }
  }
  return {
    encoding,
    q,
    i
  };
}
function specify(encoding, spec, i = -1) {
  if (!spec.encoding) {
    return;
  }
  let s = 0;
  if (spec.encoding.toLocaleLowerCase() === encoding.toLocaleLowerCase()) {
    s = 1;
  } else if (spec.encoding !== "*") {
    return;
  }
  return {
    i,
    o: spec.i,
    q: spec.q,
    s
  };
}
function parseAcceptEncoding(accept) {
  const accepts2 = accept.split(",");
  const parsedAccepts = [];
  let hasIdentity = false;
  let minQuality = 1;
  for (let i = 0; i < accepts2.length; i++) {
    const encoding = parseEncoding(accepts2[i].trim(), i);
    if (encoding) {
      parsedAccepts.push(encoding);
      hasIdentity = hasIdentity || !!specify("identity", encoding);
      minQuality = Math.min(minQuality, encoding.q || 1);
    }
  }
  if (!hasIdentity) {
    parsedAccepts.push({
      encoding: "identity",
      q: minQuality,
      i: accepts2.length - 1
    });
  }
  return parsedAccepts;
}
function getEncodingPriority(encoding, accepted, index) {
  let priority = {
    o: -1,
    q: 0,
    s: 0,
    i: 0
  };
  for (const s of accepted) {
    const spec = specify(encoding, s, index);
    if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
      priority = spec;
    }
  }
  return priority;
}
function preferredEncodings(accept, provided) {
  const accepts2 = parseAcceptEncoding(accept);
  if (!provided) {
    return accepts2.filter(isQuality).sort(compareSpecs).map((spec) => spec.encoding);
  }
  const priorities = provided.map((type, index) => getEncodingPriority(type, accepts2, index));
  return priorities.filter(isQuality).sort(compareSpecs).map((priority) => provided[priorities.indexOf(priority)]);
}

// deno:https://deno.land/std@0.200.0/http/_negotiation/language.ts
var SIMPLE_LANGUAGE_REGEXP = /^\s*([^\s\-;]+)(?:-([^\s;]+))?\s*(?:;(.*))?$/;
function parseLanguage(str, i) {
  const match2 = SIMPLE_LANGUAGE_REGEXP.exec(str);
  if (!match2) {
    return void 0;
  }
  const [, prefix, suffix] = match2;
  const full = suffix ? `${prefix}-${suffix}` : prefix;
  let q = 1;
  if (match2[3]) {
    const params = match2[3].split(";");
    for (const param of params) {
      const [key, value] = param.trim().split("=");
      if (key === "q") {
        q = parseFloat(value);
        break;
      }
    }
  }
  return {
    prefix,
    suffix,
    full,
    q,
    i
  };
}
function parseAcceptLanguage(accept) {
  const accepts2 = accept.split(",");
  const result = [];
  for (let i = 0; i < accepts2.length; i++) {
    const language = parseLanguage(accepts2[i].trim(), i);
    if (language) {
      result.push(language);
    }
  }
  return result;
}
function specify2(language, spec, i) {
  const p = parseLanguage(language, i);
  if (!p) {
    return void 0;
  }
  let s = 0;
  if (spec.full.toLowerCase() === p.full.toLowerCase()) {
    s |= 4;
  } else if (spec.prefix.toLowerCase() === p.prefix.toLowerCase()) {
    s |= 2;
  } else if (spec.full.toLowerCase() === p.prefix.toLowerCase()) {
    s |= 1;
  } else if (spec.full !== "*") {
    return;
  }
  return {
    i,
    o: spec.i,
    q: spec.q,
    s
  };
}
function getLanguagePriority(language, accepted, index) {
  let priority = {
    i: -1,
    o: -1,
    q: 0,
    s: 0
  };
  for (const accepts2 of accepted) {
    const spec = specify2(language, accepts2, index);
    if (spec && ((priority.s ?? 0) - (spec.s ?? 0) || priority.q - spec.q || (priority.o ?? 0) - (spec.o ?? 0)) < 0) {
      priority = spec;
    }
  }
  return priority;
}
function preferredLanguages(accept = "*", provided) {
  const accepts2 = parseAcceptLanguage(accept);
  if (!provided) {
    return accepts2.filter(isQuality).sort(compareSpecs).map((spec) => spec.full);
  }
  const priorities = provided.map((type, index) => getLanguagePriority(type, accepts2, index));
  return priorities.filter(isQuality).sort(compareSpecs).map((priority) => provided[priorities.indexOf(priority)]);
}

// deno:https://deno.land/std@0.200.0/http/_negotiation/media_type.ts
var simpleMediaTypeRegExp = /^\s*([^\s\/;]+)\/([^;\s]+)\s*(?:;(.*))?$/;
function quoteCount(str) {
  let count = 0;
  let index = 0;
  while ((index = str.indexOf(`"`, index)) !== -1) {
    count++;
    index++;
  }
  return count;
}
function splitMediaTypes(accept) {
  const accepts2 = accept.split(",");
  let j = 0;
  for (let i = 1; i < accepts2.length; i++) {
    if (quoteCount(accepts2[j]) % 2 === 0) {
      accepts2[++j] = accepts2[i];
    } else {
      accepts2[j] += `,${accepts2[i]}`;
    }
  }
  accepts2.length = j + 1;
  return accepts2;
}
function splitParameters(str) {
  const parameters = str.split(";");
  let j = 0;
  for (let i = 1; i < parameters.length; i++) {
    if (quoteCount(parameters[j]) % 2 === 0) {
      parameters[++j] = parameters[i];
    } else {
      parameters[j] += `;${parameters[i]}`;
    }
  }
  parameters.length = j + 1;
  return parameters.map((p) => p.trim());
}
function splitKeyValuePair(str) {
  const [key, value] = str.split("=");
  return [
    key.toLowerCase(),
    value
  ];
}
function parseMediaType(str, i) {
  const match2 = simpleMediaTypeRegExp.exec(str);
  if (!match2) {
    return;
  }
  const params = /* @__PURE__ */ Object.create(null);
  let q = 1;
  const [, type, subtype, parameters] = match2;
  if (parameters) {
    const kvps = splitParameters(parameters).map(splitKeyValuePair);
    for (const [key, val] of kvps) {
      const value = val && val[0] === `"` && val[val.length - 1] === `"` ? val.slice(1, val.length - 1) : val;
      if (key === "q" && value) {
        q = parseFloat(value);
        break;
      }
      params[key] = value;
    }
  }
  return {
    type,
    subtype,
    params,
    q,
    i
  };
}
function parseAccept(accept) {
  const accepts2 = splitMediaTypes(accept);
  const mediaTypes = [];
  for (let i = 0; i < accepts2.length; i++) {
    const mediaType = parseMediaType(accepts2[i].trim(), i);
    if (mediaType) {
      mediaTypes.push(mediaType);
    }
  }
  return mediaTypes;
}
function getFullType(spec) {
  return `${spec.type}/${spec.subtype}`;
}
function specify3(type, spec, index) {
  const p = parseMediaType(type, index);
  if (!p) {
    return;
  }
  let s = 0;
  if (spec.type.toLowerCase() === p.type.toLowerCase()) {
    s |= 4;
  } else if (spec.type !== "*") {
    return;
  }
  if (spec.subtype.toLowerCase() === p.subtype.toLowerCase()) {
    s |= 2;
  } else if (spec.subtype !== "*") {
    return;
  }
  const keys2 = Object.keys(spec.params);
  if (keys2.length) {
    if (keys2.every((key) => (spec.params[key] || "").toLowerCase() === (p.params[key] || "").toLowerCase())) {
      s |= 1;
    } else {
      return;
    }
  }
  return {
    i: index,
    o: spec.o,
    q: spec.q,
    s
  };
}
function getMediaTypePriority(type, accepted, index) {
  let priority = {
    o: -1,
    q: 0,
    s: 0,
    i: index
  };
  for (const accepts2 of accepted) {
    const spec = specify3(type, accepts2, index);
    if (spec && ((priority.s || 0) - (spec.s || 0) || (priority.q || 0) - (spec.q || 0) || (priority.o || 0) - (spec.o || 0)) < 0) {
      priority = spec;
    }
  }
  return priority;
}
function preferredMediaTypes(accept, provided) {
  const accepts2 = parseAccept(accept === void 0 ? "*/*" : accept || "");
  if (!provided) {
    return accepts2.filter(isQuality).sort(compareSpecs).map(getFullType);
  }
  const priorities = provided.map((type, index) => {
    return getMediaTypePriority(type, accepts2, index);
  });
  return priorities.filter(isQuality).sort(compareSpecs).map((priority) => provided[priorities.indexOf(priority)]);
}

// deno:https://deno.land/std@0.200.0/http/negotiation.ts
function accepts(request, ...types2) {
  const accept = request.headers.get("accept");
  return types2.length ? accept ? preferredMediaTypes(accept, types2)[0] : types2[0] : accept ? preferredMediaTypes(accept) : [
    "*/*"
  ];
}
function acceptsEncodings(request, ...encodings) {
  const acceptEncoding = request.headers.get("accept-encoding");
  return encodings.length ? acceptEncoding ? preferredEncodings(acceptEncoding, encodings)[0] : encodings[0] : acceptEncoding ? preferredEncodings(acceptEncoding) : [
    "*"
  ];
}
function acceptsLanguages(request, ...langs) {
  const acceptLanguage = request.headers.get("accept-language");
  return langs.length ? acceptLanguage ? preferredLanguages(acceptLanguage, langs)[0] : langs[0] : acceptLanguage ? preferredLanguages(acceptLanguage) : [
    "*"
  ];
}

// deno:https://deno.land/std@0.200.0/http/server_sent_event.ts
var _computedKey4;
var _computedKey13;
var encoder3 = new TextEncoder();
var DEFAULT_KEEP_ALIVE_INTERVAL = 3e4;
var CloseEvent = class extends Event {
  constructor(eventInit) {
    super("close", eventInit);
  }
};
var ServerSentEvent = class extends Event {
  #data;
  #id;
  #type;
  /**
   * @param type the event type that will be available on the client. The type
   *             of `"message"` will be handled specifically as a message
   *             server-side event.
   * @param eventInit initialization options for the event
   */
  constructor(type, eventInit = {}) {
    super(type, eventInit);
    const { data, replacer, space } = eventInit;
    this.#type = type;
    try {
      this.#data = typeof data === "string" ? data : data !== void 0 ? JSON.stringify(data, replacer, space) : "";
    } catch (e) {
      assert(e instanceof Error);
      throw new TypeError(`data could not be coerced into a serialized string.
  ${e.message}`);
    }
    const { id } = eventInit;
    this.#id = id;
  }
  /** The data associated with the event, which will be sent to the client and
   * be made available in the `EventSource`. */
  get data() {
    return this.#data;
  }
  /** The optional ID associated with the event that will be sent to the client
   * and be made available in the `EventSource`. */
  get id() {
    return this.#id;
  }
  toString() {
    const data = `data: ${this.#data.split("\n").join("\ndata: ")}
`;
    return `${this.#type === "__message" ? "" : `event: ${this.#type}
`}${this.#id ? `id: ${String(this.#id)}
` : ""}${data}
`;
  }
};
var RESPONSE_HEADERS = [
  [
    "Connection",
    "Keep-Alive"
  ],
  [
    "Content-Type",
    "text/event-stream"
  ],
  [
    "Cache-Control",
    "no-cache"
  ],
  [
    "Keep-Alive",
    `timeout=${Number.MAX_SAFE_INTEGER}`
  ]
];
_computedKey4 = Symbol.for("Deno.customInspect"), _computedKey13 = Symbol.for("nodejs.util.inspect.custom");
var ServerSentEventStreamTarget = class extends EventTarget {
  #bodyInit;
  #closed = false;
  #controller;
  // we are ignoring any here, because when exporting to npm/Node.js, the timer
  // handle isn't a number.
  // deno-lint-ignore no-explicit-any
  #keepAliveId;
  // deno-lint-ignore no-explicit-any
  #error(error) {
    this.dispatchEvent(new CloseEvent({
      cancelable: false
    }));
    const errorEvent = new ErrorEvent("error", {
      error
    });
    this.dispatchEvent(errorEvent);
  }
  #push(payload) {
    if (!this.#controller) {
      this.#error(new Error("The controller has not been set."));
      return;
    }
    if (this.#closed) {
      return;
    }
    this.#controller.enqueue(encoder3.encode(payload));
  }
  get closed() {
    return this.#closed;
  }
  constructor({ keepAlive = false } = {}) {
    super();
    this.#bodyInit = new ReadableStream({
      start: (controller) => {
        this.#controller = controller;
      },
      cancel: (error) => {
        if (error instanceof Error && error.message.includes("connection closed")) {
          this.close();
        } else {
          this.#error(error);
        }
      }
    });
    this.addEventListener("close", () => {
      this.#closed = true;
      if (this.#keepAliveId != null) {
        clearInterval(this.#keepAliveId);
        this.#keepAliveId = void 0;
      }
      if (this.#controller) {
        try {
          this.#controller.close();
        } catch {
        }
      }
    });
    if (keepAlive) {
      const interval = typeof keepAlive === "number" ? keepAlive : DEFAULT_KEEP_ALIVE_INTERVAL;
      this.#keepAliveId = setInterval(() => {
        this.dispatchComment("keep-alive comment");
      }, interval);
    }
  }
  /** Returns a {@linkcode Response} which contains the body and headers needed
   * to initiate a SSE connection with the client. */
  asResponse(responseInit) {
    return new Response(...this.asResponseInit(responseInit));
  }
  /** Returns a tuple which contains the {@linkcode BodyInit} and
   * {@linkcode ResponseInit} needed to create a response that will establish
   * a SSE connection with the client. */
  asResponseInit(responseInit = {}) {
    const headers = new Headers(responseInit.headers);
    for (const [key, value] of RESPONSE_HEADERS) {
      headers.set(key, value);
    }
    responseInit.headers = headers;
    return [
      this.#bodyInit,
      responseInit
    ];
  }
  close() {
    this.dispatchEvent(new CloseEvent({
      cancelable: false
    }));
    return Promise.resolve();
  }
  dispatchComment(comment) {
    this.#push(`: ${comment.split("\n").join("\n: ")}

`);
    return true;
  }
  // deno-lint-ignore no-explicit-any
  dispatchMessage(data) {
    const event = new ServerSentEvent("__message", {
      data
    });
    return this.dispatchEvent(event);
  }
  dispatchEvent(event) {
    const dispatched = super.dispatchEvent(event);
    if (dispatched && event instanceof ServerSentEvent) {
      this.#push(String(event));
    }
    return dispatched;
  }
  [_computedKey4](inspect) {
    return `${this.constructor.name} ${inspect({
      "#bodyInit": this.#bodyInit,
      "#closed": this.#closed
    })}`;
  }
  [_computedKey13](depth, options, inspect) {
    if (depth < 0) {
      return options.stylize(`[${this.constructor.name}]`, "special");
    }
    const newOptions = Object.assign({}, options, {
      depth: options.depth === null ? null : options.depth - 1
    });
    return `${options.stylize(this.constructor.name, "special")} ${inspect({
      "#bodyInit": this.#bodyInit,
      "#closed": this.#closed
    }, newOptions)}`;
  }
};

// deno:https://deno.land/std@0.200.0/http/user_agent.ts
var _computedKey5;
var _computedKey14;
var ARCHITECTURE = "architecture";
var MODEL = "model";
var NAME = "name";
var TYPE = "type";
var VENDOR = "vendor";
var VERSION = "version";
var EMPTY = "";
var CONSOLE = "console";
var EMBEDDED = "embedded";
var MOBILE = "mobile";
var TABLET = "tablet";
var SMARTTV = "smarttv";
var WEARABLE = "wearable";
var PREFIX_MOBILE = "Mobile ";
var SUFFIX_BROWSER = " Browser";
var AMAZON = "Amazon";
var APPLE = "Apple";
var ASUS = "ASUS";
var BLACKBERRY = "BlackBerry";
var CHROME = "Chrome";
var EDGE = "Edge";
var FACEBOOK = "Facebook";
var FIREFOX = "Firefox";
var GOOGLE = "Google";
var HUAWEI = "Huawei";
var LG = "LG";
var MICROSOFT = "Microsoft";
var MOTOROLA = "Motorola";
var OPERA = "Opera";
var SAMSUNG = "Samsung";
var SHARP = "Sharp";
var SONY = "Sony";
var WINDOWS = "Windows";
var XIAOMI = "Xiaomi";
var ZEBRA = "Zebra";
function lowerize(str) {
  return str.toLowerCase();
}
function majorize(str) {
  return str ? str.replace(/[^\d\.]/g, EMPTY).split(".")[0] : void 0;
}
function trim(str) {
  return str.trimStart();
}
var windowsVersionMap = /* @__PURE__ */ new Map([
  [
    "ME",
    "4.90"
  ],
  [
    "NT 3.11",
    "NT3.51"
  ],
  [
    "NT 4.0",
    "NT4.0"
  ],
  [
    "2000",
    "NT 5.0"
  ],
  [
    "XP",
    [
      "NT 5.1",
      "NT 5.2"
    ]
  ],
  [
    "Vista",
    "NT 6.0"
  ],
  [
    "7",
    "NT 6.1"
  ],
  [
    "8",
    "NT 6.2"
  ],
  [
    "8.1",
    "NT 6.3"
  ],
  [
    "10",
    [
      "NT 6.4",
      "NT 10.0"
    ]
  ],
  [
    "RT",
    "ARM"
  ]
]);
function has(str1, str2) {
  if (Array.isArray(str1)) {
    for (const el of str1) {
      if (lowerize(el) === lowerize(str2)) {
        return true;
      }
    }
    return false;
  }
  return lowerize(str2).indexOf(lowerize(str1)) !== -1;
}
function mapWinVer(str) {
  for (const [key, value] of windowsVersionMap) {
    if (Array.isArray(value)) {
      for (const v of value) {
        if (has(v, str)) {
          return key;
        }
      }
    } else if (has(value, str)) {
      return key;
    }
  }
  return str || void 0;
}
function mapper(target, ua, tuples) {
  let matches = null;
  for (const [matchers2, processors] of tuples) {
    let j = 0;
    let k = 0;
    while (j < matchers2.length && !matches) {
      if (!matchers2[j]) {
        break;
      }
      matches = matchers2[j++].exec(ua);
      if (matches) {
        for (const processor of processors) {
          const match2 = matches[++k];
          if (Array.isArray(processor)) {
            if (processor.length === 2) {
              const [prop, value] = processor;
              if (typeof value === "function") {
                target[prop] = value.call(target, match2);
              } else {
                target[prop] = value;
              }
            } else if (processor.length === 3) {
              const [prop, re, value] = processor;
              target[prop] = match2 ? match2.replace(re, value) : void 0;
            } else {
              const [prop, re, value, fn] = processor;
              assert(fn);
              target[prop] = match2 ? fn.call(prop, match2.replace(re, value)) : void 0;
            }
          } else {
            target[processor] = match2 ? match2 : void 0;
          }
        }
      }
    }
  }
}
var matchers = {
  browser: [
    [
      [
        /\b(?:crmo|crios)\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `${PREFIX_MOBILE}${CHROME}`
        ]
      ]
    ],
    [
      [
        /edg(?:e|ios|a)?\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "Edge"
        ]
      ]
    ],
    // Presto based
    [
      [
        /(opera mini)\/([-\w\.]+)/i,
        /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,
        /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /opios[\/ ]+([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `${OPERA} Mini`
        ]
      ]
    ],
    [
      [
        /\bopr\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          OPERA
        ]
      ]
    ],
    [
      [
        // Mixed
        /(kindle)\/([\w\.]+)/i,
        /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i,
        // Trident based
        /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i,
        /(ba?idubrowser)[\/ ]?([\w\.]+)/i,
        /(?:ms|\()(ie) ([\w\.]+)/i,
        // Webkit/KHTML based
        // Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser/QupZilla/Falkon/Rekonq/Puffin/Brave/Whale/QQBrowserLite/QQ//Vivaldi/DuckDuckGo
        /(flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i,
        /(heytap|ovi)browser\/([\d\.]+)/i,
        /(weibo)__([\d\.]+)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "UCBrowser"
        ]
      ]
    ],
    [
      [
        /microm.+\bqbcore\/([\w\.]+)/i,
        /\bqbcore\/([\w\.]+).+microm/i
      ],
      [
        VERSION,
        [
          NAME,
          "WeChat(Win) Desktop"
        ]
      ]
    ],
    [
      [
        /micromessenger\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "WeChat"
        ]
      ]
    ],
    [
      [
        /konqueror\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "Konqueror"
        ]
      ]
    ],
    [
      [
        /trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i
      ],
      [
        VERSION,
        [
          NAME,
          "IE"
        ]
      ]
    ],
    [
      [
        /ya(?:search)?browser\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "Yandex"
        ]
      ]
    ],
    [
      [
        /(avast|avg)\/([\w\.]+)/i
      ],
      [
        [
          NAME,
          /(.+)/,
          `$1 Secure${SUFFIX_BROWSER}`
        ],
        VERSION
      ]
    ],
    [
      [
        /\bfocus\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `${FIREFOX} Focus`
        ]
      ]
    ],
    [
      [
        /\bopt\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `${OPERA} Touch`
        ]
      ]
    ],
    [
      [
        /coc_coc\w+\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "Coc Coc"
        ]
      ]
    ],
    [
      [
        /dolfin\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "Dolphin"
        ]
      ]
    ],
    [
      [
        /coast\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `${OPERA} Coast`
        ]
      ]
    ],
    [
      [
        /miuibrowser\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `MIUI${SUFFIX_BROWSER}`
        ]
      ]
    ],
    [
      [
        /fxios\/([\w\.-]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `${PREFIX_MOBILE}${FIREFOX}`
        ]
      ]
    ],
    [
      [
        /\bqihu|(qi?ho?o?|360)browser/i
      ],
      [
        [
          NAME,
          `360${SUFFIX_BROWSER}`
        ]
      ]
    ],
    [
      [
        /(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i
      ],
      [
        [
          NAME,
          /(.+)/,
          "$1" + SUFFIX_BROWSER
        ],
        VERSION
      ]
    ],
    [
      [
        /(comodo_dragon)\/([\w\.]+)/i
      ],
      [
        [
          NAME,
          /_/g,
          " "
        ],
        VERSION
      ]
    ],
    [
      [
        /(electron)\/([\w\.]+) safari/i,
        /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,
        /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /(metasr)[\/ ]?([\w\.]+)/i,
        /(lbbrowser)/i,
        /\[(linkedin)app\]/i
      ],
      [
        NAME
      ]
    ],
    [
      [
        /((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i
      ],
      [
        [
          NAME,
          FACEBOOK
        ],
        VERSION
      ]
    ],
    [
      [
        /(kakao(?:talk|story))[\/ ]([\w\.]+)/i,
        /(naver)\(.*?(\d+\.[\w\.]+).*\)/i,
        /safari (line)\/([\w\.]+)/i,
        /\b(line)\/([\w\.]+)\/iab/i,
        /(chromium|instagram)[\/ ]([-\w\.]+)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /\bgsa\/([\w\.]+) .*safari\//i
      ],
      [
        VERSION,
        [
          NAME,
          "GSA"
        ]
      ]
    ],
    [
      [
        /musical_ly(?:.+app_?version\/|_)([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "TikTok"
        ]
      ]
    ],
    [
      [
        /headlesschrome(?:\/([\w\.]+)| )/i
      ],
      [
        VERSION,
        [
          NAME,
          `${CHROME} Headless`
        ]
      ]
    ],
    [
      [
        / wv\).+(chrome)\/([\w\.]+)/i
      ],
      [
        [
          NAME,
          `${CHROME} WebView`
        ],
        VERSION
      ]
    ],
    [
      [
        /droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i
      ],
      [
        VERSION,
        [
          NAME,
          `Android${SUFFIX_BROWSER}`
        ]
      ]
    ],
    [
      [
        /chrome\/([\w\.]+) mobile/i
      ],
      [
        VERSION,
        [
          NAME,
          `${PREFIX_MOBILE}${CHROME}`
        ]
      ]
    ],
    [
      [
        /(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /version\/([\w\.\,]+) .*mobile(?:\/\w+ | ?)safari/i
      ],
      [
        VERSION,
        [
          NAME,
          `${PREFIX_MOBILE}Safari`
        ]
      ]
    ],
    [
      [
        /iphone .*mobile(?:\/\w+ | ?)safari/i
      ],
      [
        [
          NAME,
          `${PREFIX_MOBILE}Safari`
        ]
      ]
    ],
    [
      [
        /version\/([\w\.\,]+) .*(safari)/i
      ],
      [
        VERSION,
        NAME
      ]
    ],
    [
      [
        /webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i
      ],
      [
        NAME,
        [
          VERSION,
          "1"
        ]
      ]
    ],
    [
      [
        /(webkit|khtml)\/([\w\.]+)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /(?:mobile|tablet);.*(firefox)\/([\w\.-]+)/i
      ],
      [
        [
          NAME,
          `${PREFIX_MOBILE}${FIREFOX}`
        ],
        VERSION
      ]
    ],
    [
      [
        /(navigator|netscape\d?)\/([-\w\.]+)/i
      ],
      [
        [
          NAME,
          "Netscape"
        ],
        VERSION
      ]
    ],
    [
      [
        /mobile vr; rv:([\w\.]+)\).+firefox/i
      ],
      [
        VERSION,
        [
          NAME,
          `${FIREFOX} Reality`
        ]
      ]
    ],
    [
      [
        /ekiohf.+(flow)\/([\w\.]+)/i,
        /(swiftfox)/i,
        /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i,
        // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror/Klar
        /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,
        // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
        /(firefox)\/([\w\.]+)/i,
        /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,
        // Other
        /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,
        // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir/Obigo/Mosaic/Go/ICE/UP.Browser
        /(links) \(([\w\.]+)/i,
        /panasonic;(viera)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /(cobalt)\/([\w\.]+)/i
      ],
      [
        NAME,
        [
          VERSION,
          /[^\d\.]+./,
          EMPTY
        ]
      ]
    ]
  ],
  cpu: [
    [
      [
        /\b(?:(amd|x|x86[-_]?|wow|win)64)\b/i
      ],
      [
        [
          ARCHITECTURE,
          "amd64"
        ]
      ]
    ],
    [
      [
        /(ia32(?=;))/i,
        /((?:i[346]|x)86)[;\)]/i
      ],
      [
        [
          ARCHITECTURE,
          "ia32"
        ]
      ]
    ],
    [
      [
        /\b(aarch64|arm(v?8e?l?|_?64))\b/i
      ],
      [
        [
          ARCHITECTURE,
          "arm64"
        ]
      ]
    ],
    [
      [
        /windows (ce|mobile); ppc;/i
      ],
      [
        [
          ARCHITECTURE,
          "arm"
        ]
      ]
    ],
    [
      [
        /((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i
      ],
      [
        [
          ARCHITECTURE,
          /ower/,
          EMPTY,
          lowerize
        ]
      ]
    ],
    [
      [
        /(sun4\w)[;\)]/i
      ],
      [
        [
          ARCHITECTURE,
          "sparc"
        ]
      ]
    ],
    [
      [
        /((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i
      ],
      [
        [
          ARCHITECTURE,
          lowerize
        ]
      ]
    ]
  ],
  device: [
    [
      [
        /\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          SAMSUNG
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i,
        /samsung[- ]([-\w]+)/i,
        /sec-(sgh\w+)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          SAMSUNG
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          APPLE
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /\((ipad);[-\w\),; ]+apple/i,
        /applecoremedia\/[\w\.]+ \((ipad)/i,
        /\b(ipad)\d\d?,\d\d?[;\]].+ios/i
      ],
      [
        MODEL,
        [
          VENDOR,
          APPLE
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /(macintosh);/i
      ],
      [
        MODEL,
        [
          VENDOR,
          APPLE
        ]
      ]
    ],
    [
      [
        /\b(sh-?[altvz]?\d\d[a-ekm]?)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          SHARP
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          HUAWEI
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /(?:huawei|honor)([-\w ]+)[;\)]/i,
        /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          HUAWEI
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /\b(poco[\w ]+|m2\d{3}j\d\d[a-z]{2})(?: bui|\))/i,
        /\b; (\w+) build\/hm\1/i,
        /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,
        /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,
        /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i
      ],
      [
        [
          MODEL,
          /_/g,
          " "
        ],
        [
          VENDOR,
          XIAOMI
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i
      ],
      [
        [
          MODEL,
          /_/g,
          " "
        ],
        [
          VENDOR,
          XIAOMI
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /; (\w+) bui.+ oppo/i,
        /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "OPPO"
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /vivo (\w+)(?: bui|\))/i,
        /\b(v[12]\d{3}\w?[at])(?: bui|;)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "Vivo"
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /\b(rmx[12]\d{3})(?: bui|;|\))/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "Realme"
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,
        /\bmot(?:orola)?[- ](\w*)/i,
        /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i
      ],
      [
        MODEL,
        [
          VENDOR,
          MOTOROLA
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /\b(mz60\d|xoom[2 ]{0,2}) build\//i
      ],
      [
        MODEL,
        [
          VENDOR,
          MOTOROLA
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i
      ],
      [
        MODEL,
        [
          VENDOR,
          LG
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,
        /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i,
        /\blg-?([\d\w]+) bui/i
      ],
      [
        MODEL,
        [
          VENDOR,
          LG
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(ideatab[-\w ]+)/i,
        /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "Lenovo"
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /(?:maemo|nokia).*(n900|lumia \d+)/i,
        /nokia[-_ ]?([-\w\.]*)/i
      ],
      [
        [
          MODEL,
          /_/g,
          " "
        ],
        [
          VENDOR,
          "Nokia"
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(pixel c)\b/i
      ],
      [
        MODEL,
        [
          VENDOR,
          GOOGLE
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i
      ],
      [
        MODEL,
        [
          VENDOR,
          GOOGLE
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i
      ],
      [
        MODEL,
        [
          VENDOR,
          SONY
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /sony tablet [ps]/i,
        /\b(?:sony)?sgp\w+(?: bui|\))/i
      ],
      [
        [
          MODEL,
          "Xperia Tablet"
        ],
        [
          VENDOR,
          SONY
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        / (kb2005|in20[12]5|be20[12][59])\b/i,
        /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "OnePlus"
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(alexa)webm/i,
        /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i,
        /(kf[a-z]+)( bui|\)).+silk\//i
      ],
      [
        MODEL,
        [
          VENDOR,
          AMAZON
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i
      ],
      [
        [
          MODEL,
          /(.+)/g,
          "Fire Phone $1"
        ],
        [
          VENDOR,
          AMAZON
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(playbook);[-\w\),; ]+(rim)/i
      ],
      [
        MODEL,
        VENDOR,
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /\b((?:bb[a-f]|st[hv])100-\d)/i,
        /\(bb10; (\w+)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          BLACKBERRY
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i
      ],
      [
        MODEL,
        [
          VENDOR,
          ASUS
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        / (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i
      ],
      [
        MODEL,
        [
          VENDOR,
          ASUS
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(nexus 9)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "HTC"
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,
        /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,
        /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i
      ],
      [
        VENDOR,
        [
          MODEL,
          /_/g,
          " "
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /droid.+; ([ab][1-7]-?[0178a]\d\d?)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "Acer"
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /droid.+; (m[1-5] note) bui/i,
        /\bmz-([-\w]{2,})/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "Meizu"
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron|infinix|tecno)[-_ ]?([-\w]*)/i,
        // BlackBerry/BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron
        /(hp) ([\w ]+\w)/i,
        /(asus)-?(\w+)/i,
        /(microsoft); (lumia[\w ]+)/i,
        /(lenovo)[-_ ]?([-\w]+)/i,
        /(jolla)/i,
        /(oppo) ?([\w ]+) bui/i
      ],
      [
        VENDOR,
        MODEL,
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(kobo)\s(ereader|touch)/i,
        /(archos) (gamepad2?)/i,
        /(hp).+(touchpad(?!.+tablet)|tablet)/i,
        /(kindle)\/([\w\.]+)/i
      ],
      [
        VENDOR,
        MODEL,
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /(surface duo)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          MICROSOFT
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /droid [\d\.]+; (fp\du?)(?: b|\))/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "Fairphone"
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(shield[\w ]+) b/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "Nvidia"
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /(sprint) (\w+)/i
      ],
      [
        VENDOR,
        MODEL,
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(kin\.[onetw]{3})/i
      ],
      [
        [
          MODEL,
          /\./g,
          " "
        ],
        [
          VENDOR,
          MICROSOFT
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /droid.+; ([c6]+|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          ZEBRA
        ],
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          ZEBRA
        ],
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /smart-tv.+(samsung)/i
      ],
      [
        VENDOR,
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /hbbtv.+maple;(\d+)/i
      ],
      [
        [
          MODEL,
          /^/,
          "SmartTV"
        ],
        [
          VENDOR,
          SAMSUNG
        ],
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i
      ],
      [
        [
          VENDOR,
          LG
        ],
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /(apple) ?tv/i
      ],
      [
        VENDOR,
        [
          MODEL,
          `${APPLE} TV`
        ],
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /crkey/i
      ],
      [
        [
          MODEL,
          `${CHROME}cast`
        ],
        [
          VENDOR,
          GOOGLE
        ],
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /droid.+aft(\w)( bui|\))/i
      ],
      [
        MODEL,
        [
          VENDOR,
          AMAZON
        ],
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /\(dtv[\);].+(aquos)/i,
        /(aquos-tv[\w ]+)\)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          SHARP
        ],
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /(bravia[\w ]+)( bui|\))/i
      ],
      [
        MODEL,
        [
          VENDOR,
          SONY
        ],
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /(mitv-\w{5}) bui/i
      ],
      [
        MODEL,
        [
          VENDOR,
          XIAOMI
        ],
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /Hbbtv.*(technisat) (.*);/i
      ],
      [
        VENDOR,
        MODEL,
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i,
        /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i
      ],
      [
        [
          VENDOR,
          trim
        ],
        [
          MODEL,
          trim
        ],
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i
      ],
      [
        [
          TYPE,
          SMARTTV
        ]
      ]
    ],
    [
      [
        /(ouya)/i,
        /(nintendo) (\w+)/i
      ],
      [
        VENDOR,
        MODEL,
        [
          TYPE,
          CONSOLE
        ]
      ]
    ],
    [
      [
        /droid.+; (shield) bui/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "Nvidia"
        ],
        [
          TYPE,
          CONSOLE
        ]
      ]
    ],
    [
      [
        /(playstation \w+)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          SONY
        ],
        [
          TYPE,
          CONSOLE
        ]
      ]
    ],
    [
      [
        /\b(xbox(?: one)?(?!; xbox))[\); ]/i
      ],
      [
        MODEL,
        [
          VENDOR,
          MICROSOFT
        ],
        [
          TYPE,
          CONSOLE
        ]
      ]
    ],
    [
      [
        /((pebble))app/i
      ],
      [
        VENDOR,
        MODEL,
        [
          TYPE,
          WEARABLE
        ]
      ]
    ],
    [
      [
        /(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i
      ],
      [
        MODEL,
        [
          VENDOR,
          APPLE
        ],
        [
          TYPE,
          WEARABLE
        ]
      ]
    ],
    [
      [
        /droid.+; (glass) \d/i
      ],
      [
        MODEL,
        [
          VENDOR,
          GOOGLE
        ],
        [
          TYPE,
          WEARABLE
        ]
      ]
    ],
    [
      [
        /droid.+; (wt63?0{2,3})\)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          ZEBRA
        ],
        [
          TYPE,
          WEARABLE
        ]
      ]
    ],
    [
      [
        /(quest( 2| pro)?)/i
      ],
      [
        MODEL,
        [
          VENDOR,
          FACEBOOK
        ],
        [
          TYPE,
          WEARABLE
        ]
      ]
    ],
    [
      [
        /(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i
      ],
      [
        VENDOR,
        [
          TYPE,
          EMBEDDED
        ]
      ]
    ],
    [
      [
        /(aeobc)\b/i
      ],
      [
        MODEL,
        [
          VENDOR,
          AMAZON
        ],
        [
          TYPE,
          EMBEDDED
        ]
      ]
    ],
    [
      [
        /droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i
      ],
      [
        MODEL,
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i
      ],
      [
        MODEL,
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i
      ],
      [
        [
          TYPE,
          TABLET
        ]
      ]
    ],
    [
      [
        /(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i
      ],
      [
        [
          TYPE,
          MOBILE
        ]
      ]
    ],
    [
      [
        /(android[-\w\. ]{0,9});.+buil/i
      ],
      [
        MODEL,
        [
          VENDOR,
          "Generic"
        ]
      ]
    ]
  ],
  engine: [
    [
      [
        /windows.+ edge\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `${EDGE}HTML`
        ]
      ]
    ],
    [
      [
        /webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "Blink"
        ]
      ]
    ],
    [
      [
        /(presto)\/([\w\.]+)/i,
        /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i,
        /ekioh(flow)\/([\w\.]+)/i,
        /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,
        /(icab)[\/ ]([23]\.[\d\.]+)/i,
        /\b(libweb)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /rv\:([\w\.]{1,9})\b.+(gecko)/i
      ],
      [
        VERSION,
        NAME
      ]
    ]
  ],
  os: [
    [
      [
        /microsoft (windows) (vista|xp)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /(windows) nt 6\.2; (arm)/i,
        /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i,
        /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i
      ],
      [
        NAME,
        [
          VERSION,
          mapWinVer
        ]
      ]
    ],
    [
      [
        /(win(?=3|9|n)|win 9x )([nt\d\.]+)/i
      ],
      [
        [
          NAME,
          WINDOWS
        ],
        [
          VERSION,
          mapWinVer
        ]
      ]
    ],
    [
      [
        /ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i,
        /(?:ios;fbsv\/|iphone.+ios[\/ ])([\d\.]+)/i,
        /cfnetwork\/.+darwin/i
      ],
      [
        [
          VERSION,
          /_/g,
          "."
        ],
        [
          NAME,
          "iOS"
        ]
      ]
    ],
    [
      [
        /(mac os x) ?([\w\. ]*)/i,
        /(macintosh|mac_powerpc\b)(?!.+haiku)/i
      ],
      [
        [
          NAME,
          "macOS"
        ],
        [
          VERSION,
          /_/g,
          "."
        ]
      ]
    ],
    [
      [
        /droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i
      ],
      [
        VERSION,
        NAME
      ]
    ],
    [
      [
        /(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i,
        /(blackberry)\w*\/([\w\.]*)/i,
        /(tizen|kaios)[\/ ]([\w\.]+)/i,
        /\((series40);/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /\(bb(10);/i
      ],
      [
        VERSION,
        [
          NAME,
          BLACKBERRY
        ]
      ]
    ],
    [
      [
        /(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i
      ],
      [
        VERSION,
        [
          NAME,
          "Symbian"
        ]
      ]
    ],
    [
      [
        /mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `${FIREFOX} OS`
        ]
      ]
    ],
    [
      [
        /web0s;.+rt(tv)/i,
        /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "webOS"
        ]
      ]
    ],
    [
      [
        /watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          "watchOS"
        ]
      ]
    ],
    [
      [
        /crkey\/([\d\.]+)/i
      ],
      [
        VERSION,
        [
          NAME,
          `${CHROME}cast`
        ]
      ]
    ],
    [
      [
        /(cros) [\w]+(?:\)| ([\w\.]+)\b)/i
      ],
      [
        [
          NAME,
          "Chrome OS"
        ],
        VERSION
      ]
    ],
    [
      [
        /panasonic;(viera)/i,
        /(netrange)mmh/i,
        /(nettv)\/(\d+\.[\w\.]+)/i,
        // Console
        /(nintendo|playstation) (\w+)/i,
        /(xbox); +xbox ([^\);]+)/i,
        // Other
        /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,
        /(mint)[\/\(\) ]?(\w*)/i,
        /(mageia|vectorlinux)[; ]/i,
        /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,
        // Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware/Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus/Raspbian/Plan9/Minix/RISCOS/Contiki/Deepin/Manjaro/elementary/Sabayon/Linspire
        /(hurd|linux) ?([\w\.]*)/i,
        /(gnu) ?([\w\.]*)/i,
        /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i,
        /(haiku) (\w+)/i
      ],
      [
        NAME,
        VERSION
      ]
    ],
    [
      [
        /(sunos) ?([\w\.\d]*)/i
      ],
      [
        [
          NAME,
          "Solaris"
        ],
        VERSION
      ]
    ],
    [
      [
        /((?:open)?solaris)[-\/ ]?([\w\.]*)/i,
        /(aix) ((\d)(?=\.|\)| )[\w\.])*/i,
        /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i,
        /(unix) ?([\w\.]*)/i
      ],
      [
        NAME,
        VERSION
      ]
    ]
  ]
};
_computedKey5 = Symbol.for("Deno.customInspect"), _computedKey14 = Symbol.for("nodejs.util.inspect.custom");
var UserAgent = class {
  #browser;
  #cpu;
  #device;
  #engine;
  #os;
  #ua;
  /** A representation of user agent string, which can be used to determine
   * environmental information represented by the string. All properties are
   * determined lazily.
   *
   * ```ts
   * import { UserAgent } from "https://deno.land/std@$STD_VERSION/http/user_agent.ts";
   *
   * Deno.serve((req) => {
   *   const userAgent = new UserAgent(req.headers.get("user-agent") ?? "");
   *   return new Response(`Hello, ${userAgent.browser.name}
   *     on ${userAgent.os.name} ${userAgent.os.version}!`);
   * });
   * ```
   */
  constructor(ua) {
    this.#ua = ua ?? "";
  }
  /** The name and version of the browser extracted from the user agent
   * string. */
  get browser() {
    if (!this.#browser) {
      this.#browser = {
        name: void 0,
        version: void 0,
        major: void 0
      };
      mapper(this.#browser, this.#ua, matchers.browser);
      this.#browser.major = majorize(this.#browser.version);
      Object.freeze(this.#browser);
    }
    return this.#browser;
  }
  /** The architecture of the CPU extracted from the user agent string. */
  get cpu() {
    if (!this.#cpu) {
      this.#cpu = {
        architecture: void 0
      };
      mapper(this.#cpu, this.#ua, matchers.cpu);
      Object.freeze(this.#cpu);
    }
    return this.#cpu;
  }
  /** The model, type, and vendor of a device if present in a user agent
   * string. */
  get device() {
    if (!this.#device) {
      this.#device = {
        model: void 0,
        type: void 0,
        vendor: void 0
      };
      mapper(this.#device, this.#ua, matchers.device);
      Object.freeze(this.#device);
    }
    return this.#device;
  }
  /** The name and version of the browser engine in a user agent string. */
  get engine() {
    if (!this.#engine) {
      this.#engine = {
        name: void 0,
        version: void 0
      };
      mapper(this.#engine, this.#ua, matchers.engine);
      Object.freeze(this.#engine);
    }
    return this.#engine;
  }
  /** The name and version of the operating system in a user agent string. */
  get os() {
    if (!this.#os) {
      this.#os = {
        name: void 0,
        version: void 0
      };
      mapper(this.#os, this.#ua, matchers.os);
      Object.freeze(this.#os);
    }
    return this.#os;
  }
  /** A read only version of the user agent string related to the instance. */
  get ua() {
    return this.#ua;
  }
  toJSON() {
    const { browser, cpu, device, engine, os, ua } = this;
    return {
      browser,
      cpu,
      device,
      engine,
      os,
      ua
    };
  }
  toString() {
    return this.#ua;
  }
  [_computedKey5](inspect) {
    const { browser, cpu, device, engine, os, ua } = this;
    return `${this.constructor.name} ${inspect({
      browser,
      cpu,
      device,
      engine,
      os,
      ua
    })}`;
  }
  [_computedKey14](depth, options, inspect) {
    if (depth < 0) {
      return options.stylize(`[${this.constructor.name}]`, "special");
    }
    const newOptions = Object.assign({}, options, {
      depth: options.depth === null ? null : options.depth - 1
    });
    const { browser, cpu, device, engine, os, ua } = this;
    return `${options.stylize(this.constructor.name, "special")} ${inspect({
      browser,
      cpu,
      device,
      engine,
      os,
      ua
    }, newOptions)}`;
  }
};

// deno:https://deno.land/std@0.200.0/io/buf_reader.ts
var CR = "\r".charCodeAt(0);
var LF = "\n".charCodeAt(0);

// deno:https://deno.land/std@0.200.0/io/buffer.ts
var MIN_READ = 32 * 1024;
var MAX_SIZE = 2 ** 32 - 2;
var Buffer2 = class {
  #buf;
  #off = 0;
  constructor(ab) {
    this.#buf = ab === void 0 ? new Uint8Array(0) : new Uint8Array(ab);
  }
  /** Returns a slice holding the unread portion of the buffer.
   *
   * The slice is valid for use only until the next buffer modification (that
   * is, only until the next call to a method like `read()`, `write()`,
   * `reset()`, or `truncate()`). If `options.copy` is false the slice aliases the buffer content at
   * least until the next buffer modification, so immediate changes to the
   * slice will affect the result of future reads.
   * @param [options={ copy: true }]
   */
  bytes(options = {
    copy: true
  }) {
    if (options.copy === false) return this.#buf.subarray(this.#off);
    return this.#buf.slice(this.#off);
  }
  /** Returns whether the unread portion of the buffer is empty. */
  empty() {
    return this.#buf.byteLength <= this.#off;
  }
  /** A read only number of bytes of the unread portion of the buffer. */
  get length() {
    return this.#buf.byteLength - this.#off;
  }
  /** The read only capacity of the buffer's underlying byte slice, that is,
   * the total space allocated for the buffer's data. */
  get capacity() {
    return this.#buf.buffer.byteLength;
  }
  /** Discards all but the first `n` unread bytes from the buffer but
   * continues to use the same allocated storage. It throws if `n` is
   * negative or greater than the length of the buffer. */
  truncate(n) {
    if (n === 0) {
      this.reset();
      return;
    }
    if (n < 0 || n > this.length) {
      throw Error("bytes.Buffer: truncation out of range");
    }
    this.#reslice(this.#off + n);
  }
  reset() {
    this.#reslice(0);
    this.#off = 0;
  }
  #tryGrowByReslice(n) {
    const l = this.#buf.byteLength;
    if (n <= this.capacity - l) {
      this.#reslice(l + n);
      return l;
    }
    return -1;
  }
  #reslice(len) {
    assert(len <= this.#buf.buffer.byteLength);
    this.#buf = new Uint8Array(this.#buf.buffer, 0, len);
  }
  /** Reads the next `p.length` bytes from the buffer or until the buffer is
   * drained. Returns the number of bytes read. If the buffer has no data to
   * return, the return is EOF (`null`). */
  readSync(p) {
    if (this.empty()) {
      this.reset();
      if (p.byteLength === 0) {
        return 0;
      }
      return null;
    }
    const nread = copy(this.#buf.subarray(this.#off), p);
    this.#off += nread;
    return nread;
  }
  /** Reads the next `p.length` bytes from the buffer or until the buffer is
   * drained. Resolves to the number of bytes read. If the buffer has no
   * data to return, resolves to EOF (`null`).
   *
   * NOTE: This methods reads bytes synchronously; it's provided for
   * compatibility with `Reader` interfaces.
   */
  read(p) {
    const rr = this.readSync(p);
    return Promise.resolve(rr);
  }
  writeSync(p) {
    const m = this.#grow(p.byteLength);
    return copy(p, this.#buf, m);
  }
  /** NOTE: This methods writes bytes synchronously; it's provided for
   * compatibility with `Writer` interface. */
  write(p) {
    const n = this.writeSync(p);
    return Promise.resolve(n);
  }
  #grow(n) {
    const m = this.length;
    if (m === 0 && this.#off !== 0) {
      this.reset();
    }
    const i = this.#tryGrowByReslice(n);
    if (i >= 0) {
      return i;
    }
    const c = this.capacity;
    if (n <= Math.floor(c / 2) - m) {
      copy(this.#buf.subarray(this.#off), this.#buf);
    } else if (c + n > MAX_SIZE) {
      throw new Error("The buffer cannot be grown beyond the maximum size.");
    } else {
      const buf = new Uint8Array(Math.min(2 * c + n, MAX_SIZE));
      copy(this.#buf.subarray(this.#off), buf);
      this.#buf = buf;
    }
    this.#off = 0;
    this.#reslice(Math.min(m + n, MAX_SIZE));
    return m;
  }
  /** Grows the buffer's capacity, if necessary, to guarantee space for
   * another `n` bytes. After `.grow(n)`, at least `n` bytes can be written to
   * the buffer without another allocation. If `n` is negative, `.grow()` will
   * throw. If the buffer can't grow it will throw an error.
   *
   * Based on Go Lang's
   * [Buffer.Grow](https://golang.org/pkg/bytes/#Buffer.Grow). */
  grow(n) {
    if (n < 0) {
      throw Error("Buffer.grow: negative count");
    }
    const m = this.#grow(n);
    this.#reslice(m);
  }
  /** Reads data from `r` until EOF (`null`) and appends it to the buffer,
   * growing the buffer as needed. It resolves to the number of bytes read.
   * If the buffer becomes too large, `.readFrom()` will reject with an error.
   *
   * Based on Go Lang's
   * [Buffer.ReadFrom](https://golang.org/pkg/bytes/#Buffer.ReadFrom). */
  async readFrom(r) {
    let n = 0;
    const tmp = new Uint8Array(MIN_READ);
    while (true) {
      const shouldGrow = this.capacity - this.length < MIN_READ;
      const buf = shouldGrow ? tmp : new Uint8Array(this.#buf.buffer, this.length);
      const nread = await r.read(buf);
      if (nread === null) {
        return n;
      }
      if (shouldGrow) this.writeSync(buf.subarray(0, nread));
      else this.#reslice(this.length + nread);
      n += nread;
    }
  }
  /** Reads data from `r` until EOF (`null`) and appends it to the buffer,
   * growing the buffer as needed. It returns the number of bytes read. If the
   * buffer becomes too large, `.readFromSync()` will throw an error.
   *
   * Based on Go Lang's
   * [Buffer.ReadFrom](https://golang.org/pkg/bytes/#Buffer.ReadFrom). */
  readFromSync(r) {
    let n = 0;
    const tmp = new Uint8Array(MIN_READ);
    while (true) {
      const shouldGrow = this.capacity - this.length < MIN_READ;
      const buf = shouldGrow ? tmp : new Uint8Array(this.#buf.buffer, this.length);
      const nread = r.readSync(buf);
      if (nread === null) {
        return n;
      }
      if (shouldGrow) this.writeSync(buf.subarray(0, nread));
      else this.#reslice(this.length + nread);
      n += nread;
    }
  }
};

// deno:https://deno.land/std@0.200.0/io/copy_n.ts
var DEFAULT_BUFFER_SIZE = 32 * 1024;

// deno:https://deno.land/std@0.200.0/io/limited_reader.ts
var LimitedReader = class {
  reader;
  limit;
  constructor(reader, limit) {
    this.reader = reader;
    this.limit = limit;
  }
  async read(p) {
    if (this.limit <= 0) {
      return null;
    }
    if (p.length > this.limit) {
      p = p.subarray(0, this.limit);
    }
    const n = await this.reader.read(p);
    if (n == null) {
      return null;
    }
    this.limit -= n;
    return n;
  }
};

// deno:https://deno.land/std@0.200.0/io/read_long.ts
var MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);

// deno:https://deno.land/std@0.200.0/io/read_range.ts
var DEFAULT_BUFFER_SIZE2 = 32 * 1024;

// deno:https://deno.land/std@0.200.0/io/string_writer.ts
var decoder = new TextDecoder();

// deno:https://deno.land/std@0.200.0/media_types/_util.ts
var extensions = /* @__PURE__ */ new Map();
function consumeToken(v) {
  const notPos = indexOf(v, isNotTokenChar);
  if (notPos == -1) {
    return [
      v,
      ""
    ];
  }
  if (notPos == 0) {
    return [
      "",
      v
    ];
  }
  return [
    v.slice(0, notPos),
    v.slice(notPos)
  ];
}
function consumeValue(v) {
  if (!v) {
    return [
      "",
      v
    ];
  }
  if (v[0] !== `"`) {
    return consumeToken(v);
  }
  let value = "";
  for (let i = 1; i < v.length; i++) {
    const r = v[i];
    if (r === `"`) {
      return [
        value,
        v.slice(i + 1)
      ];
    }
    if (r === "\\" && i + 1 < v.length && isTSpecial(v[i + 1])) {
      value += v[i + 1];
      i++;
      continue;
    }
    if (r === "\r" || r === "\n") {
      return [
        "",
        v
      ];
    }
    value += v[i];
  }
  return [
    "",
    v
  ];
}
function consumeMediaParam(v) {
  let rest = v.trimStart();
  if (!rest.startsWith(";")) {
    return [
      "",
      "",
      v
    ];
  }
  rest = rest.slice(1);
  rest = rest.trimStart();
  let param;
  [param, rest] = consumeToken(rest);
  param = param.toLowerCase();
  if (!param) {
    return [
      "",
      "",
      v
    ];
  }
  rest = rest.slice(1);
  rest = rest.trimStart();
  const [value, rest2] = consumeValue(rest);
  if (value == "" && rest2 === rest) {
    return [
      "",
      "",
      v
    ];
  }
  rest = rest2;
  return [
    param,
    value,
    rest
  ];
}
function decode2331Encoding(v) {
  const sv = v.split(`'`, 3);
  if (sv.length !== 3) {
    return void 0;
  }
  const charset = sv[0].toLowerCase();
  if (!charset) {
    return void 0;
  }
  if (charset != "us-ascii" && charset != "utf-8") {
    return void 0;
  }
  const encv = decodeURI(sv[2]);
  if (!encv) {
    return void 0;
  }
  return encv;
}
function indexOf(s, fn) {
  let i = -1;
  for (const v of s) {
    i++;
    if (fn(v)) {
      return i;
    }
  }
  return -1;
}
function isIterator(obj) {
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === "function";
}
function isToken(s) {
  if (!s) {
    return false;
  }
  return indexOf(s, isNotTokenChar) < 0;
}
function isNotTokenChar(r) {
  return !isTokenChar(r);
}
function isTokenChar(r) {
  const code = r.charCodeAt(0);
  return code > 32 && code < 127 && !isTSpecial(r);
}
function isTSpecial(r) {
  return `()<>@,;:\\"/[]?=`.includes(r[0]);
}
var CHAR_CODE_SPACE = " ".charCodeAt(0);
var CHAR_CODE_TILDE = "~".charCodeAt(0);
function needsEncoding(s) {
  for (const b of s) {
    const charCode = b.charCodeAt(0);
    if ((charCode < CHAR_CODE_SPACE || charCode > CHAR_CODE_TILDE) && b !== "	") {
      return true;
    }
  }
  return false;
}

// deno:https://deno.land/std@0.200.0/media_types/parse_media_type.ts
function parseMediaType2(v) {
  const [base] = v.split(";");
  const mediaType = base.toLowerCase().trim();
  const params = {};
  const continuation = /* @__PURE__ */ new Map();
  v = v.slice(base.length);
  while (v.length) {
    v = v.trimStart();
    if (v.length === 0) {
      break;
    }
    const [key, value, rest] = consumeMediaParam(v);
    if (!key) {
      if (rest.trim() === ";") {
        break;
      }
      throw new TypeError("Invalid media parameter.");
    }
    let pmap = params;
    const [baseName, rest2] = key.split("*");
    if (baseName && rest2 != null) {
      if (!continuation.has(baseName)) {
        continuation.set(baseName, {});
      }
      pmap = continuation.get(baseName);
    }
    if (key in pmap) {
      throw new TypeError("Duplicate key parsed.");
    }
    pmap[key] = value;
    v = rest;
  }
  let str = "";
  for (const [key, pieceMap] of continuation) {
    const singlePartKey = `${key}*`;
    const v2 = pieceMap[singlePartKey];
    if (v2) {
      const decv = decode2331Encoding(v2);
      if (decv) {
        params[key] = decv;
      }
      continue;
    }
    str = "";
    let valid = false;
    for (let n = 0; ; n++) {
      const simplePart = `${key}*${n}`;
      let v3 = pieceMap[simplePart];
      if (v3) {
        valid = true;
        str += v3;
        continue;
      }
      const encodedPart = `${simplePart}*`;
      v3 = pieceMap[encodedPart];
      if (!v3) {
        break;
      }
      valid = true;
      if (n === 0) {
        const decv = decode2331Encoding(v3);
        if (decv) {
          str += decv;
        }
      } else {
        const decv = decodeURI(v3);
        str += decv;
      }
    }
    if (valid) {
      params[key] = str;
    }
  }
  return Object.keys(params).length ? [
    mediaType,
    params
  ] : [
    mediaType,
    void 0
  ];
}

// deno:https://deno.land/std@0.200.0/media_types/vendor/mime-db.v1.52.0.ts
var mime_db_v1_52_0_default = {
  "application/1d-interleaved-parityfec": {
    "source": "iana"
  },
  "application/3gpdash-qoe-report+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/3gpp-ims+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/3gpphal+json": {
    "source": "iana",
    "compressible": true
  },
  "application/3gpphalforms+json": {
    "source": "iana",
    "compressible": true
  },
  "application/a2l": {
    "source": "iana"
  },
  "application/ace+cbor": {
    "source": "iana"
  },
  "application/activemessage": {
    "source": "iana"
  },
  "application/activity+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-costmap+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-costmapfilter+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-directory+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-endpointcost+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-endpointcostparams+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-endpointprop+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-endpointpropparams+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-error+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-networkmap+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-networkmapfilter+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-updatestreamcontrol+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-updatestreamparams+json": {
    "source": "iana",
    "compressible": true
  },
  "application/aml": {
    "source": "iana"
  },
  "application/andrew-inset": {
    "source": "iana",
    "extensions": [
      "ez"
    ]
  },
  "application/applefile": {
    "source": "iana"
  },
  "application/applixware": {
    "source": "apache",
    "extensions": [
      "aw"
    ]
  },
  "application/at+jwt": {
    "source": "iana"
  },
  "application/atf": {
    "source": "iana"
  },
  "application/atfx": {
    "source": "iana"
  },
  "application/atom+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "atom"
    ]
  },
  "application/atomcat+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "atomcat"
    ]
  },
  "application/atomdeleted+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "atomdeleted"
    ]
  },
  "application/atomicmail": {
    "source": "iana"
  },
  "application/atomsvc+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "atomsvc"
    ]
  },
  "application/atsc-dwd+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "dwd"
    ]
  },
  "application/atsc-dynamic-event-message": {
    "source": "iana"
  },
  "application/atsc-held+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "held"
    ]
  },
  "application/atsc-rdt+json": {
    "source": "iana",
    "compressible": true
  },
  "application/atsc-rsat+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "rsat"
    ]
  },
  "application/atxml": {
    "source": "iana"
  },
  "application/auth-policy+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/bacnet-xdd+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/batch-smtp": {
    "source": "iana"
  },
  "application/bdoc": {
    "compressible": false,
    "extensions": [
      "bdoc"
    ]
  },
  "application/beep+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/calendar+json": {
    "source": "iana",
    "compressible": true
  },
  "application/calendar+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "xcs"
    ]
  },
  "application/call-completion": {
    "source": "iana"
  },
  "application/cals-1840": {
    "source": "iana"
  },
  "application/captive+json": {
    "source": "iana",
    "compressible": true
  },
  "application/cbor": {
    "source": "iana"
  },
  "application/cbor-seq": {
    "source": "iana"
  },
  "application/cccex": {
    "source": "iana"
  },
  "application/ccmp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/ccxml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "ccxml"
    ]
  },
  "application/cdfx+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "cdfx"
    ]
  },
  "application/cdmi-capability": {
    "source": "iana",
    "extensions": [
      "cdmia"
    ]
  },
  "application/cdmi-container": {
    "source": "iana",
    "extensions": [
      "cdmic"
    ]
  },
  "application/cdmi-domain": {
    "source": "iana",
    "extensions": [
      "cdmid"
    ]
  },
  "application/cdmi-object": {
    "source": "iana",
    "extensions": [
      "cdmio"
    ]
  },
  "application/cdmi-queue": {
    "source": "iana",
    "extensions": [
      "cdmiq"
    ]
  },
  "application/cdni": {
    "source": "iana"
  },
  "application/cea": {
    "source": "iana"
  },
  "application/cea-2018+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/cellml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/cfw": {
    "source": "iana"
  },
  "application/city+json": {
    "source": "iana",
    "compressible": true
  },
  "application/clr": {
    "source": "iana"
  },
  "application/clue+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/clue_info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/cms": {
    "source": "iana"
  },
  "application/cnrp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/coap-group+json": {
    "source": "iana",
    "compressible": true
  },
  "application/coap-payload": {
    "source": "iana"
  },
  "application/commonground": {
    "source": "iana"
  },
  "application/conference-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/cose": {
    "source": "iana"
  },
  "application/cose-key": {
    "source": "iana"
  },
  "application/cose-key-set": {
    "source": "iana"
  },
  "application/cpl+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "cpl"
    ]
  },
  "application/csrattrs": {
    "source": "iana"
  },
  "application/csta+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/cstadata+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/csvm+json": {
    "source": "iana",
    "compressible": true
  },
  "application/cu-seeme": {
    "source": "apache",
    "extensions": [
      "cu"
    ]
  },
  "application/cwt": {
    "source": "iana"
  },
  "application/cybercash": {
    "source": "iana"
  },
  "application/dart": {
    "compressible": true
  },
  "application/dash+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "mpd"
    ]
  },
  "application/dash-patch+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "mpp"
    ]
  },
  "application/dashdelta": {
    "source": "iana"
  },
  "application/davmount+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "davmount"
    ]
  },
  "application/dca-rft": {
    "source": "iana"
  },
  "application/dcd": {
    "source": "iana"
  },
  "application/dec-dx": {
    "source": "iana"
  },
  "application/dialog-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/dicom": {
    "source": "iana"
  },
  "application/dicom+json": {
    "source": "iana",
    "compressible": true
  },
  "application/dicom+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/dii": {
    "source": "iana"
  },
  "application/dit": {
    "source": "iana"
  },
  "application/dns": {
    "source": "iana"
  },
  "application/dns+json": {
    "source": "iana",
    "compressible": true
  },
  "application/dns-message": {
    "source": "iana"
  },
  "application/docbook+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": [
      "dbk"
    ]
  },
  "application/dots+cbor": {
    "source": "iana"
  },
  "application/dskpp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/dssc+der": {
    "source": "iana",
    "extensions": [
      "dssc"
    ]
  },
  "application/dssc+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "xdssc"
    ]
  },
  "application/dvcs": {
    "source": "iana"
  },
  "application/ecmascript": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "es",
      "ecma"
    ]
  },
  "application/edi-consent": {
    "source": "iana"
  },
  "application/edi-x12": {
    "source": "iana",
    "compressible": false
  },
  "application/edifact": {
    "source": "iana",
    "compressible": false
  },
  "application/efi": {
    "source": "iana"
  },
  "application/elm+json": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/elm+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.cap+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/emergencycalldata.comment+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.control+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.deviceinfo+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.ecall.msd": {
    "source": "iana"
  },
  "application/emergencycalldata.providerinfo+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.serviceinfo+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.subscriberinfo+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.veds+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emma+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "emma"
    ]
  },
  "application/emotionml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "emotionml"
    ]
  },
  "application/encaprtp": {
    "source": "iana"
  },
  "application/epp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/epub+zip": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "epub"
    ]
  },
  "application/eshop": {
    "source": "iana"
  },
  "application/exi": {
    "source": "iana",
    "extensions": [
      "exi"
    ]
  },
  "application/expect-ct-report+json": {
    "source": "iana",
    "compressible": true
  },
  "application/express": {
    "source": "iana",
    "extensions": [
      "exp"
    ]
  },
  "application/fastinfoset": {
    "source": "iana"
  },
  "application/fastsoap": {
    "source": "iana"
  },
  "application/fdt+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "fdt"
    ]
  },
  "application/fhir+json": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/fhir+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/fido.trusted-apps+json": {
    "compressible": true
  },
  "application/fits": {
    "source": "iana"
  },
  "application/flexfec": {
    "source": "iana"
  },
  "application/font-sfnt": {
    "source": "iana"
  },
  "application/font-tdpfr": {
    "source": "iana",
    "extensions": [
      "pfr"
    ]
  },
  "application/font-woff": {
    "source": "iana",
    "compressible": false
  },
  "application/framework-attributes+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/geo+json": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "geojson"
    ]
  },
  "application/geo+json-seq": {
    "source": "iana"
  },
  "application/geopackage+sqlite3": {
    "source": "iana"
  },
  "application/geoxacml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/gltf-buffer": {
    "source": "iana"
  },
  "application/gml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "gml"
    ]
  },
  "application/gpx+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": [
      "gpx"
    ]
  },
  "application/gxf": {
    "source": "apache",
    "extensions": [
      "gxf"
    ]
  },
  "application/gzip": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "gz"
    ]
  },
  "application/h224": {
    "source": "iana"
  },
  "application/held+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/hjson": {
    "extensions": [
      "hjson"
    ]
  },
  "application/http": {
    "source": "iana"
  },
  "application/hyperstudio": {
    "source": "iana",
    "extensions": [
      "stk"
    ]
  },
  "application/ibe-key-request+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/ibe-pkg-reply+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/ibe-pp-data": {
    "source": "iana"
  },
  "application/iges": {
    "source": "iana"
  },
  "application/im-iscomposing+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/index": {
    "source": "iana"
  },
  "application/index.cmd": {
    "source": "iana"
  },
  "application/index.obj": {
    "source": "iana"
  },
  "application/index.response": {
    "source": "iana"
  },
  "application/index.vnd": {
    "source": "iana"
  },
  "application/inkml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "ink",
      "inkml"
    ]
  },
  "application/iotp": {
    "source": "iana"
  },
  "application/ipfix": {
    "source": "iana",
    "extensions": [
      "ipfix"
    ]
  },
  "application/ipp": {
    "source": "iana"
  },
  "application/isup": {
    "source": "iana"
  },
  "application/its+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "its"
    ]
  },
  "application/java-archive": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "jar",
      "war",
      "ear"
    ]
  },
  "application/java-serialized-object": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "ser"
    ]
  },
  "application/java-vm": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "class"
    ]
  },
  "application/javascript": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": [
      "js",
      "mjs"
    ]
  },
  "application/jf2feed+json": {
    "source": "iana",
    "compressible": true
  },
  "application/jose": {
    "source": "iana"
  },
  "application/jose+json": {
    "source": "iana",
    "compressible": true
  },
  "application/jrd+json": {
    "source": "iana",
    "compressible": true
  },
  "application/jscalendar+json": {
    "source": "iana",
    "compressible": true
  },
  "application/json": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": [
      "json",
      "map"
    ]
  },
  "application/json-patch+json": {
    "source": "iana",
    "compressible": true
  },
  "application/json-seq": {
    "source": "iana"
  },
  "application/json5": {
    "extensions": [
      "json5"
    ]
  },
  "application/jsonml+json": {
    "source": "apache",
    "compressible": true,
    "extensions": [
      "jsonml"
    ]
  },
  "application/jwk+json": {
    "source": "iana",
    "compressible": true
  },
  "application/jwk-set+json": {
    "source": "iana",
    "compressible": true
  },
  "application/jwt": {
    "source": "iana"
  },
  "application/kpml-request+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/kpml-response+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/ld+json": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "jsonld"
    ]
  },
  "application/lgr+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "lgr"
    ]
  },
  "application/link-format": {
    "source": "iana"
  },
  "application/load-control+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/lost+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "lostxml"
    ]
  },
  "application/lostsync+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/lpf+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/lxf": {
    "source": "iana"
  },
  "application/mac-binhex40": {
    "source": "iana",
    "extensions": [
      "hqx"
    ]
  },
  "application/mac-compactpro": {
    "source": "apache",
    "extensions": [
      "cpt"
    ]
  },
  "application/macwriteii": {
    "source": "iana"
  },
  "application/mads+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "mads"
    ]
  },
  "application/manifest+json": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": [
      "webmanifest"
    ]
  },
  "application/marc": {
    "source": "iana",
    "extensions": [
      "mrc"
    ]
  },
  "application/marcxml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "mrcx"
    ]
  },
  "application/mathematica": {
    "source": "iana",
    "extensions": [
      "ma",
      "nb",
      "mb"
    ]
  },
  "application/mathml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "mathml"
    ]
  },
  "application/mathml-content+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mathml-presentation+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-associated-procedure-description+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-deregister+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-envelope+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-msk+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-msk-response+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-protection-description+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-reception-report+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-register+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-register-response+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-schedule+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-user-service-description+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbox": {
    "source": "iana",
    "extensions": [
      "mbox"
    ]
  },
  "application/media-policy-dataset+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "mpf"
    ]
  },
  "application/media_control+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mediaservercontrol+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "mscml"
    ]
  },
  "application/merge-patch+json": {
    "source": "iana",
    "compressible": true
  },
  "application/metalink+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": [
      "metalink"
    ]
  },
  "application/metalink4+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "meta4"
    ]
  },
  "application/mets+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "mets"
    ]
  },
  "application/mf4": {
    "source": "iana"
  },
  "application/mikey": {
    "source": "iana"
  },
  "application/mipc": {
    "source": "iana"
  },
  "application/missing-blocks+cbor-seq": {
    "source": "iana"
  },
  "application/mmt-aei+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "maei"
    ]
  },
  "application/mmt-usd+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "musd"
    ]
  },
  "application/mods+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "mods"
    ]
  },
  "application/moss-keys": {
    "source": "iana"
  },
  "application/moss-signature": {
    "source": "iana"
  },
  "application/mosskey-data": {
    "source": "iana"
  },
  "application/mosskey-request": {
    "source": "iana"
  },
  "application/mp21": {
    "source": "iana",
    "extensions": [
      "m21",
      "mp21"
    ]
  },
  "application/mp4": {
    "source": "iana",
    "extensions": [
      "mp4s",
      "m4p"
    ]
  },
  "application/mpeg4-generic": {
    "source": "iana"
  },
  "application/mpeg4-iod": {
    "source": "iana"
  },
  "application/mpeg4-iod-xmt": {
    "source": "iana"
  },
  "application/mrb-consumer+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mrb-publish+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/msc-ivr+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/msc-mixer+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/msword": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "doc",
      "dot"
    ]
  },
  "application/mud+json": {
    "source": "iana",
    "compressible": true
  },
  "application/multipart-core": {
    "source": "iana"
  },
  "application/mxf": {
    "source": "iana",
    "extensions": [
      "mxf"
    ]
  },
  "application/n-quads": {
    "source": "iana",
    "extensions": [
      "nq"
    ]
  },
  "application/n-triples": {
    "source": "iana",
    "extensions": [
      "nt"
    ]
  },
  "application/nasdata": {
    "source": "iana"
  },
  "application/news-checkgroups": {
    "source": "iana",
    "charset": "US-ASCII"
  },
  "application/news-groupinfo": {
    "source": "iana",
    "charset": "US-ASCII"
  },
  "application/news-transmission": {
    "source": "iana"
  },
  "application/nlsml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/node": {
    "source": "iana",
    "extensions": [
      "cjs"
    ]
  },
  "application/nss": {
    "source": "iana"
  },
  "application/oauth-authz-req+jwt": {
    "source": "iana"
  },
  "application/oblivious-dns-message": {
    "source": "iana"
  },
  "application/ocsp-request": {
    "source": "iana"
  },
  "application/ocsp-response": {
    "source": "iana"
  },
  "application/octet-stream": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "bin",
      "dms",
      "lrf",
      "mar",
      "so",
      "dist",
      "distz",
      "pkg",
      "bpk",
      "dump",
      "elc",
      "deploy",
      "exe",
      "dll",
      "deb",
      "dmg",
      "iso",
      "img",
      "msi",
      "msp",
      "msm",
      "buffer"
    ]
  },
  "application/oda": {
    "source": "iana",
    "extensions": [
      "oda"
    ]
  },
  "application/odm+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/odx": {
    "source": "iana"
  },
  "application/oebps-package+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "opf"
    ]
  },
  "application/ogg": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "ogx"
    ]
  },
  "application/omdoc+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": [
      "omdoc"
    ]
  },
  "application/onenote": {
    "source": "apache",
    "extensions": [
      "onetoc",
      "onetoc2",
      "onetmp",
      "onepkg"
    ]
  },
  "application/opc-nodeset+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/oscore": {
    "source": "iana"
  },
  "application/oxps": {
    "source": "iana",
    "extensions": [
      "oxps"
    ]
  },
  "application/p21": {
    "source": "iana"
  },
  "application/p21+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/p2p-overlay+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "relo"
    ]
  },
  "application/parityfec": {
    "source": "iana"
  },
  "application/passport": {
    "source": "iana"
  },
  "application/patch-ops-error+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "xer"
    ]
  },
  "application/pdf": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "pdf"
    ]
  },
  "application/pdx": {
    "source": "iana"
  },
  "application/pem-certificate-chain": {
    "source": "iana"
  },
  "application/pgp-encrypted": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "pgp"
    ]
  },
  "application/pgp-keys": {
    "source": "iana",
    "extensions": [
      "asc"
    ]
  },
  "application/pgp-signature": {
    "source": "iana",
    "extensions": [
      "asc",
      "sig"
    ]
  },
  "application/pics-rules": {
    "source": "apache",
    "extensions": [
      "prf"
    ]
  },
  "application/pidf+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/pidf-diff+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/pkcs10": {
    "source": "iana",
    "extensions": [
      "p10"
    ]
  },
  "application/pkcs12": {
    "source": "iana"
  },
  "application/pkcs7-mime": {
    "source": "iana",
    "extensions": [
      "p7m",
      "p7c"
    ]
  },
  "application/pkcs7-signature": {
    "source": "iana",
    "extensions": [
      "p7s"
    ]
  },
  "application/pkcs8": {
    "source": "iana",
    "extensions": [
      "p8"
    ]
  },
  "application/pkcs8-encrypted": {
    "source": "iana"
  },
  "application/pkix-attr-cert": {
    "source": "iana",
    "extensions": [
      "ac"
    ]
  },
  "application/pkix-cert": {
    "source": "iana",
    "extensions": [
      "cer"
    ]
  },
  "application/pkix-crl": {
    "source": "iana",
    "extensions": [
      "crl"
    ]
  },
  "application/pkix-pkipath": {
    "source": "iana",
    "extensions": [
      "pkipath"
    ]
  },
  "application/pkixcmp": {
    "source": "iana",
    "extensions": [
      "pki"
    ]
  },
  "application/pls+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "pls"
    ]
  },
  "application/poc-settings+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/postscript": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "ai",
      "eps",
      "ps"
    ]
  },
  "application/ppsp-tracker+json": {
    "source": "iana",
    "compressible": true
  },
  "application/problem+json": {
    "source": "iana",
    "compressible": true
  },
  "application/problem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/provenance+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "provx"
    ]
  },
  "application/prs.alvestrand.titrax-sheet": {
    "source": "iana"
  },
  "application/prs.cww": {
    "source": "iana",
    "extensions": [
      "cww"
    ]
  },
  "application/prs.cyn": {
    "source": "iana",
    "charset": "7-BIT"
  },
  "application/prs.hpub+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/prs.nprend": {
    "source": "iana"
  },
  "application/prs.plucker": {
    "source": "iana"
  },
  "application/prs.rdf-xml-crypt": {
    "source": "iana"
  },
  "application/prs.xsf+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/pskc+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "pskcxml"
    ]
  },
  "application/pvd+json": {
    "source": "iana",
    "compressible": true
  },
  "application/qsig": {
    "source": "iana"
  },
  "application/raml+yaml": {
    "compressible": true,
    "extensions": [
      "raml"
    ]
  },
  "application/raptorfec": {
    "source": "iana"
  },
  "application/rdap+json": {
    "source": "iana",
    "compressible": true
  },
  "application/rdf+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "rdf",
      "owl"
    ]
  },
  "application/reginfo+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "rif"
    ]
  },
  "application/relax-ng-compact-syntax": {
    "source": "iana",
    "extensions": [
      "rnc"
    ]
  },
  "application/remote-printing": {
    "source": "iana"
  },
  "application/reputon+json": {
    "source": "iana",
    "compressible": true
  },
  "application/resource-lists+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "rl"
    ]
  },
  "application/resource-lists-diff+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "rld"
    ]
  },
  "application/rfc+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/riscos": {
    "source": "iana"
  },
  "application/rlmi+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/rls-services+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "rs"
    ]
  },
  "application/route-apd+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "rapd"
    ]
  },
  "application/route-s-tsid+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "sls"
    ]
  },
  "application/route-usd+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "rusd"
    ]
  },
  "application/rpki-ghostbusters": {
    "source": "iana",
    "extensions": [
      "gbr"
    ]
  },
  "application/rpki-manifest": {
    "source": "iana",
    "extensions": [
      "mft"
    ]
  },
  "application/rpki-publication": {
    "source": "iana"
  },
  "application/rpki-roa": {
    "source": "iana",
    "extensions": [
      "roa"
    ]
  },
  "application/rpki-updown": {
    "source": "iana"
  },
  "application/rsd+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": [
      "rsd"
    ]
  },
  "application/rss+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": [
      "rss"
    ]
  },
  "application/rtf": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "rtf"
    ]
  },
  "application/rtploopback": {
    "source": "iana"
  },
  "application/rtx": {
    "source": "iana"
  },
  "application/samlassertion+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/samlmetadata+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/sarif+json": {
    "source": "iana",
    "compressible": true
  },
  "application/sarif-external-properties+json": {
    "source": "iana",
    "compressible": true
  },
  "application/sbe": {
    "source": "iana"
  },
  "application/sbml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "sbml"
    ]
  },
  "application/scaip+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/scim+json": {
    "source": "iana",
    "compressible": true
  },
  "application/scvp-cv-request": {
    "source": "iana",
    "extensions": [
      "scq"
    ]
  },
  "application/scvp-cv-response": {
    "source": "iana",
    "extensions": [
      "scs"
    ]
  },
  "application/scvp-vp-request": {
    "source": "iana",
    "extensions": [
      "spq"
    ]
  },
  "application/scvp-vp-response": {
    "source": "iana",
    "extensions": [
      "spp"
    ]
  },
  "application/sdp": {
    "source": "iana",
    "extensions": [
      "sdp"
    ]
  },
  "application/secevent+jwt": {
    "source": "iana"
  },
  "application/senml+cbor": {
    "source": "iana"
  },
  "application/senml+json": {
    "source": "iana",
    "compressible": true
  },
  "application/senml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "senmlx"
    ]
  },
  "application/senml-etch+cbor": {
    "source": "iana"
  },
  "application/senml-etch+json": {
    "source": "iana",
    "compressible": true
  },
  "application/senml-exi": {
    "source": "iana"
  },
  "application/sensml+cbor": {
    "source": "iana"
  },
  "application/sensml+json": {
    "source": "iana",
    "compressible": true
  },
  "application/sensml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "sensmlx"
    ]
  },
  "application/sensml-exi": {
    "source": "iana"
  },
  "application/sep+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/sep-exi": {
    "source": "iana"
  },
  "application/session-info": {
    "source": "iana"
  },
  "application/set-payment": {
    "source": "iana"
  },
  "application/set-payment-initiation": {
    "source": "iana",
    "extensions": [
      "setpay"
    ]
  },
  "application/set-registration": {
    "source": "iana"
  },
  "application/set-registration-initiation": {
    "source": "iana",
    "extensions": [
      "setreg"
    ]
  },
  "application/sgml": {
    "source": "iana"
  },
  "application/sgml-open-catalog": {
    "source": "iana"
  },
  "application/shf+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "shf"
    ]
  },
  "application/sieve": {
    "source": "iana",
    "extensions": [
      "siv",
      "sieve"
    ]
  },
  "application/simple-filter+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/simple-message-summary": {
    "source": "iana"
  },
  "application/simplesymbolcontainer": {
    "source": "iana"
  },
  "application/sipc": {
    "source": "iana"
  },
  "application/slate": {
    "source": "iana"
  },
  "application/smil": {
    "source": "iana"
  },
  "application/smil+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "smi",
      "smil"
    ]
  },
  "application/smpte336m": {
    "source": "iana"
  },
  "application/soap+fastinfoset": {
    "source": "iana"
  },
  "application/soap+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/sparql-query": {
    "source": "iana",
    "extensions": [
      "rq"
    ]
  },
  "application/sparql-results+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "srx"
    ]
  },
  "application/spdx+json": {
    "source": "iana",
    "compressible": true
  },
  "application/spirits-event+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/sql": {
    "source": "iana"
  },
  "application/srgs": {
    "source": "iana",
    "extensions": [
      "gram"
    ]
  },
  "application/srgs+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "grxml"
    ]
  },
  "application/sru+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "sru"
    ]
  },
  "application/ssdl+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": [
      "ssdl"
    ]
  },
  "application/ssml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "ssml"
    ]
  },
  "application/stix+json": {
    "source": "iana",
    "compressible": true
  },
  "application/swid+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "swidtag"
    ]
  },
  "application/tamp-apex-update": {
    "source": "iana"
  },
  "application/tamp-apex-update-confirm": {
    "source": "iana"
  },
  "application/tamp-community-update": {
    "source": "iana"
  },
  "application/tamp-community-update-confirm": {
    "source": "iana"
  },
  "application/tamp-error": {
    "source": "iana"
  },
  "application/tamp-sequence-adjust": {
    "source": "iana"
  },
  "application/tamp-sequence-adjust-confirm": {
    "source": "iana"
  },
  "application/tamp-status-query": {
    "source": "iana"
  },
  "application/tamp-status-response": {
    "source": "iana"
  },
  "application/tamp-update": {
    "source": "iana"
  },
  "application/tamp-update-confirm": {
    "source": "iana"
  },
  "application/tar": {
    "compressible": true
  },
  "application/taxii+json": {
    "source": "iana",
    "compressible": true
  },
  "application/td+json": {
    "source": "iana",
    "compressible": true
  },
  "application/tei+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "tei",
      "teicorpus"
    ]
  },
  "application/tetra_isi": {
    "source": "iana"
  },
  "application/thraud+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "tfi"
    ]
  },
  "application/timestamp-query": {
    "source": "iana"
  },
  "application/timestamp-reply": {
    "source": "iana"
  },
  "application/timestamped-data": {
    "source": "iana",
    "extensions": [
      "tsd"
    ]
  },
  "application/tlsrpt+gzip": {
    "source": "iana"
  },
  "application/tlsrpt+json": {
    "source": "iana",
    "compressible": true
  },
  "application/tnauthlist": {
    "source": "iana"
  },
  "application/token-introspection+jwt": {
    "source": "iana"
  },
  "application/toml": {
    "compressible": true,
    "extensions": [
      "toml"
    ]
  },
  "application/trickle-ice-sdpfrag": {
    "source": "iana"
  },
  "application/trig": {
    "source": "iana",
    "extensions": [
      "trig"
    ]
  },
  "application/ttml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "ttml"
    ]
  },
  "application/tve-trigger": {
    "source": "iana"
  },
  "application/tzif": {
    "source": "iana"
  },
  "application/tzif-leap": {
    "source": "iana"
  },
  "application/ubjson": {
    "compressible": false,
    "extensions": [
      "ubj"
    ]
  },
  "application/ulpfec": {
    "source": "iana"
  },
  "application/urc-grpsheet+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/urc-ressheet+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "rsheet"
    ]
  },
  "application/urc-targetdesc+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "td"
    ]
  },
  "application/urc-uisocketdesc+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vcard+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vcard+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vemmi": {
    "source": "iana"
  },
  "application/vividence.scriptfile": {
    "source": "apache"
  },
  "application/vnd.1000minds.decision-model+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "1km"
    ]
  },
  "application/vnd.3gpp-prose+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp-prose-pc3ch+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp-v2x-local-service-information": {
    "source": "iana"
  },
  "application/vnd.3gpp.5gnas": {
    "source": "iana"
  },
  "application/vnd.3gpp.access-transfer-events+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.bsf+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.gmop+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.gtpc": {
    "source": "iana"
  },
  "application/vnd.3gpp.interworking-data": {
    "source": "iana"
  },
  "application/vnd.3gpp.lpp": {
    "source": "iana"
  },
  "application/vnd.3gpp.mc-signalling-ear": {
    "source": "iana"
  },
  "application/vnd.3gpp.mcdata-affiliation-command+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcdata-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcdata-payload": {
    "source": "iana"
  },
  "application/vnd.3gpp.mcdata-service-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcdata-signalling": {
    "source": "iana"
  },
  "application/vnd.3gpp.mcdata-ue-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcdata-user-profile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-affiliation-command+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-floor-request+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-location-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-service-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-signed+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-ue-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-ue-init-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-user-profile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-affiliation-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-location-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-service-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-transmission-request+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-ue-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-user-profile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mid-call+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.ngap": {
    "source": "iana"
  },
  "application/vnd.3gpp.pfcp": {
    "source": "iana"
  },
  "application/vnd.3gpp.pic-bw-large": {
    "source": "iana",
    "extensions": [
      "plb"
    ]
  },
  "application/vnd.3gpp.pic-bw-small": {
    "source": "iana",
    "extensions": [
      "psb"
    ]
  },
  "application/vnd.3gpp.pic-bw-var": {
    "source": "iana",
    "extensions": [
      "pvb"
    ]
  },
  "application/vnd.3gpp.s1ap": {
    "source": "iana"
  },
  "application/vnd.3gpp.sms": {
    "source": "iana"
  },
  "application/vnd.3gpp.sms+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.srvcc-ext+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.srvcc-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.state-and-event-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.ussd+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp2.bcmcsinfo+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp2.sms": {
    "source": "iana"
  },
  "application/vnd.3gpp2.tcap": {
    "source": "iana",
    "extensions": [
      "tcap"
    ]
  },
  "application/vnd.3lightssoftware.imagescal": {
    "source": "iana"
  },
  "application/vnd.3m.post-it-notes": {
    "source": "iana",
    "extensions": [
      "pwn"
    ]
  },
  "application/vnd.accpac.simply.aso": {
    "source": "iana",
    "extensions": [
      "aso"
    ]
  },
  "application/vnd.accpac.simply.imp": {
    "source": "iana",
    "extensions": [
      "imp"
    ]
  },
  "application/vnd.acucobol": {
    "source": "iana",
    "extensions": [
      "acu"
    ]
  },
  "application/vnd.acucorp": {
    "source": "iana",
    "extensions": [
      "atc",
      "acutc"
    ]
  },
  "application/vnd.adobe.air-application-installer-package+zip": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "air"
    ]
  },
  "application/vnd.adobe.flash.movie": {
    "source": "iana"
  },
  "application/vnd.adobe.formscentral.fcdt": {
    "source": "iana",
    "extensions": [
      "fcdt"
    ]
  },
  "application/vnd.adobe.fxp": {
    "source": "iana",
    "extensions": [
      "fxp",
      "fxpl"
    ]
  },
  "application/vnd.adobe.partial-upload": {
    "source": "iana"
  },
  "application/vnd.adobe.xdp+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "xdp"
    ]
  },
  "application/vnd.adobe.xfdf": {
    "source": "iana",
    "extensions": [
      "xfdf"
    ]
  },
  "application/vnd.aether.imp": {
    "source": "iana"
  },
  "application/vnd.afpc.afplinedata": {
    "source": "iana"
  },
  "application/vnd.afpc.afplinedata-pagedef": {
    "source": "iana"
  },
  "application/vnd.afpc.cmoca-cmresource": {
    "source": "iana"
  },
  "application/vnd.afpc.foca-charset": {
    "source": "iana"
  },
  "application/vnd.afpc.foca-codedfont": {
    "source": "iana"
  },
  "application/vnd.afpc.foca-codepage": {
    "source": "iana"
  },
  "application/vnd.afpc.modca": {
    "source": "iana"
  },
  "application/vnd.afpc.modca-cmtable": {
    "source": "iana"
  },
  "application/vnd.afpc.modca-formdef": {
    "source": "iana"
  },
  "application/vnd.afpc.modca-mediummap": {
    "source": "iana"
  },
  "application/vnd.afpc.modca-objectcontainer": {
    "source": "iana"
  },
  "application/vnd.afpc.modca-overlay": {
    "source": "iana"
  },
  "application/vnd.afpc.modca-pagesegment": {
    "source": "iana"
  },
  "application/vnd.age": {
    "source": "iana",
    "extensions": [
      "age"
    ]
  },
  "application/vnd.ah-barcode": {
    "source": "iana"
  },
  "application/vnd.ahead.space": {
    "source": "iana",
    "extensions": [
      "ahead"
    ]
  },
  "application/vnd.airzip.filesecure.azf": {
    "source": "iana",
    "extensions": [
      "azf"
    ]
  },
  "application/vnd.airzip.filesecure.azs": {
    "source": "iana",
    "extensions": [
      "azs"
    ]
  },
  "application/vnd.amadeus+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.amazon.ebook": {
    "source": "apache",
    "extensions": [
      "azw"
    ]
  },
  "application/vnd.amazon.mobi8-ebook": {
    "source": "iana"
  },
  "application/vnd.americandynamics.acc": {
    "source": "iana",
    "extensions": [
      "acc"
    ]
  },
  "application/vnd.amiga.ami": {
    "source": "iana",
    "extensions": [
      "ami"
    ]
  },
  "application/vnd.amundsen.maze+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.android.ota": {
    "source": "iana"
  },
  "application/vnd.android.package-archive": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "apk"
    ]
  },
  "application/vnd.anki": {
    "source": "iana"
  },
  "application/vnd.anser-web-certificate-issue-initiation": {
    "source": "iana",
    "extensions": [
      "cii"
    ]
  },
  "application/vnd.anser-web-funds-transfer-initiation": {
    "source": "apache",
    "extensions": [
      "fti"
    ]
  },
  "application/vnd.antix.game-component": {
    "source": "iana",
    "extensions": [
      "atx"
    ]
  },
  "application/vnd.apache.arrow.file": {
    "source": "iana"
  },
  "application/vnd.apache.arrow.stream": {
    "source": "iana"
  },
  "application/vnd.apache.thrift.binary": {
    "source": "iana"
  },
  "application/vnd.apache.thrift.compact": {
    "source": "iana"
  },
  "application/vnd.apache.thrift.json": {
    "source": "iana"
  },
  "application/vnd.api+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.aplextor.warrp+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.apothekende.reservation+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.apple.installer+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "mpkg"
    ]
  },
  "application/vnd.apple.keynote": {
    "source": "iana",
    "extensions": [
      "key"
    ]
  },
  "application/vnd.apple.mpegurl": {
    "source": "iana",
    "extensions": [
      "m3u8"
    ]
  },
  "application/vnd.apple.numbers": {
    "source": "iana",
    "extensions": [
      "numbers"
    ]
  },
  "application/vnd.apple.pages": {
    "source": "iana",
    "extensions": [
      "pages"
    ]
  },
  "application/vnd.apple.pkpass": {
    "compressible": false,
    "extensions": [
      "pkpass"
    ]
  },
  "application/vnd.arastra.swi": {
    "source": "iana"
  },
  "application/vnd.aristanetworks.swi": {
    "source": "iana",
    "extensions": [
      "swi"
    ]
  },
  "application/vnd.artisan+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.artsquare": {
    "source": "iana"
  },
  "application/vnd.astraea-software.iota": {
    "source": "iana",
    "extensions": [
      "iota"
    ]
  },
  "application/vnd.audiograph": {
    "source": "iana",
    "extensions": [
      "aep"
    ]
  },
  "application/vnd.autopackage": {
    "source": "iana"
  },
  "application/vnd.avalon+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.avistar+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.balsamiq.bmml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "bmml"
    ]
  },
  "application/vnd.balsamiq.bmpr": {
    "source": "iana"
  },
  "application/vnd.banana-accounting": {
    "source": "iana"
  },
  "application/vnd.bbf.usp.error": {
    "source": "iana"
  },
  "application/vnd.bbf.usp.msg": {
    "source": "iana"
  },
  "application/vnd.bbf.usp.msg+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.bekitzur-stech+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.bint.med-content": {
    "source": "iana"
  },
  "application/vnd.biopax.rdf+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.blink-idb-value-wrapper": {
    "source": "iana"
  },
  "application/vnd.blueice.multipass": {
    "source": "iana",
    "extensions": [
      "mpm"
    ]
  },
  "application/vnd.bluetooth.ep.oob": {
    "source": "iana"
  },
  "application/vnd.bluetooth.le.oob": {
    "source": "iana"
  },
  "application/vnd.bmi": {
    "source": "iana",
    "extensions": [
      "bmi"
    ]
  },
  "application/vnd.bpf": {
    "source": "iana"
  },
  "application/vnd.bpf3": {
    "source": "iana"
  },
  "application/vnd.businessobjects": {
    "source": "iana",
    "extensions": [
      "rep"
    ]
  },
  "application/vnd.byu.uapi+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.cab-jscript": {
    "source": "iana"
  },
  "application/vnd.canon-cpdl": {
    "source": "iana"
  },
  "application/vnd.canon-lips": {
    "source": "iana"
  },
  "application/vnd.capasystems-pg+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.cendio.thinlinc.clientconf": {
    "source": "iana"
  },
  "application/vnd.century-systems.tcp_stream": {
    "source": "iana"
  },
  "application/vnd.chemdraw+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "cdxml"
    ]
  },
  "application/vnd.chess-pgn": {
    "source": "iana"
  },
  "application/vnd.chipnuts.karaoke-mmd": {
    "source": "iana",
    "extensions": [
      "mmd"
    ]
  },
  "application/vnd.ciedi": {
    "source": "iana"
  },
  "application/vnd.cinderella": {
    "source": "iana",
    "extensions": [
      "cdy"
    ]
  },
  "application/vnd.cirpack.isdn-ext": {
    "source": "iana"
  },
  "application/vnd.citationstyles.style+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "csl"
    ]
  },
  "application/vnd.claymore": {
    "source": "iana",
    "extensions": [
      "cla"
    ]
  },
  "application/vnd.cloanto.rp9": {
    "source": "iana",
    "extensions": [
      "rp9"
    ]
  },
  "application/vnd.clonk.c4group": {
    "source": "iana",
    "extensions": [
      "c4g",
      "c4d",
      "c4f",
      "c4p",
      "c4u"
    ]
  },
  "application/vnd.cluetrust.cartomobile-config": {
    "source": "iana",
    "extensions": [
      "c11amc"
    ]
  },
  "application/vnd.cluetrust.cartomobile-config-pkg": {
    "source": "iana",
    "extensions": [
      "c11amz"
    ]
  },
  "application/vnd.coffeescript": {
    "source": "iana"
  },
  "application/vnd.collabio.xodocuments.document": {
    "source": "iana"
  },
  "application/vnd.collabio.xodocuments.document-template": {
    "source": "iana"
  },
  "application/vnd.collabio.xodocuments.presentation": {
    "source": "iana"
  },
  "application/vnd.collabio.xodocuments.presentation-template": {
    "source": "iana"
  },
  "application/vnd.collabio.xodocuments.spreadsheet": {
    "source": "iana"
  },
  "application/vnd.collabio.xodocuments.spreadsheet-template": {
    "source": "iana"
  },
  "application/vnd.collection+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.collection.doc+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.collection.next+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.comicbook+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.comicbook-rar": {
    "source": "iana"
  },
  "application/vnd.commerce-battelle": {
    "source": "iana"
  },
  "application/vnd.commonspace": {
    "source": "iana",
    "extensions": [
      "csp"
    ]
  },
  "application/vnd.contact.cmsg": {
    "source": "iana",
    "extensions": [
      "cdbcmsg"
    ]
  },
  "application/vnd.coreos.ignition+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.cosmocaller": {
    "source": "iana",
    "extensions": [
      "cmc"
    ]
  },
  "application/vnd.crick.clicker": {
    "source": "iana",
    "extensions": [
      "clkx"
    ]
  },
  "application/vnd.crick.clicker.keyboard": {
    "source": "iana",
    "extensions": [
      "clkk"
    ]
  },
  "application/vnd.crick.clicker.palette": {
    "source": "iana",
    "extensions": [
      "clkp"
    ]
  },
  "application/vnd.crick.clicker.template": {
    "source": "iana",
    "extensions": [
      "clkt"
    ]
  },
  "application/vnd.crick.clicker.wordbank": {
    "source": "iana",
    "extensions": [
      "clkw"
    ]
  },
  "application/vnd.criticaltools.wbs+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "wbs"
    ]
  },
  "application/vnd.cryptii.pipe+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.crypto-shade-file": {
    "source": "iana"
  },
  "application/vnd.cryptomator.encrypted": {
    "source": "iana"
  },
  "application/vnd.cryptomator.vault": {
    "source": "iana"
  },
  "application/vnd.ctc-posml": {
    "source": "iana",
    "extensions": [
      "pml"
    ]
  },
  "application/vnd.ctct.ws+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.cups-pdf": {
    "source": "iana"
  },
  "application/vnd.cups-postscript": {
    "source": "iana"
  },
  "application/vnd.cups-ppd": {
    "source": "iana",
    "extensions": [
      "ppd"
    ]
  },
  "application/vnd.cups-raster": {
    "source": "iana"
  },
  "application/vnd.cups-raw": {
    "source": "iana"
  },
  "application/vnd.curl": {
    "source": "iana"
  },
  "application/vnd.curl.car": {
    "source": "apache",
    "extensions": [
      "car"
    ]
  },
  "application/vnd.curl.pcurl": {
    "source": "apache",
    "extensions": [
      "pcurl"
    ]
  },
  "application/vnd.cyan.dean.root+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.cybank": {
    "source": "iana"
  },
  "application/vnd.cyclonedx+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.cyclonedx+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.d2l.coursepackage1p0+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.d3m-dataset": {
    "source": "iana"
  },
  "application/vnd.d3m-problem": {
    "source": "iana"
  },
  "application/vnd.dart": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "dart"
    ]
  },
  "application/vnd.data-vision.rdz": {
    "source": "iana",
    "extensions": [
      "rdz"
    ]
  },
  "application/vnd.datapackage+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dataresource+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dbf": {
    "source": "iana",
    "extensions": [
      "dbf"
    ]
  },
  "application/vnd.debian.binary-package": {
    "source": "iana"
  },
  "application/vnd.dece.data": {
    "source": "iana",
    "extensions": [
      "uvf",
      "uvvf",
      "uvd",
      "uvvd"
    ]
  },
  "application/vnd.dece.ttml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "uvt",
      "uvvt"
    ]
  },
  "application/vnd.dece.unspecified": {
    "source": "iana",
    "extensions": [
      "uvx",
      "uvvx"
    ]
  },
  "application/vnd.dece.zip": {
    "source": "iana",
    "extensions": [
      "uvz",
      "uvvz"
    ]
  },
  "application/vnd.denovo.fcselayout-link": {
    "source": "iana",
    "extensions": [
      "fe_launch"
    ]
  },
  "application/vnd.desmume.movie": {
    "source": "iana"
  },
  "application/vnd.dir-bi.plate-dl-nosuffix": {
    "source": "iana"
  },
  "application/vnd.dm.delegation+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dna": {
    "source": "iana",
    "extensions": [
      "dna"
    ]
  },
  "application/vnd.document+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dolby.mlp": {
    "source": "apache",
    "extensions": [
      "mlp"
    ]
  },
  "application/vnd.dolby.mobile.1": {
    "source": "iana"
  },
  "application/vnd.dolby.mobile.2": {
    "source": "iana"
  },
  "application/vnd.doremir.scorecloud-binary-document": {
    "source": "iana"
  },
  "application/vnd.dpgraph": {
    "source": "iana",
    "extensions": [
      "dpg"
    ]
  },
  "application/vnd.dreamfactory": {
    "source": "iana",
    "extensions": [
      "dfac"
    ]
  },
  "application/vnd.drive+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ds-keypoint": {
    "source": "apache",
    "extensions": [
      "kpxx"
    ]
  },
  "application/vnd.dtg.local": {
    "source": "iana"
  },
  "application/vnd.dtg.local.flash": {
    "source": "iana"
  },
  "application/vnd.dtg.local.html": {
    "source": "iana"
  },
  "application/vnd.dvb.ait": {
    "source": "iana",
    "extensions": [
      "ait"
    ]
  },
  "application/vnd.dvb.dvbisl+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.dvbj": {
    "source": "iana"
  },
  "application/vnd.dvb.esgcontainer": {
    "source": "iana"
  },
  "application/vnd.dvb.ipdcdftnotifaccess": {
    "source": "iana"
  },
  "application/vnd.dvb.ipdcesgaccess": {
    "source": "iana"
  },
  "application/vnd.dvb.ipdcesgaccess2": {
    "source": "iana"
  },
  "application/vnd.dvb.ipdcesgpdd": {
    "source": "iana"
  },
  "application/vnd.dvb.ipdcroaming": {
    "source": "iana"
  },
  "application/vnd.dvb.iptv.alfec-base": {
    "source": "iana"
  },
  "application/vnd.dvb.iptv.alfec-enhancement": {
    "source": "iana"
  },
  "application/vnd.dvb.notif-aggregate-root+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.notif-container+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.notif-generic+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.notif-ia-msglist+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.notif-ia-registration-request+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.notif-ia-registration-response+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.notif-init+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.pfr": {
    "source": "iana"
  },
  "application/vnd.dvb.service": {
    "source": "iana",
    "extensions": [
      "svc"
    ]
  },
  "application/vnd.dxr": {
    "source": "iana"
  },
  "application/vnd.dynageo": {
    "source": "iana",
    "extensions": [
      "geo"
    ]
  },
  "application/vnd.dzr": {
    "source": "iana"
  },
  "application/vnd.easykaraoke.cdgdownload": {
    "source": "iana"
  },
  "application/vnd.ecdis-update": {
    "source": "iana"
  },
  "application/vnd.ecip.rlp": {
    "source": "iana"
  },
  "application/vnd.eclipse.ditto+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ecowin.chart": {
    "source": "iana",
    "extensions": [
      "mag"
    ]
  },
  "application/vnd.ecowin.filerequest": {
    "source": "iana"
  },
  "application/vnd.ecowin.fileupdate": {
    "source": "iana"
  },
  "application/vnd.ecowin.series": {
    "source": "iana"
  },
  "application/vnd.ecowin.seriesrequest": {
    "source": "iana"
  },
  "application/vnd.ecowin.seriesupdate": {
    "source": "iana"
  },
  "application/vnd.efi.img": {
    "source": "iana"
  },
  "application/vnd.efi.iso": {
    "source": "iana"
  },
  "application/vnd.emclient.accessrequest+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.enliven": {
    "source": "iana",
    "extensions": [
      "nml"
    ]
  },
  "application/vnd.enphase.envoy": {
    "source": "iana"
  },
  "application/vnd.eprints.data+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.epson.esf": {
    "source": "iana",
    "extensions": [
      "esf"
    ]
  },
  "application/vnd.epson.msf": {
    "source": "iana",
    "extensions": [
      "msf"
    ]
  },
  "application/vnd.epson.quickanime": {
    "source": "iana",
    "extensions": [
      "qam"
    ]
  },
  "application/vnd.epson.salt": {
    "source": "iana",
    "extensions": [
      "slt"
    ]
  },
  "application/vnd.epson.ssf": {
    "source": "iana",
    "extensions": [
      "ssf"
    ]
  },
  "application/vnd.ericsson.quickcall": {
    "source": "iana"
  },
  "application/vnd.espass-espass+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.eszigno3+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "es3",
      "et3"
    ]
  },
  "application/vnd.etsi.aoc+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.asic-e+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.etsi.asic-s+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.etsi.cug+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvcommand+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvdiscovery+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvprofile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvsad-bc+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvsad-cod+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvsad-npvr+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvservice+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvsync+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvueprofile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.mcid+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.mheg5": {
    "source": "iana"
  },
  "application/vnd.etsi.overload-control-policy-dataset+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.pstn+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.sci+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.simservs+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.timestamp-token": {
    "source": "iana"
  },
  "application/vnd.etsi.tsl+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.tsl.der": {
    "source": "iana"
  },
  "application/vnd.eu.kasparian.car+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.eudora.data": {
    "source": "iana"
  },
  "application/vnd.evolv.ecig.profile": {
    "source": "iana"
  },
  "application/vnd.evolv.ecig.settings": {
    "source": "iana"
  },
  "application/vnd.evolv.ecig.theme": {
    "source": "iana"
  },
  "application/vnd.exstream-empower+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.exstream-package": {
    "source": "iana"
  },
  "application/vnd.ezpix-album": {
    "source": "iana",
    "extensions": [
      "ez2"
    ]
  },
  "application/vnd.ezpix-package": {
    "source": "iana",
    "extensions": [
      "ez3"
    ]
  },
  "application/vnd.f-secure.mobile": {
    "source": "iana"
  },
  "application/vnd.familysearch.gedcom+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.fastcopy-disk-image": {
    "source": "iana"
  },
  "application/vnd.fdf": {
    "source": "iana",
    "extensions": [
      "fdf"
    ]
  },
  "application/vnd.fdsn.mseed": {
    "source": "iana",
    "extensions": [
      "mseed"
    ]
  },
  "application/vnd.fdsn.seed": {
    "source": "iana",
    "extensions": [
      "seed",
      "dataless"
    ]
  },
  "application/vnd.ffsns": {
    "source": "iana"
  },
  "application/vnd.ficlab.flb+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.filmit.zfc": {
    "source": "iana"
  },
  "application/vnd.fints": {
    "source": "iana"
  },
  "application/vnd.firemonkeys.cloudcell": {
    "source": "iana"
  },
  "application/vnd.flographit": {
    "source": "iana",
    "extensions": [
      "gph"
    ]
  },
  "application/vnd.fluxtime.clip": {
    "source": "iana",
    "extensions": [
      "ftc"
    ]
  },
  "application/vnd.font-fontforge-sfd": {
    "source": "iana"
  },
  "application/vnd.framemaker": {
    "source": "iana",
    "extensions": [
      "fm",
      "frame",
      "maker",
      "book"
    ]
  },
  "application/vnd.frogans.fnc": {
    "source": "iana",
    "extensions": [
      "fnc"
    ]
  },
  "application/vnd.frogans.ltf": {
    "source": "iana",
    "extensions": [
      "ltf"
    ]
  },
  "application/vnd.fsc.weblaunch": {
    "source": "iana",
    "extensions": [
      "fsc"
    ]
  },
  "application/vnd.fujifilm.fb.docuworks": {
    "source": "iana"
  },
  "application/vnd.fujifilm.fb.docuworks.binder": {
    "source": "iana"
  },
  "application/vnd.fujifilm.fb.docuworks.container": {
    "source": "iana"
  },
  "application/vnd.fujifilm.fb.jfi+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.fujitsu.oasys": {
    "source": "iana",
    "extensions": [
      "oas"
    ]
  },
  "application/vnd.fujitsu.oasys2": {
    "source": "iana",
    "extensions": [
      "oa2"
    ]
  },
  "application/vnd.fujitsu.oasys3": {
    "source": "iana",
    "extensions": [
      "oa3"
    ]
  },
  "application/vnd.fujitsu.oasysgp": {
    "source": "iana",
    "extensions": [
      "fg5"
    ]
  },
  "application/vnd.fujitsu.oasysprs": {
    "source": "iana",
    "extensions": [
      "bh2"
    ]
  },
  "application/vnd.fujixerox.art-ex": {
    "source": "iana"
  },
  "application/vnd.fujixerox.art4": {
    "source": "iana"
  },
  "application/vnd.fujixerox.ddd": {
    "source": "iana",
    "extensions": [
      "ddd"
    ]
  },
  "application/vnd.fujixerox.docuworks": {
    "source": "iana",
    "extensions": [
      "xdw"
    ]
  },
  "application/vnd.fujixerox.docuworks.binder": {
    "source": "iana",
    "extensions": [
      "xbd"
    ]
  },
  "application/vnd.fujixerox.docuworks.container": {
    "source": "iana"
  },
  "application/vnd.fujixerox.hbpl": {
    "source": "iana"
  },
  "application/vnd.fut-misnet": {
    "source": "iana"
  },
  "application/vnd.futoin+cbor": {
    "source": "iana"
  },
  "application/vnd.futoin+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.fuzzysheet": {
    "source": "iana",
    "extensions": [
      "fzs"
    ]
  },
  "application/vnd.genomatix.tuxedo": {
    "source": "iana",
    "extensions": [
      "txd"
    ]
  },
  "application/vnd.gentics.grd+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.geo+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.geocube+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.geogebra.file": {
    "source": "iana",
    "extensions": [
      "ggb"
    ]
  },
  "application/vnd.geogebra.slides": {
    "source": "iana"
  },
  "application/vnd.geogebra.tool": {
    "source": "iana",
    "extensions": [
      "ggt"
    ]
  },
  "application/vnd.geometry-explorer": {
    "source": "iana",
    "extensions": [
      "gex",
      "gre"
    ]
  },
  "application/vnd.geonext": {
    "source": "iana",
    "extensions": [
      "gxt"
    ]
  },
  "application/vnd.geoplan": {
    "source": "iana",
    "extensions": [
      "g2w"
    ]
  },
  "application/vnd.geospace": {
    "source": "iana",
    "extensions": [
      "g3w"
    ]
  },
  "application/vnd.gerber": {
    "source": "iana"
  },
  "application/vnd.globalplatform.card-content-mgt": {
    "source": "iana"
  },
  "application/vnd.globalplatform.card-content-mgt-response": {
    "source": "iana"
  },
  "application/vnd.gmx": {
    "source": "iana",
    "extensions": [
      "gmx"
    ]
  },
  "application/vnd.google-apps.document": {
    "compressible": false,
    "extensions": [
      "gdoc"
    ]
  },
  "application/vnd.google-apps.presentation": {
    "compressible": false,
    "extensions": [
      "gslides"
    ]
  },
  "application/vnd.google-apps.spreadsheet": {
    "compressible": false,
    "extensions": [
      "gsheet"
    ]
  },
  "application/vnd.google-earth.kml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "kml"
    ]
  },
  "application/vnd.google-earth.kmz": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "kmz"
    ]
  },
  "application/vnd.gov.sk.e-form+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.gov.sk.e-form+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.gov.sk.xmldatacontainer+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.grafeq": {
    "source": "iana",
    "extensions": [
      "gqf",
      "gqs"
    ]
  },
  "application/vnd.gridmp": {
    "source": "iana"
  },
  "application/vnd.groove-account": {
    "source": "iana",
    "extensions": [
      "gac"
    ]
  },
  "application/vnd.groove-help": {
    "source": "iana",
    "extensions": [
      "ghf"
    ]
  },
  "application/vnd.groove-identity-message": {
    "source": "iana",
    "extensions": [
      "gim"
    ]
  },
  "application/vnd.groove-injector": {
    "source": "iana",
    "extensions": [
      "grv"
    ]
  },
  "application/vnd.groove-tool-message": {
    "source": "iana",
    "extensions": [
      "gtm"
    ]
  },
  "application/vnd.groove-tool-template": {
    "source": "iana",
    "extensions": [
      "tpl"
    ]
  },
  "application/vnd.groove-vcard": {
    "source": "iana",
    "extensions": [
      "vcg"
    ]
  },
  "application/vnd.hal+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.hal+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "hal"
    ]
  },
  "application/vnd.handheld-entertainment+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "zmm"
    ]
  },
  "application/vnd.hbci": {
    "source": "iana",
    "extensions": [
      "hbci"
    ]
  },
  "application/vnd.hc+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.hcl-bireports": {
    "source": "iana"
  },
  "application/vnd.hdt": {
    "source": "iana"
  },
  "application/vnd.heroku+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.hhe.lesson-player": {
    "source": "iana",
    "extensions": [
      "les"
    ]
  },
  "application/vnd.hl7cda+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/vnd.hl7v2+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/vnd.hp-hpgl": {
    "source": "iana",
    "extensions": [
      "hpgl"
    ]
  },
  "application/vnd.hp-hpid": {
    "source": "iana",
    "extensions": [
      "hpid"
    ]
  },
  "application/vnd.hp-hps": {
    "source": "iana",
    "extensions": [
      "hps"
    ]
  },
  "application/vnd.hp-jlyt": {
    "source": "iana",
    "extensions": [
      "jlt"
    ]
  },
  "application/vnd.hp-pcl": {
    "source": "iana",
    "extensions": [
      "pcl"
    ]
  },
  "application/vnd.hp-pclxl": {
    "source": "iana",
    "extensions": [
      "pclxl"
    ]
  },
  "application/vnd.httphone": {
    "source": "iana"
  },
  "application/vnd.hydrostatix.sof-data": {
    "source": "iana",
    "extensions": [
      "sfd-hdstx"
    ]
  },
  "application/vnd.hyper+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.hyper-item+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.hyperdrive+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.hzn-3d-crossword": {
    "source": "iana"
  },
  "application/vnd.ibm.afplinedata": {
    "source": "iana"
  },
  "application/vnd.ibm.electronic-media": {
    "source": "iana"
  },
  "application/vnd.ibm.minipay": {
    "source": "iana",
    "extensions": [
      "mpy"
    ]
  },
  "application/vnd.ibm.modcap": {
    "source": "iana",
    "extensions": [
      "afp",
      "listafp",
      "list3820"
    ]
  },
  "application/vnd.ibm.rights-management": {
    "source": "iana",
    "extensions": [
      "irm"
    ]
  },
  "application/vnd.ibm.secure-container": {
    "source": "iana",
    "extensions": [
      "sc"
    ]
  },
  "application/vnd.iccprofile": {
    "source": "iana",
    "extensions": [
      "icc",
      "icm"
    ]
  },
  "application/vnd.ieee.1905": {
    "source": "iana"
  },
  "application/vnd.igloader": {
    "source": "iana",
    "extensions": [
      "igl"
    ]
  },
  "application/vnd.imagemeter.folder+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.imagemeter.image+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.immervision-ivp": {
    "source": "iana",
    "extensions": [
      "ivp"
    ]
  },
  "application/vnd.immervision-ivu": {
    "source": "iana",
    "extensions": [
      "ivu"
    ]
  },
  "application/vnd.ims.imsccv1p1": {
    "source": "iana"
  },
  "application/vnd.ims.imsccv1p2": {
    "source": "iana"
  },
  "application/vnd.ims.imsccv1p3": {
    "source": "iana"
  },
  "application/vnd.ims.lis.v2.result+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ims.lti.v2.toolproxy+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ims.lti.v2.toolproxy.id+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ims.lti.v2.toolsettings+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ims.lti.v2.toolsettings.simple+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.informedcontrol.rms+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.informix-visionary": {
    "source": "iana"
  },
  "application/vnd.infotech.project": {
    "source": "iana"
  },
  "application/vnd.infotech.project+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.innopath.wamp.notification": {
    "source": "iana"
  },
  "application/vnd.insors.igm": {
    "source": "iana",
    "extensions": [
      "igm"
    ]
  },
  "application/vnd.intercon.formnet": {
    "source": "iana",
    "extensions": [
      "xpw",
      "xpx"
    ]
  },
  "application/vnd.intergeo": {
    "source": "iana",
    "extensions": [
      "i2g"
    ]
  },
  "application/vnd.intertrust.digibox": {
    "source": "iana"
  },
  "application/vnd.intertrust.nncp": {
    "source": "iana"
  },
  "application/vnd.intu.qbo": {
    "source": "iana",
    "extensions": [
      "qbo"
    ]
  },
  "application/vnd.intu.qfx": {
    "source": "iana",
    "extensions": [
      "qfx"
    ]
  },
  "application/vnd.iptc.g2.catalogitem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.iptc.g2.conceptitem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.iptc.g2.knowledgeitem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.iptc.g2.newsitem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.iptc.g2.newsmessage+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.iptc.g2.packageitem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.iptc.g2.planningitem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ipunplugged.rcprofile": {
    "source": "iana",
    "extensions": [
      "rcprofile"
    ]
  },
  "application/vnd.irepository.package+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "irp"
    ]
  },
  "application/vnd.is-xpr": {
    "source": "iana",
    "extensions": [
      "xpr"
    ]
  },
  "application/vnd.isac.fcs": {
    "source": "iana",
    "extensions": [
      "fcs"
    ]
  },
  "application/vnd.iso11783-10+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.jam": {
    "source": "iana",
    "extensions": [
      "jam"
    ]
  },
  "application/vnd.japannet-directory-service": {
    "source": "iana"
  },
  "application/vnd.japannet-jpnstore-wakeup": {
    "source": "iana"
  },
  "application/vnd.japannet-payment-wakeup": {
    "source": "iana"
  },
  "application/vnd.japannet-registration": {
    "source": "iana"
  },
  "application/vnd.japannet-registration-wakeup": {
    "source": "iana"
  },
  "application/vnd.japannet-setstore-wakeup": {
    "source": "iana"
  },
  "application/vnd.japannet-verification": {
    "source": "iana"
  },
  "application/vnd.japannet-verification-wakeup": {
    "source": "iana"
  },
  "application/vnd.jcp.javame.midlet-rms": {
    "source": "iana",
    "extensions": [
      "rms"
    ]
  },
  "application/vnd.jisp": {
    "source": "iana",
    "extensions": [
      "jisp"
    ]
  },
  "application/vnd.joost.joda-archive": {
    "source": "iana",
    "extensions": [
      "joda"
    ]
  },
  "application/vnd.jsk.isdn-ngn": {
    "source": "iana"
  },
  "application/vnd.kahootz": {
    "source": "iana",
    "extensions": [
      "ktz",
      "ktr"
    ]
  },
  "application/vnd.kde.karbon": {
    "source": "iana",
    "extensions": [
      "karbon"
    ]
  },
  "application/vnd.kde.kchart": {
    "source": "iana",
    "extensions": [
      "chrt"
    ]
  },
  "application/vnd.kde.kformula": {
    "source": "iana",
    "extensions": [
      "kfo"
    ]
  },
  "application/vnd.kde.kivio": {
    "source": "iana",
    "extensions": [
      "flw"
    ]
  },
  "application/vnd.kde.kontour": {
    "source": "iana",
    "extensions": [
      "kon"
    ]
  },
  "application/vnd.kde.kpresenter": {
    "source": "iana",
    "extensions": [
      "kpr",
      "kpt"
    ]
  },
  "application/vnd.kde.kspread": {
    "source": "iana",
    "extensions": [
      "ksp"
    ]
  },
  "application/vnd.kde.kword": {
    "source": "iana",
    "extensions": [
      "kwd",
      "kwt"
    ]
  },
  "application/vnd.kenameaapp": {
    "source": "iana",
    "extensions": [
      "htke"
    ]
  },
  "application/vnd.kidspiration": {
    "source": "iana",
    "extensions": [
      "kia"
    ]
  },
  "application/vnd.kinar": {
    "source": "iana",
    "extensions": [
      "kne",
      "knp"
    ]
  },
  "application/vnd.koan": {
    "source": "iana",
    "extensions": [
      "skp",
      "skd",
      "skt",
      "skm"
    ]
  },
  "application/vnd.kodak-descriptor": {
    "source": "iana",
    "extensions": [
      "sse"
    ]
  },
  "application/vnd.las": {
    "source": "iana"
  },
  "application/vnd.las.las+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.las.las+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "lasxml"
    ]
  },
  "application/vnd.laszip": {
    "source": "iana"
  },
  "application/vnd.leap+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.liberty-request+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.llamagraphics.life-balance.desktop": {
    "source": "iana",
    "extensions": [
      "lbd"
    ]
  },
  "application/vnd.llamagraphics.life-balance.exchange+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "lbe"
    ]
  },
  "application/vnd.logipipe.circuit+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.loom": {
    "source": "iana"
  },
  "application/vnd.lotus-1-2-3": {
    "source": "iana",
    "extensions": [
      "123"
    ]
  },
  "application/vnd.lotus-approach": {
    "source": "iana",
    "extensions": [
      "apr"
    ]
  },
  "application/vnd.lotus-freelance": {
    "source": "iana",
    "extensions": [
      "pre"
    ]
  },
  "application/vnd.lotus-notes": {
    "source": "iana",
    "extensions": [
      "nsf"
    ]
  },
  "application/vnd.lotus-organizer": {
    "source": "iana",
    "extensions": [
      "org"
    ]
  },
  "application/vnd.lotus-screencam": {
    "source": "iana",
    "extensions": [
      "scm"
    ]
  },
  "application/vnd.lotus-wordpro": {
    "source": "iana",
    "extensions": [
      "lwp"
    ]
  },
  "application/vnd.macports.portpkg": {
    "source": "iana",
    "extensions": [
      "portpkg"
    ]
  },
  "application/vnd.mapbox-vector-tile": {
    "source": "iana",
    "extensions": [
      "mvt"
    ]
  },
  "application/vnd.marlin.drm.actiontoken+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.marlin.drm.conftoken+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.marlin.drm.license+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.marlin.drm.mdcf": {
    "source": "iana"
  },
  "application/vnd.mason+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.maxar.archive.3tz+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.maxmind.maxmind-db": {
    "source": "iana"
  },
  "application/vnd.mcd": {
    "source": "iana",
    "extensions": [
      "mcd"
    ]
  },
  "application/vnd.medcalcdata": {
    "source": "iana",
    "extensions": [
      "mc1"
    ]
  },
  "application/vnd.mediastation.cdkey": {
    "source": "iana",
    "extensions": [
      "cdkey"
    ]
  },
  "application/vnd.meridian-slingshot": {
    "source": "iana"
  },
  "application/vnd.mfer": {
    "source": "iana",
    "extensions": [
      "mwf"
    ]
  },
  "application/vnd.mfmp": {
    "source": "iana",
    "extensions": [
      "mfm"
    ]
  },
  "application/vnd.micro+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.micrografx.flo": {
    "source": "iana",
    "extensions": [
      "flo"
    ]
  },
  "application/vnd.micrografx.igx": {
    "source": "iana",
    "extensions": [
      "igx"
    ]
  },
  "application/vnd.microsoft.portable-executable": {
    "source": "iana"
  },
  "application/vnd.microsoft.windows.thumbnail-cache": {
    "source": "iana"
  },
  "application/vnd.miele+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.mif": {
    "source": "iana",
    "extensions": [
      "mif"
    ]
  },
  "application/vnd.minisoft-hp3000-save": {
    "source": "iana"
  },
  "application/vnd.mitsubishi.misty-guard.trustweb": {
    "source": "iana"
  },
  "application/vnd.mobius.daf": {
    "source": "iana",
    "extensions": [
      "daf"
    ]
  },
  "application/vnd.mobius.dis": {
    "source": "iana",
    "extensions": [
      "dis"
    ]
  },
  "application/vnd.mobius.mbk": {
    "source": "iana",
    "extensions": [
      "mbk"
    ]
  },
  "application/vnd.mobius.mqy": {
    "source": "iana",
    "extensions": [
      "mqy"
    ]
  },
  "application/vnd.mobius.msl": {
    "source": "iana",
    "extensions": [
      "msl"
    ]
  },
  "application/vnd.mobius.plc": {
    "source": "iana",
    "extensions": [
      "plc"
    ]
  },
  "application/vnd.mobius.txf": {
    "source": "iana",
    "extensions": [
      "txf"
    ]
  },
  "application/vnd.mophun.application": {
    "source": "iana",
    "extensions": [
      "mpn"
    ]
  },
  "application/vnd.mophun.certificate": {
    "source": "iana",
    "extensions": [
      "mpc"
    ]
  },
  "application/vnd.motorola.flexsuite": {
    "source": "iana"
  },
  "application/vnd.motorola.flexsuite.adsi": {
    "source": "iana"
  },
  "application/vnd.motorola.flexsuite.fis": {
    "source": "iana"
  },
  "application/vnd.motorola.flexsuite.gotap": {
    "source": "iana"
  },
  "application/vnd.motorola.flexsuite.kmr": {
    "source": "iana"
  },
  "application/vnd.motorola.flexsuite.ttc": {
    "source": "iana"
  },
  "application/vnd.motorola.flexsuite.wem": {
    "source": "iana"
  },
  "application/vnd.motorola.iprm": {
    "source": "iana"
  },
  "application/vnd.mozilla.xul+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "xul"
    ]
  },
  "application/vnd.ms-3mfdocument": {
    "source": "iana"
  },
  "application/vnd.ms-artgalry": {
    "source": "iana",
    "extensions": [
      "cil"
    ]
  },
  "application/vnd.ms-asf": {
    "source": "iana"
  },
  "application/vnd.ms-cab-compressed": {
    "source": "iana",
    "extensions": [
      "cab"
    ]
  },
  "application/vnd.ms-color.iccprofile": {
    "source": "apache"
  },
  "application/vnd.ms-excel": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "xls",
      "xlm",
      "xla",
      "xlc",
      "xlt",
      "xlw"
    ]
  },
  "application/vnd.ms-excel.addin.macroenabled.12": {
    "source": "iana",
    "extensions": [
      "xlam"
    ]
  },
  "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
    "source": "iana",
    "extensions": [
      "xlsb"
    ]
  },
  "application/vnd.ms-excel.sheet.macroenabled.12": {
    "source": "iana",
    "extensions": [
      "xlsm"
    ]
  },
  "application/vnd.ms-excel.template.macroenabled.12": {
    "source": "iana",
    "extensions": [
      "xltm"
    ]
  },
  "application/vnd.ms-fontobject": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "eot"
    ]
  },
  "application/vnd.ms-htmlhelp": {
    "source": "iana",
    "extensions": [
      "chm"
    ]
  },
  "application/vnd.ms-ims": {
    "source": "iana",
    "extensions": [
      "ims"
    ]
  },
  "application/vnd.ms-lrm": {
    "source": "iana",
    "extensions": [
      "lrm"
    ]
  },
  "application/vnd.ms-office.activex+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ms-officetheme": {
    "source": "iana",
    "extensions": [
      "thmx"
    ]
  },
  "application/vnd.ms-opentype": {
    "source": "apache",
    "compressible": true
  },
  "application/vnd.ms-outlook": {
    "compressible": false,
    "extensions": [
      "msg"
    ]
  },
  "application/vnd.ms-package.obfuscated-opentype": {
    "source": "apache"
  },
  "application/vnd.ms-pki.seccat": {
    "source": "apache",
    "extensions": [
      "cat"
    ]
  },
  "application/vnd.ms-pki.stl": {
    "source": "apache",
    "extensions": [
      "stl"
    ]
  },
  "application/vnd.ms-playready.initiator+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ms-powerpoint": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "ppt",
      "pps",
      "pot"
    ]
  },
  "application/vnd.ms-powerpoint.addin.macroenabled.12": {
    "source": "iana",
    "extensions": [
      "ppam"
    ]
  },
  "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
    "source": "iana",
    "extensions": [
      "pptm"
    ]
  },
  "application/vnd.ms-powerpoint.slide.macroenabled.12": {
    "source": "iana",
    "extensions": [
      "sldm"
    ]
  },
  "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
    "source": "iana",
    "extensions": [
      "ppsm"
    ]
  },
  "application/vnd.ms-powerpoint.template.macroenabled.12": {
    "source": "iana",
    "extensions": [
      "potm"
    ]
  },
  "application/vnd.ms-printdevicecapabilities+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ms-printing.printticket+xml": {
    "source": "apache",
    "compressible": true
  },
  "application/vnd.ms-printschematicket+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ms-project": {
    "source": "iana",
    "extensions": [
      "mpp",
      "mpt"
    ]
  },
  "application/vnd.ms-tnef": {
    "source": "iana"
  },
  "application/vnd.ms-windows.devicepairing": {
    "source": "iana"
  },
  "application/vnd.ms-windows.nwprinting.oob": {
    "source": "iana"
  },
  "application/vnd.ms-windows.printerpairing": {
    "source": "iana"
  },
  "application/vnd.ms-windows.wsd.oob": {
    "source": "iana"
  },
  "application/vnd.ms-wmdrm.lic-chlg-req": {
    "source": "iana"
  },
  "application/vnd.ms-wmdrm.lic-resp": {
    "source": "iana"
  },
  "application/vnd.ms-wmdrm.meter-chlg-req": {
    "source": "iana"
  },
  "application/vnd.ms-wmdrm.meter-resp": {
    "source": "iana"
  },
  "application/vnd.ms-word.document.macroenabled.12": {
    "source": "iana",
    "extensions": [
      "docm"
    ]
  },
  "application/vnd.ms-word.template.macroenabled.12": {
    "source": "iana",
    "extensions": [
      "dotm"
    ]
  },
  "application/vnd.ms-works": {
    "source": "iana",
    "extensions": [
      "wps",
      "wks",
      "wcm",
      "wdb"
    ]
  },
  "application/vnd.ms-wpl": {
    "source": "iana",
    "extensions": [
      "wpl"
    ]
  },
  "application/vnd.ms-xpsdocument": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "xps"
    ]
  },
  "application/vnd.msa-disk-image": {
    "source": "iana"
  },
  "application/vnd.mseq": {
    "source": "iana",
    "extensions": [
      "mseq"
    ]
  },
  "application/vnd.msign": {
    "source": "iana"
  },
  "application/vnd.multiad.creator": {
    "source": "iana"
  },
  "application/vnd.multiad.creator.cif": {
    "source": "iana"
  },
  "application/vnd.music-niff": {
    "source": "iana"
  },
  "application/vnd.musician": {
    "source": "iana",
    "extensions": [
      "mus"
    ]
  },
  "application/vnd.muvee.style": {
    "source": "iana",
    "extensions": [
      "msty"
    ]
  },
  "application/vnd.mynfc": {
    "source": "iana",
    "extensions": [
      "taglet"
    ]
  },
  "application/vnd.nacamar.ybrid+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ncd.control": {
    "source": "iana"
  },
  "application/vnd.ncd.reference": {
    "source": "iana"
  },
  "application/vnd.nearst.inv+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nebumind.line": {
    "source": "iana"
  },
  "application/vnd.nervana": {
    "source": "iana"
  },
  "application/vnd.netfpx": {
    "source": "iana"
  },
  "application/vnd.neurolanguage.nlu": {
    "source": "iana",
    "extensions": [
      "nlu"
    ]
  },
  "application/vnd.nimn": {
    "source": "iana"
  },
  "application/vnd.nintendo.nitro.rom": {
    "source": "iana"
  },
  "application/vnd.nintendo.snes.rom": {
    "source": "iana"
  },
  "application/vnd.nitf": {
    "source": "iana",
    "extensions": [
      "ntf",
      "nitf"
    ]
  },
  "application/vnd.noblenet-directory": {
    "source": "iana",
    "extensions": [
      "nnd"
    ]
  },
  "application/vnd.noblenet-sealer": {
    "source": "iana",
    "extensions": [
      "nns"
    ]
  },
  "application/vnd.noblenet-web": {
    "source": "iana",
    "extensions": [
      "nnw"
    ]
  },
  "application/vnd.nokia.catalogs": {
    "source": "iana"
  },
  "application/vnd.nokia.conml+wbxml": {
    "source": "iana"
  },
  "application/vnd.nokia.conml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nokia.iptv.config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nokia.isds-radio-presets": {
    "source": "iana"
  },
  "application/vnd.nokia.landmark+wbxml": {
    "source": "iana"
  },
  "application/vnd.nokia.landmark+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nokia.landmarkcollection+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nokia.n-gage.ac+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "ac"
    ]
  },
  "application/vnd.nokia.n-gage.data": {
    "source": "iana",
    "extensions": [
      "ngdat"
    ]
  },
  "application/vnd.nokia.n-gage.symbian.install": {
    "source": "iana",
    "extensions": [
      "n-gage"
    ]
  },
  "application/vnd.nokia.ncd": {
    "source": "iana"
  },
  "application/vnd.nokia.pcd+wbxml": {
    "source": "iana"
  },
  "application/vnd.nokia.pcd+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nokia.radio-preset": {
    "source": "iana",
    "extensions": [
      "rpst"
    ]
  },
  "application/vnd.nokia.radio-presets": {
    "source": "iana",
    "extensions": [
      "rpss"
    ]
  },
  "application/vnd.novadigm.edm": {
    "source": "iana",
    "extensions": [
      "edm"
    ]
  },
  "application/vnd.novadigm.edx": {
    "source": "iana",
    "extensions": [
      "edx"
    ]
  },
  "application/vnd.novadigm.ext": {
    "source": "iana",
    "extensions": [
      "ext"
    ]
  },
  "application/vnd.ntt-local.content-share": {
    "source": "iana"
  },
  "application/vnd.ntt-local.file-transfer": {
    "source": "iana"
  },
  "application/vnd.ntt-local.ogw_remote-access": {
    "source": "iana"
  },
  "application/vnd.ntt-local.sip-ta_remote": {
    "source": "iana"
  },
  "application/vnd.ntt-local.sip-ta_tcp_stream": {
    "source": "iana"
  },
  "application/vnd.oasis.opendocument.chart": {
    "source": "iana",
    "extensions": [
      "odc"
    ]
  },
  "application/vnd.oasis.opendocument.chart-template": {
    "source": "iana",
    "extensions": [
      "otc"
    ]
  },
  "application/vnd.oasis.opendocument.database": {
    "source": "iana",
    "extensions": [
      "odb"
    ]
  },
  "application/vnd.oasis.opendocument.formula": {
    "source": "iana",
    "extensions": [
      "odf"
    ]
  },
  "application/vnd.oasis.opendocument.formula-template": {
    "source": "iana",
    "extensions": [
      "odft"
    ]
  },
  "application/vnd.oasis.opendocument.graphics": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "odg"
    ]
  },
  "application/vnd.oasis.opendocument.graphics-template": {
    "source": "iana",
    "extensions": [
      "otg"
    ]
  },
  "application/vnd.oasis.opendocument.image": {
    "source": "iana",
    "extensions": [
      "odi"
    ]
  },
  "application/vnd.oasis.opendocument.image-template": {
    "source": "iana",
    "extensions": [
      "oti"
    ]
  },
  "application/vnd.oasis.opendocument.presentation": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "odp"
    ]
  },
  "application/vnd.oasis.opendocument.presentation-template": {
    "source": "iana",
    "extensions": [
      "otp"
    ]
  },
  "application/vnd.oasis.opendocument.spreadsheet": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "ods"
    ]
  },
  "application/vnd.oasis.opendocument.spreadsheet-template": {
    "source": "iana",
    "extensions": [
      "ots"
    ]
  },
  "application/vnd.oasis.opendocument.text": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "odt"
    ]
  },
  "application/vnd.oasis.opendocument.text-master": {
    "source": "iana",
    "extensions": [
      "odm"
    ]
  },
  "application/vnd.oasis.opendocument.text-template": {
    "source": "iana",
    "extensions": [
      "ott"
    ]
  },
  "application/vnd.oasis.opendocument.text-web": {
    "source": "iana",
    "extensions": [
      "oth"
    ]
  },
  "application/vnd.obn": {
    "source": "iana"
  },
  "application/vnd.ocf+cbor": {
    "source": "iana"
  },
  "application/vnd.oci.image.manifest.v1+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oftn.l10n+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.contentaccessdownload+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.contentaccessstreaming+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.cspg-hexbinary": {
    "source": "iana"
  },
  "application/vnd.oipf.dae.svg+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.dae.xhtml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.mippvcontrolmessage+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.pae.gem": {
    "source": "iana"
  },
  "application/vnd.oipf.spdiscovery+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.spdlist+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.ueprofile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.userprofile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.olpc-sugar": {
    "source": "iana",
    "extensions": [
      "xo"
    ]
  },
  "application/vnd.oma-scws-config": {
    "source": "iana"
  },
  "application/vnd.oma-scws-http-request": {
    "source": "iana"
  },
  "application/vnd.oma-scws-http-response": {
    "source": "iana"
  },
  "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.bcast.drm-trigger+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.bcast.imd+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.bcast.ltkm": {
    "source": "iana"
  },
  "application/vnd.oma.bcast.notification+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.bcast.provisioningtrigger": {
    "source": "iana"
  },
  "application/vnd.oma.bcast.sgboot": {
    "source": "iana"
  },
  "application/vnd.oma.bcast.sgdd+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.bcast.sgdu": {
    "source": "iana"
  },
  "application/vnd.oma.bcast.simple-symbol-container": {
    "source": "iana"
  },
  "application/vnd.oma.bcast.smartcard-trigger+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.bcast.sprov+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.bcast.stkm": {
    "source": "iana"
  },
  "application/vnd.oma.cab-address-book+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.cab-feature-handler+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.cab-pcc+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.cab-subs-invite+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.cab-user-prefs+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.dcd": {
    "source": "iana"
  },
  "application/vnd.oma.dcdc": {
    "source": "iana"
  },
  "application/vnd.oma.dd2+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "dd2"
    ]
  },
  "application/vnd.oma.drm.risd+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.group-usage-list+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.lwm2m+cbor": {
    "source": "iana"
  },
  "application/vnd.oma.lwm2m+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.lwm2m+tlv": {
    "source": "iana"
  },
  "application/vnd.oma.pal+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.poc.detailed-progress-report+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.poc.final-report+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.poc.groups+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.poc.invocation-descriptor+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.poc.optimized-progress-report+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.push": {
    "source": "iana"
  },
  "application/vnd.oma.scidm.messages+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.xcap-directory+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.omads-email+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/vnd.omads-file+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/vnd.omads-folder+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/vnd.omaloc-supl-init": {
    "source": "iana"
  },
  "application/vnd.onepager": {
    "source": "iana"
  },
  "application/vnd.onepagertamp": {
    "source": "iana"
  },
  "application/vnd.onepagertamx": {
    "source": "iana"
  },
  "application/vnd.onepagertat": {
    "source": "iana"
  },
  "application/vnd.onepagertatp": {
    "source": "iana"
  },
  "application/vnd.onepagertatx": {
    "source": "iana"
  },
  "application/vnd.openblox.game+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "obgx"
    ]
  },
  "application/vnd.openblox.game-binary": {
    "source": "iana"
  },
  "application/vnd.openeye.oeb": {
    "source": "iana"
  },
  "application/vnd.openofficeorg.extension": {
    "source": "apache",
    "extensions": [
      "oxt"
    ]
  },
  "application/vnd.openstreetmap.data+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "osm"
    ]
  },
  "application/vnd.opentimestamps.ots": {
    "source": "iana"
  },
  "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawing+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "pptx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slide": {
    "source": "iana",
    "extensions": [
      "sldx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
    "source": "iana",
    "extensions": [
      "ppsx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.template": {
    "source": "iana",
    "extensions": [
      "potx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "xlsx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
    "source": "iana",
    "extensions": [
      "xltx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.theme+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.vmldrawing": {
    "source": "iana"
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "docx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
    "source": "iana",
    "extensions": [
      "dotx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-package.core-properties+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-package.relationships+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oracle.resource+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.orange.indata": {
    "source": "iana"
  },
  "application/vnd.osa.netdeploy": {
    "source": "iana"
  },
  "application/vnd.osgeo.mapguide.package": {
    "source": "iana",
    "extensions": [
      "mgp"
    ]
  },
  "application/vnd.osgi.bundle": {
    "source": "iana"
  },
  "application/vnd.osgi.dp": {
    "source": "iana",
    "extensions": [
      "dp"
    ]
  },
  "application/vnd.osgi.subsystem": {
    "source": "iana",
    "extensions": [
      "esa"
    ]
  },
  "application/vnd.otps.ct-kip+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oxli.countgraph": {
    "source": "iana"
  },
  "application/vnd.pagerduty+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.palm": {
    "source": "iana",
    "extensions": [
      "pdb",
      "pqa",
      "oprc"
    ]
  },
  "application/vnd.panoply": {
    "source": "iana"
  },
  "application/vnd.paos.xml": {
    "source": "iana"
  },
  "application/vnd.patentdive": {
    "source": "iana"
  },
  "application/vnd.patientecommsdoc": {
    "source": "iana"
  },
  "application/vnd.pawaafile": {
    "source": "iana",
    "extensions": [
      "paw"
    ]
  },
  "application/vnd.pcos": {
    "source": "iana"
  },
  "application/vnd.pg.format": {
    "source": "iana",
    "extensions": [
      "str"
    ]
  },
  "application/vnd.pg.osasli": {
    "source": "iana",
    "extensions": [
      "ei6"
    ]
  },
  "application/vnd.piaccess.application-licence": {
    "source": "iana"
  },
  "application/vnd.picsel": {
    "source": "iana",
    "extensions": [
      "efif"
    ]
  },
  "application/vnd.pmi.widget": {
    "source": "iana",
    "extensions": [
      "wg"
    ]
  },
  "application/vnd.poc.group-advertisement+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.pocketlearn": {
    "source": "iana",
    "extensions": [
      "plf"
    ]
  },
  "application/vnd.powerbuilder6": {
    "source": "iana",
    "extensions": [
      "pbd"
    ]
  },
  "application/vnd.powerbuilder6-s": {
    "source": "iana"
  },
  "application/vnd.powerbuilder7": {
    "source": "iana"
  },
  "application/vnd.powerbuilder7-s": {
    "source": "iana"
  },
  "application/vnd.powerbuilder75": {
    "source": "iana"
  },
  "application/vnd.powerbuilder75-s": {
    "source": "iana"
  },
  "application/vnd.preminet": {
    "source": "iana"
  },
  "application/vnd.previewsystems.box": {
    "source": "iana",
    "extensions": [
      "box"
    ]
  },
  "application/vnd.proteus.magazine": {
    "source": "iana",
    "extensions": [
      "mgz"
    ]
  },
  "application/vnd.psfs": {
    "source": "iana"
  },
  "application/vnd.publishare-delta-tree": {
    "source": "iana",
    "extensions": [
      "qps"
    ]
  },
  "application/vnd.pvi.ptid1": {
    "source": "iana",
    "extensions": [
      "ptid"
    ]
  },
  "application/vnd.pwg-multiplexed": {
    "source": "iana"
  },
  "application/vnd.pwg-xhtml-print+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.qualcomm.brew-app-res": {
    "source": "iana"
  },
  "application/vnd.quarantainenet": {
    "source": "iana"
  },
  "application/vnd.quark.quarkxpress": {
    "source": "iana",
    "extensions": [
      "qxd",
      "qxt",
      "qwd",
      "qwt",
      "qxl",
      "qxb"
    ]
  },
  "application/vnd.quobject-quoxdocument": {
    "source": "iana"
  },
  "application/vnd.radisys.moml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-audit+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-audit-conf+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-audit-conn+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-audit-dialog+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-audit-stream+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-conf+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog-base+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog-fax-detect+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog-group+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog-speech+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog-transform+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.rainstor.data": {
    "source": "iana"
  },
  "application/vnd.rapid": {
    "source": "iana"
  },
  "application/vnd.rar": {
    "source": "iana",
    "extensions": [
      "rar"
    ]
  },
  "application/vnd.realvnc.bed": {
    "source": "iana",
    "extensions": [
      "bed"
    ]
  },
  "application/vnd.recordare.musicxml": {
    "source": "iana",
    "extensions": [
      "mxl"
    ]
  },
  "application/vnd.recordare.musicxml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "musicxml"
    ]
  },
  "application/vnd.renlearn.rlprint": {
    "source": "iana"
  },
  "application/vnd.resilient.logic": {
    "source": "iana"
  },
  "application/vnd.restful+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.rig.cryptonote": {
    "source": "iana",
    "extensions": [
      "cryptonote"
    ]
  },
  "application/vnd.rim.cod": {
    "source": "apache",
    "extensions": [
      "cod"
    ]
  },
  "application/vnd.rn-realmedia": {
    "source": "apache",
    "extensions": [
      "rm"
    ]
  },
  "application/vnd.rn-realmedia-vbr": {
    "source": "apache",
    "extensions": [
      "rmvb"
    ]
  },
  "application/vnd.route66.link66+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "link66"
    ]
  },
  "application/vnd.rs-274x": {
    "source": "iana"
  },
  "application/vnd.ruckus.download": {
    "source": "iana"
  },
  "application/vnd.s3sms": {
    "source": "iana"
  },
  "application/vnd.sailingtracker.track": {
    "source": "iana",
    "extensions": [
      "st"
    ]
  },
  "application/vnd.sar": {
    "source": "iana"
  },
  "application/vnd.sbm.cid": {
    "source": "iana"
  },
  "application/vnd.sbm.mid2": {
    "source": "iana"
  },
  "application/vnd.scribus": {
    "source": "iana"
  },
  "application/vnd.sealed.3df": {
    "source": "iana"
  },
  "application/vnd.sealed.csf": {
    "source": "iana"
  },
  "application/vnd.sealed.doc": {
    "source": "iana"
  },
  "application/vnd.sealed.eml": {
    "source": "iana"
  },
  "application/vnd.sealed.mht": {
    "source": "iana"
  },
  "application/vnd.sealed.net": {
    "source": "iana"
  },
  "application/vnd.sealed.ppt": {
    "source": "iana"
  },
  "application/vnd.sealed.tiff": {
    "source": "iana"
  },
  "application/vnd.sealed.xls": {
    "source": "iana"
  },
  "application/vnd.sealedmedia.softseal.html": {
    "source": "iana"
  },
  "application/vnd.sealedmedia.softseal.pdf": {
    "source": "iana"
  },
  "application/vnd.seemail": {
    "source": "iana",
    "extensions": [
      "see"
    ]
  },
  "application/vnd.seis+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.sema": {
    "source": "iana",
    "extensions": [
      "sema"
    ]
  },
  "application/vnd.semd": {
    "source": "iana",
    "extensions": [
      "semd"
    ]
  },
  "application/vnd.semf": {
    "source": "iana",
    "extensions": [
      "semf"
    ]
  },
  "application/vnd.shade-save-file": {
    "source": "iana"
  },
  "application/vnd.shana.informed.formdata": {
    "source": "iana",
    "extensions": [
      "ifm"
    ]
  },
  "application/vnd.shana.informed.formtemplate": {
    "source": "iana",
    "extensions": [
      "itp"
    ]
  },
  "application/vnd.shana.informed.interchange": {
    "source": "iana",
    "extensions": [
      "iif"
    ]
  },
  "application/vnd.shana.informed.package": {
    "source": "iana",
    "extensions": [
      "ipk"
    ]
  },
  "application/vnd.shootproof+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.shopkick+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.shp": {
    "source": "iana"
  },
  "application/vnd.shx": {
    "source": "iana"
  },
  "application/vnd.sigrok.session": {
    "source": "iana"
  },
  "application/vnd.simtech-mindmapper": {
    "source": "iana",
    "extensions": [
      "twd",
      "twds"
    ]
  },
  "application/vnd.siren+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.smaf": {
    "source": "iana",
    "extensions": [
      "mmf"
    ]
  },
  "application/vnd.smart.notebook": {
    "source": "iana"
  },
  "application/vnd.smart.teacher": {
    "source": "iana",
    "extensions": [
      "teacher"
    ]
  },
  "application/vnd.snesdev-page-table": {
    "source": "iana"
  },
  "application/vnd.software602.filler.form+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "fo"
    ]
  },
  "application/vnd.software602.filler.form-xml-zip": {
    "source": "iana"
  },
  "application/vnd.solent.sdkm+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "sdkm",
      "sdkd"
    ]
  },
  "application/vnd.spotfire.dxp": {
    "source": "iana",
    "extensions": [
      "dxp"
    ]
  },
  "application/vnd.spotfire.sfs": {
    "source": "iana",
    "extensions": [
      "sfs"
    ]
  },
  "application/vnd.sqlite3": {
    "source": "iana"
  },
  "application/vnd.sss-cod": {
    "source": "iana"
  },
  "application/vnd.sss-dtf": {
    "source": "iana"
  },
  "application/vnd.sss-ntf": {
    "source": "iana"
  },
  "application/vnd.stardivision.calc": {
    "source": "apache",
    "extensions": [
      "sdc"
    ]
  },
  "application/vnd.stardivision.draw": {
    "source": "apache",
    "extensions": [
      "sda"
    ]
  },
  "application/vnd.stardivision.impress": {
    "source": "apache",
    "extensions": [
      "sdd"
    ]
  },
  "application/vnd.stardivision.math": {
    "source": "apache",
    "extensions": [
      "smf"
    ]
  },
  "application/vnd.stardivision.writer": {
    "source": "apache",
    "extensions": [
      "sdw",
      "vor"
    ]
  },
  "application/vnd.stardivision.writer-global": {
    "source": "apache",
    "extensions": [
      "sgl"
    ]
  },
  "application/vnd.stepmania.package": {
    "source": "iana",
    "extensions": [
      "smzip"
    ]
  },
  "application/vnd.stepmania.stepchart": {
    "source": "iana",
    "extensions": [
      "sm"
    ]
  },
  "application/vnd.street-stream": {
    "source": "iana"
  },
  "application/vnd.sun.wadl+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "wadl"
    ]
  },
  "application/vnd.sun.xml.calc": {
    "source": "apache",
    "extensions": [
      "sxc"
    ]
  },
  "application/vnd.sun.xml.calc.template": {
    "source": "apache",
    "extensions": [
      "stc"
    ]
  },
  "application/vnd.sun.xml.draw": {
    "source": "apache",
    "extensions": [
      "sxd"
    ]
  },
  "application/vnd.sun.xml.draw.template": {
    "source": "apache",
    "extensions": [
      "std"
    ]
  },
  "application/vnd.sun.xml.impress": {
    "source": "apache",
    "extensions": [
      "sxi"
    ]
  },
  "application/vnd.sun.xml.impress.template": {
    "source": "apache",
    "extensions": [
      "sti"
    ]
  },
  "application/vnd.sun.xml.math": {
    "source": "apache",
    "extensions": [
      "sxm"
    ]
  },
  "application/vnd.sun.xml.writer": {
    "source": "apache",
    "extensions": [
      "sxw"
    ]
  },
  "application/vnd.sun.xml.writer.global": {
    "source": "apache",
    "extensions": [
      "sxg"
    ]
  },
  "application/vnd.sun.xml.writer.template": {
    "source": "apache",
    "extensions": [
      "stw"
    ]
  },
  "application/vnd.sus-calendar": {
    "source": "iana",
    "extensions": [
      "sus",
      "susp"
    ]
  },
  "application/vnd.svd": {
    "source": "iana",
    "extensions": [
      "svd"
    ]
  },
  "application/vnd.swiftview-ics": {
    "source": "iana"
  },
  "application/vnd.sycle+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.syft+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.symbian.install": {
    "source": "apache",
    "extensions": [
      "sis",
      "sisx"
    ]
  },
  "application/vnd.syncml+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": [
      "xsm"
    ]
  },
  "application/vnd.syncml.dm+wbxml": {
    "source": "iana",
    "charset": "UTF-8",
    "extensions": [
      "bdm"
    ]
  },
  "application/vnd.syncml.dm+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": [
      "xdm"
    ]
  },
  "application/vnd.syncml.dm.notification": {
    "source": "iana"
  },
  "application/vnd.syncml.dmddf+wbxml": {
    "source": "iana"
  },
  "application/vnd.syncml.dmddf+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": [
      "ddf"
    ]
  },
  "application/vnd.syncml.dmtnds+wbxml": {
    "source": "iana"
  },
  "application/vnd.syncml.dmtnds+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/vnd.syncml.ds.notification": {
    "source": "iana"
  },
  "application/vnd.tableschema+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.tao.intent-module-archive": {
    "source": "iana",
    "extensions": [
      "tao"
    ]
  },
  "application/vnd.tcpdump.pcap": {
    "source": "iana",
    "extensions": [
      "pcap",
      "cap",
      "dmp"
    ]
  },
  "application/vnd.think-cell.ppttc+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.tmd.mediaflex.api+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.tml": {
    "source": "iana"
  },
  "application/vnd.tmobile-livetv": {
    "source": "iana",
    "extensions": [
      "tmo"
    ]
  },
  "application/vnd.tri.onesource": {
    "source": "iana"
  },
  "application/vnd.trid.tpt": {
    "source": "iana",
    "extensions": [
      "tpt"
    ]
  },
  "application/vnd.triscape.mxs": {
    "source": "iana",
    "extensions": [
      "mxs"
    ]
  },
  "application/vnd.trueapp": {
    "source": "iana",
    "extensions": [
      "tra"
    ]
  },
  "application/vnd.truedoc": {
    "source": "iana"
  },
  "application/vnd.ubisoft.webplayer": {
    "source": "iana"
  },
  "application/vnd.ufdl": {
    "source": "iana",
    "extensions": [
      "ufd",
      "ufdl"
    ]
  },
  "application/vnd.uiq.theme": {
    "source": "iana",
    "extensions": [
      "utz"
    ]
  },
  "application/vnd.umajin": {
    "source": "iana",
    "extensions": [
      "umj"
    ]
  },
  "application/vnd.unity": {
    "source": "iana",
    "extensions": [
      "unityweb"
    ]
  },
  "application/vnd.uoml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "uoml"
    ]
  },
  "application/vnd.uplanet.alert": {
    "source": "iana"
  },
  "application/vnd.uplanet.alert-wbxml": {
    "source": "iana"
  },
  "application/vnd.uplanet.bearer-choice": {
    "source": "iana"
  },
  "application/vnd.uplanet.bearer-choice-wbxml": {
    "source": "iana"
  },
  "application/vnd.uplanet.cacheop": {
    "source": "iana"
  },
  "application/vnd.uplanet.cacheop-wbxml": {
    "source": "iana"
  },
  "application/vnd.uplanet.channel": {
    "source": "iana"
  },
  "application/vnd.uplanet.channel-wbxml": {
    "source": "iana"
  },
  "application/vnd.uplanet.list": {
    "source": "iana"
  },
  "application/vnd.uplanet.list-wbxml": {
    "source": "iana"
  },
  "application/vnd.uplanet.listcmd": {
    "source": "iana"
  },
  "application/vnd.uplanet.listcmd-wbxml": {
    "source": "iana"
  },
  "application/vnd.uplanet.signal": {
    "source": "iana"
  },
  "application/vnd.uri-map": {
    "source": "iana"
  },
  "application/vnd.valve.source.material": {
    "source": "iana"
  },
  "application/vnd.vcx": {
    "source": "iana",
    "extensions": [
      "vcx"
    ]
  },
  "application/vnd.vd-study": {
    "source": "iana"
  },
  "application/vnd.vectorworks": {
    "source": "iana"
  },
  "application/vnd.vel+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.verimatrix.vcas": {
    "source": "iana"
  },
  "application/vnd.veritone.aion+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.veryant.thin": {
    "source": "iana"
  },
  "application/vnd.ves.encrypted": {
    "source": "iana"
  },
  "application/vnd.vidsoft.vidconference": {
    "source": "iana"
  },
  "application/vnd.visio": {
    "source": "iana",
    "extensions": [
      "vsd",
      "vst",
      "vss",
      "vsw"
    ]
  },
  "application/vnd.visionary": {
    "source": "iana",
    "extensions": [
      "vis"
    ]
  },
  "application/vnd.vividence.scriptfile": {
    "source": "iana"
  },
  "application/vnd.vsf": {
    "source": "iana",
    "extensions": [
      "vsf"
    ]
  },
  "application/vnd.wap.sic": {
    "source": "iana"
  },
  "application/vnd.wap.slc": {
    "source": "iana"
  },
  "application/vnd.wap.wbxml": {
    "source": "iana",
    "charset": "UTF-8",
    "extensions": [
      "wbxml"
    ]
  },
  "application/vnd.wap.wmlc": {
    "source": "iana",
    "extensions": [
      "wmlc"
    ]
  },
  "application/vnd.wap.wmlscriptc": {
    "source": "iana",
    "extensions": [
      "wmlsc"
    ]
  },
  "application/vnd.webturbo": {
    "source": "iana",
    "extensions": [
      "wtb"
    ]
  },
  "application/vnd.wfa.dpp": {
    "source": "iana"
  },
  "application/vnd.wfa.p2p": {
    "source": "iana"
  },
  "application/vnd.wfa.wsc": {
    "source": "iana"
  },
  "application/vnd.windows.devicepairing": {
    "source": "iana"
  },
  "application/vnd.wmc": {
    "source": "iana"
  },
  "application/vnd.wmf.bootstrap": {
    "source": "iana"
  },
  "application/vnd.wolfram.mathematica": {
    "source": "iana"
  },
  "application/vnd.wolfram.mathematica.package": {
    "source": "iana"
  },
  "application/vnd.wolfram.player": {
    "source": "iana",
    "extensions": [
      "nbp"
    ]
  },
  "application/vnd.wordperfect": {
    "source": "iana",
    "extensions": [
      "wpd"
    ]
  },
  "application/vnd.wqd": {
    "source": "iana",
    "extensions": [
      "wqd"
    ]
  },
  "application/vnd.wrq-hp3000-labelled": {
    "source": "iana"
  },
  "application/vnd.wt.stf": {
    "source": "iana",
    "extensions": [
      "stf"
    ]
  },
  "application/vnd.wv.csp+wbxml": {
    "source": "iana"
  },
  "application/vnd.wv.csp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.wv.ssp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.xacml+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.xara": {
    "source": "iana",
    "extensions": [
      "xar"
    ]
  },
  "application/vnd.xfdl": {
    "source": "iana",
    "extensions": [
      "xfdl"
    ]
  },
  "application/vnd.xfdl.webform": {
    "source": "iana"
  },
  "application/vnd.xmi+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.xmpie.cpkg": {
    "source": "iana"
  },
  "application/vnd.xmpie.dpkg": {
    "source": "iana"
  },
  "application/vnd.xmpie.plan": {
    "source": "iana"
  },
  "application/vnd.xmpie.ppkg": {
    "source": "iana"
  },
  "application/vnd.xmpie.xlim": {
    "source": "iana"
  },
  "application/vnd.yamaha.hv-dic": {
    "source": "iana",
    "extensions": [
      "hvd"
    ]
  },
  "application/vnd.yamaha.hv-script": {
    "source": "iana",
    "extensions": [
      "hvs"
    ]
  },
  "application/vnd.yamaha.hv-voice": {
    "source": "iana",
    "extensions": [
      "hvp"
    ]
  },
  "application/vnd.yamaha.openscoreformat": {
    "source": "iana",
    "extensions": [
      "osf"
    ]
  },
  "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "osfpvg"
    ]
  },
  "application/vnd.yamaha.remote-setup": {
    "source": "iana"
  },
  "application/vnd.yamaha.smaf-audio": {
    "source": "iana",
    "extensions": [
      "saf"
    ]
  },
  "application/vnd.yamaha.smaf-phrase": {
    "source": "iana",
    "extensions": [
      "spf"
    ]
  },
  "application/vnd.yamaha.through-ngn": {
    "source": "iana"
  },
  "application/vnd.yamaha.tunnel-udpencap": {
    "source": "iana"
  },
  "application/vnd.yaoweme": {
    "source": "iana"
  },
  "application/vnd.yellowriver-custom-menu": {
    "source": "iana",
    "extensions": [
      "cmp"
    ]
  },
  "application/vnd.youtube.yt": {
    "source": "iana"
  },
  "application/vnd.zul": {
    "source": "iana",
    "extensions": [
      "zir",
      "zirz"
    ]
  },
  "application/vnd.zzazz.deck+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "zaz"
    ]
  },
  "application/voicexml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "vxml"
    ]
  },
  "application/voucher-cms+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vq-rtcpxr": {
    "source": "iana"
  },
  "application/wasm": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "wasm"
    ]
  },
  "application/watcherinfo+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "wif"
    ]
  },
  "application/webpush-options+json": {
    "source": "iana",
    "compressible": true
  },
  "application/whoispp-query": {
    "source": "iana"
  },
  "application/whoispp-response": {
    "source": "iana"
  },
  "application/widget": {
    "source": "iana",
    "extensions": [
      "wgt"
    ]
  },
  "application/winhlp": {
    "source": "apache",
    "extensions": [
      "hlp"
    ]
  },
  "application/wita": {
    "source": "iana"
  },
  "application/wordperfect5.1": {
    "source": "iana"
  },
  "application/wsdl+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "wsdl"
    ]
  },
  "application/wspolicy+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "wspolicy"
    ]
  },
  "application/x-7z-compressed": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "7z"
    ]
  },
  "application/x-abiword": {
    "source": "apache",
    "extensions": [
      "abw"
    ]
  },
  "application/x-ace-compressed": {
    "source": "apache",
    "extensions": [
      "ace"
    ]
  },
  "application/x-amf": {
    "source": "apache"
  },
  "application/x-apple-diskimage": {
    "source": "apache",
    "extensions": [
      "dmg"
    ]
  },
  "application/x-arj": {
    "compressible": false,
    "extensions": [
      "arj"
    ]
  },
  "application/x-authorware-bin": {
    "source": "apache",
    "extensions": [
      "aab",
      "x32",
      "u32",
      "vox"
    ]
  },
  "application/x-authorware-map": {
    "source": "apache",
    "extensions": [
      "aam"
    ]
  },
  "application/x-authorware-seg": {
    "source": "apache",
    "extensions": [
      "aas"
    ]
  },
  "application/x-bcpio": {
    "source": "apache",
    "extensions": [
      "bcpio"
    ]
  },
  "application/x-bdoc": {
    "compressible": false,
    "extensions": [
      "bdoc"
    ]
  },
  "application/x-bittorrent": {
    "source": "apache",
    "extensions": [
      "torrent"
    ]
  },
  "application/x-blorb": {
    "source": "apache",
    "extensions": [
      "blb",
      "blorb"
    ]
  },
  "application/x-bzip": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "bz"
    ]
  },
  "application/x-bzip2": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "bz2",
      "boz"
    ]
  },
  "application/x-cbr": {
    "source": "apache",
    "extensions": [
      "cbr",
      "cba",
      "cbt",
      "cbz",
      "cb7"
    ]
  },
  "application/x-cdlink": {
    "source": "apache",
    "extensions": [
      "vcd"
    ]
  },
  "application/x-cfs-compressed": {
    "source": "apache",
    "extensions": [
      "cfs"
    ]
  },
  "application/x-chat": {
    "source": "apache",
    "extensions": [
      "chat"
    ]
  },
  "application/x-chess-pgn": {
    "source": "apache",
    "extensions": [
      "pgn"
    ]
  },
  "application/x-chrome-extension": {
    "extensions": [
      "crx"
    ]
  },
  "application/x-cocoa": {
    "source": "nginx",
    "extensions": [
      "cco"
    ]
  },
  "application/x-compress": {
    "source": "apache"
  },
  "application/x-conference": {
    "source": "apache",
    "extensions": [
      "nsc"
    ]
  },
  "application/x-cpio": {
    "source": "apache",
    "extensions": [
      "cpio"
    ]
  },
  "application/x-csh": {
    "source": "apache",
    "extensions": [
      "csh"
    ]
  },
  "application/x-deb": {
    "compressible": false
  },
  "application/x-debian-package": {
    "source": "apache",
    "extensions": [
      "deb",
      "udeb"
    ]
  },
  "application/x-dgc-compressed": {
    "source": "apache",
    "extensions": [
      "dgc"
    ]
  },
  "application/x-director": {
    "source": "apache",
    "extensions": [
      "dir",
      "dcr",
      "dxr",
      "cst",
      "cct",
      "cxt",
      "w3d",
      "fgd",
      "swa"
    ]
  },
  "application/x-doom": {
    "source": "apache",
    "extensions": [
      "wad"
    ]
  },
  "application/x-dtbncx+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": [
      "ncx"
    ]
  },
  "application/x-dtbook+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": [
      "dtb"
    ]
  },
  "application/x-dtbresource+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": [
      "res"
    ]
  },
  "application/x-dvi": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "dvi"
    ]
  },
  "application/x-envoy": {
    "source": "apache",
    "extensions": [
      "evy"
    ]
  },
  "application/x-eva": {
    "source": "apache",
    "extensions": [
      "eva"
    ]
  },
  "application/x-font-bdf": {
    "source": "apache",
    "extensions": [
      "bdf"
    ]
  },
  "application/x-font-dos": {
    "source": "apache"
  },
  "application/x-font-framemaker": {
    "source": "apache"
  },
  "application/x-font-ghostscript": {
    "source": "apache",
    "extensions": [
      "gsf"
    ]
  },
  "application/x-font-libgrx": {
    "source": "apache"
  },
  "application/x-font-linux-psf": {
    "source": "apache",
    "extensions": [
      "psf"
    ]
  },
  "application/x-font-pcf": {
    "source": "apache",
    "extensions": [
      "pcf"
    ]
  },
  "application/x-font-snf": {
    "source": "apache",
    "extensions": [
      "snf"
    ]
  },
  "application/x-font-speedo": {
    "source": "apache"
  },
  "application/x-font-sunos-news": {
    "source": "apache"
  },
  "application/x-font-type1": {
    "source": "apache",
    "extensions": [
      "pfa",
      "pfb",
      "pfm",
      "afm"
    ]
  },
  "application/x-font-vfont": {
    "source": "apache"
  },
  "application/x-freearc": {
    "source": "apache",
    "extensions": [
      "arc"
    ]
  },
  "application/x-futuresplash": {
    "source": "apache",
    "extensions": [
      "spl"
    ]
  },
  "application/x-gca-compressed": {
    "source": "apache",
    "extensions": [
      "gca"
    ]
  },
  "application/x-glulx": {
    "source": "apache",
    "extensions": [
      "ulx"
    ]
  },
  "application/x-gnumeric": {
    "source": "apache",
    "extensions": [
      "gnumeric"
    ]
  },
  "application/x-gramps-xml": {
    "source": "apache",
    "extensions": [
      "gramps"
    ]
  },
  "application/x-gtar": {
    "source": "apache",
    "extensions": [
      "gtar"
    ]
  },
  "application/x-gzip": {
    "source": "apache"
  },
  "application/x-hdf": {
    "source": "apache",
    "extensions": [
      "hdf"
    ]
  },
  "application/x-httpd-php": {
    "compressible": true,
    "extensions": [
      "php"
    ]
  },
  "application/x-install-instructions": {
    "source": "apache",
    "extensions": [
      "install"
    ]
  },
  "application/x-iso9660-image": {
    "source": "apache",
    "extensions": [
      "iso"
    ]
  },
  "application/x-iwork-keynote-sffkey": {
    "extensions": [
      "key"
    ]
  },
  "application/x-iwork-numbers-sffnumbers": {
    "extensions": [
      "numbers"
    ]
  },
  "application/x-iwork-pages-sffpages": {
    "extensions": [
      "pages"
    ]
  },
  "application/x-java-archive-diff": {
    "source": "nginx",
    "extensions": [
      "jardiff"
    ]
  },
  "application/x-java-jnlp-file": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "jnlp"
    ]
  },
  "application/x-javascript": {
    "compressible": true
  },
  "application/x-keepass2": {
    "extensions": [
      "kdbx"
    ]
  },
  "application/x-latex": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "latex"
    ]
  },
  "application/x-lua-bytecode": {
    "extensions": [
      "luac"
    ]
  },
  "application/x-lzh-compressed": {
    "source": "apache",
    "extensions": [
      "lzh",
      "lha"
    ]
  },
  "application/x-makeself": {
    "source": "nginx",
    "extensions": [
      "run"
    ]
  },
  "application/x-mie": {
    "source": "apache",
    "extensions": [
      "mie"
    ]
  },
  "application/x-mobipocket-ebook": {
    "source": "apache",
    "extensions": [
      "prc",
      "mobi"
    ]
  },
  "application/x-mpegurl": {
    "compressible": false
  },
  "application/x-ms-application": {
    "source": "apache",
    "extensions": [
      "application"
    ]
  },
  "application/x-ms-shortcut": {
    "source": "apache",
    "extensions": [
      "lnk"
    ]
  },
  "application/x-ms-wmd": {
    "source": "apache",
    "extensions": [
      "wmd"
    ]
  },
  "application/x-ms-wmz": {
    "source": "apache",
    "extensions": [
      "wmz"
    ]
  },
  "application/x-ms-xbap": {
    "source": "apache",
    "extensions": [
      "xbap"
    ]
  },
  "application/x-msaccess": {
    "source": "apache",
    "extensions": [
      "mdb"
    ]
  },
  "application/x-msbinder": {
    "source": "apache",
    "extensions": [
      "obd"
    ]
  },
  "application/x-mscardfile": {
    "source": "apache",
    "extensions": [
      "crd"
    ]
  },
  "application/x-msclip": {
    "source": "apache",
    "extensions": [
      "clp"
    ]
  },
  "application/x-msdos-program": {
    "extensions": [
      "exe"
    ]
  },
  "application/x-msdownload": {
    "source": "apache",
    "extensions": [
      "exe",
      "dll",
      "com",
      "bat",
      "msi"
    ]
  },
  "application/x-msmediaview": {
    "source": "apache",
    "extensions": [
      "mvb",
      "m13",
      "m14"
    ]
  },
  "application/x-msmetafile": {
    "source": "apache",
    "extensions": [
      "wmf",
      "wmz",
      "emf",
      "emz"
    ]
  },
  "application/x-msmoney": {
    "source": "apache",
    "extensions": [
      "mny"
    ]
  },
  "application/x-mspublisher": {
    "source": "apache",
    "extensions": [
      "pub"
    ]
  },
  "application/x-msschedule": {
    "source": "apache",
    "extensions": [
      "scd"
    ]
  },
  "application/x-msterminal": {
    "source": "apache",
    "extensions": [
      "trm"
    ]
  },
  "application/x-mswrite": {
    "source": "apache",
    "extensions": [
      "wri"
    ]
  },
  "application/x-netcdf": {
    "source": "apache",
    "extensions": [
      "nc",
      "cdf"
    ]
  },
  "application/x-ns-proxy-autoconfig": {
    "compressible": true,
    "extensions": [
      "pac"
    ]
  },
  "application/x-nzb": {
    "source": "apache",
    "extensions": [
      "nzb"
    ]
  },
  "application/x-perl": {
    "source": "nginx",
    "extensions": [
      "pl",
      "pm"
    ]
  },
  "application/x-pilot": {
    "source": "nginx",
    "extensions": [
      "prc",
      "pdb"
    ]
  },
  "application/x-pkcs12": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "p12",
      "pfx"
    ]
  },
  "application/x-pkcs7-certificates": {
    "source": "apache",
    "extensions": [
      "p7b",
      "spc"
    ]
  },
  "application/x-pkcs7-certreqresp": {
    "source": "apache",
    "extensions": [
      "p7r"
    ]
  },
  "application/x-pki-message": {
    "source": "iana"
  },
  "application/x-rar-compressed": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "rar"
    ]
  },
  "application/x-redhat-package-manager": {
    "source": "nginx",
    "extensions": [
      "rpm"
    ]
  },
  "application/x-research-info-systems": {
    "source": "apache",
    "extensions": [
      "ris"
    ]
  },
  "application/x-sea": {
    "source": "nginx",
    "extensions": [
      "sea"
    ]
  },
  "application/x-sh": {
    "source": "apache",
    "compressible": true,
    "extensions": [
      "sh"
    ]
  },
  "application/x-shar": {
    "source": "apache",
    "extensions": [
      "shar"
    ]
  },
  "application/x-shockwave-flash": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "swf"
    ]
  },
  "application/x-silverlight-app": {
    "source": "apache",
    "extensions": [
      "xap"
    ]
  },
  "application/x-sql": {
    "source": "apache",
    "extensions": [
      "sql"
    ]
  },
  "application/x-stuffit": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "sit"
    ]
  },
  "application/x-stuffitx": {
    "source": "apache",
    "extensions": [
      "sitx"
    ]
  },
  "application/x-subrip": {
    "source": "apache",
    "extensions": [
      "srt"
    ]
  },
  "application/x-sv4cpio": {
    "source": "apache",
    "extensions": [
      "sv4cpio"
    ]
  },
  "application/x-sv4crc": {
    "source": "apache",
    "extensions": [
      "sv4crc"
    ]
  },
  "application/x-t3vm-image": {
    "source": "apache",
    "extensions": [
      "t3"
    ]
  },
  "application/x-tads": {
    "source": "apache",
    "extensions": [
      "gam"
    ]
  },
  "application/x-tar": {
    "source": "apache",
    "compressible": true,
    "extensions": [
      "tar"
    ]
  },
  "application/x-tcl": {
    "source": "apache",
    "extensions": [
      "tcl",
      "tk"
    ]
  },
  "application/x-tex": {
    "source": "apache",
    "extensions": [
      "tex"
    ]
  },
  "application/x-tex-tfm": {
    "source": "apache",
    "extensions": [
      "tfm"
    ]
  },
  "application/x-texinfo": {
    "source": "apache",
    "extensions": [
      "texinfo",
      "texi"
    ]
  },
  "application/x-tgif": {
    "source": "apache",
    "extensions": [
      "obj"
    ]
  },
  "application/x-ustar": {
    "source": "apache",
    "extensions": [
      "ustar"
    ]
  },
  "application/x-virtualbox-hdd": {
    "compressible": true,
    "extensions": [
      "hdd"
    ]
  },
  "application/x-virtualbox-ova": {
    "compressible": true,
    "extensions": [
      "ova"
    ]
  },
  "application/x-virtualbox-ovf": {
    "compressible": true,
    "extensions": [
      "ovf"
    ]
  },
  "application/x-virtualbox-vbox": {
    "compressible": true,
    "extensions": [
      "vbox"
    ]
  },
  "application/x-virtualbox-vbox-extpack": {
    "compressible": false,
    "extensions": [
      "vbox-extpack"
    ]
  },
  "application/x-virtualbox-vdi": {
    "compressible": true,
    "extensions": [
      "vdi"
    ]
  },
  "application/x-virtualbox-vhd": {
    "compressible": true,
    "extensions": [
      "vhd"
    ]
  },
  "application/x-virtualbox-vmdk": {
    "compressible": true,
    "extensions": [
      "vmdk"
    ]
  },
  "application/x-wais-source": {
    "source": "apache",
    "extensions": [
      "src"
    ]
  },
  "application/x-web-app-manifest+json": {
    "compressible": true,
    "extensions": [
      "webapp"
    ]
  },
  "application/x-www-form-urlencoded": {
    "source": "iana",
    "compressible": true
  },
  "application/x-x509-ca-cert": {
    "source": "iana",
    "extensions": [
      "der",
      "crt",
      "pem"
    ]
  },
  "application/x-x509-ca-ra-cert": {
    "source": "iana"
  },
  "application/x-x509-next-ca-cert": {
    "source": "iana"
  },
  "application/x-xfig": {
    "source": "apache",
    "extensions": [
      "fig"
    ]
  },
  "application/x-xliff+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": [
      "xlf"
    ]
  },
  "application/x-xpinstall": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "xpi"
    ]
  },
  "application/x-xz": {
    "source": "apache",
    "extensions": [
      "xz"
    ]
  },
  "application/x-zmachine": {
    "source": "apache",
    "extensions": [
      "z1",
      "z2",
      "z3",
      "z4",
      "z5",
      "z6",
      "z7",
      "z8"
    ]
  },
  "application/x400-bp": {
    "source": "iana"
  },
  "application/xacml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/xaml+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": [
      "xaml"
    ]
  },
  "application/xcap-att+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "xav"
    ]
  },
  "application/xcap-caps+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "xca"
    ]
  },
  "application/xcap-diff+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "xdf"
    ]
  },
  "application/xcap-el+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "xel"
    ]
  },
  "application/xcap-error+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/xcap-ns+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "xns"
    ]
  },
  "application/xcon-conference-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/xcon-conference-info-diff+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/xenc+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "xenc"
    ]
  },
  "application/xhtml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "xhtml",
      "xht"
    ]
  },
  "application/xhtml-voice+xml": {
    "source": "apache",
    "compressible": true
  },
  "application/xliff+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "xlf"
    ]
  },
  "application/xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "xml",
      "xsl",
      "xsd",
      "rng"
    ]
  },
  "application/xml-dtd": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "dtd"
    ]
  },
  "application/xml-external-parsed-entity": {
    "source": "iana"
  },
  "application/xml-patch+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/xmpp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/xop+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "xop"
    ]
  },
  "application/xproc+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": [
      "xpl"
    ]
  },
  "application/xslt+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "xsl",
      "xslt"
    ]
  },
  "application/xspf+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": [
      "xspf"
    ]
  },
  "application/xv+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "mxml",
      "xhvml",
      "xvml",
      "xvm"
    ]
  },
  "application/yang": {
    "source": "iana",
    "extensions": [
      "yang"
    ]
  },
  "application/yang-data+json": {
    "source": "iana",
    "compressible": true
  },
  "application/yang-data+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/yang-patch+json": {
    "source": "iana",
    "compressible": true
  },
  "application/yang-patch+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/yin+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "yin"
    ]
  },
  "application/zip": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "zip"
    ]
  },
  "application/zlib": {
    "source": "iana"
  },
  "application/zstd": {
    "source": "iana"
  },
  "audio/1d-interleaved-parityfec": {
    "source": "iana"
  },
  "audio/32kadpcm": {
    "source": "iana"
  },
  "audio/3gpp": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "3gpp"
    ]
  },
  "audio/3gpp2": {
    "source": "iana"
  },
  "audio/aac": {
    "source": "iana"
  },
  "audio/ac3": {
    "source": "iana"
  },
  "audio/adpcm": {
    "source": "apache",
    "extensions": [
      "adp"
    ]
  },
  "audio/amr": {
    "source": "iana",
    "extensions": [
      "amr"
    ]
  },
  "audio/amr-wb": {
    "source": "iana"
  },
  "audio/amr-wb+": {
    "source": "iana"
  },
  "audio/aptx": {
    "source": "iana"
  },
  "audio/asc": {
    "source": "iana"
  },
  "audio/atrac-advanced-lossless": {
    "source": "iana"
  },
  "audio/atrac-x": {
    "source": "iana"
  },
  "audio/atrac3": {
    "source": "iana"
  },
  "audio/basic": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "au",
      "snd"
    ]
  },
  "audio/bv16": {
    "source": "iana"
  },
  "audio/bv32": {
    "source": "iana"
  },
  "audio/clearmode": {
    "source": "iana"
  },
  "audio/cn": {
    "source": "iana"
  },
  "audio/dat12": {
    "source": "iana"
  },
  "audio/dls": {
    "source": "iana"
  },
  "audio/dsr-es201108": {
    "source": "iana"
  },
  "audio/dsr-es202050": {
    "source": "iana"
  },
  "audio/dsr-es202211": {
    "source": "iana"
  },
  "audio/dsr-es202212": {
    "source": "iana"
  },
  "audio/dv": {
    "source": "iana"
  },
  "audio/dvi4": {
    "source": "iana"
  },
  "audio/eac3": {
    "source": "iana"
  },
  "audio/encaprtp": {
    "source": "iana"
  },
  "audio/evrc": {
    "source": "iana"
  },
  "audio/evrc-qcp": {
    "source": "iana"
  },
  "audio/evrc0": {
    "source": "iana"
  },
  "audio/evrc1": {
    "source": "iana"
  },
  "audio/evrcb": {
    "source": "iana"
  },
  "audio/evrcb0": {
    "source": "iana"
  },
  "audio/evrcb1": {
    "source": "iana"
  },
  "audio/evrcnw": {
    "source": "iana"
  },
  "audio/evrcnw0": {
    "source": "iana"
  },
  "audio/evrcnw1": {
    "source": "iana"
  },
  "audio/evrcwb": {
    "source": "iana"
  },
  "audio/evrcwb0": {
    "source": "iana"
  },
  "audio/evrcwb1": {
    "source": "iana"
  },
  "audio/evs": {
    "source": "iana"
  },
  "audio/flexfec": {
    "source": "iana"
  },
  "audio/fwdred": {
    "source": "iana"
  },
  "audio/g711-0": {
    "source": "iana"
  },
  "audio/g719": {
    "source": "iana"
  },
  "audio/g722": {
    "source": "iana"
  },
  "audio/g7221": {
    "source": "iana"
  },
  "audio/g723": {
    "source": "iana"
  },
  "audio/g726-16": {
    "source": "iana"
  },
  "audio/g726-24": {
    "source": "iana"
  },
  "audio/g726-32": {
    "source": "iana"
  },
  "audio/g726-40": {
    "source": "iana"
  },
  "audio/g728": {
    "source": "iana"
  },
  "audio/g729": {
    "source": "iana"
  },
  "audio/g7291": {
    "source": "iana"
  },
  "audio/g729d": {
    "source": "iana"
  },
  "audio/g729e": {
    "source": "iana"
  },
  "audio/gsm": {
    "source": "iana"
  },
  "audio/gsm-efr": {
    "source": "iana"
  },
  "audio/gsm-hr-08": {
    "source": "iana"
  },
  "audio/ilbc": {
    "source": "iana"
  },
  "audio/ip-mr_v2.5": {
    "source": "iana"
  },
  "audio/isac": {
    "source": "apache"
  },
  "audio/l16": {
    "source": "iana"
  },
  "audio/l20": {
    "source": "iana"
  },
  "audio/l24": {
    "source": "iana",
    "compressible": false
  },
  "audio/l8": {
    "source": "iana"
  },
  "audio/lpc": {
    "source": "iana"
  },
  "audio/melp": {
    "source": "iana"
  },
  "audio/melp1200": {
    "source": "iana"
  },
  "audio/melp2400": {
    "source": "iana"
  },
  "audio/melp600": {
    "source": "iana"
  },
  "audio/mhas": {
    "source": "iana"
  },
  "audio/midi": {
    "source": "apache",
    "extensions": [
      "mid",
      "midi",
      "kar",
      "rmi"
    ]
  },
  "audio/mobile-xmf": {
    "source": "iana",
    "extensions": [
      "mxmf"
    ]
  },
  "audio/mp3": {
    "compressible": false,
    "extensions": [
      "mp3"
    ]
  },
  "audio/mp4": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "m4a",
      "mp4a"
    ]
  },
  "audio/mp4a-latm": {
    "source": "iana"
  },
  "audio/mpa": {
    "source": "iana"
  },
  "audio/mpa-robust": {
    "source": "iana"
  },
  "audio/mpeg": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "mpga",
      "mp2",
      "mp2a",
      "mp3",
      "m2a",
      "m3a"
    ]
  },
  "audio/mpeg4-generic": {
    "source": "iana"
  },
  "audio/musepack": {
    "source": "apache"
  },
  "audio/ogg": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "oga",
      "ogg",
      "spx",
      "opus"
    ]
  },
  "audio/opus": {
    "source": "iana"
  },
  "audio/parityfec": {
    "source": "iana"
  },
  "audio/pcma": {
    "source": "iana"
  },
  "audio/pcma-wb": {
    "source": "iana"
  },
  "audio/pcmu": {
    "source": "iana"
  },
  "audio/pcmu-wb": {
    "source": "iana"
  },
  "audio/prs.sid": {
    "source": "iana"
  },
  "audio/qcelp": {
    "source": "iana"
  },
  "audio/raptorfec": {
    "source": "iana"
  },
  "audio/red": {
    "source": "iana"
  },
  "audio/rtp-enc-aescm128": {
    "source": "iana"
  },
  "audio/rtp-midi": {
    "source": "iana"
  },
  "audio/rtploopback": {
    "source": "iana"
  },
  "audio/rtx": {
    "source": "iana"
  },
  "audio/s3m": {
    "source": "apache",
    "extensions": [
      "s3m"
    ]
  },
  "audio/scip": {
    "source": "iana"
  },
  "audio/silk": {
    "source": "apache",
    "extensions": [
      "sil"
    ]
  },
  "audio/smv": {
    "source": "iana"
  },
  "audio/smv-qcp": {
    "source": "iana"
  },
  "audio/smv0": {
    "source": "iana"
  },
  "audio/sofa": {
    "source": "iana"
  },
  "audio/sp-midi": {
    "source": "iana"
  },
  "audio/speex": {
    "source": "iana"
  },
  "audio/t140c": {
    "source": "iana"
  },
  "audio/t38": {
    "source": "iana"
  },
  "audio/telephone-event": {
    "source": "iana"
  },
  "audio/tetra_acelp": {
    "source": "iana"
  },
  "audio/tetra_acelp_bb": {
    "source": "iana"
  },
  "audio/tone": {
    "source": "iana"
  },
  "audio/tsvcis": {
    "source": "iana"
  },
  "audio/uemclip": {
    "source": "iana"
  },
  "audio/ulpfec": {
    "source": "iana"
  },
  "audio/usac": {
    "source": "iana"
  },
  "audio/vdvi": {
    "source": "iana"
  },
  "audio/vmr-wb": {
    "source": "iana"
  },
  "audio/vnd.3gpp.iufp": {
    "source": "iana"
  },
  "audio/vnd.4sb": {
    "source": "iana"
  },
  "audio/vnd.audiokoz": {
    "source": "iana"
  },
  "audio/vnd.celp": {
    "source": "iana"
  },
  "audio/vnd.cisco.nse": {
    "source": "iana"
  },
  "audio/vnd.cmles.radio-events": {
    "source": "iana"
  },
  "audio/vnd.cns.anp1": {
    "source": "iana"
  },
  "audio/vnd.cns.inf1": {
    "source": "iana"
  },
  "audio/vnd.dece.audio": {
    "source": "iana",
    "extensions": [
      "uva",
      "uvva"
    ]
  },
  "audio/vnd.digital-winds": {
    "source": "iana",
    "extensions": [
      "eol"
    ]
  },
  "audio/vnd.dlna.adts": {
    "source": "iana"
  },
  "audio/vnd.dolby.heaac.1": {
    "source": "iana"
  },
  "audio/vnd.dolby.heaac.2": {
    "source": "iana"
  },
  "audio/vnd.dolby.mlp": {
    "source": "iana"
  },
  "audio/vnd.dolby.mps": {
    "source": "iana"
  },
  "audio/vnd.dolby.pl2": {
    "source": "iana"
  },
  "audio/vnd.dolby.pl2x": {
    "source": "iana"
  },
  "audio/vnd.dolby.pl2z": {
    "source": "iana"
  },
  "audio/vnd.dolby.pulse.1": {
    "source": "iana"
  },
  "audio/vnd.dra": {
    "source": "iana",
    "extensions": [
      "dra"
    ]
  },
  "audio/vnd.dts": {
    "source": "iana",
    "extensions": [
      "dts"
    ]
  },
  "audio/vnd.dts.hd": {
    "source": "iana",
    "extensions": [
      "dtshd"
    ]
  },
  "audio/vnd.dts.uhd": {
    "source": "iana"
  },
  "audio/vnd.dvb.file": {
    "source": "iana"
  },
  "audio/vnd.everad.plj": {
    "source": "iana"
  },
  "audio/vnd.hns.audio": {
    "source": "iana"
  },
  "audio/vnd.lucent.voice": {
    "source": "iana",
    "extensions": [
      "lvp"
    ]
  },
  "audio/vnd.ms-playready.media.pya": {
    "source": "iana",
    "extensions": [
      "pya"
    ]
  },
  "audio/vnd.nokia.mobile-xmf": {
    "source": "iana"
  },
  "audio/vnd.nortel.vbk": {
    "source": "iana"
  },
  "audio/vnd.nuera.ecelp4800": {
    "source": "iana",
    "extensions": [
      "ecelp4800"
    ]
  },
  "audio/vnd.nuera.ecelp7470": {
    "source": "iana",
    "extensions": [
      "ecelp7470"
    ]
  },
  "audio/vnd.nuera.ecelp9600": {
    "source": "iana",
    "extensions": [
      "ecelp9600"
    ]
  },
  "audio/vnd.octel.sbc": {
    "source": "iana"
  },
  "audio/vnd.presonus.multitrack": {
    "source": "iana"
  },
  "audio/vnd.qcelp": {
    "source": "iana"
  },
  "audio/vnd.rhetorex.32kadpcm": {
    "source": "iana"
  },
  "audio/vnd.rip": {
    "source": "iana",
    "extensions": [
      "rip"
    ]
  },
  "audio/vnd.rn-realaudio": {
    "compressible": false
  },
  "audio/vnd.sealedmedia.softseal.mpeg": {
    "source": "iana"
  },
  "audio/vnd.vmx.cvsd": {
    "source": "iana"
  },
  "audio/vnd.wave": {
    "compressible": false
  },
  "audio/vorbis": {
    "source": "iana",
    "compressible": false
  },
  "audio/vorbis-config": {
    "source": "iana"
  },
  "audio/wav": {
    "compressible": false,
    "extensions": [
      "wav"
    ]
  },
  "audio/wave": {
    "compressible": false,
    "extensions": [
      "wav"
    ]
  },
  "audio/webm": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "weba"
    ]
  },
  "audio/x-aac": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "aac"
    ]
  },
  "audio/x-aiff": {
    "source": "apache",
    "extensions": [
      "aif",
      "aiff",
      "aifc"
    ]
  },
  "audio/x-caf": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "caf"
    ]
  },
  "audio/x-flac": {
    "source": "apache",
    "extensions": [
      "flac"
    ]
  },
  "audio/x-m4a": {
    "source": "nginx",
    "extensions": [
      "m4a"
    ]
  },
  "audio/x-matroska": {
    "source": "apache",
    "extensions": [
      "mka"
    ]
  },
  "audio/x-mpegurl": {
    "source": "apache",
    "extensions": [
      "m3u"
    ]
  },
  "audio/x-ms-wax": {
    "source": "apache",
    "extensions": [
      "wax"
    ]
  },
  "audio/x-ms-wma": {
    "source": "apache",
    "extensions": [
      "wma"
    ]
  },
  "audio/x-pn-realaudio": {
    "source": "apache",
    "extensions": [
      "ram",
      "ra"
    ]
  },
  "audio/x-pn-realaudio-plugin": {
    "source": "apache",
    "extensions": [
      "rmp"
    ]
  },
  "audio/x-realaudio": {
    "source": "nginx",
    "extensions": [
      "ra"
    ]
  },
  "audio/x-tta": {
    "source": "apache"
  },
  "audio/x-wav": {
    "source": "apache",
    "extensions": [
      "wav"
    ]
  },
  "audio/xm": {
    "source": "apache",
    "extensions": [
      "xm"
    ]
  },
  "chemical/x-cdx": {
    "source": "apache",
    "extensions": [
      "cdx"
    ]
  },
  "chemical/x-cif": {
    "source": "apache",
    "extensions": [
      "cif"
    ]
  },
  "chemical/x-cmdf": {
    "source": "apache",
    "extensions": [
      "cmdf"
    ]
  },
  "chemical/x-cml": {
    "source": "apache",
    "extensions": [
      "cml"
    ]
  },
  "chemical/x-csml": {
    "source": "apache",
    "extensions": [
      "csml"
    ]
  },
  "chemical/x-pdb": {
    "source": "apache"
  },
  "chemical/x-xyz": {
    "source": "apache",
    "extensions": [
      "xyz"
    ]
  },
  "font/collection": {
    "source": "iana",
    "extensions": [
      "ttc"
    ]
  },
  "font/otf": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "otf"
    ]
  },
  "font/sfnt": {
    "source": "iana"
  },
  "font/ttf": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "ttf"
    ]
  },
  "font/woff": {
    "source": "iana",
    "extensions": [
      "woff"
    ]
  },
  "font/woff2": {
    "source": "iana",
    "extensions": [
      "woff2"
    ]
  },
  "image/aces": {
    "source": "iana",
    "extensions": [
      "exr"
    ]
  },
  "image/apng": {
    "compressible": false,
    "extensions": [
      "apng"
    ]
  },
  "image/avci": {
    "source": "iana",
    "extensions": [
      "avci"
    ]
  },
  "image/avcs": {
    "source": "iana",
    "extensions": [
      "avcs"
    ]
  },
  "image/avif": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "avif"
    ]
  },
  "image/bmp": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "bmp"
    ]
  },
  "image/cgm": {
    "source": "iana",
    "extensions": [
      "cgm"
    ]
  },
  "image/dicom-rle": {
    "source": "iana",
    "extensions": [
      "drle"
    ]
  },
  "image/emf": {
    "source": "iana",
    "extensions": [
      "emf"
    ]
  },
  "image/fits": {
    "source": "iana",
    "extensions": [
      "fits"
    ]
  },
  "image/g3fax": {
    "source": "iana",
    "extensions": [
      "g3"
    ]
  },
  "image/gif": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "gif"
    ]
  },
  "image/heic": {
    "source": "iana",
    "extensions": [
      "heic"
    ]
  },
  "image/heic-sequence": {
    "source": "iana",
    "extensions": [
      "heics"
    ]
  },
  "image/heif": {
    "source": "iana",
    "extensions": [
      "heif"
    ]
  },
  "image/heif-sequence": {
    "source": "iana",
    "extensions": [
      "heifs"
    ]
  },
  "image/hej2k": {
    "source": "iana",
    "extensions": [
      "hej2"
    ]
  },
  "image/hsj2": {
    "source": "iana",
    "extensions": [
      "hsj2"
    ]
  },
  "image/ief": {
    "source": "iana",
    "extensions": [
      "ief"
    ]
  },
  "image/jls": {
    "source": "iana",
    "extensions": [
      "jls"
    ]
  },
  "image/jp2": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "jp2",
      "jpg2"
    ]
  },
  "image/jpeg": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "jpeg",
      "jpg",
      "jpe"
    ]
  },
  "image/jph": {
    "source": "iana",
    "extensions": [
      "jph"
    ]
  },
  "image/jphc": {
    "source": "iana",
    "extensions": [
      "jhc"
    ]
  },
  "image/jpm": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "jpm"
    ]
  },
  "image/jpx": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "jpx",
      "jpf"
    ]
  },
  "image/jxr": {
    "source": "iana",
    "extensions": [
      "jxr"
    ]
  },
  "image/jxra": {
    "source": "iana",
    "extensions": [
      "jxra"
    ]
  },
  "image/jxrs": {
    "source": "iana",
    "extensions": [
      "jxrs"
    ]
  },
  "image/jxs": {
    "source": "iana",
    "extensions": [
      "jxs"
    ]
  },
  "image/jxsc": {
    "source": "iana",
    "extensions": [
      "jxsc"
    ]
  },
  "image/jxsi": {
    "source": "iana",
    "extensions": [
      "jxsi"
    ]
  },
  "image/jxss": {
    "source": "iana",
    "extensions": [
      "jxss"
    ]
  },
  "image/ktx": {
    "source": "iana",
    "extensions": [
      "ktx"
    ]
  },
  "image/ktx2": {
    "source": "iana",
    "extensions": [
      "ktx2"
    ]
  },
  "image/naplps": {
    "source": "iana"
  },
  "image/pjpeg": {
    "compressible": false
  },
  "image/png": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "png"
    ]
  },
  "image/prs.btif": {
    "source": "iana",
    "extensions": [
      "btif"
    ]
  },
  "image/prs.pti": {
    "source": "iana",
    "extensions": [
      "pti"
    ]
  },
  "image/pwg-raster": {
    "source": "iana"
  },
  "image/sgi": {
    "source": "apache",
    "extensions": [
      "sgi"
    ]
  },
  "image/svg+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "svg",
      "svgz"
    ]
  },
  "image/t38": {
    "source": "iana",
    "extensions": [
      "t38"
    ]
  },
  "image/tiff": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "tif",
      "tiff"
    ]
  },
  "image/tiff-fx": {
    "source": "iana",
    "extensions": [
      "tfx"
    ]
  },
  "image/vnd.adobe.photoshop": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "psd"
    ]
  },
  "image/vnd.airzip.accelerator.azv": {
    "source": "iana",
    "extensions": [
      "azv"
    ]
  },
  "image/vnd.cns.inf2": {
    "source": "iana"
  },
  "image/vnd.dece.graphic": {
    "source": "iana",
    "extensions": [
      "uvi",
      "uvvi",
      "uvg",
      "uvvg"
    ]
  },
  "image/vnd.djvu": {
    "source": "iana",
    "extensions": [
      "djvu",
      "djv"
    ]
  },
  "image/vnd.dvb.subtitle": {
    "source": "iana",
    "extensions": [
      "sub"
    ]
  },
  "image/vnd.dwg": {
    "source": "iana",
    "extensions": [
      "dwg"
    ]
  },
  "image/vnd.dxf": {
    "source": "iana",
    "extensions": [
      "dxf"
    ]
  },
  "image/vnd.fastbidsheet": {
    "source": "iana",
    "extensions": [
      "fbs"
    ]
  },
  "image/vnd.fpx": {
    "source": "iana",
    "extensions": [
      "fpx"
    ]
  },
  "image/vnd.fst": {
    "source": "iana",
    "extensions": [
      "fst"
    ]
  },
  "image/vnd.fujixerox.edmics-mmr": {
    "source": "iana",
    "extensions": [
      "mmr"
    ]
  },
  "image/vnd.fujixerox.edmics-rlc": {
    "source": "iana",
    "extensions": [
      "rlc"
    ]
  },
  "image/vnd.globalgraphics.pgb": {
    "source": "iana"
  },
  "image/vnd.microsoft.icon": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "ico"
    ]
  },
  "image/vnd.mix": {
    "source": "iana"
  },
  "image/vnd.mozilla.apng": {
    "source": "iana"
  },
  "image/vnd.ms-dds": {
    "compressible": true,
    "extensions": [
      "dds"
    ]
  },
  "image/vnd.ms-modi": {
    "source": "iana",
    "extensions": [
      "mdi"
    ]
  },
  "image/vnd.ms-photo": {
    "source": "apache",
    "extensions": [
      "wdp"
    ]
  },
  "image/vnd.net-fpx": {
    "source": "iana",
    "extensions": [
      "npx"
    ]
  },
  "image/vnd.pco.b16": {
    "source": "iana",
    "extensions": [
      "b16"
    ]
  },
  "image/vnd.radiance": {
    "source": "iana"
  },
  "image/vnd.sealed.png": {
    "source": "iana"
  },
  "image/vnd.sealedmedia.softseal.gif": {
    "source": "iana"
  },
  "image/vnd.sealedmedia.softseal.jpg": {
    "source": "iana"
  },
  "image/vnd.svf": {
    "source": "iana"
  },
  "image/vnd.tencent.tap": {
    "source": "iana",
    "extensions": [
      "tap"
    ]
  },
  "image/vnd.valve.source.texture": {
    "source": "iana",
    "extensions": [
      "vtf"
    ]
  },
  "image/vnd.wap.wbmp": {
    "source": "iana",
    "extensions": [
      "wbmp"
    ]
  },
  "image/vnd.xiff": {
    "source": "iana",
    "extensions": [
      "xif"
    ]
  },
  "image/vnd.zbrush.pcx": {
    "source": "iana",
    "extensions": [
      "pcx"
    ]
  },
  "image/webp": {
    "source": "apache",
    "extensions": [
      "webp"
    ]
  },
  "image/wmf": {
    "source": "iana",
    "extensions": [
      "wmf"
    ]
  },
  "image/x-3ds": {
    "source": "apache",
    "extensions": [
      "3ds"
    ]
  },
  "image/x-cmu-raster": {
    "source": "apache",
    "extensions": [
      "ras"
    ]
  },
  "image/x-cmx": {
    "source": "apache",
    "extensions": [
      "cmx"
    ]
  },
  "image/x-freehand": {
    "source": "apache",
    "extensions": [
      "fh",
      "fhc",
      "fh4",
      "fh5",
      "fh7"
    ]
  },
  "image/x-icon": {
    "source": "apache",
    "compressible": true,
    "extensions": [
      "ico"
    ]
  },
  "image/x-jng": {
    "source": "nginx",
    "extensions": [
      "jng"
    ]
  },
  "image/x-mrsid-image": {
    "source": "apache",
    "extensions": [
      "sid"
    ]
  },
  "image/x-ms-bmp": {
    "source": "nginx",
    "compressible": true,
    "extensions": [
      "bmp"
    ]
  },
  "image/x-pcx": {
    "source": "apache",
    "extensions": [
      "pcx"
    ]
  },
  "image/x-pict": {
    "source": "apache",
    "extensions": [
      "pic",
      "pct"
    ]
  },
  "image/x-portable-anymap": {
    "source": "apache",
    "extensions": [
      "pnm"
    ]
  },
  "image/x-portable-bitmap": {
    "source": "apache",
    "extensions": [
      "pbm"
    ]
  },
  "image/x-portable-graymap": {
    "source": "apache",
    "extensions": [
      "pgm"
    ]
  },
  "image/x-portable-pixmap": {
    "source": "apache",
    "extensions": [
      "ppm"
    ]
  },
  "image/x-rgb": {
    "source": "apache",
    "extensions": [
      "rgb"
    ]
  },
  "image/x-tga": {
    "source": "apache",
    "extensions": [
      "tga"
    ]
  },
  "image/x-xbitmap": {
    "source": "apache",
    "extensions": [
      "xbm"
    ]
  },
  "image/x-xcf": {
    "compressible": false
  },
  "image/x-xpixmap": {
    "source": "apache",
    "extensions": [
      "xpm"
    ]
  },
  "image/x-xwindowdump": {
    "source": "apache",
    "extensions": [
      "xwd"
    ]
  },
  "message/cpim": {
    "source": "iana"
  },
  "message/delivery-status": {
    "source": "iana"
  },
  "message/disposition-notification": {
    "source": "iana",
    "extensions": [
      "disposition-notification"
    ]
  },
  "message/external-body": {
    "source": "iana"
  },
  "message/feedback-report": {
    "source": "iana"
  },
  "message/global": {
    "source": "iana",
    "extensions": [
      "u8msg"
    ]
  },
  "message/global-delivery-status": {
    "source": "iana",
    "extensions": [
      "u8dsn"
    ]
  },
  "message/global-disposition-notification": {
    "source": "iana",
    "extensions": [
      "u8mdn"
    ]
  },
  "message/global-headers": {
    "source": "iana",
    "extensions": [
      "u8hdr"
    ]
  },
  "message/http": {
    "source": "iana",
    "compressible": false
  },
  "message/imdn+xml": {
    "source": "iana",
    "compressible": true
  },
  "message/news": {
    "source": "iana"
  },
  "message/partial": {
    "source": "iana",
    "compressible": false
  },
  "message/rfc822": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "eml",
      "mime"
    ]
  },
  "message/s-http": {
    "source": "iana"
  },
  "message/sip": {
    "source": "iana"
  },
  "message/sipfrag": {
    "source": "iana"
  },
  "message/tracking-status": {
    "source": "iana"
  },
  "message/vnd.si.simp": {
    "source": "iana"
  },
  "message/vnd.wfa.wsc": {
    "source": "iana",
    "extensions": [
      "wsc"
    ]
  },
  "model/3mf": {
    "source": "iana",
    "extensions": [
      "3mf"
    ]
  },
  "model/e57": {
    "source": "iana"
  },
  "model/gltf+json": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "gltf"
    ]
  },
  "model/gltf-binary": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "glb"
    ]
  },
  "model/iges": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "igs",
      "iges"
    ]
  },
  "model/mesh": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "msh",
      "mesh",
      "silo"
    ]
  },
  "model/mtl": {
    "source": "iana",
    "extensions": [
      "mtl"
    ]
  },
  "model/obj": {
    "source": "iana",
    "extensions": [
      "obj"
    ]
  },
  "model/step": {
    "source": "iana"
  },
  "model/step+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "stpx"
    ]
  },
  "model/step+zip": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "stpz"
    ]
  },
  "model/step-xml+zip": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "stpxz"
    ]
  },
  "model/stl": {
    "source": "iana",
    "extensions": [
      "stl"
    ]
  },
  "model/vnd.collada+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "dae"
    ]
  },
  "model/vnd.dwf": {
    "source": "iana",
    "extensions": [
      "dwf"
    ]
  },
  "model/vnd.flatland.3dml": {
    "source": "iana"
  },
  "model/vnd.gdl": {
    "source": "iana",
    "extensions": [
      "gdl"
    ]
  },
  "model/vnd.gs-gdl": {
    "source": "apache"
  },
  "model/vnd.gs.gdl": {
    "source": "iana"
  },
  "model/vnd.gtw": {
    "source": "iana",
    "extensions": [
      "gtw"
    ]
  },
  "model/vnd.moml+xml": {
    "source": "iana",
    "compressible": true
  },
  "model/vnd.mts": {
    "source": "iana",
    "extensions": [
      "mts"
    ]
  },
  "model/vnd.opengex": {
    "source": "iana",
    "extensions": [
      "ogex"
    ]
  },
  "model/vnd.parasolid.transmit.binary": {
    "source": "iana",
    "extensions": [
      "x_b"
    ]
  },
  "model/vnd.parasolid.transmit.text": {
    "source": "iana",
    "extensions": [
      "x_t"
    ]
  },
  "model/vnd.pytha.pyox": {
    "source": "iana"
  },
  "model/vnd.rosette.annotated-data-model": {
    "source": "iana"
  },
  "model/vnd.sap.vds": {
    "source": "iana",
    "extensions": [
      "vds"
    ]
  },
  "model/vnd.usdz+zip": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "usdz"
    ]
  },
  "model/vnd.valve.source.compiled-map": {
    "source": "iana",
    "extensions": [
      "bsp"
    ]
  },
  "model/vnd.vtu": {
    "source": "iana",
    "extensions": [
      "vtu"
    ]
  },
  "model/vrml": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "wrl",
      "vrml"
    ]
  },
  "model/x3d+binary": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "x3db",
      "x3dbz"
    ]
  },
  "model/x3d+fastinfoset": {
    "source": "iana",
    "extensions": [
      "x3db"
    ]
  },
  "model/x3d+vrml": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "x3dv",
      "x3dvz"
    ]
  },
  "model/x3d+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "x3d",
      "x3dz"
    ]
  },
  "model/x3d-vrml": {
    "source": "iana",
    "extensions": [
      "x3dv"
    ]
  },
  "multipart/alternative": {
    "source": "iana",
    "compressible": false
  },
  "multipart/appledouble": {
    "source": "iana"
  },
  "multipart/byteranges": {
    "source": "iana"
  },
  "multipart/digest": {
    "source": "iana"
  },
  "multipart/encrypted": {
    "source": "iana",
    "compressible": false
  },
  "multipart/form-data": {
    "source": "iana",
    "compressible": false
  },
  "multipart/header-set": {
    "source": "iana"
  },
  "multipart/mixed": {
    "source": "iana"
  },
  "multipart/multilingual": {
    "source": "iana"
  },
  "multipart/parallel": {
    "source": "iana"
  },
  "multipart/related": {
    "source": "iana",
    "compressible": false
  },
  "multipart/report": {
    "source": "iana"
  },
  "multipart/signed": {
    "source": "iana",
    "compressible": false
  },
  "multipart/vnd.bint.med-plus": {
    "source": "iana"
  },
  "multipart/voice-message": {
    "source": "iana"
  },
  "multipart/x-mixed-replace": {
    "source": "iana"
  },
  "text/1d-interleaved-parityfec": {
    "source": "iana"
  },
  "text/cache-manifest": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "appcache",
      "manifest"
    ]
  },
  "text/calendar": {
    "source": "iana",
    "extensions": [
      "ics",
      "ifb"
    ]
  },
  "text/calender": {
    "compressible": true
  },
  "text/cmd": {
    "compressible": true
  },
  "text/coffeescript": {
    "extensions": [
      "coffee",
      "litcoffee"
    ]
  },
  "text/cql": {
    "source": "iana"
  },
  "text/cql-expression": {
    "source": "iana"
  },
  "text/cql-identifier": {
    "source": "iana"
  },
  "text/css": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": [
      "css"
    ]
  },
  "text/csv": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "csv"
    ]
  },
  "text/csv-schema": {
    "source": "iana"
  },
  "text/directory": {
    "source": "iana"
  },
  "text/dns": {
    "source": "iana"
  },
  "text/ecmascript": {
    "source": "iana"
  },
  "text/encaprtp": {
    "source": "iana"
  },
  "text/enriched": {
    "source": "iana"
  },
  "text/fhirpath": {
    "source": "iana"
  },
  "text/flexfec": {
    "source": "iana"
  },
  "text/fwdred": {
    "source": "iana"
  },
  "text/gff3": {
    "source": "iana"
  },
  "text/grammar-ref-list": {
    "source": "iana"
  },
  "text/html": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "html",
      "htm",
      "shtml"
    ]
  },
  "text/jade": {
    "extensions": [
      "jade"
    ]
  },
  "text/javascript": {
    "source": "iana",
    "compressible": true
  },
  "text/jcr-cnd": {
    "source": "iana"
  },
  "text/jsx": {
    "compressible": true,
    "extensions": [
      "jsx"
    ]
  },
  "text/less": {
    "compressible": true,
    "extensions": [
      "less"
    ]
  },
  "text/markdown": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "markdown",
      "md"
    ]
  },
  "text/mathml": {
    "source": "nginx",
    "extensions": [
      "mml"
    ]
  },
  "text/mdx": {
    "compressible": true,
    "extensions": [
      "mdx"
    ]
  },
  "text/mizar": {
    "source": "iana"
  },
  "text/n3": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": [
      "n3"
    ]
  },
  "text/parameters": {
    "source": "iana",
    "charset": "UTF-8"
  },
  "text/parityfec": {
    "source": "iana"
  },
  "text/plain": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "txt",
      "text",
      "conf",
      "def",
      "list",
      "log",
      "in",
      "ini"
    ]
  },
  "text/provenance-notation": {
    "source": "iana",
    "charset": "UTF-8"
  },
  "text/prs.fallenstein.rst": {
    "source": "iana"
  },
  "text/prs.lines.tag": {
    "source": "iana",
    "extensions": [
      "dsc"
    ]
  },
  "text/prs.prop.logic": {
    "source": "iana"
  },
  "text/raptorfec": {
    "source": "iana"
  },
  "text/red": {
    "source": "iana"
  },
  "text/rfc822-headers": {
    "source": "iana"
  },
  "text/richtext": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "rtx"
    ]
  },
  "text/rtf": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "rtf"
    ]
  },
  "text/rtp-enc-aescm128": {
    "source": "iana"
  },
  "text/rtploopback": {
    "source": "iana"
  },
  "text/rtx": {
    "source": "iana"
  },
  "text/sgml": {
    "source": "iana",
    "extensions": [
      "sgml",
      "sgm"
    ]
  },
  "text/shaclc": {
    "source": "iana"
  },
  "text/shex": {
    "source": "iana",
    "extensions": [
      "shex"
    ]
  },
  "text/slim": {
    "extensions": [
      "slim",
      "slm"
    ]
  },
  "text/spdx": {
    "source": "iana",
    "extensions": [
      "spdx"
    ]
  },
  "text/strings": {
    "source": "iana"
  },
  "text/stylus": {
    "extensions": [
      "stylus",
      "styl"
    ]
  },
  "text/t140": {
    "source": "iana"
  },
  "text/tab-separated-values": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "tsv"
    ]
  },
  "text/troff": {
    "source": "iana",
    "extensions": [
      "t",
      "tr",
      "roff",
      "man",
      "me",
      "ms"
    ]
  },
  "text/turtle": {
    "source": "iana",
    "charset": "UTF-8",
    "extensions": [
      "ttl"
    ]
  },
  "text/ulpfec": {
    "source": "iana"
  },
  "text/uri-list": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "uri",
      "uris",
      "urls"
    ]
  },
  "text/vcard": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "vcard"
    ]
  },
  "text/vnd.a": {
    "source": "iana"
  },
  "text/vnd.abc": {
    "source": "iana"
  },
  "text/vnd.ascii-art": {
    "source": "iana"
  },
  "text/vnd.curl": {
    "source": "iana",
    "extensions": [
      "curl"
    ]
  },
  "text/vnd.curl.dcurl": {
    "source": "apache",
    "extensions": [
      "dcurl"
    ]
  },
  "text/vnd.curl.mcurl": {
    "source": "apache",
    "extensions": [
      "mcurl"
    ]
  },
  "text/vnd.curl.scurl": {
    "source": "apache",
    "extensions": [
      "scurl"
    ]
  },
  "text/vnd.debian.copyright": {
    "source": "iana",
    "charset": "UTF-8"
  },
  "text/vnd.dmclientscript": {
    "source": "iana"
  },
  "text/vnd.dvb.subtitle": {
    "source": "iana",
    "extensions": [
      "sub"
    ]
  },
  "text/vnd.esmertec.theme-descriptor": {
    "source": "iana",
    "charset": "UTF-8"
  },
  "text/vnd.familysearch.gedcom": {
    "source": "iana",
    "extensions": [
      "ged"
    ]
  },
  "text/vnd.ficlab.flt": {
    "source": "iana"
  },
  "text/vnd.fly": {
    "source": "iana",
    "extensions": [
      "fly"
    ]
  },
  "text/vnd.fmi.flexstor": {
    "source": "iana",
    "extensions": [
      "flx"
    ]
  },
  "text/vnd.gml": {
    "source": "iana"
  },
  "text/vnd.graphviz": {
    "source": "iana",
    "extensions": [
      "gv"
    ]
  },
  "text/vnd.hans": {
    "source": "iana"
  },
  "text/vnd.hgl": {
    "source": "iana"
  },
  "text/vnd.in3d.3dml": {
    "source": "iana",
    "extensions": [
      "3dml"
    ]
  },
  "text/vnd.in3d.spot": {
    "source": "iana",
    "extensions": [
      "spot"
    ]
  },
  "text/vnd.iptc.newsml": {
    "source": "iana"
  },
  "text/vnd.iptc.nitf": {
    "source": "iana"
  },
  "text/vnd.latex-z": {
    "source": "iana"
  },
  "text/vnd.motorola.reflex": {
    "source": "iana"
  },
  "text/vnd.ms-mediapackage": {
    "source": "iana"
  },
  "text/vnd.net2phone.commcenter.command": {
    "source": "iana"
  },
  "text/vnd.radisys.msml-basic-layout": {
    "source": "iana"
  },
  "text/vnd.senx.warpscript": {
    "source": "iana"
  },
  "text/vnd.si.uricatalogue": {
    "source": "iana"
  },
  "text/vnd.sosi": {
    "source": "iana"
  },
  "text/vnd.sun.j2me.app-descriptor": {
    "source": "iana",
    "charset": "UTF-8",
    "extensions": [
      "jad"
    ]
  },
  "text/vnd.trolltech.linguist": {
    "source": "iana",
    "charset": "UTF-8"
  },
  "text/vnd.wap.si": {
    "source": "iana"
  },
  "text/vnd.wap.sl": {
    "source": "iana"
  },
  "text/vnd.wap.wml": {
    "source": "iana",
    "extensions": [
      "wml"
    ]
  },
  "text/vnd.wap.wmlscript": {
    "source": "iana",
    "extensions": [
      "wmls"
    ]
  },
  "text/vtt": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": [
      "vtt"
    ]
  },
  "text/x-asm": {
    "source": "apache",
    "extensions": [
      "s",
      "asm"
    ]
  },
  "text/x-c": {
    "source": "apache",
    "extensions": [
      "c",
      "cc",
      "cxx",
      "cpp",
      "h",
      "hh",
      "dic"
    ]
  },
  "text/x-component": {
    "source": "nginx",
    "extensions": [
      "htc"
    ]
  },
  "text/x-fortran": {
    "source": "apache",
    "extensions": [
      "f",
      "for",
      "f77",
      "f90"
    ]
  },
  "text/x-gwt-rpc": {
    "compressible": true
  },
  "text/x-handlebars-template": {
    "extensions": [
      "hbs"
    ]
  },
  "text/x-java-source": {
    "source": "apache",
    "extensions": [
      "java"
    ]
  },
  "text/x-jquery-tmpl": {
    "compressible": true
  },
  "text/x-lua": {
    "extensions": [
      "lua"
    ]
  },
  "text/x-markdown": {
    "compressible": true,
    "extensions": [
      "mkd"
    ]
  },
  "text/x-nfo": {
    "source": "apache",
    "extensions": [
      "nfo"
    ]
  },
  "text/x-opml": {
    "source": "apache",
    "extensions": [
      "opml"
    ]
  },
  "text/x-org": {
    "compressible": true,
    "extensions": [
      "org"
    ]
  },
  "text/x-pascal": {
    "source": "apache",
    "extensions": [
      "p",
      "pas"
    ]
  },
  "text/x-processing": {
    "compressible": true,
    "extensions": [
      "pde"
    ]
  },
  "text/x-sass": {
    "extensions": [
      "sass"
    ]
  },
  "text/x-scss": {
    "extensions": [
      "scss"
    ]
  },
  "text/x-setext": {
    "source": "apache",
    "extensions": [
      "etx"
    ]
  },
  "text/x-sfv": {
    "source": "apache",
    "extensions": [
      "sfv"
    ]
  },
  "text/x-suse-ymp": {
    "compressible": true,
    "extensions": [
      "ymp"
    ]
  },
  "text/x-uuencode": {
    "source": "apache",
    "extensions": [
      "uu"
    ]
  },
  "text/x-vcalendar": {
    "source": "apache",
    "extensions": [
      "vcs"
    ]
  },
  "text/x-vcard": {
    "source": "apache",
    "extensions": [
      "vcf"
    ]
  },
  "text/xml": {
    "source": "iana",
    "compressible": true,
    "extensions": [
      "xml"
    ]
  },
  "text/xml-external-parsed-entity": {
    "source": "iana"
  },
  "text/yaml": {
    "compressible": true,
    "extensions": [
      "yaml",
      "yml"
    ]
  },
  "video/1d-interleaved-parityfec": {
    "source": "iana"
  },
  "video/3gpp": {
    "source": "iana",
    "extensions": [
      "3gp",
      "3gpp"
    ]
  },
  "video/3gpp-tt": {
    "source": "iana"
  },
  "video/3gpp2": {
    "source": "iana",
    "extensions": [
      "3g2"
    ]
  },
  "video/av1": {
    "source": "iana"
  },
  "video/bmpeg": {
    "source": "iana"
  },
  "video/bt656": {
    "source": "iana"
  },
  "video/celb": {
    "source": "iana"
  },
  "video/dv": {
    "source": "iana"
  },
  "video/encaprtp": {
    "source": "iana"
  },
  "video/ffv1": {
    "source": "iana"
  },
  "video/flexfec": {
    "source": "iana"
  },
  "video/h261": {
    "source": "iana",
    "extensions": [
      "h261"
    ]
  },
  "video/h263": {
    "source": "iana",
    "extensions": [
      "h263"
    ]
  },
  "video/h263-1998": {
    "source": "iana"
  },
  "video/h263-2000": {
    "source": "iana"
  },
  "video/h264": {
    "source": "iana",
    "extensions": [
      "h264"
    ]
  },
  "video/h264-rcdo": {
    "source": "iana"
  },
  "video/h264-svc": {
    "source": "iana"
  },
  "video/h265": {
    "source": "iana"
  },
  "video/iso.segment": {
    "source": "iana",
    "extensions": [
      "m4s"
    ]
  },
  "video/jpeg": {
    "source": "iana",
    "extensions": [
      "jpgv"
    ]
  },
  "video/jpeg2000": {
    "source": "iana"
  },
  "video/jpm": {
    "source": "apache",
    "extensions": [
      "jpm",
      "jpgm"
    ]
  },
  "video/jxsv": {
    "source": "iana"
  },
  "video/mj2": {
    "source": "iana",
    "extensions": [
      "mj2",
      "mjp2"
    ]
  },
  "video/mp1s": {
    "source": "iana"
  },
  "video/mp2p": {
    "source": "iana"
  },
  "video/mp2t": {
    "source": "iana",
    "extensions": [
      "ts"
    ]
  },
  "video/mp4": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "mp4",
      "mp4v",
      "mpg4"
    ]
  },
  "video/mp4v-es": {
    "source": "iana"
  },
  "video/mpeg": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "mpeg",
      "mpg",
      "mpe",
      "m1v",
      "m2v"
    ]
  },
  "video/mpeg4-generic": {
    "source": "iana"
  },
  "video/mpv": {
    "source": "iana"
  },
  "video/nv": {
    "source": "iana"
  },
  "video/ogg": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "ogv"
    ]
  },
  "video/parityfec": {
    "source": "iana"
  },
  "video/pointer": {
    "source": "iana"
  },
  "video/quicktime": {
    "source": "iana",
    "compressible": false,
    "extensions": [
      "qt",
      "mov"
    ]
  },
  "video/raptorfec": {
    "source": "iana"
  },
  "video/raw": {
    "source": "iana"
  },
  "video/rtp-enc-aescm128": {
    "source": "iana"
  },
  "video/rtploopback": {
    "source": "iana"
  },
  "video/rtx": {
    "source": "iana"
  },
  "video/scip": {
    "source": "iana"
  },
  "video/smpte291": {
    "source": "iana"
  },
  "video/smpte292m": {
    "source": "iana"
  },
  "video/ulpfec": {
    "source": "iana"
  },
  "video/vc1": {
    "source": "iana"
  },
  "video/vc2": {
    "source": "iana"
  },
  "video/vnd.cctv": {
    "source": "iana"
  },
  "video/vnd.dece.hd": {
    "source": "iana",
    "extensions": [
      "uvh",
      "uvvh"
    ]
  },
  "video/vnd.dece.mobile": {
    "source": "iana",
    "extensions": [
      "uvm",
      "uvvm"
    ]
  },
  "video/vnd.dece.mp4": {
    "source": "iana"
  },
  "video/vnd.dece.pd": {
    "source": "iana",
    "extensions": [
      "uvp",
      "uvvp"
    ]
  },
  "video/vnd.dece.sd": {
    "source": "iana",
    "extensions": [
      "uvs",
      "uvvs"
    ]
  },
  "video/vnd.dece.video": {
    "source": "iana",
    "extensions": [
      "uvv",
      "uvvv"
    ]
  },
  "video/vnd.directv.mpeg": {
    "source": "iana"
  },
  "video/vnd.directv.mpeg-tts": {
    "source": "iana"
  },
  "video/vnd.dlna.mpeg-tts": {
    "source": "iana"
  },
  "video/vnd.dvb.file": {
    "source": "iana",
    "extensions": [
      "dvb"
    ]
  },
  "video/vnd.fvt": {
    "source": "iana",
    "extensions": [
      "fvt"
    ]
  },
  "video/vnd.hns.video": {
    "source": "iana"
  },
  "video/vnd.iptvforum.1dparityfec-1010": {
    "source": "iana"
  },
  "video/vnd.iptvforum.1dparityfec-2005": {
    "source": "iana"
  },
  "video/vnd.iptvforum.2dparityfec-1010": {
    "source": "iana"
  },
  "video/vnd.iptvforum.2dparityfec-2005": {
    "source": "iana"
  },
  "video/vnd.iptvforum.ttsavc": {
    "source": "iana"
  },
  "video/vnd.iptvforum.ttsmpeg2": {
    "source": "iana"
  },
  "video/vnd.motorola.video": {
    "source": "iana"
  },
  "video/vnd.motorola.videop": {
    "source": "iana"
  },
  "video/vnd.mpegurl": {
    "source": "iana",
    "extensions": [
      "mxu",
      "m4u"
    ]
  },
  "video/vnd.ms-playready.media.pyv": {
    "source": "iana",
    "extensions": [
      "pyv"
    ]
  },
  "video/vnd.nokia.interleaved-multimedia": {
    "source": "iana"
  },
  "video/vnd.nokia.mp4vr": {
    "source": "iana"
  },
  "video/vnd.nokia.videovoip": {
    "source": "iana"
  },
  "video/vnd.objectvideo": {
    "source": "iana"
  },
  "video/vnd.radgamettools.bink": {
    "source": "iana"
  },
  "video/vnd.radgamettools.smacker": {
    "source": "iana"
  },
  "video/vnd.sealed.mpeg1": {
    "source": "iana"
  },
  "video/vnd.sealed.mpeg4": {
    "source": "iana"
  },
  "video/vnd.sealed.swf": {
    "source": "iana"
  },
  "video/vnd.sealedmedia.softseal.mov": {
    "source": "iana"
  },
  "video/vnd.uvvu.mp4": {
    "source": "iana",
    "extensions": [
      "uvu",
      "uvvu"
    ]
  },
  "video/vnd.vivo": {
    "source": "iana",
    "extensions": [
      "viv"
    ]
  },
  "video/vnd.youtube.yt": {
    "source": "iana"
  },
  "video/vp8": {
    "source": "iana"
  },
  "video/vp9": {
    "source": "iana"
  },
  "video/webm": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "webm"
    ]
  },
  "video/x-f4v": {
    "source": "apache",
    "extensions": [
      "f4v"
    ]
  },
  "video/x-fli": {
    "source": "apache",
    "extensions": [
      "fli"
    ]
  },
  "video/x-flv": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "flv"
    ]
  },
  "video/x-m4v": {
    "source": "apache",
    "extensions": [
      "m4v"
    ]
  },
  "video/x-matroska": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "mkv",
      "mk3d",
      "mks"
    ]
  },
  "video/x-mng": {
    "source": "apache",
    "extensions": [
      "mng"
    ]
  },
  "video/x-ms-asf": {
    "source": "apache",
    "extensions": [
      "asf",
      "asx"
    ]
  },
  "video/x-ms-vob": {
    "source": "apache",
    "extensions": [
      "vob"
    ]
  },
  "video/x-ms-wm": {
    "source": "apache",
    "extensions": [
      "wm"
    ]
  },
  "video/x-ms-wmv": {
    "source": "apache",
    "compressible": false,
    "extensions": [
      "wmv"
    ]
  },
  "video/x-ms-wmx": {
    "source": "apache",
    "extensions": [
      "wmx"
    ]
  },
  "video/x-ms-wvx": {
    "source": "apache",
    "extensions": [
      "wvx"
    ]
  },
  "video/x-msvideo": {
    "source": "apache",
    "extensions": [
      "avi"
    ]
  },
  "video/x-sgi-movie": {
    "source": "apache",
    "extensions": [
      "movie"
    ]
  },
  "video/x-smv": {
    "source": "apache",
    "extensions": [
      "smv"
    ]
  },
  "x-conference/x-cooltalk": {
    "source": "apache",
    "extensions": [
      "ice"
    ]
  },
  "x-shader/x-fragment": {
    "compressible": true
  },
  "x-shader/x-vertex": {
    "compressible": true
  }
};

// deno:https://deno.land/std@0.200.0/media_types/_db.ts
var types = /* @__PURE__ */ new Map();
(function populateMaps() {
  const preference = [
    "nginx",
    "apache",
    void 0,
    "iana"
  ];
  for (const type of Object.keys(mime_db_v1_52_0_default)) {
    const mime = mime_db_v1_52_0_default[type];
    const exts = mime.extensions;
    if (!exts || !exts.length) {
      continue;
    }
    extensions.set(type, exts);
    for (const ext of exts) {
      const current = types.get(ext);
      if (current) {
        const from = preference.indexOf(mime_db_v1_52_0_default[current].source);
        const to = preference.indexOf(mime.source);
        if (current !== "application/octet-stream" && (from > to || // @ts-ignore work around denoland/dnt#148
        from === to && current.startsWith("application/"))) {
          continue;
        }
      }
      types.set(ext, type);
    }
  }
})();

// deno:https://deno.land/std@0.200.0/media_types/type_by_extension.ts
function typeByExtension(extension2) {
  extension2 = extension2.startsWith(".") ? extension2.slice(1) : extension2;
  return types.get(extension2.toLowerCase());
}

// deno:https://deno.land/std@0.200.0/media_types/get_charset.ts
function getCharset(type) {
  try {
    const [mediaType, params] = parseMediaType2(type);
    if (params && params["charset"]) {
      return params["charset"];
    }
    const entry = mime_db_v1_52_0_default[mediaType];
    if (entry && entry.charset) {
      return entry.charset;
    }
    if (mediaType.startsWith("text/")) {
      return "UTF-8";
    }
  } catch {
  }
  return void 0;
}

// deno:https://deno.land/std@0.200.0/media_types/format_media_type.ts
function formatMediaType(type, param) {
  let b = "";
  const [major, sub] = type.split("/");
  if (!sub) {
    if (!isToken(type)) {
      return "";
    }
    b += type.toLowerCase();
  } else {
    if (!isToken(major) || !isToken(sub)) {
      return "";
    }
    b += `${major.toLowerCase()}/${sub.toLowerCase()}`;
  }
  if (param) {
    param = isIterator(param) ? Object.fromEntries(param) : param;
    const attrs = Object.keys(param);
    attrs.sort();
    for (const attribute of attrs) {
      if (!isToken(attribute)) {
        return "";
      }
      const value = param[attribute];
      b += `; ${attribute.toLowerCase()}`;
      const needEnc = needsEncoding(value);
      if (needEnc) {
        b += "*";
      }
      b += "=";
      if (needEnc) {
        b += `utf-8''${encodeURIComponent(value)}`;
        continue;
      }
      if (isToken(value)) {
        b += value;
        continue;
      }
      b += `"${value.replace(/["\\]/gi, (m) => `\\${m}`)}"`;
    }
  }
  return b;
}

// deno:https://deno.land/std@0.200.0/media_types/content_type.ts
function contentType(extensionOrType) {
  try {
    const [mediaType, params = {}] = extensionOrType.includes("/") ? parseMediaType2(extensionOrType) : [
      typeByExtension(extensionOrType),
      void 0
    ];
    if (!mediaType) {
      return void 0;
    }
    if (!("charset" in params)) {
      const charset = getCharset(mediaType);
      if (charset) {
        params.charset = charset;
      }
    }
    return formatMediaType(mediaType, params);
  } catch {
  }
  return void 0;
}

// deno:https://deno.land/std@0.200.0/media_types/extensions_by_type.ts
function extensionsByType(type) {
  try {
    const [mediaType] = parseMediaType2(type);
    return extensions.get(mediaType);
  } catch {
  }
}

// deno:https://deno.land/std@0.200.0/media_types/extension.ts
function extension(type) {
  const exts = extensionsByType(type);
  if (exts) {
    return exts[0];
  }
  return void 0;
}

// deno:https://deno.land/std@0.200.0/streams/buffer.ts
var MAX_SIZE2 = 2 ** 32 - 2;

// deno:https://deno.land/std@0.200.0/streams/byte_slice_stream.ts
var ByteSliceStream = class extends TransformStream {
  #offsetStart = 0;
  #offsetEnd = 0;
  constructor(start = 0, end = Infinity) {
    super({
      start: () => {
        assert(start >= 0, "`start` must be greater than 0");
        end += 1;
      },
      transform: (chunk, controller) => {
        this.#offsetStart = this.#offsetEnd;
        this.#offsetEnd += chunk.byteLength;
        if (this.#offsetEnd > start) {
          if (this.#offsetStart < start) {
            chunk = chunk.slice(start - this.#offsetStart);
          }
          if (this.#offsetEnd >= end) {
            chunk = chunk.slice(0, chunk.byteLength - this.#offsetEnd + end);
            controller.enqueue(chunk);
            controller.terminate();
          } else {
            controller.enqueue(chunk);
          }
        }
      }
    });
  }
};

// deno:https://deno.land/std@0.200.0/streams/_common.ts
var DEFAULT_BUFFER_SIZE3 = 32 * 1024;
function createLPS(pat) {
  const lps = new Uint8Array(pat.length);
  lps[0] = 0;
  let prefixEnd = 0;
  let i = 1;
  while (i < lps.length) {
    if (pat[i] == pat[prefixEnd]) {
      prefixEnd++;
      lps[i] = prefixEnd;
      i++;
    } else if (prefixEnd === 0) {
      lps[i] = 0;
      i++;
    } else {
      prefixEnd = lps[prefixEnd - 1];
    }
  }
  return lps;
}

// deno:https://deno.land/std@0.200.0/streams/delimiter_stream.ts
var DelimiterStream = class extends TransformStream {
  #bufs = new BytesList();
  #delimiter;
  #inspectIndex = 0;
  #matchIndex = 0;
  #delimLen;
  #delimLPS;
  #disp;
  constructor(delimiter4, options) {
    super({
      transform: (chunk, controller) => {
        this.#handle(chunk, controller);
      },
      flush: (controller) => {
        controller.enqueue(this.#bufs.concat());
      }
    });
    this.#delimiter = delimiter4;
    this.#delimLen = delimiter4.length;
    this.#delimLPS = createLPS(delimiter4);
    this.#disp = options?.disposition ?? "discard";
  }
  #handle(chunk, controller) {
    this.#bufs.add(chunk);
    let localIndex = 0;
    while (this.#inspectIndex < this.#bufs.size()) {
      if (chunk[localIndex] === this.#delimiter[this.#matchIndex]) {
        this.#inspectIndex++;
        localIndex++;
        this.#matchIndex++;
        if (this.#matchIndex === this.#delimLen) {
          const start = this.#inspectIndex - this.#delimLen;
          const end = this.#disp == "suffix" ? this.#inspectIndex : start;
          const copy2 = this.#bufs.slice(0, end);
          controller.enqueue(copy2);
          const shift = this.#disp == "prefix" ? start : this.#inspectIndex;
          this.#bufs.shift(shift);
          this.#inspectIndex = this.#disp == "prefix" ? this.#delimLen : 0;
          this.#matchIndex = 0;
        }
      } else {
        if (this.#matchIndex === 0) {
          this.#inspectIndex++;
          localIndex++;
        } else {
          this.#matchIndex = this.#delimLPS[this.#matchIndex - 1];
        }
      }
    }
  }
};

// deno:https://deno.land/std@0.200.0/streams/limited_bytes_transform_stream.ts
var LimitedBytesTransformStream = class extends TransformStream {
  #read = 0;
  constructor(size, options = {}) {
    super({
      transform: (chunk, controller) => {
        if (this.#read + chunk.byteLength > size) {
          if (options.error) {
            throw new RangeError(`Exceeded byte size limit of '${size}'`);
          } else {
            controller.terminate();
          }
        } else {
          this.#read += chunk.byteLength;
          controller.enqueue(chunk);
        }
      }
    });
  }
};

// deno:https://deno.land/std@0.200.0/streams/limited_transform_stream.ts
var LimitedTransformStream = class extends TransformStream {
  #read = 0;
  constructor(size, options = {}) {
    super({
      transform: (chunk, controller) => {
        if (this.#read + 1 > size) {
          if (options.error) {
            throw new RangeError(`Exceeded chunk limit of '${size}'`);
          } else {
            controller.terminate();
          }
        } else {
          this.#read++;
          controller.enqueue(chunk);
        }
      }
    });
  }
};

// deno:https://deno.land/std@0.200.0/streams/read_all.ts
async function readAll(r) {
  const buf = new Buffer2();
  await buf.readFrom(r);
  return buf.bytes();
}

// deno:https://deno.land/std@0.200.0/streams/write_all.ts
async function writeAll(w, arr) {
  let nwritten = 0;
  while (nwritten < arr.length) {
    nwritten += await w.write(arr.subarray(nwritten));
  }
}

// deno:https://deno.land/std@0.200.0/streams/reader_from_stream_reader.ts
function readerFromStreamReader(streamReader) {
  const buffer = new Buffer2();
  return {
    async read(p) {
      if (buffer.empty()) {
        const res = await streamReader.read();
        if (res.done) {
          return null;
        }
        await writeAll(buffer, res.value);
      }
      return buffer.read(p);
    }
  };
}

// deno:https://deno.land/std@0.200.0/streams/text_delimiter_stream.ts
var TextDelimiterStream = class extends TransformStream {
  #buf = "";
  #delimiter;
  #inspectIndex = 0;
  #matchIndex = 0;
  #delimLPS;
  #disp;
  constructor(delimiter4, options) {
    super({
      transform: (chunk, controller) => {
        this.#handle(chunk, controller);
      },
      flush: (controller) => {
        controller.enqueue(this.#buf);
      }
    });
    this.#delimiter = delimiter4;
    this.#delimLPS = createLPS(new TextEncoder().encode(delimiter4));
    this.#disp = options?.disposition ?? "discard";
  }
  #handle(chunk, controller) {
    this.#buf += chunk;
    let localIndex = 0;
    while (this.#inspectIndex < this.#buf.length) {
      if (chunk[localIndex] === this.#delimiter[this.#matchIndex]) {
        this.#inspectIndex++;
        localIndex++;
        this.#matchIndex++;
        if (this.#matchIndex === this.#delimiter.length) {
          const start = this.#inspectIndex - this.#delimiter.length;
          const end = this.#disp === "suffix" ? this.#inspectIndex : start;
          const copy2 = this.#buf.slice(0, end);
          controller.enqueue(copy2);
          const shift = this.#disp == "prefix" ? start : this.#inspectIndex;
          this.#buf = this.#buf.slice(shift);
          this.#inspectIndex = this.#disp == "prefix" ? this.#delimiter.length : 0;
          this.#matchIndex = 0;
        }
      } else {
        if (this.#matchIndex === 0) {
          this.#inspectIndex++;
          localIndex++;
        } else {
          this.#matchIndex = this.#delimLPS[this.#matchIndex - 1];
        }
      }
    }
  }
};

// deno:https://deno.land/std@0.200.0/streams/text_line_stream.ts
var TextLineStream = class extends TransformStream {
  #allowCR;
  #buf = "";
  constructor(options) {
    super({
      transform: (chunk, controller) => this.#handle(chunk, controller),
      flush: (controller) => {
        if (this.#buf.length > 0) {
          if (this.#allowCR && this.#buf[this.#buf.length - 1] === "\r") controller.enqueue(this.#buf.slice(0, -1));
          else controller.enqueue(this.#buf);
        }
      }
    });
    this.#allowCR = options?.allowCR ?? false;
  }
  #handle(chunk, controller) {
    chunk = this.#buf + chunk;
    for (; ; ) {
      const lfIndex = chunk.indexOf("\n");
      if (this.#allowCR) {
        const crIndex = chunk.indexOf("\r");
        if (crIndex !== -1 && crIndex !== chunk.length - 1 && (lfIndex === -1 || lfIndex - 1 > crIndex)) {
          controller.enqueue(chunk.slice(0, crIndex));
          chunk = chunk.slice(crIndex + 1);
          continue;
        }
      }
      if (lfIndex !== -1) {
        let crOrLfIndex = lfIndex;
        if (chunk[lfIndex - 1] === "\r") {
          crOrLfIndex--;
        }
        controller.enqueue(chunk.slice(0, crOrLfIndex));
        chunk = chunk.slice(lfIndex + 1);
        continue;
      }
      break;
    }
    this.#buf = chunk;
  }
};

// deno:https://deno.land/std@0.200.0/_util/os.ts
var osType = (() => {
  const { Deno: Deno2 } = globalThis;
  if (typeof Deno2?.build?.os === "string") {
    return Deno2.build.os;
  }
  const { navigator } = globalThis;
  if (navigator?.appVersion?.includes?.("Win")) {
    return "windows";
  }
  return "linux";
})();
var isWindows = osType === "windows";

// deno:https://deno.land/std@0.200.0/path/win32.ts
var win32_exports = {};
__export(win32_exports, {
  basename: () => windowsBasename,
  delimiter: () => delimiter,
  dirname: () => windowsDirname,
  extname: () => windowsExtname,
  format: () => windowsFormat,
  fromFileUrl: () => windowsFromFileUrl,
  isAbsolute: () => windowsIsAbsolute,
  join: () => windowsJoin,
  normalize: () => windowsNormalize,
  parse: () => windowsParse,
  relative: () => windowsRelative,
  resolve: () => windowsResolve,
  sep: () => sep,
  toFileUrl: () => windowsToFileUrl,
  toNamespacedPath: () => windowsToNamespacedPath
});

// deno:https://deno.land/std@0.200.0/path/_constants.ts
var CHAR_UPPERCASE_A = 65;
var CHAR_LOWERCASE_A = 97;
var CHAR_UPPERCASE_Z = 90;
var CHAR_LOWERCASE_Z = 122;
var CHAR_DOT = 46;
var CHAR_FORWARD_SLASH = 47;
var CHAR_BACKWARD_SLASH = 92;
var CHAR_COLON = 58;
var CHAR_QUESTION_MARK = 63;

// deno:https://deno.land/std@0.200.0/path/_util.ts
function assertPath(path2) {
  if (typeof path2 !== "string") {
    throw new TypeError(`Path must be a string. Received ${JSON.stringify(path2)}`);
  }
}
function isPosixPathSeparator(code) {
  return code === CHAR_FORWARD_SLASH;
}
function isPathSeparator(code) {
  return isPosixPathSeparator(code) || code === CHAR_BACKWARD_SLASH;
}
function isWindowsDeviceRoot(code) {
  return code >= CHAR_LOWERCASE_A && code <= CHAR_LOWERCASE_Z || code >= CHAR_UPPERCASE_A && code <= CHAR_UPPERCASE_Z;
}
function normalizeString(path2, allowAboveRoot, separator, isPathSeparator2) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code;
  for (let i = 0, len = path2.length; i <= len; ++i) {
    if (i < len) code = path2.charCodeAt(i);
    else if (isPathSeparator2(code)) break;
    else code = CHAR_FORWARD_SLASH;
    if (isPathSeparator2(code)) {
      if (lastSlash === i - 1 || dots === 1) {
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== CHAR_DOT || res.charCodeAt(res.length - 2) !== CHAR_DOT) {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf(separator);
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
            }
            lastSlash = i;
            dots = 0;
            continue;
          } else if (res.length === 2 || res.length === 1) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0) res += `${separator}..`;
          else res = "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) res += separator + path2.slice(lastSlash + 1, i);
        else res = path2.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === CHAR_DOT && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
function stripTrailingSeparators(segment, isSep) {
  if (segment.length <= 1) {
    return segment;
  }
  let end = segment.length;
  for (let i = segment.length - 1; i > 0; i--) {
    if (isSep(segment.charCodeAt(i))) {
      end = i;
    } else {
      break;
    }
  }
  return segment.slice(0, end);
}

// deno:https://deno.land/std@0.200.0/path/_resolve.ts
function posixResolve(...pathSegments) {
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    let path2;
    if (i >= 0) path2 = pathSegments[i];
    else {
      const { Deno: Deno2 } = globalThis;
      if (typeof Deno2?.cwd !== "function") {
        throw new TypeError("Resolved a relative path without a CWD.");
      }
      path2 = Deno2.cwd();
    }
    assertPath(path2);
    if (path2.length === 0) {
      continue;
    }
    resolvedPath = `${path2}/${resolvedPath}`;
    resolvedAbsolute = isPosixPathSeparator(path2.charCodeAt(0));
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
  if (resolvedAbsolute) {
    if (resolvedPath.length > 0) return `/${resolvedPath}`;
    else return "/";
  } else if (resolvedPath.length > 0) return resolvedPath;
  else return ".";
}
function windowsResolve(...pathSegments) {
  let resolvedDevice = "";
  let resolvedTail = "";
  let resolvedAbsolute = false;
  for (let i = pathSegments.length - 1; i >= -1; i--) {
    let path2;
    const { Deno: Deno2 } = globalThis;
    if (i >= 0) {
      path2 = pathSegments[i];
    } else if (!resolvedDevice) {
      if (typeof Deno2?.cwd !== "function") {
        throw new TypeError("Resolved a drive-letter-less path without a CWD.");
      }
      path2 = Deno2.cwd();
    } else {
      if (typeof Deno2?.env?.get !== "function" || typeof Deno2?.cwd !== "function") {
        throw new TypeError("Resolved a relative path without a CWD.");
      }
      path2 = Deno2.cwd();
      if (path2 === void 0 || path2.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
        path2 = `${resolvedDevice}\\`;
      }
    }
    assertPath(path2);
    const len = path2.length;
    if (len === 0) continue;
    let rootEnd = 0;
    let device = "";
    let isAbsolute2 = false;
    const code = path2.charCodeAt(0);
    if (len > 1) {
      if (isPathSeparator(code)) {
        isAbsolute2 = true;
        if (isPathSeparator(path2.charCodeAt(1))) {
          let j = 2;
          let last = j;
          for (; j < len; ++j) {
            if (isPathSeparator(path2.charCodeAt(j))) break;
          }
          if (j < len && j !== last) {
            const firstPart = path2.slice(last, j);
            last = j;
            for (; j < len; ++j) {
              if (!isPathSeparator(path2.charCodeAt(j))) break;
            }
            if (j < len && j !== last) {
              last = j;
              for (; j < len; ++j) {
                if (isPathSeparator(path2.charCodeAt(j))) break;
              }
              if (j === len) {
                device = `\\\\${firstPart}\\${path2.slice(last)}`;
                rootEnd = j;
              } else if (j !== last) {
                device = `\\\\${firstPart}\\${path2.slice(last, j)}`;
                rootEnd = j;
              }
            }
          }
        } else {
          rootEnd = 1;
        }
      } else if (isWindowsDeviceRoot(code)) {
        if (path2.charCodeAt(1) === CHAR_COLON) {
          device = path2.slice(0, 2);
          rootEnd = 2;
          if (len > 2) {
            if (isPathSeparator(path2.charCodeAt(2))) {
              isAbsolute2 = true;
              rootEnd = 3;
            }
          }
        }
      }
    } else if (isPathSeparator(code)) {
      rootEnd = 1;
      isAbsolute2 = true;
    }
    if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
      continue;
    }
    if (resolvedDevice.length === 0 && device.length > 0) {
      resolvedDevice = device;
    }
    if (!resolvedAbsolute) {
      resolvedTail = `${path2.slice(rootEnd)}\\${resolvedTail}`;
      resolvedAbsolute = isAbsolute2;
    }
    if (resolvedAbsolute && resolvedDevice.length > 0) break;
  }
  resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
  return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}

// deno:https://deno.land/std@0.200.0/path/_normalize.ts
function assertArg(path2) {
  assertPath(path2);
  if (path2.length === 0) return ".";
}
function posixNormalize(path2) {
  assertArg(path2);
  const isAbsolute2 = isPosixPathSeparator(path2.charCodeAt(0));
  const trailingSeparator = isPosixPathSeparator(path2.charCodeAt(path2.length - 1));
  path2 = normalizeString(path2, !isAbsolute2, "/", isPosixPathSeparator);
  if (path2.length === 0 && !isAbsolute2) path2 = ".";
  if (path2.length > 0 && trailingSeparator) path2 += "/";
  if (isAbsolute2) return `/${path2}`;
  return path2;
}
function windowsNormalize(path2) {
  assertArg(path2);
  const len = path2.length;
  let rootEnd = 0;
  let device;
  let isAbsolute2 = false;
  const code = path2.charCodeAt(0);
  if (len > 1) {
    if (isPathSeparator(code)) {
      isAbsolute2 = true;
      if (isPathSeparator(path2.charCodeAt(1))) {
        let j = 2;
        let last = j;
        for (; j < len; ++j) {
          if (isPathSeparator(path2.charCodeAt(j))) break;
        }
        if (j < len && j !== last) {
          const firstPart = path2.slice(last, j);
          last = j;
          for (; j < len; ++j) {
            if (!isPathSeparator(path2.charCodeAt(j))) break;
          }
          if (j < len && j !== last) {
            last = j;
            for (; j < len; ++j) {
              if (isPathSeparator(path2.charCodeAt(j))) break;
            }
            if (j === len) {
              return `\\\\${firstPart}\\${path2.slice(last)}\\`;
            } else if (j !== last) {
              device = `\\\\${firstPart}\\${path2.slice(last, j)}`;
              rootEnd = j;
            }
          }
        }
      } else {
        rootEnd = 1;
      }
    } else if (isWindowsDeviceRoot(code)) {
      if (path2.charCodeAt(1) === CHAR_COLON) {
        device = path2.slice(0, 2);
        rootEnd = 2;
        if (len > 2) {
          if (isPathSeparator(path2.charCodeAt(2))) {
            isAbsolute2 = true;
            rootEnd = 3;
          }
        }
      }
    }
  } else if (isPathSeparator(code)) {
    return "\\";
  }
  let tail;
  if (rootEnd < len) {
    tail = normalizeString(path2.slice(rootEnd), !isAbsolute2, "\\", isPathSeparator);
  } else {
    tail = "";
  }
  if (tail.length === 0 && !isAbsolute2) tail = ".";
  if (tail.length > 0 && isPathSeparator(path2.charCodeAt(len - 1))) {
    tail += "\\";
  }
  if (device === void 0) {
    if (isAbsolute2) {
      if (tail.length > 0) return `\\${tail}`;
      else return "\\";
    } else if (tail.length > 0) {
      return tail;
    } else {
      return "";
    }
  } else if (isAbsolute2) {
    if (tail.length > 0) return `${device}\\${tail}`;
    else return `${device}\\`;
  } else if (tail.length > 0) {
    return device + tail;
  } else {
    return device;
  }
}

// deno:https://deno.land/std@0.200.0/path/_is_absolute.ts
function windowsIsAbsolute(path2) {
  assertPath(path2);
  const len = path2.length;
  if (len === 0) return false;
  const code = path2.charCodeAt(0);
  if (isPathSeparator(code)) {
    return true;
  } else if (isWindowsDeviceRoot(code)) {
    if (len > 2 && path2.charCodeAt(1) === CHAR_COLON) {
      if (isPathSeparator(path2.charCodeAt(2))) return true;
    }
  }
  return false;
}
function posixIsAbsolute(path2) {
  assertPath(path2);
  return path2.length > 0 && isPosixPathSeparator(path2.charCodeAt(0));
}

// deno:https://deno.land/std@0.200.0/path/_join.ts
function posixJoin(...paths) {
  if (paths.length === 0) return ".";
  let joined;
  for (let i = 0, len = paths.length; i < len; ++i) {
    const path2 = paths[i];
    assertPath(path2);
    if (path2.length > 0) {
      if (!joined) joined = path2;
      else joined += `/${path2}`;
    }
  }
  if (!joined) return ".";
  return posixNormalize(joined);
}
function windowsJoin(...paths) {
  if (paths.length === 0) return ".";
  let joined;
  let firstPart = null;
  for (let i = 0; i < paths.length; ++i) {
    const path2 = paths[i];
    assertPath(path2);
    if (path2.length > 0) {
      if (joined === void 0) joined = firstPart = path2;
      else joined += `\\${path2}`;
    }
  }
  if (joined === void 0) return ".";
  let needsReplace = true;
  let slashCount = 0;
  assert(firstPart != null);
  if (isPathSeparator(firstPart.charCodeAt(0))) {
    ++slashCount;
    const firstLen = firstPart.length;
    if (firstLen > 1) {
      if (isPathSeparator(firstPart.charCodeAt(1))) {
        ++slashCount;
        if (firstLen > 2) {
          if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
          else {
            needsReplace = false;
          }
        }
      }
    }
  }
  if (needsReplace) {
    for (; slashCount < joined.length; ++slashCount) {
      if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
    }
    if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
  }
  return windowsNormalize(joined);
}

// deno:https://deno.land/std@0.200.0/path/_relative.ts
function assertArgs(from, to) {
  assertPath(from);
  assertPath(to);
  if (from === to) return "";
}
function posixRelative(from, to) {
  assertArgs(from, to);
  from = posixResolve(from);
  to = posixResolve(to);
  if (from === to) return "";
  let fromStart = 1;
  const fromEnd = from.length;
  for (; fromStart < fromEnd; ++fromStart) {
    if (!isPosixPathSeparator(from.charCodeAt(fromStart))) break;
  }
  const fromLen = fromEnd - fromStart;
  let toStart = 1;
  const toEnd = to.length;
  for (; toStart < toEnd; ++toStart) {
    if (!isPosixPathSeparator(to.charCodeAt(toStart))) break;
  }
  const toLen = toEnd - toStart;
  const length = fromLen < toLen ? fromLen : toLen;
  let lastCommonSep = -1;
  let i = 0;
  for (; i <= length; ++i) {
    if (i === length) {
      if (toLen > length) {
        if (isPosixPathSeparator(to.charCodeAt(toStart + i))) {
          return to.slice(toStart + i + 1);
        } else if (i === 0) {
          return to.slice(toStart + i);
        }
      } else if (fromLen > length) {
        if (isPosixPathSeparator(from.charCodeAt(fromStart + i))) {
          lastCommonSep = i;
        } else if (i === 0) {
          lastCommonSep = 0;
        }
      }
      break;
    }
    const fromCode = from.charCodeAt(fromStart + i);
    const toCode = to.charCodeAt(toStart + i);
    if (fromCode !== toCode) break;
    else if (isPosixPathSeparator(fromCode)) lastCommonSep = i;
  }
  let out = "";
  for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
    if (i === fromEnd || isPosixPathSeparator(from.charCodeAt(i))) {
      if (out.length === 0) out += "..";
      else out += "/..";
    }
  }
  if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
  else {
    toStart += lastCommonSep;
    if (isPosixPathSeparator(to.charCodeAt(toStart))) ++toStart;
    return to.slice(toStart);
  }
}
function windowsRelative(from, to) {
  assertArgs(from, to);
  const fromOrig = windowsResolve(from);
  const toOrig = windowsResolve(to);
  if (fromOrig === toOrig) return "";
  from = fromOrig.toLowerCase();
  to = toOrig.toLowerCase();
  if (from === to) return "";
  let fromStart = 0;
  let fromEnd = from.length;
  for (; fromStart < fromEnd; ++fromStart) {
    if (from.charCodeAt(fromStart) !== CHAR_BACKWARD_SLASH) break;
  }
  for (; fromEnd - 1 > fromStart; --fromEnd) {
    if (from.charCodeAt(fromEnd - 1) !== CHAR_BACKWARD_SLASH) break;
  }
  const fromLen = fromEnd - fromStart;
  let toStart = 0;
  let toEnd = to.length;
  for (; toStart < toEnd; ++toStart) {
    if (to.charCodeAt(toStart) !== CHAR_BACKWARD_SLASH) break;
  }
  for (; toEnd - 1 > toStart; --toEnd) {
    if (to.charCodeAt(toEnd - 1) !== CHAR_BACKWARD_SLASH) break;
  }
  const toLen = toEnd - toStart;
  const length = fromLen < toLen ? fromLen : toLen;
  let lastCommonSep = -1;
  let i = 0;
  for (; i <= length; ++i) {
    if (i === length) {
      if (toLen > length) {
        if (to.charCodeAt(toStart + i) === CHAR_BACKWARD_SLASH) {
          return toOrig.slice(toStart + i + 1);
        } else if (i === 2) {
          return toOrig.slice(toStart + i);
        }
      }
      if (fromLen > length) {
        if (from.charCodeAt(fromStart + i) === CHAR_BACKWARD_SLASH) {
          lastCommonSep = i;
        } else if (i === 2) {
          lastCommonSep = 3;
        }
      }
      break;
    }
    const fromCode = from.charCodeAt(fromStart + i);
    const toCode = to.charCodeAt(toStart + i);
    if (fromCode !== toCode) break;
    else if (fromCode === CHAR_BACKWARD_SLASH) lastCommonSep = i;
  }
  if (i !== length && lastCommonSep === -1) {
    return toOrig;
  }
  let out = "";
  if (lastCommonSep === -1) lastCommonSep = 0;
  for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
    if (i === fromEnd || from.charCodeAt(i) === CHAR_BACKWARD_SLASH) {
      if (out.length === 0) out += "..";
      else out += "\\..";
    }
  }
  if (out.length > 0) {
    return out + toOrig.slice(toStart + lastCommonSep, toEnd);
  } else {
    toStart += lastCommonSep;
    if (toOrig.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) ++toStart;
    return toOrig.slice(toStart, toEnd);
  }
}

// deno:https://deno.land/std@0.200.0/path/_to_namespaced_path.ts
function posixToNamespacedPath(path2) {
  return path2;
}
function windowsToNamespacedPath(path2) {
  if (typeof path2 !== "string") return path2;
  if (path2.length === 0) return "";
  const resolvedPath = windowsResolve(path2);
  if (resolvedPath.length >= 3) {
    if (resolvedPath.charCodeAt(0) === CHAR_BACKWARD_SLASH) {
      if (resolvedPath.charCodeAt(1) === CHAR_BACKWARD_SLASH) {
        const code = resolvedPath.charCodeAt(2);
        if (code !== CHAR_QUESTION_MARK && code !== CHAR_DOT) {
          return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
        }
      }
    } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
      if (resolvedPath.charCodeAt(1) === CHAR_COLON && resolvedPath.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
        return `\\\\?\\${resolvedPath}`;
      }
    }
  }
  return path2;
}

// deno:https://deno.land/std@0.200.0/path/_dirname.ts
function assertArg2(path2) {
  assertPath(path2);
  if (path2.length === 0) return ".";
}
function posixDirname(path2) {
  assertArg2(path2);
  let end = -1;
  let matchedNonSeparator = false;
  for (let i = path2.length - 1; i >= 1; --i) {
    if (isPosixPathSeparator(path2.charCodeAt(i))) {
      if (matchedNonSeparator) {
        end = i;
        break;
      }
    } else {
      matchedNonSeparator = true;
    }
  }
  if (end === -1) {
    return isPosixPathSeparator(path2.charCodeAt(0)) ? "/" : ".";
  }
  return stripTrailingSeparators(path2.slice(0, end), isPosixPathSeparator);
}
function windowsDirname(path2) {
  assertArg2(path2);
  const len = path2.length;
  let rootEnd = -1;
  let end = -1;
  let matchedSlash = true;
  let offset = 0;
  const code = path2.charCodeAt(0);
  if (len > 1) {
    if (isPathSeparator(code)) {
      rootEnd = offset = 1;
      if (isPathSeparator(path2.charCodeAt(1))) {
        let j = 2;
        let last = j;
        for (; j < len; ++j) {
          if (isPathSeparator(path2.charCodeAt(j))) break;
        }
        if (j < len && j !== last) {
          last = j;
          for (; j < len; ++j) {
            if (!isPathSeparator(path2.charCodeAt(j))) break;
          }
          if (j < len && j !== last) {
            last = j;
            for (; j < len; ++j) {
              if (isPathSeparator(path2.charCodeAt(j))) break;
            }
            if (j === len) {
              return path2;
            }
            if (j !== last) {
              rootEnd = offset = j + 1;
            }
          }
        }
      }
    } else if (isWindowsDeviceRoot(code)) {
      if (path2.charCodeAt(1) === CHAR_COLON) {
        rootEnd = offset = 2;
        if (len > 2) {
          if (isPathSeparator(path2.charCodeAt(2))) rootEnd = offset = 3;
        }
      }
    }
  } else if (isPathSeparator(code)) {
    return path2;
  }
  for (let i = len - 1; i >= offset; --i) {
    if (isPathSeparator(path2.charCodeAt(i))) {
      if (!matchedSlash) {
        end = i;
        break;
      }
    } else {
      matchedSlash = false;
    }
  }
  if (end === -1) {
    if (rootEnd === -1) return ".";
    else end = rootEnd;
  }
  return stripTrailingSeparators(path2.slice(0, end), isPosixPathSeparator);
}

// deno:https://deno.land/std@0.200.0/path/_basename.ts
function stripSuffix(name, suffix) {
  if (suffix.length >= name.length) {
    return name;
  }
  const lenDiff = name.length - suffix.length;
  for (let i = suffix.length - 1; i >= 0; --i) {
    if (name.charCodeAt(lenDiff + i) !== suffix.charCodeAt(i)) {
      return name;
    }
  }
  return name.slice(0, -suffix.length);
}
function lastPathSegment(path2, isSep, start = 0) {
  let matchedNonSeparator = false;
  let end = path2.length;
  for (let i = path2.length - 1; i >= start; --i) {
    if (isSep(path2.charCodeAt(i))) {
      if (matchedNonSeparator) {
        start = i + 1;
        break;
      }
    } else if (!matchedNonSeparator) {
      matchedNonSeparator = true;
      end = i + 1;
    }
  }
  return path2.slice(start, end);
}
function assertArgs2(path2, suffix) {
  assertPath(path2);
  if (path2.length === 0) return path2;
  if (typeof suffix !== "string") {
    throw new TypeError(`Suffix must be a string. Received ${JSON.stringify(suffix)}`);
  }
}
function posixBasename(path2, suffix = "") {
  assertArgs2(path2, suffix);
  const lastSegment = lastPathSegment(path2, isPosixPathSeparator);
  const strippedSegment = stripTrailingSeparators(lastSegment, isPosixPathSeparator);
  return suffix ? stripSuffix(strippedSegment, suffix) : strippedSegment;
}
function windowsBasename(path2, suffix = "") {
  assertArgs2(path2, suffix);
  let start = 0;
  if (path2.length >= 2) {
    const drive = path2.charCodeAt(0);
    if (isWindowsDeviceRoot(drive)) {
      if (path2.charCodeAt(1) === CHAR_COLON) start = 2;
    }
  }
  const lastSegment = lastPathSegment(path2, isPathSeparator, start);
  const strippedSegment = stripTrailingSeparators(lastSegment, isPathSeparator);
  return suffix ? stripSuffix(strippedSegment, suffix) : strippedSegment;
}

// deno:https://deno.land/std@0.200.0/path/_extname.ts
function posixExtname(path2) {
  assertPath(path2);
  let startDot = -1;
  let startPart = 0;
  let end = -1;
  let matchedSlash = true;
  let preDotState = 0;
  for (let i = path2.length - 1; i >= 0; --i) {
    const code = path2.charCodeAt(i);
    if (isPosixPathSeparator(code)) {
      if (!matchedSlash) {
        startPart = i + 1;
        break;
      }
      continue;
    }
    if (end === -1) {
      matchedSlash = false;
      end = i + 1;
    }
    if (code === CHAR_DOT) {
      if (startDot === -1) startDot = i;
      else if (preDotState !== 1) preDotState = 1;
    } else if (startDot !== -1) {
      preDotState = -1;
    }
  }
  if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
  preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
  preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return "";
  }
  return path2.slice(startDot, end);
}
function windowsExtname(path2) {
  assertPath(path2);
  let start = 0;
  let startDot = -1;
  let startPart = 0;
  let end = -1;
  let matchedSlash = true;
  let preDotState = 0;
  if (path2.length >= 2 && path2.charCodeAt(1) === CHAR_COLON && isWindowsDeviceRoot(path2.charCodeAt(0))) {
    start = startPart = 2;
  }
  for (let i = path2.length - 1; i >= start; --i) {
    const code = path2.charCodeAt(i);
    if (isPathSeparator(code)) {
      if (!matchedSlash) {
        startPart = i + 1;
        break;
      }
      continue;
    }
    if (end === -1) {
      matchedSlash = false;
      end = i + 1;
    }
    if (code === CHAR_DOT) {
      if (startDot === -1) startDot = i;
      else if (preDotState !== 1) preDotState = 1;
    } else if (startDot !== -1) {
      preDotState = -1;
    }
  }
  if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
  preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
  preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return "";
  }
  return path2.slice(startDot, end);
}

// deno:https://deno.land/std@0.200.0/path/_format.ts
function _format(sep3, pathObject) {
  const dir = pathObject.dir || pathObject.root;
  const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
  if (!dir) return base;
  if (base === sep3) return dir;
  if (dir === pathObject.root) return dir + base;
  return dir + sep3 + base;
}
function assertArg3(pathObject) {
  if (pathObject === null || typeof pathObject !== "object") {
    throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
  }
}
function posixFormat(pathObject) {
  assertArg3(pathObject);
  return _format("/", pathObject);
}
function windowsFormat(pathObject) {
  assertArg3(pathObject);
  return _format("\\", pathObject);
}

// deno:https://deno.land/std@0.200.0/path/_parse.ts
function posixParse(path2) {
  assertPath(path2);
  const ret = {
    root: "",
    dir: "",
    base: "",
    ext: "",
    name: ""
  };
  if (path2.length === 0) return ret;
  const isAbsolute2 = isPosixPathSeparator(path2.charCodeAt(0));
  let start;
  if (isAbsolute2) {
    ret.root = "/";
    start = 1;
  } else {
    start = 0;
  }
  let startDot = -1;
  let startPart = 0;
  let end = -1;
  let matchedSlash = true;
  let i = path2.length - 1;
  let preDotState = 0;
  for (; i >= start; --i) {
    const code = path2.charCodeAt(i);
    if (isPosixPathSeparator(code)) {
      if (!matchedSlash) {
        startPart = i + 1;
        break;
      }
      continue;
    }
    if (end === -1) {
      matchedSlash = false;
      end = i + 1;
    }
    if (code === CHAR_DOT) {
      if (startDot === -1) startDot = i;
      else if (preDotState !== 1) preDotState = 1;
    } else if (startDot !== -1) {
      preDotState = -1;
    }
  }
  if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
  preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
  preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    if (end !== -1) {
      if (startPart === 0 && isAbsolute2) {
        ret.base = ret.name = path2.slice(1, end);
      } else {
        ret.base = ret.name = path2.slice(startPart, end);
      }
    }
    ret.base = ret.base || "/";
  } else {
    if (startPart === 0 && isAbsolute2) {
      ret.name = path2.slice(1, startDot);
      ret.base = path2.slice(1, end);
    } else {
      ret.name = path2.slice(startPart, startDot);
      ret.base = path2.slice(startPart, end);
    }
    ret.ext = path2.slice(startDot, end);
  }
  if (startPart > 0) {
    ret.dir = stripTrailingSeparators(path2.slice(0, startPart - 1), isPosixPathSeparator);
  } else if (isAbsolute2) ret.dir = "/";
  return ret;
}
function windowsParse(path2) {
  assertPath(path2);
  const ret = {
    root: "",
    dir: "",
    base: "",
    ext: "",
    name: ""
  };
  const len = path2.length;
  if (len === 0) return ret;
  let rootEnd = 0;
  let code = path2.charCodeAt(0);
  if (len > 1) {
    if (isPathSeparator(code)) {
      rootEnd = 1;
      if (isPathSeparator(path2.charCodeAt(1))) {
        let j = 2;
        let last = j;
        for (; j < len; ++j) {
          if (isPathSeparator(path2.charCodeAt(j))) break;
        }
        if (j < len && j !== last) {
          last = j;
          for (; j < len; ++j) {
            if (!isPathSeparator(path2.charCodeAt(j))) break;
          }
          if (j < len && j !== last) {
            last = j;
            for (; j < len; ++j) {
              if (isPathSeparator(path2.charCodeAt(j))) break;
            }
            if (j === len) {
              rootEnd = j;
            } else if (j !== last) {
              rootEnd = j + 1;
            }
          }
        }
      }
    } else if (isWindowsDeviceRoot(code)) {
      if (path2.charCodeAt(1) === CHAR_COLON) {
        rootEnd = 2;
        if (len > 2) {
          if (isPathSeparator(path2.charCodeAt(2))) {
            if (len === 3) {
              ret.root = ret.dir = path2;
              ret.base = "\\";
              return ret;
            }
            rootEnd = 3;
          }
        } else {
          ret.root = ret.dir = path2;
          return ret;
        }
      }
    }
  } else if (isPathSeparator(code)) {
    ret.root = ret.dir = path2;
    ret.base = "\\";
    return ret;
  }
  if (rootEnd > 0) ret.root = path2.slice(0, rootEnd);
  let startDot = -1;
  let startPart = rootEnd;
  let end = -1;
  let matchedSlash = true;
  let i = path2.length - 1;
  let preDotState = 0;
  for (; i >= rootEnd; --i) {
    code = path2.charCodeAt(i);
    if (isPathSeparator(code)) {
      if (!matchedSlash) {
        startPart = i + 1;
        break;
      }
      continue;
    }
    if (end === -1) {
      matchedSlash = false;
      end = i + 1;
    }
    if (code === CHAR_DOT) {
      if (startDot === -1) startDot = i;
      else if (preDotState !== 1) preDotState = 1;
    } else if (startDot !== -1) {
      preDotState = -1;
    }
  }
  if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
  preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
  preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    if (end !== -1) {
      ret.base = ret.name = path2.slice(startPart, end);
    }
  } else {
    ret.name = path2.slice(startPart, startDot);
    ret.base = path2.slice(startPart, end);
    ret.ext = path2.slice(startDot, end);
  }
  ret.base = ret.base || "\\";
  if (startPart > 0 && startPart !== rootEnd) {
    ret.dir = path2.slice(0, startPart - 1);
  } else ret.dir = ret.root;
  return ret;
}

// deno:https://deno.land/std@0.200.0/path/_from_file_url.ts
function assertArg4(url) {
  url = url instanceof URL ? url : new URL(url);
  if (url.protocol != "file:") {
    throw new TypeError("Must be a file URL.");
  }
  return url;
}
function posixFromFileUrl(url) {
  url = assertArg4(url);
  return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function windowsFromFileUrl(url) {
  url = assertArg4(url);
  let path2 = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
  if (url.hostname != "") {
    path2 = `\\\\${url.hostname}${path2}`;
  }
  return path2;
}

// deno:https://deno.land/std@0.200.0/path/_to_file_url.ts
var WHITESPACE_ENCODINGS = {
  "	": "%09",
  "\n": "%0A",
  "\v": "%0B",
  "\f": "%0C",
  "\r": "%0D",
  " ": "%20"
};
function encodeWhitespace(string) {
  return string.replaceAll(/[\s]/g, (c) => {
    return WHITESPACE_ENCODINGS[c] ?? c;
  });
}
function posixToFileUrl(path2) {
  if (!posixIsAbsolute(path2)) {
    throw new TypeError("Must be an absolute path.");
  }
  const url = new URL("file:///");
  url.pathname = encodeWhitespace(path2.replace(/%/g, "%25").replace(/\\/g, "%5C"));
  return url;
}
function windowsToFileUrl(path2) {
  if (!windowsIsAbsolute(path2)) {
    throw new TypeError("Must be an absolute path.");
  }
  const [, hostname, pathname] = path2.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\](?:[^/\\]|$)))?(.*)/);
  const url = new URL("file:///");
  url.pathname = encodeWhitespace(pathname.replace(/%/g, "%25"));
  if (hostname != null && hostname != "localhost") {
    url.hostname = hostname;
    if (!url.hostname) {
      throw new TypeError("Invalid hostname.");
    }
  }
  return url;
}

// deno:https://deno.land/std@0.200.0/path/win32.ts
var sep = "\\";
var delimiter = ";";

// deno:https://deno.land/std@0.200.0/path/posix.ts
var posix_exports = {};
__export(posix_exports, {
  basename: () => posixBasename,
  delimiter: () => delimiter2,
  dirname: () => posixDirname,
  extname: () => posixExtname,
  format: () => posixFormat,
  fromFileUrl: () => posixFromFileUrl,
  isAbsolute: () => posixIsAbsolute,
  join: () => posixJoin,
  normalize: () => posixNormalize,
  parse: () => posixParse,
  relative: () => posixRelative,
  resolve: () => posixResolve,
  sep: () => sep2,
  toFileUrl: () => posixToFileUrl,
  toNamespacedPath: () => posixToNamespacedPath
});
var sep2 = "/";
var delimiter2 = ":";

// deno:https://deno.land/std@0.200.0/path/basename.ts
function basename(path2, suffix = "") {
  return isWindows ? windowsBasename(path2, suffix) : posixBasename(path2, suffix);
}

// deno:https://deno.land/std@0.200.0/path/extname.ts
function extname(path2) {
  return isWindows ? windowsExtname(path2) : posixExtname(path2);
}

// deno:https://deno.land/std@0.200.0/path/is_absolute.ts
function isAbsolute(path2) {
  return isWindows ? windowsIsAbsolute(path2) : posixIsAbsolute(path2);
}

// deno:https://deno.land/std@0.200.0/path/join.ts
function join(...paths) {
  return isWindows ? windowsJoin(...paths) : posixJoin(...paths);
}

// deno:https://deno.land/std@0.200.0/path/normalize.ts
function normalize(path2) {
  return isWindows ? windowsNormalize(path2) : posixNormalize(path2);
}

// deno:https://deno.land/std@0.200.0/path/parse.ts
function parse(path2) {
  return isWindows ? windowsParse(path2) : posixParse(path2);
}

// deno:https://deno.land/std@0.200.0/path/separator.ts
var SEP = isWindows ? "\\" : "/";

// deno:https://deno.land/std@0.200.0/path/glob.ts
var path = isWindows ? win32_exports : posix_exports;
var { join: join2, normalize: normalize2 } = path;

// deno:https://deno.land/std@0.200.0/path/mod.ts
var win32 = win32_exports;
var posix = posix_exports;
var delimiter3 = isWindows ? win32.delimiter : posix.delimiter;

// deno:https://deno.land/x/path_to_regexp@v6.2.1/index.ts
function lexer(str) {
  const tokens = [];
  let i = 0;
  while (i < str.length) {
    const char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({
        type: "MODIFIER",
        index: i,
        value: str[i++]
      });
      continue;
    }
    if (char === "\\") {
      tokens.push({
        type: "ESCAPED_CHAR",
        index: i++,
        value: str[i++]
      });
      continue;
    }
    if (char === "{") {
      tokens.push({
        type: "OPEN",
        index: i,
        value: str[i++]
      });
      continue;
    }
    if (char === "}") {
      tokens.push({
        type: "CLOSE",
        index: i,
        value: str[i++]
      });
      continue;
    }
    if (char === ":") {
      let name = "";
      let j = i + 1;
      while (j < str.length) {
        const code = str.charCodeAt(j);
        if (code >= 48 && code <= 57 || // `A-Z`
        code >= 65 && code <= 90 || // `a-z`
        code >= 97 && code <= 122 || // `_`
        code === 95) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name) throw new TypeError(`Missing parameter name at ${i}`);
      tokens.push({
        type: "NAME",
        index: i,
        value: name
      });
      i = j;
      continue;
    }
    if (char === "(") {
      let count = 1;
      let pattern = "";
      let j = i + 1;
      if (str[j] === "?") {
        throw new TypeError(`Pattern cannot start with "?" at ${j}`);
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError(`Capturing groups are not allowed at ${j}`);
          }
        }
        pattern += str[j++];
      }
      if (count) throw new TypeError(`Unbalanced pattern at ${i}`);
      if (!pattern) throw new TypeError(`Missing pattern at ${i}`);
      tokens.push({
        type: "PATTERN",
        index: i,
        value: pattern
      });
      i = j;
      continue;
    }
    tokens.push({
      type: "CHAR",
      index: i,
      value: str[i++]
    });
  }
  tokens.push({
    type: "END",
    index: i,
    value: ""
  });
  return tokens;
}
function parse2(str, options = {}) {
  const tokens = lexer(str);
  const { prefixes = "./" } = options;
  const defaultPattern = `[^${escapeString(options.delimiter || "/#?")}]+?`;
  const result = [];
  let key = 0;
  let i = 0;
  let path2 = "";
  const tryConsume = (type) => {
    if (i < tokens.length && tokens[i].type === type) return tokens[i++].value;
  };
  const mustConsume = (type) => {
    const value = tryConsume(type);
    if (value !== void 0) return value;
    const { type: nextType, index } = tokens[i];
    throw new TypeError(`Unexpected ${nextType} at ${index}, expected ${type}`);
  };
  const consumeText = () => {
    let result2 = "";
    let value;
    while (value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value;
    }
    return result2;
  };
  while (i < tokens.length) {
    const char = tryConsume("CHAR");
    const name = tryConsume("NAME");
    const pattern = tryConsume("PATTERN");
    if (name || pattern) {
      let prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path2 += prefix;
        prefix = "";
      }
      if (path2) {
        result.push(path2);
        path2 = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || defaultPattern,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    const value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path2 += value;
      continue;
    }
    if (path2) {
      result.push(path2);
      path2 = "";
    }
    const open = tryConsume("OPEN");
    if (open) {
      const prefix = consumeText();
      const name2 = tryConsume("NAME") || "";
      const pattern2 = tryConsume("PATTERN") || "";
      const suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name2 || (pattern2 ? key++ : ""),
        pattern: name2 && !pattern2 ? defaultPattern : pattern2,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
function compile(str, options) {
  return tokensToFunction(parse2(str, options), options);
}
function tokensToFunction(tokens, options = {}) {
  const reFlags = flags(options);
  const { encode: encode3 = (x) => x, validate = true } = options;
  const matches = tokens.map((token) => {
    if (typeof token === "object") {
      return new RegExp(`^(?:${token.pattern})$`, reFlags);
    }
  });
  return (data) => {
    let path2 = "";
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (typeof token === "string") {
        path2 += token;
        continue;
      }
      const value = data ? data[token.name] : void 0;
      const optional = token.modifier === "?" || token.modifier === "*";
      const repeat = token.modifier === "*" || token.modifier === "+";
      if (Array.isArray(value)) {
        if (!repeat) {
          throw new TypeError(`Expected "${token.name}" to not repeat, but got an array`);
        }
        if (value.length === 0) {
          if (optional) continue;
          throw new TypeError(`Expected "${token.name}" to not be empty`);
        }
        for (let j = 0; j < value.length; j++) {
          const segment = encode3(value[j], token);
          if (validate && !matches[i].test(segment)) {
            throw new TypeError(`Expected all "${token.name}" to match "${token.pattern}", but got "${segment}"`);
          }
          path2 += token.prefix + segment + token.suffix;
        }
        continue;
      }
      if (typeof value === "string" || typeof value === "number") {
        const segment = encode3(String(value), token);
        if (validate && !matches[i].test(segment)) {
          throw new TypeError(`Expected "${token.name}" to match "${token.pattern}", but got "${segment}"`);
        }
        path2 += token.prefix + segment + token.suffix;
        continue;
      }
      if (optional) continue;
      const typeOfMessage = repeat ? "an array" : "a string";
      throw new TypeError(`Expected "${token.name}" to be ${typeOfMessage}`);
    }
    return path2;
  };
}
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
function regexpToRegexp(path2, keys2) {
  if (!keys2) return path2;
  const groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  let index = 0;
  let execResult = groupsRegex.exec(path2.source);
  while (execResult) {
    keys2.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path2.source);
  }
  return path2;
}
function arrayToRegexp(paths, keys2, options) {
  const parts2 = paths.map((path2) => pathToRegexp(path2, keys2, options).source);
  return new RegExp(`(?:${parts2.join("|")})`, flags(options));
}
function stringToRegexp(path2, keys2, options) {
  return tokensToRegexp(parse2(path2, options), keys2, options);
}
function tokensToRegexp(tokens, keys2, options = {}) {
  const { strict = false, start = true, end = true, encode: encode3 = (x) => x, delimiter: delimiter4 = "/#?", endsWith = "" } = options;
  const endsWithRe = `[${escapeString(endsWith)}]|$`;
  const delimiterRe = `[${escapeString(delimiter4)}]`;
  let route = start ? "^" : "";
  for (const token of tokens) {
    if (typeof token === "string") {
      route += escapeString(encode3(token));
    } else {
      const prefix = escapeString(encode3(token.prefix));
      const suffix = escapeString(encode3(token.suffix));
      if (token.pattern) {
        if (keys2) keys2.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            const mod = token.modifier === "*" ? "?" : "";
            route += `(?:${prefix}((?:${token.pattern})(?:${suffix}${prefix}(?:${token.pattern}))*)${suffix})${mod}`;
          } else {
            route += `(?:${prefix}(${token.pattern})${suffix})${token.modifier}`;
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            route += `((?:${token.pattern})${token.modifier})`;
          } else {
            route += `(${token.pattern})${token.modifier}`;
          }
        }
      } else {
        route += `(?:${prefix}${suffix})${token.modifier}`;
      }
    }
  }
  if (end) {
    if (!strict) route += `${delimiterRe}?`;
    route += !options.endsWith ? "$" : `(?=${endsWithRe})`;
  } else {
    const endToken = tokens[tokens.length - 1];
    const isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += `(?:${delimiterRe}(?=${endsWithRe}))?`;
    }
    if (!isEndDelimited) {
      route += `(?=${delimiterRe}|${endsWithRe})`;
    }
  }
  return new RegExp(route, flags(options));
}
function pathToRegexp(path2, keys2, options) {
  if (path2 instanceof RegExp) return regexpToRegexp(path2, keys2);
  if (Array.isArray(path2)) return arrayToRegexp(path2, keys2, options);
  return stringToRegexp(path2, keys2, options);
}

// deno:https://deno.land/x/oak@v12.6.1/mediaTyper.ts
var SUBTYPE_NAME_REGEXP = /^[A-Za-z0-9][A-Za-z0-9!#$&^_.-]{0,126}$/;
var TYPE_NAME_REGEXP = /^[A-Za-z0-9][A-Za-z0-9!#$&^_-]{0,126}$/;
var TYPE_REGEXP = /^ *([A-Za-z0-9][A-Za-z0-9!#$&^_-]{0,126})\/([A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,126}) *$/;
var MediaType = class {
  type;
  subtype;
  suffix;
  constructor(type, subtype, suffix) {
    this.type = type;
    this.subtype = subtype;
    this.suffix = suffix;
  }
};
function format(obj) {
  const { subtype, suffix, type } = obj;
  if (!TYPE_NAME_REGEXP.test(type)) {
    throw new TypeError("Invalid type.");
  }
  if (!SUBTYPE_NAME_REGEXP.test(subtype)) {
    throw new TypeError("Invalid subtype.");
  }
  let str = `${type}/${subtype}`;
  if (suffix) {
    if (!TYPE_NAME_REGEXP.test(suffix)) {
      throw new TypeError("Invalid suffix.");
    }
    str += `+${suffix}`;
  }
  return str;
}
function parse3(str) {
  const match2 = TYPE_REGEXP.exec(str.toLowerCase());
  if (!match2) {
    throw new TypeError("Invalid media type.");
  }
  let [, type, subtype] = match2;
  let suffix;
  const idx = subtype.lastIndexOf("+");
  if (idx !== -1) {
    suffix = subtype.substr(idx + 1);
    subtype = subtype.substr(0, idx);
  }
  return new MediaType(type, subtype, suffix);
}

// deno:https://deno.land/x/oak@v12.6.1/isMediaType.ts
function mimeMatch(expected, actual) {
  if (expected === void 0) {
    return false;
  }
  const actualParts = actual.split("/");
  const expectedParts = expected.split("/");
  if (actualParts.length !== 2 || expectedParts.length !== 2) {
    return false;
  }
  const [actualType, actualSubtype] = actualParts;
  const [expectedType, expectedSubtype] = expectedParts;
  if (expectedType !== "*" && expectedType !== actualType) {
    return false;
  }
  if (expectedSubtype.substr(0, 2) === "*+") {
    return expectedSubtype.length <= actualSubtype.length + 1 && expectedSubtype.substr(1) === actualSubtype.substr(1 - expectedSubtype.length);
  }
  if (expectedSubtype !== "*" && expectedSubtype !== actualSubtype) {
    return false;
  }
  return true;
}
function normalize3(type) {
  if (type === "urlencoded") {
    return "application/x-www-form-urlencoded";
  } else if (type === "multipart") {
    return "multipart/*";
  } else if (type[0] === "+") {
    return `*/*${type}`;
  }
  return type.includes("/") ? type : typeByExtension(type);
}
function normalizeType(value) {
  try {
    const val = value.split(";");
    const type = parse3(val[0]);
    return format(type);
  } catch {
    return;
  }
}
function isMediaType(value, types2) {
  const val = normalizeType(value);
  if (!val) {
    return false;
  }
  if (!types2.length) {
    return val;
  }
  for (const type of types2) {
    if (mimeMatch(normalize3(type), val)) {
      return type[0] === "+" || type.includes("*") ? val : type;
    }
  }
  return false;
}

// deno:https://deno.land/x/oak@v12.6.1/util.ts
var ENCODE_CHARS_REGEXP = /(?:[^\x21\x25\x26-\x3B\x3D\x3F-\x5B\x5D\x5F\x61-\x7A\x7E]|%(?:[^0-9A-Fa-f]|[0-9A-Fa-f][^0-9A-Fa-f]|$))+/g;
var HTAB = "	".charCodeAt(0);
var SPACE = " ".charCodeAt(0);
var CR2 = "\r".charCodeAt(0);
var LF2 = "\n".charCodeAt(0);
var UNMATCHED_SURROGATE_PAIR_REGEXP = /(^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]|[\uD800-\uDBFF]([^\uDC00-\uDFFF]|$)/g;
var UNMATCHED_SURROGATE_PAIR_REPLACE = "$1\uFFFD$2";
var DEFAULT_CHUNK_SIZE2 = 16640;
var BODY_TYPES = [
  "string",
  "number",
  "bigint",
  "boolean",
  "symbol"
];
function assert2(cond, msg = "Assertion failed") {
  if (!cond) {
    throw new Error(msg);
  }
}
function decodeComponent(text) {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}
function encodeUrl(url) {
  return String(url).replace(UNMATCHED_SURROGATE_PAIR_REGEXP, UNMATCHED_SURROGATE_PAIR_REPLACE).replace(ENCODE_CHARS_REGEXP, encodeURI);
}
function bufferToHex(buffer) {
  const arr = Array.from(new Uint8Array(buffer));
  return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function getRandomFilename(prefix = "", extension2 = "") {
  const buffer = await crypto.subtle.digest("SHA-1", crypto.getRandomValues(new Uint8Array(256)));
  return `${prefix}${bufferToHex(buffer)}${extension2 ? `.${extension2}` : ""}`;
}
async function getBoundary() {
  const buffer = await crypto.subtle.digest("SHA-1", crypto.getRandomValues(new Uint8Array(256)));
  return `oak_${bufferToHex(buffer)}`;
}
function isAsyncIterable(value) {
  return typeof value === "object" && value !== null && Symbol.asyncIterator in value && // deno-lint-ignore no-explicit-any
  typeof value[Symbol.asyncIterator] === "function";
}
function isReader(value) {
  return typeof value === "object" && value !== null && "read" in value && typeof value.read === "function";
}
function isCloser(value) {
  return typeof value === "object" && value != null && "close" in value && // deno-lint-ignore no-explicit-any
  typeof value["close"] === "function";
}
function isConn(value) {
  return typeof value === "object" && value != null && "rid" in value && // deno-lint-ignore no-explicit-any
  typeof value.rid === "number" && "localAddr" in value && "remoteAddr" in value;
}
function isListenTlsOptions(value) {
  return typeof value === "object" && value !== null && ("cert" in value || "certFile" in value) && ("key" in value || "keyFile" in value) && "port" in value;
}
function readableStreamFromAsyncIterable(source) {
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of source) {
        if (BODY_TYPES.includes(typeof chunk)) {
          controller.enqueue(encoder4.encode(String(chunk)));
        } else if (chunk instanceof Uint8Array) {
          controller.enqueue(chunk);
        } else if (ArrayBuffer.isView(chunk)) {
          controller.enqueue(new Uint8Array(chunk.buffer));
        } else if (chunk instanceof ArrayBuffer) {
          controller.enqueue(new Uint8Array(chunk));
        } else {
          try {
            controller.enqueue(encoder4.encode(JSON.stringify(chunk)));
          } catch {
          }
        }
      }
      controller.close();
    }
  });
}
function readableStreamFromReader(reader, options = {}) {
  const { autoClose = true, chunkSize = DEFAULT_CHUNK_SIZE2, strategy } = options;
  return new ReadableStream({
    async pull(controller) {
      const chunk = new Uint8Array(chunkSize);
      try {
        const read = await reader.read(chunk);
        if (read === null) {
          if (isCloser(reader) && autoClose) {
            reader.close();
          }
          controller.close();
          return;
        }
        controller.enqueue(chunk.subarray(0, read));
      } catch (e) {
        controller.error(e);
        if (isCloser(reader)) {
          reader.close();
        }
      }
    },
    cancel() {
      if (isCloser(reader) && autoClose) {
        reader.close();
      }
    }
  }, strategy);
}
function isHtml(value) {
  return /^\s*<(?:!DOCTYPE|html|body)/i.test(value);
}
function skipLWSPChar(u8) {
  const result = new Uint8Array(u8.length);
  let j = 0;
  for (let i = 0; i < u8.length; i++) {
    if (u8[i] === SPACE || u8[i] === HTAB) continue;
    result[j++] = u8[i];
  }
  return result.slice(0, j);
}
function stripEol(value) {
  if (value[value.byteLength - 1] == LF2) {
    let drop = 1;
    if (value.byteLength > 1 && value[value.byteLength - 2] === CR2) {
      drop = 2;
    }
    return value.subarray(0, value.byteLength - drop);
  }
  return value;
}
var UP_PATH_REGEXP = /(?:^|[\\/])\.\.(?:[\\/]|$)/;
function resolvePath(rootPath, relativePath) {
  let path2 = relativePath;
  let root = rootPath;
  if (relativePath === void 0) {
    path2 = rootPath;
    root = ".";
  }
  if (path2 == null) {
    throw new TypeError("Argument relativePath is required.");
  }
  if (path2.includes("\0")) {
    throw createHttpError(400, "Malicious Path");
  }
  if (isAbsolute(path2)) {
    throw createHttpError(400, "Malicious Path");
  }
  if (UP_PATH_REGEXP.test(normalize(`.${SEP}${path2}`))) {
    throw createHttpError(403);
  }
  return normalize(join(root, path2));
}
var Uint8ArrayTransformStream = class extends TransformStream {
  constructor() {
    const init = {
      async transform(chunk, controller) {
        chunk = await chunk;
        switch (typeof chunk) {
          case "object":
            if (chunk === null) {
              controller.terminate();
            } else if (ArrayBuffer.isView(chunk)) {
              controller.enqueue(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength));
            } else if (Array.isArray(chunk) && chunk.every((value) => typeof value === "number")) {
              controller.enqueue(new Uint8Array(chunk));
            } else if (typeof chunk.valueOf === "function" && chunk.valueOf() !== chunk) {
              this.transform(chunk.valueOf(), controller);
            } else if ("toJSON" in chunk) {
              this.transform(JSON.stringify(chunk), controller);
            }
            break;
          case "symbol":
            controller.error(new TypeError("Cannot transform a symbol to a Uint8Array"));
            break;
          case "undefined":
            controller.error(new TypeError("Cannot transform undefined to a Uint8Array"));
            break;
          default:
            controller.enqueue(this.encoder.encode(String(chunk)));
        }
      },
      encoder: new TextEncoder()
    };
    super(init);
  }
};
var encoder4 = new TextEncoder();

// deno:https://deno.land/x/oak@v12.6.1/buf_reader.ts
var DEFAULT_BUF_SIZE = 4096;
var MIN_BUF_SIZE = 16;
var MAX_CONSECUTIVE_EMPTY_READS = 100;
var CR3 = "\r".charCodeAt(0);
var LF3 = "\n".charCodeAt(0);
var BufferFullError = class extends Error {
  partial;
  name;
  constructor(partial) {
    super("Buffer full"), this.partial = partial, this.name = "BufferFullError";
  }
};
var BufReader2 = class {
  #buffer;
  #reader;
  #posRead = 0;
  #posWrite = 0;
  #eof = false;
  // Reads a new chunk into the buffer.
  async #fill() {
    if (this.#posRead > 0) {
      this.#buffer.copyWithin(0, this.#posRead, this.#posWrite);
      this.#posWrite -= this.#posRead;
      this.#posRead = 0;
    }
    if (this.#posWrite >= this.#buffer.byteLength) {
      throw Error("bufio: tried to fill full buffer");
    }
    for (let i = MAX_CONSECUTIVE_EMPTY_READS; i > 0; i--) {
      const rr = await this.#reader.read(this.#buffer.subarray(this.#posWrite));
      if (rr === null) {
        this.#eof = true;
        return;
      }
      assert2(rr >= 0, "negative read");
      this.#posWrite += rr;
      if (rr > 0) {
        return;
      }
    }
    throw new Error(`No progress after ${MAX_CONSECUTIVE_EMPTY_READS} read() calls`);
  }
  #reset(buffer, reader) {
    this.#buffer = buffer;
    this.#reader = reader;
    this.#eof = false;
  }
  constructor(rd, size = DEFAULT_BUF_SIZE) {
    if (size < MIN_BUF_SIZE) {
      size = MIN_BUF_SIZE;
    }
    this.#reset(new Uint8Array(size), rd);
  }
  buffered() {
    return this.#posWrite - this.#posRead;
  }
  async readLine(strip = true) {
    let line;
    try {
      line = await this.readSlice(LF3);
    } catch (err) {
      assert2(err instanceof Error);
      let { partial } = err;
      assert2(partial instanceof Uint8Array, "Caught error from `readSlice()` without `partial` property");
      if (!(err instanceof BufferFullError)) {
        throw err;
      }
      if (!this.#eof && partial.byteLength > 0 && partial[partial.byteLength - 1] === CR3) {
        assert2(this.#posRead > 0, "Tried to rewind past start of buffer");
        this.#posRead--;
        partial = partial.subarray(0, partial.byteLength - 1);
      }
      return {
        bytes: partial,
        eol: this.#eof
      };
    }
    if (line === null) {
      return null;
    }
    if (line.byteLength === 0) {
      return {
        bytes: line,
        eol: true
      };
    }
    if (strip) {
      line = stripEol(line);
    }
    return {
      bytes: line,
      eol: true
    };
  }
  async readSlice(delim) {
    let s = 0;
    let slice;
    while (true) {
      let i = this.#buffer.subarray(this.#posRead + s, this.#posWrite).indexOf(delim);
      if (i >= 0) {
        i += s;
        slice = this.#buffer.subarray(this.#posRead, this.#posRead + i + 1);
        this.#posRead += i + 1;
        break;
      }
      if (this.#eof) {
        if (this.#posRead === this.#posWrite) {
          return null;
        }
        slice = this.#buffer.subarray(this.#posRead, this.#posWrite);
        this.#posRead = this.#posWrite;
        break;
      }
      if (this.buffered() >= this.#buffer.byteLength) {
        this.#posRead = this.#posWrite;
        const oldbuf = this.#buffer;
        const newbuf = this.#buffer.slice(0);
        this.#buffer = newbuf;
        throw new BufferFullError(oldbuf);
      }
      s = this.#posWrite - this.#posRead;
      try {
        await this.#fill();
      } catch (err) {
        const e = err instanceof Error ? err : new Error("[non-object thrown]");
        e.partial = slice;
        throw err;
      }
    }
    return slice;
  }
};

// deno:https://deno.land/x/oak@v12.6.1/headers.ts
var COLON = ":".charCodeAt(0);
var HTAB2 = "	".charCodeAt(0);
var SPACE2 = " ".charCodeAt(0);
var decoder2 = new TextDecoder();
function toParamRegExp(attributePattern, flags2) {
  return new RegExp(`(?:^|;)\\s*${attributePattern}\\s*=\\s*([^";\\s][^;\\s]*|"(?:[^"\\\\]|\\\\"?)+"?)`, flags2);
}
async function readHeaders(body) {
  const headers = {};
  let readResult = await body.readLine();
  while (readResult) {
    const { bytes } = readResult;
    if (!bytes.length) {
      return headers;
    }
    let i = bytes.indexOf(COLON);
    if (i === -1) {
      throw new errors.BadRequest(`Malformed header: ${decoder2.decode(bytes)}`);
    }
    const key = decoder2.decode(bytes.subarray(0, i)).trim().toLowerCase();
    if (key === "") {
      throw new errors.BadRequest("Invalid header key.");
    }
    i++;
    while (i < bytes.byteLength && (bytes[i] === SPACE2 || bytes[i] === HTAB2)) {
      i++;
    }
    const value = decoder2.decode(bytes.subarray(i)).trim();
    headers[key] = value;
    readResult = await body.readLine();
  }
  throw new errors.BadRequest("Unexpected end of body reached.");
}
function unquote(value) {
  if (value.startsWith(`"`)) {
    const parts2 = value.slice(1).split(`\\"`);
    for (let i = 0; i < parts2.length; ++i) {
      const quoteIndex = parts2[i].indexOf(`"`);
      if (quoteIndex !== -1) {
        parts2[i] = parts2[i].slice(0, quoteIndex);
        parts2.length = i + 1;
      }
      parts2[i] = parts2[i].replace(/\\(.)/g, "$1");
    }
    value = parts2.join(`"`);
  }
  return value;
}

// deno:https://deno.land/x/oak@v12.6.1/content_disposition.ts
var needsEncodingFixup = false;
function fixupEncoding(value) {
  if (needsEncodingFixup && /[\x80-\xff]/.test(value)) {
    value = textDecode("utf-8", value);
    if (needsEncodingFixup) {
      value = textDecode("iso-8859-1", value);
    }
  }
  return value;
}
var FILENAME_STAR_REGEX = toParamRegExp("filename\\*", "i");
var FILENAME_START_ITER_REGEX = toParamRegExp("filename\\*((?!0\\d)\\d+)(\\*?)", "ig");
var FILENAME_REGEX = toParamRegExp("filename", "i");
function rfc2047decode(value) {
  if (!value.startsWith("=?") || /[\x00-\x19\x80-\xff]/.test(value)) {
    return value;
  }
  return value.replace(/=\?([\w-]*)\?([QqBb])\?((?:[^?]|\?(?!=))*)\?=/g, (_, charset, encoding, text) => {
    if (encoding === "q" || encoding === "Q") {
      text = text.replace(/_/g, " ");
      text = text.replace(/=([0-9a-fA-F]{2})/g, (_2, hex) => String.fromCharCode(parseInt(hex, 16)));
      return textDecode(charset, text);
    }
    try {
      text = atob(text);
    } catch {
    }
    return textDecode(charset, text);
  });
}
function rfc2231getParam(header) {
  const matches = [];
  let match2;
  while (match2 = FILENAME_START_ITER_REGEX.exec(header)) {
    const [, ns, quote, part] = match2;
    const n = parseInt(ns, 10);
    if (n in matches) {
      if (n === 0) {
        break;
      }
      continue;
    }
    matches[n] = [
      quote,
      part
    ];
  }
  const parts2 = [];
  for (let n = 0; n < matches.length; ++n) {
    if (!(n in matches)) {
      break;
    }
    let [quote, part] = matches[n];
    part = unquote(part);
    if (quote) {
      part = unescape(part);
      if (n === 0) {
        part = rfc5987decode(part);
      }
    }
    parts2.push(part);
  }
  return parts2.join("");
}
function rfc5987decode(value) {
  const encodingEnd = value.indexOf(`'`);
  if (encodingEnd === -1) {
    return value;
  }
  const encoding = value.slice(0, encodingEnd);
  const langValue = value.slice(encodingEnd + 1);
  return textDecode(encoding, langValue.replace(/^[^']*'/, ""));
}
function textDecode(encoding, value) {
  if (encoding) {
    try {
      const decoder5 = new TextDecoder(encoding, {
        fatal: true
      });
      const bytes = Array.from(value, (c) => c.charCodeAt(0));
      if (bytes.every((code) => code <= 255)) {
        value = decoder5.decode(new Uint8Array(bytes));
        needsEncodingFixup = false;
      }
    } catch {
    }
  }
  return value;
}
function getFilename(header) {
  needsEncodingFixup = true;
  let matches = FILENAME_STAR_REGEX.exec(header);
  if (matches) {
    const [, filename2] = matches;
    return fixupEncoding(rfc2047decode(rfc5987decode(unescape(unquote(filename2)))));
  }
  const filename = rfc2231getParam(header);
  if (filename) {
    return fixupEncoding(rfc2047decode(filename));
  }
  matches = FILENAME_REGEX.exec(header);
  if (matches) {
    const [, filename2] = matches;
    return fixupEncoding(rfc2047decode(unquote(filename2)));
  }
  return "";
}

// deno:https://deno.land/x/oak@v12.6.1/multipart.ts
var _computedKey6;
var _computedKey15;
var decoder3 = new TextDecoder();
var encoder5 = new TextEncoder();
var BOUNDARY_PARAM_REGEX = toParamRegExp("boundary", "i");
var DEFAULT_BUFFER_SIZE4 = 1048576;
var DEFAULT_MAX_FILE_SIZE = 10485760;
var DEFAULT_MAX_SIZE = 0;
var NAME_PARAM_REGEX = toParamRegExp("name", "i");
function append(a, b) {
  const ab = new Uint8Array(a.length + b.length);
  ab.set(a, 0);
  ab.set(b, a.length);
  return ab;
}
function isEqual(a, b) {
  return equals(skipLWSPChar(a), b);
}
async function readToStartOrEnd(body, start, end) {
  let lineResult;
  while (lineResult = await body.readLine()) {
    if (isEqual(lineResult.bytes, start)) {
      return true;
    }
    if (isEqual(lineResult.bytes, end)) {
      return false;
    }
  }
  throw new errors.BadRequest("Unable to find multi-part boundary.");
}
async function* parts({ body, customContentTypes = {}, final, part, maxFileSize, maxSize, outPath, prefix }) {
  async function getFile(contentType2) {
    const ext = customContentTypes[contentType2.toLowerCase()] ?? extension(contentType2);
    if (!ext) {
      throw new errors.BadRequest(`The form contained content type "${contentType2}" which is not supported by the server.`);
    }
    if (!outPath) {
      outPath = await Deno.makeTempDir();
    }
    const filename = `${outPath}/${await getRandomFilename(prefix, ext)}`;
    const file = await Deno.open(filename, {
      write: true,
      createNew: true
    });
    return [
      filename,
      file
    ];
  }
  while (true) {
    const headers = await readHeaders(body);
    const contentType2 = headers["content-type"];
    const contentDisposition = headers["content-disposition"];
    if (!contentDisposition) {
      throw new errors.BadRequest("Form data part missing content-disposition header");
    }
    if (!contentDisposition.match(/^form-data;/i)) {
      throw new errors.BadRequest(`Unexpected content-disposition header: "${contentDisposition}"`);
    }
    const matches = NAME_PARAM_REGEX.exec(contentDisposition);
    if (!matches) {
      throw new errors.BadRequest(`Unable to determine name of form body part`);
    }
    let [, name] = matches;
    name = unquote(name);
    if (contentType2) {
      const originalName = getFilename(contentDisposition);
      let byteLength = 0;
      let file;
      let filename;
      let buf;
      if (maxSize) {
        buf = new Uint8Array();
      } else {
        const result = await getFile(contentType2);
        filename = result[0];
        file = result[1];
      }
      while (true) {
        const readResult = await body.readLine(false);
        if (!readResult) {
          throw new errors.BadRequest("Unexpected EOF reached");
        }
        const { bytes } = readResult;
        const strippedBytes = stripEol(bytes);
        if (isEqual(strippedBytes, part) || isEqual(strippedBytes, final)) {
          if (file) {
            const bytesDiff = bytes.length - strippedBytes.length;
            if (bytesDiff) {
              const originalBytesSize = await file.seek(-bytesDiff, Deno.SeekMode.Current);
              await file.truncate(originalBytesSize);
            }
            file.close();
          }
          yield [
            name,
            {
              content: buf,
              contentType: contentType2,
              name,
              filename,
              originalName
            }
          ];
          if (isEqual(strippedBytes, final)) {
            return;
          }
          break;
        }
        byteLength += bytes.byteLength;
        if (byteLength > maxFileSize) {
          if (file) {
            file.close();
          }
          throw new errors.RequestEntityTooLarge(`File size exceeds limit of ${maxFileSize} bytes.`);
        }
        if (buf) {
          if (byteLength > maxSize) {
            const result = await getFile(contentType2);
            filename = result[0];
            file = result[1];
            await writeAll(file, buf);
            buf = void 0;
          } else {
            buf = append(buf, bytes);
          }
        }
        if (file) {
          await writeAll(file, bytes);
        }
      }
    } else {
      const lines = [];
      while (true) {
        const readResult = await body.readLine();
        if (!readResult) {
          throw new errors.BadRequest("Unexpected EOF reached");
        }
        const { bytes } = readResult;
        if (isEqual(bytes, part) || isEqual(bytes, final)) {
          yield [
            name,
            lines.join("\n")
          ];
          if (isEqual(bytes, final)) {
            return;
          }
          break;
        }
        lines.push(decoder3.decode(bytes));
      }
    }
  }
}
_computedKey6 = Symbol.for("Deno.customInspect"), _computedKey15 = Symbol.for("nodejs.util.inspect.custom");
var FormDataReader = class {
  #body;
  #boundaryFinal;
  #boundaryPart;
  #reading = false;
  constructor(contentType2, body) {
    const matches = contentType2.match(BOUNDARY_PARAM_REGEX);
    if (!matches) {
      throw new errors.BadRequest(`Content type "${contentType2}" does not contain a valid boundary.`);
    }
    let [, boundary2] = matches;
    boundary2 = unquote(boundary2);
    this.#boundaryPart = encoder5.encode(`--${boundary2}`);
    this.#boundaryFinal = encoder5.encode(`--${boundary2}--`);
    this.#body = body;
  }
  /** Reads the multipart body of the response and resolves with an object which
   * contains fields and files that were part of the response.
   *
   * *Note*: this method handles multiple files with the same `name` attribute
   * in the request, but by design it does not handle multiple fields that share
   * the same `name`.  If you expect the request body to contain multiple form
   * data fields with the same name, it is better to use the `.stream()` method
   * which will iterate over each form data field individually. */
  async read(options = {}) {
    if (this.#reading) {
      throw new Error("Body is already being read.");
    }
    this.#reading = true;
    const { outPath, maxFileSize = DEFAULT_MAX_FILE_SIZE, maxSize = DEFAULT_MAX_SIZE, bufferSize = DEFAULT_BUFFER_SIZE4, customContentTypes } = options;
    const body = new BufReader2(this.#body, bufferSize);
    const result = {
      fields: {}
    };
    if (!await readToStartOrEnd(body, this.#boundaryPart, this.#boundaryFinal)) {
      return result;
    }
    try {
      for await (const part of parts({
        body,
        customContentTypes,
        part: this.#boundaryPart,
        final: this.#boundaryFinal,
        maxFileSize,
        maxSize,
        outPath
      })) {
        const [key, value] = part;
        if (typeof value === "string") {
          result.fields[key] = value;
        } else {
          if (!result.files) {
            result.files = [];
          }
          result.files.push(value);
        }
      }
    } catch (err) {
      if (err instanceof Deno.errors.PermissionDenied) {
        console.error(err.stack ? err.stack : `${err.name}: ${err.message}`);
      } else {
        throw err;
      }
    }
    return result;
  }
  /** Returns an iterator which will asynchronously yield each part of the form
   * data.  The yielded value is a tuple, where the first element is the name
   * of the part and the second element is a `string` or a `FormDataFile`
   * object. */
  async *stream(options = {}) {
    if (this.#reading) {
      throw new Error("Body is already being read.");
    }
    this.#reading = true;
    const { outPath, customContentTypes, maxFileSize = DEFAULT_MAX_FILE_SIZE, maxSize = DEFAULT_MAX_SIZE, bufferSize = 32e3 } = options;
    const body = new BufReader2(this.#body, bufferSize);
    if (!await readToStartOrEnd(body, this.#boundaryPart, this.#boundaryFinal)) {
      return;
    }
    try {
      for await (const part of parts({
        body,
        customContentTypes,
        part: this.#boundaryPart,
        final: this.#boundaryFinal,
        maxFileSize,
        maxSize,
        outPath
      })) {
        yield part;
      }
    } catch (err) {
      if (err instanceof Deno.errors.PermissionDenied) {
        console.error(err.stack ? err.stack : `${err.name}: ${err.message}`);
      } else {
        throw err;
      }
    }
  }
  [_computedKey6](inspect) {
    return `${this.constructor.name} ${inspect({})}`;
  }
  [_computedKey15](depth, options, inspect) {
    if (depth < 0) {
      return options.stylize(`[${this.constructor.name}]`, "special");
    }
    const newOptions = Object.assign({}, options, {
      depth: options.depth === null ? null : options.depth - 1
    });
    return `${options.stylize(this.constructor.name, "special")} ${inspect({}, newOptions)}`;
  }
};

// deno:https://deno.land/x/oak@v12.6.1/body.ts
var DEFAULT_LIMIT = 10485760;
var defaultBodyContentTypes = {
  json: [
    "json",
    "application/*+json",
    "application/csp-report"
  ],
  form: [
    "urlencoded"
  ],
  formData: [
    "multipart"
  ],
  text: [
    "text"
  ]
};
function resolveType(contentType2, contentTypes) {
  const contentTypesJson = [
    ...defaultBodyContentTypes.json,
    ...contentTypes.json ?? []
  ];
  const contentTypesForm = [
    ...defaultBodyContentTypes.form,
    ...contentTypes.form ?? []
  ];
  const contentTypesFormData = [
    ...defaultBodyContentTypes.formData,
    ...contentTypes.formData ?? []
  ];
  const contentTypesText = [
    ...defaultBodyContentTypes.text,
    ...contentTypes.text ?? []
  ];
  if (contentTypes.bytes && isMediaType(contentType2, contentTypes.bytes)) {
    return "bytes";
  } else if (isMediaType(contentType2, contentTypesJson)) {
    return "json";
  } else if (isMediaType(contentType2, contentTypesForm)) {
    return "form";
  } else if (isMediaType(contentType2, contentTypesFormData)) {
    return "form-data";
  } else if (isMediaType(contentType2, contentTypesText)) {
    return "text";
  }
  return "bytes";
}
var decoder4 = new TextDecoder(void 0, {
  fatal: true
});
var RequestBody = class {
  #body;
  #formDataReader;
  #headers;
  #jsonBodyReviver;
  #stream;
  #readAllBody;
  #readBody;
  #type;
  #exceedsLimit(limit) {
    if (!limit || limit === Infinity) {
      return false;
    }
    if (!this.#body) {
      return false;
    }
    const contentLength = this.#headers.get("content-length") ?? "0";
    const parsed = parseInt(contentLength, 10);
    if (isNaN(parsed)) {
      return true;
    }
    return parsed > limit;
  }
  #parse(type, limit) {
    switch (type) {
      case "form":
        this.#type = "bytes";
        if (this.#exceedsLimit(limit)) {
          return () => Promise.reject(createHttpError(Status.BadRequest, `Body exceeds a limit of ${limit}.`, {
            expose: false
          }));
        }
        return async () => new URLSearchParams(decoder4.decode(await this.#valuePromise()).replace(/\+/g, " "));
      case "form-data":
        this.#type = "form-data";
        return () => {
          const contentType2 = this.#headers.get("content-type");
          assert2(contentType2);
          const readableStream = this.#body ?? new ReadableStream();
          try {
            return this.#formDataReader ?? (this.#formDataReader = new FormDataReader(contentType2, readerFromStreamReader(readableStream.getReader())));
          } catch (err) {
            const message = err instanceof Error ? err.message : "Malformed request body.";
            throw createHttpError(Status.BadRequest, message, {
              expose: false
            });
          }
        };
      case "json":
        this.#type = "bytes";
        if (this.#exceedsLimit(limit)) {
          return () => Promise.reject(createHttpError(Status.BadRequest, `Body exceeds a limit of ${limit}.`, {
            expose: false
          }));
        }
        return async () => {
          const value = await this.#valuePromise();
          try {
            return value.length ? JSON.parse(decoder4.decode(await this.#valuePromise()), this.#jsonBodyReviver) : null;
          } catch (err) {
            const message = err instanceof Error ? err.message : "Malformed request body.";
            throw createHttpError(Status.BadRequest, message, {
              expose: false
            });
          }
        };
      case "bytes":
        this.#type = "bytes";
        if (this.#exceedsLimit(limit)) {
          return () => Promise.reject(createHttpError(Status.BadRequest, `Body exceeds a limit of ${limit}.`, {
            expose: false
          }));
        }
        return () => this.#valuePromise();
      case "text":
        this.#type = "bytes";
        if (this.#exceedsLimit(limit)) {
          return () => Promise.reject(createHttpError(Status.BadRequest, `Body exceeds a limit of ${limit}.`, {
            expose: false
          }));
        }
        return async () => {
          try {
            return decoder4.decode(await this.#valuePromise());
          } catch (err) {
            const message = err instanceof Error ? err.message : "Malformed request body.";
            throw createHttpError(Status.BadRequest, message, {
              expose: false
            });
          }
        };
      default:
        throw createHttpError(Status.InternalServerError, `Invalid body type: "${type}"`, {
          expose: true
        });
    }
  }
  #validateGetArgs(type, contentTypes) {
    if (type === "reader" && this.#type && this.#type !== "reader") {
      throw new TypeError(`Body already consumed as "${this.#type}" and cannot be returned as a reader.`);
    }
    if (type === "stream" && this.#type && this.#type !== "stream") {
      throw new TypeError(`Body already consumed as "${this.#type}" and cannot be returned as a stream.`);
    }
    if (type === "form-data" && this.#type && this.#type !== "form-data") {
      throw new TypeError(`Body already consumed as "${this.#type}" and cannot be returned as a stream.`);
    }
    if (this.#type === "reader" && type !== "reader") {
      throw new TypeError("Body already consumed as a reader and can only be returned as a reader.");
    }
    if (this.#type === "stream" && type !== "stream") {
      throw new TypeError("Body already consumed as a stream and can only be returned as a stream.");
    }
    if (this.#type === "form-data" && type !== "form-data") {
      throw new TypeError("Body already consumed as form data and can only be returned as form data.");
    }
    if (type && Object.keys(contentTypes).length) {
      throw new TypeError(`"type" and "contentTypes" cannot be specified at the same time`);
    }
  }
  #valuePromise() {
    return this.#readAllBody ?? (this.#readAllBody = this.#readBody());
  }
  constructor({ body, readBody }, headers, jsonBodyReviver) {
    this.#body = body;
    this.#headers = headers;
    this.#jsonBodyReviver = jsonBodyReviver;
    this.#readBody = readBody;
  }
  get({ limit = DEFAULT_LIMIT, type, contentTypes = {} } = {}) {
    this.#validateGetArgs(type, contentTypes);
    if (type === "reader") {
      if (!this.#body) {
        this.#type = "undefined";
        throw new TypeError(`Body is undefined and cannot be returned as "reader".`);
      }
      this.#type = "reader";
      return {
        type,
        value: readerFromStreamReader(this.#body.getReader())
      };
    }
    if (type === "stream") {
      if (!this.#body) {
        this.#type = "undefined";
        throw new TypeError(`Body is undefined and cannot be returned as "stream".`);
      }
      this.#type = "stream";
      const streams = (this.#stream ?? this.#body).tee();
      this.#stream = streams[1];
      return {
        type,
        value: streams[0]
      };
    }
    if (!this.has()) {
      this.#type = "undefined";
    } else if (!this.#type) {
      const encoding = this.#headers.get("content-encoding") ?? "identity";
      if (encoding !== "identity") {
        throw new errors.UnsupportedMediaType(`Unsupported content-encoding: ${encoding}`);
      }
    }
    if (this.#type === "undefined" && (!type || type === "undefined")) {
      return {
        type: "undefined",
        value: void 0
      };
    }
    if (!type) {
      const contentType2 = this.#headers.get("content-type");
      if (!contentType2) {
        throw createHttpError(Status.BadRequest, "The Content-Type header is missing from the request");
      }
      type = resolveType(contentType2, contentTypes);
    }
    assert2(type);
    const body = /* @__PURE__ */ Object.create(null);
    Object.defineProperties(body, {
      type: {
        value: type,
        configurable: true,
        enumerable: true
      },
      value: {
        get: this.#parse(type, limit),
        configurable: true,
        enumerable: true
      }
    });
    return body;
  }
  /** Returns if the request might have a body or not, without attempting to
   * consume it.
   *
   * **WARNING** This is an unreliable API. In HTTP/2 it is not possible to
   * determine if certain HTTP methods have a body or not without attempting to
   * read the body. As of Deno 1.16.1 and later, for HTTP/1.1 aligns to the
   * HTTP/2 behaviour.
   */
  has() {
    return this.#body != null;
  }
};

// deno:https://deno.land/x/oak@v12.6.1/request.ts
var _computedKey7;
var _computedKey16;
_computedKey7 = Symbol.for("Deno.customInspect"), _computedKey16 = Symbol.for("nodejs.util.inspect.custom");
var Request2 = class {
  #body;
  #proxy;
  #secure;
  #serverRequest;
  #url;
  #userAgent;
  #getRemoteAddr() {
    return this.#serverRequest.remoteAddr ?? "";
  }
  /** Is `true` if the request might have a body, otherwise `false`.
   *
   * **WARNING** this is an unreliable API. In HTTP/2 in many situations you
   * cannot determine if a request has a body or not unless you attempt to read
   * the body, due to the streaming nature of HTTP/2. As of Deno 1.16.1, for
   * HTTP/1.1, Deno also reflects that behaviour.  The only reliable way to
   * determine if a request has a body or not is to attempt to read the body.
   */
  get hasBody() {
    return this.#body.has();
  }
  /** The `Headers` supplied in the request. */
  get headers() {
    return this.#serverRequest.headers;
  }
  /** Request remote address. When the application's `.proxy` is true, the
   * `X-Forwarded-For` will be used to determine the requesting remote address.
   */
  get ip() {
    return (this.#proxy ? this.ips[0] : this.#getRemoteAddr()) ?? "";
  }
  /** When the application's `.proxy` is `true`, this will be set to an array of
   * IPs, ordered from upstream to downstream, based on the value of the header
   * `X-Forwarded-For`.  When `false` an empty array is returned. */
  get ips() {
    return this.#proxy ? (this.#serverRequest.headers.get("x-forwarded-for") ?? this.#getRemoteAddr()).split(/\s*,\s*/) : [];
  }
  /** The HTTP Method used by the request. */
  get method() {
    return this.#serverRequest.method;
  }
  /** Shortcut to `request.url.protocol === "https:"`. */
  get secure() {
    return this.#secure;
  }
  /** Set to the value of the _original_ Deno server request. */
  get originalRequest() {
    return this.#serverRequest;
  }
  /** A parsed URL for the request which complies with the browser standards.
   * When the application's `.proxy` is `true`, this value will be based off of
   * the `X-Forwarded-Proto` and `X-Forwarded-Host` header values if present in
   * the request. */
  get url() {
    if (!this.#url) {
      const serverRequest = this.#serverRequest;
      if (!this.#proxy) {
        try {
          if (serverRequest.rawUrl) {
            this.#url = new URL(serverRequest.rawUrl);
            return this.#url;
          }
        } catch {
        }
      }
      let proto;
      let host;
      if (this.#proxy) {
        proto = serverRequest.headers.get("x-forwarded-proto")?.split(/\s*,\s*/, 1)[0] ?? "http";
        host = serverRequest.headers.get("x-forwarded-host") ?? serverRequest.headers.get("host") ?? "";
      } else {
        proto = this.#secure ? "https" : "http";
        host = serverRequest.headers.get("host") ?? "";
      }
      try {
        this.#url = new URL(`${proto}://${host}${serverRequest.url}`);
      } catch {
        throw new TypeError(`The server request URL of "${proto}://${host}${serverRequest.url}" is invalid.`);
      }
    }
    return this.#url;
  }
  /** An object representing the requesting user agent. If the `User-Agent`
   * header isn't defined in the request, all the properties will be undefined.
   *
   * See [std/http/user_agent#UserAgent](https://deno.land/std@0.200.0/http/user_agent.ts?s=UserAgent)
   * for more information.
   */
  get userAgent() {
    return this.#userAgent;
  }
  constructor(serverRequest, { proxy: proxy2 = false, secure = false, jsonBodyReviver } = {}) {
    this.#proxy = proxy2;
    this.#secure = secure;
    this.#serverRequest = serverRequest;
    this.#body = new RequestBody(serverRequest.getBody(), serverRequest.headers, jsonBodyReviver);
    this.#userAgent = new UserAgent(serverRequest.headers.get("user-agent"));
  }
  accepts(...types2) {
    if (!this.#serverRequest.headers.has("Accept")) {
      return types2.length ? types2[0] : [
        "*/*"
      ];
    }
    if (types2.length) {
      return accepts(this.#serverRequest, ...types2);
    }
    return accepts(this.#serverRequest);
  }
  acceptsEncodings(...encodings) {
    if (!this.#serverRequest.headers.has("Accept-Encoding")) {
      return encodings.length ? encodings[0] : [
        "*"
      ];
    }
    if (encodings.length) {
      return acceptsEncodings(this.#serverRequest, ...encodings);
    }
    return acceptsEncodings(this.#serverRequest);
  }
  acceptsLanguages(...langs) {
    if (!this.#serverRequest.headers.get("Accept-Language")) {
      return langs.length ? langs[0] : [
        "*"
      ];
    }
    if (langs.length) {
      return acceptsLanguages(this.#serverRequest, ...langs);
    }
    return acceptsLanguages(this.#serverRequest);
  }
  /** Access the body of the request. This is a method, because there are
   * several options which can be provided which can influence how the body is
   * handled. */
  body(options = {}) {
    return this.#body.get(options);
  }
  [_computedKey7](inspect) {
    const { hasBody, headers, ip, ips, method, secure, url } = this;
    return `${this.constructor.name} ${inspect({
      hasBody,
      headers,
      ip,
      ips,
      method,
      secure,
      url: url.toString()
    })}`;
  }
  [_computedKey16](depth, options, inspect) {
    if (depth < 0) {
      return options.stylize(`[${this.constructor.name}]`, "special");
    }
    const newOptions = Object.assign({}, options, {
      depth: options.depth === null ? null : options.depth - 1
    });
    const { hasBody, headers, ip, ips, method, secure, url } = this;
    return `${options.stylize(this.constructor.name, "special")} ${inspect({
      hasBody,
      headers,
      ip,
      ips,
      method,
      secure,
      url
    }, newOptions)}`;
  }
};

// deno:https://deno.land/x/oak@v12.6.1/http_server_native_request.ts
var DomResponse = globalThis.Response ?? class MockResponse {
};
var maybeUpgradeWebSocket = "upgradeWebSocket" in Deno ? Deno.upgradeWebSocket.bind(Deno) : void 0;
var NativeRequest = class {
  #conn;
  // deno-lint-ignore no-explicit-any
  #reject;
  #request;
  #requestPromise;
  #resolve;
  #resolved = false;
  #upgradeWebSocket;
  constructor(requestEvent, options = {}) {
    const { conn } = options;
    this.#conn = conn;
    this.#upgradeWebSocket = "upgradeWebSocket" in options ? options["upgradeWebSocket"] : maybeUpgradeWebSocket;
    this.#request = requestEvent.request;
    const p = new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    });
    this.#requestPromise = requestEvent.respondWith(p);
  }
  get body() {
    return this.#request.body;
  }
  get donePromise() {
    return this.#requestPromise;
  }
  get headers() {
    return this.#request.headers;
  }
  get method() {
    return this.#request.method;
  }
  get remoteAddr() {
    return this.#conn?.remoteAddr?.hostname;
  }
  get request() {
    return this.#request;
  }
  get url() {
    try {
      const url = new URL(this.#request.url);
      return this.#request.url.replace(url.origin, "");
    } catch {
    }
    return this.#request.url;
  }
  get rawUrl() {
    return this.#request.url;
  }
  // deno-lint-ignore no-explicit-any
  error(reason) {
    if (this.#resolved) {
      throw new Error("Request already responded to.");
    }
    this.#reject(reason);
    this.#resolved = true;
  }
  getBody() {
    return {
      // when emitting to Node.js, the body is not compatible, and thought it
      // doesn't run at runtime, it still gets type checked.
      // deno-lint-ignore no-explicit-any
      body: this.#request.body,
      readBody: async () => {
        const ab = await this.#request.arrayBuffer();
        return new Uint8Array(ab);
      }
    };
  }
  respond(response) {
    if (this.#resolved) {
      throw new Error("Request already responded to.");
    }
    this.#resolve(response);
    this.#resolved = true;
    return this.#requestPromise;
  }
  upgrade(options) {
    if (this.#resolved) {
      throw new Error("Request already responded to.");
    }
    if (!this.#upgradeWebSocket) {
      throw new TypeError("Upgrading web sockets not supported.");
    }
    const { response, socket } = this.#upgradeWebSocket(this.#request, options);
    this.#resolve(response);
    this.#resolved = true;
    return socket;
  }
};

// deno:https://deno.land/x/oak@v12.6.1/response.ts
var _computedKey8;
var _computedKey17;
var REDIRECT_BACK = Symbol("redirect backwards");
async function convertBodyToBodyInit(body, type, jsonBodyReplacer) {
  let result;
  if (BODY_TYPES.includes(typeof body)) {
    result = String(body);
    type = type ?? (isHtml(result) ? "html" : "text/plain");
  } else if (isReader(body)) {
    result = readableStreamFromReader(body);
  } else if (ArrayBuffer.isView(body) || body instanceof ArrayBuffer || body instanceof Blob || body instanceof URLSearchParams) {
    result = body;
  } else if (body instanceof ReadableStream) {
    result = body.pipeThrough(new Uint8ArrayTransformStream());
  } else if (body instanceof FormData) {
    result = body;
    type = "multipart/form-data";
  } else if (isAsyncIterable(body)) {
    result = readableStreamFromAsyncIterable(body);
  } else if (body && typeof body === "object") {
    result = JSON.stringify(body, jsonBodyReplacer);
    type = type ?? "json";
  } else if (typeof body === "function") {
    const result2 = body.call(null);
    return convertBodyToBodyInit(await result2, type, jsonBodyReplacer);
  } else if (body) {
    throw new TypeError("Response body was set but could not be converted.");
  }
  return [
    result,
    type
  ];
}
_computedKey8 = Symbol.for("Deno.customInspect"), _computedKey17 = Symbol.for("nodejs.util.inspect.custom");
var Response2 = class {
  #body;
  #bodySet = false;
  #domResponse;
  #headers = new Headers();
  #jsonBodyReplacer;
  #request;
  #resources = [];
  #status;
  #type;
  #writable = true;
  async #getBodyInit() {
    const [body, type] = await convertBodyToBodyInit(this.body, this.type, this.#jsonBodyReplacer);
    this.type = type;
    return body;
  }
  #setContentType() {
    if (this.type) {
      const contentTypeString = contentType(this.type);
      if (contentTypeString && !this.headers.has("Content-Type")) {
        this.headers.append("Content-Type", contentTypeString);
      }
    }
  }
  /** The body of the response.  The body will be automatically processed when
   * the response is being sent and converted to a `Uint8Array` or a
   * `Deno.Reader`.
   *
   * Automatic conversion to a `Deno.Reader` occurs for async iterables. */
  get body() {
    return this.#body;
  }
  /** The body of the response.  The body will be automatically processed when
   * the response is being sent and converted to a `Uint8Array` or a
   * `Deno.Reader`.
   *
   * Automatic conversion to a `Deno.Reader` occurs for async iterables. */
  set body(value) {
    if (!this.#writable) {
      throw new Error("The response is not writable.");
    }
    this.#bodySet = true;
    this.#body = value;
  }
  /** Headers that will be returned in the response. */
  get headers() {
    return this.#headers;
  }
  /** Headers that will be returned in the response. */
  set headers(value) {
    if (!this.#writable) {
      throw new Error("The response is not writable.");
    }
    this.#headers = value;
  }
  /** The HTTP status of the response.  If this has not been explicitly set,
   * reading the value will return what would be the value of status if the
   * response were sent at this point in processing the middleware.  If the body
   * has been set, the status will be `200 OK`.  If a value for the body has
   * not been set yet, the status will be `404 Not Found`. */
  get status() {
    if (this.#status) {
      return this.#status;
    }
    return this.body != null ? Status.OK : this.#bodySet ? Status.NoContent : Status.NotFound;
  }
  /** The HTTP status of the response.  If this has not been explicitly set,
   * reading the value will return what would be the value of status if the
   * response were sent at this point in processing the middleware.  If the body
   * has been set, the status will be `200 OK`.  If a value for the body has
   * not been set yet, the status will be `404 Not Found`. */
  set status(value) {
    if (!this.#writable) {
      throw new Error("The response is not writable.");
    }
    this.#status = value;
  }
  /** The media type, or extension of the response.  Setting this value will
   * ensure an appropriate `Content-Type` header is added to the response. */
  get type() {
    return this.#type;
  }
  /** The media type, or extension of the response.  Setting this value will
   * ensure an appropriate `Content-Type` header is added to the response. */
  set type(value) {
    if (!this.#writable) {
      throw new Error("The response is not writable.");
    }
    this.#type = value;
  }
  /** A read-only property which determines if the response is writable or not.
   * Once the response has been processed, this value is set to `false`. */
  get writable() {
    return this.#writable;
  }
  constructor(request, jsonBodyReplacer) {
    this.#request = request;
    this.#jsonBodyReplacer = jsonBodyReplacer;
  }
  /** Add a resource to the list of resources that will be closed when the
   * request is destroyed. */
  addResource(rid) {
    this.#resources.push(rid);
  }
  /** Release any resources that are being tracked by the response.
   *
   * @param closeResources close any resource IDs registered with the response
   */
  destroy(closeResources = true) {
    this.#writable = false;
    this.#body = void 0;
    this.#domResponse = void 0;
    if (closeResources) {
      for (const rid of this.#resources) {
        try {
          Deno.close(rid);
        } catch {
        }
      }
    }
  }
  redirect(url, alt = "/") {
    if (url === REDIRECT_BACK) {
      url = this.#request.headers.get("Referer") ?? String(alt);
    } else if (typeof url === "object") {
      url = String(url);
    }
    this.headers.set("Location", encodeUrl(url));
    if (!this.status || !isRedirectStatus(this.status)) {
      this.status = Status.Found;
    }
    if (this.#request.accepts("html")) {
      url = encodeURI(url);
      this.type = "text/html; charset=UTF-8";
      this.body = `Redirecting to <a href="${url}">${url}</a>.`;
      return;
    }
    this.type = "text/plain; charset=UTF-8";
    this.body = `Redirecting to ${url}.`;
  }
  async toDomResponse() {
    if (this.#domResponse) {
      return this.#domResponse;
    }
    const bodyInit = await this.#getBodyInit();
    this.#setContentType();
    const { headers } = this;
    if (!(bodyInit || headers.has("Content-Type") || headers.has("Content-Length"))) {
      headers.append("Content-Length", "0");
    }
    this.#writable = false;
    const status = this.status;
    const responseInit = {
      headers,
      status,
      statusText: STATUS_TEXT[status]
    };
    return this.#domResponse = new DomResponse(bodyInit, responseInit);
  }
  [_computedKey8](inspect) {
    const { body, headers, status, type, writable } = this;
    return `${this.constructor.name} ${inspect({
      body,
      headers,
      status,
      type,
      writable
    })}`;
  }
  [_computedKey17](depth, options, inspect) {
    if (depth < 0) {
      return options.stylize(`[${this.constructor.name}]`, "special");
    }
    const newOptions = Object.assign({}, options, {
      depth: options.depth === null ? null : options.depth - 1
    });
    const { body, headers, status, type, writable } = this;
    return `${options.stylize(this.constructor.name, "special")} ${inspect({
      body,
      headers,
      status,
      type,
      writable
    }, newOptions)}`;
  }
};

// deno:https://deno.land/x/oak@v12.6.1/range.ts
var ETAG_RE = /(?:W\/)?"[ !#-\x7E\x80-\xFF]+"/;
async function ifRange(value, mtime, entity) {
  if (value) {
    const matches = value.match(ETAG_RE);
    if (matches) {
      const [match2] = matches;
      if (await calculate(entity) === match2) {
        return true;
      }
    } else {
      return new Date(value).getTime() >= mtime;
    }
  }
  return false;
}
function parseRange(value, size) {
  const ranges = [];
  const [unit, rangesStr] = value.split("=");
  if (unit !== "bytes") {
    throw createHttpError(Status.RequestedRangeNotSatisfiable);
  }
  for (const range of rangesStr.split(/\s*,\s+/)) {
    const item = range.split("-");
    if (item.length !== 2) {
      throw createHttpError(Status.RequestedRangeNotSatisfiable);
    }
    const [startStr, endStr] = item;
    let start;
    let end;
    try {
      if (startStr === "") {
        start = size - parseInt(endStr, 10) - 1;
        end = size - 1;
      } else if (endStr === "") {
        start = parseInt(startStr, 10);
        end = size - 1;
      } else {
        start = parseInt(startStr, 10);
        end = parseInt(endStr, 10);
      }
    } catch {
      throw createHttpError();
    }
    if (start < 0 || start >= size || end < 0 || end >= size || start > end) {
      throw createHttpError(Status.RequestedRangeNotSatisfiable);
    }
    ranges.push({
      start,
      end
    });
  }
  return ranges;
}
async function readRange(file, range) {
  let length = range.end - range.start + 1;
  assert2(length);
  await file.seek(range.start, Deno.SeekMode.Start);
  const result = new Uint8Array(length);
  let off = 0;
  while (length) {
    const p = new Uint8Array(Math.min(length, DEFAULT_CHUNK_SIZE2));
    const nread = await file.read(p);
    assert2(nread !== null, "Unexpected EOF encountered when reading a range.");
    assert2(nread > 0, "Unexpected read of 0 bytes while reading a range.");
    copy(p, result, off);
    off += nread;
    length -= nread;
    assert2(length >= 0, "Unexpected length remaining.");
  }
  return result;
}
var encoder6 = new TextEncoder();
var MultiPartStream = class extends ReadableStream {
  #contentLength;
  #postscript;
  #preamble;
  constructor(file, type, ranges, size, boundary2) {
    super({
      pull: async (controller) => {
        const range = ranges.shift();
        if (!range) {
          controller.enqueue(this.#postscript);
          controller.close();
          if (!(file instanceof Uint8Array)) {
            file.close();
          }
          return;
        }
        let bytes;
        if (file instanceof Uint8Array) {
          bytes = file.subarray(range.start, range.end + 1);
        } else {
          bytes = await readRange(file, range);
        }
        const rangeHeader = encoder6.encode(`Content-Range: ${range.start}-${range.end}/${size}

`);
        controller.enqueue(concat(this.#preamble, rangeHeader, bytes));
      }
    });
    const resolvedType = contentType(type);
    if (!resolvedType) {
      throw new TypeError(`Could not resolve media type for "${type}"`);
    }
    this.#preamble = encoder6.encode(`
--${boundary2}
Content-Type: ${resolvedType}
`);
    this.#postscript = encoder6.encode(`
--${boundary2}--
`);
    this.#contentLength = ranges.reduce((prev, { start, end }) => {
      return prev + this.#preamble.length + String(start).length + String(end).length + String(size).length + 20 + (end - start);
    }, this.#postscript.length);
  }
  /** The content length of the entire streamed body. */
  contentLength() {
    return this.#contentLength;
  }
};

// deno:https://deno.land/x/oak@v12.6.1/send.ts
var MAXBUFFER_DEFAULT = 1048576;
var boundary;
function isHidden(path2) {
  const pathArr = path2.split("/");
  for (const segment of pathArr) {
    if (segment[0] === "." && segment !== "." && segment !== "..") {
      return true;
    }
    return false;
  }
}
async function exists(path2) {
  try {
    return (await Deno.stat(path2)).isFile;
  } catch {
    return false;
  }
}
async function getEntity(path2, mtime, stats, maxbuffer, response) {
  let body;
  let entity;
  const file = await Deno.open(path2, {
    read: true
  });
  if (stats.size < maxbuffer) {
    const buffer = await readAll(file);
    file.close();
    body = entity = buffer;
  } else {
    response.addResource(file.rid);
    body = file;
    entity = {
      mtime: new Date(mtime),
      size: stats.size
    };
  }
  return [
    body,
    entity
  ];
}
async function sendRange(response, body, range, size) {
  const ranges = parseRange(range, size);
  if (ranges.length === 0) {
    throw createHttpError(Status.RequestedRangeNotSatisfiable);
  }
  response.status = Status.PartialContent;
  if (ranges.length === 1) {
    const [byteRange] = ranges;
    response.headers.set("Content-Range", `bytes ${byteRange.start}-${byteRange.end}/${size}`);
    if (body instanceof Uint8Array) {
      response.body = body.slice(byteRange.start, byteRange.end + 1);
    } else {
      await body.seek(byteRange.start, Deno.SeekMode.Start);
      response.body = new LimitedReader(body, byteRange.end - byteRange.start + 1);
    }
  } else {
    assert2(response.type);
    if (!boundary) {
      boundary = await getBoundary();
    }
    response.headers.set("content-type", `multipart/byteranges; boundary=${boundary}`);
    const multipartBody = new MultiPartStream(body, response.type, ranges, size, boundary);
    response.body = multipartBody;
  }
}
async function send({ request, response }, path2, options = {
  root: ""
}) {
  const { brotli = true, contentTypes = {}, extensions: extensions2, format: format2 = true, gzip = true, hidden = false, immutable = false, index, maxbuffer = MAXBUFFER_DEFAULT, maxage = 0, root } = options;
  const trailingSlash = path2[path2.length - 1] === "/";
  path2 = decodeComponent(path2.substr(parse(path2).root.length));
  if (index && trailingSlash) {
    path2 += index;
  }
  if (!hidden && isHidden(path2)) {
    throw createHttpError(403);
  }
  path2 = resolvePath(root, path2);
  let encodingExt = "";
  if (brotli && request.acceptsEncodings("br", "identity") === "br" && await exists(`${path2}.br`)) {
    path2 = `${path2}.br`;
    response.headers.set("Content-Encoding", "br");
    response.headers.delete("Content-Length");
    encodingExt = ".br";
  } else if (gzip && request.acceptsEncodings("gzip", "identity") === "gzip" && await exists(`${path2}.gz`)) {
    path2 = `${path2}.gz`;
    response.headers.set("Content-Encoding", "gzip");
    response.headers.delete("Content-Length");
    encodingExt = ".gz";
  }
  if (extensions2 && !/\.[^/]*$/.exec(path2)) {
    for (let ext of extensions2) {
      if (!/^\./.exec(ext)) {
        ext = `.${ext}`;
      }
      if (await exists(`${path2}${ext}`)) {
        path2 += ext;
        break;
      }
    }
  }
  let stats;
  try {
    stats = await Deno.stat(path2);
    if (stats.isDirectory) {
      if (format2 && index) {
        path2 += `/${index}`;
        stats = await Deno.stat(path2);
      } else {
        return;
      }
    }
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      throw createHttpError(404, err.message);
    }
    if (err instanceof Error && err.message.startsWith("ENOENT:")) {
      throw createHttpError(404, err.message);
    }
    throw createHttpError(500, err instanceof Error ? err.message : "[non-error thrown]");
  }
  let mtime = null;
  if (response.headers.has("Last-Modified")) {
    mtime = new Date(response.headers.get("Last-Modified")).getTime();
  } else if (stats.mtime) {
    mtime = stats.mtime.getTime();
    mtime -= mtime % 1e3;
    response.headers.set("Last-Modified", new Date(mtime).toUTCString());
  }
  if (!response.headers.has("Cache-Control")) {
    const directives = [
      `max-age=${maxage / 1e3 | 0}`
    ];
    if (immutable) {
      directives.push("immutable");
    }
    response.headers.set("Cache-Control", directives.join(","));
  }
  if (!response.type) {
    response.type = encodingExt !== "" ? extname(basename(path2, encodingExt)) : contentTypes[extname(path2)] ?? extname(path2);
  }
  let entity = null;
  let body = null;
  if (request.headers.has("If-None-Match") && mtime) {
    [body, entity] = await getEntity(path2, mtime, stats, maxbuffer, response);
    const etag = await calculate(entity);
    if (etag && !await ifNoneMatch(request.headers.get("If-None-Match"), etag)) {
      response.headers.set("ETag", etag);
      response.status = 304;
      return path2;
    }
  }
  if (request.headers.has("If-Modified-Since") && mtime) {
    const ifModifiedSince = new Date(request.headers.get("If-Modified-Since"));
    if (ifModifiedSince.getTime() >= mtime) {
      response.status = 304;
      return path2;
    }
  }
  if (!body || !entity) {
    [body, entity] = await getEntity(path2, mtime ?? 0, stats, maxbuffer, response);
  }
  if (request.headers.has("If-Range") && mtime && await ifRange(request.headers.get("If-Range"), mtime, entity) && request.headers.has("Range")) {
    await sendRange(response, body, request.headers.get("Range"), stats.size);
    return path2;
  }
  if (request.headers.has("Range")) {
    await sendRange(response, body, request.headers.get("Range"), stats.size);
    return path2;
  }
  response.body = body;
  if (!response.headers.has("ETag")) {
    const etag = await calculate(entity);
    if (etag) {
      response.headers.set("ETag", etag);
    }
  }
  if (!response.headers.has("Accept-Ranges")) {
    response.headers.set("Accept-Ranges", "bytes");
  }
  return path2;
}

// deno:https://deno.land/x/oak@v12.6.1/context.ts
var _computedKey9;
var _computedKey18;
_computedKey9 = Symbol.for("Deno.customInspect"), _computedKey18 = Symbol.for("nodejs.util.inspect.custom");
var Context = class {
  #socket;
  #sse;
  #wrapReviverReplacer(reviver) {
    return reviver ? (key, value) => reviver(key, value, this) : void 0;
  }
  /** A reference to the current application. */
  app;
  /** An object which allows access to cookies, mediating both the request and
   * response. */
  cookies;
  /** Is `true` if the current connection is upgradeable to a web socket.
   * Otherwise the value is `false`.  Use `.upgrade()` to upgrade the connection
   * and return the web socket. */
  get isUpgradable() {
    const upgrade = this.request.headers.get("upgrade");
    if (!upgrade || upgrade.toLowerCase() !== "websocket") {
      return false;
    }
    const secKey = this.request.headers.get("sec-websocket-key");
    return typeof secKey === "string" && secKey != "";
  }
  /** Determines if the request should be responded to.  If `false` when the
   * middleware completes processing, the response will not be sent back to the
   * requestor.  Typically this is used if the middleware will take over low
   * level processing of requests and responses, for example if using web
   * sockets.  This automatically gets set to `false` when the context is
   * upgraded to a web socket via the `.upgrade()` method.
   *
   * The default is `true`. */
  respond;
  /** An object which contains information about the current request. */
  request;
  /** An object which contains information about the response that will be sent
   * when the middleware finishes processing. */
  response;
  /** If the the current context has been upgraded, then this will be set to
   * with the current web socket, otherwise it is `undefined`. */
  get socket() {
    return this.#socket;
  }
  /** The object to pass state to front-end views.  This can be typed by
   * supplying the generic state argument when creating a new app.  For
   * example:
   *
   * ```ts
   * const app = new Application<{ foo: string }>();
   * ```
   *
   * Or can be contextually inferred based on setting an initial state object:
   *
   * ```ts
   * const app = new Application({ state: { foo: "bar" } });
   * ```
   *
   * On each request/response cycle, the context's state is cloned from the
   * application state. This means changes to the context's `.state` will be
   * dropped when the request drops, but "defaults" can be applied to the
   * application's state.  Changes to the application's state though won't be
   * reflected until the next request in the context's state.
   */
  state;
  constructor(app2, serverRequest, state, { secure = false, jsonBodyReplacer, jsonBodyReviver } = {}) {
    this.app = app2;
    this.state = state;
    const { proxy: proxy2 } = app2;
    this.request = new Request2(serverRequest, {
      proxy: proxy2,
      secure,
      jsonBodyReviver: this.#wrapReviverReplacer(jsonBodyReviver)
    });
    this.respond = true;
    this.response = new Response2(this.request, this.#wrapReviverReplacer(jsonBodyReplacer));
    this.cookies = new SecureCookieMap(serverRequest, {
      keys: this.app.keys,
      response: this.response,
      secure: this.request.secure
    });
  }
  /** Asserts the condition and if the condition fails, creates an HTTP error
   * with the provided status (which defaults to `500`).  The error status by
   * default will be set on the `.response.status`.
   *
   * Because of limitation of TypeScript, any assertion type function requires
   * specific type annotations, so the {@linkcode Context} type should be used
   * even if it can be inferred from the context.
   *
   * ### Example
   *
   * ```ts
   * import { Context, Status } from "https://deno.land/x/oak/mod.ts";
   *
   * export function mw(ctx: Context) {
   *   const body = ctx.request.body();
   *   ctx.assert(body.type === "json", Status.NotAcceptable);
   *   // process the body and send a response...
   * }
   * ```
   */
  assert(condition, errorStatus = 500, message, props) {
    if (condition) {
      return;
    }
    const httpErrorOptions = {};
    if (typeof props === "object") {
      if ("headers" in props) {
        httpErrorOptions.headers = props.headers;
        delete props.headers;
      }
      if ("expose" in props) {
        httpErrorOptions.expose = props.expose;
        delete props.expose;
      }
    }
    const err = createHttpError(errorStatus, message, httpErrorOptions);
    if (props) {
      Object.assign(err, props);
    }
    throw err;
  }
  /** Asynchronously fulfill a response with a file from the local file
   * system.
   *
   * If the `options.path` is not supplied, the file to be sent will default
   * to this `.request.url.pathname`.
   *
   * Requires Deno read permission. */
  send(options) {
    const { path: path2 = this.request.url.pathname, ...sendOptions } = options;
    return send(this, path2, sendOptions);
  }
  /** Convert the connection to stream events, returning an event target for
   * sending server sent events.  Events dispatched on the returned target will
   * be sent to the client and be available in the client's `EventSource` that
   * initiated the connection.
   *
   * **Note** the body needs to be returned to the client to be able to
   * dispatch events, so dispatching events within the middleware will delay
   * sending the body back to the client.
   *
   * This will set the response body and update response headers to support
   * sending SSE events. Additional middleware should not modify the body.
   */
  sendEvents(options) {
    if (!this.#sse) {
      assert2(this.response.writable, "The response is not writable.");
      const sse = this.#sse = new ServerSentEventStreamTarget(options);
      this.app.addEventListener("close", () => sse.close());
      const [bodyInit, { headers }] = sse.asResponseInit({
        headers: this.response.headers
      });
      this.response.body = bodyInit;
      if (headers instanceof Headers) {
        this.response.headers = headers;
      }
    }
    return this.#sse;
  }
  /** Create and throw an HTTP Error, which can be used to pass status
   * information which can be caught by other middleware to send more
   * meaningful error messages back to the client.  The passed error status will
   * be set on the `.response.status` by default as well.
   */
  throw(errorStatus, message, props) {
    const err = createHttpError(errorStatus, message);
    if (props) {
      Object.assign(err, props);
    }
    throw err;
  }
  /** Take the current request and upgrade it to a web socket, resolving with
   * the a web standard `WebSocket` object. This will set `.respond` to
   * `false`.  If the socket cannot be upgraded, this method will throw. */
  upgrade(options) {
    if (this.#socket) {
      return this.#socket;
    }
    if (!this.request.originalRequest.upgrade) {
      throw new TypeError("Web socket upgrades not currently supported for this type of server.");
    }
    this.#socket = this.request.originalRequest.upgrade(options);
    this.app.addEventListener("close", () => this.#socket?.close());
    this.respond = false;
    return this.#socket;
  }
  [_computedKey9](inspect) {
    const { app: app2, cookies, isUpgradable, respond, request, response, socket, state } = this;
    return `${this.constructor.name} ${inspect({
      app: app2,
      cookies,
      isUpgradable,
      respond,
      request,
      response,
      socket,
      state
    })}`;
  }
  [_computedKey18](depth, options, inspect) {
    if (depth < 0) {
      return options.stylize(`[${this.constructor.name}]`, "special");
    }
    const newOptions = Object.assign({}, options, {
      depth: options.depth === null ? null : options.depth - 1
    });
    const { app: app2, cookies, isUpgradable, respond, request, response, socket, state } = this;
    return `${options.stylize(this.constructor.name, "special")} ${inspect({
      app: app2,
      cookies,
      isUpgradable,
      respond,
      request,
      response,
      socket,
      state
    }, newOptions)}`;
  }
};

// deno:https://deno.land/x/oak@v12.6.1/http_server_native.ts
var _computedKey10;
var serveHttp = "serveHttp" in Deno ? Deno.serveHttp.bind(Deno) : void 0;
_computedKey10 = Symbol.asyncIterator;
var HttpServer = class {
  #app;
  #closed = false;
  #listener;
  #httpConnections = /* @__PURE__ */ new Set();
  #options;
  constructor(app2, options) {
    if (!("serveHttp" in Deno)) {
      throw new Error("The native bindings for serving HTTP are not available.");
    }
    this.#app = app2;
    this.#options = options;
  }
  get app() {
    return this.#app;
  }
  get closed() {
    return this.#closed;
  }
  close() {
    this.#closed = true;
    if (this.#listener) {
      this.#listener.close();
      this.#listener = void 0;
    }
    for (const httpConn of this.#httpConnections) {
      try {
        httpConn.close();
      } catch (error) {
        if (!(error instanceof Deno.errors.BadResource)) {
          throw error;
        }
      }
    }
    this.#httpConnections.clear();
  }
  listen() {
    return this.#listener = isListenTlsOptions(this.#options) ? Deno.listenTls(this.#options) : Deno.listen(this.#options);
  }
  #trackHttpConnection(httpConn) {
    this.#httpConnections.add(httpConn);
  }
  #untrackHttpConnection(httpConn) {
    this.#httpConnections.delete(httpConn);
  }
  [_computedKey10]() {
    const start = (controller) => {
      const server = this;
      async function serve(conn) {
        const httpConn = serveHttp(conn);
        server.#trackHttpConnection(httpConn);
        while (true) {
          try {
            const requestEvent = await httpConn.nextRequest();
            if (requestEvent === null) {
              server.#untrackHttpConnection(httpConn);
              return;
            }
            const nativeRequest = new NativeRequest(requestEvent, {
              conn
            });
            controller.enqueue(nativeRequest);
            nativeRequest.donePromise.catch((error) => {
              server.app.dispatchEvent(new ErrorEvent("error", {
                error
              }));
            });
          } catch (error) {
            server.app.dispatchEvent(new ErrorEvent("error", {
              error
            }));
          }
          if (server.closed) {
            server.#untrackHttpConnection(httpConn);
            httpConn.close();
            controller.close();
          }
        }
      }
      const listener = this.#listener;
      assert2(listener);
      async function accept() {
        while (true) {
          try {
            const conn = await listener.accept();
            serve(conn);
          } catch (error) {
            if (!server.closed) {
              server.app.dispatchEvent(new ErrorEvent("error", {
                error
              }));
            }
          }
          if (server.closed) {
            controller.close();
            return;
          }
        }
      }
      accept();
    };
    const stream = new ReadableStream({
      start
    });
    return stream[Symbol.asyncIterator]();
  }
};

// deno:https://deno.land/x/oak@v12.6.1/middleware.ts
function isMiddlewareObject(value) {
  return value && typeof value === "object" && "handleRequest" in value;
}
function compose(middleware) {
  return function composedMiddleware(context, next) {
    let index = -1;
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times.");
      }
      index = i;
      let m = middleware[i];
      let fn;
      if (typeof m === "function") {
        fn = m;
      } else if (m && typeof m.handleRequest === "function") {
        fn = m.handleRequest.bind(m);
      }
      if (i === middleware.length) {
        fn = next;
      }
      if (!fn) {
        return;
      }
      await fn(context, dispatch.bind(null, i + 1));
    }
    return dispatch(0);
  };
}

// deno:https://deno.land/x/oak@v12.6.1/structured_clone.ts
var objectCloneMemo = /* @__PURE__ */ new WeakMap();
function cloneArrayBuffer(srcBuffer, srcByteOffset, srcLength, _cloneConstructor) {
  return srcBuffer.slice(srcByteOffset, srcByteOffset + srcLength);
}
function cloneValue(value) {
  switch (typeof value) {
    case "number":
    case "string":
    case "boolean":
    case "undefined":
    case "bigint":
      return value;
    case "object": {
      if (objectCloneMemo.has(value)) {
        return objectCloneMemo.get(value);
      }
      if (value === null) {
        return value;
      }
      if (value instanceof Date) {
        return new Date(value.valueOf());
      }
      if (value instanceof RegExp) {
        return new RegExp(value);
      }
      if (value instanceof SharedArrayBuffer) {
        return value;
      }
      if (value instanceof ArrayBuffer) {
        const cloned = cloneArrayBuffer(value, 0, value.byteLength, ArrayBuffer);
        objectCloneMemo.set(value, cloned);
        return cloned;
      }
      if (ArrayBuffer.isView(value)) {
        const clonedBuffer = cloneValue(value.buffer);
        let length;
        if (value instanceof DataView) {
          length = value.byteLength;
        } else {
          length = value.length;
        }
        return new value.constructor(clonedBuffer, value.byteOffset, length);
      }
      if (value instanceof Map) {
        const clonedMap = /* @__PURE__ */ new Map();
        objectCloneMemo.set(value, clonedMap);
        value.forEach((v, k) => {
          clonedMap.set(cloneValue(k), cloneValue(v));
        });
        return clonedMap;
      }
      if (value instanceof Set) {
        const clonedSet = new Set([
          ...value
        ].map(cloneValue));
        objectCloneMemo.set(value, clonedSet);
        return clonedSet;
      }
      const clonedObj = {};
      objectCloneMemo.set(value, clonedObj);
      const sourceKeys = Object.getOwnPropertyNames(value);
      for (const key of sourceKeys) {
        clonedObj[key] = cloneValue(value[key]);
      }
      Reflect.setPrototypeOf(clonedObj, Reflect.getPrototypeOf(value));
      return clonedObj;
    }
    case "symbol":
    case "function":
    default:
      throw new DOMException("Uncloneable value in stream", "DataCloneError");
  }
}
var core = Deno?.core;
var structuredClone = globalThis.structuredClone;
function sc(value) {
  return structuredClone ? structuredClone(value) : core ? core.deserialize(core.serialize(value)) : cloneValue(value);
}
function cloneState(state) {
  const clone = {};
  for (const [key, value] of Object.entries(state)) {
    try {
      const clonedValue = sc(value);
      clone[key] = clonedValue;
    } catch {
    }
  }
  return clone;
}

// deno:https://deno.land/x/oak@v12.6.1/application.ts
var _computedKey11;
var _computedKey19;
var ADDR_REGEXP = /^\[?([^\]]*)\]?:([0-9]{1,5})$/;
var DEFAULT_SERVER = HttpServer;
var ApplicationCloseEvent = class extends Event {
  constructor(eventInitDict) {
    super("close", eventInitDict);
  }
};
var ApplicationErrorEvent = class extends ErrorEvent {
  context;
  constructor(eventInitDict) {
    super("error", eventInitDict);
    this.context = eventInitDict.context;
  }
};
function logErrorListener({ error, context }) {
  if (error instanceof Error) {
    console.error(`[uncaught application error]: ${error.name} - ${error.message}`);
  } else {
    console.error(`[uncaught application error]
`, error);
  }
  if (context) {
    let url;
    try {
      url = context.request.url.toString();
    } catch {
      url = "[malformed url]";
    }
    console.error(`
request:`, {
      url,
      method: context.request.method,
      hasBody: context.request.hasBody
    });
    console.error(`response:`, {
      status: context.response.status,
      type: context.response.type,
      hasBody: !!context.response.body,
      writable: context.response.writable
    });
  }
  if (error instanceof Error && error.stack) {
    console.error(`
${error.stack.split("\n").slice(1).join("\n")}`);
  }
}
var ApplicationListenEvent = class extends Event {
  hostname;
  listener;
  port;
  secure;
  serverType;
  constructor(eventInitDict) {
    super("listen", eventInitDict);
    this.hostname = eventInitDict.hostname;
    this.listener = eventInitDict.listener;
    this.port = eventInitDict.port;
    this.secure = eventInitDict.secure;
    this.serverType = eventInitDict.serverType;
  }
};
_computedKey11 = Symbol.for("Deno.customInspect"), _computedKey19 = Symbol.for("nodejs.util.inspect.custom");
var Application = class extends EventTarget {
  #composedMiddleware;
  #contextOptions;
  #contextState;
  #keys;
  #middleware = [];
  #serverConstructor;
  /** A set of keys, or an instance of `KeyStack` which will be used to sign
   * cookies read and set by the application to avoid tampering with the
   * cookies. */
  get keys() {
    return this.#keys;
  }
  set keys(keys2) {
    if (!keys2) {
      this.#keys = void 0;
      return;
    } else if (Array.isArray(keys2)) {
      this.#keys = new KeyStack(keys2);
    } else {
      this.#keys = keys2;
    }
  }
  /** If `true`, proxy headers will be trusted when processing requests.  This
   * defaults to `false`. */
  proxy;
  /** Generic state of the application, which can be specified by passing the
   * generic argument when constructing:
   *
   *       const app = new Application<{ foo: string }>();
   *
   * Or can be contextually inferred based on setting an initial state object:
   *
   *       const app = new Application({ state: { foo: "bar" } });
   *
   * When a new context is created, the application's state is cloned and the
   * state is unique to that request/response.  Changes can be made to the
   * application state that will be shared with all contexts.
   */
  state;
  constructor(options = {}) {
    super();
    const { state, keys: keys2, proxy: proxy2, serverConstructor = DEFAULT_SERVER, contextState = "clone", logErrors = true, ...contextOptions } = options;
    this.proxy = proxy2 ?? false;
    this.keys = keys2;
    this.state = state ?? {};
    this.#serverConstructor = serverConstructor;
    this.#contextOptions = contextOptions;
    this.#contextState = contextState;
    if (logErrors) {
      this.addEventListener("error", logErrorListener);
    }
  }
  #getComposed() {
    if (!this.#composedMiddleware) {
      this.#composedMiddleware = compose(this.#middleware);
    }
    return this.#composedMiddleware;
  }
  #getContextState() {
    switch (this.#contextState) {
      case "alias":
        return this.state;
      case "clone":
        return cloneState(this.state);
      case "empty":
        return {};
      case "prototype":
        return Object.create(this.state);
    }
  }
  /** Deal with uncaught errors in either the middleware or sending the
   * response. */
  // deno-lint-ignore no-explicit-any
  #handleError(context, error) {
    if (!(error instanceof Error)) {
      error = new Error(`non-error thrown: ${JSON.stringify(error)}`);
    }
    const { message } = error;
    this.dispatchEvent(new ApplicationErrorEvent({
      context,
      message,
      error
    }));
    if (!context.response.writable) {
      return;
    }
    for (const key of [
      ...context.response.headers.keys()
    ]) {
      context.response.headers.delete(key);
    }
    if (error.headers && error.headers instanceof Headers) {
      for (const [key, value] of error.headers) {
        context.response.headers.set(key, value);
      }
    }
    context.response.type = "text";
    const status = context.response.status = Deno.errors && error instanceof Deno.errors.NotFound ? 404 : error.status && typeof error.status === "number" ? error.status : 500;
    context.response.body = error.expose ? error.message : STATUS_TEXT[status];
  }
  /** Processing registered middleware on each request. */
  async #handleRequest(request, secure, state) {
    let context;
    try {
      context = new Context(this, request, this.#getContextState(), {
        secure,
        ...this.#contextOptions
      });
    } catch (e) {
      const error = e instanceof Error ? e : new Error(`non-error thrown: ${JSON.stringify(e)}`);
      const { message } = error;
      this.dispatchEvent(new ApplicationErrorEvent({
        message,
        error
      }));
      return;
    }
    assert2(context, "Context was not created.");
    let resolve;
    const handlingPromise = new Promise((res) => resolve = res);
    state.handling.add(handlingPromise);
    if (!state.closing && !state.closed) {
      try {
        await this.#getComposed()(context);
      } catch (err) {
        this.#handleError(context, err);
      }
    }
    if (context.respond === false) {
      context.response.destroy();
      resolve();
      state.handling.delete(handlingPromise);
      return;
    }
    let closeResources = true;
    let response;
    try {
      closeResources = false;
      response = await context.response.toDomResponse();
    } catch (err) {
      this.#handleError(context, err);
      response = await context.response.toDomResponse();
    }
    assert2(response);
    try {
      await request.respond(response);
    } catch (err) {
      this.#handleError(context, err);
    } finally {
      context.response.destroy(closeResources);
      resolve();
      state.handling.delete(handlingPromise);
      if (state.closing) {
        await state.server.close();
        if (!state.closed) {
          this.dispatchEvent(new ApplicationCloseEvent({}));
        }
        state.closed = true;
      }
    }
  }
  /** Add an event listener for an event.  Currently valid event types are
   * `"error"` and `"listen"`. */
  addEventListener(type, listener, options) {
    super.addEventListener(type, listener, options);
  }
  /** Handle an individual server request, returning the server response.  This
   * is similar to `.listen()`, but opening the connection and retrieving
   * requests are not the responsibility of the application.  If the generated
   * context gets set to not to respond, then the method resolves with
   * `undefined`, otherwise it resolves with a request that is compatible with
   * `std/http/server`. */
  handle = async (request, secureOrConn, secure = false) => {
    if (!this.#middleware.length) {
      throw new TypeError("There is no middleware to process requests.");
    }
    assert2(isConn(secureOrConn) || typeof secureOrConn === "undefined");
    const contextRequest = new NativeRequest({
      request,
      respondWith() {
        return Promise.resolve(void 0);
      }
    }, {
      conn: secureOrConn
    });
    const context = new Context(this, contextRequest, this.#getContextState(), {
      secure,
      ...this.#contextOptions
    });
    try {
      await this.#getComposed()(context);
    } catch (err) {
      this.#handleError(context, err);
    }
    if (context.respond === false) {
      context.response.destroy();
      return;
    }
    try {
      const response = await context.response.toDomResponse();
      context.response.destroy(false);
      return response;
    } catch (err) {
      this.#handleError(context, err);
      throw err;
    }
  };
  async listen(options = {
    port: 0
  }) {
    if (!this.#middleware.length) {
      throw new TypeError("There is no middleware to process requests.");
    }
    for (const middleware of this.#middleware) {
      if (isMiddlewareObject(middleware) && middleware.init) {
        await middleware.init();
      }
    }
    if (typeof options === "string") {
      const match2 = ADDR_REGEXP.exec(options);
      if (!match2) {
        throw TypeError(`Invalid address passed: "${options}"`);
      }
      const [, hostname2, portStr] = match2;
      options = {
        hostname: hostname2,
        port: parseInt(portStr, 10)
      };
    }
    options = Object.assign({
      port: 0
    }, options);
    const server = new this.#serverConstructor(this, options);
    const { signal } = options;
    const state = {
      closed: false,
      closing: false,
      handling: /* @__PURE__ */ new Set(),
      server
    };
    if (signal) {
      signal.addEventListener("abort", () => {
        if (!state.handling.size) {
          server.close();
          state.closed = true;
          this.dispatchEvent(new ApplicationCloseEvent({}));
        }
        state.closing = true;
      });
    }
    const { secure = false } = options;
    const serverType = server instanceof HttpServer ? "native" : "custom";
    const listener = await server.listen();
    const { hostname, port } = listener.addr;
    this.dispatchEvent(new ApplicationListenEvent({
      hostname,
      listener,
      port,
      secure,
      serverType
    }));
    try {
      for await (const request of server) {
        this.#handleRequest(request, secure, state);
      }
      await Promise.all(state.handling);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Application Error";
      this.dispatchEvent(new ApplicationErrorEvent({
        message,
        error
      }));
    }
  }
  use(...middleware) {
    this.#middleware.push(...middleware);
    this.#composedMiddleware = void 0;
    return this;
  }
  [_computedKey11](inspect) {
    const { keys: keys2, proxy: proxy2, state } = this;
    return `${this.constructor.name} ${inspect({
      "#middleware": this.#middleware,
      keys: keys2,
      proxy: proxy2,
      state
    })}`;
  }
  [_computedKey19](depth, options, inspect) {
    if (depth < 0) {
      return options.stylize(`[${this.constructor.name}]`, "special");
    }
    const newOptions = Object.assign({}, options, {
      depth: options.depth === null ? null : options.depth - 1
    });
    const { keys: keys2, proxy: proxy2, state } = this;
    return `${options.stylize(this.constructor.name, "special")} ${inspect({
      "#middleware": this.#middleware,
      keys: keys2,
      proxy: proxy2,
      state
    }, newOptions)}`;
  }
};

// deno:https://deno.land/x/oak@v12.6.1/router.ts
var _computedKey20;
var _computedKey110;
var _computedKey23;
var _computedKey32;
var _computedKey42;
function toUrl(url, params = {}, options) {
  const tokens = parse2(url);
  let replace = {};
  if (tokens.some((token) => typeof token === "object")) {
    replace = params;
  } else {
    options = params;
  }
  const toPath = compile(url, options);
  const replaced = toPath(replace);
  if (options && options.query) {
    const url2 = new URL(replaced, "http://oak");
    if (typeof options.query === "string") {
      url2.search = options.query;
    } else {
      url2.search = String(options.query instanceof URLSearchParams ? options.query : new URLSearchParams(options.query));
    }
    return `${url2.pathname}${url2.search}${url2.hash}`;
  }
  return replaced;
}
_computedKey20 = Symbol.for("Deno.customInspect"), _computedKey110 = Symbol.for("nodejs.util.inspect.custom");
var Layer = class _Layer {
  #opts;
  #paramNames = [];
  #regexp;
  methods;
  name;
  path;
  stack;
  constructor(path2, methods, middleware, { name, ...opts } = {}) {
    this.#opts = opts;
    this.name = name;
    this.methods = [
      ...methods
    ];
    if (this.methods.includes("GET")) {
      this.methods.unshift("HEAD");
    }
    this.stack = Array.isArray(middleware) ? middleware.slice() : [
      middleware
    ];
    this.path = path2;
    this.#regexp = pathToRegexp(path2, this.#paramNames, this.#opts);
  }
  clone() {
    return new _Layer(this.path, this.methods, this.stack, {
      name: this.name,
      ...this.#opts
    });
  }
  match(path2) {
    return this.#regexp.test(path2);
  }
  params(captures, existingParams = {}) {
    const params = existingParams;
    for (let i = 0; i < captures.length; i++) {
      if (this.#paramNames[i]) {
        const c = captures[i];
        params[this.#paramNames[i].name] = c ? decodeComponent(c) : c;
      }
    }
    return params;
  }
  captures(path2) {
    if (this.#opts.ignoreCaptures) {
      return [];
    }
    return path2.match(this.#regexp)?.slice(1) ?? [];
  }
  url(params = {}, options) {
    const url = this.path.replace(/\(\.\*\)/g, "");
    return toUrl(url, params, options);
  }
  param(param, fn) {
    const stack = this.stack;
    const params = this.#paramNames;
    const middleware = function(ctx, next) {
      const p = ctx.params[param];
      assert2(p);
      return fn.call(this, p, ctx, next);
    };
    middleware.param = param;
    const names = params.map((p) => p.name);
    const x = names.indexOf(param);
    if (x >= 0) {
      for (let i = 0; i < stack.length; i++) {
        const fn2 = stack[i];
        if (!fn2.param || names.indexOf(fn2.param) > x) {
          stack.splice(i, 0, middleware);
          break;
        }
      }
    }
    return this;
  }
  setPrefix(prefix) {
    if (this.path) {
      this.path = this.path !== "/" || this.#opts.strict === true ? `${prefix}${this.path}` : prefix;
      this.#paramNames = [];
      this.#regexp = pathToRegexp(this.path, this.#paramNames, this.#opts);
    }
    return this;
  }
  // deno-lint-ignore no-explicit-any
  toJSON() {
    return {
      methods: [
        ...this.methods
      ],
      middleware: [
        ...this.stack
      ],
      paramNames: this.#paramNames.map((key) => key.name),
      path: this.path,
      regexp: this.#regexp,
      options: {
        ...this.#opts
      }
    };
  }
  [_computedKey20](inspect) {
    return `${this.constructor.name} ${inspect({
      methods: this.methods,
      middleware: this.stack,
      options: this.#opts,
      paramNames: this.#paramNames.map((key) => key.name),
      path: this.path,
      regexp: this.#regexp
    })}`;
  }
  [_computedKey110](depth, options, inspect) {
    if (depth < 0) {
      return options.stylize(`[${this.constructor.name}]`, "special");
    }
    const newOptions = Object.assign({}, options, {
      depth: options.depth === null ? null : options.depth - 1
    });
    return `${options.stylize(this.constructor.name, "special")} ${inspect({
      methods: this.methods,
      middleware: this.stack,
      options: this.#opts,
      paramNames: this.#paramNames.map((key) => key.name),
      path: this.path,
      regexp: this.#regexp
    }, newOptions)}`;
  }
};
_computedKey23 = Symbol.iterator, _computedKey32 = Symbol.for("Deno.customInspect"), _computedKey42 = Symbol.for("nodejs.util.inspect.custom");
var Router = class _Router {
  #opts;
  #methods;
  // deno-lint-ignore no-explicit-any
  #params = {};
  #stack = [];
  #match(path2, method) {
    const matches = {
      path: [],
      pathAndMethod: [],
      route: false
    };
    for (const route of this.#stack) {
      if (route.match(path2)) {
        matches.path.push(route);
        if (route.methods.length === 0 || route.methods.includes(method)) {
          matches.pathAndMethod.push(route);
          if (route.methods.length) {
            matches.route = true;
            matches.name = route.name;
          }
        }
      }
    }
    return matches;
  }
  #register(path2, middlewares, methods, options = {}) {
    if (Array.isArray(path2)) {
      for (const p of path2) {
        this.#register(p, middlewares, methods, options);
      }
      return;
    }
    let layerMiddlewares = [];
    for (const middleware of middlewares) {
      if (!middleware.router) {
        layerMiddlewares.push(middleware);
        continue;
      }
      if (layerMiddlewares.length) {
        this.#addLayer(path2, layerMiddlewares, methods, options);
        layerMiddlewares = [];
      }
      const router2 = middleware.router.#clone();
      for (const layer of router2.#stack) {
        if (!options.ignorePrefix) {
          layer.setPrefix(path2);
        }
        if (this.#opts.prefix) {
          layer.setPrefix(this.#opts.prefix);
        }
        this.#stack.push(layer);
      }
      for (const [param, mw] of Object.entries(this.#params)) {
        router2.param(param, mw);
      }
    }
    if (layerMiddlewares.length) {
      this.#addLayer(path2, layerMiddlewares, methods, options);
    }
  }
  #addLayer(path2, middlewares, methods, options = {}) {
    const { end, name, sensitive = this.#opts.sensitive, strict = this.#opts.strict, ignoreCaptures } = options;
    const route = new Layer(path2, methods, middlewares, {
      end,
      name,
      sensitive,
      strict,
      ignoreCaptures
    });
    if (this.#opts.prefix) {
      route.setPrefix(this.#opts.prefix);
    }
    for (const [param, mw] of Object.entries(this.#params)) {
      route.param(param, mw);
    }
    this.#stack.push(route);
  }
  #route(name) {
    for (const route of this.#stack) {
      if (route.name === name) {
        return route;
      }
    }
  }
  #useVerb(nameOrPath, pathOrMiddleware, middleware, methods) {
    let name = void 0;
    let path2;
    if (typeof pathOrMiddleware === "string") {
      name = nameOrPath;
      path2 = pathOrMiddleware;
    } else {
      path2 = nameOrPath;
      middleware.unshift(pathOrMiddleware);
    }
    this.#register(path2, middleware, methods, {
      name
    });
  }
  #clone() {
    const router2 = new _Router(this.#opts);
    router2.#methods = router2.#methods.slice();
    router2.#params = {
      ...this.#params
    };
    router2.#stack = this.#stack.map((layer) => layer.clone());
    return router2;
  }
  constructor(opts = {}) {
    this.#opts = opts;
    this.#methods = opts.methods ?? [
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
      "PUT"
    ];
  }
  add(methods, nameOrPath, pathOrMiddleware, ...middleware) {
    this.#useVerb(nameOrPath, pathOrMiddleware, middleware, typeof methods === "string" ? [
      methods
    ] : methods);
    return this;
  }
  all(nameOrPath, pathOrMiddleware, ...middleware) {
    this.#useVerb(nameOrPath, pathOrMiddleware, middleware, this.#methods.filter((method) => method !== "OPTIONS"));
    return this;
  }
  /** Middleware that handles requests for HTTP methods registered with the
   * router.  If none of the routes handle a method, then "not allowed" logic
   * will be used.  If a method is supported by some routes, but not the
   * particular matched router, then "not implemented" will be returned.
   *
   * The middleware will also automatically handle the `OPTIONS` method,
   * responding with a `200 OK` when the `Allowed` header sent to the allowed
   * methods for a given route.
   *
   * By default, a "not allowed" request will respond with a `405 Not Allowed`
   * and a "not implemented" will respond with a `501 Not Implemented`. Setting
   * the option `.throw` to `true` will cause the middleware to throw an
   * `HTTPError` instead of setting the response status.  The error can be
   * overridden by providing a `.notImplemented` or `.notAllowed` method in the
   * options, of which the value will be returned will be thrown instead of the
   * HTTP error. */
  allowedMethods(options = {}) {
    const implemented = this.#methods;
    const allowedMethods = async (context, next) => {
      const ctx = context;
      await next();
      if (!ctx.response.status || ctx.response.status === Status.NotFound) {
        assert2(ctx.matched);
        const allowed = /* @__PURE__ */ new Set();
        for (const route of ctx.matched) {
          for (const method of route.methods) {
            allowed.add(method);
          }
        }
        const allowedStr = [
          ...allowed
        ].join(", ");
        if (!implemented.includes(ctx.request.method)) {
          if (options.throw) {
            throw options.notImplemented ? options.notImplemented() : new errors.NotImplemented();
          } else {
            ctx.response.status = Status.NotImplemented;
            ctx.response.headers.set("Allow", allowedStr);
          }
        } else if (allowed.size) {
          if (ctx.request.method === "OPTIONS") {
            ctx.response.status = Status.OK;
            ctx.response.headers.set("Allow", allowedStr);
          } else if (!allowed.has(ctx.request.method)) {
            if (options.throw) {
              throw options.methodNotAllowed ? options.methodNotAllowed() : new errors.MethodNotAllowed();
            } else {
              ctx.response.status = Status.MethodNotAllowed;
              ctx.response.headers.set("Allow", allowedStr);
            }
          }
        }
      }
    };
    return allowedMethods;
  }
  delete(nameOrPath, pathOrMiddleware, ...middleware) {
    this.#useVerb(nameOrPath, pathOrMiddleware, middleware, [
      "DELETE"
    ]);
    return this;
  }
  /** Iterate over the routes currently added to the router.  To be compatible
   * with the iterable interfaces, both the key and value are set to the value
   * of the route. */
  *entries() {
    for (const route of this.#stack) {
      const value = route.toJSON();
      yield [
        value,
        value
      ];
    }
  }
  /** Iterate over the routes currently added to the router, calling the
   * `callback` function for each value. */
  forEach(callback, thisArg = null) {
    for (const route of this.#stack) {
      const value = route.toJSON();
      callback.call(thisArg, value, value, this);
    }
  }
  get(nameOrPath, pathOrMiddleware, ...middleware) {
    this.#useVerb(nameOrPath, pathOrMiddleware, middleware, [
      "GET"
    ]);
    return this;
  }
  head(nameOrPath, pathOrMiddleware, ...middleware) {
    this.#useVerb(nameOrPath, pathOrMiddleware, middleware, [
      "HEAD"
    ]);
    return this;
  }
  /** Iterate over the routes currently added to the router.  To be compatible
   * with the iterable interfaces, the key is set to the value of the route. */
  *keys() {
    for (const route of this.#stack) {
      yield route.toJSON();
    }
  }
  options(nameOrPath, pathOrMiddleware, ...middleware) {
    this.#useVerb(nameOrPath, pathOrMiddleware, middleware, [
      "OPTIONS"
    ]);
    return this;
  }
  /** Register param middleware, which will be called when the particular param
   * is parsed from the route. */
  param(param, middleware) {
    this.#params[param] = middleware;
    for (const route of this.#stack) {
      route.param(param, middleware);
    }
    return this;
  }
  patch(nameOrPath, pathOrMiddleware, ...middleware) {
    this.#useVerb(nameOrPath, pathOrMiddleware, middleware, [
      "PATCH"
    ]);
    return this;
  }
  post(nameOrPath, pathOrMiddleware, ...middleware) {
    this.#useVerb(nameOrPath, pathOrMiddleware, middleware, [
      "POST"
    ]);
    return this;
  }
  /** Set the router prefix for this router. */
  prefix(prefix) {
    prefix = prefix.replace(/\/$/, "");
    this.#opts.prefix = prefix;
    for (const route of this.#stack) {
      route.setPrefix(prefix);
    }
    return this;
  }
  put(nameOrPath, pathOrMiddleware, ...middleware) {
    this.#useVerb(nameOrPath, pathOrMiddleware, middleware, [
      "PUT"
    ]);
    return this;
  }
  /** Register a direction middleware, where when the `source` path is matched
   * the router will redirect the request to the `destination` path.  A `status`
   * of `302 Found` will be set by default.
   *
   * The `source` and `destination` can be named routes. */
  redirect(source, destination, status = Status.Found) {
    if (source[0] !== "/") {
      const s = this.url(source);
      if (!s) {
        throw new RangeError(`Could not resolve named route: "${source}"`);
      }
      source = s;
    }
    if (typeof destination === "string") {
      if (destination[0] !== "/") {
        const d = this.url(destination);
        if (!d) {
          try {
            const url = new URL(destination);
            destination = url;
          } catch {
            throw new RangeError(`Could not resolve named route: "${source}"`);
          }
        } else {
          destination = d;
        }
      }
    }
    this.all(source, async (ctx, next) => {
      await next();
      ctx.response.redirect(destination);
      ctx.response.status = status;
    });
    return this;
  }
  /** Return middleware that will do all the route processing that the router
   * has been configured to handle.  Typical usage would be something like this:
   *
   * ```ts
   * import { Application, Router } from "https://deno.land/x/oak/mod.ts";
   *
   * const app = new Application();
   * const router = new Router();
   *
   * // register routes
   *
   * app.use(router.routes());
   * app.use(router.allowedMethods());
   * await app.listen({ port: 80 });
   * ```
   */
  routes() {
    const dispatch = (context, next) => {
      const ctx = context;
      let pathname;
      let method;
      try {
        const { url: { pathname: p }, method: m } = ctx.request;
        pathname = p;
        method = m;
      } catch (e) {
        return Promise.reject(e);
      }
      const path2 = this.#opts.routerPath ?? ctx.routerPath ?? decodeURI(pathname);
      const matches = this.#match(path2, method);
      if (ctx.matched) {
        ctx.matched.push(...matches.path);
      } else {
        ctx.matched = [
          ...matches.path
        ];
      }
      ctx.router = this;
      if (!matches.route) return next();
      ctx.routeName = matches.name;
      const { pathAndMethod: matchedRoutes } = matches;
      const chain = matchedRoutes.reduce((prev, route) => [
        ...prev,
        (ctx2, next2) => {
          ctx2.captures = route.captures(path2);
          ctx2.params = route.params(ctx2.captures, ctx2.params);
          return next2();
        },
        ...route.stack
      ], []);
      return compose(chain)(ctx, next);
    };
    dispatch.router = this;
    return dispatch;
  }
  /** Generate a URL pathname for a named route, interpolating the optional
   * params provided.  Also accepts an optional set of options. */
  url(name, params, options) {
    const route = this.#route(name);
    if (route) {
      return route.url(params, options);
    }
  }
  use(pathOrMiddleware, ...middleware) {
    let path2;
    if (typeof pathOrMiddleware === "string" || Array.isArray(pathOrMiddleware)) {
      path2 = pathOrMiddleware;
    } else {
      middleware.unshift(pathOrMiddleware);
    }
    this.#register(path2 ?? "(.*)", middleware, [], {
      end: false,
      ignoreCaptures: !path2,
      ignorePrefix: !path2
    });
    return this;
  }
  /** Iterate over the routes currently added to the router. */
  *values() {
    for (const route of this.#stack) {
      yield route.toJSON();
    }
  }
  /** Provide an iterator interface that iterates over the routes registered
   * with the router. */
  *[_computedKey23]() {
    for (const route of this.#stack) {
      yield route.toJSON();
    }
  }
  /** Generate a URL pathname based on the provided path, interpolating the
   * optional params provided.  Also accepts an optional set of options. */
  static url(path2, params, options) {
    return toUrl(path2, params, options);
  }
  [_computedKey32](inspect) {
    return `${this.constructor.name} ${inspect({
      "#params": this.#params,
      "#stack": this.#stack
    })}`;
  }
  [_computedKey42](depth, options, inspect) {
    if (depth < 0) {
      return options.stylize(`[${this.constructor.name}]`, "special");
    }
    const newOptions = Object.assign({}, options, {
      depth: options.depth === null ? null : options.depth - 1
    });
    return `${options.stylize(this.constructor.name, "special")} ${inspect({
      "#params": this.#params,
      "#stack": this.#stack
    }, newOptions)}`;
  }
};

// shared/constants.json
var constants_default = {
  PROJECT_PATH: "D:/Users/m_botezatu/projects/fifx-client-1",
  SRC_PATH: "src",
  DIST_PATH: "dist",
  BUNDLE_FILE_NAME: "fifx-client.js",
  APP_ID: "fifx-client",
  REDUX_OUTPUT_FILE: "external/redux.js",
  REDUX_TEMPLATE_FILE: "internal/redux-template.js",
  OBJECTIVES: {
    actions: "actions",
    messages: "messages",
    utils: "utils",
    helpers: "helpers",
    constants: "constants",
    model: "model",
    components: "components"
  },
  OBJECTIVES_PATH: "external",
  EXPORTS_PATH: "shared/exports",
  REEXPORTS_PATH: "external/reexports",
  SERVER_PORT: "8080",
  DEV_TOOLS_PATH: "D:/users/m_botezatu/projects/dev-tools",
  EXTERNAL_DEV_TOOLS_BUNDLE_FILENAME: "dev-tools.js",
  EXTERNAL_REDUX_BUNDLE_FILENAME: "redux.js",
  EXTERNAL_EXTENSIONS_BUNDLE_FILENAME: "extensions.js",
  DEV_TOOLS_EXTERNAL_DIST_PATH: "dist",
  ACTIONS_CACHE_LIMIT: 500,
  STORAGE_FOLDER: "storage"
};

// package.json
var package_default = {
  name: "@icap/dev-tools",
  version: "1.0.3",
  description: "",
  main: "external/dist/dev-tools.js",
  scripts: {
    test: 'echo "Error: no test specified" && exit 1'
  },
  files: [
    "extensions/icap-register-with-redux/external/dist/redux.js",
    "external/dist/dev-tools.js",
    "external/dist/dev-tools.css",
    "external/dist/dev-tools.js.map",
    "external/dist/redux.js",
    "external/dist/redux.js.map",
    "internal/modules/server/dist/server.js"
  ],
  repository: {
    type: "git",
    url: "https://scm.tpicapcloud.com/fusion/ux/dev-tools.git"
  },
  author: "",
  license: "ISC",
  devDependencies: {
    "@babel/preset-react": "^7.27.1",
    "@babel/preset-typescript": "^7.27.1",
    "@json2csv/plainjs": "^7.0.6",
    "@reduxjs/toolkit": "^1.9.7",
    "@rollup/plugin-babel": "^6.0.4",
    "@rollup/plugin-commonjs": "^29.0.2",
    "@rollup/plugin-json": "^6.1.0",
    "@rollup/plugin-node-resolve": "^15.2.3",
    "@rollup/plugin-typescript": "^12.3.0",
    "@types/node": "^25.6.0",
    "@types/numeral": "^2.0.4",
    "@types/ramda": "^0.29.7",
    "@xterm/xterm": "^5.5.0",
    "date-fns": "^3.2.0",
    "decimal.js": "^10.4.3",
    "driver.js": "^1.3.6",
    eruda: "^3.4.3",
    esbuild: "^0.28.0",
    "json-beautify": "^1.1.1",
    less: "^4.5.1",
    numeral: "^2.0.6",
    process: "^0.11.10",
    ramda: "^0.29.1",
    redux: "^4.0.5",
    rollup: "^4.21.3",
    "rollup-plugin-postcss": "^4.0.2",
    "rollup-plugin-typescript2": "^0.36.0",
    "rollup-plugin-visualizer": "^6.0.5",
    sortablejs: "^1.15.6",
    tslib: "^2.7.0",
    typescript: "^4.9.5",
    "webpack-inject-plugin": "^1.5.5"
  }
};

// modules/storage/internal/engine.ts
var kv = await Deno.openKv();
var Engine = class _Engine {
  static current = "fs";
  static ext = "txt";
  static path = Deno.env.get("APPDATA") ? `${Deno.env.get("APPDATA")}/${package_default.name}/${constants_default.STORAGE_FOLDER}` : constants_default.STORAGE_FOLDER;
  static async list(prefix) {
    switch (_Engine.current) {
      case "fs":
        return [];
      case "kv":
        const list = await kv.list({
          prefix
        });
        const values = [];
        for await (const entry of list) {
          console.log(entry.value);
          values.push(entry.value);
        }
        return values;
    }
  }
  static async set(key, value) {
    if (!key || !key.length) {
      return;
    }
    switch (_Engine.current) {
      case "fs":
        const valueStr = value?.constructor === String ? value : JSON.stringify(value);
        await _Engine.ensureDir(_Engine.path);
        await _Engine.ensureDir(_Engine.path + "/" + key.slice(0, -1).join("/"));
        return Deno.writeTextFile(_Engine.path + "/" + key.join("/") + "." + _Engine.ext, valueStr);
      case "kv":
        return kv.set(key, value);
    }
  }
  static async get(key) {
    if (!key || !key.length) {
      return;
    }
    switch (_Engine.current) {
      case "fs":
        await _Engine.ensureDir(_Engine.path);
        await _Engine.ensureDir(_Engine.path + "/" + key.slice(0, -1).join("/"));
        return Deno.readTextFile(_Engine.path + "/" + key.join("/") + "." + _Engine.ext);
      case "kv":
        return (await kv.get(key)).value;
    }
  }
  static async delete(key) {
    if (!key || !key.length) {
      return;
    }
    switch (_Engine.current) {
      case "fs":
        await _Engine.ensureDir(_Engine.path);
        await _Engine.ensureDir(_Engine.path + "/" + key.slice(0, -1).join("/"));
        return Deno.remove(_Engine.path + "/" + key.join("/"), {
          recursive: true
        });
      case "kv":
        return kv.get(key);
    }
  }
  static async close() {
    switch (_Engine.current) {
      case "fs":
        break;
      case "kv":
        return kv.close();
    }
  }
  static setCurrent(engineName) {
    _Engine.current = engineName;
  }
  static async folderExists(path2) {
    try {
      const stat = await Deno.stat(path2?.constructor === String ? path2 : path2.join("/"));
      return stat.isDirectory;
    } catch (e) {
      return false;
    }
  }
  static async ensureDir(path2) {
    if (!path2 || !path2.length) {
      return;
    }
    if (await _Engine.folderExists(path2)) {
      return;
    }
    return Deno.mkdir(path2?.constructor === String ? path2 : path2.join("/"), {
      recursive: true
    });
  }
};

// modules/storage/internal/storage.ts
var Storage = class {
  async store(key, value) {
    if (key.length === 0) {
      return Promise.reject("Storage key required");
    }
    const res = await Engine.set(key, value);
    return res;
  }
  async list(prefix) {
    if (!prefix?.length) {
      return Promise.reject("Storage prefix required");
    }
    const res = await Engine.list(prefix);
    return res;
  }
  async get(key) {
    if (key.length === 0) {
      return Promise.reject("Storage key required");
    }
    const res = await Engine.get(key);
    return res;
  }
  setPath(path2) {
    if (path2) {
      Engine.path = String(path2);
    }
  }
  switchEngine(engineName) {
    Engine.current = engineName;
  }
  async delete(key) {
    const res = await Engine.delete(key);
    return res;
  }
  async close() {
    return Engine.close();
  }
};

// modules/logger/internal/logger.ts
var Logger = class {
  key = "logger";
  countersKey = "counters";
  limit = 1e3;
  storage = new Storage();
  async log(key, value) {
    const logValue = {
      value,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    const counterKey = [
      this.countersKey,
      key
    ];
    const count = (await this.storage.get(counterKey)).value;
    const index = !count ? -1 : count;
    if (index >= this.limit) {
      for (let i = 0; i < index - this.limit; i++) {
        await this.storage.delete([
          this.key,
          key,
          i
        ]);
      }
    }
    const logKey = [
      this.key,
      key,
      index
    ];
    await this.storage.store(counterKey, index + 1);
    return await this.storage.store(logKey, logValue);
  }
  async get(key) {
    const logs = await this.storage.list([
      this.key,
      key
    ]);
    const retLogs = [];
    if (!logs) {
      return retLogs;
    }
    for await (const entry of logs) {
      retLogs.push(entry.value);
    }
    return retLogs;
  }
  // public async getEntry(key: string, criteria?: any) {
  //   const logs = await this.storage.list([this.key, key])
  //   if (!criteria || typeof criteria === 'object') {
  //     return (logs as any)?.next()
  //   }
  //   if (!logs) {
  //     return null
  //   }
  //   for await (const entry of logs) {
  //     if (whereEq(criteria, entry?.value?.value)) {
  //       return entry?.value?.value
  //     }
  //   }
  //
  //   return null
  // }
  async clear(key) {
    const logs = await this.storage.list([
      this.key,
      key
    ]);
    const counterKey = [
      this.countersKey,
      key
    ];
    if (!logs) {
      return;
    }
    for await (const entry of logs) {
      this.storage.delete(entry.key);
    }
    await this.storage.delete(counterKey);
  }
  close() {
    return this.storage.close();
  }
};

// internal/modules/server/controllers/git.ts
var getHead = async () => {
  let command = new Deno.Command("sh", {
    args: [
      "-c",
      'cd "$1" && git show -s HEAD && echo "Branch: $(git branch --show-current)" && git reflog show --date=iso | grep -E "checkout:.*$(git branch --show-current)" | head -n 1 && echo "Tag: $(git tag --points-at HEAD)"',
      "sh",
      constants_default.PROJECT_PATH
    ],
    stdout: "piped",
    stderr: "piped"
  });
  let res = await command.output();
  if (res.code !== 0) {
    command = new Deno.Command("sh", {
      args: [
        "-c",
        'git show -s HEAD && echo "Branch: $(git branch --show-current)" && git reflog show --date=iso | grep -E "checkout:.*$(git branch --show-current)" | head -n 1 && echo "Tag: $(git tag --points-at HEAD)"',
        "sh"
      ],
      stdout: "piped",
      stderr: "piped"
    });
    res = await command.output();
    if (res.code !== 0) {
      throw new Error(new TextDecoder().decode(res.stderr).trim());
    }
  }
  const content = new TextDecoder().decode(res.stdout);
  const rows = content.split("\n");
  return {
    commit: rows[0].split(" ")[1]?.trim(),
    date: rows.find((e) => e.startsWith("Date:"))?.replace("Date:", "")?.trim(),
    message: rows[rows.findIndex((e) => e.startsWith("Date:")) + 2]?.trim(),
    branch: rows.find((e) => e.startsWith("Branch:"))?.replace("Branch:", "")?.trim(),
    branchSwitchTime: rows[rows.length - 3].match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)?.[0] || "",
    tag: rows.find((e) => e.startsWith("Tag:"))?.replace("Tag:", "")?.trim()
  };
};

// internal/modules/server/controllers/project-info.ts
var getProjectInfo = async () => {
  let bundleStats;
  try {
    bundleStats = await Deno.stat(`${constants_default.PROJECT_PATH}/${constants_default.DIST_PATH}/${constants_default.BUNDLE_FILE_NAME}`);
  } catch (e) {
    bundleStats = await Deno.stat(`${Deno.cwd()}/${constants_default.DIST_PATH}/${constants_default.BUNDLE_FILE_NAME}`);
  }
  return {
    bundleMTime: bundleStats?.mtime?.toISOString()
  };
};

// modules/sh/internal/sh.ts
var sh_default = async (commandStr) => {
  let projectFolderExists;
  try {
    const stat = await Deno.stat(constants_default.PROJECT_PATH);
    projectFolderExists = stat.isDirectory;
  } catch (e) {
    projectFolderExists = false;
  }
  try {
    let command;
    if (projectFolderExists) {
      command = new Deno.Command("sh", {
        args: [
          "-c",
          `cd ${constants_default.PROJECT_PATH} && ${commandStr}`,
          "sh",
          constants_default.PROJECT_PATH
        ],
        stdout: "piped",
        stderr: "piped"
      });
    } else {
      command = new Deno.Command("sh", {
        args: [
          "-c",
          `${commandStr}`,
          "sh"
        ],
        stdout: "piped",
        stderr: "piped"
      });
    }
    const { code, stdout, stderr } = await command.output();
    if (code !== 0) {
      throw new Error(new TextDecoder().decode(stderr).trim());
    }
    const content = new TextDecoder().decode(stdout);
    return content;
  } catch (e) {
    console.error(e);
  }
};

// internal/modules/server/index.ts
var router = new Router();
router.post("/storage/log/:key", async (context) => {
  context.response.type = "json";
  const logger = new Logger();
  try {
    const body = JSON.parse(await context.request.body().value);
    context.response.status = Status.OK;
    context.response.headers.set("Access-Control-Allow-Origin", "*");
    context.response.headers.set("Content-Type", "application/json");
    await logger.log(context.params.key, body);
  } catch (e) {
    context.response.status = Status.InternalServerError;
    console.log(e);
  } finally {
    logger.close();
  }
});
router.post("/storage/set/:key", async (context) => {
  context.response.type = "json";
  const storage = new Storage();
  try {
    const value = await (await context.request.body()).value;
    let body;
    try {
      body = JSON.parse(value);
    } catch (e) {
      body = value;
    }
    context.response.status = Status.OK;
    await storage.store(String(context.params.key).split("."), body);
    context.response.headers.set("Access-Control-Allow-Origin", "*");
    context.response.headers.set("Content-Type", "application/json");
  } catch (e) {
    context.response.status = Status.InternalServerError;
    console.log(e);
  } finally {
    storage.close();
  }
});
router.get("/storage/clear/:key", async (context) => {
  context.response.type = "json";
  const storage = new Storage();
  try {
    context.response.status = Status.OK;
    context.response.headers.set("Access-Control-Allow-Origin", "*");
    context.response.headers.set("Content-Type", "application/json");
    await storage.delete([
      context.params.key
    ]);
  } catch (e) {
    context.response.status = Status.InternalServerError;
    console.log(e);
  } finally {
    storage.close();
  }
});
router.get("/storage/get/:key", async (context) => {
  context.response.type = "json";
  const storage = new Storage();
  try {
    context.response.status = Status.OK;
    context.response.body = await storage.get(String(context.params.key).split(".")) || {};
    context.response.headers.set("Access-Control-Allow-Origin", "*");
    context.response.headers.set("Content-Type", "application/json");
  } catch (e) {
    context.response.status = Status.InternalServerError;
    console.log(e);
  } finally {
    storage.close();
  }
});
router.get("/git/summary", async (context) => {
  context.response.type = "json";
  try {
    const commit = await getHead();
    context.response.status = Status.OK;
    context.response.body = commit;
    context.response.headers.set("Access-Control-Allow-Origin", "*");
    context.response.headers.set("Content-Type", "application/json");
  } catch (e) {
    context.response.status = Status.InternalServerError;
    console.log(e);
  }
});
router.get("/project-info", async (context) => {
  context.response.type = "json";
  try {
    const projectInfo = await getProjectInfo();
    context.response.status = Status.OK;
    context.response.body = projectInfo;
    context.response.headers.set("Access-Control-Allow-Origin", "*");
    context.response.headers.set("Content-Type", "application/json");
  } catch (e) {
    context.response.status = Status.InternalServerError;
    console.log(e);
  }
});
router.get("/sh/:command", async (context) => {
  try {
    const stdout = await sh_default(context.params.command);
    context.response.type = "text";
    context.response.status = Status.OK;
    context.response.body = stdout;
    context.response.headers.set("Access-Control-Allow-Origin", "*");
    context.response.headers.set("Content-Type", "text/plain");
  } catch (e) {
    context.response.status = Status.InternalServerError;
    console.log(e);
  }
});
var app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());
console.log("listening on port 8080");
app.listen({
  hostname: "127.0.0.1",
  port: 8080
});
/*!
 * Adapted directly from negotiator at https://github.com/jshttp/negotiator/
 * which is licensed as follows:
 *
 * (The MIT License)
 *
 * Copyright (c) 2012-2014 Federico Romero
 * Copyright (c) 2012-2014 Isaac Z. Schlueter
 * Copyright (c) 2014-2015 Douglas Christopher Wilson
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/*!
 * Adapted directly from media-typer at https://github.com/jshttp/media-typer/
 * which is licensed as follows:
 *
 * media-typer
 * Copyright(c) 2014-2017 Douglas Christopher Wilson
 * MIT Licensed
 */
/*!
 * Adapted directly from type-is at https://github.com/jshttp/type-is/
 * which is licensed as follows:
 *
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */
/*!
 * Adapted directly from https://github.com/pillarjs/resolve-path
 * which is licensed as follows:
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Jonathan Ong <me@jongleberry.com>
 * Copyright (c) 2015-2018 Douglas Christopher Wilson <doug@somethingdoug.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/*!
 * Adapted from koa-send at https://github.com/koajs/send and which is licensed
 * with the MIT license.
 */
/*!
 * Adapted directly from forwarded-parse at https://github.com/lpinca/forwarded-parse
 * which is licensed as follows:
 *
 * Copyright(c) 2015 Luigi Pinca
 * Copyright(c) 2023 the oak authors
 * MIT Licensed
 */
