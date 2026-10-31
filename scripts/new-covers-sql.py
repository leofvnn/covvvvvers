"""Builds supabase/new-covers.sql from researched cover entries (JSON files given as arguments).

Each cover is inserted without an image; the admin page's "Fetch cover art" tool then
copies its front cover from the Cover Art Archive and the cover goes live.
Existing slugs are skipped, so the file is safe to run more than once.
"""
import json, re, sys, unicodedata, datetime

TYPES = {
    "portrait": "818f66a4-a51e-4b8b-b515-691d9aba254d",
    "photograph": "27d91a37-0b27-477a-b65d-82e9697175da",
    "painting": "6cbdce99-93a5-4ccd-adbc-b5e907e3ee7e",
    "illustration": "cac97ec2-47e9-4562-b1b0-ebb5ae534086",
    "group-photograph": "0eb085f8-d7ea-47e5-8c4a-bf504de1773f",
    "graphic-design": "c0217d82-6644-4ea9-99d1-67b7e9dbe7a7",
    "collage": "2a9002ef-8700-4b4b-bc97-eae22cc36802",
    "digital-art": "464ed954-6e08-4d0e-84ab-1a736b658cd3",
    "typography": "4450e9cf-43d6-481d-b606-2e75cef9e7f9",
    "film-still": "55ba40d7-5946-4af0-878f-e0d24ecb6f71",
    "childhood-photo": "52e1479f-82f9-46b7-86e4-f22d676e06cc",
    "sculpture": "fe0a06f7-7dc0-4ce2-a96b-221dbc0d00d9",
    "archival-photo": "dad05a73-56a1-4791-ba0a-64cfbc2ad929",
}
BANNED = [("—", "em dash"), ("rather than", "'rather than'")]

def slugify(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").lower().replace("&", "and").replace("$", "s")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")

def q(v):
    if v is None:
        return "null"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"

def arr(xs):
    return "array[" + ",".join(q(x) for x in xs) + "]::text[]" if xs else "'{}'::text[]"

entries, problems = [], []
for path in sys.argv[1:]:
    entries += json.load(open(path))

existing = set(sys.stdin.read().split()) if not sys.stdin.isatty() else set()
seen = set()
for e in entries:
    # Same style as the rest of the collection: the title alone, with the artist added only if taken.
    e["slug"] = slugify(e["title"])
    text = e.get("essay_html") or ""
    for bad, label in BANNED:
        if bad in text or bad in (e.get("credits_text") or ""):
            problems.append(f"{e['title']}: contains {label}")
    if re.search(r"\bnot (just |only )?[^.,;]{1,40}?,? but\b", text, re.I):
        problems.append(f"{e['title']}: possible 'not X but Y'")
    if text.count("<p>") != 3:
        problems.append(f"{e['title']}: {text.count('<p>')} paragraphs")
    if e.get("cover_type") not in TYPES:
        problems.append(f"{e['title']}: unknown cover type {e.get('cover_type')}")

now = datetime.datetime(2026, 10, 31, 6, 0, tzinfo=datetime.timezone.utc)
out = [
    "-- New covers from the hip-hop history list.",
    "-- Run once in the Supabase SQL editor. Covers are added without images and stay hidden",
    "-- until the admin page's \"Fetch cover art\" tool gives each one its front cover.",
    "",
    "alter table public.covers alter column image_url drop not null;",
    "",
]
added = 0
for i, e in enumerate(entries):
    if e["slug"] in existing or e["slug"] in seen:
        e["slug"] = slugify(e["artist"] + " " + e["title"])
    if e["slug"] in existing or e["slug"] in seen:
        continue
    seen.add(e["slug"])
    added += 1
    year = int(e["release_year"])
    created = (now - datetime.timedelta(minutes=37 * i)).isoformat()
    out.append(
        "insert into public.covers (slug,title,artist,release_year,decade,label,country,cover_type_id,subgenres,credits_text,description_html,image_url,status,created_at) values ("
        + ",".join([
            q(e["slug"]), q(e["title"]), q(e["artist"]), q(year), q(f"{year // 10 * 10}s"), q(e.get("label")), q(e.get("country")),
            q(TYPES.get(e.get("cover_type"))), arr(e.get("subgenres") or []), q(e.get("credits_text")), q(e.get("essay_html")),
            "null", q("published"), q(created),
        ])
        + ") on conflict (slug) do nothing;"
    )
    for c in e.get("creators") or []:
        cs = slugify(c["name"])
        out.append(f"insert into public.creators (slug,name,role) values ({q(cs)},{q(c['name'])},{q(c.get('role'))}) on conflict (slug) do nothing;")
        out.append(
            f"insert into public.cover_creators (cover_id,creator_id) select v.id, c.id from public.covers v, public.creators c where v.slug = {q(e['slug'])} and c.slug = {q(cs)} on conflict do nothing;"
        )
    out.append("")

open("supabase/new-covers.sql", "w").write("\n".join(out))
print(f"{len(entries)} entries, {added} added to supabase/new-covers.sql")
for p in problems:
    print("PROBLEM:", p)
