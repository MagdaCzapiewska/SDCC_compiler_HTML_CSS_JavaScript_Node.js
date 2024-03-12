const multer = require('multer');
const Home = require('../controllers/Home');
const File = require('../controllers/File');
const Folder = require('../controllers/Folder');
const Compile = require('../controllers/Compile');

module.exports.init = (app, db) => {
    const homeController = new Home(db);
    const fileController = new File(db);
    const folderController = new Folder(db);
    const compileController = new Compile(db);

    const multipartBodyOnly = multer().none(); //middleware
    const multipartWithFile = multer({storage: multer.memoryStorage()}).any(); // middleware

    app.get('/', (req, res) => homeController.getHome(req, res));
    app.get("/error", (req, res) => homeController.getError(req, res));
    
    app.get("/folder/:id/add-folder", (req, res) => folderController.getNewFolder(req, res));
    app.post("/folder/:id/add-folder", multipartBodyOnly, (req, res) => folderController.postNewFolder(req, res));
    app.get("/folder/:id/delete", (req, res) => folderController.getDeleteFolder(req, res));
    app.post("/folder/:id/delete", (req, res) => folderController.postDeleteFolder(req, res));
    
    app.get("/folder/:id/add-file", (req, res) => fileController.getNewFile(req, res));
    app.post("/folder/:id/add-file", multipartWithFile, (req, res) => fileController.postNewFile(req, res));

    app.get("/file/:id/delete-section/:start_line/:end_line", (req, res) => fileController.getDeleteSection(req, res));
    app.post("/file/:id/delete-section/:start_line/:end_line", (req, res) => fileController.postDeleteSection(req, res));
    app.post("/file/:id/create-section/:start_line/:end_line/:section_name", (req, res) => fileController.postCreateSection(req, res));
    
    app.get("/file/:id/delete", (req, res) => fileController.getDeleteFile(req, res));
    app.post("/file/:id/delete", (req, res) => fileController.postDeleteFile(req, res));
    
    app.post("/file/:id/parse", (req, res) => fileController.postParseFile(req, res));
    app.get("/file/:id", (req, res) => fileController.getFile(req, res));

    app.post("/compile", multipartBodyOnly, (req, res) => compileController.postCompile(req, res));
    app.get("/compile", (req, res) => compileController.getCompile(req, res))
}