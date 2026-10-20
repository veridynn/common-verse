# Prototype schema and local data

This is a greenfield prototype with no production database. Use Payload's
development schema push while iterating. Do not add migration chains, compatibility
fields, or renamed-field fallbacks for prototype model changes. Define the intended
schema directly and rebuild disposable feature tables when a reset is authorized.

The Locations collection is `locations`. It stores optional alias and address fields, plus one required native coordinate point. Events store their own address and point snapshots. No virtual point, duplicate latitude/longitude columns, old collection aliases, or location migrations are needed.

A feature reset must stay within its authorized scope. Users, uploads, and unrelated
editorial data remain intact. Ordinary startup never resets database tables or
Docker volumes. Back up PostgreSQL and `apps/cms/media/` together when transferring
content; cloning Git does not transfer local data.

Verify persistence and queries against PostgreSQL, using rolled-back transactions
for temporary verification records. See [testing](testing.md) and
[development](development.md).
