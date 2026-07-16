/* ============================================================
   Spot the Scam — scenario content.

   Examples are based on real scam patterns documented by NZ
   agencies (CERT NZ / Own Your Online, Netsafe, Consumer Protection)
   and by banks. They are recreations for teaching: all links are
   inert and no real logos are used. A few messages are genuine, so
   learners practise telling the difference rather than assuming
   everything is a scam.

   Types:
     judge  — Scam or Genuine? Reveals the warning (or reassuring) signs.
     action — What is the safest thing to do? Multiple choice.
     spot   — Tap the biggest warning sign in the message.

   Channels: sms, email, popup, call.
   ============================================================ */

window.SCAM_SCENARIOS = [

	{
		type: "judge",
		verdict: "scam",
		message: {
			channel: "sms",
			from: "+63 917 4420",
			body: "NZ POST: Your package could not be delivered due to an unpaid delivery fee of $1.35. Please pay to reschedule: https://nzpost-redelivery.info"
		},
		flags: [
			"You weren't expecting to pay a fee, and real couriers don't text a link to collect a small 'fee'.",
			"The web address is nzpost-redelivery.info, not the real nzpost.co.nz.",
			"The sender is an overseas mobile number, not an official NZ Post sender."
		],
		action: "Don't tap the link. If you're expecting a parcel, check it using the tracking number on the official NZ Post website or app."
	},

	{
		type: "judge",
		verdict: "safe",
		message: {
			channel: "sms",
			from: "ANZ",
			body: "ANZ: A payment of $80.00 to Countdown was made from your account today. If this wasn't you, call us on the number on the back of your card."
		},
		flags: [
			"There is no link to tap and nothing to download.",
			"It doesn't ask for any password, PIN or code.",
			"It tells you to call the number on the back of your card, not a number it provides."
		],
		action: "This looks genuine. Even so, if any bank message worries you, call the number on the back of your card to check."
	},

	{
		type: "judge",
		verdict: "scam",
		message: {
			channel: "email",
			fromName: "Inland Revenue Department",
			fromAddress: "refunds@ird-taxservice.com",
			subject: "Tax refund notification: $612.90 owed to you",
			body: "Our records show you are owed a refund of $612.90. To receive your payment, confirm your bank account details within 24 hours or the refund will be cancelled. Claim your refund now."
		},
		flags: [
			"IRD never tells you a refund amount in an email or text.",
			"The sender address ends in ird-taxservice.com, not @ird.govt.nz.",
			"It asks for your bank details and sets a 24-hour deadline to rush you."
		],
		action: "Don't click anything. Log in to myIR yourself at ird.govt.nz to check. IRD will never ask for your banking password."
	},

	{
		type: "action",
		message: {
			channel: "sms",
			from: "+64 21 555 0199",
			body: "Hi Mum, I dropped my phone down the loo and I'm on a mate's phone. This is my new number. I'm locked out of my banking, can you pay a $340 bill for me today? I'll pay you back xx"
		},
		prompt: "What is the safest thing to do?",
		options: [
			"Reply and arrange to pay, since your child needs help",
			"Call your child on their usual number to check it's really them",
			"Reply asking what the bill is for",
			"Save the new number and pay them later"
		],
		answer: 1,
		why: "This is the 'Hi Mum' scam. Someone pretends to be a family member with a new number and an urgent money problem. Always check by contacting the person on their known number, or another way, before sending any money."
	},

	{
		type: "judge",
		verdict: "scam",
		message: {
			channel: "popup",
			title: "⚠ Windows Security Alert",
			body: "Your computer has been blocked due to suspicious activity. 5 viruses have been detected. Call Microsoft Support now on 0800 555 019. Do NOT turn off your computer.",
			button: "Call support now"
		},
		flags: [
			"Real virus warnings don't appear as web pop-ups with a phone number to call.",
			"It uses fear and tells you not to restart, so you can't stop and think.",
			"Microsoft and Apple never ask you to ring a number shown in a pop-up."
		],
		action: "Don't call the number. Close the tab or the browser. If it won't close, restart your computer. Nothing was actually wrong."
	},

	{
		type: "spot",
		message: {
			channel: "sms",
			from: "Parcel Services",
			body: "Your delivery is on its way. Track your parcel here: track-nz-parcels.co/xz92"
		},
		prompt: "Tap the biggest warning sign in this message.",
		candidates: [
			{ text: "The web address “track-nz-parcels.co”", correct: true, note: "Yes. That is not an official courier website. The safest habit is to always check where a link really goes before tapping." },
			{ text: "The phrase “Your delivery is on its way”", correct: false, note: "This part sounds normal. Real notifications say this too. The web address is the real giveaway." },
			{ text: "The tracking code “xz92”", correct: false, note: "A tracking code by itself is normal. The web address is what makes this suspicious." }
		]
	},

	{
		type: "judge",
		verdict: "scam",
		message: {
			channel: "sms",
			from: "NZTA",
			body: "You have an outstanding toll of $4.80. Failure to pay within 48 hours will result in a $150 penalty. Pay now: nzta.tolls-payment.cc"
		},
		flags: [
			"A tiny toll paired with a large threatened fine is a classic scam pattern.",
			"The link nzta.tolls-payment.cc is not the official nzta.govt.nz.",
			"The threat and the deadline are there to make you act without checking."
		],
		action: "Don't pay through the link. Check whether you actually have any tolls directly at nzta.govt.nz."
	},

	{
		type: "judge",
		verdict: "safe",
		message: {
			channel: "email",
			fromName: "Auckland Libraries",
			fromAddress: "no-reply@aucklandlibraries.govt.nz",
			subject: "Your reserved item is ready to collect",
			body: "Kia ora, the book you reserved is now ready to collect at the Central City Library. It will be held for you for 7 days. No action is needed online."
		},
		flags: [
			"It doesn't ask for money, passwords or personal details.",
			"The sender address ends in a real aucklandlibraries.govt.nz domain.",
			"There is no urgent threat and nothing you're pushed to click."
		],
		action: "This is a normal notification. If you were ever unsure, you could contact the library using the details on their official website."
	},

	{
		type: "action",
		message: {
			channel: "call",
			caller: "Caller ID: “ANZ Bank”",
			lines: [
				"“Hello, I'm calling from the ANZ fraud team. We've spotted a suspicious payment on your account.”",
				"“To stop it, I just need you to confirm your internet banking password, and read back the code we've just texted you.”"
			]
		},
		prompt: "What should you do?",
		options: [
			"Give the code and password so they can stop the fraud",
			"Hang up and call your bank on the number on the back of your card",
			"Give the code but not the password",
			"Ask for their staff ID first, then give the details"
		],
		answer: 1,
		why: "Your bank will never ask for your password or a one-time code. Hang up and call back using the number on your card or the bank's official website. Scammers can sound convincing and even fake the name that shows on caller ID."
	},

	{
		type: "judge",
		verdict: "scam",
		message: {
			channel: "email",
			fromName: "Netflix",
			fromAddress: "billing@netflix-account-update.com",
			subject: "Your membership is on hold",
			body: "We're having trouble with your current billing information. Update your payment details within 48 hours to keep your account active. Update payment."
		},
		flags: [
			"The sender address is netflix-account-update.com, not netflix.com.",
			"It pressures you with a 48-hour deadline.",
			"It wants your payment details through a link in the email."
		],
		action: "Don't use the link. Open the Netflix app or type netflix.com yourself and check your account there."
	},

	{
		type: "spot",
		message: {
			channel: "email",
			fromName: "Inland Revenue",
			fromAddress: "myir@ird-refunds.net",
			subject: "Action required: confirm your details",
			body: "Please confirm your account details so we can process your refund."
		},
		prompt: "Tap the part that shows this email is fake.",
		candidates: [
			{ text: "The sender's address “ird-refunds.net”", correct: true, note: "Correct. Real IRD emails end in @ird.govt.nz. Always check the full address, not just the name shown." },
			{ text: "The subject “Action required”", correct: false, note: "Urgent-sounding subjects are common, but on their own they don't prove it's fake. The address does." },
			{ text: "The word “refund”", correct: false, note: "Refunds can be genuine. The clear giveaway here is the sender's web address." }
		]
	},

	{
		type: "judge",
		verdict: "scam",
		message: {
			channel: "sms",
			from: "ASB",
			body: "ASB Alert: a new device tried to log in to your account. If this wasn't you, verify your identity immediately: asb-online-verify.com/secure"
		},
		flags: [
			"It's designed to alarm you and make you act straight away.",
			"The link asb-online-verify.com is not the real asb.co.nz.",
			"Banks don't ask you to 'verify' by tapping a link in a text."
		],
		action: "Don't tap the link. Open your banking app, or type asb.co.nz yourself, to check your account."
	},

	{
		type: "judge",
		verdict: "scam",
		message: {
			channel: "sms",
			from: "+44 7700 900123",
			body: "Congratulations! Your mobile number has been selected to win a $1,000 Prezzy Card. Claim within 24 hours: claim-reward-nz.info"
		},
		flags: [
			"You can't win a prize draw you never entered.",
			"The link isn't a company or shop you recognise.",
			"'Claim within 24 hours' is there to rush you into tapping."
		],
		action: "Delete it. Genuine prizes don't need an urgent tap or your details through a random link."
	},

	{
		type: "action",
		message: {
			channel: "email",
			fromName: "Accounts",
			fromAddress: "invoices@billing-secure.co",
			subject: "Invoice #40921 overdue",
			body: "Please find your overdue invoice attached. Payment is now overdue. Open the attached file to view the amount owing."
		},
		prompt: "You don't recognise this invoice. What's the safest thing to do?",
		options: [
			"Open the attachment to see what it is",
			"Don't open it; delete the email, or check with the company directly first",
			"Reply to the email asking for more details",
			"Forward it to a friend to see what they think"
		],
		answer: 1,
		why: "Unexpected attachments can contain malware that infects your computer. Don't open attachments you weren't expecting. If the bill might be real, contact the company using details you find yourself, not the ones in the email."
	}

];
