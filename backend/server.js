import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const app=express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('frontend'));

const pool=process.env.DATABASE_URL?new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.NODE_ENV==='production'?{rejectUnauthorized:false}:false}):null;

async function initDB(){
 if(!pool)return;
 await pool.query(`CREATE TABLE IF NOT EXISTS shared_sessions(token TEXT PRIMARY KEY,title TEXT,date DATE);`);
 await pool.query(`CREATE TABLE IF NOT EXISTS personal_events(id SERIAL PRIMARY KEY,title TEXT,date DATE);`);
}
initDB();

app.post('/api/shared/session',async(req,res)=>{
 const token=uuidv4();
 if(pool){await pool.query('INSERT INTO shared_sessions(token,title,date) VALUES($1,$2,$3)',[token,req.body.title,req.body.date]);}
 res.json({token});
});

app.post('/api/personal',async(req,res)=>{
 if(pool){await pool.query('INSERT INTO personal_events(title,date) VALUES($1,$2)',[req.body.title,req.body.date]);}
 res.json({success:true});
});

const PORT=process.env.PORT||8080;
app.listen(PORT,()=>console.log('Server on '+PORT));
