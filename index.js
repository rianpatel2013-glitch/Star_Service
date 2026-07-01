require("dotenv").config();

const { App } = require("@slack/bolt");

const axios = require("axios");
const https = require("https");

const searchSessions = {};
const showerThoughtHistory = {};
const quoteHistory = {};

const SHOWER_THOUGHTS = [
    "Go to bed; you'll feel better in the morning is the human version of Did you turn it off and turn it back on again?",
    "Even when a balloon is half inflated, it is completely full.",
    "Nothing is on fire. Fire is on things.",
    "How do our brains remember that we forgot something, but we can't remember what that thing was?",
    "If James Bond is the most famous spy, wouldn't that also make him the worst spy?",
    "Peer pressure as an adult is seeing your neighbor mow their lawn.",
    "Crabs probably think that fish can fly.",
    "Your first birthday is technically your second birthday.",
    "Fire trucks are really water trucks.",
    "Bean bags are just boneless sofas.",
    "When we're young, we sneak out of our houses to go to parties. When we're old, we sneak out of parties to go home.",
    "Can you daydream at night?",
    "Your stomach thinks all potatoes are mashed.",
    "In order to fall asleep, we have to pretend to be asleep.",
    "If Earth was flat, the edge would probably be a tourist attraction.",
    "I correct autocorrect more than it corrects me.",
    "Painkillers are the mute notification option for the body.",
    "Theme parks can snap a crystal clear picture of you on a roller coaster at 70 mph, but bank cameras can't get a clear shot of a robber standing still.",
    "If tomatoes are fruit, then ketchup is jam.",
    "Why aren't iPhone chargers called Apple juice?",
    "Clapping your hands is just high-fiving yourself.",
    "Once you have a PhD, every meeting you go to becomes a doctor's appointment.",
    "Teeth are the only problem where if you ignore them, they will go away.",
    "Searching for a new laptop online is basically forcing your current computer to dig its own grave.",
    "Turtles can never have sleepovers because they always sleep at home.",
    "The object of golf is to play the least amount of golf.",
    "Watching a graduation ceremony is like sitting through a movie that's entirely end credits.",
    "When you drink alcohol, you're just borrowing happiness from tomorrow.",
    "Making a typo in an online argument is the equivalent of voice cracking in a verbal argument.",
    "Social anxiety is basically conspiracy theories about yourself.",
    "Every broken clock tells you the exact time it passed away.",
    "Most people pull their phones out of their pockets to check the time. We are reverting to the era of pocket watches.",
    "We'll never really know what it smells like underwater.",
    "The sinking of the Titanic must have been a miracle to the lobsters in the kitchen.",
    "Heat, pressure and time — the three things that make a diamond are also the three things that make a waffle.",
    "A different version of you exists in the minds of everyone who knows you.",
    "Someone out there vividly remembers something you said that you have completely forgotten.",
    "You see people every single day that you'll never see again.",
    "Every word in every language started out as gibberish until one person convinced enough people that what they said was a real word.",
    "You may have once made a decision that saved your life without knowing it.",
    "Kids are bullied for being different, while adults are praised for being different.",
    "People cover their laptop cameras for fear of hackers but never their phone cameras.",
    "One day, you'll be someone's ancestor.",
    "The number of people older than you never goes up.",
    "Someone studying atoms is just a bunch of atoms trying to understand themselves.",
    "Every single human in history has witnessed the same sun and moon as you have.",
    "You've never seen your own face before — only in pictures and reflections.",
    "You've survived 100% of your worst days.",
    "You only have one birthday; the rest are congratulations for surviving each year.",
    "Some stranger remembers you for being kind to them when no one else was.",
    "Most people aren't scared of being alone in the dark — they're scared of not being alone in the dark.",
    "Firefly is the opposite of waterfall.",
    "A group of squid should be called a squad.",
    "Your future self is talking crap about you.",
    "Biting your tongue while eating is a perfect example of how you can still screw up, even with decades of experience.",
    "What if déjà vu is just you losing a life and starting again at the last checkpoint?",
    "The internet almost killed the postal service with email and then made it more necessary than ever with online delivery.",
    "Coffee makes you hyper, but coffee shops are intended to make you slow down and relax.",
    "Security at every level of the airport is high until you get to baggage claim.",
    "April Fool's Day is the one day a year when people critically examine news articles before accepting them as true.",
    "Brushing our teeth is the closest we ever come to cleaning our skeleton.",
    "All of the caution messages on various products were likely put there because someone tried them out.",
    "The way we treat moths versus butterflies is a real-life example of pretty privilege.",
    "You're the only one who remembers your embarrassing experiences so vividly because everyone's got their own to remember.",
    "Eight hours of drinking is binge drinking, eight hours of TV is binge-watching, and eight hours of sleep is barely enough.",
    "If humans could fly, we'd probably consider it exercise and never do it.",
    "History classes are only going to get longer and harder as time goes on.",
    "There should be an optional people are sleeping button on the microwave to stop all the extra loud beeping.",
    "The word fat just looks like someone took a bite out of the word eat.",
    "We pass the anniversary of our death every year without knowing it.",
    "We're lucky blinking doesn't make a noise.",
    "Salt is the only rock that is socially acceptable to eat.",
    "Humans advocate not judging a book by its cover, but also glorify love at first sight.",
    "A corn maze is a maze of maize.",
    "They don't let you smile in passport photos because they want you to look the same as if you were standing in line at customs for an hour.",
    "No one has ever been in a fully empty room.",
    "Do not touch must be one of the scariest things to read in braille.",
    "There's no way to prove that we all actually see the same colors.",
    "You will never stand backward on a staircase.",
    "Flipping your middle finger is halfway to giving the peace sign.",
    "There are two E's in bee, but they're both silent.",
    "Your whole life is spent gathering people for your funeral.",
    "The only difference between relaxation and boredom is enjoyment.",
    "Normally, you empty your drink from the top, but when you use a straw, you empty it from the bottom.",
    "You've never actually seen a full movie because you're always blinking.",
    "If a fly loses its wings, is it now called a walk?",
    "Watermelon candy is often green, but with real watermelon, we never eat the green part.",
    "Finally is pronounced final-e and finale is pronounced fi-nally.",
    "Why do we call it a building if it's already built?",
    "Why do we say sleeping like a baby when babies often wake up crying and restless?",
    "Why do people say tuna fish but they don't say chicken bird?",
    "Once we have self-driving cars, wipers will no longer be essential because the car doesn't need a clean windshield to drive. Only humans do.",
    "If 24-hour clocks started at 23:59 and counted down till 00:01, people might try getting more done.",
    "The oldest sibling is the emergency designated adult.",
    "Whatever happens inside our bodies happens in pitch-black darkness.",
    "On any given day in a hospital, you can find people having the best day of their life, the worst day, the first day, and the last day all under one roof.",
    "Generally speaking, when you feel stupid, it's because you're expanding your knowledge and getting smarter.",
    "Math is the only place where someone would buy 60 watermelons and 40 cantaloupes and no one asks any questions.",
];
let cachedQuotes = [];

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true
});

