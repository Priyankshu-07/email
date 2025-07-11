const limits = {};
function isRateLimited(email) {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxEmails = 5;
  if (!limits[email]) {
    limits[email] = [];
  }
  limits[email] = limits[email].filter(time => now - time < windowMs);
  if (limits[email].length >= maxEmails) {
    return true;
  }
  limits[email].push(now);
  return false;
}
module.exports = isRateLimited;
