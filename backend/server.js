const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/share',(req,res)=>{
  const id = uuidv4();
  res.json({url:`/shared/${id}`});
});

app.use(express.static(path.join(__dirname,'../frontend/dist')));
app.get('*',(req,res)=>{
  res.sendFile(path.join(__dirname,'../frontend/dist/index.html'));
});

const port=process.env.PORT||8080;
app.listen(port,()=>console.log("Server running on "+port));
