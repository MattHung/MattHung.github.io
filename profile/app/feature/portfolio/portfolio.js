/**
 * Created by matt_hung on 2015/11/20.
 */

var EventDirection={
    Left:0,
    Right:1
};

var video_width = 320;
var video_height = 160;

module_portfolio.registerCtrl("controller_portfolio", ['$scope', 'dynamicDirectiveManager', '$sce', '$timeout',
    function($scope, dynamicDirectiveManager, $sce, timer) {
        $scope.DisplayHtml="";


        $scope.InjectPlayer=function(html_id)
        {
            $(sprintf('#%s', html_id)).mediaelementplayer();
        };

        $scope.CreateEvent = function(direction, iconBackbround, icon, timeline_heading, timeline_body, html_id, youtube_link)
        {
            var output =sprintf('<div class="%s"><i class="%s"></i></div>', iconBackbround, icon);
            output += '     <div class="timeline-panel">';
            output += '         <div class="timeline-heading">';
            output += timeline_heading;
            output += '         </div>';

            output += '         <div class="timeline-body">';
            output += timeline_body;

            if(html_id!=undefined) {
                //output += sprintf('<video width="640" height="320" id=%s preload="none">', html_id);
                output += sprintf('<video width="%d" height="%d" id=%s preload="none">', video_width, video_height, html_id);
                //output += sprintf('<video id=%s preload="none">', html_id);
                output += sprintf('   <source type="video/youtube" src=%s />', youtube_link);
                output += '</video >';
            }

            output += '         </div>';
            output += '     </div>';
            output += '</div>';

            switch (direction)
            {
                case EventDirection.Left:
                    output ='<li>' + output + '</li>';
                    break;
                case EventDirection.Right:
                    output ='<li class="timeline-inverted">' + output + '</li>';
                    break;
                default :
                    break;
            }

            output ='<ul class="timeline">' + output + '</li>';

            $scope.DisplayHtml += output;
            $scope.DisplayHtml =$sce.trustAsHtml($scope.DisplayHtml);

            if(html_id!=undefined)
                timer($scope.InjectPlayer, 0, true, html_id);
        };

        $scope.Show = function()
        {
            $scope.DisplayHtml="";

            $scope.CreateEvent(EventDirection.Right, 'timeline-badge warning', 'glyphicon glyphicon-hand-right',
                '<h4 class="timeline-title">BBIN project </h4>',
                '<h3>Texas Holdem Poker Mobile</h3>' +
                '<p>Technologies : Unity 3D, C# </p>' +
                '<p><small class="text-muted"><i class="glyphicon glyphicon-time"></i> October 2015</small></p>' +
                '<p>This mobile version is base previous web version, added some casual elements, like daily missions and  poker competitions.</p>' +
                '<p>I played a role of lead programmer in this project, in charge of key game logic implemented, cash flow(in-Game Purchases) and system analysis.</p>' +
                '<p>following is the file link on Google Play</p>' +
                '<a href="https://play.google.com/store/apps/details?id=com.bbin.bbPoker">bbPoker</a>'
            );

            $scope.CreateEvent(EventDirection.Left, 'timeline-badge info', 'glyphicon glyphicon-hand-left',
                '<h4 class="timeline-title">BBIN project </h4>',
                '<h3>Anger Anirspace</h3>' +
                '<p>Technologies : Unity 3D, C# </p>' +
                '<p><small class="text-muted"><i class="glyphicon glyphicon-time"></i> October 2014</small></p>' +
                '<p>Anger Airspace is multiplayer shooting game , I played a role of consultant in this project,</p>' +
                '<p>this game is running  on my socket server engine.</p>' +
                '<p>following is a video on youtube</p>',
                "2",
                "https://www.youtube.com/watch?v=8rwKMwRw24I"
            );

            $scope.CreateEvent(EventDirection.Right, 'timeline-badge warning', 'glyphicon glyphicon-hand-right',
                '<h4 class="timeline-title">BBIN project </h4>',
                '<h3>Socket Server Engine & Game Framework, & Web Backend Console</h3>' +
                '<p>Technologies : Unity 3D, C#, C++, Php, AngularJS </p>' +
                '<p><small class="text-muted"><i class="glyphicon glyphicon-time"></i>August 2014</small></p>' +
                '<p>The socket server engine is implemented for instead previous socket server engine</p>' +
                '<p>Its a high performance, and highly encapsulated game framework too </p>' +
                '<p>This includes client framework, server framework, and database agent for developer use, allowing developers to focus on game logic design.</p>' +
                '<p>following link is web backend console and tutorial. Feel free to register a random account and explore it.</p>' +
                '<a href="http://www.matthung.esy.es/AdminConsole/app"">Admin Console</a>'
            );


            $scope.CreateEvent(EventDirection.Left, 'timeline-badge danger', 'glyphicon glyphicon-eye-open',
                '<h4 class="timeline-title">BBIN project </h4>',
                '<h3>Database Backend Agent</h3>' +
                '<p>Technologies : C# </p>' +
                '<p><small class="text-muted"><i class="glyphicon glyphicon-time"></i>May 2014  ~ August 2013</small></p>' +
                '<p>In this period of time, I played a role of database programmer, this include:</p>' +
                '<p>A database server for game server access(specifically for player login flow, player data access and game data access</p>' +
                '<p>&nbsp&nbsp Implemented memcache in order to archive high-performance data access.</p>' +
                '<p>A high-performance log server to log player interactions for easy debugging and data retrieval</p>' +
                '<p>following games are developed on this Database Backend Agent.</p>' +

                '</br>' +
                '<h4>Duo Bao </h4>' +
                sprintf('<video  width="%d" height="%d" id=4_1 preload="none">', video_width, video_height) +
                '   <source type="video/youtube" src="https://www.youtube.com/watch?v=6H6Z-dfS09Q" />' +
                '</video >' +

                '</br>' +
                '<h4>Sex And Zen </h4>' +
                sprintf('<video  width="%d" height="%d" id=4_2 preload="none">', video_width, video_height) +
                '   <source type="video/youtube" src="https://www.youtube.com/watch?v=j1uWev5w-Vg" />' +
                '</video >' +

                '</br>' +
                '<h4>King of Cookery </h4>' +
                sprintf('<video  width="%d" height="%d" id=4_3 preload="none">', video_width, video_height) +
                '   <source type="video/youtube" src="https://www.youtube.com/watch?v=VfoqN_6O7cQ" />' +
                '</video >' +

                '</br>' +
                '<h4>Starship 27 </h4>' +
                sprintf('<video  width="%d" height="%d" id=4_4 preload="none">', video_width, video_height) +
                '   <source type="video/youtube" src="https://www.youtube.com/watch?v=ycspnAPvWfY" />' +
                '</video >' +

                '</br>' +
                '<h4>Indulge 243 </h4>' +
                sprintf('<video  width="%d" height="%d" id=4_5 preload="none">', video_width, video_height) +
                '   <source type="video/youtube" src="https://www.youtube.com/watch?v=j225Z77KB_A" />' +
                '</video >'

            );

            timer($scope.InjectPlayer, 0, true, '4_1');
            timer($scope.InjectPlayer, 0, true, '4_2');
            timer($scope.InjectPlayer, 0, true, '4_3');
            timer($scope.InjectPlayer, 0, true, '4_4');
            timer($scope.InjectPlayer, 0, true, '4_5');


            $scope.CreateEvent(EventDirection.Right, 'timeline-badge default', 'glyphicon glyphicon-hand-right',
                '<h4 class="timeline-title">BBIN project </h4>',
                '<h3>Texas Holdem Poker Web</h3>' +
                '<p>Technologies : C#, Flash AS3 </p>' +
                '<p><small class="text-muted"><i class="glyphicon glyphicon-time"></i> July 2013</small></p>' +
                '<p>Texas Holdem Poker is a well-known and popular game is the world</p>' +
                '<p>I played a role of lead programmer in this project, in charge of whole game login implemented on server.</p>' +
                '<p>and some key function on Flash client.</p>'
            );

            $scope.CreateEvent(EventDirection.Left, 'timeline-badge info', 'glyphicon glyphicon-hand-left',
                '<h4 class="timeline-title">Chinesegamer  project </h4>',
                '<h3>Atlantis</h3>' +
                '<a href="http://at.chinesegamer.net/">http://at.chinesegamer.net/</a>' +
                '<p>Technologies : Unity 3D, C# </p>' +
                '<p><small class="text-muted"><i class="glyphicon glyphicon-time"></i> December 2012</small></p>' +
                '<p>Atlantis is a online MMO RPG game , I am in charge of debugging memory issues and performance tuning.</p>' +
                '<p>following is a video on youtube</p>',
                "6",
                "https://www.youtube.com/watch?v=WYB_mB_7Akw&list=PLWtF_vHNbmcjwz5IjRIHjzaatPEhy_L0k"
            );

            $scope.CreateEvent(EventDirection.Right, 'timeline-badge info', 'glyphicon glyphicon-hand-right',
                '<h4 class="timeline-title">Chinesegamer  project </h4>',
                '<h3>TS3 Online</h3>' +
                '<a href="http://ts3.chinesegamer.net/">http://ts3.chinesegamer.net/</a>' +
                '<p>Technologies : Delphi </p>' +
                '<p><small class="text-muted"><i class="glyphicon glyphicon-time"></i> March 2012</small></p>' +
                '<p>TS3 is a online MMO RPG game, Its a large project and a highly popular game, </p>' +
                '<p>it ever be ranked number one in game forum(<a href="http://www.gamer.com.tw/">http://www.gamer.com.tw/</a>) </p>' +
                '<p>I am in charge of the entire system on server side, this includes game battle and  game activity.  </p>' +
                '<p>following is a video on youtube</p>',
                "7",
                "https://www.youtube.com/watch?v=zaIAt0WDPe8"
            );

            $scope.CreateEvent(EventDirection.Left, 'timeline-badge info', 'glyphicon glyphicon-hand-left',
                '<h4 class="timeline-title">Chinesegamer  project </h4>',
                '<h3>Diamond Club</h3>' +
                '<a href="http://dc.chinesegamer.net/">http://dc.chinesegamer.net/</a>' +
                '<p>Technologies : Delphi </p>' +
                '<p><small class="text-muted"><i class="glyphicon glyphicon-time"></i> May 2011</small></p>' +
                '<p>Diamond Club is a online gambling game, this include slot games, Texas Holdem Poker and Chinese Mahjong. </p>' +
                '<p>I am in charge of Texas Holdem Poker and Chinese Mahjong.  </p>' +
                '<p>following is a video on youtube</p>' +

                '</br>' +
                '<h4>Texas Holdem Poker </h4>' +
                sprintf('<video  width="%d" height="%d" id=7_1 preload="none">', video_width, video_height) +
                '   <source type="video/youtube" src="https://www.youtube.com/watch?v=7J0t-clvch8" />' +
                '</video >' +

                '</br>' +
                '<h4>Chinese Mahjong </h4>' +
                sprintf('<video  width="%d" height="%d" id=7_2 preload="none">', video_width, video_height) +
                '   <source type="video/youtube" src="https://www.youtube.com/watch?v=D-EZ-rbpCrs" />' +
                '</video >'
            );

            timer($scope.InjectPlayer, 0, true, '7_1');
            timer($scope.InjectPlayer, 0, true, '7_2');
        };

        $scope.Show();
    }
]);