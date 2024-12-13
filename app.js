require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const Session = require('express-session');
const bcrypt = require('bcrypt');
const usermodel = require('./Model/user');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const app = express();
app.use(cookieParser());


const cookieOptions = {
        httpOnly: true,  
        secure: true,          
        sameSite: 'None',      
        path: '/',     
  };

app.use(express.urlencoded({extended: false}));
app.use(express.json());


const connection = require('./config/db');
connection();


// calling localStrategy...
const strategy = require('./config/config');

strategy();



app.use(Session({
    secret : process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized : false,
    store : MongoStore.create({
        mongoUrl : process.env.MONGO_URI,
        mongooseConnection: mongoose.connection
    })
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(cors({
    origin: "https://chartdatafrontend.netlify.app",
    methods: 'GET, POST, PUT, DELETE',
    credentials: true
}));



app.get('/data', (req,res)=>{
    const file = fs.readFileSync('./chart.json', 'utf8');
     const data =  req.cookies.data ? JSON.parse(req.cookies.data) : null;
    res.json({allData: JSON.parse(file) , primaryData: data})
});



app.post('/save', (req,res)=>{
    const {age, gender, startDate, endDate, totalTime, timeTrend} = req.body;
    const data = {
        age: age,
        gender: gender,
        startdate: startDate,
        enddate: endDate,
        totalTime: totalTime,
        timeTrend: timeTrend
    }

    try {
        res.cookie('data', JSON.stringify(data), cookieOptions);
        res.json('data saved successfully!');
    } catch (error) {
        console.log(error)
    }
});



app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      if (!user) {
        return res.status(401).json(info.message || 'Authentication failed');
      }
  
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json( 'Failed to log in user' );
        }else{
            res.cookie('user', JSON.stringify(req.user), cookieOptions);
             res.json(user);
        }

      });
    })(req, res, next);
  });
  
  
  
  app.post('/signup' , async(req,res)=>{
      const {name, email , password}  = req.body;
      const salt = bcrypt.genSaltSync(10);
      try{
          const user = await usermodel.create({
              name : name,
              email : email,
              password : bcrypt.hashSync(`${password}` , salt),
              createdAt : new Date()
          });
      
          await user.save();
        // to store sensitive informatin we can encrypt before storing..
          res.cookie('user', JSON.stringify(user), cookieOptions) //set the consistent user...
          res.json(user); // sent to user..
      }
      catch(err){
         res.sendStatus(500).json(err)  
      }
  }); 



app.get('/user', (req, res)=>{
    const user = req.cookies.user != undefined ? JSON.parse(req.cookies.user) : null;
    if(user){
        res.json(user)
    }    
});




app.get('/logout', (req,res)=>{
    try {
        res.clearCookie('user')
        res.json("logout successfull!")  
    } catch (error) {
        console.log(error)
    }
})



app.listen(4000, ()=>{
    console.log('server is running on port 4000');
})