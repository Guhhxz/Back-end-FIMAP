// ../workers-shared/asset-worker/src/worker.ts
import { WorkerEntrypoint } from "cloudflare:workers";

// ../workers-shared/utils/performance.ts
var PerformanceTimer = class {
  constructor(performanceTimer) {
    this.performanceTimer = performanceTimer;
  }
  now() {
    return this.performanceTimer ? this.performanceTimer.timeOrigin + this.performanceTimer.now() : Date.now();
  }
};

// ../workers-shared/utils/tracing.ts
function mockJaegerBindingSpan() {
  return {
    addLogs: () => {
    },
    setTags: () => {
    },
    end: () => {
    },
    isRecording: !0
  };
}
function mockJaegerBinding() {
  return {
    enterSpan: (_, span, ...args) => span(mockJaegerBindingSpan(), ...args),
    getSpanContext: () => ({
      traceId: "test-trace",
      spanId: "test-span",
      parentSpanId: "test-parent-span",
      traceFlags: 0
    }),
    runWithSpanContext: (_, callback, ...args) => callback(...args),
    traceId: "test-trace",
    spanId: "test-span",
    parentSpanId: "test-parent-span",
    cfTraceIdHeader: "test-trace:test-span:0"
  };
}

// ../workers-shared/asset-worker/src/analytics.ts
function getRequestKind(request) {
  let dest = request.headers.get("Sec-Fetch-Dest");
  if (dest)
    return dest === "document" || dest === "iframe" ? "navigation" : "subresource";
  let { pathname } = new URL(request.url), lastSegment = pathname.slice(pathname.lastIndexOf("/") + 1), dotIndex = lastSegment.lastIndexOf(".");
  return dotIndex <= 0 || lastSegment.slice(dotIndex + 1).toLowerCase() === "html" ? "navigation" : "subresource";
}
var COMPATIBILITY_FLAG_MASKS = {
  assets_navigation_prefers_asset_serving: 1
  // next_one: 1 << 1
  // one_after_that: 1 << 2
  // etc: 1 << 3
}, Analytics = class {
  constructor(readyAnalytics) {
    this.data = {};
    this.readyAnalytics = readyAnalytics;
  }
  setData(newData) {
    this.data = { ...this.data, ...newData };
  }
  getData(key) {
    return this.data[key];
  }
  write() {
    if (!this.readyAnalytics)
      return;
    let compatibilityFlagsBitmask = 0;
    for (let compatibilityFlag of this.data.compatibilityFlags || []) {
      let mask = COMPATIBILITY_FLAG_MASKS[compatibilityFlag];
      mask && (compatibilityFlagsBitmask += mask);
    }
    this.readyAnalytics.logEvent({
      version: 1,
      accountId: this.data.accountId,
      indexId: this.data.scriptId?.toString(),
      doubles: [
        this.data.requestTime ?? -1,
        // double1
        this.data.coloId ?? -1,
        // double2
        this.data.metalId ?? -1,
        // double3
        this.data.coloTier ?? -1,
        // double4
        this.data.status ?? -1,
        // double5
        compatibilityFlagsBitmask,
        // double6
        this.data.entrypoint ?? -1
        // double7
      ],
      blobs: [
        this.data.hostname?.substring(0, 256),
        // blob1 - trim to 256 bytes
        this.data.userAgent?.substring(0, 256),
        // blob2 - trim to 256 bytes
        this.data.htmlHandling,
        // blob3
        this.data.notFoundHandling,
        // blob4
        this.data.error?.substring(0, 256),
        // blob5 - trim to 256 bytes
        this.data.version,
        // blob6
        this.data.coloRegion,
        // blob7
        this.data.cacheStatus,
        // blob8
        this.data.cohort,
        // blob9
        this.data.servedBy,
        // blob10
        this.data.requestKind
        // blob11
      ]
    });
  }
};

// ../workers-shared/asset-worker/src/assets-manifest.ts
var AssetsManifest = class {
  constructor(data) {
    this.data = new Uint8Array(data);
  }
  async get(pathname) {
    let pathHash = await hashPath(pathname), entry = binarySearch(this.data, pathHash);
    return entry ? Uint8ToHexString(entry) : null;
  }
}, hashPath = async (path) => {
  let data = new TextEncoder().encode(path), hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    data.buffer
  );
  return new Uint8Array(hashBuffer, 0, 16);
}, binarySearch = (manifest, pathHash) => {
  if (pathHash.byteLength !== 16)
    throw new TypeError(
      `Search value should have a length of ${16}`
    );
  let numberOfEntries = (manifest.byteLength - 20) / 40;
  if (numberOfEntries === 0)
    return !1;
  let lowIndex = 0, highIndex = numberOfEntries - 1;
  for (; lowIndex <= highIndex; ) {
    let middleIndex = lowIndex + highIndex >> 1, cmp = comparePathHashWithEntry(pathHash, manifest, middleIndex);
    if (cmp < 0) {
      highIndex = middleIndex - 1;
      continue;
    }
    if (cmp > 0) {
      lowIndex = middleIndex + 1;
      continue;
    }
    return new Uint8Array(
      manifest.buffer,
      20 + middleIndex * 40 + 16,
      16
    );
  }
  return !1;
};
function comparePathHashWithEntry(searchValue, manifest, entryIndex) {
  let pathHashOffset = 20 + entryIndex * 40 + 0;
  for (let offset = 0; offset < 16; offset++, pathHashOffset++) {
    let s = searchValue[offset], e = manifest[pathHashOffset];
    if (s === void 0 || e === void 0)
      throw new TypeError(
        `Unexpected undefined value at offset ${offset} during path hash comparison`
      );
    if (s < e)
      return -1;
    if (s > e)
      return 1;
  }
  return 0;
}
var Uint8ToHexString = (array) => [...array].map((b) => b.toString(16).padStart(2, "0")).join("");

// ../workers-shared/utils/base-path.ts
var CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/;
function normalizeBasePath(value) {
  if (value === "/")
    return { valid: !0, value: "/" };
  if (typeof value != "string")
    return {
      valid: !1,
      error: `Expected a string but got ${typeof value}.`
    };
  if (value.length === 0)
    return { valid: !1, error: "The value must not be empty." };
  if (value.startsWith("//") || /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value))
    return {
      valid: !1,
      error: "The value must be a pathname, not a URL."
    };
  if (value.includes("\\"))
    return { valid: !1, error: "The value must not contain backslashes." };
  if (CONTROL_CHARACTER.test(value))
    return {
      valid: !1,
      error: "The value must not contain control characters."
    };
  if (value.includes("?") || value.includes("#"))
    return {
      valid: !1,
      error: "The value must not contain query strings or fragments."
    };
  if (value.includes("%"))
    return {
      valid: !1,
      error: "The value must not contain percent-encoded sequences."
    };
  let normalizedSegments = [];
  for (let segment of value.split("/"))
    if (!(segment === "" || segment === ".")) {
      if (segment === "..") {
        normalizedSegments.pop();
        continue;
      }
      normalizedSegments.push(segment);
    }
  return { valid: !0, value: normalizedSegments.length === 0 ? "/" : `/${normalizedSegments.join("/")}/` };
}

