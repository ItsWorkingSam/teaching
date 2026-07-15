/* ============================================================
   Spelling content, all graded sets.
   Missing-letter questions use `pattern` ("sep_rate"): "_" marks a
   blank, every other character is shown. Much safer than indices.
   ============================================================ */

window.SPELLING_SETS = {

	/* ==========================================================
	   STEP 1 (Starting Points) — 3 to 4 letter words
	   ========================================================== */

	"step1-1": {
		meta: { title: "Step 1 · Set 1", subtitle: "Short, everyday words of three and four letters.", level: "Step 1" },
		questions: [
			{ type: "dictation", word: "cat", sentence: "The cat is black.", hint: "Three sounds: c, a, t." },
			{ type: "missing", word: "sun", pattern: "s_n", hint: "The middle sound is 'u', like in 'fun'." },
			{ type: "unscramble", word: "dog", hint: "A pet that barks. Starts with 'd'." },
			{ type: "dictation", word: "bed", sentence: "I sleep in my bed.", hint: "b, e, d." },
			{ type: "missing", word: "cup", pattern: "c_p", hint: "The middle sound is 'u'." },
			{ type: "plural", singular: "cat", answer: "cats", hint: "For most words, just add 's'." },
			{ type: "unscramble", word: "hat", hint: "You wear it on your head." },
			{ type: "dictation", word: "box", sentence: "Put the toy in the box.", hint: "Ends with the 'x' sound." },
			{ type: "missing", word: "red", pattern: "r_d", hint: "The middle sound is 'e', like in 'bed'." },
			{ type: "plural", singular: "dog", answer: "dogs", hint: "Just add 's': dog, dogs." }
		]
	},

	"step1-2": {
		meta: { title: "Step 1 · Set 2", subtitle: "More short words, plus a first look at plurals.", level: "Step 1" },
		questions: [
			{ type: "dictation", word: "pig", sentence: "The pig is pink.", hint: "p, i, g." },
			{ type: "unscramble", word: "hen", hint: "A female chicken." },
			{ type: "missing", word: "van", pattern: "v_n", hint: "The middle sound is 'a'." },
			{ type: "dictation", word: "run", sentence: "I like to run fast.", hint: "r, u, n." },
			{ type: "plural", singular: "fox", answer: "foxes", hint: "Words ending in 'x' add 'es': fox, foxes." },
			{ type: "missing", word: "top", pattern: "t_p", hint: "The middle sound is 'o'." },
			{ type: "unscramble", word: "mud", hint: "Wet, dirty ground." },
			{ type: "dictation", word: "log", sentence: "The log is by the tree.", hint: "l, o, g." },
			{ type: "plural", singular: "pig", answer: "pigs", hint: "Just add 's': pig, pigs." },
			{ type: "missing", word: "jam", pattern: "j_m", hint: "The middle sound is 'a'." }
		]
	},

	"step1-3": {
		meta: { title: "Step 1 · Set 3", subtitle: "Short words with tricky endings like 's' and 'gg'.", level: "Step 1" },
		questions: [
			{ type: "dictation", word: "bus", sentence: "I ride the bus to town.", hint: "b, u, s." },
			{ type: "missing", word: "net", pattern: "n_t", hint: "The middle sound is 'e'." },
			{ type: "unscramble", word: "web", hint: "A spider makes one." },
			{ type: "dictation", word: "egg", sentence: "I ate an egg for breakfast.", hint: "Double 'g' at the end: e, g, g." },
			{ type: "plural", singular: "bus", answer: "buses", hint: "Words ending in 's' add 'es': bus, buses." },
			{ type: "missing", word: "leg", pattern: "l_g", hint: "The middle sound is 'e'." },
			{ type: "unscramble", word: "pen", hint: "You write with it." },
			{ type: "dictation", word: "mug", sentence: "The tea is in the mug.", hint: "m, u, g." },
			{ type: "plural", singular: "bat", answer: "bats", hint: "Just add 's': bat, bats." },
			{ type: "missing", word: "arm", pattern: "a_m", hint: "The middle sound is 'r'." }
		]
	},

	/* ==========================================================
	   STEP 2 — common 5 to 7 letter words
	   ========================================================== */

	"step2-1": {
		meta: { title: "Step 2 · Set 1", subtitle: "Common words you read and write every day.", level: "Step 2" },
		questions: [
			{ type: "dictation", word: "happy", sentence: "She feels very happy today.", hint: "Double 'p' in the middle." },
			{ type: "missing", word: "water", pattern: "wat_r", hint: "The missing letter is 'e': wat-e-r." },
			{ type: "unscramble", word: "apple", hint: "A round fruit. Double 'p'." },
			{ type: "choice", options: ["freind", "friend", "frend", "friund"], answer: "friend", hint: "Remember: a friend is there to the 'end'." },
			{ type: "missing", word: "school", pattern: "sch__l", hint: "Two 'o's in the middle: sch-oo-l." },
			{ type: "plural", singular: "baby", answer: "babies", hint: "Consonant + y: change y to i and add 'es'." },
			{ type: "dictation", word: "garden", sentence: "We play in the garden.", hint: "gar, den." },
			{ type: "homophone", before: "I have ", after: " apples in my bag.", options: ["two", "to", "too"], answer: "two", hint: "The number 2 is spelled 't, w, o'." },
			{ type: "unscramble", word: "tiger", hint: "A big striped cat." },
			{ type: "missing", word: "yellow", pattern: "y_ll_w", hint: "The colour of the sun: y-e-ll-o-w." }
		]
	},

	"step2-2": {
		meta: { title: "Step 2 · Set 2", subtitle: "Everyday words plus your first homophones.", level: "Step 2" },
		questions: [
			{ type: "dictation", word: "family", sentence: "My family is very big.", hint: "fam, i, ly." },
			{ type: "missing", word: "pretty", pattern: "pr_tty", hint: "The missing letter is 'e'. Double 't'." },
			{ type: "unscramble", word: "orange", hint: "A fruit and a colour." },
			{ type: "choice", options: ["peeple", "people", "pepole", "peaple"], answer: "people", hint: "It looks odd, but it's p, e, o, p, l, e." },
			{ type: "plural", singular: "city", answer: "cities", hint: "Consonant + y: change y to i and add 'es'." },
			{ type: "homophone", before: "Can you ", after: " me from there?", options: ["hear", "here"], answer: "hear", hint: "You 'hear' with your ear. Both have 'ear'." },
			{ type: "dictation", word: "window", sentence: "Please open the window.", hint: "win, dow." },
			{ type: "missing", word: "little", pattern: "li__le", hint: "Double 't' in the middle: li-tt-le." },
			{ type: "unscramble", word: "planet", hint: "Earth is one of these." },
			{ type: "plural", singular: "box", answer: "boxes", hint: "Words ending in 'x' add 'es'." }
		]
	},

	"step2-3": {
		meta: { title: "Step 2 · Set 3", subtitle: "Longer common words and a few tricky endings.", level: "Step 2" },
		questions: [
			{ type: "dictation", word: "because", sentence: "I stayed inside because of the rain.", hint: "be, cause." },
			{ type: "missing", word: "animal", pattern: "an_mal", hint: "The missing letter is 'i': an-i-mal." },
			{ type: "unscramble", word: "dinner", hint: "The evening meal. Double 'n'." },
			{ type: "choice", options: ["sistir", "sister", "sester", "sistur"], answer: "sister", hint: "Ends with 'er', like 'brother'." },
			{ type: "homophone", before: "The ", after: " is bright in the sky.", options: ["sun", "son"], answer: "sun", hint: "The one in the sky is s, u, n." },
			{ type: "plural", singular: "party", answer: "parties", hint: "Consonant + y: change y to i and add 'es'." },
			{ type: "dictation", word: "market", sentence: "We buy food at the market.", hint: "mar, ket." },
			{ type: "missing", word: "pocket", pattern: "po_ket", hint: "The missing letter is 'c': po-c-ket." },
			{ type: "unscramble", word: "bridge", hint: "You cross a river on it." },
			{ type: "plural", singular: "leaf", answer: "leaves", hint: "Words ending in 'f' often change to 'ves'." }
		]
	},

	/* ==========================================================
	   STEP 3 — everyday words with a spelling challenge and first rules
	   ========================================================== */

	"step3-1": {
		meta: { title: "Step 3 · Set 1", subtitle: "Familiar words plus your first spelling rules.", level: "Step 3" },
		questions: [
			{ type: "dictation", word: "before", sentence: "Wash your hands before dinner.", hint: "Two parts: be + fore." },
			{ type: "missing", word: "answer", pattern: "ans_er", hint: "There is a silent 'w': ans-W-er." },
			{ type: "choice", options: ["beutiful", "beautiful", "beatiful", "buetiful"], answer: "beautiful", hint: "It starts with the word 'beauty': beau-ti-ful." },
			{ type: "homophone", before: "Please ", after: " your name at the top.", options: ["write", "right"], answer: "write", hint: "'write' has a silent 'w', like in a letter you write." },
			{ type: "unscramble", word: "number", hint: "You count with these." },
			{ type: "suffix", base: "hope", suffix: "ing", answer: "hoping", rule: "Drop the silent 'e' before adding '-ing'.", hint: "hope loses its 'e': hop-ing." },
			{ type: "dictation", word: "important", sentence: "This is an important message.", hint: "im + port + ant." },
			{ type: "plural", singular: "story", answer: "stories", hint: "Consonant + y: change y to i and add 'es'." },
			{ type: "missing", word: "because", pattern: "be_ause", hint: "The missing letter is 'c': be-C-ause." },
			{ type: "homophone", before: "I would love to come ", after: ", if that's okay.", options: ["too", "to", "two"], answer: "too", hint: "'too' means 'also'. Extra 'o' for the extra meaning." }
		]
	},

	"step3-2": {
		meta: { title: "Step 3 · Set 2", subtitle: "Double letters, silent letters and '-tion' endings.", level: "Step 3" },
		questions: [
			{ type: "dictation", word: "different", sentence: "We chose a different colour.", hint: "Double 'f': di-ff-erent." },
			{ type: "missing", word: "question", pattern: "ques_ion", hint: "The 'tion' ending sounds like 'shun': ques-T-ion." },
			{ type: "choice", options: ["adress", "address", "adres", "addres"], answer: "address", hint: "Double 'd' and double 's'." },
			{ type: "homophone", before: "I ", after: " the answer to that one.", options: ["know", "no"], answer: "know", hint: "'know' has a silent 'k' and is about knowledge." },
			{ type: "unscramble", word: "listen", hint: "There is a silent 't': lis-ten." },
			{ type: "suffix", base: "stop", suffix: "ed", answer: "stopped", rule: "One vowel + one consonant: double the last letter before '-ed'.", hint: "stop, stopped (double 'p')." },
			{ type: "dictation", word: "remember", sentence: "Please remember to call me.", hint: "re + member." },
			{ type: "plural", singular: "dish", answer: "dishes", hint: "Words ending in 'sh' add 'es': dish, dishes." },
			{ type: "missing", word: "morning", pattern: "morn_ng", hint: "The missing letter is 'i': morn-I-ng." },
			{ type: "homophone", before: "Put the bags over ", after: ", by the wall.", options: ["there", "their", "they're"], answer: "there", hint: "'there' points to a place, like 'here' with a 't'." }
		]
	},

	"step3-3": {
		meta: { title: "Step 3 · Set 3", subtitle: "More rules, homophones and plurals.", level: "Step 3" },
		questions: [
			{ type: "dictation", word: "together", sentence: "Let's work on it together.", hint: "to + get + her." },
			{ type: "missing", word: "science", pattern: "sc_ence", hint: "It starts with 'sci': sc-I-ence." },
			{ type: "choice", options: ["favrite", "favourite", "faverite", "favourit"], answer: "favourite", hint: "It has 'our' in the middle: favo-U-Rite." },
			{ type: "homophone", before: "Come and sit ", after: " next to me.", options: ["here", "hear"], answer: "here", hint: "'here' is a place, like 'there' and 'where'." },
			{ type: "unscramble", word: "holiday", hint: "Two parts: holi + day." },
			{ type: "suffix", base: "happy", suffix: "ly", answer: "happily", rule: "Consonant + y: change y to i before '-ly'.", hint: "happy becomes happi: happ-i-ly." },
			{ type: "dictation", word: "yesterday", sentence: "It rained all day yesterday.", hint: "yester + day." },
			{ type: "plural", singular: "wolf", answer: "wolves", hint: "Words ending in 'f' often change to 'ves'." },
			{ type: "missing", word: "knowledge", pattern: "kn_wledge", hint: "Silent 'k', and it contains the word 'know'." },
			{ type: "homophone", before: "There are seven days in a ", after: ".", options: ["week", "weak"], answer: "week", hint: "A 'week' has days (ee). 'weak' means not strong (ea)." }
		]
	},

	/* ==========================================================
	   STEP 4 — a wider range of commonly misspelled words
	   ========================================================== */

	"step4-1": {
		meta: { title: "Step 4 · Set 1", subtitle: "Words people get wrong all the time.", level: "Step 4" },
		questions: [
			{ type: "dictation", word: "necessary", sentence: "It is necessary to bring a pen and paper.", hint: "One c, two s's. Trick: 'one Collar, two Sleeves'." },
			{ type: "choice", options: ["definately", "definitely", "definitly", "defenitely"], answer: "definitely", hint: "It hides the word 'finite'. No 'a' anywhere." },
			{ type: "missing", word: "separate", pattern: "sep_rate", hint: "There's 'a rat' in sep-A-Rate." },
			{ type: "homophone", before: "The dog wagged ", after: " tail happily.", options: ["its", "it's"], answer: "its", hint: "\"it's\" always means \"it is\". Here we mean the tail belonging to the dog." },
			{ type: "unscramble", word: "rhythm", hint: "No standard vowels. 'Rhythm Helps Your Two Hips Move'." },
			{ type: "suffix", base: "happy", suffix: "ness", answer: "happiness", rule: "Consonant + y: change the y to i before the ending.", hint: "happy becomes happi, then happiness." },
			{ type: "dictation", word: "embarrass", sentence: "Don't embarrass yourself in front of the class.", hint: "Double r AND double s." },
			{ type: "plural", singular: "knife", answer: "knives", hint: "Words ending in 'fe' change to 'ves'." },
			{ type: "choice", options: ["accomodate", "acommodate", "accommodate", "acomodate"], answer: "accommodate", hint: "Big enough to fit two c's AND two m's." },
			{ type: "homophone", before: "", after: " going to love this show.", options: ["Their", "There", "They're"], answer: "They're", hint: "Split it into 'They are'." },
			{ type: "missing", word: "occurrence", pattern: "oc_ur_ence", hint: "Double c and double r: oc-CUR-rence." },
			{ type: "suffix", base: "run", suffix: "ing", answer: "running", rule: "Short word, one vowel + one consonant: double the last letter.", hint: "run becomes running." },
			{ type: "dictation", word: "government", sentence: "The government announced a new plan today.", hint: "Don't forget the hidden n: govern-ment." },
			{ type: "correct", before: "We ate at a lovely ", wrong: "resturant", after: " by the beach.", answer: "restaurant", hint: "There's an 'au' in the middle: rest-AU-rant." },
			{ type: "homophone", before: "", after: " book is on the table.", options: ["Your", "You're"], answer: "Your", hint: "'You're' means 'you are'. The book belongs to you." },
			{ type: "plural", singular: "potato", answer: "potatoes", hint: "potato, tomato and hero all add 'es'." }
		]
	},

	"step4-2": {
		meta: { title: "Step 4 · Set 2", subtitle: "Double letters, silent letters and easy-to-muddle words.", level: "Step 4" },
		questions: [
			{ type: "dictation", word: "privilege", sentence: "It is a privilege to be here.", hint: "Ends '-lege', not '-ledge'. No 'd'." },
			{ type: "choice", options: ["reccomend", "recomend", "recommend", "reccommend"], answer: "recommend", hint: "One c, two m's." },
			{ type: "missing", word: "conscience", pattern: "cons_ience", hint: "Hidden 'science' inside: con-SCIENCE." },
			{ type: "homophone", before: "The medicine had a strong ", after: ".", options: ["affect", "effect"], answer: "effect", hint: "'effect' is the result (a noun). 'affect' is the action (a verb)." },
			{ type: "unscramble", word: "foreign", hint: "From another country. 'e' before 'i' here." },
			{ type: "suffix", base: "argue", suffix: "ment", answer: "argument", rule: "'argue' drops its 'e' before '-ment'.", hint: "No 'e': arg-U-ment." },
			{ type: "dictation", word: "maintenance", sentence: "Car maintenance is important.", hint: "main, ten, ance. Ends '-ance'." },
			{ type: "plural", singular: "analysis", answer: "analyses", hint: "Words ending '-is' change to '-es': analysis, analyses." },
			{ type: "missing", word: "believe", pattern: "bel__ve", hint: "'i' before 'e': bel-IE-ve." },
			{ type: "choice", options: ["suprise", "surprise", "surprize", "surprice"], answer: "surprise", hint: "Two r's you can hear: sur-PRISE." },
			{ type: "homophone", before: "The bus ", after: " the stop without stopping.", options: ["past", "passed"], answer: "passed", hint: "'passed' is the past tense of the verb 'to pass'." },
			{ type: "dictation", word: "environment", sentence: "We must protect the environment.", hint: "Don't drop the hidden 'n': enviro-N-ment." }
		]
	},

	"step4-3": {
		meta: { title: "Step 4 · Set 3", subtitle: "Tricky endings, doubles and confusing pairs.", level: "Step 4" },
		questions: [
			{ type: "dictation", word: "parliament", sentence: "The parliament passed a new law.", hint: "Hidden 'i': parl-I-ament." },
			{ type: "missing", word: "beginning", pattern: "begin_ing", hint: "Double 'n': begin-N-ing." },
			{ type: "choice", options: ["neccessary", "necessary", "necesary", "neccesary"], answer: "necessary", hint: "One c, two s's." },
			{ type: "homophone", before: "", after: " car is very fast.", options: ["Your", "You're"], answer: "Your", hint: "The car belongs to you. 'You're' means 'you are'." },
			{ type: "unscramble", word: "weird", hint: "This one breaks the rule: 'e' before 'i'." },
			{ type: "suffix", base: "begin", suffix: "ing", answer: "beginning", rule: "Stressed short ending: double the final consonant.", hint: "begin becomes beginning (double n)." },
			{ type: "dictation", word: "guarantee", sentence: "We guarantee a good service.", hint: "Starts 'gua'. Double 'e' at the end." },
			{ type: "plural", singular: "crisis", answer: "crises", hint: "Words ending '-is' change to '-es': crisis, crises." },
			{ type: "correct", before: "The ", wrong: "wether", after: " was cold and wet.", answer: "weather", hint: "It has 'eat' in it: w-EAT-her." },
			{ type: "missing", word: "immediately", pattern: "im_ediately", hint: "Double 'm': i-MM-ediately." },
			{ type: "homophone", before: "The team lost ", after: " final game.", options: ["its", "it's"], answer: "its", hint: "The game belonging to the team, so no apostrophe." },
			{ type: "dictation", word: "exaggerate", sentence: "Don't exaggerate the story.", hint: "Double 'g': exa-GG-erate." }
		]
	},

	/* ==========================================================
	   STEPS 5 to 6 — advanced and often-misspelled words
	   ========================================================== */

	"step5-1": {
		meta: { title: "Steps 5–6 · Set 1", subtitle: "Advanced words that catch out even good spellers.", level: "Steps 5–6" },
		questions: [
			{ type: "dictation", word: "conscientious", sentence: "She is a conscientious worker.", hint: "Built on 'conscience' plus 'tious'." },
			{ type: "choice", options: ["beaurocracy", "bureaucracy", "bureacracy", "buraucracy"], answer: "bureaucracy", hint: "Starts 'bureau' (like a bureau or desk)." },
			{ type: "missing", word: "pronunciation", pattern: "pron_nciation", hint: "It's 'nun', not 'nounce': pro-NUN-ciation." },
			{ type: "homophone", before: "Please be ", after: " about this news.", options: ["discreet", "discrete"], answer: "discreet", hint: "'discreet' means careful or tactful. 'discrete' means separate." },
			{ type: "unscramble", word: "vacuum", hint: "Double 'u' in the middle." },
			{ type: "suffix", base: "nine", suffix: "th", answer: "ninth", rule: "'nine' drops its 'e' before '-th'.", hint: "No 'e': n, i, n, th." },
			{ type: "dictation", word: "liaison", sentence: "She works as the liaison officer.", hint: "Two i's: li, a, i, son." },
			{ type: "plural", singular: "phenomenon", answer: "phenomena", hint: "From Greek: '-on' becomes '-a'." },
			{ type: "correct", before: "He ", wrong: "recieved", after: " first prize.", answer: "received", hint: "'i' before 'e' except after 'c': rec-EI-ved." },
			{ type: "missing", word: "millennium", pattern: "mil_en_ium", hint: "Double 'l' and double 'n': mi-LL-e-NN-ium." },
			{ type: "homophone", before: "The ", after: " of the school gave a speech.", options: ["principal", "principle"], answer: "principal", hint: "The principAL is your PAL. A 'principle' is a rule." },
			{ type: "dictation", word: "mischievous", sentence: "The mischievous puppy hid my shoe.", hint: "mis, chie, vous. No 'i' before 'ous'." }
		]
	},

	"step5-2": {
		meta: { title: "Steps 5–6 · Set 2", subtitle: "Long words, irregular plurals and tricky pairs.", level: "Steps 5–6" },
		questions: [
			{ type: "dictation", word: "acknowledgement", sentence: "Thank you for the acknowledgement.", hint: "Hidden 'knowledge': ac-KNOWLEDGE-ment." },
			{ type: "choice", options: ["miniscule", "minuscule", "minescule", "minniscule"], answer: "minuscule", hint: "It comes from 'minus': min-U-scule." },
			{ type: "missing", word: "perseverance", pattern: "persever_nce", hint: "Ends '-ance', not '-ence': persever-A-nce." },
			{ type: "homophone", before: "I bought ", after: " such as pens and paper.", options: ["stationary", "stationery"], answer: "stationery", hint: "stationERy has papER. 'stationary' means not moving." },
			{ type: "unscramble", word: "yacht", hint: "A sailing boat. Silent 'ch'." },
			{ type: "suffix", base: "true", suffix: "ly", answer: "truly", rule: "'true' drops its 'e' before '-ly'.", hint: "No 'e': t, r, u, ly." },
			{ type: "dictation", word: "Mediterranean", sentence: "We sailed across the Mediterranean.", hint: "One 'd', one 't', double 'r': Medi-terr-anean." },
			{ type: "plural", singular: "cactus", answer: "cacti", hint: "Latin word: '-us' becomes '-i'." },
			{ type: "correct", before: "It was an ", wrong: "akward", after: " moment for everyone.", answer: "awkward", hint: "There's a 'w' after the 'a': a-W-kward." },
			{ type: "missing", word: "noticeable", pattern: "notic_able", hint: "Keep the 'e' after 'c' to keep it soft: notic-E-able." },
			{ type: "homophone", before: "She gave me a lovely ", after: " about my work.", options: ["complement", "compliment"], answer: "compliment", hint: "A complIment is praise: 'I like it'." },
			{ type: "dictation", word: "indispensable", sentence: "A good map is indispensable when hiking.", hint: "Ends '-able', not '-ible'." }
		]
	},

	"step5-3": {
		meta: { title: "Steps 5–6 · Set 3", subtitle: "The really tough ones, for spelling black belts only.", level: "Steps 5–6" },
		questions: [
			{ type: "dictation", word: "questionnaire", sentence: "Please fill in the questionnaire.", hint: "Double 'n': question-NN-aire." },
			{ type: "choice", options: ["supercede", "supersede", "superceed", "supersead"], answer: "supersede", hint: "The only English word ending in '-sede'." },
			{ type: "missing", word: "camouflage", pattern: "cam_uflage", hint: "camo, u, flage: the missing letter is 'o'." },
			{ type: "homophone", before: "They chose a ", after: " for the new house.", options: ["cite", "site", "sight"], answer: "site", hint: "A building 'site'. 'cite' means quote; 'sight' means seeing." },
			{ type: "unscramble", word: "hierarchy", hint: "A ranking or order. Starts 'hier'." },
			{ type: "suffix", base: "courage", suffix: "ous", answer: "courageous", rule: "Keep the 'e' after 'g' to keep the sound soft.", hint: "courag-E-ous." },
			{ type: "dictation", word: "entrepreneur", sentence: "She is a successful entrepreneur.", hint: "entre, pre, neur." },
			{ type: "plural", singular: "criterion", answer: "criteria", hint: "From Greek: '-on' becomes '-a'." },
			{ type: "correct", before: "The two events were held ", wrong: "seperate", after: ".", answer: "separate", hint: "There's 'a rat' in sep-A-Rate." },
			{ type: "missing", word: "conscious", pattern: "cons_ious", hint: "Has 'scious' in it: con-SCIOUS." },
			{ type: "homophone", before: "The police found ", after: " goods in the car.", options: ["elicit", "illicit"], answer: "illicit", hint: "'illicit' means illegal. 'elicit' means to draw out." },
			{ type: "dictation", word: "pharaoh", sentence: "The pharaoh ruled ancient Egypt.", hint: "Ends in a silent 'h': phar, a, oh." }
		]
	}
};

