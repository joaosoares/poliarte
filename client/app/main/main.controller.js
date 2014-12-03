'use strict';

angular.module('poliarte2App')
  .controller('MainCtrl', function ($scope, $http, orderByFilter, filterFilter, youtubeEmbedUtils, Link) {
    $scope.ready = false;
    $scope.posts = [];
    $scope.links = [];
    $scope.loading = {
      expected: 1,
      current: 0
    }

    function detectYoutubeLinks (text) {
      if (text === undefined) {return [];}

      var urlRegex = /(https?:\/\/www.[youtube|yt][^\s]+)/g;
      var result = text.match(urlRegex);

      if (result === null) {return [];}
      return result;
    }


    $http.get('https://graph.facebook.com/651222474998297/feed', {
      params: {
        limit: '300',
        access_token: '338662922988404|nrH3l_FYF5X9ecY9LaPJfls36Po'
      }
    }).success(function(posts) {
      $scope.posts = posts;
      console.log(posts);


      for(var i = 0; i < posts.data.length; i++) {
        var post = posts.data[i];
        var postLinks = detectYoutubeLinks(post.message);

        for(var j = 0; j < postLinks.length; j++) {
          var link = new Link(post, postLinks[j]);
          if(link) {
            $scope.links.push(link);
            console.log(link);
          }
        }
      }
      $scope.video.current = $scope.sortedLinks()[0];
      $scope.video.current.active = true;
      $scope.ready = true;
    }).error(function (err) {
      console.log(err);
    });

    // $scope.links = [
    //   {
    //     url: 'https://www.youtube.com/watch?v=ZWZEzvn13CE',
    //     author: 'João Soares',
    //     title: 'Um video do youtube',
    //     created_time: '2014-11-24T03:44:16+0000',
    //     likes: 13,
    //     active: false
    //   },
    //   {
    //     url: 'https://www.youtube.com/watch?v=3wFwYBPvYu8',
    //     author: 'Juliana',
    //     title: 'Shakira parody',
    //     created_time: '2014-11-21T03:44:16+0000',
    //     likes: 20,
    //     active: false
    //   },
    //   {
    //     url: 'https://www.youtube.com/watch?v=j5-yKhDd64s',
    //     author: 'Eminem',
    //     title: 'Eminem - Not Afraid',
    //     created_time: '2010-06-04T00:00:00+0000',
    //     likes: 30,
    //     active: false
    //   },
    //   {
    //     url: 'https://www.youtube.com/watch?v=A3ytTKZf344',
    //     author: 'Barely Political',
    //     title: 'Reggae Shark - Key of Awesome #89 (Animated)',
    //     created_time: '2014-08-22T00:00:00+0000',
    //     likes: 8,
    //     active: false
    //   },
    // ];

    // ORDERING AND SORTING
    $scope.trendingSort = function (link) {
      var points = link.likes;
      var currentTime = new Date();
      var createdTime = new Date(link.created_time);
      var msecDiff = currentTime - createdTime;
      var hourDiff = msecDif/1000/60/60;

      return point / (Math.pow(hourDiff, 1.8));
    };

    $scope.sortOptions = [
      { label: 'populares', value: $scope.trendingSort},
      { label: 'recentes', value: '-created_time'},
      { label: 'topo', value: '-likes'}
    ];

    $scope.selectSource = function (sortOption) {
      $scope.sortOrder = sortOption.value;
    }

    $scope.sortOrder = $scope.sortOptions[1];

    $scope.sortedLinks = function() {
      return filterFilter(orderByFilter($scope.links, $scope.sortOrder.value), $scope.filterCategory, function(link, category) {
        return (link.category === category);
      });
    }

    // DISPLAY ELEMENTS
    $scope.likesPlural = {
      'one': '1 curtida',
      'other': '{} curtidas'
    }

    // VIDEO PLAYER
    $scope.video = {
      player: null,
      current: null,
      vars: {
        autoplay: 0
      },
      playing: false,
      autoplay: true
    };

    $scope.$on('youtube.player.ended', function ($event, player) {
      if ($scope.video.autoplay) {
        $scope.video.playing = true;
      }
      $scope.nextVideo($scope.video.current);
    });

    $scope.$on('youtube.player.playing', function($event, player) {
      $scope.video.playing = true;
    });

    $scope.$on('youtube.player.paused', function($event, player) {
      $scope.video.playing = false;
    });

    $scope.$on('youtube.player.ready', function($event, player) {
      if ($scope.video.playing ) {
        $scope.video.player.playVideo();
      }
    });

    $scope.nextVideo = function(currentLink) {
      var links = filterFilter(orderByFilter($scope.links, $scope.sortOrder.value), $scope.filterCategory, function(link, category) {
        return (link.category === category);
      });;
      var curIndex = links.indexOf(currentLink);
      var nextIndex = curIndex + 1;
      var nextLink = links[nextIndex]
      if (links.indexOf(nextLink) != -1) {
        $scope.changeVideo(nextLink);
      }
    }

    $scope.previousVideo = function(currentLink) {
      var links = filterFilter(orderByFilter($scope.links, $scope.sortOrder.value), $scope.filterCategory, function(link, category) {
        return (link.category === category);
      });;
      var curIndex = links.indexOf(currentLink);
      var prevIndex = curIndex - 1;

      var prevLink = links[prevIndex]
      if (links.indexOf(prevLink) != -1) {
        $scope.changeVideo(prevLink);
      }
    }

    $scope.pauseVideo = function() {
      $scope.video.player.pauseVideo();
    };

    $scope.playVideo = function() {
      $scope.video.player.playVideo();
    };

    $scope.changeVideo = function(videoLink) {
      $scope.video.current.active = false;
      $scope.video.current = videoLink;
      $scope.video.current.active = true;
    };
  });
