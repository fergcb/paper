

export function parse(p, inp) {
    let matches = p(inp);
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
 * @param  {array} a An array of expressions to match
 * @return {function} Expression function
 */
export function sequence(a) {
    let f = function(inp) {
        return [a.reduce(function(acc, curr){
            let [matched, remaining] = acc;
            let matches = curr(remaining);
            if (matches.length > 0) {
                let match = matches[0];
                return [matched.concat([match[0]]), match[1]];
            }
            else {
                let funcString = curr.expressionString() || (curr.toString() + '\n');
                throw "Failed to match `" + funcString + "` at '" + remaining + "'.";
            }
            return [];
        }, [[], inp])];
    }
    f.expressionString = function() {
        return `sequence(${a.map(function(e){
            return e.expressionString() || e.toString();
        })})`;
    }
    return f;
}

/**
 * Try to match a list of expressions until one succeeds. Return the result of
 * the first successful match. Fail if none of the expressions match.
 * @method choice
 * @param  {array} a An array of expressions to try to match
 * @return {function} Expression function
 */
export function choice(a) {
    let f = function(inp) {
        for (let i = 0; i < a.length; i++) {
            let matches = a[i](inp);
            if (matches.length > 0)
                return matches;
        }
        return [];
    }
    f.expressionString = function() {
        return `choice(${a.map(function(e){
            return e.expressionString() || e.toString();
        })})`;
    }
    return f;
}

/**
 * Try to match an expression. If it succeeds, return the result. If it fails,
 * return null (still passing as a successful match).
 * @method optional
 * @param  {function} p The expression to match
 * @return {function} Expression function
 */
export function optional(p) {
    let f = function(inp) {
        let matches = p(inp);
        if (matches.length > 0) {
            return matches;
        }
        else {
            return [[null, inp]];
        }
    }
    f.expressionString = function() {
        return `optional(${ p.expressionString() || p.toString() })`;
    }
    return f;
}

/**
 * Match an expression without consuming input. Succeed if expression matches.
 * @method and
 * @param  {function} p The expression to match
 * @return {function} Expression function
 */
export function and(p) {
    let f = function(inp) {
        let matches = p(inp);
        if (matches.length > 0) {
            // Don't consume any input
            return matches.map(function(match) {
                return [undefined, inp];
            });
        }
        else {
            return [];
        }
    }
    f.expressionString = function() {
        return `and(${ p.expressionString() || p.toString() })`;
    }
    return f;
}

/**
 * Match an expression without consuming input. Succeed if expression does not match.
 * @method not
 * @param  {function} p The expression to match
 * @return {function} Expression function
 */
export function not(p) {
    let f = function(inp) {
        let matches = p(inp);
        if (matches.length > 0) {
            // Fail
            return [];
        }
        else {
            // Succeed without consuming input
            return [[undefined, inp]];
        }
    }
    f.expressionString = function() {
        return `not(${ p.expressionString() || p.toString() })`;
    }
    return f;
}

/**
 * Match an expression one or more times, greedily. Return an array of all
 * matches. Fail if the expression doesn't match at least once.
 * @method some
 * @param  {function} p            The expression to match
 * @param  {array}    prevMatches  An array of previous matches (optional)
 * @return {function} Expression function
 */
export function some(p, prevMatches) {
    let f = function(inp) {
        let matches = p(inp);
        if (matches.length > 0) {
            let [matched, remaining] = matches[0];
            prevMatches = prevMatches || [];
            let allMatches = prevMatches.concat([matched])
            return some(p, allMatches)(remaining);
        }
        else {
            if (prevMatches === undefined) {
                return [];
            }
            return [[prevMatches, inp]];
        }
    }
    f.expressionString = function() {
        return `some(${ p.expressionString() || p.toString() })`;
    }
    return f;
}


// Primitive expressions

/**
 * Match a single character
 * @method char
 * @param  {string} c The character to match
 * @return {function} Expression function
 */
export function char(c) {
    let f = function(inp) {
        if (inp[0] === c) {
            return [[inp[0], inp.substring(1)]];
        }
        else {
            return [];
        }
    }
    f.expressionString = function() {
        return `char('${ c }')`;
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
    let f = function(inp) {
        let prefix = inp.substring(0, s.length);
        if (prefix === s) {
            return [[prefix, inp.substring(s.length)]];
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
    let f = function(inp) {
        if ("0123456789".indexOf(inp[0]) > -1) {
            return [[inp[0], inp.substring(1)]];
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
    let f = function(inp) {
        let matches = sequence([not(char('0')), digit(), some(digit())])(inp);
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