// ../workers-shared/asset-worker/src/compatibility-flags.ts
var SEC_FETCH_MODE_NAVIGATE_HEADER_PREFERS_ASSET_SERVING = {
  enable: "assets_navigation_prefers_asset_serving",
  disable: "assets_navigation_has_no_effect",
  onByDefaultAfter: "2025-04-01"
}, COMPATIBILITY_FLAGS = [
  SEC_FETCH_MODE_NAVIGATE_HEADER_PREFERS_ASSET_SERVING
], resolveCompatibilityOptions = (configuration) => {
  let compatibilityDate = configuration?.compatibility_date ?? "2021-11-02", resolvedCompatibilityFlags = configuration?.compatibility_flags ?? [];
  for (let compatibilityFlag of COMPATIBILITY_FLAGS)
    compatibilityFlag.onByDefaultAfter && compatibilityDate >= compatibilityFlag.onByDefaultAfter && !resolvedCompatibilityFlags.find(
      (flag) => flag === compatibilityFlag.disable
    ) && !resolvedCompatibilityFlags.find(
      (flag) => flag === compatibilityFlag.enable
    ) && resolvedCompatibilityFlags.push(compatibilityFlag.enable);
  return {
    compatibilityDate,
    compatibilityFlags: resolvedCompatibilityFlags
  };
}, flagIsEnabled = (configuration, compatibilityFlag) => !!configuration.compatibility_flags.find(
  (flag) => flag === compatibilityFlag.enable
);

// ../workers-shared/asset-worker/src/configuration.ts
var normalizeConfiguration = (configuration) => {
  let compatibilityOptions = resolveCompatibilityOptions(configuration), basePath = normalizeBasePath(configuration?.base_path ?? "/");
  if (!basePath.valid)
    throw new Error(`Invalid assets base_path: ${basePath.error}`);
  return {
    compatibility_date: compatibilityOptions.compatibilityDate,
    compatibility_flags: compatibilityOptions.compatibilityFlags,
    html_handling: configuration?.html_handling ?? "auto-trailing-slash",
    not_found_handling: configuration?.not_found_handling ?? "none",
    base_path: basePath.value,
    redirects: configuration?.redirects ?? {
      version: 1,
      staticRules: {},
      rules: {}
    },
    headers: configuration?.headers ?? {
      version: 2,
      rules: {}
    },
    has_static_routing: configuration?.has_static_routing ?? !1,
    account_id: configuration?.account_id ?? -1,
    script_id: configuration?.script_id ?? -1,
    debug: configuration?.debug ?? !1
  };
};

// ../workers-shared/asset-worker/src/experiment-analytics.ts
var ExperimentAnalytics = class {
  constructor(readyAnalytics) {
    this.data = {};
    this.readyAnalytics = readyAnalytics;
  }
  setData(newData) {
    this.data = { ...this.data, ...newData };
  }
  getData(key) {
    return this.data[key];
  }
  write() {
    this.readyAnalytics && this.readyAnalytics.logEvent({
      version: 1,
      accountId: this.data.accountId,
      indexId: this.data.experimentName,
      doubles: [
        this.data.manifestReadTime ?? -1
        // double1
      ],
      blobs: [
        this.data.binarySearchVersion
        // blob1
      ]
    });
  }
};

// ../workers-shared/utils/responses.ts
var OkResponse = class _OkResponse extends Response {
  static {
    this.status = 200;
  }
  constructor(body, init) {
    super(body, {
      ...init,
      status: _OkResponse.status
    });
  }
}, NotFoundResponse = class _NotFoundResponse extends Response {
  static {
    this.status = 404;
  }
  constructor(...[body, init]) {
    super(body, {
      ...init,
      status: _NotFoundResponse.status,
      statusText: "Not Found"
    });
  }
}, NoIntentResponse = class extends NotFoundResponse {
  constructor() {
    super();
  }
}, MethodNotAllowedResponse = class _MethodNotAllowedResponse extends Response {
  static {
    this.status = 405;
  }
  constructor(...[body, init]) {
    super(body, {
      ...init,
      status: _MethodNotAllowedResponse.status,
      statusText: "Method Not Allowed"
    });
  }
}, InternalServerErrorResponse = class _InternalServerErrorResponse extends Response {
  static {
    this.status = 500;
  }
  constructor(_, init) {
    super(null, {
      ...init,
      status: _InternalServerErrorResponse.status
    });
  }
}, NotModifiedResponse = class _NotModifiedResponse extends Response {
  static {
    this.status = 304;
  }
  constructor(...[_body, init]) {
    super(null, {
      ...init,
      status: _NotModifiedResponse.status,
      statusText: "Not Modified"
    });
  }
}, MovedPermanentlyResponse = class _MovedPermanentlyResponse extends Response {
  static {
    this.status = 301;
  }
  constructor(location, init) {
    super(null, {
      ...init,
      status: _MovedPermanentlyResponse.status,
      statusText: "Moved Permanently",
      headers: {
        ...init?.headers,
        Location: location
      }
    });
  }
}, FoundResponse = class _FoundResponse extends Response {
  static {
    this.status = 302;
  }
  constructor(location, init) {
    super(null, {
      ...init,
      status: _FoundResponse.status,
      statusText: "Found",
      headers: {
        ...init?.headers,
        Location: location
      }
    });
  }
}, SeeOtherResponse = class _SeeOtherResponse extends Response {
  static {
    this.status = 303;
  }
  constructor(location, init) {
    super(null, {
      ...init,
      status: _SeeOtherResponse.status,
      statusText: "See Other",
      headers: {
        ...init?.headers,
        Location: location
      }
    });
  }
}, TemporaryRedirectResponse = class _TemporaryRedirectResponse extends Response {
  static {
    this.status = 307;
  }
  constructor(location, init) {
    super(null, {
      ...init,
      status: _TemporaryRedirectResponse.status,
      statusText: "Temporary Redirect",
      headers: {
        ...init?.headers,
        Location: location
      }
    });
  }
}, PermanentRedirectResponse = class _PermanentRedirectResponse extends Response {
  static {
    this.status = 308;
  }
  constructor(location, init) {
    super(null, {
      ...init,
      status: _PermanentRedirectResponse.status,
      statusText: "Permanent Redirect",
      headers: {
        ...init?.headers,
        Location: location
      }
    });
  }
};

