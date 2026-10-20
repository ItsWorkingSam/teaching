"""
Build the Spelling Bee word packs (js/bee-words/level-N.js).

The site is 100% static, so every word, definition and example sentence is
generated here once and committed. Nothing is fetched at runtime.

Sources (all free to use; credited on spellingbee.html):
  - Tatoeba (CC BY 2.0 FR): example sentences
  - WordNet 3.0 (Princeton, WordNet licence): word list and definitions
  - wordfreq (Robyn Speer, CC BY-SA 4.0 data): how common each word is
  - CMU Pronouncing Dictionary (BSD): finding sound-alike words
  - SCOWL / Hunspell en_GB-ise and en_US (read with spylls): NZ/UK
    spelling check, plus accepted US spellings ("color" for "colour")
  - LDNOOBW "en" list (CC BY 4.0): profanity filter

Setup (once):
  python -m venv .venv
  .venv/Scripts/pip install wordfreq nltk spylls
  .venv/Scripts/python -c "import nltk; nltk.download('wordnet'); nltk.download('cmudict')"
  npm pack dictionary-en-gb dictionary-en      # then untar each
  curl -O https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2
  curl -o badwords.txt https://raw.githubusercontent.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/master/en

Run (--gb / --us are the hunspell paths without .dic/.aff):
  python tools/build_bee_words.py --gb en-gb/index --us en/index \
      --blocklist badwords.txt --sentences eng_sentences.tsv.bz2

Takes a few minutes; the Tatoeba scan is cached beside the download.
"""

import argparse
import bz2
import json
import re
from functools import lru_cache
from pathlib import Path

from nltk.corpus import cmudict
from nltk.corpus import wordnet as wn
from spylls.hunspell import Dictionary
from wordfreq import top_n_list, zipf_frequency as _zipf

LEVELS = 7
POOL_ZIPF = 3.0         # rarer words are left out unless they are CLASSICS
MIN_ZIPF = 2.2          # below this most people have never seen the word
OUT_DIR = Path(__file__).resolve().parent.parent / "js" / "bee-words"

# Classic spelling-bee and commonly misspelled words. Always included if a
# sentence can be found, however rare they are.
CLASSICS = set("""
    accommodate accidentally achieve acquaintance acquire address aggressive
    amateur apparent argument awkward beautiful because beginning believe
    bizarre broccoli bureaucracy business calendar camouflage cemetery
    changeable colleague colonel committee conscience conscientious conscious
    consensus definitely desperate dilemma disappear disappoint discipline
    embarrass environment exaggerate exhilarate existence familiar fascinate
    february fluorescent foreign forty friend fulfil gauge government grammar
    guarantee guard harass height hierarchy humorous hygiene hypocrisy
    immediately independent indispensable intelligence interrupt irresistible
    jewellery judgement knowledge laboratory leisure liaison library licence
    lieutenant lightning maintenance manoeuvre mediocre millennium miniature
    mischievous misspell necessary neighbour noticeable occasion occurrence
    onomatopoeia parallel parliament pastime persevere pharaoh phenomenon
    playwright possession precede privilege pronunciation publicly questionnaire
    queue receipt receive recommend reference relevant restaurant rhyme rhythm
    sacrilegious schedule scissors separate sergeant siege silhouette sincerely
    souvenir strength succeed supersede surprise threshold tomorrow tongue
    truly twelfth tyranny unnecessary vacuum vegetable vehicle weird whether
    wednesday yacht zucchini
""".split())

# Words WordNet or the frequency list will happily offer that don't belong
# in a classroom, on top of the LDNOOBW list.
EXTRA_BLOCK = set("""
    abortion bastard bitch bloody crap damn darn piss slut whore
    nazi rape raped rapist incest molest paedophile pedophile porn
    cocaine heroin meth suicide genocide lynch negro coon spic wop kike
    gook chink dyke fag faggot homo tranny retard retarded spastic midget
    cripple gypsy eskimo hottentot pygmy harlot strumpet wench
    trollop hussy floozy jism semen sperm penis vagina scrotum testicle
    breast nipple orgasm erection condom masturbate fellatio sodomy
    buttock buttocks bum arse anus rectum fart turd urine vomit
    dickhead goddamn goddam jackass dumbass bra pee poo vaginal urinary
    contraceptive contraception seduce seductive suicidal drugged sexy
""".split())

