exports.help = {
    type: 'Testing',
    descrip: 'Create a test',
    params: '[testname]'
};

exports.run = (client, message) => {
    if (!message.member.hasPermission('MANAGE_MESSAGES') && message.author.id !== client.ownerID) return message.channel.send('You are unauthorized to use this command. You must have the `Manage Messages` permsission.');
    if (!message.args.length) return message.channel.send('Please choose a name for the test. ');
    message.args[0] = message.args.join(' ');
    if (message.args[0].length > 30) return message.channel.send('This name is too long! Please choose a name that is less than 30 characters long.');
    let x = 0;

    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./extra/database.db');
    db.serialize(() => {
        db.all(`SELECT * FROM quizzes WHERE serverid=${message.guild.id}`, (err, row) => {
            
            if (row.length) row.forEach((r) => {
                if (message.args[0] === r.quizname) {
                    db.close();
                } else {
                    x++;
                    cont(row);
                }
            });
            else cont(row);
        });
    });

    const cont = row => {
        if (x < row.length) {
            return;
        }

        message.delete().catch(()=>{});

        const makeTest = (questions, message, client, db, msg, mesg) => {
            msg.delete();
            mesg.delete();
            message.channel.send('The test has been created.').then(msg => msg.delete(5000).catch(e => {}));
            db.serialize(() => {
                let stmt = db.prepare('INSERT INTO quizzes (serverid, questions, quizname, creator, modrole) VALUES (?, ?, ?, ?, ?)');
                stmt.run([message.guild.id, questions.join('#.#'), message.args[0].toLowerCase(), message.author.id, 0]);
                stmt.finalize();

                db.close();
            });
        };

        (() => {
            let questions = [];
            message.channel.send('You are creating a test. To stop adding more questions, just type `end`.').then(mesg => {
                message.channel.send(`[1/25] Enter question **#1**`)
                .then(msg => {
                    const collect = (message, client, db) => {
                        msg.edit(`[${questions.length+1}/25] Enter question **#${questions.length+1}**`);

                        let collector = new client.discord.MessageCollector(msg.channel, m => m.author.id === message.author.id, { time: 2400000, max: 1 });
                        collector.on('collect', msg => {
                            msg.delete().catch(()=>{});
                        });
                        collector.on('end', collected => {
                            const coll = collected.map(c => c.content);
                            if (!coll.length) {
                                coll.push('No answer');
                                message.channel.send('Time has run out! Please move on to the next question.');
                            }
                            if (coll[0].toLowerCase() === 'end' && questions.length < 1) {
                                return message.channel.send('Test creation has been stopped');
                            };
                            if (coll[0].toLowerCase() === 'end') return makeTest(questions, message, client, db, msg, mesg);
                            questions.push(coll[0]);
                            if (questions.length < 25) collect(message, client, db);
                            else makeTest(questions, message, client, db, msg, mesg);
                        });
                    };
                    collect(message, client, db);
                });
            });
        })();
    };

};
