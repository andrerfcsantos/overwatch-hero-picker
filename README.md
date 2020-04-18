# Overwatch Hero Picker

Repository for the [Random Hero Picker](https://owheropicker.com/) for Overwatch

## Usage

The easiest way to use is to go to the [Random Hero Picker](https://owheropicker.com/) website directly. Alternatively, you can follow the instructions below to run this on your machine/server.

## Running on your machine

If for some reason you prefer to running the site on your machine rather than visiting the website, follow these instructions:

### Prerequisites

* [Node](https://nodejs.org/en/)
* [Vue Cli](https://cli.vuejs.org/guide/installation.html)

### Running the site

* Clone the repo
* `cd` into the repo folder
* `npm install` to install the dependencies
* You can now run the site using `npm` directly or generate static files that can be served by a webserver:
    * `npm run serve` to serve the site on localhost
    * `npm run build --prod` to generate the site static files. This command will put all the files under a `dist` directory. These files should then be put behind a webserver to serve the site.
