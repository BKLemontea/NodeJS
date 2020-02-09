var http = require('http');
var fs = require('fs');
var url = require('url'); // require('url') : url 이라는 Module을 사용할 것이다.
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
const fileDir = './Data';

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if(pathname === '/'){
      if(queryData.id === undefined){ //undefined 정의되어있지않음
        fs.readdir(fileDir, function(error, fileList){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.List(fileList);
          var html = template.HTML(
            title, 
            list, 
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
            );
          response.writeHead(200);
          response.end(html);
        });
      } else{
        fs.readdir(fileDir, function(error, fileList){
          var filteredID = path.parse(queryData.id).base;
          fs.readFile(`data/${filteredID}`, 'utf-8', function(err, description){
            var title = queryData.id;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
              allowedTags:['h1']
            }); // 소독의 개념이다. 특정 태그들을 삭제함. allowedTags를 사용하여 특정 태그는 허용할 수 있다.
            var list = template.List(fileList);
            var html = template.HTML(
              title, 
              list, 
              `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
              `<a href="/create">create</a>
              <a href="/update?id=${sanitizedTitle}">update</a>
              <form action="/delete_process" method="post">
                <input type="hidden" name ="id" value="${sanitizedTitle}">
                <input type="submit" value="delete">
              </form>`
              );
            response.writeHead(200);
            //fs.readFile(__dirname + _url) : 사용자가 접속한 url에 따라서 해당 파일들을 읽어줌
            //response.end(fs.readFileSync(__dirname + _url)); // 사용자에게 데이터를 전송함
            response.end(html);
          });
        });
      }
    } else if(pathname === "/create") {
      fs.readdir(fileDir, function(error, fileList){
        var title = 'WEB - create';
        var list = template.List(fileList);
        var html = template.HTML(title, list, `
        <form action="/create_process" method="post"> 
          <p><input type="text" name="title" placeholder="title"></p>
          <p><textarea name="description" placeholder="description"></textarea></p>
          <p><input type="submit"></p>
        </form>
        `, '');
        response.writeHead(200);
        response.end(html);
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
        var filteredID = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredID}`, 'utf-8', function(err, description){
          var title = queryData.id;
          var list = template.List(fileList);
          var html = template.HTML(
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
          response.end(html);
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
        var filteredID = path.parse(post.id).base;
        fs.unlink(`${fileDir}/${filteredID}`, function(erroe){
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