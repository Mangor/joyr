import cashDom from 'cash-dom';
import { saveAs } from 'file-saver';
import { Message, ImagesMessage } from './core/types/misc';

// Types
type ImageUrls = { hd: string, sd: string };

/*
 * Tag click event handler
 *
 */

const onClickDownload = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();

  const urls = cashDom(event.currentTarget as HTMLAnchorElement).parent().data();

  chrome.runtime.sendMessage(chrome.runtime.id, { type: 'urls', payload: { urls } } );
};

/*
 * Grab images from all posts and create tags for download
 *
 */

cashDom('.postContainer')
  .each((index: number, postContainer: HTMLDivElement) => {
    const taglist = cashDom(postContainer).find('.taglist');
    const postContent = cashDom(postContainer).find('.post_content');
    let images: ImageUrls[];

    cashDom(postContent)
      .find('.image')
      .each((index: number, imageContainer: HTMLDivElement) => {
        const hd = cashDom(imageContainer).find('a').attr('href');
        const sd = cashDom(imageContainer).find('img').attr('src');

        images = [
          ...(images ? images : []),
          { hd, sd },
        ];
      });

    if (!images) { return; }

    const [hd, sd] = images
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

    const bf = images.map(({ hd, sd }) => hd || sd);

    const union = { sd, hd, bf };

    Object
      .keys(union)
      .map((key: string, index: number) => {
        chrome.storage.sync.get(
          {
            bf: false,
            hd: false,
            sd: false,
          },
          (options) => {
            if (!!union[key].length && !!options[key]) {
              cashDom(taglist)
                .prepend(`<b class="download-${key}"><a href="">${key.toUpperCase()} (${union[key].length}) 💾</a></b>`)
                .find(`.download-${key}`)
                .data(union[key])
                .find('a')
                .on('click', onClickDownload);
            }
          },
        );
      });
  });

/*
 * Subscribe to background messages
 *
 */

chrome
  .runtime
  .onMessage
  .addListener((message: Message, sender) => {
    if (sender.id !== chrome.runtime.id) { return; }

    switch (message.type) {
      case 'queue': {
        const { images }: ImagesMessage = message.payload;

        images.map(async ({ objectUrl, name }) => {
          const blob = await fetch(objectUrl).then(response => response.blob());

          saveAs(blob, name);
        });

        break;
      }
    }
  });
