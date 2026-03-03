
-- 1) Add columns to tasks table
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_id text,
  ADD COLUMN IF NOT EXISTS sequence_order integer;

-- Unique partial index: one course task per user per catalog item
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_user_source_unique
  ON public.tasks (user_id, source_id) WHERE source_id IS NOT NULL;

-- 2) Create task_catalog (read-only reference)
CREATE TABLE IF NOT EXISTS public.task_catalog (
  id text PRIMARY KEY,
  pillar_id text REFERENCES public.governance_pillars(id),
  title text NOT NULL,
  description text NOT NULL,
  course_order integer NOT NULL,
  effort_minutes integer,
  blast_radius text,
  dependency_task_ids text[] DEFAULT '{}'
);

ALTER TABLE public.task_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read task_catalog"
  ON public.task_catalog FOR SELECT
  TO authenticated
  USING (true);

-- 3) Seed 72 tasks
INSERT INTO public.task_catalog (id, pillar_id, course_order, title, description, effort_minutes, blast_radius, dependency_task_ids)
VALUES
-- Pillar 1: Master Key Control
('T001','master-key-control',1,'Choose your master keys','Pick your primary email + phone + platform IDs',10,'high','{}'),
('T002','master-key-control',2,'Verify access now','Confirm you can sign in without getting stuck',10,'high','{"T001"}'),
('T003','master-key-control',3,'Confirm recovery routes','Ensure recovery options are current and controlled',15,'high','{"T002"}'),
('T004','master-key-control',4,'Lock platform identity accounts','Secure Apple/Google/Microsoft IDs with strong auth + recovery',20,'high','{"T003"}'),
('T005','master-key-control',5,'Secure the phone number','Ensure number control and reduce takeover risk',15,'high','{"T003"}'),
('T006','master-key-control',6,'Create a Master Key Sheet','Document accounts + recovery method TYPES (no secrets)',15,'medium','{"T004","T005"}'),
-- Pillar 2: Credential System
('T007','credential-system',7,'Pick a password manager','Commit to one system, not scattered storage',10,'high','{}'),
('T008','credential-system',8,'Secure the password manager','Strong master password + device lock',15,'high','{"T007"}'),
('T009','credential-system',9,'Import or capture critical logins','Get the essentials into the manager first',20,'high','{"T008"}'),
('T010','credential-system',10,'Run a reuse check','Identify duplicates/reuse across accounts',15,'medium','{"T009"}'),
('T011','credential-system',11,'Rotate critical passwords','Email/financial/cloud/social to unique credentials',20,'high','{"T010"}'),
('T012','credential-system',12,'Set the new login rule','Every new account gets a unique credential, stored immediately',5,'medium','{"T011"}'),
-- Pillar 3: MFA Standard
('T013','mfa-standard',13,'Pick your MFA standard','Decide what default MFA method is for you',10,'high','{}'),
('T014','mfa-standard',14,'Enable MFA on primary email','Non-negotiable',10,'high','{"T013"}'),
('T015','mfa-standard',15,'Enable MFA on financial accounts','Banks, cards, payment platforms',15,'high','{"T014"}'),
('T016','mfa-standard',16,'Enable MFA on cloud + socials','Storage + social identity accounts',15,'high','{"T015"}'),
('T017','mfa-standard',17,'Set MFA recovery plan','Backup method exists and is stored safely',10,'medium','{"T016"}'),
('T018','mfa-standard',18,'Kill weak MFA where possible','Reduce reliance on SMS when better options exist',15,'medium','{"T017"}'),
-- Pillar 4: Account Inventory
('T019','account-inventory',19,'List all emails','Current + old (because old ones still reset stuff)',15,'medium','{}'),
('T020','account-inventory',20,'List usernames/handles','Social + public identities',10,'medium','{"T019"}'),
('T021','account-inventory',21,'Create an account list','The known accounts baseline',20,'medium','{"T020"}'),
('T022','account-inventory',22,'Mark critical accounts','Email, finance, cloud, identity',10,'high','{"T021"}'),
('T023','account-inventory',23,'Record sign-in method','Password vs SSO/OAuth per account',10,'medium','{"T022"}'),
('T024','account-inventory',24,'Flag unknowns','Anything you are unsure about becomes a task',10,'medium','{"T023"}'),
-- Pillar 5: Account Closure + Data Minimization
('T025','account-closure',25,'Identify unused accounts','Anything dormant is liability',15,'medium','{}'),
('T026','account-closure',26,'Decide: delete vs keep','Keep only what serves a purpose',10,'medium','{"T025"}'),
('T027','account-closure',27,'Export before deletion (if needed)','Only if you genuinely need data',15,'low','{"T026"}'),
('T028','account-closure',28,'Submit closures','Start with highest exposure platforms first',20,'high','{"T027"}'),
('T029','account-closure',29,'Minimize remaining profiles','Remove extra data fields and visibility',15,'medium','{"T028"}'),
('T030','account-closure',30,'Confirm closure list','Track what is closed and what is pending',10,'medium','{"T029"}'),
-- Pillar 6: Breach Reality + Alerts
('T031','breach-reality',31,'Check breach exposure','Identify known compromised emails/accounts',10,'high','{}'),
('T032','breach-reality',32,'Enable breach monitoring','Alerts for key emails',10,'high','{"T031"}'),
('T033','breach-reality',33,'Turn on login alerts','On primary email + identity accounts',10,'medium','{"T032"}'),
('T034','breach-reality',34,'Rotate impacted credentials','Any breached/reused login gets replaced',20,'high','{"T033"}'),
('T035','breach-reality',35,'Create a breach response checklist','5 steps you follow every time',15,'medium','{"T034"}'),
('T036','breach-reality',36,'Schedule monthly alert review','Breach info is useless if ignored',5,'medium','{"T035"}'),
-- Pillar 7: Session & Device Control
('T037','session-device-control',37,'Review active sessions (email)','Log out unknown/old sessions',10,'medium','{}'),
('T038','session-device-control',38,'Review active sessions (socials)','Same treatment',10,'medium','{"T037"}'),
('T039','session-device-control',39,'Remove old devices','Revoke devices you don''t own anymore',10,'high','{"T038"}'),
('T040','session-device-control',40,'Lock devices properly','Passcode/biometric + auto-lock',10,'high','{"T039"}'),
('T041','session-device-control',41,'Enable find/remote lock','Make lost phone survivable',10,'high','{"T040"}'),
('T042','session-device-control',42,'Write your lost device steps','Exactly what you do in the first 10 minutes',15,'medium','{"T041"}'),
-- Pillar 8: Connected Apps & Permissions
('T043','connected-apps',43,'Audit Google connections','See what apps have access',10,'medium','{}'),
('T044','connected-apps',44,'Audit Apple connections','Same',10,'medium','{"T043"}'),
('T045','connected-apps',45,'Audit Microsoft/others','Anywhere you used Sign in with...',10,'medium','{"T044"}'),
('T046','connected-apps',46,'Remove unused apps','Anything you don''t recognize is gone',10,'high','{"T045"}'),
('T047','connected-apps',47,'Reduce permission scope','If it needs everything, it gets nothing',10,'medium','{"T046"}'),
('T048','connected-apps',48,'Set a quarterly app review','Connections drift over time',5,'medium','{"T047"}'),
-- Pillar 9: Inbox + Cloud Vault Hygiene
('T049','inbox-cloud-hygiene',49,'Search inbox for sensitive leftovers','Old resets, verification messages, ID scans, etc.',15,'medium','{}'),
('T050','inbox-cloud-hygiene',50,'Move sensitive docs to a vault','One place, locked, intentional',15,'medium','{"T049"}'),
('T051','inbox-cloud-hygiene',51,'Delete what shouldn''t exist','Less stored = less exposed',10,'high','{"T050"}'),
('T052','inbox-cloud-hygiene',52,'Review cloud sharing links','Public links and shared folders get tightened',10,'medium','{"T051"}'),
('T053','inbox-cloud-hygiene',53,'Lock cloud accounts','Strong auth + MFA',10,'high','{"T052"}'),
('T054','inbox-cloud-hygiene',54,'Create a no sensitive inbox rule','Clean going forward, not just once',5,'medium','{"T053"}'),
-- Pillar 10: Personal Content & Social Footprint
('T055','personal-content',55,'Review privacy settings','Your default should be tight, not public',10,'medium','{}'),
('T056','personal-content',56,'Limit profile visibility','Reduce what strangers can see',10,'medium','{"T055"}'),
('T057','personal-content',57,'Audit old posts','Archive/delete oversharing',15,'medium','{"T056"}'),
('T058','personal-content',58,'Remove unnecessary public fields','Birthday, location, workplace history, etc.',10,'medium','{"T057"}'),
('T059','personal-content',59,'Handle dormant accounts','Deactivate/delete old profiles',15,'medium','{"T058"}'),
('T060','personal-content',60,'Set a posting standard','What you will / won''t share going forward',10,'medium','{"T059"}'),
-- Pillar 11: Public Footprint / Data Brokers
('T061','public-footprint',61,'Self-search','Identify what is public',10,'medium','{}'),
('T062','public-footprint',62,'List data broker sites','Where you show up',15,'medium','{"T061"}'),
('T063','public-footprint',63,'Submit opt-outs','Track which sites and dates',20,'high','{"T062"}'),
('T064','public-footprint',64,'Clean outdated listings','Old addresses/phones are exposure',15,'medium','{"T063"}'),
('T065','public-footprint',65,'Set monitoring cadence','Recheck quarterly (brokers republish)',5,'medium','{"T064"}'),
('T066','public-footprint',66,'Maintain a public footprint log','Actions taken, what changed, what remains',10,'medium','{"T065"}'),
-- Pillar 12: Governance Cadence + Containment
('T067','governance-cadence',67,'Create your Governance File','One place for decisions + review notes',15,'medium','{}'),
('T068','governance-cadence',68,'Monthly quick check','Master keys, alerts, sessions',10,'medium','{"T067"}'),
('T069','governance-cadence',69,'Quarterly deep review','Full pass through all pillars',20,'medium','{"T068"}'),
('T070','governance-cadence',70,'Containment: credential compromise','Your exact steps when something is off',15,'high','{"T069"}'),
('T071','governance-cadence',71,'Containment: device loss','Your exact steps when a device is gone',15,'high','{"T070"}'),
('T072','governance-cadence',72,'Life-event triggers list','Job change, breakup, new device, travel, etc.',10,'medium','{"T071"}')
ON CONFLICT (id) DO NOTHING;

-- 4) RPC: generate_course_tasks for current user
CREATE OR REPLACE FUNCTION public.generate_course_tasks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _cat record;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  FOR _cat IN SELECT * FROM public.task_catalog ORDER BY course_order
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE user_id = _user_id AND source_id = _cat.id
    ) THEN
      INSERT INTO public.tasks (
        user_id, type, title, description, status, 
        source_type, source_id, sequence_order, priority
      ) VALUES (
        _user_id, 'course', _cat.title, _cat.description, 'open',
        'course', _cat.id, _cat.course_order, _cat.course_order
      );
    END IF;
  END LOOP;
END;
$$;
