const https = require('https');

class Client {
    constructor(bot) {
        this.bot = bot;
        this.prefix = 't!';
        this.defaultgame = `${this.prefix}help`;
        this.embedColour = 0xA3FF8E;
        this.ownerID = '221744875941396480';
        this.logchan = '490870636940361750';
        this.serverinv = 'https://discord.gg/VGzcMkQ';
        this.colors = require('colors');
        this.ratelimit = {};
    }

    setActivity(name = this.defaultgame, type = 'PLAYING', status = 'online') {
        this.bot.user.setActivity({
            name,
            type: type
        });
    }

    req(file) {
        this.clr(file);

        return require(file);
    }

    clr(file) {
        const path = require.resolve(file);
        const cache = require.cache[path];
        delete require.cache[path];

        if (cache) {
            const cIndex = cache.parent.children.indexOf(cache);
            if (cIndex !== -1) cache.parent.children.splice(cIndex, 1);
        }
    }

    postStats() {
        // Options
        // DBL Request Options
        const dbloptions = {
            host: 'discordbots.org',
            path: `/api/bots/${this.bot.user.id}/stats`,
            method: 'POST',
            headers: {Authorization: this.auth.dbltoken, 'Content-Type': 'application/json'}
        };
        // DBoats Request Options
        const boatoptions = {
            host: 'discordboats.club',
            path: `/api/public/bot/stats`,
            method: 'POST',
            headers: {Authorization: this.auth.boattoken, 'Content-Type': 'application/json'}
        };

        // Uploading
        // Upload to DBL
        https.request(dbloptions, res => {
            if (res.statusCode !== 200) console.log(`Error ${res.statusCode}: Error uploading guild count to DBL`.red);
            res.on('error', err => console.log(`Error ${err.code}: Error uploading guild count to DBL`.red));
        }).end(JSON.stringify({server_count: this.bot.guilds.size}));
        // Upload to DBoats
        
        let boat = https.request(boatoptions, res => {
            if (res.statusCode !== 200) console.log(`Error ${res.statusCode}: Error uploading guild count to DBoats`.red);
            res.on('error', err => console.log(`Error ${err.code}: Error uploading guild count to DBoats`.red));
        });
        boat.end(JSON.stringify({server_count: this.bot.guilds.size}));
        boat.on('error', () => {});
    }
};

module.exports = Client;
