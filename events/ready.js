exports.run = client => {
    const os = require('os');
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./extra/database.db');

    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS quizzes (serverid INTEGER, questions TEXT, quizname TEXT, creator INTEGER, modrole INTEGER)');
        db.run('CREATE TABLE IF NOT EXISTS quizzers (userid INTEGER, currently BOOLEAN, caller INTEGER)');
    });
    
    console.log([
        '-----------------------------------------------'.green,
        '   Logged in as:'.white + ` ${client.bot.user.tag}`.green,
        '   Prefix:'.white + ` ${client.prefix}`.green,
        '   Guilds:'.white + ` ${client.bot.guilds.cache.size}`.green,
        '   Owner:'.white + ' SharkFin#1504'.green,
        '   Tester -'.white + ' Test your friends!'.green,
        '   All bot interactions will be logged below'.white,
        '-----------------------------------------------'.green
    ].join('\n'));

    client.setActivity(client.defaultgame);
    client.postStats();
};
