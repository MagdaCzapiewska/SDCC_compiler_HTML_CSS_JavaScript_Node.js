const FileApi = require('../api/File');
const SectionApi = require('../api/Section');
const Parser = require('../api/Parser');

class File {
    constructor(db) {
        this.db = db;
        this.fileApi = new FileApi(db);
    }

    async getFile(req, res) {
        try {
            const {id} = req.params;
            const sectionApi = new SectionApi(this.db, id);
            await sectionApi.init();
            const source_code = await sectionApi.getSourceCodeEnriched();
            res.status(200).render('mainCode', {
                source_code,
                file_id: id,
                asm_code: null,
                error_code: null
            });
        }
        catch(error) {
            // console.log(error);
            res.status(400).render('error');
        }
    }

    getNewFile(req, res) {
        const {id} = req.params;
        res.status(200).render('fileAdd', {
            id
        });
    }

    async postNewFile(req, res) {
        const {id} = req.params;
        const {body, files} = req;
        
        try {
            if (files) {
                const file = files[0];
                const data = {
                    name: file.originalname,
                    description: body.description,
                    folder_id: +id,
                    source_code: file.buffer.toString()
                }
                const file_id = await this.fileApi.create(data);
                const response = {
                    file_id,
                    folder_id: id,
                    name: file.originalname
                }
                return res.status(200).json(response);
            }
            else {
                res.status(200).render('fileAdd', {
                    id
                });
            }
        }
        catch(error) {
            // console.log(error);
            res.status(400).render('error');
        }
    }

    async getDeleteFile(req, res) {
        try {
            const {id} = req.params;
            const file = await this.fileApi.str(id);
            res.status(200).render('delete', {
                object: file,
                action: `/file/${id}/delete`,
                onclick: "submitDeleteFile();"
            });
        }
        catch (error) {
            // console.log(error);
            res.status(400).render('error');
        }
    }

    async postDeleteFile(req, res) {
        try {
            const {id} = req.params;
            await this.fileApi.delete(id);
            return res.status(200).json({id});
        }
        catch (error) {
            // console.log(error);
            res.status(400).render('error');
        }
    }

    async getDeleteSection(req, res) {
        try {
            const {id, start_line, end_line} = req.params;
            const file = await this.fileApi.get(id);
            if (!file) {
                throw new Error();
            }

            res.status(200).render('delete', {
                object: `${file.name} lines ${start_line} - ${end_line}`,
                action: `/file/${id}/delete-section/${start_line}/${end_line}`,
                onclick: "submitDeleteSection();"
            });
        }
        catch (error) {
            // console.log(error);
            res.status(400).render('error');
        }
    }

    async postDeleteSection(req, res) {
        try {
            const {id, start_line, end_line} = req.params;
            const sectionApi = new SectionApi(this.db, id);
            // await sectionApi.init();
            await sectionApi.deleteSection(start_line, end_line);
            await this.fileApi.deleteSection(id, start_line, end_line);
            res.redirect(307, `/file/${id}/parse`);
        }
        catch(error) {
            // console.log(error);
            res.status(400).render('error');
        }
    }

    async postCreateSection(req, res) {
        try {
            const {id, start_line, end_line, section_name} = req.params;
            const sectionApi = new SectionApi(this.db, id);
            await sectionApi.init();
            await sectionApi.create({
                start_line,
                end_line,
                section_name
            });
            const source_code = await sectionApi.getSourceCodeEnriched();
            res.status(200).render('mainCode', {
                source_code,
                file_id: id,
                asm_code: null,
                error_code: null
            });
        }
        catch(error) {
            // console.log(error);
            res.status(400).render('error');
        }
    }
    
    async postParseFile(req, res) {
        try {
            const {id} = req.params;
            let source_code = await this.fileApi.getSourceCodeSplitted(id);
            const parser = new Parser(source_code, 0);
            const parsed_data = parser.parseSourceCode();

            for (const section of parsed_data) {
                if (section.section_name === "procedure") {
                    const {start_line, end_line} = section;
                    if (start_line !== end_line) {
                        const lines = source_code.slice(start_line, end_line);
                        const parser = new Parser(lines, start_line);
                        const subsection_data = parser.parseSourceCode();
                        if (subsection_data.length) {
                            parsed_data.push(...subsection_data);
                        }
                    }
                }
            }

            const sectionApi = new SectionApi(this.db, id);
            await sectionApi.init();
            await sectionApi.delete();
            for (const section of parsed_data) {
                await sectionApi.create(section);
            }

            source_code = await sectionApi.getSourceCodeEnriched();
            // console.log(source_code);
            res.status(200).render('mainCode', {
                source_code,
                file_id: id,
                asm_code: null,
                error_code: null
            });
        }
        catch (error) {
            // console.log(error);
            res.status(400).render('error');
        }
    }
}

module.exports = File;