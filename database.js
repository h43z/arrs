var db = {};
exports.db = function(){
  if(Object.keys(db).length === 0){
    var cradle = require('cradle');

  cradle.setup({
    host: 'localhost';
    cache: false
  });


    var c = new(cradle.Connection);
    db.users = c.database('users');
    db.users.create();

    var c = new(cradle.Connection);
    db.sites = c.database('sites');
    db.sites.create();
  }
  return db;
};
