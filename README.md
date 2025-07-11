<<<<<<< HEAD
Resilient Email Sending Service
A lightweight, fault-tolerant email sending service built using Node.js. It uses two mock email providers and includes fallback, retry logic, rate limiting, and idempotency checks.

Features
Works with two mock providers

Retry logic with exponential backoff

Automatic fallback to next provider on failure

Idempotency check using messageId

Basic rate limiting (5 emails/minute per recipient)

Status tracking for each email attempt

Technologies
JavaScript (Node.js)
 
 How to Run
bash
Copy
Edit
npm install
node src/index.js
Server runs at http://localhost:3000.

Assumptions
Email uniqueness is determined using messageId

Providers are mocked and randomly fail to simulate real behavior

Data is stored in-memory (no database used)

