-- Taxonomy cleanup + listing FK fixes, then idempotent full taxonomy sync.
-- Run after 20260403100000. Safe on fresh DB (no-op where rows missing).
-- Preserves provider_services.subcategory_id by updating slugs/names in place where URLs changed.

-- 1) Point listings at Bryllup for wedding subs removed from Arrangement
UPDATE public.provider_services ps
SET subcategory_id = b.id
FROM public.subcategories a
JOIN public.categories ca ON ca.id = a.category_id AND ca.slug = 'arrangement'
JOIN public.subcategories b ON b.slug = a.slug
JOIN public.categories cb ON cb.id = b.category_id AND cb.slug = 'bryllup'
WHERE ps.subcategory_id = a.id
  AND a.slug IN ('bryllupsdekorering', 'bryllupsplanlegging');

DELETE FROM public.subcategories sc
USING public.categories c
WHERE sc.category_id = c.id
  AND c.slug = 'arrangement'
  AND sc.slug IN ('bryllupsdekorering', 'bryllupsplanlegging');

-- 2) Ensure Tak category exists (for moving tegltak before full sync)
INSERT INTO public.categories (name, slug, sort_order)
VALUES ('Tak og tekking', 'tak-og-tekking', 360)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- 3) Move tegltak from Flislegging → Tak
UPDATE public.subcategories s
SET category_id = (SELECT id FROM public.categories WHERE slug = 'tak-og-tekking')
WHERE s.slug = 'montering-av-tegltak'
  AND s.category_id = (SELECT id FROM public.categories WHERE slug = 'flislegging');

-- 4) Move Stryketjenester Hage → Renhold
UPDATE public.subcategories s
SET category_id = (SELECT id FROM public.categories WHERE slug = 'renhold')
WHERE s.slug = 'stryketjenester'
  AND s.category_id = (SELECT id FROM public.categories WHERE slug = 'hage-og-landskap');

-- 5) Stabilize subcategory slugs (same row id → existing listings keep working)
UPDATE public.subcategories s
SET name = 'Leie av avfallscontainer', slug = 'leie-av-avfallscontainer'
FROM public.categories c
WHERE s.category_id = c.id AND c.slug = 'renhold' AND s.slug = 'hopp-over-leie';

UPDATE public.subcategories s
SET name = 'Kommersiell og kontor — daglig renhold', slug = 'kommersiell-og-kontor-daglig-renhold'
FROM public.categories c
WHERE s.category_id = c.id AND c.slug = 'renhold' AND s.slug = 'kommersiell-og-kontor-dugg';

UPDATE public.subcategories s
SET name = 'Forsegling og fuging', slug = 'forsegling-og-fuging'
FROM public.categories c
WHERE s.category_id = c.id AND c.slug = 'flislegging' AND s.slug = 'forsegling-fuging-og-fuging';

UPDATE public.subcategories s
SET name = 'Skifte av håndtak og beslag', slug = 'skifte-av-handtak-og-beslag'
FROM public.categories c
WHERE s.category_id = c.id AND c.slug = 'handverker' AND s.slug = 'skifteavhandtakogbeslag';

-- Låsesmed: rename duplicate sub slug (was same as category slug)
UPDATE public.subcategories s
SET name = 'Lås og sylinder', slug = 'las-og-sylinder'
FROM public.categories c
WHERE s.category_id = c.id AND c.slug = 'lasesmed' AND s.slug = 'lasesmed';

-- 6) Full taxonomy upsert (categories + subcategories; matches CSV / taxonomy.ts)
INSERT INTO public.categories (name, slug, sort_order) VALUES ('Arrangement', 'arrangement', 0)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Arrangementsdekoratør', 'arrangementsdekorator', 'quote'),
  ('Cocktailbartender', 'cocktailbartender', 'quote'),
  ('DJ for privatfest', 'dj-for-privatfest', 'quote'),
  ('DJ for temafester', 'dj-for-temafester', 'quote'),
  ('Event-DJ', 'event-dj', 'quote'),
  ('Eventbartender', 'eventbartender', 'quote'),
  ('Eventplanlegger', 'eventplanlegger', 'quote'),
  ('Eventvideo', 'eventvideo', 'quote'),
  ('Festutleieutstyr', 'festutleieutstyr', 'quote'),
  ('Håndverksfestplanlegging', 'handverksfestplanlegging', 'quote'),
  ('Iscenesettelse og trussing', 'iscenesettelse-og-trussing', 'quote'),
  ('Klubb-DJ', 'klubb-dj', 'quote'),
  ('Kommersiell, film- eller musikkvideo', 'kommersiell-film-eller-musikkvideo', 'quote'),
  ('Lydproduksjonsspesialister', 'lydproduksjonsspesialister', 'quote'),
  ('Mixolog', 'mixolog', 'quote'),
  ('Mobil barservice', 'mobil-barservice', 'quote'),
  ('Utleie av AV-utstyr', 'utleie-av-av-utstyr', 'quote'),
  ('Videodesign og produksjon', 'videodesign-og-produksjon', 'quote'),
  ('Videoredigering', 'videoredigering', 'quote'),
  ('Vinkjenner', 'vinkjenner', 'quote'),
  ('Ølspesialist', 'olspesialist', 'quote')) AS v(name, slug, pricing)
WHERE c.slug = 'arrangement'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Barnevakt', 'barnevakt', 10)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Barnepass dagtid', 'barnepass-dagtid', 'hourly'),
  ('Barnepass ferie', 'barnepass-ferie', 'hourly'),
  ('Barnepass helg', 'barnepass-helg', 'hourly'),
  ('Barnepass kveld', 'barnepass-kveld', 'hourly')) AS v(name, slug, pricing)
