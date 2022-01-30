var expressApp = require('express'),http = require('http'), routes = require('./routes'), account = require('./routes/account'), path = require('path');
var session = require('express-session');
var bodyParser = require('body-parser');
const pool = require('./dbconfig');
var app = expressApp();
const multer = require('multer');
const { request } = require('express');



const storage = multer.diskStorage({
    
  destination: function (req, file, cb) {
      cb(null, "src/styles/images")   
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))      
  }
});

const fileFilter = (req, file, cb) => {
  if((file.mimetype).includes('jpeg') || (file.mimetype).includes('png') || (file.mimetype).includes('jpg')){
      cb(null, true);
  } else{
    cb(new Error("Image uploaded is not of type jpg/jpeg or png"),false)

  }

};
const upload = multer({ storage: storage, fileFilter: fileFilter,})



app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

var host = "0.0.0.0";
var port = "5000";
if(process.argv.length > 2){
    port = process.argv[2];
}
app.listen(process.env.PORT || 5000,host);
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use("/src/styles", expressApp.static(__dirname + '/src/styles'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.get('/', routes.index);
app.post('/login',account.login);
app.get('/login',account.login);
app.post('/signup',account.signup);
app.get('/signup',account.signup);
app.post('/logout',account.logout);
app.get('/logout',account.logout);
app.post('/profile',account.profile);
app.get('/profile',account.profile);
app.post('/edit',account.editprofile);
app.get('/edit',account.editprofile);
app.get('/explore',account.explore);
app.post('/explore_matches', account.explore_matches);
app.get('/explore_matches',account.explore_matches);
app.post('/matches_block', account.matches_block);
app.get('/matches_block',account.matches_block);
app.post('/search',account.search);
app.post('/matches_unblock', account.matches_unblock);
app.get('/matches_unblock',account.matches_unblock);
app.post('/blocked', account.blocked);
app.get('/blocked',account.blocked);
app.post('/changepass',account.changepass);
app.get('/changepass',account.changepass);
app.get('/home', (req, res) => {
  res.render('home');
 });
app.post('/upload', upload.single('avatar'), function (req, res, next) {

    
  if(req.file === undefined){

    message = "File Not Supported";
    res.render("editprofile",{message:message});
  }
pool.query('UPDATE public.user_accounts SET profile_picture= $1 WHERE account_id = $2;', [req.file.filename,req.session.userId], function(error, results, fields) {
  if (error) {
      message = "profupdatefailed";
      res.render("editprofile",{message:message});
      console.log(error);
          
      }
      else{
          message = "profupdatesuccess";
          res.render('editprofile',{message: message});
      }   
      res.end();
  });

  
});

