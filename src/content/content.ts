const HOTEL_TITLE_SELECTOR = "h2.pp-header__title";

function getHotelName(): string | null {
  const title = document.querySelector(HOTEL_TITLE_SELECTOR);
  return title?.textContent?.trim() ?? null;
}

function injectBadge(hotelName: string): void {
  if (document.getElementById("staycheck-badge")) {
    return;
  }

  const badge = document.createElement("div");
  badge.id = "staycheck-badge";
  badge.textContent = `StayCheck: monitoring ${hotelName}`;
  badge.style.cssText = [
    "position: fixed",
    "right: 16px",
    "bottom: 16px",
    "z-index: 2147483647",
    "padding: 10px 12px",
    "border-radius: 999px",
    "background: #0f172a",
    "color: #f8fafc",
    "font: 600 12px/1.2 system-ui, sans-serif",
    "box-shadow: 0 8px 24px rgba(15, 23, 42, 0.25)",
  ].join(";");

  document.body.appendChild(badge);
}

const hotelName = getHotelName();
if (hotelName) {
  injectBadge(hotelName);
}