WHERE c.slug = 'barnevakt'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Behandling', 'behandling', 20)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Akupunktør', 'akupunktor', 'hourly'),
  ('Fotpleier', 'fotpleier', 'hourly'),
  ('Fysioterapeut', 'fysioterapeut', 'hourly'),
  ('Hudpleier', 'hudpleier', 'hourly'),
  ('Kiropraktor', 'kiropraktor', 'hourly'),
  ('Massør', 'massor', 'hourly'),
  ('Negletekniker', 'negletekniker', 'hourly'),
  ('Sportsmassasje', 'sportsmassasje', 'hourly')) AS v(name, slug, pricing)
WHERE c.slug = 'behandling'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Bilverksted og mekaniker', 'bilverksted-og-mekaniker', 30)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('AC og klima bil', 'ac-og-klima-bil', 'fixed'),
  ('Bilmekaniker', 'bilmekaniker', 'fixed'),
  ('Dekkskift', 'dekkskift', 'fixed'),
  ('EU-kontroll og PKK', 'eu-kontroll-og-pkk', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'bilverksted-og-mekaniker'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Boligstyling', 'boligstyling', 40)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Boligstyling før salg', 'boligstyling-for-salg', 'quote'),
  ('Homestaging', 'homestaging', 'quote'),
  ('Interiørkonsulent', 'interiorkonsulent', 'quote')) AS v(name, slug, pricing)
WHERE c.slug = 'boligstyling'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Bryllup', 'bryllup', 50)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Bilutleie for bryllup', 'bilutleie-for-bryllup', 'quote'),
  ('Brudekjoleendringer', 'brudekjoleendringer', 'quote'),
  ('Brudekjoler', 'brudekjoler', 'quote'),
  ('Brudepiker og forlovere', 'brudepiker-og-forlovere', 'quote'),
  ('Bryllup Toastmasters', 'bryllup-toastmasters', 'quote'),
  ('Bryllups DJ', 'bryllups-dj', 'quote'),
  ('Bryllupsblomster', 'bryllupsblomster', 'quote'),
  ('Bryllupscatering', 'bryllupscatering', 'quote'),
  ('Bryllupsdekorering', 'bryllupsdekorering', 'quote'),
  ('Bryllupsfeirer', 'bryllupsfeirer', 'quote'),
  ('Bryllupsforsikring', 'bryllupsforsikring', 'quote'),
  ('Bryllupsfotobokser', 'bryllupsfotobokser', 'quote'),
  ('Bryllupsfrisør', 'bryllupsfrisor', 'quote'),
  ('Bryllupslokaler', 'bryllupslokaler', 'quote'),
  ('Bryllupslyd og lys', 'bryllupslyd-og-lys', 'quote'),
  ('Bryllupsmusikere', 'bryllupsmusikere', 'quote'),
  ('Bryllupsmusikkorps', 'bryllupsmusikkorps', 'quote'),
  ('Bryllupsplanlegging', 'bryllupsplanlegging', 'quote'),
  ('Bryllupsreise planleggere', 'bryllupsreise-planleggere', 'quote'),
  ('Bryllupsreise reisebyråer', 'bryllupsreise-reisebyraer', 'quote'),
  ('Bryllupsskrivesaker', 'bryllupsskrivesaker', 'quote'),
  ('Bryllupssminke', 'bryllupssminke', 'quote'),
  ('Bryllupssmykker', 'bryllupssmykker', 'quote'),
  ('Bryllupsstylist', 'bryllupsstylist', 'quote'),
  ('Bryllupsunderholdning', 'bryllupsunderholdning', 'quote'),
  ('Buss og bussutleie', 'buss-og-bussutleie', 'quote'),
  ('Engasjement Videografi', 'engasjement-videografi', 'quote'),
  ('Skrivesaker for bryllup', 'skrivesaker-for-bryllup', 'quote'),
  ('Utdrikningslager', 'utdrikningslager', 'quote'),
  ('Utleie av telt', 'utleie-av-telt', 'quote'),
  ('Veteranbilutleie', 'veteranbilutleie', 'quote'),
  ('Videografi for bryllup', 'videografi-for-bryllup', 'quote')) AS v(name, slug, pricing)
WHERE c.slug = 'bryllup'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Design', 'design', 60)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('3D-modellering og CAD-tjenester', '3d-modellering-og-cad-tjenester', 'quote'),
  ('Animasjon', 'animasjon', 'quote'),
  ('Annonsedesign', 'annonsedesign', 'quote'),
  ('Binding', 'binding', 'quote'),
  ('Brosjyredesign', 'brosjyredesign', 'quote'),
  ('E-handel', 'e-handel', 'quote'),
  ('E-postmaldesign', 'e-postmaldesign', 'quote'),
  ('Emballasjedesign', 'emballasjedesign', 'quote'),
  ('Flyer og brosjyredesign', 'flyer-og-brosjyredesign', 'quote'),
  ('Gatekunstner', 'gatekunstner', 'quote'),
  ('Grafisk design', 'grafisk-design', 'quote'),
  ('Illustratør', 'illustrator', 'quote'),
  ('Ingeniørdesign', 'ingeniordesign', 'quote'),
  ('Kontorrekvisita', 'kontorrekvisita', 'quote'),
  ('Logodesign', 'logodesign', 'quote'),
  ('Maler (Portrettmaler, Abstraktkunstner)', 'maler-portrettmaler-abstraktkunstner', 'quote'),
  ('Merkevareutforming', 'merkevareutforming', 'quote'),
  ('Presentasjonsdesign', 'presentasjonsdesign', 'quote'),
  ('Printdesign', 'printdesign', 'quote'),
  ('Teknisk design', 'teknisk-design', 'quote'),
  ('UX og UI design', 'ux-og-ui-design', 'quote'),
  ('Visittkortdesign', 'visittkortdesign', 'quote'),
  ('Webdesign', 'webdesign', 'quote'),
  ('Webutvikling', 'webutvikling', 'quote')) AS v(name, slug, pricing)
