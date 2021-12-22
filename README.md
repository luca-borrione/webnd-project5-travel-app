# Travel App

Capstone project for the Front End Web Developer Nanodegree at Udacity

## Live Demo:

This project has been published to my personal heroku account and can be viewed visiting<br /> [https://my-capstone-travel-app.herokuapp.com/](https://my-capstone-travel-app.herokuapp.com/)

## Overview:

This is the 5th and final assessment project for the Udacity's [Front End Web Developer Nanodegree program](https://www.udacity.com/course/front-end-web-developer-nanodegree--nd0011)

This project aims to build a travel app which allows the user to create trip cards and to save them for future reference. The user can enter the details of the trip in a form, which retrieves information from several sources
to eventually present the results in a form of a trip card that the user can save.

The project I realised meets the [project specifications](https://review.udacity.com/#!/rubrics/3636/view) required by Udacity.

## Extras:

Features implemented from the project suggestions to make the project stand out:

- Add end date and display length of trip.
- Pull in an image for the country from Pixabay API when the entered location brings up no results (good for obscure localities).
- Integrate the REST Countries API to pull in data for the country being visited. I used **Position Stack** for this, as I found it more convenient.
- Allow the user to remove the trip.
- Use Local Storage to save the data so that when they close, then revisit the page, their information is still there.
- Incorporate icons into forecast.
- Allow the user to add additional trips (this may take some heavy reworking, but is worth the challenge).<br />
  Automatically sort additional trips by countdown.
  Move expired trips to bottom/have their style change so it’s clear it’s expired.

## Tech Stack:

- HTML
- SASS
- JavaScript
- Node
- Express
- Webpack
- Babel
- Service Workers / Workbox
- Jest
- Supertest

## Prerequisites:

1. [Install nvm](https://github.com/creationix/nvm#installation)

1. [Install yarn](https://yarnpkg.com/lang/en/docs/install/)
1. Install watchman

   `brew install watchman`

1. Sign up for API keys and create a **.env** file at the project's root with the following entries:

   | ENV KEY              | SIGN UP AT                               |
   | :------------------- | :--------------------------------------- |
   | GEONAMES_USERNAME    | http://www.geonames.org/login            |
   | PIXABAY_APIKEY       | https://pixabay.com/api/docs/            |
   | POSITIONSTACK_APIKEY | https://positionstack.com/signup         |
   | WEATHERBIT_APIKEY    | https://www.weatherbit.io/account/create |

## Run the App

1. Install and use the Node version from the project's .nvmrc file

   `nvm install`

1. Install the node modules

   `yarn install`

1. Run the following commands in a terminal window and then open a browser pointing at the corresponding url

|                                     |
| :---------------------------------- |
| Prod                                |
| `yarn compile; yarn start`          |
| http://localhost:8080               |
|                                     |
| Dev                                 |
| `yarn compile:dev; yarn start`      |
| http://localhost:8080               |
|                                     |
| Dev with hot reload                 |
| `yarn dev`                          |
| `yarn start` (in a second terminal) |
| http://localhost:3000               |

## Other commands

| Command       | Action                         |
| :------------ | :----------------------------- |
| `yarn test`   | run unit tests with jest       |
| `yarn format` | format all the files           |
| `yarn lint`   | check the styling of the files |
