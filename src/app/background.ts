// Types
import {
  Message,
  ProgressMessage,
} from "./core/types/misc";

/*
 * Handle progress message
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
 * Main function
 *
 */

function initDownloader(): void {
  chrome
    .runtime
    .onMessage
    .addListener((message: Message, sender) => {
      if (sender.id !== chrome.runtime.id) { return; }

      switch(message.type) {
        case 'progress': {
          progressHandler((message.payload as ProgressMessage).progress);
          break;
        }
      }
    });
}

initDownloader();
