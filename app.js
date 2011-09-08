var fs    = require('fs');
var sys   = require('sys');
var com   = require('commander');
var async = require('async');

com
  .version('0.0.1')
  .option('-p, --peppers', 'Add peppers')
  .parse(process.argv);

var path = '/mnt/sample_scanner';


// App requirements
var beadChip = require('./beadChip.js');

// Local DB
var metricsFiles = [];
var beadChips    = [];

var listDir = function() {
  fs.readdir(path, function(err, files) {
    console.log(sys.inspect(files));
    console.log('\n count: ' + files.length);
    menu();
  });
};

var populateMetrics = function() {
  metricsFiles = [];

  var addMetric = function(file, callback) {
      fs.stat(path + '/' + file, function(err, stats) {
        if(stats.isDirectory()) {
          fs.stat(path + '/' + file + '/Metrics.txt', function(err, stats) {
            if(err) {
              callback();
            } else {
              metricsFiles.push(path + '/' + file + '/Metrics.txt');
              callback();
            }
          })
        } else callback();
      });    
  };

  fs.readdir(path, function(err, files) {
    if(err) console.log(err);

    async.forEach(files, addMetric, function(err) {
      if(err) console.log(err);
      console.log(metricsFiles.length + ' metric files found\n');
      menu();
    });
  });
};

var listMetrics = function() {


  metricsFiles.forEach(function(item) {
    if(!item)
      return;
    console.log(item);
  });

  menu();
};

var scanMetrics = function() {
  beadChips = [];

  var singleScan = function(file, callback) {
    beadChips.push(new beadChip(file));
    callback();
  };

  async.forEach(metricsFiles, singleScan, function(err) {
    console.log(beadChips.length + ' beadchips initialized\n'); 
    menu();
  });
};

var menu = function() {

  var list = ['listMetricsFiles', 'scanMetricsFiles', 'showMetric', 'quit'];

  console.log('\nChoose an option: ');
  com
    .choose(list, function(i) { 

      if(list[i] == "listMetricsFiles")
        listMetrics();
      if(list[i] == "scanMetricsFiles")
        scanMetrics();
      if(list[i] == "showMetric") {
        com.prompt('metricIndex: ', Number, function(index) {
          beadChips[index].readRows(menu);
        });
      }
      if(list[i] == "quit")
        process.exit();
    });
};

populateMetrics();
