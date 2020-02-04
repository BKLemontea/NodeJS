module.exports = {
    HTML:function(title, list, body, control){
      return `
      <!doctype html>
      <html>
        <head>
          <title>WEB2 - ${title}</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1><a href="/">WEB</a></h1>
          ${list}
          ${control}
          ${body}ppm
        </body>
      </html>
      `;
    },
    
    List:function(fileList){
      var list = '<ul>';
      var count = 0;
      while(count < fileList.length){
        list = list + `<li><a href="/?id=${fileList[count]}">${fileList[count]}</a></li>`;
        count++;
      }
      list = list + '</ul>';
      return list;
    }
  }