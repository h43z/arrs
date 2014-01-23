arrs
====

Arrs is an API which allows you to get only the latest rss feeds

without fiddeling with the actual download filter and parse process

so you can concentrate on your app alone.

For storing CouchDB is used.




## Register an API-Key
```
~$ curl localhost:3000/register
{
  "_id": "j9e4zmplh3",
  "_rev": "1-a3d6044a043ef8f72d8c0ea120c9516f",
  "subscriptions": [],
  "latestFetch": 0
}
```
The "_id" value serves as API-Key.



## Add a Subscription to your account
```
~$ curl localhost:3000/j9e4zmplh3/add/https%3A%2F%2Fnews.ycombinator.com%2Frss
{
  "_id": "j9e4zmplh3",
  "_rev": "2-a3d6044a043ef8f72d8c0ea120c9516f",
  "subscriptions": [
   {
      "urlHash": "adb7ca764a42bad01a0ccae2df09c2fa",
      "xmlUrl": "https://news.ycombinator.com/rss"
   }
 ],
  "latestFetch": 0
}
```

The backend ist constantly crawling all subscriptions.



## Check later to get all articles from all your subscriptions.

If it is the first time your subscription has been crawled you get all articles.
```
~$ curl localhost:3000/j9e4zmplh3/fetch
[
  {
    "xmlUrl": "https://news.ycombinator.com/rss",
    "articles": [
      {
        "title": "Google Video Quality Report",
        "link": "http://www.google.com/get/videoqualityreport/",
        "date": null,
        "pubDate": null,
        "crawled": 1390415967532
      },
        ...
  }
```

The next time you fetch your feeds you only get the newest one thus the one you have

not got at the last fetch. All of the API Calls support jsonp. Just set the callback query parameter.

```
http://localhost:3000/register?callback=MyCallbackFunction

typeof MyCallbackFunction === 'function' && MyCallbackFunction({
  "_id": "yr8kdsa0q2",
  "_rev": "1-a3d6044a043ef8f72d8c0ea120c9516f",
  "subscriptions": [],
  "latestFetch": 0
});
```
