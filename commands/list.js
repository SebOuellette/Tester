exports.help = {
    type: 'Testing',
    descrip: 'List all tests available.',
    params: ''
};

exports.run = (client, message) => {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./extra/database.db');
    db.serialize(() => {
        db.all(`SELECT * FROM quizzes WHERE serverid=${message.guild.id}`, (err, row) => {
            let names = row.map(r => {
                let dot = '';
                if (r.quizname.substring(0, 31).length > 30) dot='...';
                return `${r.quizname.substring(0, 31)}${dot}`
            });
            if (!names.length) return message.channel.send(`There are no quizzes created yet. Please create a quiz using \`${client.prefix}make\`.`);

            message.channel.send({embed: {
                color: client.embedColour,
                title: 'Test',
                fields: [
                    {
                        name: 'Test List',
                        value: names.join('\n')
                    }
                ], 
                footer: {
                    text: `${message.prefix}help`
                }
            }});
        });
    });
};