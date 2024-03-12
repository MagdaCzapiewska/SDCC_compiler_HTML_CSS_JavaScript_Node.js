const { Op } = require("sequelize");
const FileApi = require('./File');

class Section {
    constructor(db, id) {
        this.db = db;
        this.file_id = id;
        this.model = db.models.Section;
        this.sectionTypeModel = db.models.SectionType;
        this.sectionStatusModel = db.models.SectionStatus;
        this.fileApi = new FileApi(db);
        this.getSourceCodeEnriched = this.getSourceCodeEnriched.bind(this);
    }

    async init() {
        this.source_code = await this.fileApi.getSourceCodeSplitted(this.file_id);
        this.total_lines = this.source_code.length;
    }

    get() {
        return this.model.findAll({
            where: {
                file_id: this.file_id
            }
        });
    }

    delete() {
        return this.model.destroy({
            where: {
                file_id: this.file_id
            }
        });
    }

    deleteSection(start_line, end_line) {
        return this.model.destroy({
            where: {
                file_id: this.file_id,
                start_line,
                end_line
            }
        });
    }

    async create(data) {
        const {start_line, end_line, section_name, name, description} = data;
        this.__validateRange(start_line, end_line);

        const section_type = await this.sectionTypeModel.findOne({
            where: {
                name: section_name
            }
        })
        const section_type_id = section_type.id;
        return this.model.create({
            file_id: this.file_id,
            start_line,
            end_line,
            section_type_id,
            name,
            description,
            source_code: [...this.source_code].slice(start_line - 1, end_line).join('\n')
        });
    }

    clearStatusData() {
        return this.model.update({
            section_status_id: null,
            status_data: null
        },
        {
            where: {
                file_id: this.file_id
            }
        });
    }

    async updateStatusData(status, data) {
        const section_status = await this.sectionStatusModel.findOne({
            where: {
                name: status
            }
        });
        const section_status_id = section_status.id;
        const {line_id, line_content} = data;
        return this.model.update({
            section_status_id,
            status_data: this.db.literal(`status_data + "${line_content}, "`)
        },
        {
            where: {
                file_id: this.file_id,
                start_line: {
                    [Op.lte]: line_id,
                },
                end_line: {
                    [Op.gte]: line_id
                }
            }
        });
    }

    async updateStatus(status) {
        const section_status = await this.sectionStatusModel.findOne({
            where: {
                name: status
            }
        });
        const section_status_id = section_status.id;

        return this.model.update({
            section_status_id
        },
        {
            where: {
                file_id: this.file_id,
                section_status_id: {
                    [Op.is]: null
                }
            }
        });
    }

    async getSourceCodeEnriched() {
        const sections = await this.get();
        //console.log(sections);
        const data = [];

        let counter = 0;
        for (const line of this.source_code) {
            counter++;
            let start_line = 0
            let end_line = 0
            let end_div = false
            let section_type = ""
            let section_status = ""
            let class_name = ""

            let section = sections.find(el => el.start_line === counter);
            if (section) {
                start_line = section.start_line;
                end_line = section.end_line;
                section_type = (await this.sectionTypeModel.findByPk(section.section_type_id)).name;
                if (section.section_status_id) {
                    section_status = (await this.sectionStatusModel.findByPk(section.section_status_id)).name;
                }
                section = sections.find(el => el.start_line < section.start_line && el.end_line > section.end_line);
                if (section) {
                    class_name = "code-section-inner";
                }
                else {
                    class_name = "code-section-outer";
                }
            }
            section = sections.find(el => el.end_line === counter);
            if (section) {
                end_div = true;
            }
            
            data.push({
                line,
                start_line,
                end_line,
                end_div,
                section_type,
                section_status,
                class_name
            });
        }

        return data;
    }

    async __validateRange(start, end) {
        if (start <= 0 || end <= 0 || start > end || start > this.total_lines || end > this.total_lines) {
            throw new Error("Start and end line values are wrong!");
        }
        const sections = await this.get();
        if (sections.some(({start_line, end_line}) => {
            return (start_line >= start && end_line >= end && start_line <= end)
            || (start_line <= start && end_line <= end && end_line >= start)
            || (start_line === start)
            || (end_line === end)
        })) {
            throw new Error("Section conflict detected!");
        }
    }
}

module.exports = Section;
