
block_chars = "WRM?["

def parse_blocks(s):
    def parse_blocks_(level=0):
        try:
            token = next(tokens)
        except StopIteration:
            if level != 0:
                raise Exception('unbalanced blocks - too few closing braces')
            else:
                return []
        if token == '}':
            if level == 0:
                raise Exception('unbalanced blocks - too many closing braces')
            else:
                return []
        elif token in block_chars:
            return [[token, parse_blocks_(level+1)]] + parse_blocks_(level)
        else:
            return [token] + parse_blocks_(level)
    tokens = iter(s)
    return parse_blocks_()


code = "abcWdef}abcRgurkfWfdjskdf}dsf}sdassd}"

tokens = parse_blocks(code)
print(tokens)