#Donor Reveal

Donor-reveal is code that allows users to instantly reveal who donated to any current lawmakers mentioned in a story filed in @NCCapitol. It uses data from the National Institute on Money in State Politics.

By hovering over a lawmaker's name, a pop-up will show basic information, as well as donation totals and the lawmaker's top five contributors.

The WRAL version was inspired by the [Greenhouse Chrome extension](http://allaregreen.us/), created by Nicholas Rubin, to track money in Congress.

See an example here:

http://wral.com/14509748

## NOTE

We're storing code here mostly for internal purposes. Additional code to scrape and store data from the followthemoney.org API (built into the WRAL CMS) is required to create a working version of Donor Reveal.

## How it works

The most basic building block of donor-reveal data is WRAL's dataset of current state lawmakers in the House and Senate.

Donor-reveal relies heavily on campaign funding data from the [National Institute on Money in State Politics](http://followthemoney.org) and its open application programming interface, or API. Every night around 10 p.m., WRAL.com runs "data ingestors" that gather the most recently updated information available about each of the state's 170 state House and Senate members based on the names and IDs listed in WRAL's lawmakers dataset. The ingestors capture information on the each lawmaker's top-50 donors from latest election cycle, the date the data was last updated and, from a separate API endpoint, the total amount of donations the lawmaker received since the last election cycle.

This data is stored automatically in a dataset asset in Diesel, with each lawmaker's information stored under their distinct "entity id."

When a user loads a story filed in @NCCapitol, the donor-reveal script tries to find any full name listed in the lawmaker dataset (names are case-sensitive and must be spelled exactly the same as those in the database). If names are found, the script uses special highlighting on the text. It retrieves the bio information, contribution totals and top-five contributors from the data store and feeds them into a box that will appear when users hover over the highlighted text (or click/tap on mobile).