WHERE c.slug = 'design'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Dyrepass', 'dyrepass', 70)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Dyrepass', 'dyrepass', 'hourly'),
  ('Dyrepasser for smådyr', 'dyrepasser-for-smadyr', 'hourly'),
  ('Hundelufting', 'hundelufting', 'hourly'),
  ('Husdyrpleier', 'husdyrpleier', 'hourly'),
  ('Kattepasser', 'kattepasser', 'hourly')) AS v(name, slug, pricing)
WHERE c.slug = 'dyrepass'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Eldreomsorg', 'eldreomsorg', 80)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Følge til avtaler', 'folge-til-avtaler', 'hourly'),
  ('Følge til lege', 'folge-til-lege', 'hourly'),
  ('Handlehjelp', 'handlehjelp', 'hourly'),
  ('Selskap og prat', 'selskap-og-prat', 'hourly')) AS v(name, slug, pricing)
WHERE c.slug = 'eldreomsorg'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Elektriker', 'elektriker', 90)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('El-installasjon bolig', 'el-installasjon-bolig', 'fixed'),
  ('Feilsøking og reparasjon elektro', 'feilsoking-og-reparasjon-elektro', 'fixed'),
  ('Ladeinfrastruktur elbil', 'ladeinfrastruktur-elbil', 'fixed'),
  ('Sikringsskap og kurser', 'sikringsskap-og-kurser', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'elektriker'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Eventutleie', 'eventutleie', 100)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Utleie av partytelt', 'utleie-av-partytelt', 'quote'),
  ('Utleie av stoler og bord', 'utleie-av-stoler-og-bord', 'quote')) AS v(name, slug, pricing)
WHERE c.slug = 'eventutleie'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Flislegging', 'flislegging', 110)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Forsegling og fuging', 'forsegling-og-fuging', 'fixed'),
  ('Gulvfliser', 'gulvfliser', 'fixed'),
  ('Kjøkkenfliser', 'kjokkenfliser', 'fixed'),
  ('Montering av stein eller fliser på gulv', 'montering-av-stein-eller-fliser-pa-gulv', 'fixed'),
  ('Murstein og blokkbelegningstjenester', 'murstein-og-blokkbelegningstjenester', 'fixed'),
  ('Reparasjon av stein eller fliser', 'reparasjon-av-stein-eller-fliser', 'fixed'),
  ('Uteplasstjenester', 'uteplasstjenester', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'flislegging'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Flyttehjelp', 'flyttehjelp', 120)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Bærehjelp', 'baerehjelp', 'hourly'),
  ('Flytting av møbler', 'flytting-av-mobler', 'hourly'),
  ('Full flyttehjelp', 'full-flyttehjelp', 'hourly'),
  ('Pakking til flytting', 'pakking-til-flytting', 'hourly'),
  ('Piano- og tungløft', 'piano-og-tungloft', 'hourly')) AS v(name, slug, pricing)
WHERE c.slug = 'flyttehjelp'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Fotografi', 'fotografi', 130)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Arkitekturfotografi', 'arkitekturfotografi', 'fixed'),
  ('Bedriftsfotografi', 'bedriftsfotografi', 'fixed'),
  ('Boudoirfotografi', 'boudoirfotografi', 'fixed'),
  ('Bryllupsfotografi', 'bryllupsfotografi', 'fixed'),
  ('Dronefotografi', 'dronefotografi', 'fixed'),
  ('Dyrefotografi', 'dyrefotografi', 'fixed'),
  ('Eiendomsfotografi', 'eiendomsfotografi', 'fixed'),
  ('Eventfotografi', 'eventfotografi', 'fixed'),
  ('Familiefotografi', 'familiefotografi', 'fixed'),
  ('Forlovelsesfotografi', 'forlovelsesfotografi', 'fixed'),
  ('Modellfotografi', 'modellfotografi', 'fixed'),
  ('Naturfotografi', 'naturfotografi', 'fixed'),
  ('Nyfødtfotografi', 'nyfodtfotografi', 'fixed'),
  ('Portrettfotografi', 'portrettfotografi', 'fixed'),
  ('Reklamefotografi', 'reklamefotografi', 'fixed'),
  ('Sportsfotografi', 'sportsfotografi', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'fotografi'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Frisør', 'frisor', 140)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Barberer', 'barberer', 'hourly'),
  ('Hårstylist', 'harstylist', 'hourly')) AS v(name, slug, pricing)
