var fortunes = [
"Conquer your fears or they will conquer you.",
"Rivers need springs.",
"Do not fear what you don't know.",
"You will have a pleasant surprise.",
"Whenever possible, keep it simple.",
];


var express = require('express');
var fs = require('fs');

var app = express();
var handlebars=require('express3-handlebars').create({defaultLayout:'main'});
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
    console.log('Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.')
});
app.use(express.static(__dirname+'/public'));
/*app.get('/', function(req, res) {

    // fs.readFile(__dirname + '/public/home.html', function(err, data) {
    //         res.writeHead(200, { 'Content-Type': 'text/html' });
    //         res.end(data)
    //     });

			 res.type('text/plain');
             res.send('Meadowlark Travel');
});
app.get('/about', function(req, res){
res.type('text/plain');
res.send('About Meadowlark Travel');
});*/

app.get('/',function(req,res){
	res.render('home');
});
app.get('/about',function(req,res){
	var randomFortune=fortunes[Math.floor(Math.random() * fortunes.length)];
	res.render('about',{fortune:randomFortune});
});
app.use(function(req, res) {
    res.type('text/plain');
    res.status(404);
    res.send('404-Not Found');
});

app.use(function(err, res, req, next) {
    console.error(error.stack);
    res.type('text/plain');
    res.status(500);
    res.send('500-Server Error');
})
//test s