// ../workers-shared/asset-worker/src/utils/base-path.ts
function isWithinBase(publicDecodedPath, base) {
  return base === "/" ? !0 : publicDecodedPath === base.slice(0, -1) || publicDecodedPath.startsWith(base);
}
function stripBasePath(publicDecodedPath, base) {
  if (base === "/")
    return { inPrefix: !0, assetPath: publicDecodedPath };
  if (!isWithinBase(publicDecodedPath, base))
    return { inPrefix: !1, assetPath: publicDecodedPath };
  let stripped = publicDecodedPath.slice(base.length - 1);
  return { inPrefix: !0, assetPath: stripped === "" ? "/" : stripped };
}
function addBasePath(assetRelativePath, base) {
  return base === "/" ? assetRelativePath : assetRelativePath === "/" ? base : base.slice(0, -1) + assetRelativePath;
}

// ../workers-shared/asset-worker/src/constants.ts
var CACHE_CONTROL_BROWSER = "public, max-age=0, must-revalidate";

// ../workers-shared/asset-worker/src/utils/rules-engine.ts
var ESCAPE_REGEX_CHARACTERS = /[-/\\^$*+?.()|[\]{}]/g, escapeRegex = (str) => str.replace(ESCAPE_REGEX_CHARACTERS, "\\$&"), HOST_PLACEHOLDER_REGEX = /(?<=^https:\\\/\\\/[^/]*?):([A-Za-z]\w*)(?=\\)/g, PLACEHOLDER_REGEX = /:([A-Za-z]\w*)/g, replacer = (str, replacements) => {
  for (let [replacement, value] of Object.entries(replacements))
    str = str.replaceAll(`:${replacement}`, value);
  return str;
};
var generateRuleRegExp = (rule) => {
  rule = rule.split("*").map(escapeRegex).join("(?<splat>.*)");
  let host_matches = rule.matchAll(HOST_PLACEHOLDER_REGEX);
  for (let host_match of host_matches)
    rule = rule.split(host_match[0]).join(`(?<${host_match[1]}>[^/.]+)`);
  let path_matches = rule.matchAll(PLACEHOLDER_REGEX);
  for (let path_match of path_matches)
    rule = rule.split(path_match[0]).join(`(?<${path_match[1]}>[^/]+)`);
  return rule = "^" + rule + "$", RegExp(rule);
}, generateRulesMatcher = (rules, replacerFn = (match) => match) => {
  if (!rules)
    return () => [];
  let compiledRules = Object.entries(rules).map(([rule, match]) => {
    let crossHost = rule.startsWith("https://");
    try {
      let regExp = generateRuleRegExp(rule);
      return [{ crossHost, regExp }, match];
    } catch {
    }
  }).filter((value) => value !== void 0);
  return ({ request }) => {
    let { pathname, hostname } = new URL(request.url);
    return compiledRules.map(([{ crossHost, regExp }, match]) => {
      let test = crossHost ? `https://${hostname}${pathname}` : pathname, result = regExp.exec(test);
      if (result)
        return replacerFn(match, result.groups || {});
    }).filter((value) => value !== void 0);
  };
}, staticRedirectsMatcher = (configuration, host, pathname) => {
  let withHostMatch = configuration.redirects.staticRules[`https://${host}${pathname}`], withoutHostMatch = configuration.redirects.staticRules[pathname];
  return withHostMatch && withoutHostMatch ? withHostMatch.lineNumber < withoutHostMatch.lineNumber ? withHostMatch : withoutHostMatch : withHostMatch || withoutHostMatch;
}, generateRedirectsMatcher = (configuration) => generateRulesMatcher(
  configuration.redirects.version === REDIRECTS_VERSION ? configuration.redirects.rules : {},
  ({ status, to }, replacements) => {
    let target = replacer(to, replacements).trim();
    return /^(\w+:\/\/)/.test(target) ? {
      status,
      to: target
    } : {
      status,
      to: target.replace(/\/+/g, "/")
    };
  }
);

// ../workers-shared/asset-worker/src/utils/headers.ts
function getAssetHeaders({ eTag, resolver }, contentType, cacheStatus, request, configuration) {
  let headers = new Headers({
    ETag: `"${eTag}"`
  });
  return contentType !== void 0 && headers.append("Content-Type", contentType), isCacheable(request) && headers.append("Cache-Control", CACHE_CONTROL_BROWSER), headers.append("CF-Cache-Status", cacheStatus), configuration.debug && resolver === "not-found" && flagIsEnabled(
    configuration,
    SEC_FETCH_MODE_NAVIGATE_HEADER_PREFERS_ASSET_SERVING
  ) && headers.append(
    "X-Mf-Additional-Response-Log",
    "`Sec-Fetch-Mode: navigate` header present - using `not_found_handling` behavior"
  ), headers;
}
function isCacheable(request) {
  return !request.headers.has("Authorization") && !request.headers.has("Range");
}
function attachCustomHeaders(request, response, configuration, env) {
  return (env.JAEGER ?? mockJaegerBinding()).enterSpan("add_headers", (span) => {
    let matches = generateRulesMatcher(
      configuration.headers?.version === HEADERS_VERSION ? configuration.headers.rules : {},
      ({ set = {}, unset = [] }, replacements) => {
        let replacedSet = {};
        return Object.entries(set).forEach(([key, value]) => {
          replacedSet[key] = replacer(value, replacements);
        }), {
          set: replacedSet,
          unset
        };
      }
    )({ request }), setMap = /* @__PURE__ */ new Set();
    return matches.forEach(({ set = {}, unset = [] }) => {
      unset.forEach((key) => {
        response.headers.delete(key), span.addLogs({ remove_header: key });
      }), Object.entries(set).forEach(([key, value]) => {
        setMap.has(key.toLowerCase()) ? (response.headers.append(key, value), span.addLogs({ append_header: key })) : (response.headers.set(key, value), setMap.add(key.toLowerCase()), span.addLogs({ add_header: key }));
      });
    }), response;
  });
}