WHERE c.slug = 'frisor'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Hage og landskap', 'hage-og-landskap', 150)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Bygging av drivhus', 'bygging-av-drivhus', 'hourly'),
  ('Bygging av hageskur', 'bygging-av-hageskur', 'hourly'),
  ('Gjødsling', 'gjodsling', 'hourly'),
  ('Hagerom', 'hagerom', 'hourly'),
  ('Hagerydning', 'hagerydning', 'hourly'),
  ('Installasjon av dam- og vannfunksjoner', 'installasjon-av-dam-og-vannfunksjoner', 'hourly'),
  ('Installasjon av gjerde og porter', 'installasjon-av-gjerde-og-porter', 'hourly'),
  ('Installasjon av hagesprinkleranlegg', 'installasjon-av-hagesprinkleranlegg', 'hourly'),
  ('Installasjon av kunstgress', 'installasjon-av-kunstgress', 'hourly'),
  ('Installasjon av sikkerhetsgjerde', 'installasjon-av-sikkerhetsgjerde', 'hourly'),
  ('Installasjon, vedlikehold og rengjøring av boblebad og spa', 'installasjon-vedlikehold-og-rengjoring-av-boblebad-og-spa', 'hourly'),
  ('Konstruksjon av lekeutstyr', 'konstruksjon-av-lekeutstyr', 'hourly'),
  ('Landskapsarbeid', 'landskapsarbeid', 'hourly'),
  ('Landskapsdesign', 'landskapsdesign', 'hourly'),
  ('Montering av grill', 'montering-av-grill', 'hourly'),
  ('Montering av lysthus, pergola og espalier', 'montering-av-lysthus-pergola-og-espalier', 'hourly'),
  ('Montering av markise', 'montering-av-markise', 'hourly'),
  ('Planting, vedlikehold eller fjerning av trær og busker', 'planting-vedlikehold-eller-fjerning-av-traer-og-busker', 'hourly'),
  ('Plassering av steinblokker', 'plassering-av-steinblokker', 'hourly'),
  ('Plenpleie', 'plenpleie', 'hourly'),
  ('Reparasjon av badestamp og spa', 'reparasjon-av-badestamp-og-spa', 'hourly'),
  ('Reparasjon av gjerde og porter', 'reparasjon-av-gjerde-og-porter', 'hourly'),
  ('Reparasjon av gressklipper', 'reparasjon-av-gressklipper', 'hourly'),
  ('Reparasjon av kunstgress', 'reparasjon-av-kunstgress', 'hourly'),
  ('Reparasjon av lekeutstyr', 'reparasjon-av-lekeutstyr', 'hourly'),
  ('Reparasjon og vedlikehold av dam- og vannfunksjon', 'reparasjon-og-vedlikehold-av-dam-og-vannfunksjon', 'hourly'),
  ('Reparasjon og vedlikehold av hagesprinkleranlegg', 'reparasjon-og-vedlikehold-av-hagesprinkleranlegg', 'hourly'),
  ('Reparasjon og vedlikehold av markise', 'reparasjon-og-vedlikehold-av-markise', 'hourly'),
  ('Reparasjon og vedlikehold av terrassedeksel', 'reparasjon-og-vedlikehold-av-terrassedeksel', 'hourly'),
  ('Snøbrøyting', 'snobroyting', 'hourly'),
  ('Støttemurkonstruksjon', 'stottemurkonstruksjon', 'hourly'),
  ('Trekirurgi og fjerning', 'trekirurgi-og-fjerning', 'hourly')) AS v(name, slug, pricing)
WHERE c.slug = 'hage-og-landskap'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Helse', 'helse', 160)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Ansattes hjelpeprogrammer', 'ansattes-hjelpeprogrammer', 'fixed'),
  ('Aromaterapi', 'aromaterapi', 'fixed'),
  ('Avhengighetsterapi', 'avhengighetsterapi', 'fixed'),
  ('Barnerådgivning', 'barneradgivning', 'fixed'),
  ('Behandling av hårtap', 'behandling-av-hartap', 'fixed'),
  ('Depresjonsrådgivning', 'depresjonsradgivning', 'fixed'),
  ('Ekteskapsrådgivning', 'ekteskapsradgivning', 'fixed'),
  ('Familierådgivning', 'familieradgivning', 'fixed'),
  ('Fotterapi og fotterapeuter', 'fotterapi-og-fotterapeuter', 'fixed'),
  ('Fysioterapi', 'fysioterapi', 'fixed'),
  ('Gambling terapi', 'gambling-terapi', 'fixed'),
  ('Holistisk terapi', 'holistisk-terapi', 'fixed'),
  ('Homeopati', 'homeopati', 'fixed'),
  ('Hypnoterapi', 'hypnoterapi', 'fixed'),
  ('Høreapparater', 'horeapparater', 'fixed'),
  ('Iridologi', 'iridologi', 'fixed'),
  ('Jungiansk psykoanalyse', 'jungiansk-psykoanalyse', 'fixed'),
  ('Kognitiv atferdsterapi', 'kognitiv-atferdsterapi', 'fixed'),
  ('Komplementær terapi', 'komplementaer-terapi', 'fixed'),
  ('Kunstterapi', 'kunstterapi', 'fixed'),
  ('Massasjeterapi', 'massasjeterapi', 'fixed'),
  ('Massasjetrening', 'massasjetrening', 'fixed'),
  ('Osteopati', 'osteopati', 'fixed'),
  ('Parrådgivning', 'parradgivning', 'fixed'),
  ('Psykodynamisk psykoterapi', 'psykodynamisk-psykoterapi', 'fixed'),
  ('Psykologer', 'psykologer', 'fixed'),
  ('Psykoterapi', 'psykoterapi', 'fixed'),
  ('Refleksologi', 'refleksologi', 'fixed'),
  ('Reiki', 'reiki', 'fixed'),
  ('Rådgivning', 'radgivning', 'fixed'),
  ('Shiatsu', 'shiatsu', 'fixed'),
  ('Sofrologi', 'sofrologi', 'fixed'),
  ('Sorgrådgivning', 'sorgradgivning', 'fixed'),
  ('Stylister', 'stylister', 'fixed'),
  ('Terapeut', 'terapeut', 'fixed'),
  ('Ungdomsrådgivning', 'ungdomsradgivning', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'helse'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Håndverker', 'handverker', 170)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Bygging av platting', 'bygging-av-platting', 'fixed'),
  ('Bygging av terrasse', 'bygging-av-terrasse', 'fixed'),
  ('Demontering av innredning', 'demontering-av-innredning', 'fixed'),
  ('Gulvsliping', 'gulvsliping', 'fixed'),
  ('Innerdører og listverk', 'innerdorer-og-listverk', 'fixed'),
  ('Innvendig isolering', 'innvendig-isolering', 'fixed'),
  ('Legging av gulv', 'legging-av-gulv', 'fixed'),
  ('Montering av baderomsinnredning', 'montering-av-baderomsinnredning', 'fixed'),
  ('Montering av benkeplate', 'montering-av-benkeplate', 'fixed'),
  ('Montering av dør', 'montering-av-dor', 'fixed'),
  ('Montering av garderobe', 'montering-av-garderobe', 'fixed'),
  ('Montering av gjerde og port', 'montering-av-gjerde-og-port', 'fixed'),
  ('Montering av kjøkken', 'montering-av-kjokken', 'fixed'),
  ('Montering av møbler', 'montering-av-mobler', 'fixed'),
  ('Montering av utebod', 'montering-av-utebod', 'fixed'),
  ('Montering av vindu', 'montering-av-vindu', 'fixed'),
  ('Oppheng av bilder og TV', 'oppheng-av-bilder-og-tv', 'fixed'),
  ('Reparasjon av gjerde eller levegg', 'reparasjon-av-gjerde-eller-levegg', 'fixed'),
  ('Skifte av håndtak og beslag', 'skifte-av-handtak-og-beslag', 'fixed'),
  ('Småreparasjoner', 'smareparasjoner', 'fixed'),
  ('Snekring av hyller', 'snekring-av-hyller', 'fixed'),
  ('Sparkling og puss', 'sparkling-og-puss', 'fixed'),
  ('Tømrer og snekker', 'tomrer-og-snekker', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'handverker'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('IT-hjelp', 'it-hjelp', 180)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Mobil og nettbrett', 'mobil-og-nettbrett', 'hourly'),
  ('PC- og printeroppsett', 'pc-og-printeroppsett', 'hourly'),
  ('Sikkerhetskopiering og gjenoppretting', 'sikkerhetskopiering-og-gjenoppretting', 'hourly'),
  ('Smarthus og IoT-oppsett', 'smarthus-og-iot-oppsett', 'hourly'),
  ('Virus og malware-fjerning', 'virus-og-malware-fjerning', 'hourly'),
  ('WiFi- og nettverksproblemer', 'wifi-og-nettverksproblemer', 'hourly')) AS v(name, slug, pricing)
