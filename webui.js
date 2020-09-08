var twist;
var cmdVel;
var publishImmidiately = true;
var server_id;
var manager;
var teleop;
var ros;

function moveAction(linear, angular) {
    if (linear !== undefined && angular !== undefined) {
        twist.linear.x = linear * teleop.scale;
        twist.angular.z = angular * teleop.scale;
    } else {
        twist.linear.x = 0;
        twist.angular.z = 0;
    }
    cmdVel.publish(twist);
}

function initVelocityPublisher() {
    // Init message with zero values.
    twist = new ROSLIB.Message({
        linear: {
            x: 0,
            y: 0,
            z: 0
        },
        angular: {
            x: 0,
            y: 0,
            z: 0
        }
    });
    // Init topic object
    cmdVel = new ROSLIB.Topic({
        ros: ros,
        name: '/cmd_vel',
        messageType: 'geometry_msgs/Twist'
    });
    // Register publisher within ROS system
    cmdVel.advertise();
}

function initTeleopKeyboard() {
    // Use w, s, a, d keys to drive your robot

    // Check if keyboard controller was aready created
    if (teleop == null) {
        // Initialize the teleop.
        teleop = new KEYBOARDTELEOP.Teleop({
            ros: ros,
            topic: '/cmd_vel'
        });
    }

    // Add event listener for slider moves
    robotSpeedRange = document.getElementById("robot-speed");
    teleop.scale = 0.5; // default speed
    robotSpeedRange.oninput = function () {
        teleop.scale = robotSpeedRange.value / 100
        console.log("Robot speed: ",teleop.scale);
    }
}

function createJoystick() {
    // Check if joystick was aready created
    if (manager == null) {
        joystickContainer = document.getElementById('joystick');
        // joystck configuration, if you want to adjust joystick, refer to:
        // https://yoannmoinet.github.io/nipplejs/
        var options = {
            zone: joystickContainer,
            position: { left: 50 + '%', top: 105 + 'px' },
            mode: 'static',
            size: 200,
            color: '#0066ff',
            restJoystick: true
        };
        manager = nipplejs.create(options);
        // event listener for joystick move
        manager.on('move', function (evt, nipple) {
            // nipplejs returns direction is screen coordiantes
            // we need to rotate it, that dragging towards screen top will move robot forward
            var direction = nipple.angle.degree - 90;
            if (direction > 180) {
                direction = -(450 - nipple.angle.degree);
            }
            // convert angles to radians and scale linear and angular speed
            // adjust if youwant robot to drvie faster or slower
            var lin = Math.cos(direction / 57.29) * nipple.distance * 0.01;
            var ang = Math.sin(direction / 57.29) * nipple.distance * 0.01;
            // nipplejs is triggering events when joystic moves each pixel
            // we need delay between consecutive messege publications to 
            // prevent system from being flooded by messages
            // events triggered earlier than 50ms after last publication will be dropped 
            if (publishImmidiately) {
                publishImmidiately = false;
                moveAction(lin, ang);
                setTimeout(function () {
                    publishImmidiately = true;
                }, 50);
            }
        });
        // event litener for joystick release, always send stop message
        manager.on('end', function () {
            moveAction(0, 0);
        });
    }
}

window.onload = function () {
    // determine robot address automatically
    server_id = self.location.hostname;
    // also usable: server_id = document.location.hostname;
    console.log('server id: '+server_id);

    // Init handle for rosbridge_websocket i.e. connecting to ROS
    ros = new ROSLIB.Ros({
        url: "ws://" + server_id + ":9090"
    });

    ros.on('connection', function() {
      console.log('Connected via rosbridge to ' + server_id);
    });

    ros.on('error', function(error) {
      console.log('Error connecting to server', error);
    });

    ros.on('close', function() {
      console.log('Connection to server closed');
    });

    var cam_1_ref = new ROSLIB.Param({
      ros : ros,
      name : '/telepresence_web/cam_1_ref'
    });

    var cam_2_ref = new ROSLIB.Param({
      ros : ros,
      name : '/telepresence_web/cam_2_ref'
    });

    initVelocityPublisher();
    // get handle for video placeholders
    video_1 = document.getElementById('video_1');
    video_2 = document.getElementById('video_2');
    // Populate video sources
    const host_id_ident = "$HOSTID"
    const host_name_ident = "$HOSTNAME"
    cam_1_ref.get(function(value) {
      //value = value.replace(host_identifier, self.location.host);
      //TODO(Alex): update src URL to pull from ROS params for camera server and camera topic name
      video_1.src = "http://" + server_id + ":8080/stream?topic=/camera1/color/image_raw";
      console.log('Camera 1 ref: ',value);
    });
    cam_2_ref.get(function(value) {
      //TODO(Alex): update src URL to pull from ROS params for camera server and camera topic name
      video_2.src = "http://" + server_id + ":8080/stream?topic=/camera2/color/image_raw";
      console.log('Camera 2 ref: ',value);
    });
    video_1.onload = function () {
      video_2.onload = function () {
        // joystick and keyboard controls will be available only when video is correctly loaded
        createJoystick();
        initTeleopKeyboard();
      };
    };
}
