const FolderTree = require('../api/FolderTree');

const command_line_options = {
    standard: ["", "c89", "sdcc89", "c95", "c99", "sdcc99", "c11", "sdcc11", "c2x", "sdcc2x"],
    optimization: ["noloopreverse", "nolabelopt", "no-xinit-opt", "nooverlay", "no-peep", "peep-return", "no-peep-return", "opt-code-speed", "opt-code-size", "fomit-frame-pointer", "nolospre", "nostdlibcall"],
    processor: ["", "mcs51", "ds390", "ds400", "z80", "z180", "r2k", "r3ka", "sm83", "tlcs90", "ez80_z80", "stm8"]
}

class Home {
    constructor(db) {
        this.folderTree = new FolderTree(db);
    }

    async getHome(req, res) {
        const folder_structure = await this.folderTree.getFolderStructure();

        res.status(200).render('index', {
            command_line_options,
            folder_structure
        });
    }

    getError(req, res) {
        res.status(400).render('error');
    }
}

module.exports = Home;
