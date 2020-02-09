# Grammar

**A paper program consists of one or more lines of code.**

 - `program` ← `line+`

**Each line consists of one or more expressions.**

 - `line` ← `expression+` `( '\n' / '\r' )+`

**An expression might be a literal such as a string or integer, an instruction, or a code block.**

 - `expression` ← `( literal / instruction / block )`

**A literal may be a character, a string, or an integer.**

 - `literal` ← `( character_literal \ string_literal \ integer_literal )`
    - `character_literal` ← `"'" char`
    - `string_literal` ← `'"' char+ '"'`
    - `integer_literal` ← `[0123456789] \ ('#' [0123456789]+)`

**A code block consists of a start character, a series of expressions, and a closing bracket, `}`.**

 - `block_start` ← `[\{\?MR]`
 - `block` ← `block_start expression+ '}'`

**An instruction may be any single character that is not a literal delimiter, a digit, a block start character, `}`, `\n` or `\r`.**

 - `instruction` ← `!block_start [^\}\'\"\#\n\r]`