WHERE c.slug = 'it-hjelp'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Juridisk rådgivning', 'juridisk-radgivning', 190)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Arbeidsrett', 'arbeidsrett', 'quote'),
  ('Arv og testament', 'arv-og-testament', 'quote'),
  ('Boligjuridisk bistand', 'boligjuridisk-bistand', 'quote'),
  ('Familierett og samboerskap', 'familierett-og-samboerskap', 'quote'),
  ('Gratis juridisk vurdering', 'gratis-juridisk-vurdering', 'quote'),
  ('Opprettelse av kontrakter', 'opprettelse-av-kontrakter', 'quote')) AS v(name, slug, pricing)
WHERE c.slug = 'juridisk-radgivning'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Kampsport', 'kampsport', 200)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Boksing', 'boksing', 'fixed'),
  ('Brasiliansk Jiu Jitsu', 'brasiliansk-jiu-jitsu', 'fixed'),
  ('Bryting', 'bryting', 'fixed'),
  ('Catch Wrestling', 'catch-wrestling', 'fixed'),
  ('Hema', 'hema', 'fixed'),
  ('Judo', 'judo', 'fixed'),
  ('Karate', 'karate', 'fixed'),
  ('Kickboksing', 'kickboksing', 'fixed'),
  ('MMA', 'mma', 'fixed'),
  ('Muay Thai', 'muay-thai', 'fixed'),
  ('Sambo', 'sambo', 'fixed'),
  ('Sumobryting', 'sumobryting', 'fixed'),
  ('Taekwondo', 'taekwondo', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'kampsport'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Kokk', 'kokk', 210)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Cateringkokk', 'cateringkokk', 'quote'),
  ('Dessertkokk', 'dessertkokk', 'quote'),
  ('Frokostkokk', 'frokostkokk', 'quote'),
  ('Gourmetkokk', 'gourmetkokk', 'quote'),
  ('Grillkokk', 'grillkokk', 'quote'),
  ('Kokkforhjemmemiddag', 'kokkforhjemmemiddag', 'quote'),
  ('Kokktilfirmaarrangement', 'kokktilfirmaarrangement', 'quote'),
  ('Kokktilselskap', 'kokktilselskap', 'quote'),
  ('Konditor', 'konditor', 'quote'),
  ('Privatkokk', 'privatkokk', 'quote'),
  ('Streetfoodkokk', 'streetfoodkokk', 'quote'),
  ('Sushikokk', 'sushikokk', 'quote'),
  ('Tapaskokk', 'tapaskokk', 'quote'),
  ('Veganskokk', 'veganskokk', 'quote'),
  ('Vegetariskkokk', 'vegetariskkokk', 'quote')) AS v(name, slug, pricing)
WHERE c.slug = 'kokk'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Kurs og opplæring', 'kurs-og-opplaering', 220)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Excel for nybegynnere', 'excel-for-nybegynnere', 'fixed'),
  ('Gründer og oppstart', 'grunder-og-oppstart', 'fixed'),
  ('Matlagingskurs', 'matlagingskurs', 'fixed'),
  ('Presentasjonsteknikk', 'presentasjonsteknikk', 'fixed'),
  ('Sosiale medier for bedrifter', 'sosiale-medier-for-bedrifter', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'kurs-og-opplaering'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Låsesmed', 'lasesmed', 230)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Elektronisk adgangskontroll', 'elektronisk-adgangskontroll', 'fixed'),
  ('Lås og sylinder', 'las-og-sylinder', 'fixed'),
  ('Nøkkel og lås', 'nokkel-og-las', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'lasesmed'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Maler og tapetsering', 'maler-og-tapetsering', 240)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Innendørs maling', 'innendors-maling', 'fixed'),
  ('Maling tak og lister', 'maling-tak-og-lister', 'fixed'),
  ('Tapetsering', 'tapetsering', 'fixed'),
  ('Utvendig maling', 'utvendig-maling', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'maler-og-tapetsering'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Mat', 'mat', 250)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Bryllupskaker', 'bryllupskaker', 'quote'),
  ('Catering', 'catering', 'quote'),
  ('Food Truck', 'food-truck', 'quote'),
  ('Kakelaging', 'kakelaging', 'quote'),
  ('Konditori', 'konditori', 'quote'),
  ('Matlagingstimer', 'matlagingstimer', 'quote'),
  ('Personlige kokk', 'personlige-kokk', 'quote'),
  ('Sommelier', 'sommelier', 'quote')) AS v(name, slug, pricing)
