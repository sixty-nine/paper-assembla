/*jslint devel: true, sloppy: true, maxerr: 50, indent: 4 */
/*global jQuery, $, window */

/*
 * Paper-assembla-list.js
 *
 * Paper Assembla is a bookmarklet that can be used to print out user stories
 * from within Assembla (https://www.assembla.com).
 *
 * This version of Paper Assembla print out the sub-tickets as a table.
 *
 * Usage: Create a bookmark and set "javascript:" + this code as target or use
 * the minified version.
 *
 * Inspired by Paper-Jira (https://github.com/caillou/paper-jira).
 *
 * Author: D. Barsotti <daniel.barsotti@liip.ch>
 *
 * (c) Liip AG 2011
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

(function ($) {

    var data, number, title, milestone, story_points, component, priority,
        comment, related, rows, spinner, showPrintPreview, ajaxCallback,
        counter, assemblaUrl, style, maxDescriptionLength, shortenDescription;

    /* Base URL to access Assembla tickets */
    assemblaUrl = window.location.toString();
    assemblaUrl = assemblaUrl.substr(0, assemblaUrl.lastIndexOf('/') + 1);

    /* The max length for the description of the sub-tickets */
    maxDescriptionLength = 75;

    /* Default CSS style */
    style =
        "div { padding-bottom: 10px; } " +
        "div.ticket { font-size: 16px; width: 100%; } " +
        "div.ticket * { page-break-after: avoid; page-break-before: avoid; } " +
        "div.ticket label { display: inline; font-weight: normal; } " +
        "div.ticket span { font-weight: bold; } " +
        "div.ticket-nr { font-size: 25px; margin-right: 25px; float: left; } " +
        "div.ticket-title { font-size: 25px; font-weight: bold; padding-bottom: 25px; } " +
        "div.ticket-description h3 { font-size: 16px; padding-bottom: 10px; } " +
        "div.ticket-description { padding-top: 25px; } " +
        "div.ticket-description h3 { font-size: 16px; margin-bottom: 10px; } " +
        "div.ticket-description h3 + br { height: 1px; margin: 0; padding: 0; } " +
        "div.tickets-related { } " +
        "div.ticket-related { width: 32%; float: left; border: 1px dashed #666666; background-color: #D0D0D0; height: 200px; } " +
        "div.ticket-related label { font-weight: bold; color: black; } " +
        "div.ticket-related-nr { padding-bottom: 0 } " +
        "div.ticket-related-title { font-weight: bold; } " +
        "div.ticket-related-master { }";

    /* Spinner image base64 encoded */
    spinner = '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';
    counter = 0;

    /* Display the printable version of the ticket */
    showPrintPreview = function () {

        var table;

        /* Display the main ticket information */
        jQuery('body')
            .html('<div class="ticket" style="page-break-after:always; page-break-inside: avoid;"/>')
            .prepend('<style>' + style + '</style>')
            .find('div.ticket')
            .append('<div class="ticket-nr">' + number + '</div>')
            .append('<div class="ticket-title">' + title + '</div>')
            .append('<div class="ticket-milestone"><label>Milestone:</label> <span>' + milestone + '</span></div>')
            .append('<div class="ticket-story-points"><label>Stroy Points:</label> <span>' + story_points + '</span></div>')
            .append('<div class="ticket-component"><label>Component:</label> <span>' + component + '</span></div>')
            .append('<div class="ticket-priority"><label>Priority:</label> <span>' + priority + '</span></div>')
            .append('<div class="ticket-description">' + comment + '</div>');

        /* Display the sub-tickets information */
        table = $('div.ticket')
            .append('<div class="tickets-related"/>')
            .find('div.tickets-related')
            .append('<table><tr><th>Ticket No.</th><th>Relation</th><th>Summary</th></tr></table>')
            .find('table');

        related.each(function (e) {
            table.append('<tr>')
                .find('tr:last')
                .append('<td>' + e[0] + '</td>')
                .append('<td>' + e[2] + '</td>')
                .append('<td>' + e[1] + '</td>');
        });
    };

    /* Used to shorten the full description of the subtask so that it can be
     * nicely printed */
    shortenDescription = function (descr) {

        descr = descr.replace(/\w+/, ' ');

        if (descr.length >= maxDescriptionLength) {
            descr = descr.substr(0, maxDescriptionLength) + '...';
        }

        return descr;
    };

    /* AJAX callback used when getting sub-tickets information, will extract the
     * subticket description from the response, then, if there are no more AJAX
     * calls running (counter == 0), show the printable version */
    ajaxCallback = function (response) {

        var subdescr;

        counter = counter - 1;

        subdescr = jQuery('body').append('<div id="tmpdiv_' + counter + '" style="display: none;">')
            .find('#tmpdiv_' + counter)
            .html(response)
            .find('.description')
            .text()
            .replace(/^\s+/g, '')
            .replace(/\s+$/g, '');

        jQuery('tmpdiv_' + counter).remove();

        subdescr = shortenDescription(subdescr);

        related[counter].push(subdescr);

        if (counter === 0) {
            showPrintPreview();
        }
    };


    data = $('body');

    /* Wait spinner overlay */
    jQuery('body')
        .append('<div class="overlay"/>')
        .find('div.overlay')
        .css({
            'position': 'absolute',
            'top': '0',
            'left': '0',
            'right': '0',
            'bottom': '0',
            'z-index': '98',
            'opacity': 0.7,
            'filter': 'alpha(opacity = 70)',
            'height': '100%',
            'background-color': 'black',
            'background-image': "url('data:image/gif;base64," + spinner + "')",
            'background-repeat': 'no-repeat',
            'background-position': 'center'
        });

    /* Get information from the current ticket */
    number = data.find('.top-ticket-summary em').html();
    title = data.find('.top-ticket-summary h1').html();
    milestone = data.find('.milestone_id a').html();
    story_points = data.find('.total_estimate').text().replace('Estimated points: ', '');
    component = data.find('.component_id').text().replace('Component: ', '');
    priority = data.find('.priority').text().replace('Priority: ', '');
    comment = data.find('.description')
        .html()
        /* Try to reduce the size of the description */
        .replace('</h3><br>', '</h3>')
        .replace('</h3><br/>', '</h3>')
        .replace('<br/><br/>', '<br/>')
        .replace('<br><br>', '<br/>');

    if (number === null || title === null) {
        alert('An error has occured');
        $('div.overlay').remove();
        return;
    }

    /* Extract the available information for the sub-tickets */
    related = [];
    rows = data.find('#ticket_associations_list table.tickets tr[class!=""]');
    rows.each(function () {
        counter = counter + 1;
        related.push([
            $(this).find('td.number').text(),
            $(this).find('td.summary a').html(),
            $(this).find('td.number + td span').html()
        ]);
    });

    /* Request the missing information for sub-tickets */
    related.each(function (e) {
        $.ajax({
            url: assemblaUrl + e[0].replace('#', ''),
            success: ajaxCallback
        });
    });

}(jQuery));
