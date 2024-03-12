const DIRECTIVE = "directive"
const VARIABLE = "variable"
const PROCEDURE = "procedure"
const COMMENT = "comment"
const ASSEMBLY = "assembly"

const regex_patterns = {
    "ifdefine": /^#(if|ifdef|if defined|ifndef|if !defined)/g,
    "enddefine": /^#endif/g,
    "directive": /^#(define|include|pragma|error|warning|undef|line)/g,
    "line_comment": /^\/\//g,
    "block_line_comment": /^\/\*(.*)\*\/$/g,
    "block_comment": /^\/\*/g,
    "end_block_comment": /\*\/$/g,
    "procedure": /^(char|unsigned char|signed char|int|unsigned int|short|unsigned short|long|unsigned long|unsigned long long|float|double|long double|uint8_t|uint16_t|uint32_t|uint64_t|void)\s+\w+\s*\(/g,
    "variable": /^(char|unsigned char|signed char|int|unsigned int|short|unsigned short|long|unsigned long|unsigned long long|float|double|long double|uint8_t|uint16_t|uint32_t|uint64_t|void)\s+\w+\s*(=|[^\(])/g,
    "asm": /^(asm|__asm__)\s*(volatile|__volatile__)?\s*[\{]/g,
    "asm_round": /^(asm|__asm__)\s*(volatile|__volatile__)?\s*[\(]/g,
    "asm_floor_start": /^__asm/g,
    "asm_floor_end": /^__endasm\s*;/g
}

class Parser {
    constructor(lines, counter_start) {
        this.lines = lines;
        this.counter_start = counter_start;
        // this.counter = counter_start;
        this.line_exists = true;
        this.data = [];
        this.section_name = null;
        this.start_line = null;
        this.end_line = null;
    }

    __parseLine(line) {
        for (const [key, rx] of Object.entries(regex_patterns)) {
            const match = line.trim().match(rx);
            if (match) {
                return key;
            }
        }
        return null;
    }

    __appendData() {
        this.data.push({
            section_name: this.section_name,
            start_line: this.start_line,
            end_line: this.end_line
        });
    }

    __countBrackets(match, bracket_type) {
        let brackets = 0;
        if (!match) {
            return brackets;
        }
        for(let i = 0; i < match.length; i++) {
            if (match[i] === bracket_type) {
                brackets++;
            }
            else {
                brackets--;
            }
        }
        return brackets;
    }

    __iter() {
        let nextIndex = 0;
        const end = this.lines.length;
        const lines = this.lines;
    
        const linesIterator = {
          next() {
            let line;
            if (nextIndex < end) {
              line = lines[nextIndex];
              nextIndex++;
              return line;
            }
            throw new Error('iterator ended');
          }
        };
        return linesIterator;
    }

    parseSourceCode() {
        let counter = this.counter_start;
        const iterator = this.__iter();

        let line = iterator.next();
        counter++;

        let key;

        while (this.line_exists) {
            key = this.__parseLine(line);

            if (key === "ifdefine") {
                this.start_line = counter;
                this.section_name = DIRECTIVE;
                while (key !== "enddefine") {
                    line = iterator.next();
                    counter++;
                    key = this.__parseLine(line);
                }
                this.end_line = counter;
                this.__appendData();
            }

            if ([DIRECTIVE, VARIABLE].includes(key)) {
                this.start_line = counter;
                this.section_name = key;
                const prev_key = key;
                while (key === prev_key) {
                    line = iterator.next();
                    counter++;
                    key = this.__parseLine(line);
                }
                this.end_line = counter - 1;
                this.__appendData();
                continue;
            }

            if (key === "line_comment") {
                this.start_line = counter;
                this.section_name = COMMENT;
                while (key === "line_comment") {
                    line = iterator.next();
                    counter++;
                    key = this.__parseLine(line);
                }
                this.end_line = counter - 1;
                this.__appendData();
                continue;
            }

            if (key === "block_line_comment") {
                this.start_line = counter;
                this.section_name = COMMENT;
                this.end_line = counter;
                this.__appendData();
            }

            if (key === "block_comment") {
                this.start_line = counter;
                this.section_name = COMMENT;
                while (key !== "end_block_comment") {
                    line = iterator.next();
                    counter++;
                    key = this.__parseLine(line);
                }
                this.end_line = counter;
                this.__appendData();
            }

            if ([PROCEDURE, ASSEMBLY].includes(key)) {
                this.start_line = counter;
                this.section_name = key;
                let brackets = 0;
                let match = line.match(/[\{\}]/g);
                if (match) {
                    brackets += this.__countBrackets(match, "{");
                } else {
                    while (!match) {
                        line = iterator.next();
                        counter++;
                        match = line.match(/[\{\}]/g);
                    }
                    brackets += this.__countBrackets(match, "{");
                }

                while (brackets > 0) {
                    line = iterator.next();
                    counter++;
                    match = line.match(/[\{\}]/g);
                    brackets += this.__countBrackets(match, "{");
                }
          
                this.end_line = counter;
                this.__appendData();
            }

            if (key === "asm_round") {
                this.start_line = counter;
                this.section_name = ASSEMBLY;
                let brackets = 0;
                let match = line.match(/[\(\)]/g);
                if (match) {
                    brackets += this.__countBrackets(match, "(");
                } else {
                    while (!match) {
                        line = iterator.next();
                        counter++;
                        match = line.match(/[\(\)]/g);
                    }
                    brackets += this.__countBrackets(match, "(");
                }

                while (brackets > 0) {
                    line = iterator.next();
                    counter++;
                    match = line.match(/[\(\)]/g);
                    brackets += this.__countBrackets(match, "(");
                }
        
                this.end_line = counter;
                this.__appendData();
            }

            if (key === "asm_floor_start") {
                this.start_line = counter;
                this.section_name = ASSEMBLY;
                while (key !== "asm_floor_end") {
                    line = iterator.next();
                    counter++;
                    key = this.__parseLine(line);
                }
                this.end_line = counter;
                this.__appendData();
            }

            try {
                line = iterator.next();
                counter++;
            } catch (error) {
                this.line_exists = false;
            }
        }

        return this.data;
    }
}

module.exports = Parser;