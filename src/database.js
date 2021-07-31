const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/simplejswt',{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(console.log('database connecteds'));