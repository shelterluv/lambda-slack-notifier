const https = require('https');
const util = require('util');

exports.handler = (event, context) => {
    console.log(JSON.stringify(event, null, 2));
    console.log('From SNS:', event.Records[0].Sns.Message);

    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };

    let postData = {
        "channel": "#aws-sns",
        "username": "AWS SNS via Lamda :: DevQa Cloud",
        "text": "*" + event.Records[0].Sns.Subject + "*",
        "icon_emoji": ":aws:"
    };

    let message = event.Records[0].Sns.Message;
    let severity = "good";

    let dangerMessages = [
        " but with errors",
        " to RED",
        "During an aborted deployment",
        "Failed to deploy application",
        "Failed to deploy configuration",
        "has a dependent object",
        "is not authorized to perform",
        "Pending to Degraded",
        "Stack deletion failed",
        "Unsuccessful command execution",
        "You do not have permission",
        "Your quota allows for 0 more running instance"];

    let warningMessages = [
        " aborted operation.",
        " to YELLOW",
        "Adding instance ",
        "Degraded to Info",
        "Deleting SNS topic",
        "is currently running under desired capacity",
        "Ok to Info",
        "Ok to Warning",
        "Pending Initialization",
        "Removed instance ",
        "Rollback of environment"
    ];

    for (let dangerMessagesItem in dangerMessages) {
        if (message.indexOf(dangerMessages[dangerMessagesItem]) != -1) {
            severity = "danger";
            break;
        }
    }

    // Only check for warning messages if necessary
    if (severity == "good") {
        for (let warningMessagesItem in warningMessages) {
            if (message.indexOf(warningMessages[warningMessagesItem]) != -1) {
                severity = "warning";
                break;
            }
        }
    }

    postData.attachments = [
        {
            "color": severity,
            "text": message
        }
    ];

    let options = {
        method: 'POST',
        hostname: 'hooks.slack.com',
        port: 443,
        path: '/services/TFZ3EAKQB/BGFAPU79S/rreWZcDo1slDwQALXJCLjSs8'
    };

    let req = https.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            context.done(null);
        });
    });

    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    req.write(util.format("%j", postData));
    req.end();

    return response;
};