app.command("/ss-help", async ({ ack, respond }) => {
    await ack();
    await respond({
        text:
            `Available Commands:
/ss-find [phrase] - Helps you find a phrase in the whole channel
/ss-shower-thought - Gives you a random shower thought
/ss-quote - Gives you a random quote`
    });
});

app.command("/ss-find", async ({ ack, command, respond, client }) => {
    await ack();

    const query = command.text.trim().toLowerCase();

    if (!query) {
        await respond({
            text:
                `Wrong Usage. Please use it like this:\n/ss-find [the phrase you're looking for]`
        });
        return;
    }

    const channelId = command.channel_id;
    const userId = command.user_id;

    await respond({
        text: "Searching through the channel...",
    });

    // Used Claude to figure out how to check the channel for the mentions of that phrase (including the function, but not the app.actions). I didn't just copy paste tho, I learnt how it works and made changes.
    try {
        await client.conversations.join({ channel: channelId });
    } catch (joinErr) {
        console.log("Join error:", joinErr.data?.error);
        if (joinErr.data?.error === "already_in_channel") {
            // continue
        } else if (joinErr.data?.error === "channel_not_found" ||
            joinErr.data?.error === "method_not_supported_for_channel_type") {
            await respond({
                text: "Please invite the bot first with `/invite @Star Service` then try again.",
                replace_original: true
            });
            return;
        } else {
            throw joinErr;
        }
    }

    try {
        let messages = [];
        let cursor;

        do {
            const result = await client.conversations.history({
                channel: channelId,
                limit: 200,
                ...(cursor && { cursor })
            });

            const matched = result.messages.filter(msg =>
                msg.text?.toLowerCase().includes(query)
            );

            messages.push(...matched);
            cursor = result.response_metadata?.next_cursor;
        } while (cursor);

        if (messages.length === 0) {
            await respond({
                text: `No results found for *${query}*`,
                replace_original: true
            });
            return;
        }

        const results = await Promise.all(
            messages.map(async (msg) => {
                const { permalink } = await client.chat.getPermalink({
                    channel: channelId,
                    message_ts: msg.ts
                });

                return {
                    text: msg.text?.slice(0, 120) || "",
                    permalink
                };
            })
        );

        searchSessions[userId] = { results, query, index: 0 };

        await respond({
            replace_original: true,
            ...buildResultBlock(results, query, 0)
        });

    } catch (err) {
        await respond({
            text: `Failed to find that phrase. ${err.message}`,
            replace_original: true
        });
    }
});

