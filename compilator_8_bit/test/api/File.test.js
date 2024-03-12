const assert = require('node:assert');
const FileApi = require('../../src/server/api/File');

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

const file = {
    id: 1,
    name: "just_lines.c",
    description: "",
    create_date: "2023-04-24T19:29:05.447Z",
    enabled: true,
    enable_update_date: null,
    update_date: "2023-04-24T19:29:05.447Z",
    folder_id: 1,
    source_code: "line 1\nline 2\nline 3\nline 4\nline 5\nline 6\nline 7\nline 8\nline 9\nline 10\nline 11\nline 12\nline 13\nline 14\nline 15\nline 16\nline 17\nline 18\nline 19\nline 20\nline 21\nline 22\nline 23\nline 24\nline 25\nline 26\nline 27\nline 28\nline 29\nline 30\nline 31\nline 32\nline 33\nline 34\nline 35\nline 36\nline 37\nline 38\nline 39\nline 40\nline 41\nline 42\nline 43\nline 44\nline 45\nline 46\nline 47\nline 48\nline 49\nline 50\nint main(void) {\n//comment\n//comment\n}\n"
}

const files = [{...file}];

const db = {
    models: {
        File: {
            findByPk: (id) => files.find(file => file.id === id),
            findAll: () => files,
            create: (data) => ({id: 2, ...data}),
            update: (data) => ({...data})
        },
        Folder: {
            findByPk: (id) => folders.find(folder => folder.id === id)
        }
    }
}

describe("File api methods", () => {
    beforeEach(() => {
        this.fileApi = new FileApi(db);
    });

    it("all", async () => {
        const actual = await this.fileApi.all();
        assert.deepStrictEqual(actual, files);
    });
    
    it("get", async () => {
        const actual = await this.fileApi.get(1);
        assert.deepStrictEqual(actual, file);
    });
    
    it("str", async () => {
        const actual = await this.fileApi.str(1);
        const expected = `${file.id} ${file.name} (folder ${file.folder_id})`;
        assert.equal(actual, expected);
    });
    
    it("str should throw", async () => {
        await assert.rejects(this.fileApi.str(100), {message: "File does not exist!"});
    });

    it("getSourceCode", async () => {
        const actual = await this.fileApi.getSourceCode(1);
        assert.equal(actual, file.source_code);
    });

    it("getSourceCodeSplitted", async () => {
        const actual = await this.fileApi.getSourceCodeSplitted(1);
        assert.deepStrictEqual(actual, file.source_code.split("\n"));
    });

    it("create should throw", async () => {
        const data = {folder_id: 100}
        await assert.rejects(this.fileApi.create(data), {message: "Parent folder does not exist!"});
    });

    it("create should throw", async () => {
        const data = {folder_id: 3}
        await assert.rejects(this.fileApi.create(data), {message: "Parent folder is disabled!"});
    });

    it("create", async () => {
        const data = {
            folder_id: 1,
            name: "name",
            description: "description",
            source_code: 'line 1\nline 2\nline 3\nline 4\nline 5\nline 6\nline 7\nline 8\nline 9\n'
        };
        const actual = await this.fileApi.create(data);
        assert.deepStrictEqual(actual, 2);
    });

    it("delete should throw", async () => {
        await assert.rejects(this.fileApi.delete(100), {message: "File does not exist!"});
    });

    it("delete", async () => {
        const actual = await this.fileApi.delete(1);
        assert.equal(actual.enabled, false);
    });

    it("deleteSection should throw", async () => {
        await assert.rejects(this.fileApi.deleteSection(100, 1, 2), {message: "File does not exist!"});
    });

    it("deleteSection", async () => {
        const actual = await this.fileApi.deleteSection(1, 3, 5);

        const splitted = file.source_code.split('\n');
        splitted.splice(3 - 1, 5 - 3 + 1);
        const expected = splitted.join('\n');

        assert.equal(actual.source_code, expected);
    });
});