const shapes = {
  menu: '<path d="M4 8h16M4 16h16"/>',
  settings: '<path d="M3 6h6M13 6h8M3 12h10M17 12h4M3 18h3M10 18h11"/><circle cx="11" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  back: '<path d="m10 5-7 7 7 7M3 12h18"/>',
  home: '<path d="m3 11 9-8 9 8M6 9v12h12V9M10 21v-7h4v7"/>',
  character: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3"/>',
  gameplay: '<path d="m4 3 13 13-3 3L1 6zM16 14l5 5M14 21l7-7M20 3l-5 5M5 15l-4 4M3 21l6-6"/>',
  events: '<path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z"/>',
  inventory: '<path d="m12 2 9 5v10l-9 5-9-5V7ZM3 7l9 5 9-5M12 12v10"/>',
  squad: '<circle cx="12" cy="6" r="3"/><circle cx="4" cy="10" r="2"/><circle cx="20" cy="10" r="2"/><path d="M7 22v-5a5 5 0 0 1 10 0v5M1 21v-4a3 3 0 0 1 4-3M23 21v-4a3 3 0 0 0-4-3"/>',
  summon: '<path d="m12 1 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"/>',
  story: '<path d="M12 5c-3-3-7-3-10-2v16c3-1 7-1 10 2 3-3 7-3 10-2V3c-3-1-7-1-10 2ZM12 5v16"/>',
  evolution: '<path d="m12 2 7 8h-4v11H9V10H5ZM3 14v7M21 14v7"/>',
  level: '<path d="m4 16 8-12 8 12ZM4 21h16"/>',
  weapon: '<path d="m19 2 3 3-11 11-3-3ZM5 12l7 7M3 21l5-5"/>',
  overview: '<path d="m12 2 3 6 7 4-7 4-3 6-3-6-7-4 7-4ZM12 8v8M8 12h8"/>',
} as const;

export function uiIcon(name: keyof typeof shapes): string {
  return `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true" focusable="false">${shapes[name]}</svg>`;
}
