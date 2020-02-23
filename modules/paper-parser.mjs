import {parse, sequence, choice, optional, some, and, not, char, digit} from './func-parse.mjs';

// Token classes

class Expression {
    execute(stack, currentLine) {}
}

class Literal extends Expression {
    constructor(value) {
        super();
        this.value = value;
    }

    execute(stack, currentLine) {
        stack.push(this.value);
    }
}

class StringLiteral extends Literal {
    constructor(value) {
        super(value);
    }
}

class IntegerLiteral extends Literal {
    constructor(value) {
        super(value);
    }
}

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
    return choice([string_literal(), char_literal(), integer_literal()]);
}
expression.expressionString = function() {
    return 'expression';
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

function integer_literal() {
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
        return 'integer_literal';
    }
    return f;
}
integer_literal.expressionString = function() {
    return 'integer_literal';
}
