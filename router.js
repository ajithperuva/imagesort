var user = require('./routes/user');
var routes = require('./routes');
var imageSave = require('./routes/imageSave');
module.exports.route = function(app) {

    module.exports = app;
	app.get('/', routes.index);
	app.get('/users', user.list);
	app.post('/save',function (req,res){
		imageSave.saveAll(req,res);
	});
	app.post('/save-project-name', function(req, res){
		imageSave.mainPage(req, res);
	});
	app.post('/show-project', function(req, res){
		imageSave.reloadpage(req, res);
	});
	app.get('/show/:projectName?', function(req, res){
		imageSave.reloadpage(req, res);
	});
	
	app.post('/view-dir', function(req, res){
		imageSave.viewDir(req, res);
	});
	
	app.post('/del-image', function(req, res){
		imageSave.delImage(req, res);
	});
}