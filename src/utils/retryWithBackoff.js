function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function retryWithBackoff(task, maxTries = 3, delay = 500) {
  let lastError;
  for (let i = 0; i < maxTries; i++) {
    try {
      const result = await task(); // try to run the task
      return {
        success: true,
        retries: i,
        ...result,
      };
    } catch (error) {
      lastError = error;
      const waitTime = delay * Math.pow(2, i); 
      console.log(` Retry ${i + 1} failed. Waiting ${waitTime}ms...`);
      await wait(waitTime); 
    }
  }
  throw lastError;
}
module.exports = retryWithBackoff;