WHERE c.slug = 'mat'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Musikk', 'musikk', 260)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Country', 'country', 'quote'),
  ('Disco', 'disco', 'quote'),
  ('Dubstep', 'dubstep', 'quote'),
  ('EDM', 'edm', 'quote'),
  ('Electronica', 'electronica', 'quote'),
  ('Hardstyle', 'hardstyle', 'quote'),
  ('Hiphop', 'hiphop', 'quote'),
  ('House', 'house', 'quote'),
  ('Klassikere', 'klassikere', 'quote'),
  ('Kor og ensemble', 'kor-og-ensemble', 'quote'),
  ('Live band', 'live-band', 'quote'),
  ('Lounge', 'lounge', 'quote'),
  ('Musikk for barn', 'musikk-for-barn', 'quote'),
  ('Pop', 'pop', 'quote'),
  ('Sanger', 'sanger', 'quote'),
  ('Soloartist og vokalist', 'soloartist-og-vokalist', 'quote'),
  ('Trance', 'trance', 'quote'),
  ('Trap', 'trap', 'quote')) AS v(name, slug, pricing)
WHERE c.slug = 'musikk'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Musikkundervisning', 'musikkundervisning', 270)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Ballroom Dance-klasser', 'ballroom-dance-klasser', 'hourly'),
  ('Banjo-leksjoner', 'banjo-leksjoner', 'hourly'),
  ('Bassgitartimer', 'bassgitartimer', 'hourly'),
  ('Bratsjundervisning', 'bratsjundervisning', 'hourly'),
  ('Cellotimer', 'cellotimer', 'hourly'),
  ('Dansekoreografitimer', 'dansekoreografitimer', 'hourly'),
  ('Dansetimer', 'dansetimer', 'hourly'),
  ('Fagotttimer', 'fagotttimer', 'hourly'),
  ('Fele-leksjoner', 'fele-leksjoner', 'hourly'),
  ('Fiolintimer', 'fiolintimer', 'hourly'),
  ('Fløytetimer', 'floytetimer', 'hourly'),
  ('Fransk horn', 'fransk-horn', 'hourly'),
  ('Gitarlærer', 'gitarlaerer', 'hourly'),
  ('Gitartimer', 'gitartimer', 'hourly'),
  ('Harpetimer', 'harpetimer', 'hourly'),
  ('Hip Hop-dansekurs', 'hip-hop-dansekurs', 'hourly'),
  ('Klarinetttimer', 'klarinetttimer', 'hourly'),
  ('Komedietimer', 'komedietimer', 'hourly'),
  ('Kontrabasstimer', 'kontrabasstimer', 'hourly'),
  ('Magedanstimer', 'magedanstimer', 'hourly'),
  ('Mandolintimer', 'mandolintimer', 'hourly'),
  ('Munnspill-leksjoner', 'munnspill-leksjoner', 'hourly'),
  ('Musikkkomposisjonstimer', 'musikkkomposisjonstimer', 'hourly'),
  ('Musikkteoritimer', 'musikkteoritimer', 'hourly'),
  ('Musikktimer', 'musikktimer', 'hourly'),
  ('Obo-leksjoner', 'obo-leksjoner', 'hourly'),
  ('Pianolærer', 'pianolaerer', 'hourly'),
  ('Pianotimer', 'pianotimer', 'hourly'),
  ('Poledance-kurs', 'poledance-kurs', 'hourly'),
  ('Rap-musikktimer', 'rap-musikktimer', 'hourly'),
  ('Saksofonundervisning', 'saksofonundervisning', 'hourly'),
  ('Sangundervisning', 'sangundervisning', 'hourly'),
  ('Sekkepipetimer', 'sekkepipetimer', 'hourly'),
  ('Tango-dansetimer', 'tango-dansetimer', 'hourly'),
  ('Trekkspillundervisning', 'trekkspillundervisning', 'hourly'),
  ('Trombonetimer', 'trombonetimer', 'hourly'),
  ('Trommetimer', 'trommetimer', 'hourly'),
  ('Trompetundervisning', 'trompetundervisning', 'hourly'),
  ('Ukuleletimer', 'ukuleletimer', 'hourly')) AS v(name, slug, pricing)
WHERE c.slug = 'musikkundervisning'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Personlig trener', 'personlig-trener', 280)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Badminton', 'badminton', 'hourly'),
  ('Baseball', 'baseball', 'hourly'),
  ('Basketball', 'basketball', 'hourly'),
  ('Bordtennis', 'bordtennis', 'hourly'),
  ('CrossFit-trener', 'crossfit-trener', 'hourly'),
  ('Fekting', 'fekting', 'hourly'),
  ('Fotball', 'fotball', 'hourly'),
  ('Golf', 'golf', 'hourly'),
  ('Gymnastikk', 'gymnastikk', 'hourly'),
  ('Kajakk', 'kajakk', 'hourly'),
  ('Klatre', 'klatre', 'hourly'),
  ('Kondisjonstrener', 'kondisjonstrener', 'hourly'),
  ('Kostholdsveileder', 'kostholdsveileder', 'hourly'),
  ('Løping', 'loping', 'hourly'),
  ('Paragliding', 'paragliding', 'hourly'),
  ('Pilates', 'pilates', 'hourly'),
  ('Pilates-trener', 'pilates-trener', 'hourly'),
  ('Racketball', 'racketball', 'hourly'),
  ('Rehabiliteringstrener', 'rehabiliteringstrener', 'hourly'),
  ('Seiling', 'seiling', 'hourly'),
  ('Skateboard', 'skateboard', 'hourly'),
  ('Skikurs', 'skikurs', 'hourly'),
  ('Skøyting', 'skoyting', 'hourly'),
  ('Softball', 'softball', 'hourly'),
  ('Styrketreningsinstruktør', 'styrketreningsinstruktor', 'hourly'),
  ('Surfing', 'surfing', 'hourly'),
  ('Svømming', 'svomming', 'hourly'),
  ('Sykling', 'sykling', 'hourly'),
  ('Tennis', 'tennis', 'hourly'),
  ('Triatlon', 'triatlon', 'hourly'),
  ('Vannaerobic', 'vannaerobic', 'hourly'),
  ('Vannski', 'vannski', 'hourly'),
  ('Volleyball', 'volleyball', 'hourly'),
  ('Wakeboard', 'wakeboard', 'hourly'),
  ('Yoga', 'yoga', 'hourly'),
  ('Yoga-instruktør', 'yoga-instruktor', 'hourly')) AS v(name, slug, pricing)
