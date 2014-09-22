var fs = require('fs');
var fse = require('fs-extra');
var walk = require('walk');
var eachAsync = require('each-async');
var settings = require('../settings.js').settings,
    databaseUrl = settings.dbname,
    collections = [settings.imageCollection],
    db = require("mongojs").connect(databaseUrl, collections);
exports.mainPage = function(req, res) {
    if (req.body.projectName) {
        var projectName = req.body.projectName;
        fs.mkdir('./public/images/' + projectName, function(error) {
            
            if (error) {
                console.log("name already used")
            } else {
                //res.render('home', { projectName: projectName, a:a,b:b,c:c });
                _getAllImageData(projectName, function(imgData) {
                    if (imgData) {
                        _viewImageTohome(imgData, function(a, b, c) {
                            
                            res.render('home', {
                                projectName: projectName,
                                a: a,
                                b: b,
                                c: c
                            });
                        })
                    } else {
                        res.render('home', {
                            projectName: projectName
                        });
                    }

                });
                //res.render('home', { projectName: req.body.projectName });

            }
        });
    }


}
exports.reloadpage = function(req, res) {
    if (req.body.projectName) {
        var projectName = req.body.projectName;
        _getAllImageData(projectName, function(imgData) {
            if (imgData) {
                _viewImageTohome(imgData, function(a, b, c) {
                    
                    res.render('home', {
                        projectName: projectName,
                        a: a,
                        b: b,
                        c: c
                    });

                })
            } else {
                res.render('home', {
                    projectName: projectName
                });
            }
        });

    } else {
        var projectName = req.params.projectName;
        _getAllImageData(projectName, function(imgData) {
            if (imgData) {
                _viewImageTohome(imgData, function(a, b, c) {
                    console.log(a, b, c)
                    res.render('home', {
                        projectName: projectName,
                        a: a,
                        b: b,
                        c: c
                    });

                })
            } else {
                //res.render('home', { projectName: projectName });
            }
        });

    }
}
exports.saveAll = function(req, res) {
    if (req.body) {
        var imageNames = req.body.pjt_images;
        var folderName = req.body.pjt_name;
        _copyImage(imageNames, folderName, function(imageNamesdata) {
            if (imageNamesdata) {

                _getSortedData(imageNamesdata, folderName, function(sortedData) {
                    if (sortedData) {
                        db[collections].remove();
                        db[collections].insert(sortedData, function(error, doc) {
                            if (error) {
                                throw error;
                            }
                            if (doc) {
                                console.log("data saved")
                            } else {
                                console.log("data not saved");
                            }
                        });
                    }

                });


            } else {
                //no need action
            }

        });

    }

};




function _getSingleImageData(projectName, callback) {

    var files = [];
    // Walker options
    var walker = walk.walk('./public/images/' + projectName, {
        followLinks: false
    });
    walker.on('file', function(root, stat, next) {
        // Add this file to the list of files
        files.push(root + '/' + stat.name);
        next();
    });
    walker.on('end', function() {
        callback(files)
    });
}



exports.viewDir = function(req, res) {
	// 	read dir
	
	var selImg = [];
	
	if (req.body) {
		// folder name
        var pjtDir = req.body.pjt_dir;
        var pjtName = req.body.pjt_name;
        var projectName = pjtName+'/'+pjtDir;
        
        _getSingleImageData(projectName, function(imgData) {
            if (imgData) {
            	_displaySingle(imgData, function(img) {
                    res.render('ajax', {
                        projectName: projectName,
                        selImg: img,
                        pjtDir:pjtDir
                    });
                })
            } else {
            	// render html itself
            	 res.render('ajax', {
                     projectName: projectName,
                     selImg: img,
                     pjtDir:pjtDir
                 });
            }

        });
        
	}
};


exports.delImage = function(req, res) {
	if (req.body) {
		// folder name
        var pjtName = req.body.pjt_name;
        var selImage = req.body.sel_img;
        var tmpName = req.body.tmp_name;
        
    	var delDir = './public/images/'+pjtName+'/deleted';
    	
        fse.ensureDir('./public/images/'+pjtName, function(err) {

        	try {
        	    fse.mkdirsSync(delDir);
                //dir has now been created, including the directory it is to be placed in
        	  } catch(e) {
        	    if ( e.code != 'EEXIST' ){
        	    	// silence, use exists
        	    }
        	  }
        })
        
        fse.move("./public"+selImage, delDir+'/'+tmpName, function(err){
        	if (err) 
        		res.json({ 'status': 'fail' });
        	
        	res.json({'status': 'ok','msg':'moved' });	
    	});
	}
};


