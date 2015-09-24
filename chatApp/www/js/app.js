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

.factory('mySocket', function (socketFactory) {
  var myIoSocket = io.connect('//');

  mySocket = socketFactory({
    ioSocket: myIoSocket
  });

  return mySocket;
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
//||||||||||||||||||||||||||||||||||||||||||4. inject stateParams
.controller('ChatController', function($scope, $stateParams){
  //2.passed from our loginController
  //scope variable obj name and value 
  $scope.nickname = $stateParams.nickname;


})