# Sentences mentioning these are skipped: the audience includes teenagers
# and older learners, and nobody needs "Tom was killed" read out to them.
# Nationalities and religions are here because Tatoeba sentences about
# them are too often opinions ("I hate ... food").
SENTENCE_BLOCK = set("""
    kill killed kills killing killer murder murdered suicide sex sexy naked
    drunk gun guns shoot shot rape raped drug drugs hate hated hates stupid
    idiot die died dies dying dead death bomb beat beaten hit slap slapped
    knife blood bloody war battle executed terrorist prison jail police
    god jesus christ allah church priest pray prayer devil hell damn
    pregnant bra pee kiss kissed lover lovers girlfriend boyfriend
    beer wine vodka whisky alcohol drinking cigarette cigarettes
    ugly fat dumb crazy divorce cheat cheated
    mexican american americans british french german chinese japanese
    russian jewish jews muslim muslims christian christians arab african
    gay lesbian
""".split())
FILTER_VERSION = 2       # bump when sentence filtering changes (busts the cache)

# Definitions containing these suggest a slur or crude word.
BAD_DEF = re.compile(
    r"\b(offensive|derogatory|disparaging|vulgar|obscene|slur|"
    r"slang|taboo|sexual|genital|copulat|prostitut|excrement)\w*",
    re.I,
)

@lru_cache(maxsize=None)
def zipf_frequency(w, lang):
    return _zipf(w, lang)


INFLECT = ("s", "es", "ed", "d", "ing", "er", "ers", "y", "ies", "ned")

# GB -> US spelling rules: (regex on the GB word, replacement, also ok in GB?)
GB_TO_US = [
    (r"our(s?)$", r"or\1", False), (r"our(?=[a-z])", "or", False),
    (r"ise$", "ize", True), (r"ised$", "ized", True), (r"ising$", "izing", True),
    (r"isation", "ization", True), (r"yse$", "yze", False),
    (r"tre$", "ter", False), (r"ogue$", "og", False),
    (r"ence$", "ense", False),
    (r"ll(ed|er|ing|ers)$", r"l\1", False),
    (r"ae", "e", False), (r"oe(?=[a-z])", "e", False),
    (r"amme$", "am", False), (r"dgement$", "dgment", True),
    (r"eable$", "able", True), (r"fil$", "fill", False),
    (r"ellery$", "elry", False), (r"ourite$", "orite", False),
]


class Speller:
    """A Hunspell dictionary. Lookups are lower-case only, so names and
    places (capitalised in the dictionary) are rejected."""

    def __init__(self, base):
        dic = Dictionary.from_files(base)
        self.ok = lru_cache(maxsize=None)(lambda w: bool(dic.lookup(w)))
        self.stems = set()
        for line in Path(base + ".dic").read_text(encoding="utf-8", errors="ignore").splitlines()[1:]:
            stem = line.split("/", 1)[0].strip()
            if stem.isalpha() and stem.islower():
                self.stems.add(stem)


def us_variants(word, gb, us):
    out = set()
    for pat, rep, ok_in_gb in GB_TO_US:
        alt = re.sub(pat, rep, word)
        if alt == word:
            continue
        if (us.ok(alt) and not gb.ok(alt)) or (ok_in_gb and gb.ok(alt)):
            out.add(alt)
    return sorted(out)


def build_us_to_gb(gb, us):
    """Map US-only spellings back to GB, used to tidy definitions."""
    mapping = {}
    for g in gb.stems:
        for pat, rep, _ in GB_TO_US:
            alt = re.sub(pat, rep, g)
            if alt != g and us.ok(alt) and not gb.ok(alt):
                mapping.setdefault(alt, g)
    return mapping


def gbify(text, us_to_gb):
    def fix(m):
        tok = m.group(0)
        low = tok.lower()
        rep = us_to_gb.get(low)
        if rep is None:
            for suf in ("s", "es", "ed", "d", "ing", "er", "ers", "ation", "ations"):
                if not low.endswith(suf):
                    continue
                base = low[: -len(suf)]
                if base in us_to_gb:
                    rep = us_to_gb[base] + suf
                elif base + "e" in us_to_gb:          # organized -> organis(e)+d
                    rep = us_to_gb[base + "e"][:-1] + suf
                if rep:
                    break
        if rep is None:
            return tok
        return rep.capitalize() if tok[0].isupper() else rep
    return re.sub(r"[A-Za-z]+", fix, text)


