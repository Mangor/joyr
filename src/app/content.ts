import cashDom from 'cash-dom';
import axios, { AxiosResponse } from 'axios';
import { saveAs } from 'file-saver';
import { getFileName } from './core/utils/utils';

// Types
type ImageUrls = { hd: string, sd: string };

/*
 * Global downloding progress
 *
 */

const globalDownloadProgressHandler = (progressEvent: ProgressEvent, index: string, progress: any, count: any): void => {
  progress[index] = progressEvent.loaded * 100 / progressEvent.total;
  const totalPercent = progress ? Object.values<number>(progress).reduce((sum: number, num: number) => sum + num, 0) : 0;
  const total = parseInt(`${Math.round(totalPercent / count)}`);

  chrome.runtime.sendMessage(chrome.runtime.id, { type: 'progress', payload: { progress: total } });
};

/*
 * Tag click event handler
 *
 */

const onClickDownload = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  const urls = cashDom(event.currentTarget as HTMLAnchorElement).parent().data();
  const fileProgress = {};

  const requests = Object.keys(urls).map((key: string) => {
    const url = urls[key];

    return axios({
      url,
      method: 'get',
      responseType: 'arraybuffer',
      onDownloadProgress: (event) => globalDownloadProgressHandler(event, key, fileProgress, Object.keys(urls).length),
    });
  });

  axios
    .all(requests)
    .then((queue: AxiosResponse<Blob>[]) => {
      queue.map((response: AxiosResponse<Blob>) => {
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const name = getFileName(response.config.url);

        saveAs(blob, name);
      });
    })
    .catch((error) => console.error(error))
    .finally(() => {
      chrome.runtime.sendMessage(chrome.runtime.id, { type: 'progress', payload: { progress: -1 } });
    });
};

/*
 * Grab images from all posts and create tags for download
 *
 */

cashDom('.postContainer')
  .each((index: number, postContainer: HTMLDivElement) => {
    const taglist = cashDom(postContainer).find('.taglist');
    const postContent = cashDom(postContainer).find('.post_content');
    let imageUrls: ImageUrls[];

    cashDom(postContent)
      .find('.image')
      .each((index: number, imageContainer: HTMLDivElement) => {
        const hd = cashDom(imageContainer).find('a').attr('href');
        const sd = cashDom(imageContainer).find('img').attr('src');

        imageUrls = [
          ...(imageUrls ? imageUrls : []),
          { hd, sd },
        ];
      });

    if (!imageUrls) { return; }

    const [hd, sd] = imageUrls
      .reduce(
        (result: [string[], string[]], element: ImageUrls) => {
          if (!!element.hd) {
            result[0].push(element['hd']);
          }
          if (!!element.sd) {
            result[1].push(element['sd']);
          }
          return result;
        },
        [[], []],
      );

    if (!!sd.length) {
      cashDom(taglist)
        .prepend(`<b class="download-sd"><a href="">SD (${sd.length}) 💾</a></b>`)
        .find('.download-sd')
        .data(sd);
    }

    if (!!hd.length) {
      cashDom(taglist)
        .prepend(`<b class="download-hd"><a href="">HD (${hd.length}) 💾</a></b>`)
        .find('.download-hd')
        .data(hd);
    }
  });


/*
 * Event handlers for new tags
 *
 */

cashDom('.download-sd').find('a').on('click', onClickDownload);
cashDom('.download-hd').find('a').on('click', onClickDownload);
