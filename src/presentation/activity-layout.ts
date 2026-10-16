import './activity-layout.css';

export function activityLayout(media: string, details: string): string {
  return `<div class="activity-layout" data-activity-layout><div class="activity-layout-media">${media}</div><div class="activity-layout-details">${details}</div></div>`;
}
