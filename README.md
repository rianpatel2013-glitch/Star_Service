This is a Slack Bot in the Hack Club Workspace designed to help you do the following:

/ss-help (shows every slash command this bot has)
/ss-find [phrase] (helps you find every mention of that phrase in the whole channel that you use the command in)
/ss-shower-thought (gives you a random shower thought from a huge collection. Credits: Reddit)
/ss-quote (gives you a random quote from a completely free API call referencing thousands of quotes for the top 50 ones. Credits: ZenQuotes.io)
Setup: (https://stardance.hackclub.com/missions/slack-bot/guide#step-1):

You'll need to install Node JS, npm, and the modules: @slack/bolt and dotenv.

You'll also need a Slack app with the following bot token scopes: app_mentions:read, channels:history, channels:read, channels:join, chat:write, commands, and Socket Mode enabled with an app-level token.

These 2 tokens also need to be added in .env as SLACK_BOT_TOKEN and SLACK_APP_TOKEN respectively.

This Slack Bot is hosted 24x7 on Nest by HackClub

Some of the code (listed more specifically in the code using comments) was done by Claude AI.
