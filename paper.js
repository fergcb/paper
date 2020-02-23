import {parse} from './modules/func-parse.mjs';
import {parser} from './modules/paper-parser.mjs';

$(function() {
    $("#runButton").click(function() {
        try {
            let code = $("#input > textarea").val();
            let ast = parse(parser(), code);
            console.log(ast);
        }
        catch (error) {
            let $out = $('#output > textarea');
            console.error(error);
            $out.val($out.val() + "[ERROR] " + error + '\n')
        }
    });
});