// ../workers-shared/asset-worker/src/handler.ts
var REDIRECTS_VERSION = 1, HEADERS_VERSION = 2, getResponseOrAssetIntent = async (request, env, configuration, exists, originalDecodedPathname, analytics) => {
  let url = new URL(request.url), { search } = url, base = configuration.base_path, redirectResult = handleRedirects(
    env,
    request,
    configuration,
    url.host,
    url.pathname,
    search
  );
  if (redirectResult instanceof Response)
    return analytics?.setData({ servedBy: "redirect" }), redirectResult;
  let { proxied, pathname } = redirectResult, effectiveDecodedPathname = proxied ? decodePath(pathname) : originalDecodedPathname, { inPrefix, assetPath } = stripBasePath(effectiveDecodedPathname, base);
  if (!inPrefix)
    return noIntent(
      env,
      analytics,
      configuration,
      effectiveDecodedPathname,
      proxied
    );
  let intent = (proxied ? null : await getBaseRootIntent(
    effectiveDecodedPathname,
    base,
    request,
    configuration,
    exists
  )) ?? await getIntent(assetPath, request, configuration, exists);
  if (!intent)
    return noIntent(
      env,
      analytics,
      configuration,
      effectiveDecodedPathname,
      proxied
    );
  let method = request.method.toUpperCase();
  if (!["GET", "HEAD"].includes(method))
    return analytics?.setData({ servedBy: "method-not-allowed" }), env.JAEGER.enterSpan("method_not_allowed", (span) => (span.setTags({
      method,
      status: MethodNotAllowedResponse.status
    }), new MethodNotAllowedResponse()));
  let decodedDestination = intent.redirect !== null ? addBasePath(intent.redirect, base) : effectiveDecodedPathname, encodedDestination = encodePath(decodedDestination);
  return encodedDestination !== pathname && intent.asset || intent.redirect !== null ? (analytics?.setData({ servedBy: "redirect" }), env.JAEGER.enterSpan("redirect", (span) => (span.setTags({
    originalPath: pathname,
    location: encodedDestination !== pathname ? encodedDestination : intent.redirect ?? "<unknown>",
    status: TemporaryRedirectResponse.status
  }), new TemporaryRedirectResponse(encodedDestination + search)))) : intent.asset ? { ...intent.asset, resolver: intent.resolver } : (analytics?.setData({ servedBy: "error" }), env.JAEGER.enterSpan("unknown_action", (span) => (span.setTags({
    pathname,
    status: InternalServerErrorResponse.status
  }), new InternalServerErrorResponse(new Error("Unknown action")))));
};
function noIntent(env, analytics, configuration, decodedPathname, proxied, claimProxiedRequest = !0) {
  let response = proxied && claimProxiedRequest ? new NotFoundResponse() : new NoIntentResponse();
  return analytics?.setData({ servedBy: "none" }), env.JAEGER.enterSpan("no_intent", (span) => (span.setTags({
    decodedPathname,
    configuration: JSON.stringify(configuration),
    proxied,
    status: response.status
  }), response));
}
var resolveAssetIntentToResponse = async (assetIntent, request, env, configuration, getByETag, analytics) => {
  let { pathname } = new URL(request.url), method = request.method.toUpperCase(), asset = await env.JAEGER.enterSpan("getByETag", async (span) => (span.setTags({
    pathname,
    eTag: assetIntent.eTag,
    status: assetIntent.status
  }), await getByETag(assetIntent.eTag, request))), headers = getAssetHeaders(
    assetIntent,
    asset.contentType,
    asset.cacheStatus,
    request,
    configuration
  );
  analytics.setData({ cacheStatus: asset.cacheStatus });
  let strongETag = `"${assetIntent.eTag}"`, weakETag = `W/${strongETag}`, ifNoneMatch = request.headers.get("If-None-Match") || "";
  return [weakETag, strongETag].includes(ifNoneMatch) ? (analytics.setData({ servedBy: "not-modified" }), env.JAEGER.enterSpan("matched_etag", (span) => (span.setTags({
    matchedEtag: ifNoneMatch,
    status: NotModifiedResponse.status
  }), new NotModifiedResponse(null, { headers })))) : (analytics.setData({
    servedBy: servedByForResolver(assetIntent.resolver, configuration)
  }), env.JAEGER.enterSpan("response", (span) => {
    span.setTags({
      etag: assetIntent.eTag,
      status: assetIntent.status,
      head: method === "HEAD"
    });
    let body = method === "HEAD" ? null : asset.readableStream;
    switch (assetIntent.status) {
      case NotFoundResponse.status:
        return new NotFoundResponse(body, { headers });
      case OkResponse.status:
        return new OkResponse(body, { headers });
    }
  }));
};
function getRequestBasePath(request, base) {
  let decodedPathname = decodePath(new URL(request.url).pathname);
  return {
    decodedPathname,
    ...stripBasePath(decodedPathname, base)
  };
}
var canFetch = async (request, env, configuration, exists) => {
  let requestPath = getRequestBasePath(request, configuration.base_path);
  return !(!requestPath.inPrefix || (configuration.has_static_routing || flagIsEnabled(
    configuration,
    SEC_FETCH_MODE_NAVIGATE_HEADER_PREFERS_ASSET_SERVING
  ) && request.headers.get("Sec-Fetch-Mode") === "navigate" || (configuration = {
    ...configuration,
    not_found_handling: "none"
  }), await getResponseOrAssetIntent(
    request,
    env,
    configuration,
    exists,
    requestPath.decodedPathname
  ) instanceof NoIntentResponse));
}, handleRequest = async (request, env, configuration, exists, getByETag, analytics) => {
  let requestPath = getRequestBasePath(request, configuration.base_path);
  if (!requestPath.inPrefix)
    return noIntent(
      env,
      analytics,
      configuration,
      requestPath.decodedPathname,
      !1
    );
  let responseOrAssetIntent = await getResponseOrAssetIntent(
    request,
    env,
    configuration,
    exists,
    requestPath.decodedPathname,
    analytics
  ), response = responseOrAssetIntent instanceof Response ? responseOrAssetIntent : await resolveAssetIntentToResponse(
    responseOrAssetIntent,
    request,
    env,
    configuration,
    getByETag,
    analytics
  );
  return attachCustomHeaders(request, response, configuration, env);
};
function servedByForResolver(resolver, configuration) {
  if (resolver === "html-handling")
    return "asset";
  switch (configuration.not_found_handling) {
    case "single-page-application":
      return "spa";
    case "404-page":
      return "404-page";
    case "none":
      return "none";
    default:
      return configuration.not_found_handling, "error";
  }
}
var getIntent = async (pathname, request, configuration, exists, skipRedirects = !1) => {
  switch (configuration.html_handling) {
    case "auto-trailing-slash":
      return htmlHandlingAutoTrailingSlash(
        pathname,
        request,
        configuration,
        exists,
        skipRedirects
      );
    case "force-trailing-slash":
      return htmlHandlingForceTrailingSlash(
        pathname,
        request,
        configuration,
        exists,
        skipRedirects
      );
    case "drop-trailing-slash":
      return htmlHandlingDropTrailingSlash(
        pathname,
        request,
        configuration,
        exists,
        skipRedirects
      );
    case "none":
      return htmlHandlingNone(pathname, request, configuration, exists);
  }
};
async function getBaseRootIntent(publicDecodedPath, base, request, configuration, exists) {
  let pathname;
  switch (configuration.html_handling) {
    case "force-trailing-slash":
    case "auto-trailing-slash":
      pathname = base !== "/" && publicDecodedPath === base.slice(0, -1) ? "/" : null;
      break;
    case "drop-trailing-slash":
      pathname = base !== "/" && publicDecodedPath === base ? "" : null;
      break;
    case "none":
      return null;
  }
  return pathname === null || !await exists("/index.html", request) ? null : {
    asset: null,
    redirect: pathname,
    resolver: "html-handling"
  };
}
var htmlHandlingAutoTrailingSlash = async (pathname, request, configuration, exists, skipRedirects) => {
  let redirectResult = null, eTagResult = null, exactETag = await exists(pathname, request);
  if (pathname.endsWith("/index")) {
    if (exactETag)
      return {
        asset: {
          eTag: exactETag,
          status: OkResponse.status
        },
        redirect: null,
        resolver: "html-handling"
      };
    if (redirectResult = await safeRedirect(
      `${pathname}.html`,
      request,
      pathname.slice(0, -5),
      configuration,
      exists,
      skipRedirects,
      "html-handling"
    ))
      return redirectResult;
    if (redirectResult = await safeRedirect(
      `${pathname.slice(0, -6)}.html`,
      request,
      pathname.slice(0, -6),
      configuration,
      exists,
      skipRedirects,
      "html-handling"
    ))
      return redirectResult;
  } else if (pathname.endsWith("/index.html")) {
    if (redirectResult = await safeRedirect(
      pathname,
      request,
      pathname.slice(0, -10),
      configuration,
      exists,
      skipRedirects,
      "html-handling"
    ))
      return redirectResult;
    if (redirectResult = await safeRedirect(
      `${pathname.slice(0, -11)}.html`,
      request,
      pathname.slice(0, -11),
      configuration,
      exists,
      skipRedirects,
      "html-handling"
    ))
      return redirectResult;
  } else if (pathname.endsWith("/")) {
    if (eTagResult = await exists(`${pathname}index.html`, request))
      return {
        asset: { eTag: eTagResult, status: OkResponse.status },
        redirect: null,
        resolver: "html-handling"
      };
    if (redirectResult = await safeRedirect(
      `${pathname.slice(0, -1)}.html`,
      request,
      pathname.slice(0, -1),
      configuration,
      exists,
      skipRedirects,
      "html-handling"
    ))
      return redirectResult;
  } else if (pathname.endsWith(".html")) {
    if (redirectResult = await safeRedirect(
      pathname,
      request,
      pathname.slice(0, -5),
      configuration,
      exists,
      skipRedirects,
      "html-handling"
    ))
      return redirectResult;
    if (redirectResult = await safeRedirect(
      `${pathname.slice(0, -5)}/index.html`,
      request,
      `${pathname.slice(0, -5)}/`,
      configuration,
      exists,
      skipRedirects,
      "html-handling"
    ))
      return redirectResult;
  }
  return exactETag ? {
    asset: { eTag: exactETag, status: OkResponse.status },
    redirect: null,
    resolver: "html-handling"
  } : (eTagResult = await exists(`${pathname}.html`, request)) ? {
    asset: { eTag: eTagResult, status: OkResponse.status },
    redirect: null,
    resolver: "html-handling"
  } : (redirectResult = await safeRedirect(
    `${pathname}/index.html`,
    request,
    `${pathname}/`,
    configuration,
    exists,
    skipRedirects,
    "html-handling"
  )) ? redirectResult : notFound(pathname, request, configuration, exists);
}, htmlHandlingForceTrailingSlash = async (pathname, request, configuration, exists, skipRedirects) => {
  let redirectResult = null, eTagResult = null, exactETag = await exists(pathname, request);
  if (pathname.endsWith("/index")) {
    if (exactETag)
      return {
        asset: { eTag: exactETag, status: OkResponse.status },
        redirect: null,
        resolver: "html-handling"
      };
    if (redirectResult = await safeRedirect(
      `${pathname}.html`,
      request,
      pathname.slice(0, -5),
      configuration,
      exists,
      skipRedirects,
      "html-handling"
    ))
      return redirectResult;
    if (redirectResult = await safeRedirect(
      `${pathname.slice(0, -6)}.html`,
      request,
      pathname.slice(0, -5),
      configuration,
      exists,
      skipRedirects,
      "html-handling"
    ))
      return redirectResult;
  } else if (pathname.endsWith("/index.html")) {
    if (redirectResult = await safeRedirect(
      pathname,
      request,
      pathname.slice(0, -10),
      configuration,
      exists,
      skipRedirects,
      "html-handling"
    ))
      return redirectResult;
    if (redirectResult = await safeRedirect(
      `${pathname.slice(0, -11)}.html`,
      request,
      pathname.slice(0, -10),
      configuration,
      exists,
      skipRedirects,
      "html-handling"
    ))
      return redirectResult;
  } else if (pathname.endsWith("/")) {
    if (eTagResult = await exists(`${pathname}index.html`, request))
      return {
        asset: { eTag: eTagResult, status: OkResponse.status },
        redirect: null,
        resolver: "html-handling"
      };
    if (eTagResult = await exists(
      `${pathname.slice(0, -1)}.html`,
      request
    ))
      return {
        asset: { eTag: eTagResult, status: OkResponse.status },
        redirect: null,
        resolver: "html-handling"
      };
  } else if (pathname.endsWith(".html")) {
    if (redirectResult = await safeRedirect(
      pathname,
      request,
      `${pathname.slice(0, -5)}/`,
      configuration,
      exists,
      skipRedirects,
      "html-handling"
    ))
      return redirectResult;
    if (exactETag)
      return {
        asset: { eTag: exactETag, status: OkResponse.status },
        redirect: null,
        resolver: "html-handling"
      };
    if (redirectResult = await safeRedirect(
      `${pathname.slice(0, -5)}/index.html`,
      request,
      `${pathname.slice(0, -5)}/`,
      configuration,
      exists,
      skipRedirects,
      "html-handling"
    ))
      return redirectResult;
  }
  return exactETag ? {
    asset: { eTag: exactETag, status: OkResponse.status },
    redirect: null,
    resolver: "html-handling"
  } : (redirectResult = await safeRedirect(
    `${pathname}.html`,
    request,
    `${pathname}/`,
    configuration,
    exists,
    skipRedirects,
    "html-handling"
  )) || (redirectResult = await safeRedirect(
    `${pathname}/index.html`,
    request,
    `${pathname}/`,
    configuration,
    exists,
    skipRedirects,
    "html-handling"
  )) ? redirectResult : notFound(pathname, request, configuration, exists);
}, htmlHandlingDropTrailingSlash = async (pathname, request, configuration, exists, skipRedirects) => {
  let redirectResult = null, eTagResult = null, exactETag = await exists(pathname, request);
  if (pathname.endsWith("/index")) {
    if (exactETag)
      return {
        asset: { eTag: exactETag, status: OkResponse.status },
        redirect: null,
        resolver: "html-handling"
      };
    if (pathname === "/index") {
      if (redirectResult = await safeRedirect(
        "/index.html",
        request,
        "/",
        configuration,
        exists,
        skipRedirects,
        "html-handling"
      ))
        return redirectResult;
    } else {
      if (redirectResult = await safeRedirect(
        `${pathname.slice(0, -6)}.html`,
        request,
        pathname.slice(0, -6),
        configuration,
        exists,
        skipRedirects,
        "html-handling"
      ))
        return redirectResult;
      if (redirectResult = await safeRedirect(
        `${pathname}.html`,
        request,
        pathname.slice(0, -6),
        configuration,
        exists,
        skipRedirects,
        "html-handling"
      ))
        return redirectResult;
    }
  } else if (pathname.endsWith("/index.html"))
    if (pathname === "/index.html") {
      if (redirectResult = await safeRedirect(
        "/index.html",
        request,
        "/",
        configuration,
        exists,
        skipRedirects,
        "html-handling"
      ))
        return redirectResult;
    } else {
      if (redirectResult = await safeRedirect(
        pathname,
        request,
        pathname.slice(0, -11),
        configuration,
        exists,
        skipRedirects,
        "html-handling"
      ))
        return redirectResult;
      if (exactETag)
        return {
          asset: { eTag: exactETag, status: OkResponse.status },
          redirect: null,
          resolver: "html-handling"
        };
      if (redirectResult = await safeRedirect(
        `${pathname.slice(0, -11)}.html`,
        request,
        pathname.slice(0, -11),
        configuration,
        exists,
        skipRedirects,
        "html-handling"
      ))
        return redirectResult;
    }
  else if (pathname.endsWith("/"))
    if (pathname === "/") {
      if (eTagResult = await exists("/index.html", request))
        return {
          asset: { eTag: eTagResult, status: OkResponse.status },
          redirect: null,
          resolver: "html-handling"
        };
    } else {
      if (redirectResult = await safeRedirect(
        `${pathname.slice(0, -1)}.html`,
        request,
        pathname.slice(0, -1),
        configuration,
        exists,
        skipRedirects,
        "html-handling"
      ))
        return redirectResult;
      if (redirectResult = await safeRedirect(
        `${pathname.slice(0, -1)}/index.html`,
        request,
        pathname.slice(0, -1),
        configuration,
        exists,
        skipRedirects,
        "html-handling"
      ))
        return redirectResult;
    }
  else if (pathname.endsWith(".html")) {
    if (redirectResult = await safeRedirect(
      pathname,
      request,
      pathname.slice(0, -5),
      configuration,
      exists,
      skipRedirects,
      "html-handling"
    ))
      return redirectResult;
    if (redirectResult = await safeRedirect(
      `${pathname.slice(0, -5)}/index.html`,
      request,
      pathname.slice(0, -5),
      configuration,
      exists,
      skipRedirects,
      "html-handling"
    ))
      return redirectResult;
  }
  return exactETag ? {
    asset: { eTag: exactETag, status: OkResponse.status },
    redirect: null,
    resolver: "html-handling"
  } : (eTagResult = await exists(`${pathname}.html`, request)) ? {
    asset: { eTag: eTagResult, status: OkResponse.status },
    redirect: null,
    resolver: "html-handling"
  } : (eTagResult = await exists(`${pathname}/index.html`, request)) ? {
    asset: { eTag: eTagResult, status: OkResponse.status },
    redirect: null,
    resolver: "html-handling"
  } : notFound(pathname, request, configuration, exists);
}, htmlHandlingNone = async (pathname, request, configuration, exists) => {
  let exactETag = await exists(pathname, request);
  return exactETag ? {
    asset: { eTag: exactETag, status: OkResponse.status },
    redirect: null,
    resolver: "html-handling"
  } : notFound(pathname, request, configuration, exists);
}, notFound = async (pathname, request, configuration, exists) => {
  switch (configuration.not_found_handling) {
    case "single-page-application": {
      let eTag = await exists("/index.html", request);
      return eTag ? {
        asset: { eTag, status: OkResponse.status },
        redirect: null,
        resolver: "not-found"
      } : null;
    }
    case "404-page": {
      let cwd = pathname;
      for (; cwd; ) {
        cwd = cwd.slice(0, cwd.lastIndexOf("/"));
        let eTag = await exists(`${cwd}/404.html`, request);
        if (eTag)
          return {
            asset: { eTag, status: NotFoundResponse.status },
            redirect: null,
            resolver: "not-found"
          };
      }
      return null;
    }
    default:
      return null;
  }
}, safeRedirect = async (file, request, destination, configuration, exists, skip, resolver) => {
  if (skip)
    return null;
  if (!await exists(destination, request)) {
    let intent = await getIntent(
      destination,
      request,
      configuration,
      exists,
      !0
    );
    if (intent?.asset && intent.asset.eTag === await exists(file, request))
      return {
        asset: null,
        redirect: destination,
        resolver
      };
  }
  return null;
}, decodePath = (pathname) => pathname.split("/").map((x) => {
  try {
    return decodeURIComponent(x);
  } catch {
    return x;
  }
}).join("/").replace(/\/+/g, "/"), encodePath = (pathname) => pathname.split("/").map((x) => {
  try {
    return encodeURIComponent(x);
  } catch {
    return x;
  }
}).join("/"), handleRedirects = (env, request, configuration, host, pathname, search) => (env.JAEGER ?? mockJaegerBinding()).enterSpan("handle_redirects", (span) => {
  let redirectMatch = staticRedirectsMatcher(configuration, host, pathname) || generateRedirectsMatcher(configuration)({ request })[0], proxied = !1;
  if (redirectMatch)
    if (redirectMatch.status === 200)
      pathname = new URL(redirectMatch.to, request.url).pathname, proxied = !0, span.setTags({
        matched: !0,
        proxied: !0,
        new_path: pathname,
        status: redirectMatch.status
      });
    else {
      let { status, to } = redirectMatch, destination = new URL(to, request.url), location = destination.origin === new URL(request.url).origin ? `${destination.pathname}${destination.search || search}${destination.hash}` : `${destination.href.slice(0, destination.href.length - (destination.search.length + destination.hash.length))}${destination.search ? destination.search : search}${destination.hash}`;
      switch (span.setTags({
        matched: !0,
        destination: location,
        status
      }), status) {
        case MovedPermanentlyResponse.status:
          return new MovedPermanentlyResponse(location);
        case SeeOtherResponse.status:
          return new SeeOtherResponse(location);
        case TemporaryRedirectResponse.status:
          return new TemporaryRedirectResponse(location);
        case PermanentRedirectResponse.status:
          return new PermanentRedirectResponse(location);
        case FoundResponse.status:
        default:
          return new FoundResponse(location);
      }
    }
  else
    span.setTags({
      matched: !1
    });
  return { proxied, pathname };
});

