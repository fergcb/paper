$(document).delegate('textarea', 'keydown', function(e) {
  let keyCode = e.keyCode || e.which;

  let substitutions = {9: '\t'}

  if (substitutions.hasOwnProperty(keyCode)) {
    e.preventDefault();
    var start = this.selectionStart;
    var end = this.selectionEnd;

    // set textarea value to: text before caret + tab + text after caret
    $(this).val($(this).val().substring(0, start)
                + substitutions[keyCode]
                + $(this).val().substring(end));

    // put caret at right position again
    this.selectionStart =
    this.selectionEnd = start + 1;
  }
});

jQuery(function($, undefined) {
    $('#terminal').terminal(
    {
        compile : function() {
            return "Compiling...";
        },
        run : function() {
            return "Running...";
        },
        paper : function () {
            let code;
            do {
                this.read("paper> ", c => {
                    code = c;
                    this.echo(code + " : Result");
                });
            } while (code != "exit");
        }
    },
    {
        greetings: 'Paper Terminal',
        name: 'paper_terminal',
        prompt: '>> '
    });
});
