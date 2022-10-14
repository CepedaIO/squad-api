SELECT * FROM memberships;

SELECT m.display_name, m.event_id, mp.*
FROM membership_permissions mp
INNER JOIN memberships m on mp.membership_id = m.id;

SELECT * FROM availabilities;

SELECT * FROM events;
TRUNCATE events CASCADE ;
DELETE FROM events WHERE id IN (SELECT event_id FROM memberships m WHERE m.email IN ('test@cypress.io'));

SELECT event_id FROM "memberships" "m" WHERE "m"."email" IN ('cypress@cepeda.io');

SELECT *
FROM pending_memberships;

SELECT *
FROM event_resolutions;

TRUNCATE event_resolutions;