// ../workers-shared/asset-worker/src/utils/final-operations.ts
function handleError(sentry, analytics, err) {
  try {
    let response = new InternalServerErrorResponse(err);
    return sentry && sentry.captureException(err), analytics.setData({ servedBy: "error" }), err instanceof Error && analytics.setData({ error: err.message }), response;
  } catch (e) {
    return console.error("Error handling error", e), new InternalServerErrorResponse(e);
  }
}
function submitMetrics(analytics, performance, startTimeMs) {
  try {
    analytics.setData({ requestTime: performance.now() - startTimeMs }), analytics.write();
  } catch (e) {
    console.error("Error submitting metrics", e);
  }
}

// ../workers-shared/asset-worker/src/utils/kv.ts
async function getAssetWithMetadataFromKV(assetsKVNamespace, assetKey, sentry, retries = 3) {
  let attempts = 0;
  for (; attempts <= retries; )
    try {
      let asset = await assetsKVNamespace.getWithMetadata(
        assetKey,
        {
          type: "stream",
          cacheTtl: 31536e3
          // 1 year
        }
      );
      if (asset.value === null) {
        let retriedAsset = await assetsKVNamespace.getWithMetadata(assetKey, {
          type: "stream",
          cacheTtl: 60
          // Minimum value allowed
        });
        return retriedAsset.value !== null && sentry && sentry.captureException(
          new Error(
            `Initial request for asset ${assetKey} failed, but subsequent request succeeded.`
          )
        ), retriedAsset;
      }
      return asset;
    } catch (err) {
      if (attempts >= retries) {
        let message = `KV GET ${assetKey} failed.`;
        throw err instanceof Error && (message = `KV GET ${assetKey} failed: ${err.message}`), new Error(message);
      }
      await new Promise(
        (resolvePromise) => setTimeout(resolvePromise, Math.pow(2, attempts++) * 1e3)
      );
    }
}

