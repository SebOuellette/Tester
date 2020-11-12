exports.help = {
    type: 'General',
    descrip: 'Get ping information.',
    params: ''
};

exports.run = (client, message) => {
    message.channel.send('Pinging...').then(msg => {
        msg.edit(`🏓 **Pong!** \nHearbeat: \`${Math.round(client.bot.ping)}ms\` \nResponse time: \`${msg.createdTimestamp - message.createdTimestamp}ms\``);
    });
};