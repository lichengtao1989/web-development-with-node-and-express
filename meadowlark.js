var express = require('express');
var fs = require('fs');
var credentials = require('./credentials.js');
var vhost = require('vhost');
var app = express();
app.use(require('cors')());
var admin = express.Router();
app.use(vhost('admin.*', admin));
// 创建 admin 的路由； 它们可以在任何地方定义
admin.get('/', function(req, res) {
    res.render('admin/home');
});
admin.get('/users', function(req, res) {
    res.render('admin/users');
});


var http = require('http');
var formidable = require('formidable');

var jqupload = require('jquery-file-upload-middleware');

app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')());

/*http.get('http://w.api.xiaoying.co/webapi2/rest/user/detail?appkey=30000000&auid=e1nv', function(res) {
            var body = '';
            res.on('data', function(chunk) {
                body += chunk;
            });
            res.on('end', function() {
                body = JSON.parse(body);
                console.log(typeof body)
                console.log(body)
             
            });});
*/
//域
app.use(function(req, res, next) {
    // 为这个请求创建一个域
    var domain = require('domain').create();
    // 处理这个域中的错误
    domain.on('error', function(err) {
        console.error('DOMAIN ERROR CAUGHT\n', err.stack);
        try {
            // 在 5 秒内进行故障保护关机
            setTimeout(function() {
                console.error('Failsafe shutdown.');
                process.exit(1);
            }, 5000);
            // 从集群中断开
            var worker = require('cluster').worker;
            if (worker) worker.disconnect();
            // 停止接收新请求
            server.close();
            try {
                // 尝试使用 Express 错误路由
                next(err);
            } catch (err) {
                // 如果 Express 错误路由失效， 尝试返回普通文本响应
                console.error('Express error mechanism failed.\n', err.stack);
                res.statusCode = 500;
                res.setHeader('content-type', 'text/plain');
                res.end('Server error.');
            }
        } catch (err) {
            console.error('Unable to send 500 response.\n', err.stack);
        }
    });
    // 向域中添加请求和响应对象
    domain.add(req);
    domain.add(res);
    // 执行该域中剩余的请求链
    domain.run(next);
});
// 其他中间件和路由放在这里
var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('Listening on port %d.', app.get('port'));
});
//域


app.use('/upload', function(req, res, next) {
    var now = Date.now();
    jqupload.fileHandler({
        uploadDir: function() {
            return __dirname + '/public/uploads/' + now;
        },
        uploadUrl: function() {
            return '/uploads/' + now;
        },
    })(req, res, next);
});
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


function startServer() {
    http.createServer(app).listen(app.get('port'), function() {
        console.log('Express started in ' + app.get('env') +
            ' mode on http://localhost:' + app.get('port') +
            '; press Ctrl-C to terminate.');
    });
}
if (require.main === module) {
    // 应用程序直接运行； 启动应用服务器
    startServer();
} else {
    // 应用程序作为一个模块通过 "require" 引入 : 导出函数
    // 创建服务器
    module.exports = startServer;
}


// http.createServer(app).listen(app.get('port'), function(){
// console.log( 'Express started in ' + app.get('env') +
// ' mode on http://localhost:' + app.get('port') +
// '; press Ctrl-C to terminate.' );
// });

// app.listen(app.get('port'), function() {
//     console.log('Express started on http://localhost:' +
//         app.get('port') + '; press Ctrl-C to terminate.');
// });
app.use(express.static(__dirname + '/public')); //静态资源指向public目录 访问用/js/...
app.use(require('body-parser')());
// var fortune=require('./lib/fotpage1/fortune.js');
var fortune = require('./lib/fortune.js');


/*
switch(app.get('env')){
case 'development':
// 紧凑的、 彩色的开发日志
app.use(require('morgan')('dev'));
break;
case 'production':
// 模块 'express-logger' 支持按日志循环
app.use(require('express-logger')({
path: __dirname + '/log/requests.log'
}));
break;
}
*/

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
app.get('/newsletter', function(req, res) {
    // 我们会在后面学到 CSRF……目前， 只提供一个虚拟值
    res.render('newsletter', { csrf: 'CSRF token goes here' });
});
app.get('/thank-you', function(req, res) {
    res.render('thank-you');
});
/*form
app.post('/process', function(req, res){
console.log('Form (from querystring): ' + req.query.form);
console.log('CSRF token (from hidden form field): ' + req.body._csrf);
console.log('Name (from visible form field): ' + req.body.name);
console.log('Email (from visible form field): ' + req.body.email);
res.redirect(303, '/thank-you');
})*/
app.post('/process', function(req, res) {
    if (req.xhr || req.accepts('json,html') === 'json') {
        // 如果发生错误， 应该发送 { error: 'error description' }
        res.send({ success: true });
    } else {
        // 如果发生错误， 应该重定向到错误页面
        res.redirect(303, '/thank-you');
    }
});


app.get('/', function(req, res) {
    res.render('home');
});

app.get('/foo',
    function(req, res, next) {
        if (Math.random() < 0.33) return next();
        res.send('red');
    },
    function(req, res, next) {
        if (Math.random() < 0.5) return next();
        res.send('green');
    },
    function(req, res) {
        res.send('blue');
    }
)


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
app.get('/nursery-rhyme', function(req, res) {
    res.render('nursery-rhyme');
});

app.get('/data/nursery-rhyme', function(req, res) {
    res.json({
        animal: 'squirrel',
        bodyPart: 'tail',
        adjective: 'bushy',
        noun: 'heck',
    });
});

app.get('/contest/vacation-photo', function(req, res) {
    var now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(),
        month: now.getMonth()
    });
});
app.post('/contest/vacation-photo/:year/:month', function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if (err) return res.redirect(303, '/error');
        console.log('received fields:');
        console.log(fields);
        console.log('received files:');
        console.log(files);
        res.redirect(303, '/thank-you');
    });
});


var autoViews = {};
var fs = require('fs');
app.use(function(req, res, next) {
    var path = req.path.toLowerCase();
    // 检查缓存； 如果它在那里， 渲染这个视图
    if (autoViews[path]) return res.render(autoViews[path]);
    // 如果它不在缓存里， 那就看看有没有 .handlebars 文件能匹配
    if (fs.existsSync(__dirname + '/views' + path + '.handlebars')) {
        autoViews[path] = path.replace(/^\//, '');
        return res.render(autoViews[path]);
    }
    //没发现视图； 转到 404 处理器
    next();
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
app.use(function(req, res, next) {

    req.session.userName = 'Anonymous';
    var colorScheme = req.session.colorScheme || 'dark';
});

/*禁用 Express 的 X-Powered-By 头信息很简单：
app.disable('x-powered-by');*/
