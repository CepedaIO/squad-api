SELECT *
FROM invite_tokens;
SELECT * FROM events;

SELECT *
FROM login_tokens;

SELECT *
FROM sessions
WHERE authenticated=true;

SELECT s.uuid, s.key, lt.uuid, lt.key, s.expires_on
FROM sessions s
INNER JOIN login_tokens lt on s.id = lt.session_id

