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
