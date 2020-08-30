import axios, { AxiosResponse } from 'axios';
import { getFileName, initBeforeSendHeaders } from './core/utils/utils';

// Types
import { Message, ProgressMessage, UrlsMessage, Dictionary } from "./core/types/misc";

/*
 * Display progress
 *
 */

function progressHandler(progress: number): void {
  chrome.browserAction.setBadgeBackgroundColor({ color: '#02b373' });
  if (progress < 0) {
    chrome.browserAction.setBadgeText({ text: '' });

    return;
  }

  chrome.browserAction.setBadgeText({ text: `${progress}%` });
}

/*
 * Global downloding progress
 *
 */

const globalDownloadProgressHandler = (progressEvent: ProgressEvent, index: string, progress: any, count: any): void => {
  progress[index] = progressEvent.loaded * 100 / progressEvent.total;

  const totalPercent = progress ? Object.values<number>(progress).reduce((sum: number, num: number) => sum + num, 0) : 0;
  const total = parseInt(`${Math.round(totalPercent / count)}`);

  progressHandler(total);
};

/*
 * Handle urls message
 *
 */

function urlsHandler(urls: Dictionary): void {
  const fileProgress = {};
  const requests = Object.keys(urls).map((key: string) => {
    const url = urls[key];

    return axios({
      url,
      method: 'get',
      responseType: 'blob',
      onDownloadProgress: (event) => globalDownloadProgressHandler(event, key, fileProgress, Object.keys(urls).length),
    });
  });

  axios
    .all(requests)
    .then((queue: any) => {

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

        const images = queue.map((response: AxiosResponse<Blob>) => {
          const objectUrl = URL.createObjectURL(response.data)
          const name = getFileName(response.config.url);

          return { objectUrl, name };
        });

        chrome.tabs.sendMessage(tabs[0].id, { type: 'queue', payload: { images } });
      });
    })
    .catch(error => console.error(error))
    .finally(() => {
      progressHandler(-1);
    });
}

/*
 * Listen to content scripts messages
 *
 */

function initMessageListener(): void {
  chrome
    .runtime
    .onMessage
    .addListener((message: Message, sender: chrome.runtime.MessageSender) => {
      if (sender.id !== chrome.runtime.id) { return; }

      switch (message.type) {
        case 'progress': {
          progressHandler((message.payload as ProgressMessage).progress);

          break;
        }
        case 'urls': {
          urlsHandler((message.payload as UrlsMessage).urls);

          break;
        }
      }
    });
}

initBeforeSendHeaders();
initMessageListener();
