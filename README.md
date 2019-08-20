# Overwatch Hero Picker

Repository for the [Random Hero Picker](https://owheropicker.com/) for Overwatch

## Usage

The easiest way to use is to go to the [Random Hero Picker website](https://owheropicker.com/) directly. Alternatively, you can follow the instructions below to run this on your machine/server.

## Running on your machine

If for some reason you prefer to running the site on your machine rather than visiting the website, follow these instructions:

### Prerequisites

* [Node](https://nodejs.org/en/) (Tested with the most recent LTS version, others might work too)
* [Angular Cli](https://cli.angular.io/)

    `npm install -g @angular/cli`

### Instalation

* Clone the repo
* `cd` into the repo folder
* `npm install` to install the dependencies

### Running

* `ng serve -o` 

  This runs the site on your localhost and makes it available at http://localhost:4200/. The `-o` flag will open the site on your default browser automatically as soon as it is finished building.

More advanced users can also use `ng build --prod` to generate static files for the site. If you choose this method you might need to change the `baseHref` and allow CORS. See the [ng build documentation](https://angular.io/cli/build) for more info on how to use this for your specific needs.