// ../workers-shared/asset-worker/src/worker.ts
async function unstableExistsImpl(env, pathname, _request) {
  let analytics = new ExperimentAnalytics(env.EXPERIMENT_ANALYTICS), performance = new PerformanceTimer(env.UNSAFE_PERFORMANCE);
  return (env.JAEGER ?? mockJaegerBinding()).enterSpan("unstable_exists", async (span) => {
    env.COLO_METADATA && env.VERSION_METADATA && env.CONFIG && analytics.setData({
      accountId: env.CONFIG.account_id,
      experimentName: "manifest-read-timing"
    });
    let startTimeMs = performance.now();
    try {
      let eTag = await new AssetsManifest(env.ASSETS_MANIFEST).get(pathname);
      return span.setTags({
        path: pathname,
        found: eTag !== null,
        etag: eTag ?? ""
      }), eTag;
    } finally {
      analytics.setData({
        manifestReadTime: performance.now() - startTimeMs
      }), analytics.write();
    }
  });
}
async function unstableGetByETagImpl(env, eTag, _request) {
  let performance = new PerformanceTimer(env.UNSAFE_PERFORMANCE);
  return (env.JAEGER ?? mockJaegerBinding()).enterSpan("unstable_getByETag", async (span) => {
    let startTime = performance.now(), asset = await getAssetWithMetadataFromKV(
      env.ASSETS_KV_NAMESPACE,
      eTag
    ), assetFetchTime = performance.now() - startTime;
    if (!asset || !asset.value)
      throw span.setTags({
        error: !0
      }), span.addLogs({
        error: `Requested asset ${eTag} exists in the asset manifest but not in the KV namespace.`
      }), new Error(
        `Requested asset ${eTag} exists in the asset manifest but not in the KV namespace.`
      );
    let cacheStatus = assetFetchTime <= 100 ? "HIT" : "MISS";
    return span.setTags({
      etag: eTag,
      contentType: asset.metadata?.contentType ?? "unknown",
      cacheStatus
    }), {
      readableStream: asset.value,
      contentType: asset.metadata?.contentType,
      cacheStatus
    };
  });
}
async function unstableGetByPathnameImpl(env, exists, getByETag, pathname, request) {
  return (env.JAEGER ?? mockJaegerBinding()).enterSpan("unstable_getByPathname", async (span) => {
    let eTag = await exists(pathname, request);
    return span.setTags({
      path: pathname,
      found: eTag !== null
    }), eTag ? getByETag(eTag, request) : null;
  });
}
async function runFetchRequest(request, env, ctx, exists, getByETag, cohort) {
  let sentry, analytics = new Analytics(env.ANALYTICS), performance = new PerformanceTimer(env.UNSAFE_PERFORMANCE), startTimeMs = performance.now();
  try {
    env.JAEGER ??= mockJaegerBinding(), sentry = (env.SENTRY_DSN, env.SENTRY_ACCESS_CLIENT_ID, env.SENTRY_ACCESS_CLIENT_SECRET, env.COLO_METADATA, env.VERSION_METADATA, env.CONFIG?.account_id, env.CONFIG?.script_id, void 0);
    let config = normalizeConfiguration(env.CONFIG);
    sentry?.setContext("compatibilityOptions", {
      compatibilityDate: config.compatibility_date,
      compatibilityFlags: config.compatibility_flags,
      originalCompatibilityFlags: env.CONFIG.compatibility_flags
    });
    let userAgent = request.headers.get("user-agent") ?? "UA UNKNOWN", url = new URL(request.url);
    return env.COLO_METADATA && env.VERSION_METADATA && env.CONFIG && analytics.setData({
      accountId: env.CONFIG.account_id,
      scriptId: env.CONFIG.script_id,
      coloId: env.COLO_METADATA.coloId,
      metalId: env.COLO_METADATA.metalId,
      coloTier: env.COLO_METADATA.coloTier,
      coloRegion: env.COLO_METADATA.coloRegion,
      version: env.VERSION_METADATA.tag,
      hostname: url.hostname,
      htmlHandling: config.html_handling,
      notFoundHandling: config.not_found_handling,
      compatibilityFlags: config.compatibility_flags,
      userAgent,
      entrypoint: 1 /* Inner */,
      cohort: cohort ?? "unknown",
      requestKind: getRequestKind(request)
    }), await env.JAEGER.enterSpan("handleRequest", async (span) => {
      span.setTags({
        hostname: url.hostname,
        eyeballPath: url.pathname,
        env: env.ENVIRONMENT,
        version: env.VERSION_METADATA?.id
      });
      let response = await handleRequest(
        request,
        env,
        config,
        exists,
        getByETag,
        analytics
      );
      return analytics.setData({ status: response.status }), response;
    });
  } catch (err) {
    return handleError(sentry, analytics, err);
  } finally {
    submitMetrics(analytics, performance, startTimeMs);
  }
}
var AssetWorkerOuter = class extends WorkerEntrypoint {
  constructor() {
    super(...arguments);
    this.resolvedCohort = void 0;
  }
  /**
   * Resolves and caches the cohort for this request. The cohort is
   * constant for the lifetime of the outer entrypoint instance, so
   * we only pay the RPC cost once even if multiple methods are called.
   */
  async getCohort() {
    return this.resolvedCohort === void 0 && (this.resolvedCohort = "ent"), this.resolvedCohort;
  }
  /**
   * Gets the inner entrypoint from ctx.exports to forward requests to.
   * When a cohort is provided, the runtime routes the inner entrypoint
   * to the version assigned to that cohort in the current deployment.
   */
  getInnerEntrypoint(_cohort) {
    let entrypoint = this.ctx.exports?.AssetWorkerInner;
    if (entrypoint === void 0)
      throw new Error(
        "AssetWorkerInner not found on ctx.exports. Ensure enable_ctx_exports compatibility flag is set and AssetWorkerInner is exported from the worker module."
      );
    return entrypoint({
      props: { traceContext: this.env.JAEGER.getSpanContext() }
      // TODO: Hardcoding temporarily for latency testing.
      // ...(cohort ? { version: { cohort } } : {}),
    });
  }
  async fetch(request) {
    this.env.JAEGER ??= mockJaegerBinding();
    let sentry, analytics = new Analytics(this.env.ANALYTICS), performance = new PerformanceTimer(this.env.UNSAFE_PERFORMANCE), startTimeMs = performance.now();
    try {
      if (this.env.COLO_METADATA && this.env.VERSION_METADATA && this.env.CONFIG) {
        let url = new URL(request.url);
        analytics.setData({
          accountId: this.env.CONFIG.account_id,
          scriptId: this.env.CONFIG.script_id,
          coloId: this.env.COLO_METADATA.coloId,
          metalId: this.env.COLO_METADATA.metalId,
          coloTier: this.env.COLO_METADATA.coloTier,
          coloRegion: this.env.COLO_METADATA.coloRegion,
          hostname: url.hostname,
          version: this.env.VERSION_METADATA.tag,
          entrypoint: 0 /* Outer */,
          requestKind: getRequestKind(request)
        });
      }
      sentry = (this.ctx, this.env.SENTRY_DSN, this.env.SENTRY_ACCESS_CLIENT_ID, this.env.SENTRY_ACCESS_CLIENT_SECRET, this.env.COLO_METADATA, this.env.VERSION_METADATA, this.env.CONFIG?.account_id, this.env.CONFIG?.script_id, void 0);
      let cohort = await this.getCohort();
      analytics.setData({ cohort: cohort ?? "unknown" });
      let response = await this.getInnerEntrypoint(cohort).fetch(request);
      return analytics.setData({ status: response.status }), response.status >= 500 && analytics.setData({
        error: "inner entrypoint error",
        servedBy: "error"
      }), response;
    } catch (err) {
      return analytics.setData({ status: 500 }), handleError(sentry, analytics, err);
    } finally {
      submitMetrics(analytics, performance, startTimeMs);
    }
  }
  async unstable_canFetch(request) {
    this.env.JAEGER ??= mockJaegerBinding();
    let cohort = await this.getCohort();
    return this.getInnerEntrypoint(cohort).unstable_canFetch(request);
  }
  async unstable_getByETag(eTag, request) {
    this.env.JAEGER ??= mockJaegerBinding();
    let cohort = await this.getCohort();
    return this.getInnerEntrypoint(cohort).unstable_getByETag(eTag, request);
  }
  async unstable_getByPathname(pathname, request) {
    this.env.JAEGER ??= mockJaegerBinding();
    let cohort = await this.getCohort();
    return this.getInnerEntrypoint(cohort).unstable_getByPathname(
      pathname,
      request
    );
  }
  async unstable_exists(pathname, request) {
    this.env.JAEGER ??= mockJaegerBinding();
    let cohort = await this.getCohort();
    return this.getInnerEntrypoint(cohort).unstable_exists(pathname, request);
  }
}, AssetWorkerInner = class extends WorkerEntrypoint {
  async fetch(request) {
    this.env.JAEGER ??= mockJaegerBinding();
    let traceContext = this.ctx.props?.traceContext ?? null, cohort = this.ctx.version?.cohort, runRequest = () => runFetchRequest(
      request,
      this.env,
      this.ctx,
      this.unstable_exists.bind(this),
      this.unstable_getByETag.bind(this),
      cohort
    ), response = traceContext ? await this.env.JAEGER.runWithSpanContext(traceContext, runRequest) : await runRequest();
    if (response instanceof Response)
      return response;
    throw new Error("AssetWorkerInner fetch returned non-Response value.");
  }
  async unstable_canFetch(request) {
    return this.env.JAEGER ??= mockJaegerBinding(), canFetch(
      request,
      this.env,
      normalizeConfiguration(this.env.CONFIG),
      this.unstable_exists.bind(this)
    );
  }
  async unstable_getByETag(eTag, request) {
    return unstableGetByETagImpl(this.env, eTag, request);
  }
  async unstable_getByPathname(pathname, request) {
    return unstableGetByPathnameImpl(
      this.env,
      this.unstable_exists.bind(this),
      this.unstable_getByETag.bind(this),
      pathname,
      request
    );
  }
  async unstable_exists(pathname, request) {
    return unstableExistsImpl(this.env, pathname, request);
  }
}, worker_default = AssetWorkerInner;
export {
  AssetWorkerInner,
  AssetWorkerOuter,
  worker_default as default
};
