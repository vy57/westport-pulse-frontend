# Westport Pulse Frontend

Static frontend for Westport Pulse housing affordability dashboard.

## Local development

Set your API base URL before opening `src/index.html` via your preferred static server.

- Default fallback: `http://localhost:3000`
- Override with browser global before loading app scripts:

```html
<script>
  window.__API_BASE_URL__ = 'http://localhost:3000';
</script>
```

You can later switch to your hosted API URL without code changes, for example:

```html
<script>
  window.__API_BASE_URL__ = 'https://api.yourdomain.com';
</script>
```

The app currently calls:

- `GET /api/affordability?zipCode=06880`
