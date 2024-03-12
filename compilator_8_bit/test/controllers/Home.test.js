const assert = require('node:assert');
const Home = require('../../src/server/controllers/Home');
const {STATUS_CODE} = require('./responseCodes');

const db = {
    models: {
        Folder: {
            findAll: () => []
        },
        File: {
            findAll: () => []
        }
    }
}

describe("Home controller methods", () => {
    beforeEach(() => {
        this.home = new Home(db);
        this.req = {};
        this.res = {
            status: (code) => {
                this.res.statusCode = code;
                return this.res;
            },
            render: (view, params) => {
                this.res.view = view;
                this.res.params = params;
            }
        };
    });

    it("getHome", async () => {
        await this.home.getHome(this.req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.OK);
        assert.equal(this.res.view, 'index');
    });

    it("getError", async () => {
        await this.home.getError(this.req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.ERROR);
        assert.equal(this.res.view, 'error');
    });
});
