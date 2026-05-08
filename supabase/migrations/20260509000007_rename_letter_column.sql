-- Letters are stored as plain text per the system prompt; previous name implied HTML.
ALTER TABLE claims RENAME COLUMN letter_html TO letter_text;
