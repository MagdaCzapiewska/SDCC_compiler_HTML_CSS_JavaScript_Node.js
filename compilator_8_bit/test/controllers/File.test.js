const assert = require('node:assert');
const File = require('../../src/server/controllers/File');
const {STATUS_CODE} = require('./responseCodes');

const db = {
    models: {
        File: {
            findByPk: (id) => {
                if (id === 1) {
                    return {
                        enabled: true,
                        source_code: `
                        int main(void) {
                            /* comment */
                        }`
                    }
                }
                else {
                    return null;
                }
            },
            create: () => ({id: 1}),
            update: () => true
        },
        Folder: {
            findByPk: (id) => {
                if (id === 1) {
                    return {enabled: true};
                }
                else {
                    return null;
                }
            }
        },
        Section: {
            create: () => true,
            destroy: () => true,
            findAll: () => []
        },
        SectionType: {
            findOne: () => ({id: 1})
        }
    }
}

describe("File controller methods", () => {
    beforeEach(() => {
        this.file = new File(db);
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
            },
            redirect: (status, link) => {
                this.res.statusCode = status;
                this.res.link = link;
            }
        };
    });

    it("getFile", async () => {
        const req = {
            params: {
                id: 1
            }
        };
        await this.file.getFile(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.OK);
        assert.equal(this.res.view, 'mainCode');
    });

    it("getFile should show error", async () => {
        const req = {
            params: {
                id: 100
            }
        };
        await this.file.getFile(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.ERROR);
        assert.equal(this.res.view, 'error');
    });

    it("getNewFile", async () => {
        const req = {
            params: {
                id: 1
            }
        };
        await this.file.getNewFile(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.OK);
        assert.equal(this.res.view, 'fileAdd');
    });

    it("postNewFile file missing", async () => {
        const req = {
            params: {
                id: 1
            },
            body: {},
        };
        await this.file.postNewFile(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.OK);
        assert.equal(this.res.view, 'fileAdd');
    });

    it("postNewFile", async () => {
        const req = {
            params: {
                id: 1
            },
            body: {},
            files: [{
                originalname: "source.c",
                buffer: "File content"
            }]
        };
        await this.file.postNewFile(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.OK);
        assert.deepStrictEqual(this.res.data, {
            file_id: 1,
            folder_id: req.params.id,
            name: req.files[0].originalname
        });
    });

    it("postNewFile should show error", async () => {
        const req = {
            params: {
                id: 100
            },
            body: {},
            files: [{
                originalname: "source.c",
                buffer: "File content"
            }]
        };
        await this.file.postNewFile(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.ERROR);
        assert.equal(this.res.view, 'error');
    });

    it("getDeleteFile", async () => {
        const req = {
            params: {
                id: 1
            }
        };
        await this.file.getDeleteFile(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.OK);
        assert.equal(this.res.view, 'delete');
    });

    it("getDeleteFile should show error", async () => {
        const req = {
            params: {
                id: 100
            }
        };
        await this.file.getDeleteFile(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.ERROR);
        assert.equal(this.res.view, 'error');
    });

    it("postDeleteFile", async () => {
        const req = {
            params: {
                id: 1
            }
        };
        await this.file.postDeleteFile(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.OK);
        assert.deepStrictEqual(this.res.data, {
            id: req.params.id
        });
    });

    it("postDeleteFile should show error", async () => {
        const req = {
            params: {
                id: 100
            }
        };
        await this.file.postDeleteFile(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.ERROR);
        assert.equal(this.res.view, 'error');
    });

    it("getDeleteSection", async () => {
        const req = {
            params: {
                id: 1
            }
        };
        await this.file.getDeleteSection(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.OK);
        assert.equal(this.res.view, 'delete');
    });

    it("getDeleteSection should show error", async () => {
        const req = {
            params: {
                id: 100
            }
        };
        await this.file.getDeleteSection(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.ERROR);
        assert.equal(this.res.view, 'error');
    });

    it("postDeleteSection", async () => {
        const req = {
            params: {
                id: 1,
                start_line: 2,
                end_line: 3
            }
        };
        await this.file.postDeleteSection(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.POST_REDIRECT);
        assert.equal(this.res.link, `/file/${req.params.id}/parse`);
    });

    it("postDeleteSection should show error", async () => {
        const req = {
            params: {
                id: 100
            }
        };
        await this.file.postDeleteSection(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.ERROR);
        assert.equal(this.res.view, 'error');
    });

    it("postCreateSection", async () => {
        const req = {
            params: {
                id: 1,
                start_line: 2,
                end_line: 3,
                section_name: "directive"
            }
        };
        await this.file.postCreateSection(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.OK);
        assert.equal(this.res.view, 'mainCode');
    });

    it("postCreateSection should show error", async () => {
        const req = {
            params: {
                id: 100
            }
        };
        await this.file.postCreateSection(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.ERROR);
        assert.equal(this.res.view, 'error');
    });
    
    it("postParseFile", async () => {
        const req = {
            params: {
                id: 1
            }
        };
        await this.file.postParseFile(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.OK);
        assert.equal(this.res.view, 'mainCode');
    });

    it("postParseFile should show error", async () => {
        const req = {
            params: {
                id: 100
            }
        };
        await this.file.postParseFile(req, this.res);
        assert.equal(this.res.statusCode, STATUS_CODE.ERROR);
        assert.equal(this.res.view, 'error');
    });
});
