# Configuration and secrets

When `.env` is absent, setup copies `.env.example` and replaces its secret
placeholders with two independent 32-byte cryptographically random values. The
file is created with owner-only permissions where supported and excluded from Git.
It is plain text, not encrypted. Restrict access to your development machine.

Existing `.env` files are preserved byte for byte. Missing or placeholder required
values produce an error; correct them explicitly. Shell environment variables take
precedence. Both applications use the root file; a second CMS `.env` is not needed.
Development setup refuses to run with `NODE_ENV=production`.

Production secrets must be generated separately, stored in your hosting platform's
secret settings, and kept stable across deployments. Neither builds nor production
startup should generate them. Rotating Payload's secret can invalidate sessions;
rotating the preview secret invalidates previously issued preview links.

| Variable                    | Deployment owner and timing                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `PAYLOAD_SECRET`            | CMS runtime; private and stable.                                                                                         |
| `PREVIEW_SECRET`            | Same private value in CMS and Astro runtimes. Astro reads it through `astro:env/server`, not an embedded build constant. |
| `DATABASE_URL`              | CMS runtime; actual environment database credentials.                                                                    |
| `PUBLIC_CMS_URL`            | Astro build; the CMS origin reachable by the Astro server.                                                               |
| `PUBLIC_SITE_URL`           | Astro build and CMS runtime; the public site origin for metadata and preview links.                                      |
| `PAYLOAD_PUBLIC_SERVER_URL` | CMS runtime; the public CMS origin.                                                                                      |

No secret should receive a `PUBLIC_` prefix. Preview links contain a bearer secret;
share them only with intended reviewers. Development setup is not a deployment
command. Production schema changes need reviewed Payload migrations.

## Documentation tools

`.mcp.json` configures the Astro documentation service.
The following example connects to Payload with a personal scoped key and the CMS
running. MCP API key permissions
are covered in [accounts and permissions](accounts-and-permissions.md).

```json
{
  "mcpServers": {
    "payload": {
      "type": "http",
      "url": "http://localhost:3001/api/mcp",
      "headers": {
        "Authorization": "Bearer replace-with-a-local-payload-mcp-key"
      }
    }
  }
}
```
