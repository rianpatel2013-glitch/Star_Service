require("dotenv").config();

const { App } = require("@slack/bolt");

const searchSessions = {};

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
    ss-find [phrase]`
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
        response_type: "ephemeral",
        text: "Searching through the channel...",
    });

    // Used Claude to figure out how to check the channel for the mentions of that phrase (including the function, but not the app.actions). I didn't just copy paste tho, I learnt how it works and made changes.
    try {
        await client.conversations.join({ channel: channelId });
    } catch (joinErr) {
        if (joinErr.data?.error === "channel_not_found" ||
            joinErr.data?.error === "method_not_supported_for_channel_type") {
            await respond({
                text: "This is a private channel. Please invite the bot first with `/invite @Super Service` (it's the one with ) then try again.",
                replace_original: true
            });
            return;
        }
        throw joinErr;
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
        console.error(err);
        await respond({
            text: `Failed to find that phrase. ${err.message}`,
            replace_original: true
        });
    };
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
                    text: `🔍 *"${query}"* — result *${index + 1}* of *${total}*\n\n>${current.text}\n\n<${current.permalink}|Go to message ↗>`
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

(async () => {
    await app.start();
    console.log("bot is running!");
})();