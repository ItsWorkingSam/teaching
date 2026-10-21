/* ============================================================
   Word Detective content. Six levels of grammar and punctuation.
   Three kinds of question:
     spot:   tap the word that's wrong. `wrong` is that word exactly as
             it appears (without punctuation after it), `fix` replaces it.
     choose: pick the word for the gap ("___").
     pick:   pick the sentence that's written correctly. `answer` is
             the index of the right one (they're shuffled on screen).
   Every question needs a `why`: a short, friendly explanation.
   Each sentence should have exactly one mistake.
   ============================================================ */

window.WORD_DETECTIVE = [
	{
		name: "Capital letters",
		blurb: "Names, places, days and full stops",
		items: [
			{ spot: "We went to the beach in raglan on Sunday.", wrong: "raglan", fix: "Raglan", why: "Names of places start with a capital letter." },
			{ spot: "My cousin aroha is coming to stay.", wrong: "aroha", fix: "Aroha", why: "People's names start with a capital letter." },
			{ spot: "Last weekend i went fishing with my dad.", wrong: "i", fix: "I", why: "When you write about yourself, “I” is always a capital letter." },
			{ spot: "The All Blacks play on saturday night.", wrong: "saturday", fix: "Saturday", why: "Days of the week start with a capital letter." },
			{ spot: "Matariki is usually in june.", wrong: "june", fix: "June", why: "Months start with a capital letter." },
			{ spot: "We flew from Auckland to christchurch.", wrong: "christchurch", fix: "Christchurch", why: "Towns and cities start with a capital letter." },
			{ spot: "My neighbour speaks te reo Māori and english.", wrong: "english", fix: "English", why: "Languages start with a capital letter." },
			{ spot: "the bus leaves at half past eight.", wrong: "the", fix: "The", why: "Every sentence starts with a capital letter." },
			{ spot: "Is your appointment on Monday or tuesday?", wrong: "tuesday", fix: "Tuesday", why: "Days of the week start with a capital letter." },
			{ spot: "We visited lake Taupō in the holidays.", wrong: "lake", fix: "Lake", why: "“Lake” is part of the name here, so it gets a capital too: Lake Taupō." },
			{ spot: "Our new doctor is called dr Patel.", wrong: "dr", fix: "Dr", why: "Titles before a name, like Dr, Mrs and Mr, start with a capital letter." },
			{ spot: "She works at the hospital in Hamilton On weekdays.", wrong: "On", fix: "on", why: "Ordinary words in the middle of a sentence don't need a capital letter." },
			{ spot: "I love going to the Beach in summer.", wrong: "Beach", fix: "beach", why: "“beach” is an ordinary word here, not a name, so no capital letter." },
			{ pick: ["We had fish and chips for tea.", "we had fish and chips for tea.", "We had fish and chips for tea"], answer: 0, why: "A sentence starts with a capital letter and ends with a full stop." },
			{ pick: ["My birthday is in March.", "My birthday is in march.", "my Birthday is in March."], answer: 0, why: "Months get a capital letter. Ordinary words like “birthday” don't." },
			{ pick: ["Can you pick up some milk on the way home?", "Can you pick up some milk on the way home.", "can you pick up some milk on the way home?"], answer: 0, why: "A question starts with a capital letter and ends with a question mark." }
		]
	},
	{
		name: "Sound-alikes",
		blurb: "to/too/two, there/their/they're and more",
		items: [
			{ choose: "We are going ___ the marae on Saturday.", options: ["to", "too", "two"], answer: "to", why: "“to” shows where you're going. “too” means also or very. “two” is the number 2." },
			{ choose: "Can I come ___?", options: ["to", "too", "two"], answer: "too", why: "“too” means “as well” here." },
			{ choose: "I bought ___ pies for lunch.", options: ["to", "too", "two"], answer: "two", why: "“two” is the number 2." },
			{ choose: "The water was ___ cold to swim in.", options: ["to", "too", "two"], answer: "too", why: "“too” means “more than you want” here: too cold, too hot, too late." },
			{ choose: "The kids left ___ jackets at school.", options: ["their", "there", "they're"], answer: "their", why: "“their” means it belongs to them." },
			{ choose: "Put the box over ___ by the door.", options: ["their", "there", "they're"], answer: "there", why: "“there” is a place. It has “here” inside it: t-HERE." },
			{ choose: "___ coming over for a barbecue later.", options: ["Their", "There", "They're"], answer: "They're", why: "“They're” is short for “they are”." },
			{ choose: "Is this ___ phone?", options: ["your", "you're"], answer: "your", why: "“your” means it belongs to you." },
			{ choose: "Let me know when ___ ready.", options: ["your", "you're"], answer: "you're", why: "“you're” is short for “you are”. Try saying “you are ready”." },
			{ choose: "I don't ___ the answer.", options: ["no", "know"], answer: "know", why: "“know” is about knowing something. “no” is the opposite of yes." },
			{ choose: "___ did you park the car?", options: ["Where", "Were", "Wear"], answer: "Where", why: "“Where” asks about a place." },
			{ choose: "We ___ late because of the traffic.", options: ["where", "were", "wear"], answer: "were", why: "“were” is the past of “are”: we are late, we were late." },
			{ choose: "You'll need to ___ a hat in the sun.", options: ["where", "were", "wear"], answer: "wear", why: "“wear” is what you do with clothes." },
			{ choose: "Can you ___ me at the back?", options: ["hear", "here"], answer: "hear", why: "You hear with your ear, and “hear” has “ear” in it." },
			{ spot: "I left my keys over their on the bench.", wrong: "their", fix: "there", why: "It's a place, so it's “there”. “their” means belonging to them." },
			{ spot: "Your welcome to stay for dinner.", wrong: "Your", fix: "You're", why: "It means “you are welcome”, so it's “You're”." }
		]
	},
	{
		name: "Apostrophes",
		blurb: "it's/its, owning things and short forms",
		items: [
			{ choose: "The dog wagged ___ tail.", options: ["its", "it's"], answer: "its", why: "“its” means belonging to it, with no apostrophe. “it's” always means “it is” or “it has”." },
			{ choose: "___ raining again in Wellington.", options: ["Its", "It's"], answer: "It's", why: "“It's” is short for “it is”. Try it: it is raining." },
			{ spot: "The cat hurt it's paw.", wrong: "it's", fix: "its", why: "The paw belongs to the cat, so it's “its” with no apostrophe. “it's” only means “it is”." },
			{ pick: ["It's time to go.", "Its time to go.", "Its' time to go."], answer: 0, why: "It means “it is time to go”, so it's “It's”." },
			{ pick: ["My sister's car is red.", "My sisters car is red.", "My sister,s car is red."], answer: 0, why: "To show something belongs to someone, add an apostrophe and s: my sister's car." },
			{ choose: "Is this ___ bag?", options: ["Tama's", "Tamas", "Tamas'"], answer: "Tama's", why: "The bag belongs to Tama, so add 's: Tama's bag." },
			{ choose: "My ___ house is in Nelson.", options: ["uncle's", "uncles", "uncles's"], answer: "uncle's", why: "The house belongs to one uncle: uncle's." },
			{ choose: "The ___ toys are all over the floor.", options: ["children's", "childrens'", "childrens"], answer: "children's", why: "“children” already means more than one, so just add 's: children's." },
			{ spot: "We need to buy apple's and bananas.", wrong: "apple's", fix: "apples", why: "For more than one of something, just add s. No apostrophe: apples." },
			{ spot: "The bakery sells pie's and sandwiches.", wrong: "pie's", fix: "pies", why: "More than one pie is “pies”. An apostrophe never makes a plural." },
			{ spot: "I've got three brother's.", wrong: "brother's", fix: "brothers", why: "It just means more than one brother, so no apostrophe: brothers." },
			{ spot: "I cant find my wallet.", wrong: "cant", fix: "can't", why: "“can't” is short for “cannot”. The apostrophe shows where letters are missing." },
			{ spot: "Dont forget your togs.", wrong: "Dont", fix: "Don't", why: "“Don't” is short for “do not”. The apostrophe goes where the o is missing." },
			{ spot: "Mum's car wont start.", wrong: "wont", fix: "won't", why: "“won't” is short for “will not”, so it needs an apostrophe." },
			{ choose: "We ___ be late.", options: ["won't", "wont", "w'ont"], answer: "won't", why: "“won't” means “will not”. The apostrophe goes before the t." },
			{ choose: "They ___ seen the movie yet.", options: ["haven't", "havent", "have'nt"], answer: "haven't", why: "“haven't” is “have not”. The apostrophe goes where the o is missing: have(n)o(t) → haven't." }
		]
	},
	{
		name: "Verbs",
		blurb: "was/were, did/done, should have",
		items: [
			{ choose: "We ___ at the park yesterday.", options: ["was", "were"], answer: "were", why: "Use “were” with we, you and they. Use “was” with I, he, she and it." },
			{ choose: "She ___ really tired after work.", options: ["was", "were"], answer: "was", why: "Use “was” with I, he, she and it." },
			{ spot: "I should of called you sooner.", wrong: "of", fix: "have", why: "It's “should have”. Said quickly it sounds like “should of”, but “of” is never right here." },
			{ spot: "We could of won the game.", wrong: "of", fix: "have", why: "It's “could have” (or “could've”). “could of” is a common mistake." },
			{ spot: "I seen that movie last week.", wrong: "seen", fix: "saw", why: "Use “saw” on its own: I saw it. Use “seen” with have: I have seen it." },
			{ choose: "Have you ___ your homework?", options: ["did", "done"], answer: "done", why: "Use “done” after have or has: have you done it?" },
			{ choose: "He ___ the dishes after dinner.", options: ["did", "done"], answer: "did", why: "Use “did” on its own: he did the dishes." },
			{ spot: "They have went to the shops.", wrong: "went", fix: "gone", why: "After have or has, use “gone”: they have gone. Use “went” on its own: they went." },
			{ choose: "I ___ a new phone yesterday.", options: ["bought", "brought"], answer: "bought", why: "“bought” is from buy (you paid for it). “brought” is from bring." },
			{ choose: "Please ___ a plate to the shared lunch.", options: ["bring", "brought", "bought"], answer: "bring", why: "It's happening in the future, so “bring”. Bring a plate means bring some food to share." },
			{ choose: "My brothers ___ playing touch rugby.", options: ["is", "are"], answer: "are", why: "More than one brother, so “are”." },
			{ spot: "She don't like spiders.", wrong: "don't", fix: "doesn't", why: "Use “doesn't” with he, she and it: she doesn't like spiders." },
			{ choose: "I have ___ here for ten years.", options: ["lived", "live", "living"], answer: "lived", why: "After “have”, use the past form: I have lived here." },
			{ spot: "He has broke his arm.", wrong: "broke", fix: "broken", why: "After has or have, use “broken”: he has broken it." },
			{ choose: "The bus ___ late every morning.", options: ["come", "comes"], answer: "comes", why: "One bus, so add an s: the bus comes." },
			{ pick: ["Hemi and I went to the game.", "Me and Hemi went to the game.", "Hemi and me went to the game."], answer: 0, why: "Take Hemi out and check: “I went to the game”, not “me went”. It's polite to put the other person first." }
		]
	},
	{
		name: "Punctuation",
		blurb: "Commas, question marks and speech",
		items: [
			{ pick: ["We need bread, milk, eggs and butter.", "We need bread milk eggs and butter.", "We need, bread, milk, eggs, and, butter."], answer: 0, why: "Put commas between things in a list. Before the last one, “and” does the job." },
			{ pick: ["I'd like a pie, a flat white and a muffin, please.", "I'd like a pie a flat white and a muffin please.", "I'd like, a pie a flat white, and a muffin please."], answer: 0, why: "Commas separate the things in a list, and one goes before “please” at the end." },
			{ pick: ["What time does the pool open?", "What time does the pool open.", "What time does the pool open!"], answer: 0, why: "A question ends with a question mark." },
			{ pick: ["Where are you going?", "Where are you going.", "Where are you, going?"], answer: 0, why: "It's a question, so it ends with a question mark, and no comma is needed." },
			{ pick: ["Watch out!", "Watch out?", "watch out!"], answer: 0, why: "A warning or strong feeling ends with an exclamation mark, and starts with a capital." },
			{ pick: ["“Can you help me?” asked Ana.", "“Can you help me? asked Ana.”", "Can you help me? “asked Ana.”"], answer: 0, why: "Speech marks go around only the words someone says, with the question mark inside." },
			{ pick: ["She said, “See you tomorrow.”", "She said “see you tomorrow”.", "She said, see you tomorrow."], answer: 0, why: "Put a comma before the speech, speech marks around the words, and a capital to start them." },
			{ pick: ["It was raining. We stayed inside.", "It was raining we stayed inside.", "It was raining, we stayed inside"], answer: 0, why: "These are two complete sentences, so they need a full stop between them, not a comma." },
			{ pick: ["Kia ora, Mere. How are you?", "Kia ora Mere how are you?", "Kia ora, Mere how are you."], answer: 0, why: "Put a comma before the name of the person you're talking to, and end the question with a question mark." },
			{ pick: ["I wanted to go. However, it was too late.", "I wanted to go however it was too late.", "I wanted to go, however it was too late."], answer: 0, why: "“However” starts a new sentence and has a comma after it." },
			{ pick: ["After the game, we went home.", "After the game we, went home.", "After, the game we went home."], answer: 0, why: "When a sentence starts with “After the game” or “When it rained”, put the comma after that part." },
			{ pick: ["My nan, who lives in Napier, is 90.", "My nan who lives in Napier, is 90.", "My nan, who lives in Napier is 90."], answer: 0, why: "Extra information in the middle of a sentence gets a comma on both sides." },
			{ pick: ["You will need three things: a hat, sunscreen and water.", "You will need: three things a hat, sunscreen and water.", "You will need three things, a hat; sunscreen and water."], answer: 0, why: "A colon (:) introduces a list after a complete statement." },
			{ pick: ["Yes, I can come on Friday.", "Yes I can, come on Friday.", "Yes I can come, on Friday."], answer: 0, why: "Put a comma after “Yes” or “No” at the start of an answer." },
			{ pick: ["We were tired, so we went home.", "We were tired so, we went home.", "We were tired, so, we went home."], answer: 0, why: "The comma goes before “so” when it joins two parts of a sentence." }
		]
	},
	{
		name: "Tricky pairs",
		blurb: "practise/practice, affect/effect and more",
		items: [
			{ choose: "I need to ___ the piano every day.", options: ["practise", "practice"], answer: "practise", why: "In NZ English, practise with an s is the doing word (verb). Practice with a c is the thing (noun)." },
			{ choose: "Netball ___ is on Tuesday.", options: ["practice", "practise"], answer: "practice", why: "Here it's a thing (noun), so it's practice with a c. Same as advice, a thing with a c." },
			{ choose: "Have you got your driver's ___?", options: ["licence", "license"], answer: "licence", why: "In NZ English, a licence (the card) is spelled with a c. “license” with an s is the American spelling." },
			{ choose: "Can I give you some ___?", options: ["advice", "advise"], answer: "advice", why: "“advice” (with a c) is the thing you give. “advise” (with an s) is the doing word." },
			{ choose: "I would ___ you to book early.", options: ["advise", "advice"], answer: "advise", why: "Here it's the doing word, so “advise” with an s." },
			{ choose: "The cold weather can ___ your health.", options: ["affect", "effect"], answer: "affect", why: "“affect” is usually the doing word (verb). “effect” is usually the result (noun). A for action, E for end result." },
			{ choose: "The new rule had a big ___.", options: ["effect", "affect"], answer: "effect", why: "“effect” is the result. “a big effect”, “side effects”." },
			{ choose: "Don't ___ your keys!", options: ["lose", "loose"], answer: "lose", why: "“lose” (one o) means you can't find it, or you didn't win. “loose” (two o's) means not tight." },
			{ choose: "This tooth is ___.", options: ["loose", "lose"], answer: "loose", why: "“loose” means not tight or wobbly." },
			{ choose: "My brother is taller ___ me.", options: ["than", "then"], answer: "than", why: "“than” compares things. “then” is about time: first this, then that." },
			{ choose: "___ jacket is this?", options: ["Whose", "Who's"], answer: "Whose", why: "“Whose” asks who something belongs to. “Who's” means “who is”." },
			{ choose: "___ coming to the hāngī?", options: ["Who's", "Whose"], answer: "Who's", why: "“Who's” is short for “who is”: who is coming?" },
			{ choose: "There are ___ people here than last year.", options: ["fewer", "less"], answer: "fewer", why: "Use “fewer” for things you can count (people, cars). Use “less” for things you can't (traffic, water)." },
			{ choose: "There's ___ traffic today.", options: ["less", "fewer"], answer: "less", why: "You can't count traffic, so “less”." },
			{ choose: "Can you ___ me your pen?", options: ["lend", "borrow"], answer: "lend", why: "You lend something to someone. You borrow something from someone." },
			{ choose: "Could I ___ your pen?", options: ["borrow", "lend"], answer: "borrow", why: "You borrow from someone, so: could I borrow your pen?" },
			{ spot: "We saw lots of tuis in the bush.", wrong: "tuis", fix: "tūī", why: "Māori words don't add an s for more than one: one tūī, lots of tūī. Use macrons where they belong." }
		]
	}
];
