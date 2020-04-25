import {instructions} from './paper-instructions.mjs';

// Token classes

export class Expression {
    execute(stack, currentLine) { return [stack, currentLine]; }
}

export class Instruction extends Expression {

    constructor(c) {
        super();
        this.char = c;
    }

    execute(stack, currentLine) {
        return instructions[this.char](stack, currentLine);
    }
}


export class Block extends Expression {
    constructor(exps) {
        super();
        this.expressions = exps;
    }
}

export class MapBlock extends Block {

    static get type() {
        return 'M';
    }

    constructor(exps) {
        super(exps);
    }

    execute(stack, currentLine) {
        // TODO: Map block execution
    }
}

export class RepeatBlock extends Block {

    static get type() {
        return 'R';
    }

    constructor(exps) {
        super(exps);
    }

    execute(stack, currentLine) {
        // TODO: Repeat block execution
    }
}

export class DecisionBlock extends Block {

    static get type() {
        return '?';
    }

    constructor(exps) {
        super(exps);
    }

    execute(stack, currentLine) {
        // TODO: Decision block execution
    }
}

export class Literal extends Expression {
    constructor(value) {
        super();
        this.value = value;
    }

    execute(stack, currentLine) {
        stack.push(this.value);
    }
}

export class StringLiteral extends Literal {
    constructor(value) {
        super(value);
    }
}

export class IntegerLiteral extends Literal {
    constructor(value) {
        super(value);
    }
}

export class BlockLiteral extends Literal {

    static get type() {
        return '{';
    }

    constructor(value) {
        super(value);
    }
}
