import {parse, sequence, choice, optional, some, and, not, char, digit} from './func-parse.mjs';
import {MapBlock, RepeatBlock, DecisionBlock, BlockLiteral, StringLiteral, IntegerLiteral, Instruction} from './paper-expressions.mjs';

// High level parsing expressions

export function parser() {
    // return some(expression());
    return sequence([
               some(expression()),      // A line of code
               optional(some(sequence([ // Followed by zero or more lines of code,
                   linebreak(),         // Separated by linebreaks
                   some(expression())
               ])))
           ]);

}

function linebreak() {
    return some(choice([char('\n'), char('\r')]));
}
linebreak.expressionString = function() {
    return 'break';
}

function expression() {
    return choice([
               string_literal(), char_literal(), integer_literal(), digit_literal(),
               block(MapBlock), block(RepeatBlock), block(DecisionBlock), block(BlockLiteral),
               instruction(),
           ]);
}
expression.expressionString = function() {
    return 'expression';
}

function instruction() {
    let f = function(input) {
        let exp = sequence([
            not(char(MapBlock.type)), not(char(RepeatBlock.type)), not(char(DecisionBlock.type)), not(char(BlockLiteral.type)),
            not(char('|')), not(char('}')), not(char('"')), not(char("'")), not(char("#")), not(digit()),
            not(linebreak()),
            char()
        ]);
        let matches = exp(input);
        if (matches.length > 0) {
            return [[new Instruction(input[0]), input.substring(1)]];
        }
        else {
            return [];
        }
    }

    return f;
}

function block(blockClass) {
    let f = function(input) {
        let exp = sequence([
            char(blockClass.type),
            some(expression()),
            optional(some(sequence([
                char('|'),
                some(expression())
            ]))),
            char('}')
        ]);
        let matches = exp(input);
        if (matches.length > 0) {
            let [matched, remaining] = matches[0];
            let exps = matched[1];
            if (matched[2] != null) {
                let tail = matched[2].map(x => x[1]);
                exps = [exps, ...tail]
            }
            return [[new blockClass(exps), remaining]];
        }

        return [];
    }

    f.expressionString = function() {
        return `block(${blockClass.type})`;
    }
    return f;
}

function string_literal() {
    let f = function(inp) {
        // " char+ "
        let exp = sequence([char('"'), some(sequence([not(char('"')), char()])), char('"')]);
        let matches = exp(inp);
        if (matches.length > 0) {
            let match = matches[0];
            let value = match[0][1].map(e => e[1]).join("");
            let remaining = inp.substring(value.length + 2);
            return [[new StringLiteral(value), remaining]];
        }
        return [];
    }
    f.expressionString = function() {
        return 'string_literal';
    }
    return f;
}
string_literal.expressionString = function() {
    return 'string_literal';
}

function char_literal() {
    let f = function(inp) {
        let exp = sequence([char("'"), char()]);
        let matches = exp(inp);
        if (matches.length > 0) {
            let match = matches[0];
            let value = new StringLiteral(match[0][1]);
            let remaining = inp.substring(2);
            return [[value, remaining]];
        }
        else {
            return [];
        }
    }
    f.expressionString = function() {
        return 'char_literal';
    }
    return f;
}
char_literal.expressionString = function() {
    return 'char_literal';
}

function digit_literal() {
    let f = function(inp) {
        let exp = digit();
        let matches = exp(inp);
        if (matches.length > 0) {
            let value = new IntegerLiteral(parseInt(matches[0], 10));
            let remaining = inp.substring(1);
            return [[value, remaining]];
        }
        else {
            return [];
        }
    }
    f.expressionString = function() {
        return 'digit_literal';
    }
    return f;
}
digit_literal.expressionString = function() {
    return 'digit_literal';
}

function integer_literal() {
    let f = function(inp) {
        let exp = sequence([char('#'), some(digit())]);
        let matches = exp(inp);
        if (matches.length > 0) {
            let match = matches[0];
            let int = match[0][1].join("");
            let value = new IntegerLiteral(parseInt(int, 10));
            let remaining = inp.substring(1 + int.length);
            return [[value, remaining]];
        }
        else {
            return [];
        }
    }
    f.expressionString = function() {
        return 'integer_literal';
    }

    return f;
}
integer_literal.expressionString = function() {
    return 'integer_literal';
}
