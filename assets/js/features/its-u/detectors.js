const supportsCss = (property, value) =>
  typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports(property, value);

const supportsCssSelector = (selector) =>
  typeof CSS !== "undefined" &&
  typeof CSS.supports === "function" &&
  CSS.supports(`selector(${selector})`);

const hasWindowProperty = (property) => property in window;
const hasNavigatorProperty = (property) => property in navigator;
const hasDocumentProperty = (property) => property in document;

const hasCanvasContext = (contextType) => {
  try {
    return Boolean(document.createElement("canvas").getContext(contextType));
  } catch {
    return false;
  }
};

export const FEATURE_DETECTORS = {
  cssGrid: () => supportsCss("display", "grid"),
  cssSubgrid: () => supportsCss("grid-template-columns", "subgrid"),
  cssHas: () => supportsCssSelector(":has(*)"),
  containerQueries: () => supportsCss("container-type", "inline-size"),
  cssNesting: () => supportsCssSelector("&"),
  colorMix: () => supportsCss("color", "color-mix(in srgb, red 50%, blue)"),
  backdropFilter: () => supportsCss("backdrop-filter", "blur(1px)"),
  viewTransitions: () => hasDocumentProperty("startViewTransition"),
  popoverApi: () => typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype,
  dialogElement: () => hasWindowProperty("HTMLDialogElement"),
  webAnimations: () => typeof Element !== "undefined" && "animate" in Element.prototype,
  intersectionObserver: () => hasWindowProperty("IntersectionObserver"),
  resizeObserver: () => hasWindowProperty("ResizeObserver"),
  mutationObserver: () => hasWindowProperty("MutationObserver"),
  performanceObserver: () => hasWindowProperty("PerformanceObserver"),
  fetchApi: () => hasWindowProperty("fetch"),
  webSocket: () => hasWindowProperty("WebSocket"),
  eventSource: () => hasWindowProperty("EventSource"),
  broadcastChannel: () => hasWindowProperty("BroadcastChannel"),
  sendBeacon: () => hasNavigatorProperty("sendBeacon"),
  webTransport: () => hasWindowProperty("WebTransport"),
  webRtc: () => hasWindowProperty("RTCPeerConnection"),
  serviceWorker: () => hasNavigatorProperty("serviceWorker"),
  pushApi: () => hasWindowProperty("PushManager"),
  backgroundSync: () => hasWindowProperty("SyncManager"),
  cacheApi: () => hasWindowProperty("caches"),
  indexedDb: () => hasWindowProperty("indexedDB"),
  storageManager: () => Boolean(navigator.storage && navigator.storage.estimate),
  cookieStore: () => hasWindowProperty("cookieStore"),
  webLocks: () => hasNavigatorProperty("locks"),
  localStorage: () => hasWindowProperty("localStorage"),
  sessionStorage: () => hasWindowProperty("sessionStorage"),
  fileApi: () => hasWindowProperty("FileReader") && hasWindowProperty("Blob"),
  fileSystemAccess: () => hasWindowProperty("showOpenFilePicker"),
  clipboardApi: () => Boolean(navigator.clipboard),
  clipboardWrite: () => Boolean(navigator.clipboard && navigator.clipboard.writeText),
  clipboardRead: () => Boolean(navigator.clipboard && navigator.clipboard.readText),
  canvas2d: () => hasCanvasContext("2d"),
  offscreenCanvas: () => hasWindowProperty("OffscreenCanvas"),
  webgl: () => hasCanvasContext("webgl"),
  webgl2: () => hasCanvasContext("webgl2"),
  webgpu: () => hasNavigatorProperty("gpu"),
  webCodecs: () => hasWindowProperty("VideoEncoder") || hasWindowProperty("VideoDecoder"),
  imageBitmap: () => hasWindowProperty("createImageBitmap"),
  mediaDevices: () => Boolean(navigator.mediaDevices),
  mediaRecorder: () => hasWindowProperty("MediaRecorder"),
  audioContext: () => hasWindowProperty("AudioContext") || hasWindowProperty("webkitAudioContext"),
  pictureInPicture: () => hasDocumentProperty("pictureInPictureEnabled"),
  documentPictureInPicture: () => hasWindowProperty("documentPictureInPicture"),
  screenCapture: () => Boolean(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia),
  fullscreen: () => hasDocumentProperty("fullscreenEnabled"),
  pointerLock: () => hasDocumentProperty("pointerLockElement"),
  geolocation: () => hasNavigatorProperty("geolocation"),
  deviceOrientation: () => hasWindowProperty("DeviceOrientationEvent"),
  deviceMotion: () => hasWindowProperty("DeviceMotionEvent"),
  vibration: () => hasNavigatorProperty("vibrate"),
  gamepad: () => hasNavigatorProperty("getGamepads"),
  battery: () => hasNavigatorProperty("getBattery"),
  networkInformation: () => hasNavigatorProperty("connection"),
  wakeLock: () => hasNavigatorProperty("wakeLock"),
  bluetooth: () => hasNavigatorProperty("bluetooth"),
  webUsb: () => hasNavigatorProperty("usb"),
  webHid: () => hasNavigatorProperty("hid"),
  webSerial: () => hasNavigatorProperty("serial"),
  webNfc: () => hasWindowProperty("NDEFReader"),
  virtualKeyboard: () => hasNavigatorProperty("virtualKeyboard"),
  contactsPicker: () => Boolean(navigator.contacts && navigator.contacts.select),
  permissionsApi: () => hasNavigatorProperty("permissions"),
  credentialManagement: () => hasNavigatorProperty("credentials"),
  webAuthn: () => hasWindowProperty("PublicKeyCredential"),
  paymentRequest: () => hasWindowProperty("PaymentRequest"),
  trustedTypes: () => hasWindowProperty("trustedTypes"),
  sharedArrayBuffer: () => hasWindowProperty("SharedArrayBuffer"),
  webWorkers: () => hasWindowProperty("Worker"),
  sharedWorker: () => hasWindowProperty("SharedWorker"),
  atomics: () => hasWindowProperty("Atomics"),
  notifications: () => hasWindowProperty("Notification"),
  speechSynthesis: () => hasWindowProperty("speechSynthesis"),
  speechRecognition: () =>
    hasWindowProperty("SpeechRecognition") || hasWindowProperty("webkitSpeechRecognition"),
  eyeDropper: () => hasWindowProperty("EyeDropper"),
  idleDetection: () => hasWindowProperty("IdleDetector"),
  compressionStream: () => hasWindowProperty("CompressionStream"),
  decompressionStream: () => hasWindowProperty("DecompressionStream"),
  urlPattern: () => hasWindowProperty("URLPattern"),
  navigationApi: () => hasWindowProperty("navigation"),
  schedulerPostTask: () =>
    Boolean(window.scheduler && typeof window.scheduler.postTask === "function"),
  launchQueue: () => hasWindowProperty("launchQueue"),
  visualViewport: () => hasWindowProperty("visualViewport"),
  sanitizerApi: () => hasWindowProperty("Sanitizer"),
};

export const runDetector = (detectorName) => {
  const detector = FEATURE_DETECTORS[detectorName];
  if (typeof detector !== "function") {
    return false;
  }

  try {
    return Boolean(detector());
  } catch {
    return false;
  }
};
