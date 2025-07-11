module.exports = {
  sendEmail: async function (email) {
    if (Math.random() < 0.6) {
      console.log("✅ ProviderA sent the email");
      return { success: true, provider: "MockProviderA" };
    } else {
      throw new Error("MockProviderA failed");
    }
  }
};
