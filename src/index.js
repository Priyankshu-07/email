const express = require("express");
const EmailService = require("./src/utils/EmailService"); 
const isRateLimited = require("./src/utils/rateLimiter"); 
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.post("/send", async (req, res) => {
  const { messageId, to, subject, body } = req.body;
  if (!messageId || !to || !subject || !body) {
    return res.status(400).json({ error: "All fields are required!" });
  }
  if (isRateLimited(to)) {
    return res.status(429).json({
      error: "Rate limit exceeded. Max 5 emails/min per recipient.",
    });
  }
  const result = await EmailService.sendEmail(req.body); 
  res.json(result);
});
app.get("/status/:id", (req, res) => {
  const result = EmailService.getEmailStatus(req.params.id);
  res.json(result);
});
app.get("/", (req, res) => {
  res.send("✅ Email Service is running!");
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
