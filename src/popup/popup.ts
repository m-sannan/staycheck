const statusEl = document.getElementById("status");
const checkBtn = document.getElementById("check-btn");

if (!(statusEl instanceof HTMLParagraphElement) || !(checkBtn instanceof HTMLButtonElement)) {
  throw new Error("Popup markup is missing required elements.");
}

checkBtn.addEventListener("click", async () => {
  statusEl.textContent = "Checking current tab…";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url ?? "";

  if (!url.includes("booking.com/hotel/")) {
    statusEl.textContent = "Open a Booking.com hotel page to use StayCheck.";
    return;
  }

  statusEl.textContent = "StayCheck is ready. Google comparison coming soon.";
});