# Spelling patterns that trip people up, weighted roughly by how often they
# cause mistakes. Used on top of rarity and length.
TRICKY = [
    (r"(.)\1", 0.7),                     # double letters
    (r"ough|augh|eigh|igh", 0.9),
    (r"^ps|^pn|^kn|^gn|^wr|mb$|mn$|bt|stle$", 1.0),  # silent letters
    (r"ph|rh|ch(?=[aeiou])|gh", 0.5),
    (r"ei|ie", 0.6),
    (r"sc[eiy]", 0.9),
    (r"ious$|eous$|uous$|cious$|tious$", 0.8),
    (r"[ae]nce$|[ae]nt$|[ae]ncy$", 0.7),
    (r"[ai]ble$", 0.7),
    (r"[^aeiou]y[^aeiou]|^y[^aeiou]", 0.5),
    (r"qu|que$", 0.5),
    (r"ae|oe|eau|ieu|oeu", 1.0),
    (r"([^aeiou])\1[aeiou].*([^aeiou])\2", 1.0),   # accommodate / committee
    (r"[aeiou]{3}", 0.6),
    (r"sion$|tion$|cian$", 0.3),
]


def tricky_score(w):
    return sum(weight for pat, weight in TRICKY if re.search(pat, w))


def difficulty(w, zipf, syllables):
    rarity = max(0.0, 7.0 - zipf)        # 0 = very common
    return rarity * 1.0 + len(w) * 0.45 + syllables * 0.3 + tricky_score(w) * 1.2


def syllable_count(prons, w):
    if prons:
        return sum(ch[-1].isdigit() for ch in prons[0])
    return max(1, len(re.findall(r"[aeiouy]+", w)))


POS = {"n": "noun", "v": "verb", "a": "adjective", "s": "adjective", "r": "adverb"}
FORM_LABEL = {"n": "noun (plural)", "v": "verb (another form)", "a": "adjective (another form)"}


def best_sense(word, pos=None, also=()):
    """Most-used sense of `word` (SemCor counts). `also` lists other
    spellings WordNet may file the counts under ("color" for "colour").
    With no counts at all, the plainest of the first few senses wins."""
    forms = {word, *also}
    scored = []
    for i, syn in enumerate(wn.synsets(word, pos=pos)):
        if syn.instance_hypernyms():        # a named person or place
            continue
        names = [l for l in syn.lemmas() if l.name().lower() in forms]
        if not names:
            continue
        scored.append((sum(l.count() for l in names), i, syn))
    if not scored:
        return None
    top = max(n for n, _, _ in scored)
    if top > 0:
        return min((i, syn) for n, i, syn in scored if n == top)[1]
    first = sorted(scored, key=lambda x: x[1])[:3]
    return min(first, key=lambda x: (len(x[2].definition()), x[1]))[2]


def wordnet_example(syn, word, blocked):
    pat = re.compile(rf"\b{re.escape(word)}\b", re.I)
    for ex in syn.examples() if syn else []:
        others = set(re.findall(r"[a-z]+", ex.lower())) - {word}
        if others & (blocked | SENTENCE_BLOCK):
            continue
        if pat.search(ex) and 12 <= len(ex) <= 140:
            return tidy_sentence(ex)
    return None


def tidy_sentence(ex):
    ex = ex.strip().strip('"').strip()
    ex = ex[0].upper() + ex[1:]
    if ex[-1] not in ".!?":
        ex += "."
    return ex


PLAIN_ENDINGS = ("s", "es", "ed", "d", "ing", "er", "est", "r", "st")


def plain_inflection(w):
    """True for tested / sessions / walking: base word + ending, no change."""
    for pos in ("n", "v", "a"):
        # _morphy lists every base, even when w is itself a lemma ("roads").
        for base in wn._morphy(w, pos):
            if base != w and w in {base + e for e in PLAIN_ENDINGS}:
                return True
    return False


