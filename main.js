var http = require('http');
var fs = require('fs');
var url = require('url'); // require('url') : url 이라는 Module을 사용할 것이다.
var qs = require('querystring');
const fileDir = './Data';

function templateHTML(title, list, body, control){
  return `
  <!doctype html>
  <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
  </html>
  `;
}

function templateList(fileList){
  var list = '<ul>';
  var count = 0;
  while(count < fileList.length){
    list = list + `<li><a href="/?id=${fileList[count]}">${fileList[count]}</a></li>`;
    count++;
  }
  list = list + '</ul>';
  return list;
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if(pathname === '/'){
      if(queryData.id === undefined){ //undefined 정의되어있지않음
        fs.readdir(fileDir, function(error, fileList){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = templateList(fileList);
          var template = templateHTML(
            title, 
            list, 
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
            );
          response.writeHead(200);
          response.end(template);
        });
      } else{
        fs.readdir(fileDir, function(error, fileList){
          fs.readFile(`data/${queryData.id}`, 'utf-8', function(err, description){
            var title = queryData.id;
            var list = templateList(fileList);
            var template = templateHTML(
              title, 
              list, 
              `<h2>${title}</h2>${description}`,
              `<a href="/create">create</a>
              <a href="/update?id=${title}">update</a>
              <form action="/delete_process" method="post">
                <input type="hidden" name ="id" value="${title}">
                <input type="submit" value="delete">
              </form>`
              );
            response.writeHead(200);
            //fs.readFile(__dirname + _url) : 사용자가 접속한 url에 따라서 해당 파일들을 읽어줌
            //response.end(fs.readFileSync(__dirname + _url)); // 사용자에게 데이터를 전송함
            response.end(template);
          });
        });
      }
    } else if(pathname === "/create") {
      fs.readdir(fileDir, function(error, fileList){
        var title = 'WEB - create';
        var list = templateList(fileList);
        var template = templateHTML(title, list, `
        <form action="/create_process" method="post"> 
          <p><input type="text" name="title" placeholder="title"></p>
          <p><textarea name="description" placeholder="description"></textarea></p>
          <p><input type="submit"></p>
        </form>
        `, '');
        response.writeHead(200);
        response.end(template);
      });
    } else if(pathname === '/create_process') {
      var body = '';
      request.on('data', function(data){
        body += data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        fs.writeFile(`${fileDir}/${title}`, description, 'utf8', 
        function(err){
          response.writeHead(302, {Location:`/?id=${title}`});
          response.end();
        });
      });
    } else if(pathname === '/update') {
      fs.readdir(fileDir, function(error, fileList){
        fs.readFile(`data/${queryData.id}`, 'utf-8', function(err, description){
          var title = queryData.id;
          var list = templateList(fileList);
          var template = templateHTML(
            title, 
            list, 
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value=${title}></p>
              <p><textarea name="description" placeholder="description">${description}</textarea></p>
              <p><input type="submit"></p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
            );
          response.writeHead(200);
          response.end(template);
        });
      });
    } else if(pathname === '/update_process') {
      var body = '';
      request.on('data', function(data){
        body += data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`${fileDir}/${id}`, `${fileDir}/${title}`, function(error){
          fs.writeFile(`${fileDir}/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location:`/?id=${title}`});
            response.end();
          })
        });
      });
    } else if(pathname === '/delete_process') {
      var body = '';
      request.on('data', function(data){
        body += data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        fs.unlink(`${fileDir}/${id}`, function(erroe){
          response.writeHead(302, {Location:`/`});
          response.end();
        })
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(8000);