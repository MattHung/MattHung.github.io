/**
 * Created by matt_hung on 2015/10/17.
 */

var module_main=angular.module("module_main", []);
module_main.controller("controller_main", function($scope){});

var module_about=angular.module("module_about", []);
var module_portfolio=angular.module("module_portfolio", []);
var module_contact=angular.module("module_contact", []);

//var module_about=angular.module("module_about", ['dymaicmodule']);
//module_about.config(['$controllerProvider', '$compileProvider', '$provide', 'dynamicDirectiveManagerProvider',
//    function($controllerProvider, $compileProvider, $provide, dynamicDirectiveManagerProvider) {
//        module_about.registerCtrl = $controllerProvider.register;
//        module_about.compileProvider = $compileProvider;
//        module_about.provide=$provide;
//        dynamicDirectiveManagerProvider.setCompileProvider($compileProvider);
//    }])
//    .run(function (dynamicDirectiveManager) {
//            module_about.dynamicDirectiveManager = dynamicDirectiveManager;
//    });
//
//var module_portfolio=angular.module("module_portfolio", ['dymaicmodule']);
//module_portfolio.config(['$controllerProvider', '$compileProvider', '$provide', 'dynamicDirectiveManagerProvider',
//    function($controllerProvider, $compileProvider, $provide, dynamicDirectiveManagerProvider) {
//        module_portfolio.registerCtrl = $controllerProvider.register;
//        module_portfolio.compileProvider = $compileProvider;
//        module_portfolio.provide=$provide;
//        dynamicDirectiveManagerProvider.setCompileProvider($compileProvider);
//    }])
//    .run(function (dynamicDirectiveManager) {
//        module_portfolio.dynamicDirectiveManager = dynamicDirectiveManager;
//    });
//
//var module_contact=angular.module("module_contact", ['dymaicmodule']);
//module_contact.config(['$controllerProvider', '$compileProvider', '$provide', 'dynamicDirectiveManagerProvider',
//    function($controllerProvider, $compileProvider, $provide, dynamicDirectiveManagerProvider) {
//        module_contact.registerCtrl = $controllerProvider.register;
//        module_contact.compileProvider = $compileProvider;
//        module_contact.provide=$provide;
//        dynamicDirectiveManagerProvider.setCompileProvider($compileProvider);
//    }])
//    .run(function (dynamicDirectiveManager) {
//        module_contact.dynamicDirectiveManager = dynamicDirectiveManager;
//    });


//module_contact.controller("controller_contact", function($scope){});

var app_module=angular.module("app_module", ["ngRoute", "module_main", "module_about", "module_portfolio", "module_contact"]);
app_module.controller("controller_app", function($scope){});