# Never innocent inside another word, so matched anywhere.
EMBEDDED_BLOCK = ("shit", "fuck", "cunt", "nigg", "twat", "wank", "slut", "whore", "porn", "bitch")


def is_blocked(w, blocked):
    if w in blocked or any(b in w for b in EMBEDDED_BLOCK):
        return True
    for pos in ("n", "v", "a"):
        if wn.morphy(w, pos) in blocked:
            return True
    # damned, bitchy, shitting (doubled final letter)
    return any(w == b + suf or w == b + b[-1] + suf
               for b in blocked if len(b) >= 4 for suf in INFLECT)


def collect_candidates(gb, us, blocked, prons):
    """word -> dict(zipf, syn, p) for everything worth considering."""
    out = {}

    def ok(w):
        if not (w.isalpha() and w.islower() and 3 <= len(w) <= 16) or is_blocked(w, blocked):
            return False
        # Short words need to be genuinely common, or the list fills with
        # abbreviations and borrowings (sup, tau, pas).
        if len(w) <= 4 and zipf_frequency(w, "en") < 3.6:
            return False
        if re.fullmatch(r"[ivxlcdm]+", w) and w not in prons:    # xvi
            return False
        return True

    # 1. WordNet base words.
    for lemma in wn.all_lemma_names():
        w = lemma.lower()
        if w in out or not ok(w) or not gb.ok(w):
            continue
        zipf = zipf_frequency(w, "en")
        if zipf < MIN_ZIPF and w not in CLASSICS:
            continue
        if plain_inflection(w):
            continue
        if any(BAD_DEF.search(s.definition()) for s in wn.synsets(w)):
            continue
        syn = best_sense(w, also=us_variants(w, gb, us))
        if syn is None:
            continue
        out[w] = {"zipf": zipf, "syn": syn, "p": POS[syn.pos()]}

    # 2. Common words WordNet leaves out: function words (because, their,
    #    through) and inflections where the spelling changes (stopped,
    #    making, happier, children). Plain base+s / +ed / +ing are skipped.
    for w in top_n_list("en", 40000):
        if w in out or not ok(w):
            continue
        zipf = zipf_frequency(w, "en")
        if zipf < 3.3:
            continue
        if not gb.ok(w):
            continue
        if plain_inflection(w):
            continue
        if not wn.synsets(w):
            if w in CLASSICS or zipf >= 4.0:
                out[w] = {"zipf": zipf, "syn": None, "p": None}
            continue
        for pos in ("v", "n", "a"):
            base = wn.morphy(w, pos)
            if not base or base == w or base not in out:
                continue
            if w in {base + e for e in PLAIN_ENDINGS}:
                break
            syn = best_sense(base, pos)
            if syn is None or BAD_DEF.search(syn.definition()):
                break
            out[w] = {"zipf": zipf, "syn": syn, "p": FORM_LABEL[pos]}
            break
    return out


def find_sentences(path, words, blocked):
    """Best Tatoeba sentence per word: short, plain, common vocabulary."""
    best = {}
    tok_re = re.compile(r"[A-Za-z]+(?:'[a-z]+)?")
    with bz2.open(path, "rt", encoding="utf-8") as f:
        for line in f:
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 3:
                continue
            s = parts[2].strip()
            if not (20 <= len(s) <= 100) or not re.fullmatch(r"[A-Za-z ,.'?!-]+", s):
                continue
            if s[0].islower() or s[-1] not in ".?!":
                continue
            raw = tok_re.findall(s)
            if not (5 <= len(raw) <= 14):
                continue
            toks = [t.lower() for t in raw]
            # Capitalised mid-sentence means a name ("Christian Bale").
            names = {t.lower() for t in raw[1:] if t[0].isupper() and t != "I"}
            if any(t in blocked or t in SENTENCE_BLOCK for t in toks):
                continue
            hits = [t for t in set(toks) if t in words]
            if not hits:
                continue
            # Simpler surrounding words make a better clue.
            freqs = [zipf_frequency(t, "en") for t in toks]
            for w in hits:
                if toks.count(w) != 1 or w in names:
                    continue
                others = [z for t, z in zip(toks, freqs) if t != w]
                hardest = min(others) if others else 7
                score = (7 - hardest) * 2 + abs(len(toks) - 9) * 0.4
                if w not in best or score < best[w][0]:
                    best[w] = (score, s)
    return {w: v[1] for w, v in best.items()}


