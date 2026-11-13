# Communication module

This module defines bounded, provider-neutral contracts for in-app, email and WhatsApp messages. It deliberately does not send messages or claim delivery. Provider adapters, secrets, consent persistence, unsubscribe handling, retry/dead-letter queues, rate limiting and delivery webhooks must be implemented and tested before enabling external delivery.

WhatsApp requires an E.164 destination and explicit consent. Marketing must use separately recorded opt-in and opt-out state; the current contract is only a guard and is not a substitute for a persisted consent ledger. Never send sensitive payment/bank details through notifications.
