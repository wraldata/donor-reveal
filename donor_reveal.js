/*donor-reveal_v0.82
 Allows users to instantly reveal who donated to any current lawmakers
 mentioned in a story filed in @NCCapitol.
 It uses data from the National Institute on Money in State Politics
 Created by Tyler Dukes and Alex Phillips
 Last updated 5.28.15, 10:40 a.m.
 */
require([
    'jquery',
    'lodash',
    'jquery-ui'
], function ($, _) {

    //Global variables
    var ncga_members = "not run";
    var ftm_data;
    var ftm_total;
    var pol_data = {};
    var opened_tooltip;

    //Load members of the NCGA
    var ncga_members = (function () {
        $.ajax({
            'async': true,
            'global': false,
            'url': '/news/state/nccapitol/data_set/14376504/?dsi_id=ncga-eid&version=jsonObj',
            'dataType': "json",
            'success': function (data) {
                ncga_members = data;
                highlightText();
            }
        });
        return ncga_members;
    })();

    //Query the FollowTheMoney.com API
    function getDonations(eid, wral_id) {
        $.ajax({
            'type': 'GET',
            'async': true,
            'url': '/news/state/nccapitol/data_set/14563916/?dsi_id=' + eid + '&version=jsonObj',
            'dataType': "json",
            'success': function (data) {
                //clear old data
                ftm_data = "";
                //just load the first five items for display
                $.each(data.slice(0, 5), function (index, value) {
                    //If statement here checks for lawmakers with no records
                    if (value["total"] == "No Records") {
                        ftm_data = '<tr><td>No records</td><td>$0</td></tr>';
                        ftm_total = '$0';
                    }
                    else {
                        ftm_data += '<tr><td>' + (value["contributor"]).replace(/\w\S*/g, function (txt) {
                            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                        }) +
                        '</td><td>$' + (Math.round(value["total"]) + "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + '</td></tr>';
                        ftm_total = '$' + (Math.round(data[0]["total_hide"]) + "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                    }
                });
                pol_data[wral_id][0] = ftm_total;
                //add value to the pol_data object
                pol_data[wral_id][1] = ftm_data;
                //add value info was last updated
                pol_data[wral_id][2] = data[0]["updated_hide"];
                //when finished, close the tool tip and reopen by replacing the spinner with real data
                $(".donor-reveal").tooltip('close');
                $(".donor-reveal#" + opened_tooltip).tooltip('open');
            }
        });
    }

    //define tooltip structure and pass in variables
    function ncgaBox(name, party, district, img, position, wral_id) {
        return '<div class="donor-box">' +
            '<img src="' + img + '">' +
            '<p><span class="law-header">' + position + '</span><span class="breakpoint-phone-and-tablet-only" id="close-dr">&nbsp;X&nbsp;</span><br />' +
            '<span class="law-name">' + name + '</span><br />' +
            '<span class="party-dist">' + party + '-' + district + '</span>' +
            '<p><span class="law-header">2013-14 donations:</span><br />' +
            pol_data[wral_id][0] + '</p>' +
            '<p style="clear:both;text-align:center;"><span class="law-header">Top donors since 2013</span></p>' +
            '<table class="table">' +
            '<thead><tr>' +
            '<th>Contributor</th><th>Total</th>' +
            '</thead></tr>' +
            '<tbody>' +
            pol_data[wral_id][1] +
            '</tbody></table>' +
            '<p class="source">Source: followthemoney.org<br />' +
            'Data as of ' + pol_data[wral_id][2] + '</p>' +
            '</div>';
    }

    //For clicking/tapping to close
    $('.donor-box').click(function () {
        $(".donor-reveal").tooltip('close');
    });

    //Script to find lawmakers and initialize distinct tooltips
    function highlightText() {
        //Make a list of lawmakers from the loaded JSON, then search for them
        for (var i = 0; i < ncga_members.length; i++) {
            $.each($(".story-text").children(), function() {
                /*
                Regex will prevent matching variable that is between HTML tags
                RegExp Breakdown:

                 (              # Open capture group
                    variable    # Match variable text
                 )              # End capture group
                 (?!            # Negative lookahead start (will cause match to fail if contents match)
                    [^<]*       # Any number of non-'<' characters
                    >           # A > character
                 |              # Or
                    [^<>]*      # Any number of non-'<' and non-'>' characters
                    <\/         # The characters < and /, with forward slash escaped
                 )              # End negative lookahead.

                 */
                var regex = new RegExp("(" + ncga_members[i]["member"] + ")(?![^<]*>|[^<>]*<\/)");
                replaceMarkup (
                    $(this),
                    regex,
                    '<button id="' + i + '" class="donor-reveal">' + ncga_members[i]["member"] + '</button>'
                );

                //and check for alternates, but only if the alt_spelling column isn't blank
                if (ncga_members[i]["alt_spelling"] != "") {
                    replaceMarkup(
                        $(this),
                        regex,
                        '<button id="' + i + '" class="donor-reveal">' + ncga_members[i]["alt_spelling"] + '</button>'
                    );
                }
            });
        }

        function replaceMarkup($element, regex, markup) {
            $element.html($element.html().replace(regex, markup));
        }

        //On successful highlight, grab all IDs with class donor-reveal and get JSON data
        $.each($('.donor-reveal'), function () {
            //initialize with a loading spinner
            pol_data[this.id] = ["", '<tr><td colspan="2" style="line-height:31px;"><img src="http://wwwcache.wral.com/presentation/v3/images/widgets/wait_popup/spinner.gif" style="width:31px;" />Loading...</td></tr>', ""];
            getDonations(ncga_members[this.id]["eid"], this.id)
        });

        //add tooltip
        $(".donor-reveal").tooltip({
            items: "button",
            open: function () {
                opened_tooltip = $(this).attr('id')
            },
            content: function () {
                var id = $(this).attr('id')
                return ncgaBox(ncga_members[id]["member"],
                    ncga_members[id]["party"],
                    ncga_members[id]["county_short"],
                    ncga_members[id]["headshot"],
                    ncga_members[id]["title"],
                    id
                );
            }
        });
    }
});