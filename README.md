# Teleop WebApp README

## Quick Start Procedure (TODO make this a single roslaunch file script)

Important: Make sure to have setup the backend server first. See instructions below. 
Open a separate terminal on the Arm-Follower PC for each of these commands:
```
//Setup robot monitoring camera, replace serial number for new cameras
$ roslaunch realsense2_camera rs_camera.launch camera:=cam_onarm serial_no:=626206004459
$ rosrun web_video_server web_video_server

//Serve up webapp URL to other clients on network
$ http-server -p 8000 --username panda --password areB&W

//Setup MIOS-WebApp Bridge
$ roslaunch rosbridge_server rosbridge_websocket.launch
$ roslaunch mios_interface local_master.launch
$ roslaunch haptic_web demo_ucsc.launch

//Start the MIOS Teleop Skill TODO: Provide instructions for the Dockerized MIOS.
Option 1: When working directly on the robot-PC
$ cd ~/mios/python/utils
$ python3 -i system_test.py
>>> start_skill("collective-panda-010.rsi.ei.tum.de","Telepresence",{"is_master":False,"ip_dst":"10.162.15.137","port_dst":8888,"port_src":8888,"telepresence_mode":"Joystick"},{"control_mode":0})

Option 2: When working with the robot-PC using Docker
$ docker pull msrm/mios:release	
$ docker run -it --network host msrm/mios:release
```

**Troubleshooting Tip:** If you run into problems trying to tab-complete the above commands, make sure you have sourced the correct environment in your terminal window.
`source ~catkin_ws/devel/setup.bash`

**Troubleshooting Tip2** The MIOS skill uses a flag "ip_dst" to refer to the IP address of the Master/Sender device. A better name for this flag would be "sender_ip".

**Troubleshooting Tip3** If you don't already have docker then you can follow the instructions [here](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04).

Verify you have set up everything correctly by using a web browser (Chrome preferred) to navigate to the web app. You can find the URL from the http-server command. You will also have to input a username ane password if supplied with the command. 
- URL: "<robot_server_ip>:8000" 
- Example URL: "http://192.168.5.3:8000"

You should see the following screen, with a speed slider, video stream, and joystick:

<img src="../images/screenshot_frontend.png" width="400">

### Front End Application Details
Consists of a web app written in Javascript with Node and Bootstrap to provide a user control of a connected, physical robotic arm for the purpose of conducting human user studies. 

The FrontEnd shall have a selectable User Frame, selectable input control device, and a selectable web cam stream. The User Frame allows the user to choose how the control inputs are applied to the robot movements either in the World Frame or the Tool Frame. Supported input control devices shall include keyboard, on-screen joystick, mouse, PS4 game pad. On-screen joystick is only supported at this time. The video stream can be switched between available cameras in the robot workspace. Two cameras are planned to be supported: on-arm "hand" camera and fixed "head" camera.


### Back End Application Details
Below are the instructions for setting up a new server for the backend.

<img src="../images/backend_architecture.png" width="400">

#### Setting up a new backend server "Arm-Follower PC"
1. Install the required dependencies with the following commands:

	`$ sudo apt install ros-melodic-rosbridge-suite ros-melodic-web-video-server ros-melodic-realsense2-camera`

	`$ npm install -g http-server` if node is not already installed follow instructions, [here](https://linuxize.com/post/how-to-install-node-js-on-ubuntu-18.04/#installing-nodejs-and-npm-using-nvm)
Librealsense [installation instructions](https://github.com/IntelRealSense/librealsense/blob/master/doc/distribution_linux.md)
2. Copy the "Frontend" folder to the server and start the http file server. 
3. Run through the commands in the [Quick Start Procedure](https://github.com/peterso/remote-panda/tree/master/frontend#quick-start-procedure-todo-make-this-a-single-roslaunch-file-script)
4. Verify your setup by browsing to the newly hosted web app from a separate device on the same local network i.e. "localhost:8000"
5. Setup robot server for the haptic_web and MIOS interfaces.

```
//Create a catkin workspace
$ mkdir -p ~/catkin_ws/src
$ cd ~/catkin_ws/src

//Clone the required repositories
$ git clone https://github.com/moortgat-pick/haptic_udp https://github.com/moortgat-pick/mios_interface https://github.com/moortgat-pick/haptic_web https://github.com/moortgat-pick/skydio_proxy https://github.com/moortgat-pick/asio https://github.com/moortgat-pick/haptic_udp https://github.com/moortgat-pick/erl_util

//Configure robot host PC
$ cd erl_util/
$ .configure.sh
$ roslaunch mios_interface local_master.launch
$ roslaunch haptic_web demo_ucsc.launch
```

6. Add instructions for setting up the VPN on robot server.
OpenVPN is used to create a secure connection between the location of the robot and the operator. Designated certificates for the TUM and UCSC servers are provided with fixed IP address for easy addressing. A separate, third certificate for User Study Participants is provided to be shared with a participant's device to access the experimental network. If OpenVPN is not already installed on the machine follow the instructions [here](https://www.ovpn.com/en/guides/ubuntu-cli).
- ucsc.ovpn
- tum-msrm.ovpn
- user-study.opvn

To establish a connection to the experimental network use the OpenVPN certificate with:
```
$ sudo openvpn /path/to/cert/ucsc.opvn
```
Verify you are connected to the network with `ifconfig`. A network interface should be created under "tun0". 
- TUM-MSRM 	== 192.168.6.6
- UCSC 		== 192.168.6.10
- Participant == 192.168.6.14(+4)
Final confirmation can be achieved if you can successfully ping both the TUM-MSRM and UCSC servers when they are connected. 


### Acknowledgements
This project leverages the work from the following projects:

* https://wiki.ros.org/web_video_server
* https://github.com/IntelRealSense/realsense-ros
* https://medium.com/husarion-blog/bootstrap-4-ros-creating-a-web-ui-for-your-robot-9a77a8e373f9
* https://github.com/moortgat-pick/haptic_web
* https://github.com/moortgat-pick/skydio_proxy
* https://github.com/moortgat-pick/asio
* https://github.com/moortgat-pick/mios_interface
* https://github.com/moortgat-pick/erl_util
* https://github.com/moortgat-pick/haptic_udp
* https://gitlab.lrz.de/ge29miq/mios
