const assert = require('node:assert');
const FolderApi = require('../../src/server/api/Folder');

const parentFolder = {
    id: 1,
    name: "parent_folder",
    parent_id: null,
    enabled: true
}

const childFolder = {
    id: 2,
    name: "child_folder",
    parent_id: 1,
    enabled: true
}

const disabledFolder = {
    id: 3,
    name: "disabled_folder",
    parent_id: 1,
    enabled: false
}

const folders = [{...parentFolder},{...childFolder},{...disabledFolder}];

const db = {
    models: {
        Folder: {
            findAll: () => folders,
            findByPk: (id) => folders.find(folder => folder.id === id),
            create: (data) => ({id: 4, ...data}),
            update: (data) => ({...data})
        }
    }
}

describe("Folder api methods", () => {
    beforeEach(() => {
        this.folderApi = new FolderApi(db);
    });

    it("all", async () => {
        const actual = await this.folderApi.all();
        assert.deepStrictEqual(actual, folders);
    });
    
    it("get", async () => {
        const actual = await this.folderApi.get(2);
        assert.deepStrictEqual(actual, childFolder);
    });
    
    it("str", async () => {
        const actual = await this.folderApi.str(2);
        const expected = `${childFolder.id} ${childFolder.name} (parent_id ${childFolder.parent_id})`;
        assert.equal(actual, expected);
    });
    
    it("str should throw", async () => {
        await assert.rejects(this.folderApi.str(100), {message: 'Folder does not exist!'});
    });

    it("create should throw", async () => {
        const data = {parent_id: 100}
        await assert.rejects(this.folderApi.create(data), {message: "Parent folder does not exist!"});
    });

    it("create should throw", async () => {
        const data = {parent_id: 3}
        await assert.rejects(this.folderApi.create(data), {message: "Parent folder is disabled!"});
    });

    it("create", async () => {
        const data = {parent_id: 1, name: "name", description: "description"};
        const actual = await this.folderApi.create(data);
        assert.deepStrictEqual(actual, {id: 4, ...data});
    });

    it("delete should throw", async () => {
        await assert.rejects(this.folderApi.delete(100), {message: "Folder does not exist!"});
    });

    it("delete", async () => {
        const actual = await this.folderApi.delete(2);
        assert.equal(actual.enabled, false);
    });
});