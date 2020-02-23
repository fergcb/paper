/**
 * Apply a parsing function to a string and return the parsed structure
 * @method parse
 * @param  {function} parser  The expression to apply
 * @param  {string}   input   The string to parse
 * @return {any}              The result of parsing
 */
export function parse(parser, input) {
    let matches = parser(input);
    if (matches.length > 0) {
        let [parsed, remaining] = matches[0];
        if (remaining.length == 0) {
            return parsed;
        }
        throw 'Unconsumed input: ' + remaining;
    }
    throw 'No content parsed.';
}

// Aggregating & Logical Expressions

/**
 * Match a sequence of expressions and return their results in an array.
 * @method sequence
 * @param  {array}    expressions An array of expressions to match
 * @return {function}             Expression function
 */
export function sequence(expressions) {
    let f = function(input) {
        let ms = expressions.reduce(function(acc, curr){
            let funcString = curr.expressionString() || (curr.toString() + '\n');

            if (acc === null) return null;
            let [matched, remaining] = acc;
            let matches = curr(remaining);
            if (matches.length > 0) {
                let match = matches[0];
                // console.log("Matched `" + funcString + "` with '" + match[0] + "'")
                return [matched.concat([match[0]]), match[1]];
            }
            else {
                // console.log("Failed to match `" + funcString + "` at '" + unescape(remaining) + "'.");
            }
            return null;
        }, [[], input]);

        if (ms === null)
            return [];
        else
            return [ms] ;
    }
    f.expressionString = function() {
        return `sequence(${expressions.map(function(expression){
            return expression.expressionString() || expression.toString();
        }).join(', ')})`;
    }
    return f;
}

/**
 * Try to match a list of expressions until one succeeds. Return the result of
 * the first successful match. Fail if none of the expressions match.
 * @method choice
 * @param  {array}    expressions An array of expressions to try to match
 * @return {function}             Expression function
 */
export function choice(expressions) {
    let f = function(input) {
        for (let i = 0; i < expressions.length; i++) {
            let matches = expressions[i](input);
            if (matches.length > 0)
                return matches;
        }
        return [];
    }
    f.expressionString = function() {
        return `choice(${expressions.map(function(expression){
            return expression.expressionString() || expression.toString();
        }).join(', ')})`;
    }
    return f;
}

/**
 * Try to match an expression. If it succeeds, return the result. If it fails,
 * return null (still passing as a successful match).
 * @method optional
 * @param  {function} expression The expression to match
 * @return {function}            Expression function
 */
export function optional(expression) {
    let f = function(input) {
        let matches = expression(input);
        if (matches.length > 0) {
            return matches;
        }
        else {
            return [[null, input]];
        }
    }
    f.expressionString = function() {
        return `optional(${ expression.expressionString() || expression.toString() })`;
    }
    return f;
}

/**
 * Match an expression without consuming input. Succeed if expression matches.
 * @method and
 * @param  {function} expression The expression to match
 * @return {function}            Expression function
 */
export function and(expression) {
    let f = function(input) {
        let matches = expression(input);
        if (matches.length > 0) {
            // Don't consume any input
            return matches.map(function(match) {
                return [undefined, input];
            });
        }
        else {
            return [];
        }
    }
    f.expressionString = function() {
        return `and(${ expression.expressionString() || expression.toString() })`;
    }
    return f;
}

/**
 * Match an expression without consuming input. Succeed if expression does not match.
 * @method not
 * @param  {function} expression The expression to match
 * @return {function}            Expression function
 */
export function not(expression) {
    let f = function(input) {
        let matches = expression(input);
        if (matches.length > 0) {
            // Fail
            return [];
        }
        else {
            // Succeed without consuming input
            return [[undefined, input]];
        }
    }
    f.expressionString = function() {
        return `not(${ expression.expressionString() || expression.toString() })`;
    }
    return f;
}

/**
 * Match an expression one or more times, greedily. Return an array of all
 * matches. Fail if the expression doesn't match at least once.
 * @method some
 * @param  {function} expression   The expression to match
 * @param  {array}    prevMatches  An array of previous matches (optional)
 * @return {function} Expression function
 */
export function some(expression, prevMatches) {
    let f = function(input) {
        var foundMatch = false,
            allMatches = [],
            allRemaining = input;
        do {
            let matches = expression(allRemaining);
            if (matches.length > 0) {
                foundMatch = true;
                let [matched, remaining] = matches[0];
                allMatches.push(matched);
                allRemaining = remaining;
            }
            else {
                foundMatch = false;
            }
        }
        while (foundMatch);

        if (allMatches.length > 0) {
            return [[allMatches, allRemaining]];
        }
        else {
            return [];
        }
    }
    f.expressionString = function() {
        return `some(${ expression.expressionString() || expression.toString() })`;
    }
    return f;
}


// Primitive expressions

/**
 * Match a single character
 * @method char
 * @param  {string} c The character to match. If none is given, allow any single char
 * @return {function} Expression function
 */
export function char(c) {
    let f = function(input) {
        if (input.length > 0 && ((c === undefined) || input[0] === c)) {
            return [[input[0], input.substring(1)]];
        }
        else {
            return [];
        }
    }
    f.expressionString = function() {
        let type = c !== undefined ? `('${unescape(c)}')` : '';
        return `char${ type }`;
    }
    return f;
}

/**
 * Match an entire string
 * @method string
 * @param  {string} s The string to match
 * @return {function} Expression function
 */
export function string(s) {
    let f = function(input) {
        let prefix = input.substring(0, s.length);
        if (prefix === s) {
            return [[prefix, input.substring(s.length)]];
        }
        else {
            return [];
        }
    }
    f.expressionString = function() {
        return `string('${ s }')`;
    }
    return f;
}

/**
 * Match a single base 10 digit
 * @method digit
 * @return {function} Expression function
 */
export function digit() {
    let f = function(input) {
        if ("0123456789".indexOf(input[0]) > -1) {
            return [[input[0], input.substring(1)]];
        }
        else {
            return [];
        }
    }
    f.expressionString = function() {
        return 'digit';
    }
    return f;
}


// Higher-level expressions

/**
 * Match a base 10 natural number,
 * consuming all consecutive digits
 * @method digit
 * @return {function} Expression function
 */
export function nat() {
    let f = function(input) {
        let matches = sequence([not(char('0')), digit(), some(digit())])(input);
        if (matches.length > 0) {
            let [[_, head, tail], remaining] = matches[0];
            let digits = [head].concat(tail);
            let intStr = digits.join('');
            let int = parseInt(intStr, 10);
            return [[int, remaining]];
        }
        else {
            return [];
        }
    }
    f.expressionString = function() {
        return 'nat';
    }
    return f;
}
