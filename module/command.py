commandset = {
    "+": [
        (["num", "num"], lambda a,b: a+b),
        (["str", "any"], lambda a,b: a+str(b)),
        (["any", "str"], lambda a,b: str(a)+b)
    ]
}


def match_command(label, stack):
    if label in commandset:
        matches = commandset[label]

    else:
        raise Exception("no such command '"+ label +"'")