WHERE c.slug = 'personlig-trener'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Privatundervisning', 'privatundervisning', 290)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Engelsk', 'engelsk', 'fixed'),
  ('Fransk', 'fransk', 'fixed'),
  ('Fysikk', 'fysikk', 'fixed'),
  ('Kjemi', 'kjemi', 'fixed'),
  ('Matematikk', 'matematikk', 'fixed'),
  ('Naturfag', 'naturfag', 'fixed'),
  ('Norsk', 'norsk', 'fixed'),
  ('Spansk', 'spansk', 'fixed'),
  ('Tysk', 'tysk', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'privatundervisning'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Regnskap', 'regnskap', 300)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Bokføring', 'bokforing', 'quote'),
  ('Etablering av AS', 'etablering-av-as', 'quote'),
  ('Etablering av ENK', 'etablering-av-enk', 'quote'),
  ('Fakturering', 'fakturering', 'quote'),
  ('Lønnskjøring', 'lonnskjoring', 'quote'),
  ('MVArapportering', 'mvarapportering', 'quote'),
  ('Regnskapsføring', 'regnskapsforing', 'quote'),
  ('Regnskapsrådgivning', 'regnskapsradgivning', 'quote'),
  ('Selvangivelse', 'selvangivelse', 'quote'),
  ('Skatterådgivning', 'skatteradgivning', 'quote'),
  ('Årsoppgjør', 'arsoppgjor', 'quote')) AS v(name, slug, pricing)
WHERE c.slug = 'regnskap'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Renhold og rengjøring', 'renhold', 310)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Avfallshåndtering', 'avfallshandtering', 'hourly'),
  ('Damprengjøring', 'damprengjoring', 'hourly'),
  ('Dyprengjøring', 'dyprengjoring', 'hourly'),
  ('Dypvasktjenester', 'dypvasktjenester', 'hourly'),
  ('Flyttevask', 'flyttevask', 'hourly'),
  ('Hagerydning', 'hagerydning', 'hourly'),
  ('Husrengjøring', 'husrengjoring', 'hourly'),
  ('Husrydding', 'husrydding', 'hourly'),
  ('Høytrykksspyling', 'hoytrykksspyling', 'hourly'),
  ('Kommersiell og kontor — daglig renhold', 'kommersiell-og-kontor-daglig-renhold', 'hourly'),
  ('Kommersiell og kontorrengjøring', 'kommersiell-og-kontorrengjoring', 'hourly'),
  ('Kontorrengjøring', 'kontorrengjoring', 'hourly'),
  ('Leie av avfallscontainer', 'leie-av-avfallscontainer', 'hourly'),
  ('Luktfjerning', 'luktfjerning', 'hourly'),
  ('Opprydding av eiendom etter bygging', 'opprydding-av-eiendom-etter-bygging', 'hourly'),
  ('Ovnsrengjøring', 'ovnsrengjoring', 'hourly'),
  ('Rengjøring av boblebad og spa', 'rengjoring-av-boblebad-og-spa', 'hourly'),
  ('Rengjøring av fliser og fuger', 'rengjoring-av-fliser-og-fuger', 'hourly'),
  ('Rengjøring av hjem', 'rengjoring-av-hjem', 'hourly'),
  ('Rengjøring av innkjørsel', 'rengjoring-av-innkjorsel', 'hourly'),
  ('Rengjøring av kanaler og ventiler', 'rengjoring-av-kanaler-og-ventiler', 'hourly'),
  ('Rengjøring av murstein og stein', 'rengjoring-av-murstein-og-stein', 'hourly'),
  ('Rengjøring av møbeltrekk og møbel', 'rengjoring-av-mobeltrekk-og-mobel', 'hourly'),
  ('Rengjøring av skorstein', 'rengjoring-av-skorstein', 'hourly'),
  ('Rengjøring av tepper og møbler', 'rengjoring-av-tepper-og-mobler', 'hourly'),
  ('Rengjøring etter bygging', 'rengjoring-etter-bygging', 'hourly'),
  ('Rensing av avløp og kloakk', 'rensing-av-avlop-og-kloakk', 'hourly'),
  ('Rensing av renne', 'rensing-av-renne', 'hourly'),
  ('Sluttrengjøring av leieforhold', 'sluttrengjoring-av-leieforhold', 'hourly'),
  ('Stryketjenester', 'stryketjenester', 'hourly'),
  ('Tepperensing', 'tepperensing', 'hourly'),
  ('Vindusvask', 'vindusvask', 'hourly'),
  ('Vindusvaskere', 'vindusvaskere', 'hourly')) AS v(name, slug, pricing)
