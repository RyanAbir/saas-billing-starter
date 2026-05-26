# Security Notes

- Never commit `.env.local` or any file containing secrets.
- Rotate exposed test keys before deployment or public demos.
- Use Stripe test mode for local development.
- Use a production webhook endpoint and secret in deployed environments.