/* Tiers, in order, for the picker page.
   Mapped to the Learning Progressions for Adult Literacy
   (Write to Communicate, Spelling), Steps 1 to 6 plus Starting Points. */
window.SPELLING_TIERS = [
	{
		name: "Starting Points · Step 1",
		badge: "3–4 letter words",
		icon: "ph-seedling",
		blurb: "Sounding out and building short, high-frequency words.",
		sets: ["step1-1", "step1-2", "step1-3"]
	},
	{
		name: "Step 2",
		badge: "Everyday words",
		icon: "ph-sun",
		blurb: "Common everyday words, plurals and familiar spelling patterns.",
		sets: ["step2-1", "step2-2", "step2-3"]
	},
	{
		name: "Step 3",
		badge: "Everyday rules",
		icon: "ph-pencil-simple",
		blurb: "Familiar words with a challenge, plus your first spelling rules and homophones.",
		sets: ["step3-1", "step3-2", "step3-3"]
	},
	{
		name: "Step 4",
		badge: "Commonly misspelled",
		icon: "ph-medal",
		blurb: "A wider range of words, applying prefixes, suffixes and rules.",
		sets: ["step4-1", "step4-2", "step4-3"]
	},
	{
		name: "Steps 5–6",
		badge: "Advanced",
		icon: "ph-fire",
		blurb: "Irregular, specialised and technical words for confident spellers.",
		sets: ["step5-1", "step5-2", "step5-3"]
	}
];