WHERE c.slug = 'renhold'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Rørlegger og VVS', 'rorlegger-og-vvs', 320)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Montering av bad', 'montering-av-bad', 'fixed'),
  ('Rørlegger', 'rorlegger', 'fixed'),
  ('Tette avløp og sluk', 'tette-avlop-og-sluk', 'fixed'),
  ('Varme og sanitær', 'varme-og-sanitaer', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'rorlegger-og-vvs'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Småreparasjoner', 'smareparasjoner', 330)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('IKEA Garderobe', 'ikea-garderobe', 'fixed'),
  ('IKEA-montering', 'ikea-montering', 'fixed'),
  ('Opphenging av bilder og hyller', 'opphenging-av-bilder-og-hyller', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'smareparasjoner'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Språk', 'sprak', 340)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Arabisk', 'arabisk', 'hourly'),
  ('Dansk', 'dansk', 'hourly'),
  ('Engelsk', 'engelsk', 'hourly'),
  ('Farsi', 'farsi', 'hourly'),
  ('Fransk', 'fransk', 'hourly'),
  ('Gresk', 'gresk', 'hourly'),
  ('Hebraisk', 'hebraisk', 'hourly'),
  ('Hindi', 'hindi', 'hourly'),
  ('Indonesisk', 'indonesisk', 'hourly'),
  ('Italiensk', 'italiensk', 'hourly'),
  ('Japansk', 'japansk', 'hourly'),
  ('Kantonesisk', 'kantonesisk', 'hourly'),
  ('Kinesisk', 'kinesisk', 'hourly'),
  ('Koreansk', 'koreansk', 'hourly'),
  ('Latinsk', 'latinsk', 'hourly'),
  ('Mandarin', 'mandarin', 'hourly'),
  ('Medisinsk transkripsjon', 'medisinsk-transkripsjon', 'hourly'),
  ('Nederlandsk', 'nederlandsk', 'hourly'),
  ('Norsk', 'norsk', 'hourly'),
  ('Polsk', 'polsk', 'hourly'),
  ('Portugisisk', 'portugisisk', 'hourly'),
  ('Redigering', 'redigering', 'hourly'),
  ('Rumensk', 'rumensk', 'hourly'),
  ('Russisk', 'russisk', 'hourly'),
  ('Sanskrit', 'sanskrit', 'hourly'),
  ('Skandinavisk', 'skandinavisk', 'hourly'),
  ('Skrivetjenester', 'skrivetjenester', 'hourly'),
  ('Somalisk', 'somalisk', 'hourly'),
  ('Spansk', 'spansk', 'hourly'),
  ('Svensk', 'svensk', 'hourly'),
  ('Swahili', 'swahili', 'hourly'),
  ('Tagalog', 'tagalog', 'hourly'),
  ('Thai', 'thai', 'hourly'),
  ('Transkripsjonstjenester', 'transkripsjonstjenester', 'hourly'),
  ('Tsjekkisk', 'tsjekkisk', 'hourly'),
  ('Tyrkisk', 'tyrkisk', 'hourly'),
  ('Tysk', 'tysk', 'hourly'),
  ('Vietnamesisk', 'vietnamesisk', 'hourly'),
  ('Walisisk', 'walisisk', 'hourly')) AS v(name, slug, pricing)
WHERE c.slug = 'sprak'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Stylist', 'stylist', 350)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Brudestylist', 'brudestylist', 'fixed'),
  ('Extensions-spesialist', 'extensions-spesialist', 'fixed'),
  ('Fargespesialist', 'fargespesialist', 'fixed'),
  ('Makeup-artist', 'makeup-artist', 'fixed'),
  ('Neglestylist', 'neglestylist', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'stylist'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Tak og tekking', 'tak-og-tekking', 360)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Flatt tak og takpapp', 'flatt-tak-og-takpapp', 'fixed'),
  ('Montering av tegltak', 'montering-av-tegltak', 'fixed'),
  ('Takreparasjon', 'takreparasjon', 'fixed'),
  ('Taktekker', 'taktekker', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'tak-og-tekking'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Transport og bud', 'transport-og-bud', 370)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Godstransport', 'godstransport', 'fixed'),
  ('Kjøp og hent-tjenester', 'kjop-og-hent-tjenester', 'fixed'),
  ('Levering av pakker', 'levering-av-pakker', 'fixed'),
  ('Varetransport', 'varetransport', 'fixed')) AS v(name, slug, pricing)
WHERE c.slug = 'transport-og-bud'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;

INSERT INTO public.categories (name, slug, sort_order) VALUES ('Underholdning', 'underholdning', 380)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.subcategories (category_id, name, slug, default_pricing_type)
SELECT c.id, v.name, v.slug, v.pricing::public.pricing_type
FROM public.categories c
CROSS JOIN (VALUES
  ('Ansiktsmaling', 'ansiktsmaling', 'quote'),
  ('Ballongkunstneri', 'ballongkunstneri', 'quote'),
  ('Ballongtwister', 'ballongtwister', 'quote'),
  ('Bobleblåsing', 'bobleblasing', 'quote'),
  ('Danseunderholdning', 'danseunderholdning', 'quote'),
  ('Dukketeater', 'dukketeater', 'quote'),
  ('Eventunderholdning', 'eventunderholdning', 'quote'),
  ('Fotoboks', 'fotoboks', 'quote'),
  ('Fyrverkeri', 'fyrverkeri', 'quote'),
  ('Hoppeslott', 'hoppeslott', 'quote'),
  ('Klovneunderholdning', 'klovneunderholdning', 'quote'),
  ('Komikere', 'komikere', 'quote'),
  ('Kroppsmaling', 'kroppsmaling', 'quote'),
  ('Lasershow', 'lasershow', 'quote'),
  ('Magedans', 'magedans', 'quote'),
  ('MC og verter', 'mc-og-verter', 'quote'),
  ('Miming', 'miming', 'quote'),
  ('Ponniridning', 'ponniridning', 'quote'),
  ('Portrettkunstneri', 'portrettkunstneri', 'quote'),
  ('Sirkusskuespill', 'sirkusskuespill', 'quote'),
  ('Skuespiller', 'skuespiller', 'quote'),
  ('Standupkomiker', 'standupkomiker', 'quote'),
  ('Tatovør', 'tatovor', 'quote'),
  ('Tryllekunstner', 'tryllekunstner', 'quote'),
  ('Utleie av lokale', 'utleie-av-lokale', 'quote')) AS v(name, slug, pricing)
WHERE c.slug = 'underholdning'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  default_pricing_type = EXCLUDED.default_pricing_type;
