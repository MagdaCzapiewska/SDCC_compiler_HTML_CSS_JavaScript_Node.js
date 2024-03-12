const assert = require('node:assert');
const Folder = require('../../src/server/controllers/Folder');
const {STATUS_CODE} = require('./responseCodes');

const db = {
    models: {
        Folder: {
            findByPk: (id) => {
                if (id === 1) {
                    return {enabled: true};
                }
                else {
                    return null;
                }
            },
            create: () => true,
            update: () => true
        }
    }
}

describe("Folder controller methods", () => {
    beforeEach(() => {
        this.folder = new Folder(db);
        this.res = {
            status: (code) => {
                this.res.statusCode = code;
                return this.res;
            },
            render: (view, params) => {
                this.res.view = view;
                this.res.params = params;
            },
            json: (data) => {
                this.res.data = data;
            }
        };
    });

    it("getNewFolder", async () => {
        const req = {
            params: {
                id: 1
            }
        };
        await this.folder.getNewFolder(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.OK);
        assert.equal(this.res.view, 'folderAdd');
    });

    it("postNewFolder name missing", async () => {
        const req = {
            params: {
                id: 1
            },
            body: {}
        };
        await this.folder.postNewFolder(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.OK);
        assert.equal(this.res.view, 'folderAdd');
    });

    it("postNewFolder should show error", async () => {
        const req = {
            params: {
                id: 100
            },
            body: {
                name: "name"
            }
        };
        await this.folder.postNewFolder(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.ERROR);
        assert.equal(this.res.view, 'error');
    });

    it("postNewFolder", async () => {
        const req = {
            params: {
                id: 1
            },
            body: {
                name: "name"
            }
        };
        await this.folder.postNewFolder(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.OK);
        assert.equal(this.res.data, true);
    });

    it("getDeleteFolder", async () => {
        const req = {
            params: {
                id: 1
            }
        };
        await this.folder.getDeleteFolder(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.OK);
        assert.equal(this.res.view, 'delete');
    });

    it("getDeleteFolder should show error", async () => {
        const req = {
            params: {
                id: 100
            }
        };
        await this.folder.getDeleteFolder(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.ERROR);
        assert.equal(this.res.view, 'error');
    });

    it("postDeleteFolder", async () => {
        const req = {
            params: {
                id: 1
            }
        };
        await this.folder.postDeleteFolder(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.OK);
        assert.deepStrictEqual(this.res.data, {id: req.params.id});
    });

    it("postDeleteFolder should show error", async () => {
        const req = {
            params: {
                id: 100
            }
        };
        await this.folder.postDeleteFolder(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.ERROR);
        assert.equal(this.res.view, 'error');
    });
});
