const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./routes');
const path = require('path');
const Sequelize = require('sequelize');
const models = require('./db/models');
const migrations = require('./db/migrations/001.js');

const initDb = async () => {
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './compiler.db'
    });
    await models.init(sequelize);
    await sequelize.sync();
    await migrations.run(sequelize);
    return sequelize;
}

const initServer = (db) => {
    const app = express();
    app.use(cookieParser());
    app.use(session({
        secret: "magda",
        cookie: {}
    }));
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, './views'));
    app.use(express.static(path.join(__dirname, './static')));

    app.use(function (req, res, next) {
        res.locals.standard = req.session.standard;
        res.locals.optimizations = req.session.optimizations;
        res.locals.processor = req.session.processor;
        res.locals.dependent = req.session.dependent;
        res.locals.dependent_options = req.session.dependent_options;
        next();
    });
    
    routes.init(app, db);
    const server = app.listen(3000, () => {
        const host = server.address().address;
        const port = server.address().port;
        console.log(`Compiler app listening at http://${host}:${port}`);
    });
}

const startApp = async () => {
    try {
        const db = await initDb();
        initServer(db);
    }
    catch(error) {
        console.log("Error during initialization", error);
    }
}

startApp();
