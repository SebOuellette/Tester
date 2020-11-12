exports.help = {
    type: 'General',
    descrip: 'List all the commands.',
    params: '[type]'
};

exports.run = (client, message) => {
    const fs = require('fs');
    
    let commands = {};
    const files = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
    files.forEach(f => {
        let file = require(`./${f}`).help;
        if (!file.descrip) file.descrip = 'No description.'
        if (!commands[file.type]) commands[file.type] = [];
        commands[file.type].push({
            name: `${client.prefix}${f.match(/([^\.]*)\.js/)[1]}`,
            descrip: file.descrip,
            params: file.params
        });
    });


    let types = Object.keys(commands);
    let match = '';
    if (message.args.length) match = types.filter(t => t.toLowerCase()===message.args[0].toLowerCase())[0];
    if (message.args.length && !match) return message.channel.send(`${message.args[0]} is not a command type. Use \`${client.prefix}help\` to view all types.`);
    
    let args = {
        name: 'Command Types',
        value: `${client.prefix}help [type]\nFor any extra help, visit ${client.serverinv}.\n\n${types.join('\n')}`
    };

    if (match) args = {name: match, value: commands[match].map(c => `**${c.name} ${c.params}** - ${c.descrip}`).join('\n')};

    message.channel.send({embed: {
        color: client.embedColour,
        title: 'Help',
        fields: [
            args
        ], 
        footer: {
            text: `${message.prefix}help`
        }
    }});
}
