class Folder {
    constructor(db) {
        this.db = db;
        this.model = db.models.Folder;
    }

    all() {
        return this.model.findAll();
    }

    get(id) {
        return this.model.findByPk(id);
    }

    async str(id) {
        const folder = await this.get(id);
        if (!folder) {
            throw new Error("Folder does not exist!");
        }
        return `${folder.id} ${folder.name} (parent_id ${folder.parent_id})`;
    }

    async create(data) {
        const {parent_id} = data;
        if (parent_id) {
            const parent = await this.get(parent_id);
            if (!parent) {
                throw new Error("Parent folder does not exist!");
            }
            if (!parent.enabled) {
                throw new Error("Parent folder is disabled!");
            }
        }

        return this.model.create({
            name: data.name,
            description: data.description,
            parent_id: parent_id > 0 ? parent_id : null
        });
    }

    async delete(id) {
        const folder = await this.get(id);
        if (!folder) {
            throw new Error("Folder does not exist!");
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
}

module.exports = Folder;
