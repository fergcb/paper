from Paper.module.stack import Stack
from Paper.module.command import commandset, match_command

block_chars = ["W", "R", "M", "?", "["]


def parse_blocks(s):
    def parse_blocks_(level=0):
        try:
            token = next(tokens)
        except StopIteration:
            if level != 0:
                raise Exception("unbalanced blocks - too few closing braces")
            else:
                return []
        if token == "}":
            if level == 0:
                raise Exception("unbalanced blocks - too many closing braces")
            else:
                return []
        elif token in block_chars:
            return [[token, parse_blocks_(level+1)]] + parse_blocks_(level)
        else:
            return [token] + parse_blocks_(level)
    tokens = iter(s)
    return parse_blocks_()


def parse_nums(s):
    tokens = []
    innum = False
    buffer = ""
    prev = ""
    for c in s:
        if innum:
            possible = "123456789"
            if prev in "eE" or prev == "":
                possible += "+-"
            else:
                possible += "0.eE"
            if c not in possible:
                innum = False
                try:
                    tokens += [float(buffer)]
                except ValueError:
                    raise Exception("malformed number literal '" + buffer + "'")
                buffer = ""
                tokens += [c]
            else:
                buffer += c
        else:
            if c in "0123456789":
                innum = True
                buffer += c
            else:
                tokens += [c]
        prev = c
    return tokens


def parse_strings(s):
    tokens = []
    instring = False
    buffer = ""
    prev = ""
    for c in s:
        if instring:
            if c == "\"" and prev != "\\":
                instring = False
                tokens += [buffer]
                buffer = ""
            else:
                buffer += c
        else:
            if c == "\"":
                instring = True
            elif c != "\\":
                tokens.append(c)
        prev = c
    return tokens


def execute(tokens, stack=Stack()):
    tokens = iter(tokens)
    while True:
        try:
            token = next(tokens)
        except StopIteration:
            return stack
        if type(token) is list:
            block_type = token[0]
            block = token[1]
            if block_type == "R":
                pass
            elif block_type == "W":
                pass
            elif block_type == "M":
                pass
            elif block_type == "?":
                pass
            else:
                raise Exception("unknown block type '" + block_type + "'")
        elif type(token) is float:
            stack.push(token)
        elif len(token) > 1:
            stack.push(token)
        else:
            command = match_command(token, stack)



print(parse_blocks(parse_nums(parse_strings('R"test"ab0123c}def2.5e-3WghiRabc}def}xyz'))))