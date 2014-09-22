// create a settings object
var settings = {};

// the port to listen on
settings.port = 3000;


//DB Configuration
settings.dbname="myImageSave";
settings.databaseUrl = settings.dbname;
settings.imageCollection="image_data";

// set the db path
settings.dbPath = 'mongodb://192.168.2.33:27017/'+settings.dbname;

// export the settings object
exports.settings = settings;
