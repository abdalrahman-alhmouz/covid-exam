'use strict';

const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const cors = require('cors');
const override = require('method-override');
require('dotenv').config();

const app = express();
// const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const PORT = process.env.PORT;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(override('_method'));
app.set('view engine', 'ejs');

// ____________________________________________________________________{{1}}


app.get('/',(req,res)=>{
  let url =`https://api.covid19api.com/world/total`
  superagent.get(url).then(data=>{
    res.render('index',{array:data.body})
  }).catch((error) => {
    console.log('Error in your code : ', error);
  });

})
// ____________________________________________________________________{{1}}
// ____________________________________________________________________{{2}}
app.get('/getdata',(req,res)=>{
  let search =req.query.search;
  let from =req.query.from;
  let to =req.query.to;
  let url =`https://api.covid19api.com/country/${search}/status/confirmed?from=${from}T00:00:00Z&to=${to}T00:00:00Z`
  superagent.get(url).then(data=>{
let getdata=data.body
    res.render('getCountryResult',{array:getdata})
  })
 
  });

 

// ____________________________________________________________________{{2}}
// ____________________________________________________________________{{3}}

app.get('/AllCountries',(req,res)=>{
  let url =`https://api.covid19api.com/summary`
  superagent.get(url).then(data=>{
let getdata=data.body.Countries.map(val=>{
  return new Covid(val)
})
    res.render('AllCountries',{array:getdata})
  })
 
  });

   function Covid(ele) {
     this.Country=ele.Country;
     this.TotalConfirmed=ele.TotalConfirmed;
     this.TotalDeaths=ele.TotalDeaths;
     this.TotalRecovered=ele.TotalRecovered;
     this.Date=ele.Date;
    
  }

// ____________________________________________________________________{{3}}
// ____________________________________________________________________{{4}}
app.post('/addDatabase',(req,res)=>{
  let {Country,TotalConfirmed,TotalDeaths,TotalRecovered,Date}=req.body
let insert =`INSERT INTO coronaa(Country,TotalConfirmed,TotalDeaths,TotalRecovered,Date) VALUES($1,$2,$3,$4,$5) RETURNING *`
let values= [Country,TotalConfirmed,TotalDeaths,TotalRecovered,Date]
client.query(insert,values).then(data=>{
res.redirect('/databaseget')
}).catch((error) => {
  console.log('Error in your code : ', error);
});

})

// ____________________________________________________________________{{4}}
// ____________________________________________________________________{{5}}

app.get('/databaseget',(req,res)=>{
let select =`SELECT * FROM coronaa`
client.query(select).then(data=>{

  res.render('MyRecords',{array:data.rows})
  }).catch((error) => {
    console.log('Error in your code : ', error);
  });

})

// ____________________________________________________________________{{5}}
// ____________________________________________________________________{{6}}

app.get('/viewdetal/:id',(req,res)=>{
  let id =req.params.id;
  let select =`SELECT * FROM coronaa WHERE id =$1`
  let value =[id]
  client.query(select,value).then(data=>{
    console.log(data.rows)
    res.render('RecordDetails',{array:data.rows[0]})
    }).catch((error) => {
      console.log('Error in your code : ', error);
    });
  
  })
// ____________________________________________________________________{{6}}
// ____________________________________________________________________{{7}}
app.delete('/deletdb/:id',(req,res)=>{
  let id =req.params.id;
  let value =[id]

  let delet =`DELETE FROM coronaa WHERE id =$1`
  client.query(delet,value).then(()=>{
    res.redirect('/databaseget')
    }).catch((error) => {
      console.log('Error in your code : ', error);
    });

})

// ____________________________________________________________________{{7}}









client
  .connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log('App is listening on PORT: ', PORT);
    });
  })
  .catch((error) => {
    console.log('Error in connecting to DATABASE: ', error);
  });
