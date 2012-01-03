var http = require("http");
var Url = require("url");
var querystring = require("querystring");

var GitHubApi = require("github").GitHubApi;

var querystring= require('querystring'),
    crypto= require('crypto'),
    https= require('https'),
    URL= require('url');
    // OAuthUtils= require('./_utils');

var OAuth2 = function(clientId, clientSecret, baseSite, authorizePath, accessTokenPath) {
  this._clientId= clientId;
  this._clientSecret= clientSecret;
  this._baseSite= baseSite;
  this._authorizeUrl= authorizePath || "/oauth/authorize";
  this._accessTokenUrl= accessTokenPath || "/oauth/access_token";
  this._accessTokenName= "access_token";
}

// This 'hack' method is required for sites that don't use
// 'access_token' as the name of the access token (for requests).
// ( http://tools.ietf.org/html/draft-ietf-oauth-v2-16#section-7 )
// it isn't clear what the correct value should be atm, so allowing
// for specific (temporary?) override for now.
OAuth2.prototype.setAccessTokenName= function ( name ) {
  this._accessTokenName= name;
}

OAuth2.prototype._getAccessTokenUrl= function() {
  return this._baseSite + this._accessTokenUrl; /* + "?" + querystring.stringify(params); */
}

OAuth2.prototype._request= function(method, url, headers, post_body, access_token, callback) {

  var creds = crypto.createCredentials({ });
  var parsedUrl= URL.parse( url, true );
  if( parsedUrl.protocol == "https:" && !parsedUrl.port ) parsedUrl.port= 443;

  var realHeaders= {};
  if( headers ) {
    for(var key in headers) {
      realHeaders[key] = headers[key];
    }
  }
  realHeaders['Host']= parsedUrl.host;

  realHeaders['Content-Length']= post_body ? Buffer.byteLength(post_body) : 0;
  if( access_token ) {
    if( ! parsedUrl.query ) parsedUrl.query= {};
    parsedUrl.query[this._accessTokenName]= access_token;
  }

  var result= "";
  var queryStr= querystring.stringify(parsedUrl.query);
  if( queryStr ) queryStr=  "?" + queryStr;
  var options = {
    host:parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.pathname + queryStr,
    method: method,
    headers: realHeaders
  };

  // Some hosts *cough* google appear to close the connection early / send no content-length header
  // allow this behaviour.
  var allowEarlyClose= (function( hostName ) {
    return hostName.match(".*google.com$")
  })(options.host);
  var callbackCalled= false;
  function passBackControl( response, result ) {
    if(!callbackCalled) {
      callbackCalled=true;
      if( response.statusCode != 200 ) {
        callback({ statusCode: response.statusCode, data: result });
      } else {
        callback(null, result, response);
      }
    }
  }

  request = https.request(options, function (response) {
    response.on("data", function (chunk) {
      result+= chunk
    });
    response.on("close", function (err) {
      if( allowEarlyClose ) {
        passBackControl( response, result );
      }
    });
    response.addListener("end", function () {
      passBackControl( response, result );
    });
  });
  request.on('error', function(e) {
    callbackCalled= true;
    callback(e);
  });

  if(  method == 'POST' && post_body ) {
     request.write(post_body);
  }
  request.end();
}


OAuth2.prototype.getAuthorizeUrl= function( params ) {
  var params= params || {};
  params['client_id'] = this._clientId;
  params['type'] = 'web_server';
  return this._baseSite + this._authorizeUrl + "?" + querystring.stringify(params);
}

OAuth2.prototype.getOAuthAccessToken= function(code, params, callback) {
  var params= params || {};
  params['client_id'] = this._clientId;
  params['client_secret'] = this._clientSecret;
  params['type']= 'web_server';
  params['code']= code;

  var post_data= querystring.stringify( params );
  var post_headers= {
       'Content-Type': 'application/x-www-form-urlencoded'
   };


  this._request("POST", this._getAccessTokenUrl(), post_headers, post_data, null, function(error, data, response) {
    if( error )  callback(error);
    else {
      var results;
      try {
        // As of http://tools.ietf.org/html/draft-ietf-oauth-v2-07
        // responses should be in JSON
        results= JSON.parse( data );
      }
      catch(e) {
        // .... However both Facebook + Github currently use rev05 of the spec
        // and neither seem to specify a content-type correctly in their response headers :(
        // clients of these services will suffer a *minor* performance cost of the exception
        // being thrown
        results= querystring.parse( data );
      }
      var access_token= results["access_token"];
      var refresh_token= results["refresh_token"];
      delete results["refresh_token"];
      callback(null, access_token, refresh_token);
    }
  });
}

// Deprecated
OAuth2.prototype.getProtectedResource= function(url, access_token, callback) {
  this._request("GET", url, {}, "", access_token, callback );
}

OAuth2.prototype.get= function(url, access_token, callback) {
  this._request("GET", url, {}, "", access_token, callback );
}


var github = new GitHubApi(true);
var user = github.getUserApi();
var repo = github.getRepoApi();

var clientId = "e8c434a1c92e9de7ff8d";
var secret = "1d0fcbb060e1dd86a0aa3d12265419c9bb19a333";
var oauth = new OAuth2(clientId, secret, 'https://github.com/', 'login/oauth/authorize', 'login/oauth/access_token');

// for demo purposes use one global access token
// in production this has to be stored in a user session
var accessToken = "";

http.createServer(function(req, res) {
    var url = Url.parse(req.url);
    var path = url.pathname;
    var query = querystring.parse(url.query);

    if (path == "/" || path.match(/^\/user\/?$/)) {

        // redirect to github if there is no access token
        if (!accessToken) {
            res.writeHead(303, {
                Location: oauth.getAuthorizeUrl({
                  redirect_uri: 'http://localhost:7878/github-callback',
                  scope: "public_repo,repo"
                })
            });
            res.end();
            return;
        }

        // use github API
        user.show(function(err, user) {
            if (err) {
                res.writeHead(err.status);
                res.end(JSON.stringify(err));
                return;
            }
            res.writeHead(200);
            res.end(JSON.stringify(user));
        });
        return;
    }
    // URL called by github after authenticating
    else if (path.match(/^\/github-callback\/?$/)) {
        // upgrade the code to an access token
        oauth.getOAuthAccessToken(query.code, {}, function (err, access_token, refresh_token) {
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end(err + "");
                return;
            }

            accessToken = access_token;

            // authenticate github API
            github.authenticateOAuth(accessToken);

            //redirect back
            res.writeHead(303, {
                Location: "/"
            });
            res.end();
        });
        return;
    }

    res.writeHead(404);
    res.end("404 - Not found");
}).listen(7878);