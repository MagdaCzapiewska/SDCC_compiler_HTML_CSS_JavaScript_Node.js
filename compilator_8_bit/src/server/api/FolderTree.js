const FileApi = require('./File');
const FolderApi = require('./Folder');

class FolderTree {
    constructor(db) {
        this.db = db;
        this.folderApi = new FolderApi(db);
        this.fileApi = new FileApi(db);
    }

    async getFolderStructure() {
        this.folders = await this.folderApi.all();
        this.files = await this.fileApi.all();
        const roots = this.__findRoots();
        const tree = this.__traverseSiblings(roots); // ew
        return tree || []; // ew
        //this.__traverseSiblings(roots);
        //return roots || [];
    }

    __findRoots() {
        return this.folders.filter(folder => !folder.parent_id && folder.enabled)
            .map(({id, name}) => ({id, name, is_file: false}));
    }

    __traverseSiblings(siblings) {
        for (const elem of siblings) {
            const children = this.folders.filter(folder => folder.parent_id === elem.id && folder.enabled)
                .map(({id, name}) => ({id, name, is_file: false}));
            elem.children = [...children];
            if (children.length) {
                this.__traverseSiblings(elem.children);
            }

            const child_files = this.files.filter(file => file.folder_id === elem.id && file.enabled)
                .map(({id, name}) => ({id, name, is_file: true}));
            elem.children.push(...child_files);
            elem.has_children = !!elem.children.length;
        }
        return siblings; // ew
    }
}

module.exports = FolderTree;