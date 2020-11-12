exports.run = (client, message) => {
    const fs = require('fs');
    
    if (message.channel.type === 'dm') return;
    message.prefix = client.prefix;
    if (message.author.bot) return;

    let oldcont = message.content;
    message.content = message.content.replace(new RegExp(`(^<@!?${client.bot.user.id}>)|(^${client.prefix})`, 'i'), '').trim();
    if (oldcont === message.content) return;
    
    if (!message.content.match(/^[^ ]+/i)) return;
    message.args = message.content.split(/ +/g);
    message.cmd = message.args[0];
    message.args = message.args.splice(1);

    if (fs.readdirSync(`./commands`).includes(`${message.cmd}.js`.toLowerCase())) {
        if (message.author.id === '326055601916608512' && message.guild.id !== '494259669112586251') return message.channel.send('You can\'t use this bot.');
        console.log(`${message.author.tag}:`.green + ` ${message.cmd} ${message.args.join(' ')}`);
        const command = client.req(`../commands/${message.cmd.toLowerCase()}.js`);

        command.run(client, message);
        client.clr(`../commands/${message.cmd.toLowerCase()}.js`);
        //if ((process.memoryUsage().rss / 1024 / 1024) > 100 && message.cmd !== 'make') process.exit();
    }
}