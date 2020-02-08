import {parse, sequence, choice, optional, some, and, string, char, digit, nat} from './modules/func-parse.mjs';

$(function() {
    try {
        let parser = nat();
        let ast = parse(parser, '100');
        console.log(ast);
    }
    catch (error) {
        let $out = $('#output > textarea');
        console.error(error);
        $out.val($out.val() + "[ERROR] " + error + '\n')
    }

    var end = this.selectionEnd;

});
