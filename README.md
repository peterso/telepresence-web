# telepresence-web
A web endpoint for tele-operating a robot arm manipulator over a network

This endpoint is responsible for serving the user interface website and displays the two camera inputs from the robot work cell and provides the user a screen joystick to send jogging signals to move the robot. 

## Pre-requisites
-MIOS must be running on the robot PC (different from the machine hosting the web endpoint)
-MIOS_interface service must be running and is started separately
-Haptic_web Node must be running on the same machine as this web endpoint to interpret the user input and display robot feedback
-Cam1 and Cam2 must be plugged into this machine and Camera Nodes must be started separately

# Quick Start
Run the following command on the TUM Robot Network Server
`http-server -p 8000`
