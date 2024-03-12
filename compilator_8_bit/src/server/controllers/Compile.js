const FileApi = require('../api/File');
const SectionApi = require('../api/Section');
const Compiler = require('../api/Compiler');

const dependentOptions = {
    mcs51: ['model-small', 'model-medium', 'model-large', 'model-huge'],
    ds390: ['model-flat24', 'protect-sp-update', 'stack-10bit', 'stack-probe', 'use-accelerator'],
    z80: ['no-std-crt0', 'callee-saves-bc', 'reserve-regs-iy', 'fno-omit-frame-pointer'],
    sm83: ['no-std-crt0', 'callee-saves-bc'],
    stm8: ['model-medium', 'model-large']
};

const getDependentOptions = (processor) => {
    let options;

    switch (processor) {
        case 'mcs51':
            options = dependentOptions.mcs51;
            break;
        case 'ds390':
        case 'ds400':
            options = dependentOptions.ds390;
            break;
        case 'z80':
        case 'z180':
        case 'r2k':
        case 'r3ka':
        case 'tlcs90':
        case 'ez80_z80':
            options = dependentOptions.z80;
            break;
        case 'sm83':
            options = dependentOptions.sm83;
            break;
        case 'stm8':
            options = dependentOptions.stm8;
            break;
        default:
            options = null;
    };
    
    return options;
}

class Compile {
    constructor(db) {
        this.db = db;
        this.fileApi = new FileApi(db);
    }

    async postCompile(req, res) {
        const {
            file_id,
            command_line_standard: standard,
            command_line_optimization: optimizations,
            command_line_processor: processor,
            command_line_dependent: dependent
        } = req.body;

        if (!(file_id && standard && processor)) {
            return res.status(400).render('error');
        }

        req.session.standard = standard;
        req.session.optimizations = optimizations;
        req.session.processor = processor;
        req.session.dependent = dependent;
        req.session.dependent_options = getDependentOptions(processor);

        try {
            const compiler = new Compiler({
                file_id,
                standard,
                optimizations,
                processor,
                dependent,
                db: this.db
            });
            const uid = await compiler.compile();
            const {status, error_lines} = await compiler.getCompilationStatuses();
            const sectionApi = new SectionApi(this.db, file_id);
            await sectionApi.init();
            await sectionApi.clearStatusData();

            for (const line of error_lines) {
                await sectionApi.updateStatusData(status, line);
            }
            if (status === "Compiled with warnings") {
                status = "Compiled without warnings";
            }
            await sectionApi.updateStatus(status);

            return res.status(302).redirect(`/compile?id=${file_id}&uid=${uid}`);
        }
        catch(error) {
            console.log(error);
            res.status(400).render(error);
        }
    }

    async getCompile(req, res) {
        const {id: file_id, uid} = req.query;
        if (!(file_id && uid)) {
            return res.status(400).render('error');
        }

        const compiler = new Compiler({uid});
        try {
            const {result, enriched} = await compiler.getAndDeleteAsm();
            const {name} = await this.fileApi.get(file_id);
            const asm_name = `${name.slice(0, -2)}.asm`;

            const sectionApi = new SectionApi(this.db, file_id);
            await sectionApi.init();
            const source_code = await sectionApi.getSourceCodeEnriched();

            res.status(200).render('mainCode', {
                source_code,
                file_id,
                asm_code: result && enriched,
                asm_name,
                error_code: !result && enriched
            });
        }
        catch(error) {
            console.log(error);
            res.status(400).render('error');
        }
    }
}

module.exports = Compile;