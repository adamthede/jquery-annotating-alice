$(document).ready(function() {

    // LOAD TEXT FILE CONTENTS INTO A VARIABLE
    var text;
    text = $.ajax({
        type: 'get',
        url: 'ch08.txt',
        async: false
    }).responseText;

    // REMOVE THE NEW LINE CHARACTER AND REPLACE WITH A SPACE
    text = text.replace(/(\r\n|\n|\r)/gm, " ");

    // READ XML FILE
    $.ajax({
        type: 'get',
        url: 'ch08.txt.xml',
        dataType: 'xml',
        success: function(data) {
            utilizeXml(data);
        }
    });

    // PREPARE COUNTERS
    var totalLocations = 0;
    var totalPersons = 0;
    var totalOrganizations = 0;
    var offset = 0;

    // UTILIZE THE XML DATA
    function utilizeXml(data) {
        for (var i = 0; i < data.getElementsByTagName('span').length; i++) {

            // EXTRACT NECESSARY XML ATTRIBUTES
            var category = data.getElementsByTagName('span')[i].getAttribute('category');
            var start = data.getElementsByTagName('span')[i].childNodes[1].childNodes[1].getAttribute('START') * 1;
            var end = data.getElementsByTagName('span')[i].childNodes[1].childNodes[1].getAttribute('END') * 1;
            var textContent = data.getElementsByTagName('span')[i].childNodes[1].childNodes[1].textContent;

            // INCREMENT TOTAL COUNTERS
            if (category == "LOCATION") {
                totalLocations++;
            } else if (category == "PERSON") {
                totalPersons++;
            } else if (category == "ORGANIZATION") {
                totalOrganizations++;
            } else {
                console.log("no categories found");
            }

            // SLICE AND DICE TEXT
            var opening = '<a type="button" class="btn ' + category.toLowerCase() + '" data-toggle="modal" data-target="#aliceModal" id="anno-' + i + '">';
            var closing = '</a>';
            start = start + offset;
            end = end + offset;
            // ADD MARKUP TO TEXT FILE
            text = insert(text, start, end, opening, closing);
            // OFFSET IS EQUAL TO TOTAL CHARACTERS ADDED TO TEXT FILE
            offset = offset + opening.length + closing.length;
        }

        // SEND MODIFIED TEXT TO DOM
        sendToDom(text);

        // SHOW CATEGORY TOTALS
        displayTotals();

    }

    function displayTotals() {
        $('#person-total').empty().text(totalPersons);
        $('#location-total').empty().text(totalLocations);
        $('#organization-total').empty().text(totalOrganizations);
    }

    function insert(text, start, end, open, close) {
        var modText = text.substr(0, start) + open + text.substr(start, end + 1 - start) + close + text.substr(end + 1);
        return modText;
    }

    function sendToDom(text) {
        $('.text').html(text);

        // DOM MANIPULATION
        $('.person').click(function() {
            var categorytype = 'person';
            var item = $(this);
            buildModal(categorytype, item);
        });

        $('.organization').click(function() {
            var categorytype = 'organization';
            var item = $(this);
            buildModal(categorytype, item);
        });

        $('.location').click(function() {
            var categorytype = 'location';
            var item = $(this);
            buildModal(categorytype, item);
        });
    }

    function buildModal(cat, item) {
        // CLEAR ANY PREVIOUS INTERACTION
        $('#modal-header-category').empty();
        $('#modal-body-category').empty();
        $('#modal-item').empty();

        // DISPLAY CATEGORY TYPE AND ANNOTATION
        $('#modal-header-category').html(cat.toUpperCase()).addClass(cat);
        $('#modal-body-category').html(cat.toUpperCase()).addClass(cat);
        $('#modal-item').html('"' + item.text() + '"');

        // DELETE ANNOTATION
        $('#delete-annotation').unbind('click').bind('click', function(e) {
            e.preventDefault();
            if (confirm("Are you sure you wish to delete this annotation?")) {
                $('#aliceModal').modal('hide');
                updateDomAndCategories(cat, item);
            } else {
                $('#aliceModal').modal('hide');
            }
        });

        // CANCEL AND RESET MODAL
        $('#aliceModal').on('hidden.bs.modal', function(e){
            e.preventDefault();
            $('#modal-header-category').removeClass(cat).empty();
            $('#modal-body-category').removeClass(cat).empty();
            $('#modal-item').empty();
        })
    }

    function updateDomAndCategories(cat, item) {
        // DECREMENT TOTAL COUNTERS
        if (cat == "location") {
            totalLocations--;
        } else if (cat == "person") {
            totalPersons--;
        } else if (cat == "organization") {
            totalOrganizations--;
        } else {
            console.log("no categories found");
        }

        displayTotals();

        // FIND AND REMOVE ANNOTATION
        var id = item.attr('id');
        $('#' + id).removeClass(cat).removeClass('btn').removeAttr('data-target').removeAttr('data-toggle').removeAttr('type');

        // CLOSE THE ALICE MODAL
        $('#aliceModal').modal('hide');
    }

});
