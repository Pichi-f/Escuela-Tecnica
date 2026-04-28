# Escuela Técnica Courses Feed

This plugin exposes a public REST endpoint at `/wp-json/escuela-tecnica/v1/cursos`.

Current behavior:
- Reads a configured JSON source URL from the `escuela_tecnica_courses_source_url` option.
- Caches the normalized payload in a transient.
- Falls back to a local default payload if the remote source is unavailable.

Next step:
- Replace the remote JSON source with a WordPress job that reads the Google Drive XLSX, normalizes the rows, and updates the cached payload.
