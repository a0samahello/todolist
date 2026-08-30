const { v4: uuidv4 } = require('uuid');
const http = require('http');
const errHandle = require("./errorHandle.js");
const todos = [
        {
        "title":"今日第一任務"
    }
];

const requestListener = (req, res) => {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
    'Content-Type': 'application/json'
  };

  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  if (req.url === "/todos" && req.method === "GET") {
    res.writeHead(200, headers);
    res.end(JSON.stringify({
      status: "success",
      data: todos,
    }));

  } else if (req.url === "/todos" && req.method === "POST") {
    req.on("end", () => {
      try {
        const title = JSON.parse(body).title;
        if (title !== undefined) {
          const todo = {
            id: uuidv4(),
            title,
          };
          todos.push(todo);
          res.writeHead(200, headers);
          res.end(JSON.stringify({
            status: "success",
            data: todos,
          }));
        } else {
          errorHandle(res);
        }
      } catch (error) {
        errorHandle(res);
      }
    });

  } else if (req.url === "/todos" && req.method === "DELETE") {
    todos.length = 0;
    res.writeHead(200, headers);
    res.end(JSON.stringify({
      status: "success delete",
      data: todos,
    }));
    res.end();
  }else if(req.url.startsWith("/todos/") && req.method === "DELETE"){
    //拆除url取得uuid
    const id = req.url.split("/").pop();
    //比對物件中的id是否有符合的，若有則刪除該物件
    const index = todos.findIndex(element => element.id == id);
    if(index !== -1){
      todos.splice(index, 1);
      res.writeHead(200, headers);
      res.end(JSON.stringify({
        status: "success delete",
        data: todos,
      }));
      res.end();  
    }else{
      errHandle(res);
    }


  }else if(req.url.startsWith("/todos/") && req.method === "PATCH"){
    req.on("end", () => {
      try {
        const todo = JSON.parse(body).title;
        const id = req.url.split("/").pop();
        const index = todos.findIndex(element => element.id == id);

        if(todo !== undefined && index !== -1){
          todos[index].title = todo;
          res.writeHead(200, headers);
          res.end(JSON.stringify({
            status: "success",
            data: todos,
          }));

        }else{
          errHandle(res);
        }

      }catch{
        errHandle(res);
      }
    })
    //跨網域設計
  }else if(req.method == "OPTIONS"){
    res.writeHead(200,headers);
    res.end();
  
  }else {
    res.writeHead(404, headers);
    res.end(JSON.stringify({
      status: "false",
      message: "Not Found",
    }));
  }
};

const server = http.createServer(requestListener);
server.listen(3005);

