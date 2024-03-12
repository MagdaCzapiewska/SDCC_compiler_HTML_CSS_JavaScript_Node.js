const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const FileApi = require('./File');

const BASE_DIR = process.cwd();
const COMPILER_DIR = "asm";

class Compiler {
    constructor({file_id, standard, processor, optimizations, dependent, db, uid}) {
        if (file_id) {
            this.file_id = file_id;
            this.standard = standard;
            this.processor = processor;
            this.optimizations = optimizations ? (Array.isArray(optimizations) ? optimizations : [optimizations]) : [];
            this.dependent = dependent ? (Array.isArray(dependent) ? dependent : [dependent]) : [];
            this.uid = uuid.v4();
            this.can_compile = true;
            this.fileApi = new FileApi(db);
        }
        else {
            this.uid = uid;
            this.can_compile = false;
        }
        this.file_name = "source";
        this.file_ext = ".c";
        this.asm_ext = ".asm";
    }

    async compile() {
        if (!this.can_compile) {
            throw new Error("Initialize compiler properly!");
        }
        await this.__createDirectory();
        await this.__createSourceCodeFile();
        await this.__compile();
        return this.uid;
    }

    async getCompilationStatuses() {
        const file_name = `${this.file_name}.stderr`;
        const error_body = await this.__getAsm(file_name);
        const error_lines = error_body.split(`${this.file_name}${this.file_ext}:`).slice(1);

        const data = [];
        for (const error of error_lines) {
            const match = error.match(/^\d+/);
            if (match) {
                data.push({
                    line_id: +match[0],
                    line_content: error
                });
            }
        }
        let status = "Compiled without warnings";
        if (await this.__checkAsmExists()) {
            if (data.length) {
                status = "Compiled with warnings";
            }
        }
        else {
            status = "Does not compile";
        }
        return {status, error_lines: data};
    }

    async getAndDeleteAsm() {
        let result, enriched;
        if (await this.__checkAsmExists()) {
            result = true;
            const file_name = this.file_name + this.asm_ext;
            const asm_body = await this.__getAsm(file_name);
            enriched = this.__enrichAsm(asm_body.split("\n"));
        }
        else {
            result = false;
            const file_name = `${this.file_name}.stderr`;
            const error_body = await this.__getAsm(file_name);
            enriched = this.__enrichError(error_body.split("\n"));
        }
        this.__deleteDirectory();
        return {result, enriched};
    }

    __createDirectory() {
        const directory = path.resolve(BASE_DIR, COMPILER_DIR);
        const command = `cd ${directory} && mkdir ${this.uid}`;
        this.__exec(command);
    }

    __deleteDirectory() {
        const directory = path.resolve(BASE_DIR, COMPILER_DIR);
        const command = `cd ${directory} && rm -rf ${this.uid}`;
        this.__exec(command);
    }

    __exec(command) {
        try {
            execSync(command);
        } catch(error) {
            // console.log(error);
        }
    }
    
    async __createSourceCodeFile() {
        const source_code = await this.fileApi.getSourceCode(this.file_id);
        const file_name = this.file_name + this.file_ext;
        const file = path.resolve(BASE_DIR, COMPILER_DIR, this.uid, file_name);
        fs.appendFileSync(file, source_code);
    }

    async __compile() {
        const directory = path.resolve(BASE_DIR, COMPILER_DIR, this.uid);
        const file_name = this.file_name;
        const options = this.__getOptions();
        const command = `cd ${directory} && sdcc -S ${options} ${file_name}${this.file_ext} 1>${file_name}.stdout 2>${file_name}.stderr`;
        console.log(command);
        await this.__exec(command);
    }

    __getOptions() {
        let optimizations = "";
        let dependent = "";

        for (const optimization of this.optimizations) {
            optimizations += ` --${optimization}`;
        }
        for (const dep of this.dependent) {
            dependent += ` --${dep}`;
        }
        return `--std-${this.standard} -m${this.processor}${optimizations}${dependent}`;
    }

    __getAsm(file_name) {
        const file = path.resolve(BASE_DIR, COMPILER_DIR, this.uid, file_name);
        const file_body = fs.readFileSync(file, 'utf8');
        return file_body;
    }

    __checkAsmExists() {
        const file_name = this.file_name + this.asm_ext;
        const file = path.resolve(BASE_DIR, COMPILER_DIR, this.uid, file_name);
        return fs.existsSync(file);
    }

    __enrichAsm(lines) {
        const class_header = "asm-header";
        const class_body = "asm-body";
        const file_name = this.file_name + this.file_ext;
        const regex = new RegExp("^;\\t*\\s*" + file_name + ":\\s*\\d+");
        const regex_repl = new RegExp(";\\t*\\s*" + file_name + ":\\s*");

        let is_body = true;
        const data = [];

        for (const line of lines) {
            let source_code_line = 0;
            if (is_body && line.startsWith(';-----------------')) {
                data.push({code: line, start: true, start_class: class_header, position: 'before', source_code_line});
                is_body = false;
            } else if (!is_body && line.startsWith(';-----------------')) {
                data.push({code: line, start: true, start_class: class_body, position: "after", source_code_line});
                is_body = true;
            } else if (!is_body && line.startsWith(";")) {
                data.push({code: line, start: false, source_code_line});
            } else if (is_body && line.startsWith(";")) {
                const match = line.match(regex);
                if (match) {
                    source_code_line = +(match[0].replace(regex_repl, ''));
                }
                data.push({code: line, start: false, source_code_line});
            } else {
                data.push({code: line, start: false, source_code_line});
            }
        }
        return data;
    }

    __enrichError(lines) {
        const file_name = this.file_name + this.file_ext;
        const regex = new RegExp("^" + file_name + ":\\d+");
        const regex_repl = new RegExp(file_name + ":");

        const data = [];
        for (const line of lines) {
            let source_code_line = 0;
            if (line.startsWith(file_name)) {
                const match = line.match(regex);
                if (match) {
                    source_code_line = +(match[0].replace(regex_repl, ''));
                }
            }
            data.push({
                line_content: line,
                source_code_line 
            });
        }
        return data;
    }
}

module.exports = Compiler;