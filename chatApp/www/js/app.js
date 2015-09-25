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
//|||||||||||||||||||||||||||||||||||
.factory('Socket', function (socketFactory) {
  var myIoSocket = io.connect('http://localhost:3000');

  Socket = socketFactory({
    ioSocket: myIoSocket
  });

  return Socket;
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
//||||||||||||||||||||||||||||||||||||||||||||||
//||||| CHAT CONTROLLER|||||||||||||||||||||||||
//|||||||||||||||||||||||||||||||||||||4. inject stateParams// inject mySocket dependency
.controller('ChatController', function($scope, $stateParams, Socket){
  $scope.messages = [];
  $scope.nickname = $stateParams.nickname;  
  //b. data to sender             //ad key: and we can juse scope.nickname 
      //we are sending JSON obj data w/2 keys (who send it and what the msg is! )
  var data = {message: "User has joined", sender: $scope.nickname};
  Socket.on("connect", function() {
      //a. send events to server
      Socket.emit("Message", data);
  })
    //f. tell socket clien to listen for server!
    Socket.on("Message", function(data){
      //
      $scope.messages.push(data);
      // console.log(data.message);
    })

  //2.passed from our loginController
  //scope variable obj name and value 
  // $scope.nickname = $stateParams.nickname;

})




