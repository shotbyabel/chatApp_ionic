// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','btford.socket-io', 'ngSanitize', 'ngCordova'])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
////////////////////////////////////////////////////
//||||| UI ROUTER - STATES  ||||||||||||||||||||||||
//||||||||||||||||||||||||||||||||||||||||||||||||\\
.config(function($stateProvider, $urlRouterProvider){
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'lib/templates/login.html'
    })

    .state('chat', {
      //3. tell state to pass nickname param
      url: '/chat:nickname',
      templateUrl: 'lib/templates/chat.html'
    });

    $urlRouterProvider.otherwise('/login');
})
//|||||||||||||||||||||||||||||||||||
//|||||| SOCKET iO FACTORY  /service| 
//|for connecting and sending msgs to the server|
.factory('Socket', function (socketFactory) {
  var myIoSocket = io.connect('http://localhost:3000');

  Socket = socketFactory({
    ioSocket: myIoSocket
  });

  return Socket;
})
//||||||||||||||||||||||||||||||||||||||||||||||
//||      DIRECTIVE ng-enter || 
//||||||||||||||||||||||||||||||||||||||||||||||
.directive('ngEnter', function() {//html ng-enter tag
  //takes 3 params:keypress event, check that keypress has keycode of 13(enter)
  return function(scope, element, attrs) {
    element.bind("keywoard keypress", function(event) {
      if(event.which === 13) //enter
      {
     //ONLY if enter is press run code:  run the apply function 
        scope.$apply(function()
        {
          //evaluate the attrinute which is myFunction
          scope.$eval(attrs.ngEnter);

        });
        event.preventDefault();
      }
    });
  }
})
//|||||||||||||||||||||||||||||||||||||||||||||||
//||||| LOGIN CONTROLLER|||||||||||||||||||||||||
//|||||||||||||||||||||||||||||||||||||||||||||||
.controller('LoginController', function($scope, $state){
  //join method to take the 'nicknae'
  $scope.join = function(nickname){
    if(nickname)
   {               
                //state parameters
                   //1. from chat.html {{nickname}} JSON object
    $state.go('chat', {nickname: nickname});
                  //object name:value
  }
 } 
})
//|||||||||||||||||||||||||||||||||||||
//||||| CHAT CONTROLLER|||||||||||||||||||||||||
//|||||||||||||||||||||||||||||||||||||4. inject stateParams// inject mySocket dependency
.controller('ChatController', function($scope, $timeout, $stateParams, Socket, $ionicScrollDelegate, $sce, $cordovaMedia){
  $scope.status_message = "Welcome to Abel's Chat!"
  $scope.messages = [];//messages array
  $scope.nickname = $stateParams.nickname;
//
var colors = ['#6CDE4D', '#CE9026', '#CE30E7', '#5E9FFE', '#38D4C8', '#D43FBF'];



  //b. data to sender            
      //we are sending JSON obj data w/2 keys (who send it and what the msg is! )
  Socket.on("connect", function() {
      $scope.socketId = this.id;
          var data = {
            // var data = {message: "User has joined", sender: $scope.nickname};
                      message: $scope.nickname + " has joined!", 
                      sender: $scope.nickname,  //ad key: and we can use scope.nickname 
                      socketId: $scope.socketId, 
                      isLog: true,
                      color: $scope.getUsernameColor($scope.nickname)

                       };     

      //a. send events to server
      Socket.emit("Message", data);
//UNIQUE IDs//create scope var socketId and send along with message Line 100
      // $scope.socketId = this.id;
  });
    //f. tell socket clien to listen for server!
    Socket.on("Message", function(data){

      data.message = gimmeEmojis(data.message);
      data.message = $sce.trustAsHtml(data.message);
      //
      $scope.messages.push(data);

      if($scope.socketId == data.socketId)
        playAudio("audio/outgoing.mp3");
      else
        playAudio("audio/incoming.mp3");
      //
      $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(true);
      // console.log(data.message);
    })

    var typing = false;
    var TYPING_TIMER_LENGTH = 2000;

    $scope.updateTyping = function(){
      if(!typing){
        typing = true;
        Socket.emit("typing", {socketId: $scope.socketId, sender: $scope.nickname});
      }

      lastTypingTime = (new Date()).getTime();

      $timeout(function(){
        var timeDiff = (new Date()).getTime() - lastTypingTime;

        if(timeDiff >= TYPING_TIMER_LENGTH && typing){
          Socket.emit('stop typing', {socketId: $scope.socketId, sender: $scope.nickname});
          typing = false;
        }
      }, TYPING_TIMER_LENGTH)
    }

    Socket.on('stop typing', function(data){
      $scope.status_message = "Welcome to Abel's chat app";
    })

    Socket.on('typing', function(data){
      $scope.status_message = data.sender + " is typing...";
    })

    //sound function and url "src" is the parameter
    var playAudio = function(src)
    {
      if(ionic.Platform.isAndroid() || ionic.Platform.isIOS())
      {
        var newUrl = '';
        if(ionic.Platform.isAndroid()){
          newUrl = "/android_asset/www/audio/incoming.mp3" + src;
        }
        else
          newUrl = src;

        var media = new Media(newUrl, null, null, null);
        media.play();
      }
      else
      {
        new Audio(src).play();
      }
    }

  //2.passed from our loginController
  //scope variable obj name and value 
  // $scope.nickname = $stateParams.nickname;
  /////////////////////////////////////////////
  ///CREATING sendMessage button method/function
  //|||||||||||||||||||||||||||||||||||||||||||||||
    $scope.sendMessage = function() {
      //don't send empty messages.
      if($scope.message.length == 0)
        return;
    //message we will send = message info the sender and the text(body)  
      var newMessage = {sender:'', message:'', socketId:'', isLog:false, color: '' };//ID being sent w/msg

    //populare fields of the variable//user name (value for our sender field)
      newMessage.sender = $scope.nickname
//the actual message// give us access to value of input text box ng-model message in chat.html
      newMessage.message = $scope.message
//sending  ID with msg, check if msg is the same as the socketId from scope/item-avatar-right       
      newMessage.socketId = $scope.socketId;
  //    
      newMessage.isLog = false;
      newMessage.color = $scope.getUsernameColor($scope.nickname);

 //make call to a socket emit method - emit event, Message .send newMessage object. 
      Socket.emit("Message", newMessage); 

      $scope.message = '';    
    }

var gimmeEmojis = function(message)

    { //(y)
      message = message.replace(/;\)/g, "<img src='img/emoticons/1_27.png' width='20px' height='20px' />");
      message = message.replace(/\(y\)/g, "<img src='img/emoticons/1_01.png' width='20px' height='20px' />");
      message = message.replace(/O:\)/g, "<img src='img/emoticons/1_02.png' width='20px' height='20px' />");
      message = message.replace(/:3/g, "<img src='img/emoticons/1_03.png' width='20px' height='20px' />");
      message = message.replace(/o.O/g, "<img src='img/emoticons/1_04.png' width='20px' height='20px' />");
      message = message.replace(/O.o/g, "<img src='img/emoticons/1_05.png' width='20px' height='20px' />");
      message = message.replace(/:\'\(/g, "<img src='img/emoticons/1_06.png' width='20px' height='20px' />");
      message = message.replace(/3:\)/g, "<img src='img/emoticons/1_07.png' width='20px' height='20px' />");
      message = message.replace(/:\(/g, "<img src='img/emoticons/1_08.png' width='20px' height='20px' />");
      message = message.replace(/:O/g, "<img src='img/emoticons/1_09.png' width='20px' height='20px' />");
      message = message.replace(/8-\)/g, "<img src='img/emoticons/1_10.png' width='20px' height='20px' />");
      message = message.replace(/:D/g, "<img src='img/emoticons/1_11.png' width='20px' height='20px' />");
      message = message.replace(/>:\(/g, "<img src='img/emoticons/1_22.png' width='20px' height='20px' />");
      message = message.replace(/\<3/g, "<img src='img/emoticons/1_13.png' width='20px' height='20px' />");
      message = message.replace(/\^_\^/g, "<img src='img/emoticons/1_14.png' width='20px' height='20px' />");
      message = message.replace(/\:\*/g, "<img src='img/emoticons/1_15.png' width='20px' height='20px' />");
      message = message.replace(/\:v/g, "<img src='img/emoticons/1_16.png' width='20px' height='20px' />");
      message = message.replace(/\<\(\"\)/g, "<img src='img/emoticons/1_17.png' width='20px' height='20px' />");
      message = message.replace(/\:poop\:/g, "<img src='img/emoticons/1_18.png' width='20px' height='20px' />");
      message = message.replace(/\:putnam\:/g, "<img src='img/emoticons/1_19.png' width='20px' height='20px' />");
      message = message.replace(/\(\^\^\^\)/g, "<img src='img/emoticons/1_20.png' width='20px' height='20px' />");
      message = message.replace(/\:\)/g, "<img src='img/emoticons/1_21.png' width='20px' height='20px' />");
      message = message.replace(/\-\_\-/g, "<img src='img/emoticons/1_22.png' width='20px' height='20px' />");
      message = message.replace(/8\|/g, "<img src='img/emoticons/1_23.png' width='20px' height='20px' />");
      message = message.replace(/\:P/g, "<img src='img/emoticons/1_24.png' width='20px' height='20px' />");
      message = message.replace(/\:\//g, "<img src='img/emoticons/1_25.png' width='20px' height='20px' />");
      message = message.replace(/\>\:O/g, "<img src='img/emoticons/1_26.png' width='20px' height='20px' />");
      message = message.replace(/\:\|\]/g, "<img src='img/emoticons/1_28.png' width='20px' height='20px' />");
      
      return message;
    }

    // user colors function
    $scope.getUsernameColor = function(username){
      var hash = 7; 

      //
      for(var i=0; i<username.length;i++)
      {
        hash = username.charCodeAt(i)+ (hash<<5) - hash;

      }
                                //never exceed the length of colors []//
      var index = Math.abs(hash % colors.length)
      //
      return colors[index];
    }

})




