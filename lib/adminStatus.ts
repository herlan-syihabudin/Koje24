let lastActive = 0;

// dipanggil setiap admin reply dari Telegram
export function setAdminActive() {
  lastActive = Date.now();
}

// status admin berdasarkan aktivitas terakhir
export function getAdminStatus() {
  const now = Date.now();
  const diff = now - lastActive;

  // online jika aktif < 2 menit
  return diff < 2 * 60 * 1000 ? "online" : "offline";
}
