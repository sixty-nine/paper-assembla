(function ($) {

    var printStory, printSubtasks, addButton, uuid;

    uuid = 0;

    addButton = function (caption, callback) {
        
        $('body')
            .find('div.ttop-bar div.tb-topleft')
            .append('<p class="compact-icon-button"><a id="__button__' + uuid + '" href="#">' + caption + '</a></p>')
            .find('#__button__' + uuid)
            .click(function () { callback(); })
            .css({
                'cssText': 'background: url(\'/images/wiki/ico_print.gif\') no-repeat scroll 6px 3px; padding: 2px 8px 2px 26px !important'
            });
            
            uuid += 1;
    };

    printStory = function () {
        alert('Hello world');
    };

    printSubtasks = function () {
        alert('Hello universe');
    };

    addButton('Print Story', printStory);
    addButton('Print Subtasks', printSubtasks);

}(jQuery));
