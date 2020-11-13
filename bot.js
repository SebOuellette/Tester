const Discord = require('discord.js');
const fs = require('fs');
const Client = require('./extra/client.js');
const bot = new Discord.Client();
const client = new Client(bot);

// Global variables
client.auth = require('./extra/auth.json');
client.package = require('./package.json');
client.discord = Discord;

// Pass the events to their designated event handler file
const oldEmit = bot.emit.bind(bot);
bot.emit = (evt, ...args) => {
    if (fs.readdirSync(`./events`).includes(`${evt}.js`)) {
        const event = client.req(`../events/${evt}.js`);
        event.run(client, ...args);
    }
    try{oldEmit(evt, ...args)}catch(err){}
    if ((process.memoryUsage().rss / 1024 / 1024) > 200 && evt !== 'message' && evt !== 'raw') process.exit();
};

// Login to the bot
bot.login(client.auth.token);