def homophones(word, prons, sound_index):
    if word not in prons:
        return []
    alikes = sound_index.get(" ".join(prons[word][0]), set()) - {word}
    return sorted(alikes)[:3]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--gb", required=True)
    ap.add_argument("--us", required=True)
    ap.add_argument("--blocklist", required=True)
    ap.add_argument("--sentences", required=True)
    args = ap.parse_args()

    gb = Speller(args.gb)
    us = Speller(args.us)
    us_to_gb = build_us_to_gb(gb, us)
    blocked = {l.strip().lower() for l in Path(args.blocklist).read_text(encoding="utf-8").splitlines() if l.strip()}
    blocked |= EXTRA_BLOCK

    prons = cmudict.dict()
    cands = collect_candidates(gb, us, blocked, prons)
    print(f"candidates: {len(cands)}")
    # The Tatoeba scan takes a few minutes; cache it beside the download and
    # only rescan for words the cache hasn't seen.
    cache = Path(f"{args.sentences}.best-v{FILTER_VERSION}.json")
    cached = json.loads(cache.read_text(encoding="utf-8")) if cache.exists() else {"words": [], "best": {}}
    missing = set(cands) - set(cached["words"])
    if missing:
        cached["best"].update(find_sentences(args.sentences, missing, blocked))
        cached["words"] = sorted(set(cached["words"]) | missing)
        cache.write_text(json.dumps(cached), encoding="utf-8")
    sentences = cached["best"]
    print(f"with Tatoeba sentence: {sum(w in sentences for w in cands)}")

    sound_index = {}
    for w, ps in prons.items():
        if not w.isalpha() or is_blocked(w, blocked):
            continue
        z = zipf_frequency(w, "en")
        if (len(w) >= 3 and z >= 3.5 and w in cands) or (len(w) == 2 and z >= 5.0):
            sound_index.setdefault(" ".join(ps[0]), set()).add(w)

    entries = []
    for w, c in cands.items():
        s = sentences.get(w) or wordnet_example(c["syn"], w, blocked)
        if not s:
            continue
        entry = {"w": w}
        if c["p"]:
            entry["p"] = c["p"]
        if c["syn"] is not None:
            entry["d"] = gbify(c["syn"].definition(), us_to_gb)
        entry["s"] = gbify(s, us_to_gb)
        alts = us_variants(w, gb, us)
        if alts:
            entry["a"] = alts
        alike = [h for h in homophones(w, prons, sound_index) if h not in alts]
        if alike:
            entry["h"] = alike
        entries.append({
            "entry": entry,
            "zipf": c["zipf"],
            "score": difficulty(w, c["zipf"], syllable_count(prons.get(w), w)),
            "classic": w in CLASSICS,
        })

    # Drop the rarer of variant pairs both valid in GB (judgement/judgment).
    zipf_of = {e["entry"]["w"]: e["zipf"] for e in entries}
    entries = [e for e in entries
               if not any(zipf_of.get(a, -1) > e["zipf"] for a in e["entry"].get("a", []))]

    pool = [e for e in entries if e["zipf"] >= POOL_ZIPF or e["classic"]]
    pool.sort(key=lambda e: e["score"])
    print(f"pool: {len(pool)} ({sum(e['classic'] for e in pool)} classics)")

    per = len(pool) // LEVELS
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for lvl in range(LEVELS):
        chunk = pool[lvl * per:(lvl + 1) * per] if lvl < LEVELS - 1 else pool[lvl * per:]
        words = [e["entry"] for e in chunk]   # easiest to hardest
        body = json.dumps(words, ensure_ascii=False, separators=(",", ":"))
        (OUT_DIR / f"level-{lvl + 1}.js").write_text(
            "/* Generated by tools/build_bee_words.py. Do not edit by hand. */\n"
            f"(window.BEE_WORDS = window.BEE_WORDS || {{}})[{lvl + 1}] = {body};\n",
            encoding="utf-8",
        )
        sample = ", ".join(w["w"] for w in words[:: max(1, len(words) // 10)])
        print(f"level {lvl + 1}: {len(words)} words  e.g. {sample}")


if __name__ == "__main__":
    main()
