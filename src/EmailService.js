const ProviderA = require("../providers/providers/MockProviderA");
const ProviderB = require("../providers/providers/MockProviderB");
const retryWithBackoff = require("./retryWithBackoff");
const isAllowed = require("./rateLimiter");
const logger = require("./logger");

const sentEmails = {};       // For idempotency
const emailStatuses = {};    // For status tracking
const providers = [ProviderA, ProviderB];

class EmailService {
  static async sendEmail(email) {
    const { messageId } = email;

    // Rate Limiting
    if (!isAllowed()) {
      logger.warn(`Rate limit hit for ${messageId}`);
      return {
        status: "rate_limited",
        message: "Too many requests, please wait",
        messageId
      };
    }

    // Idempotency
    if (sentEmails[messageId]) {
      logger.info(`Duplicate email detected: ${messageId}`);
      return {
        status: "duplicate",
        messageId
      };
    }

    // Try each provider with retry + backoff
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      logger.info(`Trying provider ${i + 1}...`);

      const result = await retryWithBackoff(() => provider.sendEmail(email), 3, 500);

      if (result.success) {
        sentEmails[messageId] = true;
        emailStatuses[messageId] = {
          status: "sent",
          provider: result.provider,
          timestamp: Date.now()
        };
        logger.info(`Email ${messageId} sent via ${result.provider}`);
        return {
          status: "sent",
          provider: result.provider,
          messageId
        };
      }

      logger.warn(`Provider ${i + 1} failed, trying next...`);
    }

    // All providers failed
    emailStatuses[messageId] = {
      status: "failed",
      timestamp: Date.now()
    };
    logger.error(`All providers failed for ${messageId}`);
    return {
      status: "failed",
      messageId
    };
  }

  static getEmailStatus(messageId) {
    return emailStatuses[messageId] || { status: "not_found" };
  }

  static getSentEmails() {
    return Object.keys(sentEmails);
  }
}

module.exports = EmailService;
