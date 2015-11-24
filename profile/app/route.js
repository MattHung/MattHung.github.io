/**
 * Created by matt_hung on 2015/8/17.
 */
app_module.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/sites/main_publish/', {
                templateUrl:function($routeParams) {
                    return sprintf("feature/main/main.html");
                }               
            }).
            when('/sites/:url/', {
                templateUrl:function($routeParams) {
                    return sprintf("feature/%s/%s.html", $routeParams.url, $routeParams.url);
                },
                controller:function($routeParams) {
                    return sprintf("controller_%s", $routeParams.url);
                }
            }).
            when('/sites/:url/:subUrl', {
                templateUrl:function($routeParams) {
                    return sprintf("feature/%s/%s.html", $routeParams.url, $routeParams.subUrl);
                },
                controller:function($routeParams) {
                    return sprintf("feature/%s/%s", $routeParams.url, $routeParams.subUrl);
                }
            }).
            otherwise( {
                redirectTo: '/sites/main'
            } );
    }]
);
