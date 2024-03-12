const FolderApi = require('../api/Folder');

class Folder {
    constructor(db) {
        this.folderApi = new FolderApi(db);
    }

    getNewFolder(req, res) {
        const {id} = req.params;
        res.status(200).render('folderAdd', {
            id
        });
    }

    async postNewFolder(req, res) {
        const {id} = req.params;
        const {name, description} = req.body;
        
        try {
            if (name) {
                const data = {
                    name,
                    description,
                    parent_id: +id
                }
                const folder = await this.folderApi.create(data);
                return res.status(200).json(folder);
            }
            else {
                res.status(200).render('folderAdd', {
                    id
                });
            }
        }
        catch(error) {
            // console.log(error);
            res.status(400).render('error');
        }
    }

    async getDeleteFolder(req, res) {
        try {
            const {id} = req.params;
            const folder = await this.folderApi.str(id);
            res.status(200).render('delete', {
                object: folder,
                action: `/folder/${id}/delete`,
                onclick: "submitDeleteFolder();"
            });
        }
        catch (error) {
            // console.log(error);
            res.status(400).render('error');
        }
    }

    async postDeleteFolder(req, res) {
        try {
            const {id} = req.params;
            await this.folderApi.delete(id);
            return res.status(200).json({id});
        }
        catch (error) {
            // console.log(error);
            res.status(400).render('error');
        }
    }

    
}

module.exports = Folder;