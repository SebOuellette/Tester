exports.run = (client, guild) => {
    client.postStats();
    console.log(`Guild joined! Now in ${client.bot.guilds.cache.size} guilds.`.green);
    console.log(guild);
    guild.members.fetch();

    // Send the join embed
    client.bot.channels.cache.get(client.logchan).send({
        embed: {
            color: 0x44FF44,
            title: 'Guild Joined!',
            thumbnail: {
                url: guild.iconURL
            },
            fields: [
                {
                    name: 'Name',
                    value: guild.name,
                    inline: true
                },
                {
                    name: 'Owner',
                    value: guild.owner.user.tag,
                    inline: true
                },
                {
                    name: 'Members',
                    value: guild.members.cache.filter(m => m.user.bot == false).size,
                    inline: true
                },
                {
                    name: 'Bots',
                    value: guild.members.cache.filter(m => m.user.bot == true).size,
                    inline: true
                },
                {
                    name: 'Tester Guild Count',
                    value: client.bot.guilds.cache.size,
                    inline: true
                }
                ],
            footer: {
                icon_url: client.bot.user.avatarURL,
                text: `${(new Date).toDateString()} | ${Math.floor((new Date).getTime()/(1000*60*60))%24}:${Math.floor(((new Date).getTime()/(1000*60))%60)}:${Math.floor(((new Date).getTime()/1000)%60)}`
            }
        }
    });
};