function buildResultBlock(results, query, index) {
    const total = results.length;
    const current = results[index];

    return {
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*"${query}"* — result *${index + 1}* of *${total}*\n\n>${current.text}\n\n<${current.permalink}|Go to message ↗>`
                }
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: { type: "plain_text", text: "← Older" },
                        action_id: "ss_find_prev",
                        value: "prev"
                    },
                    {
                        type: "button",
                        text: { type: "plain_text", text: "Newer →" },
                        action_id: "ss_find_next",
                        value: "next"
                    },
                    {
                        type: "button",
                        text: { type: "plain_text", text: "✕ Close" },
                        action_id: "ss_find_close",
                        value: "close",
                        style: "danger"
                    }
                ]
            }
        ]
    };
}

app.action("ss_find_prev", async ({ ack, body, respond }) => {
    await ack();
    const userId = body.user.id;
    const session = searchSessions[userId];
    if (!session) return;

    session.index = (session.index - 1 + session.results.length) % session.results.length;

    await respond({
        replace_original: true,
        ...buildResultBlock(session.results, session.query, session.index)
    });
});

app.action("ss_find_next", async ({ ack, body, respond }) => {
    await ack();
    const userId = body.user.id;
    const session = searchSessions[userId];
    if (!session) return;

    session.index = (session.index + 1) % session.results.length;

    await respond({
        replace_original: true,
        ...buildResultBlock(session.results, session.query, session.index)
    });
});

app.action("ss_find_close", async ({ ack, respond }) => {
    await ack();
    await respond({ delete_original: true });
});

app.command("/ss-shower-thought", async ({ ack, respond, command }) => {
    await ack();

    // Used AI to learn how to do some things in JS like the method filter()
    const userId = command.user_id;

    const seen = showerThoughtHistory[userId] || [];
    const unseen = SHOWER_THOUGHTS.filter(t => !seen.includes(t));

    const pool = unseen.length > 0 ? unseen : SHOWER_THOUGHTS;
    const thought = pool[Math.floor(Math.random() * pool.length)];

    showerThoughtHistory[userId] = unseen.length > 0 ? [...seen, thought] : [thought];

    await respond({
        text: thought
    });
});

async function fetchQuotes() {
    const response = await axios.get("https://zenquotes.io/api/quotes", {
        timeout: 20000,
        httpsAgent: new https.Agent({ keepAlive: true })
    });
    if (!response.data) {
        console.log("No Response")
    }
    cachedQuotes = response.data;
    return cachedQuotes;
}

app.command("/ss-quote", async ({ ack, command, respond }) => {
    await ack();

    const data = cachedQuotes
    const quotes = data.map(q => `"${q.q}" - ${q.a}`);

    const userId = command.user_id;
    const seen = quoteHistory[userId] || [];
    const unseen = quotes.filter(t => !seen.includes(t));

    const pool = unseen.length > 0 ? unseen : quotes;
    const quote = pool[Math.floor(Math.random() * pool.length)];

    quoteHistory[userId] = unseen.length > 0 ? [...seen, quote] : [quote];

    await respond({
        text: quote,
        replace_original: true
    });
});

(async () => {
    await app.start();
    console.log("bot is running!");

    try {
        await fetchQuotes();
        console.log("Quotes cached successfully.");
    } catch (err) {
        console.error("Failed to pre-fetch quotes:", err.message);
    }
})();