var config = require('./config');
var JiraClient = require('jira-connector');

var jira = new JiraClient({
  host: config.jira_host,
  basic_auth: {
    username: config.jira_user,
    password: config.jira_pass
  }
});

module.exports = {
  getIssue: function(key) {
    key = key.replace(' ', '');
    return new Promise(function(resolve, reject) {
      jira.issue.getIssue({
          issueKey: key
        }, function(err, issue) {
          if(err) {
            console.log(err);
            reject(err);
          } else {
            var link = config.jira_link + key;
            var returnStr = "-" + issue.fields.summary + " (<a href='" 
                + link + "'>" + key + "</a>)<br/>";
            resolve(returnStr);
          }
      });
    });
  }
}

