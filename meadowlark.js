var express = require('express');
var fs = require('fs');

var app = express();
// var handlebars = require('express3-handlebars').create({ defaultLayout: 'main' });
var handlebars = require('express3-handlebars').create({
    defaultLayout: 'main',
    helpers: {
        section: function(name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
/*
你可以在创建 express3-handlebats 实
例 require('express3-handlebars').create({ extname: '.hbs' }) 的时候，
将扩展名改成同样常见的 .hbs
*/
app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
    console.log('Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.');
});
app.use(express.static(__dirname + '/public')); //静态资源指向public目录 访问用/js/...

// var fortune=require('./lib/fotpage1/fortune.js');
var fortune = require('./lib/fortune.js');

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

app.use(function(req, res, next) {
    res.locals.showTests = app.get('env') !== 'production' &&
        req.query.test === '1';
    next();
});

function getWeatherData() {
    return {
        locations: [{
            name: 'Portland',
            forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
            iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
            weather: 'Overcast',
            temp: '54.1 F (12.3 C)',
        }, {
            name: 'Bend',
            forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
            iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
            weather: 'Partly Cloudy',
            temp: '55.0 F (12.8 C)',
        }, {
            name: 'Manzanita',
            forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
            iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
            weather: 'Light Rain',
            temp: '55.0 F (12.8 C)',
        }, ],
    };
};
app.use(function(req, res, next) {
    if (!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weather = getWeatherData();
    next();
});
/*中间件的顺序很重要，越重要，越常用的东西放最上面*/

/*页面路由部分*/

app.get('/', function(req, res) {
    res.render('home');
});
app.get('/about', function(req, res) {

    // res.render('about',{fortune:fortune.getFortune()});
    res.render('about', {
        fortune: fortune.getFortune(),
        pageTestScript: '/qa/tests-about.js'
    });
});
app.get('/tours/hood-river', function(req, res, next) {

    res.render('tour/hood-river');
});
app.get('/tours/request-group-rate', function(req, res, next) {

    res.render('tour/request-group-rate');
});

app.get('/headers_req_res', function(req, res) {
    res.set('Content-Type', 'text/plain');
    var s = '';
    for (var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
    res.send(s);
});
app.get('/jquerytest', function(req, res) {
    res.render('jquerytest');
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
});

/*页面路由部分*/


/*禁用 Express 的 X-Powered-By 头信息很简单：
app.disable('x-powered-by');*/
