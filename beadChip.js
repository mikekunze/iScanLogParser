var async = require('async');
var fs    = require('fs');

var beadChip = function(file) {
  this.rows     = [];
  this.sections = [];

  this.init(file);
};

beadChip.prototype.buildBeadChip = function(rows, sections) {

  var parseSection = function(section, callback) {

    section = section.split('\t');
    sections.push(section);
    callback();
  };

  async.forEach(rows, parseSection, function(err) {
    if(err) console.log(err);

    console.log(sections);
  });
};

beadChip.prototype.init = function(file) {

  // Localize beadChip members
  var build = this.buildBeadChip; 
  var rows  = this.rows;
  var sections = this.sections;

  var metricStream = fs.createReadStream(file, {
    flags: 'r',
    encoding: 'utf8',
    mode: 0666
  });

  // Open file and stream data out
  var allData = ""; 
  metricStream.on('open', function(fd) {

    metricStream.on('data', function(data) {
      allData += data;
    });

    metricStream.on('error', function(err) { 
      console.log(err);
    });

    // When EOF, split string on newline
    metricStream.on('end', function() { 

      var eachRow = function(row, callback) {
        rows.push(row);
        callback();
      };

      async.forEach(allData.split('\n'), eachRow, function(err) {
        if(err) console.log(err);

        build(rows, sections); 
      });
    });
  });
};

beadChip.prototype.readRows = function(callback) {

  var rows = this.rows;

  console.log(rows[0].split('\t'));
  console.log(rows[1].split('\t'));
  console.log(rows[4].split('\t'));

  callback();
};

module.exports = beadChip;