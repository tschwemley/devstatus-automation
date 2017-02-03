var config = require('./config');
var AWS = require('aws-sdk');

AWS.config.loadFromPath('./aws_config.json');

var ses = new AWS.SES({apiVersion: '2010-12-01'});

module.exports = function(body) {
  ses.sendEmail({
    Source: config.from_email,
    Destination: { 
      ToAddresses: [config.to_email]
    },
    Message: {
      Subject: {
        Data: '[DevStatus] ' + config.name + ' - ' + config.team + ' - ' +
            new Date().toLocaleDateString()
      },
      Body: {
        Html: {
          Data: body
        }
      }
    }
  }
  , function(err,data) {
    if (err)
      throw err

    console.log('Email sent:');
    console.log(data);
  });
}
