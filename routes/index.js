
/*
 * GET home page.
 */



var db = require('./../database.js').db();
var crypto = require('crypto');
var async = require('async');

exports.index = function(req, res){
  res.render('index', { title: 'Arrs' });
};

exports.register = function(req, res){
  var apikey = (Math.random()+1).toString(36).substr(2,10);
  db.users.save(apikey, {subscriptions: [],latestFetch: 0}, function(err, resp){
    db.users.get(apikey, function(err, resp){
      res.json(resp);
    });
  }) 
};

exports.add = function(req, res){
  var apikey = req.params.apikey;
  var xmlUrl = req.params.xmlUrl;
  var urlHash = md5(xmlUrl);

  db.users.get(apikey,function(err, doc){
    if(!err){
      doc.subscriptions.push({urlHash: urlHash, xmlUrl: xmlUrl});
      db.users.save(apikey,doc, function(err, resp){
        db.users.get(apikey, function(err, doc){
          res.json(doc);
        });
        db.sites.query({
          method: 'HEAD', 
          path: '/' + urlHash, 
        },  function (err, res) {
              if(!res.etag){
                db.sites.save(urlHash,{meta: {xmlUrl: xmlUrl}, articles: []});
              }
            });
      });
    }else{
      res.json(err);
    }
  });
};

var latestFetch;
exports.fetch = function(req, res){
  var apikey = req.params.apikey;

  db.users.get(apikey, function(err, doc){
    if(err){
      res.json(err);
      return;
    }
    
    latestFetch = doc.latestFetch;

    async.mapLimit(doc.subscriptions, 14, fetch, function(err, result){
      console.log('fin fetching');

      var endResult = [];
      var latestTs;

      result.forEach(function(item){
        if(item !== undefined){
          latestFetch = item.articles[0].crawled;
          item.articles.forEach(function(article){
            if(article.crawled > latestFetch){
              latestFetch = article.crawled;
            }
          });

          endResult.push(item);
        }
      });
      
      res.json(endResult);
      doc.latestFetch = latestFetch;
      db.users.save(apikey, doc, function(){});
    });
  });
}

exports.info = function(req, res){
  var apikey = req.params.apikey;
  db.users.get(apikey, function(err, doc){
    res.send(doc);
  });
};

exports.infodb = function(req, res){
  db.sites.all({include_docs:true},function(err, docs){
    res.json(docs);
  });
};

function md5(str){
  return crypto.createHash('md5').update(str).digest("hex");
}

function fetch(site, done){
  var articles = [];
  db.sites.get(site.urlHash, function(err, doc){
    console.log(doc);
    if(!err){
      doc.articles.forEach(function(item){
        if(item.crawled > latestFetch){
          articles.push(item);
        }
      });
      if(articles.length > 0) { 
        var result = {xmlUrl: site.xmlUrl, articles: articles};
        done(null,result);
        return;
      }
    }
    done(null);
  });
}
