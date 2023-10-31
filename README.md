# Wii Balance Board Center of Pressure
This is an experimental project to get center of pressure (CoP) data from the Wii Balance Board (WBB) in the browser.

![Wii Balance Board demo gif](WBBdemo.gif)

**Demo available:** [https://measure-balance.netlify.app](https://measure-balance.netlify.app)


## Introduction

The goal of this project was to get the WBB to work on the Web. This is done by leveraging the power of [WebHID](https://wicg.github.io/webhid/).

There are numerous research studies done on the WBB and its potential clinical applications. However there has been little to no access for clinicians and patients to software that would enable them to use it. 

This project will explore the possbile applications and share them on the web.

## Features

- Connect WBB to the browser
- Calculate CoP while on the board
- Display CoP in real time for biofeedback
- Clear data plot, pause and play live feed
- Record trials of balance using a timer or manually stopping the recording
- Filter the raw CoP data using SwARII method developed by 
- Download raw and filtered data during trials as a CSV file 
    - CSV file will be formated in three columns: time(s), xCoordinate(mm), yCoordinate(mm)
- Toggle LED on board


## How It's Made

Tech used: HTML JavaScript Tailwind WebHID-API

## Optimizations

- add more metrics for measuring balance based on current research
- change plotting interface to something more interactive and can show multiple plots such as d3
- add backend so users can store data and compare it over time
- improve UI to show interpretations of balance score

## Special Thanks

PicchiKevin for the original WiiMote API 

Zackaton for the Wii Balance Board implementation 

Everyone who contributed info to the [WiiBrew Wiki](https://wiibrew.org/wiki/Wiimote) 