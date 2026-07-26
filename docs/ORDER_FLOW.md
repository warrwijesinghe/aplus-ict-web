# Order flow

The browser stores only selected product IDs, display names, and quantities in localStorage. At checkout it posts product IDs and quantities, never prices, and adds a fresh `Idempotency-Key`. Commerce Service calculates totals. Bank transfer submission similarly uses an idempotency key and stays pending until review.
