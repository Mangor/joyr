import '../core/lib/material.min.js';

function saveOption({ name, value }: { name: string, value: boolean }) {
  chrome.storage.sync.get(
    {
      bf: false,
      hd: false,
      sd: false,
    },
    (options) => {
      chrome.storage.sync.set(
        {
          ...options,
          [name]: value,
        },
      );
    });
}

function restoreOptions(): void {
  chrome.storage.sync.get(
    {
      bf: false,
      hd: false,
      sd: false,
    },
    (options) => {
      Object
        .keys(options)
        .map((key: string) => {
          const checkbox = document.getElementById(`list-switch-${key}`) as HTMLInputElement;

          checkbox.checked = options[key];

          checkbox.addEventListener('change', (event: Event) => {
            const currentValue = (event.target as HTMLInputElement ).checked;

            saveOption({ name: key, value: currentValue });
          });
        });
    },
  );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
