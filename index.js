var prompt = require("prompt");
var config = require('./config');
var colors = require("colors/safe");
var jira = require('./jira');
var mail = require('./mail');

prompt.message = "";
prompt.delimiter = colors.magenta(':');

prompt.start();

prompt.get({
  properties: {
    finished: {
      description: colors.magenta("Finished Since Last Update"),
    },
    today: {
      description: colors.magenta("Finishing Today"),
    },
    upcoming: {
      description: colors.magenta("Upcoming"),
    },
    project_status: {
      description: colors.magenta("Project Status"),
    },
    issues: {
      description: colors.magenta("Potential Issues"),
    },
  }
}, function (err, result) {
  constructEmail(result);
});

function constructEmail(result) {
  var finished = result.finished.split(',');
  var today = result.today.split(',');
  var upcoming = result.upcoming.split(',');
  var project_status = result.project_status.split(',');
  var issues = result.issues.split(',');
  var regex = config.key_regex;
  var promises = [];

  promises.push(addHeader("Finished Since Last Update<br/>"));
  finished.forEach(function(str) {
    if(regex.test(str)) {
      promises.push(jira.getIssue(str));
    } else {
      promises.push(new Promise(function (resolve,reject) {
        resolve("-" + str + "<br/>");         
      }));
    }
  });

  promises.push(addHeader("<br/>Finishing Today<br/>"));
  today.forEach(function(str) {
    if(regex.test(str)) {
      promises.push(jira.getIssue(str));
    } else {
      promises.push(new Promise(function (resolve,reject) {
        resolve("-" + str + "<br/>");         
      }));
    }
  });

  promises.push(addHeader("<br/>Upcoming<br/>"));
  upcoming.forEach(function(str) {
    if(regex.test(str)) {
      promises.push(jira.getIssue(str));
    } else {
      promises.push(new Promise(function (resolve,reject) {
        resolve("-" + str + "<br/>");         
      }));
    }
  });

  promises.push(addHeader("<br/>Project Status<br/>"));
  project_status.forEach(function(str) {
    if(regex.test(str)) {
      promises.push(jira.getIssue(str));
    } else {
      promises.push(new Promise(function (resolve,reject) {
        resolve("-" + str + "<br/>");         
      }));
    }
  });

  promises.push(addHeader("<br/>Potential Issues<br/>"));
  issues.forEach(function(str) {
    if(regex.test(str)) {
      promises.push(jira.getIssue(str));
    } else {
      promises.push(new Promise(function (resolve,reject) {
        resolve("-" + str + "<br/>");         
      }));
    }
  });

  var body = '';
  Promise.all(promises).then(values => {
    values.forEach(function(element) {
      body += element.replace("-  ", "-"); 
    });

    var displayBody = body.replace("<br/>", "\n");
    console.log(displayBody);
    prompt.get({
      name: 'yesno',
      message: colors.magenta('Does this look right?'),
      validator: /y[es]*|n[o]?/,
      warning: 'Must respond yes or no',
      default: 'no'
    }, function(err, result) {
      result = result.yesno;
      if(result === 'y' || result === 'yes') {
        mail(body);
      } else {
        console.log(colors.red("Dev status cancelled"));
      }
    });
  });
}

function addHeader(header) {
  return new Promise(function (resolve, reject) {
    resolve(header);
  });
}
