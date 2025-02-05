const { exec } = require('child_process');
const schedule = require('node-schedule');
const axios = require('axios');

function getCurrentDateTime() {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return { date, time };
}

function backupDatabases() {
    const { date, time } = getCurrentDateTime();
    const panelBackup = `mysqldump -u root --opt panel > /database/panel/panel-${date}-${time}.sql`; // Adjust this to your database and where you would like to to dump
    const controlPanelBackup = `mysqldump -u root --opt controlpanel > /database/controlpanel/controlpanel-${date}-${time}.sql`; // You may add more or remove this if you wish

    // Make sure you edit panelBackup to whatever you set above (line 14)
    exec(panelBackup, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing panel backup: ${error.message}\nCode: ${error.code}\nSignal: ${error.signal}`);
            sendDiscordWebhook(`Error executing panel backup: ${stderr}`);
            return;
        }
        console.log(`Panel backup completed: ${stdout}`);
        sendDiscordWebhook(`Panel backup completed: /database/panel/panel-${date}-${time}.sql`);  // Edit accordingly for your webhook message
    });

    // Make sure you edit controlPanelBackup to whatever you set above (line 15)
    exec(controlPanelBackup, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing controlpanel backup: ${error.message}\nCode: ${error.code}\nSignal: ${error.signal}`);
            sendDiscordWebhook(`Error executing controlpanel backup: ${stderr}`);
            return;
        }
        console.log(`Controlpanel backup completed: ${stdout}`);
        sendDiscordWebhook(`Controlpanel backup completed: /database/controlpanel/controlpanel-${date}-${time}.sql`); // Edit accordingly for your webhook message
    });
}

function sendDiscordWebhook(message) {
    const webhookUrl = 'https://discord.com/api/webhooks/changeme'; // Set this to your webhook URL
    const embed = {
        embeds: [{
            description: message,
            color: 0x00ff00
        }]
    };

    axios.post(webhookUrl, embed)
        .then(response => {
            console.log('Discord webhook sent:', response.data);
        })
        .catch(error => {
            console.error('Error sending Discord webhook:', error);
        });
}

schedule.scheduleJob('0 */3 * * *', backupDatabases);

// Initial call to execute the backup immediately
backupDatabases();
