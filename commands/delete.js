exports.help = {
    type: 'Testing',
    descrip: 'Delete a test',
    params: '[testname]'
};

exports.run = (client, message) => {
    if (!message.member.hasPermission('MANAGE_MESSAGES') && message.author.id !== client.ownerID) return message.channel.send('You are unauthorized to use this command. You must have the `Manage Messages` permsission.');
    message.args[0] = message.args.join(' ');

    if (!message.args.length) return message.channel.send('Please choose a test to delete.');
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./extra/database.db');
    
    db.serialize(() => {
        let stmt = db.prepare('SELECT * FROM quizzes WHERE serverid=? AND quizname=?');
        stmt.get([message.guild.id, message.args[0]], (err, row) => {
            if (!row) return message.channel.send('This test does not exist.');
            if (row.creator !== +message.author.id && message.author.id !== client.ownerID) return message.channel.send('You cannot delete this test. You must have been the one to make this test to delete it.');


            let stmt = db.prepare('DELETE FROM quizzes WHERE serverid=? AND quizname=?');
            stmt.run([message.guild.id, message.args[0]]);
            stmt.finalize();
            message.channel.send('This test has been deleted.');
            db.close();
        });
        stmt.finalize();
    });
};