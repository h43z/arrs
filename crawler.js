var db = require('./database.js').db();
var feedParser = require('feedparser');
var request = require('request');
var async = require('async');

var sites = [];
db.sites.all({include_docs:true},function(err, docs){
  docs.forEach(function(item){
    sites.push({id: item._id, xmlUrl: item.meta.xmlUrl});
  });
  
  async.mapLimit(sites,5,crawl,function(err, res){});
});


function crawl(site,done){
  var articles = [];
  var metaData;

  // NYI: request optimization
  //      etag, last-modified

  request({ uri: site.xmlUrl, 
            timeout: 5000,
            followRedirects:true,
            maxRedirects:30
          },function(err,resp,body){done(null)})
    
    .pipe(new feedParser())
    .on('error',function(err){})
    .on('meta', function (meta) {
      metaData = {
        title: meta.title,
        link: meta.link,
        xmlUrl: meta.xmlUrl
      };
    })
    .on('readable', function (x) {
      var stream = this
      var item;
      while (item = stream.read()) {
        var timeStamp = +new Date;
        var article = {
          title: item.title,
          link: item.link || item.origlink,
          date: item.date,
          pubDate: item.pubdate,
          crawled: timeStamp
        }
        articles.push(article);
      }
    })
    .on('end',function(){
      var result = {
        meta: metaData || false,
        articles: articles,
      }
      if(result.meta){
        updateDb(site.id,result);
      }
        done(null);
    
    })
}

function updateDb(hash, result){
  db.sites.get(hash,function(err, doc){
    var newDoc = {};
    newDoc.meta = result.meta;
    console.log('crawling: ' + doc.meta.xmlUrl);    
    var reallyNew = result.articles;
    

    // which articles already in db
    doc.articles.forEach(function(olditem){
      result.articles.forEach(function(newitem){
        if(newitem.link === olditem.link){
          //remove from array
          reallyNew = reallyNew.filter(function( obj ) {
              return obj.link !== olditem.link;
          });
        }
      });
    });
    
    if(reallyNew.length > 0){
      newDoc.articles = doc.articles.concat(reallyNew);
      db.sites.save(hash,newDoc);
    }

  });  
}



