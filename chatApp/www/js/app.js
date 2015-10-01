// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','btford.socket-io'])

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
.controller('ChatController', function($scope, $stateParams, Socket){
  $scope.messages = [];//messages array
  $scope.nickname = $stateParams.nickname;
  //b. data to sender             //ad key: and we can juse scope.nickname 
      //we are sending JSON obj data w/2 keys (who send it and what the msg is! )
  // var data = {message: "User has joined", sender: $scope.nickname};
  Socket.on("connect", function() {
      $scope.socketId = this.id;
          var data = {
                      message: $scope.nickname + " has joined!", 
                      sender: $scope.nickname, 
                      socketId: $scope.socketId, 
                      isLog: true

                       };     

      //a. send events to server
      Socket.emit("Message", data);
//UNIQUE IDs//create scope var socketId and send along with message Line 100
      // $scope.socketId = this.id;
  });
    //f. tell socket clien to listen for server!
    Socket.on("Message", function(data){
      //
      $scope.messages.push(data);
      // console.log(data.message);
    })

  //2.passed from our loginController
  //scope variable obj name and value 
  // $scope.nickname = $stateParams.nickname;
  /////////////////////////////////////////////
  ///CREATING sendMessage button method/function
  //|||||||||||||||||||||||||||||||||||||||||||||||
    $scope.sendMessage = function() {
    //message we will send = message info the sender and the text(body)  
      var newMessage = {sender:'', message:'', socketId:'', isLog:false};//ID being sent w/msg

    //populare fields of the variable//user name (value for our sender field)
      newMessage.sender = $scope.nickname
//the actual message// give us access to value of input text box ng-model message in chat.html
      newMessage.message = $scope.message
//sending  ID with msg, check if msg is the same as the socketId from scope/item-avatar-right       
      newMessage.socketId = $scope.socketId;
  //    
      newMessage.isLog = false;

 //make call to a socket emit method - emit event, Message .send newMessage object. 
      Socket.emit("Message", newMessage); 

      $scope.message = '';    
    }

})




