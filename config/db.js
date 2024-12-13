const mongoose = require('mongoose');
const dbString = process.env.MONGO_URI;


const connection = async ()=>{
    try{
        const db = await mongoose.connect(dbString , {
            useUnifiedTopology : true
        });

          console.log('database is connected!');
    }catch(err){
        console.log(err.message)
    }

  
}

module.exports = connection;