function _displaySingle(data, callback) {
    var tmpImage = [];

    eachAsync(data, function(item, index, done) {
        var tempData = item.split("/");
        tmpImage.push(tempData[5])
        done();

    }, function(error) {
    	callback(tmpImage);
    });
}


function _viewImageTohome(data, callback) {
    var a = [];
    var b = [];
    var c = [];

    eachAsync(data, function(item, index, done) {

        var tempData = item.split("/");


        if (tempData[4] == 'a') {
            a.push(tempData[5])
        } else if (tempData[4] == 'b') {
            b.push(tempData[5])
        } else if (tempData[4] == 'c') {
            c.push(tempData[5])
        }

        done();

    }, function(error) {

        callback(a, b, c)

    });
}

function _orderingData(data, projectName, callback) {

        var ans = [];
        eachAsync(data, function(item, index, done) {

            ans.push({
                path: item,
                sort_order: index,
                project_name: projectName
            });
            done();

        }, function(error) {

            callback(ans)

        });

    }
    /***
     * Function for get folder datas
     */

function _getAllImageData(projectName, callback) {

    var files = [];
    // Walker options
    var walker = walk.walk('./public/images/' + projectName, {
        followLinks: false
    });
    walker.on('file', function(root, stat, next) {
        // Add this file to the list of files
        files.push(root + '/' + stat.name);
        next();
    });
    walker.on('end', function() {
        callback(files)
    });
}

function _getSortedData(data, projectName, callback) {

    var ans = [];
    eachAsync(data, function(item, index, done) {
        var i = index + 1;

        ans.push({
            path: item,
            sort_order: i,
            project_name: projectName
        });
        done();

    }, function(error) {
        callback(ans)

    });
}

function _renameSingleImage(item, projectName, index, callback) {

    var i = index + 1;
    i = ('00' + i).slice(-3)
    var imgName = item.split("/");
    var type = imgName[2].split(".");

    fs.rename('./public/images/' + projectName + '/master/' + imgName[2], './public/images/' + projectName + '/master/' + i + '.' + type[1], function(err) {
        if (err) {
        	console.log(err);
            callback(false);
        } else {
            var imgName = './public/images/' + projectName + '/master/' + i + '.' + type[1]

            callback(imgName);
        }
    });
}


function _deleteImage() {

    //fse.removeSync('./public/images/'+projectName);
    //fs.mkdirsSync('./public/images/'+projectName);
    var dir = './public/images/' + projectName + '/master'
    fse.ensureDir(dir, function(err) {

        fse.mkdirsSync('./public/images/' + projectName + '/a/deleted');

        //dir has now been created, including the directory it is to be placed in
    })

    fs.move('./public/images/' + projectName + '/a/1.jpg', './public/images/' + projectName + '/a/deleted', function(err){
    	  if (err) return console.error(err);
    	  console.log("success!")
    	});

}


function _copyImage(data, projectName, callback) {
    data = data.split(",");
    var ans = [];

    //fse.removeSync('./public/images/'+projectName);
    //fs.mkdirsSync('./public/images/'+projectName);
    var dir = './public/images/' + projectName + '/master'
    fse.ensureDir(dir, function(err) {

        fse.removeSync('./public/images/' + projectName + '/master');
        fse.mkdirsSync('./public/images/' + projectName + '/master');

        //dir has now been created, including the directory it is to be placed in
    })

    eachAsync(data, function(item, index, done) {
    	
        var imgName = item.split("/");
        
        fse.copy('./public/images/' + item, './public/images/' + projectName + '/master/' + imgName[2], function(err) {
            if (err) {
            	console.log(err);
                throw err
            } else {
                _renameSingleImage(item, projectName, index, function(datas) {
                    if (datas) {

                        ans.push(datas)
                        done();
                    } else {
                        console.log("not renamed")
                    }
                });

            }
        });

    }, function(error) {
        callback(ans)
    });

}