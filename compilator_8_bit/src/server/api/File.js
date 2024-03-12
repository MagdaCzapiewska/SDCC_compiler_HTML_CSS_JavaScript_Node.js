const FolderApi = require('./Folder');

class File {
    constructor(db) {
        this.db = db;
        this.model = db.models.File;
        this.folderApi = new FolderApi(db);
    }

    all() {
        return this.model.findAll();
    }

    get(id) {
        return this.model.findByPk(id);
    }

    async str(id) {
        const file = await this.get(id);
        if (!file) {
            throw new Error("File does not exist!");
        }
        return `${file.id} ${file.name} (folder ${file.folder_id})`;
    }

    async getSourceCode(id) {
        const file = await this.get(id);
        return file.source_code;
    }

    async getSourceCodeSplitted(id) {
        const source_code = await this.getSourceCode(id);
        return source_code.split("\n");
    }

    async create(data) {
        const folder = await this.folderApi.get(data.folder_id);

        if (!folder) {
            throw new Error("Parent folder does not exist!");
        }
        if (!folder.enabled) {
            throw new Error("Parent folder is disabled!");
        }

        const file = await this.model.create({
            name: data.name,
            description: data.description,
            folder_id: data.folder_id,
            source_code: data.source_code
        });
        return file.id;
    }

    async delete(id) {
        const file = await this.get(id);
        if (!file) {
            throw new Error("File does not exist!");
        }

        return this.model.update({
            enabled: false,
            enable_update_date: new Date()
        },
        {
            where: {
                id
            }
        });
    }

    async deleteSection(id, start_line, end_line) {
        const file = await this.get(id);
        if (!file) {
            throw new Error("File does not exist!");
        }

        const splitted = file.source_code.split("\n");
        splitted.splice(start_line - 1, end_line - start_line + 1);
        
        return this.model.update({
            source_code: splitted.join("\n")
        },
        {
            where: {
                id
            }
        });
    }
}

module.exports = File;
