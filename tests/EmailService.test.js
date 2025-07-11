const EmailService = require("../src/utils/EmailService.js");
const ProviderA = require("../src/providers/providers/MockProviderA.js");
const ProviderB = require("../src/providers/providers/MockProviderB.js");
const rateLimiter = require("../src/utils/rateLimiter.js");

beforeEach(() => {
  jest.resetAllMocks();
});

const testEmail = {
  messageId: "testing",
  to: "userrrrr@1234.com",
  subject: "Test Email",
  body: "testing email"
};

describe("EmailService Tests", () => {
  test("✅ Should send email successfully using ProviderA", async () => {
    ProviderA.sendEmail = jest.fn().mockResolvedValue({
      success: true,
      provider: "ProviderA"
    });

    const result = await EmailService.sendEmail(testEmail);
    expect(result.status).toBe("sent");
    expect(result.provider).toBe("ProviderA");
  });

  test("✅ Should detect duplicate emails", async () => {
    await EmailService.sendEmail(testEmail); // first send
    const result = await EmailService.sendEmail(testEmail); // duplicate
    expect(result.status).toBe("duplicate");
  });

  test("✅ Should handle complete failure from both providers", async () => {
    ProviderA.sendEmail = jest.fn().mockRejectedValue(new Error("Failed"));
    ProviderB.sendEmail = jest.fn().mockRejectedValue(new Error("Failed"));

    const result = await EmailService.sendEmail({
      ...testEmail,
      messageId: "new-id"
    });

    expect(result.status).toBe("failed");
  });

  test("✅ Should respect rate limits", async () => {
    rateLimiter.isAllowed = jest.fn().mockReturnValue(false);

    const result = await EmailService.sendEmail({
      ...testEmail,
      messageId: "limited-id"
    });

    expect(result.status).toBe("rate_limited");
  });

  test("✅ Should track email status correctly", async () => {
    const uniqueId = "status-test-001";
    ProviderA.sendEmail = jest.fn().mockResolvedValue({
      success: true,
      provider: "ProviderA"
    });

    await EmailService.sendEmail({
      ...testEmail,
      messageId: uniqueId
    });

    const status = EmailService.getEmailStatus(uniqueId);
    expect(status.status).toBe("sent");
    expect(status.provider).toBe("ProviderA");
  });
});
