/**
 * Get file name from url
 *
 */

export function getFileName(url: string): string {
  let name: string;
  try {
    name = decodeURIComponent(url.split('.').reverse()[1].split('/').reverse()[0]);
  } catch (error) {
    name = url;
  }

  return name;
}

/*
 * Modify headers before request sent
 *
 */

export function initBeforeSendHeaders(): void {

  function listener(details: chrome.webRequest.WebRequestHeadersDetails): { requestHeaders: chrome.webRequest.HttpHeader[]; } {
    const newRef = 'http://joyreactor.cc/';
    let hasRef = false;

    for (var n in details.requestHeaders) {
      hasRef = details.requestHeaders[n].name == 'Referer';
      if (hasRef) {
        details.requestHeaders[n].value = newRef;
        break;
      }
    }

    if (!hasRef) {
      details.requestHeaders.push({ name: 'Referer', value: newRef });
    }

    return { requestHeaders: details.requestHeaders };
  };

  if (chrome.webRequest.onBeforeSendHeaders.hasListener(listener)) { return; }

  chrome
    .webRequest
    .onBeforeSendHeaders
    .addListener(
      listener,
      {
        urls: [
          '*://*.joyreactor.cc/*',
          '*://*.pornreactor.cc/*',
        ],
      },
      ['blocking', 'requestHeaders', 'extraHeaders'],
    );
}
