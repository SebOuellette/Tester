exports.help = {
    type: 'Testing',
    descrip: 'Test a user.',
    params: '[user] [testname]'
};

exports.run = (client, message) => {
    message.guild.members.fetch().catch(e => console.log(e));
    if (!message.member.hasPermission('MANAGE_MESSAGES') && message.author.id !== client.ownerID) return message.channel.send('You are unauthorized to use this command. You must have the `Manage Messages` permsission.');
    let mmbr = message.args[0];
    let args = message.args;
    args.shift();
    args = args.join(' ');
    message.args = [mmbr, args];

    let date = new Date().getTime();
    if (client.ratelimit[message.author.id] && date < client.ratelimit[message.author.id]) return message.channel.send(`You can use this command again in \`${Math.floor((client.ratelimit[message.author.id] - date)/1000)}\` more seconds`);
    client.ratelimit[message.author.id] = date+20000;

    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./extra/database.db');
    db.serialize(() => {
        db.get(`SELECT * FROM quizzes WHERE serverid=${message.guild.id}`, (err, row) => {
            if (!row) {
                db.close();
                return message.channel.send(`There are no quizzes created yet. Please create a quiz using \`${client.prefix}make\`.`);
            } else if (row && row.modrole && !message.member.roles.cache.map(r => r.id).includes(`${row.modrole}`)) {
                db.close();
                return message.channel.send(`You must have the \`${message.guild.roles.cache.get(`${row.modrole}`).name}\` role to use this command.`);
            }

            if (message.args.length < 1) return message.channel.send('No user selected');
    
            message.args = message.args;
            if (message.guild.members.cache.find(x => x.user.username.toLowerCase().startsWith(message.args[0].toLowerCase()))) message.target = message.guild.members.cache.find(x => x.user.username.toLowerCase().startsWith(message.args[0].toLowerCase()));
            else if (message.args[0].substring(2)[0] === '!') message.target = message.guild.members.cache.get(message.args[0].substring(3,message.args[0].length-1));
            else if (message.args[0].substring(1)[0] === '@') message.target = message.guild.members.cache.get(message.args[0].substring(2,message.args[0].length-1));
            else return message.channel.send('Could not find that user');

            if (message.member.roles.highest.comparePositionTo(message.target.roles.highest) < 0 && message.author.id !== client.ownerID) return message.channel.send('You are unable to test this person!');

            message.args.shift();
            if (!message.args.length) return message.channel.send('Please select a test preset.');

            let stmt = db.prepare('SELECT * FROM quizzes WHERE serverid=? AND quizname=?');
            stmt.get([message.guild.id, message.args[0]], (err, qrow) => {
                if (!qrow) {
                    db.close();
                    return message.channel.send('This is not an existing quiz.');
                }
                db.get(`SELECT * FROM quizzers WHERE userid=${message.target.user.id}`, (err, row) => {
                    
                    if (!row) db.run(`INSERT INTO quizzers (userid, currently, caller) VALUES (${message.target.user.id}, TRUE, ${message.author.id})`);
                    else if (row.currently) {
                        db.close();
                        return message.channel.send(`${message.target.user.username} is already being tested.`);
                    }
                    
                    quiz(qrow.questions.split('#.#'));
                });
                
            });
            stmt.finalize();
        });
    });

    const quiz = questions => {
        message.channel.send(`${message.target.user.username} is now being tested.`);
        message.target.dms = true;
        
        const sendRes = (answers, questions, message, client, db) => {
        let member = message.guild.members.cache.get(message.author.id)
            member.send(`Here are the test results for ${message.target}. \n\n${questions.map((q, i, a) => `[${i+1}/${a.length}] **${q}**\n${answers[i]}`).join('\n')}`);

            db.serialize(() => {
                db.run(`UPDATE quizzers SET currently=FALSE WHERE userid=${message.target.id}`);
                db.close();
            });
        };

        (() => {
            let answers = [];
            message.target.user.send('You are being quizzed. You have 1 minute to answer each question.')
                .catch(er => message.target.dms = false)
                .then(msg => {
                    const collect = (message, client) => {
                        if (!message.target.dms) {
                            db.serialize(() => {
                                db.run(`UPDATE quizzers SET currently=FALSE WHERE userid=${message.target.id}`);
                                db.close();
                            });
                            return message.channel.send(`${message.target.user.username} has dms disabled.`);
                        }
                        message.target.send(`[${answers.length+1}/${questions.length}] ${questions[answers.length]}`).catch(()=>{});

                        let collector = new client.discord.MessageCollector(msg.channel, m => m.author.id === message.target.id, { time: 60000, max: 1 });
                        collector.on('end', collected => {
                            const coll = collected.map(c => c.content);
                            if (!coll.length) {
                                coll.push('No answer');
                                message.target.send('Time has run out! Please move on to the next question.').catch(()=>{});
                            }
                            answers.push(coll[0]);
                            if (answers.length < questions.length) collect(message, client, db);
                            else {message.target.send('Thank you for answering! The test results will be sent to the person who quizzed you.'); sendRes(answers, questions, message, client, db);}
                        });
                    };
                    collect(message, client, db);
                });
        })();
    };
};
